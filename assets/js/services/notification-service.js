/**
 * ============================================================================
 * MEKONG AGENCY - NOTIFICATION SERVICE
 * ============================================================================
 *
 * Centralized notification/toast service for the entire application.
 * Replaces duplicate showToast functions across multiple files.
 *
 * USAGE:
 *   import { notify } from './notification-service.js';
 *
 *   notify.success('Operation completed!');
 *   notify.error('Something went wrong');
 *   notify.warning('Please check your input');
 *   notify.info('New message received');
 *
 *   // Or use shorthand
 *   import { success, error, warning, info } from './notification-service.js';
 *   success('Done!');
 *   error('Failed!');
 */

// ===== TOAST CONTAINER MANAGEMENT =====
let toastContainer = null;

function getContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        // Position: top-right, fixed
        Object.assign(toastContainer.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none'
        });
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

// ===== TOAST STYLES (injected dynamically) =====
const TOAST_STYLES = `
    .toast-notification {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 18px;
        border-radius: 12px;
        background: white;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        border-left: 4px solid;
        min-width: 280px;
        max-width: 420px;
        pointer-events: auto;
        animation: toast-in 0.3s ease-out;
        font-family: system-ui, -apple-system, sans-serif;
    }

    .toast-notification.success { border-color: #10b981; }
    .toast-notification.error { border-color: #ef4444; }
    .toast-notification.warning { border-color: #f59e0b; }
    .toast-notification.info { border-color: #3b82f6; }

    .toast-notification .icon {
        font-size: 20px;
        flex-shrink: 0;
    }

    .toast-notification.success .icon { color: #10b981; }
    .toast-notification.error .icon { color: #ef4444; }
    .toast-notification.warning .icon { color: #f59e0b; }
    .toast-notification.info .icon { color: #3b82f6; }

    .toast-notification .message {
        flex: 1;
        color: #1f2937;
        font-size: 14px;
        line-height: 1.4;
    }

    .toast-notification .close-btn {
        background: none;
        border: none;
        font-size: 18px;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: color 0.2s;
    }

    .toast-notification .close-btn:hover {
        color: #4b5563;
    }

    @keyframes toast-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes toast-out {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Inject styles once
let stylesInjected = false;
function injectStyles() {
    if (!stylesInjected && !document.getElementById('notification-service-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-service-styles';
        styleSheet.textContent = TOAST_STYLES;
        document.head.appendChild(styleSheet);
        stylesInjected = true;
    }
}

// ===== ICONS =====
const ICONS = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
};

// ===== MAIN NOTIFICATION FUNCTION =====
/**
 * Show a notification toast
 * @param {string} message - Message to display
 * @param {string} type - Type: success, error, warning, info
 * @param {number} duration - Duration in milliseconds (default: 4000)
 * @param {Function} onClose - Callback when toast closes
 */
export function notify(message, type = 'info', duration = 4000, onClose) {
    injectStyles();
    const container = getContainer();

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <span class="icon">${ICONS[type] || ICONS.info}</span>
        <span class="message">${escapeHtml(message)}</span>
        <button class="close-btn" aria-label="Close">${ICONS.close || '✕'}</button>
    `;

    // Close handler
    const closeBtn = toast.querySelector('.close-btn');
    const closeToast = () => {
        toast.style.animation = 'toast-out 0.3s forwards';
        setTimeout(() => {
            toast.remove();
            if (onClose) onClose();
            // Clean up container if empty
            if (container.children.length === 0) {
                container.remove();
                toastContainer = null;
            }
        }, 300);
    };

    closeBtn.addEventListener('click', closeToast);

    // Auto-close
    if (duration > 0) {
        setTimeout(closeToast, duration);
    }

    container.appendChild(toast);
    return closeToast; // Return close function for manual control
}

// ===== HELPER FUNCTIONS =====
export function success(message, duration = 4000) {
    return notify(message, 'success', duration);
}

export function error(message, duration = 5000) {
    return notify(message, 'error', duration);
}

export function warning(message, duration = 4000) {
    return notify(message, 'warning', duration);
}

export function info(message, duration = 4000) {
    return notify(message, 'info', duration);
}

// ===== UTILITY =====
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== CLOSE ALL TOASTS =====
export function closeAll() {
    if (toastContainer) {
        const toasts = Array.from(toastContainer.children);
        toasts.forEach(toast => {
            toast.style.animation = 'toast-out 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        });
        setTimeout(() => {
            toastContainer.remove();
            toastContainer = null;
        }, 300);
    }
}

// ===== EXPORT DEFAULT =====
export default {
    notify,
    success,
    error,
    warning,
    info,
    closeAll
};
