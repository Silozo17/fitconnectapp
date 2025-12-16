-- Add foreign key from reviews.client_id to client_profiles.id
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_client_id_fkey
FOREIGN KEY (client_id) REFERENCES public.client_profiles(id)
ON DELETE CASCADE;

-- Add foreign key from reviews.coach_id to coach_profiles.id  
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_coach_id_fkey
FOREIGN KEY (coach_id) REFERENCES public.coach_profiles(id)
ON DELETE CASCADE;