import { useBadges, useClientBadges, Badge } from '@/hooks/useGamification';
import { BadgeCard } from './BadgeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const BADGE_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'workout', label: 'Workout' },
  { value: 'streak', label: 'Streaks' },
  { value: 'progress', label: 'Progress' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'challenge', label: 'Challenges' },
  { value: 'social', label: 'Social' },
  { value: 'milestone', label: 'Milestones' },
];

export function BadgeGrid() {
  const { data: badges, isLoading: badgesLoading } = useBadges();
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
          <h3 className="text-lg font-bold">Badges</h3>
          <p className="text-sm text-muted-foreground">
            {earnedCount} of {totalCount} unlocked
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50">
          {BADGE_CATEGORIES.map(cat => (
            <TabsTrigger 
              key={cat.value} 
              value={cat.value}
              className="text-xs px-3 py-1"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {BADGE_CATEGORIES.map(cat => (
          <TabsContent key={cat.value} value={cat.value} className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterBadges(cat.value)
                .sort((a, b) => {
                  // Show earned badges first
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
