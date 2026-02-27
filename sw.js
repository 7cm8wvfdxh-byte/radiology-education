// Cache versiyon yönetimi: CACHE_VERSION her deploy'da güncellenmeli.
// Build script (scripts/bump-cache.js) bunu otomatik yapar.
const CACHE_VERSION = 3;
const CACHE_NAME = 'radiology-edu-v' + CACHE_VERSION;
const ASSETS = [
  '/',
  '/index.html',
  '/neurorad.html',
  '/abdomenrad.html',
  '/search-data.js',
  '/manifest.json'
];

// Install — cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — stale-while-revalidate for HTML, network-first for others
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // For HTML files and search-data.js: stale-while-revalidate
  // Serve cache immediately, then update cache from network in background
  if (event.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(() => cached);

          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // For other assets: network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
