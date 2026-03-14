/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STEPPER COMPONENT — Sa Đéc Marketing Hub
 * Multi-step form wizard component
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Step navigation (next/previous/complete)
 * - Step validation
 * - Progress indicator
 * - Keyboard navigation (Arrow Left/Right)
 * - Step completion status
 * - Optional step skipping
 *
 * Usage:
 *   const stepper = new Stepper('#stepper-element', {
 *     onStepChange: (step) => console.log('Step:', step),
 *     onValidate: (step) => validateStep(step),
 *     onComplete: () => console.log('Complete!')
 *   });
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

export class Stepper {
    constructor(selector, options = {}) {
        this.container = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (!this.container) {
            Logger.error('Stepper container not found', { selector });
            return;
        }

        this.options = {
            initialStep: 0,
            showProgress: true,
            keyboardNav: true,
            validation: true,
            onStepChange: null,
            onValidate: null,
            onComplete: null,
            ...options
        };

        this.currentStep = this.options.initialStep;
        this.steps = [];
        this.completed = false;

        this.init();
    }

    /**
     * Initialize stepper
     */
    init() {
        this.steps = Array.from(this.container.querySelectorAll('.step'));
        if (this.steps.length === 0) {
            Logger.warn('No steps found in stepper');
            return;
        }

        this.render();
        this.bindEvents();
        this.goToStep(this.currentStep);
        Logger.debug('Stepper initialized', { steps: this.steps.length });
    }

    /**
     * Render stepper UI
     */
    render() {
        this.container.innerHTML = `
            ${this.options.showProgress ? this.renderProgress() : ''}
            <div class="stepper-content">
                ${this.steps.map((step, index) => this.renderStepContent(step, index)).join('')}
            </div>
            <div class="stepper-navigation">
                <button
                    type="button"
                    class="stepper-btn stepper-prev"
                    ${this.currentStep === 0 ? 'disabled' : ''}
                >
                    ← Trước
                </button>
                <button
                    type="button"
                    class="stepper-btn stepper-next"
                >
                    ${this.currentStep === this.steps.length - 1 ? 'Hoàn tất' : 'Tiếp'} →
                </button>
            </div>
        `;
    }

