-- ============================================================================
-- PHASE 7: DATABASE SCHEMA CONSOLIDATION (Refactored)
-- Mekong Marketing Hub - Data Integrity Enhancement
-- 
-- Run in Supabase SQL Editor
-- Optimized for readability and performance
-- ============================================================================

BEGIN;  -- Wrap in transaction for atomicity

-- ============================================================================
-- A. DEPRECATE UNUSED `clients` TABLE
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clients' AND schemaname = 'public') THEN
        COMMENT ON TABLE clients IS 
            'DEPRECATED: App uses customers table. Safe to drop after confirming no data.';
        RAISE NOTICE '✅ Marked clients table as deprecated';
    END IF;
END $$;

-- ============================================================================
-- B. CONTACT → CUSTOMER SYNC TRIGGER
-- Auto-creates customer when contact status → qualified/converted
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_contact_to_customer()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Exit early if not a qualifying status change
    IF NEW.status NOT IN ('qualified', 'converted') THEN
        RETURN NEW;
    END IF;
    
    -- Check for existing customer match (indexed columns)
    PERFORM 1 FROM customers 
    WHERE phone = NEW.phone OR email = NEW.email
    LIMIT 1;
    
    IF NOT FOUND THEN
        INSERT INTO customers (name, phone, email, business_name, source, status, notes, created_at)
        VALUES (
            NEW.name,
            NEW.phone,
            NEW.email,
            NEW.business_name,
            COALESCE(NEW.service, 'website'),
            'new',
            'Auto-converted from contact: ' || COALESCE(NEW.message, ''),
            NOW()
        );
        
        NEW.status := 'converted';
        RAISE NOTICE '✅ Created customer from contact: %', NEW.name;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Recreate trigger (idempotent)
DROP TRIGGER IF EXISTS trigger_sync_contact_to_customer ON contacts;
CREATE TRIGGER trigger_sync_contact_to_customer
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION sync_contact_to_customer();

-- ============================================================================
-- C. FOREIGN KEY CONSTRAINTS (Consolidated)
-- ============================================================================

-- Helper function for safe FK creation
CREATE OR REPLACE FUNCTION add_fk_if_not_exists(
    p_table TEXT,
    p_constraint TEXT,
    p_column TEXT,
    p_ref_table TEXT,
    p_on_delete TEXT DEFAULT 'SET NULL'
) RETURNS VOID 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check both table and constraint existence
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = p_table AND schemaname = 'public')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = p_constraint)
    THEN
        EXECUTE format(
            'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I(id) ON DELETE %s',
            p_table, p_constraint, p_column, p_ref_table, p_on_delete
        );
        RAISE NOTICE '✅ Added FK: % on %', p_constraint, p_table;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ FK %: %', p_constraint, SQLERRM;
END;
$$;

-- Apply FK constraints
SELECT add_fk_if_not_exists('campaigns', 'fk_campaigns_customer', 'client_id', 'customers', 'SET NULL');
SELECT add_fk_if_not_exists('content_calendar', 'fk_content_calendar_creator', 'created_by', 'user_profiles', 'SET NULL');
SELECT add_fk_if_not_exists('invoices', 'fk_invoices_customer', 'client_id', 'customers', 'CASCADE');

-- Cleanup helper function
DROP FUNCTION IF EXISTS add_fk_if_not_exists(TEXT, TEXT, TEXT, TEXT, TEXT);

-- ============================================================================
-- D. UPDATED_AT TRIGGERS (Optimized loop)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Apply triggers to all tables with updated_at column
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT DISTINCT c.table_name 
        FROM information_schema.columns c
        JOIN pg_tables t ON t.tablename = c.table_name AND t.schemaname = 'public'
        WHERE c.column_name = 'updated_at' 
          AND c.table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', tbl);
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I 
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl
        );
    END LOOP;
    RAISE NOTICE '✅ Updated_at triggers applied to all tables';
END $$;

-- ============================================================================
-- E. VERIFICATION
-- ============================================================================

-- Summary report
DO $$
DECLARE
    fk_count INT;
    trigger_count INT;
BEGIN
    SELECT COUNT(*) INTO fk_count FROM pg_constraint WHERE contype = 'f';
    SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers WHERE trigger_schema = 'public';
    
    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE '  PHASE 7 CONSOLIDATION COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE '  FK Constraints: %', fk_count;
    RAISE NOTICE '  Triggers: %', trigger_count;
    RAISE NOTICE '═══════════════════════════════════════';
END $$;

COMMIT;

-- Optional verification queries (uncomment to run):
-- SELECT conname, conrelid::regclass, confrelid::regclass FROM pg_constraint WHERE contype = 'f';
-- SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';
