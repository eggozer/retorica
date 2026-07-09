// --- RETÓRICA SERVICE WORKER AUTOMATION (sw.js) ---
var CACHE_NAME = 'retorica-modular-v2026_GOD_MODE';
var ASSETS = [
  './',
  './index.html?v=2026_GOD_MODE',
  './manifest.json?v=2026_GOD_MODE',
  './auth.js?v=2026_GOD_MODE',
  './idiomas.js?v=2026_GOD_MODE',
  './audio.js?v=2026_GOD_MODE',
  './storage.js?v=2026_GOD_MODE',
  './main.js?v=2026_GOD_MODE',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) {
      return c.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE_NAME) { return caches.delete(k); }
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Estrategia Network-First: Prioriza la red para ver actualizaciones inmediatas de las fotos/tablas subidas
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(res) {
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
