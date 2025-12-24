-- Migrate existing Apple Health data from client_progress to health_data_sync
-- This is a one-time migration to move data to the correct table

-- Insert steps data
INSERT INTO health_data_sync (client_id, data_type, recorded_at, value, unit, source, created_at)
SELECT 
  client_id,
  'steps',
  recorded_at::date,
  (measurements->>'steps')::numeric,
  'count',
  'apple_health',
  created_at
FROM client_progress
WHERE data_source = 'apple_health'
  AND measurements->>'steps' IS NOT NULL
  AND (measurements->>'steps')::numeric > 0
ON CONFLICT (client_id, data_type, recorded_at, source) DO NOTHING;

-- Insert calories data
INSERT INTO health_data_sync (client_id, data_type, recorded_at, value, unit, source, created_at)
SELECT 
  client_id,
  'calories',
  recorded_at::date,
  (measurements->>'calories')::numeric,
  'kcal',
  'apple_health',
  created_at
FROM client_progress
WHERE data_source = 'apple_health'
  AND measurements->>'calories' IS NOT NULL
  AND (measurements->>'calories')::numeric > 0
ON CONFLICT (client_id, data_type, recorded_at, source) DO NOTHING;

-- Insert heart_rate data
INSERT INTO health_data_sync (client_id, data_type, recorded_at, value, unit, source, created_at)
SELECT 
  client_id,
  'heart_rate',
  recorded_at::date,
  (measurements->>'heart_rate')::numeric,
  'bpm',
  'apple_health',
  created_at
FROM client_progress
WHERE data_source = 'apple_health'
  AND measurements->>'heart_rate' IS NOT NULL
  AND (measurements->>'heart_rate')::numeric > 0
ON CONFLICT (client_id, data_type, recorded_at, source) DO NOTHING;

-- Insert sleep data (in minutes)
INSERT INTO health_data_sync (client_id, data_type, recorded_at, value, unit, source, created_at)
SELECT 
  client_id,
  'sleep',
  recorded_at::date,
  (measurements->>'sleep')::numeric,
  'minutes',
  'apple_health',
  created_at
FROM client_progress
WHERE data_source = 'apple_health'
  AND measurements->>'sleep' IS NOT NULL
  AND (measurements->>'sleep')::numeric > 0
ON CONFLICT (client_id, data_type, recorded_at, source) DO NOTHING;

-- Insert active_minutes data
INSERT INTO health_data_sync (client_id, data_type, recorded_at, value, unit, source, created_at)
SELECT 
  client_id,
  'active_minutes',
  recorded_at::date,
  (measurements->>'active_minutes')::numeric,
  'minutes',
  'apple_health',
  created_at
FROM client_progress
WHERE data_source = 'apple_health'
  AND measurements->>'active_minutes' IS NOT NULL
  AND (measurements->>'active_minutes')::numeric > 0
ON CONFLICT (client_id, data_type, recorded_at, source) DO NOTHING;

-- Insert distance data
INSERT INTO health_data_sync (client_id, data_type, recorded_at, value, unit, source, created_at)
SELECT 
  client_id,
  'distance',
  recorded_at::date,
  (measurements->>'distance')::numeric,
  'meters',
  'apple_health',
  created_at
FROM client_progress
WHERE data_source = 'apple_health'
  AND measurements->>'distance' IS NOT NULL
  AND (measurements->>'distance')::numeric > 0
ON CONFLICT (client_id, data_type, recorded_at, source) DO NOTHING;