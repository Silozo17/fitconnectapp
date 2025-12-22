import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
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

const STEPS = [
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
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Step component state
  const [integrationsState, setIntegrationsState] = useState({ hasAnyConnection: false });
  const [dualAccountState, setDualAccountState] = useState({ selectedOption: null as 'both' | 'coach_only' | null, isCreating: false });
  const [verificationState, setVerificationState] = useState({ hasRequiredDocs: false, hasAnyDocs: false, isSubmitting: false });
  
  // Refs for step actions
  const dualAccountActionRef = useRef<(() => Promise<boolean>) | null>(null);
  const verificationSubmitRef = useRef<(() => Promise<void>) | null>(null);

  const [formData, setFormData] = useState({
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

  // Check if onboarding is already completed and restore saved step
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("coach_profiles")
        .select("id, onboarding_completed, onboarding_progress")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.onboarding_completed) {
        navigate("/dashboard/coach");
      } else {
        setCoachProfileId(data?.id || null);
        
        // Restore saved step from onboarding_progress
        const progress = data?.onboarding_progress as { current_step?: number; form_data?: typeof formData } | null;
        if (progress?.current_step !== undefined && progress.current_step >= 0 && progress.current_step < STEPS.length) {
          setCurrentStep(progress.current_step);
        }
        
        // Restore saved form data if available
        if (progress?.form_data) {
          setFormData(prev => ({ ...prev, ...progress.form_data }));
        }
        
        setIsCheckingProfile(false);
        
        // Check if returning from Stripe (overrides saved step)
        const stripeReturning = searchParams.get("stripe");
        if (stripeReturning === "returning") {
          setCurrentStep(4); // Go to Stripe step
        }
      }
    };

    checkProfile();
  }, [user, navigate, searchParams]);

  // Save current step and form data whenever they change
  useEffect(() => {
    const saveProgress = async () => {
      if (!coachProfileId || isCheckingProfile) return;
      
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
  }, [currentStep, formData, coachProfileId, isCheckingProfile]);

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

  const handleNext = async () => {
    // Validate specialties step - require at least one specialty
    if (currentStep === 1 && formData.coachTypes.length === 0) {
      toast.error("Please select at least one specialty");
      return;
    }

    // Validate availability step - require location if in-person is enabled
    if (currentStep === 3) {
      if (formData.inPersonAvailable && !formData.locationData) {
        toast.error("Please select a valid location for in-person sessions");
        return;
      }
      if (!formData.onlineAvailable && !formData.inPersonAvailable) {
        toast.error("Please enable at least one session type (online or in-person)");
        return;
      }
    }

    // Handle dual account step
    if (currentStep === 6 && dualAccountActionRef.current) {
      const success = await dualAccountActionRef.current();
      if (!success) return;
      setFormData(prev => ({ ...prev, alsoClient: dualAccountState.selectedOption === 'both' }));
    }

    // Handle verification step
    if (currentStep === 7 && verificationSubmitRef.current && verificationState.hasAnyDocs) {
      await verificationSubmitRef.current();
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    navigate("/dashboard/coach");
  };

  const handleComplete = async () => {
    if (!user) return;

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

      // If paid tier selected, redirect to payment
      if (isPaidTier) {
        toast.success("Profile saved! Complete your subscription to unlock all features.");
        navigate(`/subscribe?tier=${formData.subscriptionTier}&billing=monthly`);
      } else if (formData.alsoClient) {
        toast.success("Profile completed! Welcome to FitConnect.");
        navigate("/onboarding/client");
      } else {
        toast.success("Profile completed! Welcome to FitConnect.");
        navigate("/dashboard/coach");
      }
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
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

    switch (currentStep) {
      // Steps 0-3: Basic navigation
      case 0:
      case 1:
      case 2:
      case 3:
        return {
          primary: { label: "Next", onClick: handleNext },
          secondary: baseSecondary,
        };

      // Step 4: Stripe - handled by component, skip navigation for now
      case 4:
        return {
          primary: { label: "Next", onClick: handleNext },
          secondary: { label: "Skip", onClick: handleNext },
        };

      // Step 5: Integrations
      case 5:
        return {
          primary: { 
            label: integrationsState.hasAnyConnection ? "Continue" : "Skip", 
            onClick: handleNext 
          },
          secondary: baseSecondary,
        };

      // Step 6: Dual Account
      case 6:
        return {
          primary: { 
            label: "Continue", 
            onClick: handleNext,
            disabled: !dualAccountState.selectedOption,
            loading: dualAccountState.isCreating,
          },
          secondary: baseSecondary,
        };

      // Step 7: Verification
      case 7:
        return {
          primary: { 
            label: verificationState.hasAnyDocs ? "Submit & Continue" : "Skip", 
            onClick: handleNext,
            loading: verificationState.isSubmitting,
          },
          secondary: baseSecondary,
        };

      // Step 8: Choose Plan
      case 8:
        return {
          primary: { 
            label: "Complete Setup", 
            onClick: handleComplete,
            loading: isSubmitting,
          },
          secondary: baseSecondary,
        };

      default:
        return undefined;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
                Tell us about yourself
              </h2>
              <p className="text-muted-foreground text-sm">This will appear on your public profile.</p>
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

            <div>
              <Label htmlFor="displayName" className="text-foreground text-sm">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                className="mt-1.5 bg-secondary border-border text-foreground h-9 sm:h-10"
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

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
                What do you specialize in?
              </h2>
              <p className="text-muted-foreground text-sm">Select all that apply. Click the star to set your primary specialty.</p>
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
                        {isPrimary && <span className="text-[10px] sm:text-xs opacity-80">(Primary)</span>}
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

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {COACH_TYPE_CATEGORIES.map((category) => {
                const CategoryIcon = category.icon;
                const typesInCategory = getCoachTypesByCategory(category.id);
                
                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <h3 className="font-medium text-foreground text-sm">{category.label}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
                Set your pricing
              </h2>
              <p className="text-muted-foreground text-sm">How much do you charge per session?</p>
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

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
                Where do you coach?
              </h2>
              <p className="text-muted-foreground text-sm">Let clients know how they can work with you.</p>
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

            {/* Location - Required for in-person */}
            {formData.inPersonAvailable && (
              <div>
                <Label className="text-foreground text-sm">
                  Location <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select your city so clients can find you
                </p>
                <LocationAutocomplete
                  value={formData.location}
                  onLocationChange={handleLocationChange}
                  placeholder="Search for your city..."
                  required={formData.inPersonAvailable}
                />
              </div>
            )}
          </div>
        );

      case 4:
        return coachProfileId ? (
          <StripeConnectOnboardingStep
            coachId={coachProfileId}
            onComplete={handleNext}
            onSkip={handleNext}
          />
        ) : null;

      case 5:
        return coachProfileId ? (
          <IntegrationsOnboardingStep
            coachId={coachProfileId}
            onStateChange={setIntegrationsState}
          />
        ) : null;

      case 6:
        return coachProfileId ? (
          <DualAccountStep
            coachId={coachProfileId}
            onStateChange={setDualAccountState}
            onActionRef={dualAccountActionRef}
          />
        ) : null;

      case 7:
        return coachProfileId ? (
          <VerificationOnboardingStep
            coachId={coachProfileId}
            onStateChange={setVerificationState}
            onSubmitRef={verificationSubmitRef}
          />
        ) : null;

      case 8:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
                Choose your plan
              </h2>
              <p className="text-muted-foreground text-sm">Swipe to browse. Upgrade anytime.</p>
            </div>

            <Carousel
              opts={{ align: "center", loop: true }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {getDisplayableTiers().map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = formData.subscriptionTier === tier.id;
                  return (
                    <CarouselItem key={tier.id} className="pl-2 basis-[85%] sm:basis-1/2">
                      <button
                        type="button"
                        onClick={() => handleInputChange("subscriptionTier", tier.id)}
                        className={`w-full h-full p-4 rounded-xl border-2 transition-all text-left relative ${
                          isSelected ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        {tier.popular && (
                          <span className="absolute -top-2 right-3 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                            Popular
                          </span>
                        )}
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-primary" : "bg-secondary"
                          }`}>
                            <Icon className={`w-5 h-5 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-foreground">{tier.name}</h3>
                            <span className="text-lg font-bold text-primary">{tier.price}<span className="text-xs text-muted-foreground">/mo</span></span>
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-primary ml-auto" />}
                        </div>
                        <p className="text-muted-foreground text-xs mb-2">{tier.description}</p>
                        <ul className="space-y-0.5">
                          {tier.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-primary shrink-0" />
                              <span className="truncate">{feature}</span>
                            </li>
                          ))}
                          {tier.features.length > 3 && (
                            <li className="text-xs text-primary">+{tier.features.length - 3} more</li>
                          )}
                        </ul>
                      </button>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 pt-2">
              {getDisplayableTiers().map((tier) => (
                <div
                  key={tier.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    formData.subscriptionTier === tier.id ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        );

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
        showBackButton={currentStep > 0}
        onBack={handleBack}
        onSkip={handleSkip}
        skipLabel="Skip for now"
        footerActions={getFooterActions()}
        maxWidth="lg"
      >
        {renderStepContent()}
      </OnboardingLayout>
    </>
  );
};

export default CoachOnboarding;
