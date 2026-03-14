/**
 * ============================================================================
 * SA ĐÉC MARKETING HUB - LOADING STATES COMPONENT
 * ============================================================================
 *
 * Web Component for beautiful loading states with skeleton screens,
 * spinners, and progress indicators.
 *
 * USAGE:
 *   // Skeleton screen
 *   <loading-state type="skeleton" variant="card"></loading-state>
 *
 *   // Spinner
 *   <loading-state type="spinner" size="large"></loading-state>
 *
 *   // Progress bar
 *   <loading-state type="progress" value="75"></loading-state>
 *
 *   // Full page overlay
 *   LoadingState.showOverlay('Đang tải...');
 *   LoadingState.hideOverlay();
 */

class LoadingState extends HTMLElement {
    static get observedAttributes() {
        return ['type', 'variant', 'size', 'value', 'message'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot.innerHTML) {
            this.render();
        }
    }

    render() {
        const type = this.getAttribute('type') || 'spinner';
        const variant = this.getAttribute('variant') || 'default';
        const size = this.getAttribute('size') || 'medium';
        const message = this.getAttribute('message') || '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    font-family: system-ui, -apple-system, sans-serif;
                }

                /* Spinner */
                .spinner {
                    width: ${this.getSize(size)};
                    height: ${this.getSize(size)};
                    border: 3px solid rgba(59, 130, 246, 0.1);
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Skeleton */
                .skeleton {
                    background: linear-gradient(
                        90deg,
                        rgba(229, 231, 235, 0.8) 25%,
                        rgba(243, 244, 246, 1) 50%,
                        rgba(229, 231, 235, 0.8) 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s ease-in-out infinite;
                    border-radius: 8px;
                }

                @keyframes shimmer {
                    to { background-position: 200% 0; }
                }

                .skeleton-card {
                    width: 100%;
                    max-width: 320px;
                }

                .skeleton-avatar {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    margin-bottom: 16px;
                }

                .skeleton-title {
                    height: 24px;
                    width: 80%;
                    margin-bottom: 12px;
                }

                .skeleton-text {
                    height: 16px;
                    width: 100%;
                    margin-bottom: 8px;
                }

                .skeleton-text.short {
                    width: 60%;
                }

                /* Progress Bar */
                .progress-container {
                    width: 100%;
                    max-width: 300px;
                    height: 8px;
                    background: rgba(229, 231, 235, 1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        #3b82f6,
                        #8b5cf6,
                        #3b82f6
                    );
                    background-size: 200% 100%;
                    animation: progress-gradient 2s ease-in-out infinite;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                @keyframes progress-gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* Dots */
                .dots {
                    display: flex;
                    gap: 8px;
                }

                .dot {
                    width: 12px;
                    height: 12px;
                    background: #3b82f6;
                    border-radius: 50%;
                    animation: dot-bounce 1.4s ease-in-out infinite;
                }

                .dot:nth-child(2) { animation-delay: 0.16s; }
                .dot:nth-child(3) { animation-delay: 0.32s; }

                @keyframes dot-bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                /* Pulse Ring */
                .pulse-ring {
                    position: relative;
                    width: ${this.getSize(size)};
                    height: ${this.getSize(size)};
                }

                .pulse-ring::before,
                .pulse-ring::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 3px solid #3b82f6;
                    border-radius: 50%;
                    animation: pulse-ring 1.5s ease-out infinite;
                }

                .pulse-ring::after {
                    animation-delay: 0.5s;
                }

                @keyframes pulse-ring {
                    0% {
                        transform: scale(0.5);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }

                /* Message */
                .message {
                    margin-top: 16px;
                    color: #6b7280;
                    font-size: 14px;
                    font-weight: 500;
                    text-align: center;
                }

                /* Sizes */
                .size-small { --size: 24px; }
                .size-medium { --size: 40px; }
                .size-large { --size: 64px; }
            </style>

            ${this.renderContent(type, variant, message)}
        `;
    }

    getSize(size) {
        const sizes = { small: '24px', medium: '40px', large: '64px' };
        return sizes[size] || sizes.medium;
    }

    renderContent(type, variant, message) {
        let html = '';

        switch (type) {
            case 'skeleton':
                html = this.renderSkeleton(variant);
                break;
            case 'spinner':
                html = `<div class="spinner"></div>`;
                break;
            case 'progress':
                const value = this.getAttribute('value') || 0;
                html = `
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${value}%"></div>
                    </div>
                `;
                break;
            case 'dots':
                html = `
                    <div class="dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                `;
                break;
            case 'pulse':
                html = `<div class="pulse-ring"></div>`;
                break;
        }

        if (message) {
            html += `<div class="message">${this.escapeHtml(message)}</div>`;
        }

        return html;
    }

    renderSkeleton(variant) {
        switch (variant) {
            case 'card':
                return `
                    <div class="skeleton skeleton-card">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-title"></div>
                        <div class="skeleton-text"></div>
                        <div class="skeleton-text short"></div>
                    </div>
                `;
            case 'avatar':
                return `<div class="skeleton skeleton-avatar"></div>`;
            case 'text':
                return `
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                `;
            default:
                return `
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                `;
        }
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ===== STATIC METHODS =====

    static showOverlay(message = 'Đang tải...') {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.innerHTML = `
                <style>
                    #loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(4px);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        z-index: 999999;
                        animation: fadeIn 0.2s ease-out;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    #loading-overlay .spinner {
                        width: 64px;
                        height: 64px;
                        border: 4px solid rgba(255, 255, 255, 0.2);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }

                    #loading-overlay .message {
                        margin-top: 16px;
                        color: white;
                        font-size: 16px;
                        font-weight: 600;
                        font-family: system-ui, -apple-system, sans-serif;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
                <div class="spinner"></div>
                <div class="message">${this.escapeHtmlStatic(message)}</div>
            `;
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    static hideOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
            setTimeout(() => overlay.remove(), 200);
        }
    }

    static escapeHtmlStatic(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Register web component
customElements.define('loading-state', LoadingState);

// Export for programmatic use
export const LoadingState = {
    showOverlay: LoadingState.showOverlay,
    hideOverlay: LoadingState.hideOverlay
};

export default LoadingState;
