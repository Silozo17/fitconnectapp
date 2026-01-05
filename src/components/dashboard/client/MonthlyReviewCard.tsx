import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
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

export function MonthlyReviewCard({ className }: MonthlyReviewCardProps) {
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
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />
          
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <Badge variant="outline" className="text-xs">AI Review</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching} className="h-8 w-8">
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
          </div>
          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{aiSummary}</p>
        </div>
      )}

      {/* Stats Cards - 4 separate small cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Workouts */}
        <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <Dumbbell className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{review.workouts.count}</div>
          <div className="text-xs text-muted-foreground mt-1">Workouts</div>
        </div>

        {/* Habits */}
        <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{review.habits.completionRate}%</div>
          <div className="text-xs text-muted-foreground mt-1">Habits</div>
        </div>

        {/* Avg Steps */}
        <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <Footprints className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{(review.health.avgSteps / 1000).toFixed(1)}k</div>
          <div className="text-xs text-muted-foreground mt-1">Avg Steps</div>
        </div>

        {/* XP Earned */}
        <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{review.challenges.xpEarned}</div>
          <div className="text-xs text-muted-foreground mt-1">XP Earned</div>
        </div>
      </div>
    </div>
  );
}

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
