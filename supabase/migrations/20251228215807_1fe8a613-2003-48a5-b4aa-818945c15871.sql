-- Update location for Henry Mote and Move with Menna
UPDATE coach_profiles 
SET 
  location = 'United Kingdom',
  location_country = 'United Kingdom',
  location_country_code = 'GB'
WHERE id IN (
  'dad3d68a-7062-4008-b71d-e7248d5178fc',
  '109cd2e1-7f4d-4a1f-a530-4ab55e9dabf0'
);