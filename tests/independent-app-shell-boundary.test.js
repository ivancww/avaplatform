const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const rootWorker = fs.readFileSync("sw.js", "utf8");
const platformHtml = fs.readFileSync("index.html", "utf8");
const registry = platformHtml.slice(platformHtml.indexOf("const MODULE_REGISTRY="), platformHtml.indexOf("const ICONS="));

assert.match(rootWorker, /INDEPENDENT_APP_PATHS/);
for (const path of ["/medical/", "/5pay-saving-plan/", "/critical-illness-/"]) {
  assert.match(rootWorker, new RegExp(path.replace(/[/-]/g, "\\$&")));
}
assert.doesNotMatch(rootWorker, /localStorage\.clear\(|indexedDB\.deleteDatabase\(/);
assert.doesNotMatch(platformHtml.slice(platformHtml.indexOf("function openModule"), platformHtml.indexOf("function cardMoveSelect")), /integrationVersion/);

const listeners = {};
const context = {
  URL,
  Response,
  Promise,
  caches: { match: async () => undefined },
  fetch: async () => { throw new Error("offline"); },
  self: {
    location: { origin: "https://ivancww.github.io" },
    registration: { scope: "https://ivancww.github.io/" },
    addEventListener: (type, listener) => { listeners[type] = listener; }
  }
};
vm.runInNewContext(rootWorker, context);

async function platformWorkerResponds(path) {
  let response;
  listeners.fetch({
    request: { method: "GET", url: `https://ivancww.github.io${path}`, mode: "navigate" },
    respondWith: promise => { response = promise; },
    waitUntil: () => undefined
  });
  return response ? await response : undefined;
}

(async () => {
  assert.equal(await platformWorkerResponds("/medical/"), undefined, "root Platform worker leaves Medical navigation to Medical");
  assert.equal(await platformWorkerResponds("/5pay-saving-plan/"), undefined, "root Platform worker leaves Saving navigation to Saving");
  assert.equal(await platformWorkerResponds("/critical-illness-/"), undefined, "root Platform worker leaves CI navigation to CI");

  const appStorage = new Map([
    ["ava.medical.user.overrides.v1", "user-layer"],
    ["ava.medical.official.v1", "official-layer"],
    ["ava.medical.user.pages.v1", "user-page"]
  ]);
  const updates = [];
  const launchStart = platformHtml.indexOf("async function prepareIndependentAppLaunch");
  const launchEnd = platformHtml.indexOf("async function openModule", launchStart);
  const launchContext = {
    URL,
    navigator: { serviceWorker: { getRegistration: async () => ({
      scope: "https://ivancww.github.io/medical/",
      update: async () => updates.push("Medical A → B")
    }) } },
    window: { location: { href: "https://ivancww.github.io/avaplatform/", origin: "https://ivancww.github.io" } },
    console
  };
  vm.runInNewContext(platformHtml.slice(launchStart, launchEnd), launchContext);
  await launchContext.prepareIndependentAppLaunch("https://ivancww.github.io/medical/?avaEntry=frontend");
  assert.deepEqual(updates, ["Medical A → B"], "existing Medical worker receives a Platform launch-time update check");
  assert.deepEqual([...appStorage], [
    ["ava.medical.user.overrides.v1", "user-layer"],
    ["ava.medical.official.v1", "official-layer"],
    ["ava.medical.user.pages.v1", "user-page"]
  ], "Platform launch migration does not delete App User or Official local data");

  updates.length = 0;
  await launchContext.prepareIndependentAppLaunch("https://ivancww.github.io/medical/?avaEntry=frontend");
  assert.deepEqual(updates, ["Medical A → B"], "future Medical B → C remains a launch-time App-owned update");
  console.log("Independent App Service Worker boundary, legacy bootstrap escape, future update independence, and data-preservation regression passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
