-- Drop existing messages RLS policies to recreate with admin support
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Create updated messages SELECT policy with admin support
CREATE POLICY "Users can view their own messages" 
ON messages FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM client_profiles WHERE id = messages.sender_id
    UNION
    SELECT user_id FROM client_profiles WHERE id = messages.receiver_id
    UNION
    SELECT user_id FROM coach_profiles WHERE id = messages.sender_id
    UNION
    SELECT user_id FROM coach_profiles WHERE id = messages.receiver_id
    UNION
    SELECT user_id FROM admin_profiles WHERE id = messages.sender_id
    UNION
    SELECT user_id FROM admin_profiles WHERE id = messages.receiver_id
  )
);

-- Create updated messages INSERT policy with admin support
CREATE POLICY "Users can send messages" 
ON messages FOR INSERT
WITH CHECK (
  sender_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
    UNION
    SELECT id FROM coach_profiles WHERE user_id = auth.uid()
    UNION
    SELECT id FROM admin_profiles WHERE user_id = auth.uid()
  )
);

-- Create updated messages UPDATE policy with admin support (for read receipts)
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update received messages" 
ON messages FOR UPDATE
USING (
  receiver_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
    UNION
    SELECT id FROM coach_profiles WHERE user_id = auth.uid()
    UNION
    SELECT id FROM admin_profiles WHERE user_id = auth.uid()
  )
);

-- Allow coaches to view basic client profiles if they have exchanged messages
CREATE POLICY "Coaches can view client profiles from messages" 
ON client_profiles FOR SELECT
USING (
  id IN (
    SELECT DISTINCT m.sender_id FROM messages m
    WHERE m.receiver_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid())
    UNION
    SELECT DISTINCT m.receiver_id FROM messages m
    WHERE m.sender_id IN (SELECT id FROM coach_profiles WHERE user_id = auth.uid())
  )
);

-- Allow clients to view coach profiles they've messaged (supplement existing public policy)
CREATE POLICY "Clients can view coach profiles from messages" 
ON coach_profiles FOR SELECT
USING (
  id IN (
    SELECT DISTINCT m.sender_id FROM messages m
    WHERE m.receiver_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
    UNION
    SELECT DISTINCT m.receiver_id FROM messages m
    WHERE m.sender_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  )
);

-- Allow admins to view all profiles for messaging
CREATE POLICY "Admins can view client profiles" 
ON client_profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));