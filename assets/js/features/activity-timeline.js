/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACTIVITY TIMELINE — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - User activity feed
 * - Real-time updates
 * - Filter by type
 * - Group by date
 * - Interactive timeline
 * - Export activity log
 *
 * Usage:
 *   import { initActivityTimeline, addActivity } from './activity-timeline.js';
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

const STORAGE_KEY = 'sadec-activity-timeline';

const ACTIVITY_TYPES = {
    LOGIN: { icon: 'login', label: 'Đăng nhập', color: '#4caf50' },
    LOGOUT: { icon: 'logout', label: 'Đăng xuất', color: '#9e9e9e' },
    CREATE: { icon: 'add_circle', label: 'Tạo mới', color: '#2196f3' },
    UPDATE: { icon: 'edit', label: 'Cập nhật', color: '#ff9800' },
    DELETE: { icon: 'delete', label: 'Xóa', color: '#f44336' },
    EXPORT: { icon: 'download', label: 'Xuất file', color: '#9c27b0' },
    IMPORT: { icon: 'upload', label: 'Nhập file', color: '#673ab7' },
    VIEW: { icon: 'visibility', label: 'Xem', color: '#03a9f4' },
    SHARE: { icon: 'share', label: 'Chia sẻ', color: '#e91e63' },
    COMMENT: { icon: 'comment', label: 'Bình luận', color: '#00bcd4' },
    LIKE: { icon: 'favorite', label: 'Yêu thích', color: '#e91e63' },
    UPLOAD: { icon: 'cloud_upload', label: 'Tải lên', color: '#3f51b5' },
    DOWNLOAD: { icon: 'cloud_download', label: 'Tải xuống', color: '#009688' },
    SETTINGS: { icon: 'settings', label: 'Cài đặt', color: '#607d8b' },
    CUSTOM: { icon: 'radio_button_unchecked', label: 'Khác', color: '#757575' }
};

let activities = [];

/**
 * Initialize activity timeline
 */
export function initActivityTimeline() {
    // Load activities from storage
    loadActivities();

    // Create widget
    createWidget();

    // Render activities
    renderActivities();

    // Listen for custom activity events
    window.addEventListener('activity-add', handleActivityEvent);

    Logger.info('[ActivityTimeline] Initialized');
}

/**
 * Load activities from localStorage
 */
function loadActivities() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        activities = stored ? JSON.parse(stored) : [];

        // Keep only last 100 activities
        if (activities.length > 100) {
            activities = activities.slice(-100);
            saveActivities();
        }

        Logger.debug('[ActivityTimeline] Loaded', activities.length, 'activities');
    } catch (error) {
        Logger.error('[ActivityTimeline] Load error:', error);
        activities = [];
    }
}

/**
 * Save activities to localStorage
 */
function saveActivities() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
        Logger.debug('[ActivityTimeline] Saved', activities.length, 'activities');
    } catch (error) {
        Logger.error('[ActivityTimeline] Save error:', error);
    }
}

/**
 * Add new activity
 */
export function addActivity(type, description, metadata = {}) {
    const activity = {
        id: Date.now().toString(),
        type: type.toUpperCase(),
        description,
        metadata,
        timestamp: new Date().toISOString(),
        userId: metadata.userId || getCurrentUserId()
    };

    activities.unshift(activity);
    saveActivities();
    renderActivities();

    Logger.info('[ActivityTimeline] Added activity:', type, description);

    return activity;
}

/**
 * Handle activity event
 */
function handleActivityEvent(event) {
    const { type, description, metadata } = event.detail;
    addActivity(type, description, metadata);
}

/**
 * Get current user ID (placeholder)
 */
function getCurrentUserId() {
    try {
        const user = localStorage.getItem('sadec-user');
        return user ? JSON.parse(user).id : 'anonymous';
    } catch {
        return 'anonymous';
    }
}

/**
 * Create widget container
 */
