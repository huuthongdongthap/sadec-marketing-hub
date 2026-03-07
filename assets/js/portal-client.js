/**
 * MEKONG AGENCY - CLIENT PORTAL
 * Main Entry Point (Backwards Compatible)
 *
 * This file now serves as a thin wrapper that re-exports
 * all functionality from the modular portal system.
 *
 * @deprecated Import from assets/js/portal/index.js directly for new code
 */

// Re-export everything from modular portal system
export * from './portal/index.js';

// Default export for backwards compatibility
import {
    toast,
    modal,
    showProjectDetail,
    showInvoiceDetail,
    downloadInvoicePDF,
    markInvoiceAsPaid,
    loadProjects,
    loadInvoices,
    loadDashboard,
    DEMO_PROJECTS,
    DEMO_INVOICES
} from './portal/index.js';

export default {
    toast,
    modal,
    showProjectDetail,
    showInvoiceDetail,
    downloadInvoicePDF,
    markInvoiceAsPaid,
    loadProjects,
    loadInvoices,
    loadDashboard,
    DEMO_PROJECTS,
    DEMO_INVOICES
};
