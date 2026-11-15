/* ---- ACRACB: idioma (español / inglés de EE. UU.) ---- */
(function(){
"use strict";
const EN=window.ACRACB_LANG==="en";
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const WEB=!window.claude;const ESURL="./",ENURL="en.html",PUB="https://ea5jnf.github.io/plataforma-dx/";
/* quien eligió inglés entra directamente en inglés */
if(WEB&&!EN&&S.get("acracb_lang")==="en"&&!/[?&]es\b/.test(location.search)){location.replace(ENURL);return}
if(EN)S.set("acracb_lang","en");
/* ---------- inglés: nombres de entidades y regiones, y horas en formato de 24 h ---------- */
if(EN){
  const REG={"Canadá este (VE1-3)":"Eastern Canada (VE1-3)","Canadá oeste (VE7)":"Western Canada (VE7)","Rusia asiática centro (UA9)":"Central Asiatic Russia (UA9)","Rusia asiática este (UA0)":"Eastern Asiatic Russia (UA0)",
    "Brasil sureste (PY)":"Southeastern Brazil (PY)","Brasil nordeste (PY7)":"Northeastern Brazil (PY7)","Australia oeste (VK6)":"Western Australia (VK6)","Australia norte (VK8)":"Northern Australia (VK8)","Australia este (VK2-4)":"Eastern Australia (VK2-4)",
    "EE. UU. noreste (W1/W2)":"Northeastern USA (W1/W2)","EE. UU. sureste (W4)":"Southeastern USA (W4)","EE. UU. centro (W9/W0)":"Central USA (W9/W0)","EE. UU. sur (W5)":"Southern USA (W5)","EE. UU. oeste (W6/W7)":"Western USA (W6/W7)"};
  const enName=dx=>{try{const e=DXDg().d[dx];return e?e[1]:""}catch(x){return ""}};
  try{const cnt={};(V.meta||[]).forEach(m=>cnt[m[2]]=(cnt[m[2]]||0)+1);
    (V.meta||[]).forEach(m=>{if(REG[m[1]]){m[1]=REG[m[1]];return}const p=String(m[1]).match(/\(([^)]*)\)\s*$/);const n=enName(m[2]);if(n)m[1]=n+(p?` (${p[1]})`:"")})}catch(e){}
  try{dxName=function(dx){return enName(dx)}}catch(e){}
  /* las horas siempre en 24 h, como en la radio */
  try{const H=o=>o&&("hour" in o||"timeStyle" in o)&&!("hour12" in o)&&!("hourCycle" in o)?Object.assign({},o,{hourCycle:"h23"}):o;
    const t0=Date.prototype.toLocaleTimeString,s0=Date.prototype.toLocaleString;
    Date.prototype.toLocaleTimeString=function(l,o){return t0.call(this,l,Object.assign({hourCycle:"h23"},o||{}))};
    Date.prototype.toLocaleString=function(l,o){return s0.call(this,l,o?H(o):{hourCycle:"h23"})};
    const DTF=Intl.DateTimeFormat;Intl.DateTimeFormat=function(l,o){return new DTF(l,H(o))};Intl.DateTimeFormat.prototype=DTF.prototype;Intl.DateTimeFormat.supportedLocalesOf=DTF.supportedLocalesOf}catch(e){}
}
/* ---------- botón con la bandera, junto al de modo claro u oscuro ---------- */
function flag(cc){try{const f=DXDg().f[cc];return f?`<img alt="" width="22" height="15" src="data:image/svg+xml,${encodeURIComponent(f)}">`:cc}catch(e){return cc}}
function langBtn(){if(document.getElementById("langbtn"))return;const th=document.getElementById("thbtn");const host=th?th.parentElement:document.querySelector(".brow1 .clock");if(!host)return;
  const a=document.createElement("a");a.id="langbtn";a.className="thbtn langbtn";
  const to=EN?"es":"en";a.title=EN?"Ver en español":"View in English (US)";a.setAttribute("aria-label",a.title);a.setAttribute("hreflang",to);
  a.innerHTML=flag(EN?"US":"ES");
  if(WEB){a.href=EN?ESURL+"?es":ENURL;a.addEventListener("click",()=>S.set("acracb_lang",to))}
  else{a.href=PUB+(EN?"":"en.html");a.target="_blank";a.rel="noopener noreferrer";a.setAttribute("data-ext","")}
  if(th)host.insertBefore(a,th);else host.appendChild(a)}
function go(){langBtn();if(!document.getElementById("langbtn"))setTimeout(go,300)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(go,30));else setTimeout(go,30);
})();

