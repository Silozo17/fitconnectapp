-- Reset is_claimed to false for all existing badges so users can experience the claim flow
UPDATE client_badges SET is_claimed = false WHERE is_claimed = true;