import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { useMuscleRecovery } from "@/hooks/useMuscleRecovery";
import { Activity, CheckCircle2, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MuscleRecoveryWidgetProps {
  className?: string;
}

const muscleEmoji: Record<string, string> = {
  chest: '🏋️',
  back: '🔙',
  shoulders: '💪',
  quads: '🦵',
  hamstrings: '🦿',
  glutes: '🍑',
  biceps: '💪',
  triceps: '💪',
  core: '🎯',
  calves: '🦶',
};

export function MuscleRecoveryWidget({ className }: MuscleRecoveryWidgetProps) {
  const { muscleStatus, readyToTrain, stillRecovering, isLoading, hasData } = useMuscleRecovery();

  if (isLoading) {
    return (
      <Card variant="elevated" className={cn("rounded-3xl", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <ShimmerSkeleton className="h-10 w-10 rounded-2xl" />
            <ShimmerSkeleton className="h-5 w-36" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <ShimmerSkeleton className="h-4 w-24" />
              <ShimmerSkeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Only show muscles that have been trained
  const trainedMuscles = muscleStatus.filter(m => m.lastTrained !== null);
  
  if (trainedMuscles.length === 0) {
    return null;
  }

  return (
    <Card variant="elevated" className={cn("rounded-3xl overflow-hidden", className)}>
      {/* Gradient accent */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10">
              <Activity className="w-4 h-4 text-cyan-500" />
            </div>
            Muscle Recovery
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {readyToTrain.filter(m => m.lastTrained).length} ready
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ready to train */}
        {readyToTrain.filter(m => m.lastTrained).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-success">Ready to train</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {readyToTrain.filter(m => m.lastTrained).map(m => (
                <Badge 
                  key={m.muscle}
                  variant="outline"
                  className="bg-success/10 text-success border-success/20 capitalize"
                >
                  {muscleEmoji[m.muscle] || '💪'} {m.muscle}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Still recovering */}
        {stillRecovering.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-warning">Recovering</span>
            </div>
            
            {stillRecovering.slice(0, 4).map(m => (
              <div key={m.muscle} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize text-foreground">
                    {muscleEmoji[m.muscle] || '💪'} {m.muscle}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.recoveryPercent}%
                  </span>
                </div>
                <Progress 
                  value={m.recoveryPercent} 
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground">
                  {m.suggestedWait > 0 
                    ? `~${Math.round(m.suggestedWait)}h until recovered`
                    : 'Almost ready'
                  }
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Suggestion */}
        {readyToTrain.filter(m => m.lastTrained).length > 0 && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-primary mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Today's suggestion: </span>
                Train {readyToTrain.filter(m => m.lastTrained).slice(0, 2).map(m => m.muscle).join(' + ')} for optimal results.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
