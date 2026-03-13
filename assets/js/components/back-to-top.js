/**
 * Sa Đéc Marketing Hub - Back to Top Button
 * UX feature: Scroll to top button
 *
 * Usage: Automatically shown after scrolling down 300px
 */

(function() {
  'use strict';

  const CONFIG = {
    showAfterScroll: 300,
    scrollDuration: 500,
    position: 'bottom-right',
    icon: 'arrow_upward'
  };

  let backToTopButton = null;
  let scrollThreshold = CONFIG.showAfterScroll;

  /**
   * Create back to top button
   */
  function createButton() {
    if (backToTopButton) return;

    backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    backToTopButton.innerHTML = `
      <span class="material-symbols-outlined">${CONFIG.icon}</span>
    `;

    document.body.appendChild(backToTopButton);

    // Add click handler
    backToTopButton.addEventListener('click', scrollToTop);

    // Add keyboard handler
    backToTopButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
      }
    });
  }

  /**
   * Scroll to top with smooth animation
   */
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    // Update URL
    history.pushState(null, '', '#');
  }

  /**
   * Toggle button visibility based on scroll position
   */
  function toggleButton() {
    if (!backToTopButton) return;

    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > scrollThreshold) {
      backToTopButton.classList.add('visible');
      backToTopButton.setAttribute('aria-hidden', 'false');
    } else {
      backToTopButton.classList.remove('visible');
      backToTopButton.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Handle scroll with RAF for performance
   */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        toggleButton();
        ticking = false;
      });
      ticking = true;
    }
  }

  /**
   * Initialize back to top
   */
  function init() {
    createButton();

    // Add scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial check
    toggleButton();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
