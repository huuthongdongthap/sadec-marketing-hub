/**
 * Supabase Database Reset & Setup
 * Drops all tables and runs fresh schema + seed
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
        await client.query(`
            DROP TABLE IF EXISTS activities CASCADE;
            DROP TABLE IF EXISTS invoices CASCADE;
            DROP TABLE IF EXISTS campaigns CASCADE;
            DROP TABLE IF EXISTS projects CASCADE;
            DROP TABLE IF EXISTS clients CASCADE;
            DROP TABLE IF EXISTS leads CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS tenants CASCADE;
        `);
        console.log('✅ Tables dropped');
        console.log('');

        // Run schema
        console.log('📋 Running schema.sql...');
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
        await client.query(schemaSQL);
        console.log('✅ Schema created');

        // Run seed
        console.log('🌱 Running seed.sql...');
        const seedSQL = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
        await client.query(seedSQL);
        console.log('✅ Demo data inserted');

        // Verify data
        console.log('');
        console.log('📊 Verifying data...');

        const counts = await client.query(`
            SELECT 
                (SELECT count(*) FROM tenants) as tenants,
                (SELECT count(*) FROM leads) as leads,
                (SELECT count(*) FROM clients) as clients,
                (SELECT count(*) FROM projects) as projects,
                (SELECT count(*) FROM campaigns) as campaigns,
                (SELECT count(*) FROM invoices) as invoices
        `);

        const row = counts.rows[0];
        console.log('');
        console.log('✨ Database setup complete!');
        console.log('');
        console.log('📦 Data created:');
        console.log(`   • Tenants: ${row.tenants}`);
        console.log(`   • Leads: ${row.leads}`);
        console.log(`   • Clients: ${row.clients}`);
        console.log(`   • Projects: ${row.projects}`);
        console.log(`   • Campaigns: ${row.campaigns}`);
        console.log(`   • Invoices: ${row.invoices}`);
        console.log('');
        console.log('🎉 Ready to test!');
        console.log('   1. Go to /register.html to create an account');
        console.log('   2. Login and see live data from Supabase!');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
