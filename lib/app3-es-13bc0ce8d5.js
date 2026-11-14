
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
const MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],DIA=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],DC=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
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
const PROXY="https://acracb-dx.ea5jnf.workers.dev/?u=",VIA=new Set(["www.hamqsl.com","www.spaceweather.gc.ca","kp.gfz-potsdam.de","www.sidc.be","prop.kc2g.com","lgdc.uml.edu","www.ng3k.com","clublog.org","www.dxsummit.fi","kp.gfz.de"]);
/* fuentes que se leen directamente; si el navegador no las deja leer (o no responden), se reintenta a través del
   intermediario propio del club (Cloudflare). Las que funcionan así se recuerdan durante la sesión. */
const RESCUE=new Set(["services.swpc.noaa.gov","spothole.app","www.hamqth.com","spots.wwff.co","api.pota.app","api2.sota.org.uk","db1.wspr.live","api.nasa.gov","kauai.ccmc.gsfc.nasa.gov","giro.uml.edu"]),VIA2=new Set();
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
const NEARDX=new Set([281,21,29,32,149,256,272,203,233,446]);
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
SRC["HamQSL"]=async()=>{const x=await T("https://www.hamqsl.com/solarxml.php");const tg=n=>{const m=x.match(new RegExp(`<${n}>\\s*([^<]*?)\\s*</${n}>`,"i"));return m?m[1].trim():null};
  const TR={Good:"Buena",Fair:"Regular",Poor:"Mala","Band Closed":"Cerrada","Band Open":"Abierta","50MHz ES":"Abierta (Es)",Closed:"Cerrada"};const cond={};
  for(const m of x.matchAll(/<band name="([^"]+)" time="(day|night)">([^<]+)<\/band>/gi)){(cond[m[1]]=cond[m[1]]||["",""])[m[2].toLowerCase()==="day"?0:1]=TR[m[3].trim()]||m[3].trim()}
  const e=x.match(/<phenomenon name="E-Skip" location="europe_6m">([^<]+)<\/phenomenon>/i);if(e)cond["6m"]=TR[e[1].trim()]||e[1].trim();
  return {sfi:num(tg("solarflux")),a:num(tg("aindex")),kp:num(tg("kindex")),xray:tg("xray"),ssn:num(tg("sunspots")),wind:num(tg("solarwind")),bz:num(tg("magneticfield")),cond}};
SRC["DRAO Penticton"]=async()=>{const t=await T("https://www.spaceweather.gc.ca/solar_flux_data/daily_flux_values/fluxtable.txt");
  const r=t.split("\n").map(l=>l.trim().split(/\s+/)).filter(p=>p.length>=7&&/^\d{8}$/.test(p[0]));const n=r.filter(p=>/^(2000|200000)$/.test(p[1]));const x=(n.length?n:r).pop();return x?num(x[4]):null};
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
SRC["NASA DONKI"]=async()=>{const d=new Date(),f=x=>x.toISOString().slice(0,10);const j=await J(`https://api.nasa.gov/DONKI/WSAEnlilSimulations?startDate=${f(new Date(Date.now()-7*864e5))}&endDate=${f(d)}&api_key=DEMO_KEY`)||[];
  const out=[],seen=new Set();for(const s of j){const earth=s.isEarthGB||(s.impactList||[]).some(i=>String(i.location).toLowerCase()==="earth");if(!earth)continue;
    let arr=s.estimatedShockArrivalTime;if(!arr)(s.impactList||[]).forEach(i=>{if(String(i.location).toLowerCase()==="earth")arr=i.arrivalTime});
    const ci=(s.cmeInputs||[{}])[0],st=ci.cmeStartTime;if(seen.has(st))continue;seen.add(st);const at=ptime(arr);if(at&&at<Date.now()-864e5)continue;
    const sp=num(ci.speed),kp=num(s.kp_90)||num(s.kp_135)||num(s.kp_180);
    out.push({time:st,arrival:at?iso(at):null,speed:r0(sp),note:(sp||0)>=800||(kp||0)>=6?"puede dar tormenta G1–G2":(sp||0)>=500||(kp||0)>=4?"puede agitar el campo (Kp 4–5)":"efecto débil esperado"})}
  return out};
/* ionosonda más cercana a tu locator con datos recientes (KC2G reúne las de todo el mundo, cada pocos minutos) */
SRC["KC2G ionosondas"]=async()=>{let st=await J("https://prop.kc2g.com/api/stations.json");if(st&&!Array.isArray(st))st=st.stations||st.data||Object.values(st);if(!Array.isArray(st))throw new Error("datos no válidos");
  let TX=[-0.67,38.63];try{if(Array.isArray(TXP)&&isFinite(TXP[0])&&isFinite(TXP[1]))TX=TXP}catch(e){}
  const MAXD=3000,MAXH=4;let best=null,near=null,n=0;
  for(const r of st){if(!r||typeof r!=="object")continue;const s=r.station&&typeof r.station==="object"?r.station:r;
    let lat=num(pick(s,"latitude","lat")),lon=num(pick(s,"longitude","lon","lng"));if(lat==null||lon==null)continue;if(lon>180)lon-=360;const d=distKm(TX,[lon,lat]);
    const fo=num(pick(r,"fof2","foF2","fo_f2")),mu=num(pick(r,"mufd","mufD","muf")),tt=ptime(pick(r,"time","timestamp","time_iso")),cs=num(pick(r,"cs","confidence"));
    if(fo==null||fo<=0||!tt||(cs!=null&&cs<0))continue;n++;const age=(Date.now()-tt)/36e5,nm=`${pick(s,"name")||"?"} (${pick(s,"code")||"?"})`;
    if(!near||d<near.d)near={d,nm,age};
    if(age>MAXH||age<-1||d>MAXD)continue;if(!best||d<best.d)best={d,station:nm,fof2:fo,mufd:mu,time:iso(tt)}}
  if(!best){const e={};const en=window.ACRACB_LANG==="en",ag=near?(near.age<1?(en?"under 1":"menos de 1"):String(Math.round(near.age))):"";
    e.nd=en?`no ionosonde within ${fk(MAXD)} km with data from the last ${MAXH} h`+(near?` (nearest with data: ${near.nm}, ${fk(Math.round(near.d))} km away, ${ag} h old)`:n?"":" (KC2G has no data right now)")
      :`ninguna ionosonda a menos de ${fk(MAXD)} km con datos de las últimas ${MAXH} h`+(near?` (la más cercana con datos: ${near.nm}, a ${fk(Math.round(near.d))} km, de hace ${ag} h)`:n?"":" (KC2G no trae datos ahora)");
    return {fof2:null,__note:(en?"responds; ":"responde; ")+e.nd+(en?". The eSSN is used.":". Se usa el eSSN.")}}
  return best};
