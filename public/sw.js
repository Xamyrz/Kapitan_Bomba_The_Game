self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('Kapitan-Bomba-store').then((cache) => cache.addAll([
          '/bomba.png',
      ])),
    );
  });
  
  self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request)),
    );
  });