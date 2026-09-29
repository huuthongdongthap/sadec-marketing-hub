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
        return 'skipped';
    }

    try {
        const sql = await fs.readFile(filePath, 'utf8');
        await client.query(sql);
        return 'success';
    } catch (err) {
        if (err.message.includes('already exists')) {
            return 'success';
        }
        return 'failed';
    }
}

async function runMigrations() {
    const client = new Client(getDbConfig());
    const databaseDir = __dirname;

    let stats = { success: 0, failed: 0, skipped: 0 };

    try {
        await client.connect();

        for (const filename of MIGRATION_FILES) {
            const result = await applyMigration(client, filename, databaseDir);
            stats[result]++;
        }

        if (stats.failed > 0) {
            throw new Error('Some migrations failed.');
        }

    } catch (err) {
        process.exit(1);
    } finally {
        await client.end();
    }
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    } else {
    runMigrations().catch(console.error);
}
