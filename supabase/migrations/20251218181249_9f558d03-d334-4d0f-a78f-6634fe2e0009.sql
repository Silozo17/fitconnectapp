-- Add slug column to digital_products
ALTER TABLE public.digital_products 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_digital_products_slug ON public.digital_products(slug);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_product_slug(title TEXT, product_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to lowercase, replace spaces and special chars with hyphens
  base_slug := regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g');
  -- Remove leading/trailing hyphens
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  -- Ensure it's not empty
  IF base_slug = '' THEN
    base_slug := 'product';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for duplicates and append number if needed
  WHILE EXISTS(SELECT 1 FROM public.digital_products WHERE slug = final_slug AND id != COALESCE(product_id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger function to auto-generate slug on insert/update if not provided
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug if not provided or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_product_slug(NEW.title, NEW.id);
  ELSE
    -- Validate custom slug format and uniqueness
    NEW.slug := regexp_replace(lower(trim(NEW.slug)), '[^a-z0-9]+', '-', 'g');
    NEW.slug := regexp_replace(NEW.slug, '^-+|-+$', '', 'g');
    -- If the custom slug conflicts, append number
    IF EXISTS(SELECT 1 FROM public.digital_products WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
      NEW.slug := public.generate_product_slug(NEW.slug, NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_product_slug ON public.digital_products;
CREATE TRIGGER trigger_set_product_slug
BEFORE INSERT OR UPDATE ON public.digital_products
FOR EACH ROW EXECUTE FUNCTION public.set_product_slug();

-- Backfill existing products with slugs
UPDATE public.digital_products 
SET slug = public.generate_product_slug(title, id)
WHERE slug IS NULL;