const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const loader = fs.readFileSync("modules/5pay-runtime.html", "utf8");
const bridge = fs.readFileSync("modules/5pay-entry.js", "utf8");

assert.match(loader, /mode!=="user"&&mode!=="admin"/);
assert.match(loader, /new URL\("\/5pay\/",location\.origin\)/);
assert.match(loader, /fetch\(runtimeUrl,\{credentials:"same-origin",cache:"no-cache"\}\)/);
assert.match(loader, /window\.__AVA_5PAY_ENTRY_MODE/);
assert.match(loader, /沒有退回客戶 Frontend/);
assert.match(bridge, /\[5Pay\] Entry mode received: \$\{mode\}/);
assert.match(bridge, /control:\["控制台","Control Panel","Dashboard"\]/);
assert.match(bridge, /user:\["使用者","User"\]/);
assert.match(bridge, /admin:\["管理者","Admin"\]/);
assert.match(bridge, /roleControl\.click\(\)/);
assert.match(bridge, /new MutationObserver/);

function verifyDashboard(mode, expectedHeading, expectedFeatures) {
  let observerCallback = null;
  let dashboard = "客戶使用問題／情境流程";
  const control = { textContent: "控制台", dataset: {}, offsetWidth: 1, offsetHeight: 1, getClientRects: () => [1] };
  const role = { textContent: mode === "user" ? "使用者" : "管理者", dataset: {}, offsetWidth: 0, offsetHeight: 0, getClientRects: () => [] };
  control.click = () => { role.offsetWidth = 1; };
  role.click = () => { dashboard = `${expectedHeading} ${expectedFeatures.join(" ")}`; };
  const context = {
    window: { __AVA_5PAY_ENTRY_MODE: mode, addEventListener(event, callback) { callback(); } },
    document: { documentElement: {}, querySelectorAll: () => [control, role] },
    MutationObserver: class { constructor(callback) { observerCallback = callback; } observe() {} disconnect() {} },
    console: { info() {} }
  };
  vm.createContext(context);
  vm.runInContext(bridge, context);
  assert.match(dashboard, new RegExp(expectedHeading));
  expectedFeatures.forEach(feature => assert.match(dashboard, new RegExp(feature)));
  assert.doesNotMatch(dashboard, /客戶使用問題／情境流程/);
}

verifyDashboard("user", "5Pay 使用者後台", ["頁面流程管理", "情境切換", "問題編輯", "時光複利", "人生藍圖", "系統參數", "保存本機", "Restore Default", "Import", "Export"]);
verifyDashboard("admin", "5Pay 管理者後台", ["Admin-only", "Google Sheet", "GAS Sync"]);

console.log("5Pay runtime loader and user/admin DOM dashboard acceptance tests passed");
