import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Trophy, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerConfetti, confettiPresets } from '@/lib/confetti';
import { triggerHaptic } from '@/lib/despia';

export type CelebrationType = 'challenge_complete' | 'level_up' | 'badge_earned' | 'avatar_unlocked';

export interface CelebrationData {
  type: CelebrationType;
  title: string;
  subtitle?: string;
  xpEarned?: number;
  badge?: {
    name: string;
    imageUrl?: string;
    rarity: string;
  };
  avatar?: {
    name: string;
    imageUrl?: string;
    rarity: string;
  };
  newLevel?: number;
}

interface CelebrationOverlayProps {
  isOpen: boolean;
  data: CelebrationData | null;
  onClose: () => void;
  autoDismissMs?: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'from-slate-400 to-slate-500',
  uncommon: 'from-emerald-400 to-emerald-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
};

const RARITY_GLOW: Record<string, string> = {
  common: 'shadow-slate-400/30',
  uncommon: 'shadow-emerald-400/40',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-purple-400/50',
  legendary: 'shadow-amber-400/60',
};

export function CelebrationOverlay({
  isOpen,
  data,
  onClose,
  autoDismissMs = 5000,
}: CelebrationOverlayProps) {
  const { t } = useTranslation('gamification');
  const [displayedXp, setDisplayedXp] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // XP counting animation
  useEffect(() => {
    if (!isOpen || !data?.xpEarned) {
      setDisplayedXp(0);
      return;
    }

    const targetXp = data.xpEarned;
    const duration = 1000; // 1 second
    const steps = 30;
    const stepValue = targetXp / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayedXp(targetXp);
        clearInterval(interval);
      } else {
        setDisplayedXp(Math.round(stepValue * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isOpen, data?.xpEarned]);

  // Trigger animations on open
  useEffect(() => {
    if (isOpen && data) {
      setIsAnimating(true);
      triggerHaptic('success');
      
      // Use appropriate confetti based on type
      if (data.type === 'challenge_complete') {
        triggerConfetti(confettiPresets.challengeComplete);
      } else if (data.type === 'level_up') {
        triggerConfetti(confettiPresets.levelUp);
      } else if (data.type === 'badge_earned') {
        triggerConfetti(confettiPresets.badgeEarned);
      } else {
        triggerConfetti(confettiPresets.achievement);
      }
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, data]);

  // Auto-dismiss
  useEffect(() => {
    if (!isOpen || autoDismissMs <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [isOpen, autoDismissMs, onClose]);

  // Handle keyboard dismiss
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !data) return null;

  const reward = data.badge || data.avatar;
  const rewardRarity = reward?.rarity?.toLowerCase() || 'common';

  const getIcon = () => {
    switch (data.type) {
      case 'challenge_complete':
        return <Trophy className="h-12 w-12 text-amber-400" />;
      case 'level_up':
        return <Star className="h-12 w-12 text-amber-400" />;
      case 'badge_earned':
      case 'avatar_unlocked':
        return <Sparkles className="h-12 w-12 text-purple-400" />;
      default:
        return <Trophy className="h-12 w-12 text-amber-400" />;
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        'bg-black/70 backdrop-blur-sm',
        isAnimating && 'animate-fade-in'
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <div
        className={cn(
          'relative max-w-sm w-full bg-card rounded-2xl p-6 text-center',
          'shadow-2xl border border-border/50',
          isAnimating && 'animate-scale-in'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label={t('celebration.tapToDismiss', 'Tap to dismiss')}
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 animate-pulse">
            {getIcon()}
          </div>
        </div>

        {/* Title */}
        <h2
          id="celebration-title"
          className="text-2xl font-bold text-foreground mb-1"
        >
          {t('celebration.congratulations', 'Congratulations!')}
        </h2>

        {/* Subtitle / Challenge name */}
        <p className="text-muted-foreground mb-4">
          {data.subtitle || data.title}
        </p>

        {/* XP Earned */}
        {data.xpEarned && data.xpEarned > 0 && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span className="text-xl font-bold text-amber-400">
                +{displayedXp} XP
              </span>
            </div>
          </div>
        )}

        {/* Level Up */}
        {data.newLevel && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Star className="h-5 w-5 text-purple-400" />
              <span className="text-lg font-bold text-purple-400">
                {t('xp.level', 'Level')} {data.newLevel}
              </span>
            </div>
          </div>
        )}

        {/* Badge or Avatar Reward */}
        {reward && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-3">
              {data.badge
                ? t('celebration.badgeUnlocked', 'Badge Unlocked!')
                : t('celebration.avatarUnlocked', 'Avatar Unlocked!')}
            </p>
            <div className="flex justify-center">
              <div
                className={cn(
                  'relative p-1 rounded-xl bg-gradient-to-br',
                  RARITY_COLORS[rewardRarity],
                  'shadow-lg',
                  RARITY_GLOW[rewardRarity]
                )}
              >
                <div className="bg-card rounded-lg p-3">
                  {reward.imageUrl ? (
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="h-16 w-16 object-contain mx-auto"
                    />
                  ) : (
                    <div className="h-16 w-16 flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {reward.name}
                  </p>
                  <span
                    className={cn(
                      'mt-1 inline-block text-xs px-2 py-0.5 rounded-full',
                      'bg-gradient-to-r text-white font-medium',
                      RARITY_COLORS[rewardRarity]
                    )}
                  >
                    {t(`badges.rarity.${rewardRarity}`, reward.rarity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tap to dismiss hint */}
        <p className="mt-4 text-xs text-muted-foreground/60">
          {t('celebration.tapToDismiss', 'Tap to dismiss')}
        </p>
      </div>
    </div>
  );
}
