(()=>{'use strict';
/* FERMA PRO v35: drinking + feed phase recommendations, isolated patch */
const n35=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const drink35=[
 {from:1,to:3,name:'Вода + глюкоза',dose:'50 г / 10 л',note:'Після посадки, за потреби.'},
 {from:4,to:50,name:'Звичайна вода',dose:'Чиста вода',note:'Постійний доступ.'}
];
window.recommendedDrinking35=function(batchId,day){const b=batch(batchId);if(!b||b.kind!=='broiler')return null;const d=Math.max(1,Math.floor(n35(day)||1));return drink35.find(x=>d>=x.from&&d<=x.to)||null};
window.recommendedFeedPhase35=function(batchId,day){const b=batch(batchId);if(!b)return null;const d=Math.max(1,Math.floor(n35(day)||1));const rows=C.phases.filter(x=>x.kind===b.kind).sort((a,b)=>n35(a.sort_order)-n35(b.sort_order));return rows.find(x=>d>=n35(x.from_day)&&d<=n35(x.to_day))||null};
window.renderRecommendations35=function(batchId){const b=batch(batchId);if(!b)return;const start=new Date(b.placed_at+'T00:00:00'),today=new Date();today.setHours(0,0,0,0);const day=Math.max(1,Math.floor((today-start)/86400000)+1),feed=window.recommendedFeedPhase35(batchId,day),drink=window.recommendedDrinking35(batchId,day);const old=document.querySelector('[data-recommendations35]');if(old)old.remove();const box=document.createElement('div');box.className='card';box.dataset.recommendations35='1';box.innerHTML='<h3>Рекомендації на сьогодні</h3>'+`<p><b>Вік партії:</b> ${day} день</p>`+`<p><b>Корм:</b> ${feed?String(feed.name):'Немає заданої фази'}${feed&&n35(feed.recommended_feed_g_head)>0?` • ${n35(feed.recommended_feed_g_head)} г/гол/день`:''}${feed&&n35(feed.recommended_weight_g)>0?` • цільова вага ${n35(feed.recommended_weight_g)} г`:''}</p>`+`<p><b>Випойка:</b> ${drink?String(drink.name):'Звичайна вода'} • ${drink?String(drink.dose):'Чиста вода'}${drink&&drink.note?` • ${String(drink.note)}`:''}</p>`;document.querySelector('#content')?.appendChild(box)};
const oldOpenBatch35=window.openBatch;if(typeof oldOpenBatch35==='function')window.openBatch=function(id){oldOpenBatch35(id);setTimeout(()=>window.renderRecommendations35(id),30)};
})();