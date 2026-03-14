/**
 * UI Enhancements JavaScript - Sa Đéc Marketing Hub
 * Scroll animations, micro-interactions, loading states
 * @version 1.0.0 | 2026-03-13
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const CONFIG = {
    scrollThreshold: 100,
    intersectionThreshold: 0.1,
    animationDelay: 100,
    debounceDelay: 150
  };

  // ============================================================================
  // SCROLL REVEAL ANIMATIONS
  // ============================================================================

  /**
   * Initialize scroll reveal animations using Intersection Observer
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-from-left, .reveal-from-right, .reveal-scale');

    if (revealElements.length === 0) return;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay based on index
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, index * CONFIG.animationDelay);

          // Unobserve after revealing
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.intersectionThreshold,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ============================================================================
  // BUTTON RIPPLE EFFECT
  // ============================================================================

  /**
   * Add ripple effect to buttons on click
   */
  function initButtonRipple() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.style.setProperty('--ripple-x', `${x}px`);
        this.style.setProperty('--ripple-y', `${y}px`);
      });
    });
  }

  // ============================================================================
  // NAVIGATION INTERACTIONS
  // ============================================================================

  /**
   * Mobile menu toggle with animation
   */
  function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const icon = toggle?.querySelector('.material-symbols-outlined');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');

      // Animate icon
      if (icon) {
        icon.textContent = navLinks.classList.contains('active') ? 'close' : 'menu';
        icon.style.transform = 'rotate(180deg)';
        setTimeout(() => {
          icon.style.transform = '';
        }, 300);
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        if (icon) icon.textContent = 'menu';
      }
    });
  }

  /**
   * Active nav link on scroll
   */
  function initActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-100px 0px -50% 0px'
    });

    sections.forEach(section => navObserver.observe(section));
  }

  // ============================================================================
  // LOADING STATE UTILITIES
  // ============================================================================

  /**
   * Set button loading state
   * @param {HTMLElement} button - The button element
   * @param {boolean} isLoading - Loading state
   */
  window.setButtonLoading = function(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.classList.add('is-loading');
      button.disabled = true;
      const textSpan = button.querySelector('.btn-text');
      if (textSpan) textSpan.style.opacity = '0';
    } else {
      button.classList.remove('is-loading');
      button.disabled = false;
      const textSpan = button.querySelector('.btn-text');
      if (textSpan) textSpan.style.opacity = '1';
    }
  };

  /**
   * Show page loading overlay
   */
  window.showPageLoading = function() {
    let overlay = document.querySelector('.page-loading-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-loading-overlay';
      overlay.innerHTML = `
        <div class="spinner-with-trail"></div>
      `;
      document.body.appendChild(overlay);
    }

    overlay.classList.remove('loaded');
    document.body.classList.add('cursor-loading');
  };

  /**
   * Hide page loading overlay
   */
  window.hidePageLoading = function() {
    const overlay = document.querySelector('.page-loading-overlay');
    if (overlay) {
      overlay.classList.add('loaded');
      setTimeout(() => overlay.remove(), 500);
    }
    document.body.classList.remove('cursor-loading');
  };

  // ============================================================================
  // TOAST NOTIFICATIONS
  // ============================================================================

  /**
   * Show enhanced toast notification
   * @param {string} message - Toast message
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in ms (default: 3000)
   */
  window.showToast = function(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast-enhanced ${type}`;

    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    toast.innerHTML = `
      <span class="material-symbols-outlined toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);

    // Trigger show animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto hide
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ============================================================================
  // MODAL UTILITIES
  // ============================================================================

  /**
   * Show modal with animation
   * @param {string} modalId - Modal element ID
   */
  window.showModal = function(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = modal?.querySelector('.modal-backdrop-enhanced');
    const content = modal?.querySelector('.modal-content-enhanced');

    if (!modal) return;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    if (backdrop) {
      backdrop.classList.add('visible');
    }
    if (content) {
      setTimeout(() => content.classList.add('visible'), 10);
    }
  };

  /**
   * Hide modal with animation
   * @param {string} modalId - Modal element ID
   */
  window.hideModal = function(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = modal?.querySelector('.modal-backdrop-enhanced');
    const content = modal?.querySelector('.modal-content-enhanced');

    if (!modal) return;

    if (content) {
      content.classList.remove('visible');
    }
    if (backdrop) {
      backdrop.classList.remove('visible');
    }

    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  };

  // ============================================================================
  // COUNTER ANIMATION
  // ============================================================================

  /**
   * Animate counter from 0 to target value
   * @param {HTMLElement} element - Element to animate
   * @param {number} target - Target value
   * @param {number} duration - Duration in ms
   */
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, 16);
  }

  /**
   * Initialize counter animations for stats
   */
  function initCounterAnimations() {
    const statValues = document.querySelectorAll('.hero-stat-value, .stat-value');

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.hasAttribute('data-animated')) {
          const target = parseInt(entry.target.getAttribute('data-target'));
          if (target) {
            entry.target.setAttribute('data-animated', 'true');
            animateCounter(entry.target, target);
            entry.target.classList.add('counting-up');
          }
        }
      });
    }, {
      threshold: 0.5
    });

    statValues.forEach(stat => counterObserver.observe(stat));
  }

  // ============================================================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================================================

  /**
   * Initialize smooth scroll for anchor links
   */
  function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL without scroll jump
        history.pushState(null, null, href);
      });
    });
  }

  // ============================================================================
  // PARALLAX EFFECT (Optional)
  // ============================================================================

  /**
   * Apply subtle parallax to hero elements
   */
  function initParallax() {
    const hero = document.querySelector('.cyber-hero');
    const heroContent = hero?.querySelector('.hero-content');

    if (!hero || !heroContent) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const parallaxSpeed = 0.3;

          if (scrolled < hero.offsetHeight) {
            heroContent.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
          }

          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ============================================================================
  // ACCESSIBILITY UTILITIES
  // ============================================================================

  /**
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Handle keyboard navigation for modals
   */
  function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Close modal on Escape
      if (e.key === 'Escape') {
        const openModal = document.querySelector('[style*="display: block"]');
        if (openModal) {
          hideModal(openModal.id);
        }
      }
    });
  }

  // ============================================================================
  // DEBOUNCE UTILITY
  // ============================================================================
  // Note: Using centralized debounce from assets/js/utils/function.js
  // This duplicate has been removed to avoid code duplication

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize all UI enhancements
   */
  function initAll() {
    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion()) {
      return;
    }

    initScrollReveal();
    initButtonRipple();
    initMobileMenu();
    initActiveNavHighlight();
    initCounterAnimations();
    initSmoothScroll();
    initKeyboardNavigation();

    // Optional enhancements
    // initParallax();

  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Handle lazy load for below-fold content
  window.addEventListener('load', () => {
    // Hide page loading overlay if exists
    hidePageLoading();
  });

})();
