-- Add extended nutrition columns to foods table for FatSecret Premier data

-- Add sugar column
ALTER TABLE public.foods 
ADD COLUMN IF NOT EXISTS sugar_g NUMERIC;

-- Add sodium column
ALTER TABLE public.foods 
ADD COLUMN IF NOT EXISTS sodium_mg NUMERIC;

-- Add saturated fat column
ALTER TABLE public.foods 
ADD COLUMN IF NOT EXISTS saturated_fat_g NUMERIC;

-- Add food image URL
ALTER TABLE public.foods 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add allergens as JSONB array (e.g., ["Gluten", "Milk", "Nuts"])
ALTER TABLE public.foods 
ADD COLUMN IF NOT EXISTS allergens JSONB DEFAULT '[]'::jsonb;

-- Add dietary preferences as JSONB array (e.g., ["Vegan", "Vegetarian", "Gluten-Free"])
ALTER TABLE public.foods 
ADD COLUMN IF NOT EXISTS dietary_preferences JSONB DEFAULT '[]'::jsonb;

-- Add barcode for scanned products
ALTER TABLE public.foods 
ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Create index on barcode for fast lookups
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON public.foods(barcode) WHERE barcode IS NOT NULL;