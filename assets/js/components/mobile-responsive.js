/**
 * Mobile Responsive Enhancements
 * Cải thiện trải nghiệm mobile cho sadec-marketing-hub
 *
 * Features:
 * - Mobile menu drawer
 * - Touch-optimized interactions
 * - Responsive tables
 * - Bottom navigation for mobile
 * - Pull-to-refresh
 */

class MobileEnhancements {
  constructor() {
    this.breakpoint = 768;
    this.isMobile = window.innerWidth < this.breakpoint;
    this.init();
  }

  init() {
    this.setupResponsiveTables();
    this.setupTouchOptimizations();
    this.setupBottomNavigation();
    this.setupPullToRefresh();
    this.setupMobileGestures();

    // Listen for resize
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < this.breakpoint;

      if (wasMobile !== this.isMobile) {
        this.onBreakpointChange();
      }
    });
  }

  onBreakpointChange() {
    if (this.isMobile) {
      document.body.classList.add('mobile-view');
      document.body.classList.remove('desktop-view');
    } else {
      document.body.classList.add('desktop-view');
      document.body.classList.remove('mobile-view');
    }
  }

  /**
   * Responsive Tables - Convert to cards on mobile
   */
  setupResponsiveTables() {
    const tables = document.querySelectorAll('table[data-responsive="true"]');

    tables.forEach(table => {
      if (this.isMobile) {
        this.convertTableToCards(table);
      }
    });

    // Re-check on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth < this.breakpoint) {
        tables.forEach(table => this.convertTableToCards(table));
      } else {
        tables.forEach(table => this.revertCardsToTable(table));
      }
    });
  }

  convertTableToCards(table) {
    if (table.dataset.converted === 'true') return;

    const headers = [];
    const headerRow = table.querySelector('thead tr');

    if (headerRow) {
      headerRow.querySelectorAll('th').forEach(th => {
        headers.push(th.textContent.trim());
      });
    }

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'table-cards-container';

    rows.forEach(row => {
      const card = document.createElement('div');
      card.className = 'table-card';

      const cells = row.querySelectorAll('td, th');
      cells.forEach((cell, index) => {
        if (headers[index]) {
          const field = document.createElement('div');
          field.className = 'table-card-field';
          field.innerHTML = `
            <span class="table-card-label">${headers[index]}</span>
            <span class="table-card-value">${cell.innerHTML}</span>
          `;
          card.appendChild(field);
        }
      });

      cardsContainer.appendChild(card);
    });

    table.style.display = 'none';
    table.parentNode.insertBefore(cardsContainer, table.nextSibling);
    table.dataset.converted = 'true';
  }

  revertCardsToTable(table) {
    if (table.dataset.converted !== 'true') return;

    const cardsContainer = table.parentNode.querySelector('.table-cards-container');
    if (cardsContainer) {
      cardsContainer.remove();
      table.style.display = '';
      table.dataset.converted = 'false';
    }
  }

  /**
   * Touch Optimizations
   */
  setupTouchOptimizations() {
    if (!('ontouchstart' in window)) return;

    // Add touch-friendly hover states
    document.querySelectorAll('[data-touch-hover="true"]').forEach(el => {
      el.addEventListener('touchstart', () => {
        el.classList.add('touch-hover');
      });

      el.addEventListener('touchend', () => {
        setTimeout(() => el.classList.remove('touch-hover'), 300);
      });
    });

    // Prevent double-tap zoom
    document.addEventListener('dblclick', (e) => {
      e.preventDefault();
    }, { passive: false });

    // Add touch ripple effect to buttons
    this.setupRippleEffect();
  }

  setupRippleEffect() {
    document.querySelectorAll('button, .btn, [role="button"]').forEach(button => {
      button.addEventListener('touchstart', (e) => {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.touches[0].clientX - rect.left - size / 2;
        const y = e.touches[0].clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  /**
   * Bottom Navigation for Mobile
   */
  setupBottomNavigation() {
    if (!this.isMobile) return;

    // Check if bottom nav already exists
    if (document.querySelector('.bottom-nav')) return;

    // Create bottom nav from sidebar or header navigation
    const sidebar = document.querySelector('.sidebar, .side-nav');
    const navItems = sidebar?.querySelectorAll('a[href]:not([href="#"])') || [];

    if (navItems.length === 0) return;

    const bottomNav = document.createElement('nav');
    bottomNav.className = 'bottom-nav';

    // Get top 5 most important nav items
    const priorityItems = Array.from(navItems).slice(0, 5);

    priorityItems.forEach(item => {
      const navItem = document.createElement('a');
      navItem.href = item.href;
      navItem.className = 'bottom-nav-item';

      // Copy icon if exists
      const icon = item.querySelector('.material-symbols-outlined');
      if (icon) {
        navItem.innerHTML = `
          <span class="material-symbols-outlined">${icon.textContent}</span>
          <span>${item.textContent.trim()}</span>
        `;
      } else {
        navItem.innerHTML = `
          <span class="material-symbols-outlined">label</span>
          <span>${item.textContent.trim()}</span>
        `;
      }

      bottomNav.appendChild(navItem);
    });

    document.body.appendChild(bottomNav);
  }

  /**
   * Pull to Refresh
   */
  setupPullToRefresh() {
    if (!this.isMobile) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    const threshold = 100;

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0 && diff < threshold * 2) {
        e.preventDefault();
        this.showPullIndicator(diff);
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      if (!isPulling) return;

      const diff = currentY - startY;
      isPulling = false;

      if (diff > threshold) {
        this.triggerRefresh();
      }

      this.hidePullIndicator();
      currentY = 0;
    });
  }

  showPullIndicator(progress) {
    let indicator = document.getElementById('pull-indicator');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'pull-indicator';
      indicator.innerHTML = '<span class="material-symbols-outlined">refresh</span>';
      document.body.prepend(indicator);
    }

    indicator.style.opacity = Math.min(progress / 100, 1);
    indicator.style.transform = `translateY(${Math.min(progress, 80)}px)`;
  }

  hidePullIndicator() {
    const indicator = document.getElementById('pull-indicator');
    if (indicator) {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateY(-100%)';
    }
  }

  async triggerRefresh() {
    // Show loading state
    this.showPullIndicator(100);

    // Dispatch custom event for pages to listen
    const event = new CustomEvent('pull-to-refresh', {
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(event);

    // Hide indicator after refresh
    setTimeout(() => this.hidePullIndicator(), 1000);
  }

  /**
   * Mobile Gestures
   */
  setupMobileGestures() {
    if (!this.isMobile) return;

    // Swipe gestures for drawers/modals
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    }, { passive: true });
  }

  handleSwipe(startX, endX) {
    const diff = startX - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left
        document.dispatchEvent(new CustomEvent('swipe-left', {
          bubbles: true,
          composed: true,
          detail: { distance: diff }
        }));
      } else {
        // Swipe right
        document.dispatchEvent(new CustomEvent('swipe-right', {
          bubbles: true,
          composed: true,
          detail: { distance: Math.abs(diff) }
        }));
      }
    }
  }
}

