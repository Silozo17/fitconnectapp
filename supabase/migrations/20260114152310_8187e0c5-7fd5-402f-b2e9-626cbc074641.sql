-- Create gym_onboarding_staff_invites table for pending staff invitations
CREATE TABLE IF NOT EXISTS gym_onboarding_staff_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  location_ids uuid[] DEFAULT '{}',
  status text DEFAULT 'pending',
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gym_onboarding_staff_invites ENABLE ROW LEVEL SECURITY;

-- RLS policies for gym_onboarding_staff_invites (using user_id instead of owner_id)
CREATE POLICY "Gym owners can manage staff invites"
ON gym_onboarding_staff_invites
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM gym_profiles
    WHERE gym_profiles.id = gym_onboarding_staff_invites.gym_id
    AND gym_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Invited users can view their invites"
ON gym_onboarding_staff_invites
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gym_onboarding_staff_invites_gym_id ON gym_onboarding_staff_invites(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_onboarding_staff_invites_email ON gym_onboarding_staff_invites(email);