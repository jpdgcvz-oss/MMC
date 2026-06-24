const CACHE_NAME = 'capitao-matematica-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/screenshot-1.jpg',
  '/screenshot-2.jpg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching initial assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Failed to cache assets during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network First, fallback to cache)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Only handle http and https requests to prevent errors with browser extensions
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);
  // Do not intercept API requests or internal socket connections
  if (url.pathname.startsWith('/api') || url.pathname.includes('socket.io') || url.pathname.includes('hot-update')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache dynamic visual assets and pages
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
