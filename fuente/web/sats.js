/* ---- ACRACB 2.2: satélites de aficionado ----
   Próximos pases sobre tu locator en las próximas 24 h, calculados en tu navegador con satellite.js (MIT)
   y los elementos orbitales públicos de CelesTrak (grupo «amateur»), que se guardan 12 h en el dispositivo.
   Frecuencias y modos según AMSAT; algunos satélites funcionan solo a ratos: su estado real está en amsat.org/status. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const SATS=[
 {id:25544,n:"ISS",kind:"FM",up:"145.990 FM (tono 67 Hz)",down:"437.800 FM",note:["Repetidor de voz. APRS en 145.825.","Voice repeater. APRS on 145.825."]},
 {id:27607,n:"SO-50",kind:"FM",up:"145.850 FM (tono 67 Hz)",down:"436.795 FM",note:["Se enciende con un tono de 74,4 Hz.","Armed with a 74.4 Hz tone."]},
 {id:43017,n:"AO-91",kind:"FM",up:"435.250 FM (tono 67 Hz)",down:"145.960 FM",note:["Funciona sobre todo con sol.","Works mainly in sunlight."]},
 {id:43678,n:"PO-101",kind:"FM",up:"437.500 FM (tono 141,3 Hz)",down:"145.900 FM",note:["Solo en horarios anunciados.","Only on announced schedules."]},
 {id:44909,n:"RS-44",kind:T("lineal","linear"),up:"145.935 – 145.995 LSB/CW",down:"435.610 – 435.670 USB/CW",note:["Transpondedor inversor: sube en LSB, baja en USB.","Inverting transponder: LSB up, USB down."]},
 {id:24278,n:"FO-29",kind:T("lineal","linear"),up:"145.900 – 146.000 LSB/CW",down:"435.900 – 435.800 USB/CW",note:["Solo en horarios anunciados.","Only on announced schedules."]},
 {id:7530,n:"AO-7",kind:T("lineal","linear"),up:"432.125 – 432.175 LSB/CW",down:"145.975 – 145.925 USB/CW",note:["Modo B; solo con sol, por su batería agotada.","Mode B; sunlight only (dead battery)."]},
 {id:53106,n:"IO-117",kind:"digital",up:"435.310",down:"435.310",note:["Digipeater (GreenCube), órbita media: pases largos.","Digipeater (GreenCube), medium orbit: long passes."]}];
const TLEURL="https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle",PROXY="https://acracb-dx.ea5jnf.workers.dev/?u=";
let REC=null,PASSES=null,calcAt=0,calcFor="",busy=false,err="",LOW=S.get("acracb_satlow")==="1";
function parse(txt){const L=String(txt||"").split(/\r?\n/).map(s=>s.trimEnd()).filter(Boolean),out={};
  for(let i=0;i+2<L.length+1;i++){if(L[i].startsWith("1 ")&&L[i+1]&&L[i+1].startsWith("2 ")){const id=+L[i].slice(2,7);out[id]=[L[i],L[i+1]];i++}}return out}
async function getTLE(){let c=null;try{c=JSON.parse(S.get("acracb_tle")||"null")}catch(e){}
  if(c&&c.t&&Date.now()-c.t<12*36e5&&c.d)return c.d;
  const tryF=async u=>{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),15000);try{const r=await fetch(u,{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);const t=await r.text();if(t.length>2e6)throw new Error("size");return t}finally{clearTimeout(tm)}};
  let txt=null;try{txt=await tryF(TLEURL)}catch(e){try{txt=await tryF(PROXY+encodeURIComponent(TLEURL))}catch(e2){}}
  const d=txt?parse(txt):null;if(d&&Object.keys(d).length){S.set("acracb_tle",JSON.stringify({t:Date.now(),d}));return d}
  if(c&&c.d)return c.d;throw new Error("tle")}
const deg=r=>r*180/Math.PI;
function look(rec,date,obs){const pv=satellite.propagate(rec,date);if(!pv||!pv.position)return null;const gmst=satellite.gstime(date);
  const ecf=satellite.eciToEcf(pv.position,gmst);const la=satellite.ecfToLookAngles(obs,ecf);return {el:deg(la.elevation),az:(deg(la.azimuth)+360)%360,km:la.rangeSat}}
function passes(rec,obs,t0,hours){const out=[];let cur=null,prev=null;const step=30e3;
  for(let t=t0;t<=t0+hours*36e5;t+=step){const a=look(rec,new Date(t),obs);if(!a)continue;
    if(a.el>0){if(!cur){let s=t;if(prev!=null){let lo=t-step,hi=t;for(let k=0;k<5;k++){const m=(lo+hi)/2,b=look(rec,new Date(m),obs);if(b&&b.el>0)hi=m;else lo=m}s=hi}cur={aos:s,azA:look(rec,new Date(s),obs).az,max:a.el,tMax:t,azM:a.az}}
      else if(a.el>cur.max){cur.max=a.el;cur.tMax=t;cur.azM=a.az}}
    else if(cur){let lo=t-step,hi=t;for(let k=0;k<5;k++){const m=(lo+hi)/2,b=look(rec,new Date(m),obs);if(b&&b.el>0)lo=m;else hi=m}cur.los=lo;cur.azL=look(rec,new Date(lo),obs).az;out.push(cur);cur=null}
    prev=a.el}
  if(cur){cur.los=t0+hours*36e5;cur.azL=null;out.push(cur)}return out}
async function calc(){if(busy||typeof satellite==="undefined")return;busy=true;err="";try{const d=await getTLE();const P=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];
  const obs={longitude:P[0]*Math.PI/180,latitude:P[1]*Math.PI/180,height:0.05};const t0=Date.now()-20*6e4,res=[];REC={};
  for(const s of SATS){const tl=d[s.id];if(!tl)continue;try{const rec=satellite.twoline2satrec(tl[0],tl[1]);REC[s.id]=rec;for(const p of passes(rec,obs,t0,24.5))res.push(Object.assign({s},p))}catch(e){}}
  PASSES=res.filter(p=>p.los>Date.now()).sort((a,b)=>a.aos-b.aos);calcAt=Date.now();calcFor=P.join(",")}catch(e){err=T("No se han podido descargar los datos de los satélites. Se volverá a intentar en unos minutos.","Satellite data could not be downloaded. It will try again in a few minutes.");calcAt=Date.now()-5.5*36e5}finally{busy=false}render()}
const hm=t=>new Date(t).toISOString().slice(11,16);
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-GB":"es-ES",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
const cabS=a=>{try{return cab(a)}catch(e){return ""}};
function inT(ms){const m=Math.round(ms/6e4);if(m<1)return T("ya","now");if(m<60)return T(`en ${m} min`,`in ${m} min`);const h=Math.floor(m/60),r=m%60;return T(`en ${h} h ${r?r+" min":""}`,`in ${h} h ${r?r+" min":""}`).trim()}
function card(p){const now=Date.now(),live=p.aos<=now&&p.los>now;let cur="";
  if(live&&REC&&REC[p.s.id]){try{const P=TXP||[-0.67,38.63];const a=look(REC[p.s.id],new Date(),{longitude:P[0]*Math.PI/180,latitude:P[1]*Math.PI/180,height:.05});if(a)cur=`<span class="nw">${T("ahora","now")} ${Math.round(a.az)}° ${cabS(a.az)}, ${T("elevación","elevation")} ${Math.max(0,Math.round(a.el))}°</span>`}catch(e){}}
  const dur=Math.round((p.los-p.aos)/6e4),mx=Math.round(p.max);
  const q=mx>=45?["xr",T("pase muy alto","very high pass")]:mx>=20?["xq",T("pase bueno","good pass")]:["xs",T("pase bajo","low pass")];
  const rumbo=`<span class="nw">${T("sale","rises")} ${Math.round(p.azA)}° ${cabS(p.azA)} ·</span> <span class="nw">${T("máx.","max")} ${Math.round(p.azM)}° ${cabS(p.azM)}${p.azL!=null?" ·":""}</span>${p.azL!=null?` <span class="nw">${T("se pone","sets")} ${Math.round(p.azL)}° ${cabS(p.azL)}</span>`:""}`;
  return `<div class="sc sat${live?" live":""}"><div class="sc-h"><span class="sc-call">${e2(p.s.n)}</span><span class="sc-age">${live?`<b class="satnow">${T("EN EL AIRE","ON AIR")}</b>`:inT(p.aos-now)}</span></div>`+
   `<div class="sc-f"><b class="sc-fq">${hm(p.aos)}–${hm(p.los)}</b><span class="sc-b">UTC · ${loc(p.aos)}–${loc(p.los)} ${T("hora local","local time")} · ${dur} min</span><span class="xtag ${q[0]}">${mx}° · ${q[1]}</span><span class="xtag">${e2(p.s.kind)}</span></div>`+
   `<dl class="sc-d">${cur?`<dt>${T("Ahora","Now")}</dt><dd>${cur}</dd>`:""}<dt>${T("Rumbo","Bearing")}</dt><dd>${rumbo}</dd><dt>${T("Subida","Uplink")}</dt><dd>${e2(EN()?p.s.up.replace(/\(tono ([\d,]+) Hz\)/,(m,x)=>"("+x.replace(",",".")+" Hz tone)"):p.s.up)}</dd><dt>${T("Bajada","Downlink")}</dt><dd>${e2(p.s.down)}</dd><dt>${T("Nota","Note")}</dt><dd>${e2(p.s.note[EN()?1:0])}</dd></dl></div>`}
function render(){const box=document.getElementById("sats");if(!box)return;
  if(typeof satellite==="undefined"){box.innerHTML=`<p class="note">${T("Los pases de satélites se calculan en la versión web de la plataforma (ea5jnf.github.io/plataforma-dx), que descarga los datos orbitales al día.","Satellite passes are calculated in the web version of the platform (ea5jnf.github.io/plataforma-dx), which downloads up-to-date orbital data.")}</p>`;return}
  if(!PASSES){box.innerHTML=`<p class="note">${err||T("Calculando los pases…","Calculating passes…")}</p>`;return}
  const list=PASSES.filter(p=>LOW||p.max>=10);const sh=list.slice(0,24);
  const head=`<div class="seg clseg"><span class="segl">${T("Pases","Passes")}</span><button type="button" data-satlow="0" aria-pressed="${!LOW}">${T("Desde 10°","From 10°")}</button><button type="button" data-satlow="1" aria-pressed="${LOW}">${T("Todos","All")}</button></div>`;
  box.innerHTML=head+`<p class="note">${T(`Próximos pases sobre tu locator en las próximas 24 h. Cuanto más alta la elevación máxima, mejor se oye. Estado real de cada satélite en <a href="https://www.amsat.org/status/" target="_blank" rel="noopener noreferrer" data-ext>AMSAT</a>.`,`Next passes over your locator in the next 24 h. The higher the maximum elevation, the better. Current status of each satellite at <a href="https://www.amsat.org/status/" target="_blank" rel="noopener noreferrer" data-ext>AMSAT</a>.`)}${err?" "+err:""}</p>`+
   (sh.length?`<div class="satl">${sh.map(card).join("")}</div>`:`<div class="empty">${T("Ningún pase en las próximas 24 h.","No passes in the next 24 h.")}</div>`)+
   `<details class="srcd"><summary>${T("Fuentes","Sources")}</summary><p class="note">${T("Elementos orbitales","Orbital elements")}: <a href="https://celestrak.org/" target="_blank" rel="noopener noreferrer" data-ext>CelesTrak</a> · ${T("cálculo","calculation")}: satellite.js (MIT) · ${T("frecuencias","frequencies")}: AMSAT · ${T("calculado a las","calculated at")} ${hm(calcAt)} UTC</p></details>`;
  box.querySelectorAll("[data-satlow]").forEach(b=>b.onclick=()=>{LOW=b.dataset.satlow==="1";S.set("acracb_satlow",LOW?"1":"0");render()})}
/* se calcula al abrir la pestaña, cada 6 h o si cambia el locator; la tarjeta se refresca cada 20 s mientras se ve */
function visible(){const d=document.getElementById("f_sat");return d&&typeof st!=="undefined"&&st.page==="dx"&&!d.classList.contains("toff")}
function tick(){if(!document.getElementById("sats"))return;const P=(typeof TXP!=="undefined"&&TXP)?TXP.join(","):"";
  if(!busy&&(!PASSES&&!err||Date.now()-calcAt>6*36e5||P!==calcFor&&calcAt)){if(visible()||!PASSES)calc()}else if(visible())render()}
window.ACRACB_sats={calc,render,getTLE,SATS,get passes(){return PASSES}};
function boot(){render();setInterval(tick,20000);setTimeout(tick,1500);document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest('.ptabs button,[data-pg="dx"]'))setTimeout(tick,50)},true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
