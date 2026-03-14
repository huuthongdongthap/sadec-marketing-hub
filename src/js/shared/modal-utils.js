/**
 * Sa Đéc Marketing Hub - Shared Modal Utilities
 *
 * Centralized ModalManager for consistent modal dialogs across the app.
 * Replaces duplicate ModalManager implementations in:
 *   - admin/admin-utils.js
 *   - portal/portal-ui.js
 *   - pipeline-client.js
 *
 * @module shared/modal-utils
 */

/**
 * ModalManager - Unified modal dialog manager
 *
 * Features:
 * - Auto-creates overlay
 * - Backdrop click to close
 * - ESC key to close
 * - Smooth animations
 * - Stackable modals
 *
 * @example
 * import { ModalManager } from '../shared/modal-utils.js';
 * const modal = new ModalManager();
 * modal.open('<h2>Hello</h2>');
 */
export class ModalManager {
    constructor(options = {}) {
        this.overlay = null;
        this.modal = null;
        this.escHandler = null;
        this.options = {
            closeOnBackdrop: true,
            closeOnEsc: true,
            zIndex: 9999,
            ...options
        };
    }

    /**
     * Open modal with content
     * @param {string|HTMLElement} content - HTML string or DOM element
     * @param {Object} options - Override default options
     */
    open(content, options = {}) {
        const opts = { ...this.options, ...options };

        // Create or reuse overlay
        if (!document.getElementById('modal-overlay')) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'modal-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: ${opts.zIndex - 1};
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            if (opts.closeOnBackdrop) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) {
                        this.close();
                    }
                });
            }

            document.body.appendChild(this.overlay);
        } else {
            this.overlay = document.getElementById('modal-overlay');
        }

        // Create modal content
        this.modal = document.createElement('div');
        this.modal.className = 'modal-content';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.style.cssText = `
            background: var(--md-sys-color-surface, #fff);
            border-radius: 16px;
            max-width: 560px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transform: scale(0.9);
            transition: transform 0.3s ease;
            position: relative;
        `;

        // Handle content types
        if (typeof content === 'string') {
            this.modal.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.modal.innerHTML = '';
            this.modal.appendChild(content);
        }

        this.overlay.appendChild(this.modal);

        // Animate in
        requestAnimationFrame(() => {
            this.overlay.style.opacity = '1';
            this.modal.style.transform = 'scale(1)';
        });

        // Close button handler (delegated)
        this.modal.querySelector('.modal-close')?.addEventListener('click', () => this.close());

        // ESC key handler
        if (opts.closeOnEsc) {
            this.escHandler = (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            };
            document.addEventListener('keydown', this.escHandler);
        }

        // Focus trap (optional enhancement)
        this._trapFocus();
    }

    /**
     * Close the modal
     */
    close() {
        if (!this.overlay) return;

        this.overlay.style.opacity = '0';
        this.modal?.style.setProperty('transform', 'scale(0.9)');

        setTimeout(() => {
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
                this.modal = null;
            }
            if (this.escHandler) {
                document.removeEventListener('keydown', this.escHandler);
                this.escHandler = null;
            }
        }, 300);
    }

    /**
     * Update modal content
     * @param {string|HTMLElement} content - New content
     */
    updateContent(content) {
        if (!this.modal) return;

        if (typeof content === 'string') {
            this.modal.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.modal.innerHTML = '';
            this.modal.appendChild(content);
        }
    }

    /**
     * Set modal title
     * @param {string} title - Title text
     */
    setTitle(title) {
        const titleEl = this.modal?.querySelector('.modal-title');
        if (titleEl) {
            titleEl.textContent = title;
        }
    }

    /**
     * Focus trap for accessibility
     * @private
     */
    _trapFocus() {
        const focusableElements = this.modal?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements?.length) {
            const firstEl = focusableElements[0];
            const lastEl = focusableElements[focusableElements.length - 1];

            this.modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl.focus();
                    } else if (!e.shiftKey && document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            });

            firstEl.focus();
        }
    }
}

/**
 * ToastManager - Unified toast notification manager
 *
 * Re-exported from assets/js/components/toast-manager.js for convenience
 * Import directly from there for new code.
 */
export { ToastManager } from '../../../assets/js/components/toast-manager.js';
export { Toast } from '../../../assets/js/components/toast-manager.js';

/**
 * Convenience modal instances
 */
export const modal = new ModalManager();

/**
 * Quick modal helpers
 */
export const modalHelpers = {
    /**
     * Show alert modal with message
     * @param {string} message - Alert message
     * @param {string} title - Optional title
     * @returns {Promise<void>}
     */
    alert(message, title = 'Thông báo') {
        return new Promise((resolve) => {
            const content = `
                <div style="padding: 24px;">
                    <h2 class="modal-title" style="margin-bottom: 16px; font-size: 20px;">${title}</h2>
                    <p style="margin-bottom: 24px; color: var(--md-sys-color-on-surface-variant, #666);">${message}</p>
                    <button id="modal-ok-btn" style="padding: 12px 24px; border-radius: 8px; border: none; background: var(--md-sys-color-primary, #0066cc); color: white; cursor: pointer;">OK</button>
                </div>
            `;
            modal.open(content);
            document.getElementById('modal-ok-btn')?.addEventListener('click', () => {
                modal.close();
                resolve();
            });
        });
    },

    /**
     * Show confirm modal
     * @param {string} message - Confirm message
     * @param {string} title - Optional title
     * @returns {Promise<boolean>}
     */
    confirm(message, title = 'Xác nhận') {
        return new Promise((resolve) => {
            const content = `
                <div style="padding: 24px;">
                    <h2 class="modal-title" style="margin-bottom: 16px; font-size: 20px;">${title}</h2>
                    <p style="margin-bottom: 24px; color: var(--md-sys-color-on-surface-variant, #666);">${message}</p>
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="modal-cancel-btn" style="padding: 12px 24px; border-radius: 8px; border: 1px solid #ddd; background: white; cursor: pointer;">Hủy</button>
                        <button id="modal-confirm-btn" style="padding: 12px 24px; border-radius: 8px; border: none; background: var(--md-sys-color-primary, #0066cc); color: white; cursor: pointer;">Xác nhận</button>
                    </div>
                </div>
            `;
            modal.open(content);

            document.getElementById('modal-cancel-btn')?.addEventListener('click', () => {
                modal.close();
                resolve(false);
            });

            document.getElementById('modal-confirm-btn')?.addEventListener('click', () => {
                modal.close();
                resolve(true);
            });
        });
    }
};

/**
 * Default export
 */
export default {
    ModalManager,
    Toast,
    ToastManager,
    modal,
    modalHelpers
};
