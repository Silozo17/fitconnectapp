-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  session_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view public reviews (for coach profiles)
CREATE POLICY "Anyone can view public reviews"
ON public.reviews
FOR SELECT
USING (is_public = true);

-- Clients can view their own reviews
CREATE POLICY "Clients can view their own reviews"
ON public.reviews
FOR SELECT
USING (client_id IN (
  SELECT id FROM client_profiles WHERE user_id = auth.uid()
));

-- Coaches can view all reviews about them
CREATE POLICY "Coaches can view reviews about them"
ON public.reviews
FOR SELECT
USING (coach_id IN (
  SELECT id FROM coach_profiles WHERE user_id = auth.uid()
));

-- Clients can create reviews for coaches they've had sessions with
CREATE POLICY "Clients can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (client_id IN (
  SELECT id FROM client_profiles WHERE user_id = auth.uid()
));

-- Clients can update their own reviews
CREATE POLICY "Clients can update their own reviews"
ON public.reviews
FOR UPDATE
USING (client_id IN (
  SELECT id FROM client_profiles WHERE user_id = auth.uid()
));

-- Clients can delete their own reviews
CREATE POLICY "Clients can delete their own reviews"
ON public.reviews
FOR DELETE
USING (client_id IN (
  SELECT id FROM client_profiles WHERE user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;