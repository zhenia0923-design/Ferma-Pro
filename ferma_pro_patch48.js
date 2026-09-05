(()=>{'use strict';
/* FERMA PRO v48: layer feed recommendations must use layer recipes only.
   Broiler STARTER/GROWER/FINISHER recipes are never valid recommendations for layer batches.
*/
const n48=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const esc48=v=>typeof E==='function'?E(v):String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const isLayerRecipe48=r=>{const p=String(r?.phase||'').trim().toLowerCase();return p==='вирощування'||p==='кладка'||/несучк|кладк|вирощування/.test(p)&&!/бройлер/.test(p)};
const isBroilerRecipe48=r=>/бройлер|starter|grower|finisher|finish/i.test(String(r?.phase||r?.name||''));
function layerRecipes48(){return (C.recipes||[]).filter(isLayerRecipe48).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'uk'))}
window.layerRecipes48=layerRecipes48;
function removeBroilerRecommendationNodes48(root){
 if(!root)return;
 const bad=/бройлер|starter|grower|finisher|фінішний|фінішер/i;
 root.querySelectorAll('option').forEach(o=>{if(bad.test(o.textContent||''))o.remove()});
 root.querySelectorAll('[data-recommendation],.recommendation,.recommended-feed').forEach(el=>{if(bad.test(el.textContent||''))el.remove()});
 [...root.querySelectorAll('.card,.section,div,td,li')].forEach(el=>{
   if(el.children.length>8)return;
   const t=(el.innerText||'').trim();
   if(!t||!bad.test(t))return;
   if(/рекомендован|рекомендац|корм/i.test(t)&&!/несуч|вирощування|кладка/i.test(t))el.style.display='none';
 });
}
function layerRecommendation48(id){
 const b=batch(id);if(!b||b.kind!=='layer')return;
 const old=document.querySelector('[data-layerrecommend48]');if(old)old.remove();
 const rs=layerRecipes48();
 const d=Math.max(1,typeof age==='function'?age(b):1),phase=d<140?'Вирощування':'Кладка';
 const exact=rs.filter(r=>String(r.phase||'').trim().toLowerCase()===phase.toLowerCase());
 const box=document.createElement('div');box.className='card section';box.dataset.layerrecommend48='1';
 box.innerHTML=`<h3>🌾 Рекомендований корм для несучок</h3><p class="muted">Партія: <b>${esc48(b.name)}</b> · вік: <b>${d} день</b> · фаза: <b>${phase}</b></p><div class="card"><b>${exact.length?'Доступні рецепти цієї фази:':'Рецепт для цієї фази ще не створений.'}</b>${exact.length?`<ul style="margin-bottom:0">${exact.map(r=>`<li><b>${esc48(r.name)}</b></li>`).join('')}</ul>`:`<p class="muted" style="margin-bottom:0">У рецептах будуть використані тільки записи з фазою «${phase}». Корм Бройлери STARTER/GROWER/FINISHER сюди не підтягується.</p>`}</div>`;
 const body=document.querySelector('#tabBody');const content=document.querySelector('#content');if(body?.parentElement)body.parentElement.insertBefore(box,body);else content?.appendChild(box);
}
const oldOpen48=window.openBatch;
if(typeof oldOpen48==='function')window.openBatch=function(id){const r=oldOpen48(id);setTimeout(()=>{const b=batch(id);if(b?.kind==='layer'){removeBroilerRecommendationNodes48(document.querySelector('#content'));layerRecommendation48(id)}},180);return r};
const oldRender48=window.render;
if(typeof oldRender48==='function')window.render=function(){oldRender48();setTimeout(()=>{if(current==='layers')removeBroilerRecommendationNodes48(document.querySelector('#content'))},60)};
const mo48=new MutationObserver(()=>{const root=document.querySelector('#content');if(!root)return;const id=document.querySelector('[data-layerrecommend48]')?.dataset.batchId;const active=(window.currentLayerBatch48&&batch(window.currentLayerBatch48));if(active?.kind==='layer')removeBroilerRecommendationNodes48(root)});
if(document.body)mo48.observe(document.body,{childList:true,subtree:true});
})();