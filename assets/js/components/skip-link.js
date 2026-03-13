/**
 * Sa Đéc Marketing Hub - Skip Link Component
 * Accessibility feature: Skip to main content
 *
 * Usage: Automatically initialized on page load
 */

(function() {
  'use strict';

  /**
   * Create skip link element
   */
  function createSkipLink() {
    // Check if skip link already exists
    if (document.getElementById('skip-link')) return;

    const skipLink = document.createElement('a');
    skipLink.id = 'skip-link';
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.setAttribute('aria-label', 'Skip to main content');

    // Insert at the beginning of body
    const body = document.body;
    if (body.firstChild) {
      body.insertBefore(skipLink, body.firstChild);
    } else {
      body.appendChild(skipLink);
    }

    // Add main content landmark if not exists
    ensureMainContent();
  }

  /**
   * Ensure main content landmark exists
   */
  function ensureMainContent() {
    let main = document.getElementById('main-content');
    if (!main) {
      // Try to find existing main element
      main = document.querySelector('main');
      if (!main) {
        // Create main wrapper around content
        const content = document.querySelector('.content') ||
                       document.querySelector('.container') ||
                       document.querySelector('#app') ||
                       document.querySelector('body');

        if (content && content !== document.body) {
          main = document.createElement('main');
          main.id = 'main-content';
          main.setAttribute('role', 'main');
          main.setAttribute('tabindex', '-1');

          // Move children to main
          while (content.firstChild) {
            main.appendChild(content.firstChild);
          }
          content.appendChild(main);
        }
      }
    }

    if (main && !main.hasAttribute('tabindex')) {
      main.setAttribute('tabindex', '-1');
    }
  }

  /**
   * Handle skip link click
   */
  function handleSkipClick(e) {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update URL without triggering scroll
      history.pushState(null, '', '#main-content');
    }
  }

  /**
   * Initialize skip link
   */
  function init() {
    createSkipLink();

    // Add event listener
    document.addEventListener('click', (e) => {
      if (e.target.id === 'skip-link') {
        handleSkipClick(e);
      }
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Alt + S to skip
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        const main = document.getElementById('main-content');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
