/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — FEATURES INDEX
 * Export all feature modules
 *
 * Usage:
 *   <script type="module" src="assets/js/features/index.js"></script>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { AIGenerator, AIContentGenerator, AIContentPanel } from './ai-content-generator.js';
export { AnalyticsDashboard } from './analytics-dashboard.js';
export { ExportManager } from './data-export.js';
export { UserPreferences } from './user-preferences.js';
export { QuickActions } from './quick-actions.js';

/**
 * Initialize all features
 */
function initializeFeatures() {
    console.log('[Features] All features loaded');
}

// Auto-initialize
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFeatures);
    } else {
        initializeFeatures();
    }
}

// Global API
window.MekongFeatures = {
    AIGenerator: window.AIGenerator,
    AnalyticsDashboard: window.AnalyticsDashboard,
    ExportManager: window.ExportManager,
    UserPreferences: window.UserPreferences,
    QuickActions: window.QuickActions,
    init: initializeFeatures
};
