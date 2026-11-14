
/* © 2026 ACRACB. Idea original y realización de Alfredo, EA5JNF. Todos los derechos reservados. Prohibida su copia, reproducción o adaptación sin permiso escrito del club. Versión 2.4.7 · 14/11/2026. */
/* memo: se vacía cada minuto y cada vez que cambia una opción (CACHE.clear) */
const MZ=new Map();let MZm=Math.floor(Date.now()/6e4);setInterval(()=>{const m=Math.floor(Date.now()/6e4);if(m!==MZm){MZm=m;MZ.clear()}},5000);
function memo(k,f){const v=MZ.get(k);if(v!==undefined||MZ.has(k))return v;const r=f();MZ.set(k,r);return r}
const V=JSON.parse(document.getElementById('voa').textContent);
const L=JSON.parse(document.getElementById('live').textContent);
function fmtF(f){if(f==null||f==="")return f;let n=parseFloat(String(f).replace(",","."));if(!isFinite(n))return f;if(n>1000)n/=1000;return n.toFixed(3)}
function SSNV(){const v=L.space&&L.space.ssn;return v!=null&&v!==""&&!isNaN(+v)?Math.round(+v):Math.round(ssnFrom(L.sfi))}
const FBND=[[1.8,2],[3.5,4],[5.25,5.45],[7,7.3],[10.1,10.15],[14,14.35],[18.068,18.168],[21,21.45],[24.89,24.99],[28,29.7],[50,54],[144,146],[430,440]];
function fmtTxt(t){if(typeof t!=="string")return t;return t.replace(/(Kp\s*|SFI\s*|\bA\s+)?(?<![\d.,])(\d{1,3})\.(\d{1,4})(?![\d.,])(\s*(?:nT|km|%|dB|°))?/g,(m,pre,a,b,suf)=>{if(pre||suf)return m;const v=+(a+"."+b);return FBND.some(([lo,hi])=>v>=lo&&v<=hi)?fmtF(v):m})}
function normL(){try{if(window.ACRACB_normEnt)ACRACB_normEnt();if(window.ACRACB_normEnt)ACRACB_normEnt();(L.spots||[]).forEach(s=>{s.f=fmtF(s.f);s.c=fmtTxt(s.c)});(L.beacons||[]).forEach(b=>{b.f=fmtF(b.f)});if(L.alert&&L.alert.items)L.alert.items.forEach(a=>{a.f=fmtF(a.f)});(L.dx||[]).forEach(d=>{["qsx","pilot","info","modes"].forEach(k=>{if(Array.isArray(d[k]))d[k]=d[k].map(fmtTxt);else d[k]=fmtTxt(d[k])})})}catch(e){}}
normL();
/* ---------- modos ---------- */
/* ---------- país de cada indicativo (tabla DXCC de Ham2K) y banderas ---------- */
let _DXD=null;const DXDg=()=>_DXD||(_DXD=(()=>{try{const z=JSON.parse(document.getElementById("dxccdata").textContent).z;const s=atob(z),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return JSON.parse(new TextDecoder().decode(fflate.gunzipSync(a)))}catch(e){return {p:{},x:{},d:{},f:{}}}})());
const ESN={1:"Canadá",15:"Rusia asiática",54:"Rusia europea",291:"Estados Unidos",150:"Australia",108:"Brasil",100:"Argentina",318:"China",339:"Japón",281:"España",21:"Baleares",29:"Canarias",32:"Ceuta y Melilla",149:"Azores",256:"Madeira",272:"Portugal",227:"Francia",230:"Alemania",248:"Italia",225:"Cerdeña",223:"Inglaterra",265:"Irlanda del Norte",279:"Escocia",294:"Gales",110:"Hawái",6:"Alaska",202:"Puerto Rico",285:"Islas Vírgenes de EE. UU.",446:"Marruecos",400:"Argelia",289:"Sede de la ONU (Nueva York)",117:"Sede de la UIT (Ginebra)",13:"Antártida"};
let REGN=null,REGE=null;try{REGN=new Intl.DisplayNames(["es"],{type:"region"});REGE=new Intl.DisplayNames(["en"],{type:"region"})}catch(e){}
const ESFROMMETA=(()=>{const m={};(V.meta||[]).forEach(x=>{(m[x[2]]=m[x[2]]||[]).push(x[1])});return m})();
let _CCN=null;const CCNg=()=>_CCN||(_CCN=(()=>{const n={};Object.values(DXDg().d).forEach(v=>{if(v[0])n[v[0]]=(n[v[0]]||0)+1});return n})());
function dxName(dx){if(ESN[dx])return ESN[dx];const ms=ESFROMMETA[dx];if(ms&&ms.length===1)return ms[0].replace(/\s*\([^)]*\)\s*$/,"");const e=DXDg().d[dx];if(!e)return "";
  let r="";try{r=REGN&&e[0]?REGN.of(e[0]):""}catch(x){}if(r&&r!==e[0]&&CCNg()[e[0]]===1)return r;return r&&r!==e[0]?`${e[1]} (${r})`:e[1]}
const SUFX=new Set(["P","M","MM","AM","QRP","A","LH","R","T","B","PM","J","E","SAT","QRPP"]);
function lookDx(c){if(DXDg().x[c]!=null)return DXDg().x[c];for(let n=Math.min(8,c.length);n>=1;n--){const v=DXDg().p[c.slice(0,n)];if(v!=null)return v}return null}
function callEnt(call){return memo("ce"+call,()=>{let c=String(call||"").toUpperCase().replace(/-\d+$/,"").replace(/[^A-Z0-9/]/g,"");if(!c)return null;
  const parts=c.split("/").filter(Boolean);if(parts.some(p=>p==="MM"||p==="AM"))return {mm:true};
  const cand=parts.filter(p=>!SUFX.has(p)&&!/^\d+$/.test(p));if(!cand.length)return null;
  let dx=DXDg().x[c]!=null?DXDg().x[c]:null;
  if(dx==null){let base=cand[0];if(cand.length>1){const sh=cand.slice().sort((a,b)=>a.length-b.length)[0];if(sh.length<=4)base=sh}dx=lookDx(base)}
  if(dx==null)return null;const e=DXDg().d[dx]||["",""];return {dxcc:dx,cc:e[0],name:dxName(dx)}})}
let FLAGS=null;const FLURL={};
function flagURL(cc){if(!cc)return "";if(FLURL[cc]!==undefined)return FLURL[cc];try{FLAGS=DXDg().f;
  const svg=FLAGS&&FLAGS[cc];FLURL[cc]=svg?URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"})):""}catch(e){FLURL[cc]=""}return FLURL[cc]}
/* indicativo con su bandera y su país; compact = solo bandera (el país queda en el título) */
function CS(call){const e=callEnt(call),c=esc(call);if(!e)return `<span class="cs" data-call="${c}">${c}</span>`;if(e.mm)return `<span class="cs" data-call="${c}">${c} <span class="cty">móvil marítimo</span></span>`;
  const u=flagURL(e.cc),f=u?`<img class="fl" src="${u}" alt="" width="18" height="12">`:"";
  return `<span class="cs" data-call="${c}">${c} ${f}<span class="cty">${esc(e.name)}</span></span>`}
const CSL=(arr,sep)=>(arr||[]).filter(Boolean).map(x=>CS(x)).join(sep||", ");
/* orden de las bandas en pantalla: de la más baja a la más alta */
const BALL=[0,1,8,2,9,3,4,5,6,7,10,11,12];
const MODES={
 ssb:{n:"Fonía SSB",s:"SSB",g:"Fonía",adj:0,bands:[0,1,8,2,3,4,5,6,7,10,11,12],seg:{11:"entre 144.150 y 144.400 kHz (llamada en 144.300)",12:"entre 432.100 y 432.400 kHz (llamada en 432.200)",0:"entre 1.840 y 1.900 kHz",1:"entre 3.600 y 3.800 kHz",8:"entre 5.354 y 5.366 kHz (USB, 15 W PIRE como máximo)",2:"entre 7.060 y 7.200 kHz",3:"entre 14.125 y 14.300 kHz",4:"entre 18.120 y 18.168 kHz",5:"entre 21.200 y 21.450 kHz",6:"entre 24.940 y 24.990 kHz",7:"entre 28.400 y 29.000 kHz",10:"entre 50.100 y 50.500 kHz (llamada DX en 50.110)"},dxq:"14.195 · 18.145 · 21.295 · 24.945 · 28.495, escuchando 5–10 kHz arriba",d:"la referencia: VOACAP calculado con la relación señal/ruido que necesita la voz en SSB"},
 am:{n:"Fonía AM",s:"AM",g:"Fonía",adj:-6,bands:[0,1,2,3,4,5,6,7,10],seg:{0:"dentro de 1.840–1.900 kHz",1:"en torno a 3.615–3.625 kHz",2:"dentro de 7.060–7.200 kHz",3:"en 14.286 kHz (punto de reunión de AM)",4:"dentro de 18.120–18.168 kHz",5:"en torno a 21.425 kHz",6:"dentro de 24.940–24.990 kHz",7:"entre 29.000 y 29.200 kHz",10:"en torno a 50.400 kHz"},dxq:"poco habitual en DXpediciones",d:"la AM reparte la potencia entre la portadora y dos bandas laterales: necesita unos 6 dB más de señal que la SSB"},
 fm:{n:"Fonía FM",s:"FM",g:"Fonía",adj:-10,bands:[7,10,11,12],seg:{11:"en 145.200–145.575 kHz en simplex (llamada en 145.500)",12:"en 433.400–434.600 kHz en simplex (llamada en 433.500)",7:"entre 29.520 y 29.700 kHz (llamada en 29.600)",10:"entre 51.410 y 51.590 kHz (llamada en 51.510)"},dxq:"en 10 m, 29.600 cuando la banda está muy abierta",d:"la FM se usa en 10, 6 y 2 m y en 70 cm, y necesita una señal fuerte para pasar su umbral: unos 10 dB más que la SSB"},
 cw:{n:"CW (telegrafía)",s:"CW",g:"Telegrafía",adj:11,bands:BALL,seg:{11:"entre 144.025 y 144.150 kHz (llamada en 144.050)",12:"entre 432.025 y 432.100 kHz (llamada en 432.050)",0:"entre 1.810 y 1.838 kHz",1:"entre 3.500 y 3.570 kHz",8:"entre 5.351,5 y 5.354 kHz",2:"entre 7.000 y 7.040 kHz",9:"entre 10.100 y 10.130 kHz",3:"entre 14.000 y 14.070 kHz",4:"entre 18.068 y 18.095 kHz",5:"entre 21.000 y 21.070 kHz",6:"entre 24.890 y 24.915 kHz",7:"entre 28.000 y 28.070 kHz",10:"entre 50.000 y 50.100 kHz"},dxq:"14.024 · 18.075 · 21.024 · 24.894 · 28.024, escuchando 1–5 kHz arriba",d:"con un filtro estrecho, la CW se copia de oído con unos 11 dB menos de señal que la fonía"},
 ft8:{n:"FT8",s:"FT8",g:"Digitales",adj:27,bands:BALL,seg:{11:"en 144.174 kHz (USB)",12:"en 432.174 kHz (USB)",0:"en 1.840 kHz (USB)",1:"en 3.573 kHz (USB)",8:"en 5.357 kHz (USB)",2:"en 7.074 kHz (USB)",9:"en 10.136 kHz (USB)",3:"en 14.074 kHz (USB)",4:"en 18.100 kHz (USB)",5:"en 21.074 kHz (USB)",6:"en 24.915 kHz (USB)",7:"en 28.074 kHz (USB)",10:"en 50.313 kHz (USB)"},dxq:"modo Fox/Hound en 14.090 · 18.095 · 21.091 · 24.911 · 28.091 (llama por encima de 1.000 Hz de audio)",d:"el FT8 decodifica hasta unos −21 dB en 2,5 kHz: unos 27 dB menos que la fonía, aunque cada QSO tarda un minuto o más"},
 ft4:{n:"FT4",s:"FT4",g:"Digitales",adj:23,bands:BALL,seg:{11:"en 144.170 kHz (USB)",12:"en 432.170 kHz (USB)",0:"en 1.840 kHz (USB)",1:"en 3.575 kHz (USB)",8:"en 5.357 kHz (USB)",2:"en 7.047,5 kHz (USB)",9:"en 10.140 kHz (USB)",3:"en 14.080 kHz (USB)",4:"en 18.104 kHz (USB)",5:"en 21.140 kHz (USB)",6:"en 24.919 kHz (USB)",7:"en 28.180 kHz (USB)",10:"en 50.318 kHz (USB)"},dxq:"14.080 · 21.140 · 28.180",d:"el FT4 decodifica hasta unos −17 dB en 2,5 kHz: unos 23 dB menos que la fonía"},
 jt65:{n:"JT65",s:"JT65",g:"Digitales",adj:29,bands:BALL,seg:{11:"en 144.120 kHz (USB)",12:"en 432.120 kHz (USB)",0:"en 1.838 kHz (USB)",1:"en 3.570 kHz (USB)",8:"en 5.357 kHz (USB)",2:"en 7.076 kHz (USB)",9:"en 10.138 kHz (USB)",3:"en 14.076 kHz (USB)",4:"en 18.102 kHz (USB)",5:"en 21.076 kHz (USB)",6:"en 24.917 kHz (USB)",7:"en 28.076 kHz (USB)",10:"en 50.310 kHz (USB)"},dxq:"14.076 · 21.076 · 28.076",d:"el JT65 decodifica hasta unos −24 dB en 2,5 kHz: unos 29 dB menos que la fonía, con QSO lentos"},
 js8:{n:"JS8Call",s:"JS8Call",g:"Digitales",adj:25,bands:BALL,seg:{11:"en 144.178 kHz (USB)",12:"en 432.178 kHz (USB)",0:"en 1.842 kHz (USB)",1:"en 3.578 kHz (USB)",8:"en 5.357 kHz (USB)",2:"en 7.078 kHz (USB)",9:"en 10.130 kHz (USB)",3:"en 14.078 kHz (USB)",4:"en 18.104 kHz (USB)",5:"en 21.078 kHz (USB)",6:"en 24.922 kHz (USB)",7:"en 28.078 kHz (USB)",10:"en 50.318 kHz (USB)"},dxq:"14.078 · 7.078",d:"el JS8Call en modo normal decodifica hasta unos −20 dB en 2,5 kHz: unos 25 dB menos que la fonía"},
 rtty:{n:"RTTY",s:"RTTY",g:"Digitales",adj:5,bands:BALL,seg:{11:"en torno a 144.138 kHz",12:"en torno a 432.088 kHz",0:"entre 1.838 y 1.840 kHz",1:"entre 3.580 y 3.600 kHz",8:"entre 5.354 y 5.366 kHz",2:"entre 7.040 y 7.050 kHz",9:"entre 10.130 y 10.150 kHz",3:"entre 14.080 y 14.099 kHz",4:"entre 18.100 y 18.109 kHz",5:"entre 21.080 y 21.120 kHz",6:"entre 24.915 y 24.929 kHz",7:"entre 28.070 y 28.150 kHz",10:"en torno a 50.300 kHz"},dxq:"14.085 · 21.085 · 28.085, escuchando unos kHz arriba",d:"el RTTY (45 baudios) se decodifica con unos 5 dB menos de señal que la fonía"},
 psk:{n:"PSK31",s:"PSK31",g:"Digitales",adj:16,bands:BALL,seg:{11:"en 144.138 kHz",12:"en 432.088 kHz",0:"en 1.838 kHz",1:"en 3.580 kHz",8:"en 5.357 kHz",2:"en 7.040 kHz",9:"en 10.142 kHz",3:"en 14.070 kHz",4:"en 18.100 kHz",5:"en 21.070 kHz",6:"en 24.920 kHz",7:"en 28.120 kHz",10:"en 50.290 kHz"},dxq:"14.070 · 21.070 · 28.120",d:"el PSK31 se decodifica con unos 16 dB menos de señal que la fonía"},
 sstv:{n:"SSTV (imagen)",s:"SSTV",g:"Imagen",adj:-3,bands:[1,2,3,5,7,10,11,12],seg:{11:"en 144.500 kHz",12:"en 433.400 kHz (FM)",1:"en 3.735 kHz",2:"en 7.165 kHz",3:"en 14.230 kHz",5:"en 21.340 kHz",7:"en 28.680 kHz",10:"en 50.510 kHz"},dxq:"14.230 · 21.340 · 28.680",d:"la SSTV analógica necesita una señal limpia para una imagen sin rayas: unos 3 dB más que la SSB"}};
const MOD=()=>memo("MOD",()=>{const v=($("modesel")||{}).value;return MODES[v]?v:"ssb"});
const MD=()=>MODES[MOD()];
const segTxt=b=>MD().seg[b]||("fuera de los usos de "+MD().s+" en esta banda");
function spotMode(s){const m=String((s&&s.mode)||"").toUpperCase().trim();if(!m||m==="SSB"||m==="USB"||m==="LSB"||m==="PHONE")return "ssb";if(m==="AM")return "am";if(m==="FM")return "fm";if(m.includes("SSTV"))return "sstv";if(m.includes("JT65"))return "jt65";if(m.includes("JS8"))return "js8";if(m==="CW")return "cw";if(m.includes("RTTY"))return "rtty";if(m.includes("PSK"))return "psk";if(m==="FT8")return "ft8";if(m==="FT4")return "ft4";return "otro"}
const BANDS=["160\u00a0m","80\u00a0m","40\u00a0m","20\u00a0m","17\u00a0m","15\u00a0m","12\u00a0m","10\u00a0m","60\u00a0m","30\u00a0m","6\u00a0m","2\u00a0m","70\u00a0cm"],MHZ=[1.84,3.7,7.1,14.2,18.13,21.3,24.95,28.5,5.36,10.12,50.15,145,435],BKEY=["160M","80M","40M","20M","17M","15M","12M","10M","60M","30M","6M","2M","70CM"];
const VUHF=b=>b>=11;
const P60=10*Math.log10(15/100);
const BC=["--b160","--b80","--b40","--b20","--b17","--b15","--b12","--b10","--b60","--b30","--b6","--b2","--b70"].map(v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim());
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}};
const st={mband:-1,mhour:null,zone:null,view:"band",tband:5,play:null,mode:"dx",path:"both",ly:{voa:true,arcs:true,spots:true,hops:false,bcn:false,labels:true,night:true,dxp:true},cms:null,cmsBase:null,dens:"normal",page:"ahora",pop:null};
const D2R=Math.PI/180,RE=6371;
const CAB=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"];
const cab=az=>CAB[Math.round(((+az%360)+360)%360/22.5)%16];
/* ---------- datos VOACAP ---------- */
const unb=b64=>{const s=atob(b64),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return V.z?fflate.gunzipSync(a):a};
const VB=unb(V.b);
const VS=new Int8Array(VB.buffer);
const NBD=V.nb||8,HSZ=1+NBD*3,SSZ=24*HSZ,HOFF=V.ssn.length*SSZ;
/* ---------- VOACAP de los 12 meses: el mes que va dentro de la página y los demás en archivos aparte ---------- */
const VMON=V.mon||11,MF={},MLOAD={};if(!window.ACRACB_HUBS)MF[VMON]={u:VB,s:VS};
function gunz(b64){const s=atob(b64),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return fflate.gunzipSync(a)}
function loadMonth(m){if(window.ACRACB_HUBS)return HUB.month(m);if(!m||MF[m]||MLOAD[m])return;MLOAD[m]=(document.getElementById("voa-m"+String(m).padStart(2,"0"))?Promise.resolve(JSON.parse(document.getElementById("voa-m"+String(m).padStart(2,"0")).textContent)):fetch(`voa/m${String(m).padStart(2,"0")}.json`).then(r=>r.ok?r.json():null)).then(j=>{if(!j||!j.b)return;const u=gunz(j.b);MF[m]={u,s:new Int8Array(u.buffer)};CACHE.clear();if(typeof refresh==="function")try{refresh()}catch(e){}}).catch(()=>{})}
/* VOACAP da medias del mes, centradas hacia el día 15: hoy se interpola entre este mes y el vecino según el día */
function blendNow(){return memo("blend",()=>{const n=new Date(),m=n.getUTCMonth()+1,d=n.getUTCDate(),dim=new Date(Date.UTC(n.getUTCFullYear(),m,0)).getUTCDate();return d>=15?{mA:m,mB:m%12+1,w:(d-15)/dim}:{mA:m,mB:(m+10)%12+1,w:(15-d)/dim}})}
function rawM(D,t,lp,j,h,b){if(!D||b>=NBD)return null;if(D.have&&!D.have[j]){HUB.need(D,j);return null}if((lp?t.ol:t.os)<0)return null;const o=(lp?t.ol:t.os)+(j<5?j*SSZ:HOFF+24*NBD*2+(j-5)*SSZ)+h*HSZ;return [D.u[o]/4,D.s[o+1+b*3],D.u[o+2+b*3],D.u[o+3+b*3]]}
/* ciclo solar previsto por NOAA para el mes del concurso */
function predSSN(mon,def){try{const d=nextDate(CT());const k=d.getUTCFullYear()+"-"+String(mon).padStart(2,"0");const v=L.ssnPred&&L.ssnPred[k];return v!=null&&isFinite(+v)?+v:def}catch(e){return def}}
const MB={};function monthData(m){if(!V.months[m])return null;if(!MB[m]){const a=unb(V.months[m].b);MB[m]={idx:V.months[m].idx,u:a,s:new Int8Array(a.buffer)}}return MB[m]}
const CBI=[0,1,2,3,5,7];
let BASEQ=[-0.5017,38.5779];
function normLoc(s){s=String(s||"").trim().toUpperCase().replace(/\s+/g,"");const m=s.match(/^[A-R]{2}[0-9]{2}([A-X]{2}([0-9]{2}([A-X]{2})?)?)?$/);return m?s:null}
function locToLL(s){s=normLoc(s)||"IM98RI99";let lon=(s.charCodeAt(0)-65)*20-180,lat=(s.charCodeAt(1)-65)*10-90;lon+=(+s[2])*2;lat+=(+s[3]);let w=2,h=1;
  if(s.length>=6){w/=24;h/=24;lon+=(s.charCodeAt(4)-65)*w;lat+=(s.charCodeAt(5)-65)*h}if(s.length>=8){w/=10;h/=10;lon+=(+s[6])*w;lat+=(+s[7])*h}if(s.length>=10){w/=24;h/=24;lon+=(s.charCodeAt(8)-65)*w;lat+=(s.charCodeAt(9)-65)*h}
  return [lon+w/2,lat+h/2]}
const locName=()=>"Locator "+$("loc").value;
function brgJS(a,b){const la1=a[1]*D2R,la2=b[1]*D2R,dl=(b[0]-a[0])*D2R;const y=Math.sin(dl)*Math.cos(la2),x=Math.cos(la1)*Math.sin(la2)-Math.sin(la1)*Math.cos(la2)*Math.cos(dl);return (Math.atan2(y,x)/D2R+360)%360}
function distJS(a,b){const la1=a[1]*D2R,la2=b[1]*D2R,dl=(b[0]-a[0])*D2R;return RE*Math.acos(Math.max(-1,Math.min(1,Math.sin(la1)*Math.sin(la2)+Math.cos(la1)*Math.cos(la2)*Math.cos(dl))))}
function dest(p,b,km){const la=p[1]*D2R,lo=p[0]*D2R,br=b*D2R,d=km/RE;const la2=Math.asin(Math.sin(la)*Math.cos(d)+Math.cos(la)*Math.sin(d)*Math.cos(br));const lo2=lo+Math.atan2(Math.sin(br)*Math.sin(d)*Math.cos(la),Math.cos(d)-Math.sin(la)*Math.sin(la2));return [((lo2/D2R)+540)%360-180,la2/D2R]}
const PLA=80.8*D2R,PLO=-72.7*D2R;
function gml(p){const la=p[1]*D2R,lo=p[0]*D2R;return Math.abs(Math.asin(Math.sin(la)*Math.sin(PLA)+Math.cos(la)*Math.cos(PLA)*Math.cos(lo-PLO))/D2R)}
function gm2geo(glat,glon){const a=glat*D2R,b=glon*D2R;const x=Math.cos(a)*Math.cos(b),y=Math.cos(a)*Math.sin(b),z=Math.sin(a);const t=Math.PI/2-PLA;const x2=x*Math.cos(t)+z*Math.sin(t),z2=-x*Math.sin(t)+z*Math.cos(t);const lo=Math.atan2(y,x2)+PLO,la=Math.asin(z2);return [((lo/D2R)+540)%360-180,la/D2R]}
function gmax(tx,az,km){let m=0;for(let i=0;i<=30;i++)m=Math.max(m,gml(dest(tx,az,km*i/30)));return Math.round(m)}
const TCACHE={};
function TG(){const l=$("loc").value;if(TCACHE[l])return TCACHE[l];const tx=locToLL(l);
  TCACHE[l]=V.meta.map((m,i)=>{const [id,name,dxcc,alias,lat,lon,cq,cont,act,rare,os,ol]=m;const p=[lon,lat],km=distJS(tx,p),az=brgJS(tx,p),laz=(az+180)%360,lkm=40030-km;
    const hasL=ol>=0&&km>=9000;return {i,id,name,dxcc,alias,lat,lon,cq,cont,act,rare:!!rare,os,ol,l:hasL,km:Math.round(km),az:Math.round(az),laz:Math.round(laz),lkm:Math.round(lkm),gm:gmax(tx,az,km),lgm:hasL?gmax(tx,laz,lkm):0}});return TCACHE[l]}
const T=id=>TG().find(x=>x.id===id);
function nearestT(p,dxcc){let best=null,bd=1e9;for(const t of TG()){if(dxcc&&t.dxcc!==dxcc)continue;const d=distJS(p,[t.lon,t.lat]);if(d<bd){bd=d;best=t}}if(!best&&dxcc)return nearestT(p,0);return best}
const TFM={};function tFor(o){if(!o)return null;const l=$("loc").value;const M=TFM[l]||(TFM[l]=new WeakMap());if(typeof o==="object"&&M.has(o))return M.get(o);const r=tFor0(o);if(typeof o==="object")M.set(o,r);return r}
function tFor0(o){if(o.tid&&T(o.tid))return T(o.tid);const p=o.dx?o.dx:(o.lon!=null?[o.lon,o.lat]:null);if(!p)return o.zone?T(o.zone):null;return nearestT(p,o.dxcc||0)}
let TXP=BASEQ;
/* ---------- física ---------- */
function erf(x){const s=Math.sign(x);x=Math.abs(x);const t=1/(1+0.3275911*x);return s*(1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x))}
const phi=x=>0.5*(1+erf(x/Math.SQRT2));
function rel(S,DL,DU,req){if(S<=-120)return 0;if(req<=S)return phi((S-req)/(Math.max(DL,0.1)/1.2816));return 1-phi((req-S)/(Math.max(DU,0.1)/1.2816))}
const ssnFrom=sfi=>Math.max(20,Math.min(160,1.14*sfi-73));
const utOf=lh=>(lh-1+24)%24;
const hidx=lh=>(utOf(lh)+23)%24;
function useMonth(){return memo("uMon",useMonth0)}
function useMonth0(){const m=useMonth1();if(m)loadMonth(m);return m}
function useMonth1(){return st.mode==="contest"&&$("cmon")&&$("cmon").value!=="now"&&(window.ACRACB_HUBS||V.months[CT().month])?CT().month:null}
function raw(t,lp,j,h,b,mon){if(mon){if(window.ACRACB_HUBS&&!MF[mon])loadMonth(mon);if(MF[mon])return rawM(MF[mon],t,lp,j,h,b);const M=monthData(mon);if(!M||M.idx[t.id]==null)return null;const ci=CBI.indexOf(b);if(ci<0)return null;const o=M.idx[t.id]+j*456+h*19;return [M.u[o]/4,M.s[o+1+ci*3],M.u[o+2+ci*3],M.u[o+3+ci*3]]}
  const {mA,mB,w}=blendNow();const A=rawM(MF[mA]||MF[VMON],t,lp,j,h,b);if(!A)return null;const Bm=MF[mB]&&MF[mA]?rawM(MF[mB],t,lp,j,h,b):null;if(!Bm||w<=0)return A;return [A[0]+(Bm[0]-A[0])*w,A[1]+(Bm[1]-A[1])*w,A[2]+(Bm[2]-A[2])*w,A[3]+(Bm[3]-A[3])*w]}
function interp0(t,ssn,h,b,lp,mon){const g=mon&&!MF[mon]?V.cssn:V.ssn;let k=0;while(k<g.length-2&&ssn>g[k+1])k++;const f=Math.max(0,Math.min(1,(ssn-g[k])/(g[k+1]-g[k])));
  const A=raw(t,lp,k,h,b,mon),B=raw(t,lp,k+1,h,b,mon);if(!A||!B)return {S:-128,DL:0,DU:0,muf:0};
  return {S:A[1]+(B[1]-A[1])*f,DL:A[2]+(B[2]-A[2])*f,DU:A[3]+(B[3]-A[3])*f,muf:A[0]+(B[0]-A[0])*f}}
let SPK=null;function spotK(){if(SPK!==null)return SPK;SPK={k:1,n:0};try{const ks=[];const now=localNow();for(const s of (L.spots||[])){if(spotKind(s)==="near")continue;const a=spotAge(s);if(a==null||a>120)continue;const far=s.kind==="ind"&&s.from&&s.from[0]?s.from[0]:s.dx;const t=nearestT(far,0);if(!t||s.band<3)continue;
  const ssn=ssnFrom(+$("sfi").value),h=hidx(now),m1=interp0(t,ssn,h,s.band,false,null).muf,m2=t.l?interp0(t,ssn,h,s.band,true,null).muf:0,m=Math.max(m1,m2);if(m>0){const k=MHZ[s.band]/(m*.95);if(k>1)ks.push(k)}}
  if(ks.length){ks.sort((a,b)=>a-b);SPK={k:Math.min(1.3,ks[Math.floor(ks.length/2)]),n:ks.length}}}catch(e){}return SPK}
function ionoSrc(){if(L.iono&&L.iono.fof2&&Date.now()-Date.parse(L.iono.time)<6*3600e3)return "ionosonda";return spotK().k>1?"clúster":null}
function ionoK(lh){return memo("iK"+lh,()=>ionoK0(lh))}
function ionoK0(lh){if(!$("ionoon")||!$("ionoon").checked)return 1;if(!L.iono||!L.iono.fof2||isNaN(Date.parse(L.iono.time))||Date.now()-Date.parse(L.iono.time)>6*3600e3){const sk=spotK();if(sk.k<=1)return 1;let dh=Math.abs(lh-localNow());dh=Math.min(dh,24-dh);const w=Math.max(0,1-dh/3);return 1+(sk.k-1)*w}
  if(!L.iono||!L.iono.fof2)return 1;const mt=Date.parse(L.iono.time);if(isNaN(mt)||Date.now()-mt>6*3600e3)return 1;
  const mlh=parseInt(new Date(mt).toLocaleString("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:false}),10)%24;let dh=Math.abs(lh-mlh);dh=Math.min(dh,24-dh);const w=Math.max(0,1-dh/4);if(!w)return 1;
  const pred=foF2est(mlh,true);if(!pred)return 1;const k=Math.max(.7,Math.min(1.3,L.iono.fof2/pred));return 1+(k-1)*w}
/* geometría desde tu QTH: VOACAP se calculó desde Alicante; si tu locator está en otro sitio,
   cada camino cambia de longitud y de número de saltos: pérdida por distancia (20·log d), 2 dB por
   cada salto de más y MUF de cada salto por la ley de la secante (capa F a 300 km). */
function Mf(D){const Rr=6371,hh0=300,th=D/(2*Rr);let be=Math.atan2(Math.cos(th)-Rr/(Rr+hh0),Math.sin(th));be=Math.max(be,3*D2R);const si=Rr*Math.cos(be)/(Rr+hh0);return 1/Math.sqrt(Math.max(.01,1-si*si))}
function geoK(t,lp){return memo("gk"+t.id+(lp?1:0),()=>{if(distJS(TXP,BASEQ)<30)return {k:1,ds:0};const p=[t.lon,t.lat];let a=distJS(BASEQ,p),c=distJS(TXP,p);if(lp){a=40030-a;c=40030-c}if(a<300||c<300)return {k:1,ds:0};
  const n0=Math.max(1,Math.ceil(a/3500)),n1=Math.max(1,Math.ceil(c/3500));return {k:Math.max(.75,Math.min(1.3,Mf(c/n1)/Mf(a/n0))),ds:-20*Math.log10(c/a)-2*(n1-n0)}})}
function interp(t,ssn,h,b,lp,lh){const mon=useMonth();if(mon)ssn=predSSN(mon,ssn);let x=interp0(t,ssn,h,b,lp,mon);const G=geoK(t,lp);const k=(mon?1:ionoK(lh)*stormK(t,lp,lh))*G.k;
  if(Math.abs(k-1)>.005&&b>=3&&b<=7){const fe=MHZ[b]/k;let i=3;while(i<7&&MHZ[i+1]<fe)i++;const lo=Math.max(3,Math.min(6,i)),fr=Math.max(-1,Math.min(2,Math.log(fe/MHZ[lo])/Math.log(MHZ[lo+1]/MHZ[lo])));
    const a=interp0(t,ssn,h,lo,lp,mon),c=interp0(t,ssn,h,lo+1,lp,mon);if(a.S>-120&&c.S>-120)x={S:a.S+(c.S-a.S)*fr,DL:a.DL+(c.DL-a.DL)*fr,DU:a.DU+(c.DU-a.DU)*fr,muf:x.muf*k};else x.muf*=k}
  else if(k!==1)x.muf*=k;
  if(G.ds&&x.S>-120)x={...x,S:x.S+G.ds};
  return x}
function hopRaw(t,lp,h,b){if(b>=NBD)return [0,0];if(window.ACRACB_HUBS)return HUB.hop(t,lp,h,b);const o=(lp?t.ol:t.os)+HOFF+(h*NBD+b)*2;return [VB[o],VB[o+1]*4]}
function hopD(beta,hv){const b=beta*D2R;return 2*RE*((Math.PI/2-b)-Math.asin(RE*Math.cos(b)/(RE+hv)))}
function hopsAt(t,lh,b,lp){if(lp&&!t.l)return null;const [a,v]=hopRaw(t,lp,hidx(lh),b);if(!a||!v)return null;const d=hopD(a,v);if(!(d>50))return null;const km=lp?t.lkm:t.km;const n=Math.max(1,Math.round(km/d));return {n,ang:a,len:Math.round(km/n)}}
/* ---------- antenas ---------- */
const GV=[[0,-20],[1,-8],[3,-4.5],[5,-2.8],[10,-.8],[15,0],[20,.3],[30,.3],[45,-.5],[60,-2.5],[90,-20]];
function gVert(th){for(let i=0;i<GV.length-1;i++)if(th<=GV[i+1][0]){const [a,ga]=GV[i],[b,gb]=GV[i+1];return ga+(gb-ga)*(th-a)/(b-a)}return -20}
const GND={rock:{n:"Interior, suelo rocoso o seco",er:5,sg:.001},avg:{n:"Interior, tierra normal",er:13,sg:.005},coast:{n:"Junto al mar (playa, a menos de 100 m del agua)",er:81,sg:5,half:true},sea:{n:"Rodeado de agua salada (isla o laguna)",er:81,sg:5}};
const cx=(a,b)=>({r:a,i:b}),cadd=(a,b)=>cx(a.r+b.r,a.i+b.i),csub=(a,b)=>cx(a.r-b.r,a.i-b.i),cmul=(a,b)=>cx(a.r*b.r-a.i*b.i,a.r*b.i+a.i*b.r),cdiv=(a,b)=>{const d=b.r*b.r+b.i*b.i;return cx((a.r*b.r+a.i*b.i)/d,(a.i*b.r-a.r*b.i)/d)},cabs=a=>Math.hypot(a.r,a.i),csqrt=a=>{const m=cabs(a),r=Math.sqrt((m+a.r)/2),i=Math.sign(a.i||1)*Math.sqrt(Math.max(0,(m-a.r)/2));return cx(r,i)};
function fres(th,f,g,pol){const s=Math.max(.01,Math.sin(th*D2R)),c2=Math.cos(th*D2R)**2,lam=300/f,n2=cx(g.er,-60*lam*g.sg),root=csqrt(csub(n2,cx(c2,0)));
  if(pol==="v"){const a=cmul(n2,cx(s,0));return cdiv(csub(a,root),cadd(a,root))}return cdiv(csub(cx(s,0),root),cadd(cx(s,0),root))}
const gnd=()=>memo("gnd",gnd0);const gnd0=()=>GND[($("gnd")||{}).value||"avg"]||GND.avg;
function vGround(th,f){const g=gnd(),rk=GND.rock;const a=cabs(cadd(cx(1,0),fres(th,f,g,"v"))),b=cabs(cadd(cx(1,0),fres(th,f,rk,"v")));let d=20*Math.log10(Math.max(1e-3,a)/Math.max(1e-3,b));return g.half?d/2:d}
function gHor(th,h,f,g0){const g=gnd(),k=4*Math.PI*h/(300/f)*Math.sin(th*D2R),R=fres(th,f,g,"h"),ph=cx(Math.cos(k),-Math.sin(k));let v=20*Math.log10(Math.max(1e-3,cabs(cadd(cx(1,0),cmul(R,ph)))));
  if(g.half){const R2=fres(th,f,GND.avg,"h"),v2=20*Math.log10(Math.max(1e-3,cabs(cadd(cx(1,0),cmul(R2,ph)))));v=(v+v2)/2}return g0+v}
const ANT={
 hex:{n:"Directiva 2 el.",bands:[3,4,5,6,7],h:"hxh",g:()=>5.6,d:"directiva de 2 elementos (Hex Beam, Moxon o similar) para 20, 17, 15, 12 y 10 m: unos 5,6 dBi en espacio libre (≈3,5 dBd) y mucho rechazo trasero"},
 steppir:{n:"Directiva 3 el.",bands:[2,9,3,4,5,6,7,10],h:"sph",g:b=>b===2||b===9?2.15:7.8,d:"directiva de 3 elementos (Yagi tribanda, SteppIR o similar): unos 7,8 dBi de 20 a 6 m; en 40 y 30 m se calcula como dipolo rotativo (2,15 dBi)"},
 vq:{n:"Vertical λ/4 con radiales",bands:[2,9,3,4,5,6,7,10],vert:true,full:true,d:"vertical de un cuarto de onda en cada banda con radiales suficientes (40–10 m), sin las pérdidas de una bobina"},
 dip:{n:"Dipolo o V invertida",bands:[0,1,8,2,9,3,4,5,6,7,10],h:"dph",g:()=>1.6,d:"dipolo de media onda resonante en cada banda (o V invertida: −1 dB), una por banda, de 160 a 10 m"},
 efhw:{n:"End-fed de media onda (EFHW)",bands:[2,9,3,4,5,6,7,10],h:"efh",g:b=>b===9||b===10?0.2:1.2,d:"hilo de media onda alimentado en un extremo con transformador 49:1, de 40 a 10 m: como un dipolo con 1 dB de pérdidas en el transformador"},
 invv:{n:"V invertida 40 m",bands:[2],h:"vh",g:()=>1.15,d:"dipolo en V invertida solo para 40 m: 1 dB menos que un dipolo plano"},
 d80:{n:"Dipolo 80 m",bands:[1],h:"d80h",g:()=>2.15,d:"dipolo monobanda de media onda para 80 m"},
 d160:{n:"Dipolo 160 m",bands:[0],h:"d160h",g:()=>2.15,d:"dipolo monobanda de media onda para 160 m"},
 yb:{n:"Yagi monobanda 5 el.",bands:[3,4,5,6,7,10],h:"ybh",g:()=>9.8,d:"una Yagi monobanda de 5 elementos en cada banda de 20 a 10 m (o una de boom largo): unos 9,8 dBi, la más directiva de todas"},
 quad:{n:"Cúbica 2 el.",bands:[3,4,5,6,7],h:"quh",g:()=>7.0,d:"cúbica (quad) de 2 elementos para 20 a 10 m: unos 7 dBi, algo más que una Hex Beam"},
 ocf:{n:"Dipolo OCF / Windom",bands:[1,8,2,9,3,4,5,6,7],h:"ocfh",g:b=>[1,2,3,7].includes(b)?1.6:0.6,d:"dipolo alimentado descentrado con balun 4:1, de 80 a 10 m: como un dipolo en 80, 40, 20 y 10 m y 1 dB menos en 17, 15 y 12 m, donde hace falta acoplador"},
 g5rv:{n:"G5RV / ZS6BKW",bands:[1,8,2,9,3,4,5,6,7],h:"g5h",g:b=>[2,3,6,7].includes(b)?1.6:0.6,d:"dipolo multibanda con línea paralela y acoplador, de 80 a 10 m: como un dipolo en 40, 20, 12 y 10 m y 1 dB menos en el resto por las pérdidas del acoplador"},
 lw:{n:"Hilo largo con acoplador",bands:[0,1,8,2,9,3,4,5,6,7,10],h:"lwh",g:b=>MHZ[b]<4?-2:0,d:"hilo de 20 a 40 m con acoplador automático en la base y contrapesos, de 160 a 10 m: unos 2 dB menos que un dipolo en las bandas altas y 4 dB menos en 80 y 160 m por las pérdidas de tierra"},
 vtrap:{n:"Vertical multibanda con trampas",bands:[2,9,3,4,5,6,7,10],vert:true,pen:b=>b===2?-2:b===9?-1.5:-1,d:"vertical de trampas con radiales (tipo Hy-Gain o Cushcraft), de 40 a 10 m: 1 dB menos que una λ/4 completa y 2 dB menos en 40 m"},
 vnr:{n:"Vertical sin radiales",bands:[2,9,3,4,5,6,7,10],vert:true,pen:b=>b===2?-5:-3,d:"vertical multibanda sin radiales o con unun 9:1 (tipo Diamond o hilo vertical), de 40 a 10 m: unos 3 dB menos que una λ/4 con radiales y 5 dB menos en 40 m"},
 mob:{n:"Antena de coche",bands:[2,9,3,4,5,6,7,10],vert:true,pen:b=>({2:-10,9:-7,3:-6,4:-5,5:-4,6:-3.5,7:-3,10:-2})[b]||-6,d:"antena móvil de bobina en el techo del coche (tipo Hustler o ATAS), de 40 a 10 m: entre 3 dB menos en 10 m y 10 dB menos en 40 m que una λ/4 completa"},
 mloop:{n:"Loop magnético",bands:[2,9,3,4,5,6,7],vert:true,pen:b=>({2:-8,9:-6,3:-4,4:-3,5:-2.5,6:-2,7:-2})[b]||-6,d:"loop magnético de 1 m de diámetro, vertical y a unos 2 m del suelo, de 40 a 10 m: buena en balcones, pero entre 2 dB menos en 10 m y 8 dB menos en 40 m que una λ/4 completa"},
 vert:{n:"Vertical portable",bands:[2,9,3,4,5,6,7,10],vert:true,d:"vertical portable de unos 7 m con bobina (tipo JPC-12), 30 radiales de 5 m y pica en suelo rocoso, sin acoplador; monopolo λ/4 sobre roca, con −3 dB en 40 m"}};
const ANTORD=["yb","steppir","quad","hex","dip","ocf","g5rv","efhw","lw","vq","vtrap","vnr","vert","mob","mloop"],ANTSEL={club:{n:"Directiva + dipolos para 80 y 160 m"},steppir:{},hex:{},dip:{},efhw:{},vq:{},vert:{}};
const ANTS=()=>memo("ANTS",ANTS0);const ANTS0=()=>{const sel=($("antsel")||{}).value||"club";if(sel==="club")return ["steppir","d80","d160"];if(sel==="dirv")return ["steppir","vtrap"];if(sel==="hexd")return ["hex","dip"];if(sel==="std")return ["steppir","d80","d160"];if(ANT[sel])return [sel];const a=[...new Set(($("ant").value||"vert").split(",").map(x=>x==="yagi"?"steppir":x))].filter(x=>ANT[x]);return a.length?a:["vert"]};
const ANTL=()=>ANTS().map(x=>ANT[x].n).join(" + ");
const ANTN=new Proxy({},{get:()=>ANTL()});
function gAnt(id,th,b){const A=ANT[id];if(A.vert)return gVert(th)+vGround(th,MHZ[b])+(A.pen?A.pen(b):(b===2&&!A.full?-3:0));return gHor(th,+$(A.h).value+(HILL()?40:0),MHZ[b],A.g(b))}
function antPick(b,th){return memo("aP"+b+"|"+th,()=>antPick0(b,th))}
function antPick0(b,th){let best=null;for(const id of ANTS()){if(!ANT[id].bands.includes(b))continue;const g=gAnt(id,th,b)-gVert(th);if(!best||g>best.g)best={id,g}}return best}
function antKind(b){const p=antPick(b,10);return p?p.id:"none"}
function antAdj(t,lh,b,lp){let [a]=hopRaw(t,lp&&t.l,hidx(lh),b);if(!a)a=6;const p=antPick(b,a);return p?p.g:null}
/* ---------- emplazamiento, tormenta, Kp ---------- */
function siteAdj(t){return 0}
function siteText(){const h=$("altin")?+$("altin").value:0;return `${fk(h)} metros sobre el nivel del mar: en HF la altitud por sí sola no cambia la propagación (lo que cuenta es el horizonte libre, que se elige aparte); en 2 m y 70 cm alarga el horizonte radioeléctrico`}
function kpAt(lh){return memo("kp"+lh,()=>kpAt0(lh))}
function kpAt0(lh){if(!$("kpauto")||!$("kpauto").checked||!L.kpfc)return +$("kp").value;
  const loc=new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Madrid"});const d0=Math.round((Date.parse(loc)-Date.parse(L.kpfc.base))/864e5);
  const ut=utOf(lh),d=d0-(lh===0?1:0),bk=Math.floor(ut/3);
  const n=new Date(),nd=Math.round((Date.parse(n.toISOString().slice(0,10))-Date.parse(L.kpfc.base))/864e5),nb=Math.floor(n.getUTCHours()/3);
  if(d<0||d<nd||(d===nd&&bk<=nb))return L.kp;const B=L.kpfc.blocks[Math.min(d,L.kpfc.blocks.length-1)];return Math.round(B[bk])}
function stormAdj(t,lp,lh){if(useMonth())return 0;const kp=lh==null?+$("kp").value:kpAt(lh);if(kp<4)return 0;const b=kp>=6?-10:kp===5?-6:-3;const g=lp?t.lgm:t.gm;return g>=55?b:g>=50?Math.round(b/2):0}
/* ---------- calibración ---------- */
let OBS=[];
const calKey=()=>memo("calK",calKey0);const calKey0=()=>$("loc").value.slice(0,4)+"|"+ANTS().slice().sort().join("+");
let CALDB={};
function calDb(){return $("calon")&&$("calon").checked&&CALDB[calKey()]?CALDB[calKey()].db:0}
/* ---------- línea, ROE, procesador y competencia ---------- */
function coaxLoss(b){return memo("cx"+b,()=>coaxLoss0(b))}
function coaxLoss0(b){const k=+(($("coax")||{}).value||0),l=+(($("coaxl")||{}).value||0);return k*Math.sqrt(MHZ[b])*l/100}
function swrLoss(){return memo("swr",swrLoss0)}
function swrLoss0(){const s=+(($("swr")||{}).value||1);const g=(s-1)/(s+1);return -10*Math.log10(1-g*g)}
function lineAdj(b){return memo("la"+b,()=>lineAdj0(b))}
function lineAdj0(b){return -coaxLoss(b)-swrLoss()+(+(($("proc")||{}).value||0))-(+(($("pile")||{}).value||0))}
function rxNoisePen(b){const s=+(($("lnz")||{}).value||2);return Math.max(0,(s-2)*6)}
function probRX(t,lh,b,lp){const r=prob(t,lh,b,lp,"rx");return r}
/* ---------- probabilidad ---------- */
const CACHE=new Map();{const _c=CACHE.clear.bind(CACHE);CACHE.clear=()=>{_c();MZ.clear()}}

/* ---------- VHF y UHF (2 m y 70 cm): balance de enlace troposférico, no VOACAP ----------
   Recibido = potencia + ganancias − pérdida en espacio libre (32,45 + 20·log f + 20·log d)
   − pérdida más allá del horizonte radioeléctrico (difracción y dispersión troposférica);
   se compara con el ruido térmico del receptor (−174 dBm/Hz + 10·log 2.400 Hz + NF 2 dB)
   más la relación señal/ruido de cada modo; variabilidad de ±8 dB (σ). Sin conductos
   troposféricos, E esporádica, dispersión meteórica, rebote lunar ni repetidores. */
function vhfEIRPgain(){const a=ANTS();return a.some(x=>["steppir","yb","hex","quad"].includes(x))?11:4}
function vhfProb(t,b,RXM){return vhfProbD(Math.max(1,distJS(TXP,[t.lon,t.lat])),b,RXM)}
function vhfProbD(d,b,RXM){const Q=PRM(),f=MHZ[b];
  const hA=Math.max(5,+($(ANT[ANTS()[0]]&&ANT[ANTS()[0]].h?ANT[ANTS()[0]].h:"sph")||{value:10}).value||10)+Math.min(300,Math.max(0,+$("altin").value)*0.25),hB=10;
  const dh=4.12*(Math.sqrt(hA)+Math.sqrt(hB));const Lfs=32.45+20*Math.log10(f)+20*Math.log10(d);
  const kx=b===11?0.11:0.16;const Lx=d>dh?12+kx*(d-dh):0;
  const gT=vhfEIRPgain(),gR=Q.rx>0?11:4;const tx=RXM?50+Q.opw:50+Q.pdb+lineAdj(b)-(MOD()==="ssb"?0:0);
  const prx=tx+gT+gR-Lfs-Lx-(RXM?coaxLoss(b)+swrLoss()+rxNoisePen(b):0)+Q.cal;
  const need=-174+10*Math.log10(2400)+2+(Q.thr-38)+10-MD().adj+(RXM?0:-Q.nz);const p=phi((prx-need)/8);
  return {p:Math.max(0,Math.min(1,p)),muf:0,vhf:true,km:d,dh}}
/* distancia a la que la probabilidad baja al 50 % con tu estación y el modo elegido */
function vhfRange(b){return memo("vr"+b,()=>{let lo=1,hi=3000;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(vhfProbD(m,b,false).p>=.5)lo=m;else hi=m}return Math.round(lo)})}

/* ================= modelos físicos añadidos a VOACAP =================
   Ruido (ITU-R P.372): ruido artificial Fam = c − d·log f según el entorno, galáctico (52 − 23·log f, por encima
   de unos 8 MHz) y atmosférico de latitudes medias (aproximación de las curvas de P.372, de día y de noche);
   se suman en potencia. VOACAP se calculó con ruido rural (−150 dBW/Hz a 3 MHz), así que se aplica la diferencia. */
const lg10=Math.log10,psum=(...a)=>10*lg10(a.reduce((s,x)=>s+Math.pow(10,x/10),0));
const NCAT={city:[76.8,27.7],res:[72.5,27.7],rural:[67.2,27.7],quiet:[53.6,28.6]};
const Fam=(c,f)=>NCAT[c][0]-NCAT[c][1]*lg10(f),Fgal=f=>f>=8?52-23*lg10(f):-99,Fatm=(f,n)=>(n?88:68)-36*lg10(f);
const Ntot=(fam,f,n)=>psum(fam,Fgal(f),Fatm(f,n));
const NZC={"-10":"city","-5":"res","0":"rural","5":"quiet"};
/* ruido en la estación DX: categoría elegida frente a rural, banda a banda, con día o noche en su QTH */
const NZV=()=>memo("nzv",()=>NZC[($("nz")||{}).value]||"rural");
function dxNoisePen(t,b,lh){const c=NZV();if(c==="rural")return 0;const f=MHZ[b],n=sunElF([t.lon,t.lat],lh)<-6;return Ntot(Fam(c,f),f,n)-Ntot(Fam("rural",f),f,n)}
/* tu ruido local medido: S-meter en 20 m (S9 = −73 dBm, 6 dB por unidad S) en 2,4 kHz → factor de ruido F;
   se despeja el ruido artificial de tu QTH y se lleva a cada banda con la pendiente de P.372 */
function localNoisePen(b,lh){return memo("lnp"+b+"|"+lh,()=>{const s=memo("lnzv",()=>+(($("lnz")||{}).value||2)),f=MHZ[b],n=sunElF(TXP,lh)<-6;
  const Fm=(-121+6*(s-1))+174-10*lg10(2400),f20=14.2,bg=psum(Fgal(f20),Fatm(f20,n));
  const fam20=Fm>bg+.1?10*lg10(Math.pow(10,Fm/10)-Math.pow(10,bg/10)):bg-12;
  const famF=fam20-27.7*lg10(f/f20);return Ntot(famF,f,n)-Ntot(Fam("rural",f),f,n)})}
/* tormenta geomagnética: fase negativa de la capa F (la foF2 y la MUF bajan) según Kp y la latitud geomagnética
   máxima del camino, y absorción auroral en la capa D al cruzar el óvalo (borde ≈ 67° − 2,5·Kp), ∝ f^−1,5 */
function stormK(t,lp,lh){if(useMonth())return 1;const kp=kpAt(lh);if(kp<=3)return 1;const g=lp?t.lgm:t.gm;return 1-Math.min(.4,(kp-3)*.07)*Math.max(0,Math.min(1,(g-40)/20))}
function auroraDb(t,lp,lh,b){if(useMonth())return 0;const kp=kpAt(lh);if(kp<3)return 0;const g=lp?t.lgm:t.gm;if(g<67-2.5*kp)return 0;return -Math.min(25,(kp-2)*2.5*Math.pow(10/MHZ[b],1.5))}
/* horizonte de tu QTH: si el ángulo de salida de VOACAP queda por debajo del obstáculo, difracción en filo de
   cuchillo (ITU-R P.526): J(v) = 6,9 + 20·log(√((v−0,1)²+1) + v − 0,1), con el obstáculo a unos 300 m */
const HZV=()=>memo("hzv",()=>+(($("hz")||{}).value||0));
function horizDb(a,b){const hz=HZV();if(hz<0)return 0;const v=(hz-a)*D2R*Math.sqrt(2*300/(300/MHZ[b]));if(v<=-.78)return 0;return -(6.9+20*lg10(Math.sqrt((v-.1)*(v-.1)+1)+v-.1))}
/* cumbre despejada: el terreno cae delante de la antena y el reflejo en el suelo se produce más abajo:
   equivale a una antena horizontal unos 40 m más alta para los ángulos bajos */
const HILL=()=>HZV()<0;
/* parámetros de la estación: se leen una vez por cambio, no en cada cálculo */
const SSNNOW=()=>L.essn!=null&&isFinite(+L.essn)&&!st.sfiManual?+L.essn:ssnFrom(+$("sfi").value);
const PRM=()=>memo("PRM",()=>({ssn:SSNNOW(),pdb:10*Math.log10(+$("eq").value/100),opw:10*Math.log10((+$("opw").value||100)/100),rx:+$("rx").value,thr:+$("thr").value-MD().adj,cal:calDb()}));
/* margen sobre el umbral en un sentido: tú → él (te oye) o él → tú (RX: le oyes) */
function marg(t,lh,b,lp,RXM){const aa=antAdj(t,lh,b,lp);if(aa===null)return null;const Q=PRM(),x=interp(t,Q.ssn,hidx(lh),b,lp,lh);
  let [a]=hopRaw(t,lp&&t.l,hidx(lh),b);if(!a)a=6;
  const prop=aa+Q.rx+horizDb(a,b)+auroraDb(t,lp,lh,b);
  const adj=RXM?Q.opw-coaxLoss(b)-swrLoss()-localNoisePen(b,lh)+prop:(b===8?Math.min(Q.pdb,P60):Q.pdb)+lineAdj(b)-dxNoisePen(t,b,lh)+prop;
  return {m:x.S+adj,DL:x.DL,DU:x.DU,thr:Q.thr,muf:x.muf}}
function prob(t,lh,b,lp,extra){const RXM=extra==="rx";if(RXM)extra=0;const key=t.id+"|"+lh+"|"+b+"|"+(lp?1:0)+"|"+(extra||0)+(RXM?"|rx":"");if(CACHE.has(key))return CACHE.get(key);
  if(VUHF(b)){const r=lp?{p:0,muf:0}:vhfProb(t,b,RXM);CACHE.set(key,r);return r}
  if(lp&&(!t.l||(useMonth()&&!MF[useMonth()]))){const r={p:0,muf:0};CACHE.set(key,r);return r}
  const M=marg(t,lh,b,lp,RXM);if(!M){const r={p:0,muf:0,na:true};CACHE.set(key,r);return r}
  const r={p:rel(M.m+PRM().cal+(extra||0),M.DL,M.DU,M.thr),muf:M.muf};CACHE.set(key,r);return r}
/* ---------- log QRZ ---------- */
let LOG=null;
function bandNeed(t,b){if(!LOG||!t)return null;const e=LOG.e[t.dxcc];return !(e&&e[BKEY[b]]==="C")}
function entNeed(t){if(!LOG||!t)return null;const e=LOG.e[t.dxcc];return !(e&&Object.values(e).includes("C"))}
function dxNew(d){const t=tFor(d);const n=entNeed(t);return n===null?true:n}

/* ---------- concursos ---------- */
const CONTESTS={
 cqww:{modes:["ssb"],n:"CQ WW DX SSB",month:10,wk:"last",h:48,bands:[0,1,2,3,5,7],ok:t=>true,pts:(t,b)=>t.dxcc===281?0:t.cont==="EU"?1:3,mult:"zonas CQ y países, por banda",mk:"cqdx",
   tip:"Desde EA, Europa da 1 punto y el resto del mundo 3. Los multiplicadores (zona CQ y país) cuentan otra vez en cada banda: cambiar de banda para sumar multiplicadores compensa."},
 wpx:{modes:["ssb"],n:"CQ WPX SSB",month:3,wk:"last",h:48,so:36,bands:[0,1,2,3,5,7],ok:t=>true,pts:(t,b)=>{const lo=b<=2;return t.cont==="EU"?(lo?2:1):(lo?6:3)},mult:"prefijos (una vez en todo el concurso)",mk:"wpx",
   tip:"Desde EA, otro continente da 3 puntos (6 en 40, 80 y 160 m) y Europa 1 (2 en las bandas bajas). Los prefijos cuentan una sola vez: lo que importa es el ritmo."},
 arrl:{modes:["ssb"],n:"ARRL International DX SSB",month:3,wk:"first",h:48,bands:[0,1,2,3,5,7],ok:t=>t.dxcc===291||t.dxcc===1,pts:()=>3,mult:"estados de EE. UU. y provincias de Canadá, por banda",mk:"wve",
   tip:"Desde EA solo cuentan los QSO con EE. UU. y Canadá: 3 puntos cada uno. Toda la estrategia es tener abierto el camino a Norteamérica."},
 iaru:{modes:["ssb","cw"],n:"IARU HF World Championship",month:7,wk:"second",h:24,bands:[0,1,2,3,5,7],ok:t=>true,pts:(t,b)=>t.cont==="EU"?3:5,mult:"zonas ITU y sedes IARU, por banda",mk:"cqdx",
   tip:"Desde EA (zona ITU 37), otro continente da 5 puntos y Europa 3 (1 si es tu misma zona ITU). Las zonas ITU y las sedes cuentan por banda."},
 wae:{modes:["ssb"],n:"WAE DX SSB",month:9,wk:"second",h:48,bands:[1,2,3,5,7],ok:t=>t.cont!=="EU",pts:()=>1,mult:"países fuera de Europa por banda, con 80 m ×4, 40 m ×3 y el resto ×2",mk:"wae",
   tip:"Desde Europa solo valen QSO fuera de Europa: 1 punto cada uno, y cada QTC que te pasen otro punto. Los multiplicadores de 80 m valen ×4 y los de 40 m ×3."},
 cq160:{modes:["ssb"],n:"CQ WW 160 m SSB",month:2,wk:"last",h:48,bands:[0],ok:t=>true,pts:t=>t.dxcc===281?2:t.cont==="EU"?5:10,mult:"estados, provincias de Canadá, países DXCC y WAE",mk:"wve",
   tip:"Solo 160 m. Mismo país 2 puntos, Europa 5, otro continente 10. Todo pasa de noche y alrededor de tu salida y puesta de sol."},
 arrl10:{modes:["ssb","cw"],n:"ARRL 10 m",month:12,wk:"second",h:48,bands:[7],ok:t=>true,pts:()=>2,mult:"estados, provincias de Canadá, estados de México, países DXCC y regiones ITU",mk:"wve",
   tip:"Solo 10 m: cada QSO en fonía da 2 puntos y en CW 4. Con el sol de diciembre, 10 m abre al sur y al oeste a mediodía."},
 cqwwcw:{modes:["cw"],base:"cqww",n:"CQ WW DX CW",month:11,wk:"last",h:48,bands:[0,1,2,3,5,7],ok:t=>true,pts:(t,b)=>t.dxcc===281?0:t.cont==="EU"?1:3,mult:"zonas CQ y países, por banda",mk:"cqdx",
   tip:"Mismas reglas que en fonía: Europa 1 punto, el resto del mundo 3, y zona y país cuentan en cada banda."},
 wpxcw:{modes:["cw"],base:"wpx",n:"CQ WPX CW",month:5,wk:"last",h:48,so:36,bands:[0,1,2,3,5,7],ok:t=>true,pts:(t,b)=>{const lo=b<=2;return t.cont==="EU"?(lo?2:1):(lo?6:3)},mult:"prefijos (una vez en todo el concurso)",mk:"wpx",
   tip:"Otro continente 3 puntos (6 en 40, 80 y 160 m) y Europa 1 (2 en las bandas bajas). Los prefijos cuentan una vez: manda el ritmo."},
 arrlcw:{modes:["cw"],base:"arrl",n:"ARRL International DX CW",month:2,wk:"third",h:48,bands:[0,1,2,3,5,7],ok:t=>t.dxcc===291||t.dxcc===1,pts:()=>3,mult:"estados de EE. UU. y provincias de Canadá, por banda",mk:"wve",
   tip:"Solo cuentan los QSO con EE. UU. y Canadá: 3 puntos cada uno."},
 waecw:{modes:["cw"],base:"wae",n:"WAE DX CW",month:8,wk:"second",h:48,bands:[1,2,3,5,7],ok:t=>t.cont!=="EU",pts:()=>1,mult:"países fuera de Europa por banda, con 80 m ×4, 40 m ×3 y el resto ×2",mk:"wae",
   tip:"Solo valen QSO fuera de Europa, más los QTC que te pasen. 80 m ×4 y 40 m ×3."},
 cq160cw:{modes:["cw"],base:"cq160",n:"CQ WW 160 m CW",month:1,wk:"last",h:48,bands:[0],ok:t=>true,pts:t=>t.dxcc===281?2:t.cont==="EU"?5:10,mult:"estados, provincias de Canadá, países DXCC y WAE",mk:"wve",
   tip:"Solo 160 m: mismo país 2 puntos, Europa 5, otro continente 10."},
 cqwwrtty:{modes:["rtty"],base:"cqww",n:"CQ WW RTTY",month:9,wk:"last",h:48,bands:[1,2,3,5,7],ok:t=>true,pts:t=>t.dxcc===281?1:t.cont==="EU"?2:3,mult:"zonas CQ, países y estados de EE. UU. y provincias de Canadá, por banda",mk:"cqdx",
   tip:"Mismo país 1 punto, Europa 2 y otro continente 3. Zonas, países, estados y provincias cuentan en cada banda."},
 wpxrtty:{modes:["rtty"],base:"wpx",n:"CQ WPX RTTY",month:2,wk:"second",h:48,so:30,bands:[1,2,3,5,7],ok:t=>true,pts:(t,b)=>{const lo=b<=2;return t.cont==="EU"?(lo?2:1):(lo?6:3)},mult:"prefijos (una vez en todo el concurso)",mk:"wpx",
   tip:"Como el WPX de fonía y CW: los prefijos cuentan una vez y las bandas bajas puntúan el doble. Compruébalo en sus bases."},
 rttyru:{modes:["rtty"],base:"arrl10",n:"ARRL RTTY Roundup",month:1,wk:"first",h:30,bands:[1,2,3,5,7],ok:t=>true,pts:()=>1,mult:"estados de EE. UU., provincias de Canadá y países DXCC (una vez)",mk:"wve",
   tip:"1 punto por QSO y cada estado, provincia o país cuenta una sola vez. Son 30 h, de las que un monooperador opera 24."}};
const CT=()=>CONTESTS[$("contest")?$("contest").value:"cqww"]||CONTESTS[CKEYS()[0]]||CONTESTS.cqww;
const CKEYS=()=>Object.keys(CONTESTS).filter(k=>CONTESTS[k].modes.includes(MOD()));
const BI0=()=>st.mode==="contest"?CT().bands:BALL.filter(b=>MD().bands.includes(b));
/* banda elegida arriba: si hay una, toda la plataforma trabaja con ella */
const HB=()=>{const s=document.getElementById("bandsel");const v=s?s.value:"";return v===""?null:+v};
const BI=()=>{const a=BI0(),h=HB();return h!=null&&a.includes(h)?[h]:a};
const cval=(t,b,p)=>p*(t.act||.05)*CT().pts(t,b);
let RS=null;function calcRS(){const s=new Set();(L.dx||[]).concat(L.spots||[]).forEach(o=>{const x=tFor(o);if(x)s.add(x.id)});return s}
const rareOn=t=>t.rare&&(RS||(RS=calcRS())).has(t.id);
const isDXz=t=>t.km>=2500||rareOn(t);
const inMode=t=>st.mode==="contest"?CT().ok(t):isDXz(t);
function cmults(lh,b){const s=new Set();for(const t of TG().filter(inMode)){if(prob(t,lh,b).p>=.3)s.add(CT().mk==="cqdx"?t.cq:t.dxcc)}return s}
function fullWeekends(y,m){const r=[];for(let d=1;d<=31;d++){const dt=new Date(Date.UTC(y,m-1,d));if(dt.getUTCMonth()!==m-1)break;if(dt.getUTCDay()===6){const su=new Date(Date.UTC(y,m-1,d+1));if(su.getUTCMonth()===m-1)r.push(dt)}}return r}
function contestDate(c,y){const w=fullWeekends(y,c.month);return c.wk==="last"?w[w.length-1]:c.wk==="first"?w[0]:c.wk==="third"?w[2]:w[1]}
function nextDate(c){const n=new Date();let d=contestDate(c,n.getUTCFullYear());if(d.getTime()+2*864e5<n.getTime())d=contestDate(c,n.getUTCFullYear()+1);return d}
const MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const fdate=d=>d.getUTCDate()+" de "+MESES[d.getUTCMonth()]+" de "+d.getUTCFullYear();
/* ---------- hora y sol ---------- */
function todayOff(){return memo("tOff",todayOff0)}
function todayOff0(){const n=new Date();const s=n.toLocaleString("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:false});return ((parseInt(s,10)-n.getUTCHours())+24)%24}
const OFF=()=>{const m=useMonth();return m?([4,5,6,7,8,9,10].includes(m)?2:1):todayOff()};
function localNow(){return memo("lNow",localNow0)}
function localNow0(){return parseInt(new Date().toLocaleString("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:false}),10)%24}
const hh=h=>String(((h%24)+24)%24).padStart(2,"0");
const hm=x=>{x=((x%24)+24)%24;const h=Math.floor(x),m=Math.round((x-h)*60);return m===60?hh(h+1)+":00":hh(h)+":"+String(m).padStart(2,"0")};
function dayN(){const m=useMonth();if(m){const d=new Date(Date.UTC(2027,m-1,15));return Math.floor((d-Date.UTC(2027,0,1))/864e5)+1}const n=new Date();return Math.floor((Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate())-Date.UTC(n.getUTCFullYear(),0,1))/864e5)+1}
function subsolarF(lhf){const n=dayN(),ut=((lhf-OFF())%24+24)%24,B=2*Math.PI*(n-81)/364,eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);
  const dec=-23.44*Math.cos(2*Math.PI/365*(n+10));const lon=-15*(ut-12+eot/60);return [((lon+540)%360)-180,dec]}
const subsolar=lh=>subsolarF(lh+.5);
function sunElF(p,lhf){const ss=subsolarF(lhf);const la=p[1]*D2R,d=ss[1]*D2R,H=(p[0]-ss[0])*D2R;return Math.asin(Math.sin(la)*Math.sin(d)+Math.cos(la)*Math.cos(d)*Math.cos(H))/D2R}
const sunEl=(p,lh)=>sunElF(p,lh+.5);
function sunEvents(p){let rise=null,set=null,noon=null,mx=-99,prev=sunElF(p,0);for(let i=1;i<=288;i++){const x=i/12,e=sunElF(p,x);if(prev<-.833&&e>=-.833)rise=x;if(prev>=-.833&&e<-.833)set=x;if(e>mx){mx=e;noon=x}prev=e}return {rise,set,noon,polar:rise===null&&set===null?(mx>0?"día":"noche"):null}}
function greyWins(t){const p=[t.lon,t.lat],w=[];let on=false,s=0;for(let i=0;i<=288;i++){const x=i/12,a=sunElF(TXP,x),b=sunElF(p,x),g=a>-8&&a<3&&b>-8&&b<3;if(g&&!on){on=true;s=x}if(!g&&on){on=false;w.push([s,x])}}if(on)w.push([s,24]);return w}
function lpWins(t){if(!t.l)return [];const r=[];let s=-1;for(let x=0;x<=24;x++){const ok=x<24&&(()=>{const a=best(t,x,true),c=best(t,x,false);return a.p>=.1&&a.p>c.p})();if(ok&&s<0)s=x;if(!ok&&s>=0){r.push([s,x]);s=-1}}return r}
/* ---------- utilidades ---------- */
function best(t,lh,lp){let r={p:0,b:BI()[Math.min(3,BI().length-1)],muf:0,lp:!!lp};for(const b of BI()){const x=prob(t,lh,b,lp);if(x.p>r.p)r={...x,b,lp:!!lp}}return r}
function bestAny(t,lh){const a=best(t,lh,false),c=best(t,lh,true);return c.p>a.p?c:a}
const cls=p=>!(p>=0)?"c0":p<.05?"c0":p<.15?"c1":p<.30?"c2":p<.50?"c3":p<.70?"c4":"c5";
const pct=p=>!(p>=0)?"—":p<.01?"·":Math.round(p*100);
const fk=n=>Math.round(n).toLocaleString("es-ES");
const dxIn=id=>L.dx.filter(d=>{const t=tFor(d);return t&&t.id===id&&dxNew(d)});
function tags(t){let s="";if(stormK(t,false,st.mhour)<.99||auroraDb(t,false,st.mhour,3)<0)s+='<span class="tag st">tormenta</span>';if(siteAdj(t)<0)s+='<span class="tag sl">tapado N/NW</span>';const d=dxIn(t.id);if(d.length)s+=`<span class="tag dx">★ ${d.map(x=>CSF(x.call)).join(", ")}</span>`;const n=entNeed(t);if(n===true)s+='<span class="tag dx">te falta</span>';return s}
function pathPts(t,lp,n){const az=lp?t.laz:t.az,km=lp?t.lkm:t.km;return Array.from({length:n+1},(_,i)=>dest(TXP,az,km*i/n))}
function dayFrac(t,lp,lh){const pts=pathPts(t,lp,14).slice(1,-1);return pts.filter(p=>sunEl(p,lh)>0).length/pts.length}
function foF2est(lh,rawOnly){const t=T("dl");if(!t)return null;const x=rawOnly?interp0(t,ssnFrom(+$("sfi").value),hidx(lh),3,false,null):interp(t,ssnFrom(+$("sfi").value),hidx(lh),3,false,lh);let lo=0,hi=89;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(hopD(m,300)>t.km)lo=m;else hi=m}const si=RE*Math.cos(lo*D2R)/(RE+300);return x.muf*Math.sqrt(1-si*si)}
function skipKm(f,fo){if(!fo)return null;if(f<=fo)return 0;const ci=fo/f,si=Math.sqrt(1-ci*ci),cb=si*(RE+300)/RE;if(cb>=1)return -1;return Math.round(hopD(Math.acos(cb)/D2R,300))}
function skipTxt(b,lh){const sk=skipKm(MHZ[b],foF2est(lh));return sk===null?"":sk===0?"sin zona de silencio":sk<0?"sin salto corto: silencio de más de 4.000 km":"silencio hasta ≈"+fk(sk)+" km"}
function explain(t,b,lh,lp){const r=prob(t,lh,b,lp),f=MHZ[b],m=r.muf,df=dayFrac(t,lp,lh),hp=hopsAt(t,lh,b,lp),out=[];
  if(r.na)return `Ninguna de tus antenas elegidas (${ANTL()}) cubre ${BANDS[b]}.`;
  if(m>0){if(f>m)out.push(`la MUF media del camino es ${m.toFixed(1)} MHz, por debajo de ${f} MHz: la señal atraviesa la capa F y no vuelve; solo abre los días en que la ionosfera está por encima de la media`);
    else if(f>.85*m)out.push(`${f} MHz queda justo por debajo de la MUF (${m.toFixed(1)} MHz): se refleja, pero al límite, con QSB y aperturas cortas`);
    else out.push(`la MUF del camino (${m.toFixed(1)} MHz) está muy por encima de ${f} MHz: se refleja con margen`)}
  if(b<=2)out.push(df>.5?`el ${Math.round(df*100)} % del camino va de día y la capa D absorbe mucho en ${f} MHz`:`el camino va casi todo de noche: sin capa D apenas hay absorción en ${f} MHz`);
  else if(b>=4&&df<.4)out.push(`el camino va casi todo de noche: la foF2 baja y las bandas altas se cierran`);
  else if(df>=.6)out.push(`el camino va de día (${Math.round(df*100)} %): la capa F está cargada y la absorción en ${f} MHz es pequeña`);
  const el=sunEl(TXP,lh);if(el>-6&&el<6)out.push("estás en la línea gris: tu capa D casi ha desaparecido y la F sigue alta");
  if(hp&&r.p>=.02)out.push(`llega en unos ${hp.n} salto${hp.n>1?"s":""} de ${fk(hp.len)} km, saliendo a ${hp.ang}° sobre el horizonte; cada salto resta señal al reflejarse en el suelo`);
  {let [ang]=hopRaw(t,lp&&t.l,hidx(lh),b);if(!ang)ang=6;const pk=antPick(b,ang);if(pk&&!ANT[pk.id].vert&&Math.abs(pk.g)>=1)out.push(`con ${ANT[pk.id].n} a ${$(ANT[pk.id].h).value} m tienes ${pk.g>0?"+":""}${pk.g.toFixed(0)} dB frente a la vertical portable con ese ángulo de salida`);else if(pk&&ANTS().length>1)out.push(`en esta banda la mejor de tus antenas es ${ANT[pk.id].n}`)}
  const ik=ionoK(lh);if(ik!==1&&b>=3)out.push(`${ionoSrc()==="ionosonda"?"la ionosonda de hoy":"lo que se oye hoy en el clúster"} indica una MUF un ${Math.round((ik-1)*100)} % ${ik>1?"más alta":"más baja"} que la media del mes, y ya está aplicado`);
  const sk=stormK(t,lp,lh),ad=auroraDb(t,lp,lh,b);if(sk<.99||ad<0)out.push(`el camino sube hasta ${lp?t.lgm:t.gm}° de latitud geomagnética y con Kp ${kpAt(lh)} hay tormenta: ${sk<.99?"la MUF baja un "+Math.round((1-sk)*100)+" % (fase negativa de la capa F)":""}${sk<.99&&ad<0?" y ":""}${ad<0?"cruza el óvalo auroral: "+Math.round(-ad)+" dB de absorción en la capa D":""}`);
  {let [a]=hopRaw(t,lp&&t.l,hidx(lh),b);const hd=horizDb(a||6,b);if(hd<-.5)out.push(`sale a ${a}° y tu horizonte está a ${$("hz").value}°: pierde ${Math.round(-hd)} dB por difracción en el obstáculo`)}
  {const n=dxNoisePen(t,b,lh);if(Math.abs(n)>.5)out.push(`el ruido en la estación DX resta ${n>0?"":"o suma "}${Math.abs(n).toFixed(0)} dB (ITU-R P.372)`)}
  if(lp){const ds=dayFrac(t,false,lh);out.push(`va por el paso largo ${df>ds+.2?"porque por ahí el camino va iluminado y por el corto no":"porque por el corto la MUF o la absorción lo impiden"}`)}
  const s=out.join("; ");return s.charAt(0).toUpperCase()+s.slice(1)+"."}
function spotAge(s){const ref=[L.spotsChecked,L.spotsUTC,L.updatedUTC].filter(Boolean).sort().pop()||"";const d=ref.slice(0,10);let t=Date.parse(d+"T"+s.t+":00Z");if(isNaN(t))return null;/* un spot de las 23:5x leído pasada la medianoche es del día anterior */const r=Date.parse(ref);if(r&&t>r+10*60000)t-=86400000;return Math.max(0,Math.round((Date.now()-t)/60000))}
const ageTxt=a=>a==null?"":a<1?"ahora":a<90?`hace ${a} min`:a<1440?`hace ${Math.round(a/60)} h`:"hace más de un día";
/* «cercana» = la estación anunciada está en EA, CT, C3, ZB o CN (con sus islas); si no, se trata como DX o como indicador */
const NEARCC=new Set(["ES","PT","AD","GI","MA"]);
function spotKind(s){if(s.kind!=="near")return s.kind;const e=callEnt(s.call);if(e&&NEARCC.has(e.cc))return "near";return s.dx&&distJS(TXP,s.dx)>2500?"dx":"ind"}
function spotEval(s,lh){const K=spotKind(s);const far=K==="ind"&&s.from&&s.from[0]?s.from[0]:s.dx;const t=K==="ind"?nearestT(far,0):tFor(s);if(!t)return null;const a=prob(t,lh,s.band,false),c=prob(t,lh,s.band,true),lp=c.p>a.p&&c.p>=.05;const p=[far[0],far[1]],az=Math.round(brgJS(TXP,p)),km=Math.round(distJS(TXP,p));
  return {t,lp,p:lp?c.p:a.p,pSP:a.p,pLP:c.p,az,km,laz:(az+180)%360,lkm:40030-km}}
const MBS=()=>{const s=(st.mbs||[]).filter(b=>BALL.includes(b));return s.length?s:null};
function bestIn(t,lh,lp,bs){let r={p:0,b:bs[0],muf:0,lp:!!lp};for(const b of bs){const x=prob(t,lh,b,lp);if(x.p>r.p)r={...x,b,lp:!!lp}}return r}
function mapProb(t,lh){const sel=MBS();const one=lp=>sel?bestIn(t,lh,lp,sel):best(t,lh,lp);
  if(st.path==="sp")return one(false);if(st.path==="lp")return one(true);const a=one(false),c=one(true);return c.p>a.p?c:a}
/* modos del clúster: el de arriba manda al empezar; en el mapa y en DX se pueden añadir más */
const CMS=()=>{if(!st.cms||st.cmsBase!==MOD()){st.cms=[MOD()];st.cmsBase=MOD()}return st.cms};
const CMSTXT=()=>CMS().map(k=>MODES[k].s).join(", ");
const CMBANDS=()=>{const h=HB();if(h!=null)return new Set([h]);const s=new Set(st.mode==="contest"?CT().bands:[]);CMS().forEach(k=>(MODES[k].bands||[]).forEach(b=>s.add(b)));return s};
let SPOTS=()=>{const ms=CMS(),bs=CMBANDS();return (L.spots||[]).filter(s=>bs.has(s.band)&&ms.includes(spotMode(s)))};

/* ---------- balizas NCDXF/IARU ---------- */
const BCN=[["4U1UN","Nueva York (ONU)",-73.97,40.75],["VE8AT","Eureka, Canadá",-85.9,79.99],["W6WX","California",-121.9,37.15],["KH6RS","Maui, Hawái",-156.0,20.77],["ZL6B","Masterton, N. Zelanda",175.6,-41.06],["VK6RBP","Perth, Australia",116.0,-32.1],["JA2IGY","Mie, Japón",136.8,34.45],["RR9O","Novosibirsk",82.9,54.98],["VR2B","Hong Kong",114.17,22.28],["4S7B","Colombo, Sri Lanka",79.9,6.9],["ZS6DN","Pretoria, Sudáfrica",28.3,-25.9],["5Z4B","Kikuyu, Kenia",36.67,-1.25],["4X6TU","Tel Aviv, Israel",34.8,32.1],["OH2B","Lohja, Finlandia",24.4,60.3],["CS3B","Madeira",-17.0,32.8],["LU4AA","Buenos Aires",-58.4,-34.6],["OA4B","Lima, Perú",-76.9,-12.1],["YV5B","Caracas, Venezuela",-67.8,9.1]];
const BFQ=[["14.100",3],["18.110",4],["21.150",5],["24.930",6],["28.200",7]];
function bcnNow(){const n=new Date(),s=(n.getUTCMinutes()*60+n.getUTCSeconds())%180,slot=Math.floor(s/10);return {slot,left:10-(s%10)}}
/* ---------- mapa ---------- */
let GEO=null,PR=null;
/* ---------- zoom del mapa ---------- */
let ZM=null,ZT=typeof d3!=="undefined"?d3.zoomIdentity:{k:1},ZROOT=null,ZSVG=null;
function zoomMarks(k){if(!ZROOT)return;const s=Math.pow(k,.75);
  ZROOT.selectAll("circle").each(function(){if(this.dataset.r===undefined)this.dataset.r=this.getAttribute("r");this.setAttribute("r",this.dataset.r/s)});
  ZROOT.selectAll("text").each(function(){const x=this.dataset.ax!==undefined?+this.dataset.ax:+this.getAttribute("x"),y=this.dataset.ay!==undefined?+this.dataset.ay:+this.getAttribute("y");this.setAttribute("transform",k>1.01?`translate(${x},${y}) scale(${1/s}) translate(${-x},${-y})`:"")});
  ZROOT.selectAll("rect").each(function(){const x=+this.getAttribute("x")+5,y=+this.getAttribute("y")+5;const b=this.dataset.t===undefined?(this.dataset.t=this.getAttribute("transform")||""):this.dataset.t;this.setAttribute("transform",(k>1.01?`translate(${x},${y}) scale(${1/s}) translate(${-x},${-y}) `:"")+b)})}
/* ---------- nombres del mapa: países, capitales y entidades DXCC, según el zoom y sin solaparse ---------- */
let GL=null,GLN=[],GLraf=0,GLG=null,BASEC=null,GLC=null;const svgPx=(el,W)=>{let m=null;try{m=el.getScreenCTM()}catch(e){}return Math.max(.3,m&&m.a?m.a:(el.clientWidth||W)/W)};const GLg=()=>GL||(GL=(()=>{try{return JSON.parse(document.getElementById("geolbl").textContent)}catch(e){return {c:[],k:[],e:[]}}})());
const GLIMP={US:0,RU:1,CN:2,BR:3,IN:4,AU:5,CA:6,AR:7,MX:8,SA:9,IR:10,ZA:11,EG:0,ES:1,FR:2,DE:3,GB:4,IT:5,JP:6,TR:7,NG:8,ID:9};function drawGeoLabels(Z,pr,W){GLN=[];GLG=null;if(!st.ly.labels)return;const svgEl=$("map");const px=svgPx(svgEl,W);
  GLG=Z.append("g").attr("class","glg"+(st.mapOn?" dim":"")).style("stroke-width",(2/px)+"px").node();
  const ck=W+"|"+TXP.join(",")+"|"+px.toFixed(3);
  if(!GLC||GLC.k!==ck){const G=GLg(),L=[];const cn={},cp={};G.c.forEach(c=>{cn[c[4]]=c[0];cp[c[4]]=[c[1],c[2]]});
    const add=(txt,ll,cls,pri,minK,fs,dot,up)=>{const q=pr(ll);if(!q)return;L.push({txt,cls,x:q[0],y:q[1],pri,minK,fs:fs/px,r:dot?dot/px:0,off:dot?4/px:0,w:txt.length*(up?.66:.56)*fs/px+(dot?4/px:0),h:fs*1.15/px,dot:!!dot})};
    G.c.forEach(c=>add(c[0].toUpperCase(),[c[1],c[2]],"glc t"+c[3],c[3]*10+(GLIMP[c[4]]!=null?GLIMP[c[4]]*.1-3:0),[0,1.3,2.2,3.2][c[3]],[9,8.3,7.8,7.5][c[3]],0,true));
    G.k.forEach(k=>add(k[0],[k[1],k[2]],"glk",k[3]*10+6,k[3]===1?2.4:3.4,7.8,1.4));
    G.e.forEach(e=>add(e[0]+" "+e[1],[e[2],e[3]],"gle",33,3.1,7.6,1.4));
    L.sort((a,b)=>a.pri-b.pri);GLC={k:ck,L}}
  GLN=GLC.L.map(o=>({...o,t:null,d:null}));declutter()}
function glNode(n,k){const NS="http://www.w3.org/2000/svg";const s=Math.pow(k,.75);
  if(n.dot){const d=document.createElementNS(NS,"circle");d.setAttribute("class","gld "+n.cls);d.setAttribute("cx",n.x);d.setAttribute("cy",n.y);d.setAttribute("r",n.r/s);d.dataset.r=n.r;GLG.appendChild(d);n.d=d}
  const t=document.createElementNS(NS,"text");t.setAttribute("class","gl "+n.cls);t.dataset.ax=n.x;t.dataset.ay=n.y;t.setAttribute("x",n.x+n.off);t.setAttribute("y",n.y+(n.dot?n.fs*.35:0));t.setAttribute("text-anchor",n.dot?"start":"middle");t.setAttribute("font-size",n.fs);t.textContent=n.txt;
  if(k>1.01)t.setAttribute("transform",`translate(${n.x},${n.y}) scale(${1/s}) translate(${-n.x},${-n.y})`);GLG.appendChild(t);n.t=t}
function declutter(){if(!GLN.length||!GLG)return;const svgEl=$("map"),vb=svgEl.viewBox.baseVal,W=vb.width||900,H=vb.height||900;const px=svgPx(svgEl,W);
  const k=ZT.k||1,f=k/Math.pow(k,.75),ek=k*px,C=60,grid=new Map();
  const hit=(b)=>{for(let gx=Math.floor(b[0]/C);gx<=Math.floor(b[2]/C);gx++)for(let gy=Math.floor(b[1]/C);gy<=Math.floor(b[3]/C);gy++){const l=grid.get(gx+","+gy);if(l)for(const o of l)if(b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1])return true}return false};
  const put=(b)=>{for(let gx=Math.floor(b[0]/C);gx<=Math.floor(b[2]/C);gx++)for(let gy=Math.floor(b[1]/C);gy<=Math.floor(b[3]/C);gy++){const key=gx+","+gy;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(b)}};
  if(PR){const q=PR(TXP);if(q){const X=ZT.applyX(q[0]),Y=ZT.applyY(q[1]),r=40*f/px;put([X-r*.4,Y-r*.7,X+r*2.2,Y+r*.5])}}
  for(const n of GLN){let on=ek>=n.minK;if(on){const X=ZT.applyX(n.x),Y=ZT.applyY(n.y),w=n.w*f,h=n.h*f;
      if(X<-w||X>W+w||Y<0||Y>H)on=false;else{const x0=n.dot?X-3*f/px:X-w/2,b=[x0-6,Y-h*1.1,x0+w+6,Y+h*.6];if(hit(b))on=false;else put(b)}}
    if(on&&!n.t&&GLG)glNode(n,k);if(n.t){n.t.style.display=on?"":"none";if(n.d)n.d.style.display=on?"":"none"}}}
function schedDeclutter(){if(GLraf)return;GLraf=requestAnimationFrame(()=>{GLraf=0;declutter()})}
/* ---------- estadísticas de lo que muestra el mapa ---------- */
function bandP(t,lh,b){const a=st.path==="lp"?0:(prob(t,lh,b,false).p||0),c=(st.path==="sp"||!t.l)?0:(prob(t,lh,b,true).p||0);return Math.max(a,c)}
let MSD=[];
function updBcnMarks(){const {slot}=bcnNow();document.querySelectorAll("#map g.bcnm").forEach(g=>{const i=+g.dataset.bi,b=BCN[i];if(!b)return;const act=BFQ.filter(([f,bi],k)=>(slot-k+18)%18===i);
  const r=g.querySelector("rect"),t=g.querySelector("text");if(r)r.setAttribute("fill",act.length?BC[act[0][1]]:"#9cc4ff");if(t)t.textContent=b[0]+(act.length?" "+act[0][0]:"")});renderMStats(MSD,st.mhour)}
function renderMStats(data,lh){MSD=data;const el=$("mstats");if(!el)return;if(!st.mapOn||!(st.ly.voa||st.ly.spots||st.ly.bcn)){el.hidden=true;el.innerHTML="";return}let h="";
  if(st.ly.voa){const bs=(MBS()||BI()).slice();const rows=bs.map(b=>{let o=0,p=0,bt=null,bp=0;for(const d of data){const q=bandP(d.t,lh,b);if(q>=.5)o++;else if(q>=.15)p++;if(q>bp){bp=q;bt=d.t}}return {b,o,p,bt,bp}});
    const best=rows.slice().sort((a,b)=>b.o-a.o||b.p-a.p)[0];const top=data.slice().sort((a,b)=>b.p-a.p).slice(0,5).filter(d=>d.p>=.05);
    h+=`<div class="mst"><div class="msth">Predicción VOACAP · ${hh(lh)}:00 · ${esc(MD().s)} · ${data.length} destinos</div>`+
     `<table><tr><th>Banda</th><th>Abiertos<br><span>≥ 50 %</span></th><th>Posibles<br><span>15–50 %</span></th><th>Mejor destino</th></tr>`+
     rows.map(r=>`<tr${best&&r.b===best.b&&r.o?' class="bst"':""}><td><i style="background:${BC[r.b]}"></i>${BANDS[r.b]}</td><td>${r.o}</td><td>${r.p}</td><td>${r.bt&&r.bp>=.15?esc(r.bt.name.split(" (")[0])+" · "+pct(r.bp)+" %":"—"}</td></tr>`).join("")+`</table>`+
     (top.length?`<p class="note">Lo más probable ahora: ${top.map(d=>`<b>${esc(d.t.name.split(" (")[0])}</b> ${pct(d.p)} % (${BANDS[d.b]}${d.lp?", largo":""})`).join(" · ")}</p>`:`<p class="note">Nada abierto con estas opciones a esta hora.</p>`)+`</div>`}
  if(st.ly.spots){const MS=MBS(),sp=SPOTS().filter(s=>!MS||MS.includes(s.band));const bm={},bb={};sp.forEach(s=>{const m=spotMode(s);bm[m]=(bm[m]||0)+1;bb[s.band]=(bb[s.band]||0)+1});
    h+=`<div class="mst"><div class="msth">Clúster · ${esc(CMSTXT())}</div><p class="note">${sp.length?`<b>${sp.length}</b> spots en el mapa · `+Object.entries(bm).map(([m,n])=>`${esc(MODES[m]?MODES[m].s:m)} ${n}`).join(" · ")+"<br>"+Object.keys(bb).map(Number).sort((a,b)=>BALL.indexOf(a)-BALL.indexOf(b)).map(b=>`<span style="color:${BC[b]}">●</span> ${BANDS[b]} ${bb[b]}`).join(" · "):"Sin spots útiles de estos modos y bandas ahora mismo."}</p></div>`}
  if(st.ly.bcn){const {slot,left}=bcnNow();const lhN=localNow();h+=`<div class="mst"><div class="msth">Balizas NCDXF/IARU · ahora (cambian en ${left} s)</div><p class="note">`+BFQ.map(([f,bi],k)=>{const b=BCN[(slot-k+18)%18],t=nearestT([b[2],b[3]],0),q=t?prob(t,lhN,bi,false):{p:0};return `${f}: <b>${b[0]}</b> ${q.na?"—":pct(q.p)+" %"}`}).join(" · ")+`</p></div>`}
  el.innerHTML=h;el.hidden=!h}
function zoomBy(f){if(!ZM||!ZSVG)return;const t=ZSVG.transition().duration(250);if(!f)t.call(ZM.transform,d3.zoomIdentity);else t.call(ZM.scaleBy,f)}
function drawMap(){window.__zmk=null;setTimeout(()=>{try{foldSums()}catch(e){}},0);
  const lh=st.mhour;$("mhv").textContent=hh(lh)+":00 · "+hh(utOf(lh))+" UTC";
  const svgEl=$("map");if(!svgEl)return;
  if(typeof d3==="undefined"||typeof topojson==="undefined"){svgEl.outerHTML='<div class="empty">No se han podido cargar las librerías del mapa. Recarga la página.</div>';return}
  if(!GEO){const w=JSON.parse(document.getElementById('world').textContent);const land=topojson.feature(w,w.objects.countries);/* anillos invertidos al simplificar (cruzan el meridiano 180): se les da la vuelta para que no rellenen todo el globo */land.features.forEach(f=>{const g=f.geometry;if(!g)return;const P=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];P.forEach(p=>{if(d3.geoArea({type:'Polygon',coordinates:p})>2*Math.PI)p.forEach(r=>r.reverse())})});GEO={land,borders:topojson.mesh(w,w.objects.countries,(a,b)=>a!==b)}}
  const FSM=$("mapcard").classList.contains("fsm");let W=900,H=900;if(FSM){const r=svgEl.parentNode.getBoundingClientRect();const as=r.width/Math.max(1,r.height);if(as>1)W=Math.round(900*as);else H=Math.round(900/as)}const pr=d3.geoAzimuthalEquidistant().rotate([-TXP[0],-TXP[1]]).fitExtent([[8,8],[W-8,H-8]],{type:"Sphere"}).precision(.4/Math.max(1,Math.min((typeof ZT!=="undefined"&&ZT&&ZT.k)||1,12))),path=d3.geoPath(pr);PR=pr;
  const svg=d3.select(svgEl).attr("viewBox",`0 0 ${W} ${H}`);svg.selectAll("*").remove();
  const defs=svg.append("defs");const Z=svg.append("g").attr("class","zroot");const gl=defs.append("filter").attr("id","glow").attr("x","-50%").attr("y","-50%").attr("width","200%").attr("height","200%");
  gl.append("feGaussianBlur").attr("stdDeviation",3).attr("result","b");const m=gl.append("feMerge");m.append("feMergeNode").attr("in","b");m.append("feMergeNode").attr("in","SourceGraphic");
  {const bk=W+"|"+H+"|"+TXP.join(",");if(!BASEC||BASEC.k!==bk)BASEC={k:bk,o:path({type:"Sphere"}),g:path(d3.geoGraticule10()),l:path(GEO.land),b:path(GEO.borders)};
  Z.append("path").attr("class","ocean").attr("d",BASEC.o);Z.append("path").attr("class","grat").attr("d",BASEC.g);Z.append("path").attr("class","land").attr("d",BASEC.l);Z.append("path").attr("class","bord").attr("d",BASEC.b)}
  {const cx0=W/2,cy0=H/2,r=Math.min(W,H)/2-8,ag=Z.append("g").attr("class","azr");
    for(let az=0;az<360;az+=10){const sa=Math.sin(az*D2R),ca=Math.cos(az*D2R),l=az%30===0?12:6;
      ag.append("line").attr("class","azt").attr("x1",cx0+r*sa).attr("y1",cy0-r*ca).attr("x2",cx0+(r-l)*sa).attr("y2",cy0-(r-l)*ca);
      if(az%30===0){const card={0:"N",90:"E",180:"S",270:"O"}[az];ag.append("text").attr("class","azl"+(card?" azc":"")).attr("x",cx0+(r-26)*sa).attr("y",cy0-(r-26)*ca+4).attr("text-anchor","middle").text(card?`${az}° ${card}`:`${az}°`)}}}
  const ss=subsolar(lh),anti=[ss[0]>0?ss[0]-180:ss[0]+180,-ss[1]];
  if(st.ly.night)Z.append("path").attr("class","night").attr("d",path(d3.geoCircle().center(anti).radius(90)()));
  if(st.ly.night)Z.append("path").attr("class","grey").attr("d",path(d3.geoCircle().center(anti).radius(90)()));
  if(st.ly.night)Z.append("path").attr("class","grey2").attr("d",path(d3.geoCircle().center(anti).radius(90)()));
  const kp=kpAt(lh);
  if(kp>=4){const g=kp>=6?50:kp===5?53:55;[90,-90].forEach(pl=>Z.append("path").attr("class","aur").attr("d",path(d3.geoCircle().center(gm2geo(pl,0)).radius(90-g)())));
    const lp=pr(gm2geo(g+4,-30));if(lp)Z.append("text").attr("class","aurl").attr("x",lp[0]).attr("y",lp[1]).text("óvalo auroral · Kp "+kp)}
  [2500,5000,10000,15000].forEach(km=>{Z.append("path").attr("class","ring").attr("d",path(d3.geoCircle().center(TXP).radius(km/111.2)()));
    const p=pr(dest(TXP,200,km));if(p)Z.append("text").attr("class","ringl").attr("x",p[0]+3).attr("y",p[1]).text(km.toLocaleString("es-ES")+" km")});
  if(st.mband>=0&&st.mapOn&&st.ly.voa){const sk=skipKm(MHZ[st.mband],foF2est(lh));const c0=pr(TXP);
    if(sk>0){Z.append("path").attr("class","skip").attr("d",path(d3.geoCircle().center(TXP).radius(sk/111.2)()));const p=pr(dest(TXP,150,sk));if(p)Z.append("text").attr("class","skipl").attr("x",p[0]+4).attr("y",p[1]+12).text(`Zona de silencio ${BANDS[st.mband]}: ≈${fk(sk)} km`)}
    else Z.append("text").attr("class","skipl").attr("x",c0[0]+12).attr("y",c0[1]+26).text(sk===0?`${BANDS[st.mband]}: sin zona de silencio`:`${BANDS[st.mband]}: sin salto corto (silencio > 4.000 km)`)}
  const vsel=MBS()&&MBS().some(VUHF);const data=st.mapOn&&(st.ly.voa||st.ly.arcs||st.ly.hops)?TG().filter(t=>inMode(t)||(vsel&&st.mode!=="contest")).map(t=>({t,...mapProb(t,lh),xy:pr([t.lon,t.lat])})).filter(d=>d.xy):[];
  const NN={pocos:15,normal:40,todos:999}[st.dens]||40;const RANK=new Map(data.slice().sort((a,b)=>b.p-a.p).map((d,i)=>[d.t.id,i]));const shown=d=>st.dens==="todos"||RANK.get(d.t.id)<NN||st.zone===d.t.id;
  drawGeoLabels(Z,pr,W);const arcs=Z.append("g"),hops=Z.append("g");
  if(st.ly.arcs||st.ly.hops)data.filter(d=>d.p>=.15&&(!d.lp||d.p>=.25)).sort((a,b)=>b.p-a.p).slice(0,Math.min(70,NN)).reverse().forEach(d=>{
    const coords=d.lp?pathPts(d.t,true,60):[TXP,[d.t.lon,d.t.lat]];
    if(st.ly.arcs)arcs.append("path").attr("class",d.lp?"lparc":"arc").attr("stroke",BC[d.b]).attr("stroke-width",.6+d.p*2.2).attr("stroke-opacity",.25+d.p*.5)
      .attr("d",path({type:"LineString",coordinates:coords}));
    if(st.ly.hops&&d.p>=.4){const hp=hopsAt(d.t,lh,d.b,d.lp);if(hp&&hp.n>1&&hp.n<12)for(let k=1;k<hp.n;k++){const q=pr(dest(TXP,d.lp?d.t.laz:d.t.az,(d.lp?d.t.lkm:d.t.km)*k/hp.n));if(q)hops.append("circle").attr("class","hop").attr("cx",q[0]).attr("cy",q[1]).attr("r",2.4)}}});
  const g=Z.append("g");const top=new Set(data.slice().sort((a,b)=>b.p-a.p).slice(0,30).map(d=>d.t.id));
  if(st.ly.voa)data.filter(shown).sort((a,b)=>a.p-b.p).forEach(d=>{const on=d.p>=.05,r=on?4+d.p*6:3;const t=d.t,need=entNeed(t);
    const c=g.append("circle").attr("class","mk").attr("cx",d.xy[0]).attr("cy",d.xy[1]).attr("r",r).attr("fill",on?BC[d.b]:"#2a3a50")
      .attr("fill-opacity",on?.35+d.p*.65:.85).attr("stroke",st.zone===t.id?"#fff":need===true?"#ffd76a":on?BC[d.b]:"#3b5070").attr("stroke-width",st.zone===t.id?3:need===true?2:1.2).attr("stroke-dasharray",d.lp&&on?"3 2":null)
      .attr("filter",d.p>=.6&&RANK.get(d.t.id)<3?"url(#glow)":null).attr("tabindex",0).attr("role","button").attr("aria-label",`${t.name}: ${BANDS[d.b]} ${Math.round(d.p*100)} % ${d.lp?"paso largo":"paso corto"}`);
    c.append("title").text(`${t.name} · ${Math.round(d.p*100)} % en ${BANDS[d.b]} (${d.lp?"largo":"corto"}) · toca para ver más`);
    const sel=()=>{st.zone=t.id;store.set("pz",st.zone);openPop({k:"t",id:t.id});drawMap()};c.on("click",sel).on("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();sel()}});
    if(d.p>=.5&&r>=7)g.append("text").attr("class","ml").attr("x",d.xy[0]).attr("y",d.xy[1]).text(pct(d.p));
  });
  if(st.mode==="dx"&&st.ly.dxp&&st.mapOn)L.dx.forEach((d,i)=>{if(!dxNew(d))return;const q=pr([d.lon,d.lat]);if(!q)return;const gg=g.append("g").attr("class","clk").attr("tabindex",0).attr("role","button").attr("aria-label","DXpedición "+d.call);
    gg.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",11).attr("fill","transparent");gg.append("text").attr("class","star").attr("x",q[0]).attr("y",q[1]+5).attr("text-anchor","middle").text("★");gg.append("text").attr("class","dxx").attr("data-ax",q[0]).attr("data-ay",q[1]).attr("x",q[0]+8).attr("y",q[1]+4).text(d.call.split(" ")[0]);
    const o=()=>openPop({k:"d",i});gg.on("click",o).on("keydown",e=>{if(e.key==="Enter"){e.preventDefault();o()}})});
  if(st.ly.bcn&&st.mapOn){const {slot}=bcnNow();BCN.forEach((b,i)=>{const q=pr([b[2],b[3]]);if(!q)return;const act=BFQ.filter(([f,bi],k)=>(slot-k+18)%18===i);
    const gg=g.append("g").attr("class","bcnm").attr("data-bi",i).attr("tabindex",0).attr("role","button").attr("aria-label","Baliza "+b[0]);gg.append("rect").attr("x",q[0]-5).attr("y",q[1]-5).attr("width",10).attr("height",10).attr("rx",2).attr("fill",act.length?BC[act[0][1]]:"#9cc4ff").attr("stroke","#fff");
    gg.append("text").attr("class","spotl").attr("data-ax",q[0]).attr("data-ay",q[1]).attr("x",q[0]+8).attr("y",q[1]+12).text(""+b[0]+(act.length?" "+act[0][0]:""));const o=()=>openPop({k:"b",i});gg.on("click",o).on("keydown",e=>{if(e.key==="Enter"){e.preventDefault();o()}})})}
  if(st.ly.spots&&st.mapOn){const sg=Z.append("g"),MS=MBS();SPOTS().forEach((s,i)=>{if(MS&&!MS.includes(s.band))return;(s.from||[]).forEach(fr=>sg.append("path").attr("class","spline").attr("stroke",BC[s.band]).attr("d",path({type:"LineString",coordinates:[fr,s.dx]})));
      (s.from||[]).forEach(fr=>{const q=pr(fr);if(q)sg.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",3).attr("fill","#fff").attr("stroke",BC[s.band])});
      const q=pr(s.dx);if(!q)return;const gg=sg.append("g").attr("class","clk").attr("tabindex",0).attr("role","button").attr("aria-label","Spot "+s.call+" "+s.f);
      gg.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",12).attr("fill","transparent");
      gg.append("rect").attr("x",q[0]-5).attr("y",q[1]-5).attr("width",10).attr("height",10).attr("transform",`rotate(45 ${q[0]} ${q[1]})`).attr("fill",BC[s.band]).attr("stroke","#fff").attr("stroke-width",1.5);
      gg.append("text").attr("class","spotl").attr("data-ax",q[0]).attr("data-ay",q[1]).attr("x",q[0]+9).attr("y",q[1]-7).text(`◆ ${s.call} ${s.f}`);const o=()=>openPop({k:"s",i});gg.on("click",o).on("keydown",e=>{if(e.key==="Enter"){e.preventDefault();o()}})})}
  const c0=pr(TXP);g.append("circle").attr("class","tx").attr("cx",c0[0]).attr("cy",c0[1]).attr("r",7).attr("filter","url(#glow)");
  g.append("text").attr("class","txl").attr("data-ax",c0[0]).attr("data-ay",c0[1]).attr("x",c0[0]+10).attr("y",c0[1]-9).text("EA5RKB");
  {const h=$("mhint");if(h)h.hidden=!!(st.mapOn&&(st.ly.voa||st.ly.arcs||st.ly.hops||st.ly.spots||st.ly.bcn||st.ly.dxp))}renderMStats(data,lh);document.querySelectorAll("[data-sw]").forEach(c=>c.setAttribute("aria-pressed",!!(st.mapOn&&st.ly[c.dataset.sw])));{const o=$("mopts");if(o)o.classList.toggle("off",!(st.mapOn&&(st.ly.voa||st.ly.arcs||st.ly.hops)))}
  ZROOT=Z;ZSVG=svg;
  if(!ZM){ZM=d3.zoom().scaleExtent([1,41]).translateExtent([[0,0],[W,H]])
    .filter(ev=>ev.type==="wheel"?(ev.deltaY<0||ZT.k>1.01):ev.type==="touchstart"?(ev.touches.length>1||ZT.k>1.01):ev.type==="dblclick"?true:!ev.button)
    .on("zoom",ev=>{ZT=ev.transform;if(ZROOT){ZROOT.attr("transform",ZT);if(window.__zmk!==ZT.k){window.__zmk=ZT.k;zoomMarks(ZT.k)}schedDeclutter()}svgEl.style.touchAction=ZT.k>1.01?"none":"pan-y"})}
  ZM.translateExtent([[0,0],[W,H]]);svg.call(ZM).on("dblclick.zoom",null);svg.call(ZM.transform,ZT);declutter();svgEl.style.touchAction=ZT.k>1.01?"none":"pan-y";
  if(st.pop)renderPop();
}
function renderBandSeg(){
  st.mbs=(st.mbs||[]).filter(b=>BALL.includes(b));st.mband=st.mbs.length===1?st.mbs[0]:-1;
  const items=[["-1","Todas (la mejor)"],...BALL.map(i=>[String(i),BANDS[i]])];
  $("bandseg").innerHTML=`<span class="segl">Bandas</span>`+items.map(([v,n])=>`<button data-mb="${v}"${v!=="-1"&&!BI0().includes(+v)?` class="clz" title="${MODES[MOD()].s} no se usa en esta banda según el plan de bandas: la previsión es orientativa"`:""} aria-pressed="${st.mapOn&&(v==="-1"?!st.mbs.length:st.mbs.includes(+v))}">${v==="-1"?"":`<i style="background:${BC[+v]}"></i>`}${n}</button>`).join("");
  document.querySelectorAll('[data-mb]').forEach(b=>b.onclick=()=>{const v=+b.dataset.mb;if(v<0)st.mbs=[];else st.mbs=st.mbs.includes(v)?st.mbs.filter(x=>x!==v):[...st.mbs,v];store.set("mbs",JSON.stringify(st.mbs));renderBandSeg();drawMap()});
  renderModeChips($("mapmodes"),true);renderModeChips($("dxmodes"),false);
  document.querySelectorAll('[data-pa]').forEach(b=>b.setAttribute("aria-pressed",b.dataset.pa===st.path));
  document.querySelectorAll('[data-ly]').forEach(b=>b.setAttribute("aria-pressed",!!(st.ly[b.dataset.ly]&&(b.dataset.ly!=="dxp"||st.mapOn))));document.querySelectorAll('[data-dn]').forEach(b=>b.setAttribute("aria-pressed",b.dataset.dn===st.dens));
  $("mlegend").innerHTML=BI0().map(i=>`<span><i style="background:${BC[i]}"></i>${BANDS[i]}</span>`).join("")+
   `<span>Toca un punto, ★, ◆ o ■ para más datos</span><span>— corto · - - largo</span><span>● blancos = saltos</span><span style="color:#b9a3ff">▮ línea gris</span><span>▮ noche</span><span style="color:#ff8a80">▮ óvalo auroral (Kp ≥ 4)</span>`;
}
function renderModeChips(ms,withPred){if(!ms)return;const cur=MOD(),sel=CMS();const grp={};Object.entries(MODES).forEach(([k,o])=>{(grp[o.g]=grp[o.g]||[]).push(k)});
  ms.innerHTML=`<span class="segl">Modos</span>`+Object.entries(grp).map(([g,ks])=>`<span class="mgrp"><span class="mgl">${g==="Fonía"?"Voz":g}</span>${ks.map(k=>`<button data-mm="${k}" aria-pressed="${sel.includes(k)}"${k===cur?' class="pm" title="Modo de la predicción"':""}>${MODES[k].s}</button>`).join("")}</span>`).join("")+
   (withPred?`<span class="mpred">${sel.length>1?`Predicción VOACAP para <select id="mpm" aria-label="Modo de la predicción">${sel.map(k=>`<option value="${k}"${k===cur?" selected":""}>${MODES[k].s}</option>`).join("")}</select> · clúster con los ${sel.length} modos`:`Predicción y clúster en ${MODES[cur].s}. Toca más modos para añadirlos al clúster.`}</span>`:`<span class="mpred"></span>`);
  ms.querySelectorAll("[data-mm]").forEach(b=>b.onclick=()=>toggleCM(b.dataset.mm));
  const pm=ms.querySelector("#mpm");if(pm)pm.onchange=()=>setPredMode(pm.value)}
function setPredMode(k){if(k===MOD())return;st.cmsBase=k;const s=$("modesel");s.value=k;s.dispatchEvent(new Event("change"))}
function toggleCM(k){let s=CMS().slice();if(s.includes(k)){if(s.length===1)return;s=s.filter(x=>x!==k)}else s.push(k);st.cms=s;if(st.page==="mapa")st.mapOn=true;
  if(!s.includes(MOD())){setPredMode(s[0]);return}renderAlBar();renderBandSeg();renderSide();if(st.page==="mapa")drawMap()}
/* ---------- ventana emergente del mapa ---------- */
function openPop(p){st.pop=p;if(!st.mapOn){st.mapOn=true;renderBandSeg();if(st.page==="mapa")drawMap()}renderPop()}
function closePop(){st.pop=null;$("mpop").hidden=true}
function bandRows(t,lh){return `<table><tr><th>Banda</th><th>Te oyen (corto)</th><th>Largo</th><th>Le oyes</th><th>Saltos (corto)</th></tr>`+BI0().slice().reverse().map(b=>{const a=prob(t,lh,b,false),c=prob(t,lh,b,true),hr=Math.max(prob(t,lh,b,false,"rx").p,t.l?prob(t,lh,b,true,"rx").p:0),hp=hopsAt(t,lh,b,false);const nb=bandNeed(t,b);
  return `<tr><td><span style="color:${BC[b]}">●</span> ${BANDS[b]}${nb===true?' <span class="need">nueva</span>':nb===false?' <span class="have">✔</span>':""}</td><td class="${cls(a.p)}">${a.na?"—":pct(a.p)}</td><td class="${cls(c.p)}">${t.l&&!c.na?pct(c.p):"—"}</td><td class="${cls(hr)}">${a.na?"—":pct(hr)}</td><td>${hp?hp.n+" × "+fk(hp.len)+" km · "+hp.ang+"°":"—"}</td></tr>`}).join("")+"</table>"}
function tBlock(t,lh){const se=sunEvents([t.lon,t.lat]),gw=greyWins(t),lw=lpWins(t),bh=(()=>{let r={p:0,h:0,b:0,lp:false};for(let x=0;x<24;x++){const q=bestAny(t,x);if(q.p>r.p)r={...q,h:x}}return r})(),n=bestAny(t,lh);
  return `<p class="note" style="margin:0"><b style="color:#fff">Corto:</b> ${t.az}° ${cab(t.az)} · ${fk(t.km)} km &nbsp; <b style="color:#fff">Largo:</b> ${t.laz}° ${cab(t.laz)} · ${fk(t.lkm)} km<br>Zona CQ ${t.cq} · ${t.cont}${entNeed(t)===true?' · <span class="need">te falta (QRZ)</span>':entNeed(t)===false?' · <span class="have">confirmada en QRZ</span>':""}</p>
  <p style="margin:6px 0 0">A las ${hh(lh)}:00: ${n.p<.01?"<b>nada abierto</b>.":`<b>${Math.round(n.p*100)} %</b> en ${BANDS[n.b]} por ${n.lp?"paso largo":"paso corto"}.`} Mejor hora: <b>${hh(bh.h)}:00</b> en ${BANDS[bh.b]}${bh.lp?" (largo)":""} (${Math.round(bh.p*100)} %).</p>
  <p class="note" style="margin:4px 0 0">Allí: sale el sol ${se.rise!=null?hm(se.rise):"—"} · se pone ${se.set!=null?hm(se.set):"—"} (tu hora)${se.polar?" · "+se.polar+" polar":""}. Línea gris común: ${gw.length?gw.map(w=>hm(w[0])+"–"+hm(w[1])).join(", "):"ninguna hoy"}.${t.l?" Paso largo mejor que el corto: "+(lw.length?lw.map(w=>hh(w[0])+"–"+hh(w[1])+" h").join(", "):"nunca hoy")+".":""}</p>`+bandRows(t,lh)}
function calBtns(t){const b=st.mband>=0?st.mband:bestAny(t,st.mhour).b,lh=st.mhour;if(b==null||b<0||VUHF(b))return `<div class="acts"><button class="btn" data-goz="${t.id}">Ficha completa</button></div>`;
  const last=(typeof OBS!=="undefined"?OBS:[]).slice().reverse().find(o=>o.t===t.id&&o.b===b&&o.lh===lh&&o.k===calKey());const n=(typeof OBS!=="undefined"?OBS:[]).filter(o=>o.k===calKey()).length;
  const fresh=LASTOBS&&LASTOBS.t===t.id&&LASTOBS.b===b&&LASTOBS.lh===lh&&Date.now()-LASTOBS.at<4000;const p=Math.round(Math.max(prob(t,lh,b,false).p,t.l?prob(t,lh,b,true).p:0)*100);
  const ico={y:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',n:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>'};
  return `<div class="calbx${last?(last.h?" isy":" isn"):""}"><p class="calq">¿Oyes esta zona en <b style="color:${BC[b]}">${BANDS[b]}</b> a las ${hh(lh)}:00? <span class="note">La plataforma da un ${p} %.</span></p>
   <div class="calbt" role="group" aria-label="¿Lo oyes?"><button class="btn obs obsy${fresh&&last&&last.h?" pulse":""}" aria-pressed="${!!(last&&last.h)}" data-obs="1" data-t="${t.id}" data-b="${b}">${ico.y}<span>Lo oigo</span></button><button class="btn obs obsn${fresh&&last&&!last.h?" pulse":""}" aria-pressed="${!!(last&&!last.h)}" data-obs="0" data-t="${t.id}" data-b="${b}">${ico.n}<span>No lo oigo</span></button><button class="btn" data-goz="${t.id}">Ficha completa</button></div>
   ${last?`<p class="calmsg">${last.h?"Anotado: <b>lo oyes</b>":"Anotado: <b>no lo oyes</b>"} en ${BANDS[b]} a las ${hh(lh)}:00. Las predicciones ya se han recalculado con ${n} escucha${n===1?"":"s"} tuya${n===1?"":"s"}. <button class="lnk" data-undo="${t.id}|${b}|${lh}">Deshacer</button></p>`:`<p class="note calhint">Tu respuesta ajusta las predicciones a tu estación real.</p>`}</div>`}
function renderPop(){const p=st.pop,el=$("mpop");if(!p){el.hidden=true;return}const lh=st.mhour;let h="";
  if(p.k==="t"){const t=T(p.id);if(!t){closePop();return}const d=dxIn(t.id);h=`<h3>${esc(t.name)}</h3>`+tBlock(t,lh)+(d.length?`<p style="margin:6px 0 0">★ ${d.map(x=>`<b>${CS(x.call)}</b> hasta ${esc(x.until)}`).join(", ")}</p>`:"")+calBtns(t)}
  else if(p.k==="d"){const d=L.dx[p.i];if(!d){closePop();return}const t=tFor(d);const az=Math.round(brgJS(TXP,[d.lon,d.lat])),km=Math.round(distJS(TXP,[d.lon,d.lat]));const onc=SPOTS().filter(s=>d.call.includes(s.call));
    h=`<h3>★ ${CS(d.call)}</h3><p style="margin:0"><b>${esc(d.ent)}</b> · hasta ${esc(d.until)}${d.qsl?" · QSL: "+esc(d.qsl):""}</p><p class="note" style="margin:4px 0 0">${esc(d.info)}</p>`+
     (d.qsx&&MOD()==="ssb"?`<p style="margin:4px 0 0"><b>Frecuencias de fonía:</b> ${esc(d.qsx)}</p>`:`<p class="note" style="margin:4px 0 0">${MOD()==="ssb"?"Frecuencias de fonía no publicadas. ":""}Habituales en DXpediciones en ${MD().s}: ${MD().dxq}.${d.qsx&&MOD()!=="ssb"?" Anunciadas: "+esc(d.qsx)+".":""}</p>`)+
     (onc.length?`<p style="margin:4px 0 0;color:#ffd76a"><b>◆ En el clúster:</b> ${onc.map(s=>`${s.f} a las ${s.t} UTC`).join(", ")}</p>`:"")+
     `<p class="note" style="margin:4px 0 0">${d.pilot?"Piloto: "+esc(d.pilot)+" · ":""}<a href="https://clublog.org/livestream/${encodeURIComponent(d.call.split(" ")[0].split("/")[0]==="6W"?d.call.split(" ")[0]:d.call.split(" ")[0])}" target="_blank" rel="noopener">Log en vivo (Club Log)</a>${d.web?` · <a href="${esc(d.web)}" target="_blank" rel="noopener">Web</a>`:""}</p>
     <p class="note" style="margin:4px 0 0">Su posición: corto ${az}° ${cab(az)} · ${fk(km)} km — largo ${(az+180)%360}° ${cab((az+180)%360)} · ${fk(40030-km)} km. Previsión con el destino más cercano: ${esc(t?t.name:"—")}.</p>`+(t?bandRows(t,lh)+calBtns(t):"")}
  else if(p.k==="s"){const s=SPOTS()[p.i];if(!s){closePop();return}const e=spotEval(s,lh);
    h=`<h3>◆ ${CS(s.call)} · ${esc(s.f)}</h3><p style="margin:0">${BANDS[s.band]} · ${esc(s.t)} UTC (${ageTxt(spotAge(s))}) · lo oye ${CSL(s.by)}</p><p class="note" style="margin:4px 0 0">${esc(s.c)}</p>`+
     (e?`<p style="margin:6px 0 0">Para ti: <b>${Math.round(e.p*100)} %</b> por ${e.lp?"paso largo":"paso corto"} (corto ${e.az}° ${cab(e.az)} · ${fk(e.km)} km · largo ${e.laz}° ${cab(e.laz)} · ${fk(e.lkm)} km).</p><p class="note" style="margin:4px 0 0"><i>Por qué:</i> ${explain(e.t,s.band,lh,e.lp)}</p>`+calBtns(e.t):"")}
  else if(p.k==="b"){const b=BCN[p.i];const t=nearestT([b[2],b[3]],0);const az=Math.round(brgJS(TXP,[b[2],b[3]])),km=Math.round(distJS(TXP,[b[2],b[3]]));const heard=(L.beacons||[]).filter(x=>x.call===b[0]);
    h=`<h3>Baliza ${CS(b[0])}</h3><p style="margin:0">${esc(b[1])} · corto ${az}° ${cab(az)} · ${fk(km)} km — largo ${(az+180)%360}° ${cab((az+180)%360)} · ${fk(40030-km)} km</p><p class="note" style="margin:4px 0 0">Emite 10 s en cada frecuencia (14.100 → 18.110 → 21.150 → 24.930 → 28.200) y repite cada 3 min, bajando de 100 W a 10, 1 y 0,1 W. Si la oyes con la potencia más baja, el camino está muy abierto.</p>`+
     (heard.length?`<p style="margin:4px 0 0"><b>Oída hoy:</b> ${heard.map(x=>`${esc(x.f)} a las ${esc(x.t)} UTC${x.by?" por "+CSL(String(x.by||"").split(/[ ,]+/)):""}`).join(", ")}</p>`:"")+
     `<table><tr><th>Frecuencia</th><th>Previsión (corto)</th></tr>${BFQ.map(([f,bi])=>{const q=prob(t,lh,bi,false);return `<tr><td>${f}</td><td class="${cls(q.p)}">${q.na?"—":pct(q.p)} %</td></tr>`}).join("")}</table>`}
  el.innerHTML=`<button class="x" aria-label="Cerrar" id="mpx">×</button>`+h;el.hidden=false;
  $("mpx").onclick=closePop;
  el.querySelectorAll("[data-obs]").forEach(b=>b.onclick=()=>addObs(b.dataset.t,+b.dataset.b,b.dataset.obs==="1"));
  el.querySelectorAll("[data-undo]").forEach(b=>b.onclick=()=>{const [t,bb,h]=b.dataset.undo.split("|");undoObs(t,+bb,+h)});
  el.querySelectorAll("[data-goz]").forEach(b=>b.onclick=()=>{st.zone=b.dataset.goz;store.set("pz",st.zone);go("fichas");selTab("fichas","f_info",true);renderInfo()});
}
/* pantalla completa */
function setFSM(on){const c=$("mapcard");if(on){const d=$("mapctlw");if(d)d.open=true}{const ms=$("mstats");if(ms){if(on)c.querySelector(".mapctl").appendChild(ms);else $("mlegend").after(ms)}}c.classList.toggle("fsm",on);if(!on)c.classList.remove("fs","nopan");$("mfs").textContent=on?"Salir de pantalla completa":"Pantalla completa";const small=false;c.classList.toggle("nopan",small);$("mpan").textContent=small?"Mostrar controles":"Ocultar controles";document.body.classList.toggle("mapfs",on);if(st.page==="mapa")requestAnimationFrame(()=>drawMap())}
function toggleFS(){const c=$("mapcard");const fsEl=document.fullscreenElement||document.webkitFullscreenElement;
  if(fsEl||c.classList.contains("fsm")){if(fsEl){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}}setFSM(false);return}
  const req=c.requestFullscreen||c.webkitRequestFullscreen;let p=null;try{p=req?req.call(c):null}catch(e){p=null}
  const fallback=()=>{c.classList.add("fs");setFSM(true)};
  if(p&&p.then)p.then(()=>setFSM(true)).catch(fallback);else if(!req)fallback();else setFSM(true)}
["fullscreenchange","webkitfullscreenchange"].forEach(ev=>document.addEventListener(ev,()=>{const fsEl=document.fullscreenElement||document.webkitFullscreenElement;if(!fsEl&&!$("mapcard").classList.contains("fs"))setFSM(false)}));
{let rt=0;addEventListener("resize",()=>{if(!$("mapcard").classList.contains("fsm"))return;clearTimeout(rt);rt=setTimeout(()=>drawMap(),150)})}
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&!$("mapcard").classList.contains("fs"))$("mfs").textContent="Pantalla completa"});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if($("mapcard").classList.contains("fs")){$("mapcard").classList.remove("fs");$("mfs").textContent="Pantalla completa"}else if(st.pop)closePop()}});

/* ---------- ahora / lateral ---------- */
function renderSide(){
  const lh=st.mhour,now=localNow();
  const per=BI().map(b=>{let mx={p:0,t:null},cnt=0,act=0,na=false;for(const t of TG().filter(inMode)){const a=prob(t,lh,b,false),c=prob(t,lh,b,true);if(a.na)na=true;const r=c.p>a.p?{...c,lp:true}:{...a,lp:false};if(r.p>=.3)cnt++;act+=st.mode==="contest"?cval(t,b,a.p):r.p;if(r.p>mx.p)mx={p:r.p,t,muf:r.muf,lp:r.lp}}const ms=cmults(lh,b);if(st.mode==="contest")cnt=ms.size;return {b,mx,cnt,act,na,ms:[...ms].sort((a,c)=>a-c)}});
  const amax=Math.max(1e-9,...per.map(x=>x.act));
  $("bands").innerHTML=per.slice().reverse().map(x=>x.na?`<div class="brow"><div class="n"><i style="background:${BC[x.b]}"></i>${BANDS[x.b]}</div><div class="bar"></div><div class="p">—</div><div class="d">Ninguna de tus antenas cubre esta banda</div></div>`:st.mode==="contest"
    ?`<div class="brow"><div class="n"><i style="background:${BC[x.b]}"></i>${BANDS[x.b]}</div><div class="bar"><span style="width:${Math.round(x.act/amax*100)}%;background:${BC[x.b]}"></span></div><div class="p">${Math.round(x.act/amax*100)}</div><div class="d">${x.cnt?`Multiplicadores abiertos: ${x.cnt}`:"Sin multiplicadores abiertos"} · más fuerte: ${x.mx.t?esc(x.mx.t.name):"—"} · ${skipTxt(x.b,lh)}</div></div>`
    :`<div class="brow"><div class="n"><i style="background:${BC[x.b]}"></i>${BANDS[x.b]}</div><div class="bar"><span style="width:${Math.round(x.mx.p*100)}%;background:${BC[x.b]}"></span></div><div class="p">${Math.round(x.mx.p*100)}%</div><div class="d">${x.mx.p>=.05?`Mejor DX: ${esc(x.mx.t.name)}${x.mx.lp?" (paso largo)":""} · ${x.cnt} destino${x.cnt===1?"":"s"} ≥30 %`:"Cerrada o casi para tu equipo"} · ${skipTxt(x.b,lh)}</div></div>`).join("");
  const top=st.mode==="contest"?per.filter(x=>x.mx.p>=.05).sort((a,b)=>b.act-a.act)[0]:per.filter(x=>x.mx.p>=.05).sort((a,b)=>b.cnt-a.cnt||b.mx.p-a.mx.p)[0];
  const allz=[];for(const t of TG().filter(inMode))for(const b of BI()){allz.push({t,b,lp:false,...prob(t,lh,b,false)});if(st.mode==="dx"&&t.l)allz.push({t,b,lp:true,...prob(t,lh,b,true)})}
  allz.sort((a,b)=>st.mode==="contest"?cval(b.t,b.b,b.p)-cval(a.t,a.b,a.p):b.p-a.p);
  if(st.mode==="dx"){const far=allz.filter(z=>z.t.km>=2500);const rare=allz.filter(z=>z.t.km<2500);allz.length=0;allz.push(...far,...rare)}
  const needZ=allz.filter(z=>entNeed(z.t)===true&&z.p>=.15);
  const dxNow=L.dx.filter(dxNew).map(d=>{const t=tFor(d);return t?{d,t,...bestAny(t,lh)}:null}).filter(x=>x&&x.p>=.1).sort((a,b)=>b.p-a.p);
  const isNow=lh===now,when=isNow?"Ahora":"A las "+hh(lh)+":00";
  const sp=SPOTS().map(s=>({s,e:spotEval(s,lh),a:spotAge(s)})).filter(x=>x.e);
  const dxs=sp.filter(x=>spotKind(x.s)==="dx").sort((a,b)=>b.e.p-a.e.p),ind=sp.filter(x=>spotKind(x.s)==="ind"),bcnH=(L.beacons||[]);
  let h="<div><h3>Lo que dice el clúster</h3>";
  if(!sp.length)h+=`<p>No hay spots de fonía útiles en las bandas de este modo. ${L.spotsSrc?"(Leídos: "+esc(L.spotsSrc)+".)":""}</p>`;
  dxs.slice(0,6).forEach(({s,e,a})=>{const nb=bandNeed(e.t,s.band);const v=e.p>=.3?"Merece la pena ir ya":e.p>=.1?"Posible con paciencia: llama cuando baje el pile-up":"Poco según el modelo, pero el spot dice que hoy la banda va mejor: escucha un par de minutos";
    h+=`<p>◆ <b>${CS(s.call)}</b> en <b>${esc(s.f)}</b> (${BANDS[s.band]}), ${ageTxt(a)}: lo copian ${CSL(s.by," y ")}${nb===true?' <span class="need">· te falta en esta banda</span>':""}. Para ti, por ${e.lp?"paso largo":"paso corto"}: <b>${Math.round(e.p*100)} %</b> (rumbo ${e.lp?e.laz:e.az}° ${cab(e.lp?e.laz:e.az)}). ${v}.</p><details class="why"><summary>Por qué</summary><p>${explain(e.t,s.band,lh,e.lp)}</p></details>`});
  ind.slice(0,3).forEach(({s,e,a})=>{h+=`<p><b>Indicador</b> ${ageTxt(a)}: ${esc(s.c)} (${esc(s.f)}). ${BANDS[s.band]} está abierta ahora en esa dirección. Tu modelo hacia ${esc(e.t.name)}: <b>${Math.round(e.p*100)} %</b>.</p>`});
  if(bcnH.length)h+=`<p><b>Balizas oídas:</b> ${bcnH.slice(0,6).map(x=>`${CS(x.call)} en ${esc(x.f)} (${esc(x.t)} UTC)`).join(", ")}. Confirman que esas direcciones están abiertas.</p>`;
  const newest=sp.length?Math.min(...sp.map(x=>x.a??1e9)):null;
  if(sp.length&&!isNow)h+=`<p class="note">Los spots son de las ${esc((L.updatedUTC||"").slice(11,16))} UTC; estás viendo otra hora.</p>`;
  if(newest!=null&&newest>90)h+=`<p class="note">Los spots tienen más de hora y media. Pulsa «Actualizar».</p>`;
  h+="</div><div><h3>Condiciones de banda</h3>";const fo=foF2est(lh);
  if(!top)h+=`<p>${when} ninguna banda pasa del 5 % con este equipo. Mira la línea de 24 h para ver cuándo abre.</p>`;
  else{const z=allz[0];
    h+=st.mode==="contest"?`<p>${when}, la banda que más puntos da en el ${CT().n} es <b>${BANDS[top.b]}</b> (${top.cnt} multiplicador${top.cnt===1?"":"es"} abierto${top.cnt===1?"":"s"}). Donde más QSO saldrán: <b>${esc(z.t.name)}</b> en ${BANDS[z.b]} (${Math.round(z.p*100)} %).</p><details class="why"><summary>Por qué</summary><p>${explain(z.t,z.b,lh,false)}</p></details>`
     :`<p>${when}, la mejor banda es <b>${BANDS[top.b]}</b>, con ${top.cnt} destino${top.cnt===1?"":"s"} por encima del 30 %. El DX más probable: <b>${esc(z.t.name)}</b> en ${BANDS[z.b]} por ${z.lp?"paso largo":"paso corto"} (${Math.round(z.p*100)} %).</p><details class="why"><summary>Por qué</summary><p>${explain(z.t,z.b,lh,z.lp)}</p></details>`}
  if(st.mode==="dx"){const re=TG().filter(t=>t.km<2500&&rareOn(t)).map(t=>({t,...bestAny(t,lh)})).filter(x=>x.p>=.15);if(re.length)h+=`<p><b>Europa rara en el aire:</b> ${re.map(x=>`${esc(x.t.name)} en ${BANDS[x.b]} (${Math.round(x.p*100)} %)`).join(", ")}.</p>`}
  ;
  h+="</div><div><h3>Qué hacer</h3>";const steps=[];const goNow=dxs.filter(x=>x.e.p>=.1);
  if(st.mode==="contest"){if(top)steps.push(`Quédate en <b>${BANDS[top.b]}</b>. Si llamar CQ no da ritmo, recorre la banda.`);if(goNow.length)steps.push(`Multiplicador en el clúster: <b>${CS(goNow[0].s.call)}</b> en ${esc(goNow[0].s.f)} (${Math.round(goNow[0].e.p*100)} %).`)}
  else{if(!window.ACRACB_recCards)goNow.slice(0,3).forEach(x=>steps.push(`Ve a <b>${esc(x.s.f)}</b> y busca a <b>${CS(x.s.call)}</b>${/up|arriba|split/i.test(x.s.c)?" (escucha arriba: trabaja en split)":""}, ${x.e.lp?"por paso largo":"por paso corto"} (${Math.round(x.e.p*100)} %).`));
    if(!window.ACRACB_recCards)dxNow.filter(x=>!goNow.some(g=>x.d.call.includes(g.s.call))).slice(0,3).forEach(x=>steps.push(`DXpedición al alcance: <b>${CS(x.d.call)}</b>${(()=>{const e=callEnt(x.d.call),n=String(x.d.ent||"").trim(),k=e&&e.name?e.name:"";if(!n||n.toLowerCase()===k.toLowerCase())return "";if(k&&n.toLowerCase().startsWith(k.toLowerCase())){const r=n.slice(k.length).trim();return /^\(.+\)$/.test(r)?" "+esc(r):""}return " ("+esc(n)+")"})()} en ${BANDS[x.b]} por ${x.lp?"paso largo":"paso corto"} (${Math.round(x.p*100)} %)${x.d.qsx?", en "+esc(x.d.qsx):""}.`));
    if(LOG&&needZ.length)steps.push(`Te faltan y están abiertas: ${needZ.slice(0,4).map(z=>`<b>${esc(z.t.name.split(" (")[0])}</b> en ${BANDS[z.b]} (${Math.round(z.p*100)} %)`).join(", ")}.`);
    if(top)steps.push(`Si no hay nada de eso, recorre <b>${BANDS[top.b]}</b> hacia ${esc(allz[0].t.name)}.`)}
  const RCH=st.mode!=="contest"&&window.ACRACB_recCards?ACRACB_recCards(goNow.slice(0,3),dxNow.filter(x=>!goNow.some(g=>x.d.call.includes(g.s.call))).slice(0,3)):"";h+=RCH;h+=steps.length?"<ol style='margin:4px 0 0;padding-left:20px'>"+steps.map(x=>`<li>${x}</li>`).join("")+"</ol>":RCH?"":"<p>Nada útil a esta hora.</p>";
  const k=kpAt(lh);if(k>=4)h+=`<p class="note" style="color:#ff8a80">Kp ${k}: caminos polares penalizados; los del sur aguantan.</p>`;
  if(sunEl(TXP,lh)>0&&L.radio)h+=`<p class="note">Apagón por llamarada: ${L.radio.r12} % (si todo se calla, espera 15–60 min).</p>`;
  $("rec").innerHTML=`<div class="rec">${h}</div></div>`;$("rech").textContent=isNow?"Qué hacer ahora":"Qué hacer a las "+hh(lh)+":00";
  // DX
  if(st.page!=="dx")return;
  $("dxl").innerHTML=L.dx.map((d,i)=>{const t=tFor(d);if(!t)return "";const p=[d.lon,d.lat],az=Math.round(brgJS(TXP,p)),km=Math.round(distJS(TXP,p));let bh={p:0,h:0,b:0,lp:false};for(let x=0;x<24;x++){const r=bestAny(t,x);if(r.p>bh.p)bh={...r,h:x}}
    const n=bestAny(t,lh),onc=SPOTS().find(s=>d.call.includes(s.call)),nw=dxNew(d);
    return `<button class="dx" data-dxi="${i}"><span><span class="c">${nw?"★\u00a0":"✔\u00a0"}${CS(d.call)}</span>${(()=>{const e=callEnt(d.call);return e&&e.name&&String(d.ent||"").toLowerCase()!==e.name.toLowerCase()?` <span class="cty">· ${esc(d.ent)}</span>`:""})()}${d.mw?` <span class="agr dif">Most Wanted nº ${esc(d.mw)}</span>`:""}${MOD()==="ssb"&&d.ssb===false?'<br><span class="tag">fonía sin confirmar</span>':""}</span><span class="pill ${cls(n.p)}">${Math.round(n.p*100)}%</span>
    <span class="w">${window.ACRACB_dxon?ACRACB_dxon(d):(onc?`<b style="color:#ffd76a">◆ En el clúster: ${esc(onc.f)} a las ${esc(onc.t)} UTC</b><br>`:"")}${az}° ${cab(az)} · largo ${(az+180)%360}° · ${fk(km)} km · mejor ${hh(bh.h)}:00 en ${BANDS[bh.b]} (${Math.round(bh.p*100)} %) · hasta ${esc(d.until)}</span></button>`}).join("")+(L.dxHidden&&MOD()==="ssb"?`<p class="note" style="margin:4px 0 0">No se muestran ${L.dxHidden} expediciones activas que no anuncian fonía.</p>`:"");
  document.querySelectorAll('.dx[data-dxi]').forEach(b=>b.onclick=()=>{openPop({k:"d",i:+b.dataset.dxi});go("mapa")});
  {const h=$("clh");if(h){const sa=(Date.parse(L.spotsUTC||L.updatedUTC)||0);const m=sa?Math.max(0,Math.round((Date.now()-sa)/60000)):null;const ck=(Date.parse(L.spotsChecked)||0),mc=ck?Math.max(0,Math.round((Date.now()-ck)/60000)):null;{const E=window.ACRACB_LANG==="en",fr=mc!=null&&mc<=3,dot=`<i class="cld ${mc==null?"":fr?"ok":"old"}" title="${mc==null?"":E?`checked ${mc} min ago`:`revisado hace ${mc} min`}"></i>`;const bits=[CMSTXT()+(HB()!=null?" · "+BANDS[HB()]:"")];if(mc!=null&&!fr)bits.push(E?`checked ${mc} min ago`:`revisado hace ${mc} min`);if(L.spotsNew!=null)bits.push(E?`${L.spotsNew} new`:`${L.spotsNew} nuevos`);if(m!=null)bits.push(E?`last spot ${m} min ago`:`último spot hace ${m} min`);
  h.innerHTML=(E?"World cluster":"Clúster del planeta")+`<span class="clst">${dot}${bits.join(" · ")}</span>`}}}
  $("spots").innerHTML=(dxs.length||ind.length?[...dxs,...ind].map(({s,e,a})=>`<div class="sp ${a>60?"old":""}"><span class="f" style="color:${BC[s.band]}">${esc(s.f)}</span><span>${s.nw?'<span class="nwb">NUEVO</span> ':""}<b>${CS(s.call)}</b> <span class="sage" title="${esc(s.t)} UTC">${ageTxt(a)}</span>${s.ns>1?` <span class="nsb" title="Este spot aparece en ${s.ns} clústeres distintos">en ${s.ns} clústeres</span>`:""}</span><span class="w">${CSL(s.by)}${window.ACRACB_tags?ACRACB_tags(s):""}<br>${e.az}° ${cab(e.az)} · ${fk(e.km)} km · <b>${Math.round(Math.max(e.pSP,e.t.l?e.pLP:0)*100)} %</b>${e.t.l&&e.pLP>e.pSP?" (largo)":""}</span></div>`).join(""):`<div class="empty">Sin spots de ${CMSTXT()} útiles${MOD()!=="ssb"&&!(L.spots||[]).some(s=>s.mode)?": los datos actuales solo traen fonía; la próxima actualización traerá todos los modos":""}.</div>`)+`<details class="srcd"><summary>Fuentes</summary><p class="note">${esc(L.spotsSrc||"—")}</p></details>`;
  const nr=SPOTS().filter(s=>spotKind(s)==="near");
  const nrA=nr.map(s=>({s,a:spotAge(s)})).sort((x,y)=>(x.a??1e9)-(y.a??1e9));
  $("near").innerHTML=(nrA.length?nrA.map(({s,a})=>{const p=s.dx&&s.dx.length===2?s.dx:null,az=p?Math.round(brgJS(TXP,p)):null,km=p?Math.round(distJS(TXP,p)):null;
    const ref=(()=>{const m=String(s.c||"").match(/(POTA|SOTA|WWFF|GMA|DME|DVGE|DFE|DME?-?\d|IOTA|DIE|DCE|DMVE|DEE)[ :-]*[A-Z0-9/-]+|skimmer|PSK Reporter|escucha[^,;.]*|up ?\d*/i);return m?" · "+esc(m[0]):""})();
    return `<div class="sp ${a>60?"old":""}"><span class="f" style="color:${BC[s.band]}">${esc(s.f)}${s.mode&&window.ACRACB_mb?" "+ACRACB_mb(s.mode):""}</span><span>${s.nw?'<span class="nwb">NUEVO</span> ':""}<b>${CS(s.call)}</b> <span class="sage" title="${esc(s.t)} UTC">${ageTxt(a)}</span>${s.ns>1?` <span class="nsb" title="Este spot aparece en ${s.ns} clústeres distintos">en ${s.ns} clústeres</span>`:""}</span><span class="w">${CSL(s.by)}${ref}<br>${az!=null?`${az}° ${cab(az)} · ${fk(km)} km · `:""}<b>${BANDS[s.band]||""}</b>${s.mode&&!window.ACRACB_mb?" "+esc(s.mode):""}</span></div>`}).join(""):`<div class="empty">Sin spots cercanos de ${CMSTXT()} ahora.</div>`)+(L.nearNote?`<p class="note" style="margin:4px 0 0">${esc(L.nearNote)}</p>`:"");
}
/* ---------- línea de 24 h ---------- */
let TLG=0;function renderTL(){const g=++TLG;
  const now=localNow();let h="";
  $("tlt").textContent=st.mode==="contest"?"Tu concurso: banda con más actividad hora a hora":"Tu día DX: mejor banda hora a hora";
  const TGM=TG().filter(inMode),BIL=BI();let x=0;const hour=()=>{let bb=BIL[0],bc=-1,bp=0,ba=-1;for(const b of BIL){let c=0,mp=0,a=0;for(const t of TGM){const p=st.mode==="dx"?Math.max(prob(t,x,b).p,prob(t,x,b,true).p):prob(t,x,b).p;if(p>=.3)c++;if(p>mp)mp=p;a+=cval(t,b,p)}if(st.mode==="contest")c=cmults(x,b).size;
      if(st.mode==="contest"?a>ba:(c>bc||(c===bc&&mp>bp))){bc=c;bb=b;bp=mp;ba=a}}
    const col=bp<.05?"#1a2433":BC[bb];h+=`<button style="background:${col};opacity:${bp<.05?1:.45+Math.min(bp,1)*.55}" aria-current="${x===st.mhour}" title="${hh(x)}:00 · ${BANDS[bb]} · ${bc} ≥30 %" data-h="${x}">${bp<.05?"–":BANDS[bb].replace(/\s+m$/,"")}<span>${bc}</span></button>`;x++};const t0=performance.now();while(x<24&&performance.now()-t0<40)hour();
  const fin=()=>{
  $("tl").innerHTML=h;$("tlh").innerHTML=Array.from({length:24},(_,x)=>`<span style="${x===now?"color:var(--accent);font-weight:700":""}">${hh(x)}</span>`).join("");
  document.querySelectorAll('#tl button').forEach(b=>b.onclick=()=>{st.mhour=+b.dataset.h;$("mh").value=st.mhour;refresh()});
  const s=sunEvents(TXP);$("sun").innerHTML=`<span>Salida del sol <b>${hm(s.rise)}</b></span><span>Mediodía solar <b>${hm(s.noon)}</b></span><span>Puesta <b>${hm(s.set)}</b></span><span>Cifra pequeña = destinos ≥30 %${st.mode==="dx"?" (DX)":" (multiplicadores)"}</span><span>Toca una hora para verla en el mapa</span>`;
};
  if(x>=24)return fin();if(!$("tl").children.length)$("tl").innerHTML='<p class="note">Calculando las 24 horas…</p>';
  const step=()=>{if(g!==TLG)return;const t1=performance.now();while(x<24&&performance.now()-t1<14)hour();if(x<24)setTimeout(step,0);else fin()};setTimeout(step,0)}


/* ---------- 6 m, 2 m y 70 cm: ¿hay apertura? ---------- */
const ESMES=[.05,.05,.08,.2,.55,.9,.85,.6,.2,.08,.05,.15];
function vhfSpots(b){return (L.spots||[]).filter(x=>x.band===b).map(x=>{const a=spotAge(x);const d=Math.max(0,...(x.from||[]).map(fr=>x.dx?distJS(fr,x.dx):0));return {x,a,d}}).filter(o=>o.a==null||o.a<=150).sort((p,q)=>q.d-p.d)}
function vhfStatus(b){const mo=new Date().getUTCMonth(),es=ESMES[mo],sp=vhfSpots(b),top=sp[0],lh=localNow();const R=MOD()==="fm"||b!==10?vhfRange(b===10?11:b):0;
  const sTxt=o=>`${CS(o.x.call)} en ${esc(o.x.f)} (${esc(o.x.mode||"SSB")}), oído a ${fk(Math.round(o.d))} km por ${esc((o.x.by||[]).slice(0,2).join(", "))}${o.a!=null?", "+ageTxt(o.a):""}`;
  if(b===10){let f2=0,ft=null;for(const t of TG()){const p=prob(t,lh,10,false).p;if(p>f2){f2=p;ft=t}}
    if(top&&top.d>=3500)return ["g","Abierta a larga distancia",`Hay spots de 6 m a más de 3.500 km: ${sTxt(top)}. Eso es propagación por la capa F2 o transecuatorial (TEP).`,"Busca DX lejano en 50.100–50.200 kHz (SSB) y en 50.313 kHz (FT8). Estas aperturas duran poco: llama ya."];
    if(top&&top.d>=700)return ["g","Abierta por E esporádica",`Hay spots de 6 m entre 700 y 2.300 km: ${sTxt(top)}. Es la firma de la E esporádica.`,"Escucha en 50.110–50.200 kHz y mira el FT8 en 50.313 kHz: suele abrir hacia una zona concreta de Europa durante unos minutos u horas."];
    if(f2>=.3)return ["y","Posible por la capa F2",`VOACAP da un ${Math.round(f2*100)} % hacia ${esc(ft.name)} por la capa F2 a esta hora, pero no hay spots que lo confirmen.`,"Pon el FT8 en 50.313 kHz o escucha las balizas de 6 m: si salen estaciones lejanas, la banda está abierta."];
    if(es>=.5)return ["y","Temporada de E esporádica",`Sin spots de 6 m a distancia ahora mismo, pero en ${MESES[mo]} la E esporádica abre 6 m casi a diario en Europa (${Math.round(es*100)} % de los días), sobre todo a media mañana y a última hora de la tarde.`,"Vigila el clúster y el FT8 en 50.313 kHz: las aperturas llegan sin avisar."];
    return ["r","Cerrada",`No hay spots de 6 m a distancia, VOACAP no ve camino por la capa F2 (máximo ${Math.round(f2*100)} %) y en ${MESES[mo]} la E esporádica es rara (${Math.round(es*100)} % de los días).`,"Solo contactos locales o regionales por onda directa. Las grandes aperturas de 6 m llegan en verano o con mucha actividad solar."]}
  const nm=b===11?"2 m":"70 cm",lim=b===11?500:400,tro=L.vhf&&L.vhf.tropo!=null?+L.vhf.tropo:null;
  if(top&&top.d>=1000&&top.d<=2400&&b===11)return ["g","Abierta por E esporádica",`Hay spots de 2 m a ${fk(Math.round(top.d))} km: ${sTxt(top)}. En 2 m eso suele ser E esporádica muy intensa.`,"Es muy poco frecuente y dura minutos: ve a 144.300 (SSB) o 144.174 (FT8) ya."];
  if(top&&top.d>=lim)return ["g","Abierta por tropo",`Hay spots de ${nm} a ${fk(Math.round(top.d))} km: ${sTxt(top)}. A esa distancia hace falta un conducto troposférico (inversión de temperatura).`,`Llama en ${b===11?"144.300 (SSB) y 144.174 (FT8)":"432.200 (SSB) y 432.174 (FT8)"}, apuntando hacia donde salen los spots. Sobre el mar los conductos llegan muy lejos, por ejemplo a Baleares, Italia o Canarias.`];
  if(tro!=null&&tro>=5)return ["y","Tropo favorable",`Sin spots a distancia, pero la previsión de tropo ${L.vhf.src?"("+esc(L.vhf.src)+") ":""}da ${tro} sobre 10 para tu zona.`,`Escucha en ${b===11?"144.300 y 144.174":"432.200 y 432.174"}: con conducto se pasa de ${fk(R)} km a varios cientos más.`];
  if(b===11&&es>=.8)return ["y","Posible E esporádica",`Sin spots a distancia ahora, pero en ${MESES[mo]} la E esporádica a veces llega a 2 m (pocos días al año). Alcance normal con tu estación en ${MD().s}: unos ${fk(R)} km.`,"Si 6 m está muy abierto a menos de 1.000 km, vigila 2 m: puede abrir también."];
  return ["r","Sin apertura a distancia",`No hay spots de ${nm} a más de ${lim} km${tro!=null?" y la previsión de tropo es baja ("+tro+"/10)":""}. Con tu estación en ${MD().s}, el alcance normal por dispersión troposférica es de unos ${fk(R)} km.`,`Contactos locales y regionales${MD().s==="FM"?" en simplex o por repetidor":""}. Subir la antena, usar una directiva o pasar a CW o FT8 alarga ese alcance.`]}
function renderVHF(){const el=$("vhfo");if(!el)return;
  el.innerHTML=[10,11,12].map(b=>{const [lv,t,a,pr]=vhfStatus(b);return `<div class="note lv-${lv}"><div class="lvh"><b><span style="color:${BC[b]}">●</span> ${BANDS[b]}: ${t}.</b><span class="lvp">${LVN[lv]}</span></div><span class="prac">${pr}</span><details class="why"><summary>Detalle</summary><p>${a}</p></details></div>`}).join("")}
function easyVHF(){const r=[10,11,12].map(b=>{const [lv,t]=vhfStatus(b);return `<p><b style="color:${BC[b]}">${BANDS[b]}</b>: <span class="lv-${lv}" style="background:none;border:0;padding:0">${t}</span>.</p>`}).join("");
  return `<div class="ez"><div class="ezt">6 m, 2 m y 70 cm ahora</div>${r}</div>`}

/* ---------- concursos ---------- */
const SEGSSB=[[0,"1.810–2.000 (según tu licencia)","1.800–2.000","1.800–2.000","SSB entre 1.840 y 1.900. Las mejores horas son la media hora antes de tu amanecer, hacia Norteamérica."],
 [1,"3.500–3.800","3.600–4.000","3.800–4.000","<b>Split obligado para la mitad de EE. UU.:</b> tú no puedes pasar de 3.800 y los General no pueden bajar de 3.800. Transmite en 3.7xx y di «escucho 3.8xx». Los Extra (3.600+) y Canadá (sin segmentos por clase) te contestan en simplex. Australia suele usar 3.776–3.800."],
 [2,"7.000–7.200","7.125–7.300","7.175–7.300","<b>Pseudo-split en 40 m:</b> lo más alto que puedes transmitir es 7.200. Para Norteamérica, llama entre 7.175 y 7.200 (te oyen Extra y General) o más abajo diciendo «escucho 7.2xx» y escucha por encima de 7.200. Entre 7.125 y 7.175 solo te contestan los Extra."],
 [3,"14.000–14.350","14.150–14.350","14.225–14.350","Llama por encima de 14.225: así te pueden contestar todas las clases de EE. UU. Debajo solo te llamarán Extra y Advanced."],
 [5,"21.000–21.450","21.200–21.450","21.275–21.450","Llama por encima de 21.275 para que te llamen también los General."],
 [7,"28.000–29.700","28.300–29.700","28.300–29.700","Entre 28.300 y 28.500 también pueden contestarte los Technician de EE. UU.: más estaciones cuando 10 m abre a Norteamérica."]];
const SEGCW=[[0,"1.810–1.838","1.800–2.000","1.800–2.000","CW entre 1.820 y 1.835. Norteamérica a tu amanecer."],
 [1,"3.500–3.570","3.500–3.600","3.525–3.600","Los General de EE. UU. empiezan en 3.525: llama por encima para que te oigan todos."],
 [2,"7.000–7.040","7.000–7.125","7.025–7.125","Por encima de 7.025 también te contestan los General."],
 [3,"14.000–14.070","14.000–14.150","14.025–14.150","Por encima de 14.025 también te contestan los General."],
 [5,"21.000–21.070","21.000–21.200","21.025–21.200","Por encima de 21.025 también te contestan los General."],
 [7,"28.000–28.070","28.000–28.300","28.000–28.300","De 28.000 a 28.300 también pueden contestarte los Technician de EE. UU."]];
const SEGDG=[[1,"3.580–3.600","3.500–3.600","3.525–3.600","Plan IARU R1: digitales en 3.570–3.600. En concursos de RTTY la actividad baja hasta 3.560."],
 [2,"7.040–7.050","7.000–7.125","7.025–7.125","Plan IARU R1: digitales en 7.040–7.050 (7.053 automáticos). En concursos se usa también 7.080–7.100 con Norteamérica."],
 [3,"14.070–14.099","14.000–14.150","14.025–14.150","Digitales en 14.070–14.099. En concursos de RTTY la actividad sube hasta 14.120."],
 [5,"21.070–21.110","21.000–21.200","21.025–21.200","Digitales en 21.070–21.110 y en concursos hasta 21.150."],
 [7,"28.050–28.150","28.000–28.300","28.000–28.300","Digitales en 28.050–28.150."]];
const SEG=()=>MOD()==="ssb"?SEGSSB:MOD()==="cw"?SEGCW:SEGDG;
const TRICKS={
 cqww:["Los QSO con España dan 0 puntos, pero el primero de cada banda te da el multiplicador «España».","Los multiplicadores (zona y país) cuentan por banda: si trabajas uno raro en 15 m, pídele que pase contigo a 20 o a 10 m.","Si usas el clúster, apúntate en «Asistido».","Puedes operar las 48 h: duerme en las franjas sin apertura útil.","No te anuncies tú mismo en el clúster: está prohibido."],
 wpx:["Los QSO con España dan 0 puntos, pero su prefijo sí cuenta.","40, 80 y 160 m puntúan el doble: de noche, quédate en las bandas bajas.","Cada prefijo cuenta una sola vez en todo el concurso: prioriza ritmo.","Un prefijo especial concedido por la administración hace que todos quieran trabajarte.","Monooperador: máximo 36 de las 48 h, con pausas de al menos 60 min (abajo tienes cuándo hacerlas)."],
 arrl:["Solo valen QSO con EE. UU. y Canadá: 3 puntos cada uno.","Multiplicadores: 48 estados, DC y provincias de Canadá, por banda. Alaska y Hawái no cuentan.","Pide que cambien de banda los estados escasos (Dakotas, Wyoming, Vermont, Nevada…) y el oeste de Canadá.","Respeta los segmentos de EE. UU. (tabla de abajo).","Su intercambio es el estado o la provincia: un error anula el QSO."],
 iaru:["Mismo continente y otra zona ITU: 3 puntos. Otro continente: 5. Tu zona ITU (37): 1.","Las sedes (HQ) de cada asociación y los oficiales de la IARU son multiplicadores en cada banda.","Las zonas ITU cuentan por banda: mueve multiplicadores de banda.","Son 24 h: el ritmo manda."],
 wae:["Solo valen QSO fuera de Europa: 1 punto cada uno.","<b>QTC:</b> después de un QSO, pide a la estación de fuera de Europa que te pase QTC (resúmenes de sus QSO anteriores): cada QTC recibido suma 1 punto. Máximo 10 por estación. Es la jugada que más puntos da en el WAE.","Los multiplicadores de 80 m valen ×4 y los de 40 m ×3: un país en 80 m vale el doble que en 20 m.","Monooperador: 36 de las 48 h, con pausas de al menos 3 h."],
 cq160:["Solo 160 m: todo se decide de noche.","Mismo país 2 puntos, Europa 5, otro continente 10: busca Norteamérica en tu amanecer.","Los estados de EE. UU. y las provincias de Canadá son multiplicadores, además de los países.","Usa la ventana de línea gris (ficha de cada destino) para Norteamérica y Asia."],
 arrl10:["Solo 10 m: 2 puntos por QSO en fonía.","Multiplicadores: estados, provincias de Canadá, estados de México, países y regiones ITU.","De 28.300 a 28.500 también te pueden contestar los Technician de EE. UU.","La banda abre a mediodía: duerme de noche."]};
function contestPlan(){const c=CT(),rows=[],seq=[];for(let x=0;x<24;x++){let bb=-3,ba=-1;for(const b of BI()){let a=0;for(const t of TG().filter(inMode))a+=cval(t,b,prob(t,x,b).p);if(c.mk==="cqdx"||c.mk==="wae")a*=1+0.05*cmults(x,b).size;if(c.mk==="wae")a*=b===1?2:b===2?1.5:1;if(a>ba){ba=a;bb=b}}seq.push({b:ba<0.05?-3:bb,a:ba})}return seq}
const KRATE=.8;
function renderContest(){const on=st.mode==="contest";$("cnone").hidden=on;
  if(!on){$("cnone").innerHTML=`<h2>Modo concursos</h2><p>Activa el modo concursos para ver el plan de bandas, el ritmo, las pausas y los trucos del concurso que elijas.</p><button class="btn" id="goC">Activar modo concursos</button>`;$("goC").onclick=()=>setMode("contest",true);}
  const n=new Date();const list=CKEYS().map(k=>({k,c:CONTESTS[k],d:nextDate(CONTESTS[k])})).sort((a,b)=>a.d-b.d);if(!list.length){$("ccal").innerHTML=`<p>No hay grandes concursos DX de ${MD().s} en la plataforma. Elige fonía, CW o RTTY en «Modo», arriba.</p>`;["cplan","cscore","cpause","tricks"].forEach(id=>{const e=$(id);if(e)e.innerHTML=""});return}
  $("ccal").innerHTML=`<table class="bt"><tr><th>Concurso</th><th>Próxima edición</th><th>Faltan</th></tr>${list.map(x=>`<tr class="${on&&x.k===$("contest").value?"on":""}"><td><b>${x.c.n}</b></td><td>${fdate(x.d)}</td><td>${Math.max(0,Math.ceil((x.d-n)/864e5))} días</td></tr>`).join("")}</table><p class="note">Fechas según la regla de cada concurso (fin de semana completo del mes). Compruébalas en sus bases antes de cada edición.</p>`;
  if(!on){["cplan","cscore","cpause","tricks"].forEach(id=>$(id).innerHTML="");return}
  const c=CT(),seq=contestPlan();$("cplanh").textContent="Plan de bandas · "+c.n+(useMonth()?" · propagación de "+MESES[c.month-1]:" · propagación de hoy");
  const rows=[];let prev=-9,start=0;for(let x=0;x<=24;x++){const b=x<24?seq[x].b:-9;if(b!==prev){if(prev!==-9)rows.push({b:prev,s:start,e:x});prev=b;start=x}}
  $("cplan").innerHTML=rows.map(r=>r.b===-3?`<div class="dx" style="cursor:default;opacity:.6"><span>Sin apertura útil de ${hh(r.s)}:00 a ${hh(r.e)}:00</span><span class="pill c0">${r.e-r.s} h</span><span class="w">Descansa o busca QSO sueltos</span></div>`:`<div class="dx" style="cursor:default"><span><span class="c" style="color:${BC[r.b]}">${BANDS[r.b]}</span> de ${hh(r.s)}:00 a ${hh(r.e)}:00</span><span class="pill" style="background:${BC[r.b]};color:#06101c">${r.e-r.s} h</span><span class="w">${(()=>{const mid=Math.min(23,Math.floor((r.s+r.e)/2));const zs=TG().filter(inMode).map(t=>({t,p:prob(t,mid,r.b).p})).filter(x=>x.p>=.3).sort((a,b)=>cval(b.t,r.b,b.p)-cval(a.t,r.b,a.p)).slice(0,3);return zs.length?"Hacia: "+zs.map(x=>esc(x.t.name.split(" (")[0])+` (${x.t.az}° ${cab(x.t.az)})`).join(", "):"Poca actividad alcanzable"})()}</span></div>`).join("")+`<p class="note">Banda que más puntos da en cada franja (hora local), con los puntos de cada QSO desde EA, los multiplicadores (${c.mult}) y la actividad típica de cada destino (estimación propia).</p>`;
  // ritmo y puntuación
  const rate=seq.map(s=>s.b<0?0:Math.min(250,KRATE*s.a));const days=c.h/24;const offH=c.so?(c.h-c.so):0;
  const sorted=rate.map((r,i)=>({r,i})).sort((a,b)=>a.r-b.r);const offPerDay=Math.round(offH/days);const offSet=new Set(sorted.slice(0,offPerDay).map(x=>x.i));
  const qso=Math.round(days*rate.reduce((s,r,i)=>s+(offSet.has(i)?0:r),0));
  let ptsSum=0,wsum=0;for(let x=0;x<24;x++){const b=seq[x].b;if(b<0)continue;for(const t of TG().filter(inMode)){const v=prob(t,x,b).p*(t.act||.05);ptsSum+=v*c.pts(t,b);wsum+=v}}const avgPts=wsum?ptsSum/wsum:0;
  let mults=0;const mb={};for(const b of BI()){const s=new Set();for(const t of TG().filter(inMode)){let mp=0;for(let x=0;x<24;x++)mp=Math.max(mp,prob(t,x,b).p);if(mp>=.3)s.add(c.mk==="cqdx"?"z"+t.cq:"d"+t.dxcc);if(mp>=.3&&c.mk==="cqdx")s.add("d"+t.dxcc)}
    let m=s.size;if(c.mk==="wve"){const w=TG().filter(t=>t.dxcc===291).some(t=>{for(let x=0;x<24;x++)if(prob(t,x,b).p>=.3)return true;return false});const ve=TG().filter(t=>t.dxcc===1).some(t=>{for(let x=0;x<24;x++)if(prob(t,x,b).p>=.3)return true;return false});m=(c.n.startsWith("ARRL International")?0:s.size)+(w?40:0)+(ve?8:0)}
    if(c.mk==="wae")m*=b===1?4:b===2?3:2;mb[b]=m;mults+=m}
  if(c.mk==="wpx")mults=Math.round(qso*.55);
  const qpts=Math.round(qso*avgPts),score=qpts*mults;
  $("cscore").innerHTML=`<div class="kv"><div class="chip"><div class="k">QSO estimados</div><div class="v">${fk(qso)}</div><div class="t">${c.h} h${c.so?", operando "+c.so:""} con ${PWN()} y ${ANTL()}</div></div><div class="chip"><div class="k">Puntos por QSO</div><div class="v">${avgPts.toFixed(1)}</div><div class="t">media según de dónde saldrán</div></div><div class="chip"><div class="k">Multiplicadores</div><div class="v">${fk(mults)}</div><div class="t">${c.mk==="wpx"?"prefijos ≈ 55 % de los QSO":BI().map(b=>BANDS[b]+" "+(mb[b]||0)).join(" · ")}</div></div><div class="chip"><div class="k">Puntuación</div><div class="v">${fk(score)}</div><div class="t">orden de magnitud${c.mk==="wae"?" (sin contar QTC)":""}</div></div></div>
   <div class="tl" style="margin-top:10px">${rate.map((r,i)=>`<button style="background:${seq[i].b<0?"#1a2433":BC[seq[i].b]};opacity:${offSet.has(i)?.25:1}" title="${hh(i)}:00 · ≈${Math.round(r)} QSO/h">${Math.round(r)}<span>${seq[i].b<0?"–":BANDS[seq[i].b].replace(/\s+m$/,"")}</span></button>`).join("")}</div><div class="tlh">${Array.from({length:24},(_,x)=>`<span>${hh(x)}</span>`).join("")}</div>
   <p class="note">QSO por hora estimados (hora local) llamando y recorriendo la banda, según la probabilidad de llegar y la actividad típica de cada destino. Es una estimación propia para comparar horas, bandas, antenas y potencias, no una promesa.</p>`;
  // pausas
  const blocks=[];let s0=-1;for(let x=0;x<=24;x++){const o=x<24&&offSet.has(x);if(o&&s0<0)s0=x;if(!o&&s0>=0){blocks.push([s0,x]);s0=-1}}
  const low=sorted.slice(0,5).map(x=>x.i).sort((a,b)=>a-b);
  $("cpause").innerHTML=c.so?`<p>${c.n}: como monooperador puedes operar ${c.so} de las ${c.h} h. Haz las ${offH} h de pausa (unas ${offPerDay} cada día) en las horas que menos dan:</p><ul>${blocks.map(b=>`<li><b>${hh(b[0])}:00–${hh(b[1])}:00</b> (${b[1]-b[0]} h)</li>`).join("")}</ul><p class="note">Cada pausa debe durar al menos ${c.mk==="wae"?"3 h":"60 min"}. Si un bloque sale más corto, júntalo con el de al lado.</p>`
   :`<p>${c.n} no obliga a parar${c.h===24?" (son 24 h)":""}. Si necesitas dormir, las horas que menos dan son: <b>${low.map(x=>hh(x)+":00").join(", ")}</b>.</p>`;
  // trucos
  $("tricks").innerHTML=`<h2>Trucos legales para sumar más · ${c.n}</h2><p class="note" style="margin:0 0 6px">${c.tip}</p><ul class="note" style="font-size:.95rem;margin:0 0 10px;padding-left:20px">${((TRICKS[$("contest").value]||TRICKS[CT().base])||[]).map(x=>`<li>${x}</li>`).join("")}</ul>
  <details class="why"><summary>Las 18 balizas: probabilidad en cada banda</summary><div class="scroll"><table class="hm" style="min-width:760px"><thead><tr><th class="rh">Banda</th><th class="rh">Tú puedes transmitir (EA)</th><th class="rh">EE. UU. Extra (${MD().s})</th><th class="rh">EE. UU. General (${MD().s})</th><th class="rh">La jugada</th></tr></thead><tbody>`+
  SEG().filter(([b])=>BI().includes(b)).map(([b,ea,ex,ge,j])=>`<tr><th class="rh"><span style="color:${BC[b]}">●</span> ${BANDS[b]}</th><td style="text-align:left">${ea}</td><td style="text-align:left">${ex}</td><td style="text-align:left">${ge}</td><td style="text-align:left;font-family:var(--f-b);font-size:.88rem;white-space:normal">${j}</td></tr>`).join("")+
  `</tbody></table></div><p class="note">Segmentos de ${MD().s} de EE. UU. según la norma FCC que conozco; los Advanced quedan entre Extra y General. Canadá no tiene segmentos por clase. Compruébalo antes del concurso. Respeta los tramos que el plan de la IARU Región 1 deja sin concursos (3.650–3.700 y 14.300–14.350 kHz).</p>`}
/* ---------- sol y espacio ---------- */
function renderSpace(){const s=L.space||{};const lv3=(v,g,y,inv)=>v==null||isNaN(+v)?"":inv?(+v<g?"g":+v<y?"y":"r"):(+v>=g?"g":+v>=y?"y":"r");const xr=String(s.xray||"").trim().toUpperCase()[0];
  const it=[["SFI · flujo solar",L.sfi,"cuanto más alto, más abren las bandas altas",lv3(L.sfi,110,90)],["Manchas (SSN)",s.ssn,"número de manchas",lv3(s.ssn,90,50)],["Kp ahora",L.kp,L.kpNote||"",lv3(L.kp,3,4.5,1)],["Índice A",s.a!=null&&s.a!==""&&!isNaN(+s.a)?Math.round(+s.a):s.a,"actividad geomagnética del día; < 10 es tranquilo",lv3(s.a,10,20,1)],["Viento solar",L.wind!=null?L.wind+" km/s":null,"lo normal son 350–450",lv3(L.wind,450,550,1)],["Densidad",s.dens!=null?s.dens+" p/cm³":null,"más densidad empuja más el campo",lv3(s.dens,10,20,1)],["Bz",L.bz!=null?L.bz+" nT":null,"negativo = sur: deja entrar el viento solar",L.bz==null?"":L.bz>=0?"g":L.bz>-5?"y":"r"],["Bt",L.bt!=null?L.bt+" nT":null,"intensidad del campo del viento",lv3(L.bt,10,20,1)],["Rayos X (GOES)",s.xray,"clase actual: C o menos no molesta; M y X cortan las bandas de día",!xr?"":"AB".includes(xr)?"g":xr==="C"?"y":"r"],["Protones",(s.proton!=null&&s.proton!==""&&!isNaN(+s.proton))?(L.radio&&L.radio.s1!=null&&L.radio.s1<20?"normal":s.proton+" (HamQSL)"):s.proton,"una tormenta de protones (S1 o más) cierra los caminos polares",!s.proton?"":(!isNaN(+s.proton)?(L.radio&&L.radio.s1!=null&&L.radio.s1<20?"g":""):/normal|sin|none|<|S0/i.test(s.proton)?"g":"r")],["Aurora",s.aurora,"","" ],["Llamaradas",L.flare,"probabilidad en 24 h",L.radio?(L.radio.r12<20?"g":L.radio.r12<40?"y":"r"):"y"]].filter(x=>x[1]!=null&&x[1]!=="");
  $("space").innerHTML=`<h2>Valores reales ahora</h2><p class="lvleg"><span class="lv-g">Favorable</span><span class="lv-y">Regular</span><span class="lv-r">Desfavorable</span> para el DX.</p><div class="kv">${it.map(([k,v,t,l])=>`<div class="chip ${l||""} lvc-${l||"n"}"><div class="k">${k}</div><div class="v">${esc(v)}</div>${t?`<div class="t">${esc(t)}</div>`:""}</div>`).join("")}</div>`+
   (L.iono&&L.iono.fof2?`<p style="margin:10px 0 0"><b>Ionosonda ${esc(L.iono.station||"")}</b>: foF2 ${L.iono.fof2} MHz${L.iono.mufd?` · MUF(3000) ${L.iono.mufd} MHz`:""} a las ${esc((L.iono.time||"").slice(11,16))} UTC. ${(()=>{const mt=Date.parse(L.iono.time);if(isNaN(mt))return "";const k=ionoK(parseInt(new Date(mt).toLocaleString("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:false}),10)%24);return k!==1?`Va un ${Math.abs(Math.round((k-1)*100))} % ${k>1?"por encima":"por debajo"} de la media del mes: la web ya lo aplica a las horas cercanas.`:"Coincide con la media del mes."})()}</p>`:`<p class="note" style="margin:10px 0 0">Sin medida reciente de ionosonda cerca de España. Llegará con la próxima actualización.</p>`)+
   `<details class="srcd"><summary>Datos del ${esc(L.updated)} · fuentes</summary><p class="note">${(L.sources||[]).map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join(" · ")}</p></details>`}
function renderSolar(){const F=L.kpfc;let h=`<h2>Previsión geomagnética y solar</h2>`;
  if(F){const n=new Date(),nd=Math.round((Date.parse(n.toISOString().slice(0,10))-Date.parse(F.base))/864e5),nb=Math.floor(n.getUTCHours()/3);const all=F.blocks.flat(),cols=all.length;
    const col=k=>k>=5?"var(--bad)":k>=4?"var(--warn)":"var(--ok)";
    h+=`<p class="note" style="margin:0">Kp previsto cada 3 horas (${esc(F.issued)}). Rojo = tormenta G1 o más: sube el ruido, baja la MUF en latitudes altas y aparecen QSB y eco.</p><div class="kpg" style="grid-template-columns:repeat(${cols},minmax(0,1fr))" role="img" aria-label="Previsión de Kp">`+
     all.map((k,i)=>{const d=Math.floor(i/8),b=i%8;const kf=Math.abs(k-Math.round(k))<.1?String(Math.round(k)):k-Math.floor(k)<.5?Math.floor(k)+"+":Math.ceil(k)+"−";return `<div class="${d===nd&&b===nb?"now":""}" style="height:${Math.max(6,k/9*100)}%;background:${col(k)}" title="${F.days[d]||""} ${hh(b*3)}–${hh(b*3+3)} UTC · Kp ${kf}"><span>${kf}</span></div>`}).join("")+
     `</div><div class="kpx" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${all.map((_,i)=>`<span>${hh((i%8)*3)}</span>`).join("")}</div><div class="kpd" style="grid-template-columns:repeat(${F.blocks.length},1fr)">${F.blocks.map((_,i)=>`<span>${esc(F.days[i]||"")} (UTC)</span>`).join("")}</div>`}
  h+=`<p class="lvleg"><span class="lv-g">Favorable</span><span class="lv-y">Regular</span><span class="lv-r">Desfavorable</span> para el DX.</p><div class="sgrid sx">`+solarItems().map(([t,lv,a,b])=>`<div class="note lv-${lv}"><div class="lvh"><b>${t}.</b><span class="lvp">${LVN[lv]}</span></div>${b?(()=>{const m=String(b).match(/^([\s\S]*?[a-záéíóúñ0-9)»%][.!])\s+(?=[A-ZÁÉÍÓÚ¿¡])([\s\S]+)$/);const cap=x=>String(x).replace(/^(\s*(?:<[^>]+>\s*)*)([a-záéíóúñ])/,(q,a1,c)=>a1+c.toUpperCase());return `<span class="prac">${cap(m?m[1]:b)}</span><details class="tec"><summary>Ver más</summary>${m?`<p>${m[2]}</p>`:""}<p class="note">${a}</p></details>`})():a}</div>`).join("")+(L.solar||[]).map(([k,v])=>`<div class="note"><b>${esc(k)}.</b> ${esc(v)}</div>`).join("")+`</div>`;
  $("solar").innerHTML=h}
const LVN={g:"Favorable",y:"Regular",r:"Desfavorable",n:"Informativo"};
function solarItems(){const F=L.kpfc,lh=st.mhour,fo=foF2est(lh),mo=(useMonth()||new Date().getUTCMonth()+1),ESM=[.05,.05,.08,.2,.55,.9,.85,.6,.2,.08,.05,.15][mo-1],kpn=kpAt(localNow());
  let nxt=[];if(F){const n=new Date(),d0=Math.round((Date.parse(n.toISOString().slice(0,10))-Date.parse(F.base))/864e5),b0=Math.floor(n.getUTCHours()/3);for(let i=0;i<8;i++){const d=d0+Math.floor((b0+i)/8),b=(b0+i)%8;if(F.blocks[d])nxt.push({k:F.blocks[d][b],ut:b*3})}}
  const kmax=nxt.length?Math.max(...nxt.map(x=>x.k)):L.kp,storm=nxt.filter(x=>x.k>=4.5),toLoc=ut=>hh((ut+todayOff())%24)+":00",it=[];
  it.push(["Índice Kp: próximas 24 horas",kmax<3?"g":kmax<4.5?"y":"r",`El Kp mide de 0 a 9 cuánto se agita el campo magnético de la Tierra. Con 5 o más hay tormenta (G1+): el viento solar comprime la magnetosfera, la ionosfera de latitudes altas pierde electrones y la MUF de los caminos que pasan cerca del polo baja. Máximo previsto: Kp ${Math.round(kmax)}${storm.length?" hacia las "+storm.map(x=>toLoc(x.ut)).join(", ")+" (hora local)":""}.`,
    storm.length?"en esas horas Norteamérica, Japón, Alaska y Escandinavia se oirán débiles, con QSB y la voz con eco «aguado». África, Sudamérica, el Caribe y el Índico apenas lo notan: es el momento de buscar DX hacia el sur.":kmax<3?"día tranquilo, el mejor para los caminos polares: Japón y la costa oeste de EE. UU. en 20 y 15 m, Alaska y el Pacífico norte por la mañana. De noche baja el ruido y 160 y 80 m dan su mejor DX.":"los caminos al norte pueden tener QSB a ratos. Si una estación de Norteamérica sube y baja, espera a que suba para pasar el reporte."]);
  if(L.bz!=null)it.push(["Bz: dirección del campo del viento solar",L.bz>=0?"g":L.bz>-5?"y":"r",`Bz es la componente norte-sur del campo magnético que trae el viento solar. Ahora ${L.bz} nT. Cuando es negativa (sur), se une al campo terrestre y deja entrar energía en la magnetosfera; positiva (norte), la Tierra queda protegida.`,
    L.bz<=-5?"si sigue al sur una o dos horas, el Kp subirá. Si estás trabajando Norteamérica o Japón, hazlo ya: puede cerrarse antes de lo previsto.":L.bz<0?"ligeramente al sur: vigila si se mantiene, porque puede empeorar los caminos al norte en unas horas.":"lo normal es que las condiciones aguanten estables las próximas horas."]);
  if(L.wind!=null)it.push(["Viento solar",L.wind<450?"g":L.wind<550?"y":"r",`Velocidad del plasma que sale del Sol: ahora ${L.wind} km/s (lo normal son 350–450). Por encima de 500 km/s, normalmente por un agujero coronal, empuja la magnetosfera y sube el Kp.`,
    L.wind>=500?"más ruido y QSB en 40, 80 y 160 m, sobre todo de noche. Las señales llegan con «aleteo»: repite el indicativo con calma y espera a los picos de señal.":"no molesta: por sí solo no estropea las bandas."]);
  it.push(["Flujo solar (SFI)",L.sfi>=110?"g":L.sfi>=90?"y":"r",`Radiación del Sol en 10,7 cm, que va de la mano de la radiación ultravioleta que crea la capa F. Ahora ${L.sfi} (SSN ${SSNV()}). A más flujo, más electrones en la capa F y más alta la MUF.`,
    L.sfi>=150?"10 m abierto a casi todo el mundo de día, incluso con QRP. Busca DX lejano en 10 y 12 m, que tienen menos QRM que 20 m.":L.sfi>=110?"de día, 15, 12 y 10 m abren hacia el sur y el oeste. Empieza por la banda más alta que esté abierta: hay menos gente y la señal llega con poca absorción.":L.sfi>=90?"de día, 20 y 17 m son las bandas fiables; 15 m solo a ratos hacia África y Sudamérica.":"de día lo seguro es 20 m; de noche, 40 m es la banda de DX."]);
  if(L.radio)it.push(["Llamaradas y apagones de radio (R)",L.radio.r12<20?"g":L.radio.r12<40?"y":"r",`Una llamarada emite rayos X que ionizan de golpe la capa D, la más baja, en todo el lado iluminado de la Tierra. La capa D absorbe la señal antes de que llegue a la F. Probabilidad hoy: ${L.radio.r12} % de R1–R2 y ${L.radio.r3} % de R3.`,
    "si de día todas las bandas se callan de golpe, empezando por las bajas, es una llamarada: no es tu equipo. Las altas (15–10 m) vuelven antes. Dura de 15 minutos a una hora, y un camino que va de noche (por ejemplo, al Pacífico de madrugada) sigue funcionando."]);
  it.push(["Protones (S)",!L.radio||L.radio.s1<10?"g":L.radio.s1<25?"y":"r",`Partículas muy energéticas de algunas llamaradas que entran por los polos y ionizan la capa D polar durante días. Probabilidad hoy de S1: ${L.radio?L.radio.s1:"—"} %.`,
    "los caminos que cruzan el Ártico (Japón, Alaska, costa oeste de EE. UU.) se cierran aunque el Kp esté bajo. Busca esos destinos por el camino largo o espera a que pase."]);
  it.push(["Después de una tormenta",kmax>=5||L.kp>=5?"y":"g","Tras una tormenta, la capa F tarda en recuperar sus electrones (fase negativa) y la MUF queda más baja. Justo antes de que llegue, a veces sube (fase positiva).",
    "el día después, las bandas altas abren más tarde y cierran antes, con la MUF un 10–30 % más baja durante uno o dos días. Si antes de la tormenta notas 10 m inusualmente abierto con el Kp subiendo, aprovéchalo."]);
  it.push(["E esporádica (Es)",ESM>=.5?"g":"n",`Nubes de ionización muy densa en la capa E, a unos 110 km, que reflejan 10 y 12 m a 1.000–2.300 km. En ${MESES[mo-1]}, la probabilidad media en Europa de alguna apertura en el día es de un ${Math.round(ESM*100)} % (climatología, no previsión).`,
    ESM>=.5?"es temporada: si 10 m se llena de repente de estaciones italianas, alemanas o inglesas a toda señal, es Es. Vigila 28.400–28.600 a media mañana y al atardecer; a veces enlaza con la capa F y da DX lejano.":"fuera de temporada: si 10 m se llena de repente de estaciones a 1.000–2.000 km, es Es y suele durar poco."]);
  it.push(["Aurora",kpn>=6?"y":"g",`Con tormentas fuertes, el óvalo auroral baja hacia el sur y su ionización refleja de forma irregular 10 m y 6 m. Ahora Kp ${kpn}.`,
    kpn>=6?"pueden oírse estaciones del norte de Europa con un sonido áspero, como un susurro: orienta la antena al norte, aunque estén al este u oeste.":"desde España hace falta Kp 6 o más para notarla; hoy no cuenta."]);
  if(fo)it.push([`Ionosfera sobre ti a las ${hh(lh)}:00`,fo>=7?"g":fo>=5?"y":"r",`foF2 ≈ ${fo.toFixed(1)} MHz sobre Francia y el norte de España${ionoSrc()?" (corregida con "+(ionoSrc()==="ionosonda"?"la ionosonda":"el clúster")+")":""}: es la frecuencia más alta que vuelve si transmites en vertical. Por encima de ella hay zona de silencio. Zona de silencio: ${BI().filter(b=>b>=1).map(b=>`${BANDS[b]} ${skipTxt(b,lh).replace("silencio hasta ","")}`).join(" · ")}.`,
    "si en 40 m no oyes a las estaciones de tu provincia pero sí a las de Francia, es la zona de silencio. Para contactos cercanos usa la banda más baja que no tenga silencio."]);
  return it}

/* ---------- balizas ---------- */
function renderBcn(){if(st.page!=="balizas"&&!st.ly.bcn)return;const {slot,left}=bcnNow(),lh=localNow();
  const data=BCN.map((b,i)=>{const t=nearestT([b[2],b[3]],0);const az=Math.round(brgJS(TXP,[b[2],b[3]])),km=Math.round(distJS(TXP,[b[2],b[3]]));const heard=(L.beacons||[]).filter(x=>x.call===b[0]);
    const ps=BFQ.map(([f,bi],k)=>{const q=prob(t,lh,bi,false);return {on:(slot-k+18)%18===i,p:q.p,na:q.na}});return {b,i,az,km,heard,ps,best:Math.max(...ps.map(x=>x.na?0:x.p))}});
  const nowOn=BFQ.map(([f,bi],k)=>{const d=data[(slot-k+18)%18],q=d.ps[k];return `<div class="bnow"><span class="bf" style="color:${BC[bi]}">${f}</span><b>${CS(d.b[0])}</b><span class="note">${esc(d.b[1])}</span><span class="bp ${cls(q.p)}">${q.na?"—":Math.round(q.p*100)+" %"}</span></div>`}).join("");
  const nOpen=data.filter(d=>d.best>=.3).length;
  $("bcn").innerHTML=`<h2>Balizas NCDXF/IARU</h2>
   <p class="bsum">Ahora mismo, en cada banda (cambian en <b>${left} s</b>):</p><div class="bnows">${nowOn}</div>
   <p class="bsum">Probabilidad de oír cada baliza a las ${hh(lh)}:00 · <b>${nOpen} de 18</b> con alguna banda ≥30 %${(L.beacons||[]).length?` · ${L.beacons.length} oídas hoy en Europa`:""}</p>
   <div class="scroll"><table class="bt btab"><tr><th>Baliza</th>${BFQ.map(([f,bi])=>`<th style="color:${BC[bi]}">${BANDS[bi]}</th>`).join("")}</tr>${data.map(d=>`<tr><td><b>${CS(d.b[0])}</b><div class="note">${esc(d.b[1])} · ${d.az}° ${cab(d.az)} · ${fk(d.km)} km${d.heard.length?` · <span class="agr ok">oída ${d.heard.map(x=>esc(x.f)+" "+esc(x.t)).join(", ")}</span>`:""}</div></td>${d.ps.map(q=>`<td class="bpc"><span class="bp ${cls(q.p)}${q.on?" bon":""}" title="${q.on?"Emitiendo ahora en esta banda":""}">${q.na?"—":Math.round(q.p*100)}</span></td>`).join("")}</tr>`).join("")}</table></div>
   <p class="note">Cifras en %: probabilidad de que la baliza te llegue a esta hora con el mismo modelo que tus QSO. Recuadro blanco: la baliza está emitiendo ahora en esa banda. Cada baliza transmite 10 s por banda en un ciclo de 3 minutos.</p>`;
  try{restoreWhy()}catch(e){}}
setInterval(()=>{if(document.hidden)return;if(st.page==="balizas")renderBcn();if(st.page==="mapa"&&st.ly.bcn&&st.mapOn)updBcnMarks()},5000);
/* ---------- fichas ---------- */
function head(hl){let h="<tr><th></th>";for(let x=0;x<24;x++)h+=`<th class="${x===hl?"now":""}">${hh(x)}</th>`;return h+"</tr>"}
function zoneTable(t,hl){let h=`<div class="scroll"><table class="hm"><thead>${head(hl)}</thead><tbody>`;
  const rows=lp=>{for(const b of BI().filter(b=>b<=10).slice().reverse()){h+=`<tr><th class="rh"><span style="color:${BC[b]}">●</span> ${BANDS[b]}</th>`;for(let x=0;x<24;x++){const r=prob(t,x,b,lp);h+=`<td class="${cls(r.p)} ${x===hl?"now":""}">${r.na?"—":pct(r.p)}</td>`}h+="</tr>"}};
  h+=`<tr><th class="rh" colspan="25" style="color:var(--accent)">Paso corto · rumbo ${t.az}° ${cab(t.az)} · ${fk(t.km)} km</th></tr>`;rows(false);
  h+=`<tr><th class="rh">MUF (MHz)</th>`;for(let x=0;x<24;x++)h+=`<td style="color:var(--muted)">${Math.round(prob(t,x,3).muf)}</td>`;h+="</tr>";
  if(t.l&&!useMonth()){h+=`<tr><th class="rh" colspan="25" style="color:var(--accent)">Paso largo · rumbo ${t.laz}° ${cab(t.laz)} · ${fk(t.lkm)} km</th></tr>`;rows(true)}
  return h+"</tbody></table></div>"}
function entOptions(sel){const g={NA:"Norteamérica y Caribe",SA:"Sudamérica",AF:"África",AS:"Asia",OC:"Oceanía",EU:"Europa"};return Object.entries(g).map(([c,n])=>`<optgroup label="${n}">${TG().filter(t=>t.cont===c).sort((a,b)=>a.name.localeCompare(b.name,"es")).map(x=>`<option value="${x.id}" ${x.id===sel?"selected":""}>${esc(x.name)}${entNeed(x)===true?" ★":""}</option>`).join("")}</optgroup>`).join("")}
function renderInfo(){const t=T(st.zone||"py")||TG()[0];
  $("info").innerHTML=`<h2>Ficha del destino <button class="btn" id="zmap" style="margin-left:8px;font-size:.8rem">Ver en el mapa</button></h2><label class="f" for="zsel" style="max-width:480px"><select id="zsel">${entOptions(t.id)}</select></label><h3 style="margin:8px 0 2px;font-size:1.3rem">${esc(t.name)} ${tags(t)}</h3>`+tBlock(t,st.mhour).replace(/<table>[\s\S]*<\/table>/,"")+zoneTable(t,st.mhour)+calBtns(t)+`<p class="note">Columnas: hora local. Recuadro naranja: hora elegida.</p>`;
  $("zsel").onchange=e=>{st.zone=e.target.value;store.set("pz",st.zone);renderInfo();renderExplorer()};
  $("zmap").onclick=()=>{go("mapa");openPop({k:"t",id:t.id})};
  $("info").querySelectorAll("[data-obs]").forEach(b=>b.onclick=()=>addObs(b.dataset.t,+b.dataset.b,b.dataset.obs==="1"));
  $("info").querySelectorAll("[data-undo]").forEach(b=>b.onclick=()=>{const [t,bb,h]=b.dataset.undo.split("|");undoObs(t,+bb,+h)});
  $("info").querySelectorAll("[data-goz]").forEach(b=>b.hidden=true)}
const pathP=(t,x,b)=>{const a=prob(t,x,b,false).p;if(st.path==="sp")return a;const c=prob(t,x,b,true).p;return st.path==="lp"?c:Math.max(a,c)};
function renderView(){document.querySelectorAll('.tabs .tab').forEach(b=>b.setAttribute("aria-selected",b.dataset.v===st.view));
  const BIH=BI().filter(b=>b<=10);if(!BIH.includes(st.tband))st.tband=BIH[Math.min(4,BIH.length-1)];
  if(st.view==="band"){const b=st.tband;let h=`<div class="seg" style="margin-bottom:8px">${BIH.map(i=>`<button data-tb="${i}" aria-pressed="${i===b}"><i style="background:${BC[i]}"></i>${BANDS[i]}</button>`).join("")}</div><p class="note" style="margin:0 0 6px">${st.path==="sp"?"Paso corto":st.path==="lp"?"Paso largo":"El mejor de los dos pasos"} · se muestran los 60 destinos con más probabilidad.</p>`;
    const list=TG().filter(inMode).map(t=>({t,ps:Array.from({length:24},(_,x)=>pathP(t,x,b))})).sort((a,c)=>Math.max(...c.ps)-Math.max(...a.ps)).slice(0,60);
    h+=`<div class="scroll"><table class="hm"><thead>${head(st.mhour)}</thead><tbody>`+list.map(r=>`<tr><th class="rh" title="${esc(r.t.name)} · corto ${r.t.az}° ${cab(r.t.az)} · largo ${r.t.laz}° ${cab(r.t.laz)}">${entNeed(r.t)===true||dxIn(r.t.id).length?"★ ":""}${esc(r.t.name)} <span style="color:var(--dim);font-family:var(--f-m);font-size:.75rem">${r.t.az}° ${cab(r.t.az)}/${r.t.laz}° ${cab(r.t.laz)}</span></th>`+r.ps.map((p,x)=>`<td class="${cls(p)} ${x===st.mhour?"now":""}">${pct(p)}</td>`).join("")+"</tr>").join("")+"</tbody></table></div>";
    $("view").innerHTML=h;document.querySelectorAll('[data-tb]').forEach(x=>x.onclick=()=>{st.tband=+x.dataset.tb;renderView()})}
  else{const lh=st.mhour;const rows=[];for(const t of TG().filter(inMode))for(const b of BIH)for(const lp of [false,true]){if(lp&&(!t.l||st.path==="sp"))continue;if(!lp&&st.path==="lp")continue;const r=prob(t,lh,b,lp);if(r.p>=.05)rows.push({t,b,lp,...r})}rows.sort((a,b)=>b.p-a.p);
    $("view").innerHTML=rows.length?`<div class="scroll"><table class="hm" style="min-width:620px"><thead><tr><th class="rh">Destino</th><th>Banda</th><th>Paso</th><th>%</th><th>MUF</th><th>Rumbo</th><th>km</th><th>Saltos</th></tr></thead><tbody>`+rows.slice(0,60).map(r=>{const hp=hopsAt(r.t,lh,r.b,r.lp);return `<tr><th class="rh">${esc(r.t.name)}${tags(r.t)}</th><td style="color:${BC[r.b]};font-weight:600">${BANDS[r.b]}</td><td>${r.lp?"largo":"corto"}</td><td class="${cls(r.p)}">${Math.round(r.p*100)}</td><td>${r.muf.toFixed(1)}</td><td>${r.lp?r.t.laz:r.t.az}° ${cab(r.lp?r.t.laz:r.t.az)}</td><td>${fk(r.lp?r.t.lkm:r.t.km)}</td><td>${hp?hp.n+" × "+fk(hp.len)+" km · "+hp.ang+"°":"—"}</td></tr>`}).join("")+"</tbody></table></div>":`<div class="empty">Nada por encima del 5 % a las ${hh(lh)}:00.</div>`}}

/* ---------- explorador de destinos ---------- */
const XS={q:"",cont:"",sort:"now",open:false,n:12};
const CONTL={EU:"Europa",AF:"África",AS:"Asia",NA:"Norteamérica",SA:"Sudamérica",OC:"Oceanía"};
function xAt(t,x){return memo("xa"+t.id+"|"+x,()=>{let r={p:0,b:-1};for(const b of BI())for(const lp of [false,true]){if(lp&&!t.l)continue;const v=prob(t,x,b,lp).p;if(v>r.p)r={p:v,b,lp}}return r})}
function xDay(t){return memo("xd"+t.id,()=>Array.from({length:24},(_,x)=>{let r={p:0,b:-1};for(const b of BI())for(const lp of [false,true]){if(lp&&!t.l)continue;const v=prob(t,x,b,lp).p;if(v>r.p)r={p:v,b,lp}}return r}))}
function compass(az,laz){const a=(az-90)*D2R,l=(laz-90)*D2R;return `<svg class="cmp" viewBox="-20 -20 40 40" aria-hidden="true"><circle r="17" class="cmpc"/><text y="-11" class="cmpn">N</text><line x1="0" y1="0" x2="${(15*Math.cos(l)).toFixed(1)}" y2="${(15*Math.sin(l)).toFixed(1)}" class="cmpl"/><line x1="0" y1="0" x2="${(15*Math.cos(a)).toFixed(1)}" y2="${(15*Math.sin(a)).toFixed(1)}" class="cmps"/><circle r="2.2" class="cmpo"/></svg>`}
function renderPrevExplorer(){const el=$("explo");if(!el)return;const lh=st.mhour;
  const q=XS.q.trim().toLowerCase();let list=TG().filter(t=>(!XS.cont||t.cont===XS.cont)&&(!q||t.name.toLowerCase().includes(q)||String(t.id).toLowerCase()===q||(t.pfx&&String(t.pfx).toLowerCase().startsWith(q))));
  const full=r=>{if(!r.d){r.d=xDay(r.t);r.bestH=r.d.reduce((m,x,i)=>x.p>r.d[m].p?i:m,0)}return r};
  let rows=list.map(t=>({t,n:xAt(t,lh)}));if(XS.sort==="day")rows.forEach(full);
  if(XS.open)rows=rows.filter(r=>r.n.p>=.3);
  const S={now:(a,b)=>(st.mode==="dx"?(inMode(b.t)?1:0)-(inMode(a.t)?1:0):0)||b.n.p-a.n.p,day:(a,b)=>b.d[b.bestH].p-a.d[a.bestH].p,km:(a,b)=>a.t.km-b.t.km,name:(a,b)=>a.t.name.localeCompare(b.t.name,"es")}[XS.sort];rows.sort(S);
  const tot=rows.length;rows=rows.slice(0,XS.n).map(full);
  el.innerHTML=`<h2>Explorador de destinos</h2>
  <div class="xbar"><input id="xq" type="search" placeholder="Busca un país o prefijo: Japón, VK, Brasil…" value="${esc(XS.q)}" aria-label="Buscar destino" autocomplete="off">
   <select id="xsort" aria-label="Ordenar"><option value="now">Más probable ahora</option><option value="day">Mejor momento del día</option><option value="km">Más cerca</option><option value="name">Por nombre</option></select>
   <label class="chk"><input type="checkbox" id="xopen" ${XS.open?"checked":""}> Solo abiertos ahora (≥30 %)</label></div>
  <div class="seg" style="margin:8px 0">${[["","Todos"],...Object.entries(CONTL)].map(([k,n])=>`<button data-xc="${k}" aria-pressed="${XS.cont===k}">${n}</button>`).join("")}</div>
  <p class="note" style="margin:0 0 8px">${tot} destino${tot===1?"":"s"} · ${hh(lh)}:00 hora local · ${MD().s}. Toca una para ver su ficha.</p>
  <div class="xgrid">${rows.map(({t,d,n,bestH})=>`<button class="xcard${st.zone===t.id?" on":""}" data-xz="${esc(t.id)}">
    <span class="xh">${compass(t.az,t.laz)}<span class="xn"><b>${esc(t.name)}</b><span class="note">${CONTL[t.cont]||""} · ${t.az}° ${cab(t.az)} · ${fk(t.km)} km</span></span><span class="xp ${cls(n.p)}">${n.b>=0&&n.p>=.05?Math.round(n.p*100)+"%":"–"}</span></span>
    <span class="xb">${n.b>=0&&n.p>=.05?`<span style="color:${BC[n.b]}">● ${BANDS[n.b]}</span>${n.lp?" · paso largo":""}`:"Cerrado ahora"} · mejor a las ${hh(bestH)}:00${d[bestH].b>=0?" en "+BANDS[d[bestH].b]:""}</span>
    <span class="xs">${d.map((x,i)=>`<i class="${cls(x.p)}${i===lh?" now":""}" title="${hh(i)}:00 · ${x.b>=0?BANDS[x.b]+" "+Math.round(x.p*100)+" %":"cerrado"}"></i>`).join("")}</span></button>`).join("")||`<div class="empty">Ningún destino con esos filtros.</div>`}</div>
  ${tot>XS.n?`<p style="text-align:center;margin:10px 0 0"><button class="btn" id="xmore">Ver más (${tot-XS.n} más)</button></p>`:""}`;
  $("xsort").value=XS.sort;
  const qi=$("xq");qi.oninput=()=>{XS.q=qi.value;XS.n=12;const pos=qi.selectionStart;renderExplorer();const n2=$("xq");n2.focus();try{n2.setSelectionRange(pos,pos)}catch(e){}};
  $("xsort").onchange=e=>{XS.sort=e.target.value;renderExplorer()};$("xopen").onchange=e=>{XS.open=e.target.checked;renderExplorer()};
  el.querySelectorAll("[data-xc]").forEach(x=>x.onclick=()=>{XS.cont=x.dataset.xc;XS.n=12;renderExplorer()});
  if($("xmore"))$("xmore").onclick=()=>{XS.n+=24;renderExplorer()};
  el.querySelectorAll("[data-xz]").forEach(x=>x.onclick=()=>{st.zone=x.dataset.xz;store.set("pz",st.zone);selTab("fichas","f_info",true);renderInfo();const i=$("info");if(i)i.scrollIntoView({behavior:"smooth",block:"start"})})}

/* ===== Ciclo solar, cotejo de fuentes, contraste de bandas y ayudas de uso ===== */
const MESC=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const CYC=(()=>{try{return JSON.parse(document.getElementById("cycdata").textContent)}catch(e){return null}})();
const cIdx=m=>{const [y,mo]=String(m).split("-").map(Number);return (y-2008)*12+mo-1};
const cLbl=i=>MESC[((i%12)+12)%12]+" "+(2008+Math.floor(i/12));
const n1=v=>v==null?"—":(Math.round(v*10)/10).toLocaleString("es-ES");
/* series del ciclo: datos incrustados + lo que traiga la actualización en vivo (L.cycle) */
function cycData(){if(!CYC)return null;return memo("cyc|"+(L.cycle?JSON.stringify(L.cycle):""),()=>{const s0=cIdx(CYC.start);const m=[],ms=[],pb=[];
  CYC.m.forEach((v,i)=>{m[s0+i]=v});CYC.ms.forEach((v,i)=>{ms[s0+i]=v});CYC.pb.forEach((v,i)=>{pb[s0+i]=v});
  const c=L.cycle;if(c){if(c.monthly)Object.entries(c.monthly).forEach(([k,v])=>{if(v!=null&&isFinite(+v))m[cIdx(k)]=+v});if(c.smoothed)Object.entries(c.smoothed).forEach(([k,v])=>{if(v!=null&&isFinite(+v)){ms[cIdx(k)]=+v;pb[cIdx(k)]=null}})}
  const nb=[],n0=cIdx(CYC.noaa.start);CYC.noaa.v.forEach((v,i)=>{nb[n0+i]=v});
  if(L.ssnPred)Object.entries(L.ssnPred).forEach(([k,v])=>{const i=cIdx(k);if(nb[i]&&isFinite(+v))nb[i]=[+v,nb[i][1],nb[i][2]]});
  let lastS=-1;ms.forEach((v,i)=>{if(v!=null)lastS=i});let lastM=-1;m.forEach((v,i)=>{if(v!=null)lastM=i});
  return {m,ms,pb,nb,lastS,lastM}})}
function nowIdx(){const d=new Date();return (d.getUTCFullYear()-2008)*12+d.getUTCMonth()}
function cycChart(D,W){W=W||800;const N=W<600,H=N?320:300,l=38,r=12,t=14,b=30,X0=0,X1=cIdx("2031-01"),Y1=220;
  const x=i=>l+(i-X0)/(X1-X0)*(W-l-r),y=v=>t+(1-v/Y1)*(H-t-b);const now=nowIdx();
  const line=(arr,from,to)=>{let p="",on=false;for(let i=from;i<=to;i++){const v=arr[i];if(v==null){on=false;continue}p+=(on?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1);on=true}return p};
  let s=`<svg viewBox="0 0 ${W} ${H}" class="cycsvg" role="img" aria-label="Número de manchas solares de 2008 a 2030: observado, suavizado y previsiones">`;
  for(const v of [50,100,150,200])s+=`<line x1="${l}" x2="${W-r}" y1="${y(v)}" y2="${y(v)}" class="cg"/><text x="${l-6}" y="${y(v)+4}" class="cyt">${v}</text>`;
  for(let yr=2008;yr<=2030;yr+=N?4:2){const i=(yr-2008)*12;s+=`<line x1="${x(i)}" x2="${x(i)}" y1="${H-b}" y2="${H-b+4}" class="cg"/><text x="${x(i)}" y="${H-b+17}" class="cyx">${yr}</text>`}
  /* banda de NOAA (alta-baja) */
  const nIs=[];D.nb.forEach((v,i)=>{if(v)nIs.push(i)});if(nIs.length){const up=nIs.map(i=>x(i).toFixed(1)+","+y(D.nb[i][1]).toFixed(1)),dn=nIs.slice().reverse().map(i=>x(i).toFixed(1)+","+y(D.nb[i][2]).toFixed(1));s+=`<polygon points="${up.concat(dn).join(" ")}" class="cnb"/>`}
  /* barras mensuales */
  const bw=Math.max(1,(W-l-r)/(X1-X0)*.8);D.m.forEach((v,i)=>{if(v!=null)s+=`<rect x="${(x(i)-bw/2).toFixed(1)}" y="${y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(0)-y(v)).toFixed(1)}" class="cbar"/>`});
  s+=`<path d="${line(D.ms,0,X1)}" class="cms"/>`;
  const pbArr=D.pb.slice();if(D.lastS>=0)pbArr[D.lastS]=D.ms[D.lastS];s+=`<path d="${line(pbArr,D.lastS,X1)}" class="cpb"/>`;
  const nArr=[];D.nb.forEach((v,i)=>{if(v)nArr[i]=v[0]});s+=`<path d="${line(nArr,0,X1)}" class="cpn"/>`;
  /* hitos */
  const mk=(i,v,txt,dy)=>`<circle cx="${x(i)}" cy="${y(v)}" r="4" class="cmk"/><text x="${x(i)}" y="${y(v)+dy}" class="cma">${txt}</text>`;
  s+=mk(cIdx("2014-04"),116.4,N?"Ciclo 24":"Máx. ciclo 24 · 116,4",-10)+mk(cIdx("2024-10"),160.9,N?"Ciclo 25":"Máx. ciclo 25 · 160,9",-10)+mk(cIdx("2008-12"),2.2,"Mín. 2008",-8)+mk(cIdx("2019-12"),1.8,"Mín. 2019",-8);
  s+=`<line x1="${x(now)}" x2="${x(now)}" y1="${t}" y2="${H-b}" class="cnow"/><text x="${x(now)+5}" y="${t+10}" class="cnt">HOY</text>`;
  s+=`<rect x="${l}" y="${t}" width="${W-l-r}" height="${H-t-b}" fill="transparent" class="chit"/></svg>`;return s}
function cycTip(D,i){const p=[cLbl(i)];if(D.m[i]!=null)p.push("mensual "+n1(D.m[i]));if(D.ms[i]!=null)p.push("suavizado "+n1(D.ms[i]));else if(D.pb[i]!=null)p.push("previsión BOM "+n1(D.pb[i]));if(D.nb[i])p.push("previsión NOAA "+n1(D.nb[i][0])+" ("+n1(D.nb[i][2])+"–"+n1(D.nb[i][1])+")");return p.join(" · ")}
function bandsForSSN(v){if(v>=100)return "10 y 12 m abren casi a diario de sol a sol, también hacia Norteamérica y Asia. Es la mejor época para el DX en bandas altas.";
  if(v>=60)return "10 y 12 m abren muchos días a mediodía, sobre todo en otoño y primavera y hacia el sur. 15 y 17 m son las más fiables de día y 20 m aguanta de día y buena parte de la noche.";
  if(v>=30)return "10 m abre sobre todo hacia el sur y, en verano, por esporádica E. 15 y 17 m mandan de día, y 40 y 80 m ganan peso de noche.";
  return "Las bandas altas abren poco. 20 m es la banda del día, y 40, 80 y 160 m dan su mejor DX de noche por el bajo ruido y la poca absorción."}
function renderCycle(){const el=$("cycle");if(!el)return;const CW=(el.clientWidth||800)<600?440:800;const D=cycData();if(!D){el.innerHTML="";return}
  const now=nowIdx(),iMax=cIdx("2024-10"),iMin=cIdx("2019-12"),sinceMax=now-iMax,sinceMin=now-iMin;
  const sm=D.ms[D.lastS],pct=Math.round(sm/160.9*100);const estNow=D.pb[now]!=null?D.pb[now]:D.ms[now];const nNow=D.nb[now]?D.nb[now][0]:null;
  const b12=D.pb[now+12],n12=D.nb[now+12]?D.nb[now+12][0]:null;const est=estNow!=null&&nNow!=null?(estNow+nNow)/2:(estNow??nNow??sm);
  const endI=cIdx("2030-12"),prog=Math.max(0,Math.min(100,Math.round(sinceMin/(endI-iMin)*100)));
  const fall=estNow!=null&&b12!=null?Math.round(estNow-b12):null;
  const ag=(a,b)=>a!=null&&b!=null?(Math.abs(a-b)<=Math.max(8,.12*Math.max(a,b))?`<span class="agr ok">coinciden</span>`:`<span class="agr dif">difieren ${n1(Math.abs(a-b))}</span>`):"";
  el.innerHTML=`<h2>Ciclo solar 25: dónde estamos</h2>
  <p class="cyclead"><b>Fase de bajada</b> · ${sinceMax} meses tras el máximo (oct 2024, 160,9 manchas). Próximo mínimo hacia <b>2030–2031</b>.</p>
  <div class="cprog" role="img" aria-label="Avance del ciclo: ${prog} %"><div class="cpbar"><i style="width:${prog}%"></i><b style="left:${Math.round((iMax-iMin)/(endI-iMin)*100)}%" title="Máximo, oct 2024"></b></div><div class="cplab"><span>Mín. dic 2019</span><span>Máx. oct 2024</span><span>Mín. previsto ≈ 2030–31</span></div></div>
  <div class="kv cykv">
   <div class="chip"><div class="k">Último suavizado oficial</div><div class="v">${n1(sm)}</div><div class="t">${cLbl(D.lastS)} · ${pct} % del máximo</div></div>
   <div class="chip"><div class="k">Último mes completo</div><div class="v">${n1(D.m[D.lastM])}</div><div class="t">${cLbl(D.lastM)}</div></div>
   <div class="chip"><div class="k">Estimado para este mes</div><div class="v">${n1(est)}</div><div class="t">BOM ${n1(estNow)} · NOAA ${n1(nNow)} ${ag(estNow,nNow)}</div></div>
   <div class="chip"><div class="k">Dentro de 12 meses</div><div class="v">${n1(b12!=null&&n12!=null?(b12+n12)/2:(b12??n12))}</div><div class="t">BOM ${n1(b12)} · NOAA ${n1(n12)} ${ag(b12,n12)}${fall!=null?` · baja unas ${fall} manchas en un año`:""}</div></div>
  </div>
  <div class="cychart">${cycChart(D,CW)}<p class="cytip note" id="cytip">Toca la gráfica para ver cada mes.</p>
  <p class="cyleg"><span class="lg lb">Media mensual</span><span class="lg ls">Media suavizada (13 meses)</span><span class="lg lpb">Previsión BOM (Australia)</span><span class="lg lpn">Previsión NOAA (EE. UU.) y su margen</span></p></div>
  <h3 class="cyh">Qué significa para tus bandas</h3><p>Con unas ${Math.round(est)} manchas: ${bandsForSSN(est)} Lo que manda cada día es el flujo solar (SFI) y el Kp de arriba: un día con SFI alto abre más que la media del ciclo.</p>
  <details class="mdet"><summary>Cómo se compara con otros ciclos</summary><div class="cycmp">${CYC.cyc.map(([n,mi,mv,ma,mx])=>{const rise=cIdx(ma)-cIdx(mi);return `<div class="ccr${n===25?" on":""}"><span>Ciclo ${n}</span><i style="width:${Math.round(mx/285*100)}%"></i><b>${n1(mx)}</b><em>${MESC[+ma.slice(5)-1]} ${ma.slice(0,4)} · subida ${Math.floor(rise/12)} años y ${rise%12} meses</em></div>`}).join("")}</div><p class="note">El 25 ha superado al 24 (116,4) y a la previsión oficial de 2019, que esperaba entre 105 y 125. Aun así, queda por debajo de los ciclos 19, 21, 22 y 23.</p></details>
  <p class="note csrc">Manchas: <b>SILSO</b> (Real Observatorio de Bélgica), que fija el máximo en 160,9 en octubre de 2024. Coincide con el <b>BOM Space Weather Services</b> de Australia. Previsiones: BOM (${esc((CYC.issued||"").split("·")[0].replace("BOM SWS","").trim())}) y <b>NOAA SWPC</b>. Cuando las dos difieren, la cifra grande es la media de ambas.</p>`;
  foldAfter(el,5,"Qué significa para tus bandas, comparativa y fuentes");
  const svg=el.querySelector(".cycsvg"),tip=$("cytip");const mv=ev=>{const r=svg.getBoundingClientRect();const pt=(ev.touches?ev.touches[0]:ev);const fx=(pt.clientX-r.left)/r.width*CW;const i=Math.round((fx-38)/(CW-50)*cIdx("2031-01"));if(i>=0&&i<=cIdx("2031-01"))tip.textContent=cycTip(D,i)};
  svg.addEventListener("pointermove",mv);svg.addEventListener("touchstart",mv,{passive:true})}

/* ---------- cotejo: el mismo dato en varias fuentes ---------- */
const COTN={sfi:["Flujo solar (SFI)","",6],kp:["Kp ahora","",1],a:["Índice A","",5],ssn:["Manchas (SSN del día)","",20],wind:["Viento solar","km/s",60],bz:["Bz","nT",2.5],dens:["Densidad del viento","p/cm³",3],xray:["Rayos X","",0],fof2:["foF2 sobre España","MHz",.8],muf:["MUF(3000) sobre España","MHz",2.5],essn:["SSN efectivo","",15]};
const med=a=>{const s=a.slice().sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2};
function cotejoRows(){const C=L.cotejo&&L.cotejo.vals;if(!C)return [];return Object.entries(C).filter(([k,v])=>COTN[k]&&Array.isArray(v)&&v.length).map(([k,src])=>{const [n,u,tol]=COTN[k];
  const nums=src.map(x=>+x[1]).filter(v=>isFinite(v));let used,ok,txt;
  if(k==="xray"||!nums.length){const vals=src.map(x=>String(x[1]).toUpperCase().trim());const cnt={};vals.forEach(v=>cnt[v[0]||v]=(cnt[v[0]||v]||0)+1);const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];used=vals.find(v=>(v[0]||v)===top[0]);ok=top[1]===vals.length;txt=ok?"misma clase":"se usa la clase más repetida"}
  else{used=med(nums);const sp=Math.max(...nums)-Math.min(...nums);ok=sp<=tol;txt=nums.length<2?"una sola fuente":ok?"coinciden":`difieren ${n1(sp)}${u?" "+u:""}; se usa el valor central`;used=Math.round(used*10)/10}
  return {k,n,u,src,used,ok:nums.length<2&&k!=="xray"?null:ok,txt}})}
function cotejoBadge(k){const r=cotejoRows().find(x=>x.k===k);if(!r||r.src.length<2)return "";return ` <span class="agr ${r.ok?"ok":"dif"}" title="${esc(r.src.map(s=>s[0]+": "+s[1]).join(" · "))}">${r.src.length} fuentes${r.ok?"":" ≠"}</span>`}
function renderCotejo(){const el=$("cotejo");if(!el)return;const R=cotejoRows();
  if(!R.length){el.innerHTML=`<p class="note">Cada dato se compara en varias webs públicas en cada actualización. En cuanto llegue la primera ronda verás aquí cada valor con sus fuentes.</p>`;return}
  const nOk=R.filter(r=>r.ok).length,nC=R.filter(r=>r.ok!=null).length;
  {const sm=$("cotejos");if(sm)sm.textContent=`${nOk} de ${nC} coinciden`}spaceBadges(R);
  el.innerHTML=`<p class="note" style="margin-top:0">Cada dato se lee en varias webs independientes y se usa el valor en el que coinciden (el valor central o el más repetido). <b>${nOk} de ${nC}</b> datos coinciden entre fuentes${L.cotejo.at?` · revisado ${esc(String(L.cotejo.at).slice(11,16))} UTC`:""}.</p>
  <div class="scroll"><table class="bt cotab"><tr><th>Dato</th><th>Valor usado</th><th>Fuentes</th><th>Resultado</th></tr>${R.map(r=>`<tr><td>${r.n}</td><td><b>${esc(String(r.used).replace(".",","))}</b>${r.u?" "+r.u:""}</td><td class="note">${r.src.map(s=>`${esc(s[0])}: <b>${esc(String(s[1]).replace(".",","))}</b>`).join(" · ")}</td><td><span class="agr ${r.ok==null?"":r.ok?"ok":"dif"}">${r.txt}</span></td></tr>`).join("")}</table></div>`}

/* ---------- contraste: modelo vs HamQSL vs lo que se oye en el clúster ---------- */
const HQG={0:"80m-40m",1:"80m-40m",2:"80m-40m",9:"30m-20m",3:"30m-20m",4:"17m-15m",5:"17m-15m",6:"12m-10m",7:"12m-10m"};
const lvl=s=>({good:2,fair:1,poor:0,"band closed":0,closed:0})[String(s||"").toLowerCase()];
function renderContrast(){const el=$("contra");if(!el)return;const lh=localNow(),se=sunEvents(TXP),day=se.rise!=null&&se.set!=null?(lh>=se.rise&&lh<se.set):lh>=8&&lh<18;
  const HQ=L.cotejo&&L.cotejo.hamqsl;const now=Date.now();const ref=Date.parse([L.spotsChecked,L.spotsUTC,L.updatedUTC].filter(Boolean).sort().pop()||"")||now;
  const rows=BI0().filter(b=>b<=10).map(b=>{let mx=0;for(const t of TG().filter(inMode)){const a=prob(t,lh,b,false).p,c=t.l?prob(t,lh,b,true).p:0;if(a>mx)mx=a;if(c>mx)mx=c}
    const m=mx>=.3?2:mx>=.1?1:0;let h=null;if(HQ){const g=b===10?HQ["6m"]:HQG[b]&&HQ[HQG[b]];if(g!=null){const v=Array.isArray(g)?g[day?0:1]:g;h=lvl(v);if(b===10&&h==null)h=/es|open|abierta/i.test(String(v))?2:0}}
    const sp=(L.spots||[]).filter(s=>s.band===b&&(s.kind==="dx"||s.kind==="ind"||s.kind==="vhf")).filter(s=>{const a=spotAge(s);return a==null||a<=60}).length;const c=sp>=3?2:sp>=1?1:0;
    const wn=wsprN(b),w=wn==null?null:wn>=20?2:wn>=3?1:0;
    const vs=[m,h,c,w].filter(v=>v!=null);const op=vs.filter(v=>v>=1).length,cl=vs.length-op;const v=op===vs.length?"ok":cl===vs.length?"cl":"mx";
    return {b,mx,m,h,sp,c,wn,w,v,txt:v==="ok"?(vs.every(x=>x===2)?"Abierta":"Floja"):v==="cl"?"Cerrada":c===2&&m===0?"Mejor de lo previsto":m>=1&&c===0?"Abierta, sin spots":"Dudosa"}});
  const W=["cerrada","floja","abierta"],WC=["cl","mx","ok"];
  {const op=rows.filter(r=>r.v==="ok"),all=op.filter(r=>[r.m,r.h,r.c].every(x=>x==null||x===2));const lst=x=>x.map(r=>BANDS[r.b].replace(/\s+m$/,"")).join(", ")+" m";
   setSum("contra",op.length?`Abiertas: ${lst(op)}`+(all.length?` · todas las fuentes coinciden en ${lst(all)}`:""):"Ninguna banda abierta según las fuentes")}
  el.innerHTML=`<h2>Tus bandas ahora</h2>
  <div class="scroll"><table class="bt cotab ctab"><tr><th>Banda</th><th>Plataforma</th><th>HamQSL</th><th>Spots 1 h</th><th>WSPR 1 h</th><th>Conclusión</th></tr>${rows.map(r=>`<tr><td style="color:${BC[r.b]};font-weight:700">${BANDS[r.b]}</td><td data-l="Plataforma"><span class="dot ${WC[r.m]}"></span><span class="ww">${W[r.m]} </span><span style="white-space:nowrap">${Math.round(r.mx*100)} %</span></td><td data-l="HamQSL">${r.h==null?'<span class="note">sin dato</span>':`<span class="dot ${WC[r.h]}"></span><span class="ww">${W[r.h]}</span>`}</td><td data-l="Clústeres"><span class="dot ${WC[r.c]}"></span>${r.sp}<span class="ww"> spot${r.sp===1?"":"s"}</span></td><td data-l="WSPR">${r.w==null?'<span class="note">—</span>':`<span class="dot ${WC[r.w]}"></span>${r.wn}`}</td><td><span class="agr ${r.v==="ok"?"ok":r.v==="cl"?"":"dif"}">${r.txt}</span></td></tr>`).join("")}</table></div>
  <details class="why"><summary>Ver por qué</summary><p>Tres opiniones independientes a las ${hh(lh)}:00: la predicción de esta plataforma para tu estación, la de <b>HamQSL</b> (N0NBH, ${day?"de día":"de noche"}), lo que se oye en los clústeres en la última hora y las señales WSPR de más de 2.500 km recibidas en Europa (wspr.live).</p><p class="note">Si el clúster oye una banda que el modelo da cerrada, la ionosfera está mejor que la media del mes y la plataforma sube la MUF de las horas próximas. HamQSL da una previsión general por grupos de bandas, no para tu antena.</p></details>`}

/* ---------- ayudas para empezar ---------- */
const PGHELP={facil:"Lo esencial en un vistazo: qué banda usar ahora, cuándo será mejor y hacia dónde apuntar.",ahora:"Tus bandas en este momento, qué hacer y si las fuentes coinciden.",mapa:"Dónde llega tu señal: elige qué ver (2), el modo (3), las bandas (4) y la hora (5).",dx:"Lo que se está oyendo ahora en los clústeres del mundo, con lo nuevo marcado.",concursos:"Plan de bandas hora a hora para el próximo concurso. Activa «Modo concursos» arriba.",sol:"El Sol hoy, cómo afecta a la radio y en qué punto del ciclo solar estamos.",balizas:"Las balizas NCDXF: si oyes una, el camino hacia ese lugar está abierto.",fichas:"Busca un país y mira su probabilidad hora a hora y banda a banda.",metodo:"Cómo se calcula todo y de dónde salen los datos."};
function renderPgHelp(){}
function initStart(){const e=$("start");if(!e)return;if(store.get("startOk")==="1"){e.hidden=true;return}e.hidden=false;
  e.innerHTML=`<div class="stt"><b>Empieza en 3 pasos</b><button class="lnk" id="stx">Entendido, no mostrar más</button></div><ol class="stl">
   <li><b>Tu estación:</b> pulsa «Cambiar» arriba y pon tu locator, modo, potencia y antena. Todo se recalcula para ti.</li>
   <li><b>Mira el resultado:</b> <button class="lnk" data-go="ahora">Ahora</button> te dice qué banda usar y hacia dónde apuntar; <button class="lnk" data-go="dx">DX</button>, quién está en el aire.</li><li><b>Opcional, tu log:</b> pulsa «Subir log» arriba y elige tu ADIF de QRZ. La web te marcará las entidades y bandas que te faltan.</li></ol>`;
  $("stx").onclick=()=>{store.set("startOk","1");e.hidden=true};e.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go))}

/* ---------- cabecera en una línea ---------- */
function renderSum(){const e=$("ssum");if(!e)return;const loc=String($("loc").value||"").slice(0,6);const h=HB();
  e.innerHTML=`<b>${esc(loc)}</b> · ${esc(MD().s)} · ${h!=null?esc(BANDS[h]):"Todas las bandas"} · ${esc(PWN().split(" ")[0]+" "+PWN().split(" ")[1])} · ${esc(ANTL())}${st.mode==="contest"?" · <b>Concursos</b>":""}`}
{const b=$("stbtn"),p=$("stpanel");if(b&&p)b.onclick=()=>{p.hidden=!p.hidden;b.setAttribute("aria-expanded",String(!p.hidden));b.textContent=p.hidden?"Cambiar":"Cerrar";if(!p.hidden)p.scrollIntoView({block:"nearest"})}}
/* ---------- solo la conclusión: el resto, plegado ---------- */
function foldAfter(el,keep,label){if(!el||el.querySelector(":scope > details.why"))return;const kids=[...el.children].slice(keep);if(!kids.length)return;const d=document.createElement("details");d.className="why";d.innerHTML=`<summary>${label||"Ver por qué"}</summary>`;kids.forEach(k=>d.appendChild(k));el.appendChild(d)}

const SPK2={"SFI · flujo solar":"sfi","Manchas (SSN)":"ssn","Kp ahora":"kp","Índice A":"a","Viento solar":"wind","Bz":"bz","Rayos X (GOES)":"xray"};
function spaceBadges(R){const sp=$("space");if(!sp)return;sp.querySelectorAll(".chip .k").forEach(k=>{const key=SPK2[k.textContent.trim()]||SPK2[Object.keys(SPK2).find(x=>x.toUpperCase()===k.textContent.trim().toUpperCase())];if(!key||k.querySelector(".agr"))return;const r=R.find(x=>x.k===key);if(r&&r.src.length>1)k.insertAdjacentHTML("beforeend",` <span class="agr ${r.ok?"ok":"dif"}" title="${esc(r.src.map(s=>s[0]+": "+s[1]).join(" · "))}">${r.src.length} fuentes</span>`)})}

function spaceExplain(){const sp=$("space");if(!sp||sp.querySelector(":scope > details.why.spx"))return;const it=[...sp.querySelectorAll(".chip")].map(c=>{const k=c.querySelector(".k"),t=c.querySelector(".t");return k&&t?`<p><b>${esc(k.firstChild?k.firstChild.textContent.trim():"")}:</b> ${t.innerHTML}</p>`:""}).join("");
  const kv=sp.querySelector(".kv");if(!kv||!it)return;kv.insertAdjacentHTML("afterend",`<details class="why spx"><summary>Qué significa cada valor</summary>${it}</details>`)}

/* listas largas: se ven las primeras y un botón para el resto */
const LLOPEN=new Set();
function limitList(el,n,what){if(!el)return;const it=[...el.children].filter(c=>!c.classList.contains("llmore"));if(it.length<=n+2||LLOPEN.has(el.id))return;
  it.slice(n).forEach(c=>c.hidden=true);const b=document.createElement("button");b.className="btn llmore";b.textContent=`Ver ${it.length-n} ${what} más`;b.onclick=()=>{LLOPEN.add(el.id);it.forEach(c=>c.hidden=false);b.remove()};el.appendChild(b)}

/* ---------- desplegables con su conclusión en el título ---------- */
const firstSent=(el,max=110)=>{if(!el)return "";const c=el.cloneNode(true);c.querySelectorAll("h2,details,button,.note.src").forEach(x=>x.remove());let t=(c.textContent||"").replace(/\s+/g," ").trim();const m=t.match(/^.*?[a-záéíóúñ0-9)%»][.!](?=\s|$)/);t=m?m[0]:t;return t.length>max?t.slice(0,max-1).replace(/\s\S*$/,"")+"…":t};
function setSum(id,txt){const e=$("s_"+id);if(e&&e.textContent!==txt)e.textContent=txt}
function foldSums(){try{const pg=st.page,now=localNow();
  if(pg==="ahora"){tidyRec();const hs=[];for(let x=now+1;x<now+13;x++)hs.push(x%24);
    if(hs.every(ezDone)){let best=null;for(const h of hs){const e=easyAt(h);if(e&&(!best||e.sc>best.e.sc))best={h,e}}
      setSum("tl","")}else{clearTimeout(foldSums.t);foldSums.t=setTimeout(foldSums,500)}
    setSum("rec","");
    setSum("vhf",[10,11,12].map(b=>{const [lv,t]=vhfStatus(b);return BANDS[b]+": "+String(t).replace(/\.$/,"")}).join(" · "));
    const s=sunEvents(TXP);setSum("qth",`Sol ${hm(s.rise)}–${hm(s.set)}`+(L.iono&&L.iono.mufd?` · MUF ${L.iono.mufd} MHz`:"")+(L.essn!=null?` · SSN efectivo ${Math.round(L.essn)}`:""))}
  if(pg==="mapa"){const ly=!st.mapOn?[]:[st.ly.voa&&"Predicción",st.ly.spots&&"Clúster",st.ly.bcn&&"Balizas",st.ly.dxp&&"DXpediciones"].filter(Boolean);const mb=(typeof MBS==="function"&&MBS())||[];
    const ms=$("mapsum");if(ms)ms.textContent=`${ly.length?ly.join(", "):"Nada elegido"} · ${CMSTXT()} · ${mb.length&&mb.length<BI0().length?mb.map(x=>BANDS[x]).join(", "):"todas las bandas"} · ${hh(st.mhour)}:00`}
  if(pg==="dx"){{const it=((L.alert&&L.alert.items)||[]).filter(x=>!window.ACRACB_alOK||ACRACB_alOK(x));setSum("al",it.length?`${it.length} aviso${it.length===1?"":"s"}: ${it.slice(0,2).map(x=>x.call+" "+(BANDS[x.band]||"")).join(", ")}`:"Sin avisos ahora")}const nr=SPOTS().filter(s=>spotKind(s)==="near").length;setSum("near",nr?`${nr} spot${nr===1?"":"s"} de EA, CT y alrededores en ${CMSTXT()}`:"Sin spots cercanos ahora");
    const ds=(L.dx||[]).filter(dxNew).map(d=>{const t=tFor(d);return t?{d,...bestAny(t,now)}:null}).filter(Boolean).sort((a,b)=>b.p-a.p);
    setSum("dxp",ds.length?`${ds.length} activas · mejor ahora: ${ds[0].d.call} en ${BANDS[ds[0].b]} (${Math.round(ds[0].p*100)} %)`:"Ninguna activa ahora")}
  if(pg==="sol"){setSum("space","");setSum("cycle","");const F=L.kpfc;let mx=null;if(F){const all=F.blocks.flat();const nd=Math.round((Date.parse(new Date().toISOString().slice(0,10))-Date.parse(F.base))/864e5),nb=Math.floor(new Date().getUTCHours()/3);const i0=nd*8+nb;const nx=all.slice(Math.max(0,i0),i0+8);if(nx.length)mx=Math.max(...nx)}
    let bad=0;try{bad=solarItems().filter(x=>x[1]==="r").length}catch(e){}
    setSum("solar",(mx!=null?`Kp máximo en 24 h: ${String(Math.round(mx*10)/10).replace(".",",")}${mx>=5?" (tormenta)":""}`:"")+(bad?` · ${bad} aviso${bad===1?"":"s"} desfavorable${bad===1?"":"s"}`:" · sin avisos graves"))}
  if(pg==="concursos"){{const cp=$("c_plan");if(cp)cp.hidden=st.mode!=="contest"}["cscore","cpause","tricks"].forEach(id=>{const el=$(id),f=$("f_"+id);if(f)f.hidden=!(el&&el.textContent.trim());const ch=el?[...el.querySelectorAll(".chip")].slice(0,3):[];setSum(id,ch.length?ch.map(c=>{const k=c.querySelector(".k"),v=c.querySelector(".v");return (k?k.textContent.trim():"")+": "+(v?v.textContent.trim():"")}).join(" · "):firstSent(el))});
    try{const l=CAL.map(c=>({c,d:calNext(c)})).filter(x=>x.d).sort((a,b)=>a.d.st-b.d.st);if(l.length){const x=l[0],dd=Math.ceil((x.d.st-new Date())/864e5);setSum("ccal",`${l.length} concursos en los próximos 12 meses · próximo: ${x.c[0]}, ${dd<=0?"en curso":"en "+dd+" días"}`)}}catch(e){}}
  if(pg==="fichas"){const z=$("zsel");setSum("info",z&&z.selectedOptions[0]?z.selectedOptions[0].textContent.replace(" ★",""):"")}
 }catch(e){}try{syncTabs()}catch(e){}try{restoreWhy()}catch(e){}}
/* recuerda qué desplegables dejas abiertos */
document.querySelectorAll("details.fold[id]").forEach(d=>{try{if(localStorage.getItem("fold:"+d.id)==="1")d.open=true}catch(e){}d.addEventListener("toggle",()=>{try{localStorage.setItem("fold:"+d.id,d.open?"1":"0")}catch(e){}})});

/* ajustes del mapa: abiertos en pantallas grandes */
{const d=$("mapctlw");if(d){const mq=window.matchMedia("(min-width:1000px)");const set=()=>{if(mq.matches)d.open=true};set();try{mq.addEventListener("change",set)}catch(e){}d.addEventListener("toggle",()=>{try{setTimeout(()=>{if(typeof foldSums==="function")foldSums()},0)}catch(e){}})}}
/* «Tus bandas ahora»: desplegable en móvil y tablet; abierta en ordenador */
{const d=$("f_contra");if(d){let pref=null;try{pref=localStorage.getItem("fold:f_contra")}catch(e){}if(window.matchMedia("(min-width:1000px)").matches&&pref!=="0")d.open=true}}

/* ---------- pestañas dentro de cada sección ---------- */
function selTab(pg,id,user){const sec=document.querySelector(`section.page[data-pg="${pg}"]`);if(!sec)return;
  sec.querySelectorAll(":scope > details[data-tab]").forEach(d=>d.classList.toggle("toff",d.id!==id));
  sec.querySelectorAll(".ptabs button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.t===id)));
  if(user){try{localStorage.setItem("tab:"+pg,id)}catch(e){}if(id==="f_cycle")renderCycle();if(pg==="fichas"&&st.page==="fichas")renderPage();try{foldSums()}catch(e){}}}
function curTab(pg){const b=document.querySelector(`section.page[data-pg="${pg}"] .ptabs button[aria-selected="true"]`);return b?b.dataset.t:null}
function syncTabs(){document.querySelectorAll(".ptabs").forEach(bar=>{const sec=bar.closest("section.page");let lost=false;
  bar.querySelectorAll("button").forEach(b=>{const d=$(b.dataset.t);b.hidden=!!(d&&d.hidden);if(b.hidden&&b.getAttribute("aria-selected")==="true")lost=true});
  if(lost){const f=[...bar.querySelectorAll("button")].find(b=>!b.hidden);if(f)selTab(sec.dataset.pg,f.dataset.t)}bar.hidden=[...bar.querySelectorAll("button")].filter(b=>!b.hidden).length<2})}
function initTabs(){document.querySelectorAll("section.page").forEach(sec=>{const ps=[...sec.querySelectorAll(":scope > details[data-tab]")];if(ps.length<2)return;
  const bar=document.createElement("div");bar.className="ptabs";bar.setAttribute("role","tablist");ps[0].before(bar);
  ps.forEach(d=>{d.open=true;d.classList.add("intab");const s=d.querySelector(":scope > summary");if(s){s.addEventListener("click",e=>e.preventDefault());s.tabIndex=-1}
    const bt=document.createElement("button");bt.type="button";bt.textContent=d.dataset.tab;bt.dataset.t=d.id;bt.setAttribute("role","tab");bt.onclick=()=>{selTab(sec.dataset.pg,d.id,true);try{bt.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"})}catch(e){}};bar.appendChild(bt)});
  let cur=null;try{cur=localStorage.getItem("tab:"+sec.dataset.pg)}catch(e){}selTab(sec.dataset.pg,ps.some(p=>p.id===cur)?cur:ps[0].id)})}
initTabs();

/* ---------- ficha completa de un indicativo (pestaña DX) ---------- */
function dxFor(call){const C=call.toUpperCase();return (L.dx||[]).find(d=>String(d.call||"").toUpperCase().split(/\s*[·,]\s*|\s+\/\s+/).some(x=>x.trim()===C))||null}
function baseCall(c){const p=String(c).toUpperCase().split("/");return p.slice().sort((a,b)=>b.length-a.length)[0]}
function greyWindows(a,b){const out=[];let st0=null;for(let i=0;i<=96;i++){const h=i/4;const x=Math.abs(sunElF(a,h))<7&&Math.abs(sunElF(b,h))<7;if(x&&st0==null)st0=h;if((!x||i===96)&&st0!=null){out.push([st0,h]);st0=null}}return out}
function openCall(call){call=String(call||"").toUpperCase().trim();if(!call)return;
  const e=callEnt(call),sp=(L.spots||[]).filter(s=>String(s.call).toUpperCase()===call),dxp=dxFor(call);
  const ref=sp[0]||(dxp?{dx:[dxp.lon,dxp.lat],dxcc:dxp.dxcc}:null);
  let t=ref?tFor(ref):null;if(!t&&e)t=TG().find(x=>x.dxcc===e.dxcc)||null;
  const p=ref&&ref.dx?ref.dx:(t?[t.lon,t.lat]:null);const lh=localNow();
  const az=p?Math.round(brgJS(TXP,p)):null,km=p?Math.round(distJS(TXP,p)):null,laz=az!=null?(az+180)%360:null,lkm=km!=null?40030-km:null;
  const u=e&&flagURL(e.cc);const need=t?entNeed(t):null;
  let h=`<div class="cph"><div><div class="cpc">${esc(call)}</div><div class="cpe">${u?`<img class="fl" src="${u}" alt="" width="24" height="16"> `:""}${esc(e?e.name:"Entidad desconocida")}${t?` · ${esc(CONTN[t.cont]||t.cont)} · zona CQ ${t.cq}`:""}${e?` · DXCC ${e.dxcc}`:""}</div>
    <div class="cpb">${dxp?'<span class="agr ok">DXpedición activa</span>':""}${dxp&&dxp.mw?`<span class="agr dif">Club Log Most Wanted nº ${esc(dxp.mw)}</span>`:""}${t&&t.rare?'<span class="agr dif">Entidad rara</span>':""}${need===true?'<span class="agr dif">Te falta</span>':need===false?'<span class="agr">Ya confirmada</span>':""}${sp.some(s=>s.ns>1)?`<span class="agr ok">en ${Math.max(...sp.map(s=>s.ns||1))} clústeres</span>`:""}</div></div>
    <button class="btn cpx" id="cpx" aria-label="Cerrar">Cerrar</button></div>`;
  /* en el aire */
  h+=`<h3>En el aire ahora</h3>`+(sp.length?sp.map(s=>{const a=spotAge(s);const ev=spotEval(s,lh);return `<div class="cps"><b style="color:${BC[s.band]}">${esc(s.f)} MHz</b> · ${BANDS[s.band]} · ${window.ACRACB_mb?ACRACB_mb(s.mode||String(spotMode(s)).toUpperCase()):esc(String(spotMode(s)).toUpperCase())} · ${esc(s.t)} UTC${a!=null?` (${ageTxt(a)})`:""}${s.nw?' <span class="nwb">NUEVO</span>':""}<div class="note">Lo oye ${CSL(s.by)}${s.c?` · ${esc(s.c)}`:""}</div>${ev?`<div class="note">Te llega con un <b>${Math.round(Math.max(ev.pSP,ev.t.l?ev.pLP:0)*100)} %</b> de probabilidad${ev.t.l&&ev.pLP>ev.pSP?" por el camino largo":""}.</div>`:""}</div>`}).join(""):`<p class="note">No aparece en los clústeres de la última hora${L.spotsChecked?` (revisados a las ${esc(String(L.spotsChecked).slice(11,16))} UTC)`:""}.</p>`);
  /* DXpedición */
  if(dxp)h+=`<h3>DXpedición</h3><p>${esc(dxp.info||"")}</p><div class="cpg">${[["Hasta",dxp.until],["Modos",dxp.modes],["Escucha (QSX)",dxp.qsx],["Piloto",dxp.pilot],["QSL",dxp.qsl]].filter(x=>x[1]).map(([k,v])=>`<div><span class="note">${k}</span><b>${esc(String(v))}</b></div>`).join("")}</div>${dxp.web?`<p><a href="${esc(dxp.web)}" target="_blank" rel="noopener">Web de la expedición</a></p>`:""}`;
  /* camino */
  if(p){const se=sunEvents(p),gw=greyWindows(TXP,p);const off=Math.round(p[0]/15);const there=new Date(Date.now()+off*3600e3);
    h+=`<h3>Cómo llegarle desde ${esc(String($("loc").value).slice(0,6))}</h3><div class="cpg">
      <div><span class="note">Camino corto</span><b>${az}° ${cab(az)} · ${fk(km)} km</b></div><div><span class="note">Camino largo</span><b>${laz}° ${cab(laz)} · ${fk(lkm)} km</b></div>
      <div><span class="note">Hora allí (aprox.)</span><b>${hh(there.getUTCHours())}:${String(there.getUTCMinutes()).padStart(2,"0")}</b></div>
      <div><span class="note">Sol allí (tu hora)</span><b>${se.rise!=null?hm(se.rise)+"–"+hm(se.set):esc(se.polar||"—")}</b></div></div>
      <p>${t?aimTxt(az,false,sp[0]?sp[0].band:3):""}</p>${gw.length?`<p class="note"><b>Línea gris común</b> (los dos extremos con el sol cerca del horizonte, tu hora): ${gw.map(([a,b])=>hm(a)+"–"+hm(b)).join(", ")}. Buen momento para 40, 80 y 160 m.</p>`:""}`}
  /* propagación por banda */
  if(t){const rows=BI().map(b=>{const a=prob(t,lh,b,false),c=t.l?prob(t,lh,b,true):{p:0};let best={p:0,h:0};for(let x=0;x<24;x++){const q=Math.max(prob(t,x,b,false).p,t.l?prob(t,x,b,true).p:0);if(q>best.p)best={p:q,h:x}}return {b,a,c,best}});
    const mu=rows.map(r=>r.a.muf).find(x=>x&&isFinite(x));h+=`<h3>Tus bandas hacia allí</h3>${mu?`<p class="note">MUF del camino ahora: <b>${mu.toFixed(1)} MHz</b>: por encima de esa frecuencia la señal no vuelve a tierra.</p>`:""}<div class="scroll"><table class="bt cotab"><tr><th>Banda</th><th>Ahora (${hh(lh)}:00)</th><th>Mejor hora hoy</th></tr>${rows.map(r=>`<tr><td style="color:${BC[r.b]};font-weight:700">${BANDS[r.b]}</td><td>${r.a.na||!isFinite(Math.max(r.a.p,r.c.p))?"—":`<span class="${cls(Math.max(r.a.p,r.c.p))}" style="padding:1px 6px;border-radius:4px">${Math.round(Math.max(r.a.p,r.c.p)*100)} %</span>${r.c.p>r.a.p?" largo":""}`}</td><td>${r.a.na||!isFinite(r.best.p)?"—":r.best.p>=.05?`${hh(r.best.h)}:00 · ${Math.round(r.best.p*100)} %`:"cerrada todo el día"}</td></tr>`).join("")}</table></div><p class="note">Calculado para tu estación (${esc(PWN())}, ${esc(ANTL())}) en ${esc(MD().s)}.</p>`}
  /* enlaces */
  const bc=encodeURIComponent(baseCall(call)),fc=encodeURIComponent(call);
  h+=`<h3>Más información</h3><div class="cpl"><a class="btn" href="https://www.qrz.com/db/${bc}" target="_blank" rel="noopener">QRZ.com</a><a class="btn" href="https://www.hamqth.com/${bc}" target="_blank" rel="noopener">HamQTH</a><a class="btn" href="https://www.reversebeacon.net/main.php?spotted_call=${fc}" target="_blank" rel="noopener">Reverse Beacon</a><a class="btn" href="https://pskreporter.info/pskmap.html?preset&callsign=${fc}" target="_blank" rel="noopener">PSK Reporter</a>${t?`<button class="btn" id="cpmap">Ver en el mapa</button>`:""}</div>`;
  let ov=$("cpop");if(!ov){ov=document.createElement("div");ov.id="cpop";ov.className="cpop";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");document.body.appendChild(ov);
    ov.addEventListener("click",ev=>{if(ev.target===ov)closeCall()});document.addEventListener("keydown",ev=>{if(ev.key==="Escape")closeCall()})}
  ov.innerHTML=`<div class="cpan" tabindex="-1">${h}</div>`;ov.hidden=false;document.body.classList.add("noscroll");
  $("cpx").onclick=closeCall;if($("cpmap"))$("cpmap").onclick=()=>{closeCall();go("mapa");openPop({k:"t",id:t.id})};
  ov.querySelectorAll(".cpan .cs[data-call]").forEach(x=>x.onclick=ev=>{ev.stopPropagation();openCall(x.dataset.call)});
  ov.querySelector(".cpan").focus()}
function closeCall(){const ov=$("cpop");if(ov&&!ov.hidden){ov.hidden=true;document.body.classList.remove("noscroll")}}
{const sec=document.querySelector('section.page[data-pg="dx"]');if(sec)sec.addEventListener("click",ev=>{const c=ev.target.closest(".cs[data-call]");if(!c)return;ev.preventDefault();ev.stopPropagation();openCall(c.dataset.call)},true)}

/* ---------- calendario de los grandes concursos (todas las modalidades) ---------- */
/* [nombre, modalidad, mes (1-12), fin de semana completo nº (1-4; -1 = último), horario UTC, empieza el viernes, clave del plan, URE] */
const CAL=[["ARRL RTTY Roundup","RTTY",1,1,"18:00 sáb – 23:59 dom"],["CQ WW 160 m CW","CW",1,-1,"22:00 vie – 22:00 dom",1,"cq160cw"],["UBA DX SSB","SSB",1,-1,"13:00 sáb – 13:00 dom"],["REF CW","CW",1,-1,"06:00 sáb – 18:00 dom"],
 ["CQ WPX RTTY","RTTY",2,2,"00:00 sáb – 24:00 dom",0,"wpxrtty"],["PACC (Países Bajos)","CW/SSB",2,2,"12:00 sáb – 12:00 dom"],["ARRL International DX CW","CW",2,3,"00:00 sáb – 24:00 dom",0,"arrlcw"],["CQ WW 160 m SSB","SSB",2,-1,"22:00 vie – 21:59 dom",1,"cq160"],["UBA DX CW","CW",2,-1,"13:00 sáb – 13:00 dom"],["REF SSB","SSB",2,-1,"06:00 sáb – 18:00 dom"],
 ["ARRL International DX SSB","SSB",3,1,"00:00 sáb – 24:00 dom",0,"arrl"],["EA PSK63","PSK63",3,2,"16:00 sáb – 16:00 dom",0,0,1],["Russian DX","CW/SSB",3,3,"12:00 sáb – 12:00 dom"],["CQ WPX SSB","SSB",3,-1,"00:00 sáb – 24:00 dom",0,"wpx"],
 ["EA RTTY","RTTY",4,1,"12:00 sáb – 11:59 dom",0,0,1],["SP DX","CW/SSB",4,1,"15:00 sáb – 15:00 dom"],["JIDX CW","CW",4,2,"07:00 sáb – 13:00 dom"],["OK/OM DX SSB","SSB",4,2,"12:00 sáb – 11:59 dom"],["CQMM DX","CW/SSB",4,3,"09:00 sáb – 23:59 dom"],["SP DX RTTY","RTTY",4,-1,"12:00 sáb – 12:00 dom"],["Helvetia","CW/SSB",4,-1,"13:00 sáb – 12:59 dom"],
 ["ARI International DX","CW/SSB/RTTY",5,1,"12:00 sáb – 11:59 dom"],["S. M. el Rey de España CW","CW",5,3,"12:00 sáb – 12:00 dom",0,0,1],["CQ WPX CW","CW",5,-1,"00:00 sáb – 24:00 dom",0,"wpxcw"],
 ["All Asian DX CW","CW",6,3,"00:00 sáb – 24:00 dom"],["S. M. el Rey de España SSB","SSB",6,-1,"12:00 sáb – 12:00 dom",0,0,1],
 ["IARU HF World Championship","CW/SSB",7,2,"12:00 sáb – 12:00 dom",0,"iaru"],["Nacional CW (CNCW)","CW",7,3,"12:00–22:59 sáb y 05:00–11:59 dom",0,0,1],["RSGB IOTA","CW/SSB",7,-1,"12:00 sáb – 12:00 dom"],
 ["EU HF Championship","CW/SSB",8,1,"12:00–23:59 sáb (solo el sábado)",2],["WAE DX CW","CW",8,2,"00:00 sáb – 23:59 dom",0,"waecw"],["YO DX HF","CW/SSB",8,3,"12:00 sáb – 12:00 dom"],["WW Digi DX","FT4/FT8",8,-1,"12:00 sáb – 12:00 dom"],
 ["All Asian DX Phone","SSB",9,1,"00:00 sáb – 24:00 dom"],["WAE DX SSB","SSB",9,2,"00:00 sáb – 23:59 dom",0,"wae"],["SAC CW (Escandinavia)","CW",9,3,"12:00 sáb – 12:00 dom"],["CQ WW RTTY","RTTY",9,-1,"00:00 sáb – 24:00 dom",0,"cqwwrtty"],
 ["Oceania DX Phone","SSB",10,1,"06:00 sáb – 06:00 dom"],["Oceania DX CW","CW",10,2,"06:00 sáb – 06:00 dom"],["SAC SSB (Escandinavia)","SSB",10,2,"12:00 sáb – 12:00 dom"],["WAG (DARC)","CW/SSB",10,3,"15:00 sáb – 14:59 dom"],["CQ WW DX SSB","SSB",10,-1,"00:00 sáb – 24:00 dom",0,"cqww"],
 ["WAE DX RTTY","RTTY",11,2,"00:00 sáb – 23:59 dom"],["JIDX Phone","SSB",11,2,"07:00 sáb – 13:00 dom"],["OK/OM DX CW","CW",11,2,"12:00 sáb – 12:00 dom"],["LZ DX","CW/SSB",11,3,"12:00 sáb – 12:00 dom"],["CQ WW DX CW","CW",11,-1,"00:00 sáb – 24:00 dom",0,"cqwwcw"],
 ["ARRL 160 m","CW",12,1,"22:00 vie – 16:00 dom",1],["ARRL 10 m","CW/SSB",12,2,"00:00 sáb – 23:59 dom",0,"arrl10"]];
function calDate(y,m,n){const sats=[];for(let d=1;d<=31;d++){const x=new Date(Date.UTC(y,m-1,d));if(x.getUTCMonth()!==m-1)break;if(x.getUTCDay()===6){const s=new Date(Date.UTC(y,m-1,d+1));if(s.getUTCMonth()===m-1)sats.push(x)}}return n<0?sats[sats.length-1]:sats[n-1]}
function calNext(c){const now=new Date();for(const y of [now.getUTCFullYear(),now.getUTCFullYear()+1]){const sat=calDate(y,c[2],c[3]);if(!sat)continue;const st=new Date(sat.getTime()-(c[5]===1?864e5:0)),en=new Date(sat.getTime()+(c[5]===2?1:2)*864e5);if(en>now)return {st,sat,en}}return null}
const CALF={all:"Todos",ph:"Fonía",cw:"CW",dig:"Digitales",ure:"URE"};let CALSEL=null;
function calCat(c){const m=c[1];return {ph:/SSB/.test(m),cw:/CW/.test(m),dig:/RTTY|PSK|FT/.test(m),ure:!!c[7]}}
function renderCCal(){const el=$("ccal");if(!el)return;if(CALSEL==null){const md=MOD();CALSEL="all";try{CALSEL=localStorage.getItem("calf")||"all"}catch(e){}}
  const now=new Date(),fmt=d=>d.toLocaleDateString("es-ES",{day:"numeric",month:"short",timeZone:"UTC"}).replace(".","");
  const rows=CAL.map(c=>({c,d:calNext(c)})).filter(x=>x.d).sort((a,b)=>a.d.st-b.d.st).filter(x=>CALSEL==="all"||calCat(x.c)[CALSEL]);
  el.innerHTML=`<div class="seg calf" role="group" aria-label="Filtrar concursos">${Object.entries(CALF).map(([k,v])=>`<button data-cf="${k}" aria-pressed="${k===CALSEL}">${v}</button>`).join("")}</div>
  <div class="scroll"><table class="bt caltab"><tr><th>Fechas</th><th>Concurso</th><th>Modo</th><th>Horario (UTC)</th><th>Faltan</th></tr>${rows.map(({c,d},i)=>{const days=Math.ceil((d.st-now)/864e5);const on=d.st<=now;const mk=d.st.getUTCFullYear()*12+d.st.getUTCMonth(),pm=i?rows[i-1].d.st.getUTCFullYear()*12+rows[i-1].d.st.getUTCMonth():-1;
    const mh=mk!==pm?`<tr class="calm"><td colspan="5">${d.st.toLocaleDateString("es-ES",{month:"long",year:"numeric",timeZone:"UTC"})}</td></tr>`:"";const en1=new Date(d.en.getTime()-864e5);
    const dt=c[5]===2?String(d.sat.getUTCDate()):(d.st.getUTCMonth()===en1.getUTCMonth()?`${d.st.getUTCDate()}–${en1.getUTCDate()}`:`${fmt(d.st)}–${fmt(en1)}`);
    const plan=c[6]&&CONTESTS[c[6]];return mh+`<tr class="${on?"calon":""}${c[7]?" calure":""}"><td class="cald">${dt}</td><td><b>${esc(c[0])}</b>${window.ACRACB_exch?ACRACB_exch(c[0]):""}${c[7]?' <span class="agr">URE</span>':""}${plan?` <button class="lnk" data-cplan="${c[6]}">ver plan</button>`:""}</td><td>${esc(c[1])}</td><td class="note">${esc(c[4])}</td><td>${on?'<span class="agr ok">en curso</span>':days<=7?`<span class="agr dif">${days}<span class="dd"> día${days===1?"":"s"}</span><span class="dm"> d</span></span>`:`${days}<span class="dd"> días</span><span class="dm"> d</span>`}</td></tr>`}).join("")}</table></div>
  <p class="note">Fechas calculadas con la regla de cada concurso (qué fin de semana del mes) a partir del calendario de WA7BNM y de las bases de la URE. Compruébalas en las bases oficiales antes de cada edición: alguna puede cambiar.</p>`;
  el.querySelectorAll("[data-cf]").forEach(b=>b.onclick=()=>{CALSEL=b.dataset.cf;try{localStorage.setItem("calf",CALSEL)}catch(e){}renderCCal()});
  el.querySelectorAll("[data-cplan]").forEach(b=>b.onclick=()=>{const k=b.dataset.cplan,K=CONTESTS[k];if(!K)return;const ms=$("modesel");
    if(K.modes&&!K.modes.includes(MOD())&&ms){ms.value=K.modes[0];store.set("c_modesel",ms.value);CACHE.clear();try{fillBandSel()}catch(e){}}
    store.set("contest",k);const cp=$("c_plan");if(cp)cp.hidden=false;selTab("concursos","c_plan",true);const pl=$("cplan");if(pl)pl.innerHTML=`<p class="note">Calculando el plan de ${esc(K.n)}…</p>`;window.scrollTo({top:0,behavior:"smooth"});requestAnimationFrame(()=>setTimeout(()=>setMode("contest",true),20))})}

/* ---------- hora a hora: mapa de calor bandas × horas, franja día/noche y resumen ---------- */
let TL2G=0;
function renderTL(){const g=++TL2G,el=$("tl");if(!el)return;const now=localNow(),C=st.mode==="contest";
  {const t=$("tlt");if(t)t.textContent=C?"Tu concurso hora a hora":"Tu día hora a hora"}
  const TGM=TG().filter(inMode),BIL=BI(),G={},NT=Math.max(1,TGM.length);let x=0;
  const hour=()=>{const row={};let bb=null,bc=-1,bp=0,ba=-1;for(const b of BIL){let c=0,mp=0,a=0,na=true;for(const t of TGM){const r=prob(t,x,b);if(!r.na)na=false;const p=st.mode==="dx"?Math.max(r.p,t.l?prob(t,x,b,true).p:0):r.p;if(p>=.3)c++;if(p>mp)mp=p;a+=C?cval(t,b,p):0}
      if(C)c=cmults(x,b).size;row[b]={c,mp,na};if(!na&&(C?a>ba:(c>bc||(c===bc&&mp>bp)))){bc=c;bb=b;bp=mp;ba=a}}
    G[x]={row,bb:bp>=.05?bb:null,bc,bp};x++};
  const fin=()=>{if(g!==TL2G)return;el.className="tl2";
    const se=sunEvents(TXP),dn=Array.from({length:24},(_,h)=>{const e=sunEl(TXP,h);return e>6?"d":e>-6?"g":"n"});
    const hrs=Array.from({length:24},(_,h)=>h),cell=(h,inner,cl,ti)=>`<i class="${cl}${h===now?" now":""}${h===st.mhour?" sel":""}" data-h="${h}" title="${esc(ti)}">${inner}</i>`;
    let H=`<div class="hm2" role="img" aria-label="Probabilidad por banda y hora">`;
    H+=`<div class="hl"></div>`+hrs.map(h=>`<b class="hx${h===now?" now":""}">${h%3===0?hh(h):""}</b>`).join("");
    H+=`<div class="hl">Sol</div>`+hrs.map(h=>cell(h,"","dn dn-"+dn[h],`${hh(h)}:00 · ${dn[h]==="d"?"de día":dn[h]==="g"?"línea gris":"de noche"}`)).join("");
    H+=`<div class="hl hlb">Mejor</div>`+hrs.map(h=>{const b=G[h].bb;return cell(h,b!=null?`<span>${BANDS[b].replace(/\s+m$/,"").replace(/\s+cm$/,"")}</span>`:"","bst",b!=null?`${hh(h)}:00 · mejor banda ${BANDS[b]} · ${G[h].bc} ${C?"multiplicadores":"destinos ≥30 %"}`:`${hh(h)}:00 · nada abierto`).replace('class="bst','style="background:'+(b!=null?BC[b]:"transparent")+'" class="bst')}).join("");
    for(const b of BIL.slice().reverse()){H+=`<div class="hl" style="color:${BC[b]}">${BANDS[b]}</div>`+hrs.map(h=>{const r=G[h].row[b];const fr=r.c/NT;return r.na?cell(h,"","na",`${BANDS[b]} · ${hh(h)}:00 · tu antena no cubre esta banda`):cell(h,"",r.c===0?"c0":cls(Math.max(.05,fr)),`${BANDS[b]} · ${hh(h)}:00 · ${r.c} de ${NT} ${C?"multiplicadores posibles":"destinos DX"} abiertos (${Math.round(fr*100)} %)`)}).join("")}
    H+=`</div>`;
    /* tramos de mejor banda */
    const seg=[];for(let h=0;h<24;h++){const b=G[h].bb;const L=seg[seg.length-1];if(L&&L.b===b)L.e=h+1;else seg.push({b,s:h,e:h+1})}
    let best=null;for(let h=0;h<24;h++)if(G[h].bb!=null&&(!best||G[h].bc>best.c||(G[h].bc===best.c&&G[h].bp>best.p)))best={h,b:G[h].bb,c:G[h].bc,p:G[h].bp};
    const nextOpen=(()=>{for(let k=0;k<24;k++){const h=(now+k)%24;if(G[h].bb!=null)return h}return null})();
    let T=`<div class="tlsum">${best?`<p class="tlbig">Mejor hora del día: <b>${hh(best.h)}:00</b> en <b style="color:${BC[best.b]}">${BANDS[best.b]}</b> · ${best.c} ${C?"multiplicadores":"destinos con ≥30 %"}.</p>`:`<p class="tlbig">Hoy no se abre ninguna banda hacia destinos DX con tu estación.</p>`}
      ${(()=>{let nb=null;for(let k=1;k<13;k++){const h=(now+k)%24;if(G[h].bb!=null&&(!nb||G[h].bc>nb.c))nb={h,b:G[h].bb,c:G[h].bc}}return nb&&best&&nb.h!==best.h?`<p>Mejor hora en las próximas 12 h: <b>${hh(nb.h)}:00</b> en <b style="color:${BC[nb.b]}">${BANDS[nb.b]}</b> · ${nb.c} ${C?"multiplicadores":"destinos"}.</p>`:""})()}<p>Ahora (${hh(now)}:00): ${G[now].bb!=null?`<b style="color:${BC[G[now].bb]}">${BANDS[G[now].bb]}</b>, ${G[now].bc} ${C?"multiplicadores":"destinos abiertos"}.`:`nada abierto${nextOpen!=null?`; lo próximo, a las <b>${hh(nextOpen)}:00</b>`:""}.`}</p>
      <ul class="tlseg">${seg.map(s=>`<li><span class="tlh2">${hh(s.s)}–${hh(s.e%24)} h</span>${s.b!=null?`<b style="color:${BC[s.b]}">${BANDS[s.b]}</b>`:`<span class="note">sin aperturas</span>`}</li>`).join("")}</ul></div>`;
    el.innerHTML=T+H+`<div class="hmleg"><span>${C?"Multiplicadores":"Destinos DX"} abiertos (≥30 %):</span><i class="c0"></i>ninguno<i class="c1"></i>&lt;15 %<i class="c2"></i>15–30<i class="c3"></i>30–50<i class="c4"></i>50–70<i class="c5"></i>&gt;70 %<span class="sep"></span><i class="dn dn-d"></i>día<i class="dn dn-g"></i>línea gris<i class="dn dn-n"></i>noche</div>`;
    const th=$("tlh");if(th)th.innerHTML="";
    const sn=$("sun");if(sn)sn.innerHTML=`<span>Salida del sol <b>${hm(se.rise)}</b></span><span>Mediodía <b>${hm(se.noon)}</b></span><span>Puesta <b>${hm(se.set)}</b></span><span class="note">Horas locales. Toca una hora para verla en el mapa y en el resto de la plataforma.</span>`;
    el.querySelectorAll("[data-h]").forEach(c=>c.onclick=()=>{st.mhour=+c.dataset.h;const m=$("mh");if(m)m.value=st.mhour;refresh()});
    try{foldSums()}catch(e){}};
  const t0=performance.now();while(x<24&&performance.now()-t0<30)hour();if(x>=24)return fin();
  if(!el.children.length)el.innerHTML='<p class="note">Calculando las 24 horas…</p>';
  const step=()=>{if(g!==TL2G)return;const t1=performance.now();while(x<24&&performance.now()-t1<14)hour();if(x<24)setTimeout(step,0);else fin()};setTimeout(step,0)}

/* ---------- Fichas: entidades oídas de verdad en las últimas horas ---------- */
let XV=(()=>{try{return localStorage.getItem("xv")||"heard"}catch(e){return "heard"}})();const XH={cont:"",mine:false,sort:"rec"};
function renderExplorer(){document.querySelectorAll("#xview [data-xv]").forEach(b=>{b.setAttribute("aria-pressed",String(b.dataset.xv===XV));b.onclick=()=>{XV=b.dataset.xv;try{localStorage.setItem("xv",XV)}catch(e){}renderExplorer()}});
  if(XV==="prev")return renderPrevExplorer();renderHeard()}
function heardList(){const M=new Map(),now=Date.now(),ref=Date.parse([L.spotsChecked,L.spotsUTC,L.updatedUTC].filter(Boolean).sort().pop()||"")||now;
  const add=(dx,o)=>{if(dx==null)return;let r=M.get(dx);if(!r){r={dxcc:dx,calls:new Map(),bands:new Set(),modes:new Set(),n:0,last:0,src:new Set(),pos:null};M.set(dx,r)}
    r.n+=o.n||1;(o.bands||[]).forEach(b=>r.bands.add(b));(o.modes||[]).forEach(m=>r.modes.add(String(m).toUpperCase()));(o.calls||[]).forEach(c=>{if(!r.calls.has(c)||r.calls.get(c)<o.last)r.calls.set(c,o.last)});if(o.last>r.last)r.last=o.last;(o.src||[]).forEach(s=>r.src.add(s));if(!r.pos&&o.pos)r.pos=o.pos};
  for(const h of (L.heard||[])){const t=Date.parse(h.last)||0;if(ref-t>6*3600e3)continue;add(h.dxcc!=null?h.dxcc:(callEnt((h.calls||[])[0]||"")||{}).dxcc,{n:h.n,bands:h.b,modes:h.m,calls:h.calls,last:t,src:h.src,pos:h.pos})}
  for(const s of (L.spots||[])){const e=callEnt(s.call);if(!e||e.mm)continue;const a=spotAge(s);const t=a!=null?now-a*6e4:ref;const src=/skimmer|RBN/i.test(s.c||"")?"RBN":/PSK/i.test(s.c||"")?"PSK Reporter":"clúster";
    add(e.dxcc,{n:1,bands:[s.band],modes:[s.mode||"SSB"],calls:[String(s.call).toUpperCase()],last:t,src:[src],pos:s.dx})}
  return [...M.values()]}
function renderHeard(){const el=$("explo");if(!el)return;const now=Date.now(),lh=localNow();const all=heardList();
  const rows=all.map(r=>{const d=DXDg().d[r.dxcc]||["",""];const t=r.pos?nearestT(r.pos,r.dxcc):TG().find(x=>x.dxcc===r.dxcc);let bp={p:0,b:null};if(t)for(const b of BI().filter(b=>b<=10)){const q=Math.max(prob(t,lh,b,false).p,t.l?prob(t,lh,b,true).p:0);if(q>bp.p)bp={p:q,b}}
    return {...r,cc:d[0],name:dxName(r.dxcc),t,cont:t?t.cont:"",rare:t?t.rare:false,need:t?entNeed(t):null,bp}})
   .filter(r=>(!XH.cont||r.cont===XH.cont)&&(!XH.mine||[...r.modes].some(m=>spotMode({mode:m})===MOD()||(MOD()==="ssb"&&m==="SSB"))));
  const S={rec:(a,b)=>b.last-a.last,n:(a,b)=>b.n-a.n,rare:(a,b)=>(b.rare-a.rare)||(b.need===true)-(a.need===true)||b.last-a.last,km:(a,b)=>(b.t?b.t.km:0)-(a.t?a.t.km:0)}[XH.sort];rows.sort(S);
  const ago=t=>{const m=Math.max(0,Math.round((now-t)/6e4));return m<60?`hace ${m} min`:`hace ${Math.floor(m/60)} h ${m%60?String(m%60).padStart(2,"0")+" min":""}`};
  const CN={"":"Todos",EU:"Europa",AF:"África",AS:"Asia",NA:"Norteamérica",SA:"Sudamérica",OC:"Oceanía"};
  setSum("explo",`${all.length} entidades oídas en las últimas horas${rows.length!==all.length?` · ${rows.length} con este filtro`:""}`);
  el.innerHTML=`<div class="xhf"><div class="seg">${Object.entries(CN).map(([k,v])=>`<button data-hc="${k}" aria-pressed="${XH.cont===k}">${v}</button>`).join("")}</div>
   <label class="f xhs">Ordenar<select id="xhs"><option value="rec">Lo más reciente</option><option value="rare">Raras y que te faltan</option><option value="n">Más spots</option><option value="km">Más lejanas</option></select></label>
   <label class="chk"><input type="checkbox" id="xhm" ${XH.mine?"checked":""}> Solo en mi modo (${esc(MD().s)})</label></div>
   <p class="note">Entidades oídas desde Europa en clústeres, Reverse Beacon y PSK Reporter en las últimas horas. Son spots reales, no previsiones. Toca una para ver su ficha.</p>
   ${rows.length?`<div class="hlist">${rows.map(r=>{const u=flagURL(r.cc),calls=[...r.calls.entries()].sort((a,b)=>b[1]-a[1]).map(x=>x[0]);return `<button class="hrow" data-hcall="${esc(calls[0])}">
     <span class="hn">${u?`<img class="fl" src="${u}" alt="" width="22" height="15"> `:""}<b>${esc(r.name)}</b>${r.rare?' <span class="agr dif">rara</span>':""}${r.need===true?' <span class="agr dif">te falta</span>':""}</span>
     <span class="ht">${ago(r.last)} · ${r.n} spot${r.n===1?"":"s"}${r.src.size?` · ${[...r.src].join(", ")}`:""}</span>
     <span class="hb">${[...r.bands].sort((a,b)=>BALL.indexOf(a)-BALL.indexOf(b)).map(b=>`<i style="border-color:${BC[b]};color:${BC[b]}">${BANDS[b]}</i>`).join("")}<em>${[...r.modes].join(" · ")}</em></span>
     <span class="hc">${calls.slice(0,4).map(esc).join(", ")}${calls.length>4?` y ${calls.length-4} más`:""}</span>
     <span class="hp">${r.t?`${r.t.az}° ${cab(r.t.az)} · ${fk(r.t.km)} km`:""}${r.bp.b!=null?` · para ti ahora: <b class="${cls(r.bp.p)}" style="padding:0 5px;border-radius:4px">${Math.round(r.bp.p*100)} %</b> en ${BANDS[r.bp.b]}`:""}</span></button>`}).join("")}</div>`:`<p class="empty">Ninguna entidad oída con este filtro.</p>`}`;
  $("xhs").value=XH.sort;$("xhs").onchange=e=>{XH.sort=e.target.value;renderHeard()};$("xhm").onchange=e=>{XH.mine=e.target.checked;renderHeard()};
  el.querySelectorAll("[data-hc]").forEach(b=>b.onclick=()=>{XH.cont=b.dataset.hc;renderHeard()});
  el.querySelectorAll("[data-hcall]").forEach(b=>b.onclick=()=>openCall(b.dataset.hcall))}

/* recuerda los «Ver por qué» abiertos aunque la sección se vuelva a dibujar */
const WHY=new Set();const isSub=d=>d instanceof HTMLDetailsElement&&!d.classList.contains("fold")&&!d.classList.contains("mapctlw")&&d.id!=="cfg";
const whyKey=d=>{const h=d.parentElement&&d.parentElement.closest("[id]");const s=d.querySelector(":scope > summary");const t=s?s.textContent.trim().replace(/\d+/g,"#"):"";const sib=h?[...h.querySelectorAll("details")].filter(x=>{const y=x.querySelector(":scope > summary");return y&&y.textContent.trim().replace(/\d+/g,"#")===t}):[];return (h?h.id:"")+"|"+t+"|"+sib.indexOf(d)};
document.addEventListener("toggle",ev=>{const d=ev.target;if(!isSub(d))return;const k=whyKey(d);if(d.open)WHY.add(k);else WHY.delete(k)},true);
function restoreWhy(){if(!WHY.size)return;document.querySelectorAll("section.page details:not([open])").forEach(d=>{if(isSub(d)&&WHY.has(whyKey(d)))d.open=true})}

/* concursos: el cálculo del plan se hace por partes para no congelar la pantalla */
let CWG=0;function renderContestLazy(){const g=++CWG;if(st.mode!=="contest"){renderContest();renderCCal();return}
  const T=TG().filter(inMode),B=CT().bands;let x=0,bi=0,steps=0;
  const step=()=>{if(g!==CWG||st.page!=="concursos")return;const t0=performance.now();while(x<24&&performance.now()-t0<12){const b=B[bi];for(const t of T)prob(t,x,b);if(++bi>=B.length){bi=0;x++}}
    if(x<24){if(++steps===1){const pl=$("cplan");if(pl)pl.innerHTML=`<p class="note">Calculando el plan de ${esc(CT().n)}…</p>`}setTimeout(step,0)}else{renderContest();renderCCal();try{foldSums()}catch(e){}}};
  renderCCal();step()}

/* «Qué hacer»: primero las acciones; el razonamiento, plegado */
function tidyRec(){const r=document.querySelector("#rec .rec");if(!r||r.dataset.tidy)return;const ds=[...r.children];const qh=ds.find(d=>/^\s*Qué hacer/.test(d.textContent));if(!qh)return;
  r.dataset.tidy="1";const rest=ds.filter(d=>d!==qh);r.prepend(qh);if(rest.length){const det=document.createElement("details");det.className="why recwhy";det.innerHTML="<summary>Por qué: lo que dice el clúster y las condiciones</summary>";rest.forEach(d=>det.appendChild(d));r.appendChild(det)}}

/* WSPR: recuentos por banda (MHz → banda de la plataforma) */
const WSPRMAP={1:0,2:0,3:1,5:8,7:2,10:9,14:3,18:4,21:5,24:6,28:7,50:10};
function wsprN(b){const W=L.wspr&&L.wspr.bands;if(!W)return null;let n=null;for(const [k,v] of Object.entries(W)){if(WSPRMAP[Math.round(+k)]===b)n=(n||0)+(+v||0)}return n==null&&Object.keys(W).length?0:n}
/* Sol: previsión de 27 días de NOAA y eyecciones (CME) de NASA */
function renderOutlook(){const el=$("solar");if(!el)return;const O=L.outlook27,C=L.cme;let h="";
  if(O&&Array.isArray(O.days)&&O.days.length){const ds=O.days.slice(0,27),mx=Math.max(...ds.map(d=>+d[1]||0),160),mn=Math.min(...ds.map(d=>+d[1]||200),70);
    const W=ds.length*16+30,H=170,y=v=>H-24-((v-mn+5)/(mx-mn+10))*(H-44);
    let s=`<svg viewBox="0 0 ${W} ${H}" class="o27" role="img" aria-label="Flujo solar y Ap previstos 27 días">`;
    ds.forEach((d,i)=>{const x=24+i*16,v=+d[1],ap=+d[2];const col=ap>=20?"var(--bad)":ap>=10?"var(--warn)":"var(--ok)";s+=`<rect x="${x}" y="${y(v).toFixed(1)}" width="12" height="${(H-24-y(v)).toFixed(1)}" rx="2" fill="${col}" opacity=".85"><title>${esc(d[0])} · SFI ${v} · Ap ${ap}</title></rect>`;if(i%4===0)s+=`<text x="${x+6}" y="${H-8}" class="o27x">${esc(String(d[0]).slice(8,10))}/${esc(String(d[0]).slice(5,7))}</text>`;if(i%4===0)s+=`<text x="${x+6}" y="${(y(v)-4).toFixed(1)}" class="o27v">${v}</text>`});
    s+=`</svg>`;const good=ds.filter(d=>+d[2]<10).sort((a,b)=>b[1]-a[1]).slice(0,3).sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
    h+=`<div class="o27w"><h3 class="cyh">Próximos 27 días (NOAA)</h3><p class="note" style="margin:0 0 6px">Altura: flujo solar previsto. Color: actividad geomagnética (Ap): verde tranquila, amarillo agitada, rojo tormenta.${good.length?` Mejores días para el DX: <b>${good.map(d=>String(d[0]).slice(8,10)+"/"+String(d[0]).slice(5,7)).join(", ")}</b>.`:""}</p>${s}${O.issued?`<p class="note">${esc(O.issued)}</p>`:""}</div>`}
  if(Array.isArray(C)&&C.length)h+=`<div class="o27w"><h3 class="cyh">Eyecciones de masa coronal (NASA)</h3>${C.slice(0,4).map(c=>`<p>${c.arrival?`<b>Llegada prevista: ${esc(fmtUTC(c.arrival))}</b> · `:""}salida ${esc(fmtUTC(c.time))} a ${esc(c.speed)} km/s${c.note?` · ${esc(c.note)}`:""}</p>`).join("")}</div>`;
  if(!h)return;const old=el.querySelector(".o27box");if(old)old.remove();const box=document.createElement("div");box.className="o27box";box.innerHTML=h;const sg=el.querySelector(".sgrid");if(sg)sg.parentNode.insertBefore(box,sg);else el.appendChild(box)}
function fmtUTC(t){const d=new Date(t);return isNaN(d)?String(t||""):d.toLocaleString("es-ES",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"UTC"})+" UTC"}
COTN.tropo=["Índice de tropo (este de España)","/10",1.5];

/* ---------- persistencia (db del artifact o navegador) ---------- */
let DB=null,MCP=null,UID=null;const VER={};const upath=k=>UID?"data/users/"+UID+"/"+k:null;
async function dbSave(path,obj){const s=JSON.stringify(obj);store.set("db_"+path,s);const up=upath(path.split("/").pop());if(!DB||!up)return false;try{await DB.doc(up).set({json:s,at:new Date().toISOString()});return true}catch(e){return false}}
function loadLocal(){LOG=null;try{const b=store.get("db_owner/cal");if(b)OBS=JSON.parse(b)}catch(e){}fitCal()}
/* ---------- log ADIF de QRZ ---------- */
const normN=s=>String(s||"").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Z]/g,"");
let ALIAS=null;function aliasMap(){if(ALIAS)return ALIAS;ALIAS={};V.meta.forEach(m=>{(m[3]||"").split("|").filter(Boolean).forEach(a=>ALIAS[normN(a)]=m[2])});return ALIAS}
function parseADIF(txt){const recs=txt.split(/<eor>/i);const e={},mm={};let n=0,c=0,sc="";
  for(const r of recs){const f={};const re=/<([A-Za-z0-9_]+):(\d+)(?::[A-Za-z])?>/g;let m;while((m=re.exec(r))){const k=m[1].toUpperCase(),len=+m[2];f[k]=r.substr(m.index+m[0].length,len)}
    if(!f.BAND&&!f.FREQ)continue;let band=(f.BAND||"").toUpperCase();if(!band&&f.FREQ){const fr=+f.FREQ;const i=MHZ.findIndex((x,j)=>Math.abs(fr-x)<(j<2?.3:j<3?.4:.8));band=i>=0?BKEY[i]:""}
    let dx=+f.DXCC||aliasMap()[normN(f.COUNTRY)]||0;if(!dx||!band)continue;n++;
    const conf=(f.APP_QRZLOG_STATUS||"").toUpperCase()==="C"||(f.LOTW_QSL_RCVD||"").toUpperCase()==="Y"||(f.QSL_RCVD||"").toUpperCase()==="Y";if(conf)c++;{const md=String(f.MODE||"").toUpperCase(),mc=md==="CW"?"CW":/^(SSB|USB|LSB|AM|FM|PHONE|DIGITALVOICE)$/.test(md)?"PH":"DG";mm[dx]=mm[dx]||{};if(conf||!mm[dx][mc])mm[dx][mc]=conf?"C":(mm[dx][mc]||"W");if(!sc)sc=String(f.STATION_CALLSIGN||f.OPERATOR||"").toUpperCase().trim()}e[dx]=e[dx]||{};if(conf||!e[dx][band])e[dx][band]=conf?"C":(e[dx][band]||"W")}
  return {e,n,c,m:mm,call:sc,date:new Date().toISOString()}}
function renderLog(){if(!$("logbox"))return;{const sl=$("s_log");if(sl)sl.textContent=LOG?`${fk(LOG.n)} QSO · ${Object.keys(LOG.e).length} entidades`:"Sube tu ADIF";}const tot=new Set(V.meta.map(m=>m[2])).size;let conf=0,wk=0;if(LOG)for(const v of Object.values(LOG.e)){if(Object.values(v).includes("C"))conf++;else wk++}
  $("logbox").innerHTML=(LOG?`<div class="kv"><div class="chip"><div class="k">QSO leídos</div><div class="v">${fk(LOG.n)}</div><div class="t">${fk(LOG.c)} confirmados (QRZ, LoTW o QSL)</div></div><div class="chip"><div class="k">Entidades confirmadas</div><div class="v">${conf}</div><div class="t">${wk} trabajadas sin confirmar</div></div></div><p class="note">Cargado el ${new Date(LOG.date).toLocaleString("es-ES",{timeZone:"Europe/Madrid"})}. Con esto, ★ y «te falta» salen solos en el mapa, las DXpediciones, el clúster y los avisos.</p>`+(window.ACRACB_logview?ACRACB_logview():"")+(window.ACRACB_goals?ACRACB_goals():""):`<p>Sube tu log para que la web sepa qué entidades y bandas te faltan. Cuenta como confirmado lo validado en QRZ, LoTW o por QSL en papel.</p>`)+
   `<div class="drop"><b>Sube tu log en ADIF</b> (QRZ: Logbook → Settings → Export; también vale el de LoTW, Club Log o tu programa de log). <span>Se queda solo en este dispositivo.</span><label class="btn filebtn">Elegir archivo ADIF<input type="file" id="adif" class="vhide"></label></div><p class="note" id="adifst">${window.ADIFMSG?esc(window.ADIFMSG):""}</p>${LOG?'<button class="btn" id="logdel">Quitar el log</button>':""}`;
  $("adif").onchange=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>150e6){$("adifst").textContent="Ese archivo pasa de 150 MB: no parece un log ADIF. Expórtalo de nuevo o divídelo.";e.target.value="";return}$("adifst").textContent="Leyendo…";try{const txt=await f.text();const r=parseADIF(txt);if(!r.n){$("adifst").textContent="No he encontrado QSO en ese archivo. ¿Es un ADIF?";return}LOG=r;const okS=store.set("db_owner/log",JSON.stringify(r));window.ADIFMSG=`Listo: ${fk(r.n)} QSO leídos, ${fk(r.c)} confirmados. `+(okS?"Guardado solo en este dispositivo: nadie más lo ve.":"No cabe en la memoria del navegador: funciona ahora, pero al cerrar la página tendrás que volver a subirlo.");CACHE.clear();refresh()}catch(err){$("adifst").textContent="No se pudo leer el archivo."}};
  if($("logdel"))$("logdel").onclick=async()=>{LOG=null;window.ADIFMSG="Log quitado de este dispositivo.";store.set("db_owner/log","");refresh()}}
/* ---------- calibración ---------- */
function fitCal(){CALDB={};const g={};for(const o of OBS){(g[o.k]=g[o.k]||[]).push(o)}
  for(const [k,arr] of Object.entries(g)){if(arr.length<3){CALDB[k]={db:0,n:arr.length};continue}let bd=0,bl=-1e9;for(let d=-20;d<=20;d+=.25){let ll=-(d*d)/(2*36);for(const o of arr){const p=Math.min(.98,Math.max(.02,rel(o.m+d,o.dl,o.du,o.thr)));ll+=o.h?Math.log(p):Math.log(1-p)}if(ll>bl){bl=ll;bd=d}}CALDB[k]={db:bd,n:arr.length}}}
function addObs(tid,b,heard){const t=T(tid);if(!t||VUHF(b))return;const lh=st.mhour,lp=t.l&&prob(t,lh,b,true,"rx").p>prob(t,lh,b,false,"rx").p;
  /* «lo oigo» es la dirección él → tú: se guarda el margen de recepción (su potencia, tu antena, tu cable y tu ruido local) */
  const M=marg(t,lh,b,lp,true);if(!M)return;const m=M.m,x={DL:M.DL,DU:M.DU};
  OBS.push({k:calKey(),t:tid,b,lh,h:heard?1:0,m:Math.round(m*10)/10,dl:x.DL,du:x.DU,thr:M.thr,at:new Date().toISOString()});if(OBS.length>600)OBS=OBS.slice(-600);
  dbSave("owner/cal",OBS);fitCal();CACHE.clear();LASTOBS={t:tid,b,lh,at:Date.now()};refresh()}
let LASTOBS=null;function undoObs(tid,b,lh){const i=OBS.map(o=>o.t===tid&&o.b===b&&o.lh===lh&&o.k===calKey()).lastIndexOf(true);if(i<0)return;OBS.splice(i,1);dbSave("owner/cal",OBS);fitCal();CACHE.clear();LASTOBS=null;refresh()}
function renderCal(){const k=calKey(),c=CALDB[k]||{db:0,n:0};const all=Object.entries(CALDB);
  $("calbox").innerHTML=`<p>Cuando estés en la radio, abre un destino en el mapa y pulsa <b>Lo oigo</b> o <b>No lo oigo</b>. Desde 3 escuchas en el mismo sitio y con la misma antena, se busca por máxima verosimilitud cuántos dB hay que sumar o restar a las previsiones para que expliquen lo que oyes. Cada escucha guarda el margen de recepción de ese momento (su potencia, tu antena, tu cable, tu ruido local, el modo, la hora, el Sol y la tormenta), y un previo de ±6 dB evita correcciones exageradas con pocas escuchas.</p>
   <div class="kv"><div class="chip"><div class="k">${esc($("loc").value)} · ${ANTL()}</div><div class="v">${c.n>=3?(c.db>0?"+":"")+c.db+" dB":"—"}</div><div class="t">${c.n} escucha${c.n===1?"":"s"}${c.n<3?` (faltan ${3-c.n})`:""}</div></div>${all.filter(([kk])=>kk!==k).map(([kk,v])=>`<div class="chip"><div class="k">${esc(kk.replace("|"," · "))}</div><div class="v">${v.n>=3?(v.db>0?"+":"")+v.db+" dB":"—"}</div><div class="t">${v.n} escuchas</div></div>`).join("")}</div>
   <p class="note">La corrección se aplica a los dos sentidos: lo que más la mueve (eficiencia real de la antena, pérdidas, obstáculos) afecta igual al recibir y al transmitir.${OBS.length?' <button class="btn" id="caldel">Borrar mis escuchas</button>':""}</p>`;
  if($("caldel"))$("caldel").onclick=()=>{if(!confirm||true){OBS=[];dbSave("owner/cal",OBS);fitCal();refresh()}}}
/* ---------- avisos ---------- */
const TRIG="trig_01GUVtApDf5n6aUiEvA8tTzm",ATRIG="trig_016qZrtre2WYQ3oPNaQZPQcp";
let OWN=false,MEMB=null,SOC={ids:[],calls:[]},ALLM=[],CANW=null;
function renderAlBar(){const el=$("albar");if(!el)return;const al=L.alert;const age=al&&al.at?(Date.now()-Date.parse(al.at))/6e4:1e9;let off=null;try{off=sessionStorage.getItem("aloff")}catch(e){}
  const its=al&&al.items?al.items.filter(x=>CMS().includes(spotMode(x))):[];if(!its.length||age>150||off===al.at){el.hidden=true;return}
  el.hidden=false;const seenA=new Set(),uq=its.filter(x=>{if(seenA.has(x.call))return false;seenA.add(x.call);return true});el.innerHTML=`<div class="alh"><b>Aviso DX (${esc(fmtT(al.at))})</b><button class="lnk" id="alx" aria-label="Cerrar aviso">Cerrar</button></div><div class="all">${uq.slice(0,5).map(x=>`<button class="alr" data-call="${esc(x.call)}"><span><b>${CS(x.call)}</b></span><span class="alf">${esc(x.f)}${x.mode?" "+(window.ACRACB_mb?ACRACB_mb(x.mode):esc(x.mode)):""} · ${esc(x.t)} UTC${window.ACRACB_tags?ACRACB_tags(x,true):""}</span><span class="alv">Ver ficha</span></button>`).join("")}</div>`;
  el.querySelectorAll(".alr").forEach(b=>b.onclick=()=>{try{openCall(b.dataset.call)}catch(e){go("dx")}setTimeout(()=>{const c=[...document.querySelectorAll(".cpl")].find(x=>!x.hidden&&x.getClientRects().length);if(!c)return;let n=c;while(n&&n!==document.body){if(getComputedStyle(n).position==="fixed"){n.scrollTop=0;c.scrollTop=0;return}n=n.parentElement}c.scrollIntoView({behavior:"smooth",block:"start"})},150)});$("alx").onclick=()=>{try{sessionStorage.setItem("aloff",al.at)}catch(e){}el.hidden=true}}
/* ---------- socios ---------- */
const fmtD=iso=>{const d=new Date(iso);return isNaN(d)?"":d.toLocaleDateString("es-ES",{timeZone:"Europe/Madrid",day:"numeric",month:"short",year:"numeric"})};
const CALLRE=/^[A-Z0-9]{1,3}[0-9][A-Z0-9]{0,5}(\/[A-Z0-9]{1,4})?$/;
function renderMembers(){}
function renderAlerts(){normL();const al=L.alert;renderAlBar();$("alerts").innerHTML=(OWN?`<p class="note">DXpediciones activas y entidades raras de tu modo que aparecen en el clúster. Se revisan en cada actualización automática y al pulsar Actualizar. Solo te llegan, aquí, en la portada y en las notificaciones, los del modo y las bandas que elijas abajo.</p>`:`<p class="note">DXpediciones activas y entidades raras de tu modo que aparecen en el clúster. Se revisan en cada actualización automática y al pulsar Actualizar. Solo te llegan, aquí, en la portada y en las notificaciones, los del modo y las bandas que elijas abajo.</p>`)+
  (al&&al.items?`<h3 style="margin-top:10px">Último aviso (${esc(fmtT(al.at))})</h3>`+(al.items.length?al.items.map(x=>`<div class="sp"><span class="f">${esc(x.f)}</span><span><b>${CS(x.call)}</b> · ${esc(x.mode||"SSB")} · ${esc(x.t)} UTC</span><span class="w">Te falta la ${esc(x.need)} · lo oye ${CSL(String(x.by||"").split(/[ ,]+/))}</span></div>`).join(""):`<p class="note">Sin novedades.</p>`):"");
  const set=async on=>{if(!MCP){$("alst").textContent="Desde este visor no se pueden cambiar los avisos.";return}$("alst").textContent="Guardando…";try{await MCP.callTool("Claude Code Remote","update_trigger",{trigger_id:ATRIG,enabled:on},{cache:false});$("alst").textContent=on?"Avisos activados: se revisarán los clústeres cada dos horas.":"Avisos desactivados.";store.set("alerts",on?"1":"0")}catch(e){$("alst").textContent=e&&e.code==="approval_required"||e&&e.code==="not_in_manifest"?"Acepta el permiso que pide la página y vuelve a pulsar.":"No se pudo cambiar ("+(e&&e.code||"error")+")."}};
  if($("alon"))$("alon").onclick=()=>set(true);if($("aloff"))$("aloff").onclick=()=>set(false);const s=store.get("alerts");if(s&&MCP)$("alst").textContent=s==="1"?"Los avisos están activados.":"Los avisos están desactivados."}
/* ---------- cabecera ---------- */
function renderTop(){$("upd").textContent=L.updated||"—";const c=(v,g,y)=>v>=g?"g":v>=y?"y":"r";
  const sfiT=L.sfi>=150?"Muy alto: ionosfera muy cargada; 10 m abierto a casi todo de día":L.sfi>=100?"Bueno: hay radiación UV de sobra para que 15 y 12 m abran de día y 10 m hacia el sur":L.sfi>=80?"Medio: 20 y 17 m de día; 15 m solo en días buenos":"Bajo: poca ionización; de día lo mejor es 20 m";
  const kpT=L.kp>=5?"Tormenta: sube el ruido y se hunde la MUF en el norte. Busca rumbos al sur":L.kp>=4?"Activo: caminos a Norteamérica y Japón flojos y con QSB":L.kp>=3?"Algo agitado: caminos por el norte con algo de QSB":"Tranquilo: poco ruido y los caminos polares abiertos";
  const wT=L.wind>=600?"Muy rápido: tormenta probable; empeora el norte":L.wind>=500?"Rápido: empuja el Kp hacia arriba":L.wind>=450?"Algo rápido: puede agitar el campo si Bz va al sur":"Normal: por sí solo no altera la ionosfera";
  const bzT=L.bz<=-5?"Sur: abre el campo de la Tierra al viento solar; el Kp puede subir en 1–3 h":L.bz<0?"Algo al sur: deja entrar un poco de energía":"Norte: el campo de la Tierra frena el viento solar; todo estable";
  const flT="Probabilidad de llamarada en 24 h. Solo afecta de día: corta de golpe las bandas 15–60 min";
  const ssn=SSNV(),ssnT=ssn>=150?"Muchas manchas: Sol muy activo; bandas altas abiertas buena parte del día":ssn>=90?"Bastantes manchas: buena actividad; 15, 12 y 10 m abren de día":ssn>=50?"Actividad media: 20 y 17 m fiables; 15 m a ratos":"Pocas manchas: Sol tranquilo; de día lo mejor es 20 m";
  const items=[["SFI · flujo solar",L.sfi,c(L.sfi,110,90),sfiT],["SSN · manchas solares",ssn,c(ssn,90,50),ssnT+(L.space&&L.space.ssn!=null?" (número de manchas del día)":" (estimado a partir del SFI)")],["Kp · campo magnético",L.kp,L.kp>=5?"r":L.kp>=4?"y":"g",kpT],...(()=>{const a=L.space&&L.space.a!=null&&L.space.a!==""&&!isNaN(+L.space.a)?Math.round(+L.space.a):null;return a==null?[]:[["Índice A · actividad geomagnética del día",a,a>=20?"r":a>=10?"y":"g",a>=30?"Tormenta: día muy agitado, bandas bajas ruidosas y caminos polares cortados":a>=20?"Agitado: algo de QSB y ruido en los caminos por el norte":a>=10?"Algo inquieto: condiciones normales":"Tranquilo: día estable, buenos caminos polares"]]})(),["Viento solar",L.wind+" km/s",L.wind>=550?"r":L.wind>=450?"y":"g",wT],["Bz · dirección del campo",L.bz+" nT",L.bz<=-5?"r":L.bz<0?"y":"g",bzT],["Llamaradas",L.flare,"y",flT]];
  $("sw").innerHTML=items.map(([k,v,cl,t])=>`<div class="chip ${cl}" title="${esc(k+": "+t)}"><div class="k">${k.split(" · ")[0].replace("Viento solar","Viento").replace("Llamaradas","Llamarada")}</div><div class="v">${esc(v).replace(/ %/g,"\u00a0%").replace(/ (km\/s|nT)$/," <small>$1</small>")}</div><div class="t">${t}</div></div>`).join("");
  $("src").innerHTML="Fuentes de los datos en vivo: "+(()=>{const seen=new Set();return (L.sources||[]).filter(([n,u])=>{const k=String(u||n).replace(/[?#].*$/,"").replace(/\/$/,"").toLowerCase();if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>String(a[0]).localeCompare(String(b[0]),"es")).map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join(" · ")})()}
/* ---------- navegación ---------- */
const PAGES=["ahora","mapa","dx","sol","concursos","balizas","fichas","metodo"],MORE=new Set();
function go(pg,noScroll){if(!PAGES.includes(pg))pg="ahora";st.page=pg;store.set("page",pg);document.querySelectorAll(".page").forEach(s=>s.classList.toggle("on",s.dataset.pg===pg));document.querySelectorAll(".nav button").forEach(b=>{const on=b.dataset.pg===pg;b.setAttribute("aria-current",on?"page":"false");if(on){const n=b.parentNode;try{n.scrollTo({left:b.offsetLeft-(n.clientWidth-b.offsetWidth)/2,behavior:"smooth"})}catch(e){}}});{const sn=$("subnav");if(sn){sn.hidden=!MORE.has(pg)||pg==="mas";sn.querySelectorAll("button").forEach(b=>b.setAttribute("aria-current",b.dataset.pg===pg?"page":"false"))}}
  try{history.replaceState(null,"","#"+pg)}catch(e){}if(typeof renderPage==="function"&&$("eqnote").textContent)renderPage();if(!noScroll){const n=document.querySelector(".nav");if(n&&n.getBoundingClientRect().top<0)n.scrollIntoView({block:"start"})}}
document.querySelectorAll(".nav button,#subnav button").forEach(b=>b.onclick=()=>go(b.dataset.pg));document.querySelectorAll(".mtile").forEach(b=>b.onclick=()=>go(b.dataset.go));
/* ---------- refresco general ---------- */
function refresh(){CACHE.clear();RS=null;SPK=null;TXP=locToLL($("loc").value);
  $("locline").textContent=locName()+" ("+TXP[1].toFixed(3)+"° "+(TXP[1]>=0?"N":"S")+", "+Math.abs(TXP[0]).toFixed(3)+"° "+(TXP[0]>=0?"E":"O")+") · "+PWN()+" · "+ANTL();{const d=distJS(TXP,BASEQ);$("locw").textContent=window.ACRACB_HUBS?HUB.check(TXP):d>400?`A ${fk(d)} km de Alicante: rumbos, distancias y sol son exactos, pero la ionosfera calculada es la del este de España; la previsión pierde precisión.`:""}
  const P=+$("eq").value;$("sfiv").textContent=$("sfi").value+" (SSN ≈ "+Math.round(ssnFrom(+$("sfi").value))+")";$("kpv").textContent=$("kpauto").checked?`previsión NOAA (ahora ${L.kp})`:$("kp").value;
  $("eqnote").textContent=`${locName()} · ${PWN()} · ${ANTS().map(id=>ANT[id].n+(ANT[id].h?" a "+$(ANT[id].h).value+" m":"")+" ("+ANT[id].bands.map(b=>BANDS[b]).join(", ")+")").join(" + ")} · ${siteText()}.`+(+$("eq").value<=5?" En QRP las cifras suponen que te escuchan sin pile-up.":"");
{const u=new Set(ANTS());Object.entries({dph:"dip",efh:"efhw",vh:"invv",hxh:"hex",sph:"steppir",d80h:"d80",d160h:"d160",ybh:"yb",quh:"quad",ocfh:"ocf",g5h:"g5rv",lwh:"lw"}).forEach(([id,an])=>{const l=$(id).closest("label");if(l)l.hidden=!u.has(an)})}renderTop();renderCfg();renderPage();warmCache()}
/* precalcula en los ratos libres las 24 horas de todas las bandas, para que cambiar de pestaña sea instantáneo */
let WARM=0;function warmCache(){const id=++WARM;const T=TG(),B=[...new Set([...BI(),...(()=>{try{return CT().bands}catch(e){return []}})()])];let x=0,bi=0;const ric=window.requestIdleCallback?f=>requestIdleCallback(f,{timeout:400}):f=>setTimeout(f,40);
  const step=dl=>{if(id!==WARM||!B.length)return;const t0=performance.now();do{const b=B[bi];for(const t of T){prob(t,x,b,false);if(t.l)prob(t,x,b,true)}if(++bi>=B.length){bi=0;x++}}while(x<24&&(dl&&!dl.didTimeout?dl.timeRemaining()>4:performance.now()-t0<12));if(x<24)ric(step)};
  setTimeout(()=>ric(step),300)}
let TLT=0;
function renderPage(){const p=st.page;document.body.dataset.page=p;renderPgHelp();
  renderSum();if(p==="ahora"){renderEasy();renderVHF();clearTimeout(TLT);TLT=setTimeout(()=>{if(st.page!=="ahora")return;renderQTH();renderSide();setTimeout(()=>{if(st.page==="ahora"){renderTL();renderContrast()}},0)},0)}else if(p==="mapa")drawMap();else if(p==="dx"){renderSide();renderAlerts();limitList($("spots"),12,"spots");limitList($("dxl"),8,"DXpediciones")}else if(p==="concursos"){renderContestLazy()}else if(p==="sol"){renderSpace();spaceExplain();renderCycle();renderCotejo();renderSolar();renderOutlook()}else if(p==="balizas")renderBcn();else if(p==="fichas"){const at=curTab("fichas");if(at==="f_explo"||!at)renderExplorer();if(at==="f_info")renderInfo();if(at==="f_tbl")renderView()};setTimeout(foldSums,60)}
["modesel","eq","site","thr","rx","nz","hz","sfi","kp","vh","hxh","sph","d80h","d160h","dph","efh","ybh","quh","ocfh","g5h","lwh","antsel","gnd","coax","coaxl","swr","proc","pile","lnz","opw"].forEach(id=>{const f=()=>{store.set("c_"+id,$(id).value);refresh()};$(id).addEventListener($(id).tagName==="SELECT"?"change":"input",f)});
["kpauto","ionoon","calon"].forEach(id=>{const v=store.get(id);if(v!==null)$(id).checked=v==="1";$(id).addEventListener("change",()=>{store.set(id,$(id).checked?"1":"0");refresh()})});
$("mh").addEventListener("input",e=>{st.mhour=+e.target.value;refresh()});
$("mnow").onclick=()=>{st.mhour=localNow();$("mh").value=st.mhour;refresh()};
$("mfs").onclick=toggleFS;
$("mplay").onclick=()=>{if(st.play){clearInterval(st.play);st.play=null;$("mplay").textContent="Animar 24 h";return}
  st.play=setInterval(()=>{if(document.hidden)return;st.mhour=(st.mhour+1)%24;$("mh").value=st.mhour;drawMap()},1200);$("mplay").textContent="Parar"};
document.querySelectorAll('.tabs .tab').forEach(b=>b.onclick=()=>{st.view=b.dataset.v;renderView()});
document.querySelectorAll("[data-pa]").forEach(b=>b.onclick=()=>{st.path=b.dataset.pa;store.set("path",st.path);renderBandSeg();drawMap();renderView()});
document.querySelectorAll("[data-ly]").forEach(b=>b.onclick=()=>{st.ly[b.dataset.ly]=!st.ly[b.dataset.ly];store.set("ly",JSON.stringify(st.ly));renderBandSeg();drawMap()});
{const v=store.get("path");if(v&&["sp","lp","both"].includes(v))st.path=v;try{const l=JSON.parse(store.get("ly")||"null");if(l)Object.assign(st.ly,l)}catch(e){}try{const mb=JSON.parse(store.get("mbs")||"[]");if(Array.isArray(mb))st.mbs=mb.filter(x=>Number.isInteger(x))}catch(e){}const dn=store.get("dens");if(["pocos","normal","todos"].includes(dn))st.dens=dn}
document.querySelectorAll("[data-dn]").forEach(b=>b.onclick=()=>{st.dens=b.dataset.dn;store.set("dens",st.dens);renderBandSeg();drawMap()});
$("mzin").onclick=()=>zoomBy(1.6);$("mzout").onclick=()=>zoomBy(1/1.6);$("mzr").onclick=()=>zoomBy(0);
function setMode(m,user){st.mode=m;if(st.mband>=0&&!BI().includes(st.mband))st.mband=-1;store.set("mode",m);document.querySelectorAll('.modes button').forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===m));
  if(user){$("thr").value=m==="contest"?"48":"38";store.set("c_thr",$("thr").value)}
  syncHdr();
  $("modenote").innerHTML=m==="contest"
   ?`<b style='color:#ffc23d'>MODO CONCURSOS</b> desde Alicante (EA5 · Europa · zona CQ 14 · zona ITU 37). <select id="contest" aria-label="Concurso" style="width:auto;max-width:100%;display:inline-block">${CKEYS().map(k=>`<option value="${k}">${CONTESTS[k].n} (${MESES[CONTESTS[k].month-1]})</option>`).join("")}</select> <select id="cmon" aria-label="Propagación" style="width:auto;max-width:100%;display:inline-block"><option value="month">Propagación del mes del concurso</option><option value="now">Propagación de hoy</option></select><br>Umbral «QSO cómodo», porque en concurso tienen que copiarte a la primera. Plan, ritmo, pausas y trucos en la sección Concursos.`
   :"<b style='color:#28d7e8'>MODO DX</b>: destinos a más de 2.500 km y entidades escasas.";
  const cs=$("contest");if(cs){const v=store.get("contest");if(v&&CONTESTS[v]&&CKEYS().includes(v))cs.value=v;cs.onchange=()=>{store.set("contest",cs.value);CACHE.clear();renderBandSeg();refresh()}}
  const cm=$("cmon");if(cm){const v=store.get("cmon");if(v)cm.value=v;cm.onchange=()=>{store.set("cmon",cm.value);CACHE.clear();refresh()}}
  renderBandSeg();refresh()}
document.querySelectorAll('.modes button').forEach(b=>b.onclick=()=>setMode(b.dataset.m,true));
function syncHdr(){$("locin").value=$("loc").value;document.querySelectorAll('[data-ant]').forEach(b=>b.setAttribute("aria-pressed",ANTS().includes(b.dataset.ant)))}
function applyLoc(){const v=normLoc($("locin").value);if(!v){$("locin").setAttribute("aria-invalid","true");$("locw").textContent="Locator no válido. Escribe 4, 6, 8 o 10 caracteres, por ejemplo IM98RN o IM98RN98.";return}
  $("locin").removeAttribute("aria-invalid");$("loc").value=v;store.set("c_loc",v);closePop();refresh()}
$("locok").onclick=applyLoc;$("locin").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();applyLoc()}});
function applyAlt(){let h=Math.round(+$("altin").value);if(!isFinite(h)||h<0)h=0;$("altin").value=h;$("site").value=h>=700?"4":"0";store.set("c_alt",String(h));$("altk").textContent=h>=700?"alto":"normal";refresh()}
$("altin").addEventListener("change",applyAlt);$("altin").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();applyAlt()}});

const PWN=()=>{const w=+$("eq").value;return (w>=1000?(w/1000).toLocaleString("es-ES")+" kW":w+" W")+" "+(w<=5?"QRP":w<=100?"Low Power":"High Power")};
/* ---------- modo fácil ---------- */
const SEGF={0:"1.840 y 1.900",1:"3.600 y 3.800",2:"7.060 y 7.200",3:"14.125 y 14.300",4:"18.120 y 18.168",5:"21.200 y 21.450",6:"24.940 y 24.990",7:"28.400 y 29.000"};
const CARD=["norte","nornoreste","noreste","estenoreste","este","estesureste","sureste","sursureste","sur","sursuroeste","suroeste","oestesuroeste","oeste","oestenoroeste","noroeste","nornoroeste"];
const card=az=>CARD[Math.round(((az%360)+360)%360/22.5)%16];
const dirTxt=az=>`${Math.round(az)}° ${cab(az)}`;
const CONTN={NA:"Norteamérica y el Caribe",SA:"Sudamérica",AF:"África",AS:"Asia y Oriente Medio",OC:"Oceanía",EU:"Europa"};
const easyAt=lh=>memo("ez|"+lh+"|"+MOD()+"|"+st.mode,()=>easyAt0(lh));
function easyAt0(lh){let bestB=null;for(const b of BI()){const ts=TG().filter(inMode).map(t=>{const a=prob(t,lh,b,false),c=prob(t,lh,b,true);return c.p>a.p?{t,p:c.p,lp:true}:{t,p:a.p,lp:false}}).filter(x=>x.p>=.3).sort((a,c)=>c.p-a.p);
    const sc=ts.reduce((s,x)=>s+x.p,0);if(!bestB||sc>bestB.sc)bestB={b,ts,sc}}return bestB&&bestB.ts.length?bestB:null}
/* cómo orientar la antena que el usuario ha elegido, banda a banda */
const DIRA=new Set(["steppir","hex","yb","quad"]),DIPA=new Set(["dip","d80","d160","ocf","g5rv","efhw","lw"]);
function aimTxt(az,lp,b){const ids=ANTS().filter(id=>ANT[id]&&ANT[id].bands.includes(b));const lpx=lp?", por el camino largo: la señal da la vuelta al mundo por el lado contrario":"";
  if(ids.some(id=>DIRA.has(id)))return `<b>Hacia dónde apuntar la directiva:</b> <b>${dirTxt(az)}</b>${lpx}.`;
  if(ids.some(id=>DIPA.has(id)))return `<b>Rumbo del destino:</b> <b>${dirTxt(az)}</b>${lpx}. Tu antena de hilo radia más de costado: rinde mejor si el hilo va de lado respecto a ese rumbo.`;
  if(ids.includes("mloop"))return `<b>Rumbo del destino:</b> <b>${dirTxt(az)}</b>${lpx}. Gira el aro para que su plano mire hacia ese rumbo.`;
  return `<b>Rumbo del destino:</b> <b>${dirTxt(az)}</b>${lpx}. Tu antena radia igual hacia todos lados: no hace falta girarla.`}
function easyCard(title,lh,e){if(!e)return `<div class="ez"><div class="ezt">${title}</div><p class="ezbig">Bandas tranquilas</p><p>Sin aperturas claras al DX. Buen momento para escuchar.</p></div>`;
  const top=e.ts.slice(0,8),conts=[...new Set(top.map(x=>x.t.cont))].map(c=>CONTN[c]);const lp=top[0].lp;const az=lp?top[0].t.laz:top[0].t.az;const p=top[0].p;
  const word=p>=.7?"muy buena":p>=.5?"buena":"aceptable";const omni=!ANTS().some(id=>ANT[id]&&ANT[id].bands.includes(e.b)&&(DIRA.has(id)));
  return `<div class="ez"><div class="ezt">${title}</div>
   <p class="ezbig"><b style="color:${BC[e.b]}">${BANDS[e.b]}</b> · ${word}</p>
   <p>${top.slice(0,3).map(x=>esc(x.t.name.split(" (")[0])).join(", ")} · ${Math.round(p*100)} %</p>
   <p>${omni?"Rumbo":"Apunta a"} <b>${dirTxt(az)}</b>${lp?" (camino largo)":""}</p>
   <details class="why"><summary>Ver por qué</summary><p>Frecuencias: ${segTxt(e.b)}.</p><p><b>Con quién:</b> ${top.slice(0,8).map(x=>esc(x.t.name.split(" (")[0])).join(", ")}${conts.length?" ("+conts.join(", ")+")":""}.</p><p>${aimTxt(az,lp,e.b)}</p><p class="note">${e.b<=2?"Banda de noche: de día el sol la apaga.":e.b>=5?"Banda de día: funciona mientras hay sol en el camino.":"Funciona de día y buena parte de la noche."}</p></details></div>`}
function withStd(fn){const keep={};["ant","antsel","eq","sph","pile","coax","calon"].forEach(id=>keep[id]=id==="calon"?$(id).checked:$(id).value);$("antsel").value="std";$("eq").value="100";$("sph").value="12";$("pile").value="0";$("coax").value="0.63";$("calon").checked=false;CACHE.clear();SPK=null;
  try{return fn()}finally{Object.entries(keep).forEach(([id,v])=>{if(id==="calon")$(id).checked=v;else $(id).value=v});CACHE.clear();SPK=null}}
function renderEasy(){renderEasy0();const z=$("easy")&&$("easy").querySelector(".ezg");if(z)z.insertAdjacentHTML("beforeend",easyVHF());renderGlos()}
let EZG=0;
function ezHours(now){const a=[];for(let x=now+1;x<now+12;x++)a.push(x%24);for(const x of [20,21,22,23,0,1,2,5,6,7])if(!a.includes(x))a.push(x);return a}
function ezDone(lh){return MZ.has("ez|"+lh+"|"+MOD()+"|"+st.mode)}
function renderEasy0(){const now=localNow(),g=++EZG;const hrs=ezHours(now);
  if(hrs.every(ezDone))return renderEasyS(now,true);
  renderEasyS(now,false);let i=0;
  const step=()=>{if(g!==EZG)return;const t0=performance.now();while(i<hrs.length&&performance.now()-t0<12)easyAt(hrs[i++]);if(i<hrs.length)return setTimeout(step,0);renderEasy()};setTimeout(step,0)}
function renderEasyS(now,full){const e0=easyAt(now);let best=null,night=null;
  if(full){for(let x=now+1;x<now+12;x++){const h=x%24,e=easyAt(h);if(e&&(!best||e.sc>best.e.sc))best={h,e}}
    for(const x of [20,21,22,23,0,1,2,5,6,7]){const e=easyAt(x);if(e&&(!night||e.sc>night.e.sc))night={h:x,e}}}
  const dx=L.dx.filter(dxNew).map(d=>{const t=tFor(d);return t?{d,t,...bestAny(t,now)}:null}).filter(x=>x&&x.p>=.3).sort((a,b)=>b.p-a.p).slice(0,2);
  $("easy").innerHTML=`<div class="ezg">${easyCard("Ahora · "+hh(now)+":00",now,e0)}${full?(best?easyCard("Mejor hora próxima · "+hh(best.h)+":00",best.h,best.e):"")+(night&&(!best||night.h!==best.h)?easyCard("Noche o amanecer · "+hh(night.h)+":00",night.h,night.e):""):`<div class="ez"><div class="ezt">Próximas horas</div><p class="note">Calculando…</p></div>`}</div>`+
   (dx.length?`<div class="ez ezdx"><div class="ezt">Estaciones raras en el aire</div>${dx.map(x=>`<p><b>${CS(x.d.call)}</b> · ${BANDS[x.b]}${x.d.qsx?" · "+esc(x.d.qsx):""} · ${dirTxt(x.lp?x.t.laz:x.t.az)}</p>`).join("")}</div>`:"")+
   `<details class="why"><summary>Palabras que conviene saber</summary><div class="ez ezg2" id="glos"></div></details>`}
/* ---------- glosario que va cambiando ---------- */
const GLOS=[["Banda","el «canal grande» de la radio (40 m, 20 m, 15 m…). Las bajas (160, 80, 40) funcionan de noche y las altas (15, 12, 10), de día."],
 ["Pile-up","muchas estaciones llamando a la vez a una estación rara. Hay que esperar el turno y decir el indicativo una sola vez."],
 ["Split","la estación rara habla en una frecuencia y escucha en otra, normalmente un poco más arriba («up 5» = 5 kHz más arriba)."],
 ["Línea gris","el amanecer y el atardecer. Las señales llegan más lejos porque la capa que absorbe ya no está y la que refleja sigue cargada."],
 ["Paso largo","la señal da la vuelta al mundo por el lado contrario porque ese camino está mejor iluminado. La antena se apunta al revés."],
 ["QSB","la señal sube y baja de fuerza. Pasa sobre todo con tormentas geomagnéticas o caminos muy largos."],
 ["QRM","interferencias de otras estaciones cerca de tu frecuencia."],
 ["QRN","ruido atmosférico: rayos, estática. Se nota mucho en 80 y 160 m en verano."],
 ["QRZ?","«¿quién me llama?». Lo dice la estación cuando no ha entendido el indicativo."],
 ["59","el reporte de señal: 5 = se entiende perfectamente, 9 = señal muy fuerte. En DX casi siempre se da 59."],
 ["DXpedición","un grupo que viaja a una isla o país con pocos radioaficionados para que todo el mundo pueda contactar con ese «país»."],
 ["Entidad DXCC","cada uno de los 340 «países» de la radio. Algunas son islas o zonas que cuentan aparte aunque pertenezcan a otro país."],
 ["Clúster","una red en internet donde los radioaficionados anuncian a quién están oyendo y en qué frecuencia."],
 ["Spot","cada aviso del clúster: indicativo, frecuencia, hora y quién lo ha oído."],
 ["Propagación","cómo viaja la señal rebotando en la ionosfera. Cambia con la hora, la estación del año y el Sol."],
 ["Ionosfera","capas de aire ionizado por el Sol, entre 60 y 400 km de altura, que hacen de espejo para la onda corta."],
 ["MUF","la frecuencia más alta que todavía rebota hacia un destino. Por encima de la MUF, la señal se va al espacio."],
 ["Zona de silencio","la franja entre tu estación y el primer rebote donde no te oye nadie. Por eso a veces no oyes a los de tu provincia."],
 ["Índice K o Kp","mide si el campo magnético de la Tierra está tranquilo (0–2) o en tormenta (5 o más)."],
 ["Flujo solar (SFI)","cuánta energía manda el Sol. Con más de 100, las bandas altas abren bien."],
 ["Llamarada","una explosión en el Sol. De día puede dejar todas las bandas mudas durante unos minutos."],
 ["Directiva","una antena que concentra la señal hacia un lado. Hay que girarla hacia el destino."],
 ["Rumbo","la dirección en grados hacia donde apuntar la antena: 0° norte, 90° este, 180° sur y 270° oeste."],
 ["Locator","un código de 4 a 8 caracteres (como IM98RI) que dice dónde está una estación, en cuadros sobre el mapa."],
 ["QSL","la confirmación de un contacto, en papel o en internet (QRZ, LoTW, Club Log)."],
 ["Concurso","una competición de fin de semana para hacer el máximo número de contactos con el máximo de países y zonas."],
 ["Multiplicador","en un concurso, cada país o zona nuevo multiplica tu puntuación. Por eso se buscan tanto."],
 ["QRP","transmitir con muy poca potencia, hasta 5 W. Es un reto: hace falta buena propagación y paciencia."],
 ["E esporádica","nubes de ionización muy densa que aparecen sobre todo en verano y abren 10 m de golpe a 1.000–2.000 km."],
 ["Radiales","cables en el suelo o elevados que hacen de «espejo» para una antena vertical. Cuantos más, mejor."],
 ["ROE","indica cuánta potencia vuelve de la antena hacia el equipo. Lo ideal es 1:1; por encima de 2:1 se pierde señal."],
 ["CW","la telegrafía: puntos y rayas. Llega más lejos que la voz con la misma potencia, porque ocupa muy poco ancho de banda."],
 ["FT8","un modo digital que se maneja con el ordenador: cada mensaje dura 15 segundos y se descifra aunque la señal no se oiga a oído."],
 ["Fox/Hound","la forma en que muchas DXpediciones trabajan en FT8: la expedición (fox) contesta a varias estaciones (hounds) a la vez."],
 ["Baliza","un emisor automático que transmite siempre igual. Si la oyes, esa dirección está abierta."]];
let GLSEED=Math.floor(Math.random()*1e6);
function renderGlos(){const el=$("glos");if(!el)return;const want=new Set();if(kpAt(localNow())>=4)["QSB","Índice K o Kp"].forEach(x=>want.add(x));if(SPOTS().some(x=>/split|up/i.test(x.c)))want.add("Split");if((L.dx||[]).length)want.add("DXpedición");
  const el0=sunEl(TXP,localNow());if(el0>-6&&el0<6)want.add("Línea gris");if(st.mode==="contest")["Concurso","Multiplicador"].forEach(x=>want.add(x));
  const rest=GLOS.filter(g=>!want.has(g[0]));let r=GLSEED;const rnd=()=>{r=(r*9301+49297)%233280;return r/233280};rest.sort(()=>rnd()-.5);
  const pick=[...GLOS.filter(g=>want.has(g[0])).slice(0,2),...rest].slice(0,5);
  el.innerHTML=`<div class="ezt">Palabras que oirás en la radio</div><ul>${pick.map(([k,v])=>`<li><b>${k}</b>: ${v}</li>`).join("")}</ul><p class="note" style="margin:6px 0 0">Cambian cada minuto. <button class="btn" id="glosnext">Otras palabras</button></p>`;
  $("glosnext").onclick=()=>{GLSEED=Math.floor(Math.random()*1e6);renderGlos()}}
setInterval(()=>{if(document.hidden)return;if(st.page==="ahora"){GLSEED=Math.floor(Math.random()*1e6);renderGlos()}},60000);
/* ---------- tu QTH ---------- */
function renderQTH(){const lhn=localNow()+new Date().getMinutes()/60,se=sunEvents(TXP),el=sunElF(TXP,lhn),fo=foF2est(localNow()),alt=+$("altin").value;
  const ib=TXP[1]>35.5&&TXP[1]<44&&TXP[0]>-10&&TXP[0]<4.5;const anti=[TXP[0]>0?TXP[0]-180:TXP[0]+180,-TXP[1]],an=nearestT(anti,0),ad=distJS(anti,[an.lon,an.lat]);
  const seg=[];for(let i=0;i<96;i++){const e=sunElF(TXP,i/4+.125);seg.push(e<-12?"var(--q0)":e<-6?"#1b2540":e<0?"#4b3a7a":e<6?"#8a5a6a":e<20?"#b9783e":"#d9a441")}
  const pos=x=>(x/24*100).toFixed(2)+"%";const gw=[se.rise!=null?[se.rise-.5,se.rise+.5]:null,se.set!=null?[se.set-.5,se.set+.5]:null].filter(Boolean);
  const nb=BCN.map(b=>({b,d:distJS(TXP,[b[2],b[3]])})).sort((a,c)=>a.d-c.d)[0];
  const sk=[2,3,5].map(b=>`<span><b style="color:${BC[b]}">${BANDS[b]}</b> ${skipTxt(b,localNow()).replace("silencio hasta ","silencio ")}</span>`).join("");
  $("qth").innerHTML=`<div class="qhead"><div><h2 style="border:0;margin:0;padding:0">Tu QTH ahora</h2><div class="qloc">${esc($("loc").value)}</div><div class="note">${TXP[1].toFixed(4)}° ${TXP[1]>=0?"N":"S"} · ${Math.abs(TXP[0]).toFixed(4)}° ${TXP[0]>=0?"E":"O"} · ${fk(alt)} m${ib?" · zona CQ 14 · zona ITU 37":""}</div></div>
   <div class="qsun"><div class="qbig">${el>-6&&el<6?"Línea gris":el>0?"De día":"De noche"}</div><div class="note">Sol a ${el.toFixed(0)}° ${el>=0?"sobre":"bajo"} el horizonte</div></div></div>
   <div class="dbar" role="img" aria-label="Día y noche en tu QTH hoy">${seg.map(c=>`<i style="background:${c}"></i>`).join("")}<span class="dnow" style="left:${pos(lhn)}"></span>${se.rise!=null?`<span class="dlab" style="left:${pos(se.rise)}">▲ ${hm(se.rise)}</span>`:""}${se.set!=null?`<span class="dlab" style="left:${pos(se.set)}">▼ ${hm(se.set)}</span>`:""}</div>
   <div class="dax">${[0,3,6,9,12,15,18,21,24].map(h=>`<span style="left:${pos(h)}">${hh(h)}</span>`).join("")}</div>
   <div class="qgrid">
    <div><span class="k">Salida y puesta</span><b>${se.rise!=null?hm(se.rise):"—"} · ${se.set!=null?hm(se.set):"—"}</b><span class="t">mediodía solar ${hm(se.noon)} (hora local)</span></div>
    <div><span class="k">Línea gris</span><b>${gw.map(w=>hm(w[0])+"–"+hm(w[1])).join(" · ")||"—"}</b><span class="t">±30 min de la salida y la puesta: la mejor ventana para DX lejano en 40 y 20 m</span></div>
    <div><span class="k">Ionosfera encima</span><b>foF2 ≈ ${fo?fo.toFixed(1):"—"} MHz</b><span class="t">MUF a 3.000 km ≈ ${fo?(fo*3.2).toFixed(0):"—"} MHz (estimada${ionoK(localNow())!==1?", corregida con la ionosonda":""})</span></div>
    <div><span class="k">Zona de silencio ahora</span><b class="sk">${sk}</b><span class="t">distancia mínima a la que vuelve la señal</span></div>
    <div><span class="k">Baliza más cercana</span><b>${nb.b[0]}</b><span class="t">${esc(nb.b[1])}, ${fk(nb.d)} km, rumbo ${Math.round(brgJS(TXP,[nb.b[2],nb.b[3]]))}° ${cab(brgJS(TXP,[nb.b[2],nb.b[3]]))}</span></div>
    <div><span class="k">Tus antípodas</span><b>${Math.abs(anti[1]).toFixed(1)}° ${anti[1]>=0?"N":"S"} · ${Math.abs(anti[0]).toFixed(1)}° ${anti[0]>=0?"E":"O"}</b><span class="t">${ad<1500?"cerca de "+esc(an.name.split(" (")[0]):"en pleno océano; lo más cercano: "+esc(an.name.split(" (")[0])}: ahí todos los rumbos llegan por igual</span></div>
   </div>`}
/* ---------- configuración activa ---------- */
const MYKEYS=["locin","altin","eq","antsel","gnd","sph","d80h","d160h","coax","coaxl"];
const CLUBP={locin:"IM98RI99",altin:"10",antsel:"club",gnd:"avg",sph:"12",d80h:"12",d160h:"15"};
function setPreset(p){MYKEYS.forEach(k=>{if(p[k]!==undefined)$(k).value=p[k]});MYKEYS.forEach(k=>{if(k!=="locin"&&k!=="altin")store.set("c_"+k,$(k).value)});applyAlt();applyLoc();refresh()}
function renderStSum(){const el=$("stsum");if(!el)return;const club=$("loc").value.slice(0,6)==="IM98RI"&&$("antsel").value==="club";
  el.innerHTML=`<p class="note" style="margin:0 0 8px">Lo básico se elige arriba. Aquí se afinan las alturas de la antena elegida, el cable, la ROE, el procesador, el ruido y la estación del otro lado.</p>
  
  <p style="margin:0 0 4px"><button class="btn" id="psclub">Usar la sede del club (EA5RKB)</button>${store.get("my_p")?` <button class="btn" id="psmine">Volver a mi estación</button>`:""}</p>
  <p class="note" style="margin:0 0 10px">Sede: IM98RI99, 10 m de altitud, directiva de 3 elementos a 12 m y dipolos de 80 m (12 m) y 160 m (15 m). No cambia potencia ni cable.</p>`;
  $("psclub").onclick=()=>{if(!club){const m={};MYKEYS.forEach(k=>m[k]=$(k).value);store.set("my_p",JSON.stringify(m))}$("locin").value=CLUBP.locin;setPreset(CLUBP)};
  if($("psmine"))$("psmine").onclick=()=>{try{setPreset(JSON.parse(store.get("my_p")))}catch(e){}}}
function renderCfg(){renderStSum();if($("cfg").open)renderCal();const P=+$("eq").value,a=$("ant").value,mon=useMonth(),dB=10*Math.log10(P/100),rx=+$("rx").value,nz=+$("nz").value,c=calDb();
  const rxN={"-1":"dipolo o vertical (+2 dBi)","0":"media (+3 dBi)","4":"directiva (+7 dBi)"}[$("rx").value],nzN={"-10":"urbano","-5":"residencial","0":"rural","5":"muy tranquilo"}[$("nz").value];
  $("cfgs").innerHTML=`<b>Cálculo:</b> ${esc($("loc").value)} · ${PWN()} · ${ANTS().map(id=>ANT[id].n+(ANT[id].h?" a "+$(ANT[id].h).value+" m":"")).join(" + ")} · ${"SFI "+$("sfi").value+" · SSN "+(st.sfiManual?Math.round(ssnFrom(+$("sfi").value)):SSNV())+" · Kp "+($("kpauto").checked?L.kp:$("kp").value)}${mon?" · "+MESES[mon-1]:""} <span class="cfgm">ajustes finos</span>`;
  const g10=b=>{const p=antPick(b,10);return p?p.g:null};
  const cmp=`<div class="tblw"><table class="bt" style="margin-top:10px"><tr><th>Antena</th>${BALL.map(b=>`<th><span style="color:${BC[b]}">●</span> ${BANDS[b].replace(/\s+m$/,"")}</th>`).join("")}</tr>${ANTORD.map(id=>{const on=ANTS().includes(id);return `<tr style="${on?"":"opacity:.55"}"><td>${ANT[id].n}${ANT[id].h?" ("+$(ANT[id].h).value+" m)":""}${on?" <b>·</b>":""}</td>${BALL.map(b=>{if(!ANT[id].bands.includes(b))return "<td>—</td>";const g=gAnt(id,10,b)-gVert(10);const best=on&&antKind(b)===id;return `<td class="f" style="${best?"color:var(--accent);font-weight:600":""}">${g>0?"+":""}${g.toFixed(1)}</td>`}).join("")}</tr>`}).join("")}</table></div><p class="note">Ganancia de cada tipo de antena frente a la vertical portable a 10° de salida, en dB, con las alturas habituales que ves entre paréntesis (se cambian arriba si eliges esa antena) y tu tipo de suelo. Marcadas con un punto, las que estás usando; en ámbar, la que se usa en cada banda.</p>`;
  const rows=BALL.map(b=>{const k=antKind(b),g=g10(b);return `<tr><td><span style="color:${BC[b]}">●</span> ${BANDS[b]}</td><td>${k==="none"?"<span class='bad'>ninguna de tus antenas cubre esta banda</span>":ANT[k].n+(ANT[k].h?" a "+$(ANT[k].h).value+" m":"")}</td><td class="f">${g===null?"—":(g>0?"+":"")+g.toFixed(1)+" dB"}</td></tr>`}).join("");
  $("cfgb").innerHTML=`<div class="g2" style="margin-top:8px"><div><table class="bt"><tr><th>Banda</th><th>Antena con la que se calcula</th><th>Frente a la vertical, a 10° de salida</th></tr>${rows}</table>${cmp}<p class="note">La ganancia real de cada antena cambia con el ángulo de salida de cada camino: en cada cálculo se usa el ángulo que da VOACAP para ese destino, banda y hora. La directiva se supone girada hacia cada destino.</p></div>
   <ul class="note mlist" style="margin:0">
   <li><b>Locator ${esc($("loc").value)}</b>: ${TXP[1].toFixed(4)}° ${TXP[1]>=0?"N":"S"}, ${Math.abs(TXP[0]).toFixed(4)}° ${TXP[0]>=0?"E":"O"} (centro del cuadro). Desde aquí salen los rumbos, distancias, saltos, salida y puesta del sol y línea gris.</li>
   <li><b>Potencia</b>: ${PWN()} de salida (en fonía, pico de envolvente) = ${dB>=0?"+":""}${dB.toFixed(0)} dB respecto a 100 W. Categorías de concurso, iguales en todos los modos (CQ WW, CQ WPX, ARRL DX e IARU): <b>QRP</b> hasta 5 W, <b>Low Power</b> hasta 100 W y <b>High Power</b> por encima de 100 W, hasta el máximo de tu licencia.${P<=5?" En QRP las cifras suponen que te escuchan sin pile-up.":""}</li>
   ${ANTS().map(id=>`<li><b>${ANT[id].n}</b>${ANT[id].h?" a "+$(ANT[id].h).value+" m":""}: ${ANT[id].d}. Bandas: ${ANT[id].bands.map(b=>BANDS[b]).join(", ")}.</li>`).join("")}<li>Si eliges varias antenas, en cada banda y camino se usa la que más gana con el ángulo de salida de ese camino. Las directivas se suponen giradas hacia cada destino. Las alturas se cambian arriba, en los ajustes finos.</li>
   <li><b>Altitud</b>: ${siteText()}.</li>
   <li><b>Entorno de la antena</b>: ${gnd().n} (suelo con εr ${gnd().er} y σ ${gnd().sg} S/m). El reflejo en el suelo se calcula con las fórmulas de Fresnel para cada ángulo y banda. El agua salada refleja casi como un espejo y da a las verticales varios dB más a ángulos bajos, que es lo que cuenta para el DX; a las antenas horizontales les cambia poco.${gnd().half?" Junto al mar se aplica la mitad de esa mejora, porque solo la reciben los rumbos que salen sobre el agua.":""}</li>
   <li><b>Estación al otro lado</b>: antena ${rxN}${rx?" ("+(rx>0?"+":"")+rx+" dB)":""}; ruido allí ${nzN}${nz?" ("+(nz>0?"+":"")+nz+" dB)":""}.</li>
   <li><b>Línea de transmisión</b>: ${$("coax").value==="0"?"no se cuenta":$("coax").selectedOptions[0].text+", "+$("coaxl").value+" m"} → pérdida ${[0,1,2,3,5,7].map(b=>BANDS[b]+" "+coaxLoss(b).toFixed(1)).join(" · ")} dB. ROE ${(+$("swr").value).toFixed(1).replace(".",",")}:1 → ${swrLoss().toFixed(2).replace(".",",")} dB de desadaptación. Ningún cable es «sin pérdidas»: los Hyperflex y Ultraflex de Messi &amp; Paoloni son de baja pérdida y flexibles; sus cifras son aproximadas, sacadas de las hojas del fabricante.</li>
   <li><b>Tú le oyes</b>: se calcula aparte con la otra estación transmitiendo ${$("opw").selectedOptions[0].text}, tus mismas antenas al recibir, tu cable y tu ruido de fondo ${$("lnz").selectedOptions[0].text.split(" ·")[0]} (${rxNoisePen(3)?"−"+rxNoisePen(3)+" dB frente a un campo tranquilo":"sin penalización"}).</li>
   <li><b>Modo</b>: ${MD().n}: ${MD().d}${MOD()==="ssb"?"":" (estimación; "+MD().adj+" dB menos de SNR necesaria)"}.</li>
   <li><b>Procesador de voz</b>: ${MOD()!=="ssb"?"no se aplica en "+MD().s:$("proc").value==="3"?"activado: +3 dB de potencia media en SSB":"desactivado"}.</li>
   <li><b>Competencia</b>: ${$("pile").value==="0"?"sin pile-up":$("pile").selectedOptions[0].text.toLowerCase()}.</li>
   <li><b>Ajuste total por línea, procesador y competencia</b>: ${[3,7].map(b=>BANDS[b]+" "+(lineAdj(b)>=0?"+":"")+lineAdj(b).toFixed(1)).join(" · ")} dB.</li>
   <li><b>No se tiene en cuenta</b>: Es esporádica (capa E esporádica), dispersión auroral o por meteoros, tensión de la fuente ni obstáculos concretos del horizonte.</li>
   <li><b>Éxito</b>: ${$("thr").value==="48"?"QSO cómodo (te copian bien a la primera)":"QSO posible (te copian con esfuerzo)"}.</li>
   <li><b>Sol</b>: SFI ${$("sfi").value} → SSN ≈ ${Math.round(ssnFrom(+$("sfi").value))}. Kp: ${$("kpauto").checked?"previsión NOAA hora a hora (ahora "+L.kp+")":"fijo en "+$("kp").value}.</li>
   <li><b>Corrección del día</b>: ${!$("ionoon").checked?"desactivada":ionoSrc()==="ionosonda"?"ionosonda "+esc(L.iono.station||"")+" (foF2 "+L.iono.fof2+" MHz)":ionoSrc()==="clúster"?"no hay ionosonda; los spots de las últimas 2 h ("+spotK().n+") indican una MUF un "+Math.round((spotK().k-1)*100)+" % más alta que la media del mes; se aplica a las horas cercanas a ahora":"sin corrección: no hay ionosonda reciente ni spots que indiquen otra cosa"}.</li>
   <li><b>Tu calibración</b>: ${c?(c>0?"+":"")+c+" dB":"ninguna todavía en este cuadro con esta antena"}.</li>
   <li><b>Modo</b>: ${st.mode==="contest"?CT().n+", bandas "+BI().map(b=>BANDS[b]).join(", "):"DX, todas las bandas"}.</li></ul></div>`}
/* ---------- reloj ---------- */
function tick(){if(document.hidden)return;const n=new Date();$("cku").textContent=n.toISOString().slice(11,19);$("ckl").textContent=n.toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"});
  const lhf=parseInt(n.toLocaleString("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:false}),10)%24+n.getMinutes()/60;const e=sunElF(TXP,lhf);$("cks").textContent=e>-6&&e<6?"línea gris":e>0?"de día · "+e.toFixed(0)+"°":"de noche";$("cks").title=`El sol está a ${e.toFixed(0)}° ${e>=0?"sobre":"bajo"} el horizonte en tu locator. Línea gris = entre 6° bajo y 6° sobre el horizonte.`}
setInterval(tick,1000);
/* ---------- arranque ---------- */
$("sfi").value=L.sfi;$("kp").value=L.kp;
$("eq").value="100";$("site").value="0";$("ant").value="steppir,hex,invv,d80,d160,vert";if(store.get("antv")!=="2"){store.set("c_ant","steppir,hex,invv,d80,d160,vert");store.set("antv","2")}["modesel","eq","site","thr","rx","nz","hz","ant","vh","hxh","sph","d80h","d160h","dph","efh","ybh","quh","ocfh","g5h","lwh","antsel","gnd","coax","coaxl","swr","proc","pile","lnz","opw"].forEach(id=>{const v=store.get("c_"+id);if(v!==null&&v!==""&&($(id).tagName!=="SELECT"||[...$(id).options].some(o=>o.value===v)))$(id).value=v});if(store.get("locv")!=="2"){store.set("c_loc","IM98RI99");store.set("c_alt","10");store.set("locv","2")}{const v=normLoc(store.get("c_loc"));$("loc").value=v||"IM98RI99"}{const h=+(store.get("c_alt")||10);$("altin").value=isFinite(h)?h:10;$("site").value=+$("altin").value>=700?"4":"0";$("altk").textContent=$("site").value==="4"?"alto":"normal"}
st.mhour=localNow();$("mh").value=st.mhour;st.zone=store.get("pz")||"py";if(!T(st.zone))st.zone="py";
loadLocal();
initStart();const hpg=(location.hash||"").slice(1);go(PAGES.includes(hpg)?hpg:(store.get("page")||"ahora"),true);
renderBandSeg();syncHdr();setMode(store.get("mode")||"dx",false);tick();
/* ---------- datos en vivo y botón Actualizar ---------- */
const fmtT=iso=>{const d=new Date(iso);return isNaN(d)?"":d.toLocaleTimeString("es-ES",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"})};
function updSt(txt,cl){const e=$("updst");e.className="note "+(cl||"");e.textContent=txt;const b=$("updbtn"),r=cl==="updst-run";b.classList.toggle("run",r);b.querySelector(".tx").textContent=r?"Actualizando…":"Actualizar"}
let RUNNING=null;
/* botones a clústeres externos: abre en pestaña nueva y, si el visor lo bloquea, ofrece la dirección para copiar o pulsar */
document.addEventListener("click",ev=>{const a=ev.target.closest("a[data-ext]");if(!a)return;ev.preventDefault();const u=a.href;let w=null;try{w=window.open(u,"_blank")}catch(e){w=null}
  if(w){try{w.opener=null}catch(e){}return}
  const fb=$("extfb");if(!fb){location.href=u;return}fb.hidden=false;
  fb.innerHTML=`Este visor no deja abrir pestañas nuevas. Abre <b>${esc(a.textContent)}</b> en tu navegador: <a href="${esc(u)}" target="_top" rel="noopener noreferrer">${esc(u)}</a> <button class="lnk" id="extcp">Copiar dirección</button>`;
  $("extcp").onclick=async()=>{let ok=false;try{await navigator.clipboard.writeText(u);ok=true}catch(e){try{const t=document.createElement("textarea");t.value=u;document.body.appendChild(t);t.select();ok=document.execCommand("copy");t.remove()}catch(e2){}}$("extcp").textContent=ok?"Copiada":"Mantén pulsado el enlace para copiarlo"}},true);

function applyLive(n){if(!n||!n.updatedUTC||(L.updatedUTC&&n.updatedUTC<L.updatedUTC))return;const keepAlert=L.alert;Object.keys(L).forEach(k=>delete L[k]);Object.assign(L,n);if(keepAlert&&!L.alert)L.alert=keepAlert;normL();$("sfi").value=L.sfi;$("kp").value=L.kp;CACHE.clear();renderBandSeg();refresh()}
(async()=>{
  const NOLIVE=()=>{const m=String(L.updated||"").match(/(\d{4})-(\d\d)-(\d\d) (\d\d:\d\d)/);const age=(Date.now()-(Date.parse(L.updatedUTC)||Date.now()))/6e4;const when=m?`${+m[3]}/${+m[2]} a las ${m[4]}`:"la última publicación";if(age>180){const h=age<1440?`${Math.round(age/60)} h`:`${Math.round(age/1440)} días`;return `Atención: datos de hace ${h} (${when}). Las condiciones pueden haber cambiado; el clúster no es el de ahora.`}return `Datos del ${when} · se actualizan solo al pulsar Actualizar`};
  const NOV="Desde este visor no se puede lanzar la actualización: solo la lanza el administrador con Actualizar.";
  $("updbtn").onclick=()=>updSt(NOV,"updst-err");
  if(!window.claude||!claude.use){$("updbtn").hidden=true;updSt(NOLIVE(),(Date.now()-(Date.parse(L.updatedUTC)||Date.now()))/6e4>240?"updst-err":"updst-ok");renderMembers();return}
  updSt("Comprobando…");
  let [db,mcp,usr]=await Promise.all([claude.use("db").catch(()=>null),claude.use("mcp").catch(()=>null),claude.use("user").catch(()=>null)]);DB=db;MCP=mcp;try{UID=usr?await usr.id():null}catch(e){UID=null}
  try{OWN=usr?await usr.isOwner():false}catch(e){OWN=false}
  try{CANW=usr?await usr.can("data.write"):null}catch(e){CANW=null}
  if(!OWN){$("updbtn").hidden=true;MCP=null;mcp=null}
  if(db){
    db.doc("live/current").onSnapshot(s=>{if(!s.exists)return;try{applyLive(JSON.parse(s.data().json))}catch(e){}},()=>{});
    db.doc("live/alert").onSnapshot(s=>{if(!s.exists)return;try{const d=s.data();L.alert={at:d.at,items:d.items||[]};renderAlerts()}catch(e){}},()=>{});
    if(false)db.doc(upath("log")).onSnapshot(s=>{if(!s.exists)return;try{LOG=JSON.parse(s.data().json);CACHE.clear();refresh()}catch(e){}},()=>{});
    if(UID)db.doc(upath("cal")).onSnapshot(s=>{if(!s.exists)return;try{OBS=JSON.parse(s.data().json)||[];fitCal();CACHE.clear();refresh()}catch(e){}},()=>{});
    if(!OWN)db.doc("live/status").onSnapshot(s=>{if(!s.exists)return;const d=s.data();
      const stuck=d.state==="running"&&Date.now()-Date.parse(d.at)>20*60e3;if(stuck)d={...d,state:"stuck"};
      updSt(d.state==="running"?"Actualización en curso: la página cambiará sola en unos minutos.":d.state==="done"?`Última actualización: ${fmtT(d.at)}${d.note?" · "+d.note:""}`:`La última actualización automática no terminó (${fmtT(d.at)}). Se puede pedir otra con Actualizar.`,d.state==="done"?"updst-ok":d.state==="running"?"":"updst-err")},()=>{});
    else db.doc("live/status").onSnapshot(s=>{if(!s.exists)return;const d=s.data();RUNNING=d.state==="running"?Date.parse(d.at):null;
      if(d.state==="running"){const m=Math.round((Date.now()-Date.parse(d.at))/60000);if(m<20){updSt(`Buscando datos (desde las ${fmtT(d.at)}). La página se actualizará sola.`,"updst-run");$("updbtn").disabled=true}else{updSt(`La última actualización (${fmtT(d.at)}) no terminó. Puedes pedir otra.`,"updst-err");if(mcp)$("updbtn").disabled=false}}
      else if(d.state==="done"){updSt(`Actualizado a las ${fmtT(d.at)}: ${d.note||""}`,"updst-ok");if(mcp)$("updbtn").disabled=false}
      else if(d.state==="error"){updSt(`La última actualización falló (${fmtT(d.at)}): ${d.note||""}`,"updst-err");if(mcp)$("updbtn").disabled=false}},()=>{});
  }
  renderAlerts();renderMembers();
  if(!OWN){$("updbtn").hidden=true;if(!db){updSt(NOLIVE(),(Date.now()-(Date.parse(L.updatedUTC)||Date.now()))/6e4>240?"updst-err":"updst-ok");return}if($("updst").textContent==="Comprobando…")updSt("Los datos se actualizan solo cuando se pulsa Actualizar.","updst-ok");return}
  if(!mcp){if(!db||$("updst").textContent==="Comprobando…")updSt(NOV,"updst-err");return}
  if($("updst").textContent==="Comprobando…")updSt("");
  if(!RUNNING)$("updbtn").disabled=false;
  {const c=$("updcl");if(c){c.hidden=true;c.onclick=async()=>{c.disabled=true;updSt("Pidiendo el clúster…","updst-run");
    try{await mcp.callTool("Claude Code Remote","fire_trigger",{trigger_id:ATRIG},{cache:false});updSt(`Clúster pedido a las ${fmtT(new Date().toISOString())}. Los spots nuevos aparecerán solos en 2–4 minutos.`,"updst-run")}
    catch(e){updSt("No se pudo pedir el clúster ("+((e&&e.code)||"error")+").","updst-err")}
    setTimeout(()=>{c.disabled=false},120000)};
    /* al abrir la plataforma o volver a ella, si el clúster tiene más de 15 min se pide uno nuevo (como máximo cada 10 min) */
    const autoCl=()=>{try{if(document.hidden||c.disabled)return;const last=+(localStorage.getItem("clAuto")||0),sa=Math.max((Date.parse(L.spotsChecked)||0)||0,(Date.parse(L.spotsUTC||L.updatedUTC)||0)||0);if(Date.now()-sa>15*60e3&&Date.now()-last>10*60e3){localStorage.setItem("clAuto",String(Date.now()));c.click()}}catch(e){}};
    /* lanzamiento automático desactivado para no agotar el cupo de ejecuciones */}}
  $("updbtn").onclick=async()=>{const b=$("updbtn");b.disabled=true;updSt("Enviando la petición…","updst-run");
    try{let okc=true;try{await mcp.callTool("Claude Code Remote","fire_trigger",{trigger_id:ATRIG},{cache:false})}catch(e){okc=false}
      await mcp.callTool("Claude Code Remote","fire_trigger",{trigger_id:TRIG},{cache:false});try{localStorage.setItem("clAuto",String(Date.now()))}catch(e){}
      updSt(`Pedido a las ${fmtT(new Date().toISOString())}. ${okc?"Los spots nuevos llegan en 2–4 minutos y el resto":"Todo"} (Sol, ionosfera, balizas, DXpediciones y fuentes) en unos 8 minutos. La página cambiará sola.`,"updst-run");
      setTimeout(()=>{if(!RUNNING)b.disabled=false},180000)}
    catch(e){const c=e&&e.code;b.disabled=false;
      updSt(c==="approval_required"||c==="not_in_manifest"||c==="consent_required"?"Acepta el permiso que pide la página y vuelve a pulsar.":
        c==="server_not_connected"||c==="needs_reauth"?"Falta activar el permiso de actualización en tu cuenta.":
        c==="blocked_by_policy"?"Esta función no está disponible para tu cuenta.":
        c==="tool_error"?"No se pudo lanzar la actualización: "+(e.message||"").slice(0,140):
        c==="server_unavailable"||c==="upstream_error"?"No hubo respuesta. Puede que se haya lanzado igualmente: espera unos minutos antes de pulsar otra vez.":
        "No se pudo pedir la actualización ("+(c||"error")+"). Inténtalo más tarde.","updst-err")}};
})();
setInterval(()=>{if(document.hidden)return;if(st.page==='ahora'){renderTL();renderQTH()}},60*1000);

{const b=$("tocred");if(b)b.onclick=()=>{go("metodo");setTimeout(()=>{const c=$("creditos");try{selTab("metodo","creditos",true)}catch(e){}if(c){c.open=true}if(c)c.scrollIntoView({behavior:"smooth"})},50)}}



$("cfg").addEventListener("toggle",()=>{if($("cfg").open)renderCal()});

$("mpan").onclick=()=>{const c=$("mapcard"),on=!c.classList.contains("nopan");c.classList.toggle("nopan",on);$("mpan").textContent=on?"Mostrar controles":"Ocultar controles"};$("mfsx").onclick=()=>toggleFS();

function fillBandSel(){const s=$("bandsel");if(!s)return;const keep=s.value||store.get("c_bandsel")||"";s.innerHTML=`<option value="">Todas</option>`+BI0().map(b=>`<option value="${b}">${BANDS[b]}</option>`).join("");s.value=[...s.options].some(o=>o.value===keep)?keep:""}
fillBandSel();
$("bandsel").addEventListener("change",()=>{const v=$("bandsel").value;store.set("c_bandsel",v);st.mbs=v===""?[]:[+v];CACHE.clear();renderBandSeg();refresh()});
{const v=$("bandsel").value;if(v!=="")st.mbs=[+v]}
$("modesel").addEventListener("change",()=>{fillBandSel();if(st.mode==="contest")setMode("contest");CMS();renderAlBar();renderBandSeg();if(st.page==="mapa")drawMap()});


{const sf=$("sfi");if(sf)sf.addEventListener("input",()=>{st.sfiManual=true;CACHE.clear()},true)}

{const bn=blendNow();loadMonth(bn.mA);if(bn.w>0)loadMonth(bn.mB)}

/* el mapa se abre en blanco: los datos aparecen cuando el usuario elige qué ver */
st.mapOn=false;
{const ctl=document.querySelector("#mapcard .mapctl");if(ctl)ctl.addEventListener("click",e=>{const t=e.target.closest("button,input,select");if(!t||st.mapOn)return;if(["mzin","mzout","mzr","mfs","mpan","mfsx"].includes(t.id))return;{const w=t.dataset&&(t.dataset.sw||(t.dataset.ly==="dxp"?"dxp":""));["voa","spots","bcn","dxp"].forEach(k=>{if(k!==w)st.ly[k]=false});if(w==="dxp")st.ly.dxp=false}st.mapOn=true},true);
 const mh=$("mh");if(mh)mh.addEventListener("input",()=>{if(!st.mapOn){st.mapOn=true;renderBandSeg()}},true);
 $("mshowall").onclick=()=>{st.mapOn=true;st.ly.voa=true;renderBandSeg();drawMap()}}
document.querySelectorAll("[data-sw]").forEach(c=>c.addEventListener("click",()=>{const on=c.getAttribute("aria-pressed")!=="true";st.ly[c.dataset.sw]=on;if(on)st.mapOn=true;store.set("ly",JSON.stringify(st.ly));renderBandSeg();drawMap();if(c.dataset.sw==="bcn")renderBcn()}));

