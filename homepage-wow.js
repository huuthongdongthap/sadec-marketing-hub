/* ==========================================================================
   🌟 HOMEPAGE WOW - SA ĐÉC MARKETING HUB 2026
   JavaScript: Warp Loader, Cursor Glow, Confetti, Magnetic Buttons, Sound UI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ═══════════════════════════════════════════════════════════════
    // 1. WARP SPEED LOADER
    // ═══════════════════════════════════════════════════════════════
    const warpLoader = document.getElementById('warpLoader');
    const warpLines = document.getElementById('warpLines');

    if (warpLoader && warpLines) {
        // Create warp speed lines
        for (let i = 0; i < 60; i++) {
            const line = document.createElement('div');
            line.className = 'warp-line';
            line.style.left = Math.random() * 100 + '%';
            line.style.animationDelay = Math.random() * 0.6 + 's';
            line.style.animationDuration = (0.4 + Math.random() * 0.4) + 's';
            line.style.opacity = 0.3 + Math.random() * 0.7;
            warpLines.appendChild(line);
        }

        // Hide loader after 1.8 seconds
        setTimeout(() => {
            warpLoader.classList.add('hidden');
            // Remove from DOM after fade out
            setTimeout(() => warpLoader.remove(), 600);
        }, 1800);
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. CURSOR GLOW TRAIL
    // ═══════════════════════════════════════════════════════════════
    // Only on desktop
    if (window.innerWidth > 768) {
        const cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        document.body.appendChild(cursorGlow);

        const cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        document.body.appendChild(cursorDot);

        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        // Smooth glow follow
        function animateGlow() {
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            requestAnimationFrame(animateGlow);
        }
        animateGlow();

        // Scale cursor on interactive elements
        document.querySelectorAll('button, a, .trust__item, .btn').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.style.transform = 'translate(-50%, -50%) scale(2.5)';
                cursorGlow.style.opacity = '0.3';
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorGlow.style.opacity = '1';
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. AURORA PARALLAX (Mouse Tracking)
    // ═══════════════════════════════════════════════════════════════
    const auroraOrbs = document.querySelectorAll('.aurora-orb');

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        auroraOrbs.forEach((orb, index) => {
            const speed = (index + 1) * 8;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 4. 3D TILT EFFECT ON TRUST CARDS
    // ═══════════════════════════════════════════════════════════════
    const trustItems = document.querySelectorAll('.trust__item');

    trustItems.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 5. CONFETTI EXPLOSION
    // ═══════════════════════════════════════════════════════════════
    function createConfetti(x, y, count = 40) {
        const colors = ['#E91E63', '#FFC107', '#00d4ff', '#b26efd', '#4CAF50'];

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.width = (5 + Math.random() * 10) + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.style.animationDelay = (Math.random() * 0.3) + 's';

            // Random spread direction
            const spreadX = (Math.random() - 0.5) * 200;
            const spreadY = (Math.random() - 0.5) * 100;
            confetti.style.marginLeft = spreadX + 'px';
            confetti.style.marginTop = spreadY + 'px';

            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }
    }

    // Attach to primary buttons
    document.querySelectorAll('.btn--primary, .header__zalo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            createConfetti(e.clientX, e.clientY, 50);
            btn.classList.add('success-flash');
            setTimeout(() => btn.classList.remove('success-flash'), 600);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 6. MAGNETIC BUTTON EFFECT
    // ═══════════════════════════════════════════════════════════════
    document.querySelectorAll('.btn, .header__zalo-btn').forEach(btn => {
        btn.classList.add('magnetic-btn');

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 7. SOUND UI FEEDBACK
    // ═══════════════════════════════════════════════════════════════
    let audioContext = null;

    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    function playClickSound() {
        if (!audioContext || audioContext.state === 'suspended') return;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = 600;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.1);
    }

    function playSuccessChime() {
        if (!audioContext || audioContext.state === 'suspended') return;

        // Note 1: C5
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.frequency.value = 523.25;
        osc1.type = 'sine';
        gain1.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
        osc1.start(audioContext.currentTime);
        osc1.stop(audioContext.currentTime + 0.25);

        // Note 2: E5 (delayed)
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 659.25;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.25);
        }, 80);

        // Note 3: G5 (delayed more)
        setTimeout(() => {
            const osc3 = audioContext.createOscillator();
            const gain3 = audioContext.createGain();
            osc3.connect(gain3);
            gain3.connect(audioContext.destination);
            osc3.frequency.value = 783.99;
            osc3.type = 'sine';
            gain3.gain.setValueAtTime(0.08, audioContext.currentTime);
            gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            osc3.start(audioContext.currentTime);
            osc3.stop(audioContext.currentTime + 0.3);
        }, 160);
    }

    // Enable audio on first interaction
    document.addEventListener('click', function enableAudio() {
        initAudio();
        document.removeEventListener('click', enableAudio);
    }, { once: true });

    // Attach sounds
    document.querySelectorAll('button, .btn, a').forEach(el => {
        el.addEventListener('click', playClickSound);
    });

    document.querySelectorAll('.btn--primary').forEach(btn => {
        btn.addEventListener('click', playSuccessChime);
    });

    // ═══════════════════════════════════════════════════════════════
    // 8. SCROLL REVEAL ANIMATION
    // ═══════════════════════════════════════════════════════════════
    const revealElements = document.querySelectorAll('.trust__item, .offer__card, .testimonial-card');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });

    // ═══════════════════════════════════════════════════════════════
    // 9. HEADER SCROLL EFFECT
    // ═══════════════════════════════════════════════════════════════
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // 10. CONSOLE BRANDING
    // ═══════════════════════════════════════════════════════════════
    console.log('%c🌸 Sa Đéc Marketing Hub', 'font-size: 24px; font-weight: bold; color: #E91E63;');
    console.log('%c2026 WOW Edition Loaded', 'font-size: 14px; color: #FFC107;');
    console.log('%c✨ Effects: Aurora, Cursor Glow, Confetti, Sound UI', 'font-size: 11px; color: #00d4ff;');
});
