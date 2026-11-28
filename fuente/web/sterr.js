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
/* 2.10.34: HF con el MISMO cálculo que el Resumen de Ahora: destinos de tu modo con al menos un 30 % de probabilidad
   (paso corto o largo), en las bandas de tus antenas. Así el panel y el Resumen nunca se contradicen. */
function bandN(b,lh){return memo("stbn|"+b+"|"+lh+"|"+MOD()+"|"+st.mode,()=>{let n=0;for(const t of TG().filter(inMode)){const p=Math.max(prob(t,lh,b,false).p,prob(t,lh,b,true).p);if(p>=.3)n++}return n})}
function lvN(n){return n>=40?["g",T(`${n} destinos`,`${n} destinations`)]:n>=10?["y",T(`${n} destinos`,`${n} destinations`)]:n>0?["o",T(`${n} destino${n===1?"":"s"}`,`${n} destination${n===1?"":"s"}`)]:["r",T("cerrada","closed")]}
function hf(){const out=[];try{let now=12;try{now=localNow()}catch(_){}const bs=BI().filter(b=>b<10).sort((a,b)=>MHZ[a]-MHZ[b]);
  for(const b of bs)out.push([BANDS[b],lvN(bandN(b,now)),lvN(bandN(b,13)),lvN(bandN(b,1)),bandN(b,now),b,bandN(b,13),bandN(b,1)])}catch(e){}return out}
function vhf(){try{const s=window.ACRACB_vuhf&&ACRACB_vuhf.state();if(!s)return [];const es6=s.es.cl.find(([b,c])=>b==="6"&&c.you),es2=s.es.cl.find(([b,c])=>b==="2"&&c.you);
  const L3=(l,o,n,c)=>l==="g"?["g",o]:l==="y"?["y",n]:["r",c];
  return [[T("Esporádica E 6 m","Sporadic E 6 m"),es6?["g",T("abierta","open")]:s.es.cl.some(([b])=>b==="6")?["y",T("en Europa, lejos de ti","in Europe, away from you")]:["r",T("cerrada","closed")]],
   [T("Esporádica E 2 m","Sporadic E 2 m"),es2?["g",T("abierta","open")]:s.es.cl.some(([b])=>b==="2")?["y",T("en Europa, lejos de ti","in Europe, away from you")]:["r",T("cerrada","closed")]],
   [T("Aurora","Aurora"),L3(s.au.l,T("posible: apunta al norte","possible: aim north"),T("podría llegar","could come"),T("no ahora","not now"))],
   [T("Tropo (2 m y 70 cm)","Tropo (2 m and 70 cm)"),s.tro.l==="n"?["n",T("ábrela en V-UHF para calcularla","open it in V-UHF to calculate")]:L3(s.tro.l,T("conductos: llega lejos","ducts: reaches far"),T("algo mejor de lo normal","somewhat better than usual"),T("normal","normal"))],
   [T("Meteoros","Meteors"),L3(s.ms.l,T("buen momento","good time"),T("posible","possible"),T("poca actividad","little activity"))],
   [T("Rebote lunar","Moonbounce"),L3(s.eme.l,T("Luna alta","Moon high"),T("Luna baja","Moon low"),T("Luna bajo el horizonte","Moon below horizon"))]]}catch(e){return []}}
function storms(){const sp=L.space||{};const kp=L.kp!=null?+L.kp:null;
  const g=kp==null?null:kp>=9?5:kp>=8?4:kp>=7?3:kp>=6?2:kp>=5?1:0;
  const xm=String(sp.xray||"").match(/^([ABCMX])\s*([\d.]+)/);let r=null;if(xm){const v=+xm[2];r=xm[1]==="X"?(v>=20?5:v>=10?4:3):xm[1]==="M"?(v>=5?2:1):0}
  const pm=String(sp.proton||"").match(/S\s*([0-5])/);const sv=pm?+pm[1]:null;
  return {g,r,s:sv}}
function stM(k,n){if(n==null)return ["n","—"];if(!n)return ["g",T("no hay","none")];
  const lv=[0,T("menor","minor"),T("moderada","moderate"),T("fuerte","strong"),T("severa","severe"),T("extrema","extreme")][n];
  const ef={g:T("bandas bajas y rutas polares peor","low bands and polar paths worse"),r:T("de día, bandas bajas mudas un rato","by day, low bands silent for a while"),s:T("rutas polares cortadas","polar paths cut")}[k];
  return [n>=3?"r":"y",`${lv}: ${ef}`]}
