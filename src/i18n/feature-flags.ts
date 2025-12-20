/**
 * ============================================================================
 * i18n FEATURE FLAGS
 * ============================================================================
 * 
 * These flags control i18n behavior. Change with caution.
 * 
 * TOGGLE INSTRUCTIONS:
 * - Set ENABLE_BROWSER_DETECTION to true to activate auto-detection
 * - Requires app restart (not hot-reloadable at init time)
 * - Test thoroughly before deploying to production
 * 
 * @see src/i18n/index.ts - Main i18n configuration
 * ============================================================================
 */

export const I18N_FEATURE_FLAGS = {
  /**
   * Browser language detection
   * 
   * When TRUE:
   *   - Detects user's browser language on first visit
   *   - Detection order: localStorage → navigator → English fallback
   *   - Only detects languages in SUPPORTED_LANGUAGES (or ALL_LANGUAGES in dev)
   *   - Respects production whitelist (Polish excluded in prod)
   * 
   * When FALSE (default):
   *   - Uses localStorage preference only
   *   - Falls back to English if no preference stored
   *   - No browser sniffing occurs
   * 
   * CURRENT STATUS: false (disabled for UK-first launch)
   * 
   * TO ENABLE:
   * 1. Set this to true
   * 2. Restart the development server
   * 3. Clear localStorage to test fresh detection
   * 4. Set browser language to test detection flow
   */
  ENABLE_BROWSER_DETECTION: false,
} as const;

export type I18nFeatureFlags = typeof I18N_FEATURE_FLAGS;
