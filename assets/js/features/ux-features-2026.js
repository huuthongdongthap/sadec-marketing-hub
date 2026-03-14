/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — UX FEATURES 2026
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * 1. Infinite Scroll - Load more content on scroll
 * 2. Virtual Scrolling - Efficient large list rendering
 * 3. Optimistic UI Updates - Instant feedback before server response
 * 4. Form Progress Indicator - Show form completion progress
 * 5. Character Counter - Real-time character/word count
 * 6. Input Mask - Auto-format inputs (phone, currency, date)
 * 7. Enhanced Toast Queue - Smart notification management
 * 8. Debounced Search - Optimized search with debounce
 * 9. Lazy Load Images - Performance optimization
 * 10. Intersection Observer - Scroll-triggered animations
 *
 * @version 1.0.0 | 2026-03-14
 * @author Mekong Agency
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 1. INFINITE SCROLL
// ============================================================================

/**
 * Infinite Scroll Manager
 * Loads more content when user scrolls near bottom
 */
export class InfiniteScroll {
    constructor(options = {}) {
        this.container = options.container || window;
        this.onLoadMore = options.onLoadMore;
        this.threshold = options.threshold || 200; // px from bottom
        this.loading = false;
        this.hasMore = true;
        this.page = 1;
        this.observer = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.setupObserver();
        } else {
            this.setupScrollListener();
        }
    }

    setupObserver() {
        const sentinel = document.createElement('div');
        sentinel.className = 'infinite-scroll-sentinel';
        this.container.appendChild?.(sentinel);

        this.observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !this.loading && this.hasMore) {
                    this.loadMore();
                }
            },
            { rootMargin: `${this.threshold}px` }
        );

        this.observer.observe(sentinel);
    }

    setupScrollListener() {
        let ticking = false;
        const container = this.container;

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.checkScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        container.addEventListener('scroll', onScroll, { passive: true });
    }

    checkScroll() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;

        if (scrollTop + clientHeight >= scrollHeight - this.threshold) {
            if (!this.loading && this.hasMore) {
                this.loadMore();
            }
        }
    }

    async loadMore() {
        this.loading = true;
        this.page++;

        try {
            await this.onLoadMore?.(this.page);
        } catch (error) {
            console.error('[InfiniteScroll] Load more failed:', error);
            this.hasMore = false;
        } finally {
            this.loading = false;
        }
    }

    destroy() {
        this.observer?.disconnect();
        this.hasMore = false;
    }
}

// ============================================================================
// 2. VIRTUAL SCROLLING
// ============================================================================

/**
 * Virtual Scroll for large lists
 * Only renders visible items for better performance
 */
export class VirtualScroll {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;
        this.itemHeight = options.itemHeight || 50;
        this.overscan = options.overscan || 5;
        this.items = options.items || [];
        this.renderItem = options.renderItem;
        this.viewport = null;
        this.spacer = null;
        this.content = null;
        this.scrollTop = 0;
        this.init();
    }

    init() {
        if (!this.container) return;

        // Create viewport
        this.viewport = document.createElement('div');
        this.viewport.className = 'virtual-scroll-viewport';
        this.viewport.style.cssText = 'overflow-y: auto; height: 100%; position: relative;';

        // Create spacer for total height
        this.spacer = document.createElement('div');
        this.spacer.className = 'virtual-scroll-spacer';

        // Create content container
        this.content = document.createElement('div');
        this.content.className = 'virtual-scroll-content';
        this.content.style.position = 'absolute';
        this.content.style.top = '0';
        this.content.style.left = '0';
        this.content.style.right = '0';

        this.viewport.appendChild(this.spacer);
        this.viewport.appendChild(this.content);
        this.container.innerHTML = '';
        this.container.appendChild(this.viewport);

        this.updateSpacer();
        this.render();

        this.viewport.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    updateSpacer() {
        const height = this.items.length * this.itemHeight;
        this.spacer.style.height = `${height}px`;
    }

    onScroll() {
        this.scrollTop = this.viewport.scrollTop;
        this.render();
    }

    render() {
        const startIndex = Math.max(
            0,
            Math.floor(this.scrollTop / this.itemHeight) - this.overscan
        );
        const endIndex = Math.min(
            this.items.length,
            Math.ceil((this.scrollTop + this.viewport.clientHeight) / this.itemHeight) + this.overscan
        );

        const visibleItems = this.items.slice(startIndex, endIndex);
        const offsetY = startIndex * this.itemHeight;

        this.content.style.transform = `translateY(${offsetY}px)`;
        this.content.innerHTML = visibleItems
            .map((item, index) =>
                this.renderItem?.(item, startIndex + index) ||
                `<div style="height: ${this.itemHeight}px;">${item}</div>`
            )
            .join('');
    }

    setItems(items) {
        this.items = items;
        this.updateSpacer();
        this.render();
    }
}

