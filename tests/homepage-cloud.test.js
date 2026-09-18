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
  assert.equal(result.source, "bundled-empty", "empty cloud cards retain production homepage");

  result = await api.load({ storage:storage(), bundled, registry, fetchImpl:async()=>response({broken:true}), timeoutMs:100 });
  assert.equal(result.source, "bundled", "malformed cloud response falls back safely");

  result = await api.load({ storage:storage(), bundled, registry, fetchImpl:(_url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener("abort",()=>reject(new Error("timeout")))), timeoutMs:5 });
  assert.equal(result.source, "bundled", "timeout falls back safely");

  console.log("Homepage cloud validation, cache, empty, malformed, unavailable and timeout fallback tests passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
