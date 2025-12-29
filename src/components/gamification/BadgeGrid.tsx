import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClientBadgesAvailable, useClientBadges, Badge, RARITY_ORDER } from '@/hooks/useGamification';
import { BadgeCard, BadgeProgress } from './BadgeCard';
import { ClaimBadgeModal } from './ClaimBadgeModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStats } from '@/hooks/useUserStats';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
  challengesWon: number;
  xpTotal: number;
  currentLevel: number;
  badgesEarned: number;
  leaderboardRank: number;
  goalsAchieved: number;
  macroDays: number;
  stepsTotal: number;
  caloriesTotal: number;
  distanceTotal: number;
  activeMinutesTotal: number;
  wearableWorkoutCount: number;
  sleepHoursTotal: number;
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
    const legacyKeys = [
      'workout_count', 'streak_days', 'progress_logs', 'progress_count', 
      'photo_count', 'challenge_count', 'challenge_completed', 'challenge_joined',
      'challenge_won', 'xp_threshold', 'level_reached', 'badges_earned', 
      'leaderboard_entry', 'leaderboard_rank', 'goal_achieved',
      'nutrition_days', 'meal_days', 'macro_days',
      'steps_total', 'calories_total', 'distance_total', 'active_minutes_total', 
      'wearable_workout_count', 'sleep_hours_total', 'devices_connected', 'coach_connected'
    ];
    
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
    // Workout criteria
    case 'workout_count':
      current = stats.workoutCount;
      break;
    
    // Streak criteria
    case 'streak_days':
      current = stats.habitStreak;
      break;
    
    // Progress criteria
    case 'progress_logs':
    case 'progress_count':
      current = stats.progressEntries;
      break;
    case 'photo_count':
      current = stats.progressPhotos;
      break;
    
    // Challenge criteria
    case 'challenge_count':
    case 'challenge_completed':
      current = stats.challengesCompleted;
      break;
    case 'challenge_joined':
      current = stats.challengesJoined;
      break;
    case 'challenge_won':
      current = stats.challengesWon;
      break;
    
    // XP and level criteria
    case 'xp_threshold':
      current = stats.xpTotal;
      break;
    case 'level_reached':
      current = stats.currentLevel;
      break;
    
    // Badge collection criteria
    case 'badges_earned':
      current = stats.badgesEarned;
      break;
    
    // Leaderboard criteria
    case 'leaderboard_entry':
      current = stats.leaderboardRank > 0 ? 1 : 0;
      break;
    case 'leaderboard_rank':
      // For rank, lower is better, so invert the logic
      current = stats.leaderboardRank > 0 && stats.leaderboardRank <= target ? target : 0;
      break;
    
    // Goal criteria
    case 'goal_achieved':
      current = stats.goalsAchieved;
      break;
    
    // Nutrition criteria
    case 'nutrition_days':
    case 'meal_days':
    case 'macro_days':
      current = stats.macroDays;
      break;
    
    // Wearable criteria
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
    case 'wearable_workout_count':
      current = stats.wearableWorkoutCount;
      break;
    case 'sleep_hours_total':
      current = stats.sleepHoursTotal;
      break;
    case 'devices_connected':
      current = stats.devicesConnected;
      break;
    
    // Coach connection
    case 'coach_connected':
      current = stats.coachConnected ? 1 : 0;
      break;
    
    // Special workout types (time-based, not yet tracked)
    case 'early_workout':
    case 'late_workout':
    case 'weekend_workouts':
      current = 0; // Not yet implemented
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
  const queryClient = useQueryClient();
  const { data: badges, isLoading: badgesLoading } = useClientBadgesAvailable();
  const { data: clientBadges, isLoading: clientBadgesLoading } = useClientBadges();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  
  // Claim modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimingBadge, setClaimingBadge] = useState<Badge | null>(null);
  const [claimingXP, setClaimingXP] = useState(0);
  
  const isLoading = badgesLoading || clientBadgesLoading || statsLoading;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }
  
  const earnedBadgeIds = new Set(clientBadges?.map(cb => cb.badge_id));
  const earnedBadgeMap = new Map(clientBadges?.map(cb => [cb.badge_id, cb.earned_at]));
  const claimedBadgeMap = new Map(clientBadges?.map(cb => [cb.badge_id, (cb as any).is_claimed ?? true]));
  
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
    challengesWon: userStats?.challengesWon ?? 0,
    xpTotal: userStats?.xpTotal ?? 0,
    currentLevel: userStats?.currentLevel ?? 1,
    badgesEarned: earnedCount,
    leaderboardRank: userStats?.leaderboardRank ?? 0,
    goalsAchieved: userStats?.goalsAchieved ?? 0,
    macroDays: userStats?.macroDays ?? 0,
    stepsTotal: userStats?.stepsTotal ?? 0,
    caloriesTotal: userStats?.caloriesTotal ?? 0,
    distanceTotal: userStats?.distanceTotal ?? 0,
    activeMinutesTotal: userStats?.activeMinutesTotal ?? 0,
    wearableWorkoutCount: userStats?.wearableWorkoutCount ?? 0,
    sleepHoursTotal: userStats?.sleepHoursTotal ?? 0,
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

  // Handle claiming a badge
  const handleClaimBadge = (badge: Badge) => {
    setClaimingBadge(badge);
    setClaimingXP(badge.xp_reward);
    setClaimModalOpen(true);
  };

  // Mark badge as claimed in database
  const handleBadgeClaimed = async () => {
    if (!claimingBadge) return;
    
    try {
      const clientBadge = clientBadges?.find(cb => cb.badge_id === claimingBadge.id);
      if (clientBadge) {
        await supabase
          .from('client_badges')
          .update({ is_claimed: true })
          .eq('id', clientBadge.id);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['client-badges'] });
      }
    } catch (error) {
      console.error('Error claiming badge:', error);
      toast.error('Failed to claim badge');
    }
  };

  const handleCloseModal = () => {
    setClaimModalOpen(false);
    setClaimingBadge(null);
    setClaimingXP(0);
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
                .map(badge => {
                  const isEarned = earnedBadgeIds.has(badge.id);
                  const isClaimed = claimedBadgeMap.get(badge.id) ?? true;
                  
                  return (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      earned={isEarned}
                      earnedAt={earnedBadgeMap.get(badge.id)}
                      progress={getBadgeProgress(badge)}
                      isClaimed={isClaimed}
                      onClaim={isEarned && !isClaimed ? () => handleClaimBadge(badge) : undefined}
                    />
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Claim celebration modal */}
      <ClaimBadgeModal
        isOpen={claimModalOpen}
        onClose={handleCloseModal}
        badge={claimingBadge}
        xpEarned={claimingXP}
        onClaimed={handleBadgeClaimed}
      />
    </div>
  );
}
