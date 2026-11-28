/* ---- ACRACB 2.10.37: trucos de concurso a tu medida ----
   En Concursos › Trucos se elige la categoría con la que participas (monooperador, asistido o multioperador), la potencia
   (QRP, Low Power o High Power), si vas a todas las bandas o a una sola y, en los concursos con varios modos, el modo. Los trucos
   se arman con tres piezas: las reglas de ese concurso (las de siempre), las de tu categoría y potencia, y las de tu modo.
   Lo que depende de las bases de cada concurso se dice así, y se remite a ellas. */
(function(){
"use strict";
if(window.__hkCTR)return;window.__hkCTR=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const K="acracb_ctcat";
function pwDef(){try{const w=parseFloat(String(PWN()).replace(",","."));if(w<=5)return "qrp";if(w>100)return "hp"}catch(_){}return "lp"}
function get(){let o={};try{o=JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(_){}return {op:o.op||"so",pw:o.pw||pwDef(),bd:o.bd!=null?String(o.bd):"all",md:o.md||""}}
function put(o){try{localStorage.setItem(K,JSON.stringify(o))}catch(_){}}
/* jugadas propias del LZ DX: las reglas ya las explica el párrafo de arriba, aquí solo lo que hacer con ellas */
const LZ=[["Las estaciones búlgaras valen más que nada: búscalas en cada banda que abra.","Bulgarian stations are worth more than anything: look for them on every band that opens."],
  ["Si haces CW y SSB, vuelve a trabajar a los mismos en el otro modo: el QSO vuelve a contar.","If you do CW and SSB, work the same stations again on the other mode: the QSO counts again."],
  ["Los multiplicadores solo cuentan una vez por banda: muévelos de banda, no de modo.","Multipliers count only once per band: move them across bands, not modes."]];
function catTips(o,c){const L=[],a=(es,en)=>L.push(T(es,en));
  if(o.op==="so"){a("Monooperador sin asistencia: en la mayoría de concursos, usar el clúster, el Reverse Beacon o un Skimmer te pasa a la categoría asistida. Compruébalo en las bases.","Unassisted single operator: in most contests, using the cluster, the Reverse Beacon or a Skimmer moves you to the assisted category. Check the rules.");
    a("Sin clúster, los multiplicadores se buscan girando el dial: recorre la banda de punta a punta cada vez que cambies.","Without the cluster, multipliers are found by tuning: sweep the band end to end every time you change.")}
  if(o.op==="soa"){a("Asistido: el clúster te dice dónde están los multiplicadores; DX › Clúster te los marca. Nunca te anuncies tú mismo.","Assisted: the cluster tells you where the multipliers are; DX › Cluster marks them for you. Never spot yourself.");
    a("No persigas cada spot: si la cola es larga, vuelve a llamar CQ y deja el multiplicador para cuando baje.","Do not chase every spot: if the pile-up is long, go back to calling CQ and leave the multiplier for later.")}
  if(o.op==="multi"){a("Multioperador: uno llama CQ sin parar y otro busca multiplicadores. Cada categoría limita los cambios de banda (en el CQ WW, multi-single, 10 minutos en una banda antes de cambiar): compruébalo en las bases.","Multi-operator: one operator runs CQ and another hunts multipliers. Each category limits band changes (in CQ WW multi-single, 10 minutes on a band before changing): check the rules.");
    a("Turnos de 2 a 4 horas y el plan de bandas de arriba a la vista de todos.","Shifts of 2 to 4 hours, with the band plan above in view for everyone.")}
  if(o.op!=="multi"&&c.so)a(`Como monooperador puedes operar ${c.so} de las ${c.h} h: abajo tienes las mejores horas para las pausas.`,`As a single operator you can operate ${c.so} of the ${c.h} hours: the best times for your breaks are below.`);
  if(o.pw==="qrp"){a("QRP (5 W o menos): busca tú (S&P) más que llamar CQ, y aprovecha las primeras horas de cada apertura, cuando aún no hay colas.","QRP (5 W or less): search and pounce rather than calling CQ, and use the first hours of each opening, before the pile-ups.");
    a("Llama justo cuando la otra estación termina el QSO anterior y repite tu indicativo completo una sola vez.","Call right as the other station finishes the previous QSO and give your full callsign once.")}
  if(o.pw==="lp")a("Low Power (hasta 100 W): llama CQ en las bandas altas cuando estén abiertas y busca tú en las bajas, donde manda la potencia.","Low Power (up to 100 W): call CQ on the high bands when they are open and search and pounce on the low bands, where power rules.");
  if(o.pw==="hp")a("High Power (más de 100 W): ocupa una frecuencia pronto y no la sueltes; en las bandas bajas, de noche, es donde más diferencia marca.","High Power (over 100 W): claim a frequency early and hold it; the low bands at night are where it makes the biggest difference.");
  if(o.bd!=="all"){const b=+o.bd;a(`Monobanda en ${BANDS[b]}: todos los multiplicadores tienen que salir de esa banda. Llama CQ en cuanto abra y aprovecha la línea gris en los extremos de la apertura.`,`Single band on ${BANDS[b]}: every multiplier has to come from that band. Call CQ as soon as it opens and use the greyline at the edges of the opening.`)}
  return L}
function modeTips(m){const L=[],a=(es,en)=>L.push(T(es,en));
  if(m==="ssb"){a("SSB: di tu indicativo con el alfabeto fonético internacional, siempre igual, y el intercambio de una vez, sin adornos.","SSB: give your callsign in the international phonetic alphabet, always the same way, and the exchange in one go, without extras.");
    a("Graba el CQ en la memoria del equipo o del programa: tu voz te durará todo el concurso.","Record your CQ in the radio or logging program memory: your voice will last the whole contest.")}
  if(m==="cw"){a("CW: si llamas CQ, el Reverse Beacon te anuncia solo en los clústeres; una frecuencia limpia y un CQ corto atraen colas.","CW: if you call CQ, the Reverse Beacon spots you automatically on the clusters; a clear frequency and a short CQ attract pile-ups.");
    a("Ajusta la velocidad a la de quien te llama: si contesta despacio, baja tú también.","Match the speed of whoever calls you: if they answer slowly, slow down too.")}
  if(m==="rtty"){a("RTTY: macros cortas, con el indicativo dos veces solo en el CQ, y doble descodificador si tu programa lo permite.","RTTY: short macros, with your callsign twice only in the CQ, and a second decoder if your program allows it.")}
  return L}
function ui(o,c){const opt=(k,v,on,tx)=>`<button type="button" role="radio" aria-checked="${on}" data-ctc="${k}:${v}">${tx}</button>`;
  const ms=(c.modes||[]).length>1?`<div class="ctg"><span class="ctl">${T("Modo","Mode")}</span><div class="ctseg" role="radiogroup">${c.modes.map(m=>opt("md",m,o.md===m,m.toUpperCase())).join("")}${opt("md","mix",o.md==="mix",T("Los dos","Both"))}</div></div>`:"";
  const bs=(c.bands||[]).length>1?`<div class="ctg"><span class="ctl">${T("Bandas","Bands")}</span><select data-ctb aria-label="${T("Bandas","Bands")}"><option value="all"${o.bd==="all"?" selected":""}>${T("Todas","All")}</option>${c.bands.map(b=>`<option value="${b}"${String(b)===o.bd?" selected":""}>${T("Solo","Only")} ${BANDS[b]}</option>`).join("")}</select></div>`:"";
  return `<div class="ctcat" aria-label="${T("Cómo participas","How you take part")}"><p class="cth">${T("Cómo participas","How you take part")}</p>
   <div class="ctg"><span class="ctl">${T("Categoría","Category")}</span><div class="ctseg" role="radiogroup">${opt("op","so",o.op==="so",T("Mono","Single"))}${opt("op","soa",o.op==="soa",T("Asistido","Assisted"))}${opt("op","multi",o.op==="multi",T("Multi","Multi"))}</div></div>
   <div class="ctg"><span class="ctl">${T("Potencia","Power")}</span><div class="ctseg" role="radiogroup">${opt("pw","qrp",o.pw==="qrp","QRP")}${opt("pw","lp",o.pw==="lp","Low Power")}${opt("pw","hp",o.pw==="hp","High Power")}</div></div>
   ${ms}${bs}</div>`}
function paint(){const box=document.getElementById("tricks");if(!box||!box.innerHTML)return;let c=null,key="";try{c=CT();key=document.getElementById("contest").value}catch(_){return}if(!c)return;
  const o=get();if((c.modes||[]).length>1){if(!o.md||(o.md!=="mix"&&!c.modes.includes(o.md))){let m="";try{m=MOD()}catch(_){}o.md=c.modes.includes(m)?m:c.modes[0]}}else o.md=(c.modes||[""])[0];
  if(o.bd!=="all"&&!(c.bands||[]).includes(+o.bd))o.bd="all";
  const ul=box.querySelector(":scope > ul");if(!ul)return;
  let base=[];try{base=(TRICKS[key]||TRICKS[c.base]||[]).slice()}catch(_){}
  if(key==="lzdx")base=LZ.map(x=>T(x[0],x[1]));
  const mt=o.md==="mix"?c.modes.flatMap(modeTips):modeTips(o.md);
  const grp=(t,arr)=>arr.length?`<li class="ctgh">${t}</li>`+arr.map(x=>`<li>${x}</li>`).join(""):"";
  const html=grp(T("De este concurso","For this contest"),base)+grp(T("Para tu categoría y potencia","For your category and power"),catTips(o,c))+grp(T("Para tu modo","For your mode"),mt);
  let cat=box.querySelector(".ctcat");const nu=ui(o,c);if(cat)cat.outerHTML=nu;else ul.insertAdjacentHTML("beforebegin",nu);
  ul.classList.add("ctul");ul.innerHTML=html+`<li class="ctnote">${T("Las reglas cambian de un año a otro: confírmalas en las bases de este año antes de empezar.","Rules change from year to year: confirm them in this year's rules before you start.")}</li>`}
function hook(){if(typeof renderContest!=="function")return setTimeout(hook,300);const r0=renderContest;renderContest=function(){const v=r0.apply(this,arguments);try{paint()}catch(e){console.error(e)}return v};try{paint()}catch(e){}}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-ctc]");if(!b)return;const [k,v]=b.dataset.ctc.split(":");const o=get();o[k]=v;put(o);try{paint()}catch(e){}});
document.addEventListener("change",ev=>{const s=ev.target;if(!s.matches||!s.matches("[data-ctb]"))return;const o=get();o.bd=s.value;put(o);try{paint()}catch(e){}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hook);else hook();
})();
