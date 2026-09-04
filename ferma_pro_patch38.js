(()=>{'use strict';
/* FERMA PRO v38: feed phases for laying hens only: 1-40 days and 140+ days */
const prevPhaseFor38=window.phaseFor;
window.phaseFor=function(b){
  if(!b)return null;
  if(b.kind==='layer'){
    const d=typeof age==='function'?age(b):1;
    const dbPhase=(typeof C!=='undefined'&&Array.isArray(C.phases))
      ? C.phases.filter(x=>x.kind==='layer').find(x=>d>=Number(x.from_day||0)&&d<=Number(x.to_day||999999))
      : null;
    if(dbPhase)return dbPhase;
    if(d>=1&&d<=40)return {kind:'layer',name:'Вирощування',from_day:1,to_day:40,recommended_weight_g:0,recommended_feed_g_head:0};
    if(d>=140)return {kind:'layer',name:'Кладка',from_day:140,to_day:9999,recommended_weight_g:0,recommended_feed_g_head:0};
    return null;
  }
  return typeof prevPhaseFor38==='function'?prevPhaseFor38(b):null;
};
function addLayerFeedPhase38(id){
  const b=typeof batch==='function'?batch(id):null;
  if(!b||b.kind!=='layer')return;
  const old=document.querySelector('[data-layer-feed-phase38]');if(old)old.remove();
  const p=window.phaseFor(b),d=typeof age==='function'?age(b):1;
  const box=document.createElement('div');box.className='card';box.dataset.layerFeedPhase38='1';
  let body='';
  if(p){
    body='<h3>🌾 Фаза корму для несучок</h3><div class="row"><span class="pill">'+E(p.name)+'</span><span class="pill">День '+d+'</span><span class="pill">'+p.from_day+'–'+(p.to_day>=9999?'140+':p.to_day)+' день</span></div>';
    body+='<p class="muted" style="margin-bottom:0">Для несучок використовуються тільки ці дві фази: <b>1–40 день</b> та <b>після 140 дня, період яйценосності</b>. Окремі фази 41–139 дня не створюються.</p>';
  }else{
    body='<h3>🌾 Фаза корму для несучок</h3><p class="muted">Вік '+d+' днів. У цьому проміжку окрема фаза корму не задана. Фази несучок: <b>1–40 день</b> та <b>після 140 дня</b>.</p>';
  }
  box.innerHTML=body;
  document.querySelector('#modalBody')?.appendChild(box);
}
const prevOpenBatch38=window.openBatch;
if(typeof prevOpenBatch38==='function')window.openBatch=function(id){prevOpenBatch38(id);setTimeout(()=>addLayerFeedPhase38(id),60)};
window.layerFeedPhase38=addLayerFeedPhase38;
})();
