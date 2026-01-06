-- Create a database function to award XP atomically
-- This ensures xp_transactions and client_xp are always in sync

CREATE OR REPLACE FUNCTION public.award_xp(
  p_client_id uuid,
  p_amount integer,
  p_source text,
  p_description text DEFAULT NULL,
  p_source_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into xp_transactions (source of truth)
  INSERT INTO xp_transactions (client_id, amount, source, source_id, description)
  VALUES (p_client_id, p_amount, p_source, p_source_id, p_description);
  
  -- Update or insert client_xp cache
  INSERT INTO client_xp (client_id, total_xp, current_level, xp_to_next_level)
  VALUES (p_client_id, p_amount, 1, 100)
  ON CONFLICT (client_id) DO UPDATE
  SET total_xp = client_xp.total_xp + p_amount,
      updated_at = now();
END;
$$;

-- Create trigger function to keep client_xp in sync when xp_transactions are inserted
CREATE OR REPLACE FUNCTION public.sync_client_xp_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update or insert client_xp based on the new transaction
  INSERT INTO client_xp (client_id, total_xp, current_level, xp_to_next_level)
  VALUES (NEW.client_id, NEW.amount, 1, 100)
  ON CONFLICT (client_id) DO UPDATE
  SET total_xp = client_xp.total_xp + NEW.amount,
      updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and create it
DROP TRIGGER IF EXISTS trigger_sync_client_xp_on_insert ON xp_transactions;

CREATE TRIGGER trigger_sync_client_xp_on_insert
  AFTER INSERT ON xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_client_xp_on_transaction();

-- One-time reconciliation: Ensure client_xp.total_xp matches SUM(xp_transactions.amount)
-- This fixes any existing discrepancies
WITH transaction_totals AS (
  SELECT client_id, COALESCE(SUM(amount), 0) as total_from_transactions
  FROM xp_transactions
  GROUP BY client_id
)
UPDATE client_xp
SET total_xp = GREATEST(tt.total_from_transactions, client_xp.total_xp),
    updated_at = now()
FROM transaction_totals tt
WHERE client_xp.client_id = tt.client_id
  AND client_xp.total_xp != tt.total_from_transactions;

-- Insert reconciliation transactions for any clients where client_xp.total_xp > SUM(transactions)
-- This preserves their XP while fixing the history
INSERT INTO xp_transactions (client_id, amount, source, description)
SELECT 
  cx.client_id,
  cx.total_xp - COALESCE(tt.total_from_transactions, 0),
  'system_reconcile',
  'Reconciled XP (missing history records)'
FROM client_xp cx
LEFT JOIN (
  SELECT client_id, SUM(amount) as total_from_transactions
  FROM xp_transactions
  GROUP BY client_id
) tt ON cx.client_id = tt.client_id
WHERE cx.total_xp > COALESCE(tt.total_from_transactions, 0);