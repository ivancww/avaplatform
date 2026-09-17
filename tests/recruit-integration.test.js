const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const serviceWorker = fs.readFileSync("sw.js", "utf8");
const documentation = fs.readFileSync("docs/recruit-module-integration.md", "utf8");
const registration = html.match(/Object\.freeze\(\{id:"recruit"[^\n]+/)[0];

assert.match(registration, /moduleId:"recruit"/);
assert.match(registration, /name:"AVA Recruit · Career Discovery"/);
assert.match(registration, /icon:"user-plus",category:"recruitment",area:"grow",order:50/);
assert.match(registration, /enabled:true,visible:true,allowFavorite:true/);
assert.match(registration, /userSettings:true,adminSettings:true/);
assert.match(registration, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(registration, /frontend:"https:\/\/ivancww\.github\.io\/recruit\/index\.html\?avaEntry=frontend"/);
assert.match(registration, /user:"https:\/\/ivancww\.github\.io\/recruit\/index\.html\?avaEntry=user"/);
assert.match(registration, /admin:"https:\/\/ivancww\.github\.io\/recruit\/index\.html\?avaEntry=admin"/);
assert.match(html, /onclick="openModule\('recruit'\)"/);
assert.doesNotMatch(serviceWorker, /recruit\/index\.html/);
assert.match(documentation, /does not copy, embed,\s+rebuild or cache Recruit source code/);

console.log("AVA Recruit independent-module Phase 2 integration tests passed");
