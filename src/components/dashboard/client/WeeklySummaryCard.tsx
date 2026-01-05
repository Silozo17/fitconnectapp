import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Footprints,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyData {
  habitsCompleted: number;
  habitTotal: number;
  habitCompletionRate: number;
  workoutsLogged: number;
  avgSteps: number;
  avgSleep: number;
  nutritionEntries: number;
  weekOverWeekChange: {
    habits: number;
    workouts: number;
    steps: number;
  };
}

interface WeeklySummaryData {
  summary: string;
  highlights: string[];
  improvements: string[];
  weeklyData: WeeklyData;
}

export function WeeklySummaryCard({ className }: { className?: string }) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Cache key for localStorage
  const cacheKey = `weekly-summary-${user?.id}`;
  
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["weekly-client-summary", user?.id],
    queryFn: async (): Promise<WeeklySummaryData | null> => {
      const { data, error } = await supabase.functions.invoke("generate-weekly-client-summary");
      if (error) throw error;
      // Cache to localStorage for faster subsequent loads
      if (data) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data, cachedAt: Date.now() }));
        } catch { /* ignore storage errors */ }
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - weekly data doesn't change often
    gcTime: 48 * 60 * 60 * 1000, // Keep in cache for 48 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Use cached data as placeholder for instant render
    placeholderData: () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, cachedAt } = JSON.parse(cached);
          // Use cache if less than 24 hours old
          if (Date.now() - cachedAt < 24 * 60 * 60 * 1000) {
            return data;
          }
        }
      } catch { /* ignore */ }
      return undefined;
    },
  });

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted/30 rounded-2xl p-4">
              <ShimmerSkeleton className="h-4 w-8 mb-2" />
              <ShimmerSkeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { summary, highlights, improvements, weeklyData } = data;

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="w-3 h-3 text-success" />;
    if (value < 0) return <TrendingDown className="w-3 h-3 text-destructive" />;
    return null;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main AI Summary Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />
        
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <Badge variant="outline" className="text-xs">AI Summary</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn("w-4 h-4", isRefetching && "animate-spin")} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>

        {/* Expandable section */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between mt-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-xs text-muted-foreground">
            {isExpanded ? "Show less" : "View highlights & insights"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {isExpanded && (
          <div className="space-y-3 animate-fade-in mt-3 pt-3 border-t border-border/50">
            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-foreground mb-2">Highlights</h4>
                <div className="space-y-1">
                  {highlights.map((highlight, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-success">✓</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {improvements.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-foreground mb-2">Focus Areas</h4>
                <div className="space-y-1">
                  {improvements.map((improvement, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-warning">→</span>
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards - 4 separate small cards matching HealthMetricCard style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Habits */}
        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-primary/20">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <TrendIcon value={weeklyData.weekOverWeekChange.habits} />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {weeklyData.habitCompletionRate}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Habits</div>
        </div>

        {/* Avg Steps */}
        <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-4 border border-blue-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/60 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Footprints className="w-4 h-4 text-blue-400" />
            </div>
            <TrendIcon value={weeklyData.weekOverWeekChange.steps} />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {weeklyData.avgSteps >= 1000
              ? `${(weeklyData.avgSteps / 1000).toFixed(1)}k`
              : weeklyData.avgSteps}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Avg Steps</div>
        </div>

        {/* Workouts */}
        <div className="relative bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-4 border border-green-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400/60 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-green-500/20">
              <Dumbbell className="w-4 h-4 text-green-400" />
            </div>
            <TrendIcon value={weeklyData.weekOverWeekChange.workouts} />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {weeklyData.workoutsLogged}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Workouts</div>
        </div>

        {/* Nutrition Entries */}
        <div className="relative bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl p-4 border border-orange-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400/60 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-orange-500/20">
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {weeklyData.nutritionEntries || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Meals Logged</div>
        </div>
      </div>
    </div>
  );
}

// Export summary for sentinel description
export function useWeeklySummary() {
  const { user } = useAuth();
  const cacheKey = `weekly-summary-${user?.id}`;
  
  const { data } = useQuery({
    queryKey: ["weekly-client-summary", user?.id],
    queryFn: async (): Promise<WeeklySummaryData | null> => {
      const { data, error } = await supabase.functions.invoke("generate-weekly-client-summary");
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return data?.summary || null;
}

export default WeeklySummaryCard;
