/* ---- ACRACB 2.5.8: la capa «Predicción VOACAP» del mapa enseña la previsión pura ----
   Toda la plataforma usa la misma medida (VOACAP equilibrado con los clústeres), salvo esta capa y su ventana de destino,
   que muestran solo lo que dice VOACAP. Se engancha por dentro del dibujo diferido del mapa. */
(function(){
"use strict";
const pure=f=>{const w=function(){const on=typeof st!=="undefined"&&st.ly&&st.ly.voa;if(on)window.ACRACB_NOLIVE=true;try{return f.apply(this,arguments)}finally{if(on)window.ACRACB_NOLIVE=false}};w.__pure=1;return w};
function hook(){const f=window.renderPop;if(typeof f!=="function")return false;if(window.__hkPurePop)return true;window.__hkPurePop=1;window.renderPop=pure(f);return true}
let n=0;const t=setInterval(()=>{if(hook()||++n>40)clearInterval(t)},50);
})();

/* ---- ACRACB 2.4.3: botones del mapa sin retardo ----
   Al pulsar un botón del mapa, el botón cambia en el acto y el mapa se redibuja justo después, en el siguiente
   fotograma. Si se pulsan varios seguidos, se redibuja una sola vez con todo. */
(function(){
"use strict";
let inClick=false,pend=0,args=null;
document.addEventListener("click",e=>{const t=e.target;if(t&&t.closest&&t.closest('section[data-pg="mapa"]')&&!t.closest("#map")){inClick=true;setTimeout(()=>{inClick=false},0)}},true);
function hook(){return true;const d=window.drawMap;if(typeof d!=="function")return false;if(d.__fast)return true;
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

/* ---- 2.8.23: «Ver en el mapa» desde una estación o un destino ----
   Va al mapa, encuadra con zoom tu QTH y la estación, traza la ruta entre los dos y marca la estación.
   No abre la tarjeta de información: quien pulsa ya viene de verla. */
(function(){
"use strict";
let FOC=null,hooked=false;
function posFor(call,t){try{if(call){const C=String(call).toUpperCase();
    const s=(L.spots||[]).find(x=>String(x.call||"").toUpperCase()===C&&Array.isArray(x.dx)&&x.dx.length===2&&x.dx[0]!=null);if(s)return s.dx;
    const d=(L.dx||[]).find(x=>String(x.call||"").toUpperCase().split(/[ ,]+/).includes(C)&&isFinite(x.lon)&&isFinite(x.lat));if(d)return [d.lon,d.lat];
    const a=window.ACRACB_areaPos&&ACRACB_areaPos(C);if(a&&a.length===2)return a}}catch(e){}
  if(t&&isFinite(t.lon)&&isFinite(t.lat))return [t.lon,t.lat];return null}
function proj(){const el=document.getElementById("map");if(!el||typeof d3==="undefined")return null;
  const vb=(el.getAttribute("viewBox")||"0 0 900 900").trim().split(/\s+/).map(Number),W=vb[2]||900,H=vb[3]||900;
  return {W,H,pr:d3.geoAzimuthalEquidistant().rotate([-TXP[0],-TXP[1]]).fitExtent([[8,8],[W-8,H-8]],{type:"Sphere"}).precision(.4)}}
function sizes(){if(!ZROOT)return;const k=(ZT&&ZT.k)||1;ZROOT.selectAll("g.mfocus .mfdot").attr("r",7/k);ZROOT.selectAll("g.mfocus .mfpulse").attr("r",16/k);
  ZROOT.selectAll("g.mfocus .mflbl").attr("font-size",14/k).attr("stroke-width",4/k).each(function(){const t=d3.select(this);t.attr("x",+t.attr("data-x")+10/k).attr("y",+t.attr("data-y")-10/k)})}
function draw(zoom){if(!FOC||typeof ZROOT==="undefined"||!ZROOT)return;const P=proj();if(!P)return;const {pr,W,H}=P,path=d3.geoPath(pr),line={type:"LineString",coordinates:[TXP,FOC.p]};
  ZROOT.selectAll("g.mfocus").remove();const g=ZROOT.append("g").attr("class","mfocus");
  g.append("path").attr("class","mfroute").attr("d",path(line));const b=pr(FOC.p);if(!b)return;
  g.append("circle").attr("class","mfpulse").attr("cx",b[0]).attr("cy",b[1]).attr("r",16);
  g.append("circle").attr("class","mfdot").attr("cx",b[0]).attr("cy",b[1]).attr("r",7);
  if(FOC.lbl)g.append("text").attr("class","mflbl").attr("data-x",b[0]).attr("data-y",b[1]).attr("x",b[0]+10).attr("y",b[1]-10).text(FOC.lbl);
  if(ZM&&!hooked){hooked=true;ZM.on("zoom.mfocus",sizes)}
  sizes();
  if(zoom&&ZM&&ZSVG){const bb=path.bounds(line),x0=bb[0][0],y0=bb[0][1],x1=bb[1][0],y1=bb[1][1];
    const dx=Math.max(60,x1-x0),dy=Math.max(60,y1-y0),k=Math.max(1,Math.min(10,.72*Math.min(W/dx,H/dy))),cx=(x0+x1)/2,cy=(y0+y1)/2;
    const tr=d3.zoomIdentity.translate(W/2-k*cx,H/2-k*cy).scale(k);
    const red=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;(red?ZSVG:ZSVG.transition().duration(600)).call(ZM.transform,tr)}}
window.ACRACB_mapFocus=function(o){try{const t=o&&o.id?T(o.id):null,p=(o&&o.p)||posFor(o&&o.call,t);if(!p)return false;
    FOC={p,lbl:(o&&o.call)||(t?String(t.name).split(" (")[0]:"")};
    st.pop=null;const mp=document.getElementById("mpop");if(mp)mp.hidden=true;try{if(typeof closeCall==="function")closeCall()}catch(e){}
    if(!st.mapOn)st.mapOn=true;
    if(st.page!=="mapa")go("mapa");
    let n=0;const tryDraw=()=>{n++;if(typeof ZROOT!=="undefined"&&ZROOT&&document.getElementById("map")&&document.getElementById("map").querySelector("g.zroot"))draw(true);else if(n<30)setTimeout(tryDraw,100)};setTimeout(tryDraw,150);return true}
  catch(e){console.error(e);return false}};
/* el mapa se redibuja a menudo: la ruta se vuelve a poner sola; se quita al dejar la página del mapa */
function watch(){const el=document.getElementById("map");if(!el)return setTimeout(watch,500);
  new MutationObserver(()=>{if(FOC&&!el.querySelector("g.mfocus"))setTimeout(()=>draw(false),0)}).observe(el,{childList:true});
  setInterval(()=>{if(FOC&&st.page!=="mapa")FOC=null},2000)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",watch);else watch();
})();
