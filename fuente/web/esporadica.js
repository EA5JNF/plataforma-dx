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
function analyze(b,xml){const paths=new Map();let n=0;
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
    try{ST[b.k]=Object.assign(analyze(b,await fetchBand(b)),{ok:true})}catch(e){ST[b.k]={at:Date.now(),ok:false,clouds:(s&&s.clouds)||[],reports:0,paths:0}}}
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
window.ACRACB_es={poll,render,analyze,get state(){return ST}};
function boot(){if(typeof ART!=="undefined"&&ART){const v0=document.getElementById("vhfo");if(v0&&!document.getElementById("esbox")){const h=document.createElement("div");h.className="esw";h.innerHTML=`<h3 class="esh">${T("Esporádica E ahora","Sporadic E now")}</h3><div id="esbox"></div>`;v0.parentNode.insertBefore(h,v0)}render();return}
  const v=document.getElementById("vhfo");if(v&&!document.getElementById("esbox")){const h=document.createElement("div");h.className="esw";h.innerHTML=`<h3 class="esh">${T("Esporádica E ahora","Sporadic E now")}</h3><div id="esbox"></div>`;v.parentNode.insertBefore(h,v)}
  render();setTimeout(()=>poll(false),4000);setInterval(()=>poll(false),60000);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")poll(false)})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
