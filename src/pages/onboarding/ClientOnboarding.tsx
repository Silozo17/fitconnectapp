import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Flame, Activity, Flower2, Weight, Target, Heart, Sparkles, Dumbbell, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import WearablesOnboardingStep from "@/components/onboarding/WearablesOnboardingStep";
import { AvatarSelectionStep } from "@/components/onboarding/AvatarSelectionStep";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useTranslation } from "react-i18next";

const STEPS = ["Choose Avatar", "Personal Info", "Body Metrics", "Fitness Goals", "Dietary Info", "Connect Devices"];

const FITNESS_GOALS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "weight_loss", label: "Weight Loss", icon: Flame },
  { id: "muscle_gain", label: "Muscle Gain", icon: Dumbbell },
  { id: "endurance", label: "Improve Endurance", icon: Activity },
  { id: "flexibility", label: "Flexibility", icon: Flower2 },
  { id: "strength", label: "Build Strength", icon: Weight },
  { id: "sports", label: "Sports Performance", icon: Target },
  { id: "rehabilitation", label: "Rehabilitation", icon: Heart },
  { id: "general_fitness", label: "General Fitness", icon: Sparkles },
];

const DIETARY_RESTRICTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten_free", label: "Gluten Free" },
  { id: "dairy_free", label: "Dairy Free" },
  { id: "keto", label: "Keto" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
  { id: "none", label: "No Restrictions" },
];

