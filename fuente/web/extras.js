/* ---- ACRACB 1.1: ¿me oyen?, split y QSL, intercambio de concursos, QRP, meteoros y notificaciones ---- */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const ART=!!window.claude;
const PROXY="https://acracb-dx.ea5jnf.workers.dev/?u=";
const BR=[[0,1.8,2],[1,3.5,4],[8,5.25,5.45],[2,7,7.3],[9,10.1,10.15],[3,14,14.35],[4,18.068,18.168],[5,21,21.45],[6,24.89,24.99],[7,28,29.7],[10,50,54],[11,144,146],[12,430,440]];
const bandOf=f=>{for(const [i,lo,hi] of BR)if(f>=lo&&f<=hi)return i;return null};
const base=c=>String(c||"").toUpperCase().trim().replace(/-\d+(-#)?$|-#$/,"").split("/").sort((a,b)=>b.length-a.length)[0]||"";
async function get(url,type,ms){const ac=new AbortController();const t=setTimeout(()=>ac.abort(),ms||12000);
  try{const r=await fetch(url,{signal:ac.signal,cache:"no-store",credentials:"omit"});if(!r.ok)throw new Error("HTTP "+r.status);return type==="json"?await r.json():await r.text()}finally{clearTimeout(t)}}

/* =================== split, QSL y referencias en los comentarios =================== */
/* split: «UP 5», «UP 5-10» (kHz por encima) o «QSX 7190», «UP 14.195» (frecuencia exacta en la que escucha) */
window.ACRACB_split=function(c){c=String(c||"");const m=c.match(/\b(?:UP|QSX)\s*\+?(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?/i);if(!m)return null;
  const v=parseFloat(m[1].replace(",",".")),d=(m[1].split(/[.,]/)[1]||"").length;
  if(v>=1000)return {abs:(v/1000).toFixed(3)};if(v>=1.8&&d===3)return {abs:v.toFixed(3)};
  if(v>60)return null;const w=m[2]?parseFloat(m[2].replace(",",".")):null;return {rel:String(+v.toFixed(1)),rel2:w!=null&&w>v&&w<=60?String(+w.toFixed(1)):null}};
window.ACRACB_tags=function(s,inline){const c=String((s&&s.c)||"");if(!c)return "";const out=[];
  let m=null;const sp=ACRACB_split(c);
  if(sp&&sp.abs)out.push(`<span class="xtag xs" title="Opera en split: transmite en su frecuencia y escucha en otra">Split · escucha en ${esc2(sp.abs)}</span>`);
  else if(sp)out.push(`<span class="xtag xs" title="Opera en split: transmite en su frecuencia y escucha más arriba">Split · escucha +${esc2(sp.rel)}${sp.rel2?"–"+esc2(sp.rel2):""} kHz</span>`);
  else if(/\bUP\b|\bSPLIT\b/i.test(c))out.push(`<span class="xtag xs" title="Opera en split: escucha más arriba de su frecuencia">Split · escucha arriba</span>`);
  else if(/\bDOWN\s*\d*/i.test(c)){m=c.match(/\bDOWN\s*(\d+)?/i);out.push(`<span class="xtag xs">Split · escucha −${m&&m[1]?esc2(m[1])+" kHz":"abajo"}</span>`)}
  const q=[];if(/\bLOTW\b/i.test(c))q.push("LoTW");if(/\bOQRS\b/i.test(c))q.push("OQRS");if(/\bCLUB ?LOG\b/i.test(c)&&!q.includes("OQRS"))q.push("Club Log");
  m=c.match(/\bQSL\s*(?:VIA|MGR|:)?\s*([A-Z0-9]{1,3}[0-9][A-Z0-9]{1,4})\b/i);if(m&&!/^(OQRS|LOTW)$/i.test(m[1]))q.push("vía "+m[1].toUpperCase());
  if(/\bDIRECT[OA]?\b/i.test(c))q.push("directa");if(/\bBUREAU|\bBURO\b/i.test(c))q.push("buró");
  if(q.length)out.push(`<span class="xtag xq" title="Cómo conseguir la confirmación">QSL: ${esc2(q.join(", "))}</span>`);
  m=c.match(/\b(POTA|WWFF|SOTA|IOTA|GMA)[ :#-]*([A-Z0-9]{1,4}[\/-][A-Z0-9-]{2,8}|[A-Z]{2}-\d{3})\b/i);
  if(m)out.push(`<span class="xtag xr">${esc2(m[1].toUpperCase())} ${esc2(m[2].toUpperCase())}</span>`);
  else{m=c.match(/\b(POTA|WWFF|SOTA)\b/i);if(m)out.push(`<span class="xtag xr">${esc2(m[1].toUpperCase())}</span>`)}
  if(!out.length){m=c.match(/skimmer|PSK Reporter/i);return m?" · "+esc2(m[0]):""}
  return (inline?" ":"<br>")+out.join(" ")};
function esc2(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

/* =================== intercambio habitual de cada concurso =================== */
const EXCH=[[/CQ WW 160/i,"RST + zona CQ (14)"],[/CQ WW/i,"RST + zona CQ (14)"],[/CQ WPX/i,"RST + número de serie"],
  [/ARRL International DX|ARRL DX/i,"RST + potencia (solo con W/VE)"],[/ARRL 10/i,"RST + número de serie"],[/ARRL 160/i,"RST (solo con W/VE)"],
  [/RTTY Roundup/i,"RST + número de serie"],[/IARU/i,"RST + zona ITU (37)"],[/WAE/i,"RST + número de serie (y QTC)"],[/JIDX/i,"RST + zona CQ (14)"],
  [/OK\/OM/i,"RST + número de serie"],[/LZ DX/i,"RST + zona ITU (37)"],[/IOTA/i,"RST + número de serie (+ referencia IOTA si estás en isla)"],
  [/EU HF/i,"RST + año de tu primera licencia (2 cifras)"],[/All Asian/i,"RST + tu edad"],[/WAG/i,"RST + número de serie"],[/^REF/i,"RST + número de serie"],
  [/UBA/i,"RST + número de serie"],[/PACC/i,"RST + número de serie"],[/Russian DX/i,"RST + número de serie"],[/^SP DX/i,"RST + número de serie"],
  [/Helvetia/i,"RST + número de serie"],[/Oceania/i,"RST + número de serie"],[/^SAC/i,"RST + número de serie"],[/WW Digi/i,"locator de 4 caracteres"],
  [/Rey de Espa/i,"RST + provincia (EA) o número de serie (resto)"],[/^EA RTTY|^EA PSK/i,"RST + provincia (EA) o número de serie (resto)"],
  [/ARI Int/i,"RST + número de serie"]];
window.ACRACB_exch=function(name){const e=EXCH.find(([re])=>re.test(name||""));return e?`<span class="xch">Se pasa: ${esc2(e[1])}</span>`:""};

/* =================== lluvias de meteoros (dispersión meteórica en 6 y 2 m) =================== */
const MET=[[0,3,"Cuadrántidas",110],[3,22,"Líridas",18],[4,6,"Eta Acuáridas",50],[5,7,"Aríetidas (de día)",60],[7,12,"Perseidas",100],[9,21,"Oriónidas",20],[10,17,"Leónidas",15],[11,14,"Gemínidas",150]];
function nextShower(){const now=new Date();let best=null;for(const y of [now.getFullYear(),now.getFullYear()+1])for(const [m,d,n,z] of MET){const t=new Date(y,m,d,12);const dd=Math.round((t-now)/864e5);if(dd>=-1&&(!best||t<best.t))best={t,n,z,dd}}return best}
function meteorNote(){const box=$("vhfo");if(!box)return;let p=$("metnote");if(!p){p=document.createElement("p");p.id="metnote";p.className="note";box.insertAdjacentElement("afterend",p)}
  const s=nextShower();if(!s)return;const EN=window.ACRACB_LANG==="en";const when=s.dd<=0?"es hoy":s.dd===1?"es mañana":(EN?`in ${s.dd} days`:`en ${s.dd} días`);
  p.innerHTML=`<b>Dispersión meteórica:</b> la próxima lluvia es la de las <b>${s.n}</b>, con máximo el ${(m=>EN?m+" "+s.t.getDate():s.t.getDate()+" de "+m)(["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][s.t.getMonth()])} (${when}; ${EN?"about":"unos"} ${s.z} meteoros por hora en cielo oscuro). Esos días, en 6 y 2 m con FT8 o MSK144 (50.280 y 144.360 MHz) se pueden hacer contactos de 800 a 2.000 km. Mejor de madrugada, cuando el radiante está alto.`}

/* =================== QRP =================== */
const QRPF=[["160 m","1.836","—"],["80 m","3.560","3.690"],["40 m","7.030","7.090"],["30 m","10.116","—"],["20 m","14.060","14.285"],["17 m","18.086","18.130"],["15 m","21.060","21.285"],["12 m","24.906","24.950"],["10 m","28.060","28.360"],["6 m","50.060","50.285"]];
function qrpCard(){const el=$("qrpbox");if(!el)return;const eq=$("eq"),low=eq&&+eq.value<=5;
  el.innerHTML=`<p>Frecuencias donde se reúnen las estaciones QRP (5 W o menos), según los centros de actividad de la IARU Región 1. Llama ahí o escucha primero: quien está en esas frecuencias espera señales débiles.</p>
  <div class="scroll"><table class="bt qrpt"><tr><th>Banda</th><th>CW</th><th>SSB</th></tr>${QRPF.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table></div>
  <p class="note">Frecuencias en MHz. En FT8 y FT4 no hay frecuencia QRP: usa las normales, con 5 W llegan muy lejos.</p>
  <h3>Consejos para trabajar con poca potencia</h3><ul class="stl">
  <li>Pon tu potencia real en «Cambiar» (arriba). ${low?"Ya la tienes en QRP: ":"Con la opción «QRP (≤5 W)» "}todas las previsiones, el mapa y la tabla por banda pasan a calcularse con esa potencia, y solo te dirá que una banda está abierta si llegas de verdad.</li>
  <li>Usa la pestaña <b>¿Me oyen?</b> del apartado DX: llama CQ dos o tres minutos y verás qué estaciones te han oído y con qué señal.</li>
  <li>Busca las bandas altas de día y la línea gris al amanecer y al atardecer: con poca potencia es cuando más lejos se llega.</li>
  <li>La CW gana unos 10–13 dB a la SSB y el FT8 más de 20: con 5 W en CW es como transmitir entre 50 y 100 W en SSB.</li></ul>`}

/* =================== ¿Me oyen? =================== */
let HR=null,HBUSY=false,HLAST=0;window.ACRACB_heardList=()=>HR?{at:HR.at,band:null,list:HR.list}:null;
const MEMO={};
async function memo(k,min,fn){const m=MEMO[k];if(m&&Date.now()-m.t<min*6e4)return m.v;const v=await fn();MEMO[k]={t:Date.now(),v};return v}
function rxPos(call,loc){try{if(loc&&typeof normLoc==="function"&&normLoc(loc))return locToLL(loc)}catch(e){}try{const ap=window.ACRACB_areaPos&&ACRACB_areaPos(call);if(ap)return ap}catch(e){}try{const e=callEnt(call);if(e&&e.lon!=null)return [e.lon,e.lat];if(e&&e.dxcc){const m=(V.meta||[]).find(x=>x[2]===e.dxcc);if(m)return [m[5],m[4]]}}catch(e){}return null}
async function fromSpothole(call){let j;try{j=await get("https://spothole.app/api/v1/spots?max_age=3600&dx_call="+encodeURIComponent(call),"json")}catch(e){j=await get("https://spothole.app/api/v1/spots?max_age=3600","json")}const a=Array.isArray(j)?j:(j.spots||j.data||[]);
  return a.filter(s=>base(s.dx_call||s.dx||s.callsign)===call).map(s=>{const c=String(s.comment||s.info||"");const db=c.match(/(-?\d+)\s*dB/i);const f=+(s.freq||s.frequency||0);const fm=f>1e6?f/1e6:f>1000?f/1000:f;
    const src=/RBN/i.test(String(s.source||""))?"Reverse Beacon":/PSK/i.test(String(s.source||""))?"PSK Reporter":"Clúster";
    const la=+(s.de_latitude||s.de_lat),lo=+(s.de_longitude||s.de_lon);
    return {rx:base(s.de_call||s.spotter||s.de),pos:isFinite(la)&&isFinite(lo)&&(la||lo)?[lo,la]:null,f:fm,band:bandOf(fm),mode:s.mode||(src==="Reverse Beacon"?"CW":""),snr:db?+db[1]:null,t:Date.parse(s.time_iso||s.time||s.spot_time)||(+s.time>1e9?+s.time*1000:null),src}})}
/* clústeres DX clásicos: HamQTH (directo), DX Summit (por el intermediario) y los spots que ya tiene la plataforma */
async function fromCluster(call){const out=[];const add=(rx,fq,mode,t,c,src)=>{const f=+fq>1000?+fq/1000:+fq;const db=String(c||"").match(/(-?\d+)\s*dB/i);out.push({rx:base(rx),pos:null,f,band:bandOf(f),mode:mode||"",snr:db?+db[1]:null,t,src,c:c||""})};
  const tasks=[(async()=>{const t=await get("https://www.hamqth.com/dxc_csv.php?limit=500","text");t.split("\n").map(l=>l.split("^")).filter(p=>p.length>=5&&base(p[2])===call).forEach(p=>add(p[0],p[1],"",Date.parse(String(p[4]).replace(" ","T")+(/Z$/.test(p[4])?"":"Z"))||null,p[3],"HamQTH"))})(),
    (async()=>{let j=await get(PROXY+encodeURIComponent("https://www.dxsummit.fi/api/v1/spots?limit=500"),"json");if(!Array.isArray(j))j=j.spots||[];j.filter(s=>base(s.dx_call||s.dx||s.callsign)===call).forEach(s=>add(s.de_call||s.spotter||s.de,s.frequency||s.freq,"",Date.parse(s.time||s.spot_time)||null,s.info||s.comment,"DX Summit"))})()];
  const r=await Promise.allSettled(tasks);
  try{(L.spots||[]).filter(s=>base(s.call)===call).forEach(s=>String(s.by||"").split(/[ ,]+/).filter(Boolean).forEach(by=>add(by,s.f,s.mode,Date.parse(s.utc||"")||null,s.c,"Clúster")))}catch(e){}
  if(r.every(x=>x.status==="rejected")&&!out.length)throw new Error("sin respuesta");return out}
async function fromWSPR(call){const q=`SELECT toUnixTimestamp(time) t,rx_sign,rx_loc,rx_lat,rx_lon,frequency,snr,distance FROM wspr.rx WHERE tx_sign='${call.replace(/[^A-Z0-9\/]/g,"")}' AND time>now()-3600 ORDER BY time DESC LIMIT 300 FORMAT JSON`;
  const j=await get("https://db1.wspr.live/?query="+encodeURIComponent(q),"json");return (j.data||[]).map(r=>{const f=+r.frequency/1e6;return {rx:base(r.rx_sign),pos:[+r.rx_lon,+r.rx_lat],f,band:bandOf(f),mode:"WSPR",snr:+r.snr,t:+r.t*1000,src:"WSPRnet",km:+r.distance}})}
async function fromPSK(call){const u=`https://retrieve.pskreporter.info/query?senderCallsign=${encodeURIComponent(call)}&flowStartSeconds=-3600&rronly=1&noactive=1`;
  const x=await memo("psk"+call,5,()=>get(PROXY+encodeURIComponent(u),"text",15000));const out=[];
  for(const m of String(x).matchAll(/<receptionReport\b([^>]*)\/?>/g)){const at={};for(const a of m[1].matchAll(/(\w+)="([^"]*)"/g))at[a[1]]=a[2];
    const f=+at.frequency/1e6;out.push({rx:base(at.receiverCallsign),pos:rxPos(at.receiverCallsign,at.receiverLocator),f,band:bandOf(f),mode:at.mode||"",snr:at.sNR!=null?+at.sNR:null,t:+at.flowStartSeconds*1000,src:"PSK Reporter"})}
  return out}
async function checkHeard(manual){const call=base(($("hcall")||{}).value||S.get("acracb_mycall")||"");if(!call||call.length<3){if(manual)hStatus("Escribe tu indicativo.");return}
  if(ART){hStatus("Esta comprobación funciona en la versión web de la plataforma, no aquí.");return}
  if(HBUSY)return;HBUSY=true;HLAST=Date.now();S.set("acracb_mycall",call);hStatus("Buscando quién te ha oído en la última hora…");
  const src=[["Reverse Beacon",fromSpothole],["clústeres DX",fromCluster],["PSK Reporter",fromPSK],["WSPRnet",fromWSPR]];
  const res=await Promise.all(src.map(async([n,fn])=>{try{return {n,ok:true,v:await fn(call)}}catch(e){return {n,ok:false,v:[]}}}));
  const all=[];res.forEach(r=>r.v.forEach(x=>{if(!x.rx||x.band==null)return;if(!x.pos)x.pos=rxPos(x.rx,null);if(x.km==null&&x.pos)try{x.km=Math.round(window.ACRACB_geoKm?ACRACB_geoKm(TXP,x.pos).km:distJS(TXP,x.pos))}catch(e){}all.push(x)}));
  const best=new Map();all.forEach(x=>{const k=x.rx+"|"+x.band;const b=best.get(k);if(!b||(x.t||0)>(b.t||0))best.set(k,x)});
  HR={call,at:Date.now(),list:[...best.values()],src:res.map(r=>[r.n,r.ok])};HBUSY=false;renderHeard()}
function hStatus(t){const e=$("hst");if(e)e.textContent=t}
function renderHeard(){const el=$("heardbox");if(!el)return;const call=S.get("acracb_mycall")||((typeof LOG!=="undefined"&&LOG&&LOG.call)||"");
  if(!$("hcall")){el.innerHTML=`<p>Llama CQ dos o tres minutos y pulsa <b>Comprobar</b>: verás qué estaciones del mundo te han oído en la última hora, en qué banda y con qué señal. Busca tu indicativo en los clústeres DX (HamQTH, DX Summit y los que lee la plataforma), en Reverse Beacon (CW y RTTY), en PSK Reporter (FT8 y FT4) y en WSPRnet. <button class="lnk" id="hclub">Probar con el del club, EA5RKB</button></p>
    <div class="hcrow"><input id="hcall" type="text" autocomplete="off" spellcheck="false" maxlength="14" placeholder="Indicativo" aria-label="Tu indicativo" value="${esc2(call)}"><button class="btn" id="hgo">Comprobar</button></div><p class="note" id="hst"></p><div id="hres"></div>`;
    $("hgo").onclick=()=>checkHeard(true);$("hclub").onclick=()=>{const prev=S.get("acracb_mycall");$("hcall").value="EA5RKB";checkHeard(true).then(()=>{if(prev)S.set("acracb_mycall",prev)})};$("hcall").addEventListener("keydown",e=>{if(e.key==="Enter")checkHeard(true)});
    $("hcall").addEventListener("input",e=>{e.target.value=e.target.value.toUpperCase()})}
  {const hc=$("hcall");if(hc&&!hc.value&&call&&document.activeElement!==hc)hc.value=call}
  const out=$("hres");if(!out)return;if(!HR){out.innerHTML="";return}
  const L2=HR.list,okS=HR.src.filter(s=>s[1]).map(s=>s[0]),koS=HR.src.filter(s=>!s[1]).map(s=>s[0]);
  if(!L2.length){hStatus(`Nadie ha informado de ${HR.call} en la última hora.${koS.length?" Sin respuesta de: "+koS.join(", ")+".":""}`);out.innerHTML=`<p class="note">Si acabas de llamar, espera un par de minutos y vuelve a comprobar. Los receptores automáticos solo informan de llamadas CQ en CW, RTTY, FT8, FT4 y WSPR; en SSB dependes de que alguien te anuncie en el clúster.</p>`;return}
  const byB={};L2.forEach(x=>{(byB[x.band]=byB[x.band]||[]).push(x)});
  const far=L2.slice().sort((a,b)=>(b.km==null?-1:b.km)-(a.km==null?-1:a.km));
  hStatus(`${HR.call}: te han oído ${L2.length} estaciones en la última hora · comprobado a las ${new Date(HR.at).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}${koS.length?" · sin respuesta de "+koS.join(", "):""}.`);
  out.innerHTML=`<div class="hbands">${Object.entries(byB).sort((a,b)=>b[1].length-a[1].length).map(([b,a])=>{const mx=Math.max(...a.map(x=>x.km||0)),sn=a.filter(x=>x.snr!=null).map(x=>x.snr);
      return `<div class="chip"><div class="k" style="color:${BC[b]}">${BANDS[b]}</div><div class="v">${a.length}</div><div class="t">estaciones · hasta ${fk(mx)} km${sn.length?` · mejor ${(m=>(m>0?"+":"")+m)(Math.max(...sn))} dB`:""}</div></div>`}).join("")}</div>
    <h3>Los que más lejos te han oído</h3><div class="goal">${far.slice(0,12).map(x=>{const age=x.t?Math.max(0,Math.round((Date.now()-x.t)/6e4)):null;let az=null;try{if(x.pos)az=Math.round(brgJS(TXP,x.pos))}catch(e){}
      if(window.ACRACB_card)return ACRACB_card({call:x.rx,a:age,band:x.band,mode:x.mode||"",tags:x.snr!=null?[`<span class="xtag xq">${x.snr>0?"+":""}${esc2(x.snr)} dB</span>`]:[],byLbl:"Fuente",by:esc2(x.src),geo:(x.pos&&window.ACRACB_geo&&ACRACB_geo(x.pos))||(x.km!=null&&az!=null?{az,laz:(az+180)%360,km:x.km}:null)});
      return `<div class="sp"><span class="f" style="color:${BC[x.band]}">${BANDS[x.band]}</span><span><b>${CS(x.rx)}</b>${x.snr!=null?` · <b>${x.snr>0?"+":""}${x.snr} dB</b>`:""}</span><span class="w">${x.km!=null?fk(x.km)+" km":"distancia desconocida"}${az!=null?` · ${az}° ${cab(az)}`:""} · ${x.mode?esc2(x.mode)+" · ":""}${esc2(x.src)}${age!=null?` · ${ageTxt(age)}`:""}</span></div>`}).join("")}</div>
    <p class="note">dB: relación señal/ruido con que te reciben. En CW (Reverse Beacon), +10 dB o más es una señal cómoda; en FT8 y WSPR se descodifica hasta −20 y −28 dB.</p>`}
/* se vuelve a comprobar solo cada 5 minutos mientras tienes abierta la pestaña */
setInterval(()=>{try{if(document.visibilityState==="hidden"||ART)return;const d=$("f_heard");if(!d||d.classList.contains("toff")||!d.offsetParent)return;if(S.get("acracb_mycall")&&Date.now()-HLAST>5*6e4)checkHeard(false)}catch(e){}},30000);

/* =================== POTA / SOTA: filtro rápido en el clúster =================== */
let PSO=false;
function psoBtn(){const h=$("dxmodes");if(!h||$("psobtn"))return;const b=document.createElement("button");b.id="psobtn";b.type="button";b.className="btn psob";b.setAttribute("aria-pressed","false");
  b.textContent="Solo parques y cumbres";b.title="Muestra solo actividades POTA, WWFF y SOTA";
  b.onclick=()=>{PSO=!PSO;b.setAttribute("aria-pressed",String(PSO));try{refresh()}catch(e){}};h.insertAdjacentElement("afterend",b)}
function wrapSpots(){try{const s0=SPOTS;if(s0.__x)return;const w=function(){const a=s0.apply(this,arguments);return PSO?a.filter(s=>/POTA|SOTA|WWFF/i.test(String(s.ref||"")+" "+String(s.c||"")+" "+String(s.src||""))):a};w.__x=1;SPOTS=w}catch(e){}}

/* =================== notificaciones en el dispositivo =================== */
const canN="Notification" in window&&!ART;
let SWR=null;
if(!ART&&"serviceWorker" in navigator&&location.protocol==="https:"){navigator.serviceWorker.register("sw.js").then(r=>{SWR=r}).catch(()=>{})}
function notifOn(){return canN&&Notification.permission==="granted"&&S.get("acracb_notif")==="1"}
function notify(title,body){try{if(SWR&&SWR.showNotification){SWR.showNotification(title,{body,tag:"acracb-"+title,icon:document.querySelector('link[rel="apple-touch-icon"]')?.href});return}new Notification(title,{body})}catch(e){}}
function notifUI(){const host=$("alerts");if(!host||!canN)return;let w=$("notifw");if(!w){w=document.createElement("div");w.id="notifw";w.className="notifw";host.insertAdjacentElement("beforebegin",w)}
  const st=Notification.permission,on=notifOn();
  w.innerHTML=st==="denied"?`<p class="note">Las notificaciones están desactivadas para esta web. Si quieres avisos, actívalas en los ajustes del navegador.</p>`:
    `<button class="btn" id="notifb" aria-pressed="${on}">${on?"Notificaciones activadas":"Avisarme con una notificación"}</button><span class="note"> ${on?"Te llegará un aviso cuando aparezca en el clúster una DXpedición o entidad que te falte, mientras la web esté abierta (en el iPhone y el iPad, guardada en la pantalla de inicio).":"Para que te avise aunque estés en otra app o pestaña."}</span>`;
  const b=$("notifb");if(b)b.onclick=async()=>{if(notifOn()){S.set("acracb_notif","0");notifUI();return}try{const p=await Notification.requestPermission();if(p==="granted"){S.set("acracb_notif","1");try{(L.alert&&L.alert.items||[]).forEach(x=>SEEN.add(x.call+"|"+x.band))}catch(e){}notify("ACRACB DX","Notificaciones activadas: te avisaré de lo que te falte.")}}catch(e){}notifUI()}}
const SEEN=new Set((()=>{try{return JSON.parse(S.get("acracb_nseen")||"[]")}catch(e){return []}})());
function checkNotify(){if(!notifOn())return;if(window.ACRACB_alMuted&&ACRACB_alMuted())return;const al=L.alert;if(!al||!al.items)return;const fresh=al.items.filter(x=>{if(window.ACRACB_alOK&&!ACRACB_alOK(x))return false;const k=x.call+"|"+x.band;if(SEEN.has(k))return false;SEEN.add(k);return true});
  if(fresh.length){const x=fresh[0];notify(`${x.call} en ${BANDS[x.band]||""} ${x.mode||""}`.trim(),`${x.f} · ${x.t} UTC · te falta${x.need?" ("+x.need+")":""}${fresh.length>1?(window.ACRACB_LANG==="en"?` · and ${fresh.length-1} more`:` · y ${fresh.length-1} más`):""}`);S.set("acracb_nseen",JSON.stringify([...SEEN].slice(-300)))}}

/* =================== arranque =================== */
function all(){try{meteorNote()}catch(e){}try{qrpCard()}catch(e){}try{renderHeard()}catch(e){}try{notifUI()}catch(e){}}
function hook(){wrapSpots();
  try{const r0=refresh;refresh=function(){const v=r0.apply(this,arguments);all();return v}}catch(e){}
  try{const a0=renderAlerts;renderAlerts=function(){const v=a0.apply(this,arguments);try{notifUI();checkNotify()}catch(e){}return v}}catch(e){}
  all();try{checkNotify()}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(hook,20));else setTimeout(hook,20);
})();
