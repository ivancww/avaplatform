const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
require("../ava-lifecycle.js");
require("../homepage-preferences.js");
require("../homepage-cloud.js");

const lifecycle = globalThis.AVALifecycle;
const cloud = globalThis.AVAHomepageCloud;
const html = fs.readFileSync("index.html", "utf8");
const worker = fs.readFileSync("sw.js", "utf8");
const lifecycleSource = fs.readFileSync("ava-lifecycle.js", "utf8");
const memory = new Map();
const storage = {
  getItem: key => memory.get(key) || null,
  setItem: (key, value) => memory.set(key, value)
};
const bundled = { version: "local", layout: [], settings: {}, items: [{ id: "a", defaultVisible: true, order: 0 }] };
const registry = [{ id: "a", entry: "/a", entryModes: {} }];
const good = { success: true, data: { settings: { homepage_version: "cloud-1" }, cards: [{ id: "a", module_key: "a", title: "Cloud A" }] } };
const response = payload => ({ ok: true, json: async () => payload });

(async () => {
  let calls = 0;
  let result = await cloud.load({ storage, bundled, registry, requireCloud: true, fetchImpl: async () => { calls++; return response(good); } });
  assert.equal(calls, 1, "one mandatory sync call establishes the initial Official baseline");
  assert.equal(result.source, "cloud");
  lifecycle.completeOfficialInitialization(result.config.version, storage);
  assert.equal(lifecycle.read(storage).initialized, true);
  assert.ok(cloud.readCache(storage), "initialization requires a persisted LKG");

  result = await cloud.load({ storage, bundled, registry, requireCloud: true, fetchImpl: async () => response({ success: true, data: { cards: [], settings: {} } }) });
  assert.equal(result.code, "INVALID_SCHEMA", "empty response cannot complete initialization");
  assert.equal(lifecycle.read(storage).initialized, true, "a failed retry does not erase an already valid Official stage");

  const later = await cloud.load({ storage, bundled, registry, fetchImpl: async () => { throw new Error("offline"); } });
  assert.equal(later.source, "cache", "later launch keeps and renders the existing LKG after cloud failure");
  assert.equal(later.config.version, "cloud-1");

  const retryStorage = { getItem: () => null, setItem: () => { throw new Error("quota"); } };
  result = await cloud.load({ storage: retryStorage, bundled, registry, requireCloud: true, fetchImpl: async () => response(good) });
  assert.equal(result.code, "CACHE_PERSIST_ERROR", "cache persistence is required for baseline success");

  lifecycle.completeOnboarding("A User", storage);
  assert.equal(lifecycle.read(storage).userName, "A User");
  assert.equal(storage.getItem("ava:platform:user-name"), "A User");

  const preference = globalThis.AVAHomepage.normalizePreference({ officialOverrides: { a: { title: "My A" } } });
  assert.equal(globalThis.AVAHomepage.merge(result.config || bundled, preference).official[0].title, "My A", "User override wins over Official default");

  assert.match(html, /body:not\(\.ava-ready\) \.app\{display:none\}/, "Home remains hidden until first-run completion");
  assert.match(html, /if\(AVALifecycle\.needsInstallationGateway\(\)\)return location\.replace\(AVALifecycle\.installationUrl\(\)\)/, "browser entry routes to installation guidance");
  assert.match(html, /onboardingCompleted\)\{[^}]*ava-ready/s, "onboarding completion reveals Home");
  assert.match(html, /syncOfficialHomepage\(\{requireCloud:true\}\)/, "first-run initialization owns the required cloud request");
  assert.match(html, /if\(officialSyncPromise\)return officialSyncPromise/, "retry cannot create parallel sync requests");
  assert.doesNotMatch(html, /syncOfficialHomepage\(\)\.then\(\(\)=>initializeFirstRun\(\)\)/, "startup does not initiate a second sync");
  assert.match(lifecycleSource, /function completeOfficialInitialization/);
  assert.match(lifecycleSource, /function completeOnboarding/);
  const browserContext = { URL, URLSearchParams, navigator: { standalone: false }, matchMedia: () => ({ matches: false }), location: { search: "", href: "https://example.test/avaplatform/" } };
  vm.runInNewContext(lifecycleSource, browserContext);
  assert.equal(browserContext.AVALifecycle.needsInstallationGateway(), true, "ordinary browser entry requires installation guidance");
  assert.equal(browserContext.AVALifecycle.read(storage).onboardingCompleted, false, "browser entry does not complete onboarding");
  assert.match(worker, /request\.mode === "navigate"[\s\S]*caches\.match\(request\)/, "navigation uses local shell before network refresh");
  assert.match(html, /const cached=AVAHomepageCloud\.readCache\(localStorage\)[\s\S]*renderModules\(\);updateGreeting\(\);document\.body\.classList\.add\("ava-ready"\);syncOfficialHomepage\(\)/, "later launch renders local LKG before background sync");

  console.log("AVA first-run lifecycle regression checks passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
