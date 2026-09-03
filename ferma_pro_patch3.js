(()=>{'use strict';
/* FERMA PRO final stability patch */
const oldTreatForm=window.treatForm;
if(typeof oldTreatForm==='function'){
 window.treatForm=function(bid,id){
  oldTreatForm(bid,id);
  setTimeout(()=>{
   const f=document.querySelector('#form');
   if(!f)return;
   const med=f.querySelector('[name="medicine_id"]');
   const name=f.querySelector('[name="medicine_name"]');
   const price=f.querySelector('[name="price_per_10ml"]');
   if(med)med.onchange=()=>{
    const m=C.meds.find(x=>x.id===med.value);
    if(m&&name&&!name.value)name.value=m.name||'';
   };
   if(med&&name&&med.value&&!name.value){const m=C.meds.find(x=>x.id===med.value);if(m)name.value=m.name||'';}
   if(med&&price&&med.value){
    const m=C.meds.find(x=>x.id===med.value);
    const item=C.items.find(x=>x.item_type==='medicine'&&String(x.name).trim().toLowerCase()===String(m?.name||'').trim().toLowerCase());
    if(item&&N(item.price_per_unit)>0&&!N(price.value))price.value=(N(item.price_per_unit)*10).toFixed(2);
   }
  },0);
 };
}
/* Never allow arithmetic helpers to leak NaN/Infinity into UI */
const _N=window.N;
window.N=function(v){const n=Number(v);return Number.isFinite(n)?n:0};
/* Rebind feed cost with an explicit accumulator */
window.feedCost=function(id){return C.moves.filter(x=>x.batch_id===id&&x.movement_type==='use'&&C.items.find(i=>i.id===x.item_id)?.item_type==='feed').reduce((sum,x)=>{const total=Number(x.total_amount);const qty=Number(x.quantity);const price=Number(x.unit_price);return sum+(Number.isFinite(total)&&total>0?total:(Number.isFinite(qty)?qty:0)*(Number.isFinite(price)?price:0));},0)};
})();