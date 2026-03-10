const CACHE_NAME = 'huddle-up-v3';
const STATIC_ASSETS = [
  '/huddle-up-logo.png',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/@') ||
      url.pathname.startsWith('/node_modules/') ||
      url.pathname.startsWith('/src/') ||
      url.pathname.includes('__vite') ||
      url.pathname.includes('hot-update') ||
      url.protocol === 'ws:' ||
      url.protocol === 'wss:') {
    return;
  }

  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Huddle Up</title><style>body{background:#0F1115;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}a{color:#1E90FF}</style></head><body><div><h2>You\'re Offline</h2><p>Please check your connection and try again.</p><button onclick="location.reload()" style="background:#1E90FF;color:white;border:none;padding:12px 24px;border-radius:12px;font-weight:bold;cursor:pointer;margin-top:16px">Retry</button></div></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: data.icon || '/pwa-icon-192.png',
    badge: data.badge || '/pwa-icon-192.png',
    tag: data.tag || 'huddle-up',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200, 100, 200],
    sound: '/notification.mp3',
    data: data.data || {},
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Huddle Up', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
