const CACHE_NAME = 'socialmix-cache-v3'; // Versione aggiornata per forzare l'attivazione
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/constants.tsx',
  '/types.ts'
];

// Evento di installazione: memorizza le risorse principali dell'app.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});

// Evento activate: pulisce le vecchie cache non più necessarie.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  // Forza il service worker attivato a prendere il controllo immediato della pagina.
  return self.clients.claim();
});

// Evento fetch: adotta la strategia "Stale-While-Revalidate" per tutte le richieste.
self.addEventListener('fetch', (event) => {
  // Ignora le richieste non-GET e quelle per estensioni del browser.
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Crea una promessa per la richiesta di rete.
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Se la risposta è valida, la mettiamo in cache per futuri utilizzi.
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(error => {
          console.error('Service Worker: Fetch failed; returning offline page instead.', error);
          // Qui potresti restituire una pagina offline generica se `cachedResponse` è nullo.
        });

        // Restituisce immediatamente la risposta dalla cache se disponibile, 
        // mentre la richiesta di rete la aggiorna in background.
        // Se non c'è in cache, attende la risposta dalla rete.
        return cachedResponse || fetchPromise;
      });
    })
  );
});