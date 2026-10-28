const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync('gas/Code.gs','utf8'),sheetBaseline=require('../fixtures/platform-sheet-baseline.json'),{plan}=require('../../scripts/plan-workspace-migration');
const baseline=require('../fixtures/workspace-baseline.json');
function harness({current=false,migrate=true}={}){
  const tables=JSON.parse(JSON.stringify(current?require('../fixtures/platform-sheet-current.json'):sheetBaseline));for(const op of migrate?plan(tables).operations:[]){tables[op.tab][op.row-1]??=[];tables[op.tab][op.row-1][op.column-1]=op.value;}
  let locked=false,flushes=0,corrupt=false,networkFailure=false,corruptNotification=false,failAfter=-1;
  const props=new Map([['SESSION_SECRET','local-test-secret'],['AVA_ADMIN_APP_IDS',baseline.apps.map(a=>a.id).join(',')],['AVA_REGISTRY_ALLOWED_DEPLOYMENTS',JSON.stringify([...baseline.apps.map(a=>a.entry),'https://new.test/app/'])]]);
  const context={console,Date,JSON,Math,Number,String,Set,Map,Object,Array,RegExp,isFinite,isNaN,Error,
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)||null,setProperty:(k,v)=>props.set(k,v),deleteProperty:k=>props.delete(k)})},
    Utilities:{getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,value)=>[...crypto.createHash('sha256').update(value).digest()],computeHmacSha256Signature:(value,key)=>[...crypto.createHmac('sha256',key).update(value).digest()],base64EncodeWebSafe:bytes=>Buffer.from(bytes).toString('base64url')},
    LockService:{getScriptLock:()=>({waitLock(){if(locked)throw new Error('Concurrent lock timeout');locked=true;},releaseLock(){locked=false;}})},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({text,setMimeType(){return this}})},
    SpreadsheetApp:{flush(){flushes++;if(networkFailure)throw new Error('Sheet unavailable');},getActive:()=>({getSheetByName:name=>tables[name]?{
      getDataRange:()=>({getValues(){const rows=tables[name],width=Math.max(...rows.map(r=>r.length));const value=rows.map(r=>Array.from({length:width},(_,i)=>r[i]??''));if(corrupt&&flushes>0&&name==='homepage_cards')value[1][2]='CORRUPTED';if(corruptNotification&&flushes>0&&name==='update_notifications')value[1][3]='CORRUPTED';return value}}),
      getRange:(row,col)=>({setValue(value){if(networkFailure)throw new Error('Sheet unavailable');if(failAfter===0){failAfter=-1;throw new Error('Transient cell failure');}if(failAfter>0)failAfter--;tables[name][row-1]??=[];tables[name][row-1][col-1]=value;},getValue:()=>tables[name][row-1]?.[col-1]??'',getFormula:()=>{const value=tables[name][row-1]?.[col-1];return typeof value==='string'&&value.startsWith('=')?value:''}})
    }:null})}
  };vm.createContext(context);vm.runInContext(source,context);
  const expiry=String(Date.now()+600000),nonce='local-test',signature=Buffer.from(context.Utilities.computeHmacSha256Signature(`${expiry}.${nonce}`,'local-test-secret')).toString('base64url');props.set(`AVA_ADMIN_SESSION_${nonce}`,expiry);const token=`${expiry}.${nonce}.${signature}`;
  return {context,tables,props,token,get locked(){return locked},revision:()=>String(context.readConfig_().settings.homepage_version),post:body=>JSON.parse(context.doPost({postData:{contents:JSON.stringify({sessionToken:token,...body})}}).text),corrupt(){corrupt=true},failure(){networkFailure=true},holdLock(){locked=true},corruptNotifications(){corruptNotification=true},failOnceAfter(writes){failAfter=writes}};
}
module.exports={harness};