function head(){if(typeof L==="undefined"||!L)return T("Sol y propagación ahora","Sun and propagation now");const kp=L.kp!=null?+L.kp:null;const H=hf();/* la mejor banda es la misma que elige el Resumen (la que más suma, no solo la que más destinos tiene) */let top=null;try{let now=12;try{now=localNow()}catch(_){}const e=easyAt(now);if(e)top=[BANDS[e.b],null,null,null,e.ts.length]}catch(_){}
  return `<span class="sth-t">${T("Sol y propagación ahora","Sun and propagation now")}</span> <span class="sth-s"><span class="stdup">SFI <b>${nf(L.sfi,0)}</b> · Kp <b>${nf(kp,0)}</b> · </span>${(()=>{const S=storms();const a=[];if(S.g)a.push("G"+S.g);if(S.r)a.push("R"+S.r);if(S.s)a.push("S"+S.s);return a.length?`<b class="st-r">${T("tormenta","storm")} ${a.join(" ")}</b>`:T("sin tormentas","no storms")})()} · ${top&&top[4]>0?T(`ahora, mejor ${top[0]} (${top[4]} destinos)`,`now, best ${top[0]} (${top[4]} destinations)`):(window.ACRACB_hubLoading&&ACRACB_hubLoading())?T("calculando la previsión de tu zona…","calculating the forecast for your area…"):T("HF cerrada ahora","HF closed now")}</span>`}
