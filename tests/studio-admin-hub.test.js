const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const registrySource = html.slice(html.indexOf("const MODULE_REGISTRY="), html.indexOf("const ICONS="));
const registryEntries = [...registrySource.matchAll(/Object\.freeze\(\{id:"([^"]+)"[^\n]+/g)].map(match => match[1]);

assert.deepEqual(registryEntries, ["5pay", "medical", "critical-illness"]);
assert.match(html, /id="studioHub"/);
assert.match(html, /id="studioAppDirectory"/);
assert.match(html, /module\.capabilities\?\.admin===true&&typeof module\.entryModes\?\.admin==="string"/);
assert.match(html, /manage\.onclick=\(\)=>openAdminModuleSettings\(module\.id\)/);
assert.match(html, /showStudioHub\(\)/);
assert.match(html, /openStudioPlatformManagement\(\)/);
assert.doesNotMatch(html, /studioAppDirectory[\s\S]{0,2000}(Medical|Critical Illness|5PAY)/, "Studio directory must not hardcode App names");
assert.doesNotMatch(html, /integrationVersion.*studioAppDirectory|studioAppDirectory.*integrationVersion/, "Registry integration metadata must not be shown as App version");

for (const id of ["5pay", "medical", "critical-illness"]) {
  const registration = html.match(new RegExp(`Object\\.freeze\\(\\{id:"${id}"[^\\n]+`))[0];
  assert.match(registration, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
  assert.match(registration, /entryModes:Object\.freeze\(\{[^\n]+admin:"[^"]+avaEntry=admin/);
}

assert.match(html, /function openStudio\(\)\{[^\n]+Boolean\(AVAAdminAuth\.sessionToken\(\)\)/);
assert.match(html, /AVAAdminAuth\.issueAppLaunch/);
assert.doesNotMatch(html, /localStorage\.clear\(|indexedDB\.deleteDatabase\(/);
console.log("AVA Studio Admin Hub registry-driven directory and ownership-boundary checks passed");
