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
  if(!out.length){m=c.match(/skimmer/i);return m?" · "+esc2(m[0]):""}
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
/* 2.10.4: QRP completo: qué bandas abren ahora con 5 W en cada modo (mismo modelo que el resto de la plataforma),
   cuánto pierdes frente a tu potencia, antenas, operativa, lugares y trucos. */
let QW=5;
function qrpCard(){const el=$("qrpbox");if(!el)return;const EN=window.ACRACB_LANG==="en",T=(a,b)=>EN?b:a;const eq=$("eq");const P=Math.max(1,+(eq&&eq.value)||100);
  let grid="",best=[];try{const lh=localNow(),TGM=TG().filter(t=>t.km>=800),bands=BI().filter(b=>b<=10),mods=[["cw","CW"],["ssb","SSB"],["ft8","FT8"]];
    const dP=-10*Math.log10(P/QW);
    const cell=(b,k)=>{const ex=(MODES[k].adj-MD().adj)+dP;let n=0,top=null,tp=0;for(const t of TGM){const r=prob(t,lh,b,false,ex);const p=r.p;if(p>=.3){n++;if(p>tp){tp=p;top=t}}}return {n,top,tp}};
    const rows=bands.map(b=>{const c=mods.map(([k])=>cell(b,k));return {b,c}}).filter(r=>r.c.some(x=>x.n));
    const col=n=>n>=40?"c5":n>=20?"c4":n>=8?"c3":n>=1?"c2":"c0";
    grid=rows.length?`<div class="scroll"><table class="bt qrpg"><tr><th>${T("Banda","Band")}</th>${mods.map(m=>`<th>${T("En","On")} ${m[1]}</th>`).join("")}</tr>${rows.map(r=>`<tr><td><b style="color:${BC[r.b]}">${BANDS[r.b]}</b></td>${r.c.map(x=>`<td>${x.n?`<span class="pill ${col(x.n)}">${x.n}</span> ${x.n===1?T("destino al alcance","destination in reach"):T("destinos al alcance","destinations in reach")}${x.top?`<br><small>${T("el más fácil","easiest")}: <b>${esc(x.top.name.split(" (")[0])}</b> (${Math.round(x.tp*100)} %)</small>`:""}`:`<span class="note">${T("cerrada: nada al alcance","closed: nothing in reach")}</span>`}</td>`).join("")}</tr>`).join("")}</table></div>`
      :`<div class="empty">${T(`Ahora, con ${QW} W, ninguna banda llega con seguridad a más de 800 km. Prueba FT8 o espera a la línea gris.`,`Right now, with ${QW} W, no band reliably reaches beyond 800 km. Try FT8 or wait for the greyline.`)}</div>`;
    rows.forEach(r=>r.c.forEach((x,i)=>{if(x.n)best.push({b:r.b,m:mods[i][1],n:x.n,t:x.top})}));best.sort((a,b)=>b.n-a.n)}catch(e){}
  const loss=10*Math.log10(P/QW);const b0=best[0];
  el.innerHTML=`<h3>${T("Qué puedes hacer ahora con poca potencia","What you can do now with low power")}</h3>
  <div class="seg qrpw" role="group" aria-label="${T("Potencia QRP","QRP power")}"><span class="segl">${T("Potencia","Power")}</span>${[1,5,10].map(w=>`<button type="button" data-qw="${w}" aria-pressed="${QW===w}">${w} W</button>`).join("")}</div>
  <p>${b0?T(`Lo mejor ahora: <b>${BANDS[b0.b]} en ${b0.m}</b>, con ${b0.n} destinos a más de 800 km${b0.t?`, por ejemplo ${esc(b0.t.name.split(" (")[0])}`:""}.`,`Best right now: <b>${BANDS[b0.b]} on ${b0.m}</b>, with ${b0.n} destinations beyond 800 km${b0.t?`, for example ${esc(b0.t.name.split(" (")[0])}`:""}.`):""} ${P>QW?T(`Con ${QW} W tu señal llega ${loss.toFixed(1).replace(".",",")} dB más débil que con tus ${P} W: unas ${String(Math.round(loss/6*10)/10).replace(".",",")} unidades S menos.`,`With ${QW} W your signal arrives ${loss.toFixed(1)} dB weaker than with your ${P} W: about ${Math.round(loss/6*10)/10} S-units less.`):""}</p>
  ${b0?`<p class="qrpex">${T(`Cómo se lee: en <b>${BANDS[b0.b]}</b> con <b>${b0.m}</b> y ${QW} W puedes llegar ahora a <b>${b0.n} destinos</b> (países o zonas a más de 800 km); el más fácil es ${esc(b0.t?b0.t.name.split(" (")[0]:"")}.`,`How to read it: on <b>${BANDS[b0.b]}</b> with <b>${b0.m}</b> and ${QW} W you can now reach <b>${b0.n} destinations</b> (countries or areas beyond 800 km); the easiest is ${esc(b0.t?b0.t.name.split(" (")[0]:"")}.`)}</p>`:""}
  <p class="note">${T(`Cada casilla: cuántos destinos a más de 800 km puedes trabajar ahora con ${QW} W en esa banda y ese modo (al menos un 30 % de fiabilidad) y cuál es el más probable.`,`Each cell: how many destinations beyond 800 km you can work now with ${QW} W on that band and mode (at least 30 % reliability) and which is the most likely.`)}</p>
  ${grid}<p class="note">${T(`Destinos a más de 800 km con al menos un 30 % de fiabilidad a esta hora, con ${QW} W y tu antena. Mismo modelo que el resto de la plataforma.`,`Destinations beyond 800 km with at least 30 % reliability at this hour, with ${QW} W and your antenna. Same model as the rest of the platform.`)}</p>
  <details class="qrpd"><summary>${T("Frecuencias QRP (IARU Región 1)","QRP frequencies (IARU Region 1)")}</summary><div class="scroll"><table class="bt qrpt"><tr><th>${T("Banda","Band")}</th><th>CW</th><th>SSB</th></tr>${QRPF.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table></div><p class="note">${T("En MHz. En FT8 y FT4 no hay frecuencia QRP: usa las normales.","In MHz. FT8 and FT4 have no QRP frequency: use the usual ones.")}</p></details>
  <details class="qrpd"><summary>${T("Antenas que rinden con poca potencia","Antennas that pay off at low power")}</summary><ul class="stl">
   <li>${T("<b>Dipolo o dipolo en V invertida</b> a media onda de altura o más: barato, sin acoplador y con poca pérdida. Es la referencia.","<b>Dipole or inverted V</b> at half a wavelength or higher: cheap, no tuner and low loss. It is the benchmark.")}</li>
   <li>${T("<b>EFHW (media onda alimentada en un extremo)</b>: un solo hilo colgado de un árbol o una caña; ideal para portable y para SOTA.","<b>EFHW (end-fed half-wave)</b>: a single wire hung from a tree or a pole; ideal for portable and SOTA.")}</li>
   <li>${T("<b>Vertical de cuarto de onda con radiales</b> junto al mar: el agua salada le da varios dB de ángulo bajo para el DX.","<b>Quarter-wave vertical with radials</b> by the sea: salt water gives it several dB of low angle for DX.")}</li>
   <li>${T("<b>Directiva pequeña</b> (2 o 3 elementos) en 20–10 m: 5 W con 6 dB de ganancia equivalen a unos 20 W con un dipolo.","<b>Small Yagi</b> (2 or 3 elements) on 20–10 m: 5 W with 6 dB of gain is like about 20 W into a dipole.")}</li>
   <li>${T("Evita lo que pierde potencia: cable largo y fino, acopladores con mucha ROE y antenas acortadas con bobinas.","Avoid what wastes power: long thin coax, tuners at high SWR and coil-shortened antennas.")}</li></ul>
   <p class="note">${T("Puedes comparar tu antena con otras en «Editar estación» › Antena: toda la plataforma se recalcula.","You can compare your antenna with others in “Edit station” › Antenna: the whole platform recalculates.")}</p></details>
  <details class="qrpd"><summary>${T("Cómo operar en QRP","How to operate QRP")}</summary><ul class="stl">
   <li>${T("<b>Busca y contesta antes que llamar CQ</b>: quien llama CQ suele tener buena antena y oído; tú solo tienes que llegar a él.","<b>Search and pounce rather than calling CQ</b>: whoever calls CQ usually has a good antenna and ears; you only need to reach them.")}</li>
   <li>${T("<b>Modo</b>: la CW gana unos 11 dB a la SSB y el FT8 unos 27: con 5 W en FT8 es como 2.500 W en SSB.","<b>Mode</b>: CW gains about 11 dB over SSB and FT8 about 27: 5 W on FT8 is like 2,500 W on SSB.")}</li>
   <li>${T("<b>Horario</b>: bandas altas de día y línea gris al amanecer y al atardecer; evita las horas con Kp alto.","<b>Timing</b>: high bands by day and greyline at sunrise and sunset; avoid times with high Kp.")}</li>
   <li>${T("<b>Llama corto y en el momento justo</b>: tu indicativo una o dos veces, cuando la otra estación acaba de escuchar.","<b>Call short and at the right moment</b>: your callsign once or twice, just when the other station starts listening.")}</li>
   <li>${T("Comprueba quién te oye en <b>DX › ¿Me oyen?</b> tras dos minutos de CQ o FT8.","Check who hears you in <b>DX › Who hears me?</b> after two minutes of CQ or FT8.")}</li>
   <li>${T("En SSB, el procesador de voz (compresor) da unos 3–6 dB de inteligibilidad: actívalo con mesura.","On SSB the speech processor gives about 3–6 dB of intelligibility: use it with care.")}</li></ul></details>
  <details class="qrpd"><summary>${T("Lugares que ayudan","Places that help")}</summary><ul class="stl">
   <li>${T("<b>Junto al mar</b>, sobre todo con la antena vertical en la playa: el mejor plano de tierra posible.","<b>By the sea</b>, especially with the vertical on the beach: the best possible ground plane.")}</li>
   <li>${T("<b>Una cumbre despejada</b> (SOTA): el terreno que cae delante equivale a subir mucho la antena; y quien activa una cumbre recibe muchas llamadas.","<b>A clear summit</b> (SOTA): ground falling away in front is like raising the antenna a lot; and summit activators get many calls.")}</li>
   <li>${T("<b>Un parque o espacio protegido</b> (POTA, WWFF): poco ruido eléctrico y estaciones buscándote.","<b>A park or protected area</b> (POTA, WWFF): little electrical noise and stations looking for you.")}</li>
   <li>${T("<b>Lejos del ruido</b>: en ciudad, el ruido local (S7–S9) se come tu recepción; en el campo oyes señales que en casa no existen.","<b>Away from noise</b>: in town, local noise (S7–S9) eats your reception; in the country you hear signals that do not exist at home.")}</li></ul>
   <p class="note">${T("Los activadores de SOTA, POTA y WWFF están en DX › Clúster.","SOTA, POTA and WWFF activators are in DX › Cluster.")}</p></details>`;
  el.querySelectorAll("[data-qw]").forEach(b=>b.onclick=()=>{QW=+b.dataset.qw;qrpCard()})}

