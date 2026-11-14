/* ---- ACRACB: idioma (español / inglés de EE. UU.) ---- */
(function(){
"use strict";
const EN=window.ACRACB_LANG==="en";
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const WEB=!window.claude;const ESURL="./",ENURL="en.html",PUB="https://ea5jnf.github.io/plataforma-dx/";
/* quien eligió inglés entra directamente en inglés */
if(WEB&&!EN&&S.get("acracb_lang")==="en"&&!/[?&]es\b/.test(location.search)){location.replace(ENURL);return}
if(EN)S.set("acracb_lang","en");
/* ---------- inglés: nombres de entidades y regiones, y horas en formato de 24 h ---------- */
if(EN){
  const REG={"Canadá este (VE1-3)":"Eastern Canada (VE1-3)","Canadá oeste (VE7)":"Western Canada (VE7)","Rusia asiática centro (UA9)":"Central Asiatic Russia (UA9)","Rusia asiática este (UA0)":"Eastern Asiatic Russia (UA0)",
    "Brasil sureste (PY)":"Southeastern Brazil (PY)","Brasil nordeste (PY7)":"Northeastern Brazil (PY7)","Australia oeste (VK6)":"Western Australia (VK6)","Australia norte (VK8)":"Northern Australia (VK8)","Australia este (VK2-4)":"Eastern Australia (VK2-4)",
    "EE. UU. noreste (W1/W2)":"Northeastern USA (W1/W2)","EE. UU. sureste (W4)":"Southeastern USA (W4)","EE. UU. centro (W9/W0)":"Central USA (W9/W0)","EE. UU. sur (W5)":"Southern USA (W5)","EE. UU. oeste (W6/W7)":"Western USA (W6/W7)"};
  const enName=dx=>{try{const e=DXDg().d[dx];return e?e[1]:""}catch(x){return ""}};
  try{const cnt={};(V.meta||[]).forEach(m=>cnt[m[2]]=(cnt[m[2]]||0)+1);
    (V.meta||[]).forEach(m=>{if(REG[m[1]]){m[1]=REG[m[1]];return}const p=String(m[1]).match(/\(([^)]*)\)\s*$/);const n=enName(m[2]);if(n)m[1]=n+(p?` (${p[1]})`:"")})}catch(e){}
  try{dxName=function(dx){return enName(dx)}}catch(e){}
  /* las horas siempre en 24 h, como en la radio */
  try{const H=o=>o&&("hour" in o||"timeStyle" in o)&&!("hour12" in o)&&!("hourCycle" in o)?Object.assign({},o,{hourCycle:"h23"}):o;
    const t0=Date.prototype.toLocaleTimeString,s0=Date.prototype.toLocaleString;
    Date.prototype.toLocaleTimeString=function(l,o){return t0.call(this,l,Object.assign({hourCycle:"h23"},o||{}))};
    Date.prototype.toLocaleString=function(l,o){return s0.call(this,l,o?H(o):{hourCycle:"h23"})};
    const DTF=Intl.DateTimeFormat;Intl.DateTimeFormat=function(l,o){return new DTF(l,H(o))};Intl.DateTimeFormat.prototype=DTF.prototype;Intl.DateTimeFormat.supportedLocalesOf=DTF.supportedLocalesOf}catch(e){}
}
/* ---------- botón con la bandera, junto al de modo claro u oscuro ---------- */
function flag(cc){try{const f=DXDg().f[cc];return f?`<img alt="" width="22" height="15" src="data:image/svg+xml,${encodeURIComponent(f)}">`:cc}catch(e){return cc}}
function langBtn(){if(document.getElementById("langbtn"))return;const th=document.getElementById("thbtn");const host=th?th.parentElement:document.querySelector(".brow1 .clock");if(!host)return;
  const a=document.createElement("a");a.id="langbtn";a.className="thbtn langbtn";
  const to=EN?"es":"en";a.title=EN?"Ver en español":"View in English (US)";a.setAttribute("aria-label",a.title);a.setAttribute("hreflang",to);
  a.innerHTML=flag(EN?"US":"ES");
  if(WEB){a.href=EN?ESURL+"?es":ENURL;a.addEventListener("click",()=>S.set("acracb_lang",to))}
  else{a.href=PUB+(EN?"":"en.html");a.target="_blank";a.rel="noopener noreferrer";a.setAttribute("data-ext","")}
  if(th)host.insertBefore(a,th);else host.appendChild(a)}
function go(){langBtn();if(!document.getElementById("langbtn"))setTimeout(go,300)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(go,30));else setTimeout(go,30);
})();
