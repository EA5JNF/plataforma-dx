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
/* 2.7.4: la EEI y los satélites se ven aunque el resto del mapa esté en blanco */
const ok=()=>typeof st!=="undefined"&&st.ly&&typeof satellite!=="undefined";
const onISS=()=>ok()&&st.ly.iss,onSats=()=>ok()&&st.ly.sats;
const me=()=>(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];
const foot=h=>Math.acos(6371/(6371+h))/R;
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-GB":"es-ES",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
const ll=(lat,lon)=>`${Math.abs(lat).toFixed(1).replace(".",EN()?".":",")}° ${lat>=0?"N":"S"}, ${Math.abs(lon).toFixed(1).replace(".",EN()?".":",")}° ${lon>=0?"E":(EN()?"W":"O")}`;
const nf=n=>Math.round(n).toLocaleString(EN()?"en-GB":"es-ES");
function nextPass(id){try{const now=Date.now();return (ACRACB_sats.passes||[]).find(p=>p.s&&p.s.id===id&&p.los>now)||null}catch(e){return null}}
/* 2.7.4: icono propio para la EEI y para cada satélite; al tocarlo se abre su ficha, como con las estaciones */
const hear0=p=>d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h);
function icon(g,q,s,id,iss,on){const n=g.append("g").attr("class",(iss?"issico":"satico")+(on?" on":"")).attr("transform",`translate(${q[0]},${q[1]}) scale(${1/s})`)
    .attr("pointer-events","all").attr("role","button").attr("tabindex","0").attr("aria-label",(iss?"ISS":((SATS().find(x=>x.id===id)||{}).n||""))+": "+T("ver ficha","show details"));
  n.append("circle").attr("class","sathit").attr("r",iss?16:12);
  if(iss){n.append("rect").attr("class","ip").attr("x",-13).attr("y",-7).attr("width",7).attr("height",14).attr("rx",1);n.append("rect").attr("class","ip").attr("x",6).attr("y",-7).attr("width",7).attr("height",14).attr("rx",1);
    n.append("path").attr("class","it").attr("d","M-6 0H6");n.append("rect").attr("class","ib").attr("x",-3.5).attr("y",-4).attr("width",7).attr("height",8).attr("rx",1.5)}
  else{n.append("rect").attr("class","ip").attr("x",-9).attr("y",-3).attr("width",5).attr("height",6).attr("rx",.8);n.append("rect").attr("class","ip").attr("x",4).attr("y",-3).attr("width",5).attr("height",6).attr("rx",.8);
    n.append("path").attr("class","it").attr("d","M-4 0H4M0 -3.5V-7");n.append("rect").attr("class","ib").attr("x",-2.5).attr("y",-3).attr("width",5).attr("height",6).attr("rx",1)}
  const go=ev=>{try{ev.stopPropagation();ev.preventDefault()}catch(_){}openSat(id)};n.on("click",go).on("keydown",ev=>{if(ev.key==="Enter"||ev.key===" ")go(ev)}).on("pointerdown",ev=>{try{ev.stopPropagation()}catch(_){}})}
function lookNow(r,t){try{const P=me(),obs={longitude:P[0]*R,latitude:P[1]*R,height:.05},d=new Date(t),pv=satellite.propagate(r,d);if(!pv||!pv.position)return null;
  const la=satellite.ecfToLookAngles(obs,satellite.eciToEcf(pv.position,satellite.gstime(d)));return {el:la.elevation/R,az:(la.azimuth/R+360)%360,km:la.rangeSat}}catch(e){return null}}
