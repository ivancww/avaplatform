const assert=require('node:assert/strict');
require('../homepage-cloud.js');
const sheet=require('./fixtures/platform-sheet-v3.json'),apps=require('./fixtures/workspace-baseline.json').apps;
const rows=sheet.homepage_cards.slice(1).map(row=>Object.fromEntries(sheet.homepage_cards[0].map((key,i)=>[key,row[i]??''])));
const settings=Object.fromEntries(sheet.homepage_settings.slice(1).map(row=>[row[0],row[1]]));
const payload={success:true,data:{cards:rows,settings}};
const parsed=AVAHomepageCloud.parseResponse(payload);
assert.equal(parsed.version,'3');assert.equal(parsed.folderMetadata.length,5);assert.equal(parsed.folderLayout.pageSize,9);
const result=AVAHomepageCloud.reconcile(parsed,{layout:[],items:[]},apps).config;
assert.equal(result.items.length,7);assert.equal(result.categories.filter(item=>item.enabled).length,5);
for(const folder of parsed.folderMetadata)for(const id of folder.appIds)assert.equal(rows.find(row=>row.module_key===id).default_area,folder.id);
const invalid=JSON.parse(JSON.stringify(payload));const metadata=JSON.parse(settings.workspace_folder_metadata);metadata[0].appIds.push('unregistered');invalid.data.settings.workspace_folder_metadata=JSON.stringify(metadata);assert.throws(()=>AVAHomepageCloud.parseResponse(invalid),/metadata/);
const old=JSON.parse(JSON.stringify(payload));delete old.data.settings.workspace_folder_metadata;delete old.data.settings.workspace_folder_layout;assert.equal(AVAHomepageCloud.parseResponse(old).folderMetadata,null);
console.log('Sheet v3 metadata and legacy settings parsing checks passed');

const mismatch=JSON.parse(JSON.stringify(payload));const changed=JSON.parse(settings.workspace_folder_metadata);changed[0].appIds=changed[0].appIds.filter(id=>id!=='5pay');changed[1].appIds.push('5pay');mismatch.data.settings.workspace_folder_metadata=JSON.stringify(changed);const warning=AVAHomepageCloud.reconcile(AVAHomepageCloud.parseResponse(mismatch),{layout:[],items:[]},apps);assert.ok(warning.warnings.some(text=>text.includes('5pay')));assert.equal(warning.config.items.find(item=>item.id==='5pay').areaId,'area-1','default_area stays authoritative despite conflicting metadata');assert.equal(warning.config.items.length,7);
const ten=JSON.parse(JSON.stringify(payload));const more=JSON.parse(settings.workspace_categories);for(let i=7;i<=11;i++)more.push({id:`area-${i}`,title:`測試 ${i}`,order:i,enabled:true});ten.data.settings.workspace_categories=JSON.stringify(more);assert.equal(AVAHomepageCloud.parseResponse(ten).categories.filter(item=>item.enabled).length,10,'More than nine folders remain valid across pages');
const badLayout=JSON.parse(JSON.stringify(payload));badLayout.data.settings.workspace_folder_layout=JSON.stringify({columns:3,rows:3,pageSize:1,overflow:'carousel',navigation:['arrows','dots','swipe'],responsive:true});assert.throws(()=>AVAHomepageCloud.parseResponse(badLayout),/layout/);

(async()=>{const cache=new Map([[AVAHomepageCloud.CACHE_KEY,JSON.stringify(payload)]]),storage={getItem:key=>cache.get(key)||null,setItem:(key,value)=>cache.set(key,value)};const loaded=await AVAHomepageCloud.load({storage,bundled:{layout:[],items:[]},registry:apps,fetchImpl:async()=>({ok:true,json:async()=>invalid})});assert.equal(loaded.source,'cache','Invalid metadata retains last confirmed cache');assert.equal(loaded.config.items.length,7);assert.equal(JSON.parse(cache.get(AVAHomepageCloud.CACHE_KEY)).data.settings.homepage_version,'3');})().catch(error=>{console.error(error);process.exitCode=1});

assert.equal(require('../scripts/plan-workspace-migration').plan(sheet).operations.length,0,'Current Sheet v3 must never be migrated again');
