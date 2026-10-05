const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const registrySource = html.slice(html.indexOf("const MODULE_REGISTRY="), html.indexOf("const ICONS="));
const registryEntries = [...registrySource.matchAll(/Object\.freeze\(\{id:"([^"]+)"[^\n]+/g)].map(match => match[1]);

assert.deepEqual(registryEntries, ["5pay", "medical", "critical-illness", "medicalreserve", "retire", "crm"]);
assert.match(html, /id="studioHub"/);
assert.match(html, /id="studioAppDirectory"/);
assert.match(html, /registeredModulesForSurface\("admin"\)/);
assert.match(html, /registeredModulesForSurface\(scope\)/);
assert.match(html, /manage\.onclick=\(\)=>openAdminModuleSettings\(module\.id\)/);
assert.match(html, /showStudioHub\(\)/);
assert.match(html, /openStudioPlatformManagement\(\)/);
assert.doesNotMatch(html, /studioAppDirectory[\s\S]{0,2000}(Medical|Critical Illness|5PAY)/, "Studio directory must not hardcode App names");
assert.doesNotMatch(html, /integrationVersion.*studioAppDirectory|studioAppDirectory.*integrationVersion/, "Registry integration metadata must not be shown as App version");

for (const id of ["5pay", "medical", "medicalreserve", "critical-illness", "retire"]) {
  const registration = html.match(new RegExp(`Object\\.freeze\\(\\{id:"${id}"[^\\n]+`))[0];
  assert.match(registration, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
  assert.match(registration, /entryModes:Object\.freeze\(\{[^\n]+admin:"[^"]+avaEntry=admin/);
}
const crmRegistration = html.match(/Object\.freeze\(\{id:"crm"[^\n]+/)[0];
assert.match(crmRegistration, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:false\}\)/);
assert.doesNotMatch(crmRegistration, /avaEntry=admin/);

assert.match(html, /function openStudio\(\)\{[^\n]+Boolean\(AVAAdminAuth\.sessionToken\(\)\)/);
assert.match(html, /AVAAdminAuth\.issueAppLaunch/);
assert.doesNotMatch(html, /localStorage\.clear\(|indexedDB\.deleteDatabase\(/);

const vm = require("node:vm");
const context = {};
vm.runInNewContext(`${registrySource};globalThis.registry=MODULE_REGISTRY;globalThis.surface=registeredModulesForSurface;globalThis.supports=supportsAppSurface;`, context);
const futureApp = {id:"future", enabled:true, visible:true, capabilities:{frontend:true,user:true,admin:true}, entryModes:{frontend:"https://future.test/?avaEntry=frontend", user:"https://future.test/?avaEntry=user", admin:"https://future.test/?avaEntry=admin"}};
const userOnlyAdminApp = {id:"future-no-admin", enabled:true, visible:true, capabilities:{frontend:true,user:true,admin:false}, entryModes:{frontend:"https://future.test/?avaEntry=frontend", user:"https://future.test/?avaEntry=user"}};
assert.deepEqual(["frontend", "user", "admin"].filter(surface => context.supports(futureApp, surface)), ["frontend", "user", "admin"]);
assert.equal(context.supports(userOnlyAdminApp, "admin"), false);
assert.match(html, /function supportsAppSurface\(module,surface\)/);
assert.doesNotMatch(html, /FRONT_APP_LIST|USER_APP_LIST|ADMIN_APP_LIST/);
console.log("AVA Studio Admin Hub registry-driven directory and ownership-boundary checks passed");
