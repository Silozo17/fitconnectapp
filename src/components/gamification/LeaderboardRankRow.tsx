import { cn } from '@/lib/utils';
import { XPLeaderboardEntry } from '@/hooks/useGamification';
import { getAvatarImageUrl } from '@/hooks/useAvatars';
import { RARITY_CONFIG } from '@/lib/avatar-utils';
import { Zap } from 'lucide-react';

interface LeaderboardEntryWithAvatar extends XPLeaderboardEntry {
  selected_avatar_slug?: string | null;
  selected_avatar_rarity?: string | null;
}

interface LeaderboardRankRowProps {
  entry: XPLeaderboardEntry;
  currentUserId?: string;
  index: number;
}

export function LeaderboardRankRow({ entry, currentUserId, index }: LeaderboardRankRowProps) {
  const entryWithAvatar = entry as LeaderboardEntryWithAvatar;
  const isCurrentUser = currentUserId === entry.client_id;
  const displayName = entry.first_name || 'Anonymous';
  const initials = entry.first_name?.[0] || 'A';
  const locationDisplay = entry.city || entry.county || entry.country;
  
  const hasAvatar = entryWithAvatar.selected_avatar_slug;
  const avatarRarity = (entryWithAvatar.selected_avatar_rarity as keyof typeof RARITY_CONFIG) || 'common';
  const rarityConfig = RARITY_CONFIG[avatarRarity];

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3 px-2 rounded-xl transition-colors',
        isCurrentUser 
          ? 'glass-item bg-primary/10 border border-primary/20' 
          : 'hover:bg-white/[0.03]',
        'animate-[leaderboard-row-enter_0.3s_ease-out_forwards]'
      )}
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      {/* Rank */}
      <div className="w-8 text-center text-sm font-medium text-muted-foreground">
        {entry.rank}
      </div>

      {/* Avatar */}
      {hasAvatar ? (
        <div className={cn(
          'h-10 w-10 rounded-full overflow-hidden border-2 shrink-0',
          rarityConfig.border
        )}>
          <img
            src={getAvatarImageUrl(entryWithAvatar.selected_avatar_slug!)}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium shrink-0">
          {initials}
        </div>
      )}

      {/* Name & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('font-medium truncate text-sm', isCurrentUser && 'text-primary')}>
            {displayName}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full shrink-0">
              You
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {locationDisplay && <span>{locationDisplay} • </span>}
          Level {entry.current_level}
        </div>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1 text-primary font-semibold text-sm shrink-0">
        <Zap className="h-3.5 w-3.5" />
        <span>{entry.total_xp.toLocaleString()}</span>
      </div>
    </div>
  );
}
