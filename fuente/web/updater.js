/* =====================================================================
   ACRACB - Plataforma DX · actualizador propio (versión web, sin Claude)
   Idea original y realización: Alfredo, EA5JNF.
   Solo actúa cuando se pulsa «Actualizar». Lee a la vez todas las fuentes
   públicas que el navegador permite leer, coteja cada dato (mediana o valor
   más repetido), redacta los textos con reglas fijas y guarda el resultado
   en este dispositivo. Si una fuente no responde, se conserva el último dato.
   ===================================================================== */
(function(){
"use strict";
/* 2.4.1: en los países muy grandes el centro del país puede quedar a miles de km de la estación. Cuando el spot no trae
   su locator, se usa la región que indica el número del indicativo (W6 = California, VK6 = Australia Occidental, UA0 = Extremo Oriente…) */
const AREA={
 291:{re:/^(?:[KNW][A-Z]?|A[A-L])(\d)/,p:{1:[-71.5,42.8],2:[-74.8,41.3],3:[-77.3,40.3],4:[-81.5,33.5],5:[-96.5,32.5],6:[-119.5,36.5],7:[-113.5,42.5],8:[-83.5,41.5],9:[-88.5,41.8],0:[-97,41.5]}},
 1:{re:/^(?:V[A-GOY]|C[F-KY-Z]|X[J-O])(\d)/,p:{1:[-63.5,45],2:[-72,47],3:[-80,44.5],4:[-98,50],5:[-106,52],6:[-114,52],7:[-123,49.5],8:[-114,62.5],9:[-66,46]}},
 150:{re:/^(?:VK|VH|VI|VJ|VL|VM|VN|AX)(\d)/,p:{1:[149.1,-35.3],2:[151,-33.6],3:[145,-37.8],4:[153,-27.5],5:[138.6,-34.9],6:[115.9,-31.9],7:[147.3,-42.9],8:[130.8,-12.5]}},
 54:{re:/^(?:U[A-I]|R[A-Z]?)(\d)/,p:{1:[30.3,59.9],3:[37.6,55.8],4:[49,54],6:[39.7,47.2],9:[54.5,60]}},
 15:{re:/^(?:U[A-I]|R[A-Z]?)(\d)/,p:{8:[104.3,52.3],9:[73.4,55],0:[127.5,50.3]}},
 339:{re:/^(?:J[A-S]|7[J-N]|8[J-N])(\d)/,p:{1:[139.7,35.7],2:[137,35],3:[135.5,34.7],4:[132.5,34.4],5:[133.5,33.8],6:[130.5,32.8],7:[140.9,38.3],8:[141.3,43.1],9:[136.6,36.6],0:[138.2,36.6]}},
 108:{re:/^(?:P[P-Y]|Z[V-Z])(\d)/,p:{1:[-43.2,-22.9],2:[-46.6,-23.5],3:[-51.2,-30],4:[-44,-19.9],5:[-49.3,-25.4],6:[-38.5,-13],7:[-35.2,-8],8:[-48.5,-1.5],9:[-49.3,-16.7]}},
 318:{re:/^(?:B[A-Z]?)(\d)/,p:{1:[116.4,39.9],2:[126.6,45.8],3:[117.2,39.1],4:[121.5,31.2],5:[119.3,26.1],6:[114.3,30.6],7:[113.3,23.1],8:[104.1,30.7],9:[103.8,36.1],0:[87.6,43.8]}}};
/* radio máximo (km) entre el centro de la entidad y una posición de la estación que se pueda creer; 1.300 km para el resto */
const POSMAX={15:4500,54:2500,291:3500,1:3500,6:2000,150:3000,108:3000,100:2500,318:3000,324:2200,130:1800,237:2000,13:4000,112:2500,50:2000,327:3000,400:1500,436:1500,466:1500,414:1500,378:1500,330:1500,363:1500,136:1500,116:1500,104:1500,462:1500,266:1500,339:2000,284:1500,224:1500,281:1500,227:1500,248:1500,230:1500};
function posOK(pos,e){return !(pos&&e&&e.pos&&distKm(pos,e.pos)>(POSMAX[e.dxcc]||1300))}
function areaPos(call,e){try{if(!e||!AREA[e.dxcc])return e?e.pos:null;const A=AREA[e.dxcc];const c=String(call||"").toUpperCase();
  const sl=c.match(/\/(\d)$/);const d=sl?sl[1]:((c.split("/").find(x=>A.re.test(x))||"").match(A.re)||[])[1];return (d!=null&&A.p[d])||e.pos}catch(x){return e?e.pos:null}}
window.ACRACB_areaPos=(call)=>{try{const e=callEnt(call);if(!e||!e.dxcc)return null;return areaPos(call,{dxcc:e.dxcc,pos:(()=>{try{const m=(V.meta||[]).find(x=>x[2]===e.dxcc);return m?[m[5],m[4]]:null}catch(x){return null}})()})}catch(e){return null}};
if(window.claude&&window.claude.use)return;           /* dentro del Artifact manda el otro sistema */
const KEY="acracb_live_v2",TOUT=6000;
const $=id=>document.getElementById(id);
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------------- utilidades ---------------- */
const num=x=>{if(x==null)return null;if(typeof x==="number")return isFinite(x)?x:null;const m=String(x).match(/-?\d+(?:[.,]\d+)?/);return m?parseFloat(m[0].replace(",",".")):null};
const med=a=>{const v=a.filter(x=>typeof x==="number"&&isFinite(x)).sort((p,q)=>p-q);if(!v.length)return null;const h=v.length>>1;return v.length%2?v[h]:(v[h-1]+v[h])/2};
const mostCommon=a=>{const v=a.filter(Boolean);if(!v.length)return null;const c={};v.forEach(x=>c[x]=(c[x]||0)+1);return v.slice().sort((p,q)=>c[q]-c[p])[0]};
const r0=x=>x==null?null:Math.round(x),r1=x=>x==null?null:Math.round(x*10)/10;
const pick=(o,...k)=>{for(const x of k)if(o&&o[x]!=null&&o[x]!=="")return o[x];return null};
const iso=t=>new Date(t).toISOString().replace(/\.\d{3}Z$/,"Z");
const MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],DIA=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],DC=window.ACRACB_LANG==="en"?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESN={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
const esn=(x,d)=>x==null?"—":x.toFixed(d||0).replace(".",",");
const joinEs=a=>{a=a.filter(Boolean);return a.length<2?(a[0]||""):a.slice(0,-1).join(", ")+" y "+a[a.length-1]};
const BN={0:"160\u00a0m",1:"80\u00a0m",2:"40\u00a0m",3:"20\u00a0m",4:"17\u00a0m",5:"15\u00a0m",6:"12\u00a0m",7:"10\u00a0m",8:"60\u00a0m",9:"30\u00a0m",10:"6\u00a0m",11:"2\u00a0m",12:"70\u00a0cm"};
const BR=[[0,1.8,2],[1,3.5,4],[8,5.25,5.45],[2,7,7.3],[9,10.1,10.15],[3,14,14.35],[4,18.068,18.168],[5,21,21.45],[6,24.89,24.99],[7,28,29.7],[10,50,54],[11,144,146],[12,430,440]];
const bandOf=f=>{for(const [i,lo,hi] of BR)if(f>=lo&&f<=hi)return i;return null};
const fmtF=f=>f.toFixed(3);
const toMHz=v=>{const f=num(v);if(f==null)return null;return f>1e6?f/1e6:f>1000?f/1000:f};
const madrid=t=>new Date(t).toLocaleString("es-ES",{timeZone:"Europe/Madrid",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false});
const madParts=t=>{const f=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",weekday:"short",hour12:false}).formatToParts(new Date(t));const o={};f.forEach(p=>o[p.type]=p.value);return o};
const fmtLocal=t=>{const p=madParts(t),d=new Date(t);const wd=new Date(Date.UTC(+p.year,+p.month-1,+p.day)).getUTCDay();return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute} hora local (${DIA[wd]})`};
const dm=d=>`${d.getUTCDate()} ${MES[d.getUTCMonth()]}`;
function ptime(v){if(v==null||v==="")return null;if(typeof v==="number"||/^\d{9,13}(\.\d+)?$/.test(String(v))){let x=+v;if(x>1e12)x/=1000;return new Date(x*1000)}
  let s=String(v).trim();const m=s.match(/^(\d{2})(\d{2})\s+(\d{4}-\d\d-\d\d)$/);if(m)s=`${m[3]}T${m[1]}:${m[2]}:00Z`;
  if(/^\d{4}-\d\d-\d\d[ T]\d\d:\d\d(:\d\d(\.\d+)?)?$/.test(s))s=s.replace(" ","T")+"Z";const d=new Date(s);return isNaN(d)?null:d}
function distKm(a,b){const R=Math.PI/180,p1=a[1]*R,p2=b[1]*R,dl=(b[0]-a[0])*R;return 6371*Math.acos(Math.max(-1,Math.min(1,Math.sin(p1)*Math.sin(p2)+Math.cos(p1)*Math.cos(p2)*Math.cos(dl))))}

/* ---------------- red ---------------- */
const MAXR=6e6;/* 6 MB por fuente como máximo */
/* JSON de fuera: sin claves que puedan alterar los objetos de la página */
const SAFE=(k,v)=>k==="__proto__"||k==="constructor"||k==="prototype"?undefined:v;
const PROXY="https://acracb-dx.ea5jnf.workers.dev/?u=",VIA=new Set(["kp.gfz-potsdam.de","www.sidc.be","kp.gfz.de"]);
/* fuentes que se leen directamente; si el navegador no las deja leer (o no responden), se reintenta a través del
   intermediario propio del club (Cloudflare). Las que funcionan así se recuerdan durante la sesión. */
const RESCUE=new Set(["services.swpc.noaa.gov","spothole.app","www.hamqth.com","db1.wspr.live","kauai.ccmc.gsfc.nasa.gov"]),VIA2=new Set();
async function req1(url,type,tm){const ac=new AbortController();const t=setTimeout(()=>ac.abort(),tm);
  try{const r=await fetch(url,{signal:ac.signal,cache:"no-store",mode:"cors",credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);
    /* límite de tamaño: una fuente que devuelva algo enorme (por error o a propósito) se descarta sin colgar la página */
    if((+r.headers.get("content-length")||0)>MAXR)throw new Error("datos no válidos");const x=await r.text();if(x.length>MAXR)throw new Error("datos no válidos");
    return type==="json"?JSON.parse(x,SAFE):x}
  finally{clearTimeout(t)}}
async function req(url,type){let h="";try{h=new URL(url).hostname}catch(e){}
  if(VIA.has(h)||VIA2.has(h))return req1(PROXY+encodeURIComponent(url),type,15000);
  try{return await req1(url,type,TOUT)}
  catch(e){if(!RESCUE.has(h)||(e&&e.name==="AbortError"))throw e;
    const v=await req1(PROXY+encodeURIComponent(url),type,15000);VIA2.add(h);return v}}
const J=u=>req(u,"json"),T=u=>req(u,"text");

/* ---------------- entidades (con las tablas de la propia página) ---------------- */
const EUCC=new Set("AD AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA XK AX".split(" "));
let TGM=null;function tgm(){if(TGM)return TGM;TGM={};try{(V.meta||[]).forEach(m=>{if(m[2]&&!TGM[m[2]])TGM[m[2]]={pos:[m[5],m[4]],cont:m[7]}})}catch(e){}return TGM}
/* posiciones de respaldo para entidades que no son destinos de la predicción (sobre todo Europa y la península) */
const CPOS={ES:[-3.7,40.4],PT:[-8.2,39.6],AD:[1.55,42.5],GI:[-5.35,36.14],MA:[-6.8,33],FR:[2.4,46.6],DE:[10.4,51.1],GB:[-1.5,52.6],IE:[-8,53.4],IT:[12.6,42.8],NL:[5.3,52.2],BE:[4.5,50.6],LU:[6.1,49.8],CH:[8.2,46.8],AT:[14.5,47.6],
 DK:[9.5,56.1],SE:[15.6,61.5],NO:[9,61.5],FI:[25.7,62.5],IS:[-18.9,64.9],PL:[19.1,52.1],CZ:[15.4,49.8],SK:[19.6,48.7],HU:[19.4,47.2],SI:[14.9,46.1],HR:[16.4,45.3],BA:[17.7,44.2],RS:[20.9,44.1],ME:[19.3,42.7],MK:[21.7,41.6],
 AL:[20,41.1],GR:[22,39.3],BG:[25.3,42.7],RO:[24.9,45.9],MD:[28.5,47.2],UA:[31.2,49],BY:[28,53.7],LT:[23.9,55.3],LV:[24.6,56.9],EE:[25.5,58.6],RU:[37.6,55.8],TR:[35.2,39],CY:[33.2,35],MT:[14.4,35.9],SM:[12.45,43.94],
 VA:[12.45,41.9],MC:[7.42,43.74],LI:[9.55,47.16],FO:[-6.9,62],IM:[-4.5,54.2],JE:[-2.1,49.2],GG:[-2.58,49.45],SJ:[16,78],AX:[19.9,60.2],XK:[20.9,42.6],DZ:[3,28],TN:[9.5,34],LY:[17,27],EG:[30.8,26.8],IL:[34.9,31.4]};
const DPOS={21:[2.9,39.6],29:[-15.5,28.2],32:[-5.3,35.9],149:[-27,38.5],256:[-16.9,32.7],279:[-4.2,56.8],294:[-3.7,52.3],114:[-6.6,54.6],223:[-1.5,52.6],106:[-2.58,49.45],122:[-2.1,49.2],5:[19.9,60.2]};
function ent(call){try{const e=callEnt(call);if(!e||e.mm||!e.dxcc)return null;const t=tgm()[e.dxcc];let cont=t?t.cont:(EUCC.has(e.cc)?"EU":({MA:"AF",DZ:"AF",TN:"AF",LY:"AF",EG:"AF",IL:"AS"})[e.cc]||null);
  const pos=t?t.pos:(DPOS[e.dxcc]||CPOS[e.cc]||null);
  if(e.dxcc===54||e.dxcc===15)cont=e.dxcc===54?"EU":"AS";return {dxcc:e.dxcc,cc:e.cc,cont,pos,name:e.name}}catch(x){return null}}
/* 2.10.28: «cercano» es solo España peninsular (DXCC 281); todo lo demás es DX */
const NEARDX=new Set([281]);
const clean=c=>String(c||"").toUpperCase().trim().replace(/-\d+(-#)?$|-#$/,"").replace(/[^A-Z0-9/]/g,"");

/* ---------------- modo por la frecuencia (plan IARU Región 1) ---------------- */
function modeFrom(f,c,g){g=String(g||"").toUpperCase().trim();g={USB:"SSB",LSB:"SSB",PHONE:"SSB",PSK:"PSK31",BPSK31:"PSK31",JS8CALL:"JS8","FT-8":"FT8","FT-4":"FT4",DATA:"",DIGI:""}[g]??g;
  if(["SSB","AM","FM","CW","FT8","FT4","JT65","JS8","RTTY","PSK31","SSTV"].includes(g))return g;
  const u=" "+String(c||"").toUpperCase()+" ";for(const m of["FT8","FT4","JT65","JS8","RTTY","PSK31","SSTV","CW","SSB","USB","LSB"," AM "," FM "])if(u.includes(m))return({USB:"SSB",LSB:"SSB"," AM ":"AM"," FM ":"FM"})[m]||m;
  const k=f*1000,nr=(c0,w)=>k>=c0&&k<=c0+(w||3);
  if([1840,3573,5357,7074,10136,14074,18100,21074,24915,28074,50313,144174,432174].some(x=>nr(x)))return "FT8";
  if([14090,18095,21091,24911,28091].some(x=>nr(x,2)))return "FT8";
  if([3575,7047.5,10140,14080,18104,21140,24919,28180,50318].some(x=>nr(x)))return "FT4";
  if([7076,14076,21076,28076].some(x=>nr(x,2)))return "JT65";if([7078,14078,21078].some(x=>nr(x,2)))return "JS8";
  if([3735,7165,14230,21340,28680,144500].some(x=>Math.abs(k-x)<=3))return "SSTV";
  if((k>=29000&&k<=29200)||(k>=3615&&k<=3625)||Math.abs(k-14286)<2||Math.abs(k-21425)<2)return "AM";
  if((k>=29520&&k<=29700)||(k>=145200&&k<=145600)||(k>=51410&&k<=51590)||(k>=433400&&k<=434600))return "FM";
  for(const [lo,hi] of [[1810,1838],[3500,3570],[5351.5,5354],[7000,7040],[10100,10130],[14000,14070],[18068,18095],[21000,21070],[24890,24915],[28000,28070],[50000,50100],[144025,144150],[432025,432100]])if(k>=lo&&k<hi)return "CW";
  if([3580,7040,10142,14070,18097,21070,24920,28120].some(x=>k>=x&&k<x+3))return "PSK31";
  for(const [lo,hi] of [[3580,3600],[7040,7050],[14080,14099],[21080,21120],[28070,28150],[10130,10150]])if(k>=lo&&k<=hi)return "RTTY";
  return "SSB"}

/* ================= FUENTES ================= */
const SRC={};
/* --- Sol y espacio --- */
SRC["NOAA WWV"]=async()=>{const t=await T("https://services.swpc.noaa.gov/text/wwv.txt");const g=r=>{const m=t.match(r);return m?num(m[1]):null};
  return {sfi:g(/Solar flux\s+(\d+)/i),a:g(/planetary A-index\s+(\d+)/i),kp:g(/K-index at [\s\S]*? was\s+([\d.]+)/i)}};
SRC["NOAA flujo"]=async()=>{const j=await J("https://services.swpc.noaa.gov/json/f107_cm_flux.json");const r=j.filter(x=>num(x.flux)).sort((a,b)=>String(a.time_tag).localeCompare(b.time_tag));
  const n=r.filter(x=>/Noon/.test(x.reporting_schedule||"")||/T20:00/.test(x.time_tag||""));return num((n.length?n:r).pop().flux)};
SRC["NOAA Kp"]=async()=>{let j=await J("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json");if(Array.isArray(j[0])){const h=j[0];j=j.slice(1).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])))}
  const r=j[j.length-1];return {kp:num(pick(r,"Kp","kp_index","estimated_kp")),a:num(r.a_running)}};
SRC["GFZ Potsdam"]=async()=>{const d=new Date(),y=new Date(Date.now()-864e5),f=x=>x.toISOString().slice(0,10);
  const q=`/app/json/?start=${f(y)}T00:00:00Z&end=${f(d)}T23:59:59Z&index=Kp`;let j;
  /* GFZ se ha mudado a kp.gfz.de: primero por el intermediario; si el intermediario aún no la conoce, directamente */
  try{j=await J("https://kp.gfz.de"+q)}catch(e){j=await req1("https://kp.gfz.de"+q,"json",TOUT)}const v=(j.Kp||[]).filter(x=>x!=null);return v.length?v[v.length-1]:null};
/* 2.8.29: índice Hp30 del GFZ (cada media hora, CC BY 4.0): avisa antes que el Kp de 3 horas */
SRC["GFZ Hp30"]=async()=>{const d=new Date(),y=new Date(Date.now()-6*36e5),f=x=>x.toISOString().slice(0,19)+"Z";
  const q=`/app/json/?start=${f(y)}&end=${f(d)}&index=Hp30`;let j;try{j=await J("https://kp.gfz.de"+q)}catch(e){j=await req1("https://kp.gfz.de"+q,"json",TOUT)}
  const v=j.Hp30||[],t=j.datetime||[];for(let i=v.length-1;i>=0;i--)if(v[i]!=null&&v[i]>=0)return {v:+v[i],t:t[i]||null};return null};
/* 2.8.29: absorción en la capa D (NOAA D-RAP): frecuencia más alta con 1 dB de absorción, rejilla de 2° × 4° */
SRC["NOAA D-RAP"]=async()=>{const t=await T("https://services.swpc.noaa.gov/text/drap_global_frequencies.txt");const L=t.split(/\r?\n/);
  let lons=null;const rows=[];let at=null;
  for(const l of L){const m0=l.match(/Valid At\s*:\s*([0-9-]+\s+[0-9:]+)/i);if(m0)at=m0[1].trim().replace(" ","T")+"Z";if(/^\s*#/.test(l)||!l.trim())continue;
    const m=l.match(/^\s*(-?\d+(?:\.\d+)?)\s*\|\s*(.+)$/);if(m){const vs=m[2].trim().split(/\s+/).map(Number);if(vs.every(x=>isFinite(x)))rows.push([+m[1],vs]);continue}
    if(!lons&&/^[\s\-\d.]+$/.test(l)){const xs=l.trim().split(/\s+/).map(Number);if(xs.length>=20&&xs.every(x=>isFinite(x)))lons=xs}}
  if(!lons||rows.length<10)return null;
  const at2=(la,lo)=>{let br=rows[0],bd=1e9;for(const r of rows){const d=Math.abs(r[0]-la);if(d<bd){bd=d;br=r}}let bi=0,bl=1e9;lons.forEach((x,i)=>{let d=Math.abs(((x-lo+540)%360)-180);if(d<bl){bl=d;bi=i}});return br[1][bi]};
  const P=(typeof TXP!=="undefined"&&TXP)?TXP:[-0.5,38.4];let mx=0;for(const r of rows)for(const v of r[1])if(v>mx)mx=v;
  return {here:Math.round(at2(P[1],P[0])*10)/10,max:Math.round(mx*10)/10,at}};
SRC["SILSO EISN"]=async()=>{const t=await T("https://www.sidc.be/SILSO/DATA/EISN/EISN_current.txt");const r=t.split("\n").map(l=>l.trim().split(/\s+/)).filter(p=>/^\d{4}$/.test(p[0]));return r.length?num(r[r.length-1][4]):null};
SRC["NOAA manchas"]=async()=>{const j=await J("https://services.swpc.noaa.gov/json/solar-cycle/swpc_observed_ssn.json");const r=j.filter(x=>num(x.swpc_ssn)!=null).sort((a,b)=>String(a.Obsdate).localeCompare(b.Obsdate));return r.length?num(r.pop().swpc_ssn):null};
SRC["NOAA viento"]=async()=>{let s=await J("https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json"),m=await J("https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json");
  if(Array.isArray(s))s=s[s.length-1];if(Array.isArray(m))m=m[m.length-1];return {wind:num(pick(s,"proton_speed","WindSpeed")),bt:num(pick(m,"bt","Bt")),bz:num(pick(m,"bz_gsm","Bz"))}};
SRC["NOAA densidad"]=async()=>{try{const j=await J("https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json");const r=(Array.isArray(j)?j:[]).filter(x=>num(x.proton_density)!=null&&x.active!==false).sort((a,b)=>String(a.time_tag).localeCompare(b.time_tag));if(r.length)return num(r[r.length-1].proton_density)}catch(e){}
  const j=await J("https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json");const h=j[0],rows=j.slice(1).filter(r=>r[1]!=null);if(!rows.length)return null;return num(rows[rows.length-1][h.indexOf("density")])};
SRC["NOAA rayos X"]=async()=>{const j=await J("https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json");const r=Array.isArray(j)?j[j.length-1]:j;return {now:r.current_class||r.max_class,max:r.max_class}};
SRC["NOAA escalas"]=async()=>{const j=await J("https://services.swpc.noaa.gov/products/noaa-scales.json");const c=j["0"]||{},f=j["1"]||{};return {S:(c.S||{}).Scale,G:(c.G||{}).Scale,r12:num((f.R||{}).MinorProb),r3:num((f.R||{}).MajorProb),s1:num((f.S||{}).Prob)}};
SRC["NOAA 3 días"]=async()=>{const t=await T("https://services.swpc.noaa.gov/text/3-day-forecast.txt");const o={};
  let m=t.match(/:Issued:\s*(\d{4}) (\w{3}) (\d{1,2}) (\d{4}) UTC/);if(m)o.issued=`NOAA, ${+m[3]} ${MES[MESN[m[2].toLowerCase()]-1]} ${m[4].slice(0,2)}:${m[4].slice(2)} UTC`;
  m=t.match(/NOAA Kp index breakdown (\w{3}) (\d{1,2})-(\w{3}) (\d{1,2}) (\d{4})/);
  if(m){const b=new Date(Date.UTC(+m[5],MESN[m[1].toLowerCase()]-1,+m[2]));o.base=b.toISOString().slice(0,10);o.days=[0,1,2].map(i=>{const d=new Date(b.getTime()+i*864e5);return DC[d.getUTCDay()]+" "+d.getUTCDate()});
    const bl=[[],[],[]];t.split("\n").forEach(l=>{if(/^\s*\d\d-\d\dUT/.test(l)){const v=[...l.slice(l.indexOf("UT")+2).matchAll(/(\d(?:\.\d+)?)(?:\s*\(G\d\))?/g)].map(x=>+x[1]);for(let i=0;i<3&&i<v.length;i++)bl[i].push(v[i])}});
    if(bl.every(x=>x.length===8))o.blocks=bl}
  const g=r=>{const x=t.match(r);return x?num(x[1]):null};o.r12=g(/R1-R2\s+(\d+)%/);o.r3=g(/R3 or greater\s+(\d+)%/);o.s1=g(/S1 or greater\s+(\d+)%/);return o};
SRC["NOAA 27 días"]=async()=>{const t=await T("https://services.swpc.noaa.gov/text/27-day-outlook.txt");const days=[...t.matchAll(/^(\d{4}) (\w{3}) (\d{2})\s+(\d+)\s+(\d+)\s+(\d+)/gm)].map(m=>[`${m[1]}-${String(MESN[m[2].toLowerCase()]).padStart(2,"0")}-${m[3]}`,+m[4],+m[5],+m[6]]);
  const m=t.match(/:Issued:\s*(\d{4}) (\w{3}) (\d{1,2})/);return days.length?{issued:m?`NOAA SWPC, ${+m[3]} ${MES[MESN[m[2].toLowerCase()]-1]} ${m[1]}`:"NOAA SWPC",days}:null};
SRC["NOAA aurora"]=async()=>{const j=await J("https://services.swpc.noaa.gov/json/ovation_aurora_latest.json");let b=[0,null];for(const [lon,lat,a] of j.coordinates||[]){const lo=lon>180?lon-360:lon;if(lat>=45&&lat<=65&&lo>=-10&&lo<=30&&a>b[0])b=[a,lat]}return b};
SRC["NASA DONKI"]=async()=>{const d=new Date(),f=x=>x.toISOString().slice(0,10);const j=await J(`https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/WSAEnlilSimulations?startDate=${f(new Date(Date.now()-7*864e5))}&endDate=${f(d)}`)||[];
  const out=[],seen=new Set();for(const s of j){const earth=s.isEarthGB||(s.impactList||[]).some(i=>String(i.location).toLowerCase()==="earth");if(!earth)continue;
    let arr=s.estimatedShockArrivalTime;if(!arr)(s.impactList||[]).forEach(i=>{if(String(i.location).toLowerCase()==="earth")arr=i.arrivalTime});
    const ci=(s.cmeInputs||[{}])[0],st=ci.cmeStartTime;if(seen.has(st))continue;seen.add(st);const at=ptime(arr);if(at&&at<Date.now()-864e5)continue;
    const sp=num(ci.speed),kp=num(s.kp_90)||num(s.kp_135)||num(s.kp_180);
    out.push({time:st,arrival:at?iso(at):null,speed:r0(sp),note:(sp||0)>=800||(kp||0)>=6?"puede dar tormenta G1–G2":(sp||0)>=500||(kp||0)>=4?"puede agitar el campo (Kp 4–5)":"efecto débil esperado"})}
  return out};
SRC["NOAA ciclo previsto"]=async()=>{const j=await J("https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json");const now=new Date().toISOString().slice(0,7),o={};
  for(const r of j){const tg=r["time-tag"]||r.time_tag,v=num(r.predicted_ssn);if(tg&&v!=null&&tg.slice(0,7)>=now&&Object.keys(o).length<13)o[tg.slice(0,7)]=r1(v)}return Object.keys(o).length?o:null};
SRC["WSPR.live"]=async()=>{const q="SELECT band,count() FROM wspr.rx WHERE time>now()-3600 AND distance>2500 AND rx_lat>35 AND rx_lat<60 AND rx_lon>-10 AND rx_lon<30 GROUP BY band FORMAT TSV";
  const t=await T("https://db1.wspr.live/?query="+encodeURIComponent(q));const o={};t.split("\n").forEach(l=>{const p=l.split("\t");if(p.length===2&&/^\d+$/.test(p[0])&&+p[0]>0)o[p[0]]=+p[1]});return Object.keys(o).length?o:null};
SRC["NOAA ciclo observado"]=async()=>{const j=await J("https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json");
  const r=j.filter(x=>(x["time-tag"]||x.time_tag)&&num(x.ssn)!=null&&num(x.ssn)>=0).sort((a,b)=>String(a["time-tag"]||a.time_tag).localeCompare(b["time-tag"]||b.time_tag));if(!r.length)return null;
  const k=x=>String(x["time-tag"]||x.time_tag).slice(0,7),sm=r.filter(x=>num(x.smoothed_ssn)!=null&&num(x.smoothed_ssn)>=0);
  return {monthly:Object.fromEntries(r.slice(-3).map(x=>[k(x),r1(num(x.ssn))])),smoothed:Object.fromEntries(sm.slice(-3).map(x=>[k(x),r1(num(x.smoothed_ssn))])),src:`SILSO vía NOAA SWPC, ${k(r[r.length-1])}`}};
/* 2.10.44: avisos y alertas oficiales de NOAA de las últimas 24 h (tormentas, llamaradas, protones, apagones de radio) */
SRC["NOAA avisos"]=async()=>{const j=await J("https://services.swpc.noaa.gov/products/alerts.json");if(!Array.isArray(j))return null;const lim=Date.now()-864e5,out=[];
  for(const a of j){const t=ptime(String(a.issue_datetime||"").replace(" ","T")+(/Z$/.test(String(a.issue_datetime||""))?"":"Z"));if(!t||t<lim)continue;const m=String(a.message||"").replace(/\r/g,"");
    const h=(m.match(/^(ALERT|WARNING|WATCH|SUMMARY|EXTENDED WARNING|CANCEL[A-Z ]*):\s*(.+)$/m)||[]);if(!h[1])continue;
    const g=(m.match(/NOAA Scale:\s*([GSR]\d)/i)||[])[1]||"";out.push({t:iso(t),k:h[1],x:h[2].trim().slice(0,140),g:g.toUpperCase(),id:String(a.product_id||"")})}
  out.sort((a,b)=>a.t<b.t?1:-1);return out.slice(0,12)};
/* regiones activas del Sol (NOAA): cuántas hay y la más compleja, con su probabilidad de llamarada */
SRC["NOAA regiones"]=async()=>{const j=await J("https://services.swpc.noaa.gov/json/solar_regions.json");if(!Array.isArray(j)||!j.length)return null;
  const day=j.map(r=>String(pick(r,"observed_date","date")||"")).filter(Boolean).sort().pop();if(!day)return null;
  const rs=j.filter(r=>String(pick(r,"observed_date","date")||"")===day&&num(pick(r,"region","region_number"))!=null);
  const mag=r=>String(pick(r,"mag_class","magnetic_class")||"").toUpperCase();const sc=r=>(/D/.test(mag(r).replace(/^B/,""))?3:/G/.test(mag(r))?2:/B/.test(mag(r))?1:0)*1e4+(num(pick(r,"area"))||0);
  const top=rs.slice().sort((a,b)=>sc(b)-sc(a))[0];if(!top)return {day,n:0};
  return {day,n:rs.length,spots:rs.reduce((s,r)=>s+(num(pick(r,"number_spots","spots"))||0),0),top:{ar:num(pick(top,"region","region_number")),loc:String(pick(top,"location")||""),mag:String(pick(top,"mag_class","magnetic_class")||""),
    m:num(pick(top,"m_flare_probability")),x:num(pick(top,"x_flare_probability")),area:num(pick(top,"area"))}}};
/* protones de más de 10 MeV medidos por el satélite GOES (cierran los caminos polares desde 10 pfu) */
SRC["NOAA protones"]=async()=>{const j=await J("https://services.swpc.noaa.gov/json/goes/primary/integral-protons-6-hour.json");if(!Array.isArray(j))return null;
  const r=j.filter(x=>/^>=\s*10 MeV$/i.test(String(x.energy||"").trim())&&num(x.flux)!=null).sort((a,b)=>String(a.time_tag).localeCompare(String(b.time_tag)));return r.length?Math.round(num(r[r.length-1].flux)*100)/100:null};
/* --- DXpediciones --- */
SRC["Spothole avisos"]=async()=>{let j=await J("https://spothole.app/api/v1/alerts");if(!Array.isArray(j))j=j.alerts||j.data||[];const today=Date.now(),out=[];
  for(const a of j){const sig=String(pick(a,"sig","type","source")||"");const call=clean(pick(a,"dx_call","dx_calls","call","callsign")||"");if(!call)continue;
    if(sig&&!/dx|ng3k/i.test(sig))continue;const s=ptime(pick(a,"start_time","start")),e=ptime(pick(a,"end_time","end"));if(!e||!s||s>today||e<today)continue;
    out.push({call:call.split(/[ ,]/)[0],start:iso(s).slice(0,10),end:iso(e).slice(0,10),info:String(pick(a,"comment","dx_name","name")||""),qsl:""})}
  return out};
/* --- Clústeres --- */
/* 2.4.1: locator (4 o 6 caracteres) a [longitud, latitud] del centro de la cuadrícula */
const gridLL=g=>{try{const n=normLoc(String(g||"").trim().toUpperCase().slice(0,10));return n?locToLL(n):null}catch(e){return null}};
/* Spothole da coordenadas también cuando solo conoce el país (su centro): esas no sirven para la distancia */
const shPos=s=>{const src=String(pick(s,"dx_location_source")||"").toUpperCase();const good=s.dx_location_good;
  if(good===false||/DXCC|NONE|COUNTRY|PREFIX/.test(src))return [null,null];
  const lo=num(pick(s,"dx_longitude","dx_lon")),la=num(pick(s,"dx_latitude","dx_lat"));if(lo!=null&&la!=null&&Math.abs(la)<=90&&Math.abs(lo)<=180&&(lo||la))return [lo,la];
  const g=gridLL(pick(s,"dx_grid","dx_locator"));return g||[null,null]};
/* locator del DX escrito en el comentario: «IO91<>JN58», «JN58TD>KP20» (primero el del que avisa, luego el del DX) o «LOC JN58» */
const cmtPos=c=>{c=String(c||"").toUpperCase();let m=c.match(/\b[A-R]{2}\d{2}(?:[A-X]{2}(?:\d{2}(?:[A-X]{2})?)?)?\s*(?:<[A-Z0-9]{0,4}>|<>|>|-)\s*([A-R]{2}\d{2}(?:[A-X]{2}(?:\d{2}(?:[A-X]{2})?)?)?)\b/);
  if(!m)m=c.match(/\b(?:LOC|QTH|GRID|QRA)[ :=]*([A-R]{2}\d{2}(?:[A-X]{2}(?:\d{2}(?:[A-X]{2})?)?)?)\b/);return m?gridLL(m[1]):null};
const SP={};
SP["Spothole"]=async()=>{let j=await J("https://spothole.app/api/v1/spots?max_age=3600");if(!Array.isArray(j))j=j.spots||j.data||[];
  /* 2.10.44: solo spots de clústeres, RBN y programas de activación; los de PSK Reporter no (sus condiciones de uso no están claras) */
  j=j.filter(s=>!/PSK/i.test(String(s&&s.source||"")));
  return j.map(s=>{const src=String(s.source||"");const refs=s.sig_refs?[].concat(s.sig_refs).map(x=>typeof x==="string"?x:(x&&x.id)||"").join(" "):"";
    return {call:pick(s,"dx_call","dx","callsign"),f:toMHz(pick(s,"freq","frequency")),mode:s.mode,t:ptime(pick(s,"time","time_iso","spot_time")),by:pick(s,"de_call","spotter","de"),c:pick(s,"comment","info")||"",
      ref:refs?((s.sig?s.sig+" ":"")+refs):"",src:/RBN/i.test(src)?"RBN":/POTA/i.test(src)?"POTA":/SOTA/i.test(src)?"SOTA":"Spothole",
      dxpos:shPos(s),depos:[num(pick(s,"de_longitude","de_lon")),num(pick(s,"de_latitude","de_lat"))]}})};
SP["HamQTH"]=async()=>{const t=await T("https://www.hamqth.com/dxc_csv.php?limit=200");return t.split("\n").map(l=>l.split("^")).filter(p=>p.length>=5).map(p=>({call:p[2],f:toMHz(p[1]),t:ptime(p[4]),by:p[0],c:p[3],src:"HamQTH"}))};
/* ================= TEXTOS (expresiones fijas para cada situación) ================= */
function txtKp(kp,mx){if(kp==null)return "";const b=`Kp ${esn(kp,0)}`;if(mx==null)return b+".";
  return b+". "+(mx>=5?`NOAA prevé tormenta (Kp hasta ${esn(mx,1)}): noches ruidosas en bandas bajas y caminos polares flojos.`:mx>=4?`NOAA prevé campo activo (Kp hasta ${esn(mx,1)}): algo de QSB en los caminos del norte.`:mx>=3?"NOAA prevé campo algo agitado, sin tormentas.":"NOAA prevé campo tranquilo en los próximos días.")}
function txtSolar(L,now,kpmx){const out=[],h=+madParts(now).hour,fr=h>=7&&h<13?"Mañana":h>=13&&h<20?"Tarde":"Noche",di=h>=7&&h<19?0:1;
  const top=[];for(const s of (L.spots||[]).filter(s=>s.kind==="dx")){if(top.length>=3)break;if(!top.some(x=>x[0]===s.call))top.push([s.call,BN[s.band],s.mode||""])}
  out.push([fr+" en HF",(top.length?"Se oye "+joinEs(top.map(x=>`${x[0]} en ${x[1]} ${x[2]}`.trim()))+".":"Poco DX en el clúster ahora mismo.")]);
  const xr=String((L.space||{}).xray||""),sfi=L.sfi,ns=(((L.cotejo||{}).vals||{}).sfi||[]).length;
  const xt={X:"Rayos X en clase X: posible apagón de radio en la cara de día.",M:"Rayos X en clase M: puede haber cortes breves de HF de día.",C:"Rayos X en clase C: actividad moderada, sin efectos importantes.",B:"Rayos X bajos: Sol tranquilo.",A:"Rayos X muy bajos: Sol en calma."}[xr.charAt(0).toUpperCase()]||"";
  const stx=sfi?`SFI ${r0(sfi)}${ns>1?` (${ns} fuentes)`:""}: `+(sfi>=150?"muy alto, bandas altas abiertas buena parte del día.":sfi>=110?"bueno para 15, 12 y 10 m de día.":sfi>=90?"medio; 20 y 17 m son las bandas fiables de día.":"bajo; de día lo mejor es 20 m."):"";
  out.push(["Sol",[xt,stx].filter(Boolean).join(" ")||"Sin datos solares nuevos."]);
  const kp=L.kp,w=L.wind,bz=L.bz,g=[];if(kp!=null)g.push((kp<3?"Campo tranquilo":kp<4?"Campo algo agitado":kp<5?"Campo activo":"Tormenta geomagnética")+`, Kp ${esn(kp,0)}`);
  if(w)g.push(`viento solar de ${r0(w)} km/s${w>=500?" (rápido)":""}`);if(bz!=null&&bz<=-5)g.push(`Bz al sur (${esn(bz,1)} nT): el Kp puede subir en unas horas`);
  const tail=(kp||0)<3&&di===1?"Buena noche para 40, 80 y 160 m.":(kp||0)<3?"Buenos caminos polares hacia Japón y Norteamérica.":(kp||0)>=4?"Busca rumbos al sur: los del norte llegarán débiles.":"";
  out.push(["Geomagnetismo",(g.length?joinEs(g)+". ":"")+tail]);
  const fut=((L.outlook27||{}).days||[]).filter(d=>d[0]>new Date(now).toISOString().slice(0,10)).slice(0,10),p=[];
  if(fut.length){const mx=Math.max(...fut.map(d=>d[1])),mn=Math.min(...fut.map(d=>d[1])),ref=sfi||fut[0][1],last=fut[fut.length-1][1];
    p.push(`NOAA espera flujo ${last>ref+5?"al alza":last<ref-5?"a la baja":"estable"} (entre ${mn} y ${mx} en diez días)`);
    const stt=fut.find(d=>d[3]>=5);if(stt){const d=new Date(stt[0]+"T00:00:00Z");p.push(`posible tormenta el ${d.getUTCDate()}${window.ACRACB_LANG==="en"?" ":" de "}${MES[d.getUTCMonth()]} (Kp ${stt[3]})`)}}
  const c=(L.cme||[])[0];if(c&&c.arrival){const a=new Date(c.arrival);p.push(`llega una eyección de masa coronal hacia el ${a.getUTCDate()}${window.ACRACB_LANG==="en"?" ":" de "}${MES[a.getUTCMonth()]} a las ${String(a.getUTCHours()).padStart(2,"0")} UTC: ${c.note}`)}
  else if(kpmx!=null&&kpmx>=4)p.push(`Kp hasta ${esn(kpmx,1)} en los próximos tres días`);
  if(p.length)out.push(["Previsión",p.map(x=>x[0].toUpperCase()+x.slice(1)).join(". ")+"."]);return out}
function txtNear(sp){const nr=sp.filter(s=>s.kind==="near");if(!nr.length)return "Pocas estaciones ibéricas destacadas en esta ronda.";
  const re=/(POTA|SOTA|WWFF|DME|DVGE|IOTA)[^·]*/,rf=nr.filter(s=>re.test(s.c||"")),sel=rf.concat(nr.filter(s=>!rf.includes(s))).slice(0,3);
  return `${nr.length} spots de EA, CT y alrededores. Destacan `+joinEs(sel.map(s=>{const m=(s.c||"").match(re);return `${s.call} en ${BN[s.band]} ${s.mode||""}`.trim()+(m?` (${m[0].trim()})`:"")}))+"."}
function txtVhf(sp){const v=sp.filter(s=>s.kind==="vhf"),b6=v.filter(s=>s.band===10),b2=v.filter(s=>s.band>=11);
  if(!v.length)return {tropo:null,src:"clúster",note:"Sin aperturas en 6 m, 2 m ni 70 cm en el clúster ahora mismo."};
  const p=[];if(b6.length)p.push(`6 m abierto (${b6.length} spots de más de 300 km)`);if(b2.length)p.push(`2 m/70 cm con ${b2.length} contactos largos, probable tropo`);return {tropo:null,src:"clúster",note:joinEs(p)+"."}}

/* ================= CLÚSTER: unir, cotejar y clasificar ================= */
const BEAC=new Set(["4U1UN","VE8AT","W6WX","KH6RS","ZL6B","VK6RBP","JA2IGY","RR9O","VR2B","4S7B","ZS6DN","5Z4B","4X6TU","OH2B","CS3B","LU4AA","OA4B","YV5B"]);
function buildCluster(prev,res,dxcalls){const t0=Date.now(),raw=[],ok=[];for(const n in res)if(Array.isArray(res[n])&&res[n].length>3000)res[n]=res[n].slice(0,3000);const ACT=new Map(),DXO=new Map(),DXT=[];
  (dxcalls||[]).forEach(c=>String(c).toUpperCase().split(/[\s,;]+/).map(clean).filter(x=>x.length>=3).forEach(x=>DXT.push([x,c])));
  const dxOf=call=>{for(const [x,c] of DXT)if(call===x||(x.includes("/")?false:(call.startsWith(x+"/")||call.endsWith("/"+x))))return c;return null};for(const [n,v] of Object.entries(res))if(Array.isArray(v)&&v.length){ok.push(n);raw.push(...v)}
  const groups=new Map(),heardRaw=[],beac=[];
  for(const s of raw){const call=clean(s.call),by=clean(s.by),f=s.f;let tt=s.t;if(!call||!f||!tt||call===by)continue;if(tt>t0+6e5)tt=new Date(t0);
    const b=bandOf(f);if(b==null)continue;const age=(t0-tt)/6e4;const ed=ent(call),es=ent(by);let depos=es&&es.pos;
    if(s.depos&&s.depos[0]!=null&&s.depos[1]!=null)depos=[s.depos[0],s.depos[1]];
    const deEU=(es&&es.cont==="EU")||(es&&es.cont==="AF"&&depos&&depos[1]>27)||(!es&&depos&&depos[1]>35&&depos[0]>-25&&depos[0]<45);
    if(BEAC.has(call)){if(deEU&&age<=120)beac.push({call,f:fmtF(f),t:new Date(tt).toISOString().slice(11,16),by});continue}
    if(deEU&&ed&&age<=360)heardRaw.push([ed,call,b,modeFrom(f,s.c,s.mode),tt,s.src]);
    {const dc=age<=360?dxOf(call):null;if(dc){const md=modeFrom(f,s.c,s.mode),k=dc+"|"+b+"|"+md;let o=DXO.get(k);
      if(!o||tt>o._t){const n=o?o.n+1:1;o={call:dc,sc:call,f:fmtF(f),band:b,mode:md,t:new Date(tt).toISOString().slice(11,16),utc:iso(tt),by:by||"",c:String(s.c||"").replace(/\s+/g," ").trim().slice(0,60),n,_t:+tt};DXO.set(k,o)}else o.n++}}
    {/* 2.10.18: además de POTA, SOTA y WWFF, el resto de programas (IOTA, GMA, castillos, faros, diplomas españoles…) */const rm=String(s.ref||"").match(/^([A-Z][A-Z0-9]{1,7})\s+(\S+)/i)||String(s.c||"").match(/\b(POTA|SOTA|WWFF|IOTA|GMA|WCA|HEMA|WWBOTA|BOTA|LLOTA|ILLW|ARLHS|SIOTA|ZLOTA|DME|DVGE|DFE|DCE|DIE|DMVE|DEE)[ :#-]*([A-Z0-9]{1,5}[\/-][A-Z0-9\/-]{1,12})\b/i);
      const rf0=rm?String(rm[2]).toUpperCase().match(/^[A-Z0-9][A-Z0-9\/-]{2,15}/):null;if(rm&&rf0&&age<=60){const pg=rm[1].toUpperCase(),rf=rf0[0],k=call+"|"+rf;let o=ACT.get(k);
        if(!o||tt>o._t){let dx=s.dxpos&&s.dxpos[0]!=null&&s.dxpos[1]!=null&&posOK([s.dxpos[0],s.dxpos[1]],ed)?[s.dxpos[0],s.dxpos[1]]:(o&&o.dx)||areaPos(call,ed)||null;
          o={call,prog:pg,ref:rf,f:fmtF(f),band:b,mode:modeFrom(f,s.c,s.mode),t:new Date(tt).toISOString().slice(11,16),utc:iso(tt),by:by||"",c:String(s.c||"").replace(/\s+/g," ").trim().slice(0,50),dx,dxcc:ed?ed.dxcc:null,_t:+tt};ACT.set(k,o)}
        else if(!o.dx&&s.dxpos&&s.dxpos[0]!=null&&posOK([s.dxpos[0],s.dxpos[1]],ed))o.dx=[s.dxpos[0],s.dxpos[1]]}}
    if(age>(b>=10?120:60))continue;const key=call+"|"+Math.round(f*500);
    let g=groups.get(key);if(!g){g={call,f,band:b,t:tt,by:[],from:[],srcs:new Set(),c:[],ref:"",mode:null,ed,dxpos:null,skim:false,eu:false};groups.set(key,g)}
    g.srcs.add(s.src);if(s.src==="RBN")g.skim=true;if(tt>g.t)g.t=tt;
    if(by&&!g.by.includes(by)&&g.by.length<4&&(deEU||b>=10||!g.by.length)){g.by.push(by);g.from.push(depos||[0,0])}
    if(s.c&&g.c.length<6)g.c.push(String(s.c).slice(0,200));if(s.ref&&!g.ref)g.ref=s.ref;if(s.mode&&!g.mode)g.mode=s.mode;
    if(s.dxpos&&s.dxpos[0]!=null&&s.dxpos[1]!=null&&!g.dxpos)g.dxpos=s.dxpos;if(!g.dxpos){const cp=cmtPos(s.c);if(cp)g.dxpos=cp}g.eu=g.eu||deEU}
  const pm=new Map();(prev.spots||[]).forEach(p=>pm.set(p.call+"|"+Math.round(parseFloat(p.f)*500),p));
  let spots=[],nn=0,cf=0;
  for(const [key,g] of groups){const e=g.ed,o0=pm.get(key);
    /* 2.8.34: la misma estación sigue en el mismo sitio del mapa: si esta vez ninguna fuente trae su posición exacta, se usa la
       de la actualización anterior; y los que la oían antes se suman a los de ahora (hasta 4) */
    if(o0){if(!g.dxpos&&o0.dxp&&o0.dx)g.dxpos=o0.dx;(o0.by||[]).forEach((x,i)=>{if(g.by.length<4&&!g.by.includes(x)){g.by.push(x);g.from.push((o0.from||[])[i]||[0,0])}});if(o0.eu)g.eu=true}
    /* 2.8.35: una posición «exacta» que cae lejos de la entidad del indicativo es falsa (la dirección de QRZ del mánager de una
       DXpedición, el locator del que avisa escrito en el comentario...): se descarta y se usa la zona de la entidad */
    if(g.dxpos&&!posOK(g.dxpos,e))g.dxpos=null;
    const dx=g.dxpos||areaPos(g.call,e);if(!dx)continue;const dxcc=e?e.dxcc:null,cont=e?e.cont:null;let kind;
    const far=()=>g.from.filter(p=>p[0]||p[1]).map(p=>distKm(dx,p));
    /* 2.10.29: la referencia DME del comentario manda sobre el prefijo (EA9 desde Ávila es España; EA1 desde Mallorca, Baleares) */
    const dm=String(g.c.join(" ")).match(/\bDME[ :#-]*(\d{5})\b/i),dmp=dm?+dm[1].slice(0,2):null,dmx=dm?(dmp===7?21:(dmp===35||dmp===38)?29:(dmp===51||dmp===52)?32:281):null;
    if(dmx!=null?dmx===281:NEARDX.has(dxcc))kind="near";
    else if(g.band>=10){const d=far();if(!d.length||Math.max(...d)<300)continue;kind="vhf"}
    /* 2.10.27: un DX fuera de Europa entra aunque no lo haya anunciado un europeo (antes se descartaba y el clúster de la
       plataforma enseñaba muchos menos DX que los clústeres); si lo oyen en Europa queda marcado (eu) y pesa más en «Para ti» */
    /* 2.10.28: todo lo que no es España (281) es DX, también el resto de Europa, Baleares, Canarias, Ceuta y Melilla */
    else kind="dx";
    const old=pm.get(key);let ns=g.srcs.size;if(old)ns=Math.max(ns,+old.ns||1);const nw=!old;
    const note=[];if(g.ref)note.push(g.ref);const cm=(g.c[0]||"").replace(/\s+/g," ").trim();if(cm&&cm.length<=40&&!/WPM/i.test(cm))note.push(cm);
    if(g.skim&&[...g.srcs].every(x=>x==="RBN"))note.push("oído por skimmer (RBN)");
    spots.push({call:g.call,f:fmtF(g.f),band:g.band,mode:modeFrom(g.f,g.c.join(" "),g.mode),t:new Date(g.t).toISOString().slice(11,16),by:g.by,from:g.from,dx,dxcc,kind,cont,c:note.join(" · "),nw,ns,utc:iso(g.t),dxp:!!g.dxpos,eu:!!g.eu,_t:+g.t});
    if(nw)nn++;if(ns>1)cf++}
  /* 2.8.33: los spots aún vigentes de la actualización anterior se conservan aunque esta vez no los traiga ninguna fuente
     (una fuente que no responde ya no hace desaparecer estaciones del mapa), y el tope se aplica por antigüedad: antes se
     daba prioridad a los «nuevos» y los demás salían y volvían a entrar en cada actualización */
  const got=new Set(spots.map(x=>x.call+"|"+Math.round(parseFloat(x.f)*500)));
  for(const [k,p] of pm){if(got.has(k)||!p.utc)continue;const tt=ptime(p.utc);if(!tt)continue;const age=(t0-tt)/6e4;if(age<0||age>(p.band>=10?120:60))continue;const q=Object.assign({},p,{nw:false,_t:+tt});const pe=ent(p.call);if(pe&&!posOK(q.dx,pe)){q.dx=areaPos(p.call,pe)||q.dx;q.dxp=false}spots.push(q)}
  spots.sort((a,b)=>b._t-a._t);
  /* 2.10.27: tope por tipo de modo (fonía, CW y digitales, 150 cada uno) en vez de 150 en total: los skimmers de CW y FT8
     llenaban el tope y dejaban fuera casi toda la fonía */
  {const CAP=250,cnt={},grp=x=>{const m=String(x.mode||"").toUpperCase();return m==="CW"?"cw":/^(SSB|USB|LSB|AM|FM|PHONE|DV)$/.test(m)?"ph":"dg"};spots=spots.filter(x=>{const g=grp(x);cnt[g]=(cnt[g]||0)+1;return cnt[g]<=CAP})}
  /* 2.10.15: «nuevos» y «confirmados» se cuentan entre los spots que se muestran, no entre todos los recibidos (antes salía «150 spots (664 nuevos)») */
  nn=spots.filter(x=>x.nw).length;cf=spots.filter(x=>(+x.ns||1)>1).length;
  const newest=spots.length?spots[0]._t:null,oldest=spots.length?spots[spots.length-1]._t:null;spots.forEach(s=>delete s._t);
  const heard=new Map();(prev.heard||[]).forEach(h=>{const l=ptime(h.last);if(l&&t0-l<=6*36e5)heard.set(h.dxcc,Object.assign({},h))});
  for(const [e,call,b,m,tt,src] of heardRaw){let h=heard.get(e.dxcc);if(!h){h={dxcc:e.dxcc,ent:e.name,calls:[],b:[],m:[],n:0,last:iso(tt),src:[],pos:e.pos};heard.set(e.dxcc,h)}
    h.n++;if(!h.calls.includes(call))h.calls=[call].concat(h.calls).slice(0,8);if(!h.b.includes(b))h.b.push(b);if(!h.m.includes(m))h.m.push(m);
    const sn=src==="RBN"?"RBN":"clúster";if(!h.src.includes(sn))h.src.push(sn);if(iso(tt)>h.last)h.last=iso(tt)}
  const hm=t=>new Date(t).toISOString().slice(11,16);const bm=new Map();beac.forEach(b=>{if(!bm.has(b.call+b.f))bm.set(b.call+b.f,b)});
  const acts=[...ACT.values()].filter(o=>o.dx).sort((a,b)=>b._t-a._t).slice(0,300);acts.forEach(o=>delete o._t);
  const dxon={};[...DXO.values()].sort((a,b)=>b._t-a._t).forEach(o=>{const a=dxon[o.call]=dxon[o.call]||[];if(a.length<8){delete o._t;a.push(o)}});
  return {acts,dxon,ok,reports:raw.length,spots,heard:[...heard.values()].sort((a,b)=>a.last<b.last?1:-1).slice(0,150),beacons:[...bm.values()].slice(0,40),spotsNew:nn,
    spotsSrc:ok.length?`${nn} nuevos, ${cf} confirmados en 2+ fuentes · ${joinEs(ok)}${newest?` · ${hm(oldest)}–${hm(newest)} UTC`:""}`:"Ninguna fuente de clúster respondió",
    spotsChecked:iso(t0),spotsUTC:newest?iso(newest):prev.spotsUTC}}

/* ================= ACTUALIZACIÓN COMPLETA ================= */
const SOURCES=[["NOAA SWPC","https://www.swpc.noaa.gov/"],["NASA SDO","https://sdo.gsfc.nasa.gov/"],["SOHO (ESA/NASA)","https://soho.nascom.nasa.gov/"],["NASA CCMC DONKI","https://kauai.ccmc.gsfc.nasa.gov/DONKI/"],["GFZ Potsdam","https://kp.gfz.de/"],["SILSO (Real Observatorio de Bélgica)","https://www.sidc.be/SILSO/"],["WSPR.live","https://wspr.live/"],["Spothole (M0TRT)","https://spothole.app/"],["HamQTH","https://www.hamqth.com/"],["Open-Meteo","https://open-meteo.com/"],["CelesTrak","https://celestrak.org/"],["SatNOGS DB","https://db.satnogs.org/"]];
let BUSY=false;const LAST={};

let LASTRUN=0;
const SLOW={"GFZ Hp30":10,"NOAA D-RAP":5,"GFZ Potsdam":10,"SILSO EISN":30,"NASA DONKI":20,"NOAA avisos":5,"NOAA regiones":30,"NOAA protones":10,"WSPR.live":5,"NOAA 27 días":30,"NOAA ciclo previsto":60,"NOAA ciclo observado":60,
 /* 2.4.6: más fuentes lentas que no hace falta pedir cada pocos minutos */
 "NOAA 3 días":30,"NOAA flujo":30,"NOAA manchas":60,"NOAA WWV":15,"NOAA aurora":10},MEMO={};
for(const n in SLOW){if(!SRC[n])continue;const f=SRC[n];SRC[n]=async()=>{const m=MEMO[n];if(m&&Date.now()-m.t<SLOW[n]*6e4)return m.v;const v=await f();if(v!=null)MEMO[n]={t:Date.now(),v};return v}}
/* 2.10.34: rapidez. Antes se esperaba a la fuente más lenta (hasta 21 s si había que pasar por el intermediario).
   Ahora se pintan los datos a los DL ms con todo lo que haya llegado; las fuentes lentas siguen buscando por detrás y,
   cuando terminan, se vuelve a montar todo sin pedir nada otra vez (con los resultados ya recibidos en esta vuelta).
   Una fuente que aún sigue buscando de la vuelta anterior no se pide dos veces: se mantiene su último dato bueno. */
const DL=3000,RES={},PEND={};let MERGEQ=false;
/* 2.11.1: mientras se consulta, la lista de fuentes se va rellenando en directo (✓ o ✕ según responde cada una) y la línea
   de estado cuenta cuántas han respondido; antes no se veía nada hasta el final */
let LIVET=0;function liveSrc(){if(LIVET)return;LIVET=setTimeout(()=>{LIVET=0;if(!BUSY)return;const v=Object.values(LAST),ok=v.filter(x=>x.ok).length,done=v.filter(x=>!x.wait).length;
  const EN=window.ACRACB_LANG==="en";status(EN?`Querying the sources… ${done} of ${v.length} answered (${ok} with data)`:`Consultando las fuentes… ${done} de ${v.length} han contestado (${ok} con datos)`,"updst-run");renderSrc()},150)}
function lateMerge(){if(MERGEQ)return;const ps=Object.values(PEND);if(!ps.length)return;MERGEQ=true;
  Promise.allSettled(ps).then(()=>{const go=()=>{if(BUSY)return setTimeout(go,500);MERGEQ=false;updateAll(true,true)};go()})}
async function updateAll(auto,merge){if(BUSY)return;BUSY=true;const t0=merge?LASTRUN:Date.now();if(!merge){LASTRUN=t0;setBtn(true,auto);status(auto?"Actualización automática en curso…":"Buscando datos en todas las fuentes a la vez…","updst-run")}
  const dl=new Promise(ok=>setTimeout(ok,DL,RES));
  const run=async(tab,n)=>{if(merge){const r=RES[n];return [n,r?r.v:null]}
    if(PEND[n]){LAST[n]={ok:false,late:true,ms:0,err:"sigue buscando"};return [n,null]}
    const s=Date.now();LAST[n]={ok:false,late:true,wait:true,ms:0,err:"consultando…"};liveSrc();
    const p=(async()=>{try{const v=await tab[n]();LAST[n]={ok:v!=null&&!(Array.isArray(v)&&!v.length&&tab===SRC&&n!=="NASA DONKI"&&n!=="NOAA avisos"),ms:Date.now()-s,note:v&&v.__note||""};RES[n]={v};liveSrc();return v}
      catch(e){if(e&&e.nd)LAST[n]={ok:false,nd:true,ms:Date.now()-s,err:e.nd};else LAST[n]={ok:false,ms:Date.now()-s,err:e&&e.name==="AbortError"?"sin respuesta":/^HTTP \d+/.test(e&&e.message||"")?"respondió "+e.message.replace("HTTP ","error "):(e instanceof TypeError?"conexión rechazada":"datos no válidos")};RES[n]={v:null};liveSrc();return null}
      finally{delete PEND[n]}})();
    PEND[n]=p;const r=await Promise.race([p,dl]);
    if(r===RES&&PEND[n]){LAST[n]={ok:false,late:true,ms:DL,err:"sigue buscando"};return [n,null]}
    return [n,r===RES?null:r]};
  if(!merge){for(const k in LAST)delete LAST[k];for(const k in RES)delete RES[k]}
  const [a,b]=await Promise.all([Promise.all(Object.keys(SRC).map(n=>run(SRC,n))),Promise.all(Object.keys(SP).map(n=>run(SP,n)))]);
  const R=Object.fromEntries(a),C=Object.fromEntries(b);
  const N=JSON.parse(JSON.stringify(L));delete N.alert;const vals={},add=(k,s,v)=>{if(v!=null&&v!=="")(vals[k]=vals[k]||[]).push([s,v])};
  const W=R["NOAA WWV"]||{},K=R["NOAA Kp"]||{},WD=R["NOAA viento"]||{},XR=R["NOAA rayos X"]||{},SC=R["NOAA escalas"]||{},TD=R["NOAA 3 días"]||{};
  add("sfi","NOAA",R["NOAA flujo"]!=null?R["NOAA flujo"]:W.sfi);if(R["NOAA flujo"]!=null&&W.sfi!=null)add("sfi","NOAA WWV",W.sfi);
  add("kp","NOAA",K.kp!=null?K.kp:W.kp);add("kp","GFZ Potsdam",R["GFZ Potsdam"]!=null?r1(R["GFZ Potsdam"]):null);
  add("a","NOAA",W.a);add("ssn","SILSO EISN",R["SILSO EISN"]);add("ssn","NOAA",R["NOAA manchas"]);
  add("wind","NOAA",WD.wind);add("bz","NOAA",WD.bz);add("xray","NOAA",XR.now);
  const M=k=>med((vals[k]||[]).map(x=>x[1]));
  if(vals.sfi)N.sfi=r0(M("sfi"));if(vals.kp)N.kp=r0(M("kp"));if(vals.wind)N.wind=r0(M("wind"));if(vals.bz)N.bz=r1(M("bz"));if(WD.bt!=null)N.bt=r1(WD.bt);
  const sp=Object.assign({},N.space||{});if(vals.ssn)sp.ssn=r0(M("ssn"));if(vals.a)sp.a=r0(M("a"));if(R["NOAA densidad"]!=null)sp.dens=r1(R["NOAA densidad"]);
  const xc=mostCommon((vals.xray||[]).map(x=>String(x[1]).toUpperCase()));if(xc)sp.xray=XR.now||xc;if(SC.S!=null)sp.proton=`S${SC.S} `+(String(SC.S)==="0"?"normal":"tormenta de protones");
  const OV=R["NOAA aurora"];if(OV&&OV[1]!=null)sp.aurora=OV[0]?`${Math.round(OV[0])} % ${window.ACRACB_LANG==="en"?"in northern Europe":"en el norte de Europa"} (${Math.round(OV[1])}° N)`:(window.ACRACB_LANG==="en"?"No aurora over Europe":"Sin aurora sobre Europa");N.space=sp;
  if(TD.blocks)N.kpfc={base:TD.base,issued:TD.issued||"NOAA",days:TD.days,blocks:TD.blocks};
  const rad=Object.assign({},N.radio||{});["r12","r3","s1"].forEach(k=>{const v=SC[k]!=null?SC[k]:TD[k];if(v!=null)rad[k]=r0(v)});N.radio=rad;if(rad.r12!=null)N.flare=`M ${rad.r12} % · X ${rad.r3||0} %`;
  if(R["GFZ Hp30"])N.hp30=R["GFZ Hp30"];if(R["NOAA D-RAP"])N.drap=R["NOAA D-RAP"];if(R["NOAA 27 días"])N.outlook27=R["NOAA 27 días"];if(R["NASA DONKI"])N.cme=R["NASA DONKI"];if(R["WSPR.live"])N.wspr={at:iso(t0),bands:R["WSPR.live"]};
  /* 2.10.44: sin ionosondas (KC2G y GIRO): sus condiciones de uso no están claras. La corrección del día sale de los spots */
  delete N.iono;delete N.essn;delete N.essnSrc;
  if(R["NOAA avisos"])N.swAlerts=R["NOAA avisos"];if(R["NOAA regiones"])N.regions=R["NOAA regiones"];if(R["NOAA protones"]!=null)sp.pfu=R["NOAA protones"];
  if(R["NOAA ciclo previsto"])N.ssnPred=R["NOAA ciclo previsto"];if(R["NOAA ciclo observado"])N.cycle=R["NOAA ciclo observado"];
  N.cotejo={at:iso(t0),vals};
  const kpmx=N.kpfc&&N.kpfc.blocks?Math.max(...N.kpfc.blocks.flat()):null;N.kpNote=txtKp(N.kp,kpmx);
  /* DXpediciones */
  const today=new Date(t0).toISOString().slice(0,10);let dxr=[].concat(R["Spothole avisos"]||[]);const seen=new Set();dxr=dxr.filter(d=>!seen.has(d.call)&&seen.add(d.call));
  try{S.del?S.del("acracb_mw"):localStorage.removeItem("acracb_mw")}catch(e){}const pd=new Map((L.dx||[]).map(d=>[d.call,d]));
  if(dxr.length){N.dx=dxr.map(r=>{const e=ent(r.call),tx=(r.info+" "+r.qsl).toUpperCase(),md=["CW","SSB","RTTY","FT8","FT4"].filter(m=>tx.includes(m)),bb=tx.match(/(160|80|60|40|30|20|17|15|12|10|6)\s*-\s*(160|80|60|40|30|20|17|15|12|10|6)\s*M/);
      const end=new Date(r.end+"T00:00:00Z"),p=pd.get(r.call)||{};let q="";const m=tx.match(/QSL\s*(?:VIA|:)?\s*([A-Z0-9/]{3,})/);if(m)q=m[1];if(/LOTW/.test(tx))q=(q?q+" · ":"")+"LoTW";if(/OQRS|CLUB ?LOG/.test(tx))q=(q?q+" · ":"")+"OQRS";
      const bits=[];if(bb)bits.push(`${bb[1]}–${bb[2]} m`);if(md.length)bits.push(joinEs(md));
      return {new:true,call:r.call,ent:e?e.name:"",dxcc:e?e.dxcc:null,lat:e&&e.pos?e.pos[1]:null,lon:e&&e.pos?e.pos[0]:null,until:dm(end),end:r.end,start:r.start,
        info:`Activa hasta el ${dm(end)}`+(bits.length?" · "+bits.join(" en "):"")+".",ssb:md.length?md.includes("SSB"):null,modes:md.length?md:null,qsx:p.qsx||null,pilot:p.pilot||null,qsl:q||p.qsl||null,
        web:null}}).filter(d=>d.lat!=null);N.dxHidden=0}
  else N.dx=(L.dx||[]).filter(d=>!d.end||d.end>=today);
  /* clúster */
  const cl=buildCluster(L,C,(N.dx||[]).map(d=>d.call));
  if(cl.ok.length){Object.assign(N,{acts:cl.acts,dxon:cl.dxon,actsUTC:iso(t0),spots:cl.spots,heard:cl.heard,beacons:cl.beacons,spotsNew:cl.spotsNew,spotsSrc:cl.spotsSrc,spotsChecked:cl.spotsChecked,spotsUTC:cl.spotsUTC});N.nearNote=txtNear(cl.spots)}
  else{N.spotsSrc=cl.spotsSrc}
  N.vhf=txtVhf(N.spots||[]);N.solar=txtSolar(N,t0,kpmx);
  const dxc=new Set((N.dx||[]).map(d=>d.call));
  const items=(N.spots||[]).filter(s=>s.band<=10&&dxc.has(s.call)).slice(0,12).map(s=>({call:s.call,f:s.f,band:s.band,mode:s.mode,t:s.t,by:s.by,c:s.c||"",need:"DXpedición"}));
  N.updated=fmtLocal(t0);N.updatedUTC=iso(t0);N.sources=SOURCES;
  const okn=Object.values(LAST).filter(x=>x.ok).length,tot=Object.keys(LAST).length,secs=((Date.now()-t0)/1000).toFixed(1).replace(".",",");
  N.upd={at:iso(t0),ok:okn,tot,secs,src:Object.fromEntries(Object.entries(LAST).map(([k,v])=>[k,v.ok]))};
  delete N.mwm;try{applyLive(N)}catch(e){console.error(e)}delete L.mwm;let items2=null;try{items2=window.ACRACB_buildAlerts?ACRACB_buildAlerts():null}catch(e){}L.alert={at:iso(t0),items:items2||items};try{renderAlerts()}catch(e){}
  S.set(KEY,JSON.stringify(Object.assign({},N,{alert:L.alert})));
  const late=Object.values(LAST).filter(x=>x.late).length;
  {const EN=window.ACRACB_LANG==="en",hm=hmLocal(merge?Date.now():t0);
   status(EN?`${merge?"Completed with the slow sources":auto?"Automatic update":"Updated"} at ${hm}${merge?"":` in ${secs.replace(",",".")} s`} · ${okn} of ${tot} sources responded${cl.ok.length?` · ${cl.spots.length} spots (${cl.spotsNew} new)`:" · cluster not responding"}${late?` · ${late} slow ${late===1?"source is still searching: it will be added when it arrives":"sources are still searching: they will be added when they arrive"}`:""}`
     :`${merge?"Completado con las fuentes lentas":auto?"Actualización automática":"Actualizado"} a las ${hm}${merge?"":` en ${secs} s`} · ${okn} de ${tot} fuentes respondieron${cl.ok.length?` · ${cl.spots.length} spots (${cl.spotsNew} nuevos)`:" · clúster sin respuesta"}${late?` · ${late} ${late===1?"fuente lenta sigue buscando: se añadirá al llegar":"fuentes lentas siguen buscando: se añadirán al llegar"}`:""}`,okn?"updst-ok":"updst-err")}
  renderSrc();setBtn(false);BUSY=false;if(!merge)sched();lateMerge()}
const hmLocal=t=>new Date(t).toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"});

/* ---------------- interfaz ---------------- */
function status(t,cl){const e=$("updst");if(!e)return;e.hidden=false;e.className="note "+(cl||"");e.textContent=t}
function setBtn(on,auto){const b=$("updbtn");if(!b)return;b.hidden=false;b.disabled=on;b.classList.toggle("run",on);const x=b.querySelector(".tx");if(x)x.textContent=on?"Actualizando…":"Actualizar"}
function renderSrc(){let d=$("srcrep");const st=$("updst");if(!st)return;if(!d){d=document.createElement("details");d.id="srcrep";d.className="mdet srcrep";st.insertAdjacentElement("afterend",d)}
  const e=Object.entries(LAST);if(!e.length){d.hidden=true;return}d.hidden=false;
  d.innerHTML=`<summary>Fuentes de esta actualización</summary><div class="srcg">${e.sort((a,b)=>(b[1].ok-a[1].ok)||(!!b[1].nd-!!a[1].nd)||a[0].localeCompare(b[0],"es")).map(([n,v])=>`<span class="srci ${v.ok?"ok":v.nd||v.late?"nd":"ko"}"${v.nd?' title="La fuente responde, pero ahora no tiene datos útiles para tu zona"':""}>${v.ok?"✓":v.late?"…":v.nd?"–":"✕"} ${n}<small>${v.ok?(v.cached?"dato reciente guardado":(v.ms/1000).toFixed(1).replace(".",",")+" s")+(v.note?" · "+v.note:""):v.err||"sin datos"}</small></span>`).join("")}</div><p class="note">Las marcadas con ✕ no dejan que una página las lea directamente o no respondieron: se mantiene su último dato bueno. Las marcadas con – responden, pero ahora no tienen datos para tu zona.</p>`}
function boot(){const b=$("updbtn");if(!b)return;b.hidden=false;b.disabled=false;b.onclick=()=>updateAll(false);const c=$("updcl");if(c)c.hidden=true;
  try{const c2=JSON.parse(S.get(KEY)||"null",SAFE);if(c2&&c2.updatedUTC&&(!L.updatedUTC||c2.updatedUTC>L.updatedUTC)){(c2.spots||[]).forEach(q=>{const pe=ent(q.call);if(pe&&q.dx&&!posOK(q.dx,pe)){q.dx=areaPos(q.call,pe)||q.dx;q.dxp=false}});const al=c2.alert;delete c2.alert;applyLive(c2);if(al){L.alert=al;renderAlerts()}}}catch(e){}
  const age=(Date.now()-(Date.parse(L.updatedUTC)||Date.now()))/6e4;
  status(`Datos del ${madrid(L.updatedUTC||Date.now())}`+(age>180?` (hace ${age<1440?Math.round(age/60)+" h":Math.round(age/1440)+" días"}). Actualizando ahora…`:freqTxt()),age>180?"updst-err":"updst-ok");
  sched(age*6e4>=every()?1500:Math.max(1500,every()-age*6e4))}
let TMR=null;const vis=()=>document.visibilityState!=="hidden";
/* 2.4.4: ahorro de batería. En el ordenador, cada minuto; en el móvil y la tableta, cada 3 minutos; si nadie toca la
   pantalla en 5 minutos, cada 10; con la pestaña en segundo plano, nada. «Actualizar» sigue actualizando al momento. */
const TOUCH=(()=>{try{return matchMedia("(hover:none),(pointer:coarse)").matches}catch(e){return false}})();let ACT=Date.now();
["pointerdown","keydown","wheel","touchstart"].forEach(ev=>addEventListener(ev,()=>{const idle=Date.now()-ACT>3e5;ACT=Date.now();if(idle&&vis()&&!BUSY){const g=Date.now()-LASTRUN;sched(g>=every()?800:every()-g)}},{passive:true,capture:true}));
/* 2.4.8: si el navegador dice si el aparato está enchufado (Chrome, Edge y Android), enchufado = cada minuto y con
   batería = cada 3 minutos, también en portátiles. Si no lo dice (iPhone, iPad, Safari, Firefox): móvil y tableta cada 3, ordenador cada 1. */
let POWER=null;try{if(navigator.getBattery)navigator.getBattery().then(b=>{const up=()=>{const was=POWER;POWER=b.charging?"ac":"bat";if(was!==POWER){powerTxt();if(vis()&&!BUSY){const g=Date.now()-LASTRUN,e=every();sched(g>=e?800:e-g)}}};up();b.addEventListener("chargingchange",up)}).catch(()=>{})}catch(e){}
const bgOK=()=>{try{return !!(window.ACRACB_notifOn&&ACRACB_notifOn()&&!(window.ACRACB_alMuted&&ACRACB_alMuted()))}catch(e){return false}};
/* 2.8.3: con notificaciones activadas, en segundo plano se sigue mirando cada 3 minutos para poder avisar */
const every=()=>!vis()?18e4:Date.now()-ACT>3e5?6e5:POWER==="ac"?6e4:POWER==="bat"?18e4:TOUCH?18e4:6e4;window.ACRACB_every=()=>every()/6e4;window.ACRACB_lowPower=()=>POWER==="bat"||(POWER==null&&TOUCH);
const powerTxt=()=>{const e=$("updst");if(!e||!/^Datos del /.test(e.textContent))return;e.textContent=e.textContent.replace(/\. Se actualizan solos.*$/,freqTxt())};
const freqTxt=()=>POWER==="ac"?". Se actualizan solos cada minuto (el aparato está enchufado) y también al pulsar Actualizar.":POWER==="bat"?". Se actualizan solos cada 3 minutos (para ahorrar batería) y al momento al pulsar Actualizar.":TOUCH?". Se actualizan solos cada 3 minutos (para ahorrar batería) y al momento al pulsar Actualizar.":". Se actualizan solos cada minuto y también al pulsar Actualizar.";
function sched(ms){clearTimeout(TMR);TMR=setTimeout(()=>{if((!vis()&&!bgOK())||BUSY||(navigator.onLine===false)){if(vis()||bgOK())sched();return}updateAll(true)},ms==null?every():ms)}
window.ACRACB_updSched=()=>{if(!BUSY){const g=Date.now()-LASTRUN,e=every();sched(g>=e?800:e-g)}};
document.addEventListener("visibilitychange",()=>{if(vis()&&!BUSY){const g=Date.now()-LASTRUN,e=every();sched(g>=e?800:e-g)}else if(!vis()){clearTimeout(TMR);if(bgOK())sched()}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,50));else setTimeout(boot,50);
window.ACRACB_update=updateAll;
})();
