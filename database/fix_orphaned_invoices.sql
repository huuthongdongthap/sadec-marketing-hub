-- ============================================================================
-- FIX ORPHANED INVOICES - Direct approach
-- Run in Supabase SQL Editor or via pg
-- ============================================================================

-- Step 1: Check for orphaned invoices
SELECT id, project_id FROM invoices 
WHERE project_id IS NOT NULL 
AND project_id NOT IN (SELECT id FROM projects);

-- Step 2: Option A - Delete orphaned invoices
DELETE FROM invoices 
WHERE project_id IS NOT NULL 
AND project_id NOT IN (SELECT id FROM projects);

-- Step 2: Option B - Set project_id to NULL for orphaned invoices
-- UPDATE invoices SET project_id = NULL 
-- WHERE project_id IS NOT NULL 
-- AND project_id NOT IN (SELECT id FROM projects);

-- Step 3: Verify no orphans remain
SELECT COUNT(*) as orphaned_invoices FROM invoices 
WHERE project_id IS NOT NULL 
AND project_id NOT IN (SELECT id FROM projects);
