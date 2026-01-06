import { useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileX, AlertCircle, ChevronRight, Calendar, ClipboardList } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useMyPlans } from "@/hooks/useMyPlans";
import { useClientBadges } from "@/hooks/useSidebarBadges";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { DashboardSectionHeader, ContentSection } from "@/components/shared";

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

  const activePlansCount = plans.filter((p) => p.status === "active").length;

  return (
    <ClientDashboardLayout
      title="My Plans"
      description="View your assigned training and nutrition plans"
    >
      <PageHelpBanner
        pageKey="client_plans"
        title="Your Training Plans"
        description="View workout and nutrition plans assigned by your coach"
      />
      
      <div className="space-y-11">
        {/* Header */}
        <DashboardSectionHeader
          title="My Plans"
          description={`${activePlansCount} active plan${activePlansCount !== 1 ? "s" : ""}`}
          className="mb-0"
        />

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="rounded-2xl">
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
              <ContentSection key={i} colorTheme="primary" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <ShimmerSkeleton className="h-6 w-40" />
                    <ShimmerSkeleton className="h-4 w-24" />
                  </div>
                  <ShimmerSkeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-4">
                  <ShimmerSkeleton className="h-4 w-full" />
                  <ShimmerSkeleton className="h-4 w-3/4" />
                  <ShimmerSkeleton className="h-3 w-full rounded-full" />
                </div>
              </ContentSection>
            ))}
          </div>
        ) : plans.length === 0 ? (
          /* Empty State */
          <ContentSection colorTheme="muted" className="py-16 text-center border-dashed">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
              <FileX className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display">No plans assigned</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-lg">
              Your coach will assign training plans to help you reach your goals.
            </p>
          </ContentSection>
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
                  className="block group"
                >
                  <ContentSection 
                    colorTheme="primary" 
                    className="h-full p-6 hover:shadow-float-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {assignment.plan?.name || 'Unnamed Plan'}
                        </h3>
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
                    
                    {assignment.plan?.description && (
                      <p className="text-muted-foreground mb-5 line-clamp-2">
                        {assignment.plan.description}
                      </p>
                    )}

                    <div className="space-y-4">
                      {assignment.plan?.duration_weeks && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                            <ClipboardList className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-foreground">{assignment.plan.duration_weeks} weeks program</span>
                        </div>
                      )}

                      {assignment.start_date && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-foreground">Started {format(new Date(assignment.start_date), "PP")}</span>
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
                  </ContentSection>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientPlans;
