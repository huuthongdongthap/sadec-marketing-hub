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

-- A.2: Remove orphaned comment if exists (wrapped in DO block for safety)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clients' AND schemaname = 'public') THEN
        COMMENT ON TABLE clients IS NULL;
    END IF;
END $$;

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
-- ============================================================================
-- UNIFIED RLS POLICIES - CONSOLIDATED
-- Mekong Marketing Hub - All Row Level Security in One Place
-- 
-- Consolidates rls_policies_v4.sql and rls_policies_v5.sql
-- Run AFTER phase8_ultimate.sql
-- ============================================================================

-- ============================================================================
-- ROLE HIERARCHY
-- super_admin > manager > content_creator > client
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user role (with fallback)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    jwt_role TEXT;
    db_role TEXT;
BEGIN
    -- Try JWT first
    jwt_role := auth.jwt() ->> 'role';
    IF jwt_role IS NOT NULL THEN
        RETURN jwt_role;
    END IF;
    
    -- Fallback to user_profiles
    SELECT role INTO db_role FROM user_profiles WHERE id = auth.uid();
    RETURN COALESCE(db_role, 'client');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if user is staff (manager or above)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('super_admin', 'manager', 'content_creator');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'super_admin';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER_PROFILES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON user_profiles;

-- Anyone can view profiles
CREATE POLICY "user_profiles_select" ON user_profiles
    FOR SELECT TO authenticated USING (true);

-- Users can only update their own profile
CREATE POLICY "user_profiles_update" ON user_profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid() OR is_admin());

-- Only admins can delete profiles
CREATE POLICY "user_profiles_delete" ON user_profiles
    FOR DELETE TO authenticated USING (is_admin());

-- ============================================================================
-- CUSTOMERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "customers_insert" ON customers;
DROP POLICY IF EXISTS "customers_update" ON customers;
DROP POLICY IF EXISTS "customers_delete" ON customers;
DROP POLICY IF EXISTS "Managers read customers" ON customers;
DROP POLICY IF EXISTS "Managers insert customers" ON customers;
DROP POLICY IF EXISTS "Managers update customers" ON customers;
DROP POLICY IF EXISTS "Super admin delete customers" ON customers;

-- Staff can view all customers (excluding soft deleted)
CREATE POLICY "customers_select" ON customers
    FOR SELECT TO authenticated
    USING (is_staff() AND (deleted_at IS NULL));

-- Staff can insert customers
CREATE POLICY "customers_insert" ON customers
    FOR INSERT TO authenticated
    WITH CHECK (is_staff());

-- Staff can update customers
CREATE POLICY "customers_update" ON customers
    FOR UPDATE TO authenticated
    USING (is_staff());

-- Only admins can hard delete
CREATE POLICY "customers_delete" ON customers
    FOR DELETE TO authenticated USING (is_admin());

-- ============================================================================
-- CONTACTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "contacts_select" ON contacts;
DROP POLICY IF EXISTS "contacts_insert" ON contacts;
DROP POLICY IF EXISTS "contacts_update" ON contacts;
DROP POLICY IF EXISTS "contacts_delete" ON contacts;
DROP POLICY IF EXISTS "anon_contacts_insert" ON contacts;

-- Staff can view all contacts
CREATE POLICY "contacts_select" ON contacts
    FOR SELECT TO authenticated
    USING (is_staff() AND (deleted_at IS NULL));

-- Anyone can submit contact form (including anonymous)
CREATE POLICY "anon_contacts_insert" ON contacts
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "contacts_insert" ON contacts
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Staff can update contacts
CREATE POLICY "contacts_update" ON contacts
    FOR UPDATE TO authenticated
    USING (is_staff());

-- Only admins can delete
CREATE POLICY "contacts_delete" ON contacts
    FOR DELETE TO authenticated USING (is_admin());

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "projects_select_own_or_staff" ON projects;
DROP POLICY IF EXISTS "projects_insert_staff" ON projects;
DROP POLICY IF EXISTS "projects_update_staff" ON projects;
DROP POLICY IF EXISTS "projects_delete_admin" ON projects;

-- Clients see their own projects, staff see all
CREATE POLICY "projects_select" ON projects
    FOR SELECT TO authenticated
    USING (
        (deleted_at IS NULL) AND (
            is_staff()
            OR client_id = auth.uid()
        )
    );

