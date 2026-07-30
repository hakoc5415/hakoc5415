// POLARA service worker — çevrimdışı oynanabilirlik (cache-first + arka planda tazeleme)
const CACHE = 'polara-v1';
const CORE = [
  './',
  './index.html',
  './i18n.js',
  './fonts.css',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const net = fetch(e.request).then((res) => {
        if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)).catch(() => {}); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
