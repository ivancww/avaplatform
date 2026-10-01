const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html','utf8');
const context = {};
vm.runInNewContext(html.slice(html.indexOf('const MODULE_REGISTRY='),html.indexOf('const ICONS='))+';globalThis.registry=MODULE_REGISTRY;',context);
const paths = {medical:'/medical/','5pay':'/5pay-saving-plan/','critical-illness':'/critical-illness-/'};
assert.deepEqual(Array.from(context.registry, module => module.id).sort(),Object.keys(paths).sort());
for (const module of context.registry) {
  assert.equal(module.entry,`https://ivancww.github.io${paths[module.id]}`);
  for (const mode of ['frontend','user','admin']) {
    assert.equal(module.capabilities[mode],true);
    assert.equal(module.roleVisibility[mode],true);
    assert.equal(module.entryModes[mode],`${module.entry}?avaEntry=${mode}`);
  }
  assert.equal(module.userSettings,true);
  assert.equal(module.adminSettings,true);
  assert.equal(module.enabled,true);
  assert.equal(module.visible,true);
  assert.doesNotMatch(module.entry,/modules\/|module-gateway/);
}
assert.match(html,/function openUserModuleSettings\(moduleId\)\{openModule\(moduleId,"user"\)\}/);
assert.match(html,/function openAdminModuleSettings\(moduleId\)\{openModule\(moduleId,"admin"\)\}/);
assert.match(html,/restoreAvaReturnSurface\(returnSurface\)/);
assert.match(html,/if\(surface==="admin"&&!AVAAdminAuth\.sessionToken\(\)\)/);
assert.match(html,/history\.replaceState/);
assert.doesNotMatch(html,/function openModuleSettings\(|class="config-textarea"/);
console.log('Current 3-App registry, canonical Front/User/Admin routes and return restoration tests passed');
