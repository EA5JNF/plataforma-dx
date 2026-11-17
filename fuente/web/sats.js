/* ---- ACRACB 2.2: satélites de aficionado ----
   Próximos pases sobre tu locator en las próximas 24 h, calculados en tu navegador con satellite.js (MIT)
   y los elementos orbitales públicos de CelesTrak (grupo «amateur»), que se guardan 12 h en el dispositivo.
   Frecuencias y modos según AMSAT; algunos satélites funcionan solo a ratos: su estado real está en amsat.org/status. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
/* 2.10.2: frecuencias estructuradas para poder calcular el Doppler de cada pase y explicar cómo configurarlo.
   Datos contrastados con SatNOGS DB (Libre Space Foundation) y AMSAT. up/dn en Hz; tono en Hz (0 = sin tono). */
const SATS=[
 {id:25544,n:"ISS",kind:"FM",k:"fm",tx:[
   {l:["Repetidor de voz (V/U)","Voice repeater (V/U)"],up:145990000,dn:437800000,tone:67.0,m:"FM"},
   {l:["Contacto con la tripulación, Región 1 (ARISS)","Crew contact, Region 1 (ARISS)"],up:145200000,dn:145800000,tone:0,m:"FM",x:["Solo cuando la tripulación opera; escucha 145.800 y no transmitas si no te llaman.","Only when the crew is on the air; listen on 145.800 and do not transmit unless called."]},
   {l:["APRS (digipeater)","APRS (digipeater)"],up:145825000,dn:145825000,tone:0,m:"AFSK 1200"}],
  note:["El repetidor de voz y el APRS no siempre están activos: mira el estado de SatNOGS y AMSAT. Las imágenes SSTV, cuando las hay, bajan en 145.800.","The voice repeater and APRS are not always on: check SatNOGS and AMSAT status. SSTV images, when scheduled, come down on 145.800."]},
 {id:27607,n:"SO-50",kind:"FM",k:"fm",tx:[{l:["Repetidor de voz (V/U)","Voice repeater (V/U)"],up:145850000,dn:436795000,tone:67.0,m:"FM",x:["Se activa con un tono de 74,4 Hz durante 2 s; después, 67 Hz para hablar.","Armed with a 74.4 Hz tone for 2 s; then 67 Hz to talk."]}],note:["Repetidor FM sencillo, ideal para empezar con un walkie.","Simple FM repeater, ideal for a first contact with a handheld."]},
 {id:43017,n:"AO-91",kind:"FM",k:"fm",tx:[{l:["Repetidor de voz (U/V)","Voice repeater (U/V)"],up:435250000,dn:145960000,tone:0,m:"FM",x:["Según SatNOGS DB ya no necesita tono CTCSS.","According to SatNOGS DB it no longer needs a CTCSS tone."]}],note:["Funciona sobre todo con sol, por el estado de su batería.","Works mainly in sunlight because of its battery."]},
 {id:43678,n:"PO-101",kind:"FM",k:"fm",tx:[{l:["Repetidor de voz (U/V)","Voice repeater (U/V)"],up:437500000,dn:145900000,tone:141.3,m:"FM"}],note:["Solo en los horarios que anuncia su equipo.","Only on the schedules announced by its team."]},
 {id:44909,n:"RS-44",kind:T("lineal","linear"),k:"lin",tx:[{l:["Transpondedor lineal inversor (V/U)","Inverting linear transponder (V/U)"],up:145935000,uh:145995000,dn:435670000,dh:435610000,tone:0,m:"SSB/CW"}],note:["Sube en LSB y baja en USB. Baliza CW en 435.605.","LSB up, USB down. CW beacon on 435.605."]},
 {id:24278,n:"FO-29",kind:T("lineal","linear"),k:"lin",tx:[{l:["Transpondedor lineal inversor (V/U)","Inverting linear transponder (V/U)"],up:145900000,uh:146000000,dn:435900000,dh:435800000,tone:0,m:"SSB/CW"}],note:["Solo en los horarios que anuncia JARL.","Only on schedules announced by JARL."]},
 {id:7530,n:"AO-7",kind:T("lineal","linear"),k:"lin",tx:[{l:["Transpondedor modo B, inversor (U/V)","Mode B transponder, inverting (U/V)"],up:432125000,uh:432175000,dn:145975000,dh:145925000,tone:0,m:"SSB/CW"}],note:["Solo funciona con sol: su batería está agotada desde hace décadas.","Only works in sunlight: its battery died decades ago."]},
 {id:53106,n:"IO-117",kind:"digital",k:"dig",tx:[{l:["Digipeater (GreenCube)","Digipeater (GreenCube)"],up:435310000,dn:435310000,tone:0,m:"GMSK 1200"}],note:["Órbita media, pases largos. Necesita un módem y programa específicos: no se trabaja con un walkie.","Medium orbit, long passes. Needs a dedicated modem and software: not workable with a handheld."]}];