// Add responsive styles
const style = document.createElement('style');
style.textContent = `
  /* Table Cards for Mobile */
  .table-cards-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .table-card {
    background: var(--md-sys-color-surface, #fff);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .table-card-field {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
  }

  .table-card-field:last-child {
    border-bottom: none;
  }

  .table-card-label {
    font-size: 12px;
    color: var(--md-sys-color-on-surface-variant, #666);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .table-card-value {
    font-size: 14px;
    color: var(--md-sys-color-on-surface, #333);
    font-weight: 500;
  }

  /* Bottom Navigation */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: var(--md-sys-color-surface, #fff);
    border-top: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 1000;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    text-decoration: none;
    color: var(--md-sys-color-on-surface-variant, #666);
    font-size: 12px;
    transition: color 0.2s;
  }

  .bottom-nav-item.active {
    color: var(--md-sys-color-primary, #006A60);
  }

  .bottom-nav-item .material-symbols-outlined {
    font-size: 24px;
  }

  /* Pull Indicator */
  #pull-indicator {
    position: fixed;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: var(--md-sys-color-primary, #006A60);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: all 0.3s;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  /* Ripple Effect */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* Touch hover state */
  [data-touch-hover="true"].touch-hover {
    background: var(--md-sys-color-state-layer, rgba(0,0,0,0.08));
  }

  /* Mobile view body class */
  body.mobile-view {
    padding-bottom: 64px; /* Space for bottom nav */
  }

  /* Hide bottom nav on desktop */
  @media (min-width: 769px) {
    .bottom-nav {
      display: none;
    }
  }
`;
document.head.appendChild(style);

// Initialize
const MobileUI = new MobileEnhancements();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MobileUI, MobileEnhancements };
}
