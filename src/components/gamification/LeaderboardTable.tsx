import { XPLeaderboardEntry, getLevelTitle } from '@/hooks/useGamification';
import { useClientProfileId } from '@/hooks/useClientProfileId';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Zap } from 'lucide-react';
import { getAvatarImageUrl } from '@/hooks/useAvatars';
import { RARITY_CONFIG } from '@/lib/avatar-utils';

interface LeaderboardTableProps {
  entries: XPLeaderboardEntry[];
  isLoading?: boolean;
  emptyMessage?: string;
}

interface LeaderboardEntryWithAvatar extends XPLeaderboardEntry {
  selected_avatar_slug?: string | null;
  selected_avatar_rarity?: string | null;
}

export function LeaderboardTable({ entries, isLoading, emptyMessage = 'No entries yet' }: LeaderboardTableProps) {
  const { data: clientProfileId } = useClientProfileId();
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-16" />
        ))}
      </div>
    );
  }
  
  if (!entries || entries.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>;
  }
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
    }
  };
  
  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500/10 border-yellow-500/30';
      case 2: return 'bg-gray-400/10 border-gray-400/30';
      case 3: return 'bg-amber-600/10 border-amber-600/30';
      default: return 'bg-card border-border';
    }
  };
  
  return (
    <div className="space-y-2">
    {entries.map((entry) => {
        const entryWithAvatar = entry as LeaderboardEntryWithAvatar;
        const isMe = clientProfileId === entry.client_id;
        // Privacy-safe display: only show first name or alias, no last name
        const displayName = entry.first_name || 'Anonymous';
        const initials = entry.first_name?.[0] || 'A';
        const locationDisplay = entry.city || entry.county || entry.country;
        
        const hasAvatar = entryWithAvatar.selected_avatar_slug;
        const avatarRarity = (entryWithAvatar.selected_avatar_rarity as keyof typeof RARITY_CONFIG) || 'common';
        const rarityConfig = RARITY_CONFIG[avatarRarity];
        
        return (
          <div key={entry.client_id} className={cn('flex items-center gap-4 p-3 rounded-lg border transition-all', getRankBg(entry.rank || 0), isMe && 'ring-2 ring-primary')}>
            <div className="w-8 flex justify-center">{getRankIcon(entry.rank || 0)}</div>
            {/* Avatar or initials */}
            {hasAvatar ? (
              <div className={cn(
                'h-10 w-10 rounded-full overflow-hidden border-2',
                rarityConfig.border,
                rarityConfig.glow
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
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('font-medium truncate', isMe && 'text-primary')}>{displayName}</span>
                {isMe && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">You</span>}
              </div>
              <div className="text-xs text-muted-foreground">
                {locationDisplay && <span>{locationDisplay} • </span>}
                Level {entry.current_level} • {getLevelTitle(entry.current_level)}
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary font-bold">
              <Zap className="h-4 w-4" />
              <span>{entry.total_xp.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
