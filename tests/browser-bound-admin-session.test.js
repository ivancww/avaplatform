const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const sent = [];
const navigation = [];
const store = new Map([["ava:platform:admin-session", "session"]]);
const window = {
  location: {
    href: "https://ivancww.github.io/avaplatform/",
    origin: "https://ivancww.github.io",
    assign: url => navigation.push(url)
  },
  sessionStorage: { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) },
  fetch: async (_url, options) => {
    const body = JSON.parse(options.body); sent.push(body);
    if (body.action === "issueAdminSession") return { ok: true, json: async () => ({ success: true, launchTicket: "ticket-1", launchNonce: "nonce-1", expiresAt: new Date(Date.now() + 120000).toISOString(), contract: "ava-admin-session-v1" }) };
    throw new Error(`unexpected action ${body.action}`);
  }
};
vm.runInNewContext(fs.readFileSync("ava-admin-auth.js", "utf8"), { window, URL, URLSearchParams, Date, Error, Promise });

(async () => {
  const launch = await window.AVAAdminAuth.launchAdminApp("medical", "https://ivancww.github.io/medical/?avaEntry=admin", window.fetch, window.sessionStorage);
  assert.equal(launch.launchTicket, "ticket-1");
  assert.equal(navigation.length, 1, "Admin launch uses same-window navigation");
  assert.match(navigation[0], /avaAdminLaunch=ticket-1/);
  assert.match(navigation[0], /avaAdminLaunchNonce=nonce-1/);
  assert.equal(window.sessionStorage.getItem("ava:platform:admin-session"), "session", "same-window navigation retains the Platform Admin session storage");
  assert.equal(sent.some(body => body.action === "requestAdminBrowserProof"), false, "browser proof is not requested");
  assert.doesNotMatch(fs.readFileSync("ava-admin-auth.js", "utf8"), /window\.open|postMessage|browserProof/);

  const medicalFetches = [];
  const medicalWindow = {
    location: { search: "?avaEntry=admin&avaAdminLaunch=ticket-1&avaAdminLaunchNonce=nonce-1", href: "https://ivancww.github.io/medical/?avaEntry=admin", pathname: "/medical/" },
    history: { replaceState: (_state, _title, path) => { medicalWindow.location.search = path.includes("?") ? path.slice(path.indexOf("?")) : ""; } },
    fetch: async (_url, options) => { medicalFetches.push(JSON.parse(options.body)); return { ok: true, json: async () => ({ success: true, appId: "medical", adminSessionProof: "opaque-proof", contract: "ava-admin-session-v1" }) }; }
  };
  vm.runInNewContext(fs.readFileSync("../medical/medical-admin-auth.js", "utf8"), { window: medicalWindow, URL, URLSearchParams, Date, Error, Promise });
  await medicalWindow.MedicalAdminAuth.exchangeAdminSession(undefined, medicalWindow.location);
  assert.deepEqual(medicalFetches[0], { action: "exchangeAdminSession", launchTicket: "ticket-1", launchNonce: "nonce-1", appId: "medical" });
  assert.equal(medicalWindow.MedicalAdminAuth.hasSession(), true);
  assert.doesNotMatch(fs.readFileSync("../medical/medical-admin-auth.js", "utf8"), /opener|postMessage|browserProof/);
  console.log("Browser-independent Admin ticket navigation, App ID and single-exchange regressions passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
