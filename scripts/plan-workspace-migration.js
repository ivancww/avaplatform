/* Offline only: node scripts/plan-workspace-migration.js export.json > plan.json
 * This program has no network client and cannot write to Google Sheets.
 * Input is a fresh owner export of the existing bound workbook, with arrays
 * named homepage_cards/homepage_settings. No sheet ID is inferred from title. */
const fs=require('node:fs');
const baseline=require('../tests/fixtures/workspace-baseline.json');
const expectedSheet=require('../tests/fixtures/platform-sheet-baseline.json').spreadsheetId;
function plan(input){
  if(input.spreadsheetId!==expectedSheet)throw new Error('Wrong existing workbook; STOP');
  const operations=[],cards=input.homepage_cards,settings=input.homepage_settings;
  if(!Array.isArray(cards)||!Array.isArray(settings))throw new Error('Export both existing tabs');
  for(const table of [cards,settings]){if(new Set(table[0]).size!==table[0].length||table[0].some(c=>!c))throw new Error('Ambiguous header; STOP');if(table.slice(1).some(r=>!r.some(v=>v!=='')))throw new Error('Blank interior row; STOP');}
  const headers=cards[0].slice(),rows=cards.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
  if(["id","type","title","subtitle","emoji","module_key","url","category","default_visible","default_order","enabled","updated_at"].some(key=>!headers.includes(key)))throw new Error("Missing existing card header; STOP");
  const ids=new Set(),keys=new Set(),deployments=new Map(baseline.apps.map(app=>[app.entry,app.id]));
  for(const row of rows){if(row.default_area&&!/^area-[1-9]$/.test(row.default_area))throw new Error('Unmapped existing area; STOP');if(row.registration_json){const app=JSON.parse(row.registration_json);if(app.id!==row.module_key||app.moduleId!==row.module_key)throw new Error('Registration/module identity conflict; STOP');if(deployments.has(app.entry)&&deployments.get(app.entry)!==app.id)throw new Error('Deployment identity collision; STOP');deployments.set(app.entry,app.id);}if(!row.id||ids.has(row.id)||row.module_key&&keys.has(row.module_key))throw new Error('Duplicate identity; STOP');ids.add(row.id);if(row.module_key){keys.add(row.module_key);if(!baseline.apps.some(app=>app.id===row.module_key)&&!row.registration_json)throw new Error('Unmapped existing App; STOP');}}
  const appendHeader=key=>{if(!headers.includes(key)){headers.push(key);operations.push({tab:'homepage_cards',row:1,column:headers.length,value:key});}};
  appendHeader('default_area');appendHeader('registration_json');
  baseline.apps.forEach(app=>{
    const index=rows.findIndex(row=>row.module_key===app.id),row=index<0?null:rows[index];
    if(!row&&ids.has(app.id))throw new Error('Existing card ID collides with App; STOP');
    if(row?.registration_json){const existing=JSON.parse(row.registration_json);for(const key of ['id','moduleId','entry','entryModes','capabilities','roleVisibility','adminLaunchContract','userSettings','adminSettings'])if(JSON.stringify(existing[key])!==JSON.stringify(app[key]))throw new Error(`Identity/routing conflict ${app.id}; STOP`);return;}
    const payload={...app};for(const key of ["name","displayNameZh"])delete payload[key];
    const registration=JSON.stringify(payload);
    if(row)operations.push({tab:'homepage_cards',row:index+2,column:headers.indexOf('registration_json')+1,value:registration});
    else{const newRow={id:app.id,type:'official_app',title:app.displayNameZh||app.name,subtitle:app.description,emoji:'',module_key:app.id,url:'',category:app.category,default_visible:false,default_order:app.order,enabled:true,default_area:'area-1',registration_json:registration};rows.push(newRow);ids.add(app.id);keys.add(app.id);for(const [key,value] of Object.entries(newRow))operations.push({tab:'homepage_cards',row:rows.length+1,column:headers.indexOf(key)+1,value});}
  });
  const sh=settings[0],keyCol=sh.indexOf('key'),valueCol=sh.indexOf('value');if(keyCol<0||valueCol<0)throw new Error('Missing settings headers');
  const keyRows=settings.slice(1).map(r=>r[keyCol]);if(keyRows.some(key=>typeof key!=='string'||!key)||new Set(keyRows).size!==keyRows.length)throw new Error('Duplicate setting key; STOP');
  if(!keyRows.includes('homepage_version')||!String(settings[keyRows.indexOf('homepage_version')+1][valueCol]??''))throw new Error('Missing existing revision; STOP');
  const versionIndex=keyRows.indexOf('registry_schema_version');if(versionIndex>=0&&String(settings[versionIndex+1][valueCol])!=='1')throw new Error('Unsupported existing registry schema; STOP');
  const settingsToAdd={registry_schema_version:'1',workspace_categories:JSON.stringify([{id:'area-1',title:'App',order:0,enabled:true},{id:'area-2',title:'銷售流程',order:1,enabled:true},{id:'area-3',title:'高端市場',order:2,enabled:true}])};
  let last=settings.length;for(const [key,value] of Object.entries(settingsToAdd)){if(keyRows.includes(key))continue;last++;operations.push({tab:'homepage_settings',row:last,column:keyCol+1,value:key},{tab:'homepage_settings',row:last,column:valueCol+1,value});}
  return {spreadsheetId:expectedSheet,expectedRevision:String(settings.find((row,index)=>index>0&&row[keyCol]==='homepage_version')?.[valueCol]??''),sourceSha:baseline.sourceSha,requiresOwnerApproval:true,requiresFreshRevisionAndBackup:true,operations,allowedDeployments:baseline.apps.map(app=>app.entry),note:'After approved application, bump homepage_version to a fresh unique revision as the final step. Preserve descriptions, formulas, unknown fields and all existing cell values.'};
}
// Rollback is a guarded offline cell patch, never a table replacement or GAS
// deployment. It refuses intervening writes and preserves formulas/descriptions.
function planRollback(original,current,expectedRevision){
  if(current.spreadsheetId!==expectedSheet||original.spreadsheetId!==expectedSheet)throw new Error('Wrong workbook; STOP');
  const read=(book,tab,row,column)=>book[tab]?.[row-1]?.[column-1]??'';
  const settings=current.homepage_settings,headers=settings[0],key=headers.indexOf('key'),value=headers.indexOf('value');
  if(key<0||value<0||typeof expectedRevision!=='string'||!expectedRevision)throw new Error('Confirmed migration revision required');
  const versionRow=settings.findIndex((row,index)=>index>0&&row[key]==='homepage_version');
  if(versionRow<0||String(settings[versionRow][value])!==expectedRevision)throw new Error('Stale rollback revision; STOP');
  const forward=plan(original),owned=new Map(forward.operations.map(op=>[`${op.tab}:${op.row}:${op.column}`,op]));
  const versionCell=`homepage_settings:${versionRow+1}:${value+1}`;
  for(const tab of ['homepage_cards','homepage_settings']){
    const count=Math.max(original[tab].length,current[tab].length);
    for(let row=1;row<=count;row++)for(let column=1;column<=Math.max(original[tab][row-1]?.length||0,current[tab][row-1]?.length||0);column++){
      const id=`${tab}:${row}:${column}`;if(id===versionCell)continue;
      const operation=owned.get(id),expected=operation?operation.value:read(original,tab,row,column);
      if(JSON.stringify(read(current,tab,row,column))!==JSON.stringify(expected))throw new Error('Intervening cell/formula change; manual rollback reconciliation required');
    }
  }
  const operations=forward.operations.slice().reverse().map(op=>({tab:op.tab,row:op.row,column:op.column,expectedValue:op.value,value:read(original,op.tab,op.row,op.column)}));
  const oldHeaders=original.homepage_settings[0],oldKey=oldHeaders.indexOf('key'),oldValue=oldHeaders.indexOf('value'),oldVersion=original.homepage_settings.find((r,i)=>i>0&&r[oldKey]==='homepage_version')?.[oldValue];
  operations.push({tab:'homepage_settings',row:versionRow+1,column:value+1,expectedValue:settings[versionRow][value],value:oldVersion});
  return {spreadsheetId:expectedSheet,expectedRevision,requiresOwnerApproval:true,requiresOfficialWritesPaused:true,legacyDestructiveWriterMustRemainDisabled:true,operations};
}
module.exports={plan,planRollback};
if(require.main===module){const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));console.log(JSON.stringify(process.argv[3]==='--rollback'?planRollback(input,JSON.parse(fs.readFileSync(process.argv[4],'utf8')),process.argv[5]):plan(input),null,2));}
