/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CLIPBOARD UTILS — SA ĐÉC MARKETING HUB
 * Copy to clipboard với feedback và error handling
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const existing = document.querySelector('.clipboard-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'clipboard-toast';
    toast.innerHTML = `
        <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 9999;
        animation: slideUp 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Copy text to clipboard with feedback
 * @param {string} text - Text to copy
 * @param {Object} options
 * @param {string} options.successMessage - Message on success
 * @param {string} options.errorMessage - Message on error
 * @param {boolean} options.showToast - Show toast notification
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text, options = {}) {
    const {
        successMessage = 'Đã sao chép!',
        errorMessage = 'Không thể sao chép',
        showToast = true
    } = options;

    try {
        // Try modern Clipboard API first
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            Logger.info('[Clipboard] Copied via Clipboard API');
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            Logger.info('[Clipboard] Copied via fallback');
        }

        if (showToast) {
            showToast(successMessage, 'success');
        }

        return true;
    } catch (err) {
        Logger.error('[Clipboard] Copy failed:', err);
        if (showToast) {
            showToast(errorMessage, 'error');
        }
        return false;
    }
}

/**
 * Copy with button click handler
 * @param {string} selector - Selector for button elements
 * @param {(el: Element) => string} getText - Function to get text to copy
 * @param {Object} options
 */
export function bindCopyButtons(selector, getText, options = {}) {
    document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('click', async (e) => {
            e.preventDefault();
            const text = getText(el);
            await copyToClipboard(text, options);
        });
    });
}

/**
 * Copy current URL to clipboard
 * @param {Object} options
 * @returns {Promise<boolean>}
 */
export async function copyUrl(options = {}) {
    return copyToClipboard(window.location.href, {
        successMessage: 'Đã sao chép link!',
        ...options
    });
}

/**
 * Copy with animation effect on element
 * @param {Element} el - Element to animate
 * @param {string} text - Text to copy
 */
export async function copyWithAnimation(el, text) {
    const original = el.innerHTML;
    const success = await copyToClipboard(text, { showToast: false });

    if (success) {
        el.innerHTML = '<span class="material-symbols-outlined">check</span> Copied!';
        setTimeout(() => {
            el.innerHTML = original;
        }, 2000);
    }

    return success;
}
