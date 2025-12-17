-- Create feedback table for user/coach feedback submissions
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'coach', 'admin')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('bug', 'feature', 'improvement', 'general')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'planned', 'rejected', 'completed')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can create their own feedback
CREATE POLICY "Users can create own feedback" ON public.feedback
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback" ON public.feedback
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager', 'staff')));

-- Admins can update feedback status
CREATE POLICY "Admins can update feedback" ON public.feedback
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')));

-- Create trigger function to notify users when feedback status changes
CREATE OR REPLACE FUNCTION public.notify_feedback_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_message TEXT;
  status_title TEXT;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    CASE NEW.status
      WHEN 'planned' THEN 
        status_title := 'Feedback Planned';
        status_message := 'Your feedback "' || NEW.subject || '" has been marked as planned for implementation.';
      WHEN 'completed' THEN 
        status_title := 'Feedback Completed';
        status_message := 'Great news! Your feedback "' || NEW.subject || '" has been completed.';
      WHEN 'rejected' THEN 
        status_title := 'Feedback Reviewed';
        status_message := 'Your feedback "' || NEW.subject || '" was reviewed but won''t be implemented at this time.';
      ELSE 
        status_title := 'Feedback Updated';
        status_message := 'Your feedback status has been updated.';
    END CASE;
    
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      'feedback_update',
      status_title,
      status_message,
      jsonb_build_object(
        'feedback_id', NEW.id::text, 
        'status', NEW.status, 
        'admin_notes', COALESCE(NEW.admin_notes, '')
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for status change notifications
CREATE TRIGGER on_feedback_status_change
  AFTER UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_feedback_status_change();

-- Create updated_at trigger
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();