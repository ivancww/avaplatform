const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function storage() {
  const values = new Map();
  return { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
}
const deletedReferences = [];
const context = { window: { AVAStorage: { deletePersonalFile: (provider, reference) => { deletedReferences.push([provider, reference]); return Promise.resolve(); } } }, localStorage: storage(), JSON, Object, Promise, console };
context.window.localStorage = context.localStorage;
vm.createContext(context);
vm.runInContext(fs.readFileSync("modules/medicalclaims-adapter.js", "utf8"), context);
const adapter = context.window.AVAModules["medical-claims"];
const personal = [
  "AVA_MED_APP_TAILOR_V1", "AVA_MED_HIDDEN_CLOUD_CASE_IDS_V1", "AVA_MED_CASE_OVERRIDES_V1",
  "AVA_MED_LOCAL_USER_CASES_V1", "AVA_MED_HIDDEN_CLOUD_DOCUMENT_IDS_V1",
  "AVA_MED_LOCAL_DOCUMENT_METADATA_V1", "AVA_MED_DOCUMENT_ORDER_V1"
];
assert.deepEqual(Array.from(adapter.personalKeys), personal);
personal.forEach((key, index) => context.localStorage.setItem(key, JSON.stringify(key === "AVA_MED_LOCAL_DOCUMENT_METADATA_V1" ? [] : { index })));
context.localStorage.setItem("AVA_MED_APP_DB_CACHE_V7", "official-system-cache");
context.localStorage.setItem("medical-admin-session", "secret");
const payload = adapter.export();
assert.deepEqual(Object.keys(payload.values), personal);
assert.equal(payload.values.AVA_MED_APP_DB_CACHE_V7, undefined);
context.localStorage.removeItem(personal[0]);
adapter.import(payload);
assert.equal(context.localStorage.getItem(personal[0]), JSON.stringify({ index: 0 }));
adapter.import({ moduleId: "medical-claims", format: "medical-claims-personal-v1", values: { AVA_MED_APP_DB_CACHE_V7: "attack", AVA_MED_APP_TAILOR_V1: "safe" } });
assert.equal(context.localStorage.getItem("AVA_MED_APP_DB_CACHE_V7"), "official-system-cache");
assert.equal(context.localStorage.getItem("AVA_MED_APP_TAILOR_V1"), "safe");
adapter.import({ moduleId: "medical-claims", format: "medical-claims-personal-v1", values: {
  AVA_MED_LOCAL_DOCUMENT_METADATA_V1: JSON.stringify([
    { id:"local-file", storageProvider:"local" },
    { id:"cloud-file", storageProvider:"google-drive", providerReference:"owned-reference" }
  ])
} });
const restoredFiles = JSON.parse(context.localStorage.getItem("AVA_MED_LOCAL_DOCUMENT_METADATA_V1"));
assert.equal(restoredFiles[0].missingFile, true);
assert.equal(restoredFiles[1].missingFile, false);
assert.equal(restoredFiles[1].providerReference, "owned-reference");
adapter.resetToDefault();
assert.deepEqual(deletedReferences, [["local", "local-file"], ["google-drive", "owned-reference"]]);
personal.forEach(key => assert.equal(context.localStorage.getItem(key), null));
assert.equal(context.localStorage.getItem("AVA_MED_APP_DB_CACHE_V7"), "official-system-cache");
assert.equal(context.localStorage.getItem("medical-admin-session"), "secret");
console.log("Medical Claims personal-only backup and system/auth exclusion tests passed");
