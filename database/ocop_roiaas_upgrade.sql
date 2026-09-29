-- ═════════════════════════════════════════════════════════
-- OCOP → ROIaaS Platform Upgrade Migration
-- Nâng cấp OCOP Export Agent thành Revenue-as-a-Service
--
-- Features:
--   ✓ 5-Phase Mission Tracking (Discovery → Handoff)
--   ✓ Subscription Tiers (Free/Starter/Growth/Pro/Enterprise)
--   ✓ Analytics Views (ROI, Revenue, Performance)
--   ✓ Usage Quotas & Rate Limits
--   ✓ ROI Calculation Engine
--
-- Execute after: raas_migration.sql + ocop_migration.sql
-- ═════════════════════════════════════════════════════════

-- ═════════════════════════════════════════════════════════
-- PHẦN 1: SUBSCRIPTION TIERS (Gói cước)
-- ═════════════════════════════════════════════════════════

-- Bảng subscription_plans: Định nghĩa các gói cước
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_key TEXT NOT NULL UNIQUE CHECK (plan_key IN ('free', 'starter', 'growth', 'pro', 'enterprise')),
    name TEXT NOT NULL,
    name_vi TEXT NOT NULL,
    description TEXT,
    monthly_credits INTEGER NOT NULL DEFAULT 0,
    mission_limit_daily INTEGER NOT NULL DEFAULT 5,
    max_complexity TEXT NOT NULL DEFAULT 'standard' CHECK (max_complexity IN ('simple', 'standard', 'complex')),
    features JSONB NOT NULL DEFAULT '[]',
    price_monthly_vnd INTEGER NOT NULL DEFAULT 0,
    price_yearly_vnd INTEGER NOT NULL DEFAULT 0,
    savings_pct INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE subscription_plans IS 'Subscription tier definitions for ROIaaS';

-- Seed data: 5 gói cước
INSERT INTO public.subscription_plans (plan_key, name, name_vi, monthly_credits, mission_limit_daily, max_complexity, features, price_monthly_vnd, price_yearly_vnd, savings_pct, is_popular) VALUES
  ('free', 'Free', 'Miễn Phí', 10, 2, 'simple',
   '["5 missions/month", "Simple complexity only", "Community support", "Basic analytics"]'::jsonb,
   0, 0, 0, false),
  ('starter', 'Starter', 'Khởi Đầu', 50, 5, 'simple',
   '["50 missions/month", "Simple complexity", "Email support", "Export to CSV"]'::jsonb,
   99000, 990000, 17, false),
  ('growth', 'Growth', 'Tăng Trưởng', 150, 10, 'standard',
   '["150 missions/month", "Standard complexity", "Priority support", "API access", "Advanced analytics"]'::jsonb,
   249000, 2490000, 17, true),
  ('pro', 'Pro', 'Chuyên Nghiệp', 500, 25, 'complex',
   '["500 missions/month", "All complexities", "24/7 support", "Full API", "Custom integrations", "White-label"]'::jsonb,
   699000, 6990000, 17, false),
  ('enterprise', 'Enterprise', 'Doanh Nghiệp', 2000, 100, 'complex',
   '["Unlimited missions", "Dedicated support", "Custom SLA", "On-premise option", "Multi-user seats"]'::jsonb,
   1999000, 19990000, 17, false)
ON CONFLICT (plan_key) DO NOTHING;

-- ═════════════════════════════════════════════════════════
-- PHẦN 2: USER SUBSCRIPTIONS (Đăng ký gói cước)
-- ═════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    plan_key TEXT NOT NULL REFERENCES public.subscription_plans(plan_key),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    credits_remaining INTEGER NOT NULL DEFAULT 0,
    missions_today INTEGER NOT NULL DEFAULT 0,
    missions_this_month INTEGER NOT NULL DEFAULT 0,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ DEFAULT now(),
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE user_subscriptions IS 'User subscription status and usage tracking';

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON public.user_subscriptions(plan_key);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- ═════════════════════════════════════════════════════════
-- PHẦN 3: 5-PHASE MISSION TRACKING (Binh Pháp Framework)
-- ═════════════════════════════════════════════════════════

