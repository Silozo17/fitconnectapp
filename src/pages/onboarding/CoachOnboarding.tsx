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
import { Check, Loader2, Crown, Zap, Sparkles, Star } from "lucide-react";
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
import { useIOSRestrictions } from "@/hooks/useIOSRestrictions";
import { useNativeIAP, SubscriptionTier, BillingInterval } from "@/hooks/useNativeIAP";
import { triggerConfetti, confettiPresets } from "@/lib/confetti";
import { triggerHaptic } from "@/lib/despia";
import { IAPUnsuccessfulDialog } from "@/components/iap/IAPUnsuccessfulDialog";

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

// Get displayable tiers (exclude admin-only tiers)
const getDisplayableTiers = () => {
  return (Object.entries(SUBSCRIPTION_TIERS) as [TierKey, typeof SUBSCRIPTION_TIERS.free][])
    .filter(([_, config]) => !config.adminOnly)
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

interface LocationData {
  place_id: string;
  formatted_address: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
}

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
  const { isNativeMobile } = useIOSRestrictions();
  
  // Dynamic steps array - excludes Dual Account step for users with existing client profile
  const STEPS = getSteps(hasExistingClientProfile);
  
  // Helper to find step index by name (makes code more readable and maintainable)
  const getStepIndex = (stepName: string) => STEPS.indexOf(stepName);
  
  // Store formData in a ref for the callback to access latest values
  const formDataRef = useRef<{ alsoClient: boolean }>({ alsoClient: false });
  
  // Handle successful IAP purchase - show celebration and navigate
  const handleIAPSuccess = useCallback(async (tier: SubscriptionTier) => {
    // Trigger confetti celebration
    triggerConfetti(confettiPresets.medium);
    triggerHaptic('success');
    
    // Show celebration toast with tier name
    const tierName = SUBSCRIPTION_TIERS[tier]?.name || tier;
    toast.success(`🎉 Welcome to ${tierName}!`, {
      description: 'Your subscription is now active. Let\'s get started!',
      duration: 3000,
    });
    
    // Refresh profiles so ViewSwitcher updates immediately
    await refreshProfiles();
    
    // Navigate after a short delay to let the celebration show
    setTimeout(() => {
      if (formDataRef.current.alsoClient) {
        navigate("/onboarding/client");
      } else {
        navigate("/dashboard/coach");
      }
    }, 2500);
  }, [navigate, refreshProfiles]);
  
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

  // Check if onboarding is already completed, restore saved step, and check for existing client profile
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      // Check for coach profile and existing client profile in parallel
      const [coachResult, clientResult] = await Promise.all([
        supabase
          .from("coach_profiles")
          .select("id, onboarding_completed, onboarding_progress")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()
      ]);

      const { data } = coachResult;
      const hasClientProfile = !!clientResult.data;
      
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
        
        // Restore saved form data if available
        if (progress?.form_data) {
          setFormData(prev => ({ ...prev, ...progress.form_data }));
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
      console.log("[CoachOnboarding] handleComplete blocked - user:", !!user, "navigating:", isNavigating, "submitting:", isSubmitting);
      return;
    }

    setIsNavigating(true); // Block other navigation
    setIsSubmitting(true);

    try {
      const isPaidTier = formData.subscriptionTier !== "free";
      
      // For paid tiers, save as free first - payment will upgrade it
      const tierToSave = isPaidTier ? "free" : formData.subscriptionTier;
      
      const updateData: Record<string, any> = {
        display_name: formData.displayName || null,
        bio: formData.bio || null,
        experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : null,
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
          toast.success("Profile saved! Completing subscription...");
          await nativePurchase(tier, billingInterval);
          // IAP hook handles success/error and navigation
          return;
        }
        
        // On web, redirect to web checkout
        toast.success("Profile saved! Complete your subscription to unlock all features.");
        navigate(`/subscribe?tier=${formData.subscriptionTier}&billing=${billingInterval}&from=onboarding`);
      } else if (formData.alsoClient) {
        await refreshProfiles();
        toast.success("Coach profile completed! Now let's set up your client profile.");
        navigate("/onboarding/client", { replace: true });
      } else {
        await refreshProfiles();
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

    // Choose Your Plan
    if (currentStepName === "Choose Your Plan") {
      const isPaidTier = formData.subscriptionTier !== "free";
      const isProcessingIAP = iapState.purchaseStatus === 'purchasing' || iapState.isPolling;
      
      // On native mobile (iOS/Android): trigger IAP directly
      if (isNativeMobile) {
        return {
          primary: { 
            label: "Select Plan", 
            onClick: async () => {
              if (isPaidTier) {
                // Trigger native IAP immediately
                const tier = formData.subscriptionTier as SubscriptionTier;
                await nativePurchase(tier, billingInterval);
              } else {
                // Free tier - just complete onboarding
                await handleComplete();
              }
            },
            disabled: isNavigating || isProcessingIAP || !hasSelectedPlan,
            loading: isSubmitting || isProcessingIAP,
          },
          secondary: baseSecondary ? { ...baseSecondary, disabled: isNavigating || isProcessingIAP } : undefined,
        };
      }
      
      // Web: unified "Select Plan" button
      return {
        primary: { 
          label: "Select Plan", 
          onClick: handleComplete,
          disabled: isNavigating || !hasSelectedPlan,
          loading: isSubmitting,
        },
        secondary: baseSecondary ? { ...baseSecondary, disabled: isNavigating } : undefined,
      };
    }

    return undefined;
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
        const tiers = getDisplayableTiers();
        const freeTier = tiers.find(t => t.id === 'free');
        const paidTiers = tiers.filter(t => t.id !== 'free');
        
        // For native mobile (iOS/Android): show Monthly + Annual stacked vertically for paid tiers
        if (isNativeMobile) {
          return (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Choose your plan
                </h2>
                <p className="text-muted-foreground text-sm mt-1.5">Swipe to browse plans</p>
              </div>

              <Carousel
                opts={{ align: "center", loop: true }}
                className="w-full"
              >
                <CarouselContent className="-ml-2">
                  {/* Free tier - single centered card */}
                  {freeTier && (
                    <CarouselItem className="pl-2 basis-[85%]">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange("subscriptionTier", "free");
                            setHasSelectedPlan(true);
                          }}
                          className={`w-full max-w-xs p-4 rounded-xl border-2 transition-all text-left ${
                            formData.subscriptionTier === "free" 
                              ? "border-primary bg-primary/10" 
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              formData.subscriptionTier === "free" ? "bg-primary" : "bg-secondary"
                            }`}>
                              <Sparkles className={`w-5 h-5 ${formData.subscriptionTier === "free" ? "text-primary-foreground" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-foreground">{freeTier.name}</h3>
                              <span className="text-lg font-bold text-primary">£0<span className="text-xs text-muted-foreground">/mo</span></span>
                            </div>
                            {formData.subscriptionTier === "free" && <Check className="w-5 h-5 text-primary ml-auto" />}
                          </div>
                          <p className="text-muted-foreground text-xs mb-2">{freeTier.description}</p>
                          <ul className="space-y-0.5">
                            {freeTier.features.slice(0, 3).map((feature, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                <span className="break-words">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </button>
                      </div>
                    </CarouselItem>
                  )}
                  
                  {/* Paid tiers - Monthly + Annual stacked vertically */}
                  {paidTiers.map((tier) => {
                    const Icon = tier.icon;
                    const tierConfig = SUBSCRIPTION_TIERS[tier.id as TierKey];
                    const monthlyPrice = tierConfig.prices.monthly.amount;
                    const yearlyPrice = tierConfig.prices.yearly.amount;
                    const yearlyMonthly = Math.round(yearlyPrice / 12);
                    const savings = tierConfig.prices.yearly.savings;
                    
                    const isSelectedMonthly = formData.subscriptionTier === tier.id && billingInterval === 'monthly';
                    const isSelectedYearly = formData.subscriptionTier === tier.id && billingInterval === 'yearly';
                    
                    return (
                      <CarouselItem key={tier.id} className="pl-2 basis-[85%]">
                        <div className="flex flex-col gap-3">
                          {/* Monthly card */}
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange("subscriptionTier", tier.id);
                              setBillingInterval('monthly');
                              setHasSelectedPlan(true);
                            }}
                            className={`w-full p-3 rounded-xl border-2 transition-all text-left relative ${
                              isSelectedMonthly ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-1.5">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                isSelectedMonthly ? "bg-primary" : "bg-secondary"
                              }`}>
                                <Icon className={`w-4 h-4 ${isSelectedMonthly ? "text-primary-foreground" : "text-muted-foreground"}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-display font-bold text-foreground text-sm">{tier.name} - Monthly</h3>
                                <span className="text-base font-bold text-primary">£{monthlyPrice}<span className="text-xs text-muted-foreground">/mo</span></span>
                              </div>
                              {isSelectedMonthly && <Check className="w-5 h-5 text-primary" />}
                            </div>
                            <ul className="space-y-0.5 ml-12">
                              {tier.features.slice(0, 2).map((feature, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                  <span className="break-words line-clamp-1">{feature}</span>
                                </li>
                              ))}
                              {tier.features.length > 2 && (
                                <li className="text-xs text-primary">+{tier.features.length - 2} more</li>
                              )}
                            </ul>
                          </button>
                          
                          {/* Annual card */}
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange("subscriptionTier", tier.id);
                              setBillingInterval('yearly');
                              setHasSelectedPlan(true);
                            }}
                            className={`w-full p-3 rounded-xl border-2 transition-all text-left relative ${
                              isSelectedYearly ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            {savings && (
                              <span className="absolute -top-2 right-3 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                                Save £{savings}
                              </span>
                            )}
                            <div className="flex items-center gap-3 mb-1.5">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                isSelectedYearly ? "bg-primary" : "bg-secondary"
                              }`}>
                                <Icon className={`w-4 h-4 ${isSelectedYearly ? "text-primary-foreground" : "text-muted-foreground"}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-display font-bold text-foreground text-sm">{tier.name} - Annual</h3>
                                <div>
                                  <span className="text-base font-bold text-primary">£{yearlyMonthly}<span className="text-xs text-muted-foreground">/mo</span></span>
                                  <span className="text-xs text-muted-foreground ml-2">Billed £{yearlyPrice}/year</span>
                                </div>
                              </div>
                              {isSelectedYearly && <Check className="w-5 h-5 text-primary" />}
                            </div>
                            <ul className="space-y-0.5 ml-12">
                              {tier.features.slice(0, 2).map((feature, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                  <span className="break-words line-clamp-1">{feature}</span>
                                </li>
                              ))}
                              {tier.features.length > 2 && (
                                <li className="text-xs text-primary">+{tier.features.length - 2} more</li>
                              )}
                            </ul>
                          </button>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
              </Carousel>

              {/* Dot indicators for iOS - clickable */}
              <div className="flex justify-center gap-1.5 pt-2">
                {[freeTier, ...paidTiers].filter(Boolean).map((tier) => {
                  if (!tier) return null;
                  const isActive = formData.subscriptionTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        handleInputChange("subscriptionTier", tier.id);
                        if (tier.id !== 'free') setBillingInterval('monthly');
                        setHasSelectedPlan(true);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        isActive ? "bg-primary" : "bg-border hover:bg-muted-foreground"
                      }`}
                      aria-label={`Select ${tier.name}`}
                    />
                  );
                })}
              </div>
              
              {/* Visual hint when no plan selected */}
              {!hasSelectedPlan && (
                <div className="text-center py-2">
                  <p className="text-sm text-amber-500 font-medium animate-pulse">
                    👆 Tap a plan to select it
                  </p>
                </div>
              )}
            </div>
          );
        }
        
        // Non-iOS: Web version with responsive grid on desktop, carousel on mobile
        const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
        
        // Desktop grid layout - all plans visible at once
        const renderDesktopGrid = () => (
          <div className="hidden md:block">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Free tier */}
              {freeTier && (() => {
                const Icon = freeTier.icon;
                const isSelected = formData.subscriptionTier === freeTier.id;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange("subscriptionTier", freeTier.id);
                      setBillingInterval('monthly');
                      setHasSelectedPlan(true);
                    }}
                    className={`w-full h-full p-4 lg:p-5 rounded-xl border-2 transition-all text-left relative hover:shadow-lg ${
                      isSelected ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-primary" : "bg-secondary"
                      }`}>
                        <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-foreground text-base lg:text-lg">{freeTier.name}</h3>
                        <span className="text-xl lg:text-2xl font-bold text-primary">Free</span>
                      </div>
                      {isSelected && <Check className="w-6 h-6 text-primary" />}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{freeTier.description}</p>
                    <ul className="space-y-1">
                      {freeTier.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="text-xs lg:text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="break-words">{feature}</span>
                        </li>
                      ))}
                      {freeTier.features.length > 4 && (
                        <li className="text-sm text-primary font-medium">+{freeTier.features.length - 4} more</li>
                      )}
                    </ul>
                  </button>
                );
              })()}
              
              {/* Paid tiers - each with Monthly + Annual stacked */}
              {paidTiers.map((tier) => {
                const Icon = tier.icon;
                const tierConfig = SUBSCRIPTION_TIERS[tier.id as TierKey];
                const monthlyPrice = tierConfig.prices.monthly.amount;
                const yearlyPrice = tierConfig.prices.yearly.amount;
                const yearlyMonthlyEquivalent = Math.round(yearlyPrice / 12);
                const savings = tierConfig.prices.yearly.savings;
                
                const isSelectedMonthly = formData.subscriptionTier === tier.id && billingInterval === 'monthly';
                const isSelectedYearly = formData.subscriptionTier === tier.id && billingInterval === 'yearly';
                
                return (
                  <div key={tier.id} className="flex flex-col gap-3">
                    {/* Monthly card */}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange("subscriptionTier", tier.id);
                        setBillingInterval('monthly');
                        setHasSelectedPlan(true);
                      }}
                      className={`w-full p-4 lg:p-5 rounded-xl border-2 transition-all text-left relative hover:shadow-lg ${
                        isSelectedMonthly ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2.5 right-3 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                          Popular
                        </span>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${
                          isSelectedMonthly ? "bg-primary" : "bg-secondary"
                        }`}>
                          <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${isSelectedMonthly ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-foreground text-base lg:text-lg">{tier.name}</h3>
                          <span className="text-xl lg:text-2xl font-bold text-primary">£{monthlyPrice}<span className="text-sm text-muted-foreground">/mo</span></span>
                        </div>
                        {isSelectedMonthly && <Check className="w-6 h-6 text-primary" />}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{tier.description}</p>
                      <ul className="space-y-1">
                        {tier.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="text-xs lg:text-sm text-muted-foreground flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="break-words line-clamp-1">{feature}</span>
                          </li>
                        ))}
                        {tier.features.length > 3 && (
                          <li className="text-sm text-primary font-medium">+{tier.features.length - 3} more</li>
                        )}
                      </ul>
                    </button>
                    
                    {/* Annual card with savings */}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange("subscriptionTier", tier.id);
                        setBillingInterval('yearly');
                        setHasSelectedPlan(true);
                      }}
                      className={`w-full p-4 lg:p-5 rounded-xl border-2 transition-all text-left relative hover:shadow-lg ${
                        isSelectedYearly ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      {savings > 0 && (
                        <span className="absolute -top-2.5 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          Save £{savings}
                        </span>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${
                          isSelectedYearly ? "bg-primary" : "bg-secondary"
                        }`}>
                          <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${isSelectedYearly ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-foreground text-base lg:text-lg">{tier.name} <span className="text-xs lg:text-sm font-normal text-muted-foreground">(Annual)</span></h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl lg:text-2xl font-bold text-primary">£{yearlyMonthlyEquivalent}<span className="text-sm text-muted-foreground">/mo</span></span>
                            <span className="text-sm text-muted-foreground line-through">£{monthlyPrice}</span>
                          </div>
                        </div>
                        {isSelectedYearly && <Check className="w-6 h-6 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Billed annually at £{yearlyPrice}/year</p>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
        
        // Mobile carousel layout
        const renderMobileCarousel = () => (
          <div className="md:hidden">
            <Carousel
              opts={{ align: "center", loop: true }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {/* Free tier - single card */}
                {freeTier && (
                  <CarouselItem className="pl-2 basis-[85%]">
                    {(() => {
                      const Icon = freeTier.icon;
                      const isSelected = formData.subscriptionTier === freeTier.id;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange("subscriptionTier", freeTier.id);
                            setBillingInterval('monthly');
                            setHasSelectedPlan(true);
                          }}
                          className={`w-full h-full p-4 rounded-xl border-2 transition-all text-left relative ${
                            isSelected ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? "bg-primary" : "bg-secondary"
                            }`}>
                              <Icon className={`w-5 h-5 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-foreground">{freeTier.name}</h3>
                              <span className="text-lg font-bold text-primary">Free</span>
                            </div>
                            {isSelected && <Check className="w-5 h-5 text-primary ml-auto" />}
                          </div>
                          <p className="text-muted-foreground text-xs mb-2">{freeTier.description}</p>
                          <ul className="space-y-0.5">
                            {freeTier.features.slice(0, 3).map((feature, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                <span className="break-words">{feature}</span>
                              </li>
                            ))}
                            {freeTier.features.length > 3 && (
                              <li className="text-xs text-primary">+{freeTier.features.length - 3} more</li>
                            )}
                          </ul>
                        </button>
                      );
                    })()}
                  </CarouselItem>
                )}
                
                {/* Paid tiers - each with Monthly + Annual stacked cards */}
                {paidTiers.map((tier) => {
                  const Icon = tier.icon;
                  const tierConfig = SUBSCRIPTION_TIERS[tier.id as TierKey];
                  const monthlyPrice = tierConfig.prices.monthly.amount;
                  const yearlyPrice = tierConfig.prices.yearly.amount;
                  const yearlyMonthlyEquivalent = Math.round(yearlyPrice / 12);
                  const savings = tierConfig.prices.yearly.savings;
                  
                  const isSelectedMonthly = formData.subscriptionTier === tier.id && billingInterval === 'monthly';
                  const isSelectedYearly = formData.subscriptionTier === tier.id && billingInterval === 'yearly';
                  
                  return (
                    <CarouselItem key={tier.id} className="pl-2 basis-[85%]">
                      <div className="flex flex-col gap-3">
                        {/* Monthly card */}
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange("subscriptionTier", tier.id);
                            setBillingInterval('monthly');
                            setHasSelectedPlan(true);
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                            isSelectedMonthly ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          {tier.popular && (
                            <span className="absolute -top-2 right-3 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                              Popular
                            </span>
                          )}
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelectedMonthly ? "bg-primary" : "bg-secondary"
                            }`}>
                              <Icon className={`w-5 h-5 ${isSelectedMonthly ? "text-primary-foreground" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-foreground">{tier.name}</h3>
                              <span className="text-lg font-bold text-primary">£{monthlyPrice}<span className="text-xs text-muted-foreground">/mo</span></span>
                            </div>
                            {isSelectedMonthly && <Check className="w-5 h-5 text-primary ml-auto" />}
                          </div>
                          <p className="text-muted-foreground text-xs mb-2">{tier.description}</p>
                          <ul className="space-y-0.5">
                            {tier.features.slice(0, 2).map((feature, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                <span className="break-words line-clamp-1">{feature}</span>
                              </li>
                            ))}
                            {tier.features.length > 2 && (
                              <li className="text-xs text-primary">+{tier.features.length - 2} more</li>
                            )}
                          </ul>
                        </button>
                        
                        {/* Annual card with savings */}
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange("subscriptionTier", tier.id);
                            setBillingInterval('yearly');
                            setHasSelectedPlan(true);
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                            isSelectedYearly ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          {savings > 0 && (
                            <span className="absolute -top-2 right-3 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                              Save £{savings}
                            </span>
                          )}
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelectedYearly ? "bg-primary" : "bg-secondary"
                            }`}>
                              <Icon className={`w-5 h-5 ${isSelectedYearly ? "text-primary-foreground" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-foreground">{tier.name} <span className="text-xs font-normal text-muted-foreground">(Annual)</span></h3>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-lg font-bold text-primary">£{yearlyMonthlyEquivalent}<span className="text-xs text-muted-foreground">/mo</span></span>
                                <span className="text-xs text-muted-foreground line-through">£{monthlyPrice}</span>
                              </div>
                            </div>
                            {isSelectedYearly && <Check className="w-5 h-5 text-primary ml-auto" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Billed annually at £{yearlyPrice}/year</p>
                        </button>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>

            {/* Dot indicators - mobile only */}
            <div className="flex justify-center gap-1.5 pt-3">
              {[freeTier, ...paidTiers].filter(Boolean).map((tier) => {
                if (!tier) return null;
                const isActive = formData.subscriptionTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      handleInputChange("subscriptionTier", tier.id);
                      if (tier.id !== 'free') setBillingInterval('monthly');
                      setHasSelectedPlan(true);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      isActive ? "bg-primary" : "bg-border hover:bg-muted-foreground"
                    }`}
                    aria-label={`Select ${tier.name}`}
                  />
                );
              })}
            </div>
          </div>
        );
        
        return (
          <div className="space-y-5">
            <div className="text-center mb-4 md:mb-6">
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                Choose your plan
              </h2>
              <p className="text-muted-foreground text-sm md:text-base mt-1.5">
                <span className="md:hidden">Swipe to browse. </span>Upgrade anytime.
              </p>
            </div>

            {renderDesktopGrid()}
            {renderMobileCarousel()}
            
            {/* Visual hint when no plan selected */}
            {!hasSelectedPlan && (
              <div className="text-center py-2">
                <p className="text-sm text-amber-500 font-medium animate-pulse">
                  <span className="md:hidden">👆 Swipe and tap to select a plan</span>
                  <span className="hidden md:inline">👆 Click a plan to select it</span>
                </p>
              </div>
            )}
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
        headerLogo
        showBackButton={currentStep > 0 && STEPS[currentStep] !== "Connect Payments" && !isNavigating}
        onBack={handleBack}
        footerActions={getFooterActions()}
        hideFooter={STEPS[currentStep] === "Connect Payments"}
        maxWidth={STEPS[currentStep] === "Choose Your Plan" ? "2xl" : STEPS[currentStep] === "Specialties" ? "xl" : "lg"}
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
    </>
  );
};

export default CoachOnboarding;
