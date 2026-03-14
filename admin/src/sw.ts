/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'sadec-hub-v1'
const RUNTIME_CACHE_NAME = 'sadec-hub-runtime-v1'

// Static assets to pre-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json'
]

// Network patterns for different request types
const CACHE_PATTERNS = {
  images: ['image/'],
  fonts: ['font/'],
  api: ['/api/'],
  static: ['.js', '.css', '.woff', '.woff2']
}

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => {
      console.log('[Service Worker] Activated')
      return self.clients.claim()
    })
  )
})

// Helper function to determine cache strategy
const getCacheStrategy = (url: string, requestType: string): 'network-first' | 'cache-first' | 'stale-while-revalidate' => {
  // API requests: network first
  if (url.includes('/api/')) {
    return 'network-first'
  }

  // Static assets: cache first
  if (requestType.startsWith('image/') ||
      requestType.startsWith('font/') ||
      CACHE_PATTERNS.static.some(pattern => url.includes(pattern))) {
    return 'cache-first'
  }

  // HTML/Navigation: stale while revalidate
  return 'stale-while-revalidate'
}

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = request.url

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.startsWith('http')) {
    return
  }

  const strategy = getCacheStrategy(url, request.headers.get('accept') || '')

  event.respondWith(
    (async () => {
      try {
        if (strategy === 'cache-first') {
          // Cache-first strategy for static assets
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            return cachedResponse
          }
          const networkResponse = await fetch(request)
          if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE_NAME)
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        }

        if (strategy === 'network-first') {
          // Network-first strategy for API calls
          try {
            const networkResponse = await fetch(request)
            if (networkResponse.ok) {
              const cache = await caches.open(RUNTIME_CACHE_NAME)
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          } catch (error) {
            const cachedResponse = await caches.match(request)
            return cachedResponse || new Response(JSON.stringify({ error: 'Offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            })
          }
        }

        // Stale-while-revalidate for HTML
        const cachedResponse = await caches.match(request)
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(RUNTIME_CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone())
            })
          }
          return networkResponse
        }).catch(() => null)

        return cachedResponse || fetchPromise
      } catch (error) {
        return caches.match('/index.html')
      }
    })()
  )
})

export {}
