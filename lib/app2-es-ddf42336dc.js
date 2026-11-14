
/* ---- ACRACB: tema, textos plegados, entidades y log (común a todas las versiones) ---- */
/* 2.4.1: solo cuentan los cambios de contenido real; el reloj y el mapa no despiertan a los observadores */
window.ACRACB_mut=ms=>ms.some(m=>!(m.target instanceof SVGElement)&&!/^ck[uls]$/.test(m.target.id||""));
(function(){
"use strict";
const $=id=>document.getElementById(id);
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
/* ---------- al abrir, la página empieza siempre arriba, con la cabecera a la vista ---------- */
try{if("scrollRestoration" in history)history.scrollRestoration="manual"}catch(e){}
let touched=false;["touchstart","wheel","keydown","mousedown"].forEach(ev=>addEventListener(ev,()=>{touched=true},{once:true,passive:true}));
function toTop(){[0,200,600,1200,2500].forEach(t=>setTimeout(()=>{if(!touched&&scrollY>0)scrollTo(0,0)},t))}
toTop();addEventListener("pageshow",()=>{touched=false;toTop()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&scrollY<400){touched=false;toTop()}});
/* ---------- tema claro / oscuro ---------- */
function setTheme(t,save){document.documentElement.setAttribute("data-theme",t);
  const b=$("thbtn");if(b){b.setAttribute("aria-label",t==="light"?"Cambiar a modo oscuro":"Cambiar a modo claro");b.title=b.getAttribute("aria-label")}
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#ffffff":"#0a0e13");
  try{if(typeof BC!=="undefined"&&Array.isArray(BC)){const cs=getComputedStyle(document.documentElement);const v=["--b160","--b80","--b40","--b20","--b17","--b15","--b12","--b10","--b60","--b30","--b6","--b2","--b70"].map(x=>cs.getPropertyValue(x).trim());if(v[0])BC.splice(0,BC.length,...v)}}catch(e){}
  if(save){try{if(typeof refresh==="function")refresh()}catch(e){}}}
/* 2.4.1: tema automático según el sol en tu locator: claro de día y oscuro de noche (el sol a más de 3° bajo el horizonte).
   El botón cambia a mano y esa elección dura hasta el siguiente amanecer o anochecer; luego vuelve a lo automático. */
const TR=Math.PI/180;
function sunElev(p,t){const d=(t/864e5)+2440587.5-2451545.0;const g=(357.529+0.98560028*d)*TR,q=280.459+0.98564736*d;const Lr=(q+1.915*Math.sin(g)+0.020*Math.sin(2*g))*TR,e=(23.439-0.00000036*d)*TR;
  const ra=Math.atan2(Math.cos(e)*Math.sin(Lr),Math.cos(Lr)),dec=Math.asin(Math.sin(e)*Math.sin(Lr));const gm=((18.697374558+24.06570982441908*d)%24+24)%24;const ha=(gm*15+p[0])*TR-ra,la=p[1]*TR;
  return Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(ha))/TR}
function qthPos(){try{if(typeof TXP!=="undefined"&&TXP&&isFinite(TXP[0]))return TXP}catch(e){}try{const g=String(S.get("acracb_loc")||"").toUpperCase();if(/^[A-R]{2}\d{2}/.test(g)){const lon=(g.charCodeAt(0)-65)*20-180+(+g[2])*2+1,lat=(g.charCodeAt(1)-65)*10-90+(+g[3])+.5;return [lon,lat]}}catch(e){}return [-0.5,38.4]}
const isDay=t=>sunElev(qthPos(),t)>-3;
function nextChange(t){const d0=isDay(t);for(let x=t+6e4;x<t+864e5;x+=6e4)if(isDay(x)!==d0)return x;return t+864e5}
function themeNow(){const now=Date.now();try{const m=JSON.parse(S.get("acracb_theme_manual")||"null");if(m&&(m.t==="light"||m.t==="dark")&&now<m.until)return m.t}catch(e){}return isDay(now)?"light":"dark"}
try{if(S.get("acracb_theme")){S.del?S.del("acracb_theme"):localStorage.removeItem("acracb_theme")}}catch(e){}
setTheme(themeNow(),false);window.ACRACB_theme={isDay,qthPos,nextChange,themeNow};
setInterval(()=>{if(document.visibilityState!=="visible")return;const t=themeNow();if(document.documentElement.getAttribute("data-theme")!==t)setTheme(t,true)},60000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){const t=themeNow();if(document.documentElement.getAttribute("data-theme")!==t)setTheme(t,true)}});
function themeBtn(){if($("thbtn"))return;const ck=document.querySelector(".brow1 .clock")||document.querySelector(".brow1");if(!ck)return;
  const b=document.createElement("button");b.id="thbtn";b.className="thbtn";b.type="button";
  b.innerHTML='<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
  b.onclick=()=>{const t=document.documentElement.getAttribute("data-theme")==="light"?"dark":"light";try{S.set("acracb_theme_manual",JSON.stringify({t,until:nextChange(Date.now())}))}catch(e){}setTheme(t,true)};ck.appendChild(b);setTheme(document.documentElement.getAttribute("data-theme"),false)}
/* ---------- textos largos: se ve un resumen y se despliega al tocar ---------- */
const LIM=260;let CT=null;const OPENED=new Set();const ckey=el=>(el.textContent||"").trim().slice(0,48);
function clampAll(){CT=null;try{longVals();glue()}catch(e){}document.querySelectorAll(".page p, .page .note, .page .w").forEach(el=>{
  if(el.dataset.cl||el.closest("summary,.sp,.chip,.dx,button,.mpop,.srcrep,.kv,td,th,.tl,.tlh,.drop,.goal,.srcg,#heardbox,#qrpbox,.notifw,#metnote,#space")||el.id==="updst")return;
  const d=el.closest("details");if(d&&!d.classList.contains("fold"))return;
  if((el.textContent||"").trim().length<LIM)return;el.dataset.cl="1";el.classList.add("clamp");if(OPENED.has(ckey(el))){el.classList.add("open");el.title=""}else el.title=window.ACRACB_LANG==="en"?"Tap to read it all":"Toca para leer todo"})}
document.addEventListener("click",ev=>{const el=ev.target.closest(".clamp");if(!el||ev.target.closest("a,button,input,select,.cs"))return;el.classList.toggle("open");const op=el.classList.contains("open");if(op)OPENED.add(ckey(el));else OPENED.delete(ckey(el));el.title=op?"":(window.ACRACB_LANG==="en"?"Tap to read it all":"Toca para leer todo")},true);
new MutationObserver(ms=>{if(!CT&&window.ACRACB_mut(ms))CT=setTimeout(clampAll,120)}).observe(document.documentElement,{childList:true,subtree:true});
/* ---------- nombres de entidad cuando el dato llega solo con el número DXCC ---------- */
const MESX={ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11,jan:0,apr:3,aug:7,dec:11};
function dxVigente(d){let m=String(d.until||"").toLowerCase().match(/(\d{1,2})\s*([a-zñ]{3})/);if(!m){const k=String(d.until||"").toLowerCase().match(/([a-z]{3})[a-z]*\.?\s*(\d{1,2})/);if(k)m=[k[0],k[2],k[1]]}if(!m||MESX[m[2]]==null)return true;const now=new Date(),y=now.getFullYear();
  let t=new Date(y,MESX[m[2]],+m[1],23,59);if(t-now<-180*864e5)t=new Date(y+1,MESX[m[2]],+m[1],23,59);return t>=now}
function longVals(){document.querySelectorAll(".chip .v").forEach(v=>{const l=(v.textContent||"").trim().length>12;if(v.classList.contains("vlong")!==l)v.classList.toggle("vlong",l)});
  document.querySelectorAll(".caltab td:nth-child(3)").forEach(td=>{if(td.dataset.wb||td.children.length)return;td.dataset.wb="1";if(td.textContent.trim().length>7){td.classList.add("mlong");td.textContent=td.textContent.replace(/\//g,"/\u200b")}})}
/* cifra y unidad siempre juntas: «00:14 UTC», «7935 km», «92 %» no se parten en dos líneas */
const UNI=/(\d) (UTC|km|%|MHz|kHz|nT|km\/s|dB|W)(?![\w])/g;
function glue(root){const w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.indexOf(" ")>=0&&/\d (UTC|km|%|MHz|kHz|nT|dB|W)/.test(n.nodeValue)&&!n.parentElement.closest("script,style,textarea,input,select,option")?1:3});
  const ns=[];while(w.nextNode())ns.push(w.currentNode);ns.forEach(n=>{const v=n.nodeValue.replace(UNI,"$1\u00a0$2");if(v!==n.nodeValue)n.nodeValue=v})}
window.ACRACB_normEnt=function(){try{if(Array.isArray(L.dx))L.dx=L.dx.filter(dxVigente);(L.dx||[]).forEach(d=>{if(!d.ent){d.ent=(d.dxcc&&dxName(d.dxcc))||((callEnt(d.call)||{}).name)||""}});(L.heard||[]).forEach(h=>{if(!h.ent&&h.dxcc)h.ent=dxName(h.dxcc)})}catch(e){}};
/* ---------- log ADIF: solo en este dispositivo ---------- */
function loadLog(){try{const s=S.get("db_owner/log");if(s){LOG=JSON.parse(s);CACHE.clear()}}catch(e){}}
window.ACRACB_goals=function(){if(typeof LOG==="undefined"||!LOG)return "";const need=dx=>{const e=LOG.e[dx];return !(e&&Object.values(e).includes("C"))};
  const needB=(dx,b)=>{const e=LOG.e[dx];return !(e&&e[BKEY[b]]==="C")};
  const MESI={ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11,jan:0,apr:3,aug:7,dec:11};
  const vigente=d=>{let m=String(d.until||"").toLowerCase().match(/(\d{1,2})\s*([a-zñ]{3})/);if(!m){const k=String(d.until||"").toLowerCase().match(/([a-z]{3})[a-z]*\.?\s*(\d{1,2})/);if(k)m=[k[0],k[2],k[1]]}if(!m||MESI[m[2]]==null)return true;const now=new Date(),y=now.getFullYear();
    let t=new Date(y,MESI[m[2]],+m[1],23,59);if(t-now<-180*864e5)t=new Date(y+1,MESI[m[2]],+m[1],23,59);return t>=now};
  const dxs=(L.dx||[]).filter(vigente).map(d=>({d,e:callEnt(d.call)})).filter(x=>x.e&&x.e.dxcc).map(x=>({...x,n:need(x.e.dxcc)}));
  const sp=(typeof SPOTS==="function"?SPOTS():(L.spots||[])).map(s=>({s,e:callEnt(s.call)})).filter(x=>x.e&&x.e.dxcc&&x.s.band<=10&&(need(x.e.dxcc)||needB(x.e.dxcc,x.s.band)));
  const seen=new Set();const sp2=sp.filter(x=>{const k=x.s.call+x.s.band;if(seen.has(k))return false;seen.add(k);return true}).slice(0,10);
  const dn=dxs.filter(x=>x.n),db=dxs.filter(x=>!x.n);
  let h=`<h3>Tus objetivos ahora</h3>`;
  const card=x=>{const md=[].concat(x.d.modes||[]).filter(Boolean).join(", ");if(window.ACRACB_card)return ACRACB_card({call:x.d.call,tags:x.d.mw?[`<span class="agr dif">Most Wanted nº ${esc(x.d.mw)}</span>`]:[],secs:[["Hasta",x.d.until?esc(x.d.until):""],["Modos",md?esc(md):""]]});return `<div class="sp"><span class="f">★</span><span><b>${CS(x.d.call)}</b></span><span class="w">${x.d.until?"Hasta "+esc(x.d.until):""}${md?" · "+esc(md):""}${x.d.mw?" · Most Wanted nº "+esc(x.d.mw):""}</span></div>`};
  h+=dn.length?`<p class="note">DXpediciones activas de entidades que no tienes confirmadas (${dn.length}):</p><div class="goal">${dn.slice(0,6).map(card).join("")}</div>${dn.length>6?`<details class="goal-more"><summary>Ver las otras ${dn.length-6}</summary><div class="goal">${dn.slice(6).map(card).join("")}</div></details>`:""}`:`<p class="note">Ninguna DXpedición activa es de una entidad que te falte.</p>`;
  if(false)h+=dn.length?`<p class="note">DXpediciones activas de entidades que no tienes confirmadas:</p><div class="goal">${dn.map(x=>`<div class="sp"><span class="f">★</span><span><b>${CS(x.d.call)}</b></span><span class="w">Hasta ${esc(x.d.until||"")}${x.d.modes?" · "+esc([].concat(x.d.modes).join(", ")):""}${x.d.mw?" · Most Wanted nº "+esc(x.d.mw):""}</span></div>`).join("")}</div>`:`<p class="note">Ninguna DXpedición activa es de una entidad que te falte.</p>`;
  if(db.length)h+=`<p class="note">Ya confirmadas, pero quizá te falte alguna banda: ${db.slice(0,8).map(x=>CS(x.d.call)).join(", ")}.</p>`;
  h+=sp2.length?`<p class="note">En el clúster ahora, entidades o bandas que te faltan:</p><div class="goal">${sp2.map(({s,e})=>window.ACRACB_card?ACRACB_card({call:s.call,a:(()=>{try{return spotAge(s)}catch(x){return null}})(),t:s.t,f:s.f,band:s.band,mode:s.mode||"",tags:[`<span class="xtag xs">${need(e.dxcc)?"Entidad que te falta":"Te falta en "+BANDS[s.band]}</span>`],by:CSL(s.by,", "),geo:window.ACRACB_geo?ACRACB_geo(s.dx):null}):`<div class="sp"><span class="f" style="color:${BC[s.band]}">${esc(s.f)}</span><span><b>${CS(s.call)}</b> · ${esc(s.mode||"")}</span><span class="w">${need(e.dxcc)?"Entidad que te falta":"Te falta en "+BANDS[s.band]} · ${esc(s.t)} UTC</span></div>`).join("")}</div>`:`<p class="note">Ahora mismo no hay en el clúster nada que te falte.</p>`;
  return h};
/* ---------- acceso directo a «Mi log» junto a «Cambiar» ---------- */
window.ACRACB_openLog=function(){try{go("fichas");selTab("fichas","f_log",true);const d=$("f_log");if(d){d.open=true;setTimeout(()=>d.scrollIntoView({behavior:"smooth",block:"start"}),80)}}catch(e){}};
function logBtn(){const st=$("stbtn");if(!st)return;let b=$("logbtn");if(!b){b=document.createElement("button");b.id="logbtn";b.type="button";b.className="btn stbtn logbtn";b.onclick=()=>ACRACB_openLog();st.insertAdjacentElement("beforebegin",b)}
  b.textContent=(typeof LOG!=="undefined"&&LOG)?"Mi log":"Subir log"}
document.addEventListener("click",e=>{const x=e.target.closest("[data-openlog]");if(x){e.preventDefault();ACRACB_openLog()}});
function hook(){
  try{const r0=refresh;refresh=function(){const v=r0.apply(this,arguments);try{if(typeof renderLog==="function")renderLog()}catch(e){}try{logBtn()}catch(e){}try{longVals()}catch(e){}return v}}catch(e){}
  try{const a0=applyLive;applyLive=function(n){const v=a0.apply(this,arguments);try{ACRACB_normEnt()}catch(e){}return v}}catch(e){}
  loadLog();ACRACB_normEnt();themeBtn();logBtn();try{refresh()}catch(e){}clampAll()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(hook,0));else setTimeout(hook,0);
})();

/* ---- pantallas muy grandes y televisores: se amplía todo (nítido: todo es texto y SVG) ----
   Automático: por encima de 2100 px se ve como en una pantalla de 1920 px, ocupando todo el ancho.
   Botón «Aa»: tamaño 100 %, 125 %, 150 %, 175 % o 200 % encima de lo automático, para ver la web de lejos (sede, TV, proyector). Se recuerda en el dispositivo. */
(function(){var STEPS=[1,1.25,1.5,1.75,2],EN=window.ACRACB_LANG==="en";
 function uf(){try{var v=+localStorage.getItem("acracb_zoom");return STEPS.indexOf(v)>=0?v:1}catch(e){return 1}}
 function fit(){var de=document.documentElement,w=window.innerWidth,h=window.innerHeight;
  /* 2.3.2: lo automático de las pantallas grandes sigue ampliando todo; lo que eliges con «Aa» agranda la letra
     (y con ella botones y etiquetas), pero la maquetación sigue siendo la del ancho real de la pantalla:
     así en el móvil no se sale nada por los lados y en el ordenador se siguen usando las columnas que caben */
  var z=w>2100?Math.min(w/1920,h/900):1;z=Math.round(Math.max(1,z)*100)/100;var u=uf();
  if(z>1){de.classList.add("bigz");de.style.zoom=z}else{de.classList.remove("bigz");de.style.zoom=""}
  de.style.fontSize=u>1?(u*100)+"%":"";de.classList.toggle("bigt",u>1);de.dataset.tz=u>1?String(Math.round(u*100)):"";de.style.setProperty("--tz",String(u));
  /* el texto normal tiene un tamaño fijo en píxeles según el ancho de pantalla: se multiplica por lo mismo para que todo crezca igual */
  var bd=document.body;if(bd){bd.style.fontSize="";if(u>1){var base=parseFloat(getComputedStyle(bd).fontSize)||16;bd.style.fontSize=(Math.round(base*u*10)/10)+"px"}}
  var b=document.getElementById("zoombtn");if(b){var p=Math.round(uf()*100);b.title=(EN?"Text and screen size: ":"Tamaño de letra y pantalla: ")+p+" %"+(EN?" (tap to change)":" (pulsa para cambiar)");b.setAttribute("aria-label",b.title);b.dataset.z=p>100?p:"";b.querySelector("small").textContent=p>100?p:""}}
 function btn(){if(document.getElementById("zoombtn"))return true;var th=document.getElementById("thbtn");if(!th)return false;
  var b=document.createElement("button");b.id="zoombtn";b.type="button";b.className="thbtn zoombtn";b.innerHTML='<span aria-hidden="true">Aa</span><small></small>';
  b.onclick=function(){var i=STEPS.indexOf(uf());try{localStorage.setItem("acracb_zoom",String(STEPS[(i+1)%STEPS.length]))}catch(e){}fit()};
  th.parentElement.insertBefore(b,th);fit();return true}
 fit();window.addEventListener("resize",fit);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fit);
 (function tryB(n){if(!btn()&&n<40)setTimeout(function(){tryB(n+1)},150)})(0)})();

/* ---- mapa: etiquetas de spots y DXpediciones sin amontonarse ----
   Cada etiqueta prueba cuatro sitios alrededor de su marca (derecha arriba, derecha abajo, izquierda arriba, izquierda abajo).
   Si no cabe en ninguno, se oculta el texto pero la marca sigue ahí y al tocarla se ve todo. Las DXpediciones van primero. */
