-- ============================================================================
-- SUPABASE SCHEMA V3 - AUTH & REFERRAL SYSTEM
-- Mekong Marketing - Binh Pháp Aligned
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: UPDATE USER_PROFILES FOR NEW ROLES
-- ============================================================================

-- Add client and affiliate roles (if not exist via check constraint)
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS valid_role;

ALTER TABLE user_profiles ADD CONSTRAINT valid_role CHECK (
  role IN ('super_admin', 'manager', 'content_creator', 'client', 'affiliate')
);

-- ============================================================================
-- PART 2: AFFILIATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'partner', 'vip')),
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Percentage
  total_referrals INT DEFAULT 0,
  successful_referrals INT DEFAULT 0,
  total_commission DECIMAL(12,0) DEFAULT 0,
  pending_payout DECIMAL(12,0) DEFAULT 0,
  paid_out DECIMAL(12,0) DEFAULT 0,
  bank_name TEXT,
  bank_account TEXT,
  bank_holder TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_user ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_tier ON affiliates(tier);

-- ============================================================================
-- PART 3: REFERRALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  referred_name TEXT NOT NULL,
  referred_phone TEXT,
  referred_email TEXT,
  referred_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'paid', 'rejected')),
  deal_value DECIMAL(12,0) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  commission_amount DECIMAL(12,0) DEFAULT 0,
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created ON referrals(created_at DESC);

-- ============================================================================
-- PART 4: PROJECTS TABLE (Client Portal)
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  client_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  package TEXT DEFAULT 'standard' CHECK (package IN ('basic', 'standard', 'premium', 'custom')),
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  total_value DECIMAL(12,0) DEFAULT 0,
  paid_amount DECIMAL(12,0) DEFAULT 0,
  notes TEXT,
  deliverables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_user ON projects(client_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================================================
-- PART 5: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ========== AFFILIATES POLICIES ==========
-- Affiliates can read their own data
CREATE POLICY "Affiliates read own" ON affiliates
  FOR SELECT USING (user_id = auth.uid());

-- Managers can read all
CREATE POLICY "Managers read affiliates" ON affiliates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager'))
  );

-- Affiliates can update their own bank info
CREATE POLICY "Affiliates update own" ON affiliates
  FOR UPDATE USING (user_id = auth.uid());

-- ========== REFERRALS POLICIES ==========
-- Affiliates can read their own referrals
CREATE POLICY "Affiliates read own referrals" ON referrals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

-- Affiliates can insert their own referrals
CREATE POLICY "Affiliates insert referrals" ON referrals
  FOR INSERT WITH CHECK (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

-- Managers can do everything
CREATE POLICY "Managers manage referrals" ON referrals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager'))
  );

-- ========== PROJECTS POLICIES ==========
-- Clients can read their own projects
CREATE POLICY "Clients read own projects" ON projects
  FOR SELECT USING (client_user_id = auth.uid());

-- Managers can do everything
CREATE POLICY "Managers manage projects" ON projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager'))
  );

-- ============================================================================
-- PART 6: HELPER FUNCTIONS
-- ============================================================================

-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(name TEXT)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  name_part TEXT;
BEGIN
  name_part := UPPER(LEFT(REGEXP_REPLACE(name, '[^a-zA-Z]', '', 'g'), 3));
  IF LENGTH(name_part) < 3 THEN
    name_part := name_part || REPEAT('X', 3 - LENGTH(name_part));
  END IF;
  code := 'MK-' || name_part || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Calculate commission based on tier
CREATE OR REPLACE FUNCTION get_commission_rate(tier TEXT)
RETURNS DECIMAL AS $$
BEGIN
  CASE tier
    WHEN 'starter' THEN RETURN 10.00;
    WHEN 'partner' THEN RETURN 15.00;
    WHEN 'vip' THEN RETURN 20.00;
    ELSE RETURN 10.00;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Update affiliate tier based on successful referrals
CREATE OR REPLACE FUNCTION update_affiliate_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Update tier based on successful_referrals count
  UPDATE affiliates SET
    tier = CASE
      WHEN successful_referrals >= 16 THEN 'vip'
      WHEN successful_referrals >= 6 THEN 'partner'
      ELSE 'starter'
    END,
    commission_rate = CASE
      WHEN successful_referrals >= 16 THEN 20.00
      WHEN successful_referrals >= 6 THEN 15.00
      ELSE 10.00
    END,
    updated_at = NOW()
  WHERE id = NEW.affiliate_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_referral_converted
  AFTER UPDATE OF status ON referrals
  FOR EACH ROW
  WHEN (NEW.status = 'converted' AND OLD.status != 'converted')
  EXECUTE FUNCTION update_affiliate_tier();

-- Auto-create affiliate record when user signs up as affiliate
CREATE OR REPLACE FUNCTION handle_new_affiliate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'affiliate' THEN
    INSERT INTO affiliates (user_id, referral_code)
    VALUES (NEW.id, generate_referral_code(COALESCE(NEW.full_name, NEW.email)))
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_affiliate
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  WHEN (NEW.role = 'affiliate')
  EXECUTE FUNCTION handle_new_affiliate();

-- ============================================================================
-- PART 7: SAMPLE DATA
-- ============================================================================

-- Sample affiliates (run after creating users)
-- INSERT INTO affiliates (user_id, referral_code, tier, total_referrals, successful_referrals, total_commission)
-- VALUES 
-- ('user-uuid-here', 'MK-ANH1234', 'partner', 8, 6, 4500000),
-- ('user-uuid-here', 'MK-CHI5678', 'starter', 3, 2, 1500000);

-- ============================================================================
-- DONE! 🎉
-- ============================================================================
