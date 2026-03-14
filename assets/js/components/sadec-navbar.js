/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SADEC-NAVBAR Web Component
 * Sa Đéc Marketing Hub - Phase 3 UI Componentization
 *
 * Usage:
 *   <sadec-navbar title="Page Title" subtitle="Subtitle here"></sadec-navbar>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class SadecNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const title = this.getAttribute('title') || 'Dashboard';
        const subtitle = this.getAttribute('subtitle') || '';

        this.render(title, subtitle);
        this.setupEventListeners();
    }

    render(title, subtitle) {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

                :host {
                    display: block;
                    margin-bottom: 40px;
                }

                .header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .title-group h1 {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                    background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -0.5px;
                }

                :host-context([data-theme="light"]) .title-group h1 {
                    background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .title-group p {
                    margin: 0;
                    font-size: 14px;
                    color: var(--md-sys-color-on-surface-variant, #94a3b8);
                }

                .actions-group {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                .search-glass {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50px;
                    padding: 8px 16px;
                    color: white;
                    width: 260px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s ease;
                }

                :host-context([data-theme="light"]) .search-glass {
                    background: rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    color: #1a1a1a;
                }

                .search-glass:focus-within {
                    border-color: var(--md-sys-color-primary, #00f0ff);
                    box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.1);
                }

                .search-glass input {
                    background: transparent;
                    border: none;
                    color: inherit;
                    width: 100%;
                    outline: none;
                    font-family: inherit;
                    font-size: 14px;
                }

                .search-glass .material-symbols-outlined {
                    font-size: 20px;
                    opacity: 0.7;
                }

                .btn-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: inherit;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                :host-context([data-theme="light"]) .btn-icon {
                    border-color: rgba(0, 0, 0, 0.1);
                    background: rgba(0, 0, 0, 0.05);
                }

                .btn-icon:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);
                }

                :host-context([data-theme="light"]) .btn-icon:hover {
                    background: rgba(0, 0, 0, 0.1);
                }

                .btn-primary {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 20px;
                    background: var(--md-sys-color-primary, #006A60);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    font-family: inherit;
                    font-weight: 500;
                    font-size: 14px;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }

                .btn-primary:hover {
                    filter: brightness(1.1);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 106, 96, 0.3);
                }

                @media (max-width: 768px) {
                    .header-section {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }

                    .actions-group {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .search-glass {
                        flex: 1;
                    }
                }
            </style>

            <div class="header-section">
                <div class="title-group">
                    <h1>${title}</h1>
                    ${subtitle ? `<p>${subtitle}</p>` : ''}
                </div>

                <div class="actions-group">
                    <div class="search-glass">
                        <span class="material-symbols-outlined">search</span>
                        <input type="text" placeholder="Search system... (Ctrl+K)">
                    </div>

                    <button class="btn-icon" id="themeToggle" title="Toggle Theme">
                        <span class="material-symbols-outlined">dark_mode</span>
                    </button>

                    <a href="#" class="btn-primary">
                        <span class="material-symbols-outlined">add</span>
                        <span>NEW</span>
                    </a>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const themeToggle = this.shadowRoot.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => {
            if (window.MekongAdmin?.ThemeManager) {
                window.MekongAdmin.ThemeManager.toggle();
            } else {
                // Fallback if ThemeManager not available
                const html = document.documentElement;
                const current = html.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', next);
            }
        });

        // Search input
        const searchInput = this.shadowRoot.querySelector('input');
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.dispatchEvent(new CustomEvent('search', {
                    detail: { query: e.target.value }
                }));
            }
        });
    }
}

customElements.define('sadec-navbar', SadecNavbar);
window.SadecNavbar = SadecNavbar;
