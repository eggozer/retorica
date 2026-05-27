// --- CONFIGURACIÓN DEL SERVICE WORKER (RETÓRICA V3) ---
const CACHE_NAME = 'retorica-cache-v3';

// Recursos reales detectados en la raíz de tu repositorio de GitHub
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. INSTALACIÓN: Almacena los elementos en la nueva caché e ignora esperas
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Abriendo nueva caché de Retórica...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Fuerza al nuevo SW a activarse sin esperar a que se cierre la app
});

// 2. ACTIVACIÓN: Borra las cachés viejas automáticamente (Limpieza de interfaz antigua)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando interfaz vieja detectada en caché:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Toma el control de la página en el mismo milisegundo
});

// 3. ESTRATEGIA DE CONSUMO (FETCH): Prioriza Red / Cae en Caché local segura
self.addEventListener('fetch', (event) => {
  // Evitar interceptar peticiones externas como las de la librería externa de PDFs
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si hay red, actualiza la copia de la caché con el archivo fresco
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si no hay red (Modo offline en Android 5), sirve el archivo local de inmediato
        return caches.match(event.request);
      })
  );
});
