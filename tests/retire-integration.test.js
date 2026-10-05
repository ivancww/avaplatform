const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const registration = html.match(/Object\.freeze\(\{id:"retire"[^\n]+/)[0];

assert.match(registration, /moduleId:"retire",name:"Retire",displayNameZh:"退休規劃"/);
assert.match(registration, /entry:"https:\/\/ivancww\.github\.io\/Retire\/"/);
assert.match(registration, /entryModes:Object\.freeze\(\{frontend:"https:\/\/ivancww\.github\.io\/Retire\/\?avaEntry=frontend",user:"https:\/\/ivancww\.github\.io\/Retire\/\?avaEntry=user",admin:"https:\/\/ivancww\.github\.io\/Retire\/\?avaEntry=admin"\}\)/);
assert.match(registration, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /integrationVersion:"Retire-main@e1e01a524e3894154faa5252a012caa2c3ded26b"/);
assert.doesNotMatch(html, /modules\/retire\//);
assert.doesNotMatch(fs.readFileSync("sw.js", "utf8"), /retire/i);
assert.match(html, /registeredModulesForSurface\("admin"\)/);

console.log("Retire canonical registry, capability contract, Admin Hub discovery and independent shell boundary checks passed");
