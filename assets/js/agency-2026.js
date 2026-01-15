/**
 * ==============================================
 * AGENCY 2026 - CYBER INTERACTION ENGINE
 * 3D Tilt, Magnetic Buttons, Glow effects
 * ==============================================
 */

/**
 * ==============================================
 * AGENCY 2026 - CYBER INTERACTION ENGINE
 * 3D Tilt, Magnetic Buttons, Glow effects
 * ==============================================
 */

class Agency2026 {
    constructor() {
        this.initTiltEffect();
        this.initMagneticButtons();
        this.initStaggerAnimation();
    }

    /**
     * 3D Tilt Effect for Glass Cards
     * Uses requestAnimationFrame for smooth performance
     */
    initTiltEffect() {
        document.querySelectorAll('.glass-card').forEach(card => {
            let ticking = false;

            card.addEventListener('mousemove', (e) => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.applyTilt(card, e.clientX, e.clientY);
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /**
     * Calculates and applies the tilt transform
     */
    applyTilt(card, clientX, clientY) {
        const rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Calculate rotation based on cursor position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // Max 5 deg rotation
        const rotateY = ((x - centerX) / centerX) * 5;

        // Apply transform
        card.style.transform = `
          perspective(1000px) 
          rotateX(${rotateX}deg) 
          rotateY(${rotateY}deg) 
          translateY(-5px)
          scale(1.02)
        `;

        // Update radial glow position
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    }

    /**
     * Magnetic Button Effect
     * Buttons gravitate slightly towards the mouse
     */
    initMagneticButtons() {
        document.querySelectorAll('.btn-cyber').forEach(btn => {
            let ticking = false;

            btn.addEventListener('mousemove', (e) => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.applyMagnetic(btn, e.clientX, e.clientY);
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    applyMagnetic(btn, clientX, clientY) {
        const rect = btn.getBoundingClientRect();
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;

        // Move button slightly towards cursor
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    }

    /**
     * Staggered Entry Animation using IntersectionObserver
     */
    initStaggerAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-entry').forEach((el, index) => {
            // Add incremental delay via style is safer than class sometimes
            el.style.animationDelay = `${index * 100}ms`;
            observer.observe(el);
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    if (!window.agency2026) {
        window.agency2026 = new Agency2026();
    }
});