(function(){
 /* etiquetas del mapa sin amontonarse (2.1.18):
    - se colocan justo al dibujar (sin el parpadeo de antes) y otra vez cuando cambia el texto de una baliza;
    - cada etiqueta prueba 8 sitios alrededor de su marca y repite el que tuvo la última vez, para que no salten;
    - los porcentajes de los círculos VOACAP que se pisan se ocultan (se ve el del destino más probable). */
 const LAST=new Map();let busy=false;
 const key=t=>(t.getAttribute("class")||"")+"|"+String(t.textContent||"").split(" ")[0];
 function run(){const svg=document.getElementById("map");if(!svg||!svg.getBoundingClientRect().width||busy)return;busy=true;try{
  const keep=[];const hit=(r,pad)=>keep.some(k=>r.left<k.right+pad&&r.right>k.left-pad&&r.top<k.bottom+1&&r.bottom>k.top-1);
  svg.querySelectorAll("text.txl").forEach(t=>{const r=t.getBoundingClientRect();if(r.width)keep.push(r)});
  /* círculos VOACAP que se pisan: el más probable se queda entero y los que caen encima pasan a ser un punto pequeño
     (siguen ahí y se pueden tocar; al acercar el mapa recuperan su tamaño) */
  {const cs=[...svg.querySelectorAll("circle.mk")].map(c=>{const m=String(c.getAttribute("aria-label")||"").match(/(\d+)\s*%/);const base=+(c.dataset.r||c.getAttribute("r"));const cur=+c.getAttribute("r");
     const sc=c.dataset.shr==="1"?cur/3.2:(base?cur/base:1);return {c,p:m?+m[1]:0,x:+c.getAttribute("cx"),y:+c.getAttribute("cy"),R:base*sc,sc}}).sort((a,b)=>b.p-a.p);
   const kept=[],small=new Set();svg.querySelectorAll("text.ml").forEach(t=>t.style.display="");
   for(const o of cs){const hitC=kept.some(k=>Math.hypot(k.x-o.x,k.y-o.y)<(k.R+o.R)*.72);
     if(hitC){o.c.setAttribute("r",3.2*o.sc);o.c.dataset.shr="1";small.add(o.x+"|"+o.y)}else{o.c.setAttribute("r",o.R);o.c.dataset.shr="";kept.push(o)}}
   svg.querySelectorAll("text.ml").forEach(t=>{if(small.has(t.getAttribute("x")+"|"+t.getAttribute("y")))t.style.display="none"})}
  /* porcentajes VOACAP: del más probable al menos */
  const ml=[...svg.querySelectorAll("text.ml")].map(t=>({t,v:parseFloat(t.textContent)||0})).sort((a,b)=>b.v-a.v);const mk=[];
  for(const {t} of ml){if(t.style.display==="none")continue;const r=t.getBoundingClientRect();if(!r.width)continue;if(mk.some(k=>r.left<k.right&&r.right>k.left&&r.top<k.bottom&&r.bottom>k.top)){t.style.display="none";continue}mk.push(r)}
  const all=[...svg.querySelectorAll("text.dxx"),...svg.querySelectorAll("text.spotl")];
  for(const t of all){const d=t.dataset;if(d.ox===undefined){d.ox=t.getAttribute("x");d.oy=t.getAttribute("y");d.oa=t.getAttribute("text-anchor")||"start"}
   t.style.display="";const ax=+d.ax,ay=+d.ay,dx=Math.abs(+d.ox-ax)||8,dy=+d.oy-ay,ady=Math.abs(dy)||7;
   const pos=[[dx,dy,d.oa],[dx,ady+9,"start"],[-dx,dy,"end"],[-dx,ady+9,"end"],[0,-ady-6,"middle"],[0,ady+14,"middle"],[dx,-ady-8,"start"],[-dx,-ady-8,"end"]];
   const k=key(t),prev=LAST.get(k);const order=prev!=null&&prev<pos.length?[pos[prev]].concat(pos.filter((_,i)=>i!==prev)):pos;let ok=false;
   for(const q of order){const [x,y,an]=q;t.setAttribute("x",ax+x);t.setAttribute("y",ay+y);t.setAttribute("text-anchor",an);const r=t.getBoundingClientRect();if(!hit(r,2)){keep.push(r);LAST.set(k,pos.indexOf(q));ok=true;break}}
   if(!ok){t.setAttribute("x",d.ox);t.setAttribute("y",d.oy);t.setAttribute("text-anchor",d.oa);t.style.display="none";LAST.delete(k)}}
  if(LAST.size>2000)LAST.clear();
  /* si «Caminos» o «Saltos» están encendidos pero no hay nada que dibujar, se dice por qué en vez de dejar el mapa sin nada */
  try{const wrap=svg.parentNode;let n=wrap.querySelector(".mnote");const ly=(typeof st!=="undefined"&&st.ly)||{};const en=window.ACRACB_LANG==="en";
   const want=st.mapOn&&(ly.arcs||ly.hops),got=svg.querySelectorAll("path.arc,path.lparc,circle.hop").length;
   const msg=want&&!got?(en?"No destination reaches 15 % on this band and hour, so there are no paths or hops to draw. Try another band or hour.":"Ningún destino llega al 15 % en esta banda y hora, así que no hay caminos ni saltos que dibujar. Prueba otra banda u otra hora."):"";
   if(msg){if(!n){n=document.createElement("div");n.className="mnote";wrap.appendChild(n)}n.textContent=msg;n.hidden=false}else if(n)n.hidden=true}catch(e){}
  }finally{busy=false}}
 let tm=null;const later=()=>{clearTimeout(tm);tm=setTimeout(()=>{try{run()}catch(e){}},60)};
 let mo=null;function watch(){const svg=document.getElementById("map");if(!svg||mo)return;
  mo=new MutationObserver(ms=>{if(busy)return;if(ms.some(m=>m.type==="characterData"||(m.type==="childList"&&m.target.nodeName==="text")))later()});
  mo.observe(svg,{childList:true,subtree:true,characterData:true})}
 function hook(){if(typeof drawMap!=="function"||typeof zoomMarks!=="function"){setTimeout(hook,200);return}
  const d0=drawMap,z0=zoomMarks;
  window.drawMap=function(){const r=d0.apply(this,arguments);try{run()}catch(e){}return r};
  window.zoomMarks=function(){const r=z0.apply(this,arguments);try{run()}catch(e){}return r};
  window.addEventListener("resize",later);watch();later()}
 hook()})();

