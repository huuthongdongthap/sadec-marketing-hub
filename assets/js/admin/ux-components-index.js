/**
 * Admin UX Components - Index
 * Exports all UX components for easy importing
 * @version 1.0.0 | 2026-03-13
 */

// Theme Manager (Dark Mode)
export { default as ThemeManager, ThemeToggle, isDark, toggle as toggleTheme } from '../core/theme-manager.js';

// Keyboard Shortcuts Component
export { KeyboardShortcutsComponent } from './keyboard-shortcuts.js';
export { injectKeyboardShortcutsStyles } from './keyboard-shortcuts.js';

// Skeleton Loader Component
export { SkeletonLoaderComponent } from './skeleton-loader.js';
export { injectSkeletonLoaderStyles } from './skeleton-loader.js';

// Notification Components
export { NotificationBellComponent } from './bell-component.js';
export { NotificationPanelComponent } from './notification-panel.js';
export { injectNotificationStyles } from './notification-panel.js';

// ============================================================================
// CONVENIENCE INITIALIZERS
// ============================================================================

/**
 * Initialize all UX components
 */
export function initAllUXComponents() {
  // Initialize components
  const keyboardShortcuts = new KeyboardShortcutsComponent();
  const skeletonLoader = new SkeletonLoaderComponent();
  const notificationPanel = new NotificationPanelComponent();
  const notificationBell = new NotificationBellComponent({
    defaultNotifications: [
      {
        id: '1',
        title: 'Chiến dịch mới được tạo',
        message: 'Chiến dịch "Tết 2026" đã được khởi tạo thành công.',
        icon: 'campaign',
        time: Date.now() - 300000,
        read: false,
        type: 'success'
      },
      {
        id: '2',
        title: 'Lead mới từ Facebook',
        message: 'Nguyễn Văn A - CEO tại ABC Company',
        icon: 'person_add',
        time: Date.now() - 3600000,
        read: false,
        type: 'info'
      }
    ]
  });

  // Initialize bell + panel together
  notificationPanel.init(notificationBell);
  notificationBell.init(notificationPanel);

  // Initialize other components
  keyboardShortcuts.init();
  skeletonLoader.init();

  return {
    keyboardShortcuts,
    skeletonLoader,
    notificationBell,
    notificationPanel
  };
}

/**
 * Initialize dark mode only
 */
export function initDarkMode() {
  injectDarkModeStyles();
  const darkMode = new DarkModeComponent();
  darkMode.init();
  return darkMode;
}

/**
 * Initialize keyboard shortcuts only
 */
export function initKeyboardShortcuts() {
  injectKeyboardShortcutsStyles();
  const shortcuts = new KeyboardShortcutsComponent();
  shortcuts.init();
  return shortcuts;
}

/**
 * Initialize skeleton loader only
 */
export function initSkeletonLoader() {
  injectSkeletonLoaderStyles();
  const skeleton = new SkeletonLoaderComponent();
  skeleton.init();
  return skeleton;
}
