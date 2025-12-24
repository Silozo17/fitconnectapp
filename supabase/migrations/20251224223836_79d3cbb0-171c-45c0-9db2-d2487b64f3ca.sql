-- Add updated_at column to health_data_sync for debugging sync issues
ALTER TABLE health_data_sync 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_health_data_sync_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS health_data_sync_updated_at_trigger ON health_data_sync;

CREATE TRIGGER health_data_sync_updated_at_trigger
BEFORE UPDATE ON health_data_sync
FOR EACH ROW
EXECUTE FUNCTION update_health_data_sync_updated_at();