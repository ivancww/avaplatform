const assert=require('node:assert/strict');require('../homepage-cloud.js');const api=AVAHomepageCloud;
const row={id:'app',type:'official_app',title:'App',subtitle:'',emoji:'',module_key:'app',url:'',category:'planning',default_visible:true,default_order:0,enabled:true,default_area:'area-1'};
function draft(){return {version:'old',rawRows:[row],items:[{id:'app',sheetId:'app',moduleKey:'app',title:'Renamed',subtitle:'',emoji:'',category:'planning',defaultVisible:true,order:0,enabled:true,areaId:'area-1'}],settings:{personalCardsEnabled:true,searchEnabled:true}}}
const original=draft();let calls=0;
global.sessionStorage={getItem:()=>null};
global.AVAAdminAuth={sessionToken:()=>''};
(async()=>{
  await assert.rejects(api.writeOfficial(draft(),async()=>{calls++}),/authentication/);assert.equal(calls,0);
  global.AVAAdminAuth={sessionToken:()=> 'local-unit-test-session'};
  for(const payload of [{success:true},{success:false,error:'Unauthorized'},{success:true,persisted:true,readAfterWrite:true,version:'next',requestId:'wrong',data:{cards:[row],settings:{homepage_version:'next'}}}]){const d=draft();await assert.rejects(api.writeOfficial(d,async()=>({ok:true,json:async()=>payload})));assert.equal(d.items[0].title,'Renamed','Failed save retains user draft');assert.equal(d.version,'old','Last confirmed revision unchanged');}
  const networkDraft=draft(),ids=[];const offline=async(_url,request)=>{ids.push(JSON.parse(request.body).requestId);throw new Error('offline')};
  await assert.rejects(api.writeOfficial(networkDraft,offline),/offline/);await assert.rejects(api.writeOfficial(networkDraft,offline),/offline/);assert.equal(ids[0],ids[1],'Unknown-result network retry reuses request identity');networkDraft.items[0].title='Edited again';await assert.rejects(api.writeOfficial(networkDraft,offline),/offline/);assert.notEqual(ids[1],ids[2],'Changed draft gets a new mutation identity');
  const response=async(_url,request)=>{const body=JSON.parse(request.body);assert.equal(body.expectedRevision,'old');assert.equal(body.sessionToken,'local-unit-test-session');return {ok:true,json:async()=>({success:true,persisted:true,readAfterWrite:true,requestId:body.requestId,version:'next',data:{cards:body.cards,settings:{homepage_version:'next'}}})}};
  const result=await api.writeOfficial(draft(),response);assert.equal(result.version,'next');
  const mismatch=async(_url,request)=>{const b=JSON.parse(request.body);return {ok:true,json:async()=>({success:true,persisted:true,readAfterWrite:true,requestId:b.requestId,version:'next',data:{cards:[row],settings:{homepage_version:'next'}}})}};
  await assert.rejects(api.writeOfficial(draft(),mismatch),/card mismatch/);
  assert.equal(original.version,'old');console.log('PASS: authenticated frontend writes, HTTP-200-only rejection, receipt validation, last-confirmed/draft preservation, network idempotency and readback mismatch');
})().catch(error=>{console.error(error);process.exitCode=1});
