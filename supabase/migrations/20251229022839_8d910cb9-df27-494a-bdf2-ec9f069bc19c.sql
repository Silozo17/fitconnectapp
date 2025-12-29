-- Create function to increment food popularity
CREATE OR REPLACE FUNCTION public.increment_food_popularity(
  p_external_id TEXT,
  p_country TEXT DEFAULT 'GB'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE foods_autocomplete
  SET 
    popularity_score = popularity_score + 1,
    updated_at = now()
  WHERE external_id = p_external_id 
    AND country = p_country;
END;
$$;