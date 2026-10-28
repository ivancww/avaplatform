const assert = require("node:assert/strict");
require("../notification-center.js");
const api = globalThis.AVANotifications;
const values = new Map();
const storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
const rows = [
  { notification_id: "update-1", type: "platform_update", title: "AVA 更新", summary: "更新通知中心", published_at: "2026-09-28T00:00:00Z", active: "TRUE", show_popup: "TRUE", action_type: "view_update", sort_order: 1 },
  { notification_id: "bad", type: "unknown", title: "ignored", published_at: "bad", active: true, action_type: "none" },
  { notification_id: "inactive", type: "announcement", title: "hidden", published_at: "2026-09-28T00:00:00Z", active: false, action_type: "none" }
];
const feed = api.parseFeed(rows);
assert.equal(feed.length, 1);
assert.equal(api.unread(feed, api.state(storage)).length, 1);
assert.equal(api.eligiblePrompt(feed, api.state(storage)).length, 1);
api.markPrompted(["update-1"], storage);
assert.equal(api.eligiblePrompt(feed, api.state(storage)).length, 0);
assert.equal(api.unread(feed, api.state(storage)).length, 1);
api.markRead(["update-1"], storage);
assert.equal(api.unread(feed, api.state(storage)).length, 0);
console.log("Notification feed validation, inactive filtering and local read/prompt state passed");

(async()=>{
  const official=require('./fixtures/platform-sheet-current.json'),toRows=book=>book.update_notifications.slice(1).map(row=>Object.fromEntries(book.update_notifications[0].map((key,i)=>[key,row[i]??''])));
  let current=toRows(official),optionsSeen=[];const fetchImpl=async(_url,options)=>{optionsSeen.push(options);return {ok:true,json:async()=>({success:true,data:{notifications:current}})}};
  const first=await api.sync({endpoint:'https://fixture.invalid',storage,fetchImpl});assert.equal(first.source,'cloud');assert.equal(first.feed.length,2);api.markRead(first.feed.map(row=>row.id),storage);api.markPrompted(first.feed.map(row=>row.id),storage);
  current[0].title='Direct Google Sheet rename';current[0].sort_order=99;current.push({notification_id:'app-new',type:'app_update',app_id:'medical',title:'App-specific',summary:'',version:'v1',published_at:'2026-10-28T00:00:00Z',active:true,show_popup:false,action_type:'view_app',sort_order:0});
  const refreshed=await api.sync({endpoint:'https://fixture.invalid',storage,fetchImpl});assert.equal(refreshed.feed[0].appId,'medical');assert.equal(refreshed.feed.at(-1).title,'Direct Google Sheet rename');assert.equal(api.eligiblePrompt(refreshed.feed,api.state(storage)).length,0,'Same IDs do not retrigger handled prompts');assert.deepEqual(api.unread(refreshed.feed,api.state(storage)).map(row=>row.id),['app-new']);assert.ok(optionsSeen.every(options=>options.cache==='no-store'));
  const offline=await api.sync({endpoint:'https://fixture.invalid',storage,fetchImpl:async()=>{throw Error('Offline')}});assert.equal(offline.source,'cache');assert.deepEqual(offline.feed,refreshed.feed);
  console.log('PASS: direct Sheet refresh, app/platform feed ordering, no-store cache refresh, stable popup/read IDs and offline fallback');
})().catch(error=>{console.error(error);process.exitCode=1});