// ============================================================================
// 3. OPTIMISTIC UI UPDATES
// ============================================================================

/**
 * Optimistic UI Manager
 * Updates UI instantly, rolls back on error
 */
export class OptimisticUI {
    constructor() {
        this.pendingUpdates = new Map();
        this.rollbackStack = [];
    }

    /**
     * Apply optimistic update with rollback capability
     * @param {string} elementId - Target element
     * @param {Function} updateFn - Function to apply update
     * @param {Function} apiCall - Async API call
     * @param {Function} rollbackFn - Function to rollback
     */
    async update({ elementId, updateFn, apiCall, rollbackFn }) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Save current state
        const previousState = element.cloneNode(true);

        try {
            // Apply optimistic update
            updateFn(element);
            this.pendingUpdates.set(elementId, { previousState, rollbackFn });

            // Make API call
            const result = await apiCall();

            // Success - confirm update
            this.pendingUpdates.delete(elementId);
            return result;
        } catch (error) {
            console.error('[OptimisticUI] Update failed, rolling back:', error);

            // Rollback on error
            if (rollbackFn) {
                rollbackFn();
            } else {
                element.parentNode.replaceChild(previousState, element);
            }

            this.pendingUpdates.delete(elementId);
            throw error;
        }
    }

    /**
     * Optimistic toggle (like/dislike, follow/unfollow)
     */
    async toggle({ elementId, activeClass, apiCall }) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const isActive = element.classList.contains(activeClass);
        const previousState = isActive;

        // Optimistic toggle
        element.classList.toggle(activeClass);

        try {
            await apiCall(!isActive);
        } catch (error) {
            // Rollback
            element.classList.toggle(activeClass);
            throw error;
        }
    }
}

// ============================================================================
// 4. FORM PROGRESS INDICATOR
// ============================================================================

/**
 * Form Progress Indicator
 * Shows completion percentage for multi-step forms
 */
export class FormProgressIndicator {
    constructor(formSelector, options = {}) {
        this.form = typeof formSelector === 'string'
            ? document.querySelector(formSelector)
            : formSelector;
        this.container = options.container;
        this.showPercentage = options.showPercentage ?? true;
        this.showSteps = options.showSteps ?? false;
        this.requiredFields = [];
        this.filledFields = 0;
        this.init();
    }

    init() {
        if (!this.form) return;

        this.collectFields();
        this.createIndicator();
        this.attachListeners();
        this.updateProgress();
    }

    collectFields() {
        this.requiredFields = Array.from(
            this.form.querySelectorAll('input[required], textarea[required], select[required]')
        );
    }

