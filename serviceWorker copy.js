const staticDevShopList = 'dev-shopList-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './assets/anime.min.js',
  './assets/boxicons-2.1.4/css/boxicons.min.css',
  './assets/boxicons-2.1.4/fonts/boxicons.woff',
  './assets/boxicons-2.1.4/fonts/boxicons.woff2',
  './assets/boxicons-2.1.4/fonts/boxicons.ttf',
  './assets/hammer.js',
];

self.addEventListener('install', (installEvent) => {
  installEvent.waitUntil(
    caches.open(staticDevShopList).then((cache) => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', (fetchEvent) => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((res) => {
      return res || fetch(fetchEvent.request);
    })
  );
});

// ------------------------

const staticDevEscala = 'dev-escala-site-v0.0.10';
const assets = ['/', '/index.html', '/style.css', '/script.js'];

self.addEventListener('install', (installEvent) => {
  // self.caches.delete(staticDevEscala);
  installEvent.waitUntil(
    caches.open(staticDevEscala).then((cache) => {
      cache.addAll(assets);
      //Força a atualização do serviceWorker.js para a versão mais nova.
      self.skipWaiting();
      console.log('serviceWorker installed!');
    })
  );
});

self.addEventListener('activate', (event) => {
  // Remove caches antigos
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      return keys.map(async (cache) => {
        if (cache !== staticDevEscala) {
          console.log('Service Worker: Removing old cache: ' + cache);
          return await caches.delete(cache);
        }
      });
    })()
  );
});

self.addEventListener('fetch', (fetchEvent) => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((res) => {
      return res || fetch(fetchEvent.request);
    })
  );
});
