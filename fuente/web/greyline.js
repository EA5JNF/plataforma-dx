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
/* texto corto para tarjetas (2.10.1: primero tu hora y qué coincide con qué) */
const kshort=w=>T(`${w.ka==="am"?"tu amanecer":"tu anochecer"} con su ${w.kb==="am"?"amanecer":"anochecer"}`,`your ${w.ka==="am"?"sunrise":"sunset"} with their ${w.kb==="am"?"sunrise":"sunset"}`);
function short(p){if(!p||!isFinite(p[0])||!isFinite(p[1]))return "";const r=calc(p);const now=Date.now();
  if(!r.w.length)return "";const w=r.w[0];const live=w.a<=now&&w.b>now;
  return live?T(`Línea gris común <b>ahora</b>, hasta las ${loc(w.b)} (tu hora) · ${kshort(w)}`,`Shared greyline <b>now</b>, until ${loc(w.b)} (your time) · ${kshort(w)}`)
    :T(`Línea gris común: <b>${loc(w.a)}–${loc(w.b)}</b> tu hora (${hm(w.a)}–${hm(w.b)} UTC) · ${kshort(w)}`,`Shared greyline: <b>${loc(w.a)}–${loc(w.b)}</b> your time (${hm(w.a)}–${hm(w.b)} UTC) · ${kshort(w)}`)}
/* 2.10.1: bloque completo para las fichas, didáctico: una franja de 24 h para ti y otra para el destino (día, línea gris
   y noche) con los ratos comunes marcados encima de las dos, y debajo cada rato explicado con tu hora: qué te pasa a ti
   (amanece o anochece), qué le pasa a él y qué bandas aprovechar */
const seg=el=>el>HI?"d":el>=LO?"g":"n";
function strip(p,t0){let h="";for(let i=0;i<96;i++){const t=t0+i*9e5+45e4;h+=`<i class="gls-${seg(sunEl(p,t))}"></i>`}return h}
function block(p,name){if(!p||!isFinite(p[0])||!isFinite(p[1]))return "";const r=calc(p);const now=Date.now();
  const me=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];const t0=Math.floor(now/9e5)*9e5;const nm=name||T("Destino","Destination");
  const pos=t=>Math.max(0,Math.min(100,(t-t0)/(864e5)*100));
  const ov=r.w.map(x=>`<b class="glov" style="left:${pos(x.a).toFixed(2)}%;width:${Math.max(.6,pos(x.b)-pos(x.a)).toFixed(2)}%"></b>`).join("");
  const ticks=[0,6,12,18].map(k=>{const t=t0+k*36e5;return `<span style="left:${(k/24*100).toFixed(2)}%">${loc(t)}</span>`}).join("");
  const tl=`<div class="glbt" role="img" aria-label="${T("Franja de 24 horas con el día, la línea gris y la noche en tu QTH y en el destino","24-hour strip with day, greyline and night at your QTH and at the destination")}">
    <div class="glrow"><span class="gll">${T("Tú","You")}</span><div class="gls">${strip(me,t0)}${ov}</div></div>
    <div class="glrow"><span class="gll">${e2(nm)}</span><div class="gls">${strip(p,t0)}${ov}</div></div>
    <div class="glrow"><span class="gll"></span><div class="glx2">${ticks}</div></div></div>
    <p class="glleg"><span><i class="gls-d"></i>${T("día","day")}</span><span><i class="gls-g"></i>${T("línea gris","greyline")}</span><span><i class="gls-n"></i>${T("noche","night")}</span><span><i class="glovk"></i>${T("los dos en línea gris a la vez","both in greyline at once")}</span></p>`;
  const sun=k=>k==="am"?"☀":"☾";
  const w=r.w.length?`<ol class="glw2">${r.w.map(x=>{const live=x.a<=now&&x.b>now;return `<li>${live?`<b class="glnow">${T("AHORA","NOW")}</b> `:""}<b>${loc(x.a)}–${loc(x.b)}</b> ${T("tu hora","your time")} <span class="note">(${hm(x.a)}–${hm(x.b)} UTC)</span>
      <div class="glpair"><span>${sun(x.ka)} ${T("Tú","You")}: <b>${x.ka==="am"?T("amanece","sunrise"):T("anochece","sunset")}</b></span><span class="glarr">⇄</span><span>${sun(x.kb)} ${e2(nm)}: <b>${x.kb==="am"?T("amanece","sunrise"):T("anochece","sunset")}</b></span></div></li>`}).join("")}</ol>`
    :`<p class="note">${T("En las próximas 24 h vuestras líneas grises no coinciden: no hay ningún rato en que los dos estéis a la vez entre el amanecer y el anochecer.","In the next 24 h your greylines do not overlap: there is no time when both of you are in twilight at once.")}</p>`;
  return `<div class="glb"><h4>${T("Línea gris común","Shared greyline")}</h4><p class="note">${T("Cuándo estáis los dos a la vez amaneciendo o anocheciendo. En esos ratos 160, 80 y 40 m suelen dar señales mucho más fuertes de lo normal.","When both of you are at sunrise or sunset at the same time. During those times 160, 80 and 40 m usually give much stronger signals than normal.")}</p>${tl}${w}</div>`}
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
window.ACRACB_grey={sunEl,windows,events,short,block};

/* ficha de indicativo (ventana emergente) */
function posFor(call){try{const e=callEnt(call);const sp=(L.spots||[]).find(s=>String(s.call).toUpperCase()===call&&s.dx);if(sp)return [sp.dx,e];
  const d=typeof dxFor==="function"?dxFor(call):null;if(d&&isFinite(d.lon))return [[d.lon,d.lat],e];
  const t=e?TG().find(x=>x.dxcc===e.dxcc):null;return [t?[t.lon,t.lat]:null,e]}catch(e){return [null,null]}}
function hook(name,after){const K="__hkgl_"+name;if(window[K])return true;const o=window[name];if(typeof o!=="function")return false;window[K]=1;const w=function(){const r=o.apply(this,arguments);try{after.apply(this,arguments)}catch(e){}return r};w.__gl=1;window[name]=w;return true}
function boot(){let n=0;const t=setInterval(()=>{
  const a=hook("openCall",function(call){const c=String(call||"").toUpperCase().trim();const pan=document.querySelector("#cpop .cpan");if(!pan)return;const [p,e]=posFor(c);const h=block(p,e&&e.name);if(h)pan.insertAdjacentHTML("beforeend",h)});
  const b=hook("renderInfo",function(){const box=document.getElementById("info");if(!box)return;let z=null;try{z=TG().find(x=>x.id===st.zone)||TG()[0]}catch(e){}if(!z)return;const h=block([z.lon,z.lat],z.name);if(h)box.insertAdjacentHTML("beforeend",h)});
  const c=hook("renderSide",function(){if(typeof st==="undefined"||st.page!=="dx")return;document.querySelectorAll("#dxl .dx[data-dxi]").forEach(el=>{const d=(L.dx||[])[+el.dataset.dxi];if(!d||!isFinite(d.lon))return;const s=short([d.lon,d.lat]);if(!s)return;const w=el.querySelector(".w");if(w&&!w.querySelector(".glx"))w.insertAdjacentHTML("beforeend",`<br><span class="glx">${s}</span>`)})});
  if((a&&b&&c)||++n>75)clearInterval(t)},200)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
