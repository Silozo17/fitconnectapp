import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, TrendingUp, Zap } from 'lucide-react';
import { ShareAchievementButton, ShareableAchievement } from './ShareAchievementButton';

interface AchievementShareCardProps {
  achievement: ShareableAchievement;
  userName?: string;
}

export function AchievementShareCard({ achievement, userName }: AchievementShareCardProps) {
  const getIcon = () => {
    switch (achievement.type) {
      case 'badge': return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'level': return <TrendingUp className="h-8 w-8 text-primary" />;
      case 'challenge': return <Target className="h-8 w-8 text-green-500" />;
      case 'rank': return <Star className="h-8 w-8 text-amber-500" />;
      default: return <Zap className="h-8 w-8 text-primary" />;
    }
  };

  const getGradient = () => {
    switch (achievement.type) {
      case 'badge': return 'from-yellow-500/20 to-amber-500/20';
      case 'level': return 'from-primary/20 to-primary/5';
      case 'challenge': return 'from-green-500/20 to-emerald-500/20';
      case 'rank': return 'from-amber-500/20 to-orange-500/20';
      default: return 'from-primary/20 to-primary/5';
    }
  };

  const getLabel = () => {
    switch (achievement.type) {
      case 'badge': return 'Badge Earned';
      case 'level': return 'Level Up!';
      case 'challenge': return 'Challenge Complete';
      case 'rank': return 'New Rank';
      default: return 'Achievement';
    }
  };

  return (
    <Card className={`overflow-hidden bg-gradient-to-br ${getGradient()} border-primary/20`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Badge variant="outline" className="text-xs">
            {getLabel()}
          </Badge>
          <ShareAchievementButton achievement={achievement} />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-background/80 rounded-xl">
            {achievement.icon ? (
              <span className="text-4xl">{achievement.icon}</span>
            ) : (
              getIcon()
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{achievement.title}</h3>
            {achievement.value && (
              <p className="text-2xl font-bold text-primary">
                {achievement.type === 'rank' ? '#' : ''}{achievement.value}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>

        {userName && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Achieved by <span className="font-medium text-foreground">{userName}</span>
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium">FitConnect</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
