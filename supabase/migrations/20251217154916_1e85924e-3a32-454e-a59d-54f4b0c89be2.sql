-- Enable full replica identity for complete row data in realtime events
ALTER TABLE user_connections REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_connections;