SRC["KC2G eSSN"]=async()=>{const j=await J("https://prop.kc2g.com/api/essn.json");let a=Array.isArray(j)?j:(j["24h"]||j["6h"]||j.essn||j.data);if(!a||!a.length)return null;const l=a[a.length-1];return {essn:num(typeof l==="object"?l.ssn:l),time:l.time}};
SRC["GIRO ionosondas"]=async()=>{const t=new Date(),f=x=>x.toISOString().slice(0,19).replace("T","+").replace(/-/g,"/");
  for(const st of ["EB040","AT138","RO041"]){let x;try{x=await T(`https://lgdc.uml.edu/common/DIDBGetValues?ursiCode=${st}&charName=foF2,MUFD&DMUF=3000&fromDate=${f(new Date(t-6*36e5))}&toDate=${f(t)}`)}catch(e){if(/HTTP 404/.test(e.message))continue;throw e}
    const rows=x.split("\n").filter(l=>/^\s*\d{4}-\d\d-\d\dT/.test(l)).map(l=>{const p=l.trim().split(/\s+/).filter(v=>/^-?\d/.test(v)).map(Number);return [l.trim().split(/\s+/)[0],p[1],p.length>=4?p[p.length-1]:null,st]}).filter(r=>r[1]>0.5);
    if(rows.length)return rows[rows.length-1]}
  return null};
SRC["NOAA ciclo previsto"]=async()=>{const j=await J("https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json");const now=new Date().toISOString().slice(0,7),o={};
  for(const r of j){const tg=r["time-tag"]||r.time_tag,v=num(r.predicted_ssn);if(tg&&v!=null&&tg.slice(0,7)>=now&&Object.keys(o).length<13)o[tg.slice(0,7)]=r1(v)}return Object.keys(o).length?o:null};
SRC["SILSO ciclo"]=async()=>{const [m,s]=await Promise.all([T("https://www.sidc.be/SILSO/DATA/SN_m_tot_V2.0.txt"),T("https://www.sidc.be/SILSO/DATA/SN_ms_tot_V2.0.txt")]);
  const rows=t=>t.split("\n").map(l=>l.trim().split(/\s+/)).filter(p=>p.length>=4&&/^\d{4}$/.test(p[0])&&+p[3]>=0).map(p=>[`${p[0]}-${p[1].padStart(2,"0")}`,r1(+p[3])]);
  const a=rows(m),b=rows(s);return a.length?{monthly:Object.fromEntries(a.slice(-3)),smoothed:Object.fromEntries(b.slice(-3)),src:`SILSO (Real Observatorio de Bélgica), ${a[a.length-1][0]}`}:null};
SRC["WSPR.live"]=async()=>{const q="SELECT band,count() FROM wspr.rx WHERE time>now()-3600 AND distance>2500 AND rx_lat>35 AND rx_lat<60 AND rx_lon>-10 AND rx_lon<30 GROUP BY band FORMAT TSV";
  const t=await T("https://db1.wspr.live/?query="+encodeURIComponent(q));const o={};t.split("\n").forEach(l=>{const p=l.split("\t");if(p.length===2&&/^\d+$/.test(p[0])&&+p[0]>0)o[p[0]]=+p[1]});return Object.keys(o).length?o:null};
SRC["NOAA ciclo observado"]=async()=>{const j=await J("https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json");
  const r=j.filter(x=>(x["time-tag"]||x.time_tag)&&num(x.ssn)!=null&&num(x.ssn)>=0).sort((a,b)=>String(a["time-tag"]||a.time_tag).localeCompare(b["time-tag"]||b.time_tag));if(!r.length)return null;
  const k=x=>String(x["time-tag"]||x.time_tag).slice(0,7),sm=r.filter(x=>num(x.smoothed_ssn)!=null&&num(x.smoothed_ssn)>=0);
  return {monthly:Object.fromEntries(r.slice(-3).map(x=>[k(x),r1(num(x.ssn))])),smoothed:Object.fromEntries(sm.slice(-3).map(x=>[k(x),r1(num(x.smoothed_ssn))])),src:`SILSO vía NOAA SWPC, ${k(r[r.length-1])}`}};
