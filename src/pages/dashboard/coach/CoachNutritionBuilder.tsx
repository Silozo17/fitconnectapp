import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Target, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FoodLibrary } from "@/components/nutritionbuilder/FoodLibrary";
import { MealCard } from "@/components/nutritionbuilder/MealCard";
import { MacroTracker } from "@/components/nutritionbuilder/MacroTracker";
import { CreateFoodModal } from "@/components/nutritionbuilder/CreateFoodModal";
import { AIMealSuggestion } from "@/components/nutritionbuilder/AIMealSuggestion";
import { AIMacroCalculator } from "@/components/ai/AIMacroCalculator";
import { FeatureGate } from "@/components/FeatureGate";
import { Food, Meal, NutritionDay, MealFood, calculateDayMacros } from "@/hooks/useFoods";
import { MacroCalculation } from "@/hooks/useAI";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTrainingPlan, useUpdateTrainingPlan } from "@/hooks/useTrainingPlans";

const CoachNutritionBuilder = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { user } = useAuth();
  const { hasFeature } = useFeatureAccess();
  const isEditing = !!planId;
  
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [isSaving, setIsSaving] = useState(false);
  const [createFoodOpen, setCreateFoodOpen] = useState(false);
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("builder");
  const [isLoadingPlan, setIsLoadingPlan] = useState(isEditing);
  
  // Macro targets
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(150);
  const [targetCarbs, setTargetCarbs] = useState(200);
  const [targetFat, setTargetFat] = useState(65);
  
  // Days and meals
  const [days, setDays] = useState<NutritionDay[]>([
    {
      id: crypto.randomUUID(),
      name: "Day 1",
      meals: [
        { id: crypto.randomUUID(), name: "Breakfast", time: "07:00", foods: [] },
        { id: crypto.randomUUID(), name: "Lunch", time: "12:00", foods: [] },
        { id: crypto.randomUUID(), name: "Dinner", time: "18:00", foods: [] },
      ],
    },
  ]);
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Fetch existing plan when editing
  const { data: existingPlan } = useTrainingPlan(planId);
  const updatePlanMutation = useUpdateTrainingPlan();

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

  const handleMacrosCalculated = (macros: MacroCalculation) => {
    setTargetCalories(Math.round(macros.targetCalories));
    setTargetProtein(Math.round(macros.macros.protein));
    setTargetCarbs(Math.round(macros.macros.carbs));
    setTargetFat(Math.round(macros.macros.fat));
  };

  const currentDay = days[selectedDayIndex];
  const dayMacros = currentDay ? calculateDayMacros(currentDay.meals) : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const canUseAI = hasFeature("ai_meal_suggestions");

  const addDay = () => {
    const newDay: NutritionDay = {
      id: crypto.randomUUID(),
      name: `Day ${days.length + 1}`,
      meals: [
        { id: crypto.randomUUID(), name: "Breakfast", time: "07:00", foods: [] },
        { id: crypto.randomUUID(), name: "Lunch", time: "12:00", foods: [] },
        { id: crypto.randomUUID(), name: "Dinner", time: "18:00", foods: [] },
      ],
    };
    setDays([...days, newDay]);
    setSelectedDayIndex(days.length);
  };

  const addMeal = () => {
    if (!currentDay) return;
    const newMeal: Meal = {
      id: crypto.randomUUID(),
      name: `Meal ${currentDay.meals.length + 1}`,
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
      toast.success(`Added ${food.name} to ${updatedDays[selectedDayIndex].meals[mealIndex].name}`);
    }
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      toast.error("Please enter a plan name");
      return;
    }
    if (!coachProfileId) {
      toast.error("Coach profile not found");
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
        toast.success("Nutrition plan updated!");
      } else {
        // Create new plan
        const { error } = await supabase.from("training_plans").insert([{
          name: planName,
          description: planDescription,
          plan_type: "nutrition",
          duration_weeks: durationWeeks,
          content: JSON.parse(JSON.stringify(planContent)),
          coach_id: coachProfileId,
          is_template: false,
        }]);

        if (error) throw error;
        toast.success("Nutrition plan saved!");
      }
      navigate("/dashboard/coach/plans");
    } catch (error) {
      toast.error("Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingPlan) {
    return (
      <DashboardLayout title="Nutrition Plan Builder" description="Loading plan...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={isEditing ? "Edit Nutrition Plan" : "Nutrition Plan Builder"} 
      description={isEditing ? "Update your nutrition plan" : "Create a customized nutrition plan"}
    >
      <FeatureGate feature="nutrition_plan_builder">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {isEditing ? "Edit Nutrition Plan" : "Nutrition Plan Builder"}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? "Update your meal plan" : "Create customized meal plans with macro tracking"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCreateFoodOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Food
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : isEditing ? "Update Plan" : "Save Plan"}
            </Button>
          </div>
        </div>

        {/* Plan Info */}
        <div className="card-elevated p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="planName">Plan Name *</Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., Weight Loss Meal Plan"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (weeks)</Label>
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
              <Label>Description</Label>
              <Input
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Brief description..."
                className="bg-background border-border"
              />
            </div>
          </div>
        </div>

        {/* Macro Targets */}
        <div className="card-elevated p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Daily Macro Targets</h3>
            </div>
            {canUseAI && <AIMacroCalculator onMacrosCalculated={handleMacrosCalculated} />}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-primary">Calories</Label>
              <Input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(parseInt(e.target.value) || 0)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">Protein (g)</Label>
              <Input
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(parseInt(e.target.value) || 0)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-yellow-400">Carbs (g)</Label>
              <Input
                type="number"
                value={targetCarbs}
                onChange={(e) => setTargetCarbs(parseInt(e.target.value) || 0)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-blue-400">Fat (g)</Label>
              <Input
                type="number"
                value={targetFat}
                onChange={(e) => setTargetFat(parseInt(e.target.value) || 0)}
                className="bg-background border-border"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="builder">Meal Builder</TabsTrigger>
            {canUseAI && (
              <TabsTrigger value="ai">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Suggestions
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="builder" className="mt-6">
            {/* Day Selector */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {days.map((day, index) => (
                <Button
                  key={day.id}
                  variant={selectedDayIndex === index ? "default" : "outline"}
                  onClick={() => setSelectedDayIndex(index)}
                  className="shrink-0"
                >
                  {day.name}
                </Button>
              ))}
              <Button variant="outline" onClick={addDay} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Food Library */}
              <div className="lg:col-span-1 h-[600px]">
                <FoodLibrary onAddFood={(food) => addFoodToMeal(food, 0)} />
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
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onUpdateMeal={(updatedMeal) => updateMeal(index, updatedMeal)}
                      onDeleteMeal={() => deleteMeal(index)}
                    />
                  ))}
                </div>

                {/* Add Meal Button */}
                <Button variant="outline" className="w-full" onClick={addMeal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meal
                </Button>
              </div>
            </div>
          </TabsContent>

          {canUseAI && (
            <TabsContent value="ai" className="mt-6">
              <div className="max-w-2xl mx-auto">
                <AIMealSuggestion
                  targetCalories={targetCalories}
                  targetProtein={targetProtein}
                  targetCarbs={targetCarbs}
                  targetFat={targetFat}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Create Food Modal */}
        {coachProfileId && (
          <CreateFoodModal
            open={createFoodOpen}
            onOpenChange={setCreateFoodOpen}
            coachId={coachProfileId}
          />
        )}
      </FeatureGate>
    </DashboardLayout>
  );
};

export default CoachNutritionBuilder;
