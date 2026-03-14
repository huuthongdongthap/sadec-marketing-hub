/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOAST NOTIFICATIONS MANAGER
 *
 * Toast/Snackbar notification manager for sadec-marketing-hub
 *
 * Usage:
 *   Toast.show('Message')
 *   Toast.success('Operation completed!')
 *   Toast.error('Something went wrong')
 *   Toast.warning('Please check your input')
 *   Toast.info('New update available')
 *
 * @version 1.0.0 | 2026-03-14
 * @module toast-manager
 * ═══════════════════════════════════════════════════════════════════════════
 */

class ToastManager {
    constructor(options = {}) {
        this.container = null;
        this.toasts = [];
        this.toastId = 0;
        this.options = {
            position: options.position || 'top-right', // top-right, top-left, top-center, bottom-right, bottom-left, bottom-center
            duration: options.duration || 5000,
            maxToasts: options.maxToasts || 5,
            showClose: options.showClose !== false,
            showProgress: options.showProgress !== false,
            ...options
        };
        this.init();
    }

    init() {
        // Create container if not exists
        this.container = document.querySelector('.toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';

            // Set position class
            const positionClass = this.getPositionClass(this.options.position);
            if (positionClass) {
                this.container.classList.add(positionClass);
            }

            document.body.appendChild(this.container);
        }
    }

    getPositionClass(position) {
        const map = {
            'top-right': '',
            'top-left': 'toast-container--left',
            'top-center': 'toast-container--center',
            'bottom-right': 'toast-container--bottom',
            'bottom-left': 'toast-container--bottom toast-container--left',
            'bottom-center': 'toast-container--bottom toast-container--center'
        };
        return map[position] || '';
    }

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {object} options - Toast options
     * @returns {number} Toast ID
     */
    show(message, options = {}) {
        const {
            type = 'info',
            title = null,
            duration = this.options.duration,
            closable = this.options.showClose,
            showProgress = this.options.showProgress,
            actions = [],
            onClose = null,
            icon = null
        } = options;

        // Remove oldest toast if max reached
        if (this.toasts.length >= this.options.maxToasts) {
            const oldest = this.toasts.shift();
            this.remove(oldest.id, false);
        }

        const id = ++this.toastId;
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.dataset.id = id;

        // Build toast content
        let iconHtml = '';
        if (icon) {
            iconHtml = `<span class="material-symbols-outlined">${icon}</span>`;
        } else {
            const defaultIcons = {
                success: 'check_circle',
                error: 'error',
                warning: 'warning',
                info: 'info'
            };
            iconHtml = `<span class="material-symbols-outlined">${defaultIcons[type] || 'info'}</span>`;
        }

        let titleHtml = '';
        if (title) {
            titleHtml = `<div class="toast-title">${this.escapeHtml(title)}</div>`;
        }

        let actionsHtml = '';
        if (actions.length > 0) {
            actionsHtml = '<div class="toast-actions">';
            actions.forEach(action => {
                const btnClass = action.primary ? 'toast-action-btn--primary' : 'toast-action-btn--secondary';
                actionsHtml += `<button class="toast-action-btn ${btnClass}" data-action="${action.id || ''}">${this.escapeHtml(action.label)}</button>`;
            });
            actionsHtml += '</div>';
        }

        let closeHtml = '';
        if (closable) {
            closeHtml = `<button class="toast-close" aria-label="Close"><span class="material-symbols-outlined">close</span></button>`;
        }

        let progressHtml = '';
        if (showProgress && duration > 0) {
            progressHtml = `
                <div class="toast-progress">
                    <div class="toast-progress__bar toast-progress__bar--animating" style="animation-duration: ${duration}ms"></div>
                </div>
            `;
        }

        toast.innerHTML = `
            <div class="toast-icon">${iconHtml}</div>
            <div class="toast-content">
                ${titleHtml}
                <div class="toast-message">${this.escapeHtml(message)}</div>
                ${actionsHtml}
            </div>
            ${closeHtml}
            ${progressHtml}
        `;

        // Add event listeners
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.remove(id, true, onClose));
        }

        // Handle action buttons
        const actionBtns = toast.querySelectorAll('.toast-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const actionId = e.target.dataset.action;
                const action = actions.find(a => a.id === actionId);
                if (action && action.onClick) {
                    action.onClick();
                }
                this.remove(id, true, onClose);
            });
        });

        // Auto dismiss
        if (duration > 0) {
            toast.dismissTimer = setTimeout(() => {
                this.remove(id, true, onClose);
            }, duration);
        }

        // Add to container
        this.container.appendChild(toast);
        this.toasts.push({ id, element: toast });

        // Handle click outside
        toast.addEventListener('click', (e) => {
            if (e.target === toast) {
                this.remove(id, true, onClose);
            }
        });

        return id;
    }

    /**
     * Show success toast
     */
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    /**
     * Show error toast
     */
    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }

    /**
     * Show warning toast
     */
    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    /**
     * Show info toast
     */
    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    /**
     * Remove a toast by ID
     */
    remove(id, animate = true, callback = null) {
        const index = this.toasts.findIndex(t => t.id === id);
        if (index === -1) return;

        const toast = this.toasts[index].element;

        // Clear dismiss timer
        if (toast.dismissTimer) {
            clearTimeout(toast.dismissTimer);
        }

        if (animate) {
            toast.classList.add('toast--exiting');
            toast.addEventListener('animationend', () => {
                toast.remove();
                if (callback) callback();
            });
        } else {
            toast.remove();
            if (callback) callback();
        }

        this.toasts.splice(index, 1);
    }

    /**
     * Remove all toasts
     */
    clear() {
        [...this.toasts].forEach(t => this.remove(t.id, true));
    }

    /**
     * Update toast position
     */
    setPosition(position) {
        this.container.className = 'toast-container';
        const positionClass = this.getPositionClass(position);
        if (positionClass) {
            this.container.classList.add(positionClass);
        }
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
window.Toast = new ToastManager();

// Export for ES modules
export default ToastManager;
