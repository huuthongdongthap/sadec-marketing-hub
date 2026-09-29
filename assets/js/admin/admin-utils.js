/**
 * Admin Utils Module
 * Utility Functions & UI Components for Admin Panel
 *
 * Note: Format functions re-exported from shared/format-utils.js
 */

// ================================================
// RE-EXPORTS FROM SHARED
// ================================================

export {
    formatCurrency,
    formatCurrencyCompact,
    formatCurrencyVN,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    truncate,
    debounce,
    throttle
} from '../services/core-utils.js';

// Re-export Toast from enhanced-utils
export { Toast } from '../services/core-utils.js';

// Re-export ThemeManager from components
export { ThemeManager } from '../components/theme-manager.js';

// Re-export ModalManager from shared
export { ModalManager, modal, modalHelpers } from '../shared/modal-utils.js';

// Re-export ScrollProgress from enhanced-utils
export { ScrollProgress } from '../services/enhanced-utils.js';

// Re-export MobileSidebar
export { MobileSidebar } from '../services/core-utils.js';

// ================================================
// EXPORT HELPERS
// ================================================

/**
 * Export data to CSV
 */
export function exportToCSV(data, filename = 'export.csv') {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

/**
 * Setup search filter
 */
export function setupSearchFilter(inputElement, items, renderFn, searchFields = ['name']) {
    if (!inputElement) return;

    const handler = debounce((e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            renderFn(items);
            return;
        }

        const filtered = items.filter(item =>
            searchFields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(query);
            })
        );
        renderFn(filtered);
    }, 300);

    inputElement.addEventListener('input', handler);
}

/**
 * Setup keyboard shortcuts
 */
export function setupKeyboardShortcuts(handlers = {}) {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            handlers.onSearch?.();
        }

        // Ctrl/Cmd + N: New item
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            handlers.onNew?.();
        }

        // Escape: Close modal
        if (e.key === 'Escape') {
            handlers.onClose?.();
        }
    });
}
