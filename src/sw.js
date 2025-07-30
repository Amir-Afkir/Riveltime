// src/sw.js
// ✅ Désactive les logs Workbox même en dev
self.__WB_DISABLE_DEV_LOGS = true;

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// ✅ Précache les ressources VitePWA (injectées automatiquement)
precacheAndRoute(self.__WB_MANIFEST || []);

// ✅ Cache API Riveltime
registerRoute(
  ({ url }) => url.origin === 'https://api.riveltime.app',
  new NetworkFirst({
    cacheName: 'api-riveltime',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 3600, // 1h
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// ✅ Cache Mapbox (terrain, tiles, images...)
registerRoute(
  ({ url }) => url.origin === 'https://api.mapbox.com' || url.origin === 'https://tiles.mapbox.com',
  new CacheFirst({
    cacheName: 'mapbox-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 86400, // 24h
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// ✅ Cache images (avatars, logos, cover boutique)
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 86400 }),
    ],
  })
);

// ✅ Page fallback offline (optionnel)
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    );
  }
});

// ✅ Skip waiting & update SW dès que possible
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});