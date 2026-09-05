(()=>{'use strict';
/* FERMA PRO v62: real shop <-> warehouse <-> orders <-> finance integration. */
const e62=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n62=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
const m62=v=>n62(v).toLocaleString('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2})+' грн';
const status62=s=>({new:'Нове',confirmed:'Підтверджено',processing:'В обробці',ready:'Готово',completed:'Виконано',cancelled:'Скасовано'}[s]||s);

window.shopAdmin61=async function(){
 const [pr,or,wi]=await Promise.all([
  db.from('shop_products').select('*').order('sort_order').order('name'),
  db.from('shop_orders').select('*').order('created_at',{ascending:false}),
  db.from('warehouse_balances').select('id,name,unit,balance_qty').order('name')
 ]);
 if(pr.error)return alert(pr.error.message); if(or.error)return alert(or.error.message); if(wi.error)return alert(wi.error.message);
 const products=pr.data||[],orders=or.data||[],stock=wi.data||[];
 document.querySelectorAll('.nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==='shop'));
 $('title').textContent='Магазин';
 $('content').innerHTML=`<div class="row"><button class="primary" onclick="shopProductForm62()">＋ Додати товар</button><button class="secondary" onclick="shopAdmin61()">↻ Оновити</button><span class="pill">Товарів: ${products.length}</span><span class="pill">Замовлень: ${orders.filter(x=>!['completed','cancelled'].includes(x.status)).length}</span></div>
 <div class="section card"><h3>🛒 Товари магазину</h3><p class="muted">Кожен товар магазину має бути прив’язаний до реальної позиції основного складу. Залишок береться зі складу автоматично.</p><table class="table"><thead><tr><th>Товар</th><th>Складська позиція</th><th>Ціна</th><th>Залишок</th><th>Статус</th><th></th></tr></thead><tbody>${products.map(p=>{const w=stock.find(x=>x.id===p.warehouse_item_id);return `<tr><td><b>${e62(p.name)}</b><br><span class="muted">${e62(p.category||'')} · ${e62(p.unit)}</span></td><td>${w?e62(w.name):'<span style="color:#b91c1c">Не прив’язано</span>'}</td><td>${m62(p.price)}</td><td>${w?n62(w.balance_qty):0} ${e62(w?.unit||p.unit)}</td><td>${p.is_active?'Активний':'Прихований'}</td><td class="actions"><button class="secondary small" onclick="shopProductForm62('${p.id}')">Редагувати</button> <button class="danger small" onclick="shopToggle62('${p.id}',${!p.is_active})">${p.is_active?'Приховати':'Показати'}</button></td></tr>`}).join('')||'<tr><td colspan="6" class="muted">Додайте перший товар.</td></tr>'}</tbody></table></div>
 <div class="section card"><h3>📦 Замовлення клієнтів</h3><table class="table"><thead><tr><th>Дата</th><th>Клієнт</th><th>Сума</th><th>Статус</th><th></th></tr></thead><tbody>${orders.map(o=>`<tr><td>${new Date(o.created_at).toLocaleString('uk-UA')}</td><td><b>${e62(o.customer_name)}</b><br>${e62(o.phone)}<br><span class="muted">${e62(o.delivery_address||'')}</span></td><td><b>${m62(o.total_amount)}</b></td><td><select onchange="shopStatus62('${o.id}',this.value,'${o.status}')">${['new','confirmed','processing','ready','completed','cancelled'].map(s=>`<option value="${s}" ${s===o.status?'selected':''}>${status62(s)}</option>`).join('')}</select></td><td><button class="secondary small" onclick="shopOrder62('${o.id}')">Деталі</button></td></tr>`).join('')||'<tr><td colspan="5" class="muted">Замовлень немає.</td></tr>'}</tbody></table></div>`;
};

window.shopProductForm62=async id=>{
 let p=null;if(id){const r=await db.from('shop_products').select('*').eq('id',id).single();if(r.error)return alert(r.error.message);p=r.data}
 const w=await db.from('warehouse_balances').select('id,name,unit,balance_qty').order('name');if(w.error)return alert(w.error.message);
 const items=w.data||[];
 openModal(`<h3>${id?'Редагувати товар':'Новий товар магазину'}</h3><form id="spf62" class="grid g2"><div class="field"><label>Назва товару</label><input name="name" required value="${e62(p?.name||'')}"></div><div class="field"><label>Категорія</label><input name="category" value="${e62(p?.category||'')}"></div><div class="field"><label>Ціна продажу, грн</label><input name="price" type="number" min="0" step="0.01" value="${n62(p?.price)}"></div><div class="field"><label>Одиниця продажу</label><input name="unit" value="${e62(p?.unit||'кг')}"></div><div class="field" style="grid-column:1/-1"><label>Складська позиція</label><select name="warehouse_item_id" required><option value="">Оберіть позицію складу</option>${items.map(x=>`<option value="${x.id}" ${x.id===p?.warehouse_item_id?'selected':''}>${e62(x.name)} · ${n62(x.balance_qty)} ${e62(x.unit)}</option>`).join('')}</select><div class="muted" style="margin-top:5px">Залишок магазину не вводиться вручну. Він синхронізується з рухами основного складу.</div></div><div class="field"><label>Порядок</label><input name="sort_order" type="number" step="1" value="${n62(p?.sort_order)}"></div><div class="field"><label>Фото URL</label><input name="image_url" value="${e62(p?.image_url||'')}"></div><div class="field" style="grid-column:1/-1"><label>Опис</label><textarea name="description">${e62(p?.description||'')}</textarea></div><div><button class="primary">Зберегти</button> <button type="button" class="secondary" onclick="closeModal()">Скасувати</button></div></form>`);
 $('spf62').onsubmit=async ev=>{ev.preventDefault();const f=ev.target,payload={name:f.name.value.trim(),category:f.category.value.trim(),price:n62(f.price.value),unit:f.unit.value.trim()||'кг',warehouse_item_id:f.warehouse_item_id.value,sort_order:Math.round(n62(f.sort_order.value)),image_url:f.image_url.value.trim(),description:f.description.value.trim(),updated_at:new Date().toISOString()};const r=id?await db.from('shop_products').update(payload).eq('id',id):await db.from('shop_products').insert(payload);if(r.error)return alert(r.error.message);closeModal();shopAdmin61()};
};
window.shopToggle62=async(id,active)=>{const r=await db.from('shop_products').update({is_active:active,updated_at:new Date().toISOString()}).eq('id',id);if(r.error)alert(r.error.message);else shopAdmin61()};
window.shopStatus62=async(id,status,old)=>{
 if(status===old)return;
 if(status==='confirmed'){const r=await db.rpc('confirm_shop_order',{p_order_id:id});if(r.error){alert(r.error.message);shopAdmin61();return}alert('Замовлення підтверджено. Товар списано зі складу, створено продаж і дохід у фінансах.');return shopAdmin61()}
 if(status==='cancelled' && old==='confirmed'){if(!confirm('Скасувати підтверджене замовлення? Товар буде повернуто на склад, а продаж скасовано.')){shopAdmin61();return}const r=await db.rpc('cancel_shop_order',{p_order_id:id});if(r.error){alert(r.error.message);shopAdmin61();return}alert('Замовлення скасовано. Товар повернуто на склад, фінанси скориговано.');return shopAdmin61()}
 if(status==='cancelled'){const r=await db.from('shop_orders').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(r.error)alert(r.error.message);return shopAdmin61()}
 if(old==='confirmed' && status!=='cancelled'){alert('Підтверджене замовлення вже вплинуло на склад та фінанси. Для повернення використовуйте статус «Скасовано».');return shopAdmin61()}
 const r=await db.from('shop_orders').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(r.error)alert(r.error.message);shopAdmin61();
};
window.shopOrder62=async id=>{const [o,i]=await Promise.all([db.from('shop_orders').select('*').eq('id',id).single(),db.from('shop_order_items').select('*').eq('order_id',id)]);if(o.error)return alert(o.error.message);const x=o.data;openModal(`<h3>Замовлення #${e62(id.slice(0,8))}</h3><p><b>${e62(x.customer_name)}</b><br>${e62(x.phone)}<br>${e62(x.delivery_address||'')}</p>${(i.data||[]).map(a=>`<div class="card" style="margin:7px 0"><div class="row"><b>${e62(a.product_name)}</b><span class="right">${m62(a.line_total)}</span></div><span class="muted">${n62(a.quantity)} ${e62(a.unit)} × ${m62(a.unit_price)}</span></div>`).join('')}<h3>Разом: ${m62(x.total_amount)}</h3>${x.comment?`<p class="muted">${e62(x.comment)}</p>`:''}<button class="secondary" onclick="closeModal()">Закрити</button>`)};

if($('content')&&document.querySelector('.nav')){const b=document.querySelector('.nav button[data-page="shop"]');if(b)b.onclick=()=>shopAdmin61();}
})();
