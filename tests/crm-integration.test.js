const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');

assert.match(html, /id:"crm",moduleId:"crm",name:"CRM · Client Review Center"/);
assert.match(html, /icon:"users",category:"client-review",area:"workspace",order:40/);
assert.match(html, /entry:"https:\/\/ivancww\.github\.io\/CRM\/index\.html\?avaEntry=frontend"/);
assert.match(html, /entryModes:Object\.freeze\(\{frontend:"https:\/\/ivancww\.github\.io\/CRM\/index\.html\?avaEntry=frontend",user:"https:\/\/ivancww\.github\.io\/CRM\/index\.html\?avaEntry=user",admin:"https:\/\/ivancww\.github\.io\/CRM\/index\.html\?avaEntry=admin"\}\)/);
assert.match(html, /roleVisibility:Object\.freeze\(\{frontend:true,user:true,admin:true\}\)/);
assert.match(html, /allowFavorite:true,userSettings:true,adminSettings:true/);
assert.match(html, /module\.roleVisibility&&module\.roleVisibility\[entryMode\]===false/);
assert.doesNotMatch(html, /modules\/crm\//);

console.log('CRM independent-module registration and three-entry routing tests passed');
