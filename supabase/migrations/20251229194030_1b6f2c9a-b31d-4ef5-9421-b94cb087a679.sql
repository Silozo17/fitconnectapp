-- Add is_claimed to client_badges
ALTER TABLE client_badges 
ADD COLUMN is_claimed boolean DEFAULT false;

-- Mark all existing badges as claimed (they were auto-awarded)
UPDATE client_badges SET is_claimed = true WHERE earned_at IS NOT NULL;

-- Add reward_claimed to challenge_participants
ALTER TABLE challenge_participants 
ADD COLUMN reward_claimed boolean DEFAULT false;

-- Mark completed challenges as claimed
UPDATE challenge_participants 
SET reward_claimed = true 
WHERE status = 'completed';