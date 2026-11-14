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
function sum(){const d=document.getElementById("stmore");if(!d)return;const out=[];
  const p=txt("eq").split(" · ")[0];if(p)out.push(p);
  const a=txt("antsel").replace(/\s*\(.*$/,"");if(a)out.push(a);
  const g=document.getElementById("gnd");if(g){const v=g.value;out.push(v==="rock"?T("suelo seco","dry ground"):v==="avg"?T("tierra normal","average ground"):v==="coast"?T("junto al mar","by the sea"):T("agua salada","salt water"))}
  const al=document.getElementById("altin");if(al&&al.value!=="")out.push(T("altitud ","altitude ")+al.value+" m");
  const b=txt("bandsel");out.push(document.getElementById("bandsel")&&document.getElementById("bandsel").value?b:T("todas las bandas","all bands"));
  d.querySelector(".stsum").textContent=out.join(" · ")}
function build(){if(document.getElementById("stmore"))return true;const box=document.querySelector(".hsel");if(!box||!document.getElementById("gnd"))return false;
  const parts=["bandsel","eq","antsel","altin","gnd"].map(grp).filter(Boolean);if(!parts.length)return false;
  const d=document.createElement("details");d.id="stmore";d.className="stmore";
  d.innerHTML=`<summary><span class="stt">${T("Tu estación","Your station")}</span> <span class="sto">${T("opcional","optional")}</span><span class="stsum"></span></summary><div class="hsel stin"></div><p class="note stnote">${T("Si no lo tocas, la previsión usa la estación del radioclub: 100 W, directiva de 3 elementos y dipolos de 80 y 160 m. Ajústalo a tu equipo para afinar el resultado.","If you leave it alone, the forecast uses the club station: 100 W, a 3-element Yagi and 80 and 160 m dipoles. Set it to your own equipment for a closer result.")}</p>`;
  const inner=d.querySelector(".stin");parts.forEach(p=>inner.appendChild(p));
  box.insertAdjacentElement("afterend",d);
  d.open=S.get("acracb_stmore")==="1";d.addEventListener("toggle",()=>S.set("acracb_stmore",d.open?"1":""));
  inner.addEventListener("change",sum);inner.addEventListener("input",sum);sum();setInterval(()=>{if(document.visibilityState==="visible")sum()},5000);return true}
function boot(){let n=0;const t=setInterval(()=>{if(build()||++n>50)clearInterval(t)},150)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
