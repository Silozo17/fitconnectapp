-- Add area_manager to gym_role enum
ALTER TYPE public.gym_role ADD VALUE IF NOT EXISTS 'area_manager' AFTER 'owner';