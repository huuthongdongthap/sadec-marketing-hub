/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — QUICK ACTIONS PANEL
 * Floating action button with quick access to common tasks
 *
 * Features:
 * - Floating action button (FAB)
 * - Quick actions menu
 * - Keyboard shortcut (Ctrl+Shift+A)
 * - Contextual actions based on current page
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

export class QuickActions {
    /**
     * Quick actions configuration
     */
    static actions = [
        {
            id: 'new-lead',
            label: 'Thêm Lead mới',
            icon: 'person_add',
            shortcut: 'Ctrl+Shift+L',
            action: () => window.location.href = '/admin/leads.html?action=new',
            category: 'common'
        },
        {
            id: 'new-campaign',
            label: 'Chiến dịch mới',
            icon: 'campaign',
            shortcut: 'Ctrl+Shift+C',
            action: () => window.location.href = '/admin/campaigns.html?action=new',
            category: 'common'
        },
        {
            id: 'new-task',
            label: 'Task mới',
            icon: 'add_task',
            shortcut: 'Ctrl+Shift+T',
            action: () => QuickActions.openTaskModal(),
            category: 'common'
        },
        {
            id: 'export-data',
            label: 'Xuất dữ liệu',
            icon: 'download',
            shortcut: 'Ctrl+Shift+E',
            action: () => QuickActions.exportData(),
            category: 'data'
        },
        {
            id: 'refresh',
            label: 'Làm mới',
            icon: 'refresh',
            shortcut: 'Ctrl+R',
            action: () => window.location.reload(),
            category: 'navigation'
        },
        {
            id: 'search',
            label: 'Tìm kiếm',
            icon: 'search',
            shortcut: 'Ctrl+K',
            action: () => {
                const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    ctrlKey: true
                });
                document.dispatchEvent(event);
            },
            category: 'navigation'
        },
        {
            id: 'settings',
            label: 'Cài đặt',
            icon: 'settings',
            shortcut: 'Ctrl+Shift+S',
            action: () => QuickActions.openSettings(),
            category: 'settings'
        },
        {
            id: 'help',
            label: 'Trợ giúp',
            icon: 'help',
            shortcut: 'F1',
            action: () => QuickActions.openHelp(),
            category: 'settings'
        }
    ];

    /**
     * Initialize quick actions
     */
    static init() {
        this.createFAB();
        this.bindKeyboard();
        console.log('[QuickActions] Initialized');
    }

    /**
     * Create floating action button
     */
    static createFAB() {
        // Remove existing if any
        const existing = document.querySelector('.quick-actions-fab');
        if (existing) existing.remove();

        const fab = document.createElement('div');
        fab.className = 'quick-actions-fab';
        fab.innerHTML = `
            <button class="fab-button" aria-label="Quick Actions" aria-expanded="false">
                <span class="material-symbols-outlined">add</span>
            </button>
            <div class="quick-actions-menu" role="menu" aria-hidden="true">
                <div class="quick-actions-search">
                    <span class="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search actions..." class="quick-actions-input" />
                </div>
                <div class="quick-actions-list"></div>
            </div>
        `;

        document.body.appendChild(fab);
        this.bindFABEvents(fab);
    }

    /**
     * Bind FAB events
     * @param {HTMLElement} fab - FAB element
     */
    static bindFABEvents(fab) {
        const button = fab.querySelector('.fab-button');
        const menu = fab.querySelector('.quick-actions-menu');
        const input = fab.querySelector('.quick-actions-input');
        const list = fab.querySelector('.quick-actions-list');

        // Toggle menu
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.classList.toggle('visible');
            button.setAttribute('aria-expanded', isOpen);
            menu.setAttribute('aria-hidden', !isOpen);

            if (isOpen) {
                this.populateMenu(list);
                setTimeout(() => input.focus(), 100);
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!fab.contains(e.target)) {
                menu.classList.remove('visible');
                button.setAttribute('aria-expanded', 'false');
                menu.setAttribute('aria-hidden', 'true');
            }
        });

        // Search filter
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.filterActions(list, query);
        });

        // Keyboard navigation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                menu.classList.remove('visible');
                button.focus();
            }
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('visible')) {
                menu.classList.remove('visible');
                button.focus();
            }
        });
    }

    /**
     * Populate menu with actions
     * @param {HTMLElement} container - Menu container
     */
    static populateMenu(container) {
        container.innerHTML = '';

        // Group by category
        const categories = {};
        this.actions.forEach(action => {
            if (!categories[action.category]) {
                categories[action.category] = [];
            }
            categories[action.category].push(action);
        });

        // Render
        Object.entries(categories).forEach(([category, actions]) => {
            const section = document.createElement('div');
            section.className = 'quick-actions-section';

            const title = document.createElement('div');
            title.className = 'quick-actions-category';
            title.textContent = this.getCategoryName(category);
            section.appendChild(title);

            actions.forEach(action => {
                const item = document.createElement('div');
                item.className = 'quick-action-item';
                item.setAttribute('role', 'menuitem');
                item.innerHTML = `
                    <span class="material-symbols-outlined">${action.icon}</span>
                    <span class="action-label">${action.label}</span>
                    <kbd class="action-shortcut">${action.shortcut}</kbd>
                `;

                item.addEventListener('click', () => {
                    action.action();
                    this.closeMenu();
                });

                section.appendChild(item);
            });

            container.appendChild(section);
        });
    }

    /**
     * Filter actions based on search query
     * @param {HTMLElement} container - Menu container
     * @param {string} query - Search query
     */
    static filterActions(container, query) {
        const items = container.querySelectorAll('.quick-action-item');

        items.forEach(item => {
            const label = item.querySelector('.action-label').textContent.toLowerCase();
            const matches = label.includes(query);
            item.style.display = matches ? '' : 'none';
        });
    }

    /**
     * Get category display name
     * @param {string} category - Category key
     * @returns {string} Display name
     */
    static getCategoryName(category) {
        const names = {
            common: 'Phổ biến',
            data: 'Dữ liệu',
            navigation: 'Điều hướng',
            settings: 'Cài đặt'
        };
        return names[category] || category;
    }

    /**
     * Close menu
     */
    static closeMenu() {
        const menu = document.querySelector('.quick-actions-menu');
        const button = document.querySelector('.fab-button');

        if (menu) {
            menu.classList.remove('visible');
            button?.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * Bind keyboard shortcuts
     */
    static bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+A to toggle
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                const fab = document.querySelector('.fab-button');
                fab?.click();
            }
        });
    }

    /**
     * Open task modal
     */
    static openTaskModal() {
        // Can be integrated with existing task management
        const Toast = window.SadecToast || window.Toast;
        Toast?.info('Tính năng task đang được phát triển...');
    }

    /**
     * Export data
     */
    static exportData() {
        const ExportManager = window.ExportManager;
        Toast?.info('Đang chuẩn bị xuất dữ liệu...');

        // Demo export
        if (ExportManager) {
            const sampleData = [
                { id: 1, name: 'Lead 1', status: 'new', value: 1000 },
                { id: 2, name: 'Lead 2', status: 'contacted', value: 2500 },
                { id: 3, name: 'Lead 3', status: 'converted', value: 5000 }
            ];
            ExportManager.toCSV(sampleData, 'leads-export.csv');
        }
    }

    /**
     * Open settings
     */
    static openSettings() {
        const UserPreferences = window.UserPreferences;
        if (UserPreferences) {
            UserPreferences.showPanel();
        }
    }

    /**
     * Open help
     */
    static openHelp() {
        // Can be integrated with help documentation
        window.open('https://sadecmarketinghub.com/docs', '_blank');
    }

    /**
     * Add custom action
     * @param {Object} action - Action configuration
     */
    static addAction(action) {
        this.actions.push(action);
    }

    /**
     * Remove action
     * @param {string} id - Action ID
     */
    static removeAction(id) {
        this.actions = this.actions.filter(a => a.id !== id);
    }
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => QuickActions.init());
    } else {
        QuickActions.init();
    }
}

// Export
export default QuickActions;

// Global access
if (typeof window !== 'undefined') {
    window.QuickActions = QuickActions;
}
