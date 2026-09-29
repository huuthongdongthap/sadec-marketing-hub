/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOAST NOTIFICATION SERVICE - DEPRECATED
 *
 * Re-exported from src/js/components/enhanced-toast.js for backward compatibility
 *
 * @deprecated Use `import { toast, ToastManager } from '../../../src/js/components/enhanced-toast.js'`
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Re-export consolidated toast system from enhanced-toast.js
export {
  ToastManager,
  toast,
  injectToastStyles
} from '../../../src/js/components/enhanced-toast.js';

// Legacy global assignment for backward compatibility (browser only)
if (typeof window !== 'undefined') {
  import('../../../src/js/components/enhanced-toast.js').then(({ toast, ToastManager }) => {
    if (!window.toast) {
      window.toast = toast;
      window.ToastManager = ToastManager;
    }
  }).catch(() => {}); // Ignore import errors in test environment
}
