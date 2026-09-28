const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const documentation = fs.readFileSync("docs/medical-module-integration.md", "utf8");
const registration = html.match(/Object\.freeze\(\{id:"medical"[^\n]+/)[0];

assert.match(registration, /moduleId:"medical"/);
assert.match(registration, /name:"Medical",displayNameZh:"醫療"/);
assert.match(registration, /icon:"medical",category:"medical",area:"workspace",order:60/);
assert.match(registration, /enabled:true,visible:true,allowFavorite:true/);
assert.match(registration, /entry:"https:\/\/ivancww\.github\.io\/medical\/"/);
assert.match(registration, /frontend:"https:\/\/ivancww\.github\.io\/medical\/\?avaEntry=frontend"/);
assert.match(registration, /user:"https:\/\/ivancww\.github\.io\/medical\/\?avaEntry=user"/);
assert.match(registration, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:false\}\)/);
assert.match(registration, /userSettings:true,adminSettings:false/);
assert.match(registration, /integrationVersion:"medical-main@d73c662f2d489bdf9051cfa437ec111334d5c635"/);
assert.doesNotMatch(registration, /deployment-pending/);
assert.match(html, /if\(module\.availability==="deployment-pending"\)/);
assert.match(html, /title\.textContent=presentation\?\.title\|\|module\.displayNameZh\|\|module\.name/);
assert.doesNotMatch(html, /modules\/medical\//);
assert.match(documentation, /does not copy Medical source/);
assert.match(documentation, /HTTP 200/);
assert.match(documentation, /does not implement an Admin entry mode/);
assert.match(documentation, /avaEntry=user/);
assert.match(documentation, /Ready or Not Ready automatically/);
assert.match(documentation, /same-origin iframe allowlist/);

console.log("AVA Medical independent-module registration, Home, User/Admin routing, boundary and safe unavailable-state tests passed");
