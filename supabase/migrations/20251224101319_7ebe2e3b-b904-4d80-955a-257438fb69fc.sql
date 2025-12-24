-- Add AI analysis status tracking columns to coach_verification_documents
ALTER TABLE public.coach_verification_documents 
ADD COLUMN IF NOT EXISTS ai_analysis_status text DEFAULT 'pending' 
CHECK (ai_analysis_status IN ('pending', 'analyzing', 'completed', 'failed'));

ALTER TABLE public.coach_verification_documents 
ADD COLUMN IF NOT EXISTS ai_analysis_error text;

-- Add comment for clarity
COMMENT ON COLUMN public.coach_verification_documents.ai_analysis_status IS 'Status of AI analysis: pending, analyzing, completed, failed';
COMMENT ON COLUMN public.coach_verification_documents.ai_analysis_error IS 'Error message if AI analysis failed';