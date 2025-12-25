import { cn } from '@/lib/utils';
import { XPLeaderboardEntry } from '@/hooks/useGamification';
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
    size: 'w-24 h-24 sm:w-28 sm:h-28',
    ringClass: 'leaderboard-avatar-ring leaderboard-avatar-ring-gold',
    badgeGradient: 'from-amber-400 to-yellow-500',
    order: 'order-2',
    translateY: '',
  },
  2: {
    size: 'w-18 h-18 sm:w-20 sm:h-20',
    ringClass: 'leaderboard-avatar-ring leaderboard-avatar-ring-silver',
    badgeGradient: 'from-slate-300 to-slate-400',
    order: 'order-1',
    translateY: 'mt-8',
  },
  3: {
    size: 'w-18 h-18 sm:w-20 sm:h-20',
    ringClass: 'leaderboard-avatar-ring leaderboard-avatar-ring-bronze',
    badgeGradient: 'from-amber-600 to-orange-500',
    order: 'order-3',
    translateY: 'mt-8',
  },
} as const;

export function LeaderboardPodium({ entries, currentUserId }: LeaderboardPodiumProps) {
  if (entries.length === 0) return null;

  // Get top 3 entries
  const podiumEntries = entries.slice(0, 3);

  return (
    <div className="flex items-end justify-center gap-4 sm:gap-8 py-8">
      {/* Render in order: 2, 1, 3 for visual layout */}
      {[2, 1, 3].map((rank) => {
        const entry = podiumEntries.find((_, i) => i + 1 === rank);
        if (!entry) return <div key={rank} className={PODIUM_CONFIG[rank as keyof typeof PODIUM_CONFIG].order} />;

        const config = PODIUM_CONFIG[rank as keyof typeof PODIUM_CONFIG];
        const entryWithAvatar = entry as LeaderboardEntryWithAvatar;
        const isCurrentUser = currentUserId === entry.client_id;
        const displayName = entry.first_name || 'Anonymous';
        const initials = entry.first_name?.[0] || 'A';
        const hasAvatar = entryWithAvatar.selected_avatar_slug;

        return (
          <div
            key={entry.client_id}
            className={cn(
              'flex flex-col items-center',
              config.order,
              config.translateY,
              'animate-[leaderboard-podium-enter_0.5s_ease-out_forwards]'
            )}
            style={{ animationDelay: `${(rank - 1) * 100}ms`, opacity: 0 }}
          >
            {/* Avatar with animated ring */}
            <div className="relative">
              <div className={cn(config.size, config.ringClass, 'rounded-full overflow-hidden')}>
                {hasAvatar ? (
                  <img
                    src={getAvatarImageUrl(entryWithAvatar.selected_avatar_slug!)}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-foreground font-bold text-xl sm:text-2xl">
                    {initials}
                  </div>
                )}
              </div>

              {/* Rank badge - overlaid on avatar */}
              <div
                className={cn(
                  'absolute -bottom-2 left-1/2 -translate-x-1/2',
                  'w-7 h-7 rounded-full flex items-center justify-center',
                  'bg-gradient-to-br shadow-lg border-2 border-background',
                  config.badgeGradient
                )}
              >
                <span className="text-xs font-bold text-background">{rank}</span>
              </div>
            </div>

            {/* Name */}
            <p className={cn(
              'mt-4 text-sm font-medium truncate max-w-[80px] sm:max-w-[100px] text-center',
              isCurrentUser && 'text-primary'
            )}>
              {displayName}
            </p>

            {/* XP */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Zap className="h-3 w-3 text-primary" />
              <span>{entry.total_xp.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
