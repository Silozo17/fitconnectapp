import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/hooks/useGamification';
import { ShareAchievementButton } from './ShareAchievementButton';
import { triggerConfetti, confettiPresets } from '@/lib/confetti';
import { triggerHaptic } from '@/lib/despia';

interface ClaimBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: Badge | null;
  xpEarned?: number;
  onClaimed?: () => void;
}

const RARITY_GRADIENTS: Record<string, string> = {
  common: 'from-zinc-500/20 via-zinc-400/10 to-zinc-500/20',
  uncommon: 'from-emerald-500/20 via-emerald-400/10 to-emerald-500/20',
  rare: 'from-blue-500/20 via-blue-400/10 to-blue-500/20',
  epic: 'from-purple-500/20 via-purple-400/10 to-purple-500/20',
  legendary: 'from-amber-500/20 via-yellow-400/10 to-amber-500/20',
};

const RARITY_GLOW: Record<string, string> = {
  common: 'shadow-[0_0_30px_rgba(161,161,170,0.4)]',
  uncommon: 'shadow-[0_0_40px_rgba(52,211,153,0.5)]',
  rare: 'shadow-[0_0_50px_rgba(96,165,250,0.6)]',
  epic: 'shadow-[0_0_60px_rgba(192,132,252,0.6)]',
  legendary: 'shadow-[0_0_80px_rgba(251,191,36,0.7)]',
};

const RARITY_BORDER: Record<string, string> = {
  common: 'border-zinc-400/50',
  uncommon: 'border-emerald-400/50',
  rare: 'border-blue-400/50',
  epic: 'border-purple-400/50',
  legendary: 'border-amber-400/50',
};

export function ClaimBadgeModal({ 
  isOpen, 
  onClose, 
  badge, 
  xpEarned = 0,
  onClaimed 
}: ClaimBadgeModalProps) {
  const { t } = useTranslation('gamification');
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (isOpen && badge && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      
      // Trigger celebration effects
      setTimeout(() => {
        triggerConfetti(confettiPresets.medium);
        triggerHaptic('success');
      }, 100);

      // Notify parent that badge was claimed
      onClaimed?.();
    }

    if (!isOpen) {
      hasTriggeredRef.current = false;
    }
  }, [isOpen, badge, onClaimed]);

  if (!badge) return null;

  const rarity = badge.rarity || 'common';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={cn(
          'max-w-sm p-0 overflow-hidden border-0',
          'bg-gradient-to-br from-background via-background to-background'
        )}
      >
        {/* Gradient background */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-50',
          RARITY_GRADIENTS[rarity]
        )} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-full p-1.5 bg-background/50 hover:bg-background/80 transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center p-8 pt-10">
          {/* Trophy icon */}
          <div className="mb-4">
            <Trophy className="h-8 w-8 text-primary animate-bounce" />
          </div>

          {/* Congratulations */}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t('celebration.congratulations')}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {t('celebration.badgeUnlocked')}
          </p>

          {/* Badge with glow and shine animation */}
          <div className={cn(
            'relative w-32 h-32 rounded-2xl flex items-center justify-center mb-4',
            'border-2',
            RARITY_BORDER[rarity],
            RARITY_GLOW[rarity],
            'animate-badge-shine'
          )}>
            {/* Shine overlay */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Badge image */}
            {badge.image_url ? (
              <img
                src={badge.image_url}
                alt={badge.name}
                className="w-24 h-24 object-contain"
              />
            ) : (
              <span className="text-5xl">{badge.icon}</span>
            )}
          </div>

          {/* Badge name and description */}
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {badge.name}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-4 max-w-[250px]">
            {badge.description}
          </p>

          {/* XP earned */}
          {xpEarned > 0 && (
            <div className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-full mb-6">
              +{xpEarned} XP
            </div>
          )}

          {/* Share button */}
          <div className="w-full space-y-3">
            <ShareAchievementButton
              achievement={{
                type: 'badge',
                title: badge.name,
                description: badge.description,
              }}
              variant="default"
            />
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full text-muted-foreground"
            >
              {t('celebration.tapToDismiss')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
