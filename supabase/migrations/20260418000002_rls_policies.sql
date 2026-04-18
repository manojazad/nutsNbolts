-- Enable RLS on all tables
ALTER TABLE nutbolts.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutbolts.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutbolts.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutbolts.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutbolts.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog tables (anon + authenticated)
CREATE POLICY "Public read categories" ON nutbolts.categories
  FOR SELECT USING (true);

CREATE POLICY "Public read subcategories" ON nutbolts.subcategories
  FOR SELECT USING (true);

CREATE POLICY "Public read product_types" ON nutbolts.product_types
  FOR SELECT USING (true);

-- Anyone can insert quote requests and contact messages
CREATE POLICY "Anyone can submit quotes" ON nutbolts.quote_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can submit contact" ON nutbolts.contact_messages
  FOR INSERT WITH CHECK (true);

-- Only authenticated users (admin) can read/update quotes and contacts
CREATE POLICY "Admin read quotes" ON nutbolts.quote_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update quotes" ON nutbolts.quote_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin read contacts" ON nutbolts.contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update contacts" ON nutbolts.contact_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users (admin) can manage catalog
CREATE POLICY "Admin insert categories" ON nutbolts.categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update categories" ON nutbolts.categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete categories" ON nutbolts.categories
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert subcategories" ON nutbolts.subcategories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update subcategories" ON nutbolts.subcategories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete subcategories" ON nutbolts.subcategories
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert product_types" ON nutbolts.product_types
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update product_types" ON nutbolts.product_types
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete product_types" ON nutbolts.product_types
  FOR DELETE USING (auth.role() = 'authenticated');
