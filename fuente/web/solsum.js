/* ---- ACRACB 2.4.1: el Sol en el resumen principal ----
   Debajo de «Qué banda y hacia dónde», una franja con los datos solares que más cuentan para la propagación, con el mismo
   código de colores que la página del Sol (verde favorable, ámbar regular, rojo desfavorable) y una frase que lo resume. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lv3=(v,g,y,inv)=>v==null||v===""||isNaN(+v)?"n":inv?(+v<g?"g":+v<y?"y":"r"):(+v>=g?"g":+v>=y?"y":"r");
function items(){const s=L.space||{};const xr=String(s.xray||"").trim().toUpperCase()[0];
  return [[T("Flujo solar","Solar flux"),L.sfi!=null?"SFI "+L.sfi:null,lv3(L.sfi,110,90)],[T("Manchas","Sunspots"),s.ssn!=null?"SSN "+s.ssn:null,lv3(s.ssn,90,50)],
   ["Kp",L.kp,lv3(L.kp,3,4.5,1)],[T("Índice A","A index"),s.a!=null&&s.a!==""&&!isNaN(+s.a)?Math.round(+s.a):null,lv3(s.a,10,20,1)],[T("Viento solar","Solar wind"),L.wind!=null?L.wind+" km/s":null,lv3(L.wind,450,550,1)],
   ["Bz",L.bz!=null?L.bz+" nT":null,L.bz==null?"n":L.bz>=0?"g":L.bz>-5?"y":"r"],[T("Rayos X","X-rays"),s.xray||null,!xr?"n":"AB".includes(xr)?"g":xr==="C"?"y":"r"],
   [T("Apagón (24 h)","Blackout (24 h)"),L.radio&&L.radio.r12!=null?L.radio.r12+" %":null,!L.radio||L.radio.r12==null?"n":L.radio.r12<20?"g":L.radio.r12<40?"y":"r"]].filter(x=>x[1]!=null&&x[1]!=="")}
const nf=(v,d)=>v==null||isNaN(+v)?null:(+v).toFixed(d==null?1:d).replace(/\.0$/,"").replace(".",EN()?".":",");
const dm=iso=>{const p=String(iso).split("-");return p.length===3?(+p[2])+"/"+(+p[1]):iso};
const today=()=>new Date().toISOString().slice(0,10);
/* resto de valores de «Valores reales ahora» */
function more(){const s=L.space||{};const r=L.radio||{};const pr=String(s.proton||"");const out=[];
  if(L.bt!=null)out.push(["Bt",L.bt+" nT",lv3(L.bt,10,20,1)]);
  if(pr)out.push([T("Protones","Protons"),pr,/S0/i.test(pr)?"g":/S1/i.test(pr)?"y":"r"]);
  if(s.aurora)out.push([T("Aurora","Aurora"),s.aurora,(m=>m?lv3(+m[1],20,50,1):"n")(String(s.aurora).match(/(\d+)\s*%/))]);
  if(L.flare)out.push([T("Llamaradas (24 h)","Flares (24 h)"),L.flare,(m=>m?lv3(+m[1],10,30,1):"n")(String(L.flare).match(/X\s*(\d+)/))]);
  if(r.r3!=null)out.push([T("Apagón fuerte R3+ (24 h)","Strong blackout R3+ (24 h)"),r.r3+" %",lv3(r.r3,10,25,1)]);
  if(r.s1!=null)out.push([T("Tormenta de protones (24 h)","Proton storm (24 h)"),r.s1+" %",lv3(r.s1,10,25,1)]);
  return out}
/* Kp previsto en lo que queda de la previsión NOAA de 3 días */
function kpNext(){const f=L.kpfc;if(!f||!f.base||!Array.isArray(f.blocks))return null;const b0=Date.parse(f.base+"T00:00:00Z"),now=Date.now();let mx=null;
  f.blocks.forEach((d,i)=>d.forEach((v,j)=>{const t=b0+(i*24+j*3)*36e5;if(t+3*36e5>now&&t<now+24*36e5&&v!=null)mx=mx==null?v:Math.max(mx,v)}));return mx}
