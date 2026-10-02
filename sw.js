// Service Worker для кэширования изображений
const CACHE_NAME = 'fanil-images-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Кэшируем только изображения
  const isImage =
    event.request.destination === 'image' ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url.pathname);

  if (!isImage) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        if (cached) {
          // Отдаём из кэша, обновляем в фоне
          fetch(event.request)
            .then((response) => {
              if (response.ok) cache.put(event.request, response.clone());
            })
            .catch(() => {});
          return cached;
        }
        // Нет в кэше — грузим и сохраняем
        return fetch(event.request).then((response) => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        });
      })
    )
  );
});
