-- ============================================================================
-- RLS POLICIES V4 - SECURITY HARDENING
-- Sa Đéc Marketing Hub - Phase 1: Data Isolation
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: USER_PROFILES TABLE
-- Users can only read their own profile, admins can read all
-- ============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users read own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

-- Managers/Admins can view all profiles
CREATE POLICY "Managers read all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.role IN ('super_admin', 'manager')
        )
    );

-- Only super_admin can insert/delete profiles
CREATE POLICY "Super admin manage profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.role = 'super_admin'
        )
    );

-- ============================================================================
-- PART 2: CUSTOMERS TABLE
-- Only managers/admins can view and manage customers
-- ============================================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Managers/Admins can read all customers
CREATE POLICY "Managers read customers" ON customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager', 'content_creator')
        )
    );

-- Managers/Admins can insert customers
CREATE POLICY "Managers insert customers" ON customers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- Managers/Admins can update customers
CREATE POLICY "Managers update customers" ON customers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- Only super_admin can delete customers
CREATE POLICY "Super admin delete customers" ON customers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- ============================================================================
-- PART 3: CONTACTS TABLE (Form Submissions)
-- Only staff can view, anonymous users can insert
-- ============================================================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form (anon insert)
CREATE POLICY "Anyone can submit contact" ON contacts
    FOR INSERT WITH CHECK (true);

-- Only managers/admins can read contacts
CREATE POLICY "Managers read contacts" ON contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager', 'content_creator')
        )
    );

-- Only managers can update contacts
CREATE POLICY "Managers update contacts" ON contacts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- Only super_admin can delete contacts
CREATE POLICY "Super admin delete contacts" ON contacts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- ============================================================================
-- PART 4: SCHEDULED_POSTS TABLE
-- Only staff can manage posts
-- ============================================================================
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Staff can read all posts
CREATE POLICY "Staff read posts" ON scheduled_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager', 'content_creator')
        )
    );

-- Content creators can create posts
CREATE POLICY "Creators insert posts" ON scheduled_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager', 'content_creator')
        )
    );

-- Content creators can update their own posts, managers can update all
CREATE POLICY "Update own posts" ON scheduled_posts
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- Only managers can delete posts
CREATE POLICY "Managers delete posts" ON scheduled_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- ============================================================================
-- PART 5: PUBLIC TABLES (Read-only for all)
-- ============================================================================

-- Testimonials: Public read, admin write
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read testimonials" ON testimonials
    FOR SELECT USING (is_featured = true);

CREATE POLICY "Managers manage testimonials" ON testimonials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- Services: Public read, admin write
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Managers manage services" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- ============================================================================
-- DONE! 🔒
-- ============================================================================
