const assert = require("node:assert/strict");
require("../homepage-cloud.js");

const api = globalThis.AVAHomepageCloud;
const registry = [
  { id:"alpha", entry:"/alpha", entryModes:{ frontend:"/alpha" } },
  { id:"beta", entry:"/beta", entryModes:{ frontend:"/beta" } }
];
const bundled = { version:"local", layout:["tools"], settings:{personalCardsEnabled:true,searchEnabled:true}, items:[
  { id:"alpha", defaultVisible:true, order:0 }, { id:"beta", defaultVisible:false, order:1 }
] };
const validPayload = { success:true, data:{
  homepage_settings:[{key:"homepage_version",value:"cloud-2"},{key:"personal_cards_enabled",value:"true"},{key:"search_enabled",value:"1"}],
  homepage_cards:[
    {id:"row-1",module_key:"alpha",title:"Cloud Alpha",subtitle:"Cloud copy",url:"https://attacker.invalid",default_visible:"false",default_order:"2",enabled:"true"},
    {id:"row-2",module_key:"beta",default_visible:true,default_order:1,enabled:true}
  ]
} };

const parsed = api.parseResponse(validPayload);
assert.equal(parsed.version, "cloud-2");
assert.equal(parsed.cards[0].defaultVisible, false);
const reconciled = api.reconcile(parsed, bundled, registry);
assert.deepEqual(reconciled.config.items.map(item => item.id), ["alpha", "beta"]);
assert.equal(reconciled.config.items[0].title, "Cloud Alpha");
assert.match(reconciled.warnings[0], /routing retained/);
assert.throws(() => api.parseResponse({success:true}), /cards array/);
assert.throws(() => api.parseResponse({success:false,error:"bad"}), /not successful/);

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem:key=>values.get(key)||null, setItem:(key,value)=>values.set(key,value), values };
}
function response(payload, ok=true, status=200) { return { ok, status, json:async()=>payload }; }

(async () => {
  const liveStore = storage();
  let result = await api.load({ storage:liveStore, bundled, registry, fetchImpl:async()=>response(validPayload), timeoutMs:100 });
  assert.equal(result.source, "cloud");
  assert.ok(liveStore.getItem(api.CACHE_KEY), "valid cloud response becomes last-known-good cache");

  result = await api.load({ storage:liveStore, bundled, registry, fetchImpl:async()=>{throw new Error("offline")}, timeoutMs:100 });
  assert.equal(result.source, "cache", "cloud unavailable uses last-known-good cache");

  result = await api.load({ storage:storage(), bundled, registry, fetchImpl:async()=>{throw new Error("offline")}, timeoutMs:100 });
  assert.equal(result.source, "bundled", "first-run cloud failure uses production bundled default");

  result = await api.load({ storage:storage(), bundled, registry, fetchImpl:async()=>response({success:true,data:{homepage_settings:[],homepage_cards:[]}}), timeoutMs:100 });
  assert.equal(result.source, "cloud", "an empty registered-App list is a valid stable Homepage baseline");
  assert.deepEqual(result.config.items, [], "empty cloud cards keep the Homepage free of unapproved Apps");

  result = await api.load({ storage:storage(), bundled, registry, fetchImpl:async()=>response({broken:true}), timeoutMs:100 });
  assert.equal(result.source, "bundled", "malformed cloud response falls back safely");

  result = await api.load({ storage:storage(), bundled, registry, fetchImpl:(_url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener("abort",()=>reject(new Error("timeout")))), timeoutMs:5 });
  assert.equal(result.source, "bundled", "timeout falls back safely");

  let attempts = 0;
  const once = await api.loadFirstRun({ storage:storage(), bundled, registry, fetchImpl:async()=>{ attempts++; return response(validPayload); } });
  assert.equal(once.source, "cloud");
  assert.equal(attempts, 1, "successful first-run sync is attempted once");

  attempts = 0;
  const retry = await api.loadFirstRun({ storage:storage(), bundled, registry, fetchImpl:async()=>{ attempts++; if(attempts===1) throw new TypeError("network unavailable"); return response(validPayload); } });
  assert.equal(retry.source, "cloud", "transient first failure recovers automatically");
  assert.equal(attempts, 2, "transient failure receives exactly one automatic retry");

  attempts = 0;
  const failedRetry = await api.loadFirstRun({ storage:storage(), bundled, registry, fetchImpl:async()=>{ attempts++; throw new TypeError("network unavailable"); } });
  assert.equal(failedRetry.source, "error", "second transient failure is returned to existing error UI");
  assert.equal(attempts, 2, "failed retry remains bounded");

  for (const payload of [{broken:true}, {success:false,error:"rejected"}]) {
    attempts = 0;
    const permanent = await api.loadFirstRun({ storage:storage(), bundled, registry, fetchImpl:async()=>{ attempts++; return response(payload); } });
    assert.equal(permanent.source, "error");
    assert.equal(attempts, 1, "permanent schema/rejection failure is not retried");
  }

  attempts = 0;
  let inFlight = 0, maxInFlight = 0;
  const concurrentOptions = { storage:storage(), bundled, registry, fetchImpl:async()=>{ attempts++; inFlight++; maxInFlight=Math.max(maxInFlight,inFlight); await new Promise(resolve=>setTimeout(resolve,5)); inFlight--; return response(validPayload); } };
  const [sharedA, sharedB] = await Promise.all([api.loadFirstRun(concurrentOptions), api.loadFirstRun(concurrentOptions)]);
  assert.equal(sharedA, sharedB, "concurrent first-run calls share one initialization run");
  assert.equal(attempts, 1, "concurrent initialization cannot duplicate Cloud requests");
  assert.equal(maxInFlight, 1, "Cloud requests are never parallel");

  assert.equal(api.FIRST_RUN_RETRY_DELAY_MS, 350, "controlled retry delay is short");

  console.log("Homepage cloud validation, cache, empty, malformed, unavailable and timeout fallback tests passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
