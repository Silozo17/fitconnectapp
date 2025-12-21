import { useTranslation } from 'react-i18next';
import { XCircle, CalendarCheck, UserCheck, BadgeCheck } from 'lucide-react';
import { ComparisonStatCard } from '@/components/shared/ComparisonStatCard';
import { SessionTypeChart } from './SessionTypeChart';
import type { AdminAnalyticsData } from '@/hooks/useAdminAnalytics';

interface AnalyticsOperationalTabProps {
  analytics: AdminAnalyticsData;
  comparison: AdminAnalyticsData | null;
  showComparison: boolean;
}

export function AnalyticsOperationalTab({ 
  analytics, 
  comparison, 
  showComparison 
}: AnalyticsOperationalTabProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <ComparisonStatCard 
          title={t('analytics.sessionNoShowRate')} 
          value={analytics.sessionNoShowRate} 
          previousValue={comparison?.sessionNoShowRate} 
          icon={XCircle} 
          showComparison={showComparison}
          format="percentage"
          invertColors // Lower is better for no-show rate
        />
        <ComparisonStatCard 
          title={t('analytics.bookingConversion')} 
          value={analytics.bookingConversionRate} 
          previousValue={comparison?.bookingConversionRate} 
          icon={CalendarCheck} 
          showComparison={showComparison}
          format="percentage"
        />
        <ComparisonStatCard 
          title={t('analytics.connectionAcceptance')} 
          value={analytics.connectionAcceptanceRate} 
          previousValue={comparison?.connectionAcceptanceRate} 
          icon={UserCheck} 
          showComparison={showComparison}
          format="percentage"
        />
        <ComparisonStatCard 
          title={t('analytics.verifiedCoaches')} 
          value={analytics.verifiedCoachRate} 
          previousValue={comparison?.verifiedCoachRate} 
          icon={BadgeCheck} 
          showComparison={showComparison}
          format="percentage"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <SessionTypeChart data={analytics.sessionTypeDistribution} />
      </div>
    </div>
  );
}
