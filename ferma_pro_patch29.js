(()=>{'use strict';
/* FERMA PRO v29: warehouse/cost integrity hardening */
const n29=v=>{const x=Number(v);return Number.isFinite(x)?x:0};

/* Feed cost: never let a zero/null movement total hide the quantity x unit price fallback. */
window.feedCost=function(id){
 return C.moves.filter(m=>m.batch_id===id&&m.movement_type==='use'&&C.items.some(i=>i.id===m.item_id&&i.item_type==='feed'))
 .reduce((s,m)=>{const total=n29(m.total_amount);return s+(total>0?total:n29(m.quantity)*n29(m.unit_price))},0);
};

/* Single source of truth for warehouse stock. Home/use are outflows, adjustment uses direction. */
window.warehouseStock29=function(itemId,excludeIds=new Set()){
 return C.moves.filter(m=>m.item_id===itemId&&!excludeIds.has(m.id)).reduce((s,m)=>{
   const q=n29(m.quantity);
   if(m.movement_type==='in')return s+q;
   if(m.movement_type==='adjustment')return s+(m.adjustment_direction==='in'?q:-q);
   if(['use','home'].includes(m.movement_type))return s-q;
   return s;
 },0);
};

window.warehouseIntegrity29=function(){
 const issues=[];
 const seen=new Map();
 C.moves.filter(m=>m.user_id===user.id).forEach(m=>{
   const note=String(m.notes||'');
   if(/^AUTO_(FEED|MED):/.test(note)){
     const key=note;seen.set(key,(seen.get(key)||0)+1);
     if(n29(m.quantity)<=0)issues.push({type:'bad_qty',message:`${note}: нульова або від'ємна кількість.`});
     if(n29(m.unit_price)<0||n29(m.total_amount)<0)issues.push({type:'bad_amount',message:`${note}: від'ємна ціна або сума.`});
   }
 });
 seen.forEach((count,key)=>{if(count>1)issues.push({type:'duplicate',message:`${key}: знайдено ${count} автоматичних списань замість одного.`})});
 C.daily.filter(x=>n29(x.feed_kg)>0).forEach(x=>{if(!x.feed_item_id)issues.push({type:'feed_link',message:`Денний запис ${x.record_date}: корм ${n29(x.feed_kg)} кг не прив'язаний до позиції складу.`})});
 C.treat.filter(x=>n29(x.used_qty)>0).forEach(x=>{if(!x.medicine_item_id)issues.push({type:'med_link',message:`Лікування ${x.treatment_date}: використано ${n29(x.used_qty)} ${x.unit||'од.'}, але препарат не прив'язаний до складу.`})});
 return issues;
};

/* Corrected compensating repair. Restores snapshots without inserting an undefined id. */
window.repairWarehouse24=async function(){
 const issues=[];let changed=0;
 const restore=async s=>{const {id,...p}=s;const r=await db.from('warehouse_movements').insert({user_id:user.id,item_id:p.item_id,movement_date:p.movement_date,movement_type:p.movement_type,quantity:n29(p.quantity),unit_price:n29(p.unit_price),total_amount:n29(p.total_amount),adjustment_direction:p.adjustment_direction||null,batch_id:p.batch_id||null,reference_id:p.reference_id||null,supplier:p.supplier||null,notes:p.notes||null});return !r.error};
 const repair=async(prefix,id,itemId,qty,date,unitPrice,batchId)=>{
   const old=C.moves.filter(m=>m.user_id===user.id&&String(m.notes||'')===`${prefix}:${id}`);
   if(!itemId||qty<=0){for(const m of old){const r=await db.from('warehouse_movements').delete().eq('id',m.id).eq('user_id',user.id);if(r.error)issues.push(r.error.message);else changed++;}return;}
   const oldIds=new Set(old.map(m=>m.id));
   const stock=window.warehouseStock29(itemId,oldIds);
   if(qty>stock+1e-9){issues.push(`${prefix}:${id}: недостатньо товару, доступно ${stock}, потрібно ${qty}`);return;}
   const valid=old.find(m=>m.item_id===itemId&&Math.abs(n29(m.quantity)-qty)<1e-9&&Math.abs(n29(m.unit_price)-n29(unitPrice))<1e-9);
   if(valid){for(const m of old){if(m.id!==valid.id){const r=await db.from('warehouse_movements').delete().eq('id',m.id).eq('user_id',user.id);if(r.error)issues.push(r.error.message);else changed++;}}return;}
   const snapshots=old.map(m=>({...m})),removed=[];
   for(const m of snapshots){const r=await db.from('warehouse_movements').delete().eq('id',m.id).eq('user_id',user.id);if(r.error){for(const gone of removed)await restore(gone);issues.push(r.error.message);return}removed.push(m);changed++;}
   const r=await db.from('warehouse_movements').insert({user_id:user.id,item_id:itemId,batch_id:batchId,movement_type:'use',movement_date:date,quantity:qty,unit_price:n29(unitPrice),total_amount:qty*n29(unitPrice),reference_id:id,notes:`${prefix}:${id}`});
   if(r.error){for(const s of snapshots)await restore(s);issues.push(r.error.message);return}changed++;
 };
 for(const d of C.daily)await repair('AUTO_FEED',d.id,d.feed_item_id,n29(d.feed_kg),d.record_date,n29(C.items.find(i=>i.id===d.feed_item_id)?.price_per_unit),d.batch_id);
 for(const t of C.treat)await repair('AUTO_MED',t.id,t.medicine_item_id,n29(t.used_qty),t.treatment_date,n29(t.price_per_unit),t.batch_id);
 await load();alert(`Перевірку складу завершено. Виправлено операцій: ${changed}.${issues.length?' Проблеми: '+issues.join('; '):' Помилок не знайдено.'}`);
};

/* Output mass for agro reports: live + sold + household + cull. Mortality is loss, not output. */
window.outputMassKg29=function(id){
 const b=batch(id);const live=n29(heads(b))*n29(latestWeight(id)?.average_weight_g)/1000;
 const removed=C.events.filter(e=>e.batch_id===id&&['sale','home','cull'].includes(e.event_type)).reduce((s,e)=>s+n29(e.weight_kg),0);
 return Math.max(0,live+removed);
};
window.productionCostPerOutputKg29=function(id){const mass=n29(window.outputMassKg29(id));return mass>0?n29(totalCost(id))/mass:0};
window.layerTotalOutflow29=function(id){const base=n29(totalCost(id)),home=C.moves.filter(m=>m.batch_id===id&&m.movement_type==='home'&&C.items.some(i=>i.id===m.item_id&&i.item_type==='feed')).reduce((s,m)=>s+(n29(m.total_amount)>0?n29(m.total_amount):n29(m.quantity)*n29(m.unit_price)),0);return base+home};
})();
