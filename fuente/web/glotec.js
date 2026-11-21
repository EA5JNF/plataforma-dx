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
async function get(u,max){const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),30000);try{const r=await fetch(u,{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);const t=await r.text();if(t.length>max)throw new Error("size");return JSON.parse(t)}finally{clearTimeout(tm)}}
async function load(){if(busy)return;busy=true;err="";render();try{
  const idx=await get(BASE+"/products/glotec/geojson_2d_urt.json",3e6);if(!Array.isArray(idx)||!idx.length)throw new Error("vacío");
  const last=idx.filter(x=>x&&x.url&&x.time_tag).sort((a,b)=>Date.parse(b.time_tag)-Date.parse(a.time_tag))[0];if(!last||!/^\/products\/glotec\//.test(last.url))throw new Error("url");
  const gj=await get(BASE+last.url,8e6);const P=me();let best=null,bd=1e9;
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
    <div class="chip lv-${lv[0]}"><div class="k">${T("Frente a los últimos 30 días","Compared with the last 30 days")}</div><div class="v">${rel>=0?"+":""}${nf(rel,0)} %</div><div class="t">${lv[1]}</div></div></div>
   <p class="note">${T(`Punto de la rejilla más cercano: ${nf(Math.abs(G.pt[1]),2)}° ${G.pt[1]>=0?"N":"S"}, ${nf(Math.abs(G.pt[0]),1)}° ${G.pt[0]>=0?"E":"O"}. Datos de hace ${age} min. La foF2 se calcula con la densidad del pico de la capa F2 que da GloTEC; la MUF es una estimación a partir de la foF2 y la altura de la capa (${Math.round(G.hm)} km). Fuente: GloTEC, NOAA SWPC.`,`Nearest grid point: ${nf(Math.abs(G.pt[1]),2)}° ${G.pt[1]>=0?"N":"S"}, ${nf(Math.abs(G.pt[0]),1)}° ${G.pt[0]>=0?"E":"W"}. Data from ${age} min ago. foF2 is computed from the F2 peak density given by GloTEC; the MUF is an estimate from foF2 and the layer height (${Math.round(G.hm)} km). Source: GloTEC, NOAA SWPC.`)}</p>`}
function place(){const q=document.getElementById("f_qth");if(!q||document.getElementById("f_glotec"))return;
  const d=document.createElement("details");d.className="card fold";d.id="f_glotec";
  d.innerHTML=`<summary><h2>${T("Ionosfera medida sobre tu QTH","Ionosphere measured over your QTH")}</h2><span class="fsum">GloTEC · NOAA SWPC</span></summary><div id="glotecb"></div>`;
  const body=q.querySelector(":scope>summary");(body?body.parentNode:q).appendChild(d);
  d.addEventListener("toggle",()=>{if(d.open){if(!G||Date.now()-G.at>15*6e4)load();else render()}});render()}
function boot(){if(!document.getElementById("f_qth"))return setTimeout(boot,500);place()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
