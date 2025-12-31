import { TierKey } from "./stripe-config";

// Feature access configuration
export const FEATURE_ACCESS = {
  // ============================================
  // FREE TIER FEATURES (available to all)
  // ============================================
  basic_workout_plans: ["free", "starter", "pro", "enterprise", "founder"],
  client_messaging: ["free", "starter", "pro", "enterprise", "founder"],
  session_scheduling: ["free", "starter", "pro", "enterprise", "founder"],
  packages_subscriptions: ["free", "starter", "pro", "enterprise", "founder"],
  
  // ============================================
  // STARTER TIER FEATURES
  // ============================================
  workout_plan_builder: ["starter", "pro", "enterprise", "founder"],
  basic_analytics: ["starter", "pro", "enterprise", "founder"],
  digital_products: ["starter", "pro", "enterprise", "founder"],
  group_classes: ["starter", "pro", "enterprise", "founder"],
  batch_operations: ["starter", "pro", "enterprise", "founder"],
  template_folders: ["starter", "pro", "enterprise", "founder"],
  
  // ============================================
  // PRO TIER FEATURES
  // ============================================
  nutrition_plan_builder: ["pro", "enterprise", "founder"],
  ai_workout_generator: ["pro", "enterprise", "founder"],
  ai_meal_suggestions: ["pro", "enterprise", "founder"],
  custom_branding: ["pro", "enterprise", "founder"],
  advanced_analytics: ["pro", "enterprise", "founder"],
  client_progress_tracking: ["pro", "enterprise", "founder"],
  boost_marketing: ["pro", "enterprise", "founder"],
  client_engagement_scoring: ["pro", "enterprise", "founder"],
  revenue_forecasting: ["pro", "enterprise", "founder"],
  client_ltv: ["pro", "enterprise", "founder"],
  package_analytics: ["pro", "enterprise", "founder"],
  goal_adherence_tracker: ["pro", "enterprise", "founder"],
  scheduled_checkin_automation: ["pro", "enterprise", "founder"],
  review_management: ["pro", "enterprise", "founder"],
  
  // ============================================
  // ENTERPRISE TIER FEATURES
  // ============================================
  advanced_reporting: ["enterprise", "founder"],
  custom_integrations: ["enterprise", "founder"],
  ai_client_analysis: ["enterprise", "founder"],
  enhanced_churn_prediction: ["enterprise", "founder"],
  dropoff_alerts: ["enterprise", "founder"],
  ai_client_summary: ["enterprise", "founder"],
  ai_plateau_detection: ["enterprise", "founder"],
  upsell_insights: ["enterprise", "founder"],
  client_outcomes_showcase: ["enterprise", "founder"],
  ai_plan_recommendations: ["enterprise", "founder"],
  ai_checkin_composer: ["enterprise", "founder"],
  auto_plan_progression: ["enterprise", "founder"],
  case_study_generator: ["enterprise", "founder"],
  wearable_dashboard: ["enterprise", "founder"],
  client_comparison_analytics: ["enterprise", "founder"],
} as const;

export type FeatureKey = keyof typeof FEATURE_ACCESS;

