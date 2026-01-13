-- =====================================================
-- FITCONNECT FOR GYMS - CORE DATABASE SCHEMA
-- Phase 1: Foundation Tables with Multi-Tenancy RLS
-- =====================================================

-- Create gym role enum
CREATE TYPE gym_role AS ENUM (
  'owner',      -- Full access
  'manager',    -- All except billing/ownership transfer
  'coach',      -- Classes, attendance, client interaction
  'marketing',  -- Marketing tools, communications
  'staff'       -- Limited: check-ins, basic ops
);

-- =====================================================
-- 1. GYM PROFILES (Main Tenant Table)
-- =====================================================
CREATE TABLE gym_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Owner's user_id
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- For subdomain: {slug}.fitconnect.com
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Location
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  county TEXT,
  country TEXT DEFAULT 'GB',
  postcode TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  
  -- Branding
  primary_color TEXT DEFAULT '#FF6B35',
  secondary_color TEXT DEFAULT '#1A1A2E',
  accent_color TEXT DEFAULT '#00D9FF',
  
  -- Business settings
  currency TEXT DEFAULT 'GBP',
  timezone TEXT DEFAULT 'Europe/London',
  
  -- Stripe Connect
  stripe_account_id TEXT,
  stripe_account_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'restricted'
  platform_fee_percentage NUMERIC DEFAULT 2.5,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  verified_at TIMESTAMPTZ,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for slug lookups (subdomain routing)
CREATE UNIQUE INDEX idx_gym_profiles_slug ON gym_profiles(slug);
CREATE INDEX idx_gym_profiles_user_id ON gym_profiles(user_id);
CREATE INDEX idx_gym_profiles_status ON gym_profiles(status);

-- =====================================================
-- 2. GYM LOCATIONS (Multi-location support)
-- =====================================================
CREATE TABLE gym_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  county TEXT,
  country TEXT DEFAULT 'GB',
  postcode TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  phone TEXT,
  email TEXT,
  capacity INTEGER,
  opening_hours JSONB, -- {mon: {open: "06:00", close: "22:00"}, ...}
  amenities TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gym_locations_gym_id ON gym_locations(gym_id);

-- =====================================================
-- 3. GYM STAFF (Staff with Roles)
-- =====================================================
CREATE TABLE gym_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  coach_profile_id UUID REFERENCES coach_profiles(id), -- Link to FitConnect coach
  role gym_role NOT NULL,
  display_name TEXT,
  job_title TEXT,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  phone TEXT,
  is_visible_to_members BOOLEAN DEFAULT true,
  specializations TEXT[],
  can_take_bookings BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}', -- Granular permissions
  status TEXT DEFAULT 'active', -- 'invited', 'active', 'inactive'
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id, user_id)
);

CREATE INDEX idx_gym_staff_gym_id ON gym_staff(gym_id);
CREATE INDEX idx_gym_staff_user_id ON gym_staff(user_id);
CREATE INDEX idx_gym_staff_coach_profile_id ON gym_staff(coach_profile_id);

-- =====================================================
-- 4. GYM MEMBERS
-- =====================================================
CREATE TABLE gym_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  client_profile_id UUID REFERENCES client_profiles(id), -- Link to FitConnect client
  
  -- Member info
  member_number TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  avatar_url TEXT,
  
  -- Address
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'GB',
  
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  
  -- Health & safety
  medical_conditions TEXT[],
  allergies TEXT[],
  notes TEXT, -- Staff notes about member
  
  -- Grading (martial arts)
  current_grade TEXT,
  grade_achieved_at TIMESTAMPTZ,
  eligible_for_grading BOOLEAN DEFAULT false,
  grading_history JSONB DEFAULT '[]',
  
  -- Access control
  rfid_tag_id TEXT,
  qr_code TEXT,
  pin_code TEXT, -- For kiosk check-in
  
  -- Referral
  referred_by_member_id UUID REFERENCES gym_members(id),
  referral_code TEXT,
  
  -- Consents
  waiver_signed_at TIMESTAMPTZ,
  terms_accepted_at TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT false,
  photo_consent BOOLEAN DEFAULT false,
  
  -- Tags for filtering
  tags TEXT[],
  
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'suspended', 'archived'
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_visit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(gym_id, user_id)
);

