#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATABASE MIGRATION SCRIPT
 * Sa Đéc Marketing Hub - Phase 4 DevOps Automation
 * 
 * This script executes SQL migration files against Supabase in order.
 * 
 * Usage:
 *   npm run migrate
 *   node database/migrate.js
 * 
 * Environment Variables Required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_KEY - Service role key (NOT anon key)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

// Try to load dotenv if available
try {
    require('dotenv').config({ path: '.env.local' });
} catch (e) {
    // dotenv not installed, use process.env directly
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Migration files in order of execution
const MIGRATION_FILES = [
    'rls_policies_v4.sql',
    'jwt_role_trigger.sql'
];

async function runMigrations() {
    console.log('🚀 Starting database migrations...\n');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('❌ Missing environment variables:');
        console.error('   SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌ Not set');
        console.error('   SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌ Not set');
        console.error('\nSet these in .env.local or as environment variables.');
        console.error('Note: Use SERVICE_KEY, not ANON_KEY for migrations.');
        process.exit(1);
    }

    const databaseDir = path.join(__dirname);
    let successCount = 0;
    let errorCount = 0;

    for (const filename of MIGRATION_FILES) {
        const filePath = path.join(databaseDir, filename);

        if (!fs.existsSync(filePath)) {
            console.log(`⏭️  Skipping ${filename} (file not found)`);
            continue;
        }

        console.log(`📄 Running ${filename}...`);

        try {
            const sql = fs.readFileSync(filePath, 'utf8');

            // Execute SQL via Supabase REST API (pg endpoint)
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                },
                body: JSON.stringify({ query: sql })
            });

            if (response.ok) {
                console.log(`   ✅ ${filename} completed successfully`);
                successCount++;
            } else {
                const error = await response.text();
                console.error(`   ❌ ${filename} failed:`, error);
                errorCount++;
            }
        } catch (error) {
            console.error(`   ❌ ${filename} error:`, error.message);
            errorCount++;
        }
    }

    console.log('\n' + '═'.repeat(50));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('═'.repeat(50));

    if (errorCount > 0) {
        console.log('\n⚠️  Some migrations failed. You may need to run them manually.');
        console.log('   Copy the SQL from database/*.sql and run in Supabase Dashboard.');
        process.exit(1);
    }

    console.log('\n🎉 All migrations completed successfully!');
}

// Alternative: Print SQL for manual execution
function printMigrationSQL() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 MIGRATION SQL - Copy and paste into Supabase SQL Editor');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const databaseDir = path.join(__dirname);

    for (const filename of MIGRATION_FILES) {
        const filePath = path.join(databaseDir, filename);

        if (!fs.existsSync(filePath)) continue;

        console.log(`-- ═══════════════════════════════════════════════════════════`);
        console.log(`-- FILE: ${filename}`);
        console.log(`-- ═══════════════════════════════════════════════════════════\n`);
        console.log(fs.readFileSync(filePath, 'utf8'));
        console.log('\n');
    }
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--print') || args.includes('-p')) {
    printMigrationSQL();
} else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Database Migration Tool - Sa Đéc Marketing Hub

Usage:
  node database/migrate.js          Run migrations against Supabase
  node database/migrate.js --print  Print SQL for manual execution
  node database/migrate.js --help   Show this help

Environment Variables:
  SUPABASE_URL          Your Supabase project URL
  SUPABASE_SERVICE_KEY  Service role key (from Supabase Dashboard > API)
`);
} else {
    runMigrations().catch(console.error);
}
