-- Add card_image_url column to coach_profiles for marketplace card display
ALTER TABLE public.coach_profiles 
ADD COLUMN card_image_url text;