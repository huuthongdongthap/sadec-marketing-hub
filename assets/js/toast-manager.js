/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOAST MANAGER - Sa Đéc Marketing Hub
 * Unified toast notification manager with queue support
 *
 * Usage:
 *   ToastManager.success('Đã lưu thành công!');
 *   ToastManager.error('Có lỗi xảy ra');
 *   ToastManager.warning('Cảnh báo: Dữ liệu chưa được lưu');
 *   ToastManager.info('Đang xử lý...');
 *   ToastManager.show('Custom', 'Message', 'info', 5000);
 *
 * Advanced:
 *   ToastManager.queue([
 *     { type: 'info', title: 'Step 1', message: 'Đang tải...' },
 *     { type: 'success', title: 'Hoàn thành', message: 'Xong!' }
 *   ]);
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from './shared/logger.js';

const ToastManager = {
    /**
     * Container element
     */
    _container: null,

    /**
     * Toast queue for sequential display
     */
    _queue: [],

    /**
     * Currently displaying toast
     */
    _current: null,

    /**
     * Default configuration
     */
    defaults: {
        duration: 3000,
        position: 'top-right',
        maxVisible: 3,
        closeButton: true
    },

    /**
     * Get or create toast container
     */
    _getContainer() {
        if (this._container) return this._container;

        this._container = document.createElement('div');
        this._container.id = 'toast-container';
        this._container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        `;
        document.body.appendChild(this._container);

        return this._container;
    },

    /**
     * Create toast notification
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Auto-dismiss duration (ms)
     * @returns {HTMLElement} Toast element
     */
    show(title, message = '', type = 'info', duration = null) {
        const container = this._getContainer();
        const toastDuration = duration ?? this.defaults.duration;

        const toast = document.createElement('toast-component');
        toast.setAttribute('type', type);
        toast.setAttribute('title', title);
        if (message) toast.setAttribute('message', message);
        if (duration !== null) toast.setAttribute('duration', duration.toString());

        // Add with pointer events enabled
        toast.style.pointerEvents = 'auto';

        container.appendChild(toast);

        // Log in development
        if (window.Logger) {
            Logger.log(`[Toast] ${type.toUpperCase()}: ${title} - ${message}`);
        }

        return toast;
    },

    /**
     * Success toast
     * @param {string} message - Success message
     * @param {number} duration - Duration (ms)
     */
    success(message, duration = null) {
        return this.show('Thành công', message, 'success', duration);
    },

    /**
     * Error toast
     * @param {string} message - Error message
     * @param {number} duration - Duration (ms)
     */
    error(message, duration = null) {
        return this.show('Lỗi', message, 'error', duration ?? 5000);
    },

    /**
     * Warning toast
     * @param {string} message - Warning message
     * @param {number} duration - Duration (ms)
     */
    warning(message, duration = null) {
        return this.show('Cảnh báo', message, 'warning', duration);
    },

    /**
     * Info toast
     * @param {string} message - Info message
     * @param {number} duration - Duration (ms)
     */
    info(message, duration = null) {
        return this.show('Thông báo', message, 'info', duration);
    },

    /**
     * Loading toast with auto-dismiss
     * @param {string} message - Loading message
     * @returns {Object} Toast controller with dismiss() method
     */
    loading(message) {
        const toast = this.show('Đang xử lý', message, 'info', 0);
        return {
            dismiss: () => {
                if (toast && typeof toast.dismiss === 'function') {
                    toast.dismiss();
                }
            },
            update: (newMessage, type = 'success') => {
                toast.setAttribute('title', type === 'success' ? 'Thành công' : 'Lỗi');
                toast.setAttribute('message', newMessage);
                toast.setAttribute('type', type);
                toast.setAttribute('duration', '3000');
            }
        };
    },

    /**
     * Queue multiple toasts for sequential display
     * @param {Array} toasts - Array of toast configs
     */
    queue(toasts) {
        if (!Array.isArray(toasts)) {
            Logger.warn('[ToastManager] queue() expects an array');
            return;
        }

        this._queue = [...this._queue, ...toasts];
        this._processQueue();
    },

    /**
     * Process toast queue
     */
    _processQueue() {
        if (this._current || this._queue.length === 0) return;

        const next = this._queue.shift();
        this._current = this.show(
            next.title || 'Thông báo',
            next.message || '',
            next.type || 'info',
            next.duration ?? this.defaults.duration
        );

        // Listen for dismiss to process next
        this._current.addEventListener('toast-dismiss', () => {
            this._current = null;
            setTimeout(() => this._processQueue(), 300);
        }, { once: true });

        // Auto-process next after duration
        setTimeout(() => {
            if (this._current && this._queue.length > 0) {
                this._current.dismiss();
            }
        }, next.duration ?? this.defaults.duration);
    },

    /**
     * Clear all toasts
     */
    clear() {
        if (this._container) {
            this._container.innerHTML = '';
            this._queue = [];
            this._current = null;
        }
    },

    /**
     * Set position
     * @param {string} position - Position (top-right, top-left, bottom-right, bottom-left)
     */
    setPosition(position) {
        const container = this._getContainer();
        const positions = {
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;'
        };
        container.style.cssText = `
            position: fixed;
            ${positions[position] || positions['top-right']}
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        `;
    }
};

// Export for module usage
// Export for ES modules
export default ToastManager;

// Global access
window.ToastManager = ToastManager;
