const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const baseline=require('./fixtures/workspace-baseline.json'),sheet=require('./fixtures/platform-sheet-baseline.json');
require('../homepage-preferences.js');require('../homepage-cloud.js');const api=AVAHomepageCloud;
const html=fs.readFileSync('index.html','utf8'),context={};
vm.runInNewContext(html.slice(html.indexOf('const MODULE_REGISTRY='),html.indexOf('const ICONS='))+';globalThis.apps=MODULE_REGISTRY',context);
assert.deepEqual(JSON.parse(JSON.stringify(context.apps)),baseline.apps,'Every existing registration, name, route, flag and ordering is identical');
for(const {name,source} of baseline.protectedFunctions)assert.equal(html.match(new RegExp('(?:async )?function '+name+'\\([^]*?(?=\\n(?:async )?function |\\nconst )'))[0],source,`${name} unchanged`);
const cloud={success:true,data:{cards:sheet.homepage_cards.slice(1).map(row=>Object.fromEntries(sheet.homepage_cards[0].map((h,i)=>[h,row[i]??'']))),settings:Object.fromEntries(sheet.homepage_settings.slice(1).map(row=>[row[0],row[1]]))}};
const parsed=api.parseResponse(cloud),bundled={items:[],layout:[]};const resolved=api.reconcile(parsed,bundled,baseline.apps);
assert.deepEqual(resolved.config.items.map(c=>[c.id,c.sheetId]),[['5pay','5pay'],['everbliss','everbliss']]);
assert.equal(resolved.config.items[0].title,'Saving Plan');
assert.deepEqual(api.mergeRegistry(baseline.apps,[]),baseline.apps);
const renamed={...baseline.apps[0],name:'新名稱',displayNameZh:'新名稱'};
assert.equal(api.mergeRegistry(baseline.apps,[renamed])[0].name,'新名稱');
assert.throws(()=>api.mergeRegistry(baseline.apps,[{...renamed,entry:'https://evil.test/'}]),/conflict|route/i);
assert.throws(()=>api.mergeRegistry(baseline.apps,[renamed,renamed]),/Duplicate/);
assert.throws(()=>api.parseResponse({...cloud,data:{...cloud.data,cards:[...cloud.data.cards,cloud.data.cards[0]]}}),/identity/i);
assert.throws(()=>api.reconcile(api.parseResponse({...cloud,data:{...cloud.data,cards:[{id:'unknown',module_key:'unknown'}]}}),bundled,baseline.apps),/Unmapped/);
const previous={officialOverrides:{'5pay':{title:'我嘅儲蓄',order:4,areaId:'area-2'}},folders:[{id:'old-folder',name:'舊資料夾',areaId:'area-2',moduleIds:['5pay']}],personalCards:[{id:'draft',title:'草稿',content:'keep',areaId:'area-1'}]};
const pref=AVAHomepage.normalizePreference(previous);assert.deepEqual(pref.officialOverrides,previous.officialOverrides);assert.equal(pref.folders[0].name,'舊資料夾');assert.equal(pref.personalCards[0].content,'keep');
const updated={items:[{id:'5pay',title:'官方新名稱',defaultVisible:true}]};assert.equal(AVAHomepage.merge(updated,pref).official[0].title,'我嘅儲蓄');assert.equal(AVAHomepage.merge(updated,{}).official[0].title,'官方新名稱');
const {plan}=require('../scripts/plan-workspace-migration');const migration=plan(sheet);assert.ok(migration.operations.length);assert.ok(!migration.operations.some(op=>op.tab==='homepage_cards'&&op.row>=2&&op.row<=3&&op.column<=12),'Existing Sheet cells untouched');
const copy=JSON.parse(JSON.stringify(sheet));for(const op of migration.operations){copy[op.tab][op.row-1]??=[];copy[op.tab][op.row-1][op.column-1]=op.value;}assert.equal(plan(copy).operations.length,0,'Offline migration plan is idempotent');
const all=api.parseResponse({success:true,data:{cards:copy.homepage_cards.slice(1).map(r=>Object.fromEntries(copy.homepage_cards[0].map((h,i)=>[h,r[i]??'']))),settings:Object.fromEntries(copy.homepage_settings.slice(1).map(r=>[r[0],r[1]]))}});
const migrated=api.mergeRegistry(baseline.apps,all.registrations);assert.equal(migrated.length,7);
for(const original of baseline.apps){const actual=migrated.find(app=>app.id===original.id);for(const field of ["id","moduleId","entry","entryModes","capabilities","roleVisibility","category","order","enabled","visible","allowFavorite"])assert.deepEqual(actual[field],original[field],`Migrated runtime preserves ${original.id}.${field}`);}assert.equal(new Set(all.cards.map(c=>c.id)).size,7);
assert.doesNotMatch(html,/overflow-x\s*:\s*hidden/);
console.log('PASS: exact seven-App inventory/routing parity; legacy Sheet and local override preservation; rename; duplicate rejection; additive/idempotent migration');

