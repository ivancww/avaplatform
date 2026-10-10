const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const listeners = new Set();
const sent = [];
const store = new Map();
const child = { name: "", location: { href: "" }, posted: [], openedWith: "", postMessage(message, origin) { this.posted.push({ message, origin }); } };
let requestedAppId = "medical";
const window = {
  location: { href: "https://ivancww.github.io/avaplatform/", origin: "https://ivancww.github.io" },
  sessionStorage: { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) },
  fetch: async (_url, options) => {
    const body = JSON.parse(options.body); sent.push(body);
    if (body.action === "issueAdminSession") return { ok: true, json: async () => ({ success: true, launchTicket: "ticket-1", launchNonce: "nonce-1", expiresAt: new Date(Date.now() + 120000).toISOString(), contract: "ava-admin-session-v1" }) };
    if (body.action === "issueAppLaunch") return { ok: true, json: async () => ({ success: true, launchTicket: "legacy-ticket-1", expiresAt: new Date(Date.now() + 120000).toISOString(), contract: "ava-legacy-app-grant-v1" }) };
    if (body.action === "requestAdminBrowserProof") return { ok: true, json: async () => ({ success: true, appId: body.appId, browserProof: "browser-proof-1", expiresAt: new Date(Date.now() + 120000).toISOString(), contract: "ava-admin-session-v1" }) };
    throw new Error(`unexpected action ${body.action}`);
  },
  open: url => {
    child.openedWith = url;
    setTimeout(() => {
      const request = { type: "ava-admin-session-request", appId: requestedAppId, launchTicket: "ticket-1", launchNonce: "nonce-1" };
      for (const listener of [...listeners]) listener({ source: child, origin: "https://evil.example", data: request });
      for (const listener of [...listeners]) listener({ source: child, origin: "https://ivancww.github.io", data: { ...request, appId: requestedAppId === "retire" ? "medical" : "retire" } });
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
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(launch.launchTicket, "ticket-1");
  assert.match(child.location.href, /avaAdminLaunch=ticket-1/);
  assert.match(child.location.href, /avaAdminLaunchNonce=nonce-1/);
  assert.doesNotMatch(child.location.href, /browserProof|ava-admin-session-context/, "browser proof is never copied into the URL");
  assert.match(child.name, /^ava-admin-session-v1:/, "proof is bound to the reserved child context before navigation");
  const context = JSON.parse(child.name.slice("ava-admin-session-v1:".length));
  assert.equal(context.type, "ava-admin-session-context");
  assert.equal(context.appId, "medical");
  assert.equal(context.launchTicket, "ticket-1");
  assert.equal(context.launchNonce, "nonce-1");
  assert.equal(context.browserProof, "browser-proof-1");
  assert.equal(child.posted.length, 1, "legitimate opener handshake receives one browser proof");
  assert.equal(child.posted[0].message.browserProof, "browser-proof-1");
  assert.equal(child.posted[0].origin, "https://ivancww.github.io");
  assert.equal(sent.filter(item => item.action === "requestAdminBrowserProof").length, 1, "one proof is reused by both secure transports");
  assert.equal(sent.find(item => item.action === "requestAdminBrowserProof").sessionToken, "session");

  child.name = "";
  child.posted = [];
  requestedAppId = "retire";
  const retire = await api.launchAdminApp("retire", "https://ivancww.github.io/Retire/?avaEntry=admin", window.fetch, window.sessionStorage);
  assert.equal(retire.appId, "retire");
  assert.equal(child.name, "", "working Apps retain the postMessage-only transport");
  assert.equal(child.posted.length, 1);
  assert.equal(child.posted[0].message.appId, "retire");

  child.name = "";
  const legacy = await api.launchLegacyAdminApp("medical", "https://ivancww.github.io/medical/?avaEntry=admin", window.fetch, window.sessionStorage);
  assert.equal(legacy.appId, "medical");
  assert.match(child.location.href, /avaAdminLaunch=legacy-ticket-1/);
  assert.doesNotMatch(child.location.href, /avaAdminLaunchNonce/);
  assert.equal(child.name, "", "Legacy App Grant launch does not use browser context binding");
  assert.equal(sent.filter(item => item.action === "issueAppLaunch").length, 1);

  console.log("Browser-bound Admin context, opener preservation, origin and forged-message regressions passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
