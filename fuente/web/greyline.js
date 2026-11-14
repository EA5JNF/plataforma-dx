/* ---- ACRACB 2.2: línea gris común con cada entidad ----
   Busca en las próximas 24 h los ratos en que tu QTH y el destino están a la vez en la franja del amanecer o del
   anochecer (sol entre 15° bajo el horizonte y 3° sobre él). En esos ratos las bandas bajas (160, 80, 40 m)
   suelen dar señales mucho más fuertes de lo normal. Se ve en la ficha de cada indicativo, en la ficha del destino
   y en las tarjetas de DXpediciones. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const R=Math.PI/180;
/* elevación del sol (grados) en un punto [lon,lat] y un instante (ms), fórmula de NOAA simplificada */
function sunEl(p,t){const d=(t/864e5)+2440587.5-2451545.0;const g=(357.529+0.98560028*d)*R,q=280.459+0.98564736*d;
  const L=(q+1.915*Math.sin(g)+0.020*Math.sin(2*g))*R,e=(23.439-0.00000036*d)*R;
  const ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L)),dec=Math.asin(Math.sin(e)*Math.sin(L));
  const gmst=((18.697374558+24.06570982441908*d)%24+24)%24;const ha=(gmst*15+p[0])*R-ra,la=p[1]*R;
  return Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(ha))/R}
const LO=-15,HI=3;
function windows(a,b,t0,hours){const out=[];let cur=null;for(let t=t0;t<=t0+hours*36e5;t+=6e4){const ea=sunEl(a,t),eb=sunEl(b,t);
  const ok=ea>=LO&&ea<=HI&&eb>=LO&&eb<=HI;if(ok&&!cur)cur={a:t,ka:ea<sunEl(a,t+6e5)?"am":"pm",kb:eb<sunEl(b,t+6e5)?"am":"pm"};if(!ok&&cur){cur.b=t;out.push(cur);cur=null}}
  if(cur){cur.b=t0+hours*36e5;out.push(cur)}return out.filter(w=>w.b-w.a>=4*6e4)}
function events(p,t0,hours){const out=[];let prev=sunEl(p,t0);for(let t=t0+6e4;t<=t0+hours*36e5;t+=6e4){const e=sunEl(p,t);
  if(prev<-0.833&&e>=-0.833)out.push({t,k:"rise"});if(prev>=-0.833&&e<-0.833)out.push({t,k:"set"});prev=e}return out}
const hm=t=>new Date(t).toISOString().slice(11,16);
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-GB":"es-ES",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
const kk=k=>k==="am"?T("su amanecer","their sunrise"):T("su anochecer","their sunset");
const kme=k=>k==="am"?T("tu amanecer","your sunrise"):T("tu anochecer","your sunset");
const MEMO=new Map();
function calc(p){const me=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];const t0=Math.floor(Date.now()/6e5)*6e5;const k=me.join(",")+"|"+p.join(",")+"|"+t0;
  if(MEMO.has(k))return MEMO.get(k);if(MEMO.size>300)MEMO.clear();
  const r={w:windows(me,p,t0,24),me:events(me,t0,24),dx:events(p,t0,24)};MEMO.set(k,r);return r}
/* texto corto para tarjetas */
function short(p){if(!p||!isFinite(p[0])||!isFinite(p[1]))return "";const r=calc(p);const now=Date.now();
  if(!r.w.length)return "";const w=r.w[0];const live=w.a<=now&&w.b>now;
  return live?T(`Línea gris común <b>ahora</b>, hasta las ${hm(w.b)} UTC`,`Shared greyline <b>now</b>, until ${hm(w.b)} UTC`):T(`Línea gris común: <b>${hm(w.a)}–${hm(w.b)} UTC</b> (${loc(w.a)} hora local)`,`Shared greyline: <b>${hm(w.a)}–${hm(w.b)} UTC</b> (${loc(w.a)} local time)`)}
