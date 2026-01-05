import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AccentCard, AccentCardContent } from "@/components/ui/accent-card";
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

  const cacheKey = `weekly-summary-${user?.id}`;
  
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["weekly-client-summary", user?.id],
    queryFn: async (): Promise<WeeklySummaryData | null> => {
      const { data, error } = await supabase.functions.invoke("generate-weekly-client-summary");
      if (error) throw error;
      if (data) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data, cachedAt: Date.now() }));
        } catch { /* ignore storage errors */ }
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, cachedAt } = JSON.parse(cached);
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
      <AccentCard className={cn("rounded-2xl", className)}>
        <AccentCardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <ShimmerSkeleton className="h-4 w-20" />
          </div>
          <ShimmerSkeleton className="h-4 w-full" />
          <ShimmerSkeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <ShimmerSkeleton className="h-4 w-16" />
                <ShimmerSkeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </AccentCardContent>
      </AccentCard>
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
    <AccentCard className={cn("rounded-2xl", className)}>
      <AccentCardContent className="p-5 space-y-4">
        {/* Header actions */}
        <div className="flex items-center justify-end gap-2">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            AI
          </Badge>
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

        {/* AI Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <TrendIcon value={weeklyData.weekOverWeekChange.habits} />
            </div>
            <div className="text-lg font-bold text-foreground">
              {weeklyData.habitCompletionRate}%
            </div>
            <div className="text-xs text-muted-foreground">Habits</div>
          </div>

          <div className="p-3 rounded-xl bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Footprints className="w-4 h-4 text-primary" />
              <TrendIcon value={weeklyData.weekOverWeekChange.steps} />
            </div>
            <div className="text-lg font-bold text-foreground">
              {weeklyData.avgSteps >= 1000
                ? `${(weeklyData.avgSteps / 1000).toFixed(1)}k`
                : weeklyData.avgSteps}
            </div>
            <div className="text-xs text-muted-foreground">Avg Steps</div>
          </div>

          <div className="p-3 rounded-xl bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <TrendIcon value={weeklyData.weekOverWeekChange.workouts} />
            </div>
            <div className="text-lg font-bold text-foreground">
              {weeklyData.workoutsLogged}
            </div>
            <div className="text-xs text-muted-foreground">Workouts</div>
          </div>
        </div>

        {/* Expandable section */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between"
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
          <div className="space-y-3 animate-fade-in">
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
      </AccentCardContent>
    </AccentCard>
  );
}

export default WeeklySummaryCard;
