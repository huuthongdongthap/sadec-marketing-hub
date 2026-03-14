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
import './offline-detection.js';
import './clipboard.js';
import './share.js';
import './skeleton.js';

// Export global API
window.SadecUtils = {
    DarkMode: window.DarkMode,
    QuickActions: window.QuickActions,
    ScrollToTop: window.ScrollToTop,
    NotificationBadge: window.NotificationBadge,
    ReadingProgress: window.ReadingProgress,
    BackToTop: window.BackToTop,
    OfflineDetection: window.OfflineDetection,
    Clipboard: window.Clipboard,
    Share: window.Share,
    Skeleton: window.Skeleton
};

Logger.info('[Utils Bundle] Loaded - Dark Mode, Quick Actions, Scroll To Top, Notification Badge, Reading Progress, Back To Top, Offline Detection, Clipboard, Share, Skeleton');
