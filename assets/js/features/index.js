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
export { default as UserPreferences, UserPreferencesPanel } from '../core/user-preferences.js';
export { QuickActions } from './quick-actions.js';
export { NotificationCenter } from './notification-center.js';
export { CommandPalette } from './command-palette-enhanced.js';
export { initQuickNotes } from './quick-notes.js';
export { AISearchEnhancement } from './ai-search-enhancement.js';
export { WidgetCustomizer, WidgetCustomizerInstance, initWidgetCustomizer } from './widget-customizer.js';
export { AIContentPanel, AIContentPanelInstance, initAIContentPanel } from './ai-content-panel.js';
export { QuickToolsPanel, QuickToolsPanelInstance, initQuickToolsPanel } from './quick-tools-panel.js';

/**
 * Initialize all features
 */
function initializeFeatures() {
    // Features auto-initialized in their constructors
    if (typeof window !== 'undefined' && window.Logger) {
        window.Logger.log('[Features] Initialized');
    }
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
    NotificationCenter: window.NotificationCenter,
    CommandPalette: window.CommandPalette,
    AISearchEnhancement: window.AISearchEnhancement,
    WidgetCustomizer: window.WidgetCustomizer,
    AIContentPanel: window.AIContentPanel,
    QuickToolsPanel: window.QuickToolsPanel,
    initQuickNotes: window.initQuickNotes,
    init: initializeFeatures
};
