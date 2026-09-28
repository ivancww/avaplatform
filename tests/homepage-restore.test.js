const assert = require("node:assert/strict");
require("../homepage-preferences.js");

const homepage = globalThis.AVAHomepage;
const apps = [
  { id: "medical", defaultArea: "area-2", order: 1 },
  { id: "5pay", defaultArea: "area-1", order: 2 },
  { id: "critical-illness", defaultArea: "area-3", order: 3 }
];
const cloud = { version: "restore-test", items: apps.map(item => ({ ...item, title: item.id, defaultVisible: true })) };

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
}

for (const app of apps) {
  const restored = homepage.restoreOfficialModule({ officialOverrides: { [app.id]: { visible: false } } }, app.id, { defaultItem: app });
  const merged = homepage.merge(cloud, restored);
  assert.equal(merged.visibleOfficial.includes(app.id), true, `${app.id} restores to Homepage`);
  assert.equal(merged.official.filter(item => item.id === app.id).length, 1, `${app.id} is not duplicated`);
  assert.equal(merged.areas[app.defaultArea].some(item => item.id === app.id), true, `${app.id} uses its default Area`);
}

const personalCard = { id: "personal-note", title: "保留這張卡", content: "https://example.com", areaId: "area-1", order: 0 };
const validPlacement = {
  officialOverrides: { medical: { visible: false, areaId: "area-3", folderId: "medical-folder", order: 7 } },
  folders: [{ id: "medical-folder", name: "醫療工作", areaId: "area-3", order: 0, moduleIds: ["medical"] }],
  personalCards: [personalCard]
};
const validRestored = homepage.restoreOfficialModule(validPlacement, "medical", { defaultItem: apps[0] });
const validMerged = homepage.merge(cloud, validRestored);
assert.equal(validMerged.official.find(item => item.id === "medical").visible, true);
assert.equal(validMerged.official.find(item => item.id === "medical").folderId, "medical-folder");
assert.equal(validRestored.officialOverrides.medical.areaId, "area-3");
assert.equal(validRestored.officialOverrides.medical.order, 7);
assert.deepEqual(validMerged.folders.find(folder => folder.id === "medical-folder").cards.map(card => card.id), ["medical"]);
assert.deepEqual(validMerged.personalCards.map(card => card.id), ["personal-note"]);

const staleFolder = {
  officialOverrides: { "5pay": { visible: false, areaId: "area-3", folderId: "deleted-folder", order: 4 } },
  folders: [],
  personalCards: [personalCard]
};
const staleRestored = homepage.restoreOfficialModule(staleFolder, "5pay", { defaultItem: apps[1] });
const staleMerged = homepage.merge(cloud, staleRestored);
assert.equal(staleRestored.officialOverrides["5pay"].folderId, undefined);
assert.equal(staleMerged.official.find(item => item.id === "5pay").folderId, "");
assert.equal(staleMerged.areas["area-3"].some(item => item.id === "5pay"), false);
assert.equal(staleMerged.areas["area-1"].some(item => item.id === "5pay"), true);

const missingMembership = {
  officialOverrides: { "critical-illness": { visible: false, folderId: "ci-folder" } },
  folders: [{ id: "ci-folder", name: "危疾工作", areaId: "area-2", order: 0, moduleIds: [] }]
};
const membershipRestored = homepage.restoreOfficialModule(missingMembership, "critical-illness", { defaultItem: apps[2] });
const membershipMerged = homepage.merge(cloud, membershipRestored);
assert.deepEqual(membershipRestored.folders[0].moduleIds, ["critical-illness"]);
assert.deepEqual(membershipMerged.folders[0].cards.map(card => card.id), ["critical-illness"]);

const memory = storage();
homepage.save(memory, validRestored);
const reloaded = homepage.merge(cloud, homepage.load(memory));
assert.equal(reloaded.visibleOfficial.includes("medical"), true, "restored Medical persists after reload");
assert.equal(reloaded.folders.find(folder => folder.id === "medical-folder").cards[0].id, "medical");
assert.deepEqual(reloaded.personalCards.map(card => card.id), ["personal-note"]);

console.log("Homepage toolbox restore, stale-folder recovery, persistence and registered-App regression tests passed");
