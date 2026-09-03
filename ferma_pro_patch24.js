(()=>{'use strict';
/* FERMA PRO: warehouse integrity repair + edit safety audit */
const n24=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const auto24=(prefix,id)=>C.moves.filter(m=>m.user_id===user.id&&String(m.notes||'')===`${prefix}:${id}`);
window.warehouseIntegrity24=function(){
 const issues=[];
 C.daily.forEach(d=>{const moves=auto24('AUTO_FEED',d.id);if(moves.length>1)issues.push(`Денний запис ${d.record_date}: дубль списання корму (${moves.length})`);if(d.feed_item_id&&n24(d.feed_kg)>0&&!moves.length)issues.push(`Денний запис ${d.record_date}: немає складського списання корму`);if(moves.length&&(!d.feed_item_id||moves[0].item_id!==d.feed_item_id||Math.abs(n24(moves[0].quantity)-n24(d.feed_kg))>.0001))issues.push(`Денний запис ${d.record_date}: списання корму не відповідає запису`)});
 C.treat.forEach(t=>{const moves=auto24('AUTO_MED',t.id);if(moves.length>1)issues.push(`Лікування ${t.treatment_date}: дубль списання препарату (${moves.length})`);if(t.medicine_item_id&&n24(t.used_qty)>0&&!moves.length)issues.push(`Лікування ${t.treatment_date}: немає складського списання препарату`);if(moves.length&&(!t.medicine_item_id||moves[0].item_id!==t.medicine_item_id||Math.abs(n24(moves[0].quantity)-n24(t.used_qty))>.0001))issues.push(`Лікування ${t.treatment_date}: списання препарату не відповідає запису`)});
 return [...new Set(issues)];
};
window.repairWarehouse24=async function(){
 const issues=[];let changed=0;
 const repair=async(prefix,source,id,itemId,qty,date,unitPrice,batchId)=>{
  const moves=auto24(prefix,id);
  if(!itemId||qty<=0){for(const m of moves){const r=await db.from('warehouse_movements').delete().eq('id',m.id).eq('user_id',user.id);if(!r.error)changed++;}return;}
  const valid=moves.find(m=>m.item_id===itemId&&Math.abs(n24(m.quantity)-qty)<.0001);
  if(valid){for(const m of moves){if(m.id!==valid.id){const r=await db.from('warehouse_movements').delete().eq('id',m.id).eq('user_id',user.id);if(r.error)issues.push(r.error.message);else changed++;}}return;}
  for(const m of moves){const r=await db.from('warehouse_movements').delete().eq('id',m.id).eq('user_id',user.id);if(r.error)issues.push(r.error.message);else changed++;}
  const item=C.items.find(i=>i.id===itemId);if(!item){issues.push(`Не знайдено складську позицію для ${prefix}:${id}`);return;}
  const r=await db.from('warehouse_movements').insert({user_id:user.id,item_id:itemId,batch_id:batchId,movement_type:'use',movement_date:date,quantity:qty,unit_price:unitPrice,total_amount:qty*unitPrice,reference_id:id,notes:`${prefix}:${id}`});if(r.error)issues.push(r.error.message);else changed++;
 };
 for(const d of C.daily)await repair('AUTO_FEED',d.id,d.id,d.feed_item_id,n24(d.feed_kg),d.record_date,n24(C.items.find(i=>i.id===d.feed_item_id)?.price_per_unit),d.batch_id);
 for(const t of C.treat)await repair('AUTO_MED',t.id,t.id,t.medicine_item_id,n24(t.used_qty),t.treatment_date,n24(t.price_per_unit),t.batch_id);
 await load();
 alert(`Перевірку складу завершено. Виправлено операцій: ${changed}.${issues.length?' Помилки: '+issues.join('; '):''}`);
};
const oldReports24=window.reports;
window.reports=function(){oldReports24();setTimeout(()=>{const box=document.createElement('div');box.className='card noPrint';box.style.marginTop='12px';const issues=window.warehouseIntegrity24();box.innerHTML=`<h3>Контроль складу</h3><p>${issues.length?`⚠ Виявлено ${issues.length} невідповідностей.`:'✓ Складські списання узгоджені з денним обліком та лікуванням.'}</p>${issues.length?'<button class="primary" onclick="repairWarehouse24()">🔧 Виправити складські зв’язки</button>':''}`;document.querySelector('#content')?.appendChild(box)},0)};
})();
