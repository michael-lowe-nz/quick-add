const CACHE_NAME = 'quick-add-v1';
const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://yourdomain.com'];

self.addEventListener('fetch', event => {
  // Only handle requests from allowed origins
  const url = new URL(event.request.url);
  if (!ALLOWED_ORIGINS.includes(url.origin)) {
    return;
  }

  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request, { 
      cache: 'no-cache',
      credentials: 'same-origin' // Prevent credential leakage
    })
      .catch(() => caches.match(event.request))
  );
});