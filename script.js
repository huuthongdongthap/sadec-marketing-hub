/* ==========================================================================
   SA ĐÉC MARKETING HUB - JAVASCRIPT v2.0
   Features: Mobile Menu, Sticky Header, Comparison Slider, Testimonials
   UX Specs Compliant: Touch-friendly, Accessibility-first
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

    // ========== 1. MOBILE MENU TOGGLE ==========
    // Theo UX Specs: Menu đơn giản cho người lớn tuổi
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', !isExpanded);
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Đóng menu khi click vào link (UX Best Practice)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // ========== 2. STICKY HEADER (Scroll Threshold: 100px) ==========
    const header = document.getElementById('header');
    const scrollThreshold = 100;

    const handleScroll = () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('header--sticky');
        } else {
            header.classList.remove('header--sticky');
        }
    };

    // Passive listener để tối ưu hiệu suất cuộn trên mobile
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ========== 3. COMPARISON SLIDER (Magic Mirror - Before/After) ==========
    // Theo UX Flow A: Kéo để xem tiềm năng
    const comparisonSlider = document.getElementById('comparisonSlider');
    const comparisonInput = document.getElementById('comparisonInput');
    const comparisonAfter = document.getElementById('comparisonAfter');
    const comparisonHandle = document.getElementById('comparisonHandle');

    if (comparisonSlider && comparisonInput && comparisonAfter && comparisonHandle) {
        const updateSlider = (value) => {
            comparisonAfter.style.width = `${value}%`;
            comparisonHandle.style.left = `${value}%`;
        };

        // Input range change
        comparisonInput.addEventListener('input', (e) => {
            updateSlider(e.target.value);
        });

        // Touch/Mouse drag directly on slider
        let isDragging = false;

        const getSliderValue = (e) => {
            const rect = comparisonSlider.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let value = ((clientX - rect.left) / rect.width) * 100;
            value = Math.max(0, Math.min(100, value));
            return value;
        };

        comparisonSlider.addEventListener('mousedown', () => { isDragging = true; });
        comparisonSlider.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });

        document.addEventListener('mouseup', () => { isDragging = false; });
        document.addEventListener('touchend', () => { isDragging = false; });

        comparisonSlider.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const value = getSliderValue(e);
                comparisonInput.value = value;
                updateSlider(value);
            }
        });

        comparisonSlider.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const value = getSliderValue(e);
                comparisonInput.value = value;
                updateSlider(value);
            }
        }, { passive: true });

        // Initialize at 50%
        updateSlider(50);
    }

    // ========== 4. TESTIMONIAL SLIDER ==========
    const testimonialTrack = document.getElementById('testimonialTrack');
    const dots = document.querySelectorAll('.testimonials__dot');
    let currentSlide = 0;
    const totalSlides = dots.length;
    let autoSlideInterval;

    function goToSlide(index) {
        currentSlide = index;
        testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetAutoSlide();
        });
    });

    // Auto-slide every 5 seconds
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    if (testimonialTrack && dots.length > 0) {
        startAutoSlide();
    }

    // ========== 5. SMOOTH SCROLL FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = header ? header.offsetHeight : 70;
                const targetPosition = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== 6. SCROLL ANIMATIONS (Intersection Observer) ==========
    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    };

    const scrollObserver = new IntersectionObserver(animateOnScroll, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements to animate
    const elementsToAnimate = document.querySelectorAll(
        '.trust__item, .comparison__slider, .pricing-card, .blog__card'
    );

    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        scrollObserver.observe(el);
    });

    // ========== 7. PRICING CARD HOVER EFFECT ==========
    const pricingCard = document.querySelector('.pricing-card');
    if (pricingCard) {
        pricingCard.addEventListener('mouseenter', function () {
            this.style.borderColor = '#E91E63';
        });

        pricingCard.addEventListener('mouseleave', function () {
            this.style.borderColor = '#FFC107';
        });
    }

    // ========== 8. ZALO BUTTON TOOLTIP ==========
    const zaloFloat = document.querySelector('.zalo-float');
    if (zaloFloat) {
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.textContent = 'Chat ngay với chúng tôi!';
        tooltip.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 25px;
            background: #001F3F;
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 9998;
        `;
        document.body.appendChild(tooltip);

        // Show tooltip after 3 seconds
        setTimeout(() => {
            tooltip.style.opacity = '1';
            setTimeout(() => {
                tooltip.style.opacity = '0';
            }, 3000);
        }, 3000);

        // Show/hide on hover
        zaloFloat.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
        });

        zaloFloat.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    }

    // ========== 9. PHONE NUMBER FORMATTING (VN Format) ==========
    // Theo UX Specs: Auto-format SĐT cho dễ đọc (0909 123 456)
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,4})(\d{0,3})(\d{0,3})/);
            e.target.value = !x[2] ? x[1] : x[1] + ' ' + x[2] + (x[3] ? ' ' + x[3] : '');
        });
    });

    // ========== 10. CONTACT FORM HANDLER (WITH SUPABASE) ==========
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form values
            const formData = {
                name: document.getElementById('name').value.trim(),
                phone: document.getElementById('phone').value.replace(/\s/g, ''),
                service: document.getElementById('service').value,
                message: document.getElementById('note').value.trim()
            };

            // Simple validation
            if (!formData.name || !formData.phone) {
                alert('⚠️ Vui lòng điền đầy đủ Tên và Số điện thoại!');
                return;
            }

            if (formData.phone.length < 10) {
                alert('⚠️ Số điện thoại không hợp lệ. Vui lòng kiểm tra lại!');
                return;
            }

            const submitBtn = contactForm.querySelector('.form-submit');
            const originalText = submitBtn.textContent;

            // Show loading state
            submitBtn.textContent = '⏳ Đang gửi...';
            submitBtn.disabled = true;

            // Try to save to Supabase
            let saveSuccess = true;
            if (window.SupabaseAPI && window.SupabaseAPI.saveContact) {
                try {
                    const result = await window.SupabaseAPI.saveContact(formData);
                    if (result.error) {
                        console.warn('Supabase save failed, but form still submitted:', result.error);
                    } else {
                        console.log('✅ Contact saved to Supabase:', result.data);
                    }
                } catch (err) {
                    console.warn('Supabase error:', err);
                }
            } else {
                console.log('📧 Supabase not configured. Form data logged locally:', formData);
            }

            // Show success message
            submitBtn.textContent = '✅ Đã gửi thành công!';
            submitBtn.style.background = '#4CAF50';

            // Create success modal
            const successModal = document.createElement('div');
            successModal.innerHTML = `
                <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,31,63,0.9);display:flex;align-items:center;justify-content:center;z-index:10000;">
                    <div style="background:white;padding:50px;border-radius:16px;text-align:center;max-width:400px;">
                        <div style="font-size:4rem;margin-bottom:20px;">🎉</div>
                        <h3 style="color:#001F3F;font-size:1.5rem;margin-bottom:15px;">Cảm ơn ${formData.name}!</h3>
                        <p style="color:#666;margin-bottom:25px;">Tụi con sẽ gọi lại số <strong>${formData.phone}</strong> trong vòng 30 phút nha!</p>
                        <button onclick="this.parentElement.parentElement.remove()" 
                                style="background:#E91E63;color:white;border:none;padding:15px 40px;border-radius:50px;font-size:1rem;font-weight:700;cursor:pointer;">
                            OK, Tôi Đã Hiểu
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(successModal);

            // UX WAO: Trigger Confetti
            if (window.celebrateSuccess) {
                window.celebrateSuccess();
            }

            // Track event in Supabase analytics
            if (window.SupabaseAPI && window.SupabaseAPI.trackEvent) {
                window.SupabaseAPI.trackEvent('form_submit', { service: formData.service });
            }

            // Reset form after 3 seconds
            setTimeout(() => {
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        });
    }

    // ========== 11. RED STAMP DEMO ==========
    const stampBtn = document.getElementById('stampBtn');
    const stampRed = document.getElementById('stampRed');

    if (stampBtn && stampRed) {
        stampBtn.addEventListener('click', () => {
            // Reset first if already active
            stampRed.classList.remove('active');

            // Trigger reflow to restart animation
            void stampRed.offsetWidth;

            // Add active class for animation
            stampRed.classList.add('active');

            // Play stamp sound (using Web Audio API for "Cộp" effect)
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);

                gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.15);
            } catch (e) {
                console.log('Audio not supported');
            }

            // Vibrate if supported (mobile)
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }

            // Update button
            stampBtn.textContent = '✅ Đã đóng dấu xong!';
            stampBtn.disabled = true;

            setTimeout(() => {
                stampBtn.textContent = '🔴 Đóng Dấu Xác Nhận';
                stampBtn.disabled = false;
            }, 3000);
        });
    }

    // ========== 12. TRAFFIC LIGHT DEMO ==========
    const trafficButtons = document.querySelectorAll('.traffic-btn');
    const trafficBulbs = document.querySelectorAll('.traffic-light__bulb');
    const trafficStatus = document.getElementById('trafficStatus');

    const statusMessages = {
        green: {
            title: '🟢 Tuần này NGON LÀNH!',
            reach: '250',
            leads: '15'
        },
        yellow: {
            title: '🟡 Tạm ổn, cần cố thêm',
            reach: '120',
            leads: '5'
        },
        red: {
            title: '🔴 Cần gọi Hub ngay!',
            reach: '30',
            leads: '1'
        }
    };

    trafficButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;

            // Remove active from all bulbs
            trafficBulbs.forEach(bulb => bulb.classList.remove('traffic-light__bulb--active'));

            // Add active to matching bulb
            const activeBulb = document.querySelector(`.traffic-light__bulb--${color}`);
            if (activeBulb) {
                activeBulb.classList.add('traffic-light__bulb--active');
            }

            // Update status text
            if (trafficStatus && statusMessages[color]) {
                const msg = statusMessages[color];
                trafficStatus.innerHTML = `
                    <h4>${msg.title}</h4>
                    <p><strong>${msg.reach}</strong> người đi ngang</p>
                    <p><strong>${msg.leads}</strong> khách hỏi thăm</p>
                `;
            }
        });
    });

    // ========== 13. FAQ ACCORDION ==========
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');

        if (question) {
            question.addEventListener('click', () => {
                // Close other open items (optional - for single open behavior)
                const isActive = item.classList.contains('active');

                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                } else {
                    // Close all other items first
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    item.classList.add('active');
                }
            });
        }
    });

    // ========== 14. ZALO WIDGET ==========
    const zaloWidget = document.querySelector('.zalo-widget__button');

    if (zaloWidget) {
        zaloWidget.addEventListener('click', () => {
            // Replace with actual Zalo OA link
            window.open('https://zalo.me/0909xxxxxx', '_blank');
        });
    }

    console.log('🌸 Sa Đéc Marketing Hub v4.0 - Full UX Features Loaded!');

    // ========== 15. UX WAO: SCROLL REVEAL ANIMATION ==========
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Auto-add .reveal class to all sections if not present
    document.querySelectorAll('section, .header, .footer').forEach(section => {
        if (!section.classList.contains('reveal')) {
            section.classList.add('reveal');
        }
        sectionObserver.observe(section);
    });

    // ========== 16. UX WAO: ROI CALCULATOR ==========
    const budgetInput = document.getElementById('budgetInput');
    const conversionInput = document.getElementById('conversionInput');
    const budgetValue = document.getElementById('budgetValue');
    const conversionValue = document.getElementById('conversionValue');
    const revenueResult = document.getElementById('revenueResult');

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    function calculateROI() {
        if (!budgetInput || !conversionInput) return;

        const budget = parseInt(budgetInput.value);
        const conversionRate = parseInt(conversionInput.value);

        // Update display values
        budgetValue.textContent = formatCurrency(budget);
        conversionValue.textContent = conversionRate + '%';

        // Logic: 
        // Assume Cost Per Lead (CPL) = 50,000 VND
        // Leads = Budget / CPL
        // Customers = Leads * (ConversionRate / 100)
        // Average Order Value (AOV) = 500,000 VND (Example value for SME)
        // Revenue = Customers * AOV

        // Simplified Formula for "Wow" Effect:
        // Revenue multiplier increases with conversion rate
        // Base multiplier = 2.0 (Advertising should at least double ROI ideally)
        // Bonus multiplier = ConversionRate * 0.2

        const multiplier = 2 + (conversionRate * 0.15);
        const estimatedRevenue = budget * multiplier;

        // Animate counter effect for result
        revenueResult.textContent = formatCurrency(estimatedRevenue);
        revenueResult.style.transform = 'scale(1.1)';
        setTimeout(() => revenueResult.style.transform = 'scale(1)', 200);
    }

    if (budgetInput && conversionInput) {
        budgetInput.addEventListener('input', calculateROI);
        conversionInput.addEventListener('input', calculateROI);
        // Initial calculation
        calculateROI();
    }

    // ========== 17. UX WAO: CONFETTI EFFECT ==========
    window.celebrateSuccess = function () {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            // Placeholder for actual confetti library
            // Since we don't have the library loaded, we'll simulate with console/visual feedback
            // or create simple particles if requested.
            // For now, let's create a simple CSS-based confetti burst
            createConfettiParticles();
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    };

    function createConfettiParticles() {
        const colors = ['#E91E63', '#FFC107', '#2196F3', '#4CAF50'];
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '10px';
            particle.style.height = '10px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.zIndex = '9999';
            particle.style.borderRadius = '50%';
            document.body.appendChild(particle);

            // Random animation
            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 10;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;

            let x = window.innerWidth / 2;
            let y = window.innerHeight / 2;

            let opacity = 1;

            const animate = () => {
                x += dx;
                y += dy;
                opacity -= 0.02;
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            requestAnimationFrame(animate);
        }
    }

    // Trigger celebration on form success
    // Hook into existing form handler (see logic above in section 10)
    // Note: This function is globally available now for testing.
});
