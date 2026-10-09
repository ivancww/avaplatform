const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const metadata = JSON.parse(fs.readFileSync("platform-release.json", "utf8"));
const declaration = html.match(/const AVA_PLATFORM_VERSION="([^"]+)";/g) || [];
const version = html.match(/const AVA_PLATFORM_VERSION="([^"]+)";/)?.[1];

assert.equal(declaration.length, 1, "Platform version must have one authoritative declaration");
assert.match(version || "", /^v\\d+\\.\\d+\\.\\d+$/);
assert.equal(metadata.version, version);
assert.match(metadata.sourceSha, /^[0-9a-f]{40}$/);
assert.equal((html.match(/data-platform-version/g) || []).length, 4);
assert.match(html, /data-platform-version/);
console.log("AVA Platform release governance tests passed");
