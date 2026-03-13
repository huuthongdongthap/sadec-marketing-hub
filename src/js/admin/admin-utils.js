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
} from '../shared/format-utils.js';

// Re-export Toast, ThemeManager, ScrollProgress from enhanced-utils for admin modules
export {
    Toast,
    ThemeManager,
    ScrollProgress,
    MobileSidebar
} from '../core/enhanced-utils.js';

// ================================================
// MODAL MANAGER
// ================================================

export class ModalManager {
    constructor() {
        this.overlay = null;
        this.modal = null;
        this.init();
    }

    init() {
        if (!document.getElementById('modal-overlay')) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'modal-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9998;
                display: none;
                align-items: center;
                justify-content: center;
            `;

            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });

            document.body.appendChild(this.overlay);
        } else {
            this.overlay = document.getElementById('modal-overlay');
        }
    }

    open(content, options = {}) {
        if (!this.overlay) this.init();

        this.modal = document.createElement('div');
        this.modal.className = 'modal-content';
        this.modal.style.cssText = `
            background: white;
            border-radius: 16px;
            max-width: 720px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            animation: modalPop 0.3s ease;
        `;

        this.modal.innerHTML = `
            <button class="modal-close" style="position: absolute; top: 16px; right: 16px; background: none; border: none; cursor: pointer; padding: 8px;">
                <span class="material-symbols-outlined">close</span>
            </button>
            ${content}
        `;

        this.overlay.appendChild(this.modal);
        this.overlay.style.display = 'flex';

        // Close button handler
        this.modal.querySelector('.modal-close')?.addEventListener('click', () => this.close());

        // ESC key handler
        this.escHandler = (e) => {
            if (e.key === 'Escape') this.close();
        };
        document.addEventListener('keydown', this.escHandler);
    }

    close() {
        if (!this.overlay || !this.modal) return;

        this.overlay.style.display = 'none';
        this.modal.remove();
        this.modal = null;
        document.removeEventListener('keydown', this.escHandler);
    }
}

// Add modal animation styles
if (typeof document !== 'undefined') {
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        @keyframes modalPop {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(modalStyles);
}

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
