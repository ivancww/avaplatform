const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");

const runtime = fs.readFileSync("modules/5pay/index.html", "utf8");
const duplicatedUserActions = `                    <button class="nav-btn prev" style="width:auto; padding:8px 14px; background:#eff6ff; border-color:#93c5fd; color:#1d4ed8;" onclick="resetToTeamDefault()">🔄 還原為團隊預設</button>\n                    <button class="step-ctrl-btn" onclick="exportUserDataJSON()">📤 匯出設定</button>\n                    <button class="step-ctrl-btn" onclick="document.getElementById('json-import-input').click()">📥 匯入設定</button>\n`;
const originalEntryHook = `            // AVA supplies an explicit entry context; the standalone/default path stays frontend.\n            const avaEntryMode = new URLSearchParams(window.location.search).get('avaEntry');\n            if (avaEntryMode === 'user' || avaEntryMode === 'admin') {\n                openDashboardWithRole(avaEntryMode);\n            }\n\n`;

// Remove only the reviewed AVA shell/mode deltas, then reverse the prior AVA
// integration deltas. The complete result must still be the production upstream.
const restoredUpstream = runtime
  .replace(/\n        \/\* AVA supplies a mode contract\.[\s\S]*?height: 100vh; border-radius: 0; \}\n/, "")
  .replace(/    <script>\n        \/\/ This routing contract[\s\S]*?    <\/script>\n/, "")
  .replace(/        function closeAdminDashboard\(\) \{[\s\S]*?            document\.getElementById\('admin-modal-mask'\)\.style\.display = 'none';\n        \}/, "        function closeAdminDashboard() { document.getElementById('admin-modal-mask').style.display = 'none'; }")
  .replace(/            \/\/ AVA supplies an explicit entry context; the standalone\/default path stays frontend\.\n            if \(AVA_5PAY_ENTRY_MODE === 'user' \|\| AVA_5PAY_ENTRY_MODE === 'admin'\) \{\n                openDashboardWithRole\(AVA_5PAY_ENTRY_MODE\);\n            \}\n\n/, originalEntryHook)
  .replace(originalEntryHook, "")
  .replace('                    <button class="nav-btn prev" style="width:auto; padding:8px 18px; background:#f0fdf4; border-color:#86efac; color:#166534;" onclick="saveToLocalStorageOnly()">', duplicatedUserActions + '                    <button class="nav-btn prev" style="width:auto; padding:8px 18px; background:#f0fdf4; border-color:#86efac; color:#166534;" onclick="saveToLocalStorageOnly()">');
assert.equal(crypto.createHash("sha256").update(restoredUpstream).digest("hex"), "dfdb7a79ca6caafe65300f15fb90229f948c32753d53e92b1139ea55cf519440");

assert.match(runtime, /function openDashboardWithRole\(targetRole\)/);
assert.match(runtime, /if \(targetRole === 'admin'\) switchRoleTo\('admin'\)/);
assert.match(runtime, /const pwd = prompt\("請輸入管理者密碼進行身分驗證："\)/);
assert.match(runtime, /const AVA_5PAY_ENTRY_MODE = new URLSearchParams/);
assert.match(runtime, /openDashboardWithRole\(AVA_5PAY_ENTRY_MODE\)/);
assert.match(runtime, /window\.location\.assign\(`\.\.\/\.\.\/index\.html\?avaSurface=\$\{returnSurface\}`\)/);
assert.match(runtime, /body\.ava-mode-frontend \.user-settings-btn \{ display: none; \}/);
assert.match(runtime, /body\.ava-mode-user \.role-switch-bar \{ display: none; \}/);
assert.doesNotMatch(runtime, /onclick="resetToTeamDefault\(\)">/);
assert.doesNotMatch(runtime, /onclick="exportUserDataJSON\(\)">/);
assert.doesNotMatch(runtime, /onclick="document\.getElementById\('json-import-input'\)\.click\(\)">/);
assert.match(runtime, /onclick="saveToLocalStorageOnly\(\)"/);
assert.match(runtime, /localStorage\.setItem\('ava_user_has_customized', 'true'\)/);
assert.match(runtime, /function syncAllToGoogleSheet\(\)/);
assert.match(runtime, /function fetchCloudDataWithFastCheck\(\)/);
assert.match(runtime, /let currentSystemVersion = "v6\.3\.23"/);
assert.match(runtime, /let GAS_API_URL = 'https:\/\/script\.google\.com/);
console.log("Vendored 5Pay provenance, explicit three-mode workspace, return routing, and protected contracts passed");
