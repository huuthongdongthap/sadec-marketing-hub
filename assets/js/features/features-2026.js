/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — FEATURE ENHANCEMENTS 2026
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features to implement:
 * 1. Dark Mode Toggle với auto-detect
 * 2. Keyboard Shortcuts (Ctrl+K, Ctrl+/, Ctrl+B)
 * 3. Quick Notes Widget
 * 4. Activity Timeline
 * 5. Data Visualization Charts
 * 6. Export to PDF/CSV
 * 7. Real-time Notifications
 * 8. User Onboarding Tour
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Feature flags
export const FEATURE_FLAGS = {
    darkMode: true,
    keyboardShortcuts: true,
    quickNotes: true,
    activityTimeline: true,
    dataVisualization: true,
    exportToPDF: true,
    realTimeNotifications: true,
    onboardingTour: true
};

// Export all features
export { initDarkMode } from './dark-mode.js';
export { initKeyboardShortcuts } from './keyboard-shortcuts.js';
export { initQuickNotes } from './quick-notes.js';
export { initActivityTimeline } from './activity-timeline.js';
// Note: Features implemented via dedicated modules
// - data-visualization.js → Use charts/ directory components
// - export.js → Use shared/format-utils.js for export helpers
// - notifications.js → Use Toast from src/js/core/enhanced-utils.js
// - onboarding-tour.js → Implement via components/onboarding-tour.js

/**
 * Initialize all features
 */
export function initAllFeatures() {
    if (FEATURE_FLAGS.darkMode) initDarkMode();
    if (FEATURE_FLAGS.keyboardShortcuts) initKeyboardShortcuts();
    if (FEATURE_FLAGS.quickNotes) initQuickNotes();
    if (FEATURE_FLAGS.activityTimeline) initActivityTimeline();
    if (FEATURE_FLAGS.dataVisualization) initDataVisualization();
    if (FEATURE_FLAGS.exportToPDF) initExport();
    if (FEATURE_FLAGS.realTimeNotifications) initRealTimeNotifications();
    if (FEATURE_FLAGS.onboardingTour) initOnboardingTour();
}