/* --- DXpediciones --- */
SRC["NG3K"]=async()=>{const h=await T("https://www.ng3k.com/misc/adxo.html");const today=new Date().toISOString().slice(0,10),out=[];
  for(const tr of h.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){const cells=[...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c=>c[1].replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim());
    if(cells.length<5)continue;const ds=[];cells.slice(0,3).forEach(c=>{const m=c.match(/(\d{4})\s*([A-Za-z]{3})\s*(\d{1,2})/);if(m&&MESN[m[2].toLowerCase()])ds.push(`${m[1]}-${String(MESN[m[2].toLowerCase()]).padStart(2,"0")}-${m[3].padStart(2,"0")}`)});
    if(ds.length<2||!(ds[0]<=today&&today<=ds[1]))continue;let call=null;
    for(const c of cells.slice(2,5)){for(const tk of c.split(/[\s,;]+/))if(/^[A-Z0-9]{1,3}[0-9][A-Z0-9]{0,5}(\/[A-Z0-9]{1,4})?$/.test(tk)&&!/^\d+$/.test(tk)){call=tk;break}if(call)break}
    if(call)out.push({call,start:ds[0],end:ds[1],info:cells[cells.length-1],qsl:cells.find(c=>/^(QSL|LOTW|OQRS)|\bvia\b/i.test(c))||""})}
  return out};
SRC["Club Log"]=async()=>{const j=await J("https://clublog.org/mostwanted.php?api=1");const o={};for(const [k,v] of Object.entries(j)){const e=ent(v);if(e)o[e.dxcc]=+k}return o};
SRC["Spothole avisos"]=async()=>{let j=await J("https://spothole.app/api/v1/alerts");if(!Array.isArray(j))j=j.alerts||j.data||[];const today=Date.now(),out=[];
  for(const a of j){const sig=String(pick(a,"sig","type","source")||"");const call=clean(pick(a,"dx_call","dx_calls","call","callsign")||"");if(!call)continue;
    if(sig&&!/dx|ng3k/i.test(sig))continue;const s=ptime(pick(a,"start_time","start")),e=ptime(pick(a,"end_time","end"));if(!e||!s||s>today||e<today)continue;
    out.push({call:call.split(/[ ,]/)[0],start:iso(s).slice(0,10),end:iso(e).slice(0,10),info:String(pick(a,"comment","dx_name","name")||""),qsl:""})}
  return out};
/* --- Clústeres --- */
const SP={};
SP["Spothole"]=async()=>{let j=await J("https://spothole.app/api/v1/spots?max_age=3600");if(!Array.isArray(j))j=j.spots||j.data||[];
  return j.map(s=>{const src=String(s.source||"");const refs=s.sig_refs?[].concat(s.sig_refs).map(x=>typeof x==="string"?x:(x&&x.id)||"").join(" "):"";
    return {call:pick(s,"dx_call","dx","callsign"),f:toMHz(pick(s,"freq","frequency")),mode:s.mode,t:ptime(pick(s,"time","time_iso","spot_time")),by:pick(s,"de_call","spotter","de"),c:pick(s,"comment","info")||"",
      ref:refs?((s.sig?s.sig+" ":"")+refs):"",src:/RBN/i.test(src)?"RBN":/PSK/i.test(src)?"PSK Reporter":/POTA/i.test(src)?"POTA":/SOTA/i.test(src)?"SOTA":"Spothole",
      dxpos:[num(pick(s,"dx_longitude","dx_lon")),num(pick(s,"dx_latitude","dx_lat"))],depos:[num(pick(s,"de_longitude","de_lon")),num(pick(s,"de_latitude","de_lat"))]}})};
SP["DXSummit"]=async()=>{let j=await J("https://www.dxsummit.fi/api/v1/spots?limit=300");if(!Array.isArray(j))j=j.spots||[];
  return j.map(s=>({call:pick(s,"dx_call","dx","callsign"),f:toMHz(pick(s,"frequency","freq")),t:ptime(pick(s,"time","spot_time")),by:pick(s,"de_call","spotter","de"),c:pick(s,"info","comment")||"",src:"DXSummit"}))};
SP["HamQTH"]=async()=>{const t=await T("https://www.hamqth.com/dxc_csv.php?limit=300");return t.split("\n").map(l=>l.split("^")).filter(p=>p.length>=5).map(p=>({call:p[2],f:toMHz(p[1]),t:ptime(p[4]),by:p[0],c:p[3],src:"HamQTH"}))};
SP["POTA"]=async()=>{const j=await J("https://api.pota.app/spot/activator");return j.map(s=>({call:s.activator,f:toMHz(s.frequency),mode:s.mode,t:ptime(s.spotTime),by:s.spotter,c:s.comments||"",ref:s.reference?"POTA "+s.reference:"",src:"POTA",dxpos:[num(s.longitude),num(s.latitude)]}))};
SP["WWFF"]=async()=>{let j=await J("https://spots.wwff.co/static/spots.json");if(!Array.isArray(j))j=j.spots||j.data||[];return j.map(s=>({call:pick(s,"activator","callsign","dx_call"),f:toMHz(pick(s,"frequency_khz","frequency","freq")),mode:pick(s,"mode"),t:ptime(pick(s,"spot_time","spot_time_formatted","time","timestamp")),by:pick(s,"spotter","de_call"),c:pick(s,"remarks","comments","comment")||"",ref:pick(s,"reference")?"WWFF "+pick(s,"reference"):"",src:"WWFF",dxpos:[num(pick(s,"longitude","lon")),num(pick(s,"latitude","lat"))]}))};
SP["SOTA"]=async()=>{const j=await J("https://api2.sota.org.uk/api/spots/60/all");return j.map(s=>({call:s.activatorCallsign,f:toMHz(s.frequency),mode:s.mode,t:ptime(s.timeStamp),by:s.callsign,c:s.comments||"",ref:s.summitCode?`SOTA ${s.associationCode||""}/${s.summitCode}`.replace("//","/"):"",src:"SOTA"}))};

