/**
 * Mekong Agency - Central Environment Configuration
 * Shared config for Node.js scripts (setup, migration, seeding)
 *
 * Usage: const config = require('./mekong-env');
 */

// Defaults for local development / demo
const DEFAULT_CONFIG = {
    SUPABASE_URL: 'https://pzcgvfhppglzfjavxuid.supabase.co',
    // WARNING: Service role key allows bypassing RLS. Use only in server-side scripts.
    SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y2d2ZmhwcGdsemZqYXZ4dWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjczMTc4NiwiZXhwIjoyMDgyMzA3Nzg2fQ.hFwiEW_U7Tr5hXyvw04aS_CzS2OXK7VHQ0Y0SG_jJDc',
    // Using Pooler connection (Transaction mode recommended for serverless)
    // Format: postgres://[user].[project]:[password]@[host]:[port]/[db]
    DB_CONNECTION_STRING: 'postgres://postgres.pzcgvfhppglzfjavxuid:TtmDATA@2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'
};

module.exports = {
    SUPABASE_URL: process.env.SUPABASE_URL || DEFAULT_CONFIG.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || DEFAULT_CONFIG.SUPABASE_SERVICE_KEY,
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || DEFAULT_CONFIG.DB_CONNECTION_STRING
};
