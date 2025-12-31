-- ============================================
-- Add all missing features to platform_features table
-- ============================================

-- Free tier features
INSERT INTO platform_features (name, feature_key, feature_type, description, category, default_value)
VALUES 
  ('Basic Workout Plans', 'basic_workout_plans', 'boolean', 'Create simple workout plans for your clients', 'general', '"true"'),
  ('Client Messaging', 'client_messaging', 'boolean', 'Message and communicate with your clients', 'general', '"true"'),
  ('Session Scheduling', 'session_scheduling', 'boolean', 'Schedule and manage coaching sessions', 'general', '"true"'),
  ('Packages & Subscriptions', 'packages_subscriptions', 'boolean', 'Sell packages and subscriptions to clients', 'general', '"true"')
ON CONFLICT (feature_key) DO NOTHING;

-- Starter tier features
INSERT INTO platform_features (name, feature_key, feature_type, description, category, default_value)
VALUES 
  ('Workout Plan Builder', 'workout_plan_builder', 'boolean', 'Build custom workout plans with exercise library', 'general', '"false"'),
  ('Basic Analytics', 'basic_analytics', 'boolean', 'View basic stats and performance metrics', 'general', '"false"'),
  ('Digital Products', 'digital_products', 'boolean', 'Sell digital products like e-books and training programs', 'general', '"false"'),
  ('Group Classes', 'group_classes', 'boolean', 'Create and manage group fitness classes', 'general', '"false"'),
  ('Batch Operations', 'batch_operations', 'boolean', 'Perform bulk operations on multiple clients at once', 'general', '"false"'),
  ('Template Folders', 'template_folders', 'boolean', 'Organize workout and nutrition templates into folders', 'general', '"false"')
ON CONFLICT (feature_key) DO NOTHING;

-- Pro tier features
INSERT INTO platform_features (name, feature_key, feature_type, description, category, default_value)
VALUES 
  ('Nutrition Plan Builder', 'nutrition_plan_builder', 'tier', 'Create detailed nutrition and meal plans', 'general', '"none"'),
  ('AI Workout Generator', 'ai_workout_generator', 'tier', 'Generate workout plans using AI', 'general', '"none"'),
  ('Custom Branding', 'custom_branding', 'boolean', 'Customize your branding and appearance', 'general', '"false"'),
  ('Advanced Analytics', 'advanced_analytics', 'boolean', 'Access detailed analytics and insights', 'general', '"false"'),
  ('Client Progress Tracking', 'client_progress_tracking', 'boolean', 'Track client progress with photos and measurements', 'general', '"false"'),
  ('Boost Marketing', 'boost_marketing', 'boolean', 'Boost your profile visibility in search', 'general', '"false"'),
  ('Client Engagement Scoring', 'client_engagement_scoring', 'boolean', 'Score and track client engagement levels', 'general', '"false"'),
  ('Revenue Forecasting', 'revenue_forecasting', 'boolean', 'Forecast future revenue based on client data', 'general', '"false"'),
  ('Client Lifetime Value', 'client_ltv', 'boolean', 'Calculate and track client lifetime value', 'general', '"false"'),
  ('Package Analytics', 'package_analytics', 'boolean', 'Analyze package performance and sales metrics', 'general', '"false"'),
  ('Goal Adherence Tracker', 'goal_adherence_tracker', 'boolean', 'Track how well clients stick to their goals', 'general', '"false"'),
  ('Scheduled Check-in Automation', 'scheduled_checkin_automation', 'boolean', 'Automate scheduled check-ins with clients', 'general', '"false"'),
  ('Review Management', 'review_management', 'boolean', 'Manage and respond to client reviews', 'general', '"false"')
ON CONFLICT (feature_key) DO NOTHING;

-- Enterprise tier features
INSERT INTO platform_features (name, feature_key, feature_type, description, category, default_value)
VALUES 
  ('Advanced Reporting', 'advanced_reporting', 'tier', 'Generate detailed reports and exports', 'general', '"none"'),
  ('Custom Integrations', 'custom_integrations', 'boolean', 'Connect with third-party services', 'general', '"false"'),
  ('AI Client Analysis', 'ai_client_analysis', 'tier', 'AI-powered analysis of client progress', 'general', '"none"'),
  ('Churn Prediction', 'enhanced_churn_prediction', 'boolean', 'Predict which clients are at risk of leaving', 'general', '"false"'),
  ('Drop-off Alerts', 'dropoff_alerts', 'boolean', 'Get alerts when client activity drops significantly', 'general', '"false"'),
  ('AI Client Summary', 'ai_client_summary', 'boolean', 'AI-generated summaries of client progress and needs', 'general', '"false"'),
  ('AI Plateau Detection', 'ai_plateau_detection', 'boolean', 'Detect when clients hit training plateaus', 'general', '"false"'),
  ('Upsell Insights', 'upsell_insights', 'boolean', 'Identify opportunities to upsell services', 'general', '"false"'),
  ('Client Outcomes Showcase', 'client_outcomes_showcase', 'boolean', 'Showcase client transformations publicly', 'general', '"false"'),
  ('AI Plan Recommendations', 'ai_plan_recommendations', 'boolean', 'Get AI-powered plan adjustment recommendations', 'general', '"false"'),
  ('AI Check-in Composer', 'ai_checkin_composer', 'boolean', 'AI-composed check-in messages for clients', 'general', '"false"'),
  ('Auto Plan Progression', 'auto_plan_progression', 'boolean', 'Automatically progress clients through training plans', 'general', '"false"'),
  ('Case Study Generator', 'case_study_generator', 'boolean', 'Generate case studies from client transformations', 'general', '"false"'),
  ('Wearable Dashboard', 'wearable_dashboard', 'boolean', 'View aggregated wearable device data for clients', 'general', '"false"'),
  ('Client Comparison Analytics', 'client_comparison_analytics', 'boolean', 'Compare metrics across multiple clients', 'general', '"false"')
