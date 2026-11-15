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
function qthPos(){const pl=g=>{g=String(g||"").trim().toUpperCase();if(!/^[A-R]{2}\d{2}/.test(g))return null;let lon=(g.charCodeAt(0)-65)*20-180+(+g[2])*2+1,lat=(g.charCodeAt(1)-65)*10-90+(+g[3])+.5;if(/^[A-R]{2}\d{2}[A-X]{2}/.test(g)){lon+=-1+(g.charCodeAt(4)-65)/12+1/24;lat+=-.5+(g.charCodeAt(5)-65)/24+1/48}return [lon,lat]};try{const el=document.getElementById("loc");const v=el&&pl(el.value);if(v)return v}catch(e){}try{if(typeof TXP!=="undefined"&&TXP&&isFinite(TXP[0]))return TXP}catch(e){}try{const v=pl(S.get("c_loc")||S.get("acracb_loc"));if(v)return v}catch(e){}return [-0.5,38.4]}
const isDay=t=>sunElev(qthPos(),t)>-3;
function nextChange(t){const d0=isDay(t);for(let x=t+6e4;x<t+864e5;x+=6e4)if(isDay(x)!==d0)return x;return t+864e5}
function themeNow(){const now=Date.now();try{const m=JSON.parse(S.get("acracb_theme_manual")||"null");if(m&&(m.t==="light"||m.t==="dark")&&now<m.until)return m.t}catch(e){}return isDay(now)?"light":"dark"}
try{if(S.get("acracb_theme")){S.del?S.del("acracb_theme"):localStorage.removeItem("acracb_theme")}}catch(e){}
setTheme(themeNow(),false);window.ACRACB_theme={isDay,qthPos,nextChange,themeNow};
setInterval(()=>{if(document.visibilityState!=="visible")return;const t=themeNow();if(document.documentElement.getAttribute("data-theme")!==t)setTheme(t,true)},60000);
/* 2.6.8: al cambiar el locator (o cualquier ajuste que recalcula la plataforma) el tema se revisa en el acto, sin esperar al minuto */
(function(){const chk=()=>{try{const t=themeNow();if(document.documentElement.getAttribute("data-theme")!==t)setTheme(t,true)}catch(e){}};
  ["input","change"].forEach(ev=>document.addEventListener(ev,e=>{if(e.target&&e.target.id==="loc")setTimeout(chk,60)},true));let n=0;const h=setInterval(()=>{if(typeof refresh==="function"&&!window.__hkTh){window.__hkTh=1;const r0=refresh;const w=function(){const v=r0.apply(this,arguments);chk();return v};w.__th=1;try{refresh=w}catch(e){window.refresh=w}clearInterval(h)}else if(++n>100)clearInterval(h)},100)})();
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
  /* 2.8.27: solo textos sencillos; un bloque con desplegables, listas, tablas o párrafos dentro no se recorta (rompía los desplegables de «Cómo funciona») */
  if(el.querySelector("details,ul,ol,table,p,div,h2,h3,h4,dl"))return;
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
  const z0=zoomMarks;window.ACRACB_afterDraw=window.ACRACB_afterDraw||[];window.ACRACB_afterDraw.push(()=>run());
  /* durante el zoom, una sola vez al terminar el gesto (antes en cada fotograma del gesto) */
  window.zoomMarks=function(){const r=z0.apply(this,arguments);later();return r};
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

/* ---- 2.8.16: vista «Completa» o «Compacta» para toda la plataforma ----
   Completa: todo como siempre, con sus desplegables. Compacta: lo esencial de un vistazo (una o dos líneas por estación,
   sin explicaciones). Se elige con el botón de la cabecera y se recuerda en el dispositivo hasta que se vuelva a cambiar. */
