const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');

assert.match(html, /id:"crm",moduleId:"crm",repository:"ivancww\/AVA-CRM",name:"AVA-CRM"/);
assert.match(html, /icon:"users",category:"client-review",area:"workspace",order:80/);
assert.match(html, /entry:"https:\/\/ivancww\.github\.io\/AVA-CRM\/"/);
assert.match(html, /entryModes:Object\.freeze\(\{frontend:"https:\/\/ivancww\.github\.io\/AVA-CRM\/\?avaEntry=frontend",user:"https:\/\/ivancww\.github\.io\/AVA-CRM\/\?avaEntry=user"\}\)/);
assert.match(html, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:false\}\)/);
assert.match(html, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:false\}\)/);
assert.match(html, /enabled:true,visible:true,allowFavorite:true,userSettings:true,adminSettings:false/);
assert.match(html, /integrationVersion:"AVA-CRM@e97746851a079ac425d4d98d18ba6b7bc42f5213"/);
assert.doesNotMatch(html, /id:"crm"[^\n]*avaEntry=admin/);
assert.doesNotMatch(html, /https:\/\/ivancww\.github\.io\/CRM/);
assert.doesNotMatch(html, /modules\/crm\//);

assert.match(html, /function supportsAppSurface\(module,surface\)/);
console.log('AVA-CRM live Front/User registration and explicit no-Admin capability checks passed');
