/**
 * MATERIAL DESIGN 3 INTERACTIONS
 * Handles: Ripple Effects, Scroll Reveal, Toast Notifications, Dialogs
 * Enhanced: Micro-animations, Hover Effects, Loading States
 *
 * @version 2.0.0 | 2026-03-14
 * @author Mekong Agency
 */

const M3 = {
    // ═══════════════════════════════════════════════════════════════
    // 1. RIPPLE EFFECT
    // ═══════════════════════════════════════════════════════════════
    initRipples() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.btn-exp, .nav-item, .card-exp.interactive, .btn-ripple, .press-effect');
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
    // 1.5 TOGGLE & FORM INTERACTIONS
    // ═══════════════════════════════════════════════════════════════
    initToggleSwitches() {
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('checked');
                // Trigger custom event for listeners
                toggle.dispatchEvent(new CustomEvent('toggle-change', {
                    detail: { checked: toggle.classList.contains('checked') }
                }));
            });
        });
    },

    initCheckboxes() {
        // Animated checkboxes already handled by CSS
        // Add haptic feedback sound if enabled
        document.querySelectorAll('.checkbox-animated input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Could add subtle sound effect here
                    console.log('Checkbox checked');
                }
            });
        });
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
                    entry.target.classList.add('visible', 'revealed');
                    // Optional: Stop observing once revealed
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Enhanced selectors for scroll reveal
        const activeElements = document.querySelectorAll(`
            .reveal-exp,
            .reveal-exp-scale,
            .stagger-item,
            .scroll-reveal,
            .scroll-fade-in,
            .scroll-scale-in,
            .scroll-blur-reveal,
            .blur-reveal,
            .scale-blur-reveal,
            .rotor-reveal
        `);
        activeElements.forEach(el => observer.observe(el));

        // Handle Staggered Children
        document.querySelectorAll('.stagger-parent, .stagger-container').forEach(parent => {
            if (window.getComputedStyle(parent).opacity === '1') {
                Array.from(parent.children).forEach((child, index) => {
                    child.style.transitionDelay = `${index * 0.1}s`;
                    observer.observe(child);
                });
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // 3. TOAST NOTIFICATIONS (Enhanced)
    // ═══════════════════════════════════════════════════════════════
    toast(message, type = 'info', duration = 4000, position = 'bottom-center') {
        // Remove existing toast container if any
        let container = document.getElementById('m3-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'm3-toast-container';
            container.className = `toast-position-${position}`;
            container.style.cssText = `
                position: fixed;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
                max-width: 400px;
                padding: 16px;
            `;
            // Position handling
            if (position.includes('bottom')) container.style.bottom = '24px';
            if (position.includes('top')) container.style.top = '24px';
            if (position.includes('center')) {
                container.style.left = '50%';
                container.style.transform = 'translateX(-50%)';
            }
            if (position.includes('left')) {
                container.style.left = '24px';
                container.style.transform = 'none';
            }
            if (position.includes('right')) {
                container.style.right = '24px';
                container.style.transform = 'none';
            }
            document.body.appendChild(container);
        }

        const toastEl = document.createElement('div');
        toastEl.className = 'card-exp glass-exp toast-enter';
        toastEl.style.cssText = `
            padding: 12px 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            pointer-events: auto;
            min-width: 280px;
            border-radius: 8px;
            backdrop-filter: blur(8px);
            border-left: 4px solid var(--md-exp-primary, #006A60);
            animation: toast-slide-in 0.3s cubic-bezier(0.2, 0, 0, 1) forwards;
        `;

        if (type === 'success') toastEl.style.borderLeftColor = '#10b981';
        if (type === 'error') toastEl.style.borderLeftColor = '#BA1A1A';
        if (type === 'warning') toastEl.style.borderLeftColor = '#f59e0b';

        const iconMap = {
            'info': 'ℹ️',
            'success': '✅',
            'error': '🚨',
            'warning': '⚠️'
        };

        toastEl.innerHTML = `
            <span style="font-size: 20px;">${iconMap[type]}</span>
            <div style="flex:1;">
                <div class="body-medium" style="color: var(--md-sys-color-on-surface, #191C1B);">${message}</div>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                cursor: pointer;
                font-size: 18px;
                color: var(--md-sys-color-outline, #666);
                padding: 4px;
                line-height: 1;
            ">&times;</button>
        `;

        container.appendChild(toastEl);

        setTimeout(() => {
            toastEl.style.animation = 'toast-slide-out 0.3s forwards';
            setTimeout(() => {
                toastEl.remove();
                // Clean up empty container
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        }, duration);
    },

    // ═══════════════════════════════════════════════════════════════
    // 4. DIALOGS & LOADING (Enhanced)
    // ═══════════════════════════════════════════════════════════════
    showLoading(message = 'Đang xử lý...', variant = 'spinner') {
        const loader = document.createElement('div');
        loader.id = 'm3-global-loader';
        loader.className = 'glass-exp modal-fade-scale active';
        loader.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            animation: modal-enter 0.3s cubic-bezier(0.2, 0, 0, 1) forwards;
        `;

        let loaderContent = '';

        if (variant === 'spinner') {
            loaderContent = `
                <div class="loading-spinner-pro" style="
                    width: 48px;
                    height: 48px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top-color: var(--md-exp-primary, #E91E63);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <div class="title-medium" style="margin-top: 16px; color: white;">${message}</div>
            `;
        } else if (variant === 'dots') {
            loaderContent = `
                <div class="loading-pulse-dots" style="display: flex; gap: 6px;">
                    <div class="dot" style="
                        width: 10px; height: 10px;
                        background: white;
                        border-radius: 50%;
                        animation: pulse-dot 1.4s ease-in-out infinite;
                    "></div>
                    <div class="dot" style="
                        width: 10px; height: 10px;
                        background: white;
                        border-radius: 50%;
                        animation: pulse-dot 1.4s ease-in-out infinite;
                        animation-delay: 0.2s;
                    "></div>
                    <div class="dot" style="
                        width: 10px; height: 10px;
                        background: white;
                        border-radius: 50%;
                        animation: pulse-dot 1.4s ease-in-out infinite;
                        animation-delay: 0.4s;
                    "></div>
                </div>
                <div class="title-medium" style="margin-top: 16px; color: white;">${message}</div>
            `;
        } else if (variant === 'progress') {
            loaderContent = `
                <div class="circular-progress" style="
                    width: 60px; height: 60px;
                    position: relative;
                ">
                    <svg style="width: 100%; height: 100%; transform: rotate(-90deg);">
                        <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="4"></circle>
                        <circle cx="30" cy="30" r="26" fill="none" stroke="var(--md-exp-primary, #E91E63)" stroke-width="4"
                            stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="39"
                            style="animation: circular-progress 1.5s ease-in-out infinite;"></circle>
                    </svg>
                </div>
                <div class="title-medium" style="margin-top: 16px; color: white;">${message}</div>
            `;
        }

        loader.innerHTML = loaderContent;
        document.body.appendChild(loader);
    },

    hideLoading() {
        const loader = document.getElementById('m3-global-loader');
        if (loader) {
            loader.style.animation = 'modal-exit 0.2s forwards';
            setTimeout(() => loader.remove(), 200);
        }
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

        // 5.3 Card Tilt Effect (3D)
        this.initCardTilt();

        // 5.4 Magnetic Buttons
        this.initMagneticButtons();
    },

    updateSpotlights(clientX, clientY) {
        const cards = document.querySelectorAll('.spotlight-card, .card-spotlight');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // 5.3 CARD TILT EFFECT (3D Perspective)
    // ═══════════════════════════════════════════════════════════════
    initCardTilt() {
        const tiltCards = document.querySelectorAll('.card-tilt, .tilt-effect');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // 5.4 MAGNETIC BUTTONS
    // ═══════════════════════════════════════════════════════════════
    initMagneticButtons() {
        const magneticBtns = document.querySelectorAll('.btn-magnetic, .magnetic-effect');

        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // 6. INITIALIZATION HELPER
    // ═══════════════════════════════════════════════════════════════
    initForms() {
        // Initialize floating labels
        this.initFloatingLabels();

        // Initialize animated checkboxes/radios
        this.initCheckboxes();
        this.initToggleSwitches();
    },

    initFloatingLabels() {
        // Floating label animation is handled by CSS
        // Just add accessibility enhancements
        document.querySelectorAll('.input-floating-label input').forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('is-focused');
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('is-focused');
            });
        });
    },

    initToggleSwitches() {
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('checked');
                toggle.dispatchEvent(new CustomEvent('toggle-change', {
                    detail: { checked: toggle.classList.contains('checked') }
                }));
            });
        });
    },

    initCheckboxes() {
        document.querySelectorAll('.checkbox-animated input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Could add subtle haptic feedback here
                    console.log('Checkbox checked');
                }
            });
        });
    },
};

// Auto Init
window.addEventListener('DOMContentLoaded', () => {
    M3.initRipples();
    M3.initScrollReveal();
    M3.initHyperWow();
    M3.initForms();

    // Attach to window
    window.M3 = M3;

    // CSS for Ripple and Animations
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

        /* Modal animations */
        @keyframes modal-enter { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes modal-exit { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }

        /* Toast animations */
        @keyframes toast-slide-in { from { opacity: 0; transform: translateY(20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toast-slide-out { to { opacity: 0; transform: translateY(-20px) scale(0.9); } }

        /* Loading dot animations */
        @keyframes pulse-dot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes circular-progress { 0%, 100% { stroke-dashoffset: 157; } 50% { stroke-dashoffset: 39; } }
    `;
    document.head.appendChild(style);
});
