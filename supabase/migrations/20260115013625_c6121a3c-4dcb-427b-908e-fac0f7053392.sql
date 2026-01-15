-- Create a trigger to auto-promote waitlisted members when a spot opens
CREATE OR REPLACE FUNCTION public.promote_waitlist_on_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  next_waitlisted RECORD;
  class_capacity INTEGER;
  current_confirmed INTEGER;
BEGIN
  -- Only trigger when a booking is cancelled
  IF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
    -- Get the class capacity
    SELECT capacity INTO class_capacity
    FROM gym_classes
    WHERE id = OLD.class_id;
    
    -- Count current confirmed bookings
    SELECT COUNT(*) INTO current_confirmed
    FROM gym_class_bookings
    WHERE class_id = OLD.class_id AND status = 'confirmed';
    
    -- If there's now space and someone is waitlisted, promote them
    IF current_confirmed < class_capacity THEN
      -- Get the first waitlisted person (by booking time)
      SELECT * INTO next_waitlisted
      FROM gym_class_bookings
      WHERE class_id = OLD.class_id AND status = 'waitlisted'
      ORDER BY booked_at ASC
      LIMIT 1;
      
      IF FOUND THEN
        -- Promote them to confirmed
        UPDATE gym_class_bookings
        SET status = 'confirmed'
        WHERE id = next_waitlisted.id;
        
        -- Create a notification for the member
        INSERT INTO gym_staff_notifications (gym_id, notification_type, title, message, severity, metadata)
        SELECT 
          gc.gym_id,
          'waitlist_promotion',
          'Waitlist Promotion',
          'A member has been promoted from the waitlist for class: ' || gct.name,
          'info',
          jsonb_build_object(
            'class_id', OLD.class_id,
            'member_id', next_waitlisted.member_id,
            'booking_id', next_waitlisted.id
          )
        FROM gym_classes gc
        JOIN gym_class_types gct ON gc.class_type_id = gct.id
        WHERE gc.id = OLD.class_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_promote_waitlist ON gym_class_bookings;
CREATE TRIGGER trigger_promote_waitlist
  AFTER UPDATE ON gym_class_bookings
  FOR EACH ROW
  EXECUTE FUNCTION promote_waitlist_on_cancellation();