/* ---- ACRACB 2.10.4: VHF y UHF a fondo ----
   Panel de aperturas especiales (esporádica E, tropo, aurora, TEP, dispersión meteórica y rebote lunar) con su detalle,
   mapa de esporádica E, previsión de tropo calculada con el modelo meteorológico de Open-Meteo (gratuito y sin registro),
   ventanas de dispersión meteórica según el radiante de cada lluvia, rebote lunar con la posición de la Luna calculada en
   el navegador y avisos de aperturas especiales. Todo lo que es estimación se dice como estimación. */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";const T=(es,en)=>EN()?en:es;
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const R=Math.PI/180,DEG=180/Math.PI;
const me=()=>(typeof TXP!=="undefined"&&TXP)||[-0.67,38.63];
const nf=(v,d)=>(+v).toFixed(d==null?0:d).replace(".",EN()?".":",");
const fk2=v=>{try{return fk(Math.round(v))}catch(e){return String(Math.round(v))}};
const cabS=a=>{try{return cab(Math.round(a))}catch(e){return ""}};
const loc=t=>{try{return new Date(t).toLocaleTimeString(EN()?"en-US":"es-ES",{hour:"2-digit",minute:"2-digit",hour12:EN()?true:false})}catch(e){return ""}};
const LVT=l=>l==="g"?T("favorable","favorable"):l==="y"?T("posible","possible"):T("no ahora","not now");

/* ---------- astronomía: tiempo sidéreo, Luna (método de P. Schlyter, error ~0,1°) y radiantes ---------- */
const jd=t=>t/864e5+2440587.5;
function gmstDeg(t){const d=jd(t)-2451545;return ((280.46061837+360.98564736629*d)%360+360)%360}
function altaz(raDeg,decDeg,p,t){const ha=(gmstDeg(t)+p[0]-raDeg)*R,la=p[1]*R,de=decDeg*R;
  const alt=Math.asin(Math.sin(la)*Math.sin(de)+Math.cos(la)*Math.cos(de)*Math.cos(ha));
  const az=Math.atan2(Math.sin(ha),Math.cos(ha)*Math.sin(la)-Math.tan(de)*Math.cos(la))*DEG+180;return {el:alt*DEG,az:(az+360)%360}}
const rev=x=>((x%360)+360)%360,sd=x=>Math.sin(x*R),cd=x=>Math.cos(x*R);
function moonEq(t){const d=jd(t)-2451543.5;
  const N=rev(125.1228-0.0529538083*d),i=5.1454,w=rev(318.0634+0.1643573223*d),a=60.2666,e=0.0549,M=rev(115.3654+13.0649929509*d);
  let E=M+DEG*e*sd(M)*(1+e*cd(M));for(let k=0;k<5;k++)E=E-(E-DEG*e*sd(E)-M)/(1-e*cd(E));
  const xv=a*(cd(E)-e),yv=a*Math.sqrt(1-e*e)*sd(E),v=Math.atan2(yv,xv)*DEG;let r=Math.sqrt(xv*xv+yv*yv);
  const xh=r*(cd(N)*cd(v+w)-sd(N)*sd(v+w)*cd(i)),yh=r*(sd(N)*cd(v+w)+cd(N)*sd(v+w)*cd(i)),zh=r*(sd(v+w)*sd(i));
  let lon=Math.atan2(yh,xh)*DEG,lat=Math.atan2(zh,Math.sqrt(xh*xh+yh*yh))*DEG;
  const Ms=rev(356.0470+0.9856002585*d),ws=282.9404+4.70935e-5*d,Ls=rev(ws+Ms),Lm=rev(N+w+M),D=rev(Lm-Ls),F=rev(Lm-N);
  lon+=-1.274*sd(M-2*D)+0.658*sd(2*D)-0.186*sd(Ms)-0.059*sd(2*M-2*D)-0.057*sd(M-2*D+Ms)+0.053*sd(M+2*D)+0.046*sd(2*D-Ms)+0.041*sd(M-Ms)-0.035*sd(D)-0.031*sd(M+Ms)-0.015*sd(2*F-2*D)+0.011*sd(M-4*D);
  lat+=-0.173*sd(F-2*D)-0.055*sd(M-F-2*D)-0.046*sd(M+F-2*D)+0.033*sd(F+2*D)+0.017*sd(2*M+F);
  r+=-0.58*cd(M-2*D)-0.46*cd(2*D);
  const ecl=23.4393-3.563e-7*d;const xg=r*cd(lon)*cd(lat),yg=r*sd(lon)*cd(lat),zg=r*sd(lat);
  const xe=xg,ye=yg*cd(ecl)-zg*sd(ecl),ze=yg*sd(ecl)+zg*cd(ecl);
  return {ra:rev(Math.atan2(ye,xe)*DEG),dec:Math.atan2(ze,Math.sqrt(xe*xe+ye*ye))*DEG,r}}
function moonAt(p,t){const q=moonEq(t);const h=altaz(q.ra,q.dec,p,t);const par=Math.asin(Math.cos(h.el*R)/q.r)*DEG;const el=h.el-par,geo=q.r*6378.14;return {el,az:h.az,km:Math.sqrt(geo*geo+6371*6371-2*geo*6371*Math.sin(Math.max(-90,Math.min(90,h.el))*R)),dec:q.dec}}
/* pérdida de trayecto EME en dos sentidos con antenas isótropas: (4π)³ d⁴ / (λ² σ), σ = 0,065 · π · r_Luna² */
function emeLoss(fMHz,km){const lam=299.792458/fMHz,d=km*1e3,sig=0.065*Math.PI*Math.pow(1737.4e3,2);return 10*Math.log10(Math.pow(4*Math.PI,3)*Math.pow(d,4)/(lam*lam*sig))}

/* ---------- lluvias de meteoros: máximo, ZHR orientativa de la IMO y radiante (J2000) ---------- */
const SHOW=[["Cuadrántidas","Quadrantids",0,3,110,230,49],["Líridas","Lyrids",3,22,18,271,34],["Eta Acuáridas","Eta Aquariids",4,6,50,338,-1],
 ["Aríetidas (de día)","Arietids (daytime)",5,7,60,44,24],["Perseidas","Perseids",7,12,100,48,58],["Dracónidas","Draconids",9,8,10,262,54],
 ["Oriónidas","Orionids",9,21,20,95,16],["Leónidas","Leonids",10,17,15,152,22],["Gemínidas","Geminids",11,14,150,112,33]];
