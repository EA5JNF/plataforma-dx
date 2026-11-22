/* ---- ACRACB 2.10.22: concurso en marcha ----
   Con el calendario de concursos de la plataforma (CAL) se mira si ahora mismo hay uno en marcha, a la hora exacta de sus bases.
   - Arriba, en todas las secciones, un aviso: cuál es, hasta cuándo y su modo.
   - Si la plataforma tiene sus reglas (CONTESTS), se pone sola en modo concursos con ese concurso, como si fueras a participar:
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
/* ventana exacta: primera hora y su día, última hora y su día («12:00 sáb – 12:00 dom», «12:00–22:59 sáb y 05:00–11:59 dom»…) */
function win(c,sat){const tx=String(c[4]||"");const tk=[];const re=/(\d{1,2}):(\d{2})|\b(vie|sáb|dom)\b/g;let m;while((m=re.exec(tx)))tk.push(m[1]!=null?{t:+m[1]*60+ +m[2]}:{d:DOFF[m[3]]});
  const times=tk.map((x,i)=>[x,i]).filter(([x])=>x.t!=null);if(!times.length)return null;
  const dayAfter=i=>{for(let j=i+1;j<tk.length;j++)if(tk[j].d!=null)return tk[j].d;for(let j=i-1;j>=0;j--)if(tk[j].d!=null)return tk[j].d;return 0};
  const [f,fi]=times[0],[l,li]=times[times.length-1];const base=Date.UTC(sat.getUTCFullYear(),sat.getUTCMonth(),sat.getUTCDate());
  const st=new Date(base+dayAfter(fi)*864e5+f.t*6e4);let en=new Date(base+dayAfter(li)*864e5+l.t*6e4);if(l.t%60===59)en=new Date(+en+6e4);if(en<=st)en=new Date(+en+864e5);return {st,en}}
function list(){const out=[];if(typeof CAL==="undefined"||typeof calDate!=="function")return out;const now=new Date();
  for(const c of CAL){for(const y of [now.getUTCFullYear()-1,now.getUTCFullYear()]){const sat=calDate(y,c[2],c[3]);if(!sat)continue;const w=win(c,sat);if(!w)continue;
    if(now>=w.st&&now<w.en)out.push({c,st:w.st,en:w.en,key:c[0]+"|"+w.st.toISOString(),plan:c[6]&&typeof CONTESTS!=="undefined"&&CONTESTS[c[6]]?c[6]:null})}}
  return out.sort((a,b)=>(!!b.plan-!!a.plan)||(a.en-b.en))}
window.ACRACB_ctNow=list;
const XB=()=>`<button type="button" class="ctx" data-ctclose aria-label="${T("Cerrar aviso del concurso","Close contest notice")}" title="${T("Cerrar","Close")}">×</button>`;
const hm=d=>d.toLocaleTimeString(EN()?"en-US":"es-ES",{hour:"2-digit",minute:"2-digit",timeZone:"Europe/Madrid"});
const utc=d=>d.toISOString().slice(11,16);
function whenEnd(d){const now=new Date(),same=d.toDateString()===now.toDateString(),tom=new Date(+now+864e5).toDateString()===d.toDateString();
  const day=same?T("hoy","today"):tom?T("mañana","tomorrow"):d.toLocaleDateString(EN()?"en-US":"es-ES",{weekday:"long",timeZone:"Europe/Madrid"});
  return T(`termina ${day} a las ${hm(d)} (${utc(d)} UTC)`,`ends ${day} at ${hm(d)} (${utc(d)} UTC)`)}
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
  if(x.plan&&!inIt(x)&&LS.get("acracb_ctdecl")!==x.key&&LS.get("acracb_ctauto")!==x.key){join(x,false);return}
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
  const h=`<b>${T("En marcha ahora","Running now")}: ${e2(x.c[0])}</b> <span class="ctm">${e2(x.c[1])}</span> · ${whenEnd(x.en)}`+(K?`<p class="note">${e2(T(K.tip,K.tip))}</p><p class="note">${T("Multiplicadores","Multipliers")}: ${e2(K.mult)}.</p>`+(inIt(x)?"":`<button type="button" class="btn" data-ctjoin>${T("Participar","Take part")}</button>`):"")+XB();
  if(c.innerHTML!==h)c.innerHTML=h}
