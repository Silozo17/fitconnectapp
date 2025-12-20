import { useTranslation } from 'react-i18next';
import { useClientBadgesAvailable, useClientBadges, Badge, RARITY_ORDER } from '@/hooks/useGamification';
import { BadgeCard } from './BadgeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const BADGE_CATEGORIES = [
  'all',
  'workout',
  'streak',
  'progress',
  'nutrition',
  'challenge',
  'social',
  'milestone',
] as const;

export function BadgeGrid() {
  const { t } = useTranslation('gamification');
  const { data: badges, isLoading: badgesLoading } = useClientBadgesAvailable();
  const { data: clientBadges, isLoading: clientBadgesLoading } = useClientBadges();
  
  const isLoading = badgesLoading || clientBadgesLoading;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }
  
  const earnedBadgeIds = new Set(clientBadges?.map(cb => cb.badge_id));
  const earnedBadgeMap = new Map(clientBadges?.map(cb => [cb.badge_id, cb.earned_at]));
  
  const earnedCount = earnedBadgeIds.size;
  const totalCount = badges?.length || 0;
  
  const filterBadges = (category: string) => {
    if (category === 'all') return badges || [];
    return badges?.filter(b => b.category === category) || [];
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{t('badges.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('badges.unlocked', { earned: earnedCount, total: totalCount })}
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50">
          {BADGE_CATEGORIES.map(cat => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              className="text-xs px-3 py-1"
            >
              {t(`badges.categories.${cat}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {BADGE_CATEGORIES.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterBadges(cat)
                .sort((a, b) => {
                  const rarityDiff = (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0);
                  if (rarityDiff !== 0) return rarityDiff;
                  const aEarned = earnedBadgeIds.has(a.id);
                  const bEarned = earnedBadgeIds.has(b.id);
                  if (aEarned && !bEarned) return -1;
                  if (!aEarned && bEarned) return 1;
                  return 0;
                })
                .map(badge => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={earnedBadgeIds.has(badge.id)}
                    earnedAt={earnedBadgeMap.get(badge.id)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
