-- Fix function search path for promote_waitlist_on_cancellation
CREATE OR REPLACE FUNCTION public.promote_waitlist_on_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  next_waitlist_booking RECORD;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status IN ('confirmed', 'waitlisted') THEN
    IF OLD.status = 'confirmed' THEN
      SELECT * INTO next_waitlist_booking
      FROM public.gym_class_bookings
      WHERE class_id = NEW.class_id
        AND status = 'waitlisted'
      ORDER BY waitlist_position ASC
      LIMIT 1;
      
      IF next_waitlist_booking.id IS NOT NULL THEN
        UPDATE public.gym_class_bookings
        SET status = 'confirmed',
            waitlist_position = NULL,
            updated_at = now()
        WHERE id = next_waitlist_booking.id;
        
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;