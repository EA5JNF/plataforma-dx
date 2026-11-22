/* ---- ACRACB 2.2.1: «Tu estación» plegada ----
   A la vista solo quedan el locator y el modo, que es lo que más cambia la previsión. Banda, potencia, antena,
   altitud y entorno pasan a un desplegable cerrado con valores por defecto razonables; cerrado enseña un resumen
   en una línea. Se recuerda si lo dejaste abierto. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const grp=id=>{const e=document.getElementById(id);return e?e.closest(".grp"):null};
const txt=id=>{const e=document.getElementById(id);if(!e)return "";const o=e.options&&e.options[e.selectedIndex];return o?o.textContent.trim():""};
/* 2.11.4: modo, banda, potencia y antena se eligen en la línea de la estación (botones con menú); aquí no se repiten.
   Sus selectores siguen en la página, guardados y ocultos, porque son los que leen los cálculos y los menús.
   Aquí quedan solo la altitud y el entorno, y el resumen enseña solo eso. */
function sum(){const d=document.getElementById("stmore");if(!d)return;const out=[];
  const g=document.getElementById("gnd");if(g){const v=g.value;out.push(v==="rock"?T("suelo seco","dry ground"):v==="avg"?T("tierra normal","average ground"):v==="coast"?T("junto al mar","by the sea"):T("agua salada","salt water"))}
  const al=document.getElementById("altin");if(al&&al.value!=="")out.push(T("altitud ","altitude ")+al.value+" m");
  const n=d.querySelector(".stnote"),an=document.getElementById("antsel"),eq=document.getElementById("eq");if(n)n.hidden=!!(an&&eq&&(an.value!=="club"||eq.value!=="100"));
  {const e=d.querySelector(".stsum"),v=out.join(" · ");if(e._v!==v){e._v=v;e.textContent=v}}}
function build(){if(document.getElementById("stmore"))return true;const box=document.querySelector(".hsel");if(!box||!document.getElementById("gnd"))return false;
  const parts=["altin","gnd"].map(grp).filter(Boolean);if(!parts.length)return false;
  const keep=document.createElement("div");keep.className="stkeep";keep.hidden=true;["modesel","bandsel","eq","antsel"].map(grp).filter(Boolean).forEach(g=>keep.appendChild(g));
  const d=document.createElement("details");d.id="stmore";d.className="stmore";
  d.innerHTML=`<summary><span class="stt">${T("Tu estación","Your station")}</span> <span class="sto">${T("altitud y entorno","altitude and surroundings")}</span><span class="stsum"></span></summary><div class="hsel stin"></div><p class="note stnote">${T("Si no lo tocas, la previsión usa la estación del radioclub: 100 W, directiva de 3 elementos y dipolos de 80 y 160 m. Ajústalo a tu equipo para afinar el resultado.","If you leave it alone, the forecast uses the club station: 100 W, a 3-element Yagi and 80 and 160 m dipoles. Set it to your own equipment for a closer result.")}</p>`;
  const inner=d.querySelector(".stin");parts.forEach(p=>inner.appendChild(p));
  box.insertAdjacentElement("afterend",d);d.insertAdjacentElement("afterend",keep);
  d.open=S.get("acracb_stmore")==="1";d.addEventListener("toggle",()=>S.set("acracb_stmore",d.open?"1":""));
  inner.addEventListener("change",sum);inner.addEventListener("input",sum);keep.addEventListener("change",sum);sum();setInterval(()=>{if(document.visibilityState==="visible")sum()},5000);return true}
function boot(){let n=0;const t=setInterval(()=>{if(build()||++n>50)clearInterval(t)},150)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
