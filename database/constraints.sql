-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- Ensures data integrity across related tables
-- Run in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- CUSTOMERS -> USER_PROFILES (assigned_to)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customers_assigned_to'
    ) THEN
        ALTER TABLE customers
        ADD CONSTRAINT fk_customers_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES user_profiles(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- INVOICES -> PROJECTS
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_invoices_project'
    ) THEN
        ALTER TABLE invoices
        ADD CONSTRAINT fk_invoices_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- PROJECTS -> CUSTOMERS (client relationship)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_projects_client'
    ) THEN
        ALTER TABLE projects
        ADD CONSTRAINT fk_projects_client
        FOREIGN KEY (client_id) REFERENCES customers(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- SCHEDULED_POSTS -> USER_PROFILES (created_by)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_posts_created_by'
    ) THEN
        ALTER TABLE scheduled_posts
        ADD CONSTRAINT fk_posts_created_by
        FOREIGN KEY (created_by) REFERENCES user_profiles(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- DEALS -> CUSTOMERS
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_deals_customer'
    ) THEN
        ALTER TABLE deals
        ADD CONSTRAINT fk_deals_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- CAMPAIGNS -> CUSTOMERS (client_id)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_campaigns_customer'
    ) THEN
        ALTER TABLE campaigns
        ADD CONSTRAINT fk_campaigns_customer
        FOREIGN KEY (client_id) REFERENCES customers(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'fk_campaigns_customer skipped: %', SQLERRM;
END $$;

-- ============================================================================
-- CONTENT_CALENDAR -> USER_PROFILES (created_by)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_content_calendar_creator'
    ) THEN
        ALTER TABLE content_calendar
        ADD CONSTRAINT fk_content_calendar_creator
        FOREIGN KEY (created_by) REFERENCES user_profiles(id)
        ON DELETE SET NULL;
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'fk_content_calendar_creator skipped: %', SQLERRM;
END $$;

-- ============================================================================
-- INVOICES -> CUSTOMERS (client_id) 
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_invoices_customer'
    ) THEN
        ALTER TABLE invoices
        ADD CONSTRAINT fk_invoices_customer
        FOREIGN KEY (client_id) REFERENCES customers(id)
        ON DELETE CASCADE;
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'fk_invoices_customer skipped: %', SQLERRM;
END $$;

-- ============================================================================
-- Verification: List all foreign keys
-- ============================================================================
-- Run: SELECT conname, conrelid::regclass, confrelid::regclass 
--      FROM pg_constraint WHERE contype = 'f';
