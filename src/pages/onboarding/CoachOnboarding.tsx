import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Crown, Zap, Sparkles, Star, Users, Dumbbell, Brain, TrendingUp, MessageSquare, Infinity, Headphones, Cog } from "lucide-react";
import { openExternalUrl, shouldOpenExternally } from "@/lib/external-links";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { toast } from "sonner";
import { ProfileImageUpload } from "@/components/shared/ProfileImageUpload";
import { LocationAutocomplete } from "@/components/shared/LocationAutocomplete";
import StripeConnectOnboardingStep from "@/components/onboarding/StripeConnectOnboardingStep";
import IntegrationsOnboardingStep, { useIntegrationsState } from "@/components/onboarding/IntegrationsOnboardingStep";
import DualAccountStep from "@/components/onboarding/DualAccountStep";
import VerificationOnboardingStep from "@/components/onboarding/VerificationOnboardingStep";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { COACH_TYPES, COACH_TYPE_CATEGORIES, getCoachTypesByCategory } from "@/constants/coachTypes";
import { SUBSCRIPTION_TIERS, TierKey } from "@/lib/stripe-config";
import { useTranslation } from "react-i18next";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { useNativeIAP, SubscriptionTier, BillingInterval } from "@/hooks/useNativeIAP";
import { useNativePricing } from "@/hooks/useNativePricing";
import { triggerConfetti, confettiPresets } from "@/lib/confetti";
import { triggerHaptic } from "@/lib/despia";
import { IAPUnsuccessfulDialog } from "@/components/iap/IAPUnsuccessfulDialog";
import { FeaturesActivatedModal } from "@/components/subscription/FeaturesActivatedModal";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { STORAGE_KEYS } from "@/lib/storage-keys";

// Full steps array (for new users without client profile)
const FULL_STEPS = [
  "Basic Info",
  "Specialties",
  "Services & Pricing",
  "Availability",
  "Connect Payments",
  "Integrations",
  "Dual Account",
  "Verification",
  "Choose Your Plan"
];

// Steps without Dual Account (for users who already have a client profile)
const STEPS_WITHOUT_DUAL = [
  "Basic Info",
  "Specialties",
  "Services & Pricing",
  "Availability",
  "Connect Payments",
  "Integrations",
  "Verification",
  "Choose Your Plan"
];

// Get steps based on whether user has existing client profile
const getSteps = (hasClientProfile: boolean) => hasClientProfile ? STEPS_WITHOUT_DUAL : FULL_STEPS;

// Map tier icons for display
const TIER_ICONS: Record<TierKey, typeof Sparkles> = {
  free: Sparkles,
  starter: Zap,
  pro: Star,
  enterprise: Crown,
  founder: Crown,
};

// Get displayable tiers (exclude admin-only tiers AND free tier for paywall)
const getDisplayableTiers = (excludeFree = false) => {
  return (Object.entries(SUBSCRIPTION_TIERS) as [TierKey, typeof SUBSCRIPTION_TIERS.free][])
    .filter(([key, config]) => {
      if (config.adminOnly) return false;
      if (excludeFree && key === 'free') return false;
      return true;
    })
    .map(([key, config]) => ({
      id: key,
      name: config.name,
      price: `£${config.prices.monthly.amount}`,
      description: config.description,
      features: config.features,
      icon: TIER_ICONS[key],
      popular: config.highlighted,
      clientLimit: config.clientLimit,
    }));
};

// Import canonical location type
import type { PlaceLocationData } from '@/types/location';
type LocationData = PlaceLocationData;

