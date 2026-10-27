const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const registrySource = html.slice(html.indexOf("const MODULE_REGISTRY="), html.indexOf("const ICONS="));
const context = { URL, URLSearchParams };
vm.runInNewContext(`${registrySource};globalThis.registry=MODULE_REGISTRY;globalThis.userModules=registeredModulesForSurface("user");globalThis.adminModules=registeredModulesForSurface("admin");`, context);
const requiredApps = ["5pay", "medical", "critical-illness", "medicalreserve", "retire", "crm", "everbliss"];
for (const id of requiredApps) {
  const app = context.registry.find(module => module.id === id);
  assert.ok(app, `${id} is registered`);
  assert.equal(app.entryModes.user, `${app.entry}?avaEntry=user`, `${id} has its canonical User entry`);
  assert.equal(app.capabilities.user, true, `${id} is User-capable`);
  assert.ok(context.userModules.includes(app), `${id} appears in the generic User directory`);
}
const returnHelpers = html.slice(html.indexOf("function preserveAvaReturnSurface"), html.indexOf("function downloadBackup"));
assert.match(returnHelpers, /function preserveAvaReturnSurface\(entryMode\)[\s\S]*?searchParams\.set\("avaSurface",entryMode\)/);
assert.match(returnHelpers, /function restoreAvaReturnSurface\(surface\)[\s\S]*?if\(surface==="admin"&&!AVAAdminAuth\.sessionToken\(\)\)\{openStudio\(\);return\}[\s\S]*?openModuleDirectory\(surface\)/);
assert.match(html, /moduleDirectoryTitle/);
assert.match(html.slice(html.indexOf("function openModuleDirectory"), html.indexOf("function openUserModuleSettings")), /"我的流程"/);
assert.equal(context.adminModules.filter(module => module.id === "everbliss").length, 1, "EverBliss appears once in the Admin-capable directory");
assert.equal(context.adminModules.find(module => module.id === "everbliss").entryModes.admin, "https://ivancww.github.io/everbliss/?avaEntry=admin");
assert.match(html, /if\(surface==="admin"&&!AVAAdminAuth\.sessionToken\(\)\)\{openStudio\(\);return\}/, "User routing does not skip or weaken the separate Admin authentication gate");
const restored = [];
const secureContext = { AVAAdminAuth: { sessionToken: () => "" }, openStudio: () => restored.push("secure-admin-login"), openModuleDirectory: surface => restored.push(surface) };
vm.runInNewContext(returnHelpers.slice(returnHelpers.indexOf("function restoreAvaReturnSurface")), secureContext);
secureContext.restoreAvaReturnSurface("user");
assert.deepEqual(restored, ["user"], "explicit User return restores the generic My Journeys directory");
secureContext.restoreAvaReturnSurface("admin");
assert.deepEqual(restored, ["user", "secure-admin-login"], "Admin return still opens authentication instead of the User directory");
console.log("Generic User return directory and canonical routes for 5PAY, Medical, Critical Illness, Medical Reserve, Retire, CRM and EverBliss passed");
