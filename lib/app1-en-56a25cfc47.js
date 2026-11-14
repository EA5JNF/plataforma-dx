
/* © 2026 ACRACB. Idea original y realización de Alfredo, EA5JNF. Todos los derechos reservados. Prohibida su copia, reproducción o adaptación sin permiso escrito del club. Versión 2.4.9 · 14/11/2026. */
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
const ESN={1:"Canada",15:"Rusia asiática",54:"Rusia europea",291:"Estados Unidos",150:"Australia",108:"Brasil",100:"Argentina",318:"China",339:"Japón",281:"Spain",21:"Baleares",29:"Canarias",32:"Ceuta y Melilla",149:"Azores",256:"Madeira",272:"Portugal",227:"Francia",230:"Alemania",248:"Italia",225:"Cerdeña",223:"Inglaterra",265:"Irlanda del Norte",279:"Escocia",294:"Gales",110:"Hawái",6:"Alaska",202:"Puerto Rico",285:"Islas Vírgenes de EE. UU.",446:"Marruecos",400:"Argelia",289:"UN Headquarters (New York)",117:"ITU Headquarters (Geneva)",13:"Antártida"};
let REGN=null,REGE=null;try{REGN=new Intl.DisplayNames(["en"],{type:"region"});REGE=new Intl.DisplayNames(["en"],{type:"region"})}catch(e){}
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
function CS(call){const e=callEnt(call),c=esc(call);if(!e)return `<span class="cs" data-call="${c}">${c}</span>`;if(e.mm)return `<span class="cs" data-call="${c}">${c} <span class="cty">maritime mobile</span></span>`;
  const u=flagURL(e.cc),f=u?`<img class="fl" src="${u}" alt="" width="18" height="12">`:"";
  return `<span class="cs" data-call="${c}">${c} ${f}<span class="cty">${esc(e.name)}</span></span>`}
const CSL=(arr,sep)=>(arr||[]).filter(Boolean).map(x=>CS(x)).join(sep||", ");
/* orden de las bandas en pantalla: de la más baja a la más alta */
const BALL=[0,1,8,2,9,3,4,5,6,7,10,11,12];
const MODES={
 ssb:{n:"SSB phone",s:"SSB",g:"Phone",adj:0,bands:[0,1,8,2,3,4,5,6,7,10,11,12],seg:{11:"between 144.150 and 144.400 kHz (calling on 144.300)",12:"between 432.100 and 432.400 kHz (calling on 432.200)",0:"between 1.840 and 1.900 kHz",1:"between 3.600 and 3.800 kHz",8:"between 5.354 and 5.366 kHz (USB, 15 W EIRP maximum)",2:"between 7.060 and 7.200 kHz",3:"between 14.125 and 14.300 kHz",4:"between 18.120 and 18.168 kHz",5:"between 21.200 and 21.450 kHz",6:"between 24.940 and 24.990 kHz",7:"between 28.400 and 29.000 kHz",10:"between 50.100 and 50.500 kHz (DX calling on 50.110)"},dxq:"14.195 · 18.145 · 21.295 · 24.945 · 28.495, listening 5–10 kHz up",d:"the reference: VOACAP calculated with the signal-to-noise ratio that SSB voice needs"},
 am:{n:"AM phone",s:"AM",g:"Phone",adj:-6,bands:[0,1,2,3,4,5,6,7,10],seg:{0:"within 1.840–1.900 kHz",1:"around 3.615–3.625 kHz",2:"within 7.060–7.200 kHz",3:"on 14.286 kHz (AM gathering spot)",4:"within 18.120–18.168 kHz",5:"around 21.425 kHz",6:"within 24.940–24.990 kHz",7:"between 29.000 and 29.200 kHz",10:"around 50.400 kHz"},dxq:"rare on DXpeditions",d:"AM splits the power between the carrier and two sidebands: it needs about 6 dB more signal than SSB"},
 fm:{n:"FM phone",s:"FM",g:"Phone",adj:-10,bands:[7,10,11,12],seg:{11:"on 145.200–145.575 kHz simplex (calling on 145.500)",12:"on 433.400–434.600 kHz simplex (calling on 433.500)",7:"between 29.520 and 29.700 kHz (calling on 29.600)",10:"between 51.410 and 51.590 kHz (calling on 51.510)"},dxq:"on 10 m, 29.600 when the band is wide open",d:"FM is used on 10, 6 and 2 m and on 70 cm, and needs a strong signal to pass its threshold: about 10 dB more than SSB"},
 cw:{n:"CW (telegraphy)",s:"CW",g:"Telegraphy",adj:11,bands:BALL,seg:{11:"between 144.025 and 144.150 kHz (calling on 144.050)",12:"between 432.025 and 432.100 kHz (calling on 432.050)",0:"between 1.810 and 1.838 kHz",1:"between 3.500 and 3.570 kHz",8:"between 5.351.5 and 5.354 kHz",2:"between 7.000 and 7.040 kHz",9:"between 10.100 and 10.130 kHz",3:"between 14.000 and 14.070 kHz",4:"between 18.068 and 18.095 kHz",5:"between 21.000 and 21.070 kHz",6:"between 24.890 and 24.915 kHz",7:"between 28.000 and 28.070 kHz",10:"between 50.000 and 50.100 kHz"},dxq:"14.024 · 18.075 · 21.024 · 24.894 · 28.024, listening 1–5 kHz up",d:"with a narrow filter, CW is copied by ear with about 11 dB less signal than phone"},
 ft8:{n:"FT8",s:"FT8",g:"Digital",adj:27,bands:BALL,seg:{11:"on 144.174 kHz (USB)",12:"on 432.174 kHz (USB)",0:"on 1.840 kHz (USB)",1:"on 3.573 kHz (USB)",8:"on 5.357 kHz (USB)",2:"on 7.074 kHz (USB)",9:"on 10.136 kHz (USB)",3:"on 14.074 kHz (USB)",4:"on 18.100 kHz (USB)",5:"on 21.074 kHz (USB)",6:"on 24.915 kHz (USB)",7:"on 28.074 kHz (USB)",10:"on 50.313 kHz (USB)"},dxq:"Fox/Hound mode on 14.090 · 18.095 · 21.091 · 24.911 · 28.091 (call above 1,000 Hz audio)",d:"FT8 decodes down to about −21 dB in 2.5 kHz: about 27 dB less than phone, although each QSO takes a minute or more"},
 ft4:{n:"FT4",s:"FT4",g:"Digital",adj:23,bands:BALL,seg:{11:"on 144.170 kHz (USB)",12:"on 432.170 kHz (USB)",0:"on 1.840 kHz (USB)",1:"on 3.575 kHz (USB)",8:"on 5.357 kHz (USB)",2:"on 7.047.5 kHz (USB)",9:"on 10.140 kHz (USB)",3:"on 14.080 kHz (USB)",4:"on 18.104 kHz (USB)",5:"on 21.140 kHz (USB)",6:"on 24.919 kHz (USB)",7:"on 28.180 kHz (USB)",10:"on 50.318 kHz (USB)"},dxq:"14.080 · 21.140 · 28.180",d:"FT4 decodes down to about −17 dB in 2.5 kHz: about 23 dB less than phone"},
 jt65:{n:"JT65",s:"JT65",g:"Digital",adj:29,bands:BALL,seg:{11:"on 144.120 kHz (USB)",12:"on 432.120 kHz (USB)",0:"on 1.838 kHz (USB)",1:"on 3.570 kHz (USB)",8:"on 5.357 kHz (USB)",2:"on 7.076 kHz (USB)",9:"on 10.138 kHz (USB)",3:"on 14.076 kHz (USB)",4:"on 18.102 kHz (USB)",5:"on 21.076 kHz (USB)",6:"on 24.917 kHz (USB)",7:"on 28.076 kHz (USB)",10:"on 50.310 kHz (USB)"},dxq:"14.076 · 21.076 · 28.076",d:"JT65 decodes down to about −24 dB in 2.5 kHz: about 29 dB less than phone, with slow QSOs"},
 js8:{n:"JS8Call",s:"JS8Call",g:"Digital",adj:25,bands:BALL,seg:{11:"on 144.178 kHz (USB)",12:"on 432.178 kHz (USB)",0:"on 1.842 kHz (USB)",1:"on 3.578 kHz (USB)",8:"on 5.357 kHz (USB)",2:"on 7.078 kHz (USB)",9:"on 10.130 kHz (USB)",3:"on 14.078 kHz (USB)",4:"on 18.104 kHz (USB)",5:"on 21.078 kHz (USB)",6:"on 24.922 kHz (USB)",7:"on 28.078 kHz (USB)",10:"on 50.318 kHz (USB)"},dxq:"14.078 · 7.078",d:"JS8Call in normal mode decodes down to about −20 dB in 2.5 kHz: about 25 dB less than phone"},
 rtty:{n:"RTTY",s:"RTTY",g:"Digital",adj:5,bands:BALL,seg:{11:"around 144.138 kHz",12:"around 432.088 kHz",0:"between 1.838 and 1.840 kHz",1:"between 3.580 and 3.600 kHz",8:"between 5.354 and 5.366 kHz",2:"between 7.040 and 7.050 kHz",9:"between 10.130 and 10.150 kHz",3:"between 14.080 and 14.099 kHz",4:"between 18.100 and 18.109 kHz",5:"between 21.080 and 21.120 kHz",6:"between 24.915 and 24.929 kHz",7:"between 28.070 and 28.150 kHz",10:"around 50.300 kHz"},dxq:"14.085 · 21.085 · 28.085, listening a few kHz up",d:"RTTY (45 baudios) decodes with about 5 dB less signal than phone"},
 psk:{n:"PSK31",s:"PSK31",g:"Digital",adj:16,bands:BALL,seg:{11:"on 144.138 kHz",12:"on 432.088 kHz",0:"on 1.838 kHz",1:"on 3.580 kHz",8:"on 5.357 kHz",2:"on 7.040 kHz",9:"on 10.142 kHz",3:"on 14.070 kHz",4:"on 18.100 kHz",5:"on 21.070 kHz",6:"on 24.920 kHz",7:"on 28.120 kHz",10:"on 50.290 kHz"},dxq:"14.070 · 21.070 · 28.120",d:"PSK31 decodes with about 16 dB less signal than phone"},
 sstv:{n:"SSTV (imagen)",s:"SSTV",g:"Image",adj:-3,bands:[1,2,3,5,7,10,11,12],seg:{11:"on 144.500 kHz",12:"on 433.400 kHz (FM)",1:"on 3.735 kHz",2:"on 7.165 kHz",3:"on 14.230 kHz",5:"on 21.340 kHz",7:"on 28.680 kHz",10:"on 50.510 kHz"},dxq:"14.230 · 21.340 · 28.680",d:"analog SSTV needs a clean signal for a picture without stripes: about 3 dB more than SSB"}};
const MOD=()=>memo("MOD",()=>{const v=($("modesel")||{}).value;return MODES[v]?v:"ssb"});
const MD=()=>MODES[MOD()];
const segTxt=b=>MD().seg[b]||("outside the uses of "+MD().s+" on this band");
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
const CAB=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
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
function ionoSrc(){if(L.iono&&L.iono.fof2&&Date.now()-Date.parse(L.iono.time)<6*3600e3)return "ionosonda";return spotK().k>1?"cluster":null}
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
const GND={rock:{n:"Inland, rocky or dry ground",er:5,sg:.001},avg:{n:"Inland, average ground",er:13,sg:.005},coast:{n:"Near the sea (beach, less than 100 m from the water)",er:81,sg:5,half:true},sea:{n:"Surrounded by salt water (island or lagoon)",er:81,sg:5}};
const cx=(a,b)=>({r:a,i:b}),cadd=(a,b)=>cx(a.r+b.r,a.i+b.i),csub=(a,b)=>cx(a.r-b.r,a.i-b.i),cmul=(a,b)=>cx(a.r*b.r-a.i*b.i,a.r*b.i+a.i*b.r),cdiv=(a,b)=>{const d=b.r*b.r+b.i*b.i;return cx((a.r*b.r+a.i*b.i)/d,(a.i*b.r-a.r*b.i)/d)},cabs=a=>Math.hypot(a.r,a.i),csqrt=a=>{const m=cabs(a),r=Math.sqrt((m+a.r)/2),i=Math.sign(a.i||1)*Math.sqrt(Math.max(0,(m-a.r)/2));return cx(r,i)};
function fres(th,f,g,pol){const s=Math.max(.01,Math.sin(th*D2R)),c2=Math.cos(th*D2R)**2,lam=300/f,n2=cx(g.er,-60*lam*g.sg),root=csqrt(csub(n2,cx(c2,0)));
  if(pol==="v"){const a=cmul(n2,cx(s,0));return cdiv(csub(a,root),cadd(a,root))}return cdiv(csub(cx(s,0),root),cadd(cx(s,0),root))}
const gnd=()=>memo("gnd",gnd0);const gnd0=()=>GND[($("gnd")||{}).value||"avg"]||GND.avg;
function vGround(th,f){const g=gnd(),rk=GND.rock;const a=cabs(cadd(cx(1,0),fres(th,f,g,"v"))),b=cabs(cadd(cx(1,0),fres(th,f,rk,"v")));let d=20*Math.log10(Math.max(1e-3,a)/Math.max(1e-3,b));return g.half?d/2:d}
function gHor(th,h,f,g0){const g=gnd(),k=4*Math.PI*h/(300/f)*Math.sin(th*D2R),R=fres(th,f,g,"h"),ph=cx(Math.cos(k),-Math.sin(k));let v=20*Math.log10(Math.max(1e-3,cabs(cadd(cx(1,0),cmul(R,ph)))));
  if(g.half){const R2=fres(th,f,GND.avg,"h"),v2=20*Math.log10(Math.max(1e-3,cabs(cadd(cx(1,0),cmul(R2,ph)))));v=(v+v2)/2}return g0+v}
const ANT={
 hex:{n:"2-el. Yagi",bands:[3,4,5,6,7],h:"hxh",g:()=>5.6,d:"2-element beam (Hex Beam, Moxon or similar) for 20, 17, 15, 12 and 10 m: about 5.6 dBi in free space (≈3,5 dBd) and strong front-to-back rejection"},
 steppir:{n:"3-el. Yagi",bands:[2,9,3,4,5,6,7,10],h:"sph",g:b=>b===2||b===9?2.15:7.8,d:"3-element beam (tribander Yagi, SteppIR or similar): about 7.8 dBi from 20 to 6 m; on 40 and 30 m it is calculated as a rotary dipole (2.15 dBi)"},
 vq:{n:"λ/4 vertical with radials",bands:[2,9,3,4,5,6,7,10],vert:true,full:true,d:"quarter-wave vertical on each band with enough radials (40–10 m), without the losses of a loading coil"},
 dip:{n:"Dipole or inverted V",bands:[0,1,8,2,9,3,4,5,6,7,10],h:"dph",g:()=>1.6,d:"resonant half-wave dipole on each band (or inverted V: −1 dB), one per band, from 160 to 10 m"},
 efhw:{n:"Half-wave end-fed (EFHW)",bands:[2,9,3,4,5,6,7,10],h:"efh",g:b=>b===9||b===10?0.2:1.2,d:"half-wave wire fed at one end with a 49:1 transformer, from 40 to 10 m: like a dipole with 1 dB of transformer loss"},
 invv:{n:"40 m inverted V",bands:[2],h:"vh",g:()=>1.15,d:"inverted V dipole for 40 m only: 1 dB less than a flat dipole"},
 d80:{n:"80 m dipole",bands:[1],h:"d80h",g:()=>2.15,d:"half-wave monoband dipole for 80 m"},
 d160:{n:"160 m dipole",bands:[0],h:"d160h",g:()=>2.15,d:"half-wave monoband dipole for 160 m"},
 yb:{n:"5-el. monoband Yagi",bands:[3,4,5,6,7,10],h:"ybh",g:()=>9.8,d:"a 5-element monoband Yagi on each band from 20 to 10 m (or a long-boom one): about 9.8 dBi, the most directive of all"},
 quad:{n:"2-el. quad",bands:[3,4,5,6,7],h:"quh",g:()=>7.0,d:"quad (quad) 2-element for 20 to 10 m: about 7 dBi, a bit more than a Hex Beam"},
 ocf:{n:"OCF dipole / Windom",bands:[1,8,2,9,3,4,5,6,7],h:"ocfh",g:b=>[1,2,3,7].includes(b)?1.6:0.6,d:"off-center-fed dipole with 4:1 balun, from 80 to 10 m: like a dipole on 80, 40, 20 and 10 m and 1 dB less on 17, 15 and 12 m, where a tuner is needed"},
 g5rv:{n:"G5RV / ZS6BKW",bands:[1,8,2,9,3,4,5,6,7],h:"g5h",g:b=>[2,3,6,7].includes(b)?1.6:0.6,d:"multiband dipole with ladder line and tuner, from 80 to 10 m: like a dipole on 40, 20, 12 and 10 m and 1 dB less on the rest due to tuner losses"},
 lw:{n:"Long wire with tuner",bands:[0,1,8,2,9,3,4,5,6,7,10],h:"lwh",g:b=>MHZ[b]<4?-2:0,d:"20 to 40 m wire with an automatic tuner at the base and counterpoises, from 160 to 10 m: about 2 dB less than a dipole on the high bands and 4 dB less on 80 and 160 m due to ground losses"},
 vtrap:{n:"Multiband trap vertical",bands:[2,9,3,4,5,6,7,10],vert:true,pen:b=>b===2?-2:b===9?-1.5:-1,d:"trap vertical with radials (Hy-Gain or Cushcraft type), from 40 to 10 m: 1 dB less than a full λ/4 and 2 dB less on 40 m"},
 vnr:{n:"Vertical without radials",bands:[2,9,3,4,5,6,7,10],vert:true,pen:b=>b===2?-5:-3,d:"multiband vertical without radials or with 9:1 unun (Diamond type or vertical wire), from 40 to 10 m: about 3 dB less than a λ/4 with radials and 5 dB less on 40 m"},
 mob:{n:"Mobile antenna",bands:[2,9,3,4,5,6,7,10],vert:true,pen:b=>({2:-10,9:-7,3:-6,4:-5,5:-4,6:-3.5,7:-3,10:-2})[b]||-6,d:"coil-loaded mobile antenna on the car roof (Hustler or ATAS type), from 40 to 10 m: between 3 dB less on 10 m and 10 dB less on 40 m than a full λ/4"},
 mloop:{n:"Magnetic loop",bands:[2,9,3,4,5,6,7],vert:true,pen:b=>({2:-8,9:-6,3:-4,4:-3,5:-2.5,6:-2,7:-2})[b]||-6,d:"1 m diameter magnetic loop, vertical and about 2 m above ground, from 40 to 10 m: good on balconies, but between 2 dB less on 10 m and 8 dB less on 40 m than a full λ/4"},
 vert:{n:"Portable vertical",bands:[2,9,3,4,5,6,7,10],vert:true,d:"portable vertical of about 7 m with loading coil (JPC-12 type), 30 radials of 5 m and a ground rod in rocky soil, no tuner; λ/4 monopole over rock, with −3 dB on 40 m"}};
const ANTORD=["yb","steppir","quad","hex","dip","ocf","g5rv","efhw","lw","vq","vtrap","vnr","vert","mob","mloop"],ANTSEL={club:{n:"Beam + dipoles for 80 and 160 m"},steppir:{},hex:{},dip:{},efhw:{},vq:{},vert:{}};
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
function siteText(){const h=$("altin")?+$("altin").value:0;return `${fk(h)} meters above sea level: on HF altitude alone does not change propagation (what counts is the clear horizon, which is chosen separately); on 2 m and 70 cm it extends the radio horizon`}
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
 cqww:{modes:["ssb"],n:"CQ WW DX SSB",month:10,wk:"last",h:48,bands:[0,1,2,3,5,7],ok:t=>true,pts:(t,b)=>t.dxcc===281?0:t.cont==="EU"?1:3,mult:"CQ zones and countries, per band",mk:"cqdx",
   tip:"From EA, Europe gives 1 point and the rest of the world 3. The multipliers (CQ zone and country) count again on each band: changing bands to add multipliers pays off."},
 wpx:{modes:["ssb"],n:"CQ WPX SSB",month:3,wk:"last",h:48,so:36,bands:[0,1,2,3,5,7],ok:t=>true,pts:(t,b)=>{const lo=b<=2;return t.cont==="EU"?(lo?2:1):(lo?6:3)},mult:"prefixes (once in the whole contest)",mk:"wpx",
   tip:"From EA, another continent gives 3 points (6 on 40, 80 and 160 m) and Europe 1 (2 on the low bands). Prefixes count only once: what matters is the rate."},
 arrl:{modes:["ssb"],n:"ARRL International DX SSB",month:3,wk:"first",h:48,bands:[0,1,2,3,5,7],ok:t=>t.dxcc===291||t.dxcc===1,pts:()=>3,mult:"U.S. states and Canadian provinces, per band",mk:"wve",
   tip:"From EA only QSOs with the USA and Canada count: 3 points each. The whole strategy is keeping the path to North America open."},
 iaru:{modes:["ssb","cw"],n:"IARU HF World Championship",month:7,wk:"second",h:24,bands:[0,1,2,3,5,7],ok:t=>true,pts:(t,b)=>t.cont==="EU"?3:5,mult:"ITU zones and IARU HQ stations, per band",mk:"cqdx",
   tip:"From EA (ITU zone 37), another continent gives 5 points and Europe 3 (1 if it is your own ITU zone). ITU zones and HQ stations count per band."},
 wae:{modes:["ssb"],n:"WAE DX SSB",month:9,wk:"second",h:48,bands:[1,2,3,5,7],ok:t=>t.cont!=="EU",pts:()=>1,mult:"countries outside Europe per band, with 80 m ×4, 40 m ×3 and the rest ×2",mk:"wae",
   tip:"From Europe only QSOs outside Europe count: 1 point each, plus another point for each QTC you receive. 80 m multipliers count ×4 and 40 m ×3."},
 cq160:{modes:["ssb"],n:"CQ WW 160 m SSB",month:2,wk:"last",h:48,bands:[0],ok:t=>true,pts:t=>t.dxcc===281?2:t.cont==="EU"?5:10,mult:"states, Canadian provinces, DXCC and WAE countries",mk:"wve",
   tip:"160 m only. Same country 2 points, Europe 5, another continent 10. Everything happens at night and around your sunrise and sunset."},
 arrl10:{modes:["ssb","cw"],n:"ARRL 10 m",month:12,wk:"second",h:48,bands:[7],ok:t=>true,pts:()=>2,mult:"states, Canadian provinces, Mexican states, DXCC countries and ITU regions",mk:"wve",
   tip:"10 m only: each phone QSO gives 2 points and CW 4. With the December sun, 10 m opens to the south and west at midday."},
 cqwwcw:{modes:["cw"],base:"cqww",n:"CQ WW DX CW",month:11,wk:"last",h:48,bands:[0,1,2,3,5,7],ok:t=>true,pts:(t,b)=>t.dxcc===281?0:t.cont==="EU"?1:3,mult:"CQ zones and countries, per band",mk:"cqdx",
   tip:"Same rules as phone: Europe 1 point, the rest of the world 3, and zone and country count on each band."},
 wpxcw:{modes:["cw"],base:"wpx",n:"CQ WPX CW",month:5,wk:"last",h:48,so:36,bands:[0,1,2,3,5,7],ok:t=>true,pts:(t,b)=>{const lo=b<=2;return t.cont==="EU"?(lo?2:1):(lo?6:3)},mult:"prefixes (once in the whole contest)",mk:"wpx",
   tip:"Another continent 3 points (6 on 40, 80 and 160 m) and Europe 1 (2 on the low bands). Prefixes count once: rate is king."},
 arrlcw:{modes:["cw"],base:"arrl",n:"ARRL International DX CW",month:2,wk:"third",h:48,bands:[0,1,2,3,5,7],ok:t=>t.dxcc===291||t.dxcc===1,pts:()=>3,mult:"U.S. states and Canadian provinces, per band",mk:"wve",
   tip:"Only QSOs with the USA and Canada count: 3 points each."},
 waecw:{modes:["cw"],base:"wae",n:"WAE DX CW",month:8,wk:"second",h:48,bands:[1,2,3,5,7],ok:t=>t.cont!=="EU",pts:()=>1,mult:"countries outside Europe per band, with 80 m ×4, 40 m ×3 and the rest ×2",mk:"wae",
   tip:"Only QSOs outside Europe count, plus the QTCs you receive. 80 m ×4 and 40 m ×3."},
 cq160cw:{modes:["cw"],base:"cq160",n:"CQ WW 160 m CW",month:1,wk:"last",h:48,bands:[0],ok:t=>true,pts:t=>t.dxcc===281?2:t.cont==="EU"?5:10,mult:"states, Canadian provinces, DXCC and WAE countries",mk:"wve",
   tip:"160 m only: same country 2 points, Europe 5, another continent 10."},
 cqwwrtty:{modes:["rtty"],base:"cqww",n:"CQ WW RTTY",month:9,wk:"last",h:48,bands:[1,2,3,5,7],ok:t=>true,pts:t=>t.dxcc===281?1:t.cont==="EU"?2:3,mult:"CQ zones, countries, U.S. states and Canadian provinces, per band",mk:"cqdx",
   tip:"Same country 1 point, Europe 2 and another continent 3. Zones, countries, states and provinces count on each band."},
 wpxrtty:{modes:["rtty"],base:"wpx",n:"CQ WPX RTTY",month:2,wk:"second",h:48,so:30,bands:[1,2,3,5,7],ok:t=>true,pts:(t,b)=>{const lo=b<=2;return t.cont==="EU"?(lo?2:1):(lo?6:3)},mult:"prefixes (once in the whole contest)",mk:"wpx",
   tip:"Like the phone and CW WPX: prefixes count once and the low bands score double. Check the rules."},
 rttyru:{modes:["rtty"],base:"arrl10",n:"ARRL RTTY Roundup",month:1,wk:"first",h:30,bands:[1,2,3,5,7],ok:t=>true,pts:()=>1,mult:"U.S. states, Canadian provinces and DXCC countries (once)",mk:"wve",
   tip:"1 point per QSO and each state, province or country counts only once. It lasts 30 h, of which a single operator can operate 24."}};
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
const MESES=["January","February","March","April","May","June","July","August","September","October","November","December"];
const fdate=d=>MESES[d.getUTCMonth()]+" "+d.getUTCDate()+", "+d.getUTCFullYear();
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
function sunEvents(p){let rise=null,set=null,noon=null,mx=-99,prev=sunElF(p,0);for(let i=1;i<=288;i++){const x=i/12,e=sunElF(p,x);if(prev<-.833&&e>=-.833)rise=x;if(prev>=-.833&&e<-.833)set=x;if(e>mx){mx=e;noon=x}prev=e}return {rise,set,noon,polar:rise===null&&set===null?(mx>0?"day":"night"):null}}
function greyWins(t){const p=[t.lon,t.lat],w=[];let on=false,s=0;for(let i=0;i<=288;i++){const x=i/12,a=sunElF(TXP,x),b=sunElF(p,x),g=a>-8&&a<3&&b>-8&&b<3;if(g&&!on){on=true;s=x}if(!g&&on){on=false;w.push([s,x])}}if(on)w.push([s,24]);return w}
function lpWins(t){if(!t.l)return [];const r=[];let s=-1;for(let x=0;x<=24;x++){const ok=x<24&&(()=>{const a=best(t,x,true),c=best(t,x,false);return a.p>=.1&&a.p>c.p})();if(ok&&s<0)s=x;if(!ok&&s>=0){r.push([s,x]);s=-1}}return r}
/* ---------- utilidades ---------- */
function best(t,lh,lp){let r={p:0,b:BI()[Math.min(3,BI().length-1)],muf:0,lp:!!lp};for(const b of BI()){const x=prob(t,lh,b,lp);if(x.p>r.p)r={...x,b,lp:!!lp}}return r}
function bestAny(t,lh){const a=best(t,lh,false),c=best(t,lh,true);return c.p>a.p?c:a}
const cls=p=>!(p>=0)?"c0":p<.05?"c0":p<.15?"c1":p<.30?"c2":p<.50?"c3":p<.70?"c4":"c5";
const pct=p=>!(p>=0)?"—":p<.01?"·":Math.round(p*100);
const fk=n=>Math.round(n).toLocaleString("en-US");
const dxIn=id=>L.dx.filter(d=>{const t=tFor(d);return t&&t.id===id&&dxNew(d)});
function tags(t){let s="";if(stormK(t,false,st.mhour)<.99||auroraDb(t,false,st.mhour,3)<0)s+='<span class="tag st">storm</span>';if(siteAdj(t)<0)s+='<span class="tag sl">tapado N/NW</span>';const d=dxIn(t.id);if(d.length)s+=`<span class="tag dx">★ ${d.map(x=>CSF(x.call)).join(", ")}</span>`;const n=entNeed(t);if(n===true)s+='<span class="tag dx">needed</span>';return s}
function pathPts(t,lp,n){const az=lp?t.laz:t.az,km=lp?t.lkm:t.km;return Array.from({length:n+1},(_,i)=>dest(TXP,az,km*i/n))}
function dayFrac(t,lp,lh){const pts=pathPts(t,lp,14).slice(1,-1);return pts.filter(p=>sunEl(p,lh)>0).length/pts.length}
function foF2est(lh,rawOnly){const t=T("dl");if(!t)return null;const x=rawOnly?interp0(t,ssnFrom(+$("sfi").value),hidx(lh),3,false,null):interp(t,ssnFrom(+$("sfi").value),hidx(lh),3,false,lh);let lo=0,hi=89;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(hopD(m,300)>t.km)lo=m;else hi=m}const si=RE*Math.cos(lo*D2R)/(RE+300);return x.muf*Math.sqrt(1-si*si)}
function skipKm(f,fo){if(!fo)return null;if(f<=fo)return 0;const ci=fo/f,si=Math.sqrt(1-ci*ci),cb=si*(RE+300)/RE;if(cb>=1)return -1;return Math.round(hopD(Math.acos(cb)/D2R,300))}
function skipTxt(b,lh){const sk=skipKm(MHZ[b],foF2est(lh));return sk===null?"":sk===0?"no skip zone":sk<0?"no short hop: skip zone beyond 4,000 km":"skip zone up to ≈"+fk(sk)+" km"}
function explain(t,b,lh,lp){const r=prob(t,lh,b,lp),f=MHZ[b],m=r.muf,df=dayFrac(t,lp,lh),hp=hopsAt(t,lh,b,lp),out=[];
  if(r.na)return `None of your chosen antennas (${ANTL()}) cubre ${BANDS[b]}.`;
  if(m>0){if(f>m)out.push(`the average MUF of the path is ${m.toFixed(1)} MHz, below ${f} MHz: the signal goes through the F layer and does not come back; it only opens on days when the ionosphere is above average`);
    else if(f>.85*m)out.push(`${f} MHz is just below the MUF (${m.toFixed(1)} MHz): it is reflected, but at the limit, with QSB and short openings`);
    else out.push(`the path MUF (${m.toFixed(1)} MHz) is well above ${f} MHz: it is reflected with margin`)}
  if(b<=2)out.push(df>.5?`${Math.round(df*100)} % of the path is in daylight and the D layer absorbs a lot on ${f} MHz`:`the path is almost all at night: without the D layer there is hardly any absorption on ${f} MHz`);
  else if(b>=4&&df<.4)out.push(`the path is almost all at night: foF2 drops and the high bands close`);
  else if(df>=.6)out.push(`the path is in daylight (${Math.round(df*100)} %): the F layer is charged and the absorption on ${f} MHz is small`);
  const el=sunEl(TXP,lh);if(el>-6&&el<6)out.push("you are in the gray line: your D layer has almost disappeared and the F layer is still high");
  if(hp&&r.p>=.02)out.push(`it arrives in about ${hp.n} hop${hp.n>1?"s":""} of ${fk(hp.len)} km, leaving at ${hp.ang}° above the horizon; each hop loses signal when reflecting off the ground`);
  {let [ang]=hopRaw(t,lp&&t.l,hidx(lh),b);if(!ang)ang=6;const pk=antPick(b,ang);if(pk&&!ANT[pk.id].vert&&Math.abs(pk.g)>=1)out.push(`with ${ANT[pk.id].n} at ${$(ANT[pk.id].h).value} m you have ${pk.g>0?"+":""}${pk.g.toFixed(0)} dB versus the portable vertical at that takeoff angle`);else if(pk&&ANTS().length>1)out.push(`on this band your best antenna is ${ANT[pk.id].n}`)}
  const ik=ionoK(lh);if(ik!==1&&b>=3)out.push(`${ionoSrc()==="ionosonda"?"today's ionosonde":"what is heard today on the cluster"} indicates a MUF ${Math.round((ik-1)*100)} % ${ik>1?"higher":"lower"} than the monthly average, and it is already applied`);
  const sk=stormK(t,lp,lh),ad=auroraDb(t,lp,lh,b);if(sk<.99||ad<0)out.push(`the path reaches ${lp?t.lgm:t.gm}° geomagnetic latitude and with Kp ${kpAt(lh)} there is a storm: ${sk<.99?"the MUF drops by "+Math.round((1-sk)*100)+" % (negative phase of the F layer)":""}${sk<.99&&ad<0?" and ":""}${ad<0?"it crosses the auroral oval: "+Math.round(-ad)+" dB of absorption in the D layer":""}`);
  {let [a]=hopRaw(t,lp&&t.l,hidx(lh),b);const hd=horizDb(a||6,b);if(hd<-.5)out.push(`it takes off at ${a}° and your horizon is at ${$("hz").value}°: it loses ${Math.round(-hd)} dB of diffraction loss at the obstacle`)}
  {const n=dxNoisePen(t,b,lh);if(Math.abs(n)>.5)out.push(`the noise at the DX station subtracts ${n>0?"":"or adds "}${Math.abs(n).toFixed(0)} dB (ITU-R P.372)`)}
  if(lp){const ds=dayFrac(t,false,lh);out.push(`goes by the long path ${df>ds+.2?"because that way the path is in daylight and the short one is not":"because on the short path the MUF or the absorption prevents it"}`)}
  const s=out.join("; ");return s.charAt(0).toUpperCase()+s.slice(1)+"."}
