const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const registration = html.match(/Object\.freeze\(\{id:"medical"[^\n]+/)[0];
assert.match(registration, /entry:"https:\/\/ivancww\.github\.io\/medical\/"/);
assert.match(registration, /frontend:"https:\/\/ivancww\.github\.io\/medical\/\?avaEntry=frontend"/);
assert.match(registration, /user:"https:\/\/ivancww\.github\.io\/medical\/\?avaEntry=user"/);
assert.match(html, /if\(editMode\)openOfficialCardForm\(module\.id\);else openModule\(module\.id\)/);

const start = html.indexOf("async function openModule(");
const end = html.indexOf("\nfunction cardMoveSelect", start);
assert.ok(start >= 0 && end > start, "openModule source is present");
const openModuleSource = html.slice(start, end);
const registry = [{
  id: "medical",
  name: "Medical",
  enabled: true,
  visible: true,
  entry: "https://ivancww.github.io/medical/",
  entryModes: { frontend: "https://ivancww.github.io/medical/?avaEntry=frontend", user: "https://ivancww.github.io/medical/?avaEntry=user" },
  roleVisibility: { frontend: true, user: true, admin: false },
  userSettings: true,
  adminSettings: false
}];
const navigations = [];
const warnings = [];
const context = {
  MODULE_REGISTRY: registry,
  getModule: moduleId => registry.find(module => module.id === moduleId),
  AVALifecycle: { moduleState: () => ({ initialized: false, cloudVersion: "" }) },
  sessionStorage: { setItem: () => { throw new Error("standalone storage unavailable"); } },
  window: { location: { assign: destination => navigations.push(destination) } },
  console: { info() {}, warn: (...args) => { warnings.push(args); } },
  preserveAvaReturnSurface() {},
  showToast() {}
};
vm.runInNewContext(`${openModuleSource};globalThis.openModule=openModule;`, context);
context.openModule("medical", "frontend");
context.openModule("medical", "user");
context.openModule("medical", "admin");
assert.deepEqual(navigations, [
  "https://ivancww.github.io/medical/?avaEntry=frontend",
  "https://ivancww.github.io/medical/?avaEntry=user"
]);
assert.equal(warnings.length, 2, "storage failure is reported without blocking navigation");

console.log("Medical Homepage card navigation resolves and executes live frontend launch despite unavailable launch metadata storage");
