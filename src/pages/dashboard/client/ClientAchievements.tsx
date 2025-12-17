import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { useXPTransactions, useClientXP, getLevelTitle } from '@/hooks/useGamification';
import { ShareAchievementButton } from '@/components/gamification/ShareAchievementButton';
import { AchievementShareCard } from '@/components/gamification/AchievementShareCard';
import { AvatarShowcase } from '@/components/avatars/AvatarShowcase';
import { AvatarPicker } from '@/components/avatars/AvatarPicker';
import { useSelectedAvatar } from '@/hooks/useAvatars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Zap, TrendingUp, TrendingDown, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientAchievements() {
  const { data: transactions, isLoading: transactionsLoading } = useXPTransactions(50);
  const { data: xpData } = useClientXP();
  const { data: selectedAvatar } = useSelectedAvatar('client');
  
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
        
        {/* Avatar and XP Progress Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <AvatarShowcase avatar={selectedAvatar || null} size="lg" showStats={true} />
            <AvatarPicker 
              selectedAvatar={selectedAvatar || null} 
              profileType="client" 
              trigger={
                <Button variant="outline" size="sm" className="mt-3 gap-2">
                  <Pencil className="h-4 w-4" />
                  Change Avatar
                </Button>
              }
            />
          </div>
          
          {/* XP Progress */}
          <div className="flex-1 w-full">
            <XPProgressBar />
            
            {/* Quick Share Card for Current Level */}
            {xpData && (
              <div className="mt-4">
                <AchievementShareCard
                  achievement={{
                    type: 'level',
                    title: `Level ${xpData.current_level} - ${getLevelTitle(xpData.current_level)}`,
                    description: `Total XP: ${xpData.total_xp.toLocaleString()} • Next level in ${xpData.xp_to_next_level - (xpData.total_xp % xpData.xp_to_next_level)} XP`,
                    value: xpData.current_level,
                    icon: '⬆️',
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
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
