/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BACK TO TOP — SA ĐÉC MARKETING HUB
 * Nút cuộn lên đầu trang
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

/**
 * Back to top button element
 */
let button = null;
let isVisible = false;

/**
 * Create back to top button
 */
function createButton() {
    if (button) return;

    button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerHTML = `
        <span class="material-symbols-outlined">keyboard_arrow_up</span>
        <span class="sr-only">Lên đầu trang</span>
    `;
    button.setAttribute('aria-label', 'Lên đầu trang');
    button.setAttribute('title', 'Lên đầu trang (Ctrl+Home)');

    const style = document.createElement('style');
    style.textContent = `
        .back-to-top {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #4caf50;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }
        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .back-to-top:hover {
            background: #43a047;
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
        }
        .back-to-top:active {
            transform: translateY(0) scale(0.95);
        }
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
        }
        @media (prefers-color-scheme: dark) {
            .back-to-top {
                background: #66bb6a;
            }
            .back-to-top:hover {
                background: #81c784;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(button);

    // Click handler
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        Logger.info('[BackToTop] Scrolled to top');
    });

    Logger.info('[BackToTop] Button created');
}

/**
 * Toggle button visibility based on scroll
 */
function toggleVisibility() {
    const scrollTop = window.scrollY;
    const shouldBeVisible = scrollTop > 300;

    if (shouldBeVisible !== isVisible && button) {
        isVisible = shouldBeVisible;
        button.classList.toggle('visible', shouldBeVisible);
    }
}

/**
 * Initialize back to top
 */
export function init() {
    if (typeof window === 'undefined') return;

    createButton();

    // Scroll listener with RAF
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                toggleVisibility();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Keyboard shortcut (Ctrl+Home)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    Logger.info('[BackToTop] Initialized');
}

/**
 * Destroy back to top
 */
export function destroy() {
    if (button) {
        button.remove();
        button = null;
        isVisible = false;
    }
    Logger.info('[BackToTop] Destroyed');
}

/**
 * Show button programmatically
 */
export function show() {
    if (button) {
        button.classList.add('visible');
        isVisible = true;
    }
}

/**
 * Hide button programmatically
 */
export function hide() {
    if (button) {
        button.classList.remove('visible');
        isVisible = false;
    }
}

// Auto-init on DOM ready
if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
