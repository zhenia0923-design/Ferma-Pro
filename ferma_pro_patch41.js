(()=>{'use strict';
/* FERMA PRO v41: authoritative layer feed phases: 1-140, then 140+ */
const LAYER_PHASES41=[
 {kind:'layer',name:'Вирощування',from_day:1,to_day:140,sort_order:1,recommended_weight_g:0,recommended_feed_g_head:0,notes:'Вирощування несучок від 1 до 140 дня.'},
 {kind:'layer',name:'Кладка',from_day:140,to_day:9999,sort_order:2,recommended_weight_g:0,recommended_feed_g_head:0,notes:'Кладка з 140 дня.'}
];
window.layerPhases41=LAYER_PHASES41;
window.phaseFor=function(b){
 if(!b)return null;
 const d=typeof age==='function'?age(b):1;
 if(b.kind==='layer') return d<140?LAYER_PHASES41[0]:LAYER_PHASES41[1];
 if(Array.isArray(C?.phases)) return C.phases.filter(x=>x.kind===b.kind).find(x=>d>=Number(x.from_day||0)&&d<=Number(x.to_day||999999))||null;
 return null;
};
async function ensureLayerPhases41(){
 if(!window.user||!window.db)return;
 const r=await db.from('feed_phases').select('id,name,from_day,to_day,sort_order').eq('user_id',user.id).eq('kind','layer');
 if(r.error)return console.error('FERMA v41 phase read',r.error);
 const rows=r.data||[];
 for(const x of rows){
   const correct=(String(x.name)==='Вирощування'&&Number(x.from_day)===1&&Number(x.to_day)===140)||(String(x.name)==='Кладка'&&Number(x.from_day)===140&&Number(x.to_day)>=140);
   if(!correct) await db.from('feed_phases').delete().eq('id',x.id).eq('user_id',user.id);
 }
 const after=await db.from('feed_phases').select('id,name,from_day,to_day').eq('user_id',user.id).eq('kind','layer');
 if(after.error)return console.error('FERMA v41 phase reload',after.error);
 const now=after.data||[];
 const missing=LAYER_PHASES41.filter(p=>!now.some(x=>x.name===p.name&&Number(x.from_day)===p.from_day&&Number(x.to_day)===p.to_day));
 if(missing.length){const ins=await db.from('feed_phases').insert(missing.map(p=>({...p,user_id:user.id})));if(ins.error)console.error('FERMA v41 phase insert',ins.error);}
 if(typeof load==='function')await load();
}
let n41=0;const t41=setInterval(()=>{if(window.user&&window.db){clearInterval(t41);ensureLayerPhases41()}else if(++n41>120)clearInterval(t41)},500);
})();