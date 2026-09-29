/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — UX IMPROVEMENTS 2026 v2
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * 1. Skeleton Loading States
 * 2. Pull-to-Refresh (mobile)
 * 3. Swipe Actions (mobile cards)
 * 4. Smart Auto-Save
 * 5. Form Auto-Validation
 * 6. Toast Notifications Queue
 * 7. Confirmation Dialogs
 * 8. Keyboard Shortcuts Help Modal
 *
 * @version 2.0.0 | 2026-03-14
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 1. SKELETON LOADING STATES
// ============================================================================

/**
 * Show skeleton loader
 * @param {string} containerId - Container element ID
 * @param {string} type - Type: 'card', 'table', 'list', 'chart'
 * @param {number} count - Number of skeletons
 */
export function showSkeleton(containerId, type = 'card', count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const skeletonTypes = {
        card: `<div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
        </div>`,
        table: `<div class="skeleton-table">
            ${Array(count).fill('<div class="skeleton-row"></div>').join('')}
        </div>`,
        list: `<div class="skeleton-list">
            ${Array(count).fill('<div class="skeleton-list-item"></div>').join('')}
        </div>`,
        chart: `<div class="skeleton-chart">
            <div class="skeleton-chart-bar"></div>
            <div class="skeleton-chart-bar"></div>
            <div class="skeleton-chart-bar"></div>
        </div>`
    };

    container.innerHTML = skeletonTypes[type] || skeletonTypes.card;
    container.classList.add('loading');
}

/**
 * Hide skeleton loader
 * @param {string} containerId - Container element ID
 */
export function hideSkeleton(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.classList.remove('loading');
}

// ============================================================================
// 2. PULL TO REFRESH (MOBILE)
// ============================================================================

/**
 * Initialize pull-to-refresh
 * @param {Function} onRefresh - Callback when pulled
 */
export function initPullToRefresh(onRefresh) {
    if (window.innerWidth > 768) return; // Only mobile

    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    const threshold = 100;

    const indicator = document.createElement('div');
    indicator.className = 'pull-refresh-indicator';
    indicator.innerHTML = '<span class="material-symbols-outlined">refresh</span>';
    indicator.style.cssText = `
        position: fixed;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: top 0.3s;
        z-index: 9999;
    `;
    document.body.appendChild(indicator);

    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 0 && diff < threshold * 2) {
            e.preventDefault();
            indicator.style.top = `${diff - 60}px`;
            indicator.style.transform = `translateX(-50%) rotate(${diff}deg)`;
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        if (!isPulling) return;
        isPulling = false;

        if (currentY - startY > threshold) {
            indicator.style.top = '20px';
            indicator.classList.add('spinning');
            onRefresh?.();
        }

        setTimeout(() => {
            indicator.style.top = '-60px';
            indicator.classList.remove('spinning');
            currentY = 0;
        }, 500);
    });
}

// ============================================================================
// 3. SWIPE ACTIONS (MOBILE CARDS)
// ============================================================================

/**
 * Initialize swipe actions on cards
 * @param {string} selector - Card selector
 * @param {Object} actions - { left: Function, right: Function }
 */
export function initSwipeActions(selector, actions) {
    if (window.innerWidth > 768) return; // Only mobile

    document.querySelectorAll(selector).forEach(card => {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;

        card.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            card.style.transform = `translateX(${diff}px)`;
        }, { passive: false });

        card.addEventListener('touchend', () => {
            if (!isSwiping) return;
            isSwiping = false;

            const diff = currentX - startX;
            if (diff > 100 && actions?.left) {
                actions.left(card);
            } else if (diff < -100 && actions?.right) {
                actions.right(card);
            }

            card.style.transform = '';
            currentX = 0;
        });
    });
}

// ============================================================================
// 4. SMART AUTO-SAVE
// ============================================================================

/**
 * Auto-save form data to localStorage
 * @param {string} formId - Form element ID
 * @param {string} storageKey - LocalStorage key
 * @param {number} interval - Save interval in ms (default: 5000)
 */
export function initAutoSave(formId, storageKey, interval = 5000) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Load saved data
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.entries(data).forEach(([key, value]) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                }
            });
            showToast('Đã khôi phục dữ liệu tự động lưu');
        } catch (e) {
            // Silent fail - auto-save is optional feature
        }
    }

    // Auto-save on input change
    let saveTimeout;
    form.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            localStorage.setItem(storageKey, JSON.stringify(data));
            showToast('Đã tự động lưu', 2000);
        }, interval);
    });

    // Clear on submit
    form.addEventListener('submit', () => {
        localStorage.removeItem(storageKey);
    });
}

// ============================================================================
// 5. FORM AUTO-VALIDATION
// ============================================================================

/**
 * Real-time form validation with visual feedback
 * @param {string} formId - Form element ID
 * @param {Object} rules - Validation rules
 */
