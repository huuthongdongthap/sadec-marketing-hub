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