/* ---- 2.8.24: versión inglesa sin restos en español en los datos ----
   El servidor escribe en español algunos textos (resumen del Sol y del Kp, estaciones cercanas, VHF, información y fechas de
   las DXpediciones, notas de los spots, CME, protones, aurora, avisos, fuentes del clúster). En la versión inglesa se traducen
   al cargar los datos, con reglas para cada frase fija. Los patrones van como expresiones regulares para que el traductor de
   la compilación no los toque. */
(function(){
"use strict";
if(window.ACRACB_LANG!=="en")return;
const MON={ene:"Jan",feb:"Feb",mar:"Mar",abr:"Apr",may:"May",jun:"Jun",jul:"Jul",ago:"Aug",sep:"Sep",oct:"Oct",nov:"Nov",dic:"Dec"};
const mon=m=>MON[String(m).toLowerCase().slice(0,3)]||m;
const dot=s=>String(s).replace(/(\d),(\d)/g,"$1.$2");
const RULES=[
 // Kp
 [/NOAA prevé tormenta \(Kp hasta ([\d.,]+)\): noches ruidosas en bandas bajas y caminos polares flojos\./g,(m,a)=>`NOAA forecasts a storm (Kp up to ${dot(a)}): noisy nights on the low bands and weak polar paths.`],
 [/NOAA prevé campo activo \(Kp hasta ([\d.,]+)\): algo de QSB en los caminos del norte\./g,(m,a)=>`NOAA forecasts an active field (Kp up to ${dot(a)}): some QSB on northern paths.`],
 [/NOAA prevé campo algo agitado, sin tormentas\./g,"NOAA forecasts a slightly unsettled field, no storms."],
 [/NOAA prevé campo tranquilo en los próximos días\./g,"NOAA forecasts a quiet field in the coming days."],
 // HF
 [/^Bandas: /g,"Bands: "],[/ m en buen estado/g," m in good shape"],[/ m regulares/g," m fair"],
 [/Se oye /g,"Heard: "],[/Poco DX en el clúster ahora mismo\./g,"Little DX on the cluster right now."],
 // Sol
 [/Rayos X en clase X: posible apagón de radio en la cara de día\./g,"X-class X-rays: possible radio blackout on the day side."],
 [/Rayos X en clase M: puede haber cortes breves de HF de día\./g,"M-class X-rays: brief HF fadeouts possible in daytime."],
 [/Rayos X en clase C: actividad moderada, sin efectos importantes\./g,"C-class X-rays: moderate activity, no major effects."],
 [/Rayos X bajos: Sol tranquilo\./g,"Low X-rays: quiet Sun."],[/Rayos X muy bajos: Sol en calma\./g,"Very low X-rays: calm Sun."],
 [/ \((\d+) fuentes\): /g," ($1 sources): "],
 [/muy alto, bandas altas abiertas buena parte del día\./g,"very high, upper bands open much of the day."],
 [/bueno para 15, 12 y 10 m de día\./g,"good for 15, 12 and 10 m in daytime."],
 [/medio; 20 y 17 m son las bandas fiables de día\./g,"medium; 20 and 17 m are the reliable daytime bands."],
 [/bajo; de día lo mejor es 20 m\./g,"low; in daytime 20 m is best."],
 [/Sin datos solares nuevos\./g,"No new solar data."],
 // Geomagnetismo
 [/Tormenta geomagnética/g,"Geomagnetic storm"],[/Campo algo agitado/g,"Slightly unsettled field"],[/Campo tranquilo/g,"Quiet field"],[/Campo activo/g,"Active field"],
 [/viento solar de (\d+) km\/s/g,"solar wind at $1 km/s"],[/ \(rápido\)/g," (fast)"],
 [/Bz al sur \(([-−\d.,]+) nT\): el Kp puede subir en unas horas/g,(m,a)=>`Bz south (${dot(a)} nT): Kp may rise within hours`],
 [/Buena noche para 40, 80 y 160 m\./g,"Good night for 40, 80 and 160 m."],
 [/Buenos caminos polares hacia Japón y Norteamérica\./g,"Good polar paths to Japan and North America."],
 [/Busca rumbos al sur: los del norte llegarán débiles\./g,"Look south: northern paths will be weak."],
 // Previsión
 [/NOAA espera flujo al alza/g,"NOAA expects rising flux"],[/NOAA espera flujo a la baja/g,"NOAA expects falling flux"],[/NOAA espera flujo estable/g,"NOAA expects steady flux"],
 [/\(entre (\d+) y (\d+) en diez días\)/g,"(between $1 and $2 over ten days)"],
 [/[Pp]osible tormenta el (\d{1,2}) de ([a-zA-Z]{3})/g,(m,d,mm)=>`Possible storm on ${mon(mm)} ${d}`],
 [/[Ll]lega una eyección de masa coronal hacia el (\d{1,2}) de ([a-zA-Z]{3}) a las (\d\d) UTC: /g,(m,d,mm,h)=>`A coronal mass ejection arrives around ${mon(mm)} ${d} at ${h}:00 UTC: `],
 [/Kp hasta ([\d.,]+) en los próximos tres días/g,(m,a)=>`Kp up to ${dot(a)} over the next three days`],
 // CME, protones, aurora
 [/puede dar tormenta G1–G2/g,"may cause a G1–G2 storm"],[/puede agitar el campo \(Kp 4–5\)/g,"may unsettle the field (Kp 4–5)"],[/efecto débil esperado/g,"weak effect expected"],
 [/tormenta de protones/g,"proton storm"],
 [/ % en el norte de Europa/g," % in northern Europe"],[/Sin aurora sobre Europa/g,"No aurora over Europe"],
 // estaciones cercanas
 [/[Pp]ocas estaciones ibéricas destacadas( en esta ronda)?\.?/g,"Few notable Iberian stations this round."],
 [/(\d+) spots de EA, CT y alrededores\. Destacan /g,"$1 spots from EA, CT and nearby. Notable: "],
 // VHF
 [/Sin aperturas en 6 m, 2 m ni 70 cm en el clúster ahora mismo\./g,"No openings on 6 m, 2 m or 70 cm on the cluster right now."],
 [/ E-Skip en 6 m: /g," 6 m E-skip: "],[/6 m abierto \((\d+) spots de más de 300 km\)/g,"6 m open ($1 spots over 300 km)"],
 [/2 m\/70 cm con (\d+) contactos largos, probable tropo/g,"2 m/70 cm with $1 long contacts, probably tropo"],[/clúster y HamQSL/g,"cluster and HamQSL"],
 // DXpediciones
 [/Activa hasta el (\d{1,2}) ([a-zA-Z]{3})/g,(m,d,mm)=>`Active until ${mon(mm)} ${d}`],
 [/(\d+–\d+ ?m) en /g,"$1 in "],[/(\d+ ?m) en (?=[A-Z])/g,"$1 in "],[/\bmodos sin anunciar\b/g,"modes not announced"],[/\bsobre todo\b/g,"mostly"],[/\by algo de\b/g,"and some"],[/\bescucha arriba\b/g,"listening up"],
 [/\bA las (\d\d:\d\d) UTC en /g,"At $1 UTC on "],[/\bSpot a las (\d\d:\d\d) UTC en /g,"Spot at $1 UTC on "],[/ a las (\d\d:\d\d) UTC/g," at $1 UTC"],
 [/\bTambién en /g,"Also on "],[/\(CQ en /g,"(CQ at "],[/\boíd[ao] en /g,"heard in "],[/oído por skimmer \(RBN\)/g,"heard by a skimmer (RBN)"],
 [/decodificado \(PSK Reporter\)/g,"decoded (PSK Reporter)"],[/ hasta el (\d{1,2}) ([a-zA-Z]{3})\b/g,(m,d,mm)=>` until ${mon(mm)} ${d}`],
 [/ hasta el /g," until "],[/\bdesde\b/g,"from"],[/\bvía\b/g,"via"],[/ por (?=[A-Z0-9]{3,})/g," by "],
 // fuentes del clúster
 [/(\d+) nuevos, (\d+) confirmados en 2\+ fuentes/g,"$1 new, $2 confirmed by 2+ sources"],[/Ninguna fuente de clúster respondió en esta ronda/g,"No cluster source answered this round"],
 [/ sin datos legibles/g," with no readable data"],[/Clúster: ninguna fuente respondió; se conservan los spots anteriores/g,"Cluster: no source answered; previous spots kept"],
 // avisos
 [/^DXpedición$/g,"DXpedition"],[/^entidad rara$/g,"rare entity"],
 // enlaces de frases y bandas
 [/ en (\d+ ?c?m)\b/g," on $1"],[/, oída en /g,", heard in "],[/ y (?=[\w(])/g," and "]];
function tx(s){if(s==null||typeof s!=="string"||!/[a-záéíóúñ]/i.test(s))return s;let x=s;for(const [r,v] of RULES)x=x.replace(r,v);
  /* nombres de países y entidades en español que aparezcan en el texto */
  for(const [es,en] of NAMES())if(x.indexOf(es)>=0)x=x.split(es).join(en);return x}
let _N=null;function NAMES(){if(_N)return _N;const m=new Map();try{const d=DXDg().d;for(const k in ESN){const e=d[k];if(e&&e[1]&&ESN[k]!==e[1]&&ESN[k].length>3)m.set(ESN[k],e[1])}}catch(e){}
  const extra={"\u0043anarias":"Canary Is.","\u0047recia":"Greece","\u004aapón":"Japan","\u0043hequia":"Czechia","\u0053icilia":"Sicily","\u0045E. UU.":"USA","\u0041lemania":"Germany","\u0049talia":"Italy","\u0046rancia":"France","\u0052eino Unido":"UK","\u0049nglaterra":"England","\u0045scocia":"Scotland","\u0047ales":"Wales","\u0049rlanda":"Ireland","\u0050aíses Bajos":"Netherlands","\u0042élgica":"Belgium","\u0053uiza":"Switzerland","\u0050olonia":"Poland","\u0053uecia":"Sweden","\u004eoruega":"Norway","\u0046inlandia":"Finland","\u0044inamarca":"Denmark","\u0052usia":"Russia","\u0055crania":"Ukraine","\u0048ungría":"Hungary","\u0052umanía":"Romania","\u0045slovaquia":"Slovakia","\u0045slovenia":"Slovenia","\u0043roacia":"Croatia","\u004cituania":"Lithuania","\u004cetonia":"Latvia","\u0042rasil":"Brazil","\u0054urquía":"Turkey","\u0043anadá":"Canada","\u004déxico":"Mexico","\u0053udáfrica":"South Africa","\u0045spaña":"Spain","\u0042aleares":"Balearic Is.","\u004darruecos":"Morocco","\u0041rgelia":"Algeria","\u0045gipto":"Egypt","\u004aapón":"Japan","\u0043orea del Sur":"South Korea","\u004eueva Zelanda":"New Zealand","\u0049slas Salomón":"Solomon Is.","\u0052ep. Dominicana":"Dominican Republic","\u0053hetland del Sur":"South Shetland Is.","\u0054urquía asiática":"Asiatic Turkey","\u0052usia asiática":"Asiatic Russia","\u0052usia europea":"European Russia","\u0045stados Unidos":"United States"};
  for(const k in extra)if(!m.has(k))m.set(k,extra[k]);_N=[...m.entries()].sort((a,b)=>b[0].length-a[0].length);return _N}
const UNTIL=u=>{const m=String(u||"").match(/^(\d{1,2}) ([a-zA-Z]{3})\b(.*)$/);return m?`${mon(m[2])} ${m[1]}${m[3]}`:u};
function trL(L){if(!L)return;try{
  ["kpNote","nearNote","spotsSrc","flare"].forEach(k=>{if(typeof L[k]==="string")L[k]=tx(L[k])});
  if(Array.isArray(L.solar))L.solar=L.solar.map(x=>Array.isArray(x)?[({"\u004dañana en HF":"Morning on HF","\u0054arde en HF":"Afternoon on HF","\u004eoche en HF":"Night on HF","\u0053ol":"Sun","\u0047eomagnetismo":"Geomagnetism","\u0050revisión":"Forecast"})[x[0]]||tx(x[0]),tx(x[1])]:x);
  if(L.vhf&&typeof L.vhf==="object"){if(L.vhf.note)L.vhf.note=tx(L.vhf.note);if(L.vhf.src)L.vhf.src=tx(L.vhf.src)}
  if(L.space){["proton","aurora"].forEach(k=>{if(L.space[k])L.space[k]=tx(L.space[k])})}
  (L.cme||[]).forEach(c=>{if(c&&c.note)c.note=tx(c.note)});
  (L.dx||[]).forEach(d=>{if(!d)return;if(d.info){d.info=tx(d.info);if(ES_LEFT(d.info))d.info=dxInfoEn(d)}if(d.until)d.until=UNTIL(d.until);if(typeof d.ent==="string"){const e=d.dxcc&&DXDg().d[d.dxcc];d.ent=e&&e[1]?e[1]:tx(d.ent)}});
  (L.spots||[]).forEach(s=>{if(s&&s.c)s.c=tx(s.c);if(s&&typeof s.dxcc==="string")s.dxcc=tx(s.dxcc)});
  ((L.alert&&L.alert.items)||[]).forEach(i=>{if(i&&i.need)i.need=tx(i.need);if(i&&i.c)i.c=tx(i.c)});
  (L.heard||[]).forEach(h=>{if(h&&typeof h.ent==="string")h.ent=tx(h.ent)});
  if(L.outlook27&&L.outlook27.issued)L.outlook27.issued=String(L.outlook27.issued).replace(/(\d{1,2}) ([a-z]{3}) (\d{4})/,(m,d,mm,y)=>`${mon(mm)} ${d}, ${y}`);
  if(L.kpfc&&Array.isArray(L.kpfc.days)){const W={dom:"Sun",lun:"Mon",mar:"Tue","mi\u00e9":"Wed",mie:"Wed",jue:"Thu",vie:"Fri","s\u00e1b":"Sat",sab:"Sat"};L.kpfc.days=L.kpfc.days.map(d=>String(d).normalize("NFC").replace(/^([A-Za-z\u00e1\u00e9]{3})(?=\s|$)/,(m,w)=>W[w.toLowerCase()]||w))}
  if(L.status&&L.status.note)L.status.note=tx(L.status.note)}catch(e){console.error(e)}}
/* texto libre que sigue en español tras las reglas: se rehace en inglés con los datos de la DXpedición */
const ES_LEFT=t=>/\b(?:en|de|del|la|las|los|el|con|unas?|unos?|ya|para|desde|hasta|sobre|equipo|estaciones|antenas|montadas|isla|también|oíd[ao]|según|activa|año|días?|semanas?|aparece|modos|sin|anunciar|estilo|vacaciones|hoy|lento|digitales|fonía|telegrafía)\b|ción\b/i.test(String(t||""));
function dxInfoEn(d){const src=String(d.info||"")+" "+(d.qsx||"");let bands="";const r1=src.match(/(\d{1,3})\s*[–-]\s*(\d{1,3})\s*m\b/),r2=src.match(/\b(?:from|de)\s+(\d{1,3})\s+(?:to|a)\s+(\d{1,3})\s*m\b/i);
  if(r1)bands=`${r1[1]}–${r1[2]} m`;else if(r2)bands=`${r2[1]}–${r2[2]} m`;
  const modes=(Array.isArray(d.modes)&&d.modes.length?d.modes:(src.match(/\b(CW|SSB|FT8|FT4|RTTY|PSK31|JT65|FM|AM)\b/g)||[])).filter((x,i,a)=>a.indexOf(x)===i);
  const ml=modes.length>1?modes.slice(0,-1).join(", ")+" and "+modes[modes.length-1]:modes[0]||"";
  const parts=[];if(d.until)parts.push("Active until "+UNTIL(d.until));if(bands||ml)parts.push([bands,ml].filter(Boolean).join(" in "));
  return parts.length?parts.join(" · ")+".":""}
window.ACRACB_trL=trL;window.ACRACB_tx2=tx;
/* se aplica al cargar y cada vez que llegan datos nuevos */
const hook=()=>{if(window.__hkTr)return true;if(typeof window.normL!=="function")return false;window.__hkTr=1;const o=window.normL;const w=function(){const r=o.apply(this,arguments);trL(window.L||L);return r};w.__tr=1;window.normL=w;return true};
const go=()=>{hook();trL(L);try{refresh()}catch(e){}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else setTimeout(go,0);
})();
