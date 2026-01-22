#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUPABASE DIRECT MIGRATION RUNNER
 * Sa Đéc Marketing Hub
 *
 * Executes SQL directly against Supabase PostgreSQL using pg library.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    envFile: path.join(__dirname, '..', '.env.local'),
    // Default fallback credentials (cleared for security)
    db: {
        host: '',
        port: 6543,
        user: '',
        password: '',
        database: 'postgres',
    },
    migrations: [
        'phase8_ultimate.sql',
        'rls_unified.sql',
        'binh-phap-sync.sql',
        'seed_v2.sql',
        'verification.sql'
    ]
};

/**
 * Load environment variables from local file
 */
function loadEnvironment() {
    try {
        if (!fs.existsSync(CONFIG.envFile)) return;

        const envContent = fs.readFileSync(CONFIG.envFile, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^#=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                if (key && value) process.env[key] = value;
            }
        });
    } catch (e) {
        console.warn('⚠️  Could not load .env.local:', e.message);
    }
}

/**
 * Get Database Configuration
 */
function getDbConfig() {
    return {
        host: process.env.DB_HOST || CONFIG.db.host,
        port: parseInt(process.env.DB_PORT || CONFIG.db.port),
        user: process.env.DB_USER || CONFIG.db.user,
        password: process.env.DB_PASSWORD || CONFIG.db.password,
        database: process.env.DB_NAME || CONFIG.db.database,
        ssl: { rejectUnauthorized: false }
    };
}

/**
 * Execute a single migration file
 */
async function runMigrationFile(client, filename) {
    const filePath = path.join(__dirname, filename);

    if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${filename} (not found)`);
        return;
    }

    console.log(`📄 Running ${filename}...`);
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`   ✅ Success\n`);
    } catch (err) {
        if (err.message.includes('already exists')) {
            console.log(`   ⚠️  Already applied (safe to ignore)\n`);
        } else {
            console.error(`   ❌ Failed: ${err.message}\n`);
            // We don't throw here to allow other migrations to try running
            // or you can throw to stop execution on first error
        }
    }
}

/**
 * Main Runner
 */
async function runMigrations() {
    console.log('\n🚀 Supabase Direct Migration Runner');
    console.log('═'.repeat(60));

    loadEnvironment();
    const dbConfig = getDbConfig();

    console.log(`Database: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`User: ${dbConfig.user}\n`);

    const client = new Client(dbConfig);

    try {
        console.log('📡 Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected!\n');

        for (const filename of CONFIG.migrations) {
            await runMigrationFile(client, filename);
        }

        console.log('═'.repeat(60));
        console.log('🎉 Migration execution finished!');

    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check DATABASE_URL and credentials');
        console.log('2. Ensure your IP is allowed in Supabase Dashboard');
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Execute if run directly
if (require.main === module) {
    runMigrations().catch(console.error);
}
