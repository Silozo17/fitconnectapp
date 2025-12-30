import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, PartyPopper, Target } from "lucide-react";
import { format } from "date-fns";
import confetti from "canvas-confetti";

interface Milestone {
  id: string;
  label: string;
  targetValue: number;
  reachedAt?: string;
  isReached: boolean;
}

interface GoalMilestoneTrackerProps {
  goalTitle: string;
  milestones: Milestone[];
  currentValue: number;
  targetUnit?: string;
  onCelebrate?: (milestoneId: string) => void;
}

export function GoalMilestoneTracker({ 
  goalTitle,
  milestones, 
  currentValue,
  targetUnit = '',
  onCelebrate 
}: GoalMilestoneTrackerProps) {
  const { t } = useTranslation();

  const handleCelebrate = (milestone: Milestone) => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))'],
    });
    
    onCelebrate?.(milestone.id);
  };

  const reachedCount = milestones.filter(m => m.isReached).length;

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t('goals.milestones', 'Milestones')}
          </CardTitle>
          <Badge variant="outline">
            {reachedCount}/{milestones.length}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{goalTitle}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`p-3 rounded-lg border transition-all ${
                milestone.isReached 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-secondary/50 border-border/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                {milestone.isReached ? (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                {milestone.isReached && onCelebrate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1 -mr-1"
                    onClick={() => handleCelebrate(milestone)}
                  >
                    <PartyPopper className="w-4 h-4 text-warning" />
                  </Button>
                )}
              </div>
              
              <p className="text-sm font-medium text-foreground mb-1">
                {milestone.targetValue}{targetUnit ? ` ${targetUnit}` : ''}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {milestone.label}
              </p>
              
              {milestone.reachedAt ? (
                <p className="text-xs text-success mt-2">
                  {format(new Date(milestone.reachedAt), 'd MMM yyyy')}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  {t('goals.upcoming', 'Upcoming')}
                </p>
              )}
            </div>
          ))}
        </div>

        {milestones.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('goals.noMilestones', 'No milestones set')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
