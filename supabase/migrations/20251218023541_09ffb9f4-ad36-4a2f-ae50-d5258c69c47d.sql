-- Fix 1: Allow coaches to view their own profile
CREATE POLICY "Coaches can view their own profile"
ON public.coach_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Fix 2: Allow admins to view all coach profiles  
CREATE POLICY "Admins can view all coach profiles"
ON public.coach_profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));