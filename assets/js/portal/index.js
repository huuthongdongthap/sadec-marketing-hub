/**
 * Portal Client - Main Entry Point
 * Re-exports all portal modules
 *
 * @module portal-client
 */

// Core modules
export { supabase, auth, projects, invoices, activities, utils } from './supabase.js';

// UI Components
export { ModalManager, renderProjects, renderInvoices, updateInvoiceStats } from './portal-ui.js';
export { Toast } from '../services/enhanced-utils.js';

// Utilities
export { formatCurrency, formatDate, formatRelativeTime, truncate, escapeHtml } from './portal-utils.js';
export { isRequired, isValidEmail, isValidPhone } from './portal-utils.js';
export { debounce, throttle, waitForDOM } from './portal-utils.js';
export { getStorageItem, setStorageItem, removeStorageItem } from './portal-utils.js';

// Auth & Data
export { DEMO_INVOICES, isDemoMode, getCurrentUser, requireAuth } from './portal-auth.js';
export { DEMO_PROJECTS } from './portal-data.js';
export { loadProjects, getProjectById } from './portal-data.js';
export { loadInvoices, getInvoiceById } from './portal-data.js';

// Feature modules
export { showProjectDetail, filterProjectsByStatus } from './portal-projects.js';
export { showInvoiceDetail, setupInvoiceRealtime } from './portal-invoices.js';
export { payInvoiceOnline, downloadInvoicePDF, markInvoiceAsPaid } from './portal-payments.js';
export { loadDashboard, loadActivityFeed, loadDeadlines } from './portal-dashboard.js';

// Toast & Modal instances (for backwards compatibility)
import { Toast } from '../services/enhanced-utils.js';
import { ModalManager } from './portal-ui.js';

export const toast = Toast;
export const modal = new ModalManager();

// ================================================
// AUTO-INITIALIZATION
// ================================================

import { loadProjects as loadProjectsFn } from './portal-projects.js';
import { loadInvoices as loadInvoicesFn, setupInvoiceRealtime as setupRealtimeFn } from './portal-invoices.js';
import { loadDashboard as loadDashboardFn } from './portal-dashboard.js';

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;

        if (path.includes('projects.html')) {
            const grid = document.getElementById('projectsGrid');
            if (grid) {
                loadProjectsFn(grid);

                // Bind filter buttons
                document.querySelectorAll('.filter-chip').forEach(chip => {
                    chip.addEventListener('click', () => {
                        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                        chip.classList.add('active');

                        const filterText = chip.textContent.trim();
                        const filterMap = {
                            'Tất cả': 'all',
                            'Đang chạy': 'active',
                            'Hoàn thành': 'completed',
                            'Tạm dừng': 'paused'
                        };
                        loadProjectsFn(grid, filterMap[filterText] || 'all');
                    });
                });
            }
        }

        if (path.includes('invoices.html')) {
            const table = document.querySelector('.invoice-table tbody');
            if (table) {
                loadInvoicesFn(table);
                setupRealtimeFn(table);
            }
        }

        if (path.includes('dashboard.html')) {
            loadDashboardFn();
        }
    });
}
