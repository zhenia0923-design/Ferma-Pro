(()=>{'use strict';
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const oldItemForm=window.itemForm;
window.itemForm=function(id){
 const x=id?C.items.find(i=>i.id===id):null;
 openModal(`<h3>${id?'Редагувати':'Нова'} позиція складу</h3><form id="form" class="grid g2">
 <div class="field"><label>Тип</label><select name="item_type"><option value="feed">Корм</option><option value="medicine">Ліки</option><option value="bedding">Підстилка</option><option value="other">Інше</option></select></div>
 <div class="field"><label>Назва</label><input name="name" required value="${E(x?.name||'')}"></div>
 <div class="field"><label>Одиниця</label><input name="unit" value="${E(x?.unit||'кг')}"></div>
 <div class="field"><label>Розмір упаковки</label><input name="package_size" type="number" min="0" step="0.001" value="${n(x?.package_size)}"></div>
 <div class="field"><label>Ціна за одиницю, грн</label><input name="price_per_unit" type="number" min="0" step="0.0001" value="${n(x?.price_per_unit)}"></div>
 <div class="field"><label>Концентрація</label><input name="concentration" value="${E(x?.concentration||'')}"></div>
 <div class="field"><label>Постачальник</label><input name="supplier" value="${E(x?.supplier||'')}"></div>
 <div class="field"><label>Лот</label><input name="lot" value="${E(x?.lot||'')}"></div>
 <div class="field"><label>Термін придатності</label><input name="expiry_date" type="date" value="${E(x?.expiry_date||'')}"></div>
 <div class="field" style="grid-column:1/-1"><label>Примітка</label><textarea name="notes">${E(x?.notes||'')}</textarea></div>
 <button class="primary">Зберегти</button></form>`);
 $('form').item_type.value=x?.item_type||'feed';
 $('form').onsubmit=async e=>{e.preventDefault();const f=e.target;const p=Object.fromEntries(new FormData(f));
  p.name=String(p.name||'').trim();p.unit=String(p.unit||'кг').trim()||'кг';p.package_size=n(p.package_size);p.price_per_unit=n(p.price_per_unit);p.expiry_date=p.expiry_date||null;p.concentration=String(p.concentration||'').trim()||null;p.supplier=String(p.supplier||'').trim()||null;p.lot=String(p.lot||'').trim()||null;p.notes=String(p.notes||'').trim()||null;
  if(!p.name)return alert('Вкажіть назву позиції.');
  const r=id?await db.from('warehouse_items').update(p).eq('id',id).eq('user_id',user.id).select().single():await db.from('warehouse_items').insert({...p,user_id:user.id}).select().single();
  if(r.error)return alert('Помилка складу: '+r.error.message);
  await load();closeModal();
 };
};

const oldRecipeForm=window.recipeForm;
window.recipeForm=async function(id){
 const r=id?C.recipes.find(x=>x.id===id):null;
 const lines=r?C.lines.filter(x=>x.recipe_id===id):[];
 const feeds=C.items.filter(i=>i.item_type==='feed');
 if(!feeds.length)return alert('Спочатку додайте інгредієнти на склад.');
 const row=x=>`<tr class="recipe35"><td><select class="ri35" required>${feeds.map(i=>`<option value="${E(i.id)}" ${i.id===x?.item_id?'selected':''}>${E(i.name)}</option>`).join('')}</select></td><td><input class="kg35" type="number" min="0.001" step="0.001" value="${n(x?.kg)||''}" required></td><td><input class="pr35" type="number" min="0" step="0.0001" value="${n(x?.price_per_kg)||''}" required></td><td><input class="prot35" type="number" min="0" step="0.01" value="${n(x?.protein_pct)||''}"></td><td><button type="button" class="danger small" onclick="this.closest('tr').remove()">×</button></td></tr>`;
 openModal(`<h3>${r?'Редагувати':'Новий'} рецепт корму</h3><form id="form"><div class="grid g2"><div class="field"><label>Назва</label><input name="name" required value="${E(r?.name||'')}"></div><div class="field"><label>Фаза</label><input name="phase" value="${E(r?.phase||'')}"></div><div class="field" style="grid-column:1/-1"><label>Примітка</label><input name="notes" value="${E(r?.notes||'')}"></div></div><div class="row" style="margin:12px 0"><b>Інгредієнти</b><button type="button" class="secondary" id="addR35">＋ Інгредієнт</button></div><div style="overflow:auto"><table class="table"><thead><tr><th>Інгредієнт</th><th>кг</th><th>грн/кг</th><th>Білок %</th><th></th></tr></thead><tbody id="recipeLines35">${lines.map(row).join('')||row({})}</tbody></table></div><button class="primary" style="margin-top:12px">Зберегти рецепт</button></form>`);
 const tbody=$('recipeLines35');$('addR35').onclick=()=>tbody.insertAdjacentHTML('beforeend',row({}));
 $('form').onsubmit=async e=>{e.preventDefault();const f=e.target,p={name:String(f.name.value||'').trim(),phase:String(f.phase.value||'').trim()||null,notes:String(f.notes.value||'').trim()||null};if(!p.name)return alert('Вкажіть назву рецепта.');
  const rows=[...tbody.querySelectorAll('tr.recipe35')].map(tr=>{const s=tr.querySelector('.ri35'),o=s.options[s.selectedIndex];return {item_id:s.value,ingredient_name:o.textContent.trim(),kg:n(tr.querySelector('.kg35').value),price_per_kg:n(tr.querySelector('.pr35').value),protein_pct:n(tr.querySelector('.prot35').value)}}).filter(x=>x.item_id&&x.kg>0);
  if(!rows.length)return alert('Додайте хоча б один інгредієнт.');
  try{let recipeId=id;
   if(id){const u=await db.from('feed_recipes').update(p).eq('id',id).eq('user_id',user.id).select('id').single();if(u.error)throw u.error;recipeId=u.data.id;const d=await db.from('feed_recipe_lines').delete().eq('recipe_id',recipeId).eq('user_id',user.id);if(d.error)throw d.error;}
   else{const ins=await db.from('feed_recipes').insert({...p,user_id:user.id}).select('id').single();if(ins.error)throw ins.error;recipeId=ins.data.id;}
   const insL=await db.from('feed_recipe_lines').insert(rows.map(x=>({...x,recipe_id:recipeId,user_id:user.id})));if(insL.error)throw insL.error;
   await load();closeModal();alert('Рецепт збережено.');
  }catch(err){alert('Не вдалося зберегти рецепт: '+(err?.message||err));}
 };
};

const drink35=[{from:1,to:3,name:'Вода + глюкоза',dose:'50 г / 10 л',note:'Після посадки, за потреби.'},{from:4,to:50,name:'Звичайна вода',dose:'Чиста вода',note:'Постійний доступ.'}];
window.drinkingSchedule35=drink35;
const oldOpen=window.openBatch;
window.openBatch=function(id){oldOpen(id);setTimeout(()=>{
 const b=batch(id);if(!b||b.kind!=='broiler')return;const el=document.querySelector('#content');if(!el)return;
 const box=document.createElement('div');box.className='card section';box.dataset.drinkingSchedule35='1';box.innerHTML='<h3>💧 Схема випойки</h3><div style="overflow:auto"><table class="table"><thead><tr><th>Дні</th><th>Випойка</th><th>Дозування</th><th>Примітка</th></tr></thead><tbody>'+drink35.map(x=>`<tr><td>${x.from}–${x.to}</td><td><b>${x.name}</b></td><td>${x.dose}</td><td>${x.note}</td></tr>`).join('')+'</tbody></table></div>';
 const old=el.querySelector('[data-drinking-schedule35]');if(old)old.remove();el.appendChild(box);
},60)};
})();