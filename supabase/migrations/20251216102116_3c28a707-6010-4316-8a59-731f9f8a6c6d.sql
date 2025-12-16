-- Create favourites table
CREATE TABLE public.favourites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, coach_id)
);

-- Enable RLS
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Clients can view their own favourites
CREATE POLICY "Clients can view their own favourites"
ON public.favourites
FOR SELECT
USING (client_id IN (
  SELECT id FROM client_profiles WHERE user_id = auth.uid()
));

-- Clients can add favourites
CREATE POLICY "Clients can add favourites"
ON public.favourites
FOR INSERT
WITH CHECK (client_id IN (
  SELECT id FROM client_profiles WHERE user_id = auth.uid()
));

-- Clients can remove their own favourites
CREATE POLICY "Clients can remove their own favourites"
ON public.favourites
FOR DELETE
USING (client_id IN (
  SELECT id FROM client_profiles WHERE user_id = auth.uid()
));