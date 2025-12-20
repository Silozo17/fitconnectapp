/**
 * ============================================================================
 * i18n FEATURE FLAGS
 * ============================================================================
 * 
 * These flags control i18n behavior. Change with caution.
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
   *   - Only detects languages in SUPPORTED_LANGUAGES
   * 
   * When FALSE:
   *   - Uses localStorage preference only
   *   - Falls back to English if no preference stored
   *   - No browser sniffing occurs
   * 
   * CURRENT STATUS: true (auto-detects English/Polish)
   */
  ENABLE_BROWSER_DETECTION: true,
} as const;

export type I18nFeatureFlags = typeof I18N_FEATURE_FLAGS;
