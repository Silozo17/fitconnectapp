import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Dumbbell,
  Apple,
  Copy,
  Edit,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useTrainingPlans, useDeleteTrainingPlan, TrainingPlan } from "@/hooks/useTrainingPlans";
import { useCoachProfileId } from "@/hooks/useCoachProfileId";
import { format } from "date-fns";

const CoachPlans = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [planToDelete, setPlanToDelete] = useState<TrainingPlan | null>(null);

  // Use cached coach profile ID
  const { data: coachProfileId, isLoading: loadingProfile } = useCoachProfileId();

  const { data: plans = [], isLoading: loadingPlans } = useTrainingPlans(coachProfileId || undefined);
  const deletePlanMutation = useDeleteTrainingPlan();

  const isLoading = loadingProfile || loadingPlans;

  // Filter plans by type
  const workoutPlans = plans.filter(p => p.plan_type === "workout");
  const nutritionPlans = plans.filter(p => p.plan_type === "nutrition");

  // Filter by search
  const filterPlans = (planList: TrainingPlan[]) => {
    if (!searchQuery.trim()) return planList;
    return planList.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleEditPlan = (plan: TrainingPlan) => {
    if (plan.plan_type === "nutrition") {
      navigate(`/dashboard/coach/plans/nutrition/${plan.id}`);
    } else {
      navigate(`/dashboard/coach/plans/${plan.id}`);
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    await deletePlanMutation.mutateAsync(planToDelete.id);
    setPlanToDelete(null);
  };

  const handleDuplicatePlan = (plan: TrainingPlan) => {
    // Navigate to create page with plan data as query params (simplified for now)
    if (plan.plan_type === "nutrition") {
      navigate(`/dashboard/coach/plans/nutrition/new?duplicate=${plan.id}`);
    } else {
      navigate(`/dashboard/coach/plans/new?duplicate=${plan.id}`);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Training Plans" description="Create and manage your training and nutrition plans.">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Training Plans" description="Create and manage your training and nutrition plans.">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Training Plans</h1>
          <p className="text-muted-foreground">Create, manage, and assign workout and nutrition plans</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/coach/plans/new">
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{workoutPlans.length}</p>
              <p className="text-sm text-muted-foreground">Workout Plans</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Apple className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{nutritionPlans.length}</p>
              <p className="text-sm text-muted-foreground">Nutrition Plans</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Active Assignments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workout" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="workout">Workout Plans</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition Plans</TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Workout Plans Tab */}
        <TabsContent value="workout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterPlans(workoutPlans).map((plan) => (
              <div key={plan.id} className="card-elevated p-6 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicatePlan(plan)}>
                        <Copy className="w-4 h-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem><Users className="w-4 h-4 mr-2" /> Assign</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setPlanToDelete(plan)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  {plan.duration_weeks && (
                    <Badge variant="outline">{plan.duration_weeks} weeks</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3 h-3" /> {Array.isArray(plan.content) ? plan.content.reduce((acc, day) => acc + (day.exercises?.length || 0), 0) : 0} exercises
                    </span>
                  </div>
                  <span>{format(new Date(plan.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>
            ))}

            {/* Create New Card */}
            <Link to="/dashboard/coach/plans/new">
              <div className="card-elevated p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-[200px] cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-foreground">Create New Plan</p>
                <p className="text-sm text-muted-foreground">Build a custom workout plan</p>
              </div>
            </Link>
          </div>

          {filterPlans(workoutPlans).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No workout plans found. Create your first one!
            </div>
          )}
        </TabsContent>

        {/* Nutrition Plans Tab */}
        <TabsContent value="nutrition">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterPlans(nutritionPlans).map((plan) => {
              const content = plan.content as any;
              const targetCalories = content?.targets?.calories;
              return (
                <div key={plan.id} className="card-elevated p-6 hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <Apple className="w-6 h-6 text-success" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePlan(plan)}>
                          <Copy className="w-4 h-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem><Users className="w-4 h-4 mr-2" /> Assign</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setPlanToDelete(plan)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    {targetCalories && (
                      <Badge variant="outline">{targetCalories} kcal</Badge>
                    )}
                    {plan.duration_weeks && (
                      <Badge variant="outline">{plan.duration_weeks} weeks</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Apple className="w-3 h-3" /> {Array.isArray(content?.days) ? content.days.length : 0} days
                    </span>
                    <span>{format(new Date(plan.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
              );
            })}

            {/* Create New Card */}
            <Link to="/dashboard/coach/plans/nutrition/new">
              <div className="card-elevated p-6 border-2 border-dashed border-border hover:border-success/50 transition-colors flex flex-col items-center justify-center min-h-[200px] cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-success" />
                </div>
                <p className="font-medium text-foreground">Create Nutrition Plan</p>
                <p className="text-sm text-muted-foreground">Build a custom meal plan</p>
              </div>
            </Link>
          </div>

          {filterPlans(nutritionPlans).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No nutrition plans found. Create your first one!
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{planToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CoachPlans;
