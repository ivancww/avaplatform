/* AVA Platform: metadata-only Independent App update dots.
 * App owns release notes and acknowledgement. No Platform app-update feed.
 */
(function(global){
  "use strict";
  const SEMVER=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
  function compare(a,b){
    if(typeof a!=="string"||typeof b!=="string"||!SEMVER.test(a)||!SEMVER.test(b))return null;
    const x=a.split(".").map(Number),y=b.split(".").map(Number);
    if(x.concat(y).some(n=>!Number.isSafeInteger(n)))return null;
    for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]>y[i]?1:-1;
    return 0;
  }
  function valid(m,id){
    return !!m && m.appId===id && m.published===true &&
      m.releaseId===id+"@"+m.version && compare(m.version,"0.0.0")!==null &&
      typeof m.publishedAt==="string" && /^\d{4}-\d{2}-\d{2}$/.test(m.publishedAt) &&
      Array.isArray(m.changes)&&m.changes.length>0;
  }
  async function scan(modules,options={}){
    const href=options.href||(global.location&&global.location.href);
    if(!href)return {};
    const origin=new URL(href), storage=options.storage||global.localStorage;
    const fetcher=options.fetcher||global.fetch?.bind(global),current={};
    if(!fetcher||!storage||!Array.isArray(modules))return current;
    await Promise.all(modules.map(async module=>{
      try{
        if(!module?.enabled||!module.capabilities?.frontend||!module.entry||!module.id)return;
        const entry=new URL(module.entry,href);
        // Never fetch unrelated domains or accept redirect-based update claims.
        if(entry.origin!==origin.origin||entry.protocol!=="https:"||
           entry.username||entry.password||!entry.pathname.endsWith("/"))return;
        const endpoint=new URL("app-release.json",entry);
        const options={cache:"no-store",credentials:"same-origin",redirect:"error",headers:{Accept:"application/json"}};
        if(typeof AbortSignal!=="undefined"&&typeof AbortSignal.timeout==="function")options.signal=AbortSignal.timeout(8000);
        const response=await fetcher(endpoint.href,options);
        if(!response.ok||response.type==="opaque")return;
        const manifest=await response.json();
        if(!valid(manifest,module.id))return;
        const observed=storage.getItem("ava:"+module.id+":observed-release");
        // No false "new update" for first-time visitors without a baseline.
        if(observed&&compare(manifest.version,observed)===1)
          current[module.id]={version:manifest.version};
      }catch(_){/* offline, missing manifest or storage denied: no fabricated dot */}
    }));
    return current;
  }
  global.AVAAppUpdateDots=Object.freeze({scan,compare,valid});
})(typeof window!=="undefined"?window:globalThis);