function ahead(){const out=[];const k=kpNext();if(k!=null)out.push([T("Kp máximo próximas 24 h","Max Kp next 24 h"),nf(k,1),lv3(k,3,4.5,1)]);
  const o=L.outlook27&&L.outlook27.days;if(Array.isArray(o)){const t=today();const fut=o.filter(d=>d[0]>t);
    if(fut[0])out.push([T("Flujo solar mañana","Solar flux tomorrow"),"SFI "+fut[0][1],lv3(fut[0][1],110,90)]);
    const st=fut.find(d=>d[3]>=5||d[2]>=20);out.push([T("Próxima tormenta (NOAA)","Next storm (NOAA)"),st?dm(st[0])+" · Ap "+st[2]:T("ninguna en 27 días","none in 27 days"),st?((Date.parse(st[0])-Date.now())/864e5<3?"r":"y"):"g"]);
    const best=fut.filter(d=>d[2]<=5).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,3).sort((a,b)=>a[0].localeCompare(b[0]));
    if(best.length)out.push([T("Mejores días para el DX","Best DX days"),best.map(d=>dm(d[0])).join(", "),"g"])}
  if(Array.isArray(L.cme))out.push(["CME",L.cme.length?T(`${L.cme.length} hacia la Tierra`,`${L.cme.length} Earth-directed`):T("ninguna hacia la Tierra","none Earth-directed"),L.cme.length?"y":"g"]);
  return out}
