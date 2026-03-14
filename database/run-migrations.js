#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUPABASE DIRECT MIGRATION RUNNER
 * Sa Đéc Marketing Hub
 *
 * Executes SQL directly against Supabase PostgreSQL using pg library.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../mekong-env');

// Configuration
const CONFIG = {
    connectionString: config.DB_CONNECTION_STRING,
    migrations: [
        'phase8_ultimate.sql',
        'rls_unified.sql',
        'binh-phap-sync.sql',
        'seed_v2.sql',
        'verification.sql',
        'lead_triggers.sql',
        'zalo_messages.sql',
        'client_reports.sql',
        'landing_pages.sql'
    ]
};

/**
 * Main Runner
 */
async function runMigrations() {
    const client = new Client({
        connectionString: CONFIG.connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        for (const filename of CONFIG.migrations) {
            await runMigrationFile(client, filename);
        }

    } catch (err) {
        process.exit(1);
    } finally {
        await client.end();
    }
}

/**
 * Execute a single migration file
 */
async function runMigrationFile(client, filename) {
    const filePath = path.join(__dirname, filename);

    if (!fs.existsSync(filePath)) {
        return;
    }

    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
    } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('already a partition')) {
            // Already applied - safe to ignore
        }
    }
}

// Execute if run directly
if (require.main === module) {
    runMigrations().catch(console.error);
}
