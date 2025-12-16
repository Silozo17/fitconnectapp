
-- Create content type enum
CREATE TYPE public.content_type AS ENUM ('ebook', 'video_course', 'single_video', 'template', 'audio', 'other');

-- Create digital_products table
CREATE TABLE public.digital_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  content_type content_type NOT NULL DEFAULT 'other',
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  cover_image_url TEXT,
  preview_url TEXT,
  content_url TEXT,
  video_url TEXT,
  file_size_bytes BIGINT,
  duration_minutes INTEGER,
  page_count INTEGER,
  is_downloadable BOOLEAN DEFAULT false,
  is_streamable BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'other',
  difficulty_level TEXT DEFAULT 'intermediate',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create digital_bundles table
CREATE TABLE public.digital_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  currency TEXT DEFAULT 'GBP',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bundle_products junction table
CREATE TABLE public.bundle_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.digital_bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.digital_products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE(bundle_id, product_id)
);

-- Create content_purchases table
CREATE TABLE public.content_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.digital_products(id) ON DELETE SET NULL,
  bundle_id UUID REFERENCES public.digital_bundles(id) ON DELETE SET NULL,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id),
  amount_paid NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GBP',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  access_expires_at TIMESTAMPTZ,
  CONSTRAINT purchase_has_item CHECK (product_id IS NOT NULL OR bundle_id IS NOT NULL)
);

-- Create content_reviews table
CREATE TABLE public.content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.digital_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Enable RLS
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;

-- Digital Products Policies
CREATE POLICY "Anyone can view published products"
ON public.digital_products FOR SELECT
USING (is_published = true);

CREATE POLICY "Coaches can view their own products"
ON public.digital_products FOR SELECT
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can create their own products"
ON public.digital_products FOR INSERT
WITH CHECK (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own products"
ON public.digital_products FOR UPDATE
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own products"
ON public.digital_products FOR DELETE
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all products"
ON public.digital_products FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Digital Bundles Policies
CREATE POLICY "Anyone can view published bundles"
ON public.digital_bundles FOR SELECT
USING (is_published = true);

CREATE POLICY "Coaches can view their own bundles"
ON public.digital_bundles FOR SELECT
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can create their own bundles"
ON public.digital_bundles FOR INSERT
WITH CHECK (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own bundles"
ON public.digital_bundles FOR UPDATE
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own bundles"
ON public.digital_bundles FOR DELETE
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all bundles"
ON public.digital_bundles FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Bundle Products Policies
CREATE POLICY "Anyone can view bundle products for published bundles"
ON public.bundle_products FOR SELECT
USING (bundle_id IN (SELECT id FROM digital_bundles WHERE is_published = true));

CREATE POLICY "Coaches can manage their bundle products"
ON public.bundle_products FOR ALL
USING (bundle_id IN (SELECT id FROM digital_bundles WHERE coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid())));

-- Content Purchases Policies
CREATE POLICY "Users can view their own purchases"
ON public.content_purchases FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create purchases"
ON public.content_purchases FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Coaches can view purchases of their content"
ON public.content_purchases FOR SELECT
USING (coach_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all purchases"
ON public.content_purchases FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Content Reviews Policies
CREATE POLICY "Anyone can view reviews"
ON public.content_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for purchased content"
ON public.content_reviews FOR INSERT
WITH CHECK (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM content_purchases WHERE user_id = auth.uid() AND product_id = content_reviews.product_id
));

CREATE POLICY "Users can update their own reviews"
ON public.content_reviews FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
ON public.content_reviews FOR DELETE
USING (user_id = auth.uid());

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('digital-content', 'digital-content', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('content-previews', 'content-previews', true);

-- Storage policies for digital-content (private)
CREATE POLICY "Coaches can upload digital content"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'digital-content' AND auth.uid() IN (SELECT user_id FROM coach_profiles));

CREATE POLICY "Coaches can update their digital content"
ON storage.objects FOR UPDATE
USING (bucket_id = 'digital-content' AND auth.uid() IN (SELECT user_id FROM coach_profiles));

CREATE POLICY "Coaches can delete their digital content"
ON storage.objects FOR DELETE
USING (bucket_id = 'digital-content' AND auth.uid() IN (SELECT user_id FROM coach_profiles));

CREATE POLICY "Purchasers can access digital content"
ON storage.objects FOR SELECT
USING (bucket_id = 'digital-content' AND (
  auth.uid() IN (SELECT user_id FROM coach_profiles) OR
  has_role(auth.uid(), 'admin')
));

-- Storage policies for content-previews (public)
CREATE POLICY "Anyone can view content previews"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-previews');

CREATE POLICY "Coaches can upload content previews"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'content-previews' AND auth.uid() IN (SELECT user_id FROM coach_profiles));

CREATE POLICY "Coaches can update content previews"
ON storage.objects FOR UPDATE
USING (bucket_id = 'content-previews' AND auth.uid() IN (SELECT user_id FROM coach_profiles));

CREATE POLICY "Coaches can delete content previews"
ON storage.objects FOR DELETE
USING (bucket_id = 'content-previews' AND auth.uid() IN (SELECT user_id FROM coach_profiles));

-- Create indexes for performance
CREATE INDEX idx_digital_products_coach_id ON public.digital_products(coach_id);
CREATE INDEX idx_digital_products_category ON public.digital_products(category);
CREATE INDEX idx_digital_products_content_type ON public.digital_products(content_type);
CREATE INDEX idx_digital_products_is_published ON public.digital_products(is_published);
CREATE INDEX idx_digital_bundles_coach_id ON public.digital_bundles(coach_id);
CREATE INDEX idx_content_purchases_user_id ON public.content_purchases(user_id);
CREATE INDEX idx_content_purchases_product_id ON public.content_purchases(product_id);
CREATE INDEX idx_content_reviews_product_id ON public.content_reviews(product_id);

-- Add updated_at triggers
CREATE TRIGGER update_digital_products_updated_at
BEFORE UPDATE ON public.digital_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_digital_bundles_updated_at
BEFORE UPDATE ON public.digital_bundles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
