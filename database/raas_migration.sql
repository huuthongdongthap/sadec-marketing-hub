-- ============================================================
-- RaaS Platform — Database Migration
-- Mekong Marketing Hub → Revenue-as-a-Service
-- 
-- Execute via Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Credit Accounts
CREATE TABLE IF NOT EXISTS raas_credits (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE raas_credits IS 'Credit balance per user for RaaS missions';

-- 2. Credit Transactions (Audit Trail)
CREATE TABLE IF NOT EXISTS raas_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,  -- positive = credit, negative = debit
  reason TEXT NOT NULL,
  reference_id TEXT,        -- mission_id or payment_id
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_raas_transactions_user ON raas_transactions(user_id, created_at DESC);

COMMENT ON TABLE raas_transactions IS 'Credit transaction history for billing audit';

-- 3. Missions
CREATE TABLE IF NOT EXISTS raas_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL,
  complexity TEXT NOT NULL DEFAULT 'standard' CHECK (complexity IN ('simple', 'standard', 'complex')),
  credits_cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'failed', 'cancelled')),
  result JSONB,
  error_message TEXT,
  gateway_mission_id TEXT,  -- ID from Mekong CLI Gateway
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_raas_missions_user ON raas_missions(user_id, created_at DESC);
CREATE INDEX idx_raas_missions_status ON raas_missions(status);

COMMENT ON TABLE raas_missions IS 'AI mission submissions and lifecycle tracking';

-- 4. Credit Packages (for pricing UI)
CREATE TABLE IF NOT EXISTS raas_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_vnd INTEGER NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  savings_pct INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default packages
INSERT INTO raas_packages (name, credits, price_vnd, savings_pct, is_popular) VALUES
  ('Starter', 10, 50000, 0, false),
  ('Growth', 30, 120000, 20, false),
  ('Pro', 50, 175000, 30, true),
  ('Enterprise', 100, 300000, 40, false)
ON CONFLICT DO NOTHING;

-- 5. Row Level Security
ALTER TABLE raas_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE raas_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE raas_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE raas_packages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users read own credits"
  ON raas_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own transactions"
  ON raas_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own missions"
  ON raas_missions FOR ALL
  USING (auth.uid() = user_id);

-- Packages are public read
CREATE POLICY "Anyone can read active packages"
  ON raas_packages FOR SELECT
  USING (active = true);

-- 6. Auto-update trigger for credits
CREATE OR REPLACE FUNCTION update_raas_credits_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_raas_credits_updated
  BEFORE UPDATE ON raas_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_raas_credits_timestamp();

-- 7. Welcome bonus function
CREATE OR REPLACE FUNCTION raas_welcome_bonus()
RETURNS TRIGGER AS $$
BEGIN
  -- Give 10 free credits to new users
  INSERT INTO raas_credits (user_id, balance, total_earned)
  VALUES (NEW.id, 10, 10)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO raas_transactions (user_id, amount, reason)
  VALUES (NEW.id, 10, 'Welcome bonus — Tài khoản mới');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_raas_welcome_bonus
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION raas_welcome_bonus();

-- ============================================================
-- Done! Verify with:
-- SELECT * FROM raas_packages;
-- SELECT * FROM raas_credits LIMIT 5;
-- ============================================================
