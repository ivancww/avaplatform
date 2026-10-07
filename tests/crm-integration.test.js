const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');

assert.match(html, /id:"crm",moduleId:"crm",repository:"ivancww\/AVA-CRM",name:"AVA-CRM"/);
assert.match(html, /icon:"users",category:"client-review",area:"workspace",order:80/);
assert.match(html, /entry:"https:\/\/ivancww\.github\.io\/AVA-CRM\/"/);
assert.match(html, /entryModes:Object\.freeze\(\{frontend:"https:\/\/ivancww\.github\.io\/AVA-CRM\/\?avaEntry=frontend",user:"https:\/\/ivancww\.github\.io\/AVA-CRM\/\?avaEntry=user",admin:"https:\/\/ivancww\.github\.io\/AVA-CRM\/\?avaEntry=admin"\}\)/);
assert.match(html, /capabilities:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(html, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(html, /enabled:true,visible:true,allowFavorite:true,userSettings:true,adminSettings:true/);
assert.match(html, /integrationVersion:"AVA-CRM-main@1470f8c5c4d62d1016d303ef34deda33ee20bf91"/);
assert.doesNotMatch(html, /https:\/\/ivancww\.github\.io\/CRM/);
assert.doesNotMatch(html, /modules\/crm\//);

assert.match(html, /function supportsAppSurface\(module,surface\)/);
console.log('AVA-CRM live Front/User/Admin registration and authorization-boundary checks passed');