/* =================== ¿Me oyen? =================== */
let HR=null,HBUSY=false,HLAST=0;window.ACRACB_heardList=()=>HR?{at:HR.at,band:null,list:HR.list}:null;
const MEMO={};
async function memo(k,min,fn){const m=MEMO[k];if(m&&Date.now()-m.t<min*6e4)return m.v;const v=await fn();MEMO[k]={t:Date.now(),v};return v}
function rxPos(call,loc){try{if(loc&&typeof normLoc==="function"&&normLoc(loc))return locToLL(loc)}catch(e){}try{const ap=window.ACRACB_areaPos&&ACRACB_areaPos(call);if(ap)return ap}catch(e){}try{const e=callEnt(call);if(e&&e.lon!=null)return [e.lon,e.lat];if(e&&e.dxcc){const m=(V.meta||[]).find(x=>x[2]===e.dxcc);if(m)return [m[5],m[4]]}}catch(e){}return null}
async function fromSpothole(call){let j;try{j=await get("https://spothole.app/api/v1/spots?max_age=3600&dx_call="+encodeURIComponent(call),"json")}catch(e){j=await get("https://spothole.app/api/v1/spots?max_age=3600","json")}const a=Array.isArray(j)?j:(j.spots||j.data||[]);
  return a.filter(s=>base(s.dx_call||s.dx||s.callsign)===call&&!/PSK/i.test(String(s.source||""))).map(s=>{const c=String(s.comment||s.info||"");const db=c.match(/(-?\d+)\s*dB/i);const f=+(s.freq||s.frequency||0);const fm=f>1e6?f/1e6:f>1000?f/1000:f;
    const src=/RBN/i.test(String(s.source||""))?"Reverse Beacon":"Clúster";
    const la=+(s.de_latitude||s.de_lat),lo=+(s.de_longitude||s.de_lon);
    return {rx:base(s.de_call||s.spotter||s.de),pos:isFinite(la)&&isFinite(lo)&&(la||lo)?[lo,la]:null,f:fm,band:bandOf(fm),mode:s.mode||(src==="Reverse Beacon"?"CW":""),snr:db?+db[1]:null,t:Date.parse(s.time_iso||s.time||s.spot_time)||(+s.time>1e9?+s.time*1000:null),src}})}
