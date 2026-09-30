const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const documentation = fs.readFileSync("docs/critical-illness-module-integration.md", "utf8");
const registrations = html.match(/Object\.freeze\(\{id:"critical-illness"[^\n]+/g) || [];

assert.equal(registrations.length, 1);
const registration = registrations[0];
assert.match(registration, /moduleId:"critical-illness"/);
assert.match(registration, /name:"Critical Illness",displayNameZh:"危疾保障"/);
assert.match(registration, /category:"protection",area:"workspace"/);
assert.match(registration, /entry:"https:\/\/ivancww\.github\.io\/critical-illness-\//);
assert.match(registration, /entryModes:Object\.freeze\(\{frontend:"https:\/\/ivancww\.github\.io\/critical-illness-\/\?avaEntry=frontend",user:"https:\/\/ivancww\.github\.io\/critical-illness-\/\?avaEntry=user",admin:"https:\/\/ivancww\.github\.io\/critical-illness-\/\?avaEntry=admin"\}\)/);
assert.match(registration, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /userSettings:true,adminSettings:true/);
assert.match(registration, /integrationVersion:"critical-illness-@af77e1c1122a921779c390e67a046766fa900492"/);
assert.doesNotMatch(registration, /availability:"deployment-pending"/);
assert.doesNotMatch(registration, /module-gateway|CIApp/);
assert.match(html, /function openUserModuleSettings\(moduleId\)\{openModule\(moduleId,"user"\)\}/);
assert.match(html, /function preserveAvaReturnSurface\(entryMode\)/);
assert.match(html, /preserveAvaReturnSurface\(entryMode\);const gateway=moduleGatewayUrl\(module\.id,entryMode\)/);
assert.match(documentation, /Front: `\?avaEntry=frontend`/);
assert.match(documentation, /User: `\?avaEntry=user`/);
assert.match(documentation, /Admin: `\?avaEntry=admin`/);
assert.match(documentation, /https:\/\/ivancww\.github\.io\/critical-illness-\//);
assert.match(documentation, /af77e1c1122a921779c390e67a046766fa900492/);
assert.match(documentation, /gateway URL/);

console.log("Critical Illness production registry and ownership tests passed");
