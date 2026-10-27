const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const lifecycleSource = fs.readFileSync("ava-lifecycle.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const auth = fs.readFileSync("ava-admin-auth.js", "utf8");
const gas = fs.readFileSync("gas/Code.gs", "utf8");

function lifecycleAt(search, state) {
  const memory = new Map(state ? [["ava:platform:lifecycle-v1", JSON.stringify(state)]] : []);
  const context = {
    URL,
    URLSearchParams,
    location: { href: `https://example.test/avaplatform/${search}`, search },
    matchMedia: () => ({ matches: false }),
    navigator: { standalone: false },
    localStorage: { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) }
  };
  vm.runInNewContext(lifecycleSource, context);
  return context.AVALifecycle;
}

const normalBrowser = lifecycleAt("");
assert.equal(normalBrowser.needsInstallationGateway(), true, "normal browser Front entry keeps the installation gate");
assert.equal(normalBrowser.isBrowserAdminEntry(), false);

const userBrowser = lifecycleAt("?avaSurface=user");
assert.equal(userBrowser.needsInstallationGateway(), true, "normal browser User entry keeps the installation gate");
assert.equal(userBrowser.isBrowserAdminEntry(), false);
const initializedUserReturn = lifecycleAt("?avaSurface=user", { initialized: true, onboardingCompleted: true, userName: "Existing User" });
assert.equal(initializedUserReturn.isInitializedBrowserUserReturn(), true, "explicit return recognizes an initialized, onboarded User");
assert.equal(initializedUserReturn.needsInstallationGateway(), false, "initialized User return bypasses install guidance");
assert.equal(lifecycleAt("?avaSurface=user", { initialized: true, onboardingCompleted: false }).needsInstallationGateway(), true, "incomplete onboarding retains install guidance");
assert.equal(lifecycleAt("", { initialized: true, onboardingCompleted: true }).needsInstallationGateway(), true, "bare browser entry retains normal installation rules");

const adminBrowser = lifecycleAt("?avaSurface=admin");
assert.equal(adminBrowser.needsInstallationGateway(), false, "browser Admin entry bypasses only installation guidance");
assert.equal(adminBrowser.isBrowserAdminEntry(), true);

const appAdminEntry = lifecycleAt("?avaEntry=admin");
assert.equal(appAdminEntry.needsInstallationGateway(), true, "Independent App routing cannot bypass the Platform installation gate");
assert.equal(appAdminEntry.isBrowserAdminEntry(), false, "avaEntry=admin is not Platform Admin authority");
const registryStart = html.indexOf("const MODULE_REGISTRY=");
const registryEnd = html.indexOf("]);\nfunction hasCanonicalEntry", registryStart);
const registryContext = {};
vm.runInNewContext(html.slice(registryStart, registryEnd + 2) + ";globalThis.registry=MODULE_REGISTRY;", registryContext);
const everbliss = registryContext.registry.filter(module => module.id === "everbliss");
assert.equal(everbliss.length, 1);
assert.equal(everbliss[0].capabilities.admin, true, "registry capability permits Studio to launch EverBliss");
assert.equal(appAdminEntry.isBrowserAdminEntry(), false, "registry capability does not authorize direct app entry");

assert.match(html, /if\(AVALifecycle\.isBrowserAdminEntry\(\)\)\{\s*document\.body\.classList\.add\("ava-browser-admin-entry"\);\s*openStudio\(\);\s*return;/, "browser Admin entry opens the existing Studio and stops before normal startup");
assert.match(html, /body\.ava-browser-admin-entry \.app\{display:none\}/, "normal Front/User Platform UI remains hidden");
assert.match(html, /function openStudio\(\)\{[^\n]+Boolean\(AVAAdminAuth\.sessionToken\(\)\)[^\n]+studioLogin\.hidden=authenticated;studioEditor\.hidden=!authenticated/, "the Admin Hub stays hidden until authentication");
assert.match(html, /studioLoginForm\.addEventListener\("submit"[^\n]+AVAHomepageCloud\.authenticate\(studioPassword\.value\)/, "the existing Unified Admin password login remains mandatory");
assert.match(html, /function closeStudio\(\)\{if\(AVALifecycle\.isBrowserAdminEntry\(\)\)return location\.replace\(AVALifecycle\.installationUrl\(\)\)/, "exiting browser Admin returns to installation guidance");
const bootstrapStart = html.indexOf('document.addEventListener("DOMContentLoaded"');
const adminEntryStart = html.indexOf("if(AVALifecycle.isBrowserAdminEntry())", bootstrapStart);
const normalStartup = html.indexOf("loadOrder();loadBranding();updateNotificationBadge()", bootstrapStart);
assert.ok(adminEntryStart < normalStartup, "Admin entry returns before normal User initialization");
const adminBootstrap = html.slice(adminEntryStart, normalStartup);
assert.doesNotMatch(adminBootstrap, /completeOnboarding|initializeFirstRun|localStorage/, "Admin routing cannot initialize or complete User onboarding");
assert.doesNotMatch(lifecycleSource, /localStorage\.setItem\([^)]*(install|admin)/i, "Admin routing fabricates no installed or Admin state");

assert.match(html, /AVAAdminAuth\.launchAdminApp\(module\.id,destination\)/, "Independent App launch authorization remains in use");
assert.match(auth, /sessionStorage/);
assert.doesNotMatch(auth, /localStorage|indexedDB/);
for (const action of ["authenticateAdmin", "logoutAdmin", "issueAdminSession", "exchangeAdminSession", "verifyAdminSession"]) {
  assert.match(gas, new RegExp(action), `${action} remains available in the unchanged Platform GAS contract`);
}

console.log("Secure browser Admin routing, installation separation, authentication, and onboarding regression checks passed");
