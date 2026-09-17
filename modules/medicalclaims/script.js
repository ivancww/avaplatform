// 定義規則
const wiseRules = {
    item1: { type: 'full', hasDays: true }, 
    item2: { type: 'full' }, 
    item3: { type: 'full' }, 
    item4: { type: 'full' }, 
    item5: { type: 'full', hasDays: true }, 
    item6: { type: 'full' }, 
    item7: { type: 'full' }, 
    item8: { type: 'full', hasDays: true }, 
    item8a: { type: 'full', hasDays: true }, 
    item9: { type: 'full' }, 
    item10: { type: 'full' }, 
    item13: { type: 'full', hasDays: true },
    item12: { type: 'cash_benefit', hasDays: true },
    item11: { type: 'per_visit_cap', limit: 1000, hasDays: true },
    item14: { type: 'cap', limit: 40000 }, 
    item15: { type: 'cap', limit: 100000 }
};

const surgeryLimits = {
    item2: { none: 0, minor: 5000, intermediate: 14375, major: 25000, complex: 43750 },
    item3: { none: 0, minor: 2125, intermediate: 5000, major: 8750, complex: 10625 },
    item4: { none: 0, minor: 2125, intermediate: 5000, major: 8750, complex: 10625 },
};

const flexiRules = {
    item6: { type: 'cap', limit: 5250, smm: true }, 
    item7: { type: 'cap', limit: 15000, smm: true },
    item10: { type: 'cap', limit: 96000 }, 
    item14: { type: 'cap', limit: 33000 },
    item1: { type: 'daily_cap', limit: 1100, hasDays: true },
    item5: { type: 'daily_cap', limit: 1100, hasDays: true },
    item8: { type: 'daily_cap', limit: 848, hasDays: true },
    item8a:{ type: 'tiered_daily_cap', limit: 640, tier_days: 3, tier_rate: 0.85, hasDays: true, smm: true },
    item9: { type: 'coinsurance', rate: 0.70, annual_limit: 22000, smm: true },
    item2: { type: 'dynamic_cap', smm: true }, 
    item3: { type: 'dynamic_cap', auto: true, smm: true }, 
    item4: { type: 'dynamic_cap', auto: true, smm: true },
};

// 同步輸入並觸發計算
function syncAndCalculate(event) {
    const target = event.target;
    const id = target.id;
    const value = target.value;
    const parts = id.split('-');
    
    if (parts.length >= 3) {
        const currentPlan = parts[0];
        const key = parts[1];
        const fieldType = parts[2]; // 'days' or 'actual'
        
        const otherPlan = currentPlan === 'wise' ? 'flexi' : 'wise';
        const otherId = `${otherPlan}-${key}-${fieldType}`;
        const otherElement = document.getElementById(otherId);

        if (otherElement && !otherElement.readOnly) {
            otherElement.value = value;
        }
        
        if (key === 'item8' && fieldType === 'days') {
             const flexi8Days = document.getElementById('flexi-item8-days');
             if(flexi8Days && parseFloat(flexi8Days.value) > 3) flexi8Days.value = 3;
        }
        
        if (key === 'item2' && fieldType === 'actual') {
            updateFlexiAutoCalc('item3', false);
            updateFlexiAutoCalc('item4', false);
        }
    }

    calculateAll();
}

// 靈活計劃 Item 3 & 4 自動計算邏輯
function updateFlexiAutoCalc(itemId, doCalculate = true) {
    const typeSelector = document.getElementById(`flexi-${itemId}-type`);
    const actualInput = document.getElementById(`flexi-${itemId}-actual`);
    const wiseInput = document.getElementById(`wise-${itemId}-actual`);
    
    if (typeSelector && typeSelector.value === 'yes') {
        const surgeonFee = parseFloat(document.getElementById('flexi-item2-actual').value) || 0;
        const autoValue = (surgeonFee * 0.35).toFixed(2);
        if (actualInput) actualInput.value = autoValue;
        if (wiseInput) wiseInput.value = autoValue;
    } else if (typeSelector && typeSelector.value === 'none') {
        if (actualInput) actualInput.value = '';
        if (wiseInput) wiseInput.value = '';
    }
    
    if (doCalculate) calculateAll();
}

