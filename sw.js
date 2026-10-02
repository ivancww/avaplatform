// The cache name is deliberately stable. Deployment identity is the Service
// Worker script itself; release correctness must not depend on a manually
// edited cache/version string.
const CACHE_NAME = "ava-platform-shell";
// Independent App deployments own these paths and their App Shell lifecycle.
// Keep this registry-aligned list stable across ordinary App releases.
const INDEPENDENT_APP_PATHS = Object.freeze([
  "/5pay-saving-plan/",
  "/medical/",
  "/critical-illness-/"
]);
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
  "./ava-admin-auth.js",
  "./homepage-preferences.js",
  "./homepage-cloud.js",
  "./notification-center.js",
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
  if (INDEPENDENT_APP_PATHS.some(path => url.pathname === path.slice(0, -1) || url.pathname.startsWith(path))) return;

  if (request.mode === "navigate" || ["script", "style"].includes(request.destination)) {
    const update = fetch(request, { cache: "no-store" }).then(response => {
      if (response.ok && response.type === "basic") return caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())).then(() => response);
      return response;
    });
    event.respondWith(update.catch(() => caches.match(request).then(cached => cached || (request.mode === "navigate" ? caches.match("./index.html") : Response.error())).then(cached => cached || Response.error())));
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
