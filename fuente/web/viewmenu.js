/* ---- ACRACB 2.10.35: menú «Vista» ----
   Antes había dos botones de solo icono en la cabecera (completa/compacta y tarjetas/lista): no se sabía cuál era cuál
   ni en qué estado estaban, y al cambiar solo se redibujaba el clúster (el resto seguía igual hasta la siguiente
   actualización) y la página saltaba. Ahora es un único botón «Vista» que abre un menú con texto:
     Detalle: Completa | Compacta        Estaciones: Tarjetas | Lista
   Al elegir se redibuja todo a la vez y la página se queda donde estabas. */
(function(){
"use strict";
if(window.__hkVM)return;window.__hkVM=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const IC_CARDS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/></svg>';
const IC_LIST='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>';
const isC=()=>{try{return ACRACB_view()==="compact"}catch(e){return false}},isL=()=>{try{return !!ACRACB_list()}catch(e){return false}};
function label(){return (isC()?T("Compacta","Compact"):T("Completa","Full"))+" · "+(isL()?T("Lista","List"):T("Tarjetas","Cards"))}
function paintBtn(){const b=document.getElementById("viewbtn");if(!b)return;b.innerHTML=(isL()?IC_LIST:IC_CARDS)+`<span class="vbt">${T("Vista","View")}</span>`;
  b.classList.toggle("vbon",isC()||isL());b.title=T("Vista: ","View: ")+label()+T(" (pulsa para cambiarla)"," (tap to change)");b.setAttribute("aria-label",b.title)}
function menuHTML(){const opt=(k,v,on,tx)=>`<button type="button" role="radio" aria-checked="${on}" data-vm="${k}:${v}">${tx}</button>`;
  return `<p class="vmh">${T("Cómo se ve la plataforma","How the platform looks")}</p>
  <div class="vmg"><span class="vml" id="vml1">${T("Detalle","Detail")}</span><div class="vmseg" role="radiogroup" aria-labelledby="vml1">${opt("view","full",!isC(),T("Completa","Full"))}${opt("view","compact",isC(),T("Compacta","Compact"))}</div>
  <small>${isC()?T("Lo esencial de un vistazo, sin explicaciones.","The essentials at a glance, without explanations."):T("Todo, con sus explicaciones y desplegables.","Everything, with its explanations and folds.")}</small></div>
  <div class="vmg"><span class="vml" id="vml2">${T("Estaciones","Stations")}</span><div class="vmseg" role="radiogroup" aria-labelledby="vml2">${opt("list","0",!isL(),T("Tarjetas","Cards"))}${opt("list","1",isL(),T("Lista","List"))}</div>
  <small>${isL()?T("Una fila por estación, como un clúster web. Toca una fila para ver sus detalles.","One row per station, like a web cluster. Tap a row to see its details."):T("Una tarjeta por estación, con todos sus datos.","One card per station, with all its data.")}</small></div>`}
function place(m,b){const r=b.getBoundingClientRect(),vw=document.documentElement.clientWidth;const w=Math.min(340,vw-16);m.style.width=w+"px";
  let x=r.right-w;if(x<8)x=8;if(x+w>vw-8)x=vw-8-w;m.style.left=x+"px";m.style.top=(r.bottom+6)+"px"}
function open(){const b=document.getElementById("viewbtn");if(!b)return;let m=document.getElementById("viewmenu");
  if(!m){m=document.createElement("div");m.id="viewmenu";m.className="viewmenu";m.setAttribute("role","dialog");document.body.appendChild(m)}
  m.setAttribute("aria-label",T("Vista","View"));m.innerHTML=menuHTML();m.hidden=false;place(m,b);b.setAttribute("aria-expanded","true");
  const f=m.querySelector('[aria-checked="true"]');if(f)try{f.focus({preventScroll:true})}catch(e){}}
function close(){const m=document.getElementById("viewmenu");if(m)m.hidden=true;const b=document.getElementById("viewbtn");if(b)b.setAttribute("aria-expanded","false")}
/* redibujar todo y dejar la página donde estaba: se toma como referencia la primera sección visible */
function reflow(){const tops=[...document.querySelectorAll("details.fold,.card,section.page")].filter(e=>e.getClientRects().length);
  const ref=tops.find(e=>e.getBoundingClientRect().bottom>90),y0=ref?ref.getBoundingClientRect().top:0;
  try{CACHE.clear()}catch(e){}try{refresh()}catch(e){}try{window.ACRACB_clrender&&ACRACB_clrender()}catch(e){}try{renderAlerts()}catch(e){}try{window.renderAlBar&&renderAlBar()}catch(e){}
  if(ref)requestAnimationFrame(()=>{const d=ref.getBoundingClientRect().top-y0;if(Math.abs(d)>2)window.scrollBy(0,d)})}
function btn(){if(document.getElementById("viewbtn"))return true;const z=document.getElementById("zoombtn");if(!z)return false;
  const b=document.createElement("button");b.id="viewbtn";b.type="button";b.className="thbtn viewbtn vbtn";b.setAttribute("aria-haspopup","dialog");b.setAttribute("aria-expanded","false");
  z.parentElement.insertBefore(b,z);paintBtn();
  b.addEventListener("click",ev=>{ev.stopPropagation();const m=document.getElementById("viewmenu");if(m&&!m.hidden)close();else open()});return true}
document.addEventListener("click",ev=>{const t=ev.target;if(!t.closest)return;const o=t.closest("#viewmenu [data-vm]");
  if(o){const [k,v]=o.dataset.vm.split(":");if(k==="view")ACRACB_view(v);else ACRACB_list(v==="1");paintBtn();
    const m=document.getElementById("viewmenu");if(m){m.innerHTML=menuHTML();const f=m.querySelector(`[data-vm="${k}:${v}"]`);if(f)try{f.focus({preventScroll:true})}catch(e){}}
    reflow();return}
  if(!t.closest("#viewmenu")&&!t.closest("#viewbtn"))close()});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"){const m=document.getElementById("viewmenu");if(m&&!m.hidden){close();const b=document.getElementById("viewbtn");b&&b.focus()}}});
["resize","scroll"].forEach(e=>window.addEventListener(e,()=>{const m=document.getElementById("viewmenu"),b=document.getElementById("viewbtn");if(m&&!m.hidden&&b)place(m,b)},{passive:true}));
(function tryB(n){if(!btn()&&n<40)setTimeout(()=>tryB(n+1),150)})(0);
})();
