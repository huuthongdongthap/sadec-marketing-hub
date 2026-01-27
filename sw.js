/**
 * Mekong Agency Service Worker
 * Strategy:
 * - HTML: Network First (Fresh content)
 * - Assets (CSS/JS/Images): Cache First (Performance)
 * - API: Network First (Real-time data)
 */

const CACHE_NAME = 'mekong-os-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/offline.html',
    '/favicon.png',
    '/assets/css/m3-agency.css',
    '/assets/css/admin-unified.css',
    '/assets/js/components/sadec-sidebar.js',
    '/assets/js/auth.js',
    '/assets/js/utils.js'
];

// Install Event - Pre-cache core assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
        .then(() => self.clients.claim())
    );
});

// Fetch Event - Strategy Implementation
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (like Supabase API, Fonts) unless we want to cache them specifically
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // HTML Navigation: Network First -> Cache Fallback -> Offline Page
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request)
                        .then((response) => {
                            if (response) return response;
                            return caches.match('/offline.html');
                        });
                })
        );
        return;
    }

    // Assets (CSS/JS/Images): Cache First -> Network -> Cache Update
    if (event.request.destination === 'style' ||
        event.request.destination === 'script' ||
        event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) return response;
                    return fetch(event.request).then((networkResponse) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    });
                })
        );
        return;
    }

    // Default: Network First
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});

// Push Notification Event
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Received.');
    let data = { title: 'Mekong Agency', body: 'New notification', url: '/' };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    const options = {
        body: data.body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        data: { url: data.url }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click received.');
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
