const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');

assert.match(html, /id:"crm",moduleId:"crm",repository:"ivancww\/AVA-CRM",name:"AVA-CRM"/);
assert.match(html, /icon:"users",category:"client-review",area:"workspace",order:80/);
assert.match(html, /entry:"",entryModes:Object\.freeze\(\{\}\)/);
assert.match(html, /capabilities:Object\.freeze\(\{frontend:false,user:false,admin:false\}\)/);
assert.match(html, /roleVisibility:Object\.freeze\(\{frontend:false,user:false,admin:false\}\)/);
assert.match(html, /enabled:false,visible:false,allowFavorite:false,userSettings:false,adminSettings:false/);
assert.match(html, /availability:"deployment-pending"/);
assert.match(html, /integrationVersion:"AVA-CRM@1ede580ddf29756db29a074320b91a016e73a101"/);
assert.doesNotMatch(html, /module\.roleVisibility&&module\.roleVisibility\[entryMode\]===false/);
assert.doesNotMatch(html, /ava-crm[^\n]*avaEntry=(frontend|user|admin)/);
assert.doesNotMatch(html, /https:\/\/ivancww\.github\.io\/CRM/);
assert.doesNotMatch(html, /modules\/crm\//);

console.log('AVA-CRM independent-module registration remains safely disabled until deployment and entry verification');
