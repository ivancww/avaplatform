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
  if (body.action === "issueAdminSession") return { ok: true, json: async () => ({ success: true, launchTicket: "one-time-ticket", launchNonce: "launch-nonce", expiresAt: new Date(Date.now() + 1e5).toISOString(), contract: "ava-admin-session-v1" }) };
  if (body.action === "logoutAdmin") return { ok: true, json: async () => ({ success: true }) };
  throw new Error("unexpected action");
};

(async () => {
  await api.authenticate("password", fetchImpl, storage);
  assert.equal(api.sessionToken(storage), "opaque-session");
  const launch = await api.issueAdminSession("example-app", fetchImpl, storage);
  const url = api.adminEntryUrl("https://app.example/admin?avaEntry=admin", launch.launchTicket, launch.launchNonce);
  assert.equal(new URL(url).searchParams.get("avaEntry"), "admin");
  assert.equal(new URL(url).searchParams.get("avaAdminLaunch"), "one-time-ticket");
  assert.equal(new URL(url).searchParams.get("avaAdminLaunchNonce"), "launch-nonce");
  assert.equal(url.includes("password"), false);
  await api.logout(fetchImpl, storage);
  assert.equal(api.sessionToken(storage), "");
  assert.equal(responses.map(item => item.action).join(","), "authenticateAdmin,issueAdminSession,logoutAdmin");

  const gas = fs.readFileSync("gas/Code.gs", "utf8");
  const html = fs.readFileSync("index.html", "utf8");
  const contract = fs.readFileSync("docs/ava-studio-admin-authentication.md", "utf8");
  assert.match(gas, /logoutAdmin/);
  assert.match(gas, /issueAdminSession/);
  assert.match(gas, /exchangeAdminSession/);
  assert.match(gas, /verifyAdminSession/);
  assert.match(gas, /AVA_ADMIN_APP_IDS/);
  for (const id of ["medical", "5pay", "critical-illness"]) {
    const registration = html.match(new RegExp(`Object\\.freeze\\(\\{id:"${id}"[^\\n]+`))[0];
    assert.match(registration, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
  }
  assert.doesNotMatch(fs.readFileSync("ava-admin-auth.js", "utf8"), /localStorage|indexedDB/, "Admin session must not be persisted in permanent User storage");
  assert.match(html, /AVAAdminAuth\.launchAdminApp/);
  assert.match(contract, /Every Official-data write requires both/);
  assert.doesNotMatch(contract, /ADMIN_EMAIL_ALLOWLIST/);
  console.log("AVA Studio Admin authentication, launch, revocation and backend-write contract tests passed");
})().catch(error => { console.error(error); process.exitCode = 1; });

// Declared Admin capability is not server authorization. Reproduce the
// observed production allowlist excluding EverBliss without touching production.
(async () => {
  const vm = require('node:vm');
  const html = fs.readFileSync('index.html', 'utf8');
  const baseline = require('./fixtures/workspace-baseline.json');
  const app = baseline.apps.find(app => app.id === 'everbliss');
  let closed = 0, navigated = 0, issued = 0;
  const previousOpen = globalThis.open;
  const child = { close() { closed++; }, location: {} };
  Object.defineProperty(child.location, 'href', {set() { navigated++; }});
  globalThis.open = () => child;
  const rejected = async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.action, 'issueAdminSession');
    assert.equal(body.appId, 'everbliss');
    issued++;
    return {ok:true,json:async()=>({success:false,error:'App Admin capability is not registered'})};
  };
  const errors = [], context = {
    getModule: id => id === app.id ? app : null,
    supportsAppSurface: (value, mode) => Boolean(value?.capabilities?.[mode]),
    AVALifecycle:{moduleState:()=>({initialized:true})},
    sessionStorage:{setItem(){}},console:{info(){},warn(){}},
    preserveAvaReturnSurface(){},prepareIndependentAppLaunch:async()=>{},
    AVAAdminAuth:{launchAdminApp:(id,url)=>api.launchAdminApp(id,url,rejected,{getItem:()=> 'fixture-only-session'})},
    window:{location:{assign(){navigated++;}}},
    showToast: message => errors.push(message)
  };
  const start = html.indexOf('async function openModule('), end = html.indexOf('\nfunction cardMoveSelect', start);
  try {
    vm.runInNewContext(html.slice(start,end),context);
    await context.openModule('everbliss','admin');
    assert.equal(issued,1);
    assert.equal(navigated,0,'Denied Admin must never navigate to the App');
    assert.equal(closed,1,'Reserved window is closed on authorization denial');
    assert.match(errors[0],/Admin launch denied.*not registered/);
    assert.match(html,/已登記 Admin 入口 · 存取須經伺服器授權/);
    assert.equal(app.capabilities.admin,true,'Source declaration remains unchanged');
    console.log('EverBliss allowlist-denial simulation: no navigation, no success claim, closed child and visible denial passed');
  } finally { globalThis.open = previousOpen; }
})().catch(error=>{console.error(error);process.exitCode=1});
