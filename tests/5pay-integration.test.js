const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const documentation = fs.readFileSync("docs/5pay-module-configuration.md", "utf8");
const registration = html.match(/Object\.freeze\(\{id:"5pay"[^\n]+/)[0];

assert.match(registration, /moduleId:"5pay",name:"5PAY Saving Plan"/);
assert.match(registration, /entry:"https:\/\/ivancww\.github\.io\/5pay-saving-plan\/"/);
assert.match(registration, /frontend:"https:\/\/ivancww\.github\.io\/5pay-saving-plan\/\?avaEntry=frontend"/);
assert.match(registration, /user:"https:\/\/ivancww\.github\.io\/5pay-saving-plan\/\?avaEntry=user"/);
assert.match(registration, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:false\}\)/);
assert.match(registration, /userSettings:true,adminSettings:false/);
assert.match(registration, /integrationVersion:"5pay-saving-plan@d02a6825be76c4a447ee9162b55837774b7ea715"/);
assert.doesNotMatch(registration, /avaEntry=admin/);
assert.match(documentation, /does not copy Saving source/);
assert.match(documentation, /no Admin route is registered/);
assert.match(documentation, /parentHref/);
assert.match(documentation, /avaSurface=user/);

console.log("5PAY external registry, frontend/user capability, Admin safety and ownership boundary checks passed");
