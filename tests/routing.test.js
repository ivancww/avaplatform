const assert = require("assert");
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

assert.match(html, /id:"5pay",moduleId:"5pay"/);
assert.match(html, /entry:"https:\/\/ivancww\.github\.io\/5pay\/"/);
assert.match(html, /userSettings:true,adminSettings:true/);
assert.match(html, /function openModule\(moduleId\)/);
assert.match(html, /function openUserModuleSettings\(moduleId\)/);
assert.match(html, /function openAdminModuleSettings\(moduleId\)/);
assert.match(html, /此 Module 的設定介面尚未遷移至 AVA Platform/);
assert.doesNotMatch(html, /function openAppSettings\(/);
assert.doesNotMatch(html, /class="config-textarea"/);
assert.match(html, /Version 1\.3\.0/);
console.log("Module registry and scope-aware routing tests passed");
