/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOAST NOTIFICATION MANAGER - DEPRECATED
 *
 * Re-exported from enhanced-toast.js for backward compatibility
 *
 * @deprecated Use `import { toast, ToastManager } from './enhanced-toast.js'`
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Re-export consolidated toast system
export {
  ToastManager,
  toast,
  injectToastStyles
} from './enhanced-toast.js';

// Legacy global assignment for backward compatibility
if (typeof window !== 'undefined' && !window.toast) {
  window.toast = toast;
  window.ToastManager = ToastManager;
}