const ALLERGIES = [
  { id: "nuts", label: "Nuts" },
  { id: "shellfish", label: "Shellfish" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
  { id: "wheat", label: "Wheat" },
  { id: "none", label: "No Allergies" },
];

const PRONOUNS = [
  { id: "he/him", label: "He/Him" },
  { id: "she/her", label: "She/Her" },
  { id: "they/them", label: "They/Them" },
  { id: "prefer_not", label: "Prefer not to say" },
];

const ClientOnboarding = () => {
  const { t } = useTranslation('common');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Wearables step state
  const [wearablesState, setWearablesState] = useState({ hasAnyConnection: false, isLoading: false });

  const [formData, setFormData] = useState({
    selectedAvatarId: null as string | null,
    selectedAvatarSlug: null as string | null,
    firstName: "",
    lastName: "",
    age: "",
    genderPronouns: "",
    heightCm: "",
    weightKg: "",
    fitnessGoals: [] as string[],
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
  });

  // Check if onboarding is already completed and restore saved step
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("client_profiles")
        .select("id, onboarding_completed, onboarding_progress")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.onboarding_completed) {
        navigate("/dashboard/client");
      } else {
        setClientProfileId(data?.id || null);
        
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
      }
    };

    checkProfile();
  }, [user, navigate]);

  // Save current step and form data whenever they change
  useEffect(() => {
    const saveProgress = async () => {
      // Guard: Don't save during navigation or submission
      if (!clientProfileId || isCheckingProfile || isNavigating || isSubmitting) return;
      
      // Serialize formData to JSON-compatible format
      const progressData = JSON.parse(JSON.stringify({
        current_step: currentStep,
        form_data: formData,
        last_updated: new Date().toISOString(),
      }));
      
      await supabase
        .from("client_profiles")
        .update({
          onboarding_progress: progressData
        })
        .eq("id", clientProfileId);
    };
    
    // Debounce the save to avoid too many updates
    const timer = setTimeout(saveProgress, 500);
    return () => clearTimeout(timer);
  }, [currentStep, formData, clientProfileId, isCheckingProfile, isNavigating, isSubmitting]);

  // Fail-safe: if isNavigating gets stuck, force unlock after 2 seconds
  useEffect(() => {
    if (isNavigating) {
      const failSafe = setTimeout(() => {
        console.warn("[ClientOnboarding] Navigation fail-safe triggered - forcing unlock");
        setIsNavigating(false);
      }, 2000);
      return () => clearTimeout(failSafe);
    }
  }, [isNavigating]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData((prev) => {
      const current = prev[field as keyof typeof formData] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleAvatarSelect = (avatarId: string | null, avatarSlug: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAvatarId: avatarId,
      selectedAvatarSlug: avatarSlug,
    }));
  };

  const handleNext = useCallback(() => {
    // Guard: prevent during existing navigation
    if (isNavigating) {
      console.log("[ClientOnboarding] handleNext blocked - already navigating");
      return;
    }
    
    // Validate avatar selection on step 0
    if (currentStep === 0 && !formData.selectedAvatarId) {
      toast.error("Please choose an avatar to continue");
      return;
    }
    
    // Validate first name on personal info step
    if (currentStep === 1 && !formData.firstName.trim()) {
      toast.error("Please enter your first name");
      return;
    }
    
    if (currentStep < STEPS.length - 1) {
      setIsNavigating(true);
      console.log("[ClientOnboarding] handleNext - step", currentStep, "->", currentStep + 1);
      setCurrentStep((prev) => prev + 1);
      
      // Re-enable navigation after delay
      setTimeout(() => {
        setIsNavigating(false);
        console.log("[ClientOnboarding] Navigation unlocked");
      }, 150);
    }
  }, [isNavigating, currentStep, formData.selectedAvatarId, formData.firstName]);

  const handleBack = useCallback(() => {
    // Guard: prevent during existing navigation
    if (isNavigating) {
      console.log("[ClientOnboarding] handleBack blocked - already navigating");
      return;
    }
    
    if (currentStep > 0) {
      setIsNavigating(true);
      console.log("[ClientOnboarding] handleBack - step", currentStep, "->", currentStep - 1);
      setCurrentStep((prev) => prev - 1);
      
      // Re-enable navigation after delay
      setTimeout(() => {
        setIsNavigating(false);
        console.log("[ClientOnboarding] Navigation unlocked after back");
      }, 150);
    }
  }, [isNavigating, currentStep]);


  const handleComplete = useCallback(async () => {
    // Guard: prevent during existing navigation or submission
    if (!user || isNavigating || isSubmitting) {
      console.log("[ClientOnboarding] handleComplete blocked - user:", !!user, "navigating:", isNavigating, "submitting:", isSubmitting);
      return;
    }

    setIsNavigating(true); // Block other navigation
    setIsSubmitting(true);

    try {
      // Update client profile with all data including selected avatar
      const { error } = await supabase
        .from("client_profiles")
        .update({
          first_name: formData.firstName || null,
          last_name: formData.lastName || null,
          age: formData.age ? parseInt(formData.age) : null,
          gender_pronouns: formData.genderPronouns || null,
          height_cm: formData.heightCm ? parseFloat(formData.heightCm) : null,
          weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : null,
          fitness_goals: formData.fitnessGoals,
          dietary_restrictions: formData.dietaryRestrictions,
          allergies: formData.allergies,
          selected_avatar_id: formData.selectedAvatarId,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Also unlock the selected avatar for the user (add to user_avatars table)
      if (formData.selectedAvatarId) {
        await supabase
          .from("user_avatars")
          .upsert({
            user_id: user.id,
            avatar_id: formData.selectedAvatarId,
            unlock_source: "default",
          }, {
            onConflict: "user_id,avatar_id"
          });
      }

      // Invalidate the onboarding status cache before navigating
      queryClient.invalidateQueries({ queryKey: ["client-onboarding-status", user.id] });
      
      toast.success("Profile completed! Let's find you a coach.");
      navigate("/dashboard/client");
      // Don't reset isNavigating on success - we're navigating away
    } catch (error) {
      console.error("[ClientOnboarding] handleComplete error:", error);
      toast.error("Failed to save profile. Please try again.");
      setIsNavigating(false); // Only reset on error
    } finally {
      setIsSubmitting(false);
    }
  }, [user, isNavigating, isSubmitting, formData, navigate]);

  if (isCheckingProfile) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine footer actions based on current step
  const getFooterActions = () => {
    // Last step (Wearables)
    if (currentStep === 5) {
      return {
        primary: {
          label: wearablesState.hasAnyConnection ? "Complete Setup" : "Skip & Complete",
          onClick: handleComplete,
          loading: isSubmitting,
          disabled: isNavigating || isSubmitting,
        },
        secondary: currentStep > 0 ? {
          label: "Back",
          onClick: handleBack,
          disabled: isNavigating || isSubmitting,
        } : undefined,
      };
    }

    // All other steps
    return {
      primary: {
        label: "Next",
        onClick: handleNext,
        disabled: isNavigating,
      },
      secondary: currentStep > 0 ? {
        label: "Back",
        onClick: handleBack,
        disabled: isNavigating,
      } : undefined,
    };
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <AvatarSelectionStep
            selectedAvatarId={formData.selectedAvatarId}
            onSelect={handleAvatarSelect}
          />
        );

      case 1:
        return (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Let's get to know you
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">Tell us a bit about yourself.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="firstName" className="text-foreground text-sm">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="mt-1 bg-secondary border-border text-foreground h-9 sm:h-10"
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
                  className="mt-1 bg-secondary border-border text-foreground h-9 sm:h-10"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="age" className="text-foreground text-sm">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="mt-1 bg-secondary border-border text-foreground w-24 h-9 sm:h-10"
                placeholder="25"
              />
            </div>

            <div>
              <Label className="text-foreground text-sm mb-2 block">Pronouns</Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {PRONOUNS.map((pronoun) => (
                  <button
                    key={pronoun.id}
                    type="button"
                    onClick={() => handleInputChange("genderPronouns", pronoun.id)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 transition-all text-sm ${
                      formData.genderPronouns === pronoun.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {pronoun.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Your body metrics
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">This helps coaches create personalized plans.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="height" className="text-foreground text-sm">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => handleInputChange("heightCm", e.target.value)}
                  className="mt-1 bg-secondary border-border text-foreground h-9 sm:h-10"
                  placeholder="175"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="text-foreground text-sm">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weightKg}
                  onChange={(e) => handleInputChange("weightKg", e.target.value)}
                  className="mt-1 bg-secondary border-border text-foreground h-9 sm:h-10"
                  placeholder="70"
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Your metrics are private and only shared with coaches you choose to work with.
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                What are your fitness goals?
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">Select all that apply.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {FITNESS_GOALS.map((goal) => {
                const IconComponent = goal.icon;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleMultiSelect("fitnessGoals", goal.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 sm:gap-3 ${
                      formData.fitnessGoals.includes(goal.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 shrink-0 ${formData.fitnessGoals.includes(goal.id) ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs sm:text-sm ${formData.fitnessGoals.includes(goal.id) ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {goal.label}
                    </span>
                    {formData.fitnessGoals.includes(goal.id) && (
                      <Check className="w-4 h-4 text-primary ml-auto shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Dietary preferences
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">Help your nutritionist create the perfect plan.</p>
            </div>

            <div>
              <Label className="text-foreground text-sm mb-2 block">Dietary Restrictions</Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {DIETARY_RESTRICTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMultiSelect("dietaryRestrictions", item.id)}
                    className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm ${
                      formData.dietaryRestrictions.includes(item.id)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-foreground text-sm mb-2 block">Allergies</Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {ALLERGIES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMultiSelect("allergies", item.id)}
                    className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm ${
                      formData.allergies.includes(item.id)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <WearablesOnboardingStep
            onStateChange={setWearablesState}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Complete Your Profile | FitConnect</title>
        <meta name="description" content="Set up your fitness profile to get personalized coach recommendations." />
      </Helmet>

      <OnboardingLayout
        currentStep={currentStep}
        totalSteps={STEPS.length}
        title={STEPS[currentStep]}
        headerLogo
        showBackButton={currentStep > 0}
        onBack={handleBack}
        footerActions={getFooterActions()}
        maxWidth="lg"
      >
        {renderStepContent()}
      </OnboardingLayout>
    </>
  );
};

export default ClientOnboarding;
