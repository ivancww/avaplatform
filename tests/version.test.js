const assert = require("assert");
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

const declaration = html.match(/const AVA_PLATFORM_VERSION="([^"]+)";/g) || [];
assert.deepEqual(declaration, ['const AVA_PLATFORM_VERSION="v1.3.2";']);
assert.equal((html.match(/data-platform-version/g) || []).length, 4);
assert.doesNotMatch(html, /Version 1\.3\.0/);
assert.match(html, /AVA Studio<\/span><span class="platform-version" data-platform-version>/);
console.log("AVA Platform version single-source rendering tests passed");
