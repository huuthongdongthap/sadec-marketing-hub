#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MEKONG CLI - PUSH TEST DATA
 * Sa Đéc Marketing Hub
 *
 * Utilities to view status and push specific test data to Supabase.
 * Usage: node push-data.js [command]
 * Commands: status, leads, campaigns, clients, add-lead, all
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { Client } = require('pg');
const config = require('./mekong-env');

const connectionString = config.DB_CONNECTION_STRING;

// ============================================================================
// Database Utility
// ============================================================================

async function withClient(callback) {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        return await callback(client);
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// ============================================================================
// Command Handlers
// ============================================================================

const commands = {
    async status(client) {
        console.log('\n📊 Database Status');
        console.log('==================');

        const safeCount = (table) => `(SELECT count(*) FROM ${table})`;

        try {
            const result = await client.query(`
                SELECT
                    ${safeCount('tenants')} as tenants,
                    ${safeCount('leads')} as leads,
                    ${safeCount('customers')} as customers,
                    ${safeCount('projects')} as projects,
                    ${safeCount('campaigns')} as campaigns,
                    ${safeCount('invoices')} as invoices
            `);
            if (result.rows.length > 0) {
                console.table(result.rows[0]);
            }
        } catch (e) {
            console.log('⚠️  Could not fetch full status (tables might be missing).');
            console.log('   Error:', e.message);
        }
    },

    async leads(client) {
        console.log('\n👤 Leads (Top 10 by Score)');
        console.log('==========================');

        try {
            const result = await client.query(`
                SELECT name, company, status, temperature, score
                FROM leads
                ORDER BY score DESC
                LIMIT 10
            `);

            if (result.rows.length === 0) {
                console.log('No leads found.');
                return;
            }

            const formatted = result.rows.map(row => ({
                Name: row.name,
                Company: row.company,
                Status: row.status,
                Temp: { hot: '🔥', warm: '🌡️', cold: '❄️' }[row.temperature] || '⚪',
                Score: row.score
            }));

            console.table(formatted);
        } catch (e) {
            console.log('⚠️  Could not fetch leads:', e.message);
        }
    },

    async campaigns(client) {
        console.log('\n📢 Campaigns (Recent)');
        console.log('=====================');

        try {
            const result = await client.query(`
                SELECT name, platform, status, budget, spent, metrics
                FROM campaigns
                ORDER BY created_at DESC
                LIMIT 10
            `);

            if (result.rows.length === 0) {
                console.log('No campaigns found.');
                return;
            }

            const formatted = result.rows.map(row => ({
                Name: row.name,
                Platform: ({ facebook: '📘', google: '🔍', zalo: '💬', tiktok: '🎵' }[row.platform] || '📊') + ' ' + row.platform,
                Status: row.status,
                Budget: `${(row.budget / 1000000).toFixed(1)}M`,
                Spent: `${(row.spent / 1000000).toFixed(1)}M`,
                ROI: (row.metrics?.roi || 0) + 'x'
            }));

            console.table(formatted);
        } catch (e) {
            console.log('⚠️  Could not fetch campaigns:', e.message);
        }
    },

    async clients(client) {
        console.log('\n🏢 Customers/Clients (Recent)');
        console.log('=============================');

        try {
            const result = await client.query(`
                SELECT business_name, name as contact, source, status
                FROM customers
                ORDER BY created_at DESC
                LIMIT 10
            `);

            if (result.rows.length === 0) {
                console.log('No customers found.');
                return;
            }

            console.table(result.rows);
        } catch (e) {
            console.log('⚠️  Could not fetch customers:', e.message);
        }
    },

    async 'add-lead'(client, args) {
        const [name, company, email, phone, source] = args;

        if (!name || !company || !email) {
            console.error('❌ Error: Missing required arguments.');
            console.log('Usage: node push-data.js add-lead "Name" "Company" "email@example.com" [phone] [source]');
            return;
        }

        console.log('➕ Adding new lead...');

        try {
            const tenant = await client.query(`SELECT id FROM tenants WHERE slug = 'sadec-hub'`);
            if (!tenant.rows[0]) {
                throw new Error("Tenant 'sadec-hub' not found. Please run setup-db.js first.");
            }

            await client.query(`
                INSERT INTO leads (tenant_id, name, company, email, phone, source, status, temperature, score)
                VALUES ($1, $2, $3, $4, $5, $6, 'new', 'warm', 50)
            `, [tenant.rows[0].id, name, company, email, phone || null, source || 'manual']);

            console.log(`✅ Lead added successfully: ${name} (${company})`);

        } catch (err) {
            console.error('❌ Failed to add lead:', err.message);
        }
    },

    async all(client) {
        await this.status(client);
        // Run detailed queries in parallel for better performance
        await Promise.all([
            this.leads(client),
            this.campaigns(client),
            this.clients(client)
        ]);
    }
};

// ============================================================================
// Main
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    const commandName = args[0] || 'status';
    const commandArgs = args.slice(1);

    if (!commands[commandName]) {
        console.log(`❌ Unknown command: ${commandName}`);
        console.log('Available commands:', Object.keys(commands).join(', '));
        process.exit(1);
    }

    console.log('🔌 Connecting to Supabase...');

    await withClient(async (client) => {
        console.log('✅ Connected!');
        await commands[commandName](client, commandArgs);
    });

    console.log('\n✨ Done!');
}

main().catch(err => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
});
