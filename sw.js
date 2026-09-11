var CACHE_NAME = 'retorica-v1';
var urlsToCache = [
    './',
    './index.html',
    './style.css',
    './ui-core.js',
    './storage.js',
    './audio-engine.js',
    './doc-editor.js',
    './i18n.js',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
