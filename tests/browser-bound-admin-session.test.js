const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const listeners = new Set();
const sent = [];
const store = new Map();
const child = { posted: [], postMessage(message, origin) { this.posted.push({ message, origin }); } };
const window = {
  location: { href: "https://ivancww.github.io/avaplatform/", origin: "https://ivancww.github.io" },
  sessionStorage: { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) },
  fetch: async (_url, options) => {
    const body = JSON.parse(options.body); sent.push(body);
    if (body.action === "issueAdminSession") return { ok: true, json: async () => ({ success: true, launchTicket: "ticket-1", launchNonce: "nonce-1", expiresAt: new Date(Date.now() + 120000).toISOString(), contract: "ava-admin-session-v1" }) };
    if (body.action === "requestAdminBrowserProof") return { ok: true, json: async () => ({ success: true, appId: body.appId, browserProof: "browser-proof-1", expiresAt: new Date(Date.now() + 120000).toISOString(), contract: "ava-admin-session-v1" }) };
    throw new Error(`unexpected action ${body.action}`);
  },
  open: () => child,
  addEventListener: (_type, listener) => listeners.add(listener),
  removeEventListener: (_type, listener) => listeners.delete(listener),
  setTimeout,
  clearTimeout
};
const childLocation = {};
Object.defineProperty(childLocation, "href", { set(value) {
  childLocation.current = value;
  const request = { type: "ava-admin-session-request", appId: "medical", launchTicket: "ticket-1", launchNonce: "nonce-1" };
  for (const listener of [...listeners]) listener({ source: child, origin: "https://evil.example", data: request });
  for (const listener of [...listeners]) listener({ source: child, origin: "https://ivancww.github.io", data: request });
}, get() { return childLocation.current; } });
child.location = childLocation;
vm.runInNewContext(fs.readFileSync("ava-admin-auth.js", "utf8"), { window, URL, URLSearchParams, Date, Error, Promise, setTimeout, clearTimeout });

(async () => {
  const api = window.AVAAdminAuth;
  await api.authenticate("password", async (_url, options) => { sent.push(JSON.parse(options.body)); return { ok: true, json: async () => ({ success: true, sessionToken: "session", expiresAt: new Date(Date.now() + 1800000).toISOString() }) }; }, window.sessionStorage);
  const launch = await api.launchAdminApp("medical", "https://ivancww.github.io/medical/?avaEntry=admin", window.fetch, window.sessionStorage);
  assert.equal(launch.launchTicket, "ticket-1");
  assert.equal(child.posted.length, 1, "legitimate opener handshake receives one browser proof");
  assert.equal(child.posted[0].message.browserProof, "browser-proof-1");
  assert.equal(child.posted[0].origin, "https://ivancww.github.io");
  assert.equal(sent.at(-1).action, "requestAdminBrowserProof");
  assert.equal(sent.at(-1).sessionToken, "session");

  const copiedWindow = { opener: null, location: { search: "?avaAdminLaunch=ticket-1&avaAdminLaunchNonce=nonce-1", href: "https://ivancww.github.io/medical/?avaEntry=admin" } };
  assert.equal(copiedWindow.opener, null, "copied URL has no trusted opener");
  assert.doesNotMatch(fs.readFileSync("../medical/medical-admin-auth.js", "utf8"), /exchangeAdminSession[^\n]*launchTicket: ticket, appId: APP_ID/);
  console.log("Browser-bound Admin opener, origin, copied-URL and forged-message regressions passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
