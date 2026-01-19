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

RAISE NOTICE '✅ Materialized views refreshed';

-- ============================================================================
-- SECTION B: WIN³ KPI SNAPSHOT
-- Captures point-in-time metrics for historical tracking
-- ============================================================================

-- Create WIN³ snapshots table if not exists
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

-- Take today's snapshot
INSERT INTO win3_snapshots (
    snapshot_date,
    total_revenue,
    monthly_revenue,
    pipeline_value,
    deals_in_pipeline,
    deals_won,
    deals_lost,
    win_rate,
    total_customers,
    new_customers,
    total_leads,
    new_leads,
    active_campaigns,
    total_ad_spend,
    scheduled_posts,
    published_posts
)
SELECT
    CURRENT_DATE,
    -- Revenue
    COALESCE((SELECT SUM(total) FROM invoices WHERE status = 'paid'), 0),
    COALESCE((SELECT SUM(total) FROM invoices WHERE status = 'paid' 
              AND paid_at >= date_trunc('month', CURRENT_DATE)), 0),
    -- Pipeline
    COALESCE((SELECT SUM(value) FROM deals WHERE stage NOT IN ('won', 'lost') 
              AND (deleted_at IS NULL)), 0),
    (SELECT COUNT(*) FROM deals WHERE stage NOT IN ('won', 'lost') 
     AND (deleted_at IS NULL)),
    (SELECT COUNT(*) FROM deals WHERE stage = 'won' AND (deleted_at IS NULL)),
    (SELECT COUNT(*) FROM deals WHERE stage = 'lost' AND (deleted_at IS NULL)),
    -- Win Rate
    CASE 
        WHEN (SELECT COUNT(*) FROM deals WHERE stage IN ('won', 'lost') AND deleted_at IS NULL) > 0
        THEN (SELECT COUNT(*) FROM deals WHERE stage = 'won' AND deleted_at IS NULL)::decimal / 
             (SELECT COUNT(*) FROM deals WHERE stage IN ('won', 'lost') AND deleted_at IS NULL) * 100
        ELSE 0 
    END,
    -- Customers
    (SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL),
    (SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL 
     AND created_at >= date_trunc('month', CURRENT_DATE)),
    -- Leads
    (SELECT COUNT(*) FROM contacts WHERE deleted_at IS NULL),
    (SELECT COUNT(*) FROM contacts WHERE deleted_at IS NULL 
     AND created_at >= date_trunc('month', CURRENT_DATE)),
    -- Campaigns
    (SELECT COUNT(*) FROM campaigns WHERE status = 'active' AND deleted_at IS NULL),
    COALESCE((SELECT SUM(spent) FROM campaigns WHERE deleted_at IS NULL), 0),
    -- Content
    (SELECT COUNT(*) FROM content_calendar WHERE status = 'scheduled'),
    (SELECT COUNT(*) FROM content_calendar WHERE status = 'published')
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

RAISE NOTICE '✅ WIN³ snapshot captured for %', CURRENT_DATE;

-- ============================================================================
-- SECTION C: CONTACTS → CUSTOMERS SYNC
-- Auto-convert qualified/converted contacts to customers
-- ============================================================================

-- Find contacts marked as converted but not yet in customers
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
-- SECTION D: PIPELINE STAGE ANALYTICS
-- Calculate conversion rates between stages
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
        END;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SECTION E: CAMPAIGN PERFORMANCE AGGREGATION
-- ============================================================================

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
-- SECTION F: BINH PHÁP STRATEGIC METRICS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_binh_phap_metrics()
RETURNS TABLE (
    metric_name TEXT,
    value TEXT,
    trend TEXT,
    status TEXT
) AS $$
DECLARE
    current_pipeline DECIMAL;
    current_revenue DECIMAL;
    current_customers INTEGER;
    current_win_rate DECIMAL;
BEGIN
    -- Get current values
    SELECT COALESCE(SUM(value), 0) INTO current_pipeline 
    FROM deals WHERE stage NOT IN ('won', 'lost') AND deleted_at IS NULL;
    
    SELECT COALESCE(SUM(total), 0) INTO current_revenue 
    FROM invoices WHERE status = 'paid';
    
    SELECT COUNT(*) INTO current_customers 
    FROM customers WHERE deleted_at IS NULL;
    
    SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE stage IN ('won', 'lost')) > 0
        THEN COUNT(*) FILTER (WHERE stage = 'won')::decimal / 
             COUNT(*) FILTER (WHERE stage IN ('won', 'lost')) * 100
        ELSE 0 
    END INTO current_win_rate
    FROM deals WHERE deleted_at IS NULL;
    
    -- Return metrics
    RETURN QUERY VALUES
        ('Pipeline Value'::TEXT, 
         to_char(current_pipeline, 'FM999,999,999,999') || ' VND', 
         '↑'::TEXT, 
         CASE WHEN current_pipeline > 100000000 THEN '🟢 STRONG' ELSE '🟡 BUILDING' END),
        ('Total Revenue'::TEXT, 
         to_char(current_revenue, 'FM999,999,999,999') || ' VND', 
         '↑'::TEXT, 
         CASE WHEN current_revenue > 50000000 THEN '🟢 HEALTHY' ELSE '🟡 GROWING' END),
        ('Customer Base'::TEXT, 
         current_customers::TEXT || ' customers', 
         '↑'::TEXT, 
         CASE WHEN current_customers > 5 THEN '🟢 STABLE' ELSE '🟡 BUILDING' END),
        ('Win Rate'::TEXT, 
         ROUND(current_win_rate, 1)::TEXT || '%', 
         CASE WHEN current_win_rate > 50 THEN '↑' ELSE '→' END, 
         CASE WHEN current_win_rate > 60 THEN '🟢 EXCELLENT' 
              WHEN current_win_rate > 40 THEN '🟡 GOOD' 
              ELSE '🔴 NEEDS WORK' END);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SECTION G: FULL SYNC REPORT
-- ============================================================================

SELECT '🚀 Binh Pháp Sync Complete!' AS status;

-- Show current state
SELECT * FROM get_binh_phap_metrics();

-- Show pipeline analytics
SELECT * FROM get_pipeline_analytics();

-- Show campaign performance
SELECT * FROM get_campaign_performance();

-- Show latest WIN³ snapshot
SELECT * FROM win3_snapshots ORDER BY snapshot_date DESC LIMIT 1;
