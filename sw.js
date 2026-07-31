// ============================================================
// KEDAI RAFFA v1.5.0 — Service Worker
// Push Notification + Cache Strategy + Background Sync
// ============================================================

const CACHE_NAME = 'kedai-raffa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/app.js',
  '/js/supabase-client.js',
  '/js/bluetooth-printer.js',
  '/js/push-notification.js'
];

// ── INSTALL ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ── FETCH (Cache First, Network Fallback) ──
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

// ── PUSH NOTIFICATION ──
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const title = payload.title || 'KEDAI RAFFA';
  const options = {
    body: payload.body || 'Ada notifikasi baru',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.tag || 'default',
    requireInteraction: payload.requireInteraction || false,
    data: payload.data || {},
    actions: payload.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── NOTIFICATION CLICK ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ── BACKGROUND SYNC (Print Queue Retry) ──
self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-print-queue') {
    event.waitUntil(retryPrintQueue());
  }
});

async function retryPrintQueue() {
  // Background sync akan coba ulang print yang gagal
  // Logic di-handle oleh app utama saat app dibuka kembali
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const client of clients) {
    client.postMessage({ type: 'RETRY_PRINT_QUEUE' });
  }
}

// ── MESSAGE FROM APP (Printer Status) ──
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
