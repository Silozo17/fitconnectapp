import { useState } from "react";
import { Check, Flame, Undo2, Salad, Dumbbell, Moon, Flower2, Pill, Droplet, Watch, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HabitWithStreak, getHabitCategory, useLogHabit, useUnlogHabit } from "@/hooks/useHabits";

interface TodayHabitCardProps {
  habit: HabitWithStreak;
}

const getCategoryIcon = (iconName: string, className: string = "h-6 w-6") => {
  const icons: Record<string, React.ReactNode> = {
    'Salad': <Salad className={className} />,
    'Dumbbell': <Dumbbell className={className} />,
    'Moon': <Moon className={className} />,
    'Flower2': <Flower2 className={className} />,
    'Pill': <Pill className={className} />,
    'Droplet': <Droplet className={className} />,
    'Check': <Check className={className} />,
  };
  return icons[iconName] || <Check className={className} />;
};

const getVerificationBadge = (verificationType: string | undefined, wearableType: string | null) => {
  if (verificationType === 'wearable_auto') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs gap-1">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Auto-verified by wearable device</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  if (verificationType === 'coach_verified') {
    return (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-xs">
        Coach Verified
      </Badge>
    );
  }
  if (wearableType) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-muted text-muted-foreground text-xs gap-1">
              <Watch className="h-3 w-3" />
              Auto-track
            </Badge>
          </TooltipTrigger>
          <TooltipContent>This habit will auto-complete from your wearable data</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return null;
};

const TodayHabitCard = ({ habit }: TodayHabitCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const logHabit = useLogHabit();
  const unlogHabit = useUnlogHabit();
  
  const category = getHabitCategory(habit.category);
  const isCompleted = !!habit.todayLog;
  const currentStreak = habit.streak?.current_streak || 0;
  
  const handleToggle = async () => {
    if (isCompleted && habit.todayLog) {
      unlogHabit.mutate(habit.todayLog.id);
    } else {
      setIsAnimating(true);
      await logHabit.mutateAsync({ habitId: habit.id });
      setTimeout(() => setIsAnimating(false), 600);
    }
  };
  
  return (
    <Card className={cn(
      "transition-all duration-300",
      isCompleted && "bg-primary/5 border-primary/30",
      isAnimating && "scale-105"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Completion button */}
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shrink-0 transition-all",
              isCompleted && "bg-primary hover:bg-primary/90",
              isAnimating && "animate-pulse"
            )}
            onClick={handleToggle}
            disabled={logHabit.isPending || unlogHabit.isPending}
          >
            {isCompleted ? (
              <Check className="h-6 w-6" />
            ) : (
              <span className={category.color}>{getCategoryIcon(category.icon)}</span>
            )}
          </Button>
          
          {/* Habit info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={cn(
                "font-medium truncate",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {habit.name}
              </h4>
              {currentStreak > 0 && (
                <span className="flex items-center gap-1 text-sm text-orange-500 shrink-0">
                  <Flame className="h-4 w-4" />
                  {currentStreak}
                </span>
              )}
            </div>
            {habit.description && (
              <p className="text-sm text-muted-foreground truncate">
                {habit.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={cn("text-xs", category.color)}>
                {category.label}
              </span>
              {habit.target_count > 1 && (
                <span className="text-xs text-muted-foreground">
                  • {habit.target_count}x daily
                </span>
              )}
              {getVerificationBadge(habit.todayLog?.verification_type, habit.wearable_target_type)}
            </div>
          </div>
          
          {/* Undo button for completed */}
          {isCompleted && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleToggle}
              disabled={unlogHabit.isPending}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayHabitCard;
