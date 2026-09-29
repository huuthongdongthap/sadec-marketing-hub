/**
 * Mobile Navigation Helper
 * Xử lý sidebar toggle, touch gestures, và responsive utilities
 * @version 1.0.0
 */

(function() {
  'use strict';

  // State
  let sidebarOpen = false;
  let sidebarElement = null;
  let overlayElement = null;
  let toggleButton = null;

  // Breakpoint
  const MOBILE_BREAKPOINT = 768;

  /**
   * Initialize mobile navigation
   */
  function init() {
    // Find sidebar element
    sidebarElement = document.querySelector('sadec-sidebar');
    if (!sidebarElement) {
      // [DEV] 'MobileNav: No sidebar found');
      return;
    }

    // Create overlay
    createOverlay();

    // Create or find toggle button
    createToggleButton();

    // Add event listeners
    addEventListeners();

    // Handle initial state
    handleResize();

  }

  /**
   * Create overlay element
   */
  function createOverlay() {
    overlayElement = document.createElement('div');
    overlayElement.className = 'mobile-nav-overlay';
    overlayElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      z-index: 999;
    `;
    document.body.appendChild(overlayElement);
  }

  /**
   * Create toggle button if not exists
   */
  function createToggleButton() {
    // Check if toggle button already exists in nav
    toggleButton = document.querySelector('.nav-toggle, .mobile-menu-toggle, [data-mobile-toggle]');

    if (!toggleButton) {
      // Create toggle button
      toggleButton = document.createElement('button');
      toggleButton.className = 'mobile-menu-toggle';
      toggleButton.setAttribute('aria-label', 'Toggle menu');
      toggleButton.setAttribute('aria-expanded', 'false');
      toggleButton.innerHTML = `
        <span class="material-symbols-outlined">menu</span>
      `;
      toggleButton.style.cssText = `
        display: none;
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 1000;
        background: var(--md-sys-color-surface);
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(toggleButton);
    }
  }

  /**
   * Add event listeners
   */
  function addEventListeners() {
    // Toggle button click
    toggleButton.addEventListener('click', toggleSidebar);

    // Overlay click to close
    overlayElement.addEventListener('click', closeSidebar);

    // Window resize
    window.addEventListener('resize', handleResize);

    // Escape key to close
    document.addEventListener('keydown', handleKeyDown);

    // Touch gestures
    addTouchGestures();

    // Handle sidebar link clicks
    handleSidebarLinks();
  }

  /**
   * Toggle sidebar open/close
   */
  function toggleSidebar() {
    if (sidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  /**
   * Open sidebar
   */
  function openSidebar() {
    sidebarOpen = true;

    // Add class to sidebar
    sidebarElement.classList.add('mobile-open');

    // Show overlay
    overlayElement.style.opacity = '1';
    overlayElement.style.visibility = 'visible';

    // Update toggle button state
    toggleButton.setAttribute('aria-expanded', 'true');

    // Update icon
    const icon = toggleButton.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.textContent = 'close';
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus trap
    trapFocus(sidebarElement);

    // Announce to screen readers
    announceToScreenReader('Menu opened');
  }

  /**
   * Close sidebar
   */
  function closeSidebar() {
    sidebarOpen = false;

    // Remove class from sidebar
    sidebarElement.classList.remove('mobile-open');

    // Hide overlay
    overlayElement.style.opacity = '0';
    overlayElement.style.visibility = 'hidden';

    // Update toggle button state
    toggleButton.setAttribute('aria-expanded', 'false');

    // Update icon
    const icon = toggleButton.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.textContent = 'menu';
    }

    // Restore body scroll
    document.body.style.overflow = '';

    // Release focus trap
    releaseFocusTrap();

    // Announce to screen readers
    announceToScreenReader('Menu closed');
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    // Show/hide toggle button based on screen size
    const display = isMobile ? 'flex' : 'none';
    toggleButton.style.display = display;

    // Close sidebar when resizing to desktop
    if (!isMobile && sidebarOpen) {
      closeSidebar();
    }
  }

  /**
   * Handle keyboard events
   */
  function handleKeyDown(event) {
    if (event.key === 'Escape' && sidebarOpen) {
      closeSidebar();
      toggleButton.focus();
    }
  }

  /**
   * Add touch gestures for swipe to open/close
   */
  function addTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe(touchStartX, touchEndX);
    }, { passive: true });
  }

  /**
   * Handle swipe gesture
   */
  function handleSwipe(startX, endX) {
    const diff = endX - startX;
    const threshold = 50;

    // Swipe right to open (from left edge)
    if (diff > threshold && startX < 30 && !sidebarOpen) {
      openSidebar();
    }

    // Swipe left to close
    if (diff < -threshold && sidebarOpen) {
      closeSidebar();
    }
  }

  /**
   * Handle sidebar link clicks - close on navigation
   */
  function handleSidebarLinks() {
    sidebarElement.addEventListener('click', (event) => {
      const target = event.target;
      const navItem = target.closest('.nav-item, a[href]');

      if (navItem && !navItem.classList.contains('nav-section-label')) {
        // Close sidebar after navigation
        setTimeout(() => {
          closeSidebar();
        }, 150);
      }
    });
  }

  /**
   * Focus trap for accessibility
   */
  let previousActiveElement = null;

  function trapFocus(element) {
    previousActiveElement = document.activeElement;
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  function releaseFocusTrap() {
    if (previousActiveElement) {
      previousActiveElement.focus();
      previousActiveElement = null;
    }
  }

  /**
   * Announce message to screen readers
   */
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Public API
   */
  window.MobileNav = {
    init,
    toggle: toggleSidebar,
    open: openSidebar,
    close: closeSidebar,
    isOpen: () => sidebarOpen
  };

  /**
   * Auto-initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Additional Responsive Utilities
 */
(function() {
  'use strict';

  /**
   * Responsive Table Handler
   * Adds data-label attributes for mobile card view
   */
  function initResponsiveTables() {
    const tables = document.querySelectorAll('.data-table');

    tables.forEach((table) => {
      const headers = Array.from(table.querySelectorAll('thead th'))
        .map((th) => th.textContent.trim());

      table.querySelectorAll('tbody tr').forEach((row) => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
          if (headers[index] && !cell.hasAttribute('data-label')) {
            cell.setAttribute('data-label', headers[index]);
          }
        });
      });

      // Add mobile-cards class on mobile
      if (window.innerWidth <= 768) {
        table.classList.add('mobile-cards');
      }
    });
  }

  /**
   * Responsive Grid Handler
   * Adjusts grid columns based on screen size
   */
  function initResponsiveGrids() {
    const grids = document.querySelectorAll('.stats-grid, .grid-2, .grid-3, .grid-4');

    grids.forEach((grid) => {
      const updateGrid = () => {
        const width = window.innerWidth;

        if (width <= 480) {
          grid.style.gridTemplateColumns = '1fr';
        } else if (width <= 768) {
          if (grid.classList.contains('grid-4') || grid.classList.contains('stats-grid')) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
          } else {
            grid.style.gridTemplateColumns = '1fr';
          }
        } else if (width <= 1024) {
          if (grid.classList.contains('grid-4') || grid.classList.contains('stats-grid')) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
          }
        } else {
          grid.style.gridTemplateColumns = '';
        }
      };

      updateGrid();
      window.addEventListener('resize', updateGrid);
    });
  }

  /**
   * Touch-friendly Button Handler
   * Adds ripple effect and touch feedback
   */
  function initTouchButtons() {
    const buttons = document.querySelectorAll('.btn, button');

    buttons.forEach((button) => {
      // Ensure minimum touch target size
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        button.style.minWidth = '44px';
        button.style.minHeight = '44px';
      }
    });
  }

  /**
   * Lazy Load Images
   * Intersection Observer for lazy loading
   */
  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Initialize all responsive utilities
   */
  function init() {
    initResponsiveTables();
    initResponsiveGrids();
    initTouchButtons();
    initLazyLoading();
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export
  window.ResponsiveUtils = {
    init,
    initResponsiveTables,
    initResponsiveGrids,
    initTouchButtons,
    initLazyLoading
  };
})();