/* 2.1.9: indicativo con su bandera, versión compacta (sin el nombre de la entidad) para etiquetas y listas cortas */
window.CSF=function(call){try{const c=esc(call),e=callEnt(call);if(!e||e.mm)return `<span class="cs" data-call="${c}">${c}</span>`;const u=flagURL(e.cc);
  return `<span class="cs" data-call="${c}" title="${esc(e.name)}">${c}${u?` <img class="fl" src="${u}" alt="" width="18" height="12">`:""}</span>`}catch(x){return String(call||"").replace(/[&<>"']/g,"")}};

/* 2.1.21: banderas para las entidades DXCC que no tenían: sede de la ONU y de la UIT (bandera de la ONU),
   Orden de Malta, Spratly (sin bandera oficial: una neutra), arrecife Märket (Åland/Finlandia) e Irlanda del Norte (Reino Unido) */
(function(){let done=false;function fix(){if(done)return;try{const D=DXDg();if(!D||!D.f||!D.d)return;done=true;
  D.f.UN='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 513 342"><rect width="513" height="342" fill="#4b92db"/><g fill="none" stroke="#fff" stroke-width="11"><circle cx="256.5" cy="160" r="66"/><circle cx="256.5" cy="160" r="34"/><path d="M256.5 94v132M190.5 160h132"/><path d="M170 112c-28 60 2 124 86 136M343 112c28 60-2 124-86 136"/></g></svg>';
  D.f.XM='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 513 342"><rect width="513" height="342" fill="#cf142b"/><rect x="226" y="40" width="61" height="262" fill="#fff"/><rect x="146" y="110" width="221" height="61" fill="#fff"/></svg>';
  D.f.XS='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 513 342"><rect width="513" height="342" fill="#2b6cb0"/><path d="M0 250c64-30 128-30 192 0s128 30 192 0 96-24 129-10v102H0z" fill="#8fc3ee"/><circle cx="170" cy="190" r="34" fill="#f4d58d"/><circle cx="300" cy="170" r="24" fill="#f4d58d"/><circle cx="380" cy="205" r="18" fill="#f4d58d"/></svg>';
  if(!D.f.XI&&D.f.GB)D.f.XI=D.f.GB;
  for(const [id,v] of Object.entries(D.d)){if(!Array.isArray(v))continue;const nm=String(v[1]||"");
    if(!v[0]&&/Malta/i.test(nm))v[0]="XM";else if(!v[0]&&/Spratly/i.test(nm))v[0]="XS";else if(!v[0]&&/M[aä]rket/i.test(nm))v[0]=D.f.AX?"AX":"FI"}
  try{for(const k in FLURL)if(!FLURL[k]){delete FLURL[k];stale=true}}catch(e){}
 }catch(e){}}
 let stale=false;window.ACRACB_flagfix=fix;fix();if(stale)setTimeout(()=>{try{CACHE.clear();refresh()}catch(e){}},0)})();

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
let HR=null,HBUSY=false,HLAST=0;
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
function checkNotify(){if(!notifOn())return;const al=L.alert;if(!al||!al.items)return;const fresh=al.items.filter(x=>{const k=x.call+"|"+x.band;if(SEEN.has(k))return false;SEEN.add(k);return true});
  if(fresh.length){const x=fresh[0];notify(`${x.call} en ${BANDS[x.band]||""} ${x.mode||""}`.trim(),`${x.f} · ${x.t} UTC · te falta${x.need?" ("+x.need+")":""}${fresh.length>1?(window.ACRACB_LANG==="en"?` · and ${fresh.length-1} more`:` · y ${fresh.length-1} más`):""}`);S.set("acracb_nseen",JSON.stringify([...SEEN].slice(-300)))}}

/* =================== arranque =================== */
function all(){try{meteorNote()}catch(e){}try{qrpCard()}catch(e){}try{renderHeard()}catch(e){}try{notifUI()}catch(e){}}
function hook(){wrapSpots();
  try{const r0=refresh;refresh=function(){const v=r0.apply(this,arguments);all();return v}}catch(e){}
  try{const a0=renderAlerts;renderAlerts=function(){const v=a0.apply(this,arguments);try{notifUI();checkNotify()}catch(e){}return v}}catch(e){}
  all();try{checkNotify()}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(hook,20));else setTimeout(hook,20);
})();

/* ---- ACRACB 1.2: visor del log (continentes, países, bandas, modos, mapa y diplomas) ---- */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const e2=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const CONT={EU:"Europa",AF:"África",AS:"Asia",NA:"Norteamérica",SA:"Sudamérica",OC:"Oceanía",AN:"Antártida"};
const CC={EU:"AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA XK",
  AF:"AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW",
  AS:"AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IO IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE",
  NA:"AG AI AW BB BL BM BQ BS BZ CA CR CU CW DM DO GD GL GP GT HN HT JM KN KY LC MF MQ MS MX NI PA PM PR SV SX TC TT US VC VG VI",
  SA:"AR BO BR CL CO EC FK GF GS GY PE PY SR UY VE",OC:"AS AU CK FJ FM GU KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV UM VU WF WS",AN:"AQ BV HM TF"};
const CCM={};Object.entries(CC).forEach(([k,v])=>v.split(" ").forEach(c=>CCM[c]=k));
let ENT=null;
function ents(){if(ENT)return ENT;const D=DXDg().d,meta={};(V.meta||[]).forEach(m=>{if(!meta[m[2]])meta[m[2]]={cont:m[7],lat:m[4],lon:m[5]}});
  ENT=Object.entries(D).map(([dx,v])=>{const mt=meta[dx]||{};return {dx:+dx,cc:v[0],name:(typeof dxName==="function"&&dxName(+dx))||v[1],cont:mt.cont||CCM[v[0]]||"",lat:mt.lat,lon:mt.lon}});return ENT}
const HF=[0,1,8,2,9,3,4,5,6,7,10];
let F={st:"all",ct:"",q:"",n:60};
function stat(dx){const e=LOG.e[dx];if(!e)return null;return Object.values(e).includes("C")?"C":"W"}
function bar(a,b,tot,cl){const pa=tot?Math.round(a/tot*100):0,pb=tot?Math.round(b/tot*100):0;return `<div class="lvbar" title="${b} confirmadas, ${a} trabajadas de ${tot}"><span class="lvw" style="width:${pa}%"></span><span class="lvc" style="width:${pb}%"></span></div>`}
window.ACRACB_logview=function(){if(typeof LOG==="undefined"||!LOG||!LOG.e)return "";const E=ents();const tot=E.length;
  let wk=0,cf=0;const byC={};Object.keys(CONT).forEach(k=>byC[k]={w:0,c:0,t:0});
  E.forEach(x=>{const s=stat(x.dx);const k=byC[x.cont];if(k){k.t++;if(s)k.w++;if(s==="C")k.c++}if(s)wk++;if(s==="C")cf++});
  const known=new Set(E.map(x=>x.dx));const extra=Object.keys(LOG.e).filter(d=>!known.has(+d)).length;
  const bandW={},bandC={};let slots=0;HF.forEach(b=>{bandW[b]=0;bandC[b]=0});
  Object.values(LOG.e).forEach(v=>HF.forEach(b=>{const s=v[BKEY[b]];if(s)bandW[b]++;if(s==="C"){bandC[b]++;slots++}}));
  const wacC=Object.entries(byC).filter(([k,v])=>k!=="AN"&&v.c>0).map(([k])=>k),wacMiss=["EU","AF","AS","NA","SA","OC"].filter(k=>!wacC.includes(k));
  const dxccTxt=cf>=100?`<b>Conseguido</b> (${cf} confirmadas)`:`te faltan <b>${100-cf}</b> confirmadas`;
  let h=`<h3>Tu log de un vistazo</h3><div class="lvaw">
   <div class="chip"><div class="k">Diploma DXCC (100 entidades)</div><div class="v">${cf} / 100</div>${bar(Math.min(wk,100),Math.min(cf,100),100)}<div class="t">${dxccTxt}</div></div>
   <div class="chip"><div class="k">WAC (6 continentes)</div><div class="v">${wacC.length} / 6</div>${bar(wacC.length,wacC.length,6)}<div class="t">${wacMiss.length?"te falta "+wacMiss.map(k=>CONT[k]).join(", "):"<b>Conseguido</b>: todos confirmados"}</div></div>
   <div class="chip"><div class="k">Bandas-entidad confirmadas</div><div class="v">${fk(slots)}</div>${bar(Math.min(slots,1000),Math.min(slots,1000),1000)}<div class="t">el DXCC Challenge empieza en 1.000 (160 a 6 m)</div></div>
   <div class="chip"><div class="k">Entidades DXCC</div><div class="v">${wk} / ${tot}</div>${bar(wk,cf,tot)}<div class="t">${cf} confirmadas · te faltan ${tot-wk}${extra?` · ${extra} ya eliminadas de la lista`:""}</div></div></div>
   <div class="lvleg"><span><i class="lvc"></i> confirmadas</span><span><i class="lvw"></i> trabajadas sin confirmar</span><span><i class="lvn"></i> te faltan</span></div>
   <div class="lvmap" id="lvmap"></div>
   <div class="lvcols"><div><h3>Por continente</h3><table class="bt lvt"><tr><th>Continente</th><th>Trab.</th><th>Conf.</th><th>Total</th><th></th></tr>${Object.entries(byC).map(([k,v])=>`<tr><td><b>${CONT[k]}</b></td><td>${v.w}</td><td>${v.c}</td><td>${v.t}</td><td class="lvbc">${bar(v.w,v.c,v.t)}</td></tr>`).join("")}</table></div>
   <div><h3>Por banda</h3><table class="bt lvt"><tr><th>Banda</th><th>Trab.</th><th>Conf.</th><th></th></tr>${HF.filter(b=>bandW[b]).map(b=>`<tr><td><b style="color:${BC[b]}">${BANDS[b]}</b></td><td>${bandW[b]}</td><td>${bandC[b]}</td><td class="lvbc">${bar(bandW[b],bandC[b],tot)}</td></tr>`).join("")||`<tr><td colspan="4" class="note">Sin datos de banda.</td></tr>`}</table>
   ${LOG.m?(()=>{const mw={CW:0,PH:0,DG:0},mc={CW:0,PH:0,DG:0};Object.values(LOG.m).forEach(v=>Object.entries(v).forEach(([k,s])=>{if(mw[k]!=null){mw[k]++;if(s==="C")mc[k]++}}));
     return `<h3>Por modo</h3><table class="bt lvt"><tr><th>Modo</th><th>Trab.</th><th>Conf.</th></tr>${[["CW","CW"],["PH","Fonía"],["DG","Digitales"]].map(([k,n])=>`<tr><td><b>${n}</b></td><td>${mw[k]}</td><td>${mc[k]}</td></tr>`).join("")}</table>`})():`<p class="note">Vuelve a subir tu ADIF para ver también el desglose por modo (CW, fonía y digitales).</p>`}</div></div>
   <h3>Países</h3><div class="lvf"><div class="seg" role="group" aria-label="Qué países ver">${[["all","Todos"],["C","Confirmados"],["W","Sin confirmar"],["N","Me faltan"]].map(([k,n])=>`<button data-lvst="${k}" aria-pressed="${F.st===k}">${n}</button>`).join("")}</div>
   <select id="lvct" aria-label="Continente"><option value="">Todos los continentes</option>${Object.entries(CONT).map(([k,n])=>`<option value="${k}"${F.ct===k?" selected":""}>${n}</option>`).join("")}</select>
   <input id="lvq" type="search" placeholder="Buscar país" aria-label="Buscar país" value="${e2(F.q)}"></div><div id="lvlist"></div>`;
  setTimeout(()=>{list();drawMap()},0);return h};
function list(){const el=$("lvlist");if(!el)return;const q=F.q.trim().toLowerCase();
  const a=ents().filter(x=>{const s=stat(x.dx);if(F.st==="C"&&s!=="C")return false;if(F.st==="W"&&s!=="W")return false;if(F.st==="N"&&s)return false;if(F.ct&&x.cont!==F.ct)return false;if(q&&!x.name.toLowerCase().includes(q))return false;return true})
    .sort((p,r)=>p.name.localeCompare(r.name,"es"));
  const fl=cc=>{try{const f=DXDg().f[cc];return f?`<img class="fl" alt="" width="18" height="12" src="data:image/svg+xml,${encodeURIComponent(f)}">`:""}catch(e){return ""}};
  el.innerHTML=`<p class="note">${a.length} ${a.length===1?"entidad":"entidades"}</p><div class="lvl">${a.slice(0,F.n).map(x=>{const v=LOG.e[x.dx]||{},s=stat(x.dx);
    return `<div class="lvi ${s==="C"?"c":s==="W"?"w":"n"}"><span class="lvn2">${fl(x.cc)} <b>${e2(x.name)}</b> <small>${CONT[x.cont]||""}</small></span><span class="lvbs">${HF.map(b=>{const k=v[BKEY[b]];return k?`<i class="${k==="C"?"c":"w"}" title="${BANDS[b]}: ${k==="C"?"confirmada":"trabajada"}">${BANDS[b].replace(/\s+c?m$/,"")}</i>`:""}).join("")||'<i class="n">te falta</i>'}</span></div>`}).join("")}</div>
    ${a.length>F.n?`<button class="btn" id="lvmore">Ver ${Math.min(60,a.length-F.n)} más</button>`:""}`;
  const m=$("lvmore");if(m)m.onclick=()=>{F.n+=60;list()}}
function drawMap(){const el=$("lvmap");if(!el||typeof d3==="undefined"||typeof topojson==="undefined")return;
  try{const W=720,H=330;const topo=JSON.parse($("world").textContent);let land=topojson.feature(topo,topo.objects.countries||topo.objects.land);
    /* d3 dibuja al revés los polígonos con el sentido de giro invertido (rellenan todo el mapa): se corrigen aquí */
    const fix=g=>{if(!g)return g;const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];polys.forEach(p=>{if(d3.geoArea({type:"Polygon",coordinates:p})>2*Math.PI)p.forEach(r=>r.reverse())});return g};
    (land.features||[land]).forEach(f=>fix(f.geometry));
    const pr=d3.geoEquirectangular().fitSize([W,H],{type:"Sphere"}).translate([W/2,H/2+18]);const pa=d3.geoPath(pr);
    const dots=ents().filter(x=>x.lat!=null&&x.lon!=null).map(x=>{const s=stat(x.dx);const p=pr([x.lon,x.lat]);return p?`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${s?3.2:2.2}" class="${s==="C"?"c":s==="W"?"w":"n"}"><title>${e2(x.name)}: ${s==="C"?"confirmada":s==="W"?"trabajada sin confirmar":"te falta"}</title></circle>`:""}).join("");
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa de las entidades de tu log">${(land.features||[land]).map(f=>`<path d="${pa(f)||""}" class="lvland"/>`).join("")}${dots}</svg>`}catch(e){el.innerHTML=""}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-lvst]");if(!b)return;F.st=b.dataset.lvst;F.n=60;document.querySelectorAll("[data-lvst]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));list()});
document.addEventListener("change",e=>{if(e.target.id==="lvct"){F.ct=e.target.value;F.n=60;list()}});
document.addEventListener("input",e=>{if(e.target.id==="lvq"){F.q=e.target.value;F.n=60;list()}});
})();

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

/* ---- ACRACB 2.1: clúster con filtro de banda, POTA/SOTA/WWFF, paso largo y DXpediciones en el aire ---- */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";
const T=(es,en)=>EN()?en:es;
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const ORD=[0,1,8,2,9,3,4,5,6,7,10,11,12];
const PROGS=["POTA","SOTA","WWFF"];
/* filtros acumulativos, como las bandas del mapa: se pueden marcar varios tipos y varias bandas a la vez */
const ld=(k,ok)=>{try{const v=JSON.parse(S.get(k)||"null");return Array.isArray(v)?v.filter(ok):null}catch(e){return null}};
let TYPES=new Set(ld("acracb_cltypes",x=>x==="dx"||PROGS.includes(x))||[S.get("acracb_cltype")].filter(x=>x==="dx"||PROGS.includes(x)));if(!TYPES.size)TYPES.add("dx");
let BSEL=new Set(ld("acracb_clbands",x=>Number.isInteger(x)&&x>=0&&x<=12)||[]);/* vacío = todas */
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ago=a=>a==null?"":a<1?T("ahora","now"):a<90?T(`hace ${a} min`,`${a} min ago`):a<1440?T(`hace ${Math.round(a/60)} h`,`${Math.round(a/60)} h ago`):T("hace más de un día","over a day ago");
const minsFrom=u=>{const t=Date.parse(u||"");return isNaN(t)?null:Math.max(0,Math.round((Date.now()-t)/6e4))};
/* 2.3.5: los filtros enseñan siempre las 13 bandas; las que ahora no tienen nada salen atenuadas */
const bandsOK=()=>new Set(ORD);
const modeOK=s=>{try{return CMS().includes(spotMode(s))}catch(e){return true}};
const lp=az=>(az+180)%360;
/* modo con código de colores: CW ámbar, voz azul, FT8 verde, FT4 turquesa, RTTY morado, otros digitales rosa */
function mlab(m,f){let x=String(m||"").toUpperCase().trim();if(!x&&f!=null){try{x=String(spotMode({mode:"",f})).toUpperCase()}catch(e){}}
  x={USB:"SSB",LSB:"SSB",PHONE:"SSB",FONIA:"SSB","FT-8":"FT8","FT-4":"FT4",JS8CALL:"JS8",BPSK31:"PSK31",PSK:"PSK31",OTRO:"",DATA:"DIGI",DIGITAL:"DIGI"}[x]??x;return x}
function mcls(x){return x==="CW"?"cw":/^(SSB|AM|FM|DV|DSTAR|C4FM|DMR)$/.test(x)?"ph":x==="FT8"?"ft8":x==="FT4"?"ft4":x==="RTTY"?"rtty":x?"dg":"na"}
function mb(m){const x=mlab(m);if(!x)return "";return `<span class="mb mb-${mcls(x)}">${e2(x)}</span>`}
window.ACRACB_mb=mb;
function legend(){return `<div class="mleg" aria-label="${T("Colores de los modos","Mode colours")}">${T("Modo","Mode")}: ${["CW","SSB","FT8","FT4","RTTY"].map(mb).join("")}<span class="mb mb-dg" title="${T("Otros modos digitales: PSK31, JS8, SSTV, JT65…","Other digital modes: PSK31, JS8, SSTV, JT65…")}">${T("Otros","Other")}</span></div>`}
const RX=/\b(POTA|SOTA|WWFF)[ :#-]*([A-Z0-9]{1,4}[\/-][A-Z0-9\/-]{2,10})\b/i;

/* ---------- programas: POTA, SOTA, WWFF ---------- */
function progAll(){
  if(Array.isArray(L.acts))return L.acts.map(o=>Object.assign({},o,{a:minsFrom(o.utc)}));
  /* copia sin datos propios de programas (Artifact o datos antiguos): se sacan de los spots del clúster */
  const out=[],seen=new Set();
  for(const s of (L.spots||[])){const m=String(s.c||"").match(RX);if(!m)continue;const k=s.call+"|"+m[2].toUpperCase();if(seen.has(k))continue;seen.add(k);
    out.push({call:s.call,prog:m[1].toUpperCase(),ref:m[2].toUpperCase(),f:s.f,band:s.band,mode:s.mode,t:s.t,by:Array.isArray(s.by)?s.by[0]:s.by,dx:s.dx,a:(()=>{try{return spotAge(s)}catch(e){return null}})(),c:""})}
  return out}
function refUrl(p,r){if(p==="POTA")return "https://pota.app/#/park/"+encodeURIComponent(r);
  if(p==="SOTA")return "https://www.sotadata.org.uk/en/summit/"+r.split("/").map(encodeURIComponent).join("/");
  return "https://wwff.co/directory/?showRef="+encodeURIComponent(r)}
const PNAME={POTA:["parque","park"],SOTA:["cumbre","summit"],WWFF:["reserva","reserve"]};

/* ---------- barra de filtros ---------- */
function bar(counts,bcounts){
  const bs=bandsOK(),list=ORD.filter(b=>bs.has(b));[...BSEL].forEach(b=>{if(!bs.has(b))BSEL.delete(b)});
  const tb=[["dx","DX"]].concat(PROGS.map(p=>[p,p]));
  return `<div class="seg clseg" role="group" aria-label="${T("Qué mostrar","What to show")}"><span class="segl">${T("Ver","Show")}</span>${tb.map(([k,l])=>`<button type="button" data-clt="${k}" aria-pressed="${TYPES.has(k)}">${l}${counts[k]!=null?` <small>${counts[k]}</small>`:""}</button>`).join("")}</div>`+
    (list.length>1?`<div class="seg clseg clbands" role="group" aria-label="${T("Banda del clúster","Cluster band")}"><span class="segl">${T("Banda","Band")}</span><button type="button" data-clb="" aria-pressed="${!BSEL.size}">${T("Todas","All")}</button>${list.map(b=>`<button type="button" data-clb="${b}" aria-pressed="${BSEL.has(b)}"${bcounts[b]?"":' class="clz"'}><i style="background:${BC[b]}"></i>${BANDS[b]}${bcounts[b]?` <small>${bcounts[b]}</small>`:""}</button>`).join("")}</div>`:"")}
function wire(box){
  /* cada botón se marca o se desmarca; siempre queda al menos un tipo */
  box.querySelectorAll("[data-clt]").forEach(b=>b.onclick=()=>{const k=b.dataset.clt;if(TYPES.has(k)){if(TYPES.size>1)TYPES.delete(k)}else TYPES.add(k);S.set("acracb_cltypes",JSON.stringify([...TYPES]));render()});
  /* «Todas» quita la selección; marcar todas las bandas equivale a «Todas» */
  box.querySelectorAll("[data-clb]").forEach(b=>b.onclick=()=>{const v=b.dataset.clb;if(v==="")BSEL.clear();else{const n=+v;if(BSEL.has(n))BSEL.delete(n);else BSEL.add(n);const all=ORD.filter(x=>bandsOK().has(x));if(all.every(x=>BSEL.has(x)))BSEL.clear()}
    S.set("acracb_clbands",JSON.stringify([...BSEL]));render()})}

/* ---------- filas: tarjeta de estación por secciones ----------
   cabecera: indicativo · bandera · país ........ hora
   línea de frecuencia: frecuencia (MHz) · modo · banda · etiquetas
   secciones con su título a la izquierda: Le oyen · Split/QSL · Rumbo · Distancia · Nota */
function modeOf(s){if(s.mode)return s.mode;try{const k=spotMode(s);return k==="ssb"?"SSB":k==="otro"?"":k.toUpperCase()}catch(e){return ""}}
/* 2.4.3: distancias sobre el elipsoide WGS84 (Vincenty), no sobre una esfera: error de metros en lugar de hasta un 0,5 %.
   El camino largo es la vuelta completa por el mismo círculo máximo (su longitud real en el elipsoide) menos el corto. */
const WA=6378137,WF=1/298.257223563,WB=WA*(1-WF),WE2=WF*(2-WF),RD=Math.PI/180;
function vinc(p1,p2){const L=(p2[0]-p1[0])*RD,U1=Math.atan((1-WF)*Math.tan(p1[1]*RD)),U2=Math.atan((1-WF)*Math.tan(p2[1]*RD));
  const sU1=Math.sin(U1),cU1=Math.cos(U1),sU2=Math.sin(U2),cU2=Math.cos(U2);let l=L,lp,it=0,sS,cS,sg,sA,c2A,c2m;
  do{const sl=Math.sin(l),cl=Math.cos(l);sS=Math.sqrt((cU2*sl)**2+(cU1*sU2-sU1*cU2*cl)**2);if(sS===0)return {m:0,az:0};
    cS=sU1*sU2+cU1*cU2*cl;sg=Math.atan2(sS,cS);sA=cU1*cU2*sl/sS;c2A=1-sA*sA;c2m=c2A?cS-2*sU1*sU2/c2A:0;
    const C=WF/16*c2A*(4+WF*(4-3*c2A));lp=l;l=L+(1-C)*WF*sA*(sg+C*sS*(c2m+C*cS*(-1+2*c2m*c2m)))}while(Math.abs(l-lp)>1e-12&&++it<200);
  if(it>=200)return null; /* casi antípodas: no converge */
  const u2=c2A*(WA*WA-WB*WB)/(WB*WB),A=1+u2/16384*(4096+u2*(-768+u2*(320-175*u2))),B=u2/1024*(256+u2*(-128+u2*(74-47*u2)));
  const dS=B*sS*(c2m+B/4*(cS*(-1+2*c2m*c2m)-B/6*c2m*(-3+4*sS*sS)*(-3+4*c2m*c2m)));
  const az=Math.atan2(cU2*Math.sin(l),cU1*sU2-sU1*cU2*Math.cos(l));return {m:WB*A*(sg-dS),az:(az/RD+360)%360}}
/* vuelta completa del círculo máximo que pasa por los dos puntos (elipse máxima), fórmula de Ramanujan */
function loopM(p1,p2){const v=p=>{const la=p[1]*RD,lo=p[0]*RD;return [Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la)]};
  const a=v(p1),b=v(p2);let n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const k=Math.hypot(...n);if(!k)return 2*Math.PI*6371008.8;
  const nz2=(n[2]/k)**2,bg=1/Math.sqrt(nz2/(WA*WA)+(1-nz2)/(WB*WB)),h=((WA-bg)/(WA+bg))**2;return Math.PI*(WA+bg)*(1+3*h/(10+Math.sqrt(4-3*h)))}
function geoKm(p1,p2){const r=vinc(p1,p2);let m,az;if(r){m=r.m;az=r.az}else{m=distJS(p1,p2)*1000;az=brgJS(p1,p2)}
  const lm=Math.max(0,loopM(p1,p2)-m);return {km:m/1000,lkm:lm/1000,az}}
window.ACRACB_geoKm=geoKm;
function geoOf(p){try{if(!p||p.length!==2||p[0]==null||p[1]==null)return null;const g=geoKm(TXP,p);const az=Math.round(g.az)%360;return {az,laz:lp(az),km:Math.round(g.km),lkm:Math.round(g.lkm)}}catch(e){return null}}
function sec(lbl,val){return val?`<dt>${lbl}</dt><dd>${val}</dd>`:""}
function card(o){
  const h=`<div class="sc-h"><span class="sc-call">${CS(o.call)}</span>${o.a!=null||o.t?`<span class="sc-age" title="${e2(o.t||"")} UTC">${ago(o.a)}</span>`:""}</div>`;
  const fl=[o.f?`<b class="sc-fq" style="color:${BC[o.band]||"inherit"}">${e2(o.f)}</b>`:"",o.mode?mb(o.mode):"",o.band!=null&&BANDS[o.band]?`<span class="sc-b"${o.f?"":` style="color:${BC[o.band]};font-weight:600"`}>${BANDS[o.band]}</span>`:""].concat(o.tags||[]).filter(Boolean);
  const f=fl.length?`<div class="sc-f">${fl.join("")}</div>`:"";
  const g=o.geo;let rumbo="",dist="";
  if(g){rumbo=`<span class="nw">${T("corto","short")} ${g.az}° ${cab(g.az)}<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${g.laz}° ${cab(g.laz)}</span>`;
    dist=`<span class="nw">${T("corto","short")} ${fk(g.km)} km<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${fk(g.lkm!=null?g.lkm:Math.max(0,40030-g.km))} km${o.p!=null?`<span class="sc-sep">·</span>`:""}</span>${o.p!=null?` <span class="nw"><b>${o.p} %</b> ${T("de QSO","QSO chance")}${o.lpb?T(" (paso largo)"," (long path)"):""}</span>`:""}`}
  return `<div class="sc${o.old?" old":""}">${h}${f}<dl class="sc-d">${sec(o.byLbl||T("Le oyen","Heard by"),o.by)}${sec("Split / QSL",o.xs)}${sec(T("Rumbo","Bearing"),rumbo)}${sec(T("Distancia","Distance"),dist)}${sec(T("Nota","Note"),o.note)}${(o.secs||[]).map(([l,v])=>sec(l,v)).join("")}</dl></div>`}
window.ACRACB_card=o=>card(o);
/* 2.4.4: «Qué hacer»: cada estación recomendada en una tarjeta como las del resto de la plataforma:
   frecuencia, modo, banda, rumbo y distancia por el camino corto y el largo, y la probabilidad de QSO */
const inBand=(f,b)=>{const m=MHZ[b];return m&&isFinite(f)&&Math.abs(f-m)/m<.12};
function recCards(go,dxn){const out=[];
  (go||[]).forEach(({s,e,a})=>{const st=splitTags(s);const tg=[`<span class="xtag xr">${T("En el clúster","On the cluster")}</span>`].concat(st.pr);
    out.push(card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tg,by:CSL(s.by,", "),xs:st.xs,geo:geoOf(s.dx),p:Math.round(e.p*100),lpb:!!e.lp,
      note:/up|arriba|split/i.test(s.c||"")?T("Escucha arriba: trabaja en split.","Listen up: working split."):""}))});
  (dxn||[]).forEach(x=>{const d=x.d;const call=String(d.call||"").split(/[ ,]/)[0];let f="",mode="";
    const q=[].concat(d.qsx||[]).map(z=>String(z).match(/(\d+(?:\.\d+)?)\s*([A-Z0-9]+)?/i)).filter(Boolean).map(m=>({f:+m[1]>1000?+m[1]/1000:+m[1],m:(m[2]||"").toUpperCase()})).filter(z=>inBand(z.f,x.b));
    let my="";try{my=String(MOD()||"").toUpperCase()}catch(e){}const pick=q.find(z=>z.m&&my&&z.m===my)||q[0];
    if(pick){f=pick.f.toFixed(3);mode=pick.m}
    else{const sp=(L.spots||[]).filter(z=>z.call&&z.call.toUpperCase()===call.toUpperCase()&&z.band===x.b)[0];if(sp){f=sp.f;mode=sp.mode||""}}
    let hab=false;if(!mode&&Array.isArray(d.modes)&&d.modes.length){const mm=d.modes.map(z=>String(z).toUpperCase());mode=mm.includes(my)?my:mm.includes("SSB")&&!/CW|FT/.test(my)?"SSB":mm[0]}
    /* sin QSX ni spot en esa banda: la frecuencia habitual de las DXpediciones en ese modo */
    if(!f&&mode){const H={SSB:[1.845,3.790,7.090,14.195,18.145,21.295,24.945,28.495,null,null,50.110],CW:[1.826,3.523,7.023,14.023,18.073,21.023,24.893,28.023,5.354,10.106,50.090],
      FT8:[1.840,3.573,7.074,14.074,18.100,21.074,24.915,28.074,5.357,10.136,50.313],FT4:[1.840,3.575,7.047,14.080,18.104,21.140,24.919,28.180,null,10.140,50.318],
      RTTY:[1.838,3.580,7.040,14.083,18.105,21.083,24.925,28.083,null,10.140,50.300]};const v=(H[mode]||[])[x.b];if(v){f=v.toFixed(3);hab=true}}
    const tg=[`<span class="xtag xs">${T("DXpedición","DXpedition")}</span>`];
    out.push(card({call,f,band:x.b,mode,tags:tg,geo:isFinite(d.lon)&&isFinite(d.lat)?geoOf([d.lon,d.lat]):null,p:Math.round(x.p*100),lpb:!!x.lp,
      note:[hab?T("Frecuencia habitual de las DXpediciones en este modo: confírmala en el clúster.","Usual DXpedition frequency for this mode: check the cluster."):"",d.until?T("Activa hasta el "+e2(d.until)+".","Active until "+e2(String(d.until).replace(/\b(ene|abr|ago|dic)\b/g,m=>({ene:"Jan",abr:"Apr",ago:"Aug",dic:"Dec"})[m]))+"."):""].filter(Boolean).join(" ")}))});
  return out.length?`<div class="alc reccards">${out.join("")}</div>`:""}
