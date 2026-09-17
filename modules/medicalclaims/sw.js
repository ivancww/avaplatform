// ⚠️ 每次修改 index.html 後，必須更改此版本號，以觸發自動更新機制
const CACHE_PREFIX = 'ava-medical-cache-';
const CACHE_NAME = CACHE_PREFIX + 'v7.7.0';

// 必須緩存的檔案列表
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  '../../ava-storage.js',
  '../../ava-192.png',
  '../../ava-512.png'
];

// 安裝 Service Worker，將檔案寫入快取
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// 啟動 Service Worker，清除舊版本快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
            console.log('刪除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 攔截請求，實現離線優先策略 (Network First, falling back to cache)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        let responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
