const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const vm = require("node:vm");

let now = Date.parse("2026-09-28T00:00:00.000Z");
let uuid = 0;
const properties = new Map();
const lockStats = { waits: 0, releases: 0 };
const FakeDate = class extends Date { static now() { return now; } };
const Utilities = {
  DigestAlgorithm: { SHA_256: "sha256" },
  computeDigest: (_algorithm, value) => [...crypto.createHash("sha256").update(String(value)).digest()],
  computeHmacSha256Signature: (value, secret) => [...crypto.createHmac("sha256", String(secret)).update(String(value)).digest()],
  base64EncodeWebSafe: bytes => Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""),
  base64DecodeWebSafe: value => [...Buffer.from(String(value).replace(/-/g, "+").replace(/_/g, "/"), "base64")],
  newBlob: bytes => ({ getDataAsString: () => Buffer.from(bytes).toString() }),
  getUuid: () => `uuid-${++uuid}`
};
const context = vm.createContext({
  Date: FakeDate,
  Utilities,
  PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties.get(key) || null, setProperty: (key, value) => properties.set(key, String(value)), deleteProperty: key => properties.delete(key) }) },
  ContentService: { MimeType: { JSON: "application/json" }, createTextOutput: value => ({ setMimeType: () => value }) },
  SpreadsheetApp: {},
  LockService: { getScriptLock: () => ({ waitLock: () => { lockStats.waits += 1; }, releaseLock: () => { lockStats.releases += 1; } }) }
});
vm.runInContext(fs.readFileSync("gas/Code.gs", "utf8"), context);

function expectError(fn, message) {
  assert.throws(fn, error => error.message === message);
}

properties.set("ADMIN_PASSWORD_HASH", crypto.createHash("sha256").update("password").digest("hex"));
properties.set("SESSION_SECRET", "test-secret");
properties.set("AVA_ADMIN_APP_IDS", "example-app");

const login = context.authenticate_("password");
const sessionExpiry = new Date(login.expiresAt).getTime();
const launch = context.issueAdminSession_(login.sessionToken, "example-app");
assert.ok(launch.launchNonce, "launch has a browser-binding nonce");
const ticketExpiry = new Date(launch.expiresAt).getTime();
assert.equal(ticketExpiry - now, 2 * 60 * 1000, "launch ticket is short-lived");
assert.ok(sessionExpiry > ticketExpiry, "Admin session outlives the launch ticket");

const browser = context.requestAdminBrowserProof_(login.sessionToken, launch.launchTicket, "example-app", launch.launchNonce);
assert.ok(browser.browserProof, "Platform mints a browser-bound proof only after session verification");
const exchanged = context.exchangeAdminSession_(launch.launchTicket, "example-app", browser.browserProof, launch.launchNonce);
assert.equal(new Date(exchanged.expiresAt).getTime(), sessionExpiry, "App grant follows the originating session");
expectError(() => context.exchangeAdminSession_(launch.launchTicket, "example-app", browser.browserProof, launch.launchNonce), "Invalid or expired Admin launch");
now = ticketExpiry + 1;
assert.doesNotThrow(() => context.verifyAdminSession_(exchanged.adminSessionProof, "example-app", "official-write"), "proof survives ticket expiry after exchange");
expectError(() => context.verifyAdminSession_("", "example-app", "official-write"), "Invalid or expired AVA Admin session");
expectError(() => context.verifyAdminSession_(exchanged.adminSessionProof, "other-app", "official-write"), "Invalid or expired AVA Admin session");
expectError(() => context.exchangeAdminSession_(launch.launchTicket, "example-app", browser.browserProof, launch.launchNonce), "Invalid or expired Admin launch");
assert.equal(properties.has(`AVA_ADMIN_LAUNCH_${launch.launchTicket}`), false, "launch ticket is consumed once");

const expiredTicket = context.issueAdminSession_(login.sessionToken, "example-app");
now = new Date(expiredTicket.expiresAt).getTime() + 1;
expectError(() => context.exchangeAdminSession_(expiredTicket.launchTicket, "example-app", "copied-url-only", expiredTicket.launchNonce), "Invalid or expired Admin launch");
assert.equal(properties.has(`AVA_ADMIN_LAUNCH_${expiredTicket.launchTicket}`), false, "expired launch ticket is cleaned up");

