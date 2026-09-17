const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("modules/medicalclaims/index.html", "utf8");

function functionSource(name) {
  const match = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\([^)]*\\)\\s*\\{`).exec(html);
  assert.ok(match, `missing ${name}`);
  const open = html.indexOf("{", match.index); let depth=0;
  for(let i=open;i<html.length;i+=1){ if(html[i]==="{")depth+=1; if(html[i]==="}"&&--depth===0)return html.slice(match.index,i+1); }
  throw new Error(`unterminated ${name}`);
}

const toggleCase = functionSource("toggleCloudCase");
const deleteCase = functionSource("deleteLocalUserCase");
const toggleDocument = functionSource("toggleCloudDocument");
const deleteDocument = functionSource("deletePersonalDocument");
const upload = functionSource("savePendingPersonalFiles");
const firebaseUpload = functionSource("uploadFilesToFirebase");

assert.match(toggleCase, /STORAGE_KEY_HIDDEN_CLOUD_CASES/);
assert.doesNotMatch(toggleCase, /fetch|firebase|claimCases\.splice/);
assert.match(deleteCase, /STORAGE_KEY_USER_CASES/);
assert.doesNotMatch(deleteCase, /STORAGE_KEY_HIDDEN_CLOUD_CASES|claimCases/);
assert.match(toggleDocument, /STORAGE_KEY_HIDDEN_CLOUD_DOCUMENTS/);
assert.doesNotMatch(toggleDocument, /fetch|firebase|deletePersonalFile/);
assert.match(deleteDocument, /AVAStorage\.deletePersonalFile/);
assert.doesNotMatch(deleteDocument, /claimCases|firebase/);
assert.match(upload, /AVAStorage\.saveFile\(providerId/);
assert.doesNotMatch(upload, /firebase|storageRef|putLocalDocumentBlob/);
assert.match(firebaseUpload, /if \(!isAdminMaster\)/);
assert.match(html, /source: 'personal'/);
assert.match(html, /storageProvider: item\.storageProvider \|\| 'local'/);
assert.match(html, /providerReference:/);
assert.match(html, /caseId:/);
assert.match(html, /missingFile:normalized\.storageProvider === 'local'/);
assert.match(html, /不會將你的私人PDF或圖片自動複製到官方Firebase/);
console.log("Medical Claims official overlay, personal ownership, provider metadata and Firebase privacy boundaries passed");