const fmt=hz=>(hz/1e6).toFixed(3);
const legacy=s=>{const t=s.tx[0];const r=(a,b,m)=>b&&b!==a?`${fmt(a)} – ${fmt(b)} ${m}`:`${fmt(a)} ${m}`;
  return {up:r(t.up,t.uh,t.m.startsWith("SSB")?"LSB/CW":t.m)+(t.tone?` (${T("tono","tone")} ${t.tone.toFixed(1)} Hz)`:""),down:r(t.dn,t.dh,t.m.startsWith("SSB")?"USB/CW":t.m)}};
SATS.forEach(x=>Object.assign(x,legacy(x)));
const TLEURL="https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle",PROXY="https://acracb-dx.ea5jnf.workers.dev/?u=";
/* 2.7.3: las órbitas se leen primero de la copia que la propia plataforma guarda dos veces al día (datos/tle-amateur.txt,
   descargada de CelesTrak o, si no responde, de AMSAT); si no está, de CelesTrak y de AMSAT directamente */
const TLEURL2="https://www.amsat.org/tle/current/nasabare.txt",MIRROR=(()=>{try{return /^https?:$/.test(location.protocol)&&/ea5jnf\.github\.io$/.test(location.hostname)?new URL("datos/tle-amateur.txt",location.href).href:null}catch(e){return null}})();
/* 2.8.29: estado de cada satélite y de sus transmisores según SatNOGS DB (Libre Space Foundation, CC BY-SA 4.0),
   copiado dos veces al día en datos/satnogs.json junto a las órbitas */
let SN=null,snAsk=false;
function snLoad(){if(snAsk||!MIRROR)return;snAsk=true;fetch(MIRROR.replace("tle-amateur.txt","satnogs.json"),{credentials:"omit",referrerPolicy:"no-referrer"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&j.sats){SN=j;render()}}).catch(()=>{})}
function snTag(id){const x=SN&&SN.sats&&SN.sats[id];if(!x)return "";const act=(x.tx||[]).filter(t=>t.s==="active").length;const ok=act>0&&!/re-?entered|decayed|dead/i.test(String(x.st||""));
  return `<span class="xtag ${ok?"xq":"xs"}" title="${e2(T(`SatNOGS DB: ${act} transmisores activos`,`SatNOGS DB: ${act} active transmitters`))}">SatNOGS: ${ok?T("activo","active"):T("inactivo","inactive")}</span>`}
let REC=null,PASSES=null,calcAt=0,calcFor="",busy=false,err="",LOW=S.get("acracb_satlow")==="1";
function parse(txt){const L=String(txt||"").split(/\r?\n/).map(s=>s.trimEnd()).filter(Boolean),out={};
  for(let i=0;i+2<L.length+1;i++){if(L[i].startsWith("1 ")&&L[i+1]&&L[i+1].startsWith("2 ")){const id=+L[i].slice(2,7);out[id]=[L[i],L[i+1]];i++}}return out}
