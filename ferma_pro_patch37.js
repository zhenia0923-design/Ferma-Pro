(()=>{'use strict';
/* FERMA PRO v37: full user-provided broiler drinking schedule, never shown for laying hens */
const broilerDrink37=[
 [1,'Глюкоза','50 г/10 л'],
 [2,'Байтрил 10% або Енроксіл 10%','1 мл/л'],
 [3,'Байтрил 10% або Енроксіл 10%','1 мл/л'],
 [4,'Байтрил 10% або Енроксіл 10%','1 мл/л'],
 [5,'Байтрил 10% або Енроксіл 10%','1 мл/л'],
 [6,'Чіктонік або Нутріл-Se','1 мл/л'],
 [7,'Чіктонік або Нутріл-Se','1 мл/л'],
 [8,'Чіктонік або Нутріл-Se','1 мл/л'],
 [9,'Підкислювач','1 куб/л'],
 [10,'Чіктонік або Нутріл-Se','1 мл/л'],
 [11,'Чіктонік або Нутріл-Se','1 мл/л'],
 [12,'Байкокс 2,5% або Солікокс','1 мл/л'],
 [13,'Байкокс 2,5% або Солікокс','1 мл/л'],
 [14,'Байкокс 2,5% або Солікокс','1 мл/л'],
 [15,'Чиста вода','-'],
 [16,'Чіктонік або Нутріл-Se','1 мл/л'],
 [17,'Чіктонік або Нутріл-Se','1 мл/л'],
 [18,'Байтрил 10% або Енроксіл 10%','1 мл на 1,5-2 л'],
 [19,'Байтрил 10% або Енроксіл 10%','1 мл на 1,5-2 л'],
 [20,'Байтрил 10% або Енроксіл 10%','1 мл на 1,5-2 л'],
 [21,'Байтрил 10% або Енроксіл 10%','1 мл на 1,5-2 л'],
 [22,'Байтрил 10% або Енроксіл 10%','1 мл на 1,5-2 л'],
 [23,'Чиста вода','-'],
 [24,'Вотермінт','1 куб/л'],
 [25,'Вотермінт','1 куб/л'],
 [26,'Підкислювач','1 куб/л'],
 [27,'Підкислювач','1 куб/л'],
 [28,'Чиста вода','-'],
 [29,'Вотермінт','1 куб/л'],
 [30,'Вотермінт','1 куб/л'],
 [31,'Солікокс або Байкокс','1 мл/л'],
 [32,'Солікокс або Байкокс','1 мл/л'],
 [33,'Солікокс або Байкокс','1 мл/л'],
 [34,'Чиста вода','-'],
 [35,'Підкислювач','1 куб/л'],
 [36,'Підкислювач','1 куб/л'],
 [37,'Вотермінт','1 куб/л'],
 [38,'Вотермінт','1 куб/л'],
 [39,'Вотермінт','1 куб/л'],
 [40,'Чиста вода','-'],
 [41,'Чиста вода','-'],
 [42,'Чиста вода','-']
];
function addBroilerSchedule37(id){
 const b=typeof batch==='function'?batch(id):null;
 if(!b||b.kind!=='broiler')return;
 const old=document.querySelector('[data-broiler-drink37]');if(old)old.remove();
 const box=document.createElement('div');box.className='card';box.dataset.broilerDrink37='1';
 box.innerHTML='<h3>💧 Схема випойки бройлерів, 1–42 день</h3><p style="opacity:.75">Схема показується тільки для партій бройлерів. Для несучок вона не застосовується.</p><div style="overflow:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:8px">День</th><th style="text-align:left;padding:8px">Препарат</th><th style="text-align:left;padding:8px">Дозування</th></tr></thead><tbody>'+broilerDrink37.map(r=>'<tr><td style="padding:7px;border-top:1px solid #ddd">'+r[0]+'</td><td style="padding:7px;border-top:1px solid #ddd">'+r[1]+'</td><td style="padding:7px;border-top:1px solid #ddd">'+r[2]+'</td></tr>').join('')+'</tbody></table></div>';
 document.querySelector('#content')?.appendChild(box);
}
const prev37=window.openBatch;if(typeof prev37==='function')window.openBatch=function(id){prev37(id);setTimeout(()=>addBroilerSchedule37(id),40)};
window.broilerDrink37=broilerDrink37;
})();