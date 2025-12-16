import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, Calendar, Loader2, FileX } from "lucide-react";

interface PlanAssignment {
  id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  plan: {
    id: string;
    name: string;
    description: string | null;
    plan_type: string;
    duration_weeks: number | null;
  };
  coach: {
    display_name: string | null;
  };
}

const ClientPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("plan_assignments")
        .select(`
          id,
          status,
          start_date,
          end_date,
          plan:training_plans!plan_assignments_plan_id_fkey (
            id,
            name,
            description,
            plan_type,
            duration_weeks
          ),
          coach:coach_profiles!plan_assignments_coach_id_fkey (
            display_name
          )
        `)
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false });

      setPlans((data as unknown as PlanAssignment[]) || []);
      setLoading(false);
    };

    fetchPlans();
  }, [user]);

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
      title="My Plans"
      description="View your assigned training and nutrition plans"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Plans</h1>
        <p className="text-muted-foreground">
          {plans.filter((p) => p.status === "active").length} active plan
          {plans.filter((p) => p.status === "active").length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No plans assigned</h3>
            <p className="text-muted-foreground">
              Your coach will assign training plans to help you reach your goals.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((assignment) => {
            const progress = calculateProgress(
              assignment.start_date,
              assignment.end_date
            );
            return (
              <Card key={assignment.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {assignment.plan.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        by {assignment.coach.display_name || "Coach"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getPlanTypeBadge(assignment.plan.plan_type)}
                      <Badge
                        variant={assignment.status === "active" ? "default" : "secondary"}
                      >
                        {assignment.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {assignment.plan.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {assignment.plan.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {assignment.plan.duration_weeks && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClipboardList className="w-4 h-4" />
                        <span>{assignment.plan.duration_weeks} weeks</span>
                      </div>
                    )}

                    {assignment.start_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Started {format(new Date(assignment.start_date), "PP")}
                        </span>
                      </div>
                    )}

                    {assignment.status === "active" && assignment.start_date && assignment.end_date && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientPlans;
