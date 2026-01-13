/**
 * Marketplace Configuration
 * 
 * ⚠️ STABILITY LOCK
 * These flags control marketplace behaviour.
 */

/**
 * Kill switch for ranked coach results.
 * 
 * When TRUE: Ranking CAN be activated if user opts in via "Best match" toggle
 * When FALSE: Ranking is disabled entirely (emergency kill switch)
 * 
 * The flag alone does NOT activate ranking - user must explicitly enable it.
 * All queries use get_marketplace_coaches_v2.
 */
export const MARKETPLACE_RANKING_ENABLED = true;
