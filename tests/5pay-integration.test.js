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
assert.match(registration, /integrationVersion:"5pay-saving-plan@7db8f5e4c1d187b5aabd563acbf500a41745cfef"/);
assert.doesNotMatch(registration, /sessionToken|password|grant|credential/i);
assert.match(html, /if\(entryMode==="admin"&&!module\.capabilities\?\.admin\)/);
assert.match(html, /AVAAdminAuth\.issueAppLaunch\(module\.id\)/);
assert.match(html, /AVAAdminAuth\.adminEntryUrl\(destination,launch\.launchTicket\)/);
assert.match(documentation, /does not copy Saving source/);
assert.match(documentation, /avaEntry=admin/);
assert.match(documentation, /7db8f5e4c1d187b5aabd563acbf500a41745cfef/);
assert.match(documentation, /legacy `modules\/5pay`/);
assert.match(documentation, /not the registered Saving deployment/);
assert.match(documentation, /parentHref/);
assert.match(documentation, /avaSurface=user/);
assert.match(documentation, /avaSurface=admin/);

console.log("5PAY external registry, frontend/user capability, Admin safety and ownership boundary checks passed");
