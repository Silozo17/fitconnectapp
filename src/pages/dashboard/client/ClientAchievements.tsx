import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { useXPTransactions, useClientXP, getLevelTitle } from '@/hooks/useGamification';
import { ShareAchievementButton } from '@/components/gamification/ShareAchievementButton';
import { AchievementShareCard } from '@/components/gamification/AchievementShareCard';
import { AvatarShowcase } from '@/components/avatars/AvatarShowcase';
import { AvatarPicker } from '@/components/avatars/AvatarPicker';
import { useSelectedAvatar } from '@/hooks/useAvatars';
import { useAutoAwardClientBadges } from '@/hooks/useAutoAwardClientBadges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Zap, TrendingUp, TrendingDown, Pencil, AlertTriangle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function AchievementsContent() {
  const { t } = useTranslation('client');
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useXPTransactions(50);
  const { data: xpData, isLoading: xpLoading, error: xpError } = useClientXP();
  const { data: selectedAvatar, isLoading: avatarLoading } = useSelectedAvatar('client');
  
  // Automatically award badges when criteria are met
  useAutoAwardClientBadges();
  
  // Show loading state while critical data is loading
  if (xpLoading || avatarLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 w-full">
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // Show error state if critical data failed
  if (xpError) {
    console.error('[ClientAchievements] XP data error:', xpError);
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('achievements.title')}</h1>
          <p className="text-muted-foreground">{t('achievements.subtitle')}</p>
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
                {t('achievements.changeAvatar')}
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
          <TabsTrigger value="badges">{t('achievements.tabs.badges')}</TabsTrigger>
          <TabsTrigger value="history">{t('achievements.tabs.history')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="badges">
          <ErrorBoundary fallback={
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Unable to load badges</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          }>
            <BadgeGrid />
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('achievements.xpHistory.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : transactionsError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Unable to load XP history</p>
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{t('achievements.xpHistory.noXpYet')}</p>
                  <p className="text-sm">{t('achievements.xpHistory.earnXp')}</p>
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
  );
}

export default function ClientAchievements() {
  return (
    <ClientDashboardLayout>
      <ErrorBoundary fallback={
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">We couldn't load your achievements</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      }>
        <AchievementsContent />
      </ErrorBoundary>
    </ClientDashboardLayout>
  );
}