// 主計算函數
function calculateAll() {
    const wiseResults = calculatePlan('wise', wiseRules);
    const flexiResults = calculatePlan('flexi', flexiRules);
    
    // 渲染睿選總結
    const wiseDeductible = parseFloat(document.getElementById('wise-deductible').value) || 0;
    const wiseFinalClaim = Math.max(0, wiseResults.claimableTotal - wiseDeductible);
    const wiseOOP = Math.max(0, wiseResults.totalExpenditure - wiseFinalClaim);
    
    document.getElementById('wise-total-expenditure').textContent = `HK$ ${wiseResults.totalExpenditure.toFixed(2)}`;
    document.getElementById('wise-claimable-total').textContent = `HK$ ${wiseResults.claimableTotal.toFixed(2)}`;
    document.getElementById('wise-ward-cash').textContent = `HK$ ${(wiseResults.wardCash || 0).toFixed(2)}`;
    document.getElementById('wise-final-oop').textContent = `HK$ ${wiseOOP.toFixed(2)}`;

    // 渲染靈活總結 (已加入 12 萬 SMM 上限)
    const rawSmm = flexiResults.smmShortfall * 0.85;
    const smmAmount = Math.min(rawSmm, 120000); // 核心修改點：加入上限
    
    const flexiFinalClaim = flexiResults.claimableTotal + smmAmount;
    const flexiOOP = Math.max(0, flexiResults.totalExpenditure - flexiFinalClaim);
    
    document.getElementById('flexi-total-expenditure').textContent = `HK$ ${flexiResults.totalExpenditure.toFixed(2)}`;
    document.getElementById('flexi-claimable-total').textContent = `HK$ ${flexiResults.claimableTotal.toFixed(2)}`;
    document.getElementById('flexi-smm').textContent = `HK$ ${smmAmount.toFixed(2)}`;
    document.getElementById('flexi-final-oop').textContent = `HK$ ${flexiOOP.toFixed(2)}`;
}

// 單一計劃計算邏輯
function calculatePlan(planPrefix, rules) {
    let claimableTotal = 0, totalExpenditure = 0, smmShortfall = 0, wardCash = 0;

    for (const key in rules) {
        const rule = rules[key];
        const daysInput = document.getElementById(`${planPrefix}-${key}-days`);
        const actualInput = document.getElementById(`${planPrefix}-${key}-actual`);
        const expendSpan = document.getElementById(`${planPrefix}-${key}-expend`);
        const reimburseSpan = document.getElementById(`${planPrefix}-${key}-reimburse`);
        const shortfallSpan = document.getElementById(`${planPrefix}-${key}-shortfall`);

        if (!actualInput) continue;
        
        const daysRaw = (rule.hasDays && daysInput) ? parseFloat(daysInput.value) : 1;
        const days = isNaN(daysRaw) ? 1 : daysRaw;
        const actualCostRaw = parseFloat(actualInput.value);
        const actualCost = isNaN(actualCostRaw) ? 0 : actualCostRaw;
        
        const expenditure = actualCost * days;

        if (expendSpan) {
            if (rule.type !== 'cash_benefit') {
                 expendSpan.textContent = expenditure.toFixed(2);
                 totalExpenditure += expenditure;
            } else {
                 expendSpan.textContent = "N/A";
            }
        }
        
        let reimbursement = 0;
        let currentLimit = rule.limit;
        
        if (rule.type === 'dynamic_cap' && planPrefix === 'flexi') {
            let selectedType = 'major';
            if (key === 'item2') {
                const typeSelector = document.getElementById('flexi-item2-type');
                if (typeSelector) selectedType = typeSelector.value;
                currentLimit = surgeryLimits[key][selectedType];
            } else {
                const surgeonSelector = document.getElementById('flexi-item2-type');
                if (surgeonSelector) selectedType = surgeonSelector.value;
                const yesNoSelector = document.getElementById(`flexi-${key}-type`);
                if (yesNoSelector && yesNoSelector.value === 'none') {
                    currentLimit = 0;
                } else {
                    currentLimit = surgeryLimits[key][selectedType];
                }
                const scopeSpan = document.getElementById(`flexi-${key}-scope`);
                if (scopeSpan) {
                    if (currentLimit > 0) {
                        const typeMap = { 'minor': '小型', 'intermediate': '中型', 'major': '大型', 'complex': '複雜' };
                        scopeSpan.textContent = `${typeMap[selectedType]} $${currentLimit.toLocaleString()}`;
                    } else {
                        scopeSpan.textContent = '';
                    }
                }
            }
        }

        if (rule.type === 'full' || rule.type === 'cash_benefit') {
            reimbursement = expenditure;
        } else if (rule.type === 'cap' || rule.type === 'dynamic_cap') {
            const safeLimit = (currentLimit === undefined) ? 0 : currentLimit;
            reimbursement = Math.min(expenditure, safeLimit);
        } else if (rule.type === 'per_visit_cap') {
            reimbursement = expenditure; 
        } else if (rule.type === 'daily_cap') {
            reimbursement = Math.min(expenditure, rule.limit * days);
        } else if (rule.type === 'tiered_daily_cap') {
            const daysInTier1 = Math.min(days, rule.tier_days);
            const daysInTier2 = Math.max(0, days - rule.tier_days);
            const costPerDay = actualCost; 
            const reimTier1 = Math.min(costPerDay, rule.limit) * daysInTier1;
            const reimTier2 = (Math.min(costPerDay, rule.limit) * rule.tier_rate) * daysInTier2;
            reimbursement = reimTier1 + reimTier2;
        } else if (rule.type === 'coinsurance') {
            const annualLimit = rule.annual_limit || Infinity;
            const coinsuranceAmt = expenditure * rule.rate;
            reimbursement = Math.min(coinsuranceAmt, annualLimit);
        }
        
        if (reimburseSpan) reimburseSpan.textContent = reimbursement.toFixed(2);

        let shortfall = expenditure - reimbursement;
        if (shortfallSpan) {
            if(rule.type === 'cash_benefit'){
                shortfallSpan.textContent = "N/A";
            } else if (shortfall > 0.005) {
                shortfallSpan.textContent = `-${shortfall.toFixed(2)}`;
            } else {
                shortfallSpan.textContent = '0.00';
            }
        }

        if (rule.smm && shortfall > 0) {
            smmShortfall += shortfall;
        }
        
        if(key === 'item12' && planPrefix === 'wise') {
            wardCash = reimbursement;
        } else {
            claimableTotal += reimbursement;
        }
    }
    
    return { claimableTotal, totalExpenditure, smmShortfall, wardCash };
}

