const assert = require("assert");
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

assert.match(html, /id:"5pay",moduleId:"5pay"/);
assert.match(html, /entryModes:Object\.freeze\(\{frontend:"https:\/\/ivancww\.github\.io\/5pay\/"/);
assert.match(html, /user:"https:\/\/ivancww\.github\.io\/5pay\/\?ava_platform=1&entry_mode=user&scope=user"/);
assert.match(html, /admin:"https:\/\/ivancww\.github\.io\/5pay\/\?ava_platform=1&entry_mode=admin&scope=admin"/);
assert.match(html, /userSettings:true,adminSettings:true/);
assert.match(html, /function openModule\(moduleId,entryMode="frontend"\)/);
assert.match(html, /function openUserModuleSettings\(moduleId\)\{openModule\(moduleId,"user"\)\}/);
assert.match(html, /function openAdminModuleSettings\(moduleId\)\{openModule\(moduleId,"admin"\)\}/);
assert.match(html, /此 Module 的設定介面尚未遷移至 AVA Platform/);
assert.doesNotMatch(html, /function openModuleSettings\(/);
assert.doesNotMatch(html, /class="config-textarea"/);
console.log("Three-mode module registry and scope-aware routing tests passed");