/* bloque completo para las fichas */
function block(p,name){if(!p||!isFinite(p[0])||!isFinite(p[1]))return "";const r=calc(p);const now=Date.now();
  const ev=(a)=>a.slice(0,4).map(x=>`${x.k==="rise"?T("amanecer","sunrise"):T("anochecer","sunset")} ${hm(x.t)}`).join(" · ");
  let w=r.w.length?`<ul class="glw">${r.w.map(x=>{const live=x.a<=now&&x.b>now;return `<li>${live?`<b>${T("AHORA","NOW")}</b> · `:""}<b>${hm(x.a)}–${hm(x.b)} UTC</b> <span class="note">(${loc(x.a)}–${loc(x.b)} ${T("hora local","local time")})</span> · ${kme(x.ka)} ${T("con","with")} ${kk(x.kb)}</li>`}).join("")}</ul>`
    :`<p class="note">${T("En las próximas 24 h vuestras líneas grises no coinciden: no hay ningún rato en que los dos estéis a la vez entre el amanecer y el anochecer.","In the next 24 h your greylines do not overlap: there is no time when both of you are in twilight at once.")}</p>`;
  return `<div class="glb"><h4>${T("Línea gris común","Shared greyline")}</h4>${w}<p class="note">${T("Tú","You")} (UTC): ${ev(r.me)||"—"}<br>${name?name:T("Destino","Destination")} (UTC): ${ev(r.dx)||"—"}</p><p class="note">${T("En esos ratos los dos estáis en la franja del amanecer o del anochecer; las bandas bajas (160, 80 y 40 m) suelen dar señales mucho más fuertes.","During those times both of you are in twilight; the low bands (160, 80 and 40 m) usually give much stronger signals.")}</p></div>`}
window.ACRACB_grey={sunEl,windows,events,short,block};

/* ficha de indicativo (ventana emergente) */
function posFor(call){try{const e=callEnt(call);const sp=(L.spots||[]).find(s=>String(s.call).toUpperCase()===call&&s.dx);if(sp)return [sp.dx,e];
  const d=typeof dxFor==="function"?dxFor(call):null;if(d&&isFinite(d.lon))return [[d.lon,d.lat],e];
  const t=e?TG().find(x=>x.dxcc===e.dxcc):null;return [t?[t.lon,t.lat]:null,e]}catch(e){return [null,null]}}
function hook(name,after){const o=window[name];if(typeof o!=="function"||o.__gl)return false;const w=function(){const r=o.apply(this,arguments);try{after.apply(this,arguments)}catch(e){}return r};w.__gl=1;window[name]=w;return true}
function boot(){let n=0;const t=setInterval(()=>{
  const a=hook("openCall",function(call){const c=String(call||"").toUpperCase().trim();const pan=document.querySelector("#cpop .cpan");if(!pan)return;const [p,e]=posFor(c);const h=block(p,e&&e.name);if(h)pan.insertAdjacentHTML("beforeend",h)});
  const b=hook("renderInfo",function(){const box=document.getElementById("info");if(!box)return;let z=null;try{z=TG().find(x=>x.id===st.zone)||TG()[0]}catch(e){}if(!z)return;const h=block([z.lon,z.lat],z.name);if(h)box.insertAdjacentHTML("beforeend",h)});
  const c=hook("renderSide",function(){if(typeof st==="undefined"||st.page!=="dx")return;document.querySelectorAll("#dxl .dx[data-dxi]").forEach(el=>{const d=(L.dx||[])[+el.dataset.dxi];if(!d||!isFinite(d.lon))return;const s=short([d.lon,d.lat]);if(!s)return;const w=el.querySelector(".w");if(w&&!w.querySelector(".glx"))w.insertAdjacentHTML("beforeend",`<br><span class="glx">${s}</span>`)})});
  if((a&&b&&c)||++n>75)clearInterval(t)},200)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
