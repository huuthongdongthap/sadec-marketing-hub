-- ================================================
-- MEKONG AGENCY - SUPABASE DATABASE SCHEMA
-- Marketing Agency Web App
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TENANTS (Multi-tenant support for Mekong region)
-- ================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  region TEXT DEFAULT 'mekong',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#006A60',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default tenant (Sa Đéc - Case Study)
INSERT INTO tenants (name, slug, region) VALUES 
  ('Mekong Agency', 'mekong-agency', 'mekong'),
  ('Sa Đéc Marketing Hub', 'sadec-hub', 'dong-thap');

-- ================================================
-- USERS
-- ================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'staff', 'client')) DEFAULT 'client',
  phone TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- LEADS
-- ================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  source TEXT CHECK (source IN ('facebook', 'google', 'zalo', 'website', 'referral', 'other')),
  status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')) DEFAULT 'new',
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  temperature TEXT CHECK (temperature IN ('hot', 'warm', 'cold')) DEFAULT 'cold',
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- CLIENTS
-- ================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES users(id),
  lead_id UUID REFERENCES leads(id),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  industry TEXT,
  website TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'churned')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- PROJECTS
-- ================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('ads', 'seo', 'social', 'design', 'web', 'consulting', 'other')),
  status TEXT CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'planning',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  budget DECIMAL(15,2),
  spent DECIMAL(15,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- CAMPAIGNS
-- ================================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id) NOT NULL,
  name TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('facebook', 'google', 'zalo', 'tiktok', 'instagram', 'youtube', 'other')),
  type TEXT CHECK (type IN ('awareness', 'traffic', 'engagement', 'leads', 'conversions', 'sales')),
  status TEXT CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed')) DEFAULT 'draft',
  budget DECIMAL(15,2),
  spent DECIMAL(15,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  target_audience JSONB,
  metrics JSONB DEFAULT '{"impressions": 0, "clicks": 0, "leads": 0, "conversions": 0, "roi": 0}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- INVOICES
-- ================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  invoice_number TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  tax DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  items JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- ACTIVITIES (Activity Log)
-- ================================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tenant's data
CREATE POLICY "Users can view own tenant data" ON users
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Tenant isolation for leads" ON leads
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Tenant isolation for clients" ON clients
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Tenant isolation for projects" ON projects
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Tenant isolation for campaigns" ON campaigns
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Tenant isolation for invoices" ON invoices
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Tenant isolation for activities" ON activities
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- Clients can only see their own projects and invoices
CREATE POLICY "Clients can view own projects" ON projects
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can view own invoices" ON invoices
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_leads_tenant ON leads(tenant_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_activities_tenant ON activities(tenant_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number = 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_seq')::text, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

CREATE TRIGGER generate_invoice_number_trigger
BEFORE INSERT ON invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL)
EXECUTE FUNCTION generate_invoice_number();
