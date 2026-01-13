-- Drop unused marketplace functions
-- These are fully superseded by get_marketplace_coaches_v2
-- Confirmed: no RPC calls exist in codebase

DROP FUNCTION IF EXISTS public.get_filtered_coaches_v1;
DROP FUNCTION IF EXISTS public.get_ranked_coaches_v1;