import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, getAvatarImageUrl } from '@/hooks/useAvatars';
import { RARITY_CONFIG, getUnlockDescription } from '@/lib/avatar-config';
import { Lock, Crown, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AvatarCardProps {
  avatar: Avatar;
  isUnlocked: boolean;
  isSelected: boolean;
  progress?: { current: number; target: number };
  onClick?: () => void;
}

export const AvatarCard = React.forwardRef<HTMLButtonElement, AvatarCardProps>(
  function AvatarCard({ avatar, isUnlocked, isSelected, progress, onClick }, ref) {
  const rarityConfig = RARITY_CONFIG[avatar.rarity];
  const imageUrl = getAvatarImageUrl(avatar.slug);
  
  const isCoachExclusive = avatar.category === 'coach_exclusive';
  const showProgress = !isUnlocked && progress && progress.target > 0;
  
  return (
    <button
      ref={ref}
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={cn(
        'relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        isUnlocked ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed',
        isSelected && 'ring-2 ring-primary',
        isUnlocked ? rarityConfig.border : 'border-muted/30',
        isUnlocked ? rarityConfig.bg : 'bg-muted/10',
        isUnlocked && rarityConfig.glow
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
      
      {/* Lock overlay for locked avatars */}
      {!isUnlocked && (
        <div className="absolute inset-0 rounded-xl bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-1">
            {isCoachExclusive ? (
              <Crown className="h-6 w-6 text-primary" />
            ) : (
              <Lock className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        </div>
      )}
      
      {/* Avatar image */}
      <div className={cn(
        'relative w-16 h-16 rounded-full overflow-hidden mb-2',
        !isUnlocked && 'grayscale opacity-50'
      )}>
        <img
          src={imageUrl}
          alt={avatar.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>
      
      {/* Avatar name */}
      <span className={cn(
        'text-xs font-medium text-center line-clamp-2',
        isUnlocked ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {avatar.name}
      </span>
      
      {/* Rarity badge */}
      <Badge 
        variant="outline" 
        className={cn('text-[10px] mt-1 px-1.5 py-0', rarityConfig.color, rarityConfig.border)}
      >
        {rarityConfig.label}
      </Badge>
      
      {/* Progress bar for locked avatars */}
      {showProgress && (
        <div className="w-full mt-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {progress.current}/{progress.target}
          </span>
        </div>
      )}
      
      {/* Unlock requirement tooltip */}
      {!isUnlocked && !showProgress && (
        <span className="text-[10px] text-muted-foreground mt-1 text-center">
          {getUnlockDescription(avatar.unlock_type as any, avatar.unlock_threshold)}
        </span>
      )}
    </button>
  );
});
