(()=>{'use strict';
/* FERMA PRO: warehouse ledger, safe editing/deleting, stock integrity */
const n12=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const balance12=(itemId,excludeId=null)=>C.moves.filter(m=>m.item_id===itemId&&m.id!==excludeId).reduce((s,m)=>{const q=n12(m.quantity);if(m.movement_type==='in')return s+q;if(m.movement_type==='adjustment')return s+(m.adjustment_direction==='in'?q:-q);return s-q},0);
const auto12=(prefix,id)=>C.moves.find(m=>m.user_id===user.id&&String(m.notes||'')===`${prefix}:${id}`);
window.warehouseBalance=function(i){return balance12(i?.id)};
window.del=async function(t,id){
 if(!confirm('Видалити запис?'))return;
 if(t==='daily_records'){
  const r=await db.from('warehouse_movements').delete().eq('reference_id',id).eq('user_id',user.id).like('notes','AUTO_FEED:%');
  if(r.error)return alert('Не вдалося видалити автоматичне списання корму: '+r.error.message);
 }
 if(t==='treatments'){
  const r=await db.from('warehouse_movements').delete().eq('reference_id',id).eq('user_id',user.id).like('notes','AUTO_MED:%');
  if(r.error)return alert('Не вдалося видалити автоматичне списання препарату: '+r.error.message);
 }
 if(t==='warehouse_items'){
  const linked=C.moves.filter(m=>m.item_id===id);
  if(linked.length)return alert('Позицію не можна видалити, поки по ній є рухи складу. Видаліть/виправте рухи або залиште позицію в довіднику.');
 }
 const r=await db.from(t).delete().eq('id',id).eq('user_id',user.id);
 if(r.error)alert(r.error.message);else await load();
};
window.moveForm=function(id){
 const x=id?C.moves.find(m=>m.id===id):null;
 openModal(`<h3>${x?'Редагувати':'Додати'} рух складу</h3><form id="form" class="grid g2"><div class="field"><label>Позиція</label><select name="item_id" required>${C.items.map(i=>`<option value="${i.id}" ${x?.item_id===i.id?'selected':''}>${E(i.name)} (${E(i.unit||'од.')})</option>`).join('')}</select></div><div class="field"><label>Тип руху</label><select name="movement_type"><option value="in">Надходження</option><option value="use">Використання</option><option value="sale">Продаж</option><option value="home">Додому</option><option value="adjustment">Коригування</option></select></div><div class="field"><label>Дата</label><input name="movement_date" type="date" value="${x?.movement_date||D()}" required></div><div class="field"><label>Кількість</label><input name="quantity" type="number" min=".001" step=".001" required value="${n12(x?.quantity)||''}"></div><div class="field"><label>Ціна за од.</label><input name="unit_price" type="number" min="0" step=".0001" value="${n12(x?.unit_price)}"></div><div class="field"><label>Напрямок коригування</label><select name="adjustment_direction"><option value="in">Збільшити</option><option value="out">Зменшити</option></select></div><div class="field"><label>Партія</label><select name="batch_id"><option value="">Без партії</option>${C.batches.map(b=>`<option value="${b.id}" ${x?.batch_id===b.id?'selected':''}>${E(b.name)}</option>`).join('')}</select></div><div class="field"><label>Постачальник</label><input name="supplier" value="${E(x?.supplier||'')}"></div><div class="field" style="grid-column:1/-1"><label>Примітка</label><input name="notes" value="${E(x?.notes||'')}"></div><button class="primary">Зберегти</button></form>`);
 $('form').movement_type.value=x?.movement_type||'in';$('form').adjustment_direction.value=x?.adjustment_direction||'in';
 $('form').onsubmit=async e=>{e.preventDefault();const f=e.target,p=Object.fromEntries(new FormData(f));p.quantity=Math.max(0,n12(p.quantity));p.unit_price=Math.max(0,n12(p.unit_price));p.total_amount=p.quantity*p.unit_price;p.batch_id=p.batch_id||null;p.adjustment_direction=p.movement_type==='adjustment'?(p.adjustment_direction||'in'):null;
  if(p.quantity<=0)return alert('Кількість повинна бути більшою за 0.');
  if(['use','sale','home'].includes(p.movement_type)){const bal=balance12(p.item_id,id);if(p.quantity>bal+1e-9)return alert(`Недостатньо товару на складі. Доступно: ${bal.toFixed(3)}`)}
  const item=C.items.find(i=>i.id===p.item_id);if(!item)return alert('Позицію складу не знайдено.');
  if(p.movement_type==='use'&&String(p.notes||'').startsWith('AUTO_'))return alert('Автоматичне списання створюється відповідною формою, вручну його дублювати не потрібно.');
  const ok=await save('warehouse_movements',p,id);if(ok){closeModal();nav('warehouse')}
 };
};
window.itemForm=function(id){
 const x=id?C.items.find(i=>i.id===id):null;
 openModal(`<h3>${x?'Редагувати':'Нова'} складова позиція</h3><form id="form" class="grid g2"><div class="field"><label>Тип</label><select name="item_type"><option value="feed">Корм</option><option value="medicine">Ліки</option><option value="bedding">Підстилка</option><option value="other">Інше</option></select></div><div class="field"><label>Назва</label><input name="name" required value="${E(x?.name||'')}"></div><div class="field"><label>Одиниця</label><select name="unit"><option value="кг">кг</option><option value="л">л</option><option value="мл">мл</option><option value="шт">шт</option><option value="уп">уп.</option></select></div><div class="field"><label>Ціна за одиницю</label><input name="price_per_unit" type="number" min="0" step=".0001" value="${n12(x?.price_per_unit)}"></div><div class="field"><label>Розмір упаковки</label><input name="package_size" value="${E(x?.package_size||'')}"></div><div class="field"><label>Постачальник</label><input name="supplier" value="${E(x?.supplier||'')}"></div><div class="field"><label>Лот</label><input name="lot" value="${E(x?.lot||'')}"></div><div class="field"><label>Примітка</label><input name="notes" value="${E(x?.notes||'')}"></div><button class="primary">Зберегти</button></form>`);$('form').item_type.value=x?.item_type||'feed';$('form').unit.value=x?.unit||'кг';$('form').onsubmit=async e=>{e.preventDefault();const p=Object.fromEntries(new FormData(e.target));p.price_per_unit=Math.max(0,n12(p.price_per_unit));if(!p.name.trim())return alert('Вкажіть назву.');if(await save('warehouse_items',p,id))closeModal()};
};
})();