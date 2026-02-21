const CACHE_NAME = 'codehub-v2';
const OFFLINE_PAGE = '/offline.html';

// Files to precache – add/remove as your project grows
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/privacy.html',
  '/terms.html',
  '/card-html.html',
  '/styles/main.css',
  '/styles/other-about.css',
  '/styles/other-privacy.css',
  '/styles/other-terms.css',
  '/styles/card-html.css',
  '/scripts/translations.js',
  '/scripts/notifications.js',
  '/scripts/modes.js',
  '/scripts/screen.js',
  '/scripts/font.js',
  '/scripts/export.js',
  '/scripts/options.js',
  '/assets/icons/icon-192x192.png',
  '/assets/fonts/icons/html.png',
  '/assets/images/developer.png',
  OFFLINE_PAGE
];

// Install event – cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()) // Activate worker immediately
  );
});

// Activate event – clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    )).then(() => self.clients.claim())
  );
});

// Fetch event – handle requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests (e.g., CDN fonts) – they may not support CORS
  if (url.origin !== location.origin) {
    return;
  }

  // Strategy: HTML pages → network first, fallback to cache
  if (request.mode === 'navigate' || 
      (request.headers.get('Accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request).then(cached => cached || caches.match(OFFLINE_PAGE)))
    );
    return;
  }

  // Static assets (CSS, JS, images) → cache first, fallback to network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        // Cache new requests for next time
        const responseCopy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseCopy));
        return response;
      });
    }).catch(() => {
      // If both cache and network fail, return offline page for HTML, ignore others
      if (request.destination === 'document') {
        return caches.match(OFFLINE_PAGE);
      }
    })
  );
});
/* - Precaching of essential pages and assets.
- Cache‑first strategy for static assets (CSS, JS, images).
- Network‑first strategy for HTML pages (fallback to cache).
- Offline fallback page (`/offline.html`) –  must create this file (a simple “You are offline” message).

- Automatic cleanup of old caches when a new service worker activates. */
