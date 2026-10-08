/* Cache only static assets. Payments, customer/admin data and APIs always use the network. */
const CACHE = 'sb7-static-v1';
const ROOT = '/Studioblack7/';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([ROOT + 'offline.html', ROOT + 'icon-192.png', ROOT + 'icon-512.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('sb7-static-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match(ROOT + 'offline.html')));
    return;
  }
  if (!/\/(assets\/|icon-(192|512)\.png$)/.test(url.pathname)) return;
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {
    if (response.ok) { const copy = response.clone(); void caches.open(CACHE).then(cache => cache.put(req, copy)); }
    return response;
  })));
});
