/**
 * Sa Đéc Marketing Hub - Service Worker
 * Caching strategies for optimal performance
 *
 * Usage: Build with MINIFY_LOG=true to strip debug logs
 */

const CACHE_NAME = 'sadec-hub-v1';
const STATIC_CACHE = 'sadec-static-v1';
const DYNAMIC_CACHE = 'sadec-dynamic-v1';
const LOG_ENABLED = typeof SW_LOG !== 'undefined' ? SW_LOG : (location?.hostname === 'localhost');

// Debug logger - stripped in production build
// Using Logger module for production-safe logging
import { Logger } from '../shared/logger.js';
const swLog = (...args) => LOG_ENABLED && Logger.info('[SW]', ...args);
const swError = (...args) => Logger.error('[SW]', ...args);

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
    swLog('Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                swLog('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                swLog('Installation complete, skipping waiting');
                return self.skipWaiting();
            })
            .catch((error) => {
                swError('Installation error:', error);
            })
    );
});

// ============================================================================
// ACTIVATE EVENT - Clean old caches
// ============================================================================

self.addEventListener('activate', (event) => {
    swLog('Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName.startsWith('sadec-') &&
                                cacheName !== STATIC_CACHE &&
                                cacheName !== DYNAMIC_CACHE;
                        })
                        .map((cacheName) => {
                            swLog('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                swLog('Activation complete, claiming clients');
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
    const { maxAge = 604800 } = options;
    const cached = await caches.match(request);

    if (cached) {
        const cachedTime = new Date(cached.headers.get('sw-cache-time') || Date.now());
        const age = (Date.now() - cachedTime) / 1000;

        if (age < maxAge) {
            swLog('Cache hit (fresh):', request.url);
            return cached;
        } else {
            swLog('Cache hit (stale), fetching update:', request.url);
        }
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            const clonedResponse = response.clone();
            const headers = new Headers(clonedResponse.headers);
            headers.set('sw-cache-time', new Date().toISOString());
            const responseToCache = new Response(clonedResponse.body, {
                status: clonedResponse.status,
                headers: headers
            });
            cache.put(request, responseToCache);
            swLog('Cached:', request.url);
        }
        return response;
    } catch (error) {
        swError('Fetch failed, returning cached:', request.url);
        return cached || caches.match('/offline.html');
    }
}

/**
 * Network-First Strategy
 * Best for: API calls, dynamic content
 */
async function networkFirst(request) {
    try {
        const response = await fetchWithTimeout(request, NETWORK_TIMEOUT);
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
            swLog('Network success, cached:', request.url);
        }
        return response;
    } catch (error) {
        swLog('Network failed, trying cache:', request.url);
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
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
            swError('Background fetch failed:', request.url);
            return cached;
        });

    if (cached) {
        swLog('Cache hit (stale-while-revalidate):', request.url);
        return cached;
    }

    swLog('No cache, waiting for network:', request.url);
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
    swLog('Sync event:', event.tag);
    if (event.tag === 'sync-form-data') {
        event.waitUntil(syncFormData());
    }
});

async function syncFormData() {
    swLog('Syncing form data...');
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', (event) => {
    swLog('Push received');
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
            { action: 'view', title: 'Xem', icon: '/favicon.png' },
            { action: 'close', title: 'Đóng' }
        ]
    };
    event.waitUntil(self.registration.showNotification('Sa Đéc Hub', options));
});

self.addEventListener('notificationclick', (event) => {
    swLog('Notification click:', event.action);
    event.notification.close();
    if (event.action === 'view') {
        event.waitUntil(clients.openWindow('/'));
    }
});

swLog('Service Worker loaded');
