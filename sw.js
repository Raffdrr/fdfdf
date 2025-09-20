const CACHE_NAME = 'socialmix-app-cache-v1';
// Aggiungiamo i file principali da mettere in cache per un'esperienza offline di base.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx'
];

// Evento di installazione: apriamo la cache e aggiungiamo i file.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento fetch: intercettiamo le richieste di rete.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se la risorsa è in cache, la restituiamo.
        if (response) {
          return response;
        }
        // Altrimenti, la richiediamo dalla rete.
        return fetch(event.request);
      })
  );
});
