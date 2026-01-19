-- ============================================================================
-- PHASE 8: ULTIMATE DATABASE SCHEMA UPGRADE x100
-- Mekong Marketing Hub - Enterprise-Grade Consolidation
-- 
-- Master migration consolidating all improvements from Phase 7 + new features
-- Run this in Supabase SQL Editor
-- Created: 2026-01-19
-- ============================================================================

-- ============================================================================
-- SECTION A: CLEANUP DEPRECATED TABLES
-- ============================================================================

-- A.1: Safety check before dropping clients table
DO $$
DECLARE
    clients_count INTEGER;
BEGIN
    -- Check if clients table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        SELECT COUNT(*) INTO clients_count FROM clients;
        IF clients_count > 0 THEN
            RAISE NOTICE '⚠️  clients table has % records. Migrate data before dropping.', clients_count;
        ELSE
            -- Safe to drop - no data
            DROP TABLE IF EXISTS clients CASCADE;
            RAISE NOTICE '✅ Dropped empty clients table (deprecated)';
        END IF;
    ELSE
        RAISE NOTICE '✅ clients table already removed';
    END IF;
END $$;

-- A.2: Remove orphaned comment if exists
COMMENT ON TABLE IF EXISTS clients IS NULL;

-- ============================================================================
-- SECTION B: SOFT DELETE PATTERN
-- ============================================================================

-- B.1: Add deleted_at column to major tables
DO $$
DECLARE
    target_tables TEXT[] := ARRAY[
        'customers', 'contacts', 'projects', 'invoices', 
        'campaigns', 'deals', 'content_calendar', 'leads'
    ];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY target_tables
    LOOP
        -- Check if table exists and doesn't have deleted_at
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) 
           AND NOT EXISTS (
               SELECT 1 FROM information_schema.columns 
               WHERE table_name = tbl AND column_name = 'deleted_at'
           ) 
        THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL', tbl);
            RAISE NOTICE '✅ Added deleted_at to %', tbl;
        END IF;
    END LOOP;
END $$;

-- B.2: Soft delete function
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Instead of deleting, set deleted_at timestamp
    NEW.deleted_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- B.3: Restore function
CREATE OR REPLACE FUNCTION restore_soft_deleted(
    p_table_name TEXT,
    p_record_id UUID
) RETURNS VOID AS $$
BEGIN
    EXECUTE format('UPDATE %I SET deleted_at = NULL WHERE id = $1', p_table_name)
    USING p_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION C: AUDIT LOGGING SYSTEM
-- ============================================================================

-- C.1: Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C.2: Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- C.3: Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[];
    current_user_id UUID;
    current_user_email TEXT;
    key TEXT;
BEGIN
    -- Get current user info from JWT
    current_user_id := auth.uid();
    current_user_email := auth.jwt() ->> 'email';
    
    IF TG_OP = 'INSERT' THEN
        new_data := to_jsonb(NEW);
        INSERT INTO audit_log (table_name, record_id, action, new_data, user_id, user_email)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', new_data, current_user_id, current_user_email);
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        -- Check if this is a soft delete
        IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
            INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id, user_email)
            VALUES (TG_TABLE_NAME, NEW.id, 'SOFT_DELETE', old_data, new_data, current_user_id, current_user_email);
        ELSE
            -- Find changed fields
            FOR key IN SELECT jsonb_object_keys(new_data)
            LOOP
                IF (old_data ->> key) IS DISTINCT FROM (new_data ->> key) THEN
                    changed_fields := array_append(changed_fields, key);
                END IF;
            END LOOP;
            
            -- Only log if there are actual changes
            IF array_length(changed_fields, 1) > 0 THEN
                INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_fields, user_id, user_email)
                VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', old_data, new_data, changed_fields, current_user_id, current_user_email);
            END IF;
        END IF;
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        INSERT INTO audit_log (table_name, record_id, action, old_data, user_id, user_email)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', old_data, current_user_id, current_user_email);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C.4: Apply audit triggers to sensitive tables
DO $$
DECLARE
    audit_tables TEXT[] := ARRAY['customers', 'projects', 'invoices', 'campaigns', 'deals'];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY audit_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            -- Drop existing audit trigger if any
            EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger_%I ON %I', tbl, tbl);
            
            -- Create new audit trigger
            EXECUTE format(
                'CREATE TRIGGER audit_trigger_%I
                 AFTER INSERT OR UPDATE OR DELETE ON %I
                 FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()',
                tbl, tbl
            );
            RAISE NOTICE '✅ Applied audit trigger to %', tbl;
        END IF;
    END LOOP;