ON CONFLICT (feature_key) DO NOTHING;

-- ============================================
-- Add tier_features entries for each tier
-- ============================================

-- Free tier - gets basic features
INSERT INTO tier_features (feature_id, tier, value)
SELECT id, 'free', 'true' FROM platform_features WHERE feature_key IN ('basic_workout_plans', 'client_messaging', 'session_scheduling', 'packages_subscriptions')
ON CONFLICT DO NOTHING;

-- Starter tier - gets free + starter features
INSERT INTO tier_features (feature_id, tier, value)
SELECT id, 'starter', 'true' FROM platform_features WHERE feature_key IN (
  'basic_workout_plans', 'client_messaging', 'session_scheduling', 'packages_subscriptions',
  'workout_plan_builder', 'basic_analytics', 'digital_products', 'group_classes', 'batch_operations', 'template_folders'
)
ON CONFLICT DO NOTHING;

-- Pro tier - gets free + starter + pro features
INSERT INTO tier_features (feature_id, tier, value)
SELECT id, 'pro', 'true' FROM platform_features WHERE feature_key IN (
  'basic_workout_plans', 'client_messaging', 'session_scheduling', 'packages_subscriptions',
  'workout_plan_builder', 'basic_analytics', 'digital_products', 'group_classes', 'batch_operations', 'template_folders',
  'nutrition_plan_builder', 'ai_workout_generator', 'ai_meal_suggestions', 'custom_branding', 'advanced_analytics',
  'client_progress_tracking', 'boost_marketing', 'client_engagement_scoring', 'revenue_forecasting', 'client_ltv',
  'package_analytics', 'goal_adherence_tracker', 'scheduled_checkin_automation', 'review_management'
)
ON CONFLICT DO NOTHING;

-- Enterprise tier - gets all features
INSERT INTO tier_features (feature_id, tier, value)
SELECT id, 'enterprise', 'true' FROM platform_features WHERE feature_key IN (
  'basic_workout_plans', 'client_messaging', 'session_scheduling', 'packages_subscriptions',
  'workout_plan_builder', 'basic_analytics', 'digital_products', 'group_classes', 'batch_operations', 'template_folders',
  'nutrition_plan_builder', 'ai_workout_generator', 'ai_meal_suggestions', 'custom_branding', 'advanced_analytics',
  'client_progress_tracking', 'boost_marketing', 'client_engagement_scoring', 'revenue_forecasting', 'client_ltv',
  'package_analytics', 'goal_adherence_tracker', 'scheduled_checkin_automation', 'review_management',
  'advanced_reporting', 'custom_integrations', 'ai_client_analysis', 'enhanced_churn_prediction', 'dropoff_alerts',
  'ai_client_summary', 'ai_plateau_detection', 'upsell_insights', 'client_outcomes_showcase', 'ai_plan_recommendations',
  'ai_checkin_composer', 'auto_plan_progression', 'case_study_generator', 'wearable_dashboard', 'client_comparison_analytics'
)
ON CONFLICT DO NOTHING;

-- Founder tier - gets all features (same as enterprise)
INSERT INTO tier_features (feature_id, tier, value)
SELECT id, 'founder', 'true' FROM platform_features WHERE feature_key IN (
  'basic_workout_plans', 'client_messaging', 'session_scheduling', 'packages_subscriptions',
  'workout_plan_builder', 'basic_analytics', 'digital_products', 'group_classes', 'batch_operations', 'template_folders',
  'nutrition_plan_builder', 'ai_workout_generator', 'ai_meal_suggestions', 'custom_branding', 'advanced_analytics',
  'client_progress_tracking', 'boost_marketing', 'client_engagement_scoring', 'revenue_forecasting', 'client_ltv',
  'package_analytics', 'goal_adherence_tracker', 'scheduled_checkin_automation', 'review_management',
  'advanced_reporting', 'custom_integrations', 'ai_client_analysis', 'enhanced_churn_prediction', 'dropoff_alerts',
  'ai_client_summary', 'ai_plateau_detection', 'upsell_insights', 'client_outcomes_showcase', 'ai_plan_recommendations',
  'ai_checkin_composer', 'auto_plan_progression', 'case_study_generator', 'wearable_dashboard', 'client_comparison_analytics'
)
ON CONFLICT DO NOTHING;