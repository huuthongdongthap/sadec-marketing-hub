-- ================================================
-- ERP UPDATE MIGRATION - Phase 1-3
-- Run this to add new tables to existing database
-- ================================================

-- DEALS (Sales Pipeline)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  lead_id UUID REFERENCES leads(id),
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  value DECIMAL(15,2) DEFAULT 0,
  stage TEXT CHECK (stage IN ('discovery', 'proposal', 'negotiation', 'won', 'lost')) DEFAULT 'discovery',
  probability INTEGER DEFAULT 20 CHECK (probability >= 0 AND probability <= 100),
  expected_close DATE,
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  won_at TIMESTAMPTZ,
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CONTENT CALENDAR (Marketing)
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  platform TEXT CHECK (platform IN ('facebook', 'zalo', 'tiktok', 'instagram', 'website', 'youtube')),
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'archived')) DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  media_urls JSONB,
  hashtags TEXT[],
  metrics JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "views": 0}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- BUDGET TRACKING (Finance)
CREATE TABLE IF NOT EXISTS budget_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  category TEXT NOT NULL,
  period TEXT NOT NULL,
  allocated DECIMAL(15,2) DEFAULT 0,
  spent DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, category, period)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tenant isolation for deals" ON deals
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for content_calendar" ON content_calendar
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Tenant isolation for budget_tracking" ON budget_tracking
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can see own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deals_tenant ON deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_content_calendar_tenant ON content_calendar(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled ON content_calendar(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_budget_tracking_period ON budget_tracking(period);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Triggers
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON content_calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_budget_tracking_updated_at BEFORE UPDATE ON budget_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Demo data for deals
INSERT INTO deals (tenant_id, name, value, stage, probability, expected_close, notes)
SELECT 
  t.id,
  d.name,
  d.value,
  d.stage::text,
  d.probability,
  d.expected_close::date,
  d.notes
FROM tenants t
CROSS JOIN (VALUES
  ('Website redesign cho Spa Center', 25000000, 'proposal', 60, '2026-01-25', 'Đã gửi proposal, chờ feedback'),
  ('Chiến dịch Tết 2026 - Riverside Hotel', 50000000, 'negotiation', 75, '2026-01-20', 'Đang thương lượng giá'),
  ('SEO Package cho ABC Corp', 10000000, 'discovery', 30, '2026-02-15', 'Mới contact, cần demo'),
  ('Social Media Management - XYZ Fashion', 8000000, 'won', 100, '2026-01-10', 'Đã ký hợp đồng 6 tháng'),
  ('Google Ads cho Gym Fitness', 15000000, 'proposal', 50, '2026-01-30', 'Đã gửi 2 options')
) AS d(name, value, stage, probability, expected_close, notes)
WHERE t.slug = 'sadec-hub';

SELECT 'Migration complete!' as status,
  (SELECT count(*) FROM deals) as deals,
  (SELECT count(*) FROM content_calendar) as content,
  (SELECT count(*) FROM budget_tracking) as budgets,
  (SELECT count(*) FROM notifications) as notifications;