(function(){var EN=window.ACRACB_LANG==="en",K="acracb_view";
 function cur(){try{return localStorage.getItem(K)==="compact"?"compact":"full"}catch(e){return "full"}}
 function apply(){var c=cur()==="compact";document.documentElement.classList.toggle("vc",c);var b=document.getElementById("viewbtn");
  if(b){b.setAttribute("aria-pressed",String(c));b.title=c?(EN?"Compact view (tap for full view)":"Vista compacta (pulsa para la completa)"):(EN?"Full view (tap for compact view)":"Vista completa (pulsa para la compacta)");b.setAttribute("aria-label",b.title)}}
 apply();
 function btn(){if(document.getElementById("viewbtn"))return true;var z=document.getElementById("zoombtn");if(!z)return false;
  var b=document.createElement("button");b.id="viewbtn";b.type="button";b.className="thbtn viewbtn";
  b.innerHTML='<svg class="vfull" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/></svg><svg class="vcomp" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>';
  b.onclick=function(){try{localStorage.setItem(K,cur()==="compact"?"full":"compact")}catch(e){}apply();try{window.ACRACB_clrender&&ACRACB_clrender()}catch(e){}};
  z.parentElement.insertBefore(b,z);apply();return true}
 (function tryB(n){if(!btn()&&n<40)setTimeout(function(){tryB(n+1)},150)})(0)})();

/* ---- 2.8.26: un solo envoltorio para el dibujo del mapa ----
   Antes cada añadido del mapa envolvía drawMap y, si otro lo envolvía después, volvía a envolverlo: en un minuto se
   apilaban decenas de capas y cada redibujado repetía el relieve fino, los satélites y las etiquetas decenas de veces.
   Ahora hay un único envoltorio, puesto una vez: dibuja el mapa (con la capa VOACAP pura cuando toca), después ejecuta
   en orden los añadidos registrados en ACRACB_afterDraw y, si el dibujo viene de un clic, lo agrupa en el siguiente fotograma. */
window.ACRACB_afterDraw=window.ACRACB_afterDraw||[];
(function core(){if(typeof drawMap!=="function"){setTimeout(core,30);return}if(window.__hkCore)return;window.__hkCore=1;
  const base=drawMap;let inClick=false,pend=0,busy=false;
  document.addEventListener("click",e=>{const t=e.target;if(t&&t.closest&&t.closest('section[data-pg="mapa"]')&&!t.closest("#map")){inClick=true;setTimeout(()=>{inClick=false},0)}},true);
  const run=()=>{if(busy)return;busy=true;try{const on=typeof st!=="undefined"&&st.ly&&st.ly.voa;if(on)window.ACRACB_NOLIVE=true;try{base()}finally{if(on)window.ACRACB_NOLIVE=false}
    for(const f of window.ACRACB_afterDraw){try{f()}catch(e){console.error(e)}}}finally{busy=false}};
  const w=function(){const ev=window.event;if(inClick||(ev&&(ev.type==="click"||ev.type==="change"||ev.type==="input"))){if(!pend)pend=requestAnimationFrame(()=>{pend=0;run()});return}run()};
  w.__core=w.__fast=w.__iss=w.__fino=w.__ok=w.__pure=1;window.drawMap=w})();
/* ---- 2.8.28: menú principal y pestañas de los submenús del mismo ancho ----
   Todos los botones del menú principal miden lo mismo (el del texto más largo), y todas las pestañas de todos
   los submenús miden lo mismo entre sí (más pequeñas que el menú). Las pestañas de secciones ocultas se miden
   en una copia invisible. Si no caben, se recorta el margen interior (hasta 8 px por lado) antes de desplazar.
   Se recalcula al cambiar de sección, de tamaño de letra, de vista o de ventana; solo escribe si cambia. */