function createWidget() {
    if (document.getElementById('activity-timeline-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'activity-timeline-widget';
    widget.className = 'activity-timeline-widget';

    widget.innerHTML = `
        <div class="activity-timeline-header">
            <div class="activity-timeline-title">
                <span class="material-symbols-outlined">timeline</span>
                Hoạt Động Gần Đây
            </div>
            <div class="activity-timeline-actions">
                <select class="activity-filter" aria-label="Lọc hoạt động">
                    <option value="all">Tất cả</option>
                    ${Object.entries(ACTIVITY_TYPES).map(([key, type]) =>
                        `<option value="${key}">${type.label}</option>`
                    ).join('')}
                </select>
                <button class="activity-refresh" aria-label="Làm mới" title="Làm mới">
                    <span class="material-symbols-outlined">refresh</span>
                </button>
                <button class="activity-export" aria-label="Xuất file" title="Xuất file">
                    <span class="material-symbols-outlined">download</span>
                </button>
            </div>
        </div>
        <div class="activity-timeline-content">
            <div class="activity-timeline-list"></div>
            <div class="activity-timeline-empty">
                <span class="material-symbols-outlined">history</span>
                <p>Chưa có hoạt động nào</p>
            </div>
        </div>
    `;

    // Add event listeners
    const filterSelect = widget.querySelector('.activity-filter');
    filterSelect?.addEventListener('change', (e) => filterActivities(e.target.value));

    widget.querySelector('.activity-refresh')?.addEventListener('click', () => {
        renderActivities();
        showToast('Đã làm mới hoạt động');
    });

    widget.querySelector('.activity-export')?.addEventListener('click', exportActivities);

    // Add to page
    const target = document.querySelector('.admin-sidebar') ||
                   document.querySelector('.dashboard-content') ||
                   document.body;

    target.appendChild(widget);

    // Add styles
    addStyles();

    Logger.debug('[ActivityTimeline] Widget created');
}

/**
 * Filter activities by type
 */
function filterActivities(filterType) {
    const list = document.querySelector('.activity-timeline-list');
    const empty = document.querySelector('.activity-timeline-empty');

    if (!list) return;

    let filtered = activities;
    if (filterType !== 'all') {
        filtered = activities.filter(a => a.type === filterType);
    }

    if (filtered.length === 0) {
        empty.style.display = 'flex';
        list.innerHTML = '';
    } else {
        empty.style.display = 'none';
        list.innerHTML = renderTimeline(filtered);
    }

    Logger.debug('[ActivityTimeline] Filtered by:', filterType);
}

/**
 * Render activities grouped by date
 */
function renderActivities() {
    const list = document.querySelector('.activity-timeline-list');
    const empty = document.querySelector('.activity-timeline-empty');

    if (!list) return;

    if (activities.length === 0) {
        empty.style.display = 'flex';
        list.innerHTML = '';
    } else {
        empty.style.display = 'none';
        list.innerHTML = renderTimeline(activities);
    }
}

/**
 * Render timeline HTML
 */
function renderTimeline(items) {
    const grouped = groupByDate(items);

    return Object.entries(grouped).map(([date, dateActivities]) => `
        <div class="activity-date-group">
            <div class="activity-date-header">${formatDateHeader(date)}</div>
            <div class="activity-items">
                ${dateActivities.map(activity => renderActivityItem(activity)).join('')}
            </div>
        </div>
    `).join('');
}

/**
 * Render single activity item
 */
function renderActivityItem(activity) {
    const typeConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.CUSTOM;
    const time = formatTime(activity.timestamp);

    return `
        <div class="activity-item" data-id="${activity.id}">
            <div class="activity-line"></div>
            <div class="activity-dot" style="background-color: ${typeConfig.color}">
                <span class="material-symbols-outlined">${typeConfig.icon}</span>
            </div>
            <div class="activity-content">
                <div class="activity-header">
                    <div class="activity-type" style="color: ${typeConfig.color}">
                        ${typeConfig.label}
                    </div>
                    <div class="activity-time">${time}</div>
                </div>
                <div class="activity-description">${escapeHtml(activity.description)}</div>
                ${activity.metadata?.target ? `
                    <div class="activity-meta">
                        <span class="material-symbols-outlined">label</span>
                        ${escapeHtml(activity.metadata.target)}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Group activities by date
 */
function groupByDate(items) {
    const groups = {};

    items.forEach(activity => {
        const date = activity.timestamp.split('T')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(activity);
    });

    // Sort dates descending
    return Object.fromEntries(
        Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]))
    );
}

/**
 * Format date header
 */
