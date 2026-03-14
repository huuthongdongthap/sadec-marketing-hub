/**
 * Sa Đéc Marketing Hub — Notification Badge Utility
 * Badge đếm notification với real-time updates
 */

const NotificationBadge = {
    STORAGE_KEY: 'sadec-notification-count',
    container: null,

    init() {
        this.findOrCreateContainer();
        this.render();
        this.loadFromStorage();
        this.bindRefresh();
    },

    findOrCreateContainer() {
        // Try to find existing badge
        this.container = document.querySelector('[data-notification-badge]');

        // Create if not exists
        if (!this.container) {
            this.container = document.createElement('span');
            this.container.setAttribute('data-notification-badge', '');
            this.container.className = 'notification-badge';

            // Try to position near user icon / profile
            const profileIcon = document.querySelector('.profile-icon, .user-menu, [data-user]');
            if (profileIcon) {
                profileIcon.style.position = 'relative';
                this.container.style.position = 'absolute';
                this.container.style.top = '-8px';
                this.container.style.right = '-8px';
                profileIcon.appendChild(this.container);
            } else {
                // Fallback: create in header
                const header = document.querySelector('header, .header, .top-nav');
                if (header) {
                    header.appendChild(this.container);
                }
            }
        }
    },

    render() {
        const count = parseInt(localStorage.getItem(this.STORAGE_KEY) || '0', 10);

        if (count <= 0) {
            this.container.style.display = 'none';
        } else if (count > 99) {
            this.container.textContent = '99+';
            this.container.style.display = 'inline-flex';
        } else {
            this.container.textContent = count;
            this.container.style.display = 'inline-flex';
        }
    },

    loadFromStorage() {
        this.render();
    },

    setCount(count) {
        localStorage.setItem(this.STORAGE_KEY, count.toString());
        this.render();
        this.dispatchUpdate(count);
    },

    increment(delta = 1) {
        const current = parseInt(localStorage.getItem(this.STORAGE_KEY) || '0', 10);
        this.setCount(current + delta);
    },

    decrement(delta = 1) {
        const current = parseInt(localStorage.getItem(this.STORAGE_KEY) || '0', 10);
        this.setCount(Math.max(0, current - delta));
    },

    clear() {
        this.setCount(0);
    },

    bindRefresh() {
        // Listen for custom refresh events
        window.addEventListener('notification-refresh', (e) => {
            if (e.detail && typeof e.detail.count === 'number') {
                this.setCount(e.detail.count);
            }
        });

        // Poll for updates (optional - can be configured)
        if (this.container.hasAttribute('data-poll-interval')) {
            const interval = parseInt(this.container.getAttribute('data-poll-interval'), 10) || 30000;
            setInterval(() => this.fetchCount(), interval);
        }
    },

    async fetchCount() {
        // Override this method to fetch from API
        // Example:
        // const response = await fetch('/api/notifications/count');
        // const data = await response.json();
        // this.setCount(data.count);
    },

    dispatchUpdate(count) {
        window.dispatchEvent(new CustomEvent('notification-badge-update', {
            detail: { count }
        }));
    }
};

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotificationBadge.init());
} else {
    NotificationBadge.init();
}
