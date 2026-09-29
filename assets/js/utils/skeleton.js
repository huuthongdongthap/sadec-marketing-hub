/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SKELETON LOADERS — SA ĐÉC MARKETING HUB
 * Loading states cho data fetching
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

/**
 * Skeleton loader HTML templates
 */
const TEMPLATES = {
    text: `
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text skeleton-text--short"></div>
    `,
    card: `
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text skeleton-text--short"></div>
    `,
    table: `
        <div class="skeleton skeleton-table">
            ${Array(5).fill('<div class="skeleton skeleton-table-row"></div>').join('')}
        </div>
    `,
    avatar: `
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton skeleton-text"></div>
    `,
    chart: `
        <div class="skeleton skeleton-chart"></div>
    `
};

/**
 * CSS for skeleton loaders
 */
const STYLES = `
    .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
    }

    @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    .skeleton-text {
        height: 16px;
        margin-bottom: 8px;
    }

    .skeleton-text--short {
        width: 60%;
    }

    .skeleton-image {
        height: 200px;
        margin-bottom: 12px;
    }

    .skeleton-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        margin-bottom: 8px;
    }

    .skeleton-table {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .skeleton-table-row {
        height: 40px;
    }

    .skeleton-chart {
        height: 300px;
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
        .skeleton {
            background: linear-gradient(90deg, #2d2d2d 25%, #3d3d3d 50%, #2d2d2d 75%);
        }
    }
`;

/**
 * Inject skeleton styles
 */
let stylesInjected = false;
function injectStyles() {
    if (stylesInjected) return;

    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
    stylesInjected = true;
    Logger.info('[Skeleton] Styles injected');
}

/**
 * Show skeleton loader in element
 * @param {Element|string} target - Element or selector
 * @param {string} type - Template type: text, card, table, avatar, chart
 * @param {Object} options
 * @returns {Element} Skeleton container
 */
export function showSkeleton(target, type = 'text', options = {}) {
    injectStyles();

    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) {
        Logger.error('[Skeleton] Target not found');
        return null;
    }

    const { count = 1, className = '' } = options;

    el.innerHTML = `<div class="skeleton-container ${className}">${TEMPLATES[type].repeat(count)}</div>`;
    Logger.info(`[Skeleton] Showing ${type} skeleton`);

    return el;
}

/**
 * Hide skeleton loader and show content
 * @param {Element|string} target - Element or selector
 * @param {string} content - HTML content to show
 * @param {Object} options
 * @param {number} options.fadeIn - Fade in duration (ms)
 */
export function hideSkeleton(target, content, options = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    const { fadeIn = 300 } = options;

    el.style.opacity = '0';
    el.innerHTML = content;
    el.style.transition = `opacity ${fadeIn}ms ease`;

    requestAnimationFrame(() => {
        el.style.opacity = '1';
    });

    Logger.info('[Skeleton] Hidden, content shown');
}

/**
 * Wrap async function with skeleton loading
 * @param {Function} fn - Async function to run
 * @param {Element|string} target - Target element
 * @param {Object} options
 * @returns {Promise<unknown>}
 */
export async function withSkeleton(fn, target, options = {}) {
    const { type = 'text', count = 1 } = options;

    showSkeleton(target, type, { count });

    try {
        const result = await fn();
        return result;
    } finally {
        // Skeleton will be hidden by caller
    }
}

/**
 * Create skeleton card for list items
 * @param {number} count - Number of cards
 * @returns {string} HTML
 */
export function createCardSkeletons(count = 3) {
    injectStyles();
    return TEMPLATES.card.repeat(count);
}

/**
 * Create skeleton table rows
 * @param {number} rows - Number of rows
 * @returns {string} HTML
 */
export function createTableSkeleton(rows = 5) {
    injectStyles();
    return `<div class="skeleton skeleton-table">
        ${Array(rows).fill('<div class="skeleton skeleton-table-row"></div>').join('')}
    </div>`;
}
