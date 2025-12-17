-- Create team_feature_permissions table for granular access control
CREATE TABLE public.team_feature_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(admin_id, feature_key)
);

-- Enable RLS
ALTER TABLE public.team_feature_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage permissions
CREATE POLICY "Admins can manage team permissions"
  ON public.team_feature_permissions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Team members can view their own permissions
CREATE POLICY "Team members can view own permissions"
  ON public.team_feature_permissions
  FOR SELECT
  USING (admin_id IN (
    SELECT id FROM admin_profiles WHERE user_id = auth.uid()
  ));

-- Create trigger for updated_at
CREATE TRIGGER update_team_feature_permissions_updated_at
  BEFORE UPDATE ON public.team_feature_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();