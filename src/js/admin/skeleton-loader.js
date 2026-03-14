/**
 * Skeleton Loader Component
 * Animated loading skeletons with Intersection Observer
 * @version 1.0.0 | 2026-03-13
 */

/**
 * Skeleton Loader Class
 */
export class SkeletonLoaderComponent {
  constructor(options = {}) {
    this.observer = null;
    this.rootMargin = options.rootMargin || '50px';
    this.skeletonClass = options.skeletonClass || 'skeleton-card';
  }

  /**
   * Initialize skeleton loader
   */
  init() {
    this.createObserver();
    this.observeElements();
  }

  /**
   * Create Intersection Observer
   */
  createObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.load(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: this.rootMargin
      }
    );
  }

  /**
   * Observe skeleton elements
   */
  observeElements() {
    const skeletons = document.querySelectorAll('[data-skeleton="true"]');
    skeletons.forEach((el) => {
      this.observer.observe(el);
    });
  }

  /**
   * Load skeleton content
   * @param {Element} skeleton - Skeleton element
   */
  async load(skeleton) {
    const url = skeleton.dataset.src;
    if (!url) return;

    try {
      const response = await fetch(url);
      const html = await response.text();
      skeleton.removeAttribute('data-skeleton');
      skeleton.innerHTML = html;
    } catch (error) {
      // Silent fail - error UI already handled by skeleton-error class
      skeleton.classList.add('skeleton-error');
      skeleton.innerHTML = `
        <div class="skeleton-error-message">
          <span class="material-symbols-outlined">error</span>
          <p>Không thể tải nội dung</p>
        </div>
      `;
    }
  }

  /**
   * Show skeleton loader
   * @param {Element} container - Target container
   * @param {Object} options - Skeleton options
   * @param {number} options.count - Number of skeleton items
   * @param {string} options.type - Skeleton type (card, list, table)
   */
  show(container, options = {}) {
    const { count = 3, type = 'card' } = options;

    container.innerHTML = Array(count)
      .fill(0)
      .map(() => this.renderSkeleton(type))
      .join('');

    container.setAttribute('data-skeleton', 'true');
  }

  /**
   * Hide skeleton and show content
   * @param {Element} container - Target container
   * @param {string|Element} content - HTML string or Element
   */
  hide(container, content) {
    container.removeAttribute('data-skeleton');

    if (typeof content === 'string') {
      container.innerHTML = content;
    } else if (content instanceof Element) {
      container.innerHTML = '';
      container.appendChild(content);
    }
  }

  /**
   * Render skeleton HTML
   * @param {string} type - Skeleton type
   * @returns {string} HTML string
   */
  renderSkeleton(type) {
    switch (type) {
      case 'card':
        return `
          <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-title"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text short"></div>
            </div>
          </div>
        `;
      case 'list':
        return `
          <div class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-list-content">
              <div class="skeleton-list-title"></div>
              <div class="skeleton-list-text"></div>
            </div>
          </div>
        `;
      case 'table':
        return `
          <div class="skeleton-table-row">
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
          </div>
        `;
      default:
        return `
          <div class="skeleton-block"></div>
        `;
    }
  }

  /**
   * Create skeleton from template
   * @param {string} templateId - Template element ID
   * @param {Object} data - Template data
   * @returns {Element} Skeleton element
   */
  createFromTemplate(templateId, data = {}) {
    const template = document.getElementById(templateId);
    if (!template) return null;

    const clone = template.content.cloneNode(true);
    const elements = clone.querySelectorAll('[data-skeleton-field]');

    elements.forEach((el) => {
      const field = el.dataset.skeletonField;
      const value = data[field];
      if (value !== undefined) {
        el.textContent = value;
      }
    });

    return clone;
  }
}

// ============================================================================
// CSS STYLES
// ============================================================================

/**
 * Inject skeleton loader styles
 */
export function injectSkeletonLoaderStyles() {
  if (document.getElementById('skeleton-loader-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'skeleton-loader-styles';
  styles.textContent = `
    /* Skeleton Animation */
    @keyframes skeleton-loading {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }

    /* Base Skeleton */
    .skeleton-card,
    .skeleton-list-item,
    .skeleton-table-row,
    .skeleton-block {
      position: relative;
      overflow: hidden;
      background: var(--md-sys-color-surface-container-low, #f5f5f5);
      border-radius: 12px;
    }

    .skeleton-card::before,
    .skeleton-list-item::before,
    .skeleton-table-row::before,
    .skeleton-block::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: skeleton-loading 1.5s infinite;
    }

    /* Skeleton Card */
    .skeleton-card {
      padding: 16px;
      margin-bottom: 16px;
    }

    .skeleton-image {
      width: 100%;
      height: 160px;
      background: var(--md-sys-color-surface-container, #e0e0e0);
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .skeleton-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-title {
      width: 70%;
      height: 20px;
      background: var(--md-sys-color-surface-container, #e0e0e0);
      border-radius: 4px;
    }

    .skeleton-text {
      width: 100%;
      height: 14px;
      background: var(--md-sys-color-surface-container-high, #d0d0d0);
      border-radius: 4px;
    }

    .skeleton-text.short {
      width: 50%;
    }

    /* Skeleton List */
    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--md-sys-color-surface-container, #e0e0e0);
      flex-shrink: 0;
    }

    .skeleton-list-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .skeleton-list-title {
      width: 60%;
      height: 16px;
      background: var(--md-sys-color-surface-container, #e0e0e0);
      border-radius: 4px;
    }

    .skeleton-list-text {
      width: 80%;
      height: 12px;
      background: var(--md-sys-color-surface-container-high, #d0d0d0);
      border-radius: 4px;
    }

    /* Skeleton Table */
    .skeleton-table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 12px;
      padding: 12px 16px;
    }

    .skeleton-cell {
      height: 16px;
      background: var(--md-sys-color-surface-container, #e0e0e0);
      border-radius: 4px;
    }

    /* Skeleton Block (generic) */
    .skeleton-block {
      width: 100%;
      height: 200px;
    }

    /* Error State */
    .skeleton-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      background: var(--md-sys-color-error-container, #ffecec);
      border-radius: 12px;
    }

    .skeleton-error .material-symbols-outlined {
      font-size: 48px;
      color: var(--md-sys-color-error, #ba1a1a);
      margin-bottom: 12px;
    }

    .skeleton-error-message {
      color: var(--md-sys-color-error, #ba1a1a);
      font-size: 14px;
    }

    .skeleton-error-message p {
      margin: 8px 0 0;
    }

    /* Dark Mode Support */
    html.dark-mode .skeleton-card,
    html.dark-mode .skeleton-list-item,
    html.dark-mode .skeleton-table-row,
    html.dark-mode .skeleton-block {
      background: var(--md-sys-color-surface-container-low, #2a2a2a);
    }

    html.dark-mode .skeleton-image,
    html.dark-mode .skeleton-title,
    html.dark-mode .skeleton-text,
    html.dark-mode .skeleton-avatar,
    html.dark-mode .skeleton-list-title,
    html.dark-mode .skeleton-list-text,
    html.dark-mode .skeleton-cell {
      background: var(--md-sys-color-surface-container, #3a3a3a);
    }

    html.dark-mode .skeleton-text {
      background: var(--md-sys-color-surface-container-high, #444);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .skeleton-table-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .skeleton-cell {
        height: 12px;
      }
    }
  `;
  document.head.appendChild(styles);
}