(function(){
  if(window.__hkEq)return;window.__hkEq=1;
  const vis=b=>!b.hidden&&b.style.display!=="none";
  function natural(texts,cls){const probe=document.createElement("div");probe.className=cls+" eqm";probe.setAttribute("aria-hidden","true");
    probe.style.cssText="position:absolute;left:-99999px;top:0;visibility:hidden;width:max-content;max-width:none;pointer-events:none";
    probe.innerHTML=texts.map(t=>`<button type="button" tabindex="-1">${t}</button>`).join("");document.body.appendChild(probe);
    let w=0,tx=0;probe.querySelectorAll("button").forEach(b=>{const r=b.getBoundingClientRect().width,cs=getComputedStyle(b);w=Math.max(w,r);tx=Math.max(tx,r-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight))});probe.remove();return {w,tx}}
  function apply(rows,m,avail,n){let w=m.w;if(w*n>avail)w=Math.max(Math.floor(avail/n),m.tx+16);const px=Math.ceil(w)+"px";
    rows.forEach(r=>{if(r.style.getPropertyValue("--eqw")!==px)r.style.setProperty("--eqw",px);r.classList.add("eqw")})}
  function all(){const nav=document.querySelector(".nav");if(!nav)return;const av=nav.clientWidth;if(!av)return;
    const nb=[...nav.querySelectorAll(":scope > button")].filter(vis);
    if(nb.length)apply([nav],natural(nb.map(b=>b.innerHTML),"nav"),av,nb.length);
    const rows=[...document.querySelectorAll(".ptabs")];const tb=rows.flatMap(r=>[...r.querySelectorAll(":scope > button")].filter(vis));
    if(tb.length){const most=Math.max(...rows.map(r=>[...r.querySelectorAll(":scope > button")].filter(vis).length));apply(rows,natural(tb.map(b=>b.innerHTML),"ptabs"),av-8,most)}}
  let q=0;function later(){if(q)return;q=requestAnimationFrame(()=>{q=0;all()})}
  window.ACRACB_eqTabs=all;
  document.addEventListener("click",()=>{later();setTimeout(all,350)},true);
  window.addEventListener("resize",later);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(later);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",later);else later();
  window.addEventListener("load",later);setTimeout(all,1500);
})();
/* ---- 2.9.0: «Qué hacer» dentro de Resumen ----
   Antes eran dos pestañas que decían cosas parecidas. Ahora la recomendación («Qué hacer ahora», con lo que dice el clúster)
   va en Resumen, justo debajo de la tarjeta principal y antes de las próximas 12 horas. La pestaña «Qué hacer» desaparece y los
   enlaces que llevaban a ella llevan a Resumen, a esa parte. */
(function(){
  if(window.__hkRec)return;window.__hkRec=1;
  let W=null;
  function place(){const easy=document.getElementById("easy");if(!easy)return;const g=easy.querySelector(".ezg");if(!g)return;
    if(!W){const rec=document.getElementById("rec");if(!rec)return;W=document.createElement("div");W.id="recw";W.className="ez ezrec";const h=document.createElement("div");h.className="ezt";
      const sp=document.getElementById("rech");if(sp)h.appendChild(sp);else h.textContent=(window.ACRACB_LANG==="en"?"What to do now":"Qué hacer ahora");
      W.appendChild(h);W.appendChild(rec);const fr=document.getElementById("f_rec");if(fr)fr.hidden=true;try{syncTabs()}catch(e){}}
    const tl=g.querySelector(".eztl");if(W.parentNode!==g||(tl&&W.nextSibling!==tl)){if(tl)g.insertBefore(W,tl);else g.appendChild(W)}}
  /* renderSide escribe en #rec justo después de rehacer el Resumen: se recoloca en el acto, sin esperar al observador */
  window.ACRACB_recEl=()=>W?W.querySelector("#rec"):null;
  function hookE(){if(typeof window.renderEasy!=="function"||window.renderEasy.__rw)return;const o=window.renderEasy;const w=function(){const r=o.apply(this,arguments);try{place()}catch(e){}return r};w.__rw=1;window.renderEasy=w}
  function boot(){hookE();place();const e=document.getElementById("easy");if(e)try{new MutationObserver(place).observe(e,{childList:true})}catch(x){}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,50));else setTimeout(boot,50);
})();

