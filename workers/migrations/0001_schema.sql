-- D1 Database Schema — Sa Đéc Marketing Hub
-- Replaces Supabase Postgres tables for business data
-- Auth tables remain in Supabase (auth.users)
-- Run: wrangler d1 execute sadec-db --file=migrations/0001_schema.sql

-- ── Contacts (từ supabase-config.js .from('contacts')) ──────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  company TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new',  -- new | contacted | qualified | closed
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Customers (từ supabase-config.js .from('customers')) ─────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  supabase_user_id TEXT UNIQUE,  -- Links to Supabase Auth user
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  role TEXT DEFAULT 'client',
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Testimonials ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  customer_id TEXT REFERENCES customers(id),
  author TEXT NOT NULL,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  visible INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Services ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price REAL,
  category TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Blog Posts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author TEXT,
  published INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Invoices ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | paid | cancelled | overdue
  due_date TEXT,
  paid_at TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Payment Transactions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  invoice_id TEXT REFERENCES invoices(id),
  amount REAL NOT NULL,
  gateway TEXT NOT NULL,  -- vnpay | momo | payos
  status TEXT DEFAULT 'pending',  -- pending | completed | failed | cancelled
  transaction_id TEXT UNIQUE NOT NULL,
  gateway_transaction_no TEXT,
  callback_data TEXT DEFAULT '{}',  -- JSON string
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Analytics Events ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_name TEXT NOT NULL,
  page_url TEXT,
  properties TEXT DEFAULT '{}',  -- JSON string
  user_id TEXT,  -- Supabase user ID (nullable for anonymous)
  ip_address TEXT,
  user_agent TEXT,
  country TEXT DEFAULT 'VN',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- ── Leads ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  contact_id TEXT REFERENCES contacts(id),
  score INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'cold',  -- cold | warm | hot
  status TEXT DEFAULT 'new',
  assigned_to TEXT,  -- Supabase user ID of assigned staff
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Assets (R2 file metadata) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  client_id TEXT REFERENCES customers(id),
  r2_key TEXT UNIQUE NOT NULL,  -- Key in R2 bucket
  filename TEXT NOT NULL,
  content_type TEXT,
  size INTEGER,
  category TEXT DEFAULT 'general',
  created_at TEXT DEFAULT (datetime('now'))
);