document.addEventListener("click",ev=>{const t=ev.target;if(!t.closest)return;const x=list()[0];if(!x)return;
  if(t.closest("[data-ctjoin]")){join(x,true);return}
  if(t.closest("[data-ctleave]")){leave(x);return}
  if(t.closest("[data-ctclose]")){LS.set("acracb_ctclose",x.key);draw();return}
  if(t.closest("[data-ctgo]")){try{go("concursos");selTab("concursos","c_live",true)}catch(e){}return}
  /* pasar a modo DX a mano durante el concurso cuenta como «no participo» */
  const mb=t.closest('.modes button[data-m="dx"]');if(mb&&x.plan){LS.set("acracb_ctdecl",x.key);LS.set("acracb_ctauto",null);setTimeout(draw,50)}
  const mc=t.closest('.modes button[data-m="contest"]');if(mc){LS.set("acracb_ctdecl",null);setTimeout(draw,50)}},true);
/* 2.10.37: se envía por el mismo camino que el resto (service worker): «new Notification» no funciona en el iPhone, el iPad
   ni Android, y la marca de «ya avisado» solo se guarda si la notificación ha salido de verdad */
/* 2.11.14: avisa de TODOS los concursos del calendario: una hora antes de empezar y al empezar (cada uno una vez),
   también si coinciden varios a la vez */
function upcoming(){const out=[];if(typeof CAL==="undefined"||typeof calDate!=="function")return out;const now=Date.now();
  for(const c of CAL){for(const y of [new Date().getUTCFullYear(),new Date().getUTCFullYear()+1]){const sat=calDate(y,c[2],c[3]);if(!sat)continue;const w=win(c,sat);if(!w)continue;
    const d=+w.st-now;if(d>0&&d<=36e5)out.push({c,st:w.st,en:w.en,key:"pre|"+c[0]+"|"+w.st.toISOString()})}}return out}
function sentSet(){try{return new Set(JSON.parse(LS.get("acracb_ctnotif2")||"[]"))}catch(e){return new Set()}}
function markSent(k){const s=[...sentSet(),k].slice(-80);LS.set("acracb_ctnotif2",JSON.stringify(s))}
const hhmm=d=>{try{return d.toLocaleTimeString(EN()?"en-US":"es-ES",{hour:"2-digit",minute:"2-digit"})}catch(e){return d.toISOString().slice(11,16)+" UTC"}};
function notif(){try{if(!(window.ACRACB_notifOn&&ACRACB_notifOn())||!window.ACRACB_notify)return;const S=sentSet();let q=Promise.resolve();
  for(const x of upcoming()){if(S.has(x.key))continue;q=q.then(()=>ACRACB_notify(T("Concurso dentro de una hora: ","Contest in one hour: ")+x.c[0],x.c[1]+" · "+T("empieza a las ","starts at ")+hhmm(x.st),"ctpre|"+x.c[0])).then(ok=>{if(ok)markSent(x.key)}).catch(()=>{})}
  for(const x of list()){if(S.has(x.key)||LS.get("acracb_ctnotif")===x.key)continue;
    q=q.then(()=>ACRACB_notify(T("Concurso en marcha: ","Contest running: ")+x.c[0],x.c[1]+" · "+whenEnd(x.en)+(x.plan?" · "+T("la plataforma ya está preparada para él","the platform is set up for it"):""),"ctnow|"+x.c[0])).then(ok=>{if(ok)markSent(x.key)}).catch(()=>{})}}catch(e){}}
function boot(){if(typeof CAL==="undefined"||typeof setMode!=="function"||!document.querySelector(".updrow"))return setTimeout(boot,400);
  try{draw();notif()}catch(e){console.error(e)}setInterval(()=>{if(!document.hidden)try{draw();notif()}catch(e){}},60000)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
