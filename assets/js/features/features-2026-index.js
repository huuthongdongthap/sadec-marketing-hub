/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FEATURES 2026 — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Export tất cả features mới năm 2026
 *
 * Usage:
 *   <script type="module" src="assets/js/features/features-2026-index.js"></script>
 *
 * Features:
 * - Reading Progress Bar
 * - Back to Top Button
 * - Help Tour / Onboarding
 * - Keyboard Shortcuts
 * - Dark Mode Toggle
 * - Quick Notes Widget
 * - Activity Timeline
 * - Notification Center
 * - Command Palette
 * - Project Health Monitor
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Reading Progress Bar
import './reading-progress.js';

// Back to Top Button
import './back-to-top.js';

// Help Tour / Onboarding
import './help-tour.js';

// Keyboard Shortcuts (Ctrl+K, Ctrl+/, Ctrl+B)
import './keyboard-shortcuts.js';

// Dark Mode Toggle with auto-detect
import './dark-mode.js';

// Quick Notes Widget
import './quick-notes-widget.js';

// Activity Timeline
import './activity-timeline.js';

// Notification Center
import './notification-center.js';

// Command Palette
import './command-palette-enhanced.js';

// Project Health Monitor
import './project-health-monitor.js';

// Analytics Dashboard
import './analytics-dashboard.js';

// AI Content Generator
import './ai-content-generator.js';

// Data Export (CSV, PDF)
import './data-export.js';

// Favorites / Bookmarks
import './favorites.js';

// Quick Settings
import './quick-settings.js';

// Quick Tools Panel
import './quick-tools-panel.js';

// Search Autocomplete
import './search-autocomplete.js';

// Data Refresh Indicator
import './data-refresh-indicator.js';

// Micro Animations
import './micro-animations.js';

// Export global API
window.SadecFeatures2026 = {
    // Basic Features
    ReadingProgress: window.ReadingProgress,
    BackToTop: window.BackToTop,
    HelpTour: window.HelpTour,

    // Advanced Features
    KeyboardShortcuts: window.KeyboardShortcuts,
    DarkMode: window.DarkMode,
    QuickNotes: window.QuickNotes,
    ActivityTimeline: window.ActivityTimeline,
    NotificationCenter: window.NotificationCenter,
    CommandPalette: window.CommandPalette,
    ProjectHealthMonitor: window.ProjectHealthMonitor,
    AnalyticsDashboard: window.AnalyticsDashboard,
    AIContentGenerator: window.AIContentGenerator,
    DataExport: window.DataExport,
    Favorites: window.Favorites,
    QuickSettings: window.QuickSettings,
    QuickToolsPanel: window.QuickToolsPanel,
    SearchAutocomplete: window.SearchAutocomplete,
    DataRefreshIndicator: window.DataRefreshIndicator,
    MicroAnimations: window.MicroAnimations,

    // Initialize all features
    initAll() {
        console.log('[SadecFeatures2026] Initializing all features...');
        // Features are auto-initialized on import
    }
};

// Features initialized on import
