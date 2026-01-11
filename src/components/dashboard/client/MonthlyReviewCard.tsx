import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { ContentSection } from "@/components/shared/ContentSection";
import { 
  Dumbbell,
  Target,
  Footprints,
  Trophy,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subMonths } from "date-fns";
import { parseSimpleMarkdown } from "@/lib/markdown-utils";

interface MonthlyReviewData {
  period: { start: string; end: string };
  weight: { start: number | null; end: number | null; change: number | null };
  habits: { totalCompleted: number; completionRate: number };
  workouts: { count: number; totalMinutes: number };
  nutrition: { avgCalories: number; avgProtein: number };
  health: { avgSteps: number; avgSleep: number; avgActiveMinutes: number };
  challenges: { completed: number; xpEarned: number };
  streak: { current: number; best: number };
}

interface MonthlyReviewCardProps {
  className?: string;
}

export const MonthlyReviewCard = memo(function MonthlyReviewCard({ className }: MonthlyReviewCardProps) {
  const { user } = useAuth();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["monthly-review", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-monthly-client-review");
      if (error) throw error;
      return data as { data: MonthlyReviewData; aiSummary: string | null };
    },
    enabled: !!user?.id,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-muted/30 rounded-2xl p-5">
          <ShimmerSkeleton className="h-20 w-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

  if (error || !data?.data) return null;

  const { data: review, aiSummary } = data;

  return (
    <div className={cn("space-y-3", className)}>
      {/* AI Summary Card */}
      {aiSummary && (
        <ContentSection colorTheme="primary">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <Badge variant="outline" className="text-xs">AI Review</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching} className="h-8 w-8">
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
          </div>
          <div 
            className="text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(aiSummary) }}
          />
        </ContentSection>
      )}

      {/* Stats Cards - 4 separate small cards matching HealthMetricCard style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Workouts */}
        <div className="relative bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-4 border border-green-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400/60 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-green-500/20">
              <Dumbbell className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{review.workouts.count}</div>
          <div className="text-xs text-muted-foreground mt-1">Workouts</div>
        </div>

        {/* Habits */}
        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-primary/20">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{review.habits.completionRate}%</div>
          <div className="text-xs text-muted-foreground mt-1">Habits</div>
        </div>

        {/* Avg Steps */}
        <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-4 border border-blue-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/60 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Footprints className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{(review.health.avgSteps / 1000).toFixed(1)}k</div>
          <div className="text-xs text-muted-foreground mt-1">Avg Steps</div>
        </div>

        {/* XP Earned */}
        <div className="relative bg-gradient-to-br from-yellow-500/10 to-amber-600/5 rounded-2xl p-4 border border-yellow-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400/60 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-yellow-500/20">
              <Trophy className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{review.challenges.xpEarned}</div>
          <div className="text-xs text-muted-foreground mt-1">XP Earned</div>
        </div>
      </div>
    </div>
  );
});

// Export for sentinel description
export function useMonthlyReviewTitle() {
  const monthName = format(subMonths(new Date(), 1), "MMMM yyyy");
  return `Monthly Review ${monthName}`;
}

export function useMonthlyReviewSummary() {
  const { user } = useAuth();
  
  const { data } = useQuery({
    queryKey: ["monthly-review", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-monthly-client-review");
      if (error) throw error;
      return data as { data: MonthlyReviewData; aiSummary: string | null };
    },
    enabled: !!user?.id,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Extract first sentence or first 80 chars of AI summary
  if (data?.aiSummary) {
    const firstSentence = data.aiSummary.split(/[.!?]/)[0];
    return firstSentence.length > 80 ? firstSentence.substring(0, 77) + "..." : firstSentence + "!";
  }
  return null;
}

export default MonthlyReviewCard;
