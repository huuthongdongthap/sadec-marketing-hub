/**
 * ==============================================
 * SHARED HEAD TEMPLATE
 * Reusable head template for all HTML pages
 * ==============================================
 *
 * USAGE:
 * 1. Include this script: <script src="/assets/js/shared-head.js"></script>
 * 2. Call MekongHead.render(title, description) in <head>
 *
 * OR use the static HTML include:
 *  <!--#include virtual="/assets/includes/head.html" -->
 */

export const MekongHead = {
    /**
     * Common DNS prefetch links
     */
    dnsPrefetch: [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdn.jsdelivr.net',
        'esm.run'
    ],

    /**
     * Default meta tags
     */
    defaults: {
        charset: 'UTF-8',
        viewport: 'width=device-width, initial-scale=1.0',
        themeColor: '#00e5ff',
        baseUrl: 'https://sadecmarketinghub.com'
    },

    /**
     * Render complete head section
     * @param {string} title - Page title
     * @param {string} description - Page description
     * @param {object} options - Additional options
     */
    render(title = 'Mekong Agency', description = 'RaaS Agency Platform', options = {}) {
        const {
            canonical,
            ogImage,
            ogType = 'website',
            noDnsPrefetch = false
        } = options;

        const url = canonical || `${this.defaults.baseUrl}${window.location.pathname}`;
        const imageUrl = ogImage || `${this.defaults.baseUrl}/favicon.png`;

        let html = `
<!-- SHARED HEAD START -->
<meta charset="${this.defaults.charset}">
<meta name="viewport" content="${this.defaults.viewport}">
<meta name="theme-color" content="${this.defaults.themeColor}">

<!-- SEO -->
<title>${this.escapeHtml(title)}</title>
<meta name="description" content="${this.escapeHtml(description)}">
<link rel="canonical" href="${this.escapeHtml(url)}">

<!-- Open Graph -->
<meta property="og:title" content="${this.escapeHtml(title)}">
<meta property="og:description" content="${this.escapeHtml(description)}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${this.escapeHtml(url)}">
<meta property="og:image" content="${imageUrl}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${this.escapeHtml(title)}">
<meta name="twitter:description" content="${this.escapeHtml(description)}">
<meta name="twitter:image" content="${imageUrl}">

<!-- Favicon -->
<link rel="icon" type="image/png" href="/favicon.png">
`;

        // DNS Prefetch (only 1 set, not repeated)
        if (!noDnsPrefetch) {
            html += '\n<!-- DNS Prefetch -->\n';
            this.dnsPrefetch.forEach(domain => {
                html += `<link rel="dns-prefetch" href="https://${domain}">\n`;
            });
        }

        // Additional stylesheets
        if (options.stylesheets) {
            html += '\n<!-- Additional Stylesheets -->\n';
            options.stylesheets.forEach(css => {
                html += `<link rel="stylesheet" href="${css}">\n`;
            });
        }

        html += '\n<!-- SHARED HEAD END -->\n';

        return html;
    },

    /**
     * Render minimal head for components
     */
    renderMinimal(title = 'Component') {
        return `
<meta charset="${this.defaults.charset}">
<meta name="viewport" content="${this.defaults.viewport}">
<title>${this.escapeHtml(title)}</title>
<link rel="icon" type="image/png" href="/favicon.png">
`.trim();
    },

    /**
     * Escape HTML entities
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Inject head content into document
     */
    inject(title, description, options = {}) {
        const headHtml = this.render(title, description, options);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = headHtml;

        Array.from(tempDiv.children).forEach(child => {
            document.head.appendChild(child);
        });
    }
};

/**
 * Auto-inject if running in browser with data-auto-head attribute
 */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const script = document.currentScript;
    if (script && script.dataset.autoHead === 'true') {
        const title = script.dataset.title || 'Mekong Agency';
        const description = script.dataset.description || 'RaaS Agency Platform';
        MekongHead.inject(title, description);
    }
}

// Export for ES modules
export default MekongHead;

// Export for CommonJS
// Export for ES modules
export default MekongHead;
