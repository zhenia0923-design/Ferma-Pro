(()=>{'use strict';
/* FERMA PRO: prevent duplicate medicine costing between daily records and treatments */
const n17=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
window.dailyMedicineCost17=id=>C.daily.filter(x=>x.batch_id===id).reduce((s,x)=>s+n17(x.medicine_cost),0);
window.dailyNonMedicineCost17=id=>C.daily.filter(x=>x.batch_id===id).reduce((s,x)=>s+n17(x.water_cost)+n17(x.bedding_cost)+n17(x.electricity_cost)+n17(x.labor_cost)+n17(x.other_cost),0);
window.treatmentCost17=id=>C.treat.filter(x=>x.batch_id===id).reduce((s,x)=>s+n17(x.total_cost),0);
window.totalCost17=id=>{const b=batch(id);const chicks=n17(b?.initial_heads)*n17(b?.chick_price);const feed=n17(feedCost(id));const dailyOther=n17(window.dailyNonMedicineCost17(id));const dailyMed=n17(window.dailyMedicineCost17(id));const treatment=n17(window.treatmentCost17(id));const medicineCombined=Math.max(dailyMed,treatment);const manual=n17(explicitExpense(id));return chicks+feed+dailyOther+medicineCombined+manual};
window.financeSummary17=id=>({income:n17(income(id)),cost:n17(window.totalCost17(id)),result:n17(income(id))-n17(window.totalCost17(id)),feed:n17(feedCost(id)),dailyOther:n17(window.dailyNonMedicineCost17(id)),dailyMedicine:n17(window.dailyMedicineCost17(id)),treatment:n17(window.treatmentCost17(id)),chicks:n17(batch(id)?.initial_heads)*n17(batch(id)?.chick_price),manualExpense:n17(explicitExpense(id))});
if(typeof window.batchAccounting14==='function')window.batchAccounting14_legacy17=window.batchAccounting14;
window.batchAccounting14=function(id){const a=window.batchAccounting14_legacy17?window.batchAccounting14_legacy17(id):null;if(!a)return null;const cost=n17(window.totalCost17(id)),income=n17(window.income(id));return {...a,dailyCost:n17(window.dailyNonMedicineCost17(id)),treatmentCost:n17(window.treatmentCost17(id)),totalCost:cost,income,result:income-cost,costPerLiveKg:a.liveKg>0?cost/a.liveKg:0};};
if(typeof window.totalCost==='function')window.totalCost=window.totalCost17;
if(typeof window.treatmentCost==='function')window.treatmentCost=window.treatmentCost17;
})();