-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_gym_member_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substring(md5(random()::text) from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gym_member_referral_code
  BEFORE INSERT ON gym_members
  FOR EACH ROW
  EXECUTE FUNCTION generate_gym_member_referral_code();

CREATE INDEX idx_gym_members_gym_id ON gym_members(gym_id);
CREATE INDEX idx_gym_members_user_id ON gym_members(user_id);
CREATE INDEX idx_gym_members_email ON gym_members(email);
CREATE INDEX idx_gym_members_status ON gym_members(status);
CREATE UNIQUE INDEX idx_gym_members_referral_code ON gym_members(referral_code);

-- =====================================================
-- 5. MEMBERSHIP PLANS
-- =====================================================
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL, -- 'recurring', 'class_pack', 'drop_in', 'trial'
  
  -- Pricing
  price_amount INTEGER NOT NULL, -- In minor currency units (pence)
  currency TEXT DEFAULT 'GBP',
  billing_interval TEXT, -- 'week', 'month', 'year' (for recurring)
  billing_interval_count INTEGER DEFAULT 1,
  setup_fee INTEGER DEFAULT 0,
  
  -- Class credits (for class packs)
  class_credits INTEGER,
  credits_expire_days INTEGER,
  
  -- Access rules
  included_class_types UUID[], -- Which class type IDs are included
  locations_access UUID[], -- Which location IDs (empty = all)
  unlimited_classes BOOLEAN DEFAULT false,
  max_classes_per_week INTEGER,
  max_classes_per_day INTEGER,
  
  -- Contract terms
  min_commitment_months INTEGER,
  notice_period_days INTEGER DEFAULT 30,
  cancellation_fee INTEGER,
  
  -- Trial settings
  trial_days INTEGER,
  
  -- Benefits/features list
  features TEXT[],
  
  -- Stripe
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  
  -- Visibility
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true, -- Show on public pricing page
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Styling
  badge_text TEXT, -- e.g., "Most Popular", "Best Value"
  badge_color TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_membership_plans_gym_id ON membership_plans(gym_id);
CREATE INDEX idx_membership_plans_is_active ON membership_plans(is_active);

-- =====================================================
-- 6. GYM MEMBERSHIPS (Member's active subscriptions)
-- =====================================================
CREATE TABLE gym_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES gym_members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES membership_plans(id),
  
  status TEXT DEFAULT 'active', -- 'pending', 'active', 'paused', 'cancelled', 'expired'
  
  -- Billing
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Pricing at time of purchase (for historical accuracy)
  price_amount INTEGER,
  currency TEXT DEFAULT 'GBP',
  
  -- Class credits
  credits_remaining INTEGER,
  credits_total INTEGER,
  credits_expire_at TIMESTAMPTZ,
  
  -- Freeze/pause
  paused_at TIMESTAMPTZ,
  pause_until TIMESTAMPTZ,
  pause_reason TEXT,
  total_pause_days INTEGER DEFAULT 0,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  
  -- Contract
  contract_start_date DATE,
  contract_end_date DATE,
  
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gym_memberships_gym_id ON gym_memberships(gym_id);
CREATE INDEX idx_gym_memberships_member_id ON gym_memberships(member_id);
CREATE INDEX idx_gym_memberships_status ON gym_memberships(status);
CREATE INDEX idx_gym_memberships_stripe_subscription_id ON gym_memberships(stripe_subscription_id);

-- =====================================================
-- 7. CLASS TYPES
-- =====================================================
CREATE TABLE gym_class_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  color TEXT DEFAULT '#FF6B35', -- For calendar display
  icon TEXT,
  image_url TEXT,
  default_duration_minutes INTEGER DEFAULT 60,
  default_capacity INTEGER DEFAULT 20,
  requires_booking BOOLEAN DEFAULT true,
  allow_drop_in BOOLEAN DEFAULT true,
  cancellation_deadline_hours INTEGER DEFAULT 2,
  credits_required INTEGER DEFAULT 1,
  difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced', 'all_levels'
  equipment_needed TEXT[],
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gym_class_types_gym_id ON gym_class_types(gym_id);

-- =====================================================
-- 8. CLASSES (Scheduled class instances)
-- =====================================================
CREATE TABLE gym_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  class_type_id UUID NOT NULL REFERENCES gym_class_types(id),
  location_id UUID REFERENCES gym_locations(id),
  instructor_id UUID REFERENCES gym_staff(id),
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- RRULE format (e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR)
  recurrence_end_date DATE,
  parent_class_id UUID REFERENCES gym_classes(id), -- For recurring instances
  
  -- Capacity
  capacity INTEGER NOT NULL,
  waitlist_capacity INTEGER DEFAULT 5,
  booked_count INTEGER DEFAULT 0,
  waitlist_count INTEGER DEFAULT 0,
  attended_count INTEGER DEFAULT 0,
  
  -- Booking rules
  booking_opens_hours_before INTEGER DEFAULT 168, -- 1 week default
  booking_closes_hours_before INTEGER DEFAULT 0,
  cancellation_deadline_hours INTEGER DEFAULT 2,
  late_cancel_penalty_credits INTEGER DEFAULT 0,
  
  -- Credits
  credits_required INTEGER DEFAULT 1,
  
  -- Room/space
  room TEXT,
  
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'cancelled', 'completed'
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Notes
  notes TEXT, -- Internal notes for staff
  public_notes TEXT, -- Visible to members
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gym_classes_gym_id ON gym_classes(gym_id);
CREATE INDEX idx_gym_classes_class_type_id ON gym_classes(class_type_id);
CREATE INDEX idx_gym_classes_instructor_id ON gym_classes(instructor_id);
CREATE INDEX idx_gym_classes_start_time ON gym_classes(start_time);
CREATE INDEX idx_gym_classes_status ON gym_classes(status);

-- =====================================================
-- 9. CLASS BOOKINGS
-- =====================================================
CREATE TABLE gym_class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES gym_classes(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES gym_members(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES gym_memberships(id),
  
  status TEXT DEFAULT 'booked', -- 'booked', 'waitlisted', 'attended', 'no_show', 'cancelled', 'late_cancel'
  waitlist_position INTEGER,
  
  -- Check-in
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES gym_staff(id),
  check_in_method TEXT, -- 'manual', 'qr_code', 'rfid', 'kiosk', 'app'
  
  -- Credits
  credits_used INTEGER DEFAULT 0,
  credits_refunded BOOLEAN DEFAULT false,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID, -- User who cancelled (member or staff)
  late_cancel BOOLEAN DEFAULT false,
  
  -- Payment (for drop-in or pay-as-you-go)
  payment_id UUID,
  amount_paid INTEGER,
  
  -- Notes
  member_notes TEXT,
  staff_notes TEXT,
  
  booked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(class_id, member_id)
);

CREATE INDEX idx_gym_class_bookings_class_id ON gym_class_bookings(class_id);
CREATE INDEX idx_gym_class_bookings_member_id ON gym_class_bookings(member_id);
CREATE INDEX idx_gym_class_bookings_status ON gym_class_bookings(status);

-- =====================================================
-- 10. GYM PAYMENTS
-- =====================================================
CREATE TABLE gym_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES gym_members(id),
  membership_id UUID REFERENCES gym_memberships(id),
  
  amount INTEGER NOT NULL, -- Total amount in minor units
  currency TEXT DEFAULT 'GBP',
  platform_fee INTEGER, -- FitConnect's cut
  gym_payout INTEGER, -- Amount going to gym
  
  payment_type TEXT NOT NULL, -- 'subscription', 'class_pack', 'drop_in', 'product', 'setup_fee'
  description TEXT,
  
  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_transfer_id TEXT, -- Transfer to connected account
  stripe_invoice_id TEXT,
  
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded'
  
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- Refund
  refunded_at TIMESTAMPTZ,
  refund_amount INTEGER,
  refund_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gym_payments_gym_id ON gym_payments(gym_id);
CREATE INDEX idx_gym_payments_member_id ON gym_payments(member_id);
CREATE INDEX idx_gym_payments_status ON gym_payments(status);
CREATE INDEX idx_gym_payments_stripe_payment_intent_id ON gym_payments(stripe_payment_intent_id);

-- =====================================================
-- 11. GYM CHECK-INS (Access log)
-- =====================================================
CREATE TABLE gym_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES gym_members(id) ON DELETE CASCADE,
  location_id UUID REFERENCES gym_locations(id),
  class_booking_id UUID REFERENCES gym_class_bookings(id),
  
  check_in_method TEXT NOT NULL, -- 'manual', 'qr_code', 'rfid', 'kiosk', 'app'
  checked_in_by UUID REFERENCES gym_staff(id), -- For manual check-ins
  
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  
  -- Device info (for analytics)
  device_id TEXT,
  device_type TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gym_check_ins_gym_id ON gym_check_ins(gym_id);
CREATE INDEX idx_gym_check_ins_member_id ON gym_check_ins(member_id);
CREATE INDEX idx_gym_check_ins_checked_in_at ON gym_check_ins(checked_in_at);

-- =====================================================
-- 12. GRADING EVENTS (Martial Arts)
-- =====================================================
CREATE TABLE gym_grading_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gym_profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES gym_locations(id),
  
  name TEXT NOT NULL,
  description TEXT,
  
  grading_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  
  -- Grades being assessed
  grades_available TEXT[], -- e.g., ['white_to_yellow', 'yellow_to_orange']
  
  -- Capacity
  max_participants INTEGER,
  
  -- Pricing
  fee_amount INTEGER,
  currency TEXT DEFAULT 'GBP',
  
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'in_progress', 'completed', 'cancelled'
  
  examiner_name TEXT,
  examiner_organization TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gym_grading_events_gym_id ON gym_grading_events(gym_id);
CREATE INDEX idx_gym_grading_events_grading_date ON gym_grading_events(grading_date);

-- =====================================================
-- 13. GRADING REGISTRATIONS
-- =====================================================
CREATE TABLE gym_grading_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grading_event_id UUID NOT NULL REFERENCES gym_grading_events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES gym_members(id) ON DELETE CASCADE,
  
  current_grade TEXT,
  attempting_grade TEXT,
  
  status TEXT DEFAULT 'registered', -- 'registered', 'confirmed', 'passed', 'failed', 'absent'
  
  -- Payment
  fee_paid BOOLEAN DEFAULT false,
  payment_id UUID REFERENCES gym_payments(id),
  
  -- Results
  result_notes TEXT,
  graded_by UUID REFERENCES gym_staff(id),
  graded_at TIMESTAMPTZ,
  
  registered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(grading_event_id, member_id)
);

CREATE INDEX idx_gym_grading_registrations_event_id ON gym_grading_registrations(grading_event_id);
CREATE INDEX idx_gym_grading_registrations_member_id ON gym_grading_registrations(member_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is gym staff with specific role
CREATE OR REPLACE FUNCTION is_gym_staff(p_gym_id UUID, p_user_id UUID, p_roles gym_role[] DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_roles IS NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM gym_staff 
      WHERE gym_id = p_gym_id 
      AND user_id = p_user_id 
      AND status = 'active'
    );
  ELSE
    RETURN EXISTS (
      SELECT 1 FROM gym_staff 
      WHERE gym_id = p_gym_id 
      AND user_id = p_user_id 
      AND status = 'active'
      AND role = ANY(p_roles)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is gym owner
CREATE OR REPLACE FUNCTION is_gym_owner(p_gym_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM gym_profiles 
    WHERE id = p_gym_id 
    AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is gym member
CREATE OR REPLACE FUNCTION is_gym_member(p_gym_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM gym_members 
    WHERE gym_id = p_gym_id 
    AND user_id = p_user_id 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE gym_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_class_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_grading_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_grading_registrations ENABLE ROW LEVEL SECURITY;

-- GYM PROFILES POLICIES
CREATE POLICY "Anyone can view active gym profiles"
  ON gym_profiles FOR SELECT
  USING (status = 'active');

CREATE POLICY "Owners can manage their gyms"
  ON gym_profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Staff can view their gym"
  ON gym_profiles FOR SELECT
  USING (is_gym_staff(id, auth.uid()));

-- GYM LOCATIONS POLICIES
CREATE POLICY "Anyone can view active gym locations"
  ON gym_locations FOR SELECT
  USING (
    is_active = true 
    AND EXISTS (SELECT 1 FROM gym_profiles WHERE id = gym_id AND status = 'active')
  );

CREATE POLICY "Gym staff can manage locations"
  ON gym_locations FOR ALL
  USING (
    is_gym_owner(gym_id, auth.uid()) 
    OR is_gym_staff(gym_id, auth.uid(), ARRAY['owner', 'manager']::gym_role[])
  );

-- GYM STAFF POLICIES
CREATE POLICY "Staff can view their gym's staff"
  ON gym_staff FOR SELECT
  USING (
    is_gym_staff(gym_id, auth.uid()) 
    OR is_gym_owner(gym_id, auth.uid())
    OR is_gym_member(gym_id, auth.uid())
  );

CREATE POLICY "Owners and managers can manage staff"
  ON gym_staff FOR ALL
  USING (
    is_gym_owner(gym_id, auth.uid()) 
    OR is_gym_staff(gym_id, auth.uid(), ARRAY['owner', 'manager']::gym_role[])
  );

CREATE POLICY "Users can view their own staff record"
  ON gym_staff FOR SELECT
  USING (user_id = auth.uid());

-- GYM MEMBERS POLICIES
CREATE POLICY "Staff can view gym members"
  ON gym_members FOR SELECT
  USING (
    is_gym_staff(gym_id, auth.uid()) 
    OR is_gym_owner(gym_id, auth.uid())
  );

CREATE POLICY "Staff can manage members"
  ON gym_members FOR ALL
  USING (
    is_gym_owner(gym_id, auth.uid()) 
    OR is_gym_staff(gym_id, auth.uid(), ARRAY['owner', 'manager', 'coach', 'staff']::gym_role[])
  );

CREATE POLICY "Members can view own profile"
  ON gym_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Members can update own profile"
  ON gym_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- MEMBERSHIP PLANS POLICIES
CREATE POLICY "Anyone can view active plans"
  ON membership_plans FOR SELECT
  USING (is_active = true AND is_visible = true);

CREATE POLICY "Staff can view all plans"
  ON membership_plans FOR SELECT
  USING (
    is_gym_staff(gym_id, auth.uid()) 
    OR is_gym_owner(gym_id, auth.uid())
  );

CREATE POLICY "Owners and managers can manage plans"
  ON membership_plans FOR ALL
  USING (
    is_gym_owner(gym_id, auth.uid()) 
    OR is_gym_staff(gym_id, auth.uid(), ARRAY['owner', 'manager']::gym_role[])
  );

-- GYM MEMBERSHIPS POLICIES
CREATE POLICY "Staff can view memberships"
  ON gym_memberships FOR SELECT
  USING (
    is_gym_staff(gym_id, auth.uid()) 
    OR is_gym_owner(gym_id, auth.uid())
  );

CREATE POLICY "Staff can manage memberships"
  ON gym_memberships FOR ALL
  USING (
    is_gym_owner(gym_id, auth.uid()) 
    OR is_gym_staff(gym_id, auth.uid(), ARRAY['owner', 'manager']::gym_role[])
  );

CREATE POLICY "Members can view own memberships"
  ON gym_memberships FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM gym_members WHERE id = member_id AND user_id = auth.uid())
  );

-- CLASS TYPES POLICIES
CREATE POLICY "Anyone can view active class types"
  ON gym_class_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage class types"
  ON gym_class_types FOR ALL
  USING (
    is_gym_owner(gym_id, auth.uid()) 
    OR is_gym_staff(gym_id, auth.uid(), ARRAY['owner', 'manager']::gym_role[])
  );

-- CLASSES POLICIES
CREATE POLICY "Anyone can view scheduled classes"
  ON gym_classes FOR SELECT
  USING (status = 'scheduled');

CREATE POLICY "Staff can view all classes"
  ON gym_classes FOR SELECT
  USING (
    is_gym_staff(gym_id, auth.uid()) 
    OR is_gym_owner(gym_id, auth.uid())
  );

CREATE POLICY "Staff can manage classes"
  ON gym_classes FOR ALL
  USING (
    is_gym_owner(gym_id, auth.uid()) 
    OR is_gym_staff(gym_id, auth.uid(), ARRAY['owner', 'manager', 'coach']::gym_role[])
  );

-- CLASS BOOKINGS POLICIES
CREATE POLICY "Staff can view all bookings"
  ON gym_class_bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gym_classes gc 
      WHERE gc.id = class_id 
      AND (is_gym_staff(gc.gym_id, auth.uid()) OR is_gym_owner(gc.gym_id, auth.uid()))
    )
  );

CREATE POLICY "Staff can manage bookings"
  ON gym_class_bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gym_classes gc 
      WHERE gc.id = class_id 
      AND (is_gym_staff(gc.gym_id, auth.uid()) OR is_gym_owner(gc.gym_id, auth.uid()))
    )
  );

