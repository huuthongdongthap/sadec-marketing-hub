/**
 * MEKONG AGENCY - ADMIN CLIENT
 * Main Entry Point (Backwards Compatible)
 *
 * This file now serves as a thin wrapper that re-exports
 * all functionality from the modular admin system.
 *
 * @deprecated Import from assets/js/admin/index.js directly for new code
 */

// Re-export everything from modular admin system
export * from './admin/index.js';

// Default export for backwards compatibility
import {
    toast,
    modal,
    showCampaignDetail,
    showLeadDetail,
    loadCampaigns,
    loadLeads,
    formatCurrency,
    formatNumber,
    formatDate,
    animateCountUp,
    createSparkline,
    setupSearchFilter,
    exportToCSV,
    DEMO_CAMPAIGNS,
    DEMO_LEADS
} from './admin/index.js';

export default {
    toast,
    modal,
    showCampaignDetail,
    showLeadDetail,
    loadCampaigns,
    loadLeads,
    formatCurrency,
    formatNumber,
    formatDate,
    animateCountUp,
    createSparkline,
    setupSearchFilter,
    exportToCSV,
    DEMO_CAMPAIGNS,
    DEMO_LEADS
};