function formatDateHeader(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Hôm qua';
    } else {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

/**
 * Format time
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Export activities to CSV
 */
function exportActivities() {
    if (activities.length === 0) {
        showToast('Không có hoạt động để xuất');
        return;
    }

    const headers = ['Thời gian', 'Loại', 'Mô tả', 'Người dùng'];
    const rows = activities.map(a => {
        const typeConfig = ACTIVITY_TYPES[a.type] || ACTIVITY_TYPES.CUSTOM;
        return [
            new Date(a.timestamp).toLocaleString('vi-VN'),
            typeConfig.label,
            a.description.replace(/,/g, ' '),
            a.userId
        ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Download CSV
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    Logger.info('[ActivityTimeline] Exported', activities.length, 'activities');
    showToast('Đã xuất hoạt động');
}

/**
 * Show toast notification
 */
function showToast(message) {
    let toast = document.getElementById('activity-toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'activity-toast';
        toast.className = 'activity-toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
    }, 2000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Add styles
 */
function addStyles() {
    if (document.getElementById('activity-timeline-styles')) return;

    const style = document.createElement('style');
    style.id = 'activity-timeline-styles';
    style.textContent = `
        /* Widget container */
        .activity-timeline-widget {
            margin: 20px;
            background: var(--md-sys-color-surface, #fff);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
            overflow: hidden;
        }

        /* Header */
        .activity-timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: var(--md-sys-color-surface-container, #f8f9fa);
            border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
        }

        .activity-timeline-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 16px;
            color: var(--md-sys-color-on-surface, #333);
        }

        .activity-timeline-title .material-symbols-outlined {
            color: var(--md-sys-color-primary, #2e7d32);
        }

        .activity-timeline-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .activity-filter {
            padding: 6px 12px;
            border: 1px solid var(--md-sys-color-outline, #ddd);
            border-radius: 8px;
            font-size: 13px;
            background: var(--md-sys-color-surface, #fff);
            color: var(--md-sys-color-on-surface, #333);
            cursor: pointer;
            outline: none;
        }

        .activity-filter:focus {
            border-color: var(--md-sys-color-primary, #2e7d32);
        }

        .activity-refresh,
        .activity-export {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: none;
            background: transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }

        .activity-refresh:hover,
        .activity-export:hover {
            background: var(--md-sys-color-surface-container-hover, #e8e8e8);
        }

        .activity-refresh .material-symbols-outlined,
        .activity-export .material-symbols-outlined {
            color: var(--md-sys-color-on-surface-variant, #666);
            font-size: 20px;
        }

        /* Content */
        .activity-timeline-content {
            padding: 16px;
            max-height: 500px;
            overflow-y: auto;
        }

        .activity-timeline-list {
            position: relative;
        }

        .activity-timeline-empty {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
            color: var(--md-sys-color-on-surface-variant, #999);
        }

        .activity-timeline-empty .material-symbols-outlined {
            font-size: 48px;
            margin-bottom: 12px;
            opacity: 0.5;
        }

        .activity-timeline-empty p {
            margin: 0;
            font-size: 14px;
        }

        /* Date group */
        .activity-date-group {
            margin-bottom: 24px;
        }

        .activity-date-header {
            font-size: 12px;
            font-weight: 600;
            color: var(--md-sys-color-on-surface-variant, #999);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            padding-left: 36px;
        }

        /* Activity item */
        .activity-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 16px;
            position: relative;
        }

        .activity-line {
            position: absolute;
            left: 17px;
            top: 36px;
            bottom: -16px;
            width: 2px;
            background: var(--md-sys-color-outline-variant, #e0e0e0);
        }

        .activity-item:last-child .activity-line {
            display: none;
        }

        .activity-dot {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            background: #fff;
            border: 2px solid currentColor;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 1;
        }

        .activity-dot .material-symbols-outlined {
            color: #fff;
            font-size: 18px;
        }

        .activity-content {
            flex: 1;
            min-width: 0;
        }

        .activity-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 4px;
        }

        .activity-type {
            font-weight: 600;
            font-size: 13px;
        }

        .activity-time {
            font-size: 12px;
            color: var(--md-sys-color-on-surface-variant, #999);
        }

        .activity-description {
            font-size: 14px;
            color: var(--md-sys-color-on-surface, #333);
            line-height: 1.5;
            word-break: break-word;
        }

        .activity-meta {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 8px;
            font-size: 12px;
            color: var(--md-sys-color-on-surface-variant, #666);
            background: var(--md-sys-color-surface-container, #f5f5f5);
            padding: 4px 8px;
            border-radius: 4px;
            width: fit-content;
        }

        .activity-meta .material-symbols-outlined {
            font-size: 14px;
        }

        /* Toast */
        .activity-toast {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--md-sys-color-inverse-surface, #333);
            color: var(--md-sys-color-inverse-on-surface, #fff);
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .activity-toast.visible {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        /* Dark mode support */
        [data-theme="dark"] .activity-timeline-widget {
            background: var(--md-sys-color-surface, #1e1e1e);
            border-color: var(--md-sys-color-outline-variant, rgba(255,255,255,0.1));
        }

        [data-theme="dark"] .activity-timeline-header {
            background: var(--md-sys-color-surface-container, rgba(255,255,255,0.05));
            border-color: var(--md-sys-color-outline-variant, rgba(255,255,255,0.1));
        }

        [data-theme="dark"] .activity-filter {
            background: var(--md-sys-color-surface, #1e1e1e);
            border-color: var(--md-sys-color-outline, rgba(255,255,255,0.1));
            color: var(--md-sys-color-on-surface, #e0e0e0);
        }

        [data-theme="dark"] .activity-line {
            background: var(--md-sys-color-outline-variant, rgba(255,255,255,0.1));
        }

        [data-theme="dark"] .activity-dot {
            background: #1e1e1e;
        }

        [data-theme="dark"] .activity-description {
            color: var(--md-sys-color-on-surface, #e0e0e0);
        }

        [data-theme="dark"] .activity-meta {
            background: var(--md-sys-color-surface-container, rgba(255,255,255,0.05));
            color: var(--md-sys-color-on-surface-variant, #999);
        }
    `;

    document.head.appendChild(style);
}

// Auto-init on DOM ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initActivityTimeline);
    } else {
        initActivityTimeline();
    }
}
