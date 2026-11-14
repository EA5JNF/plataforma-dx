/* ---- ACRACB 2.4.1: la ISS y los satélites de radioaficionado en el mapa ----
   Botones «ISS» y «Satélites» en «Qué ver» (solo en la web, con las órbitas de CelesTrak que usa la pestaña Satélites).
   ISS: posición, zona desde la que se la oye, recorrido de la próxima hora y media y de los últimos 45 minutos, altura,
   velocidad, si la oyes ahora desde tu QTH, su próximo paso y sus frecuencias.
   Satélites: dónde está cada uno; los que oyes ahora salen resaltados con su zona de cobertura. Se actualiza cada 20 s. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const R=Math.PI/180;const REC=new Map();let recAt=0,busy=false;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SATS=()=>(window.ACRACB_sats&&ACRACB_sats.SATS)||[{id:25544,n:"ISS"}];
async function load(){if(REC.size&&Date.now()-recAt<6*36e5)return;if(busy||!window.ACRACB_sats||!ACRACB_sats.getTLE)return;busy=true;
  try{const d=await ACRACB_sats.getTLE();if(d){SATS().forEach(s=>{const tl=d[s.id];if(tl)try{REC.set(s.id,satellite.twoline2satrec(tl[0],tl[1]))}catch(e){}});recAt=Date.now()}}catch(e){}finally{busy=false}}
function at(r,t){const d=new Date(t),pv=satellite.propagate(r,d);if(!pv||!pv.position)return null;const g=satellite.eciToGeodetic(pv.position,satellite.gstime(d));
  let lon=g.longitude/R;lon=((lon+540)%360)-180;return {lon,lat:g.latitude/R,h:g.height,v:pv.velocity?Math.hypot(pv.velocity.x,pv.velocity.y,pv.velocity.z):0}}
function track(r,a,b){const out=[];for(let t=a;t<=b;t+=30e3){const p=at(r,t);if(p)out.push([p.lon,p.lat])}return out}
const ok=()=>typeof st!=="undefined"&&st.ly&&st.mapOn&&typeof satellite!=="undefined";
const onISS=()=>ok()&&st.ly.iss,onSats=()=>ok()&&st.ly.sats;
const me=()=>(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];
const foot=h=>Math.acos(6371/(6371+h))/R;
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-GB":"es-ES",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
const ll=(lat,lon)=>`${Math.abs(lat).toFixed(1).replace(".",EN()?".":",")}° ${lat>=0?"N":"S"}, ${Math.abs(lon).toFixed(1).replace(".",EN()?".":",")}° ${lon>=0?"E":(EN()?"W":"O")}`;
const nf=n=>Math.round(n).toLocaleString(EN()?"en-GB":"es-ES");
function nextPass(id){try{const now=Date.now();return (ACRACB_sats.passes||[]).find(p=>p.s&&p.s.id===id&&p.los>now)||null}catch(e){return null}}
function draw(){const old=document.getElementById("issg");if(old)old.remove();note();if(!(onISS()||onSats())||typeof ZROOT==="undefined"||!ZROOT||typeof PR==="undefined"||!PR)return;
  if(!REC.size){load().then(()=>{if(REC.size)draw()});return}
  const now=Date.now(),path=d3.geoPath(PR),k=(typeof ZT!=="undefined"&&ZT&&ZT.k)||1,s=Math.pow(k,.75);
  const g=ZROOT.append("g").attr("id","issg").attr("class","issg").attr("pointer-events","none");
  if(onSats())SATS().forEach(sd=>{if(sd.id===25544)return;const r=REC.get(sd.id);if(!r)return;const p=at(r,now);if(!p)return;const q=PR([p.lon,p.lat]);if(!q)return;
    const hear=d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h);
    if(hear)g.append("path").attr("class","satfoot").attr("d",path(d3.geoCircle().center([p.lon,p.lat]).radius(foot(p.h)).precision(2)()));
    g.append("rect").attr("class","satdot"+(hear?" on":"")).attr("x",q[0]-3.5/s).attr("y",q[1]-3.5/s).attr("width",7/s).attr("height",7/s);
    g.append("text").attr("class","satlbl"+(hear?" on":"")).attr("x",q[0]+7/s).attr("y",q[1]+4/s).attr("paint-order","stroke").text(sd.n)});
  if(onISS()){const r=REC.get(25544);const p=r&&at(r,now);if(p){const f=foot(p.h);
    g.append("path").attr("class","issfoot").attr("d",path(d3.geoCircle().center([p.lon,p.lat]).radius(f).precision(2)()));
    const past=track(r,now-45*6e4,now),next=track(r,now,now+95*6e4);
    if(past.length>1)g.append("path").attr("class","isspast").attr("d",path({type:"LineString",coordinates:past}));
    if(next.length>1)g.append("path").attr("class","issnext").attr("d",path({type:"LineString",coordinates:next}));
    const q=PR([p.lon,p.lat]);if(q){g.append("circle").attr("class","issdot").attr("cx",q[0]).attr("cy",q[1]).attr("r",6/s);
      g.append("text").attr("class","isslbl").attr("x",q[0]+9/s).attr("y",q[1]+4/s).attr("paint-order","stroke").text("ISS")}}}
  note()}
/* panel de datos bajo la leyenda */
function note(){let n=document.getElementById("issnote");if(!(onISS()||onSats())){if(n)n.remove();return}
  if(!n){const mw=document.querySelector("#mapcard .mapwrap")||document.getElementById("mlegend");if(!mw)return;n=document.createElement("div");n.id="issnote";n.className="issnote";mw.insertAdjacentElement("afterend",n)}
  if(!REC.size){n.innerHTML=`<p class="note">${T("Cargando las órbitas…","Loading orbits…")}</p>`;return}
  const now=Date.now();let h="";
  if(onISS()){const r=REC.get(25544),p=r&&at(r,now);if(p){const hear=d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h);const np=nextPass(25544);
    h+=`<div class="sn-c"><div class="sn-h"><b>ISS</b>${hear?`<span class="xtag xs">${T("LA OYES AHORA","IN RANGE NOW")}</span>`:""}</div><dl class="sc-d">
      <dt>${T("Posición","Position")}</dt><dd>${ll(p.lat,p.lon)}</dd>
      <dt>${T("Altura","Altitude")}</dt><dd>${nf(p.h)} km</dd>
      <dt>${T("Velocidad","Speed")}</dt><dd>${nf(p.v*3600)} km/h</dd>
      <dt>${T("Próximo paso","Next pass")}</dt><dd>${np?`${loc(np.aos)}–${loc(np.los)} ${T("hora local","local time")} · ${T("máx.","max")} ${Math.round(np.max)}°`:T("ninguno en 24 h","none in 24 h")}</dd>
      <dt>${T("Frecuencias","Frequencies")}</dt><dd>${T("Voz","Voice")} 145.800 FM · APRS 145.825 · ${T("repetidor","repeater")} 145.990 ↑ / 437.800 ↓</dd></dl>
      <p class="note">${T("Círculo: zona desde la que se la oye · línea continua: próxima hora y media · punteada: últimos 45 minutos.","Circle: area where it can be heard · solid line: next hour and a half · dotted: last 45 minutes.")}</p></div>`}}
  if(onSats()){const list=SATS().filter(s=>s.id!==25544&&REC.get(s.id)).map(s=>{const p=at(REC.get(s.id),now);return {s,p,hear:p&&d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h),np:nextPass(s.id)}}).filter(x=>x.p);
    const on=list.filter(x=>x.hear),off=list.filter(x=>!x.hear&&x.np).sort((a,b)=>a.np.aos-b.np.aos).slice(0,4);
    h+=`<div class="sn-c"><div class="sn-h"><b>${T("Satélites de radioaficionado","Amateur satellites")}</b></div><dl class="sc-d">
      <dt>${T("Los oyes ahora","In range now")}</dt><dd>${on.length?on.map(x=>`<b>${e2(x.s.n)}</b> ${e2(x.s.down)}`).join("<br>"):T("ninguno","none")}</dd>
      <dt>${T("Próximos","Next")}</dt><dd>${off.length?off.map(x=>`<b>${e2(x.s.n)}</b> ${loc(x.np.aos)} (${T("máx.","max")} ${Math.round(x.np.max)}°)`).join("<br>"):"—"}</dd></dl>
      <p class="note">${T("Cuadrado: posición de cada satélite; los que oyes ahora van resaltados con su zona de cobertura. Frecuencias y pasos completos en DX › Satélites.","Square: each satellite's position; those in range are highlighted with their footprint. Frequencies and full passes in DX › Satellites.")}</p></div>`}
  if(n.innerHTML!==h)n.innerHTML=h}
