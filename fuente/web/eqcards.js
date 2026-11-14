/* ---- ACRACB 2.1.12: tarjetas del mismo tamaño ----
   En las listas de varias columnas (clúster, actividad cercana, DXpediciones, objetivos) todas las tarjetas
   de la misma fila miden lo mismo: la altura de la más alta de esa fila. En una sola columna (móvil) cada una mide lo que necesita. */
(function(){
"use strict";
const LISTS="#spots,#near,.goal,.alc,.satl";
const CARD=":scope>.sp,:scope>.dx,:scope>.sc";
function cols(el){const t=getComputedStyle(el).gridTemplateColumns;return t&&t!=="none"?t.trim().split(/\s+/).length:1}
/* cada apartado (DX, POTA…) se iguala por separado: un título o una nota entre tarjetas empieza un grupo nuevo */
function groups(el){const out=[];let g=[];for(const c of el.children){if(c.matches(".sp,.dx,.sc")){if(c.getClientRects().length)g.push(c)}else if(g.length){out.push(g);g=[]}}if(g.length)out.push(g);return out}
function fit(){const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;document.querySelectorAll(LISTS).forEach(el=>{if(!el.getClientRects().length)return;
  const gs=groups(el);gs.flat().forEach(c=>c.style.minHeight="");if(cols(el)<2)return;
  /* 2.4.1: se igualan las tarjetas de la misma fila, no las de toda la lista: así ninguna queda medio vacía al desplegar «Mostrar más» */
  for(const cs of gs){if(cs.length<2)continue;const rows=new Map();cs.forEach(c=>{const k=Math.round(c.getBoundingClientRect().top);if(!rows.has(k))rows.set(k,[]);rows.get(k).push(c)});
    rows.forEach(r=>{if(r.length<2)return;const h=Math.max(...r.map(c=>c.getBoundingClientRect().height));r.forEach(c=>c.style.minHeight=Math.ceil(h/z)+"px")})}})}
let raf=0,busy=false;const later=()=>{if(raf||busy)return;raf=requestAnimationFrame(()=>{raf=0;busy=true;try{fit()}finally{busy=false}})};
function start(){fit();try{new MutationObserver(m=>{if(window.ACRACB_mut(m))later()}).observe(document.body,{childList:true,subtree:true})}catch(e){}addEventListener("resize",later,{passive:true});
  document.addEventListener("toggle",later,true);document.addEventListener("click",()=>setTimeout(later,60),true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
