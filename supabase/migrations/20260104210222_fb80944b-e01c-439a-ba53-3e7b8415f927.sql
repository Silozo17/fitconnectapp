-- Update the Multi-Device badge to require only 1 device connection
UPDATE badges 
SET 
  name = 'Device Synced',
  description = 'Connect a health app to sync your fitness data',
  criteria = '{"type": "device_connected", "value": 1}'::jsonb
WHERE id = 'd4815dc1-3af6-43d7-a4e5-8bd412ccd146';