-- Thêm columns cho 5-phase tracking vào raas_missions
ALTER TABLE public.raas_missions
ADD COLUMN IF NOT EXISTS phase TEXT NOT NULL DEFAULT 'discovery' CHECK (phase IN (
    'discovery',    -- 始計: Research & Planning
    'planning',     -- 謀攻: Strategy & Proposal
    'building',     -- 軍爭: Implementation
    'polish',       -- 兵勢: Review & Polish
    'handoff'       -- 火攻: Deploy & Documentation
)),
ADD COLUMN IF NOT EXISTS phase_completed_at JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS plan_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS build_artifacts JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS review_feedback JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS deploy_info JSONB DEFAULT '{}';

COMMENT ON COLUMN raas_missions.phase IS 'Current Binh Phap phase (discovery/planning/building/polish/handoff)';
COMMENT ON COLUMN raas_missions.phase_completed_at IS 'Timestamps when each phase completed: {"discovery": "...", "planning": "..."}';
COMMENT ON COLUMN raas_missions.plan_data IS 'Plan output from discovery/planning phases';
COMMENT ON COLUMN raas_missions.build_artifacts IS 'Generated files, code, content from building phase';
COMMENT ON COLUMN raas_missions.review_feedback IS 'Review comments and fixes from polish phase';
COMMENT ON COLUMN raas_missions.deploy_info IS 'Deployment status, URLs, credentials from handoff';

-- Bảng mission_phase_logs: Audit trail cho phase transitions
CREATE TABLE IF NOT EXISTS public.mission_phase_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID REFERENCES public.raas_missions(id) ON DELETE CASCADE NOT NULL,
    phase TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('started', 'completed', 'failed', 'rolled_back', 'skipped')),
    details JSONB DEFAULT '{}',
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mission_phase_logs IS 'Audit trail for 5-phase mission transitions';

CREATE INDEX IF NOT EXISTS idx_mission_phase_logs_mission ON public.mission_phase_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_phase_logs_phase ON public.mission_phase_logs(phase);

-- ═════════════════════════════════════════════════════════
-- PHẦN 4: ROI CALCULATION ENGINE
-- ═════════════════════════════════════════════════════════

-- Bảng roi_calculations: Tính toán ROI cho mỗi mission
CREATE TABLE IF NOT EXISTS public.roi_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID REFERENCES public.raas_missions(id) ON DELETE CASCADE NOT NULL,
    investment_credits INTEGER NOT NULL,
    estimated_return_vnd BIGINT NOT NULL DEFAULT 0,
    actual_return_vnd BIGINT NOT NULL DEFAULT 0,
    roi_percentage NUMERIC(10,2) DEFAULT 0,  -- (Return - Investment) / Investment * 100
    payback_period_days INTEGER,  -- Số ngày để hoàn vốn
    confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
    calculation_method TEXT NOT NULL DEFAULT 'standard',
    metadata JSONB DEFAULT '{}',
    calculated_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE roi_calculations IS 'ROI calculation for each mission';

CREATE INDEX IF NOT EXISTS idx_roi_calculations_mission ON public.roi_calculations(mission_id);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_roi ON public.roi_calculations(roi_percentage DESC);

-- Bảng revenue_tracking: Theo dõi doanh thu thực tế từ missions
CREATE TABLE IF NOT EXISTS public.revenue_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mission_id UUID REFERENCES public.raas_missions(id),
    revenue_type TEXT NOT NULL CHECK (revenue_type IN ('direct', 'referral', 'subscription', 'upsell')),
    amount_vnd BIGINT NOT NULL,
    currency TEXT DEFAULT 'VND',
    source TEXT,  -- Customer ID, order ID, etc.
    confirmed BOOLEAN DEFAULT false,
    confirmed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE revenue_tracking IS 'Actual revenue generated from missions';

