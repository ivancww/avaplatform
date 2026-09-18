const assert = require("node:assert/strict");
const fs = require("node:fs");

const gateway = fs.readFileSync("module-gateway.html", "utf8");
const root = fs.readFileSync("index.html", "utf8");
const worker = fs.readFileSync("sw.js", "utf8");
const study = fs.readFileSync("docs/single-home-screen-pwa-architecture.md", "utf8");

for (const mode of ["frontend", "user", "admin"]) {
  assert.match(root, new RegExp(`module-gateway\\.html\\?module=ciapp&mode=${mode}`));
}
assert.match(gateway, /path:"\.\.\/CIApp\/"/);
assert.match(gateway, /modes:Object\.freeze\(\["frontend","user","admin"\]\)/);
assert.match(gateway, /frame\.addEventListener\("load",connectModuleNavigation\)/);
assert.match(gateway, /function returnToAva\(\)\{window\.location\.assign\("\.\/"\)\}/);
assert.match(gateway, /isAvaReturn\(destination\)/);
assert.doesNotMatch(gateway, /target="_blank"|window\.open\(/);
assert.match(worker, /"\.\/module-gateway\.html"/);
assert.doesNotMatch(worker, /CIApp/);
assert.match(study, /physical installed-iPad run is required/);
assert.match(study, /localStorage` and IndexedDB are origin-scoped/);

console.log("Single AVA PWA CIApp gateway architecture tests passed");
