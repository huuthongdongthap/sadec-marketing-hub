-- ============================================================================
-- BINH PHÁP SYNC - MASTER DATA SYNCHRONIZATION
-- Real-time sync and refresh for WIN³ Dashboard and Analytics
--
-- Run this periodically or after major data changes
-- ============================================================================

-- ============================================================================
-- SECTION A: REFRESH MATERIALIZED VIEWS
-- ============================================================================

-- Refresh dashboard stats (uses CONCURRENTLY for no-lock refresh)
SELECT refresh_dashboard_stats();

-- ============================================================================
-- SECTION B: WIN³ KPI SNAPSHOT
-- Captures point-in-time metrics for historical tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS win3_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Revenue Metrics
    total_revenue DECIMAL(15,2) DEFAULT 0,
    monthly_revenue DECIMAL(15,2) DEFAULT 0,
    revenue_growth_percent DECIMAL(5,2) DEFAULT 0,

    -- Pipeline Metrics
    pipeline_value DECIMAL(15,2) DEFAULT 0,
    deals_in_pipeline INTEGER DEFAULT 0,
    deals_won INTEGER DEFAULT 0,
    deals_lost INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,

    -- Customer Metrics
    total_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    customer_growth_percent DECIMAL(5,2) DEFAULT 0,

    -- Marketing Metrics
    total_leads INTEGER DEFAULT 0,
    new_leads INTEGER DEFAULT 0,
    lead_conversion_rate DECIMAL(5,2) DEFAULT 0,

    -- Campaign Metrics
    active_campaigns INTEGER DEFAULT 0,
    total_ad_spend DECIMAL(15,2) DEFAULT 0,
    avg_campaign_roi DECIMAL(5,2) DEFAULT 0,

    -- Content Metrics
    scheduled_posts INTEGER DEFAULT 0,
    published_posts INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(snapshot_date)
);

-- Enable RLS
ALTER TABLE win3_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "win3_snapshots_admin_only" ON win3_snapshots
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'super_admin'
           OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin');

-- Take today's snapshot using CTEs for cleaner logic and performance
WITH
date_range AS (
    SELECT
        CURRENT_DATE as today,
        date_trunc('month', CURRENT_DATE) as month_start
),
revenue_metrics AS (
    SELECT
        COALESCE(SUM(total), 0) as total,
        COALESCE(SUM(CASE WHEN paid_at >= (SELECT month_start FROM date_range) THEN total ELSE 0 END), 0) as monthly
    FROM invoices
    WHERE status = 'paid'
),
deal_metrics AS (
    SELECT
        COALESCE(SUM(CASE WHEN stage NOT IN ('won', 'lost') THEN value ELSE 0 END), 0) as pipeline_value,
        COUNT(CASE WHEN stage NOT IN ('won', 'lost') THEN 1 END) as active_count,
        COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_count,
        COUNT(CASE WHEN stage = 'lost' THEN 1 END) as lost_count
    FROM deals
    WHERE deleted_at IS NULL
),
customer_metrics AS (
    SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= (SELECT month_start FROM date_range) THEN 1 END) as new_count
    FROM customers
    WHERE deleted_at IS NULL
),
contact_metrics AS (
    SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= (SELECT month_start FROM date_range) THEN 1 END) as new_count
    FROM contacts
    WHERE deleted_at IS NULL
),
campaign_metrics AS (
    SELECT
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COALESCE(SUM(spent), 0) as total_spend
    FROM campaigns
    WHERE deleted_at IS NULL
),
content_metrics AS (
    SELECT
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count
    FROM content_calendar
)
INSERT INTO win3_snapshots (
    snapshot_date,
    total_revenue, monthly_revenue,
    pipeline_value, deals_in_pipeline, deals_won, deals_lost, win_rate,
    total_customers, new_customers,
    total_leads, new_leads,
    active_campaigns, total_ad_spend,
    scheduled_posts, published_posts
)
SELECT
    d.today,
    -- Revenue
    r.total, r.monthly,
    -- Pipeline
    dm.pipeline_value, dm.active_count, dm.won_count, dm.lost_count,
    CASE
        WHEN (dm.won_count + dm.lost_count) > 0
        THEN (dm.won_count::decimal / (dm.won_count + dm.lost_count) * 100)
        ELSE 0
    END,
    -- Customers
    cum.total, cum.new_count,
    -- Leads
    com.total, com.new_count,
    -- Campaigns
    cam.active_count, cam.total_spend,
    -- Content
    cnm.scheduled_count, cnm.published_count
FROM date_range d
CROSS JOIN revenue_metrics r
CROSS JOIN deal_metrics dm
CROSS JOIN customer_metrics cum
CROSS JOIN contact_metrics com
CROSS JOIN campaign_metrics cam
CROSS JOIN content_metrics cnm
ON CONFLICT (snapshot_date) DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    monthly_revenue = EXCLUDED.monthly_revenue,
    pipeline_value = EXCLUDED.pipeline_value,
    deals_in_pipeline = EXCLUDED.deals_in_pipeline,
    deals_won = EXCLUDED.deals_won,
    deals_lost = EXCLUDED.deals_lost,
    win_rate = EXCLUDED.win_rate,
    total_customers = EXCLUDED.total_customers,
    new_customers = EXCLUDED.new_customers,
    total_leads = EXCLUDED.total_leads,
    new_leads = EXCLUDED.new_leads,
    active_campaigns = EXCLUDED.active_campaigns,
    total_ad_spend = EXCLUDED.total_ad_spend,
    scheduled_posts = EXCLUDED.scheduled_posts,
    published_posts = EXCLUDED.published_posts,
    created_at = NOW();

