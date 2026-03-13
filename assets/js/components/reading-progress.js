/**
 * Sa Đéc Marketing Hub - Reading Progress Bar
 * UX feature: Show reading progress on pages
 *
 * Usage: Automatically added to pages with long content
 */

(function() {
  'use strict';

  const CONFIG = {
    minHeight: 500, // Only show on pages with content > 500px
    position: 'top', // 'top' or 'bottom'
    height: 4,
    color: 'primary',
    showPercentage: false
  };

  let progressBar = null;
  let progressLabel = null;

  /**
   * Create progress bar element
   */
  function createProgressBar() {
    if (progressBar) return;

    const container = document.createElement('div');
    container.className = 'reading-progress-container';
    container.setAttribute('role', 'progressbar');
    container.setAttribute('aria-label', 'Reading progress');

    const bar = document.createElement('div');
    bar.className = 'reading-progress-bar';
    bar.style.height = CONFIG.height + 'px';
    bar.style.width = '0%';

    container.appendChild(bar);
    progressBar = bar;

    if (CONFIG.showPercentage) {
      progressLabel = document.createElement('span');
      progressLabel.className = 'reading-progress-label';
      progressLabel.textContent = '0%';
      container.appendChild(progressLabel);
    }

    // Position
    if (CONFIG.position === 'top') {
      container.style.top = '0';
      container.style.borderRadius = `0 0 ${CONFIG.height}px ${CONFIG.height}px`;
    } else {
      container.style.bottom = '0';
      container.style.borderRadius = `${CONFIG.height}px ${CONFIG.height}px 0 0`;
    }

    document.body.insertBefore(container, document.body.firstChild);
  }

  /**
   * Update progress based on scroll
   */
  function updateProgress() {
    if (!progressBar) return;

    const scrollTop = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;

    let progress = 0;
    if (documentHeight > 0) {
      progress = (scrollTop / documentHeight) * 100;
    }

    // Clamp between 0 and 100
    progress = Math.min(100, Math.max(0, progress));

    progressBar.style.width = progress + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(progress));

    if (progressLabel) {
      progressLabel.textContent = Math.round(progress) + '%';
    }
  }

  /**
   * Handle scroll with RAF for performance
   */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }

  /**
   * Initialize reading progress
   */
  function init() {
    // Only show on pages with enough content
    const contentHeight = document.documentElement.scrollHeight;
    if (contentHeight < CONFIG.minHeight) return;

    createProgressBar();

    // Add scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial update
    updateProgress();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
