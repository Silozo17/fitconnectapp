-- Note: currency columns already exist on coach_packages, coach_subscription_plans
-- from previous schema setup with default 'GBP'. Adding to other tables.

-- Add currency column to session_types if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'session_types' AND column_name = 'currency') 
  THEN
    ALTER TABLE public.session_types ADD COLUMN currency text DEFAULT 'GBP';
  END IF;
END $$;

-- Add currency column to transactions if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'currency') 
  THEN
    ALTER TABLE public.transactions ADD COLUMN currency text DEFAULT 'GBP';
  END IF;
END $$;

-- Add currency column to client_package_purchases if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'client_package_purchases' AND column_name = 'currency') 
  THEN
    ALTER TABLE public.client_package_purchases ADD COLUMN currency text DEFAULT 'GBP';
  END IF;
END $$;

-- Add currency column to client_subscriptions if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'client_subscriptions' AND column_name = 'currency') 
  THEN
    ALTER TABLE public.client_subscriptions ADD COLUMN currency text DEFAULT 'GBP';
  END IF;
END $$;

-- Add currency column to booking_requests if not exists (for price quoting)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'booking_requests' AND column_name = 'currency') 
  THEN
    ALTER TABLE public.booking_requests ADD COLUMN currency text DEFAULT 'GBP';
  END IF;
END $$;

-- Add currency column to coaching_sessions if not exists (for historical price tracking)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'coaching_sessions' AND column_name = 'currency') 
  THEN
    ALTER TABLE public.coaching_sessions ADD COLUMN currency text DEFAULT 'GBP';
  END IF;
END $$;

-- Add price column to coaching_sessions for historical tracking
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'coaching_sessions' AND column_name = 'price') 
  THEN
    ALTER TABLE public.coaching_sessions ADD COLUMN price numeric DEFAULT NULL;
  END IF;
END $$;

-- Create index on currency columns for efficient filtering
CREATE INDEX IF NOT EXISTS idx_session_types_currency ON public.session_types(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON public.transactions(currency);
CREATE INDEX IF NOT EXISTS idx_client_package_purchases_currency ON public.client_package_purchases(currency);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_currency ON public.client_subscriptions(currency);