-- Add location_id to contract_templates for location-specific contracts
ALTER TABLE public.gym_contract_templates
ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.gym_locations(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gym_contract_templates_location 
ON public.gym_contract_templates(location_id);

-- Create gym_member_notes table for activity logging
CREATE TABLE IF NOT EXISTS public.gym_member_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id uuid NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'medical', 'payment', 'behavioral', 'grading', 'attendance')),
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on gym_member_notes
ALTER TABLE public.gym_member_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for gym_member_notes
CREATE POLICY "Gym staff can view member notes" ON public.gym_member_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_member_notes.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Gym staff can create member notes" ON public.gym_member_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_member_notes.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Gym staff can update own notes" ON public.gym_member_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.id = gym_member_notes.staff_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Gym managers can delete notes" ON public.gym_member_notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_member_notes.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
      AND gs.role IN ('owner', 'area_manager', 'manager')
    )
  );

-- Add marketing and home location fields to gym_members
ALTER TABLE public.gym_members
ADD COLUMN IF NOT EXISTS marketing_source text,
ADD COLUMN IF NOT EXISTS marketing_source_other text,
ADD COLUMN IF NOT EXISTS home_location_id uuid REFERENCES public.gym_locations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referred_by_member_id uuid REFERENCES public.gym_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS medical_conditions text[],
ADD COLUMN IF NOT EXISTS injuries text[],
ADD COLUMN IF NOT EXISTS allergies text[],
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS photo_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS contracts_signed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS signup_completed_at timestamp with time zone;

-- Add first_name, last_name, phone to gym_staff if not exists
ALTER TABLE public.gym_staff
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text;

-- Create index for member lookups by home location
CREATE INDEX IF NOT EXISTS idx_gym_members_home_location 
ON public.gym_members(home_location_id);

-- Create index for member notes
CREATE INDEX IF NOT EXISTS idx_gym_member_notes_member 
ON public.gym_member_notes(member_id);

CREATE INDEX IF NOT EXISTS idx_gym_member_notes_gym 
ON public.gym_member_notes(gym_id);

-- Create trigger to update updated_at on gym_member_notes
CREATE OR REPLACE FUNCTION public.update_gym_member_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_gym_member_notes_updated_at ON public.gym_member_notes;
CREATE TRIGGER update_gym_member_notes_updated_at
  BEFORE UPDATE ON public.gym_member_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gym_member_notes_updated_at();