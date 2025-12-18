-- Add compare_at_price column to digital_products table
ALTER TABLE public.digital_products 
ADD COLUMN IF NOT EXISTS compare_at_price numeric DEFAULT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN public.digital_products.compare_at_price IS 'Original price for showing discounts (strikethrough price)';