import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Dumbbell, ArrowRight, ArrowLeft, Check, Loader2, Crown, Zap, Sparkles, Salad, Swords, Shield, Flower2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { ProfileImageUpload } from "@/components/shared/ProfileImageUpload";

const STEPS = ["Basic Info", "Specialties", "Services & Pricing", "Availability", "Choose Your Plan"];

const COACH_TYPES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "personal_training", label: "Personal Training", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition Coaching", icon: Salad },
  { id: "boxing", label: "Boxing", icon: Swords },
  { id: "mma", label: "MMA / Martial Arts", icon: Shield },
  { id: "yoga", label: "Yoga & Mindfulness", icon: Flower2 },
  { id: "crossfit", label: "CrossFit", icon: Zap },
];

const SUBSCRIPTION_TIERS = [
  {
    id: "free",
    name: "Free",
    price: "£0",
    description: "Get started with the basics",
    features: ["Basic profile listing", "Up to 5 active clients", "Standard support"],
    icon: Sparkles,
  },
  {
    id: "pro",
    name: "Pro",
    price: "£29",
    description: "Grow your coaching business",
    features: ["Featured in search results", "Unlimited clients", "Priority support", "Custom branding"],
    icon: Zap,
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "£79",
    description: "Maximum visibility & tools",
    features: ["Top placement in listings", "Verified badge", "Analytics dashboard", "Lead generation tools", "1-on-1 onboarding"],
    icon: Crown,
  },
];

const CoachOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    experienceYears: "",
    coachTypes: [] as string[],
    hourlyRate: "",
    location: "",
    onlineAvailable: true,
    inPersonAvailable: false,
    subscriptionTier: "free",
    profileImageUrl: null as string | null,
  });

  // Check if onboarding is already completed
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("coach_profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.onboarding_completed) {
        navigate("/dashboard/coach");
      } else {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string | boolean) => {
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
      const { error } = await supabase
        .from("coach_profiles")
        .update({
          display_name: formData.displayName || null,
          bio: formData.bio || null,
          experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : null,
          coach_types: formData.coachTypes,
          hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
          location: formData.location || null,
          online_available: formData.onlineAvailable,
          in_person_available: formData.inPersonAvailable,
          subscription_tier: formData.subscriptionTier,
          profile_image_url: formData.profileImageUrl,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile completed! Welcome to FitConnect.");
      navigate("/dashboard/coach");
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
                    className="mt-1.5 bg-secondary border-border text-foreground w-32"
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
                  <p className="text-muted-foreground">Select all that apply.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {COACH_TYPES.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleMultiSelect("coachTypes", type.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                          formData.coachTypes.includes(type.id)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <IconComponent className={`w-6 h-6 ${formData.coachTypes.includes(type.id) ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={formData.coachTypes.includes(type.id) ? "text-foreground font-medium" : "text-muted-foreground"}>
                          {type.label}
                        </span>
                        {formData.coachTypes.includes(type.id) && (
                          <Check className="w-5 h-5 text-primary ml-auto" />
                        )}
                      </button>
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
                    className="mt-1.5 bg-secondary border-border text-foreground w-40"
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

                <div>
                  <Label htmlFor="location" className="text-foreground">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="mt-1.5 bg-secondary border-border text-foreground"
                    placeholder="London, UK"
                  />
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
              </div>
            )}

            {/* Step 5: Subscription Tier */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Choose your plan
                  </h2>
                  <p className="text-muted-foreground">You can upgrade anytime. No payment required now.</p>
                </div>

                <div className="space-y-4">
                  {SUBSCRIPTION_TIERS.map((tier) => {
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

            {/* Navigation */}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachOnboarding;
