const assert = require("node:assert/strict");
const fs = require("node:fs");
require("../homepage-preferences.js");
require("../ava-lifecycle.js");

const homepage = globalThis.AVAHomepage;
const official = { version: "10", items: [
  { id: "a", title: "A", defaultVisible: true, areaId: "area-1", order: 0 },
  { id: "b", title: "B", defaultVisible: true, areaId: "area-2", order: 0 }
] };
const preference = { officialOverrides: { a: { title: "私人 A", areaId: "area-3" }, deleted: { visible: true } }, personalCards: [{ id: "p", title: "P", subtitle: "安全文字", content: "javascript:alert(1)", areaId: "area-3", order: 2 }] };
const merged = homepage.merge(official, preference);
assert.deepEqual(merged.areas["area-3"].map(card => card.id), ["a", "p"]);
assert.equal(merged.official[0].title, "私人 A");
assert.equal(merged.official.some(card => card.id === "deleted"), false);
assert.equal(homepage.isSafeHttpUrl(preference.personalCards[0].content), false);

const memory = new Map();
const storage = { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
assert.equal(AVALifecycle.read(storage).onboardingCompleted, false);
AVALifecycle.save({ initialized: true, cloudVersion: "10", userName: "陳大文", onboardingCompleted: true }, storage);
assert.equal(AVALifecycle.read(storage).userName, "陳大文");
assert.deepEqual(AVALifecycle.moduleState("crm", storage), { initialized: false, cloudVersion: "", userData: {}, userOverrides: {} });
AVALifecycle.markModuleInitialized("crm", "4", storage);
assert.equal(AVALifecycle.moduleState("crm", storage).cloudVersion, "4");

const html = fs.readFileSync("index.html", "utf8"), install = fs.readFileSync("install.html", "utf8"), gas = fs.readFileSync("gas/Code.gs", "utf8");
assert.equal((html.match(/class="home-section"/g) || []).length, 3);
assert.match(html, /all\.slice\(0,4\)/);
assert.match(html, /顯示更多 \$\{extra\} 項/);
assert.match(html, /從首頁隱藏/);
assert.match(html, /同步雲端/);
assert.match(html, /new QRCode/);
assert.match(install, /將 AVA 加到主畫面/);
assert.match(install, /beforeinstallprompt/);
assert.match(gas, /ADMIN_PASSWORD_HASH/);
assert.match(gas, /verifySession_\(body\.sessionToken\)/);
assert.match(gas, /"default_area"/);
assert.doesNotMatch(gas, /const\s+ADMIN_PASSWORD\s*=/);
console.log("AVA v1.13 homepage, lifecycle, installation and protected cloud-write contracts passed");
