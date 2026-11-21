/* ---- ACRACB 2.8.29: ¿confirma por LoTW? ----
   La lista pública de usuarios de Logbook of The World (ARRL) se copia cada semana en la propia web
   (datos/lotw/NN.txt, repartida en 64 trozos por indicativo). Junto al indicativo de cada spot y de cada
   DXpedición sale «LoTW» si esa estación ha subido su log en el último año, con la fecha de la última subida.
   Solo se descargan los trozos de los indicativos que hay en pantalla. */
/* 2.10.17: lo mismo para eQSL (datos/eqsl/: socios «Authenticity Guaranteed» de eQSL.cc con la fecha de su última subida) */
(function(){
"use strict";
if(window.__hkLotw)return;window.__hkLotw=1;
const KH=new Map();
function mk(DIR,LBL,ATTR,CLS,WIN,TX){
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const BASE=(()=>{try{return /^https?:$/.test(location.protocol)&&/ea5jnf\.github\.io$/.test(location.hostname)?new URL(DIR,location.href).href:null}catch(e){return null}})();
const H=c=>{let h=0;for(const ch of c)h=(h*31+ch.charCodeAt(0))%64;return h};
const SH=new Map(),ASK=new Set();
function kh(c){if(KH.has(c))return KH.get(c);KH.set(c,null);
  try{crypto.subtle.digest("SHA-256",new TextEncoder().encode("acracb-dx|"+c)).then(b=>{KH.set(c,[...new Uint8Array(b)].slice(0,6).map(x=>x.toString(16).padStart(2,"0")).join(""));later()}).catch(()=>KH.set(c,""))}catch(e){KH.set(c,"")}
  return null}
function load(k){if(SH.has(k)||ASK.has(k)||!BASE)return;ASK.add(k);
  fetch(BASE+String(k).padStart(2,"0")+".txt",{credentials:"omit",referrerPolicy:"no-referrer"}).then(r=>r.ok?r.text():"").then(t=>{const m=new Map();
    for(const l of t.split("\n")){const i=l.indexOf(" ");if(i>0)m.set(l.slice(0,i),l.slice(i+1).trim())}SH.set(k,m);later();resort()}).catch(()=>{SH.set(k,new Map())})}
/* null: aún no se sabe · "": no está en la lista · "aammdd": fecha de su última subida · "AG": está, sin fecha */
/* 2.10.43: las listas se guardan cifradas (huella SHA-256 de cada indicativo, no el indicativo): la web sigue pudiendo
   preguntar «¿está este indicativo?», pero los ficheros ya no son una lista legible de indicativos */
function look(call){const c=String(call||"").toUpperCase().replace(/[^A-Z0-9/]/g,"");if(!c)return "";
  const cands=[c].concat(c.includes("/")?c.split("/").filter(x=>x.length>=3&&/\d/.test(x)).sort((a,b)=>b.length-a.length):[]);
  let pend=false;for(const x of cands){const k=H(x),hx=kh(x);if(!SH.has(k)){load(k);pend=true;continue}if(hx===null){pend=true;continue}const v=SH.get(k).get(hx);if(v)return v}return pend?null:""}
const fmt=v=>{const d=new Date(Date.UTC(2000+ +v.slice(0,2),+v.slice(2,4)-1,+v.slice(4,6)));return {d,txt:d.toLocaleDateString(EN()?"en-US":"es-ES",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"})}};
function deco(){if(!BASE)return;document.querySelectorAll(`.sc-call .stc[data-stc]:not([data-${ATTR}])`).forEach(el=>{const v=look(el.dataset.stc);if(v===null)return;el.dataset[ATTR]=v?"1":"0";if(!v)return;
  const s=document.createElement("span");s.setAttribute("role","note");s.textContent=LBL;
  if(/^\d{6}$/.test(v)){const f=fmt(v),days=Math.round((Date.now()-f.d)/864e5);s.className=CLS+(days>90?" old":"");s.title=TX(f.txt,days)}else{s.className=CLS;s.title=TX(null,null)}
  s.setAttribute("aria-label",s.title);let at=el;while(at.nextElementSibling&&/(^|\s)(lotwt|eqslt)(\s|$)/.test(at.nextElementSibling.className))at=at.nextElementSibling;at.insertAdjacentElement("afterend",s)})}
let q=0;function later(){if(q)return;q=setTimeout(()=>{q=0;try{deco()}catch(e){}},250)}
window[WIN]=look;
/* 2.9.0: al llegar un trozo, si hay log cargado, se reordenan Avisos y «Qué hacer» (primero lo que te falta y confirma por LoTW) */
let rq=0;function resort(){if(rq)return;rq=setTimeout(()=>{rq=0;try{if(typeof LOG==="undefined"||!LOG)return;if(window.ACRACB_alertCards)window.ACRACB_alertCards();if(typeof renderSide==="function"&&typeof st==="object"&&st.page==="ahora")renderSide()}catch(e){}},900)}
function boot(){later();try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true})}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
}
const EN0=()=>window.ACRACB_LANG==="en";
mk("datos/lotw/","LoTW","lotw","lotwt","ACRACB_lotw",(txt,days)=>EN0()?`Confirms via LoTW. Last log upload: ${txt} (${days} days ago).`:`Confirma por LoTW. Última subida de su log: ${txt} (hace ${days} días).`);
mk("datos/eqsl/","eQSL","eqsl","lotwt eqslt","ACRACB_eqsl",(txt,days)=>txt?(EN0()?`Confirms via eQSL (Authenticity Guaranteed member). Last log upload: ${txt} (${days} days ago). eQSL does not count for ARRL DXCC.`:`Confirma por eQSL (socio con autenticidad garantizada). Última subida de su log: ${txt} (hace ${days} días). eQSL no vale para el DXCC de la ARRL.`):(EN0()?"Confirms via eQSL (Authenticity Guaranteed member). eQSL does not count for ARRL DXCC.":"Confirma por eQSL (socio con autenticidad garantizada). eQSL no vale para el DXCC de la ARRL."));
})();
