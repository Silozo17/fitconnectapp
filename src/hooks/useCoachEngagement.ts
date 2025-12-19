/**
 * Hook to fetch aggregated engagement data for coaches
 * 
 * Queries reviews and coaching sessions to build engagement scores.
 * Used by the marketplace ranking algorithm.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CoachEngagementData } from '@/types/ranking';

interface UseCoachEngagementOptions {
  coachIds: string[];
  enabled?: boolean;
}

interface EngagementQueryResult {
  coach_id: string;
  review_count: number;
  avg_rating: number | null;
  session_count: number;
  last_session_at: string | null;
}

/**
 * Fetches aggregated engagement data for a list of coaches
 * 
 * @param options.coachIds - Array of coach IDs to fetch engagement for
 * @param options.enabled - Whether to enable the query
 * @returns Map of coach ID to engagement data
 */
export function useCoachEngagement({ coachIds, enabled = true }: UseCoachEngagementOptions) {
  return useQuery({
    queryKey: ['coach-engagement', coachIds.sort().join(',')],
    queryFn: async (): Promise<Map<string, CoachEngagementData>> => {
      if (coachIds.length === 0) {
        return new Map();
      }

      // Fetch review aggregates
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('coach_id, rating')
        .in('coach_id', coachIds)
        .eq('is_public', true);

      if (reviewError) {
        console.error('Error fetching review data:', reviewError);
      }

      // Fetch session aggregates
      const { data: sessionData, error: sessionError } = await supabase
        .from('coaching_sessions')
        .select('coach_id, status, scheduled_at')
        .in('coach_id', coachIds)
        .eq('status', 'completed');

      if (sessionError) {
        console.error('Error fetching session data:', sessionError);
      }

      // Aggregate review data per coach
      const reviewAggregates = new Map<string, { count: number; sum: number }>();
      (reviewData ?? []).forEach(review => {
        const existing = reviewAggregates.get(review.coach_id) ?? { count: 0, sum: 0 };
        reviewAggregates.set(review.coach_id, {
          count: existing.count + 1,
          sum: existing.sum + (review.rating ?? 0),
        });
      });

      // Aggregate session data per coach
      const sessionAggregates = new Map<string, { count: number; lastAt: string | null }>();
      (sessionData ?? []).forEach(session => {
        const existing = sessionAggregates.get(session.coach_id) ?? { count: 0, lastAt: null };
        const scheduledAt = session.scheduled_at;
        
        let newLastAt = existing.lastAt;
        if (scheduledAt) {
          if (!newLastAt || scheduledAt > newLastAt) {
            newLastAt = scheduledAt;
          }
        }
        
        sessionAggregates.set(session.coach_id, {
          count: existing.count + 1,
          lastAt: newLastAt,
        });
      });

      // Build result map
      const result = new Map<string, CoachEngagementData>();
      
      coachIds.forEach(coachId => {
        const reviews = reviewAggregates.get(coachId);
        const sessions = sessionAggregates.get(coachId);

        result.set(coachId, {
          coach_id: coachId,
          review_count: reviews?.count ?? 0,
          avg_rating: reviews && reviews.count > 0 
            ? Math.round((reviews.sum / reviews.count) * 100) / 100 
            : null,
          session_count: sessions?.count ?? 0,
          last_session_at: sessions?.lastAt ?? null,
        });
      });

      return result;
    },
    enabled: enabled && coachIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

/**
 * Creates an empty engagement data map for cases where we don't need real data
 */
export function createEmptyEngagementMap(coachIds: string[]): Map<string, CoachEngagementData> {
  const map = new Map<string, CoachEngagementData>();
  coachIds.forEach(id => {
    map.set(id, {
      coach_id: id,
      review_count: 0,
      avg_rating: null,
      session_count: 0,
      last_session_at: null,
    });
  });
  return map;
}
