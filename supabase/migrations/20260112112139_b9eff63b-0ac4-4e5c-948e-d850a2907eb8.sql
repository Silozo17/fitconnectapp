-- Enable RLS on reference tables and add public read policies

-- News sources - public read, admin write
ALTER TABLE public.discipline_news_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read news sources"
ON public.discipline_news_sources FOR SELECT
USING (true);

-- Followable entities - public read, admin write
ALTER TABLE public.discipline_followable_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read followable entities"
ON public.discipline_followable_entities FOR SELECT
USING (true);

-- News cache - public read (edge function writes)
ALTER TABLE public.discipline_news_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read news cache"
ON public.discipline_news_cache FOR SELECT
USING (true);