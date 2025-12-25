import { useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileX, Loader2, Calendar, ClipboardList, AlertCircle, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useMyPlans } from "@/hooks/useMyPlans";
import { useClientBadges } from "@/hooks/useSidebarBadges";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";

const ClientPlans = () => {
  const { data: plans = [], isLoading, error, refetch } = useMyPlans();
  const { markPlansViewed } = useClientBadges();

  // Mark plans as viewed when page loads
  useEffect(() => {
    markPlansViewed();
  }, [markPlansViewed]);

  const calculateProgress = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getPlanTypeBadge = (type: string) => {
    const variants: Record<string, "lime" | "purple" | "default"> = {
      workout: "lime",
      nutrition: "default",
      hybrid: "purple",
    };
    return (
      <Badge variant={variants[type] || "default"} className="capitalize">
        {type}
      </Badge>
    );
  };

  return (
    <ClientDashboardLayout
      title="My Plans"
      description="View your assigned training and nutrition plans"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">My Plans</h1>
        <p className="text-muted-foreground text-lg mt-1">
          {plans.filter((p) => p.status === "active").length} active plan
          {plans.filter((p) => p.status === "active").length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6 rounded-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load plans. Please try again.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-3xl">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <ShimmerSkeleton className="h-6 w-40" />
                    <ShimmerSkeleton className="h-4 w-24" />
                  </div>
                  <ShimmerSkeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ShimmerSkeleton className="h-4 w-full" />
                <ShimmerSkeleton className="h-4 w-3/4" />
                <ShimmerSkeleton className="h-3 w-full rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        /* Empty State */
        <Card className="rounded-3xl border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
              <FileX className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display">No plans assigned</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-lg">
              Your coach will assign training plans to help you reach your goals.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Plans Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map((assignment) => {
            const progress = calculateProgress(
              assignment.start_date,
              assignment.end_date
            );
            return (
              <Link 
                key={assignment.id} 
                to={`/dashboard/client/plans/${assignment.plan?.id}`}
                className="block"
              >
                <Card className="h-full rounded-3xl hover:shadow-float-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                          {assignment.plan?.name || 'Unnamed Plan'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {assignment.coach?.display_name || "Coach"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getPlanTypeBadge(assignment.plan?.plan_type || 'workout')}
                        <Badge
                          variant={assignment.status === "active" ? "success" : "secondary"}
                          className="capitalize"
                        >
                          {assignment.status || 'unknown'}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {assignment.plan?.description && (
                      <p className="text-muted-foreground mb-5 line-clamp-2">
                        {assignment.plan.description}
                      </p>
                    )}

                    <div className="space-y-4">
                      {assignment.plan?.duration_weeks && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <ClipboardList className="w-4 h-4 text-primary" />
                          </div>
                          <span>{assignment.plan.duration_weeks} weeks program</span>
                        </div>
                      )}

                      {assignment.start_date && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-accent" />
                          </div>
                          <span>Started {format(new Date(assignment.start_date), "PP")}</span>
                        </div>
                      )}

                      {assignment.status === "active" && assignment.start_date && assignment.end_date && (
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2.5 rounded-full" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientPlans;
