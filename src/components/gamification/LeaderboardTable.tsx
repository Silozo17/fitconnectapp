import { XPLeaderboardEntry, getLevelTitle } from '@/hooks/useGamification';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Zap } from 'lucide-react';

interface LeaderboardTableProps {
  entries: XPLeaderboardEntry[];
  isLoading?: boolean;
  emptyMessage?: string;
}

function useClientProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-client-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('client_profiles').select('id').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });
}

export function LeaderboardTable({ entries, isLoading, emptyMessage = 'No entries yet' }: LeaderboardTableProps) {
  const { data: profile } = useClientProfile();
  
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
        const isMe = profile?.id === entry.client_id;
        // Privacy-safe display: only show first name or alias, no last name
        const displayName = entry.first_name || 'Anonymous';
        const initials = entry.first_name?.[0] || 'A';
        const locationDisplay = entry.city || entry.county || entry.country;
        
        return (
          <div key={entry.client_id} className={cn('flex items-center gap-4 p-3 rounded-lg border transition-all', getRankBg(entry.rank || 0), isMe && 'ring-2 ring-primary')}>
            <div className="w-8 flex justify-center">{getRankIcon(entry.rank || 0)}</div>
            {/* Privacy: No avatar shown on leaderboards */}
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {initials}
            </div>
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