/* ================= TEXTOS (expresiones fijas para cada situación) ================= */
function txtKp(kp,mx){if(kp==null)return "";const b=`Kp ${esn(kp,0)}`;if(mx==null)return b+".";
  return b+". "+(mx>=5?`NOAA prevé tormenta (Kp hasta ${esn(mx,1)}): noches ruidosas en bandas bajas y caminos polares flojos.`:mx>=4?`NOAA prevé campo activo (Kp hasta ${esn(mx,1)}): algo de QSB en los caminos del norte.`:mx>=3?"NOAA prevé campo algo agitado, sin tormentas.":"NOAA prevé campo tranquilo en los próximos días.")}
function txtSolar(L,now,kpmx){const out=[],h=+madParts(now).hour,fr=h>=7&&h<13?"Mañana":h>=13&&h<20?"Tarde":"Noche",di=h>=7&&h<19?0:1;
  const cond=(L.cotejo||{}).hamqsl||{},lab=k=>k.replace("m-","–").replace(/m/g,"");
  const good=Object.entries(cond).filter(([k,v])=>Array.isArray(v)&&v[di]==="Buena").map(([k])=>lab(k)),fair=Object.entries(cond).filter(([k,v])=>Array.isArray(v)&&v[di]==="Regular").map(([k])=>lab(k));
  const top=[];for(const s of (L.spots||[]).filter(s=>s.kind==="dx")){if(top.length>=3)break;if(!top.some(x=>x[0]===s.call))top.push([s.call,BN[s.band],s.mode||""])}
  const hf=[];if(good.length)hf.push(`${joinEs(good)} m en buen estado`);if(fair.length)hf.push(`${joinEs(fair)} m regulares`);
  out.push([fr+" en HF",(hf.length?"Bandas: "+hf.join("; ")+". ":"")+(top.length?"Se oye "+joinEs(top.map(x=>`${x[0]} en ${x[1]} ${x[2]}`.trim()))+".":"Poco DX en el clúster ahora mismo.")]);
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
    const stt=fut.find(d=>d[3]>=5);if(stt){const d=new Date(stt[0]+"T00:00:00Z");p.push(`posible tormenta el ${d.getUTCDate()} de ${MES[d.getUTCMonth()]} (Kp ${stt[3]})`)}}
  const c=(L.cme||[])[0];if(c&&c.arrival){const a=new Date(c.arrival);p.push(`llega una eyección de masa coronal hacia el ${a.getUTCDate()} de ${MES[a.getUTCMonth()]} a las ${String(a.getUTCHours()).padStart(2,"0")} UTC: ${c.note}`)}
  else if(kpmx!=null&&kpmx>=4)p.push(`Kp hasta ${esn(kpmx,1)} en los próximos tres días`);
  if(p.length)out.push(["Previsión",p.map(x=>x[0].toUpperCase()+x.slice(1)).join(". ")+"."]);return out}
function txtNear(sp){const nr=sp.filter(s=>s.kind==="near");if(!nr.length)return "Pocas estaciones ibéricas destacadas en esta ronda.";
  const re=/(POTA|SOTA|WWFF|DME|DVGE|IOTA)[^·]*/,rf=nr.filter(s=>re.test(s.c||"")),sel=rf.concat(nr.filter(s=>!rf.includes(s))).slice(0,3);
  return `${nr.length} spots de EA, CT y alrededores. Destacan `+joinEs(sel.map(s=>{const m=(s.c||"").match(re);return `${s.call} en ${BN[s.band]} ${s.mode||""}`.trim()+(m?` (${m[0].trim()})`:"")}))+"."}
function txtVhf(sp,c6){const v=sp.filter(s=>s.kind==="vhf"),b6=v.filter(s=>s.band===10),b2=v.filter(s=>s.band>=11);
  if(!v.length)return {tropo:null,src:"clúster y HamQSL",note:"Sin aperturas en 6 m, 2 m ni 70 cm en el clúster ahora mismo."+(c6?` E-Skip en 6 m: ${String(c6).toLowerCase()}.`:"")};
  const p=[];if(b6.length)p.push(`6 m abierto (${b6.length} spots de más de 300 km)`);if(b2.length)p.push(`2 m/70 cm con ${b2.length} contactos largos, probable tropo`);return {tropo:null,src:"clúster y HamQSL",note:joinEs(p)+"."}}

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
function areaPos(call,e){try{if(!e||!AREA[e.dxcc])return e?e.pos:null;const A=AREA[e.dxcc];const c=String(call||"").toUpperCase();
  const sl=c.match(/\/(\d)$/);const d=sl?sl[1]:((c.split("/").find(x=>A.re.test(x))||"").match(A.re)||[])[1];return (d!=null&&A.p[d])||e.pos}catch(x){return e?e.pos:null}}