/* clústeres DX clásicos: HamQTH y los spots que ya tiene la plataforma */
async function fromCluster(call){const out=[];const add=(rx,fq,mode,t,c,src)=>{const f=+fq>1000?+fq/1000:+fq;const db=String(c||"").match(/(-?\d+)\s*dB/i);out.push({rx:base(rx),pos:null,f,band:bandOf(f),mode:mode||"",snr:db?+db[1]:null,t,src,c:c||""})};
  const tasks=[(async()=>{const t=await get("https://www.hamqth.com/dxc_csv.php?limit=200","text");t.split("\n").map(l=>l.split("^")).filter(p=>p.length>=5&&base(p[2])===call).forEach(p=>add(p[0],p[1],"",Date.parse(String(p[4]).replace(" ","T")+(/Z$/.test(p[4])?"":"Z"))||null,p[3],"HamQTH"))})()];
  const r=await Promise.allSettled(tasks);
  try{(L.spots||[]).filter(s=>base(s.call)===call).forEach(s=>String(s.by||"").split(/[ ,]+/).filter(Boolean).forEach(by=>add(by,s.f,s.mode,Date.parse(s.utc||"")||null,s.c,"Clúster")))}catch(e){}
  if(r.every(x=>x.status==="rejected")&&!out.length)throw new Error("sin respuesta");return out}
