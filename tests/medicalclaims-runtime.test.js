const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const vm = require("node:vm");

const integrated = fs.readFileSync("modules/medicalclaims/script.js");
const protectedUpstreamDigest = "078982c6538cc9b91ed61698cf06357cde9529efadb293125842e36b1f6f49ac";
assert.equal(crypto.createHash("sha256").update(integrated).digest("hex"), protectedUpstreamDigest);

function throughCalculatePlan(source) {
  const end = source.indexOf("// 提示框與事件監聽");
  assert.ok(end > 0);
  return source.slice(0, end);
}
function run(source) {
  const elements = new Map();
  const resultIds = ["wise-total-expenditure", "wise-claimable-total", "wise-ward-cash", "wise-final-oop", "flexi-total-expenditure", "flexi-claimable-total", "flexi-smm", "flexi-final-oop"];
  resultIds.forEach(id => elements.set(id, { textContent: "" }));
  const costs = { item1:[4,1800], item2:[1,60000], item3:[1,21000], item4:[1,19000], item5:[3,2400], item6:[1,9000], item7:[1,26000], item8:[5,1200], item8a:[6,900], item9:[1,50000], item10:[1,120000], item11:[4,1500], item12:[3,800], item13:[2,1000], item14:[1,50000], item15:[1,130000] };
  for (const plan of ["wise", "flexi"]) for (const [key, [days, cost]] of Object.entries(costs)) {
    elements.set(`${plan}-${key}-actual`, { value: String(cost), readOnly: false });
    elements.set(`${plan}-${key}-days`, { value: String(days), readOnly: false });
    for (const suffix of ["expend", "reimburse", "shortfall", "scope"]) elements.set(`${plan}-${key}-${suffix}`, { textContent: "" });
  }
  elements.set("wise-deductible", { value: "18000" });
  elements.set("flexi-item2-type", { value: "major" });
  elements.set("flexi-item3-type", { value: "yes" });
  elements.set("flexi-item4-type", { value: "yes" });
  const context = { console, document: { getElementById: id => elements.get(id) || null } };
  vm.createContext(context);
  vm.runInContext(throughCalculatePlan(source), context);
  context.calculateAll();
  return Object.fromEntries(resultIds.map(id => [id, elements.get(id).textContent]));
}
const after = run(integrated.toString());
assert.deepEqual(after, {
  "wise-total-expenditure": "HK$ 518800.00",
  "wise-claimable-total": "HK$ 478800.00",
  "wise-ward-cash": "HK$ 2400.00",
  "wise-final-oop": "HK$ 58000.00",
  "flexi-total-expenditure": "HK$ 380800.00",
  "flexi-claimable-total": "HK$ 229242.00",
  "flexi-smm": "HK$ 86783.30",
  "flexi-final-oop": "HK$ 64774.70"
});
console.log("Medical Claims Wise/Flexi expenditure, reimbursement, deductible, SMM cap, claim and OOP golden regression passed");