window.ACRACB_areaPos=(call)=>{try{return areaPos(call,ent(call))}catch(e){return null}};
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
    {const rm=String(s.ref||"").match(/^(POTA|SOTA|WWFF)\s+(\S+)/i)||String(s.c||"").match(/\b(POTA|SOTA|WWFF)[ :#-]*([A-Z0-9]{1,4}[\/-][A-Z0-9\/-]{2,10})\b/i);
      const rf0=rm?String(rm[2]).toUpperCase().match(/^[A-Z0-9][A-Z0-9\/-]{2,15}/):null;if(rm&&rf0&&age<=60){const pg=rm[1].toUpperCase(),rf=rf0[0],k=call+"|"+rf;let o=ACT.get(k);
        if(!o||tt>o._t){let dx=s.dxpos&&s.dxpos[0]!=null&&s.dxpos[1]!=null?[s.dxpos[0],s.dxpos[1]]:(o&&o.dx)||areaPos(call,ed)||null;
          o={call,prog:pg,ref:rf,f:fmtF(f),band:b,mode:modeFrom(f,s.c,s.mode),t:new Date(tt).toISOString().slice(11,16),utc:iso(tt),by:by||"",c:String(s.c||"").replace(/\s+/g," ").trim().slice(0,50),dx,dxcc:ed?ed.dxcc:null,_t:+tt};ACT.set(k,o)}
        else if(!o.dx&&s.dxpos&&s.dxpos[0]!=null)o.dx=[s.dxpos[0],s.dxpos[1]]}}
    if(age>(b>=10?120:60))continue;const key=call+"|"+Math.round(f*500);
    let g=groups.get(key);if(!g){g={call,f,band:b,t:tt,by:[],from:[],srcs:new Set(),c:[],ref:"",mode:null,ed,dxpos:null,skim:false,eu:false};groups.set(key,g)}
    g.srcs.add(s.src);if(s.src==="RBN"||s.src==="PSK Reporter")g.skim=true;if(tt>g.t)g.t=tt;
    if(by&&!g.by.includes(by)&&g.by.length<4&&(deEU||b>=10||!g.by.length)){g.by.push(by);g.from.push(depos||[0,0])}
    if(s.c&&g.c.length<6)g.c.push(String(s.c).slice(0,200));if(s.ref&&!g.ref)g.ref=s.ref;if(s.mode&&!g.mode)g.mode=s.mode;
    if(s.dxpos&&s.dxpos[0]!=null&&s.dxpos[1]!=null&&!g.dxpos)g.dxpos=s.dxpos;g.eu=g.eu||deEU}
  const pm=new Map();(prev.spots||[]).forEach(p=>pm.set(p.call+"|"+Math.round(parseFloat(p.f)*500),p));
  let spots=[],nn=0,cf=0;
  for(const [key,g] of groups){const e=g.ed,dx=g.dxpos||areaPos(g.call,e);if(!dx)continue;const dxcc=e?e.dxcc:null,cont=e?e.cont:null;let kind;
    const far=()=>g.from.filter(p=>p[0]||p[1]).map(p=>distKm(dx,p));
    if(NEARDX.has(dxcc))kind="near";
    else if(g.band>=10){const d=far();if(!d.length||Math.max(...d)<300)continue;kind="vhf"}
    else if(cont&&cont!=="EU"){if(!g.eu)continue;kind="dx"}
    else{const d=far();if(!d.length||Math.max(...d)<2500)continue;kind="ind"}
    const old=pm.get(key);let ns=g.srcs.size;if(old)ns=Math.max(ns,+old.ns||1);const nw=!old;
    const note=[];if(g.ref)note.push(g.ref);const cm=(g.c[0]||"").replace(/\s+/g," ").trim();if(cm&&cm.length<=40&&!/WPM/i.test(cm))note.push(cm);
    if(g.skim&&[...g.srcs].every(x=>x==="RBN"||x==="PSK Reporter"))note.push(g.srcs.has("RBN")?"oído por skimmer (RBN)":"decodificado (PSK Reporter)");
    spots.push({call:g.call,f:fmtF(g.f),band:g.band,mode:modeFrom(g.f,g.c.join(" "),g.mode),t:new Date(g.t).toISOString().slice(11,16),by:g.by,from:g.from,dx,dxcc,kind,c:note.join(" · "),nw,ns,_t:+g.t});
    if(nw)nn++;if(ns>1)cf++}
  spots.sort((a,b)=>b._t-a._t);const keep=spots.filter(s=>s.nw||s.band>=10);spots=keep.concat(spots.filter(s=>!keep.includes(s))).slice(0,100).sort((a,b)=>b._t-a._t);
  const newest=spots.length?spots[0]._t:null,oldest=spots.length?spots[spots.length-1]._t:null;spots.forEach(s=>delete s._t);
  const heard=new Map();(prev.heard||[]).forEach(h=>{const l=ptime(h.last);if(l&&t0-l<=6*36e5)heard.set(h.dxcc,Object.assign({},h))});
  for(const [e,call,b,m,tt,src] of heardRaw){let h=heard.get(e.dxcc);if(!h){h={dxcc:e.dxcc,ent:e.name,calls:[],b:[],m:[],n:0,last:iso(tt),src:[],pos:e.pos};heard.set(e.dxcc,h)}
    h.n++;if(!h.calls.includes(call))h.calls=[call].concat(h.calls).slice(0,8);if(!h.b.includes(b))h.b.push(b);if(!h.m.includes(m))h.m.push(m);
    const sn=src==="RBN"?"RBN":src==="PSK Reporter"?"PSK Reporter":"clúster";if(!h.src.includes(sn))h.src.push(sn);if(iso(tt)>h.last)h.last=iso(tt)}
  const hm=t=>new Date(t).toISOString().slice(11,16);const bm=new Map();beac.forEach(b=>{if(!bm.has(b.call+b.f))bm.set(b.call+b.f,b)});
  const acts=[...ACT.values()].filter(o=>o.dx).sort((a,b)=>b._t-a._t).slice(0,300);acts.forEach(o=>delete o._t);
  const dxon={};[...DXO.values()].sort((a,b)=>b._t-a._t).forEach(o=>{const a=dxon[o.call]=dxon[o.call]||[];if(a.length<8){delete o._t;a.push(o)}});
  return {acts,dxon,ok,reports:raw.length,spots,heard:[...heard.values()].sort((a,b)=>a.last<b.last?1:-1).slice(0,150),beacons:[...bm.values()].slice(0,40),spotsNew:nn,
    spotsSrc:ok.length?`${nn} nuevos, ${cf} confirmados en 2+ fuentes · ${joinEs(ok)}${newest?` · ${hm(oldest)}–${hm(newest)} UTC`:""}`:"Ninguna fuente de clúster respondió",
    spotsChecked:iso(t0),spotsUTC:newest?iso(newest):prev.spotsUTC}}

