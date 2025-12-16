-- Create message templates table for coaches
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own templates
CREATE POLICY "Coaches can manage their own templates"
ON public.message_templates
FOR ALL
USING (coach_id IN (
  SELECT id FROM coach_profiles WHERE user_id = auth.uid()
));

-- Add index for faster lookups
CREATE INDEX idx_message_templates_coach_id ON public.message_templates(coach_id);

-- Add trigger to update updated_at
CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();