function spotAge(s){const ref=[L.spotsChecked,L.spotsUTC,L.updatedUTC].filter(Boolean).sort().pop()||"";const d=ref.slice(0,10);let t=Date.parse(d+"T"+s.t+":00Z");if(isNaN(t))return null;/* un spot de las 23:5x leído pasada la medianoche es del día anterior */const r=Date.parse(ref);if(r&&t>r+10*60000)t-=86400000;return Math.max(0,Math.round((Date.now()-t)/60000))}
const ageTxt=a=>a==null?"":a<1?"ahora":a<90?`${a} min ago`:a<1440?`${Math.round(a/60)} h ago`:"more than a day ago";
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
const BCN=[["4U1UN","New York (UN)",-73.97,40.75],["VE8AT","Eureka, Canada",-85.9,79.99],["W6WX","California",-121.9,37.15],["KH6RS","Maui, Hawaii",-156.0,20.77],["ZL6B","Masterton, New Zealand",175.6,-41.06],["VK6RBP","Perth, Australia",116.0,-32.1],["JA2IGY","Mie, Japan",136.8,34.45],["RR9O","Novosibirsk",82.9,54.98],["VR2B","Hong Kong",114.17,22.28],["4S7B","Colombo, Sri Lanka",79.9,6.9],["ZS6DN","Pretoria, South Africa",28.3,-25.9],["5Z4B","Kikuyu, Kenya",36.67,-1.25],["4X6TU","Tel Aviv, Israel",34.8,32.1],["OH2B","Lohja, Finland",24.4,60.3],["CS3B","Madeira",-17.0,32.8],["LU4AA","Buenos Aires",-58.4,-34.6],["OA4B","Lima, Peru",-76.9,-12.1],["YV5B","Caracas, Venezuela",-67.8,9.1]];
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
    h+=`<div class="mst"><div class="msth">VOACAP prediction · ${hh(lh)}:00 · ${esc(MD().s)} · ${data.length} destinations</div>`+
     `<table><tr><th>Band</th><th>Open<br><span>≥ 50 %</span></th><th>Possible<br><span>15–50 %</span></th><th>Best destination</th></tr>`+
     rows.map(r=>`<tr${best&&r.b===best.b&&r.o?' class="bst"':""}><td><i style="background:${BC[r.b]}"></i>${BANDS[r.b]}</td><td>${r.o}</td><td>${r.p}</td><td>${r.bt&&r.bp>=.15?esc(r.bt.name.split(" (")[0])+" · "+pct(r.bp)+" %":"—"}</td></tr>`).join("")+`</table>`+
     (top.length?`<p class="note">Most likely now: ${top.map(d=>`<b>${esc(d.t.name.split(" (")[0])}</b> ${pct(d.p)} % (${BANDS[d.b]}${d.lp?", long":""})`).join(" · ")}</p>`:`<p class="note">Nothing open with these options at this time.</p>`)+`</div>`}
  if(st.ly.spots){const MS=MBS(),sp=SPOTS().filter(s=>!MS||MS.includes(s.band));const bm={},bb={};sp.forEach(s=>{const m=spotMode(s);bm[m]=(bm[m]||0)+1;bb[s.band]=(bb[s.band]||0)+1});
    h+=`<div class="mst"><div class="msth">Cluster · ${esc(CMSTXT())}</div><p class="note">${sp.length?`<b>${sp.length}</b> spots on the map · `+Object.entries(bm).map(([m,n])=>`${esc(MODES[m]?MODES[m].s:m)} ${n}`).join(" · ")+"<br>"+Object.keys(bb).map(Number).sort((a,b)=>BALL.indexOf(a)-BALL.indexOf(b)).map(b=>`<span style="color:${BC[b]}">●</span> ${BANDS[b]} ${bb[b]}`).join(" · "):"No useful spots for these modes and bands right now."}</p></div>`}
  if(st.ly.bcn){const {slot,left}=bcnNow();const lhN=localNow();h+=`<div class="mst"><div class="msth">NCDXF/IARU beacons · now (change in ${left} s)</div><p class="note">`+BFQ.map(([f,bi],k)=>{const b=BCN[(slot-k+18)%18],t=nearestT([b[2],b[3]],0),q=t?prob(t,lhN,bi,false):{p:0};return `${f}: <b>${b[0]}</b> ${q.na?"—":pct(q.p)+" %"}`}).join(" · ")+`</p></div>`}
  el.innerHTML=h;el.hidden=!h}
function zoomBy(f){if(!ZM||!ZSVG)return;const t=ZSVG.transition().duration(250);if(!f)t.call(ZM.transform,d3.zoomIdentity);else t.call(ZM.scaleBy,f)}
function drawMap(){window.__zmk=null;setTimeout(()=>{try{foldSums()}catch(e){}},0);
  const lh=st.mhour;$("mhv").textContent=hh(lh)+":00 · "+hh(utOf(lh))+" UTC";
  const svgEl=$("map");if(!svgEl)return;
  if(typeof d3==="undefined"||typeof topojson==="undefined"){svgEl.outerHTML='<div class="empty">The map libraries could not be loaded. Reload the page.</div>';return}
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
      if(az%30===0){const card={0:"N",90:"E",180:"S",270:"W"}[az];ag.append("text").attr("class","azl"+(card?" azc":"")).attr("x",cx0+(r-26)*sa).attr("y",cy0-(r-26)*ca+4).attr("text-anchor","middle").text(card?`${az}° ${card}`:`${az}°`)}}}
  const ss=subsolar(lh),anti=[ss[0]>0?ss[0]-180:ss[0]+180,-ss[1]];
  if(st.ly.night)Z.append("path").attr("class","night").attr("d",path(d3.geoCircle().center(anti).radius(90)()));
  if(st.ly.night)Z.append("path").attr("class","grey").attr("d",path(d3.geoCircle().center(anti).radius(90)()));
  if(st.ly.night)Z.append("path").attr("class","grey2").attr("d",path(d3.geoCircle().center(anti).radius(90)()));
  const kp=kpAt(lh);
  if(kp>=4){const g=kp>=6?50:kp===5?53:55;[90,-90].forEach(pl=>Z.append("path").attr("class","aur").attr("d",path(d3.geoCircle().center(gm2geo(pl,0)).radius(90-g)())));
    const lp=pr(gm2geo(g+4,-30));if(lp)Z.append("text").attr("class","aurl").attr("x",lp[0]).attr("y",lp[1]).text("auroral oval · Kp "+kp)}
  [2500,5000,10000,15000].forEach(km=>{Z.append("path").attr("class","ring").attr("d",path(d3.geoCircle().center(TXP).radius(km/111.2)()));
    const p=pr(dest(TXP,200,km));if(p)Z.append("text").attr("class","ringl").attr("x",p[0]+3).attr("y",p[1]).text(km.toLocaleString("en-US")+" km")});
  if(st.mband>=0&&st.mapOn&&st.ly.voa){const sk=skipKm(MHZ[st.mband],foF2est(lh));const c0=pr(TXP);
    if(sk>0){Z.append("path").attr("class","skip").attr("d",path(d3.geoCircle().center(TXP).radius(sk/111.2)()));const p=pr(dest(TXP,150,sk));if(p)Z.append("text").attr("class","skipl").attr("x",p[0]+4).attr("y",p[1]+12).text(`Skip zone ${BANDS[st.mband]}: ≈${fk(sk)} km`)}
    else Z.append("text").attr("class","skipl").attr("x",c0[0]+12).attr("y",c0[1]+26).text(sk===0?`${BANDS[st.mband]}: no skip zone`:`${BANDS[st.mband]}: no short hop (skip zone > 4.000 km)`)}
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
      .attr("filter",d.p>=.6&&RANK.get(d.t.id)<3?"url(#glow)":null).attr("tabindex",0).attr("role","button").attr("aria-label",`${t.name}: ${BANDS[d.b]} ${Math.round(d.p*100)} % ${d.lp?"long path":"short path"}`);
    c.append("title").text(`${t.name} · ${Math.round(d.p*100)} % on ${BANDS[d.b]} (${d.lp?"largo":"short"}) · tap to see more`);
    const sel=()=>{st.zone=t.id;store.set("pz",st.zone);openPop({k:"t",id:t.id});drawMap()};c.on("click",sel).on("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();sel()}});
    if(d.p>=.5&&r>=7)g.append("text").attr("class","ml").attr("x",d.xy[0]).attr("y",d.xy[1]).text(pct(d.p));
  });
  if(st.mode==="dx"&&st.ly.dxp&&st.mapOn)L.dx.forEach((d,i)=>{if(!dxNew(d))return;const q=pr([d.lon,d.lat]);if(!q)return;const gg=g.append("g").attr("class","clk").attr("tabindex",0).attr("role","button").attr("aria-label","DXpedition "+d.call);
    gg.append("circle").attr("cx",q[0]).attr("cy",q[1]).attr("r",11).attr("fill","transparent");gg.append("text").attr("class","star").attr("x",q[0]).attr("y",q[1]+5).attr("text-anchor","middle").text("★");gg.append("text").attr("class","dxx").attr("data-ax",q[0]).attr("data-ay",q[1]).attr("x",q[0]+8).attr("y",q[1]+4).text(d.call.split(" ")[0]);
    const o=()=>openPop({k:"d",i});gg.on("click",o).on("keydown",e=>{if(e.key==="Enter"){e.preventDefault();o()}})});
  if(st.ly.bcn&&st.mapOn){const {slot}=bcnNow();BCN.forEach((b,i)=>{const q=pr([b[2],b[3]]);if(!q)return;const act=BFQ.filter(([f,bi],k)=>(slot-k+18)%18===i);
    const gg=g.append("g").attr("class","bcnm").attr("data-bi",i).attr("tabindex",0).attr("role","button").attr("aria-label","Beacon "+b[0]);gg.append("rect").attr("x",q[0]-5).attr("y",q[1]-5).attr("width",10).attr("height",10).attr("rx",2).attr("fill",act.length?BC[act[0][1]]:"#9cc4ff").attr("stroke","#fff");
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
  const items=[["-1","All (the best)"],...BALL.map(i=>[String(i),BANDS[i]])];
  $("bandseg").innerHTML=`<span class="segl">Bands</span>`+items.map(([v,n])=>`<button data-mb="${v}"${v!=="-1"&&!BI0().includes(+v)?` class="clz" title="${MODES[MOD()].s} is not used on this band according to the band plan: the forecast is only a guide"`:""} aria-pressed="${st.mapOn&&(v==="-1"?!st.mbs.length:st.mbs.includes(+v))}">${v==="-1"?"":`<i style="background:${BC[+v]}"></i>`}${n}</button>`).join("");
  document.querySelectorAll('[data-mb]').forEach(b=>b.onclick=()=>{const v=+b.dataset.mb;if(v<0)st.mbs=[];else st.mbs=st.mbs.includes(v)?st.mbs.filter(x=>x!==v):[...st.mbs,v];store.set("mbs",JSON.stringify(st.mbs));renderBandSeg();drawMap()});
  renderModeChips($("mapmodes"),true);renderModeChips($("dxmodes"),false);
  document.querySelectorAll('[data-pa]').forEach(b=>b.setAttribute("aria-pressed",b.dataset.pa===st.path));
  document.querySelectorAll('[data-ly]').forEach(b=>b.setAttribute("aria-pressed",!!(st.ly[b.dataset.ly]&&(b.dataset.ly!=="dxp"||st.mapOn))));document.querySelectorAll('[data-dn]').forEach(b=>b.setAttribute("aria-pressed",b.dataset.dn===st.dens));
  $("mlegend").innerHTML=BI0().map(i=>`<span><i style="background:${BC[i]}"></i>${BANDS[i]}</span>`).join("")+
   `<span>Tap a dot, ★, ◆ or ■ for more data</span><span>— short · - - long</span><span>● white = hops</span><span style="color:#b9a3ff">▮ gray line</span><span>▮ night</span><span style="color:#ff8a80">▮ auroral oval (Kp ≥ 4)</span>`;
}
function renderModeChips(ms,withPred){if(!ms)return;const cur=MOD(),sel=CMS();const grp={};Object.entries(MODES).forEach(([k,o])=>{(grp[o.g]=grp[o.g]||[]).push(k)});
  ms.innerHTML=`<span class="segl">Modes</span>`+Object.entries(grp).map(([g,ks])=>`<span class="mgrp"><span class="mgl">${g==="Phone"?"Voice":g}</span>${ks.map(k=>`<button data-mm="${k}" aria-pressed="${sel.includes(k)}"${k===cur?' class="pm" title="Prediction mode"':""}>${MODES[k].s}</button>`).join("")}</span>`).join("")+
   (withPred?`<span class="mpred">${sel.length>1?`VOACAP prediction for <select id="mpm" aria-label="Prediction mode">${sel.map(k=>`<option value="${k}"${k===cur?" selected":""}>${MODES[k].s}</option>`).join("")}</select> · cluster with ${sel.length} modos`:`Prediction and cluster in ${MODES[cur].s}. Tap more modes to add them to the cluster.`}</span>`:`<span class="mpred"></span>`);
  ms.querySelectorAll("[data-mm]").forEach(b=>b.onclick=()=>toggleCM(b.dataset.mm));
  const pm=ms.querySelector("#mpm");if(pm)pm.onchange=()=>setPredMode(pm.value)}
function setPredMode(k){if(k===MOD())return;st.cmsBase=k;const s=$("modesel");s.value=k;s.dispatchEvent(new Event("change"))}
function toggleCM(k){let s=CMS().slice();if(s.includes(k)){if(s.length===1)return;s=s.filter(x=>x!==k)}else s.push(k);st.cms=s;if(st.page==="mapa")st.mapOn=true;
  if(!s.includes(MOD())){setPredMode(s[0]);return}renderAlBar();renderBandSeg();renderSide();if(st.page==="mapa")drawMap()}
/* ---------- ventana emergente del mapa ---------- */
function openPop(p){st.pop=p;if(!st.mapOn){st.mapOn=true;renderBandSeg();if(st.page==="mapa")drawMap()}renderPop()}
function closePop(){st.pop=null;$("mpop").hidden=true}
function bandRows(t,lh){return `<table><tr><th>Band</th><th>They hear you (short)</th><th>Long</th><th>You hear them</th><th>Hops (short)</th></tr>`+BI0().slice().reverse().map(b=>{const a=prob(t,lh,b,false),c=prob(t,lh,b,true),hr=Math.max(prob(t,lh,b,false,"rx").p,t.l?prob(t,lh,b,true,"rx").p:0),hp=hopsAt(t,lh,b,false);const nb=bandNeed(t,b);
  return `<tr><td><span style="color:${BC[b]}">●</span> ${BANDS[b]}${nb===true?' <span class="need">new</span>':nb===false?' <span class="have">✔</span>':""}</td><td class="${cls(a.p)}">${a.na?"—":pct(a.p)}</td><td class="${cls(c.p)}">${t.l&&!c.na?pct(c.p):"—"}</td><td class="${cls(hr)}">${a.na?"—":pct(hr)}</td><td>${hp?hp.n+" × "+fk(hp.len)+" km · "+hp.ang+"°":"—"}</td></tr>`}).join("")+"</table>"}
function tBlock(t,lh){const se=sunEvents([t.lon,t.lat]),gw=greyWins(t),lw=lpWins(t),bh=(()=>{let r={p:0,h:0,b:0,lp:false};for(let x=0;x<24;x++){const q=bestAny(t,x);if(q.p>r.p)r={...q,h:x}}return r})(),n=bestAny(t,lh);
  return `<p class="note" style="margin:0"><b style="color:#fff">Short:</b> ${t.az}° ${cab(t.az)} · ${fk(t.km)} km &nbsp; <b style="color:#fff">Long:</b> ${t.laz}° ${cab(t.laz)} · ${fk(t.lkm)} km<br>CQ zone ${t.cq} · ${t.cont}${entNeed(t)===true?' · <span class="need">needed (QRZ)</span>':entNeed(t)===false?' · <span class="have">confirmed on QRZ</span>':""}</p>
  <p style="margin:6px 0 0">At ${hh(lh)}:00: ${n.p<.01?"<b>nothing open</b>.":`<b>${Math.round(n.p*100)} %</b> on ${BANDS[n.b]} via ${n.lp?"long path":"short path"}.`} Best time: <b>${hh(bh.h)}:00</b> on ${BANDS[bh.b]}${bh.lp?" (long)":""} (${Math.round(bh.p*100)} %).</p>
  <p class="note" style="margin:4px 0 0">There: sunrise ${se.rise!=null?hm(se.rise):"—"} · sunset ${se.set!=null?hm(se.set):"—"} (your time)${se.polar?" · polar "+se.polar:""}. Common gray line: ${gw.length?gw.map(w=>hm(w[0])+"–"+hm(w[1])).join(", "):"none today"}.${t.l?" Long path better than short: "+(lw.length?lw.map(w=>hh(w[0])+"–"+hh(w[1])+" h").join(", "):"never today")+".":""}</p>`+bandRows(t,lh)}
function calBtns(t){const b=st.mband>=0?st.mband:bestAny(t,st.mhour).b,lh=st.mhour;if(b==null||b<0||VUHF(b))return `<div class="acts"><button class="btn" data-goz="${t.id}">Full profile</button></div>`;
  const last=(typeof OBS!=="undefined"?OBS:[]).slice().reverse().find(o=>o.t===t.id&&o.b===b&&o.lh===lh&&o.k===calKey());const n=(typeof OBS!=="undefined"?OBS:[]).filter(o=>o.k===calKey()).length;
  const fresh=LASTOBS&&LASTOBS.t===t.id&&LASTOBS.b===b&&LASTOBS.lh===lh&&Date.now()-LASTOBS.at<4000;const p=Math.round(Math.max(prob(t,lh,b,false).p,t.l?prob(t,lh,b,true).p:0)*100);
  const ico={y:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',n:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>'};
  return `<div class="calbx${last?(last.h?" isy":" isn"):""}"><p class="calq">Do you hear this zone on <b style="color:${BC[b]}">${BANDS[b]}</b> at ${hh(lh)}:00? <span class="note">The platform gives ${p} %.</span></p>
   <div class="calbt" role="group" aria-label="Do you hear it?"><button class="btn obs obsy${fresh&&last&&last.h?" pulse":""}" aria-pressed="${!!(last&&last.h)}" data-obs="1" data-t="${t.id}" data-b="${b}">${ico.y}<span>I hear it</span></button><button class="btn obs obsn${fresh&&last&&!last.h?" pulse":""}" aria-pressed="${!!(last&&!last.h)}" data-obs="0" data-t="${t.id}" data-b="${b}">${ico.n}<span>I don't hear it</span></button><button class="btn" data-goz="${t.id}">Full profile</button></div>
   ${last?`<p class="calmsg">${last.h?"Noted: <b>you hear it</b>":"Noted: <b>you don't hear it</b>"} on ${BANDS[b]} at ${hh(lh)}:00. The predictions have already been recalculated with ${n} report${n===1?"":"s"} of yours. <button class="lnk" data-undo="${t.id}|${b}|${lh}">Undo</button></p>`:`<p class="note calhint">Your answer adjusts the predictions to your real station.</p>`}</div>`}
function renderPop(){const p=st.pop,el=$("mpop");if(!p){el.hidden=true;return}const lh=st.mhour;let h="";
  if(p.k==="t"){const t=T(p.id);if(!t){closePop();return}const d=dxIn(t.id);h=`<h3>${esc(t.name)}</h3>`+tBlock(t,lh)+(d.length?`<p style="margin:6px 0 0">★ ${d.map(x=>`<b>${CS(x.call)}</b> until ${esc(x.until)}`).join(", ")}</p>`:"")+calBtns(t)}
  else if(p.k==="d"){const d=L.dx[p.i];if(!d){closePop();return}const t=tFor(d);const az=Math.round(brgJS(TXP,[d.lon,d.lat])),km=Math.round(distJS(TXP,[d.lon,d.lat]));const onc=SPOTS().filter(s=>d.call.includes(s.call));
    h=`<h3>★ ${CS(d.call)}</h3><p style="margin:0"><b>${esc(d.ent)}</b> · until ${esc(d.until)}${d.qsl?" · QSL: "+esc(d.qsl):""}</p><p class="note" style="margin:4px 0 0">${esc(d.info)}</p>`+
     (d.qsx&&MOD()==="ssb"?`<p style="margin:4px 0 0"><b>Phone frequencies:</b> ${esc(d.qsx)}</p>`:`<p class="note" style="margin:4px 0 0">${MOD()==="ssb"?"Phone frequencies not published. ":""}Usual on DXpeditions on ${MD().s}: ${MD().dxq}.${d.qsx&&MOD()!=="ssb"?" Announced: "+esc(d.qsx)+".":""}</p>`)+
     (onc.length?`<p style="margin:4px 0 0;color:#ffd76a"><b>◆ On the cluster:</b> ${onc.map(s=>`${s.f} at ${s.t} UTC`).join(", ")}</p>`:"")+
     `<p class="note" style="margin:4px 0 0">${d.pilot?"Pilot: "+esc(d.pilot)+" · ":""}<a href="https://clublog.org/livestream/${encodeURIComponent(d.call.split(" ")[0].split("/")[0]==="6W"?d.call.split(" ")[0]:d.call.split(" ")[0])}" target="_blank" rel="noopener">Live log (Club Log)</a>${d.web?` · <a href="${esc(d.web)}" target="_blank" rel="noopener">Website</a>`:""}</p>
     <p class="note" style="margin:4px 0 0">Its position: short ${az}° ${cab(az)} · ${fk(km)} km — long ${(az+180)%360}° ${cab((az+180)%360)} · ${fk(40030-km)} km. Forecast with the nearest destination: ${esc(t?t.name:"—")}.</p>`+(t?bandRows(t,lh)+calBtns(t):"")}
  else if(p.k==="s"){const s=SPOTS()[p.i];if(!s){closePop();return}const e=spotEval(s,lh);
    h=`<h3>◆ ${CS(s.call)} · ${esc(s.f)}</h3><p style="margin:0">${BANDS[s.band]} · ${esc(s.t)} UTC (${ageTxt(spotAge(s))}) · heard by ${CSL(s.by)}</p><p class="note" style="margin:4px 0 0">${esc(s.c)}</p>`+
     (e?`<p style="margin:6px 0 0">For you: <b>${Math.round(e.p*100)} %</b> via ${e.lp?"long path":"short path"} (short ${e.az}° ${cab(e.az)} · ${fk(e.km)} km · long ${e.laz}° ${cab(e.laz)} · ${fk(e.lkm)} km).</p><p class="note" style="margin:4px 0 0"><i>Why:</i> ${explain(e.t,s.band,lh,e.lp)}</p>`+calBtns(e.t):"")}
  else if(p.k==="b"){const b=BCN[p.i];const t=nearestT([b[2],b[3]],0);const az=Math.round(brgJS(TXP,[b[2],b[3]])),km=Math.round(distJS(TXP,[b[2],b[3]]));const heard=(L.beacons||[]).filter(x=>x.call===b[0]);
    h=`<h3>Beacon ${CS(b[0])}</h3><p style="margin:0">${esc(b[1])} · short ${az}° ${cab(az)} · ${fk(km)} km — long ${(az+180)%360}° ${cab((az+180)%360)} · ${fk(40030-km)} km</p><p class="note" style="margin:4px 0 0">Transmits 10 s on each frequency (14.100 → 18.110 → 21.150 → 24.930 → 28.200) and repeats every 3 min, stepping down from 100 W to 10, 1 and 0.1 W. If you hear it at the lowest power, the path is wide open.</p>`+
     (heard.length?`<p style="margin:4px 0 0"><b>Heard today:</b> ${heard.map(x=>`${esc(x.f)} at ${esc(x.t)} UTC${x.by?" por "+CSL(String(x.by||"").split(/[ ,]+/)):""}`).join(", ")}</p>`:"")+
     `<table><tr><th>Frequency</th><th>Forecast (short)</th></tr>${BFQ.map(([f,bi])=>{const q=prob(t,lh,bi,false);return `<tr><td>${f}</td><td class="${cls(q.p)}">${q.na?"—":pct(q.p)} %</td></tr>`}).join("")}</table>`}
  el.innerHTML=`<button class="x" aria-label="Close" id="mpx">×</button>`+h;el.hidden=false;
  $("mpx").onclick=closePop;
  el.querySelectorAll("[data-obs]").forEach(b=>b.onclick=()=>addObs(b.dataset.t,+b.dataset.b,b.dataset.obs==="1"));
  el.querySelectorAll("[data-undo]").forEach(b=>b.onclick=()=>{const [t,bb,h]=b.dataset.undo.split("|");undoObs(t,+bb,+h)});
  el.querySelectorAll("[data-goz]").forEach(b=>b.onclick=()=>{st.zone=b.dataset.goz;store.set("pz",st.zone);go("fichas");selTab("fichas","f_info",true);renderInfo()});
}
/* pantalla completa */
function setFSM(on){const c=$("mapcard");if(on){const d=$("mapctlw");if(d)d.open=true}{const ms=$("mstats");if(ms){if(on)c.querySelector(".mapctl").appendChild(ms);else $("mlegend").after(ms)}}c.classList.toggle("fsm",on);if(!on)c.classList.remove("fs","nopan");$("mfs").textContent=on?"Exit full screen":"Full screen";const small=false;c.classList.toggle("nopan",small);$("mpan").textContent=small?"Show controls":"Hide controls";document.body.classList.toggle("mapfs",on);if(st.page==="mapa")requestAnimationFrame(()=>drawMap())}
function toggleFS(){const c=$("mapcard");const fsEl=document.fullscreenElement||document.webkitFullscreenElement;
  if(fsEl||c.classList.contains("fsm")){if(fsEl){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}}setFSM(false);return}
  const req=c.requestFullscreen||c.webkitRequestFullscreen;let p=null;try{p=req?req.call(c):null}catch(e){p=null}
  const fallback=()=>{c.classList.add("fs");setFSM(true)};
  if(p&&p.then)p.then(()=>setFSM(true)).catch(fallback);else if(!req)fallback();else setFSM(true)}
["fullscreenchange","webkitfullscreenchange"].forEach(ev=>document.addEventListener(ev,()=>{const fsEl=document.fullscreenElement||document.webkitFullscreenElement;if(!fsEl&&!$("mapcard").classList.contains("fs"))setFSM(false)}));
{let rt=0;addEventListener("resize",()=>{if(!$("mapcard").classList.contains("fsm"))return;clearTimeout(rt);rt=setTimeout(()=>drawMap(),150)})}
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&!$("mapcard").classList.contains("fs"))$("mfs").textContent="Full screen"});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if($("mapcard").classList.contains("fs")){$("mapcard").classList.remove("fs");$("mfs").textContent="Full screen"}else if(st.pop)closePop()}});

