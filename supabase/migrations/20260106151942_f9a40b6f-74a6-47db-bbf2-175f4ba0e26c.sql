-- Fix XP consistency: Reconcile client_xp.total_xp to match xp_transactions ledger
-- This ensures the cached total always matches the source of truth

-- Step 1: Reconcile all client_xp totals to match transaction history
UPDATE public.client_xp c
SET 
  total_xp = COALESCE((
    SELECT SUM(amount) 
    FROM public.xp_transactions t 
    WHERE t.client_id = c.client_id
  ), 0),
  updated_at = now()
WHERE EXISTS (SELECT 1 FROM public.xp_transactions t WHERE t.client_id = c.client_id);

-- Step 2: Create or replace the sync trigger function to ensure future consistency
CREATE OR REPLACE FUNCTION public.sync_client_xp_from_transactions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalculate total from all transactions (single source of truth)
  INSERT INTO public.client_xp (client_id, total_xp, current_level, xp_to_next_level, updated_at)
  VALUES (
    NEW.client_id,
    NEW.amount,
    1,
    100,
    now()
  )
  ON CONFLICT (client_id) DO UPDATE SET
    total_xp = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM public.xp_transactions 
      WHERE client_id = NEW.client_id
    ),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Step 3: Ensure the trigger exists (drop and recreate to avoid duplicates)
DROP TRIGGER IF EXISTS trigger_sync_xp_on_transaction ON public.xp_transactions;

CREATE TRIGGER trigger_sync_xp_on_transaction
  AFTER INSERT ON public.xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_client_xp_from_transactions();