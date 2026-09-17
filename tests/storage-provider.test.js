const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function fakeIndexedDB() {
  const databases = new Map();
  return {
    open(name) {
      const request = {};
      queueMicrotask(() => {
        let state = databases.get(name);
        const fresh = !state;
        if (!state) { state = { stores:new Map() }; databases.set(name, state); }
        const database = {
          objectStoreNames: { contains:key => state.stores.has(key) },
          createObjectStore(key) { state.stores.set(key, new Map()); },
          transaction(key) {
            const records = state.stores.get(key);
            return { error:null, objectStore() { return {
              put(record) { records.set(record.id, record); return complete(record.id); },
              get(id) { return complete(records.get(id)); },
              delete(id) { records.delete(id); return complete(undefined); }
            }; }, close() {} };
          },
          close() {}
        };
        request.result = database;
        if (fresh && request.onupgradeneeded) request.onupgradeneeded();
        if (request.onsuccess) request.onsuccess();
      });
      return request;
    }
  };
  function complete(result) { const request={ result }; queueMicrotask(() => request.onsuccess && request.onsuccess()); return request; }
}

const indexedDB = fakeIndexedDB();
const context = { window:{ indexedDB }, indexedDB, Date, Math, Map, Object, Promise, console, queueMicrotask };
vm.createContext(context);
vm.runInContext(fs.readFileSync("ava-storage.js", "utf8"), context);
const storage = context.window.AVAStorage;

(async () => {
  assert.equal(Array.from(await storage.getAvailableProviders(), item => item.id).join(","), "local");
  const file = new Blob(["private claim"], { type:"application/pdf" });
  Object.defineProperty(file, "name", { value:"claim.pdf" });
  const saved = await storage.saveFile("local", file, { consumer:"medical-claims" });
  assert.equal(saved.providerId, "local");
  assert.equal(saved.filename, "claim.pdf");
  assert.equal(await (await storage.resolveFile("local", saved.reference)).text(), "private claim");
  assert.equal((await storage.getMetadata("local", saved.reference)).mimeType, "application/pdf");
  assert.equal(Object.hasOwn(await storage.getMetadata("local", saved.reference), "blob"), false);
  // A new consumer handle resolves the same IndexedDB record after a simulated reload.
  assert.equal(await (await context.window.AVAStorage.resolveFile("local", saved.reference)).text(), "private claim");
  await storage.deletePersonalFile("local", saved.reference);
  assert.equal(await storage.resolveFile("local", saved.reference), null);

  storage.registerProvider({ id:"future-test", name:"Future", isAvailable:()=>false, saveFile(){}, resolveFile(){}, deletePersonalFile(){}, getMetadata(){} });
  assert.equal(Array.from(await storage.getAvailableProviders(), item => item.id).join(","), "local");
  assert.throws(() => storage.registerProvider({ id:"broken" }), /缺少 saveFile/);
  console.log("AVA Storage registry, local IndexedDB save/read/reload/delete, metadata privacy and availability tests passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
