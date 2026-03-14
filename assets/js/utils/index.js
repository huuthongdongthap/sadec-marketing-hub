/**
 * Sa Đéc Marketing Hub — Utils Bundle
 * Import tất cả utility modules
 */

import { Logger } from '../shared/logger.js';

import './dark-mode.js';
import './quick-actions.js';
import './scroll-to-top.js';
import './notification-badge.js';
import './reading-progress.js';
import './back-to-top.js';

// Export global API
window.SadecUtils = {
    DarkMode: window.DarkMode,
    QuickActions: window.QuickActions,
    ScrollToTop: window.ScrollToTop,
    NotificationBadge: window.NotificationBadge,
    ReadingProgress: window.ReadingProgress,
    BackToTop: window.BackToTop
};

Logger.info('[Utils Bundle] Loaded - Dark Mode, Quick Actions, Scroll To Top, Notification Badge, Reading Progress, Back To Top');
