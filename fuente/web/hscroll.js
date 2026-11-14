/* ---- ACRACB 2.1.6: barras que se desplazan de lado (pestañas, modos, bandas…) ----
   - El difuminado del borde solo aparece en el lado donde queda algo por ver: al llegar al final, el último botón se ve entero.
   - Al redibujarse (al pulsar un botón o cada minuto), cada barra se queda donde la dejaste en vez de volver al principio. */
(function(){
"use strict";
const SEL=".nav,.ptabs,#subnav,#dxmodes,.clbands,.mleg,.almodes,.clseg";
const KEEP=new Set(["dxmodes","clbands","mleg","albands","almodes"]);/* la barra principal (.nav) ya centra la página activa por su cuenta */
const POS={},SEEN=new WeakSet();let busy=false;
const key=e=>e.id||(e.classList.contains("albands")?"albands":e.classList.contains("almodes")?"almodes":e.classList.contains("clbands")?"clbands":e.classList.contains("mleg")?"mleg":e.classList.contains("ptabs")?"ptabs":e.classList.contains("nav")?"nav":e.classList.contains("clseg")?"seg:"+(e.getAttribute("aria-label")||""):"");
function edges(e){const max=e.scrollWidth-e.clientWidth;const l=e.scrollLeft>2,r=max-e.scrollLeft>2;
  if(e.dataset.fl!==(l?"1":""))e.dataset.fl=l?"1":"";if(e.dataset.fr!==(r?"1":""))e.dataset.fr=r?"1":""}
function scan(){if(busy)return;busy=true;try{
  document.querySelectorAll(SEL).forEach(e=>{const k=key(e);if(!k)return;e.classList.add("hscr");
    if(!SEEN.has(e)){SEEN.add(e);e.addEventListener("scroll",()=>{if(KEEP.has(k)||k.startsWith("seg:"))POS[k]=e.scrollLeft;edges(e)},{passive:true})}
    if((KEEP.has(k)||k.startsWith("seg:"))&&POS[k]!=null&&Math.abs(e.scrollLeft-POS[k])>1&&e.scrollWidth>e.clientWidth)e.scrollLeft=Math.min(POS[k],e.scrollWidth-e.clientWidth);
    edges(e)})}finally{busy=false}}
let raf=0;const later=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;scan()})};
function start(){scan();try{new MutationObserver(ms=>{if(window.ACRACB_mut(ms))later()}).observe(document.body,{childList:true,subtree:true})}catch(e){}addEventListener("resize",later,{passive:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
