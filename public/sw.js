// Basic offline shell caching for PWA
const CACHE_NAME = 'revision-portal-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/', '/index.html', '/manifest.json'])),
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached ?? fetch(event.request)),
  )
})
