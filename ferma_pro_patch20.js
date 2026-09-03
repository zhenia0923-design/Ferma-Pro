(()=>{'use strict';
/* FERMA PRO: egg stock and layer accounting integrity */
const n20=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
window.eggAccounting20=function(id){
 const produced=n20(window.eggProduced(id)),sold=n20(window.eggSold(id));
 const sales=C.eggSales.filter(x=>x.batch_id===id);
 const salesAmount=sales.reduce((s,x)=>s+n20(x.total_amount),0);
 const calculated=sales.reduce((s,x)=>s+n20(x.quantity)*n20(x.price_per_egg),0);
 const feed=n20(window.feedKg(id)),feedCost=n20(window.feedCost(id));
 return {produced,sold,available:Math.max(0,produced-sold),salesAmount,calculatedSalesAmount,feedKg:feed,feedCost,feedPer100Eggs:produced>0?feed/produced*100:0,feedCostPerEgg:produced>0?feedCost/produced:0};
};
window.eggIntegrityAudit20=function(batchId=null){
 const issues=[];
 C.eggSales.filter(x=>!batchId||x.batch_id===batchId).forEach(x=>{
  const expected=n20(x.quantity)*n20(x.price_per_egg),actual=n20(x.total_amount);
  if(Math.abs(expected-actual)>0.005)issues.push({id:x.id,type:'sale_amount',message:'Сума продажу яєць не відповідає кількості × ціні.',expected,actual});
 });
 C.batches.filter(b=>b.kind==='layer'&&(!batchId||b.id===batchId)).forEach(b=>{
  const produced=n20(window.eggProduced(b.id)),sold=n20(window.eggSold(b.id));
  if(sold>produced)issues.push({id:b.id,type:'egg_stock',message:'Продано більше яєць, ніж оприбутковано.',produced,sold});
 });
 return issues;
};
const oldEggSaleForm20=window.eggSaleForm;
if(typeof oldEggSaleForm20==='function')window.eggSaleForm=function(bid,id){
 oldEggSaleForm20(bid,id);
 const form=$('form');if(!form)return;
 const qty=form.quantity,price=form.price_per_egg;
 const sync=()=>{if(qty&&price){const q=n20(qty.value),p=n20(price.value);let hint=form.querySelector('[data-egg-total20]');if(!hint){hint=document.createElement('div');hint.dataset.eggTotal20='1';hint.className='muted';price.parentElement.appendChild(hint)}hint.textContent=`Сума продажу: ${(q*p).toFixed(2)} грн`;}};
 qty?.addEventListener('input',sync);price?.addEventListener('input',sync);sync();
};
const oldLayers20=window.layers;
if(typeof oldLayers20==='function')window.layers=function(){oldLayers20();setTimeout(()=>{const issues=window.eggIntegrityAudit20();if(issues.length){const el=$('content');if(el)el.innerHTML+=`<div class="card section" style="border:1px solid #f59e0b"><h3>⚠️ Контроль яєць</h3><p>Знайдено ${issues.length} невідповідність(ей) в обліку яєць. Перевірте продажі та оприбуткування.</p></div>`}},0)};
})();
