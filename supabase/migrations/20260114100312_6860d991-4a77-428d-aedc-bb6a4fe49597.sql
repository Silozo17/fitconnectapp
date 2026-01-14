-- Phase 1: Core Booking & Payments Database Changes

-- 1.1 Recurring Classes: Add columns to gym_classes
ALTER TABLE public.gym_classes 
ADD COLUMN IF NOT EXISTS recurring_pattern JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS parent_class_id UUID REFERENCES public.gym_classes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_recurring_template BOOLEAN DEFAULT false;

-- Add index for recurring class lookups
CREATE INDEX IF NOT EXISTS idx_gym_classes_parent_class ON public.gym_classes(parent_class_id) WHERE parent_class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gym_classes_recurring_template ON public.gym_classes(gym_id, is_recurring_template) WHERE is_recurring_template = true;

-- 1.2 Waitlist Auto-Promotion: Already have waitlist_position in bookings, add trigger
-- Create function to promote waitlist when booking is cancelled
CREATE OR REPLACE FUNCTION public.promote_waitlist_on_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  next_waitlist_booking RECORD;
BEGIN
  -- Only run when status changes to cancelled
  IF NEW.status = 'cancelled' AND OLD.status IN ('confirmed', 'waitlisted') THEN
    -- If a confirmed booking is cancelled, promote the first waitlisted person
    IF OLD.status = 'confirmed' THEN
      -- Find the first person on the waitlist
      SELECT * INTO next_waitlist_booking
      FROM public.gym_class_bookings
      WHERE class_id = NEW.class_id
        AND status = 'waitlisted'
      ORDER BY waitlist_position ASC
      LIMIT 1;
      
      -- If found, promote them
      IF next_waitlist_booking.id IS NOT NULL THEN
        UPDATE public.gym_class_bookings
        SET status = 'confirmed',
            waitlist_position = NULL,
            updated_at = now()
        WHERE id = next_waitlist_booking.id;
        
        -- Decrement waitlist positions for others
        UPDATE public.gym_class_bookings
        SET waitlist_position = waitlist_position - 1,
            updated_at = now()
        WHERE class_id = NEW.class_id
          AND status = 'waitlisted'
          AND waitlist_position > next_waitlist_booking.waitlist_position;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for waitlist promotion
DROP TRIGGER IF EXISTS trigger_promote_waitlist ON public.gym_class_bookings;
CREATE TRIGGER trigger_promote_waitlist
  AFTER UPDATE ON public.gym_class_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.promote_waitlist_on_cancellation();

-- 1.3 Class Credits: Create credit transactions table
CREATE TABLE IF NOT EXISTS public.gym_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gym_profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for additions, negative for deductions
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'booking', 'cancellation_refund', 'manual_adjustment', 'expiry', 'bonus')),
  reference_id UUID, -- booking_id or payment_id
  reference_type TEXT, -- 'booking', 'payment', 'admin'
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for credit transactions
CREATE INDEX IF NOT EXISTS idx_gym_credit_transactions_member ON public.gym_credit_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_gym_credit_transactions_gym ON public.gym_credit_transactions(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_credit_transactions_created ON public.gym_credit_transactions(created_at DESC);

-- Enable RLS on credit transactions
ALTER TABLE public.gym_credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for credit transactions
CREATE POLICY "Members can view their own credit transactions"
  ON public.gym_credit_transactions
  FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM public.gym_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all gym credit transactions"
  ON public.gym_credit_transactions
  FOR SELECT
  USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can insert credit transactions"
  ON public.gym_credit_transactions
  FOR INSERT
  WITH CHECK (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
    )
  );

-- 1.4 Failed Payment Handling: Add payment status tracking columns
ALTER TABLE public.gym_payments
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS failure_reason TEXT,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

-- Add index for failed payments
CREATE INDEX IF NOT EXISTS idx_gym_payments_status ON public.gym_payments(status) WHERE status IN ('failed', 'pending');

-- Add cancellation window to class types
ALTER TABLE public.gym_class_types
ADD COLUMN IF NOT EXISTS cancellation_window_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS late_cancel_credits INTEGER DEFAULT 0;

-- Add credits_used to bookings to track credit deduction
ALTER TABLE public.gym_class_bookings
ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0;