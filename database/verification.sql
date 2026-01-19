-- ============================================================================
-- DATABASE VERIFICATION SCRIPT
-- Mekong Marketing Hub - Post-Migration Validation
-- 
-- Run this AFTER phase8_ultimate.sql and rls_unified.sql
-- ============================================================================

\echo '============================================'
\echo '  MEKONG DATABASE VERIFICATION REPORT'
\echo '============================================'
\echo ''

-- ============================================================================
-- 1. TABLE STRUCTURE VERIFICATION
-- ============================================================================

\echo '📋 [1/7] TABLE STRUCTURE'
\echo '------------------------'

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'clients' THEN '❌ DEPRECATED (should be removed)'
        ELSE '✅ OK'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- 2. SOFT DELETE COLUMNS
-- ============================================================================

\echo ''
\echo '🗑️ [2/7] SOFT DELETE COLUMNS'
\echo '----------------------------'

SELECT 
    c.table_name,
    CASE 
        WHEN c.column_name IS NOT NULL THEN '✅ Has deleted_at'
        ELSE '⚠️ Missing'
    END as soft_delete_status
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name AND c.column_name = 'deleted_at'
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
  AND t.table_name IN ('customers', 'contacts', 'projects', 'invoices', 'campaigns', 'deals', 'content_calendar', 'leads')
ORDER BY t.table_name;

-- ============================================================================
-- 3. ROW LEVEL SECURITY STATUS
-- ============================================================================

\echo ''
\echo '🔒 [3/7] ROW LEVEL SECURITY'
\echo '---------------------------'

SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'mv_%'
ORDER BY tablename;

-- ============================================================================
-- 4. RLS POLICIES COUNT
-- ============================================================================

\echo ''
\echo '📜 [4/7] RLS POLICIES PER TABLE'
\echo '--------------------------------'

SELECT 
    tablename,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ' ORDER BY policyname) as policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 5. FOREIGN KEY CONSTRAINTS
-- ============================================================================

\echo ''
\echo '🔗 [5/7] FOREIGN KEY CONSTRAINTS'
\echo '---------------------------------'

SELECT 
    conname as constraint_name,
    conrelid::regclass as from_table,
    confrelid::regclass as to_table,
    CASE confdeltype 
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'a' THEN 'NO ACTION'
        ELSE confdeltype::text
    END as on_delete
FROM pg_constraint 
WHERE contype = 'f'
ORDER BY conname;

-- ============================================================================
-- 6. AUDIT LOGGING VERIFICATION
-- ============================================================================

\echo ''
\echo '📝 [6/7] AUDIT LOGGING'
\echo '----------------------'

-- Check audit_log table exists
SELECT 
    'audit_log table' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log')
        THEN '✅ Exists'
        ELSE '❌ Missing'
    END as status;

-- Check audit triggers
SELECT 
    trigger_name,
    event_object_table as table_name,
    '✅ Applied' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'audit_trigger_%'
ORDER BY event_object_table;

-- Count entries
SELECT 
    'Total audit entries' as metric,
    COUNT(*)::text as value
FROM audit_log;

-- ============================================================================
-- 7. MATERIALIZED VIEWS & INDEXES
-- ============================================================================

\echo ''
\echo '📊 [7/7] MATERIALIZED VIEWS & KEY INDEXES'
\echo '------------------------------------------'

-- Materialized views
SELECT 
    matviewname as view_name,
    '✅ Exists' as status
FROM pg_matviews 
WHERE schemaname = 'public';

-- Key indexes
SELECT 
    indexname,
    tablename,
    CASE 
        WHEN indexname LIKE 'idx_%' THEN '✅ Custom Index'
        ELSE '📌 System/PK Index'
    END as type
FROM pg_indexes 
WHERE schemaname = 'public'
  AND (indexname LIKE 'idx_%' OR indexname LIKE '%_pkey')
ORDER BY tablename, indexname
LIMIT 30;

-- ============================================================================
-- SUMMARY
-- ============================================================================

\echo ''
\echo '============================================'
\echo '  VERIFICATION SUMMARY'
\echo '============================================'

SELECT * FROM db_health_check();

\echo ''
\echo '✨ Verification complete!'
\echo ''
