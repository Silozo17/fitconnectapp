-- Create gym_refund_requests table for refund/cancellation approval workflow
CREATE TABLE IF NOT EXISTS public.gym_refund_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.gym_locations(id) ON DELETE SET NULL,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.gym_memberships(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL DEFAULT 'refund' CHECK (request_type IN ('refund', 'early_cancel', 'freeze', 'fee_waiver')),
  reason TEXT NOT NULL,
  reason_category TEXT NOT NULL CHECK (reason_category IN ('relocation', 'injury', 'financial', 'other')),
  proof_url TEXT,
  amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create gym_staff_tasks table for to-do items
CREATE TABLE IF NOT EXISTS public.gym_staff_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.gym_locations(id) ON DELETE SET NULL,
  assigned_to UUID NOT NULL REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gym_staff_notifications table
CREATE TABLE IF NOT EXISTS public.gym_staff_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'refund_request', 'refund_approved', 'refund_rejected', 'member_signup', 'check_in', 'general')),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add columns to gym_staff for commission and hierarchy
ALTER TABLE public.gym_staff 
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reports_to UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL;

-- Add signed_up_by to gym_memberships for commission tracking
ALTER TABLE public.gym_memberships 
ADD COLUMN IF NOT EXISTS signed_up_by UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.gym_refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_staff_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gym_refund_requests
CREATE POLICY "Gym staff can view refund requests for their gym"
  ON public.gym_refund_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_refund_requests.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Managers can create refund requests"
  ON public.gym_refund_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_refund_requests.gym_id
      AND gs.user_id = auth.uid()
      AND gs.role IN ('owner', 'area_manager', 'manager')
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Owners can update refund requests"
  ON public.gym_refund_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_refund_requests.gym_id
      AND gs.user_id = auth.uid()
      AND gs.role IN ('owner', 'area_manager')
      AND gs.status = 'active'
    )
  );

-- RLS Policies for gym_staff_tasks
CREATE POLICY "Staff can view their own tasks or tasks they created"
  ON public.gym_staff_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_staff_tasks.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
      AND (
        gs.id = gym_staff_tasks.assigned_to
        OR gs.id = gym_staff_tasks.created_by
        OR gs.role IN ('owner', 'area_manager', 'manager')
      )
    )
  );

CREATE POLICY "Managers and above can create tasks"
  ON public.gym_staff_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_staff_tasks.gym_id
      AND gs.user_id = auth.uid()
      AND gs.role IN ('owner', 'area_manager', 'manager')
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Staff can update their own tasks"
  ON public.gym_staff_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_staff_tasks.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
      AND (
        gs.id = gym_staff_tasks.assigned_to
        OR gs.id = gym_staff_tasks.created_by
        OR gs.role IN ('owner', 'area_manager')
      )
    )
  );

CREATE POLICY "Creators can delete tasks"
  ON public.gym_staff_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_staff_tasks.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
      AND (
        gs.id = gym_staff_tasks.created_by
        OR gs.role IN ('owner', 'area_manager')
      )
    )
  );

-- RLS Policies for gym_staff_notifications
CREATE POLICY "Staff can view their own notifications"
  ON public.gym_staff_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.id = gym_staff_notifications.staff_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "System can create notifications for gym staff"
  ON public.gym_staff_notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.gym_id = gym_staff_notifications.gym_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

CREATE POLICY "Staff can update their own notifications"
  ON public.gym_staff_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_staff gs
      WHERE gs.id = gym_staff_notifications.staff_id
      AND gs.user_id = auth.uid()
      AND gs.status = 'active'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gym_refund_requests_gym_id ON public.gym_refund_requests(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_refund_requests_status ON public.gym_refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_gym_staff_tasks_assigned_to ON public.gym_staff_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_gym_staff_tasks_gym_id ON public.gym_staff_tasks(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_staff_notifications_staff_id ON public.gym_staff_notifications(staff_id);
CREATE INDEX IF NOT EXISTS idx_gym_staff_notifications_read ON public.gym_staff_notifications(read);

-- Create trigger for updating gym_staff_tasks.updated_at
DROP TRIGGER IF EXISTS update_gym_staff_tasks_updated_at ON public.gym_staff_tasks;
CREATE TRIGGER update_gym_staff_tasks_updated_at
  BEFORE UPDATE ON public.gym_staff_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();