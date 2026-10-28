const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const serviceWorker = fs.readFileSync("sw.js", "utf8");
const documentation = fs.readFileSync("docs/recruit-module-integration.md", "utf8");
// The registration and GROW link were removed by ab1a3c9 on latest main,
// before PR75. Do not resurrect an App to satisfy historical phase-2 metadata.
assert.doesNotMatch(html, /Object\.freeze\(\{id:"recruit"/);
assert.doesNotMatch(html, /onclick="openModule\('recruit'\)"/);
assert.doesNotMatch(html, /https:\/\/ivancww\.github\.io\/recruit\//);

assert.doesNotMatch(serviceWorker, /recruit\/index\.html/);
assert.match(documentation, /does not copy, embed,\s+rebuild or cache Recruit source code/);

console.log("Historical Recruit registration removal and independent source/cache ownership passed");