async function fromWSPR(call){const q=`SELECT toUnixTimestamp(time) t,rx_sign,rx_loc,rx_lat,rx_lon,frequency,snr,distance FROM wspr.rx WHERE tx_sign='${call.replace(/[^A-Z0-9\/]/g,"")}' AND time>now()-3600 ORDER BY time DESC LIMIT 300 FORMAT JSON`;
  const j=await get("https://db1.wspr.live/?query="+encodeURIComponent(q),"json");return (j.data||[]).map(r=>{const f=+r.frequency/1e6;return {rx:base(r.rx_sign),pos:[+r.rx_lon,+r.rx_lat],f,band:bandOf(f),mode:"WSPR",snr:+r.snr,t:+r.t*1000,src:"WSPRnet",km:+r.distance}})}
/* 2.10.44: Reverse Beacon Network en el resumen de HamQTH (datos gratuitos, «Data provided by HamQTH.com»): cada skimmer con su SNR */
async function fromRBN(call){const j=await memo("rbn",2,()=>get("https://www.hamqth.com/rbn_data.php?data=1&age=3600&order=3","json"));const out=[];
  for(const [k,v] of Object.entries(j&&typeof j==="object"?j:{})){if(!v||base(v.dxcall||k)!==call)continue;const f=+String(v.freq||"").replace(/\s/g,"")/1000;if(!isFinite(f)||!f)continue;
    const t=Date.now()-(+v.age||0)*1000;for(const [rx,snr] of Object.entries(v.lsn||{}))out.push({rx:base(rx),pos:null,f,band:bandOf(f),mode:v.mode||"CW",snr:isFinite(+snr)?+snr:null,t,src:"Reverse Beacon"})}
  return out}