async function getTLE(){let c=null;try{c=JSON.parse(S.get("acracb_tle")||"null")}catch(e){}
  if(c&&c.t&&Date.now()-c.t<12*36e5&&c.d)return c.d;
  const tryF=async u=>{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),15000);try{const r=await fetch(u,{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);const t=await r.text();if(t.length>2e6)throw new Error("size");return t}finally{clearTimeout(tm)}};
  let d=null;for(const u of [MIRROR,TLEURL,TLEURL2,PROXY+encodeURIComponent(TLEURL),PROXY+encodeURIComponent(TLEURL2)].filter(Boolean)){try{const x=parse(await tryF(u));if(x[25544]&&Object.keys(x).length>=3){d=x;break}}catch(e){}}
  if(d){S.set("acracb_tle",JSON.stringify({t:Date.now(),d}));return d}
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
/* 2.10.2: Doppler del pase: velocidad radial con satellite.js (diferencia de distancia en 1 s) y desplazamiento
   Δf = −f·v/c en la bajada; en la subida se transmite f·(1 + v/c) para que llegue a su frecuencia nominal */
const C=299792.458;const SXO=new Set();
function vr(rec,obs,t){const a=look(rec,new Date(t),obs),b=look(rec,new Date(t+1000),obs);return a&&b?(b.km-a.km):null}
function obsP(){const P=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];return {longitude:P[0]*Math.PI/180,latitude:P[1]*Math.PI/180,height:.05}}
const k3=hz=>(hz/1e6).toFixed(3),r5=hz=>Math.round(hz/5000)*5000,khz=d=>(d>0?"+":d<0?"−":"±")+Math.abs(d/1000).toFixed(1).replace(".",EN()?".":",")+" kHz";
function detail(p){const rec=REC&&REC[p.s.id];if(!rec)return "";const o=obsP();const pts=[[T("Al salir","At rise"),p.aos+15e3],[T("En lo más alto","At the top"),p.tMax],[T("Al ponerse","At set"),p.los-15e3]];
  const v=pts.map(([l,t])=>[l,vr(rec,o,t),t]);if(v.some(x=>x[1]==null))return "";
  const sn=SN&&SN.sats&&SN.sats[p.s.id];const stOf=t=>{if(!sn)return "";const m=(sn.tx||[]).find(x=>x.dl&&Math.abs(x.dl-(t.dh||t.dn))<=6000||x.dl&&Math.abs(x.dl-t.dn)<=6000);return m?`<span class="xtag ${m.s==="active"?"xq":"xs"}">SatNOGS: ${m.s==="active"?T("activo","active"):T("inactivo","inactive")}</span>`:""};
  const blocks=p.s.tx.map(t=>{const lin=!!t.uh;const fm=!lin&&/FM|AFSK/.test(t.m);const same=t.up===t.dn;
    const rowsD=v.map(([l,vv])=>{const dd=-t.dn*vv/C,du=t.up*vv/C;const rx=t.dn+dd,tx=t.up+du;
      return `<tr><th>${l}</th><td><b>${fm&&t.dn>400e6?k3(r5(rx)):k3(rx)}</b> <span class="note">${khz(dd)}</span></td><td>${same?"—":`<b>${fm&&t.up>400e6?k3(r5(tx)):k3(tx)}</b> <span class="note">${khz(du)}</span>`}</td></tr>`}).join("");
    return `<div class="satf"><h5>${e2(t.l[EN()?1:0])} ${stOf(t)}</h5>
      <dl class="sc-d"><dt>${T("Subida (tú transmites)","Uplink (you transmit)")}</dt><dd><b>${lin?`${k3(t.up)} – ${k3(t.uh)}`:k3(t.up)}</b> MHz · ${e2(lin?"LSB/CW":t.m)}</dd>
      <dt>${T("Bajada (tú escuchas)","Downlink (you listen)")}</dt><dd><b>${lin?`${k3(t.dn)} – ${k3(t.dh)}`:k3(t.dn)}</b> MHz · ${e2(lin?"USB/CW":t.m)}</dd>
      <dt>${T("Tono CTCSS","CTCSS tone")}</dt><dd>${t.tone?`<b>${t.tone.toFixed(1)} Hz</b> ${T("en la subida","on the uplink")}`:T("no hace falta","not needed")}</dd>
      <dt>${T("Desplazamiento","Offset")}</dt><dd>${same?T("ninguno: transmites y escuchas en la misma frecuencia (símplex)","none: you transmit and listen on the same frequency (simplex)"):lin?T("transpondedor inversor: si subes la frecuencia de subida, baja la de bajada","inverting transponder: raising the uplink lowers the downlink"):(t.up<300e6)===(t.dn<300e6)?T(`dúplex en la misma banda: transmites ${Math.round(Math.abs(t.dn-t.up)/1000)} kHz ${t.up<t.dn?"por debajo":"por encima"} de donde escuchas`,`same-band split: you transmit ${Math.round(Math.abs(t.dn-t.up)/1000)} kHz ${t.up<t.dn?"below":"above"} where you listen`):T(`banda cruzada: subes en ${t.up<300e6?"VHF":"UHF"} y escuchas en ${t.dn<300e6?"VHF":"UHF"}`,`cross-band: up on ${t.up<300e6?"VHF":"UHF"}, down on ${t.dn<300e6?"VHF":"UHF"}`)}</dd>
      ${t.x?`<dt>${T("Ojo","Note")}</dt><dd>${e2(t.x[EN()?1:0])}</dd>`:""}</dl>
      ${lin?"":`<table class="satdop"><thead><tr><th>${T("Doppler en este pase","Doppler on this pass")}</th><th>${T("Escucha en","Listen on")}</th><th>${T("Transmite en","Transmit on")}</th></tr></thead><tbody>${rowsD}</tbody></table>`}</div>`}).join("");
  const k=p.s.k;
  const how=k==="fm"?T(`<li>Programa en el walkie (o en el equipo) 3 memorias, una por fila de la tabla: en cada una, la frecuencia de escucha y la de transmisión por separado (en muchos equipos se llama «split» o «frecuencia de TX» de la memoria) y el tono si lo pide.</li><li>En UHF el Doppler llega a unos ±10 kHz: empieza en la primera memoria y pasa a la siguiente cuando la voz se oiga distorsionada. En VHF basta con la frecuencia nominal.</li><li>Antena: una directiva pequeña (tipo Arrow o Elk) apuntando al rumbo de salida y siguiéndolo; gírala sobre su eje si la señal se va. Con la antena de goma solo se oye en pases muy altos.</li><li>5 W bastan. Usa auriculares si el equipo es full dúplex, para no acoplarte.</li><li>Escucha primero. Cuando haya hueco: tu indicativo y tu locator (${e2(((document.getElementById("loc")||{}).value||"").slice(0,4))||"IM98"}), corto. Un solo QSO por pase si hay mucha gente.</li>`,
     `<li>Program 3 memories in the handheld (or rig), one per table row: each with separate receive and transmit frequencies (often called “split” or the memory’s “TX frequency”) and the tone if required.</li><li>On UHF the Doppler reaches about ±10 kHz: start on the first memory and move to the next one when the voice sounds distorted. On VHF the nominal frequency is enough.</li><li>Antenna: a small Yagi (Arrow or Elk type) aimed at the rising bearing and following it; twist it on its axis if the signal fades. With the rubber duck you will only hear very high passes.</li><li>5 W is enough. Use headphones on a full-duplex rig to avoid feedback.</li><li>Listen first. When there is a gap: your callsign and locator, briefly. Only one QSO per pass if it is busy.</li>`)
   :k==="lin"?T(`<li>Necesitas un equipo full dúplex (o dos equipos) con SSB: subes en LSB/CW y escuchas en USB/CW.</li><li>Corrige el Doppler en la frecuencia de UHF y deja fija la de VHF. Busca primero tu propia señal: transmite un tono o tu indicativo y ajusta hasta oírte limpio.</li><li>Como el transpondedor es inversor, si subes la frecuencia de subida tu señal baja en la bajada.</li><li>Una directiva para cada banda y poca potencia: no transmitas más fuerte que la baliza.</li>`,
     `<li>You need a full-duplex rig (or two rigs) with SSB: up on LSB/CW, listen on USB/CW.</li><li>Correct the Doppler on the UHF frequency and keep the VHF one fixed. Find your own signal first: send a tone or your callsign and tune until you hear yourself clearly.</li><li>As the transponder inverts, raising your uplink lowers your signal on the downlink.</li><li>A Yagi for each band and low power: never be louder than the beacon.</li>`)
   :T(`<li>Necesita un módem GMSK y un programa específico (no se trabaja con walkie). Mira la guía del satélite en AMSAT.</li>`,`<li>Needs a GMSK modem and dedicated software (not workable with a handheld). See the satellite's guide at AMSAT.</li>`);
  return `<details class="satx" data-sk="${p.s.id}-${p.aos}"${SXO.has(p.s.id+"-"+p.aos)?" open":""}><summary>${T("Frecuencias, Doppler y cómo configurarlo","Frequencies, Doppler and how to set it up")}</summary>${blocks}<h5>${T("Cómo hacer el QSO","How to make the QSO")}</h5><ol class="sathow">${how}</ol>
    <p class="note">${T("El Doppler se calcula para este pase y tu locator con la órbita del satélite. Las frecuencias son las de SatNOGS DB y AMSAT; antes de transmitir, comprueba que el satélite esté activo.","Doppler is calculated for this pass and your locator from the satellite's orbit. Frequencies are from SatNOGS DB and AMSAT; before transmitting, check that the satellite is active.")}</p></details>`}
