/* ---- ACRACB 2.10.35: la estación, a un toque ----
   En la línea de la estación, el modo, la banda, la potencia y la antena se cambian tocándolos: se abre directamente el selector
   del propio aparato (la rueda en el iPhone y el iPad, la lista en Android y en el ordenador), sin desplegar el panel entero.
   Lo demás (locator, suelo, alturas, coaxial…) sigue en «Editar estación», y tocar el locator lo abre como antes. */
(function(){
"use strict";
if(window.__hkQS)return;window.__hkQS=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $i=id=>document.getElementById(id);
/* una pieza tocable: el texto que se ve y, encima, invisible, una copia del selector real */
function seg(id,label){const s=$i(id);if(!s)return e2(label);
  return `<span class="qs" data-qs="${id}">${e2(label)}<span class="qsc" aria-hidden="true">▾</span><select data-qsel="${id}" aria-label="${e2(s.getAttribute("aria-label")||label)}">${s.innerHTML}</select></span>`}
function sum(){const e=$i("ssum");if(!e)return false;let loc="",md="",h=null,pw="",an="";
  try{loc=String($i("loc").value||"").slice(0,6);md=MD().s;h=HB();const p=PWN().split(" ");pw=p[0]+" "+p[1];an=ANTL()}catch(_){return false}
  e.innerHTML=`<b>${e2(loc)}</b> · ${seg("modesel",md)} · ${seg("bandsel",h!=null?BANDS[h]:T("Todas las bandas","All bands"))} · ${seg("eq",pw)} · ${seg("antsel",an)}`+
    (st.mode==="contest"?` · <b>${T("Concursos","Contests")}</b>`:"");
  e.querySelectorAll("select[data-qsel]").forEach(c=>{const s=$i(c.dataset.qsel);if(s)c.value=s.value});
  return true}
/* el resumen de la base se sustituye por el tocable, con los mismos datos */
function hook(){if(typeof renderSum!=="function"||!$i("ssum"))return setTimeout(hook,300);
  const r0=renderSum;renderSum=function(){const v=r0.apply(this,arguments);try{sum()}catch(e){console.error(e)}return v};
  try{sum()}catch(e){}}
/* tocar una pieza abre su selector y no el panel entero */
["click","keydown","pointerdown"].forEach(ev=>document.addEventListener(ev,e=>{if(e.target.closest&&e.target.closest("#ssum select[data-qsel]"))e.stopPropagation()},true));
document.addEventListener("change",e=>{const c=e.target;if(!c.matches||!c.matches("#ssum select[data-qsel]"))return;e.stopPropagation();
  const s=$i(c.dataset.qsel);if(!s||s.value===c.value)return;s.value=c.value;s.dispatchEvent(new Event("change",{bubbles:true}));
  setTimeout(()=>{try{sum()}catch(_){}},60)},true);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hook);else hook();
})();
