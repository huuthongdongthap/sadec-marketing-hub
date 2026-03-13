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
        }
    },

    async leads(client) {

        try {
            const result = await client.query(`
                SELECT name, company, status, temperature, score
                FROM leads
                ORDER BY score DESC
                LIMIT 10
            `);

            if (result.rows.length === 0) {
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
        }
    },

    async campaigns(client) {

        try {
            const result = await client.query(`
                SELECT name, platform, status, budget, spent, metrics
                FROM campaigns
                ORDER BY created_at DESC
                LIMIT 10
            `);

            if (result.rows.length === 0) {
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
        }
    },

    async clients(client) {

        try {
            const result = await client.query(`
                SELECT business_name, name as contact, source, status
                FROM customers
                ORDER BY created_at DESC
                LIMIT 10
            `);

            if (result.rows.length === 0) {
                return;
            }

            console.table(result.rows);
        } catch (e) {
        }
    },

    async 'add-lead'(client, args) {
        const [name, company, email, phone, source] = args;

        if (!name || !company || !email) {
            return;
        }

        try {
            const tenant = await client.query(`SELECT id FROM tenants WHERE slug = 'sadec-hub'`);
            if (!tenant.rows[0]) {
                throw new Error("Tenant 'sadec-hub' not found. Please run setup-db.js first.");
            }

            await client.query(`
                INSERT INTO leads (tenant_id, name, company, email, phone, source, status, temperature, score)
                VALUES ($1, $2, $3, $4, $5, $6, 'new', 'warm', 50)
            `, [tenant.rows[0].id, name, company, email, phone || null, source || 'manual']);

        } catch (err) {
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
        process.exit(1);
    }

    await withClient(async (client) => {
        await commands[commandName](client, commandArgs);
    });

}

main().catch(err => {
    process.exit(1);
});
