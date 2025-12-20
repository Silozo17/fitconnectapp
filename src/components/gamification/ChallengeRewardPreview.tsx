import { useTranslation } from 'react-i18next';
import { Lock, Trophy, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const RARITY_STYLES = {
  common: {
    border: 'border-gray-500',
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    glow: '',
  },
  uncommon: {
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
  },
  rare: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
  },
  epic: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
  },
  legendary: {
    border: 'border-primary',
    bg: 'bg-primary/10',
    text: 'text-primary',
    glow: 'shadow-[0_0_25px_rgba(190,255,0,0.4)]',
  },
};

interface ChallengeRewardPreviewProps {
  rewardType: 'badge' | 'avatar';
  rewardName: string;
  rewardDescription?: string | null;
  rewardImageUrl?: string | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  compact?: boolean;
}

export function ChallengeRewardPreview({
  rewardType,
  rewardName,
  rewardDescription,
  rewardImageUrl,
  rarity,
  isUnlocked,
  compact = false,
}: ChallengeRewardPreviewProps) {
  const { t } = useTranslation('gamification');
  const styles = RARITY_STYLES[rarity] || RARITY_STYLES.common;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg border",
        styles.border,
        styles.bg
      )}>
        <div className={cn(
          "relative w-8 h-8 rounded overflow-hidden border shrink-0",
          styles.border,
          !isUnlocked && 'grayscale opacity-50'
        )}>
          {rewardImageUrl ? (
            <img src={rewardImageUrl} alt={rewardName} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              {rewardType === 'badge' ? (
                <Trophy className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Lock className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("text-xs font-medium truncate", styles.text)}>
            {rewardName}
          </p>
          <p className="text-[10px] text-muted-foreground capitalize">
            {t(`badges.rarity.${rarity}`)} {t(`rewards.${rewardType}`)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border-2 p-3",
      styles.border,
      styles.bg,
      isUnlocked && styles.glow
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className={cn("h-4 w-4", styles.text)} />
        <span className={cn("text-xs font-medium uppercase", styles.text)}>
          {t('rewards.exclusiveReward')}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className={cn(
          "relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0",
          styles.border,
          !isUnlocked && 'grayscale opacity-40',
          isUnlocked && styles.glow
        )}>
          {rewardImageUrl ? (
            <img 
              src={rewardImageUrl} 
              alt={rewardName} 
              className="w-full h-full object-contain bg-background/50"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              {rewardType === 'badge' ? (
                <Trophy className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          )}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={cn("font-medium text-sm", !isUnlocked && 'text-muted-foreground')}>
            {rewardName}
          </h4>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1.5 py-0 mt-1 capitalize",
              styles.text,
              styles.border
            )}
          >
            {t(`badges.rarity.${rarity}`)} {t(`rewards.${rewardType}`)}
          </Badge>
          {rewardDescription && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {rewardDescription}
            </p>
          )}
          <p className={cn(
            "text-xs mt-1",
            isUnlocked ? 'text-green-500' : 'text-muted-foreground'
          )}>
            {isUnlocked ? `✓ ${t('rewards.unlocked')}` : t('rewards.unlockToEarn')}
          </p>
        </div>
      </div>
    </div>
  );
}