    createIndicator() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'form-progress-container';
            this.form.insertBefore(this.container, this.form.firstChild);
        }

        this.container.innerHTML = `
            <div class="form-progress-header">
                ${this.showSteps ? '<span class="form-steps">Step <span class="current-step">1</span>/<span class="total-steps">3</span></span>' : ''}
                ${this.showPercentage ? '<span class="form-percentage">0%</span>' : ''}
            </div>
            <div class="form-progress-bar">
                <div class="form-progress-fill" style="width: 0%"></div>
            </div>
        `;

        this.progressFill = this.container.querySelector('.form-progress-fill');
        this.percentageText = this.container.querySelector('.form-percentage');
    }

    attachListeners() {
        this.form.addEventListener('input', (e) => {
            if (this.requiredFields.includes(e.target)) {
                this.updateProgress();
            }
        });

        this.form.addEventListener('change', (e) => {
            if (this.requiredFields.includes(e.target)) {
                this.updateProgress();
            }
        });
    }

    updateProgress() {
        this.filledFields = this.requiredFields.filter(field => {
            if (field.type === 'checkbox' || field.type === 'radio') {
                return field.checked;
            }
            return field.value.trim() !== '';
        }).length;

        const total = this.requiredFields.length;
        const percentage = total > 0 ? Math.round((this.filledFields / total) * 100) : 0;

        this.progressFill.style.width = `${percentage}%`;

        if (this.percentageText) {
            this.percentageText.textContent = `${percentage}%`;
        }

        // Update progress bar color based on completion
        this.progressFill.className = 'form-progress-fill';
        if (percentage === 100) {
            this.progressFill.classList.add('complete');
        } else if (percentage >= 50) {
            this.progressFill.classList.add('half');
        }

        // Dispatch event for external listeners
        this.form.dispatchEvent(new CustomEvent('formProgress', {
            detail: { percentage, filled: this.filledFields, total }
        }));
    }

    getProgress() {
        return {
            percentage: this.filledFields / this.requiredFields.length * 100,
            filled: this.filledFields,
            total: this.requiredFields.length
        };
    }
}

// ============================================================================
// 5. CHARACTER COUNTER
// ============================================================================

/**
 * Character Counter with word count
 */
export class CharacterCounter {
    constructor(inputSelector, options = {}) {
        this.input = typeof inputSelector === 'string'
            ? document.querySelector(inputSelector)
            : inputSelector;
        this.container = options.container;
        this.maxLength = options.maxLength || this.input?.maxLength || 500;
        this.showWordCount = options.showWordCount ?? false;
        this.showPercentage = options.showPercentage ?? true;
        this.warningThreshold = options.warningThreshold || 90;
        this.init();
    }

    init() {
        if (!this.input) return;

        this.createCounter();
        this.updateCount();
        this.attachListeners();
    }

    createCounter() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'character-counter';
            this.input.parentNode.appendChild(this.container);
        }

        this.container.innerHTML = `
            <span class="char-count">0/${this.maxLength}</span>
            ${this.showWordCount ? '<span class="word-count">0 từ</span>' : ''}
            ${this.showPercentage ? '<span class="char-percentage">0%</span>' : ''}
        `;

        this.countText = this.container.querySelector('.char-count');
        this.wordText = this.container.querySelector('.word-count');
        this.percentageText = this.container.querySelector('.char-percentage');
    }

    attachListeners() {
        this.input.addEventListener('input', () => this.updateCount());
    }

    updateCount() {
        const text = this.input.value;
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        const percentage = Math.round((charCount / this.maxLength) * 100);

        if (this.countText) {
            this.countText.textContent = `${charCount}/${this.maxLength}`;
        }

        if (this.wordText && this.showWordCount) {
            this.wordText.textContent = `${wordCount} từ`;
        }

        if (this.percentageText && this.showPercentage) {
            this.percentageText.textContent = `${percentage}%`;
        }

        // Update color based on usage
        this.container.classList.remove('warning', 'error');
        if (percentage >= this.warningThreshold) {
            this.container.classList.add('warning');
        }
        if (percentage >= 100) {
            this.container.classList.add('error');
        }
    }

    getCount() {
        return {
            characters: this.input.value.length,
            words: this.input.value.trim().split(/\s+/).length,
            remaining: this.maxLength - this.input.value.length
        };
    }
}

// ============================================================================
// 6. INPUT MASK
// ============================================================================

/**
 * Input Mask for formatting
 */
