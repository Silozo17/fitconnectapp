-- ============================================
-- Custom Message Fields System
-- ============================================
-- Allows coaches to define custom variables for personalized messaging

-- Table for coach-defined custom message fields
CREATE TABLE public.coach_message_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,           -- Variable name e.g., "goal_weight", "competition_date"
  field_label TEXT NOT NULL,          -- Display name for UI e.g., "Goal Weight", "Competition Date"
  field_type TEXT NOT NULL DEFAULT 'text',  -- text, number, date
  default_value TEXT,                 -- Default value if client-specific not set
  description TEXT,                   -- Help text for coaches
  is_global BOOLEAN DEFAULT false,    -- If true, value applies to all clients
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent duplicate field names per coach
  UNIQUE(coach_id, field_name)
);

-- Table for client-specific custom field values
CREATE TABLE public.client_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.coach_message_fields(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- One value per field per client
  UNIQUE(field_id, client_id)
);

-- Enable RLS
ALTER TABLE public.coach_message_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_custom_field_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_message_fields

-- Coaches can view their own fields
CREATE POLICY "Coaches can view own message fields"
ON public.coach_message_fields
FOR SELECT
USING (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- Coaches can create their own fields
CREATE POLICY "Coaches can create own message fields"
ON public.coach_message_fields
FOR INSERT
WITH CHECK (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- Coaches can update their own fields
CREATE POLICY "Coaches can update own message fields"
ON public.coach_message_fields
FOR UPDATE
USING (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- Coaches can delete their own fields
CREATE POLICY "Coaches can delete own message fields"
ON public.coach_message_fields
FOR DELETE
USING (
  coach_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for client_custom_field_values

-- Coaches can view field values for their clients
CREATE POLICY "Coaches can view client field values"
ON public.client_custom_field_values
FOR SELECT
USING (
  field_id IN (
    SELECT id FROM public.coach_message_fields 
    WHERE coach_id IN (
      SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Coaches can create field values for their clients
CREATE POLICY "Coaches can create client field values"
ON public.client_custom_field_values
FOR INSERT
WITH CHECK (
  field_id IN (
    SELECT id FROM public.coach_message_fields 
    WHERE coach_id IN (
      SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Coaches can update field values for their clients
CREATE POLICY "Coaches can update client field values"
ON public.client_custom_field_values
FOR UPDATE
USING (
  field_id IN (
    SELECT id FROM public.coach_message_fields 
    WHERE coach_id IN (
      SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Coaches can delete field values
CREATE POLICY "Coaches can delete client field values"
ON public.client_custom_field_values
FOR DELETE
USING (
  field_id IN (
    SELECT id FROM public.coach_message_fields 
    WHERE coach_id IN (
      SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_coach_message_fields_coach ON public.coach_message_fields(coach_id);
CREATE INDEX idx_coach_message_fields_active ON public.coach_message_fields(coach_id, is_active);
CREATE INDEX idx_client_custom_field_values_field ON public.client_custom_field_values(field_id);
CREATE INDEX idx_client_custom_field_values_client ON public.client_custom_field_values(client_id);

-- Trigger to update updated_at
CREATE TRIGGER update_coach_message_fields_updated_at
BEFORE UPDATE ON public.coach_message_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_custom_field_values_updated_at
BEFORE UPDATE ON public.client_custom_field_values
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
