-- Create grocery_lists table for shopping list integration
CREATE TABLE public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Shopping List',
  items JSONB NOT NULL DEFAULT '[]',
  source_type TEXT DEFAULT 'manual', -- 'manual', 'meal_plan', 'nutrition_plan'
  source_id UUID,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

-- Clients can manage their own grocery lists
CREATE POLICY "Clients can manage their own grocery lists"
ON public.grocery_lists FOR ALL
USING (client_id IN (
  SELECT id FROM public.client_profiles WHERE user_id = auth.uid()
));

-- Coaches can view/create grocery lists for their clients
CREATE POLICY "Coaches can manage grocery lists for their clients"
ON public.grocery_lists FOR ALL
USING (coach_id IN (
  SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
));

-- Add updated_at trigger
CREATE TRIGGER update_grocery_lists_updated_at
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create integration_usage table for admin analytics
CREATE TABLE public.integration_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL, -- 'video', 'calendar', 'wearable', 'grocery'
  provider TEXT NOT NULL,
  action TEXT NOT NULL, -- 'connect', 'disconnect', 'sync', 'error'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_usage ENABLE ROW LEVEL SECURITY;

-- Only admins can view integration usage
CREATE POLICY "Admins can view integration usage"
ON public.integration_usage FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert their own usage (for tracking)
CREATE POLICY "Users can track their own usage"
ON public.integration_usage FOR INSERT
WITH CHECK (user_id = auth.uid());