function card(p){const now=Date.now(),live=p.aos<=now&&p.los>now;let cur="";
  if(live&&REC&&REC[p.s.id]){try{const P=TXP||[-0.67,38.63];const a=look(REC[p.s.id],new Date(),{longitude:P[0]*Math.PI/180,latitude:P[1]*Math.PI/180,height:.05});if(a)cur=`<span class="nw">${T("ahora","now")} ${Math.round(a.az)}° ${cabS(a.az)}, ${T("elevación","elevation")} ${Math.max(0,Math.round(a.el))}°</span>`}catch(e){}}
  const dur=Math.round((p.los-p.aos)/6e4),mx=Math.round(p.max);
  const q=mx>=45?["xr",T("pase muy alto","very high pass")]:mx>=20?["xq",T("pase bueno","good pass")]:["xs",T("pase bajo","low pass")];
  const rumbo=`<span class="nw">${T("sale","rises")} ${Math.round(p.azA)}° ${cabS(p.azA)} ·</span> <span class="nw">${T("máx.","max")} ${Math.round(p.azM)}° ${cabS(p.azM)}${p.azL!=null?" ·":""}</span>${p.azL!=null?` <span class="nw">${T("se pone","sets")} ${Math.round(p.azL)}° ${cabS(p.azL)}</span>`:""}`;
  return `<div class="sc sat${live?" live":""}"><div class="sc-h"><span class="sc-call">${e2(p.s.n)}</span><span class="sc-age">${live?`<b class="satnow">${T("EN EL AIRE","ON AIR")}</b>`:inT(p.aos-now)}</span></div>`+
   `<div class="sc-f"><b class="sc-fq">${hm(p.aos)}–${hm(p.los)}</b><span class="sc-b">UTC · ${loc(p.aos)}–${loc(p.los)} ${T("hora local","local time")} · ${dur} min</span><span class="xtag ${q[0]}">${mx}° · ${q[1]}</span><span class="xtag">${e2(p.s.kind)}</span>${snTag(p.s.id)}</div>`+
   `<dl class="sc-d">${cur?`<dt>${T("Ahora","Now")}</dt><dd>${cur}</dd>`:""}<dt>${T("Rumbo","Bearing")}</dt><dd>${rumbo}</dd><dt>${T("Subida","Uplink")}</dt><dd>${e2(p.s.up)}</dd><dt>${T("Bajada","Downlink")}</dt><dd>${e2(p.s.down)}</dd><dt>${T("Nota","Note")}</dt><dd>${e2(p.s.note[EN()?1:0])}</dd></dl>${detail(p)}</div>`}
