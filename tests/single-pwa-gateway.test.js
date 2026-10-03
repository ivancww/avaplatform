// Regression coverage for the root-scope experiment replacing the PR #42 gateway.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
const registrySource = html.slice(html.indexOf('const MODULE_REGISTRY='), html.indexOf('const ICONS='));
const helpers = html.slice(html.indexOf('function preserveAvaReturnSurface'), html.indexOf('function downloadBackup'));
const launcher = html.slice(html.indexOf('function getModule('), html.indexOf('function cardMoveSelect'));
assert.equal(manifest.scope, '/');
assert.doesNotMatch(launcher, /moduleGatewayUrl|module-gateway|window\.open|_blank|iframe/);
assert.match(launcher, /prepareIndependentAppLaunch/);
assert.doesNotMatch(html, /function moduleGatewayUrl/);
const navigations = [], issued = [], metadata = [], surfaces = [], toasts = [], workerUpdates = [];
let token = 'platform-session', deny = false, studio = 0;
const location = {href:'https://ivancww.github.io/avaplatform/?avaSurface=frontend', origin:'https://ivancww.github.io', assign: url => navigations.push(new URL(url))};
const context = {
  URL, window:{location},
  navigator:{serviceWorker:{getRegistration:async pathname=>({scope:`https://ivancww.github.io${pathname}`,update:async()=>workerUpdates.push(pathname)})}},
  history:{replaceState: (_a, _b, url) => {location.href = new URL(url, location.href).href;}},
  sessionStorage:{setItem: (key,value) => metadata.push([key,value])},
  AVALifecycle:{moduleState: () => ({initialized:true,cloudVersion:'dataset-only'})},
  AVAAdminAuth:{
    sessionToken: () => token,
    issueAppLaunch: async id => {issued.push(id); if (deny) throw new Error('denied'); return {launchTicket:`ticket-${id}`};},
    adminEntryUrl: (destination,ticket) => {const url = new URL(destination);url.searchParams.set('avaAdminLaunch',ticket);return url.href;}
  },
  openModuleDirectory: surface => surfaces.push(surface), openStudio: () => studio++,
  showToast: value => toasts.push(value), console:{info(){},warn(){}}
};
vm.createContext(context);
vm.runInContext(registrySource + helpers + launcher, context);
(async () => {
  for (const [id,path] of [['medical','/medical/'],['5pay','/5pay-saving-plan/'],['critical-illness','/critical-illness-/']]) {
    for (const mode of ['frontend','user','admin']) {
      await context.openModule(id,mode);
      const url = navigations.at(-1);
      assert.equal(url.origin,'https://ivancww.github.io');
      assert.equal(url.pathname,path);
      assert.equal(url.searchParams.get('avaEntry'),mode);
      assert.equal(url.searchParams.get('avaAdminLaunch'),mode === 'admin' ? `ticket-${id}` : null);
      assert.equal(new URL(location.href).searchParams.get('avaSurface'),mode === 'frontend' ? null : mode);
      assert.equal(url.href.includes('platform-session'),false);
      assert.equal(url.searchParams.has('avaSurface'),false);
    }
  }
  assert.deepEqual(issued,['medical','5pay','critical-illness']);
  assert.deepEqual(workerUpdates.sort(),['/5pay-saving-plan/','/5pay-saving-plan/','/5pay-saving-plan/','/critical-illness-/','/critical-illness-/','/critical-illness-/','/medical/','/medical/','/medical/']);
  assert.equal(metadata.some(([,value]) => /ticket-|platform-session|password|appGrant/.test(value)),false);
  const count = navigations.length;
  await context.openModule('unknown','admin');
  await context.openModule('medical','invalid');
  deny = true;
  await context.openModule('medical','admin');
  assert.equal(navigations.length,count,'invalid launch / denied ticket must not navigate');
  assert.ok(toasts.some(value => value.includes('denied')));
  // Explicit return URLs work independently of browser Back/referrer.
  context.restoreAvaReturnSurface('user');
  token = '';
  context.restoreAvaReturnSurface('admin');
  assert.equal(studio,1,'Admin return without a session opens authentication');
  token = 'platform-session';
  context.restoreAvaReturnSurface('admin');
  assert.deepEqual(surfaces,['user','admin']);
  assert.match(html,/restoreAvaReturnSurface\(returnSurface\)/);
  console.log('Root navigation scope, 3 Apps x 3 direct entries, tickets, denied launches and return surfaces passed');
})().catch(error => {console.error(error);process.exitCode=1;});
