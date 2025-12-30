/**
 * Coach Feature Flags
 * 
 * Controls the rollout of Phase 1 coach features.
 * Set to false to disable a feature without code changes.
 */

export const COACH_FEATURE_FLAGS = {
  // Phase 1 Features
  ENHANCED_CHURN_PREDICTION: true,
  CLIENT_ENGAGEMENT_SCORING: true,
  DROPOFF_ALERTS: true,
  REVENUE_FORECASTING: true,
  CLIENT_LTV: true,
  BATCH_OPERATIONS: true,
  TEMPLATE_FOLDERS: true,
  
  // Phase 2 Features
  AI_CLIENT_SUMMARY: true,
  AI_PLATEAU_DETECTION: true,
  PACKAGE_ANALYTICS: true,
  UPSELL_INSIGHTS: true,
  GOAL_ADHERENCE_TRACKER: true,
  CLIENT_OUTCOMES_SHOWCASE: true,
  
  // Phase 3 Features
  AI_PLAN_RECOMMENDATIONS: true,
  AI_CHECKIN_COMPOSER: true,
  AUTO_PLAN_PROGRESSION: true,
  SCHEDULED_CHECKIN_AUTOMATION: true,
  CASE_STUDY_GENERATOR: true,
  REVIEW_MANAGEMENT: true,
  WEARABLE_DASHBOARD: true,
  CLIENT_COMPARISON_ANALYTICS: true,
} as const;

export type CoachFeatureFlag = keyof typeof COACH_FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: CoachFeatureFlag): boolean {
  return COACH_FEATURE_FLAGS[flag] ?? false;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): CoachFeatureFlag[] {
  return (Object.keys(COACH_FEATURE_FLAGS) as CoachFeatureFlag[]).filter(
    (flag) => COACH_FEATURE_FLAGS[flag]
  );
}
