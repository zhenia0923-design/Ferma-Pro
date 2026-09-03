(()=>{'use strict';
const n16=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
window.productionCostPerKg16=id=>{const a=window.batchAccounting14?.(id);if(!a)return 0;const produced=n16(a.liveKg)+(typeof soldWeightKg==='function'?n16(soldWeightKg(id)):0);return produced>0?a.totalCost/produced:0};
window.mortalityPct16=id=>{const b=typeof batch==='function'?batch(id):null;if(!b||n16(b.initial_heads)<=0)return 0;return Math.max(0,(n16(b.initial_heads)-n16(heads(b))))/n16(b.initial_heads)*100};
})();