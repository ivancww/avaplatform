const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const rootWorker = fs.readFileSync("sw.js", "utf8");
const platformHtml = fs.readFileSync("index.html", "utf8");
const registry = platformHtml.slice(platformHtml.indexOf("const MODULE_REGISTRY="), platformHtml.indexOf("const ICONS="));

assert.match(rootWorker, /PLATFORM_BASE_PATH/);
assert.doesNotMatch(rootWorker, /INDEPENDENT_APP_PATHS/);
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
    location: { origin: "https://ivancww.github.io", href: "https://ivancww.github.io/avaplatform/sw.js" },
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
  for (const path of ["/medical/", "/5pay-saving-plan/", "/medicalreserve/", "/critical-illness-/", "/Retire/", "/future-independent-app/"]) {
    assert.equal(await platformWorkerResponds(path), undefined, `root Platform worker leaves ${path} navigation to its Independent App`);
    assert.equal(await platformWorkerResponds(`${path}sw.js`), undefined, `root Platform worker leaves ${path} worker/assets to its Independent App`);
  }
  assert.notEqual(await platformWorkerResponds("/avaplatform/"), undefined, "Platform worker still owns Platform Shell navigation");

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
      active: { scriptURL: "https://ivancww.github.io/medical/sw.js" },
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

  const futureUpdates = [];
  launchContext.navigator.serviceWorker.getRegistration = async () => ({
    scope: "https://ivancww.github.io/future-independent-app/",
    active: { scriptURL: "https://ivancww.github.io/future-independent-app/sw.js" },
    update: async () => futureUpdates.push("Future A → B")
  });
  await launchContext.prepareIndependentAppLaunch("https://ivancww.github.io/future-independent-app/?avaEntry=user");
  assert.deepEqual(futureUpdates, ["Future A → B"], "future App A → B uses its own worker without Platform code changes");
  futureUpdates.length = 0;
  launchContext.navigator.serviceWorker.getRegistration = async () => ({
    scope: "https://ivancww.github.io/future-independent-app/",
    active: { scriptURL: "https://ivancww.github.io/future-independent-app/sw.js" },
    update: async () => futureUpdates.push("Future B → C")
  });
  await launchContext.prepareIndependentAppLaunch("https://ivancww.github.io/future-independent-app/?avaEntry=admin");
  assert.deepEqual(futureUpdates, ["Future B → C"], "future App B → C remains independently deployable");

  let platformUpdates = 0;
  launchContext.navigator.serviceWorker.getRegistration = async () => ({
    scope: "https://ivancww.github.io/",
    active: { scriptURL: "https://ivancww.github.io/avaplatform/sw.js" },
    update: async () => { platformUpdates += 1; }
  });
  await launchContext.prepareIndependentAppLaunch("https://ivancww.github.io/future-independent-app/?avaEntry=frontend");
  assert.equal(platformUpdates, 0, "legacy broad Platform registration is not updated as the Independent App worker");

  launchContext.navigator.serviceWorker.getRegistration = async () => undefined;
  await launchContext.prepareIndependentAppLaunch("https://ivancww.github.io/future-independent-app/?avaEntry=frontend");

  launchContext.navigator.serviceWorker.getRegistration = async () => ({
    scope: "https://ivancww.github.io/future-independent-app/",
    active: { scriptURL: "https://ivancww.github.io/future-independent-app/sw.js" },
    update: async () => { throw new Error("offline"); }
  });
  await launchContext.prepareIndependentAppLaunch("https://ivancww.github.io/future-independent-app/?avaEntry=frontend");

  launchContext.navigator.serviceWorker.getRegistration = async () => ({
    scope: "https://ivancww.github.io/medical/",
    active: { scriptURL: "https://ivancww.github.io/medical/sw.js" },
    update: async () => updates.push("Medical B → C")
  });
  updates.length = 0;
  await launchContext.prepareIndependentAppLaunch("https://ivancww.github.io/medical/?avaEntry=frontend");
  assert.deepEqual(updates, ["Medical B → C"], "future Medical B → C remains a launch-time App-owned update");
  console.log("Independent App Service Worker boundary, legacy bootstrap escape, future update independence, and data-preservation regression passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
