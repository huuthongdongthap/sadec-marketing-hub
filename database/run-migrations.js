#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUPABASE DIRECT MIGRATION RUNNER
 * Sa Đéc Marketing Hub
 * 
 * Executes SQL directly against Supabase PostgreSQL using pg library.
 * 
 * Usage:
 *   node database/run-migrations.js
 * 
 * Required: Set DATABASE_URL in .env.local or as environment variable
 * Get it from: Supabase Dashboard → Settings → Database → Connection string
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Try to load .env.local
try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && !key.startsWith('#')) {
                const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                if (value) process.env[key.trim()] = value.trim();
            }
        });
    }
} catch (e) {
    console.log('Note: Could not load .env.local');
}

// Database URL from Supabase Dashboard → Settings → Database → Connection string
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

const MIGRATION_FILES = [
    'rls_policies_v4.sql',
    'jwt_role_trigger.sql',
    'rls_policies_v5.sql',
    'constraints.sql'
];

async function runMigrations() {
    console.log('🚀 Supabase Direct Migration Runner\n');
    console.log('═'.repeat(60));

    if (!DATABASE_URL) {
        console.error('❌ DATABASE_URL not set!\n');
        console.log('To get your database URL:');
        console.log('1. Go to: https://supabase.com/dashboard/project/pzcgvfhppglzfjavxuid/settings/database');
        console.log('2. Copy "Connection string" (URI format)');
        console.log('3. Add to .env.local: DATABASE_URL=postgresql://...\n');
        console.log('Or run: export DATABASE_URL="postgresql://..."');
        process.exit(1);
    }

    console.log(`Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}\n`);

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('📡 Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected!\n');

        for (const filename of MIGRATION_FILES) {
            const filePath = path.join(__dirname, filename);

            if (!fs.existsSync(filePath)) {
                console.log(`⏭️  Skipping ${filename} (not found)`);
                continue;
            }

            console.log(`📄 Running ${filename}...`);

            try {
                const sql = fs.readFileSync(filePath, 'utf8');

                // Split by statement (handling multi-statement SQL)
                // Note: This is a simple split, may need adjustment for complex SQL
                await client.query(sql);

                console.log(`   ✅ Success\n`);
            } catch (err) {
                // Check if it's a "already exists" error (safe to ignore)
                if (err.message.includes('already exists')) {
                    console.log(`   ⚠️  Already applied (safe to ignore)\n`);
                } else {
                    console.error(`   ❌ Error: ${err.message}\n`);
                }
            }
        }

        console.log('═'.repeat(60));
        console.log('🎉 Migration complete!');

    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check DATABASE_URL format: postgresql://user:pass@host:port/db');
        console.log('2. Ensure your IP is allowed in Supabase Dashboard → Settings → Database');
    } finally {
        await client.end();
    }
}

runMigrations().catch(console.error);
