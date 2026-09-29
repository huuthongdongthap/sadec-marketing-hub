/**
 * Sa Đéc Marketing Hub - Service Worker v2
 * Advanced caching strategies for optimal performance
 *
 * Strategies:
 * - Static Assets (CSS/JS): Cache First, fall back to network
 * - Images: Cache First with TTL (1 week)
 * - HTML Pages: Stale While Revalidate
 * - API Calls: Network First with cache fallback
 * - Fonts: Cache First with long TTL
 */

const CACHE_VERSION = 'vmmq4tpab.18727fc58c0a';
const CACHE_NAME = `mekong-os-static-${CACHE_VERSION}`;
const CACHE_IMAGES = `mekong-os-images-${CACHE_VERSION}`;
const CACHE_API = `mekong-os-api-${CACHE_VERSION}`;
const CACHE_FONTS = `mekong-os-fonts-${CACHE_VERSION}`;

// Cache TTL configurations
const CACHE_TTL = {
    images: 7 * 24 * 60 * 60 * 1000, // 7 days
    api: 5 * 60 * 1000,              // 5 minutes
    fonts: 30 * 24 * 60 * 60 * 1000, // 30 days
    static: Infinity                  // Forever until cache version changes
};

// Core assets to cache on install
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/favicon.png',
    '/manifest.json',
    '/assets/css/m3-agency.css',
    '/assets/css/portal.css',
    '/assets/css/admin-unified.css',
    '/assets/js/components/sadec-sidebar.js',
    '/assets/js/lazy-loader.js',
    '/supabase-config.js'
];

// URL patterns for routing
const URL_PATTERNS = {
    static: /\.(css|js|woff2?|ttf|eot)$/i,
    images: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
    api: /\/(api|supabase)\//i,
    fonts: /fonts\.(googleapis|gstatic)\.com/i,
    cdn: /cdn\.jsdelivr\.net|esm\.run/i
};

// ============================================================================
// INSTALL EVENT - Pre-cache core assets
// ============================================================================

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
            .catch(() => {})
    );
});

// ============================================================================
// ACTIVATE EVENT - Clean up old caches
// ============================================================================

self.addEventListener('activate', (event) => {
    const currentCaches = [CACHE_NAME, CACHE_IMAGES, CACHE_API, CACHE_FONTS];

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((name) => !currentCaches.includes(name))
                    .map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

// ============================================================================
// FETCH EVENT - Request routing and caching strategies
// ============================================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) return;

    // Route requests based on type
    if (URL_PATTERNS.fonts.test(url.href) ||
        (request.destination === 'font' && url.hostname.includes('fonts'))) {
        event.respondWith(cacheFirst(request, CACHE_FONTS, CACHE_TTL.fonts));
        return;
    }

    if (URL_PATTERNS.images.test(url.href) || request.destination === 'image') {
        event.respondWith(cacheFirstWithTTL(request, CACHE_IMAGES, CACHE_TTL.images));
        return;
    }

    if (URL_PATTERNS.static.test(url.href) ||
        request.destination === 'style' ||
        request.destination === 'script') {
        event.respondWith(cacheFirst(request, CACHE_NAME, CACHE_TTL.static));
        return;
    }

    if (URL_PATTERNS.cdn.test(url.href)) {
        event.respondWith(cacheFirst(request, CACHE_NAME, CACHE_TTL.static));
        return;
    }

    if (URL_PATTERNS.api.test(url.href) || url.href.includes('supabase.co')) {
        event.respondWith(networkFirstWithCache(request, CACHE_API, CACHE_TTL.api));
        return;
    }

    // HTML pages: Stale While Revalidate
    if (request.mode === 'navigate' ||
        request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // Default: Network first with cache fallback
    event.respondWith(networkFirstWithCache(request, CACHE_NAME));
});

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

/**
 * Cache First - Best for static assets
 * Returns cached response immediately, falls back to network
 */
async function cacheFirst(request, cacheName, ttl = Infinity) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        // Check TTL if specified
        if (ttl !== Infinity) {
            const cachedTime = getCacheTime(cachedResponse);
            if (Date.now() - cachedTime < ttl) {
                return cachedResponse;
            }
            // TTL expired, delete and fetch fresh
            await cache.delete(request);
        } else {
            return cachedResponse;
        }
    }

    // Fetch from network
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}

/**
 * Cache First with TTL for images
 */
async function cacheFirstWithTTL(request, cacheName, ttl) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        const cachedTime = getCacheTime(cachedResponse);
        if (Date.now() - cachedTime < ttl) {
            // Return cached but update in background
            fetch(request).then(async (response) => {
                if (response.ok) {
                    await cache.put(request, response.clone());
                }
            }).catch(() => {}); // Silent fail for background update
            return cachedResponse;
        }
        await cache.delete(request);
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}

/**
 * Network First with Cache Fallback - Best for API calls
 * Tries network first, falls back to cache if offline
 */
async function networkFirstWithCache(request, cacheName, ttl = null) {
    const cache = await caches.open(cacheName);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            await cache.put(request, responseToCache);
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            // Check TTL if specified
            if (ttl) {
                const cachedTime = getCacheTime(cachedResponse);
                if (Date.now() - cachedTime < ttl) {
                    return cachedResponse;
                }
            } else {
                return cachedResponse;
            }
        }

        // Return offline response
        return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Stale While Revalidate - Best for HTML pages
 * Returns cached immediately, updates cache in background
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Revalidate in background
    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => {
            // Return cached or offline page
            return cachedResponse || caches.match('/offline.html');
        });

    // Return cached immediately or wait for network
    return cachedResponse || fetchPromise;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get cache timestamp from response headers
 */
function getCacheTime(response) {
    const cachedTime = response.headers.get('sw-cache-time');
    return cachedTime ? parseInt(cachedTime, 10) : 0;
}

/**
 * Add timestamp header to response for TTL tracking
 */
async function addCacheTimeHeader(response) {
    const clonedResponse = response.clone();
    const headers = new Headers(clonedResponse.headers);
    headers.set('sw-cache-time', Date.now().toString());
    return new Response(await clonedResponse.text(), {
        status: clonedResponse.status,
        headers
    });
}

// ============================================================================
// BACKGROUND SYNC FOR OFFLINE ACTIONS
// ============================================================================

/**
 * Queue failed requests for background sync
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-contacts' || event.tag === 'sync-forms') {
        event.waitUntil(syncPendingRequests());
    }
});

async function syncPendingRequests() {
    // In a real implementation, you would:
    // 1. Read pending requests from IndexedDB
    // 2. Replay them to the server
    // 3. Remove successful ones from the queue
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', (event) => {
    let data = {
        title: 'Mekong Agency',
        body: 'Thông báo mới',
        url: '/',
        icon: '/favicon.png'
    };

    if (event.data) {
        try {
            data = JSON.parse(event.data.text());
        } catch (e) {
            // Parse error - use defaults
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/favicon.png',
        badge: '/favicon.png',
        data: { url: data.url },
        actions: [
            { action: 'open', title: 'Xem ngay' },
            { action: 'dismiss', title: 'Bỏ qua' }
        ],
        tag: data.url || 'default',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ============================================================================
// NOTIFICATION CLICK
// ============================================================================

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there's already a window open
                for (let client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
        );
    }
});

