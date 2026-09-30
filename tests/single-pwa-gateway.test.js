const assert = require("node:assert/strict");
const fs = require("node:fs");

const gateway = fs.readFileSync("module-gateway.html", "utf8");
const root = fs.readFileSync("index.html", "utf8");
const worker = fs.readFileSync("sw.js", "utf8");
const study = fs.readFileSync("docs/single-home-screen-pwa-architecture.md", "utf8");

assert.match(root, /function moduleGatewayUrl\(moduleId,entryMode,launchTicket=""\)/);
for (const moduleId of ["medical", "5pay", "critical-illness"]) {
  assert.match(gateway, new RegExp(`${moduleId.replace("-", "\\-")}.*modes:Object\\.freeze\\(\\["frontend","user","admin"\\]\\)`));
}
assert.match(gateway, /path:"\.\.\/CIApp\/"/);
assert.match(gateway, /path:"\.\.\/medical\/"/);
assert.match(gateway, /path:"\.\.\/5pay-saving-plan\/"/);
assert.match(gateway, /path:"\.\.\/critical-illness-\/"/);
assert.match(gateway, /entryParameter:"mode",adminTicketRequired:false/);
assert.match(gateway, /destination\.searchParams\.set\(moduleConfig\.entryParameter\|\|"avaEntry",requestedMode\)/);
assert.match(gateway, /requestedMode==="admin"&&\(moduleConfig\.adminTicketRequired\?\?true\)&&!launchTicket/);
assert.match(gateway, /frame\.addEventListener\("load",connectModuleNavigation\)/);
assert.match(gateway, /destination\.searchParams\.set\("avaSurface",returnSurface\)/);
assert.match(gateway, /isAvaReturn\(destination\)/);
assert.match(gateway, /event\.data\?\.type==="ava:return"/);
assert.doesNotMatch(gateway, /target="_blank"|window\.open\(/);
assert.doesNotMatch(root, /window\.location\.assign\(destination\)/);
assert.match(worker, /"\.\/module-gateway\.html"/);
assert.doesNotMatch(worker, /CIApp/);
assert.match(study, /physical installed-iPad run is required/);
assert.match(study, /localStorage` and IndexedDB are origin-scoped/);

console.log("Single AVA PWA CIApp gateway architecture tests passed");
