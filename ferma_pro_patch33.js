(()=>{'use strict';
/* FERMA PRO v33: medicine cost duplicate-entry protection */
const n33=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const esc33=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.medicineCostAudit33=function(batchId=null){
 const rows=C.daily.filter(d=>(!batchId||d.batch_id===batchId)&&n33(d.medicine_cost)>0);
 const issues=[];
 for(const d of rows){
   const t=C.treat.filter(x=>x.batch_id===d.batch_id&&x.treatment_date===d.record_date&&n33(x.total_cost)>0);
   if(t.length)issues.push({batchId:d.batch_id,date:d.record_date,daily:n33(d.medicine_cost),treatment:t.reduce((s,x)=>s+n33(x.total_cost),0),count:t.length});
 }
 return issues;
};
window.medicineCostWarning33=function(batchId,date){
 const d=C.daily.find(x=>x.batch_id===batchId&&x.record_date===date);
 const treatment=C.treat.filter(x=>x.batch_id===batchId&&x.treatment_date===date&&n33(x.total_cost)>0);
 if(n33(d?.medicine_cost)>0&&treatment.length){
   return `На ${date} вже є детальне лікування на ${treatment.reduce((s,x)=>s+n33(x.total_cost),0).toFixed(2)} грн. Поле «Ручні ліки, грн» додається окремо і може спричинити подвійний облік.`;
 }
 return '';
};
const oldDaily33=window.dailyForm;
window.dailyForm=function(bid,id){
 oldDaily33(bid,id);
 setTimeout(()=>{
   const form=document.querySelector('#modal form'); if(!form)return;
   const input=form.querySelector('[name="medicine_cost"]'); if(!input)return;
   const label=input.closest('label');
   if(label){
     label.firstChild && label.firstChild.nodeType===3 ? label.firstChild.textContent='Ручні ліки, грн (не з лікування)' : null;
     const note=document.createElement('small'); note.textContent='Вноситься тільки для окремих ручних витрат. Детальне лікування рахується автоматично.'; label.appendChild(note);
   }
   const check=()=>{
     const date=form.querySelector('[name="record_date"]')?.value;
     const msg=window.medicineCostWarning33(bid,date);
     let box=form.querySelector('[data-medwarn33]');
     if(msg){if(!box){box=document.createElement('div');box.dataset.medwarn33='1';box.style.marginTop='8px';box.style.fontWeight='600';box.style.color='#a15c00';form.insertBefore(box,form.querySelector('button'));}box.textContent='⚠ '+msg;}else if(box)box.remove();
   };
   input.addEventListener('input',check);form.querySelector('[name="record_date"]')?.addEventListener('change',check);check();
 },0);
};
const oldReport30=window.batchReport23;
window.batchReport23=function(id){
 if(typeof oldReport30==='function')oldReport30(id);
 setTimeout(()=>{
   const issues=window.medicineCostAudit33(id); if(!issues.length)return;
   const box=document.createElement('div');box.className='card';box.innerHTML='<h3>⚠ Контроль витрат на ліки</h3>'+issues.map(x=>`<p>Дата ${esc33(x.date)}: ручні ліки ${x.daily.toFixed(2)} грн + детальне лікування ${x.treatment.toFixed(2)} грн (${x.count} записів). Перевірте, щоб це не були одні й ті самі витрати.</p>`).join('');
   document.querySelector('#content')?.appendChild(box);
 },50);
};
const oldReports33=window.reports;
if(typeof oldReports33==='function')window.reports=function(){oldReports33();setTimeout(()=>{
 const issues=window.medicineCostAudit33();const box=document.createElement('div');box.className='card noPrint';box.innerHTML='<h3>Контроль дублювання ліків</h3>'+ (issues.length?issues.map(x=>`<p>⚠ ${esc33(x.date)}: ручні ${x.daily.toFixed(2)} грн + лікування ${x.treatment.toFixed(2)} грн</p>`).join(''):'<p>✓ Ознак дублювання витрат на ліки не виявлено</p>');document.querySelector('#content')?.appendChild(box);
},0)};
})();