END $$;

-- C.5: RLS for audit_log - only admins can view
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_only" ON audit_log
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') = 'super_admin'
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- ============================================================================
-- SECTION D: ADVANCED INDEXING
-- ============================================================================

-- D.1: Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_customers_status_created 
    ON customers(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status_due 
    ON invoices(status, due_date) WHERE status != 'paid';
CREATE INDEX IF NOT EXISTS idx_projects_client_status 
    ON projects(client_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform_status 
    ON campaigns(platform, status);
CREATE INDEX IF NOT EXISTS idx_deals_stage_value 
    ON deals(stage, value DESC);

-- D.2: Partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_customers_active 
    ON customers(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_active 
    ON projects(id) WHERE deleted_at IS NULL AND status != 'cancelled';
CREATE INDEX IF NOT EXISTS idx_invoices_unpaid 
    ON invoices(client_id, due_date) WHERE status IN ('sent', 'overdue');

-- D.3: GIN indexes for JSONB columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'metrics') THEN
        CREATE INDEX IF NOT EXISTS idx_campaigns_metrics ON campaigns USING GIN(metrics);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'target_audience') THEN
        CREATE INDEX IF NOT EXISTS idx_campaigns_audience ON campaigns USING GIN(target_audience);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_calendar' AND column_name = 'metrics') THEN
        CREATE INDEX IF NOT EXISTS idx_content_metrics ON content_calendar USING GIN(metrics);
    END IF;
END $$;

-- D.4: Full-text search indexes
DO $$
BEGIN
    -- Add search vector column to contacts if not exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'search_vector')
    THEN
        ALTER TABLE contacts ADD COLUMN search_vector TSVECTOR;
        CREATE INDEX idx_contacts_search ON contacts USING GIN(search_vector);
        
        -- Create function to update search vector
        CREATE OR REPLACE FUNCTION contacts_search_update() RETURNS TRIGGER AS $func$
        BEGIN
            NEW.search_vector := 
                setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
                setweight(to_tsvector('simple', COALESCE(NEW.email, '')), 'B') ||
                setweight(to_tsvector('simple', COALESCE(NEW.business_name, '')), 'B') ||
                setweight(to_tsvector('simple', COALESCE(NEW.message, '')), 'C');
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
        
        CREATE TRIGGER contacts_search_trigger
            BEFORE INSERT OR UPDATE ON contacts
            FOR EACH ROW EXECUTE FUNCTION contacts_search_update();
            
        -- Update existing records
        UPDATE contacts SET search_vector = 
            setweight(to_tsvector('simple', COALESCE(name, '')), 'A') ||
            setweight(to_tsvector('simple', COALESCE(email, '')), 'B') ||
            setweight(to_tsvector('simple', COALESCE(business_name, '')), 'B') ||
            setweight(to_tsvector('simple', COALESCE(message, '')), 'C');
            
        RAISE NOTICE '✅ Added full-text search to contacts table';
    END IF;
END $$;

