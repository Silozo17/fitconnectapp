import { useTranslation } from 'react-i18next';
import { useClientBadgesAvailable, useClientBadges, Badge, RARITY_ORDER } from '@/hooks/useGamification';
import { BadgeCard, BadgeProgress } from './BadgeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStats } from '@/hooks/useUserStats';

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

// Calculate progress for a badge based on its criteria
const calculateBadgeProgress = (
  badge: Badge,
  stats: {
    workoutCount: number;
    habitStreak: number;
    progressEntries: number;
    challengesCompleted: number;
    xpTotal: number;
    badgesEarned: number;
  }
): BadgeProgress | undefined => {
  const criteria = badge.criteria as Record<string, number> | null;
  if (!criteria) return undefined;

  // Workout-based badges
  if (criteria.workout_count !== undefined) {
    const target = criteria.workout_count;
    const current = Math.min(stats.workoutCount, target);
    return {
      current,
      target,
      percentage: Math.min((current / target) * 100, 100),
    };
  }

  // Streak-based badges
  if (criteria.streak_days !== undefined) {
    const target = criteria.streak_days;
    const current = Math.min(stats.habitStreak, target);
    return {
      current,
      target,
      percentage: Math.min((current / target) * 100, 100),
    };
  }

  // Progress log badges
  if (criteria.progress_logs !== undefined) {
    const target = criteria.progress_logs;
    const current = Math.min(stats.progressEntries, target);
    return {
      current,
      target,
      percentage: Math.min((current / target) * 100, 100),
    };
  }

  // Challenge-based badges
  if (criteria.challenge_count !== undefined) {
    const target = criteria.challenge_count;
    const current = Math.min(stats.challengesCompleted, target);
    return {
      current,
      target,
      percentage: Math.min((current / target) * 100, 100),
    };
  }

  // XP-based badges
  if (criteria.xp_threshold !== undefined) {
    const target = criteria.xp_threshold;
    const current = Math.min(stats.xpTotal, target);
    return {
      current,
      target,
      percentage: Math.min((current / target) * 100, 100),
    };
  }

  // Badge collection badges
  if (criteria.badges_earned !== undefined) {
    const target = criteria.badges_earned;
    const current = Math.min(stats.badgesEarned, target);
    return {
      current,
      target,
      percentage: Math.min((current / target) * 100, 100),
    };
  }

  return undefined;
};

export function BadgeGrid() {
  const { t } = useTranslation('gamification');
  const { data: badges, isLoading: badgesLoading } = useClientBadgesAvailable();
  const { data: clientBadges, isLoading: clientBadgesLoading } = useClientBadges();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  
  const isLoading = badgesLoading || clientBadgesLoading || statsLoading;
  
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

  // Build stats object for progress calculation
  const stats = {
    workoutCount: userStats?.workoutCount ?? 0,
    habitStreak: userStats?.habitStreak ?? 0,
    progressEntries: userStats?.progressEntries ?? 0,
    challengesCompleted: userStats?.challengesCompleted ?? 0,
    xpTotal: userStats?.xpTotal ?? 0,
    badgesEarned: earnedCount,
  };
  
  const filterBadges = (category: string) => {
    if (category === 'all') return badges || [];
    return badges?.filter(b => b.category === category) || [];
  };

  // Get progress for a badge if not earned
  const getBadgeProgress = (badge: Badge): BadgeProgress | undefined => {
    if (earnedBadgeIds.has(badge.id)) return undefined;
    return calculateBadgeProgress(badge, stats);
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
                    progress={getBadgeProgress(badge)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
