-- Add metadata column to messages table for interactive Quick Send offers
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

-- Add comment explaining the purpose
COMMENT ON COLUMN public.messages.metadata IS 'Stores structured data for interactive messages like Quick Send offers (packages, subscriptions, digital products, plans)';

-- Create an index for querying by metadata type
CREATE INDEX IF NOT EXISTS idx_messages_metadata_type ON public.messages ((metadata->>'type'));

-- Create an index for querying by status
CREATE INDEX IF NOT EXISTS idx_messages_metadata_status ON public.messages ((metadata->>'status'));