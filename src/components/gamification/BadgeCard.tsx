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

// Radial gradients positioned at top-center of card, behind entire card content
const RARITY_GRADIENT: Record<string, string> = {
  common: 'radial-gradient(ellipse 120% 80% at 50% 20%, hsla(0, 0%, 60%, 0.15) 0%, transparent 60%)',
  uncommon: 'radial-gradient(ellipse 120% 80% at 50% 20%, hsla(142, 76%, 36%, 0.25) 0%, transparent 60%)',
  rare: 'radial-gradient(ellipse 120% 80% at 50% 20%, hsla(217, 91%, 60%, 0.3) 0%, transparent 60%)',
  epic: 'radial-gradient(ellipse 120% 80% at 50% 20%, hsla(270, 70%, 60%, 0.3) 0%, transparent 60%)',
  legendary: 'radial-gradient(ellipse 120% 80% at 50% 20%, hsla(45, 93%, 47%, 0.35) 0%, transparent 60%)',
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
          badge.rarity === 'legendary' && earned && isClaimed && 'ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-500/20'
        )}
      >
        {/* Rarity glow behind entire card - only for claimed badges */}
        {earned && isClaimed && (
          <div 
            className="absolute inset-0 pointer-events-none rounded-xl"
            style={{ background: RARITY_GRADIENT[badge.rarity] || RARITY_GRADIENT.common }}
          />
        )}
        
        {/* Rarity color overlay for claimed badges */}
        {earned && isClaimed && (
          <div 
            className={cn('absolute inset-0 pointer-events-none opacity-30', rarityColors.bg)}
          />
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
          {/* Badge display area - LARGER SIZE */}
          <div className='w-28 h-28 mx-auto mb-3 flex items-center justify-center relative'>
            {/* Shine effect for claimable badges */}
            {showClaimButton && (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            )}
            
            {/* Show badge only if earned AND claimed, otherwise show lock icon */}
            {earned && isClaimed ? (
              <>
                {(() => {
                  const isEmoji = (str: string): boolean => {
                    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
                    return emojiRegex.test(str);
                  };

                  if (badge.image_url) {
                    return (
                      <img 
                        src={badge.image_url} 
                        alt={badge.name} 
                        className="w-24 h-24 object-contain relative z-10"
                      />
                    );
                  } else if (isEmoji(badge.icon)) {
                    return (
                      <span className="text-6xl relative z-10">
                        {badge.icon}
                      </span>
                    );
                  } else {
                    const IconComponent = getBadgeIcon(badge.icon);
                    return (
                      <IconComponent className="w-16 h-16 text-primary relative z-10" />
                    );
                  }
                })()}
              </>
            ) : (
              // Locked state - show only lock icon (no badge preview)
              <div className="w-full h-full rounded-xl bg-muted/30 flex items-center justify-center border border-muted/50">
                <Lock className="w-10 h-10 text-muted-foreground/50" />
              </div>
            )}
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
                  <Gift className="h-4 w-4 mr-1" />
                  {t('claim.button', 'Claim')}
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
