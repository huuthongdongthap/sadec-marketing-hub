/**
 * Sa Đéc Marketing Hub — Scroll to Top Utility
 * Nút cuộn lên đầu trang với smooth scroll
 */

const ScrollToTop = {
    THRESHOLD: 300,

    init() {
        this.createButton();
        this.bindScroll();
        this.bindClick();
    },

    createButton() {
        const btn = document.createElement('button');
        btn.id = 'scroll-to-top';
        btn.className = 'scroll-to-top';
        btn.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
        btn.setAttribute('aria-label', 'Lên đầu trang');
        document.body.appendChild(btn);

        this.button = btn;
    },

    bindScroll() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.toggle();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    },

    bindClick() {
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    },

    toggle() {
        const scrollY = window.scrollY || window.pageYOffset;

        if (scrollY > this.THRESHOLD) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    },

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScrollToTop.init());
} else {
    ScrollToTop.init();
}
