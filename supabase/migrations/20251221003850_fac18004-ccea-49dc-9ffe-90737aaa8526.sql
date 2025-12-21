-- Create a simple cache table for exchange rates
CREATE TABLE IF NOT EXISTS public.system_cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access (rates are not sensitive)
ALTER TABLE public.system_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cache entries
CREATE POLICY "Anyone can read cache" ON public.system_cache
  FOR SELECT USING (true);

-- Only service role can insert/update (edge function uses service role key)
CREATE POLICY "Service role can manage cache" ON public.system_cache
  FOR ALL USING (auth.role() = 'service_role');