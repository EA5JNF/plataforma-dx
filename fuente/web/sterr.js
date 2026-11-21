/* ---- ACRACB 2.10.11: «Estado solar-terrestre» con nuestras fuentes y nuestro modelo ----
   Un panel de un vistazo en el Resumen y en Sol: Sol y geomagnetismo (NOAA, SILSO, GFZ), VHF (panel de aperturas
   especiales) y HF de día y de noche para tu estación (modelo de la plataforma). Se calcula solo al abrirlo. */
(function(){
"use strict";
if(window.__hkSterr)return;window.__hkSterr=1;
const EN=()=>window.ACRACB_LANG==="en",T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nf=(v,d)=>v==null||!isFinite(v)?"—":(+v).toFixed(d).replace(".",EN()?".":",");
const OPEN={};
function geoTxt(kp){return kp==null?["n","—"]:kp<2?["g",T("muy tranquilo","very quiet")]:kp<3?["g",T("tranquilo","quiet")]:kp<4?["y",T("inestable","unsettled")]:kp<5?["y",T("activo","active")]:kp<6?["r",T("tormenta menor","minor storm")]:["r",T("tormenta fuerte","strong storm")]}
function noiseTxt(kp){/* ruido de origen geomagnético orientativo, en unidades S */return kp==null?"—":kp<2?"S0–S1":kp<3?"S1–S2":kp<4?"S2–S3":kp<5?"S3–S4":kp<6?"S4–S6":"S6–S9"}
function hf(){const out=[];try{const pairs=[["80 m","40 m"],["30 m","20 m"],["17 m","15 m"],["12 m","10 m"]];const idx=n=>BANDS.findIndex(x=>String(x).replace(/\s/g,"")===n.replace(/\s/g,""));const TGs=TG();
  const off=-new Date().getTimezoneOffset()/60;const lhAt=h=>((h+24)%24);/* horas locales: mediodía y medianoche */
  const q=(b,lh)=>{let n=0;for(const t of TGs)if(prob(t,lh,b).p>=.3)n++;return n/TGs.length};
  for(const [a,b] of pairs){const ia=idx(a),ib=idx(b);if(ia<0||ib<0)continue;const d=Math.max(q(ia,lhAt(13)),q(ib,lhAt(13))),n=Math.max(q(ia,lhAt(1)),q(ib,lhAt(1)));
    const lv=f=>f>=.25?["g",T("buena","good")]:f>=.08?["y",T("regular","fair")]:["r",T("mala","poor")];out.push([a.replace(" m","")+"–"+b,lv(d),lv(n)])}}catch(e){}return out}
function vhf(){try{const s=window.ACRACB_vuhf&&ACRACB_vuhf.state();if(!s)return [];const LV=(l,c)=>l==="g"?["g",T("favorable","favorable")]:l==="y"?["y",T("posible","possible")]:l==="r"?["r",c?T("cerrada","closed"):T("no ahora","not now")]:["n","—"];
  return [[T("Aurora","Aurora"),LV(s.au.l)],[T("Esporádica E (6 m)","Sporadic E (6 m)"),LV(s.es.cl.some(([b,c])=>b==="6"&&c.you)?"g":s.es.cl.some(([b])=>b==="6")?"y":"r",1)],[T("Esporádica E (2 m)","Sporadic E (2 m)"),LV(s.es.cl.some(([b,c])=>b==="2"&&c.you)?"g":s.es.cl.some(([b])=>b==="2")?"y":"r",1)],[T("Tropo","Tropo"),LV(s.tro.l)],[T("Meteoros","Meteors"),LV(s.ms.l)],[T("Rebote lunar","Moonbounce"),LV(s.eme.l)]]}catch(e){return []}}
function html(){if(typeof L==="undefined"||!L)return "";const sp=L.space||{};const kp=L.kp!=null?+L.kp:null;const g=geoTxt(kp);
  const row=(k,v,c)=>`<div class="str"><span>${k}</span><b class="${c?"st-"+c:""}">${v}</b></div>`;
  const sfiC=L.sfi>=150?"g":L.sfi>=100?"y":"r",kpC=kp==null?"":kp<3?"g":kp<5?"y":"r",bzC=L.bz==null?"":L.bz<=-10?"r":L.bz<=-5?"y":"g",wC=L.wind>=600?"r":L.wind>=500?"y":"g";
  const xr=String(sp.xray||"—"),xC=/^X/.test(xr)?"r":/^M/.test(xr)?"y":"g";
  const sun=[row(T("Flujo solar (SFI)","Solar flux (SFI)"),nf(L.sfi,0),sfiC),row(T("Manchas (SN)","Sunspots (SN)"),nf(sp.ssn,0)),row("A",nf(sp.a,0),sp.a>=30?"r":sp.a>=16?"y":"g"),row("Kp",nf(kp,1),kpC),
    row(T("Rayos X","X-rays"),e2(xr),xC),row(T("Viento solar","Solar wind"),L.wind!=null?nf(L.wind,0)+" km/s":"—",wC),row("Bz",L.bz!=null?nf(L.bz,1)+" nT":"—",bzC),
    row(T("Protones","Protons"),e2(window.ACRACB_tx&&sp.proton?ACRACB_tx(sp.proton):sp.proton||"—"),/S[1-9]/.test(sp.proton||"")?"r":"g"),
    row(T("Aurora","Aurora"),e2(window.ACRACB_tx&&sp.aurora?ACRACB_tx(sp.aurora):sp.aurora||"—")),row(T("Llamaradas (24 h)","Flares (24 h)"),e2(L.flare||"—")),
    row(T("Campo geomagnético","Geomagnetic field"),g[1],g[0]),row(T("Ruido geomagnético","Geomagnetic noise"),noiseTxt(kp))].join("");
  const V=vhf().map(([k,[c,t]])=>row(k,t,c)).join("");
  const H=hf();const hfT=H.length?`<div class="sthf"><div class="sthh"><span>${T("Bandas","Bands")}</span><span>${T("Día","Day")}</span><span>${T("Noche","Night")}</span></div>${H.map(([b,d,n])=>`<div class="sthr"><span>${b}</span><b class="st-${d[0]}">${d[1]}</b><b class="st-${n[0]}">${n[1]}</b></div>`).join("")}</div>`:"";
  return `<div class="stgrid"><section><h4>${T("Sol y geomagnetismo","Sun and geomagnetism")}</h4>${sun}</section><section><h4>VHF</h4>${V}</section><section><h4>${T("HF para tu estación","HF for your station")}</h4>${hfT}</section></div>
   <p class="note">${T("Fuentes: NOAA SWPC, SILSO y GFZ Potsdam; VHF, del panel de aperturas especiales; HF, del modelo de la plataforma con tu antena y potencia (día a las 13 h y noche a la 1 h, hora local). El ruido geomagnético es orientativo, según el Kp.","Sources: NOAA SWPC, SILSO and GFZ Potsdam; VHF from the special openings panel; HF from the platform model with your antenna and power (day at 13:00 and night at 01:00, local time). Geomagnetic noise is a guide based on Kp.")} ${T("Actualizado","Updated")}: ${e2(L.updated||"")}.</p>`}
function mk(id){const d=document.createElement("details");d.className="sterr";d.id=id;d.innerHTML=`<summary>${T("Estado solar-terrestre","Solar-terrestrial status")}</summary><div class="stb"></div>`;
  if(OPEN[id])d.open=true;d.addEventListener("toggle",()=>{OPEN[id]=d.open;if(d.open)fill(d)});return d}
function fill(d){const b=d.querySelector(".stb");if(b)b.innerHTML=html()}
function place(){const g=document.querySelector("#easy .ezg");if(g){let d=document.getElementById("st_ez");if(!d)d=mk("st_ez");if(d.parentNode!==g.parentNode||d.previousElementSibling!==g)g.insertAdjacentElement("afterend",d);if(d.open)fill(d)}
  const sp=document.getElementById("space");if(sp){let d=document.getElementById("st_sol");if(!d)d=mk("st_sol");if(d.parentNode!==sp.parentNode||d.nextElementSibling!==sp)sp.insertAdjacentElement("beforebegin",d);if(d.open)fill(d)}}
window.ACRACB_afterDraw=window.ACRACB_afterDraw||[];window.ACRACB_afterDraw.push(()=>{try{place()}catch(e){}});
function boot(){if(!document.getElementById("easy"))return setTimeout(boot,500);place();try{new MutationObserver(()=>{if(!document.getElementById("st_ez")||!document.getElementById("st_sol"))place()}).observe(document.body,{childList:true,subtree:true})}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
