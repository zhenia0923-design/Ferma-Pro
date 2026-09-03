(()=>{'use strict';
/* FERMA PRO: finance and cost accounting hardening */
const n11=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const fin11=(id,type)=>C.fin.filter(x=>x.batch_id===id&&x.operation_type===type).reduce((s,x)=>s+n11(x.amount),0);
window.explicitExpense=function(id){return fin11(id,'expense')};
window.explicitIncome=function(id){return fin11(id,'income')};
window.income=function(id){return n11(window.birdSales(id))+n11(window.eggSalesIncome(id))+n11(window.explicitIncome(id))};
window.totalCost=function(id){const b=batch(id);return n11(b?.initial_heads)*n11(b?.chick_price)+n11(window.feedCost(id))+n11(window.dailyCost(id))+n11(window.treatmentCost(id))+n11(window.explicitExpense(id))};
window.netResult=function(id){return n11(window.income(id))-n11(window.totalCost(id))};
window.costPerLiveBird=function(id){const h=n11(heads(batch(id)));const c=n11(window.totalCost(id));return h>0?c/h:0};
window.costPerKg=function(id){const b=batch(id),w=latestWeight(id);const kg=b&&w?n11(heads(b))*n11(w.average_weight_g)/1000:0;return kg>0?n11(window.totalCost(id))/kg:0};
window.financeSummary=function(id){return {income:n11(window.income(id)),cost:n11(window.totalCost(id)),result:n11(window.netResult(id)),incomeManual:n11(window.explicitIncome(id)),expenseManual:n11(window.explicitExpense(id)),feed:n11(window.feedCost(id)),daily:n11(window.dailyCost(id)),treatment:n11(window.treatmentCost(id)),chicks:n11(batch(id)?.initial_heads)*n11(batch(id)?.chick_price)}};
})();
