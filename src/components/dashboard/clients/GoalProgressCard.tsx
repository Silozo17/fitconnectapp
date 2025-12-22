import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, TrendingUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Goal {
  id: string;
  name: string;
  target: string;
  current: string;
  progress: number;
  unit: string;
  isCompleted: boolean;
}

interface GoalProgressCardProps {
  goal: Goal;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const { t } = useTranslation("coach");

  return (
    <Card className={`bg-card border-border ${goal.isCompleted ? 'border-green-500/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {goal.isCompleted ? (
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <h4 className="font-medium text-foreground">{goal.name}</h4>
              <p className="text-xs text-muted-foreground">
                {t('clientDetail.goals.target')}: {goal.target} {goal.unit}
              </p>
            </div>
          </div>
          {!goal.isCompleted && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-primary font-medium">{goal.progress}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Progress
            value={goal.progress}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('clientDetail.goals.current')}: {goal.current} {goal.unit}</span>
            <span>{t('clientDetail.goals.target')}: {goal.target} {goal.unit}</span>
          </div>
        </div>

        {goal.isCompleted && (
          <div className="mt-3 text-xs text-green-400 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {t('clientDetail.goals.goalAchieved')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
