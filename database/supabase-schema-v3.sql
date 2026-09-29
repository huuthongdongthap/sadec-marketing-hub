-- ============================================================================
-- SUPABASE SCHEMA V3 - CLIENT PORTAL FEATURES
-- Projects & Invoices for Client Self-Service
-- Chạy trong Supabase Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    package TEXT, -- 'Starter', 'Growth', 'Premium'
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    end_date DATE,
    milestones JSONB DEFAULT '[]', -- Array of {name, completed, date}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL, -- 'INV-001', 'INV-002'
    client_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    amount DECIMAL(12, 0) NOT NULL, -- VNĐ
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
    due_date DATE,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 3: INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date);

-- ============================================================================
-- PART 4: ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Clients can only see their own projects
CREATE POLICY "Clients read own projects" ON projects
    FOR SELECT USING (client_id = auth.uid());

-- Managers/Admins can see all projects
CREATE POLICY "Managers read all projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- Managers/Admins can insert/update projects
CREATE POLICY "Managers manage projects" ON projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- Clients can only see their own invoices
CREATE POLICY "Clients read own invoices" ON invoices
    FOR SELECT USING (client_id = auth.uid());

-- Clients can update their own invoices (for marking paid)
CREATE POLICY "Clients update own invoices" ON invoices
    FOR UPDATE USING (client_id = auth.uid());

-- Managers/Admins can manage all invoices
CREATE POLICY "Managers manage invoices" ON invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- ============================================================================
-- PART 5: TRIGGERS
-- ============================================================================
CREATE TRIGGER projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- PART 6: SAMPLE DATA
-- ============================================================================
-- Note: Replace 'YOUR_CLIENT_USER_ID' with actual user_profiles.id after creating users

-- Sample projects (use placeholder IDs, update after user creation)
-- INSERT INTO projects (client_id, name, package, status, progress, start_date, end_date, milestones) VALUES
-- ('YOUR_CLIENT_USER_ID', 'Thiết kế Logo + Bộ nhận diện', 'Standard', 'active', 75, '2024-12-01', '2025-01-15', '[{"name": "Khảo sát", "completed": true}, {"name": "Thiết kế", "completed": true}, {"name": "Chỉnh sửa", "completed": false}]'),
-- ('YOUR_CLIENT_USER_ID', 'Quản lý Fanpage 3 tháng', 'Premium', 'active', 55, '2024-12-15', '2025-03-15', '[{"name": "Setup", "completed": true}, {"name": "Tháng 1", "completed": false}]');

-- Sample invoices
-- INSERT INTO invoices (invoice_number, client_id, project_id, amount, status, due_date) VALUES
-- ('INV-2024-001', 'YOUR_CLIENT_USER_ID', NULL, 8000000, 'paid', '2024-12-15'),
-- ('INV-2024-002', 'YOUR_CLIENT_USER_ID', NULL, 5000000, 'pending', '2025-01-15');

-- ============================================================================
-- DONE! 🎉
-- ============================================================================
