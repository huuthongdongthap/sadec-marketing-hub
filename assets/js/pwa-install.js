/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PWA INSTALL - Progressive Web App Install Handler
 * Sa Đéc Marketing Hub - PWA Installation
 * ═══════════════════════════════════════════════════════════════════════════
 */

class PWAInstall {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
    }

    init() {
        console.log('[PWAInstall] Initialized');
        this.setupInstallListener();
    }

    setupInstallListener() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWAInstall] Install prompt available');
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('[PWAInstall] App installed successfully');
            this.deferredPrompt = null;
            this.hideInstallButton();
        });
    }

    showInstallButton() {
        this.installButton = document.getElementById('install-button');
        if (this.installButton) {
            this.installButton.style.display = 'block';
            this.installButton.addEventListener('click', () => this.promptInstall());
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('[PWAInstall] No install prompt available');
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('[PWAInstall] User choice:', outcome);
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    async canInstall() {
        return !!this.deferredPrompt;
    }
}

// Auto-initialize
const pwaInstall = new PWAInstall();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => pwaInstall.init());
} else {
    pwaInstall.init();
}

export { PWAInstall, pwaInstall };
export default pwaInstall;
