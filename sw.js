const CACHE_NAME = 'socialmix-app-cache-v2'; // Versione aggiornata
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx'
];

// Evento di installazione: apriamo la cache e aggiungiamo i file principali.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        // Usiamo addAll per assicurarci che l'installazione fallisca se uno dei file non è raggiungibile.
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache files during install:', err);
      })
  );
});

// Evento activate: pulisce le vecchie cache.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


// Evento fetch: intercetta le richieste di rete usando una strategia network-first,
// con fallback alla cache se la rete non è disponibile.
self.addEventListener('fetch', (event) => {
  // Ignora le richieste non-GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Per le risorse esterne (come il CDN di React), una strategia "stale-while-revalidate" è ottima.
  if (event.request.url.startsWith('https://aistudiocdn.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          // Restituisce subito la versione in cache (se c'è), e poi la aggiorna in background.
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // Per le risorse dell'app, proviamo prima la rete, poi la cache.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se la richiesta ha successo, mettiamo la nuova versione in cache.
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Se la rete fallisce, cerchiamo nella cache.
        return caches.match(event.request);
      })
  );
});
