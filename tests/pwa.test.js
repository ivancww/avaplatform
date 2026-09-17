const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));

assert.equal(manifest.id, "/avaplatform/");
assert.equal(manifest.start_url, "/avaplatform/");
assert.equal(manifest.scope, "/avaplatform/");
assert.equal(manifest.display, "standalone");
assert.equal(manifest.theme_color, "#2563eb");
assert.deepEqual(manifest.icons, [
  { src: "./ava-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "./ava-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "./ava-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
]);
assert.match(html, /<link rel="manifest" href="\.\/manifest\.webmanifest">/);
assert.match(html, /<link rel="apple-touch-icon" sizes="192x192" href="\.\/ava-192\.png">/);
assert.match(html, /navigator\.serviceWorker\.register\("\.\/sw\.js",\{scope:"\.\/"\}\)/);

const listeners = {};
const cachedRequests = new Map();
const cache = {
  addAll: async requests => requests.forEach(request => cachedRequests.set(String(request), { source: "precache", ok: true })),
  put: async (request, response) => cachedRequests.set(request.url || String(request), response)
};
const context = {
  URL,
  Response,
  Promise,
  caches: {
    open: async () => cache,
    keys: async () => ["ava-platform-v1.4.1", "unrelated-cache"],
    delete: async name => name === "ava-platform-v1.4.1",
    match: async request => cachedRequests.get(request.url || String(request))
  },
  fetch: async request => ({ ok: true, type: "basic", source: "network", clone() { return this; }, request }),
  self: {
    location: { origin: "https://ivancww.github.io" },
    registration: { scope: "https://ivancww.github.io/avaplatform/" },
    clients: { claim: async () => undefined },
    skipWaiting: async () => undefined,
    addEventListener: (type, listener) => { listeners[type] = listener; }
  }
};
vm.runInNewContext(fs.readFileSync("sw.js", "utf8"), context);

async function dispatchLifecycle(type) {
  let task;
  listeners[type]({ waitUntil: promise => { task = promise; } });
  await task;
}

async function dispatchFetch(request) {
  let responsePromise;
  const background = [];
  listeners.fetch({
    request,
    respondWith: promise => { responsePromise = promise; },
    waitUntil: promise => background.push(promise)
  });
  const response = responsePromise && await responsePromise;
  await Promise.all(background);
  return response;
}

(async () => {
  await dispatchLifecycle("install");
  await dispatchLifecycle("activate");

  for (const asset of [
    "./manifest.webmanifest",
    "./ava-storage.js",
    "./ava-192.png",
    "./ava-512.png",
    "./ava-maskable-512.png",
    "./modules/medsave-adapter.js",
    "./modules/medsave/index.html"
  ]) assert.equal(cachedRequests.get(asset).source, "precache");

  const getRequest = { method: "GET", url: "https://ivancww.github.io/avaplatform/index.html", mode: "navigate" };
  assert.equal((await dispatchFetch(getRequest)).source, "network");
  assert.equal(cachedRequests.get(getRequest.url).source, "network");

  context.fetch = async () => { throw new Error("offline"); };
  assert.equal((await dispatchFetch(getRequest)).source, "network");

  let postHandled = false;
  listeners.fetch({
    request: { method: "POST", url: "https://script.google.com/macros/s/write" },
    respondWith: () => { postHandled = true; },
    waitUntil: () => undefined
  });
  assert.equal(postHandled, false);

  console.log("AVA root manifest, iOS/Android icons, registration, lifecycle, network-first fallback, and write bypass tests passed");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
