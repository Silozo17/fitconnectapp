-- Add medical_conditions column to client_profiles
ALTER TABLE public.client_profiles 
ADD COLUMN medical_conditions text[] DEFAULT '{}'::text[];