-- Drop existing foreign key constraints
ALTER TABLE content_purchases 
DROP CONSTRAINT IF EXISTS content_purchases_product_id_fkey;

ALTER TABLE content_purchases 
DROP CONSTRAINT IF EXISTS content_purchases_bundle_id_fkey;

-- Add new foreign keys with CASCADE delete
ALTER TABLE content_purchases 
ADD CONSTRAINT content_purchases_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES digital_products(id) ON DELETE CASCADE;

ALTER TABLE content_purchases 
ADD CONSTRAINT content_purchases_bundle_id_fkey 
FOREIGN KEY (bundle_id) REFERENCES digital_bundles(id) ON DELETE CASCADE;

-- Clean up any existing orphaned or pending purchases for the placeholder product
DELETE FROM content_purchases 
WHERE product_id = '70b7bb5b-6cbd-4cdf-b85a-a793caee2781' 
AND status = 'pending';