function showerNow(t){const now=new Date(t);let best=null;for(const y of [now.getFullYear()-1,now.getFullYear(),now.getFullYear()+1])for(const s of SHOW){const pk=Date.UTC(y,s[2],s[3],12);const dd=(pk-t)/864e5;
  if(dd>=-2&&(!best||pk<best.pk))best={s,pk,dd}}return best}

/* ---------- esporádica E: climatología media en Europa (fracción de días con alguna apertura en 6 m) y forma diaria ---------- */
const ESM=[.05,.05,.08,.15,.6,.9,.85,.45,.15,.08,.05,.08];
/* forma diaria típica (hora solar local): dos máximos, media mañana y última hora de la tarde */
const ESH=h=>{const g=(x,m,s)=>Math.exp(-((x-m)**2)/(2*s*s));return Math.min(1,.15+.85*Math.max(g(h,10.5,2.2),.9*g(h,18.5,2.3)))};

/* ---------- tropo: Open-Meteo, niveles de presión, gradiente de refractividad ---------- */
const TPTS=(()=>{const a=[];for(const la of [35,38,41,44])for(const lo of [-9,-5,-1,3,7,11])a.push([lo,la]);return a})();
const LEV=[1000,975,950,925,900,850];
let TRO=null,troBusy=false,troErr="";
try{const c=JSON.parse(S.get("acracb_tropo")||"null");if(c&&c.at&&Date.now()-c.at<3*36e5)TRO=c}catch(e){}
function satVap(tc){return 6.112*Math.exp(17.67*tc/(tc+243.5))}
function troIdx(g){/* g: gradiente de N en N/km (normal ≈ −40) */if(g>=-40)return 0;if(g>=-157)return Math.round((-g-40)/117*7);return Math.min(10,7+Math.round((-g-157)/60*3))}
async function troFetch(){if(troBusy)return;troBusy=true;troErr="";try{
  const pts=TPTS.concat([me()]);const hv=[];LEV.forEach(l=>hv.push(`temperature_${l}hPa`,`relative_humidity_${l}hPa`,`geopotential_height_${l}hPa`));hv.push("pressure_msl");
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${pts.map(p=>p[1].toFixed(2)).join(",")}&longitude=${pts.map(p=>p[0].toFixed(2)).join(",")}&hourly=${hv.join(",")}&forecast_days=2&timezone=UTC`;
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),25000);let j;
  try{const r=await fetch(u,{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);const tx=await r.text();if(tx.length>4e6)throw new Error("size");j=JSON.parse(tx)}finally{clearTimeout(tm)}
  const arr=Array.isArray(j)?j:[j];if(arr.length!==pts.length)throw new Error("n");
  const times=(arr[0].hourly&&arr[0].hourly.time||[]).map(s=>Date.parse(s+"Z"));
  const out=arr.map((o,k)=>{const H=o.hourly||{},el=+o.elevation||0;const idx=[],grad=[],pm=H.pressure_msl||[];
    for(let i=0;i<times.length;i++){const lv=[];for(const l of LEV){const tc=H[`temperature_${l}hPa`]&&H[`temperature_${l}hPa`][i],rh=H[`relative_humidity_${l}hPa`]&&H[`relative_humidity_${l}hPa`][i],z=H[`geopotential_height_${l}hPa`]&&H[`geopotential_height_${l}hPa`][i];
        if(tc==null||rh==null||z==null||z<el+10||z>el+3000)continue;const Tk=tc+273.15,e=rh/100*satVap(tc);lv.push({z,N:77.6/Tk*(l+4810*e/Tk)})}
      lv.sort((a,b)=>a.z-b.z);let g=0;for(let q=1;q<lv.length;q++){const gg=(lv[q].N-lv[q-1].N)/((lv[q].z-lv[q-1].z)/1000);if(gg<g)g=gg}
      grad.push(Math.round(g));idx.push(lv.length>=2?troIdx(g):null)}
    return {p:pts[k],idx,grad,pm}});
  TRO={at:Date.now(),times,pts:out.slice(0,TPTS.length),meP:out[out.length-1]};S.set("acracb_tropo",JSON.stringify(TRO))}
  catch(e){troErr=T("Open-Meteo no ha respondido: se volverá a intentar al abrir de nuevo esta parte.","Open-Meteo did not respond: it will try again when you open this part.")}
  finally{troBusy=false;render()}}
function troNowI(){if(!TRO||!TRO.times)return -1;const t=Date.now();let k=-1;TRO.times.forEach((x,i)=>{if(x<=t)k=i});return k}

/* ---------- dispersión meteórica en directo: recepciones MSK144 en PSK Reporter (cada 10 min como mucho) ---------- */
const PROXY="https://acracb-dx.ea5jnf.workers.dev/?u=";
let MSL=null,msBusy=false;
async function msFetch(){if(msBusy||(MSL&&Date.now()-MSL.at<10*6e4))return;msBusy=true;try{
  const u="https://retrieve.pskreporter.info/query?mode=MSK144&flowStartSeconds=-3600&rronly=1&noactive=1";
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),20000);let x="";
  try{const r=await fetch(PROXY+encodeURIComponent(u),{signal:ac.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error("HTTP "+r.status);x=await r.text();if(x.length>5e6)throw new Error("size")}finally{clearTimeout(tm)}
  let n=0,eu=0,b6=0,b2=0,best=null;const ll=s=>{try{const q=normLoc(s);return q&&q.length>=4?locToLL(q.slice(0,6)):null}catch(e){return null}};
  for(const m of x.matchAll(/<receptionReport\b([^>]*)\/?>/g)){const at={};for(const a of m[1].matchAll(/(\w+)="([^"]*)"/g))at[a[1]]=a[2];n++;const f=+at.frequency||0;if(f>=50e6&&f<54e6)b6++;else if(f>=144e6&&f<146e6)b2++;
    const A=ll(at.senderLocator),B=ll(at.receiverLocator);if(!A||!B)continue;if(A[1]>34&&A[1]<72&&A[0]>-25&&A[0]<45)eu++;
    let d=0;try{d=distJS(A,B)}catch(e){}if(d>=500&&d<=2300&&(!best||d>best.d))best={d,tx:at.senderCallsign,rx:at.receiverCallsign,f}}
  MSL={at:Date.now(),ok:true,n,eu,b6,b2,best}}catch(e){MSL={at:Date.now(),ok:false}}finally{msBusy=false;render()}}

/* ---------- estado de cada tipo de apertura ---------- */
function esState(){const st=(window.ACRACB_es&&ACRACB_es.state)||{};const cl=[];Object.entries(st).forEach(([k,s])=>(s&&s.clouds||[]).forEach(c=>cl.push([k,c])));
  const you=cl.find(([,c])=>c.you);const mo=new Date().getMonth();const sh=new Date().getUTCHours()+me()[0]/15;const clim=ESM[mo]*ESH(((sh%24)+24)%24);
  if(you)return {l:"g",t:T(`Nube en ${you[0]==="6"?"6 m":"2 m"} que te abre hacia el ${cabS(you[1].you.az)}`,`Cloud on ${you[0]==="6"?"6 m":"2 m"} opening towards the ${cabS(you[1].you.az)}`),cl,clim};
  if(cl.length)return {l:"y",t:T(`${cl.length} ${cl.length===1?"nube":"nubes"} en Europa, lejos de ti`,`${cl.length} ${cl.length===1?"cloud":"clouds"} in Europe, away from you`),cl,clim};
  return {l:clim>=.35?"y":"r",t:clim>=.35?T(`Sin nubes ahora; ${Math.round(clim*100)} % por temporada y hora`,`No clouds now; ${Math.round(clim*100)} % by season and hour`):T(`Sin nubes; poco probable (${Math.round(clim*100)} %)`,`No clouds; unlikely (${Math.round(clim*100)} %)`),cl,clim}}
function troState(){const k=troNowI();if(!TRO||k<0||!TRO.meP)return {l:"n",t:troBusy?T("Calculando…","Calculating…"):T("Abre esta parte para calcularla","Open this part to calculate it")};
  const mine=TRO.meP.idx[k];let reg=0;TRO.pts.forEach(p=>{const v=p.idx[k];if(v!=null&&v>reg)reg=v});const nx=Math.max(...TRO.meP.idx.slice(k,k+24).filter(v=>v!=null),0);
  const l=mine>=7?"g":mine>=4||reg>=7?"y":"r";
  return {l,mine,reg,nx,t:mine>=7?T("Conducto probable sobre tu zona","Duct likely over your area"):mine>=4?T("Refracción reforzada en tu zona","Enhanced refraction in your area"):reg>=7?T("Conducto en otra zona cercana","Duct in a nearby area"):T("Condiciones normales","Normal conditions")}}
function auState(){const kp=+((typeof L!=="undefined"&&L.kp)||0);let kpm=kp;try{const f=L.kpfc;if(f&&f.blocks){const b0=Date.parse(f.base+"T00:00:00Z");f.blocks.forEach((d,i)=>d.forEach((v,j)=>{const t=b0+(i*24+j*3)*36e5;if(t+3*36e5>Date.now()&&t<Date.now()+12*36e5&&v!=null)kpm=Math.max(kpm,v)}))}}catch(e){}
  const la=me()[1];const need=la<42?7:la<48?6:5;
  return {l:kp>=need?"g":kpm>=need||kp>=need-2?"y":"r",kp,kpm,need,t:kp>=need?T(`Kp ${nf(kp,1)}: aurora posible en 6 y 2 m`,`Kp ${nf(kp,1)}: aurora possible on 6 and 2 m`):T(`Kp ${nf(kp,1)}; hace falta Kp ${need} desde tu latitud`,`Kp ${nf(kp,1)}; Kp ${need} needed from your latitude`)}}
function tepState(){const now=new Date(),mo=now.getMonth(),lh=(now.getUTCHours()+me()[0]/15+24)%24;const sfi=+((typeof L!=="undefined"&&L.sfi)||0);const eq=[2,3,8,9,10].includes(mo),eve=lh>=16&&lh<=23,south=me()[1]<32;
  const l=eq&&eve&&sfi>=110?(south?"g":"y"):eq&&sfi>=100?"y":"r";
  return {l,eq,eve,sfi,south,t:!eq?T("Fuera de temporada (equinoccios)","Out of season (equinoxes)"):!eve?T("En temporada; mejor de 17 a 23 h","In season; best 17–23 h"):sfi<110?T(`En temporada, pero SFI ${sfi} es bajo`,`In season, but SFI ${sfi} is low`):T("Ventana de la tarde abierta","Evening window open")}}
function msState(){const t=Date.now(),s=showerNow(t);const lh=(new Date().getUTCHours()+me()[0]/15+24)%24;let rad=null;
  if(s){rad=altaz(s.s[5],s.s[6],me(),t)}const act=s&&Math.abs(s.dd)<=2;const morning=lh>=2&&lh<=10;
  const l=act&&rad&&rad.el>=15?"g":act||morning?"y":"r";
  return {l,s,rad,act,t:act?T(`${s.s[0]}: ${s.dd<0?"en curso":s.dd<1?"máximo hoy":"máximo en "+Math.ceil(s.dd)+" días"}`,`${s.s[1]}: ${s.dd<0?"active":s.dd<1?"peak today":"peak in "+Math.ceil(s.dd)+" days"}`):morning?T("Meteoros esporádicos: buena hora (madrugada)","Sporadic meteors: good time (early morning)"):T("Meteoros esporádicos: mejor de madrugada","Sporadic meteors: best in the early morning")}}
function emeState(){const t=Date.now(),m=moonAt(me(),t);let nxt=null;if(m.el<10){for(let k=1;k<=288;k++){const q=moonAt(me(),t+k*5*6e4);if(q.el>=10){nxt=t+k*5*6e4;break}}}
  return {l:m.el>=25?"g":m.el>=10?"y":"r",m,nxt,t:m.el>=10?T(`Luna a ${Math.round(m.el)}° de elevación, rumbo ${Math.round(m.az)}°`,`Moon at ${Math.round(m.el)}° elevation, bearing ${Math.round(m.az)}°`):nxt?T(`Luna baja; sube de 10° a las ${loc(nxt)}`,`Moon low; above 10° at ${loc(nxt)}`):T("Luna por debajo del horizonte","Moon below the horizon")}}

/* ---------- mapa base (Europa y alrededores) ---------- */
let LAND=null;
function proj(){return d3.geoEquirectangular().scale(720/(75*R)).center([7.5,47.5]).translate([360,225])}
function landSvg(pr){if(LAND)return LAND;try{const topo=JSON.parse(document.getElementById("world").textContent);const land=topojson.feature(topo,topo.objects.countries||topo.objects.land);const pa=d3.geoPath(pr);
  const fix=g=>{if(!g)return g;const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];polys.forEach(q=>{if(d3.geoArea({type:"Polygon",coordinates:q})>2*Math.PI)q.forEach(r=>r.reverse())});return g};
  LAND=(land.features||[land]).map(f=>{fix(f.geometry);const d=pa(f);return d?`<path d="${d}" class="vland"/>`:""}).join("")}catch(e){LAND=""}return LAND}
const canMap=()=>typeof d3!=="undefined"&&typeof topojson!=="undefined";

/* ---------- partes ---------- */
function esPart(es){const me0=me();let map="";
  if(canMap()){const pr=proj(),P=pr(me0);let ring="";
    try{const c1=d3.geoCircle().center(me0).radius(1000/111.2)(),c2=d3.geoCircle().center(me0).radius(2200/111.2)();const pa=d3.geoPath(pr);ring=`<path d="${pa(c2)}" class="vring2"/><path d="${pa(c1)}" class="vring1"/>`}catch(e){}
    let cl="";es.cl.forEach(([k,c])=>{const q=pr(c.M);if(!q)return;cl+=`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${Math.min(22,7+c.n)}" class="vcl${c.you?" you":""}"><title>${e2(c.name||"")} · ${k==="6"?"6 m":"2 m"} · ${c.n}</title></circle>`;
      if(c.you&&P){const far=pr(c.you.far||c.M);}});
    let sp="";try{(L.spots||[]).filter(s=>(s.band===10||s.band===11)&&s.dx&&s.from&&s.from[0]).filter(s=>{const a=spotAge(s);return a==null||a<=60}).forEach(s=>{let d=0;try{d=distJS(s.from[0],s.dx)}catch(e){}if(d<700)return;const a=pr(s.from[0]),b=pr(s.dx);if(a&&b)sp+=`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" class="vsp" stroke="${BC[s.band]}"><title>${e2(s.call)} ${e2(s.f)}</title></line>`})}catch(e){}
    map=`<div class="vmap"><svg viewBox="0 0 720 450" role="img" aria-label="${T("Mapa de esporádica E","Sporadic E map")}">${landSvg(pr)}${ring}${sp}${cl}${P?`<rect x="${(P[0]-5).toFixed(1)}" y="${(P[1]-5).toFixed(1)}" width="10" height="10" class="vme"/>`:""}</svg></div>
     <p class="vleg"><span><i class="k-ring"></i>${T("donde te llega un salto de Es (1.000–2.200 km)","where one Es hop reaches you (1,000–2,200 km)")}</span><span><i class="k-cl"></i>${T("nube vista ahora (PSK Reporter)","cloud seen now (PSK Reporter)")}</span><span><i class="k-you"></i>${T("nube que te sirve","cloud usable for you")}</span><span><i class="k-sp"></i>${T("spot del clúster de 6 o 2 m a más de 700 km","6 or 2 m cluster spot over 700 km")}</span></p>`}
  const mo=new Date().getMonth();const bars=Array.from({length:24},(_,h)=>{const v=ESM[mo]*ESH((h-me()[0]/15+24)%24+me()[0]/15-me()[0]/15);return v});
  /* barras en hora local del dispositivo: se convierte la hora solar del QTH a hora local */
  const off=-new Date().getTimezoneOffset()/60;const solar=h=>((h-off+me()[0]/15)%24+24)%24;
  const bh=Array.from({length:24},(_,h)=>ESM[mo]*ESH(solar(h)));const mx=Math.max(...bh,.01);const nowH=new Date().getHours();
  const chart=`<div class="vbars" role="img" aria-label="${T("Probabilidad de esporádica E por hora","Sporadic E chance by hour")}">${bh.map((v,h)=>`<i class="${h===nowH?"now":""}" style="height:${Math.max(4,Math.round(v/mx*100))}%" title="${String(h).padStart(2,"0")}:00 · ${Math.round(v*100)} %"></i>`).join("")}</div><div class="vbx"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>`;
  return `<p>${T(`Lo que se ve ahora y dónde puede abrir. El anillo marca hasta dónde llega un salto de esporádica E desde tu QTH; las nubes salen de las recepciones de PSK Reporter de los últimos 15 minutos y las líneas, de los spots del clúster de la última hora.`,`What is seen now and where it may open. The ring shows how far a sporadic E hop reaches from your QTH; clouds come from PSK Reporter reports in the last 15 minutes and lines from cluster spots in the last hour.`)}</p>${map}
   <h5>${T("Previsión por hora para hoy (climatología)","Hourly outlook for today (climatology)")}</h5>${chart}
   <p class="note">${T(`En ${["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][mo]}, alguna apertura de 6 m en Europa se da en torno al ${Math.round(ESM[mo]*100)} % de los días, con dos máximos: media mañana y última hora de la tarde. En 2 m es mucho más rara: solo con nubes muy intensas. Es una estadística, no una previsión del día: lo que manda es lo que se ve ahora en el mapa.`,`In ${["January","February","March","April","May","June","July","August","September","October","November","December"][mo]}, some 6 m opening in Europe happens on about ${Math.round(ESM[mo]*100)} % of days, with two peaks: mid-morning and late afternoon. On 2 m it is much rarer: only with very intense clouds. It is a statistic, not a forecast for the day: what counts is what the map shows now.`)}</p>
   <p class="note">${T("Frecuencias: 6 m FT8 50.313, SSB 50.150; 2 m FT8 144.174, SSB 144.300.","Frequencies: 6 m FT8 50.313, SSB 50.150; 2 m FT8 144.174, SSB 144.300.")}</p>`}

let TROH=0;
function troPart(ts){if(!TRO){return `<p class="note">${troErr||(troBusy?T("Pidiendo al modelo meteorológico los datos de las próximas 48 horas…","Asking the weather model for the next 48 hours…"):T("Se calcula al abrir esta parte.","It is calculated when you open this part."))}</p>`}
  const k0=Math.max(0,troNowI()),k=Math.min(TRO.times.length-1,k0+TROH);const col=v=>v==null?"transparent":v>=8?"#d946ef":v>=7?"#ef4444":v>=5?"#f97316":v>=3?"#eab308":v>=1?"#84cc16":"#1f2937";
  let map="";if(canMap()){const pr=proj();let cells="";TRO.pts.forEach(p=>{const a=pr([p.p[0]-2,p.p[1]+1.5]),b=pr([p.p[0]+2,p.p[1]-1.5]);if(!a||!b)return;const v=p.idx[k];cells+=`<rect x="${a[0].toFixed(1)}" y="${a[1].toFixed(1)}" width="${(b[0]-a[0]).toFixed(1)}" height="${(b[1]-a[1]).toFixed(1)}" fill="${col(v)}" class="vtc"><title>${p.p[1]}° N ${p.p[0]}° · ${v==null?"—":v+"/10"} · ${p.grad[k]} N/km</title></rect>`});
    const P=pr(me());map=`<div class="vmap"><svg viewBox="0 0 720 450" role="img" aria-label="${T("Mapa de conductos troposféricos","Tropospheric duct map")}">${cells}${landSvg(pr)}${P?`<rect x="${(P[0]-5).toFixed(1)}" y="${(P[1]-5).toFixed(1)}" width="10" height="10" class="vme"/>`:""}</svg></div>`}
  const steps=[[0,T("Ahora","Now")],[6,"+6 h"],[12,"+12 h"],[24,"+24 h"],[36,"+36 h"]].filter(([d])=>k0+d<TRO.times.length);
  const seg=`<div class="seg vtseg" role="group" aria-label="${T("Hora del mapa","Map time")}">${steps.map(([d,l])=>`<button type="button" data-troh="${d}" aria-pressed="${TROH===d}">${l}</button>`).join("")}</div>`;
  const mi=TRO.meP.idx;const bars=TRO.times.map((t,i)=>i<k0?"":`<i style="height:${Math.max(6,((mi[i]||0)/10)*100)}%;background:${col(mi[i])}" title="${loc(t)} · ${mi[i]==null?"—":mi[i]+"/10"}"${i===k?' class="now"':""}></i>`).join("");
  const pm=TRO.meP.pm&&TRO.meP.pm[k0];
  const v=ts.mine;const txt=v>=7?T("Conducto probable: en 2 m y 70 cm se puede pasar de los cientos de kilómetros a 800–1.500 km, sobre todo sobre el mar (Baleares, Italia, norte de África).","Duct likely: on 2 m and 70 cm you can go from a few hundred km to 800–1,500 km, especially over the sea (Balearics, Italy, North Africa).")
    :v>=4?T("Refracción reforzada: el alcance habitual en 2 m y 70 cm puede crecer un 30–50 %.","Enhanced refraction: your usual 2 m and 70 cm range may grow 30–50 %.")
    :T("Condiciones normales: alcance habitual por dispersión troposférica.","Normal conditions: usual troposcatter range.");
  return `<p>${T("Índice de 0 a 10 calculado con la temperatura y la humedad del modelo meteorológico en varios niveles: cuanto más rápido baja la refractividad con la altura, más se curvan las señales de VHF y UHF hacia el suelo. Desde 7, conducto probable.","Index from 0 to 10 worked out from the weather model's temperature and humidity at several levels: the faster refractivity drops with height, the more VHF and UHF signals bend back to the ground. From 7, a duct is likely.")}</p>
   ${seg}${map}<p class="vleg">${[[0,"0"],[1,"1–2"],[3,"3–4"],[5,"5–6"],[7,"7"],[8,"8–10"]].map(([x,l])=>`<span><i style="background:${col(x)}"></i>${l}</span>`).join("")}</p>
   <h5>${T("Tu zona en las próximas 48 horas","Your area over the next 48 hours")}</h5><div class="vbars vtro">${bars}</div>
   <p><b>${T("Para 2 m y 70 cm","For 2 m and 70 cm")}:</b> ${txt}${pm?T(` Presión en tu zona: ${Math.round(pm)} hPa${pm>=1020?" (anticiclón: favorece las inversiones)":""}.`,` Pressure in your area: ${Math.round(pm)} hPa${pm>=1020?" (high pressure: favors inversions)":""}.`):""}</p>
   <p class="note">${T("Condiciones que favorecen la tropo: anticiclón estable, noches en calma, aire cálido sobre el mar más fresco y madrugadas con niebla o calima. Estimación propia con datos de <a href=\"https://open-meteo.com/\" target=\"_blank\" rel=\"noopener noreferrer\" data-ext>Open-Meteo</a> (CC BY 4.0); con la resolución vertical del modelo, los conductos muy finos pueden no verse.","Conditions that favor tropo: stable high pressure, calm nights, warm air over a cooler sea and mornings with fog or haze. Own estimate with data from <a href=\"https://open-meteo.com/\" target=\"_blank\" rel=\"noopener noreferrer\" data-ext>Open-Meteo</a> (CC BY 4.0); with the model's vertical resolution, very thin ducts may not show.")} ${T("Datos del","Data from")} ${loc(TRO.at)}.</p>`}

function auPart(a){return `<p>${T(`Con tormentas geomagnéticas fuertes el óvalo auroral baja hacia el sur y su ionización dispersa las señales de 6 y 2 m: se oyen ásperas, como un susurro, y hay que apuntar al norte. Desde tu latitud (${nf(me()[1],1)}° N) hace falta un Kp de al menos ${a.need}.`,`During strong geomagnetic storms the auroral oval moves south and its ionization scatters 6 and 2 m signals: they sound rough, like a whisper, and you must aim north. From your latitude (${nf(me()[1],1)}° N) you need a Kp of at least ${a.need}.`)}</p>
  <dl class="sc-d"><dt>Kp</dt><dd><b>${nf(a.kp,1)}</b> ${T("ahora","now")} · ${T("máximo previsto en 12 h","max forecast in 12 h")}: <b>${nf(a.kpm,1)}</b></dd>${typeof L!=="undefined"&&L.space&&L.space.aurora?`<dt>OVATION</dt><dd>${e2(window.ACRACB_tx?ACRACB_tx(L.space.aurora):L.space.aurora)}</dd>`:""}</dl>
  <p class="note">${T("Modo: CW o SSB con mucha voz; FT8 apenas funciona por la distorsión. Fuente: NOAA SWPC.","Mode: CW or SSB with clear speech; FT8 barely works because of the distortion. Source: NOAA SWPC.")}</p>`}
function tepPart(t){return `<p>${T("La propagación transecuatorial (TEP) une estaciones a ambos lados del ecuador magnético, a 5.000–8.000 km, sobre todo en 6 m, al atardecer y cerca de los equinoccios, con flujo solar alto. Desde la Península es poco frecuente (estamos al límite norte); desde Canarias, mucho más.","Transequatorial propagation (TEP) links stations on both sides of the magnetic equator, 5,000–8,000 km apart, mostly on 6 m, in the evening and near the equinoxes, with high solar flux. From the Iberian Peninsula it is uncommon (we are at the northern edge); from the Canaries, much more frequent.")}</p>
  <dl class="sc-d"><dt>${T("Temporada","Season")}</dt><dd>${t.eq?T("sí (marzo–abril o septiembre–noviembre)","yes (March–April or September–November)"):T("no","no")}</dd><dt>${T("Hora","Time")}</dt><dd>${t.eve?T("dentro de la ventana de 17 a 23 h","within the 17–23 h window"):T("fuera de la ventana de 17 a 23 h","outside the 17–23 h window")}</dd><dt>SFI</dt><dd>${t.sfi}${t.sfi>=110?"":" "+T("(conviene más de 110)","(above 110 is better)")}</dd><dt>${T("Hacia","Towards")}</dt><dd>${T("sur de África y Sudamérica (rumbos 160–220°)","southern Africa and South America (bearings 160–220°)")}</dd></dl>
  <p class="note">${T("Estimación por temporada, hora y flujo solar: la confirmación son los spots de 6 m a más de 5.000 km en el clúster.","Estimate by season, time and solar flux: the confirmation is 6 m spots over 5,000 km on the cluster.")}</p>`}
function msPart(m){const t=Date.now();const s=m.s;const dirs=[[0,"N–S"],[45,"NE–SO"],[90,"E–O"],[135,"SE–NO"]];
  const hrs=Array.from({length:24},(_,i)=>t+i*36e5);let tbl="";
  if(s){const rows=dirs.map(([az,l])=>{const cells=hrs.map(x=>{const r=altaz(s.s[5],s.s[6],me(),x);const sc=r.el<=0?0:Math.sin(r.el*R)*Math.abs(Math.sin((r.az-az)*R));return `<i class="${sc>=.55?"g":sc>=.3?"y":"n"}" title="${loc(x)} · ${T("radiante","radiant")} ${Math.round(r.el)}°"></i>`}).join("");return `<div class="vmrow"><span>${EN()?l.replace("SO","SW").replace("–O","–W").replace("NO","NW"):l}</span><div class="vmcells">${cells}</div></div>`}).join("");
    const elr=hrs.map(x=>{const r=altaz(s.s[5],s.s[6],me(),x);return `<i style="height:${Math.max(0,Math.round(r.el/90*100))}%" title="${loc(x)} · ${Math.round(r.el)}°"></i>`}).join("");
    tbl=`<h5>${T(`Radiante de las ${s.s[0]} en las próximas 24 h`,`${s.s[1]} radiant over the next 24 h`)}</h5><div class="vbars vrad">${elr}</div><div class="vbx"><span>${loc(hrs[0])}</span><span>+6 h</span><span>+12 h</span><span>+18 h</span><span>+23 h</span></div>
     <h5>${T("Mejores horas según la dirección del enlace","Best hours by path direction")}</h5><div class="vmgrid">${rows}</div>
     <p class="vleg"><span><i class="g"></i>${T("buena geometría","good geometry")}</span><span><i class="y"></i>${T("regular","fair")}</span><span><i class="n"></i>${T("mala o radiante bajo el horizonte","poor or radiant below the horizon")}</span></p>`}
  const live=MSL?MSL.ok?T(`En la última hora, PSK Reporter recogió <b>${MSL.n}</b> recepciones en MSK144 (${MSL.b6} en 6 m y ${MSL.b2} en 2 m; ${MSL.eu} desde Europa)${MSL.best?`; la más larga, ${e2(MSL.best.tx)} → ${e2(MSL.best.rx)} a ${fk2(MSL.best.d)} km`:""}.`,`In the last hour PSK Reporter logged <b>${MSL.n}</b> MSK144 reports (${MSL.b6} on 6 m and ${MSL.b2} on 2 m; ${MSL.eu} from Europe)${MSL.best?`; the longest, ${e2(MSL.best.tx)} → ${e2(MSL.best.rx)} at ${fk2(MSL.best.d)} km`:""}.`):T("PSK Reporter no ha respondido ahora.","PSK Reporter did not respond now."):T("Consultando la actividad en MSK144…","Checking MSK144 activity…");
  return `<p>${T("Las estelas ionizadas de los meteoros, a unos 100 km de altura, reflejan 6 y 2 m durante fracciones de segundo: permiten contactos de 800 a 2.200 km con MSK144 (50.280 y 144.360) o con FT8. Fuera de las lluvias siempre hay meteoros esporádicos, con su máximo de madrugada.","The ionized trails of meteors, about 100 km up, reflect 6 and 2 m for fractions of a second: they allow 800–2,200 km contacts with MSK144 (50.280 and 144.360) or FT8. Outside showers there are always sporadic meteors, peaking in the early morning.")}</p>
   ${s?`<dl class="sc-d"><dt>${T("Lluvia","Shower")}</dt><dd><b>${EN()?s.s[1]:s.s[0]}</b> · ${T("máximo el","peak on")} ${new Date(s.pk).toLocaleDateString(EN()?"en-US":"es-ES",{day:"numeric",month:"long"})} · ${T("unos","about")} ${s.s[4]} ${T("meteoros por hora (ZHR, IMO)","meteors per hour (ZHR, IMO)")}</dd><dt>${T("Radiante ahora","Radiant now")}</dt><dd>${Math.round(m.rad.el)}° ${T("de elevación","elevation")}, ${T("rumbo","bearing")} ${Math.round(m.rad.az)}° ${cabS(m.rad.az)}</dd></dl>`:""}
   ${tbl}<h5>${T("Actividad ahora","Activity now")}</h5><p>${live}</p>
   <p class="note">${T("La geometría es orientativa: un enlace funciona mejor cuando el radiante está alto y su rumbo queda de lado respecto a la dirección del enlace. Radiantes y ZHR de la IMO; posición calculada para tu QTH.","Geometry is a guide: a path works best when the radiant is high and its bearing is side-on to the path direction. Radiants and ZHR from the IMO; position calculated for your QTH.")}</p>`}
function emePart(e){const t=Date.now(),m=e.m;const L144=emeLoss(144.2,m.km),L432=emeLoss(432.1,m.km),L1296=emeLoss(1296.1,m.km);const dMean=emeLoss(144.2,384400);
  const win=[];let cur=null;for(let k=0;k<=288;k++){const x=t+k*5*6e4,q=moonAt(me(),x);if(q.el>=10){if(!cur)cur={a:x,mx:q.el,tm:x};if(q.el>cur.mx){cur.mx=q.el;cur.tm=x}}else if(cur){cur.b=x;win.push(cur);cur=null}}if(cur){cur.b=t+24*36e5;win.push(cur)}
  const REG=[[T("Europa central","Central Europe"),[13.4,52.5]],[T("Norteamérica este","Eastern North America"),[-74,40.7]],[T("Japón","Japan"),[139.7,35.7]],[T("Australia este","Eastern Australia"),[151.2,-33.9]]];
  const mut=REG.map(([n,p])=>{let a=null,b=null,tot=0;for(let k=0;k<=288;k++){const x=t+k*5*6e4;const ok=moonAt(me(),x).el>=10&&moonAt(p,x).el>=10;if(ok){tot+=5;if(a==null)a=x;b=x}}return `<li><b>${n}</b>: ${tot?T(`unas ${Math.round(tot/60*10)/10} h en común, de ${loc(a)} a ${loc(b)}`,`about ${Math.round(tot/60*10)/10} h in common, ${loc(a)} to ${loc(b)}`):T("sin Luna común en 24 h","no common Moon in 24 h")}</li>`}).join("");
  return `<p>${T("En rebote lunar la señal va a la Luna y vuelve: hacen falta antenas directivas, potencia y modos digitales como JT65 o Q65. Lo que manda es que la Luna esté alta para los dos extremos y lo cerca que esté de la Tierra.","In moonbounce the signal goes to the Moon and back: you need directional antennas, power and digital modes such as JT65 or Q65. What matters is the Moon being high for both ends and how close it is to Earth.")}</p>
  <dl class="sc-d"><dt>${T("Luna ahora","Moon now")}</dt><dd>${T("elevación","elevation")} <b>${Math.round(m.el)}°</b>, ${T("rumbo","bearing")} <b>${Math.round(m.az)}° ${cabS(m.az)}</b>, ${T("declinación","declination")} ${nf(m.dec,1)}°</dd>
  <dt>${T("Distancia Tierra-Luna","Earth–Moon distance")}</dt><dd><b>${fk2(m.km)} km</b> (${m.km<370000?T("cerca del perigeo: mejor","near perigee: better"):m.km>400000?T("cerca del apogeo: peor","near apogee: worse"):T("distancia media","average distance")})</dd>
  <dt>${T("Pérdida del trayecto","Path loss")}</dt><dd>144 MHz: <b>${nf(L144,1)} dB</b> · 432 MHz: <b>${nf(L432,1)} dB</b> · 1.296 MHz: <b>${nf(L1296,1)} dB</b> <span class="note">(${L144-dMean>=0?"+":""}${nf(L144-dMean,1)} dB ${T("frente a la distancia media","vs. average distance")})</span></dd></dl>
  <h5>${T("Ventanas en tu QTH (Luna por encima de 10°)","Windows at your QTH (Moon above 10°)")}</h5>${win.length?`<ul class="vwin">${win.map(w=>`<li><b>${loc(w.a)}–${loc(w.b)}</b> · ${T("máxima","max")} ${Math.round(w.mx)}° ${T("a las","at")} ${loc(w.tm)}</li>`).join("")}</ul>`:`<p class="note">${T("Sin Luna por encima de 10° en las próximas 24 h.","No Moon above 10° in the next 24 h.")}</p>`}
  <h5>${T("Luna común con otras zonas (24 h)","Common Moon with other areas (24 h)")}</h5><ul class="vwin">${mut}</ul>
  <p class="note">${T("Posición de la Luna calculada en el navegador (error de unas décimas de grado). Pérdida para dos sentidos con antenas isótropas y una reflectividad lunar del 6,5 %; no incluye el ruido del cielo ni la rotación de Faraday.","Moon position calculated in the browser (error of a few tenths of a degree). Two-way loss with isotropic antennas and 6.5 % lunar reflectivity; it does not include sky noise or Faraday rotation.")}</p>`}

/* ---------- avisos de aperturas especiales ---------- */
const AK=[["es6",T("Esporádica E en 6 m que te sirva","6 m sporadic E usable for you")],["es2",T("Esporádica E en 2 m que te sirva","2 m sporadic E usable for you")],["tro",T("Tropo en tu zona (índice 7 o más)","Tropo in your area (index 7 or more)")],["au",T("Aurora en VHF desde tu latitud","VHF aurora from your latitude")],["ms",T("Máximo de una lluvia de meteoros","Meteor shower peak")]];
let AL=new Set();try{AL=new Set(JSON.parse(S.get("acracb_vuhfal")||"[]"))}catch(e){}
function alertPart(){const on=window.ACRACB_notifOn&&ACRACB_notifOn();const lc=((document.getElementById("loc")||{}).value||"").slice(0,6);
  return `<p>${T(`Elige qué aperturas quieres que te avisen. Se calculan para tu locator (<b>${e2(lc)}</b>) y las bandas que marques.`,`Choose which openings you want to be alerted about. They are worked out for your locator (<b>${e2(lc)}</b>) and the bands you tick.`)}</p>
   <div class="valk">${AK.map(([k,n])=>`<label><input type="checkbox" data-val="${k}"${AL.has(k)?" checked":""}> ${n}</label>`).join("")}</div>
   <p class="note">${on?T("Las notificaciones están activadas: el aviso llega mientras la plataforma esté abierta o instalada como app.","Notifications are on: the alert arrives while the platform is open or installed as an app."):T("Para recibirlos, activa antes las notificaciones en DX › Avisos.","To receive them, first turn on notifications in DX › Alerts.")}</p>`}
function checkAlerts(st){if(!AL.size||!(window.ACRACB_notifOn&&ACRACB_notifOn())||!window.ACRACB_notify)return;let seen={};try{seen=JSON.parse(S.get("acracb_vuhfseen")||"{}")}catch(e){}
  const now=Date.now();const fire=(k,ti,bo)=>{if(seen[k]&&now-seen[k]<6*36e5)return;seen[k]=now;S.set("acracb_vuhfseen",JSON.stringify(seen));try{ACRACB_notify(ti,bo,"acracb-vuhf-"+k)}catch(e){}};
  const es=st.es;es.cl.filter(([,c])=>c.you).forEach(([b,c])=>{if(AL.has(b==="6"?"es6":"es2"))fire((b==="6"?"es6":"es2")+Math.round(c.you.az/30),T(`Esporádica E en ${b==="6"?"6 m":"2 m"}`,`Sporadic E on ${b==="6"?"6 m":"2 m"}`),T(`Te puede abrir hacia el ${cabS(c.you.az)} (${c.you.az}°)${c.you.to?", "+c.you.to:""}.`,`May open towards the ${cabS(c.you.az)} (${c.you.az}°)${c.you.to?", "+c.you.to:""}.`))});
  if(AL.has("tro")&&st.tro.mine>=7)fire("tro",T("Tropo en tu zona","Tropo in your area"),T(`Índice ${st.tro.mine}/10: 2 m y 70 cm pueden llegar lejos.`,`Index ${st.tro.mine}/10: 2 m and 70 cm may reach far.`));
  if(AL.has("au")&&st.au.l==="g")fire("au",T("Aurora en VHF","VHF aurora"),T(`Kp ${nf(st.au.kp,1)}: apunta al norte en 6 y 2 m.`,`Kp ${nf(st.au.kp,1)}: aim north on 6 and 2 m.`));
  if(AL.has("ms")&&st.ms.act&&st.ms.s&&Math.abs(st.ms.s.dd)<1)fire("ms"+st.ms.s.s[0],T(`Máximo de las ${st.ms.s.s[0]}`,`${st.ms.s.s[1]} peak`),T("Buen momento para dispersión meteórica en 6 y 2 m (MSK144).","Good time for meteor scatter on 6 and 2 m (MSK144)."))}

/* ---------- pintar ---------- */
let OPEN=new Set();try{OPEN=new Set(JSON.parse(S.get("acracb_vuhfopen")||"[]"))}catch(e){}
function state(){return {es:esState(),tro:troState(),au:auState(),tep:tepState(),ms:msState(),eme:emeState()}}
function render(){const v=document.getElementById("vhfo");if(!v)return;let box=document.getElementById("vuhf");
  if(!box){box=document.createElement("div");box.id="vuhf";box.className="vuhf";const f=document.getElementById("f_vhf");const sum=f&&f.querySelector(":scope>summary");if(sum)sum.insertAdjacentElement("afterend",box);else v.parentNode.insertBefore(box,v)}
  /* 2.10.7: primero el estado de 6 m, 2 m y 70 cm, luego la nota de meteoros y después el panel */
  {const f=document.getElementById("f_vhf"),sum=f&&f.querySelector(":scope>summary");if(sum&&sum.nextElementSibling!==v){sum.insertAdjacentElement("afterend",v)}
   const mn=document.getElementById("metnote");if(mn&&v.nextElementSibling!==mn)v.insertAdjacentElement("afterend",mn);
   const after=mn||v;if(after.nextElementSibling!==box)after.insertAdjacentElement("afterend",box)}
  const st=state();const tiles=[["es",T("Esporádica E","Sporadic E"),st.es],["tro",T("Tropo","Tropo"),st.tro],["au",T("Aurora","Aurora"),st.au],["tep","TEP",st.tep],["ms",T("Meteoros","Meteors"),st.ms],["eme",T("Rebote lunar","Moonbounce"),st.eme]];
  const panel=`<h3 class="vh">${T("Panel de aperturas especiales","Special openings panel")}</h3><div class="vtiles">${tiles.map(([k,n,s])=>`<button type="button" class="vtile lv-${s.l}" data-vgo="${k}"><span class="vtn">${n}</span><b class="vts">${s.l==="n"?"—":LVT(s.l)}</b><span class="vtt">${e2(s.t)}</span></button>`).join("")}</div>`;
  const parts=[["es",T("Esporádica E: mapa y previsión","Sporadic E: map and outlook"),()=>esPart(st.es)],["tro",T("Tropo: conductos en 2 m y 70 cm","Tropo: ducts on 2 m and 70 cm"),()=>troPart(st.tro)],["au",T("Aurora en VHF","VHF aurora"),()=>auPart(st.au)],["tep",T("Transecuatorial (TEP) en 6 m","Transequatorial (TEP) on 6 m"),()=>tepPart(st.tep)],["ms",T("Dispersión meteórica","Meteor scatter"),()=>msPart(st.ms)],["eme",T("Rebote lunar (EME)","Moonbounce (EME)"),()=>emePart(st.eme)],["al",T("Avisos de aperturas especiales","Special opening alerts"),alertPart]];
  const html=panel+parts.map(([k,n,f])=>`<details class="vpart" data-vp="${k}"${OPEN.has(k)?" open":""}><summary>${n}</summary><div class="vpb">${OPEN.has(k)?`<div class="vpc">${f()}</div>`:""}</div></details>`).join("");
  if(box.dataset.h!==html){box.dataset.h=html;box.innerHTML=html;wire(box,parts)}
  /* 2.10.9: las nubes de esporádica E vistas ahora van dentro de su desplegable, al principio */
  {const esw=document.querySelector(".esw"),eb=box.querySelector('details.vpart[data-vp="es"]>.vpb');if(esw&&eb&&esw.parentNode!==eb)eb.insertBefore(esw,eb.firstChild)}
  checkAlerts(st)}
function wire(box,parts){box.querySelectorAll("details.vpart").forEach(d=>d.addEventListener("toggle",()=>{const k=d.dataset.vp;if(d.open){OPEN.add(k);if(k==="tro"&&!TRO&&!troBusy)troFetch();if(k==="ms")msFetch();const p=parts.find(x=>x[0]===k);const b=d.querySelector(".vpb");if(p&&b&&!b.querySelector(".vpc"))b.insertAdjacentHTML("beforeend",`<div class="vpc">${p[2]()}</div>`)}else OPEN.delete(k);S.set("acracb_vuhfopen",JSON.stringify([...OPEN]))}));
  box.querySelectorAll("[data-vgo]").forEach(b=>b.onclick=()=>{const d=box.querySelector(`details.vpart[data-vp="${b.dataset.vgo}"]`);if(d){d.open=true;try{d.scrollIntoView({behavior:"smooth",block:"start"})}catch(e){}}});
  box.querySelectorAll("[data-troh]").forEach(b=>b.onclick=()=>{TROH=+b.dataset.troh;box.dataset.h="";render()});
  box.querySelectorAll("[data-val]").forEach(c=>c.onchange=()=>{if(c.checked)AL.add(c.dataset.val);else AL.delete(c.dataset.val);S.set("acracb_vuhfal",JSON.stringify([...AL]))})}
function visible(){const d=document.getElementById("f_vhf");return d&&typeof st!=="undefined"&&st.page==="ahora"&&!d.hidden&&d.open}
function tick(){if(document.visibilityState!=="visible")return;const vis=visible();if(vis||AL.size){if(vis&&OPEN.has("tro")&&(!TRO||Date.now()-TRO.at>3*36e5)&&!troBusy)troFetch();if(vis&&OPEN.has("ms"))msFetch();render()}}
window.ACRACB_vuhf={render,state,moonAt,emeLoss,troFetch};
function boot(){if(!document.getElementById("vhfo"))return setTimeout(boot,500);render();setInterval(tick,60000);document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest('[data-t="f_vhf"],.ptabs button'))setTimeout(()=>{if(visible()){if(OPEN.has("tro")&&!TRO)troFetch();render()}},80)},true)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
