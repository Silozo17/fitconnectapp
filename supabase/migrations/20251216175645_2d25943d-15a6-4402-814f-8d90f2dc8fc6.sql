-- Add status columns to client_profiles
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status_updated_by UUID;

-- Add status columns to coach_profiles  
ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status_updated_by UUID;

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_client_profiles_status ON public.client_profiles(status);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_status ON public.coach_profiles(status);