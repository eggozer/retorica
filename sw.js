/**
 * Retórica V2026 - Service Worker de Alto Rendimiento y Depurado
 * Forzado para compatibilidad con Android 5+ y navegadores modernos.
 */

var CACHE_NAME = 'retorica-v2026-depurado';
var ASSETS_TO_CACHE = [
  './',
  './index.html?v=2026_Depurado',
  './manifest.json?v=2026_Depurado',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// 1. INSTALACIÓN: Almacenamiento seguro de recursos esenciales
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(function() {
      // Fuerza al Service Worker actual a tomar el control inmediatamente
      return self.skipWaiting();
    })
  );
});

// 2. ACTIVACIÓN: Limpieza absoluta de cachés antiguas (Evita interferencias con versiones previas)
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cache) {
          if (cache !== CACHE_NAME) {
            console.log('Retórica SW: Eliminando caché obsoleta ->', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(function() {
      // Reclama el control de las pestañas activas de inmediato
      return self.clients.claim();
    })
  );
});

// 3. INTERCEPCIÓN (FETCH): Estrategia Network-First con soporte Offline
// Prioriza la red para obtener traducciones o scripts actualizados; si falla, usa la caché.
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(networkResponse) {
      // Si la respuesta es válida, clonamos y actualizamos la caché dinámicamente
      if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
        var responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(function() {
      // Si el celular se encuentra sin conexión o en modo avión, responde con la caché
      return caches.match(event.request).then(function(cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback en caso de que un recurso dinámico no exista en caché offline
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html?v=2026_Depurado');
        }
      });
    })
  );
});
