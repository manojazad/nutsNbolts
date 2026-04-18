-- Grant usage on the nutbolts schema to anon and authenticated roles
GRANT USAGE ON SCHEMA nutbolts TO anon;
GRANT USAGE ON SCHEMA nutbolts TO authenticated;

-- Grant SELECT on catalog tables to anon (public read)
GRANT SELECT ON nutbolts.categories TO anon;
GRANT SELECT ON nutbolts.subcategories TO anon;
GRANT SELECT ON nutbolts.product_types TO anon;

-- Grant INSERT on quote_requests and contact_messages to anon (public submit)
GRANT INSERT ON nutbolts.quote_requests TO anon;
GRANT INSERT ON nutbolts.contact_messages TO anon;

-- Grant usage on sequences for inserts
GRANT USAGE ON ALL SEQUENCES IN SCHEMA nutbolts TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA nutbolts TO authenticated;

-- Grant full access on all tables to authenticated (admin)
GRANT ALL ON ALL TABLES IN SCHEMA nutbolts TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA nutbolts TO authenticated;
