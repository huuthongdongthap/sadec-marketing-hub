/**
 * Mekong Marketing Hub - Components Index
 * Export all UI components and features
 *
 * Usage:
 *   <script type="module" src="assets/js/components/index.js"></script>
 */

// Core UX Components
export { Toast, ToastManager } from './toast-manager.js';
export { ErrorBoundary, ErrorBoundaryUtils } from './error-boundary.js';
export { Theme, ThemeManager } from './theme-manager.js';
export { MobileUI, MobileEnhancements } from './mobile-responsive.js';

// Features
export { AIGenerator, AIContentGenerator, AIContentPanel } from '../features/ai-content-generator.js';
export { AnalyticsDashboard } from '../features/analytics-dashboard.js';

/**
 * Auto-initialize all components
 */
function initializeComponents() {

  // Components are auto-initialized in their constructors
  // Toast, Theme, MobileUI already init on load

}

// Initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
  initializeComponents();
}

/**
 * Global API for easy access
 */
window.MekongComponents = {
  // UX
  Toast: window.Toast,
  Theme: window.Theme,
  MobileUI: window.MobileUI,
  ErrorBoundary: window.ErrorBoundary,

  // Features
  AIGenerator: window.AIGenerator,
  AnalyticsDashboard: window.AnalyticsDashboard,

  // Initialize
  init: initializeComponents
};
