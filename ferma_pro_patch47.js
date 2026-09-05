(()=>{'use strict';
/* FERMA PRO v47 compatibility: bird movement UI only. v49 owns all submit/save logic. */
const n47=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const TYPES47={mortality:'Падіж',sale:'Продаж',home:'Додому',cull:'Вибракування',adjustment:'Коригування'};
function events47(bid){return(C.events||[]).filter(x=>String(x.batch_id)===String(bid))}
function balance47(bid){const b=(C.batches||[]).find(x=>String(x.id)===String(bid));if(!b)return 0;return Math.max(0,Math.round(n47(b.initial_heads)+events47(bid).reduce((s,x)=>{const t=String(x.event_type||'');if(['mortality','sale','home','cull'].includes(t))return s-n47(x.heads);if(t==='adjustment'){const q=String(x.notes||'').toLowerCase();return s+(/(^|\s)(in|прихід|додано|додав)/.test(q)?n47(x.heads):-n47(x.heads))}return s},0)))}
window.saveLivestockEvent47=window.saveMovement49||null;
window.birdMovement47=function(bid,id){if(typeof window.openMovement49==='function')return window.openMovement49(bid,id);const b=(C.batches||[]).find(x=>String(x.id)===String(bid));if(!b)return;openModal(`<h3>🐔 Рух птиці: ${E(b.name)}</h3><p class="muted">Залишок: <b>${balance47(bid)} гол.</b></p>`)};
window.deleteBirdMovement47=window.deleteMovement49||null;
})();