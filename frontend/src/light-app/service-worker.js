const cacheName = 'casanet-light';

self.addEventListener('install', function (event) {
    console.log('[Service Worker]  install');
    caches.delete(cacheName);
});

self.addEventListener('activate', (e) => {
    console.log('[Service Worker] activate');

    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (cacheName.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((r) => {
            if (e.request.url.indexOf('/API/') !== -1) {
                console.log(e.request.url + ' fetched as api');
                return fetch(e.request);
            }
            console.log('[Service Worker] Fetching resource: ' + e.request.url);
            return r || fetch(e.request).then((response) => {
                return caches.open(cacheName).then((cache) => {
                    console.log('[Service Worker] Caching new resource: ' + e.request.url);
                    cache.put(e.request, response.clone());
                    return response;
                });
            });
        })
    );
});