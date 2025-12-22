import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge as BadgeType, RARITY_COLORS } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Lock } from 'lucide-react';
import { ShareAchievementButton } from './ShareAchievementButton';
import { getBadgeIcon } from '@/lib/badge-icons';

interface BadgeCardProps {
  badge: BadgeType;
  earned?: boolean;
  earnedAt?: string;
  showDetails?: boolean;
}

export const BadgeCard = forwardRef<HTMLDivElement, BadgeCardProps>(
  ({ badge, earned = false, earnedAt, showDetails = true }, ref) => {
    const { t } = useTranslation('gamification');
    const rarityColors = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-xl border-2 p-4 transition-all duration-300',
          earned 
            ? `${rarityColors.bg} ${rarityColors.border}` 
            : 'bg-muted/30 border-muted grayscale opacity-60',
          badge.rarity === 'legendary' && earned && 'animate-pulse'
        )}
      >
        {!earned && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        
        {earned && (
          <div className="absolute top-2 right-2">
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
        
        <div className="text-center">
          <div 
            className={cn(
              'w-16 h-16 mx-auto mb-2 flex items-center justify-center',
              !earned && 'grayscale'
            )}
          >
            {(() => {
              // Check if the icon is an emoji
              const isEmoji = (str: string): boolean => {
                const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
                return emojiRegex.test(str);
              };

              if (badge.image_url) {
                return <img src={badge.image_url} alt={badge.name} className="w-14 h-14 object-contain" />;
              } else if (isEmoji(badge.icon)) {
                return <span className="text-4xl">{badge.icon}</span>;
              } else {
                const IconComponent = getBadgeIcon(badge.icon);
                return <IconComponent className="w-12 h-12 text-primary" />;
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
              
              {earned && earnedAt && (
                <div className="text-xs text-muted-foreground mt-2">
                  {t('badges.earned', { date: format(new Date(earnedAt), 'MMM d, yyyy') })}
                </div>
              )}
              
              {!earned && badge.xp_reward > 0 && (
                <div className="text-xs text-primary mt-2">
                  +{badge.xp_reward} XP
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