function render(){const box=document.getElementById("sats");if(!box)return;snLoad();
  if(typeof satellite==="undefined"){box.innerHTML=`<p class="note">${T("Los pases de satélites se calculan en la versión web de la plataforma (ea5jnf.github.io/plataforma-dx), que descarga los datos orbitales al día.","Satellite passes are calculated in the web version of the platform (ea5jnf.github.io/plataforma-dx), which downloads up-to-date orbital data.")}</p>`;return}
  if(!PASSES){box.innerHTML=`<p class="note">${err||T("Calculando los pases…","Calculating passes…")}</p>`;return}
  const list=PASSES.filter(p=>LOW||p.max>=10);const sh=list.slice(0,24);
  const head=`<div class="seg clseg"><span class="segl">${T("Pases","Passes")}</span><button type="button" data-satlow="0" aria-pressed="${!LOW}">${T("Desde 10°","From 10°")}</button><button type="button" data-satlow="1" aria-pressed="${LOW}">${T("Todos","All")}</button></div>`;
  const html=head+`<p class="note">${T(`Próximos pases sobre tu locator en las próximas 24 h. Cuanto más alta la elevación máxima, mejor se oye. Estado real de cada satélite en <a href="https://www.amsat.org/status/" target="_blank" rel="noopener noreferrer" data-ext>AMSAT</a>.`,`Next passes over your locator in the next 24 h. The higher the maximum elevation, the better. Current status of each satellite at <a href="https://www.amsat.org/status/" target="_blank" rel="noopener noreferrer" data-ext>AMSAT</a>.`)}${err?" "+err:""}</p>`+
   (sh.length?`<div class="satl">${sh.map(card).join("")}</div>`:`<div class="empty">${T("Ningún pase en las próximas 24 h.","No passes in the next 24 h.")}</div>`)+
   `<details class="srcd"><summary>${T("Fuentes","Sources")}</summary><p class="note">${T("Elementos orbitales","Orbital elements")}: <a href="https://celestrak.org/" target="_blank" rel="noopener noreferrer" data-ext>CelesTrak</a>${T(" y "," and ")}<a href="https://www.amsat.org/" target="_blank" rel="noopener noreferrer" data-ext>AMSAT</a> · ${T("cálculo","calculation")}: satellite.js (MIT) · ${T("frecuencias","frequencies")}: AMSAT · ${T("estado","status")}: <a href="https://db.satnogs.org/" target="_blank" rel="noopener noreferrer" data-ext>SatNOGS DB</a>${SN&&SN.at?" ("+e2(SN.at.slice(0,10))+")":""} · ${T("calculado a las","calculated at")} ${hm(calcAt)} UTC</p></details>`;
  if(box.dataset.h!==html){box.dataset.h=html;box.innerHTML=html;box.querySelectorAll("details.satx").forEach(d=>d.addEventListener("toggle",()=>{if(d.open)SXO.add(d.dataset.sk);else SXO.delete(d.dataset.sk)}))}
  box.querySelectorAll("[data-satlow]").forEach(b=>b.onclick=()=>{LOW=b.dataset.satlow==="1";S.set("acracb_satlow",LOW?"1":"0");render()})}
/* se calcula al abrir la pestaña, cada 6 h o si cambia el locator; la tarjeta se refresca cada 20 s mientras se ve */
function visible(){const d=document.getElementById("f_sat");return d&&typeof st!=="undefined"&&st.page==="dx"&&!d.classList.contains("toff")}
function tick(){if(!document.getElementById("sats"))return;const P=(typeof TXP!=="undefined"&&TXP)?TXP.join(","):"";
  if(!busy&&(!PASSES&&!err||Date.now()-calcAt>6*36e5||P!==calcFor&&calcAt)){if(visible()||!PASSES)calc()}else if(visible())render()}
window.ACRACB_sats={calc,render,getTLE,SATS,get passes(){return PASSES}};
function boot(){render();setInterval(tick,20000);setTimeout(tick,1500);document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest('.ptabs button,[data-pg="dx"]'))setTimeout(tick,50)},true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
