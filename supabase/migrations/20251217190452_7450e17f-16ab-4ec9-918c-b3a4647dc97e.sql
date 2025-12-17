-- Make the coach-badges bucket public so images are accessible
UPDATE storage.buckets SET public = true WHERE id = 'coach-badges';