now = Date.parse("2026-09-28T00:00:00.000Z");
const wrongAppTicket = context.issueAdminSession_(login.sessionToken, "example-app");
expectError(() => context.exchangeAdminSession_(wrongAppTicket.launchTicket, "other-app"), "Invalid or expired Admin launch");
assert.equal(properties.has(`AVA_ADMIN_LAUNCH_${wrongAppTicket.launchTicket}`), true, "wrong-App request cannot consume a legitimate launch");
const wrongAppBrowser = context.requestAdminBrowserProof_(login.sessionToken, wrongAppTicket.launchTicket, "example-app", wrongAppTicket.launchNonce);
assert.doesNotThrow(() => context.exchangeAdminSession_(wrongAppTicket.launchTicket, "example-app", wrongAppBrowser.browserProof, wrongAppTicket.launchNonce));

const wrongNonceLaunch = context.issueAdminSession_(login.sessionToken, "example-app");
const wrongNonceBrowser = context.requestAdminBrowserProof_(login.sessionToken, wrongNonceLaunch.launchTicket, "example-app", wrongNonceLaunch.launchNonce);
expectError(() => context.exchangeAdminSession_(wrongNonceLaunch.launchTicket, "example-app", wrongNonceBrowser.browserProof, "wrong-nonce"), "Invalid or expired Admin launch");
assert.doesNotThrow(() => context.exchangeAdminSession_(wrongNonceLaunch.launchTicket, "example-app", wrongNonceBrowser.browserProof, wrongNonceLaunch.launchNonce));

const legacyLaunch = context.issueAppLaunch_(login.sessionToken, "example-app");
assert.equal(legacyLaunch.contract, "ava-legacy-app-grant-v1");
assert.equal(legacyLaunch.launchNonce, undefined, "legacy contract does not silently become browser-bound");
const legacyExchange = context.exchangeAppLaunch_(legacyLaunch.launchTicket, "example-app");
assert.equal(legacyExchange.contract, "ava-legacy-app-grant-v1");
assert.doesNotThrow(() => context.verifyAppGrant_(legacyExchange.appGrant, "example-app", "official-write"));
expectError(() => context.exchangeAppLaunch_(legacyLaunch.launchTicket, "example-app"), "Invalid or expired Admin launch");

const concurrentLaunch = context.issueAppLaunch_(login.sessionToken, "example-app");
const concurrentResults = [0, 1].map(() => { try { context.exchangeAppLaunch_(concurrentLaunch.launchTicket, "example-app"); return "success"; } catch (_) { return "rejected"; } });
assert.deepEqual(concurrentResults.sort(), ["rejected", "success"], "serialized legacy exchanges allow only one consumer");
assert.ok(lockStats.waits >= 8 && lockStats.releases === lockStats.waits, "one-time exchanges are protected by the script lock");

const logoutLaunch = context.issueAdminSession_(login.sessionToken, "example-app");
const logoutBrowser = context.requestAdminBrowserProof_(login.sessionToken, logoutLaunch.launchTicket, "example-app", logoutLaunch.launchNonce);
const logoutProof = context.exchangeAdminSession_(logoutLaunch.launchTicket, "example-app", logoutBrowser.browserProof, logoutLaunch.launchNonce);
context.logout_(login.sessionToken);
expectError(() => context.verifyAdminSession_(logoutProof.adminSessionProof, "example-app", "official-write"), "Admin session is not active");

const secondLogin = context.authenticate_("password");
const expiryLaunch = context.issueAdminSession_(secondLogin.sessionToken, "example-app");
const expiryBrowser = context.requestAdminBrowserProof_(secondLogin.sessionToken, expiryLaunch.launchTicket, "example-app", expiryLaunch.launchNonce);
const expiryProof = context.exchangeAdminSession_(expiryLaunch.launchTicket, "example-app", expiryBrowser.browserProof, expiryLaunch.launchNonce);
now = new Date(secondLogin.expiresAt).getTime() + 1;
expectError(() => context.verifyAdminSession_(expiryProof.adminSessionProof, "example-app", "official-write"), "Invalid or expired AVA Admin session");

const gas = fs.readFileSync("gas/Code.gs", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const contract = fs.readFileSync("docs/ava-studio-admin-authentication.md", "utf8");
assert.match(html, /if\(!supportsAppSurface\(module,entryMode\)\)return/, "avaEntry=admin alone does not grant access");
assert.match(html, /AVAAdminAuth\.launchAdminApp\(module\.id,destination\)/, "Admin launch requires a browser-bound Platform-issued ticket");
assert.match(gas, /adminSessionProof/, "proof is session-bound");
assert.match(gas, /requestAdminBrowserProof_/, "browser binding is Platform-issued");
assert.match(contract, /proof remains valid only while the originating active AVA Admin session remains active/i);
assert.match(contract, /failed backend authorization must fail closed[\s\S]*no Official write/i);

console.log("AVA Admin launch/grant lifetime, revocation, App binding, routing, and write-authorization contract tests passed");
