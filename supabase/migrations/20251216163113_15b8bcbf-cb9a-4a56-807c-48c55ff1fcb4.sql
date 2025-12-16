-- Add target_audience to challenges for admin-created challenges
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS target_audience text DEFAULT 'clients' 
  CHECK (target_audience IN ('clients', 'coaches', 'all'));

-- Add admin_created_by for tracking which admin created the challenge
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS admin_created_by uuid REFERENCES admin_profiles(id);