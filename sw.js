// --- RETÓRICA SERVICE WORKER AUTOMATION (sw.js) ---
var CACHE_NAME = 'retorica-modular-v2026';
var ASSETS = [
  './',
  './index.html?v=GOD_MODE',
  './manifest.json?v=GOD_MODE',
  './auth.js?v=GOD_MODE',
  './idiomas.js?v=GOD_MODE',
  './audio.js?v=GOD_MODE',
  './storage.js?v=GOD_MODE',
  './main.js?v=GOD_MODE',
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

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    fetch(e.request).then(function(res) {
      if (res && res.status === 200) {
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(c) {
          c.put(e.request, resClone);
        });
      }
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
