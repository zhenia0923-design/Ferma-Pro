(()=>{'use strict';
/* FERMA PRO: cost accounting correction + transactional warehouse repair */
const n26=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
/* Daily medicine_cost is a manual daily expense. Treatment records are separate detailed treatment costs. Both are counted, so legitimate expenses are not silently lost. */
window.dailyNonMedicineCost17=function(id){return C.daily.filter(x=>x.batch_id===id).reduce((s,x)=>s+n26(x.water_cost)+n26(x.medicine_cost)+n26(x.bedding_cost)+n26(x.electricity_cost)+n26(x.labor_cost)+n26(x.other_cost),0)};
window.totalCost17=function(id){const b=batch(id);const chicks=n26(b?.initial_heads)*n26(b?.chick_price);const feed=n26(feedCost(id));const daily=n26(window.dailyNonMedicineCost17(id));const treatment=n26(window.treatmentCost17(id));const manual=n26(explicitExpense(id));return chicks+feed+daily+treatment+manual};
window.totalCost=window.totalCost17;
window.financeSummary17=function(id){return {income:n26(income(id)),cost:n26(window.totalCost17(id)),result:n26(income(id))-n26(window.totalCost17(id)),feed:n26(feedCost(id)),daily:n26(window.dailyNonMedicineCost17(id)),dailyMedicine:n26(dailyMedicineCost17(id)),treatment:n26(window.treatmentCost17(id)),chicks:n26(batch(id)?.initial_heads)*n26(batch(id)?.chick_price),manualExpense:n26(explicitExpense(id))}};
window.costAudit26=function(id){const dailyMed=n26(dailyMedicineCost17(id)),treat=n26(treatmentCost17(id));return dailyMed>0&&treat>0?['У денному обліку є витрати на ліки і окремо є записи лікування. Обидві суми враховані, перевірте, щоб одна покупка не була внесена двічі.']:[]};
/* Safer repair: snapshot all affected movements and restore all of them if replacement fails. */
window.repairWarehouse24=async function(){
 const issues=[];let changed=0;
 const repair=async(prefix,id,itemId,qty,date,unitPrice,batchId)=>{
  const moves=C.moves.filter(m=>m.user_id===user.id&&String(m.notes||'')===`${prefix}:${id}`);
  if(!itemId||qty<=0){for(const m of moves){const r=await db.from('warehouse_movements').delete().eq('id',m.id).eq('user_id',user.id);if(r.error)issues.push(r.error.message);else changed++;}return;}
  const valid=moves.find(m=>m.item_id===itemId&&Math.abs(n26(m.quantity)-qty)<.0001);
  if(valid){for(const m of moves){if(m.id!==valid.id){const r=await db.from('warehouse_movements').delete().eq('id',m.id).eq('user_id',user.id);if(r.error)issues.push(r.error.message);else changed++;}}return;}
  const snapshots=moves.map(m=>({...m}));
  for(const m of snapshots){const r=await db.from('warehouse_movements').delete().eq('id',m.id).eq('user_id',user.id);if(r.error){for(const s of snapshots)await db.from('warehouse_movements').insert({...s,id:undefined});issues.push(r.error.message);return}changed++;}
  const r=await db.from('warehouse_movements').insert({user_id:user.id,item_id:itemId,batch_id:batchId,movement_type:'use',movement_date:date,quantity:qty,unit_price:n26(unitPrice),total_amount:qty*n26(unitPrice),reference_id:id,notes:`${prefix}:${id}`});
  if(r.error){for(const s of snapshots){const {id:oldId,...restore}=s;await db.from('warehouse_movements').insert(restore)}issues.push(r.error.message);return}changed++;
 };
 for(const d of C.daily)await repair('AUTO_FEED',d.id,d.feed_item_id,n26(d.feed_kg),d.record_date,n26(C.items.find(i=>i.id===d.feed_item_id)?.price_per_unit),d.batch_id);
 for(const t of C.treat)await repair('AUTO_MED',t.id,t.medicine_item_id,n26(t.used_qty),t.treatment_date,n26(t.price_per_unit),t.batch_id);
 await load();alert(`Перевірку складу завершено. Виправлено операцій: ${changed}.${issues.length?' Помилки: '+issues.join('; '):''}`);
};
})();