const CB=a=>{try{return typeof cab==="function"?cab(Math.round(a)):""}catch(e){return ""}};
function openSat(id){const sd=SATS().find(x=>x.id===id)||{id,n:"ISS"},r=REC.get(id);if(!r)return;const now=Date.now(),p=at(r,now);if(!p)return;const iss=id===25544,on=hear0(p),lk=lookNow(r,now);
  try{if(window.ACRACB_sats&&!(ACRACB_sats.passes||[]).length)ACRACB_sats.calc()}catch(e){}
  const ps=(()=>{try{return (ACRACB_sats.passes||[]).filter(x=>x.s&&x.s.id===id&&x.los>now).slice(0,3)}catch(e){return []}})();
  const tile=(k,v)=>v?`<div><span class="note">${k}</span><b>${v}</b></div>`:"";const note=Array.isArray(sd.note)?sd.note[EN()?1:0]:(sd.note||"");
  let h=`<div class="cph"><div><div class="cpc">${e2(sd.n)}</div><div class="cpe">${iss?T("Estación Espacial Internacional","International Space Station"):T("Satélite de radioaficionado","Amateur satellite")+(sd.kind?" · "+e2(sd.kind):"")} · NORAD ${id}</div>
    <div class="cpb">${on?`<span class="agr ok">${T("La oyes ahora","In range now")}</span>`:`<span class="agr">${T("Fuera de tu alcance ahora","Out of range now")}</span>`}</div></div><button type="button" class="btn cpx" data-satx aria-label="${T("Cerrar","Close")}">${T("Cerrar","Close")}</button></div>`;
  h+=`<h3>${T("Ahora","Now")}</h3><div class="cpg">${tile(T("Posición","Position"),ll(p.lat,p.lon))}${tile(T("Altura","Altitude"),nf(p.h)+" km")}${tile(T("Velocidad","Speed"),nf(p.v*3600)+" km/h")}${lk?tile(T("Desde tu QTH","From your QTH"),lk.el>0?`${Math.round(lk.el)}° ${T("de elevación","elevation")} · ${Math.round(lk.az)}° ${CB(lk.az)}`:`${T("bajo el horizonte","below the horizon")} · ${nf(lk.km)} km`):""}</div>`;
  h+=`<h3>${T("Próximos pases sobre tu locator","Next passes over your locator")}</h3>`+(ps.length?ps.map(x=>`<div class="cps"><b>${loc(x.aos)}–${loc(x.los)}</b> ${T("hora local","local time")} · ${Math.max(1,Math.round((x.los-x.aos)/6e4))} min · ${T("máx.","max")} <b>${Math.round(x.max)}°</b><br><span class="note">${T("sale","rises")} ${Math.round(x.azA)}° ${CB(x.azA)} · ${T("punto más alto","peak")} ${Math.round(x.azM)}° ${CB(x.azM)}${x.azL!=null?` · ${T("se pone","sets")} ${Math.round(x.azL)}° ${CB(x.azL)}`:""}</span></div>`).join(""):`<p class="note">${T("Ninguno en las próximas 24 h por encima del mínimo elegido en DX › Satélites.","None in the next 24 h above the minimum chosen in DX › Satellites.")}</p>`);
  h+=`<h3>${T("Frecuencias","Frequencies")}</h3><div class="cpg">${iss?tile(T("Voz","Voice"),"145.800 FM")+tile("APRS","145.825"):""}${tile(T("Subida","Uplink"),e2(sd.up||""))}${tile(T("Bajada","Downlink"),e2(sd.down||""))}</div>${note?`<p class="note">${e2(note)}</p>`:""}`;
  h+=`<p class="note">${T("El círculo del mapa es la zona desde la que se oye ahora.","The circle on the map is the area where it can be heard now.")}</p>`;
  h+=`<h3>${T("Más información","More information")}</h3><div class="cpl"><a class="btn" href="https://www.amsat.org/status/" target="_blank" rel="noopener noreferrer" data-ext>${T("Estado en AMSAT","Status at AMSAT")}</a><button type="button" class="btn" data-satgo>${T("Todos los pases","All passes")}</button></div>`;
  let ov=document.getElementById("satpop");if(!ov){ov=document.createElement("div");ov.id="satpop";ov.className="cpop";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");document.body.appendChild(ov);
    ov.addEventListener("click",ev=>{if(ev.target===ov||ev.target.closest("[data-satx]"))closeSat();else if(ev.target.closest("[data-satgo]")){closeSat();try{go("dx");selTab("dx","f_sat",true)}catch(e){}}});
    document.addEventListener("keydown",ev=>{if(ev.key==="Escape")closeSat()})}
  ov.setAttribute("aria-label",sd.n);ov.innerHTML=`<div class="cpan" tabindex="-1">${h}</div>`;ov.hidden=false;document.body.classList.add("noscroll");ov.querySelector(".cpan").focus()}
