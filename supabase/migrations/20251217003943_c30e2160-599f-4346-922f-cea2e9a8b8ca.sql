-- Create storage bucket for documentation screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('doc-screenshots', 'doc-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view doc screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'doc-screenshots');

-- Allow authenticated users to upload (for admin generation)
CREATE POLICY "Authenticated users can upload doc screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'doc-screenshots' AND auth.role() = 'authenticated');