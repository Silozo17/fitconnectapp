-- ==============================================
-- DISCIPLINE NEWS & FAVORITES SYSTEM
-- ==============================================

-- 1. News Sources Table (maps disciplines to RSS feeds)
CREATE TABLE public.discipline_news_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discipline_id TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'rss' CHECK (source_type IN ('rss', 'api')),
  feed_url TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_discipline_news_sources_discipline ON public.discipline_news_sources(discipline_id);

-- 2. Followable Entities Table (teams, players, athletes)
CREATE TABLE public.discipline_followable_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discipline_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('team', 'player', 'athlete', 'league', 'organization')),
  name TEXT NOT NULL,
  external_id TEXT,
  metadata JSONB DEFAULT '{}',
  search_keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for search and lookup
CREATE INDEX idx_discipline_followable_entities_discipline ON public.discipline_followable_entities(discipline_id);
CREATE INDEX idx_discipline_followable_entities_type ON public.discipline_followable_entities(entity_type);
CREATE INDEX idx_discipline_followable_entities_search ON public.discipline_followable_entities USING GIN(search_keywords);

-- 3. Client Discipline Favorites Table (user follows)
CREATE TABLE public.client_discipline_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  discipline_id TEXT NOT NULL,
  entity_id UUID NOT NULL REFERENCES public.discipline_followable_entities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, entity_id)
);

-- Create index for client lookups
CREATE INDEX idx_client_discipline_favorites_client ON public.client_discipline_favorites(client_id);
CREATE INDEX idx_client_discipline_favorites_discipline ON public.client_discipline_favorites(discipline_id);

-- Enable RLS
ALTER TABLE public.client_discipline_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only manage their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.client_discipline_favorites FOR SELECT
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can add their own favorites"
ON public.client_discipline_favorites FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own favorites"
ON public.client_discipline_favorites FOR DELETE
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

-- 4. News Cache Table (cached RSS items)
CREATE TABLE public.discipline_news_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discipline_id TEXT NOT NULL,
  source_id UUID REFERENCES public.discipline_news_sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  entity_ids UUID[] DEFAULT '{}',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  UNIQUE(discipline_id, url)
);

-- Create indexes for efficient queries
CREATE INDEX idx_discipline_news_cache_discipline ON public.discipline_news_cache(discipline_id);
CREATE INDEX idx_discipline_news_cache_expires ON public.discipline_news_cache(expires_at);
CREATE INDEX idx_discipline_news_cache_published ON public.discipline_news_cache(published_at DESC);

-- ==============================================
-- SEED DATA: RSS FEEDS FOR ALL DISCIPLINES
-- ==============================================

-- Combat Sports
INSERT INTO public.discipline_news_sources (discipline_id, source_name, feed_url, priority) VALUES
('boxing', 'ESPN Boxing', 'https://www.espn.com/espn/rss/boxing/news', 1),
('boxing', 'Boxing Scene', 'https://www.boxingscene.com/rss/news.xml', 2),
('mma', 'ESPN MMA', 'https://www.espn.com/espn/rss/mma/news', 1),
('mma', 'MMA Fighting', 'https://www.mmafighting.com/rss/current', 2),
('muay_thai', 'ONE Championship', 'https://www.onefc.com/feed/', 1),
('kickboxing', 'ONE Championship', 'https://www.onefc.com/feed/', 1),
('bjj', 'FloGrappling', 'https://www.flograppling.com/api/feed/articles', 1),
('karate', 'WKF News', 'https://www.wkf.net/feed/', 1);

