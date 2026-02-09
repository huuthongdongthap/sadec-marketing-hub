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
const config = require('./mekong-env');

const connectionString = config.DB_CONNECTION_STRING;

async function main() {
    console.log('🚀 Supabase Database Reset & Setup');
    console.log('===================================');
    console.log('');

    const client = new Client({ connectionString });

    try {
        console.log('🔌 Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected!');
        console.log('');

        // Drop existing tables in correct order (respect foreign keys)
        console.log('🗑️  Dropping existing tables...');
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
        console.log('✅ Tables dropped');
        console.log('');

        // Run schema
        console.log('📋 Running schema.sql...');
        try {
            const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
            await client.query(schemaSQL);
            console.log('✅ Schema created');
        } catch (e) {
            console.warn('⚠️  Could not run schema.sql (file might be missing or empty)');
        }

        // Run seed
        console.log('🌱 Running seed.sql...');
        try {
            const seedSQL = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
            await client.query(seedSQL);
            console.log('✅ Base seed data inserted');
        } catch (e) {
            console.warn('⚠️  Could not run seed.sql');
        }

        // Verify data
        console.log('');
        console.log('📊 Verifying data...');

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

        console.log('');
        console.log('✨ Database setup complete!');
        console.log('');
        console.log('📦 Data created:');
        console.log(`   • Tenants:   ${tenants}`);
        console.log(`   • Leads:     ${leads}`);
        console.log(`   • Customers: ${customers}`);
        console.log(`   • Projects:  ${projects}`);
        console.log(`   • Campaigns: ${campaigns}`);
        console.log('');
        console.log('🎉 Ready to test!');
        console.log('   1. Run "npm run migrate:run" to apply Phase 8 Ultimate & Sync');
        console.log('   2. Go to /register.html to create an account');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
