/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOAST COMPONENT — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Web Component cho toast notifications với Material Design 3 styling
 *
 * Usage:
 *   const toast = document.createElement('toast-component');
 *   toast.setAttribute('type', 'success');
 *   toast.setAttribute('title', 'Thành công');
 *   toast.setAttribute('message', 'Đã lưu thành công!');
 *   document.body.appendChild(toast);
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class ToastComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.autoDismissTimer = null;
        this._onDismiss = null;
    }

    static get observedAttributes() {
        return ['type', 'title', 'message', 'duration', 'dismissible'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.startAutoDismiss();
    }

    disconnectedCallback() {
        if (this.autoDismissTimer) {
            clearTimeout(this.autoDismissTimer);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.shadowRoot.innerHTML) {
            this.render();
        }
    }

    render() {
        const type = this.getAttribute('type') || 'info';
        const title = this.getAttribute('title') || '';
        const message = this.getAttribute('message') || '';
        const dismissible = this.hasAttribute('dismissible');

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            loading: '⟳'
        };

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: relative;
                }

                .toast {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    background: var(--md-sys-color-surface, #fff);
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
                    border-left: 4px solid var(--toast-color, var(--md-sys-color-primary, #6750A4));
                    animation: toastSlideIn 0.3s ease-out forwards;
                    max-width: 400px;
                    min-width: 280px;
                }

                .toast--success { --toast-color: #1B874E; }
                .toast--error { --toast-color: #B3261E; }
                .toast--warning { --toast-color: #B58900; }
                .toast--info { --toast-color: #00649A; }
                .toast--loading { --toast-color: #6750A4; }

                .toast__icon {
                    font-size: 20px;
                    color: var(--toast-color);
                    flex-shrink: 0;
                }

                .toast__content {
                    flex: 1;
                    min-width: 0;
                }

                .toast__title {
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--md-sys-color-on-surface, #1C1B1F);
                    margin-bottom: 4px;
                }

                .toast__message {
                    font-size: 13px;
                    color: var(--md-sys-color-on-surface-variant, #49454F);
                    line-height: 1.5;
                    margin: 0;
                }

                .toast__dismiss {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    color: var(--md-sys-color-on-surface-variant, #49454F);
                    opacity: 0.6;
                    transition: opacity 0.2s;
                    flex-shrink: 0;
                }

                .toast__dismiss:hover {
                    opacity: 1;
                }

                .toast__progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: var(--toast-color);
                    border-radius: 0 0 0 12px;
                    animation: progress linear forwards;
                }

                .toast--loading .toast__icon {
                    animation: spin 1s linear infinite;
                }

                @keyframes toastSlideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes toastSlideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .toast { animation: none; }
                    .toast__progress { animation: none; }
                }
            </style>

            <div class="toast toast--${type}" role="alert" aria-live="polite">
                <span class="toast__icon" aria-hidden="true">${icons[type] || icons.info}</span>
                <div class="toast__content">
                    ${title ? `<div class="toast__title">${title}</div>` : ''}
                    <p class="toast__message">${message}</p>
                </div>
                ${dismissible ? `<button class="toast__dismiss" aria-label="Đóng" type="button">${icons.error}</button>` : ''}
            </div>
            ${!this.hasAttribute('data-loading') ? `<div class="toast__progress" style="animation-duration: ${this.getAttribute('data-duration') || 3000}ms"></div>` : ''}
        `;
    }

    setupEventListeners() {
        const dismissBtn = this.shadowRoot.querySelector('.toast__dismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.dismiss());
        }

        // Swipe to dismiss
        let startX = 0;
        let currentX = 0;
        const threshold = 100;

        this.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        this.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            this.style.transform = `translateX(${diff}px)`;
            this.style.opacity = 1 - Math.abs(diff) / threshold;
        }, { passive: true });

        this.addEventListener('touchend', () => {
            const diff = currentX - startX;
            if (Math.abs(diff) > threshold) {
                this.dismiss();
            } else {
                this.style.transform = '';
                this.style.opacity = '';
            }
        });
    }

    startAutoDismiss() {
        const duration = parseInt(this.getAttribute('data-duration'), 10) || 3000;
        const isDismissible = this.hasAttribute('dismissible');

        if (duration > 0 && !isDismissible) {
            this.autoDismissTimer = setTimeout(() => this.dismiss(), duration);
        }
    }

    dismiss() {
        const toast = this.shadowRoot.querySelector('.toast');
        if (toast) {
            toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
            setTimeout(() => {
                this.remove();
                if (this._onDismiss) {
                    this._onDismiss();
                }
            }, 300);
        } else {
            this.remove();
        }
    }

    setOnDismiss(callback) {
        this._onDismiss = callback;
    }

    static show(title, message, type = 'info', duration = 3000, container = null) {
        const toast = document.createElement('toast-component');
        toast.setAttribute('type', type);
        toast.setAttribute('title', title);
        toast.setAttribute('message', message);
        toast.setAttribute('data-duration', duration.toString());

        if (duration > 0) {
            toast.setAttribute('dismissible', '');
        }

        const targetContainer = container || document.getElementById('toast-container') || document.body;
        targetContainer.appendChild(toast);

        return toast;
    }
}

// Register web component
if (typeof customElements !== 'undefined' && !customElements.get('toast-component')) {
    customElements.define('toast-component', ToastComponent);
}

export { ToastComponent };
export default ToastComponent;
