-- Notify coach when their document is AI-analyzed
CREATE OR REPLACE FUNCTION public.notify_coach_document_analyzed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_coach_user_id UUID;
  v_notification_type TEXT;
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Only trigger when AI analysis is completed (ai_analyzed_at changes from NULL)
  IF NEW.ai_analyzed_at IS NOT NULL AND (OLD.ai_analyzed_at IS NULL OR OLD.ai_analyzed_at IS DISTINCT FROM NEW.ai_analyzed_at) THEN
    -- Get coach user_id
    SELECT user_id INTO v_coach_user_id 
    FROM coach_profiles WHERE id = NEW.coach_id;
    
    IF v_coach_user_id IS NOT NULL THEN
      -- Determine notification based on AI result
      IF NEW.ai_flagged = true THEN
        v_notification_type := 'document_flagged';
        v_title := 'Document Needs Review';
        v_message := 'Your ' || NEW.document_type || ' document was flagged for manual review: ' || 
                     COALESCE(NEW.ai_flagged_reasons[1], 'See details for more information');
      ELSIF NEW.ai_confidence_score >= 80 THEN
        v_notification_type := 'document_verified';
        v_title := 'Document Check Passed';
        v_message := 'Your ' || NEW.document_type || ' document passed AI verification with ' || 
                     COALESCE(NEW.ai_confidence_score::text, '0') || '% confidence.';
      ELSE
        v_notification_type := 'document_review';
        v_title := 'Document Under Review';
        v_message := 'Your ' || NEW.document_type || ' document requires admin review (AI confidence: ' || 
                     COALESCE(NEW.ai_confidence_score::text, '0') || '%).';
      END IF;
      
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        v_coach_user_id,
        v_notification_type,
        v_title,
        v_message,
        jsonb_build_object(
          'document_id', NEW.id,
          'document_type', NEW.document_type,
          'confidence_score', NEW.ai_confidence_score,
          'flagged', COALESCE(NEW.ai_flagged, false),
          'recommendation', COALESCE((NEW.ai_analysis::jsonb)->>'recommendation', 'review')
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for document AI analysis notifications
DROP TRIGGER IF EXISTS on_document_ai_analyzed ON coach_verification_documents;
CREATE TRIGGER on_document_ai_analyzed
  AFTER UPDATE ON coach_verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_coach_document_analyzed();