// Migration/rollback safety is exercised entirely in memory. Formula text and
// arbitrary description columns stand for an owner's complete cell export.
const {planRollback}=require('../scripts/plan-workspace-migration');
const clone=value=>JSON.parse(JSON.stringify(value));
const original=clone(sheet);original.homepage_cards[0].push('owner_formula');original.homepage_cards[1][12]='=SUM(1,2)';
const forward=plan(original),staged=clone(original);
function apply(book,operations){for(const op of operations){book[op.tab][op.row-1]??=[];if('expectedValue' in op)assert.deepEqual(book[op.tab][op.row-1][op.column-1]??'',op.expectedValue);book[op.tab][op.row-1][op.column-1]=op.value;}}
apply(staged,forward.operations);staged.homepage_settings[1][1]='fixture-migration-revision';
assert.equal(plan(staged).operations.length,0);
const undo=planRollback(original,staged,'fixture-migration-revision');assert.equal(undo.legacyDestructiveWriterMustRemainDisabled,true);apply(staged,undo.operations);
for(const tab of ['homepage_cards','homepage_settings'])for(let r=0;r<staged[tab].length;r++)for(let c=0;c<staged[tab][r].length;c++)assert.deepEqual(staged[tab][r][c]??'',original[tab][r]?.[c]??'',`Roundtrip ${tab}:${r}:${c}`);
assert.equal(staged.homepage_cards[1][12],'=SUM(1,2)');
const badCases=[
  book=>book.spreadsheetId='replacement-workbook',
  book=>book.homepage_cards.push(clone(book.homepage_cards[1])),
  book=>book.homepage_cards.push(['other-id','app','','','','5pay']),
  book=>book.homepage_cards.push(['medical','app','','','','']),
  book=>book.homepage_cards.push(['unknown','app','','','','unknown']),
  book=>{book.homepage_cards[0].push('default_area');book.homepage_cards[1][12]='area-99'},
  book=>book.homepage_settings.push(['registry_schema_version','2']),
  book=>book.homepage_settings.push(['homepage_version','duplicate']),
  book=>book.homepage_cards[0][0]='missing-id',
  book=>book.homepage_settings.splice(1,1)
];
for(const change of badCases){const input=clone(sheet);change(input);assert.throws(()=>plan(input));}
const applied=clone(original);apply(applied,forward.operations);applied.homepage_settings[1][1]='fixture-migration-revision';
assert.throws(()=>planRollback(original,applied,'stale-revision'),/Stale/);
const intervening=clone(applied);intervening.homepage_cards[1][2]='Owner changed after migration';assert.throws(()=>planRollback(original,intervening,'fixture-migration-revision'),/Intervening/);
console.log('PASS: migration idempotency, row/ID/key/schema collisions, formula/description roundtrip, revision-aware rollback and intervening-write refusal');

const mainHtml=require('node:child_process').execFileSync('git',['show','origin/main:index.html'],{encoding:'utf8'}),mainContext={};vm.runInNewContext(mainHtml.slice(mainHtml.indexOf('const MODULE_REGISTRY='),mainHtml.indexOf('const ICONS='))+';globalThis.apps=MODULE_REGISTRY',mainContext);assert.deepEqual(JSON.parse(JSON.stringify(context.apps)),JSON.parse(JSON.stringify(mainContext.apps)),'Actual latest main App registrations remain unchanged');
for(const {name} of baseline.protectedFunctions){const pattern=new RegExp('(?:async )?function '+name+'\\([^]*?(?=\\n(?:async )?function |\\nconst )');assert.equal(html.match(pattern)[0],mainHtml.match(pattern)[0],name+' exact latest-main parity');}
assert.equal(fs.readFileSync('ava-admin-auth.js','utf8'),require('node:child_process').execFileSync('git',['show','origin/main:ava-admin-auth.js'],{encoding:'utf8'}),'Existing Admin contract implementation unchanged');
