/* ---- ACRACB 2.11.39: anunciar un spot en el clúster interno de la plataforma ----
   Según el documento del proyecto: el spot se publica en el clúster interno (el intermediario del club en Cloudflare lo
   guarda una hora) y lo ven todos los socios en unos segundos, sin recargar. La difusión a clústeres externos es aparte,
   nunca retrasa la publicación interna y solo va a los nodos que admiten spots sin registro (SpottedHam, WA9PIE y EA7JXH).
   Nada se envía sin que lo confirmes; tu spot lo puedes retirar desde este mismo dispositivo. */
(function(){
"use strict";
const T=(a,b)=>window.ACRACB_LANG==="en"?b:a,$=id=>document.getElementById(id);
const RELAY="https://acracb-dx.ea5jnf.workers.dev",WEB="https://www.dxsummit.fi/";
const KCLUB="acracb_clubkey",KCALL="acracb_mycall",KLAST="acracb_spotlast",KMINE="acracb_myspots2";
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
const manual=s=>T(`Si quieres, puedes anunciarlo tú mismo en <a href="${WEB}" target="_blank" rel="noopener noreferrer" data-ext>DX Summit</a>: tu indicativo <b>${esc(s.de)}</b>, DX <b>${esc(s.dx)}</b>, <b>${s.f.toFixed(1)}</b> kHz${s.info?`, «${esc(s.info)}»`:""}.`,`If you like, you can post it yourself on <a href="${WEB}" target="_blank" rel="noopener noreferrer" data-ext>DX Summit</a>: your call <b>${esc(s.de)}</b>, DX <b>${esc(s.dx)}</b>, <b>${s.f.toFixed(1)}</b> kHz${s.info?`, “${esc(s.info)}”`:""}.`);

/* ---- spots de los socios: llegan del intermediario cada 15 s (con la página a la vista) y entran en el clúster de la
   plataforma marcados como «comunicados por un socio»; los tuyos salen al momento en tu dispositivo ---- */
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
/* etiqueta «Socio» en las tarjetas y filas del clúster: un spot comunicado por un socio no es una predicción ni una
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

/* 2.11.85: clave del club para publicar (la pide el intermediario si el club la ha puesto); se escribe una vez y queda en este dispositivo */
async function send(s){const b=$("spgo");{const k=$("spk");if(k&&k.value.trim())put(KCLUB,k.value.trim())}b.disabled=true;msg(T("Publicando…","Posting…"));put(KCALL,s.de);
  let r=null,j=null;
  try{r=await fetch(RELAY+"/spot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({de_call:s.de,dx_call:s.dx,frequency:s.f.toFixed(1),info:s.info,club:get(KCLUB)}),cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});try{j=await r.json()}catch(_){}}catch(_){}
  b.disabled=false;
  if(r&&r.ok&&j&&j.status==="ok"&&j.spot){put(KLAST,JSON.stringify({dx:s.dx,f:s.f,at:Date.now()}));$("spconf").hidden=true;
    const m=Object.assign({},j.spot,{clave:j.clave});const a=mineAll();a.push(m);saveMine(a);putMine();showMine();
    const hay=Object.values(j.spot.estado||{}).some(v=>v!=="deshabilitado");
    msg(T(`Publicado: <b>${esc(s.dx)}</b> en ${s.f.toFixed(1)} kHz ya está en el clúster de la plataforma. Los demás socios lo verán en unos segundos.`,`Posted: <b>${esc(s.dx)}</b> on ${s.f.toFixed(1)} kHz is now on the platform cluster. Other members will see it within seconds.`)
      +(hay?`<small class="spno">${T("También se envía a otros clústeres de la red; su estado sale abajo.","It is also sent to other clusters on the network; their status is shown below.")}</small>`:""),"ok");return}
  if(r&&r.status===409&&j&&j.spot){msg(T(`Ese spot ya está publicado: <b>${esc(j.spot.dx)}</b> en ${(+j.spot.f).toFixed(1)} kHz, por ${esc(j.spot.de)} a las ${new Date(j.spot.ts).toISOString().slice(11,16)} UTC.`,`That spot is already posted: <b>${esc(j.spot.dx)}</b> on ${(+j.spot.f).toFixed(1)} kHz, by ${esc(j.spot.de)} at ${new Date(j.spot.ts).toISOString().slice(11,16)} UTC.`),"warn");return}
  if(r&&r.status===401){put(KCLUB,"");const l=$("spkl");if(l){l.hidden=false;const k=$("spk");if(k){k.value="";k.focus()}}msg(T("Para publicar hace falta la clave del club. Escríbela arriba y vuelve a revisar y publicar. Si no la tienes, pídesela al club.","Posting needs the club key. Type it above, then review and post again. If you do not have it, ask the club."),"warn");return}
  if(r&&r.status===429){msg(T("Espera medio minuto entre un spot y el siguiente.","Wait half a minute between spots."),"warn");return}
  if(r&&r.status===400&&j&&j.status){msg(T(`No se ha publicado: ${esc(j.status)}.`,`Not posted: ${esc(j.status)}.`),"warn");return}
  msg(T("No se ha podido publicar en el clúster de la plataforma ahora mismo. ","It could not be posted to the platform cluster right now. ")+manual(s),"warn")}
function dlg(){let d=$("spdlg");if(d)return d;d=document.createElement("dialog");d.id="spdlg";d.className="spdlg";d.setAttribute("aria-labelledby","spdlgt");
  d.innerHTML=`<form method="dialog" class="spdh"><h3 id="spdlgt">${ICON} ${T("Anunciar un spot","Post a spot")}</h3><button class="spx" value="x" aria-label="${T("Cerrar","Close")}">×</button></form>
    <p class="spsub">${T("Al clúster de la plataforma: lo ven todos los socios en unos segundos. Gratis y sin registro.","To the platform cluster: every member sees it within seconds. Free, no sign-up.")}</p>
    <div class="spfrm">
      <label><span>${T("Tu indicativo","Your call")}</span><input id="spde" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="15" value="${esc(get(KCALL))}"></label>
      <label><span>DX</span><input id="spdx" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="15"></label>
      <label><span>${T("Frecuencia (kHz)","Frequency (kHz)")}</span><input id="spf" inputmode="decimal" autocomplete="off" maxlength="10" placeholder="14025.0"></label>
      <label><span>${T("Comentario","Comment")}</span><input id="spi" autocomplete="off" maxlength="30" placeholder="CQ, 59, up 2…"></label>
      <label id="spkl"${get(KCLUB)?" hidden":""}><span>${T("Clave del club","Club key")}</span><input id="spk" type="password" autocomplete="off" maxlength="64" placeholder="${T("la que te dio el club","the one the club gave you")}"></label>
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
/* 2.11.26: también arriba, junto a «Actualizar», para tenerlo a mano desde cualquier pestaña */
function top(){const r=document.querySelector(".updrow");if(!r)return false;if($("sptop"))return true;
  const b=document.createElement("button");b.type="button";b.id="sptop";b.className="sptop";b.innerHTML=`<span class="ic">${ICON}</span><span class="tx">${T("Anunciar spot","Post spot")}</span>`;b.title=T("Anunciar en el clúster de la plataforma una estación que oyes","Post to the platform cluster a station you hear");b.onclick=()=>open();const u=document.getElementById("updbtn");if(u)u.after(b);else r.appendChild(b);return true}
/* 2.11.51: antes se dejaba de intentar a los 15 s; en un iPad con la carga lenta el buscador de DX aparece más tarde
   y se quedaba sin botón. Ahora se comprueba después de cada dibujado y cada segundo (es solo mirar si existe) */
const ens=()=>{try{btn();top()}catch(e){}};ens();setInterval(ens,1000);
window.ACRACB_afterDraw=window.ACRACB_afterDraw||[];window.ACRACB_afterDraw.push(ens);
})();
