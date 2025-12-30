import { useState } from "react";
import { Sparkles, RefreshCw, ChevronRight, TrendingUp, Target, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ClientInsight {
  clientId: string;
  clientName: string;
  insightType: "opportunity" | "concern" | "achievement";
  title: string;
  description: string;
  actionLabel?: string;
}

const insightTypeConfig = {
  opportunity: {
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  concern: {
    icon: AlertCircle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  achievement: {
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
};

function generateInsights(clients: Array<{
  clientId: string;
  clientName: string;
  habitRate: number;
  progressCount: number;
  sessionsCompleted: number;
  daysSinceStart: number;
}>): ClientInsight[] {
  const insights: ClientInsight[] = [];

  for (const client of clients) {
    // High performer - potential to increase intensity
    if (client.habitRate > 80 && client.sessionsCompleted >= 4) {
      insights.push({
        clientId: client.clientId,
        clientName: client.clientName,
        insightType: "opportunity",
        title: "Ready for more challenge",
        description: `${client.clientName} has maintained ${Math.round(client.habitRate)}% habit completion. Consider increasing their workout intensity.`,
        actionLabel: "Adjust plan",
      });
    }

    // Consistent progress logging
    if (client.progressCount >= 4) {
      insights.push({
        clientId: client.clientId,
        clientName: client.clientName,
        insightType: "achievement",
        title: "Consistent tracker",
        description: `${client.clientName} has logged progress ${client.progressCount} times recently. Great accountability!`,
      });
    }

    // Struggling with habits
    if (client.habitRate > 0 && client.habitRate < 40 && client.daysSinceStart > 14) {
      insights.push({
        clientId: client.clientId,
        clientName: client.clientName,
        insightType: "concern",
        title: "Habit struggles",
        description: `${client.clientName}'s habit completion is at ${Math.round(client.habitRate)}%. Consider simplifying their daily goals.`,
        actionLabel: "Review habits",
      });
    }

    // New client doing well
    if (client.daysSinceStart <= 14 && client.habitRate > 60) {
      insights.push({
        clientId: client.clientId,
        clientName: client.clientName,
        insightType: "achievement",
        title: "Strong start",
        description: `${client.clientName} is off to a great start with ${Math.round(client.habitRate)}% habit completion in their first 2 weeks!`,
      });
    }
  }

  return insights.slice(0, 5);
}

export function AIClientInsightsWidget() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ["ai-client-insights", user?.id, refreshKey],
    queryFn: async (): Promise<ClientInsight[]> => {
      if (!user?.id) return [];

      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) return [];

      // Get clients with their stats
      const { data: clients } = await supabase
        .from("coach_clients")
        .select(`
          client_id,
          created_at,
          client_profiles!coach_clients_client_id_fkey (
            first_name,
            last_name,
            username
          )
        `)
        .eq("coach_id", coachProfile.id)
        .eq("status", "active");

      if (!clients || clients.length === 0) return [];

      const now = new Date();
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const clientStats = await Promise.all(
        clients.map(async (client) => {
          const profile = client.client_profiles;
          const clientName = profile
            ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username
            : "Unknown";

          // Get habit completion rate
          const { data: habitLogs } = await supabase
            .from("habit_logs")
            .select("completed_count, client_habits!inner(client_id, target_count)")
            .eq("client_habits.client_id", client.client_id)
            .gte("log_date", twoWeeksAgo.toISOString().split("T")[0]);

          let habitRate = 0;
          if (habitLogs && habitLogs.length > 0) {
            const totalCompleted = habitLogs.reduce((sum, log) => sum + (log.completed_count || 0), 0);
            const totalTarget = habitLogs.reduce((sum, log) => {
              const habits = log.client_habits as unknown as { target_count: number };
              return sum + (habits?.target_count || 1);
            }, 0);
            habitRate = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;
          }

          // Get progress count
          const { count: progressCount } = await supabase
            .from("client_progress")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.client_id)
            .gte("recorded_at", twoWeeksAgo.toISOString());

          // Get completed sessions
          const { count: sessionsCompleted } = await supabase
            .from("coaching_sessions")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.client_id)
            .eq("coach_id", coachProfile.id)
            .eq("status", "completed")
            .gte("scheduled_at", twoWeeksAgo.toISOString());

          const daysSinceStart = Math.floor(
            (now.getTime() - new Date(client.created_at).getTime()) / (24 * 60 * 60 * 1000)
          );

          return {
            clientId: client.client_id,
            clientName,
            habitRate,
            progressCount: progressCount || 0,
            sessionsCompleted: sessionsCompleted || 0,
            daysSinceStart,
          };
        })
      );

      return generateInsights(clientStats);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Insights
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {!insights || insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No insights available yet. Check back when you have more client data.
          </p>
        ) : (
          insights.map((insight, index) => {
            const config = insightTypeConfig[insight.insightType];
            const Icon = config.icon;

            return (
              <div
                key={`${insight.clientId}-${index}`}
                className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-full", config.bgColor)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{insight.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {insight.clientName}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                    {insight.actionLabel && (
                      <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs">
                        {insight.actionLabel}
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
