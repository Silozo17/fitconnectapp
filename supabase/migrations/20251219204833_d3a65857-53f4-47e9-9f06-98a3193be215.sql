-- Backfill missing message from Jakub's connection request to Admin coach
INSERT INTO messages (sender_id, receiver_id, content, created_at)
SELECT 
  client_id,
  coach_id,
  COALESCE(message, 'Hi, I''d like to connect with you for coaching.'),
  created_at
FROM connection_requests
WHERE id = '95cd60ee-5887-4df5-a38d-dab568b840ad'
ON CONFLICT DO NOTHING;

-- Backfill missing lead for Jakub in Admin's pipeline
INSERT INTO coach_leads (coach_id, client_id, source, stage, created_at)
SELECT 
  coach_id,
  client_id,
  'marketplace_request',
  'new_lead',
  created_at
FROM connection_requests
WHERE id = '95cd60ee-5887-4df5-a38d-dab568b840ad'
ON CONFLICT (coach_id, client_id) DO NOTHING;