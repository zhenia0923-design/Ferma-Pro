(()=>{'use strict';
/* FERMA PRO: warehouse integrity audit */
const n18=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const auto18=(prefix,id)=>C.moves.find(m=>m.user_id===user.id&&m.reference_id===id&&String(m.notes||'')===`${prefix}:${id}`);
window.warehouseIntegrityAudit18=function(batchId=null){
 const issues=[];
 C.daily.filter(r=>!batchId||r.batch_id===batchId).forEach(r=>{if(n18(r.feed_kg)>0&&!auto18('AUTO_FEED',r.id))issues.push({type:'feed',id:r.id,batch_id:r.batch_id,qty:n18(r.feed_kg),message:'Денний запис має корм, але автоматичного списання зі складу немає.'})});
 C.treat.filter(r=>!batchId||r.batch_id===batchId).forEach(r=>{if(n18(r.used_qty)>0&&!auto18('AUTO_MED',r.id))issues.push({type:'medicine',id:r.id,batch_id:r.batch_id,qty:n18(r.used_qty),message:'Лікування має фактичне використання препарату, але автоматичного списання зі складу немає.'})});
 return issues;
};
const oldOpenBatch=window.openBatch;
if(typeof oldOpenBatch==='function')window.openBatch=async function(id){const r=oldOpenBatch(id);try{await r}catch(e){}setTimeout(()=>{const issues=window.warehouseIntegrityAudit18(id);if(issues.length){const el=$('content');if(el)el.innerHTML+=`<div class="card section" style="border:1px solid #f59e0b"><h3>⚠️ Перевірка складу</h3><p>Знайдено ${issues.length} запис(ів), для яких немає автоматичного списання зі складу. Собівартість може бути занижена.</p><ul>${issues.map(x=>`<li>${E(x.message)} Кількість: <b>${x.qty}</b></li>`).join('')}</ul><p class="muted">Не створюємо списання автоматично без вибраної складської позиції, щоб не списати неправильний корм або препарат.</p></div>`}},0)};
const oldReports=window.reports;
if(typeof oldReports==='function')window.reports=function(){oldReports();const all=window.warehouseIntegrityAudit18();if(all.length){const el=$('content');if(el)el.innerHTML+=`<div class="card section" style="border:1px solid #f59e0b"><h3>⚠️ Контроль цілісності складу</h3><p>Незаповнених автоматичних списань: <b>${all.length}</b>. Перевірте записи перед друком фінального звіту.</p></div>`}};
})();
