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
assert.match(registration, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:false\}\)/);
assert.match(registration, /userSettings:true,adminSettings:false/);
assert.match(registration, /availability:"deployment-pending"/);
assert.match(registration, /integrationVersion:"critical-illness-@278ed69a089c4747f274490bacdf07593c30f17d"/);
assert.match(registration, /entryModes:Object\.freeze\(\{\}\)/);
assert.doesNotMatch(registration, /https?:\/\//);
assert.match(html, /if\(module\.availability==="deployment-pending"\)/);
assert.match(html, /function openUserModuleSettings\(moduleId\)\{openModule\(moduleId,"user"\)\}/);
assert.match(html, /function preserveAvaReturnSurface\(entryMode\)/);
assert.match(html, /preserveAvaReturnSurface\(entryMode\);window\.location\.assign\(destination\)/);
assert.match(documentation, /Front: `\?avaEntry=frontend`/);
assert.match(documentation, /User: `\?avaEntry=user`/);
assert.match(documentation, /Admin: unsupported/);
assert.match(documentation, /caller-provided return context/);
assert.match(documentation, /no fabricated `entry` or `entryModes` URL/);

console.log("Critical Illness pending-deployment registry and ownership tests passed");
