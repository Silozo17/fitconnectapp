import { Challenge, useJoinChallenge, CHALLENGE_TYPES } from '@/hooks/useChallenges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { Calendar, Users, Zap, Trophy, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChallengeCardProps {
  challenge: Challenge;
  showJoinButton?: boolean;
  showProgress?: boolean;
}

export function ChallengeCard({ challenge, showJoinButton = true, showProgress = false }: ChallengeCardProps) {
  const joinChallenge = useJoinChallenge();
  
  const today = new Date();
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const daysLeft = differenceInDays(endDate, today);
  const hasStarted = isAfter(today, startDate);
  const hasEnded = isAfter(today, endDate);
  const isJoined = !!challenge.my_participation;
  
  const challengeType = CHALLENGE_TYPES.find(t => t.value === challenge.challenge_type);
  
  const getStatusBadge = () => {
    if (hasEnded) {
      return <Badge variant="secondary">Ended</Badge>;
    }
    if (!hasStarted) {
      return <Badge variant="outline">Starts {format(startDate, 'MMM d')}</Badge>;
    }
    if (daysLeft <= 3) {
      return <Badge variant="destructive">{daysLeft} days left</Badge>;
    }
    return <Badge className="bg-primary/20 text-primary">{daysLeft} days left</Badge>;
  };
  
  const progress = challenge.my_participation 
    ? (challenge.my_participation.current_progress / challenge.target_value) * 100
    : 0;
  
  return (
    <Card className={cn(
      'transition-all',
      hasEnded && 'opacity-60'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{challenge.title}</CardTitle>
            {challenge.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {challenge.description}
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{challenge.target_value} {challenge.target_unit}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>{challenge.xp_reward} XP reward</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {challenge.participant_count || 0} joined
              {challenge.max_participants && ` / ${challenge.max_participants} max`}
            </span>
          </div>
        </div>
        
        {challengeType && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <span className="font-medium">{challengeType.label}:</span> {challengeType.description}
          </div>
        )}
        
        {showProgress && isJoined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your progress</span>
              <span className="font-medium">
                {challenge.my_participation?.current_progress || 0} / {challenge.target_value} {challenge.target_unit}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {showJoinButton && !hasEnded && (
          <div className="pt-2">
            {isJoined ? (
              <Badge variant="outline" className="w-full justify-center py-2">
                <Trophy className="h-4 w-4 mr-2" />
                Joined
              </Badge>
            ) : (
              <Button
                className="w-full"
                onClick={() => joinChallenge.mutate(challenge.id)}
                disabled={joinChallenge.isPending || !hasStarted}
              >
                {!hasStarted ? 'Coming Soon' : 'Join Challenge'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