export class InputMask {
    constructor(inputSelector, mask, options = {}) {
        this.input = typeof inputSelector === 'string'
            ? document.querySelector(inputSelector)
            : inputSelector;
        this.mask = mask;
        this.placeholder = options.placeholder ?? true;
        this.clearOnEmpty = options.clearOnEmpty ?? false;
        this.init();
    }

    init() {
        if (!this.input) return;

        if (this.placeholder) {
            this.input.placeholder = this.formatMaskToPlaceholder();
        }

        this.attachListeners();
    }

    formatMaskToPlaceholder() {
        return this.mask
            .replace(/9/g, '0')
            .replace(/A/g, 'X')
            .replace(/a/g, 'x')
            .replace(/S/g, 'A')
            .replace(/s/g, 'a');
    }

    attachListeners() {
        this.input.addEventListener('input', (e) => this.onInput(e));
        this.input.addEventListener('blur', () => this.onBlur());
    }

    onInput(e) {
        let value = e.target.value;

        // Remove non-matching characters
        value = this.cleanValue(value);

        // Apply mask
        value = this.applyMask(value);

        e.target.value = value;
    }

    cleanValue(value) {
        const maskChars = this.mask.replace(/[9AaSx\-\(\)\.\ ]/g, '');
        return value.replace(new RegExp(`[^${maskChars}0-9A-Za-z]`, 'g'), '');
    }

    applyMask(value) {
        let result = '';
        let valueIndex = 0;

        for (let i = 0; i < this.mask.length; i++) {
            const maskChar = this.mask[i];

            if (this.isLiteral(maskChar)) {
                result += maskChar;
            } else if (valueIndex < value.length) {
                result += this.formatChar(value[valueIndex++], maskChar);
            }
        }

        return result;
    }

    isLiteral(char) {
        return !/[9AaSx]/.test(char);
    }

    formatChar(char, mask) {
        switch (mask) {
            case '9': return char.replace(/\D/g, '');
            case 'A': return char.toUpperCase();
            case 'a': return char.toLowerCase();
            case 'S': return char.replace(/[^A-Z]/g, '').toUpperCase();
            case 's': return char.replace(/[^a-z]/g, '').toLowerCase();
            case 'X': return char.replace(/[^A-Za-z0-9]/g, '');
            default: return char;
        }
    }

    onBlur() {
        if (this.clearOnEmpty && !this.input.value.trim()) {
            this.input.value = '';
        }
    }

    // Predefined masks
    static masks = {
        phone: '(99) 9999-9999',
        phoneUs: '(999) 999-9999',
        cpf: '999.999.999-99',
        cnpj: '99.999.999/9999-99',
        cep: '99999-999',
        currency: 'R$ 999.999.999,99',
        date: '99/99/9999',
        time: '99:99',
        datetime: '99/99/9999 99:99',
        creditCard: '9999 9999 9999 9999',
        cvv: '9999',
        ip: '999.999.999.999',
        plate: 'AAA-9999'
    };
}

// ============================================================================
// 7. ENHANCED TOAST QUEUE
// ============================================================================

/**
 * Smart Toast Queue Manager
 * Handles multiple notifications with queue management
 */
