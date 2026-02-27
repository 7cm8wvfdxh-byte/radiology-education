// Cache versiyon yönetimi: CACHE_VERSION her deploy'da güncellenmeli.
// Build script (scripts/bump-cache.js) bunu otomatik yapar.
const CACHE_VERSION = 5;
const CACHE_NAME = 'radiology-edu-v' + CACHE_VERSION;
const ASSETS = [
  '/',
  '/index.html',
  '/neurorad.html',
  '/abdomenrad.html',
  '/search-data.js',
  '/manifest.json'
];

// Clean URL → .html mapping for cache fallback
const CLEAN_URL_MAP = {
  '/neurorad': '/neurorad.html',
  '/abdomenrad': '/abdomenrad.html'
};

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

// Try to match a request in cache, with clean URL fallback
function matchWithFallback(cache, request) {
  const url = new URL(request.url);
  return cache.match(request).then((cached) => {
    if (cached) return cached;
    // If clean URL (e.g. /neurorad), try .html variant (e.g. /neurorad.html)
    const htmlPath = CLEAN_URL_MAP[url.pathname];
    if (htmlPath) {
      return cache.match(new Request(url.origin + htmlPath));
    }
    // If .html URL, also try without extension
    if (url.pathname.endsWith('.html')) {
      const cleanPath = url.pathname.slice(0, -5);
      return cache.match(new Request(url.origin + cleanPath));
    }
    return undefined;
  });
}

// Fetch handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // NAVIGATION REQUESTS (page loads): network-first, cache fallback
  // This prevents 404 errors caused by stale cache or redirect issues
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses for offline use
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() =>
          // Network failed — try cache
          caches.open(CACHE_NAME).then((cache) =>
            matchWithFallback(cache, event.request)
          ).then((cached) => {
            if (cached) return cached;
            // Both network and cache failed — return a proper error page
            return new Response(
              '<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#0f172a;color:#e2e8f0">' +
              '<h2>Bağlantı Hatası</h2><p>Sayfa yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.</p>' +
              '<button onclick="location.reload()" style="margin-top:16px;padding:10px 20px;border-radius:8px;border:none;background:#3b82f6;color:white;cursor:pointer;font-size:14px">Tekrar Dene</button></body></html>',
              { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          })
        )
    );
    return;
  }

  // JS FILES: stale-while-revalidate (fast load + background update)
  if (url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(() => null);

          // Return cache immediately if available, otherwise wait for network
          if (cached) {
            fetchPromise; // fire and forget — update cache in background
            return cached;
          }
          return fetchPromise.then((response) => response || cached);
        })
      )
    );
    return;
  }

  // OTHER ASSETS: network-first with cache fallback
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
