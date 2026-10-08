const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const documentation = fs.readFileSync("docs/5pay-module-configuration.md", "utf8");
const registrations = html.match(/Object\.freeze\(\{id:"5pay"[^\n]+/g) || [];
assert.equal(registrations.length, 1);
const registration = registrations[0];

assert.match(registration, /moduleId:"5pay",name:"5PAY Saving Plan"/);
assert.match(registration, /entry:"https:\/\/ivancww\.github\.io\/5pay-saving-plan\/"/);
assert.match(registration, /entryModes:Object\.freeze\(\{frontend:"https:\/\/ivancww\.github\.io\/5pay-saving-plan\/\?avaEntry=frontend",user:"https:\/\/ivancww\.github\.io\/5pay-saving-plan\/\?avaEntry=user",admin:"https:\/\/ivancww\.github\.io\/5pay-saving-plan\/\?avaEntry=admin"\}\)/);
assert.match(registration, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /userSettings:true,adminSettings:true/);
assert.match(registration, /integrationVersion:"5pay-saving-plan@0545eb67aa21922f04b695d581cb8a88c470e4c2"/);
assert.doesNotMatch(registration, /sessionToken|password|grant|credential/i);
assert.match(html, /supportsAppSurface\(module,entryMode\)/);
assert.match(html, /AVAAdminAuth\.launchAdminApp\(module\.id,destination\)/);
assert.match(documentation, /does not copy Saving source/);
assert.match(documentation, /avaEntry=admin/);
assert.match(documentation, /0545eb67aa21922f04b695d581cb8a88c470e4c2/);
assert.match(documentation, /vendored `modules\/5pay` files are legacy compatibility/);
assert.match(documentation, /not the registered Saving deployment/);
assert.match(documentation, /AVA referrer context/);
assert.match(documentation, /avaSurface=user/);
assert.match(documentation, /avaSurface=admin/);

console.log("5PAY external registry, frontend/user capability, Admin safety and ownership boundary checks passed");
