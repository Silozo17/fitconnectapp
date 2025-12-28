import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Target, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FatSecretFoodLibrary } from "@/components/nutritionbuilder/FatSecretFoodLibrary";
import { MealCard } from "@/components/nutritionbuilder/MealCard";
import { MacroTracker } from "@/components/nutritionbuilder/MacroTracker";
import { AIMealGeneratorModal } from "@/components/nutritionbuilder/AIMealGeneratorModal";
import { AIMacroCalculator } from "@/components/ai/AIMacroCalculator";
import { FeatureGate } from "@/components/FeatureGate";
import { Food, Meal, NutritionDay, MealFood, calculateDayMacros } from "@/hooks/useFoods";
import { MacroCalculation } from "@/hooks/useAI";
import { NutritionContext } from "@/lib/client-profile-mapping";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTrainingPlan, useUpdateTrainingPlan, useCreateTrainingPlan } from "@/hooks/useTrainingPlans";
import { useTranslation } from "@/hooks/useTranslation";

const CoachNutritionBuilder = () => {
  const { t } = useTranslation("coach");
  const navigate = useNavigate();
  const { planId } = useParams();
  const { user } = useAuth();
  const { hasFeature } = useFeatureAccess();
  const isEditing = !!planId;
  
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMealIndex, setSelectedMealIndex] = useState(0);
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(isEditing);
  
  // Nutrition context for downstream tools (Meal Planner, Shopping List)
  const [nutritionContext, setNutritionContext] = useState<NutritionContext | null>(null);
  
  // Macro targets
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(150);
  const [targetCarbs, setTargetCarbs] = useState(200);
  const [targetFat, setTargetFat] = useState(65);
  
  // Days and meals - initialize with translated names
  const getInitialDays = (): NutritionDay[] => [{
    id: crypto.randomUUID(),
    name: `${t("nutritionBuilder.day")} 1`,
    meals: [
      { id: crypto.randomUUID(), name: t("nutritionBuilder.breakfast"), time: "07:00", foods: [] },
      { id: crypto.randomUUID(), name: t("nutritionBuilder.lunch"), time: "12:00", foods: [] },
      { id: crypto.randomUUID(), name: t("nutritionBuilder.dinner"), time: "18:00", foods: [] },
    ],
  }];
  
  const [days, setDays] = useState<NutritionDay[]>(getInitialDays());
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Fetch existing plan when editing
  const { data: existingPlan } = useTrainingPlan(planId);
  const updatePlanMutation = useUpdateTrainingPlan();
  const createPlanMutation = useCreateTrainingPlan();

  // Load existing plan data
  useEffect(() => {
    if (existingPlan && isEditing) {
      setPlanName(existingPlan.name);
      setPlanDescription(existingPlan.description || "");
      setDurationWeeks(existingPlan.duration_weeks || 4);
      
      // Parse nutrition-specific content
      const content = existingPlan.content as any;
      if (content?.days && Array.isArray(content.days)) {
        setDays(content.days);
      }
      if (content?.targets) {
        setTargetCalories(content.targets.calories || 2000);
        setTargetProtein(content.targets.protein || 150);
        setTargetCarbs(content.targets.carbs || 200);
        setTargetFat(content.targets.fat || 65);
      }
      setIsLoadingPlan(false);
    }
  }, [existingPlan, isEditing]);

  useEffect(() => {
    const fetchCoachProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (data) setCoachProfileId(data.id);
    };
    fetchCoachProfile();
  }, [user]);

  const handleMacrosCalculated = (macros: MacroCalculation, context?: NutritionContext) => {
    setTargetCalories(Math.round(macros.targetCalories));
    setTargetProtein(Math.round(macros.macros.protein));
    setTargetCarbs(Math.round(macros.macros.carbs));
    setTargetFat(Math.round(macros.macros.fat));
    
    // Store nutrition context for downstream tools
    if (context) {
      setNutritionContext(context);
    }
  };

  const currentDay = days[selectedDayIndex];
  const dayMacros = currentDay ? calculateDayMacros(currentDay.meals) : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const canUseAI = hasFeature("ai_meal_suggestions");

  const addDay = () => {
    const newDay: NutritionDay = {
      id: crypto.randomUUID(),
      name: `${t("nutritionBuilder.day")} ${days.length + 1}`,
      meals: [
        { id: crypto.randomUUID(), name: t("nutritionBuilder.breakfast"), time: "07:00", foods: [] },
        { id: crypto.randomUUID(), name: t("nutritionBuilder.lunch"), time: "12:00", foods: [] },
        { id: crypto.randomUUID(), name: t("nutritionBuilder.dinner"), time: "18:00", foods: [] },
      ],
    };
    setDays([...days, newDay]);
    setSelectedDayIndex(days.length);
  };

  const addMeal = () => {
    if (!currentDay) return;
    const newMeal: Meal = {
      id: crypto.randomUUID(),
      name: `${t("nutritionBuilder.meal")} ${currentDay.meals.length + 1}`,
      foods: [],
    };
    const updatedDays = [...days];
    updatedDays[selectedDayIndex].meals.push(newMeal);
    setDays(updatedDays);
  };

  const updateMeal = (mealIndex: number, updatedMeal: Meal) => {
    const updatedDays = [...days];
    updatedDays[selectedDayIndex].meals[mealIndex] = updatedMeal;
    setDays(updatedDays);
  };

  const deleteMeal = (mealIndex: number) => {
    const updatedDays = [...days];
    updatedDays[selectedDayIndex].meals.splice(mealIndex, 1);
    setDays(updatedDays);
  };

  const addFoodToMeal = (food: Food, mealIndex: number = 0) => {
    const mealFood: MealFood = {
      id: crypto.randomUUID(),
      food,
      servings: 1,
    };
    const updatedDays = [...days];
    if (updatedDays[selectedDayIndex].meals[mealIndex]) {
      updatedDays[selectedDayIndex].meals[mealIndex].foods.push(mealFood);
      setDays(updatedDays);
      toast.success(t("nutritionBuilder.addedFood", { food: food.name, meal: updatedDays[selectedDayIndex].meals[mealIndex].name }));
    }
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      toast.error(t("nutritionBuilder.planNameRequired"));
      return;
    }
    if (!coachProfileId) {
      toast.error(t("nutritionBuilder.coachNotFound"));
      return;
    }

    setIsSaving(true);
    try {
      const planContent = {
        days,
        targets: {
          calories: targetCalories,
          protein: targetProtein,
          carbs: targetCarbs,
          fat: targetFat,
        },
      };

      if (isEditing && planId) {
        // Update existing plan
        await updatePlanMutation.mutateAsync({
          id: planId,
          name: planName,
          description: planDescription,
          duration_weeks: durationWeeks,
          content: JSON.parse(JSON.stringify(planContent)) as any,
        });
        toast.success(t("nutritionBuilder.planUpdated"));
      } else {
        // Create new plan using mutation hook for proper cache invalidation
        await createPlanMutation.mutateAsync({
          coach_id: coachProfileId,
          name: planName,
          description: planDescription,
          plan_type: "nutrition",
          duration_weeks: durationWeeks,
          content: JSON.parse(JSON.stringify(planContent)) as any,
          is_template: false,
        });
        toast.success(t("nutritionBuilder.planSaved"));
      }
      navigate("/dashboard/coach/plans");
    } catch (error) {
      toast.error(t("nutritionBuilder.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingPlan) {
    return (
      <DashboardLayout title={t("nutritionBuilder.pageTitle")} description={t("nutritionBuilder.loading")}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={isEditing ? t("nutritionBuilder.editTitle") : t("nutritionBuilder.pageTitle")} 
      description={isEditing ? t("nutritionBuilder.editDescription") : t("nutritionBuilder.pageDescription")}
    >
      <FeatureGate feature="nutrition_plan_builder">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground truncate">
                {isEditing ? t("nutritionBuilder.editTitle") : t("nutritionBuilder.pageTitle")}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {isEditing ? t("nutritionBuilder.editDescription") : t("nutritionBuilder.pageDescription")}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="flex-1 sm:flex-none">
              <Save className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{isSaving ? t("nutritionBuilder.saving") : isEditing ? t("nutritionBuilder.updatePlan") : t("nutritionBuilder.savePlan")}</span>
            </Button>
          </div>
        </div>

        {/* Plan Info */}
        <div className="glass-card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="planName">{t("nutritionBuilder.planName")} *</Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder={t("nutritionBuilder.planNamePlaceholder")}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">{t("nutritionBuilder.durationWeeks")}</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("nutritionBuilder.description")}</Label>
              <Input
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder={t("nutritionBuilder.descriptionPlaceholder")}
                className="bg-background border-border"
              />
            </div>
          </div>
        </div>

        {/* Macro Targets */}
        <div className="glass-card p-4 mb-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <Target className="h-5 w-5 text-primary shrink-0" />
              <h3 className="font-semibold text-foreground truncate">{t("nutritionBuilder.dailyMacroTargets")}</h3>
            </div>
            {canUseAI && (
              <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                <AIMacroCalculator onMacrosCalculated={handleMacrosCalculated} />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAiModalOpen(true)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden xs:inline">{t("nutritionBuilder.aiGenerate")}</span>
                </Button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label className="text-primary text-sm">{t("nutritionBuilder.calories")}</Label>
              <Input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(parseInt(e.target.value) || 0)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-red-400 text-sm">{t("nutritionBuilder.proteinG")}</Label>
              <Input
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(parseInt(e.target.value) || 0)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-yellow-400 text-sm">{t("nutritionBuilder.carbsG")}</Label>
              <Input
                type="number"
                value={targetCarbs}
                onChange={(e) => setTargetCarbs(parseInt(e.target.value) || 0)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-blue-400 text-sm">{t("nutritionBuilder.fatG")}</Label>
              <Input
                type="number"
                value={targetFat}
                onChange={(e) => setTargetFat(parseInt(e.target.value) || 0)}
                className="bg-background border-border"
              />
            </div>
          </div>
        </div>

        {/* Day Selector */}
        <div className="w-full min-w-0 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {days.map((day, index) => (
              <Button
                key={day.id}
                variant={selectedDayIndex === index ? "default" : "outline"}
                onClick={() => setSelectedDayIndex(index)}
                size="sm"
                className="shrink-0"
              >
                {day.name}
              </Button>
            ))}
            <Button variant="outline" onClick={addDay} size="sm" className="shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("nutritionBuilder.addDay")}</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Food Library */}
          <div className="lg:col-span-1 h-[500px] lg:h-[600px] glass-card overflow-hidden">
            {coachProfileId && (
              <FatSecretFoodLibrary 
                coachId={coachProfileId} 
                onAddFood={(food) => addFoodToMeal(food, selectedMealIndex)} 
              />
            )}
          </div>

          {/* Meals */}
          <div className="lg:col-span-2 space-y-4">
            {/* Macro Summary */}
            <MacroTracker
              calories={dayMacros.calories}
              protein={dayMacros.protein}
              carbs={dayMacros.carbs}
              fat={dayMacros.fat}
              targetCalories={targetCalories}
              targetProtein={targetProtein}
              targetCarbs={targetCarbs}
              targetFat={targetFat}
            />

            {/* Meals List */}
            <div className="space-y-4">
              {currentDay?.meals.map((meal, index) => (
                <div 
                  key={meal.id} 
                  onClick={() => setSelectedMealIndex(index)}
                  className={`cursor-pointer rounded-lg transition-all ${selectedMealIndex === index ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                >
                  <MealCard
                    meal={meal}
                    onUpdateMeal={(updatedMeal) => updateMeal(index, updatedMeal)}
                    onDeleteMeal={() => deleteMeal(index)}
                  />
                </div>
              ))}
            </div>

            {/* Add Meal Button */}
            <Button variant="outline" className="w-full" onClick={addMeal}>
              <Plus className="h-4 w-4 mr-2" />
              {t("nutritionBuilder.addMeal")}
            </Button>
          </div>
        </div>

        {/* AI Meal Generator Modal */}
        {canUseAI && (
          <AIMealGeneratorModal
            open={aiModalOpen}
            onOpenChange={setAiModalOpen}
            targetCalories={targetCalories}
            targetProtein={targetProtein}
            targetCarbs={targetCarbs}
            targetFat={targetFat}
            onMealPlanGenerated={(generatedDays) => {
              setDays(generatedDays);
              setSelectedDayIndex(0);
            }}
          />
        )}
      </FeatureGate>
    </DashboardLayout>
  );
};

export default CoachNutritionBuilder;