function hook(){const o=window.drawMap;if(typeof o!=="function"||o.__iss)return false;const w=function(){const r=o.apply(this,arguments);try{draw()}catch(e){}return r};w.__iss=1;window.drawMap=w;return true}
function btns(){const sw=document.getElementById("mapsw");if(!sw)return false;if(typeof satellite==="undefined")return true;
  const mk=(ly,txt,tt)=>{if(sw.querySelector(`[data-ly="${ly}"]`))return;const b=document.createElement("button");b.dataset.ly=ly;b.textContent=txt;b.title=tt;b.setAttribute("aria-pressed",String(!!(st.ly&&st.ly[ly]&&st.mapOn)));
    b.onclick=()=>{st.ly[ly]=!st.ly[ly];if(st.ly[ly]&&!st.mapOn)st.mapOn=true;try{store.set("ly",JSON.stringify(st.ly))}catch(e){}try{renderBandSeg()}catch(e){}drawMap()};sw.appendChild(b)};
  mk("iss","ISS",T("Estación espacial internacional: dónde está, por dónde pasará y cómo oírla","International Space Station: where it is, where it will pass and how to hear it"));
  mk("sats",T("Satélites","Satellites"),T("Satélites de radioaficionado: dónde está cada uno y cuáles oyes ahora","Amateur satellites: where each one is and which ones are in range"));return true}
function boot(){let n=0;const t=setInterval(()=>{const a=hook(),b=btns();if((a&&b)||++n>75)clearInterval(t)},200);
  setInterval(()=>{if((onISS()||onSats())&&document.visibilityState==="visible"&&typeof st!=="undefined"&&st.page==="mapa"){try{draw()}catch(e){}}},20000)}
window.ACRACB_iss={draw,at:(t)=>REC.get(25544)&&at(REC.get(25544),t||Date.now())};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
