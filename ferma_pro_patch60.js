(()=>{'use strict';
/* FERMA PRO v60: final guard against legacy total_preview payloads. */
const rawSave60=window.save;
if(typeof rawSave60==='function'){
 window.save=async function(table,p,id){
   const clean={...(p||{})};
   delete clean.total_preview;
   if(table==='livestock_events'){
     const allowed=['batch_id','event_type','event_date','heads','weight_kg','price_per_kg','total_amount','client','notes'];
     Object.keys(clean).forEach(k=>{if(!allowed.includes(k))delete clean[k]});
     if(clean.event_type==='cull'){
       clean.price_per_kg=0;
       clean.total_amount=0;
       clean.client=null;
     }
   }
   return rawSave60(table,clean,id);
 };
}
console.log('FERMA v60 loaded: livestock_events payload guard active');
})();
