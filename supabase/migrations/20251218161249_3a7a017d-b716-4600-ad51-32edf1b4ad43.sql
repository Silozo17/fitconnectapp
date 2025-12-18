-- Add who_i_work_with field to coach_profiles
ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS who_i_work_with TEXT;

-- Create coach_gallery_images table (limit of 5 images per coach enforced in app)
CREATE TABLE public.coach_gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_gallery_images ENABLE ROW LEVEL SECURITY;

-- Coach can manage their own gallery images
CREATE POLICY "Coaches can view their own gallery images"
ON public.coach_gallery_images FOR SELECT
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert their own gallery images"
ON public.coach_gallery_images FOR INSERT
WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own gallery images"
ON public.coach_gallery_images FOR UPDATE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own gallery images"
ON public.coach_gallery_images FOR DELETE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Public can view gallery images of marketplace-visible coaches
CREATE POLICY "Public can view gallery images of visible coaches"
ON public.coach_gallery_images FOR SELECT
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE marketplace_visible = true));

-- Create coach_group_classes table
CREATE TABLE public.coach_group_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  schedule_info TEXT,
  target_audience TEXT,
  location TEXT,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'GBP',
  is_waitlist_open BOOLEAN DEFAULT true,
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_group_classes ENABLE ROW LEVEL SECURITY;

-- Coach can manage their own group classes
CREATE POLICY "Coaches can view their own group classes"
ON public.coach_group_classes FOR SELECT
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can insert their own group classes"
ON public.coach_group_classes FOR INSERT
WITH CHECK (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their own group classes"
ON public.coach_group_classes FOR UPDATE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can delete their own group classes"
ON public.coach_group_classes FOR DELETE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Public can view active group classes of marketplace-visible coaches
CREATE POLICY "Public can view active group classes of visible coaches"
ON public.coach_group_classes FOR SELECT
USING (is_active = true AND coach_id IN (SELECT id FROM public.coach_profiles WHERE marketplace_visible = true));

-- Create group_class_waitlist table
CREATE TABLE public.group_class_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_class_id UUID NOT NULL REFERENCES public.coach_group_classes(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'enrolled')),
  UNIQUE(group_class_id, client_id)
);

-- Enable RLS
ALTER TABLE public.group_class_waitlist ENABLE ROW LEVEL SECURITY;

-- Clients can view and manage their own waitlist entries
CREATE POLICY "Clients can view their own waitlist entries"
ON public.group_class_waitlist FOR SELECT
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can join waitlists"
ON public.group_class_waitlist FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can leave waitlists"
ON public.group_class_waitlist FOR DELETE
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

-- Coaches can view waitlist for their own classes
CREATE POLICY "Coaches can view waitlist for their classes"
ON public.group_class_waitlist FOR SELECT
USING (group_class_id IN (
  SELECT gc.id FROM public.coach_group_classes gc
  JOIN public.coach_profiles cp ON gc.coach_id = cp.id
  WHERE cp.user_id = auth.uid()
));

-- Coaches can update waitlist status for their classes
CREATE POLICY "Coaches can update waitlist for their classes"
ON public.group_class_waitlist FOR UPDATE
USING (group_class_id IN (
  SELECT gc.id FROM public.coach_group_classes gc
  JOIN public.coach_profiles cp ON gc.coach_id = cp.id
  WHERE cp.user_id = auth.uid()
));

-- Create trigger for updated_at on coach_group_classes
CREATE TRIGGER update_coach_group_classes_updated_at
BEFORE UPDATE ON public.coach_group_classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_coach_gallery_images_coach_id ON public.coach_gallery_images(coach_id);
CREATE INDEX idx_coach_group_classes_coach_id ON public.coach_group_classes(coach_id);
CREATE INDEX idx_group_class_waitlist_class_id ON public.group_class_waitlist(group_class_id);
CREATE INDEX idx_group_class_waitlist_client_id ON public.group_class_waitlist(client_id);