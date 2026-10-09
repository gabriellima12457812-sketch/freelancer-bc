const CACHE_NAME = 'freelancer-bc-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle requests
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Ao clicar na notificação nativa, focar ou abrir o Freelancer BC
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/freelancer');
      }
    })
  );
});