/* ---------- ahora / lateral ---------- */
function renderSide(){
  const lh=st.mhour,now=localNow();
  const per=BI().map(b=>{let mx={p:0,t:null},cnt=0,act=0,na=false;for(const t of TG().filter(inMode)){const a=prob(t,lh,b,false),c=prob(t,lh,b,true);if(a.na)na=true;const r=c.p>a.p?{...c,lp:true}:{...a,lp:false};if(r.p>=.3)cnt++;act+=st.mode==="contest"?cval(t,b,a.p):r.p;if(r.p>mx.p)mx={p:r.p,t,muf:r.muf,lp:r.lp}}const ms=cmults(lh,b);if(st.mode==="contest")cnt=ms.size;return {b,mx,cnt,act,na,ms:[...ms].sort((a,c)=>a-c)}});
  const amax=Math.max(1e-9,...per.map(x=>x.act));
  $("bands").innerHTML=per.slice().reverse().map(x=>x.na?`<div class="brow"><div class="n"><i style="background:${BC[x.b]}"></i>${BANDS[x.b]}</div><div class="bar"></div><div class="p">—</div><div class="d">None of your antennas covers this band</div></div>`:st.mode==="contest"
    ?`<div class="brow"><div class="n"><i style="background:${BC[x.b]}"></i>${BANDS[x.b]}</div><div class="bar"><span style="width:${Math.round(x.act/amax*100)}%;background:${BC[x.b]}"></span></div><div class="p">${Math.round(x.act/amax*100)}</div><div class="d">${x.cnt?`Open multipliers: ${x.cnt}`:"No open multipliers"} · strongest: ${x.mx.t?esc(x.mx.t.name):"—"} · ${skipTxt(x.b,lh)}</div></div>`
    :`<div class="brow"><div class="n"><i style="background:${BC[x.b]}"></i>${BANDS[x.b]}</div><div class="bar"><span style="width:${Math.round(x.mx.p*100)}%;background:${BC[x.b]}"></span></div><div class="p">${Math.round(x.mx.p*100)}%</div><div class="d">${x.mx.p>=.05?`Best DX: ${esc(x.mx.t.name)}${x.mx.lp?" (long path)":""} · ${x.cnt} destination${x.cnt===1?"":"s"} ≥30 %`:"Closed or nearly so for your station"} · ${skipTxt(x.b,lh)}</div></div>`).join("");
  const top=st.mode==="contest"?per.filter(x=>x.mx.p>=.05).sort((a,b)=>b.act-a.act)[0]:per.filter(x=>x.mx.p>=.05).sort((a,b)=>b.cnt-a.cnt||b.mx.p-a.mx.p)[0];
  const allz=[];for(const t of TG().filter(inMode))for(const b of BI()){allz.push({t,b,lp:false,...prob(t,lh,b,false)});if(st.mode==="dx"&&t.l)allz.push({t,b,lp:true,...prob(t,lh,b,true)})}
  allz.sort((a,b)=>st.mode==="contest"?cval(b.t,b.b,b.p)-cval(a.t,a.b,a.p):b.p-a.p);
  if(st.mode==="dx"){const far=allz.filter(z=>z.t.km>=2500);const rare=allz.filter(z=>z.t.km<2500);allz.length=0;allz.push(...far,...rare)}
  const needZ=allz.filter(z=>entNeed(z.t)===true&&z.p>=.15);
  const dxNow=L.dx.filter(dxNew).map(d=>{const t=tFor(d);return t?{d,t,...bestAny(t,lh)}:null}).filter(x=>x&&x.p>=.1).sort((a,b)=>b.p-a.p);
  const isNow=lh===now,when=isNow?"Now":"At "+hh(lh)+":00";
  const sp=SPOTS().map(s=>({s,e:spotEval(s,lh),a:spotAge(s)})).filter(x=>x.e);
  const dxs=sp.filter(x=>spotKind(x.s)==="dx").sort((a,b)=>b.e.p-a.e.p),ind=sp.filter(x=>spotKind(x.s)==="ind"),bcnH=(L.beacons||[]);
  let h="<div><h3>What the cluster says</h3>";
  if(!sp.length)h+=`<p>No useful phone spots on the bands of this mode. ${L.spotsSrc?"(Read: "+esc(L.spotsSrc)+".)":""}</p>`;
  dxs.slice(0,6).forEach(({s,e,a})=>{const nb=bandNeed(e.t,s.band);const v=e.p>=.3?"Worth going now":e.p>=.1?"Possible with patience: call when the pile-up drops":"Low according to the model, but the spot says the band is better today: listen for a couple of minutes";
    h+=`<p>◆ <b>${CS(s.call)}</b> on <b>${esc(s.f)}</b> (${BANDS[s.band]}), ${ageTxt(a)}: copied by ${CSL(s.by," and ")}${nb===true?' <span class="need">· needed on this band</span>':""}. For you, via ${e.lp?"long path":"short path"}: <b>${Math.round(e.p*100)} %</b> (bearing ${e.lp?e.laz:e.az}° ${cab(e.lp?e.laz:e.az)}). ${v}.</p><details class="why"><summary>Why</summary><p>${explain(e.t,s.band,lh,e.lp)}</p></details>`});
  ind.slice(0,3).forEach(({s,e,a})=>{h+=`<p><b>Indicator</b> ${ageTxt(a)}: ${esc(s.c)} (${esc(s.f)}). ${BANDS[s.band]} is open now in that direction. Your model toward ${esc(e.t.name)}: <b>${Math.round(e.p*100)} %</b>.</p>`});
  if(bcnH.length)h+=`<p><b>Beacons heard:</b> ${bcnH.slice(0,6).map(x=>`${CS(x.call)} on ${esc(x.f)} (${esc(x.t)} UTC)`).join(", ")}. They confirm those directions are open.</p>`;
  const newest=sp.length?Math.min(...sp.map(x=>x.a??1e9)):null;
  if(sp.length&&!isNow)h+=`<p class="note">The spots are from ${esc((L.updatedUTC||"").slice(11,16))} UTC; you are viewing another hour.</p>`;
  if(newest!=null&&newest>90)h+=`<p class="note">The spots are more than an hour and a half old. Press «Update».</p>`;
  h+="</div><div><h3>Band conditions</h3>";const fo=foF2est(lh);
  if(!top)h+=`<p>${when} no band goes above 5 % with this station. Check the 24 h timeline to see when it opens.</p>`;
  else{const z=allz[0];
    h+=st.mode==="contest"?`<p>${when}, the band that gives the most points in the ${CT().n} is <b>${BANDS[top.b]}</b> (${top.cnt} open multiplier${top.cnt===1?"":"s"}). Where most QSOs will come from: <b>${esc(z.t.name)}</b> on ${BANDS[z.b]} (${Math.round(z.p*100)} %).</p><details class="why"><summary>Why</summary><p>${explain(z.t,z.b,lh,false)}</p></details>`
     :`<p>${when}, the best band is <b>${BANDS[top.b]}</b>, with ${top.cnt} destination${top.cnt===1?"":"s"} above 30 %. The most likely DX: <b>${esc(z.t.name)}</b> on ${BANDS[z.b]} via ${z.lp?"long path":"short path"} (${Math.round(z.p*100)} %).</p><details class="why"><summary>Why</summary><p>${explain(z.t,z.b,lh,z.lp)}</p></details>`}
  if(st.mode==="dx"){const re=TG().filter(t=>t.km<2500&&rareOn(t)).map(t=>({t,...bestAny(t,lh)})).filter(x=>x.p>=.15);if(re.length)h+=`<p><b>Rare Europe on the air:</b> ${re.map(x=>`${esc(x.t.name)} on ${BANDS[x.b]} (${Math.round(x.p*100)} %)`).join(", ")}.</p>`}
  ;
  h+="</div><div><h3>What to do</h3>";const steps=[];const goNow=dxs.filter(x=>x.e.p>=.1);
  if(st.mode==="contest"){if(top)steps.push(`Stay on <b>${BANDS[top.b]}</b>. If calling CQ gives no rate, search and pounce.`);if(goNow.length)steps.push(`Multiplier on the cluster: <b>${CS(goNow[0].s.call)}</b> on ${esc(goNow[0].s.f)} (${Math.round(goNow[0].e.p*100)} %).`)}
  else{if(!window.ACRACB_recCards)goNow.slice(0,3).forEach(x=>steps.push(`Go to <b>${esc(x.s.f)}</b> and look for <b>${CS(x.s.call)}</b>${/up|above|split/i.test(x.s.c)?" (listens up: works split)":""}, ${x.e.lp?"via long path":"via short path"} (${Math.round(x.e.p*100)} %).`));
    if(!window.ACRACB_recCards)dxNow.filter(x=>!goNow.some(g=>x.d.call.includes(g.s.call))).slice(0,3).forEach(x=>steps.push(`DXpedition within reach: <b>${CS(x.d.call)}</b>${(()=>{const e=callEnt(x.d.call),n=String(x.d.ent||"").trim(),k=e&&e.name?e.name:"";if(!n||n.toLowerCase()===k.toLowerCase())return "";if(k&&n.toLowerCase().startsWith(k.toLowerCase())){const r=n.slice(k.length).trim();return /^\(.+\)$/.test(r)?" "+esc(r):""}return " ("+esc(n)+")"})()} on ${BANDS[x.b]} via ${x.lp?"long path":"short path"} (${Math.round(x.p*100)} %)${x.d.qsx?", on "+esc(x.d.qsx):""}.`));
    if(LOG&&needZ.length)steps.push(`Needed and open: ${needZ.slice(0,4).map(z=>`<b>${esc(z.t.name.split(" (")[0])}</b> on ${BANDS[z.b]} (${Math.round(z.p*100)} %)`).join(", ")}.`);
    if(top)steps.push(`If there is nothing like that, tune <b>${BANDS[top.b]}</b> toward ${esc(allz[0].t.name)}.`)}
  const RCH=st.mode!=="contest"&&window.ACRACB_recCards?ACRACB_recCards(goNow.slice(0,3),dxNow.filter(x=>!goNow.some(g=>x.d.call.includes(g.s.call))).slice(0,3)):"";h+=RCH;h+=steps.length?"<ol style='margin:4px 0 0;padding-left:20px'>"+steps.map(x=>`<li>${x}</li>`).join("")+"</ol>":RCH?"":"<p>Nothing useful at this time.</p>";
  const k=kpAt(lh);if(k>=4)h+=`<p class="note" style="color:#ff8a80">Kp ${k}: polar paths penalized; the southern ones hold up.</p>`;
  if(sunEl(TXP,lh)>0&&L.radio)h+=`<p class="note">Flare blackout: ${L.radio.r12} % (if everything goes quiet, wait 15–60 min).</p>`;
  $("rec").innerHTML=`<div class="rec">${h}</div></div>`;$("rech").textContent=isNow?"What to do now":"What to do at "+hh(lh)+":00";
  // DX
  if(st.page!=="dx")return;
  $("dxl").innerHTML=L.dx.map((d,i)=>{const t=tFor(d);if(!t)return "";const p=[d.lon,d.lat],az=Math.round(brgJS(TXP,p)),km=Math.round(distJS(TXP,p));let bh={p:0,h:0,b:0,lp:false};for(let x=0;x<24;x++){const r=bestAny(t,x);if(r.p>bh.p)bh={...r,h:x}}
    const n=bestAny(t,lh),onc=SPOTS().find(s=>d.call.includes(s.call)),nw=dxNew(d);
    return `<button class="dx" data-dxi="${i}"><span><span class="c">${nw?"★\u00a0":"✔\u00a0"}${CS(d.call)}</span>${(()=>{const e=callEnt(d.call);return e&&e.name&&String(d.ent||"").toLowerCase()!==e.name.toLowerCase()?` <span class="cty">· ${esc(d.ent)}</span>`:""})()}${d.mw?` <span class="agr dif">Most Wanted # ${esc(d.mw)}</span>`:""}${MOD()==="ssb"&&d.ssb===false?'<br><span class="tag">phone not confirmed</span>':""}</span><span class="pill ${cls(n.p)}">${Math.round(n.p*100)}%</span>
    <span class="w">${window.ACRACB_dxon?ACRACB_dxon(d):(onc?`<b style="color:#ffd76a">◆ On the cluster: ${esc(onc.f)} at ${esc(onc.t)} UTC</b><br>`:"")}${az}° ${cab(az)} · long ${(az+180)%360}° · ${fk(km)} km · best ${hh(bh.h)}:00 on ${BANDS[bh.b]} (${Math.round(bh.p*100)} %) · until ${esc(d.until)}</span></button>`}).join("")+(L.dxHidden&&MOD()==="ssb"?`<p class="note" style="margin:4px 0 0">Not shown: ${L.dxHidden} active expeditions that do not announce phone.</p>`:"");
  document.querySelectorAll('.dx[data-dxi]').forEach(b=>b.onclick=()=>{openPop({k:"d",i:+b.dataset.dxi});go("mapa")});
  {const h=$("clh");if(h){const sa=(Date.parse(L.spotsUTC||L.updatedUTC)||0);const m=sa?Math.max(0,Math.round((Date.now()-sa)/60000)):null;const ck=(Date.parse(L.spotsChecked)||0),mc=ck?Math.max(0,Math.round((Date.now()-ck)/60000)):null;{const E=window.ACRACB_LANG==="en",fr=mc!=null&&mc<=3,dot=`<i class="cld ${mc==null?"":fr?"ok":"old"}" title="${mc==null?"":E?`checked ${mc} min ago`:`revisado hace ${mc} min`}"></i>`;const bits=[CMSTXT()+(HB()!=null?" · "+BANDS[HB()]:"")];if(mc!=null&&!fr)bits.push(E?`checked ${mc} min ago`:`revisado hace ${mc} min`);if(L.spotsNew!=null)bits.push(E?`${L.spotsNew} new`:`${L.spotsNew} new`);if(m!=null)bits.push(E?`last spot ${m} min ago`:`último spot hace ${m} min`);
  h.innerHTML=(E?"World cluster":"Cluster worldwide")+`<span class="clst">${dot}${bits.join(" · ")}</span>`}}}
  $("spots").innerHTML=(dxs.length||ind.length?[...dxs,...ind].map(({s,e,a})=>`<div class="sp ${a>60?"old":""}"><span class="f" style="color:${BC[s.band]}">${esc(s.f)}</span><span>${s.nw?'<span class="nwb">NEW</span> ':""}<b>${CS(s.call)}</b> <span class="sage" title="${esc(s.t)} UTC">${ageTxt(a)}</span>${s.ns>1?` <span class="nsb" title="This spot appears in ${s.ns} different clusters">en ${s.ns} clusters</span>`:""}</span><span class="w">${CSL(s.by)}${window.ACRACB_tags?ACRACB_tags(s):""}<br>${e.az}° ${cab(e.az)} · ${fk(e.km)} km · <b>${Math.round(Math.max(e.pSP,e.t.l?e.pLP:0)*100)} %</b>${e.t.l&&e.pLP>e.pSP?" (long)":""}</span></div>`).join(""):`<div class="empty">No spots of ${CMSTXT()} useful${MOD()!=="ssb"&&!(L.spots||[]).some(s=>s.mode)?": current data only includes phone; the next update will bring all modes":""}.</div>`)+`<details class="srcd"><summary>Sources</summary><p class="note">${esc(L.spotsSrc||"—")}</p></details>`;
  const nr=SPOTS().filter(s=>spotKind(s)==="near");
  const nrA=nr.map(s=>({s,a:spotAge(s)})).sort((x,y)=>(x.a??1e9)-(y.a??1e9));
  $("near").innerHTML=(nrA.length?nrA.map(({s,a})=>{const p=s.dx&&s.dx.length===2?s.dx:null,az=p?Math.round(brgJS(TXP,p)):null,km=p?Math.round(distJS(TXP,p)):null;
    const ref=(()=>{const m=String(s.c||"").match(/(POTA|SOTA|WWFF|GMA|DME|DVGE|DFE|DME?-?\d|IOTA|DIE|DCE|DMVE|DEE)[ :-]*[A-Z0-9/-]+|skimmer|PSK Reporter|escucha[^,;.]*|up ?\d*/i);return m?" · "+esc(m[0]):""})();
    return `<div class="sp ${a>60?"old":""}"><span class="f" style="color:${BC[s.band]}">${esc(s.f)}${s.mode&&window.ACRACB_mb?" "+ACRACB_mb(s.mode):""}</span><span>${s.nw?'<span class="nwb">NEW</span> ':""}<b>${CS(s.call)}</b> <span class="sage" title="${esc(s.t)} UTC">${ageTxt(a)}</span>${s.ns>1?` <span class="nsb" title="This spot appears in ${s.ns} different clusters">en ${s.ns} clusters</span>`:""}</span><span class="w">${CSL(s.by)}${ref}<br>${az!=null?`${az}° ${cab(az)} · ${fk(km)} km · `:""}<b>${BANDS[s.band]||""}</b>${s.mode&&!window.ACRACB_mb?" "+esc(s.mode):""}</span></div>`}).join(""):`<div class="empty">No nearby spots of ${CMSTXT()} now.</div>`)+(L.nearNote?`<p class="note" style="margin:4px 0 0">${esc(L.nearNote)}</p>`:"");
}
/* ---------- línea de 24 h ---------- */
let TLG=0;function renderTL(){const g=++TLG;
  const now=localNow();let h="";
  $("tlt").textContent=st.mode==="contest"?"Your contest: busiest band hour by hour":"Your DX day: best band hour by hour";
  const TGM=TG().filter(inMode),BIL=BI();let x=0;const hour=()=>{let bb=BIL[0],bc=-1,bp=0,ba=-1;for(const b of BIL){let c=0,mp=0,a=0;for(const t of TGM){const p=st.mode==="dx"?Math.max(prob(t,x,b).p,prob(t,x,b,true).p):prob(t,x,b).p;if(p>=.3)c++;if(p>mp)mp=p;a+=cval(t,b,p)}if(st.mode==="contest")c=cmults(x,b).size;
      if(st.mode==="contest"?a>ba:(c>bc||(c===bc&&mp>bp))){bc=c;bb=b;bp=mp;ba=a}}
    const col=bp<.05?"#1a2433":BC[bb];h+=`<button style="background:${col};opacity:${bp<.05?1:.45+Math.min(bp,1)*.55}" aria-current="${x===st.mhour}" title="${hh(x)}:00 · ${BANDS[bb]} · ${bc} ≥30 %" data-h="${x}">${bp<.05?"–":BANDS[bb].replace(/\s+m$/,"")}<span>${bc}</span></button>`;x++};const t0=performance.now();while(x<24&&performance.now()-t0<40)hour();
  const fin=()=>{
  $("tl").innerHTML=h;$("tlh").innerHTML=Array.from({length:24},(_,x)=>`<span style="${x===now?"color:var(--accent);font-weight:700":""}">${hh(x)}</span>`).join("");
  document.querySelectorAll('#tl button').forEach(b=>b.onclick=()=>{st.mhour=+b.dataset.h;$("mh").value=st.mhour;refresh()});
  const s=sunEvents(TXP);$("sun").innerHTML=`<span>Sunrise <b>${hm(s.rise)}</b></span><span>Solar noon <b>${hm(s.noon)}</b></span><span>Sunset <b>${hm(s.set)}</b></span><span>Small number = destinations ≥30 %${st.mode==="dx"?" (DX)":" (multipliers)"}</span><span>Tap an hour to see it on the map</span>`;
};
  if(x>=24)return fin();if(!$("tl").children.length)$("tl").innerHTML='<p class="note">Calculating the 24 hours…</p>';
  const step=()=>{if(g!==TLG)return;const t1=performance.now();while(x<24&&performance.now()-t1<14)hour();if(x<24)setTimeout(step,0);else fin()};setTimeout(step,0)}


/* ---------- 6 m, 2 m y 70 cm: ¿hay apertura? ---------- */
const ESMES=[.05,.05,.08,.2,.55,.9,.85,.6,.2,.08,.05,.15];
function vhfSpots(b){return (L.spots||[]).filter(x=>x.band===b).map(x=>{const a=spotAge(x);const d=Math.max(0,...(x.from||[]).map(fr=>x.dx?distJS(fr,x.dx):0));return {x,a,d}}).filter(o=>o.a==null||o.a<=150).sort((p,q)=>q.d-p.d)}
function vhfStatus(b){const mo=new Date().getUTCMonth(),es=ESMES[mo],sp=vhfSpots(b),top=sp[0],lh=localNow();const R=MOD()==="fm"||b!==10?vhfRange(b===10?11:b):0;
  const sTxt=o=>`${CS(o.x.call)} on ${esc(o.x.f)} (${esc(o.x.mode||"SSB")}), heard at ${fk(Math.round(o.d))} km by ${esc((o.x.by||[]).slice(0,2).join(", "))}${o.a!=null?", "+ageTxt(o.a):""}`;
  if(b===10){let f2=0,ft=null;for(const t of TG()){const p=prob(t,lh,10,false).p;if(p>f2){f2=p;ft=t}}
    if(top&&top.d>=3500)return ["g","Open to long distance",`There are 6 m spots beyond 3,500 km: ${sTxt(top)}. That is F2-layer or transequatorial propagation (TEP).`,"Look for long-haul DX on 50.100–50.200 kHz (SSB) and on 50.313 kHz (FT8). These openings are short: call now."];
    if(top&&top.d>=700)return ["g","Open by sporadic E",`There are 6 m spots between 700 and 2,300 km: ${sTxt(top)}. That is the signature of sporadic E.`,"Listen on 50.110–50.200 kHz and check FT8 on 50.313 kHz: it usually opens toward a specific area of Europe for minutes or hours."];
    if(f2>=.3)return ["y","Possible via the F2 layer",`VOACAP gives ${Math.round(f2*100)} % toward ${esc(ft.name)} via the F2 layer at this time, but there are no spots to confirm it.`,"Put FT8 on 50.313 kHz or listen to the 6 m beacons: if distant stations show up, the band is open."];
    if(es>=.5)return ["y","Sporadic E season",`No long-distance 6 m spots right now, but in ${MESES[mo]} sporadic E opens 6 m almost daily in Europe (${Math.round(es*100)} % of days), especially in mid-morning and late afternoon.`,"Watch the cluster and FT8 on 50.313 kHz: openings come without warning."];
    return ["r","Closed",`No long-distance 6 m spots, VOACAP sees no F2-layer path (maximum ${Math.round(f2*100)} %) and in ${MESES[mo]} sporadic E is rare (${Math.round(es*100)} % of days).`,"Only local or regional contacts by direct wave. The big 6 m openings come in summer or with high solar activity."]}
  const nm=b===11?"2 m":"70 cm",lim=b===11?500:400,tro=L.vhf&&L.vhf.tropo!=null?+L.vhf.tropo:null;
  if(top&&top.d>=1000&&top.d<=2400&&b===11)return ["g","Open by sporadic E",`There are 2 m spots at ${fk(Math.round(top.d))} km: ${sTxt(top)}. On 2 m that is usually very intense sporadic E.`,"It is very rare and lasts minutes: go to 144.300 (SSB) o 144.174 (FT8) ya."];
  if(top&&top.d>=lim)return ["g","Open by tropo",`There are spots of ${nm} at ${fk(Math.round(top.d))} km: ${sTxt(top)}. At that distance a tropospheric duct is needed (temperature inversion).`,`Call on ${b===11?"144.300 (SSB) y 144.174 (FT8)":"432.200 (SSB) y 432.174 (FT8)"}, pointing to where the spots come from. Over the sea ducts reach very far, for example to the Balearic Islands, Italy or the Canary Islands.`];
  if(tro!=null&&tro>=5)return ["y","Favorable tropo",`No long-distance spots, but the tropo forecast ${L.vhf.src?"("+esc(L.vhf.src)+") ":""}da ${tro} out of 10 for your area.`,`Listen on ${b===11?"144.300 and 144.174":"432.200 and 432.174"}: with a duct you go from ${fk(R)} km to several hundred more.`];
  if(b===11&&es>=.8)return ["y","Possible sporadic E",`No long-distance spots now, but in ${MESES[mo]} sporadic E sometimes reaches 2 m (a few days a year). Normal range with your station on ${MD().s}: about ${fk(R)} km.`,"If 6 m is wide open under 1,000 km, watch 2 m: it may open too."];
  return ["r","No long-distance opening",`No spots of ${nm} beyond ${lim} km${tro!=null?" and the tropo forecast is low ("+tro+"/10)":""}. With your station on ${MD().s}, the normal range by tropospheric scatter is about ${fk(R)} km.`,`Local and regional contacts${MD().s==="FM"?" simplex or via repeater":""}. Raising the antenna, using a beam or switching to CW or FT8 extends that range.`]}
function renderVHF(){const el=$("vhfo");if(!el)return;
  el.innerHTML=[10,11,12].map(b=>{const [lv,t,a,pr]=vhfStatus(b);return `<div class="note lv-${lv}"><div class="lvh"><b><span style="color:${BC[b]}">●</span> ${BANDS[b]}: ${t}.</b><span class="lvp">${LVN[lv]}</span></div><span class="prac">${pr}</span><details class="why"><summary>Detail</summary><p>${a}</p></details></div>`}).join("")}
function easyVHF(){const r=[10,11,12].map(b=>{const [lv,t]=vhfStatus(b);return `<p><b style="color:${BC[b]}">${BANDS[b]}</b>: <span class="lv-${lv}" style="background:none;border:0;padding:0">${t}</span>.</p>`}).join("");
  return `<div class="ez"><div class="ezt">6 m, 2 m and 70 cm now</div>${r}</div>`}

/* ---------- concursos ---------- */
const SEGSSB=[[0,"1.810–2.000 (according to your license)","1.800–2.000","1.800–2.000","SSB between 1.840 and 1.900. The best times are the half hour before your sunrise, toward North America."],
 [1,"3.500–3.800","3.600–4.000","3.800–4.000","<b>Split required for half of the USA:</b> you cannot go above 3.800 and Generals cannot go below 3.800. Transmit on 3.7xx and say «listening 3.8xx». Extras (3.600+) and Canada (no segments by class) answer you simplex. Australia usually uses 3.776–3.800."],
 [2,"7.000–7.200","7.125–7.300","7.175–7.300","<b>Pseudo-split on 40 m:</b> the highest you can transmit is 7.200. For North America, call between 7.175 and 7.200 (Extras and Generals hear you) or lower saying «listening 7.2xx» and listen above 7.200. Between 7.125 and 7.175 only Extras answer you."],
 [3,"14.000–14.350","14.150–14.350","14.225–14.350","Call above 14.225: that way all U.S. license classes can answer. Below that only Extras and Advanced will call."],
 [5,"21.000–21.450","21.200–21.450","21.275–21.450","Call above 21.275 so Generals can call you too."],
 [7,"28.000–29.700","28.300–29.700","28.300–29.700","Between 28.300 and 28.500 U.S. Technicians can also answer you: more stations when 10 m opens to North America."]];
const SEGCW=[[0,"1.810–1.838","1.800–2.000","1.800–2.000","CW between 1.820 and 1.835. North America at your sunrise."],
 [1,"3.500–3.570","3.500–3.600","3.525–3.600","U.S. Generals start at 3.525: call above that so everyone can hear you."],
 [2,"7.000–7.040","7.000–7.125","7.025–7.125","Above 7.025 Generals can also answer you."],
 [3,"14.000–14.070","14.000–14.150","14.025–14.150","Above 14.025 Generals can also answer you."],
 [5,"21.000–21.070","21.000–21.200","21.025–21.200","Above 21.025 Generals can also answer you."],
 [7,"28.000–28.070","28.000–28.300","28.000–28.300","From 28.000 to 28.300 U.S. Technicians can also answer you."]];
const SEGDG=[[1,"3.580–3.600","3.500–3.600","3.525–3.600","IARU R1 plan: digital on 3.570–3.600. In RTTY contests activity goes down to 3.560."],
 [2,"7.040–7.050","7.000–7.125","7.025–7.125","IARU R1 plan: digital on 7.040–7.050 (7.053 automatic). In contests 7.080–7.100 is also used with North America."],
 [3,"14.070–14.099","14.000–14.150","14.025–14.150","Digital on 14.070–14.099. In RTTY contests activity goes up to 14.120."],
 [5,"21.070–21.110","21.000–21.200","21.025–21.200","Digital on 21.070–21.110 and in contests up to 21.150."],
 [7,"28.050–28.150","28.000–28.300","28.000–28.300","Digital on 28.050–28.150."]];
const SEG=()=>MOD()==="ssb"?SEGSSB:MOD()==="cw"?SEGCW:SEGDG;
const TRICKS={
 cqww:["QSOs with Spain give 0 points, but the first one on each band gives you the «Spain» multiplier.","The multipliers (zone and country) count per band: if you work a rare one on 15 m, ask them to move with you to 20 or 10 m.","If you use the cluster, enter as «Assisted».","You can operate the full 48 h: sleep during the hours with no useful opening.","Do not spot yourself on the cluster: it is forbidden."],
 wpx:["QSOs with Spain give 0 points, but their prefix does count.","40, 80 and 160 m score double: at night, stay on the low bands.","Each prefix counts only once in the whole contest: prioritize rate.","A special prefix granted by the administration makes everyone want to work you.","Single operator: maximum 36 of the 48 h, with breaks of at least 60 min (below you can see when to take them)."],
 arrl:["Only QSOs with the USA and Canada count: 3 points each.","Multipliers: 48 states, DC and Canadian provinces, per band. Alaska and Hawaii do not count.","Ask the rare states to change bands (Dakotas, Wyoming, Vermont, Nevada…) and western Canada.","Respect the U.S. segments (table below).","Their exchange is the state or province: an error voids the QSO."],
 iaru:["Same continent and another ITU zone: 3 points. Another continent: 5. Your ITU zone (37): 1.","The HQ stations (HQ) of each society and the IARU officials are multipliers on each band.","ITU zones count per band: move multipliers across bands.","It lasts 24 h: rate is king."],
 wae:["Only QSOs outside Europe count: 1 point each.","<b>QTC:</b> after a QSO, ask the station outside Europe to send you QTCs (summaries of their previous QSOs): each QTC received adds 1 point. Maximum 10 per station. It is the move that gives the most points in the WAE.","80 m multipliers count ×4 and 40 m ×3: a country on 80 m is worth twice as much as on 20 m.","Single operator: 36 of the 48 h, with breaks of at least 3 h."],
 cq160:["160 m only: everything is decided at night.","Same country 2 points, Europe 5, another continent 10: look for North America at your sunrise.","U.S. states and Canadian provinces are multipliers, in addition to countries.","Use the gray line window (profile of each destination) for North America and Asia."],
 arrl10:["10 m only: 2 points per phone QSO.","Multipliers: states, Canadian provinces, Mexican states, countries and ITU regions.","From 28.300 to 28.500 U.S. Technicians can also answer you.","The band opens at midday: sleep at night."]};
function contestPlan(){const c=CT(),rows=[],seq=[];for(let x=0;x<24;x++){let bb=-3,ba=-1;for(const b of BI()){let a=0;for(const t of TG().filter(inMode))a+=cval(t,b,prob(t,x,b).p);if(c.mk==="cqdx"||c.mk==="wae")a*=1+0.05*cmults(x,b).size;if(c.mk==="wae")a*=b===1?2:b===2?1.5:1;if(a>ba){ba=a;bb=b}}seq.push({b:ba<0.05?-3:bb,a:ba})}return seq}
const KRATE=.8;
function renderContest(){const on=st.mode==="contest";$("cnone").hidden=on;
  if(!on){$("cnone").innerHTML=`<h2>Contest mode</h2><p>Turn on contest mode to see the band plan, rate, breaks and tips for the contest you choose.</p><button class="btn" id="goC">Turn on contest mode</button>`;$("goC").onclick=()=>setMode("contest",true);}
  const n=new Date();const list=CKEYS().map(k=>({k,c:CONTESTS[k],d:nextDate(CONTESTS[k])})).sort((a,b)=>a.d-b.d);if(!list.length){$("ccal").innerHTML=`<p>There are no major DX contests for ${MD().s} on the platform. Choose phone, CW or RTTY in «Mode», above.</p>`;["cplan","cscore","cpause","tricks"].forEach(id=>{const e=$(id);if(e)e.innerHTML=""});return}
  $("ccal").innerHTML=`<table class="bt"><tr><th>Contest</th><th>Next edition</th><th>In</th></tr>${list.map(x=>`<tr class="${on&&x.k===$("contest").value?"on":""}"><td><b>${x.c.n}</b></td><td>${fdate(x.d)}</td><td>${Math.max(0,Math.ceil((x.d-n)/864e5))} days</td></tr>`).join("")}</table><p class="note">Dates according to each contest's rule (full weekend of the month). Check them in the rules before each edition.</p>`;
  if(!on){["cplan","cscore","cpause","tricks"].forEach(id=>$(id).innerHTML="");return}
  const c=CT(),seq=contestPlan();$("cplanh").textContent="Band plan · "+c.n+(useMonth()?" · propagation for "+MESES[c.month-1]:" · today's propagation");
  const rows=[];let prev=-9,start=0;for(let x=0;x<=24;x++){const b=x<24?seq[x].b:-9;if(b!==prev){if(prev!==-9)rows.push({b:prev,s:start,e:x});prev=b;start=x}}
  $("cplan").innerHTML=rows.map(r=>r.b===-3?`<div class="dx" style="cursor:default;opacity:.6"><span>No useful opening on ${hh(r.s)}:00 a ${hh(r.e)}:00</span><span class="pill c0">${r.e-r.s} h</span><span class="w">Rest or look for occasional QSOs</span></div>`:`<div class="dx" style="cursor:default"><span><span class="c" style="color:${BC[r.b]}">${BANDS[r.b]}</span> de ${hh(r.s)}:00 a ${hh(r.e)}:00</span><span class="pill" style="background:${BC[r.b]};color:#06101c">${r.e-r.s} h</span><span class="w">${(()=>{const mid=Math.min(23,Math.floor((r.s+r.e)/2));const zs=TG().filter(inMode).map(t=>({t,p:prob(t,mid,r.b).p})).filter(x=>x.p>=.3).sort((a,b)=>cval(b.t,r.b,b.p)-cval(a.t,r.b,a.p)).slice(0,3);return zs.length?"Toward: "+zs.map(x=>esc(x.t.name.split(" (")[0])+` (${x.t.az}° ${cab(x.t.az)})`).join(", "):"Little reachable activity"})()}</span></div>`).join("")+`<p class="note">Band that gives the most points in each time slot (local time), with the points of each QSO from EA, the multipliers (${c.mult}) and the typical activity of each destination (own estimate).</p>`;
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
  $("cscore").innerHTML=`<div class="kv"><div class="chip"><div class="k">Estimated QSOs</div><div class="v">${fk(qso)}</div><div class="t">${c.h} h${c.so?", operando "+c.so:""} con ${PWN()} and ${ANTL()}</div></div><div class="chip"><div class="k">Points per QSO</div><div class="v">${avgPts.toFixed(1)}</div><div class="t">average by where they will come from</div></div><div class="chip"><div class="k">Multipliers</div><div class="v">${fk(mults)}</div><div class="t">${c.mk==="wpx"?"prefixes ≈ 55 % of QSOs":BI().map(b=>BANDS[b]+" "+(mb[b]||0)).join(" · ")}</div></div><div class="chip"><div class="k">Score</div><div class="v">${fk(score)}</div><div class="t">order of magnitude${c.mk==="wae"?" (not counting QTCs)":""}</div></div></div>
   <div class="tl" style="margin-top:10px">${rate.map((r,i)=>`<button style="background:${seq[i].b<0?"#1a2433":BC[seq[i].b]};opacity:${offSet.has(i)?.25:1}" title="${hh(i)}:00 · ≈${Math.round(r)} QSO/h">${Math.round(r)}<span>${seq[i].b<0?"–":BANDS[seq[i].b].replace(/\s+m$/,"")}</span></button>`).join("")}</div><div class="tlh">${Array.from({length:24},(_,x)=>`<span>${hh(x)}</span>`).join("")}</div>
   <p class="note">estimated QSOs per hour (local time) calling and searching and pouncing, according to the probability of getting through and the typical activity of each destination. It is our own estimate to compare hours, bands, antennas and power levels, not a promise.</p>`;
  // pausas
  const blocks=[];let s0=-1;for(let x=0;x<=24;x++){const o=x<24&&offSet.has(x);if(o&&s0<0)s0=x;if(!o&&s0>=0){blocks.push([s0,x]);s0=-1}}
  const low=sorted.slice(0,5).map(x=>x.i).sort((a,b)=>a-b);
  $("cpause").innerHTML=c.so?`<p>${c.n}: as a single operator you can operate ${c.so} of the ${c.h} h. Take the ${offH} h of breaks (about ${offPerDay} each day) during the hours that give the least:</p><ul>${blocks.map(b=>`<li><b>${hh(b[0])}:00–${hh(b[1])}:00</b> (${b[1]-b[0]} h)</li>`).join("")}</ul><p class="note">Each break must last at least ${c.mk==="wae"?"3 h":"60 min"}. If a block comes out shorter, merge it with the next one.</p>`
   :`<p>${c.n} does not require breaks${c.h===24?" (it lasts 24 h)":""}. If you need to sleep, the hours that give the least are: <b>${low.map(x=>hh(x)+":00").join(", ")}</b>.</p>`;
  // trucos
  $("tricks").innerHTML=`<h2>Legal tips to score more · ${c.n}</h2><p class="note" style="margin:0 0 6px">${c.tip}</p><ul class="note" style="font-size:.95rem;margin:0 0 10px;padding-left:20px">${((TRICKS[$("contest").value]||TRICKS[CT().base])||[]).map(x=>`<li>${x}</li>`).join("")}</ul>
  <details class="why"><summary>The 18 beacons: probability on each band</summary><div class="scroll"><table class="hm" style="min-width:760px"><thead><tr><th class="rh">Band</th><th class="rh">You can transmit (EA)</th><th class="rh">U.S. Extra (${MD().s})</th><th class="rh">U.S. General (${MD().s})</th><th class="rh">The move</th></tr></thead><tbody>`+
  SEG().filter(([b])=>BI().includes(b)).map(([b,ea,ex,ge,j])=>`<tr><th class="rh"><span style="color:${BC[b]}">●</span> ${BANDS[b]}</th><td style="text-align:left">${ea}</td><td style="text-align:left">${ex}</td><td style="text-align:left">${ge}</td><td style="text-align:left;font-family:var(--f-b);font-size:.88rem;white-space:normal">${j}</td></tr>`).join("")+
  `</tbody></table></div><p class="note">Segments for ${MD().s} in the USA according to the FCC rules I know; Advanced fall between Extra and General. Canada has no segments by class. Check before the contest. Respect the ranges the IARU Region 1 plan keeps free of contests (3.650–3.700 and 14.300–14.350 kHz).</p>`}
/* ---------- sol y espacio ---------- */
function renderSpace(){const s=L.space||{};const lv3=(v,g,y,inv)=>v==null||isNaN(+v)?"":inv?(+v<g?"g":+v<y?"y":"r"):(+v>=g?"g":+v>=y?"y":"r");const xr=String(s.xray||"").trim().toUpperCase()[0];
  const it=[["SFI · solar flux",L.sfi,"the higher, the more the high bands open",lv3(L.sfi,110,90)],["Sunspots (SSN)",s.ssn,"number of sunspots",lv3(s.ssn,90,50)],["Kp now",L.kp,L.kpNote||"",lv3(L.kp,3,4.5,1)],["A index",s.a!=null&&s.a!==""&&!isNaN(+s.a)?Math.round(+s.a):s.a,"geomagnetic activity of the day; < 10 is quiet",lv3(s.a,10,20,1)],["Solar wind",L.wind!=null?L.wind+" km/s":null,"normal is 350–450",lv3(L.wind,450,550,1)],["Density",s.dens!=null?s.dens+" p/cm³":null,"higher density pushes the field harder",lv3(s.dens,10,20,1)],["Bz",L.bz!=null?L.bz+" nT":null,"negative = south: lets the solar wind in",L.bz==null?"":L.bz>=0?"g":L.bz>-5?"y":"r"],["Bt",L.bt!=null?L.bt+" nT":null,"strength of the wind's field",lv3(L.bt,10,20,1)],["X-rays (GOES)",s.xray,"current class: C or lower is no problem; M and X knock out the bands in daytime",!xr?"":"AB".includes(xr)?"g":xr==="C"?"y":"r"],["Protons",(s.proton!=null&&s.proton!==""&&!isNaN(+s.proton))?(L.radio&&L.radio.s1!=null&&L.radio.s1<20?"normal":s.proton+" (HamQSL)"):s.proton,"a proton storm (S1 or higher) closes the polar paths",!s.proton?"":(!isNaN(+s.proton)?(L.radio&&L.radio.s1!=null&&L.radio.s1<20?"g":""):/normal|sin|none|<|S0/i.test(s.proton)?"g":"r")],["Aurora",s.aurora,"","" ],["Flares",L.flare,"probability in 24 h",L.radio?(L.radio.r12<20?"g":L.radio.r12<40?"y":"r"):"y"]].filter(x=>x[1]!=null&&x[1]!=="");
  $("space").innerHTML=`<h2>Real values now</h2><p class="lvleg"><span class="lv-g">Favorable</span><span class="lv-y">Fair</span><span class="lv-r">Unfavorable</span> for DX.</p><div class="kv">${it.map(([k,v,t,l])=>`<div class="chip ${l||""} lvc-${l||"n"}"><div class="k">${k}</div><div class="v">${esc(v)}</div>${t?`<div class="t">${esc(t)}</div>`:""}</div>`).join("")}</div>`+
   (L.iono&&L.iono.fof2?`<p style="margin:10px 0 0"><b>Ionosonde ${esc(L.iono.station||"")}</b>: foF2 ${L.iono.fof2} MHz${L.iono.mufd?` · MUF(3000) ${L.iono.mufd} MHz`:""} at ${esc((L.iono.time||"").slice(11,16))} UTC. ${(()=>{const mt=Date.parse(L.iono.time);if(isNaN(mt))return "";const k=ionoK(parseInt(new Date(mt).toLocaleString("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:false}),10)%24);return k!==1?`It is running ${Math.abs(Math.round((k-1)*100))} % ${k>1?"above":"below"} the monthly average: the site already applies it to the nearby hours.`:"It matches the monthly average."})()}</p>`:`<p class="note" style="margin:10px 0 0">No recent ionosonde measurement near Spain. It will arrive with the next update.</p>`)+
   `<details class="srcd"><summary>Data from ${esc(L.updated)} · sources</summary><p class="note">${(L.sources||[]).map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join(" · ")}</p></details>`}
function renderSolar(){const F=L.kpfc;let h=`<h2>Geomagnetic and solar forecast</h2>`;
  if(F){const n=new Date(),nd=Math.round((Date.parse(n.toISOString().slice(0,10))-Date.parse(F.base))/864e5),nb=Math.floor(n.getUTCHours()/3);const all=F.blocks.flat(),cols=all.length;
    const col=k=>k>=5?"var(--bad)":k>=4?"var(--warn)":"var(--ok)";
    h+=`<p class="note" style="margin:0">Kp forecast every 3 hours (${esc(F.issued)}). Red = G1 storm or higher: noise rises, the MUF drops at high latitudes and QSB and echo appear.</p><div class="kpg" style="grid-template-columns:repeat(${cols},minmax(0,1fr))" role="img" aria-label="Kp forecast">`+
     all.map((k,i)=>{const d=Math.floor(i/8),b=i%8;const kf=Math.abs(k-Math.round(k))<.1?String(Math.round(k)):k-Math.floor(k)<.5?Math.floor(k)+"+":Math.ceil(k)+"−";return `<div class="${d===nd&&b===nb?"now":""}" style="height:${Math.max(6,k/9*100)}%;background:${col(k)}" title="${F.days[d]||""} ${hh(b*3)}–${hh(b*3+3)} UTC · Kp ${kf}"><span>${kf}</span></div>`}).join("")+
     `</div><div class="kpx" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${all.map((_,i)=>`<span>${hh((i%8)*3)}</span>`).join("")}</div><div class="kpd" style="grid-template-columns:repeat(${F.blocks.length},1fr)">${F.blocks.map((_,i)=>`<span>${esc(F.days[i]||"")} (UTC)</span>`).join("")}</div>`}
  h+=`<p class="lvleg"><span class="lv-g">Favorable</span><span class="lv-y">Fair</span><span class="lv-r">Unfavorable</span> for DX.</p><div class="sgrid sx">`+solarItems().map(([t,lv,a,b])=>`<div class="note lv-${lv}"><div class="lvh"><b>${t}.</b><span class="lvp">${LVN[lv]}</span></div>${b?(()=>{const m=String(b).match(/^([\s\S]*?[a-záéíóúñ0-9)»%][.!])\s+(?=[A-ZÁÉÍÓÚ¿¡])([\s\S]+)$/);const cap=x=>String(x).replace(/^(\s*(?:<[^>]+>\s*)*)([a-záéíóúñ])/,(q,a1,c)=>a1+c.toUpperCase());return `<span class="prac">${cap(m?m[1]:b)}</span><details class="tec"><summary>See more</summary>${m?`<p>${m[2]}</p>`:""}<p class="note">${a}</p></details>`})():a}</div>`).join("")+(L.solar||[]).map(([k,v])=>`<div class="note"><b>${esc(k)}.</b> ${esc(v)}</div>`).join("")+`</div>`;
  $("solar").innerHTML=h}
const LVN={g:"Favorable",y:"Fair",r:"Unfavorable",n:"Informational"};
function solarItems(){const F=L.kpfc,lh=st.mhour,fo=foF2est(lh),mo=(useMonth()||new Date().getUTCMonth()+1),ESM=[.05,.05,.08,.2,.55,.9,.85,.6,.2,.08,.05,.15][mo-1],kpn=kpAt(localNow());
  let nxt=[];if(F){const n=new Date(),d0=Math.round((Date.parse(n.toISOString().slice(0,10))-Date.parse(F.base))/864e5),b0=Math.floor(n.getUTCHours()/3);for(let i=0;i<8;i++){const d=d0+Math.floor((b0+i)/8),b=(b0+i)%8;if(F.blocks[d])nxt.push({k:F.blocks[d][b],ut:b*3})}}
  const kmax=nxt.length?Math.max(...nxt.map(x=>x.k)):L.kp,storm=nxt.filter(x=>x.k>=4.5),toLoc=ut=>hh((ut+todayOff())%24)+":00",it=[];
  it.push(["Kp index: next 24 hours",kmax<3?"g":kmax<4.5?"y":"r",`Kp measures from 0 to 9 how much the Earth's magnetic field is disturbed. At 5 or more there is a storm (G1+): the solar wind compresses the magnetosphere, the high-latitude ionosphere loses electrons and the MUF of paths passing near the pole drops. Maximum forecast: Kp ${Math.round(kmax)}${storm.length?" around "+storm.map(x=>toLoc(x.ut)).join(", ")+" (local time)":""}.`,
    storm.length?"during those hours North America, Japan, Alaska and Scandinavia will sound weak, with QSB and a «watery» echo on the voice. Africa, South America, the Caribbean and the Indian Ocean barely notice it: it is the time to look for DX to the south.":kmax<3?"quiet day, the best for polar paths: Japan and the U.S. West Coast on 20 and 15 m, Alaska and the North Pacific in the morning. At night the noise drops and 160 and 80 m give their best DX.":"northern paths may have QSB at times. If a North American station goes up and down, wait for it to come up before sending the report."]);
  if(L.bz!=null)it.push(["Bz: direction of the solar wind field",L.bz>=0?"g":L.bz>-5?"y":"r",`Bz is the north-south component of the magnetic field carried by the solar wind. Now ${L.bz} nT. When it is negative (south), it couples with the Earth's field and lets energy into the magnetosphere; positive (north), the Earth stays protected.`,
    L.bz<=-5?"if it stays south for an hour or two, Kp will rise. If you are working North America or Japan, do it now: it may close earlier than expected.":L.bz<0?"slightly south: watch whether it holds, because it can worsen the northern paths in a few hours.":"conditions should stay stable over the next few hours."]);
  if(L.wind!=null)it.push(["Solar wind",L.wind<450?"g":L.wind<550?"y":"r",`Speed of the plasma leaving the Sun: now ${L.wind} km/s (normal is 350–450). Above 500 km/s, usually from a coronal hole, it pushes the magnetosphere and Kp rises.`,
    L.wind>=500?"more noise and QSB on 40, 80 and 160 m, especially at night. Signals arrive with «flutter»: repeat your callsign calmly and wait for the signal peaks.":"no problem: on its own it does not spoil the bands."]);
  it.push(["Solar flux (SFI)",L.sfi>=110?"g":L.sfi>=90?"y":"r",`Solar radiation at 10.7 cm, which goes hand in hand with the ultraviolet radiation that creates the F layer. Now ${L.sfi} (SSN ${SSNV()}). More flux means more electrons in the F layer and a higher MUF.`,
    L.sfi>=150?"10 m open to almost the whole world in daytime, even with QRP. Look for long-haul DX on 10 and 12 m, which have less QRM than 20 m.":L.sfi>=110?"in daytime, 15, 12 and 10 m open to the south and west. Start with the highest band that is open: there are fewer people and the signal arrives with little absorption.":L.sfi>=90?"in daytime, 20 and 17 m are the reliable bands; 15 m only at times toward Africa and South America.":"in daytime the safe bet is 20 m; at night, 40 m is the DX band."]);
  if(L.radio)it.push(["Flares and radio blackouts (R)",L.radio.r12<20?"g":L.radio.r12<40?"y":"r",`A flare emits X-rays that suddenly ionize the D layer, the lowest one, over the whole sunlit side of the Earth. The D layer absorbs the signal before it reaches the F layer. Probability today: ${L.radio.r12} % for R1–R2 and ${L.radio.r3} % for R3.`,
    "if in daytime all the bands suddenly go quiet, starting with the low ones, it is a flare: it is not your equipment. The high bands (15–10 m) come back sooner. It lasts from 15 minutes to an hour, and a path that runs at night (for example, to the Pacific before dawn) keeps working."]);
  it.push(["Protons (S)",!L.radio||L.radio.s1<10?"g":L.radio.s1<25?"y":"r",`Very energetic particles from some flares that enter through the poles and ionize the polar D layer for days. Probability of S1 today: ${L.radio?L.radio.s1:"—"} %.`,
    "paths crossing the Arctic (Japan, Alaska, U.S. West Coast) close even if Kp is low. Look for those destinations via the long path or wait for it to pass."]);
  it.push(["After a storm",kmax>=5||L.kp>=5?"y":"g","After a storm, the F layer takes time to recover its electrons (negative phase) and the MUF stays lower. Just before it arrives, it sometimes rises (positive phase).",
    "the day after, the high bands open later and close earlier, with the MUF 10–30 % lower for one or two days. If before the storm you notice 10 m unusually open with Kp rising, make the most of it."]);
  it.push(["Sporadic E (Es)",ESM>=.5?"g":"n",`Clouds of very dense ionization in the E layer, at about 110 km, that reflect 10 and 12 m over 1,000–2,300 km. In ${MESES[mo-1]}, the average probability in Europe of some opening during the day is about ${Math.round(ESM*100)} % (climatology, not a forecast).`,
    ESM>=.5?"it is the season: if 10 m suddenly fills with Italian, German or English stations at full strength, it is Es. Watch 28.400–28.600 in mid-morning and at dusk; it sometimes links up with the F layer and gives long-haul DX.":"off season: if 10 m suddenly fills with stations at 1,000–2,000 km, it is Es and it usually does not last long."]);
  it.push(["Aurora",kpn>=6?"y":"g",`With strong storms, the auroral oval moves south and its ionization irregularly reflects 10 m and 6 m. Now Kp ${kpn}.`,
    kpn>=6?"northern European stations may be heard with a rough, whispering sound: point the antenna north, even if they are to the east or west.":"from Spain it takes Kp 6 or more to notice it; it does not count today."]);
  if(fo)it.push([`Ionosphere above you at ${hh(lh)}:00`,fo>=7?"g":fo>=5?"y":"r",`foF2 ≈ ${fo.toFixed(1)} MHz over France and northern Spain${ionoSrc()?" (corrected with "+(ionoSrc()==="ionosonda"?"the ionosonde":"the cluster")+")":""}: it is the highest frequency that comes back if you transmit straight up. Above it there is a skip zone. Skip zone: ${BI().filter(b=>b>=1).map(b=>`${BANDS[b]} ${skipTxt(b,lh).replace("skip zone up to ","")}`).join(" · ")}.`,
    "if on 40 m you cannot hear stations in your province but you can hear those in France, that is the skip zone. For nearby contacts use the lowest band without a skip zone."]);
  return it}

/* ---------- balizas ---------- */
function renderBcn(){if(st.page!=="balizas"&&!st.ly.bcn)return;const {slot,left}=bcnNow(),lh=localNow();
  const data=BCN.map((b,i)=>{const t=nearestT([b[2],b[3]],0);const az=Math.round(brgJS(TXP,[b[2],b[3]])),km=Math.round(distJS(TXP,[b[2],b[3]]));const heard=(L.beacons||[]).filter(x=>x.call===b[0]);
    const ps=BFQ.map(([f,bi],k)=>{const q=prob(t,lh,bi,false);return {on:(slot-k+18)%18===i,p:q.p,na:q.na}});return {b,i,az,km,heard,ps,best:Math.max(...ps.map(x=>x.na?0:x.p))}});
  const nowOn=BFQ.map(([f,bi],k)=>{const d=data[(slot-k+18)%18],q=d.ps[k];return `<div class="bnow"><span class="bf" style="color:${BC[bi]}">${f}</span><b>${CS(d.b[0])}</b><span class="note">${esc(d.b[1])}</span><span class="bp ${cls(q.p)}">${q.na?"—":Math.round(q.p*100)+" %"}</span></div>`}).join("");
  const nOpen=data.filter(d=>d.best>=.3).length;
  $("bcn").innerHTML=`<h2>NCDXF/IARU beacons</h2>
   <p class="bsum">Right now, on each band (change in <b>${left} s</b>):</p><div class="bnows">${nowOn}</div>
   <p class="bsum">Probability of hearing each beacon at ${hh(lh)}:00 · <b>${nOpen} of 18</b> with some band ≥30 %${(L.beacons||[]).length?` · ${L.beacons.length} heard in Europe today`:""}</p>
   <div class="scroll"><table class="bt btab"><tr><th>Beacon</th>${BFQ.map(([f,bi])=>`<th style="color:${BC[bi]}">${BANDS[bi]}</th>`).join("")}</tr>${data.map(d=>`<tr><td><b>${CS(d.b[0])}</b><div class="note">${esc(d.b[1])} · ${d.az}° ${cab(d.az)} · ${fk(d.km)} km${d.heard.length?` · <span class="agr ok">heard ${d.heard.map(x=>esc(x.f)+" "+esc(x.t)).join(", ")}</span>`:""}</div></td>${d.ps.map(q=>`<td class="bpc"><span class="bp ${cls(q.p)}${q.on?" bon":""}" title="${q.on?"Transmitting now on this band":""}">${q.na?"—":Math.round(q.p*100)}</span></td>`).join("")}</tr>`).join("")}</table></div>
   <p class="note">Figures in %: probability that the beacon reaches you at this time with the same model as your QSOs. White box: the beacon is transmitting on that band now. Each beacon transmits 10 s per band in a 3-minute cycle.</p>`;
  try{restoreWhy()}catch(e){}}
setInterval(()=>{if(document.hidden)return;if(st.page==="balizas")renderBcn();if(st.page==="mapa"&&st.ly.bcn&&st.mapOn)updBcnMarks()},5000);
/* ---------- fichas ---------- */
function head(hl){let h="<tr><th></th>";for(let x=0;x<24;x++)h+=`<th class="${x===hl?"now":""}">${hh(x)}</th>`;return h+"</tr>"}
function zoneTable(t,hl){let h=`<div class="scroll"><table class="hm"><thead>${head(hl)}</thead><tbody>`;
  const rows=lp=>{for(const b of BI().filter(b=>b<=10).slice().reverse()){h+=`<tr><th class="rh"><span style="color:${BC[b]}">●</span> ${BANDS[b]}</th>`;for(let x=0;x<24;x++){const r=prob(t,x,b,lp);h+=`<td class="${cls(r.p)} ${x===hl?"now":""}">${r.na?"—":pct(r.p)}</td>`}h+="</tr>"}};
  h+=`<tr><th class="rh" colspan="25" style="color:var(--accent)">Short path · bearing ${t.az}° ${cab(t.az)} · ${fk(t.km)} km</th></tr>`;rows(false);
  h+=`<tr><th class="rh">MUF (MHz)</th>`;for(let x=0;x<24;x++)h+=`<td style="color:var(--muted)">${Math.round(prob(t,x,3).muf)}</td>`;h+="</tr>";
  if(t.l&&!useMonth()){h+=`<tr><th class="rh" colspan="25" style="color:var(--accent)">Long path · bearing ${t.laz}° ${cab(t.laz)} · ${fk(t.lkm)} km</th></tr>`;rows(true)}
  return h+"</tbody></table></div>"}
function entOptions(sel){const g={NA:"North America and Caribbean",SA:"South America",AF:"Africa",AS:"Asia",OC:"Oceania",EU:"Europe"};return Object.entries(g).map(([c,n])=>`<optgroup label="${n}">${TG().filter(t=>t.cont===c).sort((a,b)=>a.name.localeCompare(b.name,"en")).map(x=>`<option value="${x.id}" ${x.id===sel?"selected":""}>${esc(x.name)}${entNeed(x)===true?" ★":""}</option>`).join("")}</optgroup>`).join("")}
function renderInfo(){const t=T(st.zone||"py")||TG()[0];
  $("info").innerHTML=`<h2>Destination profile <button class="btn" id="zmap" style="margin-left:8px;font-size:.8rem">View on the map</button></h2><label class="f" for="zsel" style="max-width:480px"><select id="zsel">${entOptions(t.id)}</select></label><h3 style="margin:8px 0 2px;font-size:1.3rem">${esc(t.name)} ${tags(t)}</h3>`+tBlock(t,st.mhour).replace(/<table>[\s\S]*<\/table>/,"")+zoneTable(t,st.mhour)+calBtns(t)+`<p class="note">Columns: local time. Orange box: selected hour.</p>`;
  $("zsel").onchange=e=>{st.zone=e.target.value;store.set("pz",st.zone);renderInfo();renderExplorer()};
  $("zmap").onclick=()=>{go("mapa");openPop({k:"t",id:t.id})};
  $("info").querySelectorAll("[data-obs]").forEach(b=>b.onclick=()=>addObs(b.dataset.t,+b.dataset.b,b.dataset.obs==="1"));
  $("info").querySelectorAll("[data-undo]").forEach(b=>b.onclick=()=>{const [t,bb,h]=b.dataset.undo.split("|");undoObs(t,+bb,+h)});
  $("info").querySelectorAll("[data-goz]").forEach(b=>b.hidden=true)}
const pathP=(t,x,b)=>{const a=prob(t,x,b,false).p;if(st.path==="sp")return a;const c=prob(t,x,b,true).p;return st.path==="lp"?c:Math.max(a,c)};
function renderView(){document.querySelectorAll('.tabs .tab').forEach(b=>b.setAttribute("aria-selected",b.dataset.v===st.view));
  const BIH=BI().filter(b=>b<=10);if(!BIH.includes(st.tband))st.tband=BIH[Math.min(4,BIH.length-1)];
  if(st.view==="band"){const b=st.tband;let h=`<div class="seg" style="margin-bottom:8px">${BIH.map(i=>`<button data-tb="${i}" aria-pressed="${i===b}"><i style="background:${BC[i]}"></i>${BANDS[i]}</button>`).join("")}</div><p class="note" style="margin:0 0 6px">${st.path==="sp"?"Short path":st.path==="lp"?"Long path":"The better of the two paths"} · the 60 most likely destinations are shown.</p>`;
    const list=TG().filter(inMode).map(t=>({t,ps:Array.from({length:24},(_,x)=>pathP(t,x,b))})).sort((a,c)=>Math.max(...c.ps)-Math.max(...a.ps)).slice(0,60);
    h+=`<div class="scroll"><table class="hm"><thead>${head(st.mhour)}</thead><tbody>`+list.map(r=>`<tr><th class="rh" title="${esc(r.t.name)} · short ${r.t.az}° ${cab(r.t.az)} · long ${r.t.laz}° ${cab(r.t.laz)}">${entNeed(r.t)===true||dxIn(r.t.id).length?"★ ":""}${esc(r.t.name)} <span style="color:var(--dim);font-family:var(--f-m);font-size:.75rem">${r.t.az}° ${cab(r.t.az)}/${r.t.laz}° ${cab(r.t.laz)}</span></th>`+r.ps.map((p,x)=>`<td class="${cls(p)} ${x===st.mhour?"now":""}">${pct(p)}</td>`).join("")+"</tr>").join("")+"</tbody></table></div>";
    $("view").innerHTML=h;document.querySelectorAll('[data-tb]').forEach(x=>x.onclick=()=>{st.tband=+x.dataset.tb;renderView()})}
  else{const lh=st.mhour;const rows=[];for(const t of TG().filter(inMode))for(const b of BIH)for(const lp of [false,true]){if(lp&&(!t.l||st.path==="sp"))continue;if(!lp&&st.path==="lp")continue;const r=prob(t,lh,b,lp);if(r.p>=.05)rows.push({t,b,lp,...r})}rows.sort((a,b)=>b.p-a.p);
    $("view").innerHTML=rows.length?`<div class="scroll"><table class="hm" style="min-width:620px"><thead><tr><th class="rh">Destination</th><th>Band</th><th>Path</th><th>%</th><th>MUF</th><th>Bearing</th><th>km</th><th>Hops</th></tr></thead><tbody>`+rows.slice(0,60).map(r=>{const hp=hopsAt(r.t,lh,r.b,r.lp);return `<tr><th class="rh">${esc(r.t.name)}${tags(r.t)}</th><td style="color:${BC[r.b]};font-weight:600">${BANDS[r.b]}</td><td>${r.lp?"largo":"short"}</td><td class="${cls(r.p)}">${Math.round(r.p*100)}</td><td>${r.muf.toFixed(1)}</td><td>${r.lp?r.t.laz:r.t.az}° ${cab(r.lp?r.t.laz:r.t.az)}</td><td>${fk(r.lp?r.t.lkm:r.t.km)}</td><td>${hp?hp.n+" × "+fk(hp.len)+" km · "+hp.ang+"°":"—"}</td></tr>`}).join("")+"</tbody></table></div>":`<div class="empty">Nothing above 5 % at ${hh(lh)}:00.</div>`}}

/* ---------- explorador de destinos ---------- */
const XS={q:"",cont:"",sort:"now",open:false,n:12};
const CONTL={EU:"Europe",AF:"Africa",AS:"Asia",NA:"North America",SA:"South America",OC:"Oceania"};
function xAt(t,x){return memo("xa"+t.id+"|"+x,()=>{let r={p:0,b:-1};for(const b of BI())for(const lp of [false,true]){if(lp&&!t.l)continue;const v=prob(t,x,b,lp).p;if(v>r.p)r={p:v,b,lp}}return r})}
function xDay(t){return memo("xd"+t.id,()=>Array.from({length:24},(_,x)=>{let r={p:0,b:-1};for(const b of BI())for(const lp of [false,true]){if(lp&&!t.l)continue;const v=prob(t,x,b,lp).p;if(v>r.p)r={p:v,b,lp}}return r}))}
function compass(az,laz){const a=(az-90)*D2R,l=(laz-90)*D2R;return `<svg class="cmp" viewBox="-20 -20 40 40" aria-hidden="true"><circle r="17" class="cmpc"/><text y="-11" class="cmpn">N</text><line x1="0" y1="0" x2="${(15*Math.cos(l)).toFixed(1)}" y2="${(15*Math.sin(l)).toFixed(1)}" class="cmpl"/><line x1="0" y1="0" x2="${(15*Math.cos(a)).toFixed(1)}" y2="${(15*Math.sin(a)).toFixed(1)}" class="cmps"/><circle r="2.2" class="cmpo"/></svg>`}
function renderPrevExplorer(){const el=$("explo");if(!el)return;const lh=st.mhour;
  const q=XS.q.trim().toLowerCase();let list=TG().filter(t=>(!XS.cont||t.cont===XS.cont)&&(!q||t.name.toLowerCase().includes(q)||String(t.id).toLowerCase()===q||(t.pfx&&String(t.pfx).toLowerCase().startsWith(q))));
  const full=r=>{if(!r.d){r.d=xDay(r.t);r.bestH=r.d.reduce((m,x,i)=>x.p>r.d[m].p?i:m,0)}return r};
  let rows=list.map(t=>({t,n:xAt(t,lh)}));if(XS.sort==="day")rows.forEach(full);
  if(XS.open)rows=rows.filter(r=>r.n.p>=.3);
  const S={now:(a,b)=>(st.mode==="dx"?(inMode(b.t)?1:0)-(inMode(a.t)?1:0):0)||b.n.p-a.n.p,day:(a,b)=>b.d[b.bestH].p-a.d[a.bestH].p,km:(a,b)=>a.t.km-b.t.km,name:(a,b)=>a.t.name.localeCompare(b.t.name,"en")}[XS.sort];rows.sort(S);
  const tot=rows.length;rows=rows.slice(0,XS.n).map(full);
  el.innerHTML=`<h2>Destination explorer</h2>
  <div class="xbar"><input id="xq" type="search" placeholder="Search a country or prefix: Japan, VK, Brazil…" value="${esc(XS.q)}" aria-label="Search destination" autocomplete="off">
   <select id="xsort" aria-label="Sort"><option value="now">Most likely now</option><option value="day">Best time of day</option><option value="km">Nearest</option><option value="name">By name</option></select>
   <label class="chk"><input type="checkbox" id="xopen" ${XS.open?"checked":""}> Only open now (≥30 %)</label></div>
  <div class="seg" style="margin:8px 0">${[["","All"],...Object.entries(CONTL)].map(([k,n])=>`<button data-xc="${k}" aria-pressed="${XS.cont===k}">${n}</button>`).join("")}</div>
  <p class="note" style="margin:0 0 8px">${tot} destination${tot===1?"":"s"} · ${hh(lh)}:00 local time · ${MD().s}. Tap one to see its profile.</p>
  <div class="xgrid">${rows.map(({t,d,n,bestH})=>`<button class="xcard${st.zone===t.id?" on":""}" data-xz="${esc(t.id)}">
    <span class="xh">${compass(t.az,t.laz)}<span class="xn"><b>${esc(t.name)}</b><span class="note">${CONTL[t.cont]||""} · ${t.az}° ${cab(t.az)} · ${fk(t.km)} km</span></span><span class="xp ${cls(n.p)}">${n.b>=0&&n.p>=.05?Math.round(n.p*100)+"%":"–"}</span></span>
    <span class="xb">${n.b>=0&&n.p>=.05?`<span style="color:${BC[n.b]}">● ${BANDS[n.b]}</span>${n.lp?" · long path":""}`:"Closed now"} · best at ${hh(bestH)}:00${d[bestH].b>=0?" on "+BANDS[d[bestH].b]:""}</span>
    <span class="xs">${d.map((x,i)=>`<i class="${cls(x.p)}${i===lh?" now":""}" title="${hh(i)}:00 · ${x.b>=0?BANDS[x.b]+" "+Math.round(x.p*100)+" %":"closed"}"></i>`).join("")}</span></button>`).join("")||`<div class="empty">No destination with those filters.</div>`}</div>
  ${tot>XS.n?`<p style="text-align:center;margin:10px 0 0"><button class="btn" id="xmore">See more (${tot-XS.n} more)</button></p>`:""}`;
  $("xsort").value=XS.sort;
  const qi=$("xq");qi.oninput=()=>{XS.q=qi.value;XS.n=12;const pos=qi.selectionStart;renderExplorer();const n2=$("xq");n2.focus();try{n2.setSelectionRange(pos,pos)}catch(e){}};
  $("xsort").onchange=e=>{XS.sort=e.target.value;renderExplorer()};$("xopen").onchange=e=>{XS.open=e.target.checked;renderExplorer()};
  el.querySelectorAll("[data-xc]").forEach(x=>x.onclick=()=>{XS.cont=x.dataset.xc;XS.n=12;renderExplorer()});
  if($("xmore"))$("xmore").onclick=()=>{XS.n+=24;renderExplorer()};
  el.querySelectorAll("[data-xz]").forEach(x=>x.onclick=()=>{st.zone=x.dataset.xz;store.set("pz",st.zone);selTab("fichas","f_info",true);renderInfo();const i=$("info");if(i)i.scrollIntoView({behavior:"smooth",block:"start"})})}

/* ===== Ciclo solar, cotejo de fuentes, contraste de bandas y ayudas de uso ===== */
const MESC=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CYC=(()=>{try{return JSON.parse(document.getElementById("cycdata").textContent)}catch(e){return null}})();
const cIdx=m=>{const [y,mo]=String(m).split("-").map(Number);return (y-2008)*12+mo-1};
const cLbl=i=>MESC[((i%12)+12)%12]+" "+(2008+Math.floor(i/12));
const n1=v=>v==null?"—":(Math.round(v*10)/10).toLocaleString("en-US");
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
  let s=`<svg viewBox="0 0 ${W} ${H}" class="cycsvg" role="img" aria-label="Sunspot number from 2008 to 2030: observed, smoothed and forecasts">`;
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
  s+=mk(cIdx("2014-04"),116.4,N?"Cycle 24":"Cycle 24 max · 116.4",-10)+mk(cIdx("2024-10"),160.9,N?"Cycle 25":"Cycle 25 max · 160.9",-10)+mk(cIdx("2008-12"),2.2,"Min. 2008",-8)+mk(cIdx("2019-12"),1.8,"Min. 2019",-8);
  s+=`<line x1="${x(now)}" x2="${x(now)}" y1="${t}" y2="${H-b}" class="cnow"/><text x="${x(now)+5}" y="${t+10}" class="cnt">TODAY</text>`;
  s+=`<rect x="${l}" y="${t}" width="${W-l-r}" height="${H-t-b}" fill="transparent" class="chit"/></svg>`;return s}
function cycTip(D,i){const p=[cLbl(i)];if(D.m[i]!=null)p.push("mensual "+n1(D.m[i]));if(D.ms[i]!=null)p.push("suavizado "+n1(D.ms[i]));else if(D.pb[i]!=null)p.push("BOM forecast "+n1(D.pb[i]));if(D.nb[i])p.push("NOAA forecast "+n1(D.nb[i][0])+" ("+n1(D.nb[i][2])+"–"+n1(D.nb[i][1])+")");return p.join(" · ")}
function bandsForSSN(v){if(v>=100)return "10 and 12 m open almost daily from sunrise to sunset, also toward North America and Asia. It is the best time for DX on the high bands.";
  if(v>=60)return "10 and 12 m open on many days at midday, especially in fall and spring and toward the south. 15 and 17 m are the most reliable in daytime and 20 m holds up during the day and a good part of the night.";
  if(v>=30)return "10 m opens mainly to the south and, in summer, by sporadic E. 15 and 17 m rule in daytime, and 40 and 80 m gain weight at night.";
  return "The high bands rarely open. 20 m is the daytime band, and 40, 80 and 160 m give their best DX at night thanks to low noise and little absorption."}
function renderCycle(){const el=$("cycle");if(!el)return;const CW=(el.clientWidth||800)<600?440:800;const D=cycData();if(!D){el.innerHTML="";return}
  const now=nowIdx(),iMax=cIdx("2024-10"),iMin=cIdx("2019-12"),sinceMax=now-iMax,sinceMin=now-iMin;
  const sm=D.ms[D.lastS],pct=Math.round(sm/160.9*100);const estNow=D.pb[now]!=null?D.pb[now]:D.ms[now];const nNow=D.nb[now]?D.nb[now][0]:null;
  const b12=D.pb[now+12],n12=D.nb[now+12]?D.nb[now+12][0]:null;const est=estNow!=null&&nNow!=null?(estNow+nNow)/2:(estNow??nNow??sm);
  const endI=cIdx("2030-12"),prog=Math.max(0,Math.min(100,Math.round(sinceMin/(endI-iMin)*100)));
  const fall=estNow!=null&&b12!=null?Math.round(estNow-b12):null;
  const ag=(a,b)=>a!=null&&b!=null?(Math.abs(a-b)<=Math.max(8,.12*Math.max(a,b))?`<span class="agr ok">coinciden</span>`:`<span class="agr dif">differ by ${n1(Math.abs(a-b))}</span>`):"";
  el.innerHTML=`<h2>Solar cycle 25: where we are</h2>
  <p class="cyclead"><b>Declining phase</b> · ${sinceMax} months after the maximum (Oct 2024, 160.9 sunspots). Next minimum around <b>2030–2031</b>.</p>
  <div class="cprog" role="img" aria-label="Cycle progress: ${prog} %"><div class="cpbar"><i style="width:${prog}%"></i><b style="left:${Math.round((iMax-iMin)/(endI-iMin)*100)}%" title="Maximum, Oct 2024"></b></div><div class="cplab"><span>Min. Dec 2019</span><span>Max. Oct 2024</span><span>Predicted min. ≈ 2030–31</span></div></div>
  <div class="kv cykv">
   <div class="chip"><div class="k">Latest official smoothed</div><div class="v">${n1(sm)}</div><div class="t">${cLbl(D.lastS)} · ${pct} % of the maximum</div></div>
   <div class="chip"><div class="k">Last complete month</div><div class="v">${n1(D.m[D.lastM])}</div><div class="t">${cLbl(D.lastM)}</div></div>
   <div class="chip"><div class="k">Estimated for this month</div><div class="v">${n1(est)}</div><div class="t">BOM ${n1(estNow)} · NOAA ${n1(nNow)} ${ag(estNow,nNow)}</div></div>
   <div class="chip"><div class="k">In 12 months</div><div class="v">${n1(b12!=null&&n12!=null?(b12+n12)/2:(b12??n12))}</div><div class="t">BOM ${n1(b12)} · NOAA ${n1(n12)} ${ag(b12,n12)}${fall!=null?` · drops about ${fall} sunspots in a year`:""}</div></div>
  </div>
  <div class="cychart">${cycChart(D,CW)}<p class="cytip note" id="cytip">Tap the chart to see each month.</p>
  <p class="cyleg"><span class="lg lb">Monthly mean</span><span class="lg ls">Smoothed mean (13 months)</span><span class="lg lpb">BOM forecast (Australia)</span><span class="lg lpn">NOAA forecast (USA) and its margin</span></p></div>
  <h3 class="cyh">What it means for your bands</h3><p>With about ${Math.round(est)} sunspots: ${bandsForSSN(est)} What rules each day is the solar flux (SFI) and the Kp above: a day with high SFI opens more than the cycle average.</p>
  <details class="mdet"><summary>How it compares with other cycles</summary><div class="cycmp">${CYC.cyc.map(([n,mi,mv,ma,mx])=>{const rise=cIdx(ma)-cIdx(mi);return `<div class="ccr${n===25?" on":""}"><span>Cycle ${n}</span><i style="width:${Math.round(mx/285*100)}%"></i><b>${n1(mx)}</b><em>${MESC[+ma.slice(5)-1]} ${ma.slice(0,4)} · rise ${Math.floor(rise/12)} years and ${rise%12} months</em></div>`}).join("")}</div><p class="note">Cycle 25 has surpassed cycle 24 (116.4) and the official 2019 forecast, which expected between 105 and 125. Even so, it remains below cycles 19, 21, 22 and 23.</p></details>
  <p class="note csrc">Sunspots: <b>SILSO</b> (Royal Observatory of Belgium), which sets the maximum at 160.9 in October 2024. It agrees with the <b>BOM Space Weather Services</b> of Australia. Forecasts: BOM (${esc((CYC.issued||"").split("·")[0].replace("BOM SWS","").trim())}) and <b>NOAA SWPC</b>. When the two differ, the large figure is the average of both.</p>`;
  foldAfter(el,5,"What it means for your bands, comparison and sources");
  const svg=el.querySelector(".cycsvg"),tip=$("cytip");const mv=ev=>{const r=svg.getBoundingClientRect();const pt=(ev.touches?ev.touches[0]:ev);const fx=(pt.clientX-r.left)/r.width*CW;const i=Math.round((fx-38)/(CW-50)*cIdx("2031-01"));if(i>=0&&i<=cIdx("2031-01"))tip.textContent=cycTip(D,i)};
  svg.addEventListener("pointermove",mv);svg.addEventListener("touchstart",mv,{passive:true})}

/* ---------- cotejo: el mismo dato en varias fuentes ---------- */
const COTN={sfi:["Solar flux (SFI)","",6],kp:["Kp now","",1],a:["A index","",5],ssn:["Sunspots (Today's SSN)","",20],wind:["Solar wind","km/s",60],bz:["Bz","nT",2.5],dens:["Wind density","p/cm³",3],xray:["X-rays","",0],fof2:["foF2 over Spain","MHz",.8],muf:["MUF(3000) over Spain","MHz",2.5],essn:["effective SSN","",15]};
const med=a=>{const s=a.slice().sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2};
function cotejoRows(){const C=L.cotejo&&L.cotejo.vals;if(!C)return [];return Object.entries(C).filter(([k,v])=>COTN[k]&&Array.isArray(v)&&v.length).map(([k,src])=>{const [n,u,tol]=COTN[k];
  const nums=src.map(x=>+x[1]).filter(v=>isFinite(v));let used,ok,txt;
  if(k==="xray"||!nums.length){const vals=src.map(x=>String(x[1]).toUpperCase().trim());const cnt={};vals.forEach(v=>cnt[v[0]||v]=(cnt[v[0]||v]||0)+1);const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];used=vals.find(v=>(v[0]||v)===top[0]);ok=top[1]===vals.length;txt=ok?"misma clase":"the most frequent class is used"}
  else{used=med(nums);const sp=Math.max(...nums)-Math.min(...nums);ok=sp<=tol;txt=nums.length<2?"a single source":ok?"coinciden":`differ by ${n1(sp)}${u?" "+u:""}; the central value is used`;used=Math.round(used*10)/10}
  return {k,n,u,src,used,ok:nums.length<2&&k!=="xray"?null:ok,txt}})}
function cotejoBadge(k){const r=cotejoRows().find(x=>x.k===k);if(!r||r.src.length<2)return "";return ` <span class="agr ${r.ok?"ok":"dif"}" title="${esc(r.src.map(s=>s[0]+": "+s[1]).join(" · "))}">${r.src.length} sources${r.ok?"":" ≠"}</span>`}
function renderCotejo(){const el=$("cotejo");if(!el)return;const R=cotejoRows();
  if(!R.length){el.innerHTML=`<p class="note">Each value is compared across several public websites on every update. As soon as the first round arrives you will see each value here with its sources.</p>`;return}
  const nOk=R.filter(r=>r.ok).length,nC=R.filter(r=>r.ok!=null).length;
  {const sm=$("cotejos");if(sm)sm.textContent=`${nOk} de ${nC} coinciden`}spaceBadges(R);
  el.innerHTML=`<p class="note" style="margin-top:0">Each value is read from several independent websites and the value they agree on is used (the central value or the most repeated one). <b>${nOk} de ${nC}</b> values agree across sources${L.cotejo.at?` · revisado ${esc(String(L.cotejo.at).slice(11,16))} UTC`:""}.</p>
  <div class="scroll"><table class="bt cotab"><tr><th>Value</th><th>Value used</th><th>Sources</th><th>Result</th></tr>${R.map(r=>`<tr><td>${r.n}</td><td><b>${esc(String(r.used))}</b>${r.u?" "+r.u:""}</td><td class="note">${r.src.map(s=>`${esc(s[0])}: <b>${esc(String(s[1]))}</b>`).join(" · ")}</td><td><span class="agr ${r.ok==null?"":r.ok?"ok":"dif"}">${r.txt}</span></td></tr>`).join("")}</table></div>`}

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
    return {b,mx,m,h,sp,c,wn,w,v,txt:v==="ok"?(vs.every(x=>x===2)?"Open":"Weak"):v==="cl"?"Closed":c===2&&m===0?"Better than expected":m>=1&&c===0?"Open, no spots":"Uncertain"}});
  const W=["closed","weak","open"],WC=["cl","mx","ok"];
  {const op=rows.filter(r=>r.v==="ok"),all=op.filter(r=>[r.m,r.h,r.c].every(x=>x==null||x===2));const lst=x=>x.map(r=>BANDS[r.b].replace(/\s+m$/,"")).join(", ")+" m";
   setSum("contra",op.length?`Open: ${lst(op)}`+(all.length?` · all sources agree on ${lst(all)}`:""):"No band open according to the sources")}
  el.innerHTML=`<h2>Your bands now</h2>
  <div class="scroll"><table class="bt cotab ctab"><tr><th>Band</th><th>Platform</th><th>HamQSL</th><th>Spots 1 h</th><th>WSPR 1 h</th><th>Conclusion</th></tr>${rows.map(r=>`<tr><td style="color:${BC[r.b]};font-weight:700">${BANDS[r.b]}</td><td data-l="Platform"><span class="dot ${WC[r.m]}"></span><span class="ww">${W[r.m]} </span><span style="white-space:nowrap">${Math.round(r.mx*100)} %</span></td><td data-l="HamQSL">${r.h==null?'<span class="note">no data</span>':`<span class="dot ${WC[r.h]}"></span><span class="ww">${W[r.h]}</span>`}</td><td data-l="Clusters"><span class="dot ${WC[r.c]}"></span>${r.sp}<span class="ww"> spot${r.sp===1?"":"s"}</span></td><td data-l="WSPR">${r.w==null?'<span class="note">—</span>':`<span class="dot ${WC[r.w]}"></span>${r.wn}`}</td><td><span class="agr ${r.v==="ok"?"ok":r.v==="cl"?"":"dif"}">${r.txt}</span></td></tr>`).join("")}</table></div>
  <details class="why"><summary>See why</summary><p>Three independent opinions at ${hh(lh)}:00: this platform's prediction for your station, that of <b>HamQSL</b> (N0NBH, ${day?"daytime":"nighttime"}), what is heard on the clusters in the last hour and the WSPR signals over 2,500 km received in Europe (wspr.live).</p><p class="note">If the cluster hears a band the model gives as closed, the ionosphere is better than the monthly average and the platform raises the MUF for the next hours. HamQSL gives a general forecast by band groups, not for your antenna.</p></details>`}

/* ---------- ayudas para empezar ---------- */
const PGHELP={facil:"The essentials at a glance: which band to use now, when it will be better and where to point.",ahora:"Your bands right now, what to do and whether the sources agree.",mapa:"Where your signal reaches: choose what to show (2), the mode (3), the bands (4) and the time (5).",dx:"What is being heard right now on the world's clusters, with what's new highlighted.",concursos:"Hour-by-hour band plan for the next contest. Turn on «Contest mode» above.",sol:"The Sun today, how it affects radio and where we are in the solar cycle.",balizas:"The NCDXF beacons: if you hear one, the path to that place is open.",fichas:"Search a country and see its probability hour by hour and band by band.",metodo:"How everything is calculated and where the data comes from."};
function renderPgHelp(){}
function initStart(){const e=$("start");if(!e)return;if(store.get("startOk")==="1"){e.hidden=true;return}e.hidden=false;
  e.innerHTML=`<div class="stt"><b>Get started in 3 steps</b><button class="lnk" id="stx">Got it, don't show again</button></div><ol class="stl">
   <li><b>Your station:</b> press «Change» above and enter your locator, mode, power and antenna. Everything is recalculated for you.</li>
   <li><b>See the result:</b> <button class="lnk" data-go="ahora">Now</button> tells you which band to use and where to point; <button class="lnk" data-go="dx">DX</button>, who is on the air.</li><li><b>Optional, your log:</b> press «Upload log» above and choose your QRZ ADIF. The site will mark the entities and bands you need.</li></ol>`;
  $("stx").onclick=()=>{store.set("startOk","1");e.hidden=true};e.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go))}

/* ---------- cabecera en una línea ---------- */
function renderSum(){const e=$("ssum");if(!e)return;const loc=String($("loc").value||"").slice(0,6);const h=HB();
  e.innerHTML=`<b>${esc(loc)}</b> · ${esc(MD().s)} · ${h!=null?esc(BANDS[h]):"All bands"} · ${esc(PWN().split(" ")[0]+" "+PWN().split(" ")[1])} · ${esc(ANTL())}${st.mode==="contest"?" · <b>Contests</b>":""}`}
{const b=$("stbtn"),p=$("stpanel");if(b&&p)b.onclick=()=>{p.hidden=!p.hidden;b.setAttribute("aria-expanded",String(!p.hidden));b.textContent=p.hidden?"Change":"Close";if(!p.hidden)p.scrollIntoView({block:"nearest"})}}
/* ---------- solo la conclusión: el resto, plegado ---------- */
function foldAfter(el,keep,label){if(!el||el.querySelector(":scope > details.why"))return;const kids=[...el.children].slice(keep);if(!kids.length)return;const d=document.createElement("details");d.className="why";d.innerHTML=`<summary>${label||"See why"}</summary>`;kids.forEach(k=>d.appendChild(k));el.appendChild(d)}

const SPK2={"SFI · solar flux":"sfi","Sunspots (SSN)":"ssn","Kp now":"kp","A index":"a","Solar wind":"wind","Bz":"bz","X-rays (GOES)":"xray"};
function spaceBadges(R){const sp=$("space");if(!sp)return;sp.querySelectorAll(".chip .k").forEach(k=>{const key=SPK2[k.textContent.trim()]||SPK2[Object.keys(SPK2).find(x=>x.toUpperCase()===k.textContent.trim().toUpperCase())];if(!key||k.querySelector(".agr"))return;const r=R.find(x=>x.k===key);if(r&&r.src.length>1)k.insertAdjacentHTML("beforeend",` <span class="agr ${r.ok?"ok":"dif"}" title="${esc(r.src.map(s=>s[0]+": "+s[1]).join(" · "))}">${r.src.length} sources</span>`)})}

function spaceExplain(){const sp=$("space");if(!sp||sp.querySelector(":scope > details.why.spx"))return;const it=[...sp.querySelectorAll(".chip")].map(c=>{const k=c.querySelector(".k"),t=c.querySelector(".t");return k&&t?`<p><b>${esc(k.firstChild?k.firstChild.textContent.trim():"")}:</b> ${t.innerHTML}</p>`:""}).join("");
  const kv=sp.querySelector(".kv");if(!kv||!it)return;kv.insertAdjacentHTML("afterend",`<details class="why spx"><summary>What each value means</summary>${it}</details>`)}

/* listas largas: se ven las primeras y un botón para el resto */
const LLOPEN=new Set();
function limitList(el,n,what){if(!el)return;const it=[...el.children].filter(c=>!c.classList.contains("llmore"));if(it.length<=n+2||LLOPEN.has(el.id))return;
  it.slice(n).forEach(c=>c.hidden=true);const b=document.createElement("button");b.className="btn llmore";b.textContent=`View ${it.length-n} ${what} more`;b.onclick=()=>{LLOPEN.add(el.id);it.forEach(c=>c.hidden=false);b.remove()};el.appendChild(b)}

/* ---------- desplegables con su conclusión en el título ---------- */
const firstSent=(el,max=110)=>{if(!el)return "";const c=el.cloneNode(true);c.querySelectorAll("h2,details,button,.note.src").forEach(x=>x.remove());let t=(c.textContent||"").replace(/\s+/g," ").trim();const m=t.match(/^.*?[a-záéíóúñ0-9)%»][.!](?=\s|$)/);t=m?m[0]:t;return t.length>max?t.slice(0,max-1).replace(/\s\S*$/,"")+"…":t};
function setSum(id,txt){const e=$("s_"+id);if(e&&e.textContent!==txt)e.textContent=txt}
function foldSums(){try{const pg=st.page,now=localNow();
  if(pg==="ahora"){tidyRec();const hs=[];for(let x=now+1;x<now+13;x++)hs.push(x%24);
    if(hs.every(ezDone)){let best=null;for(const h of hs){const e=easyAt(h);if(e&&(!best||e.sc>best.e.sc))best={h,e}}
      setSum("tl","")}else{clearTimeout(foldSums.t);foldSums.t=setTimeout(foldSums,500)}
    setSum("rec","");
    setSum("vhf",[10,11,12].map(b=>{const [lv,t]=vhfStatus(b);return BANDS[b]+": "+String(t).replace(/\.$/,"")}).join(" · "));
    const s=sunEvents(TXP);setSum("qth",`Sun ${hm(s.rise)}–${hm(s.set)}`+(L.iono&&L.iono.mufd?` · MUF ${L.iono.mufd} MHz`:"")+(L.essn!=null?` · effective SSN ${Math.round(L.essn)}`:""))}
  if(pg==="mapa"){const ly=!st.mapOn?[]:[st.ly.voa&&"Prediction",st.ly.spots&&"Cluster",st.ly.bcn&&"Beacons",st.ly.dxp&&"DXpeditions"].filter(Boolean);const mb=(typeof MBS==="function"&&MBS())||[];
    const ms=$("mapsum");if(ms)ms.textContent=`${ly.length?ly.join(", "):"Nothing selected"} · ${CMSTXT()} · ${mb.length&&mb.length<BI0().length?mb.map(x=>BANDS[x]).join(", "):"all bands"} · ${hh(st.mhour)}:00`}
  if(pg==="dx"){{const it=((L.alert&&L.alert.items)||[]).filter(x=>!window.ACRACB_alOK||ACRACB_alOK(x));setSum("al",it.length?`${it.length} alert${it.length===1?"":"s"}: ${it.slice(0,2).map(x=>x.call+" "+(BANDS[x.band]||"")).join(", ")}`:"No alerts now")}const nr=SPOTS().filter(s=>spotKind(s)==="near").length;setSum("near",nr?`${nr} spot${nr===1?"":"s"} from EA, CT and surroundings on ${CMSTXT()}`:"No nearby spots now");
    const ds=(L.dx||[]).filter(dxNew).map(d=>{const t=tFor(d);return t?{d,...bestAny(t,now)}:null}).filter(Boolean).sort((a,b)=>b.p-a.p);
    setSum("dxp",ds.length?`${ds.length} active · best now: ${ds[0].d.call} on ${BANDS[ds[0].b]} (${Math.round(ds[0].p*100)} %)`:"None active now")}
  if(pg==="sol"){setSum("space","");setSum("cycle","");const F=L.kpfc;let mx=null;if(F){const all=F.blocks.flat();const nd=Math.round((Date.parse(new Date().toISOString().slice(0,10))-Date.parse(F.base))/864e5),nb=Math.floor(new Date().getUTCHours()/3);const i0=nd*8+nb;const nx=all.slice(Math.max(0,i0),i0+8);if(nx.length)mx=Math.max(...nx)}
    let bad=0;try{bad=solarItems().filter(x=>x[1]==="r").length}catch(e){}
    setSum("solar",(mx!=null?`Max Kp in 24 h: ${String(Math.round(mx*10)/10)}${mx>=5?" (storm)":""}`:"")+(bad?` · ${bad} unfavorable alert${bad===1?"":"s"}`:" · no serious alerts"))}
  if(pg==="concursos"){{const cp=$("c_plan");if(cp)cp.hidden=st.mode!=="contest"}["cscore","cpause","tricks"].forEach(id=>{const el=$(id),f=$("f_"+id);if(f)f.hidden=!(el&&el.textContent.trim());const ch=el?[...el.querySelectorAll(".chip")].slice(0,3):[];setSum(id,ch.length?ch.map(c=>{const k=c.querySelector(".k"),v=c.querySelector(".v");return (k?k.textContent.trim():"")+": "+(v?v.textContent.trim():"")}).join(" · "):firstSent(el))});
    try{const l=CAL.map(c=>({c,d:calNext(c)})).filter(x=>x.d).sort((a,b)=>a.d.st-b.d.st);if(l.length){const x=l[0],dd=Math.ceil((x.d.st-new Date())/864e5);setSum("ccal",`${l.length} contests in the next 12 months · next: ${x.c[0]}, ${dd<=0?"in progress":"in "+dd+" days"}`)}}catch(e){}}
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
  let h=`<div class="cph"><div><div class="cpc">${esc(call)}</div><div class="cpe">${u?`<img class="fl" src="${u}" alt="" width="24" height="16"> `:""}${esc(e?e.name:"Unknown entity")}${t?` · ${esc(CONTN[t.cont]||t.cont)} · CQ zone ${t.cq}`:""}${e?` · DXCC ${e.dxcc}`:""}</div>
    <div class="cpb">${dxp?'<span class="agr ok">Active DXpedition</span>':""}${dxp&&dxp.mw?`<span class="agr dif">Club Log Most Wanted # ${esc(dxp.mw)}</span>`:""}${t&&t.rare?'<span class="agr dif">Rare entity</span>':""}${need===true?'<span class="agr dif">Needed</span>':need===false?'<span class="agr">Already confirmed</span>':""}${sp.some(s=>s.ns>1)?`<span class="agr ok">en ${Math.max(...sp.map(s=>s.ns||1))} clusters</span>`:""}</div></div>
    <button class="btn cpx" id="cpx" aria-label="Close">Close</button></div>`;
  /* en el aire */
  h+=`<h3>On the air now</h3>`+(sp.length?sp.map(s=>{const a=spotAge(s);const ev=spotEval(s,lh);return `<div class="cps"><b style="color:${BC[s.band]}">${esc(s.f)} MHz</b> · ${BANDS[s.band]} · ${window.ACRACB_mb?ACRACB_mb(s.mode||String(spotMode(s)).toUpperCase()):esc(String(spotMode(s)).toUpperCase())} · ${esc(s.t)} UTC${a!=null?` (${ageTxt(a)})`:""}${s.nw?' <span class="nwb">NEW</span>':""}<div class="note">Heard by ${CSL(s.by)}${s.c?` · ${esc(s.c)}`:""}</div>${ev?`<div class="note">It reaches you with a <b>${Math.round(Math.max(ev.pSP,ev.t.l?ev.pLP:0)*100)} %</b> probability${ev.t.l&&ev.pLP>ev.pSP?" via the long path":""}.</div>`:""}</div>`}).join(""):`<p class="note">Not on the clusters in the last hour${L.spotsChecked?` (checked at ${esc(String(L.spotsChecked).slice(11,16))} UTC)`:""}.</p>`);
  /* DXpedición */
  if(dxp)h+=`<h3>DXpedition</h3><p>${esc(dxp.info||"")}</p><div class="cpg">${[["Until",dxp.until],["Modes",dxp.modes],["Listen (QSX)",dxp.qsx],["Pilot",dxp.pilot],["QSL",dxp.qsl]].filter(x=>x[1]).map(([k,v])=>`<div><span class="note">${k}</span><b>${esc(String(v))}</b></div>`).join("")}</div>${dxp.web?`<p><a href="${esc(dxp.web)}" target="_blank" rel="noopener">Expedition website</a></p>`:""}`;
  /* camino */
  if(p){const se=sunEvents(p),gw=greyWindows(TXP,p);const off=Math.round(p[0]/15);const there=new Date(Date.now()+off*3600e3);
    h+=`<h3>How to reach it from ${esc(String($("loc").value).slice(0,6))}</h3><div class="cpg">
      <div><span class="note">Short path</span><b>${az}° ${cab(az)} · ${fk(km)} km</b></div><div><span class="note">Long path</span><b>${laz}° ${cab(laz)} · ${fk(lkm)} km</b></div>
      <div><span class="note">Time there (aprox.)</span><b>${hh(there.getUTCHours())}:${String(there.getUTCMinutes()).padStart(2,"0")}</b></div>
      <div><span class="note">Sun there (your time)</span><b>${se.rise!=null?hm(se.rise)+"–"+hm(se.set):esc(se.polar||"—")}</b></div></div>
      <p>${t?aimTxt(az,false,sp[0]?sp[0].band:3):""}</p>${gw.length?`<p class="note"><b>Common gray line</b> (both ends with the sun near the horizon, your time): ${gw.map(([a,b])=>hm(a)+"–"+hm(b)).join(", ")}. Good time for 40, 80 and 160 m.</p>`:""}`}
  /* propagación por banda */
  if(t){const rows=BI().map(b=>{const a=prob(t,lh,b,false),c=t.l?prob(t,lh,b,true):{p:0};let best={p:0,h:0};for(let x=0;x<24;x++){const q=Math.max(prob(t,x,b,false).p,t.l?prob(t,x,b,true).p:0);if(q>best.p)best={p:q,h:x}}return {b,a,c,best}});
    const mu=rows.map(r=>r.a.muf).find(x=>x&&isFinite(x));h+=`<h3>Your bands toward there</h3>${mu?`<p class="note">Path MUF now: <b>${mu.toFixed(1)} MHz</b>: above that frequency the signal does not come back to Earth.</p>`:""}<div class="scroll"><table class="bt cotab"><tr><th>Band</th><th>Now (${hh(lh)}:00)</th><th>Best time today</th></tr>${rows.map(r=>`<tr><td style="color:${BC[r.b]};font-weight:700">${BANDS[r.b]}</td><td>${r.a.na||!isFinite(Math.max(r.a.p,r.c.p))?"—":`<span class="${cls(Math.max(r.a.p,r.c.p))}" style="padding:1px 6px;border-radius:4px">${Math.round(Math.max(r.a.p,r.c.p)*100)} %</span>${r.c.p>r.a.p?" long":""}`}</td><td>${r.a.na||!isFinite(r.best.p)?"—":r.best.p>=.05?`${hh(r.best.h)}:00 · ${Math.round(r.best.p*100)} %`:"closed all day"}</td></tr>`).join("")}</table></div><p class="note">Calculated for your station (${esc(PWN())}, ${esc(ANTL())}) on ${esc(MD().s)}.</p>`}
  /* enlaces */
  const bc=encodeURIComponent(baseCall(call)),fc=encodeURIComponent(call);
  h+=`<h3>More information</h3><div class="cpl"><a class="btn" href="https://www.qrz.com/db/${bc}" target="_blank" rel="noopener">QRZ.com</a><a class="btn" href="https://www.hamqth.com/${bc}" target="_blank" rel="noopener">HamQTH</a><a class="btn" href="https://www.reversebeacon.net/main.php?spotted_call=${fc}" target="_blank" rel="noopener">Reverse Beacon</a><a class="btn" href="https://pskreporter.info/pskmap.html?preset&callsign=${fc}" target="_blank" rel="noopener">PSK Reporter</a>${t?`<button class="btn" id="cpmap">View on the map</button>`:""}</div>`;
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
const CAL=[["ARRL RTTY Roundup","RTTY",1,1,"18:00 Sat – 23:59 Sun"],["CQ WW 160 m CW","CW",1,-1,"22:00 vie – 22:00 dom",1,"cq160cw"],["UBA DX SSB","SSB",1,-1,"13:00 Sat – 13:00 Sun"],["REF CW","CW",1,-1,"06:00 Sat – 18:00 Sun"],
 ["CQ WPX RTTY","RTTY",2,2,"00:00 Sat – 24:00 Sun",0,"wpxrtty"],["PACC (Netherlands)","CW/SSB",2,2,"12:00 Sat – 12:00 Sun"],["ARRL International DX CW","CW",2,3,"00:00 Sat – 24:00 Sun",0,"arrlcw"],["CQ WW 160 m SSB","SSB",2,-1,"22:00 vie – 21:59 dom",1,"cq160"],["UBA DX CW","CW",2,-1,"13:00 Sat – 13:00 Sun"],["REF SSB","SSB",2,-1,"06:00 Sat – 18:00 Sun"],
 ["ARRL International DX SSB","SSB",3,1,"00:00 Sat – 24:00 Sun",0,"arrl"],["EA PSK63","PSK63",3,2,"16:00 Sat – 16:00 Sun",0,0,1],["Russian DX","CW/SSB",3,3,"12:00 Sat – 12:00 Sun"],["CQ WPX SSB","SSB",3,-1,"00:00 Sat – 24:00 Sun",0,"wpx"],
 ["EA RTTY","RTTY",4,1,"12:00 Sat – 11:59 Sun",0,0,1],["SP DX","CW/SSB",4,1,"15:00 Sat – 15:00 Sun"],["JIDX CW","CW",4,2,"07:00 Sat – 13:00 Sun"],["OK/OM DX SSB","SSB",4,2,"12:00 Sat – 11:59 Sun"],["CQMM DX","CW/SSB",4,3,"09:00 Sat – 23:59 Sun"],["SP DX RTTY","RTTY",4,-1,"12:00 Sat – 12:00 Sun"],["Helvetia","CW/SSB",4,-1,"13:00 Sat – 12:59 Sun"],
 ["ARI International DX","CW/SSB/RTTY",5,1,"12:00 Sat – 11:59 Sun"],["His Majesty the King of Spain CW","CW",5,3,"12:00 Sat – 12:00 Sun",0,0,1],["CQ WPX CW","CW",5,-1,"00:00 Sat – 24:00 Sun",0,"wpxcw"],
 ["All Asian DX CW","CW",6,3,"00:00 Sat – 24:00 Sun"],["His Majesty the King of Spain SSB","SSB",6,-1,"12:00 Sat – 12:00 Sun",0,0,1],
 ["IARU HF World Championship","CW/SSB",7,2,"12:00 Sat – 12:00 Sun",0,"iaru"],["Spanish National CW (CNCW)","CW",7,3,"12:00–22:59 Sat and 05:00–11:59 Sun",0,0,1],["RSGB IOTA","CW/SSB",7,-1,"12:00 Sat – 12:00 Sun"],
 ["EU HF Championship","CW/SSB",8,1,"12:00–23:59 Sat (Saturday only)",2],["WAE DX CW","CW",8,2,"00:00 Sat – 23:59 Sun",0,"waecw"],["YO DX HF","CW/SSB",8,3,"12:00 Sat – 12:00 Sun"],["WW Digi DX","FT4/FT8",8,-1,"12:00 Sat – 12:00 Sun"],
 ["All Asian DX Phone","SSB",9,1,"00:00 Sat – 24:00 Sun"],["WAE DX SSB","SSB",9,2,"00:00 Sat – 23:59 Sun",0,"wae"],["SAC CW (Scandinavia)","CW",9,3,"12:00 Sat – 12:00 Sun"],["CQ WW RTTY","RTTY",9,-1,"00:00 Sat – 24:00 Sun",0,"cqwwrtty"],
 ["Oceania DX Phone","SSB",10,1,"06:00 Sat – 06:00 Sun"],["Oceania DX CW","CW",10,2,"06:00 Sat – 06:00 Sun"],["SAC SSB (Scandinavia)","SSB",10,2,"12:00 Sat – 12:00 Sun"],["WAG (DARC)","CW/SSB",10,3,"15:00 Sat – 14:59 Sun"],["CQ WW DX SSB","SSB",10,-1,"00:00 Sat – 24:00 Sun",0,"cqww"],
 ["WAE DX RTTY","RTTY",11,2,"00:00 Sat – 23:59 Sun"],["JIDX Phone","SSB",11,2,"07:00 Sat – 13:00 Sun"],["OK/OM DX CW","CW",11,2,"12:00 Sat – 12:00 Sun"],["LZ DX","CW/SSB",11,3,"12:00 Sat – 12:00 Sun"],["CQ WW DX CW","CW",11,-1,"00:00 Sat – 24:00 Sun",0,"cqwwcw"],
 ["ARRL 160 m","CW",12,1,"22:00 vie – 16:00 dom",1],["ARRL 10 m","CW/SSB",12,2,"00:00 Sat – 23:59 Sun",0,"arrl10"]];
function calDate(y,m,n){const sats=[];for(let d=1;d<=31;d++){const x=new Date(Date.UTC(y,m-1,d));if(x.getUTCMonth()!==m-1)break;if(x.getUTCDay()===6){const s=new Date(Date.UTC(y,m-1,d+1));if(s.getUTCMonth()===m-1)sats.push(x)}}return n<0?sats[sats.length-1]:sats[n-1]}
function calNext(c){const now=new Date();for(const y of [now.getUTCFullYear(),now.getUTCFullYear()+1]){const sat=calDate(y,c[2],c[3]);if(!sat)continue;const st=new Date(sat.getTime()-(c[5]===1?864e5:0)),en=new Date(sat.getTime()+(c[5]===2?1:2)*864e5);if(en>now)return {st,sat,en}}return null}
const CALF={all:"All",ph:"Phone",cw:"CW",dig:"Digital",ure:"URE"};let CALSEL=null;
function calCat(c){const m=c[1];return {ph:/SSB/.test(m),cw:/CW/.test(m),dig:/RTTY|PSK|FT/.test(m),ure:!!c[7]}}
function renderCCal(){const el=$("ccal");if(!el)return;if(CALSEL==null){const md=MOD();CALSEL="all";try{CALSEL=localStorage.getItem("calf")||"all"}catch(e){}}
  const now=new Date(),fmt=d=>d.toLocaleDateString("en-US",{day:"numeric",month:"short",timeZone:"UTC"}).replace(".","");
  const rows=CAL.map(c=>({c,d:calNext(c)})).filter(x=>x.d).sort((a,b)=>a.d.st-b.d.st).filter(x=>CALSEL==="all"||calCat(x.c)[CALSEL]);
  el.innerHTML=`<div class="seg calf" role="group" aria-label="Filter contests">${Object.entries(CALF).map(([k,v])=>`<button data-cf="${k}" aria-pressed="${k===CALSEL}">${v}</button>`).join("")}</div>
  <div class="scroll"><table class="bt caltab"><tr><th>Dates</th><th>Contest</th><th>Mode</th><th>Schedule (UTC)</th><th>In</th></tr>${rows.map(({c,d},i)=>{const days=Math.ceil((d.st-now)/864e5);const on=d.st<=now;const mk=d.st.getUTCFullYear()*12+d.st.getUTCMonth(),pm=i?rows[i-1].d.st.getUTCFullYear()*12+rows[i-1].d.st.getUTCMonth():-1;
    const mh=mk!==pm?`<tr class="calm"><td colspan="5">${d.st.toLocaleDateString("en-US",{month:"long",year:"numeric",timeZone:"UTC"})}</td></tr>`:"";const en1=new Date(d.en.getTime()-864e5);
    const dt=c[5]===2?String(d.sat.getUTCDate()):(d.st.getUTCMonth()===en1.getUTCMonth()?`${d.st.getUTCDate()}–${en1.getUTCDate()}`:`${fmt(d.st)}–${fmt(en1)}`);
    const plan=c[6]&&CONTESTS[c[6]];return mh+`<tr class="${on?"calon":""}${c[7]?" calure":""}"><td class="cald">${dt}</td><td><b>${esc(c[0])}</b>${window.ACRACB_exch?ACRACB_exch(c[0]):""}${c[7]?' <span class="agr">URE</span>':""}${plan?` <button class="lnk" data-cplan="${c[6]}">see plan</button>`:""}</td><td>${esc(c[1])}</td><td class="note">${esc(c[4])}</td><td>${on?'<span class="agr ok">in progress</span>':days<=7?`<span class="agr dif">${days}<span class="dd"> day${days===1?"":"s"}</span><span class="dm"> d</span></span>`:`${days}<span class="dd"> days</span><span class="dm"> d</span>`}</td></tr>`}).join("")}</table></div>
  <p class="note">Dates calculated with each contest's rule (which weekend of the month) from the WA7BNM calendar and the URE rules. Check them in the official rules before each edition: some may change.</p>`;
  el.querySelectorAll("[data-cf]").forEach(b=>b.onclick=()=>{CALSEL=b.dataset.cf;try{localStorage.setItem("calf",CALSEL)}catch(e){}renderCCal()});
  el.querySelectorAll("[data-cplan]").forEach(b=>b.onclick=()=>{const k=b.dataset.cplan,K=CONTESTS[k];if(!K)return;const ms=$("modesel");
    if(K.modes&&!K.modes.includes(MOD())&&ms){ms.value=K.modes[0];store.set("c_modesel",ms.value);CACHE.clear();try{fillBandSel()}catch(e){}}
    store.set("contest",k);const cp=$("c_plan");if(cp)cp.hidden=false;selTab("concursos","c_plan",true);const pl=$("cplan");if(pl)pl.innerHTML=`<p class="note">Calculating the plan for ${esc(K.n)}…</p>`;window.scrollTo({top:0,behavior:"smooth"});requestAnimationFrame(()=>setTimeout(()=>setMode("contest",true),20))})}

/* ---------- hora a hora: mapa de calor bandas × horas, franja día/noche y resumen ---------- */
let TL2G=0;
function renderTL(){const g=++TL2G,el=$("tl");if(!el)return;const now=localNow(),C=st.mode==="contest";
  {const t=$("tlt");if(t)t.textContent=C?"Your contest hour by hour":"Your day hour by hour"}
  const TGM=TG().filter(inMode),BIL=BI(),G={},NT=Math.max(1,TGM.length);let x=0;
  const hour=()=>{const row={};let bb=null,bc=-1,bp=0,ba=-1;for(const b of BIL){let c=0,mp=0,a=0,na=true;for(const t of TGM){const r=prob(t,x,b);if(!r.na)na=false;const p=st.mode==="dx"?Math.max(r.p,t.l?prob(t,x,b,true).p:0):r.p;if(p>=.3)c++;if(p>mp)mp=p;a+=C?cval(t,b,p):0}
      if(C)c=cmults(x,b).size;row[b]={c,mp,na};if(!na&&(C?a>ba:(c>bc||(c===bc&&mp>bp)))){bc=c;bb=b;bp=mp;ba=a}}
    G[x]={row,bb:bp>=.05?bb:null,bc,bp};x++};
  const fin=()=>{if(g!==TL2G)return;el.className="tl2";
    const se=sunEvents(TXP),dn=Array.from({length:24},(_,h)=>{const e=sunEl(TXP,h);return e>6?"d":e>-6?"g":"n"});
    const hrs=Array.from({length:24},(_,h)=>h),cell=(h,inner,cl,ti)=>`<i class="${cl}${h===now?" now":""}${h===st.mhour?" sel":""}" data-h="${h}" title="${esc(ti)}">${inner}</i>`;
    let H=`<div class="hm2" role="img" aria-label="Probability by band and hour">`;
    H+=`<div class="hl"></div>`+hrs.map(h=>`<b class="hx${h===now?" now":""}">${h%3===0?hh(h):""}</b>`).join("");
    H+=`<div class="hl">Sun</div>`+hrs.map(h=>cell(h,"","dn dn-"+dn[h],`${hh(h)}:00 · ${dn[h]==="d"?"daytime":dn[h]==="g"?"gray line":"nighttime"}`)).join("");
    H+=`<div class="hl hlb">Best</div>`+hrs.map(h=>{const b=G[h].bb;return cell(h,b!=null?`<span>${BANDS[b].replace(/\s+m$/,"").replace(/\s+cm$/,"")}</span>`:"","bst",b!=null?`${hh(h)}:00 · best band ${BANDS[b]} · ${G[h].bc} ${C?"multipliers":"destinations ≥30 %"}`:`${hh(h)}:00 · nothing open`).replace('class="bst','style="background:'+(b!=null?BC[b]:"transparent")+'" class="bst')}).join("");
    for(const b of BIL.slice().reverse()){H+=`<div class="hl" style="color:${BC[b]}">${BANDS[b]}</div>`+hrs.map(h=>{const r=G[h].row[b];const fr=r.c/NT;return r.na?cell(h,"","na",`${BANDS[b]} · ${hh(h)}:00 · your antenna does not cover this band`):cell(h,"",r.c===0?"c0":cls(Math.max(.05,fr)),`${BANDS[b]} · ${hh(h)}:00 · ${r.c} of ${NT} ${C?"possible multipliers":"DX destinations"} open (${Math.round(fr*100)} %)`)}).join("")}
    H+=`</div>`;
    /* tramos de mejor banda */
    const seg=[];for(let h=0;h<24;h++){const b=G[h].bb;const L=seg[seg.length-1];if(L&&L.b===b)L.e=h+1;else seg.push({b,s:h,e:h+1})}
    let best=null;for(let h=0;h<24;h++)if(G[h].bb!=null&&(!best||G[h].bc>best.c||(G[h].bc===best.c&&G[h].bp>best.p)))best={h,b:G[h].bb,c:G[h].bc,p:G[h].bp};
    const nextOpen=(()=>{for(let k=0;k<24;k++){const h=(now+k)%24;if(G[h].bb!=null)return h}return null})();
    let T=`<div class="tlsum">${best?`<p class="tlbig">Best time of day: <b>${hh(best.h)}:00</b> on <b style="color:${BC[best.b]}">${BANDS[best.b]}</b> · ${best.c} ${C?"multipliers":"destinations with ≥30 %"}.</p>`:`<p class="tlbig">Today no band opens toward DX destinations with your station.</p>`}
      ${(()=>{let nb=null;for(let k=1;k<13;k++){const h=(now+k)%24;if(G[h].bb!=null&&(!nb||G[h].bc>nb.c))nb={h,b:G[h].bb,c:G[h].bc}}return nb&&best&&nb.h!==best.h?`<p>Best time in the next 12 h: <b>${hh(nb.h)}:00</b> on <b style="color:${BC[nb.b]}">${BANDS[nb.b]}</b> · ${nb.c} ${C?"multipliers":"destinations"}.</p>`:""})()}<p>Now (${hh(now)}:00): ${G[now].bb!=null?`<b style="color:${BC[G[now].bb]}">${BANDS[G[now].bb]}</b>, ${G[now].bc} ${C?"multipliers":"open destinations"}.`:`nothing open${nextOpen!=null?`; next one, at <b>${hh(nextOpen)}:00</b>`:""}.`}</p>
      <ul class="tlseg">${seg.map(s=>`<li><span class="tlh2">${hh(s.s)}–${hh(s.e%24)} h</span>${s.b!=null?`<b style="color:${BC[s.b]}">${BANDS[s.b]}</b>`:`<span class="note">no openings</span>`}</li>`).join("")}</ul></div>`;
    el.innerHTML=T+H+`<div class="hmleg"><span>${C?"Multipliers":"DX destinations"} open (≥30 %):</span><i class="c0"></i>none<i class="c1"></i>&lt;15 %<i class="c2"></i>15–30<i class="c3"></i>30–50<i class="c4"></i>50–70<i class="c5"></i>&gt;70 %<span class="sep"></span><i class="dn dn-d"></i>day<i class="dn dn-g"></i>gray line<i class="dn dn-n"></i>night</div>`;
    const th=$("tlh");if(th)th.innerHTML="";
    const sn=$("sun");if(sn)sn.innerHTML=`<span>Sunrise <b>${hm(se.rise)}</b></span><span>Midday <b>${hm(se.noon)}</b></span><span>Sunset <b>${hm(se.set)}</b></span><span class="note">Local hours. Tap an hour to see it on the map and in the rest of the platform.</span>`;
    el.querySelectorAll("[data-h]").forEach(c=>c.onclick=()=>{st.mhour=+c.dataset.h;const m=$("mh");if(m)m.value=st.mhour;refresh()});
    try{foldSums()}catch(e){}};
  const t0=performance.now();while(x<24&&performance.now()-t0<30)hour();if(x>=24)return fin();
  if(!el.children.length)el.innerHTML='<p class="note">Calculating the 24 hours…</p>';
  const step=()=>{if(g!==TL2G)return;const t1=performance.now();while(x<24&&performance.now()-t1<14)hour();if(x<24)setTimeout(step,0);else fin()};setTimeout(step,0)}

/* ---------- Fichas: entidades oídas de verdad en las últimas horas ---------- */
let XV=(()=>{try{return localStorage.getItem("xv")||"heard"}catch(e){return "heard"}})();const XH={cont:"",mine:false,sort:"rec"};
function renderExplorer(){document.querySelectorAll("#xview [data-xv]").forEach(b=>{b.setAttribute("aria-pressed",String(b.dataset.xv===XV));b.onclick=()=>{XV=b.dataset.xv;try{localStorage.setItem("xv",XV)}catch(e){}renderExplorer()}});
  if(XV==="prev")return renderPrevExplorer();renderHeard()}
function heardList(){const M=new Map(),now=Date.now(),ref=Date.parse([L.spotsChecked,L.spotsUTC,L.updatedUTC].filter(Boolean).sort().pop()||"")||now;
  const add=(dx,o)=>{if(dx==null)return;let r=M.get(dx);if(!r){r={dxcc:dx,calls:new Map(),bands:new Set(),modes:new Set(),n:0,last:0,src:new Set(),pos:null};M.set(dx,r)}
    r.n+=o.n||1;(o.bands||[]).forEach(b=>r.bands.add(b));(o.modes||[]).forEach(m=>r.modes.add(String(m).toUpperCase()));(o.calls||[]).forEach(c=>{if(!r.calls.has(c)||r.calls.get(c)<o.last)r.calls.set(c,o.last)});if(o.last>r.last)r.last=o.last;(o.src||[]).forEach(s=>r.src.add(s));if(!r.pos&&o.pos)r.pos=o.pos};
  for(const h of (L.heard||[])){const t=Date.parse(h.last)||0;if(ref-t>6*3600e3)continue;add(h.dxcc!=null?h.dxcc:(callEnt((h.calls||[])[0]||"")||{}).dxcc,{n:h.n,bands:h.b,modes:h.m,calls:h.calls,last:t,src:h.src,pos:h.pos})}
  for(const s of (L.spots||[])){const e=callEnt(s.call);if(!e||e.mm)continue;const a=spotAge(s);const t=a!=null?now-a*6e4:ref;const src=/skimmer|RBN/i.test(s.c||"")?"RBN":/PSK/i.test(s.c||"")?"PSK Reporter":"cluster";
    add(e.dxcc,{n:1,bands:[s.band],modes:[s.mode||"SSB"],calls:[String(s.call).toUpperCase()],last:t,src:[src],pos:s.dx})}
  return [...M.values()]}
function renderHeard(){const el=$("explo");if(!el)return;const now=Date.now(),lh=localNow();const all=heardList();
  const rows=all.map(r=>{const d=DXDg().d[r.dxcc]||["",""];const t=r.pos?nearestT(r.pos,r.dxcc):TG().find(x=>x.dxcc===r.dxcc);let bp={p:0,b:null};if(t)for(const b of BI().filter(b=>b<=10)){const q=Math.max(prob(t,lh,b,false).p,t.l?prob(t,lh,b,true).p:0);if(q>bp.p)bp={p:q,b}}
    return {...r,cc:d[0],name:dxName(r.dxcc),t,cont:t?t.cont:"",rare:t?t.rare:false,need:t?entNeed(t):null,bp}})
   .filter(r=>(!XH.cont||r.cont===XH.cont)&&(!XH.mine||[...r.modes].some(m=>spotMode({mode:m})===MOD()||(MOD()==="ssb"&&m==="SSB"))));
  const S={rec:(a,b)=>b.last-a.last,n:(a,b)=>b.n-a.n,rare:(a,b)=>(b.rare-a.rare)||(b.need===true)-(a.need===true)||b.last-a.last,km:(a,b)=>(b.t?b.t.km:0)-(a.t?a.t.km:0)}[XH.sort];rows.sort(S);
  const ago=t=>{const m=Math.max(0,Math.round((now-t)/6e4));return m<60?`${m} min ago`:`${Math.floor(m/60)} h ${m%60?String(m%60).padStart(2,"0")+" min ":""}ago`};
  const CN={"":"All",EU:"Europe",AF:"Africa",AS:"Asia",NA:"North America",SA:"South America",OC:"Oceania"};
  setSum("explo",`${all.length} entities heard in the last few hours${rows.length!==all.length?` · ${rows.length} with this filter`:""}`);
  el.innerHTML=`<div class="xhf"><div class="seg">${Object.entries(CN).map(([k,v])=>`<button data-hc="${k}" aria-pressed="${XH.cont===k}">${v}</button>`).join("")}</div>
   <label class="f xhs">Sort<select id="xhs"><option value="rec">Most recent</option><option value="rare">Rare and needed</option><option value="n">Most spots</option><option value="km">Farthest</option></select></label>
   <label class="chk"><input type="checkbox" id="xhm" ${XH.mine?"checked":""}> Only my mode (${esc(MD().s)})</label></div>
   <p class="note">Entities heard from Europe on clusters, Reverse Beacon and PSK Reporter in the last few hours. These are real spots, not forecasts. Tap one to see its profile.</p>
   ${rows.length?`<div class="hlist">${rows.map(r=>{const u=flagURL(r.cc),calls=[...r.calls.entries()].sort((a,b)=>b[1]-a[1]).map(x=>x[0]);return `<button class="hrow" data-hcall="${esc(calls[0])}">
     <span class="hn">${u?`<img class="fl" src="${u}" alt="" width="22" height="15"> `:""}<b>${esc(r.name)}</b>${r.rare?' <span class="agr dif">rare</span>':""}${r.need===true?' <span class="agr dif">needed</span>':""}</span>
     <span class="ht">${ago(r.last)} · ${r.n} spot${r.n===1?"":"s"}${r.src.size?` · ${[...r.src].join(", ")}`:""}</span>
     <span class="hb">${[...r.bands].sort((a,b)=>BALL.indexOf(a)-BALL.indexOf(b)).map(b=>`<i style="border-color:${BC[b]};color:${BC[b]}">${BANDS[b]}</i>`).join("")}<em>${[...r.modes].join(" · ")}</em></span>
     <span class="hc">${calls.slice(0,4).map(esc).join(", ")}${calls.length>4?` and ${calls.length-4} more`:""}</span>
     <span class="hp">${r.t?`${r.t.az}° ${cab(r.t.az)} · ${fk(r.t.km)} km`:""}${r.bp.b!=null?` · for you now: <b class="${cls(r.bp.p)}" style="padding:0 5px;border-radius:4px">${Math.round(r.bp.p*100)} %</b> on ${BANDS[r.bp.b]}`:""}</span></button>`}).join("")}</div>`:`<p class="empty">No entity heard with this filter.</p>`}`;
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
    if(x<24){if(++steps===1){const pl=$("cplan");if(pl)pl.innerHTML=`<p class="note">Calculating the plan for ${esc(CT().n)}…</p>`}setTimeout(step,0)}else{renderContest();renderCCal();try{foldSums()}catch(e){}}};
  renderCCal();step()}

