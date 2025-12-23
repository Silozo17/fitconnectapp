-- ============================================
-- App Store Demo Account Setup Script
-- ============================================
-- 
-- PREREQUISITE: Create the auth user first in Supabase Dashboard:
--   Email: appstore.review@fitconnect.app
--   Password: FitConnect2024!Review
--   Auto Confirm: Yes
--
-- Then replace 'YOUR_AUTH_USER_ID_HERE' with the actual UUID below
-- ============================================

-- Set the auth user ID (replace this after creating the user)
DO $$
DECLARE
  demo_user_id UUID := 'YOUR_AUTH_USER_ID_HERE'; -- Replace with actual auth.users.id
  demo_client_id UUID;
  demo_coach_id UUID := '302c8747-f33a-45cf-8df7-688ed72af320'; -- Existing verified coach (Admin)
  workout_plan_id UUID;
  nutrition_plan_id UUID;
  conversation_id UUID;
BEGIN
  -- ============================================
  -- 1. Create Client Profile
  -- ============================================
  INSERT INTO client_profiles (
    id,
    user_id,
    username,
    first_name,
    last_name,
    onboarding_completed,
    fitness_goals,
    height_cm,
    weight_kg,
    age,
    gender_pronouns,
    location,
    city,
    country,
    leaderboard_visible,
    leaderboard_display_name,
    status
  ) VALUES (
    gen_random_uuid(),
    demo_user_id,
    'appstore_review',
    'Alex',
    'Demo',
    true,
    ARRAY['weight_loss', 'muscle_gain', 'endurance'],
    175,
    78.5,
    32,
    'They/Them',
    'London, UK',
    'London',
    'United Kingdom',
    true,
    'Alex D.',
    'active'
  )
  RETURNING id INTO demo_client_id;

  RAISE NOTICE 'Created client profile: %', demo_client_id;

  -- ============================================
  -- 2. Create User Profile (for messaging)
  -- ============================================
  INSERT INTO user_profiles (
    id,
    user_id,
    first_name,
    last_name,
    display_name,
    avatar_url,
    role
  ) VALUES (
    gen_random_uuid(),
    demo_user_id,
    'Alex',
    'Demo',
    'Alex Demo',
    NULL,
    'client'
  );

  -- ============================================
  -- 3. Create Coach-Client Relationship
  -- ============================================
  INSERT INTO coach_clients (
    id,
    coach_id,
    client_id,
    status,
    plan_type,
    start_date
  ) VALUES (
    gen_random_uuid(),
    demo_coach_id,
    demo_client_id,
    'active',
    'pro',
    NOW() - INTERVAL '30 days'
  );

  -- ============================================
  -- 4. Create Client Subscription (Pro tier)
  -- ============================================
  INSERT INTO client_subscriptions (
    id,
    client_id,
    coach_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    currency
  ) VALUES (
    gen_random_uuid(),
    demo_client_id,
    demo_coach_id,
    (SELECT id FROM coach_subscription_plans WHERE coach_id = demo_coach_id LIMIT 1),
    'active',
    NOW(),
    NOW() + INTERVAL '30 days',
    'GBP'
  );

  -- ============================================
  -- 5. Create Sample Workout Plans
  -- ============================================
  INSERT INTO workout_plans (
    id,
    coach_id,
    client_id,
    name,
    description,
    status,
    start_date,
    end_date
  ) VALUES (
    gen_random_uuid(),
    demo_coach_id,
    demo_client_id,
    '12-Week Transformation Program',
    'A comprehensive program designed to build muscle, improve endurance, and enhance overall fitness. This plan includes progressive overload and periodization.',
    'active',
    NOW() - INTERVAL '14 days',
    NOW() + INTERVAL '70 days'
  )
  RETURNING id INTO workout_plan_id;

  -- Create workout sessions for the plan
  INSERT INTO workout_sessions (id, plan_id, day_number, name, description, estimated_duration_minutes)
  VALUES 
    (gen_random_uuid(), workout_plan_id, 1, 'Upper Body Push', 'Focus on chest, shoulders, and triceps', 60),
    (gen_random_uuid(), workout_plan_id, 2, 'Lower Body', 'Legs and glutes workout', 55),
    (gen_random_uuid(), workout_plan_id, 3, 'Rest Day', 'Active recovery - light walking or stretching', 30),
    (gen_random_uuid(), workout_plan_id, 4, 'Upper Body Pull', 'Back and biceps focus', 60),
    (gen_random_uuid(), workout_plan_id, 5, 'HIIT Cardio', 'High intensity interval training', 40),
    (gen_random_uuid(), workout_plan_id, 6, 'Full Body Strength', 'Compound movements for overall strength', 65),
    (gen_random_uuid(), workout_plan_id, 7, 'Rest Day', 'Complete rest or yoga', 0);

  -- ============================================
  -- 6. Create Sample Nutrition Plan
  -- ============================================
  INSERT INTO nutrition_plans (
    id,
    coach_id,
    client_id,
    name,
    description,
    status,
    start_date,
    daily_calories,
    protein_grams,
    carbs_grams,
    fat_grams
  ) VALUES (
    gen_random_uuid(),
    demo_coach_id,
    demo_client_id,
    'Lean Muscle Building Plan',
    'High protein nutrition plan optimized for muscle growth while maintaining a slight caloric surplus. Includes meal timing recommendations.',
    'active',
    NOW() - INTERVAL '14 days',
    2400,
    180,
    280,
    75
  )
  RETURNING id INTO nutrition_plan_id;

  -- ============================================
  -- 7. Create Progress Entries
  -- ============================================
  INSERT INTO client_progress (id, client_id, coach_id, recorded_at, weight_kg, body_fat_percentage, measurements, notes, data_source)
  VALUES 
    (gen_random_uuid(), demo_client_id, demo_coach_id, NOW() - INTERVAL '28 days', 80.2, 22.5, '{"chest": 102, "waist": 88, "hips": 100}'::jsonb, 'Starting measurements', 'manual'),
    (gen_random_uuid(), demo_client_id, demo_coach_id, NOW() - INTERVAL '21 days', 79.5, 21.8, '{"chest": 102, "waist": 87, "hips": 99}'::jsonb, 'Good progress this week!', 'manual'),
    (gen_random_uuid(), demo_client_id, demo_coach_id, NOW() - INTERVAL '14 days', 78.8, 21.2, '{"chest": 103, "waist": 86, "hips": 99}'::jsonb, 'Feeling stronger', 'manual'),
    (gen_random_uuid(), demo_client_id, demo_coach_id, NOW() - INTERVAL '7 days', 78.5, 20.5, '{"chest": 103, "waist": 85, "hips": 98}'::jsonb, 'Great week - hit all my workouts', 'manual'),
    (gen_random_uuid(), demo_client_id, demo_coach_id, NOW(), 78.0, 20.1, '{"chest": 104, "waist": 84, "hips": 98}'::jsonb, 'Visible changes in the mirror!', 'manual');

  -- ============================================
  -- 8. Create Client Habits
  -- ============================================
  INSERT INTO client_habits (id, client_id, coach_id, name, description, category, frequency, target_count, start_date, is_active)
  VALUES 
    (gen_random_uuid(), demo_client_id, demo_coach_id, 'Drink 3L water', 'Stay hydrated throughout the day', 'nutrition', 'daily', 1, NOW() - INTERVAL '14 days', true),
    (gen_random_uuid(), demo_client_id, demo_coach_id, '10k steps', 'Daily step goal for NEAT', 'activity', 'daily', 1, NOW() - INTERVAL '14 days', true),
    (gen_random_uuid(), demo_client_id, demo_coach_id, '8 hours sleep', 'Prioritize recovery', 'wellness', 'daily', 1, NOW() - INTERVAL '14 days', true),
    (gen_random_uuid(), demo_client_id, demo_coach_id, 'Morning stretching', '10 minutes of stretching after waking', 'activity', 'daily', 1, NOW() - INTERVAL '14 days', true);

  -- ============================================
  -- 9. Create Messaging Conversation
  -- ============================================
  INSERT INTO conversations (
    id,
    type,
    created_by
  ) VALUES (
    gen_random_uuid(),
    'direct',
    demo_user_id
  )
  RETURNING id INTO conversation_id;

  -- Add participants to conversation
  INSERT INTO conversation_participants (id, conversation_id, user_id, role)
  VALUES 
    (gen_random_uuid(), conversation_id, demo_user_id, 'member'),
    (gen_random_uuid(), conversation_id, (SELECT user_id FROM coach_profiles WHERE id = demo_coach_id), 'member');

  -- Add sample messages
  INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
  VALUES 
    (gen_random_uuid(), conversation_id, (SELECT user_id FROM coach_profiles WHERE id = demo_coach_id), 'Welcome to FitConnect! I''m excited to work with you on your fitness journey. I''ve reviewed your goals and created a personalized plan.', NOW() - INTERVAL '13 days'),
    (gen_random_uuid(), conversation_id, demo_user_id, 'Thanks! I''m really motivated to get started. The workout plan looks great!', NOW() - INTERVAL '13 days' + INTERVAL '2 hours'),
    (gen_random_uuid(), conversation_id, (SELECT user_id FROM coach_profiles WHERE id = demo_coach_id), 'Great attitude! Remember to log your workouts so I can track your progress. Feel free to message me anytime if you have questions.', NOW() - INTERVAL '12 days'),
    (gen_random_uuid(), conversation_id, demo_user_id, 'Just completed my first week! The upper body sessions are challenging but I love it.', NOW() - INTERVAL '6 days'),
    (gen_random_uuid(), conversation_id, (SELECT user_id FROM coach_profiles WHERE id = demo_coach_id), 'Fantastic work! I can see your consistency in the logs. Keep it up and we''ll increase the weights next week.', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), conversation_id, demo_user_id, 'Sounds good! I''m already noticing more energy throughout the day.', NOW() - INTERVAL '5 days' + INTERVAL '1 hour');

  -- ============================================
  -- 10. Create XP and Level
  -- ============================================
  INSERT INTO client_xp (
    id,
    client_id,
    total_xp,
    current_level,
    xp_to_next_level
  ) VALUES (
    gen_random_uuid(),
    demo_client_id,
    1250,
    5,
    250
  );

  -- ============================================
  -- 11. Create Sample Coach Notes
  -- ============================================
  INSERT INTO client_notes (id, client_id, coach_id, content, category, is_pinned)
  VALUES 
    (gen_random_uuid(), demo_client_id, demo_coach_id, 'Very motivated client. Responds well to progressive overload. Prefers morning workouts.', 'general', true),
    (gen_random_uuid(), demo_client_id, demo_coach_id, 'Week 1 check-in: Adapting well to the program. No injuries or concerns.', 'progress', false),
    (gen_random_uuid(), demo_client_id, demo_coach_id, 'Discussed nutrition adjustments - increasing protein on training days.', 'nutrition', false);

  RAISE NOTICE 'Demo account setup complete!';
  RAISE NOTICE 'Client ID: %', demo_client_id;
  RAISE NOTICE 'Coach ID: %', demo_coach_id;

END $$;
