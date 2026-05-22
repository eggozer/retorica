var CACHE_NAME = "retorica-cache-v23";
var urlsToCache = [
  "/retorica/",
  "/retorica/index.html",
  "/retorica/manifest.json"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

// Escucha el mensaje del botón para actualizar la app al instante
self.addEventListener("message", function(event) {
  if (event.data && event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
