/* ---- ACRACB 2.11.23: publicar un spot ----
   Envía el spot a DX Summit (dxsummit.fi), que lo reparte por la red mundial de clústeres. Es gratis y no pide registro:
   basta con tu indicativo. Se usa su API pública (POST /api/v1/spots con de_call, dx_call, frequency en kHz e info).
   Nada sale sin que lo confirmes. Si el navegador no deja enviarlo desde aquí, se abre DX Summit con los datos a mano. */
(function(){
"use strict";
const T=(a,b)=>window.ACRACB_LANG==="en"?b:a,$=id=>document.getElementById(id);
const API="https://new.dxsummit.fi/api/v1/spots",WEB="https://www.dxsummit.fi/";
const KCALL="acracb_mycall",KLAST="acracb_spotlast";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const CALL=/^(?=.{3,15}$)([A-Z0-9]{1,4}\/)?[A-Z0-9]{1,3}[0-9][A-Z0-9]{0,4}[A-Z](\/[A-Z0-9]{1,4})?$/;
const get=k=>{try{return localStorage.getItem(k)||""}catch(_){return ""}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
/* frecuencia en kHz; admite MHz (14.025) o kHz (14025), con coma o punto */
function khz(v){v=String(v||"").trim().replace(",",".");const n=parseFloat(v);if(!isFinite(n)||n<=0)return null;const k=n<1000?n*1000:n;return k>=1800&&k<=450000?Math.round(k*10)/10:null}
function check(){const de=$("spde").value.trim().toUpperCase(),dx=$("spdx").value.trim().toUpperCase(),f=khz($("spf").value),info=$("spi").value.trim();
  if(!CALL.test(de))return {err:T("Revisa tu indicativo.","Check your callsign.")};
  if(!CALL.test(dx))return {err:T("Revisa el indicativo del DX.","Check the DX callsign.")};
  if(dx===de)return {err:T("No se puede anunciar uno mismo.","You cannot spot yourself.")};
  if(f==null)return {err:T("Revisa la frecuencia (por ejemplo 14025 o 14.025).","Check the frequency (for example 14025 or 14.025).")};
  /* el mismo spot dos veces en 10 minutos solo molesta en la red */
  try{const L=JSON.parse(get(KLAST)||"null");if(L&&L.dx===dx&&Math.abs(L.f-f)<1&&Date.now()-L.at<6e5)return {err:T("Ya publicaste este spot hace menos de 10 minutos.","You posted this spot less than 10 minutes ago.")}}catch(_){}
  return {de,dx,f,info:info.slice(0,30)}}
function msg(h,c){const m=$("spmsg");m.className="spmsg"+(c?" "+c:"");m.innerHTML=h;m.hidden=!h}
async function send(s){const b=$("spgo");b.disabled=true;msg(T("Enviando…","Sending…"));
  let ok=false,why="";
  try{const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({de_call:s.de,dx_call:s.dx,frequency:s.f.toFixed(1),info:s.info}),cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});
    let j=null;try{j=await r.json()}catch(_){}ok=r.ok&&(!j||j.status==null||j.status==="ok");if(!ok)why=j&&j.status?String(j.status):"HTTP "+r.status}
  catch(e){why="net"}
  b.disabled=false;
  if(ok){put(KLAST,JSON.stringify({dx:s.dx,f:s.f,at:Date.now()}));$("spconf").hidden=true;$("spdx").value="";$("spf").value="";$("spi").value="";
    msg(T(`Publicado: <b>${esc(s.dx)}</b> en ${s.f.toFixed(1)} kHz. Aparecerá en los clústeres en unos segundos.`,`Posted: <b>${esc(s.dx)}</b> on ${s.f.toFixed(1)} kHz. It will show on the clusters in a few seconds.`),"ok");return}
  if(why==="net"){msg(T(`Tu navegador no ha dejado enviarlo desde aquí. <a href="${WEB}" target="_blank" rel="noopener noreferrer" data-ext>Abre DX Summit</a> y escribe en «Share a Spot»: tu indicativo ${esc(s.de)}, DX ${esc(s.dx)}, ${s.f.toFixed(1)} kHz${s.info?`, «${esc(s.info)}»`:""}.`,`Your browser did not allow sending it from here. <a href="${WEB}" target="_blank" rel="noopener noreferrer" data-ext>Open DX Summit</a> and type in "Share a Spot": your call ${esc(s.de)}, DX ${esc(s.dx)}, ${s.f.toFixed(1)} kHz${s.info?`, "${esc(s.info)}"`:""}.`),"warn");return}
  msg(T(`DX Summit no lo ha aceptado (${esc(why)}). Revisa los datos.`,`DX Summit did not accept it (${esc(why)}). Check the details.`),"warn")}
function init(){const sec=document.querySelector('section[data-pg="dx"]');if(!sec||$("spub"))return !!sec;
  const d=document.createElement("details");d.id="spub";d.className="card spub";
  d.innerHTML=`<summary>${T("Publicar un spot","Post a spot")} <span class="spubh">${T("en la red mundial de clústeres, vía DX Summit","to the worldwide cluster network, via DX Summit")}</span></summary>
    <div class="spfrm">
      <label><span>${T("Tu indicativo","Your call")}</span><input id="spde" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="15" value="${esc(get(KCALL))}"></label>
      <label><span>DX</span><input id="spdx" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="15"></label>
      <label><span>${T("Frecuencia (kHz)","Frequency (kHz)")}</span><input id="spf" inputmode="decimal" autocomplete="off" maxlength="10" placeholder="14025.0"></label>
      <label class="spil"><span>${T("Comentario","Comment")}</span><input id="spi" autocomplete="off" maxlength="30" placeholder="${T("CQ, 599, up 2…","CQ, 599, up 2…")}"></label>
      <button type="button" class="btn" id="sprev">${T("Revisar","Review")}</button>
    </div>
    <div id="spconf" class="spconf" hidden></div>
    <p id="spmsg" class="spmsg" hidden aria-live="polite"></p>
    <p class="note">${T("El spot es público y lleva tu indicativo: anuncia solo estaciones que hayas oído tú. No hace falta registrarse. Servicio gratuito de DX Summit (dxsummit.fi).","The spot is public and carries your callsign: only spot stations you have heard yourself. No sign-up needed. Free service from DX Summit (dxsummit.fi).")}</p>`;
  const s=$("srch");if(s)s.after(d);else{const pt=sec.querySelector(":scope>.ptabs");if(pt)pt.after(d);else sec.prepend(d)}
  /* si cambias algo después de revisar, hay que volver a revisar */
  d.querySelector(".spfrm").addEventListener("input",()=>{$("spconf").hidden=true});
  $("sprev").addEventListener("click",()=>{const c=check();const cf=$("spconf");if(c.err){cf.hidden=true;msg(c.err,"warn");return}msg("");put(KCALL,c.de);
    cf.innerHTML=`<p>${T("Se publicará así:","It will be posted as:")} <b>DX de ${esc(c.de)}: ${c.f.toFixed(1)} ${esc(c.dx)}</b>${c.info?` <i>${esc(c.info)}</i>`:""}</p><div class="spbtn"><button type="button" class="btn primary" id="spgo">${T("Publicar","Post")}</button><button type="button" class="btn" id="spno">${T("Cancelar","Cancel")}</button></div>`;
    cf.hidden=false;$("spgo").onclick=()=>send(c);$("spno").onclick=()=>{cf.hidden=true};$("spgo").focus()});
  return true}
/* las tarjetas de estación pueden rellenar el formulario (indicativo y frecuencia) */
window.ACRACB_spotFill=(call,f)=>{if(!init())return;const d=$("spub");d.open=true;$("spdx").value=String(call||"").toUpperCase();const k=khz(f);$("spf").value=k?k.toFixed(1):"";$("spconf").hidden=true;msg("");d.scrollIntoView({block:"nearest"});($("spde").value?$("spi"):$("spde")).focus()};
let n=0;(function go(){if(init())return;if(++n<40)setTimeout(go,250)})();
})();
