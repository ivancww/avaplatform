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
assert.equal(everbliss.entryModes.user, "https://ivancww.github.io/everbliss/?avaEntry=user");
assert.equal(everbliss.entryModes.admin, "https://ivancww.github.io/everbliss/?avaEntry=admin");
assert.equal(registry.filter(module => module.id === "everbliss").length, 1);
assert.ok(registry.filter(module => module.capabilities.admin && module.entryModes.admin).some(module => module.id === "everbliss"));
assert.equal(everbliss.capabilities.frontend, true);
assert.equal(everbliss.capabilities.user, true, "live-verified same-Frontstage User capability is enabled after generic return routing repair");
assert.equal(everbliss.capabilities.admin, true, "Admin capability enables the trusted Studio launch path; it does not authorize direct entry");
assert.equal(everbliss.roleVisibility.user, true);
assert.equal(everbliss.roleVisibility.admin, true);
assert.equal(everbliss.userSettings, true);
assert.equal(everbliss.adminSettings, true);
assert.equal(everbliss.defaultVisible, true);
assert.match(html, /defaultVisible:module\.defaultVisible\?\?index<4/);
assert.match(everbliss.description, /退休資產/);
assert.match(everbliss.integrationVersion, /^everbliss@ae8d578b2c0fdc28ff2a671b48387089af7e8805$/);

for (const [id, url] of [
  ["5pay", "https://ivancww.github.io/5pay-saving-plan/"],
  ["medical", "https://ivancww.github.io/medical/"],
  ["critical-illness", "https://ivancww.github.io/critical-illness-/"],
  ["medicalreserve", "https://ivancww.github.io/medicalreserve/"],
  ["retire", "https://ivancww.github.io/Retire/"],
  ["crm", "https://ivancww.github.io/AVA-CRM/"]
]) assert.equal(byId.get(id).entry, url, `${id} production URL remains unchanged`);

assert.equal(release.version, "v1.15.3");
assert.equal(html.match(/const AVA_PLATFORM_VERSION="v1\.15\.3";/g)?.length, 1);
assert.match(release.sourceSha, /^[0-9a-f]{40}$/);

const docs = fs.readFileSync("docs/everbliss-platform-integration.md", "utf8");
assert.match(docs, /exchangeAdminSession/);
assert.match(docs, /same customer Frontstage in place/);
assert.match(docs, /AVA_ADMIN_APP_IDS=everbliss/);
assert.match(docs, /AVA_PLATFORM_ADMIN_ENDPOINT/);
assert.match(docs, /v0\.4\.0/);
assert.doesNotMatch(docs, /AVA_ADMIN_VERIFY_URL|AVA_ADMIN_VERIFY_TOKEN|v0\.3\.0|separate User Edit page/i);

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
  showToast() {},
  AVAAdminAuth: {launchAdminApp: async (id, url) => launches.push(url)}
};
vm.runInNewContext(`${html.slice(openStart, openEnd)};globalThis.launch=openModule;`, launchContext);
(async () => {
  await launchContext.launch("everbliss", "frontend");
  await launchContext.launch("everbliss", "user");
  await launchContext.launch("everbliss", "admin");
  assert.deepEqual(launches, ["https://ivancww.github.io/everbliss/?avaEntry=frontend", "https://ivancww.github.io/everbliss/?avaEntry=user", "https://ivancww.github.io/everbliss/?avaEntry=admin"]);
  console.log("EverBliss v0.4.0 Platform card, Front/User/Admin launch destinations via Platform Admin auth and integration baseline verified");
})().catch(error => { console.error(error); process.exitCode = 1; });
