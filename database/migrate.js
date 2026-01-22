#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATABASE MIGRATION SCRIPT
 * Sa Đéc Marketing Hub - Phase 4 DevOps Automation
 *
 * This script executes SQL migration files against Supabase using the pg client.
 *
 * Usage:
 *   npm run migrate
 *   node database/migrate.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { Client } = require('pg');
const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');

// Configuration Loader
function getDbConfig() {
    let config = {};
    try {
        config = require('../mekong-env');
    } catch (e) {
        // Fallback to process.env if mekong-env not found
        config = { DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING };
    }

    const dbConfig = config.DB_CONNECTION_STRING;

    if (!dbConfig) {
        console.error('❌ Error: DB_CONNECTION_STRING not found in mekong-env.js or process.env');
        console.error('   Please ensure you have configured the environment correctly.');
        process.exit(1);
    }

    return typeof dbConfig === 'string' ? { connectionString: dbConfig } : dbConfig;
}

// Migration files in order of execution
const MIGRATION_FILES = [
    'rls_policies_v4.sql',
    'jwt_role_trigger.sql'
];

async function applyMigration(client, filename, databaseDir) {
    const filePath = path.join(databaseDir, filename);

    if (!existsSync(filePath)) {
        console.log(`⏭️  Skipping ${filename} (file not found)`);
        return 'skipped';
    }

    console.log(`📄 Running ${filename}...`);

    try {
        const sql = await fs.readFile(filePath, 'utf8');
        await client.query(sql);
        console.log(`   ✅ Success\n`);
        return 'success';
    } catch (err) {
        if (err.message.includes('already exists')) {
            console.log(`   ⚠️  Already applied (safe to ignore)\n`);
            return 'success'; // Treat as success for counting purposes
        }
        console.error(`   ❌ Failed: ${err.message}\n`);
        return 'failed';
    }
}

async function runMigrations() {
    console.log('🚀 Starting database migrations...\n');

    const client = new Client(getDbConfig());
    const databaseDir = __dirname;

    let stats = { success: 0, failed: 0, skipped: 0 };

    try {
        console.log('📡 Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected!\n');

        for (const filename of MIGRATION_FILES) {
            const result = await applyMigration(client, filename, databaseDir);
            stats[result]++;
        }

        console.log('═'.repeat(50));
        console.log(`✅ Successful: ${stats.success}`);
        console.log(`❌ Failed:     ${stats.failed}`);
        console.log(`⏭️  Skipped:    ${stats.skipped}`);
        console.log('═'.repeat(50));

        if (stats.failed > 0) {
            throw new Error('Some migrations failed.');
        }

        console.log('\n🎉 All migrations completed successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check DATABASE_URL and credentials');
        console.log('2. Ensure your IP is allowed in Supabase Dashboard');
        process.exit(1);
    } finally {
        await client.end();
    }
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Database Migration Tool - Sa Đéc Marketing Hub

Usage:
  node database/migrate.js          Run migrations against Supabase
  node database/migrate.js --help   Show this help
`);
} else {
    runMigrations().catch(console.error);
}
