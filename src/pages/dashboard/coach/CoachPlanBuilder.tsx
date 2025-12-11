import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Dumbbell,
  Apple,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const exerciseLibrary = [
  { id: "1", name: "Barbell Squat", category: "Legs", equipment: "Barbell" },
  { id: "2", name: "Bench Press", category: "Chest", equipment: "Barbell" },
  { id: "3", name: "Deadlift", category: "Back", equipment: "Barbell" },
  { id: "4", name: "Pull-ups", category: "Back", equipment: "Bodyweight" },
  { id: "5", name: "Shoulder Press", category: "Shoulders", equipment: "Dumbbell" },
  { id: "6", name: "Lunges", category: "Legs", equipment: "Bodyweight" },
  { id: "7", name: "Plank", category: "Core", equipment: "Bodyweight" },
  { id: "8", name: "Bicep Curls", category: "Arms", equipment: "Dumbbell" },
];

const CoachPlanBuilder = () => {
  const [searchParams] = useSearchParams();
  const isNutrition = searchParams.get("type") === "nutrition";
  
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [duration, setDuration] = useState("4");
  const [level, setLevel] = useState("beginner");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const [workoutDays, setWorkoutDays] = useState([
    {
      name: "Day 1 - Upper Body",
      exercises: [
        { id: "1", name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
        { id: "2", name: "Pull-ups", sets: 3, reps: "8-12", rest: "60s" },
      ],
    },
    {
      name: "Day 2 - Lower Body",
      exercises: [
        { id: "3", name: "Barbell Squat", sets: 4, reps: "6-8", rest: "120s" },
        { id: "4", name: "Lunges", sets: 3, reps: "12 each", rest: "60s" },
      ],
    },
    {
      name: "Day 3 - Rest",
      exercises: [],
    },
  ]);

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
              {isNutrition ? "Create Nutrition Plan" : "Create Workout Plan"}
            </h1>
            <p className="text-muted-foreground">Design a personalized plan for your clients</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card-elevated p-6">
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
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Day
              </Button>
            </div>

            {workoutDays.map((day, dayIndex) => (
              <div key={dayIndex} className="card-elevated overflow-hidden">
                <button
                  onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
                  className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                    <span className="font-medium text-foreground">{day.name}</span>
                    <Badge variant="outline">{day.exercises.length} exercises</Badge>
                  </div>
                  {expandedDay === dayIndex ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedDay === dayIndex && (
                  <div className="p-4 border-t border-border bg-secondary/20">
                    <div className="mb-4">
                      <Input
                        value={day.name}
                        onChange={(e) => {
                          const updated = [...workoutDays];
                          updated[dayIndex].name = e.target.value;
                          setWorkoutDays(updated);
                        }}
                        className="font-medium"
                      />
                    </div>

                    {/* Exercises */}
                    <div className="space-y-3">
                      {day.exercises.map((exercise, exerciseIndex) => (
                        <div
                          key={exerciseIndex}
                          className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <Dumbbell className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{exercise.name}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Input
                              value={exercise.sets}
                              className="w-16 h-8 text-center"
                              placeholder="Sets"
                            />
                            <span className="text-muted-foreground">×</span>
                            <Input
                              value={exercise.reps}
                              className="w-20 h-8 text-center"
                              placeholder="Reps"
                            />
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <Input
                                value={exercise.rest}
                                className="w-16 h-8 text-center"
                                placeholder="Rest"
                              />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      <Button variant="outline" className="w-full border-dashed">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Exercise
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Exercise Library */}
        <div className="space-y-6">
          <div className="card-elevated p-4">
            <h3 className="font-display font-bold text-foreground mb-4">Exercise Library</h3>
            <Input placeholder="Search exercises..." className="mb-4" />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {exerciseLibrary.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">{exercise.category}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="card-elevated p-4">
            <h3 className="font-display font-bold text-foreground mb-2">Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Drag and drop to reorder exercises</li>
              <li>• Include rest days for recovery</li>
              <li>• Consider progressive overload</li>
              <li>• Balance muscle groups</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachPlanBuilder;