-- Team Sports
INSERT INTO public.discipline_news_sources (discipline_id, source_name, feed_url, priority) VALUES
('football', 'ESPN Soccer', 'https://www.espn.com/espn/rss/soccer/news', 1),
('football', 'BBC Sport Football', 'https://feeds.bbci.co.uk/sport/football/rss.xml', 2),
('basketball', 'ESPN NBA', 'https://www.espn.com/espn/rss/nba/news', 1),
('american_football', 'ESPN NFL', 'https://www.espn.com/espn/rss/nfl/news', 1),
('rugby', 'ESPN Rugby', 'https://www.espn.com/espn/rss/rugby/news', 1),
('ice_hockey', 'ESPN NHL', 'https://www.espn.com/espn/rss/nhl/news', 1),
('volleyball', 'FIVB News', 'https://www.fivb.com/en/feed', 1);

-- Racket Sports
INSERT INTO public.discipline_news_sources (discipline_id, source_name, feed_url, priority) VALUES
('tennis', 'ESPN Tennis', 'https://www.espn.com/espn/rss/tennis/news', 1),
('badminton', 'BWF News', 'https://bwfbadminton.com/feed/', 1),
('squash', 'PSA World Tour', 'https://www.psaworldtour.com/feed/', 1),
('table_tennis', 'ITTF News', 'https://www.ittf.com/feed/', 1),
('padel', 'World Padel Tour', 'https://www.worldpadeltour.com/en/feed/', 1);

-- Endurance Sports
INSERT INTO public.discipline_news_sources (discipline_id, source_name, feed_url, priority) VALUES
('running', 'Runners World', 'https://www.runnersworld.com/feed/', 1),
('cycling', 'Cycling News', 'https://www.cyclingnews.com/rss/', 1),
('swimming', 'SwimSwam', 'https://swimswam.com/feed/', 1),
('triathlon', 'Triathlete', 'https://www.triathlete.com/feed/', 1),
('spartan_race', 'Spartan Race', 'https://www.spartan.com/feed/', 1);

-- Strength Sports
INSERT INTO public.discipline_news_sources (discipline_id, source_name, feed_url, priority) VALUES
('powerlifting', 'BarBend', 'https://barbend.com/feed/', 1),
('bodybuilding', 'Generation Iron', 'https://generationiron.com/feed/', 1),
('crossfit', 'CrossFit Games', 'https://games.crossfit.com/feed/', 1),
('calisthenics', 'BarBend', 'https://barbend.com/feed/', 1);

-- Other Sports
INSERT INTO public.discipline_news_sources (discipline_id, source_name, feed_url, priority) VALUES
('golf', 'ESPN Golf', 'https://www.espn.com/espn/rss/golf/news', 1);

-- ==============================================
-- SEED DATA: POPULAR FOLLOWABLE ENTITIES
-- ==============================================

-- Combat Sports - Boxing
INSERT INTO public.discipline_followable_entities (discipline_id, entity_type, name, search_keywords) VALUES
('boxing', 'athlete', 'Canelo Alvarez', ARRAY['canelo', 'alvarez', 'saul']),
('boxing', 'athlete', 'Tyson Fury', ARRAY['fury', 'tyson', 'gypsy king']),
('boxing', 'athlete', 'Oleksandr Usyk', ARRAY['usyk', 'oleksandr']),
('boxing', 'athlete', 'Terence Crawford', ARRAY['crawford', 'terence', 'bud']),
('boxing', 'athlete', 'Naoya Inoue', ARRAY['inoue', 'naoya', 'monster']),
('boxing', 'organization', 'PBC', ARRAY['pbc', 'premier boxing']),
('boxing', 'organization', 'Matchroom', ARRAY['matchroom', 'hearn']);

-- Combat Sports - MMA
INSERT INTO public.discipline_followable_entities (discipline_id, entity_type, name, search_keywords) VALUES
('mma', 'athlete', 'Jon Jones', ARRAY['jones', 'jon', 'bones']),
('mma', 'athlete', 'Islam Makhachev', ARRAY['islam', 'makhachev']),
('mma', 'athlete', 'Alex Pereira', ARRAY['pereira', 'alex', 'poatan']),
('mma', 'athlete', 'Conor McGregor', ARRAY['conor', 'mcgregor', 'notorious']),
('mma', 'athlete', 'Khabib Nurmagomedov', ARRAY['khabib', 'nurmagomedov']),
('mma', 'organization', 'UFC', ARRAY['ufc', 'ultimate fighting']),
('mma', 'organization', 'PFL', ARRAY['pfl', 'professional fighters league']),
('mma', 'organization', 'Bellator', ARRAY['bellator']);