// Feature display names for UI
export const FEATURE_NAMES: Record<FeatureKey, string> = {
  // Free tier
  basic_workout_plans: "Basic Workout Plans",
  client_messaging: "Client Messaging",
  session_scheduling: "Session Scheduling",
  packages_subscriptions: "Packages & Subscriptions",
  
  // Starter tier
  workout_plan_builder: "Workout Plan Builder",
  basic_analytics: "Basic Analytics",
  digital_products: "Digital Products",
  group_classes: "Group Classes",
  batch_operations: "Batch Operations",
  template_folders: "Template Folders",
  
  // Pro tier
  nutrition_plan_builder: "Nutrition Plan Builder",
  ai_workout_generator: "AI Workout Generator",
  ai_meal_suggestions: "AI Meal Suggestions",
  custom_branding: "Custom Branding",
  advanced_analytics: "Advanced Analytics",
  client_progress_tracking: "Client Progress Tracking",
  boost_marketing: "Boost Marketing",
  client_engagement_scoring: "Client Engagement Scoring",
  revenue_forecasting: "Revenue Forecasting",
  client_ltv: "Client Lifetime Value",
  package_analytics: "Package Analytics",
  goal_adherence_tracker: "Goal Adherence Tracker",
  scheduled_checkin_automation: "Scheduled Check-in Automation",
  review_management: "Review Management",
  
  // Enterprise tier
  advanced_reporting: "Advanced Reporting",
  custom_integrations: "Custom Integrations",
  ai_client_analysis: "AI Client Analysis",
  enhanced_churn_prediction: "Churn Prediction",
  dropoff_alerts: "Drop-off Alerts",
  ai_client_summary: "AI Client Summary",
  ai_plateau_detection: "AI Plateau Detection",
  upsell_insights: "Upsell Insights",
  client_outcomes_showcase: "Client Outcomes Showcase",
  ai_plan_recommendations: "AI Plan Recommendations",
  ai_checkin_composer: "AI Check-in Composer",
  auto_plan_progression: "Auto Plan Progression",
  case_study_generator: "Case Study Generator",
  wearable_dashboard: "Wearable Dashboard",
  client_comparison_analytics: "Client Comparison Analytics",
};

// Feature descriptions for upgrade prompts
export const FEATURE_DESCRIPTIONS: Record<FeatureKey, string> = {
  // Free tier
  basic_workout_plans: "Create simple workout plans for your clients",
  client_messaging: "Message and communicate with your clients",
  session_scheduling: "Schedule and manage coaching sessions",
  packages_subscriptions: "Sell packages and subscriptions to clients",
  
  // Starter tier
  workout_plan_builder: "Build custom workout plans with exercise library",
  basic_analytics: "View basic stats and performance metrics",
  digital_products: "Sell digital products like e-books and training programs",
  group_classes: "Create and manage group fitness classes",
  batch_operations: "Perform bulk operations on multiple clients at once",
  template_folders: "Organize workout and nutrition templates into folders",
  
  // Pro tier
  nutrition_plan_builder: "Create detailed nutrition and meal plans",
  ai_workout_generator: "Generate workout plans using AI",
  ai_meal_suggestions: "Get AI-powered meal suggestions",
  custom_branding: "Customize your branding and appearance",
  advanced_analytics: "Access detailed analytics and insights",
  client_progress_tracking: "Track client progress with photos and measurements",
  boost_marketing: "Boost your profile visibility in search",
  client_engagement_scoring: "Score and track client engagement levels",
  revenue_forecasting: "Forecast future revenue based on client data",
  client_ltv: "Calculate and track client lifetime value",
  package_analytics: "Analyze package performance and sales metrics",
  goal_adherence_tracker: "Track how well clients stick to their goals",
  scheduled_checkin_automation: "Automate scheduled check-ins with clients",
  review_management: "Manage and respond to client reviews",
  
  // Enterprise tier
  advanced_reporting: "Generate detailed reports and exports",
  custom_integrations: "Connect with third-party services",
  ai_client_analysis: "AI-powered analysis of client progress",
  enhanced_churn_prediction: "Predict which clients are at risk of leaving",
  dropoff_alerts: "Get alerts when client activity drops significantly",
  ai_client_summary: "AI-generated summaries of client progress and needs",
  ai_plateau_detection: "Detect when clients hit training plateaus",
  upsell_insights: "Identify opportunities to upsell services",
  client_outcomes_showcase: "Showcase client transformations publicly",
  ai_plan_recommendations: "Get AI-powered plan adjustment recommendations",
  ai_checkin_composer: "AI-composed check-in messages for clients",
  auto_plan_progression: "Automatically progress clients through training plans",
  case_study_generator: "Generate case studies from client transformations",
  wearable_dashboard: "View aggregated wearable device data for clients",
  client_comparison_analytics: "Compare metrics across multiple clients",
};

// Check if a feature requires a specific tier
export const getMinimumTierForFeature = (feature: FeatureKey): TierKey => {
  const tiers = FEATURE_ACCESS[feature];
  return tiers[0] as TierKey;
};
