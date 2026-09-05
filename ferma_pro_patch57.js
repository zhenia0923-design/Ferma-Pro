(()=>{'use strict';
/* FERMA PRO v57: robustly sync the supplied Cobb-500 weighing history. */
const W57=[
['2026-08-07',50,54],['2026-08-08',50,67],['2026-08-09',50,80],['2026-08-10',151,0],['2026-08-11',50,150],['2026-08-12',50,180],['2026-08-13',50,205],['2026-08-14',50,257],['2026-08-15',151,0],['2026-08-16',50,370],['2026-08-17',50,400],['2026-08-18',50,450],['2026-08-19',50,490],['2026-08-20',149,525],['2026-08-21',50,0],['2026-08-22',50,608],['2026-08-23',50,691],['2026-08-24',50,760],['2026-08-25',149,848],['2026-08-26',50,896],['2026-08-27',50,930],['2026-08-28',50,980],['2026-08-29',50,1163],['2026-08-30',147,1210],['2026-08-31',50,1300],['2026-09-01',50,1380],['2026-09-02',50,1400],['2026-09-03',50,1485],['2026-09-04',146,1575]
];
const day=v=>String(v||'').slice(0,10);
async function sync57(){
 try{
  if(!user?.id)return;
  const bq=await db.from('batches').select('id,name,kind,placed_at').eq('user_id',user.id);
  if(bq.error){console.error('v57 batches',bq.error);return}
  const bs=(bq.data||[]).filter(b=>String(b.kind||'').toLowerCase().includes('broil')&&day(b.placed_at)==='2026-08-06');
  const b=bs[0];
  if(!b){console.error('v57: batch 2026-08-06 not found',bq.data);return}
  const q=await db.from('broiler_weights').select('*').eq('user_id',user.id).eq('batch_id',b.id);
  if(q.error){console.error('v57 weights read',q.error);return}
  const existing=q.data||[];
  for(const [date,heads,avg] of W57){
   const old=existing.find(x=>day(x.weigh_date)===date);
   const payload={user_id:user.id,batch_id:b.id,weigh_date:date,heads_weighed:heads,average_weight_g:avg};
   if(old){
    const u=await db.from('broiler_weights').update({heads_weighed:heads,average_weight_g:avg,weigh_date:date}).eq('id',old.id).eq('user_id',user.id);
    if(u.error)console.error('v57 update',date,u.error);
   }else{
    const ins=await db.from('broiler_weights').insert(payload);
    if(ins.error)console.error('v57 insert',date,ins.error);
   }
  }
  if(typeof load==='function')await load();
  console.log('FERMA v57: weighing history synchronized',W57.length,b.id);
 }catch(e){console.error('FERMA v57 sync',e)}
}
let tries=0;const timer=setInterval(()=>{if(user?.id){clearInterval(timer);sync57()}else if(++tries>120)clearInterval(timer)},500);
})();