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
export { QuickSettings } from './quick-settings.js';
export { FavoritesManager } from './favorites.js';
export { WidgetCustomizer, WidgetCustomizerInstance, initWidgetCustomizer } from './widget-customizer.js';
export { AIContentPanel, AIContentPanelInstance, initAIContentPanel } from './ai-content-panel.js';
export { QuickToolsPanel, QuickToolsPanelInstance, initQuickToolsPanel } from './quick-tools-panel.js';

// New UX Enhancements 2026
export { initUXEnhancements } from './ux-enhancements-2026.js';
export { initDataRefreshIndicator, triggerRefresh, enableAutoRefresh, disableAutoRefresh } from './data-refresh-indicator.js';

// UX Utilities
export { Loading, ScrollAnimations, RippleEffect } from '../loading-states.js';
export { ToastManager } from '../toast-manager.js';
export { EmptyStates } from '../empty-states.js';
export { ToastComponent } from '../toast-component.js';

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
    QuickSettings: window.QuickSettings,
    FavoritesManager: window.FavoritesManager,
    init: initializeFeatures,
    // UX Utilities
    Loading: window.Loading,
    ScrollAnimations: window.ScrollAnimations,
    RippleEffect: window.RippleEffect,
    ToastManager: window.ToastManager,
    EmptyStates: window.EmptyStates,
    ToastComponent: window.ToastComponent
};
