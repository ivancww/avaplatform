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
  const ids=new Set(),keys=new Set();
  for(const row of rows){if(!row.id||ids.has(row.id)||row.module_key&&keys.has(row.module_key))throw new Error('Duplicate identity; STOP');ids.add(row.id);if(row.module_key){keys.add(row.module_key);if(!baseline.apps.some(app=>app.id===row.module_key)&&!row.registration_json)throw new Error('Unmapped existing App; STOP');}}
  const appendHeader=key=>{if(!headers.includes(key)){headers.push(key);operations.push({tab:'homepage_cards',row:1,column:headers.length,value:key});}};
  appendHeader('default_area');appendHeader('registration_json');
  baseline.apps.forEach(app=>{
    const index=rows.findIndex(row=>row.module_key===app.id),row=index<0?null:rows[index];
    if(!row&&ids.has(app.id))throw new Error('Existing card ID collides with App; STOP');
    if(row?.registration_json){const existing=JSON.parse(row.registration_json);for(const key of ['id','moduleId','entry','entryModes','capabilities','roleVisibility'])if(JSON.stringify(existing[key])!==JSON.stringify(app[key]))throw new Error(`Identity/routing conflict ${app.id}; STOP`);return;}
    const payload={...app};for(const key of ["name","displayNameZh"])delete payload[key];
    const registration=JSON.stringify(payload);
    if(row)operations.push({tab:'homepage_cards',row:index+2,column:headers.indexOf('registration_json')+1,value:registration});
    else{const newRow={id:app.id,type:'official_app',title:app.displayNameZh||app.name,subtitle:app.description,emoji:'',module_key:app.id,url:'',category:app.category,default_visible:false,default_order:app.order,enabled:true,default_area:'area-1',registration_json:registration};rows.push(newRow);ids.add(app.id);keys.add(app.id);for(const [key,value] of Object.entries(newRow))operations.push({tab:'homepage_cards',row:rows.length+1,column:headers.indexOf(key)+1,value});}
  });
  const sh=settings[0],keyCol=sh.indexOf('key'),valueCol=sh.indexOf('value');if(keyCol<0||valueCol<0)throw new Error('Missing settings headers');
  const keyRows=settings.slice(1).map(r=>r[keyCol]);if(new Set(keyRows).size!==keyRows.length)throw new Error('Duplicate setting key; STOP');
  const settingsToAdd={registry_schema_version:'1',workspace_categories:JSON.stringify([{id:'area-1',title:'App',order:0,enabled:true},{id:'area-2',title:'銷售流程',order:1,enabled:true},{id:'area-3',title:'高端市場',order:2,enabled:true}])};
  let last=settings.length;for(const [key,value] of Object.entries(settingsToAdd)){if(keyRows.includes(key))continue;last++;operations.push({tab:'homepage_settings',row:last,column:keyCol+1,value:key},{tab:'homepage_settings',row:last,column:valueCol+1,value});}
  return {spreadsheetId:expectedSheet,sourceSha:baseline.sourceSha,requiresOwnerApproval:true,requiresFreshRevisionAndBackup:true,operations,allowedDeployments:baseline.apps.map(app=>app.entry),note:'After approved application, bump homepage_version to a fresh unique revision as the final step. Preserve descriptions, formulas, unknown fields and all existing cell values.'};
}
module.exports={plan};if(require.main===module)console.log(JSON.stringify(plan(JSON.parse(fs.readFileSync(process.argv[2],'utf8'))),null,2));
