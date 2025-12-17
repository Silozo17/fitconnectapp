-- Add CalDAV support to calendar_connections
ALTER TABLE calendar_connections 
ADD COLUMN IF NOT EXISTS connection_type TEXT DEFAULT 'oauth';

-- Add constraint for connection_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'calendar_connection_type_check'
  ) THEN
    ALTER TABLE calendar_connections 
    ADD CONSTRAINT calendar_connection_type_check 
    CHECK (connection_type IN ('oauth', 'caldav'));
  END IF;
END $$;

-- Add caldav_server_url for custom CalDAV servers
ALTER TABLE calendar_connections 
ADD COLUMN IF NOT EXISTS caldav_server_url TEXT;

-- Update calendar_provider enum to include apple_calendar if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'apple_calendar' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'calendar_provider')
  ) THEN
    ALTER TYPE calendar_provider ADD VALUE IF NOT EXISTS 'apple_calendar';
  END IF;
END $$;