    /**
     * Render progress indicator
     */
    renderProgress() {
        const progress = ((this.currentStep + 1) / this.steps.length) * 100;
        return `
            <div class="stepper-progress">
                <div class="stepper-progress-bar" style="width: ${progress}%"></div>
                <div class="stepper-steps-indicator">
                    ${this.steps.map((_, index) => `
                        <div
                            class="step-indicator ${index === this.currentStep ? 'active' : ''} ${index < this.currentStep ? 'completed' : ''}"
                            data-step="${index}"
                        >
                            <span class="step-number">${index + 1}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="stepper-progress-text">
                    Bước ${this.currentStep + 1} / ${this.steps.length}
                </div>
            </div>
        `;
    }

    /**
     * Render individual step content
     */
    renderStepContent(step, index) {
        const stepContent = step.innerHTML || step.textContent;
        return `
            <div
                class="stepper-step-content"
                data-step="${index}"
                style="display: ${index === this.currentStep ? 'block' : 'none'}"
            >
                ${stepContent}
            </div>
        `;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        const prevBtn = this.container.querySelector('.stepper-prev');
        const nextBtn = this.container.querySelector('.stepper-next');

        prevBtn?.addEventListener('click', () => this.prev());
        nextBtn?.addEventListener('click', () => this.next());

        // Step indicators
        this.container.querySelectorAll('.step-indicator').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const step = parseInt(e.currentTarget.dataset.step);
                this.goToStep(step);
            });
        });

        // Keyboard navigation
        if (this.options.keyboardNav) {
            document.addEventListener('keydown', (e) => {
                if (document.activeElement.closest('.stepper')) {
                    if (e.key === 'ArrowLeft') this.prev();
                    if (e.key === 'ArrowRight') this.next();
                }
            });
        }
    }

    /**
     * Go to specific step
     */
    goToStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;
        if (this.completed) return;

        // Validate current step before moving
        if (stepIndex > this.currentStep && this.options.validation) {
            const isValid = this.validateStep(this.currentStep);
            if (!isValid) {
                Logger.warn('Step validation failed', { step: this.currentStep });
                return;
            }
        }

        this.currentStep = stepIndex;
        this.updateUI();

        if (this.options.onStepChange) {
            this.options.onStepChange(this.currentStep);
        }
    }

    /**
     * Go to next step
     */
    next() {
        if (this.currentStep >= this.steps.length - 1) {
            // Complete
            this.complete();
            return;
        }
        this.goToStep(this.currentStep + 1);
    }

    /**
     * Go to previous step
     */
    prev() {
        this.goToStep(this.currentStep - 1);
    }

    /**
     * Validate step
     */
    validateStep(stepIndex) {
        if (!this.options.validation) return true;

        const stepContent = this.container.querySelector(`[data-step="${stepIndex}"]`);
        if (!stepContent) return true;

        // Custom validation
        if (this.options.onValidate) {
            return this.options.onValidate(stepIndex, stepContent);
        }

        // Default: check required fields
        const requiredFields = stepContent.querySelectorAll('[required]');
        for (const field of requiredFields) {
            if (!field.value.trim()) {
                field.classList.add('error');
                Logger.warn('Required field empty', { field: field.name });
                return false;
            }
        }
        return true;
    }

    /**
     * Complete stepper
     */
    complete() {
        // Validate final step
        if (this.options.validation && !this.validateStep(this.currentStep)) {
            return;
        }

        this.completed = true;
        this.updateUI();

        if (this.options.onComplete) {
            this.options.onComplete();
        }

        Logger.log('Stepper completed');
    }

    /**
     * Update UI
     */
    updateUI() {
        // Update progress bar
        const progressBar = this.container.querySelector('.stepper-progress-bar');
        if (progressBar) {
            const progress = ((this.currentStep + 1) / this.steps.length) * 100;
            progressBar.style.width = `${progress}%`;
        }

        // Update step indicators
        this.container.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentStep);
            indicator.classList.toggle('completed', index < this.currentStep);
        });

        // Update step content visibility
        this.container.querySelectorAll('.stepper-step-content').forEach((content, index) => {
            content.style.display = index === this.currentStep ? 'block' : 'none';
        });

        // Update navigation buttons
        const prevBtn = this.container.querySelector('.stepper-prev');
        const nextBtn = this.container.querySelector('.stepper-next');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 0;
        }

        if (nextBtn) {
            nextBtn.textContent = this.currentStep === this.steps.length - 1
                ? 'Hoàn tất ✓'
                : 'Tiếp →';
            nextBtn.disabled = this.completed;
        }

        // Update progress text
        const progressText = this.container.querySelector('.stepper-progress-text');
        if (progressText) {
            progressText.textContent = `Bước ${this.currentStep + 1} / ${this.steps.length}`;
        }
    }

    /**
     * Get current step
     */
    getCurrentStep() {
        return this.currentStep;
    }

    /**
     * Get total steps
     */
    getTotalSteps() {
        return this.steps.length;
    }

    /**
     * Reset stepper
     */
    reset() {
        this.currentStep = this.options.initialStep;
        this.completed = false;
        this.updateUI();
    }

    /**
     * Destroy stepper
     */
    destroy() {
        this.container.innerHTML = '';
        Logger.debug('Stepper destroyed');
    }
}

/**
 * Auto-initialize steppers
 */
export function initSteppers() {
    document.querySelectorAll('[data-stepper]').forEach(container => {
        const options = JSON.parse(container.dataset.stepper || '{}');
        new Stepper(container, options);
    });
}

// Auto-init on DOMContentLoaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSteppers);
    } else {
        initSteppers();
    }
}

export default Stepper;