/* «Qué hacer»: primero las acciones; el razonamiento, plegado */
function tidyRec(){const r=document.querySelector("#rec .rec");if(!r||r.dataset.tidy)return;const ds=[...r.children];const qh=ds.find(d=>/^\s*What to do/.test(d.textContent));if(!qh)return;
  r.dataset.tidy="1";const rest=ds.filter(d=>d!==qh);r.prepend(qh);if(rest.length){const det=document.createElement("details");det.className="why recwhy";det.innerHTML="<summary>Why: what the cluster and the conditions say</summary>";rest.forEach(d=>det.appendChild(d));r.appendChild(det)}}

/* WSPR: recuentos por banda (MHz → banda de la plataforma) */
const WSPRMAP={1:0,2:0,3:1,5:8,7:2,10:9,14:3,18:4,21:5,24:6,28:7,50:10};
function wsprN(b){const W=L.wspr&&L.wspr.bands;if(!W)return null;let n=null;for(const [k,v] of Object.entries(W)){if(WSPRMAP[Math.round(+k)]===b)n=(n||0)+(+v||0)}return n==null&&Object.keys(W).length?0:n}
/* Sol: previsión de 27 días de NOAA y eyecciones (CME) de NASA */
function renderOutlook(){const el=$("solar");if(!el)return;const O=L.outlook27,C=L.cme;let h="";
  if(O&&Array.isArray(O.days)&&O.days.length){const ds=O.days.slice(0,27),mx=Math.max(...ds.map(d=>+d[1]||0),160),mn=Math.min(...ds.map(d=>+d[1]||200),70);
    const W=ds.length*16+30,H=170,y=v=>H-24-((v-mn+5)/(mx-mn+10))*(H-44);
    let s=`<svg viewBox="0 0 ${W} ${H}" class="o27" role="img" aria-label="Solar flux and Ap forecast for 27 days">`;
    ds.forEach((d,i)=>{const x=24+i*16,v=+d[1],ap=+d[2];const col=ap>=20?"var(--bad)":ap>=10?"var(--warn)":"var(--ok)";s+=`<rect x="${x}" y="${y(v).toFixed(1)}" width="12" height="${(H-24-y(v)).toFixed(1)}" rx="2" fill="${col}" opacity=".85"><title>${esc(d[0])} · SFI ${v} · Ap ${ap}</title></rect>`;if(i%4===0)s+=`<text x="${x+6}" y="${H-8}" class="o27x">${esc(String(d[0]).slice(8,10))}/${esc(String(d[0]).slice(5,7))}</text>`;if(i%4===0)s+=`<text x="${x+6}" y="${(y(v)-4).toFixed(1)}" class="o27v">${v}</text>`});
    s+=`</svg>`;const good=ds.filter(d=>+d[2]<10).sort((a,b)=>b[1]-a[1]).slice(0,3).sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
    h+=`<div class="o27w"><h3 class="cyh">Next 27 days (NOAA)</h3><p class="note" style="margin:0 0 6px">Height: forecast solar flux. Color: geomagnetic activity (Ap): green quiet, yellow unsettled, red storm.${good.length?` Best days for DX: <b>${good.map(d=>String(d[0]).slice(8,10)+"/"+String(d[0]).slice(5,7)).join(", ")}</b>.`:""}</p>${s}${O.issued?`<p class="note">${esc(O.issued)}</p>`:""}</div>`}
  if(Array.isArray(C)&&C.length)h+=`<div class="o27w"><h3 class="cyh">Coronal mass ejections (NASA)</h3>${C.slice(0,4).map(c=>`<p>${c.arrival?`<b>Expected arrival: ${esc(fmtUTC(c.arrival))}</b> · `:""}departure ${esc(fmtUTC(c.time))} at ${esc(c.speed)} km/s${c.note?` · ${esc(c.note)}`:""}</p>`).join("")}</div>`;
  if(!h)return;const old=el.querySelector(".o27box");if(old)old.remove();const box=document.createElement("div");box.className="o27box";box.innerHTML=h;const sg=el.querySelector(".sgrid");if(sg)sg.parentNode.insertBefore(box,sg);else el.appendChild(box)}
