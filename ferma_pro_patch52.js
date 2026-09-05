(()=>{'use strict';
/* FERMA PRO v52: recipe ingredient prices are taken automatically from warehouse.
   warehouse_items.price_per_unit is the source price for feed ingredients.
   The recipe cost is calculated from current warehouse prices and ingredient kg.
*/
const n52=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const money52=v=>n52(v).toLocaleString('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2})+' грн';
const itemPrice52=item=>n52(item?.price_per_unit);
function recipeLines52(recipeId){return (C.lines||[]).filter(x=>String(x.recipe_id)===String(recipeId))}
function recipeCost52(recipeId){const lines=recipeLines52(recipeId);let kg=0,cost=0;for(const l of lines){const q=n52(l.kg);const item=(C.items||[]).find(i=>String(i.id)===String(l.item_id));const p=itemPrice52(item);kg+=q;cost+=q*p}return {kg,cost,totalKg:kg,costPerKg:kg>0?cost/kg:0}}
window.recipeCost52=recipeCost52;
function syncPrices52(form){if(!form)return;form.querySelectorAll('tr.recipe39').forEach(tr=>{const s=tr.querySelector('.ri39'),p=tr.querySelector('.pr39');if(!s||!p)return;const item=(C.items||[]).find(i=>String(i.id)===String(s.value));const price=itemPrice52(item);p.value=price?price:'';p.readOnly=true;p.title='Ціна автоматично зі складу';p.dataset.autoWarehousePrice52='1'})}
function calcForm52(form){let kg=0,cost=0;form?.querySelectorAll('tr.recipe39').forEach(tr=>{const q=n52(tr.querySelector('.kg39')?.value),p=n52(tr.querySelector('.pr39')?.value);kg+=q;cost+=q*p});return {kg,cost,costPerKg:kg?cost/kg:0}}
function decorateRecipeForm52(){const f=document.getElementById('recipeForm39');if(!f)return;let box=document.getElementById('recipeCost52Box');if(!box){box=document.createElement('div');box.id='recipeCost52Box';box.className='card';box.style.margin='12px 0';box.innerHTML='<b>💰 Автоматична собівартість</b><div id="recipeCost52Value" class="stat">0,00 грн/кг</div><div class="muted">Ціна кожного інгредієнта автоматично береться зі складу. Собівартість рецепта перераховується при зміні інгредієнта або кількості.</div>';f.querySelector('.row:last-child')?.before(box)}
 const calc=()=>{syncPrices52(f);const x=calcForm52(f);const out=document.getElementById('recipeCost52Value');if(out)out.textContent=money52(x.costPerKg)+'/кг';return x};
 if(f.dataset.priceSync52!=='1'){f.dataset.priceSync52='1';f.addEventListener('input',calc);f.addEventListener('change',calc)}
 calc();
}
function decorateRecipeList52(){const c=document.querySelector('#content');if(!c||current!=='recipes')return;const tables=[...c.querySelectorAll('table')];for(const table of tables){for(const tr of table.querySelectorAll('tbody tr')){if(tr.dataset.cost52)continue;const buttons=[...tr.querySelectorAll('button')];const edit=buttons.find(b=>/редаг|відкр|edit/i.test(b.textContent||''));if(!edit)continue;const m=(edit.getAttribute('onclick')||'').match(/recipeForm\(['"]([^'"]+)['"]\)/);if(!m)continue;const id=m[1],r=recipeCost52(id),cell=document.createElement('td');cell.innerHTML='<b>Собівартість</b><br><span data-recipe-cost52 data-recipe-id="'+id+'">'+(r.kg>0?money52(r.costPerKg):'0,00 грн/кг')+'</span>';tr.appendChild(cell);tr.dataset.cost52='1';const head=table.querySelector('thead tr');if(head&&!head.querySelector('[data-cost-head52]')){const th=document.createElement('th');th.dataset.costHead52='1';th.textContent='Собівартість';head.appendChild(th)}}}}
const oldRecipe52=window.recipeForm;if(typeof oldRecipe52==='function'&&oldRecipe52!==window.recipeForm52Wrapped){const wrapped=async function(id){await oldRecipe52(id);setTimeout(decorateRecipeForm52,20)};window.recipeForm=wrapped;window.recipeForm52Wrapped=wrapped}
const mo52=new MutationObserver(()=>{decorateRecipeForm52();decorateRecipeList52()});if(document.body)mo52.observe(document.body,{childList:true,subtree:true});setTimeout(()=>{decorateRecipeForm52();decorateRecipeList52()},500);
})();