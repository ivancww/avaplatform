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
assert.match(registration, /entryModes:Object\.freeze\(\{frontend:"https:\/\/ivancww\.github\.io\/critical-illness-\/\?avaEntry=frontend",user:"https:\/\/ivancww\.github\.io\/critical-illness-\/\?avaEntry=user"\}\)/);
assert.match(registration, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:false\}\)/);
assert.match(registration, /userSettings:true,adminSettings:false/);
assert.match(registration, /integrationVersion:"critical-illness-@2903eed4e59cd852aa42ecd9d8726115c7717b3a"/);
assert.doesNotMatch(registration, /availability:"deployment-pending"/);
assert.doesNotMatch(registration, /module-gateway|CIApp/);
assert.match(html, /function openUserModuleSettings\(moduleId\)\{openModule\(moduleId,"user"\)\}/);
assert.match(html, /function preserveAvaReturnSurface\(entryMode\)/);
assert.match(html, /preserveAvaReturnSurface\(entryMode\);window\.location\.assign\(destination\)/);
assert.match(documentation, /Front: `\?avaEntry=frontend`/);
assert.match(documentation, /User: `\?avaEntry=user`/);
assert.match(documentation, /Admin: unsupported/);
assert.match(documentation, /https:\/\/ivancww\.github\.io\/critical-illness-\//);
assert.match(documentation, /2903eed4e59cd852aa42ecd9d8726115c7717b3a/);
assert.match(documentation, /caller-provided return context/);

console.log("Critical Illness production registry and ownership tests passed");