window.ACRACB_recCards=recCards;window.ACRACB_geo=geoOf;window.ACRACB_split2=s=>splitTags(s);window.ACRACB_ago=ago;
/* separa las etiquetas de split/QSL (van en su sección) de las de programa (van junto a la frecuencia) */
function splitTags(s){const t=window.ACRACB_tags?ACRACB_tags(s):"";const xs=[],pr=[];(t.match(/<span class="xtag[^"]*"[^>]*>.*?<\/span>/g)||[]).forEach(x=>(/xtag x[sq]\b/.test(x)?xs:pr).push(x));return {xs:xs.join(""),pr}}
function dxRow(s,e,a){const st=splitTags(s);const tags=[];if(s.nw)tags.push(`<span class="nwb">${T("NUEVO","NEW")}</span>`);if(s.ns>1)tags.push(`<span class="nsb">${T(`en ${s.ns} clústeres`,`on ${s.ns} clusters`)}</span>`);
  return card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tags.concat(st.pr),by:CSL(s.by,", "),xs:st.xs,geo:geoOf(s.dx)||{az:e.az,laz:e.laz,km:e.km},p:Math.round(Math.max(e.pSP,e.t.l?e.pLP:0)*100),lpb:e.t&&e.t.l&&e.pLP>e.pSP,old:a>60})}
function progRow(o){const tag=`<a class="xtag xr" href="${refUrl(o.prog,o.ref)}" target="_blank" rel="noopener noreferrer" data-ext title="${T("Ficha del","Page of the")} ${T(PNAME[o.prog][0],PNAME[o.prog][1])}">${e2(o.prog)} ${e2(o.ref)}</a>`;
  return card({call:o.call,a:o.a,t:o.t,f:o.f,band:o.band,mode:o.mode,tags:[tag],byLbl:T("Spot de","Spotted by"),by:o.by?e2(o.by):"",geo:geoOf(o.dx),note:o.c?e2(o.c):"",old:o.a>30})}
const NREF=/(POTA|SOTA|WWFF|GMA|DME|DVGE|DFE|IOTA|DIE|DCE|DMVE|DEE)[ :-]*[A-Z0-9/-]+/i;
function nearRow(s,a){const st=splitTags(s);const tags=[];if(s.nw)tags.push(`<span class="nwb">${T("NUEVO","NEW")}</span>`);if(s.ns>1)tags.push(`<span class="nsb">${T(`en ${s.ns} clústeres`,`on ${s.ns} clusters`)}</span>`);
  const m=String(s.c||"").match(NREF);if(m&&!st.pr.length)tags.push(`<span class="xtag xr">${e2(m[0].toUpperCase())}</span>`);
  return card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tags.concat(st.pr),by:CSL(s.by,", "),xs:st.xs,geo:geoOf(s.dx),old:a>60})}
function renderNear(){const box=$("near");if(!box||typeof SPOTS!=="function")return;const keep=[...box.children].filter(x=>x.matches&&x.matches("p.note"));
  const nr=SPOTS().filter(s=>spotKind(s)==="near").map(s=>({s,a:spotAge(s)})).sort((x,y)=>(x.a??1e9)-(y.a??1e9));
  box.innerHTML=(nr.length?nr.map(({s,a})=>nearRow(s,a)).join(""):`<div class="empty">${T(`Sin spots cercanos de ${CMSTXT()} ahora.`,`No nearby ${CMSTXT()} spots right now.`)}</div>`);keep.forEach(k=>box.appendChild(k))}

/* ---------- clúster ---------- */
let LH=null;
function render(lh){if(lh!=null)LH=lh;const box=$("spots");if(!box||typeof SPOTS!=="function")return;if(LH==null)LH=st.mhour;
  let bx=$("clbar");if(!bx){bx=document.createElement("div");bx.id="clbar";box.parentNode.insertBefore(bx,box)}
  const bs=bandsOK();
  /* DX */
  const sp=SPOTS().map(s=>({s,e:spotEval(s,LH),a:spotAge(s)})).filter(x=>x.e&&(spotKind(x.s)==="dx"||spotKind(x.s)==="ind"));
  sp.sort((x,y)=>(spotKind(x.s)==="dx")-(spotKind(y.s)==="dx")||0);
  const dxs=sp.filter(x=>spotKind(x.s)==="dx").sort((a,b)=>b.e.p-a.e.p).concat(sp.filter(x=>spotKind(x.s)==="ind"));
  /* programas */
  const pa=progAll().filter(o=>bs.has(o.band)&&modeOK(o)&&(o.a==null||o.a<=60));
  const counts={dx:dxs.length};PROGS.forEach(p=>counts[p]=pa.filter(o=>o.prog===p).length);
  const cur=(TYPES.has("dx")?dxs.map(x=>x.s.band):[]).concat(pa.filter(o=>TYPES.has(o.prog)).map(o=>o.band));
  const bcounts={};cur.forEach(b=>bcounts[b]=(bcounts[b]||0)+1);
  bx.innerHTML=bar(counts,bcounts)+legend();wire(bx);
  const inB=b=>!BSEL.size||BSEL.has(b),bsl=ORD.filter(b=>BSEL.has(b)).map(b=>BANDS[b]);
  const bl=bsl.length?" "+T("en","on")+" "+(bsl.length>1?bsl.slice(0,-1).join(", ")+T(" y "," and ")+bsl[bsl.length-1]:bsl[0]):"";
  let h="";const srcs=[];
  if(TYPES.has("dx")){const rows=dxs.filter(x=>inB(x.s.band));
    if(TYPES.size>1)h+=`<p class="note clsec">DX</p>`;
    h+=rows.length?rows.map(x=>dxRow(x.s,x.e,x.a)).join(""):`<div class="empty">${T(`Sin spots DX de ${CMSTXT()} útiles${bl} ahora.`,`No useful ${CMSTXT()} DX spots${bl} right now.`)}</div>`;
    srcs.push(e2(L.spotsSrc||"—"))}
  const ps=PROGS.filter(p=>TYPES.has(p));
  if(ps.length){const rows=pa.filter(o=>ps.includes(o.prog)&&inB(o.band)).sort((a,b)=>(a.a??1e9)-(b.a??1e9));const N=80;
    const pl=ps.length>1?ps.slice(0,-1).join(", ")+T(" y "," and ")+ps[ps.length-1]:ps[0];
    bx.insertAdjacentHTML("beforeend",`<p class="note clnote">${T(`Activadores de ${pl} de todo el mundo en la última hora, en ${CMSTXT()}${bl}. Los más recientes, arriba.`,`${pl} activators worldwide in the last hour, in ${CMSTXT()}${bl}. Newest first.`)}</p>`);
    if(TYPES.has("dx"))h+=`<p class="note clsec">${pl}</p>`;
    h+=rows.length?rows.slice(0,N).map(progRow).join("")+(rows.length>N?`<p class="note">${T(`Y ${rows.length-N} más.`,`And ${rows.length-N} more.`)}</p>`:""):`<div class="empty">${T(`Ningún activador de ${pl} en ${CMSTXT()}${bl} en la última hora.`,`No ${pl} activators in ${CMSTXT()}${bl} in the last hour.`)}</div>`;
    srcs.push((Array.isArray(L.acts)?T("POTA, SOTAwatch, WWFF Spots y Spothole","POTA, SOTAwatch, WWFF Spots and Spothole"):T("comentarios de los spots del clúster","cluster spot comments"))+(L.actsUTC?T(` · revisado a las ${String(L.actsUTC).slice(11,16)} UTC`,` · checked at ${String(L.actsUTC).slice(11,16)} UTC`):""))}
  h+=`<details class="srcd"><summary>${T("Fuentes","Sources")}</summary>${srcs.map(x=>`<p class="note">${x}</p>`).join("")}</details>`;
  box.innerHTML=h}
window.ACRACB_clrender=render;

/* ---------- DXpediciones: dónde están operando ahora ---------- */
function dxTok(call){return String(call||"").toUpperCase().split(/[\s,;]+/).map(x=>x.replace(/[^A-Z0-9/]/g,"")).filter(x=>x.length>=3)}
function dxSpots(d){
  if(L.dxon&&typeof L.dxon==="object"&&!Array.isArray(L.dxon))return (L.dxon[d.call]||[]).map(o=>Object.assign({},o,{a:minsFrom(o.utc)}));
  const tk=dxTok(d.call),out=[],seen=new Set();
  for(const s of (L.spots||[])){if(!tk.some(x=>s.call===x||s.call.startsWith(x+"/")||s.call.endsWith("/"+x)))continue;const k=s.band+"|"+(s.mode||"");if(seen.has(k))continue;seen.add(k);
    out.push({f:s.f,band:s.band,mode:s.mode,t:s.t,by:Array.isArray(s.by)?s.by[0]:s.by,c:s.c,a:(()=>{try{return spotAge(s)}catch(e){return null}})()})}
  return out.sort((a,b)=>(a.a??1e9)-(b.a??1e9))}
function split(c){c=String(c||"");const sp=window.ACRACB_split?ACRACB_split(c):null;if(sp&&sp.abs)return T(`split, escucha en ${sp.abs}`,`split, listening on ${sp.abs}`);if(sp)return T(`split +${sp.rel}${sp.rel2?"–"+sp.rel2:""} kHz`,`split up ${sp.rel}${sp.rel2?"–"+sp.rel2:""} kHz`);
  if(/\bUP\b|\bSPLIT\b/i.test(c))return T("split, escucha arriba","split, listening up");return ""}
window.ACRACB_dxon=function(d){const a=dxSpots(d);if(!a.length)return !(L.dxon&&typeof L.dxon==="object")?"":`<span class="dxon dxoff">${T("Sin spots en las últimas 6 h","No spots in the last 6 h")}</span><br>`;
  const live=a.filter(o=>o.a!=null&&o.a<=30),rest=a.filter(o=>!(o.a!=null&&o.a<=30));
  const one=o=>`<span class="dxof"><b style="color:${BC[o.band]}">${e2(o.f)}</b> ${mb(o.mode)} · ${BANDS[o.band]||""} · ${ago(o.a)}${split(o.c)?" · "+split(o.c):""}</span>`;
  let h="";
  if(live.length)h+=`<span class="dxon"><b>◆ ${T("En el aire ahora","On the air now")}:</b> ${live.slice(0,4).map(one).join(" ")}</span><br>`;
  if(rest.length)h+=`<span class="dxon dxlast">${live.length?T("Antes","Earlier"):T("Últimos spots","Latest spots")}: ${rest.slice(0,live.length?2:3).map(one).join(" ")}</span><br>`;
  return h};

/* ---------- avisos con la misma tarjeta ---------- */
/* filtros de los avisos, acumulativos como los del clúster: varios modos y varias bandas a la vez */
const AMODES=["SSB","AM","FM","CW","FT8","FT4","JT65","JS8","RTTY","PSK31","SSTV","OTROS"];
const ANAME={JS8:"JS8Call"};
let AM=new Set(ld("acracb_almodes",x=>AMODES.includes(x))||[]),AB=new Set(ld("acracb_albands",x=>Number.isInteger(x)&&x>=0&&x<=12)||[]);/* vacío = todos */
const mgrp=(m,f)=>{const x=mlab(m,f);return AMODES.includes(x)?x:(x==="JS8CALL"?"JS8":"OTROS")};
function alertCards(){const box=$("alerts");if(!box||!L.alert||!Array.isArray(L.alert.items))return;
  const old=[...box.querySelectorAll(":scope>.sp")];let wrap=box.querySelector(":scope>.alc"),fb=box.querySelector(":scope>.alf");
  if(!wrap){if(!old.length)return;wrap=document.createElement("div");wrap.className="alc";old[0].before(wrap);old.forEach(o=>o.remove())}
  if(!fb){fb=document.createElement("div");fb.className="alf";wrap.before(fb)}
  const rows=L.alert.items.map(x=>{const sp=(L.spots||[]).find(s=>s.call===x.call)||{};const band=x.band!=null?x.band:sp.band;const mode=x.mode||sp.mode||"";return {x,sp,band,mode,g:mgrp(mode,x.f!=null?x.f:sp.f)}});
  const mc={},bc={};rows.forEach(r=>{mc[r.g]=(mc[r.g]||0)+1;if(r.band!=null)bc[r.band]=(bc[r.band]||0)+1});
  /* se ven siempre todos los modos y todas las bandas de tu estación; los que ahora no tienen avisos salen atenuados */
  const ml=AMODES.slice(),bs=bandsOK(),bl=ORD.filter(b=>bs.has(b));[...AB].forEach(b=>{if(!bs.has(b))AB.delete(b)});
  fb.innerHTML=`<div class="seg clseg almodes" role="group" aria-label="${T("Modo de los avisos","Alert mode")}"><span class="segl">${T("Modo","Mode")}</span><button type="button" data-alm="" aria-pressed="${!AM.size}">${T("Todos","All")}</button>${ml.map(m=>`<button type="button" data-alm="${m}" aria-pressed="${AM.has(m)}"${mc[m]?"":' class="clz"'}>${m==="OTROS"?T("Otros","Other"):(ANAME[m]||m)}${mc[m]?` <small>${mc[m]}</small>`:""}</button>`).join("")}</div>`+
    `<div class="seg clseg clbands albands" role="group" aria-label="${T("Banda de los avisos","Alert band")}"><span class="segl">${T("Banda","Band")}</span><button type="button" data-alb="" aria-pressed="${!AB.size}">${T("Todas","All")}</button>${bl.map(b=>`<button type="button" data-alb="${b}" aria-pressed="${AB.has(b)}"${bc[b]?"":' class="clz"'}><i style="background:${BC[b]}"></i>${BANDS[b]}${bc[b]?` <small>${bc[b]}</small>`:""}</button>`).join("")}</div>`;
  fb.querySelectorAll("[data-alm]").forEach(b=>b.onclick=()=>{const v=b.dataset.alm;if(v==="")AM.clear();else{if(AM.has(v))AM.delete(v);else AM.add(v);if(ml.every(m=>AM.has(m)))AM.clear()}S.set("acracb_almodes",JSON.stringify([...AM]));alertCards();alBar()});
  fb.querySelectorAll("[data-alb]").forEach(b=>b.onclick=()=>{const v=b.dataset.alb;if(v==="")AB.clear();else{const n=+v;if(AB.has(n))AB.delete(n);else AB.add(n);if(bl.every(x=>AB.has(x)))AB.clear()}S.set("acracb_albands",JSON.stringify([...AB]));alertCards();alBar()});
  const vis=rows.filter(r=>(!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band))));
  wrap.innerHTML=vis.length?vis.map(({x,sp,band,mode})=>{const st=splitTags({c:x.c||sp.c||""});const need=String(x.need||"");
    const tag=`<span class="xtag ${/DXped/i.test(need)?"xs":"xr"}">${e2(/DXped/i.test(need)?T("DXpedición","DXpedition"):T("entidad rara","rare entity"))}</span>`;
    let a=null;try{a=spotAge({t:x.t})}catch(e){}
    return card({call:x.call,a,t:x.t,f:x.f,band,mode,tags:[tag].concat(st.pr),by:CSL(String(x.by||"").split(/[ ,]+/).filter(Boolean),", "),xs:st.xs,geo:geoOf(sp.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(x.call)))})}).join("")
    :`<p class="note">${T("Ningún aviso con este modo y esta banda. Pulsa «Todos» o «Todas» para verlos todos.","No alerts for this mode and band. Tap «All» to see them all.")}</p>`}
/* 2.4.1: el aviso flotante (arriba, en Ahora) solo enseña los modos y bandas elegidos en Avisos, con las mismas tarjetas */
function alBar(){const el=$("albar");if(!el)return;const al=L.alert;if(!al||!Array.isArray(al.items)){el.hidden=true;return}
  const age=al.at?(Date.now()-Date.parse(al.at))/6e4:1e9;let off=null;try{off=sessionStorage.getItem("aloff")}catch(e){}
  const rows=al.items.map(x=>{const sp=(L.spots||[]).find(s=>s.call===x.call)||{};const band=x.band!=null?x.band:sp.band;const mode=x.mode||sp.mode||"";return {x,sp,band,mode,g:mgrp(mode,x.f!=null?x.f:sp.f)}})
    .filter(r=>(!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band))));
  if(!rows.length||age>150||off===al.at){el.hidden=true;el.innerHTML="";return}
  /* 2.4.1: con la lista de Avisos a la vista, el aviso flotante sobra y la tapaba */
  {const fa=$("f_al");if(typeof st!=="undefined"&&st.page==="dx"&&fa&&fa.getClientRects().length){el.hidden=true;return}}
  const shown=rows.slice(0,3);
  el.hidden=false;el.classList.add("albar2");
  el.innerHTML=`<div class="alh"><b>${T("Aviso DX","DX alert")} <span class="alt">${esc(fmtT(al.at))}</span></b><span class="alb"><button type="button" class="lnk" id="algo">${rows.length>shown.length?T(`Ver los ${rows.length}`,`See all ${rows.length}`):T("Ver en Avisos","See in Alerts")}</button><button type="button" class="lnk" id="alx" aria-label="${T("Cerrar aviso","Close alert")}">${T("Cerrar","Close")}</button></span></div>
  <div class="alc">${shown.map(({x,sp,band,mode})=>{const stg=splitTags({c:x.c||sp.c||""});const need=String(x.need||"");
    const tag=`<span class="xtag ${/DXped/i.test(need)?"xs":"xr"}">${e2(/DXped/i.test(need)?T("DXpedición","DXpedition"):T("entidad rara","rare entity"))}</span>`;let a=null;try{a=spotAge({t:x.t})}catch(e){}
    return card({call:x.call,a,t:x.t,f:x.f,band,mode,tags:[tag].concat(stg.pr),by:CSL(String(x.by||"").split(/[ ,]+/).filter(Boolean),", "),xs:stg.xs,geo:geoOf(sp.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(x.call)))})}).join("")}</div>`;
  $("algo").onclick=()=>{go("dx");try{selTab("dx","f_al",true)}catch(e){}el.hidden=true;const fa=$("f_al");if(fa){fa.open=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{try{fa.scrollIntoView({block:"start",behavior:"smooth"})}catch(e){fa.scrollIntoView()}}))}};$("alx").onclick=()=>{try{sessionStorage.setItem("aloff",al.at)}catch(e){}el.hidden=true}}
window.renderAlBar=alBar;document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest(".nav button,#subnav button,.ptabs button,[data-pg]"))setTimeout(()=>{try{alBar()}catch(e){}},80)},true);
function hookA(){if(typeof window.renderAlerts!=="function"||window.renderAlerts.__cl)return false;const o=window.renderAlerts;const w=function(){const r=o.apply(this,arguments);try{alertCards()}catch(e){console.error(e)}return r};w.__cl=1;window.renderAlerts=w;return true}
if(!hookA()){const t2=setInterval(()=>{if(hookA())clearInterval(t2)},200);setTimeout(()=>clearInterval(t2),15000)}


