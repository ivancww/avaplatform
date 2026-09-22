const CACHE_NAME = "ava-platform-v1.13.0";
const APP_SHELL = [
  "./",
  "./index.html",
  "./module-gateway.html",
  "./install.html",
  "./ava-lifecycle.js",
  "./qrcode.min.js",
  "./manifest.webmanifest",
  "./ava-192.png",
  "./ava-512.png",
  "./ava-maskable-512.png",
  "./ava-storage.js",
  "./homepage-preferences.js",
  "./homepage-cloud.js",
  "./modules/5pay-adapter.js",
  "./modules/medsave-adapter.js",
  "./modules/medsave/index.html",
  "./modules/medicalclaims-adapter.js",
  "./modules/medicalclaims/index.html",
  "./modules/medicalclaims/medicalclaims.css",
  "./modules/medicalclaims/integration.js",
  "./modules/medicalclaims/script.js",
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

  if (request.mode === "navigate" || ["script", "style"].includes(request.destination)) {
    const update = fetch(request).then(response => {
      if (response.ok && response.type === "basic") return caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())).then(() => response);
      return response;
    });
    event.waitUntil(update.catch(() => undefined));
    event.respondWith(caches.match(request).then(cached => cached || (request.mode === "navigate" ? caches.match("./index.html") : null)).then(cached => cached || update));
    return;
  }

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
