/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — UI COMPONENTS INDEX (Enhanced)
 *
 * Export all UI components including new animation-enhanced versions
 *
 * Usage:
 *   <script type="module" src="assets/js/components/index.js"></script>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Core UX Components
export { Toast, ToastManager } from './toast-manager.js';
export { ErrorBoundary, ErrorBoundaryUtils } from './error-boundary.js';
export { Theme, ThemeManager } from './theme-manager.js';
export { MobileUI, MobileEnhancements } from './mobile-responsive.js';

// Enhanced Components
export { SadecToast } from './sadec-toast.js';
export { LoadingButton } from './loading-button.js';
export { PaymentStatusChip } from './payment-status-chip.js';

// Features
export { AIGenerator, AIContentGenerator, AIContentPanel } from '../features/ai-content-generator.js';
export { AnalyticsDashboard } from '../features/analytics-dashboard.js';

/**
 * Auto-initialize all components
 */
function initializeComponents() {
  // Components are auto-initialized in their constructors
  console.log('[UI Components] Initialized');
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

  // Enhanced
  SadecToast: window.SadecToast,
  LoadingButton: window.LoadingButton,
  PaymentStatusChip: window.PaymentStatusChip,

  // Features
  AIGenerator: window.AIGenerator,
  AnalyticsDashboard: window.AnalyticsDashboard,

  // Initialize
  init: initializeComponents
};

/**
 * Animation Demo Helper
 * Use in browser: MekongComponents.demoAnimations()
 */
window.MekongComponents.demoAnimations = () => {
  console.log('🎨 UI Animation Demo');
  console.log('===================\n');

  // Demo Toast
  console.log('1. Toast Notifications:');
  setTimeout(() => SadecToast?.success('✅ Action completed successfully!'), 500);
  setTimeout(() => SadecToast?.error('❌ Something went wrong'), 1500);
  setTimeout(() => SadecToast?.warning('⚠️ Please review this field'), 2500);
  setTimeout(() => SadecToast?.info('ℹ️ New message received'), 3500);

  // Demo Loading
  setTimeout(() => {
    console.log('2. Loading States:');
    Loading?.fullscreen?.show('Đang tải...');
    setTimeout(() => Loading?.fullscreen?.hide(), 2000);
  }, 500);

  // Demo MicroAnimations
  setTimeout(() => {
    console.log('3. Micro-animations:');
    const demoEl = document.createElement('div');
    demoEl.textContent = 'Animation Demo';
    demoEl.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:20px;background:#006A60;color:white;border-radius:8px;z-index:9999;';
    document.body.appendChild(demoEl);

    MicroAnimations?.pop(demoEl);
    setTimeout(() => MicroAnimations?.pulse(demoEl, 2), 1000);
    setTimeout(() => MicroAnimations?.shake(demoEl), 2000);
    setTimeout(() => demoEl.remove(), 3000);
  }, 1000);

  console.log('Check browser for animations demo');
};
