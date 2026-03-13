/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MEKONG UI UTILITIES
 * Loading States, Animations & Scroll-triggered Effects
 * Sa Đéc Marketing Hub - Phase 4 UI Enhancement
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================================================

/**
 * Initialize scroll-triggered animations using Intersection Observer
 * Call this on DOMContentLoaded or after dynamic content loads
 */
export function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe all animation elements
  document.querySelectorAll('.animate-entry, .animate-entry-premium, .animate-from-left, .animate-from-right, .animate-scale').forEach((el) => {
    animationObserver.observe(el);
  });

  return animationObserver;
}

// ============================================================================
// LOADING SPINNER UTILITIES
// ============================================================================

/**
 * Create a spinner element
 * @param {'primary' | 'secondary' | 'small' | 'large' | 'pulse'} type - Spinner style
 * @returns {HTMLDivElement} Spinner element
 */
export function createSpinner(type = 'primary') {
  const spinner = document.createElement('div');
  spinner.className = `spinner-${type}`;
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-label', 'Loading');
  return spinner;
}

/**
 * Show loading spinner in a container
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Options
 */
export function showLoading(container, options = {}) {
  const { type = 'primary', centered = true, message } = options;

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = centered ? 'lazy-loader-center' : '';
  wrapper.style.padding = '40px';

  wrapper.appendChild(createSpinner(type));

  if (message) {
    const msgEl = document.createElement('p');
    msgEl.className = 'body-medium';
    msgEl.style.marginTop = '16px';
    msgEl.style.textAlign = 'center';
    msgEl.style.color = 'var(--md-sys-color-on-surface-variant)';
    msgEl.textContent = message;
    wrapper.appendChild(msgEl);
  }

  container.appendChild(wrapper);
}

/**
 * Hide loading and show content
 * @param {HTMLElement} container - Container element
 * @param {HTMLElement|string} content - Content to show
 */
export function hideLoading(container, content = null) {
  container.innerHTML = '';

  if (content) {
    if (typeof content === 'string') {
      container.innerHTML = content;
    } else {
      container.appendChild(content);
    }
  }
}

// ============================================================================
// SKELETON LOADER UTILITIES
// ============================================================================

/**
 * Create skeleton card for content placeholder
 * @param {Object} options - Skeleton options
 */
export function createSkeletonCard(options = {}) {
  const { showAvatar = false, showImage = false, textLines = 3 } = options;

  const card = document.createElement('div');
  card.className = 'skeleton-card';

  if (showAvatar) {
    const avatar = document.createElement('div');
    avatar.className = 'skeleton-base skeleton-avatar';
    card.appendChild(avatar);
  }

  if (showImage) {
    const image = document.createElement('div');
    image.className = 'skeleton-base skeleton-image';
    card.appendChild(image);
  }

  const title = document.createElement('div');
  title.className = 'skeleton-base skeleton-title';
  card.appendChild(title);

  for (let i = 0; i < textLines; i++) {
    const text = document.createElement('div');
    text.className = 'skeleton-base skeleton-text';
    if (i === textLines - 1) {
      text.classList.add('skeleton-text-short');
    }
    card.appendChild(text);
  }

  return card;
}

/**
 * Show skeleton loaders in a grid
 * @param {HTMLElement} container - Container element
 * @param {number} count - Number of skeleton cards
 */
export function showSkeletonGrid(container, count = 6, options = {}) {
  container.innerHTML = '';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  container.style.gap = '24px';

  for (let i = 0; i < count; i++) {
    container.appendChild(createSkeletonCard(options));
  }
}

// ============================================================================
// BUTTON LOADING STATES
// ============================================================================

/**
 * Set button to loading state
 * @param {HTMLButtonElement} button - Button element
 */
export function setButtonLoading(button) {
  button.classList.add('btn-loading');
  button.dataset.originalText = button.textContent;
  button.disabled = true;
}

/**
 * Reset button from loading state
 * @param {HTMLButtonElement} button - Button element
 */
export function resetButtonLoading(button) {
  button.classList.remove('btn-loading');
  if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
  }
  button.disabled = false;
}

// ============================================================================
// RIPPLE EFFECT
// ============================================================================

/**
 * Initialize ripple effect on buttons
 */
export function initRippleEffect() {
  document.querySelectorAll('.ripple-container').forEach((container) => {
    container.addEventListener('click', (e) => {
      const rect = container.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      container.appendChild(ripple);

      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    });
  });
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {number} duration - Auto-hide duration in ms
 */
export function showToast(message, duration = 3000) {
  return new Promise((resolve) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    setTimeout(() => {
      toast.classList.add('hiding');
      toast.addEventListener('transitionend', () => {
        toast.remove();
        resolve();
      });
    }, duration);
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all Mekong UI utilities
 */
export function initMekongUI() {
  initScrollAnimations();
  initRippleEffect();
  // [REMOVED] console.log('[MekongUI] Initialized');
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMekongUI);
  } else {
    initMekongUI();
  }
}

export default {
  initMekongUI,
  initScrollAnimations,
  initRippleEffect,
  createSpinner,
  showLoading,
  hideLoading,
  createSkeletonCard,
  showSkeletonGrid,
  setButtonLoading,
  resetButtonLoading,
  showToast
};
