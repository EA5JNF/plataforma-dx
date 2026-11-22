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
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);note(T("Ajustes guardados en un fichero. Ábrelo con «Importar» en tu otro dispositivo.","Settings saved to a file. Open it with “Import” on your other device."))}
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
