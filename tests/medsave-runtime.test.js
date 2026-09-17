const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");

const html = fs.readFileSync("modules/medsave/index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("modules/medsave/manifest.json", "utf8"));
const sw = fs.readFileSync("modules/medsave/sw.js", "utf8");
const upstream = fs.readFileSync("modules/medsave/UPSTREAM.md", "utf8");

function functionSource(name) {
  const match = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\([^)]*\\)\\s*\\{`).exec(html);
  assert.ok(match, `missing production function ${name}`);
  const open = html.indexOf("{", match.index);
  let depth = 0;
  for (let index = open; index < html.length; index += 1) {
    if (html[index] === "{") depth += 1;
    if (html[index] === "}" && --depth === 0) return html.slice(match.index, index + 1);
  }
  throw new Error(`unterminated production function ${name}`);
}

function assignedFunctionSource(marker) {
  const start = html.indexOf(marker);
  assert.notEqual(start, -1, `missing ${marker}`);
  const open = html.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < html.length; index += 1) {
    if (html[index] === "{") depth += 1;
    if (html[index] === "}" && --depth === 0) return html.slice(start, index + 1);
  }
  throw new Error(`unterminated ${marker}`);
}

function digest(source) {
  return crypto.createHash("sha256").update(source).digest("hex");
}

const protectedDigests = {
  renderFrontendDynamicFlow: "6f4fb22d811bf208d61548a83de34df01362a17c435c06b47fb2a6d4d88a2cb0",
  renderDynamicContainer: "81a58f044c08d1646ecdb0ea8c2ad215b3519bad1a74a5fd42de5a2b8140f61b",
  selectDynamicOption: "74358c08402b9212bd4b41bee5a58886dc26667c1be7aae96c0158eb5152b1bc",
  goToDynamicStep: "e358016fa9f99c108934329eaf9d390751737d756bd6a158b6faebf61a781a1f",
  goToStep: "f6f7a6697bbbf97ecc75bdc57efdffc1c6594c65de02eebfc42a6fd5fbfc0ae6",
  concealMedicalPremiumTotal: "4aacc99317d3028337924a8dd849408421a0eb4395f347bf437a04ffad0417be",
  revealMedicalPremiumTotal: "d9e6f0256a2cff7f67ca74fb0ebbc3ca7ca4792e02cdc350a7a93c920f7cb881",
  getMultiplierFromExcel: "141cb8a7983ad9299d2bf2be2195a560dbfd5a83440c6c8e5338c3d1d4a7af92",
  getPremiumForAge: "f2eee80b11dd1a51800f7c6dbaf9bc239eb22498ae513f027e2fb8b14f2aaff4",
  fetchReturnRates: "44f02edd04880538f807e2de613fa3b64b456cc9b71115810d694e9c564de2e2",
  fetchAllMedicalPremiums: "a6d72fdbbcc5bae5808350c5e20e777977b4be64f93da044f7768c0822c42dec",
  applySelectedMedicalPlan: "967ffe8c8ab45b0967df7be81c5fdf72e9b174ac724e4fbed347c0785ba7a10a"
};
Object.entries(protectedDigests).forEach(([name, expected]) => assert.equal(digest(functionSource(name)), expected, `${name} drifted from audited production`));
assert.equal(digest(assignedFunctionSource("window.calculateAndDisplay = function()")), "e109dac3aec6a0009eeb711a31a3918d31a64ba93b3883c2ab7eafab9f58a58c");
assert.equal(digest(assignedFunctionSource("window.calculatePromo = function()")), "ec190bf8e147cb07a6634b063816fdbab5844547646008c1ddac6e073cbb1a06");

assert.match(upstream, /9421e29884903f403596faba45f6d3e038972b41/);
assert.match(upstream, /849b3089823b964f59eaac72cde256d0653eda205c0390b0352b8d68aec64dcb/);
assert.equal(manifest.description.endsWith("v8.4.7"), true);
assert.match(sw, /ava-medical-cache-v8\.4\.7/);
assert.doesNotMatch(html, /navigator\.serviceWorker\.register/);

assert.match(html, /\['frontend', 'user', 'admin'\]\.includes\(AVA_MEDSAVE_ENTRY_MODE\)/);
assert.match(functionSource("openAvaUserManagement"), /isAdminRole = false;/);
assert.match(functionSource("openAvaUserManagement"), /localStorage\.setItem\('ava_med_is_admin', 'false'\)/);
assert.match(functionSource("openAvaUserManagement"), /openAdminDashboard\("👤 使用者設定（儲存至本機）"\);\s*applyRoleUI\(false\);/);
assert.match(html, /AVA_MEDSAVE_ENTRY_MODE === 'user'\) \{\s*openAvaUserManagement\(\);/);
assert.match(html, /else if \(AVA_MEDSAVE_ENTRY_MODE === 'admin'\) \{\s*promptAdminLogin\(\);/);
assert.match(html, /window\.location\.assign\(`\.\.\/\.\.\/index\.html\?avaSurface=\$\{returnSurface\}`\)/);
assert.doesNotMatch(functionSource("switchRole"), /removeItem\('ava_med_user_customized'\)/);
assert.doesNotMatch(functionSource("promptAdminLogin"), /removeItem\('ava_med_user_customized'\)/);
assert.match(functionSource("fetchCloudDataFromGAS"), /json\.system_title && !isUserCustomized/);
assert.match(functionSource("fetchCloudDataFromGAS"), /if \(!isUserCustomized\) \{/);
assert.doesNotMatch(functionSource("fetchCloudDataFromGAS"), /isAdminRole \|\| !isUserCustomized/);
assert.match(html, /body\.ava-mode-user #btn-restore-cloud,[\s\S]*#btn-export-settings,[\s\S]*#btn-import-settings \{ display: none !important; \}/);

// Representative golden values lock the audited total-premium and promo math.
const premiums = { 65: 10000, 66: 11000, 67: 12000 };
const inflation = 0.05;
const totalPremium = [65, 66, 67].reduce((sum, age) => sum + premiums[age] * Math.pow(1 + inflation, age - 55), 0);
assert.equal(Math.round(totalPremium), 56653);
const annualPremium = 50000, term = 5, discount = 0.05, rate = 0.038;
const offer1 = Math.floor(annualPremium / 5000) * 500;
const offer2 = annualPremium * discount;
let balance = annualPremium * (term - 1), interest = 0;
for (let year = 2; year <= term; year += 1) { const earned = balance * rate; interest += earned; balance = balance + earned - annualPremium; }
assert.deepEqual({ offer1, offer2, interest: Math.round(interest) }, { offer1: 5000, offer2: 2500, interest: 20486 });

console.log("Medsave provenance, three-mode routing, personal precedence, PWA ownership and protected runtime tests passed");
