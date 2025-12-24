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

// Extended stats interface for badge progress calculation
interface BadgeStats {
  workoutCount: number;
  habitStreak: number;
  progressEntries: number;
  progressPhotos: number;
  challengesCompleted: number;
  challengesJoined: number;
  xpTotal: number;
  badgesEarned: number;
  stepsTotal: number;
  caloriesTotal: number;
  distanceTotal: number;
  activeMinutesTotal: number;
  devicesConnected: number;
  coachConnected: boolean;
}

// Calculate progress for a badge based on its criteria
// Supports both {type, value} format and legacy {key: value} format
const calculateBadgeProgress = (
  badge: Badge,
  stats: BadgeStats
): BadgeProgress | undefined => {
  const criteria = badge.criteria as { type?: string; value?: number } & Record<string, number> | null;
  if (!criteria) return undefined;

  let criteriaType: string | undefined;
  let target: number | undefined;

  // Check for {type, value} format (database structure)
  if (criteria.type && criteria.value !== undefined) {
    criteriaType = criteria.type;
    target = criteria.value;
  } else {
    // Fallback to legacy {key: value} format
    const legacyKeys = ['workout_count', 'streak_days', 'progress_logs', 'progress_count', 
      'photo_count', 'challenge_count', 'challenge_completed', 'challenge_joined',
      'xp_threshold', 'badges_earned', 'steps_total', 'calories_total', 
      'distance_total', 'active_minutes_total', 'devices_connected', 'coach_connected'];
    
    for (const key of legacyKeys) {
      if (criteria[key] !== undefined) {
        criteriaType = key;
        target = criteria[key];
        break;
      }
    }
  }

  if (!criteriaType || target === undefined) return undefined;

  let current = 0;

  switch (criteriaType) {
    case 'workout_count':
      current = stats.workoutCount;
      break;
    case 'streak_days':
      current = stats.habitStreak;
      break;
    case 'progress_logs':
    case 'progress_count':
      current = stats.progressEntries;
      break;
    case 'photo_count':
      current = stats.progressPhotos;
      break;
    case 'challenge_count':
    case 'challenge_completed':
      current = stats.challengesCompleted;
      break;
    case 'challenge_joined':
      current = stats.challengesJoined;
      break;
    case 'xp_threshold':
      current = stats.xpTotal;
      break;
    case 'badges_earned':
      current = stats.badgesEarned;
      break;
    case 'steps_total':
      current = stats.stepsTotal;
      break;
    case 'calories_total':
      current = stats.caloriesTotal;
      break;
    case 'distance_total':
      current = stats.distanceTotal;
      break;
    case 'active_minutes_total':
      current = stats.activeMinutesTotal;
      break;
    case 'devices_connected':
      current = stats.devicesConnected;
      break;
    case 'coach_connected':
      current = stats.coachConnected ? 1 : 0;
      break;
    default:
      return undefined;
  }

  return {
    current: Math.min(current, target),
    target,
    percentage: Math.min((current / target) * 100, 100),
  };
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
  const stats: BadgeStats = {
    workoutCount: userStats?.workoutCount ?? 0,
    habitStreak: userStats?.habitStreak ?? 0,
    progressEntries: userStats?.progressEntries ?? 0,
    progressPhotos: userStats?.progressPhotos ?? 0,
    challengesCompleted: userStats?.challengesCompleted ?? 0,
    challengesJoined: userStats?.challengesJoined ?? 0,
    xpTotal: userStats?.xpTotal ?? 0,
    badgesEarned: earnedCount,
    stepsTotal: userStats?.stepsTotal ?? 0,
    caloriesTotal: userStats?.caloriesTotal ?? 0,
    distanceTotal: userStats?.distanceTotal ?? 0,
    activeMinutesTotal: userStats?.activeMinutesTotal ?? 0,
    devicesConnected: userStats?.devicesConnected ?? 0,
    coachConnected: userStats?.coachConnected ?? false,
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
