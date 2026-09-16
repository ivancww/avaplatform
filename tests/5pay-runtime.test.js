const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");

const runtime = fs.readFileSync("modules/5pay/index.html", "utf8");
const duplicatedUserActions = `                    <button class="nav-btn prev" style="width:auto; padding:8px 14px; background:#eff6ff; border-color:#93c5fd; color:#1d4ed8;" onclick="resetToTeamDefault()">🔄 還原為團隊預設</button>\n                    <button class="step-ctrl-btn" onclick="exportUserDataJSON()">📤 匯出設定</button>\n                    <button class="step-ctrl-btn" onclick="document.getElementById('json-import-input').click()">📥 匯入設定</button>\n`;
const entryHook = `            // AVA supplies an explicit entry context; the standalone/default path stays frontend.\n            const avaEntryMode = new URLSearchParams(window.location.search).get('avaEntry');\n            if (avaEntryMode === 'user' || avaEntryMode === 'admin') {\n                openDashboardWithRole(avaEntryMode);\n            }\n\n`;

// Reversing the two reviewed integration deltas must reproduce upstream exactly.
const restoredUpstream = runtime
  .replace("            if ('serviceWorker' in navigator) {", entryHook + "            if ('serviceWorker' in navigator) {")
  .replace(entryHook + entryHook, entryHook) // fail-safe: the hook is already present in runtime
  .replace(entryHook, "")
  .replace('                    <button class="nav-btn prev" style="width:auto; padding:8px 18px; background:#f0fdf4; border-color:#86efac; color:#166534;" onclick="saveToLocalStorageOnly()">', duplicatedUserActions + '                    <button class="nav-btn prev" style="width:auto; padding:8px 18px; background:#f0fdf4; border-color:#86efac; color:#166534;" onclick="saveToLocalStorageOnly()">');
assert.equal(crypto.createHash("sha256").update(restoredUpstream).digest("hex"), "dfdb7a79ca6caafe65300f15fb90229f948c32753d53e92b1139ea55cf519440");

assert.match(runtime, /function openDashboardWithRole\(targetRole\)/);
assert.match(runtime, /if \(targetRole === 'admin'\) switchRoleTo\('admin'\)/);
assert.match(runtime, /const pwd = prompt\("請輸入管理者密碼進行身分驗證："\)/);
assert.match(runtime, /openDashboardWithRole\(avaEntryMode\)/);
assert.match(runtime, /avaEntryMode === 'user' \|\| avaEntryMode === 'admin'/);
assert.doesNotMatch(runtime, /onclick="resetToTeamDefault\(\)">/);
assert.doesNotMatch(runtime, /onclick="exportUserDataJSON\(\)">/);
assert.doesNotMatch(runtime, /onclick="document\.getElementById\('json-import-input'\)\.click\(\)">/);
assert.match(runtime, /onclick="saveToLocalStorageOnly\(\)"/);
assert.match(runtime, /function resetToTeamDefault\(\)/);
assert.match(runtime, /function exportUserDataJSON\(\)/);
assert.match(runtime, /function handleJSONImport\(input\)/);
assert.match(runtime, /function syncAllToGoogleSheet\(\)/);
assert.match(runtime, /function fetchCloudDataWithFastCheck\(\)/);
assert.match(runtime, /let currentSystemVersion = "v6\.3\.23"/);
assert.match(runtime, /let GAS_API_URL = 'https:\/\/script\.google\.com/);
console.log("Vendored 5Pay provenance, explicit entry, frontend regression, and role UI tests passed");
