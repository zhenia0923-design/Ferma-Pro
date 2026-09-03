(()=>{'use strict';
const del14=window.del;
window.del=async function(t,id){
 if(!confirm('Видалити запис?'))return;
 try{
  if(t==='daily_records')await db.from('warehouse_movements').delete().eq('user_id',user.id).eq('reference_id',id).like('notes','AUTO_FEED:%');
  if(t==='treatments')await db.from('warehouse_movements').delete().eq('user_id',user.id).eq('reference_id',id).like('notes','AUTO_MED:%');
  const r=await db.from(t).delete().eq('id',id).eq('user_id',user.id);
  if(r.error){alert(r.error.message);return}
  await load();
 }catch(e){console.error(e);alert(e.message||'Помилка видалення')}
};
})();