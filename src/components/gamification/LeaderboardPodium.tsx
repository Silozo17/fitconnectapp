import { cn } from '@/lib/utils';
import { XPLeaderboardEntry, getLevelTitle } from '@/hooks/useGamification';
import { getAvatarImageUrl } from '@/hooks/useAvatars';
import { RARITY_CONFIG } from '@/lib/avatar-utils';
import { Zap } from 'lucide-react';

interface LeaderboardEntryWithAvatar extends XPLeaderboardEntry {
  selected_avatar_slug?: string | null;
  selected_avatar_rarity?: string | null;
}

interface LeaderboardPodiumProps {
  entries: XPLeaderboardEntry[];
  currentUserId?: string;
}

const PODIUM_CONFIG = {
  1: {
    size: 'h-20 w-20 md:h-24 md:w-24',
    ringSize: 'ring-4',
    ringColor: 'ring-amber-400',
    glowClass: 'leaderboard-glow-gold',
    badgeColor: 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600',
    order: 'order-2',
    elevation: '-mt-4',
    label: '1st',
  },
  2: {
    size: 'h-16 w-16 md:h-20 md:w-20',
    ringSize: 'ring-3',
    ringColor: 'ring-slate-300',
    glowClass: 'leaderboard-glow-silver',
    badgeColor: 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500',
    order: 'order-1',
    elevation: 'mt-4',
    label: '2nd',
  },
  3: {
    size: 'h-16 w-16 md:h-20 md:w-20',
    ringSize: 'ring-3',
    ringColor: 'ring-amber-600',
    glowClass: 'leaderboard-glow-bronze',
    badgeColor: 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-800',
    order: 'order-3',
    elevation: 'mt-4',
    label: '3rd',
  },
} as const;

export function LeaderboardPodium({ entries, currentUserId }: LeaderboardPodiumProps) {
  const top3 = entries.slice(0, 3);
  
  if (top3.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-4 md:gap-8 py-6 px-4">
      {[2, 1, 3].map((rank, visualIndex) => {
        const entry = top3.find(e => e.rank === rank);
        if (!entry) return <div key={rank} className={cn('flex-1', PODIUM_CONFIG[rank as keyof typeof PODIUM_CONFIG].order)} />;
        
        const config = PODIUM_CONFIG[rank as keyof typeof PODIUM_CONFIG];
        const entryWithAvatar = entry as LeaderboardEntryWithAvatar;
        const isCurrentUser = currentUserId === entry.client_id;
        const displayName = entry.first_name || 'Anonymous';
        const initials = entry.first_name?.[0] || 'A';
        
        const hasAvatar = entryWithAvatar.selected_avatar_slug;
        const avatarRarity = (entryWithAvatar.selected_avatar_rarity as keyof typeof RARITY_CONFIG) || 'common';
        const rarityConfig = RARITY_CONFIG[avatarRarity];

        return (
          <div
            key={entry.client_id}
            className={cn(
              'flex flex-col items-center gap-2 flex-1',
              config.order,
              config.elevation,
              'animate-[leaderboard-podium-enter_0.5s_ease-out_forwards]',
            )}
            style={{ animationDelay: `${visualIndex * 150}ms`, opacity: 0 }}
          >
            {/* Avatar with glow ring */}
            <div className={cn('relative', config.glowClass)}>
              <div
                className={cn(
                  'rounded-full overflow-hidden',
                  config.size,
                  config.ringSize,
                  config.ringColor,
                  'bg-muted',
                  isCurrentUser && 'ring-primary ring-4',
                  hasAvatar && rarityConfig.glow
                )}
              >
                {hasAvatar ? (
                  <img
                    src={getAvatarImageUrl(entryWithAvatar.selected_avatar_slug!)}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold text-xl md:text-2xl">
                    {initials}
                  </div>
                )}
              </div>
              
              {/* Rank badge */}
              <div
                className={cn(
                  'absolute -bottom-1 -right-1 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center',
                  config.badgeColor,
                  'text-white font-bold text-sm shadow-lg border-2 border-background'
                )}
              >
                {rank}
              </div>
            </div>

            {/* Name */}
            <div className="text-center mt-1">
              <p className={cn(
                'font-semibold text-sm md:text-base truncate max-w-[80px] md:max-w-[100px]',
                isCurrentUser && 'text-primary'
              )}>
                {displayName}
              </p>
              <div className="flex items-center justify-center gap-1 text-primary text-xs md:text-sm font-medium">
                <Zap className="h-3 w-3 md:h-4 md:w-4" />
                <span>{entry.total_xp.toLocaleString()}</span>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Level {entry.current_level}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
