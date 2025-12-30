-- ============================================================================
-- SUPABASE SCHEMA V2 - SA ĐÉC MARKETING HUB
-- Full Professional Edition with Authentication & Roles
-- Chạy trong Supabase Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: NEW TABLES FOR ADMIN DASHBOARD
-- ============================================================================

-- 1. CUSTOMERS TABLE (CRM - Quản lý khách hàng tiềm năng)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  business_name TEXT,
  source TEXT DEFAULT 'website', 
  -- Options: 'facebook', 'zalo', 'website', 'google_maps', 'referral'
  status TEXT DEFAULT 'new',
  -- Options: 'new', 'hot', 'warm', 'closed', 'lost'
  notes TEXT,
  avatar_emoji TEXT DEFAULT '👤',
  assigned_to UUID REFERENCES auth.users(id),
  value DECIMAL(12,0) DEFAULT 0, -- Giá trị ước tính (VNĐ)
  last_contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCHEDULED_POSTS TABLE (Lịch đăng bài content)
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  media_urls JSONB DEFAULT '[]', -- Array of image/video URLs
  platform TEXT NOT NULL DEFAULT 'facebook',
  -- Options: 'facebook', 'zalo', 'tiktok', 'instagram'
  status TEXT DEFAULT 'draft',
  -- Options: 'draft', 'scheduled', 'published', 'failed'
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  customer_id UUID REFERENCES customers(id), -- Nếu content cho khách hàng cụ thể
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER_PROFILES TABLE (Extending Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'content_creator',
  -- Roles: 'super_admin', 'manager', 'content_creator', 'customer'
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVITY_LOG TABLE (Audit trail)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type TEXT, -- 'customer', 'post', 'contact'
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: INDEXES (Performance Optimization)
-- ============================================================================

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_source ON customers(source);
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_assigned ON customers(assigned_to);

-- Scheduled Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON scheduled_posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_created_by ON scheduled_posts(created_by);

-- User Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON user_profiles(is_active);

-- Activity Log indexes
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- ============================================================================
-- PART 3: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ========== CUSTOMERS POLICIES ==========
-- Authenticated users can read all customers
CREATE POLICY "Authenticated read customers" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Managers and admins can insert customers
CREATE POLICY "Managers insert customers" ON customers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'manager')
    )
  );

-- Managers and admins can update customers
CREATE POLICY "Managers update customers" ON customers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'manager')
    )
  );

-- Only admins can delete customers
CREATE POLICY "Admins delete customers" ON customers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- ========== SCHEDULED_POSTS POLICIES ==========
-- All authenticated can read posts
CREATE POLICY "Authenticated read posts" ON scheduled_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- All authenticated can create posts
CREATE POLICY "Authenticated create posts" ON scheduled_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Creators can only update their own, managers/admins all
CREATE POLICY "Update own or manager posts" ON scheduled_posts
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'manager')
    )
  );

-- Only managers and admins can delete
CREATE POLICY "Managers delete posts" ON scheduled_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'manager')
    )
  );

-- ========== USER_PROFILES POLICIES ==========
-- Users can read all profiles (for display names)
CREATE POLICY "Read all profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can update only their own profile
CREATE POLICY "Update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Only super_admin can insert new profiles
CREATE POLICY "Admin insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- ========== ACTIVITY_LOG POLICIES ==========
-- All authenticated can insert (for logging)
CREATE POLICY "Authenticated insert log" ON activity_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only admins can read logs
CREATE POLICY "Admins read log" ON activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- ============================================================================
-- PART 4: HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  role_levels JSONB := '{
    "super_admin": 100,
    "manager": 50,
    "content_creator": 20,
    "customer": 10
  }';
BEGIN
  SELECT role INTO user_role FROM user_profiles WHERE id = auth.uid();
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN (role_levels ->> user_role)::INT >= (role_levels ->> required_role)::INT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_old_data, p_new_data)
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 5: TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'content_creator')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- PART 6: SAMPLE DATA (Optional - First Admin User)
-- ============================================================================

-- Note: Run this AFTER creating your first user via Supabase Auth
-- UPDATE user_profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';

-- Sample customers for testing
INSERT INTO customers (name, phone, business_name, source, status, avatar_emoji, value) VALUES
('Chú Ba Bonsai', '0909 123 456', 'Bonsai Chú Ba', 'google_maps', 'closed', '🌳', 15000000),
('Chị Lan Bánh Tráng', '0987 654 321', 'Bánh Tráng Cô Lan', 'facebook', 'hot', '🍜', 8000000),
('Cô Bảy Tạp Hóa', '0912 345 678', 'Tạp Hóa Cô Bảy', 'zalo', 'warm', '🏪', 5000000),
('Anh Tư Quán Cà Phê', '0888 999 000', 'Coffee House 4T', 'website', 'new', '☕', 0),
('Chị Năm Hoa Kiểng', '0777 888 999', 'Hoa Kiểng Chị Năm', 'referral', 'hot', '🌸', 12000000)
ON CONFLICT DO NOTHING;

-- Sample scheduled posts
INSERT INTO scheduled_posts (title, content, platform, status, scheduled_at) VALUES
('🌸 Chào mùa xuân Sa Đéc!', 'Mùa xuân đến rồi! Ghé thăm Sa Đéc để chiêm ngưỡng vẻ đẹp của hoa...', 'facebook', 'published', NOW() - INTERVAL '2 days'),
('💰 Flash Sale cuối năm!', 'Giảm giá 30% tất cả dịch vụ marketing trong tháng 12...', 'zalo', 'scheduled', NOW() + INTERVAL '1 day'),
('🎄 Video Noel cùng Chú Ba', 'Cùng xem video đặc biệt mùa Giáng sinh...', 'tiktok', 'scheduled', NOW() + INTERVAL '2 days'),
('🎁 Chúc mừng Giáng Sinh', 'Gửi lời chúc tốt đẹp nhất đến quý khách hàng...', 'facebook', 'draft', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DONE! 🎉
-- ============================================================================
