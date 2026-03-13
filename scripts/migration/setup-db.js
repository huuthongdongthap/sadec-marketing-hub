/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUPABASE DATABASE RESET & SETUP
 * Sa Đéc Marketing Hub
 *
 * WARNING: This script DROPS all tables and re-initializes the database.
 * Use with caution!
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load config from environment variables
const connectionString = process.env.DB_CONNECTION_STRING || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ ERROR: DB_CONNECTION_STRING or DATABASE_URL environment variable is required');
    console.error('   Set it via: export DB_CONNECTION_STRING="postgresql://..."');
    process.exit(1);
}

async function main() {

    const client = new Client({ connectionString });

    try {
        await client.connect();

        // Drop existing tables in correct order (respect foreign keys)
        const dropQuery = `
            DROP TABLE IF EXISTS activities CASCADE;
            DROP TABLE IF EXISTS invoices CASCADE;
            DROP TABLE IF EXISTS campaigns CASCADE;
            DROP TABLE IF EXISTS projects CASCADE;
            DROP TABLE IF EXISTS clients CASCADE;
            DROP TABLE IF EXISTS customers CASCADE;
            DROP TABLE IF EXISTS leads CASCADE;
            DROP TABLE IF EXISTS contacts CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS tenants CASCADE;
            DROP TABLE IF EXISTS audit_log CASCADE;
            DROP TABLE IF EXISTS deals CASCADE;
            DROP TABLE IF EXISTS content_calendar CASCADE;
            DROP TABLE IF EXISTS scheduled_posts CASCADE;
            DROP TABLE IF EXISTS budget_tracking CASCADE;
            DROP TABLE IF EXISTS notifications CASCADE;
            DROP TABLE IF EXISTS user_profiles CASCADE;
            DROP TABLE IF EXISTS win3_snapshots CASCADE;
            DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_stats CASCADE;
            DROP MATERIALIZED VIEW IF EXISTS mv_monthly_revenue CASCADE;
        `;
        await client.query(dropQuery);

        // Run schema
        try {
            const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
            await client.query(schemaSQL);
        } catch (e) {
        }

        // Run seed
        try {
            const seedSQL = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
            await client.query(seedSQL);
        } catch (e) {
        }

        // Verify data

        // Helper to safely count tables that might exist
        const safeCount = async (table) => {
            try {
                const res = await client.query(`SELECT count(*) FROM ${table}`);
                return res.rows[0].count;
            } catch (e) {
                return 'N/A';
            }
        };

        const tenants = await safeCount('tenants');
        const leads = await safeCount('leads');
        const customers = await safeCount('customers');
        const projects = await safeCount('projects');
        const campaigns = await safeCount('campaigns');

    } catch (err) {
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
