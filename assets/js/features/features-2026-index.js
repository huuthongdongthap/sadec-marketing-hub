/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FEATURES 2026 — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Export tất cả features mới năm 2026
 */

// Reading Progress Bar
import './reading-progress.js';

// Back to Top Button
import './back-to-top.js';

// Help Tour
import './help-tour.js';

// Export global API
window.SadecFeatures2026 = {
    ReadingProgress: window.ReadingProgress,
    BackToTop: window.BackToTop,
    HelpTour: window.HelpTour
};

console.log('[Features 2026] Loaded - Reading Progress, Back to Top, Help Tour');
