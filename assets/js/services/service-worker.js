/**
 * Sa Đéc Marketing Hub - Service Worker
 * Caching strategies for optimal performance
 */

const CACHE_NAME = 'sadec-hub-v1';
const STATIC_CACHE = 'sadec-static-v1';
const DYNAMIC_CACHE = 'sadec-dynamic-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/assets/css/m3-agency.css',
    '/assets/css/portal.css',
    '/assets/css/responsive-fix-2026.css',
    '/assets/js/shared/logger.js',
    '/assets/js/components/theme-toggle.js',
    '/favicon.png'
];

// Network timeout for stale-while-revalidate
const NETWORK_TIMEOUT = 3000;

// ============================================================================
// INSTALL EVENT - Cache static assets
// ============================================================================

self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Installation complete, skipping waiting');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Installation error:', error);
            })
    );
});

// ============================================================================
// ACTIVATE EVENT - Clean old caches
// ============================================================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Delete old caches that don't match current names
                            return cacheName.startsWith('sadec-') &&
                                cacheName !== STATIC_CACHE &&
                                cacheName !== DYNAMIC_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete, claiming clients');
                return self.clients.claim();
            })
    );
});

// ============================================================================
// FETCH EVENT - Network with cache fallback strategy
// ============================================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Determine caching strategy based on request type
    if (isStaticAsset(request)) {
        // Cache-first for static assets
        event.respondWith(cacheFirst(request));
    } else if (isImageRequest(request)) {
        // Cache-first with long TTL for images
        event.respondWith(cacheFirst(request, { maxAge: 86400 }));
    } else if (isAPIRequest(request)) {
        // Network-first for API calls with cache fallback
        event.respondWith(networkFirst(request));
    } else if (isHTMLRequest(request)) {
        // Stale-while-revalidate for HTML pages
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Default: stale-while-revalidate
        event.respondWith(staleWhileRevalidate(request));
    }
});

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

/**
 * Cache-First Strategy
 * Best for: Static assets (CSS, JS, fonts, images)
 */
async function cacheFirst(request, options = {}) {
    const { maxAge = 604800 } = options; // Default 7 days

    const cached = await caches.match(request);

    if (cached) {
        const cachedTime = new Date(cached.headers.get('sw-cache-time') || Date.now());
        const now = new Date();
        const age = (now - cachedTime) / 1000;

        if (age < maxAge) {
            console.log('[SW] Cache hit (fresh):', request.url);
            return cached;
        } else {
            console.log('[SW] Cache hit (stale), fetching update:', request.url);
        }
    }

    try {
        const response = await fetch(request);

        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            const clonedResponse = response.clone();

            // Add cache-time header
            const headers = new Headers(clonedResponse.headers);
            headers.set('sw-cache-time', new Date().toISOString());

            const responseToCache = new Response(clonedResponse.body, {
                status: clonedResponse.status,
                headers: headers
            });

            cache.put(request, responseToCache);
            console.log('[SW] Cached:', request.url);
        }

        return response;
    } catch (error) {
        console.error('[SW] Fetch failed, returning cached:', request.url);
        return cached || caches.match('/offline.html');
    }
}

/**
 * Network-First Strategy
 * Best for: API calls, dynamic content
 */
async function networkFirst(request) {
    try {
        // Try network with timeout
        const response = await fetchWithTimeout(request, NETWORK_TIMEOUT);

        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
            console.log('[SW] Network success, cached:', request.url);
        }

        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);

        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        // Return offline response for API failures
        return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Stale-While-Revalidate Strategy
 * Best for: HTML pages, frequently updated content
 */
async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                const cache = caches.open(DYNAMIC_CACHE);
                cache.then((c) => c.put(request, response.clone()));
            }
            return response;
        })
        .catch((error) => {
            console.error('[SW] Background fetch failed:', request.url);
            return cached;
        });

    // Return cached immediately, update in background
    if (cached) {
        console.log('[SW] Cache hit (stale-while-revalidate):', request.url);
        return cached;
    }

    console.log('[SW] No cache, waiting for network:', request.url);
    return fetchPromise;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Fetch with timeout
 */
function fetchWithTimeout(request, timeout) {
    return Promise.race([
        fetch(request),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), timeout)
        )
    ]);
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    return (
        pathname.endsWith('.css') ||
        pathname.endsWith('.js') ||
        pathname.endsWith('.woff2') ||
        pathname.endsWith('.woff') ||
        pathname.endsWith('.ttf') ||
        pathname.includes('/assets/')
    );
}

/**
 * Check if request is for image
 */
function isImageRequest(request) {
    const url = new URL(request.url);
    return (
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.gif') ||
        url.pathname.endsWith('.ico')
    );
}

/**
 * Check if request is for API
 */
function isAPIRequest(request) {
    const url = new URL(request.url);
    return (
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/v1/') ||
        url.hostname.includes('supabase.co')
    );
}

/**
 * Check if request is for HTML
 */
function isHTMLRequest(request) {
    const url = new URL(request.url);
    return (
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('/') ||
        request.headers.get('accept')?.includes('text/html')
    );
}

// ============================================================================
// BACKGROUND SYNC (for offline form submissions)
// ============================================================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Sync event:', event.tag);

    if (event.tag === 'sync-form-data') {
        event.waitUntil(syncFormData());
    }
});

async function syncFormData() {
    // Get pending form data from IndexedDB
    // This would be implemented with actual form data storage
    console.log('[SW] Syncing form data...');
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', (event) => {
    console.log('[SW] Push received');

    const options = {
        body: event.data?.text() || 'Notification from Sa Đéc Hub',
        icon: '/favicon.png',
        badge: '/favicon.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'Xem',
                icon: '/favicon.png'
            },
            {
                action: 'close',
                title: 'Đóng'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Sa Đéc Hub', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event.action);

    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[SW] Service Worker loaded');
