/* ---- ACRACB 2.10.35: la estación, a un toque ----
   En la línea de la estación, el modo, la banda, la potencia y la antena se cambian tocándolos: se abre directamente el selector
   del propio aparato (la rueda en el iPhone y el iPad, la lista en Android y en el ordenador), sin desplegar el panel entero.
   Lo demás (locator, suelo, alturas, coaxial…) sigue en «Editar estación», y tocar el locator lo abre como antes. */
(function(){
"use strict";
if(window.__hkQS)return;window.__hkQS=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $i=id=>document.getElementById(id);
/* 2.11.3: cada pieza es un botón que abre un menú propio, igual en iPhone, iPad, Android y ordenador. Antes había un
   selector invisible encima del texto: en Safari a veces no se abría o se quedaba marcado, y la raya de debajo se veía rota */
function seg(id,label){const s=$i(id);if(!s)return e2(label);
  return `<button type="button" class="qs" data-qs="${id}" aria-haspopup="listbox" aria-expanded="false" aria-label="${e2((s.getAttribute("aria-label")||"")+": "+label)}">${e2(label)}<span class="qsc" aria-hidden="true"></span></button>`}
function sum(){const e=$i("ssum");if(!e)return false;let loc="",md="",h=null,pw="",an="";
  try{loc=String($i("loc").value||"").slice(0,6);md=MD().s;h=HB();const p=PWN().split(" ");pw=p[0]+" "+p[1];an=ANTL()}catch(_){return false}
  /* 2.11.4: sin puntos entre piezas (los botones ya se separan) ni «Concursos» al final, que ya lo dice el botón de modo */
  /* 2.11.6: más corto en el móvil: «Todas» y las combinaciones de antenas resumidas («Directiva 3 el. + 2 dipolos») */
  const nar=innerWidth<=480,ps=String(an).split(" + ");if(ps.length>2||(nar&&ps.length>1)){const r=ps.slice(1),dp=r.every(x=>/dipol/i.test(x));an=ps[0]+" + "+(dp?T(`${r.length} ${r.length>1?"dipolos":"dipolo"}`,`${r.length} ${r.length>1?"dipoles":"dipole"}`):T(`${r.length} más`,`${r.length} more`))}
  /* 2.11.7: todo en la misma caja: también el locator, la altitud y el entorno son botones; lo demás, en «Más» */
  const al=$i("altin"),gv=($i("gnd")||{}).value,gl={rock:T("Suelo seco","Dry ground"),avg:T("Tierra normal","Average ground"),coast:T("Junto al mar","By the sea"),sea:T("Agua salada","Salt water")}[gv]||"";
  /* 2.11.9: a la vista solo lo que se cambia a menudo (modo, banda y potencia) y el botón con tu locator, que despliega
     en la misma caja lo que casi nunca se toca: locator, antena, altitud, entorno, tu log y lo demás */
  e.classList.add("qsbar");
  const html=`${seg("modesel",md)}${seg("bandsel",h!=null?BANDS[h]:(nar?T("Todas","All"):T("Todas las bandas","All bands")))}${seg("eq",pw)}`;
  if(e.dataset.qh!==html){e.innerHTML=html;e.dataset.qh=html}
  const e2b=bar2();if(e2b){const h2=`${seg("locin",loc)}${seg("antsel",an)}${al?seg("altin",(al.value||"0")+" m"):""}${gl?seg("gnd",gl):""}`;
    let w=e2b.querySelector(".qsb2");if(!w){w=document.createElement("span");w.className="qsb2";e2b.prepend(w)}if(w.dataset.qh!==h2){w.innerHTML=h2;w.dataset.qh=h2}
    const lb=$i("logbtn");if(lb&&lb.parentElement!==e2b)e2b.appendChild(lb)}
  /* 2.11.19: el botón de arriba es solo una flecha; el locator está dentro del desplegable */
  const sl=document.querySelector("#stbtn .stl");if(sl&&sl.textContent)sl.textContent="";
  return true}
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
    M.innerHTML=`<label class="qsfl">${isL?T("Locator","Locator"):T("Altitud sobre el nivel del mar","Altitude above sea level")}</label><div class="qsfr"><input class="qsfi" ${isL?`type="text" maxlength="10" autocomplete="off" spellcheck="false" autocapitalize="characters" placeholder="IM98RI"`:`type="number" inputmode="numeric" min="0" max="5000" step="10"`} value="${e2(s.value)}">${isL?"":`<span class="qsfu">m</span>`}<button type="button" class="qsfo">${T("Aplicar","Apply")}</button></div><p class="qsfn"></p>`;
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
/* 2.11.6: «Editar estación» es solo un icono: su texto pasa a ser el título y la etiqueta accesible */
function btnT(){const b=$i("stbtn");if(!b)return;if(!b.querySelector(".stl")){const l=document.createElement("b");l.className="stl";l.setAttribute("aria-hidden","true");b.appendChild(l);try{$i("ssum").dataset.qh="";sum()}catch(_){}}const p=$i("stpanel"),sl=b.closest(".sline");if(p&&sl&&p.parentElement!==sl)sl.appendChild(p);
  /* 2.11.18: el botón del locator solo abre y cierra el panel. El manejador antiguo reescribía el botón entero («Cerrar» /
     «Editar estación») y borraba el locator, que ya no volvía al cerrar */
  if(p){const loc=()=>{try{return ($i("loc")&&$i("loc").value||"").toUpperCase()}catch(_){return ""}};
    b.onclick=()=>{p.hidden=!p.hidden;b.setAttribute("aria-expanded",String(!p.hidden));
      let l=b.querySelector(".stl");if(!l){b.textContent="";l=document.createElement("b");l.className="stl";l.setAttribute("aria-hidden","true");b.appendChild(l)}
      [...b.childNodes].forEach(n=>{if(n!==l)n.remove()});l.textContent="";try{sum()}catch(_){}
      if(!p.hidden)p.scrollIntoView({block:"nearest"})}}
  const f=()=>{const t=b.getAttribute("aria-expanded")==="true"?T("Ocultar tu estación","Hide your station"):T("Tu estación: locator, antena, altura y suelo","Your station: locator, antenna, height and ground");if(b.title!==t){b.title=t;b.setAttribute("aria-label",t)}};f();
  new MutationObserver(f).observe(b,{attributes:true,attributeFilter:["aria-expanded"],childList:true,subtree:true,characterData:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{hook();btnT()});else{hook();btnT()}
})();
