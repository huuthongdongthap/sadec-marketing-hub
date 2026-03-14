/**
 * MATERIAL DESIGN 3 INTERACTIONS
 * Handles: Ripple Effects, Scroll Reveal, Toast Notifications, Dialogs
 */

const M3 = {
    // ═══════════════════════════════════════════════════════════════
    // 1. RIPPLE EFFECT
    // ═══════════════════════════════════════════════════════════════
    initRipples() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.btn-exp, .nav-item, .card-exp.interactive');
            if (target) {
                this.createRipple(e, target);
            }
        });
    },

    createRipple(event, element) {
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        const rectification = element.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rectification.left - radius}px`;
        circle.style.top = `${event.clientY - rectification.top - radius}px`;
        circle.classList.add('ripple-exp');

        // Remove existing ripples to prevent buildup
        const ripple = element.getElementsByClassName('ripple-exp')[0];
        if (ripple) {
            ripple.remove();
        }

        element.appendChild(circle);
    },

    // ═══════════════════════════════════════════════════════════════
    // 2. SCROLL REVEAL (IntersectionObserver)
    // ═══════════════════════════════════════════════════════════════
    initScrollReveal() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: Stop observing once revealed
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const activeElements = document.querySelectorAll('.reveal-exp, .reveal-exp-scale, .stagger-item');
        activeElements.forEach(el => observer.observe(el));

        // Handle Staggered Children
        document.querySelectorAll('.stagger-parent').forEach(parent => {
            if (window.getComputedStyle(parent).opacity === '1') {
                Array.from(parent.children).forEach((child, index) => {
                    child.style.transitionDelay = `${index * 0.1}s`;
                    observer.observe(child);
                });
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // 3. TOAST NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════
    toast(message, type = 'info', duration = 4000) {
        // Remove existing toast container if any
        let container = document.getElementById('m3-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'm3-toast-container';
            container.style.cssText = `
                position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
                z-index: 9999; display: flex; flex-direction: column; gap: 8px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toastEl = document.createElement('div');
        toastEl.className = 'card-exp glass-exp';
        toastEl.style.cssText = `
            padding: 12px 24px; display: flex; align-items: center; gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); pointer-events: auto;
            min-width: 300px; max-width: 90vw; animation: m3-slide-up 0.3s cubic-bezier(0.2, 0, 0, 1) forwards;
            border-left: 4px solid var(--md-exp-primary);
        `;

        if (type === 'success') toastEl.style.borderLeftColor = '#4CAF50';
        if (type === 'error') toastEl.style.borderLeftColor = '#F44336';
        if (type === 'warning') toastEl.style.borderLeftColor = '#FFC107';

        const iconMap = {
            'info': 'ℹ️',
            'success': '✅',
            'error': '🚨',
            'warning': '⚠️'
        };

        toastEl.innerHTML = `
            <span style="font-size: 20px;">${iconMap[type]}</span>
            <div style="flex:1;">
                <div class="body-medium">${message}</div>
            </div>
        `;

        container.appendChild(toastEl);

        setTimeout(() => {
            toastEl.style.animation = 'm3-fade-out 0.3s forwards';
            setTimeout(() => toastEl.remove(), 300);
        }, duration);
    },

    // ═══════════════════════════════════════════════════════════════
    // 4. DIALOGS
    // ═══════════════════════════════════════════════════════════════
    showLoading(message = 'Đang xử lý...') {
        const loader = document.createElement('div');
        loader.id = 'm3-global-loader';
        loader.className = 'glass-exp';
        loader.style.cssText = `
            position: fixed; inset: 0; z-index: 10000;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
        `;

        loader.innerHTML = `
            <div class="md-circular-progress"></div>
            <div class="title-medium" style="margin-top: 16px; color: white;">${message}</div>
        `;

        document.body.appendChild(loader);
    },

    hideLoading() {
        const loader = document.getElementById('m3-global-loader');
        if (loader) loader.remove();
    },
    // ═══════════════════════════════════════════════════════════════
    // 5. HYPER-WOW LOGIC (2026)
    // ═══════════════════════════════════════════════════════════════
    initHyperWow() {
        // 5.1 Inject Noise
        if (!document.querySelector('.noise-overlay')) {
            const noise = document.createElement('div');
            noise.className = 'noise-overlay';
            document.body.prepend(noise);
        }

        // 5.2 Spotlight Tracking (Optimized with rAF)
        let ticking = false;
        
        document.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateSpotlights(e.clientX, e.clientY);
                    ticking = false;
                });
                ticking = true;
            }
        });
    },

    updateSpotlights(clientX, clientY) {
        const cards = document.querySelectorAll('.spotlight-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    }
};

// Auto Init
window.addEventListener('DOMContentLoaded', () => {
    M3.initRipples();
    M3.initScrollReveal();
    M3.initHyperWow();

    // Attach to window
    window.M3 = M3;

    // CSS for Ripple
    const style = document.createElement('style');
    style.innerHTML = `
        .ripple-exp {
            position: absolute; border-radius: 50%; transform: scale(0);
            animation: ripple 0.6s linear; background: rgba(255, 255, 255, 0.3);
            pointer-events: none;
        }
        @keyframes ripple { to { transform: scale(4); opacity: 0; } }
        @keyframes m3-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes m3-fade-out { to { opacity: 0; transform: translateY(-10px); } }
        
        .md-circular-progress {
            width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid var(--md-exp-primary, #E91E63); border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
});
