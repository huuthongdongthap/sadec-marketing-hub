/**
 * Agency 2026 Premium - Advanced UI Interactions
 * SpotlightManager, AnimatedCounter, TiltEffect
 */

(function () {
    'use strict';

    // ===== SPOTLIGHT MANAGER =====
    class SpotlightManager {
        constructor() {
            this.cards = [];
        }

        init() {
            this.bindCards();
            console.log('[Agency2026] SpotlightManager initialized');
        }

        bindCards() {
            const cards = document.querySelectorAll('.glass-card-premium, .glass-card');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => this.updateSpotlight(e, card));
                card.addEventListener('mouseleave', () => this.resetSpotlight(card));
            });
            this.cards = cards;
        }

        updateSpotlight(e, card) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }

        resetSpotlight(card) {
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        }
    }

    // ===== ANIMATED COUNTER =====
    class AnimatedCounter {
        constructor() {
            this.observers = [];
        }

        init() {
            this.setupIntersectionObserver();
            console.log('[Agency2026] AnimatedCounter initialized');
        }

        setupIntersectionObserver() {
            const counters = document.querySelectorAll('[data-counter], .stat-value[data-target]');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateElement(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
        }

        animateElement(element) {
            const target = parseInt(element.dataset.target || element.dataset.counter) || 0;
            const suffix = element.dataset.suffix || '';
            const prefix = element.dataset.prefix || '';
            const duration = parseInt(element.dataset.duration) || 1500;

            this.animate(element, target, duration, prefix, suffix);
        }

        animate(element, endValue, duration = 1500, prefix = '', suffix = '') {
            const start = 0;
            const startTime = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing: easeOutExpo
                const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const current = Math.floor(eased * endValue);

                element.textContent = prefix + this.formatValue(current) + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = prefix + this.formatValue(endValue) + suffix;
                }
            };

            requestAnimationFrame(update);
        }

        formatValue(value) {
            if (value >= 1000000000) {
                return (value / 1000000000).toFixed(1) + 'B';
            } else if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
            }
            return value.toLocaleString('vi-VN');
        }
    }

    // ===== 3D TILT EFFECT =====
    class TiltEffect {
        constructor() {
            this.maxTilt = 8;
        }

        init() {
            this.bindElements();
            console.log('[Agency2026] TiltEffect initialized');
        }

        bindElements() {
            const elements = document.querySelectorAll('[data-tilt], .glass-card-premium');

            elements.forEach(el => {
                el.addEventListener('mousemove', (e) => this.onMouseMove(e, el));
                el.addEventListener('mouseleave', () => this.onMouseLeave(el));
            });
        }

        onMouseMove(e, element) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const percentX = (e.clientX - centerX) / (rect.width / 2);
            const percentY = (e.clientY - centerY) / (rect.height / 2);

            const tiltX = -percentY * this.maxTilt;
            const tiltY = percentX * this.maxTilt;

            element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px) scale(1.02)`;
        }

        onMouseLeave(element) {
            element.style.transform = '';
        }
    }

    // ===== STAGGERED REVEAL =====
    class StaggeredReveal {
        init() {
            this.setupObserver();
            console.log('[Agency2026] StaggeredReveal initialized');
        }

        setupObserver() {
            const elements = document.querySelectorAll('.animate-entry-premium, .animate-entry');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationDelay = `${index * 0.1}s`;
                        entry.target.classList.add('revealed');
                    }
                });
            }, { threshold: 0.1 });

            elements.forEach(el => observer.observe(el));
        }
    }

    // ===== MAGNETIC BUTTON EFFECT =====
    class MagneticButton {
        init() {
            const buttons = document.querySelectorAll('.btn-cyber, .btn-secondary');

            buttons.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                });
            });

            console.log('[Agency2026] MagneticButton initialized');
        }
    }

    // ===== MAIN INIT =====
    class Agency2026Premium {
        constructor() {
            this.spotlight = new SpotlightManager();
            this.counter = new AnimatedCounter();
            this.tilt = new TiltEffect();
            this.reveal = new StaggeredReveal();
            this.magnetic = new MagneticButton();
        }

        init() {
            // Wait for DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initAll());
            } else {
                this.initAll();
            }
        }

        initAll() {
            this.spotlight.init();
            this.counter.init();
            this.tilt.init();
            this.reveal.init();
            this.magnetic.init();

            console.log('[Agency2026] Premium UI fully initialized ✨');
        }
    }

    // Export & Auto-init
    window.Agency2026Premium = Agency2026Premium;

    // Auto-initialize
    const premium = new Agency2026Premium();
    premium.init();

})();
