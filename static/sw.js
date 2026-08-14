const CACHE_NAME = 'orgkompass-v10';

const SHELL = [
  './',
  './index.html',
  './login.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './app.js',
  './content/content-core.js',
  './content/content-modul-01-grundlagen.js',
  './content/content-modul-02-strukturgestaltung.js',
  './content/content-modul-03-funktionsbewertung.js',
  './content/content-modul-04-reorganisationsprojekte.js',
  './content/content-modul-05-analyse-diagnostik.js',
  './content/content-modul-06-prozessoptimierung.js',
  './content/content-modul-07-co-creation.js',
  './content/content-modul-08-change-management-1.js',
  './content/content-modul-09-change-management-2.js',
  './content/content-modul-10-wirksamkeit.js',
  './content/content-glossar.js',
  './content/content-diagramme.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.includes('/api/')) {
    return;
  }

  const isHTML = event.request.mode === 'navigate' || url.pathname.endsWith('.html');

  if (isHTML) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
