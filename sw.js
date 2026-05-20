// Service Worker básico para permitir la instalación de Retórica
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Permite cargar los archivos normalmente de la red
  event.respondWith(fetch(event.request));
});
