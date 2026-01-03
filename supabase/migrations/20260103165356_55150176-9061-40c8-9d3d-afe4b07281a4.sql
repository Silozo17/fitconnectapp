-- Phase 1: Add UNIQUE constraint on coach_id for platform_subscriptions
-- This is REQUIRED for upsert(..., { onConflict: "coach_id" }) to work
-- Without this, webhook and verify-subscription-entitlement fail silently

-- First, ensure no duplicate coach_ids exist (should be fine since table is empty)
-- Add the unique constraint
ALTER TABLE public.platform_subscriptions
ADD CONSTRAINT platform_subscriptions_coach_id_key UNIQUE (coach_id);

-- Add index for faster lookups by coach_id (the unique constraint creates this automatically)
-- But let's also ensure NOT NULL on coach_id for data integrity
ALTER TABLE public.platform_subscriptions
ALTER COLUMN coach_id SET NOT NULL;