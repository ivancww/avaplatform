const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const html=fs.readFileSync("index.html","utf8");
const workspace=fs.readFileSync("workspace.js","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const documentation=fs.readFileSync("docs/recruit-module-integration.md","utf8");

test("Recruit is registered once with Frontstage/User Edit and Admin disabled",()=>{
  assert.equal((html.match(/Object\\.freeze\\(\\{id:"recruit"/g)||[]).length,1);
  assert.match(html,/repository:"ivancww\\/recruit"/);
  assert.match(html,/https:\\/\\/ivancww\\.github\\.io\\/recruit\\/\\?avaEntry=frontend/);
  assert.match(html,/https:\\/\\/ivancww\\.github\\.io\\/recruit\\/\\?avaEntry=user/);
  const row=html.match(/Object\\.freeze\\(\\{id:"recruit"[^\\n]+/)[0];
  assert.match(row,/capabilities:Object\\.freeze\\(\\{frontend:true,user:true,admin:false\\}\\)/);
  assert.match(row,/roleVisibility:Object\\.freeze\\(\\{frontend:true,user:true,admin:false\\}\\)/);
  assert.doesNotMatch(row,/avaEntry=admin/);
});
test("Official 招聘App folder is visible without changing legacy GAS metadata",()=>{
  assert.match(workspace, /id:"area-4",title:"招聘App"/);
  assert.match(workspace,/RECRUITMENT_APP_IDS=new Set\\(\\["recruit"\\]\\)/);
  assert.match(workspace,/RECRUITMENT_APP_IDS\\.has\\(app\\.id\\)\\?"area-4"/);
  assert.match(workspace,/config\\.folderMetadata/);
  assert.doesNotMatch(sw,/recruit\\/index\\.html/);
  assert.match(documentation,/does not copy, embed,\\s+rebuild or cache Recruit source code/);
});
test("Existing user folder override remains ahead of Recruit default",()=>{
  assert.ok(workspace.indexOf('enabled.has(override)?override')<
    workspace.indexOf('RECRUITMENT_APP_IDS.has(app.id)'));
});
