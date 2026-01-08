-- Create table for tracking multiple disciplines per user
CREATE TABLE public.client_disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  discipline_id TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, discipline_id)
);

-- Add index for fast lookups
CREATE INDEX idx_client_disciplines_client_id ON public.client_disciplines(client_id);
CREATE INDEX idx_client_disciplines_primary ON public.client_disciplines(client_id) WHERE is_primary = true;

-- Enable RLS
ALTER TABLE public.client_disciplines ENABLE ROW LEVEL SECURITY;

-- Users can view their own disciplines
CREATE POLICY "Users can view their own disciplines"
ON public.client_disciplines
FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.client_profiles WHERE user_id = auth.uid()
  )
);

-- Users can create their own disciplines
CREATE POLICY "Users can create their own disciplines"
ON public.client_disciplines
FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM public.client_profiles WHERE user_id = auth.uid()
  )
);

-- Users can update their own disciplines
CREATE POLICY "Users can update their own disciplines"
ON public.client_disciplines
FOR UPDATE
USING (
  client_id IN (
    SELECT id FROM public.client_profiles WHERE user_id = auth.uid()
  )
);

-- Users can delete their own disciplines
CREATE POLICY "Users can delete their own disciplines"
ON public.client_disciplines
FOR DELETE
USING (
  client_id IN (
    SELECT id FROM public.client_profiles WHERE user_id = auth.uid()
  )
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_client_disciplines_updated_at
BEFORE UPDATE ON public.client_disciplines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to ensure only one primary discipline per client
CREATE OR REPLACE FUNCTION ensure_single_primary_discipline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.client_disciplines 
    SET is_primary = false 
    WHERE client_id = NEW.client_id AND id != NEW.id AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER ensure_single_primary_discipline_trigger
BEFORE INSERT OR UPDATE ON public.client_disciplines
FOR EACH ROW
WHEN (NEW.is_primary = true)
EXECUTE FUNCTION ensure_single_primary_discipline();

-- Migrate existing selected_discipline data to the new table
-- This will run once to migrate users who already have a discipline selected
INSERT INTO public.client_disciplines (client_id, discipline_id, is_primary)
SELECT id, selected_discipline, true
FROM public.client_profiles
WHERE selected_discipline IS NOT NULL
ON CONFLICT (client_id, discipline_id) DO NOTHING;