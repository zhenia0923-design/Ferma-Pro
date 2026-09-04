(()=>{'use strict';
/* FERMA PRO v36: default phases for laying hens */
const layerPhases36=[
 {kind:'layer',name:'Вирощування несучок',from_day:1,to_day:140,sort_order:1,recommended_weight_g:0,recommended_feed_g_head:0,notes:'Період вирощування молодняку несучок від 1 до 140 дня.'},
 {kind:'layer',name:'Кладка',from_day:140,to_day:9999,sort_order:2,recommended_weight_g:0,recommended_feed_g_head:0,notes:'Період продуктивної кладки з 140 дня.'}
];
async function ensureLayerPhases36(){
 if(!window.user||!window.db||!window.C)return;
 try{
  const r=await db.from('feed_phases').select('id,kind,name,from_day,to_day,sort_order').eq('user_id',user.id).eq('kind','layer');
  if(r.error){console.error('FERMA layer phases',r.error);return;}
  const existing=r.data||[];
  const missing=layerPhases36.filter(p=>!existing.some(x=>x.name===p.name&&Number(x.from_day)===p.from_day&&Number(x.to_day)===p.to_day));
  if(!missing.length)return;
  const ins=await db.from('feed_phases').insert(missing.map(p=>({...p,user_id:user.id})));
  if(ins.error){console.error('FERMA layer phase insert',ins.error);return;}
  if(typeof load==='function')await load();
  if(window.current==='phases'&&typeof render==='function')render();
 }catch(e){console.error('FERMA layer phases',e)}
}
let tries36=0;
const timer36=setInterval(()=>{tries36++;if(window.user&&window.db){clearInterval(timer36);ensureLayerPhases36()}else if(tries36>120)clearInterval(timer36)},500);
window.layerPhases36=layerPhases36;
})();