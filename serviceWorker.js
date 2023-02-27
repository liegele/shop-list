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
  './assets/hammer.min.js',
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
