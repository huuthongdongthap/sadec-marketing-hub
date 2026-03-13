/**
 * Breadcrumbs Component - Sa Đéc Marketing Hub
 * Navigation breadcrumb with schema.org markup
 *
 * Usage:
 *   <nav class="breadcrumbs" aria-label="Breadcrumb"></nav>
 *   Breadcrumbs.render([{ label: 'Home', href: '/' }, { label: 'Admin', href: '/admin' }]);
 */

class Breadcrumbs {
  /**
   * Render breadcrumbs
   * @param {Array<{label: string, href: string, active?: boolean}>} items
   * @param {HTMLElement} container
   */
  static render(items, container) {
    if (!container) {
      container = document.querySelector('.breadcrumbs');
    }

    if (!container || items.length === 0) return;

    const schema = items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href
    }));

    const html = `
      <ol class="breadcrumbs-list" itemscope itemtype="https://schema.org/BreadcrumbList">
        ${items.map((item, index) => `
          <li class="breadcrumb-item${item.active ? ' active' : ''}"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem">
            ${!item.active ? `
              <a href="${item.href}" itemprop="item">
                <span itemprop="name">${item.label}</span>
              </a>
            ` : `
              <span aria-current="page" itemprop="name">${item.label}</span>
            `}
            ${index < items.length - 1 ? '<span class="breadcrumb-separator" aria-hidden="true">/</span>' : ''}
            <meta itemprop="position" content="${index + 1}">
          </li>
        `).join('')}
      </ol>
      <script type="application/ld+json">
        ${JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: schema
        })}
      </script>
    `;

    container.innerHTML = html;
  }

  /**
   * Auto-generate breadcrumbs from current path
   * @param {string} basePath
   */
  static autoGenerate(basePath = '') {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);

    const items = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = this.formatLabel(segment);
      const isLast = index === segments.length - 1;

      return {
        label: isLast ? label : label,
        href: basePath + href,
        active: isLast
      };
    });

    // Add home
    items.unshift({
      label: 'Home',
      href: basePath + '/',
      active: false
    });

    return items;
  }

  /**
   * Format segment to readable label
   */
  static formatLabel(segment) {
    return segment
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\.html$/, '')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}

// Auto-init on DOMContentLoaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.breadcrumbs');
    if (container && !container.hasAttribute('data-no-auto')) {
      const items = Breadcrumbs.autoGenerate();
      Breadcrumbs.render(items, container);
    }
  });
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Breadcrumbs;
}
