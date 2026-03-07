/**
 * Admin Client - Main Entry Point
 * Re-exports all admin modules
 *
 * @module admin-client
 */

// Data & Constants
export { DEMO_CAMPAIGNS, DEMO_LEADS, getPlatformIcon, getPlatformLabel, getCampaignStatusLabel, getLeadStatusLabel, getTemperatureColor } from './admin-data.js';

// Utils & UI Components
export { formatCurrency, formatNumber, formatDate, formatRelativeTime, debounce, truncate } from './admin-utils.js';
export { ToastManager, ModalManager } from './admin-utils.js';
export { exportToCSV, setupSearchFilter, setupKeyboardShortcuts } from './admin-utils.js';

// Feature Modules
export { showCampaignDetail, loadCampaigns, renderCampaigns, updateCampaignStats } from './admin-campaigns.js';
export { showLeadDetail, loadLeads, renderLeadCards, renderPipeline } from './admin-leads.js';
export { loadClients, renderClients, showClientDetail, editClient, DEMO_CLIENTS } from './admin-clients.js';
export { loadDashboard, updateDashboardStats, animateCountUp, createSparkline } from './admin-dashboard.js';

// Toast & Modal instances (for backwards compatibility)
import { ToastManager, ModalManager } from './admin-utils.js';

export const toast = new ToastManager();
export const modal = new ModalManager();

// ================================================
// AUTO-INITIALIZATION
// ================================================

import { loadCampaigns as loadCampaignsFn } from './admin-campaigns.js';
import { loadLeads as loadLeadsFn } from './admin-leads.js';
import { loadDashboard as loadDashboardFn } from './admin-dashboard.js';
import { loadClients as loadClientsFn } from './admin-clients.js';

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;

        // Dashboard page
        if (path.includes('dashboard.html') || path.includes('admin/dashboard.html')) {
            loadDashboardFn();
        }

        // Campaigns page
        if (path.includes('campaigns.html') || path.includes('admin/campaigns.html')) {
            const tableBody = document.querySelector('.campaigns-table tbody');
            if (tableBody) {
                loadCampaignsFn(tableBody);
            }
        }

        // Leads page
        if (path.includes('leads.html') || path.includes('admin/leads.html')) {
            const gridElement = document.getElementById('leads-grid');
            const pipelineElement = document.getElementById('pipeline-container');
            if (gridElement || pipelineElement) {
                loadLeadsFn(gridElement, pipelineElement);
            }
        }

        // Clients page
        if (path.includes('clients.html') || path.includes('admin/clients.html')) {
            const tableBody = document.querySelector('.clients-table tbody');
            if (tableBody) {
                loadClientsFn(tableBody);
            }
        }
    });
}
