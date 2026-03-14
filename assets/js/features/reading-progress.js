/**
 * ═══════════════════════════════════════════════════════════════════════════
 * READING PROGRESS BAR — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Scroll progress indicator at top of page
 * - Smooth animation
 * - Color customization via CSS variables
 * - Auto-hide on scroll to top
 *
 * Usage:
 *   import { initReadingProgress } from './reading-progress.js';
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ReadingProgress = {
    progressBar: null,
    currentProgress: 0,

    /**
     * Initialize reading progress bar
     */
    init() {
        this.createProgressBar();
        this.bindScroll();
    },

    /**
     * Create progress bar element
     */
    createProgressBar() {
        if (document.getElementById('reading-progress')) return;

        this.progressBar = document.createElement('div');
        this.progressBar.id = 'reading-progress';
        this.progressBar.className = 'reading-progress-bar';
        this.progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        document.body.prepend(this.progressBar);
    },

    /**
     * Bind scroll event
     */
    bindScroll() {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

            this.currentProgress = progress;
            this.update(progress);
            this.toggleVisibility(scrollTop);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Initial check
    },

    /**
     * Update progress bar width
     * @param {number} progress - Progress percentage (0-100)
     */
    update(progress) {
        if (!this.progressBar) return;
        const fill = this.progressBar.querySelector('.reading-progress-fill');
        if (fill) {
            fill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    },

    /**
     * Toggle visibility based on scroll position
     * @param {number} scrollTop - Current scroll position
     */
    toggleVisibility(scrollTop) {
        if (!this.progressBar) return;

        if (scrollTop < 100) {
            this.progressBar.classList.add('hidden');
        } else {
            this.progressBar.classList.remove('hidden');
        }
    },

    /**
     * Reset progress bar
     */
    reset() {
        this.update(0);
    },

    /**
     * Get current progress
     * @returns {number} Current progress percentage
     */
    getProgress() {
        return this.currentProgress;
    }
};

// Auto-init on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ReadingProgress.init());
} else {
    ReadingProgress.init();
}

// Export for manual usage
export { ReadingProgress };
