-- Add foreign key constraint from client_package_purchases.package_id to coach_packages.id
-- This enables the Supabase PostgREST join syntax: select("*, coach_packages(*)")
ALTER TABLE public.client_package_purchases
ADD CONSTRAINT client_package_purchases_package_id_fkey
FOREIGN KEY (package_id) REFERENCES public.coach_packages(id) ON DELETE SET NULL;