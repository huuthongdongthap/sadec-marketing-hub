/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — UI ENHANCEMENTS 2026
 * Micro-animations, loading states, hover effects JavaScript
 *
 * Features:
 * - Scroll reveal animations (IntersectionObserver)
 * - Ripple effect on button click
 * - Page transition animations
 * - Loading state utilities
 *
 * Usage:
 *   import { initUIEnhancements } from './ui-enhancements-2026.js';
 *   initUIEnhancements();
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from './shared/logger.js';

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
        // Fallback: show all elements immediately
        document.querySelectorAll('.ui-scroll-reveal').forEach(el => {
            el.classList.add('ui-visible');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('ui-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.ui-scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// RIPPLE EFFECT
// ═══════════════════════════════════════════════════════════════════════════

function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ui-ripple');

    const ripple = button.querySelector('.ui-ripple');
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);

    // Cleanup after animation
    setTimeout(() => {
        circle.remove();
    }, 600);
}

function initRippleEffect() {
    document.querySelectorAll('.btn-ui-ripple').forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE TRANSITION
// ═══════════════════════════════════════════════════════════════════════════

function initPageTransition() {
    // Add page transition class to body on load
    document.body.classList.add('ui-page-transition-up');

    // Remove class after animation completes
    setTimeout(() => {
        document.body.classList.remove('ui-page-transition-up');
    }, 700);

    // Intercept internal links for smooth transition
    document.querySelectorAll('a[href^="/"]:not([target="_blank"]):not([download])').forEach(link => {
        link.addEventListener('click', (e) => {
            // Only handle regular navigation (not ctrl/cmd+click)
            if (!e.ctrlKey && !e.metaKey) {
                document.body.style.opacity = '0.7';
                setTimeout(() => {
                    document.body.style.opacity = '1';
                    document.body.style.transition = 'opacity 0.3s';
                }, 50);
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING STATE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function showLoading(container) {
    if (!container) {
        // Show full page overlay
        const overlay = document.createElement('div');
        overlay.className = 'ui-loading-overlay';
        overlay.innerHTML = `
            <div class="ui-loading-content">
                <div class="ui-spinner ui-spinner-lg"></div>
                <p style="margin-top: 16px; color: #666;">Đang tải...</p>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    // Show loading inside container
    container.innerHTML = `
        <div class="ui-spinner-center" style="height: 200px;">
            <div class="ui-spinner"></div>
        </div>
    `;
    return container;
}

function hideLoading(overlay) {
    if (overlay && overlay.parentNode) {
        overlay.remove();
    }
}

function showSkeleton(container, type = 'card', count = 3) {
    if (!container) return;

    const skeletonMap = {
        'text': 'ui-skeleton-text',
        'title': 'ui-skeleton-title',
        'avatar': 'ui-skeleton-avatar',
        'card': 'ui-skeleton-card',
        'image': 'ui-skeleton-image'
    };

    const className = skeletonMap[type] || 'ui-skeleton-text';

    container.innerHTML = Array(count).fill(0).map(() => `
        <div class="${className}" style="margin-bottom: 12px;"></div>
    `).join('');
}

function replaceSkeletonWithContent(container, content) {
    if (!container) return;
    container.innerHTML = content;
    container.style.opacity = '0';
    requestAnimationFrame(() => {
        container.style.transition = 'opacity 0.3s';
        container.style.opacity = '1';
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

function showToast(message, options = {}) {
    const {
        type = 'info',
        duration = 3000,
        position = 'top-right'
    } = options;

    const toast = document.createElement('div');
    toast.className = `ui-toast ui-toast-enter ui-toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: ${position.includes('top') ? '20px' : 'auto'};
        bottom: ${position.includes('bottom') ? '20px' : 'auto'};
        right: ${position.includes('right') ? '20px' : 'auto'};
        left: ${position.includes('left') ? '20px' : 'auto'};
        min-width: 280px;
        max-width: 400px;
        padding: 16px 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
    `;

    const icons = {
        'success': '✓',
        'error': '✕',
        'warning': '⚠',
        'info': 'ℹ'
    };

    const colors = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196f3'
    };

    toast.innerHTML = `
        <span style="font-size: 20px; color: ${colors[type]};">${icons[type]}</span>
        <span style="flex: 1;">${message}</span>
    `;

    document.body.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('ui-toast-enter');
        toast.classList.add('ui-toast-exit');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);

    return toast;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS BAR UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function createProgress(container, value = 0) {
    if (!container) return null;

    container.innerHTML = `
        <div class="ui-progress">
            <div class="ui-progress-bar" style="width: ${value}%"></div>
        </div>
    `;

    return container.querySelector('.ui-progress-bar');
}

function updateProgress(bar, value) {
    if (!bar) return;
    bar.style.width = `${value}%`;
}

function setIndeterminateProgress(bar) {
    if (!bar) return;
    bar.classList.add('ui-progress-indeterminate');
}

function setDeterminateProgress(bar) {
    if (!bar) return;
    bar.classList.remove('ui-progress-indeterminate');
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION TRIGGER HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function triggerAnimation(element, animationClass) {
    if (!element) return;

    // Remove class if exists
    element.classList.remove(animationClass);

    // Force reflow
    void element.offsetWidth;

    // Add class to trigger animation
    element.classList.add(animationClass);

    // Cleanup after animation
    const duration = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--ui-duration-normal')) || 300;

    setTimeout(() => {
        element.classList.remove(animationClass);
    }, duration);
}

function shakeElement(element) {
    triggerAnimation(element, 'ui-animate-shake');
}

function pulseElement(element) {
    element.classList.add('ui-animate-pulse');
}

function stopPulse(element) {
    element.classList.remove('ui-animate-pulse');
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function initUIEnhancements() {
    Logger.log('[UI Enhancements] Initializing...');

    // Initialize scroll reveal
    initScrollReveal();

    // Initialize ripple effect
    initRippleEffect();

    // Initialize page transitions
    initPageTransition();

    // Expose utilities globally
    window.UIEnhancements = {
        showLoading,
        hideLoading,
        showSkeleton,
        replaceSkeletonWithContent,
        showToast,
        createProgress,
        updateProgress,
        setIndeterminateProgress,
        setDeterminateProgress,
        shakeElement,
        pulseElement,
        stopPulse,
        triggerAnimation
    };

    Logger.log('[UI Enhancements] Ready');
}

// Auto-initialize on DOMContentLoaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUIEnhancements);
    } else {
        initUIEnhancements();
    }
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initUIEnhancements,
        initScrollReveal,
        initRippleEffect,
        initPageTransition,
        showLoading,
        hideLoading,
        showSkeleton,
        replaceSkeletonWithContent,
        showToast,
        createProgress,
        updateProgress,
        shakeElement,
        pulseElement
    };
}
