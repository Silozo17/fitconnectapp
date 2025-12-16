import { cn } from '@/lib/utils';
import { Avatar, getAvatarImageUrl } from '@/hooks/useAvatars';
import { useUserStats } from '@/hooks/useUserStats';
import { RARITY_CONFIG } from '@/lib/avatar-config';
import { Zap, Trophy, Target, Medal } from 'lucide-react';

interface AvatarShowcaseProps {
  avatar: Avatar | null;
  className?: string;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarShowcase({ avatar, className, showStats = false, size = 'md' }: AvatarShowcaseProps) {
  const { data: stats } = useUserStats();
  
  // Portrait aspect ratio containers
  const sizeClasses = {
    sm: 'w-20 h-28',
    md: 'w-32 h-44',
    lg: 'w-40 h-56',
  };
  
  const rarityConfig = avatar ? RARITY_CONFIG[avatar.rarity] : RARITY_CONFIG.common;
  const imageUrl = avatar ? getAvatarImageUrl(avatar.slug) : '/placeholder.svg';
  
  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      {/* Stats positioned around avatar */}
      {showStats && stats && (
        <>
          {/* Top-left: Level */}
          <div className="absolute -top-2 -left-2 z-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 border border-primary/30">
              <span className="text-xs font-bold text-primary">Lvl</span>
              <span className="text-sm font-bold">{stats.currentLevel}</span>
            </div>
          </div>
          
          {/* Top-right: XP */}
          <div className="absolute -top-2 -right-2 z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 border border-primary/30">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-sm font-bold">{stats.xpTotal.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Bottom-left: Badges */}
          <div className="absolute -bottom-2 -left-2 z-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 border border-amber-500/30">
              <Medal className="h-3 w-3 text-amber-500" />
              <span className="text-sm font-bold">{stats.badgesEarned}</span>
            </div>
          </div>
          
          {/* Bottom-right: Challenges */}
          <div className="absolute -bottom-2 -right-2 z-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 border border-purple-500/30">
              <Target className="h-3 w-3 text-purple-500" />
              <span className="text-sm font-bold">{stats.challengesCompleted}</span>
            </div>
          </div>
        </>
      )}
      
      {/* Avatar container with glow effect - portrait */}
      <div className={cn(
        'relative rounded-xl p-1',
        rarityConfig.glow,
        rarityConfig.border,
        'border-2 bg-gradient-to-br from-primary/20 to-accent/20'
      )}>
        {/* Inner glow ring */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 via-transparent to-accent/30 animate-pulse" />
        
        {/* Avatar image - portrait */}
        <div className={cn(
          'relative rounded-lg overflow-hidden bg-background/50',
          sizeClasses[size]
        )}>
          <img
            src={imageUrl}
            alt={avatar?.name || 'Avatar'}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>
      </div>
      
      {/* Avatar name and rarity */}
      {avatar && (
        <div className="mt-3 text-center">
          <h3 className="font-bold text-lg">{avatar.name}</h3>
          <span className={cn('text-sm', rarityConfig.color)}>
            {rarityConfig.label}
          </span>
        </div>
      )}
    </div>
  );
}
