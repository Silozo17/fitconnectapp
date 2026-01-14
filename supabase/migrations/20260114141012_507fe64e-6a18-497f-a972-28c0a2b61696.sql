-- Phase 3: Public Marketing & SEO Tables

-- Gym public website settings
CREATE TABLE public.gym_website_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  theme_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#10B981',
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  about_title TEXT,
  about_content TEXT,
  mission_statement TEXT,
  features_title TEXT,
  features_enabled BOOLEAN DEFAULT true,
  testimonials_enabled BOOLEAN DEFAULT true,
  classes_enabled BOOLEAN DEFAULT true,
  trainers_enabled BOOLEAN DEFAULT true,
  pricing_enabled BOOLEAN DEFAULT true,
  contact_enabled BOOLEAN DEFAULT true,
  gallery_enabled BOOLEAN DEFAULT true,
  custom_css TEXT,
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  og_image_url TEXT,
  canonical_url TEXT,
  google_analytics_id VARCHAR(50),
  facebook_pixel_id VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id)
);

-- Gym gallery images
CREATE TABLE public.gym_gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gym testimonials
CREATE TABLE public.gym_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.gym_members(id) ON DELETE SET NULL,
  author_name VARCHAR(100) NOT NULL,
  author_role VARCHAR(100),
  author_image_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gym announcements / blog posts
CREATE TABLE public.gym_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  author_name VARCHAR(100),
  category VARCHAR(50) DEFAULT 'news',
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, slug)
);

-- Gym social links
CREATE TABLE public.gym_social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, platform)
);

-- Gym opening hours
CREATE TABLE public.gym_opening_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.gym_locations(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  special_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, location_id, day_of_week)
);

-- Gym featured trainers
CREATE TABLE public.gym_featured_trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(100),
  bio TEXT,
  photo_url TEXT,
  specialties TEXT[],
  certifications TEXT[],
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_featured_trainers ENABLE ROW LEVEL SECURITY;

-- Public read policies (for public website)
CREATE POLICY "Public can view gym website settings" ON public.gym_website_settings
  FOR SELECT USING (true);

CREATE POLICY "Public can view gym gallery" ON public.gym_gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Public can view approved testimonials" ON public.gym_testimonials
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Public can view published announcements" ON public.gym_announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view gym social links" ON public.gym_social_links
  FOR SELECT USING (true);

CREATE POLICY "Public can view gym opening hours" ON public.gym_opening_hours
  FOR SELECT USING (true);

CREATE POLICY "Public can view active trainers" ON public.gym_featured_trainers
  FOR SELECT USING (is_active = true);

-- Staff management policies (using correct enum values: owner, manager)
CREATE POLICY "Staff can manage website settings" ON public.gym_website_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_website_settings.gym_id
      AND gs.user_id = auth.uid()
      AND gs.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Staff can manage gallery" ON public.gym_gallery_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_gallery_images.gym_id
      AND gs.user_id = auth.uid()
      AND gs.role IN ('owner', 'manager', 'marketing')
    )
  );

CREATE POLICY "Staff can manage all testimonials" ON public.gym_testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_testimonials.gym_id
      AND gs.user_id = auth.uid()
      AND gs.role IN ('owner', 'manager', 'marketing')
    )
  );

CREATE POLICY "Staff can manage announcements" ON public.gym_announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_announcements.gym_id
      AND gs.user_id = auth.uid()
      AND gs.role IN ('owner', 'manager', 'marketing')
    )
  );

CREATE POLICY "Staff can manage social links" ON public.gym_social_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_social_links.gym_id
      AND gs.user_id = auth.uid()
      AND gs.role IN ('owner', 'manager', 'marketing')
    )
  );

CREATE POLICY "Staff can manage opening hours" ON public.gym_opening_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_opening_hours.gym_id
      AND gs.user_id = auth.uid()
      AND gs.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Staff can manage featured trainers" ON public.gym_featured_trainers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_featured_trainers.gym_id
      AND gs.user_id = auth.uid()
      AND gs.role IN ('owner', 'manager')
    )
  );

-- Indexes for performance
CREATE INDEX idx_gym_gallery_gym_id ON public.gym_gallery_images(gym_id);
CREATE INDEX idx_gym_testimonials_gym_id ON public.gym_testimonials(gym_id);
CREATE INDEX idx_gym_announcements_gym_id ON public.gym_announcements(gym_id);
CREATE INDEX idx_gym_announcements_slug ON public.gym_announcements(gym_id, slug);
CREATE INDEX idx_gym_social_links_gym_id ON public.gym_social_links(gym_id);
CREATE INDEX idx_gym_opening_hours_gym_id ON public.gym_opening_hours(gym_id);
CREATE INDEX idx_gym_featured_trainers_gym_id ON public.gym_featured_trainers(gym_id);