/* ---------- 2.4.1: DXpediciones con la misma tarjeta por secciones ---------- */
let DXOPEN=false;
function dxCards(){const box=$("dxl");if(!box||!Array.isArray(L.dx)||typeof tFor!=="function")return;const lh=st.mhour;
  const html=[];L.dx.forEach((d,i)=>{let t=null;try{t=tFor(d)}catch(e){}if(!t||!isFinite(d.lon)||!isFinite(d.lat))return;const p=[d.lon,d.lat];
    const gk=geoKm(TXP,p),az=Math.round(gk.az)%360,km=Math.round(gk.km),lkm=Math.round(gk.lkm),laz=(az+180)%360;
    let bh={p:0,h:0,b:0,lp:false};for(let x=0;x<24;x++){const r=bestAny(t,x);if(r.p>bh.p)bh={...r,h:x}}const n=bestAny(t,lh);
    let nw=false;try{nw=dxNew(d)}catch(e){}const e=callEnt(d.call);const cty=e&&e.name&&String(d.ent||"").toLowerCase()!==e.name.toLowerCase()?` <span class="cty">· ${e2(d.ent)}</span>`:"";
    const tags=[d.mw?`<span class="agr dif">Most Wanted nº ${e2(d.mw)}</span>`:"",MOD()==="ssb"&&d.ssb===false?`<span class="tag">${T("fonía sin confirmar","phone unconfirmed")}</span>`:"",d.until?`<span class="sc-b">${T("hasta","until")} ${e2(d.until)}</span>`:""].filter(Boolean);
    let air="";try{air=(window.ACRACB_dxon?ACRACB_dxon(d):"").replace(/<br>$/,"")}catch(x){}
    let gl="";try{gl=window.ACRACB_grey?ACRACB_grey.short(p).replace(/^(Línea gris común|Shared greyline):?\s*/,""):""}catch(x){}
    const sec=(l,v)=>v?`<dt>${l}</dt><dd>${v}</dd>`:"";
    html.push(`<div class="sc dxc" role="button" tabindex="0" data-dxi="${i}"><div class="sc-h"><span class="sc-call">${nw?"★ ":"✔ "}${CS(d.call)}${cty}</span><span class="pill ${cls(n.p)}">${Math.round(n.p*100)}%</span></div>
      ${tags.length?`<div class="sc-f">${tags.join("")}</div>`:""}<dl class="sc-d">${sec(T("Actividad","Activity"),air)}
      ${sec(T("Mejor hora","Best time"),`<span class="nw">${hh(bh.h)}:00 ${T("en","on")} <b style="color:${BC[bh.b]}">${BANDS[bh.b]}</b></span> <span class="nw">(${Math.round(bh.p*100)} %${bh.lp?T(", paso largo",", long path"):""})</span>`)}
      ${sec(T("Rumbo","Bearing"),`<span class="nw">${T("corto","short")} ${az}° ${cab(az)}<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${laz}° ${cab(laz)}</span>`)}
      ${sec(T("Distancia","Distance"),`<span class="nw">${T("corto","short")} ${fk(km)} km<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${fk(lkm)} km</span>`)}
      ${sec(T("Línea gris","Greyline"),gl)}${sec("QSX",d.qsx?e2(String(d.qsx).replace(/\s*,\s*/g,", ")):"")}</dl></div>`)});
  const N=8,more=html.length>N+2&&!DXOPEN;
  box.innerHTML=(more?html.slice(0,N):html).join("")+(more?`<button type="button" class="btn llmore" id="dxmore">${T(`Ver ${html.length-N} DXpediciones más`,`Show ${html.length-N} more DXpeditions`)}</button>`:"")+
    (L.dxHidden&&MOD()==="ssb"?`<p class="note" style="margin:4px 0 0">${T(`No se muestran ${L.dxHidden} expediciones activas que no anuncian fonía.`,`${L.dxHidden} active expeditions that do not announce phone are not shown.`)}</p>`:"");
  const mb2=$("dxmore");if(mb2)mb2.onclick=()=>{DXOPEN=true;dxCards()};
  box.querySelectorAll(".dxc[data-dxi]").forEach(c=>{const o=()=>{openPop({k:"d",i:+c.dataset.dxi});go("mapa")};c.onclick=ev=>{if(ev.target.closest("a,button,.cs"))return;o()};c.onkeydown=ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();o()}}})}
window.ACRACB_dxCards=dxCards;
/* ---------- enganche ---------- */
function hook(){if(typeof window.renderSide!=="function"||window.renderSide.__cl)return false;const o=window.renderSide;
  const w=function(){const r=o.apply(this,arguments);try{if(st.page==="dx"){render(st.mhour);renderNear();dxCards()}}catch(e){console.error(e)}return r};w.__cl=1;window.renderSide=w;return true}
if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},200);setTimeout(()=>clearInterval(t),15000)}
})();

/* ---- ACRACB 2.1.6: barras que se desplazan de lado (pestañas, modos, bandas…) ----
   - El difuminado del borde solo aparece en el lado donde queda algo por ver: al llegar al final, el último botón se ve entero.
   - Al redibujarse (al pulsar un botón o cada minuto), cada barra se queda donde la dejaste en vez de volver al principio. */
