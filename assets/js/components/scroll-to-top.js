/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — SCROLL TO TOP COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Nút cuộn lên đầu trang với animations
 *
 * Features:
 * - Show khi scroll > 300px
 * - Smooth scroll animation
 * - Pulse animation khi xuất hiện
 * - Hover effects
 * - Keyboard shortcut (Ctrl/Cmd + Home)
 * - Progress ring indicator
 * - Auto-hide khi lên đến top
 *
 * Usage:
 *   HTML: <button class="mekong-scroll-top" aria-label="Cuộn lên đầu trang"></button>
 *   JS:   ScrollToTop.show()
 *         ScrollToTop.hide()
 *         ScrollToTop.scrollTo()
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class ScrollToTopManager {
  constructor() {
    this.button = null;
    this.progressRing = null;
    this.isVisible = false;
    this.scrollThreshold = 300;
    this.scrollDuration = 600; // ms
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.createButton();
      this.bindEvents();
    });
  }

  /**
   * Tạo button element
   */
  createButton() {
    // Check nếu đã tồn tại
    if (document.querySelector('.mekong-scroll-top')) return;

    const button = document.createElement('button');
    button.className = 'mekong-scroll-top';
    button.setAttribute('aria-label', 'Cuộn lên đầu trang');
    button.setAttribute('aria-hidden', 'true');
    button.innerHTML = `
      <svg class="mekong-scroll-top__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
      <svg class="mekong-scroll-top__progress" viewBox="0 0 36 36">
        <circle class="mekong-scroll-top__progress-bg" cx="18" cy="18" r="16"/>
        <circle class="mekong-scroll-top__progress-ring" cx="18" cy="18" r="16"/>
      </svg>
    `;

    document.body.appendChild(button);
    this.button = button;
    this.progressRing = button.querySelector('.mekong-scroll-top__progress-ring');

    // Add styles nếu chưa tồn tại
    if (!document.getElementById('scroll-top-styles')) {
      this.addStyles();
    }
  }

  /**
   * Add CSS styles
   */
  addStyles() {
    const style = document.createElement('style');
    style.id = 'scroll-top-styles';
    style.textContent = `
      .mekong-scroll-top {
        /* Position */
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9998;

        /* Size */
        width: 48px;
        height: 48px;

        /* Appearance */
        border: none;
        border-radius: 50%;
        background: var(--md-sys-color-primary, #006A60);
        color: var(--md-sys-color-on-primary, #fff);
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0, 106, 96, 0.3);

        /* Animation */
        opacity: 0;
        visibility: hidden;
        transform: scale(0.8) translateY(20px);
        transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background-color 0.2s ease;

        /* Layout */
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }

      .mekong-scroll-top--visible {
        opacity: 1;
        visibility: visible;
        transform: scale(1) translateY(0);
      }

      .mekong-scroll-top:hover {
        background: var(--md-sys-color-primary-container, #008a7d);
        transform: scale(1.05) translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 106, 96, 0.4);
      }

      .mekong-scroll-top:active {
        transform: scale(0.95);
      }

      .mekong-scroll-top:focus-visible {
        outline: 2px solid var(--md-sys-color-primary, #006A60);
        outline-offset: 2px;
      }

      /* Icon */
      .mekong-scroll-top__icon {
        width: 24px;
        height: 24px;
        transition: transform 0.2s ease;
      }

      .mekong-scroll-top:hover .mekong-scroll-top__icon {
        transform: translateY(-2px);
      }

      /* Progress ring */
      .mekong-scroll-top__progress {
        position: absolute;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .mekong-scroll-top__progress-bg {
        fill: none;
        stroke: rgba(255, 255, 255, 0.2);
        stroke-width: 2;
      }

      .mekong-scroll-top__progress-ring {
        fill: none;
        stroke: var(--md-sys-color-on-primary, #fff);
        stroke-width: 2;
        stroke-linecap: round;
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        transition: stroke-dashoffset 0.1s ease;
      }

      /* Pulse animation */
      @keyframes scroll-top-pulse {
        0%, 100% {
          box-shadow: 0 4px 16px rgba(0, 106, 96, 0.3);
        }
        50% {
          box-shadow: 0 4px 24px rgba(0, 106, 96, 0.5), 0 0 0 8px rgba(0, 106, 96, 0.1);
        }
      }

      .mekong-scroll-top--pulse {
        animation: scroll-top-pulse 1.5s ease-in-out;
      }

      /* Dark mode */
      [data-theme="dark"] .mekong-scroll-top {
        background: var(--md-sys-color-primary-fixed, #4ADDC8);
        color: var(--md-sys-color-on-primary-fixed, #003731);
        box-shadow: 0 4px 16px rgba(74, 221, 208, 0.3);
      }

      [data-theme="dark"] .mekong-scroll-top:hover {
        background: var(--md-sys-color-primary-fixed-dim, #3ad1bc);
      }

      [data-theme="dark"] .mekong-scroll-top:focus-visible {
        outline-color: var(--md-sys-color-primary-fixed, #4ADDC8);
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .mekong-scroll-top,
        .mekong-scroll-top__icon,
        .mekong-scroll-top__progress-ring {
          transition: none;
        }

        @keyframes scroll-top-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      }

      /* Mobile */
      @media (max-width: 768px) {
        .mekong-scroll-top {
          bottom: 16px;
          right: 16px;
          width: 44px;
          height: 44px;
        }

        .mekong-scroll-top__icon {
          width: 20px;
          height: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Bind scroll và resize events
   */
  bindEvents() {
    // Scroll handler
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Click handler
    this.button?.addEventListener('click', () => {
      this.scrollTo();
    });

    // Keyboard shortcut (Ctrl/Cmd + Home)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
        e.preventDefault();
        this.scrollTo();
      }
    });

    // Touch support
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (diff > 100) {
        // Swipe up - show button
        this.show();
      } else if (diff < -100) {
        // Swipe down - could hide or scroll up
        if (this.isVisible) {
          this.scrollTo();
        }
      }
    }, { passive: true });
  }

  /**
   * Handle scroll event
   */
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    // Show/hide
    if (scrollTop > this.scrollThreshold) {
      this.show();
    } else {
      this.hide();
    }

    // Update progress ring
    this.updateProgress(scrollPercent);
  }

  /**
   * Update progress ring
   */
  updateProgress(percent) {
    if (!this.progressRing) return;

    const offset = 100 - (percent * 100);
    this.progressRing.style.strokeDashoffset = offset.toFixed(1);
  }

  /**
   * Show button
   */
  show() {
    if (this.isVisible) return;

    this.isVisible = true;
    this.button?.classList.add('mekong-scroll-top--visible');
    this.button?.setAttribute('aria-hidden', 'false');

    // Pulse animation
    this.button?.classList.add('mekong-scroll-top--pulse');
    setTimeout(() => {
      this.button?.classList.remove('mekong-scroll-top--pulse');
    }, 1500);
  }

  /**
   * Hide button
   */
  hide() {
    if (!this.isVisible) return;

    this.isVisible = false;
    this.button?.classList.remove('mekong-scroll-top--visible');
    this.button?.setAttribute('aria-hidden', 'true');
  }

  /**
   * Scroll to top với smooth animation
   */
  scrollTo(options = {}) {
    const {
      duration = this.scrollDuration,
      easing = 'easeInOutCubic',
      callback
    } = options;

    const startPos = window.pageYOffset;
    const distance = -startPos;
    let startTime = null;

    // Easing functions
    const easingFunctions = {
      linear: (t) => t,
      easeInQuad: (t) => t * t,
      easeOutQuad: (t) => t * (2 - t),
      easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    };

    const ease = easingFunctions[easing] || easingFunctions.easeInOutCubic;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easeVal = ease(progress);

      window.scrollTo(0, startPos + distance * easeVal);

      if (timeElapsed < duration) {
        requestAnimationFrame(animate);
      } else if (callback) {
        callback();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Set scroll threshold
   */
  setThreshold(px) {
    this.scrollThreshold = px;
  }

  /**
   * Destroy component
   */
  destroy() {
    this.button?.remove();
    this.button = null;
    this.progressRing = null;
    this.isVisible = false;
  }
}

/**
 * Global instance
 */
const ScrollToTop = new ScrollToTopManager();

// Export
window.ScrollToTop = ScrollToTop;
window.ScrollToTopManager = ScrollToTopManager;

export { ScrollToTop, ScrollToTopManager };
export default ScrollToTop;
