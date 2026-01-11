/* ==========================================================================
   🏆 AGENCY PRO WOW - JavaScript Effects
   Premium Marketing Agency Interactive Layer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ══════════════════════════════════════════════════════════════════
    // 1. FLOATING PARTICLES SYSTEM
    // ══════════════════════════════════════════════════════════════════
    function initParticles() {
        const container = document.querySelector('.particles-container');
        if (!container) {
            const particlesDiv = document.createElement('div');
            particlesDiv.className = 'particles-container';
            document.body.insertBefore(particlesDiv, document.body.firstChild);
            createParticles(particlesDiv);
        } else {
            createParticles(container);
        }
    }

    function createParticles(container) {
        const colors = ['', 'glow-pink', 'glow-gold', 'glow-cyan'];
        const particleCount = window.innerWidth < 768 ? 20 : 40;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${colors[Math.floor(Math.random() * colors.length)]}`;

            // Random positioning and timing
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.animationDuration = `${15 + Math.random() * 20}s`;
            particle.style.animationDelay = `${Math.random() * -30}s`;
            particle.style.width = `${2 + Math.random() * 4}px`;
            particle.style.height = particle.style.width;

            container.appendChild(particle);
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // 2. MORPHING BLOBS INJECTION
    // ══════════════════════════════════════════════════════════════════
    function initMorphingBlobs() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Check if blobs already exist
        if (hero.querySelector('.morphing-blob')) return;

        const blobHTML = `
            <div class="morphing-blob blob-1"></div>
            <div class="morphing-blob blob-2"></div>
            <div class="morphing-blob blob-3"></div>
        `;
        hero.insertAdjacentHTML('afterbegin', blobHTML);
    }

    // ══════════════════════════════════════════════════════════════════
    // 3. ANIMATED STATS COUNTER
    // ══════════════════════════════════════════════════════════════════
    function initStatsSection() {
        // Check if stats section already exists
        if (document.querySelector('.stats-section')) return;

        const trustSection = document.querySelector('.trust');
        if (!trustSection) return;

        const statsHTML = `
            <section class="stats-section reveal-section">
                <div class="stats-grid">
                    <div class="stat-card reveal-item">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-number"><span class="counter" data-target="100">0</span>+</div>
                        <div class="stat-label">Khách Hàng</div>
                    </div>
                    <div class="stat-card reveal-item">
                        <div class="stat-icon">📈</div>
                        <div class="stat-number"><span class="counter" data-target="500">0</span>%</div>
                        <div class="stat-label">Tăng Trưởng TB</div>
                    </div>
                    <div class="stat-card reveal-item">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-number"><span class="counter" data-target="5">0</span>.0</div>
                        <div class="stat-label">Đánh Giá</div>
                    </div>
                    <div class="stat-card reveal-item">
                        <div class="stat-icon">🚀</div>
                        <div class="stat-number"><span class="counter" data-target="3">0</span>+</div>
                        <div class="stat-label">Năm Kinh Nghiệm</div>
                    </div>
                </div>
            </section>
        `;
        trustSection.insertAdjacentHTML('afterend', statsHTML);
    }

    function animateCounters() {
        const counters = document.querySelectorAll('.counter:not(.animated)');

        counters.forEach(counter => {
            const rect = counter.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                counter.classList.add('animated');
                const target = parseInt(counter.dataset.target);
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                updateCounter();
            }
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // 4. FLOATING ACHIEVEMENT BADGES
    // ══════════════════════════════════════════════════════════════════
    function initFloatingBadges() {
        const hero = document.querySelector('.hero');
        if (!hero || hero.querySelector('.floating-badges')) return;

        const badgesHTML = `
            <div class="floating-badges">
                <div class="floating-badge badge-1">
                    <span class="badge-icon">🏆</span>
                    <span class="badge-number">100+</span>
                    <span>Khách Hàng</span>
                </div>
                <div class="floating-badge badge-2">
                    <span class="badge-icon">⭐</span>
                    <span class="badge-number">5.0</span>
                    <span>Rating</span>
                </div>
                <div class="floating-badge badge-3">
                    <span class="badge-icon">📈</span>
                    <span class="badge-number">500%</span>
                    <span>Growth</span>
                </div>
                <div class="floating-badge badge-4">
                    <span class="badge-icon">🎯</span>
                    <span class="badge-number">24/7</span>
                    <span>Support</span>
                </div>
            </div>
        `;
        hero.insertAdjacentHTML('beforeend', badgesHTML);
    }

    // ══════════════════════════════════════════════════════════════════
    // 5. CLIENT LOGO CAROUSEL
    // ══════════════════════════════════════════════════════════════════
    function initClientsCarousel() {
        if (document.querySelector('.clients-section')) return;

        const statsSection = document.querySelector('.stats-section');
        if (!statsSection) return;

        const clientsHTML = `
            <section class="clients-section">
                <div class="clients-title">Được Tin Tưởng Bởi Doanh Nghiệp Địa Phương</div>
                <div class="clients-track">
                    <div class="client-placeholder">🌸 Hoa Sen Việt</div>
                    <div class="client-placeholder">🍜 Phở Sài Gòn</div>
                    <div class="client-placeholder">🏠 Nội Thất Miền Tây</div>
                    <div class="client-placeholder">🛒 Siêu Thị Tân Bình</div>
                    <div class="client-placeholder">🌾 Gạo Đồng Tháp</div>
                    <div class="client-placeholder">🎂 Bánh Ngọt Sài Gòn</div>
                    <div class="client-placeholder">🌸 Hoa Sen Việt</div>
                    <div class="client-placeholder">🍜 Phở Sài Gòn</div>
                    <div class="client-placeholder">🏠 Nội Thất Miền Tây</div>
                    <div class="client-placeholder">🛒 Siêu Thị Tân Bình</div>
                    <div class="client-placeholder">🌾 Gạo Đồng Tháp</div>
                    <div class="client-placeholder">🎂 Bánh Ngọt Sài Gòn</div>
                </div>
            </section>
        `;
        statsSection.insertAdjacentHTML('afterend', clientsHTML);
    }

    // ══════════════════════════════════════════════════════════════════
    // 6. MARQUEE TEXT EFFECT
    // ══════════════════════════════════════════════════════════════════
    function initMarquee() {
        if (document.querySelector('.marquee-container')) return;

        const footer = document.querySelector('.footer');
        if (!footer) return;

        const marqueeHTML = `
            <div class="marquee-container">
                <div class="marquee-text">
                    <span>MARKETING</span>
                    <span class="highlight">•</span>
                    <span>THỰC CHIẾN</span>
                    <span class="highlight">•</span>
                    <span>SA ĐÉC</span>
                    <span class="highlight">•</span>
                    <span>TĂNG TRƯỞNG</span>
                    <span class="highlight">•</span>
                    <span>MARKETING</span>
                    <span class="highlight">•</span>
                    <span>THỰC CHIẾN</span>
                    <span class="highlight">•</span>
                    <span>SA ĐÉC</span>
                    <span class="highlight">•</span>
                    <span>TĂNG TRƯỞNG</span>
                    <span class="highlight">•</span>
                </div>
            </div>
        `;
        footer.insertAdjacentHTML('beforebegin', marqueeHTML);
    }

    // ══════════════════════════════════════════════════════════════════
    // 7. REVEAL ON SCROLL
    // ══════════════════════════════════════════════════════════════════
    function initRevealSections() {
        // Add reveal class to existing sections
        const sections = document.querySelectorAll('.trust, .comparison, .offer, .testimonials, .faq, .contact');
        sections.forEach(section => {
            if (!section.classList.contains('reveal-section')) {
                section.classList.add('reveal-section');
            }
        });

        // Add reveal-item class to children
        document.querySelectorAll('.trust__item, .stat-card, .offer__card, .testimonial-card, .faq__item').forEach(item => {
            if (!item.classList.contains('reveal-item')) {
                item.classList.add('reveal-item');
            }
        });

        // Observe for visibility
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal-section').forEach(section => {
            observer.observe(section);
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // 8. SPOTLIGHT EFFECT ON CARDS
    // ══════════════════════════════════════════════════════════════════
    function initSpotlightEffect() {
        const cards = document.querySelectorAll('.trust__item, .stat-card, .offer__card');

        cards.forEach(card => {
            card.classList.add('spotlight-card');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
            });
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // 9. NOISE TEXTURE OVERLAY
    // ══════════════════════════════════════════════════════════════════
    function initNoiseOverlay() {
        if (document.querySelector('.noise-overlay')) return;

        const noise = document.createElement('div');
        noise.className = 'noise-overlay';
        document.body.appendChild(noise);
    }

    // ══════════════════════════════════════════════════════════════════
    // 10. ENHANCED PARALLAX ON BLOBS
    // ══════════════════════════════════════════════════════════════════
    function initBlobParallax() {
        const blobs = document.querySelectorAll('.morphing-blob');
        if (blobs.length === 0) return;

        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            blobs.forEach((blob, index) => {
                const speed = (index + 1) * 20;
                blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // 11. TEXT REVEAL ANIMATION FOR HERO (DISABLED - causes visibility issues)
    // ══════════════════════════════════════════════════════════════════
    function initTextReveal() {
        // DISABLED: This animation was causing text to be invisible
        // The headline now shows immediately with full visibility
        const headline = document.querySelector('.hero__headline');
        if (headline) {
            headline.style.opacity = '1';
            headline.style.visibility = 'visible';
        }
        return; // Exit early - animation disabled
    }

    // ══════════════════════════════════════════════════════════════════
    // INITIALIZE ALL EFFECTS
    // ══════════════════════════════════════════════════════════════════
    function init() {
        // Wait for warp loader to finish
        setTimeout(() => {
            initParticles();
            initMorphingBlobs();
            initFloatingBadges();
            initStatsSection();
            initClientsCarousel();
            initMarquee();
            initNoiseOverlay();

            // After DOM updates
            setTimeout(() => {
                initRevealSections();
                initSpotlightEffect();
                initBlobParallax();
                initTextReveal();
            }, 100);
        }, 2000); // After warp loader

        // Counter animation on scroll
        window.addEventListener('scroll', animateCounters);
        animateCounters(); // Initial check
    }

    init();

    // Console branding
    console.log('%c🏆 Agency Pro WOW', 'font-size: 20px; font-weight: bold; color: #E91E63;');
    console.log('%cMarketing Agency Premium Effects Loaded', 'color: #FFC107;');
});
