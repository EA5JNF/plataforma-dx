/* ---- ACRACB 2.10.44: más meteorología espacial, solo de fuentes públicas sin dudas de uso ----
   En Sol › Sol ahora: los avisos oficiales de NOAA de las últimas 24 h (traducidos), las regiones
   activas del Sol con la más compleja y su probabilidad de llamarada (NOAA), y tres imágenes del Sol en este momento:
   la corona en ultravioleta y las manchas (NASA SDO, uso libre sin fines comerciales con crédito) y el coronógrafo
   LASCO C3 de SOHO (ESA/NASA, mismo uso), donde se ven salir las eyecciones de masa coronal. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const KIND={ALERT:["Alerta","Alert"],WARNING:["Aviso","Warning"],WATCH:["Vigilancia","Watch"],SUMMARY:["Resumen","Summary"],"EXTENDED WARNING":["Aviso prolongado","Extended warning"]};
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
const when=t=>{const d=new Date(t);if(isNaN(d))return "";return d.toLocaleDateString(EN()?"en-US":"es-ES",{day:"numeric",month:"short",timeZone:"UTC"})+" "+d.toISOString().slice(11,16)+" UTC"};
function alertsHTML(){const A=(typeof L!=="undefined"&&L.swAlerts)||null;if(!A)return "";
  if(!A.length)return `<h3>${T("Avisos oficiales de NOAA","Official NOAA alerts")}</h3><p class="note">${T("Ningún aviso, alerta ni vigilancia en las últimas 24 horas.","No alerts, warnings or watches in the last 24 hours.")}</p>`;
  return `<h3>${T("Avisos oficiales de NOAA (24 h)","Official NOAA alerts (24 h)")}</h3><ul class="swal">${A.slice(0,8).map(a=>{const k=KIND[a.k]||[a.k,a.k];
    return `<li class="lvc-${sev(a)}"><b>${e2(k[EN()?1:0])}</b> · ${e2(tr(a))}${a.g?` <span class="tag">${e2(a.g)}</span>`:""}<small>${e2(when(a.t))}</small></li>`}).join("")}</ul>`}
function regionsHTML(){const R=(typeof L!=="undefined"&&L.regions)||null;if(!R)return "";if(!R.n)return `<p class="note">${T("Sin regiones activas numeradas en el Sol.","No numbered active regions on the Sun.")}</p>`;
  const t=R.top||{},cx=/D/.test(String(t.mag||"").toUpperCase().replace(/^B/,""))?T("muy compleja: puede dar llamaradas fuertes","very complex: may produce strong flares"):/G/i.test(t.mag||"")?T("compleja","complex"):T("sencilla","simple");
  return `<p class="swrg">${T(`<b>${R.n}</b> ${R.n===1?"región activa":"regiones activas"} en el Sol`,`<b>${R.n}</b> active ${R.n===1?"region":"regions"} on the Sun`)}${R.spots?T(`, ${R.spots} manchas`,`, ${R.spots} spots`):""}.${t.ar?` ${T("La más compleja","The most complex")}: <b>AR ${e2(t.ar)}</b>${t.loc?` (${e2(t.loc)})`:""}, ${T("clase magnética","magnetic class")} ${e2(t.mag||"—")}, ${cx}${t.m!=null?` · ${T("llamarada M","M flare")} ${e2(t.m)} %`:""}${t.x!=null?` · X ${e2(t.x)} %`:""}.`:""} <small>NOAA SWPC, ${e2(R.day||"")}</small></p>`}
function imgsHTML(){const h=new Date().toISOString().slice(0,13).replace(/\D/g,"");
  const I=[["https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg",T("Corona UV","Corona UV"),T("Las zonas brillantes son las regiones activas; las oscuras, agujeros coronales que mandan viento solar rápido.","Bright areas are active regions; dark ones are coronal holes that send fast solar wind."),"SDO/AIA 193 Å"],
    ["https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMIIC.jpg",T("Manchas","Sunspots"),T("Las manchas que cuenta el SSN.","The spots counted by the SSN."),"SDO/HMI"],
    ["https://soho.nascom.nasa.gov/data/realtime/c3/512/latest.jpg",T("Coronógrafo","Coronagraph"),T("Un halo alrededor del disco tapado es una eyección de masa coronal que viene hacia la Tierra.","A halo around the blocked disc is a coronal mass ejection heading for Earth."),"SOHO/LASCO C3"]];
  return `<h3>${T("Últimas imágenes del Sol","Latest images of the Sun")}</h3><div class="swim">${I.map(([u,t,d,c])=>`<figure><a href="${u}" target="_blank" rel="noopener noreferrer" data-ext><img src="${u}?h=${h}" alt="${e2(t)}" title="${e2(d)}" loading="lazy" decoding="async" width="512" height="512" referrerpolicy="no-referrer"></a><figcaption><b>${e2(t)}</b> <span class="swd">${e2(d)}</span> <small>${e2(c)}</small></figcaption></figure>`).join("")}</div>
   <p class="note">${T("Imágenes de NASA SDO (cortesía de NASA/SDO y de los equipos científicos de AIA y HMI) y de SOHO (cortesía del consorcio SOHO/LASCO; SOHO es un proyecto de cooperación internacional entre la ESA y la NASA). Cada imagen lleva impresa su hora (UTC): las de SDO se renuevan cada pocos minutos y la del coronógrafo suele ir varias horas por detrás.","Images from NASA SDO (courtesy of NASA/SDO and the AIA and HMI science teams) and SOHO (courtesy of the SOHO/LASCO consortium; SOHO is a project of international cooperation between ESA and NASA). Each image shows its time (UTC): SDO images are renewed every few minutes and the coronagraph one usually lags several hours.")}</p>`}
function add(){const el=document.getElementById("sunnow");if(!el)return;
  const h=`<h2>${T("El Sol ahora: avisos e imágenes","The Sun now: alerts and images")}</h2>`+alertsHTML()+regionsHTML()+imgsHTML();if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}
  const sm=document.getElementById("s_sunnow");if(sm){const A=(typeof L!=="undefined"&&L.swAlerts)||null,R=(typeof L!=="undefined"&&L.regions)||null;
    const t=[A?(A.length?T(`${A.length} ${A.length===1?"aviso":"avisos"} de NOAA en 24 h`,`${A.length} NOAA ${A.length===1?"alert":"alerts"} in 24 h`):T("Sin avisos de NOAA","No NOAA alerts")):"",R&&R.n?T(`${R.n} regiones activas`,`${R.n} active regions`):""].filter(Boolean).join(" · ")||T("Imágenes de SDO y SOHO","SDO and SOHO images");
    if(sm.textContent!==t)sm.textContent=t}}
window.ACRACB_swx=add;
function hook(){if(window.__hkSwx)return true;if(typeof window.renderSolar!=="function")return false;window.__hkSwx=1;const o=window.renderSolar;
  window.renderSolar=function(){const r=o.apply(this,arguments);try{add()}catch(e){console.error(e)}return r};try{add()}catch(e){}return true}
if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},200);setTimeout(()=>clearInterval(t),15000)}
})();