CREATE INDEX IF NOT EXISTS idx_revenue_tracking_user ON public.revenue_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_mission ON public.revenue_tracking(mission_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_type ON public.revenue_tracking(revenue_type);

-- ═════════════════════════════════════════════════════════
-- PHẦN 5: ANALYTICS VIEWS
-- ═════════════════════════════════════════════════════════

-- View 1: User Subscription Summary
CREATE OR REPLACE VIEW vw_user_subscription_summary AS
SELECT
    u.id AS user_id,
    u.email,
    COALESCE(s.plan_key, 'free') AS plan_key,
    COALESCE(sp.name, 'Free') AS plan_name,
    COALESCE(sp.name_vi, 'Miễn Phí') AS plan_name_vi,
    COALESCE(s.status, 'active') AS subscription_status,
    COALESCE(s.credits_remaining, rc.balance, 0) AS credits_remaining,
    COALESCE(s.missions_today, 0) AS missions_today,
    COALESCE(s.missions_this_month, 0) AS missions_this_month,
    sp.mission_limit_daily,
    s.current_period_end,
    CASE
        WHEN s.current_period_end < now() THEN 'expired'
        WHEN s.status = 'active' THEN 'active'
        ELSE s.status
    END AS effective_status
FROM auth.users u
LEFT JOIN public.user_subscriptions s ON u.id = s.user_id
LEFT JOIN public.subscription_plans sp ON s.plan_key = sp.plan_key
LEFT JOIN public.raas_credits rc ON u.id = rc.user_id;

COMMENT ON VIEW vw_user_subscription_summary IS 'User subscription status with credit balance';

-- View 2: Mission Performance Dashboard
CREATE OR REPLACE VIEW vw_mission_performance AS
SELECT
    m.user_id,
    m.id AS mission_id,
    m.goal,
    m.phase,
    m.status,
    m.complexity,
    m.credits_cost,
    m.created_at,
    m.completed_at,
    CASE
        WHEN m.started_at IS NOT NULL AND m.completed_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (m.completed_at - m.started_at))::INTEGER
        ELSE NULL
    END AS duration_seconds,
    COALESCE(rc.roi_percentage, 0) AS roi_percentage,
    COALESCE(rt.total_revenue, 0) AS total_revenue_vnd
FROM public.raas_missions m
LEFT JOIN public.roi_calculations rc ON m.id = rc.mission_id
LEFT JOIN (
    SELECT mission_id, SUM(amount_vnd) AS total_revenue
    FROM public.revenue_tracking
    WHERE confirmed = true
    GROUP BY mission_id
) rt ON m.id = rt.mission_id;

COMMENT ON VIEW vw_mission_performance IS 'Mission performance with ROI and revenue metrics';

-- View 3: Revenue Analytics by Plan
CREATE OR REPLACE VIEW vw_revenue_by_plan AS
SELECT
    COALESCE(sp.plan_key, 'free') AS plan_key,
    COALESCE(sp.name, 'Free') AS plan_name,
    COUNT(DISTINCT us.user_id) AS total_users,
    COUNT(DISTINCT CASE WHEN us.status = 'active' THEN us.user_id END) AS active_users,
    COALESCE(SUM(rt.amount_vnd), 0) AS total_revenue_vnd,
    COALESCE(AVG(rt.amount_vnd), 0) AS avg_revenue_per_user,
    COALESCE(SUM(m.credits_cost), 0) AS total_credits_consumed,
    COUNT(DISTINCT m.id) AS total_missions
FROM public.subscription_plans sp
LEFT JOIN public.user_subscriptions us ON sp.plan_key = us.plan_key
LEFT JOIN public.raas_missions m ON us.user_id = m.user_id
LEFT JOIN public.revenue_tracking rt ON us.user_id = rt.user_id
GROUP BY sp.plan_key, sp.name
ORDER BY total_revenue_vnd DESC;

COMMENT ON VIEW vw_revenue_by_plan IS 'Revenue analytics broken down by subscription plan';

-- View 4: Phase Funnel Analysis
CREATE OR REPLACE VIEW vw_phase_funnel AS
SELECT
    phase,
    COUNT(*) AS total_missions,
    COUNT(DISTINCT user_id) AS unique_users,
    ROUND(AVG(credits_cost), 2) AS avg_credits,
    ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60), 2) AS avg_duration_minutes,
    COUNT(CASE WHEN status = 'done' THEN 1 END) AS successful,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) AS failed,
    ROUND(100.0 * COUNT(CASE WHEN status = 'done' THEN 1 END) / NULLIF(COUNT(*), 0), 2) AS success_rate_pct
FROM public.raas_missions
WHERE phase IS NOT NULL AND started_at IS NOT NULL
GROUP BY phase
ORDER BY
    CASE phase
        WHEN 'discovery' THEN 1
        WHEN 'planning' THEN 2
        WHEN 'building' THEN 3
        WHEN 'polish' THEN 4
        WHEN 'handoff' THEN 5
    END;

COMMENT ON VIEW vw_phase_funnel IS '5-phase funnel analysis with success rates';