function closeSat(){const ov=document.getElementById("satpop");if(ov&&!ov.hidden){ov.hidden=true;document.body.classList.remove("noscroll")}}
function draw(){const old=document.getElementById("issg");if(old)old.remove();note();if(!(onISS()||onSats())||typeof ZROOT==="undefined"||!ZROOT||typeof PR==="undefined"||!PR)return;
  if(!REC.size){load().then(()=>{if(REC.size)draw()});return}
  const now=Date.now(),path=d3.geoPath(PR),k=(typeof ZT!=="undefined"&&ZT&&ZT.k)||1,s=Math.pow(k,.75);
  const g=ZROOT.append("g").attr("id","issg").attr("class","issg").attr("pointer-events","none");
  if(onSats())SATS().forEach(sd=>{if(sd.id===25544)return;const r=REC.get(sd.id);if(!r)return;const p=at(r,now);if(!p)return;const q=PR([p.lon,p.lat]);if(!q)return;
    const hear=d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h);
    if(hear)g.append("path").attr("class","satfoot").attr("d",path(d3.geoCircle().center([p.lon,p.lat]).radius(foot(p.h)).precision(2)()));
    icon(g,q,s,sd.id,false,hear);
    g.append("text").attr("class","satlbl"+(hear?" on":"")).attr("x",q[0]+11/s).attr("y",q[1]+4/s).attr("paint-order","stroke").text(sd.n)});
  if(onISS()){const r=REC.get(25544);const p=r&&at(r,now);if(p){const f=foot(p.h);
    g.append("path").attr("class","issfoot").attr("d",path(d3.geoCircle().center([p.lon,p.lat]).radius(f).precision(2)()));
    const past=track(r,now-45*6e4,now),next=track(r,now,now+95*6e4);
    if(past.length>1)g.append("path").attr("class","isspast").attr("d",path({type:"LineString",coordinates:past}));
    if(next.length>1)g.append("path").attr("class","issnext").attr("d",path({type:"LineString",coordinates:next}));
    const q=PR([p.lon,p.lat]);if(q){icon(g,q,s,25544,true,hear0(p));
      g.append("text").attr("class","isslbl").attr("x",q[0]+15/s).attr("y",q[1]+4/s).attr("paint-order","stroke").text("ISS")}}}
  note()}
/* panel de datos bajo la leyenda */
function note(){let n=document.getElementById("issnote");if(!(onISS()||onSats())){if(n)n.remove();return}
  if(!n){const mw=document.querySelector("#mapcard .mapwrap")||document.getElementById("mlegend");if(!mw)return;n=document.createElement("div");n.id="issnote";n.className="issnote";mw.insertAdjacentElement("afterend",n)}
  if(!REC.size){n.innerHTML=`<p class="note">${T("Cargando las órbitas…","Loading orbits…")}</p>`;return}
  const now=Date.now();let h="";
  if(onISS()){const r=REC.get(25544),p=r&&at(r,now);if(p){const hear=d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h);const np=nextPass(25544);
    h+=`<div class="sn-c"><div class="sn-h"><button type="button" class="lnk snb" data-satp="25544">ISS</button>${hear?`<span class="xtag xs">${T("LA OYES AHORA","IN RANGE NOW")}</span>`:""}</div><dl class="sc-d">
      <dt>${T("Posición","Position")}</dt><dd>${ll(p.lat,p.lon)}</dd>
      <dt>${T("Altura","Altitude")}</dt><dd>${nf(p.h)} km</dd>
      <dt>${T("Velocidad","Speed")}</dt><dd>${nf(p.v*3600)} km/h</dd>
      <dt>${T("Próximo paso","Next pass")}</dt><dd>${np?`${loc(np.aos)}–${loc(np.los)} ${T("hora local","local time")} · ${T("máx.","max")} ${Math.round(np.max)}°`:T("ninguno en 24 h","none in 24 h")}</dd>
      <dt>${T("Frecuencias","Frequencies")}</dt><dd>${T("Voz","Voice")} 145.800 FM · APRS 145.825 · ${T("repetidor","repeater")} 145.990 ↑ / 437.800 ↓</dd></dl>
      <p class="note">${T("Círculo: zona desde la que se la oye · línea continua: próxima hora y media · punteada: últimos 45 minutos.","Circle: area where it can be heard · solid line: next hour and a half · dotted: last 45 minutes.")}</p></div>`}}
  if(onSats()){const list=SATS().filter(s=>s.id!==25544&&REC.get(s.id)).map(s=>{const p=at(REC.get(s.id),now);return {s,p,hear:p&&d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h),np:nextPass(s.id)}}).filter(x=>x.p);
    const on=list.filter(x=>x.hear),off=list.filter(x=>!x.hear&&x.np).sort((a,b)=>a.np.aos-b.np.aos).slice(0,4);
    h+=`<div class="sn-c"><div class="sn-h"><b>${T("Satélites de radioaficionado","Amateur satellites")}</b></div><dl class="sc-d">
      <dt>${T("Los oyes ahora","In range now")}</dt><dd>${on.length?on.map(x=>`<button type="button" class="lnk snb" data-satp="${x.s.id}">${e2(x.s.n)}</button> ${e2(x.s.down)}`).join("<br>"):T("ninguno","none")}</dd>
      <dt>${T("Próximos","Next")}</dt><dd>${off.length?off.map(x=>`<button type="button" class="lnk snb" data-satp="${x.s.id}">${e2(x.s.n)}</button> ${loc(x.np.aos)} (${T("máx.","max")} ${Math.round(x.np.max)}°)`).join("<br>"):"—"}</dd></dl>
      <p class="note">${T("Toca la EEI o un satélite en el mapa, o su nombre aquí, para ver su ficha. Los que oyes ahora van resaltados con su zona de cobertura.","Tap the ISS or a satellite on the map, or its name here, to see its details. Those in range are highlighted with their footprint.")}</p></div>`}
  if(n.innerHTML!==h)n.innerHTML=h}
