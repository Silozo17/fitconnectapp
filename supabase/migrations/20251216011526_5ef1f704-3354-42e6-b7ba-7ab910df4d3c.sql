-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT messages_sender_receiver_different CHECK (sender_id != receiver_id)
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM client_profiles WHERE id = sender_id
    UNION
    SELECT user_id FROM client_profiles WHERE id = receiver_id
    UNION
    SELECT user_id FROM coach_profiles WHERE id = sender_id
    UNION
    SELECT user_id FROM coach_profiles WHERE id = receiver_id
  )
);

-- Users can send messages (insert)
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM client_profiles WHERE id = sender_id
    UNION
    SELECT user_id FROM coach_profiles WHERE id = sender_id
  )
);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can mark received messages as read"
ON public.messages
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM client_profiles WHERE id = receiver_id
    UNION
    SELECT user_id FROM coach_profiles WHERE id = receiver_id
  )
);

-- Create index for faster queries
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;