export class ToastQueue {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.position = options.position || 'bottom-right';
        this.maxVisible = options.maxVisible || 3;
        this.duration = options.duration || 4000;
        this.queue = [];
        this.current = [];
        this.init();
    }

    init() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = `toast-container toast-${this.position}`;
            container.style.cssText = `
                position: fixed;
                z-index: 9999;
                max-width: 400px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 16px;
            `;

            // Position
            switch (this.position) {
                case 'top-right':
                    container.style.top = '0';
                    container.style.right = '0';
                    break;
                case 'top-left':
                    container.style.top = '0';
                    container.style.left = '0';
                    break;
                case 'bottom-left':
                    container.style.bottom = '0';
                    container.style.left = '0';
                    break;
                default: // bottom-right
                    container.style.bottom = '0';
                    container.style.right = '0';
            }

            this.container.appendChild(container);
            this.container = container;
        }
    }

    show(message, type = 'info', options = {}) {
        const toast = {
            id: Date.now() + Math.random(),
            message,
            type,
            duration: options.duration || this.duration,
            action: options.action,
            onClose: options.onClose
        };

        this.queue.push(toast);
        this.processQueue();

        return toast.id;
    }

    processQueue() {
        while (this.current.length < this.maxVisible && this.queue.length > 0) {
            const toast = this.queue.shift();
            this.showToast(toast);
        }
    }

    showToast(toast) {
        const element = document.createElement('div');
        element.className = `toast toast-${toast.type}`;
        element.dataset.toastId = toast.id;
        element.innerHTML = `
            <span class="toast-icon">${this.getIcon(toast.type)}</span>
            <span class="toast-message">${toast.message}</span>
            ${toast.action ? `<button class="toast-action">${toast.action.label}</button>` : ''}
            <button class="toast-close">&times;</button>
        `;

        // Styles
        element.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: var(--toast-bg, #333);
            color: var(--toast-color, #fff);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: toastSlideIn 0.3s ease;
        `;

        this.container.appendChild(element);
        this.current.push(toast);

        // Auto-close
        const timeoutId = setTimeout(() => this.close(toast.id), toast.duration);

        // Close button
        element.querySelector('.toast-close')?.addEventListener('click', () => {
            clearTimeout(timeoutId);
            this.close(toast.id);
        });

        // Action button
        element.querySelector('.toast-action')?.addEventListener('click', () => {
            toast.action?.onClick?.();
            this.close(toast.id);
        });

        toast.close = () => this.close(toast.id);
    }

    close(id) {
        const index = this.current.findIndex(t => t.id === id);
        if (index === -1) return;

        const toast = this.current[index];
        const element = this.container.querySelector(`[data-toast-id="${id}"]`);

        if (element) {
            element.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => {
                element.remove();
                toast.onClose?.();
            }, 300);
        }

        this.current.splice(index, 1);
        this.processQueue();
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            loading: '⟳'
        };
        return icons[type] || icons.info;
    }

    success(message, options) { return this.show(message, 'success', options); }
    error(message, options) { return this.show(message, 'error', options); }
    warning(message, options) { return this.show(message, 'warning', options); }
    info(message, options) { return this.show(message, 'info', options); }
    loading(message, options) { return this.show(message, 'loading', options); }

    clear() {
        this.current.forEach(toast => this.close(toast.id));
        this.queue = [];
    }
}

// ============================================================================
// 8. DEBOUNCED SEARCH
// ============================================================================

/**
 * Debounced Search with caching
 */
export class DebouncedSearch {
    constructor(options = {}) {
        this.debounceTime = options.debounceTime || 300;
        this.minChars = options.minChars || 2;
        this.cache = new Map();
        this.onSearch = options.onSearch;
        this.onResult = options.onResult;
        this.onError = options.onError;
        this.abortController = null;
        this.timeoutId = null;
    }

    async search(query) {
        // Clear previous search
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        if (this.abortController) {
            this.abortController.abort();
        }

        // Validate query
        if (query.length < this.minChars) {
            this.onResult?.([]);
            return;
        }

        // Check cache
        if (this.cache.has(query)) {
            this.onResult?.(this.cache.get(query));
            return;
        }

        // Debounce
        this.timeoutId = setTimeout(async () => {
            this.abortController = new AbortController();

            try {
                const results = await this.onSearch?.(query, this.abortController.signal);
                this.cache.set(query, results);
                this.onResult?.(results);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.onError?.(error);
                }
            }
        }, this.debounceTime);
    }

    clearCache() {
        this.cache.clear();
    }

    cancel() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.abortController) this.abortController.abort();
    }
}

// ============================================================================
// 9. LAZY LOAD IMAGES
// ============================================================================

/**
 * Lazy Load Images with Intersection Observer
 */
export class LazyLoadImages {
    constructor(options = {}) {
        this.placeholder = options.placeholder || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        this.loadedClass = options.loadedClass || 'lazy-loaded';
        this.errorClass = options.errorClass || 'lazy-error';
        this.rootMargin = options.rootMargin || '50px';
        this.threshold = options.threshold || 0;
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) {
            this.loadAll();
            return;
        }

        this.observer = new IntersectionObserver(
            (entries) => this.onIntersection(entries),
            { rootMargin: this.rootMargin, threshold: this.threshold }
        );

        this.observeAll();
    }

    observeAll() {
        document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
            if (!img.src || img.src === this.placeholder) {
                this.observer.observe(img);
            }
        });
    }

    onIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        const sizes = img.dataset.sizes;

        if (srcset) {
            img.srcset = srcset;
        }
        if (sizes) {
            img.sizes = sizes;
        }
        if (src) {
            img.src = src;
        }

        img.onload = () => {
            img.classList.add(this.loadedClass);
            img.classList.remove(this.errorClass);
        };

        img.onerror = () => {
            img.classList.add(this.errorClass);
        };

        // Remove data attributes after loading
        delete img.dataset.src;
        delete img.dataset.srcset;
        delete img.dataset.sizes;
    }

    loadAll() {
        document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
            this.loadImage(img);
        });
    }

    destroy() {
        this.observer?.disconnect();
    }
}

// ============================================================================
// 10. INTERSECTION OBSERVER ANIMATIONS
// ============================================================================

/**
 * Scroll-triggered animations using Intersection Observer
 */
export class ScrollAnimations {
    constructor(options = {}) {
        this.animationClass = options.animationClass || 'animate-entry';
        this.visibleClass = options.visibleClass || 'visible';
        this.rootMargin = options.rootMargin || '0px 0px -50px 0px';
        this.threshold = options.threshold || 0.1;
        this.once = options.once ?? true;
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll(`.${this.animationClass}`).forEach(el => {
                el.classList.add(this.visibleClass);
            });
            return;
        }

        this.observer = new IntersectionObserver(
            (entries) => this.onIntersection(entries),
            { rootMargin: this.rootMargin, threshold: this.threshold }
        );

        this.observeAll();
    }

    observeAll() {
        document.querySelectorAll(`.${this.animationClass}`).forEach(el => {
            this.observer.observe(el);
        });
    }

    onIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(this.visibleClass);

                if (this.once) {
                    this.observer.unobserve(entry.target);
                }
            } else if (!this.once) {
                entry.target.classList.remove(this.visibleClass);
            }
        });
    }

    destroy() {
        this.observer?.disconnect();
    }
}

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

/**
 * Initialize all UX features
 */
export function initUXFeatures() {
    if (typeof window !== 'undefined') {
        window.MekongUX = {
            InfiniteScroll,
            VirtualScroll,
            OptimisticUI,
            FormProgressIndicator,
            CharacterCounter,
            InputMask,
            ToastQueue,
            DebouncedSearch,
            LazyLoadImages,
            ScrollAnimations
        };

        // Auto-init some features
        document.addEventListener('DOMContentLoaded', () => {
            // Auto-init lazy images
            new LazyLoadImages();

            // Auto-init scroll animations
            new ScrollAnimations();

            // Auto-init form progress
            document.querySelectorAll('form[data-progress]').forEach(form => {
                new FormProgressIndicator(form);
            });

            // Auto-init character counters
            document.querySelectorAll('textarea[data-maxlength]').forEach(textarea => {
                new CharacterCounter(textarea, {
                    maxLength: parseInt(textarea.dataset.maxlength)
                });
            });

            // Auto-init input masks
            document.querySelectorAll('input[data-mask]').forEach(input => {
                new InputMask(input, input.dataset.mask);
            });

            Logger.info('[UX Features] Initialized');
        });
    }
}

// Auto-init if in browser
if (typeof document !== 'undefined') {
    initUXFeatures();
}