(function(){
"use strict";
const SEL=".nav,.ptabs,#subnav,#dxmodes,.clbands,.mleg,.almodes,.clseg";
const KEEP=new Set(["dxmodes","clbands","mleg","albands","almodes"]);/* la barra principal (.nav) ya centra la página activa por su cuenta */
const POS={},SEEN=new WeakSet();let busy=false;
const key=e=>e.id||(e.classList.contains("albands")?"albands":e.classList.contains("almodes")?"almodes":e.classList.contains("clbands")?"clbands":e.classList.contains("mleg")?"mleg":e.classList.contains("ptabs")?"ptabs":e.classList.contains("nav")?"nav":e.classList.contains("clseg")?"seg:"+(e.getAttribute("aria-label")||""):"");
function edges(e){const max=e.scrollWidth-e.clientWidth;const l=e.scrollLeft>2,r=max-e.scrollLeft>2;
  if(e.dataset.fl!==(l?"1":""))e.dataset.fl=l?"1":"";if(e.dataset.fr!==(r?"1":""))e.dataset.fr=r?"1":""}
function scan(){if(busy)return;busy=true;try{
  document.querySelectorAll(SEL).forEach(e=>{const k=key(e);if(!k)return;e.classList.add("hscr");
    if(!SEEN.has(e)){SEEN.add(e);e.addEventListener("scroll",()=>{if(KEEP.has(k)||k.startsWith("seg:"))POS[k]=e.scrollLeft;edges(e)},{passive:true})}
    if((KEEP.has(k)||k.startsWith("seg:"))&&POS[k]!=null&&Math.abs(e.scrollLeft-POS[k])>1&&e.scrollWidth>e.clientWidth)e.scrollLeft=Math.min(POS[k],e.scrollWidth-e.clientWidth);
    edges(e)})}finally{busy=false}}
let raf=0;const later=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;scan()})};
function start(){scan();try{new MutationObserver(ms=>{if(window.ACRACB_mut(ms))later()}).observe(document.body,{childList:true,subtree:true})}catch(e){}addEventListener("resize",later,{passive:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();

/* ---- ACRACB 2.1.12: tarjetas del mismo tamaño ----
   En las listas de varias columnas (clúster, actividad cercana, DXpediciones, objetivos) todas las tarjetas
   de la misma fila miden lo mismo: la altura de la más alta de esa fila. En una sola columna (móvil) cada una mide lo que necesita. */
(function(){
"use strict";
const LISTS="#spots,#near,.goal,.alc,.satl";
const CARD=":scope>.sp,:scope>.dx,:scope>.sc";
function cols(el){const t=getComputedStyle(el).gridTemplateColumns;return t&&t!=="none"?t.trim().split(/\s+/).length:1}
/* cada apartado (DX, POTA…) se iguala por separado: un título o una nota entre tarjetas empieza un grupo nuevo */
function groups(el){const out=[];let g=[];for(const c of el.children){if(c.matches(".sp,.dx,.sc")){if(c.getClientRects().length)g.push(c)}else if(g.length){out.push(g);g=[]}}if(g.length)out.push(g);return out}
function fit(){const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;document.querySelectorAll(LISTS).forEach(el=>{if(!el.getClientRects().length)return;
  const gs=groups(el);gs.flat().forEach(c=>c.style.minHeight="");if(cols(el)<2)return;
  /* 2.4.1: se igualan las tarjetas de la misma fila, no las de toda la lista: así ninguna queda medio vacía al desplegar «Mostrar más» */
  for(const cs of gs){if(cs.length<2)continue;const rows=new Map();cs.forEach(c=>{const k=Math.round(c.getBoundingClientRect().top);if(!rows.has(k))rows.set(k,[]);rows.get(k).push(c)});
    rows.forEach(r=>{if(r.length<2)return;const h=Math.max(...r.map(c=>c.getBoundingClientRect().height));r.forEach(c=>c.style.minHeight=Math.ceil(h/z)+"px")})}})}
let raf=0,busy=false;const later=()=>{if(raf||busy)return;raf=requestAnimationFrame(()=>{raf=0;busy=true;try{fit()}finally{busy=false}})};
function start(){fit();try{new MutationObserver(m=>{if(window.ACRACB_mut(m))later()}).observe(document.body,{childList:true,subtree:true})}catch(e){}addEventListener("resize",later,{passive:true});
  document.addEventListener("toggle",later,true);document.addEventListener("click",()=>setTimeout(later,60),true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();

/* ---- ACRACB 2.2: satélites de aficionado ----
   Próximos pases sobre tu locator en las próximas 24 h, calculados en tu navegador con satellite.js (MIT)
   y los elementos orbitales públicos de CelesTrak (grupo «amateur»), que se guardan 12 h en el dispositivo.
   Frecuencias y modos según AMSAT; algunos satélites funcionan solo a ratos: su estado real está en amsat.org/status. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const SATS=[
 {id:25544,n:"ISS",kind:"FM",up:"145.990 FM (tono 67 Hz)",down:"437.800 FM",note:["Repetidor de voz. APRS en 145.825.","Voice repeater. APRS on 145.825."]},
 {id:27607,n:"SO-50",kind:"FM",up:"145.850 FM (tono 67 Hz)",down:"436.795 FM",note:["Se enciende con un tono de 74,4 Hz.","Armed with a 74.4 Hz tone."]},
 {id:43017,n:"AO-91",kind:"FM",up:"435.250 FM (tono 67 Hz)",down:"145.960 FM",note:["Funciona sobre todo con sol.","Works mainly in sunlight."]},
 {id:43678,n:"PO-101",kind:"FM",up:"437.500 FM (tono 141,3 Hz)",down:"145.900 FM",note:["Solo en horarios anunciados.","Only on announced schedules."]},
 {id:44909,n:"RS-44",kind:T("lineal","linear"),up:"145.935 – 145.995 LSB/CW",down:"435.610 – 435.670 USB/CW",note:["Transpondedor inversor: sube en LSB, baja en USB.","Inverting transponder: LSB up, USB down."]},
 {id:24278,n:"FO-29",kind:T("lineal","linear"),up:"145.900 – 146.000 LSB/CW",down:"435.900 – 435.800 USB/CW",note:["Solo en horarios anunciados.","Only on announced schedules."]},
 {id:7530,n:"AO-7",kind:T("lineal","linear"),up:"432.125 – 432.175 LSB/CW",down:"145.975 – 145.925 USB/CW",note:["Modo B; solo con sol, por su batería agotada.","Mode B; sunlight only (dead battery)."]},
 {id:53106,n:"IO-117",kind:"digital",up:"435.310",down:"435.310",note:["Digipeater (GreenCube), órbita media: pases largos.","Digipeater (GreenCube), medium orbit: long passes."]}];
const TLEURL="https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle",PROXY="https://acracb-dx.ea5jnf.workers.dev/?u=";
let REC=null,PASSES=null,calcAt=0,calcFor="",busy=false,err="",LOW=S.get("acracb_satlow")==="1";
function parse(txt){const L=String(txt||"").split(/\r?\n/).map(s=>s.trimEnd()).filter(Boolean),out={};
  for(let i=0;i+2<L.length+1;i++){if(L[i].startsWith("1 ")&&L[i+1]&&L[i+1].startsWith("2 ")){const id=+L[i].slice(2,7);out[id]=[L[i],L[i+1]];i++}}return out}
async function getTLE(){let c=null;try{c=JSON.parse(S.get("acracb_tle")||"null")}catch(e){}
  if(c&&c.t&&Date.now()-c.t<12*36e5&&c.d)return c.d;
  const tryF=async u=>{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),15000);try{const r=await fetch(u,{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);const t=await r.text();if(t.length>2e6)throw new Error("size");return t}finally{clearTimeout(tm)}};
  let txt=null;try{txt=await tryF(TLEURL)}catch(e){try{txt=await tryF(PROXY+encodeURIComponent(TLEURL))}catch(e2){}}
  const d=txt?parse(txt):null;if(d&&Object.keys(d).length){S.set("acracb_tle",JSON.stringify({t:Date.now(),d}));return d}
  if(c&&c.d)return c.d;throw new Error("tle")}
const deg=r=>r*180/Math.PI;
function look(rec,date,obs){const pv=satellite.propagate(rec,date);if(!pv||!pv.position)return null;const gmst=satellite.gstime(date);
  const ecf=satellite.eciToEcf(pv.position,gmst);const la=satellite.ecfToLookAngles(obs,ecf);return {el:deg(la.elevation),az:(deg(la.azimuth)+360)%360,km:la.rangeSat}}
function passes(rec,obs,t0,hours){const out=[];let cur=null,prev=null;const step=30e3;
  for(let t=t0;t<=t0+hours*36e5;t+=step){const a=look(rec,new Date(t),obs);if(!a)continue;
    if(a.el>0){if(!cur){let s=t;if(prev!=null){let lo=t-step,hi=t;for(let k=0;k<5;k++){const m=(lo+hi)/2,b=look(rec,new Date(m),obs);if(b&&b.el>0)hi=m;else lo=m}s=hi}cur={aos:s,azA:look(rec,new Date(s),obs).az,max:a.el,tMax:t,azM:a.az}}
      else if(a.el>cur.max){cur.max=a.el;cur.tMax=t;cur.azM=a.az}}
    else if(cur){let lo=t-step,hi=t;for(let k=0;k<5;k++){const m=(lo+hi)/2,b=look(rec,new Date(m),obs);if(b&&b.el>0)lo=m;else hi=m}cur.los=lo;cur.azL=look(rec,new Date(lo),obs).az;out.push(cur);cur=null}
    prev=a.el}
  if(cur){cur.los=t0+hours*36e5;cur.azL=null;out.push(cur)}return out}
async function calc(){if(busy||typeof satellite==="undefined")return;busy=true;err="";try{const d=await getTLE();const P=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];
  const obs={longitude:P[0]*Math.PI/180,latitude:P[1]*Math.PI/180,height:0.05};const t0=Date.now()-20*6e4,res=[];REC={};
  for(const s of SATS){const tl=d[s.id];if(!tl)continue;try{const rec=satellite.twoline2satrec(tl[0],tl[1]);REC[s.id]=rec;for(const p of passes(rec,obs,t0,24.5))res.push(Object.assign({s},p))}catch(e){}}
  PASSES=res.filter(p=>p.los>Date.now()).sort((a,b)=>a.aos-b.aos);calcAt=Date.now();calcFor=P.join(",")}catch(e){err=T("No se han podido descargar los datos de los satélites. Se volverá a intentar en unos minutos.","Satellite data could not be downloaded. It will try again in a few minutes.");calcAt=Date.now()-5.5*36e5}finally{busy=false}render()}
const hm=t=>new Date(t).toISOString().slice(11,16);
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-GB":"es-ES",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
const cabS=a=>{try{return cab(a)}catch(e){return ""}};
function inT(ms){const m=Math.round(ms/6e4);if(m<1)return T("ya","now");if(m<60)return T(`en ${m} min`,`in ${m} min`);const h=Math.floor(m/60),r=m%60;return T(`en ${h} h ${r?r+" min":""}`,`in ${h} h ${r?r+" min":""}`).trim()}
function card(p){const now=Date.now(),live=p.aos<=now&&p.los>now;let cur="";
  if(live&&REC&&REC[p.s.id]){try{const P=TXP||[-0.67,38.63];const a=look(REC[p.s.id],new Date(),{longitude:P[0]*Math.PI/180,latitude:P[1]*Math.PI/180,height:.05});if(a)cur=`<span class="nw">${T("ahora","now")} ${Math.round(a.az)}° ${cabS(a.az)}, ${T("elevación","elevation")} ${Math.max(0,Math.round(a.el))}°</span>`}catch(e){}}
  const dur=Math.round((p.los-p.aos)/6e4),mx=Math.round(p.max);
  const q=mx>=45?["xr",T("pase muy alto","very high pass")]:mx>=20?["xq",T("pase bueno","good pass")]:["xs",T("pase bajo","low pass")];
  const rumbo=`<span class="nw">${T("sale","rises")} ${Math.round(p.azA)}° ${cabS(p.azA)} ·</span> <span class="nw">${T("máx.","max")} ${Math.round(p.azM)}° ${cabS(p.azM)}${p.azL!=null?" ·":""}</span>${p.azL!=null?` <span class="nw">${T("se pone","sets")} ${Math.round(p.azL)}° ${cabS(p.azL)}</span>`:""}`;
  return `<div class="sc sat${live?" live":""}"><div class="sc-h"><span class="sc-call">${e2(p.s.n)}</span><span class="sc-age">${live?`<b class="satnow">${T("EN EL AIRE","ON AIR")}</b>`:inT(p.aos-now)}</span></div>`+
   `<div class="sc-f"><b class="sc-fq">${hm(p.aos)}–${hm(p.los)}</b><span class="sc-b">UTC · ${loc(p.aos)}–${loc(p.los)} ${T("hora local","local time")} · ${dur} min</span><span class="xtag ${q[0]}">${mx}° · ${q[1]}</span><span class="xtag">${e2(p.s.kind)}</span></div>`+
   `<dl class="sc-d">${cur?`<dt>${T("Ahora","Now")}</dt><dd>${cur}</dd>`:""}<dt>${T("Rumbo","Bearing")}</dt><dd>${rumbo}</dd><dt>${T("Subida","Uplink")}</dt><dd>${e2(EN()?p.s.up.replace(/\(tono ([\d,]+) Hz\)/,(m,x)=>"("+x.replace(",",".")+" Hz tone)"):p.s.up)}</dd><dt>${T("Bajada","Downlink")}</dt><dd>${e2(p.s.down)}</dd><dt>${T("Nota","Note")}</dt><dd>${e2(p.s.note[EN()?1:0])}</dd></dl></div>`}
function render(){const box=document.getElementById("sats");if(!box)return;
  if(typeof satellite==="undefined"){box.innerHTML=`<p class="note">${T("Los pases de satélites se calculan en la versión web de la plataforma (ea5jnf.github.io/plataforma-dx), que descarga los datos orbitales al día.","Satellite passes are calculated in the web version of the platform (ea5jnf.github.io/plataforma-dx), which downloads up-to-date orbital data.")}</p>`;return}
  if(!PASSES){box.innerHTML=`<p class="note">${err||T("Calculando los pases…","Calculating passes…")}</p>`;return}
  const list=PASSES.filter(p=>LOW||p.max>=10);const sh=list.slice(0,24);
  const head=`<div class="seg clseg"><span class="segl">${T("Pases","Passes")}</span><button type="button" data-satlow="0" aria-pressed="${!LOW}">${T("Desde 10°","From 10°")}</button><button type="button" data-satlow="1" aria-pressed="${LOW}">${T("Todos","All")}</button></div>`;
  box.innerHTML=head+`<p class="note">${T(`Próximos pases sobre tu locator en las próximas 24 h. Cuanto más alta la elevación máxima, mejor se oye. Estado real de cada satélite en <a href="https://www.amsat.org/status/" target="_blank" rel="noopener noreferrer" data-ext>AMSAT</a>.`,`Next passes over your locator in the next 24 h. The higher the maximum elevation, the better. Current status of each satellite at <a href="https://www.amsat.org/status/" target="_blank" rel="noopener noreferrer" data-ext>AMSAT</a>.`)}${err?" "+err:""}</p>`+
   (sh.length?`<div class="satl">${sh.map(card).join("")}</div>`:`<div class="empty">${T("Ningún pase en las próximas 24 h.","No passes in the next 24 h.")}</div>`)+
   `<details class="srcd"><summary>${T("Fuentes","Sources")}</summary><p class="note">${T("Elementos orbitales","Orbital elements")}: <a href="https://celestrak.org/" target="_blank" rel="noopener noreferrer" data-ext>CelesTrak</a> · ${T("cálculo","calculation")}: satellite.js (MIT) · ${T("frecuencias","frequencies")}: AMSAT · ${T("calculado a las","calculated at")} ${hm(calcAt)} UTC</p></details>`;
  box.querySelectorAll("[data-satlow]").forEach(b=>b.onclick=()=>{LOW=b.dataset.satlow==="1";S.set("acracb_satlow",LOW?"1":"0");render()})}
/* se calcula al abrir la pestaña, cada 6 h o si cambia el locator; la tarjeta se refresca cada 20 s mientras se ve */
function visible(){const d=document.getElementById("f_sat");return d&&typeof st!=="undefined"&&st.page==="dx"&&!d.classList.contains("toff")}
function tick(){if(!document.getElementById("sats"))return;const P=(typeof TXP!=="undefined"&&TXP)?TXP.join(","):"";
  if(!busy&&(!PASSES&&!err||Date.now()-calcAt>6*36e5||P!==calcFor&&calcAt)){if(visible()||!PASSES)calc()}else if(visible())render()}
window.ACRACB_sats={calc,render,getTLE,SATS,get passes(){return PASSES}};
function boot(){render();setInterval(tick,20000);setTimeout(tick,1500);document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest('.ptabs button,[data-pg="dx"]'))setTimeout(tick,50)},true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.2: línea gris común con cada entidad ----
   Busca en las próximas 24 h los ratos en que tu QTH y el destino están a la vez en la franja del amanecer o del
   anochecer (sol entre 15° bajo el horizonte y 3° sobre él). En esos ratos las bandas bajas (160, 80, 40 m)
   suelen dar señales mucho más fuertes de lo normal. Se ve en la ficha de cada indicativo, en la ficha del destino
   y en las tarjetas de DXpediciones. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const R=Math.PI/180;
/* elevación del sol (grados) en un punto [lon,lat] y un instante (ms), fórmula de NOAA simplificada */
function sunEl(p,t){const d=(t/864e5)+2440587.5-2451545.0;const g=(357.529+0.98560028*d)*R,q=280.459+0.98564736*d;
  const L=(q+1.915*Math.sin(g)+0.020*Math.sin(2*g))*R,e=(23.439-0.00000036*d)*R;
  const ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L)),dec=Math.asin(Math.sin(e)*Math.sin(L));
  const gmst=((18.697374558+24.06570982441908*d)%24+24)%24;const ha=(gmst*15+p[0])*R-ra,la=p[1]*R;
  return Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(ha))/R}
const LO=-15,HI=3;
function windows(a,b,t0,hours){const out=[];let cur=null;for(let t=t0;t<=t0+hours*36e5;t+=6e4){const ea=sunEl(a,t),eb=sunEl(b,t);
  const ok=ea>=LO&&ea<=HI&&eb>=LO&&eb<=HI;if(ok&&!cur)cur={a:t,ka:ea<sunEl(a,t+6e5)?"am":"pm",kb:eb<sunEl(b,t+6e5)?"am":"pm"};if(!ok&&cur){cur.b=t;out.push(cur);cur=null}}
  if(cur){cur.b=t0+hours*36e5;out.push(cur)}return out.filter(w=>w.b-w.a>=4*6e4)}
function events(p,t0,hours){const out=[];let prev=sunEl(p,t0);for(let t=t0+6e4;t<=t0+hours*36e5;t+=6e4){const e=sunEl(p,t);
  if(prev<-0.833&&e>=-0.833)out.push({t,k:"rise"});if(prev>=-0.833&&e<-0.833)out.push({t,k:"set"});prev=e}return out}
const hm=t=>new Date(t).toISOString().slice(11,16);
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-GB":"es-ES",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
const kk=k=>k==="am"?T("su amanecer","their sunrise"):T("su anochecer","their sunset");
const kme=k=>k==="am"?T("tu amanecer","your sunrise"):T("tu anochecer","your sunset");
const MEMO=new Map();
function calc(p){const me=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];const t0=Math.floor(Date.now()/6e5)*6e5;const k=me.join(",")+"|"+p.join(",")+"|"+t0;
  if(MEMO.has(k))return MEMO.get(k);if(MEMO.size>300)MEMO.clear();
  const r={w:windows(me,p,t0,24),me:events(me,t0,24),dx:events(p,t0,24)};MEMO.set(k,r);return r}
/* texto corto para tarjetas */
function short(p){if(!p||!isFinite(p[0])||!isFinite(p[1]))return "";const r=calc(p);const now=Date.now();
  if(!r.w.length)return "";const w=r.w[0];const live=w.a<=now&&w.b>now;
  return live?T(`Línea gris común <b>ahora</b>, hasta las ${hm(w.b)} UTC`,`Shared greyline <b>now</b>, until ${hm(w.b)} UTC`):T(`Línea gris común: <b>${hm(w.a)}–${hm(w.b)} UTC</b> (${loc(w.a)} hora local)`,`Shared greyline: <b>${hm(w.a)}–${hm(w.b)} UTC</b> (${loc(w.a)} local time)`)}
/* bloque completo para las fichas */
function block(p,name){if(!p||!isFinite(p[0])||!isFinite(p[1]))return "";const r=calc(p);const now=Date.now();
  const ev=(a)=>a.slice(0,4).map(x=>`${x.k==="rise"?T("amanecer","sunrise"):T("anochecer","sunset")} ${hm(x.t)}`).join(" · ");
  let w=r.w.length?`<ul class="glw">${r.w.map(x=>{const live=x.a<=now&&x.b>now;return `<li>${live?`<b>${T("AHORA","NOW")}</b> · `:""}<b>${hm(x.a)}–${hm(x.b)} UTC</b> <span class="note">(${loc(x.a)}–${loc(x.b)} ${T("hora local","local time")})</span> · ${kme(x.ka)} ${T("con","with")} ${kk(x.kb)}</li>`}).join("")}</ul>`
    :`<p class="note">${T("En las próximas 24 h vuestras líneas grises no coinciden: no hay ningún rato en que los dos estéis a la vez entre el amanecer y el anochecer.","In the next 24 h your greylines do not overlap: there is no time when both of you are in twilight at once.")}</p>`;
  return `<div class="glb"><h4>${T("Línea gris común","Shared greyline")}</h4>${w}<p class="note">${T("Tú","You")} (UTC): ${ev(r.me)||"—"}<br>${name?name:T("Destino","Destination")} (UTC): ${ev(r.dx)||"—"}</p><p class="note">${T("En esos ratos los dos estáis en la franja del amanecer o del anochecer; las bandas bajas (160, 80 y 40 m) suelen dar señales mucho más fuertes.","During those times both of you are in twilight; the low bands (160, 80 and 40 m) usually give much stronger signals.")}</p></div>`}
window.ACRACB_grey={sunEl,windows,events,short,block};

/* ficha de indicativo (ventana emergente) */
function posFor(call){try{const e=callEnt(call);const sp=(L.spots||[]).find(s=>String(s.call).toUpperCase()===call&&s.dx);if(sp)return [sp.dx,e];
  const d=typeof dxFor==="function"?dxFor(call):null;if(d&&isFinite(d.lon))return [[d.lon,d.lat],e];
  const t=e?TG().find(x=>x.dxcc===e.dxcc):null;return [t?[t.lon,t.lat]:null,e]}catch(e){return [null,null]}}
function hook(name,after){const o=window[name];if(typeof o!=="function"||o.__gl)return false;const w=function(){const r=o.apply(this,arguments);try{after.apply(this,arguments)}catch(e){}return r};w.__gl=1;window[name]=w;return true}
function boot(){let n=0;const t=setInterval(()=>{
  const a=hook("openCall",function(call){const c=String(call||"").toUpperCase().trim();const pan=document.querySelector("#cpop .cpan");if(!pan)return;const [p,e]=posFor(c);const h=block(p,e&&e.name);if(h)pan.insertAdjacentHTML("beforeend",h)});
  const b=hook("renderInfo",function(){const box=document.getElementById("info");if(!box)return;let z=null;try{z=TG().find(x=>x.id===st.zone)||TG()[0]}catch(e){}if(!z)return;const h=block([z.lon,z.lat],z.name);if(h)box.insertAdjacentHTML("beforeend",h)});
  const c=hook("renderSide",function(){if(typeof st==="undefined"||st.page!=="dx")return;document.querySelectorAll("#dxl .dx[data-dxi]").forEach(el=>{const d=(L.dx||[])[+el.dataset.dxi];if(!d||!isFinite(d.lon))return;const s=short([d.lon,d.lat]);if(!s)return;const w=el.querySelector(".w");if(w&&!w.querySelector(".glx"))w.insertAdjacentHTML("beforeend",`<br><span class="glx">${s}</span>`)})});
  if((a&&b&&c)||++n>75)clearInterval(t)},200)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.2: aviso de esporádica E en 6 m y 2 m ----
   Cada 5 minutos (6 m) y 10 minutos (2 m) se piden a PSK Reporter las recepciones de los últimos 15 minutos.
   Un trayecto de 700 a 2300 km en 6 m (1200 a 2300 km en 2 m) es típico de un salto por esporádica E: la nube está
   en el punto medio del trayecto. Se agrupan los puntos medios por zonas de 5° y, si una zona junta trayectos de
   varias estaciones distintas, se avisa. Además se calcula si esa nube te sirve a ti: si está a 350–1150 km de tu QTH,
   te abre hacia el otro lado de la nube, al doble de distancia. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PROXY="https://acracb-dx.ea5jnf.workers.dev/?u=";
const BANDS=[{k:"6",lbl:"6 m",fr:"50000000-54000000",min:700,max:2300,every:5,need:3},{k:"2",lbl:"2 m",fr:"144000000-146000000",min:1200,max:2300,every:10,need:2}];
const ST={};let busy=false;
const R=Math.PI/180;
function ll(loc){try{const s=normLoc(loc);if(!s||s.length<4)return null;return locToLL(s.slice(0,6))}catch(e){return null}}
function dist(a,b){const p1=a[1]*R,p2=b[1]*R,dl=(b[0]-a[0])*R;return 6371*Math.acos(Math.max(-1,Math.min(1,Math.sin(p1)*Math.sin(p2)+Math.cos(p1)*Math.cos(p2)*Math.cos(dl))))}
function mid(a,b){const p1=a[1]*R,l1=a[0]*R,p2=b[1]*R,dl=(b[0]-a[0])*R;const bx=Math.cos(p2)*Math.cos(dl),by=Math.cos(p2)*Math.sin(dl);
  const la=Math.atan2(Math.sin(p1)+Math.sin(p2),Math.sqrt((Math.cos(p1)+bx)**2+by*by)),lo=l1+Math.atan2(by,Math.cos(p1)+bx);return [((lo/R)+540)%360-180,la/R]}
function dest(p,brg,km){const d=km/6371,b=brg*R,la=p[1]*R,lo=p[0]*R;const la2=Math.asin(Math.sin(la)*Math.cos(d)+Math.cos(la)*Math.sin(d)*Math.cos(b));
  const lo2=lo+Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(la),Math.cos(d)-Math.sin(la)*Math.sin(la2));return [((lo2/R)+540)%360-180,la2/R]}
function brg(a,b){try{return Math.round(brgJS(a,b))}catch(e){const la1=a[1]*R,la2=b[1]*R,dl=(b[0]-a[0])*R;return Math.round(((Math.atan2(Math.sin(dl)*Math.cos(la2),Math.cos(la1)*Math.sin(la2)-Math.sin(la1)*Math.cos(la2)*Math.cos(dl))/R)+360)%360)}}
function placeName(p){try{let best=null,bd=1e9;for(const t of TG()){const d=dist(p,[t.lon,t.lat]);if(d<bd){bd=d;best=t}}return best&&bd<900?best.name:null}catch(e){return null}}
async function fetchBand(b){const u=`https://retrieve.pskreporter.info/query?frange=${b.fr}&flowStartSeconds=-900&rronly=1&noactive=1`;
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),20000);
  try{const r=await fetch(PROXY+encodeURIComponent(u),{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);const x=await r.text();if(x.length>6e6)throw new Error("size");return x}finally{clearTimeout(tm)}}
function analyse(b,xml){const paths=new Map();let n=0;
  for(const m of String(xml).matchAll(/<receptionReport\b([^>]*)\/?>/g)){const at={};for(const a of m[1].matchAll(/(\w+)="([^"]*)"/g))at[a[1]]=a[2];n++;
    const A=ll(at.senderLocator),B=ll(at.receiverLocator);if(!A||!B)continue;const d=dist(A,B);if(d<b.min||d>b.max)continue;
    const k=[String(at.senderCallsign||""),String(at.receiverCallsign||"")].sort().join("|");if(paths.has(k))continue;paths.set(k,{A,B,d,M:mid(A,B),tx:at.senderCallsign,rx:at.receiverCallsign,t:+at.flowStartSeconds*1000,mode:at.mode||""})}
  
  /* nubes: puntos medios a menos de 500 km unos de otros */
  const cl=[];for(const p of paths.values()){let c=cl.find(c=>dist(c.M,p.M)<500);if(!c){c={M:p.M.slice(),ps:[],calls:new Set()};cl.push(c)}c.ps.push(p);c.calls.add(p.tx);c.calls.add(p.rx);
    c.M=[c.ps.reduce((s,q)=>s+q.M[0],0)/c.ps.length,c.ps.reduce((s,q)=>s+q.M[1],0)/c.ps.length]}
  const cells=new Map(cl.map((c,i)=>[i,c]));
  const me=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];const out=[];
  for(const c of cells.values()){if(c.ps.length<b.need||c.calls.size<4)continue;const M=[c.ps.reduce((s,p)=>s+p.M[0],0)/c.ps.length,c.ps.reduce((s,p)=>s+p.M[1],0)/c.ps.length];
    const dm=dist(me,M),ds=c.ps.map(p=>p.d).sort((x,y)=>x-y);let you=null;
    if(dm>=350&&dm<=1150){const az=brg(me,M),far=dest(me,az,2*dm);you={az,km:Math.round(2*dm),to:placeName(far)}}
    out.push({M,name:placeName(M),n:c.ps.length,calls:c.calls.size,dmin:Math.round(ds[0]),dmax:Math.round(ds[ds.length-1]),last:Math.max(...c.ps.map(p=>p.t||0)),dm:Math.round(dm),you,ex:c.ps.slice(0,3).map(p=>`${p.tx} → ${p.rx} (${Math.round(p.d)} km)`)})}
  out.sort((a,b2)=>(!!b2.you-!!a.you)||b2.n-a.n);return {at:Date.now(),reports:n,paths:paths.size,clouds:out}}
async function poll(force){if(busy)return;if(document.visibilityState!=="visible"&&!force)return;busy=true;try{
  for(const b of BANDS){const s=ST[b.k];if(!force&&s&&Date.now()-s.at<b.every*6e4)continue;
    try{ST[b.k]=Object.assign(analyse(b,await fetchBand(b)),{ok:true})}catch(e){ST[b.k]={at:Date.now(),ok:false,clouds:(s&&s.clouds)||[],reports:0,paths:0}}}
  render()}finally{busy=false}}
const hm=t=>t?new Date(t).toISOString().slice(11,16):"—";
function cabS(a){try{return cab(a)}catch(e){return ""}}
function cloudCard(b,c){const where=c.name?T(`sobre ${e2(c.name)}`,`over ${e2(c.name)}`):`${c.M[1].toFixed(0)}°, ${c.M[0].toFixed(0)}°`;
  const you=c.you?T(`<b>Te puede abrir</b> hacia el ${cabS(c.you.az)} (rumbo ${c.you.az}°), a unos ${fk(c.you.km)} km${c.you.to?`: ${e2(c.you.to)}`:""}.`,`<b>It may open for you</b> towards the ${cabS(c.you.az)} (bearing ${c.you.az}°), about ${fk(c.you.km)} km away${c.you.to?`: ${e2(c.you.to)}`:""}.`)
    :T(`La nube está a ${fk(c.dm)} km de tu QTH: queda ${c.dm<350?"demasiado cerca":"demasiado lejos"} para un salto desde aquí.`,`The cloud is ${fk(c.dm)} km from your QTH: ${c.dm<350?"too close":"too far"} for a hop from here.`);
  return `<div class="sc es${c.you?" live":""}"><div class="sc-h"><span class="sc-call">${T("Esporádica E","Sporadic E")} · ${b.lbl}</span><span class="sc-age">${T("último a las","last at")} ${hm(c.last)} UTC</span></div>`+
    `<div class="sc-f"><span class="xtag ${c.you?"xr":"xq"}">${c.you?T("te sirve","usable for you"):T("en otra zona","elsewhere")}</span><span class="sc-b">${where}</span></div>`+
    `<dl class="sc-d"><dt>${T("Para ti","For you")}</dt><dd>${you}</dd><dt>${T("Trayectos","Paths")}</dt><dd>${c.n} ${T("en 15 min","in 15 min")}, ${c.calls} ${T("estaciones","stations")}, ${fk(c.dmin)}–${fk(c.dmax)} km</dd><dt>${T("Ejemplos","Examples")}</dt><dd>${c.ex.map(e2).join("<br>")}</dd></dl></div>`}