function body(){if(typeof L==="undefined"||!L)return "";const sp=L.space||{};const kp=L.kp!=null?+L.kp:null;
  const row=(k,v,m)=>`<div class="st3r"><span class="st3k">${k}</span><b class="st3v st-${m[0]}">${v}</b><span class="st3m">${m[1]}</span></div>`;
  const S=storms(),stv=(c,n)=>n==null?"—":c+n;const sun=[row(T("Tormenta geomagnética","Geomagnetic storm"),stv("G",S.g),stM("g",S.g)),row(T("Apagón de radio","Radio blackout"),stv("R",S.r),stM("r",S.r)),row(T("Tormenta de protones","Proton storm"),stv("S",S.s),stM("s",S.s)),row(T("Flujo solar","Solar flux"),nf(L.sfi,0),sfiM(L.sfi)),row(T("Manchas solares","Sunspots"),nf(sp.ssn,0),ssnM(sp.ssn)),row(T("Índice A","A index"),nf(sp.a,0),aM(sp.a)),row(T("Índice K","K index"),nf(kp,0),kpM(kp)),
    row(T("Rayos X","X-rays"),e2(sp.xray||"—"),xrM(sp.xray)),row(T("Viento solar","Solar wind"),L.wind!=null?nf(L.wind,0)+" km/s":"—",wM(L.wind)),row("Bz",L.bz!=null?nf(L.bz,1)+" nT":"—",bzM(L.bz)),(()=>{const io=L.iono;if(!io||io.fof2==null)return "";const mu=io.mufd!=null?+io.mufd:null;return row(T("Ionosonda","Ionosonde")+(io.station?` <small>${e2(String(io.station).replace(/\s*\(.*\)$/,""))}</small>`:""),"foF2 "+nf(io.fof2,1)+" MHz"+(mu!=null?" · MUF "+nf(mu,1)+" MHz":""),[mu==null?"n":mu>=28?"g":mu>=14?"y":"r",mu==null?T("medida real de la ionosfera","real measurement of the ionosphere"):T(`medida real: a 3.000 km rebota hasta ${nf(mu,0)} MHz`,`real measurement: up to ${nf(mu,0)} MHz bounces at 3,000 km`)])})(),
    row(T("Ruido geomagnético","Geomagnetic noise"),nzM(kp),["n",T("orientativo, según el Kp","a guide, from Kp")])];
  /* 2.10.19: cada fenómeno de VHF con una línea que explica qué es, como el resto del panel */
  const VQ=[T("nubes ionizadas a 100 km: saltos de 500 a 2.000 km","ionised clouds at 100 km: hops of 500 to 2,000 km"),T("lo mismo en 2 m: rara y corta, de 1.000 a 2.200 km","the same on 2 m: rare and brief, 1,000 to 2,200 km"),T("rebote en la aurora: señal ronca, apuntando al norte","reflection off the aurora: raspy signal, aim north"),T("inversión de temperatura: cientos de km o más","temperature inversion: hundreds of km or more"),T("rebote en estelas de meteoros, en ráfagas de segundos","bounce off meteor trails, in bursts of seconds"),T("QSO rebotando en la Luna: hace falta la Luna alta","QSO off the Moon: needs the Moon high")];
  const V=vhf().map(([k,m],i)=>`<div class="st3r"><span class="st3k">${k}</span><b class="st3v st3vt st-${m[0]}">${m[1]}</b>${VQ[i]?`<span class="st3m">${VQ[i]}</span>`:""}</div>`).join("");
  /* 2.11.47: «HF para tu estación» más clara: para qué sirve en una línea, columnas con nombre (ahora, de día, de noche)
     y la mejor banda de ahora marcada, para comparar de un vistazo qué bandas abren de día y cuáles de noche */
  const H=hf();let nowH=12;try{nowH=Math.round(localNow())%24}catch(_){}
  const num=x=>String(x).replace(/\s*(destinos?|destinations?)$/i,"");
  /* 2.11.68: «la mejor» de la tabla es la misma banda que dicen la frase de arriba y la barra (no solo la de más destinos) */
  let best=H.reduce((m,r)=>r[4]>(m?m[4]:0)?r:m,null);try{const e=easyAt(localNow());const z=e&&H.find(r=>r[5]===e.b&&r[4]>0);if(z)best=z}catch(_){}
  const hfI=`<p class="st3n st3i">${T("Cuántos destinos puedes trabajar en cada banda con tu antena, tu potencia y tu modo (al menos un 30 % de fiabilidad). Sirve para elegir banda ahora y para ver cuáles se abren de noche y cuáles de día.","How many destinations you can work on each band with your antenna, power and mode (at least 30% reliability). Use it to pick a band now and to see which bands open at night and which by day.")}</p>`;
  /* 2.11.49: lo que se lee primero son tres frases: la mejor banda ahora, esta noche y mañana, y las otras abiertas;
     la tabla por bandas queda plegada debajo para quien quiera el detalle */
  const lst=a=>{if(a.length<2)return a.join("");const y=T(" y "," and ");return a.slice(0,-1).join(", ")+y+a[a.length-1]};
  const mom=(lab,hr,i)=>{const r=H.filter(x=>x[i]>0).sort((p,q)=>q[i]-p[i]);if(!r.length)return `<p class="hfm"><b>${lab}</b> <span class="hfh">${hr}</span>: ${T("todo cerrado o casi.","everything closed or nearly.")}</p>`;
    let top=r[0];try{const hh=i===4?localNow():i===6?13:1,e=easyAt(hh);const z=e&&r.find(x=>x[5]===e.b);if(z)top=z}catch(_){}/* la misma «mejor» que la barra de arriba */const more=H.filter(x=>x!==top&&x[i]>=40).map(x=>x[0].replace(/\s*m$/,""));
    return `<p class="hfm"><b>${lab}</b> <span class="hfh">${hr}</span>: ${T("mejor","best")} <b class="st-g">${top[0]}</b>${more.length?`; ${T("también","also")} ${lst(more)} m`:""}.</p>`};
  const hfS=`<div class="hfsum">${mom(T("Ahora","Now"),T(`${nowH} h`,`${nowH}:00`),4)}${(()=>{const a=mom(nowH<13?T("Hoy, de día","Today, by day"):T("Mañana, de día","Tomorrow, by day"),T("13 h","1 pm"),6),b=mom(nowH<1?T("Hoy, de noche","Tonight"):T("Esta noche","Tonight"),T("1 h","1 am"),7);const x13=((13-nowH)%24+24)%24||24,x1=((1-nowH)%24+24)%24||24;return x1<x13?b+a:a+b})()}</div>`;
  /* 2.11.68: columnas por orden de hora (ahora, y después la 1 h o las 13 h según cuál llegue antes) y como mapa de calor:
     cada casilla con su número de destinos y un fondo más intenso cuantos más hay; una banda cerrada es un «—» discreto,
     en vez de la palabra «cerrada» en rojo repetida por toda la tabla */
  const d13=((13-nowH)%24+24)%24||24,d1=((1-nowH)%24+24)%24||24;
  const C13={lab:nowH<13?T("Hoy","Today"):T("Mañana","Tomorrow"),sub:T("13 h, de día","1 pm, daytime"),k:6},C1={lab:nowH<1?T("Hoy","Today"):T("Esta noche","Tonight"),sub:T("1 h, de noche","1 am, night"),k:7};
  const COLS=[{lab:T("Ahora","Now"),sub:T(`${nowH} h`,`${nowH}:00`),k:4}].concat(d1<d13?[C1,C13]:[C13,C1]);
  const MX=Math.max(1,...H.map(r=>Math.max(r[4]||0,r[6]||0,r[7]||0)));
  const cell=v=>{v=v||0;if(v<=0)return `<span class="hmc hm0" title="${T("cerrada","closed")}">—</span>`;const a=Math.round(14+66*Math.sqrt(v/MX));return `<span class="hmc${v>=40?" hmg":v>=10?" hmy":" hmo"}" style="--hm:${a}%">${v}</span>`};
  const hfT0=`<div class="hmt"><div class="hmr hmh"><span>${T("Banda","Band")}</span>${COLS.map(c=>`<span>${c.lab}<small>${c.sub}</small></span>`).join("")}</div>`+H.map(r=>{const bb=best&&r===best&&r[4]>0;return `<div class="hmr${bb?" hmbest":""}"><span class="hmb">${r[0]}${bb?`<small>${T("la mejor ahora","best now")}</small>`:""}</span>${COLS.map(c=>cell(r[c.k])).join("")}</div>`}).join("")+`</div><p class="st3n st3u">${T("Destinos al alcance en cada banda a esa hora; cuanto más intenso el color, más destinos. «—»: cerrada.","Destinations within reach on each band at that hour; the stronger the color, the more destinations. «—»: closed.")}</p>`;
  const hfT=hfS+`<details class="hfdet"><summary>${T("Ver el detalle por banda","See the detail by band")}</summary>${hfT0.replace(hfI,"")}</details>`;
  /* 2.10.19: cinco bloques que se reparten solos en columnas de altura parecida (antes quedaban columnas medio vacías) */
  const G=ix=>ix.map(i=>sun[i]).join("");
  return `<div class="st3"><section><h4>HF ${T("para tu estación","for your station")}</h4>${hfT}<p class="st3n">${T("Mismo cálculo que el Resumen de Ahora. Horas locales. Para ver qué países hay detrás de cada número, abre Ahora → Bandas.","Same calculation as the Now summary. Local times. To see which countries are behind each number, open Now → Bands.")}</p></section><section><h4>${T("Tormentas ahora","Storms now")}</h4>${G([0,1,2])}</section><section><h4>${T("Campo magnético","Magnetic field")}</h4>${G([5,6,8,9,11])}</section><section><h4>${T("Sol","Sun")}</h4>${G([3,4,7,10])}</section><section><h4>VHF ${T("y superiores","and up")}</h4>${V}</section></div>
   <p class="note">${T("Datos de NOAA SWPC, SILSO y GFZ Potsdam; HF calculada para tu estación ahora, a las 13 h y a la 1 h; VHF, del panel de aperturas especiales.","Data from NOAA SWPC, SILSO and GFZ Potsdam; HF calculated for your station now, at 1 pm and at 1 am; VHF from the special openings panel.")} ${T("Actualizado","Updated")}: ${e2(L.updated||"")}.</p>`}
