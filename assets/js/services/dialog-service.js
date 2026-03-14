/**
 * ============================================================================
 * MEKONG AGENCY - DIALOG SERVICE
 * ============================================================================
 *
 * Centralized dialog service for confirm, alert, and prompt operations.
 * Replaces native browser dialogs with custom styled modals.
 *
 * USAGE:
 *   import { dialog } from './services/dialog-service.js';
 *
 *   // Confirm
 *   const confirmed = await dialog.confirm('Are you sure?');
 *
 *   // Alert
 *   await dialog.alert('Operation completed!');
 *
 *   // Prompt
 *   const value = await dialog.prompt('Enter your name:', 'John');
 */

// ===== DIALOG STYLES (injected dynamically) =====
const DIALOG_STYLES = `
    .mekong-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        opacity: 0;
        animation: dialog-fade-in 0.2s ease-out forwards;
    }

    .mekong-dialog {
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: dialog-slide-in 0.3s ease-out;
    }

    .mekong-dialog-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
    }

    .mekong-dialog-icon {
        font-size: 24px;
        flex-shrink: 0;
    }

    .mekong-dialog-icon.confirm { color: #f59e0b; }
    .mekong-dialog-icon.alert { color: #3b82f6; }
    .mekong-dialog-icon.prompt { color: #8b5cf6; }
    .mekong-dialog-icon.success { color: #10b981; }
    .mekong-dialog-icon.error { color: #ef4444; }

    .mekong-dialog-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
        flex: 1;
    }

    .mekong-dialog-content {
        color: #4b5563;
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 24px;
    }

    .mekong-dialog-input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 15px;
        transition: border-color 0.2s;
        box-sizing: border-box;
    }

    .mekong-dialog-input:focus {
        outline: none;
        border-color: #3b82f6;
    }

    .mekong-dialog-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }

    .mekong-dialog-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
    }

    .mekong-dialog-btn.primary {
        background: #3b82f6;
        color: white;
    }

    .mekong-dialog-btn.primary:hover {
        background: #2563eb;
    }

    .mekong-dialog-btn.secondary {
        background: #f3f4f6;
        color: #374151;
    }

    .mekong-dialog-btn.secondary:hover {
        background: #e5e7eb;
    }

    .mekong-dialog-btn.danger {
        background: #ef4444;
        color: white;
    }

    .mekong-dialog-btn.danger:hover {
        background: #dc2626;
    }

    @keyframes dialog-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes dialog-slide-in {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;

// Inject styles once
let stylesInjected = false;
function injectStyles() {
    if (!stylesInjected && !document.getElementById('dialog-service-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'dialog-service-styles';
        styleSheet.textContent = DIALOG_STYLES;
        document.head.appendChild(styleSheet);
        stylesInjected = true;
    }
}

// ===== ICONS =====
const ICONS = {
    confirm: '⚠',
    alert: 'ℹ',
    prompt: '✏',
    success: '✓',
    error: '✕'
};

// ===== DIALOG CLASS =====
class DialogService {
    constructor() {
        this.currentDialog = null;
    }

    /**
     * Create dialog element
     * @param {string} type - confirm, alert, prompt
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {string} defaultValue - Default value for prompt
     * @returns {Object} { dialog, input, resolve }
     */
    createDialog(type, title, message, defaultValue = '') {
        injectStyles();

        const overlay = document.createElement('div');
        overlay.className = 'mekong-dialog-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'mekong-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');

        const icon = ICONS[type] || ICONS.alert;

        let inputHtml = '';
        if (type === 'prompt') {
            inputHtml = `
                <input
                    type="text"
                    class="mekong-dialog-input"
                    value="${this.escapeHtml(defaultValue)}"
                    placeholder="Nhập giá trị..."
                    autofocus
                />
            `;
        }

        const buttonsHtml = type === 'confirm'
            ? `
                <button class="mekong-dialog-btn secondary" data-action="cancel">Hủy</button>
                <button class="mekong-dialog-btn primary" data-action="confirm">Xác nhận</button>
            `
            : `
                <button class="mekong-dialog-btn primary" data-action="ok">OK</button>
            `;

        dialog.innerHTML = `
            <div class="mekong-dialog-header">
                <span class="mekong-dialog-icon ${type}">${icon}</span>
                <h3 class="mekong-dialog-title">${this.escapeHtml(title)}</h3>
            </div>
            <div class="mekong-dialog-content">${this.escapeHtml(message)}</div>
            ${inputHtml}
            <div class="mekong-dialog-actions">
                ${buttonsHtml}
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const input = type === 'prompt' ? dialog.querySelector('.mekong-dialog-input') : null;
        input?.select();

        return { overlay, dialog, input };
    }

    /**
     * Show confirm dialog
     * @param {string} message - Message to show
     * @param {string} title - Title (default: 'Xác nhận')
     * @returns {Promise<boolean>}
     */
    confirm(message, title = 'Xác nhận') {
        return new Promise((resolve) => {
            const { overlay, dialog } = this.createDialog('confirm', title, message);
            this.currentDialog = { overlay, dialog, resolve };

            const handleAction = (action) => {
                this.closeDialog();
                resolve(action === 'confirm');
            };

            dialog.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    handleAction(btn.getAttribute('data-action'));
                });
            });

            // ESC key to cancel
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    handleAction('cancel');
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);

            // Click overlay to cancel
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    handleAction('cancel');
                }
            });
        });
    }

    /**
     * Show alert dialog
     * @param {string} message - Message to show
     * @param {string} title - Title (default: 'Thông báo')
     * @param {string} type - Type: alert, success, error
     * @returns {Promise<void>}
     */
    alert(message, title = 'Thông báo', type = 'alert') {
        return new Promise((resolve) => {
            const { overlay, dialog } = this.createDialog(type, title, message);
            this.currentDialog = { overlay, dialog, resolve };

            const btn = dialog.querySelector('[data-action="ok"]');
            btn?.addEventListener('click', () => {
                this.closeDialog();
                resolve();
            });

            // ESC key to close
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    this.closeDialog();
                    resolve();
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);

            // Click overlay to close
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeDialog();
                    resolve();
                }
            });
        });
    }

    /**
     * Show prompt dialog
     * @param {string} message - Message to show
     * @param {string} defaultValue - Default value
     * @param {string} title - Title (default: 'Nhập liệu')
     * @returns {Promise<string|null>}
     */
    prompt(message, defaultValue = '', title = 'Nhập liệu') {
        return new Promise((resolve) => {
            const { overlay, dialog, input } = this.createDialog('prompt', title, message, defaultValue);
            this.currentDialog = { overlay, dialog, input, resolve };

            const handleAction = (action, value = null) => {
                this.closeDialog();
                resolve(action === 'ok' ? value : null);
            };

            dialog.querySelector('[data-action="ok"]')?.addEventListener('click', () => {
                handleAction('ok', input?.value);
            });

            dialog.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
                handleAction('cancel');
            });

            // Enter to confirm
            input?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleAction('ok', input.value);
                }
            });

            // ESC key to cancel
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    handleAction('cancel');
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);

            // Click overlay to cancel
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    handleAction('cancel');
                }
            });
        });
    }

    /**
     * Close current dialog
     */
    closeDialog() {
        if (this.currentDialog) {
            const { overlay } = this.currentDialog;
            overlay.style.animation = 'dialog-fade-in 0.2s ease-out reverse';
            setTimeout(() => {
                overlay.remove();
                this.currentDialog = null;
            }, 200);
        }
    }

    /**
     * Close all dialogs
     */
    closeAll() {
        document.querySelectorAll('.mekong-dialog-overlay').forEach(overlay => {
            overlay.remove();
        });
        this.currentDialog = null;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// ===== EXPORT INSTANCE =====
export const dialog = new DialogService();

export default dialog;

// ===== SHORTHAND EXPORTS =====
export const confirm = (message, title) => dialog.confirm(message, title);
export const alert = (message, title, type) => dialog.alert(message, title, type);
export const prompt = (message, defaultValue, title) => dialog.prompt(message, defaultValue, title);
