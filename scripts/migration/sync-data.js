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

    try {
        const { data, error } = await supabase.rpc('refresh_dashboard_stats');

        if (error) {
            // Fallback: direct SQL isn't available via JS client
            // User needs to run binh-phap-sync.sql in Supabase
            return false;
        }

        return true;
    } catch (err) {
        return false;
    }
}

async function getDashboardStats() {

    // Try materialized view first
    let { data: mvData, error: mvError } = await supabase
        .from('mv_dashboard_stats')
        .select('*')
        .single();

    if (mvError) {

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

    return mvData;
}

async function getPipelineData() {

    const { data, error } = await supabase
        .from('deals')
        .select('*')
        .is('deleted_at', null)
        .order('value', { ascending: false });

    if (error) {
        return;
    }

    const stages = ['discovery', 'proposal', 'negotiation', 'won', 'lost'];

    stages.forEach(stage => {
        const stageDeals = data.filter(d => d.stage === stage);
        const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        const emoji = stage === 'won' ? '🏆' : stage === 'lost' ? '❌' : '📋';

    });

    const totalPipeline = data
        .filter(d => !['won', 'lost'].includes(d.stage))
        .reduce((sum, d) => sum + (d.value || 0), 0);

    return data;
}

async function exportWin3Report() {

    const stats = await getDashboardStats();
    const pipeline = await getPipelineData();

    // Get WIN³ snapshot
    const { data: snapshot } = await supabase
        .from('win3_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single();

    if (snapshot) {
    } else {
    }

    return { stats, pipeline, snapshot };
}

async function fullSync() {

    // Step 1: Refresh views
    await refreshMaterializedViews();

    // Step 2: Get stats
    await getDashboardStats();

    // Step 3: Get pipeline
    await getPipelineData();

    // Step 4: Export WIN³
    await exportWin3Report();

}

// ============================================================================
// CLI HANDLER
// ============================================================================

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help')) {
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
        process.exit(1);
    }
}

main();
