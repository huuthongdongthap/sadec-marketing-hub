/**
 * ==============================================
 * MEKONG AGENCY - PERFORMANCE UTILITIES
 * Lazy loading, caching, monitoring
 * ==============================================
 */

// ===== LAZY LOADING =====
const LazyLoader = {
    observer: null,

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        if (el.dataset.src) {
                            el.src = el.dataset.src;
                            el.removeAttribute('data-src');
                        }
                        if (el.dataset.bg) {
                            el.style.backgroundImage = `url(${el.dataset.bg})`;
                            el.removeAttribute('data-bg');
                        }
                        el.classList.add('loaded');
                        this.observer.unobserve(el);
                    }
                });
            }, { rootMargin: '50px' });
        }
    },

    observe(selector) {
        if (!this.observer) this.init();
        document.querySelectorAll(selector).forEach(el => {
            this.observer?.observe(el);
        });
    }
};

// ===== MEMORY CACHE =====
class MemoryCache {
    constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, { value, timestamp: Date.now() });
        return this;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    clear() {
        this.cache.clear();
        return this;
    }

    size() {
        return this.cache.size;
    }
}

// ===== PERFORMANCE MONITOR =====
const PerformanceMonitor = {
    metrics: {},

    startTimer(name) {
        this.metrics[name] = { start: performance.now() };
    },

    endTimer(name) {
        if (this.metrics[name]) {
            this.metrics[name].end = performance.now();
            this.metrics[name].duration = this.metrics[name].end - this.metrics[name].start;
            return this.metrics[name].duration;
        }
        return 0;
    },

    measure(name, fn) {
        this.startTimer(name);
        const result = fn();
        this.endTimer(name);
        return result;
    },

    async measureAsync(name, fn) {
        this.startTimer(name);
        const result = await fn();
        this.endTimer(name);
        return result;
    },

    getReport() {
        const report = {};
        Object.entries(this.metrics).forEach(([name, data]) => {
            if (data.duration) {
                report[name] = `${data.duration.toFixed(2)}ms`;
            }
        });
        return report;
    },

    getWebVitals() {
        if (!window.performance) return {};

        const nav = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        const vitals = {
            DOM_Load: nav?.domContentLoadedEventEnd - nav?.fetchStart,
            Page_Load: nav?.loadEventEnd - nav?.fetchStart,
            DNS: nav?.domainLookupEnd - nav?.domainLookupStart,
            TCP: nav?.connectEnd - nav?.connectStart,
            TTFB: nav?.responseStart - nav?.fetchStart
        };

        paint.forEach(p => {
            vitals[p.name.replace('-', '_')] = p.startTime;
        });

        return vitals;
    },

    log() {
        console.table(this.getReport());
        console.table(this.getWebVitals());
    }
};

// ===== REQUEST QUEUE =====
class RequestQueue {
    constructor(concurrency = 3) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    async add(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.running >= this.concurrency || this.queue.length === 0) return;

        this.running++;
        const { fn, resolve, reject } = this.queue.shift();

        try {
            const result = await fn();
            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            this.running--;
            this.process();
        }
    }
}

// ===== VIRTUAL SCROLL =====
class VirtualScroll {
    constructor(container, items, renderFn, itemHeight = 50) {
        this.container = container;
        this.items = items;
        this.renderFn = renderFn;
        this.itemHeight = itemHeight;
        this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
        this.scrollTop = 0;
        this.init();
    }

    init() {
        const totalHeight = this.items.length * this.itemHeight;
        this.container.style.position = 'relative';
        this.container.style.height = `${totalHeight}px`;

        this.viewport = document.createElement('div');
        this.viewport.style.cssText = 'position:absolute;left:0;right:0;overflow:hidden';
        this.container.appendChild(this.viewport);

        this.container.parentElement.addEventListener('scroll', () => this.render());
        this.render();
    }

    render() {
        const scrollTop = this.container.parentElement.scrollTop;
        const startIndex = Math.floor(scrollTop / this.itemHeight);
        const endIndex = Math.min(startIndex + this.visibleCount, this.items.length);

        this.viewport.style.top = `${startIndex * this.itemHeight}px`;
        this.viewport.innerHTML = '';

        for (let i = startIndex; i < endIndex; i++) {
            const el = this.renderFn(this.items[i], i);
            el.style.height = `${this.itemHeight}px`;
            this.viewport.appendChild(el);
        }
    }

    update(items) {
        this.items = items;
        this.container.style.height = `${items.length * this.itemHeight}px`;
        this.render();
    }
}

// ===== EXPORTS =====
const MekongPerformance = {
    LazyLoader,
    MemoryCache,
    PerformanceMonitor,
    RequestQueue,
    VirtualScroll
};

if (typeof window !== 'undefined') {
    window.MekongPerformance = MekongPerformance;
    Object.assign(window, MekongPerformance);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MekongPerformance;
}