function fmtUTC(t){const d=new Date(t);return isNaN(d)?String(t||""):d.toLocaleString("en-US",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"UTC"})+" UTC"}
COTN.tropo=["Tropo index (eastern Spain)","/10",1.5];

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
function renderLog(){if(!$("logbox"))return;{const sl=$("s_log");if(sl)sl.textContent=LOG?`${fk(LOG.n)} QSO · ${Object.keys(LOG.e).length} entities`:"Upload your ADIF";}const tot=new Set(V.meta.map(m=>m[2])).size;let conf=0,wk=0;if(LOG)for(const v of Object.values(LOG.e)){if(Object.values(v).includes("C"))conf++;else wk++}
  $("logbox").innerHTML=(LOG?`<div class="kv"><div class="chip"><div class="k">QSOs read</div><div class="v">${fk(LOG.n)}</div><div class="t">${fk(LOG.c)} confirmados (QRZ, LoTW or QSL)</div></div><div class="chip"><div class="k">Confirmed entities</div><div class="v">${conf}</div><div class="t">${wk} worked, not confirmed</div></div></div><p class="note">Loaded on ${new Date(LOG.date).toLocaleString("en-US",{timeZone:"Europe/Madrid"})}. With this, ★ and «needed» show up automatically on the map, DXpeditions, cluster and alerts.</p>`+(window.ACRACB_logview?ACRACB_logview():"")+(window.ACRACB_goals?ACRACB_goals():""):`<p>Upload your log so the site knows which entities and bands you need. Anything validated on QRZ, LoTW or by paper QSL counts as confirmed.</p>`)+
   `<div class="drop"><b>Upload your log in ADIF</b> (QRZ: Logbook → Settings → Export; LoTW, Club Log or your logging program also work). <span>It stays only on this device.</span><label class="btn filebtn">Choose ADIF file<input type="file" id="adif" class="vhide"></label></div><p class="note" id="adifst">${window.ADIFMSG?esc(window.ADIFMSG):""}</p>${LOG?'<button class="btn" id="logdel">Remove the log</button>':""}`;
  $("adif").onchange=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>150e6){$("adifst").textContent="That file is over 150 MB: it doesn't look like an ADIF log. Export it again or split it.";e.target.value="";return}$("adifst").textContent="Reading…";try{const txt=await f.text();const r=parseADIF(txt);if(!r.n){$("adifst").textContent="I couldn't find any QSOs in that file. Is it an ADIF?";return}LOG=r;const okS=store.set("db_owner/log",JSON.stringify(r));window.ADIFMSG=`Done: ${fk(r.n)} QSOs read, ${fk(r.c)} confirmed. `+(okS?"Guardado solo en este dispositivo: nadie más lo ve.":"It doesn't fit in the browser's storage: it works now, but you'll have to upload it again after closing the page.");CACHE.clear();refresh()}catch(err){$("adifst").textContent="The file could not be read."}};
  if($("logdel"))$("logdel").onclick=async()=>{LOG=null;window.ADIFMSG="Log removed from this device.";store.set("db_owner/log","");refresh()}}
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
  $("calbox").innerHTML=`<p>When you are at the radio, open a destination on the map and press <b>I hear it</b> o <b>I don't hear it</b>. From 3 reports at the same location and with the same antenna, maximum likelihood is used to find how many dB to add to or subtract from the forecasts to explain what you hear. Each report stores the reception margin at that moment (their power, your antenna, your cable, your local noise, the mode, the time, the Sun and the storm), and a ±6 dB prior avoids exaggerated corrections with few reports.</p>
   <div class="kv"><div class="chip"><div class="k">${esc($("loc").value)} · ${ANTL()}</div><div class="v">${c.n>=3?(c.db>0?"+":"")+c.db+" dB":"—"}</div><div class="t">${c.n} report${c.n===1?"":"s"}${c.n<3?` (faltan ${3-c.n})`:""}</div></div>${all.filter(([kk])=>kk!==k).map(([kk,v])=>`<div class="chip"><div class="k">${esc(kk.replace("|"," · "))}</div><div class="v">${v.n>=3?(v.db>0?"+":"")+v.db+" dB":"—"}</div><div class="t">${v.n} escuchas</div></div>`).join("")}</div>
   <p class="note">The correction applies in both directions: what moves it most (real antenna efficiency, losses, obstacles) affects receiving and transmitting equally.${OBS.length?' <button class="btn" id="caldel">Delete my reports</button>':""}</p>`;
  if($("caldel"))$("caldel").onclick=()=>{if(!confirm||true){OBS=[];dbSave("owner/cal",OBS);fitCal();refresh()}}}
