-- ============================================================================
-- CLEAN ORPHANED DATA + APPLY FK CONSTRAINTS (V2)
-- Separates cleanup and constraint creation into distinct phases
-- ============================================================================

-- ========== PHASE 1: DROP ALL EXISTING FK CONSTRAINTS ==========
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_project_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_project_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoices_project;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS fk_projects_client;
ALTER TABLE scheduled_posts DROP CONSTRAINT IF EXISTS scheduled_posts_created_by_fkey;
ALTER TABLE scheduled_posts DROP CONSTRAINT IF EXISTS fk_posts_created_by;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_assigned_to_fkey;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS fk_customers_assigned_to;

-- ========== PHASE 2: CLEAN ORPHANED DATA ==========

-- Clean campaigns -> projects
DELETE FROM campaigns 
WHERE project_id IS NOT NULL 
AND project_id NOT IN (SELECT id FROM projects);

-- Clean invoices -> projects  
DELETE FROM invoices 
WHERE project_id IS NOT NULL 
AND project_id NOT IN (SELECT id FROM projects);

-- Clean projects -> customers
DELETE FROM projects 
WHERE client_id IS NOT NULL 
AND client_id NOT IN (SELECT id FROM customers);

-- Clean scheduled_posts -> user_profiles
DELETE FROM scheduled_posts 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM user_profiles);

-- Fix customers -> user_profiles (SET NULL instead of DELETE)
UPDATE customers 
SET assigned_to = NULL 
WHERE assigned_to IS NOT NULL 
AND assigned_to NOT IN (SELECT id FROM user_profiles);

-- ========== PHASE 3: APPLY NEW FK CONSTRAINTS ==========

-- CUSTOMERS -> USER_PROFILES
ALTER TABLE customers
ADD CONSTRAINT fk_customers_assigned_to
FOREIGN KEY (assigned_to) REFERENCES user_profiles(id)
ON DELETE SET NULL;

-- INVOICES -> PROJECTS
ALTER TABLE invoices
ADD CONSTRAINT fk_invoices_project
FOREIGN KEY (project_id) REFERENCES projects(id)
ON DELETE CASCADE;

-- PROJECTS -> CUSTOMERS
ALTER TABLE projects
ADD CONSTRAINT fk_projects_client
FOREIGN KEY (client_id) REFERENCES customers(id)
ON DELETE CASCADE;

-- SCHEDULED_POSTS -> USER_PROFILES
ALTER TABLE scheduled_posts
ADD CONSTRAINT fk_posts_created_by
FOREIGN KEY (created_by) REFERENCES user_profiles(id)
ON DELETE SET NULL;

-- ============================================================================
-- Verification: SELECT conname FROM pg_constraint WHERE contype = 'f';
-- ============================================================================
