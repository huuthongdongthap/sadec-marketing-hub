/* ==========================================================================
   🚀 AGENCYOS - MARKETING COMMAND CENTER 2026
   JavaScript: Interactivity, Animations, AI Focus Bar
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ═══════════════════════════════════════════════════════════════
    // 0. WOW: WARP SPEED LOADER
    // ═══════════════════════════════════════════════════════════════
    const warpLoader = document.getElementById('warpLoader');
    const warpLines = document.getElementById('warpLines');

    if (warpLoader && warpLines) {
        // Create warp speed lines
        for (let i = 0; i < 50; i++) {
            const line = document.createElement('div');
            line.className = 'warp-line';
            line.style.left = Math.random() * 100 + '%';
            line.style.animationDelay = Math.random() * 0.8 + 's';
            line.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
            warpLines.appendChild(line);
        }

        // Hide loader after 1.5 seconds
        setTimeout(() => {
            warpLoader.classList.add('hidden');
            // Remove from DOM after animation
            setTimeout(() => warpLoader.remove(), 500);
        }, 1500);
    }

    // ═══════════════════════════════════════════════════════════════
    // 1. FOCUS BAR (Command+K)
    // ═══════════════════════════════════════════════════════════════
    const focusBar = document.querySelector('.focus-bar__input');

    // ═══════════════════════════════════════════════════════════════
    // 1.5 MOBILE MENU TOGGLE (BUG FIX)
    // ═══════════════════════════════════════════════════════════════
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openMobileMenu() {
        mobileMenuToggle?.classList.add('active');
        sidebar?.classList.add('open');
        sidebarOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenuToggle?.classList.remove('active');
        sidebar?.classList.remove('open');
        sidebarOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileMenuToggle?.addEventListener('click', () => {
        if (sidebar?.classList.contains('open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    sidebarOverlay?.addEventListener('click', closeMobileMenu);

    // Keyboard shortcut: Cmd/Ctrl + K
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            focusBar?.focus();
        }

        // Escape to blur + close menu
        if (e.key === 'Escape') {
            focusBar?.blur();
            closeMobileMenu();
        }
    });

    // AI Command suggestions (demo)
    if (focusBar) {
        focusBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            // Future: Implement AI autocomplete
            console.log('🤖 AI Query:', query);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. LIVE TICKER - Duplicate for seamless scroll
    // ═══════════════════════════════════════════════════════════════
    const tickerTrack = document.querySelector('.ticker__track');
    if (tickerTrack) {
        // Clone ticker items for infinite scroll
        const clone = tickerTrack.innerHTML;
        tickerTrack.innerHTML += clone;
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. HEALTH ORB - Animated Score Counter
    // ═══════════════════════════════════════════════════════════════
    const healthScore = document.querySelector('.health-orb__score');
    if (healthScore) {
        const targetScore = parseInt(healthScore.textContent);
        let currentScore = 0;

        const animateScore = () => {
            if (currentScore < targetScore) {
                currentScore += Math.ceil((targetScore - currentScore) / 10);
                healthScore.textContent = currentScore;
                requestAnimationFrame(animateScore);
            } else {
                healthScore.textContent = targetScore;
            }
        };

        // Start animation when visible
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateScore();
                observer.disconnect();
            }
        });
        observer.observe(healthScore);
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. REVENUE COUNTER - Animated
    // ═══════════════════════════════════════════════════════════════
    const revenueAmount = document.querySelector('.revenue-amount');
    if (revenueAmount) {
        const targetValue = parseFloat(revenueAmount.textContent.replace(/[^0-9.]/g, ''));
        let currentValue = 0;

        const animateRevenue = () => {
            if (currentValue < targetValue) {
                currentValue += targetValue / 50;
                currentValue = Math.min(currentValue, targetValue);
                revenueAmount.textContent = currentValue.toFixed(1) + 'M';
                requestAnimationFrame(animateRevenue);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateRevenue();
                observer.disconnect();
            }
        });
        observer.observe(revenueAmount);
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. LEADS COUNTER - Animated
    // ═══════════════════════════════════════════════════════════════
    const leadsNumber = document.querySelector('.leads-number');
    if (leadsNumber) {
        const targetLeads = parseInt(leadsNumber.textContent);
        let currentLeads = 0;

        const animateLeads = () => {
            if (currentLeads < targetLeads) {
                currentLeads++;
                leadsNumber.textContent = currentLeads;
                setTimeout(animateLeads, 50);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateLeads();
                observer.disconnect();
            }
        });
        observer.observe(leadsNumber);
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. BENTO CARD TILT EFFECT (3D)
    // ═══════════════════════════════════════════════════════════════
    const bentoCards = document.querySelectorAll('.bento-card');

    bentoCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 7. AURORA MOUSE TRACKING (Parallax)
    // ═══════════════════════════════════════════════════════════════
    const auroraOrbs = document.querySelectorAll('.aurora-orb');

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        auroraOrbs.forEach((orb, index) => {
            const speed = (index + 1) * 10;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;

            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 8. NAVIGATION ACTIVE STATE
    // ═══════════════════════════════════════════════════════════════
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Skip for settings
            if (item.getAttribute('data-tooltip') === 'Settings') return;

            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('nav-item--active'));
            item.classList.add('nav-item--active');
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 9. QUICK ACTION BUTTONS - Ripple Effect
    // ═══════════════════════════════════════════════════════════════
    const actionBtns = document.querySelectorAll('.action-btn');

    actionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${e.clientX - rect.left - size / 2}px;
                top: ${e.clientY - rect.top - size / 2}px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: rippleEffect 0.6s linear;
                pointer-events: none;
            `;

            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 10. TIME-BASED GREETING UPDATE
    // ═══════════════════════════════════════════════════════════════
    const pageSubtitle = document.querySelector('.page-subtitle');
    if (pageSubtitle) {
        const hour = new Date().getHours();
        let greeting = '👋';

        if (hour < 12) greeting = '🌅 Good morning';
        else if (hour < 18) greeting = '☀️ Good afternoon';
        else greeting = '🌙 Good evening';

        pageSubtitle.textContent = `${greeting}, Anh Hùng!`;
    }

    // ═══════════════════════════════════════════════════════════════
    // 11. NOTIFICATION BADGE PULSE
    // ═══════════════════════════════════════════════════════════════
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        setInterval(() => {
            notificationBadge.style.transform = 'scale(1.2)';
            setTimeout(() => {
                notificationBadge.style.transform = 'scale(1)';
            }, 200);
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════════
    // 12. CHART BARS ANIMATION ON HOVER
    // ═══════════════════════════════════════════════════════════════
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach((bar, index) => {
        bar.style.animationDelay = `${index * 0.1}s`;
        bar.style.opacity = '0';
        bar.style.transform = 'scaleY(0)';
        bar.style.transformOrigin = 'bottom';

        setTimeout(() => {
            bar.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            bar.style.opacity = bar.classList.contains('chart-bar--active') ? '1' : '0.5';
            bar.style.transform = 'scaleY(1)';
        }, 500 + index * 100);
    });

    // ═══════════════════════════════════════════════════════════════
    // 13. ADD CSS FOR RIPPLE EFFECT
    // ═══════════════════════════════════════════════════════════════
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        /* WOW: Cursor Glow Trail */
        .cursor-glow {
            position: fixed;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(203, 253, 69, 0.15) 0%, transparent 70%);
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s ease;
            mix-blend-mode: screen;
        }
        
        .cursor-dot {
            position: fixed;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--accent-lime, #cbfd45);
            pointer-events: none;
            z-index: 10000;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px rgba(203, 253, 69, 0.5);
        }
        
        /* WOW: Warp Speed Loading */
        .warp-loader {
            position: fixed;
            inset: 0;
            background: #050b14;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        
        .warp-loader.hidden {
            opacity: 0;
            visibility: hidden;
        }
        
        .warp-lines {
            position: absolute;
            inset: 0;
            overflow: hidden;
        }
        
        .warp-line {
            position: absolute;
            width: 2px;
            height: 100px;
            background: linear-gradient(180deg, transparent, var(--accent-lime, #cbfd45), transparent);
            animation: warpSpeed 0.8s linear infinite;
        }
        
        @keyframes warpSpeed {
            0% { transform: translateY(-100vh) scaleY(0.5); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(100vh) scaleY(2); opacity: 0; }
        }
        
        .warp-logo {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 48px;
            font-weight: 700;
            color: white;
            z-index: 2;
            animation: logoGlow 1.5s ease-in-out infinite;
        }
        
        @keyframes logoGlow {
            0%, 100% { text-shadow: 0 0 20px rgba(203, 253, 69, 0.5); }
            50% { text-shadow: 0 0 40px rgba(203, 253, 69, 0.8), 0 0 60px rgba(0, 212, 255, 0.4); }
        }
        
        /* WOW: Confetti Particle */
        .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            pointer-events: none;
            z-index: 10000;
            animation: confettiFall 3s linear forwards;
        }
        
        @keyframes confettiFall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        /* WOW: Magnetic Button */
        .magnetic-btn {
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        /* WOW: Typewriter Effect */
        .typewriter {
            overflow: hidden;
            border-right: 2px solid var(--accent-lime, #cbfd45);
            animation: blink 0.7s step-end infinite;
        }
        
        @keyframes blink {
            50% { border-color: transparent; }
        }
        
        /* WOW: Success Flash */
        .success-flash {
            animation: successFlash 0.5s ease-out;
        }
        
        @keyframes successFlash {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            100% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
        }
    `;
    document.head.appendChild(style);

    // ═══════════════════════════════════════════════════════════════
    // 14. WOW: CURSOR GLOW TRAIL
    // ═══════════════════════════════════════════════════════════════
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
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // Hide cursor on interactive elements
    document.querySelectorAll('button, a, input, .bento-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
            cursorGlow.style.opacity = '0.5';
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorGlow.style.opacity = '1';
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 15. WOW: CONFETTI EXPLOSION
    // ═══════════════════════════════════════════════════════════════
    function createConfetti(x, y, count = 30) {
        const colors = ['#cbfd45', '#b26efd', '#00d4ff', '#ff6b9d', '#ff9f43'];

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';

            // Random spread
            const spread = 100;
            const offsetX = (Math.random() - 0.5) * spread;
            confetti.style.marginLeft = offsetX + 'px';

            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }
    }

    // Trigger confetti on primary button click
    document.querySelectorAll('.action-btn--primary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            createConfetti(e.clientX, e.clientY, 50);
            btn.classList.add('success-flash');
            setTimeout(() => btn.classList.remove('success-flash'), 500);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 16. WOW: MAGNETIC BUTTON EFFECT
    // ═══════════════════════════════════════════════════════════════
    document.querySelectorAll('.action-btn, .icon-btn').forEach(btn => {
        btn.classList.add('magnetic-btn');

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

    // ═══════════════════════════════════════════════════════════════
    // 17. WOW: SOUND UI FEEDBACK (Optional - requires user gesture)
    // ═══════════════════════════════════════════════════════════════
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function playClickSound() {
        if (audioContext.state === 'suspended') return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    function playSuccessSound() {
        if (audioContext.state === 'suspended') return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);

        // Second note (E5)
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 659.25;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.3);
        }, 100);
    }

    // Enable audio on first user interaction
    document.addEventListener('click', function enableAudio() {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        document.removeEventListener('click', enableAudio);
    }, { once: true });

    // Add sound to buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', playClickSound);
    });

    document.querySelectorAll('.action-btn--primary').forEach(btn => {
        btn.addEventListener('click', playSuccessSound);
    });

    // ═══════════════════════════════════════════════════════════════
    // 18. CONSOLE BRANDING
    // ═══════════════════════════════════════════════════════════════
    console.log('%c🚀 AgencyOS 2026', 'font-size: 24px; font-weight: bold; color: #cbfd45;');
    console.log('%cMarketing Command Center Loaded', 'font-size: 14px; color: #b26efd;');
    console.log('%cPress Cmd/Ctrl + K to access AI Focus Bar', 'font-size: 12px; color: #00d4ff;');
    console.log('%c✨ WOW Effects: Cursor Glow, Confetti, Magnetic Buttons, Sound UI', 'font-size: 11px; color: #ff6b9d;');
});

