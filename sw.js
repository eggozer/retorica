// 1. CADA VEZ QUE HAGAS CAMBIOS, CAMBIA EL NÚMERO DE LA VERSIÓN
const CACHE_NAME = 'retorica-cache-v3'; 

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './icon-192.png',
  './icon-512.png'
];

// Instalar el Service Worker y forzar que reemplace al anterior inmediatamente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // <--- CRUCIAL: Fuerza al nuevo SW a tomar el control sin esperar
});

// Limpiar cachés antiguas automáticamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // <--- CRUCIAL: Toma el control de la app inmediatamente
});

// Estrategia de Red / Caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