/* ================= ACTUALIZACIÓN COMPLETA ================= */
const SOURCES=[["NOAA SWPC","https://services.swpc.noaa.gov/"],["HamQSL","https://www.hamqsl.com/solar.html"],["DRAO Penticton (NRCan)","https://www.spaceweather.gc.ca/forecast-prevision/solar-solaire/solarflux/sx-4-en.php"],
 ["GFZ Potsdam","https://kp.gfz-potsdam.de/"],["SILSO (Real Observatorio de Bélgica)","https://www.sidc.be/SILSO/"],["KC2G","https://prop.kc2g.com/"],["GIRO DIDBase (UMass Lowell)","https://giro.uml.edu/"],
 ["NASA CCMC DONKI","https://kauai.ccmc.gsfc.nasa.gov/DONKI/"],["WSPR.live","https://wspr.live/"],["NG3K ADXO","https://www.ng3k.com/misc/adxo.html"],["Club Log Most Wanted","https://clublog.org/mostwanted.php"],
 ["Spothole (M0TRT)","https://spothole.app/"],["DX Summit","https://www.dxsummit.fi/"],["HamQTH DX Cluster","https://www.hamqth.com/dxcluster.php"],["POTA","https://pota.app/"],["SOTAwatch","https://sotawatch.sota.org.uk/"],["WWFF Spots","https://spots.wwff.co/"]];
