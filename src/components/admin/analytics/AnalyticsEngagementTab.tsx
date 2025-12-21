import { useTranslation } from 'react-i18next';
import { Star, MessageSquare, Repeat, CheckCircle } from 'lucide-react';
import { ComparisonStatCard } from '@/components/shared/ComparisonStatCard';
import type { AdminAnalyticsData } from '@/hooks/useAdminAnalytics';

interface AnalyticsEngagementTabProps {
  analytics: AdminAnalyticsData;
  comparison: AdminAnalyticsData | null;
  showComparison: boolean;
}

export function AnalyticsEngagementTab({ 
  analytics, 
  comparison, 
  showComparison 
}: AnalyticsEngagementTabProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <ComparisonStatCard 
          title={t('analytics.averageRating')} 
          value={`${analytics.averageRating.toFixed(1)}/5`} 
          previousValue={comparison ? `${comparison.averageRating.toFixed(1)}/5` : undefined} 
          icon={Star} 
          showComparison={showComparison}
          format="string"
        />
        <ComparisonStatCard 
          title={t('analytics.totalReviews')} 
          value={analytics.totalReviews} 
          previousValue={comparison?.totalReviews} 
          icon={MessageSquare} 
          showComparison={showComparison}
        />
        <ComparisonStatCard 
          title={t('analytics.repeatBookingRate')} 
          value={analytics.repeatBookingRate} 
          previousValue={comparison?.repeatBookingRate} 
          icon={Repeat} 
          showComparison={showComparison}
          format="percentage"
        />
        <ComparisonStatCard 
          title={t('analytics.sessionCompletionRate')} 
          value={analytics.sessionCompletionRate} 
          previousValue={comparison?.sessionCompletionRate} 
          icon={CheckCircle} 
          showComparison={showComparison}
          format="percentage"
        />
      </div>
    </div>
  );
}