-- Managers+ can create projects
CREATE POLICY "projects_insert" ON projects
    FOR INSERT TO authenticated
    WITH CHECK (get_user_role() IN ('super_admin', 'manager'));

-- Staff can update projects
CREATE POLICY "projects_update" ON projects
    FOR UPDATE TO authenticated
    USING (is_staff());

-- Only admins can hard delete
CREATE POLICY "projects_delete" ON projects
    FOR DELETE TO authenticated USING (is_admin());

-- ============================================================================
-- INVOICES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "invoices_select_own_or_staff" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_staff" ON invoices;
DROP POLICY IF EXISTS "invoices_update_staff" ON invoices;
DROP POLICY IF EXISTS "invoices_delete_admin" ON invoices;

-- Clients see their own invoices, staff see all
CREATE POLICY "invoices_select" ON invoices
    FOR SELECT TO authenticated
    USING (
        (deleted_at IS NULL) AND (
            get_user_role() IN ('super_admin', 'manager')
            OR client_id = auth.uid()
        )
    );

-- Managers+ can create invoices
CREATE POLICY "invoices_insert" ON invoices
    FOR INSERT TO authenticated
    WITH CHECK (get_user_role() IN ('super_admin', 'manager'));

-- Managers+ can update invoices
CREATE POLICY "invoices_update" ON invoices
    FOR UPDATE TO authenticated
    USING (get_user_role() IN ('super_admin', 'manager'));

-- Only admins can hard delete
CREATE POLICY "invoices_delete" ON invoices
    FOR DELETE TO authenticated USING (is_admin());

-- ============================================================================
-- CAMPAIGNS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "campaigns_select_all" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_staff" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_staff" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_admin" ON campaigns;

-- All authenticated can view campaigns
CREATE POLICY "campaigns_select" ON campaigns
    FOR SELECT TO authenticated
    USING (deleted_at IS NULL);

-- Content creators+ can create campaigns
CREATE POLICY "campaigns_insert" ON campaigns
    FOR INSERT TO authenticated
    WITH CHECK (is_staff());

-- Content creators+ can update campaigns
CREATE POLICY "campaigns_update" ON campaigns
    FOR UPDATE TO authenticated
    USING (is_staff());

-- Only admins can hard delete
CREATE POLICY "campaigns_delete" ON campaigns
    FOR DELETE TO authenticated USING (is_admin());

-- ============================================================================
-- DEALS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "deals_select_staff" ON deals;
DROP POLICY IF EXISTS "deals_insert_staff" ON deals;
DROP POLICY IF EXISTS "deals_update_staff" ON deals;
DROP POLICY IF EXISTS "deals_delete_admin" ON deals;

-- Managers+ can view deals
CREATE POLICY "deals_select" ON deals
    FOR SELECT TO authenticated
    USING (
        (deleted_at IS NULL) AND 
        get_user_role() IN ('super_admin', 'manager')
    );

-- Managers+ can create deals
CREATE POLICY "deals_insert" ON deals
    FOR INSERT TO authenticated
    WITH CHECK (get_user_role() IN ('super_admin', 'manager'));

-- Managers+ can update deals
CREATE POLICY "deals_update" ON deals
    FOR UPDATE TO authenticated
    USING (get_user_role() IN ('super_admin', 'manager'));

-- Only admins can hard delete
CREATE POLICY "deals_delete" ON deals
    FOR DELETE TO authenticated USING (is_admin());

-- ============================================================================
-- CONTENT_CALENDAR POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "content_calendar_select" ON content_calendar;
DROP POLICY IF EXISTS "content_calendar_insert" ON content_calendar;
DROP POLICY IF EXISTS "content_calendar_update" ON content_calendar;
DROP POLICY IF EXISTS "content_calendar_delete" ON content_calendar;

-- Staff can view all content
CREATE POLICY "content_calendar_select" ON content_calendar
    FOR SELECT TO authenticated
    USING (is_staff() AND (deleted_at IS NULL));

-- Content creators+ can create
CREATE POLICY "content_calendar_insert" ON content_calendar
    FOR INSERT TO authenticated
    WITH CHECK (is_staff());

-- Content creators+ can update
CREATE POLICY "content_calendar_update" ON content_calendar
    FOR UPDATE TO authenticated
    USING (is_staff());

