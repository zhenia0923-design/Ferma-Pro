(()=>{'use strict';
/* FERMA PRO v42: one canonical layer phase model everywhere.
   Canonical names: Вирощування (1-140), Кладка (140+).
*/
const LAYER_PHASES42=[
 {kind:'layer',name:'Вирощування',from_day:1,to_day:140,sort_order:1,recommended_weight_g:0,recommended_feed_g_head:0,notes:'Вирощування несучок від 1 до 140 дня.'},
 {kind:'layer',name:'Кладка',from_day:140,to_day:9999,sort_order:2,recommended_weight_g:0,recommended_feed_g_head:0,notes:'Кладка з 140 дня.'}
];
window.layerPhases42=LAYER_PHASES42;
window.layerPhase42=function(b){if(!b||b.kind!=='layer')return null;const d=typeof age==='function'?age(b):1;return d<140?LAYER_PHASES42[0]:LAYER_PHASES42[1]};
window.phaseFor=function(b){if(!b)return null;if(b.kind==='layer')return window.layerPhase42(b);const d=typeof age==='function'?age(b):1;return Array.isArray(C?.phases)?C.phases.filter(x=>x.kind===b.kind).find(x=>d>=Number(x.from_day||0)&&d<=Number(x.to_day||999999))||null:null};
async function normalizeLayer42(){
 if(!window.user||!window.db)return;
 try{
  const old=['Вирощування несучок','Вирощування 1–140 день','Вирощування 1-140 день'];
  for(const name of old){const r=await db.from('feed_recipes').update({phase:'Вирощування'}).eq('user_id',user.id).eq('phase',name);if(r.error)console.error('FERMA v42 recipe normalize',r.error)}
  const r2=await db.from('feed_recipes').select('id,phase').eq('user_id',user.id);
  if(r2.error)return console.error('FERMA v42 recipe read',r2.error);
  for(const r of (r2.data||[])){
   if(r.phase&&/кладка\s*140\+?/i.test(String(r.phase))){const u=await db.from('feed_recipes').update({phase:'Кладка'}).eq('id',r.id).eq('user_id',user.id);if(u.error)console.error('FERMA v42 laying recipe normalize',u.error)}
  }
  const p=await db.from('feed_phases').select('id,name,from_day,to_day,sort_order').eq('user_id',user.id).eq('kind','layer');
  if(p.error)return console.error('FERMA v42 phase read',p.error);
  for(const x of (p.data||[])){
   const ok=(x.name==='Вирощування'&&Number(x.from_day)===1&&Number(x.to_day)===140)||(x.name==='Кладка'&&Number(x.from_day)===140&&Number(x.to_day)>=140);
   if(!ok)await db.from('feed_phases').delete().eq('id',x.id).eq('user_id',user.id);
  }
  const p2=await db.from('feed_phases').select('id,name,from_day,to_day').eq('user_id',user.id).eq('kind','layer');
  if(!p2.error){const rows=p2.data||[];const missing=LAYER_PHASES42.filter(q=>!rows.some(x=>x.name===q.name&&Number(x.from_day)===q.from_day&&Number(x.to_day)===q.to_day));if(missing.length)await db.from('feed_phases').insert(missing.map(q=>({...q,user_id:user.id})));}
  if(typeof load==='function')await load();
 }catch(e){console.error('FERMA v42 layer normalization',e)}
}
function canonicalRecipePhase42(v){const s=String(v||'').trim();if(!s)return s;if(s==='Вирощування'||s==='Вирощування несучок'||/Вирощування\s*1[–-]140\s*день/i.test(s))return 'Вирощування';if(s==='Кладка'||/Кладка\s*140\+/i.test(s))return 'Кладка';return s}
const previousRecipeForm42=window.recipeForm;
if(typeof previousRecipeForm42==='function')window.recipeForm=async function(id){await previousRecipeForm42(id);const f=document.getElementById('recipeForm39');if(!f?.phase)return;for(const o of [...f.phase.options])o.value=canonicalRecipePhase42(o.value);f.phase.value=canonicalRecipePhase42(f.phase.value)};
let tries42=0;const timer42=setInterval(()=>{if(window.user&&window.db){clearInterval(timer42);normalizeLayer42()}else if(++tries42>120)clearInterval(timer42)},500);
})();