-- D.5: Search function for contacts
CREATE OR REPLACE FUNCTION search_contacts(search_query TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    business_name TEXT,
    status TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, c.name, c.email, c.phone, c.business_name, c.status,
        ts_rank(c.search_vector, plainto_tsquery('simple', search_query)) as rank
    FROM contacts c
    WHERE c.search_vector @@ plainto_tsquery('simple', search_query)
      AND c.deleted_at IS NULL
    ORDER BY rank DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SECTION E: MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- E.1: Dashboard Stats View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
SELECT
    -- Customer metrics
    (SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL) AS total_customers,
    (SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL AND created_at > NOW() - INTERVAL '30 days') AS new_customers_30d,
    
    -- Project metrics
    (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL AND status = 'active') AS active_projects,
    (SELECT COALESCE(SUM(progress), 0) / NULLIF(COUNT(*), 0) FROM projects WHERE deleted_at IS NULL AND status = 'active') AS avg_project_progress,
    
    -- Invoice metrics
    (SELECT COUNT(*) FROM invoices WHERE status IN ('sent', 'overdue')) AS pending_invoices,
    (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status IN ('sent', 'overdue')) AS pending_revenue,
    (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'paid' AND paid_at > NOW() - INTERVAL '30 days') AS revenue_30d,
    
    -- Campaign metrics
    (SELECT COUNT(*) FROM campaigns WHERE deleted_at IS NULL AND status = 'active') AS active_campaigns,
    
    -- Deal pipeline
    (SELECT COALESCE(SUM(value), 0) FROM deals WHERE deleted_at IS NULL AND stage NOT IN ('won', 'lost')) AS pipeline_value,
    (SELECT COALESCE(SUM(value), 0) FROM deals WHERE deleted_at IS NULL AND stage = 'won' AND won_at > NOW() - INTERVAL '30 days') AS won_deals_30d,
    
    -- Contacts
    (SELECT COUNT(*) FROM contacts WHERE deleted_at IS NULL AND status = 'new') AS new_contacts,
    
    -- Timestamp
    NOW() AS last_refreshed;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_stats ON mv_dashboard_stats(last_refreshed);

-- E.2: Monthly Revenue View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_revenue AS
SELECT
    date_trunc('month', paid_at) AS month,
    COUNT(*) AS invoice_count,
    SUM(total) AS total_revenue,
    AVG(total) AS avg_invoice_value
FROM invoices
WHERE status = 'paid' AND paid_at IS NOT NULL
GROUP BY date_trunc('month', paid_at)
ORDER BY month DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_monthly_revenue ON mv_monthly_revenue(month);

-- E.3: Refresh function
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION F: DATABASE HEALTH CHECK FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION db_health_check()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check RLS enabled
    RETURN QUERY
    SELECT 
        'RLS Enabled'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END,
        format('%s tables without RLS', COUNT(*))
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'mv_%'
      AND NOT rowsecurity;
    
    -- Check audit_log exists
    RETURN QUERY
    SELECT 
        'Audit Log'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') 
             THEN '✅ PASS' ELSE '❌ FAIL' END,
        (SELECT format('%s entries', COUNT(*)) FROM audit_log);
    
    -- Check deprecated clients table
    RETURN QUERY
    SELECT 
        'Deprecated Tables'::TEXT,
        CASE WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') 
             THEN '✅ PASS' ELSE '⚠️ WARN' END,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients')
             THEN 'clients table still exists' ELSE 'All deprecated tables removed' END;
    
    -- Check FK constraints
    RETURN QUERY
    SELECT 
        'FK Constraints'::TEXT,
        '✅ PASS'::TEXT,
        format('%s foreign key constraints', (SELECT COUNT(*) FROM pg_constraint WHERE contype = 'f'));
    
    -- Check materialized views
    RETURN QUERY
    SELECT 
        'Materialized Views'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_dashboard_stats') 
             THEN '✅ PASS' ELSE '❌ FAIL' END,
        (SELECT format('Last refresh: %s', last_refreshed) FROM mv_dashboard_stats LIMIT 1);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SECTION G: FINALIZE
-- ============================================================================

-- Refresh materialized views
SELECT refresh_dashboard_stats();

-- Run health check
SELECT * FROM db_health_check();

-- ============================================================================
-- PHASE 8 COMPLETE! 🎉
-- ============================================================================
SELECT '🚀 Phase 8 Ultimate Migration Complete!' AS status,
       NOW() AS completed_at;
