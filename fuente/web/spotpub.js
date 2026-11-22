/* ---- ACRACB 2.11.23 / 2.11.25: anunciar un spot ----
   Va a DX Summit (dxsummit.fi), que lo reparte por la red mundial de clústeres. Gratis y sin registro: basta tu indicativo.
   2.11.25: ventana propia (botón «Anunciar spot» junto al buscador y en cada estación, ya rellena); el envío prueba primero
   la API pública de DX Summit y, si el navegador no deja leer la respuesta, la envía como formulario; después se comprueba
   en los clústeres (vía Spothole) que el spot ha salido de verdad. Nada se envía sin que lo confirmes. */
(function(){
"use strict";
const T=(a,b)=>window.ACRACB_LANG==="en"?b:a,$=id=>document.getElementById(id);
const RELAY="https://acracb-dx.ea5jnf.workers.dev/spot",API="https://new.dxsummit.fi/api/v1/spots",WEB="https://www.dxsummit.fi/",CHK="https://spothole.app/api/v1/spots?max_age=900";
const KCALL="acracb_mycall",KLAST="acracb_spotlast";
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
const manual=s=>T(`<a href="${WEB}" target="_blank" rel="noopener noreferrer" data-ext>Abre DX Summit</a> y escribe en «Share a Spot»: tu indicativo <b>${esc(s.de)}</b>, DX <b>${esc(s.dx)}</b>, <b>${s.f.toFixed(1)}</b> kHz${s.info?`, «${esc(s.info)}»`:""}.`,`<a href="${WEB}" target="_blank" rel="noopener noreferrer" data-ext>Open DX Summit</a> and type in “Share a Spot”: your call <b>${esc(s.de)}</b>, DX <b>${esc(s.dx)}</b>, <b>${s.f.toFixed(1)}</b> kHz${s.info?`, “${esc(s.info)}”`:""}.`);
/* ¿ha salido? se busca en los clústeres (Spothole) un spot de ese DX anunciado por ti, cerca de esa frecuencia */
async function seen(s){try{const r=await fetch(CHK,{cache:"no-store",credentials:"omit"});let j=await r.json();if(!Array.isArray(j))j=j.spots||j.data||[];
  return j.some(x=>{const dx=base(x.dx_call||x.dx||x.callsign),de=base(x.de_call||x.spotter||x.de);let f=+(x.freq||x.frequency||0);if(f>=1e5)f=f/1000;else if(f>0&&f<1000)f=f*1000;return dx===base(s.dx)&&de===base(s.de)&&(!f||Math.abs(f-s.f)<3)})}catch(_){return null}}
function confirmLater(s,how){const t0=Date.now();let n=0;
  const tick=async()=>{n++;const r=await seen(s);
    if(r===true){msg(T(`Hecho: <b>${esc(s.dx)}</b> en ${s.f.toFixed(1)} kHz ya está en los clústeres.`,`Done: <b>${esc(s.dx)}</b> on ${s.f.toFixed(1)} kHz is now on the clusters.`),"ok");return}
    if(Date.now()-t0<180000){msg(T(`Enviado${how}. Comprobando que aparece en los clústeres… (${n})`,`Sent${how}. Checking it shows on the clusters… (${n})`));setTimeout(tick,30000);return}
    msg(T("No aparece en los clústeres después de 3 minutos, así que puede que DX Summit no lo haya aceptado. ","It does not show on the clusters after 3 minutes, so DX Summit may not have accepted it. ")+manual(s),"warn")};
  setTimeout(tick,20000)}
async function send(s){const b=$("spgo");b.disabled=true;msg(T("Enviando…","Sending…"));
  put(KCALL,s.de);const body={de_call:s.de,dx_call:s.dx,frequency:s.f.toFixed(1),info:s.info};let st="";
  /* 2.11.26: primero, el intermediario del club (Cloudflare), que lo entrega a DX Summit sin que el navegador lo bloquee */
  try{const r=await fetch(RELAY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});
    if(r.status!==404&&r.status!==405){let j=null;try{j=await r.json()}catch(_){}if(j&&j.status!=null){st=j.status==="ok"?"ok":String(j.status);if(Array.isArray(j.via)&&j.via.length)s.via=j.via.join(T(" y "," and "))}}}catch(_){}
  if(!st)try{const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});
    let j=null;try{j=await r.json()}catch(_){}st=r.ok&&(!j||j.status==null||j.status==="ok")?"ok":(j&&j.status?String(j.status):"HTTP "+r.status)}
  catch(e){st="cors"}
  if(st==="cors"){/* el navegador no deja leer la respuesta de DX Summit: se envía como formulario, que no necesita permiso, y se comprueba después */
    try{await fetch(API,{method:"POST",mode:"no-cors",body:new URLSearchParams(body),cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});st="blind"}catch(_){st="net"}}
  b.disabled=false;
  if(st==="ok"||st==="blind"){put(KLAST,JSON.stringify({dx:s.dx,f:s.f,at:Date.now()}));$("spconf").hidden=true;
    msg(T(`Enviado${s.via?" por "+esc(s.via):""}: <b>${esc(s.dx)}</b> en ${s.f.toFixed(1)} kHz. Comprobando que aparece en los clústeres…`,`Sent${s.via?" via "+esc(s.via):""}: <b>${esc(s.dx)}</b> on ${s.f.toFixed(1)} kHz. Checking it shows on the clusters…`),st==="ok"?"ok":"");
    confirmLater(s,st==="blind"?T(" como formulario"," as a form"):s.via?T(" por "," via ")+esc(s.via):"");return}
  if(st==="net"){msg(T("No hay conexión con DX Summit. ","No connection to DX Summit. ")+manual(s),"warn");return}
  msg(T(`DX Summit no lo ha aceptado (${esc(st)}). `,`DX Summit did not accept it (${esc(st)}). `)+manual(s),"warn")}
