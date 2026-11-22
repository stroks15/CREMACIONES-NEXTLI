(function(){
'use strict';
const workerActions=document.getElementById('workerFinalActions');
if(!workerActions)return;
const btn=document.createElement('button');
btn.type='button';btn.id='createRemissionNote';btn.className='btn btn-outline-dark worker-only';
btn.textContent='Crear Nota de Remisión';
workerActions.appendChild(btn);
const observer=new MutationObserver(()=>{btn.style.display=document.body.classList.contains('nextli-worker-mode')?'inline-flex':'none';});
observer.observe(document.body,{attributes:true,attributeFilter:['class']});
btn.style.display=document.body.classList.contains('nextli-worker-mode')?'inline-flex':'none';
const css=document.createElement('style');
css.textContent=`
#nextli-remission-modal{position:fixed;inset:0;z-index:99999;background:rgba(5,14,26,.72);display:none;overflow:auto;padding:18px}
#nextli-remission-modal.open{display:block}
.nr-shell{max-width:1080px;margin:0 auto;background:#FAF8F5;border-radius:16px;padding:20px;color:#0B192C;box-shadow:0 25px 80px #0005}
.nr-actions{display:flex;gap:10px;flex-wrap:wrap;position:sticky;top:0;background:#FAF8F5;padding:8px 0 14px;z-index:2}
.nr-actions button{border:0;border-radius:9px;padding:11px 16px;font-weight:700;cursor:pointer;background:#0B192C;color:#fff}
.nr-actions .gold{background:#C5A059;color:#0B192C}.nr-actions .close{background:#e9e4dc;color:#0B192C}
.nr-note{background:#FAF8F5;border:1px solid #d8d0c2;padding:clamp(14px,3vw,34px);font-family:Arial,sans-serif;color:#0B192C}
.nr-head{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:center;border-bottom:2px solid #C5A059;padding-bottom:14px}
.nr-brand{display:flex;align-items:center;gap:12px}.nr-brand img{width:82px;height:82px;object-fit:contain}
.nr-brand h2{margin:0;font-size:24px;letter-spacing:2px}.nr-small{font-size:11px;line-height:1.5}
.nr-title{text-align:right}.nr-title h1{font-size:clamp(22px,3vw,32px);margin:0 0 8px}
.nr-contact{background:#e1e8e1;padding:9px;margin:12px 0;font-size:11px;text-align:center}
.nr-two{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}
.nr-block{border:1px solid #0B192C;border-radius:8px;overflow:hidden}.nr-block h3{margin:0;background:#e8ece8;padding:8px;text-align:center;font-size:15px;border-bottom:1px solid}
.nr-field{padding:5px 8px;border-bottom:1px solid #d9d9d4;font-size:12px;display:flex;gap:6px;align-items:center}.nr-field:last-child{border-bottom:0}
.nr-field label{font-weight:700;min-width:74px}.nr-edit{border:0;border-bottom:1px dotted #b4a77e;background:transparent;color:inherit;font:inherit;min-width:0;flex:1;width:100%;padding:2px}
.nr-table{width:100%;border-collapse:collapse;font-size:11px;margin:12px 0}.nr-table th,.nr-table td{border:1px solid #c6c9c3;padding:7px;text-align:left}.nr-table th{background:#e1e8e1}.nr-table td input{width:100%;border:0;background:transparent;font:inherit;color:inherit}
.nr-bottom{display:grid;grid-template-columns:1.2fr 1fr;gap:12px}.nr-notes{border:1px solid #0B192C;border-radius:8px;padding:10px;font-size:12px}.nr-notes textarea{width:100%;min-height:60px;border:0;border-bottom:1px solid #ccc;background:transparent;font:inherit;resize:vertical}
.nr-total{border:1px solid #0B192C;border-radius:8px;overflow:hidden;font-size:13px}.nr-total div{padding:8px;display:flex;justify-content:space-between;border-bottom:1px solid #ddd}.nr-total .grand{background:#e1e8e1;font-weight:800;font-size:16px}
.nr-pay{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;margin:10px 0}.nr-sign{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin:24px 0 12px;text-align:center;font-size:11px}.nr-sign div{border-top:1px solid #0B192C;padding-top:7px}.nr-footer{text-align:center;font-family:Georgia,serif;font-style:italic;margin:16px 0 0;font-size:13px}
@media(max-width:650px){.nr-shell{padding:10px}.nr-head{grid-template-columns:1fr}.nr-title{text-align:left}.nr-two,.nr-bottom{grid-template-columns:1fr}.nr-brand img{width:60px;height:60px}.nr-note{padding:12px}.nr-table{font-size:9px}.nr-table th,.nr-table td{padding:4px}}
@media print{body>*{visibility:hidden}#nextli-remission-modal,#nextli-remission-modal *{visibility:visible}#nextli-remission-modal{position:absolute;inset:0;background:white;padding:0}.nr-actions{display:none}.nr-shell{box-shadow:none;max-width:none}}
`;
document.head.appendChild(css);
const modal=document.createElement('div');modal.id='nextli-remission-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
modal.innerHTML=`<div class="nr-shell"><div class="nr-actions"><button class="gold" id="nr-create">Consolidar / Actualizar nota</button><button id="nr-download">Descargar PDF</button><button id="nr-png">Descargar PNG</button><button id="nr-share">Compartir WhatsApp</button><button class="close" id="nr-close">Cerrar</button></div><div id="nr-content"></div></div>`;
document.body.appendChild(modal);
const $=id=>modal.querySelector('#'+id);
const get=id=>document.getElementById(id)?.value?.trim()||'';
const fmt=n=>Number(n||0).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});
const safe=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clean=s=>String(s||'Mascota').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w-]+/g,'_').slice(0,60)||'Mascota';
let data;
function snapshot(){
 const communal=state.service==='comunitaria',urn=Array.isArray(URNS)?URNS.find(u=>u.id===state.urnId):null;
 const base=communal?(COM_PRICE?.[state.weightCom]||0):(urn?.prices?.[state.weight]||0);
 const extras=(state.plus?500:0)+(state.huella?200:0)+(state.cert?50:0);
 const total=base+extras;
 const status=get('paymentStatus');
 let deposit=status==='Pago liquidado'?total:status==='Pago del 50%'?total/2:status==='Otro'?Number(get('paymentAmount')||0):0;
 return {folio:'NEXTLI-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+String(Date.now()).slice(-5),date:new Date().toLocaleDateString('es-MX'),owner:get('ownerName'),phone:get('ownerPhone'),address:get('ownerAddress'),pet:get('petName'),species:state.species==='otro'?get('speciesOther'):state.species,breed:state.breed,age:get('petAge'),weight:state.weight||state.weightCom,death:get('petDate'),service:communal?'Cremación sin recuperación / Comunitaria':state.service==='eutanasia'?'Eutanasia asistida':'Cremación individual',urn:urn?.name||'No aplica',plus:!!state.plus,huella:!!state.huella,cert:!!state.cert,color:state.color||'',frame:get('frameType'),base,extras,total,deposit,payment:status||'No especificado',method:'',phrase:get('farewellPhrase'),extraNotes:'',quantity:1};
}
function field(label,key){return '<div class="nr-field"><label>'+label+'</label><input class="nr-edit" data-key="'+key+'" value="'+safe(data[key])+'"></div>'}
function render(){
 const rows=[{name:data.service,amount:data.base},{name:'Urna: '+data.urn,amount:0}];
 if(data.plus)rows.push({name:'Paquete Plus — Homenaje completo / marco / vinilo',amount:500});
 if(data.huella)rows.push({name:'Huella con pelo de mascota',amount:200});
 if(data.cert)rows.push({name:'Certificado físico adicional',amount:50});
 rows.push({name:'Personalización de vinilo / color: '+(data.color||'—'),amount:0});
 $('nr-content').innerHTML=`<div class="nr-note" id="nr-print"><div class="nr-head"><div class="nr-brand"><img src="/images/nextli-logo.png" crossorigin="anonymous"><div><h2>NEXTLI</h2><div class="nr-small">Cremación de Mascotas<br>con Amor en México</div></div></div><div class="nr-title"><h1>NOTA DE REMISIÓN</h1><div>Folio N° <input class="nr-edit" data-key="folio" value="${safe(data.folio)}"></div><div>Fecha <input class="nr-edit" data-key="date" value="${safe(data.date)}"></div></div></div><div class="nr-contact">Tel / WhatsApp: 55 2188 9698 · cremacionesnextli@gmail.com · José Bernardo Couto 226, México 2da Secc, 57620 Cd. Nezahualcóyotl, Méx.</div><div class="nr-two"><section class="nr-block"><h3>Datos del Tutor</h3>${field('Nombre','owner')}${field('Teléfono / WhatsApp','phone')}${field('Dirección','address')}</section><section class="nr-block"><h3>Datos del Compañero</h3>${field('Mascota','pet')}${field('Especie / Raza','species')}${field('Raza','breed')}${field('Edad','age')}${field('Peso aprox.','weight')}${field('Fecha de defunción','death')}</section></div><table class="nr-table"><thead><tr><th>Cant.</th><th>Descripción del Servicio / Personalización</th><th>Precio Unit.</th><th>Importe</th></tr></thead><tbody>${rows.map((r,i)=>'<tr><td>1</td><td>'+safe(r.name)+'</td><td>$'+fmt(r.amount)+'</td><td>$'+fmt(r.amount)+'</td></tr>').join('')}<tr><td> </td><td><input class="nr-edit" data-key="customLine" placeholder="Concepto adicional / edición"></td><td><input class="nr-edit" data-key="customPrice" type="number" min="0" placeholder="$0.00"></td><td>$<span id="nr-custom-total">0.00</span></td></tr></tbody></table><div class="nr-bottom"><section class="nr-notes"><b>Frase de despedida / Observaciones</b><textarea data-key="phrase" placeholder="Unas palabras para él o ella…">${safe(data.phrase)}</textarea><b>Notas extras</b><textarea data-key="extraNotes" placeholder="Indicaciones, horarios, acuerdos especiales…">${safe(data.extraNotes)}</textarea></section><section><div class="nr-total"><div><span>Subtotal</span><b>$<span id="nr-subtotal">${fmt(data.total)}</span></b></div><div><span>Anticipo</span><input class="nr-edit" data-key="deposit" type="number" min="0" value="${data.deposit}"></div><div class="grand"><span>Total a pagar</span><b>$<span id="nr-balance">${fmt(data.total-data.deposit)}</span> MXN</b></div></div><div class="nr-pay"><label><input type="radio" name="nr-method" value="Efectivo"> Efectivo</label><label><input type="radio" name="nr-method" value="Transferencia"> Transferencia</label><label><input type="radio" name="nr-method" value="Tarjeta"> Tarjeta</label><span>Pago: ${safe(data.payment)}</span></div></section></div><div class="nr-sign"><div>Firma de conformidad del Tutor</div><div>Recibido / Entregado por NEXTLI</div></div><div class="nr-footer">“Pequeños detalles que guardan su huella por siempre.”</div></div>`;
 modal.querySelectorAll('[data-key]').forEach(el=>el.addEventListener('input',()=>{data[el.dataset.key]=el.value;updateTotals();}));
 modal.querySelectorAll('[name="nr-method"]').forEach(el=>el.addEventListener('change',()=>data.method=el.value));
 updateTotals();
}
function updateTotals(){const custom=Number(data.customPrice||0),sub=data.total+custom;const s=$('nr-subtotal'),b=$('nr-balance'),ct=$('nr-custom-total');if(s)s.textContent=fmt(sub);if(ct)ct.textContent=fmt(custom);if(b)b.textContent=fmt(sub-Number(data.deposit||0));}
function consolidate(){const fresh=snapshot();data={...fresh,...data,folio:data.folio,date:data.date,extraNotes:data.extraNotes||'',phrase:data.phrase||''};render();}
btn.addEventListener('click',()=>{if(!document.body.classList.contains('nextli-worker-mode'))return;data=snapshot();modal.classList.add('open');render();});
$('nr-create').addEventListener('click',consolidate);$('nr-close').addEventListener('click',()=>modal.classList.remove('open'));
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open');});
function canvas(){return new Promise((resolve,reject)=>{if(typeof html2canvas!=='function'){reject(new Error('No se cargó html2canvas'));return;}html2canvas($('nr-print'),{scale:3,backgroundColor:'#FAF8F5',useCORS:true}).then(resolve,reject);});}
async function pngBlob(){const c=await canvas();return new Promise(r=>c.toBlob(r,'image/png'));}
async function download(kind){const c=await canvas(),filename='Nota_Remision_NEXTLI_'+clean(data.pet)+'.'+kind;if(kind==='png'){const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=filename;a.click();}else{if(!window.jspdf?.jsPDF)throw new Error('No se cargó jsPDF');const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:'portrait',unit:'px',format:[c.width,c.height]});pdf.addImage(c.toDataURL('image/png'),'PNG',0,0,c.width,c.height);pdf.save(filename);}}
$('nr-download').addEventListener('click',()=>download('pdf').catch(e=>alert(e.message)));$('nr-png').addEventListener('click',()=>download('png').catch(e=>alert(e.message)));
$('nr-share').addEventListener('click',async()=>{try{const blob=await pngBlob(),file=new File([blob],'Nota_Remision_NEXTLI_'+clean(data.pet)+'.png',{type:'image/png'});const digits=String(data.phone||'').replace(/\D/g,'');const phone=digits.length===10?'52'+digits:digits.startsWith('52')?digits:digits;if(phone.length<12){alert('Revisa el teléfono del cliente.');return;}const msg='Hola '+(data.owner||'')+', te compartimos la nota de remisión NEXTLI folio '+data.folio+' correspondiente a '+(data.pet||'tu compañero')+'. Gracias por confiar en nosotros.';if(navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({files:[file],title:'Nota de remisión NEXTLI',text:msg});}else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank','noopener');}}catch(e){if(e.name!=='AbortError')alert('No se pudo compartir la nota: '+e.message);}});
})();