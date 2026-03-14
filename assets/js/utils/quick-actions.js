/**
 * Sa Đéc Marketing Hub — Quick Actions (Cmd/Ctrl + K)
 * Quick command palette cho navigation và actions
 */

const QuickActions = {
    actions: [],
    isOpen: false,

    init() {
        this.createModal();
        this.bindKeyboard();
        this.loadDefaultActions();
        console.log('[QuickActions] Initialized');
    },

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'quick-actions-modal';
        modal.className = 'quick-actions-modal';
        modal.innerHTML = `
            <div class="quick-actions-overlay"></div>
            <div class="quick-actions-panel">
                <div class="quick-actions-search">
                    <span class="material-symbols-outlined">search</span>
                    <input
                        type="text"
                        id="quick-actions-input"
                        placeholder="Gõ để tìm kiếm... (Cmd/Ctrl + K)"
                        autocomplete="off"
                    >
                    <kbd class="quick-actions-shortcut">ESC</kbd>
                </div>
                <div class="quick-actions-results" id="quick-actions-results"></div>
                <div class="quick-actions-footer">
                    <span><kbd>↑↓</kbd> Điều hướng</span>
                    <span><kbd>↵</kbd> Chọn</span>
                    <span><kbd>ESC</kbd> Đóng</span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        this.modal = modal;
        this.input = modal.querySelector('#quick-actions-input');
        this.results = modal.querySelector('#quick-actions-results');

        this.bindModalEvents();
    },

    bindModalEvents() {
        // Close on overlay click
        this.modal.querySelector('.quick-actions-overlay').addEventListener('click', () => this.close());

        // Search input handler
        this.input.addEventListener('input', (e) => this.filterActions(e.target.value));

        // Keyboard navigation
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    },

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Open: Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }

            // Close: Escape
            if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.close();
            }
        });
    },

    loadDefaultActions() {
        // Admin navigation
        this.actions = [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', url: '/admin/dashboard.html', category: 'Navigation' },
            { id: 'campaigns', label: 'Chiến Dịch', icon: 'campaign', url: '/admin/campaigns.html', category: 'Navigation' },
            { id: 'leads', label: 'Khách Hàng', icon: 'people', url: '/admin/leads.html', category: 'Navigation' },
            { id: 'finance', label: 'Tài Chính', icon: 'attach_money', url: '/admin/finance.html', category: 'Navigation' },
            { id: 'hr', label: 'HR & Tuyển Dụng', icon: 'badge', url: '/admin/hr-hiring.html', category: 'Navigation' },
            { id: 'inventory', label: 'Tồn Kho', icon: 'inventory', url: '/admin/inventory.html', category: 'Navigation' },
            { id: 'payments', label: 'Thanh Toán', icon: 'payment', url: '/admin/payments.html', category: 'Navigation' },
            { id: 'reports', label: 'Báo Cáo', icon: 'insights', url: '/admin/quality.html', category: 'Navigation' },

            // Portal navigation
            { id: 'portal-dashboard', label: 'Portal Dashboard', icon: 'dashboard', url: '/portal/dashboard.html', category: 'Portal' },
            { id: 'projects', label: 'Dự Án', icon: 'folder', url: '/portal/projects.html', category: 'Portal' },
            { id: 'missions', label: 'Nhiệm Vụ', icon: 'task', url: '/portal/missions.html', category: 'Portal' },
            { id: 'invoices', label: 'Hóa Đơn', icon: 'receipt', url: '/portal/invoices.html', category: 'Portal' },

            // Actions
            { id: 'dark-mode', label: 'Bật/tối Dark Mode', icon: 'dark_mode', action: () => window.DarkMode?.toggle(), category: 'Actions' },
            { id: 'refresh', label: 'Làm mới trang', icon: 'refresh', action: () => location.reload(), category: 'Actions' },
            { id: 'scroll-top', label: 'Lên đầu trang', icon: 'arrow_upward', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }), category: 'Actions' },
            { id: 'scroll-bottom', label: 'Xuống cuối trang', icon: 'arrow_downward', action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), category: 'Actions' },
        ];
    },

    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    open() {
        this.isOpen = true;
        this.modal.classList.add('open');
        this.input.value = '';
        this.input.focus();
        this.filterActions('');
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.isOpen = false;
        this.modal.classList.remove('open');
        document.body.style.overflow = '';
    },

    filterActions(query) {
        const filtered = query
            ? this.actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
            : this.actions;

        this.renderResults(filtered);
    },

    renderResults(actions) {
        if (actions.length === 0) {
            this.results.innerHTML = `
                <div class="quick-actions-empty">
                    <span class="material-symbols-outlined">search_off</span>
                    <p>Không tìm thấy kết quả</p>
                </div>
            `;
            return;
        }

        // Group by category
        const grouped = actions.reduce((acc, action) => {
            const category = action.category || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(action);
            return acc;
        }, {});

        this.results.innerHTML = Object.entries(grouped).map(([category, items]) => `
            <div class="quick-actions-group">
                <div class="quick-actions-group-title">${category}</div>
                ${items.map((item, idx) => `
                    <div class="quick-actions-item ${idx === 0 ? 'active' : ''}"
                         data-action-id="${item.id}"
                         data-url="${item.url || ''}"
                    >
                        <span class="material-symbols-outlined">${item.icon}</span>
                        <span class="quick-actions-label">${item.label}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');

        // Bind click events
        this.results.querySelectorAll('.quick-actions-item').forEach(item => {
            item.addEventListener('click', () => {
                const actionId = item.dataset.actionId;
                const action = this.actions.find(a => a.id === actionId);
                if (action) {
                    if (action.action) {
                        action.action();
                        this.close();
                    } else if (action.url) {
                        window.location.href = action.url;
                    }
                }
            });
        });

        // Bind keyboard navigation
        this.bindItemNavigation();
    },

    bindItemNavigation() {
        const items = this.results.querySelectorAll('.quick-actions-item');
        let currentIndex = 0;

        const updateActive = () => {
            items.forEach((item, idx) => {
                item.classList.toggle('active', idx === currentIndex);
            });
        };

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                currentIndex = (currentIndex + 1) % items.length;
                updateActive();
                items[currentIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                updateActive();
                items[currentIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                items[currentIndex]?.click();
            }
        });
    },

    handleKeydown(e) {
        // Handled in bindItemNavigation
    },

    addAction(action) {
        this.actions.push(action);
    },

    removeAction(id) {
        this.actions = this.actions.filter(a => a.id !== id);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => QuickActions.init());
} else {
    QuickActions.init();
}