function cycle(){const out=[];const c=L.cycle||{};const last=o=>{const k=o&&Object.keys(o).sort().pop();return k?[k,o[k]]:null};
  const sm=last(c.smoothed),mo=last(c.monthly);const MES=EN()?["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]:["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const ym=k=>MES[+k.slice(5,7)-1]+" "+k.slice(0,4);
  if(sm)out.push([T("Manchas suavizadas (oficial)","Smoothed sunspots (official)"),nf(sm[1])+" · "+ym(sm[0]),"n"]);
  if(mo)out.push([T("Media del último mes","Last month average"),nf(mo[1])+" · "+ym(mo[0]),"n"]);
  if(L.essn!=null)out.push([T("SSN efectivo (ionosfera)","Effective SSN (ionosphere)"),nf(L.essn),lv3(L.essn,90,50)]);
  const p=L.ssnPred;if(p){const ks=Object.keys(p).sort();if(ks.length)out.push([T("Previsión dentro de 12 meses","Forecast in 12 months"),nf(p[ks[ks.length-1]])+" · "+ym(ks[ks.length-1]),"n"])}
  out.push([T("Fase del ciclo 25","Cycle 25 phase"),T("bajando · mínimo hacia 2030","declining · minimum around 2030"),"n"]);return out}
function notes(){const a=Array.isArray(L.solar)?L.solar:[];return a.filter(x=>Array.isArray(x)&&/^(Sol|Geomagnetismo|Previsión|Sun|Geomagnetism|Outlook|Forecast)/i.test(x[0])&&x[1])}
function verdict(it){const r=it.filter(x=>x[2]==="r").length,y=it.filter(x=>x[2]==="y").length;
  if(!it.length)return "";if(r>=2)return T("Sol revuelto: espera bandas altas irregulares y caminos polares cortados.","Disturbed Sun: expect erratic high bands and closed polar paths.");
  if(r===1)return T("Un valor en rojo: las bandas pueden ir peor de lo previsto.","One value in red: bands may be worse than forecast.");
  if(y>=3)return T("Condiciones regulares.","Fair conditions.");return T("Sol tranquilo: buenas condiciones para el DX.","Quiet Sun: good conditions for DX.")}

/* 2.4.9: tablas de consulta al final del glosario: alfabeto fonético, código Q y Morse para CW */
const NATO=[["A","Alfa"],["B","Bravo"],["C","Charlie"],["D","Delta"],["E","Echo"],["F","Foxtrot"],["G","Golf"],["H","Hotel"],["I","India"],["J","Juliett"],["K","Kilo"],["L","Lima"],["M","Mike"],["N","November"],["O","Oscar"],["P","Papa"],["Q","Quebec"],["R","Romeo"],["S","Sierra"],["T","Tango"],["U","Uniform"],["V","Victor"],["W","Whiskey"],["X","X-ray"],["Y","Yankee"],["Z","Zulu"]];
const QC=[["QRG","Tu frecuencia exacta es…","Your exact frequency is…"],["QRK","Legibilidad de tu señal, de 1 a 5","Readability of your signal, 1 to 5"],["QRL","¿Está ocupada esta frecuencia?","Is this frequency in use?"],
 ["QRM","Interferencias de otras estaciones","Interference from other stations"],["QRN","Ruido atmosférico, estática","Atmospheric noise, static"],["QRO","Aumenta la potencia / potencia alta","Increase power / high power"],
 ["QRP","Baja la potencia / poca potencia","Reduce power / low power"],["QRQ","Transmite más deprisa","Send faster"],["QRS","Transmite más despacio","Send more slowly"],["QRT","Cierro la estación","I am closing down"],
 ["QRV","Estoy preparado","I am ready"],["QRX","Espera, te llamo luego","Wait, I will call you again"],["QRZ","¿Quién me llama?","Who is calling me?"],["QSB","Tu señal sube y baja","Your signal is fading"],
 ["QSL","Confirmado / tarjeta de confirmación","Confirmed / confirmation card"],["QSO","Contacto entre dos estaciones","Contact between two stations"],["QSP","Retransmito tu mensaje","I will relay your message"],
 ["QST","Mensaje para todos los radioaficionados","Message to all radio amateurs"],["QSY","Cambio de frecuencia","Change of frequency"],["QTH","Mi ubicación es…","My location is…"],["QTR","La hora exacta es…","The exact time is…"]];
const MORSE={A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",
 "1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.","0":"-----","/":"-..-.","?":"..--..",".":".-.-.-",",":"--..--","=":"-...-"};
const mor=c=>c.replace(/\./g,"<i class=\"md\"></i>").replace(/-/g,"<i class=\"mh\"></i>");
const PRO=[["CQ","-.-. --.-",T("llamada general","general call")],["DE","-.. .",T("de, desde","from")],["K","-.-",T("cambio, adelante","over, go ahead")],["AR",".-.-.",T("fin del mensaje","end of message")],
 ["SK","...-.-",T("fin del contacto","end of contact")],["BK","-...-.-",T("pausa, interrumpo","break")],["73","--... ...--",T("saludos","best regards")],["5NN","..... -. -.",T("599 abreviado","599, abbreviated")]];
function refHTML(){
  return `<div class="glref">
  <details class="glr"><summary>${T("Alfabeto fonético internacional","International phonetic alphabet")}</summary>
   <p class="note">${T("Para deletrear el indicativo sin que se confunda: EA5RKB se dice «Echo Alfa Cinco Romeo Kilo Bravo».","To spell a callsign without confusion: EA5RKB is said «Echo Alfa Five Romeo Kilo Bravo».")}</p>
   <div class="glgrid nato">${NATO.map(([l,w])=>`<span class="glt"><b>${l}</b><span>${w}</span></span>`).join("")}</div></details>
  <details class="glr"><summary>${T("Código Q más usado","Most used Q code")}</summary>
   <p class="note">${T("Abreviaturas de tres letras que empiezan por Q. Con interrogación son pregunta: «QRZ?» es «¿quién me llama?».","Three-letter abbreviations starting with Q. With a question mark they are a question: «QRZ?» is «who is calling me?».")}</p>
   <div class="glgrid qc">${QC.map(([q,es,en])=>`<span class="glt"><b>${q}</b><span>${e2(T(es,en))}</span></span>`).join("")}</div></details>
  <details class="glr"><summary>${T("Código Morse para CW","Morse code for CW")}</summary>
   <p class="note">${T("Punto corto y raya larga (tres puntos). Entre letras, una pausa de tres puntos; entre palabras, de siete.","Short dot and long dash (three dots). Between letters a three-dot gap; between words, seven.")}</p>
   <div class="glgrid mo">${"ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890/?.,=".split("").map(l=>[l,MORSE[l]]).map(([l,c])=>`<span class="glt" title="${c.replace(/\./g,"·").replace(/-/g,"–")}"><b>${e2(l)}</b><span class="mc" aria-label="${c.replace(/\./g,T("punto ","dot ")).replace(/-/g,T("raya ","dash "))}">${mor(c)}</span></span>`).join("")}</div>
   <h5>${T("Abreviaturas de CW","CW abbreviations")}</h5>
   <div class="glgrid pro">${PRO.map(([a,c,m])=>`<span class="glt"><b>${a}</b><span class="mc">${c.split(" ").map(mor).join("<i class=\"mg\"></i>")}</span><small>${m}</small></span>`).join("")}</div></details>
  </div>`}
let REF="";
let SOLOPEN=false;
function render(){const box=document.getElementById("easy");if(!box||typeof L==="undefined")return;let el=document.getElementById("solsum");const it=items();
  if(!it.length){if(el)el.remove();return}
  const chips=a=>`<div class="solsum-k">${a.map(([k,v,l])=>`<span class="ssk lvk-${l}"><i></i><span class="ssk-k">${k}</span><b>${e2(v)}</b></span>`).join("")}</div>`;
  const grp=(t,a)=>a.length?`<div class="solsum-g"><h4>${t}</h4>${chips(a)}</div>`:"";
  const ns=notes();
  /* 2.4.9: a la vista, lo esencial (los 8 valores que más cuentan y el veredicto); el resto, en un desplegable */
  const extra=grp(T("Más valores ahora","More live values"),more())+grp(T("Próximas horas y días","Next hours and days"),ahead())+grp(T("Ciclo solar","Solar cycle"),cycle())+
    (ns.length?`<div class="solsum-g"><h4>${T("Qué significa","What it means")}</h4><dl class="solsum-n">${ns.map(x=>`<dt>${e2(x[0])}</dt><dd>${e2(x[1])}</dd>`).join("")}</dl></div>`:"");
  const h=`<div class="solsum-h"><b>${T("El Sol ahora","The Sun now")}</b><span class="solsum-v">${verdict(it.concat(more()))}</span><button type="button" class="lnk" id="solgo">${T("Ir a la sección Sol","Go to the Sun section")}</button></div>`+
    chips(it)+(extra?`<details class="solmore"${SOLOPEN?" open":""}><summary>${T("Más datos: previsión, ciclo solar y explicaciones","More: forecast, solar cycle and explanations")}</summary>${extra}</details>`:"");
  if(!el){el=document.createElement("div");el.id="solsum";el.className="solsum";box.insertAdjacentElement("afterend",el)}
  if(el.innerHTML!==h){el.innerHTML=h;const b=document.getElementById("solgo");if(b)b.onclick=()=>{try{go("sol");selTab("sol","f_space",true)}catch(e){}};
    const d=el.querySelector(".solmore");if(d)d.addEventListener("toggle",()=>{SOLOPEN=d.open})}
  /* 2.4.9: «Palabras y expresiones que conviene saber» va al final del resumen, después del Sol */
  try{const g=document.getElementById("glos"),gd=g&&g.closest("details");if(gd&&!gd.classList.contains("glosw")){document.querySelectorAll("details.glosw").forEach(x=>x.remove());gd.classList.add("glosw");el.insertAdjacentElement("afterend",gd);if(!REF)REF=refHTML();gd.insertAdjacentHTML("beforeend",REF)}}catch(e){}}
function hook(){const o=window.renderEasyS;if(typeof o!=="function"||o.__sol)return false;const w=function(){const r=o.apply(this,arguments);try{render()}catch(e){}return r};w.__sol=1;window.renderEasyS=w;return true}
function boot(){let n=0;const t=setInterval(()=>{if(hook()||++n>75){clearInterval(t);try{render()}catch(e){}}},200)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
