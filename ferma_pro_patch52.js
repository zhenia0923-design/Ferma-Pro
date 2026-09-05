(()=>{'use strict';
/* FERMA PRO v52 FIX: ingredient price is loaded directly from warehouse_items.price_per_unit. */
const n52=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const money52=v=>n52(v).toLocaleString('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2})+' грн';
const item52=id=>(C.items||[]).find(x=>String(x.id)===String(id));
const price52=id=>n52(item52(id)?.price_per_unit);
window.recipeCost52=id=>{let kg=0,cost=0;(C.lines||[]).filter(x=>String(x.recipe_id)===String(id)).forEach(x=>{const q=n52(x.kg);kg+=q;cost+=q*price52(x.item_id)});return{kg,cost,totalKg:kg,costPerKg:kg?cost/kg:0}};
async function loadPrice52(id){try{const q=await db.from('warehouse_items').select('price_per_unit').eq('id',id).eq('user_id',user.id).maybeSingle();if(q.error)throw q.error;return n52(q.data?.price_per_unit)}catch(e){console.error('recipe warehouse price',e);return price52(id)}}
function setRowPrice52(tr,p){const el=tr.querySelector('.pr39');if(!el)return;el.value=p>0?String(p):'0';el.readOnly=true;el.disabled=false;el.title='Ціна автоматично зі складу';el.dataset.warehouse52='1';const cell=el.closest('td');if(cell&&!cell.querySelector('[data-wh52]')){const s=document.createElement('small');s.dataset.wh52='1';s.className='muted';s.textContent=' зі складу';cell.appendChild(s)}}
async function syncRow52(tr){const s=tr.querySelector('.ri39');if(!s)return;setRowPrice52(tr,await loadPrice52(s.value))}
function decorate52(){const f=document.getElementById('recipeForm39');if(!f||f.dataset.wh52==='1')return;f.dataset.wh52='1';const syncAll=async()=>{const rows=[...f.querySelectorAll('tr.recipe39')];await Promise.all(rows.map(syncRow52));let kg=0,cost=0;rows.forEach(tr=>{const q=n52(tr.querySelector('.kg39')?.value),p=n52(tr.querySelector('.pr39')?.value);kg+=q;cost+=q*p});const box=document.getElementById('recipeCost52Value');if(box)box.textContent=money52(kg?cost/kg:0)+'/кг'};f.addEventListener('change',e=>{if(e.target.classList.contains('ri39'))syncAll()});f.addEventListener('input',()=>{setTimeout(syncAll,0)});syncAll();}
const wrap52=window.recipeForm;if(typeof wrap52==='function'&&!wrap52.__wh52){const fn=async id=>{await wrap52(id);setTimeout(decorate52,30)};fn.__wh52=true;window.recipeForm=fn}window.setTimeout(decorate52,300);
new MutationObserver(()=>setTimeout(decorate52,10)).observe(document.body,{childList:true,subtree:true});
})();