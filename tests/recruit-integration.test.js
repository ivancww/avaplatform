const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8");
const workspace=fs.readFileSync("workspace.js","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const documentation=fs.readFileSync("docs/recruit-module-integration.md","utf8");
const start=html.indexOf('Object.freeze({id:"recruit"');
const end=html.indexOf("\n",start);
const row=html.slice(start,end);
test("Recruit independent registration enables only frontend and User Edit",()=>{
 assert.ok(start>0,"Recruit entry exists");
 assert.equal(html.split('Object.freeze({id:"recruit"').length-1,1);
 assert.ok(row.includes('repository:"ivancww/recruit"'));
 assert.ok(row.includes('https://ivancww.github.io/recruit/?avaEntry=frontend'));
 assert.ok(row.includes('https://ivancww.github.io/recruit/?avaEntry=user'));
 assert.ok(row.includes('capabilities:Object.freeze({frontend:true,user:true,admin:false})'));
 assert.ok(row.includes('roleVisibility:Object.freeze({frontend:true,user:true,admin:false})'));
 assert.ok(!row.includes('avaEntry=admin'));
});
test("Official 招聘App is a fourth visible folder with Recruit fallback",()=>{
 assert.ok(workspace.includes('id:"area-4",title:"招聘App"'));
 assert.ok(workspace.includes('RECRUITMENT_APP_IDS=new Set(["recruit"])'));
 assert.ok(workspace.includes('RECRUITMENT_APP_IDS.has(app.id)?"area-4"'));
 assert.ok(workspace.includes('enabled.has(override)?override'));
 assert.ok(!sw.includes('recruit/index.html'));
 assert.ok(documentation.includes('does not copy, embed, rebuild or cache Recruit source code'));
});
