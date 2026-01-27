-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to call the scoring Edge Function
CREATE OR REPLACE FUNCTION public.trigger_lead_scoring()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url text := current_setting('app.settings.edge_function_url', true) || '/score-lead';
  service_role_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  -- If settings are not available (local dev), use defaults or skip
  IF edge_function_url IS NULL OR edge_function_url = '/score-lead' THEN
     edge_function_url := 'http://localhost:54321/functions/v1/score-lead'; -- Local Supabase default
  END IF;

  -- Call the Edge Function asynchronously
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_role_key, 'anon_key_placeholder')
    ),
    body := jsonb_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'phone', NEW.phone,
      'email', NEW.email,
      'company_name', NEW.company,
      'source', NEW.source,
      'message', NEW.notes,
      'created_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_lead_insert_score ON leads;
CREATE TRIGGER on_lead_insert_score
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_lead_scoring();

-- Add a comment explaining usage
COMMENT ON FUNCTION public.trigger_lead_scoring IS 'Triggers the lead scoring Edge Function on new lead insertion via pg_net';
-- ================================================
-- ZALO OA INTEGRATION (MOCK MODE)
-- ================================================

-- Create Zalo Users table (leads linked to Zalo)
CREATE TABLE zalo_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  zalo_user_id TEXT NOT NULL, -- Zalo ID (OpenID)
  display_name TEXT,
  avatar TEXT,
  phone TEXT,
  lead_id UUID REFERENCES leads(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, zalo_user_id)
);

-- Create Zalo Messages table
CREATE TABLE zalo_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  oa_id TEXT NOT NULL, -- Official Account ID (Mock: 'mock_oa_123')
  user_id UUID REFERENCES zalo_users(id), -- Null if from OA to user (broadcast)
  zalo_msg_id TEXT UNIQUE,
  content TEXT,
  attachments JSONB, -- Images, files
  event_name TEXT, -- user_send_text, oa_send_text, etc.
  timestamp BIGINT, -- Zalo timestamp
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'received',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE zalo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for zalo_users" ON zalo_users
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Tenant isolation for zalo_messages" ON zalo_messages
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- Mock Data for Zalo
INSERT INTO zalo_users (tenant_id, zalo_user_id, display_name, avatar, phone)
SELECT
  id as tenant_id,
  'zalo_user_001',
  'Nguyễn Văn A (Zalo)',
  'https://s120-ava-talk.zadn.vn/default',
  '0909123456'
FROM tenants WHERE slug = 'mekong-agency' LIMIT 1;

INSERT INTO zalo_messages (tenant_id, oa_id, user_id, content, direction, timestamp)
SELECT
  t.id,
  'mock_oa_123',
  u.id,
  'Xin chào, tôi muốn tìm hiểu về dịch vụ marketing',
  'inbound',
  extract(epoch from now()) * 1000
FROM tenants t
JOIN zalo_users u ON u.tenant_id = t.id
WHERE t.slug = 'mekong-agency' LIMIT 1;
-- ================================================
-- CLIENT SUCCESS REPORTS
-- ================================================

CREATE TABLE client_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  title TEXT NOT NULL,
  report_date DATE DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  metrics JSONB, -- { "impressions": 1000, "clicks": 50, "conversions": 10, "spend": 500000 }
  insights TEXT,
  recommendations TEXT,
  pdf_url TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'viewed')) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE client_reports ENABLE ROW LEVEL SECURITY;

-- Tenant isolation
CREATE POLICY "Tenant isolation for reports" ON client_reports
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- Clients can view their own reports
CREATE POLICY "Clients can view own reports" ON client_reports
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
    AND status = 'published'
  );

-- Indexes
CREATE INDEX idx_reports_tenant ON client_reports(tenant_id);
CREATE INDEX idx_reports_client ON client_reports(client_id);
CREATE INDEX idx_reports_date ON client_reports(report_date);
-- ================================================
-- LANDING PAGES (CMS)
-- ================================================

CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Content stored as JSON blocks or raw HTML
  content JSONB DEFAULT '[]', -- Array of blocks: { type: "hero", data: {...} }
  styles JSONB DEFAULT '{}', -- Custom colors, fonts

  -- Meta tags for SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_image TEXT,

  -- Publishing status
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,

  -- Analytics
  views INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- RLS
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

-- Tenant isolation
CREATE POLICY "Tenant isolation for landing_pages" ON landing_pages
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- Public access for published pages (for the renderer)
-- Note: In a real app, we might use a separate anonymous role or function
-- Here we allow public read if we use a service key or specific public API approach.
-- For standard RLS with anon key:
CREATE POLICY "Public can view published pages" ON landing_pages
  FOR SELECT USING (status = 'published');

-- Indexes
CREATE INDEX idx_lp_tenant ON landing_pages(tenant_id);
CREATE INDEX idx_lp_slug ON landing_pages(slug);
CREATE INDEX idx_lp_status ON landing_pages(status);
