/* ---- ACRACB 2.5.8: la capa «Predicción VOACAP» del mapa enseña la previsión pura ----
   Toda la plataforma usa la misma medida (VOACAP equilibrado con los clústeres), salvo esta capa y su ventana de destino,
   que muestran solo lo que dice VOACAP. Se engancha por dentro del dibujo diferido del mapa. */
(function(){
"use strict";
const pure=f=>{const w=function(){const on=typeof st!=="undefined"&&st.ly&&st.ly.voa;if(on)window.ACRACB_NOLIVE=true;try{return f.apply(this,arguments)}finally{if(on)window.ACRACB_NOLIVE=false}};w.__pure=1;return w};
function hook(){let ok=true;for(const n of ["drawMap","renderPop"]){const f=window[n];if(typeof f!=="function"){ok=false;continue}if(!f.__pure&&!f.__fast)window[n]=pure(f)}return ok}
let n=0;const t=setInterval(()=>{if(hook()||++n>40)clearInterval(t)},50);
})();

/* ---- ACRACB 2.4.3: botones del mapa sin retardo ----
   Al pulsar un botón del mapa, el botón cambia en el acto y el mapa se redibuja justo después, en el siguiente
   fotograma. Si se pulsan varios seguidos, se redibuja una sola vez con todo. */
(function(){
"use strict";
let inClick=false,pend=0,args=null;
document.addEventListener("click",e=>{const t=e.target;if(t&&t.closest&&t.closest('section[data-pg="mapa"]')&&!t.closest("#map")){inClick=true;setTimeout(()=>{inClick=false},0)}},true);
function hook(){const d=window.drawMap;if(typeof d!=="function")return false;if(d.__fast)return true;
  const w=function(){if(!inClick)return d.apply(this,arguments);args=arguments;if(pend)return;
    pend=requestAnimationFrame(()=>setTimeout(()=>{pend=0;const a=args;args=null;try{d.apply(null,a||[])}catch(e){console.error(e)}},0))};
  w.__fast=1;window.drawMap=w;return true}
/* se engancha el último, por fuera de los demás añadidos del mapa */
/* si otro añadido envuelve el mapa después, se vuelve a envolver: la capa interior deja pasar el dibujo diferido */
let n=0;const t=setInterval(()=>{n++;hook();if(n>60)clearInterval(t)},1000);
})();
/* ---- ACRACB 2.4.5: franja de valores de la portada en rejilla ----
   8, 4 o 2 columnas según el ancho real (incluido el tamaño de letra elegido): «Llamarada» ocupa dos casillas
   y así las filas quedan siempre completas, sin huecos. */
(function(){
"use strict";
function fit(el){const de=document.documentElement,z=parseFloat(getComputedStyle(de).zoom)||1,fs=parseFloat(getComputedStyle(de).fontSize)||16;const w=el.getBoundingClientRect().width/z/fs;if(!w)return;const c=w>=45?8:w>=19?4:2;if(el.dataset.cols!==String(c)){el.dataset.cols=c;el.style.setProperty("--swc",c)}}
function boot(){const el=document.getElementById("sw");if(!el)return setTimeout(boot,300);fit(el);
  try{new ResizeObserver(()=>fit(el)).observe(el);new MutationObserver(()=>fit(el)).observe(document.documentElement,{attributes:true,attributeFilter:["class","style"]})}catch(e){addEventListener("resize",()=>fit(el),{passive:true})}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
/* ---- ACRACB 2.4.5: rejillas equilibradas ----
   Las rejillas de casillas de valores (.kv) reparten las casillas en filas iguales: con 11 valores y sitio para 7,
   salen 6 + 5 en lugar de 7 + 4 con media fila vacía. Se recalcula al cambiar el ancho o el tamaño de letra. */
(function(){
"use strict";
const SEL=".kv,.glgrid";const W=new WeakMap();
function bal(el){const kids=[...el.children].filter(c=>c.getClientRects().length);const n=kids.length;if(n<2)return;
  const w=Math.round(el.getBoundingClientRect().width);const key=w+"|"+n+"|"+getComputedStyle(document.documentElement).fontSize;if(W.get(el)===key)return;W.set(el,key);
  el.style.gridTemplateColumns="";kids.forEach(k=>{if(k.dataset.balspan){k.style.gridColumn="";delete k.dataset.balspan}});
  const cmax=getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length||1;if(cmax>=n)return;
  let c=cmax;if(cmax>=2){const rows=Math.ceil(n/cmax);c=Math.ceil(n/rows);if(c<cmax)el.style.gridTemplateColumns=`repeat(${c},minmax(0,1fr))`}
  /* si en la última fila queda una sola casilla, ocupa la fila entera */
  if(c>=2&&n%c===1){const l=kids[n-1];l.style.gridColumn="1 / -1";l.dataset.balspan="1"}}
let raf=0;const all=()=>{raf=0;document.querySelectorAll(SEL).forEach(el=>{if(el.getClientRects().length)try{bal(el)}catch(e){}})};
const later=()=>{if(!raf)raf=requestAnimationFrame(all)};
function boot(){all();addEventListener("resize",later,{passive:true});
  try{new MutationObserver(ms=>{if(window.ACRACB_mut&&!ACRACB_mut(ms))return;later()}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  document.addEventListener("click",()=>setTimeout(later,60),true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
