/**
 * ═══════════════════════════════════════════════════════════════════════════
 * READING PROGRESS — SA ĐÉC MARKETING HUB
 * Thanh tiến độ đọc bài ở top trang
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

/**
 * Reading progress bar element
 */
let progressBar = null;

/**
 * Create progress bar element
 */
function createProgressBar() {
    if (progressBar) return;

    progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    progressBar.innerHTML = '<div class="reading-progress-fill"></div>';

    const style = document.createElement('style');
    style.textContent = `
        .reading-progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(0,0,0,0.1);
            z-index: 10001;
        }
        .reading-progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #4caf50, #8bc34a);
            transition: width 0.1s ease;
        }
        @media (prefers-color-scheme: dark) {
            .reading-progress-bar {
                background: rgba(255,255,255,0.1);
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(progressBar);

    Logger.info('[ReadingProgress] Progress bar created');
}

/**
 * Update progress based on scroll position
 */
function updateProgress() {
    if (!progressBar) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    const fill = progressBar.querySelector('.reading-progress-fill');
    if (fill) {
        fill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
}

/**
 * Initialize reading progress
 * @param {Object} options
 * @param {boolean} options.autoHide - Hide when at bottom
 * @param {string} options.color - Progress bar color
 */
export function init(options = {}) {
    const { autoHide = true, color } = options;

    if (typeof window === 'undefined') return;

    createProgressBar();

    // Custom color
    if (color) {
        const fill = progressBar.querySelector('.reading-progress-fill');
        if (fill) {
            fill.style.background = color;
        }
    }

    // Scroll listener
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateProgress();

                // Auto-hide at bottom
                if (autoHide) {
                    const scrollTop = window.scrollY;
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const atBottom = scrollTop >= docHeight - 50;

                    if (progressBar) {
                        progressBar.style.opacity = atBottom ? '0' : '1';
                    }
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    Logger.info('[ReadingProgress] Initialized');
}

/**
 * Destroy reading progress
 */
export function destroy() {
    if (progressBar) {
        progressBar.remove();
        progressBar = null;
    }
    Logger.info('[ReadingProgress] Destroyed');
}

/**
 * Get current progress percentage
 * @returns {number}
 */
export function getProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
}

// Auto-init on DOM ready
if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
} else {
    init();
}