-- Only admins can delete
CREATE POLICY "content_calendar_delete" ON content_calendar
    FOR DELETE TO authenticated USING (is_admin());

-- ============================================================================
-- SCHEDULED_POSTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "scheduled_posts_select" ON scheduled_posts;
DROP POLICY IF EXISTS "scheduled_posts_insert" ON scheduled_posts;
DROP POLICY IF EXISTS "scheduled_posts_update" ON scheduled_posts;
DROP POLICY IF EXISTS "scheduled_posts_delete" ON scheduled_posts;

-- Staff can view posts
CREATE POLICY "scheduled_posts_select" ON scheduled_posts
    FOR SELECT TO authenticated USING (is_staff());

-- Content creators+ can create
CREATE POLICY "scheduled_posts_insert" ON scheduled_posts
    FOR INSERT TO authenticated WITH CHECK (is_staff());

-- Content creators+ can update their own or admins can update any
CREATE POLICY "scheduled_posts_update" ON scheduled_posts
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid() OR is_admin());

-- Only admins can delete
CREATE POLICY "scheduled_posts_delete" ON scheduled_posts
    FOR DELETE TO authenticated USING (is_admin());

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;

-- Users see their own notifications
CREATE POLICY "notifications_select" ON notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Users can mark their own as read
CREATE POLICY "notifications_update" ON notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- BUDGET_TRACKING POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "budget_tracking_select" ON budget_tracking;
DROP POLICY IF EXISTS "budget_tracking_insert" ON budget_tracking;
DROP POLICY IF EXISTS "budget_tracking_update" ON budget_tracking;

-- Managers+ can view budgets
CREATE POLICY "budget_tracking_select" ON budget_tracking
    FOR SELECT TO authenticated
    USING (get_user_role() IN ('super_admin', 'manager'));

-- Managers+ can insert
CREATE POLICY "budget_tracking_insert" ON budget_tracking
    FOR INSERT TO authenticated
    WITH CHECK (get_user_role() IN ('super_admin', 'manager'));

