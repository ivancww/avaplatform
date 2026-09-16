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
assert.equal(adapter.load("personal").scope, "personal");
adapter.save({ data: { gap: { title: "Personal" } } }, "personal");
adapter.save({ data: { gap: { title: "Official" } } }, "official");
assert.equal(adapter.load("personal").data.gap.title, "Personal");
assert.equal(adapter.load("official").data.gap.title, "Official");
assert.equal(adapter.resolve().data.gap.title, "Personal");
adapter.restoreDefault("personal");
assert.equal(adapter.load("personal").data.gap, undefined);
assert.equal(adapter.load("official").data.gap.title, "Official");
assert.equal(adapter.resolve().data.gap.title, "Official");

adapter.save({ data: { blueprint: { image: "firebase://image" } } }, "personal");
const pkg = context.window.AVABackup.createPackage();
adapter.restoreDefault("personal");
context.window.AVABackup.restorePackage(pkg);
assert.equal(adapter.load("personal").data.blueprint.image, "firebase://image");

context.localStorage.removeItem(adapter.keys.user);
context.localStorage.setItem("5pay_user_config", JSON.stringify({ questions: [{ title: "Legacy" }] }));
assert.equal(adapter.load("personal").data.questions[0].title, "Legacy");
assert.ok(context.localStorage.getItem(adapter.keys.legacy));
console.log("5Pay adapter and universal backup tests passed");
