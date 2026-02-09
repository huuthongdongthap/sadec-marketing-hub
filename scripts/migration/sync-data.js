#!/usr/bin/env node
/**
 * MEKONG SYNC DATA CLI
 * Command-line tool for Binh Pháp data synchronization
 * 
 * Usage:
 *   node sync-data.js --refresh-views   Refresh materialized views
 *   node sync-data.js --export-win3     Export WIN³ report
 *   node sync-data.js --full-sync       Complete system sync
 *   node sync-data.js --stats           Show current stats
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pzcgvfhppglzfjavxuid.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_KEY in environment');
    console.log('   Set it in .env.local file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN');
}

// ============================================================================
// SYNC FUNCTIONS
// ============================================================================

async function refreshMaterializedViews() {
    console.log('🔄 Refreshing materialized views...');

    try {
        const { data, error } = await supabase.rpc('refresh_dashboard_stats');

        if (error) {
            console.log('⚠️  RPC not available, trying direct refresh...');
            // Fallback: direct SQL isn't available via JS client
            // User needs to run binh-phap-sync.sql in Supabase
            console.log('   Run database/binh-phap-sync.sql in Supabase SQL Editor');
            return false;
        }

        console.log('✅ Materialized views refreshed successfully');
        return true;
    } catch (err) {
        console.error('❌ Error:', err.message);
        return false;
    }
}

async function getDashboardStats() {
    console.log('📊 Fetching dashboard stats...\n');

    // Try materialized view first
    let { data: mvData, error: mvError } = await supabase
        .from('mv_dashboard_stats')
        .select('*')
        .single();

    if (mvError) {
        console.log('⚠️  Materialized view not available, using live queries...\n');

        // Fallback to live queries
        const [customers, deals, invoices, campaigns, contacts] = await Promise.all([
            supabase.from('customers').select('*', { count: 'exact', head: true }).is('deleted_at', null),
            supabase.from('deals').select('value, stage').is('deleted_at', null),
            supabase.from('invoices').select('total, status'),
            supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null),
            supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'new').is('deleted_at', null)
        ]);

        const pipelineDeals = deals.data?.filter(d => !['won', 'lost'].includes(d.stage)) || [];
        const pipelineValue = pipelineDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        const pendingInvoices = invoices.data?.filter(i => ['sent', 'overdue'].includes(i.status)) || [];
        const pendingRevenue = pendingInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
        const paidInvoices = invoices.data?.filter(i => i.status === 'paid') || [];
        const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

        mvData = {
            total_customers: customers.count || 0,
            pipeline_value: pipelineValue,
            pending_revenue: pendingRevenue,
            revenue_30d: totalRevenue,
            active_campaigns: campaigns.count || 0,
            new_contacts: contacts.count || 0,
            last_refreshed: new Date().toISOString()
        };
    }

    console.log('╔══════════════════════════════════════════════╗');
    console.log('║          MEKONG DASHBOARD STATS              ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  👥 Total Customers:    ${String(mvData.total_customers).padStart(10)}        ║`);
    console.log(`║  💰 Pipeline Value:     ${formatVND(mvData.pipeline_value).padStart(18)} ║`);
    console.log(`║  📄 Pending Revenue:    ${formatVND(mvData.pending_revenue).padStart(18)} ║`);
    console.log(`║  📈 Revenue (30d):      ${formatVND(mvData.revenue_30d).padStart(18)} ║`);
    console.log(`║  🎯 Active Campaigns:   ${String(mvData.active_campaigns).padStart(10)}        ║`);
    console.log(`║  📞 New Contacts:       ${String(mvData.new_contacts).padStart(10)}        ║`);
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Last Refreshed: ${new Date(mvData.last_refreshed).toLocaleString('vi-VN').padEnd(26)} ║`);
    console.log('╚══════════════════════════════════════════════╝');

    return mvData;
}

async function getPipelineData() {
    console.log('\n📊 Fetching pipeline data...\n');

    const { data, error } = await supabase
        .from('deals')
        .select('*')
        .is('deleted_at', null)
        .order('value', { ascending: false });

    if (error) {
        console.error('❌ Error fetching deals:', error.message);
        return;
    }

    const stages = ['discovery', 'proposal', 'negotiation', 'won', 'lost'];

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                    SALES PIPELINE                        ║');
    console.log('╠══════════════════════════════════════════════════════════╣');

    stages.forEach(stage => {
        const stageDeals = data.filter(d => d.stage === stage);
        const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        const emoji = stage === 'won' ? '🏆' : stage === 'lost' ? '❌' : '📋';

        console.log(`║  ${emoji} ${stage.toUpperCase().padEnd(12)} ${String(stageDeals.length).padStart(3)} deals  ${formatVND(stageValue).padStart(20)} ║`);
    });

    const totalPipeline = data
        .filter(d => !['won', 'lost'].includes(d.stage))
        .reduce((sum, d) => sum + (d.value || 0), 0);

    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  💎 TOTAL PIPELINE VALUE:          ${formatVND(totalPipeline).padStart(20)} ║`);
    console.log('╚══════════════════════════════════════════════════════════╝');

    return data;
}

async function exportWin3Report() {
    console.log('📋 Generating WIN³ Report...\n');

    const stats = await getDashboardStats();
    const pipeline = await getPipelineData();

    // Get WIN³ snapshot
    const { data: snapshot } = await supabase
        .from('win3_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single();

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    WIN³ METRICS                          ║');
    console.log('╠══════════════════════════════════════════════════════════╣');

    if (snapshot) {
        console.log(`║  📈 Total Revenue:     ${formatVND(snapshot.total_revenue).padStart(28)} ║`);
        console.log(`║  💰 Pipeline Value:    ${formatVND(snapshot.pipeline_value).padStart(28)} ║`);
        console.log(`║  👥 Total Customers:   ${String(snapshot.total_customers).padStart(28)} ║`);
        console.log(`║  🎯 Win Rate:          ${String(snapshot.win_rate + '%').padStart(28)} ║`);
        console.log(`║  📅 Snapshot Date:     ${snapshot.snapshot_date.padStart(28)} ║`);
    } else {
        console.log('║  ⚠️  No WIN³ snapshot available                          ║');
        console.log('║     Run binh-phap-sync.sql to create snapshots          ║');
    }

    console.log('╚══════════════════════════════════════════════════════════╝');

    return { stats, pipeline, snapshot };
}

async function fullSync() {
    console.log('🚀 Starting Full System Sync...\n');
    console.log('═'.repeat(60));

    // Step 1: Refresh views
    console.log('\n[1/4] Refreshing materialized views...');
    await refreshMaterializedViews();

    // Step 2: Get stats
    console.log('\n[2/4] Fetching dashboard stats...');
    await getDashboardStats();

    // Step 3: Get pipeline
    console.log('\n[3/4] Fetching pipeline data...');
    await getPipelineData();

    // Step 4: Export WIN³
    console.log('\n[4/4] Generating WIN³ report...');
    await exportWin3Report();

    console.log('\n═'.repeat(60));
    console.log('✅ Full System Sync Complete!');
    console.log(`   Timestamp: ${new Date().toLocaleString('vi-VN')}`);
}

// ============================================================================
// CLI HANDLER
// ============================================================================

async function main() {
    const args = process.argv.slice(2);

    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║        MEKONG SYNC DATA CLI v1.0             ║');
    console.log('║        Binh Pháp System Integration          ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    if (args.length === 0 || args.includes('--help')) {
        console.log('Usage:');
        console.log('  node sync-data.js --refresh-views   Refresh materialized views');
        console.log('  node sync-data.js --export-win3     Export WIN³ report');
        console.log('  node sync-data.js --full-sync       Complete system sync');
        console.log('  node sync-data.js --stats           Show current stats');
        console.log('  node sync-data.js --pipeline        Show pipeline data');
        console.log('');
        return;
    }

    try {
        if (args.includes('--refresh-views')) {
            await refreshMaterializedViews();
        }

        if (args.includes('--stats')) {
            await getDashboardStats();
        }

        if (args.includes('--pipeline')) {
            await getPipelineData();
        }

        if (args.includes('--export-win3')) {
            await exportWin3Report();
        }

        if (args.includes('--full-sync')) {
            await fullSync();
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

main();
