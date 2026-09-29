/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB - MICRO-ANIMATIONS UTILITIES
 * JavaScript helpers for triggering animations programmatically
 *
 * Usage:
 *   MicroAnimations.shake(element)       // Error shake effect
 *   MicroAnimations.pop(element)         // Success pop
 *   MicroAnimations.pulse(element)       // Attention pulse
 *   MicroAnimations.countUp(el, 0, 100)  // Number counter animation
 *   MicroAnimations.fadeIn(element)      // Fade in entrance
 *   MicroAnimations.slideIn(element)     // Slide in from bottom
 *   MicroAnimations.bounce(element)      // Bounce effect
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MicroAnimations = {
    /**
     * Animation duration constants
     */
    duration: {
        fast: 150,
        normal: 300,
        slow: 500,
        slower: 800
    },

    /**
     * Animation easing presets
     */
    easing: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },

    /**
     * Play animation class on element
     * @param {Element} element
     * @param {string} animationClass
     * @param {Function} callback - Called after animation completes
     */
    play(element, animationClass, callback) {
        if (!element) return;

        element.classList.add(animationClass);
        element.style.animation = `${animationClass} ${this.duration.normal}ms ease forwards`;

        const handleEnd = () => {
            element.classList.remove(animationClass);
            element.style.animation = '';
            element.removeEventListener('animationend', handleEnd);
            callback?.();
        };

        element.addEventListener('animationend', handleEnd);
    },

    /**
     * Shake animation (for errors)
     * @param {Element} element
     */
    shake(element) {
        if (!element) return;

        const keyframes = [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-8px)' },
            { transform: 'translateX(8px)' },
            { transform: 'translateX(-8px)' },
            { transform: 'translateX(8px)' },
            { transform: 'translateX(0)' }
        ];

        element.animate(keyframes, {
            duration: 400,
            easing: 'ease-in-out'
        });
    },

    /**
     * Pop animation (for success)
     * @param {Element} element
     */
    pop(element) {
        if (!element) return;

        const keyframes = [
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1.1)', opacity: 1 },
            { transform: 'scale(1)', opacity: 1 }
        ];

        element.animate(keyframes, {
            duration: 400,
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });
    },

    /**
     * Pulse animation (for attention)
     * @param {Element} element
     * @param {number} times - Number of pulses
     */
    pulse(element, times = 1) {
        if (!element) return;

        const keyframes = [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.1)', opacity: 0.8 },
            { transform: 'scale(1)', opacity: 1 }
        ];

        element.animate(keyframes, {
            duration: 600,
            easing: 'ease-in-out',
            iterations: times
        });
    },

    /**
     * Bounce animation
     * @param {Element} element
     */
    bounce(element) {
        if (!element) return;

        const keyframes = [
            { transform: 'translateY(0)', opacity: 0 },
            { transform: 'translateY(-20px)', opacity: 0.5 },
            { transform: 'translateY(0)', opacity: 1 }
        ];

        element.animate(keyframes, {
            duration: 500,
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });
    },

    /**
     * Fade in animation
     * @param {Element} element
     * @param {Object} options
     */
    fadeIn(element, options = {}) {
        if (!element) return;

        const { fromOpacity = 0, duration = 300 } = options;

        element.style.opacity = fromOpacity;
        element.style.transition = `opacity ${duration}ms ease`;

        requestAnimationFrame(() => {
            element.style.opacity = 1;
        });
    },

    /**
     * Fade out animation
     * @param {Element} element
     * @param {Function} callback - Called after fade out
     */
    fadeOut(element, callback) {
        if (!element) return;

        element.style.transition = 'opacity 300ms ease, transform 300ms ease';
        element.style.opacity = 0;

        setTimeout(() => {
            callback?.();
        }, 300);
    },

    /**
     * Slide up animation
     * @param {Element} element
     */
    slideUp(element) {
        if (!element) return;

        element.style.transition = 'transform 400ms ease, opacity 400ms ease';
        element.style.transform = 'translateY(-20px)';
        element.style.opacity = 0;
    },

    /**
     * Slide down animation
     * @param {Element} element
     */
    slideDown(element) {
        if (!element) return;

        element.style.transition = 'transform 400ms ease, opacity 400ms ease';
        element.style.transform = 'translateY(20px)';
        element.style.opacity = 0;
    },

    /**
     * Zoom in animation
     * @param {Element} element
     */
    zoomIn(element) {
        if (!element) return;

        const keyframes = [
            { transform: 'scale(0.9)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 }
        ];

        element.animate(keyframes, {
            duration: 400,
            easing: 'ease-out'
        });
    },

    /**
     * Count up animation for numbers
     * @param {Element} element
     * @param {number} from - Starting number
     * @param {number} to - Ending number
     * @param {Object} options
     */
    countUp(element, from, to, options = {}) {
        if (!element) return;

        const {
            duration = 2000,
            prefix = '',
            suffix = '',
            decimals = 0
        } = options;

        const startTime = performance.now();
        const startValue = from;
        const endValue = to;

        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);

            const currentValue = startValue + (endValue - startValue) * easedProgress;

            element.textContent = prefix + currentValue.toFixed(decimals) + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    /**
     * Typewriter text animation
     * @param {Element} element
     * @param {string} text
     * @param {number} speed - Characters per second
     */
    typeWriter(element, text, speed = 50) {
        if (!element) return;

        let index = 0;
        element.textContent = '';

        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, 1000 / speed);
            }
        };

        type();
    },

    /**
     * Gradient shift animation for buttons
     * @param {Element} element
     */
    gradientShift(element) {
        if (!element) return;

        element.style.backgroundSize = '200% 200%';
        element.style.transition = 'background-position 400ms ease';

        element.addEventListener('mouseenter', () => {
            element.style.backgroundPosition = '100% 50%';
        });

        element.addEventListener('mouseleave', () => {
            element.style.backgroundPosition = '0% 50%';
        });
    },

    /**
     * Stagger animation for list items
     * @param {NodeList|Element[]} items
     * @param {string} animationClass
     * @param {number} delay - Delay between items in ms
     */
    stagger(items, animationClass = 'stagger-item', delay = 50) {
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * delay}ms`;
            this.play(item, animationClass);
        });
    },

    /**
     * Parallax scroll effect
     * @param {Element} element
     * @param {number} speed - Parallax speed (0-1)
     */
    parallax(element, speed = 0.5) {
        if (!element) return;

        const handleScroll = () => {
            const rect = element.getBoundingClientRect();
            const offset = (window.innerHeight - rect.top) * speed;
            element.style.transform = `translateY(${offset}px)`;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial call

        return () => window.removeEventListener('scroll', handleScroll);
    },

    /**
     * Magnetic pull effect (element follows cursor)
     * @param {Element} element
     * @param {number} strength - Pull strength (0-1)
     */
    magneticPull(element, strength = 0.3) {
        if (!element) return;

        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
        });
    },

    /**
     * Reveal text animation (character by character)
     * @param {Element} element
     */
    revealText(element) {
        if (!element) return;

        const text = element.textContent;
        element.textContent = '';
        element.style.display = 'inline-block';

        const words = text.split(' ');
        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';

            [...word].forEach((char, charIndex) => {
                const charSpan = document.createElement('span');
                charSpan.textContent = char;
                charSpan.style.display = 'inline-block';
                charSpan.style.opacity = '0';
                charSpan.style.transform = 'translateY(20px)';
                charSpan.style.transition = `all ${this.duration.normal}ms ease`;
                charSpan.style.transitionDelay = `${(wordIndex * 100) + (charIndex * 50)}ms`;

                wordSpan.appendChild(charSpan);
            });

            if (wordIndex < words.length - 1) {
                wordSpan.appendChild(document.createTextNode(' '));
            }

            element.appendChild(wordSpan);
        });

        // Trigger animation
        requestAnimationFrame(() => {
            element.querySelectorAll('span span').forEach(span => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            });
        });
    },

    /**
     * Initialize all button hover animations
     */
    initButtons() {
        document.querySelectorAll('.btn-gradient-shift').forEach(btn => {
            this.gradientShift(btn);
        });

        document.querySelectorAll('.btn-magnetic').forEach(btn => {
            this.magneticPull(btn, 0.2);
        });
    },

    /**
     * Initialize all card hover animations
     */
    initCards() {
        document.querySelectorAll('.card-hover-shine').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--shine-x', `${x}px`);
                card.style.setProperty('--shine-y', `${y}px`);
            });
        });
    },

    /**
     * Ripple effect for buttons (Material Design)
     * @param {Element} button
     */
    ripple(button, event) {
        if (!button) return;

        const existingRipple = button.querySelector('.ripple-effect');
        if (existingRipple) existingRipple.remove();

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = (event?.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
        const y = (event?.clientY || rect.top + rect.height / 2) - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple-effect 600ms ease-out;
            pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    },

    /**
     * Flip animation for cards
     * @param {Element} element
     * @param {Element} front
     * @param {Element} back
     */
    flip(element, front, back) {
        if (!element || !front || !back) return;

        element.style.perspective = '1000px';
        front.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1), opacity 600ms ease';
        back.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1), opacity 600ms ease';
        back.style.opacity = '0';
        back.style.transform = 'rotateY(180deg)';

        let isFlipped = false;

        element.addEventListener('click', () => {
            isFlipped = !isFlipped;
            if (isFlipped) {
                front.style.transform = 'rotateY(-180deg)';
                front.style.opacity = '0';
                back.style.transform = 'rotateY(0)';
                back.style.opacity = '1';
            } else {
                front.style.transform = 'rotateY(0)';
                front.style.opacity = '1';
                back.style.transform = 'rotateY(180deg)';
                back.style.opacity = '0';
            }
        });
    },

    /**
     * Glow effect on hover
     * @param {Element} element
     * @param {string} color - Glow color
     */
    glow(element, color = 'rgba(99, 102, 241, 0.5)') {
        if (!element) return;

        element.style.transition = 'box-shadow 300ms ease, transform 300ms ease';

        element.addEventListener('mouseenter', () => {
            element.style.boxShadow = `0 0 30px ${color}`;
            element.style.transform = 'translateY(-4px)';
        });

        element.addEventListener('mouseleave', () => {
            element.style.boxShadow = 'none';
            element.style.transform = 'translateY(0)';
        });
    },

    /**
     * Wave animation for text
     * @param {Element} element
     */
    waveText(element) {
        if (!element) return;

        const text = element.textContent;
        element.textContent = '';
        element.style.display = 'inline-block';

        [...text].forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.style.animation = `wave 1.5s ease-in-out infinite`;
            span.style.animationDelay = `${index * 0.1}s`;
            element.appendChild(span);
        });
    },

    /**
     * Tilt effect (3D perspective follow cursor)
     * @param {Element} element
     * @param {number} maxTilt - Maximum tilt in degrees
     */
    tilt(element, maxTilt = 15) {
        if (!element) return;

        element.style.transformStyle = 'preserve-3d';

        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -maxTilt;
            const rotateY = ((x - centerX) / centerX) * maxTilt;

            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    },

    /**
     * Progress ring animation
     * @param {Element} element
     * @param {number} progress - Progress 0-100
     * @param {number} duration - Animation duration in ms
     */
    progressRing(element, progress, duration = 1000) {
        if (!element) return;

        const circle = element.querySelector('circle') || element.querySelector('.progress-ring__circle');
        if (!circle) return;

        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        circle.style.transition = `stroke-dashoffset ${duration}ms ease-in-out`;

        requestAnimationFrame(() => {
            const offset = circumference - (progress / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        });
    },

    /**
     * Intersection Observer helper for scroll animations
     * @param {Element} element
     * @param {string} animationClass
     * @param {Object} options
     */
    observeAnimate(element, animationClass = 'fade-in-up', options = {}) {
        if (!element) return;

        const { threshold = 0.1, rootMargin = '0px' } = options;

        element.style.opacity = '0';
        element.style.willChange = 'transform, opacity';

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    element.classList.add(animationClass);
                    element.style.opacity = '1';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold, rootMargin });

        observer.observe(element);
    },

    /**
     * Initialize scroll-triggered animations
     */
    initScrollAnimations() {
        document.querySelectorAll('[data-animate]').forEach(el => {
            const animation = el.getAttribute('data-animate') || 'fade-in-up';
            this.observeAnimate(el, animation);
        });
    }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INITIALIZATION
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        MicroAnimations.initButtons();
        MicroAnimations.initCards();
        MicroAnimations.initScrollAnimations();

        // Add ripple effect to all buttons
        document.querySelectorAll('.btn, button, [role="button"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                MicroAnimations.ripple(btn, e);
            });
        });

        // Add tilt effect to cards
        document.querySelectorAll('.card, .widget').forEach(card => {
            MicroAnimations.tilt(card, 10);
        });
    });
}

// Export for module usage
// Export for ES modules
export default { MicroAnimations };

// Global access
window.MicroAnimations = MicroAnimations;
