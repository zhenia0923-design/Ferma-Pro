(()=>{'use strict';
/* FERMA PRO: livestock output and FCR synchronization */
const n19=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const removedWeight19=(id,types)=>C.events.filter(e=>e.batch_id===id&&types.includes(e.event_type)).reduce((s,e)=>s+Math.max(0,n19(e.weight_kg)),0);
window.soldWeightKg=id=>removedWeight19(id,['sale']);
window.homeWeightKg=id=>removedWeight19(id,['home']);
window.cullWeightKg=id=>removedWeight19(id,['cull']);
window.producedGainKg=id=>{const b=batch(id),w=weights(id);if(!b||!w.length)return 0;const latest=w[w.length-1],start=n19(b.start_weight_g)||n19(w[0]?.average_weight_g),live=heads(b)*n19(latest.average_weight_g)/1000,removed=removedWeight19(id,['sale','home','cull']),initial=n19(b.initial_heads)*start/1000;return Math.max(0,live+removed-initial)};
window.fcr=id=>{const g=n19(window.producedGainKg(id)),f=n19(feedKg(id));return g>0?f/g:0};
window.livestockOutput19=id=>({soldKg:n19(window.soldWeightKg(id)),homeKg:n19(window.homeWeightKg(id)),cullKg:n19(window.cullWeightKg(id)),producedGainKg:n19(window.producedGainKg(id)),fcr:n19(window.fcr(id))});
})();
