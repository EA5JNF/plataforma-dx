
/* ---- ACRACB: tema, textos plegados, entidades y log (común a todas las versiones) ---- */
/* 2.4.1: solo cuentan los cambios de contenido real; el reloj y el mapa no despiertan a los observadores */
/* 2.10.37: scroll fino en el móvil. Al desplazarte, el navegador del móvil esconde y enseña su barra y eso dispara “resize”
   sin que cambie el ancho; antes cada uno de esos avisos recolocaba tarjetas, pestañas y tablas a mitad del gesto (tirones).
   Ahora en pantallas táctiles solo se recoloca si cambia el ancho (girar el aparato, partir la pantalla). */
window.ACRACB_rz=fn=>{let w=innerWidth;const coarse=(()=>{try{return matchMedia("(pointer:coarse)").matches}catch(e){return false}})();
  return function(){const nw=innerWidth;if(coarse&&nw===w)return;w=nw;return fn.apply(this,arguments)}};
window.ACRACB_mut=ms=>ms.some(m=>!(m.target instanceof SVGElement)&&!/^ck[uls]$/.test(m.target.id||""));
(function(){
"use strict";
const $=id=>document.getElementById(id);
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
/* ---------- al abrir, la página empieza siempre arriba, con la cabecera a la vista ---------- */
try{if("scrollRestoration" in history)history.scrollRestoration="manual"}catch(e){}
/* 2.11.16: la subida automática solo se hace al abrir y mientras no hayas tocado nada. Antes los avisos de “has tocado” se
   quitaban tras el primer uso y, al volver a la pestaña, se reiniciaban sin volver a escucharse: la página podía subir
   sola mientras hacías scroll. */
let touched=false;const T0=Date.now();["touchstart","touchmove","wheel","keydown","mousedown","pointerdown"].forEach(ev=>addEventListener(ev,()=>{touched=true},{passive:true,capture:true}));
function toTop(){[0,200,600,1200,2500].forEach(t=>setTimeout(()=>{if(!touched&&scrollY>0&&Date.now()-T0<4000)scrollTo(0,0)},t))}
toTop();
/* 2.11.16: cuando una parte de la página se redibuja, la altura puede encoger un instante y el navegador sube la vista;
   mientras se redibuja se sujeta la altura que estabas viendo (sin medir nada, para no forzar ese salto) */
(function(){let need=0,tm=0;
  addEventListener("scroll",()=>{need=scrollY>0?Math.ceil(scrollY+innerHeight):0},{passive:true});
  /* lo que cierras o cambias tú sí puede acortar la página al momento */
  ["click","keydown","change"].forEach(ev=>addEventListener(ev,()=>{need=0;clearTimeout(tm);tm=0;if(document.body)document.body.style.minHeight=""},{capture:true,passive:true}));
  new MutationObserver(()=>{const b=document.body;if(!b||!need||tm)return;b.style.minHeight=need+"px";tm=setTimeout(()=>{b.style.minHeight="";tm=0},1500)}).observe(document.documentElement,{childList:true,subtree:true});})();
/* ---------- tema claro / oscuro ---------- */
function setTheme(t,save){document.documentElement.setAttribute("data-theme",t);
  const b=$("thbtn");if(b){b.setAttribute("aria-label",t==="light"?"Switch to dark mode":"Switch to light mode");b.title=b.getAttribute("aria-label")}
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
/* 2.10.32: solo se repasa lo que está a la vista (cabecera y la sección abierta), no las ocho secciones a la vez; al cambiar de sección se repasa la nueva */
function visRoots(){const r=[];const h=document.querySelector("header");if(h)r.push(h);let pg=null;try{pg=st.page}catch(e){}const s=pg&&document.querySelector(`section.page[data-pg="${pg}"]`);if(s)r.push(s);else r.push(document.body);return r}
function clampAll(){CT=null;const R=visRoots();try{longVals();R.forEach(x=>glue(x))}catch(e){}R.flatMap(x=>[...x.querySelectorAll(x.matches&&x.matches(".page")?"p, .note, .w":".page p, .page .note, .page .w")]).forEach(el=>{
  if(el.dataset.cl||el.closest("summary,.sp,.chip,.dx,button,.mpop,.srcrep,.kv,td,th,.tl,.tlh,.drop,.goal,.srcg,#heardbox,#qrpbox,.notifw,#metnote,#space")||el.id==="updst")return;
  const d=el.closest("details");if(d&&!d.classList.contains("fold"))return;
  /* 2.8.27: solo textos sencillos; un bloque con desplegables, listas, tablas o párrafos dentro no se recorta (rompía los desplegables de “Cómo funciona”) */
  if(el.querySelector("details,ul,ol,table,p,div,h2,h3,h4,dl"))return;
  if((el.textContent||"").trim().length<LIM)return;el.dataset.cl="1";el.classList.add("clamp");if(OPENED.has(ckey(el))){el.classList.add("open");el.title=""}else el.title=window.ACRACB_LANG==="en"?"Tap to read it all":"Tap to read it all"})}
document.addEventListener("click",ev=>{const el=ev.target.closest(".clamp");if(!el||ev.target.closest("a,button,input,select,.cs"))return;el.classList.toggle("open");const op=el.classList.contains("open");if(op)OPENED.add(ckey(el));else OPENED.delete(ckey(el));el.title=op?"":(window.ACRACB_LANG==="en"?"Tap to read it all":"Tap to read it all")},true);
new MutationObserver(ms=>{if(!CT&&window.ACRACB_mut(ms))CT=setTimeout(clampAll,120)}).observe(document.documentElement,{childList:true,subtree:true});
/* ---------- nombres de entidad cuando el dato llega solo con el número DXCC ---------- */
const MESX={ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11,jan:0,apr:3,aug:7,dec:11};
function dxVigente(d){let m=String(d.until||"").toLowerCase().match(/(\d{1,2})\s*([a-zñ]{3})/);if(!m){const k=String(d.until||"").toLowerCase().match(/([a-z]{3})[a-z]*\.?\s*(\d{1,2})/);if(k)m=[k[0],k[2],k[1]]}if(!m||MESX[m[2]]==null)return true;const now=new Date(),y=now.getFullYear();
  let t=new Date(y,MESX[m[2]],+m[1],23,59);if(t-now<-180*864e5)t=new Date(y+1,MESX[m[2]],+m[1],23,59);return t>=now}
function longVals(){document.querySelectorAll(".chip .v").forEach(v=>{const l=(v.textContent||"").trim().length>12;if(v.classList.contains("vlong")!==l)v.classList.toggle("vlong",l)});
  document.querySelectorAll(".caltab td:nth-child(3)").forEach(td=>{if(td.dataset.wb||td.children.length)return;td.dataset.wb="1";if(td.textContent.trim().length>7){td.classList.add("mlong");td.textContent=td.textContent.replace(/\//g,"/\u200b")}})}
/* cifra y unidad siempre juntas: “00:14 UTC”, “7935 km”, “92%” no se parten en dos líneas */
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
  let h=`<h3>Your goals now</h3>`;
  const card=x=>{const md=[].concat(x.d.modes||[]).filter(Boolean).join(", ");if(window.ACRACB_card)return ACRACB_card({call:x.d.call,tags:[],secs:[["Until",x.d.until?esc(x.d.until):""],["Modes",md?esc(md):""]]});return `<div class="sp"><span class="f">★</span><span><b>${CS(x.d.call)}</b></span><span class="w">${x.d.until?"Until "+esc(x.d.until):""}${md?" · "+esc(md):""}${x.d.mw?" · Most Wanted nº "+esc(x.d.mw):""}</span></div>`};
  h+=dn.length?`<p class="note">Active DXpeditions of entities you do not have confirmed (${dn.length}):</p><div class="goal">${dn.slice(0,6).map(card).join("")}</div>${dn.length>6?`<details class="goal-more"><summary>See the other ${dn.length-6}</summary><div class="goal">${dn.slice(6).map(card).join("")}</div></details>`:""}`:`<p class="note">No active DXpedition is from an entity you need.</p>`;
  if(false)h+=dn.length?`<p class="note">Active DXpeditions of entities you do not have confirmed:</p><div class="goal">${dn.map(x=>`<div class="sp"><span class="f">★</span><span><b>${CS(x.d.call)}</b></span><span class="w">Until ${esc(x.d.until||"")}${x.d.modes?" · "+esc([].concat(x.d.modes).join(", ")):""}${x.d.mw?" · Most Wanted nº "+esc(x.d.mw):""}</span></div>`).join("")}</div>`:`<p class="note">No active DXpedition is from an entity you need.</p>`;
  if(db.length)h+=`<p class="note">Already confirmed, but you may need some band: ${db.slice(0,8).map(x=>CS(x.d.call)).join(", ")}.</p>`;
  h+=sp2.length?`<p class="note">On the cluster now, entities or bands you need:</p><div class="goal">${sp2.map(({s,e})=>window.ACRACB_card?ACRACB_card({call:s.call,a:(()=>{try{return spotAge(s)}catch(x){return null}})(),t:s.t,f:s.f,band:s.band,mode:s.mode||"",tags:[`<span class="xtag xs">${need(e.dxcc)?"Entity you need":"Needed on "+BANDS[s.band]}</span>`],by:CSL(s.by,", "),geo:window.ACRACB_geo?ACRACB_geo(s.dx):null}):`<div class="sp"><span class="f" style="color:${BC[s.band]}">${esc(s.f)}</span><span><b>${CS(s.call)}</b> · ${esc(s.mode||"")}</span><span class="w">${need(e.dxcc)?"Entity you need":"Needed on "+BANDS[s.band]} · ${esc(s.t)} UTC</span></div>`).join("")}</div>`:`<p class="note">Right now there is nothing on the cluster that you need.</p>`;
  return h};
/* ---------- acceso directo a “Mi log” junto a “Cambiar” ---------- */
window.ACRACB_openLog=function(){try{go("fichas");selTab("fichas","f_log",true);const d=$("f_log");if(d){d.open=true;setTimeout(()=>d.scrollIntoView({behavior:"smooth",block:"start"}),80)}}catch(e){}};
function logBtn(){const st=$("stbtn");if(!st)return;let b=$("logbtn");if(!b){b=document.createElement("button");b.id="logbtn";b.type="button";b.className="btn stbtn logbtn";b.onclick=()=>ACRACB_openLog();st.insertAdjacentElement("beforebegin",b)}
  const tx=(typeof LOG!=="undefined"&&LOG)?"My log":"Upload log";if(b.textContent!==tx)b.textContent=tx;
  /* 2.11.96: el sitio del botón lo decide siempre la línea de la estación (ancha: en la línea; estrecha: en el desplegable) */
  try{window.ACRACB_qsSum&&ACRACB_qsSum()}catch(e){}}
document.addEventListener("click",e=>{const x=e.target.closest("[data-openlog]");if(x){e.preventDefault();ACRACB_openLog()}});
function hook(){
  try{const r0=refresh;refresh=function(){const v=r0.apply(this,arguments);try{if(typeof renderLog==="function")renderLog()}catch(e){}try{logBtn()}catch(e){}try{longVals()}catch(e){}return v}}catch(e){}
  try{const a0=applyLive;applyLive=function(n){const v=a0.apply(this,arguments);try{ACRACB_normEnt()}catch(e){}return v}}catch(e){}
  loadLog();ACRACB_normEnt();themeBtn();logBtn();try{refresh()}catch(e){}clampAll()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(hook,0));else setTimeout(hook,0);
})();

/* ---- pantallas muy grandes y televisores: se amplía todo (nítido: todo es texto y SVG) ----
   Automático: por encima de 2100 px se ve como en una pantalla de 1920 px, ocupando todo el ancho.
   Botón “Aa”: tamaño 100%, 125%, 150%, 175% o 200% encima de lo automático, para ver la web de lejos (sede, TV, proyector). Se recuerda en el dispositivo. */
(function(){var STEPS=[1,1.25,1.5,1.75,2],EN=window.ACRACB_LANG==="en";
 function uf(){try{var v=+localStorage.getItem("acracb_zoom");return STEPS.indexOf(v)>=0?v:1}catch(e){return 1}}
 function fit(){var de=document.documentElement,w=window.innerWidth,h=window.innerHeight;
  /* 2.3.2: lo automático de las pantallas grandes sigue ampliando todo; lo que eliges con “Aa” agranda la letra
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
 fit();window.addEventListener("resize",ACRACB_rz(fit));if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fit);
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
  /* 2.10.42: sin tirones al abrir el mapa. Antes cada etiqueta se movía a cada sitio posible y se medía allí (hasta 8
     medidas por etiqueta, con la página recalculada en cada una: más de 1.700 con muchos spots, casi 2 s en un móvil).
     Ahora se mide cada etiqueta una sola vez, todas a la vez, y los demás sitios se calculan; al final se escribe el elegido. */
  const ml=[...svg.querySelectorAll("text.ml")].filter(t=>t.style.display!=="none").map(t=>({t,v:parseFloat(t.textContent)||0})).sort((a,b)=>b.v-a.v);const mk=[];
  const mlr=ml.map(o=>o.t.getBoundingClientRect());const mlHide=[];
  ml.forEach((o,i)=>{const r=mlr[i];if(!r.width)return;if(mk.some(k=>r.left<k.right&&r.right>k.left&&r.top<k.bottom&&r.bottom>k.top)){mlHide.push(o.t);return}mk.push(r)});
  mlHide.forEach(t=>t.style.display="none");
  /* 2.11.83: las etiquetas no se ponen encima de los marcadores (círculos de destino, tu estación, triángulos de activaciones) */
  svg.querySelectorAll("circle.mk,circle.tx,path.mkt").forEach(c=>{if(c.style.display==="none")return;const r=c.getBoundingClientRect();if(r.width&&r.width<60)keep.push(r)});
  const all=[...svg.querySelectorAll("text.dxx"),...svg.querySelectorAll("text.spotl")];
  const AF=an=>an==="end"?1:an==="middle"?.5:0;
  const L0=all.map(t=>{const d=t.dataset;if(d.ox===undefined){d.ox=t.getAttribute("x");d.oy=t.getAttribute("y");d.oa=t.getAttribute("text-anchor")||"start"}
    const ax=+d.ax,ay=+d.ay,dx=Math.abs(+d.ox-ax)||8,dy=+d.oy-ay,ady=Math.abs(dy)||7;
    const pos=[[dx,dy,d.oa],[dx,ady+9,"start"],[-dx,dy,"end"],[-dx,ady+9,"end"],[0,-ady-6,"middle"],[0,ady+14,"middle"],[dx,-ady-8,"start"],[-dx,-ady-8,"end"]];
    t.style.display="";t.setAttribute("x",ax+pos[0][0]);t.setAttribute("y",ay+pos[0][1]);t.setAttribute("text-anchor",pos[0][2]);return {t,d,ax,ay,pos}});
  let sc=1;try{const m=svg.getScreenCTM();if(m&&m.a)sc=m.a}catch(e){}
  const R0=L0.map(o=>o.t.getBoundingClientRect());
  const out=L0.map((o,i)=>{const r=R0[i],w=r.width,h=r.height,p0=o.pos[0];if(!w)return {o,q:null};
    const bx=r.left+w*AF(p0[2]),by=r.top;
    const k=key(o.t),prev=LAST.get(k);const order=prev!=null&&prev<o.pos.length?[o.pos[prev]].concat(o.pos.filter((_,j)=>j!==prev)):o.pos;
    for(const q of order){const left=bx+sc*(q[0]-p0[0])-w*AF(q[2]),top=by+sc*(q[1]-p0[1]);const rr={left,right:left+w,top,bottom:top+h};
      if(!hit(rr,2)){keep.push(rr);LAST.set(k,o.pos.indexOf(q));return {o,q}}}
    LAST.delete(k);return {o,q:false}});
  out.forEach(({o,q})=>{const t=o.t,d=o.d;if(q===null)return;if(q===false){t.setAttribute("x",d.ox);t.setAttribute("y",d.oy);t.setAttribute("text-anchor",d.oa);t.style.display="none";return}
    t.setAttribute("x",o.ax+q[0]);t.setAttribute("y",o.ay+q[1]);t.setAttribute("text-anchor",q[2])});
  if(LAST.size>2000)LAST.clear();
  /* si “Caminos” o “Saltos” están encendidos pero no hay nada que dibujar, se dice por qué en vez de dejar el mapa sin nada */
  try{const wrap=svg.parentNode;let n=wrap.querySelector(".mnote");const ly=(typeof st!=="undefined"&&st.ly)||{};const en=window.ACRACB_LANG==="en";
   const want=st.mapOn&&(ly.arcs||ly.hops),got=svg.querySelectorAll("path.arc,path.lparc,circle.hop").length;
   const msg=want&&!got?(en?"No destination reaches 15% on this band and hour, so there are no paths or hops to draw. Try another band or hour.":"Ningún destino llega al 15% en esta banda y hora, así que no hay caminos ni saltos que dibujar. Prueba otra banda u otra hora."):"";
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
  window.addEventListener("resize",ACRACB_rz(later));watch();later()}
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

/* ---- 2.8.16: vista “Completa” o “Compacta” para toda la plataforma ----
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
 /* 2.10.35: el botón suelto se sustituye por el menú “Vista” (viewmenu.js) */
 window.ACRACB_view=function(v){if(v==null)return cur();try{localStorage.setItem(K,v==="compact"?"compact":"full")}catch(e){}apply()}})();
/* ---- 2.10.31: vista de lista para todos los listados de estaciones, independiente de completa o compacta ---- */
(function(){var EN=window.ACRACB_LANG==="en",K="acracb_list";
 function on(){try{return localStorage.getItem(K)==="1"}catch(e){return false}}
 function apply(){document.documentElement.classList.toggle("vl",on());var b=document.getElementById("listbtn");if(b){b.setAttribute("aria-pressed",String(on()));b.title=on()?(EN?"List view (tap for cards)":"Vista de lista (pulsa para tarjetas)"):(EN?"Card view (tap for list)":"Vista de tarjetas (pulsa para lista)");b.setAttribute("aria-label",b.title)}}
 apply();
 function btn(){if(document.getElementById("listbtn"))return true;var v=document.getElementById("viewbtn");if(!v)return false;var b=document.createElement("button");b.id="listbtn";b.type="button";b.className="thbtn viewbtn listbtn";
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14.5h18M9 4v16"/></svg>';
  b.onclick=function(){try{localStorage.setItem(K,on()?"":"1")}catch(e){}apply();try{refresh()}catch(e){}try{window.ACRACB_clrender&&ACRACB_clrender()}catch(e){}try{renderAlerts()}catch(e){}try{window.renderAlBar&&renderAlBar()}catch(e){}};
  v.insertAdjacentElement("afterend",b);apply();return true}
 window.ACRACB_list=function(v){if(v==null)return on();try{localStorage.setItem(K,v?"1":"")}catch(e){}apply()}})();

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
  const w=function(){const ev=window.event;if(inClick||(ev&&(ev.type==="click"||ev.type==="change"||ev.type==="input"))){/* 2.10.18: primero se pinta el botón pulsado y después se dibuja el mapa (antes el dibujo iba antes de pintar y el botón tardaba en responder) */if(!pend)pend=requestAnimationFrame(()=>setTimeout(()=>{pend=0;run()},0));return}run()};
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
  window.addEventListener("resize",ACRACB_rz(later));
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(later);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",later);else later();
  window.addEventListener("load",later);setTimeout(all,1500);
})();
/* ---- 2.9.0: “Qué hacer” dentro de Resumen ----
   Antes eran dos pestañas que decían cosas parecidas. Ahora la recomendación (“Qué hacer ahora”, con lo que dice el clúster)
   va en Resumen, justo debajo de la tarjeta principal y antes de las próximas 12 horas. La pestaña “Qué hacer” desaparece y los
   enlaces que llevaban a ella llevan a Resumen, a esa parte. */
(function(){
  if(window.__hkRec)return;window.__hkRec=1;
  let W=null;
  function place(){const easy=document.getElementById("easy");if(!easy)return;const g=easy.querySelector(".ezg");if(!g)return;
    if(!W){const rec=document.getElementById("rec");if(!rec)return;W=document.createElement("div");W.id="recw";W.className="ez ezrec";const h=document.createElement("div");h.className="ezt";
      const sp=document.getElementById("rech");if(sp)h.appendChild(sp);else h.textContent=(window.ACRACB_LANG==="en"?"What to do now":"What to do now");
      W.appendChild(h);W.appendChild(rec);try{new MutationObserver(()=>{try{trim()}catch(e){}}).observe(rec,{childList:true})}catch(e){}const fr=document.getElementById("f_rec");if(fr)fr.hidden=true;try{syncTabs()}catch(e){}}
    cols(g);try{trim();nav()}catch(e){}}
  /* 2.10.4: el Resumen en dos columnas fijas: a la izquierda lo de ahora (“Ahora” y “Qué hacer”), a la derecha lo que viene
     (“Próximas 12 horas” y “Raras en el aire”). En el móvil, una columna en ese mismo orden. */
  function cols(g){let a=g.querySelector(":scope>.ezcol1"),b=g.querySelector(":scope>.ezcol2");
    if(!a){a=document.createElement("div");a.className="ezcol ezcol1";b=document.createElement("div");b.className="ezcol ezcol2"}
    const hero=[...g.querySelectorAll(":scope>.ez")].find(x=>!x.classList.contains("eztl")&&!x.classList.contains("ezdx")&&x!==W)||a.querySelector(".ez:not(.ezrec)");
    const tl=g.querySelector(":scope>.eztl")||b.querySelector(".eztl"),dx=g.querySelector(":scope>.ezdx")||b.querySelector(".ezdx");
    const rest=[...g.querySelectorAll(":scope>.ez")].filter(x=>x!==hero&&x!==W&&x!==tl&&x!==dx);
    /* 2.11.95: arriba, “Ahora” y “Próximas 12 horas” lado a lado; debajo, “Qué hacer ahora” a todo el ancho
       (en el móvil: Ahora, Próximas horas y Qué hacer, en ese orden) */
    [hero].filter(Boolean).forEach((x,i)=>{if(a.children[i]!==x)a.insertBefore(x,a.children[i]||null)});
    [tl,dx,...rest].filter(Boolean).forEach((x,i)=>{if(b.children[i]!==x)b.insertBefore(x,b.children[i]||null)});
    if(a.parentNode!==g||g.firstElementChild!==a)g.insertBefore(a,g.firstChild);if(b.parentNode!==g||a.nextElementSibling!==b)a.insertAdjacentElement("afterend",b);
    if(W&&(W.parentNode!==g||b.nextElementSibling!==W))b.insertAdjacentElement("afterend",W);
    g.classList.add("ez2c")}
  /* renderSide escribe en #rec justo después de rehacer el Resumen: se recoloca en el acto, sin esperar al observador */
  window.ACRACB_recEl=()=>W?W.querySelector("#rec"):null;
  function hookE(){if(typeof window.renderEasy!=="function"||window.renderEasy.__rw)return;const o=window.renderEasy;const w=function(){const r=o.apply(this,arguments);try{place()}catch(e){}return r};w.__rw=1;window.renderEasy=w}
  /* 2.10.0: “Qué hacer ahora” enseña la primera recomendación y el resto con “Ver más”, para no alargar el Resumen */
  let ALL=false;
  function trim(){if(!W)return;const cs=[...W.querySelectorAll("#rec .sc")];let b=W.querySelector(".recmore");
    /* 2.11.95: a todo el ancho caben varias tarjetas por fila: se enseñan tantas como columnas (1, 2 o 3) */
    const N=innerWidth>=1800?3:innerWidth>=1100?2:1;
    if(cs.length<=N){if(b)b.remove();cs.forEach(c=>c.hidden=false);return}
    cs.forEach((c,i)=>{c.hidden=!ALL&&i>=N});W.classList.toggle("recall",ALL);
    if(!b){b=document.createElement("button");b.type="button";b.className="btn llmore recmore";b.addEventListener("click",()=>{ALL=!ALL;trim()})}
    const last=cs[cs.length-1];if(b.previousElementSibling!==last)last.insertAdjacentElement("afterend",b);
    b.textContent=ALL?T2("Ver menos","Show less"):(m=>T2(`View ${m} ${m===1?"recomendación más":"recomendaciones más"}`,`Show ${m} more ${m===1?"suggestion":"suggestions"}`))(cs.length-N)}
  const T2=(es,en)=>window.ACRACB_LANG==="en"?en:es;
  {let rt=0;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{try{trim()}catch(_){}},200)})}
  /* 2.10.0: índice del Resumen: salta a cada parte sin recorrer todo con el dedo */
  function nav(){const fe=document.getElementById("f_easy"),easy=document.getElementById("easy");if(!fe||!easy)return;let n=fe.querySelector(".eznav");
    const parts=[[".ezcol1>.ez:first-child",T2("Now","Now")],["#recw",T2("What to do","What to do")],[".ezg .eztl",T2("Next hours","Next hours")],[".ezg .ezdx",T2("Raras en el aire","Rare on air")],["#solsum",T2("El Sol","The Sun")],["details.glosw",T2("Términos","Terms")]];
    const ok=parts.filter(([q])=>{const x=fe.querySelector(q);return x&&!x.hidden&&getComputedStyle(x).display!=="none"});const sig=ok.map(x=>x[0]).join();
    if(n&&n.dataset.sig===sig)return;if(!n){n=document.createElement("nav");n.className="eznav";n.setAttribute("aria-label",T2("Partes del Resumen","Summary sections"));easy.insertAdjacentElement("beforebegin",n)}
    n.dataset.sig=sig;n.innerHTML=ok.map(([q,t])=>`<button type="button" data-ezq="${q}">${t}</button>`).join("");
    n.onclick=ev=>{const b=ev.target.closest("[data-ezq]");if(!b)return;const el=fe.querySelector(b.dataset.ezq);if(!el)return;if(el.tagName==="DETAILS")el.open=true;
      const y=el.getBoundingClientRect().top+window.scrollY-((document.querySelector(".nav")||{}).offsetHeight||0)-12;try{window.scrollTo({top:y,behavior:"smooth"})}catch(e){window.scrollTo(0,y)}}}
  function boot(){hookE();place();const e=document.getElementById("easy");if(e)try{new MutationObserver(place).observe(e,{childList:true})}catch(x){}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,50));else setTimeout(boot,50);
})();

/* ---- ACRACB 2.9.0: “Guía” en “Cómo funciona”: primeros pasos y privacidad ---- */
(function(){
  if(window.__hkGuia)return;window.__hkGuia=1;
  const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
  function fill(){const g=document.getElementById("guia");if(!g||g.dataset.ok)return;g.dataset.ok="1";
    const li=a=>a.map(x=>`<li>${x}</li>`).join("");
    g.innerHTML=`<h3>${T("Primeros pasos","Getting started")}</h3><ol>${li([
      T("Pulsa <b>Change</b> (above) y pon tu QTH, tu potencia, tu antena y tu modo. Todo se calcula para esa estación.","Tap <b>Change</b> (top) and enter your QTH, power, antenna and mode. Everything is worked out for that station."),
      T("En <b>Ahora › Resumen</b> tienes la mejor banda, hacia dónde apuntar y qué hacer en este momento.","<b>Now › Summary</b> gives you the best band, where to point and what to do right now."),
      T("En <b>DX</b> están el clúster, los avisos de DXpediciones y entidades raras, y los satélites.","<b>DX</b> holds the cluster, alerts for DXpeditions and rare entities, and satellites."),
      T("Sube tu log ADIF en <b>Países y log › Mi log</b> y la web te marcará lo que te falta.","Upload your ADIF log in <b>Countries &amp; log › My log</b> and the site will flag what you need."),
      T("En <b>DX › Avisos</b> puedes pedir que te avise con una notificación.","In <b>DX › Alerts</b> you can ask to be notified."),
      T("El alfabeto fonético, el código Q y el Morse están en <b>Cómo funciona › Consulta</b>.","The phonetic alphabet, Q code and Morse are in <b>How it works › Reference</b>."),
      T("Instálala desde el menú del navegador (“Añadir a pantalla de inicio”): se abre como una app y, sin conexión, muestra los últimos datos descargados.","Install it from the browser menu (“Add to Home Screen”): it opens like an app and, offline, shows the last data downloaded.")])}</ol>
      <h3>${T("Privacidad","Privacy")}</h3><ul>${li([
      T("Sin registro, sin cuentas y sin cookies, analítica ni seguimiento.","No sign-up, no accounts, and no cookies, analytics or tracking."),
      T("Tus ajustes, tu log ADIF y tus “lo oigo / no lo oigo” se guardan solo en este dispositivo, en el almacenamiento del navegador. Para borrarlos, usa “Quitar el log” o borra los datos de esta web en el navegador.","Your settings, your ADIF log and your “I hear it / I don’t” marks stay on this device only, in the browser’s storage. To erase them, use “Remove the log” or clear this site’s data in the browser."),
      T("Los datos públicos se piden directamente a sus fuentes; algunas, a través de un intermediario propio en Cloudflare que no guarda nada. Las órbitas de CelesTrak y la copia de SatNOGS se sirven desde la propia web. Las imágenes del Sol se cargan desde los servidores de la NASA.","Public data is requested straight from its sources; some go through our own relay on Cloudflare, which stores nothing. The CelesTrak orbits and the SatNOGS copy are served from the site itself. The Sun images load from NASA servers."),
      T("La previsión VOACAP se descarga por zonas, no con tu posición exacta.","The VOACAP forecast is downloaded by area, not with your exact position."),
      T("Tu indicativo solo sale del dispositivo cuando pulsas <b>Check</b> en “¿Me oyen?”, para buscarlo en las redes de escucha.","Your callsign only leaves the device when you tap <b>Check</b> in “Who hears me?”, to look it up on the listening networks."),
      T("Las notificaciones las genera tu propio navegador; no hay ningún servidor de envío.","Notifications are generated by your own browser; there is no push server."),
      T("Como en cualquier web, quien la aloja (GitHub Pages y Cloudflare) y las fuentes consultadas ven tu dirección IP al servirte los datos. Más detalle en “Aviso legal, fuentes y privacidad”, al pie de la página.","As with any website, the hosts (GitHub Pages and Cloudflare) and the sources queried see your IP address when they serve you data. More detail in “Legal notice, sources and privacy” at the foot of the page.")])}</ul>`}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fill);else fill();
})();

/* ---- ACRACB 2.10.3: “Mi log” por partes (Resumen, Países, Objetivos, Archivo) en lugar de una página interminable ---- */
(function(){
  if(window.__hkLogTabs)return;window.__hkLogTabs=1;
  const T=(es,en)=>window.ACRACB_LANG==="en"?en:es;let CUR="res";try{CUR=localStorage.getItem("acracb_logpart")||"res"}catch(e){}
  const P=[["res",T("Summary","Summary")],["pai",T("Countries","Countries")],["obj",T("Objetivos","Goals")],["arc",T("Archivo","File")]];
  function tag(box){let g="res";[...box.children].forEach(el=>{if(el.classList.contains("lgtabs"))return;
      const tx=el.tagName==="H3"?el.textContent.trim():"";
      if(el.classList.contains("drop")||el.id==="adifst"||el.id==="logdel")el.dataset.lp="arc";
      else{if(/^(Countries|Countries)$/.test(tx))g="pai";else if(/^(Your goals now|Your goals now)$/.test(tx))g="obj";el.dataset.lp=g}})}
  function show(box){box.querySelectorAll(":scope>[data-lp]").forEach(el=>{el.hidden=el.dataset.lp!==CUR});
    box.querySelectorAll(".lgtabs button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lgp===CUR)))}
  function apply(){const box=document.getElementById("logbox");if(!box)return;const has=!!box.querySelector(".lvaw");let bar=box.querySelector(":scope>.lgtabs");
    if(!has){if(bar)bar.remove();box.querySelectorAll(":scope>[data-lp]").forEach(el=>{el.hidden=false;delete el.dataset.lp});return}
    if(!bar){bar=document.createElement("div");bar.className="seg lgtabs";bar.setAttribute("role","group");bar.setAttribute("aria-label",T("Partes de tu log","Parts of your log"));
      bar.innerHTML=P.map(([k,n])=>`<button type="button" data-lgp="${k}">${n}</button>`).join("");
      bar.addEventListener("click",ev=>{const b=ev.target.closest("[data-lgp]");if(!b)return;CUR=b.dataset.lgp;try{localStorage.setItem("acracb_logpart",CUR)}catch(e){}show(box)});
      box.insertBefore(bar,box.firstChild)}else if(bar!==box.firstElementChild)box.insertBefore(bar,box.firstChild);
    tag(box);show(box)}
  let mo={disconnect(){},observe(){}};
  function boot2(){const box=document.getElementById("logbox");if(!box)return setTimeout(boot2,400);apply();try{mo=new MutationObserver(()=>{mo.disconnect();try{apply()}finally{mo.observe(box,{childList:true})}});mo.observe(box,{childList:true})}catch(e){}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot2);else boot2();
})();

/* ---- 2.10.14: la línea de la estación también abre “Editar estación” (lápiz junto al texto) ---- */
(function(){function go(){var s=document.getElementById("ssum"),b=document.getElementById("stbtn");if(!s||!b)return setTimeout(go,300);
 s.setAttribute("role","button");s.tabIndex=0;s.title=window.ACRACB_LANG==="en"?"Edit station":"Edit station";
 s.addEventListener("click",function(){b.click()});s.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();b.click()}})}go()})();

/* ---- 2.10.19: aviso bien visible cuando los datos no son de ahora ----
   La web se actualiza sola cada 1–3 minutos con la pestaña a la vista. Si los datos tienen más de 30 minutos es que las
   fuentes no han respondido: se dice arriba, con su antigüedad, para que nadie tome por actuales datos viejos. */
(function(){if(window.__hkStale)return;window.__hkStale=1;const EN=()=>window.ACRACB_LANG==="en";
  const age=m=>m<90?m+" min":m<2880?Math.round(m/60)+" h":Math.round(m/1440)+(EN()?" days":" days");
  const T0=Date.now();
  function chk(){try{if(typeof L==="undefined")return;/* al abrir, se espera a la primera actualización (o 15 s) para no avisar en falso */if(Date.now()-T0<15000&&!(L.upd&&Date.parse(L.upd.at)>=T0-2000))return;/* la hora que cuenta es la del spot más reciente (con las fuentes funcionando nunca pasa de unos minutos), no la del último intento */
    const u=Date.parse(L.spotsUTC||L.spotsChecked||L.updatedUTC||"");const row=document.querySelector(".updrow");if(!row)return;let b=document.getElementById("stalebn");
    const m=isNaN(u)?null:Math.round((Date.now()-u)/6e4);const none=!!(L.upd&&L.upd.tot&&L.upd.ok===0);const bad=(m!=null&&m>30)||none;
    if(!bad){if(b)b.remove();return}
    if(!b){b=document.createElement("div");b.id="stalebn";b.className="stalebn";b.setAttribute("role","alert");row.insertAdjacentElement("afterend",b)}
    const t=m!=null&&m>30?(EN()?`The data is from ${age(m)} ago: the sources have not responded. Press Update or check your connection.`:`Los datos son de hace ${age(m)}: las fuentes no han respondido. Pulsa Actualizar o revisa la conexión.`):(EN()?"No source responded in the last update: you are seeing the previous data. Press Update or check your connection.":"Ninguna fuente respondió en la última actualización: ves los datos anteriores. Pulsa Actualizar o revisa la conexión.");
    if(b.textContent!==t)b.textContent=t}catch(e){}}
  setInterval(()=>{if(!document.hidden)chk()},30000);(window.ACRACB_afterDraw=window.ACRACB_afterDraw||[]).push(chk);
  document.addEventListener("visibilitychange",chk);setTimeout(chk,2500);setTimeout(chk,8000);setTimeout(chk,16000)})();

document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest(".nav button,[data-pg]"))setTimeout(()=>{try{clampAll()}catch(e){}},150)},true);

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
/* split: “UP 5”, “UP 5-10” (kHz por encima) o “QSX 7190”, “UP 14.195” (frecuencia exacta en la que escucha) */
window.ACRACB_split=function(c){c=String(c||"");const m=c.match(/\b(?:UP|QSX)\s*\+?(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?/i);if(!m)return null;
  const v=parseFloat(m[1].replace(",",".")),d=(m[1].split(/[.,]/)[1]||"").length;
  if(v>=1000)return {abs:(v/1000).toFixed(3)};if(v>=1.8&&d===3)return {abs:v.toFixed(3)};
  if(v>60)return null;const w=m[2]?parseFloat(m[2].replace(",",".")):null;return {rel:String(+v.toFixed(1)),rel2:w!=null&&w>v&&w<=60?String(+w.toFixed(1)):null}};
window.ACRACB_tags=function(s,inline){const c=String((s&&s.c)||"");if(!c)return "";const out=[];
  let m=null;const sp=ACRACB_split(c);
  if(sp&&sp.abs)out.push(`<span class="xtag xs" title="Works split: transmits on its frequency and listens on another">Split · listening on ${esc2(sp.abs)}</span>`);
  else if(sp)out.push(`<span class="xtag xs" title="Works split: transmits on their frequency and listens higher up">Split · listening +${esc2(sp.rel)}${sp.rel2?"–"+esc2(sp.rel2):""} kHz</span>`);
  else if(/\bUP\b|\bSPLIT\b/i.test(c))out.push(`<span class="xtag xs" title="Works split: listens above their frequency">Split · listening up</span>`);
  else if(/\bDOWN\s*\d*/i.test(c)){m=c.match(/\bDOWN\s*(\d+)?/i);out.push(`<span class="xtag xs">Split · listening −${m&&m[1]?esc2(m[1])+" kHz":"down"}</span>`)}
  const q=[];if(/\bLOTW\b/i.test(c))q.push("LoTW");if(/\bOQRS\b/i.test(c))q.push("OQRS");if(/\bCLUB ?LOG\b/i.test(c)&&!q.includes("OQRS"))q.push("Club Log");
  m=c.match(/\bQSL\s*(?:VIA|MGR|:)?\s*([A-Z0-9]{1,3}[0-9][A-Z0-9]{1,4})\b/i);if(m&&!/^(OQRS|LOTW)$/i.test(m[1]))q.push("via "+m[1].toUpperCase());
  if(/\bDIRECT[OA]?\b/i.test(c))q.push("directa");if(/\bBUREAU|\bBURO\b/i.test(c))q.push("bureau");
  if(q.length)out.push(`<span class="xtag xq" title="How to get the confirmation">QSL: ${esc2(q.join(", "))}</span>`);
  m=c.match(/\b(POTA|WWFF|SOTA|IOTA|GMA)[ :#-]*([A-Z0-9]{1,4}[\/-][A-Z0-9-]{2,8}|[A-Z]{2}-\d{3})\b/i);
  if(m)out.push(`<span class="xtag xr">${esc2(m[1].toUpperCase())} ${esc2(m[2].toUpperCase())}</span>`);
  else{m=c.match(/\b(POTA|WWFF|SOTA)\b/i);if(m)out.push(`<span class="xtag xr">${esc2(m[1].toUpperCase())}</span>`)}
  if(!out.length){m=c.match(/skimmer/i);return m?" · "+esc2(m[0]):""}
  return (inline?" ":"<br>")+out.join(" ")};
function esc2(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

/* =================== intercambio habitual de cada concurso =================== */
const EXCH=[[/CQ WW 160/i,"RST + CQ zone (14)"],[/CQ WW/i,"RST + CQ zone (14)"],[/CQ WPX/i,"RST + serial number"],
  [/ARRL International DX|ARRL DX/i,"RST + power (only with W/VE)"],[/ARRL 10/i,"RST + serial number"],[/ARRL 160/i,"RST (only with W/VE)"],
  [/RTTY Roundup/i,"RST + serial number"],[/IARU/i,"RST + ITU zone (37)"],[/WAE/i,"RST + serial number (and QTC)"],[/JIDX/i,"RST + CQ zone (14)"],
  [/OK\/OM/i,"RST + serial number"],[/LZ DX/i,"RST + ITU zone (37)"],[/IOTA/i,"RST + serial number (+ IOTA reference if you are on an island)"],
  [/EU HF/i,"RST + year of your first license (2 digits)"],[/All Asian/i,"RST + your age"],[/WAG/i,"RST + serial number"],[/^REF/i,"RST + serial number"],
  [/UBA/i,"RST + serial number"],[/PACC/i,"RST + serial number"],[/Russian DX/i,"RST + serial number"],[/^SP DX/i,"RST + serial number"],
  [/Helvetia/i,"RST + serial number"],[/Oceania/i,"RST + serial number"],[/^SAC/i,"RST + serial number"],[/WW Digi/i,"4-character locator"],
  [/King of Spain/i,"RST + province (EA) or serial number (others)"],[/^EA RTTY|^EA PSK/i,"RST + province (EA) or serial number (others)"],
  [/ARI Int/i,"RST + serial number"]];
window.ACRACB_exch=function(name){const e=EXCH.find(([re])=>re.test(name||""));return e?`<span class="xch">Exchange: ${esc2(e[1])}</span>`:""};

/* =================== lluvias de meteoros (dispersión meteórica en 6 y 2 m) =================== */
const MET=[[0,3,"Quadrantids",110],[3,22,"Lyrids",18],[4,6,"Eta Aquariids",50],[5,7,"Arietids (daytime)",60],[7,12,"Perseids",100],[9,21,"Orionids",20],[10,17,"Leonids",15],[11,14,"Geminids",150]];
function nextShower(){const now=new Date();let best=null;for(const y of [now.getFullYear(),now.getFullYear()+1])for(const [m,d,n,z] of MET){const t=new Date(y,m,d,12);const dd=Math.round((t-now)/864e5);if(dd>=-1&&(!best||t<best.t))best={t,n,z,dd}}return best}
function meteorNote(){const box=$("vhfo");if(!box)return;let p=$("metnote");if(!p){p=document.createElement("p");p.id="metnote";p.className="note";box.insertAdjacentElement("afterend",p)}
  const s=nextShower();if(!s)return;const EN=window.ACRACB_LANG==="en";const when=s.dd<=0?"is today":s.dd===1?"is tomorrow":(EN?`in ${s.dd} days`:`en ${s.dd} days`);
  /* 2.11.79: una línea con lo esencial; cómo trabajarla, al tocar */
  p.innerHTML=`<details class="metd"><summary><b>${EN?"Meteor scatter":"Dispersión meteórica"}:</b> ${EN?"next shower":"próxima lluvia"}, <b>${s.n}</b>, ${(m=>EN?m+" "+s.t.getDate():s.t.getDate()+" de "+m)(["January","February","March","April","May","June","July","August","September","October","November","December"][s.t.getMonth()])} (${when})</summary><p>${EN?`About ${s.z} meteors per hour under a dark sky. On those days, on 6 and 2 m with FT8 or MSK144 (50.280 and 144.360 MHz), contacts of 800 to 2,000 km are possible. Best before dawn, when the radiant is high.`:`Unos ${s.z} meteoros por hora en cielo oscuro. Esos días, en 6 y 2 m con FT8 o MSK144 (50.280 and 144.360 MHz) contacts of 800 to 2,000 km are possible. Best before dawn, when the radiant is high.`}</p></details>`}

/* =================== QRP =================== */
const QRPF=[["160 m","1.836","—"],["80 m","3.560","3.690"],["40 m","7.030","7.090"],["30 m","10.116","—"],["20 m","14.060","14.285"],["17 m","18.086","18.130"],["15 m","21.060","21.285"],["12 m","24.906","24.950"],["10 m","28.060","28.360"],["6 m","50.060","50.285"]];
/* 2.10.4: QRP completo: qué bandas abren ahora con 5 W en cada modo (mismo modelo que el resto de la plataforma),
   cuánto pierdes frente a tu potencia, antenas, operativa, lugares y trucos. */
let QW=5;const QWS=()=>(typeof QRPW==="function"&&QRPW()===10?[1,5,10]:[1,2,5]);
function qrpCard(){const el=$("qrpbox");if(!el)return;if(!QWS().includes(QW))QW=5;const EN=window.ACRACB_LANG==="en",T=(a,b)=>EN?b:a;const eq=$("eq");const P=Math.max(1,+(eq&&eq.value)||100);
  let grid="",best=[];try{const lh=localNow(),TGM=TG().filter(t=>t.km>=800),bands=BI().filter(b=>b<=10),mods=[["cw","CW"],["ssb","SSB"],["ft8","FT8"]];
    const dP=-10*Math.log10(P/QW);
    const cell=(b,k)=>{const ex=(MODES[k].adj-MD().adj)+dP;let n=0,top=null,tp=0;for(const t of TGM){const r=prob(t,lh,b,false,ex);const p=r.p;if(p>=.3){n++;if(p>tp){tp=p;top=t}}}return {n,top,tp}};
    const rows=bands.map(b=>{const c=mods.map(([k])=>cell(b,k));return {b,c}}).filter(r=>r.c.some(x=>x.n));
    const col=n=>n>=40?"c5":n>=20?"c4":n>=8?"c3":n>=1?"c2":"c0";
    grid=rows.length?`<div class="scroll"><table class="bt qrpg"><tr><th>${T("Band","Band")}</th>${mods.map(m=>`<th>${T("En","On")} ${m[1]}</th>`).join("")}</tr>${rows.map(r=>`<tr><td><b style="color:${BC[r.b]}">${BANDS[r.b]}</b></td>${r.c.map(x=>`<td>${x.n?`<span class="qc"><span class="pill ${col(x.n)}">${x.n}</span>${x.top?`<small><b>${esc(x.top.name.split(" (")[0])}</b> · ${Math.round(x.tp*100)}%</small>`:""}</span>`:`<span class="qc"><span class="qc0">—</span></span>`}</td>`).join("")}</tr>`).join("")}</table></div>`
      :`<div class="empty">${T(`Ahora, con ${QW} W, ninguna banda llega con seguridad a más de 800 km. Prueba FT8 o espera a la línea gris.`,`Right now, with ${QW} W, no band reliably reaches beyond 800 km. Try FT8 or wait for the greyline.`)}</div>`;
    rows.forEach(r=>r.c.forEach((x,i)=>{if(x.n)best.push({b:r.b,m:mods[i][1],n:x.n,t:x.top})}));best.sort((a,b)=>b.n-a.n)}catch(e){}
  const loss=10*Math.log10(P/QW);const b0=best[0];
  el.innerHTML=`<h3>${T("Qué puedes hacer ahora en QRP","What you can do now in QRP")}</h3><p class="note qrpdef">${(typeof QRPW==="function"&&QRPW()===10)?T("QRP en SSB: hasta 10 W PEP; en CW y digitales, hasta 5 W (IARU Region 1, ARRL and RSGB).","QRP on SSB: up to 10 W PEP; on CW and digital, up to 5 W (IARU Region 1, ARRL and RSGB)."):(typeof st!=="undefined"&&st.mode==="contest")?T("QRP en concursos: hasta 5 W en todos los modos.","QRP in contests: up to 5 W on every mode."):T("QRP en CW y digitales: hasta 5 W; en SSB, hasta 10 W PEP (IARU Region 1, ARRL and RSGB).","QRP on CW and digital: up to 5 W; on SSB, up to 10 W PEP (IARU Region 1, ARRL and RSGB).")}</p>
  <div class="seg qrpw" role="group" aria-label="${T("Potencia QRP","QRP power")}"><span class="segl">${T("Power","Power")}</span>${(typeof QRPW==="function"&&QRPW()===10?[1,5,10]:[1,2,5]).map(w=>`<button type="button" data-qw="${w}" aria-pressed="${QW===w}">${w} W</button>`).join("")}</div>
  <p>${b0?T(`Lo mejor ahora: <b>${BANDS[b0.b]} on ${b0.m}</b>, con ${b0.n} destinos a más de 800 km${b0.t?`, por ejemplo ${esc(b0.t.name.split(" (")[0])}`:""}.`,`Best right now: <b>${BANDS[b0.b]} on ${b0.m}</b>, with ${b0.n} destinations beyond 800 km${b0.t?`, for example ${esc(b0.t.name.split(" (")[0])}`:""}.`):""} ${P>QW?T(`Con ${QW} W tu señal llega ${loss.toFixed(1)} dB más débil que con tus ${P} W: unas ${String(Math.round(loss/6*10)/10)} unidades S menos.`,`With ${QW} W your signal arrives ${loss.toFixed(1)} dB weaker than with your ${P} W: about ${Math.round(loss/6*10)/10} S-units less.`):""}</p>
  ${grid}<p class="note">${T(`Cada casilla: destinos a más de 800 km con al menos un 30% de fiabilidad con ${QW} W y tu antena y, debajo, el más fácil. “—”: nada al alcance.`,`Each cell: destinations beyond 800 km with at least 30% reliability with ${QW} W and your antenna and, below, the easiest one. “—”: nothing in reach.`)}</p>
  <details class="qrpd"><summary>${T("Frecuencias QRP (IARU Región 1)","QRP frequencies (IARU Region 1)")}</summary><div class="scroll"><table class="bt qrpt"><tr><th>${T("Band","Band")}</th><th>CW</th><th>SSB</th></tr>${QRPF.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table></div><p class="note">${T("En MHz. En FT8 y FT4 no hay frecuencia QRP: usa las normales.","In MHz. FT8 and FT4 have no QRP frequency: use the usual ones.")}</p></details>
  <details class="qrpd"><summary>${T("Antenas que rinden con poca potencia","Antennas that pay off at low power")}</summary><ul class="stl">
   <li>${T("<b>Dipolo o dipolo en V invertida</b> a media onda de altura o más: barato, sin acoplador y con poca pérdida. Es la referencia.","<b>Dipole or inverted V</b> at half a wavelength or higher: cheap, no tuner and low loss. It is the benchmark.")}</li>
   <li>${T("<b>EFHW (media onda alimentada en un extremo)</b>: un solo hilo colgado de un árbol o una caña; ideal para portable y para SOTA.","<b>EFHW (end-fed half-wave)</b>: a single wire hung from a tree or a pole; ideal for portable and SOTA.")}</li>
   <li>${T("<b>Vertical de cuarto de onda con radiales</b> junto al mar: el agua salada le da varios dB de ángulo bajo para el DX.","<b>Quarter-wave vertical with radials</b> by the sea: salt water gives it several dB of low angle for DX.")}</li>
   <li>${T("<b>Directiva pequeña</b> (2 o 3 elementos) en 20–10 m: 5 W con 6 dB de ganancia equivalen a unos 20 W con un dipolo.","<b>Small Yagi</b> (2 or 3 elements) on 20–10 m: 5 W with 6 dB of gain is like about 20 W into a dipole.")}</li>
   <li>${T("Evita lo que pierde potencia: cable largo y fino, acopladores con mucha ROE y antenas acortadas con bobinas.","Avoid what wastes power: long thin coax, tuners at high SWR and coil-shortened antennas.")}</li></ul>
   <p class="note">${T("Puedes comparar tu antena con otras en “Editar estación” › Antena: toda la plataforma se recalcula.","You can compare your antenna with others in “Edit station” › Antenna: the whole platform recalculates.")}</p></details>
  <details class="qrpd"><summary>${T("Cómo operar en QRP","How to operate QRP")}</summary><ul class="stl">
   <li>${T("<b>Busca y contesta antes que llamar CQ</b>: quien llama CQ suele tener buena antena y oído; tú solo tienes que llegar a él.","<b>Search and pounce rather than calling CQ</b>: whoever calls CQ usually has a good antenna and ears; you only need to reach them.")}</li>
   <li>${T("<b>Mode</b>: la CW gana unos 11 dB a la SSB y el FT8 unos 27: con 5 W en FT8 es como 2.500 W en SSB.","<b>Mode</b>: CW gains about 11 dB over SSB and FT8 about 27: 5 W on FT8 is like 2,500 W on SSB.")}</li>
   <li>${T("<b>Schedule</b>: bandas altas de día y línea gris al amanecer y al atardecer; evita las horas con Kp alto.","<b>Timing</b>: high bands by day and greyline at sunrise and sunset; avoid times with high Kp.")}</li>
   <li>${T("<b>Llama corto y en el momento justo</b>: tu indicativo una o dos veces, cuando la otra estación acaba de escuchar.","<b>Call short and at the right moment</b>: your callsign once or twice, just when the other station starts listening.")}</li>
   <li>${T("Comprueba quién te oye en <b>DX › ¿Me oyen?</b> tras dos minutos de CQ o FT8.","Check who hears you in <b>DX › Who hears me?</b> after two minutes of CQ or FT8.")}</li>
   <li>${T("En SSB, el procesador de voz (compresor) da unos 3–6 dB de inteligibilidad: actívalo con mesura.","On SSB the speech processor gives about 3–6 dB of intelligibility: use it with care.")}</li></ul></details>
  <details class="qrpd"><summary>${T("Lugares que ayudan","Places that help")}</summary><ul class="stl">
   <li>${T("<b>Near the sea</b>, sobre todo con la antena vertical en la playa: el mejor plano de tierra posible.","<b>By the sea</b>, especially with the vertical on the beach: the best possible ground plane.")}</li>
   <li>${T("<b>Una cumbre despejada</b> (SOTA): el terreno que cae delante equivale a subir mucho la antena; y quien activa una cumbre recibe muchas llamadas.","<b>A clear summit</b> (SOTA): ground falling away in front is like raising the antenna a lot; and summit activators get many calls.")}</li>
   <li>${T("<b>Un parque o espacio protegido</b> (POTA, WWFF): poco ruido eléctrico y estaciones buscándote.","<b>A park or protected area</b> (POTA, WWFF): little electrical noise and stations looking for you.")}</li>
   <li>${T("<b>Lejos del ruido</b>: en ciudad, el ruido local (S7–S9) se come tu recepción; en el campo oyes señales que en casa no existen.","<b>Away from noise</b>: in town, local noise (S7–S9) eats your reception; in the country you hear signals that do not exist at home.")}</li></ul>
   <p class="note">${T("Los activadores de SOTA, POTA y WWFF están en DX › Clúster.","SOTA, POTA and WWFF activators are in DX › Cluster.")}</p></details>`;
  el.querySelectorAll("[data-qw]").forEach(b=>b.onclick=()=>{QW=+b.dataset.qw;qrpCard()})}

/* =================== ¿Me oyen? =================== */
let HR=null,HBUSY=false,HLAST=0;window.ACRACB_heardList=()=>HR?{at:HR.at,band:null,list:HR.list}:null;
const MEMO={};
async function memo(k,min,fn){const m=MEMO[k];if(m&&Date.now()-m.t<min*6e4)return m.v;const v=await fn();MEMO[k]={t:Date.now(),v};return v}
function rxPos(call,loc){try{if(loc&&typeof normLoc==="function"&&normLoc(loc))return locToLL(loc)}catch(e){}try{const ap=window.ACRACB_areaPos&&ACRACB_areaPos(call);if(ap)return ap}catch(e){}try{const e=callEnt(call);if(e&&e.lon!=null)return [e.lon,e.lat];if(e&&e.dxcc){const m=(V.meta||[]).find(x=>x[2]===e.dxcc);if(m)return [m[5],m[4]]}}catch(e){}return null}
async function fromSpothole(call){let j;try{j=await get("https://spothole.app/api/v1/spots?max_age=3600&dx_call="+encodeURIComponent(call),"json")}catch(e){j=await get("https://spothole.app/api/v1/spots?max_age=3600","json")}const a=Array.isArray(j)?j:(j.spots||j.data||[]);
  return a.filter(s=>base(s.dx_call||s.dx||s.callsign)===call&&!/PSK/i.test(String(s.source||""))).map(s=>{const c=String(s.comment||s.info||"");const db=c.match(/(-?\d+)\s*dB/i);const f=+(s.freq||s.frequency||0);const fm=f>1e6?f/1e6:f>1000?f/1000:f;
    const src=/RBN/i.test(String(s.source||""))?"Reverse Beacon":"Cluster";
    const la=+(s.de_latitude||s.de_lat),lo=+(s.de_longitude||s.de_lon);
    return {rx:base(s.de_call||s.spotter||s.de),pos:isFinite(la)&&isFinite(lo)&&(la||lo)?[lo,la]:null,f:fm,band:bandOf(fm),mode:s.mode||(src==="Reverse Beacon"?"CW":""),snr:db?+db[1]:null,t:Date.parse(s.time_iso||s.time||s.spot_time)||(+s.time>1e9?+s.time*1000:null),src}})}
/* clústeres DX clásicos: HamQTH y los spots que ya tiene la plataforma */
async function fromCluster(call){const out=[];const add=(rx,fq,mode,t,c,src)=>{const f=+fq>1000?+fq/1000:+fq;const db=String(c||"").match(/(-?\d+)\s*dB/i);out.push({rx:base(rx),pos:null,f,band:bandOf(f),mode:mode||"",snr:db?+db[1]:null,t,src,c:c||""})};
  const tasks=[(async()=>{const t=await get("https://www.hamqth.com/dxc_csv.php?limit=200","text");t.split("\n").map(l=>l.split("^")).filter(p=>p.length>=5&&base(p[2])===call).forEach(p=>add(p[0],p[1],"",Date.parse(String(p[4]).replace(" ","T")+(/Z$/.test(p[4])?"":"Z"))||null,p[3],"HamQTH"))})()];
  const r=await Promise.allSettled(tasks);
  try{(L.spots||[]).filter(s=>base(s.call)===call).forEach(s=>String(s.by||"").split(/[ ,]+/).filter(Boolean).forEach(by=>add(by,s.f,s.mode,Date.parse(s.utc||"")||null,s.c,"Cluster")))}catch(e){}
  if(r.every(x=>x.status==="rejected")&&!out.length)throw new Error("no response");return out}
async function fromWSPR(call){const q=`SELECT toUnixTimestamp(time) t,rx_sign,rx_loc,rx_lat,rx_lon,frequency,snr,distance FROM wspr.rx WHERE tx_sign='${call.replace(/[^A-Z0-9\/]/g,"")}' AND time>now()-3600 ORDER BY time DESC LIMIT 300 FORMAT JSON`;
  const j=await get("https://db1.wspr.live/?query="+encodeURIComponent(q),"json");return (j.data||[]).map(r=>{const f=+r.frequency/1e6;return {rx:base(r.rx_sign),pos:[+r.rx_lon,+r.rx_lat],f,band:bandOf(f),mode:"WSPR",snr:+r.snr,t:+r.t*1000,src:"WSPRnet",km:+r.distance}})}
/* 2.10.44: Reverse Beacon Network en el resumen de HamQTH (datos gratuitos, “Data provided by HamQTH.com”): cada skimmer con su SNR */
async function fromRBN(call){const j=await memo("rbn",2,()=>get("https://www.hamqth.com/rbn_data.php?data=1&age=3600&order=3","json"));const out=[];
  for(const [k,v] of Object.entries(j&&typeof j==="object"?j:{})){if(!v||base(v.dxcall||k)!==call)continue;const f=+String(v.freq||"").replace(/\s/g,"")/1000;if(!isFinite(f)||!f)continue;
    const t=Date.now()-(+v.age||0)*1000;for(const [rx,snr] of Object.entries(v.lsn||{}))out.push({rx:base(rx),pos:null,f,band:bandOf(f),mode:v.mode||"CW",snr:isFinite(+snr)?+snr:null,t,src:"Reverse Beacon"})}
  return out}
async function checkHeard(manual){const call=base(($("hcall")||{}).value||S.get("acracb_mycall")||"");if(!call||call.length<3){if(manual)hStatus("Enter your callsign.");return}
  if(ART){hStatus("This check works in the web version of the platform, not here.");return}
  if(HBUSY)return;HBUSY=true;HLAST=Date.now();S.set("acracb_mycall",call);hStatus("Looking for who heard you in the last hour…");
  const src=[["Reverse Beacon",fromSpothole],["HamQTH RBN",fromRBN],["DX clusters",fromCluster],["WSPRnet",fromWSPR]];
  const res=await Promise.all(src.map(async([n,fn])=>{try{return {n,ok:true,v:await fn(call)}}catch(e){return {n,ok:false,v:[]}}}));
  const all=[];res.forEach(r=>r.v.forEach(x=>{if(!x.rx||x.band==null)return;if(!x.pos)x.pos=rxPos(x.rx,null);if(x.km==null&&x.pos)try{x.km=Math.round(window.ACRACB_geoKm?ACRACB_geoKm(TXP,x.pos).km:distJS(TXP,x.pos))}catch(e){}all.push(x)}));
  const best=new Map();all.forEach(x=>{const k=x.rx+"|"+x.band;const b=best.get(k);if(!b||(x.t||0)>(b.t||0))best.set(k,x)});
  HR={call,at:Date.now(),list:[...best.values()],src:res.map(r=>[r.n,r.ok])};HBUSY=false;renderHeard()}
function hStatus(t){const e=$("hst");if(e)e.textContent=t}
function renderHeard(){const el=$("heardbox");if(!el)return;const call=S.get("acracb_mycall")||((typeof LOG!=="undefined"&&LOG&&LOG.call)||"");
  if(!$("hcall")){el.innerHTML=`<p>Call CQ for two or three minutes and press <b>Check</b>: you will see who heard you in the last hour, on which band and how strong, according to the DX clusters, Reverse Beacon (through Spothole and HamQTH) and WSPRnet. <button class="lnk" id="hclub">Try with the club call, EA5RKB</button></p>
    <div class="hcrow"><input id="hcall" type="text" autocomplete="off" spellcheck="false" maxlength="14" placeholder="Callsign" aria-label="Your callsign" value="${esc2(call)}"><button class="btn" id="hgo">Check</button></div><p class="note" id="hst"></p><div id="hres"></div>`;
    $("hgo").onclick=()=>checkHeard(true);$("hclub").onclick=()=>{const prev=S.get("acracb_mycall");$("hcall").value="EA5RKB";checkHeard(true).then(()=>{if(prev)S.set("acracb_mycall",prev)})};$("hcall").addEventListener("keydown",e=>{if(e.key==="Enter")checkHeard(true)});
    $("hcall").addEventListener("input",e=>{e.target.value=e.target.value.toUpperCase()})}
  {const hc=$("hcall");if(hc&&!hc.value&&call&&document.activeElement!==hc)hc.value=call}
  const out=$("hres");if(!out)return;if(!HR){out.innerHTML="";return}
  const L2=HR.list,okS=HR.src.filter(s=>s[1]).map(s=>s[0]),koS=HR.src.filter(s=>!s[1]).map(s=>s[0]);
  if(!L2.length){hStatus(`No one has reported ${HR.call} in the last hour.${koS.length?" No response from: "+koS.join(", ")+".":""}`);out.innerHTML=`<p class="note">If you just called, wait a couple of minutes and check again. Automatic receivers only report CQ calls on CW, RTTY, FT8, FT4 and WSPR; on SSB you depend on someone spotting you on the cluster.</p>`;return}
  const byB={};L2.forEach(x=>{(byB[x.band]=byB[x.band]||[]).push(x)});
  const far=L2.slice().sort((a,b)=>(b.km==null?-1:b.km)-(a.km==null?-1:a.km));
  hStatus(`${HR.call}: heard by ${L2.length} stations in the last hour · checked at ${new Date(HR.at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}${koS.length?" · no response from "+koS.join(", "):""}.`);
  out.innerHTML=`<div class="hbands">${Object.entries(byB).sort((a,b)=>b[1].length-a[1].length).map(([b,a])=>{const mx=Math.max(...a.map(x=>x.km||0)),sn=a.filter(x=>x.snr!=null).map(x=>x.snr);
      return `<div class="chip"><div class="k" style="color:${BC[b]}">${BANDS[b]}</div><div class="v">${a.length}</div><div class="t">stations · up to ${fk(mx)} km${sn.length?` · best ${(m=>(m>0?"+":"")+m)(Math.max(...sn))} dB`:""}</div></div>`}).join("")}</div>
    <h3>Who heard you farthest away</h3><div class="goal">${far.slice(0,12).map(x=>{const age=x.t?Math.max(0,Math.round((Date.now()-x.t)/6e4)):null;let az=null;try{if(x.pos)az=Math.round(brgJS(TXP,x.pos))}catch(e){}
      if(window.ACRACB_card)return ACRACB_card({call:x.rx,a:age,band:x.band,mode:x.mode||"",tags:x.snr!=null?[`<span class="xtag xq">${x.snr>0?"+":""}${esc2(x.snr)} dB</span>`]:[],byLbl:"Source",by:esc2(x.src),geo:(x.pos&&window.ACRACB_geo&&ACRACB_geo(x.pos))||(x.km!=null&&az!=null?{az,laz:(az+180)%360,km:x.km}:null)});
      return `<div class="sp"><span class="f" style="color:${BC[x.band]}">${BANDS[x.band]}</span><span><b>${CS(x.rx)}</b>${x.snr!=null?` · <b>${x.snr>0?"+":""}${x.snr} dB</b>`:""}</span><span class="w">${x.km!=null?fk(x.km)+" km":"distancia desconocida"}${az!=null?` · ${az}° ${cab(az)}`:""} · ${x.mode?esc2(x.mode)+" · ":""}${esc2(x.src)}${age!=null?` · ${ageTxt(age)}`:""}</span></div>`}).join("")}</div>
    <p class="note">dB: signal-to-noise ratio at which they receive you. On CW (Reverse Beacon), +10 dB or more is a comfortable signal; FT8 and WSPR decode down to −20 and −28 dB.</p>`}
/* se vuelve a comprobar solo cada 5 minutos mientras tienes abierta la pestaña */
setInterval(()=>{try{if(document.visibilityState==="hidden"||ART)return;const d=$("f_heard");if(!d||d.classList.contains("toff")||!d.offsetParent)return;if(S.get("acracb_mycall")&&Date.now()-HLAST>5*6e4)checkHeard(false)}catch(e){}},30000);

/* 2.8.27: se quita el antiguo botón “Solo parques y cumbres”: nunca llegaba a mostrarse y el buscador del clúster ya filtra POTA, SOTA y WWFF */
/* =================== notificaciones en el dispositivo =================== */
/* 2.8.3: repaso para todos los aparatos.
   - Se envían siempre a través del service worker (Android, iPhone, iPad y Chrome no admiten “new Notification”), esperando a que esté listo.
   - Con las notificaciones activadas y sin silenciar, la plataforma sigue buscando avisos cada 3 minutos aunque esté en segundo plano
     (en el ordenador y en Android mientras el navegador siga abierto; el iPhone y el iPad pausan las webs al poco de salir de ellas).
   - Silencio (1 hora, hasta mañana a las 8:00 o hasta reactivarlo) y botón de prueba en el mismo sitio que el interruptor. */
const TT=(es,en)=>window.ACRACB_LANG==="en"?en:es;
const e2=s=>String(s==null?"":s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const canN="Notification" in window&&!ART;
const canSW=!ART&&"serviceWorker" in navigator&&location.protocol==="https:";
let SWR=null;
if(canSW){navigator.serviceWorker.register("sw.js").then(r=>{SWR=r}).catch(()=>{})}
function notifOn(){return canN&&Notification.permission==="granted"&&S.get("acracb_notif")==="1"}
window.ACRACB_notifOn=notifOn;
/* 2.10.38: se espera a que el service worker esté ACTIVO (antes se usaba el registro recién hecho aunque aún no lo estuviera:
   en el iPhone, el iPad y Android eso fallaba en silencio y el aviso se perdía). Se guarda el motivo del último fallo. */
let NERR="";
async function swReg(){if(!canSW)return null;if(SWR&&SWR.active)return SWR;try{const r=await Promise.race([navigator.serviceWorker.ready,new Promise(ok=>setTimeout(()=>ok(null),10000))]);if(r)SWR=r;return r}catch(e){return null}}
async function notify(title,body,tag){const ic=(document.querySelector('link[rel="apple-touch-icon"]')||{}).href;const o={body,tag:tag||("acracb-"+title),icon:ic,badge:ic,lang:window.ACRACB_LANG==="en"?"en":"es",renotify:true,data:{url:location.href.split("#")[0]}};
  NERR="";try{const r=await swReg();if(r&&r.showNotification){await r.showNotification(title,o);return true}if(canSW)NERR=TT("el service worker no se ha activado","the service worker did not activate")}catch(e){NERR=String(e&&e.message||e)}
  try{new Notification(title,o);return true}catch(e){if(!NERR)NERR=String(e&&e.message||e)}return false}
window.ACRACB_notify=notify;
const IOSD=(()=>{try{return /iP(hone|ad|od)/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1)}catch(e){return false}})();
const STDA=(()=>{try{return matchMedia("(display-mode: standalone)").matches||navigator.standalone===true}catch(e){return false}})();
let NHELP=false,NMSG="";
function notifHelp(){return IOSD&&!STDA?`<p class="note nhelp">${TT("En el iPad y el iPhone, Safari solo deja enviar notificaciones a las webs guardadas en la pantalla de inicio. Toca Compartir (el cuadrado con la flecha hacia arriba), elige “Añadir a pantalla de inicio”, abre la plataforma desde ese icono y pulsa aquí otra vez.","On iPad and iPhone, Safari only lets websites saved to the Home Screen send notifications. Tap Share (the square with the up arrow), choose “Add to Home Screen”, open the platform from that icon and tap here again.")}</p>`:
  IOSD?`<p class="note nhelp">${TT("To get website notifications, iPad and iPhone need iOS or iPadOS 16.4 or later. Update in Settings › General › Software Update.","To get website notifications, iPad and iPhone need iOS or iPadOS 16.4 or later. Update it in Settings › General › Software Update.")}</p>`:
  `<p class="note nhelp">${TT("This browser does not allow website notifications. Open the platform in Chrome, Edge, Firefox or Safari to turn them on.","This browser does not let websites send notifications. Open the platform in Chrome, Edge, Firefox or Safari to turn them on.")}</p>`}
function deniedHelp(){return IOSD?TT("Las has bloqueado. Actívalas en Ajustes › Notificaciones › ACRACB DX.","You have blocked them. Turn them on in Settings › Notifications › ACRACB DX."):
  /Android/i.test(navigator.userAgent)?TT("Las has bloqueado. Toca el candado junto a la dirección (o mantén pulsado el icono de la app › Información) › Notificaciones › Permitir.","You have blocked them. Tap the padlock next to the address (or long-press the app icon › App info) › Notifications › Allow."):
  TT("Las has bloqueado. Haz clic en el candado junto a la dirección › Notificaciones › Permitir, y recarga la página.","You have blocked them. Click the padlock next to the address › Notifications › Allow, and reload the page.")}
function scopeTxt(){return IOSD?TT("En el iPhone y el iPad llegan mientras la plataforma está abierta desde su icono y unos instantes después de salir: iOS pausa las webs en segundo plano.","On iPhone and iPad they arrive while the platform is open from its icon and for a short while after you leave it: iOS pauses websites in the background."):
  TT("Llegan aunque estés en otra app o pestaña, mientras el navegador siga abierto; se busca cada 3 minutos.","They arrive even when you are in another app or tab, as long as the browser stays open; it checks every 3 minutes.")}
function muteRow(){const m=window.ACRACB_alMuted&&ACRACB_alMuted();
  /* silenciadas: ya lo dice el aviso de justo debajo, con su botón “Reactivar” */
  return m?""
   :`<span class="nmute">${TT("Silenciar:","Mute:")} <button type="button" class="lnk" data-mute="60">${TT("1 hora","1 hour")}</button> · <button type="button" class="lnk" data-mute="tom">${TT("hasta mañana a las 8:00","until 8:00 tomorrow")}</button> · <button type="button" class="lnk" data-mute="inf">${TT("hasta que las reactive","until I turn them back on")}</button></span>`}
/* 2.10.38: estado a la vista: cuándo se comprobó por última vez y cuál fue la última notificación */
function nstat(){const hm=t=>new Date(t).toLocaleTimeString(TT("en-US","en-US"),{hour:"2-digit",minute:"2-digit"});const b=[];
  if(NCHK)b.push(TT(`Última comprobación ${hm(NCHK.at)}: ${NCHK.n} aviso${NCHK.n===1?"":"s"}, ${NCHK.f?NCHK.f+" nuevo"+(NCHK.f===1?"":"s"):"ninguno nuevo"}`,`Last check ${hm(NCHK.at)}: ${NCHK.n} alert${NCHK.n===1?"":"s"}, ${NCHK.f?NCHK.f+" new":"none new"}`));
  if(NLAST)b.push(TT(`última notificación ${hm(NLAST.at)} (${NLAST.call})`,`last notification ${hm(NLAST.at)} (${NLAST.call})`));
  return b.length?`<p class="note nstat">${e2(b.join(" · "))}.</p>`:""}
function notifUI(){const host=$("alerts");if(!host||ART)return;let w=$("notifw");if(!w){w=document.createElement("div");w.id="notifw";w.className="notifw";host.insertAdjacentElement("beforebegin",w)}
  const msg=NMSG?`<p class="note nmsg">${e2(NMSG)}</p>`:"";
  if(!canN){w.innerHTML=`<button class="btn" id="notifb" aria-expanded="${NHELP}" title="${TT("Para que te avise aunque estés en otra app o pestaña","So it can alert you even when you are in another app or tab")}">${TT("Notify me","Notify me")}</button>${NHELP?notifHelp():""}`;
    $("notifb").onclick=()=>{NHELP=!NHELP;notifUI()};return}
  const pm=Notification.permission,on=notifOn();
  if(pm==="denied"){w.innerHTML=`<p class="note nhelp">${TT("Notificaciones desactivadas para esta web.","Notifications are off for this site.")} ${deniedHelp()}</p>`;return}
  w.innerHTML=`<button class="btn" id="notifb" aria-pressed="${on}">${on?TT("Notifications on","Notifications on"):TT("Notify me","Notify me")}</button>`+
    (on?`<button type="button" class="btn" id="notift">${TT("Probar","Test")}</button>`:"")+
    `<span class="note nscope">${on?TT("Te avisará de lo que te falte, de las DXpediciones y del DX curioso o lejano que elijas aquí abajo, con tu modo y tus bandas. ","It will alert you to what you need, DXpeditions and the unusual or far DX you choose below, in your mode and bands. ")+scopeTxt():""}</span>`+
    (on?muteRow():"")+(on?nstat():"")+msg;
  const b=$("notifb");if(b)b.onclick=async()=>{NMSG="";if(notifOn()){S.set("acracb_notif","0");notifUI();return}
    if(IOSD&&!STDA){NHELP=true;w.insertAdjacentHTML("beforeend",notifHelp());return}
    try{const p=await Notification.requestPermission();if(p==="granted"){S.set("acracb_notif","1");try{(L.alert&&L.alert.items||[]).forEach(x=>SEEN.add(x.call+"|"+x.band));SEEN.save()}catch(e){}
      const ok=await notify("ACRACB DX",TT("Notifications on: I will let you know about anything you need.","Notifications on: I will let you know about what you need."),"acracb-on");if(!ok)NMSG=TT("El permiso está concedido, pero este navegador no ha mostrado la notificación de prueba.","Permission is granted, but this browser did not show the test notification.")}}catch(e){}
    notifUI();try{window.ACRACB_updSched&&ACRACB_updSched()}catch(e){}};
  const t=$("notift");if(t)t.onclick=async()=>{const ok=await notify(TT("Prueba de ACRACB DX","ACRACB DX test"),TT("Si ves esto, las notificaciones funcionan en este aparato.","If you can see this, notifications work on this device."),"acracb-test");NMSG=ok?TT("Prueba enviada. Si no la ves, revisa el modo No molestar o Concentración del aparato.","Test sent. If you do not see it, check the device's Do Not Disturb or Focus mode."):TT("Este navegador no ha podido mostrarla.","This browser could not show it.")+(NERR?" ("+NERR+")":"");notifUI()}}
/* 2.10.38: lo ya avisado se recuerda 6 horas (antes, para siempre: una estación que volvía otro día ya no avisaba)
   y solo se da por avisado si la notificación ha salido de verdad */
const SEENH=6*36e5;const SEENM=new Map((()=>{try{const v=JSON.parse(S.get("acracb_nseen2")||"[]");return Array.isArray(v)?v:[]}catch(e){return []}})());
const SEEN={has:k=>{const t=SEENM.get(k);return t!=null&&Date.now()-t<SEENH},add:k=>{SEENM.set(k,Date.now())},save:()=>{const n=Date.now();for(const [k,t] of SEENM)if(n-t>=SEENH)SEENM.delete(k);S.set("acracb_nseen2",JSON.stringify([...SEENM].slice(-400)))}};
let NLAST=(()=>{try{return JSON.parse(S.get("acracb_nlast")||"null")}catch(e){return null}})(),NCHK=null,NBUSY=false;
function checkNotify(){if(!notifOn()||NBUSY)return;if(window.ACRACB_alMuted&&ACRACB_alMuted())return;const al=L.alert;if(!al||!al.items)return;
  const ok=al.items.filter(x=>!window.ACRACB_alOK||ACRACB_alOK(x)),fresh=ok.filter(x=>!SEEN.has(x.call+"|"+x.band));NCHK={at:Date.now(),n:ok.length,f:fresh.length};
  if(!fresh.length)return;const x=fresh[0];const EN=window.ACRACB_LANG==="en";NBUSY=true;
  Promise.resolve(notify(`${x.call} ${EN?"on":"en"} ${BANDS[x.band]||""} ${x.mode||""}`.trim(),`${x.f} · ${x.t} UTC · ${(x.sub==="rare"||x.sub==="cur"||x.sub==="far"||x.sub==="dxp")?(EN?(x.whyEn||x.why):x.why):(EN?"you need it":"needed")+(x.why?" ("+(EN?(x.whyEn||x.why):x.why)+")":"")}${fresh.length>1?(EN?` · and ${fresh.length-1} more`:` · and ${fresh.length-1} more`):""}`,"acracb-"+x.call+"-"+x.band))
   .then(sent=>{if(sent){fresh.forEach(y=>SEEN.add(y.call+"|"+y.band));SEEN.save();NLAST={at:Date.now(),call:x.call,band:x.band};S.set("acracb_nlast",JSON.stringify(NLAST))}else NMSG=TT("No se ha podido mostrar la última notificación","The last notification could not be shown")+(NERR?": "+NERR:"")+".";try{notifUI()}catch(e){}})
   .finally(()=>{NBUSY=false})}
/* al volver a la plataforma se comprueba enseguida lo pendiente */
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")setTimeout(()=>{try{checkNotify()}catch(e){}},400)});
document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest("#notifw [data-mute],#notifw [data-unmute]"))setTimeout(()=>{try{notifUI()}catch(e){}},30)});

/* =================== arranque =================== */
function all(){try{meteorNote()}catch(e){}try{qrpCard()}catch(e){}try{renderHeard()}catch(e){}try{notifUI()}catch(e){}}
function hook(){
  try{const r0=refresh;refresh=function(){const v=r0.apply(this,arguments);all();return v}}catch(e){}
  try{const a0=renderAlerts;renderAlerts=function(){const v=a0.apply(this,arguments);try{checkNotify()}catch(e){}try{notifUI()}catch(e){}return v}}catch(e){}
  all();try{checkNotify()}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(hook,20));else setTimeout(hook,20);
})();

/* ---- ACRACB 1.2: visor del log (continentes, países, bandas, modos, mapa y diplomas) ---- */
(function(){
"use strict";
const $=id=>document.getElementById(id);const TT=(es,en)=>window.ACRACB_LANG==="en"?en:es;
const e2=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const CONT={EU:"Europe",AF:"Africa",AS:"Asia",NA:"North America",SA:"South America",OC:"Oceania",AN:"Antártida"};
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
function bar(a,b,tot,cl){const pa=tot?Math.round(a/tot*100):0,pb=tot?Math.round(b/tot*100):0;return `<div class="lvbar" title="${b} confirmadas, ${a} worked out of ${tot}"><span class="lvw" style="width:${pa}%"></span><span class="lvc" style="width:${pb}%"></span></div>`}
window.ACRACB_logview=function(){if(typeof LOG==="undefined"||!LOG||!LOG.e)return "";const E=ents();const tot=E.length;
  let wk=0,cf=0;const byC={};Object.keys(CONT).forEach(k=>byC[k]={w:0,c:0,t:0});
  E.forEach(x=>{const s=stat(x.dx);const k=byC[x.cont];if(k){k.t++;if(s)k.w++;if(s==="C")k.c++}if(s)wk++;if(s==="C")cf++});
  const known=new Set(E.map(x=>x.dx));const extra=Object.keys(LOG.e).filter(d=>!known.has(+d)).length;
  const bandW={},bandC={};let slots=0;HF.forEach(b=>{bandW[b]=0;bandC[b]=0});
  Object.values(LOG.e).forEach(v=>HF.forEach(b=>{const s=v[BKEY[b]];if(s)bandW[b]++;if(s==="C"){bandC[b]++;slots++}}));
  const wacC=Object.entries(byC).filter(([k,v])=>k!=="AN"&&v.c>0).map(([k])=>k),wacMiss=["EU","AF","AS","NA","SA","OC"].filter(k=>!wacC.includes(k));
  const dxccTxt=cf>=100?`<b>Achieved</b> (${cf} confirmadas)`:`you need <b>${100-cf}</b> confirmadas`;
  let h=`<h3>Your log at a glance</h3><div class="lvaw">
   <div class="chip"><div class="k">DXCC award (100 entities)</div><div class="v">${cf} / 100</div>${bar(Math.min(wk,100),Math.min(cf,100),100)}<div class="t">${dxccTxt}</div></div>
   <div class="chip"><div class="k">WAC (6 continentes)</div><div class="v">${wacC.length} / 6</div>${bar(wacC.length,wacC.length,6)}<div class="t">${wacMiss.length?"needed "+wacMiss.map(k=>CONT[k]).join(", "):"<b>Achieved</b>: all confirmed"}</div></div>
   <div class="chip"><div class="k">Confirmed band-entities</div><div class="v">${fk(slots)}</div>${bar(Math.min(slots,1000),Math.min(slots,1000),1000)}<div class="t">the DXCC Challenge starts at 1,000 (160 a 6 m)</div></div>
   <div class="chip"><div class="k">DXCC entities</div><div class="v">${wk} / ${tot}</div>${bar(wk,cf,tot)}<div class="t">${cf} confirmed · you need ${tot-wk}${extra?` · ${extra} already deleted from the list`:""}</div></div></div>
   <div class="lvleg"><span><i class="lvc"></i> confirmadas</span><span><i class="lvw"></i> worked, not confirmed</span><span><i class="lvn"></i> you need</span></div>
   <div class="lvmap" id="lvmap"></div>
   <div class="lvcols"><div><h3>By continent</h3><table class="bt lvt"><tr><th>Continent</th><th>Wkd.</th><th>Cfm.</th><th>Total</th><th></th></tr>${Object.entries(byC).map(([k,v])=>`<tr><td><b>${CONT[k]}</b></td><td>${v.w}</td><td>${v.c}</td><td>${v.t}</td><td class="lvbc">${bar(v.w,v.c,v.t)}</td></tr>`).join("")}</table></div>
   <div><h3>By band</h3><table class="bt lvt"><tr><th>Band</th><th>Wkd.</th><th>Cfm.</th><th></th></tr>${HF.filter(b=>bandW[b]).map(b=>`<tr><td><b style="color:${BC[b]}">${BANDS[b]}</b></td><td>${bandW[b]}</td><td>${bandC[b]}</td><td class="lvbc">${bar(bandW[b],bandC[b],tot)}</td></tr>`).join("")||`<tr><td colspan="4" class="note">No band data.</td></tr>`}</table>
   ${LOG.m?(()=>{const mw={CW:0,PH:0,DG:0},mc={CW:0,PH:0,DG:0};Object.values(LOG.m).forEach(v=>Object.entries(v).forEach(([k,s])=>{if(mw[k]!=null){mw[k]++;if(s==="C")mc[k]++}}));
     return `<h3>By mode</h3><table class="bt lvt"><tr><th>Mode</th><th>Wkd.</th><th>Cfm.</th></tr>${[["CW","CW"],["PH","Phone"],["DG","Digital"]].map(([k,n])=>`<tr><td><b>${n}</b></td><td>${mw[k]}</td><td>${mc[k]}</td></tr>`).join("")}</table>`})():`<p class="note">Upload your ADIF again to also see the breakdown by mode (CW, phone and digital).</p>`}</div></div>
   <h3>Countries</h3><div class="lvf"><div class="seg" role="group" aria-label="Which countries to show">${[["all","All"],["C","Confirmed"],["W","Not confirmed"],["N","Needed"]].map(([k,n])=>`<button data-lvst="${k}" aria-pressed="${F.st===k}">${n}</button>`).join("")}</div>
   <select id="lvct" aria-label="Continent"><option value="">All continents</option>${Object.entries(CONT).map(([k,n])=>`<option value="${k}"${F.ct===k?" selected":""}>${n}</option>`).join("")}</select>
   <input id="lvq" type="search" placeholder="Search country" aria-label="Search country" value="${e2(F.q)}"></div><div id="lvlist"></div>`;
  setTimeout(()=>{list();drawMap()},0);return h};
/* 2.10.3: sin listas interminables: con el buscador vacío, los países van agrupados por continente en desplegables
   cerrados con su recuento; dentro, fichas pequeñas que al tocarlas enseñan las bandas. Al buscar, lista directa. */
let OPEN=new Set();
function list(){const el=$("lvlist");if(!el)return;const q=F.q.trim().toLowerCase();
  const a=ents().filter(x=>{const s=stat(x.dx);if(F.st==="C"&&s!=="C")return false;if(F.st==="W"&&s!=="W")return false;if(F.st==="N"&&s)return false;if(F.ct&&x.cont!==F.ct)return false;if(q&&!x.name.toLowerCase().includes(q))return false;return true})
    .sort((p,r)=>p.name.localeCompare(r.name,"en"));
  const fl=cc=>{try{const f=DXDg().f[cc];return f?`<img class="fl" alt="" width="18" height="12" src="data:image/svg+xml,${encodeURIComponent(f)}">`:""}catch(e){return ""}};
  const chip=x=>{const v=LOG.e[x.dx]||{},s=stat(x.dx);const bs=HF.map(b=>{const k=v[BKEY[b]];return k?`<i class="${k==="C"?"c":"w"}" title="${BANDS[b]}: ${k==="C"?"confirmada":"trabajada"}">${BANDS[b].replace(/\s+c?m$/,"")}</i>`:""}).join("");
    const nb=HF.filter(b=>v[BKEY[b]]).length;
    return `<details class="lvd ${s==="C"?"c":s==="W"?"w":"n"}"><summary>${fl(x.cc)} <b>${e2(x.name)}</b> <small>${s?nb+(nb===1?TT(" banda"," band"):TT(" bandas"," bands")):TT("needed","needed")}</small></summary><div class="lvbs">${bs||`<i class="n">${TT("needed on every band","needed on every band")}</i>`}</div></details>`};
  const tot=`<p class="note">${a.length} ${a.length===1?TT("entity","entity"):TT("entities","entities")}${q||F.ct?"":TT(" · toca un continente para verlas"," · tap a continent to see them")}</p>`;
  if(q||F.ct){el.innerHTML=tot+`<div class="lvchips">${a.slice(0,F.n).map(chip).join("")}</div>${a.length>F.n?`<button class="btn" id="lvmore">View ${Math.min(60,a.length-F.n)} more</button>`:""}`}
  else{const g={};a.forEach(x=>{(g[x.cont||"?"]=g[x.cont||"?"]||[]).push(x)});
    el.innerHTML=tot+Object.keys(CONT).filter(k=>g[k]).map(k=>{const xs=g[k];const c=xs.filter(x=>stat(x.dx)==="C").length,w=xs.filter(x=>stat(x.dx)==="W").length,n=xs.length-c-w;
      return `<details class="lvgrp" data-ct="${k}"${OPEN.has(k)?" open":""}><summary><b>${CONT[k]}</b> <span class="lvgn">${xs.length}</span><span class="lvgs">${c?`<i class="c">${c}</i>`:""}${w?`<i class="w">${w}</i>`:""}${n?`<i class="n">${n}</i>`:""}</span></summary><div class="lvchips">${xs.map(chip).join("")}</div></details>`}).join("")}
  el.querySelectorAll("details.lvgrp").forEach(d=>d.addEventListener("toggle",()=>{if(d.open)OPEN.add(d.dataset.ct);else OPEN.delete(d.dataset.ct)}));
  const m=$("lvmore");if(m)m.onclick=()=>{F.n+=60;list()}}
function drawMap(){const el=$("lvmap");if(!el||typeof d3==="undefined"||typeof topojson==="undefined")return;
  try{const W=720,H=330;const topo=JSON.parse($("world").textContent);let land=topojson.feature(topo,topo.objects.countries||topo.objects.land);
    /* d3 dibuja al revés los polígonos con el sentido de giro invertido (rellenan todo el mapa): se corrigen aquí */
    const fix=g=>{if(!g)return g;const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];polys.forEach(p=>{if(d3.geoArea({type:"Polygon",coordinates:p})>2*Math.PI)p.forEach(r=>r.reverse())});return g};
    (land.features||[land]).forEach(f=>fix(f.geometry));
    const pr=d3.geoEquirectangular().fitSize([W,H],{type:"Sphere"}).translate([W/2,H/2+18]);const pa=d3.geoPath(pr);
    const dots=ents().filter(x=>x.lat!=null&&x.lon!=null).map(x=>{const s=stat(x.dx);const p=pr([x.lon,x.lat]);return p?`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${s?3.2:2.2}" class="${s==="C"?"c":s==="W"?"w":"n"}"><title>${e2(x.name)}: ${s==="C"?"confirmada":s==="W"?"worked, not confirmed":"needed"}</title></circle>`:""}).join("");
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of the entities in your log">${(land.features||[land]).map(f=>`<path d="${pa(f)||""}" class="lvland"/>`).join("")}${dots}</svg>`}catch(e){el.innerHTML=""}}
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

/* ---- 2.8.24: versión inglesa sin restos en español en los datos ----
   El servidor escribe en español algunos textos (resumen del Sol y del Kp, estaciones cercanas, VHF, información y fechas de
   las DXpediciones, notas de los spots, CME, protones, aurora, avisos, fuentes del clúster). En la versión inglesa se traducen
   al cargar los datos, con reglas para cada frase fija. Los patrones van como expresiones regulares para que el traductor de
   la compilación no los toque. */
(function(){
"use strict";
if(window.ACRACB_LANG!=="en")return;
const MON={ene:"Jan",feb:"Feb",mar:"Tue",abr:"Apr",may:"May",jun:"Jun",jul:"Jul",ago:"Aug",sep:"Sep",oct:"Oct",nov:"Nov",dic:"Dec"};
const mon=m=>MON[String(m).toLowerCase().slice(0,3)]||m;
const dot=s=>String(s).replace(/(\d),(\d)/g,"$1.$2");
const RULES=[
 // Kp
 [/NOAA prevé tormenta \(Kp up to ([\d.,]+)\): noches ruidosas en bandas bajas y caminos polares flojos\./g,(m,a)=>`NOAA forecasts a storm (Kp up to ${dot(a)}): noisy nights on the low bands and weak polar paths.`],
 [/NOAA prevé campo activo \(Kp up to ([\d.,]+)\): algo de QSB en los caminos del norte\./g,(m,a)=>`NOAA forecasts an active field (Kp up to ${dot(a)}): some QSB on northern paths.`],
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
 [/ \((\d+) sources\): /g," ($1 sources): "],
 [/muy alto, bandas altas abiertas buena parte del día\./g,"very high, upper bands open much of the day."],
 [/bueno para 15, 12 y 10 m de día\./g,"good for 15, 12 and 10 m in daytime."],
 [/medio; 20 y 17 m son las bandas fiables de día\./g,"medium; 20 and 17 m are the reliable daytime bands."],
 [/bajo; in daytime the best is 20 m\./g,"low; in daytime 20 m is best."],
 [/Sin datos solares nuevos\./g,"No new solar data."],
 // Geomagnetismo
 [/Tormenta geomagnética/g,"Geomagnetic storm"],[/Campo algo agitado/g,"Slightly unsettled field"],[/Campo tranquilo/g,"Quiet field"],[/Campo activo/g,"Active field"],
 [/viento solar de (\d+) km\/s/g,"solar wind at $1 km/s"],[/ \(fast\)/g," (fast)"],
 [/Bz al sur \(([-−\d.,]+) nT\): el Kp puede subir en unas horas/g,(m,a)=>`Bz south (${dot(a)} nT): Kp may rise within hours`],
 [/Buena noche para 40, 80 y 160 m\./g,"Good night for 40, 80 and 160 m."],
 [/Buenos caminos polares hacia Japón y Norteamérica\./g,"Good polar paths to Japan and North America."],
 [/Busca rumbos al sur: los del norte llegarán débiles\./g,"Look south: northern paths will be weak."],
 // Previsión
 [/NOAA espera flujo al alza/g,"NOAA expects rising flux"],[/NOAA espera flujo a la baja/g,"NOAA expects falling flux"],[/NOAA espera flujo estable/g,"NOAA expects steady flux"],
 [/\(entre (\d+) y (\d+) over ten days\)/g,"(between $1 and $2 over ten days)"],
 [/[Pp]osible tormenta el (\d{1,2}) de ([a-zA-Z]{3})/g,(m,d,mm)=>`Possible storm on ${mon(mm)} ${d}`],
 [/[Ll]lega una eyección de masa coronal hacia el (\d{1,2}) de ([a-zA-Z]{3}) at (\d\d) UTC: /g,(m,d,mm,h)=>`A coronal mass ejection arrives around ${mon(mm)} ${d} at ${h}:00 UTC: `],
 [/Kp hasta ([\d.,]+) en los próximos tres días/g,(m,a)=>`Kp up to ${dot(a)} over the next three days`],
 // CME, protones, aurora
 [/puede dar tormenta G1–G2/g,"may cause a G1–G2 storm"],[/puede agitar el campo \(Kp 4–5\)/g,"may unsettle the field (Kp 4–5)"],[/efecto débil esperado/g,"weak effect expected"],
 [/tormenta de protones/g,"proton storm"],
 [/ % en el norte de Europa/g," % in northern Europe"],[/Sin aurora sobre Europa/g,"No aurora over Europe"],
 // estaciones cercanas
 [/[Pp]ocas estaciones ibéricas destacadas( en esta ronda)?\.?/g,"Few notable Iberian stations this round."],
 [/(\d+) spots de España peninsular\. Destacan /g,"$1 spots from mainland Spain. Notable: "],
 // VHF
 [/Sin aperturas en 6 m, 2 m ni 70 cm en el clúster ahora mismo\./g,"No openings on 6 m, 2 m or 70 cm on the cluster right now."],
 [/ E-Skip en 6 m: /g," 6 m E-skip: "],[/6 m abierto \((\d+) spots beyond 300 km\)/g,"6 m open ($1 spots over 300 km)"],
 [/2 m\/70 cm con (\d+) contactos largos, probable tropo/g,"2 m/70 cm with $1 long contacts, probably tropo"],[/clúster y HamQSL/g,"cluster and HamQSL"],
 // DXpediciones
 [/Activa hasta el (\d{1,2}) ([a-zA-Z]{3})/g,(m,d,mm)=>`Active until ${mon(mm)} ${d}`],
 [/(\d+–\d+ ?m) en /g,"$1 in "],[/(\d+ ?m) en (?=[A-Z])/g,"$1 in "],[/\bmodos sin anunciar\b/g,"modes not announced"],[/\bsobre todo\b/g,"mostly"],[/\by algo de\b/g,"and some"],[/\bescucha arriba\b/g,"listening up"],
 [/\bA las (\d\d:\d\d) UTC en /g,"At $1 UTC on "],[/\bSpot a las (\d\d:\d\d) UTC en /g,"Spot at $1 UTC on "],[/ a las (\d\d:\d\d) UTC/g," at $1 UTC"],
 [/\bTambién en /g,"Also on "],[/\(CQ en /g,"(CQ at "],[/\boíd[ao] en /g,"heard in "],[/oído por skimmer \(RBN\)/g,"heard by a skimmer (RBN)"],
 [/decodificado \(PSK Reporter\)/g,"decoded (PSK Reporter)"],[/ hasta el (\d{1,2}) ([a-zA-Z]{3})\b/g,(m,d,mm)=>` until ${mon(mm)} ${d}`],
 [/ hasta el /g," until "],[/\bdesde\b/g,"from"],[/\bvía\b/g,"via"],[/ por (?=[A-Z0-9]{3,})/g," by "],
 // fuentes del clúster
 [/(\d+) nuevos, (\d+) confirmed on 2\+ fuentes/g,"$1 new, $2 confirmed by 2+ sources"],[/Ninguna fuente de clúster respondió en esta ronda/g,"No cluster source answered this round"],
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
const ES_LEFT=t=>/\b(?:en|de|del|la|las|los|el|con|unas?|about?|ya|para|desde|hasta|above|equipo|stations|antenas|montadas|isla|también|oíd[ao]|según|activa|año|days?|semanas?|aparece|modos|sin|anunciar|estilo|vacaciones|hoy|lento|digitales|fonía|telegraphy)\b|ción\b/i.test(String(t||""));
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

/* ---- ACRACB 2.1: clúster con filtro de banda, POTA/SOTA/WWFF, paso largo y DXpediciones en el aire ---- */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";
const T=(es,en)=>EN()?en:es;
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const ORD=[0,1,8,2,9,3,4,5,6,7,10,11,12];
const PROGS=["POTA","SOTA","WWFF","IOTA","LLOTA","OTROS"];
/* 2.10.18: una sola clasificación en toda la plataforma: DX, POTA, SOTA, WWFF, IOTA y OTROS (GMA, castillos, faros,
   diplomas españoles…). Sale de los propios clústeres: referencia del spot o de su comentario. */
/* 2.10.20: IOTA (islas) con categoría propia */
/* 2.10.24: LLOTA (lagos y lagunas) también con categoría propia */
const P3=["POTA","SOTA","WWFF","IOTA","LLOTA"];const catOf=o=>P3.includes(String(o.prog||"").toUpperCase())?String(o.prog).toUpperCase():"OTROS";
const RXA=/\b(POTA|SOTA|WWFF|IOTA|GMA|WCA|HEMA|WWBOTA|BOTA|LLOTA|ILLW|ARLHS|SIOTA|ZLOTA|DME|DVGE|DFE|DCE|DIE|DMVE|DEE)[ :#-]*([A-Z0-9]{1,5}[\/-][A-Z0-9\/-]{1,12})\b/i;
/* filtros acumulativos, como las bandas del mapa: se pueden marcar varios tipos y varias bandas a la vez */
const ld=(k,ok)=>{try{const v=JSON.parse(S.get(k)||"null");return Array.isArray(v)?v.filter(ok):null}catch(e){return null}};
let TYPES=new Set(ld("acracb_cltypes",x=>x==="dx"||PROGS.includes(x))||[S.get("acracb_cltype")].filter(x=>x==="dx"||PROGS.includes(x)));if(!TYPES.size)["dx"].concat(PROGS).forEach(x=>TYPES.add(x));
/* quien tenía “Todos” marcado antes de existir OTROS sigue con todo */if(["dx","POTA","SOTA","WWFF"].every(x=>TYPES.has(x))){TYPES.add("OTROS");TYPES.add("IOTA");TYPES.add("LLOTA")}
/* 2.10.19: un solo juego de filtros. Las bandas elegidas en el clúster son las mismas del mapa (st.mbs) y de los avisos;
   el modo es el de la estación más los que añadas en el clúster o el mapa (CMS). Vacío = todas. */
const BSEL={get size(){return BL().length},has:b=>BL().includes(b),add(b){if(!BL().includes(b))st.mbs=BL().concat([b])},delete(b){st.mbs=BL().filter(x=>x!==b)},clear(){st.mbs=[]},[Symbol.iterator](){return BL().slice()[Symbol.iterator]()}};
function BL(){try{return Array.isArray(st.mbs)?st.mbs:[]}catch(_){return []}}
const saveB=()=>{try{store.set("mbs",JSON.stringify(st.mbs))}catch(_){}try{renderBandSeg()}catch(_){}try{if(st.page==="mapa")drawMap()}catch(_){}try{MSC=null}catch(_){}try{alBar()}catch(_){}};
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ago=a=>a==null?"":a<1?T("ahora","now"):a<90?T(`${a} min ago`,`${a} min ago`):a<1440?T(`${Math.round(a/60)} h ago`,`${Math.round(a/60)} h ago`):T("more than a day ago","over a day ago");
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
function legend(){return `<div class="mleg" aria-label="${T("Colores de los modos","Mode colors")}">${T("Mode","Mode")}: ${["CW","SSB","FT8","FT4","RTTY"].map(mb).join("")}<span class="mb mb-dg" title="${T("Otros modos digitales: PSK31, JS8, SSTV, JT65…","Other digital modes: PSK31, JS8, SSTV, JT65…")}">${T("Otros","Other")}</span></div>`}
const RX=/\b(POTA|SOTA|WWFF)[ :#-]*([A-Z0-9]{1,4}[\/-][A-Z0-9\/-]{2,10})\b/i;

/* ---------- programas: POTA, SOTA, WWFF ---------- */
function progAll(){
  if(Array.isArray(L.acts))return L.acts.map(o=>Object.assign({},o,{a:minsFrom(o.utc)}));
  /* copia sin datos propios de programas (Artifact o datos antiguos): se sacan de los spots del clúster */
  const out=[],seen=new Set();
  for(const s of (L.spots||[])){const m=String(s.c||"").match(RXA);if(!m)continue;const k=s.call+"|"+m[2].toUpperCase();if(seen.has(k))continue;seen.add(k);
    out.push({call:s.call,prog:m[1].toUpperCase(),ref:m[2].toUpperCase(),f:s.f,band:s.band,mode:s.mode,t:s.t,by:Array.isArray(s.by)?s.by[0]:s.by,dx:s.dx,a:(()=>{try{return spotAge(s)}catch(e){return null}})(),c:""})}
  return out}
function refUrl(p,r){if(!["POTA","SOTA","WWFF"].includes(p))return "";if(p==="POTA")return "https://pota.app/#/park/"+encodeURIComponent(r);
  if(p==="SOTA")return "https://www.sotadata.org.uk/en/summit/"+r.split("/").map(encodeURIComponent).join("/");
  return "https://wwff.co/directory/?showRef="+encodeURIComponent(r)}
const PNAME={POTA:["parque","park"],SOTA:["cumbre","summit"],WWFF:["reserva","reserve"],IOTA:["isla","island"],LLOTA:["lago","lake"]};
const CATN=k=>k==="dx"?"DX":k==="OTROS"?T("Otros","Other"):k;

/* ---------- barra de filtros ---------- */
function bar(counts,bcounts){
  const bs=bandsOK(),list=ORD.filter(b=>bs.has(b));[...BSEL].forEach(b=>{if(!bs.has(b))BSEL.delete(b)});
  const tb=[["dx","DX"]].concat(PROGS.map(p=>[p,CATN(p)]));
  return `<div class="seg clseg" role="group" aria-label="${T("Qué mostrar","What to show")}"><span class="segl">${T("View","Show")}</span><button type="button" data-clt="*" class="mmall" aria-pressed="${tb.every(([k])=>TYPES.has(k))}">${T("All","All")}</button>${tb.map(([k,l])=>`<button type="button" data-clt="${k}" aria-pressed="${TYPES.has(k)&&!tb.every(([z])=>TYPES.has(z))}">${l}${counts[k]?` <small>${counts[k]}</small>`:""}</button>`).join("")}</div>`+
    (list.length>1?`<div class="seg clseg clbands" role="group" aria-label="${T("Banda del clúster","Cluster band")}"><span class="segl">${T("Band","Band")}</span><button type="button" data-clb="" aria-pressed="${!BSEL.size}">${T("All","All")}</button>${list.map(b=>`<button type="button" data-clb="${b}" aria-pressed="${BSEL.has(b)}"${bcounts[b]?"":' class="clz"'}><i style="background:${BC[b]}"></i>${BANDS[b]}${bcounts[b]?` <small>${bcounts[b]}</small>`:""}</button>`).join("")}</div>`:"")}
function wire(box){
  /* cada botón se marca o se desmarca; siempre queda al menos un tipo */
  box.querySelectorAll("[data-clt]").forEach(b=>b.onclick=()=>{/* 2.7.1: como las bandas: “Todos” es la selección vacía; tocar un tipo con “Todos” activo deja solo ese; quitar el último vuelve a “Todos” */
  const k=b.dataset.clt,ALL=["dx"].concat(PROGS),all=ALL.every(x=>TYPES.has(x));if(k==="*")ALL.forEach(x=>TYPES.add(x));else if(all){TYPES.clear();TYPES.add(k)}else{if(TYPES.has(k))TYPES.delete(k);else TYPES.add(k);if(!TYPES.size)ALL.forEach(x=>TYPES.add(x))}S.set("acracb_cltypes",JSON.stringify([...TYPES]));render();catChanged()});
  /* “Todas” quita la selección; marcar todas las bandas equivale a “Todas” */
  box.querySelectorAll("[data-clb]").forEach(b=>b.onclick=()=>{const v=b.dataset.clb;if(v==="")BSEL.clear();else{const n=+v;if(BSEL.has(n))BSEL.delete(n);else BSEL.add(n);const all=ORD.filter(x=>bandsOK().has(x));if(all.every(x=>BSEL.has(x)))BSEL.clear()}
    saveB();render()})}

/* ---------- filas: tarjeta de estación por secciones ----------
   cabecera: indicativo · bandera · país ........ hora
   línea de frecuencia: frecuencia (MHz) · modo · banda · etiquetas
   secciones con su título a la izquierda: Le oyen · Split/QSL · Rumbo · Distancia · Nota */
function modeOf(s){if(s.mode)return s.mode;try{const k=spotMode(s);return k==="ssb"?"SSB":k==="otro"?"":k.toUpperCase()}catch(e){return ""}}
/* 2.4.3: distancias sobre el elipsoide WGS84 (Vincenty), no sobre una esfera: error de metros en lugar de hasta un 0,5%.
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
/* 2.7.0: todas las tarjetas dicen hace cuánto se oyó la estación (último spot de ese indicativo) */
function lastAge(call){const C=SK(call);let best=null;try{const d=(L.dx||[]).find(d=>dxTok(d.call).includes(C));if(d){const a=dxSpots(d);for(const o of a)if(o.a!=null&&(best==null||o.a<best))best=o.a}}catch(_){}
  try{for(const s of (L.spots||[])){if(SK(s.call)!==C)continue;const a=spotAge(s);if(a!=null&&isFinite(a)&&(best==null||a<best))best=a}}catch(_){}return best}
window.ACRACB_lastAge=lastAge;
/* 2.8.23: textos que llegan de los datos (información de DXpediciones, nota de estaciones cercanas, aurora).
   Las frecuencias se dejan con tres decimales en los dos idiomas y, en la versión inglesa, se traducen las frases fijas */
const CTRY={"Canarias":"Canary Is.","Grecia":"Greece","Japón":"Japan","Chequia":"Czechia","Sicilia":"Sicily","USA":"USA","Alemania":"Germany","Italia":"Italy","Francia":"France","Reino Unido":"UK","Inglaterra":"England","Spain":"Spain","Netherlands":"Netherlands","Bélgica":"Belgium","Suiza":"Switzerland","Polonia":"Poland","Suecia":"Sweden","Noruega":"Norway","Finlandia":"Finland","Rusia":"Russia","Brasil":"Brazil","Turquía":"Turkey","Dinamarca":"Denmark","Hungría":"Hungary","Rumanía":"Romania","Eslovaquia":"Slovakia","Eslovenia":"Slovenia","Croacia":"Croatia","Ucrania":"Ukraine","Irlanda":"Ireland","Escocia":"Scotland","Canada":"Canada","Australia":"Australia","Sudáfrica":"South Africa","Argentina":"Argentina","Chile":"Chile","México":"Mexico","Lituania":"Lithuania","Letonia":"Latvia","Estonia":"Estonia","Bulgaria":"Bulgaria","Serbia":"Serbia","Austria":"Austria","Portugal":"Portugal"};
window.ACRACB_tx=t=>{if(!t)return t;let x=String(t).replace(/\b(\d{1,3}\.\d{3})\d+\b/g,"$1");if(window.ACRACB_LANG!=="en")return x;
  x=x.replace(/\bA las (\d\d:\d\d) UTC en /g,"At $1 UTC on ").replace(/\bSpot a las (\d\d:\d\d) UTC en /g,"Spot at $1 UTC on ").replace(/ a las (\d\d:\d\d) UTC/g," at $1 UTC").replace(/\bTambién en /g,"Also on ")
   .replace(/\boíd[ao] en /g,"heard in ").replace(/\(CQ en /g,"(CQ at ").replace(/escucha arriba/g,"listening up").replace(/\bsobre todo\b/g,"mostly").replace(/\by algo de\b/g,"and some")
   .replace(/ hasta el /g," until ").replace(/\bvía\b/g,"via").replace(/\bdesde\b/g,"from").replace(/\bpor\b/g,"by").replace(/Pocas estaciones ibéricas destacadas( en esta ronda)?/g,"Few notable Iberian stations")
   .replace(/ % en el norte de Europa/g," % in northern Europe").replace(/Sin aurora sobre Europa/g,"No aurora over Europe").replace(/ \(([^)]+)\) en (\d+ ?c?m) /g," ($1) on $2 ").replace(/ en (\d+ ?c?m)\b/g," on $1").replace(/ y /g," and ");
  for(const [k,v] of Object.entries(CTRY))x=x.split(k).join(v);return x};
/* 2.8.23: las notas que añade el recolector a cada spot vienen en español; en la versión inglesa se traducen al pintarlas */
const cTr=c=>{if(!c)return c;c=window.ACRACB_tx(c);if(window.ACRACB_LANG!=="en")return c;return String(c).replace(/oído por skimmer \(RBN\)/g,"heard by a skimmer (RBN)").replace(/decodificado \(PSK Reporter\)/g,"decoded (PSK Reporter)").replace(/, oída en /g,", heard in ").replace(/ en (\d+ ?c?m) /g," on $1 ").replace(/ con (\d\/\d)/g," with $1")};
const ACTIVE=60;const isAct=a=>a!=null&&isFinite(a)&&a<=ACTIVE;window.ACRACB_isAct=c=>isAct(lastAge(c));
const ageTag=(a,t)=>a!=null||t?`<span class="sc-age" title="${t?e2(t)+" UTC":""}">${ago(a)}</span>`:`<span class="sc-age">${T("sin spots recientes","no recent spots")}</span>`;
/* 2.11.25: los mismos datos, en el mismo orden, en la tarjeta y en la fila desplegada de la vista de lista: quién lo
   publica, split, nota, rumbo y distancia por los dos caminos (como siempre), probabilidad y señal prevista */
function detOf(o){const g=o.geo;let rumbo="",dist="",pr="";
  if(g){rumbo=`<span class="nw">${T("short","short")} ${g.az}° ${cab(g.az)}<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${g.laz}° ${cab(g.laz)}</span>`;
    dist=`<span class="nw">${T("short","short")} ${fk(g.km)} km<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${fk(g.lkm!=null?g.lkm:Math.max(0,40030-g.km))} km</span>`}
  if(o.p!=null){pr=`<b>${o.p}%</b>${o.lpb?T(" via the long path"," via the long path"):""}`;
    if(o.p0!=null&&o.p-o.p0>=10)pr+=`<span class="note sgn">${T(`Modelo: ${o.p0}%. Lo sube lo que oyen ahora caminos parecidos al tuyo.`,`Model: ${o.p0}%. Raised by what similar paths hear now.`)}</span>`;
    else if(o.p0!=null&&o.p0-o.p>=10)pr+=`<span class="note sgn">${T(`Modelo: ${o.p0}%. Lo baja lo que se oye ahora o lo que has anotado.`,`Model: ${o.p0}%. Lowered by what is heard now or what you noted.`)}</span>`}
  return [[o.byLbl||T("Le oyen","Heard by"),o.by],["Split / QSL",o.xs],[T("Bearing","Bearing"),rumbo],[T("Distancia","Distance"),dist],[T("Reliability","Reliability"),pr],[T("Señal","Signal"),o.sig||""],[T("Nota","Note"),o.note||""]].concat(o.secs||[]).filter(([,v])=>v)}
function card(o){
  if(o.call&&o.a==null&&!o.t)o=Object.assign({},o,{a:lastAge(o.call)});
  if(o.call&&document.documentElement.classList.contains("vl"))return listRow(o);
  const h=`<div class="sc-h"><span class="sc-call">${o.call?stBtn(o.call,o.band):""}</span>${o.call||o.a!=null||o.t?ageTag(o.a,o.t):""}</div>`;
  const fl=[o.f?`<b class="sc-fq" style="color:${BC[o.band]||"inherit"}">${e2(o.f)}</b>`:"",o.mode?mb(o.mode):"",o.band!=null&&BANDS[o.band]?`<span class="sc-b"${o.f?"":` style="color:${BC[o.band]};font-weight:600"`}>${BANDS[o.band]}</span>`:""].concat(o.tags||[]).concat(o.geo?[`<span class="sc-cp">${o.geo.az}° ${cab(o.geo.az)}</span>`]:[]).concat(o.p!=null?[`<span class="sc-cp"><b>${o.p}%</b></span>`]:[]).filter(Boolean);
  const f=fl.length?`<div class="sc-f">${fl.join("")}</div>`:"";
  const D=detOf(o);
  const ohd=o.oh&&o.oh.b!=null&&o.oh.b<10?` data-ohc="1" data-t="${e2(o.oh.t)}" data-b="${o.oh.b}" data-call="${e2(o.oh.call)}" data-mode="${e2(o.oh.mode||"")}" data-f="${e2(o.f||"")}"`:"";
  const acc=o.call?`${ohd?"":` data-mode="${e2(o.mode||"")}" data-f="${e2(o.f||"")}"`}`:"";
  return `<div class="sc${o.old||(o.call&&(o.a!=null?!isAct(o.a):!o.t))?" old":""}${o.call?" ohc":""}"${ohd}${acc}>${h}${f}<dl class="sc-d">${D.map(([l,v])=>sec(l,v)).join("")}</dl>${window.ACRACB_ohBox&&o.call&&(o.a!=null?isAct(o.a):!!o.t)?ACRACB_ohBox(o.oh||{call:SK(o.call),b:o.band!=null&&o.band<10?o.band:null,mode:o.mode||""}):""}</div>`}
window.ACRACB_card=o=>card(o);
/* 2.10.31: vista de lista: una fila por estación con las columnas alineadas (como un clúster web, pero con más datos),
   en todos los listados que usan la tarjeta de estación. Al tocar la fila se despliegan los detalles. Vale con la vista
   completa y con la compacta. */
function listRow(o){const strip0=h=>String(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();const g=o.geo,old=o.old||(o.a!=null?!isAct(o.a):!o.t);
  /* 2.10.35: fila alineada como un clúster web (URE): una columna por dato, números a la derecha, lo que no cabe se corta
     con “…” y se ve entero al desplegar la fila (y al pasar el ratón por encima) */
  const ohd=o.oh&&o.oh.b!=null&&o.oh.b<10?` data-ohc="1" data-t="${e2(o.oh.t)}" data-b="${o.oh.b}" data-call="${e2(o.oh.call)}" data-mode="${e2(o.oh.mode||"")}" data-f="${e2(o.f||"")}"`:` data-mode="${e2(o.mode||"")}" data-f="${e2(o.f||"")}"`;
  let rumbo="",dist="";if(g){rumbo=`<span class="nw">${T("short","short")} ${g.az}° ${cab(g.az)}<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${g.laz}° ${cab(g.laz)}</span>`;dist=`<span class="nw">${T("short","short")} ${fk(g.km)} km<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${fk(g.lkm!=null?g.lkm:Math.max(0,40030-g.km))} km</span>`}
  const oh=window.ACRACB_ohBox&&(o.a!=null?isAct(o.a):!!o.t)?ACRACB_ohBox(o.oh||{call:SK(o.call),b:o.band!=null&&o.band<10?o.band:null,mode:o.mode||""}):"";
  let en=null;try{en=callEnt(o.call)}catch(_){}
  const cty=en?(en.mm?T("maritime mobile","maritime mobile"):en.name):"",fu=en&&!en.mm&&en.cc?flagURL(en.cc):"";
  const sa=String(ago(o.a)||"").replace(/^hace\s+/,"").replace(/\s+ago$/,"").replace(/^más de un día$/,T("+1 día","1 d+")).replace(/^over a day$/,"1 d+");
  const byc=[...String(o.by||"").matchAll(/data-call="([^"]+)"/g)].map(m=>m[1]);const byTx=byc.length?byc[0]+(byc.length>1?` +${byc.length-1}`:""):String(o.by||"").replace(/<[^>]+>/g,"");
  const strip=h=>String(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  /* 2.11.11: sin la etiqueta que repite el país (p. ej. “Móvil marítimo” junto a “móvil marítimo”) */
  const ctyL=String(cty||"").toLowerCase();o=Object.assign({},o,{tags:(o.tags||[]).filter(t=>!ctyL||strip0(t).toLowerCase()!==ctyL)});
  const com=(o.tags||[]).join("")+(o.xs?`<span class="l-ct">${o.xs}</span>`:"")+(o.note?`<span class="l-ct">${e2(o.note)}</span>`:"");
  const comT=[strip((o.tags||[]).join(" · ")),strip(o.xs),o.note||""].filter(Boolean).join(" · ");
  return `<div class="sc scl ohc${old?" old":""}"${ohd}>`+
    `<span class="l-age" title="${o.t?e2(o.t)+" UTC":""}">${e2(sa)}</span>`+
    `<span class="l-f">${o.f?`<b style="color:${BC[o.band]||"inherit"}">${e2(o.f)}</b>`:""}</span>`+
    `<span class="l-m">${o.mode?mb(o.mode):""}</span>`+
    `<span class="l-b" style="color:${BC[o.band]||"inherit"}">${o.band!=null&&BANDS[o.band]?BANDS[o.band].replace(" ",""):""}</span>`+
    `<span class="l-call"><span class="stc sc-call" data-stc="${e2(SK(o.call))}" data-stb="${o.band!=null&&o.band<10?o.band:""}"><span class="cs" data-call="${e2(o.call)}">${e2(o.call)}</span></span></span>`+
    `<span class="l-cty" title="${e2(cty)}">${fu?`<img class="fl" src="${fu}" alt="" width="18" height="12">`:""}${e2(cty)}</span>`+
    `<span class="l-tags" title="${e2(comT)}">${com}</span>`+
    `<span class="l-by" title="${e2(byc.join(", "))}">${e2(byTx)}</span>`+
    `<span class="l-az">${g?`${g.az}° ${cab(g.az)}`:""}</span>`+
    `<span class="l-km">${g?fk(g.km):""}</span>`+
    `<span class="l-p">${o.p!=null?`<b>${o.p}</b>%`:""}</span>`+
    `<span class="l-oh">${oh}</span>`+
    `<span class="l-x" aria-hidden="true"></span>`+
    /* 2.10.39: lo desplegado, en fichas que llenan el ancho (antes una columna estrecha); el comentario solo si hay texto
       libre, porque las etiquetas ya se ven en la fila */
    `<div class="sc-d ld">${detOf(o).map(([l,v])=>`<div class="ldi"><span class="ldl">${l}</span><div class="ldv">${v}</div></div>`).join("")}</div>`+
    (oh?`<div class="l-ohx">${oh}</div>`:"")+`</div>`}
/* 2.11.2: quién publicó el spot (los indicativos que lo anunciaron) y en qué red: clúster DX (Spothole o HamQTH) o Reverse Beacon */
function pubBy(s){const b=CSL(s.by,", ");const V={RBN:"Reverse Beacon",Spothole:"Spothole",HamQTH:"HamQTH",POTA:"POTA",SOTA:"SOTA"};
  const v=[...new Set((s.src||[]).map(x=>V[x]||x))];return b+(v.length?` <span class="sc-via">${T("via","via")} ${e2(v.join(", "))}</span>`:"")}
window.ACRACB_listHead=()=>`<div class="sclh" aria-hidden="true"><span class="l-age">${T("Hace","Ago")}</span><span class="l-f">${T("Frec.","Freq.")}</span><span class="l-m">${T("Mode","Mode")}</span><span class="l-b">${T("Band","Band")}</span><span class="l-call">DX</span><span class="l-cty">${T("País","Country")}</span><span class="l-tags">${T("Comentario","Comment")}</span><span class="l-by">${T("Spotter","Spotter")}</span><span class="l-az">${T("Bearing","Bearing")}</span><span class="l-km">km</span><span class="l-p">QSO</span><span class="l-oh"></span><span class="l-x"></span></div>`;
/* 2.4.4: “Qué hacer”: cada estación recomendada en una tarjeta como las del resto de la plataforma:
   frecuencia, modo, banda, rumbo y distancia por el camino corto y el largo, y la probabilidad de QSO */
const inBand=(f,b)=>{const m=MHZ[b];return m&&isFinite(f)&&Math.abs(f-m)/m<.12};
function recCards(go,dxn){const out=[];
  /* 2.11.29: la misma estación anunciada varias veces en la misma banda sale una sola vez, con el spot más reciente */
  {const m=new Map();for(const x of (go||[])){const k=SK(x.s.call)+"|"+x.s.band,y=m.get(k);if(!y||(x.a!=null&&(y.a==null||x.a<y.a)))m.set(k,x)}go=(go||[]).filter(x=>m.get(SK(x.s.call)+"|"+x.s.band)===x).slice(0,3)}
  (go||[]).forEach(({s,e,a})=>{const st=splitTags(s);const sp=spotProb(s,e,a);const tg=[`<span class="xtag xr">${T("Cluster","Cluster")}</span>`].concat(st.pr);
    out.push(card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tg,byLbl:T("Spotted by","Spotted by"),by:pubBy(s),xs:st.xs,geo:geoOf(s.dx),p:Math.round(sp.p*100),p0:Math.round(sp.p0*100),lpb:sp.lp,oh:e.t?{t:e.t.id,b:s.band,call:s.call,mode:modeOf(s)}:null,sig:(()=>{try{return sigRow(s,e,sp)}catch(_){return ""}})(),
      note:/up|above|split/i.test(s.c||"")?T("Escucha arriba: trabaja en split.","Listen up: working split."):""}))});
  /* 2.5.6: solo las DXpediciones que trabajan en alguno de tus modos (el de tu estación y los añadidos en el clúster) */
  let my=new Set();try{CMS().forEach(k=>my.add(String(MODES[k].s).toUpperCase()))}catch(_){}
  const inMy=d=>{const m=Array.isArray(d.modes)?d.modes.map(z=>String(z).toUpperCase()):[];return !m.length||!my.size||m.some(z=>my.has(z)||(z==="JS8"&&my.has("JS8CALL")))};
  (dxn||[]).filter(x=>inMy(x.d)&&isAct(lastAge(String(x.d.call||"").split(/[ ,]/)[0]))).forEach(x=>{const d=x.d;let call=String(d.call||"").split(/[ ,]/)[0];let f="",mode="";
    /* 2.11.45: si el aviso solo trae el prefijo (por ejemplo “3B8”), se usa el indicativo completo del spot más reciente
       que empieza por él, con su frecuencia y su modo; sin eso la tarjeta no decía dónde escuchar */
    let spx=null;if(!/\d[A-Z]{1,4}(\/[A-Z0-9]+)?$/i.test(call)){const c0=call.toUpperCase();const cand=(L.spots||[]).filter(z=>z.call&&String(z.call).toUpperCase().startsWith(c0)).sort((a,b)=>String(b.utc||b.t).localeCompare(String(a.utc||a.t)));spx=cand.find(z=>z.band===x.b)||cand[0]||null;if(spx){call=spx.call;if(spx.band!==x.b)x={...x,b:spx.band}}
      /* 2.11.67: sin indicativo completo (ni en el aviso ni en ningún spot) no se recomienda: no se sabe a quién llamar ni en qué modo */
      else return}
    const q=[].concat(d.qsx||[]).map(z=>String(z).match(/(\d+(?:\.\d+)?)\s*([A-Z0-9]+)?/i)).filter(Boolean).map(m=>({f:+m[1]>1000?+m[1]/1000:+m[1],m:(m[2]||"").toUpperCase()})).filter(z=>inBand(z.f,x.b));
    let my="";try{my=String(MOD()||"").toUpperCase()}catch(e){}const pick=q.find(z=>z.m&&my&&z.m===my)||q[0];
    /* 2.10.19: con “Mi modo” solo se recomienda una frecuencia de tus modos (antes podía salir FT8 con “Mi modo · SSB”) */
    const MS0=new Set();try{CMS().forEach(k=>MS0.add(String(MODES[k].s).toUpperCase()))}catch(_){}const okM=m=>{if(!m)return true;const u=String(m).toUpperCase();return !MS0.size||MS0.has(u)||((u==="USB"||u==="LSB")&&MS0.has("SSB"))||(u==="JS8"&&MS0.has("JS8CALL"))};
    const pick2=q.filter(z=>okM(z.m));const pk=pick2.find(z=>z.m&&my&&z.m===my)||pick2[0];
    if(pk){f=pk.f.toFixed(3);mode=pk.m}
    else{const sp=spx&&okM(spx.mode||"")?spx:((L.spots||[]).filter(z=>z.call&&z.call.toUpperCase()===call.toUpperCase()&&z.band===x.b&&okM(z.mode||""))[0]||(()=>{try{return dxSpots(d).find(o=>o.band===x.b&&okM(o.mode||""))||null}catch(_){return null}})());if(sp){f=sp.f;mode=sp.mode||""}else if(q.length)return}
    const MYS=new Set();try{CMS().forEach(k=>MYS.add(String(MODES[k].s).toUpperCase()))}catch(_){}
    let hab=false;if(!mode&&Array.isArray(d.modes)&&d.modes.length){const mm=d.modes.map(z=>String(z).toUpperCase());mode=mm.includes(my)?my:(mm.find(z=>MYS.has(z))||(mm.includes("SSB")&&!/CW|FT/.test(my)?"SSB":mm[0]))}
    /* sin QSX ni spot en esa banda: la frecuencia habitual de las DXpediciones en ese modo */
    if(!f&&mode){const H={SSB:[1.845,3.790,7.090,14.195,18.145,21.295,24.945,28.495,null,null,50.110],CW:[1.826,3.523,7.023,14.023,18.073,21.023,24.893,28.023,5.354,10.106,50.090],
      FT8:[1.840,3.573,7.074,14.074,18.100,21.074,24.915,28.074,5.357,10.136,50.313],FT4:[1.840,3.575,7.047,14.080,18.104,21.140,24.919,28.180,null,10.140,50.318],
      RTTY:[1.838,3.580,7.040,14.083,18.105,21.083,24.925,28.083,null,10.140,50.300]};const v=(H[mode]||[])[x.b];if(v){f=v.toFixed(3);hab=true}}
    /* 2.11.45: sin modo conocido ni spots en esa banda, la frecuencia habitual en tu modo; si hay spots, pero en otro modo,
       o no hay forma de saber la frecuencia, la tarjeta no sale (no diría dónde escuchar) */
    let mguess=false;if(!f&&!mode&&my&&!(L.spots||[]).some(z=>z.call&&z.call.toUpperCase()===call.toUpperCase()&&z.band===x.b)){mguess=true;const H2={SSB:[1.845,3.790,7.090,14.195,18.145,21.295,24.945,28.495,null,null,50.110],CW:[1.826,3.523,7.023,14.023,18.073,21.023,24.893,28.023,5.354,10.106,50.090],FT8:[1.840,3.573,7.074,14.074,18.100,21.074,24.915,28.074,5.357,10.136,50.313]};const v=(H2[my]||[])[x.b];if(v){f=v.toFixed(3);mode=my;hab=true}}
    if(!f)return;
    /* 2.11.66: si no se han anunciado sus modos, se dice: la frecuencia es la habitual de TU modo, no la suya */
    const tg=[`<span class="xtag xs dxpt">${T("DXpedition","DXpedition")}</span>`].concat(mguess?[`<span class="tag">${T("modo sin anunciar","mode not announced")}</span>`]:[]);
    let pp=x.p,plp=!!x.lp;try{const mk=Object.keys(MODES).find(z=>String(MODES[z].s).toUpperCase()===String(mode).toUpperCase());const ex=mk?MODES[mk].adj-MD().adj:0;
      const t=tFor(d),lh=localNow();if(ex&&t){const a1=prob(t,lh,x.b,false,ex).p,a2=t.l?prob(t,lh,x.b,true,ex).p:0;plp=a2>a1&&a2>=.05;pp=plp?a2:a1}}catch(_){}
    /* 2.11.96: también la fila “Señal” en las DXpediciones de “Qué hacer ahora”, como en el resto de tarjetas */
    let sgD="";try{if(isFinite(d.lon)&&isFinite(d.lat)){const ss={call,band:x.b,mode,f:String(f),dx:[d.lon,d.lat],kind:"dx",from:[]};const e=spotEval(ss,localNow());sgD=sigRow(ss,e,{lp:plp,p:pp})}else sgD=sigWhy({band:x.b},null,{})}catch(_){}
    out.push(card({call,f,band:x.b,mode,tags:tg,geo:isFinite(d.lon)&&isFinite(d.lat)?geoOf([d.lon,d.lat]):null,p:Math.round(pp*100),lpb:plp,sig:sgD,oh:(()=>{try{const t=tFor(d);return t?{t:t.id,b:x.b,call,mode}:null}catch(_){return null}})(),
      note:[mguess?T(`No se ha anunciado en qué modos trabaja: puede que no esté en ${mode}. Es la frecuencia habitual de ${mode}; confírmala en el clúster.`,`Its modes have not been announced: it may not be on ${mode}. This is the usual ${mode} frequency; check the cluster.`):hab?T("Frecuencia habitual de las DXpediciones en este modo: confírmala en el clúster.","Usual DXpedition frequency for this mode: check the cluster."):"",d.until?T("Active until "+e2(d.until)+".","Active until "+e2(String(d.until).replace(/\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b/g,m=>({ene:"Jan",feb:"Feb",mar:"Tue",abr:"Apr",may:"May",jun:"Jun",jul:"Jul",ago:"Aug",sep:"Sep",oct:"Oct",nov:"Nov",dic:"Dec"})[m]))+"."):""].filter(Boolean).join(" ")}))});
  return out.length?`<div class="alc reccards">${out.join("")}</div>`:""}
window.ACRACB_recCards=recCards;
/* 2.6.4: “¿Lo oyes?” en las tarjetas de estaciones activas. Tu escucha de esa estación concreta (banda, hora, modo y, si quieres,
   la lectura del S-metro) entra en la calibración de tu estación y, durante 45 minutos, es la prueba más fuerte para esa zona:
   si la oyes, el camino está abierto; si no la oyes, su probabilidad baja. */

const ohKey=o=>o.call+"|"+o.b;
function lastOwn(call,b,dir){dir=dir||"rx";try{for(let i=OBS.length-1;i>=0;i--){const o=OBS[i];if(o.call===call&&(b==null||o.b===b)&&(o.dir||"rx")===dir)return o}}catch(_){}return null}
window.ACRACB_ohBox=oh=>{if(oh.b!=null&&oh.b>=10)return "";if(oh.b===""||oh.b===undefined)oh=Object.assign({},oh,{b:null});const last=lastOwn(oh.call,oh.b),tx=lastOwn(oh.call,oh.b,"tx");
  const bb=o=>oh.b==null&&o&&BANDS[o.b]?" · "+BANDS[o.b]:"";
  const st=last?(last.h?`<span class="ohs y">${T("Lo oyes","You hear it")}${bb(last)}${last.r!=null?" · R"+last.r:""}${last.s!=null?" · "+sTxt(last.s):""}${last.db!=null?" · "+(last.db>0?"+":"")+last.db+" dB":""}</span>`:`<span class="ohs n">${T("No lo oyes","You don't hear it")}${bb(last)}</span>`):"";
  return `<div class="ohbox"><div class="ohr"><button type="button" class="ohq" data-ohq data-t="${e2(oh.t||"")}" data-b="${oh.b==null?"":oh.b}" data-call="${e2(oh.call)}" data-mode="${e2(oh.mode||"")}">${T("Do you hear it?","Do you hear it?")}</button>${st}${tx?(tx.h?`<span class="ohs y">${T("They hear you","They hear you")}${bb(tx)}${tx.r!=null?" · R"+tx.r:""}${tx.s!=null?" · "+sTxt(tx.s):""}${tx.db!=null?" · "+(tx.db>0?"+":"")+tx.db+" dB":""}</span>`:`<span class="ohs n">${T("No te oyen","They don't hear you")}${bb(tx)}</span>`):""}<button type="button" class="ohsp" data-spot="${e2(oh.call)}" title="${T("Anunciar este spot en los clústeres","Post this spot to the clusters")}">${window.ACRACB_spotIcon||""}<span>${T("Anunciar","Spot it")}</span></button></div></div>`};
/* diálogo “¿Lo oyes?”: se abre solo al tocar el texto “¿Lo oyes?” de la tarjeta (2.8.16) */
const VOICE=m=>/^(SSB|USB|LSB|AM|FM|PHONE)?$/i.test(String(m||"").trim());
const RTXT={1:["ilegible","unreadable"],2:["apenas","barely"],3:["con esfuerzo","with effort"],4:["casi sin problema","almost perfect"],5:["perfecto","perfect"]};
let DLG=null;
/* parte de reporte según el modo: R y S en fonía y CW; dB del programa en digitales */
function repHTML(o,voice,cw){const dig=!voice&&!cw;let x="";
  if(voice||cw)x+=`<div class="ohd-r" role="group" aria-label="${T("Legibilidad (R)","Readability (R)")}"><span class="smt">${T("¿Cómo se entiende? (R)","How readable? (R)")}</span><div class="rrow">${[1,2,3,4,5].map(r=>`<button type="button" data-rr="${r}" data-o="${e2(o.at)}" aria-pressed="${o.r===r}"><b>R${r}</b><small>${T(RTXT[r][0],RTXT[r][1])}</small></button>`).join("")}</div></div>`;
  x+=dig?`<div class="ohd-db" role="group" aria-label="${T("Señal en dB del programa","Signal in dB from the software")}"><span class="smt">${T("¿Qué señal da el programa?","What does the software report?")} (<span class="nu">dB</span>)</span><div class="dbrow">${DBV.map((v,i)=>`<button type="button" data-db="${v}" data-o="${e2(o.at)}" aria-pressed="${o.db===v}" style="--i:${i}">${v>0?"+"+v:v}</button>`).join("")}</div></div>`:ACRACB_smeter(o);
  return x}
const isDxp=call=>{try{const c=String(call||"").toUpperCase();return (L.dx||[]).some(d=>String(d.call||"").toUpperCase().split(/[\s,/]+/).includes(c)||String(d.call||"").toUpperCase().includes(c))}catch(_){return false}};
function dlgHTML(d,inl){const last=lastOwn(d.call,d.b),tx=lastOwn(d.call,d.b,"tx");const voice=VOICE(d.mode),cw=/^CW$/i.test(String(d.mode||"").trim());
  const ico={y:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',n:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>'};
  const h=last&&last.h,n=last&&!last.h,th=tx&&tx.h,tn=tx&&!tx.h,dxp=isDxp(d.call);
  let x=(inl?"":`<div class="ohd-h"><div><div class="ohd-t">${T("¿Oyes a","Do you hear")} <b>${e2(d.call)}</b>?</div><div class="ohd-s">${[d.f,d.mode,BANDS[d.b]].filter(Boolean).map(e2).join(" · ")}</div></div><button type="button" class="ohd-x" data-ohx aria-label="${T("Close","Close")}">×</button></div>`)+`   <div class="ohd-b"><button type="button" class="ohbig y" data-oh="1" aria-pressed="${!!h}">${ico.y}<span>${T("I hear it","I hear it")}</span></button><button type="button" class="ohbig n" data-oh="0" aria-pressed="${!!n}">${ico.n}<span>${T("I don't hear it","I don't hear it")}</span></button></div>`;
  if(h)x+=repHTML(last,voice,cw);
  /* 2.6.7: “¿Te ha oído?”, el otro sentido del camino (tu transmisión) */
  x+=`<div class="ohd-sec"><div class="ohd-st">${T("¿Te ha oído?","Did it hear you?")}</div>
   <div class="ohd-b"><button type="button" class="ohbig y sm" data-tx="1" aria-pressed="${!!th}">${ico.y}<span>${T("Me oyen","They hear me")}</span></button><button type="button" class="ohbig n sm" data-tx="0" aria-pressed="${!!tn}">${ico.n}<span>${T("No me oyen","They don't hear me")}</span></button></div>`;
  if(th)x+=dxp?`<p class="note ohd-n">${T("Las DXpediciones casi siempre dan 59 o 599: cuenta que te han oído, sin reporte.","DXpeditions almost always give 59 or 599: what counts is that they heard you, without a report.")}</p>`:`<p class="note ohd-n2">${T("Reporte que te han dado:","Report you were given:")}</p>`+repHTML(tx,voice,cw);
  x+=`</div>`;
  x+=`<p class="note ohd-n">${T("“Lo oigo” ajusta tu recepción y “Me oyen” tu transmisión. Durante 45 minutos, las dos cambian el porcentaje de esa zona.","“I hear it” tunes your reception and “They hear me” your transmission. For 45 minutes, both change the chance for that area.")}</p>`;
  {const lo=[last,tx].filter(Boolean).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at))[0];if(lo){const m=Math.max(0,Math.round((Date.now()-Date.parse(lo.at))/6e4)),se=lo.se||{};
    const pt=[se.loc,se.w?se.w+" W":"",se.a].filter(Boolean).map(e2).join(" · ");
    x+=`<p class="note ohd-se">${T("Anotado","Logged")} ${ago(m)}${pt?` ${T("con","with")} <span class="nw">${pt}</span>`:""}. ${T("Se guarda hasta que anotes algo nuevo.","It is kept until you log something new.")}</p>`}}
  if(!inl&&(last||tx))x+=`<div class="ohd-f"><button type="button" class="btn ohd-ok" data-ohx>${T("Listo","Done")}</button></div>`;
  return x}
function openDlg(d){DLG=d;let w=document.getElementById("ohdlg");if(!w){w=document.createElement("div");w.id="ohdlg";w.className="ohdlg";w.innerHTML='<div class="ohd-bg" data-ohx></div><div class="ohd-c" role="dialog" aria-modal="true"></div>';document.body.appendChild(w)}
  w.querySelector(".ohd-c").innerHTML=dlgHTML(d);w.hidden=false;document.documentElement.classList.add("ohopen");setTimeout(()=>{const b=w.querySelector("[data-oh]");b&&b.focus()},30)}
function closeDlg(){const w=document.getElementById("ohdlg");if(w)w.hidden=true;document.documentElement.classList.remove("ohopen");DLG=null}
function redraw(){if(DLG){const w=document.getElementById("ohdlg");if(w&&!w.hidden)w.querySelector(".ohd-c").innerHTML=dlgHTML(DLG)}}
window.ACRACB_dlgRedraw=redraw;
function seNow(){const o={};try{o.loc=String($("loc").value||"").slice(0,6).toUpperCase()}catch(_){}try{const w=+$("eq").value;if(w)o.w=w}catch(_){}try{const a=$("antsel"),op=a&&a.selectedOptions&&a.selectedOptions[0];if(op)o.a=op.textContent.trim()}catch(_){}return o}
function addOwn(tid,b,call,mode,heard,dir){dir=dir||"rx";const RX=dir==="rx";const t=T0(tid);if(!t)return;const lh=localNow();let ex=0;try{const k=spotMode({mode});ex=((MODES[k]&&MODES[k].adj)||0)-MD().adj}catch(_){}
  const lp=RX?t.l&&prob(t,lh,b,true,"rx").p>prob(t,lh,b,false,"rx").p:t.l&&prob(t,lh,b,true).p>prob(t,lh,b,false).p;const M=marg(t,lh,b,lp,RX);if(!M)return;
  const prev=b==null?null:lastOwn(call,b,dir);if(prev&&Date.now()-Date.parse(prev.at)<15*6e4){const i=OBS.indexOf(prev);if(i>=0)OBS.splice(i,1)}
  OBS.push({k:calKey(),t:tid,b,lh,h:heard?1:0,m:Math.round(M.m*10)/10,dl:M.DL,du:M.DU,thr:M.thr-ex,at:new Date().toISOString(),call,src:"tarjeta",dir,se:seNow(),...(!RX&&!heard?{w:.35}:{}),...(!RX&&isDxp(call)?{dxp:1}:{})});if(OBS.length>600)OBS=OBS.slice(-600);
  dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();rebox();redraw();try{renderPop()}catch(_){}}
/* vuelve a pintar los recuadros “¿Lo oyes?” que sigan en pantalla (aviso de portada incluido) */
function rebox(){try{renderAlBar()}catch(_){}document.querySelectorAll(".ohbox").forEach(bx=>{const q=bx.querySelector("[data-ohq]");if(!q)return;bx.outerHTML=ACRACB_ohBox({t:q.dataset.t,b:q.dataset.b===""?null:+q.dataset.b,call:q.dataset.call,mode:q.dataset.mode})})}
window.ACRACB_rebox=rebox;
const T0=id=>{try{return TG().find(t=>t.id===id)}catch(_){return null}};
const ctxD=el=>{const c=el.closest(".ohin");return c?dOf(c):DLG};
/* 2.7.6: en las ventanas del mapa, el mismo “¿Lo oyes? / ¿Te ha oído?” que en las tarjetas, con sus dos escalas */
function ohInline(d){return `<div class="ohin" data-t="${e2(d.t)}" data-b="${d.b}" data-call="${e2(d.call)}" data-mode="${e2(d.mode||"")}" data-f="${e2(d.f||"")}"><div class="ohin-t">${T("Do you hear it?","Do you hear it?")} <span class="ohin-s">${[d.f,d.mode,BANDS[d.b]].filter(Boolean).map(e2).join(" · ")}</span></div>${dlgHTML(d,true)}</div>`}
window.ACRACB_ohInline=ohInline;
(function(){let n=0;const h=setInterval(()=>{if(typeof calBtns==="function"&&!window.__hkOh){window.__hkOh=1;const o=calBtns;const w=function(t){try{if(!t)return o.apply(this,arguments);const P=st.pop;let call=null,b=null,mode="",f="";
    if(P&&P.k==="s"){const s=(typeof MSPOTS==="function"?MSPOTS():SPOTS())[P.i];const e=s&&spotEval(s,st.mhour);const tf=s?tFor(s):null;if(s&&((e&&e.t&&e.t.id===t.id)||(tf&&tf.id===t.id))){call=s.call;b=s.band;mode=modeOf(s);f=s.f}}
    else if(P&&P.k==="d"){const d=L.dx[P.i];if(d&&tFor(d)&&tFor(d).id===t.id)call=dxTok(d.call)[0]||d.call}
    if(b==null)b=st.mband>=0?st.mband:bestAny(t,st.mhour).b;if(b==null||b<0||b>=10)return o.apply(this,arguments);
    if(!call)call=t.name;if(!mode){try{mode=MD().s}catch(_){}}
    return ohInline({t:t.id,b,call,mode,f})+`<div class="acts"><button class="btn" data-goz="${e2(t.id)}">${T("Full profile","Full details")}</button></div>`}catch(e){return o.apply(this,arguments)}};
  w.__oh=1;try{calBtns=w}catch(e){window.calBtns=w}clearInterval(h)}else if(++n>100)clearInterval(h)},100)})();
const dOf=el=>({t:el.dataset.t,b:+el.dataset.b,call:el.dataset.call,mode:el.dataset.mode,f:el.dataset.f||((el.closest(".sc")||{}).dataset||{}).f||""});
const ohClick=ev=>{const tg=ev.target;if(!tg.closest)return;
  if(tg.closest("[data-ohx]")){closeDlg();return}
  const h=tg.closest("#ohdlg [data-oh],.ohin [data-oh]");if(h){const D=ctxD(h);if(D)try{addOwn(D.t,D.b,D.call,D.mode,h.dataset.oh==="1")}catch(e){console.error(e)}return}
  const tx=tg.closest("#ohdlg [data-tx],.ohin [data-tx]");if(tx){const D=ctxD(tx);if(D)try{addOwn(D.t,D.b,D.call,D.mode,tx.dataset.tx==="1","tx")}catch(e){console.error(e)}return}
  const dbb=tg.closest("[data-db]");if(dbb){try{const o=OBS.slice().reverse().find(x=>x.at===dbb.dataset.o);if(o){const v=+dbb.dataset.db;if(o.db===v)delete o.db;else o.db=v;const s=obsSnr(o);if(s!=null)o.snr=Math.round(s*10)/10;else delete o.snr;dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();rebox();redraw();try{renderPop()}catch(_){}}}catch(e){console.error(e)}return}
  const rr=tg.closest("[data-rr]");if(rr){try{const o=OBS.slice().reverse().find(x=>x.at===rr.dataset.o);if(o){const v=+rr.dataset.rr;if(o.r===v)delete o.r;else o.r=v;const s=obsSnr(o);if(s!=null)o.snr=Math.round(s*10)/10;else delete o.snr;dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();rebox();redraw();try{renderPop()}catch(_){}}}catch(e){console.error(e)}return}
  const q=tg.closest("[data-ohq]");if(q){let d=null;if(q.dataset.t&&q.dataset.b!==""){d=dOf(q)}else{const c=q.closest(".sc");if(c)d=dCard(c)}if(d)openDlg(d);return}};
/* 2.7.6: la ventana del mapa no deja pasar los clics: lo de dentro de “.ohin” se atiende antes, en captura */
document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest(".ohin"))return;ohClick(ev)});
document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest(".ohin")&&!ev.target.closest("[data-smt]")){ohClick(ev);ev.stopPropagation()}},true);
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&DLG){closeDlg();return}});
/* tus escuchas recientes de una zona y banda: la prueba más fuerte (45 minutos) */
window.ACRACB_own=(tid,dx,b,dir)=>{dir=dir||"rx";try{const lim=Date.now()-45*6e4;let best=null;for(let i=OBS.length-1;i>=0;i--){const o=OBS[i];if(!o.call||o.b!==b||(o.dir||"rx")!==dir)continue;const at=Date.parse(o.at);if(at<lim)break;
    let same=o.t===tid;if(!same&&dx){const t=T0(o.t);same=t&&distJS([t.lon,t.lat],dx)<1200}if(same){best=o;break}}
  if(!best)return null;const w=Math.exp(-(Date.now()-Date.parse(best.at))/(45*6e4));const fs=best.s===0?(best.r!=null?.2+.12*best.r:.3):best.s!=null?Math.max(.2,Math.min(1,(best.s<=9?best.s:9+(best.s-9)/10)/10.5)):.6;return {h:!!best.h,w,fs}}catch(_){return null}};
/* 2.6.0: lectura del S-metro al pulsar “Lo oigo”. S9 = −73 dBm y 6 dB por punto S; por encima, S9 + dB.
   La lectura menos el ruido típico de la banda en un entorno rural (más el ruido de tu entorno que hayas puesto en la estación)
   da la relación señal/ruido que de verdad tuviste, y la calibración la usa además de “lo oigo / no lo oigo”. */
const SVAL=[0,1,2,3,4,5,6,7,8,9,14,19,29,39,49,59,69];
const sTxt=v=>v<=9?"S"+v:"S9+"+(v-9);window.ACRACB_sTxt=sTxt;window.ACRACB_sLbl=v=>T(" con <b>"," at <b>")+sTxt(v)+"</b>";
const sDbm=v=>v<=9?-73-6*(9-v):-73+(v-9);
const NRUR=[-100,-105,-110,-120,-123,-125,-127,-129,-108,-115,-131];
/* VOACAP trabaja en dB-Hz: la relación en 2,4 kHz se pasa sumando 33,8 dB; una señal que apenas asoma sobre el ruido cuenta como 3 dB */
/* R (legibilidad, solo fonía): R1 ≈ 0 dB, R2 ≈ 3, R3 ≈ 6, R4 ≈ 10 y R5 ≈ 15 dB de relación en 2,4 kHz. Con S y R se promedian. */
const RSNR={1:0,2:3,3:6,4:10,5:15};
/* modos digitales: la relación señal/ruido que da el programa (FT8, FT4, RTTY…), ya en un ancho de unos 2,5 kHz */
const DBV=[-24,-20,-15,-10,-5,0,5,10,20];
/* 2.7.0: S0 = la aguja no se mueve: el S-metro no informa y manda la legibilidad R; sin R, señal justa (3 dB) */
function obsSnr(o){if(o.dxp)return null;const v=[];if(o.s===0&&o.r==null&&o.db==null)v.push(3);if(o.s!=null&&o.s>0){const n=NRUR[o.b];if(n!=null){let pen=0;try{if(o.dir!=="tx")pen=localNoisePen(o.b,o.lh)}catch(_){}v.push(Math.max(3,sDbm(o.s)-(n+pen)))}}if(o.r!=null&&RSNR[o.r]!=null)v.push(RSNR[o.r]);if(o.db!=null)v.push(o.db);return v.length?v.reduce((a,b)=>a+b,0)/v.length+33.8:null}
window.ACRACB_smeter=last=>{const cur=last.s;return `<div class="smeter" role="group" aria-label="${T("Lectura del S-metro","S-meter reading")}"><span class="smt">${T("¿Con qué señal?","What signal?")}</span><div class="smb">${SVAL.map((v,i)=>`<button type="button" data-smt="${v}" data-o="${e2(last.at)}" aria-pressed="${cur===v}" style="--i:${i}">${v<=9?v:"+"+(v-9)}</button>`).join("")}</div></div>`};
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-smt]");if(!b)return;try{const o=OBS.slice().reverse().find(x=>x.at===b.dataset.o);if(!o)return;const v=+b.dataset.smt;
  if(o.s===v)delete o.s;else o.s=v;{const s=obsSnr(o);if(s!=null)o.snr=Math.round(s*10)/10;else delete o.snr}dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();try{renderPop()}catch(_){}try{renderInfo()}catch(_){}try{ACRACB_rebox()}catch(_){}try{redraw()}catch(_){}}catch(e){console.error(e)}},true);
/* 2.5.9: “Mi modo / Todos los modos” en “Qué hacer” y casilla “Todos los modos” en la estación: las dos cosas van sincronizadas */
const allOn=()=>{try{return CMS().length===Object.keys(MODES).length}catch(_){return false}};
/* 2.10.19: tres estados claros: solo tu modo, todos, o una mezcla elegida en el clúster o el mapa (se dice cuál) */
const mineOn=()=>{try{const c=CMS();return c.length===1&&c[0]===MOD()}catch(_){return false}};
window.ACRACB_recModes=()=>{const on=allOn(),mine=!on&&mineOn();let my="";try{my=MODES[MOD()].s}catch(_){}let mix="";if(!on&&!mine){try{mix=CMSTXT()}catch(_){}}
  return `<div class="recm seg" role="group" aria-label="${T("Modes","Modes")}"><button type="button" data-recm="0" aria-pressed="${mine}">${T("Mi modo","My mode")}${my?" · "+e2(my):""}</button><button type="button" data-recm="1" aria-pressed="${on}">${T("All modes","All modes")}</button></div>`+(mix?`<p class="note recmix">${T("Ahora ves","Now showing")}: ${e2(mix)}</p>`:"")};
/* 2.11.52: lo elegido en una sección ya no cambia el modo de arriba */
function syncAll(){return;const m=document.getElementById("modesel");if(!m)return;const a=allOn();
  if(a&&m.value!=="all"){m.value="all";try{store.set("c_modesel","all")}catch(_){}}
  else if(!a&&m.value==="all"){let b="ssb";try{b=MOD()}catch(_){}m.value=b;try{store.set("c_modesel",b)}catch(_){}}}
/* 2.10.20: elegir en la lista un modo concreto deja solo ese modo; elegir “Todos los modos” los enciende todos */
document.addEventListener("change",ev=>{const m=ev.target;if(!m||m.id!=="modesel")return;
  if(m.value==="all"){if(!allOn()){try{setAllCM(true)}catch(_){}}}
  else{try{store.set("c_modebase",m.value)}catch(_){}try{CACHE.clear()}catch(_){}if(!mineOn()){try{setAllCM(false)}catch(_){}}}
  try{renderSide()}catch(_){}},true);
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-recm]");if(!b)return;const want=b.dataset.recm==="1";
  /* antes se alternaba: con una mezcla de modos, “Mi modo” encendía todos. Ahora cada botón pone exactamente lo que dice */
  if(want?!allOn():!mineOn()){try{setAllCM(want)}catch(_){}}syncAll();try{renderSide()}catch(_){}});

setTimeout(syncAll,600);document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest("[data-mmall],[data-mm]"))setTimeout(syncAll,50)},true);window.ACRACB_geo=geoOf;window.ACRACB_split2=s=>splitTags(s);window.ACRACB_ago=ago;
/* separa las etiquetas de split/QSL (van en su sección) de las de programa (van junto a la frecuencia) */
function splitTags(s){const t=window.ACRACB_tags?ACRACB_tags(s):"";const xs=[],pr=[];(t.match(/<span class="xtag[^"]*"[^>]*>.*?<\/span>/g)||[]).forEach(x=>(/xtag x[sq]\b/.test(x)?xs:pr).push(x));return {xs:xs.join(""),pr}}
/* 2.5.2: probabilidad de QSO de cada spot: equilibrio entre la previsión VOACAP y lo que dicen los clústeres ahora mismo.
   1) Previsión: VOACAP con tu estación (potencia, antenas, altura, cable, entorno, calibración con tu log y la ionosfera de hoy),
      en el MODO del spot (FT8 o CW necesitan bastante menos señal que la SSB).
   2) Realidad del clúster: cada spot de los últimos 45 minutos en la misma banda, de ESA estación o de otra de su misma zona
      (a menos de 1.200 km), cuenta según lo que se parece el trayecto del que lo oye al tuyo: que la señal rebote en la ionosfera
      en la misma zona (puntos medios cercanos) y recorra una distancia parecida. Pesa más si es reciente y con buena señal.
   3) Si a ti te han oído en esa banda cerca de esa estación en los últimos 45 minutos (“¿Me oyen?”), el camino va en los dos sentidos.
   Con el camino confirmado, la probabilidad se acerca a lo que permite la señal (del 35% con señal justa al 85% con señal fuerte);
   sin spots parecidos manda la previsión, porque que nadie lo anuncie no demuestra que esté cerrado. */
const RD2=Math.PI/180;
const v3=p=>{const la=p[1]*RD2,lo=p[0]*RD2;return [Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la)]};
const mid=(a,b)=>{const x=v3(a),y=v3(b),m=[x[0]+y[0],x[1]+y[1],x[2]+y[2]],n=Math.hypot(...m)||1;return [Math.atan2(m[1],m[0])/RD2,Math.asin(m[2]/n)/RD2]};
const snrF=(s)=>{const m=String(s.c||"").match(/([-+]?\d{1,2})\s*dB/i);if(!m)return .6;const v=+m[1];return /FT|JT|JS8|FSK|PSK/i.test(String(s.mode||""))?Math.max(0,Math.min(1,(v+24)/24)):Math.max(0,Math.min(1,(v-3)/20))};
let SIX=null,SIXK="";
function spotIndex(){const k=(L.updatedUTC||"")+"|"+(L.spotsUTC||"")+"|"+(L.spots||[]).length;if(SIX&&SIXK===k)return SIX;SIXK=k;SIX=[];
  for(const s of (L.spots||[])){if(!s.dx||s.dx[0]==null||s.band==null)continue;let a=null;try{a=spotAge(s)}catch(_){}if(a==null||a>45)continue;
    SIX.push({call:s.call,mode:s.mode,band:s.band,dx:s.dx,from:(s.from||[]).filter(f=>f&&f[0]!=null&&f[1]!=null),wA:Math.exp(-Math.max(0,a)/30),fs:snrF(s)})}return SIX}
/* un spot en un modo que pasa con menos señal que el tuyo prueba menos: FT8 frente a SSB cuenta una cuarta parte */
function modeW(spMode,myAdj){let k="ssb";try{k=spotMode({mode:spMode})}catch(_){}const d=((MODES[k]&&MODES[k].adj)||0)-myAdj;return d>0?Math.exp(-d/20):1}
/* lo que dicen ahora los clústeres de una zona (destino) en una banda, visto desde tu locator */
let ZEV=new Map(),ZEVK="",NBM=new Map(),NBK="";
/* 2.10.36: rapidez. El margen del modo (myAdj) va en la clave de cada destino y no en la de toda la caché: antes, al
   consultarse con márgenes distintos (tu modo, concurso…), la caché se vaciaba en cada llamada y se recalculaba todo.
   Las distancias de estas comparaciones (¿está cerca?, ¿se parece el camino?) usan la esfera, mucho más rápida; las
   que se enseñan siguen siendo las exactas sobre el elipsoide. */
function zoneEv(dx,band,myAdj,key){spotIndex();const sk=SIXK+"|"+TXP.join(",");if(sk!==ZEVK){ZEV=new Map();ZEVK=sk}const kk=key+"|"+band+"|"+myAdj;if(ZEV.has(kk))return ZEV.get(kk);
  const myMid=mid(TXP,dx),myLen=distS(TXP,dx);let miss=1,wSum=0,fsW=0;
  for(const x of spotIndex()){if(x.band!==band||distS(x.dx,dx)>1200)continue;const mw=modeW(x.mode,myAdj);
    for(const fr of x.from){const w=pathSim(fr,x.dx,myMid,myLen)*x.wA*mw;if(w<.02)continue;miss*=1-Math.min(.95,w);wSum+=w;fsW+=w*x.fs}}
  const r={E:1-miss,fs:wSum?fsW/wSum:.6};ZEV.set(kk,r);return r}
/* 2.5.3: la misma ponderación en TODA la plataforma: cada probabilidad de VOACAP de la hora actual se equilibra con lo que dicen
   los clústeres hacia ese destino; una hora antes o después cuenta la mitad y a partir de dos horas manda solo la previsión */
window.ACRACB_live=(t,lh,b,p,extra)=>{if(t.lat==null||t.lon==null||b==null)return p;let now;try{now=localNow()}catch(_){return p}
  let dh=Math.abs(lh-now);dh=Math.min(dh,24-dh);const wh=Math.max(0,1-dh/2);if(!wh)return p;
  let myAdj=0;try{myAdj=MD().adj+(extra||0)}catch(_){}const z=zoneEv([t.lon,t.lat],b,myAdj,t.id);
  /* evidencia en contra: si los que te rodean están oyendo mucho DX en esta banda y nadie oye nada de un destino donde
     normalmente hay actividad, lo más probable es que esa dirección esté cerrada. Se baja con prudencia, como mucho a la mitad. */
  {const tw=window.ACRACB_own&&ACRACB_own(t.id,[t.lon,t.lat],b,"tx");if(tw){const w=tw.w*wh;if(tw.h){p=p+(.9-p)*w}else p=p*(1-.25*w)}}
  {const ow=window.ACRACB_own&&ACRACB_own(t.id,[t.lon,t.lat],b);if(ow){const w=ow.w*wh;if(ow.h){const cap=.45+.5*ow.fs;return cap>p?p+(cap-p)*w:p}return p*(1-.7*w)}}
  if(z.E<.05){const bz=busyNear(b),aw=Math.min(1,(t.act||0)/5);return bz>0&&aw>0?p*(1-.5*bz*aw*wh):p}
  const cap=.35+.5*z.fs;return cap>p?p+(cap-p)*z.E*wh:p};
/* cuánto se oye en una banda desde tu zona ahora mismo (0 = nada, 1 = mucha actividad) */
let BZ=new Map(),BZK="";
function busyNear(b){spotIndex();const k=SIXK+"|"+TXP.join(",");if(k!==BZK){BZ=new Map();BZK=k}if(BZ.has(b))return BZ.get(b);let n=0;
  for(const x of spotIndex()){if(x.band!==b)continue;for(const fr of x.from){try{if(distS(TXP,fr)<1500){n+=x.wA;break}}catch(_){}}}
  const r=1-Math.exp(-n/8);BZ.set(b,r);return r}
function pathSim(fr,dx,myMid,myLen){try{const L2=distS(fr,dx),ms=distS(mid(fr,dx),myMid),dl=(L2-myLen)/Math.max(800,.3*myLen);const q=ms/1200;return Math.exp(-q*q)*Math.exp(-dl*dl)}catch(_){return 0}}
function spotProb(s,e,a){let lh=null;try{lh=localNow()}catch(_){}
  let k="ssb";try{k=spotMode(s)}catch(_){}let ex=0;try{ex=(MODES[k]?MODES[k].adj:0)-MD().adj}catch(_){}
  let pS=e.pSP||0,pL=e.t&&e.t.l?(e.pLP||0):0;
  if(e.t&&lh!=null){window.ACRACB_NOLIVE=true;try{pS=prob(e.t,lh,s.band,false,ex).p;pL=e.t.l?prob(e.t,lh,s.band,true,ex).p:0}catch(_){}finally{window.ACRACB_NOLIVE=false}}
  const lp=pL>pS&&pL>=.05;const p0=lp?pL:pS;let p=p0;
  let E=0,fsW=0,wSum=0,self=false;
  if(s.dx&&s.dx[0]!=null&&!lp){const myMid=mid(TXP,s.dx),myLen=distS(TXP,s.dx);let miss=1;
    /* el propio spot (aunque sea algo antiguo) y los demás de la misma zona */
    const own={dx:s.dx,from:(s.from||[]).filter(f=>f&&f[0]!=null),wA:Math.exp(-Math.max(0,a==null?60:a)/30),fs:snrF(s),same:true};
    /* 2.10.42: los vecinos de cada spot se buscan una vez por tanda de spots (antes, todos contra todos en cada redibujado) */
    const ix=spotIndex();if(NBK!==SIXK){NBK=SIXK;NBM=new Map()}const nk=s.call+"|"+s.band+"|"+s.dx[0]+","+s.dx[1];let nb=NBM.get(nk);
    if(!nb){nb=ix.filter(x=>x.band===s.band&&x.call!==s.call&&distS(x.dx,s.dx)<1200);NBM.set(nk,nb)}
    const cand=[own].concat(nb);
    let spAdj=0;try{spAdj=(MODES[k]&&MODES[k].adj)||0}catch(_){}
    for(const x of cand)for(const fr of x.from){const w=pathSim(fr,x.dx,myMid,myLen)*x.wA*(x.same?1:.7*modeW(x.mode,spAdj));if(w<.02)continue;miss*=1-Math.min(.95,w);wSum+=w;fsW+=w*x.fs;if(x.same&&w>.25)self=true}
    E=1-miss}
  const fs=wSum?fsW/wSum:.6,cap=.35+.5*fs;if(E>0&&cap>p)p=p+(cap-p)*E;
  let heard=false,hw=0;try{const H=window.ACRACB_heardList&&ACRACB_heardList();if(H&&s.dx){const ha=(Date.now()-H.at)/6e4;if(ha<45)for(const x of H.list){if(x.band===s.band&&x.pos&&distJS(x.pos,s.dx)<1500){heard=true;hw=Math.exp(-ha/45);break}}}}catch(_){}
  if(heard&&p<.9)p=p+(.9-p)*hw;
  try{const tw=window.ACRACB_own&&ACRACB_own(e.t&&e.t.id,s.dx,s.band,"tx");if(tw){if(tw.h)p=p+(.9-p)*tw.w;else p=p*(1-.25*tw.w)}}catch(_){}
  try{const ow=window.ACRACB_own&&ACRACB_own(e.t&&e.t.id,s.dx,s.band);if(ow){if(ow.h){const cap=.45+.5*ow.fs;if(cap>p)p=p+(cap-p)*ow.w}else p=p*(1-.7*ow.w)}}catch(_){}
  return {p,lp,p0,near:E>.3,self,E,heard}}
window.ACRACB_spotProb=spotProb;
/* 2.6.3: la misma probabilidad de QSO en todas las tarjetas (avisos, aviso de portada, “Cerca”, POTA/SOTA/WWFF) */
function PC(s,a){try{if(s.band==null)return {};const dx=s.dx&&s.dx[0]!=null?s.dx:(window.ACRACB_areaPos&&ACRACB_areaPos(s.call));if(!dx)return {};
  const ss=Object.assign({},s,{dx,kind:"dx",from:Array.isArray(s.from)?s.from:[]});const e=spotEval(ss,localNow());if(!e||!e.t)return {};const r=spotProb(ss,e,a);
  let sg="";try{sg=sigRow(ss,e,r)}catch(_){}
  return isFinite(r.p)?{p:Math.round(r.p*100),p0:Math.round(r.p0*100),sig:sg,lpb:!!r.lp,oh:{t:e.t.id,b:ss.band,call:ss.call,mode:ss.mode}}:{}}catch(_){return {}}}
/* 2.10.1: señal prevista en los dos sentidos (le oirás / te oirá) y, si ya anotaste lo que oyes o lo que te oyen,
   la comparación con lo previsto y cómo cambia la probabilidad con tus datos */
/* 2.11.60: si no hay estimación de señal, se dice por qué, en vez de dejar la tarjeta sin la fila “Señal” */
function sigWhy(s,e,sp){const b=s.band;let why=T("Sin estimación de señal para este camino.","No signal estimate for this path.");
  try{if(!e||!e.t)why=T("No se sabe desde dónde transmite: sin ubicación no se puede estimar la señal.","Its location is unknown: without it the signal cannot be estimated.");
    else if(b!=null&&typeof antPick==="function"&&!antPick(b,10))why=T(`Ninguna de tus antenas cubre ${BANDS[b]||"esta banda"}.`,`None of your antennas covers ${BANDS[b]||"this band"}.`)}catch(_){}
  return `<span class="sgnone">${why}</span>`}
function sigRow(s,e,sp){if(!e||!e.t||!window.ACRACB_sigEst)return sigWhy(s,e,sp);let lh=null;try{lh=localNow()}catch(_){}if(lh==null)return sigWhy(s,e,sp);
  const g=ACRACB_sigEst(e.t,lh,s.band,!!sp.lp);if(!g)return sigWhy(s,e,sp);const k=(()=>{try{return spotMode(s)}catch(_){return "ssb"}})();
  /* 2.11.22: la señal se juzga con lo que necesita el modo del spot, con el mismo modelo que da la probabilidad (antes, con
     un umbral fijo de SSB: una señal suficiente para CW o FT8 salía “bajo el ruido” junto a una probabilidad alta) */
  let ex=0;try{ex=(MODES[k]?MODES[k].adj:0)-MD().adj}catch(_){}const need=g.req-ex;
  const mn=k==="cw"?"CW":["ft8","ft4","jt65","js8","psk","rtty"].includes(k)?k.toUpperCase():T("la fonía","phone");
  const rep=x=>{const m=x.snr-need,v=Math.min(x.s,9+40),pc=Math.round(Math.min(1,v/13)*100),c=m>=6?"sg-g":m>=0?"sg-y":"sg-r";
    const w=m>=6?T("de sobra","plenty"):m>=0?T("justa","just enough"):T("no basta","not enough");
    return `<span class="sgm ${c}" title="${x.dbm} dBm"><i style="width:${pc}%"></i></span><b class="sgv ${c}">${sTxt(x.s)}</b><span class="sgx" title="${T("para ","for ")}${mn}${x.low?T(` · ruido ${sTxt(x.ns)}`,` · noise ${sTxt(x.ns)}`):""}">${w}</span>`};
  const cl=x=>{const m=x.snr-need;return m>=6?2:m>=0?1:0};
  /* 2.11.58: siempre las dos barras, “Le oirás” y “Te oirá”, aunque coincidan: antes se juntaban en una sola (“Ida y
     vuelta”) y parecía que a esas tarjetas les faltaba una */
  let h=`<span class="sgl"><span class="sgk">${T("Le oirás","You hear")}</span>${rep(g.rx)}</span><span class="sgl"><span class="sgk">${T("Te oirá","Hears you")}</span>${rep(g.tx)}</span>`;
  h=`<span class="sgw" title="${T("Mediana del mes según el modelo","Monthly median from the model")}">${h}</span>`;
  /* 2.11.54: señal suficiente con fiabilidad baja no es una contradicción: la banda abre solo algunos días (está al límite
     de la MUF), y cuando abre llega con esa señal. Se dice, para que no parezca que una cosa desmiente a la otra */
  try{const pp=sp&&sp.p!=null?sp.p:null,p0=sp&&sp.p0!=null?sp.p0:pp;/* 2.11.59: al revés: el modelo da poca señal, pero lo que se oye ahora sube la fiabilidad */if(pp!=null&&pp>=.5&&p0!=null&&p0<.25&&Math.max(cl(g.rx),cl(g.tx))<1)h+=`<span class="sgnote">${T(`Es la señal que da el modelo, que aquí se queda corto: los spots de ahora dicen que el camino está abierto.`,`This is the model's signal, which falls short here: current spots say the path is open.`)}</span>`;if(pp!=null&&pp<.5&&Math.min(cl(g.rx),cl(g.tx))>=1)h+=`<span class="sgnote">${T(`Esa es la señal de los días en que el camino abre; a esta hora abre menos de la mitad de los días.`,`That is the signal on days when the path opens; at this hour it opens on fewer than half the days.`)}</span>`}catch(_){}
  const call=SK(s.call),o=lastOwn(call,s.band,"rx"),u=lastOwn(call,s.band,"tx");const cmp=[];
  if(o&&o.h&&o.s!=null){const d=o.s-Math.min(g.rx.s,9+60);cmp.push(T(`le oyes a <b>${sTxt(o.s)}</b> y se preveía ${sTxt(g.rx.s)}`,`you hear them at <b>${sTxt(o.s)}</b>; ${sTxt(g.rx.s)} was forecast`)+(d?` (${d>0?"+":""}${d})`:` (${T("acierto","spot on")})`))}
  if(u&&u.h&&u.s!=null){const d=u.s-g.tx.s;cmp.push(T(`te oye a <b>${sTxt(u.s)}</b> y se preveía ${sTxt(g.tx.s)}`,`they hear you at <b>${sTxt(u.s)}</b>; ${sTxt(g.tx.s)} was forecast`)+(d?` (${d>0?"+":""}${d})`:` (${T("acierto","spot on")})`))}
  if((o||u)&&sp.p0!=null&&Math.round(sp.p0*100)!==Math.round(sp.p*100))cmp.push(T(`la fiabilidad pasa del <b>${Math.round(sp.p0*100)}%</b> que daba el modelo al <b>${Math.round(sp.p*100)}%</b>`,`the chance goes from the model's <b>${Math.round(sp.p0*100)}%</b> to <b>${Math.round(sp.p*100)}%</b>`));
  if(cmp.length)h+=`<div class="sgcmp">${T("Con lo que has anotado","With what you noted")}: ${cmp.join("; ")}.</div>`;
  return h}
function dxRow(s,e,a){const st=splitTags(s);const tags=[];const sp=spotProb(s,e,a);if(s.nw)tags.push(`<span class="nwb">${T("NEW","NEW")}</span>`);if(s.ns>1)tags.push(`<span class="nsb">${T(`en ${s.ns} clusters`,`on ${s.ns} clusters`)}</span>`);
  return card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tags.concat(st.pr),byLbl:T("Spotted by","Spotted by"),by:pubBy(s),xs:st.xs,geo:geoOf(s.dx)||{az:e.az,laz:e.laz,km:e.km},p:Math.round(sp.p*100),p0:Math.round(sp.p0*100),lpb:sp.lp,oh:e.t?{t:e.t.id,b:s.band,call:s.call,mode:s.mode}:null,old:a>60,sig:sigRow(s,e,sp)})}
function progRow(o){const u=refUrl(o.prog,o.ref),pn=PNAME[o.prog];const tag=u?`<a class="xtag xr" href="${u}" target="_blank" rel="noopener noreferrer" data-ext title="${T("Ficha del","Page of the")} ${T(pn[0],pn[1])}">${e2(o.prog)} ${e2(o.ref)}</a>`:`<span class="xtag xr">${e2(o.prog)} ${e2(o.ref)}</span>`;
  return card({...PC({call:o.call,band:o.band,mode:o.mode,f:o.f,dx:o.dx,t:o.t,c:o.c},o.a),call:o.call,a:o.a,t:o.t,f:o.f,band:o.band,mode:o.mode,tags:[tag],byLbl:T("Spot de","Spotted by"),by:o.by?e2(o.by):"",geo:geoOf(o.dx),note:o.c?e2(cTr(o.c)):"",old:o.a>30})}
const NREF=/(POTA|SOTA|WWFF|GMA|DME|DVGE|DFE|IOTA|DIE|DCE|DMVE|DEE)[ :-]*[A-Z0-9/-]+/i;
function nearRow(s,a){const st=splitTags(s);const tags=[];if(s.nw)tags.push(`<span class="nwb">${T("NEW","NEW")}</span>`);if(s.ns>1)tags.push(`<span class="nsb">${T(`en ${s.ns} clusters`,`on ${s.ns} clusters`)}</span>`);
  const m=String(s.c||"").match(NREF);if(m&&!st.pr.length)tags.push(`<span class="xtag xr">${e2(m[0].toUpperCase())}</span>`);
  return card({...PC(s,a),call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tags.concat(st.pr),byLbl:T("Spotted by","Spotted by"),by:pubBy(s),xs:st.xs,geo:geoOf(s.dx),old:a>60})}
function renderNear(){const box=$("near");if(!box||typeof SPOTS!=="function")return;const keep=[...box.children].filter(x=>x.matches&&x.matches("p.note"));
  const nr=SPOTS().filter(s=>spotKind(s)==="near").map(s=>({s,a:spotAge(s)})).sort((x,y)=>(x.a??1e9)-(y.a??1e9));
  box.innerHTML=(nr.length?nr.map(({s,a})=>nearRow(s,a)).join(""):`<div class="empty">${T(`Sin spots de España en ${CMSTXT()} now.`,`No spots from Spain in ${CMSTXT()} right now.`)}</div>`);keep.forEach(k=>box.appendChild(k))}

/* ---------- clúster ---------- */
let LH=null;let CLALL=false,CLOPEN=false;try{CLALL=localStorage.getItem("acracb_clall")==="1"}catch(_){}
document.addEventListener("click",ev=>{const f=ev.target.closest&&ev.target.closest("[data-clfor]");if(f){CLALL=f.dataset.clfor==="all";CLOPEN=false;try{localStorage.setItem("acracb_clall",CLALL?"1":"")}catch(_){}render();return}
  const m=ev.target.closest&&ev.target.closest("[data-clmore]");if(m){CLOPEN=true;render()}});
/* un spot con referencia de programa es una activación: va en su categoría, no en DX */
function actKeys(){const k=L.acts||[];if(actKeys.c&&actKeys.c[0]===k&&actKeys.c[1]===k.length)return actKeys.c[2];const m=new Set(k.map(o=>SK(o.call)+"|"+o.band));actKeys.c=[k,k.length,m];return m}
function isActSpot(s){return actKeys().has(SK(s.call)+"|"+s.band)||RXA.test(String(s.c||""))}
/* lo que el mapa dibuja: lo mismo que el clúster, con las mismas categorías (DX y activaciones con posición) */
/* 2.11.63: en el mapa se puede dejar el clúster sin nada (pulsando “Todos” cuando ya está todo, o quitando el último):
   solo afecta al mapa, la lista del clúster sigue igual */
let MAPNONE=false;
function mapSpots(){if(MAPNONE)return [];const ty=TYPES;const out=[];
  if(ty.has("dx"))SPOTS().forEach(s=>{if(!isActSpot(s))out.push(s)});
  let bs=null;try{bs=CMBANDS()}catch(_){}
  progAll().forEach(o=>{const c=catOf(o);if(!ty.has(c)||!o.dx||o.band==null||(bs&&!bs.has(o.band))||!modeOK(o)||(o.a!=null&&o.a>60))return;
    out.push({call:o.call,f:o.f,band:o.band,mode:o.mode,t:o.t,utc:o.utc,by:o.by?[o.by]:[],from:[],dx:o.dx,dxcc:o.dxcc,kind:"dx",c:(o.prog+" "+o.ref+(o.c?" · "+o.c:"")),act:{prog:o.prog,ref:o.ref,cat:c}})});
  return out}
let MSC=null;window.ACRACB_mapSpots=()=>{const k=[MAPNONE?1:0,L.updatedUTC,L.actsUTC,(L.spots||[]).length,(L.acts||[]).length,[...TYPES].join(),CMS().join(),(()=>{try{return [...CMBANDS()].join()}catch(_){return ""}})()].join("|");if(MSC&&MSC[0]===k)return MSC[1];const v=mapSpots();MSC=[k,v];return v};
window.ACRACB_cat={types:()=>new Set(TYPES),label:CATN,list:()=>["dx"].concat(PROGS)};
function catChanged(){MSC=null;try{if(typeof st!=="undefined"&&st.page==="mapa")drawMap()}catch(_){}try{mapCat()}catch(_){}try{document.dispatchEvent(new Event("acracb:cat"))}catch(_){}}
/* selector en el mapa, el mismo que en el clúster */
function mapCat(){const sw=document.getElementById("mapsw");if(!sw)return;const row0=sw.closest(".mrow");if(!row0)return;let r=document.getElementById("mcatrow");
  if(!r){r=document.createElement("div");r.className="mrow";r.id="mcatrow";row0.insertAdjacentElement("afterend",r)}
  const on=typeof st!=="undefined"&&st.mapOn&&st.ly&&st.ly.spots;r.hidden=!on;if(!on)return;
  const ms=window.ACRACB_mapSpots(),cnt={};ms.forEach(s=>{const c=s.act?s.act.cat:"dx";cnt[c]=(cnt[c]||0)+1});const ALL=["dx"].concat(PROGS),all=ALL.every(x=>TYPES.has(x));
  const h=`<div class="mrt">${T("Cluster","Cluster")}</div><div class="seg" role="group" aria-label="${T("Which spots to show","Which spots to show")}"><button type="button" data-mct="*" aria-pressed="${all&&!MAPNONE}">${T("All","All")}</button>${ALL.map(k=>`<button type="button" data-mct="${k}" aria-pressed="${!MAPNONE&&TYPES.has(k)&&!all}">${CATN(k)}${cnt[k]?` <small>${cnt[k]}</small>`:""}</button>`).join("")}</div>`;
  if(r.innerHTML!==h)r.innerHTML=h}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-mct]");if(!b)return;const k=b.dataset.mct,ALL=["dx"].concat(PROGS),all=ALL.every(x=>TYPES.has(x));
  if(k==="*"){if(all&&!MAPNONE)MAPNONE=true;else{MAPNONE=false;ALL.forEach(x=>TYPES.add(x))}}
  else if(MAPNONE){MAPNONE=false;TYPES.clear();TYPES.add(k)}
  else if(all){TYPES.clear();TYPES.add(k)}
  else{if(TYPES.has(k))TYPES.delete(k);else TYPES.add(k);if(!TYPES.size){ALL.forEach(x=>TYPES.add(x));MAPNONE=true}}
  S.set("acracb_cltypes",JSON.stringify([...TYPES]));{const a2=ALL.every(y=>TYPES.has(y));b.parentElement.querySelectorAll("[data-mct]").forEach(x=>x.setAttribute("aria-pressed",String(!MAPNONE&&(x.dataset.mct==="*"?a2:(TYPES.has(x.dataset.mct)&&!a2)))))}
  MSC=null;try{render()}catch(_){}catChanged()});
(window.ACRACB_afterDraw=window.ACRACB_afterDraw||[]).push(()=>{try{mapCat()}catch(_){}});
function render(lh){if(lh!=null)LH=lh;const box=$("spots");if(!box||typeof SPOTS!=="function")return;if(LH==null)LH=st.mhour;
  let bx=$("clbar");if(!bx){bx=document.createElement("div");bx.id="clbar";const cf=$("clfilt");if(cf)cf.appendChild(bx);else box.parentNode.insertBefore(bx,box)}
  const bs=bandsOK();
  /* DX */
  const sp=SPOTS().filter(s=>!isActSpot(s)).map(s=>({s,e:spotEval(s,LH),a:spotAge(s)})).filter(x=>x.e&&(spotKind(x.s)==="dx"||spotKind(x.s)==="ind"));
  sp.sort((x,y)=>(spotKind(x.s)==="dx")-(spotKind(y.s)==="dx")||0);
  const dxs=sp.filter(x=>spotKind(x.s)==="dx").sort((a,b)=>b.e.p-a.e.p).concat(sp.filter(x=>spotKind(x.s)==="ind"));
  /* programas */
  const pa=progAll().filter(o=>bs.has(o.band)&&modeOK(o)&&(o.a==null||o.a<=60));
  const counts={dx:dxs.length};PROGS.forEach(p=>counts[p]=pa.filter(o=>catOf(o)===p).length);
  const cur=(TYPES.has("dx")?dxs.map(x=>x.s.band):[]).concat(pa.filter(o=>TYPES.has(catOf(o))).map(o=>o.band));
  const bcounts={};cur.forEach(b=>bcounts[b]=(bcounts[b]||0)+1);
  bx.innerHTML=bar(counts,bcounts)+legend();wire(bx);
  /* 2.10.0: los filtros van plegados; el resumen dice qué se está mostrando */
  {const fs=$("clfs");if(fs){const ty=["dx"].concat(PROGS).filter(t=>TYPES.has(t)).map(CATN);const bsl2=ORD.filter(b=>BSEL.has(b)).map(b=>BANDS[b]);
    fs.textContent=[CMSTXT(),bsl2.length?bsl2.join(", "):T("all bands","all bands"),ty.length&&ty.length<1+PROGS.length?ty.join(", "):T("DX y actividades","DX and activations")].join(" · ")}}
  const inB=b=>!BSEL.size||BSEL.has(b),bsl=ORD.filter(b=>BSEL.has(b)).map(b=>BANDS[b]);
  const bl=bsl.length?" "+T("en","on")+" "+(bsl.length>1?bsl.slice(0,-1).join(", ")+T(" and "," and ")+bsl[bsl.length-1]:bsl[0]):"";
  let h="";const srcs=[];
  if(TYPES.has("dx")){const rows=dxs.filter(x=>inB(x.s.band));
    /* 2.10.24: de dónde salen (y por qué faltan) los DX: el recuento de todos los spots del clúster */
    try{const all=L.spots||[];let oM=0,oB=0,ac=0,nr=0,dx0=0;const bsx=CMBANDS(),ms=CMS();
      for(const z of all){if(isActSpot(z)){ac++;continue}if(!ms.includes(spotMode(z))){oM++;continue}if(!bsx.has(z.band)||!inB(z.band)){oB++;continue}const k=spotKind(z);if(k!=="dx"&&k!=="ind"){nr++;continue}dx0++}
      /* 2.11.12: título y recuento en una sola línea: “DX 185 con tu modo y tus bandas”, y el resto, en pequeño */
      const bits=[];if(oM)bits.push(T(`otros modos ${oM}`,`other modes ${oM}`));if(oB)bits.push(T(`otras bandas ${oB}`,`other bands ${oB}`));if(ac)bits.push(T(`activaciones ${ac}`,`activations ${ac}`));if(nr)bits.push(T(`Spain ${nr}`,`Spain ${nr}`));
      h+=`<p class="clsum"><b class="clsk">DX</b> <b class="clsn" title="${T("Con tu modo y tus bandas","In your mode and bands")}">${dx0}</b><span class="clsx">/${all.length}${bits.length?" · "+bits.join(" · "):""}</span></p>${st.mode==="contest"?`<p class="note clwhy">`+T("En modo concursos “Para ti” pide más señal, porque tienen que copiarte a la primera.","In contest mode “For you” asks for a stronger signal, because they must copy you first time.")+`</p>`:""}`}catch(_){}
    /* 2.8.20: una fila por estación (sus otras frecuencias al lado), por defecto solo lo que puedes trabajar
       (oída en la última media hora y con al menos un 10%), lo nuevo arriba y pocas filas con “Ver N más” */
    const G=new Map();rows.forEach(x=>{let pp=0;try{pp=spotProb(x.s,x.e,x.a).p}catch(_){pp=x.e.p||0}x.pp=pp;const k=SK(x.s.call);if(!G.has(k))G.set(k,[]);G.get(k).push(x)});
    const grp=[...G.values()].map(a=>{a.sort((u,v)=>v.pp-u.pp);const best=a[0];return {a,best,nw:a.some(x=>x.s.nw),pp:best.pp,age:Math.min(...a.map(x=>x.a??1e9))}});
    const useful=g=>g.age<=30&&g.pp>=.1;const yours=grp.filter(useful);
    const sel=CLALL?grp:yours;sel.sort((u,v)=>(v.nw-u.nw)||(v.pp-u.pp));
    const N=document.documentElement.classList.contains("vc")?6:8;
    h+=`<div class="seg clfor" role="group" aria-label="${T("Qué estaciones ver","Which stations to show")}"><button type="button" data-clfor="you" aria-pressed="${!CLALL}">${T("Para ti","For you")} <small>${yours.length}</small></button><button type="button" data-clfor="all" aria-pressed="${CLALL}">${T("All","All")} <small>${grp.length}</small></button></div>`;
    h+=`<p class="note clfn">${CLALL?T("<b>Todos:</b> todas las estaciones del clúster con tus filtros de modo y banda, aunque ahora no te lleguen.","<b>All:</b> every station on the cluster with your mode and band filters, even if it does not reach you now."):T("<b>For you:</b> solo las que puedes trabajar ahora: oídas en la última media hora y con al menos un 10% de fiabilidad desde tu estación.","<b>For you:</b> only those you can work now: heard in the last half hour and with at least 10% reliability from your station.")}</p>`;
    /* 2.10.0: las otras frecuencias de la misma estación, en una fila propia “También en”, con el mismo aspecto que la
       frecuencia principal (cifra en grande y color de su banda, modo y banda al lado) */
    const alt=g=>g.a.slice(1).map(x=>`<span class="xalt2"><b style="color:${BC[x.s.band]}">${e2(x.s.f)}</b>${x.s.mode?` <span class="xam">${e2(x.s.mode)}</span>`:""} <span class="xab">${BANDS[x.s.band]}</span></span>`);
    const one=g=>{const x=g.best;const sv=x.s;const tg=alt(g);if(!tg.length)return dxRow(sv,x.e,x.a);const o=Object.assign({},sv);const r=dxRow(o,x.e,x.a);
      const row=`<dt>${T("También en","Also on")}</dt><dd class="xalts">${tg.join("")}</dd>`;return r.includes('class="sc-d">')?r.replace('class="sc-d">','class="sc-d">'+row):r.replace(/(<div class="sc-f">[\s\S]*?)(<\/div>)/,(m,a1,a2)=>a1+tg.join("")+a2)};
    const cards=sel.map(one);const open=CLOPEN||cards.length<=N+2;
    h+=cards.length?(document.documentElement.classList.contains("vl")?ACRACB_listHead():"")+(open?cards:cards.slice(0,N)).join("")+(open?"":`<button type="button" class="btn llmore" data-clmore>${T(`View ${cards.length-N} more stations`,`Show ${cards.length-N} more stations`)}</button>`)
      :`<div class="empty">${CLALL||!grp.length?T(`Sin spots DX de ${CMSTXT()} useful${bl} now.`,`No useful ${CMSTXT()} DX spots${bl} right now.`):T(`Ninguna estación que puedas trabajar ahora${bl}. Pulsa “Todos” para ver las ${grp.length} del clúster.`,`No stations you can work right now${bl}. Tap “All” to see the ${grp.length} on the cluster.`)}</div>`;
    srcs.push(e2(L.spotsSrc||"—"))}
  const ps=PROGS.filter(p=>TYPES.has(p));
  if(ps.length){const rows=pa.filter(o=>ps.includes(catOf(o))&&inB(o.band)).sort((a,b)=>(a.a??1e9)-(b.a??1e9));const N=80;
    const psn=ps.map(p=>p==="OTROS"?T("otros programas (GMA, castillos, faros…)","other programs (GMA, castles, lighthouses…)"):p);const pl=psn.length>1?psn.slice(0,-1).join(", ")+T(" and "," and ")+psn[psn.length-1]:psn[0];
    bx.insertAdjacentHTML("beforeend",`<p class="note clnote">${T(`Activadores de ${pl} de todo el mundo en la última hora, en ${CMSTXT()}${bl}. Los más recientes, arriba.`,`${pl} activators worldwide in the last hour, in ${CMSTXT()}${bl}. Newest first.`)}</p>`);
    if(TYPES.has("dx"))h+=`<p class="note clsec">${pl}</p>`;
    h+=rows.length?rows.slice(0,N).map(progRow).join("")+(rows.length>N?`<p class="note">${T(`Y ${rows.length-N} más.`,`And ${rows.length-N} more.`)}</p>`:""):`<div class="empty">${T(`Ningún activador de ${pl} on ${CMSTXT()}${bl} in the last hour.`,`No ${pl} activators in ${CMSTXT()}${bl} in the last hour.`)}</div>`;
    srcs.push((Array.isArray(L.acts)?T("Spothole","Spothole"):T("Spothole y los comentarios de los spots del clúster","Spothole and cluster spot comments"))+(L.actsUTC?T(` · revisado a las ${String(L.actsUTC).slice(11,16)} UTC`,` · checked at ${String(L.actsUTC).slice(11,16)} UTC`):""))}
  h+=`<details class="srcd"><summary>${T("Sources","Sources")}</summary>${srcs.map(x=>`<p class="note">${x}</p>`).join("")}</details>`;
  box.innerHTML=h;try{srchInit();if($("srchq")&&$("srchq").value)srchRun()}catch(_){}}
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
window.ACRACB_dxSpots=dxSpots;
window.ACRACB_spAz=(s,lp)=>{const g=geoOf(s&&s.dx);return g?(lp?g.laz:g.az):null};
window.ACRACB_dxon=function(d){const a=dxSpots(d);if(!a.length)return !(L.dxon&&typeof L.dxon==="object")?"":`<span class="dxon dxoff">${T("Sin spots en las últimas 6 h","No spots in the last 6 h")}</span><br>`;
  const live=a.filter(o=>o.a!=null&&o.a<=30),rest=a.filter(o=>!(o.a!=null&&o.a<=30));
  const one=o=>`<span class="dxof"><b style="color:${BC[o.band]}">${e2(o.f)}</b> ${mb(o.mode)} · ${BANDS[o.band]||""} · ${ago(o.a)}${split(cTr(o.c))?" · "+split(cTr(o.c)):""}</span>`;
  let h="";
  if(live.length)h+=`<span class="dxon"><b>◆ ${T("On the air now","On the air now")}:</b> ${live.slice(0,4).map(one).join(" ")}</span><br>`;
  if(rest.length)h+=`<span class="dxon dxlast">${live.length?T("Antes","Earlier"):T("Últimos spots","Latest spots")}: ${rest.slice(0,live.length?2:3).map(one).join(" ")}</span><br>`;
  return h};

/* ---------- avisos con la misma tarjeta ---------- */
/* filtros de los avisos, acumulativos como los del clúster: varios modos y varias bandas a la vez */
const AMODES=["SSB","AM","FM","CW","FT8","FT4","JT65","JS8","RTTY","PSK31","SSTV","OTROS"];
const ANAME={JS8:"JS8Call"};
/* 2.10.19: los avisos ya no tienen filtros propios: usan el modo y las bandas comunes (estación, clúster y mapa) */
const AM=new Set(),AB=new Set();
const mgrp=(m,f)=>{const x=mlab(m,f);return AMODES.includes(x)?x:(x==="JS8CALL"?"JS8":"OTROS")};
window.ACRACB_alertCards=()=>{try{alertCards()}catch(e){}};
function alertCards(){const box=$("alerts");if(!box)return;try{alRefresh()}catch(_){}if(!L.alert||!Array.isArray(L.alert.items))return;
  const old=[...box.querySelectorAll(":scope>.sp")];let wrap=box.querySelector(":scope>.alc"),fb=box.querySelector(":scope>.alf");
  /* 2.11.61: aunque no haya avisos, se ven los interruptores: si no, no se podía encender nada hasta que llegara un aviso */
  if(!wrap){wrap=document.createElement("div");wrap.className="alc";if(old.length){old[0].before(wrap);old.forEach(o=>o.remove())}else box.appendChild(wrap)}
  if(!fb){fb=document.createElement("div");fb.className="alf";wrap.before(fb)}
  const rows=L.alert.items.map(x=>{const sp=(L.spots||[]).find(s=>s.call===x.call)||{};const band=x.band!=null?x.band:sp.band;const mode=x.mode||sp.mode||"";return {x,sp,band,mode,g:mgrp(mode,x.f!=null?x.f:sp.f)}});
  const mc={},bc={};rows.forEach(r=>{mc[r.g]=(mc[r.g]||0)+1;if(r.band!=null)bc[r.band]=(bc[r.band]||0)+1});
  /* se ven siempre todos los modos y todas las bandas de tu estación; los que ahora no tienen avisos salen atenuados */
  const ml=AMODES.slice(),bs=bandsOK(),bl=ORD.filter(b=>bs.has(b));[...AB].forEach(b=>{if(!bs.has(b))AB.delete(b)});
  {const bl2=ORD.filter(b=>BSEL.has(b)).map(b=>BANDS[b]);let hb=null;try{hb=HB()}catch(_){}
   /* 2.11.81: sin la línea de modo y bandas (ya están en la barra de arriba); van dentro de la frase de abajo */
   fb.innerHTML="";window.__alMB=`${e2(CMSTXT())}${hb!=null?" · "+e2(BANDS[hb]):bl2.length?" · "+e2(bl2.join(", ")):""}`}
  const vis=rows.filter(r=>(!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band)))).map((r,i)=>{r.i=i;return r});
  const kn=`<p class="note alk">${LOG?T(`Lo que puedes trabajar ahora en ${window.__alMB||""}: primero lo que te falta en el log, luego DXpediciones y lo que marques abajo.`,`What you can work now on ${window.__alMB||""}: first what your log needs, then DXpeditions and what you switch on below.`)
    :T(`Lo que puedes trabajar ahora en ${window.__alMB||""}: DXpediciones y lo que marques abajo.`,`What you can work now on ${window.__alMB||""}: DXpeditions and what you switch on below.`)}</p>`+alXRow();
  /* 2.11.74: “Concursos en marcha”: una tarjeta por concurso en el aire, con cuándo termina; los extranjeros, con quién puntúa */
  const ctc=(()=>{try{if(!alX().ct)return "";const EN=window.ACRACB_LANG==="en",hm=d=>{const x=new Date(+d-6e4),L=EN?"en-GB":"en-US",o={timeZone:"Europe/Madrid"};return x.toLocaleDateString(L,{...o,weekday:"long"})+" "+x.toLocaleTimeString(L,{...o,hour:"2-digit",minute:"2-digit",hourCycle:"h23"})};
    const a=(window.ACRACB_ctNow?ACRACB_ctNow():[]).map(x=>({n:x.c[0],m:x.c[1],en:x.en,plan:!!x.plan,who:""})).concat(window.ACRACB_ctForNow?ACRACB_ctForNow().map(x=>({n:x.n,m:"",en:x.en,plan:false,who:x.who})):[]);
    if(!a.length)return "";
    return `<div class="alct">${a.map(x=>`<div class="sc alctc" role="link" tabindex="0" data-ctcal="${e2(x.n)}" title="${T("Ver en el calendario de concursos","See it in the contest calendar")}"><div class="sc-h"><span class="sc-call"><span class="xtag xs dxpt">${T("Contest","Contest")}</span> <b>${e2(x.n)}</b>${x.m?` <span class="xtag xr">${e2(x.m)}</span>`:""}</span></div><p class="note">${T("Termina el","Ends")} ${e2(hm(x.en))}${x.who?` · ${e2(x.who)}`:""}. <span class="alctl">${T("Ver en el calendario","See in the calendar")} ›</span>${x.plan?` · <a href="#" data-ctgo="1">${T("Ver la estrategia","See the strategy")}</a>`:""}</p></div>`).join("")}</div>`}catch(_){return ""}})();
  wrap.innerHTML=vis.length?kn+ctc+vis.map(({x,sp,band,mode})=>{const st=splitTags({c:cTr(x.c||sp.c||"")});
    const tag=alTag(x);
    let a=null;try{a=spotAge({t:x.t})}catch(e){}
    return withHave(card({...PC({call:x.call,band,mode,f:x.f,dx:sp.dx,from:sp.from,c:cTr(x.c||sp.c),t:x.t},a),call:x.call,a,t:x.t,f:x.f,band,mode,tags:[tag].concat(st.pr),by:CSL(String(x.by||"").split(/[ ,]+/).filter(Boolean),", "),xs:st.xs,geo:geoOf(sp.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(x.call)))}),x)}).join("")
    :kn+ctc+(rows.length?`<p class="note">${T("Ningún aviso con este modo y esta banda. Pulsa “Todos” o “Todas” para verlos todos.","No alerts for this mode and band. Tap “All” to see them all.")}</p>`:"")}
/* 2.4.1: el aviso flotante (arriba, en Ahora) solo enseña los modos y bandas elegidos en Avisos, con las mismas tarjetas */
/* 2.4.7: un solo criterio para todo lo que avisa (lista, aviso flotante, resumen y notificaciones): el modo y las bandas elegidos en Avisos */
/* ---------- 2.10.17: avisos DX con criterio único y lógico ----------
   Mezcla, por orden: 1) entidad nueva para tu log, 2) DXpedición, 3) banda nueva, 4) modo nuevo, 5) DX posible (entidad rara).
   Solo entra lo que el clúster “Para ti” da por trabajable (oído en la última media hora y con un 10% o más desde tu estación).
   “Ya la tengo” deja de avisar de esa estación (DXpedición: hasta que acabe) y de esa entidad en esa banda y modo durante un año. */
const ALHK="acracb_alhave";
function alHave(){try{const o=JSON.parse(localStorage.getItem(ALHK)||"{}"),n=Date.now();let ch=false;for(const k in o)if(!(o[k]>n)){delete o[k];ch=true}if(ch)localStorage.setItem(ALHK,JSON.stringify(o));return o}catch(_){return {}}}
const mgOf=(mode,f)=>{const g=mgrp(mode,f);return g==="CW"?"CW":(g==="SSB"||g==="AM"||g==="FM")?"PH":"DG"};
const MGN={CW:["CW","CW"],PH:["fonía","phone"],DG:["digital","digital"]};
function dxpInfo(call){const k=SK(call);for(const d of (L.dx||[])){if(dxTok(d.call).includes(k))return d}return null}
/* qué más avisa, aparte de tu log y las DXpediciones: indicativos curiosos
   (móvil marítimo o aeronáutico, bases en la Antártida, indicativos especiales) y DX lejano (a 15.000 km o más de tu estación) */
/* 2.10.44: sin “entidades raras”: salía de la lista Most Wanted de Club Log, cuyas condiciones de uso no están claras */
const ALXK="acracb_alx",FARKM=15000;
/* 2.11.61: dos interruptores más: spots comunicados por socios de ACRACB (encendido) y activaciones de programas
   como POTA, SOTA, WWFF, IOTA o DME (apagado: son muchas). Los dos valen también para estaciones cercanas */
function alX(){let o={};try{o=JSON.parse(localStorage.getItem(ALXK)||"{}")||{}}catch(_){}return {rare:false,cur:o.cur!==0,far:o.far!==0,soc:o.soc!==0,act:o.act===1,ct:o.ct!==0}}
function curOf(call,dxcc){const c=String(call||"").toUpperCase(),p=c.split("/"),suf=p.length>1?p[p.length-1]:"";
  if(suf==="MM")return ["Móvil marítimo","Maritime mobile"];if(suf==="AM")return ["Móvil aeronáutico","Aeronautical mobile"];
  {let en=null;try{en=callEnt(c)}catch(_){}if(+dxcc===13||(en&&/^(Antártida|Antarctica)$/i.test(en.name||"")))return ["Base en la Antártida","Antarctic base"]}
  const core=p.reduce((a,x)=>x.length>a.length?x:a,"");
  if(/\d{3,}/.test(core)||/^[A-Z]{2}\d{2,}[A-Z]/.test(core)||(core.length>=7&&/^[A-Z0-9]+$/.test(core)&&/\d/.test(core)))return ["Indicativo especial","Special event call"];
  return null}
/* 2.11.5: interruptores claros (encendido o apagado), cada uno con su explicación a la vista */
function alXRow(){const X=alX(),b=(k,es,en,tl,tle)=>`<button type="button" class="alxb" role="switch" data-alx="${k}" aria-checked="${X[k]}"><span class="alxt"><b>${T(es,en)}</b><small>${e2(T(tl,tle))}</small></span><span class="alxs" aria-hidden="true"></span></button>`;
  /* 2.11.75: los interruptores van en un desplegable, cerrado de entrada; el resumen dice cuántos hay encendidos */
  const ks=["cur","far","soc","act","ct"],on=ks.filter(k=>X[k]).length;
  return `<details class="alxr alxd"${ALXOPEN?" open":""}><summary class="alxh">${T("Avisar también de","Also alert me to")} <span class="alxn">${T(`${on} de ${ks.length} encendidos`,`${on} of ${ks.length} on`)}</span></summary><div class="alxg">${b("cur","Indicativos curiosos","Unusual calls","Móvil marítimo o aeronáutico, bases en la Antártida e indicativos especiales","Maritime or aeronautical mobile, Antarctic bases and special event calls")}${b("far","DX lejano","Far DX","A 15.000 km o más de tu estación","15,000 km or more from your station")}${b("soc","Socios de ACRACB","ACRACB members","Spots que comunican los socios desde la plataforma","Spots members post from the platform")}${b("act","Activaciones","Activations","POTA, SOTA, WWFF, IOTA, DME y otros programas","POTA, SOTA, WWFF, IOTA, DME and other programs")}${b("ct","Concursos en marcha","Contests running","Los que están en el aire ahora y cuándo terminan","Those on the air now and when they end")}</div></details>`}
let ALXOPEN=false;document.addEventListener("toggle",ev=>{const d=ev.target;if(d&&d.classList&&d.classList.contains("alxd"))ALXOPEN=d.open},true);
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-alx]");if(!b)return;const X=alX(),k=b.dataset.alx;X[k]=!X[k];document.querySelectorAll(`[data-alx="${k}"]`).forEach(e=>e.setAttribute("aria-checked",X[k]));
  try{localStorage.setItem(ALXK,JSON.stringify({cur:X.cur?1:0,far:X.far?1:0,soc:X.soc?1:0,act:X.act?1:0,ct:X.ct?1:0}))}catch(_){}
  /* 2.11.69: la lista se rehace, pero el interruptor que has tocado se queda en el mismo sitio de la pantalla */
  const y0=b.getBoundingClientRect().top;
  try{alertCards()}catch(_){}try{alBar()}catch(_){}try{foldSums()}catch(_){}
  try{const nb=document.querySelector(`#alerts [data-alx="${k}"]`)||document.querySelector(`[data-alx="${k}"]`);if(nb){const dy=nb.getBoundingClientRect().top-y0;if(Math.abs(dy)>1)window.scrollBy(0,dy);try{nb.focus({preventScroll:true})}catch(_){}}}catch(_){}});
function buildAlerts(){let lh=null;try{lh=localNow()}catch(_){}if(lh==null)lh=st.mhour;
  const H=alHave();
  const best=new Map();
  for(const s of (typeof SPOTS==="function"?SPOTS():(L.spots||[]))){
    if(s.band==null||s.band>10||(BSEL.size&&!BSEL.has(s.band)))continue;let K="";try{K=spotKind(s)}catch(_){}
    /* 2.11.65: un indicativo extranjero con una referencia DME española en el comentario está mal copiado: no avisa */
    try{if(window.ACRACB_dmeDx&&ACRACB_dmeDx(s)!=null){const ce=callEnt(s.call);if(ce&&ce.dxcc!=null&&![281,21,29,32].includes(+ce.dxcc))continue}}catch(_){}
    const X0=alX(),isSoc=!!(s.src&&String(s.src).includes("ACRACB")),hasRef=!!String(s.ref||"").trim();
    if(K!=="dx"&&K!=="ind"&&!((X0.soc&&isSoc)||(X0.act&&hasRef)))continue;
    let e=null,a=null,pp=0;try{e=spotEval(s,lh);a=spotAge(s);pp=e?spotProb(s,e,a).p:0}catch(_){}
    if(!e||a==null||a>30||pp<.1)continue;
    let t=null;try{t=tFor(s)}catch(_){}const dxcc=(t&&t.dxcc)||(+s.dxcc||null);const mg=mgOf(s.mode,s.f),bk=typeof BKEY!=="undefined"?BKEY[s.band]:s.band;
    const ck="C:"+SK(s.call),ek="E:"+dxcc+"|"+bk+"|"+mg;if(H[ck]||H[ek])continue;
    const dp=dxpInfo(s.call);let rk=0,why="",whyEn="",sub="";
    const LE=LOG&&dxcc?LOG.e[dxcc]:null,LM=LOG&&LOG.m&&dxcc?LOG.m[dxcc]:null;
    const wkCall=LOG&&LOG.calls?LOG.calls[SK(s.call)]:null;
    const dpDone=dp&&wkCall&&(!dp.start||wkCall>=String(dp.start).replace(/-/g,""));
    if(LOG&&dxcc){
      const anyC=LE&&Object.values(LE).includes("C"),bS=LE?LE[bk]:null,mS=LM?LM[mg]:null;
      if(!anyC){rk=5;why=LE?"Entidad sin confirmar":"Entidad nueva";whyEn=LE?"Entity not confirmed":"New entity";sub="ent"}
      else if(bS!=="C"){rk=3;why=bS?"Sin confirmar en "+BANDS[s.band]:"Banda nueva: "+BANDS[s.band];whyEn=bS?"Not confirmed on "+BANDS[s.band]:"New band: "+BANDS[s.band];sub="band"}
      else if(LOG.m&&mS!=="C"){rk=2;why=(mS?"Sin confirmar en ":"Modo nuevo: ")+MGN[mg][0];whyEn=(mS?"Not confirmed in ":"New mode: ")+MGN[mg][1];sub="mode"}
    }
    if(dp&&!dpDone&&rk<4){rk=4;if(!why){why="DXpedition";whyEn="DXpedition";sub="dxp"}}
    if(!rk&&!LOG&&dp&&!dpDone){rk=4;why="DXpedition";whyEn="DXpedition";sub="dxp"}
    /* 2.10.34: también lo curioso y lo lejano, cada uno con su interruptor */
    if(!rk){const X=alX(),km=e.km||0,cu=X.cur?curOf(s.call,dxcc):null;
      if(cu){rk=1;why=cu[0];whyEn=cu[1];sub="cur"}
      else if(X.far&&km>=FARKM){rk=1;why="DX lejano · "+km.toLocaleString("en-US")+" km";whyEn="Far DX · "+km.toLocaleString("en-US")+" km";sub="far"}
      else if(X.soc&&isSoc){rk=1;why="Spot de un socio";whyEn="Member's spot";sub="soc"}
      else if(X.act&&hasRef){const r=String(s.ref).trim().split(/\s+/).slice(0,2).join(" ");rk=1;why="Activación · "+r;whyEn="Activation · "+r;sub="act"}}
    if(!rk)continue;
    const it={call:s.call,f:s.f,band:s.band,mode:s.mode,t:s.t,by:s.by,c:s.c||"",need:sub==="dxp"?"DXpedition":why,why,whyEn,sub,rk,pp,dxp:!!(dp&&!dpDone),dxcc,ek,ck,end:dp&&dp.end||null};
    const k=SK(s.call),o=best.get(k);if(!o||rk>o.rk||(rk===o.rk&&pp>o.pp))best.set(k,it)}
  return [...best.values()].sort((a,b)=>b.rk-a.rk||(b.dxp-a.dxp)||b.pp-a.pp).slice(0,20)}
window.ACRACB_buildAlerts=()=>{try{return buildAlerts()}catch(e){console.error(e);return null}};
function alRefresh(){if(!L.alert)L.alert={at:L.spotsUTC||L.updatedUTC||new Date().toISOString(),items:[]};const it=window.ACRACB_buildAlerts();if(it)L.alert.items=it}
function alTag(x){const sub=x.sub||(/DXped/i.test(String(x.need||""))?"dxp":"rare");const cls=sub==="dxp"?"xs dxpt":sub==="ent"?"xs alnew":sub==="soc"?"xsoc":(sub==="rare"||sub==="cur"||sub==="far"||sub==="act")?"xr":"xr allog";
  const tx=x.why?T(x.why,x.whyEn||x.why):(sub==="dxp"?T("DXpedition","DXpedition"):T("rare entity","rare entity"));
  return `<span class="xtag ${cls}">${e2(tx)}</span>`+(x.dxp&&sub!=="dxp"?`<span class="xtag xs dxpt">${T("DXpedition","DXpedition")}</span>`:"")}
/* 2.10.36: “Ya la tengo” con icono, discreto, y deshacer durante unos segundos */
const HAVEIC='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12.5l2.7 2.7L16 9.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function alHaveBtn(x,ic){const k=SK(x.call),tl=T(`Ya la tengo: no avisarme más de ${k}`,`Got it already: stop alerting me to ${k}`);
  return `<button type="button" class="alhave${ic?" alhi":""}" data-alhave="${e2(k)}" title="${e2(tl)}" aria-label="${e2(tl)}">${HAVEIC}${ic?"":`<span>${T("Ya la tengo","Got it")}</span>`}</button>`}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-alhave]");if(!b)return;ev.preventDefault();ev.stopPropagation();
  const k=b.dataset.alhave,x=((L.alert&&L.alert.items)||[]).find(i=>SK(i.call)===k);const H=alHave(),now=Date.now(),yr=now+365*864e5;let SNAP="{}";try{SNAP=localStorage.getItem(ALHK)||"{}"}catch(_){}
  if(x){if(x.dxp||x.sub==="dxp"){const e=x.end?Date.parse(x.end+"T23:59:59Z"):NaN;H[x.ck]=isFinite(e)&&e>now?e+864e5:now+60*864e5}if(x.ek&&!/^E:null/.test(x.ek))H[x.ek]=yr;if(!x.dxp)H["C:"+k]=now+30*864e5}else{const dp=dxpInfo(k),e=dp&&dp.end?Date.parse(dp.end+"T23:59:59Z"):NaN;H["C:"+k]=isFinite(e)&&e>now?e+864e5:now+30*864e5}
  try{localStorage.setItem(ALHK,JSON.stringify(H))}catch(_){}
  const tb=document.getElementById("bandtoast")||(()=>{const d=document.createElement("div");d.id="bandtoast";d.className="bandtoast";d.setAttribute("role","status");document.body.appendChild(d);return d})();
  tb.innerHTML=`<span>${e2(T(`Hecho: no te avisaré más de ${k}.`,`Done: no more alerts for ${k}.`))}</span><button type="button" class="tbundo" data-alundo>${T("Undo","Undo")}</button>`;tb.classList.add("on","tbact");tb._snap=SNAP;clearTimeout(tb._t);tb._t=setTimeout(()=>tb.classList.remove("on","tbact"),6000);
  const redo=()=>{try{alertCards()}catch(_){}try{alBar()}catch(_){}try{foldSums()}catch(_){}try{dxCards()}catch(_){}};
  /* la estación se despide con una pequeña animación antes de quitarla */
  const rows=[...document.querySelectorAll(`[data-alhave="${CSS.escape(k)}"]`)].map(e=>e.closest(".sc")).filter(r=>r&&!r.classList.contains("dxc"));
  if(rows.length&&!matchMedia("(prefers-reduced-motion: reduce)").matches){rows.forEach(r=>{r.style.height=r.offsetHeight+"px";r.classList.add("algone")});setTimeout(redo,260)}else redo()},true);
document.addEventListener("click",ev=>{const u=ev.target.closest&&ev.target.closest("[data-alundo]");if(!u)return;ev.preventDefault();ev.stopPropagation();const tb=document.getElementById("bandtoast");
  try{localStorage.setItem(ALHK,tb&&tb._snap||"{}")}catch(_){}if(tb){tb.classList.remove("on","tbact");clearTimeout(tb._t)}
  try{alertCards()}catch(_){}try{alBar()}catch(_){}try{foldSums()}catch(_){}try{dxCards()}catch(_){}},true);
const withHave=(html,x)=>html.includes('class="sc scl')?html.replace('class="sc scl','class="sc scl alr').replace('<span class="l-x" aria-hidden="true"></span>',`<span class="l-hx">${alHaveBtn(x,true)}<span class="l-x" aria-hidden="true"></span></span>`):html.includes('<div class="ohr">')?html.replace('<div class="ohr">','<div class="ohr">'+alHaveBtn(x)):html.replace(/<\/div>\s*$/,alHaveBtn(x)+"</div>");
function alRow(x){const sp=(L.spots||[]).find(s=>s.call===x.call)||{};const band=x.band!=null?x.band:sp.band;const mode=x.mode||sp.mode||"";return {x,sp,band,mode,g:mgrp(mode,x.f!=null?x.f:sp.f)}}
function alOK(x){const r=alRow(x);return (!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band)))}
window.ACRACB_alOK=x=>{try{return alOK(x)}catch(e){return true}};
/* 2.6.6: silenciar los avisos de la portada y las notificaciones: 1 hora, hasta mañana a las 8:00 o hasta reactivarlos */
const MUTEK="acracb_almute";
const muteUntil=()=>{try{const v=localStorage.getItem(MUTEK);if(!v)return 0;return v==="inf"?Infinity:+v||0}catch(_){return 0}};
const alMuted=()=>muteUntil()>Date.now();window.ACRACB_alMuted=alMuted;window.ACRACB_muteTxt=()=>{try{return muteTxt()}catch(_){return ""}};
function setMute(kind){let v="";if(kind==="60")v=String(Date.now()+36e5);else if(kind==="tom"){const d=new Date();d.setDate(d.getDate()+(d.getHours()>=8?1:0));d.setHours(8,0,0,0);v=String(+d)}else if(kind==="inf")v="inf";
  try{v?localStorage.setItem(MUTEK,v):localStorage.removeItem(MUTEK)}catch(_){}alBar();muteBanner()}
function muteTxt(){const u=muteUntil();if(u===Infinity)return T("hasta que los reactives","until you turn them back on");const d=new Date(u),hm=d.toLocaleTimeString(window.ACRACB_LANG==="en"?"en-US":"en-US",{hour:"2-digit",minute:"2-digit"});
  return new Date().toDateString()===d.toDateString()?T("hasta las "+hm,"until "+hm):T("hasta mañana a las "+hm,"until tomorrow at "+hm)}
function muteBanner(){const box=$("alerts");if(!box)return;let b=document.getElementById("almute");if(!alMuted()){if(b)b.remove();return}
  if(!b){b=document.createElement("div");b.id="almute";b.className="almute";box.insertAdjacentElement("beforebegin",b)}
  b.innerHTML=`<span class="almi">${BELL_OFF}</span><span>${T("Avisos de la portada y notificaciones silenciados","Home-screen alerts and notifications muted")} ${e2(muteTxt())}.</span><button type="button" class="btn" data-unmute>${T("Reactivar","Turn back on")}</button>`}
const BELL_OFF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 21a2 2 0 0 1-3.4 0M18.6 13.1A7.6 7.6 0 0 1 18 10V8a6 6 0 0 0-9.3-5M6.3 6.3A6 6 0 0 0 6 8v2a7.6 7.6 0 0 1-2 5.2V17h13M3 3l18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
document.addEventListener("click",ev=>{const t=ev.target;if(!t.closest)return;
  const mb=t.closest("#almb");if(mb){const m=document.getElementById("almenu");if(m){const op=m.hidden;m.hidden=!op;mb.setAttribute("aria-expanded",String(op))}return}
  const mu=t.closest("[data-mute]");if(mu){setMute(mu.dataset.mute);return}
  if(t.closest("[data-unmute]")){setMute("");return}
  const m=document.getElementById("almenu");if(m&&!m.hidden&&!t.closest("#almenu")){m.hidden=true;const b=document.getElementById("almb");b&&b.setAttribute("aria-expanded","false")}});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"){const m=document.getElementById("almenu");if(m&&!m.hidden){m.hidden=true}}});
document.addEventListener("acracb:band",()=>{try{alBar()}catch(e){}});
function alBar(){const el=$("albar");if(!el)return;if(alMuted()){el.hidden=true;muteBanner();return}muteBanner();try{alRefresh()}catch(_){}const al=L.alert;if(!al||!Array.isArray(al.items)){el.hidden=true;return}
  const age=al.at?(Date.now()-Date.parse(al.at))/6e4:1e9;let off=null;try{off=sessionStorage.getItem("aloff")}catch(e){}
  const hb=(typeof HB==="function")?HB():null;const rows=al.items.map(alRow).filter(r=>(!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band)))&&(hb==null||r.band===hb));
  if(!rows.length||age>150||off===al.at){el.hidden=true;el.innerHTML="";return}
  /* 2.4.1: con la lista de Avisos a la vista, el aviso flotante sobra y la tapaba */
  {const fa=$("f_al");if(typeof st!=="undefined"&&st.page==="dx"&&fa&&fa.getClientRects().length){el.hidden=true;return}}
  const shown=rows.slice(0,3);
  el.hidden=false;el.classList.add("albar2");
  el.innerHTML=`<div class="alh"><b>${T("DX alert","DX alert")} <span class="alt">${esc((x=>{try{return fmtT(x)}catch(e){const d=new Date(x);return isNaN(d)?"":d.toLocaleTimeString(T("en-US","en-US"),{hour:"2-digit",minute:"2-digit"})}})(al.at))}</span></b><span class="alb"><span class="almw"><button type="button" class="almb" id="almb" aria-haspopup="menu" aria-expanded="false" title="${T("Silenciar avisos","Mute alerts")}">${BELL_OFF}<span>${T("Silenciar","Mute")}</span></button><span class="almenu" id="almenu" role="menu" hidden><button type="button" role="menuitem" data-mute="60">${T("1 hora","1 hour")}</button><button type="button" role="menuitem" data-mute="tom">${T("Hasta mañana a las 8:00","Until tomorrow 8:00")}</button><button type="button" role="menuitem" data-mute="inf">${T("Hasta que los reactive","Until I turn them back on")}</button></span></span><button type="button" class="lnk" id="algo">${rows.length>shown.length?T(`See the ${rows.length}`,`See all ${rows.length}`):T("Ver en Avisos","See in Alerts")}</button><button type="button" class="lnk" id="alx" aria-label="${T("Close alert","Close alert")}">${T("Close","Close")}</button></span></div><p class="alsub">${T("Lo que puedes trabajar tú ahora y te interesa: lo que falta en tu log, DXpediciones y DX curioso o lejano. Todo lo que se anuncia en el mundo está en DX › Clúster.","What you can work right now and is worth it: what your log is missing, DXpeditions and unusual or far DX. Everything spotted worldwide is in DX › Cluster.")}</p>
  <div class="alc">${shown.map(({x,sp,band,mode})=>{const stg=splitTags({c:cTr(x.c||sp.c||"")});
    const tag=alTag(x);let a=null;try{a=spotAge({t:x.t})}catch(e){}
    return withHave(card({...PC({call:x.call,band,mode,f:x.f,dx:sp.dx,from:sp.from,c:cTr(x.c||sp.c),t:x.t},a),call:x.call,a,t:x.t,f:x.f,band,mode,tags:[tag].concat(stg.pr),by:CSL(String(x.by||"").split(/[ ,]+/).filter(Boolean),", "),xs:stg.xs,geo:geoOf(sp.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(x.call)))}),x)}).join("")}</div>`;
  $("algo").onclick=()=>{go("dx");try{selTab("dx","f_al",true)}catch(e){}el.hidden=true;const fa=$("f_al");if(fa){fa.open=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{try{fa.scrollIntoView({block:"start",behavior:"smooth"})}catch(e){fa.scrollIntoView()}}))}};$("alx").onclick=()=>{try{sessionStorage.setItem("aloff",al.at)}catch(e){}el.hidden=true}}
window.renderAlBar=alBar;document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest(".nav button,#subnav button,.ptabs button,[data-pg]"))setTimeout(()=>{try{alBar()}catch(e){}},80)},true);
function hookA(){if(window.__hkAl)return true;if(typeof window.renderAlerts!=="function")return false;window.__hkAl=1;const o=window.renderAlerts;const w=function(){const r=o.apply(this,arguments);try{alertCards()}catch(e){console.error(e)}return r};w.__cl=1;window.renderAlerts=w;return true}
if(!hookA()){const t2=setInterval(()=>{if(hookA())clearInterval(t2)},200);setTimeout(()=>clearInterval(t2),15000)}


/* ---------- 2.4.1: DXpediciones con la misma tarjeta por secciones ---------- */
let DXOPEN=false;
/* 2.10.36: “Ya la tengo” también en cada DXpedición: deja de avisarte de ella hasta que termine; se puede quitar */
function dxHaveRow(call){const k=SK(call),H=alHave();return H["C:"+k]?`<div class="dxhv"><span class="dxgot">${HAVEIC}${T("La tienes: no te avisará más","You have it: no more alerts")}</span><button type="button" class="lnk" data-alunhave="${e2(k)}">${T("Quitar","Remove")}</button></div>`:`<div class="dxhv">${alHaveBtn({call})}</div>`}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-alunhave]");if(!b)return;ev.preventDefault();ev.stopPropagation();const H=alHave();delete H["C:"+b.dataset.alunhave];
  try{localStorage.setItem(ALHK,JSON.stringify(H))}catch(_){}try{dxCards()}catch(_){}try{alertCards()}catch(_){}try{alBar()}catch(_){}try{foldSums()}catch(_){}},true);
function dxCards(){const box=$("dxl");if(!box||!Array.isArray(L.dx)||typeof tFor!=="function")return;const lh=st.mhour;
  const html=[];L.dx.forEach((d,i)=>{let t=null;try{t=tFor(d)}catch(e){}if(!t||!isFinite(d.lon)||!isFinite(d.lat))return;const p=[d.lon,d.lat];
    const gk=geoKm(TXP,p),az=Math.round(gk.az)%360,km=Math.round(gk.km),lkm=Math.round(gk.lkm),laz=(az+180)%360;
    let bh={p:0,h:0,b:0,lp:false};for(let x=0;x<24;x++){const r=bestAny(t,x);if(r.p>bh.p)bh={...r,h:x}}const n=bestAny(t,lh);
    let nw=false;try{nw=dxNew(d)}catch(e){}const e=callEnt(d.call);/* 2.11.96: sin repetir el país (“Madagascar · Madagascar (Ste. Marie)” → “Madagascar · Ste. Marie”) */
    const cty=(()=>{if(!(e&&e.name))return "";const en=String(d.ent||""),nm=e.name;if(!en||en.toLowerCase()===nm.toLowerCase())return "";const m=en.match(/^(.*?)\s*\(([^)]+)\)\s*$/);const extra=m&&m[1].toLowerCase()===nm.toLowerCase()?m[2]:en;return ` <span class="cty">· ${e2(extra)}</span>`})();
    /* 2.11.67: se dice cuando solo se conoce el prefijo o no se han anunciado los modos */
    const pfx=!dxTok(d.call).some(z=>/\d[A-Z]{1,4}(\/[A-Z0-9]+)?$/.test(z));
    const tags=[pfx?`<span class="tag">${T("indicativo sin anunciar","callsign not announced")}</span>`:"",!(Array.isArray(d.modes)&&d.modes.length)?`<span class="tag">${T("modo sin anunciar","mode not announced")}</span>`:"",MOD()==="ssb"&&d.ssb===false?`<span class="tag">${T("phone not confirmed","phone unconfirmed")}</span>`:"",d.until?`<span class="sc-b">${T("hasta","until")} ${e2(d.until)}</span>`:""].filter(Boolean);
    let air="";try{air=(window.ACRACB_dxon?ACRACB_dxon(d):"").replace(/<br>$/,"")}catch(x){}
    let gl="";try{gl=window.ACRACB_grey?ACRACB_grey.short(p).replace(/^(Common gray line|Shared greyline):?\s*/,""):""}catch(x){}
    const sec=(l,v)=>v?`<dt>${l}</dt><dd>${v}</dd>`:"";
    const c0=dxTok(d.call)[0]||String(d.call||"");const la=lastAge(c0),act=isAct(la);html.push({act,la,h:`<div class="sc dxc ohc${act?"":" old"}" data-dxi="${i}"><div class="sc-h"><span class="sc-call">${stBtn(c0,n.p>0?n.b:null,nw?"★ ":"✔ ",d.call)}${cty}</span><span class="dxh-r">${ageTag(lastAge(c0),"")}<span class="pill ${cls(n.p)}" title="${T("Reliability for you now on","Reliability for you now on")} ${BANDS[n.b]||""}">${Math.round(n.p*100)} %${n.p>0&&BANDS[n.b]?" · "+BANDS[n.b]:""}</span></span></div>
      ${tags.length?`<div class="sc-f">${tags.join("")}</div>`:""}<dl class="sc-d">${sec(T("Actividad","Activity"),air)}
      ${sec(T("Mejor hora","Best time"),`<span class="nw">${hh(bh.h)}:00 ${T("en","on")} <b style="color:${BC[bh.b]}">${BANDS[bh.b]}</b></span> <span class="nw">(${Math.round(bh.p*100)}%${bh.lp?T(", paso largo",", long path"):""})</span>`)}
      ${sec(T("Bearing","Bearing"),`<span class="nw">${T("short","short")} ${az}° ${cab(az)}<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${laz}° ${cab(laz)}</span>`)}
      ${sec(T("Distancia","Distance"),`<span class="nw">${T("short","short")} ${fk(km)} km<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${fk(lkm)} km</span>`)}
      ${(()=>{/* 2.11.60: como el resto de tarjetas, la señal de ahora (le oirás / te oirá) en su mejor banda */let v="";try{v=n.p>0?sigRow({call:c0,band:n.b,mode:MOD(),dx:[t.lon,t.lat]},{t},{p:n.p,p0:n.p,lp:!!n.lp}):`<span class="sgnone">${T("Ahora ninguna banda llega con tu estación.","No band gets through from your station now.")}</span>`}catch(_){}return sec(T("Señal","Signal")+(n.p>0&&BANDS[n.b]?` <small>${BANDS[n.b]}</small>`:""),v)})()}
      ${sec(T("Gray line","Greyline"),gl)}${sec("QSX",d.qsx?e2(String(d.qsx).replace(/\s*,\s*/g,", ")):"")}</dl>${!act?"":ACRACB_ohBox({t:t.id,b:n.p>0?n.b:bh.b,call:SK(c0),mode:(()=>{try{return MD().s}catch(_){return ""}})()})}${dxHaveRow(c0)}</div>`})});
  {const on=html.filter(x=>x.act).sort((a,b)=>a.la-b.la),off=html.filter(x=>!x.act);html.length=0;on.forEach(x=>html.push(x.h));if(off.length){html.push(`<p class="dxoffh">${T("Anunciadas, sin spots en la última hora","Announced, no spots in the last hour")}</p>`);off.forEach(x=>html.push(x.h))}}
  const N=8,more=html.length>N+2&&!DXOPEN,nMore=html.slice(N).filter(x=>x.startsWith("<div")).length;
  box.innerHTML=(more?html.slice(0,N):html).join("")+(more?`<button type="button" class="btn llmore" id="dxmore">${T(`View ${nMore} DXpediciones más`,`Show ${nMore} more DXpeditions`)}</button>`:"")+
    (L.dxHidden&&MOD()==="ssb"?`<p class="note" style="margin:4px 0 0">${T(`Not shown: ${L.dxHidden} active expeditions that do not announce phone.`,`${L.dxHidden} active expeditions that do not announce phone are not shown.`)}</p>`:"");
  const mb2=$("dxmore");if(mb2)mb2.onclick=()=>{DXOPEN=true;dxCards()};
}
window.ACRACB_dxCards=dxCards;

/* ---------- 2.7.0: el mismo comportamiento en todas las tarjetas de estación ----------
   El texto “¿Lo oyes?” abre “¿Oyes a…?” (Lo oigo / Me oyen) y tocar el indicativo abre la ficha completa del indicativo,
   en cualquier parte de la plataforma, no solo en la pestaña DX. */
const SK=c=>String(c||"").toUpperCase().trim();
function stBtn(call,b,pre,shown){return `<span class="stc" data-stc="${e2(SK(call))}" data-stb="${b!=null&&b<10?b:""}">${pre||""}${CS(shown||call)}</span>`}
function stPos(C){try{const i=(L.dx||[]).findIndex(d=>dxTok(d.call).includes(C));const d=i>=0?L.dx[i]:null;if(d&&isFinite(d.lon)&&isFinite(d.lat))return {p:[d.lon,d.lat],d,i}}catch(_){}
  try{const s=(L.spots||[]).find(s=>SK(s.call)===C&&s.dx&&s.dx[0]!=null);if(s)return {p:s.dx}}catch(_){}
  try{const a=window.ACRACB_areaPos&&ACRACB_areaPos(C);if(a)return {p:a}}catch(_){}return {p:null}}
function stZone(C,pos,b,d){try{if(d){const t=tFor(d);if(t)return t}}catch(_){}try{if(!pos)return null;const ev=spotEval({call:C,dx:pos,band:b!=null?b:3,kind:"dx",from:[]},localNow());return ev&&ev.t?ev.t:null}catch(_){return null}}
document.addEventListener("click",ev=>{const cs=ev.target.closest&&ev.target.closest(".cs[data-call]");if(!cs||cs.closest("#cpop,#ohdlg,a"))return;if(typeof openCall!=="function")return;
  ev.preventDefault();ev.stopPropagation();try{openCall(cs.dataset.call)}catch(e){console.error(e)}},true);
/* tarjetas sin datos de banda (DXpediciones, objetivos, quién te oye…): la mejor banda de ahora para esa estación */
function dCard(card){if(card.dataset.ohc)return dOf(card);const bt=card.querySelector("[data-stc]");if(!bt)return null;const C=bt.dataset.stc;const P=stPos(C);let b=bt.dataset.stb===""?null:+bt.dataset.stb;
  const t=stZone(C,P.p,b,P.d);if(!t)return null;if(b==null){try{const r=bestAny(t,localNow());b=r.p>0?r.b:3}catch(_){b=3}}
  let mode=card.dataset.mode||"";if(!mode){try{mode=MD().s}catch(_){}}return {t:t.id,b,call:C,mode,f:card.dataset.f||""}}

/* ---------- 2.8.1: buscador libre: indicativo, frecuencia, banda, modo, programa, referencia o país, combinables ----------
   Ejemplos: “EA5RKB”, “EA5RKB/P”, “VP8/G3ABC”, “EA5*”, “*-MM” (barra), “14.074”, “14074”, “20m FT8”, “40 CW EA”, “POTA”, “US-1234”, “Japón”.
   Cada palabra se reconoce sola; si hay varias, se combinan (banda Y modo Y indicativo…). */
const QT=x=>(window.ACRACB_LANG==="en"?"\u201c":"\u00ab")+x+(window.ACRACB_LANG==="en"?"\u201d":"\u00bb");
const NOACC=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toUpperCase();
const MODEW={SSB:"SSB",LSB:"SSB",USB:"SSB",FONIA:"SSB",PHONE:"SSB",VOZ:"SSB",VOICE:"SSB",CW:"CW",MORSE:"CW",TELEGRAFIA:"CW",FT8:"FT8",FT4:"FT4",RTTY:"RTTY",PSK:"PSK",PSK31:"PSK",PSK63:"PSK",JS8:"JS8",AM:"AM",FM:"FM",SSTV:"SSTV",MSK144:"MSK144",Q65:"Q65",JT65:"JT65",FST4:"FST4",OLIVIA:"OLIVIA",DIGI:"DIGI",DIGITAL:"DIGI",DIGITALES:"DIGI",DATA:"DIGI",DV:"DV",DMR:"DV",DSTAR:"DV","D-STAR":"DV",C4FM:"DV",FREEDV:"DV"};
const DIGIS=new Set(["FT8","FT4","RTTY","PSK","JS8","MSK144","Q65","JT65","FST4","OLIVIA","SSTV","DIGI"]);
const BANDW={"160":0,"80":1,"75":1,"60":8,"40":2,"30":9,"20":3,"17":4,"15":5,"12":6,"10":7,"6":10,"2":11,"70CM":12,"70":12};
const FREQB=[[1800,2000,0],[3500,4000,1],[5250,5450,8],[7000,7300,2],[10100,10150,9],[14000,14350,3],[18068,18168,4],[21000,21450,5],[24890,24990,6],[28000,29700,7],[50000,54000,10],[144000,148000,11],[430000,440000,12]];
function bandOfK(k){const r=FREQB.find(x=>k>=x[0]&&k<=x[1]);return r?r[2]:null}
function qParse(q){const raw=String(q||"").trim();const Q={bands:new Set(),modes:new Set(),progs:new Set(),f:null,calls:[],words:[],chips:[],cont:null,age:null};
  const toks=NOACC(raw).replace(/,/g,".").replace(/(\d)\s+(M|CM|MHZ|KHZ)\b/g,"$1$2").split(/[\s;]+/).filter(Boolean);
  for(let t of toks){let m;
    if(MODEW[t]){Q.modes.add(MODEW[t]);Q.chips.push(T("modo ","mode ")+MODEW[t]);continue}
    if(PROGS.includes(t)){Q.progs.add(t);Q.chips.push(t);continue}
    if(t==="DX"){Q.progs.add("dx");Q.chips.push("DX");continue}
    if((m=t.match(/^(\d{1,3})(M|CM)$/))&&BANDW[m[2]==="CM"?m[1]+"CM":m[1]]!=null){const b=BANDW[m[2]==="CM"?m[1]+"CM":m[1]];Q.bands.add(b);Q.chips.push(T("banda ","band ")+BANDS[b]);continue}
    if((m=t.match(/^(\d+(?:\.\d+)?)(MHZ|KHZ)?$/))){const v=parseFloat(m[1]);if(!(v>0))continue;let k,tol;
      if(m[2]==="KHZ"||(!m[2]&&!m[1].includes(".")&&v>=1000)){k=v;tol=1.5}
      else if(m[1].includes(".")){const d=m[1].split(".")[1].length;k=v*1000;tol=d>=3?1.5:d===2?6:60}
      else if(!m[2]&&BANDW[m[1]]!=null&&!["1","3","5","7","14","18","21","24","28","50","144","430","432"].includes(m[1])){Q.bands.add(BANDW[m[1]]);Q.chips.push(T("banda ","band ")+BANDS[BANDW[m[1]]]);continue}
      else{k=v*1000;const b=bandOfK(k)??bandOfK(k+1);if(b!=null&&tol==null){Q.bands.add(b);Q.chips.push(T("banda ","band ")+BANDS[b]);continue}tol=1000}
      Q.f={k,tol};Q.chips.push((k/1000).toFixed(tol>=60?1:3)+" MHz");continue}
    /* indicativo (con prefijos y sufijos: EA8/DF4UE, EA5RKB/P, /MM, /QRP…), comodines * y ?, o referencia de programa (US-1234, EA5/AT-001, EAFF-0123) */
    const cl=t.replace(/[^A-Z0-9/*?\-]/g,"");if(!cl)continue;
    if(/^[A-Z0-9]{1,4}-\d{2,5}$|^[A-Z0-9]{1,3}\/[A-Z]{2}-\d{3}$|^[A-Z]{2,4}FF-\d{3,5}$/.test(cl)){Q.calls.push({ref:cl});Q.chips.push(T("referencia ","reference ")+cl);continue}
    if(/[*?]/.test(cl)){const rx=new RegExp("^"+cl.replace(/[-/]/g,"\\$&").replace(/\*/g,".*").replace(/\?/g,".")+"$");Q.calls.push({rx});Q.chips.push(QT(cl));continue}
    if(/^[A-Z]+$/.test(cl)&&cl.length>=3){Q.words.push(cl);Q.chips.push(QT(cl));continue}
    Q.calls.push({c:cl});Q.chips.push(QT(cl))}
  return (Q.bands.size||Q.modes.size||Q.progs.size||Q.f||Q.calls.length||Q.words.length)?Q:null}
const kHzOf=f=>{const v=parseFloat(f);return !isFinite(v)?NaN:v>1000?v:v*1000};
function mOK(Q,mode){if(!Q.modes.size)return true;const M=NOACC(mode);return Q.modes.has(M)||(Q.modes.has("DIGI")&&DIGIS.has(M))||(Q.modes.has("SSB")&&(M==="LSB"||M==="USB"))||(Q.modes.has("PHONE")&&["SSB","LSB","USB","AM","FM","DV"].includes(M))}
function cMatch(Q,call,ref,ent){const C=String(call||"").toUpperCase(),base=C.split("/").sort((a,b)=>b.length-a.length)[0]||C;
  const one=x=>x.ref?NOACC(ref)===x.ref:x.rx?x.rx.test(C)||x.rx.test(base):C.includes(x.c)||(x.c.includes("/")?false:base.startsWith(x.c));
  const callsOK=!Q.calls.length||Q.calls.some(one);
  const wordsOK=!Q.words.length||Q.words.every(w=>C.includes(w)||NOACC(ent).includes(w));return callsOK&&wordsOK}
function sMatch(Q,o){if(Q.bands.size&&!Q.bands.has(o.band))return false;if(!mOK(Q,o.mode))return false;
  if(Q.progs.size&&!Q.progs.has(o.prog?catOf(o):"dx"))return false;if(Q.f){const k=kHzOf(o.f);if(!isFinite(k)||Math.abs(k-Q.f.k)>Q.f.tol)return false}
  return cMatch(Q,o.call,o.ref,o.ent)}
const CONTS=[["EU","Europe","Europe"],["AF","Africa","Africa"],["AS","Asia","Asia"],["NA","North America","North America"],["SA","South America","South America"],["OC","Oceania","Oceania"],["AN","Antártida","Antarctica"]];
const contName=k=>{const n=CONTS.find(x=>x[0]===k);return n?T(n[1],n[2]):k};
function selQ(){const g=id=>{const e=$(id);return e?e.value:""};const Q=qParse($("srchq")?$("srchq").value:"")||{bands:new Set(),modes:new Set(),progs:new Set(),f:null,calls:[],words:[],chips:[],cont:null,age:null};
  const b=g("srb"),m=g("srm"),t=g("srt"),k=g("srdx"),ks=g("srcs"),a=g("sra"),en=g("srent");if(en){Q.entn=en;Q.chips.push(en)}
  if(b!==""){Q.bands=new Set([+b]);Q.chips=Q.chips.filter(x=>!/^(banda|band) /.test(x));Q.chips.push(T("banda ","band ")+BANDS[+b])}
  if(m){Q.modes=new Set([m]);Q.chips=Q.chips.filter(x=>!/^(modo|mode) /.test(x));Q.chips.push(T("modo ","mode ")+(m==="DIGI"?T("digitales","digital"):m==="PHONE"?T("fonía","phone"):m))}
  if(t){Q.progs=new Set([t]);Q.chips.push(t==="dx"?"DX":t)}
  if(k){Q.cont=k;Q.chips.push(T("DX en ","DX in ")+contName(k))}if(ks){Q.scont=ks;Q.chips.push(T("spotter en ","spotter in ")+contName(ks))}
  if(a){Q.age=+a;Q.chips.push(T(`últimos ${a} min`,`last ${a} min`))}
  const any=Q.bands.size||Q.modes.size||Q.progs.size||Q.f||Q.calls.length||Q.words.length||Q.cont||Q.scont||Q.age||Q.entn;if(!any)return null;
  /* 2.10.20: el buscador ya no tiene sus propios selectores de banda, modo y tipo: usa el filtro común (estación, clúster y mapa),
     salvo que escribas tú la banda o el modo en la búsqueda (“20m FT8”) */
  try{if(!Q.bands.size&&BSEL.size)Q.bands=new Set([...BSEL]);if(!Q.modes.size&&!allOn())Q.modes=new Set(CMS().map(k=>{const v=String(MODES[k].s).toUpperCase();return v==="JS8CALL"?"JS8":v}));
    const ALLT=["dx"].concat(PROGS);if(!Q.progs.size&&!ALLT.every(x=>TYPES.has(x)))Q.progs=new Set([...TYPES])}catch(_){}
  return Q}
/* 2.8.3: continente por posición, con las reglas DXCC habituales (Canarias y Madeira en AF, Azores en EU, Turquía asiática,
   Chipre y el Cáucaso en AS, Indonesia, Filipinas y el Pacífico en OC, Hawái en OC, Trinidad en SA…). Sirve para el DX y para el spotter. */
function contLL(p){if(!p||!isFinite(p[0])||!isFinite(p[1]))return null;let [lon,lat]=p;lon=((lon+540)%360)-180;
  if(lat<-60)return "AN";
  if(lon>165||lon<-169)return lat>=55?"AS":lat>=48?"NA":"OC";
  if(lon<=-25){if(lon>-32&&lat>35&&lat<41)return "EU";if(lat>=48&&lon<-130)return "NA";if(lon<-120&&lat<30)return "OC";if(lat<0)return "SA";if(lat<13&&(lat<7.2||lon>-77.5))return "SA";return "NA"}
  if(lon<60){if(lat<=12)return lat<-50?"AN":"AF";if(lon>=34.9&&lat<42)return "AS";if(lon>=32&&lon<34.9&&lat>=34.4&&lat<=35.8)return "AS";
    if(lat>=42){if(lon>=46.5&&lat<=51.5&&lon<60&&lat>=40.5&&!(lon<50&&lat>45))return "AS";if(lon>=40&&lat<43.6&&lon<51)return "AS";return "EU"}
    if(lon>29&&lat>=36)return "AS";if(lat>=36&&lon<-1)return "EU";if(lat>=36&&lon>=12)return "EU";
    if((lon>=14&&lon<=14.7&&lat>=35.7)||(lon>=23.4&&lon<=29&&lat>=34.8)||(lon>=12.3&&lon<=15.7&&lat>=36.6))return "EU";return "AF"}
  if(lat<-10&&lon<80)return "AF";
  if(lon>=95&&lat<=7&&!(lon<104.5&&lat>1))return "OC";if(lon>=116&&lon<=127&&lat>4.5&&lat<=21)return "OC";if(lon>=130&&lat<24)return "OC";return "AS"}
window.ACRACB_cont=contLL;
function contOf(call,dx,band){try{const e=spotEval({call,dx:dx||(window.ACRACB_areaPos&&ACRACB_areaPos(call)),band:band!=null?band:3,kind:"dx",from:[]},st.mhour);return e&&e.t?e.t.cont:null}catch(_){return null}}
function srchRun(){const box=$("srchres"),inp=$("srchq");if(!box||!inp)return;const Q=selQ();{const n=["srb","srm","srdx","srent","srcs","srt","sra"].filter(id=>$(id)&&$(id).value).length,fn=$("srfn");if(fn)fn.textContent=n?`(${n} ${n===1?T("activo","active"):T("activos","active")})`:""}const clr=$("srchx");if(clr)clr.hidden=!Q;if(!Q){box.hidden=true;box.innerHTML="";return}
  const lh=st.mhour;const out=[];
  for(const s of (L.spots||[])){const ent=(s.dxcc||"")+" "+(()=>{try{return (callEnt(s.call)||{}).name||""}catch(_){return ""}})();
    if(!sMatch(Q,{call:s.call,f:s.f,band:s.band,mode:modeOf(s),prog:null,ent}))continue;if(Q.entn&&(()=>{try{return (callEnt(s.call)||{}).name}catch(_){return ""}})()!==Q.entn)continue;const a=spotAge(s);if(Q.age&&!(a!=null&&a<=Q.age))continue;const e=spotEval(s,lh);if(Q.cont&&(s.cont||contLL(s.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(s.call)))||(e&&e.t&&e.t.cont))!==Q.cont)continue;
    if(Q.scont){const fp=Array.isArray(s.from)&&s.from[0]?s.from[0]:null;const by0=(Array.isArray(s.by)?s.by:[s.by])[0];if(contLL(fp||(by0&&window.ACRACB_areaPos&&ACRACB_areaPos(by0)))!==Q.scont)continue}out.push({a,h:spotKind(s)==="near"||!e?nearRow(s,a):dxRow(s,e,a)})}
  try{for(const o of progAll()){let ent="";try{ent=(callEnt(o.call)||{}).name||""}catch(_){}if(!sMatch(Q,{call:o.call,f:o.f,band:o.band,mode:o.mode,prog:o.prog,ref:o.ref,ent}))continue;if(Q.entn&&ent!==Q.entn)continue;if(Q.age&&!(o.a!=null&&o.a<=Q.age))continue;if(Q.cont&&(contOf(o.call,o.dx,o.band)||contLL(o.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(o.call))))!==Q.cont)continue;if(Q.scont)continue;out.push({a:o.a,h:progRow(o)})}}catch(_){}
  out.sort((x,y)=>(x.a??1e9)-(y.a??1e9));
  const onlyCall=Q.calls.filter(x=>x.c).map(x=>x.c);
  const by=onlyCall.length?(L.spots||[]).filter(s=>(Array.isArray(s.by)?s.by:[s.by]).some(b=>onlyCall.some(c=>String(b||"").toUpperCase().includes(c)))):[];
  let dxa="";try{const d=(L.dx||[]).filter(d=>onlyCall.some(c=>String(d.call||"").toUpperCase().includes(c))||Q.words.some(w=>NOACC(d.name||d.dxcc||"").includes(w)));if(d.length)dxa=`<p class="note srdx">${T("DXpedición anunciada","Announced DXpedition")}: ${d.slice(0,3).map(x=>`<b>${CS(dxTok(x.call)[0]||x.call)}</b>${x.until?` · ${T("hasta","until")} ${e2(x.until)}`:""}${x.qsx?` · QSX ${e2(x.qsx)}`:""}`).join("<br>")}</p>`}catch(_){}
  /* sin spots, al menos de qué entidad es ese indicativo o prefijo */
  let pfx="";if(onlyCall.length===1&&/\d/.test(onlyCall[0])){try{const en=callEnt(onlyCall[0]);if(en&&en.name)pfx=`<p class="note srpx">${e2(onlyCall[0])}: <b>${e2(en.name)}</b>. <button type="button" class="lnk" data-srcall="${e2(onlyCall[0])}">${T("Ver su ficha","Open its page")}</button></p>`}catch(_){}}
  const N=60,chips=`<span class="srchips">${Q.chips.map(x=>`<span class="srchip">${e2(x)}</span>`).join("")}</span>`;
  let h=`<p class="srh">${out.length?T(`${out.length} ${out.length===1?"spot reciente":"spots recientes"}`,`${out.length} recent ${out.length===1?"spot":"spots"}`):T("Ningún spot reciente coincide","No recent spot matches")} ${chips}</p>`+dxa+pfx;
  if(out.length)h+=`<div class="sgrid srgrid">${out.slice(0,N).map(x=>x.h).join("")}</div>`+(out.length>N?`<p class="note">${T(`Y ${out.length-N} más: afina la búsqueda con una banda o un modo.`,`And ${out.length-N} more: narrow it down with a band or a mode.`)}</p>`:"");
  if(by.length)h+=`<p class="note srby">${T(`${e2(onlyCall.join(", "))} ha oído a ${by.length} ${by.length===1?"station":"stations"}`,`${e2(onlyCall.join(", "))} has heard ${by.length} ${by.length===1?"station":"stations"}`)}: ${by.slice(0,12).map(s=>`${CS(s.call)} <span class="nw">${e2(s.f)}</span>`).join(" · ")}${by.length>12?" …":""}</p>`;
  box.innerHTML=h;box.hidden=false;const pb=box.querySelector("[data-srcall]");if(pb)pb.onclick=()=>{try{openCall(pb.dataset.srcall)}catch(_){}}}
function srchInit(){const sec=document.querySelector('section[data-pg="dx"]');if(!sec||$("srch"))return;const w=document.createElement("div");w.id="srch";w.className="card srch";
  w.innerHTML=`<label class="srl" for="srchq">${T("Buscar en los clústeres","Search the clusters")}</label><div class="srrow"><input id="srchq" type="search" aria-label="${T("Buscar en los clústeres","Search the clusters")}" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="60" placeholder="${T("Indicativo, frecuencia o país","Callsign, frequency or country")}"><button type="button" class="btn" id="srchx" hidden>${T("Borrar","Clear")}</button></div>
    <details class="srf" id="srf"><summary>${T("Filters","Filters")} <span class="srfh">${T("país, continente y antigüedad","country, continent and age")}</span>${""} <span class="srfn" id="srfn"></span></summary><div class="srsel">


      <label><span>${T("Continente DX","DX continent")}</span><select id="srdx"><option value="">${T("All","All")}</option>${CONTS.map(x=>`<option value="${x[0]}">${T(x[1],x[2])} (${x[0]})</option>`).join("")}</select></label>
      <label><span>${T("País DX","DX country")}</span><select id="srent"><option value="">${T("All","All")}</option></select></label>
      <label><span>${T("Oído desde","Heard from")}</span><select id="srcs"><option value="">${T("All","All")}</option>${CONTS.map(x=>`<option value="${x[0]}">${T(x[1],x[2])} (${x[0]})</option>`).join("")}</select></label>

      <label><span>${T("Antigüedad","Age")}</span><select id="sra"><option value="">${T("All","All")}</option><option value="15">${T("Últimos 15 min","Last 15 min")}</option><option value="30">${T("Últimos 30 min","Last 30 min")}</option><option value="60">${T("Última hora","Last hour")}</option></select></label>
    </div><p class="note srsrc">${T("Busca en los spots recientes del clúster DX y el RBN, en POTA, SOTA, WWFF, IOTA, LLOTA y otros programas (GMA, castillos, faros…) y en las DXpediciones anunciadas. Usa el mismo modo, las mismas bandas y los mismos tipos (DX, POTA…) que el clúster y el mapa, salvo que escribas otros en la búsqueda. En el texto, el asterisco * vale por cualquier cosa (EA8/* o */MM) y también puedes escribir banda o modo (20m FT8).","Searches recent DX cluster and RBN spots, POTA, SOTA, WWFF, IOTA, LLOTA and other programs (GMA, castles, lighthouses…) and announced DXpeditions. It uses the same mode, bands and types (DX, POTA…) as the cluster and the map, unless you type others in the search. In the text box the asterisk * matches anything (EA8/* or */MM) and you can also type a band or mode (20m FT8).")}</p></details>
    <div id="srchres" hidden aria-live="polite"></div>`;
  {const pt=sec.querySelector(":scope>.ptabs");if(pt)pt.after(w);else sec.insertBefore(w,sec.firstElementChild)}let tm=0;const inp=$("srchq"),x=$("srchx");
  inp.addEventListener("input",()=>{clearTimeout(tm);tm=setTimeout(srchRun,220)});x.onclick=()=>{inp.value="";w.querySelectorAll("select").forEach(s=>s.value="");srchRun();inp.focus()};w.querySelectorAll("select").forEach(s=>s.addEventListener("change",srchRun));
  /* 2.10.31: la lista de países se rellena con los que hay ahora en los clústeres, con cuántos spots */
  const fe=()=>{const sel=$("srent");if(!sel)return;const c=new Map();const add=call=>{let n="";try{n=(callEnt(call)||{}).name||""}catch(_){}if(n)c.set(n,(c.get(n)||0)+1)};/* mismos filtros de modo y banda que el resto: el número es lo que vas a ver */(typeof SPOTS==="function"?SPOTS():(L.spots||[])).forEach(z=>add(z.call));try{progAll().filter(o=>modeOK(o)&&(o.a==null||o.a<=60)).forEach(o=>add(o.call))}catch(_){}
    const v=sel.value,h=`<option value="">${T("All","All")}</option>`+[...c.entries()].sort((a,b)=>a[0].localeCompare(b[0],EN()?"en":"es")).map(([n,k])=>`<option value="${e2(n)}">${e2(n)} (${k})</option>`).join("");if(sel.dataset.h!==h){sel.innerHTML=h;sel.dataset.h=h;sel.value=v}};
  fe();$("srent").addEventListener("focus",fe);$("srent").addEventListener("pointerdown",fe)}
window.ACRACB_search=q=>{const i=$("srchq");if(!i)return;i.value=q||"";$("srchx").hidden=!q;srchRun()};
/* ---------- enganche ---------- */
function hook(){if(window.__hkSide)return true;if(typeof window.renderSide!=="function")return false;window.__hkSide=1;const o=window.renderSide;
  const w=function(){const r=o.apply(this,arguments);try{if(st.page==="dx"){render(st.mhour);renderNear();dxCards()}}catch(e){console.error(e)}return r};w.__cl=1;window.renderSide=w;return true}
if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},200);setTimeout(()=>clearInterval(t),15000)}
})();
/* 2.10.19: vista compacta: una tarjeta se abre y se cierra al tocarla (sin afectar a botones ni enlaces de dentro) */
document.addEventListener("click",ev=>{const t=ev.target;if(!t.closest)return;const vl=document.documentElement.classList.contains("vl");if(!document.documentElement.classList.contains("vc")&&!vl)return;
  if(t.closest("button,a,input,select,label,summary,[data-stc],.stc"))return;const c=vl?t.closest(".sc"):t.closest(".sc.ohc");if(!c)return;const y0=c.getBoundingClientRect().top;c.classList.toggle("scx");pinAt(c,y0);
  const k=scKey(c);if(k){if(c.classList.contains("scx")){SCOPEN.delete(k);SCOPEN.add(k);while(SCOPEN.size>60)SCOPEN.delete(SCOPEN.values().next().value)}else SCOPEN.delete(k)}});
/* 2.10.40: lo desplegado sigue desplegado. Los listados se redibujan solos (cada actualización, cuando llegan las fuentes
   lentas, cada minuto…) y antes cada redibujado cerraba las filas abiertas: el contenido de debajo subía y perdías el
   sitio donde leías. Ahora se recuerda qué filas tenías abiertas y se vuelven a abrir en el mismo instante, antes de pintar. */
const SCOPEN=new Set();
/* 2.10.41: la fila o tarjeta que tocas se queda donde la tocaste. Safari (iPhone y iPad) no compensa por su cuenta los
   cambios de altura de lo que hay por encima, y cualquier recolocación de la página (tarjetas que se igualan, un
   redibujado) movía la tarjeta recién abierta arriba o abajo. Durante un segundo se corrige cualquier desplazamiento;
   si tú mueves la página, se deja de corregir. */
let PINU=0;["touchstart","wheel","keydown"].forEach(e=>addEventListener(e,()=>{PINU=Date.now()},{passive:true,capture:true}));
function pinAt(c,y0){const t0=Date.now(),k=scKey(c);
  const fix=()=>{if(PINU>t0+50)return;let el=c;if(!el.isConnected&&k){el=[...document.querySelectorAll(".sc")].find(x=>scKey(x)===k)||null}if(!el)return;
    const dy=el.getBoundingClientRect().top-y0;if(Math.abs(dy)>1)window.scrollBy(0,dy)};
  requestAnimationFrame(()=>{fix();requestAnimationFrame(fix)});[120,300,600,1000].forEach(ms=>setTimeout(fix,ms))}
function scKey(c){const box=c.closest("[id]");const st=c.querySelector("[data-stc]"),cs=c.querySelector("[data-call]");
  const who=c.dataset.dxi!=null?"dx"+(st?st.dataset.stc:c.dataset.dxi):(st?st.dataset.stc:cs?cs.dataset.call:"");if(!who)return "";
  const f=c.dataset.f||((c.querySelector(".l-f,.sc-fq,.f")||{}).textContent||"").trim();return (box?box.id:"")+"|"+who+"|"+f}
try{new MutationObserver(ms=>{if(!SCOPEN.size)return;for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1)continue;
  const list=n.classList&&n.classList.contains("sc")?[n]:n.querySelectorAll?n.querySelectorAll(".sc"):[];
  for(const c of list){if(c.classList.contains("scx"))continue;const k=scKey(c);if(k&&SCOPEN.has(k))c.classList.add("scx")}}}).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
/* 2.10.20: se recuerda el último modo concreto (base de la previsión) antes de cambiar a “Todos los modos” */
(function(){const sv=()=>{const m=document.getElementById("modesel");if(m&&m.value&&m.value!=="all"){try{store.set("c_modebase",m.value)}catch(_){}}};
  document.addEventListener("focusin",ev=>{if(ev.target&&ev.target.id==="modesel")sv()},true);document.addEventListener("pointerdown",ev=>{if(ev.target&&ev.target.id==="modesel")sv()},true);setTimeout(sv,1500)})();

/* 2.11.8: “Ver N estaciones más” en los destinos despliega las que faltan */
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-ezmore]");if(!b)return;e.preventDefault();e.stopPropagation();const r=b.previousElementSibling;if(r&&r.classList.contains("ezrest"))r.hidden=false;b.remove()});

document.addEventListener("click",ev=>{const a=ev.target.closest&&ev.target.closest("[data-ctgo]");if(a){ev.preventDefault();ev.stopPropagation();try{go("concursos");selTab("concursos","c_live",true)}catch(_){}return}
  /* 2.11.77: tocar la tarjeta del concurso (en cualquier vista) lleva al calendario y marca ese concurso */
  const c=ev.target.closest&&ev.target.closest("[data-ctcal]");if(!c)return;ev.preventDefault();const n=c.dataset.ctcal;
  try{go("concursos");selTab("concursos","f_ccal",true)}catch(_){}
  setTimeout(()=>{try{const f=document.getElementById("f_ccal");if(f)f.open=true;const rows=[...(f||document).querySelectorAll("tr,li,.ccr,.calr,div")].filter(r=>r.children.length&&r.textContent.includes(n)&&r.textContent.length<400);
    const r=rows.sort((x,y)=>x.textContent.length-y.textContent.length)[0];if(r){document.querySelectorAll(".ctcalhl").forEach(z=>z.classList.remove("ctcalhl"));r.classList.add("ctcalhl");r.scrollIntoView({block:"center",behavior:"smooth"})}}catch(_){}},400)});
document.addEventListener("keydown",ev=>{if(ev.key==="Enter"&&ev.target&&ev.target.dataset&&ev.target.dataset.ctcal)ev.target.click()});

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
function start(){scan();try{new MutationObserver(ms=>{if(window.ACRACB_mut(ms))later()}).observe(document.body,{childList:true,subtree:true})}catch(e){}addEventListener("resize",window.ACRACB_rz?ACRACB_rz(later):later,{passive:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();

/* ---- ACRACB 2.1.12: tarjetas del mismo tamaño ----
   En las listas de varias columnas (clúster, actividad cercana, DXpediciones, objetivos) todas las tarjetas
   de la misma fila miden lo mismo: la altura de la más alta de esa fila.
   2.11.31: las tarjetas de estación, todas iguales en todo el grupo. En una sola columna (móvil) cada una mide lo que necesita. */
(function(){
"use strict";
const LISTS="#spots,#near,.goal,.alc,.satl,.reccards,#dxl";
const CARD=":scope>.sp,:scope>.dx,:scope>.sc";
function cols(el){const t=getComputedStyle(el).gridTemplateColumns;return t&&t!=="none"?t.trim().split(/\s+/).length:1}
/* cada apartado (DX, POTA…) se iguala por separado: un título o una nota entre tarjetas empieza un grupo nuevo */
function groups(el){const out=[];let g=[];for(const c of el.children){if(c.matches(".sp,.dx,.sc")){if(c.getClientRects().length)g.push(c)}else if(g.length){out.push(g);g=[]}}if(g.length)out.push(g);return out}
/* 2.11.95: la altura que se iguala es la de la tarjeta con sus desplegables cerrados: al abrir uno (por ejemplo “Frecuencias y
   cómo trabajarlo” en un satélite) crece solo esa tarjeta y las demás no se estiran como si se hubieran abierto también */
function hC(c){let h=c.getBoundingClientRect().height;c.querySelectorAll("details[open]").forEach(d=>{if(d.parentElement&&d.parentElement.closest("details[open]")&&d.parentElement.closest("details[open]")!==d&&c.contains(d.parentElement.closest("details[open]")))return;const sm=d.querySelector(":scope>summary");h-=d.getBoundingClientRect().height-(sm?sm.getBoundingClientRect().height:0)});return h}
function fit(){const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;document.querySelectorAll(LISTS).forEach(el=>{if(!el.getClientRects().length)return;
  const gs=groups(el);gs.flat().forEach(c=>c.style.minHeight="");if(cols(el)<2)return;
  /* 2.4.1: se igualan las tarjetas de la misma fila, no las de toda la lista: así ninguna queda medio vacía al desplegar “Mostrar más” */
  for(const cs of gs){if(cs.length<2)continue;const rows=new Map();cs.forEach(c=>{const k=Math.round(c.getBoundingClientRect().top);if(!rows.has(k))rows.set(k,[]);rows.get(k).push(c)});
    /* 2.11.31: las tarjetas de estación miden todas lo mismo, también de una fila a otra (en la vista compacta, por filas) */
    if(!document.documentElement.classList.contains("vc")&&cs.every(c=>c.matches(".sc"))){const h=Math.max(...cs.map(hC));cs.forEach(c=>c.style.minHeight=Math.ceil(h/z)+"px");continue}
    rows.forEach(r=>{if(r.length<2)return;const h=Math.max(...r.map(hC));r.forEach(c=>c.style.minHeight=Math.ceil(h/z)+"px")})}})}
let raf=0,busy=false;const later=()=>{if(raf||busy)return;raf=requestAnimationFrame(()=>{raf=0;busy=true;try{fit()}finally{busy=false}})};
function start(){fit();try{new MutationObserver(m=>{if(window.ACRACB_mut(m))later()}).observe(document.body,{childList:true,subtree:true})}catch(e){}addEventListener("resize",window.ACRACB_rz?ACRACB_rz(later):later,{passive:true});
  document.addEventListener("toggle",later,true);document.addEventListener("click",()=>setTimeout(later,60),true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();

/* ---- ACRACB 2.2: satélites de aficionado ----
   Próximos pases sobre tu locator en las próximas 24 h, calculados en tu navegador con satellite.js (MIT)
   y los elementos orbitales públicos de CelesTrak (grupo “amateur”), que se guardan 12 h en el dispositivo.
   Frecuencias y modos según SatNOGS DB; algunos satélites funcionan solo a ratos: su estado real está en amsat.org/status. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
/* 2.10.2: frecuencias estructuradas para poder calcular el Doppler de cada pase y explicar cómo configurarlo.
   Datos de SatNOGS DB (Libre Space Foundation, CC BY-SA 4.0). up/dn en Hz; tono en Hz (0 = sin tono). */
const SATS=[
 {id:25544,n:"ISS",kind:"FM",k:"fm",tx:[
   {l:["Repetidor de voz (V/U)","Voice repeater (V/U)"],up:145990000,dn:437800000,tone:67.0,m:"FM"},
   {l:["Contacto con la tripulación, Región 1 (ARISS)","Crew contact, Region 1 (ARISS)"],up:145200000,dn:145800000,tone:0,m:"FM",x:["Solo cuando la tripulación opera; escucha 145.800 y no transmitas si no te llaman.","Only when the crew is on the air; listen on 145.800 and do not transmit unless called."]},
   {l:["APRS (digipeater)","APRS (digipeater)"],up:145825000,dn:145825000,tone:0,m:"AFSK 1200"}],
  note:["El repetidor de voz y el APRS no siempre están activos: mira el estado de SatNOGS y AMSAT. Las imágenes SSTV, cuando las hay, bajan en 145.800.","The voice repeater and APRS are not always on: check SatNOGS and AMSAT status. SSTV images, when scheduled, come down on 145.800."]},
 {id:27607,n:"SO-50",kind:"FM",k:"fm",tx:[{l:["Repetidor de voz (V/U)","Voice repeater (V/U)"],up:145850000,dn:436795000,tone:67.0,m:"FM",x:["Se activa con un tono de 74,4 Hz durante 2 s; después, 67 Hz para hablar.","Armed with a 74.4 Hz tone for 2 s; then 67 Hz to talk."]}],note:["Repetidor FM sencillo, ideal para empezar con un walkie.","Simple FM repeater, ideal for a first contact with a handheld."]},
 {id:43017,n:"AO-91",kind:"FM",k:"fm",tx:[{l:["Repetidor de voz (U/V)","Voice repeater (U/V)"],up:435250000,dn:145960000,tone:0,m:"FM",x:["Según SatNOGS DB ya no necesita tono CTCSS.","According to SatNOGS DB it no longer needs a CTCSS tone."]}],note:["Funciona sobre todo con sol, por el estado de su batería.","Works mainly in sunlight because of its battery."]},
 {id:43678,n:"PO-101",kind:"FM",k:"fm",tx:[{l:["Repetidor de voz (U/V)","Voice repeater (U/V)"],up:437500000,dn:145900000,tone:141.3,m:"FM"}],note:["Solo en los horarios que anuncia su equipo.","Only on the schedules announced by its team."]},
 {id:44909,n:"RS-44",kind:T("lineal","linear"),k:"lin",tx:[{l:["Transpondedor lineal inversor (V/U)","Inverting linear transponder (V/U)"],up:145935000,uh:145995000,dn:435670000,dh:435610000,tone:0,m:"SSB/CW"}],note:["Sube en LSB y baja en USB. Baliza CW en 435.605.","LSB up, USB down. CW beacon on 435.605."]},
 {id:24278,n:"FO-29",kind:T("lineal","linear"),k:"lin",tx:[{l:["Transpondedor lineal inversor (V/U)","Inverting linear transponder (V/U)"],up:145900000,uh:146000000,dn:435900000,dh:435800000,tone:0,m:"SSB/CW"}],note:["Solo en los horarios que anuncia JARL.","Only on schedules announced by JARL."]},
 {id:7530,n:"AO-7",kind:T("lineal","linear"),k:"lin",tx:[{l:["Transpondedor modo B, inversor (U/V)","Mode B transponder, inverting (U/V)"],up:432125000,uh:432175000,dn:145975000,dh:145925000,tone:0,m:"SSB/CW"}],note:["Solo funciona con sol: su batería está agotada desde hace décadas.","Only works in sunlight: its battery died decades ago."]},
 {id:53106,n:"IO-117",kind:"digital",k:"dig",tx:[{l:["Digipeater (GreenCube)","Digipeater (GreenCube)"],up:435310000,dn:435310000,tone:0,m:"GMSK 1200"}],note:["Órbita media, pases largos. Necesita un módem y programa específicos: no se trabaja con un walkie.","Medium orbit, long passes. Needs a dedicated modem and software: not workable with a handheld."]}];
const fmt=hz=>(hz/1e6).toFixed(3);
const legacy=s=>{const t=s.tx[0];const r=(a,b,m)=>b&&b!==a?`${fmt(a)} – ${fmt(b)} ${m}`:`${fmt(a)} ${m}`;
  return {up:r(t.up,t.uh,t.m.startsWith("SSB")?"LSB/CW":t.m)+(t.tone?` (${T("tono","tone")} ${t.tone.toFixed(1)} Hz)`:""),down:r(t.dn,t.dh,t.m.startsWith("SSB")?"USB/CW":t.m)}};
SATS.forEach(x=>Object.assign(x,legacy(x)));
const TLEURL="https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle",PROXY="https://acracb-dx.ea5jnf.workers.dev/?u=";
/* 2.7.3: las órbitas se leen primero de la copia que la propia plataforma guarda dos veces al día (datos/tle-amateur.txt,
   descargada de CelesTrak); si no está, de CelesTrak directamente. 2.10.44: sin AMSAT como respaldo */
/* 2.11.28: alojada en otro servidor (por ejemplo, el de la asociación), lee la misma copia de GitHub Pages, que se sigue
   actualizando sola mientras el repositorio esté en GitHub */
const MIRROR=(()=>{try{if(!/^https?:$/.test(location.protocol))return null;return /ea5jnf\.github\.io$/.test(location.hostname)?new URL("datos/tle-amateur.txt",location.href).href:"https://ea5jnf.github.io/plataforma-dx/datos/tle-amateur.txt"}catch(e){return null}})();
/* 2.8.29: estado de cada satélite y de sus transmisores según SatNOGS DB (Libre Space Foundation, CC BY-SA 4.0),
   copiado dos veces al día en datos/satnogs.json junto a las órbitas */
let SN=null,snAsk=false;
function snLoad(){if(snAsk||!MIRROR)return;snAsk=true;fetch(MIRROR.replace("tle-amateur.txt","satnogs.json"),{credentials:"omit",referrerPolicy:"no-referrer"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&j.sats){SN=j;render()}}).catch(()=>{})}
function snTag(id){const x=SN&&SN.sats&&SN.sats[id];if(!x)return "";const act=(x.tx||[]).filter(t=>t.s==="active").length;const ok=act>0&&!/re-?entered|decayed|dead/i.test(String(x.st||""));
  return `<span class="xtag ${ok?"xq":"xs"}" title="${e2(T(`SatNOGS DB: ${act} transmisores activos`,`SatNOGS DB: ${act} active transmitters`))}">SatNOGS: ${ok?T("activo","active"):T("inactivo","inactive")}</span>`}
let REC=null,PASSES=null,calcAt=0,calcFor="",busy=false,err="",LOW=S.get("acracb_satlow")==="1";
function parse(txt){const L=String(txt||"").split(/\r?\n/).map(s=>s.trimEnd()).filter(Boolean),out={};
  for(let i=0;i+2<L.length+1;i++){if(L[i].startsWith("1 ")&&L[i+1]&&L[i+1].startsWith("2 ")){const id=+L[i].slice(2,7);out[id]=[L[i],L[i+1]];i++}}return out}
async function getTLE(){let c=null;try{c=JSON.parse(S.get("acracb_tle")||"null")}catch(e){}
  if(c&&c.t&&Date.now()-c.t<12*36e5&&c.d)return c.d;
  const tryF=async u=>{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),15000);try{const r=await fetch(u,{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);const t=await r.text();if(t.length>2e6)throw new Error("size");return t}finally{clearTimeout(tm)}};
  let d=null;for(const u of [MIRROR,TLEURL,PROXY+encodeURIComponent(TLEURL)].filter(Boolean)){try{const x=parse(await tryF(u));if(x[25544]&&Object.keys(x).length>=3){d=x;break}}catch(e){}}
  if(d){S.set("acracb_tle",JSON.stringify({t:Date.now(),d}));return d}
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
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-GB":"en-US",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
const cabS=a=>{try{return cab(a)}catch(e){return ""}};
function inT(ms){const m=Math.round(ms/6e4);if(m<1)return T("ya","now");if(m<60)return T(`en ${m} min`,`in ${m} min`);const h=Math.floor(m/60),r=m%60;return T(`en ${h} h ${r?r+" min":""}`,`in ${h} h ${r?r+" min":""}`).trim()}
/* 2.10.2: Doppler del pase: velocidad radial con satellite.js (diferencia de distancia en 1 s) y desplazamiento
   Δf = −f·v/c en la bajada; en la subida se transmite f·(1 + v/c) para que llegue a su frecuencia nominal */
const C=299792.458;const SXO=new Set();
function vr(rec,obs,t){const a=look(rec,new Date(t),obs),b=look(rec,new Date(t+1000),obs);return a&&b?(b.km-a.km):null}
function obsP(){const P=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];return {longitude:P[0]*Math.PI/180,latitude:P[1]*Math.PI/180,height:.05}}
const k3=hz=>(hz/1e6).toFixed(3),r5=hz=>Math.round(hz/5000)*5000,khz=d=>(d>0?"+":d<0?"−":"±")+Math.abs(d/1000).toFixed(1).replace(".",EN()?".":",")+" kHz";
function detail(p){const rec=REC&&REC[p.s.id];if(!rec)return "";const o=obsP();const pts=[[T("Al salir","At rise"),p.aos+15e3],[T("En lo más alto","At the top"),p.tMax],[T("Al ponerse","At set"),p.los-15e3]];
  const v=pts.map(([l,t])=>[l,vr(rec,o,t),t]);if(v.some(x=>x[1]==null))return "";
  const sn=SN&&SN.sats&&SN.sats[p.s.id];const stOf=t=>{if(!sn)return "";const m=(sn.tx||[]).find(x=>x.dl&&Math.abs(x.dl-(t.dh||t.dn))<=6000||x.dl&&Math.abs(x.dl-t.dn)<=6000);return m?`<span class="xtag ${m.s==="active"?"xq":"xs"}">SatNOGS: ${m.s==="active"?T("activo","active"):T("inactivo","inactive")}</span>`:""};
  const blocks=p.s.tx.map(t=>{const lin=!!t.uh;const fm=!lin&&/FM|AFSK/.test(t.m);const same=t.up===t.dn;
    const rowsD=v.map(([l,vv])=>{const dd=-t.dn*vv/C,du=t.up*vv/C;const rx=t.dn+dd,tx=t.up+du;
      return `<tr><th>${l}</th><td><b>${fm&&t.dn>400e6?k3(r5(rx)):k3(rx)}</b> <span class="note">${khz(dd)}</span></td><td>${same?"—":`<b>${fm&&t.up>400e6?k3(r5(tx)):k3(tx)}</b> <span class="note">${khz(du)}</span>`}</td></tr>`}).join("");
    return `<div class="satf"><h5>${e2(t.l[EN()?1:0])} ${stOf(t)}</h5>
      <dl class="sc-d"><dt>${T("Subida (tú transmites)","Uplink (you transmit)")}</dt><dd><b>${lin?`${k3(t.up)} – ${k3(t.uh)}`:k3(t.up)}</b> MHz · ${e2(lin?"LSB/CW":t.m)}</dd>
      <dt>${T("Bajada (tú escuchas)","Downlink (you listen)")}</dt><dd><b>${lin?`${k3(t.dn)} – ${k3(t.dh)}`:k3(t.dn)}</b> MHz · ${e2(lin?"USB/CW":t.m)}</dd>
      <dt>${T("Tono CTCSS","CTCSS tone")}</dt><dd>${t.tone?`<b>${t.tone.toFixed(1)} Hz</b> ${T("en la subida","on the uplink")}`:T("no hace falta","not needed")}</dd>
      <dt>${T("Desplazamiento","Offset")}</dt><dd>${same?T("ninguno: transmites y escuchas en la misma frecuencia (símplex)","none: you transmit and listen on the same frequency (simplex)"):lin?T("transpondedor inversor: si subes la frecuencia de subida, baja la de bajada","inverting transponder: raising the uplink lowers the downlink"):(t.up<300e6)===(t.dn<300e6)?T(`dúplex en la misma banda: transmites ${Math.round(Math.abs(t.dn-t.up)/1000)} kHz ${t.up<t.dn?"below":"above"} de donde escuchas`,`same-band split: you transmit ${Math.round(Math.abs(t.dn-t.up)/1000)} kHz ${t.up<t.dn?"below":"above"} where you listen`):T(`banda cruzada: subes en ${t.up<300e6?"VHF":"UHF"} and escuchas en ${t.dn<300e6?"VHF":"UHF"}`,`cross-band: up on ${t.up<300e6?"VHF":"UHF"}, down on ${t.dn<300e6?"VHF":"UHF"}`)}</dd>
      ${t.x?`<dt>${T("Ojo","Note")}</dt><dd>${e2(t.x[EN()?1:0])}</dd>`:""}</dl>
      ${lin?"":`<table class="satdop"><thead><tr><th>${T("Doppler en este pase","Doppler on this pass")}</th><th>${T("Listen on","Listen on")}</th><th>${T("Transmite en","Transmit on")}</th></tr></thead><tbody>${rowsD}</tbody></table>`}</div>`}).join("");
  const k=p.s.k;
  const how=k==="fm"?T(`<li>Programa en el walkie (o en el equipo) 3 memorias, una por fila de la tabla: en cada una, la frecuencia de escucha y la de transmisión por separado (en muchos equipos se llama “split” o “frecuencia de TX” de la memoria) y el tono si lo pide.</li><li>En UHF el Doppler llega a unos ±10 kHz: empieza en la primera memoria y pasa a la siguiente cuando la voz se oiga distorsionada. En VHF basta con la frecuencia nominal.</li><li>Antena: una directiva pequeña (tipo Arrow o Elk) apuntando al rumbo de salida y siguiéndolo; gírala sobre su eje si la señal se va. Con la antena de goma solo se oye en pases muy altos.</li><li>5 W bastan. Usa auriculares si el equipo es full dúplex, para no acoplarte.</li><li>Escucha primero. Cuando haya hueco: tu indicativo y tu locator (${e2(((document.getElementById("loc")||{}).value||"").slice(0,4))||"IM98"}), corto. Un solo QSO por pase si hay mucha gente.</li>`,
     `<li>Program 3 memories in the handheld (or rig), one per table row: each with separate receive and transmit frequencies (often called “split” or the memory’s “TX frequency”) and the tone if required.</li><li>On UHF the Doppler reaches about ±10 kHz: start on the first memory and move to the next one when the voice sounds distorted. On VHF the nominal frequency is enough.</li><li>Antenna: a small Yagi (Arrow or Elk type) aimed at the rising bearing and following it; twist it on its axis if the signal fades. With the rubber duck you will only hear very high passes.</li><li>5 W is enough. Use headphones on a full-duplex rig to avoid feedback.</li><li>Listen first. When there is a gap: your callsign and locator, briefly. Only one QSO per pass if it is busy.</li>`)
   :k==="lin"?T(`<li>Necesitas un equipo full dúplex (o dos equipos) con SSB: subes en LSB/CW y escuchas en USB/CW.</li><li>Corrige el Doppler en la frecuencia de UHF y deja fija la de VHF. Busca primero tu propia señal: transmite un tono o tu indicativo y ajusta hasta oírte limpio.</li><li>Como el transpondedor es inversor, si subes la frecuencia de subida tu señal baja en la bajada.</li><li>Una directiva para cada banda y poca potencia: no transmitas más fuerte que la baliza.</li>`,
     `<li>You need a full-duplex rig (or two rigs) with SSB: up on LSB/CW, listen on USB/CW.</li><li>Correct the Doppler on the UHF frequency and keep the VHF one fixed. Find your own signal first: send a tone or your callsign and tune until you hear yourself clearly.</li><li>As the transponder inverts, raising your uplink lowers your signal on the downlink.</li><li>A Yagi for each band and low power: never be louder than the beacon.</li>`)
   :T(`<li>Necesita un módem GMSK y un programa específico (no se trabaja con walkie). Mira la guía del satélite en AMSAT.</li>`,`<li>Needs a GMSK modem and dedicated software (not workable with a handheld). See the satellite's guide at AMSAT.</li>`);
  return `<details class="satx" data-sk="${p.s.id}-${p.aos}"${SXO.has(p.s.id+"-"+p.aos)?" open":""}><summary>${T("Frecuencias y cómo trabajarlo","Frequencies and how to work it")}</summary>${blocks}<h5>${T("Cómo hacer el QSO","How to make the QSO")}</h5><ol class="sathow">${how}</ol>
    <p class="note">${T("El Doppler se calcula para este pase y tu locator con la órbita del satélite. Las frecuencias son las de SatNOGS DB; antes de transmitir, comprueba que el satélite esté activo.","Doppler is calculated for this pass and your locator from the satellite's orbit. Frequencies are from SatNOGS DB; before transmitting, check that the satellite is active.")}</p></details>`}
function card(p){const now=Date.now(),live=p.aos<=now&&p.los>now;let cur="";
  if(live&&REC&&REC[p.s.id]){try{const P=TXP||[-0.67,38.63];const a=look(REC[p.s.id],new Date(),{longitude:P[0]*Math.PI/180,latitude:P[1]*Math.PI/180,height:.05});if(a)cur=`<span class="nw">${T("ahora","now")} ${Math.round(a.az)}° ${cabS(a.az)}, ${T("elevación","elevation")} ${Math.max(0,Math.round(a.el))}°</span>`}catch(e){}}
  const dur=Math.round((p.los-p.aos)/6e4),mx=Math.round(p.max);
  const q=mx>=45?["xr",T("pase muy alto","very high pass")]:mx>=20?["xq",T("pase bueno","good pass")]:["xs",T("pase bajo","low pass")];
  const rumbo=`<span class="nw">${T("sale","rises")} ${Math.round(p.azA)}° ${cabS(p.azA)} ·</span> <span class="nw">${T("máx.","max")} ${Math.round(p.azM)}° ${cabS(p.azM)}${p.azL!=null?" ·":""}</span>${p.azL!=null?` <span class="nw">${T("se pone","sets")} ${Math.round(p.azL)}° ${cabS(p.azL)}</span>`:""}`;
  return `<div class="sc sat${live?" live":""}"><div class="sc-h"><span class="sc-call">${e2(p.s.n)}</span><span class="sc-age">${live?`<b class="satnow">${T("EN EL AIRE","ON AIR")}</b>`:inT(p.aos-now)}</span></div>`+
   `<div class="sc-f"><b class="sc-fq">${hm(p.aos)}–${hm(p.los)}</b><span class="sc-b">UTC · ${loc(p.aos)}–${loc(p.los)} ${T("local time","local time")} · ${dur} min</span><span class="xtag ${q[0]}">${mx}° · ${q[1]}</span><span class="xtag">${e2(p.s.kind)}</span>${snTag(p.s.id)}</div>`+
   `<dl class="sc-d">${cur?`<dt>${T("Now","Now")}</dt><dd>${cur}</dd>`:""}<dt>${T("Bearing","Bearing")}</dt><dd>${rumbo}</dd></dl>${detail(p).replace('<summary>',`<summary>`).replace(/(<\/summary>)/,`$1<dl class="sc-d"><dt>${T("Subida","Uplink")}</dt><dd>${e2(p.s.up)}</dd><dt>${T("Bajada","Downlink")}</dt><dd>${e2(p.s.down)}</dd><dt>${T("Nota","Note")}</dt><dd>${e2(p.s.note[EN()?1:0])}</dd></dl>`)}</div>`}
/* 2.11.78: menos texto en Satélites: cada tarjeta enseña cuándo, cómo de alto y hacia dónde; subida, bajada, nota, Doppler
   y cómo hacer el QSO quedan en “Frecuencias, Doppler y cómo configurarlo”. Se ven los 6 próximos pases y el resto con “Ver más” */
let SATALL=false;
function render(){const box=document.getElementById("sats");if(!box)return;snLoad();
  if(typeof satellite==="undefined"){box.innerHTML=`<p class="note">${T("Los pases de satélites se calculan en la versión web de la plataforma (ea5jnf.github.io/plataforma-dx), que descarga los datos orbitales al día.","Satellite passes are calculated in the web version of the platform (ea5jnf.github.io/plataforma-dx), which downloads up-to-date orbital data.")}</p>`;return}
  if(!PASSES){box.innerHTML=`<p class="note">${err||T("Calculando los pases…","Calculating passes…")}</p>`;return}
  const list=PASSES.filter(p=>LOW||p.max>=10);const all=list.slice(0,24),sh=SATALL?all:all.slice(0,6);
  const head=`<div class="seg clseg"><span class="segl">${T("Pases","Passes")}</span><button type="button" data-satlow="0" aria-pressed="${!LOW}">${T("Desde 10°","From 10°")}</button><button type="button" data-satlow="1" aria-pressed="${LOW}">${T("All","All")}</button></div>`;
  const html=head+`<p class="note">${T("Pases sobre tu locator en las próximas 24 h: cuanto más alto, mejor se oye.","Passes over your locator in the next 24 h: the higher, the better.")}${err?" "+err:""}</p>`+
   (sh.length?`<div class="satl">${sh.map(card).join("")}</div>${all.length>sh.length||SATALL&&all.length>6?`<button type="button" class="btn llmore" data-satall>${SATALL?T("Ver menos","Show less"):T(`View ${all.length-sh.length} pases más`,`Show ${all.length-sh.length} more passes`)}</button>`:""}`:`<div class="empty">${T("Ningún pase en las próximas 24 h.","No passes in the next 24 h.")}</div>`)+
   `<details class="srcd"><summary>${T("Sources","Sources")}</summary><p class="note">${T("Elementos orbitales","Orbital elements")}: <a href="https://celestrak.org/" target="_blank" rel="noopener noreferrer" data-ext>CelesTrak</a> · ${T("cálculo","calculation")}: satellite.js (MIT) · ${T("frecuencias","frequencies")}: SatNOGS DB · ${T("estado","status")}: <a href="https://db.satnogs.org/" target="_blank" rel="noopener noreferrer" data-ext>SatNOGS DB</a>${SN&&SN.at?" ("+e2(SN.at.slice(0,10))+")":""} · ${T("estado real de cada satélite","current status of each satellite")}: <a href="https://www.amsat.org/status/" target="_blank" rel="noopener noreferrer" data-ext>AMSAT</a> · ${T("calculado a las","calculated at")} ${hm(calcAt)} UTC</p></details>`;
  if(box.dataset.h!==html){box.dataset.h=html;box.innerHTML=html;box.querySelectorAll("details.satx").forEach(d=>d.addEventListener("toggle",()=>{if(d.open)SXO.add(d.dataset.sk);else SXO.delete(d.dataset.sk)}))}
  box.querySelectorAll("[data-satall]").forEach(b=>b.onclick=()=>{SATALL=!SATALL;render()});
  box.querySelectorAll("[data-satlow]").forEach(b=>b.onclick=()=>{LOW=b.dataset.satlow==="1";S.set("acracb_satlow",LOW?"1":"0");render()})}
/* se calcula al abrir la pestaña, cada 6 h o si cambia el locator; la tarjeta se refresca cada 20 s mientras se ve */
function visible(){const d=document.getElementById("f_sat");return d&&typeof st!=="undefined"&&st.page==="dx"&&!d.classList.contains("toff")}
function tick(){if(!document.getElementById("sats"))return;const P=(typeof TXP!=="undefined"&&TXP)?TXP.join(","):"";
  if(!busy&&(!PASSES&&!err||Date.now()-calcAt>6*36e5||P!==calcFor&&calcAt)){if(visible()||!PASSES)calc()}else if(visible())render()}
window.ACRACB_sats={calc,render,getTLE,SATS,get passes(){return PASSES}};
function boot(){render();setInterval(()=>{if(!document.hidden)tick()},20000);setTimeout(tick,1500);document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest('.ptabs button,[data-pg="dx"]'))setTimeout(tick,50)},true)}
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
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-GB":"en-US",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
const kk=k=>k==="am"?T("su amanecer","their sunrise"):T("su anochecer","their sunset");
const kme=k=>k==="am"?T("tu amanecer","your sunrise"):T("tu anochecer","your sunset");
const MEMO=new Map();
function calc(p){const me=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];const t0=Math.floor(Date.now()/6e5)*6e5;const k=me.join(",")+"|"+p.join(",")+"|"+t0;
  if(MEMO.has(k))return MEMO.get(k);if(MEMO.size>300)MEMO.clear();
  const r={w:windows(me,p,t0,24),me:events(me,t0,24),dx:events(p,t0,24)};MEMO.set(k,r);return r}
/* texto corto para tarjetas (2.10.1: primero tu hora y qué coincide con qué) */
const kshort=w=>T(`${w.ka==="am"?"tu amanecer":"tu anochecer"} con su ${w.kb==="am"?"amanecer":"anochecer"}`,`your ${w.ka==="am"?"sunrise":"sunset"} with their ${w.kb==="am"?"sunrise":"sunset"}`);
function short(p){if(!p||!isFinite(p[0])||!isFinite(p[1]))return "";const r=calc(p);const now=Date.now();
  if(!r.w.length)return "";const w=r.w[0];const live=w.a<=now&&w.b>now;
  return live?T(`Common gray line <b>ahora</b>, hasta las ${loc(w.b)} (your time) · ${kshort(w)}`,`Shared greyline <b>now</b>, until ${loc(w.b)} (your time) · ${kshort(w)}`)
    :T(`Línea gris común: <b>${loc(w.a)}–${loc(w.b)}</b> your time (${hm(w.a)}–${hm(w.b)} UTC) · ${kshort(w)}`,`Shared greyline: <b>${loc(w.a)}–${loc(w.b)}</b> your time (${hm(w.a)}–${hm(w.b)} UTC) · ${kshort(w)}`)}
/* 2.10.1: bloque completo para las fichas, didáctico: una franja de 24 h para ti y otra para el destino (día, línea gris
   y noche) con los ratos comunes marcados encima de las dos, y debajo cada rato explicado con tu hora: qué te pasa a ti
   (amanece o anochece), qué le pasa a él y qué bandas aprovechar */
const seg=el=>el>HI?"d":el>=LO?"g":"n";
function strip(p,t0){let h="";for(let i=0;i<96;i++){const t=t0+i*9e5+45e4;h+=`<i class="gls-${seg(sunEl(p,t))}"></i>`}return h}
function block(p,name){if(!p||!isFinite(p[0])||!isFinite(p[1]))return "";const r=calc(p);const now=Date.now();
  const me=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];const t0=Math.floor(now/9e5)*9e5;const nm=name||T("Destination","Destination");
  const pos=t=>Math.max(0,Math.min(100,(t-t0)/(864e5)*100));
  const ov=r.w.map(x=>`<b class="glov" style="left:${pos(x.a).toFixed(2)}%;width:${Math.max(.6,pos(x.b)-pos(x.a)).toFixed(2)}%"></b>`).join("");
  const ticks=[0,6,12,18].map(k=>{const t=t0+k*36e5;return `<span style="left:${(k/24*100).toFixed(2)}%">${loc(t)}</span>`}).join("");
  const tl=`<div class="glbt" role="img" aria-label="${T("Franja de 24 horas con el día, la línea gris y la noche en tu QTH y en el destino","24-hour strip with day, greyline and night at your QTH and at the destination")}">
    <div class="glrow"><span class="gll">${T("Tú","You")}</span><div class="gls">${strip(me,t0)}${ov}</div></div>
    <div class="glrow"><span class="gll">${e2(nm)}</span><div class="gls">${strip(p,t0)}${ov}</div></div>
    <div class="glrow"><span class="gll"></span><div class="glx2">${ticks}</div></div></div>
    <p class="glleg"><span><i class="gls-d"></i>${T("day","day")}</span><span><i class="gls-g"></i>${T("gray line","greyline")}</span><span><i class="gls-n"></i>${T("noche","night")}</span><span><i class="glovk"></i>${T("los dos en línea gris a la vez","both in greyline at once")}</span></p>`;
  const sun=k=>k==="am"?"☀":"☾";
  const w=r.w.length?`<ol class="glw2">${r.w.map(x=>{const live=x.a<=now&&x.b>now;return `<li>${live?`<b class="glnow">${T("AHORA","NOW")}</b> `:""}<b>${loc(x.a)}–${loc(x.b)}</b> ${T("your time","your time")} <span class="note">(${hm(x.a)}–${hm(x.b)} UTC)</span>
      <div class="glpair"><span>${sun(x.ka)} ${T("Tú","You")}: <b>${x.ka==="am"?T("amanece","sunrise"):T("anochece","sunset")}</b></span><span class="glarr">⇄</span><span>${sun(x.kb)} ${e2(nm)}: <b>${x.kb==="am"?T("amanece","sunrise"):T("anochece","sunset")}</b></span></div></li>`}).join("")}</ol>`
    :`<p class="note">${T("En las próximas 24 h vuestras líneas grises no coinciden: no hay ningún rato en que los dos estéis a la vez entre el amanecer y el anochecer.","In the next 24 h your greylines do not overlap: there is no time when both of you are in twilight at once.")}</p>`;
  return `<div class="glb"><h4>${T("Common gray line","Shared greyline")}</h4><p class="note">${T("Cuándo estáis los dos a la vez amaneciendo o anocheciendo. En esos ratos 160, 80 y 40 m suelen dar señales mucho más fuertes de lo normal.","When both of you are at sunrise or sunset at the same time. During those times 160, 80 and 40 m usually give much stronger signals than normal.")}</p>${tl}${w}</div>`}
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
window.ACRACB_grey={sunEl,windows,events,short,block};

/* ficha de indicativo (ventana emergente) */
function posFor(call){try{const e=callEnt(call);const sp=(L.spots||[]).find(s=>String(s.call).toUpperCase()===call&&s.dx);if(sp)return [sp.dx,e];
  const d=typeof dxFor==="function"?dxFor(call):null;if(d&&isFinite(d.lon))return [[d.lon,d.lat],e];
  const t=e?TG().find(x=>x.dxcc===e.dxcc):null;return [t?[t.lon,t.lat]:null,e]}catch(e){return [null,null]}}
function hook(name,after){const K="__hkgl_"+name;if(window[K])return true;const o=window[name];if(typeof o!=="function")return false;window[K]=1;const w=function(){const r=o.apply(this,arguments);try{after.apply(this,arguments)}catch(e){}return r};w.__gl=1;window[name]=w;return true}
function boot(){let n=0;const t=setInterval(()=>{
  const a=hook("openCall",function(call){const c=String(call||"").toUpperCase().trim();const pan=document.querySelector("#cpop .cpan");if(!pan)return;const [p,e]=posFor(c);const h=block(p,e&&e.name);if(h)pan.insertAdjacentHTML("beforeend",h)});
  const b=hook("renderInfo",function(){const box=document.getElementById("info");if(!box)return;let z=null;try{z=TG().find(x=>x.id===st.zone)||TG()[0]}catch(e){}if(!z)return;const h=block([z.lon,z.lat],z.name);if(h)box.insertAdjacentHTML("beforeend",h)});
  const c=hook("renderSide",function(){if(typeof st==="undefined"||st.page!=="dx")return;document.querySelectorAll("#dxl .dx[data-dxi]").forEach(el=>{const d=(L.dx||[])[+el.dataset.dxi];if(!d||!isFinite(d.lon))return;const s=short([d.lon,d.lat]);if(!s)return;const w=el.querySelector(".w");if(w&&!w.querySelector(".glx"))w.insertAdjacentHTML("beforeend",`<br><span class="glx">${s}</span>`)})});
  if((a&&b&&c)||++n>75)clearInterval(t)},200)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.2: aviso de esporádica E en 6 m y 2 m ----
   Cada 5 minutos (6 m) y 10 minutos (2 m) se miran las recepciones WSPR de los últimos 30 minutos (base pública wspr.live)
   y los spots de los clústeres en la misma banda. 2.10.44: antes se usaba PSK Reporter, cuyas condiciones de uso no están claras.
   Un trayecto de 700 a 2300 km en 6 m (1200 a 2300 km en 2 m) es típico de un salto por esporádica E: la nube está
   en el punto medio del trayecto. Se agrupan los puntos medios por zonas de 5° y, si una zona junta trayectos de
   varias estaciones distintas, se avisa. Además se calcula si esa nube te sirve a ti: si está a 350–1150 km de tu QTH,
   te abre hacia el otro lado de la nube, al doble de distancia. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const BANDS=[{k:"6",lbl:"6 m",wb:50,cb:10,min:700,max:2300,every:5,need:3},{k:"2",lbl:"2 m",wb:144,cb:11,min:1200,max:2300,every:10,need:2}];
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
async function fetchBand(b){const q=`SELECT tx_sign,rx_sign,tx_loc,rx_loc,toUnixTimestamp(time) t FROM wspr.rx WHERE band=${b.wb} AND time>now()-1800 LIMIT 3000 FORMAT JSON`;
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),20000);const out=[];let ok=false;
  try{const r=await fetch("https://db1.wspr.live/?query="+encodeURIComponent(q),{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer",cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);const x=await r.text();if(x.length>6e6)throw new Error("size");
    const j=JSON.parse(x);(j.data||[]).forEach(d=>out.push({A:ll(d.tx_loc),B:ll(d.rx_loc),tx:d.tx_sign,rx:d.rx_sign,t:+d.t*1000,mode:"WSPR"}));ok=true}catch(e){}finally{clearTimeout(tm)}
  /* spots de los clústeres de esa banda con la posición exacta del DX (locator) y la del que lo oye */
  try{const now=Date.now();(typeof L!=="undefined"&&L.spots||[]).forEach(s=>{if(s.band!==b.cb||!s.dxp||!s.dx)return;const t=Date.parse(s.utc||"");if(!t||now-t>18e5)return;
    (s.by||[]).forEach((by,i)=>{const f=(s.from||[])[i];if(f&&(f[0]||f[1]))out.push({A:s.dx,B:f,tx:s.call,rx:by,t,mode:s.mode||""})});ok=true})}catch(e){}
  if(!ok)throw new Error("no data");return out}
function analyze(b,reps){const paths=new Map();let n=0;
  for(const at of reps||[]){n++;const A=at.A,B=at.B;if(!A||!B)continue;const d=dist(A,B);if(d<b.min||d>b.max)continue;
    const k=[String(at.tx||""),String(at.rx||"")].sort().join("|");if(paths.has(k))continue;paths.set(k,{A,B,d,M:mid(A,B),tx:at.tx,rx:at.rx,t:at.t,mode:at.mode||""})}
  
  /* nubes: puntos medios a menos de 500 km unos de otros */
  const cl=[];for(const p of paths.values()){let c=cl.find(c=>dist(c.M,p.M)<500);if(!c){c={M:p.M.slice(),ps:[],calls:new Set()};cl.push(c)}c.ps.push(p);c.calls.add(p.tx);c.calls.add(p.rx);
    c.M=[c.ps.reduce((s,q)=>s+q.M[0],0)/c.ps.length,c.ps.reduce((s,q)=>s+q.M[1],0)/c.ps.length]}
  const cells=new Map(cl.map((c,i)=>[i,c]));
  const me=(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];const out=[];
  for(const c of cells.values()){if(c.ps.length<b.need||c.calls.size<4)continue;const M=[c.ps.reduce((s,p)=>s+p.M[0],0)/c.ps.length,c.ps.reduce((s,p)=>s+p.M[1],0)/c.ps.length];
    const dm=dist(me,M),ds=c.ps.map(p=>p.d).sort((x,y)=>x-y);let you=null;
    if(dm>=350&&dm<=1150){const az=brg(me,M),far=dest(me,az,2*dm);you={az,km:Math.round(2*dm),to:placeName(far)}}
    out.push({M,name:placeName(M),n:c.ps.length,calls:c.calls.size,dmin:Math.round(ds[0]),dmax:Math.round(ds[ds.length-1]),last:Math.max(...c.ps.map(p=>p.t||0)),dm:Math.round(dm),you,ex:c.ps.slice(0,3).map(p=>`${p.tx} → ${p.rx} (${fk(p.d)} km)`)})}
  out.sort((a,b2)=>(!!b2.you-!!a.you)||b2.n-a.n);return {at:Date.now(),reports:n,paths:paths.size,clouds:out}}
async function poll(force){if(busy)return;if(document.visibilityState!=="visible"&&!force)return;busy=true;try{
  for(const b of BANDS){const s=ST[b.k];if(!force&&s&&Date.now()-s.at<b.every*6e4)continue;
    try{ST[b.k]=Object.assign(analyze(b,await fetchBand(b)),{ok:true})}catch(e){ST[b.k]={at:Date.now(),ok:false,clouds:(s&&s.clouds)||[],reports:0,paths:0}}}
  render()}finally{busy=false}}
const hm=t=>t?new Date(t).toISOString().slice(11,16):"—";
function cabS(a){try{return cab(a)}catch(e){return ""}}
function cloudCard(b,c){const where=c.name?T(`above ${e2(c.name)}`,`over ${e2(c.name)}`):`${c.M[1].toFixed(0)}°, ${c.M[0].toFixed(0)}°`;
  const you=c.you?T(`<b>Te puede abrir</b> hacia el ${cabS(c.you.az)} (bearing ${c.you.az}°), a unos ${fk(c.you.km)} km${c.you.to?`: ${e2(c.you.to)}`:""}.`,`<b>It may open for you</b> towards the ${cabS(c.you.az)} (bearing ${c.you.az}°), about ${fk(c.you.km)} km away${c.you.to?`: ${e2(c.you.to)}`:""}.`)
    :T(`La nube está a ${fk(c.dm)} km de tu QTH: queda ${c.dm<350?"demasiado cerca":"demasiado lejos"} para un salto desde aquí.`,`The cloud is ${fk(c.dm)} km from your QTH: ${c.dm<350?"too close":"too far"} for a hop from here.`);
  return `<div class="sc es${c.you?" live":""}"><div class="sc-h"><span class="sc-call">${T("Sporadic E","Sporadic E")} · ${b.lbl}</span><span class="sc-age">${T("último a las","last at")} ${hm(c.last)} UTC</span></div>`+
    `<div class="sc-f"><span class="xtag ${c.you?"xr":"xq"}">${c.you?T("te sirve","usable for you"):T("en otra zona","elsewhere")}</span><span class="sc-b">${where}</span></div>`+
    `<dl class="sc-d"><dt>${T("Para ti","For you")}</dt><dd>${you}</dd><dt>${T("Trayectos","Paths")}</dt><dd>${c.n} ${T("en 30 min","in 30 min")}, ${c.calls} ${T("stations","stations")}, ${fk(c.dmin)}–${fk(c.dmax)} km</dd><dt>${T("Ejemplos","Examples")}</dt><dd>${c.ex.map(e2).join("<br>")}</dd></dl></div>`}
function render(){const box=document.getElementById("esbox");if(!box)return;
  if(typeof fetch==="undefined"||(typeof ART!=="undefined"&&ART)){box.innerHTML=`<p class="note">${T("El aviso de esporádica E funciona en la versión web, que consulta WSPR y los clústeres.","The sporadic-E alert works in the web version, which queries WSPR and the clusters.")}</p>`;return}
  const all=BANDS.map(b=>[b,ST[b.k]]).filter(([,s])=>s);if(!all.length){box.innerHTML=`<p class="note">${T("Consultando WSPR y los clústeres…","Querying WSPR and the clusters…")}</p>`;return}
  const cl=[];all.forEach(([b,s])=>(s.clouds||[]).forEach(c=>cl.push([b,c])));
  const st2=all.map(([b,s])=>`${b.lbl}: ${s.ok?T(`${s.paths} trayectos de 700–2.300 km entre ${s.reports} recepciones`,`${s.paths} paths of 700–2,300 km out of ${s.reports} reports`):T("no response","no response")} (${hm(s.at)} UTC)`).join(" · ");
  box.innerHTML=(cl.length?`<div class="esl">${cl.map(([b,c])=>cloudCard(b,c)).join("")}</div>`:`<div class="empty">${T("Ahora no se ve esporádica E en Europa ni cerca: ningún grupo de trayectos de un salto en 6 m ni en 2 m en los últimos 30 minutos.","No sporadic E seen right now: no group of single-hop paths on 6 m or 2 m in the last 30 minutes.")}</div>`)+
    `<details class="srcd"><summary>${T("Cómo se calcula","How it is worked out")}</summary><p class="note">${T("Recepciones WSPR (wspr.live) y spots de los clústeres con locator de los últimos 30 minutos. Un trayecto de 700 a 2.300 km en 6 m (1.200 a 2.300 km en 2 m) suele ser un salto por esporádica E, con la nube en el punto medio. Se avisa cuando varias estaciones distintas coinciden en la misma zona. Te sirve si la nube está a 350–1.150 km de tu QTH.","WSPR receptions (wspr.live) and cluster spots with a locator from the last 30 minutes. A 700–2,300 km path on 6 m (1,200–2,300 km on 2 m) is usually a sporadic-E hop, with the cloud at its midpoint. An alert is shown when several different stations meet in the same area. It is usable for you if the cloud is 350–1,150 km from your QTH.")}<br>${st2}</p></details>`;
  /* aviso en “Ahora” cuando hay una nube que te sirve */
  const top=cl.find(([,c])=>c.you);let bar=document.getElementById("esbar");const sec=document.querySelector('section.page[data-pg="ahora"]');
  if(top&&sec){if(!bar){bar=document.createElement("div");bar.id="esbar";bar.className="card esbar";bar.setAttribute("role","status");sec.insertBefore(bar,sec.firstChild)}
    const [b,c]=top;bar.innerHTML=`<b>${T("Esporádica E en","Sporadic E on")} ${b.lbl}</b> · ${T(`te puede abrir hacia el ${cabS(c.you.az)} (${c.you.az}°)${c.you.to?`, ${e2(c.you.to)}`:""}`,`may open for you towards the ${cabS(c.you.az)} (${c.you.az}°)${c.you.to?`, ${e2(c.you.to)}`:""}`)} · ${c.n} ${T("trayectos en 30 min","paths in 30 min")} <button type="button" class="btn" id="esgo">${T("View","View")}</button>`;
    bar.hidden=false;const g=document.getElementById("esgo");if(g)g.onclick=()=>{try{go("ahora");selTab("ahora","f_vhf",true);const d=document.getElementById("f_vhf");if(d){d.open=true;d.scrollIntoView({behavior:"smooth",block:"start"})}}catch(e){}}}
  else if(bar)bar.hidden=true}
window.ACRACB_es={poll,render,analyze,get state(){return ST}};
function boot(){if(typeof ART!=="undefined"&&ART){const v0=document.getElementById("vhfo");if(v0&&!document.getElementById("esbox")){const h=document.createElement("div");h.className="esw";h.innerHTML=`<h3 class="esh">${T("Esporádica E ahora","Sporadic E now")}</h3><div id="esbox"></div>`;v0.parentNode.insertBefore(h,v0)}render();return}
  const v=document.getElementById("vhfo");if(v&&!document.getElementById("esbox")){const h=document.createElement("div");h.className="esw";h.innerHTML=`<h3 class="esh">${T("Esporádica E ahora","Sporadic E now")}</h3><div id="esbox"></div>`;v.parentNode.insertBefore(h,v)}
  render();setTimeout(()=>poll(false),4000);setInterval(()=>poll(false),60000);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")poll(false)})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.10.4: VHF y UHF a fondo ----
   Panel de aperturas especiales (esporádica E, tropo, aurora, TEP, dispersión meteórica y rebote lunar) con su detalle,
   mapa de esporádica E, previsión de tropo calculada con el modelo meteorológico de Open-Meteo (gratuito y sin registro),
   ventanas de dispersión meteórica según el radiante de cada lluvia, rebote lunar con la posición de la Luna calculada en
   el navegador y avisos de aperturas especiales. Todo lo que es estimación se dice como estimación. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const R=Math.PI/180,DEG=180/Math.PI;
const me=()=>(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];
const nf=(v,d)=>(+v).toFixed(d==null?0:d).replace(".",EN()?".":",");
const fk2=v=>{try{return fk(Math.round(v))}catch(e){return String(Math.round(v))}};
const cabS=a=>{try{return cab(Math.round(a))}catch(e){return ""}};
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-US":"en-US",{hour:"2-digit",minute:"2-digit",hour12:EN()?true:false})}catch(e){return ""}};
const LVT=l=>l==="g"?T("favorable","favorable"):l==="y"?T("posible","possible"):T("no ahora","not now");

/* ---------- astronomía: tiempo sidéreo, Luna (método de P. Schlyter, error ~0,1°) y radiantes ---------- */
const jd=t=>t/864e5+2440587.5;
function gmstDeg(t){const d=jd(t)-2451545;return ((280.46061837+360.98564736629*d)%360+360)%360}
function altaz(raDeg,decDeg,p,t){const ha=(gmstDeg(t)+p[0]-raDeg)*R,la=p[1]*R,de=decDeg*R;
  const alt=Math.asin(Math.sin(la)*Math.sin(de)+Math.cos(la)*Math.cos(de)*Math.cos(ha));
  const az=Math.atan2(Math.sin(ha),Math.cos(ha)*Math.sin(la)-Math.tan(de)*Math.cos(la))*DEG+180;return {el:alt*DEG,az:(az+360)%360}}
const rev=x=>((x%360)+360)%360,sd=x=>Math.sin(x*R),cd=x=>Math.cos(x*R);
function moonEq(t){const d=jd(t)-2451543.5;
  const N=rev(125.1228-0.0529538083*d),i=5.1454,w=rev(318.0634+0.1643573223*d),a=60.2666,e=0.0549,M=rev(115.3654+13.0649929509*d);
  let E=M+DEG*e*sd(M)*(1+e*cd(M));for(let k=0;k<5;k++)E=E-(E-DEG*e*sd(E)-M)/(1-e*cd(E));
  const xv=a*(cd(E)-e),yv=a*Math.sqrt(1-e*e)*sd(E),v=Math.atan2(yv,xv)*DEG;let r=Math.sqrt(xv*xv+yv*yv);
  const xh=r*(cd(N)*cd(v+w)-sd(N)*sd(v+w)*cd(i)),yh=r*(sd(N)*cd(v+w)+cd(N)*sd(v+w)*cd(i)),zh=r*(sd(v+w)*sd(i));
  let lon=Math.atan2(yh,xh)*DEG,lat=Math.atan2(zh,Math.sqrt(xh*xh+yh*yh))*DEG;
  const Ms=rev(356.0470+0.9856002585*d),ws=282.9404+4.70935e-5*d,Ls=rev(ws+Ms),Lm=rev(N+w+M),D=rev(Lm-Ls),F=rev(Lm-N);
  lon+=-1.274*sd(M-2*D)+0.658*sd(2*D)-0.186*sd(Ms)-0.059*sd(2*M-2*D)-0.057*sd(M-2*D+Ms)+0.053*sd(M+2*D)+0.046*sd(2*D-Ms)+0.041*sd(M-Ms)-0.035*sd(D)-0.031*sd(M+Ms)-0.015*sd(2*F-2*D)+0.011*sd(M-4*D);
  lat+=-0.173*sd(F-2*D)-0.055*sd(M-F-2*D)-0.046*sd(M+F-2*D)+0.033*sd(F+2*D)+0.017*sd(2*M+F);
  r+=-0.58*cd(M-2*D)-0.46*cd(2*D);
  const ecl=23.4393-3.563e-7*d;const xg=r*cd(lon)*cd(lat),yg=r*sd(lon)*cd(lat),zg=r*sd(lat);
  const xe=xg,ye=yg*cd(ecl)-zg*sd(ecl),ze=yg*sd(ecl)+zg*cd(ecl);
  return {ra:rev(Math.atan2(ye,xe)*DEG),dec:Math.atan2(ze,Math.sqrt(xe*xe+ye*ye))*DEG,r}}
function moonAt(p,t){const q=moonEq(t);const h=altaz(q.ra,q.dec,p,t);const par=Math.asin(Math.cos(h.el*R)/q.r)*DEG;const el=h.el-par,geo=q.r*6378.14;return {el,az:h.az,km:Math.sqrt(geo*geo+6371*6371-2*geo*6371*Math.sin(Math.max(-90,Math.min(90,h.el))*R)),dec:q.dec}}
/* pérdida de trayecto EME en dos sentidos con antenas isótropas: (4π)³ d⁴ / (λ² σ), σ = 0,065 · π · r_Luna² */
function emeLoss(fMHz,km){const lam=299.792458/fMHz,d=km*1e3,sig=0.065*Math.PI*Math.pow(1737.4e3,2);return 10*Math.log10(Math.pow(4*Math.PI,3)*Math.pow(d,4)/(lam*lam*sig))}

/* ---------- lluvias de meteoros: máximo, ZHR orientativa de la IMO y radiante (J2000) ---------- */
const SHOW=[["Quadrantids","Quadrantids",0,3,110,230,49],["Lyrids","Lyrids",3,22,18,271,34],["Eta Aquariids","Eta Aquariids",4,6,50,338,-1],
 ["Arietids (daytime)","Arietids (daytime)",5,7,60,44,24],["Perseids","Perseids",7,12,100,48,58],["Dracónidas","Draconids",9,8,10,262,54],
 ["Orionids","Orionids",9,21,20,95,16],["Leonids","Leonids",10,17,15,152,22],["Geminids","Geminids",11,14,150,112,33]];
function showerNow(t){const now=new Date(t);let best=null;for(const y of [now.getFullYear()-1,now.getFullYear(),now.getFullYear()+1])for(const s of SHOW){const pk=Date.UTC(y,s[2],s[3],12);const dd=(pk-t)/864e5;
  if(dd>=-2&&(!best||pk<best.pk))best={s,pk,dd}}return best}

/* ---------- esporádica E: climatología media en Europa (fracción de días con alguna apertura en 6 m) y forma diaria ---------- */
const ESM=[.05,.05,.08,.15,.6,.9,.85,.45,.15,.08,.05,.08];
/* forma diaria típica (hora solar local): dos máximos, media mañana y última hora de la tarde */
const ESH=h=>{const g=(x,m,s)=>Math.exp(-((x-m)**2)/(2*s*s));return Math.min(1,.15+.85*Math.max(g(h,10.5,2.2),.9*g(h,18.5,2.3)))};

/* ---------- tropo: Open-Meteo, niveles de presión, gradiente de refractividad ---------- */
const TPTS=(()=>{const a=[];for(const la of [35,38,41,44])for(const lo of [-9,-5,-1,3,7,11])a.push([lo,la]);return a})();
const LEV=[1000,975,950,925,900,850];
let TRO=null,troBusy=false,troErr="";
try{const c=JSON.parse(S.get("acracb_tropo")||"null");if(c&&c.at&&Date.now()-c.at<3*36e5)TRO=c}catch(e){}
function satVap(tc){return 6.112*Math.exp(17.67*tc/(tc+243.5))}
function troIdx(g){/* g: gradiente de N en N/km (normal ≈ −40) */if(g>=-40)return 0;if(g>=-157)return Math.round((-g-40)/117*7);return Math.min(10,7+Math.round((-g-157)/60*3))}
async function troFetch(){if(troBusy)return;troBusy=true;troErr="";try{
  const pts=TPTS.concat([me()]);const hv=[];LEV.forEach(l=>hv.push(`temperature_${l}hPa`,`relative_humidity_${l}hPa`,`geopotential_height_${l}hPa`));hv.push("pressure_msl");
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${pts.map(p=>p[1].toFixed(2)).join(",")}&longitude=${pts.map(p=>p[0].toFixed(2)).join(",")}&hourly=${hv.join(",")}&forecast_days=2&timezone=UTC`;
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),25000);let j;
  try{const r=await fetch(u,{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);const tx=await r.text();if(tx.length>4e6)throw new Error("size");j=JSON.parse(tx)}finally{clearTimeout(tm)}
  const arr=Array.isArray(j)?j:[j];if(arr.length!==pts.length)throw new Error("n");
  const times=(arr[0].hourly&&arr[0].hourly.time||[]).map(s=>Date.parse(s+"Z"));
  const out=arr.map((o,k)=>{const H=o.hourly||{},el=+o.elevation||0;const idx=[],grad=[],pm=H.pressure_msl||[];
    for(let i=0;i<times.length;i++){const lv=[];for(const l of LEV){const tc=H[`temperature_${l}hPa`]&&H[`temperature_${l}hPa`][i],rh=H[`relative_humidity_${l}hPa`]&&H[`relative_humidity_${l}hPa`][i],z=H[`geopotential_height_${l}hPa`]&&H[`geopotential_height_${l}hPa`][i];
        if(tc==null||rh==null||z==null||z<el+10||z>el+3000)continue;const Tk=tc+273.15,e=rh/100*satVap(tc);lv.push({z,N:77.6/Tk*(l+4810*e/Tk)})}
      lv.sort((a,b)=>a.z-b.z);let g=0;for(let q=1;q<lv.length;q++){const gg=(lv[q].N-lv[q-1].N)/((lv[q].z-lv[q-1].z)/1000);if(gg<g)g=gg}
      grad.push(Math.round(g));idx.push(lv.length>=2?troIdx(g):null)}
    return {p:pts[k],idx,grad,pm}});
  TRO={at:Date.now(),times,pts:out.slice(0,TPTS.length),meP:out[out.length-1]};S.set("acracb_tropo",JSON.stringify(TRO))}
  catch(e){troErr=T("Open-Meteo no ha respondido: se volverá a intentar al abrir de nuevo esta parte.","Open-Meteo did not respond: it will try again when you open this part.")}
  finally{troBusy=false;render()}}
function troNowI(){if(!TRO||!TRO.times)return -1;const t=Date.now();let k=-1;TRO.times.forEach((x,i)=>{if(x<=t)k=i});return k}

/* ---------- dispersión meteórica en directo: spots MSK144 de los clústeres en la última hora ----------
   2.10.44: antes se pedían las recepciones a PSK Reporter, cuyas condiciones de uso no están claras */
let MSL=null;
function msFetch(){try{if(typeof L==="undefined")return;const now=Date.now();let n=0,eu=0,b6=0,b2=0,best=null;
  for(const s of (L.spots||[])){if(!/MSK|Q65/i.test(String(s.mode||"")+" "+String(s.c||"")))continue;const t=Date.parse(s.utc||"");if(!t||now-t>36e5)continue;n++;
    if(s.band===10)b6++;else if(s.band>=11)b2++;const f=(s.from||[]).find(p=>p&&(p[0]||p[1]));if(f&&f[1]>34&&f[1]<72&&f[0]>-25&&f[0]<45)eu++;
    if(s.dx&&f){let d=0;try{d=distJS(s.dx,f)}catch(e){}if(d>=500&&d<=2300&&(!best||d>best.d))best={d,tx:s.call,rx:(s.by||[])[0]||"",f:s.f}}}
  MSL={at:now,ok:true,n,eu,b6,b2,best}}catch(e){MSL={at:Date.now(),ok:false}}}

/* ---------- estado de cada tipo de apertura ---------- */
function esState(){const st=(window.ACRACB_es&&ACRACB_es.state)||{};const cl=[];Object.entries(st).forEach(([k,s])=>(s&&s.clouds||[]).forEach(c=>cl.push([k,c])));
  const you=cl.find(([,c])=>c.you);const mo=new Date().getMonth();const sh=new Date().getUTCHours()+me()[0]/15;const clim=ESM[mo]*ESH(((sh%24)+24)%24);
  if(you)return {l:"g",t:T(`Nube en ${you[0]==="6"?"6 m":"2 m"} que te abre hacia el ${cabS(you[1].you.az)}`,`Cloud on ${you[0]==="6"?"6 m":"2 m"} opening towards the ${cabS(you[1].you.az)}`),cl,clim};
  if(cl.length)return {l:"y",t:T(`${cl.length} ${cl.length===1?"nube":"nubes"} en Europa, lejos de ti`,`${cl.length} ${cl.length===1?"cloud":"clouds"} in Europe, away from you`),cl,clim};
  return {l:clim>=.35?"y":"r",t:clim>=.35?T(`Sin nubes ahora; ${Math.round(clim*100)}% por temporada y hora`,`No clouds now; ${Math.round(clim*100)}% by season and hour`):T(`Sin nubes; poco probable (${Math.round(clim*100)}%)`,`No clouds; unlikely (${Math.round(clim*100)}%)`),cl,clim}}
function troState(){const k=troNowI();if(!TRO||k<0||!TRO.meP)return {l:"n",t:troBusy?T("Calculating…","Calculating…"):T("Abre esta parte para calcularla","Open this part to calculate it")};
  const mine=TRO.meP.idx[k];let reg=0;TRO.pts.forEach(p=>{const v=p.idx[k];if(v!=null&&v>reg)reg=v});const nx=Math.max(...TRO.meP.idx.slice(k,k+24).filter(v=>v!=null),0);
  const l=mine>=7?"g":mine>=4||reg>=7?"y":"r";
  return {l,mine,reg,nx,t:mine>=7?T("Conducto probable sobre tu zona","Duct likely over your area"):mine>=4?T("Refracción reforzada en tu zona","Enhanced refraction in your area"):reg>=7?T("Conducto en otra zona cercana","Duct in a nearby area"):T("Condiciones normales","Normal conditions")}}
function auState(){const kp=+((typeof L!=="undefined"&&L.kp)||0);let kpm=kp;try{const f=L.kpfc;if(f&&f.blocks){const b0=Date.parse(f.base+"T00:00:00Z");f.blocks.forEach((d,i)=>d.forEach((v,j)=>{const t=b0+(i*24+j*3)*36e5;if(t+3*36e5>Date.now()&&t<Date.now()+12*36e5&&v!=null)kpm=Math.max(kpm,v)}))}}catch(e){}
  const la=me()[1];const need=la<42?7:la<48?6:5;
  return {l:kp>=need?"g":kpm>=need||kp>=need-2?"y":"r",kp,kpm,need,t:kp>=need?T(`Kp ${nf(kp,1)}: aurora posible en 6 y 2 m`,`Kp ${nf(kp,1)}: aurora possible on 6 and 2 m`):T(`Kp ${nf(kp,1)}; hace falta Kp ${need} desde tu latitud`,`Kp ${nf(kp,1)}; Kp ${need} needed from your latitude`)}}
function tepState(){const now=new Date(),mo=now.getMonth(),lh=(now.getUTCHours()+me()[0]/15+24)%24;const sfi=+((typeof L!=="undefined"&&L.sfi)||0);const eq=[2,3,8,9,10].includes(mo),eve=lh>=16&&lh<=23,south=me()[1]<32;
  const l=eq&&eve&&sfi>=110?(south?"g":"y"):eq&&sfi>=100?"y":"r";
  return {l,eq,eve,sfi,south,t:!eq?T("Fuera de temporada (equinoccios)","Out of season (equinoxes)"):!eve?T("En temporada; mejor de 17 a 23 h","In season; best 17–23 h"):sfi<110?T(`En temporada, pero SFI ${sfi} es bajo`,`In season, but SFI ${sfi} is low`):T("Ventana de la tarde abierta","Evening window open")}}
function msState(){const t=Date.now(),s=showerNow(t);const lh=(new Date().getUTCHours()+me()[0]/15+24)%24;let rad=null;
  if(s){rad=altaz(s.s[5],s.s[6],me(),t)}const act=s&&Math.abs(s.dd)<=2;const morning=lh>=2&&lh<=10;
  const l=act&&rad&&rad.el>=15?"g":act||morning?"y":"r";
  return {l,s,rad,act,t:act?T(`${s.s[0]}: ${s.dd<0?"in progress":s.dd<1?"máximo hoy":"máximo en "+Math.ceil(s.dd)+" days"}`,`${s.s[1]}: ${s.dd<0?"active":s.dd<1?"peak today":"peak in "+Math.ceil(s.dd)+" days"}`):morning?T("Meteoros esporádicos: buena hora (madrugada)","Sporadic meteors: good time (early morning)"):T("Meteoros esporádicos: mejor de madrugada","Sporadic meteors: best in the early morning")}}
function emeState(){const t=Date.now(),m=moonAt(me(),t);let nxt=null;if(m.el<10){for(let k=1;k<=288;k++){const q=moonAt(me(),t+k*5*6e4);if(q.el>=10){nxt=t+k*5*6e4;break}}}
  return {l:m.el>=25?"g":m.el>=10?"y":"r",m,nxt,t:m.el>=10?T(`Luna a ${Math.round(m.el)}° de elevación, rumbo ${Math.round(m.az)}°`,`Moon at ${Math.round(m.el)}° elevation, bearing ${Math.round(m.az)}°`):nxt?T(`Luna baja; sube de 10° a las ${loc(nxt)}`,`Moon low; above 10° at ${loc(nxt)}`):T("Luna por debajo del horizonte","Moon below the horizon")}}

/* ---------- mapa base (Europa y alrededores) ---------- */
let LAND=null;
function proj(){return d3.geoEquirectangular().scale(720/(75*R)).center([7.5,47.5]).translate([360,225])}
function landSvg(pr){if(LAND)return LAND;try{const topo=JSON.parse(document.getElementById("world").textContent);const land=topojson.feature(topo,topo.objects.countries||topo.objects.land);const pa=d3.geoPath(pr);
  const fix=g=>{if(!g)return g;const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];polys.forEach(q=>{if(d3.geoArea({type:"Polygon",coordinates:q})>2*Math.PI)q.forEach(r=>r.reverse())});return g};
  LAND=(land.features||[land]).map(f=>{fix(f.geometry);const d=pa(f);return d?`<path d="${d}" class="vland"/>`:""}).join("")}catch(e){LAND=""}return LAND}
const canMap=()=>typeof d3!=="undefined"&&typeof topojson!=="undefined";

/* ---------- partes ---------- */
function esPart(es){const me0=me();let map="";
  if(canMap()){const pr=proj(),P=pr(me0);let ring="";
    try{const c1=d3.geoCircle().center(me0).radius(1000/111.2)(),c2=d3.geoCircle().center(me0).radius(2200/111.2)();const pa=d3.geoPath(pr);ring=`<path d="${pa(c2)}" class="vring2"/><path d="${pa(c1)}" class="vring1"/>`}catch(e){}
    let cl="";es.cl.forEach(([k,c])=>{const q=pr(c.M);if(!q)return;cl+=`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${Math.min(22,7+c.n)}" class="vcl${c.you?" you":""}"><title>${e2(c.name||"")} · ${k==="6"?"6 m":"2 m"} · ${c.n}</title></circle>`;
      if(c.you&&P){const far=pr(c.you.far||c.M);}});
    let sp="";try{(L.spots||[]).filter(s=>(s.band===10||s.band===11)&&s.dx&&s.from&&s.from[0]).filter(s=>{const a=spotAge(s);return a==null||a<=60}).forEach(s=>{let d=0;try{d=distJS(s.from[0],s.dx)}catch(e){}if(d<700)return;const a=pr(s.from[0]),b=pr(s.dx);if(a&&b)sp+=`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" class="vsp" stroke="${BC[s.band]}"><title>${e2(s.call)} ${e2(s.f)}</title></line>`})}catch(e){}
    map=`<div class="vmap"><svg viewBox="0 0 720 450" role="img" aria-label="${T("Mapa de esporádica E","Sporadic E map")}">${landSvg(pr)}${ring}${sp}${cl}${P?`<rect x="${(P[0]-5).toFixed(1)}" y="${(P[1]-5).toFixed(1)}" width="10" height="10" class="vme"/>`:""}</svg></div>
     <p class="vleg"><span><i class="k-ring"></i>${T("donde te llega un salto de Es (1.000–2.200 km)","where one Es hop reaches you (1,000–2,200 km)")}</span><span><i class="k-cl"></i>${T("nube vista ahora (PSK Reporter)","cloud seen now (PSK Reporter)")}</span><span><i class="k-you"></i>${T("nube que te sirve","cloud usable for you")}</span><span><i class="k-sp"></i>${T("spot del clúster de 6 o 2 m a más de 700 km","6 or 2 m cluster spot over 700 km")}</span></p>`}
  const mo=new Date().getMonth();const bars=Array.from({length:24},(_,h)=>{const v=ESM[mo]*ESH((h-me()[0]/15+24)%24+me()[0]/15-me()[0]/15);return v});
  /* barras en hora local del dispositivo: se convierte la hora solar del QTH a hora local */
  const off=-new Date().getTimezoneOffset()/60;const solar=h=>((h-off+me()[0]/15)%24+24)%24;
  const bh=Array.from({length:24},(_,h)=>ESM[mo]*ESH(solar(h)));const mx=Math.max(...bh,.01);const nowH=new Date().getHours();
  const chart=`<div class="vbars" role="img" aria-label="${T("Probabilidad de esporádica E por hora","Sporadic E chance by hour")}">${bh.map((v,h)=>`<i class="${h===nowH?"now":""}" style="height:${Math.max(4,Math.round(v/mx*100))}%" title="${String(h).padStart(2,"0")}:00 · ${Math.round(v*100)}%"></i>`).join("")}</div><div class="vbx"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>`;
  return `<p>${T(`Lo que se ve ahora y dónde puede abrir. El anillo marca hasta dónde llega un salto de esporádica E desde tu QTH; las nubes salen de las recepciones WSPR y de los spots con locator de los últimos 30 minutos, y las líneas, de los spots del clúster de la última hora.`,`What is seen now and where it may open. The ring shows how far a sporadic E hop reaches from your QTH; clouds come from WSPR receptions and spots with a locator in the last 30 minutes, and lines from cluster spots in the last hour.`)}</p>${map}
   <h5>${T("Previsión por hora para hoy (climatología)","Hourly outlook for today (climatology)")}</h5>${chart}
   <p class="note">${T(`En ${["January","February","March","April","May","June","July","August","September","October","November","December"][mo]}, alguna apertura de 6 m en Europa se da en torno al ${Math.round(ESM[mo]*100)}% de los días, con dos máximos: media mañana y última hora de la tarde. En 2 m es mucho más rara: solo con nubes muy intensas. Es una estadística, no una previsión del día: lo que manda es lo que se ve ahora en el mapa.`,`In ${["January","February","March","April","May","June","July","August","September","October","November","December"][mo]}, some 6 m opening in Europe happens on about ${Math.round(ESM[mo]*100)}% of days, with two peaks: mid-morning and late afternoon. On 2 m it is much rarer: only with very intense clouds. It is a statistic, not a forecast for the day: what counts is what the map shows now.`)}</p>
   <p class="note">${T("Frecuencias: 6 m FT8 50.313, SSB 50.150; 2 m FT8 144.174, SSB 144.300.","Frequencies: 6 m FT8 50.313, SSB 50.150; 2 m FT8 144.174, SSB 144.300.")}</p>`}

let TROH=0;
function troPart(ts){if(!TRO){return `<p class="note">${troErr||(troBusy?T("Pidiendo al modelo meteorológico los datos de las próximas 48 horas…","Asking the weather model for the next 48 hours…"):T("Se calcula al abrir esta parte.","It is calculated when you open this part."))}</p>`}
  const k0=Math.max(0,troNowI()),k=Math.min(TRO.times.length-1,k0+TROH);const col=v=>v==null?"transparent":v>=8?"#d946ef":v>=7?"#ef4444":v>=5?"#f97316":v>=3?"#eab308":v>=1?"#84cc16":"#1f2937";
  let map="";if(canMap()){const pr=proj();let cells="";TRO.pts.forEach(p=>{const a=pr([p.p[0]-2,p.p[1]+1.5]),b=pr([p.p[0]+2,p.p[1]-1.5]);if(!a||!b)return;const v=p.idx[k];cells+=`<rect x="${a[0].toFixed(1)}" y="${a[1].toFixed(1)}" width="${(b[0]-a[0]).toFixed(1)}" height="${(b[1]-a[1]).toFixed(1)}" fill="${col(v)}" class="vtc"><title>${p.p[1]}° N ${p.p[0]}° · ${v==null?"—":v+"/10"} · ${p.grad[k]} N/km</title></rect>`});
    const P=pr(me());map=`<div class="vmap"><svg viewBox="0 0 720 450" role="img" aria-label="${T("Mapa de conductos troposféricos","Tropospheric duct map")}">${cells}${landSvg(pr)}${P?`<rect x="${(P[0]-5).toFixed(1)}" y="${(P[1]-5).toFixed(1)}" width="10" height="10" class="vme"/>`:""}</svg></div>`}
  const steps=[[0,T("Now","Now")],[6,"+6 h"],[12,"+12 h"],[24,"+24 h"],[36,"+36 h"]].filter(([d])=>k0+d<TRO.times.length);
  const seg=`<div class="seg vtseg" role="group" aria-label="${T("Hora del mapa","Map time")}">${steps.map(([d,l])=>`<button type="button" data-troh="${d}" aria-pressed="${TROH===d}">${l}</button>`).join("")}</div>`;
  const mi=TRO.meP.idx;const bars=TRO.times.map((t,i)=>i<k0?"":`<i style="height:${Math.max(6,((mi[i]||0)/10)*100)}%;background:${col(mi[i])}" title="${loc(t)} · ${mi[i]==null?"—":mi[i]+"/10"}"${i===k?' class="now"':""}></i>`).join("");
  const pm=TRO.meP.pm&&TRO.meP.pm[k0];
  const v=ts.mine;const txt=v>=7?T("Conducto probable: en 2 m y 70 cm se puede pasar de los cientos de kilómetros a 800–1.500 km, sobre todo sobre el mar (Baleares, Italia, norte de África).","Duct likely: on 2 m and 70 cm you can go from a few hundred km to 800–1,500 km, especially over the sea (Balearics, Italy, North Africa).")
    :v>=4?T("Refracción reforzada: el alcance habitual en 2 m y 70 cm puede crecer un 30–50%.","Enhanced refraction: your usual 2 m and 70 cm range may grow 30–50%.")
    :T("Condiciones normales: alcance habitual por dispersión troposférica.","Normal conditions: usual troposcatter range.");
  return `<p>${T("Índice de 0 a 10 calculado con la temperatura y la humedad del modelo meteorológico en varios niveles: cuanto más rápido baja la refractividad con la altura, más se curvan las señales de VHF y UHF hacia el suelo. Desde 7, conducto probable.","Index from 0 to 10 worked out from the weather model's temperature and humidity at several levels: the faster refractivity drops with height, the more VHF and UHF signals bend back to the ground. From 7, a duct is likely.")}</p>
   ${seg}${map}<p class="vleg">${[[0,"0"],[1,"1–2"],[3,"3–4"],[5,"5–6"],[7,"7"],[8,"8–10"]].map(([x,l])=>`<span><i style="background:${col(x)}"></i>${l}</span>`).join("")}</p>
   <h5>${T("Tu zona en las próximas 48 horas","Your area over the next 48 hours")}</h5><div class="vbars vtro">${bars}</div>
   <p><b>${T("Para 2 m y 70 cm","For 2 m and 70 cm")}:</b> ${txt}${pm?T(` Presión en tu zona: ${Math.round(pm)} hPa${pm>=1020?" (anticiclón: favorece las inversiones)":""}.`,` Pressure in your area: ${Math.round(pm)} hPa${pm>=1020?" (high pressure: favors inversions)":""}.`):""}</p>
   <p class="note">${T("Condiciones que favorecen la tropo: anticiclón estable, noches en calma, aire cálido sobre el mar más fresco y madrugadas con niebla o calima. Estimación propia con datos de <a href=\"https://open-meteo.com/\" target=\"_blank\" rel=\"noopener noreferrer\" data-ext>Open-Meteo</a> (CC BY 4.0); con la resolución vertical del modelo, los conductos muy finos pueden no verse.","Conditions that favor tropo: stable high pressure, calm nights, warm air over a cooler sea and mornings with fog or haze. Own estimate with data from <a href=\"https://open-meteo.com/\" target=\"_blank\" rel=\"noopener noreferrer\" data-ext>Open-Meteo</a> (CC BY 4.0); with the model's vertical resolution, very thin ducts may not show.")} ${T("Data from","Data from")} ${loc(TRO.at)}.</p>`}

function auPart(a){return `<p>${T(`Con tormentas geomagnéticas fuertes el óvalo auroral baja hacia el sur y su ionización dispersa las señales de 6 y 2 m: se oyen ásperas, como un susurro, y hay que apuntar al norte. Desde tu latitud (${nf(me()[1],1)}° N) hace falta un Kp de al menos ${a.need}.`,`During strong geomagnetic storms the auroral oval moves south and its ionization scatters 6 and 2 m signals: they sound rough, like a whisper, and you must aim north. From your latitude (${nf(me()[1],1)}° N) you need a Kp of at least ${a.need}.`)}</p>
  <dl class="sc-d"><dt>Kp</dt><dd><b>${nf(a.kp,1)}</b> ${T("ahora","now")} · ${T("máximo previsto en 12 h","max forecast in 12 h")}: <b>${nf(a.kpm,1)}</b></dd>${typeof L!=="undefined"&&L.space&&L.space.aurora?`<dt>OVATION</dt><dd>${e2(window.ACRACB_tx?ACRACB_tx(L.space.aurora):L.space.aurora)}</dd>`:""}</dl>
  <p class="note">${T("Modo: CW o SSB con mucha voz; FT8 apenas funciona por la distorsión. Fuente: NOAA SWPC.","Mode: CW or SSB with clear speech; FT8 barely works because of the distortion. Source: NOAA SWPC.")}</p>`}
function tepPart(t){return `<p>${T("La propagación transecuatorial (TEP) une estaciones a ambos lados del ecuador magnético, a 5.000–8.000 km, sobre todo en 6 m, al atardecer y cerca de los equinoccios, con flujo solar alto. Desde la Península es poco frecuente (estamos al límite norte); desde Canarias, mucho más.","Transequatorial propagation (TEP) links stations on both sides of the magnetic equator, 5,000–8,000 km apart, mostly on 6 m, in the evening and near the equinoxes, with high solar flux. From the Iberian Peninsula it is uncommon (we are at the northern edge); from the Canaries, much more frequent.")}</p>
  <dl class="sc-d"><dt>${T("Temporada","Season")}</dt><dd>${t.eq?T("sí (marzo–abril o septiembre–noviembre)","yes (March–April or September–November)"):T("no","no")}</dd><dt>${T("Time","Time")}</dt><dd>${t.eve?T("dentro de la ventana de 17 a 23 h","within the 17–23 h window"):T("fuera de la ventana de 17 a 23 h","outside the 17–23 h window")}</dd><dt>SFI</dt><dd>${t.sfi}${t.sfi>=110?"":" "+T("(conviene más de 110)","(above 110 is better)")}</dd><dt>${T("Hacia","Towards")}</dt><dd>${T("sur de África y Sudamérica (rumbos 160–220°)","southern Africa and South America (bearings 160–220°)")}</dd></dl>
  <p class="note">${T("Estimación por temporada, hora y flujo solar: la confirmación son los spots de 6 m a más de 5.000 km en el clúster.","Estimate by season, time and solar flux: the confirmation is 6 m spots over 5,000 km on the cluster.")}</p>`}
function msPart(m){const t=Date.now();const s=m.s;const dirs=[[0,"N–S"],[45,"NE–SO"],[90,"E–O"],[135,"SE–NO"]];
  const hrs=Array.from({length:24},(_,i)=>t+i*36e5);let tbl="";
  if(s){const rows=dirs.map(([az,l])=>{const cells=hrs.map(x=>{const r=altaz(s.s[5],s.s[6],me(),x);const sc=r.el<=0?0:Math.sin(r.el*R)*Math.abs(Math.sin((r.az-az)*R));return `<i class="${sc>=.55?"g":sc>=.3?"y":"n"}" title="${loc(x)} · ${T("radiante","radiant")} ${Math.round(r.el)}°"></i>`}).join("");return `<div class="vmrow"><span>${EN()?l.replace("SO","SW").replace("–O","–W").replace("NO","NW"):l}</span><div class="vmcells">${cells}</div></div>`}).join("");
    const elr=hrs.map(x=>{const r=altaz(s.s[5],s.s[6],me(),x);return `<i style="height:${Math.max(0,Math.round(r.el/90*100))}%" title="${loc(x)} · ${Math.round(r.el)}°"></i>`}).join("");
    tbl=`<h5>${T(`Radiante de las ${s.s[0]} en las próximas 24 h`,`${s.s[1]} radiant over the next 24 h`)}</h5><div class="vbars vrad">${elr}</div><div class="vbx"><span>${loc(hrs[0])}</span><span>+6 h</span><span>+12 h</span><span>+18 h</span><span>+23 h</span></div>
     <h5>${T("Mejores horas según la dirección del enlace","Best hours by path direction")}</h5><div class="vmgrid">${rows}</div>
     <p class="vleg"><span><i class="g"></i>${T("buena geometría","good geometry")}</span><span><i class="y"></i>${T("fair","fair")}</span><span><i class="n"></i>${T("mala o radiante bajo el horizonte","poor or radiant below the horizon")}</span></p>`}
  const live=MSL?MSL.ok?T(`En la última hora, los clústeres anunciaron <b>${MSL.n}</b> ${MSL.n===1?"station":"stations"} en MSK144 o Q65 (${MSL.b6} en 6 m y ${MSL.b2} en 2 m o más; ${MSL.eu} heard from Europe)${MSL.best?`; la más larga, ${e2(MSL.best.tx)} → ${e2(MSL.best.rx)} a ${fk2(MSL.best.d)} km`:""}.`,`In the last hour the clusters reported <b>${MSL.n}</b> ${MSL.n===1?"station":"stations"} on MSK144 or Q65 (${MSL.b6} on 6 m and ${MSL.b2} on 2 m or above; ${MSL.eu} heard from Europe)${MSL.best?`; the longest, ${e2(MSL.best.tx)} → ${e2(MSL.best.rx)} at ${fk2(MSL.best.d)} km`:""}.`):T("No se han podido leer los spots del clúster.","The cluster spots could not be read."):T("Consultando la actividad en MSK144…","Checking MSK144 activity…");
  return `<p>${T("Las estelas ionizadas de los meteoros, a unos 100 km de altura, reflejan 6 y 2 m durante fracciones de segundo: permiten contactos de 800 a 2.200 km con MSK144 (50.280 and 144.360) o con FT8. Fuera de las lluvias siempre hay meteoros esporádicos, con su máximo de madrugada.","The ionized trails of meteors, about 100 km up, reflect 6 and 2 m for fractions of a second: they allow 800–2,200 km contacts with MSK144 (50.280 and 144.360) or FT8. Outside showers there are always sporadic meteors, peaking in the early morning.")}</p>
   ${s?`<dl class="sc-d"><dt>${T("Lluvia","Shower")}</dt><dd><b>${EN()?s.s[1]:s.s[0]}</b> · ${T("máximo el","peak on")} ${new Date(s.pk).toLocaleDateString(EN()?"en-US":"en-US",{day:"numeric",month:"long"})} · ${T("about","about")} ${s.s[4]} ${T("meteoros por hora (ZHR, IMO)","meteors per hour (ZHR, IMO)")}</dd><dt>${T("Radiante ahora","Radiant now")}</dt><dd>${Math.round(m.rad.el)}° ${T("de elevación","elevation")}, ${T("rumbo","bearing")} ${Math.round(m.rad.az)}° ${cabS(m.rad.az)}</dd></dl>`:""}
   ${tbl}<h5>${T("Actividad ahora","Activity now")}</h5><p>${live}</p>
   <p class="note">${T("La geometría es orientativa: un enlace funciona mejor cuando el radiante está alto y su rumbo queda de lado respecto a la dirección del enlace. Radiantes y ZHR de la IMO; posición calculada para tu QTH.","Geometry is a guide: a path works best when the radiant is high and its bearing is side-on to the path direction. Radiants and ZHR from the IMO; position calculated for your QTH.")}</p>`}
function emePart(e){const t=Date.now(),m=e.m;const L144=emeLoss(144.2,m.km),L432=emeLoss(432.1,m.km),L1296=emeLoss(1296.1,m.km);const dMean=emeLoss(144.2,384400);
  const win=[];let cur=null;for(let k=0;k<=288;k++){const x=t+k*5*6e4,q=moonAt(me(),x);if(q.el>=10){if(!cur)cur={a:x,mx:q.el,tm:x};if(q.el>cur.mx){cur.mx=q.el;cur.tm=x}}else if(cur){cur.b=x;win.push(cur);cur=null}}if(cur){cur.b=t+24*36e5;win.push(cur)}
  const REG=[[T("Europa central","Central Europe"),[13.4,52.5]],[T("Norteamérica este","Eastern North America"),[-74,40.7]],[T("Japón","Japan"),[139.7,35.7]],[T("Australia este","Eastern Australia"),[151.2,-33.9]]];
  const mut=REG.map(([n,p])=>{let a=null,b=null,tot=0;for(let k=0;k<=288;k++){const x=t+k*5*6e4;const ok=moonAt(me(),x).el>=10&&moonAt(p,x).el>=10;if(ok){tot+=5;if(a==null)a=x;b=x}}return `<li><b>${n}</b>: ${tot?T(`unas ${Math.round(tot/60*10)/10} h en común, de ${loc(a)} a ${loc(b)}`,`about ${Math.round(tot/60*10)/10} h in common, ${loc(a)} to ${loc(b)}`):T("sin Luna común en 24 h","no common Moon in 24 h")}</li>`}).join("");
  return `<p>${T("En rebote lunar la señal va a la Luna y vuelve: hacen falta antenas directivas, potencia y modos digitales como JT65 o Q65. Lo que manda es que la Luna esté alta para los dos extremos y lo cerca que esté de la Tierra.","In moonbounce the signal goes to the Moon and back: you need directional antennas, power and digital modes such as JT65 or Q65. What matters is the Moon being high for both ends and how close it is to Earth.")}</p>
  <dl class="sc-d"><dt>${T("Luna ahora","Moon now")}</dt><dd>${T("elevación","elevation")} <b>${Math.round(m.el)}°</b>, ${T("rumbo","bearing")} <b>${Math.round(m.az)}° ${cabS(m.az)}</b>, ${T("declinación","declination")} ${nf(m.dec,1)}°</dd>
  <dt>${T("Distancia Tierra-Luna","Earth–Moon distance")}</dt><dd><b>${fk2(m.km)} km</b> (${m.km<370000?T("cerca del perigeo: mejor","near perigee: better"):m.km>400000?T("cerca del apogeo: peor","near apogee: worse"):T("distancia media","average distance")})</dd>
  <dt>${T("Pérdida del trayecto","Path loss")}</dt><dd>144 MHz: <b>${nf(L144,1)} dB</b> · 432 MHz: <b>${nf(L432,1)} dB</b> · 1.296 MHz: <b>${nf(L1296,1)} dB</b> <span class="note">(${L144-dMean>=0?"+":""}${nf(L144-dMean,1)} dB ${T("frente a la distancia media","vs. average distance")})</span></dd></dl>
  <h5>${T("Ventanas en tu QTH (Luna por encima de 10°)","Windows at your QTH (Moon above 10°)")}</h5>${win.length?`<ul class="vwin">${win.map(w=>`<li><b>${loc(w.a)}–${loc(w.b)}</b> · ${T("máxima","max")} ${Math.round(w.mx)}° ${T("at","at")} ${loc(w.tm)}</li>`).join("")}</ul>`:`<p class="note">${T("Sin Luna por encima de 10° en las próximas 24 h.","No Moon above 10° in the next 24 h.")}</p>`}
  <h5>${T("Luna común con otras zonas (24 h)","Common Moon with other areas (24 h)")}</h5><ul class="vwin">${mut}</ul>
  <p class="note">${T("Posición de la Luna calculada en el navegador (error de unas décimas de grado). Pérdida para dos sentidos con antenas isótropas y una reflectividad lunar del 6,5%; no incluye el ruido del cielo ni la rotación de Faraday.","Moon position calculated in the browser (error of a few tenths of a degree). Two-way loss with isotropic antennas and 6.5% lunar reflectivity; it does not include sky noise or Faraday rotation.")}</p>`}

/* ---------- avisos de aperturas especiales ---------- */
const AK=[["es6",T("Esporádica E en 6 m que te sirva","6 m sporadic E usable for you")],["es2",T("Esporádica E en 2 m que te sirva","2 m sporadic E usable for you")],["tro",T("Tropo en tu zona (índice 7 o más)","Tropo in your area (index 7 or more)")],["au",T("Aurora en VHF desde tu latitud","VHF aurora from your latitude")],["ms",T("Máximo de una lluvia de meteoros","Meteor shower peak")]];
let AL=new Set();try{AL=new Set(JSON.parse(S.get("acracb_vuhfal")||"[]"))}catch(e){}
function alertPart(){const on=window.ACRACB_notifOn&&ACRACB_notifOn();const lc=((document.getElementById("loc")||{}).value||"").slice(0,6);
  return `<p>${T(`Elige qué aperturas quieres que te avisen. Se calculan para tu locator (<b>${e2(lc)}</b>) y las bandas que marques.`,`Choose which openings you want to be alerted about. They are worked out for your locator (<b>${e2(lc)}</b>) and the bands you tick.`)}</p>
   <div class="valk">${AK.map(([k,n])=>`<label><input type="checkbox" data-val="${k}"${AL.has(k)?" checked":""}> ${n}</label>`).join("")}</div>
   <p class="note">${on?T("Las notificaciones están activadas: el aviso llega mientras la plataforma esté abierta o instalada como app.","Notifications are on: the alert arrives while the platform is open or installed as an app."):T("Para recibirlos, activa antes las notificaciones en DX › Avisos.","To receive them, first turn on notifications in DX › Alerts.")}</p>`}
function checkAlerts(st){if(!AL.size||!(window.ACRACB_notifOn&&ACRACB_notifOn())||!window.ACRACB_notify)return;let seen={};try{seen=JSON.parse(S.get("acracb_vuhfseen")||"{}")}catch(e){}
  const now=Date.now();const fire=(k,ti,bo)=>{if(seen[k]&&now-seen[k]<6*36e5)return;seen[k]=now;S.set("acracb_vuhfseen",JSON.stringify(seen));try{ACRACB_notify(ti,bo,"acracb-vuhf-"+k)}catch(e){}};
  const es=st.es;es.cl.filter(([,c])=>c.you).forEach(([b,c])=>{if(AL.has(b==="6"?"es6":"es2"))fire((b==="6"?"es6":"es2")+Math.round(c.you.az/30),T(`Esporádica E en ${b==="6"?"6 m":"2 m"}`,`Sporadic E on ${b==="6"?"6 m":"2 m"}`),T(`Te puede abrir hacia el ${cabS(c.you.az)} (${c.you.az}°)${c.you.to?", "+c.you.to:""}.`,`May open towards the ${cabS(c.you.az)} (${c.you.az}°)${c.you.to?", "+c.you.to:""}.`))});
  if(AL.has("tro")&&st.tro.mine>=7)fire("tro",T("Tropo en tu zona","Tropo in your area"),T(`Índice ${st.tro.mine}/10: 2 m y 70 cm pueden llegar lejos.`,`Index ${st.tro.mine}/10: 2 m and 70 cm may reach far.`));
  if(AL.has("au")&&st.au.l==="g")fire("au",T("Aurora en VHF","VHF aurora"),T(`Kp ${nf(st.au.kp,1)}: apunta al norte en 6 y 2 m.`,`Kp ${nf(st.au.kp,1)}: aim north on 6 and 2 m.`));
  if(AL.has("ms")&&st.ms.act&&st.ms.s&&Math.abs(st.ms.s.dd)<1)fire("ms"+st.ms.s.s[0],T(`Máximo de las ${st.ms.s.s[0]}`,`${st.ms.s.s[1]} peak`),T("Buen momento para dispersión meteórica en 6 y 2 m (MSK144).","Good time for meteor scatter on 6 and 2 m (MSK144)."))}

/* ---------- pintar ---------- */
let OPEN=new Set();try{OPEN=new Set(JSON.parse(S.get("acracb_vuhfopen")||"[]"))}catch(e){}if(OPEN.size>1)OPEN=new Set([[...OPEN][0]]);
/* 2.11.92: el panel dice lo mismo que las líneas de 6 m, 2 m y 70 cm: si los spots muestran una apertura (E esporádica,
   tropo o 6 m a larga distancia), la ficha de ese fenómeno lo refleja aunque la previsión no la esperase */
function obsUp(S){const R={g:2,y:1};const up=(k,l,t)=>{const o=S[k];if(!o)return;if((R[l]||0)>(R[o.l]||0)){o.l=l;o.t=t;o.obs=1}};
  try{if(typeof vhfStatus!=="function")return S;[[10,"6 m"],[11,"2 m"],[12,"70 cm"]].forEach(([b,n])=>{const v=vhfStatus(b);if(!v)return;const lv=v[0],tx=String(v[1]||"");
    if(/E esporádica/i.test(tx)&&!/Temporada/i.test(tx)){up("es",lv,T(`Spots de esporádica E en ${n} ahora`,`Sporadic E spots on ${n} now`));if(lv==="g")(S.es.obsB=S.es.obsB||[]).push(n)}
    else if(/tropo/i.test(tx))up("tro",lv,T(`${n}: ${lv==="g"?"spots por tropo ahora":"tropo favorable"}`,`${n}: ${lv==="g"?"tropo spots now":"tropo favourable"}`));
    else if(b===10&&/larga distancia|F2/i.test(tx))up("tep",lv,T("Spots de 6 m a larga distancia ahora","Long-distance 6 m spots now"))})}catch(e){}return S}
function state(){return obsUp({es:esState(),tro:troState(),au:auState(),tep:tepState(),ms:msState(),eme:emeState()})}
function render(){const v=document.getElementById("vhfo");if(!v)return;let box=document.getElementById("vuhf");
  if(!box){box=document.createElement("div");box.id="vuhf";box.className="vuhf";const f=document.getElementById("f_vhf");const sum=f&&f.querySelector(":scope>summary");if(sum)sum.insertAdjacentElement("afterend",box);else v.parentNode.insertBefore(box,v)}
  /* 2.10.7: primero el estado de 6 m, 2 m y 70 cm, luego la nota de meteoros y después el panel */
  {const f=document.getElementById("f_vhf"),sum=f&&f.querySelector(":scope>summary");if(sum&&sum.nextElementSibling!==v){sum.insertAdjacentElement("afterend",v)}
   const mn=document.getElementById("metnote");if(mn&&v.nextElementSibling!==mn)v.insertAdjacentElement("afterend",mn);
   const after=mn||v;if(after.nextElementSibling!==box)after.insertAdjacentElement("afterend",box)}
  const st=state();const tiles=[["es",T("Sporadic E","Sporadic E"),st.es],["tro",T("Tropo","Tropo"),st.tro],["au",T("Aurora","Aurora"),st.au],["tep","TEP",st.tep],["ms",T("Meteoros","Meteors"),st.ms],["eme",T("Rebote lunar","Moonbounce"),st.eme]];
  /* 2.11.85: las fichas hacen de pestañas: al tocar una se abre su detalle debajo (antes, siete desplegables apilados) */
  const SEL=[...OPEN][0]||"";
  const panel=`<h3 class="vh">${T("Panel de aperturas especiales","Special openings panel")}</h3><div class="vtiles" role="tablist">${tiles.map(([k,n,s])=>`<button type="button" class="vtile lv-${s.l}${SEL===k?" vsel":""}" data-vgo="${k}" aria-pressed="${SEL===k}"><span class="vtn">${n}</span><b class="vts">${s.l==="n"?"—":LVT(s.l)}</b><span class="vtt">${e2(s.t)}</span></button>`).join("")}<button type="button" class="vtile vtal${SEL==="al"?" vsel":""}" data-vgo="al" aria-pressed="${SEL==="al"}"><span class="vtn">${T("Alerts","Alerts")}</span><b class="vts">${AL.size?T(`${AL.size} activos`,`${AL.size} on`):T("apagados","off")}</b><span class="vtt">${T("Te avisa cuando se abra algo","Tells you when something opens")}</span></button></div>`;
  const parts=[["es",T("Esporádica E: mapa y previsión","Sporadic E: map and outlook"),()=>esPart(st.es)],["tro",T("Tropo: conductos en 2 m y 70 cm","Tropo: ducts on 2 m and 70 cm"),()=>troPart(st.tro)],["au",T("Aurora en VHF","VHF aurora"),()=>auPart(st.au)],["tep",T("Transecuatorial (TEP) en 6 m","Transequatorial (TEP) on 6 m"),()=>tepPart(st.tep)],["ms",T("Dispersión meteórica","Meteor scatter"),()=>msPart(st.ms)],["eme",T("Rebote lunar (EME)","Moonbounce (EME)"),()=>emePart(st.eme)],["al",T("Avisos de aperturas especiales","Special opening alerts"),alertPart]];
  const html=panel+parts.map(([k,n,f])=>`<details class="vpart" data-vp="${k}"${OPEN.has(k)?" open":" hidden"}><summary>${n}</summary><div class="vpb">${OPEN.has(k)?`<div class="vpc">${f()}</div>`:""}</div></details>`).join("");
  if(box.dataset.h!==html){box.dataset.h=html;box.innerHTML=html;wire(box,parts)}
  /* 2.10.9: las nubes de esporádica E vistas ahora van dentro de su desplegable, al principio */
  {const esw=document.querySelector(".esw"),eb=box.querySelector('details.vpart[data-vp="es"]>.vpb');if(esw&&eb&&esw.parentNode!==eb)eb.insertBefore(esw,eb.firstChild)}
  checkAlerts(st)}
function wire(box,parts){box.querySelectorAll("details.vpart").forEach(d=>d.addEventListener("toggle",()=>{const k=d.dataset.vp;if(d.open){OPEN.add(k);if(k==="tro"&&!TRO&&!troBusy)troFetch();if(k==="ms")msFetch();const p=parts.find(x=>x[0]===k);const b=d.querySelector(".vpb");if(p&&b&&!b.querySelector(".vpc"))b.insertAdjacentHTML("beforeend",`<div class="vpc">${p[2]()}</div>`)}else{OPEN.delete(k);d.hidden=true;box.querySelectorAll(".vtile").forEach(t=>{t.classList.remove("vsel");t.setAttribute("aria-pressed","false")})}S.set("acracb_vuhfopen",JSON.stringify([...OPEN]))}));
  box.querySelectorAll("[data-vgo]").forEach(b=>b.onclick=()=>{const k=b.dataset.vgo,was=OPEN.has(k);OPEN.clear();if(!was)OPEN.add(k);S.set("acracb_vuhfopen",JSON.stringify([...OPEN]));box.dataset.h="";render();
    if(!was){const d=box.querySelector(`details.vpart[data-vp="${k}"]`);if(d){if(k==="tro"&&!TRO&&!troBusy)troFetch();if(k==="ms")msFetch();try{const r=d.getBoundingClientRect();if(r.top>innerHeight*.75)d.scrollIntoView({behavior:"smooth",block:"nearest"})}catch(e){}}}});
  box.querySelectorAll("[data-troh]").forEach(b=>b.onclick=()=>{TROH=+b.dataset.troh;box.dataset.h="";render()});
  box.querySelectorAll("[data-val]").forEach(c=>c.onchange=()=>{if(c.checked)AL.add(c.dataset.val);else AL.delete(c.dataset.val);S.set("acracb_vuhfal",JSON.stringify([...AL]))})}
function visible(){const d=document.getElementById("f_vhf");return d&&typeof st!=="undefined"&&st.page==="ahora"&&!d.hidden&&d.open}
function tick(){if(document.visibilityState!=="visible")return;const vis=visible();if(vis||AL.size){if(vis&&OPEN.has("tro")&&(!TRO||Date.now()-TRO.at>3*36e5)&&!troBusy)troFetch();if(vis&&OPEN.has("ms"))msFetch();render()}}
window.ACRACB_vuhf={render,state,moonAt,emeLoss,troFetch};
/* 2.11.94: las tres tarjetas de 6 m, 2 m y 70 cm alineadas: la cabecera de las tres tiene la misma altura, así el detalle
   empieza a la misma altura en todas (solo cuando van en columnas) */
function eqVHF(){const v=document.getElementById("vhfo");if(!v)return;const ss=[...v.querySelectorAll(".sxl>.sxr>summary")];ss.forEach(x=>x.style.minHeight="");
  if(innerWidth<760||ss.length<2)return;const tops=new Set(ss.map(x=>Math.round(x.getBoundingClientRect().top)));if(tops.size>1)return;const mh=Math.max(...ss.map(x=>x.offsetHeight));ss.forEach(x=>x.style.minHeight=mh+"px")}
(function(){let t=0;const go=()=>{clearTimeout(t);t=setTimeout(eqVHF,60)};addEventListener("resize",go);document.addEventListener("toggle",e=>{if(e.target&&e.target.closest&&e.target.closest("#vhfo"))go()},true);
  const hook=()=>{const v=document.getElementById("vhfo");if(!v)return setTimeout(hook,500);new MutationObserver(go).observe(v,{childList:true,subtree:true});go()};hook()})();
function boot(){if(!document.getElementById("vhfo"))return setTimeout(boot,500);render();setInterval(tick,60000);document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest('[data-t="f_vhf"],.ptabs button'))setTimeout(()=>{if(visible()){if(OPEN.has("tro")&&!TRO)troFetch();render()}},80)},true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.10.10: ionosfera medida sobre tu QTH con GloTEC (NOAA SWPC), gratuito y sin registro ----
   GloTEC asimila miles de medidas GNSS y da, en una rejilla mundial, el contenido total de electrones (TEC), su
   desviación respecto a la mediana de 30 días y la densidad y altura del pico de la capa F2. De la densidad sale la
   foF2 (foF2 = √(NmF2 / 1,24·10¹⁰) MHz) y, con la altura, una MUF para saltos de 3.000 km. Se descarga solo al abrir
   este panel (unos 2,5 MB) y se guarda 15 minutos. */
(function(){
"use strict";
if(window.__hkGlotec)return;window.__hkGlotec=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const nf=(v,d)=>(+v).toFixed(d).replace(".",EN()?".":",");
const BASE="https://services.swpc.noaa.gov";
let G=null,busy=false,err="";
try{const c=JSON.parse(localStorage.getItem("acracb_glotec")||"null");if(c&&Date.now()-c.at<15*6e4)G=c}catch(e){}
const me=()=>(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];
const PX="https://acracb-dx.ea5jnf.workers.dev/?u=";
/* 2.11.85: si NOAA no deja leerlo directamente o tarda, se pide por el intermediario del club; y si el último mapa falla, el anterior */
async function get2(u,max){try{return await get(u,max)}catch(e){return await get(PX+encodeURIComponent(u),max)}}
async function get(u,max){const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),30000);try{const r=await fetch(u,{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);const t=await r.text();if(t.length>max)throw new Error("size");return JSON.parse(t)}finally{clearTimeout(tm)}}
async function load(){if(busy)return;busy=true;err="";render();try{
  const idx=await get2(BASE+"/products/glotec/geojson_2d_urt.json",8e6);if(!Array.isArray(idx)||!idx.length)throw new Error("vacío");
  const cand=idx.filter(x=>x&&x.url&&x.time_tag&&/^\/products\/glotec\//.test(x.url)).sort((a,b)=>Date.parse(b.time_tag)-Date.parse(a.time_tag)).slice(0,3);if(!cand.length)throw new Error("url");
  let gj=null,last=null;for(const c of cand){try{gj=await get2(BASE+c.url,8e6);last=c;break}catch(_){}}if(!gj)throw new Error("mapa");const P=me();let best=null,bd=1e9;
  for(const f of gj.features||[]){const c=f.geometry&&f.geometry.coordinates,p=f.properties;if(!c||!p)continue;let dl=Math.abs(c[0]-P[0]);if(dl>180)dl=360-dl;const d=dl*Math.cos(P[1]*Math.PI/180)**2+Math.abs(c[1]-P[1])*2;if(d<bd){bd=d;best={c,p}}}
  if(!best)throw new Error("sin punto");const p=best.p;
  G={at:Date.now(),t:Date.parse(last.time_tag),pt:best.c,tec:+p.tec,an:+p.anomaly,hm:+p.hmF2,nm:+p.NmF2};localStorage.setItem("acracb_glotec",JSON.stringify(G))}
 catch(e){err=T("GloTEC no ha publicado datos ahora mismo o no ha respondido; se intentará de nuevo al volver a abrir este panel.","GloTEC has not published data right now or did not respond; it will try again when you reopen this panel.")}
 finally{busy=false;render()}}
function render(){const box=document.getElementById("glotecb");if(!box)return;
  if(!G){box.innerHTML=`<p class="note">${busy?T("Descargando el último mapa de GloTEC…","Downloading the latest GloTEC map…"):err||T("Se descarga al abrir este panel.","It downloads when you open this panel.")}</p>`;return}
  const fo=Math.sqrt(G.nm/1.24e10),M=Math.max(2.5,Math.min(3.8,1490/(G.hm+176))),muf=fo*M,rel=G.tec>0?G.an/(G.tec-G.an)*100:0;
  const lv=rel>=25?["g",T("ionosfera reforzada","enhanced ionosphere")]:rel<=-25?["r",T("ionosfera debilitada","depleted ionosphere")]:["y",T("normal para estas fechas","normal for the season")];
  const age=Math.round((Date.now()-G.t)/6e4);
  const band=[[28,"10 m"],[24.9,"12 m"],[21,"15 m"],[18.07,"17 m"],[14,"20 m"],[10.1,"30 m"],[7,"40 m"]].find(b=>b[0]<=muf*0.85);
  box.innerHTML=`<div class="kv gtkv">
    <div class="chip"><div class="k">${T("foF2 sobre tu QTH","foF2 over your QTH")}</div><div class="v">${nf(fo,1)} MHz</div><div class="t">${T("la frecuencia más alta que rebota en vertical","the highest frequency that bounces straight up")}</div></div>
    <div class="chip"><div class="k">${T("MUF estimada (saltos de 3.000 km)","Estimated MUF (3,000 km hops)")}</div><div class="v">${nf(muf,1)} MHz</div><div class="t">${band?T(`abre hasta ${band[1]} en saltos largos desde aquí`,`open up to ${band[1]} on long hops from here`):T("solo bandas bajas","low bands only")}</div></div>
    <div class="chip"><div class="k">${T("TEC (electrones en la vertical)","TEC (electrons overhead)")}</div><div class="v">${nf(G.tec,1)} TECU</div><div class="t">${T("1 TECU = 10¹⁶ electrones por m²","1 TECU = 10¹⁶ electrons per m²")}</div></div>
    <div class="chip lv-${lv[0]}"><div class="k">${T("Frente a los últimos 30 días","Compared with the last 30 days")}</div><div class="v">${rel>=0?"+":""}${nf(rel,0)}%</div><div class="t">${lv[1]}</div></div></div>
   <p class="note">${T(`Punto de la rejilla más cercano: ${nf(Math.abs(G.pt[1]),2)}° ${G.pt[1]>=0?"N":"S"}, ${nf(Math.abs(G.pt[0]),1)}° ${G.pt[0]>=0?"E":"W"}. Datos de hace ${age} min. La foF2 se calcula con la densidad del pico de la capa F2 que da GloTEC; la MUF es una estimación a partir de la foF2 y la altura de la capa (${Math.round(G.hm)} km). Fuente: GloTEC, NOAA SWPC.`,`Nearest grid point: ${nf(Math.abs(G.pt[1]),2)}° ${G.pt[1]>=0?"N":"S"}, ${nf(Math.abs(G.pt[0]),1)}° ${G.pt[0]>=0?"E":"W"}. Data from ${age} min ago. foF2 is computed from the F2 peak density given by GloTEC; the MUF is an estimate from foF2 and the layer height (${Math.round(G.hm)} km). Source: GloTEC, NOAA SWPC.`)}</p>`}
function place(){const q=document.getElementById("f_qth");if(!q||document.getElementById("f_glotec"))return;
  const d=document.createElement("details");d.className="card fold";d.id="f_glotec";
  d.innerHTML=`<summary><h2>${T("Ionosfera medida sobre tu QTH","Ionosphere measured over your QTH")}</h2><span class="fsum">GloTEC · NOAA SWPC</span></summary><div id="glotecb"></div>`;
  const body=q.querySelector(":scope>summary");(body?body.parentNode:q).appendChild(d);
  d.addEventListener("toggle",()=>{if(d.open){if(!G||Date.now()-G.at>15*6e4)load();else render()}});render()}
function boot(){if(!document.getElementById("f_qth"))return setTimeout(boot,500);place()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.10.12: panel “Sol y propagación ahora”, al estilo de los paneles clásicos de radioaficionado ----
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
/* 2.10.34: HF con el MISMO cálculo que el Resumen de Ahora: destinos de tu modo con al menos un 30% de probabilidad
   (paso corto o largo), en las bandas de tus antenas. Así el panel y el Resumen nunca se contradicen. */
function bandN(b,lh){return memo("stbn|"+b+"|"+lh+"|"+MOD()+"|"+st.mode,()=>{let n=0;for(const t of TG().filter(inMode)){const p=Math.max(prob(t,lh,b,false).p,prob(t,lh,b,true).p);if(p>=.3)n++}return n})}
function lvN(n){return n>=40?["g",T(`${n} destinations`,`${n} destinations`)]:n>=10?["y",T(`${n} destinations`,`${n} destinations`)]:n>0?["o",T(`${n} destination${n===1?"":"s"}`,`${n} destination${n===1?"":"s"}`)]:["r",T("closed","closed")]}
/* 2.11.86: hf(true) da todas las bandas del modo, también 6 m, 2 m y 70 cm, para el detalle por banda */
function hf(all){const out=[];try{let now=12;try{now=localNow()}catch(_){}const bs=(all?BI0().filter(b=>b<=12):BI().filter(b=>b<10)).sort((a,b)=>MHZ[a]-MHZ[b]);
  for(const b of bs)out.push([BANDS[b],lvN(bandN(b,now)),lvN(bandN(b,13)),lvN(bandN(b,1)),bandN(b,now),b,bandN(b,13),bandN(b,1)])}catch(e){}return out}
function vhf(){try{const s=window.ACRACB_vuhf&&ACRACB_vuhf.state();if(!s)return [];const es6=s.es.cl.find(([b,c])=>b==="6"&&c.you)||(s.es.obsB||[]).includes("6 m"),es2=s.es.cl.find(([b,c])=>b==="2"&&c.you)||(s.es.obsB||[]).includes("2 m");
  const L3=(l,o,n,c)=>l==="g"?["g",o]:l==="y"?["y",n]:["r",c];
  return [[T("Esporádica E 6 m","Sporadic E 6 m"),es6?["g",T("open","open")]:s.es.cl.some(([b])=>b==="6")?["y",T("en Europa, lejos de ti","in Europe, away from you")]:["r",T("closed","closed")]],
   [T("Esporádica E 2 m","Sporadic E 2 m"),es2?["g",T("open","open")]:s.es.cl.some(([b])=>b==="2")?["y",T("en Europa, lejos de ti","in Europe, away from you")]:["r",T("closed","closed")]],
   [T("Aurora","Aurora"),L3(s.au.l,T("posible: apunta al norte","possible: aim north"),T("podría llegar","could come"),T("no ahora","not now"))],
   [T("Tropo (2 m and 70 cm)","Tropo (2 m and 70 cm)"),s.tro.l==="n"?["n",T("ábrela en V-UHF para calcularla","open it in V-UHF to calculate")]:L3(s.tro.l,T("conductos: llega lejos","ducts: reaches far"),T("algo mejor de lo normal","somewhat better than usual"),T("normal","normal"))],
   [T("Meteoros","Meteors"),L3(s.ms.l,T("buen momento","good time"),T("posible","possible"),T("poca actividad","little activity"))],
   [T("Rebote lunar","Moonbounce"),L3(s.eme.l,T("Luna alta","Moon high"),T("Luna baja","Moon low"),T("Luna bajo el horizonte","Moon below horizon"))],
   [T("6 m a larga distancia (TEP y F2)","6 m long distance (TEP and F2)"),s.tep.obs?[s.tep.l,s.tep.l==="g"?T("abierta: hay spots","open: spots now"):T("posible","possible")]:L3(s.tep.l,T("open","open"),T("posible","possible"),T("no ahora","not now"))]]}catch(e){return []}}
function storms(){const sp=L.space||{};const kp=L.kp!=null?+L.kp:null;
  const g=kp==null?null:kp>=9?5:kp>=8?4:kp>=7?3:kp>=6?2:kp>=5?1:0;
  const xm=String(sp.xray||"").match(/^([ABCMX])\s*([\d.]+)/);let r=null;if(xm){const v=+xm[2];r=xm[1]==="X"?(v>=20?5:v>=10?4:3):xm[1]==="M"?(v>=5?2:1):0}
  const pm=String(sp.proton||"").match(/S\s*([0-5])/);const sv=pm?+pm[1]:null;
  return {g,r,s:sv}}
function stM(k,n){if(n==null)return ["n","—"];if(!n)return ["g",T("no hay","none")];
  const lv=[0,T("menor","minor"),T("moderada","moderate"),T("fuerte","strong"),T("severa","severe"),T("extrema","extreme")][n];
  const ef={g:T("bandas bajas y rutas polares peor","low bands and polar paths worse"),r:T("de día, bandas bajas mudas un rato","by day, low bands silent for a while"),s:T("rutas polares cortadas","polar paths cut")}[k];
  return [n>=3?"r":"y",`${lv}: ${ef}`]}
/* 2.11.85: la mejor banda en un momento (ahora, 13 h o 1 h): la misma que el Resumen y que “HF para tu estación” */
function momTop(H,i){const r=H.filter(x=>x[i]>0).sort((p,q)=>q[i]-p[i]);if(!r.length)return null;let top=r[0];try{const hh=i===4?localNow():i===6?13:1,e=easyAt(hh);const z=e&&r.find(x=>x[5]===e.b);if(z)top=z}catch(_){}return top}
function momOrder(nowH){const x13=((13-nowH)%24+24)%24||24,x1=((1-nowH)%24+24)%24||24;const A={i:6,lab:nowH<13?T("Today, by day","Today, by day"):T("Tomorrow, by day","Tomorrow, by day"),sh:nowH<13?T("Daytime","By day"):T("Morning","Tomorrow"),hr:"13:00"},B={i:7,lab:nowH<1?T("Tonight","Tonight"):T("Tonight","Tonight"),sh:T("Tonight","Tonight"),hr:"01:00"};return x1<x13?[B,A]:[A,B]}
/* 2.11.85: la barra plegada invita a abrirla: dice para qué sirve y enseña ya la mejor banda de ahora, de esta noche y de mañana */
function head(){if(typeof L==="undefined"||!L)return `<span class="sth-main"><span class="sth-t">${T("Sol y propagación","Sun and propagation")}</span></span>`;
  const H=hf();let nowH=12;try{nowH=Math.round(localNow())%24}catch(_){}
  /* 2.11.88: sin “destinos” en la vista plegada: cada ficha dice la banda y la hora; el número está al abrir */
  const chip=(lab,top,hr)=>top?`<span class="sthc"><small>${lab}</small><b style="color:${BC[top[5]]}">${top[0]}</b><i>${hr}</i></span>`:`<span class="sthc sthc0"><small>${lab}</small><b>${T("closed","closed")}</b><i>${hr}</i></span>`;
  let now=momTop(H,4),nn=now?now[4]:null;try{const e=easyAt(localNow());if(e&&now&&now[5]===e.b)nn=e.ts.length}catch(_){}
  const S=storms(),a=[];if(S.g)a.push("G"+S.g);if(S.r)a.push("R"+S.r);if(S.s)a.push("S"+S.s);const kp=L.kp!=null?+L.kp:null;
  /* 2.11.89: abajo solo lo que abre para ti: HF ahora, esta noche y mañana, y V-UHF; el Sol y las tormentas van en la tira de arriba */
  /* 2.11.90: la ficha dice qué bandas (6 m, 2 m, 70 cm) y, debajo, por qué fenómeno */
  /* 2.11.92: la ficha V-UHF dice exactamente lo mismo que las líneas de 6 m, 2 m y 70 cm de Ahora → V-UHF y de Bandas
     (misma función, vhfStatus): primero lo abierto; si no hay nada abierto, lo posible; si no, cerrado */
  let VS=[];try{VS=[10,11,12].map(b=>[b,vhfStatus(b)]).filter(x=>x[1])}catch(_){}
  const pickL=VS.some(x=>x[1][0]==="g")?"g":VS.some(x=>x[1][0]==="y")?"y":null,sel=pickL?VS.filter(x=>x[1][0]===pickL):[];
  const bn=sel.map(x=>BANDS[x[0]]),bl=bn.length>1?bn.slice(0,-1).join(", ")+T(" and "," and ")+bn[bn.length-1]:bn[0]||"";
  const sub=sel.length===1?String(sel[0][1][1]):pickL==="g"?T(`${sel.length} bandas abiertas`,`${sel.length} bands open`):T(`${sel.length} bandas posibles`,`${sel.length} bands possible`);
  const sol=`<span class="sthc sthvu${pickL?"":" sthc0"}"><small>V-UHF</small><b${pickL?` class="st-${pickL}"`:""}>${pickL?bl:T("closed","closed")}</b><i>${pickL?e2(sub):T("6 m, 2 m y 70 cm sin aperturas","6 m, 2 m and 70 cm: no openings")}</i></span>`;
  const load=!H.length||!H.some(r=>r[4]||r[6]||r[7])||(!now&&window.ACRACB_hubLoading&&ACRACB_hubLoading());
  const chips=load?`<span class="sthc sthc0"><small>HF</small><b>${T("calculando…","calculating…")}</b><i>&nbsp;</i></span>`:chip(T("Now","Now"),now,`${String(nowH).padStart(2,"0")}:00`)+momOrder(nowH).map(m=>chip(m.sh,momTop(H,m.i),m.hr)).join("");
  return `<span class="sth-main"><span class="sth-t">${T("Sol y propagación","Sun and propagation")}</span><span class="sth-q">${T("Qué bandas abren ahora, esta noche y mañana con tu equipo","Which bands open now, tonight and tomorrow with your station")}</span></span><span class="sth-chips">${chips}${sol}</span><span class="sth-go"><span class="sth-o">${T("Ver previsión","See forecast")}</span><span class="sth-c">${T("Close","Close")}</span></span>`}
function headTxt(){if(typeof L==="undefined"||!L)return "";const kp=L.kp!=null?+L.kp:null;let top=null;try{let now=12;try{now=localNow()}catch(_){}const e=easyAt(now);if(e)top=[BANDS[e.b],null,null,null,e.ts.length]}catch(_){}
  return `${(()=>{const S=storms();const a=[];if(S.g)a.push("G"+S.g);if(S.r)a.push("R"+S.r);if(S.s)a.push("S"+S.s);return a.length?`<b class="st-r">${T("storm","storm")} ${a.join(" ")}</b>`:T("sin tormentas","no storms")})()} · ${top&&top[4]>0?T(`ahora, mejor ${top[0]} (${top[4]} destinations)`,`now, best ${top[0]} (${top[4]} destinations)`):(window.ACRACB_hubLoading&&ACRACB_hubLoading())?T("calculando la previsión de tu zona…","calculating the forecast for your area…"):T("HF cerrada ahora","HF closed now")}`}
function body(){if(typeof L==="undefined"||!L)return "";const sp=L.space||{};const kp=L.kp!=null?+L.kp:null;
  const row=(k,v,m)=>`<div class="st3r"><span class="st3k">${k}</span><b class="st3v st-${m[0]}">${v}</b><span class="st3m">${m[1]}</span></div>`;
  const S=storms(),stv=(c,n)=>n==null?"—":c+n;const sun=[row(T("Geomagnetic storm","Geomagnetic storm"),stv("G",S.g),stM("g",S.g)),row(T("Apagón de radio","Radio blackout"),stv("R",S.r),stM("r",S.r)),row(T("Tormenta de protones","Proton storm"),stv("S",S.s),stM("s",S.s)),row(T("Solar flux","Solar flux"),nf(L.sfi,0),sfiM(L.sfi)),row(T("Manchas solares","Sunspots"),nf(sp.ssn,0),ssnM(sp.ssn)),row(T("A index","A index"),nf(sp.a,0),aM(sp.a)),row(T("Índice K","K index"),nf(kp,0),kpM(kp)),
    row(T("X-rays","X-rays"),e2(sp.xray||"—"),xrM(sp.xray)),row(T("Solar wind","Solar wind"),L.wind!=null?nf(L.wind,0)+" km/s":"—",wM(L.wind)),row("Bz",L.bz!=null?nf(L.bz,1)+" nT":"—",bzM(L.bz)),(()=>{const io=L.iono;if(!io||io.fof2==null)return "";const mu=io.mufd!=null?+io.mufd:null;return row(T("Ionosonde","Ionosonde")+(io.station?` <small>${e2(String(io.station).replace(/\s*\(.*\)$/,""))}</small>`:""),"foF2 "+nf(io.fof2,1)+" MHz"+(mu!=null?" · MUF "+nf(mu,1)+" MHz":""),[mu==null?"n":mu>=28?"g":mu>=14?"y":"r",mu==null?T("medida real de la ionosfera","real measurement of the ionosphere"):T(`medida real: a 3.000 km rebota hasta ${nf(mu,0)} MHz`,`real measurement: up to ${nf(mu,0)} MHz bounces at 3,000 km`)])})(),
    row(T("Ruido geomagnético","Geomagnetic noise"),nzM(kp),["n",T("orientativo, según el Kp","a guide, from Kp")])];
  /* 2.10.19: cada fenómeno de VHF con una línea que explica qué es, como el resto del panel */
  const VQ=[T("nubes ionizadas a 100 km: saltos de 500 a 2.000 km","ionised clouds at 100 km: hops of 500 to 2,000 km"),T("lo mismo en 2 m: rara y corta, de 1.000 a 2.200 km","the same on 2 m: rare and brief, 1,000 to 2,200 km"),T("rebote en la aurora: señal ronca, apuntando al norte","reflection off the aurora: raspy signal, aim north"),T("inversión de temperatura: cientos de km o más","temperature inversion: hundreds of km or more"),T("rebote en estelas de meteoros, en ráfagas de segundos","bounce off meteor trails, in bursts of seconds"),T("QSO rebotando en la Luna: hace falta la Luna alta","QSO off the Moon: needs the Moon high"),T("transecuatorial o capa F2: miles de km, sobre todo hacia el sur","transequatorial or F2: thousands of km, mostly southwards")];
/* 2.11.70: cada fenómeno con un medidor de tres pasos (nada · posible · bueno) y la palabra en gris si no hay nada:
     “cerrada” no es una alarma, es lo normal. Lo que está abierto o es posible sube arriba. La tropo se calcula aquí
     también (antes había que abrir V-UHF): se pide la previsión a Open-Meteo una vez y se rehace el panel al llegar */
  try{const vs=window.ACRACB_vuhf&&ACRACB_vuhf.state();if(vs&&vs.tro&&vs.tro.l==="n"&&!window.__stTro){window.__stTro=1;Promise.resolve(ACRACB_vuhf.troFetch()).catch(()=>{}).then(()=>{window.__stTroDone=1;try{ACRACB_stPlace()}catch(_){}})}}catch(_){}
  const VLV={g:3,y:2,o:1,r:0,n:-1};
  const V=vhf().map(([k,m],i)=>({k,m,q:VQ[i],lv:VLV[m[0]]!=null?VLV[m[0]]:0,i})).sort((a,b)=>(b.lv-a.lv)||(a.i-b.i)).map(({k,m,q,lv})=>{
    const txt=m[0]==="n"?(window.__stTroDone?T("sin datos ahora","no data now"):T("calculando…","calculating…")):m[1];
    const seg=[1,2,3].map(n=>`<i class="${lv>=n?"on":""}"></i>`).join("");
    return `<div class="vxr vx${lv<0?"n":lv}"><div class="vxk"><b>${k}</b>${q?`<small>${q}</small>`:""}</div><div class="vxv"><span class="vxm" aria-hidden="true">${seg}</span><span class="vxt">${txt}</span></div></div>`}).join("");
  /* 2.11.47: “HF para tu estación” más clara: para qué sirve en una línea, columnas con nombre (ahora, de día, de noche)
     y la mejor banda de ahora marcada, para comparar de un vistazo qué bandas abren de día y cuáles de noche */
  const H=hf();let nowH=12;try{nowH=Math.round(localNow())%24}catch(_){}
  const num=x=>String(x).replace(/\s*(destinations?|destinations?)$/i,"");
  /* 2.11.68: “la mejor” de la tabla es la misma banda que dicen la frase de arriba y la barra (no solo la de más destinos) */
  let best=H.reduce((m,r)=>r[4]>(m?m[4]:0)?r:m,null);try{const e=easyAt(localNow());const z=e&&H.find(r=>r[5]===e.b&&r[4]>0);if(z)best=z}catch(_){}
  const hfI=`<p class="st3n st3i">${T("Cuántos destinos puedes trabajar en cada banda con tu antena, tu potencia y tu modo (al menos un 30% de fiabilidad). Sirve para elegir banda ahora y para ver cuáles se abren de noche y cuáles de día.","How many destinations you can work on each band with your antenna, power and mode (at least 30% reliability). Use it to pick a band now and to see which bands open at night and which by day.")}</p>`;
  /* 2.11.49: lo que se lee primero son tres frases: la mejor banda ahora, esta noche y mañana, y las otras abiertas;
     la tabla por bandas queda plegada debajo para quien quiera el detalle */
  const lst=a=>{if(a.length<2)return a.join("");const y=T(" and "," and ");return a.slice(0,-1).join(", ")+y+a[a.length-1]};
  const mom=(lab,hr,i)=>{const r=H.filter(x=>x[i]>0).sort((p,q)=>q[i]-p[i]);if(!r.length)return `<p class="hfm"><b>${lab}</b> <span class="hfh">${hr}</span>: ${T("everything closed or nearly.","everything closed or nearly.")}</p>`;
    let top=r[0];try{const hh=i===4?localNow():i===6?13:1,e=easyAt(hh);const z=e&&r.find(x=>x[5]===e.b);if(z)top=z}catch(_){}/* la misma “mejor” que la barra de arriba */const more=H.filter(x=>x!==top&&x[i]>=40).map(x=>x[0].replace(/\s*m$/,""));
    return `<p class="hfm"><b>${lab}</b> <span class="hfh">${hr}</span>: ${T("mejor","best")} <b class="st-g">${top[0]}</b>${more.length?`; ${T("también","also")} ${lst(more)} m`:""}.</p>`};
  /* 2.11.85: los tres momentos como fichas (antes, tres frases): la banda en grande con su color, cuántos destinos, y las otras abiertas */
  const tile=(lab,hr,i)=>{const top=momTop(H,i);if(!top)return `<div class="hft hft0"><span class="hftl">${lab}<small>${hr}</small></span><b class="hftb">${T("closed","closed")}</b><span class="hftn">${T("casi nada abierto","almost nothing open")}</span></div>`;
    const more=H.filter(x=>x!==top&&x[i]>=40).map(x=>x[0].replace(/\s*m$/,""));
    return `<div class="hft"><span class="hftl">${lab}<small>${hr}</small></span><b class="hftb" style="color:${BC[top[5]]}">${top[0]}</b><span class="hftn">${top[i]} ${T("destinations","destinations")}</span>${more.length?`<span class="hfto">${T("también","also")} ${lst(more)} m</span>`:""}</div>`};
  const hfS=`<div class="hfsum">${tile(T("Now","Now"),`${String(nowH).padStart(2,"0")}:00`,4)}${momOrder(nowH).map(m=>tile(m.sh,m.hr,m.i)).join("")}</div>`;
  /* 2.11.68: columnas por orden de hora (ahora, y después la 1 h o las 13 h según cuál llegue antes) y como mapa de calor:
     cada casilla con su número de destinos y un fondo más intenso cuantos más hay; una banda cerrada es un “—” discreto,
     en vez de la palabra “cerrada” en rojo repetida por toda la tabla */
  const d13=((13-nowH)%24+24)%24||24,d1=((1-nowH)%24+24)%24||24;
  const C13={lab:nowH<13?T("Today","Today"):T("Morning","Tomorrow"),sub:T("13:00, de día","13:00, daytime"),k:6},C1={lab:nowH<1?T("Today","Today"):T("Tonight","Tonight"),sub:T("01:00, de noche","01:00, night"),k:7};
  const COLS=[{lab:T("Now","Now"),sub:`${String(nowH).padStart(2,"0")}:00`,k:4}].concat(d1<d13?[C1,C13]:[C13,C1]);
  const HA=hf(true);const MX=Math.max(1,...HA.map(r=>Math.max(r[4]||0,r[6]||0,r[7]||0)));
  const cell=v=>{v=v||0;if(v<=0)return `<span class="hmc hm0" title="${T("closed","closed")}">—</span>`;/* 2.11.90: el mismo código de colores que el resto de la plataforma (verde, ámbar, naranja), sin degradados */return `<span class="hmc${v>=40?" hmg":v>=10?" hmy":" hmo"}">${v}</span>`};
  /* 2.11.98: 6 m, 2 m y 70 cm, igual que en Ahora → V-UHF, Bandas y el panel principal (misma función, vhfStatus):
     el estado de ahora según los spots y la previsión de tropo; a otras horas no hay previsión fiable, así que no se inventa */
  const vcell=b=>{let v=null;try{v=vhfStatus(b)}catch(_){}const lv=v&&v[0];const tx=v?String(v[1]):"";
    const now=lv==="g"?`<span class="hmc hmg hmv" title="${e2(tx)}">${T("open","open")}</span>`:lv==="y"?`<span class="hmc hmy hmv" title="${e2(tx)}">${T("posible","possible")}</span>`:`<span class="hmc hm0" title="${e2(tx||T("closed","closed"))}">—</span>`;
    return now+COLS.slice(1).map(()=>`<span class="hmc hm0 hmna" title="${T("Sin previsión por horas en V-UHF: depende de aperturas puntuales","No hourly forecast on V-UHF: it depends on sporadic openings")}">·</span>`).join("")};
  const hfT0=`<div class="hmt"><div class="hmr hmh"><span>${T("Band","Band")}</span>${COLS.map(c=>`<span>${c.lab}<small>${c.sub}</small></span>`).join("")}</div>`+HA.map(r=>{const bb=best&&r[5]===best[5]&&r[4]>0;return `<div class="hmr${bb?" hmbest":""}"><span class="hmb">${r[0]}${bb?`<small>${T("la mejor ahora","best now")}</small>`:""}</span>${r[5]>=10?vcell(r[5]):COLS.map(c=>cell(r[c.k])).join("")}</div>`}).join("")+`</div><p class="st3n st3u">${`${T("Destinos al alcance en cada banda a esa hora.","Destinations within reach on each band at that hour.")} ${T("6 m, 2 m y 70 cm: estado de ahora, el mismo que en V-UHF (“·”: sin previsión por horas).","6 m, 2 m and 70 cm: current state, the same as in V-UHF (“·”: no hourly forecast).")} <span class="hmlg"><i class="hmg"></i>40+ <i class="hmy"></i>10–39 <i class="hmo"></i>1–9</span> ${T("“—”: cerrada.","“—”: closed.")}`}${(()=>{try{const miss=[9,8,4,6].filter(b=>!BI0().includes(b)).map(b=>BANDS[b]);return miss.length?" "+T(`${miss.join(", ")} no ${miss.length>1?"salen":"sale"} on ${MD().s}: cambia de modo para verlas.`,`${miss.join(", ")} ${miss.length>1?"are":"is"} not shown in ${MD().s}: change mode to see ${miss.length>1?"them":"it"}.`):""}catch(_){return ""}})()}</p>`;
  const hfT=hfS+`<details class="hfdet"><summary>${T("See the detail by band","See the detail by band")}</summary>${hfT0.replace(hfI,"")}</details>`;
  /* 2.10.19: cinco bloques que se reparten solos en columnas de altura parecida (antes quedaban columnas medio vacías) */
  const G=ix=>ix.map(i=>sun[i]).join("");
  return `<div class="st3"><section><h4>HF ${T("para tu estación","for your station")}</h4>${hfT}<p class="st3n">${T("Horas locales. Los países de cada banda, en Ahora → Bandas.","Local times. The countries on each band, in Now → Bands.")}</p></section><section><h4>${T("Tormentas ahora","Storms now")}</h4>${G([0,1,2])}</section><section><h4>${T("Campo magnético","Magnetic field")}</h4>${G([5,6,8,9,11])}</section><section><h4>${T("Sun","Sun")}</h4>${G([3,4,7,10])}</section><section><h4>VHF ${T("y superiores","and up")}</h4>${V}</section></div>
   <p class="note">${T("Datos de NOAA SWPC, SILSO y GFZ Potsdam; HF calculada para tu estación ahora, a las 13:00 y a la 01:00; VHF, del panel de aperturas especiales.","Data from NOAA SWPC, SILSO and GFZ Potsdam; HF calculated for your station now, at 13:00 and at 01:00; VHF from the special openings panel.")} ${T("Updated","Updated")}: ${e2(L.updated||"")}.</p>`}
function mk(id){const d=document.createElement("details");d.className="sterr";d.id=id;d.innerHTML=`<summary></summary><div class="stb"></div>`;
  if(OPEN[id])d.open=true;d.addEventListener("toggle",()=>{OPEN[id]=d.open;try{localStorage.setItem("acracb_stopen",JSON.stringify(OPEN))}catch(e){}if(d.open)fill(d)});return d}
/* 2.11.52: al refrescar no se pisa lo que ya está igual, y “Ver el detalle por banda” se queda abierto si lo abriste */
function put(el,h){if(!el)return;const dt=el.querySelector(".hfdet"),op=!!(dt&&dt.open);if(el.__h===h)return;el.__h=h;el.innerHTML=h;if(op){const n=el.querySelector(".hfdet");if(n)n.open=true}}
function fill(d){const s=d.querySelector("summary");if(s)s.innerHTML=head();if(d.open){put(d.querySelector(".stb"),body())}}
function place(){const sw=document.getElementById("sw");if(sw){let d=document.getElementById("st_ahora");if(!d)d=mk("st_ahora");if(sw.nextElementSibling!==d)sw.after(d);fill(d)}const old=document.getElementById("st_sol");if(old)old.remove();
  const pb=document.getElementById("propbox");if(pb){put(pb,body());const fs=document.getElementById("s_prop");if(fs)fs.innerHTML=headTxt()}}
window.ACRACB_afterDraw=window.ACRACB_afterDraw||[];window.ACRACB_afterDraw.push(()=>{try{place()}catch(e){}});
function boot(){if(!document.querySelector('section.page[data-pg="sol"]'))return setTimeout(boot,500);place();setInterval(()=>{if(!document.hidden)try{place()}catch(e){}},15000);
  /* 2.11.18: la cabecera se rehace también en cuanto llega la previsión de la zona o termina una actualización,
     sin esperar al siguiente repaso */
  window.ACRACB_stPlace=()=>{try{place()}catch(e){}};document.addEventListener("visibilitychange",()=>{if(!document.hidden)window.ACRACB_stPlace()})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.10.22: concurso en marcha ----
   Con el calendario de concursos de la plataforma (CAL) se mira si ahora mismo hay uno en marcha, a la hora exacta de sus bases.
   - Arriba, en todas las secciones, un aviso: cuál es, hasta cuándo y su modo.
   - Si la plataforma tiene sus reglas (CONTESTS), el aviso ofrece “Participar”: solo entonces pasa a modo concursos con ese concurso (desde 2.11.75 ya no lo hace sola):
     bandas del concurso, puntos, multiplicadores, estrategia en directo, pausas… Si vuelves a modo DX, se respeta hasta el siguiente.
   - Al terminar, si lo había activado ella, vuelve sola a modo DX.
   - Con las notificaciones activadas, avisa una vez por concurso. */
(function(){
"use strict";
if(window.__hkCtNow)return;window.__hkCtNow=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LS={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}};
const DOFF={vie:-1,"sáb":0,dom:1,fri:-1,sat:0,sun:1};
/* ventana exacta: primera hora y su día, última hora y su día (“12:00 sáb – 12:00 dom”, “12:00–22:59 sáb y 05:00–11:59 dom”…) */
function win(c,sat){const tx=String(c[4]||"");const tk=[];/* 2.11.75: también con los días en inglés (la versión inglesa traduce “sáb” y “dom”: antes el final salía un día antes) */const re=/(\d{1,2}):(\d{2})|(vie|sáb|dom|fri|sat|sun)/gi;let m;while((m=re.exec(tx)))tk.push(m[1]!=null?{t:+m[1]*60+ +m[2]}:{d:DOFF[m[3].toLowerCase()]});
  const times=tk.map((x,i)=>[x,i]).filter(([x])=>x.t!=null);if(!times.length)return null;
  const dayAfter=i=>{for(let j=i+1;j<tk.length;j++)if(tk[j].d!=null)return tk[j].d;for(let j=i-1;j>=0;j--)if(tk[j].d!=null)return tk[j].d;return 0};
  const [f,fi]=times[0],[l,li]=times[times.length-1];const base=Date.UTC(sat.getUTCFullYear(),sat.getUTCMonth(),sat.getUTCDate());
  const st=new Date(base+dayAfter(fi)*864e5+f.t*6e4);let en=new Date(base+dayAfter(li)*864e5+l.t*6e4);if(l.t%60===59)en=new Date(+en+6e4);if(en<=st)en=new Date(+en+864e5);return {st,en}}
function list(){const out=[];if(typeof CAL==="undefined"||typeof calDate!=="function")return out;const now=new Date();
  for(const c of CAL){for(const y of [now.getUTCFullYear()-1,now.getUTCFullYear()]){const sat=calDate(y,c[2],c[3]);if(!sat)continue;const w=win(c,sat);if(!w)continue;
    if(now>=w.st&&now<w.en)out.push({c,st:w.st,en:w.en,key:c[0]+"|"+w.st.toISOString(),plan:c[6]&&typeof CONTESTS!=="undefined"&&CONTESTS[c[6]]?c[6]:null})}}
  return out.sort((a,b)=>(!!b.plan-!!a.plan)||(a.en-b.en))}
window.ACRACB_ctNow=list;
const XB=()=>`<button type="button" class="ctx" data-ctclose aria-label="${T("Cerrar aviso del concurso","Close contest notice")}" title="${T("Close","Close")}">×</button>`;
const hm=d=>d.toLocaleTimeString(EN()?"en-US":"en-US",{hour:"2-digit",minute:"2-digit",timeZone:"Europe/Madrid"});
const utc=d=>d.toISOString().slice(11,16);
/* 2.11.64: la hora real del final (23:59 UTC), no el minuto siguiente redondeado */
function whenEnd(d){d=new Date(+d-6e4);const now=new Date(),same=d.toDateString()===now.toDateString(),tom=new Date(+now+864e5).toDateString()===d.toDateString();
  const day=same?T("hoy","today"):tom?T("mañana","tomorrow"):d.toLocaleDateString(EN()?"en-US":"en-US",{weekday:"long",timeZone:"Europe/Madrid"});
  return T(`termina ${day} at ${hm(d)} (${utc(d)} UTC)`,`ends ${day} at ${hm(d)} (${utc(d)} UTC)`)}
function inIt(x){try{return st.mode==="contest"&&$("contest")&&$("contest").value===x.plan}catch(e){return false}}
function join(x,user){if(!x.plan)return;const K=CONTESTS[x.plan];try{
  if(!K.modes.includes(MOD())){const s=$("modesel");if(s){if(!user&&!LS.get("acracb_ctprevmode"))LS.set("acracb_ctprevmode",s.value);s.value=K.modes[0];try{store.set("c_modesel",s.value);store.set("c_modebase",s.value)}catch(_){}s.dispatchEvent(new Event("change",{bubbles:true}))}}
  store.set("contest",x.plan);setMode("contest",true);const cs=$("contest");if(cs&&cs.value!==x.plan){cs.value=x.plan;store.set("contest",x.plan)}
  try{CACHE.clear()}catch(_){}try{renderBandSeg()}catch(_){}refresh()}catch(e){console.error(e)}
  if(!user)LS.set("acracb_ctauto",x.key);LS.set("acracb_ctdecl",null);draw()}
/* 2.11.14: si al entrar solo en un concurso se cambió tu modo (p. ej. de SSB a CW), al salir o al terminar vuelve el tuyo */
function restoreMode(){const pm=LS.get("acracb_ctprevmode");if(!pm)return;LS.set("acracb_ctprevmode",null);const s=$("modesel");if(s&&s.value!==pm){s.value=pm;try{store.set("c_modesel",pm);store.set("c_modebase",pm)}catch(_){}s.dispatchEvent(new Event("change",{bubbles:true}))}}
function leave(x){LS.set("acracb_ctdecl",x.key);LS.set("acracb_ctauto",null);try{restoreMode();setMode("dx",true);refresh()}catch(e){}draw()}
function draw(){const L0=list();let b=document.getElementById("ctnowbn");const x=L0[0];
  /* al terminar el concurso que se activó solo, vuelta a modo DX */
  const au=LS.get("acracb_ctauto");if(au&&!L0.some(y=>y.key===au)){LS.set("acracb_ctauto",null);try{if(st.mode==="contest"){restoreMode();setMode("dx",true);refresh()}}catch(e){}}
  if(!x){if(b)b.remove();renderCt(null);return}
  /* 2.11.75: ya no se pasa sola a modo concursos ni cambia tu modo (SSB, CW…): se queda lo último que elegiste.
     Para usar el concurso, “Participar” en el aviso. Si antes se había cambiado sola, se deshace una vez */
  if(LS.get("acracb_ctauto")&&!LS.get("acracb_ctmig75")){LS.set("acracb_ctmig75","1");LS.set("acracb_ctauto",null);LS.set("acracb_ctdecl",x.key);try{restoreMode();if(st.mode==="contest"){setMode("dx",true);refresh()}}catch(e){}}
  /* 2.10.34: se puede cerrar como los demás avisos; no vuelve hasta el siguiente concurso y no cambia el modo */
  if(LS.get("acracb_ctclose")===x.key){if(b)b.remove();renderCt(x);return}
  if(!b){b=document.createElement("div");b.id="ctnowbn";b.className="ctnowbn";b.setAttribute("role","status");const ref=document.getElementById("albar")||document.querySelector(".updrow");if(!ref)return;ref.insertAdjacentElement("beforebegin",b)}
  const on=inIt(x),others=L0.slice(1).map(y=>y.c[0]);
  const h=`<b>${T("Concurso en marcha","Contest running")}: ${e2(x.c[0])}</b> <span class="ctm">${e2(x.c[1])}</span> · ${whenEnd(x.en)}`+
    (x.plan?(on?` · <span>${T("La plataforma está trabajando para este concurso: bandas, puntos, multiplicadores y estrategia.","The platform is working for this contest: bands, points, multipliers and strategy.")}</span> <button type="button" class="lnk" data-ctgo>${T("Ver la estrategia","See the strategy")}</button> <button type="button" class="lnk" data-ctleave>${T("Volver a modo DX","Back to DX mode")}</button>`
      :` <button type="button" class="btn" data-ctjoin>${T("Participar","Take part")}</button>`)
      :` · <span>${T("La plataforma aún no tiene sus reglas, así que no calcula su estrategia.","The platform does not have its rules yet, so it does not calculate its strategy.")}</span>`)+
    (others.length?` <span class="ctoth">${T("También en marcha","Also running")}: ${e2(others.join(", "))}</span>`:"")+XB();
  if(b.innerHTML!==h)b.innerHTML=h;renderCt(x)}
/* en la sección Concursos, arriba */
function renderCt(x){const sec=document.querySelector('section.page[data-pg="concursos"]');if(!sec)return;let c=document.getElementById("ctnowc");
  if(!x||LS.get("acracb_ctclose")===x.key){if(c)c.remove();return}if(!c){c=document.createElement("div");c.id="ctnowc";c.className="ctnowbn ctnowc";sec.insertBefore(c,sec.firstChild)}
  const K=x.plan?CONTESTS[x.plan]:null;
  const h=`<b>${T("En marcha ahora","Running now")}: ${e2(x.c[0])}</b> <span class="ctm">${e2(x.c[1])}</span> · ${whenEnd(x.en)}`+(K?`<p class="note">${e2(T(K.tip,K.tip))}</p><p class="note">${T("Multipliers","Multipliers")}: ${e2(K.mult)}.</p>`+(inIt(x)?"":`<button type="button" class="btn" data-ctjoin>${T("Participar","Take part")}</button>`):"")+XB();
  if(c.innerHTML!==h)c.innerHTML=h}
document.addEventListener("click",ev=>{const t=ev.target;if(!t.closest)return;const x=list()[0];if(!x)return;
  if(t.closest("[data-ctjoin]")){join(x,true);return}
  if(t.closest("[data-ctleave]")){leave(x);return}
  if(t.closest("[data-ctclose]")){LS.set("acracb_ctclose",x.key);draw();return}
  if(t.closest("[data-ctgo]")){try{go("concursos");selTab("concursos","c_live",true)}catch(e){}return}
  /* pasar a modo DX a mano durante el concurso cuenta como “no participo” */
  const mb=t.closest('.modes button[data-m="dx"]');if(mb&&x.plan){LS.set("acracb_ctdecl",x.key);LS.set("acracb_ctauto",null);try{restoreMode()}catch(e){}setTimeout(draw,50)}
  const mc=t.closest('.modes button[data-m="contest"]');if(mc){LS.set("acracb_ctdecl",null);setTimeout(draw,50)}},true);
/* 2.10.37: se envía por el mismo camino que el resto (service worker): “new Notification” no funciona en el iPhone, el iPad
   ni Android, y la marca de “ya avisado” solo se guarda si la notificación ha salido de verdad */
/* 2.11.14: avisa de TODOS los concursos del calendario: una hora antes de empezar y al empezar (cada uno una vez),
   también si coinciden varios a la vez */
function upcoming(){const out=[];if(typeof CAL==="undefined"||typeof calDate!=="function")return out;const now=Date.now();
  for(const c of CAL){for(const y of [new Date().getUTCFullYear(),new Date().getUTCFullYear()+1]){const sat=calDate(y,c[2],c[3]);if(!sat)continue;const w=win(c,sat);if(!w)continue;
    const d=+w.st-now;if(d>0&&d<=36e5)out.push({c,st:w.st,en:w.en,key:"pre|"+c[0]+"|"+w.st.toISOString()})}}return out}
function sentSet(){try{return new Set(JSON.parse(LS.get("acracb_ctnotif2")||"[]"))}catch(e){return new Set()}}
function markSent(k){const s=[...sentSet(),k].slice(-80);LS.set("acracb_ctnotif2",JSON.stringify(s))}
const hhmm=d=>{try{return d.toLocaleTimeString(EN()?"en-US":"en-US",{hour:"2-digit",minute:"2-digit"})}catch(e){return d.toISOString().slice(11,16)+" UTC"}};
function notif(){try{if(!(window.ACRACB_notifOn&&ACRACB_notifOn())||!window.ACRACB_notify)return;const S=sentSet();let q=Promise.resolve();
  for(const x of upcoming()){if(S.has(x.key))continue;q=q.then(()=>ACRACB_notify(T("Contest in one hour: ","Contest in one hour: ")+x.c[0],x.c[1]+" · "+T("starts at ","starts at ")+hhmm(x.st),"ctpre|"+x.c[0])).then(ok=>{if(ok)markSent(x.key)}).catch(()=>{})}
  for(const x of list()){if(S.has(x.key)||LS.get("acracb_ctnotif")===x.key)continue;
    q=q.then(()=>ACRACB_notify(T("Concurso en marcha: ","Contest running: ")+x.c[0],x.c[1]+" · "+whenEnd(x.en)+(x.plan?" · "+T("the platform is ready for it","the platform is set up for it"):""),"ctnow|"+x.c[0])).then(ok=>{if(ok)markSent(x.key)}).catch(()=>{})}}catch(e){}}
function boot(){if(typeof CAL==="undefined"||typeof setMode!=="function"||!document.querySelector(".updrow"))return setTimeout(boot,400);
  try{draw();notif()}catch(e){console.error(e)}setInterval(()=>{if(!document.hidden)try{draw();notif()}catch(e){}},60000)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.11.46: concursos en el aire que no puntúan desde EA ----
   Grandes concursos nacionales de otros países que llenan las bandas aunque desde España no se pueda participar.
   Así se entiende por qué de repente hay tantas estaciones de un país llamando CQ.
   - En Concursos, una tarjeta con sus fechas (en hora española) y qué significan para nosotros.
   - Mientras uno está en marcha, una línea de aviso bajo el buscador del clúster.
   Solo fechas comprobadas en las bases oficiales (arrl.org/sweepstakes). */
(function(){
"use strict";
if(window.__hkCtFor)return;window.__hkCtFor=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const $=id=>document.getElementById(id);
/* fines de semana completos (sábado y domingo del mismo mes), como en el resto de la plataforma */
function fullWk(y,m){const r=[];for(let d=1;d<=31;d++){const dt=new Date(Date.UTC(y,m-1,d));if(dt.getUTCMonth()!==m-1)break;if(dt.getUTCDay()===6){const su=new Date(Date.UTC(y,m-1,d+1));if(su.getUTCMonth()===m-1)r.push(dt)}}return r}
/* ventana UTC: del sábado a las “ini” (horas UTC) a las “fin” (minutos desde el sábado 00:00 UTC) */
const LIST=[
  {id:"sscw",n:"ARRL November Sweepstakes · CW",m:11,wk:0,ini:21*60,fin:(2*24+2)*60+59,
   who:["Solo entre estaciones de EE. UU. y Canadá","Only between US and Canadian stations"],
   bands:"160–10 m (CW)",url:"https://www.arrl.org/sweepstakes"},
  {id:"ssph",n:"ARRL November Sweepstakes · SSB",m:11,wk:2,ini:21*60,fin:(2*24+2)*60+59,
   who:["Solo entre estaciones de EE. UU. y Canadá","Only between US and Canadian stations"],
   bands:"160–10 m (SSB)",url:"https://www.arrl.org/sweepstakes"}];
function span(c,y){const w=fullWk(y,c.m)[c.wk];if(!w)return null;const a=new Date(w.getTime()+c.ini*6e4),b=new Date(w.getTime()+c.fin*6e4+59e3);return {a,b}}
function next(c){const now=Date.now(),y=new Date().getUTCFullYear();let s=span(c,y);if(!s||s.b.getTime()<now)s=span(c,y+1);return s}
const fmt=d=>{try{return d.toLocaleString(EN()?"en-GB":"en-US",{timeZone:"Europe/Madrid",weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch(_){return d.toISOString().slice(0,16).replace("T"," ")+" UTC"}};
const live=s=>s&&Date.now()>=s.a.getTime()&&Date.now()<=s.b.getTime();
const MEANS=()=>T("Oirás muchas estaciones de EE. UU. y Canadá llamando “CQ Sweepstakes” o “CQ SS”. Un QSO contigo no les cuenta en el concurso y muchas no contestan a estaciones de fuera, pero si alguna te contesta, vale para el DXCC, los estados y tus diplomas.",
  "You will hear many US and Canadian stations calling “CQ Sweepstakes” or “CQ SS”. A QSO with you does not count in their contest and many will not answer stations from abroad, but if one does, it counts for DXCC, states and your awards.");
function card(){const sec=document.querySelector('section[data-pg="concursos"]');if(!sec)return false;let c=$("ctfor");
  if(!c){c=document.createElement("div");c.id="ctfor";c.className="card ctfor";const a=$("cnone");if(a&&a.parentNode===sec)a.after(c);else sec.prepend(c)}
  /* 2.11.64: solo los que están en marcha o empiezan en los próximos 14 días; si no hay ninguno, la tarjeta no sale
     (antes salían ya terminados, con las fechas del año siguiente y sin año) */
  const rows=LIST.map(x=>({x,s:next(x)})).filter(r=>r.s&&(live(r.s)||r.s.a.getTime()-Date.now()<=14*864e5)).sort((p,q)=>p.s.a-q.s.a);
  c.hidden=!rows.length;if(!rows.length){c.innerHTML="";return true}
  c.innerHTML=`<h2>${T("En el aire, aunque no puntúen desde España","On the air, though they do not score from Spain")}</h2>
    <p class="note">${T("Concursos nacionales de otros países: llenan las bandas, pero desde España no se puede participar. Horas en hora española.","National contests of other countries: they fill the bands, but you cannot take part from Spain. Times in Spanish local time.")}</p>`+
    rows.map(({x,s})=>`<div class="ctfr${live(s)?" on":""}"><p><b>${x.n}</b>${live(s)?` <span class="xtag xr">${T("AHORA","NOW")}</span>`:""}<br>
      <span class="note">${fmt(s.a)} – ${fmt(s.b)} · ${x.bands} · ${T(x.who[0],x.who[1])} · <a href="${x.url}" target="_blank" rel="noopener noreferrer" data-ext>${T("bases","rules")}</a></span></p>
      ${live(s)?`<p class="note">${MEANS()}</p>`:""}</div>`).join("");
  return true}
function banner(){const s=document.getElementById("srch");const on=LIST.map(x=>({x,s:next(x)})).find(r=>live(r.s));let b=$("ctforb");
  if(!on){if(b)b.remove();return}
  if(!s)return;if(!b){b=document.createElement("p");b.id="ctforb";b.className="note ctforb";s.after(b)}
  b.innerHTML=`<b>${T("En el aire ahora:","On the air now:")}</b> ${on.x.n} (${T(on.x.who[0],on.x.who[1]).replace(/^Solo/,"solo").replace(/^Only/,"only")}), ${T("hasta el","until")} ${fmt(on.s.b)}. ${MEANS()}`}
window.ACRACB_ctForNow=()=>LIST.map(x=>({x,s:next(x)})).filter(r=>live(r.s)).map(r=>({n:r.x.n,en:r.s.b,who:T(r.x.who[0],r.x.who[1])}));
function go(){try{card()}catch(_){}try{banner()}catch(_){}}
let n=0;(function w(){go();if(!(document.getElementById("ctfor")&&(document.getElementById("srch")||n>40))&&++n<80)setTimeout(w,300)})();
setInterval(go,6e4);setInterval(()=>{if(!document.getElementById("ctforb")){try{banner()}catch(_){}}},2000);document.addEventListener("ACRACB:lang",go);
})();

/* ---- ACRACB 2.11.39: anunciar un spot en el clúster interno de la plataforma ----
   Según el documento del proyecto: el spot se publica en el clúster interno (el intermediario del club en Cloudflare lo
   guarda una hora) y lo ven todos los socios en unos segundos, sin recargar. La difusión a clústeres externos es aparte,
   nunca retrasa la publicación interna y solo va a los nodos que admiten spots sin registro (SpottedHam, WA9PIE y EA7JXH).
   Nada se envía sin que lo confirmes; tu spot lo puedes retirar desde este mismo dispositivo. */
(function(){
"use strict";
const T=(a,b)=>window.ACRACB_LANG==="en"?b:a,$=id=>document.getElementById(id);
const RELAY="https://acracb-dx.ea5jnf.workers.dev",WEB="https://www.dxsummit.fi/";
const KCALL="acracb_mycall",KLAST="acracb_spotlast",KMINE="acracb_myspots2";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const CALL=/^(?=.{3,15}$)([A-Z0-9]{1,4}\/)?[A-Z0-9]{1,3}[0-9][A-Z0-9]{0,4}[A-Z](\/[A-Z0-9]{1,4})?$/;
const get=k=>{try{return localStorage.getItem(k)||""}catch(_){return ""}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
const base=c=>String(c||"").toUpperCase().split("/").sort((a,b)=>b.length-a.length)[0];
const ICON=`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M16 9a3 3 0 0 1 0 6"/><path d="M19 6a7 7 0 0 1 0 12"/></svg>`;
window.ACRACB_spotIcon=ICON;
function khz(v){v=String(v||"").trim().replace(",",".");const n=parseFloat(v);if(!isFinite(n)||n<=0)return null;const k=n<1000?n*1000:n;return k>=1800&&k<=450000?Math.round(k*10)/10:null}
function check(){const de=$("spde").value.trim().toUpperCase(),dx=$("spdx").value.trim().toUpperCase(),f=khz($("spf").value),info=$("spi").value.trim();
  if(!CALL.test(de))return {err:T("Revisa tu indicativo.","Check your callsign."),el:"spde"};
  if(!CALL.test(dx))return {err:T("Revisa el indicativo del DX.","Check the DX callsign."),el:"spdx"};
  if(base(dx)===base(de))return {err:T("No se puede anunciar uno mismo.","You cannot spot yourself."),el:"spdx"};
  if(f==null)return {err:T("Revisa la frecuencia (por ejemplo 14025 o 14.025).","Check the frequency (for example 14025 or 14.025)."),el:"spf"};
  try{const L=JSON.parse(get(KLAST)||"null");if(L&&L.dx===dx&&Math.abs(L.f-f)<1&&Date.now()-L.at<6e5)return {err:T("Ya anunciaste este spot hace menos de 10 minutos.","You posted this spot less than 10 minutes ago."),el:"spdx"}}catch(_){}
  return {de,dx,f,info:info.slice(0,30)}}
function msg(h,c){const m=$("spmsg");m.className="spmsg"+(c?" "+c:"");m.innerHTML=h;m.hidden=!h}
const manual=s=>T(`Si quieres, puedes anunciarlo tú mismo en <a href="${WEB}" target="_blank" rel="noopener noreferrer" data-ext>DX Summit</a>: tu indicativo <b>${esc(s.de)}</b>, DX <b>${esc(s.dx)}</b>, <b>${s.f.toFixed(1)}</b> kHz${s.info?`, “${esc(s.info)}”`:""}.`,`If you like, you can post it yourself on <a href="${WEB}" target="_blank" rel="noopener noreferrer" data-ext>DX Summit</a>: your call <b>${esc(s.de)}</b>, DX <b>${esc(s.dx)}</b>, <b>${s.f.toFixed(1)}</b> kHz${s.info?`, “${esc(s.info)}”`:""}.`);

/* ---- spots de los socios: llegan del intermediario cada 15 s (con la página a la vista) y entran en el clúster de la
   plataforma marcados como “comunicados por un socio”; los tuyos salen al momento en tu dispositivo ---- */
const BRK=[[0,1800,2000],[1,3500,4000],[8,5250,5450],[2,7000,7300],[9,10100,10150],[3,14000,14350],[4,18068,18168],[5,21000,21450],[6,24890,24990],[7,28000,29700],[10,50000,54000],[11,144000,146000],[12,430000,440000]];
function mineAll(){try{return (JSON.parse(get(KMINE)||"[]")||[]).filter(x=>Date.now()-x.ts<36e5)}catch(_){return []}}
const saveMine=a=>put(KMINE,JSON.stringify(a.slice(-20)));
const ESTX={pendiente:["enviándose","sending"],enviado:["enviado","sent"],aceptado:["aceptado","accepted"]};
const estTxt=v=>{v=String(v||"");if(/^error/.test(v))return T("error","error")+v.slice(5);const t=ESTX[v];return t?T(t[0],t[1]):esc(v)};
function mkSpot(m){try{const b=(BRK.find(r=>m.f>=r[1]&&m.f<=r[2])||[])[0];if(b==null)return null;const dx=window.ACRACB_areaPos?ACRACB_areaPos(m.dx):null;if(!dx)return null;
  const e=(typeof callEnt==="function")?callEnt(m.dx):null,d=new Date(m.ts);let from=[0,0];try{if(typeof TXP!=="undefined"&&TXP)from=TXP}catch(_){}
  const md=m.modo||(/\bCW\b/i.test(m.info)?"CW":/FT8/i.test(m.info)?"FT8":/FT4/i.test(m.info)?"FT4":/RTTY/i.test(m.info)?"RTTY":"");
  return {call:m.dx,f:String(+(m.f/1000).toFixed(4)),band:b,mode:md,t:d.toISOString().slice(11,16),utc:d.toISOString(),
    by:[m.de],from:[from],dx,dxcc:e&&e.dxcc||null,kind:e&&+e.dxcc===281?"near":"dx",c:m.info||"",nw:true,ns:1,src:["ACRACB"],sid:m.id||null,dxp:false,mine:!!m.clave}}catch(_){return null}}
let REC=[],recOK=false,recOff=false;
async function pullRec(){if(recOff||document.hidden)return;try{const r=await fetch(RELAY+"/recientes",{cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});
  if(r.status===404||r.status===405){recOff=true;return}if(!r.ok)return;const j=await r.json();if(!Array.isArray(j))return;
  REC=j.filter(x=>x&&typeof x.dx==="string"&&isFinite(+x.f)&&isFinite(+x.ts)&&Date.now()-x.ts<36e5).map(x=>({id:/^[0-9a-f-]{36}$/.test(x.id||"")?x.id:null,de:String(x.de||"").slice(0,15),dx:x.dx.slice(0,15),f:+x.f,info:String(x.info||"").slice(0,30),modo:typeof x.modo==="string"?x.modo.slice(0,8):"",ts:+x.ts,estado:x.estado&&typeof x.estado==="object"?x.estado:{}}));
  recOK=true;putMine();showMine()}catch(_){}}
function putMine(){try{if(typeof L==="undefined"||!L||!Array.isArray(L.spots))return;const k=x=>String(x.call).toUpperCase()+"|"+Math.round(parseFloat(x.f)*500);
  const mine=mineAll(),ids=new Set(REC.map(x=>x.id).concat(mine.map(x=>x.id)).filter(Boolean));let ch=0;
  /* los spots de socios que ya no están (retirados o caducados) salen también del clúster de la plataforma */
  if(recOK){const n0=L.spots.length;L.spots=L.spots.filter(x=>!(x.src&&x.src.includes("ACRACB")&&x.sid&&!ids.has(x.sid)));ch+=n0-L.spots.length}
  const have=new Set(L.spots.map(k));for(const m of REC.concat(mine.filter(x=>!REC.some(r=>r.id===x.id)))){const sp=mkSpot(m);if(sp&&!have.has(k(sp))){L.spots.unshift(sp);have.add(k(sp));ch++}}
  if(ch){try{CACHE.clear()}catch(_){}try{refresh()}catch(_){}}}catch(_){}}
/* 2.11.44: cada 15 s mientras se usa la plataforma; si pasan 5 minutos sin tocar nada, cada 2 minutos; con la página oculta,
   nada. Así el intermediario no pasa del límite diario del plan gratuito de Cloudflare aunque muchos socios la dejen abierta */
let ACTV=Date.now(),LASTP=0;["pointerdown","keydown","wheel","touchstart","scroll"].forEach(ev=>addEventListener(ev,()=>{const idle=Date.now()-ACTV>3e5;ACTV=Date.now();if(idle)pullRec()},{passive:true}));
function tickRec(){if(document.hidden)return;const gap=Date.now()-ACTV>3e5?12e4:15e3;if(Date.now()-LASTP>=gap-500){LASTP=Date.now();pullRec()}}
setInterval(putMine,15000);setTimeout(putMine,4000);setInterval(tickRec,15000);setTimeout(()=>{LASTP=Date.now();pullRec()},3000);document.addEventListener("visibilitychange",()=>{if(!document.hidden){LASTP=Date.now();pullRec()}});
/* etiqueta “Socio” en las tarjetas y filas del clúster: un spot comunicado por un socio no es una predicción ni una
   observación automática de la red */
(function tag(){const f=window.ACRACB_tags;if(typeof f!=="function"||f.__socio){setTimeout(tag,300);return}
  const w=function(s,inline){const t=f.apply(this,arguments)||"";return s&&s.src&&s.src.includes("ACRACB")?`<span class="xtag xsoc" title="${T("Comunicado por un socio desde la plataforma","Reported by a member from the platform")}">${T("Socio","Member")}</span>`+t:t};w.__socio=1;window.ACRACB_tags=w})();

/* tus spots de la última hora, con su estado y el botón para retirarlos */
function showMine(){const box=$("spmine");if(!box)return;const a=mineAll();if(!a.length){box.hidden=true;box.innerHTML="";return}
  box.hidden=false;box.innerHTML=`<p class="spmh">${T("Tus spots de la última hora","Your spots from the last hour")}</p>`+a.slice().reverse().map(m=>{const r=REC.find(x=>x.id===m.id),est=(r&&r.estado)||m.estado||{};
    const ext=Object.entries(est).filter(([k,v])=>v!=="deshabilitado").map(([k,v])=>`${esc(k)}: ${estTxt(v)}`).join(" · ");
    return `<div class="spmi"><span><b>${esc(m.dx)}</b> ${(m.f).toFixed(1)} kHz · ${new Date(m.ts).toISOString().slice(11,16)} UTC${ext?`<small class="spno">${T("Otros clústeres: ","Other clusters: ")}${ext}</small>`:""}</span><button type="button" class="btn spret" data-ret="${esc(m.id)}">${T("Retirar","Remove")}</button></div>`}).join("")}
async function retirar(id){const a=mineAll(),m=a.find(x=>x.id===id);if(!m)return;
  try{const r=await fetch(RELAY+"/retirar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,clave:m.clave}),cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});
    if(!r.ok){msg(T("No se ha podido retirar. Vuelve a intentarlo en un momento.","It could not be removed. Try again in a moment."),"warn");return}}catch(_){msg(T("Sin conexión: no se ha podido retirar.","No connection: it could not be removed."),"warn");return}
  saveMine(a.filter(x=>x.id!==id));REC=REC.filter(x=>x.id!==id);recOK=true;putMine();showMine();msg(T(`Retirado: <b>${esc(m.dx)}</b> ya no sale en el clúster de la plataforma.`,`Removed: <b>${esc(m.dx)}</b> no longer shows on the platform cluster.`),"ok")}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-ret]");if(b){e.preventDefault();retirar(b.dataset.ret)}});

async function send(s){const b=$("spgo");b.disabled=true;msg(T("Publicando…","Posting…"));put(KCALL,s.de);
  let r=null,j=null;
  try{r=await fetch(RELAY+"/spot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({de_call:s.de,dx_call:s.dx,frequency:s.f.toFixed(1),info:s.info}),cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});try{j=await r.json()}catch(_){}}catch(_){}
  b.disabled=false;
  if(r&&r.ok&&j&&j.status==="ok"&&j.spot){put(KLAST,JSON.stringify({dx:s.dx,f:s.f,at:Date.now()}));$("spconf").hidden=true;
    const m=Object.assign({},j.spot,{clave:j.clave});const a=mineAll();a.push(m);saveMine(a);putMine();showMine();
    const hay=Object.values(j.spot.estado||{}).some(v=>v!=="deshabilitado");
    msg(T(`Publicado: <b>${esc(s.dx)}</b> on ${s.f.toFixed(1)} kHz ya está en el clúster de la plataforma. Los demás socios lo verán en unos segundos.`,`Posted: <b>${esc(s.dx)}</b> on ${s.f.toFixed(1)} kHz is now on the platform cluster. Other members will see it within seconds.`)
      +(hay?`<small class="spno">${T("También se envía a otros clústeres de la red; su estado sale abajo.","It is also sent to other clusters on the network; their status is shown below.")}</small>`:""),"ok");return}
  if(r&&r.status===409&&j&&j.spot){msg(T(`Ese spot ya está publicado: <b>${esc(j.spot.dx)}</b> on ${(+j.spot.f).toFixed(1)} kHz, por ${esc(j.spot.de)} at ${new Date(j.spot.ts).toISOString().slice(11,16)} UTC.`,`That spot is already posted: <b>${esc(j.spot.dx)}</b> on ${(+j.spot.f).toFixed(1)} kHz, by ${esc(j.spot.de)} at ${new Date(j.spot.ts).toISOString().slice(11,16)} UTC.`),"warn");return}
  if(r&&r.status===429){msg(T("Espera medio minuto entre un spot y el siguiente.","Wait half a minute between spots."),"warn");return}
  if(r&&r.status===400&&j&&j.status){msg(T(`No se ha publicado: ${esc(j.status)}.`,`Not posted: ${esc(j.status)}.`),"warn");return}
  msg(T("No se ha podido publicar en el clúster de la plataforma ahora mismo. ","It could not be posted to the platform cluster right now. ")+manual(s),"warn")}
function dlg(){let d=$("spdlg");if(d)return d;d=document.createElement("dialog");d.id="spdlg";d.className="spdlg";d.setAttribute("aria-labelledby","spdlgt");
  d.innerHTML=`<form method="dialog" class="spdh"><h3 id="spdlgt">${ICON} ${T("Anunciar un spot","Post a spot")}</h3><button class="spx" value="x" aria-label="${T("Close","Close")}">×</button></form>
    <p class="spsub">${T("Al clúster de la plataforma: lo ven todos los socios en unos segundos. Gratis y sin registro.","To the platform cluster: every member sees it within seconds. Free, no sign-up.")}</p>
    <div class="spfrm">
      <label><span>${T("Your callsign","Your call")}</span><input id="spde" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="15" value="${esc(get(KCALL))}"></label>
      <label><span>DX</span><input id="spdx" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="15"></label>
      <label><span>${T("Frequency (kHz)","Frequency (kHz)")}</span><input id="spf" inputmode="decimal" autocomplete="off" maxlength="10" placeholder="14025.0"></label>
      <label><span>${T("Comentario","Comment")}</span><input id="spi" autocomplete="off" maxlength="30" placeholder="CQ, 59, up 2…"></label>
    </div>
    <div id="spconf" class="spconf" hidden></div>
    <div class="spbtn"><button type="button" class="btn primary" id="sprev">${T("Revisar","Review")}</button></div>
    <p id="spmsg" class="spmsg" hidden aria-live="polite"></p>
    <div id="spmine" class="spmine" hidden></div>
    <p class="note">${T("El spot es público y lleva tu indicativo: anuncia solo estaciones que hayas oído tú.","The spot is public and carries your callsign: only spot stations you have heard yourself.")}</p>`;
  document.body.appendChild(d);
  d.querySelector(".spfrm").addEventListener("input",()=>{$("spconf").hidden=true;$("sprev").hidden=false});
  d.addEventListener("click",e=>{if(e.target===d)d.close()});
  $("sprev").addEventListener("click",()=>{const c=check();const cf=$("spconf");if(c.err){cf.hidden=true;msg(c.err,"warn");$(c.el).focus();return}msg("");
    cf.innerHTML=`<p>${T("Se publicará así:","It will be posted as:")}</p><p class="spline">DX de ${esc(c.de)}: <b>${c.f.toFixed(1)}</b> <b>${esc(c.dx)}</b> ${esc(c.info)}</p><div class="spbtn"><button type="button" class="btn primary" id="spgo">${T("Publicar","Post")}</button><button type="button" class="btn" id="spno">${T("Corregir","Edit")}</button></div>`;
    cf.hidden=false;$("sprev").hidden=true;$("spgo").onclick=()=>send(c);$("spno").onclick=()=>{cf.hidden=true;$("sprev").hidden=false;$("spdx").focus()};$("spgo").focus()});
  return d}
function open(call,f){const d=dlg();$("spconf").hidden=true;$("sprev").hidden=false;msg("");if(call!=null){$("spdx").value=String(call||"").toUpperCase();const k=khz(f);$("spf").value=k?k.toFixed(1):""}
  showMine();try{d.showModal()}catch(_){d.setAttribute("open","")}($("spde").value?(call?$("spi"):$("spdx")):$("spde")).focus()}
window.ACRACB_spotFill=open;
/* botón visible junto al buscador de la pestaña DX */
function btn(){const r=document.querySelector("#srch .srrow");if(!r)return false;if($("spopen"))return true;
  const b=document.createElement("button");b.type="button";b.id="spopen";b.className="btn spopen";b.innerHTML=`${ICON}<span>${T("Anunciar spot","Post spot")}</span>`;b.setAttribute("aria-label",T("Anunciar un spot","Post a spot"));b.title=T("Anunciar un spot en el clúster de la plataforma","Post a spot to the platform cluster");b.onclick=()=>open();r.appendChild(b);return true}
/* el botón de cada estación (tarjeta o fila) abre la ventana ya rellena */
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-spot]");if(!b)return;e.preventDefault();e.stopPropagation();const fh=b.dataset.spf||((b.closest("[data-f]")||{}).dataset||{}).f||"";open(b.dataset.spot,fh)},true);
/* 2.11.26: también arriba, junto a “Actualizar”, para tenerlo a mano desde cualquier pestaña */
function top(){const r=document.querySelector(".updrow");if(!r)return false;if($("sptop"))return true;
  const b=document.createElement("button");b.type="button";b.id="sptop";b.className="sptop";b.innerHTML=`<span class="ic">${ICON}</span><span class="tx">${T("Anunciar spot","Post spot")}</span>`;b.title=T("Anunciar en el clúster de la plataforma una estación que oyes","Post to the platform cluster a station you hear");b.onclick=()=>open();const u=document.getElementById("updbtn");if(u)u.after(b);else r.appendChild(b);return true}
/* 2.11.51: antes se dejaba de intentar a los 15 s; en un iPad con la carga lenta el buscador de DX aparece más tarde
   y se quedaba sin botón. Ahora se comprueba después de cada dibujado y cada segundo (es solo mirar si existe) */
const ens=()=>{try{btn();top()}catch(e){}};ens();setInterval(ens,1000);
window.ACRACB_afterDraw=window.ACRACB_afterDraw||[];window.ACRACB_afterDraw.push(ens);
})();

/* ---- ACRACB 2.11.23: tus ajustes en otro dispositivo y primera visita ----
   Exportar: un fichero JSON con tus ajustes (locator, estación, alertas, vista, log…) que guardas tú; Importar: lo cargas
   en otro dispositivo. Sin cuentas ni servidores: el fichero va de tu mano a tu otro aparato. Las copias de datos en vivo
   (spots, satélites) no se exportan: se vuelven a descargar solas.
   Primera visita: una tarjeta con los tres pasos que hacen que las previsiones sean de tu estación. */
(function(){
"use strict";
const T=(a,b)=>window.ACRACB_LANG==="en"?b:a,$=id=>document.getElementById(id);
const SKIP=/^(acracb_live|acracb_tle|acracb_nseen|acracb_nlast|acracb_ctnotif|acracb_spotlast|acracb_vuhfseen)|cache/i;
function dump(){const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||SKIP.test(k))continue;o[k]=localStorage.getItem(k)}}catch(_){}return o}
function exp(){const data={app:"ACRACB",v:1,at:new Date().toISOString(),keys:dump()};const b=new Blob([JSON.stringify(data)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="acracb-ajustes-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);note(T("Ajustes guardados en un fichero. Ábrelo con “Importar” en tu otro dispositivo.","Settings saved to a file. Open it with “Import” on your other device."))}
function imp(f){const r=new FileReader();r.onload=()=>{let d=null;try{d=JSON.parse(r.result)}catch(_){}
  if(!d||d.app!=="ACRACB"||!d.keys||typeof d.keys!=="object"){note(T("Ese fichero no es de ajustes de la plataforma.","That file is not a platform settings file."),1);return}
  let n=0;try{for(const [k,v] of Object.entries(d.keys)){if(typeof k!=="string"||typeof v!=="string"||k.length>80||SKIP.test(k))continue;localStorage.setItem(k,v);n++}}catch(_){note(T("No se han podido guardar los ajustes en este navegador.","Settings could not be stored in this browser."),1);return}
  note(T(`${n} ajustes importados. Recargando…`,`${n} settings imported. Reloading…`));setTimeout(()=>location.reload(),900)};r.readAsText(f)}
function note(t,bad){const m=$("ajmsg");if(!m)return;m.textContent=t;m.className="note ajmsg"+(bad?" warn":"");m.hidden=false}
function foot(){if($("ajf"))return true;const lg=document.querySelector("details.foot.footmore");if(!lg)return false;
  const p=document.createElement("div");p.id="ajf";p.className="foot note ajf";
  p.innerHTML=`<span>${T("Tus ajustes en otro dispositivo:","Your settings on another device:")}</span> <button type="button" class="lnk" id="ajexp">${T("Exportar","Export")}</button> · <button type="button" class="lnk" id="ajimp">${T("Importar","Import")}</button><input type="file" id="ajfile" accept="application/json,.json" hidden><p id="ajmsg" class="note ajmsg" hidden aria-live="polite"></p>`;
  lg.before(p);$("ajexp").onclick=exp;$("ajimp").onclick=()=>$("ajfile").click();$("ajfile").onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)imp(f);e.target.value=""};return true}
/* primera visita: solo si no hay ajustes guardados de antes */
function welcome(){let seen=true;try{seen=!!localStorage.getItem("acracb_welcome")||!!localStorage.getItem("acracb_loc")||!!localStorage.getItem("acracb_stopen")}catch(_){}
  if(seen||$("welc"))return true;const sl=document.querySelector(".sline");if(!sl)return false;
  const c=document.createElement("div");c.id="welc";c.className="card welc";c.setAttribute("role","note");
  c.innerHTML=`<p><b>${T("Tres pasos para que todo sea de tu estación","Three steps to make everything about your station")}</b></p><ol><li>${T("Tu locator","Your locator")}</li><li>${T("Tu antena, su altura y el suelo","Your antenna, its height and the ground")}</li><li>${T("Tu modo y tu potencia","Your mode and power")}</li></ol><div class="welb"><button type="button" class="btn primary" id="welgo">${T("Configurar mi estación","Set up my station")}</button><button type="button" class="btn" id="welno">${T("Ahora no","Not now")}</button></div>`;
  (sl.closest(".card")||sl).after(c);
  const done=()=>{try{localStorage.setItem("acracb_welcome","1")}catch(_){}c.remove()};
  $("welno").onclick=done;$("welgo").onclick=()=>{done();const b=$("stbtn"),p=$("stpanel");if(b&&p&&p.hidden)b.click();setTimeout(()=>{const q=document.querySelector("#stpanel .qs,#stpanel input,#stpanel select");if(q)q.focus()},150)};return true}
let n=0;(function go(){const a=foot(),b=welcome();if(a&&b)return;if(++n<40)setTimeout(go,250)})();
})();

/* ---- ACRACB 2.10.35: la estación, a un toque ----
   En la línea de la estación, el modo, la banda, la potencia y la antena se cambian tocándolos: se abre directamente el selector
   del propio aparato (la rueda en el iPhone y el iPad, la lista en Android y en el ordenador), sin desplegar el panel entero.
   Lo demás (locator, suelo, alturas, coaxial…) sigue en “Editar estación”, y tocar el locator lo abre como antes. */
(function(){
"use strict";
if(window.__hkQS)return;window.__hkQS=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $i=id=>document.getElementById(id);
/* 2.11.3: cada pieza es un botón que abre un menú propio, igual en iPhone, iPad, Android y ordenador. Antes había un
   selector invisible encima del texto: en Safari a veces no se abría o se quedaba marcado, y la raya de debajo se veía rota */
function seg(id,label,cl){const s=$i(id);if(!s)return e2(label);
  return `<button type="button" class="qs${cl?" "+cl:""}" data-qs="${id}" aria-haspopup="listbox" aria-expanded="false" aria-label="${e2((s.getAttribute("aria-label")||"")+": "+label)}">${e2(label)}<span class="qsc" aria-hidden="true"></span></button>`}
function sum(){const e=$i("ssum");if(!e)return false;let loc="",md="",h=null,pw="",an="";
  try{loc=String($i("loc").value||"").slice(0,6);md=MD().s;h=HB();const p=PWN().split(" ");pw=p[0]+" "+p[1];an=ANTL()}catch(_){return false}
  /* 2.11.4: sin puntos entre piezas (los botones ya se separan) ni “Concursos” al final, que ya lo dice el botón de modo */
  /* 2.11.6: más corto en el móvil: “Todas” y las combinaciones de antenas resumidas (“Directiva 3 el. + 2 dipolos”) */
  const nar=innerWidth<=480,ps=String(an).split(" + ");if(ps.length>2||(nar&&ps.length>1)){const r=ps.slice(1),dp=r.every(x=>/dipol/i.test(x));an=ps[0]+" + "+(dp?T(`${r.length} ${r.length>1?"dipoles":"dipolo"}`,`${r.length} ${r.length>1?"dipoles":"dipole"}`):T(`${r.length} more`,`${r.length} more`))}
  /* 2.11.7: todo en la misma caja: también el locator, la altitud y el entorno son botones; lo demás, en “Más” */
  const al=$i("altin"),gv=($i("gnd")||{}).value,gl={rock:T("Suelo seco","Dry ground"),avg:T("Tierra normal","Average ground"),coast:T("Near the sea","By the sea"),sea:T("Agua salada","Salt water")}[gv]||"";
  /* 2.11.9: a la vista solo lo que se cambia a menudo (modo, banda y potencia) y el botón con tu locator, que despliega
     en la misma caja lo que casi nunca se toca: locator, antena, altitud, entorno, tu log y lo demás */
  e.classList.add("qsbar");
  /* 2.11.81: el locator, a la izquierda del todo, como dato principal; ya no se repite dentro del desplegable */
  /* 2.11.86: según el ancho: en el móvil, modo, banda y potencia (el locator pasa al desplegable); en pantallas anchas
     se suman la antena y, si cabe, la altitud y el entorno, que entonces dejan de repetirse en el desplegable */
  const html=`${loc?seg("locin",loc,"qloc"):""}${seg("modesel",md)}${seg("bandsel",h!=null?BANDS[h]:(nar?T("All","All"):T("All bands","All bands")))}${seg("eq",pw)}${seg("antsel",an,"qw1")}${al?seg("altin",(al.value||"0")+" m","qw2"):""}${gl?seg("gnd",gl,"qw2"):""}`;
  if(e.dataset.qh!==html){const lb0=$i("logbtn"),keep=lb0&&e.contains(lb0);if(keep)lb0.remove();e.innerHTML=html;e.dataset.qh=html;if(keep)e.appendChild(lb0)}
  const e2b=bar2();if(e2b){const h2=`${loc?seg("locin",loc,"qlocm"):""}${seg("antsel",an,"qn1")}${al?seg("altin",(al.value||"0")+" m","qn2"):""}${gl?seg("gnd",gl,"qn2"):""}`;
    let w=e2b.querySelector(".qsb2");if(!w){w=document.createElement("span");w.className="qsb2";e2b.prepend(w)}if(w.dataset.qh!==h2){w.innerHTML=h2;w.dataset.qh=h2}
    /* 2.11.94: en pantallas anchas, “Mi log” también en la línea principal (antes solo dentro del desplegable) */
    const lb=$i("logbtn"),wide=innerWidth>=1280,dst=wide?e:e2b;if(lb){lb.classList.toggle("qslog",wide);if(lb.parentElement!==dst)dst.appendChild(lb)}}
  /* 2.11.19: el botón de arriba es solo una flecha; el locator está dentro del desplegable */
  const sl=document.querySelector("#stbtn .stl");if(sl&&sl.textContent)sl.textContent="";
  return true}
window.ACRACB_qsSum=()=>{try{sum()}catch(_){}};
let RZT=0;addEventListener("resize",()=>{clearTimeout(RZT);RZT=setTimeout(()=>{try{sum()}catch(_){}},200)});
function bar2(){let b=$i("ssum2");const p=$i("stpanel");if(!b&&p){b=document.createElement("div");b.id="ssum2";b.className="qsbar ssum2";p.prepend(b)}return b}
/* el resumen de la base se sustituye por el tocable, con los mismos datos */
function hook(){if(typeof renderSum!=="function"||!$i("ssum"))return setTimeout(hook,300);
  const r0=renderSum;renderSum=function(){const v=r0.apply(this,arguments);try{$i("ssum").dataset.qh="";sum()}catch(e){console.error(e)}return v};
  try{sum()}catch(e){}}
/* ---------- menú ---------- */
let M=null,MB=null,IGN=false;
function close(focus){if(!M)return;M.remove();M=null;if(MB){MB.setAttribute("aria-expanded","false");MB.classList.remove("on");if(focus)try{MB.focus({preventScroll:true})}catch(_){}}MB=null}
function open(b){const id=b.dataset.qs,s=$i(id);if(!s)return;if(MB===b){close(true);return}close();MB=b;b.setAttribute("aria-expanded","true");b.classList.add("on");
  if(s.tagName==="INPUT"){const isL=id==="locin";M=document.createElement("div");M.className="qsm qsf";
    M.innerHTML=`<label class="qsfl">${isL?T("Locator","Locator"):T("Altitud sobre el nivel del mar","Altitude above sea level")}</label><div class="qsfr"><input class="qsfi" ${isL?`type="text" maxlength="10" autocomplete="off" spellcheck="false" autocapitalize="characters" placeholder="IM98RI"`:`type="number" inputmode="numeric" min="0" max="5000" step="10"`} value="${e2(s.value)}">${isL?"":`<span class="qsfu">m</span>`}<button type="button" class="qsfo">${T("Apply","Apply")}</button></div><p class="qsfn"></p>`;
    document.body.appendChild(M);place();const inp=M.querySelector(".qsfi");const go=()=>{s.value=inp.value.trim();if(isL){const ok=$i("locok");IGN=true;try{if(ok)ok.click()}finally{IGN=false}const w=$i("locw");if(s.getAttribute("aria-invalid")==="true"){M.querySelector(".qsfn").textContent=w?w.textContent:"";return}}
      else{s.dispatchEvent(new Event("change",{bubbles:true}))}close(true);setTimeout(()=>{try{$i("ssum").dataset.qh="";sum()}catch(_){}},80)};
    M.querySelector(".qsfo").onclick=e=>{e.stopPropagation();go()};inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();e.stopPropagation();go()}});
    try{inp.focus({preventScroll:true});inp.select()}catch(_){}return}
  const item=o=>`<button type="button" role="option" class="qsi${o.value===s.value?" sel":""}" data-v="${e2(o.value)}" aria-selected="${o.value===s.value}"${o.disabled?" disabled":""}>${e2(o.textContent)}</button>`;
  let h="";for(const n of s.children){if(n.tagName==="OPTGROUP"){h+=`<div class="qsg">${e2(n.label)}</div>`+[...n.children].map(item).join("")}else if(n.tagName==="OPTION")h+=item(n)}
  M=document.createElement("div");M.className="qsm";M.setAttribute("role","listbox");M.setAttribute("aria-label",s.getAttribute("aria-label")||"");M.innerHTML=h;document.body.appendChild(M);place();
  const cur=M.querySelector(".qsi.sel")||M.querySelector(".qsi");if(cur){cur.scrollIntoView({block:"center"});try{cur.focus({preventScroll:true})}catch(_){}}}
function place(){if(!M||!MB)return;const r=MB.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,m=8;
  M.style.minWidth=Math.max(160,Math.round(r.width))+"px";M.style.maxHeight="";const below=vh-r.bottom-m,above=r.top-m;
  const up=below<220&&above>below;const mh=Math.max(140,Math.min(vh*.6,up?above:below)-6);M.style.maxHeight=mh+"px";
  const w=M.offsetWidth,left=Math.max(m,Math.min(r.left,vw-w-m));M.style.left=left+"px";
  if(up){M.style.top="";M.style.bottom=(vh-r.top+4)+"px"}else{M.style.bottom="";M.style.top=(r.bottom+4)+"px"}}
function pick(v){const s=MB&&$i(MB.dataset.qs);close(true);if(!s||s.value===v)return;s.value=v;s.dispatchEvent(new Event("change",{bubbles:true}));
  setTimeout(()=>{try{$i("ssum").dataset.qh="";sum()}catch(_){}},60)}
/* tocar una pieza abre su menú y no el panel entero */
document.addEventListener("click",e=>{if(IGN)return;const t=e.target;if(!t.closest)return;const b=t.closest(".qsbar .qs");
  if(b){e.stopPropagation();e.preventDefault();open(b);return}
  const it=t.closest(".qsm .qsi");if(it&&!it.disabled){e.stopPropagation();pick(it.dataset.v);return}
  if(t.closest(".qsf"))return;
  if(M&&!t.closest(".qsm"))close()},true);
document.addEventListener("pointerdown",e=>{if(e.target.closest&&e.target.closest(".qsbar .qs"))e.stopPropagation();else if(M&&!(e.target.closest&&e.target.closest(".qsm")))close()},true);
document.addEventListener("keydown",e=>{const b=e.target.closest&&e.target.closest(".qsbar .qs");if(b&&(e.key==="Enter"||e.key===" "||e.key==="ArrowDown")){e.preventDefault();e.stopPropagation();if(MB!==b)open(b);return}
  if(!M)return;if(e.key==="Escape"){e.preventDefault();close(true);return}if(e.target.closest&&e.target.closest(".qsf"))return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();const it=[...M.querySelectorAll(".qsi:not([disabled])")];let i=it.indexOf(document.activeElement);i=e.key==="ArrowDown"?Math.min(it.length-1,i+1):Math.max(0,i-1);if(it[i])it[i].focus()}
  if(e.key==="Tab")close()},true);
let RW=innerWidth;addEventListener("resize",()=>{close();if((RW<=480)!==(innerWidth<=480)){RW=innerWidth;try{sum()}catch(_){}}},{passive:true});
addEventListener("scroll",e=>{if(M&&!(e.target&&e.target.closest&&e.target.closest(".qsm")))place()},{passive:true,capture:true});
/* 2.11.6: “Editar estación” es solo un icono: su texto pasa a ser el título y la etiqueta accesible */
function btnT(){const b=$i("stbtn");if(!b)return;if(!b.querySelector(".stl")){const l=document.createElement("b");l.className="stl";l.setAttribute("aria-hidden","true");b.appendChild(l);try{$i("ssum").dataset.qh="";sum()}catch(_){}}const p=$i("stpanel"),sl=b.closest(".sline");if(p&&sl&&p.parentElement!==sl)sl.appendChild(p);
  /* 2.11.18: el botón del locator solo abre y cierra el panel. El manejador antiguo reescribía el botón entero (“Cerrar” /
     “Editar estación”) y borraba el locator, que ya no volvía al cerrar */
  if(p){const loc=()=>{try{return ($i("loc")&&$i("loc").value||"").toUpperCase()}catch(_){return ""}};
    b.onclick=()=>{p.hidden=!p.hidden;b.setAttribute("aria-expanded",String(!p.hidden));
      let l=b.querySelector(".stl");if(!l){b.textContent="";l=document.createElement("b");l.className="stl";l.setAttribute("aria-hidden","true");b.appendChild(l)}
      [...b.childNodes].forEach(n=>{if(n!==l)n.remove()});l.textContent="";try{sum()}catch(_){}
      if(!p.hidden)p.scrollIntoView({block:"nearest"})}}
  const f=()=>{const t=b.getAttribute("aria-expanded")==="true"?T("Ocultar tu estación","Hide your station"):T("Tu estación: locator, antena, altura y suelo","Your station: locator, antenna, height and ground");if(b.title!==t){b.title=t;b.setAttribute("aria-label",t)}};f();
  new MutationObserver(f).observe(b,{attributes:true,attributeFilter:["aria-expanded"],childList:true,subtree:true,characterData:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{hook();btnT()});else{hook();btnT()}
})();

/* ---- ACRACB 2.10.35: menú “Vista” ----
   Antes había dos botones de solo icono en la cabecera (completa/compacta y tarjetas/lista): no se sabía cuál era cuál
   ni en qué estado estaban, y al cambiar solo se redibujaba el clúster (el resto seguía igual hasta la siguiente
   actualización) y la página saltaba. Ahora es un único botón “Vista” que abre un menú con texto:
     Detalle: Completa | Compacta        Estaciones: Tarjetas | Lista
   Al elegir se redibuja todo a la vez y la página se queda donde estabas. */
(function(){
"use strict";
if(window.__hkVM)return;window.__hkVM=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const IC_CARDS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/></svg>';
const IC_LIST='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>';
const isC=()=>{try{return ACRACB_view()==="compact"}catch(e){return false}},isL=()=>{try{return !!ACRACB_list()}catch(e){return false}};
function label(){return (isC()?T("Compacta","Compact"):T("Completa","Full"))+" · "+(isL()?T("Lista","List"):T("Tarjetas","Cards"))}
function paintBtn(){const b=document.getElementById("viewbtn");if(!b)return;b.innerHTML=(isL()?IC_LIST:IC_CARDS)+`<span class="vbt">${T("View","View")}</span>`;
  b.classList.toggle("vbon",isC()||isL());b.title=T("Vista: ","View: ")+label()+T(" (pulsa para cambiarla)"," (tap to change)");b.setAttribute("aria-label",b.title)}
function menuHTML(){const opt=(k,v,on,tx)=>`<button type="button" role="radio" aria-checked="${on}" data-vm="${k}:${v}">${tx}</button>`;
  return `<p class="vmh">${T("Cómo se ve la plataforma","How the platform looks")}</p>
  <div class="vmg"><span class="vml" id="vml1">${T("Detail","Detail")}</span><div class="vmseg" role="radiogroup" aria-labelledby="vml1">${opt("view","full",!isC(),T("Completa","Full"))}${opt("view","compact",isC(),T("Compacta","Compact"))}</div>
  <small>${isC()?T("Lo esencial de un vistazo, sin explicaciones.","The essentials at a glance, without explanations."):T("Todo, con sus explicaciones y desplegables.","Everything, with its explanations and folds.")}</small></div>
  <div class="vmg"><span class="vml" id="vml2">${T("Estaciones","Stations")}</span><div class="vmseg" role="radiogroup" aria-labelledby="vml2">${opt("list","0",!isL(),T("Tarjetas","Cards"))}${opt("list","1",isL(),T("Lista","List"))}</div>
  <small>${isL()?T("Una fila por estación, como un clúster web. Toca una fila para ver sus detalles.","One row per station, like a web cluster. Tap a row to see its details."):T("Una tarjeta por estación, con todos sus datos.","One card per station, with all its data.")}</small></div>`}
function place(m,b){const r=b.getBoundingClientRect(),vw=document.documentElement.clientWidth;const w=Math.min(340,vw-16);m.style.width=w+"px";
  let x=r.right-w;if(x<8)x=8;if(x+w>vw-8)x=vw-8-w;m.style.left=x+"px";m.style.top=(r.bottom+6)+"px"}
function open(){const b=document.getElementById("viewbtn");if(!b)return;let m=document.getElementById("viewmenu");
  if(!m){m=document.createElement("div");m.id="viewmenu";m.className="viewmenu";m.setAttribute("role","dialog");document.body.appendChild(m)}
  m.setAttribute("aria-label",T("View","View"));m.innerHTML=menuHTML();m.hidden=false;place(m,b);b.setAttribute("aria-expanded","true");
  const f=m.querySelector('[aria-checked="true"]');if(f)try{f.focus({preventScroll:true})}catch(e){}}
function close(){const m=document.getElementById("viewmenu");if(m)m.hidden=true;const b=document.getElementById("viewbtn");if(b)b.setAttribute("aria-expanded","false")}
/* redibujar todo y dejar la página donde estaba: se toma como referencia la primera sección visible */
/* 2.10.36: más rápido. Antes se vaciaba la caché de cálculos (VOACAP, probabilidades…) y se recalculaba todo: no hace
   falta, solo cambia cómo se pintan las tarjetas. El menú se marca al instante y el redibujado va justo después, en el
   siguiente fotograma, y si se pulsan varias opciones seguidas solo se redibuja una vez. */
let RT=0;
function reflow(){cancelAnimationFrame(RT);RT=requestAnimationFrame(()=>setTimeout(()=>{
  const tops=[...document.querySelectorAll("details.fold,.card,section.page")].filter(e=>e.getClientRects().length);
  const ref=tops.find(e=>e.getBoundingClientRect().bottom>90),y0=ref?ref.getBoundingClientRect().top:0;
  try{refresh()}catch(e){}try{window.ACRACB_clrender&&ACRACB_clrender()}catch(e){}try{renderAlerts()}catch(e){}try{window.renderAlBar&&renderAlBar()}catch(e){}
  if(ref){const d=ref.getBoundingClientRect().top-y0;if(Math.abs(d)>2)window.scrollBy(0,d)}},0))}
function btn(){if(document.getElementById("viewbtn"))return true;const z=document.getElementById("zoombtn");if(!z)return false;
  const b=document.createElement("button");b.id="viewbtn";b.type="button";b.className="thbtn viewbtn vbtn";b.setAttribute("aria-haspopup","dialog");b.setAttribute("aria-expanded","false");
  z.parentElement.insertBefore(b,z);paintBtn();
  b.addEventListener("click",ev=>{ev.stopPropagation();const m=document.getElementById("viewmenu");if(m&&!m.hidden)close();else open()});return true}
document.addEventListener("click",ev=>{const t=ev.target;if(!t.closest)return;const o=t.closest("#viewmenu [data-vm]");
  if(o){const [k,v]=o.dataset.vm.split(":");if(k==="view")ACRACB_view(v);else ACRACB_list(v==="1");paintBtn();
    const m=document.getElementById("viewmenu");if(m){m.innerHTML=menuHTML();const f=m.querySelector(`[data-vm="${k}:${v}"]`);if(f)try{f.focus({preventScroll:true})}catch(e){}}
    reflow();return}
  if(!t.closest("#viewmenu")&&!t.closest("#viewbtn"))close()});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"){const m=document.getElementById("viewmenu");if(m&&!m.hidden){close();const b=document.getElementById("viewbtn");b&&b.focus()}}});
["resize","scroll"].forEach(e=>window.addEventListener(e,()=>{const m=document.getElementById("viewmenu"),b=document.getElementById("viewbtn");if(m&&!m.hidden&&b)place(m,b)},{passive:true}));
(function tryB(n){if(!btn()&&n<40)setTimeout(()=>tryB(n+1),150)})(0);
})();

/* ---- ACRACB 2.10.37: trucos de concurso a tu medida ----
   En Concursos › Trucos se elige la categoría con la que participas (monooperador, asistido o multioperador), la potencia
   (QRP, Low Power o High Power), si vas a todas las bandas o a una sola y, en los concursos con varios modos, el modo. Los trucos
   se arman con tres piezas: las reglas de ese concurso (las de siempre), las de tu categoría y potencia, y las de tu modo.
   Lo que depende de las bases de cada concurso se dice así, y se remite a ellas. */
(function(){
"use strict";
if(window.__hkCTR)return;window.__hkCTR=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const K="acracb_ctcat";
function pwDef(){try{const w=parseFloat(String(PWN()).replace(",","."));if(w<=5)return "qrp";if(w>100)return "hp"}catch(_){}return "lp"}
function get(){let o={};try{o=JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(_){}return {op:o.op||"so",pw:o.pw||pwDef(),bd:o.bd!=null?String(o.bd):"all",md:o.md||""}}
function put(o){try{localStorage.setItem(K,JSON.stringify(o))}catch(_){}}
/* jugadas propias del LZ DX: las reglas ya las explica el párrafo de arriba, aquí solo lo que hacer con ellas */
const LZ=[["Las estaciones búlgaras valen más que nada: búscalas en cada banda que abra.","Bulgarian stations are worth more than anything: look for them on every band that opens."],
  ["Si haces CW y SSB, vuelve a trabajar a los mismos en el otro modo: el QSO vuelve a contar.","If you do CW and SSB, work the same stations again on the other mode: the QSO counts again."],
  ["Los multiplicadores solo cuentan una vez por banda: muévelos de banda, no de modo.","Multipliers count only once per band: move them across bands, not modes."]];
function catTips(o,c){const L=[],a=(es,en)=>L.push(T(es,en));
  if(o.op==="so"){a("Monooperador sin asistencia: en la mayoría de concursos, usar el clúster, el Reverse Beacon o un Skimmer te pasa a la categoría asistida. Compruébalo en las bases.","Unassisted single operator: in most contests, using the cluster, the Reverse Beacon or a Skimmer moves you to the assisted category. Check the rules.");
    a("Sin clúster, los multiplicadores se buscan girando el dial: recorre la banda de punta a punta cada vez que cambies.","Without the cluster, multipliers are found by tuning: sweep the band end to end every time you change.")}
  if(o.op==="soa"){a("Asistido: el clúster te dice dónde están los multiplicadores; DX › Clúster te los marca. Nunca te anuncies tú mismo.","Assisted: the cluster tells you where the multipliers are; DX › Cluster marks them for you. Never spot yourself.");
    a("No persigas cada spot: si la cola es larga, vuelve a llamar CQ y deja el multiplicador para cuando baje.","Do not chase every spot: if the pile-up is long, go back to calling CQ and leave the multiplier for later.")}
  if(o.op==="multi"){a("Multioperador: uno llama CQ sin parar y otro busca multiplicadores. Cada categoría limita los cambios de banda (en el CQ WW, multi-single, 10 minutos en una banda antes de cambiar): compruébalo en las bases.","Multi-operator: one operator runs CQ and another hunts multipliers. Each category limits band changes (in CQ WW multi-single, 10 minutes on a band before changing): check the rules.");
    a("Turnos de 2 a 4 horas y el plan de bandas de arriba a la vista de todos.","Shifts of 2 to 4 hours, with the band plan above in view for everyone.")}
  if(o.op!=="multi"&&c.so)a(`Como monooperador puedes operar ${c.so} of the ${c.h} h: abajo tienes las mejores horas para las pausas.`,`As a single operator you can operate ${c.so} of the ${c.h} hours: the best times for your breaks are below.`);
  if(o.pw==="qrp"){a("QRP (5 W o menos en todos los modos, como mandan las bases): busca tú (S&P) más que llamar CQ, y aprovecha las primeras horas de cada apertura, cuando aún no hay colas.","QRP (5 W or less on every mode, per the rules): search and pounce rather than calling CQ, and use the first hours of each opening, before the pile-ups.");
    a("Llama justo cuando la otra estación termina el QSO anterior y repite tu indicativo completo una sola vez.","Call right as the other station finishes the previous QSO and give your full callsign once.")}
  if(o.pw==="lp")a("Low Power (hasta 100 W): llama CQ en las bandas altas cuando estén abiertas y busca tú en las bajas, donde manda la potencia.","Low Power (up to 100 W): call CQ on the high bands when they are open and search and pounce on the low bands, where power rules.");
  if(o.pw==="hp")a("High Power (más de 100 W): ocupa una frecuencia pronto y no la sueltes; en las bandas bajas, de noche, es donde más diferencia marca.","High Power (over 100 W): claim a frequency early and hold it; the low bands at night are where it makes the biggest difference.");
  if(o.bd!=="all"){const b=+o.bd;a(`Monobanda en ${BANDS[b]}: todos los multiplicadores tienen que salir de esa banda. Llama CQ en cuanto abra y aprovecha la línea gris en los extremos de la apertura.`,`Single band on ${BANDS[b]}: every multiplier has to come from that band. Call CQ as soon as it opens and use the greyline at the edges of the opening.`)}
  return L}
function modeTips(m){const L=[],a=(es,en)=>L.push(T(es,en));
  if(m==="ssb"){a("SSB: di tu indicativo con el alfabeto fonético internacional, siempre igual, y el intercambio de una vez, sin adornos.","SSB: give your callsign in the international phonetic alphabet, always the same way, and the exchange in one go, without extras.");
    a("Graba el CQ en la memoria del equipo o del programa: tu voz te durará todo el concurso.","Record your CQ in the radio or logging program memory: your voice will last the whole contest.")}
  if(m==="cw"){a("CW: si llamas CQ, el Reverse Beacon te anuncia solo en los clústeres; una frecuencia limpia y un CQ corto atraen colas.","CW: if you call CQ, the Reverse Beacon spots you automatically on the clusters; a clear frequency and a short CQ attract pile-ups.");
    a("Ajusta la velocidad a la de quien te llama: si contesta despacio, baja tú también.","Match the speed of whoever calls you: if they answer slowly, slow down too.")}
  if(m==="rtty"){a("RTTY: macros cortas, con el indicativo dos veces solo en el CQ, y doble descodificador si tu programa lo permite.","RTTY: short macros, with your callsign twice only in the CQ, and a second decoder if your program allows it.")}
  return L}
function ui(o,c){const opt=(k,v,on,tx)=>`<button type="button" role="radio" aria-checked="${on}" data-ctc="${k}:${v}">${tx}</button>`;
  const ms=(c.modes||[]).length>1?`<div class="ctg"><span class="ctl">${T("Mode","Mode")}</span><div class="ctseg" role="radiogroup">${c.modes.map(m=>opt("md",m,o.md===m,m.toUpperCase())).join("")}${opt("md","mix",o.md==="mix",T("Los dos","Both"))}</div></div>`:"";
  const bs=(c.bands||[]).length>1?`<div class="ctg"><span class="ctl">${T("Bands","Bands")}</span><select data-ctb aria-label="${T("Bands","Bands")}"><option value="all"${o.bd==="all"?" selected":""}>${T("All","All")}</option>${c.bands.map(b=>`<option value="${b}"${String(b)===o.bd?" selected":""}>${T("Solo","Only")} ${BANDS[b]}</option>`).join("")}</select></div>`:"";
  return `<div class="ctcat" aria-label="${T("Cómo participas","How you take part")}"><p class="cth">${T("Cómo participas","How you take part")}</p>
   <div class="ctg"><span class="ctl">${T("Categoría","Category")}</span><div class="ctseg" role="radiogroup">${opt("op","so",o.op==="so",T("Mono","Single"))}${opt("op","soa",o.op==="soa",T("Asistido","Assisted"))}${opt("op","multi",o.op==="multi",T("Multi","Multi"))}</div></div>
   <div class="ctg"><span class="ctl">${T("Power","Power")}</span><div class="ctseg" role="radiogroup">${opt("pw","qrp",o.pw==="qrp","QRP")}${opt("pw","lp",o.pw==="lp","Low Power")}${opt("pw","hp",o.pw==="hp","High Power")}</div></div>
   ${ms}${bs}</div>`}
function paint(){const box=document.getElementById("tricks");if(!box||!box.innerHTML)return;let c=null,key="";try{c=CT();key=document.getElementById("contest").value}catch(_){return}if(!c)return;
  const o=get();if((c.modes||[]).length>1){if(!o.md||(o.md!=="mix"&&!c.modes.includes(o.md))){let m="";try{m=MOD()}catch(_){}o.md=c.modes.includes(m)?m:c.modes[0]}}else o.md=(c.modes||[""])[0];
  if(o.bd!=="all"&&!(c.bands||[]).includes(+o.bd))o.bd="all";
  const ul=box.querySelector(":scope > ul");if(!ul)return;
  let base=[];try{base=(TRICKS[key]||TRICKS[c.base]||[]).slice()}catch(_){}
  if(key==="lzdx")base=LZ.map(x=>T(x[0],x[1]));
  const mt=o.md==="mix"?c.modes.flatMap(modeTips):modeTips(o.md);
  const grp=(t,arr)=>arr.length?`<li class="ctgh">${t}</li>`+arr.map(x=>`<li>${x}</li>`).join(""):"";
  const html=grp(T("De este concurso","For this contest"),base)+grp(T("Para tu categoría y potencia","For your category and power"),catTips(o,c))+grp(T("Para tu modo","For your mode"),mt);
  let cat=box.querySelector(".ctcat");const nu=ui(o,c);if(cat)cat.outerHTML=nu;else ul.insertAdjacentHTML("beforebegin",nu);
  ul.classList.add("ctul");ul.innerHTML=html+`<li class="ctnote">${T("Las reglas cambian de un año a otro: confírmalas en las bases de este año antes de empezar.","Rules change from year to year: confirm them in this year's rules before you start.")}</li>`}
function hook(){if(typeof renderContest!=="function")return setTimeout(hook,300);const r0=renderContest;renderContest=function(){const v=r0.apply(this,arguments);try{paint()}catch(e){console.error(e)}return v};try{paint()}catch(e){}}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-ctc]");if(!b)return;const [k,v]=b.dataset.ctc.split(":");const o=get();o[k]=v;put(o);try{paint()}catch(e){}});
document.addEventListener("change",ev=>{const s=ev.target;if(!s.matches||!s.matches("[data-ctb]"))return;const o=get();o.bd=s.value;put(o);try{paint()}catch(e){}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hook);else hook();
})();

/* ---- ACRACB 2.10.43: aviso legal, propiedad intelectual, exención de responsabilidad y privacidad ----
   Texto completo en español y en inglés. La plataforma es del radioclub ACRACB, con todos los derechos reservados; su
   idea, diseño y realización son de Alfredo, EA5JNF (autoría reconocida de forma irrenunciable).
   Lo de terceros (bibliotecas, letras, datos) sigue bajo su propia licencia: textos completos en licencias/. */
(function(){
"use strict";
if(window.__hkLegal)return;window.__hkLegal=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const REPO="https://github.com/EA5JNF/plataforma-dx/issues";
function legalHTML(){const L=EN()?"licencias/index.html#en":"licencias/index.html";
  const h=(t)=>`<h4>${t}</h4>`,p=(t)=>`<p class="note">${t}</p>`,ul=(a)=>`<ul class="note">${a.map(x=>`<li>${x}</li>`).join("")}</ul>`;
  return h(T("Titular y uso","Owner and use"))+
   p(T("La Plataforma DX es del radioclub ACRACB (EA5RKB). Su idea original, su diseño y su realización son obra de Alfredo, EA5JNF. Es un servicio gratuito, sin publicidad, sin registro y sin ninguna actividad económica.",
       "The DX Platform belongs to the ACRACB radio club (EA5RKB). Its original idea, design and development are the work of Alfredo, EA5JNF. It is a free service, with no advertising, no sign-up and no economic activity."))+
   p(T(`Contacto: a través del radioclub EA5RKB o en <a href="${REPO}" target="_blank" rel="noopener noreferrer">la página de incidencias del proyecto</a>, que es pública: no escribas allí datos personales.`,
       `Contact: through the EA5RKB radio club or on <a href="${REPO}" target="_blank" rel="noopener noreferrer">the project's issue page</a>, which is public: do not post personal data there.`))+
   h(T("Propiedad intelectual","Intellectual property"))+
   p(T("© 2026 ACRACB. Todos los derechos reservados sobre el diseño, la estructura, los textos, la selección de datos y el código propios de la plataforma: queda prohibida su copia, reproducción, distribución o adaptación, total o parcial, sin permiso escrito de ACRACB.",
       "© 2026 ACRACB. All rights reserved over the platform's own design, structure, texts, data selection and code: copying, reproduction, distribution or adaptation, in whole or in part, is prohibited without ACRACB's written permission."))+
   p(T("Alfredo, EA5JNF, es el autor de la idea original, el diseño y la realización de la plataforma, y así debe constar siempre. Ese reconocimiento de autoría es un derecho moral del autor, irrenunciable e inalienable (artículo 14 de la Ley de Propiedad Intelectual), que no se puede ceder, suprimir ni atribuir a otra persona.",
       "Alfredo, EA5JNF, is the author of the platform's original idea, design and development, and this must always be stated. That recognition of authorship is the author's moral right, which cannot be waived or transferred (article 14 of the Spanish Intellectual Property Act), and cannot be assigned, removed or attributed to anyone else."))+
   p(T(`Quedan fuera de esa reserva los elementos de terceros, que siguen bajo sus propias licencias y se pueden reutilizar en sus términos: las bibliotecas D3, TopoJSON, fflate y satellite.js, las letras IBM Plex y Saira, las banderas, los nombres del mapa derivados de world-countries (licencia ODbL) y la copia de datos de SatNOGS (CC BY-SA 4.0 license). Textos completos en <a href="${L}" target="_blank" rel="noopener">Licencias</a>.`,
       `Third-party elements are outside that reservation; they remain under their own licenses and may be reused on their terms: the D3, TopoJSON, fflate and satellite.js libraries, the IBM Plex and Saira typefaces, the flags, the map names derived from world-countries (ODbL license) and the copy of SatNOGS data (CC BY-SA 4.0 license). Full texts in <a href="${L}" target="_blank" rel="noopener">Licenses</a>.`))+
   p(T("Los datos de cada fuente son de sus titulares, que se citan en “Fuentes y agradecimientos”. Las marcas y nombres citados son de sus propietarios, y la plataforma no está afiliada a ninguno de ellos.",
       "Each source's data belongs to its owners, who are listed in “Sources and thanks”. The trademarks and names mentioned belong to their owners, and the platform is not affiliated with any of them."))+
   h(T("Exención de responsabilidad","Disclaimer"))+
   ul([T("Las previsiones de propagación, las fiabilidades de cada camino, los ritmos y las puntuaciones son estimaciones propias, orientativas y sin garantía.","Propagation forecasts, QSO chances, rates and scores are our own estimates, for guidance only and without any warranty."),
       T("Los spots, avisos, DXpediciones y datos solares llegan de fuentes externas y pueden contener errores o llegar con retraso.","Spots, alerts, DXpeditions and solar data come from external sources and may contain errors or arrive late."),
       T("Cada operador es responsable de respetar su licencia, el Reglamento de radioaficionados (Orden IET/1311/2013), el Cuadro Nacional de Atribución de Frecuencias (Orden TDF/732/2026), el plan de bandas de la IARU Región 1 y las bases de cada concurso.","Each operator is responsible for complying with their license, the Spanish amateur radio regulations (Orden IET/1311/2013), the National Frequency Allocation Table (Orden TDF/732/2026), the IARU Region 1 band plan and each contest's rules."),
       T("Los enlaces llevan a webs ajenas, de cuyo contenido la plataforma no responde.","Links lead to third-party websites, whose content the platform is not responsible for.")])+
   h(T("Privacidad","Privacy"))+
   ul([T("Responsable: el radioclub ACRACB (EA5RKB), con el contacto de arriba.","Controller: the ACRACB radio club (EA5RKB), at the contact above."),
       T("Sin registro, sin cuentas, sin cookies, sin analítica y sin seguimiento.","No sign-up, no accounts, no cookies, no analytics and no tracking."),
       T("En tu dispositivo, en el almacenamiento del navegador, se guardan solo tus ajustes, tu log ADIF, tus marcas “lo oigo / no lo oigo” y una copia de la web para usarla sin conexión. Son necesarios para las funciones que tú pides, así que no requieren consentimiento, y no salen del dispositivo. Para borrarlos, usa “Quitar el log” o borra los datos de esta web en el navegador.","On your device, in the browser's storage, only your settings, your ADIF log, your “I hear it / I don't” marks and a copy of the site for offline use are kept. They are needed for the features you ask for, so they require no consent, and they never leave the device. To erase them, use “Remove the log” or clear this site's data in the browser."),
       T("Al servirte la web y los datos, GitHub Pages (GitHub, de Microsoft) y Cloudflare (intermediario de datos y previsión VOACAP), ambos con servidores en EE. UU., y las fuentes consultadas ven tu dirección IP, como en cualquier web. El club no guarda registros de acceso y el intermediario no guarda nada.","When serving you the site and data, GitHub Pages (GitHub, owned by Microsoft) and Cloudflare (data relay and VOACAP forecast), both with servers in the USA, and the sources queried see your IP address, as with any website. The club keeps no access logs and the relay stores nothing."),
       T("Tu indicativo solo sale del dispositivo si pulsas “Comprobar” en “¿Me oyen?”, para buscarlo en las redes de escucha (Spothole, HamQTH y wspr.live), o si publicas un spot: entonces va, con el spot, al clúster de la plataforma (el intermediario del club en Cloudflare), donde lo ven todos los socios y se guarda una hora; después se borra. Después se envía también a los clústeres que admiten spots sin registro: SpottedHam, WA9PIE y EA7JXH. Las notificaciones las genera tu navegador, sin servidor de envío.","Your callsign only leaves the device if you tap “Check” in “Who hears me?”, to look it up on the listening networks (Spothole, HamQTH and wspr.live). Notifications are generated by your browser, with no push server. If you post a spot, your callsign goes with it to the platform cluster (the club\'s Cloudflare relay), where every member sees it and it is kept for one hour, then deleted. It is then also sent to the clusters that accept spots without registration: SpottedHam, WA9PIE and EA7JXH."),
       T("Indicativos de terceros: la plataforma muestra los que publican los clústeres y programas de actividad, sin guardarlos en ningún servidor. La web no guarda ninguna lista de indicativos; solo los spots que publican los socios, una hora. Base legal: interés legítimo en facilitar la actividad de radioaficionado (art. 6.1.f del RGPD).","Third-party callsigns: the platform shows those published by clusters and activity programs, without storing them on any server. The site keeps no list of callsigns; only the spots members post, for one hour. Legal basis: legitimate interest in supporting amateur radio activity (GDPR art. 6.1.f)."),
       T(`Puedes pedir acceso, rectificación, supresión, oposición o limitación con el contacto de arriba, y reclamar ante la <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">Agencia Española de Protección de Datos</a>.`,`You can request access, rectification, erasure, objection or restriction at the contact above, and complain to the <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">Spanish Data Protection Agency</a>.`)])}
function fill(){const g=document.getElementById("legal");if(g&&!g.dataset.ok){g.dataset.ok="1";g.innerHTML=legalHTML()}
  const c=document.getElementById("credlegal");if(c&&!c.dataset.ok){c.dataset.ok="1";c.innerHTML=T(`<b>© 2026 ACRACB. Original idea, design and development: Alfredo, EA5JNF.</b> Todos los derechos reservados sobre lo propio de la plataforma. Lo de terceros sigue bajo su licencia: <a href="licencias/index.html" target="_blank" rel="noopener">Licencias</a>. Las marcas y nombres citados son de sus propietarios, y la plataforma no está afiliada a ninguno. Aviso legal y privacidad, al pie de la página.`,`<b>© 2026 ACRACB. Original idea, design and development: Alfredo, EA5JNF.</b> All rights reserved over the platform's own material. Third-party material remains under its license: <a href="licencias/index.html#en" target="_blank" rel="noopener">Licenses</a>. The trademarks and names mentioned belong to their owners, and the platform is not affiliated with any of them. Legal notice and privacy at the foot of the page.`)}
  const k=document.getElementById("copyl");if(k&&EN())k.textContent="© 2026 ACRACB. Original idea, design and development: Alfredo, EA5JNF. All rights reserved."}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fill);else fill();
})();

/* ---- ACRACB 2.10.44: más meteorología espacial, solo de fuentes públicas sin dudas de uso ----
   En Sol › Sol ahora: los avisos oficiales de NOAA de las últimas 24 h (traducidos), las regiones
   activas del Sol con la más compleja y su probabilidad de llamarada (NOAA), y tres imágenes del Sol en este momento:
   la corona en ultravioleta y las manchas (NASA SDO, uso libre sin fines comerciales con crédito) y el coronógrafo
   LASCO C3 de SOHO (ESA/NASA, mismo uso), donde se ven salir las eyecciones de masa coronal. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const KIND={ALERT:["Alerta","Alert"],WARNING:["Aviso","Warning"],WATCH:["Vigilancia","Watch"],SUMMARY:["Summary","Summary"],"EXTENDED WARNING":["Aviso prolongado","Extended warning"]};
const TX=[
 [/Geomagnetic K-index of (\d)\s*expected/i,m=>[`Se espera un índice K de ${m[1]}`,`K-index of ${m[1]} expected`]],
 [/Geomagnetic K-index of (\d)/i,m=>[`Índice K geomagnético de ${m[1]}`,`Geomagnetic K-index of ${m[1]}`]],
 [/Geomagnetic Sudden Impulse/i,()=>["Impulso geomagnético repentino: llega una perturbación del viento solar","Geomagnetic sudden impulse: a solar-wind disturbance has arrived"]],
 [/Geomagnetic Storm Category (G\d)/i,m=>[`Prevista tormenta geomagnética ${m[1]}: más ruido y caminos polares flojos`,`Geomagnetic storm ${m[1]} predicted: more noise and weak polar paths`]],
 [/X-ray Flux exceeded (M\d|X\d*)/i,m=>[`Rayos X por encima de ${m[1]}: posibles cortes de HF en la cara de día`,`X-ray flux above ${m[1]}: possible HF blackouts on the dayside`]],
 [/Type II Radio Emission/i,()=>["Emisión de radio de tipo II: probable eyección de masa coronal","Type II radio emission: a coronal mass ejection is likely"]],
 [/Type IV Radio Emission/i,()=>["Emisión de radio de tipo IV: llamarada importante","Type IV radio emission: a major flare"]],
 [/10cm Radio Burst/i,()=>["Estallido de radio en 10,7 cm","10.7 cm radio burst"]],
 [/Proton 10MeV Integral Flux exceeded 10pfu/i,()=>["Protones de más de 10 MeV por encima de 10 pfu: tormenta S1, caminos polares cerrados","Protons above 10 MeV over 10 pfu: S1 storm, polar paths closed"]],
 [/Proton 10MeV Integral Flux above 10pfu Expected/i,()=>["Se esperan protones de más de 10 MeV por encima de 10 pfu","Protons above 10 MeV over 10 pfu expected"]],
 [/Electron 2MeV Integral Flux exceeded 1000pfu/i,()=>["Electrones de 2 MeV por encima de 1000 pfu: afecta a los satélites, no a la HF","2 MeV electrons above 1000 pfu: affects satellites, not HF"]]];
function tr(a){for(const [re,f] of TX){const m=String(a.x||"").match(re);if(m)return f(m)[EN()?1:0]}return a.x}
function sev(a){const g=a.g||"",n=+g.slice(1)||0,x=String(a.x||"");if(n>=3||/X\d|Type IV/i.test(x))return "r";if(n>=1||/M\d|Type II|Proton|K-index of [5-9]|Storm/i.test(x))return "y";return "g"}
const when=t=>{const d=new Date(t);if(isNaN(d))return "";return d.toLocaleDateString(EN()?"en-US":"en-US",{day:"numeric",month:"short",timeZone:"UTC"})+" "+d.toISOString().slice(11,16)+" UTC"};
function alertsHTML(){const A=(typeof L!=="undefined"&&L.swAlerts)||null;if(!A)return "";
  if(!A.length)return `<h3>${T("Avisos oficiales de NOAA","Official NOAA alerts")}</h3><p class="note">${T("Ningún aviso, alerta ni vigilancia en las últimas 24 horas.","No alerts, warnings or watches in the last 24 hours.")}</p>`;
  return `<h3>${T("Avisos oficiales de NOAA (24 h)","Official NOAA alerts (24 h)")}</h3><ul class="swal">${A.slice(0,8).map(a=>{const k=KIND[a.k]||[a.k,a.k];
    return `<li class="lvc-${sev(a)}"><b>${e2(k[EN()?1:0])}</b> · ${e2(tr(a))}${a.g?` <span class="tag">${e2(a.g)}</span>`:""}<small>${e2(when(a.t))}</small></li>`}).join("")}</ul>`}
function regionsHTML(){const R=(typeof L!=="undefined"&&L.regions)||null;if(!R)return "";if(!R.n)return `<p class="note">${T("Sin regiones activas numeradas en el Sol.","No numbered active regions on the Sun.")}</p>`;
  const t=R.top||{},cx=/D/.test(String(t.mag||"").toUpperCase().replace(/^B/,""))?T("muy compleja: puede dar llamaradas fuertes","very complex: may produce strong flares"):/G/i.test(t.mag||"")?T("compleja","complex"):T("sencilla","simple");
  return `<p class="swrg">${T(`<b>${R.n}</b> ${R.n===1?"región activa":"regiones activas"} en el Sol`,`<b>${R.n}</b> active ${R.n===1?"region":"regions"} on the Sun`)}${R.spots?T(`, ${R.spots} manchas`,`, ${R.spots} spots`):""}.${t.ar?` ${T("La más compleja","The most complex")}: <b>AR ${e2(t.ar)}</b>${t.loc?` (${e2(t.loc)})`:""}, ${T("clase magnética","magnetic class")} ${e2(t.mag||"—")}, ${cx}${t.m!=null?` · ${T("llamarada M","M flare")} ${e2(t.m)}%`:""}${t.x!=null?` · X ${e2(t.x)}%`:""}.`:""} <small>NOAA SWPC, ${e2(R.day||"")}</small></p>`}
function imgsHTML(){const h=new Date().toISOString().slice(0,13).replace(/\D/g,"");
  const I=[["https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg",T("Corona UV","Corona UV"),T("Las zonas brillantes son las regiones activas; las oscuras, agujeros coronales que mandan viento solar rápido.","Bright areas are active regions; dark ones are coronal holes that send fast solar wind."),"SDO/AIA 193 Å"],
    ["https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMIIC.jpg",T("Sunspots","Sunspots"),T("Las manchas que cuenta el SSN.","The spots counted by the SSN."),"SDO/HMI"],
    ["https://soho.nascom.nasa.gov/data/realtime/c3/512/latest.jpg",T("Coronógrafo","Coronagraph"),T("Un halo alrededor del disco tapado es una eyección de masa coronal que viene hacia la Tierra.","A halo around the blocked disc is a coronal mass ejection heading for Earth."),"SOHO/LASCO C3"]];
  return `<h3>${T("Últimas imágenes del Sol","Latest images of the Sun")}</h3><div class="swim">${I.map(([u,t,d,c])=>`<figure><a href="${u}" target="_blank" rel="noopener noreferrer" data-ext><img src="${u}?h=${h}" alt="${e2(t)}" title="${e2(d)}" loading="lazy" decoding="async" width="512" height="512" referrerpolicy="no-referrer"></a><figcaption><b>${e2(t)}</b> <span class="swd">${e2(d)}</span> <small>${e2(c)}</small></figcaption></figure>`).join("")}</div>
   <details class="mdet swhow"><summary>${T("Cómo leer estas imágenes y qué significan para la radio","How to read these images and what they mean for radio")}</summary>
   <div class="swhg">   <p><b>${T("Corona UV","Corona UV")}.</b> ${T("Es la corona a más de un millón de grados. Las zonas brillantes son regiones activas: de ahí salen las llamaradas, que en minutos dejan sin señal las bandas del lado de día, empezando por las bajas. Las zonas oscuras son agujeros coronales: lanzan viento solar rápido que llega a la Tierra unos 2 a 4 días después de pasar por el centro del disco; entonces suele subir el Kp y empeoran los caminos que pasan cerca de los polos.","This is the corona at over a million degrees. Bright areas are active regions: flares come from there, and within minutes they wipe out the bands on the daylight side, starting with the low ones. Dark areas are coronal holes: they send fast solar wind that reaches Earth about 2 to 4 days after crossing the centre of the disc; Kp then tends to rise and paths near the poles get worse.")}</p>
   <p><b>${T("Sunspots","Sunspots")}.</b> ${T("Las manchas son zonas de campo magnético intenso. Cuantas más hay, más radiación ultravioleta llega a la ionosfera y más alta es la MUF: abren 10, 12 y 15 m. Los grupos grandes y desordenados son los que dan llamaradas. El Sol gira en unos 27 días: lo que asoma por el borde izquierdo mirará a la Tierra en las próximas dos semanas.","Sunspots are areas of intense magnetic field. The more there are, the more ultraviolet reaches the ionosphere and the higher the MUF: 10, 12 and 15 m open. Large, messy groups are the ones that produce flares. The Sun turns in about 27 days: what appears at the left edge will face Earth over the next two weeks.")}</p>
   <p><b>${T("Coronógrafo","Coronagraph")}.</b> ${T("Un disco tapa el Sol para ver lo que sale de él; el círculo blanco marca su tamaño. Las nubes que se alejan son eyecciones de masa coronal. Si rodean todo el disco (un halo), vienen hacia la Tierra o van justo al lado contrario: si vienen, llegan en 1 a 4 días y pueden traer tormenta geomagnética, con HF peor, sobre todo hacia el norte, y posibilidad de aurora en VHF. Las rayas rectas son estrellas o planetas que saturan la cámara.","A disc blocks the Sun to show what leaves it; the white circle marks its size. Clouds moving outwards are coronal mass ejections. If they surround the whole disc (a halo), they are coming toward Earth or going exactly the other way: if they come, they arrive in 1 to 4 days and can bring a geomagnetic storm, with worse HF, especially to the north, and a chance of aurora on VHF. Straight streaks are stars or planets saturating the camera.")}</p></div></details>
   <p class="note">${T("Imágenes de NASA SDO (courtesy of NASA/SDO and the AIA and HMI science teams) y de SOHO (courtesy of the SOHO/LASCO consortium; SOHO is a project of international cooperation between ESA and NASA). Cada imagen lleva impresa su hora (UTC): las de SDO se renuevan cada pocos minutos y la del coronógrafo suele ir varias horas por detrás.","Images from NASA SDO (courtesy of NASA/SDO and the AIA and HMI science teams) and SOHO (courtesy of the SOHO/LASCO consortium; SOHO is a project of international cooperation between ESA and NASA). Each image shows its time (UTC): SDO images are renewed every few minutes and the coronagraph one usually lags several hours.")}</p>`}
function add(){const el=document.getElementById("sunnow");if(!el)return;
  const h=`<h2>${T("The Sun now: alerts and images","The Sun now: alerts and images")}</h2>`+alertsHTML()+regionsHTML()+imgsHTML();if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}
  const sm=document.getElementById("s_sunnow");if(sm){const A=(typeof L!=="undefined"&&L.swAlerts)||null,R=(typeof L!=="undefined"&&L.regions)||null;
    const t=[A?(A.length?T(`${A.length} ${A.length===1?"aviso":"avisos"} de NOAA en 24 h`,`${A.length} NOAA ${A.length===1?"alert":"alerts"} in 24 h`):T("Sin avisos de NOAA","No NOAA alerts")):"",R&&R.n?T(`${R.n} regiones activas`,`${R.n} active regions`):""].filter(Boolean).join(" · ")||T("Imágenes de SDO y SOHO","SDO and SOHO images");
    if(sm.textContent!==t)sm.textContent=t}}
window.ACRACB_swx=add;
function hook(){if(window.__hkSwx)return true;if(typeof window.renderSolar!=="function")return false;window.__hkSwx=1;const o=window.renderSolar;
  window.renderSolar=function(){const r=o.apply(this,arguments);try{add()}catch(e){console.error(e)}return r};try{add()}catch(e){}return true}
if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},200);setTimeout(()=>clearInterval(t),15000)}
})();

/* ---- ACRACB 2.2.1: “Tu estación” plegada ----
   A la vista solo quedan el locator y el modo, que es lo que más cambia la previsión. Banda, potencia, antena,
   altitud y entorno pasan a un desplegable cerrado con valores por defecto razonables; cerrado enseña un resumen
   en una línea. Se recuerda si lo dejaste abierto. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const grp=id=>{const e=document.getElementById(id);return e?e.closest(".grp"):null};
const txt=id=>{const e=document.getElementById(id);if(!e)return "";const o=e.options&&e.options[e.selectedIndex];return o?o.textContent.trim():""};
/* 2.11.4: modo, banda, potencia y antena se eligen en la línea de la estación (botones con menú); aquí no se repiten.
   Sus selectores siguen en la página, guardados y ocultos, porque son los que leen los cálculos y los menús.
   Aquí quedan solo la altitud y el entorno, y el resumen enseña solo eso. */
function sum(){const d=document.getElementById("stmore");if(!d)return;const out=[];
  const g=document.getElementById("gnd");if(g){const v=g.value;out.push(v==="rock"?T("suelo seco","dry ground"):v==="avg"?T("tierra normal","average ground"):v==="coast"?T("junto al mar","by the sea"):T("agua salada","salt water"))}
  const al=document.getElementById("altin");if(al&&al.value!=="")out.push(T("altitud ","altitude ")+al.value+" m");
  const n=d.querySelector(".stnote"),an=document.getElementById("antsel"),eq=document.getElementById("eq");if(n)n.hidden=!!(an&&eq&&(an.value!=="club"||eq.value!=="100"));
  {const e=d.querySelector(".stsum"),v=out.join(" · ");if(e._v!==v){e._v=v;e.textContent=v}}}
function build(){if(document.getElementById("stmore"))return true;const box=document.querySelector(".hsel");if(!box||!document.getElementById("gnd"))return false;
  const parts=["altin","gnd"].map(grp).filter(Boolean);if(!parts.length)return false;
  const keep=document.createElement("div");keep.className="stkeep";keep.hidden=true;["modesel","bandsel","eq","antsel"].map(grp).filter(Boolean).forEach(g=>keep.appendChild(g));
  const d=document.createElement("details");d.id="stmore";d.className="stmore";
  d.innerHTML=`<summary><span class="stt">${T("Tu estación","Your station")}</span> <span class="sto">${T("altitude and surroundings","altitude and surroundings")}</span><span class="stsum"></span></summary><div class="hsel stin"></div><p class="note stnote">${T("Si no lo tocas, la previsión usa la estación del radioclub: 100 W, directiva de 3 elementos y dipolos de 80 y 160 m. Ajústalo a tu equipo para afinar el resultado.","If you leave it alone, the forecast uses the club station: 100 W, a 3-element Yagi and 80 and 160 m dipoles. Set it to your own equipment for a closer result.")}</p>`;
  const inner=d.querySelector(".stin");parts.forEach(p=>inner.appendChild(p));
  box.insertAdjacentElement("afterend",d);d.insertAdjacentElement("afterend",keep);
  d.open=S.get("acracb_stmore")==="1";d.addEventListener("toggle",()=>S.set("acracb_stmore",d.open?"1":""));
  inner.addEventListener("change",sum);inner.addEventListener("input",sum);keep.addEventListener("change",sum);sum();setInterval(()=>{if(document.visibilityState==="visible")sum()},5000);return true}
function boot(){let n=0;const t=setInterval(()=>{if(build()||++n>50)clearInterval(t)},150)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.4.1: la ISS y los satélites de radioaficionado en el mapa ----
   Botones “ISS” y “Satélites” en “Qué ver” (solo en la web, con las órbitas de CelesTrak que usa la pestaña Satélites).
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
/* 2.7.4: la EEI y los satélites se ven aunque el resto del mapa esté en blanco */
const ok=()=>typeof st!=="undefined"&&st.ly&&typeof satellite!=="undefined";
const onISS=()=>ok()&&st.ly.iss,onSats=()=>ok()&&st.ly.sats;
const me=()=>(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];
const foot=h=>Math.acos(6371/(6371+h))/R;
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-GB":"en-US",{hour:"2-digit",minute:"2-digit"})}catch(e){return ""}};
const ll=(lat,lon)=>`${Math.abs(lat).toFixed(1).replace(".",EN()?".":",")}° ${lat>=0?"N":"S"}, ${Math.abs(lon).toFixed(1).replace(".",EN()?".":",")}° ${lon>=0?"E":(EN()?"W":"O")}`;
const nf=n=>(typeof fk==="function"?fk(n):Math.round(n).toLocaleString(EN()?"en-GB":"en-US"));
function nextPass(id){try{const now=Date.now();return (ACRACB_sats.passes||[]).find(p=>p.s&&p.s.id===id&&p.los>now)||null}catch(e){return null}}
/* 2.7.4: icono propio para la EEI y para cada satélite; al tocarlo se abre su ficha, como con las estaciones */
const hear0=p=>d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h);
function icon(g,q,s,id,iss,on){const n=g.append("g").attr("class",(iss?"issico":"satico")+(on?" on":"")).attr("transform",`translate(${q[0]},${q[1]}) scale(${1/s})`)
    .attr("pointer-events","all").attr("role","button").attr("tabindex","0").attr("aria-label",(iss?"ISS":((SATS().find(x=>x.id===id)||{}).n||""))+": "+T("ver ficha","show details"));
  n.append("circle").attr("class","sathit").attr("r",iss?20:16);n.append("circle").attr("class","satbg").attr("r",iss?15.5:11);
  if(iss){n.append("rect").attr("class","ip").attr("x",-13).attr("y",-7).attr("width",7).attr("height",14).attr("rx",1);n.append("rect").attr("class","ip").attr("x",6).attr("y",-7).attr("width",7).attr("height",14).attr("rx",1);
    n.append("path").attr("class","it").attr("d","M-6 0H6");n.append("rect").attr("class","ib").attr("x",-3.5).attr("y",-4).attr("width",7).attr("height",8).attr("rx",1.5)}
  else{n.append("rect").attr("class","ip").attr("x",-9).attr("y",-3).attr("width",5).attr("height",6).attr("rx",.8);n.append("rect").attr("class","ip").attr("x",4).attr("y",-3).attr("width",5).attr("height",6).attr("rx",.8);
    n.append("path").attr("class","it").attr("d","M-4 0H4M0 -3.5V-7");n.append("rect").attr("class","ib").attr("x",-2.5).attr("y",-3).attr("width",5).attr("height",6).attr("rx",1)}
  const go=ev=>{try{ev.stopPropagation();ev.preventDefault()}catch(_){}openSat(id)};n.on("click",go).on("keydown",ev=>{if(ev.key==="Enter"||ev.key===" ")go(ev)}).on("pointerdown",ev=>{try{ev.stopPropagation()}catch(_){}})}
function lookNow(r,t){try{const P=me(),obs={longitude:P[0]*R,latitude:P[1]*R,height:.05},d=new Date(t),pv=satellite.propagate(r,d);if(!pv||!pv.position)return null;
  const la=satellite.ecfToLookAngles(obs,satellite.eciToEcf(pv.position,satellite.gstime(d)));return {el:la.elevation/R,az:(la.azimuth/R+360)%360,km:la.rangeSat}}catch(e){return null}}
const CB=a=>{try{return typeof cab==="function"?cab(Math.round(a)):""}catch(e){return ""}};
function satHTML(id){const sd=SATS().find(x=>x.id===id)||{id,n:"ISS"},r=REC.get(id);if(!r)return "";const now=Date.now(),p=at(r,now);if(!p)return "";const iss=id===25544,on=hear0(p),lk=lookNow(r,now);
  try{if(window.ACRACB_sats&&!(ACRACB_sats.passes||[]).length)ACRACB_sats.calc()}catch(e){}
  const ps=(()=>{try{return (ACRACB_sats.passes||[]).filter(x=>x.s&&x.s.id===id&&x.los>now).slice(0,3)}catch(e){return []}})();
  const row=(k,v)=>v?`<dt>${k}</dt><dd>${v}</dd>`:"";const note=Array.isArray(sd.note)?sd.note[EN()?1:0]:(sd.note||"");
  let h=`<h3>${e2(sd.n)}</h3><p class="note" style="margin:0">${iss?T("Estación Espacial Internacional","International Space Station"):T("Satélite de radioaficionado","Amateur satellite")+(sd.kind?" · "+e2(sd.kind):"")}</p>
    <p style="margin:6px 0 0">${on?`<span class="agr ok">${T("La oyes ahora","In range now")}</span>`:`<span class="agr">${T("Fuera de tu alcance ahora","Out of range now")}</span>`}</p>
    <dl class="sc-d satd">${row(T("Posición","Position"),ll(p.lat,p.lon))}${row(T("Altura","Altitude"),nf(p.h)+" km")}${row(T("Velocidad","Speed"),nf(p.v*3600)+" km/h")}${lk?row(T("Desde tu QTH","From your QTH"),lk.el>0?`${Math.round(lk.el)}° ${T("de elevación","elevation")} · ${Math.round(lk.az)}° ${CB(lk.az)}`:`${T("bajo el horizonte","below the horizon")} · ${nf(lk.km)} km`):""}
    ${row(T("Próximos pases","Next passes"),ps.length?ps.map(x=>`<span class="nw"><b>${loc(x.aos)}–${loc(x.los)}</b> · ${T("máx.","max")} ${Math.round(x.max)}°</span><br><span class="note">${T("sale","rises")} ${Math.round(x.azA)}° ${CB(x.azA)}${x.azL!=null?` · ${T("se pone","sets")} ${Math.round(x.azL)}° ${CB(x.azL)}`:""}</span>`).join("<br>"):T("ninguno en 24 h","none in 24 h"))}
    ${iss?row(T("Tripulación (bajada)","Crew (downlink)"),"145.800 FM")+row("APRS","145.825"):""}${row(iss?T("Repetidor: subida","Repeater: uplink"):T("Subida","Uplink"),e2(sd.up||""))}${row(iss?T("Repetidor: bajada","Repeater: downlink"):T("Bajada","Downlink"),e2(sd.down||""))}</dl><p class="note">${T("Doppler del próximo pase y cómo configurarlo: DX › Satélites.","Doppler for the next pass and how to set it up: DX › Satellites.")}</p>
    ${note?`<p class="note" style="margin:6px 0 0">${e2(note)}</p>`:""}
    <div class="acts"><a class="btn" href="https://www.amsat.org/status/" target="_blank" rel="noopener noreferrer" data-ext>${T("Estado en AMSAT","Status at AMSAT")}</a><button type="button" class="btn" data-satgo>${T("Todos los pases","All passes")}</button></div>`;
  return h}
/* 2.7.6: la ficha sale en la ventana pequeña del mapa, como la de las estaciones */
function openSat(id){if(!REC.get(id))return;if(typeof st!=="undefined"&&typeof renderPop==="function"&&document.getElementById("mpop")){st.pop={k:"sat",id};renderPop();return}}
(function(){let n=0;const t=setInterval(()=>{if(typeof renderPop==="function"&&!window.__hkSatPop){window.__hkSatPop=1;const o=renderPop;const w=function(){try{if(typeof st!=="undefined"&&st.pop&&st.pop.k==="sat"){const el=document.getElementById("mpop");const h=satHTML(st.pop.id);if(!h){closePop();return}
      el.innerHTML=`<button class="x" aria-label="${T("Close","Close")}" id="mpx">×</button>`+h;el.hidden=false;document.getElementById("mpx").onclick=closePop;
      const g=el.querySelector("[data-satgo]");if(g)g.onclick=()=>{closePop();try{go("dx");selTab("dx","f_sat",true)}catch(e){}};return}}catch(e){}return o.apply(this,arguments)};
    w.__sat=1;try{renderPop=w}catch(e){window.renderPop=w}clearInterval(t)}else if(++n>100)clearInterval(t)},100)})();
function closeSat(){const ov=document.getElementById("satpop");if(ov&&!ov.hidden){ov.hidden=true;document.body.classList.remove("noscroll")}}
/* 2.8.32: las etiquetas de la ISS y de los satélites se escalan aquí con el zoom (el resto del mapa lo hace zoomMarks, que ya no las toca):
   antes se escalaban dos veces y cambiaban de tamaño cada vez que se redibujaban */
function lbl(g,cls,x,y,txt,k,s){const t=g.append("text").attr("class",cls).attr("x",x).attr("y",y).attr("paint-order","stroke").text(txt);if(k>1.01)t.attr("transform",`translate(${x},${y}) scale(${1/s}) translate(${-x},${-y})`);return t}
function draw(){const old=document.getElementById("issg");if(old)old.remove();note();if(!(onISS()||onSats())||typeof ZROOT==="undefined"||!ZROOT||typeof PR==="undefined"||!PR)return;
  if(!REC.size){load().then(()=>{if(REC.size)draw()});return}
  const now=Date.now(),path=d3.geoPath(PR),k=(typeof ZT!=="undefined"&&ZT&&ZT.k)||1,s=Math.pow(k,.75);
  const g=ZROOT.append("g").attr("id","issg").attr("class","issg").attr("pointer-events","none");
  if(onSats())SATS().forEach(sd=>{if(sd.id===25544)return;const r=REC.get(sd.id);if(!r)return;const p=at(r,now);if(!p)return;const q=PR([p.lon,p.lat]);if(!q)return;
    const hear=d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h);
    if(hear)g.append("path").attr("class","satfoot").attr("d",path(d3.geoCircle().center([p.lon,p.lat]).radius(foot(p.h)).precision(2)()));
    icon(g,q,s,sd.id,false,hear);
    lbl(g,"satlbl"+(hear?" on":""),q[0]+11/s,q[1]+4/s,sd.n,k,s)});
  if(onISS()){const r=REC.get(25544);const p=r&&at(r,now);if(p){const f=foot(p.h);
    g.append("path").attr("class","issfoot").attr("d",path(d3.geoCircle().center([p.lon,p.lat]).radius(f).precision(2)()));
    const past=track(r,now-45*6e4,now),next=track(r,now,now+95*6e4);
    if(past.length>1)g.append("path").attr("class","isspast").attr("d",path({type:"LineString",coordinates:past}));
    if(next.length>1)g.append("path").attr("class","issnext").attr("d",path({type:"LineString",coordinates:next}));
    const q=PR([p.lon,p.lat]);if(q){icon(g,q,s,25544,true,hear0(p));
      lbl(g,"isslbl",q[0]+15/s,q[1]+4/s,"ISS",k,s)}}}
  note()}
/* panel de datos bajo la leyenda */
function note(){let n=document.getElementById("issnote");if(!(onISS()||onSats())){if(n)n.remove();return}
  if(!n){const mw=document.querySelector("#mapcard .mapwrap")||document.getElementById("mlegend");if(!mw)return;n=document.createElement("div");n.id="issnote";n.className="issnote";mw.insertAdjacentElement("afterend",n)}
  if(!REC.size){n.innerHTML=`<p class="note">${T("Cargando las órbitas…","Loading orbits…")}</p>`;return}
  const now=Date.now();let h="";
  if(onISS()){const r=REC.get(25544),p=r&&at(r,now);if(p){const hear=d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h);const np=nextPass(25544);
    h+=`<div class="sn-c"><div class="sn-h"><button type="button" class="lnk snb" data-satp="25544">ISS</button>${hear?`<span class="xtag xs">${T("LA OYES AHORA","IN RANGE NOW")}</span>`:""}</div><dl class="sc-d">
      <dt>${T("Posición","Position")}</dt><dd>${ll(p.lat,p.lon)}</dd>
      <dt>${T("Altura","Altitude")}</dt><dd>${nf(p.h)} km</dd>
      <dt>${T("Velocidad","Speed")}</dt><dd>${nf(p.v*3600)} km/h</dd>
      <dt>${T("Próximo paso","Next pass")}</dt><dd>${np?`${loc(np.aos)}–${loc(np.los)} ${T("local time","local time")} · ${T("máx.","max")} ${Math.round(np.max)}°`:T("ninguno en 24 h","none in 24 h")}</dd>
      <dt>${T("Frecuencias","Frequencies")}</dt><dd>${T("Voice","Voice")} 145.800 FM · APRS 145.825 · ${T("repetidor","repeater")} 145.990 ↑ / 437.800 ↓</dd></dl>
      <p class="note">${T("Círculo: zona desde la que se la oye · línea continua: próxima hora y media · punteada: últimos 45 minutos.","Circle: area where it can be heard · solid line: next hour and a half · dotted: last 45 minutes.")}</p></div>`}}
  if(onSats()){const list=SATS().filter(s=>s.id!==25544&&REC.get(s.id)).map(s=>{const p=at(REC.get(s.id),now);return {s,p,hear:p&&d3.geoDistance(me(),[p.lon,p.lat])/R<foot(p.h),np:nextPass(s.id)}}).filter(x=>x.p);
    const on=list.filter(x=>x.hear),off=list.filter(x=>!x.hear&&x.np).sort((a,b)=>a.np.aos-b.np.aos).slice(0,4);
    h+=`<div class="sn-c"><div class="sn-h"><b>${T("Satélites de radioaficionado","Amateur satellites")}</b></div><dl class="sc-d">
      <dt>${T("Los oyes ahora","In range now")}</dt><dd>${on.length?on.map(x=>`<button type="button" class="lnk snb" data-satp="${x.s.id}">${e2(x.s.n)}</button> ${e2(x.s.down)}`).join("<br>"):T("none","none")}</dd>
      <dt>${T("Próximos","Next")}</dt><dd>${off.length?off.map(x=>`<button type="button" class="lnk snb" data-satp="${x.s.id}">${e2(x.s.n)}</button> ${loc(x.np.aos)} (${T("máx.","max")} ${Math.round(x.np.max)}°)`).join("<br>"):"—"}</dd></dl>
      <p class="note">${T("Toca la EEI o un satélite en el mapa, o su nombre aquí, para ver su ficha. Los que oyes ahora van resaltados con su zona de cobertura.","Tap the ISS or a satellite on the map, or its name here, to see its details. Those in range are highlighted with their footprint.")}</p></div>`}
  if(n.innerHTML!==h)n.innerHTML=h}
function hook(){if(window.__hkIss)return true;window.__hkIss=1;window.ACRACB_afterDraw=window.ACRACB_afterDraw||[];window.ACRACB_afterDraw.push(()=>draw());return true}
function btns(){const sw=document.getElementById("mapsw");if(!sw)return false;if(typeof satellite==="undefined")return true;
  const mk=(ly,txt,tt)=>{if(sw.querySelector(`[data-ly="${ly}"]`))return;const b=document.createElement("button");b.type="button";b.id="mly"+ly;b.dataset.ly=ly;b.textContent=txt;b.title=tt;b.setAttribute("aria-pressed",String(!!(st.ly&&st.ly[ly])));
    b.onclick=ev=>{ev.stopPropagation();st.ly[ly]=!st.ly[ly];b.setAttribute("aria-pressed",String(!!st.ly[ly]));try{store.set("ly",JSON.stringify(st.ly))}catch(e){}try{draw()}catch(e){}};sw.appendChild(b)};
  mk("iss","ISS",T("Estación espacial internacional: dónde está, por dónde pasará y cómo oírla","International Space Station: where it is, where it will pass and how to hear it"));
  mk("sats",T("Satellites","Satellites"),T("Satélites de radioaficionado: dónde está cada uno y cuáles oyes ahora","Amateur satellites: where each one is and which ones are in range"));return true}
function boot(){let n=0;try{if(typeof st!=="undefined"&&st.ly){if(st.ly.iss===undefined)st.ly.iss=false;if(st.ly.sats===undefined)st.ly.sats=false}}catch(e){}const t=setInterval(()=>{try{if(typeof st!=="undefined"&&st.ly){if(st.ly.iss===undefined)st.ly.iss=false;if(st.ly.sats===undefined)st.ly.sats=false}}catch(e){}const a=hook(),b=btns();if((a&&b)||++n>75)clearInterval(t)},200);
  setInterval(()=>{if((onISS()||onSats())&&document.visibilityState==="visible"&&typeof st!=="undefined"&&st.page==="mapa"){try{draw()}catch(e){}}},20000)}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-satp]");if(b){ev.preventDefault();openSat(+b.dataset.satp)}});
window.ACRACB_iss={draw,open:openSat,at:(t)=>REC.get(25544)&&at(REC.get(25544),t||Date.now())};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.3: “Hora a hora” explicado ----
   Añade a la tabla una frase que dice qué es cada casilla, un rótulo para los tramos, una leyenda más clara
   (incluidas las casillas rayadas) y un desplegable “Cómo se lee esta tabla”. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
function info(){let n=0,C=false,mode="SSB";try{C=st.mode==="contest";n=TG().filter(inMode).length}catch(e){}
  try{mode=MODES[MOD()].s}catch(e){}return {n,C,mode}}
function enhance(){const el=document.getElementById("tl");if(!el)return;const hm=el.querySelector(".hm2");if(!hm||el.querySelector(".tlintro"))return;
  const {n,C,mode}=info();
  const intro=document.createElement("p");intro.className="tlintro";
  intro.innerHTML=C?T(`Cada columna es una hora (local time) y cada fila, una banda. El color de la casilla dice qué parte de los <b>possible multipliers</b> se pueden trabajar a esa hora en esa banda: cuanto más verde, mejor.`,`Each column is an hour (local time) and each row a band. The color of each cell shows what share of the <b>possible multipliers</b> can be worked at that hour on that band: the greener, the better.`)
    :T(`<b>Busca el verde:</b> cuanto más verde, más mundo llega esa banda a esa hora. Toca una casilla para verla en el mapa.`,`<b>Look for green:</b> the greener, the more of the world that band reaches at that hour. Tap a cell to see it on the map.`);/* 2.11.79: una línea; el resto ya está en la leyenda y en “Cómo se lee esta tabla” */
  hm.insertAdjacentElement("beforebegin",intro);
  const ul=el.querySelector(".tlseg");if(ul&&!el.querySelector(".tlsegh")){const h=document.createElement("p");h.className="tlsegh";h.textContent=T("Banda recomendada en cada tramo del día:","Recommended band for each part of the day:");ul.insertAdjacentElement("beforebegin",h)}
  const leg=el.querySelector(".hmleg");if(leg){const na=hm.querySelector("i.na")?`<span class="hmli"><i class="na"></i>${T("rayada: tu antena no trabaja en esa banda","hatched: your antenna does not work on that band")}</span>`:"";
    leg.outerHTML=`<div class="hmleg hmleg2"><span class="hmlt">${C?T("Multiplicadores que se pueden trabajar:","Multipliers that can be worked:"):T("Cuánto mundo se oye en esa banda y a esa hora:","How much of the world that band reaches at that hour:")}</span><span class="hmli"><i class="c0"></i>${T("closed","closed")}</span><span class="hmli"><i class="c1"></i>${T("very little","very little")} <small>&lt;15%</small></span><span class="hmli"><i class="c2"></i>${T("little","little")} <small>15–30%</small></span><span class="hmli"><i class="c3"></i>${T("fair","fair")} <small>30–50%</small></span><span class="hmli"><i class="c4"></i>${T("good","good")} <small>50–70%</small></span><span class="hmli"><i class="c5"></i>${T("very good","very good")} <small>&gt;70%</small></span>${na}</div>
    <div class="hmleg hmleg2"><span class="hmlt">${T("Fila “Sol” en tu QTH:","“Sun” row at your QTH:")}</span><span class="hmli"><i class="dn dn-d"></i>${T("day","day")}</span><span class="hmli"><i class="dn dn-g"></i>${T("gray line (amanecer y anochecer)","greyline (dawn and dusk)")}</span><span class="hmli"><i class="dn dn-n"></i>${T("noche","night")}</span><span class="hmli"><i class="selk"></i>${T("hora elegida","selected hour")}</span></div>`}
  if(!el.querySelector(".tlhow")){const d=document.createElement("details");d.className="tlhow";
    d.innerHTML=`<summary>${T("Cómo se lee esta tabla","How to read this table")}</summary><ul>
<li>${C?T("<b>Multiplicador posible:</b> una entidad o zona que cuenta como multiplicador en el concurso y a la que la previsión da al menos un 30% de fiabilidad a esa hora.","<b>Possible multiplier:</b> an entity or zone that counts as a multiplier in the contest and that the forecast gives at least 30% reliability at that hour.")
  :T(`<b>Destino abierto:</b> la previsión VOACAP da al menos un 30% de fiabilidad en ${mode} con tu potencia y tu antena. El modo cuenta mucho: SSB necesita bastante más señal que CW o FT8, así que con FT8 verás más casillas verdes. En modo DX solo cuentan los destinos a más de 2.500 km y las entidades escasas, por el camino corto o por el largo, el que sea mejor.`,`<b>Open destination:</b> the VOACAP forecast gives at least 30% reliability of making the contact in ${mode} with your power and antenna. The mode matters a lot: SSB needs much more signal than CW or FT8, so with FT8 you will see more green cells. In DX mode only destinations over 2,500 km and rare entities count, via the short or the long path, whichever is better.`)}</li>
<li>${T("<b>Fila “Mejor”:</b> la banda que más destinos abre en cada hora, con su color. Los recuadros de arriba agrupan las horas seguidas en las que esa banda es la mejor.","<b>“Best” row:</b> the band that opens the most destinations at each hour, in its color. The boxes above group consecutive hours in which that band is the best.")}</li>
<li>${T("<b>Fila “Sol”:</b> si en tu QTH es de día, de noche o línea gris. Por regla general las bandas altas (10 a 20 m) se abren de día, las bajas (40 a 160 m) de noche, y en la línea gris mejora casi todo.","<b>“Sun” row:</b> whether it is day, night or greyline at your QTH. As a rule the high bands (10 to 20 m) open by day, the low bands (40 to 160 m) at night, and almost everything improves at the greyline.")}</li>
<li>${T("<b>Casillas rayadas:</b> la antena elegida en “Tu estación” no trabaja en esa banda. Cámbiala en los ajustes de arriba si tienes otra.","<b>Hatched cells:</b> the antenna chosen under “Your station” does not work on that band. Change it in the settings above if you have another one.")}</li>
<li>${T("<b>Recuadro blanco:</b> la hora elegida. Toca cualquier casilla para ver esa hora en el mapa y en el resto de la plataforma; la hora de ahora va en color en la fila de las horas.","<b>White frame:</b> the selected hour. Tap any cell to see that hour on the map and in the rest of the platform; the current hour is shown in color on the hours row.")}</li>
<li>${T("Es una previsión media para este mes con la actividad solar de hoy: unos días irá mejor y otros peor. Lo que se oye de verdad está en DX › Clúster y en Balizas.","It is an average forecast for this month with today's solar activity: some days will be better and others worse. What is actually being heard is in DX › Cluster and in Beacons.")}</li></ul>`;
    const at=el.querySelectorAll(".hmleg2");(at[at.length-1]||hm).insertAdjacentElement("afterend",d);
    try{d.open=localStorage.getItem("acracb_tlhow")==="1"}catch(e){}d.addEventListener("toggle",()=>{try{localStorage.setItem("acracb_tlhow",d.open?"1":"")}catch(e){}})}}
/* 2.10.0: leyenda de colores encima de la tabla (se lee antes que la tabla) y lectura de la casilla tocada o señalada,
   para que en el móvil, donde no hay “title”, se sepa qué dice cada color sin adivinar */
let LAST="";
function place(){const el=document.getElementById("tl");if(!el)return;const hm=el.querySelector(".hm2");if(!hm)return;
  const lg=el.querySelector(".hmleg2");if(lg&&lg.nextElementSibling!==hm&&!lg.classList.contains("hmtop")){lg.classList.add("hmtop");hm.insertAdjacentElement("beforebegin",lg)}
  let rd=el.querySelector(".tlread");if(!rd){rd=document.createElement("p");rd.className="tlread";rd.setAttribute("aria-live","polite");hm.insertAdjacentElement("afterend",rd)}
  rd.textContent=LAST||T("Toca o señala una casilla para ver aquí qué dice.","Tap or point at a cell to see what it says here.")}
function readCell(ev){const c=ev.target.closest&&ev.target.closest(".hm2 i[title]");if(!c)return;LAST=c.getAttribute("title");const rd=document.querySelector("#tl .tlread");if(rd)rd.textContent=LAST}
function boot(){const el=document.getElementById("tl");if(!el)return setTimeout(boot,300);enhance();place();el.addEventListener("pointerover",readCell,{passive:true});el.addEventListener("pointerdown",readCell,{passive:true});
  try{new MutationObserver(()=>{enhance();place()}).observe(el,{childList:true})}catch(e){}}
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
/* 2.8.6: el zoom del mapa se crea la primera vez que se abre la pestaña Mapa. Antes, si se abría pasado minuto y medio,
   el enganche ya se había rendido y, al ampliar o alejar, las costas no se recalculaban: solo se veía tierra en el recuadro
   de la vista anterior. Ahora se engancha también desde el propio dibujo del mapa y, por si un gesto no termina limpio,
   se recalcula igualmente un poco después del último movimiento. */
function hookZ(){if(typeof ZM==="undefined"||!ZM)return false;if(!ZM.on("end.fino"))ZM.on("end.fino",later);if(!ZM.on("zoom.fino"))ZM.on("zoom.fino",()=>{clearTimeout(tm);tm=setTimeout(()=>{redraw();halo()},260)});return true}
function hookD(){if(window.__hkFino)return true;window.__hkFino=1;window.ACRACB_afterDraw=window.ACRACB_afterDraw||[];window.ACRACB_afterDraw.push(()=>{try{hookZ()}catch(e){}redraw()});return true}
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
  /* solo interesa cuando entra o sale de pantalla completa (no los cambios de “idle”, que harían un bucle) */
  let fs=c.classList.contains("fsm");try{new MutationObserver(()=>{const f=c.classList.contains("fsm");if(f!==fs){fs=f;wake()}}).observe(c,{attributes:true,attributeFilter:["class"]})}catch(e){}wake()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
/* ---- 2.4.1: botones del mapa al instante ----
   Al pulsar un botón, el botón se marca enseguida y el mapa se redibuja en el siguiente fotograma; si se pulsan
   varios seguidos, se redibuja una sola vez. Fuera de los clics, el mapa se dibuja igual que siempre. */
(function(){
"use strict";
function wrap(){return true;const o=window.drawMap;if(typeof o!=="function")return false;if(o.__ok)return true;
  if(!(window.ACRACB_mapfino&&window.ACRACB_iss)||!(o.__iss||o.__fino))return false;/* espera a que estén puestos los demás añadidos del mapa */
  let pend=false;const w=function(){const ev=window.event;if(ev&&(ev.type==="click"||ev.type==="change"||ev.type==="input")){if(!pend){pend=true;requestAnimationFrame(()=>{pend=false;try{o()}catch(e){}})}return}return o.apply(this,arguments)};
  w.__ok=1;w.__iss=1;w.__fino=1;window.drawMap=w;return true}
let n=0;const t=setInterval(()=>{if(wrap()||++n>100)clearInterval(t)},300);
})();
/* ---- 2.8.21: en pantalla completa se ven solo “Mapa” y “Qué ver”; “Más ajustes” despliega el resto ---- */
(function(){
"use strict";
const EN=window.ACRACB_LANG==="en";
function add(){const c=document.getElementById("mapcard"),ctl=c&&c.querySelector(".mapctl");if(!ctl)return setTimeout(add,400);if(ctl.querySelector(".fsmorebtn"))return;
  const b=document.createElement("button");b.type="button";b.className="fsmorebtn";
  const lab=()=>{const o=c.classList.contains("fsmore");b.textContent=o?(EN?"Fewer settings ▴":"Menos ajustes ▴"):(EN?"More settings: mode, bands, time… ▾":"Más ajustes: modo, bandas, hora… ▾");b.setAttribute("aria-expanded",String(o))};
  b.onclick=()=>{c.classList.toggle("fsmore");lab()};ctl.appendChild(b);lab()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",add);else add();
})();

/* ---- ACRACB 2.4.1: el Sol en el resumen principal ----
   Debajo de “Qué banda y hacia dónde”, una franja con los datos solares que más cuentan para la propagación, con el mismo
   código de colores que la página del Sol (verde favorable, ámbar regular, rojo desfavorable) y una frase que lo resume. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lv3=(v,g,y,inv)=>v==null||v===""||isNaN(+v)?"n":inv?(+v<g?"g":+v<y?"y":"r"):(+v>=g?"g":+v>=y?"y":"r");
function items(){const s=L.space||{};const xr=String(s.xray||"").trim().toUpperCase()[0];
  return [[T("Solar flux","Solar flux"),L.sfi!=null?"SFI "+L.sfi:null,lv3(L.sfi,110,90)],[T("Sunspots","Sunspots"),s.ssn!=null?"SSN "+s.ssn:null,lv3(s.ssn,90,50)],
   ["Kp",L.kp,lv3(L.kp,3,4.5,1)],[T("A index","A index"),s.a!=null&&s.a!==""&&!isNaN(+s.a)?Math.round(+s.a):null,lv3(s.a,10,20,1)],[T("Solar wind","Solar wind"),L.wind!=null?L.wind+" km/s":null,lv3(L.wind,450,550,1)],
   ["Bz",L.bz!=null?L.bz+" nT":null,L.bz==null?"n":L.bz>=0?"g":L.bz>-5?"y":"r"],[T("X-rays","X-rays"),s.xray||null,!xr?"n":"AB".includes(xr)?"g":xr==="C"?"y":"r"],
   [T("Apagón R1–R2 (24 h)","R1–R2 blackout (24 h)"),L.radio&&L.radio.r12!=null?L.radio.r12+" %":null,!L.radio||L.radio.r12==null?"n":L.radio.r12<20?"g":L.radio.r12<40?"y":"r"]].filter(x=>x[1]!=null&&x[1]!=="")}
const nf=(v,d)=>v==null||isNaN(+v)?null:(+v).toFixed(d==null?1:d).replace(/\.0$/,"").replace(".",EN()?".":",");
const dm=iso=>{const p=String(iso).split("-");return p.length===3?(+p[2])+"/"+(+p[1]):iso};
const today=()=>new Date().toISOString().slice(0,10);
/* resto de valores de “Valores reales ahora” */
function more(){const s=L.space||{};const r=L.radio||{};const pr=String(s.proton||"");const out=[];
  if(L.bt!=null)out.push(["Bt",L.bt+" nT",lv3(L.bt,10,20,1)]);
  if(pr)out.push([T("Protons","Protons"),pr,/S0/i.test(pr)?"g":/S1/i.test(pr)?"y":"r"]);
  if(s.aurora)out.push([T("Aurora","Aurora"),window.ACRACB_tx?ACRACB_tx(s.aurora):s.aurora,(m=>m?lv3(+m[1],20,50,1):"n")(String(s.aurora).match(/(\d+)\s*%/))]);
  if(L.flare)out.push([T("Flares (24 h)","Flares (24 h)"),L.flare,(m=>m?lv3(+m[1],10,30,1):"n")(String(L.flare).match(/X\s*(\d+)/))]);
  if(r.r3!=null)out.push([T("Apagón fuerte R3+ (24 h)","Strong blackout R3+ (24 h)"),r.r3+" %",lv3(r.r3,10,25,1)]);
  if(r.s1!=null)out.push([T("Tormenta de protones (24 h)","Proton storm (24 h)"),r.s1+" %",lv3(r.s1,10,25,1)]);
  return out}
/* Kp previsto en lo que queda de la previsión NOAA de 3 días */
function kpNext(){const f=L.kpfc;if(!f||!f.base||!Array.isArray(f.blocks))return null;const b0=Date.parse(f.base+"T00:00:00Z"),now=Date.now();let mx=null;
  f.blocks.forEach((d,i)=>d.forEach((v,j)=>{const t=b0+(i*24+j*3)*36e5;if(t+3*36e5>now&&t<now+24*36e5&&v!=null)mx=mx==null?v:Math.max(mx,v)}));return mx}
function ahead(){const out=[];const k=kpNext();if(k!=null)out.push([T("Kp máximo próximas 24 h","Max Kp next 24 h"),nf(k,1),lv3(k,3,4.5,1)]);
  const o=L.outlook27&&L.outlook27.days;if(Array.isArray(o)){const t=today();const fut=o.filter(d=>d[0]>t);
    /* 2.8.23: la previsión de NOAA es semanal; si hoy se mide un flujo muy distinto del previsto para hoy, mañana se corrige
       con esa diferencia y se deja la cifra de NOAA al lado (antes salía “hoy 132, mañana 95” sin explicación) */
    if(fut[0]){const td=o.find(d=>d[0]===t),obs=+(document.getElementById("sfi")||{}).value||0;let v=fut[0][1],txt="SFI "+v;
      if(td&&obs>0&&Math.abs(obs-td[1])>=10){v=Math.max(60,Math.round(fut[0][1]+obs-td[1]));txt="SFI ≈"+v+" (NOAA: "+fut[0][1]+")"}
      const tm=new Date(Date.parse(t+"T12:00:00Z")+864e5).toISOString().slice(0,10);
      out.push([fut[0][0]===tm?T("Flujo solar mañana","Solar flux tomorrow"):T("Flujo solar el ","Solar flux on ")+dm(fut[0][0]),txt,lv3(v,110,90)])}
    const st=fut.find(d=>d[3]>=5||d[2]>=20);out.push([T("Próxima tormenta (NOAA)","Next storm (NOAA)"),st?dm(st[0])+" · Ap "+st[2]:T("ninguna en 27 días","none in 27 days"),st?((Date.parse(st[0])-Date.now())/864e5<3?"r":"y"):"g"]);
    const best=fut.filter(d=>d[2]<=5).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,3).sort((a,b)=>a[0].localeCompare(b[0]));
    if(best.length)out.push([T("Mejores días para el DX","Best DX days"),best.map(d=>dm(d[0])).join(", "),"g"])}
  if(Array.isArray(L.cme))out.push(["CME",L.cme.length?T(`${L.cme.length} hacia la Tierra`,`${L.cme.length} Earth-directed`):T("ninguna hacia la Tierra","none Earth-directed"),L.cme.length?"y":"g"]);
  return out}
function cycle(){const out=[];const c=L.cycle||{};const last=o=>{const k=o&&Object.keys(o).sort().pop();return k?[k,o[k]]:null};
  const sm=last(c.smoothed),mo=last(c.monthly);const MES=EN()?["Jan","Feb","Tue","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const ym=k=>MES[+k.slice(5,7)-1]+" "+k.slice(0,4);
  if(sm)out.push([T("Manchas suavizadas (oficial)","Smoothed sunspots (official)"),nf(sm[1])+" · "+ym(sm[0]),"n"]);
  if(mo)out.push([T("Media del último mes","Last month average"),nf(mo[1])+" · "+ym(mo[0]),"n"]);
  if(L.essn!=null)out.push([T("effective SSN (ionosfera)","Effective SSN (ionosphere)"),nf(L.essn),lv3(L.essn,90,50)]);
  const p=L.ssnPred;if(p){const ks=Object.keys(p).sort();if(ks.length)out.push([T("Previsión dentro de 12 meses","Forecast in 12 months"),nf(p[ks[ks.length-1]])+" · "+ym(ks[ks.length-1]),"n"])}
  out.push([T("Fase del ciclo 25","Cycle 25 phase"),T("bajando · mínimo hacia 2030","declining · minimum around 2030"),"n"]);return out}
function notes(){const a=Array.isArray(L.solar)?L.solar:[];return a.filter(x=>Array.isArray(x)&&/^(Sun|Geomagnetism|Forecast|Sun|Geomagnetism|Outlook|Forecast)/i.test(x[0])&&x[1])}
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
   <p class="note">${T("Para deletrear el indicativo sin que se confunda: EA5RKB se dice “Echo Alfa Cinco Romeo Kilo Bravo”.","To spell a callsign without confusion: EA5RKB is said “Echo Alfa Five Romeo Kilo Bravo”.")}</p>
   <div class="glgrid nato">${NATO.map(([l,w])=>`<span class="glt"><b>${l}</b><span>${w}</span></span>`).join("")}</div></details>
  <details class="glr"><summary>${T("Código Q más usado","Most used Q code")}</summary>
   <p class="note">${T("Abreviaturas de tres letras que empiezan por Q. Con interrogación son pregunta: “QRZ?” es “¿quién me llama?”.","Three-letter abbreviations starting with Q. With a question mark they are a question: “QRZ?” is “who is calling me?”.")}</p>
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
  const extra=grp(T("More live values","More live values"),more())+grp(T("Próximas horas y días","Next hours and days"),ahead())+grp(T("Solar cycle","Solar cycle"),cycle())+
    (ns.length?`<div class="solsum-g"><h4>${T("What it means","What it means")}</h4><dl class="solsum-n">${ns.map(x=>`<dt>${e2(x[0])}</dt><dd>${e2(x[1])}</dd>`).join("")}</dl></div>`:"");
  const h=`<div class="solsum-h"><b>${T("El Sol ahora","The Sun now")}</b><span class="solsum-v">${verdict(it.concat(more()))}</span><button type="button" class="lnk" id="solgo">${T("Go to the Sun section","Go to the Sun section")}</button></div>`+
    chips(it)+(extra?`<details class="solmore"${SOLOPEN?" open":""}><summary>${T("More: forecast, solar cycle and explanations","More: forecast, solar cycle and explanations")}</summary>${extra}</details>`:"");
  if(!el){el=document.createElement("div");el.id="solsum";el.className="solsum";box.insertAdjacentElement("afterend",el)}
  /* 2.10.18: los datos del Sol ya están arriba (casillas y panel “Sol y propagación ahora”) y en la sección Sol: aquí no se repiten.
     El elemento queda vacío y oculto solo como punto de anclaje del glosario. */
  el.hidden=true;if(el.innerHTML){el.innerHTML=""}if(false)
  if(el.innerHTML!==h){el.innerHTML=h;const b=document.getElementById("solgo");if(b)b.onclick=()=>{try{go("sol");selTab("sol","f_space",true)}catch(e){}};
    const d=el.querySelector(".solmore");if(d)d.addEventListener("toggle",()=>{SOLOPEN=d.open})}
  /* 2.4.9: “Palabras y expresiones que conviene saber” va al final del resumen, después del Sol */
  try{const g=document.getElementById("glos"),gd=g&&g.closest("details");if(gd&&!gd.classList.contains("glosw")){document.querySelectorAll("details.glosw").forEach(x=>x.remove());gd.classList.add("glosw");el.insertAdjacentElement("afterend",gd);gd.insertAdjacentHTML("beforeend",`<p class="note glgo">${T("Alfabeto fonético, código Q y Morse:","Phonetic alphabet, Q code and Morse:")} <button type="button" class="lnk" data-goref="1">${T("Cómo funciona › Consulta","How it works › Reference")}</button></p>`)}}catch(e){}
  try{const rb=document.getElementById("refbox");if(rb&&!rb.firstChild){if(!REF)REF=refHTML();rb.innerHTML=REF;rb.querySelectorAll("details.glr").forEach(d=>d.open=true)}}catch(e){}}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-goref]");if(!b)return;try{go("metodo");selTab("metodo","f_ref",true);const d=document.getElementById("f_ref");if(d){d.open=true;d.scrollIntoView({behavior:"smooth",block:"start"})}}catch(e){}});
function hook(){if(window.__hkSol)return true;const o=window.renderEasyS;if(typeof o!=="function")return false;window.__hkSol=1;const w=function(){const r=o.apply(this,arguments);try{render()}catch(e){}return r};w.__sol=1;window.renderEasyS=w;return true}
function boot(){let n=0;const t=setInterval(()=>{if(hook()||++n>75){clearInterval(t);try{render()}catch(e){}}},200)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- ACRACB 2.5.8: la capa “Predicción VOACAP” del mapa enseña la previsión pura ----
   Toda la plataforma usa la misma medida (VOACAP equilibrado con los clústeres), salvo esta capa y su ventana de destino,
   que muestran solo lo que dice VOACAP. Se engancha por dentro del dibujo diferido del mapa. */
(function(){
"use strict";
const pure=f=>{const w=function(){const on=typeof st!=="undefined"&&st.ly&&st.ly.voa;if(on)window.ACRACB_NOLIVE=true;try{return f.apply(this,arguments)}finally{if(on)window.ACRACB_NOLIVE=false}};w.__pure=1;return w};
function hook(){const f=window.renderPop;if(typeof f!=="function")return false;if(window.__hkPurePop)return true;window.__hkPurePop=1;window.renderPop=pure(f);return true}
let n=0;const t=setInterval(()=>{if(hook()||++n>40)clearInterval(t)},50);
})();

/* ---- ACRACB 2.4.3: botones del mapa sin retardo ----
   Al pulsar un botón del mapa, el botón cambia en el acto y el mapa se redibuja justo después, en el siguiente
   fotograma. Si se pulsan varios seguidos, se redibuja una sola vez con todo. */
(function(){
"use strict";
let inClick=false,pend=0,args=null;
document.addEventListener("click",e=>{const t=e.target;if(t&&t.closest&&t.closest('section[data-pg="mapa"]')&&!t.closest("#map")){inClick=true;setTimeout(()=>{inClick=false},0)}},true);
function hook(){return true;const d=window.drawMap;if(typeof d!=="function")return false;if(d.__fast)return true;
  const w=function(){if(!inClick)return d.apply(this,arguments);args=arguments;if(pend)return;
    pend=requestAnimationFrame(()=>setTimeout(()=>{pend=0;const a=args;args=null;try{d.apply(null,a||[])}catch(e){console.error(e)}},0))};
  w.__fast=1;window.drawMap=w;return true}
/* se engancha el último, por fuera de los demás añadidos del mapa */
/* si otro añadido envuelve el mapa después, se vuelve a envolver: la capa interior deja pasar el dibujo diferido */
let n=0;const t=setInterval(()=>{n++;hook();if(n>60)clearInterval(t)},1000);
})();
/* ---- ACRACB 2.4.5: franja de valores de la portada en rejilla ----
   8, 4 o 2 columnas según el ancho real (incluido el tamaño de letra elegido): “Llamarada” ocupa dos casillas
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
const SEL=".kv,.glgrid";const W=new WeakMap();
function bal(el){const kids=[...el.children].filter(c=>c.getClientRects().length);const n=kids.length;if(n<2)return;
  const w=Math.round(el.getBoundingClientRect().width);const key=w+"|"+n+"|"+getComputedStyle(document.documentElement).fontSize;if(W.get(el)===key)return;W.set(el,key);
  el.style.gridTemplateColumns="";kids.forEach(k=>{if(k.dataset.balspan){k.style.gridColumn="";delete k.dataset.balspan}});
  const cmax=getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length||1;if(cmax>=n)return;
  let c=cmax;if(cmax>=2){const rows=Math.ceil(n/cmax);c=Math.ceil(n/rows);if(c<cmax)el.style.gridTemplateColumns=`repeat(${c},minmax(0,1fr))`}
  /* si en la última fila queda una sola casilla, ocupa la fila entera */
  if(c>=2&&n%c===1){const l=kids[n-1];l.style.gridColumn="1 / -1";l.dataset.balspan="1"}}
let raf=0;const all=()=>{raf=0;document.querySelectorAll(SEL).forEach(el=>{if(el.getClientRects().length)try{bal(el)}catch(e){}})};
const later=()=>{if(!raf)raf=requestAnimationFrame(all)};
function boot(){all();addEventListener("resize",window.ACRACB_rz?ACRACB_rz(later):later,{passive:true});
  try{new MutationObserver(ms=>{if(window.ACRACB_mut&&!ACRACB_mut(ms))return;later()}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  document.addEventListener("click",()=>setTimeout(later,60),true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

/* ---- 2.8.23: “Ver en el mapa” desde una estación o un destino ----
   Va al mapa, encuadra con zoom tu QTH y la estación, traza la ruta entre los dos y marca la estación.
   No abre la tarjeta de información: quien pulsa ya viene de verla. */
(function(){
"use strict";
let FOC=null,hooked=false;
function posFor(call,t){try{if(call){const C=String(call).toUpperCase();
    const s=(L.spots||[]).find(x=>String(x.call||"").toUpperCase()===C&&Array.isArray(x.dx)&&x.dx.length===2&&x.dx[0]!=null);if(s)return s.dx;
    const d=(L.dx||[]).find(x=>String(x.call||"").toUpperCase().split(/[ ,]+/).includes(C)&&isFinite(x.lon)&&isFinite(x.lat));if(d)return [d.lon,d.lat];
    const a=window.ACRACB_areaPos&&ACRACB_areaPos(C);if(a&&a.length===2)return a}}catch(e){}
  if(t&&isFinite(t.lon)&&isFinite(t.lat))return [t.lon,t.lat];return null}
function proj(){const el=document.getElementById("map");if(!el||typeof d3==="undefined")return null;
  const vb=(el.getAttribute("viewBox")||"0 0 900 900").trim().split(/\s+/).map(Number),W=vb[2]||900,H=vb[3]||900;
  return {W,H,pr:d3.geoAzimuthalEquidistant().rotate([-TXP[0],-TXP[1]]).fitExtent([[8,8],[W-8,H-8]],{type:"Sphere"}).precision(.4)}}
function sizes(){if(!ZROOT)return;const k=(ZT&&ZT.k)||1;ZROOT.selectAll("g.mfocus .mfdot").attr("r",7/k);ZROOT.selectAll("g.mfocus .mfpulse").attr("r",16/k);
  ZROOT.selectAll("g.mfocus .mflbl").attr("font-size",14/k).attr("stroke-width",4/k).each(function(){const t=d3.select(this);t.attr("x",+t.attr("data-x")+10/k).attr("y",+t.attr("data-y")-10/k)})}
function draw(zoom){if(!FOC||typeof ZROOT==="undefined"||!ZROOT)return;const P=proj();if(!P)return;const {pr,W,H}=P,path=d3.geoPath(pr),line={type:"LineString",coordinates:[TXP,FOC.p]};
  ZROOT.selectAll("g.mfocus").remove();const g=ZROOT.append("g").attr("class","mfocus");
  g.append("path").attr("class","mfroute").attr("d",path(line));const b=pr(FOC.p);if(!b)return;
  g.append("circle").attr("class","mfpulse").attr("cx",b[0]).attr("cy",b[1]).attr("r",16);
  g.append("circle").attr("class","mfdot").attr("cx",b[0]).attr("cy",b[1]).attr("r",7);
  if(FOC.lbl)g.append("text").attr("class","mflbl").attr("data-x",b[0]).attr("data-y",b[1]).attr("x",b[0]+10).attr("y",b[1]-10).text(FOC.lbl);
  if(ZM&&!hooked){hooked=true;ZM.on("zoom.mfocus",sizes)}
  sizes();
  if(zoom&&ZM&&ZSVG){const bb=path.bounds(line),x0=bb[0][0],y0=bb[0][1],x1=bb[1][0],y1=bb[1][1];
    const dx=Math.max(60,x1-x0),dy=Math.max(60,y1-y0),k=Math.max(1,Math.min(10,.72*Math.min(W/dx,H/dy))),cx=(x0+x1)/2,cy=(y0+y1)/2;
    const tr=d3.zoomIdentity.translate(W/2-k*cx,H/2-k*cy).scale(k);
    const red=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;(red?ZSVG:ZSVG.transition().duration(600)).call(ZM.transform,tr)}}
window.ACRACB_mapFocus=function(o){try{const t=o&&o.id?T(o.id):null,p=(o&&o.p)||posFor(o&&o.call,t);if(!p)return false;
    FOC={p,lbl:(o&&o.call)||(t?String(t.name).split(" (")[0]:"")};
    st.pop=null;const mp=document.getElementById("mpop");if(mp)mp.hidden=true;try{if(typeof closeCall==="function")closeCall()}catch(e){}
    if(!st.mapOn)st.mapOn=true;
    if(st.page!=="mapa")go("mapa");
    let n=0;const tryDraw=()=>{n++;if(typeof ZROOT!=="undefined"&&ZROOT&&document.getElementById("map")&&document.getElementById("map").querySelector("g.zroot"))draw(true);else if(n<30)setTimeout(tryDraw,100)};setTimeout(tryDraw,150);return true}
  catch(e){console.error(e);return false}};
/* el mapa se redibuja a menudo: la ruta se vuelve a poner sola; se quita al dejar la página del mapa */
function watch(){const el=document.getElementById("map");if(!el)return setTimeout(watch,500);
  new MutationObserver(()=>{if(FOC&&!el.querySelector("g.mfocus"))setTimeout(()=>draw(false),0)}).observe(el,{childList:true});
  setInterval(()=>{if(FOC&&st.page!=="mapa")FOC=null},2000)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",watch);else watch();
})();

/* 2.11.52: el modo de arriba (SSB, CW…) manda en toda la plataforma.
   Lo que se elija dentro de una sección (los modos del mapa, los del clúster en DX, “Mi modo / Todos” en Ahora)
   vale solo para esa sección, y se olvida en cuanto se cambia el modo de arriba.
   Antes la elección de una sección se arrastraba a todas y podía cambiar incluso el modo de arriba. */
(function(){
  if(typeof st!=="object"||!st||typeof MODES!=="object")return;
  const T=(a,b)=>window.ACRACB_LANG==="en"?b:a;
  const SC=["mapa","dx","ahora"];let OV={},FORCE=0;
  const main=()=>{const m=document.getElementById("modesel");return m?m.value:""};
  const key=()=>{let k="";try{k=MOD()}catch(_){}return k+"|"+main()};
  const all=()=>{const m=MOD();return [m,...Object.keys(MODES).filter(k=>k!==m)]};
  const dflt=()=>main()==="all"?all():[MOD()];
  const scope=()=>FORCE||!SC.includes(st.page)?"g":st.page;
  try{delete st.cms;delete st.cmsBase}catch(_){}
  Object.defineProperty(st,"cms",{configurable:true,
    get(){const s=scope();const o=OV[s];if(s!=="g"&&o&&o.k===key())return o.v;return dflt()},
    set(v){const s=scope();if(s==="g"||!Array.isArray(v))return;OV[s]={v:v.slice(),k:key()}}});
  /* CMS() solo recalcula si cmsBase no coincide: así siempre lee lo de arriba */
  Object.defineProperty(st,"cmsBase",{configurable:true,get(){try{return MOD()}catch(_){return ""}},set(){}});
  try{localStorage.removeItem("cmsall")}catch(_){}
  const after=()=>{try{CACHE.clear()}catch(_){}try{renderAlBar()}catch(_){}try{renderBandSeg()}catch(_){}try{renderSide()}catch(_){}
    try{if(window.ACRACB_clrender)ACRACB_clrender()}catch(_){}try{if(st.page==="mapa")drawMap()}catch(_){}};
  /* tocar un modo en el mapa o en DX ya no cambia el modo de arriba */
  window.toggleCM=toggleCM=function(k){const AL=Object.keys(MODES);let s=CMS().slice();
    if(s.length===AL.length)s=[k];else if(s.includes(k)){s=s.filter(x=>x!==k);if(!s.length)s=all()}else s.push(k);
    st.cms=s;if(st.page==="mapa")st.mapOn=true;after()};
  window.setAllCM=setAllCM=function(w){if(scope()==="g"){after();return}st.cms=w?all():[MOD()];if(st.page==="mapa")st.mapOn=true;after()};
  window.toggleAllCM=toggleAllCM=function(){st.cms=CMS().length===Object.keys(MODES).length?[MOD()]:all();if(st.page==="mapa")st.mapOn=true;after()};
  /* el aviso DX de arriba es de toda la plataforma: siempre con el modo de arriba */
  const _ra=renderAlBar;window.renderAlBar=renderAlBar=function(){FORCE=1;try{return _ra.apply(this,arguments)}finally{FORCE=0}};
  /* en el mapa, la predicción es siempre la del modo de arriba; ya no hay selector que lo cambie desde aquí */
  const _rm=renderModeChips;window.renderModeChips=renderModeChips=function(ms,wp){const r=_rm.apply(this,arguments);
    try{if(ms&&wp){const p=ms.querySelector(".mpred");if(p){const m=MODES[MOD()].s,c=CMSTXT(),one=CMS().length===1&&CMS()[0]===MOD();
      p.innerHTML=one?T(`Prediction and cluster in ${m}, el modo de arriba. Toca otros modos para verlos en el mapa.`,`Prediction and cluster in ${m}, the mode at the top. Tap other modes to see them on the map.`)
        :T(`Predicción en ${m}, el modo de arriba · clúster en el mapa: ${c}`,`Prediction in ${m}, the mode at the top · cluster on the map: ${c}`)}}}catch(_){}return r};
  /* al cambiar de sección cambia lo que vale: se vuelve a pintar con lo de esa sección */
  const _go=go;window.go=go=function(){const b=CMS().join();const r=_go.apply(this,arguments);if(CMS().join()!==b)after();return r};
  /* cambiar el modo de arriba borra las elecciones de las secciones */
  document.addEventListener("change",ev=>{if(ev.target&&ev.target.id==="modesel"){OV={};setTimeout(after,0)}},true);
  window.ACRACB_cmsScope=()=>({scope:scope(),ov:JSON.parse(JSON.stringify(OV)),cms:CMS()});
})();

/* 2.11.55: “Acierto de la previsión”. Se mide si la fiabilidad que da el modelo acierta, con hechos y no con opiniones:
   WSPR (wspr.live, gratuito y sin registro) dice qué estaciones transmitieron de verdad cada hora y en qué banda, y quién las oyó.
   Evento: una zona lejana (cuadrícula Maidenhead de 2 letras, a más de 1.500 km) que transmitió en esa banda y esa hora
   (la oyeron al menos 5 veces en el mundo) ¿fue oída por algún receptor WSPR a menos de 400 km de ti?
   Solo cuentan las horas y bandas en que los receptores cercanos estaban escuchando (descodificaron algo): así un “no”
   es un no de verdad, y no falta de receptores. Previsión: la de VOACAP con tu estación como receptor, la potencia
   mediana que declaran esos transmisores y el umbral de WSPR (6 dB en 1 Hz), sin las correcciones del día, que no
   existían esas horas: es una previsión hecha antes del suceso, porque solo usa la previsión mensual.
   Se compara con la climatología (la frecuencia media de cada banda en la misma muestra) con la puntuación de Brier. */
(function(){
  const T=(a,b)=>window.ACRACB_LANG==="en"?b:a;
  const CK="acracb_calib1",DAYS=3,NEAR=400,FAR=1500,THR=6;
  const WB={1:0,3:1,5:8,7:2,10:9,14:3,18:4,21:5,24:6,28:7};
  const nf=(x,d)=>{const s=(+x).toFixed(d);return window.ACRACB_LANG==="en"?s:s};
  /* directo; si falla, por el intermediario de la plataforma (el mismo que ya usa la fuente WSPR.live) */
  async function get(u){const c=new AbortController(),tm=setTimeout(()=>c.abort(),45000);try{const r=await fetch(u,{signal:c.signal});if(!r.ok)throw new Error("HTTP "+r.status);return await r.text()}finally{clearTimeout(tm)}}
  async function q(sql){const u="https://db1.wspr.live/?query="+encodeURIComponent(sql+" FORMAT TSV");let t;
    try{t=await get(u)}catch(e){t=await get("https://acracb-dx.ea5jnf.workers.dev/?u="+encodeURIComponent(u))}
    return t.trim().split("\n").filter(Boolean).map(l=>l.split("\t"))}
  function nearestT(lat,lon,ts){let best=null,bd=1e9;for(const t of ts){const dl=t.lat-lat,dn=((t.lon-lon+540)%360-180)*Math.cos(lat*Math.PI/180),d=dl*dl+dn*dn;if(d<bd){bd=d;best=t}}return best}
  async function run(){
    const P=TXP,lat=P[1],lon=P[0];
    const g=`greatCircleDistance(rx_lon,rx_lat,${lon.toFixed(3)},${lat.toFixed(3)})`,gt=`greatCircleDistance(tx_lon,tx_lat,${lon.toFixed(3)},${lat.toFixed(3)})`;
    const bands=Object.keys(WB).join(",");
    const [ev,cov]=await Promise.all([
      q(`SELECT toUnixTimestamp(toStartOfHour(time)) h,band,substring(tx_loc,1,2) f,round(avg(tx_lat),1),round(avg(tx_lon),1),round(median(power)),countIf(${g}<${NEAR*1000}) FROM wspr.rx WHERE time>now()-INTERVAL ${DAYS} DAY AND time<toStartOfHour(now()) AND band IN (${bands}) AND ${gt}>${FAR*1000} GROUP BY h,band,f HAVING count()>=5`),
      q(`SELECT toUnixTimestamp(toStartOfHour(time)) h,band,count() FROM wspr.rx WHERE time>now()-INTERVAL ${DAYS} DAY AND time<toStartOfHour(now()) AND band IN (${bands}) AND ${g}<${NEAR*1000} GROUP BY h,band`)]);
    const C=new Set(cov.filter(r=>+r[2]>=3).map(r=>r[0]+"|"+r[1]));
    const ts=TG().filter(t=>t.lat!=null);const near={};const Q=PRM();
    /* previsión mensual sin correcciones del día: se apagan solo durante este cálculo, que no espera a nada */
    const keep={ionoK,stormK,auroraDb,geoK};const MC=new Map();const rows=[];
    try{ionoK=()=>1;stormK=()=>1;auroraDb=()=>0;geoK=()=>({k:1,ds:0});
      for(const r of ev){const h=+r[0],wb=+r[1];if(!C.has(r[0]+"|"+r[1]))continue;const b=WB[wb];if(b==null)continue;
        const fl=r[2];const t=near[fl]||(near[fl]=nearestT(+r[3],+r[4],ts));if(!t)continue;
        const lh=(new Date(h*1000).getUTCHours()+1)%24,k=t.id+"|"+lh+"|"+b;
        let M=MC.get(k);if(M===undefined){try{M=marg(t,lh,b,false,true)}catch(_){M=null}MC.set(k,M)}if(!M)continue;
        const pw=+r[5];const d=(isFinite(pw)?pw:30)-50-Q.opw;
        const p=rel(M.m+d+Q.cal,M.DL,M.DU,THR);rows.push({b,p:Math.max(0,Math.min(1,p)),o:+r[6]>0?1:0})}}
    finally{ionoK=keep.ionoK;stormK=keep.stormK;auroraDb=keep.auroraDb;geoK=keep.geoK;try{CACHE.clear()}catch(_){}}
    return score(rows)}
  function score(rows){const n=rows.length;if(!n)return {n:0,at:Date.now()};
    const byB={};rows.forEach(r=>{(byB[r.b]=byB[r.b]||[]).push(r)});
    const clim={};for(const b in byB)clim[b]=byB[b].reduce((s,r)=>s+r.o,0)/byB[b].length;
    let bm=0,bc=0;rows.forEach(r=>{bm+=(r.p-r.o)**2;bc+=(clim[r.b]-r.o)**2});bm/=n;bc/=n;
    const bins=[0,.1,.3,.5,.7,.9,1.0001].map((x,i,a)=>i<a.length-1?{lo:x,hi:a[i+1],n:0,p:0,o:0}:null).filter(Boolean);
    rows.forEach(r=>{const k=bins.find(x=>r.p>=x.lo&&r.p<x.hi);if(k){k.n++;k.p+=r.p;k.o+=r.o}});
    bins.forEach(k=>{if(k.n){k.p/=k.n;k.o/=k.n}});
    const band=Object.keys(byB).map(b=>({b:+b,n:byB[b].length,p:byB[b].reduce((s,r)=>s+r.p,0)/byB[b].length,o:clim[b]})).sort((x,y)=>MHZ[x.b]-MHZ[y.b]);
    return {n,bm,bc,bss:bc>0?1-bm/bc:null,base:rows.reduce((s,r)=>s+r.o,0)/n,bins,band,at:Date.now()}}
  function view(R){
    if(!R)return `<p>${T("Aún no se ha medido en este aparato.","Not measured on this device yet.")}</p>`;
    if(!R.n)return `<p>${T("No hubo datos suficientes: los receptores WSPR cercanos no escucharon o nadie lejano transmitió. Prueba más tarde.","There was not enough data: nearby WSPR receivers were not listening or nobody far away transmitted. Try later.")}</p>`;
    const pc=x=>Math.round(x*100)+" %";const few=R.n<300;
    const skill=R.bss==null?"—":R.bss>0?T(`mejor que la climatología en un ${pc(R.bss)}`,`better than climatology by ${pc(R.bss)}`):T(`peor que la climatología en un ${pc(-R.bss)}`,`worse than climatology by ${pc(-R.bss)}`);
    const when=new Date(R.at).toLocaleString(window.ACRACB_LANG==="en"?"en-US":"en-US",{timeZone:"Europe/Madrid",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
    return `<p class="acc1"><b>${R.n}</b> ${T("casos de los últimos 3 días","cases from the last 3 days")} · ${T("puntuación de Brier","Brier score")} <b>${nf(R.bm,3)}</b> ${T("frente a","vs")} ${nf(R.bc,3)} ${T("de la climatología","for climatology")}: <b>${skill}</b>.${few?` <span class="acc-few">${T("Son pocos casos: tómalo como orientativo.","Few cases: take it as a rough guide.")}</span>`:""}</p>
    <div class="acct"><div class="acch"><span>${T("El modelo dijo","The model said")}</span><span>${T("media","average")}</span><span>${T("Se oyó","Heard")}</span><span>${T("casos","cases")}</span></div>
    ${R.bins.filter(k=>k.n).map(k=>`<div class="accr"><span>${pc(k.lo)}–${pc(Math.min(1,k.hi))}</span><span>${pc(k.p)}</span><b>${pc(k.o)}</b><span>${k.n}</span></div>`).join("")}</div>
    <p class="note">${T("Si la previsión está bien calibrada, “Se oyó” se parece a “media” en cada fila.","If the forecast is well calibrated, “Heard” is close to “average” in each row.")}</p>
    <div class="acct"><div class="acch"><span>${T("Band","Band")}</span><span>${T("previsto","forecast")}</span><span>${T("Se oyó","Heard")}</span><span>${T("casos","cases")}</span></div>
    ${R.band.map(x=>`<div class="accr"><span>${BANDS[x.b]}</span><span>${pc(x.p)}</span><b>${pc(x.o)}</b><span>${x.n}</span></div>`).join("")}</div>
    <p class="note">${T(`Medido el ${when}.`,`Measured on ${when}.`)}</p>`}
  function load(){try{return JSON.parse(localStorage.getItem(CK)||"null")}catch(_){return null}}
  function save(R){try{localStorage.setItem(CK,JSON.stringify(R))}catch(_){}}
  function mount(){const box=document.getElementById("accbox");if(!box||box.__m)return;box.__m=1;
    const res=box.querySelector(".accres"),btn=box.querySelector(".accbtn");res.innerHTML=view(load());
    btn.onclick=async()=>{btn.disabled=true;const tx=btn.textContent;btn.textContent=T("Midiendo… puede tardar un minuto","Measuring… it may take a minute");
      try{const R=await run();save(R);res.innerHTML=view(R)}catch(e){res.innerHTML=`<p>${T("WSPR.live no respondió","WSPR.live did not respond")} (${String(e&&e.name==="AbortError"?T("tiempo agotado","timed out"):e&&e.message||e)}). ${T("Prueba más tarde.","Try later.")}</p>`}
      finally{btn.disabled=false;btn.textContent=tx}}}
  window.ACRACB_calibScore=score;
  let n=0;(function go(){mount();if(!document.getElementById("accbox")||!document.getElementById("accbox").__m){if(++n<120)setTimeout(go,500)}})();
})();

/* 2.11.56: el patrón real de tu antena. Se importa la salida de NEC-2 (4nec2, MMANA-GAL exportado a NEC, xnec2c…) o
   una tabla CSV “frecuencia MHz, azimut, elevación, ganancia dBi”. Debe estar calculado sobre suelo real y a tu altura,
   porque se usa tal cual: no se le añade otro reflejo del suelo. En cada banda se usa la frecuencia del patrón más
   cercana (como mucho a un 12%); en las bandas que el patrón no cubre, esta antena no transmite.
   Giratoria: se supone apuntada hacia cada destino (se toma la dirección de máxima ganancia). Fija: se usa el rumbo real
   de cada destino respecto a hacia dónde apunta. Todo se guarda solo en este aparato. */
(function(){
  if(typeof ANT!=="object"||typeof gAnt!=="function")return;
  const T=(a,b)=>window.ACRACB_LANG==="en"?b:a;
  const KEY="acracb_antpat1";
  let P=null;try{P=JSON.parse(localStorage.getItem(KEY)||"null")}catch(_){P=null}
  const nf=(x,d)=>{const s=(+x).toFixed(d);return window.ACRACB_LANG==="en"?s:s};

  /* ---------- lectura ---------- */
  function grid(pts){const az=[...new Set(pts.map(p=>p[0]))].sort((a,b)=>a-b),el=[...new Set(pts.map(p=>p[1]))].sort((a,b)=>a-b);
    const g=el.map(()=>az.map(()=>null));const ia=new Map(az.map((v,i)=>[v,i])),ie=new Map(el.map((v,i)=>[v,i]));
    for(const [a,e,v] of pts){const r=g[ie.get(e)];const c=ia.get(a);if(r[c]==null||v>r[c])r[c]=v}
    /* huecos: el valor más cercano de la misma elevación */
    for(const r of g)for(let i=0;i<r.length;i++)if(r[i]==null){let k=1;while(k<r.length){const L=r[(i-k+r.length)%r.length],R=r[(i+k)%r.length];if(L!=null||R!=null){r[i]=L!=null?L:R;break}k++}if(r[i]==null)r[i]=-99}
    return {az,el,g}}
  function parseNEC(txt){const out={};const lines=txt.split(/\r?\n/);let f=null,inP=false;
    for(const l of lines){const m=l.match(/FREQUENCY\s*[=:]\s*([\d.]+E?[+-]?\d*)\s*MHZ/i);if(m){f=+(+m[1]).toPrecision(6);inP=false;continue}
      if(/RADIATION PATTERNS/i.test(l)){inP=true;continue}
      if(!inP||f==null)continue;
      const c=l.trim().split(/\s+/);if(c.length<5||!/^-?[\d.]+$/.test(c[0])||!/^-?[\d.]+$/.test(c[1])){if(/^\s*$/.test(l)||/DEGREES|THETA|ANGLES/i.test(l))continue;if(out[f]&&out[f].length)inP=false;continue}
      const th=+c[0],ph=+c[1],tot=+c[4];if(!isFinite(th)||!isFinite(ph)||!isFinite(tot))continue;if(th>90)continue;
      (out[f]=out[f]||[]).push([((-ph)%360+360)%360,Math.round((90-th)*100)/100,tot<-900?-99:tot])}
    return out}
  function parseCSV(txt){const out={};for(const l of txt.split(/\r?\n/)){const c=l.split(/[;,\t]/).map(x=>x.trim().replace(",","."));if(c.length<4)continue;const [f,a,e,g]=c.map(Number);if(![f,a,e,g].every(isFinite))continue;if(e<0||e>90)continue;
    (out[f]=out[f]||[]).push([((a%360)+360)%360,e,g])}return out}
  function build(name,txt){let raw=parseNEC(txt);if(!Object.keys(raw).length)raw=parseCSV(txt);
    const F={};for(const f in raw){if(raw[f].length<4)continue;F[f]=grid(raw[f])}
    if(!Object.keys(F).length)throw new Error(T("no se encontró ningún diagrama de radiación ni tabla con frecuencia, azimut, elevación y ganancia","no radiation pattern or table with frequency, azimuth, elevation and gain was found"));
    return {name:name||T("Mi antena","My antenna"),fixed:false,head:0,F}}

  /* ---------- uso ---------- */
  function fFor(b){if(!P)return null;let best=null,bd=1;for(const f in P.F){const d=Math.abs(+f-MHZ[b])/MHZ[b];if(d<bd){bd=d;best=f}}return bd<=.12?P.F[best]:null}
  function bil(G,az,el){const {az:A,el:E,g}=G;const fi=(arr,v)=>{if(v<=arr[0])return [0,0,0];if(v>=arr[arr.length-1])return [arr.length-1,arr.length-1,0];let i=0;while(arr[i+1]<v)i++;return [i,i+1,(v-arr[i])/(arr[i+1]-arr[i])]};
    const full=A[A.length-1]-A[0]>=300;let [a0,a1,ta]=fi(A,az);if(full&&(az>A[A.length-1]||az<A[0])){a0=A.length-1;a1=0;const span=360-A[A.length-1]+A[0];ta=((az-A[A.length-1]+360)%360)/span}
    const [e0,e1,te]=fi(E,el);/* se interpola en potencia, no en dB: cerca del horizonte, donde NEC da −999, queda razonable */const v=(r,c)=>Math.pow(10,Math.max(-99,g[r][c])/10);const top=v(e0,a0)*(1-ta)+v(e0,a1)*ta,bot=v(e1,a0)*(1-ta)+v(e1,a1)*ta;const w=top*(1-te)+bot*te;return w>0?Math.max(-99,10*Math.log10(w)):-99}
  function maxAt(G,el){let m=-99;for(let i=0;i<G.az.length;i++)m=Math.max(m,bil(G,G.az[i],el));return m}
  function bandsOf(){return [0,1,8,2,9,3,4,5,6,7,10].filter(b=>fFor(b))}
  function define(){if(P){ANT.pat={n:P.name,bands:bandsOf(),pat:true,d:T(`patrón importado de “${P.name}”`,`imported pattern of "${P.name}"`)}}else delete ANT.pat}
  define();
  const _gAnt=gAnt;window.gAnt=gAnt=function(id,th,b){if(id==="pat"){const G=fFor(b);return G?maxAt(G,th):-99}return _gAnt.apply(this,arguments)};
  /* antena fija: el rumbo de cada destino cuenta */
  const _aa=antAdj;window.antAdj=antAdj=function(t,lh,b,lp){const ids=ANTS();if(!P||!P.fixed||!ids.includes("pat"))return _aa.apply(this,arguments);
    const G=fFor(b);if(!G)return _aa.apply(this,arguments);let [a]=hopRaw(t,lp&&t.l,hidx(lh),b);if(!a)a=6;
    const brg=((lp?(t.laz!=null?t.laz:t.az+180):t.az)%360+360)%360,rel=((brg-(+P.head||0))%360+360)%360;
    const gp=bil(G,rel,a)-gVert(a);let best=gp;for(const id of ids){if(id==="pat"||!ANT[id]||!ANT[id].bands.includes(b))continue;best=Math.max(best,gAnt(id,a,b)-gVert(a))}return best};

  /* ---------- interfaz ---------- */
  function opt(){const s=document.getElementById("antsel");if(!s)return;let o=s.querySelector('option[value="pat"]');
    if(P&&!o){const g=document.createElement("optgroup");g.label=T("Tu antena","Your antenna");o=document.createElement("option");o.value="pat";g.appendChild(o);s.appendChild(g)}
    if(o){if(P)o.textContent=T(`${P.name} · patrón importado`,`${P.name} · imported pattern`);else{const g=o.parentElement;o.remove();if(g&&g.tagName==="OPTGROUP"&&!g.children.length)g.remove()}}}
  function refresh(){define();try{MZ.clear()}catch(_){}try{CACHE.clear()}catch(_){}opt();const s=document.getElementById("antsel");if(s)s.dispatchEvent(new Event("change",{bubbles:true}));ui()}
  function summary(){if(!P)return `<p>${T("No hay ningún patrón importado.","No pattern imported.")}</p>`;
    const bs=bandsOf();const rows=bs.map(b=>{const G=fFor(b);const pk=[5,10,20,30].map(e=>nf(maxAt(G,e),1)).join(" · ");return `<div class="patr"><span>${BANDS[b]}</span><span>${pk}</span></div>`}).join("");
    return `<p><b>${P.name}</b> · ${bs.length?T(`cubre ${bs.map(b=>BANDS[b]).join(", ")}`,`covers ${bs.map(b=>BANDS[b]).join(", ")}`):T("no cubre ninguna banda de HF","covers no HF band")}.</p>
      ${bs.length?`<div class="patt"><div class="patr path"><span>${T("Band","Band")}</span><span>${T("dBi máx. a 5° · 10° · 20° · 30°","max dBi at 5° · 10° · 20° · 30°")}</span></div>${rows}</div>`:""}
      <div class="patc"><label><input type="radio" name="patfx" value="rot"${P.fixed?"":" checked"}> ${T("Giratoria: apunta a cada destino","Rotatable: points at each destination")}</label>
      <label><input type="radio" name="patfx" value="fix"${P.fixed?" checked":""}> ${T("Fija, apuntando a","Fixed, pointing at")} <input type="number" class="pathd" min="0" max="359" step="1" value="${+P.head||0}" aria-label="${T("Rumbo al que apunta","Bearing it points to")}">°</label></div>
      <p class="note">${T("Para usarla, elígela en “Tipo de antena”: aparece al final de la lista.","To use it, choose it in “Antenna type”: it appears at the end of the list.")}</p>
      <button type="button" class="btn patdel">${T("Quitar el patrón","Remove the pattern")}</button>`}
  function ui(){let box=document.getElementById("patbox");const host=document.querySelector("#cfg .cfgfine");if(!host)return false;
    if(!box){box=document.createElement("details");box.id="patbox";box.className="mdet patbox";host.appendChild(box)}
    const op=box.open;
    box.innerHTML=`<summary>${T("El patrón real de tu antena (NEC o tabla)","Your antenna's real pattern (NEC or table)")}</summary>
      <p>${T("Si has simulado tu antena con 4nec2, xnec2c u otro programa NEC-2, sube el archivo de salida. También vale una tabla CSV con frecuencia en MHz, azimut, elevación y ganancia en dBi, una línea por punto. Calcúlalo sobre suelo real y a tu altura: se usa tal cual.","If you have simulated your antenna with 4nec2, xnec2c or another NEC-2 program, upload the output file. A CSV table with frequency in MHz, azimuth, elevation and gain in dBi, one line per point, also works. Compute it over real ground and at your height: it is used as is.")}</p>
      <label class="patf"><span>${T("Nombre","Name")}</span> <input type="text" class="patn" maxlength="40" value="${P?String(P.name).replace(/"/g,"&quot;"):""}" placeholder="${T("Mi antena","My antenna")}"></label>
      <label class="patf"><input type="file" class="patin" accept=".out,.txt,.csv,.nou,text/plain,text/csv"></label>
      <div class="patres">${summary()}</div>`;
    box.open=op;
    box.querySelector(".patin").onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const res=box.querySelector(".patres");
      try{if(f.size>8e6)throw new Error(T("el archivo pasa de 8 MB","the file is over 8 MB"));const txt=await f.text();const nm=box.querySelector(".patn").value.trim()||f.name.replace(/\.[^.]+$/,"");
        const N=build(nm,txt);if(P){N.fixed=P.fixed;N.head=P.head}P=N;localStorage.setItem(KEY,JSON.stringify(P));box.open=true;refresh()}
      catch(err){res.innerHTML=`<p class="paterr">${T("No se pudo leer","Could not read it")}: ${String(err&&err.message||err)}</p>`}};
    box.querySelector(".patn").onchange=e=>{if(!P)return;P.name=e.target.value.trim()||T("Mi antena","My antenna");localStorage.setItem(KEY,JSON.stringify(P));refresh()};
    box.querySelectorAll('input[name="patfx"]').forEach(r=>r.onchange=()=>{if(!P)return;P.fixed=r.value==="fix"&&r.checked;localStorage.setItem(KEY,JSON.stringify(P));refresh()});
    const hd=box.querySelector(".pathd");if(hd)hd.onchange=()=>{if(!P)return;P.head=Math.max(0,Math.min(359,+hd.value||0));localStorage.setItem(KEY,JSON.stringify(P));refresh()};
    const del=box.querySelector(".patdel");if(del)del.onclick=()=>{const s=document.getElementById("antsel");if(s&&s.value==="pat"){s.value="club"}P=null;localStorage.removeItem(KEY);refresh()};
    return true}
  window.ACRACB_patTest={parseNEC,parseCSV,build,set:(p)=>{P=p;refresh()},gain:(b,az,el)=>{const G=fFor(b);return G?bil(G,az,el):null}};
  opt();
  /* al cargar, la elección guardada “pat” no se pudo poner porque la opción aún no existía: se pone ahora */
  try{const s=document.getElementById("antsel");const v=typeof store==="object"&&store.get?store.get("c_antsel"):null;if(P&&s&&v==="pat"&&s.value!=="pat"){s.value="pat";refresh()}}catch(_){}
  let n=0;(function go(){if(!ui()&&++n<120)setTimeout(go,500)})();
})();

