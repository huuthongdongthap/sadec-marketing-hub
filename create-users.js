#!/usr/bin/env node
/**
 * Auto-create Demo Users via Supabase Admin API
 * Roles: super_admin, manager, content_creator, client, affiliate
 */

const https = require('https');
const { Client } = require('pg');

const SUPABASE_URL = 'https://pzcgvfhppglzfjavxuid.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y2d2ZmhwcGdsemZqYXZ4dWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjczMTc4NiwiZXhwIjoyMDgyMzA3Nzg2fQ.hFwiEW_U7Tr5hXyvw04aS_CzS2OXK7VHQ0Y0SG_jJDc';
const connectionString = 'postgresql://postgres:TtmData2026%40@db.pzcgvfhppglzfjavxuid.supabase.co:5432/postgres';

const DEMO_USERS = [
    { email: 'admin@mekongmarketing.com', password: 'Admin@2026', role: 'super_admin', full_name: 'Admin Mekong', phone: '0909 000 001' },
    { email: 'manager@mekongmarketing.com', password: 'Manager@2026', role: 'manager', full_name: 'Quản lý Marketing', phone: '0909 000 002' },
    { email: 'creator@mekongmarketing.com', password: 'Creator@2026', role: 'content_creator', full_name: 'Content Creator', phone: '0909 000 003' },
    { email: 'client@mekongmarketing.com', password: 'Client@2026', role: 'client', full_name: 'Khách hàng Demo', phone: '0909 000 004' },
    { email: 'affiliate@mekongmarketing.com', password: 'Affiliate@2026', role: 'affiliate', full_name: 'Affiliate Partner', phone: '0909 000 005' }
];

function createAuthUser(user) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: { full_name: user.full_name, role: user.role }
        });

        const options = {
            hostname: 'pzcgvfhppglzfjavxuid.supabase.co',
            path: '/auth/v1/admin/users',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'Content-Length': Buffer.byteLength(data)
            }
        };

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
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('🔐 Auto-Creating Demo Users for Mekong Marketing');
    console.log('=================================================\n');

    const dbClient = new Client({ connectionString });
    await dbClient.connect();

    for (const user of DEMO_USERS) {
        try {
            console.log(`👤 Creating ${user.role}: ${user.email}...`);
            const authUser = await createAuthUser(user);
            console.log(`   ✅ Created! ID: ${authUser.id}`);
        } catch (err) {
            if (err.message.includes('already been registered')) {
                console.log(`   ⚠️  Already exists`);
            } else {
                console.log(`   ❌ Error: ${err.message}`);
            }
        }
    }

    await dbClient.end();

    console.log('\n✨ Done! Login credentials:\n');
    console.log('┌────────────────┬──────────────────────────────────┬────────────────┐');
    console.log('│ Role           │ Email                            │ Password       │');
    console.log('├────────────────┼──────────────────────────────────┼────────────────┤');
    for (const user of DEMO_USERS) {
        console.log(`│ ${user.role.padEnd(14)} │ ${user.email.padEnd(32)} │ ${user.password.padEnd(14)} │`);
    }
    console.log('└────────────────┴──────────────────────────────────┴────────────────┘');
    console.log('\n🔗 Login at: /login.html');
}

main().catch(console.error);
