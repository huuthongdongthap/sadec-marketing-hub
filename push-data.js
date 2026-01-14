#!/usr/bin/env node
/**
 * Mekong CLI - Push Test Data to Supabase
 * Usage: node push-data.js [command]
 * Commands: status, leads, campaigns, clients, all
 */

const { Client } = require('pg');

const connectionString = 'postgresql://postgres:TtmData2026%40@db.pzcgvfhppglzfjavxuid.supabase.co:5432/postgres';

async function getClient() {
    const client = new Client({ connectionString });
    await client.connect();
    return client;
}

// Show database status
async function showStatus(client) {
    console.log('📊 Database Status');
    console.log('==================');

    const result = await client.query(`
        SELECT 
            (SELECT count(*) FROM tenants) as tenants,
            (SELECT count(*) FROM leads) as leads,
            (SELECT count(*) FROM clients) as clients,
            (SELECT count(*) FROM projects) as projects,
            (SELECT count(*) FROM campaigns) as campaigns,
            (SELECT count(*) FROM invoices) as invoices,
            (SELECT count(*) FROM activities) as activities
    `);

    const row = result.rows[0];
    console.log(`   Tenants:    ${row.tenants}`);
    console.log(`   Leads:      ${row.leads}`);
    console.log(`   Clients:    ${row.clients}`);
    console.log(`   Projects:   ${row.projects}`);
    console.log(`   Campaigns:  ${row.campaigns}`);
    console.log(`   Invoices:   ${row.invoices}`);
    console.log(`   Activities: ${row.activities}`);
}

// Show leads
async function showLeads(client) {
    console.log('👤 Leads');
    console.log('========');

    const result = await client.query(`
        SELECT name, company, status, temperature, score 
        FROM leads 
        ORDER BY score DESC
    `);

    result.rows.forEach((lead, i) => {
        const tempEmoji = { hot: '🔥', warm: '🌡️', cold: '❄️' }[lead.temperature] || '⚪';
        console.log(`   ${i + 1}. ${lead.name} (${lead.company})`);
        console.log(`      Status: ${lead.status} | ${tempEmoji} ${lead.temperature} | Score: ${lead.score}`);
    });
}

// Show campaigns
async function showCampaigns(client) {
    console.log('📢 Campaigns');
    console.log('============');

    const result = await client.query(`
        SELECT c.name, c.platform, c.status, c.budget, c.spent, c.metrics
        FROM campaigns c
        ORDER BY c.created_at DESC
    `);

    result.rows.forEach((camp, i) => {
        const platformEmoji = { facebook: '📘', google: '🔍', zalo: '💬', tiktok: '🎵' }[camp.platform] || '📊';
        const roi = camp.metrics?.roi || 0;
        console.log(`   ${i + 1}. ${platformEmoji} ${camp.name}`);
        console.log(`      Platform: ${camp.platform} | Status: ${camp.status}`);
        console.log(`      Budget: ${(camp.budget / 1000000).toFixed(1)}M | Spent: ${(camp.spent / 1000000).toFixed(1)}M | ROI: ${roi}x`);
    });
}

// Show clients
async function showClients(client) {
    console.log('🏢 Clients');
    console.log('==========');

    const result = await client.query(`
        SELECT company_name, contact_name, industry, status
        FROM clients
        ORDER BY created_at DESC
    `);

    result.rows.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.company_name}`);
        console.log(`      Contact: ${c.contact_name} | Industry: ${c.industry} | Status: ${c.status}`);
    });
}

// Add a new lead
async function addLead(client, name, company, email, phone, source) {
    console.log('➕ Adding new lead...');

    const tenant = await client.query(`SELECT id FROM tenants WHERE slug = 'sadec-hub'`);
    if (!tenant.rows[0]) {
        console.log('❌ Tenant not found');
        return;
    }

    await client.query(`
        INSERT INTO leads (tenant_id, name, company, email, phone, source, status, temperature, score)
        VALUES ($1, $2, $3, $4, $5, $6, 'new', 'warm', 50)
    `, [tenant.rows[0].id, name, company, email, phone, source]);

    console.log(`✅ Lead added: ${name} (${company})`);
}

// Main
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'status';

    console.log('🔌 Connecting to Supabase...');
    const client = await getClient();
    console.log('✅ Connected!\n');

    try {
        switch (command) {
            case 'status':
                await showStatus(client);
                break;
            case 'leads':
                await showLeads(client);
                break;
            case 'campaigns':
                await showCampaigns(client);
                break;
            case 'clients':
                await showClients(client);
                break;
            case 'all':
                await showStatus(client);
                console.log('');
                await showLeads(client);
                console.log('');
                await showCampaigns(client);
                console.log('');
                await showClients(client);
                break;
            case 'add-lead':
                if (args.length < 6) {
                    console.log('Usage: node push-data.js add-lead "Name" "Company" "email@example.com" "0909xxx" "facebook"');
                    break;
                }
                await addLead(client, args[1], args[2], args[3], args[4], args[5]);
                break;
            default:
                console.log('Commands: status, leads, campaigns, clients, all, add-lead');
        }
    } finally {
        await client.end();
    }

    console.log('\n✨ Done!');
}

main().catch(console.error);
