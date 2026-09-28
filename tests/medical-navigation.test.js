const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const registration = html.match(/Object\.freeze\(\{id:"medical"[^\n]+/)[0];
assert.match(registration, /entry:"https:\/\/ivancww\.github\.io\/medical\/"/);
assert.match(registration, /frontend:"https:\/\/ivancww\.github\.io\/medical\/"/);
assert.match(html, /if\(editMode\)openOfficialCardForm\(module\.id\);else openModule\(module\.id\)/);

const start = html.indexOf("function openModule(");
const end = html.indexOf("\nfunction cardMoveSelect", start);
assert.ok(start >= 0 && end > start, "openModule source is present");
const openModuleSource = html.slice(start, end);
const registry = [{
  id: "medical",
  name: "Medical",
  enabled: true,
  visible: true,
  entry: "https://ivancww.github.io/medical/",
  entryModes: { frontend: "https://ivancww.github.io/medical/" },
  roleVisibility: { frontend: true },
  userSettings: false,
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
  console: { info() {}, warn: (...args) { warnings.push(args); } },
  showToast() {}
};
vm.runInNewContext(`${openModuleSource};globalThis.openModule=openModule;`, context);
context.openModule("medical");
assert.deepEqual(navigations, ["https://ivancww.github.io/medical/"]);
assert.equal(warnings.length, 1, "storage failure is reported without blocking navigation");

console.log("Medical Homepage card navigation resolves and executes live frontend launch despite unavailable launch metadata storage");
