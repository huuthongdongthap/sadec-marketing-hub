/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENTS LOADER
 * Sa Đéc Marketing Hub - Phase 3 UI Componentization
 * 
 * This file loads all custom Web Components.
 * Include this single file to get all components.
 * 
 * Usage in HTML:
 *   <script type="module" src="../assets/js/components/index.js"></script>
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Import all components
import './sadec-toast.js';
import './sadec-sidebar.js';

// Export for programmatic access
export { SadecToast } from './sadec-toast.js';
export { SadecSidebar } from './sadec-sidebar.js';

// Global initialization helper
window.SadecComponents = {
    version: '1.0.0',

    // Show toast notification
    toast: (message, type = 'info') => SadecToast.show(message, type),

    // Get sidebar instance
    getSidebar: () => document.querySelector('sadec-sidebar'),

    // Toggle mobile sidebar
    toggleSidebar: () => {
        const sidebar = document.querySelector('sadec-sidebar');
        if (sidebar) sidebar.toggle();
    }
};
