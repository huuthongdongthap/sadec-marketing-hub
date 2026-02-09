/**
 * Notification Manager
 * Handles permission requests and local notifications
 */

class NotificationManager {
    constructor() {
        this.permission = Notification.permission;
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.error('This browser does not support desktop notification');
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission;
        } catch (error) {
            console.error('[Notification] Error requesting permission:', error);
            return 'denied';
        }
    }

    send(title, options = {}) {
        if (this.permission === 'granted') {
            // Check if service worker is ready for richer notifications
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        icon: '/favicon.png',
                        badge: '/favicon.png',
                        ...options
                    });
                });
            } else {
                // Fallback to simple notification
                new Notification(title, {
                    icon: '/favicon.png',
                    ...options
                });
            }
        } else {
            // Permission not granted
        }
    }

    // Subscribe to push service (Mock implementation for now)
    async subscribeToPush() {
        if (this.permission !== 'granted') return null;

        // In a real app, we would get the VAPID key and subscribe via SW registration
        // navigator.serviceWorker.ready.then(reg => reg.pushManager.subscribe(...))

        return 'mock-push-subscription-id';
    }
}

// Export singleton
window.Notifications = new NotificationManager();
