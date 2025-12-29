import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge as BadgeType, RARITY_COLORS } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Lock, Gift } from 'lucide-react';
import { ShareAchievementButton } from './ShareAchievementButton';
import { getBadgeIcon } from '@/lib/badge-icons';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export interface BadgeProgress {
  current: number;
  target: number;
  percentage: number;
  label?: string;
}

interface BadgeCardProps {
  badge: BadgeType;
  earned?: boolean;
  earnedAt?: string;
  showDetails?: boolean;
  progress?: BadgeProgress;
  isClaimed?: boolean;
  onClaim?: () => void;
}

const RARITY_GLOW: Record<string, string> = {
  common: '',
  uncommon: 'shadow-[0_0_25px_rgba(52,211,153,0.4)]',
  rare: 'shadow-[0_0_30px_rgba(96,165,250,0.5)]',
  epic: 'shadow-[0_0_35px_rgba(192,132,252,0.5)]',
  legendary: 'shadow-[0_0_45px_rgba(251,191,36,0.6)]',
};

export const BadgeCard = forwardRef<HTMLDivElement, BadgeCardProps>(
  ({ badge, earned = false, earnedAt, showDetails = true, progress, isClaimed = true, onClaim }, ref) => {
    const { t } = useTranslation('gamification');
    const rarityColors = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;
    
    // Show claim button if earned but not yet claimed
    const showClaimButton = earned && !isClaimed && onClaim;
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-xl p-4 transition-all duration-300 glass-card overflow-hidden',
          earned 
            ? `${rarityColors.border} border` 
            : 'border border-white/10',
          badge.rarity === 'legendary' && earned && 'ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-500/20'
        )}
      >
        {/* Rarity color overlay for earned badges */}
        {earned && (
          <div 
            className={cn('absolute inset-0 pointer-events-none opacity-30', rarityColors.bg)}
          />
        )}
        
        {/* Locked overlay for unearned badges - full coverage with blur */}
        {!earned && (
          <div className="absolute inset-0 rounded-xl bg-background/70 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                <Lock className="h-7 w-7 text-muted-foreground/60" />
              </div>
            </div>
          </div>
        )}
        
        {/* Share button for claimed earned badges */}
        {earned && isClaimed && (
          <div className="absolute top-2 right-2 z-10">
            <ShareAchievementButton
              achievement={{
                type: 'badge',
                title: badge.name,
                description: badge.description,
                icon: badge.icon,
              }}
              variant="ghost"
              size="icon"
            />
          </div>
        )}
        
        <div className={cn("relative text-center", !earned && "opacity-70")}>
          {/* Badge icon with rarity glow - LARGER SIZE */}
          <div 
            className={cn(
              'w-24 h-24 mx-auto mb-3 flex items-center justify-center rounded-xl',
              earned && RARITY_GLOW[badge.rarity],
              showClaimButton && 'animate-pulse-subtle'
            )}
          >
            {/* Shine effect for claimable badges */}
            {showClaimButton && (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            )}
            
            {(() => {
              // Check if the icon is an emoji
              const isEmoji = (str: string): boolean => {
                const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
                return emojiRegex.test(str);
              };

              if (badge.image_url) {
                return (
                  <img 
                    src={badge.image_url} 
                    alt={badge.name} 
                    className={cn(
                      'w-20 h-20 object-contain',
                      !earned && 'grayscale'
                    )} 
                  />
                );
              } else if (isEmoji(badge.icon)) {
                return (
                  <span className={cn(
                    'text-5xl',
                    !earned && 'grayscale'
                  )}>
                    {badge.icon}
                  </span>
                );
              } else {
                const IconComponent = getBadgeIcon(badge.icon);
                return (
                  <IconComponent className={cn(
                    'w-14 h-14',
                    earned ? 'text-primary' : 'text-muted-foreground'
                  )} />
                );
              }
            })()}
          </div>
          
          <h4 className={cn(
            'font-bold text-sm',
            earned ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {badge.name}
          </h4>
          
          {showDetails && (
            <>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {badge.description}
              </p>
              
              <div className={cn(
                'inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-2 capitalize',
                rarityColors.bg,
                rarityColors.text
              )}>
                {t(`badges.rarity.${badge.rarity}`)}
              </div>
              
              {/* Claim button for unclaimed earned badges */}
              {showClaimButton && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClaim();
                  }}
                  className="w-full mt-3 bg-primary hover:bg-primary/90"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  {t('claim.button', 'Claim Reward')}
                </Button>
              )}
              
              {earned && isClaimed && earnedAt && (
                <div className="text-xs text-muted-foreground mt-2">
                  {t('badges.earned', { date: format(new Date(earnedAt), 'MMM d, yyyy') })}
                </div>
              )}
              
              {!earned && badge.xp_reward > 0 && (
                <div className="text-xs text-primary mt-2">
                  +{badge.xp_reward} XP
                </div>
              )}
              
              {/* Progress bar for unearned badges */}
              {!earned && progress && progress.target > 0 && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground truncate max-w-[60%]">
                      {progress.label || t('badges.progress', { 
                        current: progress.current, 
                        target: progress.target 
                      })}
                    </span>
                    <span className="font-semibold text-primary">
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={progress.percentage} 
                    className="h-2" 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

BadgeCard.displayName = 'BadgeCard';
