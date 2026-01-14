-- Phase 2: Contracts, Waivers & Lead Management

-- Contract/Waiver Templates
CREATE TABLE public.gym_contract_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'waiver', -- 'waiver', 'membership_agreement', 'liability', 'terms'
  content TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Signed Contracts/Waivers
CREATE TABLE public.gym_signed_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.gym_contract_templates(id) ON DELETE RESTRICT,
  signature_data TEXT, -- Base64 signature image or typed name
  signature_type TEXT DEFAULT 'typed', -- 'typed', 'drawn', 'checkbox'
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  template_version INTEGER NOT NULL,
  template_content_snapshot TEXT NOT NULL, -- Store content at time of signing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lead/Prospect Management
CREATE TABLE public.gym_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT DEFAULT 'website', -- 'website', 'referral', 'walk_in', 'social_media', 'advertising', 'other'
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'trial_scheduled', 'trial_completed', 'converted', 'lost'
  notes TEXT,
  assigned_to UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  interest_areas TEXT[], -- e.g., ['boxing', 'personal_training', 'group_classes']
  preferred_contact TEXT DEFAULT 'email', -- 'email', 'phone', 'sms'
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,
  converted_member_id UUID REFERENCES public.gym_members(id) ON DELETE SET NULL,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lead Activity/Notes Log
CREATE TABLE public.gym_lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.gym_leads(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL, -- 'note', 'call', 'email', 'meeting', 'status_change', 'trial_booked'
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add referral columns to gym_members
ALTER TABLE public.gym_members 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.gym_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_credits_earned INTEGER DEFAULT 0;

-- Generate referral code function
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code on member creation
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_referral_code
  BEFORE INSERT ON public.gym_members
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

-- Referral rewards tracking
CREATE TABLE public.gym_referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  referrer_member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  referred_member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  reward_type TEXT DEFAULT 'credits', -- 'credits', 'discount', 'free_month'
  reward_value INTEGER, -- credits amount or discount percentage
  status TEXT DEFAULT 'pending', -- 'pending', 'awarded', 'expired'
  awarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_gym_contract_templates_gym ON public.gym_contract_templates(gym_id);
CREATE INDEX idx_gym_signed_contracts_member ON public.gym_signed_contracts(member_id);
CREATE INDEX idx_gym_signed_contracts_gym ON public.gym_signed_contracts(gym_id);
CREATE INDEX idx_gym_leads_gym ON public.gym_leads(gym_id);
CREATE INDEX idx_gym_leads_status ON public.gym_leads(status);
CREATE INDEX idx_gym_leads_assigned ON public.gym_leads(assigned_to);
CREATE INDEX idx_gym_lead_activities_lead ON public.gym_lead_activities(lead_id);
CREATE INDEX idx_gym_referral_rewards_referrer ON public.gym_referral_rewards(referrer_member_id);

-- Enable RLS
ALTER TABLE public.gym_contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_signed_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contract templates
CREATE POLICY "Gym staff can manage contract templates"
  ON public.gym_contract_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_contract_templates.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Members can view active contract templates"
  ON public.gym_contract_templates
  FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.gym_members gm
      WHERE gm.gym_id = gym_contract_templates.gym_id
      AND gm.user_id = auth.uid()
    )
  );

-- RLS Policies for signed contracts
CREATE POLICY "Gym staff can view signed contracts"
  ON public.gym_signed_contracts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_signed_contracts.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Members can view and create their own signed contracts"
  ON public.gym_signed_contracts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_members gm
      WHERE gm.id = gym_signed_contracts.member_id
      AND gm.user_id = auth.uid()
    )
  );

-- RLS Policies for leads
CREATE POLICY "Gym staff can manage leads"
  ON public.gym_leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_leads.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

-- RLS Policies for lead activities
CREATE POLICY "Gym staff can manage lead activities"
  ON public.gym_lead_activities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_leads gl
      JOIN public.gym_staff gs ON gs.gym_id = gl.gym_id
      WHERE gl.id = gym_lead_activities.lead_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

-- RLS Policies for referral rewards
CREATE POLICY "Gym staff can manage referral rewards"
  ON public.gym_referral_rewards
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_referral_rewards.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Members can view their referral rewards"
  ON public.gym_referral_rewards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_members gm
      WHERE (gm.id = gym_referral_rewards.referrer_member_id OR gm.id = gym_referral_rewards.referred_member_id)
      AND gm.user_id = auth.uid()
    )
  );