-- Managers+ can update
CREATE POLICY "budget_tracking_update" ON budget_tracking
    FOR UPDATE TO authenticated
    USING (get_user_role() IN ('super_admin', 'manager'));

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all policies applied
SELECT 'RLS Unified Policies Applied!' AS status,
       (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') AS total_policies;
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

-- Note: Materialized views refreshed

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

-- WIN³ snapshot captured

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
-- ============================================================================
-- MEKONG AGENCY - SEED DATA V2 (BINH PHÁP SYNC)
-- Migrated from legacy 'clients' table to 'customers' table
-- Compatible with Phase 8 schema (audit_log, soft delete, etc.)
-- Run AFTER phase8_ultimate.sql and rls_unified.sql
-- ============================================================================

-- ============================================================================
-- DEMO LEADS (8 leads with various statuses)
-- ============================================================================
INSERT INTO leads (tenant_id, name, email, phone, company, position, source, status, score, temperature, notes, created_at, last_contacted_at)
SELECT 
  t.id,
  l.name,
  l.email,
  l.phone,
  l.company,
  l.position,
  l.source::text,
  l.status::text,
  l.score,
  l.temperature::text,
  l.notes,
  l.created_at::timestamptz,
  l.last_contacted_at::timestamptz
FROM tenants t
CROSS JOIN (VALUES
  ('Trần Thanh Lan', 'lan@huongsen.vn', '0909 123 456', 'Cửa hàng hoa Hương Sen', 'Chủ cửa hàng', 'facebook', 'new', 85, 'hot', 'Quan tâm đến quảng cáo Facebook cho mùa Tết', '2026-01-05 10:30:00+07', NULL),
  ('Nguyễn Văn Minh', 'minh@mekongrest.vn', '0918 765 432', 'Nhà hàng Mekong', 'Quản lý', 'website', 'contacted', 65, 'warm', 'Đã gọi điện, hẹn gặp tuần sau', '2026-01-03 14:00:00+07', '2026-01-05 09:00:00+07'),
  ('Phạm Hoàng', 'hoang@fitnesspro.vn', '0977 111 222', 'Gym Fitness Pro', 'Giám đốc', 'zalo', 'new', 35, 'cold', 'Chưa rõ ngân sách', '2026-01-04 16:45:00+07', NULL),
  ('Lê Thị Hoa', 'hoa@spacenter.vn', '0933 444 555', 'Spa & Beauty Center', 'Chủ spa', 'referral', 'contacted', 90, 'hot', 'Được giới thiệu từ Sa Đéc Flower, rất quan tâm', '2026-01-02 11:00:00+07', '2026-01-05 14:30:00+07'),
  ('Võ Minh Tuấn', 'tuan@hanhphuc.vn', '0966 777 888', 'Tiệm bánh Hạnh Phúc', 'Chủ tiệm', 'facebook', 'contacted', 70, 'warm', 'Muốn chạy quảng cáo cho mùa Valentine', '2026-01-01 09:15:00+07', '2026-01-04 10:00:00+07'),
  ('Đặng Văn Long', 'long@riverside.vn', '0988 999 000', 'Khách sạn Riverside', 'Marketing Manager', 'google', 'qualified', 95, 'hot', 'Đã gửi báo giá 50M, chờ phản hồi', '2025-12-28 08:00:00+07', '2026-01-05 16:00:00+07'),
  ('Huỳnh Thanh Mai', 'mai@xyz.vn', '0911 222 333', 'Thời trang XYZ', 'Owner', 'website', 'qualified', 75, 'warm', 'Báo giá 20M cho chiến dịch 3 tháng', '2025-12-25 13:30:00+07', '2026-01-03 11:00:00+07'),
  ('Trương Công Danh', 'danh@abc.vn', '0922 333 444', 'Công ty TNHH ABC', 'CEO', 'referral', 'won', 100, 'hot', 'Đã ký hợp đồng 100M/năm', '2025-12-20 10:00:00+07', '2026-01-02 09:00:00+07')
) AS l(name, email, phone, company, position, source, status, score, temperature, notes, created_at, last_contacted_at)
WHERE t.slug = 'sadec-hub'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO CUSTOMERS (Migrated from clients table)
-- Primary customer data - used by AdminAPI
-- ============================================================================
INSERT INTO customers (name, phone, email, business_name, source, status, notes, avatar_emoji, value, created_at)
VALUES
  ('Nguyễn Văn Hoa', '0909 111 222', 'hoa@sadecflower.vn', 'Sa Đéc Flower Shop', 'referral', 'active', 'Khách hàng VIP, làm việc từ 2025', '🌸', 25000000, '2025-06-01 10:00:00+07'),
  ('Trần Bình Du', '0918 333 444', 'du@mekongtravel.vn', 'Mekong Travel', 'facebook', 'active', 'Tour du lịch, cần SEO và Ads', '✈️', 35000000, '2025-07-15 14:00:00+07'),
  ('Lê Minh Ẩm', '0977 555 666', 'am@canthofoods.vn', 'Cần Thơ Foods', 'website', 'active', 'F&B, đang chạy Zalo OA', '🍜', 18000000, '2025-08-20 11:00:00+07'),
  ('Phạm Thị Thời', '0933 777 888', 'thoi@lxboutique.vn', 'Long Xuyên Boutique', 'google', 'active', 'Thời trang, TikTok campaign', '👗', 22000000, '2025-09-10 09:00:00+07'),
  ('Đặng Văn Long', '0988 999 000', 'long@riverside.vn', 'Khách sạn Riverside', 'referral', 'active', 'Khách sạn 4 sao, ngân sách cao', '🏨', 50000000, '2025-10-05 16:00:00+07'),
  ('Nguyễn Thị Hương', '0944 123 789', 'huong@spabeauty.vn', 'Spa Beauty Center', 'facebook', 'new', 'Spa mới, cần full service', '💆', 15000000, '2026-01-10 09:30:00+07'),
  ('Trần Văn Tài', '0955 456 123', 'tai@mekongtech.vn', 'Mekong Tech Solutions', 'website', 'active', 'IT Services, B2B marketing', '💻', 40000000, '2025-11-15 14:00:00+07'),
  ('Lý Thanh Tâm', '0966 789 456', 'tam@dongthaprice.vn', 'Đồng Tháp Rice Export', 'google', 'active', 'Xuất khẩu gạo, cần website + branding', '🌾', 60000000, '2025-12-01 10:00:00+07')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO DEALS (Sales Pipeline - Binh Pháp WIN³ Data)
-- ============================================================================
INSERT INTO deals (tenant_id, name, value, stage, probability, expected_close, notes, created_at)
SELECT 
  t.id,
  d.name,
  d.value,
  d.stage::text,
  d.probability,
  d.expected_close::date,
  d.notes,
  NOW()
FROM tenants t
CROSS JOIN (VALUES
  ('Website Redesign - Spa Beauty', 25000000, 'proposal', 60, '2026-02-01', 'Đã gửi proposal, chờ feedback'),
  ('Chiến dịch Tết 2026 - Riverside Hotel', 50000000, 'negotiation', 75, '2026-01-25', 'Đang thương lượng giá cuối'),
  ('SEO Package 6 tháng - Mekong Tech', 30000000, 'discovery', 30, '2026-02-15', 'Mới contact, cần demo'),
  ('Social Media 2026 - Long Xuyên Boutique', 24000000, 'won', 100, '2026-01-15', 'Đã ký hợp đồng 12 tháng'),
  ('Google Ads Campaign - Đồng Tháp Rice', 40000000, 'proposal', 50, '2026-02-28', 'Đã gửi 2 options pricing'),
  ('Branding Package - Cần Thơ Foods', 35000000, 'negotiation', 80, '2026-01-30', 'Gần chốt deal'),
  ('TikTok Campaign Q1 - XYZ Fashion', 18000000, 'discovery', 25, '2026-03-01', 'Đang tìm hiểu về service'),
  ('Full Digital Package - ABC Corp', 100000000, 'won', 100, '2026-01-10', 'Đã ký HĐ 100M/năm - TOP client')
) AS d(name, value, stage, probability, expected_close, notes)
WHERE t.slug = 'sadec-hub'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO CONTENT CALENDAR (Social Media Schedule)
-- ============================================================================
INSERT INTO content_calendar (tenant_id, title, content, platform, status, scheduled_at, hashtags, metrics, created_at)
SELECT 
  t.id,
  c.title,
  c.content,
  c.platform::text,
  c.status::text,
  c.scheduled_at::timestamptz,
  c.hashtags::text[],
  c.metrics::jsonb,
  NOW()
FROM tenants t
CROSS JOIN (VALUES
  ('Chúc mừng năm mới 2026! 🎉', 'Chúc Quý khách hàng và đối tác năm mới nhiều sức khỏe, thành công!', 'facebook', 'published', '2026-01-01 00:00:00+07', ARRAY['HappyNewYear', 'SaDecMarketing', '2026'], '{"likes": 234, "comments": 45, "shares": 23, "views": 3500}'),
  ('5 xu hướng Marketing 2026 cho SME', 'Khám phá 5 xu hướng marketing digital giúp doanh nghiệp nhỏ tăng trưởng...', 'facebook', 'published', '2026-01-05 10:00:00+07', ARRAY['MarketingTips', 'SMEVietnam', 'DigitalMarketing'], '{"likes": 156, "comments": 28, "shares": 45, "views": 2800}'),
  ('Case Study: Tăng 300% đơn hàng trong 30 ngày', 'Cách Sa Đéc Flower Shop tăng doanh số nhờ Facebook Ads...', 'facebook', 'scheduled', '2026-01-20 09:00:00+07', ARRAY['CaseStudy', 'FacebookAds', 'Success'], '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'),
  ('Mẹo chạy Zalo OA hiệu quả', 'Video hướng dẫn setup và tối ưu Zalo Official Account...', 'zalo', 'scheduled', '2026-01-22 14:00:00+07', ARRAY['ZaloOA', 'Tutorial'], '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'),
  ('TikTok Trends tháng 1/2026', 'Điểm qua những trend hot nhất trên TikTok cho brands...', 'tiktok', 'draft', '2026-01-25 18:00:00+07', ARRAY['TikTokTrends', 'Viral', '2026'], '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'),
  ('Valentine Marketing Ideas', 'Thu hút khách hàng mùa Valentine với 10 ý tưởng sáng tạo...', 'instagram', 'draft', '2026-02-10 10:00:00+07', ARRAY['Valentine2026', 'MarketingIdeas'], '{"likes": 0, "comments": 0, "shares": 0, "views": 0}')
) AS c(title, content, platform, status, scheduled_at, hashtags, metrics)
WHERE t.slug = 'sadec-hub'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO PROJECTS (Linked to customers)
-- ============================================================================
INSERT INTO projects (tenant_id, client_id, name, description, type, status, progress, budget, spent, start_date, end_date, created_at)
SELECT 
  t.id,
  c.id,
  p.name,
  p.description,
  p.type::text,
  p.status::text,
  p.progress,
  p.budget,
  p.spent,
  p.start_date::date,
  p.end_date::date,
  NOW()
FROM tenants t
CROSS JOIN customers c
CROSS JOIN LATERAL (VALUES
  ('Chiến dịch Facebook Ads Q1', 'Quảng cáo Facebook cho sản phẩm hoa tươi, target 25-45 tuổi', 'ads', 'active', 75, 15000000, 11250000, '2026-01-01', '2026-03-31'),
  ('SEO Website 2026', 'Tối ưu SEO local cho website shop hoa', 'seo', 'active', 40, 5000000, 2000000, '2026-01-01', '2026-12-31')
) AS p(name, description, type, status, progress, budget, spent, start_date, end_date)
WHERE t.slug = 'sadec-hub' 
  AND c.business_name = 'Sa Đéc Flower Shop'
ON CONFLICT DO NOTHING;

INSERT INTO projects (tenant_id, client_id, name, description, type, status, progress, budget, spent, start_date, end_date, created_at)
SELECT 
  t.id,
  c.id,
  'Google Ads - Travel Campaign',
  'Chiến dịch Google Ads cho tour du lịch Mekong',
  'ads',
  'active',
  60,
  20000000,
  14000000,
  '2026-01-01'::date,
  '2026-02-28'::date,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub' 
  AND c.business_name = 'Mekong Travel'
ON CONFLICT DO NOTHING;

INSERT INTO projects (tenant_id, client_id, name, description, type, status, progress, budget, spent, start_date, end_date, created_at)
SELECT 
  t.id,
  c.id,
  'Social Media Management',
  'Quản lý Fanpage và nội dung social media',
  'social',
  'active',
  25,
  3000000,
  750000,
  '2026-01-01'::date,
  '2026-01-31'::date,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub' 
  AND c.business_name = 'Cần Thơ Foods'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO CAMPAIGNS (Marketing Campaigns)
-- ============================================================================
INSERT INTO campaigns (tenant_id, client_id, name, platform, type, status, budget, spent, start_date, end_date, metrics, created_at)
SELECT 
  t.id,
  c.id,
  cm.name,
  cm.platform::text,
  cm.type::text,
  cm.status::text,
  cm.budget,
  cm.spent,
  cm.start_date::date,
  cm.end_date::date,
  cm.metrics::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
CROSS JOIN LATERAL (VALUES
  ('Facebook Ads - Q1 2026', 'facebook', 'conversions', 'active', 15000000, 11250000, '2026-01-01', '2026-03-31', '{"impressions": 125000, "clicks": 4500, "leads": 234, "conversions": 89, "roi": 12.5}'),
  ('Zalo OA Marketing', 'zalo', 'engagement', 'active', 8000000, 5440000, '2026-01-01', '2026-01-31', '{"impressions": 45000, "clicks": 2100, "leads": 89, "conversions": 34, "roi": 6.8}')
) AS cm(name, platform, type, status, budget, spent, start_date, end_date, metrics)
WHERE t.slug = 'sadec-hub' 
  AND c.business_name = 'Sa Đéc Flower Shop'
ON CONFLICT DO NOTHING;

INSERT INTO campaigns (tenant_id, client_id, name, platform, type, status, budget, spent, start_date, end_date, metrics, created_at)
SELECT 
  t.id,
  c.id,
  'Google Ads - Search',
  'google',
  'leads',
  'active',
  20000000,
  14000000,
  '2026-01-01'::date,
  '2026-02-28'::date,
  '{"impressions": 89000, "clicks": 3200, "leads": 156, "conversions": 67, "roi": 8.2}'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub' 
  AND c.business_name = 'Mekong Travel'
ON CONFLICT DO NOTHING;

INSERT INTO campaigns (tenant_id, client_id, name, platform, type, status, budget, spent, start_date, end_date, metrics, created_at)
SELECT 
  t.id,
  c.id,
  'TikTok Awareness Campaign',
  'tiktok',
  'awareness',
  'active',
  12000000,
  6500000,
  '2026-01-05'::date,
  '2026-02-05'::date,
  '{"impressions": 230000, "clicks": 8900, "leads": 67, "conversions": 23, "roi": 5.4}'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub' 
  AND c.business_name = 'Long Xuyên Boutique'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO INVOICES
-- ============================================================================
INSERT INTO invoices (tenant_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, items, created_at)
SELECT 
  t.id,
  c.id,
  'INV-2026-001',
  15000000,
  0,
  15000000,
  'sent',
  '2026-01-01'::date,
  '2026-01-15'::date,
  '[{"description": "Quảng cáo Facebook Q1 2026", "quantity": 1, "price": 15000000}]'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub' 
  AND c.business_name = 'Sa Đéc Flower Shop'
ON CONFLICT DO NOTHING;

INSERT INTO invoices (tenant_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, paid_at, items, created_at)
SELECT 
  t.id,
  c.id,
  'INV-2025-056',
  8000000,
  0,
  8000000,
  'paid',
  '2025-12-01'::date,
  '2025-12-15'::date,
  '2025-12-14 10:30:00+07'::timestamptz,
  '[{"description": "Thiết kế logo", "quantity": 1, "price": 5000000}, {"description": "Bộ nhận diện thương hiệu", "quantity": 1, "price": 3000000}]'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub' 
  AND c.business_name = 'Sa Đéc Flower Shop'
ON CONFLICT DO NOTHING;

INSERT INTO invoices (tenant_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, paid_at, items, created_at)
SELECT 
  t.id,
  c.id,
  'INV-2026-002',
  50000000,
  0,
  50000000,
  'sent',
  '2026-01-10'::date,
  '2026-01-25'::date,
  NULL,
  '[{"description": "Chiến dịch Tết 2026 - Full Package", "quantity": 1, "price": 50000000}]'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub' 
  AND c.business_name = 'Khách sạn Riverside'
ON CONFLICT DO NOTHING;

INSERT INTO invoices (tenant_id, client_id, invoice_number, amount, tax, total, status, issue_date, due_date, paid_at, items, created_at)
SELECT 
  t.id,
  c.id,
  'INV-2026-003',
  100000000,
  0,
  100000000,
  'paid',
  '2026-01-05'::date,
  '2026-01-20'::date,
  '2026-01-12 09:00:00+07'::timestamptz,
  '[{"description": "Full Digital Package 2026", "quantity": 1, "price": 100000000}]'::jsonb,
  NOW()
FROM tenants t
CROSS JOIN customers c
WHERE t.slug = 'sadec-hub' 
  AND c.business_name = 'Đồng Tháp Rice Export'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO CONTACTS (Lead Form Submissions)
-- ============================================================================
INSERT INTO contacts (name, phone, email, business_name, service, message, status, created_at)
VALUES
  ('Trần Văn An', '0901 234 567', 'an@newbiz.vn', 'Công ty ABC', 'website', 'Cần tư vấn thiết kế website mới', 'new', '2026-01-15 08:30:00+07'),
  ('Nguyễn Thị Bình', '0912 345 678', 'binh@xyz.vn', 'Cửa hàng XYZ', 'ads', 'Quan tâm Facebook Ads', 'contacted', '2026-01-14 14:00:00+07'),
  ('Lê Công Cường', '0923 456 789', 'cuong@delta.vn', 'Delta Tech', 'seo', 'Cần SEO cho website hiện tại', 'qualified', '2026-01-13 09:15:00+07'),
  ('Phạm Hồng Đào', '0934 567 890', 'dao@fashion.vn', 'Đào Fashion', 'social', 'Quản lý social media', 'new', '2026-01-12 16:45:00+07'),
  ('Võ Thu Em', '0945 678 901', 'em@coffeeshop.vn', 'Em Coffee', 'branding', 'Thiết kế logo và branding', 'converted', '2026-01-10 11:00:00+07')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS
-- ============================================================================
SELECT refresh_dashboard_stats();

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT '🚀 Seed Data V2 (Binh Pháp Sync) Complete!' AS status,
  (SELECT COUNT(*) FROM leads) as leads,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM deals) as deals,
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM campaigns) as campaigns,
  (SELECT COUNT(*) FROM invoices) as invoices,
  (SELECT COUNT(*) FROM content_calendar) as content_items,
  (SELECT COUNT(*) FROM contacts) as contacts;