async function checkHeard(manual){const call=base(($("hcall")||{}).value||S.get("acracb_mycall")||"");if(!call||call.length<3){if(manual)hStatus("Escribe tu indicativo.");return}
  if(ART){hStatus("Esta comprobación funciona en la versión web de la plataforma, no aquí.");return}
  if(HBUSY)return;HBUSY=true;HLAST=Date.now();S.set("acracb_mycall",call);hStatus("Buscando quién te ha oído en la última hora…");
  const src=[["Reverse Beacon",fromSpothole],["HamQTH RBN",fromRBN],["clústeres DX",fromCluster],["WSPRnet",fromWSPR]];
  const res=await Promise.all(src.map(async([n,fn])=>{try{return {n,ok:true,v:await fn(call)}}catch(e){return {n,ok:false,v:[]}}}));
  const all=[];res.forEach(r=>r.v.forEach(x=>{if(!x.rx||x.band==null)return;if(!x.pos)x.pos=rxPos(x.rx,null);if(x.km==null&&x.pos)try{x.km=Math.round(window.ACRACB_geoKm?ACRACB_geoKm(TXP,x.pos).km:distJS(TXP,x.pos))}catch(e){}all.push(x)}));
  const best=new Map();all.forEach(x=>{const k=x.rx+"|"+x.band;const b=best.get(k);if(!b||(x.t||0)>(b.t||0))best.set(k,x)});
  HR={call,at:Date.now(),list:[...best.values()],src:res.map(r=>[r.n,r.ok])};HBUSY=false;renderHeard()}
