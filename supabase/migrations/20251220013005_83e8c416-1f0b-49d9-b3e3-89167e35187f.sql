-- Migration: Convert legacy free boosts to time-based entitlements
-- Strategy: Option A - Grant existing active boosts a one-time 30-day extension without payment
-- This is fair to early adopters while transitioning to the paid model

-- Step 1: Update any active boosts that don't have payment info (legacy free boosts)
-- Grant them 30 days from NOW as a one-time courtesy
UPDATE coach_boosts
SET 
  boost_start_date = COALESCE(boost_start_date, activated_at, NOW()),
  boost_end_date = COALESCE(boost_end_date, NOW() + INTERVAL '30 days'),
  payment_status = CASE 
    WHEN payment_status = 'none' OR payment_status IS NULL THEN 'migrated_free'
    ELSE payment_status
  END,
  updated_at = NOW()
WHERE is_active = true
  AND (boost_end_date IS NULL OR payment_status = 'none' OR payment_status IS NULL);

-- Step 2: Add 'migrated_free' as a valid payment_status
-- This tracks which boosts were migrated vs paid
ALTER TABLE coach_boosts 
DROP CONSTRAINT IF EXISTS coach_boosts_payment_status_check;

ALTER TABLE coach_boosts 
ADD CONSTRAINT coach_boosts_payment_status_check 
CHECK (payment_status IN ('none', 'pending', 'succeeded', 'failed', 'cancelled', 'migrated_free'));

-- Step 3: Create a migration audit log entry
INSERT INTO audit_logs (action, entity_type, entity_id, old_values, new_values)
SELECT 
  'boost_migration_phase5',
  'coach_boosts',
  NULL,
  jsonb_build_object('description', 'Legacy free boost migration to paid model'),
  jsonb_build_object(
    'migration_date', NOW()::text,
    'strategy', 'option_a_30_day_extension',
    'affected_count', (
      SELECT COUNT(*) FROM coach_boosts 
      WHERE payment_status = 'migrated_free'
    )
  );

-- Step 4: Add comment documenting the migration
COMMENT ON COLUMN coach_boosts.payment_status IS 
'Payment status for boost activation. Values: none (never purchased), pending (checkout started), succeeded (paid), failed, cancelled, migrated_free (legacy boost granted 30 days during paid model migration)';