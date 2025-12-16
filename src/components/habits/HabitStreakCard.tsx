import { Flame, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HabitWithStreak, getStreakMilestone, getHabitCategory } from "@/hooks/useHabits";

interface HabitStreakCardProps {
  habit: HabitWithStreak;
}

const HabitStreakCard = ({ habit }: HabitStreakCardProps) => {
  const currentStreak = habit.streak?.current_streak || 0;
  const longestStreak = habit.streak?.longest_streak || 0;
  const totalCompletions = habit.streak?.total_completions || 0;
  const category = getHabitCategory(habit.category);
  const milestone = getStreakMilestone(currentStreak);
  
  // Calculate progress to next milestone
  const nextMilestone = currentStreak < 3 ? 3 : 
                        currentStreak < 7 ? 7 : 
                        currentStreak < 14 ? 14 : 
                        currentStreak < 30 ? 30 : 100;
  const progressPercent = (currentStreak / nextMilestone) * 100;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <CardTitle className="text-base truncate">{habit.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-2">
            <Flame className="h-8 w-8 text-orange-500" />
            <span className="text-4xl font-bold text-primary">{currentStreak}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {currentStreak === 1 ? 'day streak' : 'days streak'}
          </p>
          {milestone.label && (
            <p className="text-sm font-medium text-orange-500 mt-1">
              {milestone.emoji} {milestone.label}
            </p>
          )}
        </div>
        
        {/* Progress to next milestone */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to {nextMilestone} days</span>
            <span>{currentStreak}/{nextMilestone}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{longestStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Best streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold">{totalCompletions}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total completions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitStreakCard;
