const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const serviceWorker = fs.readFileSync("sw.js", "utf8");
const documentation = fs.readFileSync("docs/ciapp-module-integration.md", "utf8");

// ab1a3c97a702f13114f2d3e729d1096ec65dba89 removed this homepage
// registration before PR75. Preserve its legacy gateway boundary without
// treating a historical POC document as the current production registry.
assert.doesNotMatch(html, /Object\.freeze\(\{id:"ci-protection"/);
const current = html.match(/Object\.freeze\(\{id:"critical-illness"[^\n]+/);
assert.ok(current, "Current independent Critical Illness registration exists");
assert.match(current[0], /https:\/\/ivancww\.github\.io\/critical-illness-\//);
assert.doesNotMatch(current[0], /module-gateway|CIApp/);
const gateway = fs.readFileSync("module-gateway.html", "utf8");
assert.match(gateway, /ciapp:Object\.freeze\(\{name:"CI Protection",path:"\.\.\/CIApp\/"/);
assert.match(gateway, /id="returnAva"/);

assert.doesNotMatch(serviceWorker, /CIApp/);
assert.match(documentation, /does\s+not copy,[\s\S]*CIApp source code/);
assert.match(documentation, /AVA does not pass credentials or grant Admin authority/);
assert.match(documentation, /user-owned IndexedDB provider/);

console.log("Historical CIApp registration removal and retained legacy gateway/storage boundaries passed");
