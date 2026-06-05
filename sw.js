// --- SERVICE WORKER CONTROL DE ENTORNO UNIFICADO (V2026_FIJO) ---
const CACHE_NAME = 'retorica-cache-v2026-unificado';

// Listado limpio: Solo lo estrictamente necesario que se queda en la raíz
const ASSETS_CRITICOS = [
  './',
  './index.html?v=2026_Módulos',
  './manifest.json?v=2026_Módulos'
];

// Instalación forzando el reemplazo de caché antiguo
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_CRITICOS);
    })
  );
  self.skipWaiting();
});

// Activación destruyendo cualquier rastro viejo para evitar ruedas cuadradas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Removiendo Caché Obsoleto Controlado: ", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepción inteligente: Red primero con caída controlada a caché local
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copiaDestinadaCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copiaDestinadaCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((resCacheado) => {
          if (resCacheado) {
            return resCacheado;
          }
          // Fallback en caso de desconexión absoluta para el documento base
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html?v=2026_Módulos');
          }
        });
      })
  );
});