/* ---- ACRACB 2.9.0: «Guía» en «Cómo funciona»: primeros pasos y privacidad ---- */
(function(){
  if(window.__hkGuia)return;window.__hkGuia=1;
  const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
  function fill(){const g=document.getElementById("guia");if(!g||g.dataset.ok)return;g.dataset.ok="1";
    const li=a=>a.map(x=>`<li>${x}</li>`).join("");
    g.innerHTML=`<h3>${T("Primeros pasos","Getting started")}</h3><ol>${li([
      T("Pulsa <b>Cambiar</b> (arriba) y pon tu QTH, tu potencia, tu antena y tu modo. Todo se calcula para esa estación.","Tap <b>Change</b> (top) and enter your QTH, power, antenna and mode. Everything is worked out for that station."),
      T("En <b>Ahora › Resumen</b> tienes la mejor banda, hacia dónde apuntar y qué hacer en este momento.","<b>Now › Summary</b> gives you the best band, where to point and what to do right now."),
      T("En <b>DX</b> están el clúster, los avisos de DXpediciones y entidades raras, y los satélites.","<b>DX</b> holds the cluster, alerts for DXpeditions and rare entities, and satellites."),
      T("Sube tu log ADIF en <b>Países y log › Mi log</b> y la web te marcará lo que te falta.","Upload your ADIF log in <b>Countries &amp; log › My log</b> and the site will flag what you need."),
      T("En <b>DX › Avisos</b> puedes pedir que te avise con una notificación.","In <b>DX › Alerts</b> you can ask to be notified."),
      T("Instálala desde el menú del navegador («Añadir a pantalla de inicio»): se abre como una app y, sin conexión, muestra los últimos datos descargados.","Install it from the browser menu (“Add to Home Screen”): it opens like an app and, offline, shows the last data downloaded.")])}</ol>
      <h3>${T("Privacidad","Privacy")}</h3><ul>${li([
      T("Sin registro, sin cuentas y sin cookies, analítica ni seguimiento.","No sign-up, no accounts, and no cookies, analytics or tracking."),
      T("Tus ajustes, tu log ADIF y tus «lo oigo / no lo oigo» se guardan solo en este dispositivo, en el almacenamiento del navegador. Para borrarlos, usa «Quitar el log» o borra los datos de esta web en el navegador.","Your settings, your ADIF log and your “I hear it / I don’t” marks stay on this device only, in the browser’s storage. To erase them, use “Remove the log” or clear this site’s data in the browser."),
      T("Los datos públicos se piden directamente a sus fuentes; algunas, a través de un intermediario propio en Cloudflare que no guarda nada. Las copias de LoTW y SatNOGS se sirven desde la propia web.","Public data is requested straight from its sources; some go through our own relay on Cloudflare, which stores nothing. The LoTW and SatNOGS copies are served from the site itself."),
      T("La previsión VOACAP se descarga por zonas, no con tu posición exacta.","The VOACAP forecast is downloaded by area, not with your exact position."),
      T("Tu indicativo solo sale del dispositivo cuando pulsas <b>Comprobar</b> en «¿Me oyen?», para buscarlo en las redes de escucha.","Your callsign only leaves the device when you tap <b>Check</b> in “Who hears me?”, to look it up on the listening networks."),
      T("Las notificaciones las genera tu propio navegador; no hay ningún servidor de envío.","Notifications are generated by your own browser; there is no push server."),
      T("Como en cualquier web, quien la aloja (GitHub Pages y Cloudflare) y las fuentes consultadas ven tu dirección IP al servirte los datos.","As with any website, the hosts (GitHub Pages and Cloudflare) and the sources queried see your IP address when they serve you data.")])}</ul>`}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fill);else fill();
})();