CREATE POLICY "Members can view own bookings"
  ON gym_class_bookings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM gym_members WHERE id = member_id AND user_id = auth.uid())
  );

CREATE POLICY "Members can manage own bookings"
  ON gym_class_bookings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM gym_members WHERE id = member_id AND user_id = auth.uid())
  );

-- PAYMENTS POLICIES
CREATE POLICY "Owners and managers can view payments"
  ON gym_payments FOR SELECT
  USING (
    is_gym_owner(gym_id, auth.uid()) 
    OR is_gym_staff(gym_id, auth.uid(), ARRAY['owner', 'manager']::gym_role[])
  );

CREATE POLICY "Members can view own payments"
  ON gym_payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM gym_members WHERE id = member_id AND user_id = auth.uid())
  );

-- CHECK-INS POLICIES
CREATE POLICY "Staff can view and manage check-ins"
  ON gym_check_ins FOR ALL
  USING (
    is_gym_staff(gym_id, auth.uid()) 
    OR is_gym_owner(gym_id, auth.uid())
  );

CREATE POLICY "Members can view own check-ins"
  ON gym_check_ins FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM gym_members WHERE id = member_id AND user_id = auth.uid())
  );

-- GRADING EVENTS POLICIES
CREATE POLICY "Anyone can view upcoming grading events"
  ON gym_grading_events FOR SELECT
  USING (status = 'upcoming');

