/**
 * ==============================================
 * ADVANCED LOADING STATES
 * Enhanced loading components with progress, skeleton, and spinners
 * @version 2.0.0 | 2026-03-14
 * ==============================================
 */

// ============================================================================
// LOADING MANAGER CLASS
// ============================================================================

export class LoadingManager {
  constructor() {
    this.activeLoaders = new Map();
    this.defaultConfig = {
      minDuration: 300,
      fadeDuration: 200
    };
  }

  /**
   * Show full-screen loading overlay
   * @param {Object} options - Loading options
   * @returns {string} Loader ID
   */
  showOverlay(options = {}) {
    const {
      message = 'Đang tải...',
      subMessage = null,
      showProgress = false,
      progressValue = null
    } = options;

    const id = this.generateId();

    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'loading-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-busy', 'true');
    overlay.innerHTML = `
      <div class="loading-overlay-content">
        <div class="loading-spinner-container">
          <div class="loading-spinner-ring"></div>
          <div class="loading-spinner-ring"></div>
          <div class="loading-spinner-ring"></div>
          <span class="material-symbols-outlined loading-icon">settings</span>
        </div>
        <div class="loading-message">${message}</div>
        ${subMessage ? `<div class="loading-submessage">${subMessage}</div>` : ''}
        ${showProgress ? `
          <div class="loading-progress-bar">
            <div class="loading-progress-fill" style="width: ${progressValue || 0}%"></div>
          </div>
          <div class="loading-progress-text">${progressValue || 0}%</div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeLoaders.set(id, { type: 'overlay', element: overlay, startTime: Date.now() });

    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add('visible');
    });

    return id;
  }

  /**
   * Hide loading overlay
   * @param {string} id - Loader ID
   */
  async hideOverlay(id) {
    const loader = this.activeLoaders.get(id);
    if (!loader) return;

    const elapsed = Date.now() - loader.startTime;
    const remaining = Math.max(0, this.defaultConfig.minDuration - elapsed);

    // Ensure minimum display time
    await this.delay(remaining);

    loader.element.classList.remove('visible');
    await this.delay(this.defaultConfig.fadeDuration);

    loader.element.remove();
    this.activeLoaders.delete(id);
  }

  /**
   * Show loading on specific element
   * @param {string|Element} target - Target element or selector
   * @param {Object} options - Loading options
   * @returns {string} Loader ID
   */
  showElement(target, options = {}) {
    const element = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (!element) return null;

    const id = this.generateId();
    const { skeleton = false, skeletonCount = 3 } = options;

    const loader = document.createElement('div');
    loader.id = id;
    loader.className = `loading-element ${skeleton ? 'loading-skeleton' : ''}`;
    loader.innerHTML = skeleton
      ? this.renderSkeletons(skeletonCount)
      : '<div class="loading-spinner"></div>';

    element.classList.add('loading');
    element.setAttribute('aria-busy', 'true');
    element.appendChild(loader);
    this.activeLoaders.set(id, { type: 'element', element: loader, target, startTime: Date.now() });

    return id;
  }

  /**
   * Hide element loading
   * @param {string} id - Loader ID
   */
  async hideElement(id) {
    const loader = this.activeLoaders.get(id);
    if (!loader) return;

    loader.element.classList.add('hiding');
    await this.delay(this.defaultConfig.fadeDuration);

    loader.element.remove();
    loader.target.classList.remove('loading');
    loader.target.removeAttribute('aria-busy');
    this.activeLoaders.delete(id);
  }

  /**
   * Render skeleton loaders
   * @param {number} count - Number of skeletons
   * @returns {string} HTML
   */
  renderSkeletons(count) {
    return Array(count).fill(0).map((_, i) => `
      <div class="skeleton-item" style="animation-delay: ${i * 100}ms">
        <div class="skeleton-shimmer"></div>
      </div>
    `).join('');
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `loader-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Hide all loaders
   */
  hideAll() {
    this.activeLoaders.forEach((loader, id) => {
      if (loader.type === 'overlay') {
        this.hideOverlay(id);
      } else {
        this.hideElement(id);
      }
    });
  }
}

// ============================================================================
// PROGRESS INDICATOR
// ============================================================================

export class ProgressIndicator {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.options = {
      type: 'linear', // linear, circular
      showPercentage: true,
      animated: true,
      ...options
    };

    this.value = 0;
    this.init();
  }

  init() {
    if (!this.container) return;

    if (this.options.type === 'circular') {
      this.renderCircular();
    } else {
      this.renderLinear();
    }
  }

  renderLinear() {
    this.container.innerHTML = `
      <div class="progress-linear-container">
        <div class="progress-linear-track">
          <div class="progress-linear-bar" style="width: 0%"></div>
        </div>
        ${this.options.showPercentage ? '<span class="progress-percentage">0%</span>' : ''}
      </div>
    `;

    this.bar = this.container.querySelector('.progress-linear-bar');
    this.percentageEl = this.container.querySelector('.progress-percentage');
  }

  renderCircular() {
    const size = this.options.size || 120;
    const strokeWidth = this.options.strokeWidth || 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    this.container.innerHTML = `
      <div class="progress-circular-container" style="--size: ${size}px">
        <svg class="progress-circular-svg" width="${size}" height="${size}">
          <circle
            class="progress-circular-track"
            cx="${size/2}"
            cy="${size/2}"
            r="${radius}"
            stroke-width="${strokeWidth}"
          />
          <circle
            class="progress-circular-indicator"
            cx="${size/2}"
            cy="${size/2}"
            r="${radius}"
            stroke-width="${strokeWidth}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
          />
        </svg>
        ${this.options.showPercentage ? `<span class="progress-percentage">0%</span>` : ''}
      </div>
    `;

    this.indicator = this.container.querySelector('.progress-circular-indicator');
    this.percentageEl = this.container.querySelector('.progress-percentage');
    this.circumference = circumference;
  }

  setProgress(value) {
    this.value = Math.max(0, Math.min(100, value));

    if (this.bar) {
      this.bar.style.width = `${this.value}%`;
    }

    if (this.indicator) {
      const offset = this.circumference - (this.value / 100) * this.circumference;
      this.indicator.style.strokeDashoffset = offset;
    }

    if (this.percentageEl) {
      this.percentageEl.textContent = `${Math.round(this.value)}%`;
    }

    this.container.setAttribute('aria-valuenow', this.value);
  }

  increment(amount = 10) {
    this.setProgress(this.value + amount);
  }

  complete() {
    this.setProgress(100);
    this.container.classList.add('progress-complete');
  }
}

// ============================================================================
// IMAGE LAZY LOADING WITH PLACEHOLDER
// ============================================================================

export class LazyImageLoader {
  constructor() {
    this.observer = null;
    this.loadedImages = new Set();
    this.placeholderType = 'blur'; // blur, skeleton, color
  }

  init() {
    this.createObserver();
    this.observeAll();
  }

  createObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );
  }

  observeAll() {
    document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
      if (!this.loadedImages.has(img)) {
        this.observer.observe(img);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src && !srcset) return;

    // Add loading class
    img.classList.add('loading');

    // Create new image to preload
    const tempImg = new Image();

    tempImg.onload = () => {
      if (src) img.src = src;
      if (srcset) img.srcset = srcset;

      img.classList.remove('loading');
      img.classList.add('loaded');
      this.loadedImages.add(img);
      this.observer.unobserve(img);

      // Dispatch event
      img.dispatchEvent(new CustomEvent('image-loaded', { detail: { src } }));
    };

    tempImg.onerror = () => {
      img.classList.add('error');
      img.dispatchEvent(new CustomEvent('image-error', { detail: { src } }));
    };

    if (src) tempImg.src = src;
    if (srcset) tempImg.srcset = srcset;
  }

  /**
   * Add placeholder to image
   * @param {HTMLImageElement} img - Image element
   * @param {string} type - Placeholder type
   */
  addPlaceholder(img, type = 'blur') {
    img.classList.add('lazy-image');

    if (type === 'skeleton') {
      img.classList.add('lazy-skeleton');
    } else if (type === 'color') {
      img.classList.add('lazy-color');
    } else {
      img.classList.add('lazy-blur');
    }
  }
}

// ============================================================================
// BUTTON LOADING STATE
// ============================================================================

export function setButtonLoading(button, loading, options = {}) {
  if (!button) return;

  const {
    originalText = button.textContent,
    loadingText = 'Đang xử lý...',
    icon = 'progress_activity'
  } = options;

  if (loading) {
    button.dataset.originalText = originalText;
    button.classList.add('btn-loading');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');

    if (loadingText) {
      button.innerHTML = `
        <span class="material-symbols-outlined btn-loading-icon">${icon}</span>
        <span class="btn-loading-text">${loadingText}</span>
      `;
    }
  } else {
    const original = button.dataset.originalText || originalText;
    button.classList.remove('btn-loading');
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.textContent = original;
  }
}

// ============================================================================
// PAGE TRANSITION LOADER
// ============================================================================

export class PageTransitionLoader {
  constructor(options = {}) {
    this.options = {
      showOnPageLoad: true,
      minDuration: 500,
      maxDuration: 2000,
      ...options
    };

    if (this.options.showOnPageLoad) {
      this.init();
    }
  }

  init() {
    this.createLoader();
    this.bindEvents();
  }

  createLoader() {
    const loader = document.createElement('div');
    loader.id = 'page-transition-loader';
    loader.className = 'page-transition-loader';
    loader.innerHTML = `
      <div class="page-loader-content">
        <div class="page-loader-spinner"></div>
        <div class="page-loader-text">Đang tải trang...</div>
      </div>
    `;

    document.body.appendChild(loader);
    this.loader = loader;
  }

  bindEvents() {
    window.addEventListener('load', () => {
      this.hide();
    });

    // Intercept navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"], a[href^="http"]');
      if (link && !link.target && !link.download) {
        this.show();
      }
    });
  }

  async show() {
    this.loader.classList.add('visible');
    document.body.classList.add('page-loading');
  }

  async hide() {
    await new Promise(resolve => setTimeout(resolve, this.options.minDuration));
    this.loader.classList.remove('visible');
    document.body.classList.remove('page-loading');
  }
}

// ============================================================================
// AUTO-INIT
// ============================================================================

const globalLoadingManager = new LoadingManager();

export const loading = {
  showOverlay: (options) => globalLoadingManager.showOverlay(options),
  hideOverlay: (id) => globalLoadingManager.hideOverlay(id),
  showElement: (target, options) => globalLoadingManager.showElement(target, options),
  hideElement: (id) => globalLoadingManager.hideElement(id),
  hideAll: () => globalLoadingManager.hideAll()
};

// Auto-init lazy images
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const lazyLoader = new LazyImageLoader();
    lazyLoader.init();
  });
}
