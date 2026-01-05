import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AccentCard, AccentCardHeader, AccentCardContent } from "@/components/ui/accent-card";
import { Button } from "@/components/ui/button";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Dumbbell,
  Target,
  Footprints,
  Moon,
  Trophy,
  Flame,
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
      <AccentCard className={cn("rounded-2xl", className)}>
        <AccentCardContent className="p-6">
          <ShimmerSkeleton className="h-6 w-48 mb-4" />
          <ShimmerSkeleton className="h-20 w-full" />
        </AccentCardContent>
      </AccentCard>
    );
  }

  if (error || !data?.data) return null;

  const { data: review, aiSummary } = data;
  const monthName = format(subMonths(new Date(), 1), "MMMM yyyy");

  return (
    <AccentCard className={cn("rounded-2xl", className)}>
      <AccentCardHeader 
        icon={Calendar} 
        title={`Monthly Review: ${monthName}`}
        action={
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>
        }
      />
      <AccentCardContent className="space-y-4">
        {/* AI Summary */}
        {aiSummary && (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground whitespace-pre-line">{aiSummary}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <Dumbbell className="h-4 w-4 text-primary mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground">{review.workouts.count}</div>
            <div className="text-xs text-muted-foreground">Workouts</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <Target className="h-4 w-4 text-primary mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground">{review.habits.completionRate}%</div>
            <div className="text-xs text-muted-foreground">Habits</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <Footprints className="h-4 w-4 text-primary mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground">{(review.health.avgSteps / 1000).toFixed(1)}k</div>
            <div className="text-xs text-muted-foreground">Avg Steps</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <Trophy className="h-4 w-4 text-primary mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground">{review.challenges.xpEarned}</div>
            <div className="text-xs text-muted-foreground">XP Earned</div>
          </div>
        </div>
      </AccentCardContent>
    </AccentCard>
  );
}

export default MonthlyReviewCard;
