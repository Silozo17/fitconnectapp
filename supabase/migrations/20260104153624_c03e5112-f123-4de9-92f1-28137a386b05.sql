-- Add columns to track current subscription product for Android upgrade flow
ALTER TABLE platform_subscriptions 
ADD COLUMN IF NOT EXISTS current_product_id TEXT,
ADD COLUMN IF NOT EXISTS billing_interval TEXT;

-- Add comment for documentation
COMMENT ON COLUMN platform_subscriptions.current_product_id IS 'Current RevenueCat product ID for Android upgrade detection';
COMMENT ON COLUMN platform_subscriptions.billing_interval IS 'Current billing interval (monthly/yearly) for Android upgrade detection';