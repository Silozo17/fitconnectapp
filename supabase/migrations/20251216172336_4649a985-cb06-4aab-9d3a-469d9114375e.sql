-- Enable REPLICA IDENTITY FULL for messages table to support UPDATE events in realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;