(()=>{'use strict';
/* FERMA PRO: production mass, FCR and cost/kg correction */
const n27=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const eventWeight27=(id,types)=>C.events.filter(e=>e.batch_id===id&&types.includes(e.event_type)).reduce((s,e)=>s+Math.max(0,n27(e.weight_kg)),0);
window.producedOutputKg27=id=>{const b=batch(id),w=latestWeight(id);if(!b||!w)return 0;const live=n27(heads(b))*n27(w.average_weight_g)/1000;const sold=eventWeight27(id,['sale']);const home=eventWeight27(id,['home']);const cull=eventWeight27(id,['cull']);return Math.max(0,live+sold+home+cull)};
window.producedGainKg27=id=>{const b=batch(id),w=latestWeight(id);if(!b||!w)return 0;const start=n27(b.start_weight_g)||n27(firstWeight(id)?.average_weight_g);if(start<=0)return 0;const produced=n27(window.producedOutputKg27(id));const initial=n27(b.initial_heads)*start/1000;return Math.max(0,produced-initial)};
window.fcr27=id=>{const g=n27(window.producedGainKg27(id));return g>0?n27(feedKg(id))/g:0};
window.fcr=id=>window.fcr27(id);
window.producedGainKg=id=>window.producedGainKg27(id);
window.productionCostPerKg16=id=>{const a=window.batchAccounting14?.(id);if(!a)return 0;const produced=n27(window.producedOutputKg27(id));return produced>0?n27(a.totalCost)/produced:0};
window.costPerProducedKg27=id=>window.productionCostPerKg16(id);
})();
