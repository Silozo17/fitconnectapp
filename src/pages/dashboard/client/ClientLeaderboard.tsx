import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable';
import { useWeeklyLeaderboard, useMonthlyLeaderboard, useAllTimeLeaderboard, useMyRank } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Crown } from 'lucide-react';

export default function ClientLeaderboard() {
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyLeaderboard(20);
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyLeaderboard(20);
  const { data: allTimeData, isLoading: allTimeLoading } = useAllTimeLeaderboard(20);
  const { data: myRank } = useMyRank();
  
  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other members</p>
        </div>
        
        {myRank && myRank.rank && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 rounded-full p-3"><Crown className="h-6 w-6 text-primary" /></div>
                  <div>
                    <div className="text-sm text-muted-foreground">Your Rank</div>
                    <div className="text-2xl font-bold">#{myRank.rank}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">out of {myRank.total} members</div>
                  <div className="text-lg font-medium text-primary">{myRank.xp?.toLocaleString()} XP</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly" className="flex items-center gap-2"><Medal className="h-4 w-4" />This Week</TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2"><Trophy className="h-4 w-4" />This Month</TabsTrigger>
            <TabsTrigger value="alltime" className="flex items-center gap-2"><Crown className="h-4 w-4" />All Time</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Medal className="h-5 w-5 text-primary" />Weekly Leaderboard</CardTitle></CardHeader>
              <CardContent><LeaderboardTable entries={weeklyData || []} isLoading={weeklyLoading} emptyMessage="No XP earned this week yet. Be the first!" /></CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="monthly">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" />Monthly Leaderboard</CardTitle></CardHeader>
              <CardContent><LeaderboardTable entries={monthlyData || []} isLoading={monthlyLoading} emptyMessage="No XP earned this month yet. Be the first!" /></CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alltime">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Crown className="h-5 w-5 text-primary" />All-Time Leaderboard</CardTitle></CardHeader>
              <CardContent><LeaderboardTable entries={allTimeData || []} isLoading={allTimeLoading} emptyMessage="No entries yet. Start earning XP!" /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientDashboardLayout>
  );
}
