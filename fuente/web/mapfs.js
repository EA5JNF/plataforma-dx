/* ---- ACRACB 2.4: mapa a pantalla completa sin estorbar ----
   Los paneles (controles y leyenda) son translúcidos y, tras 4 segundos sin tocar nada, se apartan casi del todo
   para dejar ver el mapa azimutal entero. Vuelven al mover el ratón, tocar la pantalla o usar el teclado,
   y no se apartan mientras el ratón está encima de ellos. */
(function(){
"use strict";
let tm=null;
function card(){return document.getElementById("mapcard")}
function wake(){const c=card();if(!c)return;if(c.classList.contains("idle"))c.classList.remove("idle");clearTimeout(tm);if(!c.classList.contains("fsm"))return;
  tm=setTimeout(()=>{const c2=card();if(!c2||!c2.classList.contains("fsm"))return;if(c2.querySelector(".mapctl:hover,.legend:hover,.mfloat:hover,.mpop:not([hidden])"))return wake();
    const a=document.activeElement;if(a&&c2.contains(a)&&/^(INPUT|SELECT)$/.test(a.tagName))return wake();c2.classList.add("idle")},4000)}
function boot(){const c=card();if(!c)return setTimeout(boot,400);
  ["mousemove","pointerdown","touchstart","keydown","wheel"].forEach(ev=>c.addEventListener(ev,wake,{passive:true}));
  /* solo interesa cuando entra o sale de pantalla completa (no los cambios de «idle», que harían un bucle) */
  let fs=c.classList.contains("fsm");try{new MutationObserver(()=>{const f=c.classList.contains("fsm");if(f!==fs){fs=f;wake()}}).observe(c,{attributes:true,attributeFilter:["class"]})}catch(e){}wake()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
/* ---- 2.4.1: botones del mapa al instante ----
   Al pulsar un botón, el botón se marca enseguida y el mapa se redibuja en el siguiente fotograma; si se pulsan
   varios seguidos, se redibuja una sola vez. Fuera de los clics, el mapa se dibuja igual que siempre. */
(function(){
"use strict";
function wrap(){const o=window.drawMap;if(typeof o!=="function")return false;if(o.__ok)return true;
  if(!(window.ACRACB_mapfino&&window.ACRACB_iss)||!(o.__iss||o.__fino))return false;/* espera a que estén puestos los demás añadidos del mapa */
  let pend=false;const w=function(){const ev=window.event;if(ev&&(ev.type==="click"||ev.type==="change"||ev.type==="input")){if(!pend){pend=true;requestAnimationFrame(()=>{pend=false;try{o()}catch(e){}})}return}return o.apply(this,arguments)};
  w.__ok=1;w.__iss=1;w.__fino=1;window.drawMap=w;return true}
let n=0;const t=setInterval(()=>{if(wrap()||++n>100)clearInterval(t)},300);
})();
