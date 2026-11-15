/* ---- ACRACB 2.8.29: ¿confirma por LoTW? ----
   La lista pública de usuarios de Logbook of The World (ARRL) se copia cada semana en la propia web
   (datos/lotw/NN.txt, repartida en 64 trozos por indicativo). Junto al indicativo de cada spot y de cada
   DXpedición sale «LoTW» si esa estación ha subido su log en el último año, con la fecha de la última subida.
   Solo se descargan los trozos de los indicativos que hay en pantalla. */
(function(){
"use strict";
if(window.__hkLotw)return;window.__hkLotw=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const BASE=(()=>{try{return /^https?:$/.test(location.protocol)&&/ea5jnf\.github\.io$/.test(location.hostname)?new URL("datos/lotw/",location.href).href:null}catch(e){return null}})();
const H=c=>{let h=0;for(const ch of c)h=(h*31+ch.charCodeAt(0))%64;return h};
const SH=new Map(),ASK=new Set();
function load(k){if(SH.has(k)||ASK.has(k)||!BASE)return;ASK.add(k);
  fetch(BASE+String(k).padStart(2,"0")+".txt",{credentials:"omit",referrerPolicy:"no-referrer"}).then(r=>r.ok?r.text():"").then(t=>{const m=new Map();
    for(const l of t.split("\n")){const i=l.indexOf(" ");if(i>0)m.set(l.slice(0,i),l.slice(i+1).trim())}SH.set(k,m);later()}).catch(()=>{SH.set(k,new Map())})}
/* null: aún no se sabe · "": no sube a LoTW · "aammdd": fecha de su última subida */
function look(call){const c=String(call||"").toUpperCase().replace(/[^A-Z0-9/]/g,"");if(!c)return "";
  const cands=[c].concat(c.includes("/")?c.split("/").filter(x=>x.length>=3&&/\d/.test(x)).sort((a,b)=>b.length-a.length):[]);
  let pend=false;for(const x of cands){const k=H(x);if(!SH.has(k)){load(k);pend=true;continue}const v=SH.get(k).get(x);if(v)return v}return pend?null:""}
const fmt=v=>{const d=new Date(Date.UTC(2000+ +v.slice(0,2),+v.slice(2,4)-1,+v.slice(4,6)));return {d,txt:d.toLocaleDateString(EN()?"en-US":"es-ES",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"})}};
function deco(){if(!BASE)return;document.querySelectorAll(".sc-call .stc[data-stc]:not([data-lotw])").forEach(el=>{const v=look(el.dataset.stc);if(v===null)return;el.dataset.lotw=v?"1":"0";if(!v)return;
  const f=fmt(v),days=Math.round((Date.now()-f.d)/864e5),old=days>90;const s=document.createElement("span");s.className="lotwt"+(old?" old":"");s.textContent="LoTW";s.setAttribute("role","note");
  s.title=T(`Confirma por LoTW. Última subida de su log: ${f.txt} (hace ${days} días).`,`Confirms via LoTW. Last log upload: ${f.txt} (${days} days ago).`);
  s.setAttribute("aria-label",s.title);el.insertAdjacentElement("afterend",s)})}
let q=0;function later(){if(q)return;q=setTimeout(()=>{q=0;try{deco()}catch(e){}},250)}
window.ACRACB_lotw=look;
function boot(){later();try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true})}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