/* ---------- avisos ---------- */
const TRIG="trig_01GUVtApDf5n6aUiEvA8tTzm",ATRIG="trig_016qZrtre2WYQ3oPNaQZPQcp";
let OWN=false,MEMB=null,SOC={ids:[],calls:[]},ALLM=[],CANW=null;
function renderAlBar(){const el=$("albar");if(!el)return;const al=L.alert;const age=al&&al.at?(Date.now()-Date.parse(al.at))/6e4:1e9;let off=null;try{off=sessionStorage.getItem("aloff")}catch(e){}
  const its=al&&al.items?al.items.filter(x=>CMS().includes(spotMode(x))):[];if(!its.length||age>150||off===al.at){el.hidden=true;return}
  el.hidden=false;const seenA=new Set(),uq=its.filter(x=>{if(seenA.has(x.call))return false;seenA.add(x.call);return true});el.innerHTML=`<div class="alh"><b>DX alert (${esc(fmtT(al.at))})</b><button class="lnk" id="alx" aria-label="Close alert">Close</button></div><div class="all">${uq.slice(0,5).map(x=>`<button class="alr" data-call="${esc(x.call)}"><span><b>${CS(x.call)}</b></span><span class="alf">${esc(x.f)}${x.mode?" "+(window.ACRACB_mb?ACRACB_mb(x.mode):esc(x.mode)):""} · ${esc(x.t)} UTC${window.ACRACB_tags?ACRACB_tags(x,true):""}</span><span class="alv">View profile</span></button>`).join("")}</div>`;
  el.querySelectorAll(".alr").forEach(b=>b.onclick=()=>{try{openCall(b.dataset.call)}catch(e){go("dx")}setTimeout(()=>{const c=[...document.querySelectorAll(".cpl")].find(x=>!x.hidden&&x.getClientRects().length);if(!c)return;let n=c;while(n&&n!==document.body){if(getComputedStyle(n).position==="fixed"){n.scrollTop=0;c.scrollTop=0;return}n=n.parentElement}c.scrollIntoView({behavior:"smooth",block:"start"})},150)});$("alx").onclick=()=>{try{sessionStorage.setItem("aloff",al.at)}catch(e){}el.hidden=true}}
