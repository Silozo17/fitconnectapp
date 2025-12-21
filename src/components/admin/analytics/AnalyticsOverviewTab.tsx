import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Dumbbell, Calendar, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { ComparisonStatCard } from '@/components/shared/ComparisonStatCard';
import type { AdminAnalyticsData, UserGrowthData, SessionActivityData } from '@/hooks/useAdminAnalytics';

interface AnalyticsOverviewTabProps {
  analytics: AdminAnalyticsData;
  comparison: AdminAnalyticsData | null;
  userGrowthData: UserGrowthData[];
  sessionData: SessionActivityData[];
  showComparison: boolean;
}

export function AnalyticsOverviewTab({ 
  analytics, 
  comparison, 
  userGrowthData, 
  sessionData, 
  showComparison 
}: AnalyticsOverviewTabProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <ComparisonStatCard 
          title={t('analytics.totalClients')} 
          value={analytics.totalClients} 
          previousValue={comparison?.totalClients} 
          icon={Users} 
          showComparison={showComparison} 
        />
        <ComparisonStatCard 
          title={t('analytics.totalCoaches')} 
          value={analytics.totalCoaches} 
          previousValue={comparison?.totalCoaches} 
          icon={Dumbbell} 
          showComparison={showComparison} 
        />
        <ComparisonStatCard 
          title={t('analytics.totalSessions')} 
          value={analytics.totalSessions} 
          previousValue={comparison?.totalSessions} 
          icon={Calendar} 
          showComparison={showComparison} 
        />
        <ComparisonStatCard 
          title={t('analytics.messagesSent')} 
          value={analytics.totalMessages} 
          previousValue={comparison?.totalMessages} 
          icon={MessageSquare} 
          showComparison={showComparison} 
        />
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('analytics.userGrowth')}
            </CardTitle>
            <CardDescription>{t('analytics.newUsersOverTime')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="clients" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name={t('analytics.clients')} />
                  <Area type="monotone" dataKey="coaches" stackId="1" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} name={t('analytics.coaches')} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {t('analytics.sessionActivity')}
            </CardTitle>
            <CardDescription>{t('analytics.scheduledVsCompleted')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="scheduled" fill="hsl(var(--muted-foreground))" name={t('analytics.scheduled')} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" name={t('analytics.completed')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
