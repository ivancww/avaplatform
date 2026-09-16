const CACHE_NAME = "ava-platform-v1.5.0";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/ava-192.png",
  "./icons/ava-512.png",
  "./icons/ava-maskable-512.png",
  "./modules/5pay-adapter.js",
  "./platform-backup.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name.startsWith("ava-platform-") && name !== CACHE_NAME).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(self.registration.scope.replace(url.origin, ""))) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || (request.mode === "navigate" ? caches.match("./index.html") : Response.error())))
  );
});
