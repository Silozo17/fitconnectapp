-- Add hybrid/group package columns to coach_packages
ALTER TABLE public.coach_packages 
  ADD COLUMN IF NOT EXISTS is_hybrid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS in_person_sessions integer,
  ADD COLUMN IF NOT EXISTS online_sessions integer,
  ADD COLUMN IF NOT EXISTS billing_months integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_group_package boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_group_size integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_group_size integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS sessions_per_month integer;