-- Team Sports - Football
INSERT INTO public.discipline_followable_entities (discipline_id, entity_type, name, search_keywords) VALUES
('football', 'league', 'Premier League', ARRAY['premier league', 'epl', 'english']),
('football', 'league', 'La Liga', ARRAY['la liga', 'spanish']),
('football', 'league', 'Champions League', ARRAY['champions league', 'ucl']),
('football', 'team', 'Manchester United', ARRAY['manchester united', 'man united', 'man utd', 'united']),
('football', 'team', 'Liverpool', ARRAY['liverpool', 'reds']),
('football', 'team', 'Real Madrid', ARRAY['real madrid', 'madrid', 'los blancos']),
('football', 'team', 'Barcelona', ARRAY['barcelona', 'barca']),
('football', 'team', 'Manchester City', ARRAY['manchester city', 'man city', 'city']),
('football', 'player', 'Erling Haaland', ARRAY['haaland', 'erling']),
('football', 'player', 'Kylian Mbappe', ARRAY['mbappe', 'kylian']),
('football', 'player', 'Jude Bellingham', ARRAY['bellingham', 'jude']),
('football', 'player', 'Mohamed Salah', ARRAY['salah', 'mohamed', 'mo']);

-- Team Sports - Basketball
INSERT INTO public.discipline_followable_entities (discipline_id, entity_type, name, search_keywords) VALUES
('basketball', 'league', 'NBA', ARRAY['nba', 'national basketball']),
('basketball', 'team', 'Los Angeles Lakers', ARRAY['lakers', 'la lakers', 'los angeles']),
('basketball', 'team', 'Boston Celtics', ARRAY['celtics', 'boston']),
('basketball', 'team', 'Golden State Warriors', ARRAY['warriors', 'golden state', 'gsw']),
('basketball', 'player', 'LeBron James', ARRAY['lebron', 'james', 'king james']),
('basketball', 'player', 'Stephen Curry', ARRAY['curry', 'stephen', 'steph']),
('basketball', 'player', 'Luka Doncic', ARRAY['luka', 'doncic']),
('basketball', 'player', 'Giannis Antetokounmpo', ARRAY['giannis', 'antetokounmpo', 'greek freak']);

-- Racket Sports - Tennis
INSERT INTO public.discipline_followable_entities (discipline_id, entity_type, name, search_keywords) VALUES
('tennis', 'athlete', 'Novak Djokovic', ARRAY['djokovic', 'novak', 'nole']),
('tennis', 'athlete', 'Carlos Alcaraz', ARRAY['alcaraz', 'carlos']),
('tennis', 'athlete', 'Jannik Sinner', ARRAY['sinner', 'jannik']),
('tennis', 'athlete', 'Iga Swiatek', ARRAY['swiatek', 'iga']),
('tennis', 'athlete', 'Aryna Sabalenka', ARRAY['sabalenka', 'aryna']),
('tennis', 'league', 'ATP Tour', ARRAY['atp', 'atp tour']),
('tennis', 'league', 'WTA Tour', ARRAY['wta', 'wta tour']);

-- Golf
INSERT INTO public.discipline_followable_entities (discipline_id, entity_type, name, search_keywords) VALUES
('golf', 'athlete', 'Scottie Scheffler', ARRAY['scheffler', 'scottie']),
('golf', 'athlete', 'Rory McIlroy', ARRAY['mcilroy', 'rory']),
('golf', 'athlete', 'Jon Rahm', ARRAY['rahm', 'jon']),
('golf', 'league', 'PGA Tour', ARRAY['pga', 'pga tour']),
('golf', 'league', 'LIV Golf', ARRAY['liv', 'liv golf']);