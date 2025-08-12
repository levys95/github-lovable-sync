-- Storage policies for bucket "inventory-images"
-- Create policies only if they don't already exist

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read for inventory-images'
  ) THEN
    CREATE POLICY "Public read for inventory-images"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'inventory-images'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated upload to inventory-images'
  ) THEN
    CREATE POLICY "Authenticated upload to inventory-images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'inventory-images'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated update own inventory-images'
  ) THEN
    CREATE POLICY "Authenticated update own inventory-images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'inventory-images' AND owner = auth.uid()
    )
    WITH CHECK (
      bucket_id = 'inventory-images' AND owner = auth.uid()
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated delete own inventory-images'
  ) THEN
    CREATE POLICY "Authenticated delete own inventory-images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'inventory-images' AND owner = auth.uid()
    );
  END IF;
END $$;