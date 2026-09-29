/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HELP TOUR — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Interactive product tour
 * - Step-by-step guidance
 * - Highlight elements
 * - Keyboard navigation
 * - Persist tour completion
 *
 * Usage:
 *   import { startTour, restartTour } from './help-tour.js';
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HelpTour = {
    steps: [],
    currentStep: 0,
    overlay: null,
    tooltip: null,
    isTourRunning: false,

    /**
     * Default tour steps
     */
    defaultSteps: [
        {
            target: '.admin-menu, #admin-menu',
            title: 'Menu Điều Hướng',
            content: 'Truy cập các tính năng chính từ menu bên trái',
            position: 'right'
        },
        {
            target: '.header, header, .admin-header',
            title: 'Thanh Công Cụ',
            content: 'Tìm kiếm, thông báo và cài đặt tài khoản',
            position: 'bottom'
        },
        {
            target: '.dashboard-content, main, [role="main"]',
            title: 'Khu Vực Làm Việc',
            content: 'Nội dung chính và các widget hiển thị dữ liệu',
            position: 'top'
        }
    ],

    /**
     * Initialize tour
     */
    init() {
        this.steps = this.defaultSteps;
        this.createOverlay();
        this.createTooltip();
        this.checkTourStatus();
    },

    /**
     * Create overlay element
     */
    createOverlay() {
        if (this.overlay) return;

        this.overlay = document.createElement('div');
        this.overlay.className = 'help-tour-overlay';
        this.overlay.innerHTML = `
            <div class="help-tour-modal">
                <div class="help-tour-header">
                    <h3 class="help-tour-title"></h3>
                    <button class="help-tour-close" aria-label="Close tour">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="help-tour-content"></div>
                <div class="help-tour-footer">
                    <button class="help-tour-btn help-tour-prev" aria-label="Previous step">
                        ← Trước
                    </button>
                    <span class="help-tour-progress"></span>
                    <button class="help-tour-btn help-tour-next" aria-label="Next step">
                        Tiếp theo →
                    </button>
                    <button class="help-tour-btn help-tour-skip" aria-label="Skip tour">
                        Bỏ qua
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);

        // Bind events
        this.overlay.querySelector('.help-tour-close').addEventListener('click', () => this.endTour());
        this.overlay.querySelector('.help-tour-prev').addEventListener('click', () => this.prevStep());
        this.overlay.querySelector('.help-tour-next').addEventListener('click', () => this.nextStep());
        this.overlay.querySelector('.help-tour-skip').addEventListener('click', () => this.endTour());
    },

    /**
     * Create tooltip element
     */
    createTooltip() {
        if (this.tooltip) return;

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'help-tour-tooltip';
        document.body.appendChild(this.tooltip);
    },

    /**
     * Check if user completed tour before
     */
    checkTourStatus() {
        const completed = localStorage.getItem('sadec-tour-completed');
        if (!completed) {
            // Show tour hint after 2 seconds
            setTimeout(() => this.showTourHint(), 2000);
        }
    },

    /**
     * Show tour start hint
     */
    showTourHint() {
        // Only show on dashboard
        if (!document.querySelector('.dashboard')) return;

        const hint = document.createElement('div');
        hint.className = 'help-tour-hint';
        hint.innerHTML = `
            <button id="start-tour-btn" class="help-tour-start-btn">
                <span class="material-symbols-outlined">help</span>
                Xem hướng dẫn
            </button>
        `;
        document.querySelector('.dashboard')?.prepend(hint);

        document.getElementById('start-tour-btn')?.addEventListener('click', () => {
            hint.remove();
            this.startTour();
        });
    },

    /**
     * Start tour
     */
    startTour() {
        this.currentStep = 0;
        this.isTourRunning = true;
        this.showStep();
        document.body.classList.add('help-tour-active');
    },

    /**
     * Show current step
     */
    showStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;

        const target = document.querySelector(step.target);
        if (!target) {
            this.nextStep();
            return;
        }

        // Update tooltip content
        const title = this.overlay.querySelector('.help-tour-title');
        const content = this.overlay.querySelector('.help-tour-content');
        const progress = this.overlay.querySelector('.help-tour-progress');
        const nextBtn = this.overlay.querySelector('.help-tour-next');

        title.textContent = step.title;
        content.textContent = step.content;
        progress.textContent = `${this.currentStep + 1} / ${this.steps.length}`;

        if (this.currentStep === this.steps.length - 1) {
            nextBtn.textContent = 'Hoàn thành';
            nextBtn.setAttribute('aria-label', 'Complete tour');
        } else {
            nextBtn.textContent = 'Tiếp theo →';
            nextBtn.setAttribute('aria-label', 'Next step');
        }

        // Highlight target
        this.highlightTarget(target);

        // Position tooltip
        this.positionTooltip(target, step.position);

        // Show overlay
        this.overlay.classList.add('active');
    },

    /**
     * Highlight target element
     * @param {Element} target - Target element
     */
    highlightTarget(target) {
        // Remove highlight from all elements
        document.querySelectorAll('.help-tour-highlight').forEach(el => {
            el.classList.remove('help-tour-highlight');
        });

        // Add highlight to target
        target.classList.add('help-tour-highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    /**
     * Position tooltip relative to target
     * @param {Element} target - Target element
     * @param {string} position - Position (top, bottom, left, right)
     */
    positionTooltip(target, position) {
        const rect = target.getBoundingClientRect();
        const modal = this.overlay.querySelector('.help-tour-modal');

        let top = 0;
        let left = 0;

        switch (position) {
            case 'right':
                top = rect.top + rect.height / 2;
                left = rect.right + 20;
                break;
            case 'left':
                top = rect.top + rect.height / 2;
                left = rect.left - modal.offsetWidth - 20;
                break;
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + rect.width / 2;
                break;
            default:
                top = rect.top - modal.offsetHeight - 20;
                left = rect.left + rect.width / 2;
        }

        modal.style.top = `${top}px`;
        modal.style.left = `${left}px`;
    },

    /**
     * Go to next step
     */
    nextStep() {
        if (this.currentStep >= this.steps.length - 1) {
            this.endTour();
        } else {
            this.currentStep++;
            this.showStep();
        }
    },

    /**
     * Go to previous step
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    },

    /**
     * End tour
     */
    endTour() {
        this.isTourRunning = false;
        this.overlay.classList.remove('active');
        document.body.classList.remove('help-tour-active');

        // Remove highlight
        document.querySelectorAll('.help-tour-highlight').forEach(el => {
            el.classList.remove('help-tour-highlight');
        });

        // Mark as completed
        localStorage.setItem('sadec-tour-completed', 'true');
    },

    /**
     * Restart tour
     */
    restartTour() {
        localStorage.removeItem('sadec-tour-completed');
        this.startTour();
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HelpTour.init());
} else {
    HelpTour.init();
}

// Export API
export { HelpTour, startTour, restartTour };

function startTour() {
    HelpTour.startTour();
}

function restartTour() {
    HelpTour.restartTour();
}
