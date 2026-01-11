import { Link } from "react-router-dom";
import { Check, Circle, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCoachProfileCompletion } from "@/hooks/useCoachProfileCompletion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const ProfileCompletionCard = () => {
  const { data, isLoading } = useCoachProfileCompletion();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card variant="glass" className="p-4 mb-6">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-2 w-full mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  if (!data) return null;

  // Hide the card entirely when profile is 100% complete
  if (data.isFullyComplete) return null;

  const { percentage, completedSteps, incompleteSteps, isFullyComplete } = data;

  return (
    <Card variant="glass" className="p-4 mb-6">
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Profile Completion</span>
          {isFullyComplete && (
            <span className="px-2 py-0.5 text-xs font-medium bg-success/20 text-success rounded-full">
              Complete!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-bold",
            isFullyComplete ? "text-success" : "text-primary"
          )}>
            {percentage}%
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Progress 
        value={percentage} 
        className={cn("h-2 mt-3", isFullyComplete && "[&>div]:bg-success")} 
      />

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-4 space-y-2">
          {/* Completed Steps */}
          {completedSteps.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-success/5"
            >
              <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-success" />
              </div>
              <span className="text-sm text-muted-foreground line-through flex-1">
                {step.name}
              </span>
            </div>
          ))}

          {/* Incomplete Steps */}
          {incompleteSteps.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="w-5 h-5 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                <Circle className="w-3 h-3 text-muted-foreground/50" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">{step.name}</span>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              <Link to={step.link}>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  {step.linkText}
                </Button>
              </Link>
            </div>
          ))}

          {/* Badge Reward Banner */}
          {!isFullyComplete && (
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Complete your profile to earn the "Profile Pro" badge!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {incompleteSteps.length} step{incompleteSteps.length !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              </div>
            </div>
          )}

          {isFullyComplete && (
            <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Congratulations! You've earned the "Profile Pro" badge!
                  </p>
                  <Link to="/dashboard/coach/achievements" className="text-xs text-primary hover:underline">
                    View your achievements →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
