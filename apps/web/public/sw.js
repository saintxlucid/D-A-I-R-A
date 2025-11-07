// Service Worker for PWA
// Implements basic caching strategy for offline support

const CACHE_NAME = "daira-shell-v1";
const URLS_TO_CACHE = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  
  // Only handle GET requests
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((response) => {
      // Return cached response if available, otherwise fetch from network
      return response || fetch(request).then((fetchResponse) => {
        // Cache successful responses
        if (fetchResponse && fetchResponse.status === 200) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return fetchResponse;
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
