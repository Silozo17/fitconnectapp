import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { LocationLeaderboard } from '@/components/gamification/LocationLeaderboard';
import { ShareAchievementButton } from '@/components/gamification/ShareAchievementButton';
import { useMyRank } from '@/hooks/useLeaderboard';
import { GlassCard } from '@/components/shared/GlassCard';
import { AmbientBackground } from '@/components/shared/AmbientBackground';
import { Crown, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function ClientLeaderboard() {
  const { data: myRank } = useMyRank();
  
  return (
    <ClientDashboardLayout>
      <div className="relative min-h-screen">
        <AmbientBackground intensity="subtle" />
        
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="text-muted-foreground text-sm">Compete with other members in your area</p>
            </div>
            <Link to="/dashboard/client/settings?tab=preferences">
              <Button variant="outline" size="sm" className="glass-subtle">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
          
          {/* Global Rank Card */}
          {myRank && myRank.rank && (
            <GlassCard 
              variant="elevated" 
              className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/30"
            >
              <div className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-primary/20 leaderboard-glow-gold">
                      <Crown className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Your Global Rank</div>
                      <div className="text-3xl font-bold">#{myRank.rank}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">out of {myRank.total} members</div>
                      <div className="text-lg font-semibold text-primary">{myRank.xp?.toLocaleString()} XP</div>
                    </div>
                    <ShareAchievementButton 
                      achievement={{
                        type: 'rank',
                        title: 'on the Global Leaderboard',
                        description: `I'm competing with ${myRank.total} other fitness enthusiasts!`,
                        value: myRank.rank,
                      }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
          
          {/* Main Leaderboard */}
          <LocationLeaderboard timeFrame="alltime" />
        </div>
      </div>
    </ClientDashboardLayout>
  );
}
