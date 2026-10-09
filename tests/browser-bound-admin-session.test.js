const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const listeners = new Set();
const sent = [];
const store = new Map();
const child = { location: { href: "" }, posted: [], openedWith: "", postMessage(message, origin) { this.posted.push({ message, origin }); } };
const window = {
  location: { href: "https://ivancww.github.io/avaplatform/", origin: "https://ivancww.github.io" },
  sessionStorage: { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) },
  fetch: async (_url, options) => {
    const body = JSON.parse(options.body); sent.push(body);
    if (body.action === "issueAdminSession") return { ok: true, json: async () => ({ success: true, launchTicket: "ticket-1", launchNonce: "nonce-1", expiresAt: new Date(Date.now() + 120000).toISOString(), contract: "ava-admin-session-v1" }) };
    if (body.action === "requestAdminBrowserProof") return { ok: true, json: async () => ({ success: true, appId: body.appId, browserProof: "browser-proof-1", expiresAt: new Date(Date.now() + 120000).toISOString(), contract: "ava-admin-session-v1" }) };
    throw new Error(`unexpected action ${body.action}`);
  },
  open: url => {
    child.openedWith = url;
    setTimeout(() => {
      const request = { type: "ava-admin-session-request", appId: "medical", launchTicket: "ticket-1", launchNonce: "nonce-1" };
      for (const listener of [...listeners]) listener({ source: child, origin: "https://evil.example", data: request });
      for (const listener of [...listeners]) listener({ source: child, origin: "https://ivancww.github.io", data: { ...request, appId: "retire" } });
      for (const listener of [...listeners]) listener({ source: child, origin: "https://ivancww.github.io", data: { ...request, launchNonce: "wrong-nonce" } });
      for (const listener of [...listeners]) listener({ source: child, origin: "https://ivancww.github.io", data: request });
    }, 0);
    return child;
  },
  addEventListener: (_type, listener) => listeners.add(listener),
  removeEventListener: (_type, listener) => listeners.delete(listener),
  setTimeout,
  clearTimeout
};
vm.runInNewContext(fs.readFileSync("ava-admin-auth.js", "utf8"), { window, URL, URLSearchParams, Date, Error, Promise, setTimeout, clearTimeout });

(async () => {
  const api = window.AVAAdminAuth;
  await api.authenticate("password", async (_url, options) => { sent.push(JSON.parse(options.body)); return { ok: true, json: async () => ({ success: true, sessionToken: "session", expiresAt: new Date(Date.now() + 1800000).toISOString() }) }; }, window.sessionStorage);
  const launch = await api.launchAdminApp("medical", "https://ivancww.github.io/medical/?avaEntry=admin", window.fetch, window.sessionStorage);
  assert.equal(launch.launchTicket, "ticket-1");
  assert.match(child.location.href, /avaAdminLaunch=ticket-1/);
  assert.match(child.location.href, /avaAdminLaunchNonce=nonce-1/);
  assert.equal(child.posted.length, 1, "legitimate opener handshake receives one browser proof");
  assert.equal(child.posted[0].message.browserProof, "browser-proof-1");
  assert.equal(child.posted[0].origin, "https://ivancww.github.io");
  assert.equal(sent.at(-1).action, "requestAdminBrowserProof");
  assert.equal(sent.at(-1).sessionToken, "session");

  let medicalFetches = 0;
  const copiedWindow = {
    location: { search: "?avaEntry=admin&avaAdminLaunch=ticket-1&avaAdminLaunchNonce=nonce-1", href: "https://ivancww.github.io/medical/?avaEntry=admin" },
    opener: null,
    fetch: async () => { medicalFetches += 1; throw new Error("fetch must not run without opener"); },
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(fs.readFileSync("../medical/medical-admin-auth.js", "utf8"), { window: copiedWindow, URL, URLSearchParams, Date, Error, Promise, setTimeout, clearTimeout });
  await assert.rejects(() => copiedWindow.MedicalAdminAuth.exchangeAdminSession(), /安全視窗開啟/);
  assert.equal(medicalFetches, 0, "copied Admin URL fails before any Medical GAS request");
  assert.doesNotMatch(fs.readFileSync("../medical/medical-admin-auth.js", "utf8"), /exchangeAdminSession[^\n]*launchTicket: ticket, appId: APP_ID/);
  console.log("Browser-bound Admin opener preservation, origin, copied-URL and forged-message regressions passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
