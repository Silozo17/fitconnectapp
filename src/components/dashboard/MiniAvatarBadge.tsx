import { useSelectedAvatar, getAvatarImageUrl } from '@/hooks/useAvatars';
import { useClientXP, getLevelTitle } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface MiniAvatarBadgeProps {
  profileType?: 'client' | 'coach';
  showLevel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function MiniAvatarBadge({ 
  profileType = 'client', 
  showLevel = true,
  size = 'md',
  className 
}: MiniAvatarBadgeProps) {
  const { data: avatar } = useSelectedAvatar(profileType);
  const { data: xpData } = useClientXP();
  
  if (!avatar) return null;
  
  const imageUrl = avatar.image_url || getAvatarImageUrl(avatar.slug);
  const sizeClasses = size === 'sm' ? 'w-8 h-10' : 'w-10 h-12';
  
  const rarityGlow = {
    common: 'ring-border/50',
    uncommon: 'ring-green-500/40',
    rare: 'ring-blue-500/40',
    epic: 'ring-purple-500/40',
    legendary: 'ring-yellow-500/40',
  }[avatar.rarity] || 'ring-border/50';
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-lg overflow-hidden ring-2 bg-muted/50",
        sizeClasses,
        rarityGlow
      )}>
        <img 
          src={imageUrl} 
          alt={avatar.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>
      {showLevel && xpData && (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{avatar.name}</span>
          <span className="text-sm font-medium flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" />
            Level {xpData.current_level}
          </span>
        </div>
      )}
    </div>
  );
}
