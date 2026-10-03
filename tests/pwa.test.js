const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));

assert.equal(manifest.id, "./");
assert.equal(manifest.start_url, "./");
assert.equal(manifest.scope, "/");
for (const [manifestUrl, expectedBase] of [
  ["https://ivancww.github.io/avaplatform/manifest.webmanifest", "https://ivancww.github.io/avaplatform/"],
  ["https://ava-preview.pages.dev/manifest.webmanifest", "https://ava-preview.pages.dev/"]
]) {
  assert.equal(new URL(manifest.start_url, manifestUrl).href, expectedBase);
  assert.equal(new URL(manifest.scope, manifestUrl).href, new URL("/", manifestUrl).href);
  assert.equal(new URL(manifest.id, manifestUrl).href, expectedBase);
}
assert.equal(manifest.display, "standalone");
assert.deepEqual(manifest.display_override, ["standalone"]);
assert.deepEqual(manifest.launch_handler, { client_mode: "navigate-existing" });
assert.equal(manifest.theme_color, "#2563eb");
assert.deepEqual(manifest.icons, [
  { src: "./ava-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "./ava-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "./ava-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
]);
assert.match(html, /<link rel="manifest" href="\.\/manifest\.webmanifest">/);
assert.match(html, /<link rel="apple-touch-icon" sizes="192x192" href="\.\/ava-192\.png">/);
assert.match(html, /navigator\.serviceWorker\.register\("\.\/sw\.js",\{scope:"\.\/",updateViaCache:"none"\}\)/);
assert.match(html, /controllerchange/);
assert.match(html, /registration=>registration\.update\(\)/);
assert.match(html, /if\(refreshing\)return/);
assert.doesNotMatch(fs.readFileSync("sw.js", "utf8"), /localStorage\.clear|indexedDB\.deleteDatabase/);
assert.match(fs.readFileSync("sw.js", "utf8"), /PLATFORM_BASE_PATH/);
assert.doesNotMatch(fs.readFileSync("sw.js", "utf8"), /INDEPENDENT_APP_PATHS/);

const listeners = {};
const cachedRequests = new Map();
const deletedCaches = [];
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
    delete: async name => { deletedCaches.push(name); return name === "ava-platform-v1.4.1"; },
    match: async request => cachedRequests.get(request.url || String(request))
  },
  fetch: async request => ({ ok: true, type: "basic", source: "network", clone() { return this; }, request }),
  self: {
    location: { origin: "https://ivancww.github.io", href: "https://ivancww.github.io/avaplatform/sw.js" },
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
  assert.deepEqual(deletedCaches, ["ava-platform-v1.4.1"], "only obsolete AVA Platform Shell caches are retired");

  for (const asset of [
    "./manifest.webmanifest",
    "./module-gateway.html",
    "./ava-storage.js",
    "./ava-192.png",
    "./ava-512.png",
    "./ava-maskable-512.png",
    "./modules/medsave-adapter.js",
    "./modules/medsave/index.html"
  ]) assert.equal(cachedRequests.get(asset).source, "precache");

  const getRequest = { method: "GET", url: "https://ivancww.github.io/avaplatform/index.html", mode: "navigate" };
  assert.equal((await dispatchFetch(getRequest)).source, "network", "navigation discovers the newest AVA shell when online");
  assert.equal(cachedRequests.get(getRequest.url).source, "network");

  context.fetch = async () => { throw new Error("offline"); };
  assert.equal((await dispatchFetch(getRequest)).source, "network", "cached navigation shell remains available when network refresh fails");

  // Also exercise a deployment where the Platform worker is truly root-scoped.
  context.self.registration.scope = "https://ivancww.github.io/";
  for (const appPath of ["/medical/", "/5pay-saving-plan/", "/critical-illness-/", "/future-independent-app/"]) {
    assert.equal(await dispatchFetch({method:"GET", url:`https://ivancww.github.io${appPath}`, mode:"navigate"}), undefined, "Platform SW does not handle Independent App navigation");
    assert.equal(await dispatchFetch({method:"GET", url:`https://ivancww.github.io${appPath}sw.js`, destination:"script"}), undefined, "Platform SW does not handle Independent App workers/assets");
  }

  let postHandled = false;
  listeners.fetch({
    request: { method: "POST", url: "https://script.google.com/macros/s/write" },
    respondWith: () => { postHandled = true; },
    waitUntil: () => undefined
  });
  assert.equal(postHandled, false);

  console.log("AVA root manifest, iOS/Android icons, registration, lifecycle, network-first shell fallback, and write bypass tests passed");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
