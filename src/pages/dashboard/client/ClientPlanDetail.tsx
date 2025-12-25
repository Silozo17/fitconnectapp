import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  ClipboardList, 
  AlertCircle,
  Dumbbell,
  Apple
} from "lucide-react";
import { useTrainingPlan } from "@/hooks/useTrainingPlans";
import { useMyPlans } from "@/hooks/useMyPlans";
import WorkoutPlanView from "@/components/plans/WorkoutPlanView";
import NutritionPlanView from "@/components/plans/NutritionPlanView";

const ClientPlanDetail = () => {
  const { planId } = useParams<{ planId: string }>();
  const { data: plan, isLoading: planLoading, error: planError } = useTrainingPlan(planId);
  const { data: assignments = [] } = useMyPlans();
  
  // Find the assignment for this plan to get coach info and dates
  const assignment = assignments.find(a => a.plan?.id === planId);
  
  const calculateProgress = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const progress = assignment ? calculateProgress(assignment.start_date, assignment.end_date) : 0;

  const getPlanTypeIcon = (type: string) => {
    switch (type) {
      case 'nutrition':
        return <Apple className="h-5 w-5" />;
      default:
        return <Dumbbell className="h-5 w-5" />;
    }
  };

  const getPlanTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      workout: "bg-blue-500/10 text-blue-500",
      nutrition: "bg-green-500/10 text-green-500",
      hybrid: "bg-purple-500/10 text-purple-500",
    };
    return (
      <Badge className={colors[type] || "bg-muted text-muted-foreground"}>
        {type}
      </Badge>
    );
  };

  return (
    <ClientDashboardLayout
      title={plan?.name || "Plan Details"}
      description="View your training plan details"
    >
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/dashboard/client/plans">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to My Plans
          </Button>
        </Link>
      </div>

      {planError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load plan details. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {planLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : plan ? (
        <div className="space-y-6">
          {/* Plan Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {getPlanTypeIcon(plan.plan_type)}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    {assignment?.coach?.display_name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        by {assignment.coach.display_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {getPlanTypeBadge(plan.plan_type)}
                  {assignment && (
                    <Badge variant={assignment.status === "active" ? "default" : "secondary"}>
                      {assignment.status}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.description && (
                <p className="text-muted-foreground">{plan.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {plan.duration_weeks && (
                  <div className="flex items-center gap-2 text-sm">
                    <ClipboardList className="w-4 h-4 text-muted-foreground" />
                    <span>{plan.duration_weeks} weeks</span>
                  </div>
                )}
                
                {assignment?.start_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Started {format(new Date(assignment.start_date), "PP")}</span>
                  </div>
                )}

                {assignment?.end_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Ends {format(new Date(assignment.end_date), "PP")}</span>
                  </div>
                )}
              </div>

              {assignment?.status === "active" && assignment.start_date && assignment.end_date && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Content */}
          {plan.plan_type === 'nutrition' ? (
            <NutritionPlanView content={plan.content} />
          ) : (
            <WorkoutPlanView content={plan.content} />
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plan not found</h3>
            <p className="text-muted-foreground">
              This plan may have been removed or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientPlanDetail;
