-- Add booking mode to coach_profiles
ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS booking_mode text DEFAULT 'message_first';

-- Create coach_availability table for weekly availability
CREATE TABLE IF NOT EXISTS public.coach_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(coach_id, day_of_week)
);

-- Enable RLS on coach_availability
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_availability
CREATE POLICY "Anyone can view coach availability"
ON public.coach_availability FOR SELECT
USING (true);

CREATE POLICY "Coaches can manage their own availability"
ON public.coach_availability FOR ALL
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Create session_types table
CREATE TABLE IF NOT EXISTS public.session_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 60,
  price decimal(10,2) NOT NULL,
  is_online boolean DEFAULT true,
  is_in_person boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on session_types
ALTER TABLE public.session_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for session_types
CREATE POLICY "Anyone can view active session types"
ON public.session_types FOR SELECT
USING (is_active = true);

CREATE POLICY "Coaches can manage their own session types"
ON public.session_types FOR ALL
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Create booking_requests table
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES public.coach_profiles(id) NOT NULL,
  client_id uuid REFERENCES public.client_profiles(id) NOT NULL,
  session_type_id uuid REFERENCES public.session_types(id),
  requested_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  is_online boolean DEFAULT true,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on booking_requests
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for booking_requests
CREATE POLICY "Coaches can view their booking requests"
ON public.booking_requests FOR SELECT
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update their booking requests"
ON public.booking_requests FOR UPDATE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can view their own booking requests"
ON public.booking_requests FOR SELECT
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can create booking requests"
ON public.booking_requests FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can cancel their pending booking requests"
ON public.booking_requests FOR UPDATE
USING (
  client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())
  AND status = 'pending'
);

-- Enable realtime for booking_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_requests;

-- Add update trigger for session_types
CREATE TRIGGER update_session_types_updated_at
BEFORE UPDATE ON public.session_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();