/* ---------- socios ---------- */
const fmtD=iso=>{const d=new Date(iso);return isNaN(d)?"":d.toLocaleDateString("en-US",{timeZone:"Europe/Madrid",day:"numeric",month:"short",year:"numeric"})};
const CALLRE=/^[A-Z0-9]{1,3}[0-9][A-Z0-9]{0,5}(\/[A-Z0-9]{1,4})?$/;
function renderMembers(){}
function renderAlerts(){normL();const al=L.alert;renderAlBar();$("alerts").innerHTML=(OWN?`<p class="note">Active DXpeditions and rare entities for your mode that show up on the cluster. They are checked on every automatic update and when you press Update. Only those of the mode and bands you choose below reach you, here, on the home screen and in notifications.</p>`:`<p class="note">Active DXpeditions and rare entities for your mode that show up on the cluster. They are checked on every automatic update and when you press Update. Only those of the mode and bands you choose below reach you, here, on the home screen and in notifications.</p>`)+
  (al&&al.items?`<h3 style="margin-top:10px">Latest alert (${esc(fmtT(al.at))})</h3>`+(al.items.length?al.items.map(x=>`<div class="sp"><span class="f">${esc(x.f)}</span><span><b>${CS(x.call)}</b> · ${esc(x.mode||"SSB")} · ${esc(x.t)} UTC</span><span class="w">Needed: ${esc(x.need)} · heard by ${CSL(String(x.by||"").split(/[ ,]+/))}</span></div>`).join(""):`<p class="note">Nothing new.</p>`):"");
  const set=async on=>{if(!MCP){$("alst").textContent="Alerts cannot be changed from this viewer.";return}$("alst").textContent="Saving…";try{await MCP.callTool("Claude Code Remote","update_trigger",{trigger_id:ATRIG,enabled:on},{cache:false});$("alst").textContent=on?"Alerts on: the clusters will be checked every two hours.":"Alerts off.";store.set("alerts",on?"1":"0")}catch(e){$("alst").textContent=e&&e.code==="approval_required"||e&&e.code==="not_in_manifest"?"Accept the permission the page asks for and press again.":"Could not change ("+(e&&e.code||"error")+")."}};
  if($("alon"))$("alon").onclick=()=>set(true);if($("aloff"))$("aloff").onclick=()=>set(false);const s=store.get("alerts");if(s&&MCP)$("alst").textContent=s==="1"?"Alerts are on.":"Alerts are off."}
/* ---------- cabecera ---------- */
function renderTop(){$("upd").textContent=L.updated||"—";const c=(v,g,y)=>v>=g?"g":v>=y?"y":"r";
  const sfiT=L.sfi>=150?"Very high: heavily charged ionosphere; 10 m open to almost everywhere in daytime":L.sfi>=100?"Good: plenty of UV radiation for 15 and 12 m to open in daytime and 10 m to the south":L.sfi>=80?"Average: 20 and 17 m in daytime; 15 m only on good days":"Low: little ionization; in daytime the best is 20 m";
  const kpT=L.kp>=5?"Storm: noise rises and the MUF sinks in the north. Look for southern headings":L.kp>=4?"Active: paths to North America and Japan weak and with QSB":L.kp>=3?"Somewhat unsettled: northern paths with some QSB":"Quiet: low noise and polar paths open";
  const wT=L.wind>=600?"Very fast: storm likely; worsens the north":L.wind>=500?"Fast: pushes Kp up":L.wind>=450?"Somewhat fast: may disturb the field if Bz turns south":"Normal: on its own it does not alter the ionosphere";
  const bzT=L.bz<=-5?"South: opens the Earth's field to the solar wind; Kp may rise in 1–3 h":L.bz<0?"Slightly south: lets a little energy in":"North: the Earth's field holds back the solar wind; all stable";
  const flT="Flare probability in 24 h. It only affects daytime: it suddenly knocks out the bands for 15–60 min";
  const ssn=SSNV(),ssnT=ssn>=150?"Many sunspots: very active Sun; high bands open for a good part of the day":ssn>=90?"Quite a few sunspots: good activity; 15, 12 and 10 m open in daytime":ssn>=50?"Average activity: 20 and 17 m reliable; 15 m a ratos":"Few sunspots: quiet Sun; in daytime the best is 20 m";
  const items=[["SFI · solar flux",L.sfi,c(L.sfi,110,90),sfiT],["SSN · sunspots",ssn,c(ssn,90,50),ssnT+(L.space&&L.space.ssn!=null?" (sunspot number of the day)":" (estimated from the SFI)")],["Kp · magnetic field",L.kp,L.kp>=5?"r":L.kp>=4?"y":"g",kpT],...(()=>{const a=L.space&&L.space.a!=null&&L.space.a!==""&&!isNaN(+L.space.a)?Math.round(+L.space.a):null;return a==null?[]:[["A index · daily geomagnetic activity",a,a>=20?"r":a>=10?"y":"g",a>=30?"Storm: very disturbed day, noisy low bands and polar paths closed":a>=20?"Unsettled: some QSB and noise on northern paths":a>=10?"Slightly unsettled: normal conditions":"Quiet: stable day, good polar paths"]]})(),["Solar wind",L.wind+" km/s",L.wind>=550?"r":L.wind>=450?"y":"g",wT],["Bz · field direction",L.bz+" nT",L.bz<=-5?"r":L.bz<0?"y":"g",bzT],["Flares",L.flare,"y",flT]];
  $("sw").innerHTML=items.map(([k,v,cl,t])=>`<div class="chip ${cl}" title="${esc(k+": "+t)}"><div class="k">${k.split(" · ")[0].replace("Solar wind","Wind").replace("Flares","Flare")}</div><div class="v">${esc(v).replace(/ %/g,"\u00a0%").replace(/ (km\/s|nT)$/," <small>$1</small>")}</div><div class="t">${t}</div></div>`).join("");
  $("src").innerHTML="Live data sources: "+(()=>{const seen=new Set();return (L.sources||[]).filter(([n,u])=>{const k=String(u||n).replace(/[?#].*$/,"").replace(/\/$/,"").toLowerCase();if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>String(a[0]).localeCompare(String(b[0]),"en")).map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join(" · ")})()}
/* ---------- navegación ---------- */
const PAGES=["ahora","mapa","dx","sol","concursos","balizas","fichas","metodo"],MORE=new Set();
function go(pg,noScroll){if(!PAGES.includes(pg))pg="ahora";st.page=pg;store.set("page",pg);document.querySelectorAll(".page").forEach(s=>s.classList.toggle("on",s.dataset.pg===pg));document.querySelectorAll(".nav button").forEach(b=>{const on=b.dataset.pg===pg;b.setAttribute("aria-current",on?"page":"false");if(on){const n=b.parentNode;try{n.scrollTo({left:b.offsetLeft-(n.clientWidth-b.offsetWidth)/2,behavior:"smooth"})}catch(e){}}});{const sn=$("subnav");if(sn){sn.hidden=!MORE.has(pg)||pg==="mas";sn.querySelectorAll("button").forEach(b=>b.setAttribute("aria-current",b.dataset.pg===pg?"page":"false"))}}
  try{history.replaceState(null,"","#"+pg)}catch(e){}if(typeof renderPage==="function"&&$("eqnote").textContent)renderPage();if(!noScroll){const n=document.querySelector(".nav");if(n&&n.getBoundingClientRect().top<0)n.scrollIntoView({block:"start"})}}
document.querySelectorAll(".nav button,#subnav button").forEach(b=>b.onclick=()=>go(b.dataset.pg));document.querySelectorAll(".mtile").forEach(b=>b.onclick=()=>go(b.dataset.go));
/* ---------- refresco general ---------- */
function refresh(){CACHE.clear();RS=null;SPK=null;TXP=locToLL($("loc").value);
  $("locline").textContent=locName()+" ("+TXP[1].toFixed(3)+"° "+(TXP[1]>=0?"N":"S")+", "+Math.abs(TXP[0]).toFixed(3)+"° "+(TXP[0]>=0?"E":"W")+") · "+PWN()+" · "+ANTL();{const d=distJS(TXP,BASEQ);$("locw").textContent=window.ACRACB_HUBS?HUB.check(TXP):d>400?`A ${fk(d)} km from Alicante: bearings, distances and sun are exact, but the calculated ionosphere is that of eastern Spain; the forecast loses accuracy.`:""}
  const P=+$("eq").value;$("sfiv").textContent=$("sfi").value+" (SSN ≈ "+Math.round(ssnFrom(+$("sfi").value))+")";$("kpv").textContent=$("kpauto").checked?`NOAA forecast (now ${L.kp})`:$("kp").value;
  $("eqnote").textContent=`${locName()} · ${PWN()} · ${ANTS().map(id=>ANT[id].n+(ANT[id].h?" at "+$(ANT[id].h).value+" m":"")+" ("+ANT[id].bands.map(b=>BANDS[b]).join(", ")+")").join(" + ")} · ${siteText()}.`+(+$("eq").value<=5?" In QRP the figures assume you are heard without a pile-up.":"");
{const u=new Set(ANTS());Object.entries({dph:"dip",efh:"efhw",vh:"invv",hxh:"hex",sph:"steppir",d80h:"d80",d160h:"d160",ybh:"yb",quh:"quad",ocfh:"ocf",g5h:"g5rv",lwh:"lw"}).forEach(([id,an])=>{const l=$(id).closest("label");if(l)l.hidden=!u.has(an)})}renderTop();renderCfg();renderPage();warmCache()}
/* precalcula en los ratos libres las 24 horas de todas las bandas, para que cambiar de pestaña sea instantáneo */
let WARM=0;function warmCache(){const id=++WARM;const T=TG(),B=[...new Set([...BI(),...(()=>{try{return CT().bands}catch(e){return []}})()])];let x=0,bi=0;const ric=window.requestIdleCallback?f=>requestIdleCallback(f,{timeout:400}):f=>setTimeout(f,40);
  const step=dl=>{if(id!==WARM||!B.length)return;const t0=performance.now();do{const b=B[bi];for(const t of T){prob(t,x,b,false);if(t.l)prob(t,x,b,true)}if(++bi>=B.length){bi=0;x++}}while(x<24&&(dl&&!dl.didTimeout?dl.timeRemaining()>4:performance.now()-t0<12));if(x<24)ric(step)};
  setTimeout(()=>ric(step),300)}
let TLT=0;
function renderPage(){const p=st.page;document.body.dataset.page=p;renderPgHelp();
  renderSum();if(p==="ahora"){renderEasy();renderVHF();clearTimeout(TLT);TLT=setTimeout(()=>{if(st.page!=="ahora")return;renderQTH();renderSide();setTimeout(()=>{if(st.page==="ahora"){renderTL();renderContrast()}},0)},0)}else if(p==="mapa")drawMap();else if(p==="dx"){renderSide();renderAlerts();limitList($("spots"),12,"spots");limitList($("dxl"),8,"DXpeditions")}else if(p==="concursos"){renderContestLazy()}else if(p==="sol"){renderSpace();spaceExplain();renderCycle();renderCotejo();renderSolar();renderOutlook()}else if(p==="balizas")renderBcn();else if(p==="fichas"){const at=curTab("fichas");if(at==="f_explo"||!at)renderExplorer();if(at==="f_info")renderInfo();if(at==="f_tbl")renderView()};setTimeout(foldSums,60)}
["modesel","eq","site","thr","rx","nz","hz","sfi","kp","vh","hxh","sph","d80h","d160h","dph","efh","ybh","quh","ocfh","g5h","lwh","antsel","gnd","coax","coaxl","swr","proc","pile","lnz","opw"].forEach(id=>{const f=()=>{store.set("c_"+id,$(id).value);refresh()};$(id).addEventListener($(id).tagName==="SELECT"?"change":"input",f)});
["kpauto","ionoon","calon"].forEach(id=>{const v=store.get(id);if(v!==null)$(id).checked=v==="1";$(id).addEventListener("change",()=>{store.set(id,$(id).checked?"1":"0");refresh()})});
$("mh").addEventListener("input",e=>{st.mhour=+e.target.value;refresh()});
$("mnow").onclick=()=>{st.mhour=localNow();$("mh").value=st.mhour;refresh()};
$("mfs").onclick=toggleFS;
$("mplay").onclick=()=>{if(st.play){clearInterval(st.play);st.play=null;$("mplay").textContent="Animate 24 h";return}
  st.play=setInterval(()=>{if(document.hidden)return;st.mhour=(st.mhour+1)%24;$("mh").value=st.mhour;drawMap()},1200);$("mplay").textContent="Stop"};
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
   ?`<b style='color:#ffc23d'>CONTEST MODE</b> from Alicante (EA5 · Europe · CQ zone 14 · ITU zone 37). <select id="contest" aria-label="Contest" style="width:auto;max-width:100%;display:inline-block">${CKEYS().map(k=>`<option value="${k}">${CONTESTS[k].n} (${MESES[CONTESTS[k].month-1]})</option>`).join("")}</select> <select id="cmon" aria-label="Propagation" style="width:auto;max-width:100%;display:inline-block"><option value="month">Propagation for the contest month</option><option value="now">Today's propagation</option></select><br>«Comfortable QSO» threshold, because in a contest they have to copy you the first time. Plan, rate, breaks and tips in the Contests section.`
   :"<b style='color:#28d7e8'>DX MODE</b>: destinations beyond 2,500 km and rare entities.";
  const cs=$("contest");if(cs){const v=store.get("contest");if(v&&CONTESTS[v]&&CKEYS().includes(v))cs.value=v;cs.onchange=()=>{store.set("contest",cs.value);CACHE.clear();renderBandSeg();refresh()}}
  const cm=$("cmon");if(cm){const v=store.get("cmon");if(v)cm.value=v;cm.onchange=()=>{store.set("cmon",cm.value);CACHE.clear();refresh()}}
  renderBandSeg();refresh()}
document.querySelectorAll('.modes button').forEach(b=>b.onclick=()=>setMode(b.dataset.m,true));
function syncHdr(){$("locin").value=$("loc").value;document.querySelectorAll('[data-ant]').forEach(b=>b.setAttribute("aria-pressed",ANTS().includes(b.dataset.ant)))}
function applyLoc(){const v=normLoc($("locin").value);if(!v){$("locin").setAttribute("aria-invalid","true");$("locw").textContent="Invalid locator. Enter 4, 6, 8 or 10 characters, for example IM98RN or IM98RN98.";return}
  $("locin").removeAttribute("aria-invalid");$("loc").value=v;store.set("c_loc",v);closePop();refresh()}
$("locok").onclick=applyLoc;$("locin").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();applyLoc()}});
function applyAlt(){let h=Math.round(+$("altin").value);if(!isFinite(h)||h<0)h=0;$("altin").value=h;$("site").value=h>=700?"4":"0";store.set("c_alt",String(h));$("altk").textContent=h>=700?"alto":"normal";refresh()}
$("altin").addEventListener("change",applyAlt);$("altin").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();applyAlt()}});

const PWN=()=>{const w=+$("eq").value;return (w>=1000?(w/1000).toLocaleString("en-US")+" kW":w+" W")+" "+(w<=5?"QRP":w<=100?"Low Power":"High Power")};
/* ---------- modo fácil ---------- */
const SEGF={0:"1.840 and 1.900",1:"3.600 and 3.800",2:"7.060 and 7.200",3:"14.125 and 14.300",4:"18.120 and 18.168",5:"21.200 and 21.450",6:"24.940 and 24.990",7:"28.400 and 29.000"};
const CARD=["north","nornoreste","noreste","estenoreste","este","estesureste","sureste","sursureste","south","sursuroeste","suroeste","oestesuroeste","oeste","oestenoroeste","noroeste","nornoroeste"];
const card=az=>CARD[Math.round(((az%360)+360)%360/22.5)%16];
const dirTxt=az=>`${Math.round(az)}° ${cab(az)}`;
const CONTN={NA:"North America and the Caribbean",SA:"South America",AF:"Africa",AS:"Asia and the Middle East",OC:"Oceania",EU:"Europe"};
const easyAt=lh=>memo("ez|"+lh+"|"+MOD()+"|"+st.mode,()=>easyAt0(lh));
function easyAt0(lh){let bestB=null;for(const b of BI()){const ts=TG().filter(inMode).map(t=>{const a=prob(t,lh,b,false),c=prob(t,lh,b,true);return c.p>a.p?{t,p:c.p,lp:true}:{t,p:a.p,lp:false}}).filter(x=>x.p>=.3).sort((a,c)=>c.p-a.p);
    const sc=ts.reduce((s,x)=>s+x.p,0);if(!bestB||sc>bestB.sc)bestB={b,ts,sc}}return bestB&&bestB.ts.length?bestB:null}
/* cómo orientar la antena que el usuario ha elegido, banda a banda */
const DIRA=new Set(["steppir","hex","yb","quad"]),DIPA=new Set(["dip","d80","d160","ocf","g5rv","efhw","lw"]);
function aimTxt(az,lp,b){const ids=ANTS().filter(id=>ANT[id]&&ANT[id].bands.includes(b));const lpx=lp?", via the long path: the signal goes around the world the other way":"";
  if(ids.some(id=>DIRA.has(id)))return `<b>Where to point the beam:</b> <b>${dirTxt(az)}</b>${lpx}.`;
  if(ids.some(id=>DIPA.has(id)))return `<b>Bearing to the destination:</b> <b>${dirTxt(az)}</b>${lpx}. Your wire antenna radiates most broadside: it works better if the wire runs sideways to that bearing.`;
  if(ids.includes("mloop"))return `<b>Bearing to the destination:</b> <b>${dirTxt(az)}</b>${lpx}. Turn the loop so its plane faces that bearing.`;
  return `<b>Bearing to the destination:</b> <b>${dirTxt(az)}</b>${lpx}. Your antenna radiates equally in all directions: no need to turn it.`}
function easyCard(title,lh,e){if(!e)return `<div class="ez"><div class="ezt">${title}</div><p class="ezbig">Quiet bands</p><p>No clear DX openings. A good time to listen.</p></div>`;
  const top=e.ts.slice(0,8),conts=[...new Set(top.map(x=>x.t.cont))].map(c=>CONTN[c]);const lp=top[0].lp;const az=lp?top[0].t.laz:top[0].t.az;const p=top[0].p;
  const word=p>=.7?"very good":p>=.5?"buena":"aceptable";const omni=!ANTS().some(id=>ANT[id]&&ANT[id].bands.includes(e.b)&&(DIRA.has(id)));
  return `<div class="ez"><div class="ezt">${title}</div>
   <p class="ezbig"><b style="color:${BC[e.b]}">${BANDS[e.b]}</b> · ${word}</p>
   <p>${top.slice(0,3).map(x=>esc(x.t.name.split(" (")[0])).join(", ")} · ${Math.round(p*100)} %</p>
   <p>${omni?"Bearing":"Point to"} <b>${dirTxt(az)}</b>${lp?" (long path)":""}</p>
   <details class="why"><summary>See why</summary><p>Frequencies: ${segTxt(e.b)}.</p><p><b>With whom:</b> ${top.slice(0,8).map(x=>esc(x.t.name.split(" (")[0])).join(", ")}${conts.length?" ("+conts.join(", ")+")":""}.</p><p>${aimTxt(az,lp,e.b)}</p><p class="note">${e.b<=2?"Night band: in daytime the sun shuts it down.":e.b>=5?"Day band: it works while there is sunlight along the path.":"It works in daytime and a good part of the night."}</p></details></div>`}
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
  $("easy").innerHTML=`<div class="ezg">${easyCard("Now · "+hh(now)+":00",now,e0)}${full?(best?easyCard("Best time coming up · "+hh(best.h)+":00",best.h,best.e):"")+(night&&(!best||night.h!==best.h)?easyCard("Night or dawn · "+hh(night.h)+":00",night.h,night.e):""):`<div class="ez"><div class="ezt">Next hours</div><p class="note">Calculating…</p></div>`}</div>`+
   (dx.length?`<div class="ez ezdx"><div class="ezt">Rare stations on the air</div>${dx.map(x=>`<p><b>${CS(x.d.call)}</b> · ${BANDS[x.b]}${x.d.qsx?" · "+esc(x.d.qsx):""} · ${dirTxt(x.lp?x.t.laz:x.t.az)}</p>`).join("")}</div>`:"")+
   `<details class="why"><summary>Words and expressions worth knowing</summary><div class="ez ezg2" id="glos"></div></details>`}
