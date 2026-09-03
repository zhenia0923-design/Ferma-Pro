(()=>{'use strict';
/* FERMA PRO egg sales accounting hardening */
const n5=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
window.eggSaleForm=function(bid,id){
 const x=id?C.eggSales.find(e=>e.id===id):null;
 openModal(`<h3>Продаж яєць</h3><form id="form" class="grid g2"><div class="field"><label>Дата</label><input name="sale_date" type="date" value="${x?.sale_date||D()}" required></div><div class="field"><label>Кількість</label><input name="quantity" type="number" min="1" value="${n5(x?.quantity)||''}" required></div><div class="field"><label>Ціна за яйце, грн</label><input name="price_per_egg" type="number" min="0" step=".01" value="${n5(x?.price_per_egg)||''}" required></div><div class="field"><label>Клієнт</label><input name="client" value="${E(x?.client||'')}"></div><div class="field" style="grid-column:1/-1"><label>Примітка</label><input name="notes" value="${E(x?.notes||'')}"></div><button class="primary">Зберегти</button></form>`);
 $('form').onsubmit=async e=>{e.preventDefault();const p=Object.fromEntries(new FormData(e.target));p.batch_id=bid;p.quantity=n5(p.quantity);p.price_per_egg=n5(p.price_per_egg);p.total_amount=p.quantity*p.price_per_egg;const avail=eggAvailable(bid)+(x?n5(x.quantity):0);if(p.quantity>avail)return alert('Недостатньо яєць на складі.');if(await save('egg_sales',p,id)){closeModal();openBatch(bid)}};
};
})();
