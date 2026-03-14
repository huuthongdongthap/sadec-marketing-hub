/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OFFLINE DETECTION — SA ĐÉC MARKETING HUB
 * Phát hiện mất kết nối và hiển thị notification
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

/**
 * Offline detection state
 */
let isOnline = navigator.onLine;
let listeners = [];

/**
 * Show offline notification banner
 */
function showOfflineBanner() {
    const existing = document.querySelector('.offline-banner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.className = 'offline-banner';
    banner.innerHTML = `
        <span class="material-symbols-outlined">cloud_off</span>
        <span>Không có kết nối Internet</span>
        <button class="dismiss-btn" aria-label="Đóng">close</button>
    `;
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff9800;
        color: white;
        padding: 12px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        animation: slideDown 0.3s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }
        .offline-banner .dismiss-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(banner);

    banner.querySelector('.dismiss-btn')?.addEventListener('click', () => {
        banner.style.animation = 'slideDown 0.3s ease reverse';
        setTimeout(() => banner.remove(), 300);
    });

    Logger.info('[Offline] Banner shown');
}

/**
 * Hide offline notification banner
 */
function hideOfflineBanner() {
    const banner = document.querySelector('.offline-banner');
    if (banner) {
        banner.style.animation = 'slideDown 0.3s ease reverse';
        setTimeout(() => banner.remove(), 300);
    }
    Logger.info('[Offline] Banner hidden');
}

/**
 * Handle online status change
 */
function handleStatusChange() {
    const wasOnline = isOnline;
    isOnline = navigator.onLine;

    if (!isOnline) {
        showOfflineBanner();
        Logger.warn('[Offline] Went offline');
    } else {
        hideOfflineBanner();
        Logger.info('[Offline] Back online');
    }

    // Notify listeners
    listeners.forEach(cb => cb(isOnline));
}

/**
 * Subscribe to online/offline events
 * @param {(online: boolean) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function onConnectionChange(callback) {
    listeners.push(callback);
    return () => {
        listeners = listeners.filter(l => l !== callback);
    };
}

/**
 * Check if currently online
 * @returns {boolean}
 */
export function checkOnline() {
    return isOnline;
}

/**
 * Initialize offline detection
 */
export function init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Check initial state
    if (!navigator.onLine) {
        showOfflineBanner();
    }

    Logger.info('[Offline] Detection initialized');
}

/**
 * Cleanup
 */
export function destroy() {
    window.removeEventListener('online', handleStatusChange);
    window.removeEventListener('offline', handleStatusChange);
    listeners = [];
}

// Auto-init on DOM ready
if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
