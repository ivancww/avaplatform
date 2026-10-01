const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const vm = require("node:vm");

let now = Date.parse("2026-09-28T00:00:00.000Z");
let uuid = 0;
const properties = new Map();
const FakeDate = class extends Date { static now() { return now; } };
const Utilities = {
  DigestAlgorithm: { SHA_256: "sha256" },
  computeDigest: (_algorithm, value) => [...crypto.createHash("sha256").update(String(value)).digest()],
  computeHmacSha256Signature: (value, secret) => [...crypto.createHmac("sha256", String(secret)).update(String(value)).digest()],
  base64EncodeWebSafe: bytes => Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""),
  getUuid: () => `uuid-${++uuid}`
};
const context = vm.createContext({
  Date: FakeDate,
  Utilities,
  PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties.get(key) || null, setProperty: (key, value) => properties.set(key, String(value)), deleteProperty: key => properties.delete(key) }) },
  ContentService: { MimeType: { JSON: "application/json" }, createTextOutput: value => ({ setMimeType: () => value }) },
  SpreadsheetApp: {},
  LockService: {}
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
const launch = context.issueAppLaunch_(login.sessionToken, "example-app");
const ticketExpiry = new Date(launch.expiresAt).getTime();
assert.equal(ticketExpiry - now, 2 * 60 * 1000, "launch ticket is short-lived");
assert.ok(sessionExpiry > ticketExpiry, "Admin session outlives the launch ticket");

const exchanged = context.exchangeAppLaunch_(launch.launchTicket, "example-app");
assert.equal(new Date(exchanged.expiresAt).getTime(), sessionExpiry, "App grant follows the originating session");
expectError(() => context.exchangeAppLaunch_(launch.launchTicket, "example-app"), "Invalid or expired Admin launch");
now = ticketExpiry + 1;
assert.doesNotThrow(() => context.verifyAppGrant_(exchanged.appGrant, "example-app", "official-write"), "grant survives ticket expiry after exchange");
expectError(() => context.exchangeAppLaunch_(launch.launchTicket, "example-app"), "Invalid or expired Admin launch");
assert.equal(properties.has(`AVA_ADMIN_LAUNCH_${launch.launchTicket}`), false, "launch ticket is consumed once");

const expiredTicket = context.issueAppLaunch_(login.sessionToken, "example-app");
now = new Date(expiredTicket.expiresAt).getTime() + 1;
expectError(() => context.exchangeAppLaunch_(expiredTicket.launchTicket, "example-app"), "Invalid or expired Admin launch");
assert.equal(properties.has(`AVA_ADMIN_LAUNCH_${expiredTicket.launchTicket}`), false, "expired launch ticket is cleaned up");

now = Date.parse("2026-09-28T00:00:00.000Z");
const wrongAppTicket = context.issueAppLaunch_(login.sessionToken, "example-app");
expectError(() => context.exchangeAppLaunch_(wrongAppTicket.launchTicket, "other-app"), "Invalid or expired Admin launch");
assert.equal(properties.has(`AVA_ADMIN_LAUNCH_${wrongAppTicket.launchTicket}`), false, "wrong-App launch ticket is rejected and consumed");

const logoutGrant = context.exchangeAppLaunch_(context.issueAppLaunch_(login.sessionToken, "example-app").launchTicket, "example-app");
context.logout_(login.sessionToken);
expectError(() => context.verifyAppGrant_(logoutGrant.appGrant, "example-app", "official-write"), "Admin session is not active");
assert.equal(properties.has(`AVA_ADMIN_GRANT_${logoutGrant.appGrant}`), false, "logout revokes and cleans up the App grant");

const secondLogin = context.authenticate_("password");
const expiryGrant = context.exchangeAppLaunch_(context.issueAppLaunch_(secondLogin.sessionToken, "example-app").launchTicket, "example-app");
now = new Date(secondLogin.expiresAt).getTime() + 1;
expectError(() => context.verifyAppGrant_(expiryGrant.appGrant, "example-app", "official-write"), "Invalid or expired App Admin authorization");
assert.equal(properties.has(`AVA_ADMIN_GRANT_${expiryGrant.appGrant}`), false, "expired App grant is cleaned up");

const gas = fs.readFileSync("gas/Code.gs", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const contract = fs.readFileSync("docs/ava-studio-admin-authentication.md", "utf8");
assert.match(html, /if\(entryMode==="admin"&&!module\.capabilities\?\.admin\)/, "avaEntry=admin alone does not grant access");
assert.match(html, /AVAAdminAuth\.issueAppLaunch\(module\.id\)/, "Admin launch requires a Platform-issued ticket");
assert.match(gas, /const grant = Utilities\.getUuid\(\), expiry = Number\(launch\.sessionExpiry\)/, "grant expiry is session-bound");
assert.match(contract, /only until the originating active AVA Admin session expires/i);
assert.match(contract, /failed backend authorization must fail closed[\s\S]*no Official write/i);

console.log("AVA Admin launch/grant lifetime, revocation, App binding, routing, and write-authorization contract tests passed");