function render(){const box=document.getElementById("esbox");if(!box)return;
  if(typeof fetch==="undefined"||(typeof ART!=="undefined"&&ART)){box.innerHTML=`<p class="note">${T("El aviso de esporádica E funciona en la versión web, que consulta PSK Reporter.","The sporadic-E alert works in the web version, which queries PSK Reporter.")}</p>`;return}
  const all=BANDS.map(b=>[b,ST[b.k]]).filter(([,s])=>s);if(!all.length){box.innerHTML=`<p class="note">${T("Consultando PSK Reporter…","Querying PSK Reporter…")}</p>`;return}
  const cl=[];all.forEach(([b,s])=>(s.clouds||[]).forEach(c=>cl.push([b,c])));
  const st2=all.map(([b,s])=>`${b.lbl}: ${s.ok?T(`${s.paths} trayectos de 700–2300 km entre ${s.reports} recepciones`,`${s.paths} paths of 700–2300 km out of ${s.reports} reports`):T("sin respuesta","no response")} (${hm(s.at)} UTC)`).join(" · ");
  box.innerHTML=(cl.length?`<div class="esl">${cl.map(([b,c])=>cloudCard(b,c)).join("")}</div>`:`<div class="empty">${T("Ahora no se ve esporádica E en Europa ni cerca: ningún grupo de trayectos de un salto en 6 m ni en 2 m en los últimos 15 minutos.","No sporadic E seen right now: no group of single-hop paths on 6 m or 2 m in the last 15 minutes.")}</div>`)+
    `<details class="srcd"><summary>${T("Cómo se calcula","How it is worked out")}</summary><p class="note">${T("Recepciones de PSK Reporter de los últimos 15 minutos. Un trayecto de 700 a 2300 km en 6 m (1200 a 2300 km en 2 m) suele ser un salto por esporádica E, con la nube en el punto medio. Se avisa cuando varias estaciones distintas coinciden en la misma zona. Te sirve si la nube está a 350–1150 km de tu QTH.","PSK Reporter reports from the last 15 minutes. A 700–2300 km path on 6 m (1200–2300 km on 2 m) is usually a sporadic-E hop, with the cloud at its midpoint. An alert is shown when several different stations meet in the same area. It is usable for you if the cloud is 350–1150 km from your QTH.")}<br>${st2}</p></details>`;
  /* aviso en «Ahora» cuando hay una nube que te sirve */
  const top=cl.find(([,c])=>c.you);let bar=document.getElementById("esbar");const sec=document.querySelector('section.page[data-pg="ahora"]');
  if(top&&sec){if(!bar){bar=document.createElement("div");bar.id="esbar";bar.className="card esbar";bar.setAttribute("role","status");sec.insertBefore(bar,sec.firstChild)}
    const [b,c]=top;bar.innerHTML=`<b>${T("Esporádica E en","Sporadic E on")} ${b.lbl}</b> · ${T(`te puede abrir hacia el ${cabS(c.you.az)} (${c.you.az}°)${c.you.to?`, ${e2(c.you.to)}`:""}`,`may open for you towards the ${cabS(c.you.az)} (${c.you.az}°)${c.you.to?`, ${e2(c.you.to)}`:""}`)} · ${c.n} ${T("trayectos en 15 min","paths in 15 min")} <button type="button" class="btn" id="esgo">${T("Ver","View")}</button>`;
    bar.hidden=false;const g=document.getElementById("esgo");if(g)g.onclick=()=>{try{go("ahora");selTab("ahora","f_vhf",true);const d=document.getElementById("f_vhf");if(d){d.open=true;d.scrollIntoView({behavior:"smooth",block:"start"})}}catch(e){}}}
  else if(bar)bar.hidden=true}
window.ACRACB_es={poll,render,analyse,get state(){return ST}};
function boot(){if(typeof ART!=="undefined"&&ART){const v0=document.getElementById("vhfo");if(v0&&!document.getElementById("esbox")){const h=document.createElement("div");h.className="esw";h.innerHTML=`<h3 class="esh">${T("Esporádica E ahora","Sporadic E now")}</h3><div id="esbox"></div>`;v0.parentNode.insertBefore(h,v0)}render();return}
  const v=document.getElementById("vhfo");if(v&&!document.getElementById("esbox")){const h=document.createElement("div");h.className="esw";h.innerHTML=`<h3 class="esh">${T("Esporádica E ahora","Sporadic E now")}</h3><div id="esbox"></div>`;v.parentNode.insertBefore(h,v)}
  render();setTimeout(()=>poll(false),4000);setInterval(()=>poll(false),60000);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")poll(false)})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.2.1: «Tu estación» plegada ----
   A la vista solo quedan el locator y el modo, que es lo que más cambia la previsión. Banda, potencia, antena,
   altitud y entorno pasan a un desplegable cerrado con valores por defecto razonables; cerrado enseña un resumen
   en una línea. Se recuerda si lo dejaste abierto. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const grp=id=>{const e=document.getElementById(id);return e?e.closest(".grp"):null};
const txt=id=>{const e=document.getElementById(id);if(!e)return "";const o=e.options&&e.options[e.selectedIndex];return o?o.textContent.trim():""};
function sum(){const d=document.getElementById("stmore");if(!d)return;const out=[];
  const p=txt("eq").split(" · ")[0];if(p)out.push(p);
  const a=txt("antsel").replace(/\s*\(.*$/,"");if(a)out.push(a);
  const g=document.getElementById("gnd");if(g){const v=g.value;out.push(v==="rock"?T("suelo seco","dry ground"):v==="avg"?T("tierra normal","average ground"):v==="coast"?T("junto al mar","by the sea"):T("agua salada","salt water"))}
  const al=document.getElementById("altin");if(al&&al.value!=="")out.push(T("altitud ","altitude ")+al.value+" m");
  const b=txt("bandsel");out.push(document.getElementById("bandsel")&&document.getElementById("bandsel").value?b:T("todas las bandas","all bands"));
  d.querySelector(".stsum").textContent=out.join(" · ")}
function build(){if(document.getElementById("stmore"))return true;const box=document.querySelector(".hsel");if(!box||!document.getElementById("gnd"))return false;
  const parts=["bandsel","eq","antsel","altin","gnd"].map(grp).filter(Boolean);if(!parts.length)return false;
  const d=document.createElement("details");d.id="stmore";d.className="stmore";
  d.innerHTML=`<summary><span class="stt">${T("Tu estación","Your station")}</span> <span class="sto">${T("opcional","optional")}</span><span class="stsum"></span></summary><div class="hsel stin"></div><p class="note stnote">${T("Si no lo tocas, la previsión usa la estación del radioclub: 100 W, directiva de 3 elementos y dipolos de 80 y 160 m. Ajústalo a tu equipo para afinar el resultado.","If you leave it alone, the forecast uses the club station: 100 W, a 3-element Yagi and 80 and 160 m dipoles. Set it to your own equipment for a closer result.")}</p>`;
  const inner=d.querySelector(".stin");parts.forEach(p=>inner.appendChild(p));
  box.insertAdjacentElement("afterend",d);
  d.open=S.get("acracb_stmore")==="1";d.addEventListener("toggle",()=>S.set("acracb_stmore",d.open?"1":""));
  inner.addEventListener("change",sum);inner.addEventListener("input",sum);sum();setInterval(()=>{if(document.visibilityState==="visible")sum()},5000);return true}
function boot(){let n=0;const t=setInterval(()=>{if(build()||++n>50)clearInterval(t)},150)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.4.1: la ISS y los satélites de radioaficionado en el mapa ----
   Botones «ISS» y «Satélites» en «Qué ver» (solo en la web, con las órbitas de CelesTrak que usa la pestaña Satélites).
   ISS: posición, zona desde la que se la oye, recorrido de la próxima hora y media y de los últimos 45 minutos, altura,
   velocidad, si la oyes ahora desde tu QTH, su próximo paso y sus frecuencias.
   Satélites: dónde está cada uno; los que oyes ahora salen resaltados con su zona de cobertura. Se actualiza cada 20 s. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const R=Math.PI/180;const REC=new Map();let recAt=0,busy=false;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SATS=()=>(window.ACRACB_sats&&ACRACB_sats.SATS)||[{id:25544,n:"ISS"}];
async function load(){if(REC.size&&Date.now()-recAt<6*36e5)return;if(busy||!window.ACRACB_sats||!ACRACB_sats.getTLE)return;busy=true;
  try{const d=await ACRACB_sats.getTLE();if(d){SATS().forEach(s=>{const tl=d[s.id];if(tl)try{REC.set(s.id,satellite.twoline2satrec(tl[0],tl[1]))}catch(e){}});recAt=Date.now()}}catch(e){}finally{busy=false}}
function at(r,t){const d=new Date(t),pv=satellite.propagate(r,d);if(!pv||!pv.position)return null;const g=satellite.eciToGeodetic(pv.position,satellite.gstime(d));
  let lon=g.longitude/R;lon=((lon+540)%360)-180;return {lon,lat:g.latitude/R,h:g.height,v:pv.velocity?Math.hypot(pv.velocity.x,pv.velocity.y,pv.velocity.z):0}}
function track(r,a,b){const out=[];for(let t=a;t<=b;t+=30e3){const p=at(r,t);if(p)out.push([p.lon,p.lat])}return out}
const ok=()=>typeof st!=="undefined"&&st.ly&&st.mapOn&&typeof satellite!=="undefined";
const onISS=()=>ok()&&st.ly.iss,onSats=()=>ok()&&st.ly.sats;
const me=()=>(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];
const foot=h=>Math.acos(6371/(6371+h))/R;
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-GB":"es-ES",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
const ll=(lat,lon)=>`${Math.abs(lat).toFixed(1).replace(".",EN()?".":",")}° ${lat>=0?"N":"S"}, ${Math.abs(lon).toFixed(1).replace(".",EN()?".":",")}° ${lon>=0?"E":(EN()?"W":"O")}`;
const nf=n=>Math.round(n).toLocaleString(EN()?"en-GB":"es-ES");
function nextPass(id){try{const now=Date.now();return (ACRACB_sats.passes||[]).find(p=>p.s&&p.s.id===id&&p.los>now)||null}catch(e){return null}}
function draw(){const old=document.getElementById("issg");if(old)old.remove();note();if(!(onISS()||onSats())||typeof ZROOT==="undefined"||!ZROOT||typeof PR==="undefined"||!PR)return;
  if(!REC.size){load().then(()=>{if(REC.size)draw()});return}
  const now=Date.now(),path=d3.geoPath(PR),k=(typeof ZT!=="undefined"&&ZT&&ZT.k)||1,s=Math.pow(k,.75);
  const g=ZROOT.append("g").attr("id","issg").attr("class","issg").attr("pointer-events","none");
  if(onSats())SATS().forEach(sd=>{if(sd.id===25544)return;const r=REC.get(sd.id);if(!r)return;const p=at(r,now);if(!p)return;const q=PR([p.lon,p.lat]);if(!q)return;
    const hear=d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h);
    if(hear)g.append("path").attr("class","satfoot").attr("d",path(d3.geoCircle().center([p.lon,p.lat]).radius(foot(p.h)).precision(2)()));
    g.append("rect").attr("class","satdot"+(hear?" on":"")).attr("x",q[0]-3.5/s).attr("y",q[1]-3.5/s).attr("width",7/s).attr("height",7/s);
    g.append("text").attr("class","satlbl"+(hear?" on":"")).attr("x",q[0]+7/s).attr("y",q[1]+4/s).attr("paint-order","stroke").text(sd.n)});
  if(onISS()){const r=REC.get(25544);const p=r&&at(r,now);if(p){const f=foot(p.h);
    g.append("path").attr("class","issfoot").attr("d",path(d3.geoCircle().center([p.lon,p.lat]).radius(f).precision(2)()));
    const past=track(r,now-45*6e4,now),next=track(r,now,now+95*6e4);
    if(past.length>1)g.append("path").attr("class","isspast").attr("d",path({type:"LineString",coordinates:past}));
    if(next.length>1)g.append("path").attr("class","issnext").attr("d",path({type:"LineString",coordinates:next}));
    const q=PR([p.lon,p.lat]);if(q){g.append("circle").attr("class","issdot").attr("cx",q[0]).attr("cy",q[1]).attr("r",6/s);
      g.append("text").attr("class","isslbl").attr("x",q[0]+9/s).attr("y",q[1]+4/s).attr("paint-order","stroke").text("ISS")}}}
  note()}
/* panel de datos bajo la leyenda */
function note(){let n=document.getElementById("issnote");if(!(onISS()||onSats())){if(n)n.remove();return}
  if(!n){const mw=document.querySelector("#mapcard .mapwrap")||document.getElementById("mlegend");if(!mw)return;n=document.createElement("div");n.id="issnote";n.className="issnote";mw.insertAdjacentElement("afterend",n)}
  if(!REC.size){n.innerHTML=`<p class="note">${T("Cargando las órbitas…","Loading orbits…")}</p>`;return}
  const now=Date.now();let h="";
  if(onISS()){const r=REC.get(25544),p=r&&at(r,now);if(p){const hear=d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h);const np=nextPass(25544);
    h+=`<div class="sn-c"><div class="sn-h"><b>ISS</b>${hear?`<span class="xtag xs">${T("LA OYES AHORA","IN RANGE NOW")}</span>`:""}</div><dl class="sc-d">
      <dt>${T("Posición","Position")}</dt><dd>${ll(p.lat,p.lon)}</dd>
      <dt>${T("Altura","Altitude")}</dt><dd>${nf(p.h)} km</dd>
      <dt>${T("Velocidad","Speed")}</dt><dd>${nf(p.v*3600)} km/h</dd>
      <dt>${T("Próximo paso","Next pass")}</dt><dd>${np?`${loc(np.aos)}–${loc(np.los)} ${T("hora local","local time")} · ${T("máx.","max")} ${Math.round(np.max)}°`:T("ninguno en 24 h","none in 24 h")}</dd>
      <dt>${T("Frecuencias","Frequencies")}</dt><dd>${T("Voz","Voice")} 145.800 FM · APRS 145.825 · ${T("repetidor","repeater")} 145.990 ↑ / 437.800 ↓</dd></dl>
      <p class="note">${T("Círculo: zona desde la que se la oye · línea continua: próxima hora y media · punteada: últimos 45 minutos.","Circle: area where it can be heard · solid line: next hour and a half · dotted: last 45 minutes.")}</p></div>`}}
  if(onSats()){const list=SATS().filter(s=>s.id!==25544&&REC.get(s.id)).map(s=>{const p=at(REC.get(s.id),now);return {s,p,hear:p&&d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h),np:nextPass(s.id)}}).filter(x=>x.p);
    const on=list.filter(x=>x.hear),off=list.filter(x=>!x.hear&&x.np).sort((a,b)=>a.np.aos-b.np.aos).slice(0,4);
    h+=`<div class="sn-c"><div class="sn-h"><b>${T("Satélites de radioaficionado","Amateur satellites")}</b></div><dl class="sc-d">
      <dt>${T("Los oyes ahora","In range now")}</dt><dd>${on.length?on.map(x=>`<b>${e2(x.s.n)}</b> ${e2(x.s.down)}`).join("<br>"):T("ninguno","none")}</dd>
      <dt>${T("Próximos","Next")}</dt><dd>${off.length?off.map(x=>`<b>${e2(x.s.n)}</b> ${loc(x.np.aos)} (${T("máx.","max")} ${Math.round(x.np.max)}°)`).join("<br>"):"—"}</dd></dl>
      <p class="note">${T("Cuadrado: posición de cada satélite; los que oyes ahora van resaltados con su zona de cobertura. Frecuencias y pasos completos en DX › Satélites.","Square: each satellite's position; those in range are highlighted with their footprint. Frequencies and full passes in DX › Satellites.")}</p></div>`}
  if(n.innerHTML!==h)n.innerHTML=h}
function hook(){const o=window.drawMap;if(typeof o!=="function"||o.__iss)return false;const w=function(){const r=o.apply(this,arguments);try{draw()}catch(e){}return r};w.__iss=1;window.drawMap=w;return true}
function btns(){const sw=document.getElementById("mapsw");if(!sw)return false;if(typeof satellite==="undefined")return true;
  const mk=(ly,txt,tt)=>{if(sw.querySelector(`[data-ly="${ly}"]`))return;const b=document.createElement("button");b.dataset.ly=ly;b.textContent=txt;b.title=tt;b.setAttribute("aria-pressed",String(!!(st.ly&&st.ly[ly]&&st.mapOn)));
    b.onclick=()=>{st.ly[ly]=!st.ly[ly];if(st.ly[ly]&&!st.mapOn)st.mapOn=true;try{store.set("ly",JSON.stringify(st.ly))}catch(e){}try{renderBandSeg()}catch(e){}drawMap()};sw.appendChild(b)};
  mk("iss","ISS",T("Estación espacial internacional: dónde está, por dónde pasará y cómo oírla","International Space Station: where it is, where it will pass and how to hear it"));
  mk("sats",T("Satélites","Satellites"),T("Satélites de radioaficionado: dónde está cada uno y cuáles oyes ahora","Amateur satellites: where each one is and which ones are in range"));return true}
function boot(){let n=0;const t=setInterval(()=>{const a=hook(),b=btns();if((a&&b)||++n>75)clearInterval(t)},200);
  setInterval(()=>{if((onISS()||onSats())&&document.visibilityState==="visible"&&typeof st!=="undefined"&&st.page==="mapa"){try{draw()}catch(e){}}},20000)}
window.ACRACB_iss={draw,at:(t)=>REC.get(25544)&&at(REC.get(25544),t||Date.now())};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.3: «Hora a hora» explicado ----
   Añade a la tabla una frase que dice qué es cada casilla, un rótulo para los tramos, una leyenda más clara
   (incluidas las casillas rayadas) y un desplegable «Cómo se lee esta tabla». */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
function info(){let n=0,C=false,mode="SSB";try{C=st.mode==="contest";n=TG().filter(inMode).length}catch(e){}
  try{const m=document.getElementById("modesel");if(m&&m.selectedIndex>=0)mode=m.options[m.selectedIndex].textContent.trim()}catch(e){}return {n,C,mode}}
