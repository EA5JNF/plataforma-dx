/* ---- ACRACB 2.10.12: panel «Sol y propagación ahora», al estilo de los paneles clásicos de radioaficionado ----
   Arriba del todo en Ahora (la página principal) y en Sol, antes de las pestañas. Plegado, la línea del título ya
   resume lo esencial; desplegado, tres columnas (Sol, VHF y HF) y cada dato con una frase sencilla que dice qué
   significa. Datos de las fuentes de la plataforma (NOAA SWPC, SILSO, GFZ) y de su modelo para tu estación. */
(function(){
"use strict";
if(window.__hkSterr)return;window.__hkSterr=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nf=(v,d)=>v==null||!isFinite(v)?"—":(+v).toFixed(d).replace(".",EN()?".":",");
const OPEN={};try{Object.assign(OPEN,JSON.parse(localStorage.getItem("acracb_stopen")||"{}"))}catch(e){}
const sfiM=v=>v==null?["n","—"]:v>=150?["g",T("muy alto: 15, 12 y 10 m abren bien de día","very high: 15, 12 and 10 m open well by day")]:v>=110?["g",T("alto: 15, 12 y 10 m abren de día","high: 15, 12 and 10 m open by day")]:v>=90?["y",T("medio: 10 m abre poco; 20 a 15 m, bien","medium: 10 m opens little; 20 to 15 m, well")]:["r",T("bajo: bandas altas casi cerradas","low: high bands nearly closed")];
const ssnM=v=>v==null?["n","—"]:v>=100?["g",T("Sol muy activo","very active Sun")]:v>=50?["g",T("Sol activo","active Sun")]:v>=20?["y",T("Sol poco activo","quiet Sun")]:["r",T("Sol casi sin manchas","Sun almost spotless")];
const aM=v=>v==null?["n","—"]:v<8?["g",T("últimas 24 h muy tranquilas","very quiet last 24 h")]:v<16?["g",T("últimas 24 h tranquilas","quiet last 24 h")]:v<30?["y",T("últimas 24 h algo agitadas","somewhat unsettled last 24 h")]:["r",T("tormenta en las últimas 24 h","storm in the last 24 h")];
const kpM=v=>v==null?["n","—"]:v<2?["g",T("muy tranquilo: buenas señales","very quiet: good signals")]:v<3?["g",T("tranquilo","quiet")]:v<4?["y",T("inestable: algo de desvanecimiento","unsettled: some fading")]:v<5?["y",T("activo: peor en rutas polares","active: worse on polar paths")]:["r",T("tormenta: HF degradada","storm: HF degraded")];
const xrM=x=>{const s=String(x||"");return !s?["n","—"]:/^X/.test(s)?["r",T("llamarada fuerte: cortes de HF de día","strong flare: HF blackouts by day")]:/^M/.test(s)?["y",T("llamarada media: puede cortar la HF de día unos minutos","medium flare: may cut daytime HF for minutes")]:/^C/.test(s)?["g",T("actividad baja: sin cortes","low activity: no blackouts")]:["g",T("tranquilo: sin cortes","quiet: no blackouts")]};
const wM=v=>v==null?["n","—"]:v<400?["g",T("lento: normal","slow: normal")]:v<500?["g",T("normal","normal")]:v<600?["y",T("algo rápido: puede agitar el campo","somewhat fast: may unsettle the field")]:["r",T("rápido: riesgo de tormenta","fast: storm risk")];
const bzM=v=>v==null?["n","—"]:v>=-2?["g",T("hacia el norte o neutro: protege","northward or neutral: protective")]:v>=-8?["y",T("hacia el sur: puede agitar el campo","southward: may unsettle the field")]:["r",T("muy al sur: favorece tormentas","strongly southward: favors storms")];
const prM=s=>/S[1-9]/.test(s||"")?["r",T("tormenta de protones: mala HF en rutas polares","proton storm: poor HF on polar paths")]:["g",T("normal","normal")];
const nzM=kp=>kp==null?"—":kp<2?"S0–S1":kp<3?"S1–S2":kp<4?"S2–S3":kp<5?"S3–S4":kp<6?"S4–S6":"S6–S9";
function hf(){const out=[];try{const pairs=[["80 m","40 m"],["30 m","20 m"],["17 m","15 m"],["12 m","10 m"]];const idx=n=>BANDS.findIndex(x=>String(x).replace(/\s/g,"")===n.replace(/\s/g,""));const TGs=TG();
  const q=(b,lh)=>{let n=0;for(const t of TGs)if(prob(t,lh,b).p>=.3)n++;return n/TGs.length};
  for(const [a,b] of pairs){const ia=idx(a),ib=idx(b);if(ia<0||ib<0)continue;const d=Math.max(q(ia,13),q(ib,13)),n=Math.max(q(ia,1),q(ib,1));
    const lv=f=>f>=.25?["g",T("buena","good")]:f>=.08?["y",T("regular","fair")]:["r",T("mala","poor")];out.push([a.replace(/\s*m$/,"")+"–"+b.replace(/\s*m$/,""),lv(d),lv(n)])}}catch(e){}return out}
function vhf(){try{const s=window.ACRACB_vuhf&&ACRACB_vuhf.state();if(!s)return [];const es6=s.es.cl.find(([b,c])=>b==="6"&&c.you),es2=s.es.cl.find(([b,c])=>b==="2"&&c.you);
  const L3=(l,o,n,c)=>l==="g"?["g",o]:l==="y"?["y",n]:["r",c];
  return [[T("Esporádica E 6 m","Sporadic E 6 m"),es6?["g",T("abierta","open")]:s.es.cl.some(([b])=>b==="6")?["y",T("en Europa, lejos de ti","in Europe, away from you")]:["r",T("cerrada","closed")]],
   [T("Esporádica E 2 m","Sporadic E 2 m"),es2?["g",T("abierta","open")]:s.es.cl.some(([b])=>b==="2")?["y",T("en Europa, lejos de ti","in Europe, away from you")]:["r",T("cerrada","closed")]],
   [T("Aurora","Aurora"),L3(s.au.l,T("posible: apunta al norte","possible: aim north"),T("podría llegar","could come"),T("no ahora","not now"))],
   [T("Tropo (2 m y 70 cm)","Tropo (2 m and 70 cm)"),s.tro.l==="n"?["n",T("ábrela en V-UHF para calcularla","open it in V-UHF to calculate")]:L3(s.tro.l,T("conductos: llega lejos","ducts: reaches far"),T("algo mejor de lo normal","somewhat better than usual"),T("normal","normal"))],
   [T("Meteoros","Meteors"),L3(s.ms.l,T("buen momento","good time"),T("posible","possible"),T("poca actividad","little activity"))],
   [T("Rebote lunar","Moonbounce"),L3(s.eme.l,T("Luna alta","Moon high"),T("Luna baja","Moon low"),T("Luna bajo el horizonte","Moon below horizon"))]]}catch(e){return []}}
function head(){if(typeof L==="undefined"||!L)return T("Sol y propagación ahora","Sun and propagation now");const kp=L.kp!=null?+L.kp:null;const H=hf();const best=H.filter(x=>x[1][0]==="g").map(x=>x[0]+" m");
  return `<span class="sth-t">${T("Sol y propagación ahora","Sun and propagation now")}</span> <span class="sth-s">SFI <b>${nf(L.sfi,0)}</b> · Kp <b>${nf(kp,0)}</b> · ${best.length?T(`de día, buenas ${best.join(" y ")}`,`by day, good ${best.join(" and ")}`):T("HF floja","HF weak")}</span>`}
function body(){if(typeof L==="undefined"||!L)return "";const sp=L.space||{};const kp=L.kp!=null?+L.kp:null;
  const row=(k,v,m)=>`<div class="st3r"><span class="st3k">${k}</span><b class="st3v st-${m[0]}">${v}</b><span class="st3m">${m[1]}</span></div>`;
  const sun=[row(T("Flujo solar","Solar flux"),nf(L.sfi,0),sfiM(L.sfi)),row(T("Manchas solares","Sunspots"),nf(sp.ssn,0),ssnM(sp.ssn)),row(T("Índice A","A index"),nf(sp.a,0),aM(sp.a)),row(T("Índice K","K index"),nf(kp,0),kpM(kp)),
    row(T("Rayos X","X-rays"),e2(sp.xray||"—"),xrM(sp.xray)),row(T("Viento solar","Solar wind"),L.wind!=null?nf(L.wind,0)+" km/s":"—",wM(L.wind)),row("Bz",L.bz!=null?nf(L.bz,1)+" nT":"—",bzM(L.bz)),
    row(T("Protones","Protons"),e2(String(sp.proton||"—").split(" ")[0]),prM(sp.proton)),row(T("Ruido geomagnético","Geomagnetic noise"),nzM(kp),["n",T("orientativo, según el Kp","a guide, from Kp")])].join("");
  const V=vhf().map(([k,m])=>`<div class="st3r st3r2"><span class="st3k">${k}</span><b class="st3v st-${m[0]}">${m[1]}</b></div>`).join("");
  const H=hf();const hfT=`<div class="st3h"><span>${T("Bandas","Bands")}</span><span>${T("De día","By day")}</span><span>${T("De noche","At night")}</span></div>`+H.map(([b,d,n])=>`<div class="st3h st3hr"><span>${b} m</span><b class="st-${d[0]}">${d[1]}</b><b class="st-${n[0]}">${n[1]}</b></div>`).join("");
  return `<div class="st3"><section><h4>${T("Sol y campo magnético","Sun and magnetic field")}</h4>${sun}</section><section><h4>VHF ${T("y superiores","and up")}</h4>${V}</section><section><h4>HF ${T("para tu estación","for your station")}</h4>${hfT}<p class="st3n">${T("Buena: muchos destinos al alcance. Regular: algunos. Mala: casi ninguno.","Good: many destinations in reach. Fair: some. Poor: almost none.")}</p></section></div>
   <p class="note">${T("Datos de NOAA SWPC, SILSO y GFZ Potsdam; HF calculada para tu estación (de día a las 13 h y de noche a la 1 h); VHF, del panel de aperturas especiales.","Data from NOAA SWPC, SILSO and GFZ Potsdam; HF calculated for your station (day at 13:00, night at 01:00); VHF from the special openings panel.")} ${T("Actualizado","Updated")}: ${e2(L.updated||"")}.</p>`}
function mk(id){const d=document.createElement("details");d.className="sterr";d.id=id;d.innerHTML=`<summary></summary><div class="stb"></div>`;
  if(OPEN[id])d.open=true;d.addEventListener("toggle",()=>{OPEN[id]=d.open;try{localStorage.setItem("acracb_stopen",JSON.stringify(OPEN))}catch(e){}if(d.open)fill(d)});return d}
function fill(d){const s=d.querySelector("summary");if(s)s.innerHTML=head();if(d.open){const b=d.querySelector(".stb");if(b)b.innerHTML=body()}}
function place(){[["st_ahora","ahora"],["st_sol","sol"]].forEach(([id,pg])=>{const sec=document.querySelector(`section.page[data-pg="${pg}"]`);if(!sec)return;let d=document.getElementById(id);if(!d)d=mk(id);if(sec.firstElementChild!==d)sec.insertBefore(d,sec.firstChild);fill(d)})}
window.ACRACB_afterDraw=window.ACRACB_afterDraw||[];window.ACRACB_afterDraw.push(()=>{try{place()}catch(e){}});
function boot(){if(!document.querySelector('section.page[data-pg="sol"]'))return setTimeout(boot,500);place();setInterval(()=>{if(!document.hidden)try{place()}catch(e){}},60000)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
