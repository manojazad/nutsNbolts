-- ============================================================
-- Storage policies for category and products image buckets
-- ============================================================

-- Ensure buckets exist (idempotent via INSERT ... ON CONFLICT)
INSERT INTO storage.buckets (id, name, public)
VALUES ('category', 'category', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read for both buckets
CREATE POLICY "Public read category images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category');

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Authenticated users can upload/update/delete in category bucket
CREATE POLICY "Admin upload category images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'category' AND auth.role() = 'authenticated');

CREATE POLICY "Admin update category images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'category' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete category images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'category' AND auth.role() = 'authenticated');

-- Authenticated users can upload/update/delete in products bucket
CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');
