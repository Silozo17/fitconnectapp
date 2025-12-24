import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Challenge, useJoinChallenge, CHALLENGE_TYPES } from '@/hooks/useChallenges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { Calendar, Users, Zap, Trophy, Clock, Target, ShieldCheck, Watch, AlertTriangle, Gift, Share2, Twitter, Facebook, Linkedin, MessageCircle, Mail, Link, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChallengeRewardPreview } from './ChallengeRewardPreview';
import { useShareManager } from '@/hooks/useShareManager';
import { getChallengeShareOptions } from '@/lib/shareHelpers';

interface ChallengeCardProps {
  challenge: Challenge;
  showJoinButton?: boolean;
  showProgress?: boolean;
}

export function ChallengeCard({ challenge, showJoinButton = true, showProgress = false }: ChallengeCardProps) {
  const { t } = useTranslation('gamification');
  const joinChallenge = useJoinChallenge();
  const [copied, setCopied] = useState(false);
  const { share, shouldShowNativeButton, isDespia } = useShareManager();
  
  const today = new Date();
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const daysLeft = differenceInDays(endDate, today);
  const hasStarted = isAfter(today, startDate);
  const hasEnded = isAfter(today, endDate);
  const isJoined = !!challenge.my_participation;
  
  const challengeType = CHALLENGE_TYPES.find(t => t.value === challenge.challenge_type);
  const isWearableChallenge = challengeType?.wearableRequired || challenge.requires_verification;
  
  const getStatusBadge = () => {
    if (hasEnded) {
      return <Badge variant="secondary">{t('challenges.ended')}</Badge>;
    }
    if (!hasStarted) {
      return <Badge variant="outline">{t('challenges.starts', { date: format(startDate, 'MMM d') })}</Badge>;
    }
    if (daysLeft <= 3) {
      return <Badge variant="destructive">{t('challenges.daysLeft', { days: daysLeft })}</Badge>;
    }
    return <Badge className="bg-primary/20 text-primary">{t('challenges.daysLeft', { days: daysLeft })}</Badge>;
  };
  
  const getVerificationBadge = () => {
    if (challenge.data_source === 'wearable_only') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1">
                <ShieldCheck className="h-3 w-3" />
                {t('challenges.verifiedOnly')}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t('challenges.verifiedOnlyTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    if (challenge.requires_verification) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 gap-1">
                <Watch className="h-3 w-3" />
                {t('challenges.wearableTracked')}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t('challenges.wearableTrackedTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return null;
  };
  
  const progress = challenge.my_participation 
    ? (challenge.my_participation.current_progress / challenge.target_value) * 100
    : 0;
  
  const verifiedProgress = challenge.my_participation?.verified_progress || 0;
  const unverifiedProgress = challenge.my_participation?.unverified_progress || 0;
  const showVerifiedSplit = isWearableChallenge && (verifiedProgress > 0 || unverifiedProgress > 0);
  
  const reward = challenge.avatar_reward || challenge.badge_reward;
  const rewardType = challenge.reward_type;
  const isRewardUnlocked = challenge.my_participation?.status === 'completed';
  
  const shareOptions = getChallengeShareOptions(challenge);
  
  const handleNativeShare = async () => {
    await share('native', shareOptions);
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy') => {
    const success = await share(platform, shareOptions);
    if (platform === 'copy' && success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const ShareButton = () => {
    // For Despia or mobile with native share, show simple button
    if (isDespia || shouldShowNativeButton()) {
      return (
        <Button variant="ghost" size="icon" onClick={handleNativeShare} className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleShare('twitter')}>
            <Twitter className="h-4 w-4 mr-2" />
            {t('share.shareOnX')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('facebook')}>
            <Facebook className="h-4 w-4 mr-2" />
            {t('share.shareOnFacebook')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('linkedin')}>
            <Linkedin className="h-4 w-4 mr-2" />
            {t('share.shareOnLinkedin')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
            <MessageCircle className="h-4 w-4 mr-2" />
            {t('share.shareOnWhatsapp')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('email')}>
            <Mail className="h-4 w-4 mr-2" />
            {t('share.shareViaEmail')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('copy')}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Link className="h-4 w-4 mr-2" />}
            {copied ? t('share.copied') : t('share.copyLink')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  return (
    <Card className={cn(
      'transition-all',
      hasEnded && 'opacity-60'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              {getVerificationBadge()}
            </div>
            {challenge.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {challenge.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ShareButton />
            {getStatusBadge()}
          </div>
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
            <span>{t('challenges.xpReward', { xp: challenge.xp_reward })}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {t('challenges.joined', { count: challenge.participant_count || 0 })}
              {challenge.max_participants && ` ${t('challenges.maxParticipants', { max: challenge.max_participants })}`}
            </span>
          </div>
        </div>
        
        {challengeType && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <span className="font-medium">{challengeType.label}:</span> {challengeType.description}
          </div>
        )}
        
        {reward && rewardType && (
          <ChallengeRewardPreview
            rewardType={rewardType}
            rewardName={reward.name}
            rewardDescription={reward.description}
            rewardImageUrl={reward.image_url}
            rarity={reward.rarity}
            isUnlocked={isRewardUnlocked}
          />
        )}
        
        {isJoined && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">{t('challenges.yourProgress')}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {challenge.my_participation?.current_progress || 0} / {challenge.target_value} {challenge.target_unit}
                </span>
                <span className="text-primary font-bold text-base">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2.5" />
            
            {showVerifiedSplit && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  {t('challenges.verified', { value: verifiedProgress })}
                </span>
                {challenge.data_source !== 'wearable_only' && unverifiedProgress > 0 && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    {t('challenges.manual', { value: unverifiedProgress })}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Progress preview for non-joined active challenges */}
        {!isJoined && hasStarted && !hasEnded && showJoinButton && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">{t('challenges.goalProgress', 'Goal Progress')}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  0 / {challenge.target_value} {challenge.target_unit}
                </span>
                <span className="text-muted-foreground font-medium">
                  0%
                </span>
              </div>
            </div>
            <Progress value={0} className="h-2.5 opacity-50" />
            <p className="text-xs text-muted-foreground italic">
              {t('challenges.joinToTrack', 'Join to start tracking your progress')}
            </p>
          </div>
        )}
        
        {showJoinButton && !hasEnded && (
          <div className="pt-2">
            {isJoined ? (
              <Badge variant="outline" className="w-full justify-center py-2">
                <Trophy className="h-4 w-4 mr-2" />
                {t('challenges.joinedBadge')}
              </Badge>
            ) : (
              <div className="space-y-2">
                {isWearableChallenge && challenge.data_source === 'wearable_only' && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {t('challenges.requiresWearable')}
                  </p>
                )}
                <Button
                  className="w-full"
                  onClick={() => joinChallenge.mutate(challenge.id)}
                  disabled={joinChallenge.isPending || !hasStarted}
                >
                  {!hasStarted ? t('challenges.comingSoon') : t('challenges.joinChallenge')}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
