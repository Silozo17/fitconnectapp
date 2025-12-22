import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Save, Eye, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ExerciseLibrary from "@/components/planbuilder/ExerciseLibrary";
import WorkoutDayCard from "@/components/planbuilder/WorkoutDayCard";
import CreateExerciseModal from "@/components/planbuilder/CreateExerciseModal";
import { AIWorkoutGenerator } from "@/components/ai/AIWorkoutGenerator";
import { FeatureGate } from "@/components/FeatureGate";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useCreateTrainingPlan, useUpdateTrainingPlan, useTrainingPlan, PlanDay, PlanExercise } from "@/hooks/useTrainingPlans";
import { Exercise } from "@/hooks/useExercises";
import { WorkoutPlan } from "@/hooks/useAI";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

const CoachPlanBuilder = () => {
  const { t } = useTranslation("coach");
  const [searchParams] = useSearchParams();
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasFeature } = useFeatureAccess();
  const isNutrition = searchParams.get("type") === "nutrition";
  const isEditing = !!planId;

  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [duration, setDuration] = useState("4");
  const [level, setLevel] = useState("beginner");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  const [showCreateExercise, setShowCreateExercise] = useState(false);

  const [workoutDays, setWorkoutDays] = useState<PlanDay[]>([
    { id: generateId(), name: "Day 1 - Push", exercises: [] },
    { id: generateId(), name: "Day 2 - Pull", exercises: [] },
    { id: generateId(), name: "Day 3 - Legs", exercises: [] },
  ]);

  const { data: existingPlan, isLoading: planLoading } = useTrainingPlan(planId);
  const createPlan = useCreateTrainingPlan();
  const updatePlan = useUpdateTrainingPlan();

  // Fetch coach profile ID
  useEffect(() => {
    const fetchCoachProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (data) setCoachProfileId(data.id);
    };
    fetchCoachProfile();
  }, [user?.id]);

  // Load existing plan data
  useEffect(() => {
    if (existingPlan) {
      setPlanName(existingPlan.name);
      setPlanDescription(existingPlan.description || "");
      setDuration(existingPlan.duration_weeks?.toString() || "4");
      setWorkoutDays(existingPlan.content || []);
    }
  }, [existingPlan]);

  function generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  const handleAIPlanGenerated = (plan: WorkoutPlan) => {
    setPlanName(plan.planName);
    setPlanDescription(plan.description);
    const newDays: PlanDay[] = plan.days.map((day) => ({
      id: generateId(),
      name: day.name,
      exercises: day.exercises.map((ex) => ({
        id: generateId(),
        exercise_id: "",
        exercise_name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        rest: ex.rest,
        notes: ex.notes,
      })),
    }));
    setWorkoutDays(newDays);
    toast.success(t("workoutBuilder.aiPlanLoaded"));
  };

  const handleAddDay = () => {
    const newDay: PlanDay = {
      id: generateId(),
      name: `Day ${workoutDays.length + 1}`,
      exercises: [],
    };
    setWorkoutDays([...workoutDays, newDay]);
    setExpandedDay(workoutDays.length);
  };

  const handleUpdateDay = (dayIndex: number, updates: Partial<PlanDay>) => {
    const newDays = [...workoutDays];
    newDays[dayIndex] = { ...newDays[dayIndex], ...updates };
    setWorkoutDays(newDays);
  };

  const handleDeleteDay = (dayIndex: number) => {
    const newDays = workoutDays.filter((_, i) => i !== dayIndex);
    setWorkoutDays(newDays);
    if (expandedDay === dayIndex) setExpandedDay(null);
  };

  const handleAddExerciseToDay = (exercise: Exercise) => {
    if (addingToDay === null) {
      toast.error(t("workoutBuilder.selectDayFirst"));
      return;
    }

    const newExercise: PlanExercise = {
      id: generateId(),
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: 3,
      reps: "8-12",
      rest: "60s",
      video_url: exercise.video_url || undefined,
    };

    const newDays = [...workoutDays];
    newDays[addingToDay].exercises.push(newExercise);
    setWorkoutDays(newDays);
    toast.success(t("workoutBuilder.addedExercise", { exercise: exercise.name, day: newDays[addingToDay].name }));
  };

  const handleSave = async () => {
    if (!coachProfileId) {
      toast.error(t("workoutBuilder.coachNotFound"));
      return;
    }

    if (!planName.trim()) {
      toast.error(t("workoutBuilder.planNameRequired"));
      return;
    }

    const planData = {
      coach_id: coachProfileId,
      name: planName,
      description: planDescription || undefined,
      plan_type: isNutrition ? "nutrition" : "workout",
      duration_weeks: parseInt(duration),
      content: workoutDays,
      is_template: false,
    };

    try {
      if (isEditing && planId) {
        await updatePlan.mutateAsync({ id: planId, ...planData });
      } else {
        await createPlan.mutateAsync(planData);
      }
      navigate("/dashboard/coach/plans");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isSaving = createPlan.isPending || updatePlan.isPending;
  const canUseAI = hasFeature("ai_workout_generator");

  return (
    <DashboardLayout title={t("workoutBuilder.title")} description={t("workoutBuilder.pageDescription")}>
      <FeatureGate feature="workout_plan_builder">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/coach/plans">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {isEditing ? t("workoutBuilder.editPlan") : isNutrition ? t("workoutBuilder.createNutrition") : t("workoutBuilder.createWorkout")}
              </h1>
              <p className="text-muted-foreground">{t("workoutBuilder.designPlan")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {canUseAI && <AIWorkoutGenerator onPlanGenerated={handleAIPlanGenerated} />}
            <Button variant="outline" disabled>
              <Eye className="w-4 h-4 mr-2" />
              {t("workoutBuilder.preview")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? t("workoutBuilder.updatePlan") : t("workoutBuilder.savePlan")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card-glow rounded-2xl p-6">
              <h2 className="font-display font-bold text-foreground mb-4">{t("workoutBuilder.planDetails")}</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("workoutBuilder.planName")}</Label>
                  <Input
                    id="name"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder={t("workoutBuilder.planNamePlaceholder")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">{t("workoutBuilder.descriptionLabel")}</Label>
                  <Textarea
                    id="description"
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    placeholder={t("workoutBuilder.descriptionPlaceholder")}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("workoutBuilder.durationWeeks")}</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">{t("workoutBuilder.weeks4")}</SelectItem>
                        <SelectItem value="6">{t("workoutBuilder.weeks6")}</SelectItem>
                        <SelectItem value="8">{t("workoutBuilder.weeks8")}</SelectItem>
                        <SelectItem value="12">{t("workoutBuilder.weeks12")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("workoutBuilder.difficultyLevel")}</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">{t("workoutBuilder.beginner")}</SelectItem>
                        <SelectItem value="intermediate">{t("workoutBuilder.intermediate")}</SelectItem>
                        <SelectItem value="advanced">{t("workoutBuilder.advanced")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Workout Days */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-foreground">{t("workoutBuilder.weeklySchedule")}</h2>
                <Button variant="outline" size="sm" onClick={handleAddDay}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("workoutBuilder.addDay")}
                </Button>
              </div>

              {workoutDays.map((day, dayIndex) => (
                <WorkoutDayCard
                  key={day.id}
                  day={day}
                  isExpanded={expandedDay === dayIndex}
                  onToggleExpand={() => {
                    setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
                    setAddingToDay(dayIndex);
                  }}
                  onUpdateDay={(updates) => handleUpdateDay(dayIndex, updates)}
                  onDeleteDay={() => handleDeleteDay(dayIndex)}
                  onAddExercise={() => setAddingToDay(dayIndex)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add to Day Indicator */}
            {addingToDay !== null && (
              <div className="card-glow rounded-2xl p-4 bg-primary/5 border-primary/20">
                <p className="text-sm text-primary font-medium">
                  {t("workoutBuilder.addingTo")} <span className="font-bold">{workoutDays[addingToDay]?.name}</span>
                </p>
              </div>
            )}

            {/* Exercise Library */}
            {coachProfileId && (
              <ExerciseLibrary
                onAddExercise={handleAddExerciseToDay}
                onCreateCustom={() => setShowCreateExercise(true)}
              />
            )}

            {/* Tips */}
            <div className="card-glow rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-foreground">{t("workoutBuilder.tips")}</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• {t("workoutBuilder.tip1")}</li>
                <li>• {t("workoutBuilder.tip2")}</li>
                <li>• {t("workoutBuilder.tip3")}</li>
                <li>• {t("workoutBuilder.tip4")}</li>
                <li>• {t("workoutBuilder.tip5")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Create Exercise Modal */}
        {coachProfileId && (
          <CreateExerciseModal
            open={showCreateExercise}
            onOpenChange={setShowCreateExercise}
            coachId={coachProfileId}
          />
        )}
      </FeatureGate>
    </DashboardLayout>
  );
};

export default CoachPlanBuilder;