-- View 5: Top Performing Missions (ROI Leaders)
CREATE OR REPLACE VIEW vw_roi_leaders AS
SELECT
    m.id AS mission_id,
    m.user_id,
    m.goal,
    m.phase,
    m.credits_cost AS investment,
    rc.actual_return_vnd AS actual_return,
    rc.roi_percentage,
    rc.confidence_level,
    u.email AS user_email
FROM public.raas_missions m
JOIN public.roi_calculations rc ON m.id = rc.mission_id
JOIN auth.users u ON m.user_id = u.id
WHERE rc.actual_return_vnd > 0
ORDER BY rc.roi_percentage DESC
LIMIT 100;

COMMENT ON VIEW vw_roi_leaders IS 'Top 100 missions by ROI percentage';

-- ═════════════════════════════════════════════════════════
-- PHẦN 6: USAGE QUOTAS & RATE LIMITS
-- ═════════════════════════════════════════════════════════

-- Bảng usage_quotas: Giới hạn sử dụng theo gói
CREATE TABLE IF NOT EXISTS public.usage_quotas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_key TEXT NOT NULL REFERENCES public.subscription_plans(plan_key),
    quota_type TEXT NOT NULL CHECK (quota_type IN (
        'missions_daily', 'missions_monthly', 'missions_total',
        'credits_daily', 'credits_monthly',
        'api_calls_per_minute', 'api_calls_per_hour',
        'storage_mb', 'exports_per_day'
    )),
    limit_value INTEGER NOT NULL,
    soft_limit BOOLEAN DEFAULT true,  -- true = warn, false = hard block
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE usage_quotas IS 'Usage quotas per subscription plan';

-- Seed quotas
INSERT INTO public.usage_quotas (plan_key, quota_type, limit_value, soft_limit) VALUES
  -- Free tier
  ('free', 'missions_daily', 2, true),
  ('free', 'missions_monthly', 30, true),
  ('free', 'credits_daily', 5, true),
  ('free', 'api_calls_per_minute', 2, false),
  -- Starter tier
  ('starter', 'missions_daily', 5, true),
  ('starter', 'missions_monthly', 100, true),
  ('starter', 'credits_daily', 10, true),
  ('starter', 'api_calls_per_minute', 5, false),
  -- Growth tier
  ('growth', 'missions_daily', 10, true),
  ('growth', 'missions_monthly', 500, true),
  ('growth', 'credits_daily', 30, true),
  ('growth', 'api_calls_per_minute', 15, false),
  -- Pro tier
  ('pro', 'missions_daily', 25, true),
  ('pro', 'missions_monthly', 2000, true),
  ('pro', 'credits_daily', 100, true),
  ('pro', 'api_calls_per_minute', 50, false),
  -- Enterprise tier
  ('enterprise', 'missions_daily', 100, true),
  ('enterprise', 'missions_monthly', 10000, true),
  ('enterprise', 'credits_daily', 500, true),
  ('enterprise', 'api_calls_per_minute', 200, false)
ON CONFLICT DO NOTHING;

-- Bảng usage_logs: Log usage để tính quota
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL,
    credits_consumed INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE usage_logs IS 'Usage logging for quota tracking';

CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON public.usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON public.usage_logs(action_type);

-- ═════════════════════════════════════════════════════════
-- PHẦN 7: FUNCTIONS & TRIGGERS
-- ═════════════════════════════════════════════════════════

-- Function: Kiểm tra quota trước khi chạy mission
CREATE OR REPLACE FUNCTION check_mission_quota(p_user_id UUID, p_complexity TEXT)
RETURNS TABLE (allowed BOOLEAN, reason TEXT, remaining_daily INTEGER, remaining_monthly INTEGER) AS $$
DECLARE
    v_plan_key TEXT;
    v_status TEXT;
    v_missions_today INTEGER;
    v_missions_month INTEGER;
    v_daily_limit INTEGER;
    v_monthly_limit INTEGER;
    v_max_complexity TEXT;