function mk(id){const d=document.createElement("details");d.className="sterr";d.id=id;d.innerHTML=`<summary></summary><div class="stb"></div>`;
  if(OPEN[id])d.open=true;d.addEventListener("toggle",()=>{OPEN[id]=d.open;try{localStorage.setItem("acracb_stopen",JSON.stringify(OPEN))}catch(e){}if(d.open)fill(d)});return d}
/* 2.11.52: al refrescar no se pisa lo que ya está igual, y «Ver el detalle por banda» se queda abierto si lo abriste */
function put(el,h){if(!el)return;const dt=el.querySelector(".hfdet"),op=!!(dt&&dt.open);if(el.__h===h)return;el.__h=h;el.innerHTML=h;if(op){const n=el.querySelector(".hfdet");if(n)n.open=true}}
function fill(d){const s=d.querySelector("summary");if(s)s.innerHTML=head();if(d.open){put(d.querySelector(".stb"),body())}}
function place(){const sw=document.getElementById("sw");if(sw){let d=document.getElementById("st_ahora");if(!d)d=mk("st_ahora");if(sw.nextElementSibling!==d)sw.after(d);fill(d)}const old=document.getElementById("st_sol");if(old)old.remove();
  const pb=document.getElementById("propbox");if(pb){put(pb,body());const fs=document.getElementById("s_prop");if(fs)fs.innerHTML=head().replace(/^<span class="sth-t">[^<]*<\/span> /,"")}}
window.ACRACB_afterDraw=window.ACRACB_afterDraw||[];window.ACRACB_afterDraw.push(()=>{try{place()}catch(e){}});
function boot(){if(!document.querySelector('section.page[data-pg="sol"]'))return setTimeout(boot,500);place();setInterval(()=>{if(!document.hidden)try{place()}catch(e){}},15000);
  /* 2.11.18: la cabecera se rehace también en cuanto llega la previsión de la zona o termina una actualización,
     sin esperar al siguiente repaso */
  window.ACRACB_stPlace=()=>{try{place()}catch(e){}};document.addEventListener("visibilitychange",()=>{if(!document.hidden)window.ACRACB_stPlace()})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
