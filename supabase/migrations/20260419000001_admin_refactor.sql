-- ============================================================
-- Migration: Admin refactor – soft delete, sort order, specs
-- ============================================================

-- 1. Add soft-delete and sort_order columns to existing tables
-- ------------------------------------------------------------

ALTER TABLE nutbolts.categories
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE nutbolts.subcategories
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE nutbolts.product_types
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sku TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Create product_specifications table
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS nutbolts.product_specifications (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES nutbolts.product_types(id) ON DELETE CASCADE,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('fixed_text', 'select_option', 'radio_button')),
  value_type TEXT NOT NULL CHECK (value_type IN ('text', 'number')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create product_specification_options table
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS nutbolts.product_specification_options (
  id SERIAL PRIMARY KEY,
  specification_id INTEGER NOT NULL REFERENCES nutbolts.product_specifications(id) ON DELETE CASCADE,
  heading TEXT NOT NULL,
  subheading TEXT DEFAULT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON nutbolts.categories(deleted_at);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON nutbolts.categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_subcategories_deleted_at ON nutbolts.subcategories(deleted_at);
CREATE INDEX IF NOT EXISTS idx_subcategories_sort_order ON nutbolts.subcategories(sort_order);
CREATE INDEX IF NOT EXISTS idx_product_types_deleted_at ON nutbolts.product_types(deleted_at);
CREATE INDEX IF NOT EXISTS idx_product_specifications_product ON nutbolts.product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_product_spec_options_spec ON nutbolts.product_specification_options(specification_id);

-- 5. RLS on new tables
-- ------------------------------------------------------------

ALTER TABLE nutbolts.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutbolts.product_specification_options ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read product_specifications"
  ON nutbolts.product_specifications FOR SELECT USING (true);

CREATE POLICY "Public read product_specification_options"
  ON nutbolts.product_specification_options FOR SELECT USING (true);

-- Admin full CRUD
CREATE POLICY "Admin insert product_specifications"
  ON nutbolts.product_specifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update product_specifications"
  ON nutbolts.product_specifications FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete product_specifications"
  ON nutbolts.product_specifications FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert product_specification_options"
  ON nutbolts.product_specification_options FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update product_specification_options"
  ON nutbolts.product_specification_options FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete product_specification_options"
  ON nutbolts.product_specification_options FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Grant permissions on new tables
-- ------------------------------------------------------------

GRANT SELECT ON nutbolts.product_specifications TO anon;
GRANT SELECT ON nutbolts.product_specification_options TO anon;

GRANT ALL ON nutbolts.product_specifications TO authenticated;
GRANT ALL ON nutbolts.product_specification_options TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA nutbolts TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA nutbolts TO authenticated;

-- 7. Create storage bucket for images (if not exists)
-- Note: Supabase storage bucket creation is done via dashboard or API,
-- but we can ensure the policy allows uploads by authenticated users.
-- ------------------------------------------------------------

-- Initialize sort_order for existing rows based on id
UPDATE nutbolts.categories SET sort_order = id WHERE sort_order = 0 OR sort_order IS NULL;
UPDATE nutbolts.subcategories SET sort_order = id WHERE sort_order = 0 OR sort_order IS NULL;