-- ============================================================================
-- SECTION C: CONTACTS → CUSTOMERS SYNC
-- Auto-convert qualified/converted contacts to customers
-- ============================================================================

INSERT INTO customers (name, phone, email, business_name, source, status, notes, created_at)
SELECT
    c.name,
    c.phone,
    c.email,
    c.business_name,
    COALESCE(c.service, 'website'),
    'new',
    'Auto-converted from contact: ' || COALESCE(c.message, ''),
    NOW()
FROM contacts c
WHERE c.status = 'converted'
  AND c.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM customers cu
      WHERE cu.phone = c.phone OR cu.email = c.email
  );

-- ============================================================================
-- SECTION D: ANALYTICS FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pipeline_analytics()
RETURNS TABLE (
    stage TEXT,
    deal_count INTEGER,
    total_value DECIMAL(15,2),
    avg_value DECIMAL(15,2),
    conversion_probability DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.stage,
        COUNT(*)::INTEGER,
        SUM(d.value),
        AVG(d.value),
        AVG(d.probability)::DECIMAL(5,2)
    FROM deals d
    WHERE d.deleted_at IS NULL
      AND d.stage NOT IN ('won', 'lost')
    GROUP BY d.stage
    ORDER BY
        CASE d.stage
            WHEN 'discovery' THEN 1
            WHEN 'proposal' THEN 2
            WHEN 'negotiation' THEN 3
            ELSE 4
        END;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_campaign_performance()
RETURNS TABLE (
    platform TEXT,
    campaign_count INTEGER,
    total_budget DECIMAL(15,2),
    total_spent DECIMAL(15,2),
    total_impressions BIGINT,
    total_clicks BIGINT,
    total_leads BIGINT,
    total_conversions BIGINT,
    avg_roi DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.platform,
        COUNT(*)::INTEGER,
        SUM(c.budget),
        SUM(c.spent),
        SUM((c.metrics->>'impressions')::BIGINT),
        SUM((c.metrics->>'clicks')::BIGINT),
        SUM((c.metrics->>'leads')::BIGINT),
        SUM((c.metrics->>'conversions')::BIGINT),
        AVG((c.metrics->>'roi')::DECIMAL)::DECIMAL(5,2)
    FROM campaigns c
    WHERE c.deleted_at IS NULL
    GROUP BY c.platform
    ORDER BY SUM(c.spent) DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SECTION E: BINH PHÁP STRATEGIC METRICS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_binh_phap_metrics()
RETURNS TABLE (
    metric_name TEXT,
    value TEXT,
    trend TEXT,
    status TEXT
) AS $$
DECLARE
    curr RECORD;
BEGIN
    -- Calculate all current metrics in one pass using CTE
    WITH metrics AS (
        SELECT
            (SELECT COALESCE(SUM(value), 0) FROM deals WHERE stage NOT IN ('won', 'lost') AND deleted_at IS NULL) as pipeline,
            (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'paid') as revenue,
            (SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL) as customers,
            (SELECT
                CASE
                    WHEN COUNT(*) FILTER (WHERE stage IN ('won', 'lost')) > 0
                    THEN COUNT(*) FILTER (WHERE stage = 'won')::decimal /
                         COUNT(*) FILTER (WHERE stage IN ('won', 'lost')) * 100
                    ELSE 0
                END
             FROM deals WHERE deleted_at IS NULL) as win_rate
    )
    SELECT * INTO curr FROM metrics;

    -- Return formatted metrics
    RETURN QUERY VALUES
        ('Pipeline Value'::TEXT,
         to_char(curr.pipeline, 'FM999,999,999,999') || ' VND',
         '↑'::TEXT,
         CASE WHEN curr.pipeline > 100000000 THEN '🟢 STRONG' ELSE '🟡 BUILDING' END),

        ('Total Revenue'::TEXT,
         to_char(curr.revenue, 'FM999,999,999,999') || ' VND',
         '↑'::TEXT,
         CASE WHEN curr.revenue > 50000000 THEN '🟢 HEALTHY' ELSE '🟡 GROWING' END),

        ('Customer Base'::TEXT,
         curr.customers::TEXT || ' customers',
         '↑'::TEXT,
         CASE WHEN curr.customers > 5 THEN '🟢 STABLE' ELSE '🟡 BUILDING' END),

        ('Win Rate'::TEXT,
         ROUND(curr.win_rate, 1)::TEXT || '%',
         CASE WHEN curr.win_rate > 50 THEN '↑' ELSE '→' END,
         CASE WHEN curr.win_rate > 60 THEN '🟢 EXCELLENT'
              WHEN curr.win_rate > 40 THEN '🟡 GOOD'
              ELSE '🔴 NEEDS WORK' END);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- REPORT
-- ============================================================================

SELECT '🚀 Binh Pháp Sync Complete!' AS status;
SELECT * FROM get_binh_phap_metrics();
