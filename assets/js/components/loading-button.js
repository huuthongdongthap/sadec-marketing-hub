/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING BUTTON Web Component (< 200 lines)
 * Button with built-in loading state and animations
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { getLoadingButtonCss, injectGlobalRippleStyles } from './loading-button-styles.js';

class LoadingButton extends HTMLElement {
    static get observedAttributes() {
        return ['loading', 'variant', 'size', 'disabled', 'icon'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._loading = false;
        this._originalContent = '';
    }

    get loading() {
        return this._loading;
    }

    set loading(value) {
        this._loading = value;
        this._updateState();
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(value) {
        if (value) this.setAttribute('disabled', '');
        else this.removeAttribute('disabled');
    }

    connectedCallback() {
        this._originalContent = this.innerHTML.trim();
        this.render();
        this._setupRipple();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && name === 'loading') {
            this._loading = newValue !== null;
            this._updateState();
        }
        if (name === 'variant' || name === 'size' || name === 'icon') {
            this.render();
        }
    }

    _setupRipple() {
        this.addEventListener('click', (e) => {
            if (this._loading || this.disabled) return;

            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: button-ripple 0.6s ease-out;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;

            this.shadowRoot.querySelector('.ripple-container')?.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    }

    _updateState() {
        const button = this.shadowRoot.querySelector('button');
        const content = this.shadowRoot.querySelector('.btn-content');
        const spinner = this.shadowRoot.querySelector('.spinner');

        if (!button) return;

        if (this._loading) {
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            content.style.opacity = '0';
            spinner.style.opacity = '1';
        } else {
            button.disabled = this.disabled;
            button.removeAttribute('aria-busy');
            content.style.opacity = '1';
            spinner.style.opacity = '0';
        }
    }

    render() {
        const variant = this.getAttribute('variant') || 'primary';
        const size = this.getAttribute('size') || 'md';
        const icon = this.getAttribute('icon');

        this.shadowRoot.innerHTML = `
            <style>${getLoadingButtonCss(variant, size)}</style>
            <button>
                <span class="ripple-container"></span>
                <span class="btn-content">
                    ${icon ? `<span class="material-symbols-outlined">${icon}</span>` : ''}
                    <span>${this._originalContent || this.textContent}</span>
                </span>
                <span class="spinner">
                    <span class="spinner-icon"></span>
                </span>
            </button>
        `;

        this._updateState();
    }

    startLoading() {
        this.loading = true;
    }

    stopLoading() {
        this.loading = false;
    }

    reset() {
        this.loading = false;
        this.disabled = false;
    }
}

// Register custom element
if (typeof customElements !== 'undefined' && !customElements.get('loading-button')) {
    customElements.define('loading-button', LoadingButton);
}
if (typeof window !== 'undefined') {
    window.LoadingButton = LoadingButton;
}

injectGlobalRippleStyles();

export { LoadingButton };
export default LoadingButton;
