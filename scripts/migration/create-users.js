#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTO-CREATE DEMO USERS
 * Sa Đéc Marketing Hub
 *
 * Creates standard roles: super_admin, manager, content_creator, client, affiliate
 * Uses Supabase Admin API via direct HTTP requests.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const https = require('https');
const { Client } = require('pg');
const config = require('./mekong-env');

const { SUPABASE_URL, SUPABASE_SERVICE_KEY: SERVICE_ROLE_KEY, DB_CONNECTION_STRING } = config;

// Extract hostname from URL for https request
const SUPABASE_HOSTNAME = SUPABASE_URL.replace(/^https?:\/\//, '');

const DEMO_USERS = [
    { email: 'admin@mekongmarketing.com', password: 'Admin@2026', role: 'super_admin', full_name: 'Admin Mekong', phone: '0909 000 001' },
    { email: 'manager@mekongmarketing.com', password: 'Manager@2026', role: 'manager', full_name: 'Quản lý Marketing', phone: '0909 000 002' },
    { email: 'creator@mekongmarketing.com', password: 'Creator@2026', role: 'content_creator', full_name: 'Content Creator', phone: '0909 000 003' },
    { email: 'client@mekongmarketing.com', password: 'Client@2026', role: 'client', full_name: 'Khách hàng Demo', phone: '0909 000 004' },
    { email: 'affiliate@mekongmarketing.com', password: 'Affiliate@2026', role: 'affiliate', full_name: 'Affiliate Partner', phone: '0909 000 005' }
];

/**
 * Helper: Make HTTPS Request
 */
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(result);
                    } else {
                        reject(new Error(result.message || result.msg || body));
                    }
                } catch (e) {
                    reject(new Error(body));
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

/**
 * Create user via Supabase Admin API
 */
function createAuthUser(user) {
    const data = JSON.stringify({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.full_name, role: user.role }
    });

    const options = {
        hostname: SUPABASE_HOSTNAME,
        path: '/auth/v1/admin/users',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return makeRequest(options, data);
}

/**
 * Verify Database Connection
 */
async function checkDbConnection() {
    const dbClient = new Client({ connectionString: DB_CONNECTION_STRING });
    try {
        await dbClient.connect();
        await dbClient.end();
        return true;
    } catch (e) {
        console.warn('⚠️  Database connection warning:', e.message);
        console.warn('   Continuing with Auth API only...\n');
        return false;
    }
}

async function main() {
    console.log('🔐 Auto-Creating Demo Users for Mekong Marketing');
    console.log('=================================================\n');

    await checkDbConnection();

    for (const user of DEMO_USERS) {
        try {
            console.log(`👤 Creating ${user.role}: ${user.email}...`);
            const authUser = await createAuthUser(user);
            console.log(`   ✅ Created! ID: ${authUser.id}`);
        } catch (err) {
            const msg = err.message;
            if (msg.includes('already been registered') || msg.includes('unique constraint')) {
                console.log(`   ⚠️  Already exists`);
            } else {
                console.log(`   ❌ Error: ${msg}`);
            }
        }
    }

    console.log('\n✨ Done! Login credentials:\n');
    console.table(DEMO_USERS.map(({role, email, password}) => ({role, email, password})));
    console.log('\n🔗 Login at: /login.html');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
