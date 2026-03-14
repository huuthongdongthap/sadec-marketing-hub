/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATA REFRESH INDICATOR — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * 1. Pull-to-refresh indicator
 * 2. Auto-refresh status
 * 3. Last updated timestamp
 * 4. Manual refresh trigger
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

let refreshState = 'idle'; // idle, loading, success, error
let lastRefreshTime = null;
let autoRefreshInterval = null;

/**
 * Create refresh indicator UI
 */
function createRefreshIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'data-refresh-indicator';
    indicator.innerHTML = `
        <div class="refresh-status" style="
            position: fixed;
            top: 70px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            color: white;
            padding: 10px 16px;
            border-radius: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        ">
            <span class="material-symbols-outlined" style="font-size: 16px;">sync</span>
            <span class="refresh-text">Cập nhật...</span>
        </div>
        <div class="last-updated" style="
            position: fixed;
            top: 110px;
            right: 20px;
            font-size: 11px;
            color: rgba(255,255,255,0.5);
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s;
        ">
            Cập nhật: <span class="updated-time">--:--</span>
        </div>
    `;
    document.body.appendChild(indicator);

    // Add pull-to-refresh handler
    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (isPulling) {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            if (diff > 0 && diff < 150) {
                e.preventDefault();
                showPullProgress(diff / 150);
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        if (isPulling && currentY - startY > 100) {
            triggerRefresh();
        }
        isPulling = false;
        currentY = 0;
        hidePullProgress();
    });
}

/**
 * Show pull progress
 */
function showPullProgress(progress) {
    const indicator = document.querySelector('.refresh-status');
    if (indicator) {
        indicator.style.opacity = Math.min(progress, 1);
        indicator.querySelector('.refresh-text').textContent =
            progress > 0.7 ? 'Thả để cập nhật' : 'Kéo để cập nhật';
    }
}

/**
 * Hide pull progress
 */
function hidePullProgress() {
    const indicator = document.querySelector('.refresh-status');
    if (indicator && refreshState === 'idle') {
        indicator.style.opacity = '0';
    }
}

/**
 * Trigger data refresh
 */
async function triggerRefresh() {
    if (refreshState === 'loading') return;

    refreshState = 'loading';
    updateIndicator('loading');

    try {
        // Dispatch custom event for components to listen
        window.dispatchEvent(new CustomEvent('data-refresh'));

        // Simulate refresh (replace with actual API calls)
        await new Promise(resolve => setTimeout(resolve, 1500));

        refreshState = 'success';
        lastRefreshTime = new Date();
        updateIndicator('success');
        updateLastUpdated();

        setTimeout(() => {
            refreshState = 'idle';
            updateIndicator('idle');
        }, 2000);
    } catch (error) {
        refreshState = 'error';
        updateIndicator('error');
        Logger.error('Refresh failed', { error });

        setTimeout(() => {
            refreshState = 'idle';
            updateIndicator('idle');
        }, 3000);
    }
}

/**
 * Update indicator state
 */
function updateIndicator(state) {
    const indicator = document.querySelector('.refresh-status');
    if (!indicator) return;

    const icon = indicator.querySelector('.material-symbols-outlined');
    const text = indicator.querySelector('.refresh-text');

    const states = {
        idle: { icon: 'sync', text: 'Sẵn sàng cập nhật', opacity: 0 },
        loading: { icon: 'sync_problem', text: 'Đang cập nhật...', opacity: 1, spin: true },
        success: { icon: 'check_circle', text: 'Đã cập nhật', opacity: 1, color: '#43e97b' },
        error: { icon: 'error', text: 'Cập nhật thất bại', opacity: 1, color: '#ff5757' }
    };

    const config = states[state];
    icon.textContent = config.icon;
    text.textContent = config.text;
    indicator.style.opacity = config.opacity;

    if (config.color) {
        indicator.style.background = config.color;
    } else {
        indicator.style.background = 'rgba(0, 0, 0, 0.8)';
    }

    if (config.spin) {
        icon.style.animation = 'spin 1s linear infinite';
    } else {
        icon.style.animation = '';
    }
}

/**
 * Update last updated time
 */
function updateLastUpdated() {
    const updatedEl = document.querySelector('.updated-time');
    if (updatedEl && lastRefreshTime) {
        updatedEl.textContent = lastRefreshTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.querySelector('.last-updated').style.opacity = '1';
    }
}

/**
 * Enable auto-refresh
 */
function enableAutoRefresh(intervalMs = 60000) {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }

    autoRefreshInterval = setInterval(() => {
        triggerRefresh();
    }, intervalMs);
}

/**
 * Disable auto-refresh
 */
function disableAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

/**
 * Initialize data refresh indicator
 */
export function initDataRefreshIndicator() {
    if (typeof window !== 'undefined') {
        document.addEventListener('DOMContentLoaded', () => {
            createRefreshIndicator();

            // Add keyboard shortcut (Ctrl+R)
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'r') {
                    e.preventDefault();
                    triggerRefresh();
                }
            });
        });
    }
}

// Export for manual trigger
export { triggerRefresh, enableAutoRefresh, disableAutoRefresh };

// Auto-init
if (typeof window !== 'undefined') {
    initDataRefreshIndicator();
}
