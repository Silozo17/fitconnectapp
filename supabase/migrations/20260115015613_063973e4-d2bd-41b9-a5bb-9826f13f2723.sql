-- Add missing columns to gym_credit_packages
ALTER TABLE gym_credit_packages 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES gym_locations(id);

-- Rename columns to match expected structure (if they exist with different names)
-- First check if 'credits' column exists, if not add it as alias to credits_amount
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_credit_packages' AND column_name = 'credits') THEN
    ALTER TABLE gym_credit_packages ADD COLUMN credits INTEGER;
    UPDATE gym_credit_packages SET credits = credits_amount WHERE credits IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_credit_packages' AND column_name = 'price_amount') THEN
    ALTER TABLE gym_credit_packages ADD COLUMN price_amount INTEGER;
    UPDATE gym_credit_packages SET price_amount = price WHERE price_amount IS NULL;
  END IF;
END $$;

-- Add VAT columns to gym_profiles if they don't exist
ALTER TABLE gym_profiles 
ADD COLUMN IF NOT EXISTS vat_registered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vat_number TEXT;