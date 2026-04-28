-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('module-sponsors', 'module-sponsors', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for Public Read access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Give public read access to module-sponsors'
    ) THEN
        CREATE POLICY "Give public read access to module-sponsors"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'module-sponsors' );
    END IF;
END
$$;

-- Policy for Authenticated Upload access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Give auth insert access to module-sponsors'
    ) THEN
        CREATE POLICY "Give auth insert access to module-sponsors"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'module-sponsors' );
    END IF;
END
$$;
