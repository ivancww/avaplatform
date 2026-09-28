const assert = require("node:assert/strict");
const fs = require("node:fs");
require("../ava-admin-auth.js");

const api = globalThis.AVAAdminAuth;
const store = new Map();
const storage = { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) };
const responses = [];
const fetchImpl = async (_url, options) => {
  const body = JSON.parse(options.body);
  responses.push(body);
  if (body.action === "authenticateAdmin") return { ok: true, json: async () => ({ success: true, sessionToken: "opaque-session", expiresAt: new Date(Date.now() + 1e6).toISOString() }) };
  if (body.action === "issueAppLaunch") return { ok: true, json: async () => ({ success: true, launchTicket: "one-time-ticket", expiresAt: new Date(Date.now() + 1e5).toISOString() }) };
  if (body.action === "logoutAdmin") return { ok: true, json: async () => ({ success: true }) };
  throw new Error("unexpected action");
};

(async () => {
  await api.authenticate("password", fetchImpl, storage);
  assert.equal(api.sessionToken(storage), "opaque-session");
  const launch = await api.issueAppLaunch("example-app", fetchImpl, storage);
  const url = api.adminEntryUrl("https://app.example/admin?avaEntry=admin", launch.launchTicket);
  assert.equal(new URL(url).searchParams.get("avaEntry"), "admin");
  assert.equal(new URL(url).searchParams.get("avaAdminLaunch"), "one-time-ticket");
  assert.equal(url.includes("password"), false);
  await api.logout(fetchImpl, storage);
  assert.equal(api.sessionToken(storage), "");
  assert.equal(responses.map(item => item.action).join(","), "authenticateAdmin,issueAppLaunch,logoutAdmin");

  const gas = fs.readFileSync("gas/Code.gs", "utf8");
  const html = fs.readFileSync("index.html", "utf8");
  const contract = fs.readFileSync("docs/ava-studio-admin-authentication.md", "utf8");
  assert.match(gas, /logoutAdmin/);
  assert.match(gas, /issueAppLaunch/);
  assert.match(gas, /exchangeAppLaunch/);
  assert.match(gas, /verifyAppGrant/);
  assert.match(gas, /AVA_ADMIN_APP_IDS/);
  assert.match(html, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:false\}\)/);
  assert.match(html, /AVAAdminAuth\.issueAppLaunch/);
  assert.match(contract, /Every Official-data write requires both/);
  assert.doesNotMatch(contract, /ADMIN_EMAIL_ALLOWLIST/);
  console.log("AVA Studio Admin authentication, launch, revocation and backend-write contract tests passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