BEGIN
    -- Get user subscription
    SELECT plan_key, status, missions_today, missions_this_month
    INTO v_plan_key, v_status, v_missions_today, v_missions_month
    FROM public.user_subscriptions
    WHERE user_id = p_user_id;

    -- Default to free tier
    IF v_plan_key IS NULL THEN
        v_plan_key := 'free';
        v_status := 'active';
        v_missions_today := 0;
        v_missions_month := 0;
    END IF;

    -- Get limits
    SELECT limit_value INTO v_daily_limit
    FROM public.usage_quotas
    WHERE plan_key = v_plan_key AND quota_type = 'missions_daily';

    SELECT limit_value INTO v_monthly_limit
    FROM public.usage_quotas
    WHERE plan_key = v_plan_key AND quota_type = 'missions_monthly';

    -- Check subscription status
    IF v_status != 'active' THEN
        RETURN QUERY SELECT false, 'Subscription not active'::TEXT, 0, 0;
        RETURN;
    END IF;

    -- Check daily limit
    IF v_missions_today >= COALESCE(v_daily_limit, 5) THEN
        RETURN QUERY SELECT false, 'Daily mission limit reached'::TEXT,
                     0, COALESCE(v_monthly_limit, 30) - v_missions_month;
        RETURN;
    END IF;

    -- Check monthly limit
    IF v_missions_month >= COALESCE(v_monthly_limit, 30) THEN
        RETURN QUERY SELECT false, 'Monthly mission limit reached'::TEXT,
                     COALESCE(v_daily_limit, 5) - v_missions_today, 0;
        RETURN;
    END IF;

    -- Check complexity allowed
    SELECT max_complexity INTO v_max_complexity
    FROM public.subscription_plans
    WHERE plan_key = v_plan_key;

    -- Complexity hierarchy: simple < standard < complex
    IF (v_max_complexity = 'simple' AND p_complexity != 'simple') OR
       (v_max_complexity = 'standard' AND p_complexity = 'complex') THEN
        RETURN QUERY SELECT false,
                     ('Complexity ' || p_complexity || ' not allowed for ' || v_plan_key)::TEXT,
                     COALESCE(v_daily_limit, 5) - v_missions_today,
                     COALESCE(v_monthly_limit, 30) - v_missions_month;
        RETURN;
    END IF;

    -- All checks passed
    RETURN QUERY SELECT true, 'Allowed'::TEXT,
                 COALESCE(v_daily_limit, 5) - v_missions_today - 1,
                 COALESCE(v_monthly_limit, 30) - v_missions_month - 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Cập nhật subscription usage khi tạo mission
CREATE OR REPLACE FUNCTION increment_mission_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment usage counters
    UPDATE public.user_subscriptions
    SET
        missions_today = missions_today + 1,
        missions_this_month = missions_this_month + 1,
        updated_at = now()
    WHERE user_id = NEW.user_id;

    -- Log usage
    INSERT INTO public.usage_logs (user_id, action_type, metadata)
    VALUES (NEW.user_id, 'mission_created', jsonb_build_object(
        'mission_id', NEW.id,
        'goal', NEW.goal,
        'complexity', NEW.complexity,
        'phase', NEW.phase
    ));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_increment_mission_usage
    AFTER INSERT ON public.raas_missions
    FOR EACH ROW
    EXECUTE FUNCTION increment_mission_usage();

-- Function: Reset daily counters (chạy hàng ngày qua pg_cron hoặc scheduler)
CREATE OR REPLACE FUNCTION reset_daily_usage_counters()
RETURNS void AS $$
BEGIN
    UPDATE public.user_subscriptions
    SET missions_today = 0, updated_at = now()
    WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function: Reset monthly counters (chạy hàng tháng)
CREATE OR REPLACE FUNCTION reset_monthly_usage_counters()
RETURNS void AS $$
BEGIN
    UPDATE public.user_subscriptions
    SET missions_this_month = 0, updated_at = now()
    WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function: Tính ROI tự động
