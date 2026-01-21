-- Function to auto-update coach verification status on document upload
CREATE OR REPLACE FUNCTION public.auto_set_verification_pending()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if current status is 'not_submitted'
  UPDATE coach_profiles
  SET verification_status = 'pending',
      updated_at = now()
  WHERE id = NEW.coach_id
    AND verification_status = 'not_submitted';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on document insert
DROP TRIGGER IF EXISTS on_document_upload_set_pending ON coach_verification_documents;
CREATE TRIGGER on_document_upload_set_pending
  AFTER INSERT ON coach_verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_verification_pending();

-- Fix existing coach with orphaned pending documents
UPDATE coach_profiles
SET verification_status = 'pending',
    updated_at = now()
WHERE id IN (
  SELECT DISTINCT coach_id 
  FROM coach_verification_documents 
  WHERE status = 'pending'
)
AND verification_status = 'not_submitted';