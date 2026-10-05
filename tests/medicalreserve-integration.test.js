const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const registration = html.match(/Object\.freeze\(\{id:"medicalreserve"[^\n]+/)[0];

assert.match(registration, /moduleId:"medicalreserve",name:"Medical Reserve",displayNameZh:"醫療儲備"/);
assert.match(registration, /entry:"https:\/\/ivancww\.github\.io\/medicalreserve\/"/);
assert.match(registration, /entryModes:Object\.freeze\(\{frontend:"https:\/\/ivancww\.github\.io\/medicalreserve\/\?avaEntry=frontend",user:"https:\/\/ivancww\.github\.io\/medicalreserve\/\?avaEntry=user",admin:"https:\/\/ivancww\.github\.io\/medicalreserve\/\?avaEntry=admin"\}\)/);
assert.match(registration, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /integrationVersion:"medicalreserve-main@9e4e481bf85d3c8f55825ff8e1be36dc35500f93"/);
assert.doesNotMatch(html, /modules\/medicalreserve\//);
assert.match(html, /function supportsAppSurface\(module,surface\)/);
assert.match(html, /if\(!supportsAppSurface\(module,entryMode\)\)return/);
assert.match(html, /prepareIndependentAppLaunch\(destination\)/);
assert.match(fs.readFileSync("sw.js", "utf8"), /Independent Apps remain outside/);
assert.doesNotMatch(fs.readFileSync("sw.js", "utf8"), /medicalreserve/);

console.log("Medical Reserve canonical registry, capability contract, independent source boundary and launch checks passed");
