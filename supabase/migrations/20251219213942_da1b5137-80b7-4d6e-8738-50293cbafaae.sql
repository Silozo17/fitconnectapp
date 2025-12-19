-- Enable realtime for coach_profiles table so admin plan changes broadcast to coaches
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_profiles;