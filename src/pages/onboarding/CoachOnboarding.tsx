import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Dumbbell, ArrowRight, ArrowLeft, Check, Loader2, Crown, Zap, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { ProfileImageUpload } from "@/components/shared/ProfileImageUpload";
import { LocationAutocomplete } from "@/components/shared/LocationAutocomplete";
import StripeConnectOnboardingStep from "@/components/onboarding/StripeConnectOnboardingStep";
import IntegrationsOnboardingStep from "@/components/onboarding/IntegrationsOnboardingStep";
import DualAccountStep from "@/components/onboarding/DualAccountStep";
import { COACH_TYPES, COACH_TYPE_CATEGORIES, getCoachTypesByCategory } from "@/constants/coachTypes";
import { SUBSCRIPTION_TIERS, TierKey } from "@/lib/stripe-config";

const STEPS = [
  "Basic Info",
  "Specialties",
  "Services & Pricing",
  "Availability",
  "Connect Payments",
  "Integrations",
  "Dual Account",
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
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // Check if onboarding is already completed and get coach profile ID
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("coach_profiles")
        .select("id, onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.onboarding_completed) {
        navigate("/dashboard/coach");
      } else {
        setCoachProfileId(data?.id || null);
        setIsCheckingProfile(false);
        
        // Check if returning from Stripe
        const stripeReturning = searchParams.get("stripe");
        if (stripeReturning === "returning") {
          setCurrentStep(4); // Go to Stripe step
        }
      }
    };

    checkProfile();
  }, [user, navigate, searchParams]);

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

  const handleNext = () => {
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

  const handleDualAccountComplete = (createClientAccount: boolean) => {
    setFormData(prev => ({ ...prev, alsoClient: createClientAccount }));
    handleNext();
  };

  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <>
      <Helmet>
        <title>Set Up Your Coach Profile | FitConnect</title>
        <meta name="description" content="Create your coaching profile to start connecting with clients." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">FitConnect</span>
            </div>
            <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
              Skip for now
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</span>
            <span className="text-foreground font-medium">{STEPS[currentStep]}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Content */}
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="card-elevated p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Tell us about yourself
                  </h2>
                  <p className="text-muted-foreground">This will appear on your public profile.</p>
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
                  <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                    className="mt-1.5 bg-secondary border-border text-foreground"
                    placeholder="Coach Mike"
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-foreground">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="mt-1.5 bg-secondary border-border text-foreground min-h-32"
                    placeholder="Tell potential clients about your background, experience, and coaching philosophy..."
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-foreground">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => handleInputChange("experienceYears", e.target.value)}
                    className="mt-1.5 bg-secondary border-border text-foreground w-full sm:w-32"
                    placeholder="5"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Specialties */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    What do you specialize in?
                  </h2>
                  <p className="text-muted-foreground">Select all that apply. Click the star to set your primary specialty.</p>
                </div>

                {/* Selected specialties with primary indicator */}
                {formData.coachTypes.length > 0 && (
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-3">Your selected specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.coachTypes.map((typeId) => {
                        const type = COACH_TYPES.find(t => t.id === typeId);
                        const isPrimary = formData.primaryCoachType === typeId;
                        if (!type) return null;
                        return (
                          <button
                            key={typeId}
                            type="button"
                            onClick={() => handleSetPrimary(typeId)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                              isPrimary 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-secondary text-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {isPrimary && <Star className="w-3.5 h-3.5 fill-current" />}
                            {type.label}
                            {isPrimary && <span className="text-xs opacity-80">(Primary)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2">
                  {COACH_TYPE_CATEGORIES.map((category) => {
                    const CategoryIcon = category.icon;
                    const typesInCategory = getCoachTypesByCategory(category.id);
                    
                    return (
                      <div key={category.id}>
                        <div className="flex items-center gap-2 mb-3">
                          <CategoryIcon className="w-5 h-5 text-primary" />
                          <h3 className="font-medium text-foreground">{category.label}</h3>
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
                                className={`p-3 rounded-lg border-2 transition-all text-left flex items-center gap-2 ${
                                  isSelected
                                    ? isPrimary 
                                      ? "border-primary bg-primary/20" 
                                      : "border-primary bg-primary/10"
                                    : "border-border hover:border-muted-foreground"
                                }`}
                              >
                                <IconComponent className={`w-5 h-5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                <span className={`text-sm flex-1 ${isSelected ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                  {type.label}
                                </span>
                                {isPrimary && (
                                  <Star className="w-4 h-4 text-primary fill-primary shrink-0" />
                                )}
                                {isSelected && !isPrimary && (
                                  <Check className="w-4 h-4 text-primary ml-auto shrink-0" />
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
            )}

            {/* Step 3: Services & Pricing */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Set your pricing
                  </h2>
                  <p className="text-muted-foreground">How much do you charge per session?</p>
                </div>

                <div>
                  <Label htmlFor="hourlyRate" className="text-foreground">Hourly Rate (£)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                    className="mt-1.5 bg-secondary border-border text-foreground w-full sm:w-40"
                    placeholder="50"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    You can offer packages and discounts later in your dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Availability */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Where do you coach?
                  </h2>
                  <p className="text-muted-foreground">Let clients know how they can work with you.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                    <div>
                      <p className="font-medium text-foreground">Online Coaching</p>
                      <p className="text-sm text-muted-foreground">Video calls, remote training</p>
                    </div>
                    <Switch
                      checked={formData.onlineAvailable}
                      onCheckedChange={(checked) => handleInputChange("onlineAvailable", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                    <div>
                      <p className="font-medium text-foreground">In-Person Sessions</p>
                      <p className="text-sm text-muted-foreground">Face-to-face training</p>
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
                    <Label className="text-foreground">
                      Location <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
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
            )}

            {/* Step 5: Connect Stripe */}
            {currentStep === 4 && coachProfileId && (
              <StripeConnectOnboardingStep
                coachId={coachProfileId}
                onComplete={handleNext}
                onSkip={handleNext}
              />
            )}

            {/* Step 6: Integrations */}
            {currentStep === 5 && coachProfileId && (
              <IntegrationsOnboardingStep
                coachId={coachProfileId}
                onComplete={handleNext}
                onSkip={handleNext}
              />
            )}

            {/* Step 7: Dual Account */}
            {currentStep === 6 && coachProfileId && (
              <DualAccountStep
                coachId={coachProfileId}
                onComplete={handleDualAccountComplete}
                onBack={handleBack}
              />
            )}

            {/* Step 8: Subscription Tier */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Choose your plan
                  </h2>
                  <p className="text-muted-foreground">You can upgrade anytime. No payment required now.</p>
                </div>

                <div className="space-y-4">
                  {getDisplayableTiers().map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => handleInputChange("subscriptionTier", tier.id)}
                        className={`w-full p-6 rounded-xl border-2 transition-all text-left relative ${
                          formData.subscriptionTier === tier.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        {tier.popular && (
                          <span className="absolute -top-3 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                            Popular
                          </span>
                        )}
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            formData.subscriptionTier === tier.id ? "bg-primary" : "bg-secondary"
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              formData.subscriptionTier === tier.id ? "text-primary-foreground" : "text-muted-foreground"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <h3 className="font-display text-lg font-bold text-foreground">{tier.name}</h3>
                              <span className="text-xl font-bold text-primary">{tier.price}<span className="text-sm text-muted-foreground">/mo</span></span>
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">{tier.description}</p>
                            <ul className="mt-3 space-y-1">
                              {tier.features.map((feature, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Check className="w-4 h-4 text-primary" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {formData.subscriptionTier === tier.id && (
                            <Check className="w-6 h-6 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation - only show for steps that don't have their own navigation */}
            {(currentStep <= 3 || currentStep === 7) && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button onClick={handleNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Complete Setup
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachOnboarding;
