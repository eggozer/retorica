// --- RETÓRICA AUTO-CLEANING SERVICE WORKER (sw.js) ---
const CACHE_NAME = 'retorica-godmode-cache-v2026_02';
const ASSETS = [
  './',
  './index.html',
  './main.js',
  './storage.js',
  './idiomas.js',
  './audio.js',
  './auth.js',
  './manifest.json'
];

// Instalación estructurada del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Aislamiento completo de caché obsoleta para evitar borrar datos en el almacenamiento local
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Retorica SW: Purgando datos de caché estática antigua...', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Control de red Network-First: Prioriza actualizaciones en línea sin corromper la memoria interna
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean del mismo origen o de esquemas externos
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Caída limpia por si el recurso no está disponible sin conexión
          return new Response("Contenido offline no disponible temporalmente.", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ "Content-Type": "text/plain;charset=utf-8" })
          });
        });
      })
  );
});
