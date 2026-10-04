// --- RETÓRICA AUTO-CLEANING SERVICE WORKER (sw.js) ---
const CACHE_NAME = 'retorica-godmode-cache-v2026';
const ASSETS = [
  './',
  './index.html',
  './main.js',
  './storage.js',
  './idiomas.js',
  './audio.js',
  './auth.js',
  './manifest.json',
  './icon-192.png'
];

// ==========================================
// SECCIÓN 1: INSTALACIÓN Y CACHÉ DE RECURSOS
// ==========================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// ==========================================
// SECCIÓN 2: ACTIVACIÓN Y LIMPIEZA DE CACHÉS ANTIGUAS
// ==========================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ==========================================
// SECCIÓN 3: INTERCEPTACIÓN DE RED (FETCH)
// ==========================================
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
