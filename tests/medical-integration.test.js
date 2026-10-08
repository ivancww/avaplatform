const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const documentation = fs.readFileSync("docs/medical-module-integration.md", "utf8");
const registrations = html.match(/Object\.freeze\(\{id:"medical"[^\n]+/g) || [];
assert.equal(registrations.length, 1);
const registration = registrations[0];

assert.match(registration, /moduleId:"medical"/);
assert.match(registration, /name:"Medical",displayNameZh:"醫療"/);
assert.match(registration, /icon:"medical",category:"medical",area:"workspace",order:60/);
assert.match(registration, /enabled:true,visible:true,allowFavorite:true/);
assert.match(registration, /entry:"https:\/\/ivancww\.github\.io\/medical\/"/);
assert.match(registration, /entryModes:Object\.freeze\(\{frontend:"https:\/\/ivancww\.github\.io\/medical\/\?avaEntry=frontend",user:"https:\/\/ivancww\.github\.io\/medical\/\?avaEntry=user",admin:"https:\/\/ivancww\.github\.io\/medical\/\?avaEntry=admin"\}\)/);
assert.match(registration, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /userSettings:true,adminSettings:true/);
assert.match(registration, /integrationVersion:"medical-main@d71e92a8107c49ef7b0b7a2db702fb50632f4789"/);
assert.doesNotMatch(registration, /deployment-pending/);
assert.match(html, /if\(module\.availability==="deployment-pending"\)/);
assert.match(html, /supportsAppSurface\(module,entryMode\)/);
assert.match(html, /AVAAdminAuth\.launchAdminApp\(module\.id,destination\)/);
assert.doesNotMatch(registration, /sessionToken|password|allowlist/i);
assert.match(html, /title\.textContent=presentation\?\.title\|\|module\.displayNameZh\|\|module\.name/);
assert.doesNotMatch(html, /modules\/medical\//);
assert.match(documentation, /does not copy Medical source/);
assert.match(documentation, /HTTP 200/);
assert.match(documentation, /avaEntry=admin/);
assert.match(documentation, /does not\s+currently provide an Official write endpoint/);
assert.match(documentation, /d71e92a8107c49ef7b0b7a2db702fb50632f4789/);
assert.match(documentation, /avaEntry=user/);
assert.match(documentation, /Ready or Not\s+Ready automatically/);
assert.match(documentation, /direct same-window/);

console.log("AVA Medical independent-module registration, Home, User/Admin routing, boundary and safe unavailable-state tests passed");
