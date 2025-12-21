import { useTranslation } from 'react-i18next';
import { PoundSterling, TrendingUp, CreditCard } from 'lucide-react';
import { ComparisonStatCard } from '@/components/shared/ComparisonStatCard';
import { TierDistributionChart } from './TierDistributionChart';
import type { AdminAnalyticsData } from '@/hooks/useAdminAnalytics';

interface AnalyticsMonetisationTabProps {
  analytics: AdminAnalyticsData;
  comparison: AdminAnalyticsData | null;
  showComparison: boolean;
}

export function AnalyticsMonetisationTab({ 
  analytics, 
  comparison, 
  showComparison 
}: AnalyticsMonetisationTabProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
        <ComparisonStatCard 
          title={t('analytics.totalGMV')} 
          value={analytics.totalGMV} 
          previousValue={comparison?.totalGMV} 
          icon={PoundSterling} 
          showComparison={showComparison}
          format="currency"
        />
        <ComparisonStatCard 
          title={t('analytics.platformCommission')} 
          value={analytics.platformCommission} 
          previousValue={comparison?.platformCommission} 
          icon={TrendingUp} 
          showComparison={showComparison}
          format="currency"
        />
        <ComparisonStatCard 
          title={t('analytics.coachMRR')} 
          value={analytics.coachSubscriptionMRR} 
          previousValue={comparison?.coachSubscriptionMRR} 
          icon={CreditCard} 
          showComparison={showComparison}
          format="currency"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <TierDistributionChart data={analytics.tierDistribution} />
      </div>
    </div>
  );
}
