(()=>{'use strict';
/* FERMA PRO v59: fix cull event payload. Never send total_preview to livestock_events. */
const N59=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
const E59=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const prevEventForm59=window.eventForm;
window.eventForm=async function(bid,type,id){
 const x=id?C.events.find(e=>e.id===id):null,b=batch(bid);
 openModal(`<h3>${id?'Редагувати':'Новий'}: ${E59(type)}</h3><form id="form" class="grid g2"><div class="field"><label>Дата</label><input name="event_date" type="date" value="${x?.event_date||D()}"></div><div class="field"><label>Голови</label><input name="heads" type="number" min="1" value="${N59(x?.heads)||''}" required></div><div class="field"><label>Вага, кг</label><input name="weight_kg" type="number" min="0" step=".001" value="${N59(x?.weight_kg)}"></div>${type==='sale'?'<div class="field"><label>Ціна, грн/кг</label><input name="price_per_kg" type="number" min="0" step=".01" value="'+N59(x?.price_per_kg)+'"></div><div class="field"><label>Клієнт</label><input name="client" value="'+E59(x?.client||'')+'"></div>':''}<div class="field" style="grid-column:1/-1"><label>Причина / примітка</label><input name="notes" value="${E59(x?.notes||'')}"></div><button class="primary">Зберегти</button></form>`);
 $('form').onsubmit=async e=>{e.preventDefault();
   const p={event_date:e.target.event_date.value,batch_id:bid,event_type:type,heads:N59(e.target.heads.value),weight_kg:N59(e.target.weight_kg.value),notes:String(e.target.notes.value||'').trim()};
   if(type==='sale'){p.price_per_kg=N59(e.target.price_per_kg.value);p.client=String(e.target.client.value||'').trim();p.total_amount=p.weight_kg*p.price_per_kg}else{p.price_per_kg=0;p.total_amount=0}
   const available=heads(b)+(x?N59(x.heads):0);
   if(['mortality','sale','home','cull'].includes(type)&&p.heads>available)return alert('Недостатньо поголів’я.');
   /* IMPORTANT: payload is deliberately whitelisted. total_preview is never sent. */
   const allowed={event_date:p.event_date,batch_id:p.batch_id,event_type:p.event_type,heads:p.heads,weight_kg:p.weight_kg,price_per_kg:p.price_per_kg,total_amount:p.total_amount,client:p.client,notes:p.notes};
   if(await save('livestock_events',allowed,id)){closeModal();openBatch(bid)}
 };
};
})();
