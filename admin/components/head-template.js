/**
 * Shared Head Template Component
 * Eliminate duplicate meta tags and dns-prefetch across all HTML files
 *
 * Usage: Include this script and use <shared-head title="..." description="...">
 *
 * @module components/head-template
 */

/**
 * Generate clean, deduplicated head metadata
 * @param {Object} options - Head metadata options
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} [options.image] - OG image URL (default: /favicon.png)
 * @param {string} [options.url] - Canonical URL (auto-generated if not provided)
 * @param {boolean} [options.includeTwitter=true] - Include Twitter Card meta tags
 * @returns {string} Complete head HTML string
 */
function generateHeadMetadata({
  title,
  description,
  image = '/favicon.png',
  url = null,
  includeTwitter = true
}) {
  // Deduplicated dns-prefetch (only 4 unique domains)
  const dnsPrefetch = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
    'https://esm.run'
  ].map(domain =>
    `    <link rel="dns-prefetch" href="${domain}">`
  ).join('\n');

  // Auto-generate canonical URL if not provided
  const canonicalUrl = url || `https://sadecmarketinghub.com{currentPath}`;

  return `
    <!-- Essential Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">

    <!-- DNS Prefetch (Deduplicated) -->
${dnsPrefetch}

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image.startsWith('http') ? image : 'https://sadecmarketinghub.com' + image}">

    <!-- Twitter Card -->
    ${includeTwitter ? `
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${canonicalUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image.startsWith('http') ? image : 'https://sadecmarketinghub.com' + image}">` : ''}

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="canonical" href="${canonicalUrl}">
  `.trim();
}

/**
 * Web Component: <shared-head>
 * Custom element for reusable head metadata
 */
class SharedHead extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'image', 'url', 'no-twitter'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const title = this.getAttribute('title') || 'Sa Đéc Marketing Hub';
    const description = this.getAttribute('description') || 'AI-powered marketing platform';
    const image = this.getAttribute('image') || '/favicon.png';
    const url = this.getAttribute('url') || null;
    const noTwitter = this.hasAttribute('no-twitter');

    // Generate head metadata for shadow DOM (for preview)
    this.innerHTML = `
      <div style="display: none;"
           data-title="${title}"
           data-description="${description}"
           data-image="${image}"
           data-url="${url || 'auto'}"
           data-twitter="${!noTwitter}">
        <!-- Shared Head Component: ${title} -->
      </div>
    `;
  }
}

// Register web component if in browser
if (typeof window !== 'undefined' && typeof HTMLElement !== 'undefined') {
  customElements.define('shared-head', SharedHead);
}

// Export for module usage
export { generateHeadMetadata, SharedHead };
export default generateHeadMetadata;
