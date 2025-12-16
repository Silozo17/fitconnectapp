import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, ArrowRight, ArrowLeft, Check, Loader2, Flame, Activity, Flower2, Weight, Target, Heart, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import WearablesOnboardingStep from "@/components/onboarding/WearablesOnboardingStep";

const STEPS = ["Personal Info", "Body Metrics", "Fitness Goals", "Dietary Info", "Connect Devices"];

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
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  // Check if onboarding is already completed
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("client_profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.onboarding_completed) {
        navigate("/dashboard/client");
      } else {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [user, navigate]);

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

  const handleNext = () => {
    // Validate first name on personal info step
    if (currentStep === 0 && !formData.firstName.trim()) {
      toast.error("Please enter your first name");
      return;
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
    navigate("/dashboard/client");
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
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
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile completed! Let's find you a coach.");
      navigate("/dashboard/client");
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

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <>
      <Helmet>
        <title>Complete Your Profile | FitConnect</title>
        <meta name="description" content="Set up your fitness profile to get personalized coach recommendations." />
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
            {/* Step 1: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Let's get to know you
                  </h2>
                  <p className="text-muted-foreground">Tell us a bit about yourself.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-foreground">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="mt-1.5 bg-secondary border-border text-foreground"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="mt-1.5 bg-secondary border-border text-foreground"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="age" className="text-foreground">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="mt-1.5 bg-secondary border-border text-foreground w-32"
                    placeholder="25"
                  />
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">Pronouns</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRONOUNS.map((pronoun) => (
                      <button
                        key={pronoun.id}
                        type="button"
                        onClick={() => handleInputChange("genderPronouns", pronoun.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
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
            )}

            {/* Step 2: Body Metrics */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Your body metrics
                  </h2>
                  <p className="text-muted-foreground">This helps coaches create personalized plans.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height" className="text-foreground">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.heightCm}
                      onChange={(e) => handleInputChange("heightCm", e.target.value)}
                      className="mt-1.5 bg-secondary border-border text-foreground"
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="text-foreground">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weightKg}
                      onChange={(e) => handleInputChange("weightKg", e.target.value)}
                      className="mt-1.5 bg-secondary border-border text-foreground"
                      placeholder="70"
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Your metrics are private and only shared with coaches you choose to work with.
                </p>
              </div>
            )}

            {/* Step 3: Fitness Goals */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    What are your fitness goals?
                  </h2>
                  <p className="text-muted-foreground">Select all that apply.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {FITNESS_GOALS.map((goal) => {
                    const IconComponent = goal.icon;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleMultiSelect("fitnessGoals", goal.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                          formData.fitnessGoals.includes(goal.id)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <IconComponent className={`w-6 h-6 ${formData.fitnessGoals.includes(goal.id) ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={formData.fitnessGoals.includes(goal.id) ? "text-foreground font-medium" : "text-muted-foreground"}>
                          {goal.label}
                        </span>
                        {formData.fitnessGoals.includes(goal.id) && (
                          <Check className="w-5 h-5 text-primary ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Dietary Info */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Dietary preferences
                  </h2>
                  <p className="text-muted-foreground">Help your nutritionist create the perfect plan.</p>
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">Dietary Restrictions</Label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_RESTRICTIONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleMultiSelect("dietaryRestrictions", item.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
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
                  <Label className="text-foreground mb-3 block">Allergies</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGIES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleMultiSelect("allergies", item.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
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
            )}

            {/* Step 5: Wearables */}
            {currentStep === 4 && (
              <WearablesOnboardingStep
                onComplete={handleComplete}
                onSkip={handleComplete}
              />
            )}

            {/* Navigation - only show for steps that don't have their own navigation */}
            {currentStep < 4 && (
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

                <Button onClick={handleNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientOnboarding;
