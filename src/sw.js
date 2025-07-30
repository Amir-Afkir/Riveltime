// src/sw.js
// ✅ Désactive les logs Workbox même en mode dev
self.__WB_DISABLE_DEV_LOGS = true; 

import { precacheAndRoute } from 'workbox-precaching';

// ✅ Précache les ressources injectées automatiquement par VitePWA
precacheAndRoute(self.__WB_MANIFEST || []);

// 👉 Tu peux ici ajouter d'autres stratégies personnalisées si besoin
// Stratégies personnalisées pour API Riveltime et Mapbox
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// API Riveltime : NetworkFirst
registerRoute(
  ({ url }) => url.origin === 'https://api.riveltime.app',
  new NetworkFirst({
    cacheName: 'riveltime-api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 3600,
      }),
    ],
  })
);

// Mapbox : CacheFirst
registerRoute(
  ({ url }) => url.origin === 'https://api.mapbox.com',
  new CacheFirst({
    cacheName: 'riveltime-mapbox-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 86400, // 24h
      }),
    ],
  })
);

// ℹ️ Tu peux aussi écouter les événements Workbox si besoin (optionnel)
// self.addEventListener('message', (event) => {
//   if (event.data && event.data.type === 'SKIP_WAITING') {
//     self.skipWaiting();
//   }
// });