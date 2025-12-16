-- Create connection_requests table if not exists
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE(client_id, coach_id)
);

-- Enable RLS
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Clients can view their own requests" ON public.connection_requests;
DROP POLICY IF EXISTS "Clients can create requests" ON public.connection_requests;
DROP POLICY IF EXISTS "Clients can cancel their pending requests" ON public.connection_requests;
DROP POLICY IF EXISTS "Coaches can view requests to them" ON public.connection_requests;
DROP POLICY IF EXISTS "Coaches can update requests to them" ON public.connection_requests;

CREATE POLICY "Clients can view their own requests"
ON public.connection_requests FOR SELECT
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can create requests"
ON public.connection_requests FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can cancel their pending requests"
ON public.connection_requests FOR DELETE
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) AND status = 'pending');

CREATE POLICY "Coaches can view requests to them"
ON public.connection_requests FOR SELECT
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can update requests to them"
ON public.connection_requests FOR UPDATE
USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()));

-- Enable realtime
ALTER TABLE public.connection_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connection_requests;