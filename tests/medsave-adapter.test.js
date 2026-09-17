const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function storage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

const context = { window: {}, localStorage: storage(), Date, JSON, Object };
context.window.localStorage = context.localStorage;
vm.createContext(context);
vm.runInContext(fs.readFileSync("modules/5pay-adapter.js", "utf8"), context);
vm.runInContext(fs.readFileSync("modules/medsave-adapter.js", "utf8"), context);
vm.runInContext(fs.readFileSync("platform-backup.js", "utf8"), context);

const adapter = context.window.AVAModules.medsave;
const personalKeys = [
  "ava_med_user_customized",
  "ava_med_scenario_db_v3",
  "ava_med_custom_timing",
  "ava_med_blueprint_summary",
  "ava_med_custom_blueprint_img",
  "ava_med_system_topic"
];
const forbiddenKeys = [
  "ava_med_admin_password",
  "ava_med_system_version",
  "ava_med_sheet_mapping",
  "ava_med_is_admin",
  "ava_med_theme_settings"
];

assert.deepEqual(Array.from(adapter.personalKeys), personalKeys);
personalKeys.forEach((key, index) => context.localStorage.setItem(key, `personal-${index}`));
forbiddenKeys.forEach((key, index) => context.localStorage.setItem(key, `system-${index}`));

const pkg = context.window.AVABackup.createPackage();
assert.deepEqual(Object.keys(pkg.modules.medsave.values), personalKeys);
forbiddenKeys.forEach(key => assert.equal(pkg.modules.medsave.values[key], undefined));

personalKeys.forEach(key => context.localStorage.removeItem(key));
context.localStorage.setItem("ava_med_is_admin", "true");
context.window.AVABackup.restorePackage(pkg);
personalKeys.slice(1).forEach((key, index) => assert.equal(context.localStorage.getItem(key), `personal-${index + 1}`));
assert.equal(context.localStorage.getItem("ava_med_user_customized"), "true");
assert.equal(context.localStorage.getItem("ava_med_is_admin"), "true", "restore must not rewrite role state");

adapter.import({
  moduleId: "medsave",
  format: "medsave-local-storage-v1",
  values: { unknown_key: "unsafe", ava_med_admin_password: "unsafe", ava_med_system_topic: "safe" }
});
assert.equal(context.localStorage.getItem("unknown_key"), null);
assert.notEqual(context.localStorage.getItem("ava_med_admin_password"), "unsafe");
assert.equal(context.localStorage.getItem("ava_med_system_topic"), "safe");

context.window.AVABackup.resetToDefault();
personalKeys.forEach(key => assert.equal(context.localStorage.getItem(key), null));
forbiddenKeys.forEach((key, index) => {
  const expected = key === "ava_med_is_admin" ? "true" : `system-${index}`;
  assert.equal(context.localStorage.getItem(key), expected);
});

console.log("Medsave personal-only backup, restore and reset contract tests passed");
