import { TierKey } from "./stripe-config";

// Feature access configuration
export const FEATURE_ACCESS = {
  // Free tier features (available to all)
  basic_workout_plans: ["free", "starter", "pro", "enterprise", "founder"],
  client_messaging: ["free", "starter", "pro", "enterprise", "founder"],
  session_scheduling: ["free", "starter", "pro", "enterprise", "founder"],
  packages_subscriptions: ["free", "starter", "pro", "enterprise", "founder"],
  
  // Starter tier features
  workout_plan_builder: ["starter", "pro", "enterprise", "founder"],
  basic_analytics: ["starter", "pro", "enterprise", "founder"],
  digital_products: ["starter", "pro", "enterprise", "founder"],
  group_classes: ["starter", "pro", "enterprise", "founder"],
  
  // Pro tier features
  nutrition_plan_builder: ["pro", "enterprise", "founder"],
  ai_workout_generator: ["pro", "enterprise", "founder"],
  ai_meal_suggestions: ["pro", "enterprise", "founder"],
  custom_branding: ["pro", "enterprise", "founder"],
  advanced_analytics: ["pro", "enterprise", "founder"],
  client_progress_tracking: ["pro", "enterprise", "founder"],
  boost_marketing: ["pro", "enterprise", "founder"],
  
  // Enterprise tier features
  advanced_reporting: ["enterprise", "founder"],
  custom_integrations: ["enterprise", "founder"],
  ai_client_analysis: ["enterprise", "founder"],
} as const;

export type FeatureKey = keyof typeof FEATURE_ACCESS;

// Feature display names for UI
export const FEATURE_NAMES: Record<FeatureKey, string> = {
  basic_workout_plans: "Basic Workout Plans",
  client_messaging: "Client Messaging",
  session_scheduling: "Session Scheduling",
  packages_subscriptions: "Packages & Subscriptions",
  workout_plan_builder: "Workout Plan Builder",
  basic_analytics: "Basic Analytics",
  digital_products: "Digital Products",
  group_classes: "Group Classes",
  nutrition_plan_builder: "Nutrition Plan Builder",
  ai_workout_generator: "AI Workout Generator",
  ai_meal_suggestions: "AI Meal Suggestions",
  custom_branding: "Custom Branding",
  advanced_analytics: "Advanced Analytics",
  client_progress_tracking: "Client Progress Tracking",
  boost_marketing: "Boost Marketing",
  advanced_reporting: "Advanced Reporting",
  custom_integrations: "Custom Integrations",
  ai_client_analysis: "AI Client Analysis",
};

// Feature descriptions for upgrade prompts
export const FEATURE_DESCRIPTIONS: Record<FeatureKey, string> = {
  basic_workout_plans: "Create simple workout plans for your clients",
  client_messaging: "Message and communicate with your clients",
  session_scheduling: "Schedule and manage coaching sessions",
  packages_subscriptions: "Sell packages and subscriptions to clients",
  workout_plan_builder: "Build custom workout plans with exercise library",
  basic_analytics: "View basic stats and performance metrics",
  digital_products: "Sell digital products like e-books and training programs",
  group_classes: "Create and manage group fitness classes",
  nutrition_plan_builder: "Create detailed nutrition and meal plans",
  ai_workout_generator: "Generate workout plans using AI",
  ai_meal_suggestions: "Get AI-powered meal suggestions",
  custom_branding: "Customize your branding and appearance",
  advanced_analytics: "Access detailed analytics and insights",
  client_progress_tracking: "Track client progress with photos and measurements",
  boost_marketing: "Boost your profile visibility in search",
  advanced_reporting: "Generate detailed reports and exports",
  custom_integrations: "Connect with third-party services",
  ai_client_analysis: "AI-powered analysis of client progress, nutrition, and training",
};

// Check if a feature requires a specific tier
export const getMinimumTierForFeature = (feature: FeatureKey): TierKey => {
  const tiers = FEATURE_ACCESS[feature];
  return tiers[0] as TierKey;
};
