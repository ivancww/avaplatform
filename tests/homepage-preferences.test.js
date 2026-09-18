const assert = require("node:assert/strict");
require("../homepage-preferences.js");

const api = globalThis.AVAHomepage;
const cloud = { version:"2", items:[
  { id:"alpha", order:1, defaultVisible:true },
  { id:"beta", order:2, defaultVisible:false },
  { id:"new-app", order:3, defaultVisible:true }
] };
const preference = {
  hiddenOfficialIds:["alpha"], shownOfficialIds:["beta"], officialOrder:["beta","alpha"],
  personalCards:[{ id:"mine", emoji:"⭐", title:"客戶影片", content:"https://example.com/video", category:"客戶" }],
  cardOrder:["personal:mine","official:beta","official:alpha"]
};
const merged = api.merge(cloud, preference);
assert.deepEqual(merged.visibleOfficial, ["beta","new-app"], "hidden overrides remain while newly introduced cloud items merge in");
assert.deepEqual(merged.cardOrder, ["personal:mine","official:beta","official:new-app"]);
assert.equal(merged.personalCards[0].title, "客戶影片");
assert.equal(api.isSafeHttpUrl("https://example.com"), true);
assert.equal(api.isSafeHttpUrl("javascript:alert(1)"), false);
assert.equal(api.isSafeHttpUrl("plain text"), false);
assert.equal(api.greetingForHour(5), "Good morning");
assert.equal(api.greetingForHour(12), "Good afternoon");
assert.equal(api.greetingForHour(17), "Good evening");
assert.equal(api.greetingForHour(22), "Good night");
assert.equal(api.greetingForHour(4), "Good night");

const memory = new Map();
const storage = { getItem:key=>memory.get(key)||null, setItem:(key,value)=>memory.set(key,value) };
api.save(storage, preference);
assert.deepEqual(api.load(storage).hiddenOfficialIds, ["alpha"]);
assert.deepEqual(api.load(storage).shownOfficialIds, ["beta"]);
console.log("Homepage cloud-default merge, personal preference, URL safety and greeting tests passed");
