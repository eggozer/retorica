// --- RETÓRICA AUTO-CLEANING SERVICE WORKER (sw.js) ---
const CACHE_NAME = 'retorica-godmode-cache-v2026_01';
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

// Instalación del Service Worker y almacenamiento inicial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => {
      return self.skipWaiting(); // Fuerza al SW a activarse inmediatamente
    })
  );
});

// Punto 5: Automatización del Service Worker (Caché Autolimpiable)
// Al activarse, busca versiones anteriores de caché en el dispositivo y las borra al instante
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Retorica SW: Barriendo caché obsoleta antigua...', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Toma el control de los clientes de inmediato sin recargas manuales
    })
  );
});

// Estrategia de red con caída en caché (Network-First) para asegurar actualizaciones constantes en tiempo real
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la red responde de forma correcta, clonamos y actualizamos el caché dinámicamente
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si no hay red (modo desconectado/cambaceo), sirve el recurso desde el caché protegido
        return caches.match(event.request);
      })
  );
});