let BUSY=false;const LAST={};
let LASTRUN=0;delete SRC["GIRO ionosondas"];delete SRC["SILSO ciclo"];
const SLOW={"HamQSL":10,"DRAO Penticton":30,"GFZ Potsdam":10,"SILSO EISN":30,"SILSO ciclo":360,"KC2G ionosondas":2,"KC2G eSSN":10,"GIRO ionosondas":10,"NG3K":60,"Club Log":360,"NASA DONKI":20,"WSPR.live":5,"NOAA 27 días":30,"NOAA ciclo previsto":60,"NOAA ciclo observado":60},MEMO={};
for(const n in SLOW){if(!SRC[n])continue;const f=SRC[n];SRC[n]=async()=>{const m=MEMO[n];if(m&&Date.now()-m.t<SLOW[n]*6e4)return m.v;const v=await f();if(v!=null)MEMO[n]={t:Date.now(),v};return v}}
async function updateAll(auto){if(BUSY)return;BUSY=true;const t0=Date.now();LASTRUN=t0;setBtn(true,auto);status(auto?"Actualización automática en curso…":"Buscando datos en todas las fuentes a la vez…","updst-run");
  const run=async(tab,n)=>{const s=Date.now();try{const v=await tab[n]();LAST[n]={ok:v!=null&&!(Array.isArray(v)&&!v.length&&tab===SRC&&n!=="NASA DONKI"),ms:Date.now()-s,note:v&&v.__note||""};return [n,v]}catch(e){if(e&&e.nd){LAST[n]={ok:false,nd:true,ms:Date.now()-s,err:e.nd};return [n,null]}LAST[n]={ok:false,ms:Date.now()-s,err:e&&e.name==="AbortError"?"sin respuesta":/^HTTP \d+/.test(e&&e.message||"")?"respondió "+e.message.replace("HTTP ","error "):(e instanceof TypeError?"conexión rechazada":"datos no válidos")};return [n,null]}};
  for(const k in LAST)delete LAST[k];
  const [a,b]=await Promise.all([Promise.all(Object.keys(SRC).map(n=>run(SRC,n))),Promise.all(Object.keys(SP).map(n=>run(SP,n)))]);
  const R=Object.fromEntries(a),C=Object.fromEntries(b);
  const N=JSON.parse(JSON.stringify(L));delete N.alert;const vals={},add=(k,s,v)=>{if(v!=null&&v!=="")(vals[k]=vals[k]||[]).push([s,v])};
  const W=R["NOAA WWV"]||{},K=R["NOAA Kp"]||{},H=R["HamQSL"]||{},WD=R["NOAA viento"]||{},XR=R["NOAA rayos X"]||{},SC=R["NOAA escalas"]||{},TD=R["NOAA 3 días"]||{};
  add("sfi","NOAA",R["NOAA flujo"]!=null?R["NOAA flujo"]:W.sfi);add("sfi","HamQSL",H.sfi);add("sfi","DRAO Penticton",R["DRAO Penticton"]);
  add("kp","NOAA",K.kp!=null?K.kp:W.kp);add("kp","GFZ Potsdam",R["GFZ Potsdam"]!=null?r1(R["GFZ Potsdam"]):null);add("kp","HamQSL",H.kp);
  add("a","NOAA",W.a);add("a","HamQSL",H.a);add("ssn","SILSO EISN",R["SILSO EISN"]);add("ssn","NOAA",R["NOAA manchas"]);add("ssn","HamQSL",H.ssn);
  add("wind","NOAA",WD.wind);add("wind","HamQSL",H.wind);add("bz","NOAA",WD.bz);add("bz","HamQSL",H.bz);add("xray","NOAA",XR.now);add("xray","HamQSL",H.xray);
  const KC0=R["KC2G ionosondas"],KC=KC0&&KC0.fof2!=null?KC0:null,GI=R["GIRO ionosondas"],ES=R["KC2G eSSN"]||{};
  if(KC){add("fof2","KC2G",r1(KC.fof2));add("muf","KC2G",r1(KC.mufd))}if(GI){add("fof2","GIRO "+GI[3],r1(GI[1]));if(GI[2])add("muf","GIRO "+GI[3],r1(GI[2]))}add("essn","KC2G",r1(ES.essn));
  const M=k=>med((vals[k]||[]).map(x=>x[1]));
  if(vals.sfi)N.sfi=r0(M("sfi"));if(vals.kp)N.kp=r0(M("kp"));if(vals.wind)N.wind=r0(M("wind"));if(vals.bz)N.bz=r1(M("bz"));if(WD.bt!=null)N.bt=r1(WD.bt);
  const sp=Object.assign({},N.space||{});if(vals.ssn)sp.ssn=r0(M("ssn"));if(vals.a)sp.a=r1(M("a"));if(R["NOAA densidad"]!=null)sp.dens=r1(R["NOAA densidad"]);
  const xc=mostCommon((vals.xray||[]).map(x=>String(x[1]).toUpperCase()));if(xc)sp.xray=XR.now||xc;if(SC.S!=null)sp.proton=`S${SC.S} `+(String(SC.S)==="0"?"normal":"tormenta de protones");
  const OV=R["NOAA aurora"];if(OV&&OV[1]!=null)sp.aurora=OV[0]?`${Math.round(OV[0])} % en el norte de Europa (${Math.round(OV[1])}° N)`:"Sin aurora sobre Europa";N.space=sp;
  if(TD.blocks)N.kpfc={base:TD.base,issued:TD.issued||"NOAA",days:TD.days,blocks:TD.blocks};
  const rad=Object.assign({},N.radio||{});["r12","r3","s1"].forEach(k=>{const v=SC[k]!=null?SC[k]:TD[k];if(v!=null)rad[k]=r0(v)});N.radio=rad;if(rad.r12!=null)N.flare=`M ${rad.r12} % · X ${rad.r3||0} %`;
  if(R["NOAA 27 días"])N.outlook27=R["NOAA 27 días"];if(R["NASA DONKI"])N.cme=R["NASA DONKI"];if(R["WSPR.live"])N.wspr={at:iso(t0),bands:R["WSPR.live"]};
  const fo=(vals.fof2||[]).map(x=>x[1]),mu=(vals.muf||[]).map(x=>x[1]);
  if(fo.length)N.iono={station:KC?KC.station:"Roquetes-Ebro (EB040)",fof2:r1(med(fo)),mufd:mu.length?r1(med(mu)):null,time:KC?KC.time:GI[0]};
  if(ES.essn!=null){N.essn=r1(ES.essn);const tt=ptime(ES.time);N.essnSrc="KC2G"+(tt?`, ${dm(tt)} ${tt.toISOString().slice(11,16)} UTC`:"")}
  if(R["NOAA ciclo previsto"])N.ssnPred=R["NOAA ciclo previsto"];if(R["SILSO ciclo"]||R["NOAA ciclo observado"])N.cycle=R["SILSO ciclo"]||R["NOAA ciclo observado"];
  N.cotejo={at:iso(t0),vals};if(H.cond&&Object.keys(H.cond).length)N.cotejo.hamqsl=H.cond;
  const kpmx=N.kpfc&&N.kpfc.blocks?Math.max(...N.kpfc.blocks.flat()):null;N.kpNote=txtKp(N.kp,kpmx);
  /* DXpediciones */
  const today=new Date(t0).toISOString().slice(0,10);let dxr=[].concat(R["NG3K"]||[],R["Spothole avisos"]||[]);const seen=new Set();dxr=dxr.filter(d=>!seen.has(d.call)&&seen.add(d.call));
  let mw=R["Club Log"]||{};try{const kept=JSON.parse(S.get("acracb_mw")||"{}");(L.dx||[]).forEach(d=>{if(d.mw&&d.dxcc)kept[d.dxcc]=d.mw});mw=Object.assign(kept,mw);S.set("acracb_mw",JSON.stringify(mw))}catch(e){}const pd=new Map((L.dx||[]).map(d=>[d.call,d]));
  if(dxr.length){N.dx=dxr.map(r=>{const e=ent(r.call),tx=(r.info+" "+r.qsl).toUpperCase(),md=["CW","SSB","RTTY","FT8","FT4"].filter(m=>tx.includes(m)),bb=tx.match(/(160|80|60|40|30|20|17|15|12|10|6)\s*-\s*(160|80|60|40|30|20|17|15|12|10|6)\s*M/);
      const end=new Date(r.end+"T00:00:00Z"),p=pd.get(r.call)||{};let q="";const m=tx.match(/QSL\s*(?:VIA|:)?\s*([A-Z0-9/]{3,})/);if(m)q=m[1];if(/LOTW/.test(tx))q=(q?q+" · ":"")+"LoTW";if(/OQRS|CLUB ?LOG/.test(tx))q=(q?q+" · ":"")+"Club Log OQRS";
      const bits=[];if(bb)bits.push(`${bb[1]}–${bb[2]} m`);if(md.length)bits.push(joinEs(md));
      return {new:true,call:r.call,ent:e?e.name:"",dxcc:e?e.dxcc:null,lat:e&&e.pos?e.pos[1]:null,lon:e&&e.pos?e.pos[0]:null,until:dm(end),end:r.end,start:r.start,
        info:`Activa hasta el ${dm(end)}`+(bits.length?" · "+bits.join(" en "):"")+".",ssb:md.length?md.includes("SSB"):null,modes:md.length?md:null,qsx:p.qsx||null,pilot:p.pilot||null,qsl:q||p.qsl||null,
        web:"https://www.ng3k.com/misc/adxo.html",mw:e&&mw[e.dxcc]?mw[e.dxcc]:(p.mw||null)}}).filter(d=>d.lat!=null);N.dxHidden=0}
  else N.dx=(L.dx||[]).filter(d=>!d.end||d.end>=today);
  /* clúster */
  const cl=buildCluster(L,C,(N.dx||[]).map(d=>d.call));
  if(cl.ok.length){Object.assign(N,{acts:cl.acts,dxon:cl.dxon,actsUTC:iso(t0),spots:cl.spots,heard:cl.heard,beacons:cl.beacons,spotsNew:cl.spotsNew,spotsSrc:cl.spotsSrc,spotsChecked:cl.spotsChecked,spotsUTC:cl.spotsUTC});N.nearNote=txtNear(cl.spots)}
  else{N.spotsSrc=cl.spotsSrc}
  N.vhf=txtVhf(N.spots||[],(N.cotejo.hamqsl||{})["6m"]);N.solar=txtSolar(N,t0,kpmx);
  const dxc=new Set((N.dx||[]).map(d=>d.call)),mwm={};(N.dx||[]).forEach(d=>{if(d.mw)mwm[d.dxcc]=d.mw});Object.entries(mw).forEach(([k,v])=>{if(v<=100)mwm[k]=mwm[k]||v});
  const items=(N.spots||[]).filter(s=>s.band<=10&&(dxc.has(s.call)||(s.dxcc&&mwm[s.dxcc]&&mwm[s.dxcc]<=100))).slice(0,12).map(s=>({call:s.call,f:s.f,band:s.band,mode:s.mode,t:s.t,by:s.by,c:s.c||"",need:dxc.has(s.call)?"DXpedición":"entidad rara"}));
  N.updated=fmtLocal(t0);N.updatedUTC=iso(t0);N.sources=SOURCES;
  const okn=Object.values(LAST).filter(x=>x.ok).length,tot=Object.keys(LAST).length,secs=((Date.now()-t0)/1000).toFixed(1).replace(".",",");
  N.upd={at:iso(t0),ok:okn,tot,secs,src:Object.fromEntries(Object.entries(LAST).map(([k,v])=>[k,v.ok]))};
  try{applyLive(N)}catch(e){console.error(e)}L.alert={at:iso(t0),items};try{renderAlerts()}catch(e){}
  S.set(KEY,JSON.stringify(Object.assign({},N,{alert:L.alert})));
  status(`${auto?"Actualización automática":"Actualizado"} a las ${hmLocal(t0)} en ${secs} s · ${okn} de ${tot} fuentes respondieron${cl.ok.length?` · ${cl.spots.length} spots (${cl.spotsNew} nuevos)`:" · clúster sin respuesta"}`,okn?"updst-ok":"updst-err");
  renderSrc();setBtn(false);BUSY=false;sched()}
