/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — UI COMPONENTS INDEX (Enhanced)
 *
 * Central export point for all UI components
 *
 * Usage:
 *   <script type="module" src="assets/js/components/index.js"></script>
 *
 * Categories:
 * - UX Fundamentals (Toast, Loading, Error Boundary)
 * - Navigation (Tabs, Accordion, Breadcrumbs)
 * - Data Display (DataTable, KPI Card, Charts)
 * - Forms (File Upload, Search, Filters)
 * - Feedback (Tooltip, Notification Bell, Progress)
 * - Accessibility (Skip Link, Back to Top, Reading Progress)
 * - Payment (Payment Modal, Status Chip, Gateway Selector)
 * - Layout (Mobile Responsive, Sidebar, Navbar)
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// UX FUNDAMENTALS
// ═══════════════════════════════════════════════════════════════════════════

// Toast Notifications
export { Toast, ToastManager } from './toast-manager.js';
export { SadecToast } from './sadec-toast.js';

// Error Handling
export { ErrorBoundary, ErrorBoundaryUtils } from './error-boundary.js';

// Loading States
export { LoadingButton } from './loading-button.js';
export { LoadingStates, Loading, SkeletonLoader } from './loading-states.js';

// Theme Management
export { Theme, ThemeManager } from './theme-manager.js';
export { ThemeToggle } from './theme-toggle.js';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION & LAYOUT
// ═══════════════════════════════════════════════════════════════════════════

// Tabs
export { Tabs, TabsManager } from './tabs.js';

// Accordion
export { Accordion, AccordionManager } from './accordion.js';

// Breadcrumbs
export { Breadcrumbs } from './breadcrumbs.js';

// Mobile Responsive
export { MobileUI, MobileEnhancements } from './mobile-responsive.js';
// MobileMenu, MobileNavigation merged into mobile-responsive.js

// Sidebar & Navbar (Custom Elements)
export { SadecSidebar } from './sadec-sidebar.js';
export { SadecNavbar } from './sadec-navbar.js';

// Scroll Navigation
export { ScrollToTop, ScrollToTopManager } from './scroll-to-top.js';
export { BackToTop } from './back-to-top.js';
export { ReadingProgress } from './reading-progress.js';
export { SkipLink } from './skip-link.js';

// ═══════════════════════════════════════════════════════════════════════════
// DATA DISPLAY
// ═══════════════════════════════════════════════════════════════════════════

// Data Table
export { DataTable } from './data-table.js';

// KPI Cards
export { KpiCardWidget } from './kpi-card.js';
export { KpiCard } from './kpi-card.js';
export { KpiComponent } from './kpi-component.js';

// Charts
export { ChartComponents, LineChartWidget, BarChartWidget, PieChartWidget } from './chart-components.js';

// Activity Feed
export { ActivityComponent } from './activity-component.js';

// ═══════════════════════════════════════════════════════════════════════════
// FORMS & INPUTS
// ═══════════════════════════════════════════════════════════════════════════

// File Upload
export { FileUpload, FileUploader } from './file-upload.js';

// Search
export { SearchAutocomplete } from './search-autocomplete.js';

// Filters
export { AdvancedFilters } from './advanced-filters.js';
export { FilterComponent } from './filter-component.js';

// ═══════════════════════════════════════════════════════════════════════════
// FEEDBACK & INTERACTION
// ═══════════════════════════════════════════════════════════════════════════

// Tooltips
export { Tooltip, TooltipManager } from './tooltip.js';

// Notifications
export { NotificationBell } from './notification-bell.js';
export { NotificationPreferences } from './notification-preferences.js';

// Payment Status
export { PaymentStatusChip } from './payment-status-chip.js';

// Stepper
export { Stepper, StepperManager } from './stepper.js';

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT & E-COMMERCE
// ═══════════════════════════════════════════════════════════════════════════

// Payment Modal
export { PaymentModal } from './payment-modal.js';

// Gateway Selector
export { GatewaySelector } from './gateway-selector.js';

// Export
export { ExportButtons } from './export-buttons.js';

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATES
// ═══════════════════════════════════════════════════════════════════════════

export { EmptyState } from './empty-state.js';

// ═══════════════════════════════════════════════════════════════════════════
// CHAT & SUPPORT
// ═══════════════════════════════════════════════════════════════════════════

export { ChatWidget } from './chat-widget.js';

// ═══════════════════════════════════════════════════════════════════════════
// QUICK ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export { QuickActions } from './quick-actions.js';

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════════════

export { Pagination } from './pagination-component.js';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Auto-initialize all components
 */
function initializeComponents() {
    // Components are auto-initialized by browser when defined as custom elements
    // This function is for any additional setup needed
    window.dispatchEvent(new CustomEvent('mekong-components-ready'));
}

// Initialize on DOMContentLoaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeComponents);
    } else {
        initializeComponents();
    }
}

/**
 * Global API for easy access
 */
window.MekongComponents = {
    // UX Fundamentals
    Toast: window.Toast,
    ToastManager: window.ToastManager,
    SadecToast: window.SadecToast,
    ErrorBoundary: window.ErrorBoundary,
    LoadingButton: window.LoadingButton,
    Loading: window.Loading,
    SkeletonLoader: window.SkeletonLoader,
    Theme: window.Theme,
    ThemeManager: window.ThemeManager,
    ThemeToggle: window.ThemeToggle,

    // Navigation & Layout
    Tabs: window.Tabs,
    TabsManager: window.TabsManager,
    Accordion: window.Accordion,
    AccordionManager: window.AccordionManager,
    Breadcrumbs: window.Breadcrumbs,
    MobileUI: window.MobileUI,
    ScrollToTop: window.ScrollToTop,
    BackToTop: window.BackToTop,
    ReadingProgress: window.ReadingProgress,
    SkipLink: window.SkipLink,
    SadecSidebar: window.SadecSidebar,
    SadecNavbar: window.SadecNavbar,

    // Data Display
    DataTable: window.DataTable,
    KpiCard: window.KpiCard,
    KpiCardWidget: window.KpiCardWidget,
    KpiComponent: window.KpiComponent,
    ChartComponents: window.ChartComponents,
    ActivityComponent: window.ActivityComponent,

    // Forms & Inputs
    FileUpload: window.FileUpload,
    FileUploader: window.FileUploader,
    SearchAutocomplete: window.SearchAutocomplete,
    AdvancedFilters: window.AdvancedFilters,
    FilterComponent: window.FilterComponent,

    // Feedback & Interaction
    Tooltip: window.Tooltip,
    TooltipManager: window.TooltipManager,
    NotificationBell: window.NotificationBell,
    NotificationPreferences: window.NotificationPreferences,
    PaymentStatusChip: window.PaymentStatusChip,
    Stepper: window.Stepper,
    StepperManager: window.StepperManager,

    // Payment & E-commerce
    PaymentModal: window.PaymentModal,
    GatewaySelector: window.GatewaySelector,
    ExportButtons: window.ExportButtons,

    // Empty States
    EmptyState: window.EmptyState,

    // Chat & Support
    ChatWidget: window.ChatWidget,

    // Quick Actions
    QuickActions: window.QuickActions,

    // Pagination
    Pagination: window.Pagination,

    // Initialize
    init: initializeComponents
};