CREATE POLICY "Staff can manage grading events"
  ON gym_grading_events FOR ALL
  USING (
    is_gym_owner(gym_id, auth.uid()) 
    OR is_gym_staff(gym_id, auth.uid(), ARRAY['owner', 'manager', 'coach']::gym_role[])
  );

-- GRADING REGISTRATIONS POLICIES
CREATE POLICY "Staff can view and manage registrations"
  ON gym_grading_registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gym_grading_events ge 
      WHERE ge.id = grading_event_id 
      AND (is_gym_staff(ge.gym_id, auth.uid()) OR is_gym_owner(ge.gym_id, auth.uid()))
    )
  );

CREATE POLICY "Members can view and manage own registrations"
  ON gym_grading_registrations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM gym_members WHERE id = member_id AND user_id = auth.uid())
  );

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gym_profiles_updated_at
  BEFORE UPDATE ON gym_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_locations_updated_at
  BEFORE UPDATE ON gym_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_staff_updated_at
  BEFORE UPDATE ON gym_staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_members_updated_at
  BEFORE UPDATE ON gym_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_plans_updated_at
  BEFORE UPDATE ON membership_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_memberships_updated_at
  BEFORE UPDATE ON gym_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_class_types_updated_at
  BEFORE UPDATE ON gym_class_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_classes_updated_at
  BEFORE UPDATE ON gym_classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_class_bookings_updated_at
  BEFORE UPDATE ON gym_class_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_payments_updated_at
  BEFORE UPDATE ON gym_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_grading_events_updated_at
  BEFORE UPDATE ON gym_grading_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_grading_registrations_updated_at
  BEFORE UPDATE ON gym_grading_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();