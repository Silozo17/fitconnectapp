import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { useXPTransactions, useClientXP, getLevelTitle } from '@/hooks/useGamification';
import { ShareAchievementButton } from '@/components/gamification/ShareAchievementButton';
import { AchievementShareCard } from '@/components/gamification/AchievementShareCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Zap, TrendingUp, TrendingDown, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientAchievements() {
  const { data: transactions, isLoading: transactionsLoading } = useXPTransactions(50);
  const { data: xpData } = useClientXP();
  
  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Achievements</h1>
            <p className="text-muted-foreground">Track your progress and unlock badges</p>
          </div>
          {xpData && (
            <ShareAchievementButton
              achievement={{
                type: 'level',
                title: `Level ${xpData.current_level}`,
                description: `${getLevelTitle(xpData.current_level)} with ${xpData.total_xp.toLocaleString()} XP earned!`,
                value: xpData.current_level,
              }}
            />
          )}
        </div>
        
        <XPProgressBar />
        
        {/* Quick Share Card for Current Level */}
        {xpData && (
          <AchievementShareCard
            achievement={{
              type: 'level',
              title: `Level ${xpData.current_level} - ${getLevelTitle(xpData.current_level)}`,
              description: `Total XP: ${xpData.total_xp.toLocaleString()} • Next level in ${xpData.xp_to_next_level - (xpData.total_xp % xpData.xp_to_next_level)} XP`,
              value: xpData.current_level,
              icon: '⬆️',
            }}
          />
        )}
        
        <Tabs defaultValue="badges" className="space-y-4">
          <TabsList>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="history">XP History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="badges">
            <BadgeGrid />
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent XP Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                  </div>
                ) : !transactions || transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No XP earned yet</p>
                    <p className="text-sm">Complete habits and workouts to earn XP!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-primary/20' : 'bg-destructive/20'}`}>
                            {tx.amount > 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{tx.description}</div>
                            <div className="text-xs text-muted-foreground">{format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}</div>
                          </div>
                        </div>
                        <div className={`font-bold ${tx.amount > 0 ? 'text-primary' : 'text-destructive'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} XP
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientDashboardLayout>
  );
}