/* ---------- glosario que va cambiando ---------- */
const GLOS=[["Band","the «big channel» of radio (40 m, 20 m, 15 m…). The low ones (160, 80, 40) work at night and the high ones (15, 12, 10), in daytime."],
 ["Pile-up","many stations calling a rare station at the same time. You have to wait your turn and give your callsign only once."],
 ["Split","the rare station talks on one frequency and listens on another, usually a little higher («up 5» = 5 kHz higher)."],
 ["Gray line","dawn and dusk. Signals go farther because the absorbing layer is gone and the reflecting one is still charged."],
 ["Long path","the signal goes around the world the other way because that path is better lit. The antenna is pointed the opposite way."],
 ["QSB","the signal goes up and down in strength. It happens mostly with geomagnetic storms or very long paths."],
 ["QRM","interference from other stations near your frequency."],
 ["QRN","atmospheric noise: lightning, static. Very noticeable on 80 and 160 m in summer."],
 ["QRZ?","«who is calling me?». The station says it when it did not catch the callsign."],
 ["59","the signal report: 5 = perfectly readable, 9 = very strong signal. In DX it is almost always 59."],
 ["DXpedition","a group that travels to an island or country with few radio amateurs so the whole world can contact that «country»."],
 ["DXCC entity","each of the 340 radio «countries». Some are islands or areas that count separately even though they belong to another country."],
 ["Cluster","an internet network where radio amateurs announce whom they are hearing and on which frequency."],
 ["Spot","each cluster announcement: callsign, frequency, time and who heard it."],
 ["Propagation","how the signal travels bouncing off the ionosphere. It changes with the time of day, the season and the Sun."],
 ["Ionosphere","layers of air ionized by the Sun, between 60 and 400 km high, that act as a mirror for shortwave."],
 ["MUF","the highest frequency that still bounces toward a destination. Above the MUF, the signal goes off into space."],
 ["Skip zone","the zone between your station and the first bounce where nobody hears you. That is why sometimes you cannot hear stations in your own province."],
 ["K or Kp index","measures whether the Earth's magnetic field is quiet (0–2) or stormy (5 or more)."],
 ["Solar flux (SFI)","how much energy the Sun sends. Above 100, the high bands open well."],
 ["Flare","an explosion on the Sun. In daytime it can leave all the bands silent for a few minutes."],
 ["Beam","an antenna that concentrates the signal in one direction. It has to be turned toward the destination."],
 ["Bearing","the direction in degrees to point the antenna: 0° north, 90° east, 180° south and 270° west."],
 ["Locator","a 4 to 8 character code (such as IM98RI) that tells where a station is, in squares on the map."],
 ["QSL","the confirmation of a contact, on paper or online (QRZ, LoTW, Club Log)."],
 ["Contest","a weekend competition to make as many contacts as possible with as many countries and zones as possible."],
 ["Multiplier","in a contest, each new country or zone multiplies your score. That is why they are so sought after."],
 ["QRP","transmitting with very low power, up to 5 W. It is a challenge: it takes good propagation and patience."],
 ["Sporadic E","clouds of very dense ionization that appear mostly in summer and suddenly open 10 m over 1,000–2,000 km."],
 ["Radials","wires on the ground or elevated that act as a «mirror» for a vertical antenna. The more, the better."],
 ["ROE","shows how much power comes back from the antenna to the radio. Ideally 1:1; above 2:1 signal is lost."],
 ["CW","telegraphy: dots and dashes. It goes farther than voice with the same power, because it takes up very little bandwidth."],
 ["FT8","a digital mode run from the computer: each message lasts 15 seconds and is decoded even when the signal cannot be heard by ear."],
 ["Fox/Hound","the way many DXpeditions work FT8: the expedition (fox) answers several stations (hounds) at once."],
 ["Beacon","an automatic transmitter that always sends the same thing. If you hear it, that direction is open."],
 ["CQ","general call: «any station, please answer». «CQ DX» asks only for distant contacts."],
 ["73","«best regards» when signing off. Always singular: 73, not 73s."],
 ["QSO","a complete contact between two stations: calls and reports exchanged."],
 ["QTH","the place you transmit from. «My QTH is Alicante»."],
 ["QSY","changing frequency. «QSY 14.205» means «I am moving to 14.205»."],
 ["QRP","transmitting with low power: 5 W or less on CW and 10 W or less on phone."],
 ["QRT","closing down the station and stopping transmission."],
 ["RST","the full report: readability 1 to 5, strength 1 to 9 and, on CW, tone 1 to 9. On CW you usually give 599."],
 ["Callsign","each station's «name», like EA5RKB. The prefix, EA, gives the country and the digit, the area."],
 ["Portable","the station is operating away from home. /M is from a vehicle and /MM from a ship."],
 ["D layer","the lowest ionospheric layer. It exists only by day and absorbs the low bands: that is why 80 and 160 m work at night."],
 ["F2 layer","the highest layer and the one that makes DX possible: it reflects short waves for thousands of kilometers."],
 ["Sporadic E","highly ionized clouds at about 100 km, mostly in summer, that open 10, 6 and 2 m to 1,000–2,000 km."],
 ["Hop","each bounce of the signal between the ionosphere and the ground. One F2 hop covers up to about 4,000 km."],
 ["Geomagnetic storm","the solar wind shakes the Earth's magnetic field: northern paths get worse and noise rises."],
 ["Solar cycle","the Sun goes from quiet to maximum activity and back in about 11 years. More sunspots, better high bands."],
 ["Most Wanted","Club Log's list of the most wanted entities. The higher up, the harder they are to work."],
 ["LoTW","Logbook of The World, the ARRL system to confirm contacts online."],
 ["ADIF","the standard logbook file format, exported by QRZ, Club Log and almost every logging program."],
 ["Handing over","ending your turn by saying «over» on phone or «K» on CW, so the other station can talk."]];
let GLSEED=Math.floor(Math.random()*1e6);
function renderGlos(){const el=$("glos");if(!el)return;const want=new Set();if(kpAt(localNow())>=4)["QSB","K or Kp index"].forEach(x=>want.add(x));if(SPOTS().some(x=>/split|up/i.test(x.c)))want.add("Split");if((L.dx||[]).length)want.add("DXpedition");
  const el0=sunEl(TXP,localNow());if(el0>-6&&el0<6)want.add("Gray line");if(st.mode==="contest")["Contest","Multiplier"].forEach(x=>want.add(x));
  const rest=GLOS.filter(g=>!want.has(g[0]));let r=GLSEED;const rnd=()=>{r=(r*9301+49297)%233280;return r/233280};rest.sort(()=>rnd()-.5);
  const pick=[...GLOS.filter(g=>want.has(g[0])).slice(0,2),...rest].slice(0,8);
  el.innerHTML=`<div class="ezt">Words you will hear on the radio</div><ul>${pick.map(([k,v])=>`<li><b>${k}</b>: ${v}</li>`).join("")}</ul><p class="note" style="margin:6px 0 0">They change every minute. <button class="btn" id="glosnext">More words</button></p>`;
  $("glosnext").onclick=()=>{GLSEED=Math.floor(Math.random()*1e6);renderGlos()}}
setInterval(()=>{if(document.hidden)return;if(st.page==="ahora"){GLSEED=Math.floor(Math.random()*1e6);renderGlos()}},60000);
/* ---------- tu QTH ---------- */
function renderQTH(){const lhn=localNow()+new Date().getMinutes()/60,se=sunEvents(TXP),el=sunElF(TXP,lhn),fo=foF2est(localNow()),alt=+$("altin").value;
  const ib=TXP[1]>35.5&&TXP[1]<44&&TXP[0]>-10&&TXP[0]<4.5;const anti=[TXP[0]>0?TXP[0]-180:TXP[0]+180,-TXP[1]],an=nearestT(anti,0),ad=distJS(anti,[an.lon,an.lat]);
  const seg=[];for(let i=0;i<96;i++){const e=sunElF(TXP,i/4+.125);seg.push(e<-12?"var(--q0)":e<-6?"#1b2540":e<0?"#4b3a7a":e<6?"#8a5a6a":e<20?"#b9783e":"#d9a441")}
  const pos=x=>(x/24*100).toFixed(2)+"%";const gw=[se.rise!=null?[se.rise-.5,se.rise+.5]:null,se.set!=null?[se.set-.5,se.set+.5]:null].filter(Boolean);
  const nb=BCN.map(b=>({b,d:distJS(TXP,[b[2],b[3]])})).sort((a,c)=>a.d-c.d)[0];
  const sk=[2,3,5].map(b=>`<span><b style="color:${BC[b]}">${BANDS[b]}</b> ${skipTxt(b,localNow()).replace("skip zone up to ","skip zone ")}</span>`).join("");
  $("qth").innerHTML=`<div class="qhead"><div><h2 style="border:0;margin:0;padding:0">Your QTH now</h2><div class="qloc">${esc($("loc").value)}</div><div class="note">${TXP[1].toFixed(4)}° ${TXP[1]>=0?"N":"S"} · ${Math.abs(TXP[0]).toFixed(4)}° ${TXP[0]>=0?"E":"W"} · ${fk(alt)} m${ib?" · CQ zone 14 · ITU zone 37":""}</div></div>
   <div class="qsun"><div class="qbig">${el>-6&&el<6?"Gray line":el>0?"Daytime":"Nighttime"}</div><div class="note">Sun at ${el.toFixed(0)}° ${el>=0?"above":"below"} the horizon</div></div></div>
   <div class="dbar" role="img" aria-label="Day and night at your QTH today">${seg.map(c=>`<i style="background:${c}"></i>`).join("")}<span class="dnow" style="left:${pos(lhn)}"></span>${se.rise!=null?`<span class="dlab" style="left:${pos(se.rise)}">▲ ${hm(se.rise)}</span>`:""}${se.set!=null?`<span class="dlab" style="left:${pos(se.set)}">▼ ${hm(se.set)}</span>`:""}</div>
   <div class="dax">${[0,3,6,9,12,15,18,21,24].map(h=>`<span style="left:${pos(h)}">${hh(h)}</span>`).join("")}</div>
   <div class="qgrid">
    <div><span class="k">Sunrise and sunset</span><b>${se.rise!=null?hm(se.rise):"—"} · ${se.set!=null?hm(se.set):"—"}</b><span class="t">solar noon ${hm(se.noon)} (local time)</span></div>
    <div><span class="k">Gray line</span><b>${gw.map(w=>hm(w[0])+"–"+hm(w[1])).join(" · ")||"—"}</b><span class="t">±30 min around sunrise and sunset: the best window for long-haul DX on 40 and 20 m</span></div>
    <div><span class="k">Ionosphere overhead</span><b>foF2 ≈ ${fo?fo.toFixed(1):"—"} MHz</b><span class="t">MUF at 3,000 km ≈ ${fo?(fo*3.2).toFixed(0):"—"} MHz (estimated${ionoK(localNow())!==1?", corrected with the ionosonde":""})</span></div>
    <div><span class="k">Skip zone now</span><b class="sk">${sk}</b><span class="t">minimum distance at which the signal comes back</span></div>
    <div><span class="k">Nearest beacon</span><b>${nb.b[0]}</b><span class="t">${esc(nb.b[1])}, ${fk(nb.d)} km, bearing ${Math.round(brgJS(TXP,[nb.b[2],nb.b[3]]))}° ${cab(brgJS(TXP,[nb.b[2],nb.b[3]]))}</span></div>
    <div><span class="k">Your antipodes</span><b>${Math.abs(anti[1]).toFixed(1)}° ${anti[1]>=0?"N":"S"} · ${Math.abs(anti[0]).toFixed(1)}° ${anti[0]>=0?"E":"W"}</b><span class="t">${ad<1500?"near "+esc(an.name.split(" (")[0]):"in the middle of the ocean; the nearest: "+esc(an.name.split(" (")[0])}: there all headings arrive equally</span></div>
   </div>`}
/* ---------- configuración activa ---------- */
const MYKEYS=["locin","altin","eq","antsel","gnd","sph","d80h","d160h","coax","coaxl"];
const CLUBP={locin:"IM98RI99",altin:"10",antsel:"club",gnd:"avg",sph:"12",d80h:"12",d160h:"15"};
function setPreset(p){MYKEYS.forEach(k=>{if(p[k]!==undefined)$(k).value=p[k]});MYKEYS.forEach(k=>{if(k!=="locin"&&k!=="altin")store.set("c_"+k,$(k).value)});applyAlt();applyLoc();refresh()}
function renderStSum(){const el=$("stsum");if(!el)return;const club=$("loc").value.slice(0,6)==="IM98RI"&&$("antsel").value==="club";
  el.innerHTML=`<p class="note" style="margin:0 0 8px">The basics are chosen above. Here you fine-tune the heights of the chosen antenna, the cable, the SWR, the processor, the noise and the station at the other end.</p>
  
  <p style="margin:0 0 4px"><button class="btn" id="psclub">Use the club station (EA5RKB)</button>${store.get("my_p")?` <button class="btn" id="psmine">Back to my station</button>`:""}</p>
  <p class="note" style="margin:0 0 10px">Club station: IM98RI99, 10 m altitude, 3-element beam at 12 m and dipoles for 80 m (12 m) and 160 m (15 m). It does not change power or cable.</p>`;
  $("psclub").onclick=()=>{if(!club){const m={};MYKEYS.forEach(k=>m[k]=$(k).value);store.set("my_p",JSON.stringify(m))}$("locin").value=CLUBP.locin;setPreset(CLUBP)};
  if($("psmine"))$("psmine").onclick=()=>{try{setPreset(JSON.parse(store.get("my_p")))}catch(e){}}}
function renderCfg(){renderStSum();if($("cfg").open)renderCal();const P=+$("eq").value,a=$("ant").value,mon=useMonth(),dB=10*Math.log10(P/100),rx=+$("rx").value,nz=+$("nz").value,c=calDb();
  const rxN={"-1":"dipole or vertical (+2 dBi)","0":"media (+3 dBi)","4":"directiva (+7 dBi)"}[$("rx").value],nzN={"-10":"urbano","-5":"residencial","0":"rural","5":"very quiet"}[$("nz").value];
  $("cfgs").innerHTML=`<b>Calculation:</b> ${esc($("loc").value)} · ${PWN()} · ${ANTS().map(id=>ANT[id].n+(ANT[id].h?" at "+$(ANT[id].h).value+" m":"")).join(" + ")} · ${"SFI "+$("sfi").value+" · SSN "+(st.sfiManual?Math.round(ssnFrom(+$("sfi").value)):SSNV())+" · Kp "+($("kpauto").checked?L.kp:$("kp").value)}${mon?" · "+MESES[mon-1]:""} <span class="cfgm">ajustes finos</span>`;
  const g10=b=>{const p=antPick(b,10);return p?p.g:null};
  const cmp=`<div class="tblw"><table class="bt" style="margin-top:10px"><tr><th>Antenna</th>${BALL.map(b=>`<th><span style="color:${BC[b]}">●</span> ${BANDS[b].replace(/\s+m$/,"")}</th>`).join("")}</tr>${ANTORD.map(id=>{const on=ANTS().includes(id);return `<tr style="${on?"":"opacity:.55"}"><td>${ANT[id].n}${ANT[id].h?" ("+$(ANT[id].h).value+" m)":""}${on?" <b>·</b>":""}</td>${BALL.map(b=>{if(!ANT[id].bands.includes(b))return "<td>—</td>";const g=gAnt(id,10,b)-gVert(10);const best=on&&antKind(b)===id;return `<td class="f" style="${best?"color:var(--accent);font-weight:600":""}">${g>0?"+":""}${g.toFixed(1)}</td>`}).join("")}</tr>`}).join("")}</table></div><p class="note">Gain of each antenna type versus the portable vertical at 10° takeoff, in dB, with the usual heights shown in parentheses (they are changed above if you choose that antenna) and your ground type. Marked with a dot, the ones you are using; in amber, the one used on each band.</p>`;
  const rows=BALL.map(b=>{const k=antKind(b),g=g10(b);return `<tr><td><span style="color:${BC[b]}">●</span> ${BANDS[b]}</td><td>${k==="none"?"<span class='bad'>none of your antennas covers this band</span>":ANT[k].n+(ANT[k].h?" at "+$(ANT[k].h).value+" m":"")}</td><td class="f">${g===null?"—":(g>0?"+":"")+g.toFixed(1)+" dB"}</td></tr>`}).join("");
  $("cfgb").innerHTML=`<div class="g2" style="margin-top:8px"><div><table class="bt"><tr><th>Band</th><th>Antenna used for the calculation</th><th>Versus the vertical, at 10° takeoff</th></tr>${rows}</table>${cmp}<p class="note">The real gain of each antenna changes with the takeoff angle of each path: each calculation uses the angle VOACAP gives for that destination, band and hour. The beam is assumed to be turned toward each destination.</p></div>
   <ul class="note mlist" style="margin:0">
   <li><b>Locator ${esc($("loc").value)}</b>: ${TXP[1].toFixed(4)}° ${TXP[1]>=0?"N":"S"}, ${Math.abs(TXP[0]).toFixed(4)}° ${TXP[0]>=0?"E":"W"} (center of the square). Bearings, distances, hops, sunrise and sunset and gray line are calculated from here.</li>
   <li><b>Power</b>: ${PWN()} takeoff (on phone, peak envelope) = ${dB>=0?"+":""}${dB.toFixed(0)} dB relative to 100 W. Contest categories, the same in all modes (CQ WW, CQ WPX, ARRL DX and IARU): <b>QRP</b> up to 5 W, <b>Low Power</b> up to 100 W and <b>High Power</b> above 100 W, up to the maximum of your license.${P<=5?" In QRP the figures assume you are heard without a pile-up.":""}</li>
   ${ANTS().map(id=>`<li><b>${ANT[id].n}</b>${ANT[id].h?" at "+$(ANT[id].h).value+" m":""}: ${ANT[id].d}. Bands: ${ANT[id].bands.map(b=>BANDS[b]).join(", ")}.</li>`).join("")}<li>If you choose several antennas, on each band and path the one with the most gain at that path's takeoff angle is used. Beams are assumed to be turned toward each destination. Heights are changed above, in the fine-tuning settings.</li>
   <li><b>Altitude</b>: ${siteText()}.</li>
   <li><b>Antenna surroundings</b>: ${gnd().n} (ground with εr ${gnd().er} and σ ${gnd().sg} S/m). Ground reflection is calculated with the Fresnel formulas for each angle and band. Salt water reflects almost like a mirror and gives verticals several dB more at low angles, which is what counts for DX; horizontal antennas change little.${gnd().half?" Near the sea half of that improvement is applied, because only the headings that leave over the water get it.":""}</li>
   <li><b>Station at the other end</b>: antenna ${rxN}${rx?" ("+(rx>0?"+":"")+rx+" dB)":""}; noise there ${nzN}${nz?" ("+(nz>0?"+":"")+nz+" dB)":""}.</li>
   <li><b>Transmission line</b>: ${$("coax").value==="0"?"not counted":$("coax").selectedOptions[0].text+", "+$("coaxl").value+" m"} → loss ${[0,1,2,3,5,7].map(b=>BANDS[b]+" "+coaxLoss(b).toFixed(1)).join(" · ")} dB. ROE ${(+$("swr").value).toFixed(1)}:1 → ${swrLoss().toFixed(2)} dB of mismatch. No cable is «lossless»: the Hyperflex and Ultraflex from Messi &amp; Paoloni are low-loss and flexible; their figures are approximate, taken from the manufacturer's datasheets.</li>
   <li><b>You hear them</b>: calculated separately with the other station transmitting ${$("opw").selectedOptions[0].text}, your same antennas when receiving, your cable and your background noise ${$("lnz").selectedOptions[0].text.split(" ·")[0]} (${rxNoisePen(3)?"−"+rxNoisePen(3)+" dB versus quiet countryside":"no penalty"}).</li>
   <li><b>Mode</b>: ${MD().n}: ${MD().d}${MOD()==="ssb"?"":" (estimate; "+MD().adj+" dB less SNR required)"}.</li>
   <li><b>Speech processor</b>: ${MOD()!=="ssb"?"not applied in "+MD().s:$("proc").value==="3"?"on: +3 dB more average power on SSB":"desactivado"}.</li>
   <li><b>Competition</b>: ${$("pile").value==="0"?"no pile-up":$("pile").selectedOptions[0].text.toLowerCase()}.</li>
   <li><b>Total adjustment for line, processor and competition</b>: ${[3,7].map(b=>BANDS[b]+" "+(lineAdj(b)>=0?"+":"")+lineAdj(b).toFixed(1)).join(" · ")} dB.</li>
   <li><b>Not taken into account</b>: sporadic Es (sporadic E layer), auroral or meteor scatter, supply voltage or specific horizon obstacles.</li>
   <li><b>Success</b>: ${$("thr").value==="48"?"Comfortable QSO (they copy you well the first time)":"Possible QSO (they copy you with effort)"}.</li>
   <li><b>Sun</b>: SFI ${$("sfi").value} → SSN ≈ ${Math.round(ssnFrom(+$("sfi").value))}. Kp: ${$("kpauto").checked?"NOAA hour-by-hour forecast (now "+L.kp+")":"fixed at "+$("kp").value}.</li>
   <li><b>Today's correction</b>: ${!$("ionoon").checked?"desactivada":ionoSrc()==="ionosonda"?"ionosonda "+esc(L.iono.station||"")+" (foF2 "+L.iono.fof2+" MHz)":ionoSrc()==="cluster"?"no ionosonde; the spots of the last 2 h ("+spotK().n+") indicate a MUF "+Math.round((spotK().k-1)*100)+" % higher than the monthly average; applied to the hours close to now":"no correction: there is no recent ionosonde or spots indicating otherwise"}.</li>
   <li><b>Your calibration</b>: ${c?(c>0?"+":"")+c+" dB":"none yet in this square with this antenna"}.</li>
   <li><b>Mode</b>: ${st.mode==="contest"?CT().n+", bands "+BI().map(b=>BANDS[b]).join(", "):"DX, all bands"}.</li></ul></div>`}
/* ---------- reloj ---------- */
function tick(){if(document.hidden)return;const n=new Date();$("cku").textContent=n.toISOString().slice(11,19);$("ckl").textContent=n.toLocaleTimeString("en-US",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"});
  const lhf=parseInt(n.toLocaleString("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:false}),10)%24+n.getMinutes()/60;const e=sunElF(TXP,lhf);$("cks").textContent=e>-6&&e<6?"gray line":e>0?"daytime · "+e.toFixed(0)+"°":"nighttime";$("cks").title=`The sun is ${e.toFixed(0)}° ${e>=0?"above":"below"} the horizon at your locator. Gray line = between 6° below and 6° above the horizon.`}
setInterval(tick,1000);
/* ---------- arranque ---------- */
$("sfi").value=L.sfi;$("kp").value=L.kp;
$("eq").value="100";$("site").value="0";$("ant").value="steppir,hex,invv,d80,d160,vert";if(store.get("antv")!=="2"){store.set("c_ant","steppir,hex,invv,d80,d160,vert");store.set("antv","2")}["modesel","eq","site","thr","rx","nz","hz","ant","vh","hxh","sph","d80h","d160h","dph","efh","ybh","quh","ocfh","g5h","lwh","antsel","gnd","coax","coaxl","swr","proc","pile","lnz","opw"].forEach(id=>{const v=store.get("c_"+id);if(v!==null&&v!==""&&($(id).tagName!=="SELECT"||[...$(id).options].some(o=>o.value===v)))$(id).value=v});if(store.get("locv")!=="2"){store.set("c_loc","IM98RI99");store.set("c_alt","10");store.set("locv","2")}{const v=normLoc(store.get("c_loc"));$("loc").value=v||"IM98RI99"}{const h=+(store.get("c_alt")||10);$("altin").value=isFinite(h)?h:10;$("site").value=+$("altin").value>=700?"4":"0";$("altk").textContent=$("site").value==="4"?"alto":"normal"}
st.mhour=localNow();$("mh").value=st.mhour;st.zone=store.get("pz")||"py";if(!T(st.zone))st.zone="py";
loadLocal();
initStart();const hpg=(location.hash||"").slice(1);go(PAGES.includes(hpg)?hpg:(store.get("page")||"ahora"),true);
renderBandSeg();syncHdr();setMode(store.get("mode")||"dx",false);tick();
/* ---------- datos en vivo y botón Actualizar ---------- */
const fmtT=iso=>{const d=new Date(iso);return isNaN(d)?"":d.toLocaleTimeString("en-US",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit"})};
function updSt(txt,cl){const e=$("updst");e.className="note "+(cl||"");e.textContent=txt;const b=$("updbtn"),r=cl==="updst-run";b.classList.toggle("run",r);b.querySelector(".tx").textContent=r?"Updating…":"Update"}
let RUNNING=null;
/* botones a clústeres externos: abre en pestaña nueva y, si el visor lo bloquea, ofrece la dirección para copiar o pulsar */
document.addEventListener("click",ev=>{const a=ev.target.closest("a[data-ext]");if(!a)return;ev.preventDefault();const u=a.href;let w=null;try{w=window.open(u,"_blank")}catch(e){w=null}
  if(w){try{w.opener=null}catch(e){}return}
  const fb=$("extfb");if(!fb){location.href=u;return}fb.hidden=false;
  fb.innerHTML=`This viewer does not allow opening new tabs. Open <b>${esc(a.textContent)}</b> in your browser: <a href="${esc(u)}" target="_top" rel="noopener noreferrer">${esc(u)}</a> <button class="lnk" id="extcp">Copy address</button>`;
  $("extcp").onclick=async()=>{let ok=false;try{await navigator.clipboard.writeText(u);ok=true}catch(e){try{const t=document.createElement("textarea");t.value=u;document.body.appendChild(t);t.select();ok=document.execCommand("copy");t.remove()}catch(e2){}}$("extcp").textContent=ok?"Copied":"Press and hold the link to copy it"}},true);

function applyLive(n){if(!n||!n.updatedUTC||(L.updatedUTC&&n.updatedUTC<L.updatedUTC))return;const keepAlert=L.alert;Object.keys(L).forEach(k=>delete L[k]);Object.assign(L,n);if(keepAlert&&!L.alert)L.alert=keepAlert;normL();$("sfi").value=L.sfi;$("kp").value=L.kp;CACHE.clear();renderBandSeg();refresh()}
(async()=>{
  const NOLIVE=()=>{const m=String(L.updated||"").match(/(\d{4})-(\d\d)-(\d\d) (\d\d:\d\d)/);const age=(Date.now()-(Date.parse(L.updatedUTC)||Date.now()))/6e4;const when=m?`${+m[3]}/${+m[2]} at ${m[4]}`:"the latest publication";if(age>180){const h=age<1440?`${Math.round(age/60)} h`:`${Math.round(age/1440)} days`;return `Note: data from ${h} (${when})ago. Conditions may have changed; the cluster is not the current one.`}return `Data from ${when} · updated only when Update is pressed`};
  const NOV="The update cannot be launched from this viewer: only the administrator can launch it with Update.";
  $("updbtn").onclick=()=>updSt(NOV,"updst-err");
  if(!window.claude||!claude.use){$("updbtn").hidden=true;updSt(NOLIVE(),(Date.now()-(Date.parse(L.updatedUTC)||Date.now()))/6e4>240?"updst-err":"updst-ok");renderMembers();return}
  updSt("Checking…");
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
      updSt(d.state==="running"?"Update in progress: the page will change by itself in a few minutes.":d.state==="done"?`Last update: ${fmtT(d.at)}${d.note?" · "+d.note:""}`:`The last automatic update did not finish (${fmtT(d.at)}). Another one can be requested with Update.`,d.state==="done"?"updst-ok":d.state==="running"?"":"updst-err")},()=>{});
    else db.doc("live/status").onSnapshot(s=>{if(!s.exists)return;const d=s.data();RUNNING=d.state==="running"?Date.parse(d.at):null;
      if(d.state==="running"){const m=Math.round((Date.now()-Date.parse(d.at))/60000);if(m<20){updSt(`Fetching data (since ${fmtT(d.at)}). The page will update by itself.`,"updst-run");$("updbtn").disabled=true}else{updSt(`The last update (${fmtT(d.at)}) did not finish. You can request another one.`,"updst-err");if(mcp)$("updbtn").disabled=false}}
      else if(d.state==="done"){updSt(`Updated at ${fmtT(d.at)}: ${d.note||""}`,"updst-ok");if(mcp)$("updbtn").disabled=false}
      else if(d.state==="error"){updSt(`The last update failed (${fmtT(d.at)}): ${d.note||""}`,"updst-err");if(mcp)$("updbtn").disabled=false}},()=>{});
  }
  renderAlerts();renderMembers();
  if(!OWN){$("updbtn").hidden=true;if(!db){updSt(NOLIVE(),(Date.now()-(Date.parse(L.updatedUTC)||Date.now()))/6e4>240?"updst-err":"updst-ok");return}if($("updst").textContent==="Checking…")updSt("Data is updated only when Update is pressed.","updst-ok");return}
  if(!mcp){if(!db||$("updst").textContent==="Checking…")updSt(NOV,"updst-err");return}
  if($("updst").textContent==="Checking…")updSt("");
  if(!RUNNING)$("updbtn").disabled=false;
  {const c=$("updcl");if(c){c.hidden=true;c.onclick=async()=>{c.disabled=true;updSt("Requesting the cluster…","updst-run");
    try{await mcp.callTool("Claude Code Remote","fire_trigger",{trigger_id:ATRIG},{cache:false});updSt(`Cluster requested at ${fmtT(new Date().toISOString())}. New spots will appear by themselves in 2–4 minutes.`,"updst-run")}
    catch(e){updSt("Could not request the cluster ("+((e&&e.code)||"error")+").","updst-err")}
    setTimeout(()=>{c.disabled=false},120000)};
    /* al abrir la plataforma o volver a ella, si el clúster tiene más de 15 min se pide uno nuevo (como máximo cada 10 min) */
    const autoCl=()=>{try{if(document.hidden||c.disabled)return;const last=+(localStorage.getItem("clAuto")||0),sa=Math.max((Date.parse(L.spotsChecked)||0)||0,(Date.parse(L.spotsUTC||L.updatedUTC)||0)||0);if(Date.now()-sa>15*60e3&&Date.now()-last>10*60e3){localStorage.setItem("clAuto",String(Date.now()));c.click()}}catch(e){}};
    /* lanzamiento automático desactivado para no agotar el cupo de ejecuciones */}}
  $("updbtn").onclick=async()=>{const b=$("updbtn");b.disabled=true;updSt("Sending the request…","updst-run");
    try{let okc=true;try{await mcp.callTool("Claude Code Remote","fire_trigger",{trigger_id:ATRIG},{cache:false})}catch(e){okc=false}
      await mcp.callTool("Claude Code Remote","fire_trigger",{trigger_id:TRIG},{cache:false});try{localStorage.setItem("clAuto",String(Date.now()))}catch(e){}
      updSt(`Requested at ${fmtT(new Date().toISOString())}. ${okc?"New spots arrive in 2–4 minutes and the rest":"Everything"} (Sun, ionosphere, beacons, DXpeditions and sources) in about 8 minutes. The page will change by itself.`,"updst-run");
      setTimeout(()=>{if(!RUNNING)b.disabled=false},180000)}
    catch(e){const c=e&&e.code;b.disabled=false;
      updSt(c==="approval_required"||c==="not_in_manifest"||c==="consent_required"?"Accept the permission the page asks for and press again.":
        c==="server_not_connected"||c==="needs_reauth"?"The update permission still needs to be turned on in your account.":
        c==="blocked_by_policy"?"This feature is not available for your account.":
        c==="tool_error"?"Could not launch the update: "+(e.message||"").slice(0,140):
        c==="server_unavailable"||c==="upstream_error"?"No response. It may have been launched anyway: wait a few minutes before pressing again.":
        "Could not request the update ("+(c||"error")+"). Try again later.","updst-err")}};
})();
setInterval(()=>{if(document.hidden)return;if(st.page==='ahora'){renderTL();renderQTH()}},60*1000);

{const b=$("tocred");if(b)b.onclick=()=>{go("metodo");setTimeout(()=>{const c=$("creditos");try{selTab("metodo","creditos",true)}catch(e){}if(c){c.open=true}if(c)c.scrollIntoView({behavior:"smooth"})},50)}}



$("cfg").addEventListener("toggle",()=>{if($("cfg").open)renderCal()});

$("mpan").onclick=()=>{const c=$("mapcard"),on=!c.classList.contains("nopan");c.classList.toggle("nopan",on);$("mpan").textContent=on?"Show controls":"Hide controls"};$("mfsx").onclick=()=>toggleFS();

function fillBandSel(){const s=$("bandsel");if(!s)return;const keep=s.value||store.get("c_bandsel")||"";s.innerHTML=`<option value="">All</option>`+BI0().map(b=>`<option value="${b}">${BANDS[b]}</option>`).join("");s.value=[...s.options].some(o=>o.value===keep)?keep:""}
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

