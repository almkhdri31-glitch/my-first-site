const CACHE_NAME = 'security-platform-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/security-alerts.html',
  '/password-tool.html',
  '/network-scanner.html',
  '/manifest.json',
  '/favicon.png',
  // أضف أي ملفات CSS أو JavaScript إضافية هنا
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
