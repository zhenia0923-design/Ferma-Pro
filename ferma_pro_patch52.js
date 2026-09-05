(()=>{'use strict';
/* FERMA PRO v52 FIX: recipe ingredient price is ALWAYS taken from warehouse_items. */
const n52=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const money52=v=>n52(v).toLocaleString('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2})+' грн';
const norm52=v=>String(v??'').trim().toLowerCase().replace(/\s+/g,' ');
const item52=id=>(C.items||[]).find(x=>String(x.id)===String(id));
const itemByName52=name=>(C.items||[]).find(x=>norm52(x.name)===norm52(name));
const price52=id=>n52(item52(id)?.price_per_unit);
window.recipeCost52=id=>{let kg=0,cost=0;(C.lines||[]).filter(x=>String(x.recipe_id)===String(id)).forEach(x=>{const q=n52(x.kg),p=price52(x.item_id)||n52(x.price_per_kg);kg+=q;cost+=q*p});return{kg,cost,totalKg:kg,costPerKg:kg?cost/kg:0}};
async function loadPrice52(id,name){
  const local=item52(id)||itemByName52(name);
  const lp=n52(local?.price_per_unit);
  if(lp>0)return lp;
  try{
    let q=await db.from('warehouse_items').select('id,name,price_per_unit').eq('id',id).maybeSingle();
    if(q.error)throw q.error;
    if(q.data)return n52(q.data.price_per_unit);
    if(name){q=await db.from('warehouse_items').select('id,name,price_per_unit').ilike('name',String(name).trim()).limit(1).maybeSingle();if(!q.error&&q.data)return n52(q.data.price_per_unit)}
  }catch(e){console.error('recipe warehouse price',e)}
  return 0;
}
function setRowPrice52(tr,p){const el=tr?.querySelector('.pr39');if(!el)return;el.value=p>0?String(p):'0';el.readOnly=true;el.disabled=false;el.title='Ціна автоматично зі складу';el.dataset.warehouse52='1';const cell=el.closest('td');if(cell&&!cell.querySelector('[data-wh52]')){const s=document.createElement('small');s.dataset.wh52='1';s.className='muted';s.textContent=' зі складу';cell.appendChild(s)}}
async function syncRow52(tr){const s=tr?.querySelector('.ri39');if(!s)return;const o=s.options[s.selectedIndex];const p=await loadPrice52(s.value,o?.textContent?.trim());setRowPrice52(tr,p)}
async function syncForm52(f){if(!f)return;const rows=[...f.querySelectorAll('tr.recipe39')];await Promise.all(rows.map(syncRow52))}
function decorate52(){const f=document.getElementById('recipeForm39');if(!f)return;f.querySelectorAll('tr.recipe39').forEach(tr=>{const s=tr.querySelector('.ri39');if(s&&!s.dataset.wh52){s.dataset.wh52='1';syncRow52(tr)}});if(!f.dataset.wh52){f.dataset.wh52='1';f.addEventListener('change',e=>{if(e.target.matches('.ri39'))syncRow52(e.target.closest('tr.recipe39'))});f.addEventListener('click',e=>{if(e.target.id==='addR39')setTimeout(()=>decorate52(),0)});f.addEventListener('input',()=>setTimeout(()=>syncForm52(f),0))}}
window.setTimeout(decorate52,100);
new MutationObserver(()=>setTimeout(decorate52,0)).observe(document.body,{childList:true,subtree:true});
})();