-- ============================================================================
-- RLS POLICIES V5 - COMPLETE COVERAGE
-- Additional policies for campaigns, invoices, projects, and other tables
-- Run in Supabase SQL Editor
-- ============================================================================

-- Enable RLS on additional tables
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS deals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CAMPAIGNS - Marketing team and admins
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "campaigns_select_all" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_staff" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_staff" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_admin" ON campaigns;

-- Anyone authenticated can view campaigns
CREATE POLICY "campaigns_select_all" ON campaigns
    FOR SELECT TO authenticated
    USING (true);

-- Staff can create campaigns
CREATE POLICY "campaigns_insert_staff" ON campaigns
    FOR INSERT TO authenticated
    WITH CHECK (
        (auth.jwt() ->> 'role') IN ('super_admin', 'manager', 'content_creator')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager', 'content_creator')
    );

-- Staff can update campaigns
CREATE POLICY "campaigns_update_staff" ON campaigns
    FOR UPDATE TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'manager', 'content_creator')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager', 'content_creator')
    );

-- Only admin can delete campaigns
CREATE POLICY "campaigns_delete_admin" ON campaigns
    FOR DELETE TO authenticated
    USING (
        (auth.jwt() ->> 'role') = 'super_admin'
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- ============================================================================
-- INVOICES - Clients see their own, staff see all
-- ============================================================================

DROP POLICY IF EXISTS "invoices_select_own_or_staff" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_staff" ON invoices;
DROP POLICY IF EXISTS "invoices_update_staff" ON invoices;
DROP POLICY IF EXISTS "invoices_delete_admin" ON invoices;

-- Clients see their own invoices, staff see all
CREATE POLICY "invoices_select_own_or_staff" ON invoices
    FOR SELECT TO authenticated
    USING (
        client_id = auth.uid()
        OR (auth.jwt() ->> 'role') IN ('super_admin', 'manager')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager')
    );

-- Staff can create invoices
CREATE POLICY "invoices_insert_staff" ON invoices
    FOR INSERT TO authenticated
    WITH CHECK (
        (auth.jwt() ->> 'role') IN ('super_admin', 'manager')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager')
    );

-- Staff can update invoices
CREATE POLICY "invoices_update_staff" ON invoices
    FOR UPDATE TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'manager')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager')
    );

-- Only admin can delete invoices
CREATE POLICY "invoices_delete_admin" ON invoices
    FOR DELETE TO authenticated
    USING (
        (auth.jwt() ->> 'role') = 'super_admin'
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- ============================================================================
-- PROJECTS - Clients see their own, staff see all
-- ============================================================================

DROP POLICY IF EXISTS "projects_select_own_or_staff" ON projects;
DROP POLICY IF EXISTS "projects_insert_staff" ON projects;
DROP POLICY IF EXISTS "projects_update_staff" ON projects;
DROP POLICY IF EXISTS "projects_delete_admin" ON projects;

-- Clients see their own projects, staff see all
CREATE POLICY "projects_select_own_or_staff" ON projects
    FOR SELECT TO authenticated
    USING (
        client_id = auth.uid()
        OR (auth.jwt() ->> 'role') IN ('super_admin', 'manager', 'content_creator')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager', 'content_creator')
    );

-- Staff can create projects
CREATE POLICY "projects_insert_staff" ON projects
    FOR INSERT TO authenticated
    WITH CHECK (
        (auth.jwt() ->> 'role') IN ('super_admin', 'manager')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager')
    );

-- Staff can update projects  
CREATE POLICY "projects_update_staff" ON projects
    FOR UPDATE TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'manager', 'content_creator')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager', 'content_creator')
    );

-- Only admin can delete projects
CREATE POLICY "projects_delete_admin" ON projects
    FOR DELETE TO authenticated
    USING (
        (auth.jwt() ->> 'role') = 'super_admin'
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- ============================================================================
-- DEALS - Sales team and admins
-- ============================================================================

DROP POLICY IF EXISTS "deals_select_staff" ON deals;
DROP POLICY IF EXISTS "deals_insert_staff" ON deals;
DROP POLICY IF EXISTS "deals_update_staff" ON deals;
DROP POLICY IF EXISTS "deals_delete_admin" ON deals;

-- Staff can view deals
CREATE POLICY "deals_select_staff" ON deals
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'manager')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager')
    );

-- Staff can create deals
CREATE POLICY "deals_insert_staff" ON deals
    FOR INSERT TO authenticated
    WITH CHECK (
        (auth.jwt() ->> 'role') IN ('super_admin', 'manager')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager')
    );

-- Staff can update deals
CREATE POLICY "deals_update_staff" ON deals
    FOR UPDATE TO authenticated
    USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'manager')
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'manager')
    );

-- Only admin can delete deals
CREATE POLICY "deals_delete_admin" ON deals
    FOR DELETE TO authenticated
    USING (
        (auth.jwt() ->> 'role') = 'super_admin'
        OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- ============================================================================
-- Verification: Check RLS is enabled
-- ============================================================================
-- Run: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
