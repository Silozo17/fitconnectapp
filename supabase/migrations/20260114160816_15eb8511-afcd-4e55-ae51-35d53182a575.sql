-- Phase 4: Parent/Child Sub-Accounts
-- Add parent member reference for family accounts
ALTER TABLE public.gym_members 
ADD COLUMN IF NOT EXISTS parent_member_id uuid REFERENCES public.gym_members(id),
ADD COLUMN IF NOT EXISTS is_minor boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;

-- Phase 5: Member Portal Messaging
CREATE TABLE IF NOT EXISTS public.gym_member_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES public.gym_profiles(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('member', 'staff', 'system')),
  sender_member_id uuid REFERENCES public.gym_members(id) ON DELETE SET NULL,
  sender_staff_id uuid REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  recipient_member_id uuid REFERENCES public.gym_members(id) ON DELETE CASCADE,
  recipient_staff_id uuid REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  subject text,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  parent_message_id uuid REFERENCES public.gym_member_messages(id),
  created_at timestamptz DEFAULT now()
);

-- Phase 5: Member Progress Tracking
CREATE TABLE IF NOT EXISTS public.gym_member_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES public.gym_profiles(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES public.gym_members(id) ON DELETE CASCADE NOT NULL,
  recorded_at date DEFAULT CURRENT_DATE,
  weight_kg numeric(5,2),
  body_fat_percentage numeric(4,1),
  measurements jsonb DEFAULT '{}',
  notes text,
  photo_urls text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Phase 5: Member Goals
CREATE TABLE IF NOT EXISTS public.gym_member_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES public.gym_profiles(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES public.gym_members(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  goal_type text NOT NULL CHECK (goal_type IN ('weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'attendance', 'custom')),
  target_value numeric,
  current_value numeric,
  unit text,
  start_date date DEFAULT CURRENT_DATE,
  target_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Phase 5: Member Achievements
CREATE TABLE IF NOT EXISTS public.gym_member_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES public.gym_profiles(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES public.gym_members(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL,
  title text NOT NULL,
  description text,
  badge_icon text,
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.gym_member_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_member_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_member_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_member_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gym_member_messages
CREATE POLICY "Members can view their own messages"
  ON public.gym_member_messages FOR SELECT
  USING (
    recipient_member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid())
    OR sender_member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can send messages"
  ON public.gym_member_messages FOR INSERT
  WITH CHECK (
    sender_member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Staff can view gym messages"
  ON public.gym_member_messages FOR SELECT
  USING (
    gym_id IN (SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Staff can send gym messages"
  ON public.gym_member_messages FOR INSERT
  WITH CHECK (
    sender_staff_id IN (SELECT id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active')
  );

-- RLS Policies for gym_member_progress
CREATE POLICY "Members can view own progress"
  ON public.gym_member_progress FOR SELECT
  USING (member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can insert own progress"
  ON public.gym_member_progress FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update own progress"
  ON public.gym_member_progress FOR UPDATE
  USING (member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid()));

CREATE POLICY "Staff can view member progress"
  ON public.gym_member_progress FOR SELECT
  USING (gym_id IN (SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active'));

-- RLS Policies for gym_member_goals
CREATE POLICY "Members can manage own goals"
  ON public.gym_member_goals FOR ALL
  USING (member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid()));

CREATE POLICY "Staff can view member goals"
  ON public.gym_member_goals FOR SELECT
  USING (gym_id IN (SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active'));

-- RLS Policies for gym_member_achievements
CREATE POLICY "Members can view own achievements"
  ON public.gym_member_achievements FOR SELECT
  USING (member_id IN (SELECT id FROM gym_members WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage achievements"
  ON public.gym_member_achievements FOR ALL
  USING (gym_id IN (SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active'));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.gym_member_messages;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gym_member_messages_recipient ON public.gym_member_messages(recipient_member_id);
CREATE INDEX IF NOT EXISTS idx_gym_member_messages_gym ON public.gym_member_messages(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_member_progress_member ON public.gym_member_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_gym_member_goals_member ON public.gym_member_goals(member_id);
CREATE INDEX IF NOT EXISTS idx_gym_members_parent ON public.gym_members(parent_member_id);