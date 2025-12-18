-- Fix 1: Create improved has_role function that only uses auth.uid()
-- This prevents accepting arbitrary user_id parameters for authorization

CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
  )
$$;

-- Keep the old function signature for backward compatibility but add auth.uid() check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      -- Security: Only allow checking own roles OR if caller is admin
      AND (_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      ))
  )
$$;

-- Fix 2: Improve client_has_messaged_coach to verify relationship
CREATE OR REPLACE FUNCTION public.client_has_messaged_coach(client_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM messages m
    JOIN coach_profiles cp ON cp.user_id = auth.uid()
    WHERE (
      (m.sender_id = client_profile_id AND m.receiver_id = cp.id)
      OR (m.receiver_id = client_profile_id AND m.sender_id = cp.id)
    )
  )
$$;

-- Fix 3: Improve coach_has_messaged_client to verify relationship  
CREATE OR REPLACE FUNCTION public.coach_has_messaged_client(coach_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM messages m
    JOIN client_profiles cp ON cp.user_id = auth.uid()
    WHERE (
      (m.sender_id = coach_profile_id AND m.receiver_id = cp.id)
      OR (m.receiver_id = coach_profile_id AND m.sender_id = cp.id)
    )
  )
$$;

-- Fix 4: Restrict admin_dashboard_widgets to only allow admins to modify defaults
DROP POLICY IF EXISTS "Admins can manage their own widgets" ON admin_dashboard_widgets;

CREATE POLICY "Admins can manage their own widgets" 
ON admin_dashboard_widgets
FOR ALL
USING (
  admin_id IN (SELECT id FROM admin_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Only super admins can manage default widgets"
ON admin_dashboard_widgets
FOR ALL
USING (
  admin_id IS NULL AND has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 5: Create a leaderboard-safe view for client profiles that hides sensitive data
CREATE OR REPLACE VIEW public.leaderboard_profiles AS
SELECT 
  cp.id,
  cp.user_id,
  COALESCE(cp.leaderboard_display_name, cp.first_name, 'Anonymous') as display_name,
  cp.city,
  cp.county,
  cp.country,
  cp.selected_avatar_id,
  cp.leaderboard_visible
FROM client_profiles cp
WHERE cp.leaderboard_visible = true;

-- Grant access to the view
GRANT SELECT ON public.leaderboard_profiles TO authenticated;
GRANT SELECT ON public.leaderboard_profiles TO anon;