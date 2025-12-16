-- Add AI analysis columns to coach_verification_documents table
ALTER TABLE coach_verification_documents
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS ai_confidence_score NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS ai_flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_flagged_reasons TEXT[],
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;