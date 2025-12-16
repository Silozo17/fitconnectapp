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
import { useAuth } from "@/contexts/AuthContext";
import { useCreateTrainingPlan, useUpdateTrainingPlan, useTrainingPlan, PlanDay, PlanExercise } from "@/hooks/useTrainingPlans";
import { Exercise } from "@/hooks/useExercises";
import { WorkoutPlan } from "@/hooks/useAI";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CoachPlanBuilder = () => {
  const [searchParams] = useSearchParams();
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
    toast.success("AI plan loaded! Review and customize as needed.");
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
      toast.error("Please select a day first");
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
    toast.success(`Added ${exercise.name} to ${newDays[addingToDay].name}`);
  };

  const handleSave = async () => {
    if (!coachProfileId) {
      toast.error("Coach profile not found");
      return;
    }

    if (!planName.trim()) {
      toast.error("Please enter a plan name");
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

  return (
    <DashboardLayout title="Create Plan" description="Build a new training plan.">
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
              {isEditing ? "Edit Plan" : isNutrition ? "Create Nutrition Plan" : "Create Workout Plan"}
            </h1>
            <p className="text-muted-foreground">Design a personalized plan for your clients</p>
          </div>
        </div>
        <div className="flex gap-3">
          <AIWorkoutGenerator onPlanGenerated={handleAIPlanGenerated} />
          <Button variant="outline" disabled>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEditing ? "Update Plan" : "Save Plan"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card-glow rounded-2xl p-6">
            <h2 className="font-display font-bold text-foreground mb-4">Plan Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., Beginner Full Body Program"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Describe the goals and structure of this plan..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (weeks)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 weeks</SelectItem>
                      <SelectItem value="6">6 weeks</SelectItem>
                      <SelectItem value="8">8 weeks</SelectItem>
                      <SelectItem value="12">12 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Workout Days */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-foreground">Weekly Schedule</h2>
              <Button variant="outline" size="sm" onClick={handleAddDay}>
                <Plus className="w-4 h-4 mr-2" />
                Add Day
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
                Adding exercises to: <span className="font-bold">{workoutDays[addingToDay]?.name}</span>
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
              <h3 className="font-display font-bold text-foreground">Tips</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Click a day to start adding exercises</li>
              <li>• Drag exercises to reorder them</li>
              <li>• Include rest days for recovery</li>
              <li>• Consider progressive overload</li>
              <li>• Balance muscle groups across days</li>
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
    </DashboardLayout>
  );
};

export default CoachPlanBuilder;