CREATE OR REPLACE FUNCTION calculate_roi_for_mission(
    p_mission_id UUID,
    p_estimated_return_vnd BIGINT,
    p_confidence TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    v_credits_cost INTEGER;
    v_roi_pct NUMERIC(10,2);
    v_calc_id UUID;
BEGIN
    -- Get mission credits cost
    SELECT credits_cost INTO v_credits_cost
    FROM public.raas_missions
    WHERE id = p_mission_id;

    IF v_credits_cost IS NULL THEN
        RAISE EXCEPTION 'Mission not found';
    END IF;

    -- Calculate ROI percentage: (Return - Investment) / Investment * 100
    -- 1 credit = 1000 VND (reference)
    v_roi_pct := ((p_estimated_return_vnd - (v_credits_cost * 1000))::NUMERIC /
                  NULLIF((v_credits_cost * 1000), 0)) * 100;

    -- Upsert calculation
    INSERT INTO public.roi_calculations
        (mission_id, investment_credits, estimated_return_vnd, roi_percentage, confidence_level)
    VALUES
        (p_mission_id, v_credits_cost, p_estimated_return_vnd, v_roi_pct, p_confidence)
    ON CONFLICT (mission_id) DO UPDATE SET
        estimated_return_vnd = p_estimated_return_vnd,
        roi_percentage = v_roi_pct,
        confidence_level = p_confidence,
        updated_at = now()
    RETURNING id INTO v_calc_id;

    RETURN v_calc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Cập nhật phase tự động
CREATE OR REPLACE FUNCTION update_mission_phase(
    p_mission_id UUID,
    p_new_phase TEXT,
    p_action TEXT DEFAULT 'started'
)
RETURNS void AS $$
DECLARE
    v_current_phase TEXT;
    v_completed_at JSONB;
BEGIN
    -- Get current phase data
    SELECT phase, phase_completed_at
    INTO v_current_phase, v_completed_at
    FROM public.raas_missions
    WHERE id = p_mission_id;

    IF v_current_phase IS NULL THEN
        RAISE EXCEPTION 'Mission not found';
    END IF;

    -- Update phase
    UPDATE public.raas_missions
    SET
        phase = p_new_phase,
        phase_completed_at = CASE
            WHEN p_action = 'completed' THEN
                COALESCE(phase_completed_at, '{}'::jsonb) ||
                jsonb_build_object(p_new_phase, now()::text)
            ELSE phase_completed_at
        END,
        updated_at = now()
    WHERE id = p_mission_id;

    -- Log phase transition
    INSERT INTO public.mission_phase_logs (mission_id, phase, action)
    VALUES (p_mission_id, p_new_phase, p_action);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═════════════════════════════════════════════════════════
-- PHẦN 8: ROW LEVEL SECURITY
-- ═════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_phase_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Subscription plans: Public read active plans
CREATE POLICY "Anyone can read active subscription plans"
    ON public.subscription_plans FOR SELECT
    USING (active = true);

-- User subscriptions: Users see their own
CREATE POLICY "Users read own subscription"
    ON public.user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own subscription"
    ON public.user_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own subscription"
    ON public.user_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Mission phase logs: Users see logs for their missions
CREATE POLICY "Users view own mission phase logs"
    ON public.mission_phase_logs FOR SELECT
    USING (
        mission_id IN (SELECT id FROM public.raas_missions WHERE user_id = auth.uid())
    );

-- ROI calculations: Users see their own
CREATE POLICY "Users view own ROI calculations"
    ON public.roi_calculations FOR SELECT
    USING (
        mission_id IN (SELECT id FROM public.raas_missions WHERE user_id = auth.uid())
    );

-- Revenue tracking: Users manage own revenue
CREATE POLICY "Users manage own revenue"
    ON public.revenue_tracking FOR ALL
    USING (auth.uid() = user_id);

-- Usage quotas: Public read
CREATE POLICY "Anyone can read usage quotas"
    ON public.usage_quotas FOR SELECT
    USING (true);

-- Usage logs: Users see their own
CREATE POLICY "Users view own usage logs"
    ON public.usage_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own usage logs"
    ON public.usage_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role full access to all tables
CREATE POLICY "Service role full access subscriptions"
    ON public.user_subscriptions FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access phase logs"
    ON public.mission_phase_logs FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access roi"
    ON public.roi_calculations FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access revenue"
    ON public.revenue_tracking FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access quotas"
    ON public.usage_quotas FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access usage"
    ON public.usage_logs FOR ALL
    USING (auth.role() = 'service_role');

-- ═════════════════════════════════════════════════════════
-- PHẦN 9: ADMIN HELPERS (Service Role Only)
-- ═════════════════════════════════════════════════════════

-- Function: Admin gán subscription cho user
CREATE OR REPLACE FUNCTION admin_assign_subscription(
    p_user_id UUID,
    p_plan_key TEXT,
    p_initial_credits INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
    -- Insert or update subscription
    INSERT INTO public.user_subscriptions
        (user_id, plan_key, credits_remaining, status)
    VALUES (p_user_id, p_plan_key, p_initial_credits, 'active')
    ON CONFLICT (user_id) DO UPDATE SET
        plan_key = p_plan_key,
        credits_remaining = p_initial_credits,
        status = 'active',
        current_period_start = now(),
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Admin manual ROI adjustment
CREATE OR REPLACE FUNCTION admin_adjust_roi(
    p_mission_id UUID,
    p_actual_return_vnd BIGINT
)
RETURNS void AS $$
BEGIN
    UPDATE public.roi_calculations
    SET
        actual_return_vnd = p_actual_return_vnd,
        roi_percentage = CASE
            WHEN investment_credits > 0 THEN
                ((p_actual_return_vnd - (investment_credits * 1000))::NUMERIC /
                 (investment_credits * 1000)) * 100
            ELSE 0
        END,
        updated_at = now()
    WHERE mission_id = p_mission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═════════════════════════════════════════════════════════
-- PHẦN 10: PERFORMANCE INDEXES
-- ═════════════════════════════════════════════════════════

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_missions_user_phase_status
    ON public.raas_missions(user_id, phase, status);

CREATE INDEX IF NOT EXISTS idx_missions_created_at_desc
    ON public.raas_missions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_missions_phase_completed
    ON public.raas_missions(phase, completed_at DESC)
    WHERE completed_at IS NOT NULL;

-- Subscription queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status_period
    ON public.user_subscriptions(status, current_period_end);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active_plan
    ON public.user_subscriptions(user_id, plan_key)
    WHERE status = 'active';

-- ROI queries
CREATE INDEX IF NOT EXISTS idx_roi_calculations_mission_return
    ON public.roi_calculations(mission_id, actual_return_vnd DESC);

CREATE INDEX IF NOT EXISTS idx_roi_calculations_by_percentage
    ON public.roi_calculations(roi_percentage DESC, calculated_at DESC);

-- Revenue analytics
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_user_created
    ON public.revenue_tracking(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_revenue_tracking_confirmed
    ON public.revenue_tracking(revenue_type, confirmed, created_at DESC)
    WHERE confirmed = true;

-- Usage tracking
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_action_date
    ON public.usage_logs(user_id, action_type, created_at DESC);

-- Phase logs
CREATE INDEX IF NOT EXISTS idx_mission_phase_logs_mission_created
    ON public.mission_phase_logs(mission_id, created_at DESC);

-- GIN indexes for JSONB columns (query inside JSON)
CREATE INDEX IF NOT EXISTS idx_missions_plan_data_gin
    ON public.raas_missions USING GIN (plan_data);

CREATE INDEX IF NOT EXISTS idx_missions_build_artifacts_gin
    ON public.raas_missions USING GIN (build_artifacts);

CREATE INDEX IF NOT EXISTS idx_missions_phase_completed_at_gin
    ON public.raas_missions USING GIN (phase_completed_at);

CREATE INDEX IF NOT EXISTS idx_roi_calculations_metadata_gin
    ON public.roi_calculations USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_usage_logs_metadata_gin
    ON public.usage_logs USING GIN (metadata);

-- Partial indexes for high-performance queries
CREATE INDEX IF NOT EXISTS idx_missions_high_roi
    ON public.raas_missions(id, user_id, credits_cost)
    WHERE credits_cost > 10;

CREATE INDEX IF NOT EXISTS idx_subscriptions_expiring_soon
    ON public.user_subscriptions(user_id, current_period_end)
    WHERE current_period_end > now()
      AND current_period_end < now() + INTERVAL '7 days';

CREATE INDEX IF NOT EXISTS idx_revenue_unconfirmed
    ON public.revenue_tracking(user_id, amount_vnd DESC)
    WHERE confirmed = false;

-- Covering index for subscription summary view
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_covering
    ON public.user_subscriptions(user_id, status)
    INCLUDE (plan_key, credits_remaining, missions_today, missions_this_month);

-- ═════════════════════════════════════════════════════════
-- PHẦN 11: ADD UNIQUE CONSTRAINT FOR ROI CALCULATIONS
-- ═════════════════════════════════════════════════════════

-- Add unique constraint for ON CONFLICT to work
ALTER TABLE public.roi_calculations
    ADD CONSTRAINT IF NOT EXISTS uniq_roi_calculations_mission
    UNIQUE (mission_id);

-- ═════════════════════════════════════════════════════════
-- PHẦN 12: FIX COMPLEXITY COMPARISON IN FUNCTION
-- ═════════════════════════════════════════════════════════

-- Replace check_mission_quota function with fixed complexity logic
CREATE OR REPLACE FUNCTION check_mission_quota(p_user_id UUID, p_complexity TEXT)
RETURNS TABLE (allowed BOOLEAN, reason TEXT, remaining_daily INTEGER, remaining_monthly INTEGER) AS $$
DECLARE
    v_plan_key TEXT;
    v_status TEXT;
    v_missions_today INTEGER;
    v_missions_month INTEGER;
    v_daily_limit INTEGER;
    v_monthly_limit INTEGER;
    v_max_complexity TEXT;
    v_requested_level INTEGER;
    v_max_level INTEGER;
BEGIN
    -- Get user subscription
    SELECT plan_key, status, missions_today, missions_this_month
    INTO v_plan_key, v_status, v_missions_today, v_missions_month
    FROM public.user_subscriptions
    WHERE user_id = p_user_id;

    -- Default to free tier
    IF v_plan_key IS NULL THEN
        v_plan_key := 'free';
        v_status := 'active';
        v_missions_today := 0;
        v_missions_month := 0;
    END IF;

    -- Get limits
    SELECT limit_value INTO v_daily_limit
    FROM public.usage_quotas
    WHERE plan_key = v_plan_key AND quota_type = 'missions_daily';

    SELECT limit_value INTO v_monthly_limit
    FROM public.usage_quotas
    WHERE plan_key = v_plan_key AND quota_type = 'missions_monthly';

    -- Check subscription status
    IF v_status != 'active' THEN
        RETURN QUERY SELECT false, 'Subscription not active'::TEXT, 0, 0;
        RETURN;
    END IF;

    -- Check daily limit
    IF v_missions_today >= COALESCE(v_daily_limit, 5) THEN
        RETURN QUERY SELECT false, 'Daily mission limit reached'::TEXT,
                     0, COALESCE(v_monthly_limit, 30) - v_missions_month;
        RETURN;
    END IF;

    -- Check monthly limit
    IF v_missions_month >= COALESCE(v_monthly_limit, 30) THEN
        RETURN QUERY SELECT false, 'Monthly mission limit reached'::TEXT,
                     COALESCE(v_daily_limit, 5) - v_missions_today, 0;
        RETURN;
    END IF;

    -- Check complexity allowed using numeric hierarchy
    -- simple=1, standard=2, complex=3
    SELECT max_complexity INTO v_max_complexity
    FROM public.subscription_plans
    WHERE plan_key = v_plan_key;

    v_requested_level := CASE p_complexity
        WHEN 'simple' THEN 1
        WHEN 'standard' THEN 2
        WHEN 'complex' THEN 3
        ELSE 1
    END;

    v_max_level := CASE v_max_complexity
        WHEN 'simple' THEN 1
        WHEN 'standard' THEN 2
        WHEN 'complex' THEN 3
        ELSE 1
    END;

    IF v_requested_level > v_max_level THEN
        RETURN QUERY SELECT false,
                     ('Complexity ' || p_complexity || ' exceeds plan limit (' || v_max_complexity || ')')::TEXT,
                     COALESCE(v_daily_limit, 5) - v_missions_today,
                     COALESCE(v_monthly_limit, 30) - v_missions_month;
        RETURN;
    END IF;

    -- All checks passed
    RETURN QUERY SELECT true, 'Allowed'::TEXT,
                 COALESCE(v_daily_limit, 5) - v_missions_today - 1,
                 COALESCE(v_monthly_limit, 30) - v_missions_month - 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═════════════════════════════════════════════════════════
-- VERIFY MIGRATION
-- ═════════════════════════════════════════════════════════
-- Chạy các queries sau để verify:

-- SELECT plan_key, name, monthly_credits, price_monthly_vnd FROM subscription_plans WHERE active = true;
-- SELECT * FROM vw_user_subscription_summary LIMIT 5;
-- SELECT * FROM vw_phase_funnel;
-- SELECT * FROM vw_roi_leaders LIMIT 10;

-- Verify indexes created:
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename LIKE '%subscription%' OR tablename LIKE '%mission%' OR tablename LIKE '%roi%' OR tablename LIKE '%revenue%' OR tablename LIKE '%usage%';
-- ═════════════════════════════════════════════════════════
