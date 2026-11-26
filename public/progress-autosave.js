(function(){
'use strict';
const STORAGE_KEY='nextli-configurador-progress-v1';
let saveTimer=null, restoring=false;
const statusId='nextliProgressStatus';
function status(message){
  let el=document.getElementById(statusId);
  if(!el){
    el=document.createElement('div');el.id=statusId;el.setAttribute('role','status');el.setAttribute('aria-live','polite');
    el.style.cssText='text-align:center;font:12px/1.5 Arial,sans-serif;color:#647267;margin:5px 0 12px;min-height:18px';
    const label=document.getElementById('stepProgressLabel');
    if(label&&label.parentNode)label.parentNode.insertBefore(el,label.nextSibling);
  }
  el.textContent=message;
}
function activeStep(){
  const panel=document.querySelector('.step-panel.active');
  return Math.min(5,Math.max(1,Number(panel&&panel.dataset.step)||1));
}
function capture(){
  const fields={};
  document.querySelectorAll('.step-panel input[id],.step-panel select[id],.step-panel textarea[id]').forEach(el=>{
    if(el.type==='file'||el.type==='password')return;
    fields[el.id]=(el.type==='checkbox'||el.type==='radio')?{checked:!!el.checked}:{value:el.value};
  });
  return {version:1,updatedAt:Date.now(),state:JSON.parse(JSON.stringify(state)),fields,step:activeStep()};
}
function save(){
  if(restoring)return;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(capture()));status('✓ Progreso guardado automáticamente en este dispositivo');}
  catch(e){status('No se pudo guardar en este navegador. Revisa el espacio disponible.');}
}
function schedule(){
  if(restoring)return;
  status('Guardando progreso…');clearTimeout(saveTimer);saveTimer=setTimeout(save,180);
}
function restore(){
  let data;
  try{data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch(e){return;}
  if(!data||data.version!==1)return;
  restoring=true;
  try{
    if(data.state&&typeof data.state==='object')Object.assign(state,data.state);
    // Set species first so its change handler rebuilds the breed options.
    const species=document.getElementById('species');
    if(species&&data.fields.species){species.value=data.fields.species.value||'';species.dispatchEvent(new Event('change',{bubbles:true}));}
    const breed=document.getElementById('breed');
    if(breed&&data.fields.breed){breed.value=data.fields.breed.value||'';breed.dispatchEvent(new Event('change',{bubbles:true}));}
    Object.entries(data.fields||{}).forEach(([id,v])=>{
      if(id==='species'||id==='breed')return;
      const el=document.getElementById(id);if(!el||!v)return;
      if(el.type==='checkbox'||el.type==='radio')el.checked=!!v.checked;
      else if(typeof v.value==='string')el.value=v.value;
    });
    // Reconcile UI state and selections without triggering navigation.
    Object.assign(state,data.state||{});
    document.querySelectorAll('[data-service]').forEach(el=>el.classList.toggle('selected',el.dataset.service===state.service));
    const isCom=state.service==='comunitaria';
    const individual=document.getElementById('weightFieldIndividual'),community=document.getElementById('weightFieldComunitaria'),urnWrap=document.getElementById('urnPickerWrap');
    if(individual)individual.style.display=isCom?'none':'block';
    if(community)community.style.display=isCom?'block':'none';
    if(urnWrap)urnWrap.style.display=isCom?'none':'block';
    const plus=document.getElementById('addPlus');
    const huella=document.getElementById('addHuella');
    const cert=document.getElementById('addCert');
    if(plus)plus.checked=!!state.plus;if(huella)huella.checked=!!state.huella;if(cert)cert.checked=!!state.cert;
    const colorWrap=document.getElementById('colorWrap');if(colorWrap)colorWrap.style.display=state.plus?'block':'none';
    document.querySelectorAll('[data-color]').forEach(el=>el.classList.toggle('selected',el.dataset.color===state.color));
    if(typeof updateSuggestion==='function')updateSuggestion();
    if(typeof renderUrns==='function')renderUrns(state.weight||null);
    // renderUrns() already applies the selected class from state.urnId.
    if(typeof syncExtraButtons==='function')syncExtraButtons();
    if(typeof updateRunningTotal==='function')updateRunningTotal();
    const next2=document.getElementById('next2');
    if(next2)next2.disabled=isCom?!state.weightCom:!(state.weight&&state.urnId);
    const step=Math.min(5,Math.max(1,Number(data.step)||1));
    if(step===5&&typeof renderSummary==='function')renderSummary();
    if(typeof goTo==='function')goTo(step);
    status('✓ Se recuperó tu progreso guardado');
  }catch(e){console.warn('NEXTLI: no se pudo restaurar el progreso',e);status('No se pudo restaurar automáticamente el progreso.');}
  finally{restoring=false;}
}
function noteBeforeLeaving(){clearTimeout(saveTimer);save();}
document.addEventListener('input',schedule,true);
document.addEventListener('change',schedule,true);
document.addEventListener('click',e=>{
  if(e.target.closest('[data-service],.urn-card,[data-color],[data-toggle-extra],#next2'))setTimeout(schedule,0);
},true);
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden')noteBeforeLeaving();
  else schedule();
});
window.addEventListener('pagehide',noteBeforeLeaving);
window.addEventListener('beforeunload',noteBeforeLeaving);
window.addEventListener('pageshow',()=>{if(!restoring)schedule();});
setTimeout(restore,250);

// Check for site updates when opening or returning from another app.
// If a new service worker takes control, save first, then refresh once.
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(reloading)return;reloading=true;noteBeforeLeaving();location.reload();
  });
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(reg=>{
      const check=()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{});};
      window.addEventListener('pageshow',check);
      document.addEventListener('visibilitychange',check);
      setInterval(check,4*60*1000);
      check();
    }).catch(err=>console.warn('NEXTLI update check failed',err));
  });
}
})();