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
