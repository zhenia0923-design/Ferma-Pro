(()=>{'use strict';
/* FERMA PRO: agro-grade reports + safe archive */
const n7=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const money7=v=>n7(v).toLocaleString('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2})+' грн';
window.archiveCompleted=async function(kind){
 const candidates=C.batches.filter(b=>b.kind===kind&&b.status!=='archived');
 if(!candidates.length)return alert('Немає активних партій.');
 const list=candidates.map((b,i)=>`${i+1}. ${b.name} (${heads(b)} гол.)`).join('\n');
 const answer=prompt(`Введіть номер партії для архіву:\n\n${list}`);
 if(answer===null)return;
 const i=parseInt(answer,10)-1,b=candidates[i];
 if(!b)return alert('Невірний номер партії.');
 if(heads(b)>0&&!confirm(`У партії ще ${heads(b)} гол. Архівувати все одно?`))return;
 if(await save('batches',{status:'archived'},b.id))alert(`Партію «${b.name}» перенесено в архів.`);
};
window.reports=function(){
 const active=C.batches.filter(b=>b.status!=='archived'),arch=C.batches.filter(b=>b.status==='archived');
 const rows=C.batches.map(b=>{const w=latestWeight(b.id),cost=n7(totalCost(b.id)),inc=n7(income(b.id)),result=inc-cost,feed=n7(feedKg(b.id)),fc=n7(fcr(b.id));return `<tr><td>${E(b.name)}</td><td>${b.kind==='broiler'?'Бройлери':'Несучки'}</td><td>${E(b.breed||'')}</td><td>${b.placed_at}</td><td>${n7(b.initial_heads)}</td><td>${heads(b)}</td><td>${b.kind==='broiler'?(w?n7(w.average_weight_g).toFixed(0)+' г':'—'):eggProduced(b.id)+' шт'}</td><td>${feed.toFixed(2)} кг</td><td>${fc?fc.toFixed(3):'—'}</td><td>${money7(cost)}</td><td>${money7(inc)}</td><td>${money7(result)}</td><td>${E(b.status||'active')}</td></tr>`}).join('');
 $('content').innerHTML=`<div class="row noPrint"><button class="primary" onclick="window.print()">🖨️ Друк / PDF</button><button class="secondary" onclick="load()">↻ Оновити</button></div><div class="card section" id="agroReport"><h2>ЗВІТ ПО ГОСПОДАРСТВУ</h2><p class="muted">Сформовано: ${D()}</p><div class="grid g4"><div class="card">Активні партії<div class="stat">${active.length}</div></div><div class="card">Архівні партії<div class="stat">${arch.length}</div></div><div class="card">Птиця в роботі<div class="stat">${active.reduce((s,b)=>s+heads(b),0)}</div></div><div class="card">Загальний результат<div class="stat">${money7(C.batches.reduce((s,b)=>s+n7(income(b.id))-n7(totalCost(b.id)),0))}</div></div></div><div class="section"><h3>Партії та фінансовий результат</h3><div style="overflow:auto"><table class="table"><thead><tr><th>Партія</th><th>Вид</th><th>Порода</th><th>Посадка</th><th>Було</th><th>Зараз</th><th>Вага / яйця</th><th>Корм</th><th>FCR</th><th>Собівартість</th><th>Дохід</th><th>Результат</th><th>Статус</th></tr></thead><tbody>${rows||'<tr><td colspan="13">Немає даних</td></tr>'}</tbody></table></div></div><div class="section"><h3>Деталізація витрат активних партій</h3>${active.map(b=>{const fc=n7(feedCost(b.id)),dc=n7(dailyCost(b.id)),tc=n7(treatmentCost(b.id)),ec=n7(explicitExpense(b.id)),ch=n7(b.initial_heads)*n7(b.chick_price);return `<div class="card" style="margin:8px 0"><b>${E(b.name)}</b><div class="muted">Курчата: ${money7(ch)} · Корм: ${money7(fc)} · Щоденні: ${money7(dc)} · Ліки: ${money7(tc)} · Інші: ${money7(ec)} · Разом: <b>${money7(totalCost(b.id))}</b></div></div>`}).join('')||'<p class="muted">Немає активних партій.</p>'}</div></div>`;
};
})();