const CoachOnboarding = () => {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [hasSelectedPlan, setHasSelectedPlan] = useState(false);
  const [hasExistingClientProfile, setHasExistingClientProfile] = useState(false);
  const { user } = useAuth();
  const { refreshProfiles } = useAdminView();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isNativeMobile } = usePlatformRestrictions();
  const nativePricing = useNativePricing();
  
  // Dynamic steps array - excludes Dual Account step for users with existing client profile
  const STEPS = getSteps(hasExistingClientProfile);
  
  // Helper to find step index by name (makes code more readable and maintainable)
  const getStepIndex = (stepName: string) => STEPS.indexOf(stepName);
  
  // Store formData in a ref for the callback to access latest values
  const formDataRef = useRef<{ alsoClient: boolean }>({ alsoClient: false });
  
  // Features activated modal state for onboarding
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [purchasedTier, setPurchasedTier] = useState<TierKey | null>(null);
  
  // Handle successful IAP purchase - show features modal FIRST, then navigate
  const handleIAPSuccess = useCallback(async (tier: SubscriptionTier) => {
    console.log('[CoachOnboarding] IAP Success callback fired:', tier);
    
    // Trigger confetti celebration FIRST (before any async work)
    triggerConfetti(confettiPresets.medium);
    triggerHaptic('success');
    
    // Clear stale caches BEFORE any queries
    localStorage.removeItem(STORAGE_KEYS.CACHED_TIER);
    localStorage.setItem(STORAGE_KEYS.COACH_ONBOARDED, 'true');
    
    // Invalidate and refetch critical queries (non-blocking)
    queryClient.invalidateQueries({ queryKey: ['coach-onboarding-status'] });
    queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
    queryClient.invalidateQueries({ queryKey: ['feature-access'] });
    queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
    
    // Non-blocking profile refresh - don't let errors block modal
    refreshProfiles().catch(e => console.warn('[CoachOnboarding] Profile refresh failed (non-critical):', e));
    
    // Show features activated modal FIRST - navigation happens when user closes it
    console.log('[CoachOnboarding] Showing FeaturesActivatedModal for tier:', tier);
    setPurchasedTier(tier as TierKey);
    setShowFeaturesModal(true);
  }, [refreshProfiles, queryClient]);
  
  // Handle closing the features modal - navigate to dashboard
  const handleFeaturesModalClose = useCallback(() => {
    setShowFeaturesModal(false);
    console.log('[CoachOnboarding] Features modal closed, navigating. alsoClient:', formDataRef.current.alsoClient);
    if (formDataRef.current.alsoClient) {
      navigate("/onboarding/client", { replace: true });
    } else {
      navigate("/dashboard/coach", { replace: true });
    }
  }, [navigate]);
  
  const { purchase: nativePurchase, state: iapState, dismissUnsuccessfulModal } = useNativeIAP({
    onPurchaseComplete: handleIAPSuccess,
  });

  // Step component state
  const [integrationsState, setIntegrationsState] = useState({ hasAnyConnection: false });
  const [dualAccountState, setDualAccountState] = useState({ selectedOption: null as 'both' | 'coach_only' | null, isCreating: false });
  const [verificationState, setVerificationState] = useState({ hasRequiredDocs: false, hasAnyDocs: false, isSubmitting: false });
  
  // Refs for step actions
  const dualAccountActionRef = useRef<(() => Promise<boolean>) | null>(null);
  const verificationSubmitRef = useRef<(() => Promise<void>) | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    bio: "",
    experienceYears: "",
    coachTypes: [] as string[],
    primaryCoachType: "" as string,
    hourlyRate: "",
    location: "",
    locationData: null as LocationData | null,
    onlineAvailable: true,
    inPersonAvailable: false,
    subscriptionTier: "free",
    profileImageUrl: null as string | null,
    alsoClient: false,
  });

  // Keep formDataRef in sync with formData.alsoClient for the IAP callback
  useEffect(() => {
    formDataRef.current.alsoClient = formData.alsoClient;
  }, [formData.alsoClient]);

  // Check if onboarding is already completed, restore saved step, check for existing client profile, and pre-populate names
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      // Check for coach profile, existing client profile, and user profile names in parallel
      const [coachResult, clientResult, userProfileResult] = await Promise.all([
        supabase
          .from("coach_profiles")
          .select("id, onboarding_completed, onboarding_progress")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_profiles")
          .select("id, username, first_name, last_name, display_name")
          .eq("user_id", user.id)
          .maybeSingle()
      ]);

      const { data } = coachResult;
      const hasClientProfile = !!clientResult.data;
      const userProfile = userProfileResult.data;
      
      // Set client profile status first (affects STEPS array)
      setHasExistingClientProfile(hasClientProfile);
      
      // If user already has client profile, pre-set alsoClient to true
      if (hasClientProfile) {
        setFormData(prev => ({ ...prev, alsoClient: true }));
        console.log("[CoachOnboarding] Existing client profile detected - skipping Dual Account step");
      }

      if (data?.onboarding_completed) {
        navigate("/dashboard/coach");
      } else {
        setCoachProfileId(data?.id || null);
        
        // Restore saved step from onboarding_progress
        // Use FULL_STEPS for validation since we need to handle both cases
        const progress = data?.onboarding_progress as { current_step?: number; form_data?: typeof formData } | null;
        if (progress?.current_step !== undefined && progress.current_step >= 0 && progress.current_step < FULL_STEPS.length) {
          // If user has client profile and saved step is beyond Dual Account (step 6),
          // we need to adjust the step index since Dual Account is now excluded
          let restoredStep = progress.current_step;
          if (hasClientProfile && restoredStep > 5) {
            // Steps 6+ shift down by 1 when Dual Account is excluded
            restoredStep = restoredStep - 1;
          }
          setCurrentStep(restoredStep);
        }
        
        // Restore saved form data if available, but prioritize user_profiles names
        if (progress?.form_data) {
          setFormData(prev => ({ 
            ...prev, 
            ...progress.form_data,
            // Override with user_profiles names if they exist (collected during signup)
            firstName: userProfile?.first_name || progress.form_data?.firstName || "",
            lastName: userProfile?.last_name || progress.form_data?.lastName || "",
            displayName: progress.form_data?.displayName || userProfile?.display_name || "",
          }));
        } else {
          // No saved progress - just use user_profiles names
          setFormData(prev => ({
            ...prev,
            firstName: userProfile?.first_name || "",
            lastName: userProfile?.last_name || "",
            displayName: userProfile?.display_name || "",
          }));
        }
        
        setIsCheckingProfile(false);
        
        // Check if returning from Stripe (overrides saved step)
        const stripeReturning = searchParams.get("stripe");
        if (stripeReturning === "returning") {
          setCurrentStep(4); // Go to Stripe step (Connect Payments is always step 4)
        }
      }
    };

    checkProfile();
  }, [user, navigate, searchParams]);

  // Save current step and form data whenever they change
  useEffect(() => {
    const saveProgress = async () => {
      // Guard: Don't save during navigation to prevent tight loops
      if (!coachProfileId || isCheckingProfile || isNavigating) return;
      
      // Serialize formData to JSON-compatible format
      const progressData = JSON.parse(JSON.stringify({
        current_step: currentStep,
        form_data: formData,
        last_updated: new Date().toISOString(),
      }));
      
      await supabase
        .from("coach_profiles")
        .update({
          onboarding_progress: progressData
        })
        .eq("id", coachProfileId);
    };
    
    // Debounce the save to avoid too many updates
    const timer = setTimeout(saveProgress, 500);
    return () => clearTimeout(timer);
  }, [currentStep, formData, coachProfileId, isCheckingProfile, isNavigating]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (location: string, data: LocationData | null) => {
    setFormData((prev) => ({ 
      ...prev, 
      location, 
      locationData: data 
    }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData((prev) => {
      const current = prev[field as keyof typeof formData] as string[];
      const isRemoving = current.includes(value);
      const updated = isRemoving
        ? current.filter((v) => v !== value)
        : [...current, value];
      
      // Handle primary specialty logic
      let newPrimary = prev.primaryCoachType;
      if (field === "coachTypes") {
        if (isRemoving && prev.primaryCoachType === value) {
          // If removing the primary, set first remaining as primary
          newPrimary = updated.length > 0 ? updated[0] : "";
        } else if (!isRemoving && updated.length === 1) {
          // If this is the first selection, make it primary
          newPrimary = value;
        }
      }
      
      return { ...prev, [field]: updated, primaryCoachType: newPrimary };
    });
  };

  const handleSetPrimary = (typeId: string) => {
    setFormData((prev) => ({ ...prev, primaryCoachType: typeId }));
  };

  const handleNext = useCallback(async () => {
    // Idempotency guard: prevent double-clicks and rapid navigation
    if (isNavigating) {
      console.log("[CoachOnboarding] handleNext blocked - already navigating");
      return;
    }
    
    const currentStepName = STEPS[currentStep];
    
    // Validate Basic Info step - require first name
    if (currentStepName === "Basic Info" && !formData.firstName.trim()) {
      toast.error("Please enter your first name");
      return;
    }
    
    // Validate specialties step - require at least one specialty
    if (currentStepName === "Specialties" && formData.coachTypes.length === 0) {
      toast.error("Please select at least one specialty");
      return;
    }

    // Validate availability step - require location for ALL coaches
    if (currentStepName === "Availability") {
      if (!formData.locationData) {
        toast.error("Please select a location so clients can find you");
        return;
      }
      if (!formData.onlineAvailable && !formData.inPersonAvailable) {
        toast.error("Please enable at least one session type (online or in-person)");
        return;
      }
    }

    // Set navigating flag BEFORE any async work
    setIsNavigating(true);
    console.log("[CoachOnboarding] handleNext - step", currentStep, currentStepName, "-> navigating");

    try {
      // Handle dual account step (only present in full steps array)
      if (currentStepName === "Dual Account" && dualAccountActionRef.current) {
        const success = await dualAccountActionRef.current();
        if (!success) {
          setIsNavigating(false);
          return;
        }
        setFormData(prev => ({ ...prev, alsoClient: dualAccountState.selectedOption === 'both' }));
      }

      // Handle verification step
      if (currentStepName === "Verification" && verificationSubmitRef.current && verificationState.hasAnyDocs) {
        await verificationSubmitRef.current();
      }
      
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
        console.log("[CoachOnboarding] Step advanced to", currentStep + 1);
      }
    } finally {
      // Re-enable navigation after a short delay to allow render to complete
      setTimeout(() => {
        setIsNavigating(false);
        console.log("[CoachOnboarding] Navigation unlocked");
      }, 150);
    }
  }, [isNavigating, currentStep, STEPS, formData.firstName, formData.coachTypes.length, formData.inPersonAvailable, formData.locationData, formData.onlineAvailable, dualAccountState.selectedOption, verificationState.hasAnyDocs]);

  const handleBack = useCallback(() => {
    // Guard: prevent navigation during existing navigation
    if (isNavigating) {
      console.log("[CoachOnboarding] handleBack blocked - already navigating");
      return;
    }
    
    if (currentStep > 0) {
      setIsNavigating(true);
      console.log("[CoachOnboarding] handleBack - step", currentStep, "->", currentStep - 1);
      
      setCurrentStep((prev) => prev - 1);
      
      // Re-enable navigation after delay
      setTimeout(() => {
        setIsNavigating(false);
        console.log("[CoachOnboarding] Navigation unlocked after back");
      }, 150);
    }
  }, [isNavigating, currentStep]);


  // Fail-safe: if isNavigating gets stuck, force unlock after 2 seconds
  useEffect(() => {
    if (isNavigating) {
      const failSafe = setTimeout(() => {
        console.warn("[CoachOnboarding] Navigation fail-safe triggered - forcing unlock");
        setIsNavigating(false);
      }, 2000);
      return () => clearTimeout(failSafe);
    }
  }, [isNavigating]);

  const handleComplete = async () => {
    // Guard: prevent during existing navigation or submission
    if (!user || isNavigating || isSubmitting) {
      return;
    }

    setIsNavigating(true); // Block other navigation
    setIsSubmitting(true);

    try {
      const isPaidTier = formData.subscriptionTier !== "free";
      
      // For paid tiers, save as free first - payment will upgrade it
      const tierToSave = isPaidTier ? "free" : formData.subscriptionTier;
      
      // Calculate experience_start_date from entered years
      const experienceStartDate = formData.experienceYears 
        ? new Date(new Date().setFullYear(new Date().getFullYear() - parseInt(formData.experienceYears))).toISOString().split('T')[0]
        : null;
      
      const updateData: Record<string, any> = {
        display_name: formData.displayName || null,
        bio: formData.bio || null,
        experience_start_date: experienceStartDate, // experience_years auto-calculated by trigger
        coach_types: formData.coachTypes,
        primary_coach_type: formData.primaryCoachType || null,
        hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        location: formData.location || null,
        online_available: formData.onlineAvailable,
        in_person_available: formData.inPersonAvailable,
        subscription_tier: tierToSave,
        profile_image_url: formData.profileImageUrl,
        also_client: formData.alsoClient,
        onboarding_completed: true,
      };

      // Add structured location data if available
      if (formData.locationData) {
        updateData.location_city = formData.locationData.city;
        updateData.location_region = formData.locationData.region;
        updateData.location_country = formData.locationData.country;
        updateData.location_country_code = formData.locationData.country_code;
        updateData.location_lat = formData.locationData.lat;
        updateData.location_lng = formData.locationData.lng;
        updateData.location_place_id = formData.locationData.place_id;
      }

      const { error } = await supabase
        .from("coach_profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      // Also update user_profiles with first/last name
      const displayName = formData.firstName ? `${formData.firstName}${formData.lastName ? ` ${formData.lastName}` : ""}` : null;
      await supabase
        .from("user_profiles")
        .update({
          first_name: formData.firstName || null,
          last_name: formData.lastName || null,
          display_name: displayName,
        })
        .eq("user_id", user.id);
      // If paid tier selected, handle payment
      if (isPaidTier) {
        const tier = formData.subscriptionTier as SubscriptionTier;
        
        // On native mobile (iOS/Android), trigger native IAP directly
        if (isNativeMobile && (tier === 'starter' || tier === 'pro' || tier === 'enterprise')) {
          // PHASE 1 FIX: Profile is already saved with onboarding_completed: true above
          // Set session/localStorage flags for additional safety
          sessionStorage.setItem(STORAGE_KEYS.ONBOARDING_JUST_COMPLETED, 'coach');
          localStorage.setItem(STORAGE_KEYS.COACH_ONBOARDED, 'true');
          
          // Clear cached tier to ensure fresh data after purchase
          localStorage.removeItem(STORAGE_KEYS.CACHED_TIER);
          
          console.log('[CoachOnboarding] Profile saved with onboarding_completed: true. Starting native IAP for tier:', tier);
          
          toast.success("Profile saved! Completing subscription...");
          
          // Start the IAP flow - NO FALLBACK TIMER
          // The handleIAPSuccess callback handles navigation on success
          // If purchase is cancelled/fails, user stays on paywall and can retry
          await nativePurchase(tier, billingInterval);
          
          // IAP hook handles success/error and navigation via handleIAPSuccess callback
          // Do NOT auto-navigate - wait for confirmed purchase success
          return;
        }
        
        // On web, redirect to web checkout
        toast.success("Profile saved! Complete your subscription to unlock all features.");
        navigate(`/subscribe?tier=${formData.subscriptionTier}&billing=${billingInterval}&from=onboarding`);
      } else if (formData.alsoClient) {
        // Set completion flag BEFORE navigation - dashboard will check this
        sessionStorage.setItem(STORAGE_KEYS.ONBOARDING_JUST_COMPLETED, 'coach');
        
        // Post-save operations (non-critical) - wrap separately so errors don't show "save failed"
        try {
          await queryClient.refetchQueries({ queryKey: ["coach-onboarding-status", user.id] });
          await refreshProfiles();
        } catch (postSaveError) {
          console.warn('[CoachOnboarding] Post-save refresh error (non-critical):', postSaveError);
        }
        
        if (import.meta.env.DEV) {
          console.log('[CoachOnboarding] handleComplete - navigating to client onboarding');
        }
        
        toast.success("Coach profile completed! Now let's set up your client profile.");
        navigate("/onboarding/client", { replace: true });
      } else {
        // Set completion flag BEFORE navigation - dashboard will check this to prevent flicker
        sessionStorage.setItem(STORAGE_KEYS.ONBOARDING_JUST_COMPLETED, 'coach');
        
        // Post-save operations (non-critical) - wrap separately so errors don't show "save failed"
        try {
          await queryClient.refetchQueries({ queryKey: ["coach-onboarding-status", user.id] });
          await refreshProfiles();
        } catch (postSaveError) {
          console.warn('[CoachOnboarding] Post-save refresh error (non-critical):', postSaveError);
        }
        
        if (import.meta.env.DEV) {
          console.log('[CoachOnboarding] handleComplete - navigating to dashboard');
        }
        
        toast.success("Profile completed! Welcome to FitConnect.");
        navigate("/dashboard/coach", { replace: true });
      }
      // Don't reset isNavigating on success - we're navigating away
    } catch (error) {
      console.error("[CoachOnboarding] handleComplete error:", error);
      toast.error("Failed to save profile. Please try again.");
      setIsNavigating(false); // Only reset on error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine footer actions based on current step
  const getFooterActions = () => {
    const baseSecondary = currentStep > 0 ? { label: "Back", onClick: handleBack } : undefined;
    const currentStepName = STEPS[currentStep];

    // Steps with basic navigation
    if (["Basic Info", "Specialties", "Services & Pricing", "Availability"].includes(currentStepName)) {
      return {
        primary: { label: "Next", onClick: handleNext, disabled: isNavigating },
        secondary: baseSecondary ? { ...baseSecondary, disabled: isNavigating } : undefined,
      };
    }

    // Connect Payments: Stripe component handles its own navigation
    if (currentStepName === "Connect Payments") {
      return undefined;
    }

    // Integrations
    if (currentStepName === "Integrations") {
      return {
        primary: { 
          label: integrationsState.hasAnyConnection ? "Continue" : "Skip", 
          onClick: handleNext,
          disabled: isNavigating,
        },
        secondary: baseSecondary ? { ...baseSecondary, disabled: isNavigating } : undefined,
      };
    }

    // Dual Account (only shown for users without existing client profile)
    if (currentStepName === "Dual Account") {
      return {
        primary: { 
          label: "Continue", 
          onClick: handleNext,
          disabled: !dualAccountState.selectedOption || isNavigating,
          loading: dualAccountState.isCreating,
        },
        secondary: baseSecondary ? { ...baseSecondary, disabled: isNavigating } : undefined,
      };
    }

    // Verification
    if (currentStepName === "Verification") {
      return {
        primary: { 
          label: verificationState.hasAnyDocs ? "Submit & Continue" : "Skip", 
          onClick: handleNext,
          disabled: isNavigating,
          loading: verificationState.isSubmitting,
        },
        secondary: baseSecondary ? { ...baseSecondary, disabled: isNavigating } : undefined,
      };
    }

    // Choose Your Plan - Footer is now handled inside the step content (Apple-style paywall)
    if (currentStepName === "Choose Your Plan") {
      return undefined; // No default footer - we render custom CTA inline
    }

    return undefined;
  };

  // Handle restore purchases for native apps
  const handleRestorePurchases = async () => {
    if (typeof window !== 'undefined' && (window as any).despia?.restorePurchases) {
      try {
        toast.loading("Restoring purchases...");
        await (window as any).despia.restorePurchases();
        toast.success("Purchases restored successfully");
      } catch (error) {
        console.error("Failed to restore purchases:", error);
        toast.error("Failed to restore purchases");
      }
    } else {
      toast.info("Restore purchases is only available on iOS/Android");
    }
  };

  // Handle "Continue without upgrading" - sets free tier and completes onboarding
  const handleContinueWithoutUpgrading = async () => {
    handleInputChange("subscriptionTier", "free");
    setHasSelectedPlan(true);
    // Small delay to ensure state is set, then complete
    setTimeout(() => {
      handleComplete();
    }, 100);
  };

  const renderStepContent = () => {
    const currentStepName = STEPS[currentStep];
    
    switch (currentStepName) {
      case "Basic Info":
        return (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Tell us about yourself
              </h2>
              <p className="text-muted-foreground text-sm mt-1.5">This will appear on your public profile.</p>
            </div>

            {/* Profile Image Upload */}
            <div>
              <Label className="text-foreground mb-3 block">Profile Photo</Label>
              <ProfileImageUpload
                currentImageUrl={formData.profileImageUrl}
                userId={user?.id || ""}
                displayName={formData.displayName}
                onImageChange={(url) => handleInputChange("profileImageUrl", url || "")}
                size="lg"
              />
            </div>

            {/* First and Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="firstName" className="text-foreground text-sm">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="mt-1.5 bg-secondary border-border text-foreground h-9 sm:h-10"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-foreground text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="mt-1.5 bg-secondary border-border text-foreground h-9 sm:h-10"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="displayName" className="text-foreground text-sm">Display Name</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">Your professional coaching name shown to clients</p>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                className="bg-secondary border-border text-foreground h-9 sm:h-10"
                placeholder="Coach Mike"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-foreground text-sm">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="mt-1.5 bg-secondary border-border text-foreground min-h-24 sm:min-h-32"
                placeholder="Tell potential clients about your background, experience, and coaching philosophy..."
              />
            </div>

            <div>
              <Label htmlFor="experience" className="text-foreground text-sm">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange("experienceYears", e.target.value)}
                className="mt-1.5 bg-secondary border-border text-foreground w-full sm:w-32 h-9 sm:h-10"
                placeholder="5"
              />
            </div>
          </div>
        );

      case "Specialties":
        return (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                What do you specialize in?
              </h2>
              <p className="text-muted-foreground text-sm mt-1.5">Select all that apply. Click the star to set your primary specialty.</p>
            </div>

            {/* Selected specialties with primary indicator - fixed height container */}
            <div 
              className="h-[88px] transition-opacity duration-200 overflow-hidden"
              style={{ opacity: formData.coachTypes.length > 0 ? 1 : 0 }}
              aria-hidden={formData.coachTypes.length === 0}
            >
              <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 border border-border h-full">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Your selected specialties:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-hidden">
                  {formData.coachTypes.slice(0, 5).map((typeId) => {
                    const type = COACH_TYPES.find(t => t.id === typeId);
                    const isPrimary = formData.primaryCoachType === typeId;
                    if (!type) return null;
                    return (
                      <button
                        key={typeId}
                        type="button"
                        onClick={() => handleSetPrimary(typeId)}
                        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-all ${
                          isPrimary 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {isPrimary && <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />}
                        {type.label}
                        {isPrimary && <span className="text-xs opacity-80">(Primary)</span>}
                      </button>
                    );
                  })}
                  {formData.coachTypes.length > 5 && (
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm bg-muted text-muted-foreground">
                      +{formData.coachTypes.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[40vh] lg:max-h-[50vh] xl:max-h-[60vh] overflow-y-auto pr-2">
              {COACH_TYPE_CATEGORIES.map((category) => {
                const CategoryIcon = category.icon;
                const typesInCategory = getCoachTypesByCategory(category.id);
                
                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <h3 className="font-medium text-foreground text-sm sm:text-base">{category.label}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {typesInCategory.map((type) => {
                        const IconComponent = type.icon;
                        const isSelected = formData.coachTypes.includes(type.id);
                        const isPrimary = formData.primaryCoachType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleMultiSelect("coachTypes", type.id)}
                            className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all text-left flex items-center gap-2 ${
                              isSelected
                                ? isPrimary 
                                  ? "border-primary bg-primary/20" 
                                  : "border-primary bg-primary/10"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={`text-xs sm:text-sm flex-1 ${isSelected ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                              {type.label}
                            </span>
                            {isPrimary && (
                              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-primary shrink-0" />
                            )}
                            {isSelected && !isPrimary && (
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary ml-auto shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "Services & Pricing":
        return (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Set your pricing
              </h2>
              <p className="text-muted-foreground text-sm mt-1.5">How much do you charge per session?</p>
            </div>

            <div>
              <Label htmlFor="hourlyRate" className="text-foreground text-sm">Hourly Rate (£)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                className="mt-1.5 bg-secondary border-border text-foreground w-full sm:w-40 h-9 sm:h-10"
                placeholder="50"
              />
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                You can offer packages and discounts later in your dashboard.
              </p>
            </div>
          </div>
        );

      case "Availability":
        return (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Where do you coach?
              </h2>
              <p className="text-muted-foreground text-sm mt-1.5">Let clients know how they can work with you.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-secondary">
                <div>
                  <p className="font-medium text-foreground text-sm">Online Coaching</p>
                  <p className="text-xs text-muted-foreground">Video calls, remote training</p>
                </div>
                <Switch
                  checked={formData.onlineAvailable}
                  onCheckedChange={(checked) => handleInputChange("onlineAvailable", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-secondary">
                <div>
                  <p className="font-medium text-foreground text-sm">In-Person Sessions</p>
                  <p className="text-xs text-muted-foreground">Face-to-face training</p>
                </div>
                <Switch
                  checked={formData.inPersonAvailable}
                  onCheckedChange={(checked) => handleInputChange("inPersonAvailable", checked)}
                />
              </div>
            </div>

            {/* Location - Required for ALL coaches */}
            <div>
              <Label className="text-foreground text-sm">
                Location <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter your city, county, or country. The more accurate your location, the better your visibility in that area.
              </p>
              <LocationAutocomplete
                value={formData.location}
                onLocationChange={handleLocationChange}
                placeholder="Search for your city, region, or country..."
                required={true}
              />
            </div>
          </div>
        );

      case "Connect Payments":
        return coachProfileId ? (
          <StripeConnectOnboardingStep
            coachId={coachProfileId}
            onComplete={handleNext}
            onSkip={handleNext}
            onBack={handleBack}
          />
        ) : null;

      case "Integrations":
        return coachProfileId ? (
          <IntegrationsOnboardingStep
            coachId={coachProfileId}
            onStateChange={setIntegrationsState}
          />
        ) : null;

      case "Dual Account":
        return coachProfileId ? (
          <DualAccountStep
            coachId={coachProfileId}
            onStateChange={setDualAccountState}
            onActionRef={dualAccountActionRef}
          />
        ) : null;

      case "Verification":
        return coachProfileId ? (
          <VerificationOnboardingStep
            coachId={coachProfileId}
            onStateChange={setVerificationState}
            onSubmitRef={verificationSubmitRef}
          />
        ) : null;

      case "Choose Your Plan": {
        // Apple-style paywall - get ONLY paid tiers (no free plan card)
        const paidTiers = getDisplayableTiers(true); // excludeFree = true
        const isProcessingIAP = iapState.purchaseStatus === 'purchasing' || iapState.isPolling;
        
        // Dynamic benefits per tier
        const tierBenefits = {
          starter: [
            { icon: Users, text: "Manage up to 10 clients" },
            { icon: Dumbbell, text: "Workout plan builder" },
            { icon: MessageSquare, text: "Client messaging & scheduling" },
          ],
          pro: [
            { icon: Users, text: "Manage up to 50 clients" },
            { icon: Brain, text: "AI workout & meal planners" },
            { icon: TrendingUp, text: "Advanced analytics & insights" },
          ],
          enterprise: [
            { icon: Infinity, text: "Unlimited clients" },
            { icon: Headphones, text: "Priority support & account manager" },
            { icon: Cog, text: "Custom integrations & white-label" },
          ],
        };
        
        // Use selected tier benefits or default to Pro
        const selectedTierKey = (formData.subscriptionTier || 'pro') as keyof typeof tierBenefits;
        const benefits = tierBenefits[selectedTierKey] || tierBenefits.pro;
        
        return (
          <div className="flex flex-col h-full">
            {/* Hero Image */}
            <div className="w-full aspect-[16/9] relative overflow-hidden rounded-xl mb-3 -mt-1">
              <img 
                src="https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/website-images/iap_image.webp"
                alt="Start your fitness coaching journey"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Logo - compact */}
            <div className="flex items-center justify-center gap-2 pb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">FitConnect</span>
            </div>

            {/* Title - compact */}
            <div className="text-center mb-3">
              <h2 className="font-display text-xl font-bold text-foreground">
                Unlock all coaching features
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Start your 7-day free trial today
              </p>
            </div>

            {/* Dynamic benefits list - compact */}
            <div className="space-y-2 mb-3">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{benefit.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Billing toggle - always show Save badge */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className={`text-sm font-medium transition-colors ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch 
                checked={billingInterval === 'yearly'}
                onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
              />
              <span className={`text-sm font-medium transition-colors ${billingInterval === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              <Badge 
                variant={billingInterval === 'yearly' ? 'default' : 'secondary'} 
                className={`ml-1 text-xs ${billingInterval === 'monthly' ? 'opacity-60' : ''}`}
              >
                Save ~17%
              </Badge>
            </div>

            {/* Tier cards - compact Apple-style */}
            <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
              {paidTiers.map((tier) => {
                const Icon = tier.icon;
                const isSelected = formData.subscriptionTier === tier.id;
                const price = billingInterval === 'monthly' 
                  ? nativePricing.getSubscriptionPrice(tier.id as SubscriptionTier, 'monthly')
                  : nativePricing.getSubscriptionPrice(tier.id as SubscriptionTier, 'yearly');
                const monthlyEquivalent = billingInterval === 'yearly' 
                  ? Math.round(price / 12) 
                  : price;
                
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      handleInputChange("subscriptionTier", tier.id);
                      setHasSelectedPlan(true);
                    }}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {/* Radio-style indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    
                    {/* Tier icon */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-primary" : "bg-secondary"
                    }`}>
                      <Icon className={`w-4 h-4 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    
                    {/* Tier info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm">{tier.name}</h3>
                        {tier.popular && (
                          <Badge variant="secondary" className="text-xs py-0">Popular</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{tier.description}</p>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right shrink-0">
                      <span className="font-bold text-primary text-sm">
                        {nativePricing.formatPrice(monthlyEquivalent)}
                      </span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Purchase cancelled/failed alert - retry immediately available */}
            {iapState.purchaseStatus === 'cancelled' && (
              <Alert className="mb-2 border-muted bg-muted/50">
                <AlertDescription className="text-sm text-muted-foreground text-center">
                  Purchase cancelled. Select a plan to try again.
                </AlertDescription>
              </Alert>
            )}

            {/* CTA Section - compact */}
            <div className="mt-3 space-y-2">
              <Button 
                className="w-full py-5 text-base font-semibold"
                onClick={handleComplete}
                disabled={!hasSelectedPlan || isSubmitting || isNavigating || isProcessingIAP}
              >
                {(isSubmitting || isProcessingIAP) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start 7-day free trial
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime. After 7 days, charged {billingInterval === 'monthly' ? 'monthly' : 'yearly'}.
              </p>
              
              <button
                type="button"
                onClick={handleContinueWithoutUpgrading}
                disabled={isSubmitting || isNavigating || isProcessingIAP}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors py-1 disabled:opacity-50"
              >
                Continue without upgrading
              </button>
            </div>

            {/* Consolidated legal footer - single paragraph */}
            <p className="text-xs text-muted-foreground text-center mt-3 pb-1">
              {isNativeMobile && (
                <>
                  <button 
                    type="button"
                    onClick={handleRestorePurchases}
                    className="text-primary hover:underline"
                  >
                    Restore Purchases
                  </button>
                  {" · "}
                </>
              )}
              By continuing, you agree to our{" "}
              {shouldOpenExternally() ? (
                <>
                  <button onClick={() => openExternalUrl(`${window.location.origin}/terms`)} className="text-primary hover:underline">Terms</button>,{" "}
                  <button onClick={() => openExternalUrl(`${window.location.origin}/privacy`)} className="text-primary hover:underline">Privacy</button>{" "}
                  & <button onClick={() => openExternalUrl(`${window.location.origin}/eula`)} className="text-primary hover:underline">EULA</button>
                </>
              ) : (
                <>
                  <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms</Link>,{" "}
                  <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy</Link>{" "}
                  & <Link to="/eula" target="_blank" className="text-primary hover:underline">EULA</Link>
                </>
              )}.
            </p>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Set Up Your Coach Profile | FitConnect</title>
        <meta name="description" content="Create your coaching profile to start connecting with clients." />
      </Helmet>

      <OnboardingLayout
        currentStep={currentStep}
        totalSteps={STEPS.length}
        title={STEPS[currentStep]}
        headerLogo={STEPS[currentStep] !== "Choose Your Plan"}
        showBackButton={currentStep > 0 && STEPS[currentStep] !== "Connect Payments" && STEPS[currentStep] !== "Choose Your Plan" && !isNavigating}
        onBack={handleBack}
        footerActions={getFooterActions()}
        hideFooter={STEPS[currentStep] === "Connect Payments" || STEPS[currentStep] === "Choose Your Plan"}
        hideHeader={STEPS[currentStep] === "Choose Your Plan"}
        hideProgress={STEPS[currentStep] === "Choose Your Plan"}
        maxWidth={STEPS[currentStep] === "Choose Your Plan" ? "md" : STEPS[currentStep] === "Specialties" ? "xl" : "lg"}
        backDisabled={isNavigating}
        skipDisabled={isNavigating}
      >
        {renderStepContent()}
      </OnboardingLayout>

      {/* IAP Unsuccessful Modal */}
      <IAPUnsuccessfulDialog 
        open={iapState.showUnsuccessfulModal} 
        onOpenChange={dismissUnsuccessfulModal}
      />
      
      {/* Features Activated Modal - shown before navigating to dashboard */}
      <FeaturesActivatedModal
        isOpen={showFeaturesModal}
        onClose={handleFeaturesModalClose}
        tier={purchasedTier || 'starter'}
      />
    </>
  );
};

export default CoachOnboarding;
