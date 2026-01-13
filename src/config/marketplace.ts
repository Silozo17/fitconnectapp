/**
 * Marketplace Configuration
 * 
 * ⚠️ STABILITY LOCK
 * These flags control marketplace behaviour.
 * Changes here affect coach visibility and ordering.
 */

/**
 * Feature flag for enabling ranked coach results.
 * When TRUE: Uses get_ranked_coaches_v1 when location is known.
 * When FALSE: Uses get_simple_coaches or get_filtered_coaches_v1 only.
 * 
 * ⚠️ Ranking is now ENABLED but requires user opt-in via "Best match" toggle.
 * The flag alone does NOT activate ranking - user must explicitly enable it.
 */
export const MARKETPLACE_RANKING_ENABLED = true;
