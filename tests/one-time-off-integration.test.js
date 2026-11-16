const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8'),ctx={};
vm.runInNewContext(html.slice(html.indexOf('const MODULE_REGISTRY='),html.indexOf('const ICONS='))+';globalThis.apps=MODULE_REGISTRY;globalThis.surface=registeredModulesForSurface;',ctx);
const matches=ctx.apps.filter(app=>app.id==='one-time-off');assert.equal(matches.length,1);const app=matches[0];
assert.equal(app.repository,'ivancww/one-time-off');assert.equal(app.availability,'deployment-pending');assert.equal(app.enabled,false);assert.equal(app.visible,false);assert.equal(app.entry,'');assert.deepEqual(Object.keys(app.entryModes),[]);assert.equal(app.capabilities.frontend,true);assert.equal(app.capabilities.user,false);assert.equal(app.capabilities.admin,false);assert.equal(app.adminSettings,false);
for(const surface of ['frontend','user','admin'])assert.equal(ctx.surface(surface).some(x=>x.id===app.id),false);
assert(!fs.existsSync('modules/one-time-off'));assert(!fs.readFileSync('sw.js','utf8').includes('one-time-off/'));
console.log('One-Time-Off pending single registration, hidden surfaces and no vendoring: PASS');
