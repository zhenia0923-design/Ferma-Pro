(()=>{'use strict';
/* FERMA PRO v32: deletion/reference integrity + recipe safety */
const n32=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const oldDel32=window.del;
window.del=async function(t,id){
 if(!id)return;
 if(!confirm('Видалити запис?'))return;
 try{
  if(t==='warehouse_items'){
   const usedRecipe=C.lines.some(x=>x.user_id===user.id&&x.item_id===id);
   const usedDaily=C.daily.some(x=>x.user_id===user.id&&x.feed_item_id===id);
   const usedTreat=C.treat.some(x=>x.user_id===user.id&&x.medicine_item_id===id);
   if(usedRecipe||usedDaily||usedTreat){
    const parts=[];
    if(usedRecipe)parts.push('рецепті');
    if(usedDaily)parts.push('денному обліку');
    if(usedTreat)parts.push('лікуванні');
    return alert('Не можна видалити позицію: вона використовується у '+parts.join(', ')+'. Спочатку приберіть зв’язок.');
   }
  }
  await oldDel32(t,id);
 }catch(err){alert('Не вдалося видалити: '+(err?.message||err))}
};
window.deleteAudit32=function(){
 const issues=[];
 for(const d of C.daily){const a=C.moves.filter(m=>m.user_id===user.id&&m.reference_id===d.id&&m.notes===`AUTO_FEED:${d.id}`);if(a.length>1)issues.push(`Подвійний AUTO_FEED: ${d.id}`);}
 for(const t of C.treat){const a=C.moves.filter(m=>m.user_id===user.id&&m.reference_id===t.id&&m.notes===`AUTO_MED:${t.id}`);if(a.length>1)issues.push(`Подвійний AUTO_MED: ${t.id}`);}
 for(const m of C.moves){if(/^AUTO_(FEED|MED):/.test(String(m.notes||''))&&!m.reference_id)issues.push(`AUTO-рух без reference_id: ${m.id}`);}
 for(const f of C.fin){if(f.category==='Продаж птиці'&&f.reference_id&&!C.events.some(e=>e.id===f.reference_id))issues.push(`Продаж птиці без події: ${f.id}`);}
 for(const l of C.lines){if(!l.item_id)issues.push(`Рядок рецепта без інгредієнта: ${l.id}`);}
 return issues;
};
const oldReports32=window.reports;
if(typeof oldReports32==='function')window.reports=function(){oldReports32();setTimeout(()=>{const issues=window.deleteAudit32();const box=document.createElement('div');box.className='card noPrint';box.innerHTML=`<h3>Контроль редагування та видалення</h3><p>${issues.length?issues.map(E).join('<br>'):'✓ Критичних невідповідностей не виявлено'}</p>`;document.querySelector('#content')?.appendChild(box)},0)};
})();
