-- Create schema
CREATE SCHEMA IF NOT EXISTS nutbolts;

-- Categories table
CREATE TABLE nutbolts.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subcategories table
CREATE TABLE nutbolts.subcategories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES nutbolts.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, category_id)
);

-- Product types table
CREATE TABLE nutbolts.product_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subcategory_id INTEGER NOT NULL REFERENCES nutbolts.subcategories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, subcategory_id)
);

-- Quote requests table
CREATE TABLE nutbolts.quote_requests (
  id SERIAL PRIMARY KEY,
  product_type_id INTEGER REFERENCES nutbolts.product_types(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  category_name TEXT NOT NULL,
  subcategory_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  specifications TEXT,
  contact_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_location TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'quoted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact messages table
CREATE TABLE nutbolts.contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_product_types_subcategory ON nutbolts.product_types(subcategory_id);
CREATE INDEX idx_subcategories_category ON nutbolts.subcategories(category_id);
CREATE INDEX idx_quote_requests_status ON nutbolts.quote_requests(status);
CREATE INDEX idx_quote_requests_created ON nutbolts.quote_requests(created_at DESC);
CREATE INDEX idx_contact_messages_status ON nutbolts.contact_messages(status);
