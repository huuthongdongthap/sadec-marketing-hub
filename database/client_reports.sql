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
