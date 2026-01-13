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
 * ⚠️ MUST remain FALSE until ranking is explicitly approved for activation.
 */
export const MARKETPLACE_RANKING_ENABLED = false;