function dlg(){let d=$("spdlg");if(d)return d;d=document.createElement("dialog");d.id="spdlg";d.className="spdlg";d.setAttribute("aria-labelledby","spdlgt");
  d.innerHTML=`<form method="dialog" class="spdh"><h3 id="spdlgt">${ICON} ${T("Anunciar un spot","Post a spot")}</h3><button class="spx" value="x" aria-label="${T("Cerrar","Close")}">×</button></form>
    <p class="spsub">${T("A la red mundial de clústeres, por DX Summit y por el nodo SpottedHam a la vez. Gratis y sin registro.","To the worldwide cluster network, through DX Summit and the SpottedHam node at once. Free, no sign-up.")}</p>
    <div class="spfrm">
      <label><span>${T("Tu indicativo","Your call")}</span><input id="spde" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="15" value="${esc(get(KCALL))}"></label>
      <label><span>DX</span><input id="spdx" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="15"></label>
      <label><span>${T("Frecuencia (kHz)","Frequency (kHz)")}</span><input id="spf" inputmode="decimal" autocomplete="off" maxlength="10" placeholder="14025.0"></label>
      <label><span>${T("Comentario","Comment")}</span><input id="spi" autocomplete="off" maxlength="30" placeholder="CQ, 59, up 2…"></label>
    </div>
    <div id="spconf" class="spconf" hidden></div>
    <div class="spbtn"><button type="button" class="btn primary" id="sprev">${T("Revisar","Review")}</button></div>
    <p id="spmsg" class="spmsg" hidden aria-live="polite"></p>
    <p class="note">${T("El spot es público y lleva tu indicativo: anuncia solo estaciones que hayas oído tú.","The spot is public and carries your callsign: only spot stations you have heard yourself.")}</p>`;
  document.body.appendChild(d);
  d.querySelector(".spfrm").addEventListener("input",()=>{$("spconf").hidden=true;$("sprev").hidden=false});
  d.addEventListener("click",e=>{if(e.target===d)d.close()});
  $("sprev").addEventListener("click",()=>{const c=check();const cf=$("spconf");if(c.err){cf.hidden=true;msg(c.err,"warn");$(c.el).focus();return}msg("");
    cf.innerHTML=`<p>${T("Se publicará así:","It will be posted as:")}</p><p class="spline">DX de ${esc(c.de)}: <b>${c.f.toFixed(1)}</b> <b>${esc(c.dx)}</b> ${esc(c.info)}</p><div class="spbtn"><button type="button" class="btn primary" id="spgo">${T("Publicar","Post")}</button><button type="button" class="btn" id="spno">${T("Corregir","Edit")}</button></div>`;
    cf.hidden=false;$("sprev").hidden=true;$("spgo").onclick=()=>send(c);$("spno").onclick=()=>{cf.hidden=true;$("sprev").hidden=false;$("spdx").focus()};$("spgo").focus()});
  return d}
function open(call,f){const d=dlg();$("spconf").hidden=true;$("sprev").hidden=false;msg("");if(call!=null){$("spdx").value=String(call||"").toUpperCase();const k=khz(f);$("spf").value=k?k.toFixed(1):""}
  try{d.showModal()}catch(_){d.setAttribute("open","")}($("spde").value?(call?$("spi"):$("spdx")):$("spde")).focus()}
window.ACRACB_spotFill=open;
/* botón visible junto al buscador de la pestaña DX */
function btn(){const r=document.querySelector("#srch .srrow");if(!r)return false;if($("spopen"))return true;
  const b=document.createElement("button");b.type="button";b.id="spopen";b.className="btn spopen";b.innerHTML=`${ICON}<span>${T("Anunciar spot","Post spot")}</span>`;b.setAttribute("aria-label",T("Anunciar un spot","Post a spot"));b.title=T("Anunciar un spot en los clústeres","Post a spot to the clusters");b.onclick=()=>open();r.appendChild(b);return true}
/* el botón de cada estación (tarjeta o fila) abre la ventana ya rellena */
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-spot]");if(!b)return;e.preventDefault();e.stopPropagation();const fh=b.dataset.spf||((b.closest("[data-f]")||{}).dataset||{}).f||"";open(b.dataset.spot,fh)},true);
/* 2.11.26: también arriba, junto a «Actualizar», para tenerlo a mano desde cualquier pestaña */
function top(){const r=document.querySelector(".updrow");if(!r)return false;if($("sptop"))return true;
  const b=document.createElement("button");b.type="button";b.id="sptop";b.className="sptop";b.innerHTML=`<span class="ic">${ICON}</span><span class="tx">${T("Anunciar spot","Post spot")}</span>`;b.title=T("Anunciar en los clústeres una estación que oyes","Post to the clusters a station you hear");b.onclick=()=>open();const u=document.getElementById("updbtn");if(u)u.after(b);else r.appendChild(b);return true}
let n=0;(function go(){const a=btn(),b=top();if(a&&b)return;if(++n<60)setTimeout(go,250)})();
})();
