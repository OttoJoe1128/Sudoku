const CACHE_NAME = 'sudokumap-v2';

// Yeni güncellemeyi bekletmeden anında kurar
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
});

// Eski önbelleği anında temizler
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); 
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// İnternet varsa her zaman en yeni kodu çeker, yoksa önbellekten oynatır
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
