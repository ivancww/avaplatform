const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const release = JSON.parse(fs.readFileSync("platform-release.json", "utf8"));
const start = html.indexOf("const MODULE_REGISTRY=Object.freeze([");
const end = html.indexOf("]);\nfunction hasCanonicalEntry", start);
assert.ok(start >= 0 && end > start, "canonical app registry exists");
const registrySource = html.slice(start + "const MODULE_REGISTRY=Object.freeze(".length, end + 1);
const registry = vm.runInNewContext(registrySource);
const byId = new Map(registry.map(module => [module.id, module]));
assert.equal(registry.length, 7);
assert.equal(new Set(registry.map(module => module.id)).size, registry.length);

const everbliss = byId.get("everbliss");
assert.ok(everbliss, "EverBliss is registered once");
assert.equal(everbliss.repository, "ivancww/everbliss");
assert.equal(everbliss.name, "EverBliss");
assert.equal(everbliss.displayNameZh, "EverBliss");
assert.equal(everbliss.entry, "https://ivancww.github.io/everbliss/");
assert.equal(everbliss.entryModes.frontend, "https://ivancww.github.io/everbliss/?avaEntry=frontend");
assert.equal(everbliss.capabilities.frontend, true);
assert.equal(everbliss.capabilities.user, false, "User capability stays disabled pending same-Frontstage Edit Mode readiness");
assert.equal(everbliss.capabilities.admin, false, "Admin capability stays disabled pending live proof/backend compatibility");
assert.equal(everbliss.roleVisibility.user, false);
assert.equal(everbliss.roleVisibility.admin, false);
assert.equal(everbliss.defaultVisible, true);
assert.match(html, /defaultVisible:module\.defaultVisible\?\?index<4/);
assert.match(everbliss.description, /退休資產/);
assert.match(everbliss.integrationVersion, /^everbliss@aa026bd2f41304fe2a26e0b39acc255d0d0541a2$/);

for (const [id, url] of [
  ["5pay", "https://ivancww.github.io/5pay-saving-plan/"],
  ["medical", "https://ivancww.github.io/medical/"],
  ["critical-illness", "https://ivancww.github.io/critical-illness-/"],
  ["medicalreserve", "https://ivancww.github.io/medicalreserve/"],
  ["retire", "https://ivancww.github.io/Retire/"],
  ["crm", "https://ivancww.github.io/AVA-CRM/"]
]) assert.equal(byId.get(id).entry, url, `${id} production URL remains unchanged`);

assert.equal(release.version, "v1.14.5");
assert.equal(html.match(/const AVA_PLATFORM_VERSION="v1\.14\.5";/g)?.length, 1);
assert.match(release.sourceSha, /^[0-9a-f]{40}$/);

const docs = fs.readFileSync("docs/everbliss-platform-integration.md", "utf8");
assert.match(docs, /exchangeAdminSession/);
assert.match(docs, /same Frontstage in place/);
assert.match(docs, /AVA_ADMIN_APP_IDS=everbliss/);
assert.match(docs, /AVA_PLATFORM_ADMIN_ENDPOINT/);

const cloudContext = {};
vm.runInNewContext(fs.readFileSync("homepage-cloud.js", "utf8"), cloudContext);
const cloudConfig = cloudContext.AVAHomepageCloud.reconcile({
  version: "home-test",
  settings: { personalCardsEnabled: true, searchEnabled: true },
  cards: [{ id: "everbliss", module_key: "everbliss", title: "EverBliss", defaultVisible: true, order: 2 }]
}, { layout: [], items: [], settings: {} }, registry);
assert.equal(cloudConfig.config.items.length, 1);
assert.equal(cloudConfig.config.items[0].id, "everbliss");
assert.equal(cloudConfig.config.items[0].defaultVisible, true);

const openStart = html.indexOf("async function openModule(");
const openEnd = html.indexOf("\nfunction cardMoveSelect", openStart);
assert.ok(openStart >= 0 && openEnd > openStart);
const launches = [];
const launchContext = {
  MODULE_REGISTRY: registry,
  getModule: id => registry.find(module => module.id === id),
  supportsAppSurface: (module, surface) => Boolean(module && module.enabled !== false && module.visible !== false && module.capabilities?.[surface] === true && typeof module.entryModes?.[surface] === "string" && module.entryModes[surface].includes(`avaEntry=${surface}`)),
  AVALifecycle: { moduleState: () => ({ initialized: true, cloudVersion: "" }) },
  sessionStorage: { setItem() {} },
  window: { location: { href: "https://ivancww.github.io/avaplatform/", assign: url => launches.push(url) } },
  console: { info() {}, warn() {} },
  preserveAvaReturnSurface() {},
  prepareIndependentAppLaunch: async () => {},
  showToast() {}
};
vm.runInNewContext(`${html.slice(openStart, openEnd)};globalThis.launch=openModule;`, launchContext);
(async () => {
  await launchContext.launch("everbliss", "frontend");
  await launchContext.launch("everbliss", "user");
  await launchContext.launch("everbliss", "admin");
  assert.deepEqual(launches, ["https://ivancww.github.io/everbliss/?avaEntry=frontend"]);
  console.log("EverBliss Platform card, Front launch, User/Admin fail-closed capabilities, version and existing App URLs verified");
})().catch(error => { console.error(error); process.exitCode = 1; });
