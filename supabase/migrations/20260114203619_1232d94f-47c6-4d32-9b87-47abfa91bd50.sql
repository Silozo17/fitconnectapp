-- Add brand_color column to gym_profiles table
ALTER TABLE public.gym_profiles 
ADD COLUMN IF NOT EXISTS brand_color TEXT;