function hStatus(t){const e=$("hst");if(e)e.textContent=t}
function renderHeard(){const el=$("heardbox");if(!el)return;const call=S.get("acracb_mycall")||((typeof LOG!=="undefined"&&LOG&&LOG.call)||"");
  if(!$("hcall")){el.innerHTML=`<p>Llama CQ dos o tres minutos y pulsa <b>Comprobar</b>: verás quién te ha oído en la última hora, en qué banda y con qué señal, según los clústeres DX, Reverse Beacon (a través de Spothole y HamQTH) y WSPRnet. <button class="lnk" id="hclub">Probar con el del club, EA5RKB</button></p>
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

/* 2.8.27: se quita el antiguo botón «Solo parques y cumbres»: nunca llegaba a mostrarse y el buscador del clúster ya filtra POTA, SOTA y WWFF */
/* =================== notificaciones en el dispositivo =================== */
/* 2.8.3: repaso para todos los aparatos.
   - Se envían siempre a través del service worker (Android, iPhone, iPad y Chrome no admiten «new Notification»), esperando a que esté listo.
   - Con las notificaciones activadas y sin silenciar, la plataforma sigue buscando avisos cada 3 minutos aunque esté en segundo plano
     (en el ordenador y en Android mientras el navegador siga abierto; el iPhone y el iPad pausan las webs al poco de salir de ellas).
   - Silencio (1 hora, hasta mañana a las 8:00 o hasta reactivarlo) y botón de prueba en el mismo sitio que el interruptor. */
const TT=(es,en)=>window.ACRACB_LANG==="en"?en:es;
const e2=s=>String(s==null?"":s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const canN="Notification" in window&&!ART;
const canSW=!ART&&"serviceWorker" in navigator&&location.protocol==="https:";
let SWR=null;
if(canSW){navigator.serviceWorker.register("sw.js").then(r=>{SWR=r}).catch(()=>{})}
function notifOn(){return canN&&Notification.permission==="granted"&&S.get("acracb_notif")==="1"}
window.ACRACB_notifOn=notifOn;
/* 2.10.38: se espera a que el service worker esté ACTIVO (antes se usaba el registro recién hecho aunque aún no lo estuviera:
   en el iPhone, el iPad y Android eso fallaba en silencio y el aviso se perdía). Se guarda el motivo del último fallo. */
let NERR="";
async function swReg(){if(!canSW)return null;if(SWR&&SWR.active)return SWR;try{const r=await Promise.race([navigator.serviceWorker.ready,new Promise(ok=>setTimeout(()=>ok(null),10000))]);if(r)SWR=r;return r}catch(e){return null}}
async function notify(title,body,tag){const ic=(document.querySelector('link[rel="apple-touch-icon"]')||{}).href;const o={body,tag:tag||("acracb-"+title),icon:ic,badge:ic,lang:window.ACRACB_LANG==="en"?"en":"es",renotify:true,data:{url:location.href.split("#")[0]}};
  NERR="";try{const r=await swReg();if(r&&r.showNotification){await r.showNotification(title,o);return true}if(canSW)NERR=TT("el service worker no se ha activado","the service worker did not activate")}catch(e){NERR=String(e&&e.message||e)}
  try{new Notification(title,o);return true}catch(e){if(!NERR)NERR=String(e&&e.message||e)}return false}
window.ACRACB_notify=notify;
const IOSD=(()=>{try{return /iP(hone|ad|od)/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1)}catch(e){return false}})();
const STDA=(()=>{try{return matchMedia("(display-mode: standalone)").matches||navigator.standalone===true}catch(e){return false}})();
let NHELP=false,NMSG="";
function notifHelp(){return IOSD&&!STDA?`<p class="note nhelp">${TT("En el iPad y el iPhone, Safari solo deja enviar notificaciones a las webs guardadas en la pantalla de inicio. Toca Compartir (el cuadrado con la flecha hacia arriba), elige «Añadir a pantalla de inicio», abre la plataforma desde ese icono y pulsa aquí otra vez.","On iPad and iPhone, Safari only lets websites saved to the Home Screen send notifications. Tap Share (the square with the up arrow), choose «Add to Home Screen», open the platform from that icon and tap here again.")}</p>`:
  IOSD?`<p class="note nhelp">${TT("Para recibir notificaciones de webs, el iPad y el iPhone necesitan iOS o iPadOS 16.4 o posterior. Actualízalo en Ajustes › General › Actualización de software.","To get website notifications, iPad and iPhone need iOS or iPadOS 16.4 or later. Update it in Settings › General › Software Update.")}</p>`:
  `<p class="note nhelp">${TT("Este navegador no deja enviar notificaciones de webs. Abre la plataforma en Chrome, Edge, Firefox o Safari para activarlas.","This browser does not let websites send notifications. Open the platform in Chrome, Edge, Firefox or Safari to turn them on.")}</p>`}
function deniedHelp(){return IOSD?TT("Las has bloqueado. Actívalas en Ajustes › Notificaciones › ACRACB DX.","You have blocked them. Turn them on in Settings › Notifications › ACRACB DX."):
  /Android/i.test(navigator.userAgent)?TT("Las has bloqueado. Toca el candado junto a la dirección (o mantén pulsado el icono de la app › Información) › Notificaciones › Permitir.","You have blocked them. Tap the padlock next to the address (or long-press the app icon › App info) › Notifications › Allow."):
  TT("Las has bloqueado. Haz clic en el candado junto a la dirección › Notificaciones › Permitir, y recarga la página.","You have blocked them. Click the padlock next to the address › Notifications › Allow, and reload the page.")}
function scopeTxt(){return IOSD?TT("En el iPhone y el iPad llegan mientras la plataforma está abierta desde su icono y unos instantes después de salir: iOS pausa las webs en segundo plano.","On iPhone and iPad they arrive while the platform is open from its icon and for a short while after you leave it: iOS pauses websites in the background."):
  TT("Llegan aunque estés en otra app o pestaña, mientras el navegador siga abierto; se busca cada 3 minutos.","They arrive even when you are in another app or tab, as long as the browser stays open; it checks every 3 minutes.")}
function muteRow(){const m=window.ACRACB_alMuted&&ACRACB_alMuted();
  /* silenciadas: ya lo dice el aviso de justo debajo, con su botón «Reactivar» */
  return m?""
   :`<span class="nmute">${TT("Silenciar:","Mute:")} <button type="button" class="lnk" data-mute="60">${TT("1 hora","1 hour")}</button> · <button type="button" class="lnk" data-mute="tom">${TT("hasta mañana a las 8:00","until 8:00 tomorrow")}</button> · <button type="button" class="lnk" data-mute="inf">${TT("hasta que las reactive","until I turn them back on")}</button></span>`}
/* 2.10.38: estado a la vista: cuándo se comprobó por última vez y cuál fue la última notificación */
function nstat(){const hm=t=>new Date(t).toLocaleTimeString(TT("es-ES","en-US"),{hour:"2-digit",minute:"2-digit"});const b=[];
  if(NCHK)b.push(TT(`Última comprobación ${hm(NCHK.at)}: ${NCHK.n} aviso${NCHK.n===1?"":"s"}, ${NCHK.f?NCHK.f+" nuevo"+(NCHK.f===1?"":"s"):"ninguno nuevo"}`,`Last check ${hm(NCHK.at)}: ${NCHK.n} alert${NCHK.n===1?"":"s"}, ${NCHK.f?NCHK.f+" new":"none new"}`));
  if(NLAST)b.push(TT(`última notificación ${hm(NLAST.at)} (${NLAST.call})`,`last notification ${hm(NLAST.at)} (${NLAST.call})`));
  return b.length?`<p class="note nstat">${e2(b.join(" · "))}.</p>`:""}
function notifUI(){const host=$("alerts");if(!host||ART)return;let w=$("notifw");if(!w){w=document.createElement("div");w.id="notifw";w.className="notifw";host.insertAdjacentElement("beforebegin",w)}
  const msg=NMSG?`<p class="note nmsg">${e2(NMSG)}</p>`:"";
  if(!canN){w.innerHTML=`<button class="btn" id="notifb" aria-expanded="${NHELP}" title="${TT("Para que te avise aunque estés en otra app o pestaña","So it can alert you even when you are in another app or tab")}">${TT("Avisarme con una notificación","Notify me")}</button>${NHELP?notifHelp():""}`;
    $("notifb").onclick=()=>{NHELP=!NHELP;notifUI()};return}
  const pm=Notification.permission,on=notifOn();
  if(pm==="denied"){w.innerHTML=`<p class="note nhelp">${TT("Notificaciones desactivadas para esta web.","Notifications are off for this site.")} ${deniedHelp()}</p>`;return}
  w.innerHTML=`<button class="btn" id="notifb" aria-pressed="${on}">${on?TT("Notificaciones activadas","Notifications on"):TT("Avisarme con una notificación","Notify me")}</button>`+
    (on?`<button type="button" class="btn" id="notift">${TT("Probar","Test")}</button>`:"")+
    `<span class="note nscope">${on?TT("Te avisará de lo que te falte, de las DXpediciones y del DX curioso o lejano que elijas aquí abajo, con tu modo y tus bandas. ","It will alert you to what you need, DXpeditions and the unusual or far DX you choose below, in your mode and bands. ")+scopeTxt():""}</span>`+
    (on?muteRow():"")+(on?nstat():"")+msg;
  const b=$("notifb");if(b)b.onclick=async()=>{NMSG="";if(notifOn()){S.set("acracb_notif","0");notifUI();return}
    if(IOSD&&!STDA){NHELP=true;w.insertAdjacentHTML("beforeend",notifHelp());return}
    try{const p=await Notification.requestPermission();if(p==="granted"){S.set("acracb_notif","1");try{(L.alert&&L.alert.items||[]).forEach(x=>SEEN.add(x.call+"|"+x.band));SEEN.save()}catch(e){}
      const ok=await notify("ACRACB DX",TT("Notificaciones activadas: te avisaré de lo que te falte.","Notifications on: I will let you know about what you need."),"acracb-on");if(!ok)NMSG=TT("El permiso está concedido, pero este navegador no ha mostrado la notificación de prueba.","Permission is granted, but this browser did not show the test notification.")}}catch(e){}
    notifUI();try{window.ACRACB_updSched&&ACRACB_updSched()}catch(e){}};
  const t=$("notift");if(t)t.onclick=async()=>{const ok=await notify(TT("Prueba de ACRACB DX","ACRACB DX test"),TT("Si ves esto, las notificaciones funcionan en este aparato.","If you can see this, notifications work on this device."),"acracb-test");NMSG=ok?TT("Prueba enviada. Si no la ves, revisa el modo No molestar o Concentración del aparato.","Test sent. If you do not see it, check the device's Do Not Disturb or Focus mode."):TT("Este navegador no ha podido mostrarla.","This browser could not show it.")+(NERR?" ("+NERR+")":"");notifUI()}}
/* 2.10.38: lo ya avisado se recuerda 6 horas (antes, para siempre: una estación que volvía otro día ya no avisaba)
   y solo se da por avisado si la notificación ha salido de verdad */
const SEENH=6*36e5;const SEENM=new Map((()=>{try{const v=JSON.parse(S.get("acracb_nseen2")||"[]");return Array.isArray(v)?v:[]}catch(e){return []}})());
const SEEN={has:k=>{const t=SEENM.get(k);return t!=null&&Date.now()-t<SEENH},add:k=>{SEENM.set(k,Date.now())},save:()=>{const n=Date.now();for(const [k,t] of SEENM)if(n-t>=SEENH)SEENM.delete(k);S.set("acracb_nseen2",JSON.stringify([...SEENM].slice(-400)))}};
let NLAST=(()=>{try{return JSON.parse(S.get("acracb_nlast")||"null")}catch(e){return null}})(),NCHK=null,NBUSY=false;
function checkNotify(){if(!notifOn()||NBUSY)return;if(window.ACRACB_alMuted&&ACRACB_alMuted())return;const al=L.alert;if(!al||!al.items)return;
  const ok=al.items.filter(x=>!window.ACRACB_alOK||ACRACB_alOK(x)),fresh=ok.filter(x=>!SEEN.has(x.call+"|"+x.band));NCHK={at:Date.now(),n:ok.length,f:fresh.length};
  if(!fresh.length)return;const x=fresh[0];const EN=window.ACRACB_LANG==="en";NBUSY=true;
  Promise.resolve(notify(`${x.call} ${EN?"on":"en"} ${BANDS[x.band]||""} ${x.mode||""}`.trim(),`${x.f} · ${x.t} UTC · ${(x.sub==="rare"||x.sub==="cur"||x.sub==="far"||x.sub==="dxp")?(EN?(x.whyEn||x.why):x.why):(EN?"you need it":"te falta")+(x.why?" ("+(EN?(x.whyEn||x.why):x.why)+")":"")}${fresh.length>1?(EN?` · and ${fresh.length-1} more`:` · y ${fresh.length-1} más`):""}`,"acracb-"+x.call+"-"+x.band))
   .then(sent=>{if(sent){fresh.forEach(y=>SEEN.add(y.call+"|"+y.band));SEEN.save();NLAST={at:Date.now(),call:x.call,band:x.band};S.set("acracb_nlast",JSON.stringify(NLAST))}else NMSG=TT("No se ha podido mostrar la última notificación","The last notification could not be shown")+(NERR?": "+NERR:"")+".";try{notifUI()}catch(e){}})
   .finally(()=>{NBUSY=false})}
/* al volver a la plataforma se comprueba enseguida lo pendiente */
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")setTimeout(()=>{try{checkNotify()}catch(e){}},400)});
document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest("#notifw [data-mute],#notifw [data-unmute]"))setTimeout(()=>{try{notifUI()}catch(e){}},30)});

/* =================== arranque =================== */
function all(){try{meteorNote()}catch(e){}try{qrpCard()}catch(e){}try{renderHeard()}catch(e){}try{notifUI()}catch(e){}}
function hook(){
  try{const r0=refresh;refresh=function(){const v=r0.apply(this,arguments);all();return v}}catch(e){}
  try{const a0=renderAlerts;renderAlerts=function(){const v=a0.apply(this,arguments);try{checkNotify()}catch(e){}try{notifUI()}catch(e){}return v}}catch(e){}
  all();try{checkNotify()}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(hook,20));else setTimeout(hook,20);
})();