function hook(){const o=window.drawMap;if(typeof o!=="function"||o.__iss)return false;const w=function(){const r=o.apply(this,arguments);try{draw()}catch(e){}return r};w.__iss=1;window.drawMap=w;return true}
function btns(){const sw=document.getElementById("mapsw");if(!sw)return false;if(typeof satellite==="undefined")return true;
  const mk=(ly,txt,tt)=>{if(sw.querySelector(`[data-ly="${ly}"]`))return;const b=document.createElement("button");b.type="button";b.id="mly"+ly;b.dataset.ly=ly;b.textContent=txt;b.title=tt;b.setAttribute("aria-pressed",String(!!(st.ly&&st.ly[ly])));
    b.onclick=ev=>{ev.stopPropagation();st.ly[ly]=!st.ly[ly];b.setAttribute("aria-pressed",String(!!st.ly[ly]));try{store.set("ly",JSON.stringify(st.ly))}catch(e){}try{draw()}catch(e){}};sw.appendChild(b)};
  mk("iss","ISS",T("Estación espacial internacional: dónde está, por dónde pasará y cómo oírla","International Space Station: where it is, where it will pass and how to hear it"));
  mk("sats",T("Satélites","Satellites"),T("Satélites de radioaficionado: dónde está cada uno y cuáles oyes ahora","Amateur satellites: where each one is and which ones are in range"));return true}
function boot(){let n=0;try{if(typeof st!=="undefined"&&st.ly){if(st.ly.iss===undefined)st.ly.iss=true;if(st.ly.sats===undefined)st.ly.sats=true}}catch(e){}const t=setInterval(()=>{try{if(typeof st!=="undefined"&&st.ly){if(st.ly.iss===undefined)st.ly.iss=true;if(st.ly.sats===undefined)st.ly.sats=true}}catch(e){}const a=hook(),b=btns();if((a&&b)||++n>75)clearInterval(t)},200);
  setInterval(()=>{if((onISS()||onSats())&&document.visibilityState==="visible"&&typeof st!=="undefined"&&st.page==="mapa"){try{draw()}catch(e){}}},20000)}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-satp]");if(b){ev.preventDefault();openSat(+b.dataset.satp)}});
window.ACRACB_iss={draw,open:openSat,at:(t)=>REC.get(25544)&&at(REC.get(25544),t||Date.now())};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
