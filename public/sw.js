const CACHE_NAME = 'waldorf-path-cache-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/waldorf-favicon sq cutout.png',
  '/documents/og-image.jpg',
  '/waldorf-path-banner crop_upscayl_5x_ultrasharp.png',
  '/nina logo final WhatsApp Image 2026-05-23 at 2.40.52 AM (1).jpeg',
  '/nina header final WhatsApp Image 2026-05-23 at 2.40.52 AM.jpeg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).catch(err => console.warn('PWA Service Worker: Pre-caching failed', err))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

  self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
      e.respondWith(
        fetch(e.request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            return caches.match(e.request).then(cachedResponse => {
              return cachedResponse || caches.match('/offline.html');
            });
          })
      );
      return;
    }

    // Handle API requests with network-first strategy
    if (url.pathname.startsWith('/api/teable')) {
      e.respondWith(
        fetch(e.request)
          .then((response) => {
            // Cache successful API responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Fall back to cache if network fails
            return caches.match(e.request).then(cachedResponse => {
              return cachedResponse;
            });
          })
      );
      return;
    }

    // For all other requests (assets), use cache-first
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request);
      })
    );
  });
