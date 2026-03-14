/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOAST NOTIFICATION SERVICE - DEPRECATED
 *
 * Re-exported from src/js/components/enhanced-toast.js for backward compatibility
 *
 * @deprecated Use `import { toast, ToastManager } from '../../src/js/components/enhanced-toast.js'`
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Re-export consolidated toast system from enhanced-toast.js
export {
  ToastManager,
  toast,
  injectToastStyles
} from '../../src/js/components/enhanced-toast.js';

// Legacy global assignment for backward compatibility
if (typeof window !== 'undefined' && !window.toast) {
  window.toast = toast;
  window.ToastManager = ToastManager;
}