function enhance(){const el=document.getElementById("tl");if(!el)return;const hm=el.querySelector(".hm2");if(!hm||el.querySelector(".tlintro"))return;
  const {n,C,mode}=info();
  const intro=document.createElement("p");intro.className="tlintro";
  intro.innerHTML=C?T(`Cada columna es una hora (hora local) y cada fila, una banda. El color de la casilla dice qué parte de los <b>multiplicadores posibles</b> se pueden trabajar a esa hora en esa banda: cuanto más verde, mejor.`,`Each column is an hour (local time) and each row a band. The colour of each cell shows what share of the <b>possible multipliers</b> can be worked at that hour on that band: the greener, the better.`)
    :T(`Cada columna es una hora (hora local) y cada fila, una banda. El color de la casilla dice qué parte de los <b>${n} destinos DX</b> tienen a esa hora al menos un <b>30 % de probabilidad</b> de contacto en ${mode} con tu estación: cuanto más verde, más mundo abierto.`,`Each column is an hour (local time) and each row a band. The colour of each cell shows what share of the <b>${n} DX destinations</b> have at least a <b>30 % chance</b> of a contact in ${mode} with your station at that hour: the greener, the more of the world is open.`);
  hm.insertAdjacentElement("beforebegin",intro);
  const ul=el.querySelector(".tlseg");if(ul&&!el.querySelector(".tlsegh")){const h=document.createElement("p");h.className="tlsegh";h.textContent=T("Banda recomendada en cada tramo del día:","Recommended band for each part of the day:");ul.insertAdjacentElement("beforebegin",h)}
  const leg=el.querySelector(".hmleg");if(leg){const na=hm.querySelector("i.na")?`<span class="hmli"><i class="na"></i>${T("rayada: tu antena no trabaja en esa banda","hatched: your antenna does not work on that band")}</span>`:"";
    leg.outerHTML=`<div class="hmleg hmleg2"><span class="hmlt">${C?T("Multiplicadores que se pueden trabajar:","Multipliers that can be worked:"):T("Parte de los destinos DX abiertos:","Share of DX destinations open:")}</span><span class="hmli"><i class="c0"></i>${T("ninguno","none")}</span><span class="hmli"><i class="c1"></i>${T("menos del 15 %","under 15 %")}</span><span class="hmli"><i class="c2"></i>15–30 %</span><span class="hmli"><i class="c3"></i>30–50 %</span><span class="hmli"><i class="c4"></i>50–70 %</span><span class="hmli"><i class="c5"></i>${T("más del 70 %","over 70 %")}</span>${na}</div>
    <div class="hmleg hmleg2"><span class="hmlt">${T("Fila «Sol» en tu QTH:","«Sun» row at your QTH:")}</span><span class="hmli"><i class="dn dn-d"></i>${T("día","day")}</span><span class="hmli"><i class="dn dn-g"></i>${T("línea gris (amanecer y anochecer)","greyline (dawn and dusk)")}</span><span class="hmli"><i class="dn dn-n"></i>${T("noche","night")}</span><span class="hmli"><i class="selk"></i>${T("hora elegida","selected hour")}</span></div>`}
  if(!el.querySelector(".tlhow")){const d=document.createElement("details");d.className="tlhow";
    d.innerHTML=`<summary>${T("Cómo se lee esta tabla","How to read this table")}</summary><ul>
<li>${C?T("<b>Multiplicador posible:</b> una entidad o zona que cuenta como multiplicador en el concurso y a la que la previsión da al menos un 30 % de probabilidad de contacto a esa hora.","<b>Possible multiplier:</b> an entity or zone that counts as a multiplier in the contest and that the forecast gives at least a 30 % chance at that hour.")
  :T(`<b>Destino abierto:</b> la previsión VOACAP da al menos un 30 % de probabilidad de hacer el contacto en ${mode} con tu potencia y tu antena. El modo cuenta mucho: SSB necesita bastante más señal que CW o FT8, así que con FT8 verás más casillas verdes. En modo DX solo cuentan los destinos a más de 2.500 km y las entidades escasas, por el camino corto o por el largo, el que sea mejor.`,`<b>Open destination:</b> the VOACAP forecast gives at least a 30 % chance of making the contact in ${mode} with your power and antenna. The mode matters a lot: SSB needs much more signal than CW or FT8, so with FT8 you will see more green cells. In DX mode only destinations over 2,500 km and rare entities count, via the short or the long path, whichever is better.`)}</li>
<li>${T("<b>Fila «Mejor»:</b> la banda que más destinos abre en cada hora, con su color. Los recuadros de arriba agrupan las horas seguidas en las que esa banda es la mejor.","<b>«Best» row:</b> the band that opens the most destinations at each hour, in its colour. The boxes above group consecutive hours in which that band is the best.")}</li>
<li>${T("<b>Fila «Sol»:</b> si en tu QTH es de día, de noche o línea gris. Por regla general las bandas altas (10 a 20 m) se abren de día, las bajas (40 a 160 m) de noche, y en la línea gris mejora casi todo.","<b>«Sun» row:</b> whether it is day, night or greyline at your QTH. As a rule the high bands (10 to 20 m) open by day, the low bands (40 to 160 m) at night, and almost everything improves at the greyline.")}</li>
<li>${T("<b>Casillas rayadas:</b> la antena elegida en «Tu estación» no trabaja en esa banda. Cámbiala en los ajustes de arriba si tienes otra.","<b>Hatched cells:</b> the antenna chosen under «Your station» does not work on that band. Change it in the settings above if you have another one.")}</li>
<li>${T("<b>Recuadro blanco:</b> la hora elegida. Toca cualquier casilla para ver esa hora en el mapa y en el resto de la plataforma; la hora de ahora va en color en la fila de las horas.","<b>White frame:</b> the selected hour. Tap any cell to see that hour on the map and in the rest of the platform; the current hour is shown in colour on the hours row.")}</li>
<li>${T("Es una previsión media para este mes con la actividad solar de hoy: unos días irá mejor y otros peor. Lo que se oye de verdad está en DX › Clúster y en Balizas.","It is an average forecast for this month with today's solar activity: some days will be better and others worse. What is actually being heard is in DX › Cluster and in Beacons.")}</li></ul>`;
    const at=el.querySelectorAll(".hmleg2");(at[at.length-1]||hm).insertAdjacentElement("afterend",d);
    try{d.open=localStorage.getItem("acracb_tlhow")==="1"}catch(e){}d.addEventListener("toggle",()=>{try{localStorage.setItem("acracb_tlhow",d.open?"1":"")}catch(e){}})}}
function boot(){const el=document.getElementById("tl");if(!el)return setTimeout(boot,300);enhance();try{new MutationObserver(()=>enhance()).observe(el,{childList:true})}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.4: mapa fino y ligero ----
   Costas y fronteras se dibujan solo para lo que se ve (con margen para poder arrastrar) y sin los puntos que caen a
   menos de 0,8 píxeles unos de otros. Con poco zoom se usa el mapa de 1:110 millones; a partir de 3 aumentos, el de
   1:50 millones, unas 5 veces más detallado,, que se descarga solo la primera vez que hace falta. Se recalcula al
   terminar cada gesto, así que mientras se arrastra o se amplía no hay trabajo extra. */
(function(){
"use strict";
let G110=null,G50=null,loading=false,tm=null,lastKey="",CACHE_D=null;
function build(w){const land=topojson.feature(w,w.objects.countries);land.features.forEach(f=>{const g=f.geometry;if(!g)return;const P=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];P.forEach(p=>{if(d3.geoArea({type:"Polygon",coordinates:p})>2*Math.PI)p.forEach(r=>r.reverse())})});
  return {land,borders:topojson.mesh(w,w.objects.countries,(a,b)=>a!==b)}}
function load(){if(loading||G50||!window.ACRACB_W50URL)return;loading=true;const s=document.createElement("script");s.src=window.ACRACB_W50URL;s.async=true;
  s.onload=()=>{loading=false;try{if(window.ACRACB_W50){G50=build(window.ACRACB_W50);window.ACRACB_W50=null;lastKey="";CACHE_D=null;redraw()}}catch(e){}};s.onerror=()=>{loading=false};document.head.appendChild(s)}
/* quita puntos casi repetidos (en píxeles de la vista), conservando el primero y el último de cada línea */
function thin(out,tol){const t2=tol*tol;let lx=0,ly=0,px=0,py=0,pend=false,inLine=false;
  return {point(x,y){if(!inLine){out.point(x,y);return}if(pend===null){out.point(x,y);lx=x;ly=y;pend=false;return}
      const dx=x-lx,dy=y-ly;if(dx*dx+dy*dy<t2){px=x;py=y;pend=true;return}out.point(x,y);lx=x;ly=y;pend=false},
    lineStart(){inLine=true;pend=null;out.lineStart()},lineEnd(){if(pend===true)out.point(px,py);inLine=false;pend=false;out.lineEnd()},
    polygonStart(){out.polygonStart()},polygonEnd(){out.polygonEnd()},sphere(){out.sphere&&out.sphere()}}}
function redraw(){if(typeof PR==="undefined"||!PR||typeof ZSVG==="undefined"||!ZSVG)return;const svg=ZSVG.node();const land=svg.querySelector("path.land"),bord=svg.querySelector("path.bord");if(!land||!bord)return;
  if(typeof GEO!=="undefined"&&GEO&&!G110&&GEO!==G50)G110=GEO;if(!G110)return;
  const k=(typeof ZT!=="undefined"&&ZT&&ZT.k)||1,tx=(ZT&&ZT.x)||0,ty=(ZT&&ZT.y)||0;
  const vb=(svg.getAttribute("viewBox")||"0 0 900 900").split(/\s+/).map(Number),W=vb[2],H=vb[3];
  const fine=k>=3;if(fine&&!G50)load();const G=fine&&G50?G50:G110;
  /* zona visible en coordenadas del mapa sin ampliar, con medio ancho de margen por cada lado */
  const x0=-tx/k,y0=-ty/k,w=W/k,h=H/k,ext=k>1.05?[[x0-w*.35,y0-h*.35],[x0+w*1.35,y0+h*1.35]]:null;
  const key=(G===G50?"50":"110")+"|"+(ext?ext.flat().map(v=>Math.round(v)).join(","):"all")+"|"+Math.round(k*100)+"|"+W+"x"+H+"|"+PR.rotate().join(",")+"|"+PR.scale();
  /* si la vista no ha cambiado, se reutiliza lo ya calculado (redibujar el mapa no obliga a recalcular las costas) */
  if(key===lastKey&&CACHE_D){if(land.getAttribute("d")!==CACHE_D[0])land.setAttribute("d",CACHE_D[0]);if(bord.getAttribute("d")!==CACHE_D[1])bord.setAttribute("d",CACHE_D[1]);return}lastKey=key;
  const pr=d3.geoAzimuthalEquidistant().rotate(PR.rotate()).scale(PR.scale()).translate(PR.translate()).precision(.35/Math.max(1,Math.min(k,24)));if(ext)pr.clipExtent(ext);
  const tol=.8/k,path=d3.geoPath({stream:s=>pr.stream(thin(s,tol))});
  CACHE_D=[path(G.land)||"",path(G.borders)||""];land.setAttribute("d",CACHE_D[0]);bord.setAttribute("d",CACHE_D[1])}
/* Safari (iPhone) a veces pinta el borde de los textos encima de la letra si el orden solo viene de la hoja de estilos:
   se pone también como atributo en cada texto, que es lo que respeta siempre */
function halo(){const svg=typeof ZSVG!=="undefined"&&ZSVG&&ZSVG.node();if(!svg)return;svg.querySelectorAll("text:not([paint-order])").forEach(t=>t.setAttribute("paint-order","stroke"))}
function later(){clearTimeout(tm);tm=setTimeout(()=>{redraw();halo()},90)}
function hookZ(){if(typeof ZM==="undefined"||!ZM)return false;ZM.on("end.fino",later);return true}
function hookD(){const o=window.drawMap;if(typeof o!=="function"||o.__fino)return false;const w=function(){const r=o.apply(this,arguments);try{redraw()}catch(e){}return r};w.__fino=1;window.drawMap=w;return true}
function boot(){let n=0;const t=setInterval(()=>{const a=hookZ(),b=hookD();if((a&&b)||++n>300)clearInterval(t)},300)}
window.ACRACB_mapfino={redraw};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.4: mapa a pantalla completa sin estorbar ----
   Los paneles (controles y leyenda) son translúcidos y, tras 4 segundos sin tocar nada, se apartan casi del todo
   para dejar ver el mapa azimutal entero. Vuelven al mover el ratón, tocar la pantalla o usar el teclado,
   y no se apartan mientras el ratón está encima de ellos. */
(function(){
"use strict";
let tm=null;
function card(){return document.getElementById("mapcard")}
function wake(){const c=card();if(!c)return;if(c.classList.contains("idle"))c.classList.remove("idle");clearTimeout(tm);if(!c.classList.contains("fsm"))return;
  tm=setTimeout(()=>{const c2=card();if(!c2||!c2.classList.contains("fsm"))return;if(c2.querySelector(".mapctl:hover,.legend:hover,.mfloat:hover,.mpop:not([hidden])"))return wake();
    const a=document.activeElement;if(a&&c2.contains(a)&&/^(INPUT|SELECT)$/.test(a.tagName))return wake();c2.classList.add("idle")},4000)}
function boot(){const c=card();if(!c)return setTimeout(boot,400);
  ["mousemove","pointerdown","touchstart","keydown","wheel"].forEach(ev=>c.addEventListener(ev,wake,{passive:true}));
  /* solo interesa cuando entra o sale de pantalla completa (no los cambios de «idle», que harían un bucle) */
  let fs=c.classList.contains("fsm");try{new MutationObserver(()=>{const f=c.classList.contains("fsm");if(f!==fs){fs=f;wake()}}).observe(c,{attributes:true,attributeFilter:["class"]})}catch(e){}wake()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
/* ---- 2.4.1: botones del mapa al instante ----
   Al pulsar un botón, el botón se marca enseguida y el mapa se redibuja en el siguiente fotograma; si se pulsan
   varios seguidos, se redibuja una sola vez. Fuera de los clics, el mapa se dibuja igual que siempre. */
(function(){
"use strict";
function wrap(){const o=window.drawMap;if(typeof o!=="function")return false;if(o.__ok)return true;
  if(!(window.ACRACB_mapfino&&window.ACRACB_iss)||!(o.__iss||o.__fino))return false;/* espera a que estén puestos los demás añadidos del mapa */
  let pend=false;const w=function(){const ev=window.event;if(ev&&(ev.type==="click"||ev.type==="change"||ev.type==="input")){if(!pend){pend=true;requestAnimationFrame(()=>{pend=false;try{o()}catch(e){}})}return}return o.apply(this,arguments)};
  w.__ok=1;w.__iss=1;w.__fino=1;window.drawMap=w;return true}
let n=0;const t=setInterval(()=>{if(wrap()||++n>100)clearInterval(t)},300);
})();

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
function render(){const box=document.getElementById("easy");if(!box||typeof L==="undefined")return;let el=document.getElementById("solsum");const it=items();
  if(!it.length){if(el)el.remove();return}
  const chips=a=>`<div class="solsum-k">${a.map(([k,v,l])=>`<span class="ssk lvk-${l}"><i></i><span class="ssk-k">${k}</span><b>${e2(v)}</b></span>`).join("")}</div>`;
  const grp=(t,a)=>a.length?`<div class="solsum-g"><h4>${t}</h4>${chips(a)}</div>`:"";
  const ns=notes();
  const h=`<div class="solsum-h"><b>${T("El Sol ahora","The Sun now")}</b><span class="solsum-v">${verdict(it.concat(more()))}</span><button type="button" class="lnk" id="solgo">${T("Más datos","More data")}</button></div>`+
    grp(T("Valores reales ahora","Live values"),it.concat(more()))+grp(T("Próximas horas y días","Next hours and days"),ahead())+grp(T("Ciclo solar","Solar cycle"),cycle())+
    (ns.length?`<dl class="solsum-n">${ns.map(x=>`<dt>${e2(x[0])}</dt><dd>${e2(x[1])}</dd>`).join("")}</dl>`:"");
  if(!el){el=document.createElement("div");el.id="solsum";el.className="solsum";box.insertAdjacentElement("afterend",el)}
  if(el.innerHTML!==h){el.innerHTML=h;const b=document.getElementById("solgo");if(b)b.onclick=()=>{try{go("sol");selTab("sol","f_space",true)}catch(e){}}}}
function hook(){const o=window.renderEasyS;if(typeof o!=="function"||o.__sol)return false;const w=function(){const r=o.apply(this,arguments);try{render()}catch(e){}return r};w.__sol=1;window.renderEasyS=w;return true}
function boot(){let n=0;const t=setInterval(()=>{if(hook()||++n>75){clearInterval(t);try{render()}catch(e){}}},200)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.4.3: botones del mapa sin retardo ----
   Al pulsar un botón del mapa, el botón cambia en el acto y el mapa se redibuja justo después, en el siguiente
   fotograma. Si se pulsan varios seguidos, se redibuja una sola vez con todo. */
(function(){
"use strict";
let inClick=false,pend=0,args=null;
document.addEventListener("click",e=>{const t=e.target;if(t&&t.closest&&t.closest('section[data-pg="mapa"]')&&!t.closest("#map")){inClick=true;setTimeout(()=>{inClick=false},0)}},true);
function hook(){const d=window.drawMap;if(typeof d!=="function")return false;if(d.__fast)return true;
  const w=function(){if(!inClick)return d.apply(this,arguments);args=arguments;if(pend)return;
    pend=requestAnimationFrame(()=>setTimeout(()=>{pend=0;const a=args;args=null;try{d.apply(null,a||[])}catch(e){console.error(e)}},0))};
  w.__fast=1;window.drawMap=w;return true}
/* se engancha el último, por fuera de los demás añadidos del mapa */
/* si otro añadido envuelve el mapa después, se vuelve a envolver: la capa interior deja pasar el dibujo diferido */
let n=0;const t=setInterval(()=>{n++;hook();if(n>60)clearInterval(t)},1000);
})();
/* ---- ACRACB 2.4.5: franja de valores de la portada en rejilla ----
   8, 4 o 2 columnas según el ancho real (incluido el tamaño de letra elegido): «Llamarada» ocupa dos casillas
   y así las filas quedan siempre completas, sin huecos. */
(function(){
"use strict";
function fit(el){const de=document.documentElement,z=parseFloat(getComputedStyle(de).zoom)||1,fs=parseFloat(getComputedStyle(de).fontSize)||16;const w=el.getBoundingClientRect().width/z/fs;if(!w)return;const c=w>=45?8:w>=19?4:2;if(el.dataset.cols!==String(c)){el.dataset.cols=c;el.style.setProperty("--swc",c)}}
function boot(){const el=document.getElementById("sw");if(!el)return setTimeout(boot,300);fit(el);
  try{new ResizeObserver(()=>fit(el)).observe(el);new MutationObserver(()=>fit(el)).observe(document.documentElement,{attributes:true,attributeFilter:["class","style"]})}catch(e){addEventListener("resize",()=>fit(el),{passive:true})}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
/* ---- ACRACB 2.4.5: rejillas equilibradas ----
   Las rejillas de casillas de valores (.kv) reparten las casillas en filas iguales: con 11 valores y sitio para 7,
   salen 6 + 5 en lugar de 7 + 4 con media fila vacía. Se recalcula al cambiar el ancho o el tamaño de letra. */
(function(){
"use strict";
const SEL=".kv";const W=new WeakMap();
function bal(el){const kids=[...el.children].filter(c=>c.getClientRects().length);const n=kids.length;if(n<2)return;
  const w=Math.round(el.getBoundingClientRect().width);const key=w+"|"+n+"|"+getComputedStyle(document.documentElement).fontSize;if(W.get(el)===key)return;W.set(el,key);
  el.style.gridTemplateColumns="";kids.forEach(k=>{if(k.dataset.balspan){k.style.gridColumn="";delete k.dataset.balspan}});
  const cmax=getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length||1;if(cmax>=n)return;
  let c=cmax;if(cmax>=2){const rows=Math.ceil(n/cmax);c=Math.ceil(n/rows);if(c<cmax)el.style.gridTemplateColumns=`repeat(${c},minmax(0,1fr))`}
  /* si en la última fila queda una sola casilla, ocupa la fila entera */
  if(c>=2&&n%c===1){const l=kids[n-1];l.style.gridColumn="1 / -1";l.dataset.balspan="1"}}
let raf=0;const all=()=>{raf=0;document.querySelectorAll(SEL).forEach(el=>{if(el.getClientRects().length)try{bal(el)}catch(e){}})};
const later=()=>{if(!raf)raf=requestAnimationFrame(all)};
function boot(){all();addEventListener("resize",later,{passive:true});
  try{new MutationObserver(ms=>{if(window.ACRACB_mut&&!ACRACB_mut(ms))return;later()}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  document.addEventListener("click",()=>setTimeout(later,60),true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

