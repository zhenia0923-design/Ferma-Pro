(()=>{'use strict';
/* FERMA PRO v31: safe deletion layer + NaN guard */
const n31=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const auto31=(prefix,id)=>C.moves.filter(m=>m.user_id===user.id&&m.reference_id===id&&String(m.notes||'')===`${prefix}:${id}`);
window.del=async function(t,id){
 if(!id)return;
 if(!confirm('Видалити запис?'))return;
 try{
  const r=await db.from(t).delete().eq('id',id).eq('user_id',user.id);
  if(r.error)throw new Error(r.error.message);
  await load();
 }catch(err){alert('Не вдалося видалити: '+err.message)}
};
window.deleteAudit31=function(){
 const issues=[];
 for(const d of C.daily){const a=auto31('AUTO_FEED',d.id);if(a.length>1)issues.push(`Подвійне списання корму: ${d.id}`)}
 for(const t of C.treat){const a=auto31('AUTO_MED',t.id);if(a.length>1)issues.push(`Подвійне списання ліків: ${t.id}`)}
 for(const m of C.moves){if(/^AUTO_(FEED|MED):/.test(String(m.notes||''))&&!m.reference_id)issues.push(`Авторух без reference_id: ${m.id}`)}
 return issues;
};
const oldReports31=window.reports;
window.reports=function(){oldReports31();setTimeout(()=>{const issues=window.deleteAudit31();const box=document.createElement('div');box.className='card noPrint';box.innerHTML=`<h3>Контроль видалення та зв'язків</h3><p>${issues.length?issues.map(E).join('<br>'):'✓ Зв’язки авто-списань у нормі'}</p>`;document.querySelector('#content')?.appendChild(box)},0)};
})();