-- Create foods_autocomplete table for cached autocomplete
CREATE TABLE public.foods_autocomplete (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL,
  barcode TEXT,
  product_name TEXT NOT NULL,
  brand TEXT,
  country TEXT NOT NULL DEFAULT 'GB',
  language TEXT NOT NULL DEFAULT 'en',
  search_text TEXT NOT NULL,
  calories_per_100g NUMERIC,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  food_type TEXT NOT NULL DEFAULT 'product' CHECK (food_type IN ('product', 'generic')),
  popularity_score INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  allergens TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(external_id, country)
);

-- Create indexes for fast autocomplete queries
CREATE INDEX idx_foods_autocomplete_search_text ON public.foods_autocomplete USING gin(to_tsvector('english', search_text));
CREATE INDEX idx_foods_autocomplete_prefix ON public.foods_autocomplete (lower(product_name) text_pattern_ops);
CREATE INDEX idx_foods_autocomplete_brand_prefix ON public.foods_autocomplete (lower(brand) text_pattern_ops);
CREATE INDEX idx_foods_autocomplete_country ON public.foods_autocomplete (country);
CREATE INDEX idx_foods_autocomplete_ranking ON public.foods_autocomplete (popularity_score DESC, created_at DESC);
CREATE INDEX idx_foods_autocomplete_barcode ON public.foods_autocomplete (barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_foods_autocomplete_food_type ON public.foods_autocomplete (food_type);

-- Enable RLS
ALTER TABLE public.foods_autocomplete ENABLE ROW LEVEL SECURITY;

-- Allow public read access for autocomplete (no auth required for lookups)
CREATE POLICY "Anyone can read autocomplete cache"
ON public.foods_autocomplete
FOR SELECT
USING (true);

-- Allow authenticated users to insert/update (for cache population via edge functions)
CREATE POLICY "Service role can manage autocomplete cache"
ON public.foods_autocomplete
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_foods_autocomplete_updated_at
BEFORE UPDATE ON public.foods_autocomplete
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Rename fatsecret_id to external_id in food_diary table
ALTER TABLE public.food_diary 
RENAME COLUMN fatsecret_id TO external_id;

-- Rename fatsecret_id to external_id in foods table  
ALTER TABLE public.foods 
RENAME COLUMN fatsecret_id TO external_id;

-- Update source values from 'fatsecret' to 'openfoodfacts' for future entries
-- (keeping existing data as-is for backwards compatibility)