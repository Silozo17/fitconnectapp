-- Add exclusive reward columns to challenges table
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS avatar_reward_id UUID REFERENCES avatars(id);
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS reward_type TEXT; -- 'badge', 'avatar', or null

-- Add challenge exclusivity columns to avatars table
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS is_challenge_exclusive BOOLEAN DEFAULT false;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES challenges(id);

-- Add challenge exclusivity columns to badges table  
ALTER TABLE badges ADD COLUMN IF NOT EXISTS is_challenge_exclusive BOOLEAN DEFAULT false;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES challenges(id);

-- Create function to award challenge rewards on completion
CREATE OR REPLACE FUNCTION public.award_challenge_reward()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_challenge RECORD;
  v_reward_id UUID;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get challenge details
    SELECT * INTO v_challenge FROM challenges WHERE id = NEW.challenge_id;
    
    IF v_challenge IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Award avatar reward if exists
    IF v_challenge.avatar_reward_id IS NOT NULL THEN
      INSERT INTO user_avatars (user_id, avatar_id, unlock_source)
      SELECT cp.user_id, v_challenge.avatar_reward_id, 'challenge_reward'
      FROM client_profiles cp
      WHERE cp.id = NEW.client_id
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Award badge reward if exists
    IF v_challenge.badge_reward_id IS NOT NULL THEN
      INSERT INTO client_badges (client_id, badge_id, source_data)
      VALUES (NEW.client_id, v_challenge.badge_reward_id, jsonb_build_object('challenge_id', NEW.challenge_id))
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for awarding rewards
DROP TRIGGER IF EXISTS trigger_award_challenge_reward ON challenge_participants;
CREATE TRIGGER trigger_award_challenge_reward
  AFTER UPDATE ON challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION award_challenge_reward();