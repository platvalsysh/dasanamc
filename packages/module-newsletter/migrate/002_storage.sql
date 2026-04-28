-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('module-newsletter', 'module-newsletter', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for public access (read)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'module-newsletter' );

-- Set up storage policy for authenticated upload (insert)
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'module-newsletter' );

-- Set up storage policy for authenticated delete
CREATE POLICY "Authenticated Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id = 'module-newsletter' );