export function initFormValidation(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.classList.add('auto-validate');

    Object.entries(rules).forEach(([field, validators]) => {
        const input = form.querySelector(`[name="${field}"]`);
        if (!input) return;

        input.addEventListener('blur', () => {
            const value = input.value.trim();
            const error = validators.find(rule => {
                if (rule.type === 'required' && !value) return true;
                if (rule.type === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) return true;
                if (rule.type === 'minLength' && value.length < rule.value) return true;
                if (rule.type === 'maxLength' && value.length > rule.value) return true;
                if (rule.type === 'pattern' && rule.value && !rule.value.test(value)) return true;
                return false;
            });

            if (error) {
                input.classList.add('invalid');
                input.setAttribute('aria-invalid', 'true');
                showFieldError(input, error.message);
            } else {
                input.classList.remove('invalid');
                input.removeAttribute('aria-invalid');
                hideFieldError(input);
            }
        });
    });
}

function showFieldError(input, message) {
    let errorEl = input.parentElement.querySelector('.field-error');
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.style.cssText = `
            display: block;
            color: #dc2626;
            font-size: 12px;
            margin-top: 4px;
        `;
        input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
}

function hideFieldError(input) {
    const errorEl = input.parentElement.querySelector('.field-error');
    if (errorEl) {
        errorEl.remove();
    }
}

// ============================================================================
// 6. TOAST NOTIFICATIONS QUEUE
// ============================================================================

const toastQueue = [];
let isShowingToast = false;

/**
 * Show toast notification with queue support
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in ms
 */
export function showToast(message, type = 'info', duration = 3000) {
    toastQueue.push({ message, type, duration });
    processToastQueue();
}

function processToastQueue() {
    if (isShowingToast || toastQueue.length === 0) return;

    isShowingToast = true;
    const { message, type, duration } = toastQueue.shift();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : type === 'warning' ? '#ca8a04' : '#2563eb'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            toast.remove();
            isShowingToast = false;
            processToastQueue();
        }, 300);
    }, duration);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================================================
// 7. CONFIRMATION DIALOGS
// ============================================================================

/**
 * Show confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} - User choice
 */
export function confirm(title, message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
        `;

        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirm-actions">
                <button class="btn-cancel">Huỷ</button>
                <button class="btn-confirm">Xác nhận</button>
            </div>
        `;
        dialog.style.cssText = `
            background: white;
            padding: 24px;
            border-radius: 12px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            animation: scaleIn 0.2s ease;
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        dialog.querySelector('.btn-cancel').onclick = () => {
            overlay.remove();
            resolve(false);
        };

        dialog.querySelector('.btn-confirm').onclick = () => {
            overlay.remove();
            resolve(true);
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        };
    });
}

// ============================================================================
// 8. KEYBOARD SHORTCUTS HELP MODAL
// ============================================================================

/**
 * Show keyboard shortcuts help modal
 * @param {Array} shortcuts - Array of { keys, description }
 */
export function showShortcutsHelp(shortcuts) {
    const overlay = document.createElement('div');
    overlay.className = 'shortcuts-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
    `;

    const modal = document.createElement('div');
    modal.className = 'shortcuts-modal';
    modal.innerHTML = `
        <div class="shortcuts-header">
            <h2>⌨️ Phím Tắt</h2>
            <button class="btn-close">&times;</button>
        </div>
        <div class="shortcuts-list">
            ${shortcuts.map(s => `
                <div class="shortcut-item">
                    <kbd>${s.keys}</kbd>
                    <span>${s.description}</span>
                </div>
            `).join('')}
        </div>
    `;
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        animation: scaleIn 0.2s ease;
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector('.btn-close').onclick = () => overlay.remove();
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };

    // ESC to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.remove();
    }, { once: true });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all UX enhancements
 * @param {Object} options - Configuration options
 */
export function initUXEnhancements(options = {}) {
    const {
        enableSkeleton = true,
        enablePullRefresh = true,
        enableSwipeActions = true,
        enableAutoSave = true,
        enableFormValidation = true,
        shortcuts = []
    } = options;

    if (enablePullRefresh) {
        initPullToRefresh(() => {
            location.reload();
        });
    }

    if (enableSwipeActions) {
        initSwipeActions('.card', {
            left: (card) => showToast('Swipe left action'),
            right: (card) => showToast('Swipe right action')
        });
    }

    if (shortcuts.length > 0) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1' || (e.ctrlKey && e.key === 'h')) {
                e.preventDefault();
                showShortcutsHelp(shortcuts);
            }
        });
    }
}

// Export all functions
export {
    initPullToRefresh,
    initSwipeActions,
    initAutoSave,
    initFormValidation,
    confirm,
    showShortcutsHelp
};
