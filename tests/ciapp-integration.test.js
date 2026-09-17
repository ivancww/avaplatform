const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const serviceWorker = fs.readFileSync("sw.js", "utf8");
const documentation = fs.readFileSync("docs/ciapp-module-integration.md", "utf8");

const registration = html.match(/Object\.freeze\(\{id:"ci-protection"[^\n]+/)[0];

assert.match(registration, /moduleId:"ci-protection"/);
assert.match(registration, /icon:"heart"/);
assert.match(registration, /category:"protection"/);
assert.match(registration, /enabled:true,visible:true,allowFavorite:true/);
assert.match(registration, /userSettings:true,adminSettings:true/);
assert.match(registration, /frontend:"\.\.\/CIApp\/\?mode=frontend"/);
assert.match(registration, /user:"\.\.\/CIApp\/\?mode=user"/);
assert.match(registration, /admin:"\.\.\/CIApp\/\?mode=admin"/);

assert.doesNotMatch(serviceWorker, /CIApp/);
assert.match(documentation, /does not copy, embed,[\s\S]*CIApp source code/);
assert.match(documentation, /AVA does not pass credentials or grant Admin authority/);
assert.match(documentation, /user-owned IndexedDB provider/);

console.log("CIApp independent-module Phase 2 integration tests passed");