// 提示框與事件監聽
const tooltipData = {
  'wise-plan-remark': '<h3>享用半私家房服務必須要符合以下條件</h3><ul><li>4間指定醫院 - 仁安，聖保祿，浸會及法國醫院</li><li>醫生須要可以係呢4間處理</li><li>手術前須要安排預先批核</li></ul>',
  'wise-item8-remark': '<p><b>睿選計劃備註：</b>用網絡服務包含出院後跟進門診，最少90天，最長365天。</p>',
  'wise-item8a-remark': '<p><b>睿選計劃備註：</b>用網絡服務包含出院後護理服務，最少90天，最長365天。</p>',
  'flexi-item8-remark': '<p><b>靈活計劃備註：</b>包含出院後3天內的跟進門診。</p>',
  'flexi-item8a-remark': '<p><b>出院後護理備註：</b>包含物理治療，職業治療，脊醫治療及言語治療，最多3天。超過3天后，賠償額只能報85%。</p>',
  'flexi-item9-remark': '<p><b>成像檢測備註：</b>冠狀動脈CT, 頸椎, 腰椎, 腦部MRI及PET scan除外。</p>'
};

const tooltip = document.getElementById('tooltip');
document.querySelectorAll('.info-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const tooltipId = icon.getAttribute('data-tooltip-id');
        const content = tooltipData[tooltipId];
        
        if (tooltip.innerHTML === content && tooltip.style.display === 'block') {
            tooltip.style.display = 'none';
            return;
        }
        
        tooltip.innerHTML = content;
        const rect = icon.getBoundingClientRect();
        
        if (window.innerWidth < 768) {
            tooltip.style.left = '10px';
            tooltip.style.width = 'calc(100% - 40px)';
        } else {
            tooltip.style.left = `${rect.left + window.scrollX + rect.width + 10}px`;
            tooltip.style.width = '300px';
        }
        tooltip.style.top = `${rect.top + window.scrollY}px`;
        tooltip.style.display = 'block';
    });
});

document.addEventListener('click', (e) => {
    if (!tooltip.contains(e.target) && !e.target.classList.contains('info-icon')) {
        tooltip.style.display = 'none';
    }
});

window.onload = calculateAll;
