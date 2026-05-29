const NOMBRE_CACHE = 'retorica-cache-v12';
const ARCHIVOS = [
  './',
  './index.html',
  './js/main.js',
  './js/audio.js',
  './js/storage.js',
  './js/idiomas.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(NOMBRE_CACHE).then((c) => c.addAll(ARCHIVOS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.map((k) => { if (k !== NOMBRE_CACHE) return caches.delete(k); })
  )));
});

self.addEventListener('message', (e) => {
  if (e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
