const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const documentation = fs.readFileSync("docs/medical-module-integration.md", "utf8");
const registration = html.match(/Object\.freeze\(\{id:"medical"[^\n]+/)[0];

assert.match(registration, /moduleId:"medical"/);
assert.match(registration, /name:"Medical",displayNameZh:"醫療"/);
assert.match(registration, /icon:"medical",category:"medical",area:"workspace",order:60/);
assert.match(registration, /enabled:true,visible:true,allowFavorite:true/);
assert.match(registration, /userSettings:true,adminSettings:true/);
for (const mode of ["frontend", "user", "admin"]) {
  assert.match(registration, new RegExp(`${mode}:"https://ivancww\\.github\\.io/medical/index\\.html\\?avaEntry=${mode}"`));
}
assert.match(registration, /availability:"deployment-pending"/);
assert.match(html, /module\.availability==="deployment-pending"/);
assert.match(html, /title\.textContent=presentation\?\.title\|\|module\.displayNameZh\|\|module\.name/);
assert.doesNotMatch(html, /modules\/medical\//);
assert.match(documentation, /does not copy Medical source/);
assert.match(documentation, /HTTP 404/);
assert.match(documentation, /same-origin iframe allowlist/);

console.log("AVA Medical independent-module registration, Home, User/Admin routing, boundary and safe unavailable-state tests passed");