const hmLocal=t=>new Date(t).toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"});

/* ---------------- interfaz ---------------- */
function status(t,cl){const e=$("updst");if(!e)return;e.hidden=false;e.className="note "+(cl||"");e.textContent=t}
function setBtn(on,auto){const b=$("updbtn");if(!b)return;b.hidden=false;b.disabled=on;b.classList.toggle("run",on);const x=b.querySelector(".tx");if(x)x.textContent=on?"Actualizando…":"Actualizar"}
function renderSrc(){let d=$("srcrep");const st=$("updst");if(!st)return;if(!d){d=document.createElement("details");d.id="srcrep";d.className="mdet srcrep";st.insertAdjacentElement("afterend",d)}
  const e=Object.entries(LAST);if(!e.length){d.hidden=true;return}d.hidden=false;
  d.innerHTML=`<summary>Fuentes de esta actualización</summary><div class="srcg">${e.sort((a,b)=>(b[1].ok-a[1].ok)||(!!b[1].nd-!!a[1].nd)||a[0].localeCompare(b[0],"es")).map(([n,v])=>`<span class="srci ${v.ok?"ok":v.nd?"nd":"ko"}"${v.nd?' title="La fuente responde, pero ahora no tiene datos útiles para tu zona"':""}>${v.ok?"✓":v.nd?"–":"✕"} ${n}<small>${v.ok?(v.ms/1000).toFixed(1).replace(".",",")+" s"+(v.note?" · "+v.note:""):v.err||"sin datos"}</small></span>`).join("")}</div><p class="note">Las marcadas con ✕ no dejan que una página las lea directamente o no respondieron: se mantiene su último dato bueno. Las marcadas con – responden, pero ahora no tienen datos para tu zona.</p>`}
function boot(){const b=$("updbtn");if(!b)return;b.hidden=false;b.disabled=false;b.onclick=()=>updateAll(false);const c=$("updcl");if(c)c.hidden=true;
  try{const c2=JSON.parse(S.get(KEY)||"null",SAFE);if(c2&&c2.updatedUTC&&(!L.updatedUTC||c2.updatedUTC>L.updatedUTC)){const al=c2.alert;delete c2.alert;applyLive(c2);if(al){L.alert=al;renderAlerts()}}}catch(e){}
  const age=(Date.now()-(Date.parse(L.updatedUTC)||Date.now()))/6e4;
  status(`Datos del ${madrid(L.updatedUTC||Date.now())}`+(age>180?` (hace ${age<1440?Math.round(age/60)+" h":Math.round(age/1440)+" días"}). Actualizando ahora…`:". Se actualizan solos cada minuto y también al pulsar Actualizar."),age>180?"updst-err":"updst-ok");
  sched(age>1?1500:Math.max(1500,6e4-age*6e4))}
let TMR=null;const vis=()=>document.visibilityState!=="hidden";
function sched(ms){clearTimeout(TMR);TMR=setTimeout(()=>{if(!vis()||BUSY||(navigator.onLine===false)){sched(6e4);return}updateAll(true)},ms==null?6e4:ms)}
document.addEventListener("visibilitychange",()=>{if(vis()&&!BUSY){const g=Date.now()-LASTRUN;sched(g>=6e4?800:6e4-g)}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,50));else setTimeout(boot,50);
window.ACRACB_update=updateAll;
})();

