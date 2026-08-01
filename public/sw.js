// ═══════════════════════════════════════════════════════════
// KEDAI RAFFA PWA — Service Worker v1.5.0
// AUTO UPDATE: Network First, detect changes, notify user
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'kedai-raffa-v1';
const ASSETS = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logo-brand.png',
  '/splash.png',
  '/maskot.png'
];

// ── INSTALL ──
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// ── ACTIVATE: Hapus cache lama & ambil alih semua tab ──
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: HTML/JS selalu fresh dari network ──
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip Supabase API
  if (url.hostname.includes('supabase.co')) return;

  // HTML/JS → SELALU network (tidak di-cache!)
  if (request.mode === 'navigate' || 
      request.destination === 'document' ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(request, { cache: 'no-store' })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Assets → Cache First
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        return res;
      });
    })
  );
});

// ── MESSAGE dari main thread ──
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
