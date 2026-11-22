/* ---- ACRACB 2.11.46: concursos en el aire que no puntúan desde EA ----
   Grandes concursos nacionales de otros países que llenan las bandas aunque desde España no se pueda participar.
   Así se entiende por qué de repente hay tantas estaciones de un país llamando CQ.
   - En Concursos, una tarjeta con sus fechas (en hora española) y qué significan para nosotros.
   - Mientras uno está en marcha, una línea de aviso bajo el buscador del clúster.
   Solo fechas comprobadas en las bases oficiales (arrl.org/sweepstakes). */
(function(){
"use strict";
if(window.__hkCtFor)return;window.__hkCtFor=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const $=id=>document.getElementById(id);
/* fines de semana completos (sábado y domingo del mismo mes), como en el resto de la plataforma */
function fullWk(y,m){const r=[];for(let d=1;d<=31;d++){const dt=new Date(Date.UTC(y,m-1,d));if(dt.getUTCMonth()!==m-1)break;if(dt.getUTCDay()===6){const su=new Date(Date.UTC(y,m-1,d+1));if(su.getUTCMonth()===m-1)r.push(dt)}}return r}
/* ventana UTC: del sábado a las «ini» (horas UTC) a las «fin» (minutos desde el sábado 00:00 UTC) */
const LIST=[
  {id:"sscw",n:"ARRL November Sweepstakes · CW",m:11,wk:0,ini:21*60,fin:(2*24+2)*60+59,
   who:["Solo entre estaciones de EE. UU. y Canadá","Only between US and Canadian stations"],
   bands:"160–10 m (CW)",url:"https://www.arrl.org/sweepstakes"},
  {id:"ssph",n:"ARRL November Sweepstakes · SSB",m:11,wk:2,ini:21*60,fin:(2*24+2)*60+59,
   who:["Solo entre estaciones de EE. UU. y Canadá","Only between US and Canadian stations"],
   bands:"160–10 m (SSB)",url:"https://www.arrl.org/sweepstakes"}];
function span(c,y){const w=fullWk(y,c.m)[c.wk];if(!w)return null;const a=new Date(w.getTime()+c.ini*6e4),b=new Date(w.getTime()+c.fin*6e4+59e3);return {a,b}}
function next(c){const now=Date.now(),y=new Date().getUTCFullYear();let s=span(c,y);if(!s||s.b.getTime()<now)s=span(c,y+1);return s}
const fmt=d=>{try{return d.toLocaleString(EN()?"en-GB":"es-ES",{timeZone:"Europe/Madrid",weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch(_){return d.toISOString().slice(0,16).replace("T"," ")+" UTC"}};
const live=s=>s&&Date.now()>=s.a.getTime()&&Date.now()<=s.b.getTime();
const MEANS=()=>T("Oirás muchas estaciones de EE. UU. y Canadá llamando «CQ Sweepstakes» o «CQ SS». Un QSO contigo no les cuenta en el concurso y muchas no contestan a estaciones de fuera, pero si alguna te contesta, vale para el DXCC, los estados y tus diplomas.",
  "You will hear many US and Canadian stations calling “CQ Sweepstakes” or “CQ SS”. A QSO with you does not count in their contest and many will not answer stations from abroad, but if one does, it counts for DXCC, states and your awards.");
function card(){const sec=document.querySelector('section[data-pg="concursos"]');if(!sec)return false;let c=$("ctfor");
  if(!c){c=document.createElement("div");c.id="ctfor";c.className="card ctfor";const a=$("cnone");if(a&&a.parentNode===sec)a.after(c);else sec.prepend(c)}
  const rows=LIST.map(x=>({x,s:next(x)})).filter(r=>r.s).sort((p,q)=>p.s.a-q.s.a);
  c.innerHTML=`<h2>${T("En el aire, aunque no puntúen desde España","On the air, though they do not score from Spain")}</h2>
    <p class="note">${T("Concursos nacionales de otros países: llenan las bandas, pero desde España no se puede participar. Horas en hora española.","National contests of other countries: they fill the bands, but you cannot take part from Spain. Times in Spanish local time.")}</p>`+
    rows.map(({x,s})=>`<div class="ctfr${live(s)?" on":""}"><p><b>${x.n}</b>${live(s)?` <span class="xtag xr">${T("AHORA","NOW")}</span>`:""}<br>
      <span class="note">${fmt(s.a)} – ${fmt(s.b)} · ${x.bands} · ${T(x.who[0],x.who[1])} · <a href="${x.url}" target="_blank" rel="noopener noreferrer" data-ext>${T("bases","rules")}</a></span></p>
      ${live(s)?`<p class="note">${MEANS()}</p>`:""}</div>`).join("");
  return true}
function banner(){const s=document.getElementById("srch");const on=LIST.map(x=>({x,s:next(x)})).find(r=>live(r.s));let b=$("ctforb");
  if(!on){if(b)b.remove();return}
  if(!s)return;if(!b){b=document.createElement("p");b.id="ctforb";b.className="note ctforb";s.after(b)}
  b.innerHTML=`<b>${T("En el aire ahora:","On the air now:")}</b> ${on.x.n} (${T(on.x.who[0],on.x.who[1]).replace(/^Solo/,"solo").replace(/^Only/,"only")}), ${T("hasta el","until")} ${fmt(on.s.b)}. ${MEANS()}`}
function go(){try{card()}catch(_){}try{banner()}catch(_){}}
let n=0;(function w(){go();if(!(document.getElementById("ctfor")&&(document.getElementById("srch")||n>40))&&++n<80)setTimeout(w,300)})();
setInterval(go,6e4);setInterval(()=>{if(!document.getElementById("ctforb")){try{banner()}catch(_){}}},2000);document.addEventListener("ACRACB:lang",go);
})();
