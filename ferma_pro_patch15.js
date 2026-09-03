(()=>{'use strict';
/* FERMA PRO: safe deletion sync helper. patch12 owns window.del; this patch does not override it. */
window.deleteSync15=async function(t,id){
  if(t==='daily_records') return await db.from('warehouse_movements').delete().eq('user_id',user.id).eq('reference_id',id).like('notes','AUTO_FEED:%');
  if(t==='treatments') return await db.from('warehouse_movements').delete().eq('user_id',user.id).eq('reference_id',id).like('notes','AUTO_MED:%');
  return {error:null};
};
})();