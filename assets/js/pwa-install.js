/**
 * PWA Installation Handler
 * Manages the "Add to Home Screen" prompt and logic
 */

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installBtn = null;
        this.init();
    }

    init() {
        // Handle install prompt availability
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            this.deferredPrompt = e;
            console.log('[PWA] Install prompt captured');

            // Show custom install UI if it exists
            this.showInstallPromotion();
        });

        // Handle successful installation
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed successfully');
            this.deferredPrompt = null;
            // Hide install UI
            this.hideInstallPromotion();
        });

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
                    })
                    .catch(err => {
                        console.error('[PWA] ServiceWorker registration failed:', err);
                    });
            });
        }
    }

    showInstallPromotion() {
        // You can dispatch an event here for UI components to listen to
        // Or directly manipulate a global install button if it exists
        const btn = document.getElementById('pwa-install-btn');
        if (btn) {
            btn.style.display = 'flex'; // Or 'block'
            btn.addEventListener('click', () => this.install());
        }
    }

    hideInstallPromotion() {
        const btn = document.getElementById('pwa-install-btn');
        if (btn) {
            btn.style.display = 'none';
        }
    }

    async install() {
        if (!this.deferredPrompt) {
            // Fallback for iOS or if prompt is missing
            this.showIOSInstructions();
            return;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`[PWA] User response: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        this.deferredPrompt = null;
        this.hideInstallPromotion();
    }

    showIOSInstructions() {
        // Simple check for iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            alert('Để cài đặt trên iOS:\n1. Nhấn nút "Chia sẻ" (Share)\n2. Chọn "Thêm vào MH chính" (Add to Home Screen)');
        } else {
            console.log('Installation not supported or already installed');
        }
    }
}

// Initialize PWA Manager
window.PWA = new PWAInstaller();
