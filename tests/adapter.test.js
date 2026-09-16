const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

function storage() {
  const values = new Map();
  return { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
}
const context = { window: {}, localStorage: storage(), Date, JSON, Object };
context.window.localStorage = context.localStorage;
vm.createContext(context);
vm.runInContext(fs.readFileSync("modules/5pay-adapter.js", "utf8"), context);
vm.runInContext(fs.readFileSync("platform-backup.js", "utf8"), context);

const adapter = context.window.AVAModules["5pay"];
const legacyKeys = ["ava_user_has_customized", "ava_scenario_database", "ava_scenarios_db", "ava_jar_texts", "ava_blueprint_summary", "ava_blueprint_img", "ava_planner_display_name", "ava_strategy_by_term", "ava_jar_configs"];
assert.deepEqual(Array.from(adapter.personalKeys), legacyKeys);

legacyKeys.forEach((key, index) => context.localStorage.setItem(key, JSON.stringify({ index })));
const pkg = context.window.AVABackup.createPackage();
legacyKeys.forEach(key => context.localStorage.removeItem(key));
context.window.AVABackup.restorePackage(pkg);
legacyKeys.forEach((key, index) => assert.equal(context.localStorage.getItem(key), JSON.stringify({ index })));

const malicious = adapter.migrate({ moduleId: "5pay", format: "5pay-local-storage-v1", values: { unknown_key: "x", ava_jar_configs: "safe" } });
adapter.import(malicious);
assert.equal(context.localStorage.getItem("unknown_key"), null);
assert.equal(context.localStorage.getItem("ava_jar_configs"), "safe");
context.window.AVABackup.resetToDefault();
legacyKeys.forEach(key => assert.equal(context.localStorage.getItem(key), null));
console.log("5Pay legacy LocalStorage backup compatibility tests passed");
