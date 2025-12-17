-- Add image_url column to badges table for storing badge images
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update all coach badges with their storage image URLs
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/business_builder.png' WHERE name = 'Business Builder';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/coaching_legend.png' WHERE name = 'Coaching Legend';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/coaching_star.png' WHERE name = 'Coaching Star';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/first_client.png' WHERE name = 'First Client';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/first_earning.png' WHERE name = 'First Earning';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/first_review.png' WHERE name = 'First Review';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/first_session.png' WHERE name = 'First Session';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/growing_business.png' WHERE name = 'Growing Business';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/highly_rated.png' WHERE name = 'Highly Rated';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/profile_pro.png' WHERE name = 'Profile Pro';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/profile_starter.png' WHERE name = 'Profile Starter';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/rising_star.png' WHERE name = 'Rising Star';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/session_master.png' WHERE name = 'Session Master';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/session_pro.png' WHERE name = 'Session Pro';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/top_rated.png' WHERE name = 'Top Rated';
UPDATE public.badges SET image_url = 'https://ntgfihgneyoxxbwmtceq.supabase.co/storage/v1/object/public/coach-badges/verified_coach.png' WHERE name = 'Verified Coach';