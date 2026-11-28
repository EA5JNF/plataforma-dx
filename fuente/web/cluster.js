/* ---- ACRACB 2.1: clúster con filtro de banda, POTA/SOTA/WWFF, paso largo y DXpediciones en el aire ---- */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";
const T=(es,en)=>EN()?en:es;
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const ORD=[0,1,8,2,9,3,4,5,6,7,10,11,12];
const PROGS=["POTA","SOTA","WWFF","IOTA","LLOTA","OTROS"];
/* 2.10.18: una sola clasificación en toda la plataforma: DX, POTA, SOTA, WWFF, IOTA y OTROS (GMA, castillos, faros,
   diplomas españoles…). Sale de los propios clústeres: referencia del spot o de su comentario. */
/* 2.10.20: IOTA (islas) con categoría propia */
/* 2.10.24: LLOTA (lagos y lagunas) también con categoría propia */
const P3=["POTA","SOTA","WWFF","IOTA","LLOTA"];const catOf=o=>P3.includes(String(o.prog||"").toUpperCase())?String(o.prog).toUpperCase():"OTROS";
const RXA=/\b(POTA|SOTA|WWFF|IOTA|GMA|WCA|HEMA|WWBOTA|BOTA|LLOTA|ILLW|ARLHS|SIOTA|ZLOTA|DME|DVGE|DFE|DCE|DIE|DMVE|DEE)[ :#-]*([A-Z0-9]{1,5}[\/-][A-Z0-9\/-]{1,12})\b/i;
/* filtros acumulativos, como las bandas del mapa: se pueden marcar varios tipos y varias bandas a la vez */
const ld=(k,ok)=>{try{const v=JSON.parse(S.get(k)||"null");return Array.isArray(v)?v.filter(ok):null}catch(e){return null}};
let TYPES=new Set(ld("acracb_cltypes",x=>x==="dx"||PROGS.includes(x))||[S.get("acracb_cltype")].filter(x=>x==="dx"||PROGS.includes(x)));if(!TYPES.size)["dx"].concat(PROGS).forEach(x=>TYPES.add(x));
/* quien tenía «Todos» marcado antes de existir OTROS sigue con todo */if(["dx","POTA","SOTA","WWFF"].every(x=>TYPES.has(x))){TYPES.add("OTROS");TYPES.add("IOTA");TYPES.add("LLOTA")}
/* 2.10.19: un solo juego de filtros. Las bandas elegidas en el clúster son las mismas del mapa (st.mbs) y de los avisos;
   el modo es el de la estación más los que añadas en el clúster o el mapa (CMS). Vacío = todas. */
const BSEL={get size(){return BL().length},has:b=>BL().includes(b),add(b){if(!BL().includes(b))st.mbs=BL().concat([b])},delete(b){st.mbs=BL().filter(x=>x!==b)},clear(){st.mbs=[]},[Symbol.iterator](){return BL().slice()[Symbol.iterator]()}};
function BL(){try{return Array.isArray(st.mbs)?st.mbs:[]}catch(_){return []}}
const saveB=()=>{try{store.set("mbs",JSON.stringify(st.mbs))}catch(_){}try{renderBandSeg()}catch(_){}try{if(st.page==="mapa")drawMap()}catch(_){}try{MSC=null}catch(_){}try{alBar()}catch(_){}};
const e2=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ago=a=>a==null?"":a<1?T("ahora","now"):a<90?T(`hace ${a} min`,`${a} min ago`):a<1440?T(`hace ${Math.round(a/60)} h`,`${Math.round(a/60)} h ago`):T("hace más de un día","over a day ago");
const minsFrom=u=>{const t=Date.parse(u||"");return isNaN(t)?null:Math.max(0,Math.round((Date.now()-t)/6e4))};
/* 2.3.5: los filtros enseñan siempre las 13 bandas; las que ahora no tienen nada salen atenuadas */
const bandsOK=()=>new Set(ORD);
const modeOK=s=>{try{return CMS().includes(spotMode(s))}catch(e){return true}};
const lp=az=>(az+180)%360;
/* modo con código de colores: CW ámbar, voz azul, FT8 verde, FT4 turquesa, RTTY morado, otros digitales rosa */
function mlab(m,f){let x=String(m||"").toUpperCase().trim();if(!x&&f!=null){try{x=String(spotMode({mode:"",f})).toUpperCase()}catch(e){}}
  x={USB:"SSB",LSB:"SSB",PHONE:"SSB",FONIA:"SSB","FT-8":"FT8","FT-4":"FT4",JS8CALL:"JS8",BPSK31:"PSK31",PSK:"PSK31",OTRO:"",DATA:"DIGI",DIGITAL:"DIGI"}[x]??x;return x}
function mcls(x){return x==="CW"?"cw":/^(SSB|AM|FM|DV|DSTAR|C4FM|DMR)$/.test(x)?"ph":x==="FT8"?"ft8":x==="FT4"?"ft4":x==="RTTY"?"rtty":x?"dg":"na"}
function mb(m){const x=mlab(m);if(!x)return "";return `<span class="mb mb-${mcls(x)}">${e2(x)}</span>`}
window.ACRACB_mb=mb;
function legend(){return `<div class="mleg" aria-label="${T("Colores de los modos","Mode colors")}">${T("Modo","Mode")}: ${["CW","SSB","FT8","FT4","RTTY"].map(mb).join("")}<span class="mb mb-dg" title="${T("Otros modos digitales: PSK31, JS8, SSTV, JT65…","Other digital modes: PSK31, JS8, SSTV, JT65…")}">${T("Otros","Other")}</span></div>`}
const RX=/\b(POTA|SOTA|WWFF)[ :#-]*([A-Z0-9]{1,4}[\/-][A-Z0-9\/-]{2,10})\b/i;

/* ---------- programas: POTA, SOTA, WWFF ---------- */
function progAll(){
  if(Array.isArray(L.acts))return L.acts.map(o=>Object.assign({},o,{a:minsFrom(o.utc)}));
  /* copia sin datos propios de programas (Artifact o datos antiguos): se sacan de los spots del clúster */
  const out=[],seen=new Set();
  for(const s of (L.spots||[])){const m=String(s.c||"").match(RXA);if(!m)continue;const k=s.call+"|"+m[2].toUpperCase();if(seen.has(k))continue;seen.add(k);
    out.push({call:s.call,prog:m[1].toUpperCase(),ref:m[2].toUpperCase(),f:s.f,band:s.band,mode:s.mode,t:s.t,by:Array.isArray(s.by)?s.by[0]:s.by,dx:s.dx,a:(()=>{try{return spotAge(s)}catch(e){return null}})(),c:""})}
  return out}
function refUrl(p,r){if(!["POTA","SOTA","WWFF"].includes(p))return "";if(p==="POTA")return "https://pota.app/#/park/"+encodeURIComponent(r);
  if(p==="SOTA")return "https://www.sotadata.org.uk/en/summit/"+r.split("/").map(encodeURIComponent).join("/");
  return "https://wwff.co/directory/?showRef="+encodeURIComponent(r)}
const PNAME={POTA:["parque","park"],SOTA:["cumbre","summit"],WWFF:["reserva","reserve"],IOTA:["isla","island"],LLOTA:["lago","lake"]};
const CATN=k=>k==="dx"?"DX":k==="OTROS"?T("Otros","Other"):k;

/* ---------- barra de filtros ---------- */
function bar(counts,bcounts){
  const bs=bandsOK(),list=ORD.filter(b=>bs.has(b));[...BSEL].forEach(b=>{if(!bs.has(b))BSEL.delete(b)});
  const tb=[["dx","DX"]].concat(PROGS.map(p=>[p,CATN(p)]));
  return `<div class="seg clseg" role="group" aria-label="${T("Qué mostrar","What to show")}"><span class="segl">${T("Ver","Show")}</span><button type="button" data-clt="*" class="mmall" aria-pressed="${tb.every(([k])=>TYPES.has(k))}">${T("Todos","All")}</button>${tb.map(([k,l])=>`<button type="button" data-clt="${k}" aria-pressed="${TYPES.has(k)&&!tb.every(([z])=>TYPES.has(z))}">${l}${counts[k]?` <small>${counts[k]}</small>`:""}</button>`).join("")}</div>`+
    (list.length>1?`<div class="seg clseg clbands" role="group" aria-label="${T("Banda del clúster","Cluster band")}"><span class="segl">${T("Banda","Band")}</span><button type="button" data-clb="" aria-pressed="${!BSEL.size}">${T("Todas","All")}</button>${list.map(b=>`<button type="button" data-clb="${b}" aria-pressed="${BSEL.has(b)}"${bcounts[b]?"":' class="clz"'}><i style="background:${BC[b]}"></i>${BANDS[b]}${bcounts[b]?` <small>${bcounts[b]}</small>`:""}</button>`).join("")}</div>`:"")}
function wire(box){
  /* cada botón se marca o se desmarca; siempre queda al menos un tipo */
  box.querySelectorAll("[data-clt]").forEach(b=>b.onclick=()=>{/* 2.7.1: como las bandas: «Todos» es la selección vacía; tocar un tipo con «Todos» activo deja solo ese; quitar el último vuelve a «Todos» */
  const k=b.dataset.clt,ALL=["dx"].concat(PROGS),all=ALL.every(x=>TYPES.has(x));if(k==="*")ALL.forEach(x=>TYPES.add(x));else if(all){TYPES.clear();TYPES.add(k)}else{if(TYPES.has(k))TYPES.delete(k);else TYPES.add(k);if(!TYPES.size)ALL.forEach(x=>TYPES.add(x))}S.set("acracb_cltypes",JSON.stringify([...TYPES]));render();catChanged()});
  /* «Todas» quita la selección; marcar todas las bandas equivale a «Todas» */
  box.querySelectorAll("[data-clb]").forEach(b=>b.onclick=()=>{const v=b.dataset.clb;if(v==="")BSEL.clear();else{const n=+v;if(BSEL.has(n))BSEL.delete(n);else BSEL.add(n);const all=ORD.filter(x=>bandsOK().has(x));if(all.every(x=>BSEL.has(x)))BSEL.clear()}
    saveB();render()})}

/* ---------- filas: tarjeta de estación por secciones ----------
   cabecera: indicativo · bandera · país ........ hora
   línea de frecuencia: frecuencia (MHz) · modo · banda · etiquetas
   secciones con su título a la izquierda: Le oyen · Split/QSL · Rumbo · Distancia · Nota */
function modeOf(s){if(s.mode)return s.mode;try{const k=spotMode(s);return k==="ssb"?"SSB":k==="otro"?"":k.toUpperCase()}catch(e){return ""}}
/* 2.4.3: distancias sobre el elipsoide WGS84 (Vincenty), no sobre una esfera: error de metros en lugar de hasta un 0,5 %.
   El camino largo es la vuelta completa por el mismo círculo máximo (su longitud real en el elipsoide) menos el corto. */
const WA=6378137,WF=1/298.257223563,WB=WA*(1-WF),WE2=WF*(2-WF),RD=Math.PI/180;
function vinc(p1,p2){const L=(p2[0]-p1[0])*RD,U1=Math.atan((1-WF)*Math.tan(p1[1]*RD)),U2=Math.atan((1-WF)*Math.tan(p2[1]*RD));
  const sU1=Math.sin(U1),cU1=Math.cos(U1),sU2=Math.sin(U2),cU2=Math.cos(U2);let l=L,lp,it=0,sS,cS,sg,sA,c2A,c2m;
  do{const sl=Math.sin(l),cl=Math.cos(l);sS=Math.sqrt((cU2*sl)**2+(cU1*sU2-sU1*cU2*cl)**2);if(sS===0)return {m:0,az:0};
    cS=sU1*sU2+cU1*cU2*cl;sg=Math.atan2(sS,cS);sA=cU1*cU2*sl/sS;c2A=1-sA*sA;c2m=c2A?cS-2*sU1*sU2/c2A:0;
    const C=WF/16*c2A*(4+WF*(4-3*c2A));lp=l;l=L+(1-C)*WF*sA*(sg+C*sS*(c2m+C*cS*(-1+2*c2m*c2m)))}while(Math.abs(l-lp)>1e-12&&++it<200);
  if(it>=200)return null; /* casi antípodas: no converge */
  const u2=c2A*(WA*WA-WB*WB)/(WB*WB),A=1+u2/16384*(4096+u2*(-768+u2*(320-175*u2))),B=u2/1024*(256+u2*(-128+u2*(74-47*u2)));
  const dS=B*sS*(c2m+B/4*(cS*(-1+2*c2m*c2m)-B/6*c2m*(-3+4*sS*sS)*(-3+4*c2m*c2m)));
  const az=Math.atan2(cU2*Math.sin(l),cU1*sU2-sU1*cU2*Math.cos(l));return {m:WB*A*(sg-dS),az:(az/RD+360)%360}}
/* vuelta completa del círculo máximo que pasa por los dos puntos (elipse máxima), fórmula de Ramanujan */
function loopM(p1,p2){const v=p=>{const la=p[1]*RD,lo=p[0]*RD;return [Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la)]};
  const a=v(p1),b=v(p2);let n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const k=Math.hypot(...n);if(!k)return 2*Math.PI*6371008.8;
  const nz2=(n[2]/k)**2,bg=1/Math.sqrt(nz2/(WA*WA)+(1-nz2)/(WB*WB)),h=((WA-bg)/(WA+bg))**2;return Math.PI*(WA+bg)*(1+3*h/(10+Math.sqrt(4-3*h)))}
function geoKm(p1,p2){const r=vinc(p1,p2);let m,az;if(r){m=r.m;az=r.az}else{m=distJS(p1,p2)*1000;az=brgJS(p1,p2)}
  const lm=Math.max(0,loopM(p1,p2)-m);return {km:m/1000,lkm:lm/1000,az}}
window.ACRACB_geoKm=geoKm;
function geoOf(p){try{if(!p||p.length!==2||p[0]==null||p[1]==null)return null;const g=geoKm(TXP,p);const az=Math.round(g.az)%360;return {az,laz:lp(az),km:Math.round(g.km),lkm:Math.round(g.lkm)}}catch(e){return null}}
function sec(lbl,val){return val?`<dt>${lbl}</dt><dd>${val}</dd>`:""}
/* 2.7.0: todas las tarjetas dicen hace cuánto se oyó la estación (último spot de ese indicativo) */
function lastAge(call){const C=SK(call);let best=null;try{const d=(L.dx||[]).find(d=>dxTok(d.call).includes(C));if(d){const a=dxSpots(d);for(const o of a)if(o.a!=null&&(best==null||o.a<best))best=o.a}}catch(_){}
  try{for(const s of (L.spots||[])){if(SK(s.call)!==C)continue;const a=spotAge(s);if(a!=null&&isFinite(a)&&(best==null||a<best))best=a}}catch(_){}return best}
window.ACRACB_lastAge=lastAge;
/* 2.8.23: textos que llegan de los datos (información de DXpediciones, nota de estaciones cercanas, aurora).
   Las frecuencias se dejan con tres decimales en los dos idiomas y, en la versión inglesa, se traducen las frases fijas */
const CTRY={"Canarias":"Canary Is.","Grecia":"Greece","Japón":"Japan","Chequia":"Czechia","Sicilia":"Sicily","EE. UU.":"USA","Alemania":"Germany","Italia":"Italy","Francia":"France","Reino Unido":"UK","Inglaterra":"England","España":"Spain","Países Bajos":"Netherlands","Bélgica":"Belgium","Suiza":"Switzerland","Polonia":"Poland","Suecia":"Sweden","Noruega":"Norway","Finlandia":"Finland","Rusia":"Russia","Brasil":"Brazil","Turquía":"Turkey","Dinamarca":"Denmark","Hungría":"Hungary","Rumanía":"Romania","Eslovaquia":"Slovakia","Eslovenia":"Slovenia","Croacia":"Croatia","Ucrania":"Ukraine","Irlanda":"Ireland","Escocia":"Scotland","Canadá":"Canada","Australia":"Australia","Sudáfrica":"South Africa","Argentina":"Argentina","Chile":"Chile","México":"Mexico","Lituania":"Lithuania","Letonia":"Latvia","Estonia":"Estonia","Bulgaria":"Bulgaria","Serbia":"Serbia","Austria":"Austria","Portugal":"Portugal"};
window.ACRACB_tx=t=>{if(!t)return t;let x=String(t).replace(/\b(\d{1,3}\.\d{3})\d+\b/g,"$1");if(window.ACRACB_LANG!=="en")return x;
  x=x.replace(/\bA las (\d\d:\d\d) UTC en /g,"At $1 UTC on ").replace(/\bSpot a las (\d\d:\d\d) UTC en /g,"Spot at $1 UTC on ").replace(/ a las (\d\d:\d\d) UTC/g," at $1 UTC").replace(/\bTambién en /g,"Also on ")
   .replace(/\boíd[ao] en /g,"heard in ").replace(/\(CQ en /g,"(CQ at ").replace(/escucha arriba/g,"listening up").replace(/\bsobre todo\b/g,"mostly").replace(/\by algo de\b/g,"and some")
   .replace(/ hasta el /g," until ").replace(/\bvía\b/g,"via").replace(/\bdesde\b/g,"from").replace(/\bpor\b/g,"by").replace(/Pocas estaciones ibéricas destacadas( en esta ronda)?/g,"Few notable Iberian stations")
   .replace(/ % en el norte de Europa/g," % in northern Europe").replace(/Sin aurora sobre Europa/g,"No aurora over Europe").replace(/ \(([^)]+)\) en (\d+ ?c?m) /g," ($1) on $2 ").replace(/ en (\d+ ?c?m)\b/g," on $1").replace(/ y /g," and ");
  for(const [k,v] of Object.entries(CTRY))x=x.split(k).join(v);return x};
/* 2.8.23: las notas que añade el recolector a cada spot vienen en español; en la versión inglesa se traducen al pintarlas */
const cTr=c=>{if(!c)return c;c=window.ACRACB_tx(c);if(window.ACRACB_LANG!=="en")return c;return String(c).replace(/oído por skimmer \(RBN\)/g,"heard by a skimmer (RBN)").replace(/decodificado \(PSK Reporter\)/g,"decoded (PSK Reporter)").replace(/, oída en /g,", heard in ").replace(/ en (\d+ ?c?m) /g," on $1 ").replace(/ con (\d\/\d)/g," with $1")};
const ACTIVE=60;const isAct=a=>a!=null&&isFinite(a)&&a<=ACTIVE;window.ACRACB_isAct=c=>isAct(lastAge(c));
const ageTag=(a,t)=>a!=null||t?`<span class="sc-age" title="${t?e2(t)+" UTC":""}">${ago(a)}</span>`:`<span class="sc-age">${T("sin spots recientes","no recent spots")}</span>`;
/* 2.11.25: los mismos datos, en el mismo orden, en la tarjeta y en la fila desplegada de la vista de lista: quién lo
   publica, split, nota, rumbo y distancia por los dos caminos (como siempre), probabilidad y señal prevista */
function detOf(o){const g=o.geo;let rumbo="",dist="",pr="";
  if(g){rumbo=`<span class="nw">${T("corto","short")} ${g.az}° ${cab(g.az)}<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${g.laz}° ${cab(g.laz)}</span>`;
    dist=`<span class="nw">${T("corto","short")} ${fk(g.km)} km<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${fk(g.lkm!=null?g.lkm:Math.max(0,40030-g.km))} km</span>`}
  if(o.p!=null){pr=`<b>${o.p} %</b>${o.lpb?T(" por el camino largo"," via the long path"):""}`;
    if(o.p0!=null&&o.p-o.p0>=10)pr+=`<span class="note sgn">${T(`Modelo: ${o.p0} %. Lo sube lo que oyen ahora caminos parecidos al tuyo.`,`Model: ${o.p0} %. Raised by what similar paths hear now.`)}</span>`;
    else if(o.p0!=null&&o.p0-o.p>=10)pr+=`<span class="note sgn">${T(`Modelo: ${o.p0} %. Lo baja lo que se oye ahora o lo que has anotado.`,`Model: ${o.p0} %. Lowered by what is heard now or what you noted.`)}</span>`}
  return [[o.byLbl||T("Le oyen","Heard by"),o.by],["Split / QSL",o.xs],[T("Rumbo","Bearing"),rumbo],[T("Distancia","Distance"),dist],[T("Fiabilidad","Reliability"),pr],[T("Señal","Signal"),o.sig||""],[T("Nota","Note"),o.note||""],[T("Estación","Station"),o.sufx||""]].concat(o.secs||[]).filter(([,v])=>v)}
function card(o){
  if(o.call&&o.a==null&&!o.t)o=Object.assign({},o,{a:lastAge(o.call)});
  {const st_=sufTag(o.call);if(st_&&!o.sufx)o=Object.assign({},o,{sufx:`<span class="sfx">${e2(st_[1])}</span>`})}
  if(o.call&&document.documentElement.classList.contains("vl"))return listRow(o);
  const h=`<div class="sc-h"><span class="sc-call">${o.call?stBtn(o.call,o.band):""}</span>${o.call||o.a!=null||o.t?ageTag(o.a,o.t):""}</div>`;
  const fl=[o.f?`<b class="sc-fq" style="color:${BC[o.band]||"inherit"}">${e2(o.f)}</b>`:"",o.mode?mb(o.mode):"",o.band!=null&&BANDS[o.band]?`<span class="sc-b"${o.f?"":` style="color:${BC[o.band]};font-weight:600"`}>${BANDS[o.band]}</span>`:""].concat(o.tags||[]).concat(o.geo?[`<span class="sc-cp">${o.geo.az}° ${cab(o.geo.az)}</span>`]:[]).concat(o.p!=null?[`<span class="sc-cp"><b>${o.p} %</b></span>`]:[]).filter(Boolean);
  const f=fl.length?`<div class="sc-f">${fl.join("")}</div>`:"";
  const D=detOf(o);
  const ohd=o.oh&&o.oh.b!=null&&o.oh.b<10?` data-ohc="1" data-t="${e2(o.oh.t)}" data-b="${o.oh.b}" data-call="${e2(o.oh.call)}" data-mode="${e2(o.oh.mode||"")}" data-f="${e2(o.f||"")}"`:"";
  const acc=o.call?`${ohd?"":` data-mode="${e2(o.mode||"")}" data-f="${e2(o.f||"")}"`}`:"";
  return `<div class="sc${o.old||(o.call&&(o.a!=null?!isAct(o.a):!o.t))?" old":""}${o.call?" ohc":""}"${ohd}${acc}>${h}${f}<dl class="sc-d">${D.map(([l,v])=>sec(l,v)).join("")}</dl>${window.ACRACB_ohBox&&o.call&&(o.a!=null?isAct(o.a):!!o.t)?ACRACB_ohBox(o.oh||{call:SK(o.call),b:o.band!=null&&o.band<10?o.band:null,mode:o.mode||""}):""}</div>`}
window.ACRACB_card=o=>card(o);
/* 2.10.31: vista de lista: una fila por estación con las columnas alineadas (como un clúster web, pero con más datos),
   en todos los listados que usan la tarjeta de estación. Al tocar la fila se despliegan los detalles. Vale con la vista
   completa y con la compacta. */
function listRow(o){const strip0=h=>String(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();const g=o.geo,old=o.old||(o.a!=null?!isAct(o.a):!o.t);
  /* 2.10.35: fila alineada como un clúster web (URE): una columna por dato, números a la derecha, lo que no cabe se corta
     con «…» y se ve entero al desplegar la fila (y al pasar el ratón por encima) */
  const ohd=o.oh&&o.oh.b!=null&&o.oh.b<10?` data-ohc="1" data-t="${e2(o.oh.t)}" data-b="${o.oh.b}" data-call="${e2(o.oh.call)}" data-mode="${e2(o.oh.mode||"")}" data-f="${e2(o.f||"")}"`:` data-mode="${e2(o.mode||"")}" data-f="${e2(o.f||"")}"`;
  let rumbo="",dist="";if(g){rumbo=`<span class="nw">${T("corto","short")} ${g.az}° ${cab(g.az)}<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${g.laz}° ${cab(g.laz)}</span>`;dist=`<span class="nw">${T("corto","short")} ${fk(g.km)} km<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${fk(g.lkm!=null?g.lkm:Math.max(0,40030-g.km))} km</span>`}
  const oh=window.ACRACB_ohBox&&(o.a!=null?isAct(o.a):!!o.t)?ACRACB_ohBox(o.oh||{call:SK(o.call),b:o.band!=null&&o.band<10?o.band:null,mode:o.mode||""}):"";
  let en=null;try{en=callEnt(o.call)}catch(_){}
  const cty=en?(en.mm?T("móvil marítimo","maritime mobile"):en.name):"",fu=en&&!en.mm&&en.cc?flagURL(en.cc):"";
  const sa=String(ago(o.a)||"").replace(/^hace\s+/,"").replace(/\s+ago$/,"").replace(/^más de un día$/,T("+1 día","1 d+")).replace(/^over a day$/,"1 d+");
  const byc=[...String(o.by||"").matchAll(/data-call="([^"]+)"/g)].map(m=>m[1]);const byTx=byc.length?byc[0]+(byc.length>1?` +${byc.length-1}`:""):String(o.by||"").replace(/<[^>]+>/g,"");
  const strip=h=>String(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  /* 2.11.11: sin la etiqueta que repite el país (p. ej. «Móvil marítimo» junto a «móvil marítimo») */
  /* 2.11.99: lo que dice el sufijo del indicativo (/P, /M, /MM…), como información adicional en una fila «Estación», solo si lo lleva */
  {const st_=sufTag(o.call);if(st_)o=Object.assign({},o,{sufx:`<span class="sfx">${e2(st_[1])}</span>`})}
  const ctyL=String(cty||"").toLowerCase();o=Object.assign({},o,{tags:(o.tags||[]).filter(t=>!ctyL||strip0(t).toLowerCase()!==ctyL)});
  const com=(o.tags||[]).join("")+(o.xs?`<span class="l-ct">${o.xs}</span>`:"")+(o.note?`<span class="l-ct">${e2(o.note)}</span>`:"");
  const comT=[strip((o.tags||[]).join(" · ")),strip(o.xs),o.note||""].filter(Boolean).join(" · ");
  return `<div class="sc scl ohc${old?" old":""}"${ohd}>`+
    `<span class="l-age" title="${o.t?e2(o.t)+" UTC":""}">${e2(sa)}</span>`+
    `<span class="l-f">${o.f?`<b style="color:${BC[o.band]||"inherit"}">${e2(o.f)}</b>`:""}</span>`+
    `<span class="l-m">${o.mode?mb(o.mode):""}</span>`+
    `<span class="l-b" style="color:${BC[o.band]||"inherit"}">${o.band!=null&&BANDS[o.band]?BANDS[o.band].replace(" ",""):""}</span>`+
    `<span class="l-call"><span class="stc sc-call" data-stc="${e2(SK(o.call))}" data-stb="${o.band!=null&&o.band<10?o.band:""}"><span class="cs" data-call="${e2(o.call)}">${e2(o.call)}</span></span></span>`+
    `<span class="l-cty" title="${e2(cty)}">${fu?`<img class="fl" src="${fu}" alt="" width="18" height="12">`:""}${e2(cty)}</span>`+
    `<span class="l-tags" title="${e2(comT)}">${com}</span>`+
    `<span class="l-by" title="${e2(byc.join(", "))}">${e2(byTx)}</span>`+
    `<span class="l-az">${g?`${g.az}° ${cab(g.az)}`:""}</span>`+
    `<span class="l-km">${g?fk(g.km):""}</span>`+
    `<span class="l-p">${o.p!=null?`<b>${o.p}</b>%`:""}</span>`+
    `<span class="l-oh">${oh}</span>`+
    `<span class="l-x" aria-hidden="true"></span>`+
    /* 2.10.39: lo desplegado, en fichas que llenan el ancho (antes una columna estrecha); el comentario solo si hay texto
       libre, porque las etiquetas ya se ven en la fila */
    `<div class="sc-d ld">${detOf(o).map(([l,v])=>`<div class="ldi"><span class="ldl">${l}</span><div class="ldv">${v}</div></div>`).join("")}</div>`+
    (oh?`<div class="l-ohx">${oh}</div>`:"")+`</div>`}
/* 2.11.2: quién publicó el spot (los indicativos que lo anunciaron) y en qué red: clúster DX (Spothole o HamQTH) o Reverse Beacon */
function pubBy(s){const b=CSL(s.by,", ");const V={RBN:"Reverse Beacon",Spothole:"Spothole",HamQTH:"HamQTH",POTA:"POTA",SOTA:"SOTA"};
  const v=[...new Set((s.src||[]).map(x=>V[x]||x))];return b+(v.length?` <span class="sc-via">${T("vía","via")} ${e2(v.join(", "))}</span>`:"")}
window.ACRACB_listHead=()=>`<div class="sclh" aria-hidden="true"><span class="l-age">${T("Hace","Ago")}</span><span class="l-f">${T("Frec.","Freq.")}</span><span class="l-m">${T("Modo","Mode")}</span><span class="l-b">${T("Banda","Band")}</span><span class="l-call">DX</span><span class="l-cty">${T("País","Country")}</span><span class="l-tags">${T("Comentario","Comment")}</span><span class="l-by">${T("Publica","Spotter")}</span><span class="l-az">${T("Rumbo","Bearing")}</span><span class="l-km">km</span><span class="l-p">QSO</span><span class="l-oh"></span><span class="l-x"></span></div>`;
/* 2.4.4: «Qué hacer»: cada estación recomendada en una tarjeta como las del resto de la plataforma:
   frecuencia, modo, banda, rumbo y distancia por el camino corto y el largo, y la probabilidad de QSO */
const inBand=(f,b)=>{const m=MHZ[b];return m&&isFinite(f)&&Math.abs(f-m)/m<.12};
function recCards(go,dxn){const out=[];
  /* 2.11.29: la misma estación anunciada varias veces en la misma banda sale una sola vez, con el spot más reciente */
  {const m=new Map();for(const x of (go||[])){const k=SK(x.s.call)+"|"+x.s.band,y=m.get(k);if(!y||(x.a!=null&&(y.a==null||x.a<y.a)))m.set(k,x)}go=(go||[]).filter(x=>m.get(SK(x.s.call)+"|"+x.s.band)===x).slice(0,3)}
  (go||[]).forEach(({s,e,a})=>{const st=splitTags(s);const sp=spotProb(s,e,a);const tg=[`<span class="xtag xr">${T("Clúster","Cluster")}</span>`].concat(st.pr);
    out.push(card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tg,byLbl:T("Publicado por","Spotted by"),by:pubBy(s),xs:st.xs,geo:geoOf(s.dx),p:Math.round(sp.p*100),p0:Math.round(sp.p0*100),lpb:sp.lp,oh:e.t?{t:e.t.id,b:s.band,call:s.call,mode:modeOf(s)}:null,sig:(()=>{try{return sigRow(s,e,sp)}catch(_){return ""}})(),
      note:/up|arriba|split/i.test(s.c||"")?T("Escucha arriba: trabaja en split.","Listen up: working split."):""}))});
  /* 2.5.6: solo las DXpediciones que trabajan en alguno de tus modos (el de tu estación y los añadidos en el clúster) */
  let my=new Set();try{CMS().forEach(k=>my.add(String(MODES[k].s).toUpperCase()))}catch(_){}
  const inMy=d=>{const m=Array.isArray(d.modes)?d.modes.map(z=>String(z).toUpperCase()):[];return !m.length||!my.size||m.some(z=>my.has(z)||(z==="JS8"&&my.has("JS8CALL")))};
  (dxn||[]).filter(x=>inMy(x.d)&&isAct(lastAge(String(x.d.call||"").split(/[ ,]/)[0]))).forEach(x=>{const d=x.d;let call=String(d.call||"").split(/[ ,]/)[0];let f="",mode="";
    /* 2.11.45: si el aviso solo trae el prefijo (por ejemplo «3B8»), se usa el indicativo completo del spot más reciente
       que empieza por él, con su frecuencia y su modo; sin eso la tarjeta no decía dónde escuchar */
    let spx=null;if(!/\d[A-Z]{1,4}(\/[A-Z0-9]+)?$/i.test(call)){const c0=call.toUpperCase();const cand=(L.spots||[]).filter(z=>z.call&&String(z.call).toUpperCase().startsWith(c0)).sort((a,b)=>String(b.utc||b.t).localeCompare(String(a.utc||a.t)));spx=cand.find(z=>z.band===x.b)||cand[0]||null;if(spx){call=spx.call;if(spx.band!==x.b)x={...x,b:spx.band}}
      /* 2.11.67: sin indicativo completo (ni en el aviso ni en ningún spot) no se recomienda: no se sabe a quién llamar ni en qué modo */
      else return}
    const q=[].concat(d.qsx||[]).map(z=>String(z).match(/(\d+(?:\.\d+)?)\s*([A-Z0-9]+)?/i)).filter(Boolean).map(m=>({f:+m[1]>1000?+m[1]/1000:+m[1],m:(m[2]||"").toUpperCase()})).filter(z=>inBand(z.f,x.b));
    let my="";try{my=String(MOD()||"").toUpperCase()}catch(e){}const pick=q.find(z=>z.m&&my&&z.m===my)||q[0];
    /* 2.10.19: con «Mi modo» solo se recomienda una frecuencia de tus modos (antes podía salir FT8 con «Mi modo · SSB») */
    const MS0=new Set();try{CMS().forEach(k=>MS0.add(String(MODES[k].s).toUpperCase()))}catch(_){}const okM=m=>{if(!m)return true;const u=String(m).toUpperCase();return !MS0.size||MS0.has(u)||((u==="USB"||u==="LSB")&&MS0.has("SSB"))||(u==="JS8"&&MS0.has("JS8CALL"))};
    const pick2=q.filter(z=>okM(z.m));const pk=pick2.find(z=>z.m&&my&&z.m===my)||pick2[0];
    if(pk){f=pk.f.toFixed(3);mode=pk.m}
    else{const sp=spx&&okM(spx.mode||"")?spx:((L.spots||[]).filter(z=>z.call&&z.call.toUpperCase()===call.toUpperCase()&&z.band===x.b&&okM(z.mode||""))[0]||(()=>{try{return dxSpots(d).find(o=>o.band===x.b&&okM(o.mode||""))||null}catch(_){return null}})());if(sp){f=sp.f;mode=sp.mode||""}else if(q.length)return}
    const MYS=new Set();try{CMS().forEach(k=>MYS.add(String(MODES[k].s).toUpperCase()))}catch(_){}
    let hab=false;if(!mode&&Array.isArray(d.modes)&&d.modes.length){const mm=d.modes.map(z=>String(z).toUpperCase());mode=mm.includes(my)?my:(mm.find(z=>MYS.has(z))||(mm.includes("SSB")&&!/CW|FT/.test(my)?"SSB":mm[0]))}
    /* sin QSX ni spot en esa banda: la frecuencia habitual de las DXpediciones en ese modo */
    if(!f&&mode){const H={SSB:[1.845,3.790,7.090,14.195,18.145,21.295,24.945,28.495,null,null,50.110],CW:[1.826,3.523,7.023,14.023,18.073,21.023,24.893,28.023,5.354,10.106,50.090],
      FT8:[1.840,3.573,7.074,14.074,18.100,21.074,24.915,28.074,5.357,10.136,50.313],FT4:[1.840,3.575,7.047,14.080,18.104,21.140,24.919,28.180,null,10.140,50.318],
      RTTY:[1.838,3.580,7.040,14.083,18.105,21.083,24.925,28.083,null,10.140,50.300]};const v=(H[mode]||[])[x.b];if(v){f=v.toFixed(3);hab=true}}
    /* 2.11.45: sin modo conocido ni spots en esa banda, la frecuencia habitual en tu modo; si hay spots, pero en otro modo,
       o no hay forma de saber la frecuencia, la tarjeta no sale (no diría dónde escuchar) */
    let mguess=false;if(!f&&!mode&&my&&!(L.spots||[]).some(z=>z.call&&z.call.toUpperCase()===call.toUpperCase()&&z.band===x.b)){mguess=true;const H2={SSB:[1.845,3.790,7.090,14.195,18.145,21.295,24.945,28.495,null,null,50.110],CW:[1.826,3.523,7.023,14.023,18.073,21.023,24.893,28.023,5.354,10.106,50.090],FT8:[1.840,3.573,7.074,14.074,18.100,21.074,24.915,28.074,5.357,10.136,50.313]};const v=(H2[my]||[])[x.b];if(v){f=v.toFixed(3);mode=my;hab=true}}
    if(!f)return;
    /* 2.11.66: si no se han anunciado sus modos, se dice: la frecuencia es la habitual de TU modo, no la suya */
    const tg=[`<span class="xtag xs dxpt">${T("DXpedición","DXpedition")}</span>`].concat(mguess?[`<span class="tag">${T("modo sin anunciar","mode not announced")}</span>`]:[]);
    let pp=x.p,plp=!!x.lp;try{const mk=Object.keys(MODES).find(z=>String(MODES[z].s).toUpperCase()===String(mode).toUpperCase());const ex=mk?MODES[mk].adj-MD().adj:0;
      const t=tFor(d),lh=localNow();if(ex&&t){const a1=prob(t,lh,x.b,false,ex).p,a2=t.l?prob(t,lh,x.b,true,ex).p:0;plp=a2>a1&&a2>=.05;pp=plp?a2:a1}}catch(_){}
    /* 2.11.96: también la fila «Señal» en las DXpediciones de «Qué hacer ahora», como en el resto de tarjetas */
    let sgD="";try{if(isFinite(d.lon)&&isFinite(d.lat)){const ss={call,band:x.b,mode,f:String(f),dx:[d.lon,d.lat],kind:"dx",from:[]};const e=spotEval(ss,localNow());sgD=sigRow(ss,e,{lp:plp,p:pp})}else sgD=sigWhy({band:x.b},null,{})}catch(_){}
    out.push(card({call,f,band:x.b,mode,tags:tg,geo:isFinite(d.lon)&&isFinite(d.lat)?geoOf([d.lon,d.lat]):null,p:Math.round(pp*100),lpb:plp,sig:sgD,oh:(()=>{try{const t=tFor(d);return t?{t:t.id,b:x.b,call,mode}:null}catch(_){return null}})(),
      note:[mguess?T(`No se ha anunciado en qué modos trabaja: puede que no esté en ${mode}. Es la frecuencia habitual de ${mode}; confírmala en el clúster.`,`Its modes have not been announced: it may not be on ${mode}. This is the usual ${mode} frequency; check the cluster.`):hab?T("Frecuencia habitual de las DXpediciones en este modo: confírmala en el clúster.","Usual DXpedition frequency for this mode: check the cluster."):"",d.until?T("Activa hasta el "+e2(d.until)+".","Active until "+e2(String(d.until).replace(/\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b/g,m=>({ene:"Jan",feb:"Feb",mar:"Mar",abr:"Apr",may:"May",jun:"Jun",jul:"Jul",ago:"Aug",sep:"Sep",oct:"Oct",nov:"Nov",dic:"Dec"})[m]))+"."):""].filter(Boolean).join(" ")}))});
  return out.length?`<div class="alc reccards">${out.join("")}</div>`:""}
window.ACRACB_recCards=recCards;
/* 2.6.4: «¿Lo oyes?» en las tarjetas de estaciones activas. Tu escucha de esa estación concreta (banda, hora, modo y, si quieres,
   la lectura del S-metro) entra en la calibración de tu estación y, durante 45 minutos, es la prueba más fuerte para esa zona:
   si la oyes, el camino está abierto; si no la oyes, su probabilidad baja. */

const ohKey=o=>o.call+"|"+o.b;
function lastOwn(call,b,dir){dir=dir||"rx";try{for(let i=OBS.length-1;i>=0;i--){const o=OBS[i];if(o.call===call&&(b==null||o.b===b)&&(o.dir||"rx")===dir)return o}}catch(_){}return null}
window.ACRACB_ohBox=oh=>{if(oh.b!=null&&oh.b>=10)return "";if(oh.b===""||oh.b===undefined)oh=Object.assign({},oh,{b:null});const last=lastOwn(oh.call,oh.b),tx=lastOwn(oh.call,oh.b,"tx");
  const bb=o=>oh.b==null&&o&&BANDS[o.b]?" · "+BANDS[o.b]:"";
  const st=last?(last.h?`<span class="ohs y">${T("Lo oyes","You hear it")}${bb(last)}${last.r!=null?" · R"+last.r:""}${last.s!=null?" · "+sTxt(last.s):""}${last.db!=null?" · "+(last.db>0?"+":"")+last.db+" dB":""}</span>`:`<span class="ohs n">${T("No lo oyes","You don't hear it")}${bb(last)}</span>`):"";
  return `<div class="ohbox"><div class="ohr"><button type="button" class="ohq" data-ohq data-t="${e2(oh.t||"")}" data-b="${oh.b==null?"":oh.b}" data-call="${e2(oh.call)}" data-mode="${e2(oh.mode||"")}">${T("¿Lo oyes?","Do you hear it?")}</button>${st}${tx?(tx.h?`<span class="ohs y">${T("Te oyen","They hear you")}${bb(tx)}${tx.r!=null?" · R"+tx.r:""}${tx.s!=null?" · "+sTxt(tx.s):""}${tx.db!=null?" · "+(tx.db>0?"+":"")+tx.db+" dB":""}</span>`:`<span class="ohs n">${T("No te oyen","They don't hear you")}${bb(tx)}</span>`):""}<button type="button" class="ohsp" data-spot="${e2(oh.call)}" title="${T("Anunciar este spot en los clústeres","Post this spot to the clusters")}">${window.ACRACB_spotIcon||""}<span>${T("Anunciar","Spot it")}</span></button></div></div>`};
/* diálogo «¿Lo oyes?»: se abre solo al tocar el texto «¿Lo oyes?» de la tarjeta (2.8.16) */
const VOICE=m=>/^(SSB|USB|LSB|AM|FM|PHONE)?$/i.test(String(m||"").trim());
const RTXT={1:["ilegible","unreadable"],2:["apenas","barely"],3:["con esfuerzo","with effort"],4:["casi sin problema","almost perfect"],5:["perfecto","perfect"]};
let DLG=null;
/* parte de reporte según el modo: R y S en fonía y CW; dB del programa en digitales */
function repHTML(o,voice,cw){const dig=!voice&&!cw;let x="";
  if(voice||cw)x+=`<div class="ohd-r" role="group" aria-label="${T("Legibilidad (R)","Readability (R)")}"><span class="smt">${T("¿Cómo se entiende? (R)","How readable? (R)")}</span><div class="rrow">${[1,2,3,4,5].map(r=>`<button type="button" data-rr="${r}" data-o="${e2(o.at)}" aria-pressed="${o.r===r}"><b>R${r}</b><small>${T(RTXT[r][0],RTXT[r][1])}</small></button>`).join("")}</div></div>`;
  x+=dig?`<div class="ohd-db" role="group" aria-label="${T("Señal en dB del programa","Signal in dB from the software")}"><span class="smt">${T("¿Qué señal da el programa?","What does the software report?")} (<span class="nu">dB</span>)</span><div class="dbrow">${DBV.map((v,i)=>`<button type="button" data-db="${v}" data-o="${e2(o.at)}" aria-pressed="${o.db===v}" style="--i:${i}">${v>0?"+"+v:v}</button>`).join("")}</div></div>`:ACRACB_smeter(o);
  return x}
const isDxp=call=>{try{const c=String(call||"").toUpperCase();return (L.dx||[]).some(d=>String(d.call||"").toUpperCase().split(/[\s,/]+/).includes(c)||String(d.call||"").toUpperCase().includes(c))}catch(_){return false}};
function dlgHTML(d,inl){const last=lastOwn(d.call,d.b),tx=lastOwn(d.call,d.b,"tx");const voice=VOICE(d.mode),cw=/^CW$/i.test(String(d.mode||"").trim());
  const ico={y:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',n:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>'};
  const h=last&&last.h,n=last&&!last.h,th=tx&&tx.h,tn=tx&&!tx.h,dxp=isDxp(d.call);
  let x=(inl?"":`<div class="ohd-h"><div><div class="ohd-t">${T("¿Oyes a","Do you hear")} <b>${e2(d.call)}</b>?</div><div class="ohd-s">${[d.f,d.mode,BANDS[d.b]].filter(Boolean).map(e2).join(" · ")}</div></div><button type="button" class="ohd-x" data-ohx aria-label="${T("Cerrar","Close")}">×</button></div>`)+`   <div class="ohd-b"><button type="button" class="ohbig y" data-oh="1" aria-pressed="${!!h}">${ico.y}<span>${T("Lo oigo","I hear it")}</span></button><button type="button" class="ohbig n" data-oh="0" aria-pressed="${!!n}">${ico.n}<span>${T("No lo oigo","I don't hear it")}</span></button></div>`;
  if(h)x+=repHTML(last,voice,cw);
  /* 2.6.7: «¿Te ha oído?», el otro sentido del camino (tu transmisión) */
  x+=`<div class="ohd-sec"><div class="ohd-st">${T("¿Te ha oído?","Did it hear you?")}</div>
   <div class="ohd-b"><button type="button" class="ohbig y sm" data-tx="1" aria-pressed="${!!th}">${ico.y}<span>${T("Me oyen","They hear me")}</span></button><button type="button" class="ohbig n sm" data-tx="0" aria-pressed="${!!tn}">${ico.n}<span>${T("No me oyen","They don't hear me")}</span></button></div>`;
  if(th)x+=dxp?`<p class="note ohd-n">${T("Las DXpediciones casi siempre dan 59 o 599: cuenta que te han oído, sin reporte.","DXpeditions almost always give 59 or 599: what counts is that they heard you, without a report.")}</p>`:`<p class="note ohd-n2">${T("Reporte que te han dado:","Report you were given:")}</p>`+repHTML(tx,voice,cw);
  x+=`</div>`;
  x+=`<p class="note ohd-n">${T("«Lo oigo» ajusta tu recepción y «Me oyen» tu transmisión. Durante 45 minutos, las dos cambian el porcentaje de esa zona.","«I hear it» tunes your reception and «They hear me» your transmission. For 45 minutes, both change the chance for that area.")}</p>`;
  {const lo=[last,tx].filter(Boolean).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at))[0];if(lo){const m=Math.max(0,Math.round((Date.now()-Date.parse(lo.at))/6e4)),se=lo.se||{};
    const pt=[se.loc,se.w?se.w+" W":"",se.a].filter(Boolean).map(e2).join(" · ");
    x+=`<p class="note ohd-se">${T("Anotado","Logged")} ${ago(m)}${pt?` ${T("con","with")} <span class="nw">${pt}</span>`:""}. ${T("Se guarda hasta que anotes algo nuevo.","It is kept until you log something new.")}</p>`}}
  if(!inl&&(last||tx))x+=`<div class="ohd-f"><button type="button" class="btn ohd-ok" data-ohx>${T("Listo","Done")}</button></div>`;
  return x}
function openDlg(d){DLG=d;let w=document.getElementById("ohdlg");if(!w){w=document.createElement("div");w.id="ohdlg";w.className="ohdlg";w.innerHTML='<div class="ohd-bg" data-ohx></div><div class="ohd-c" role="dialog" aria-modal="true"></div>';document.body.appendChild(w)}
  w.querySelector(".ohd-c").innerHTML=dlgHTML(d);w.hidden=false;document.documentElement.classList.add("ohopen");setTimeout(()=>{const b=w.querySelector("[data-oh]");b&&b.focus()},30)}
function closeDlg(){const w=document.getElementById("ohdlg");if(w)w.hidden=true;document.documentElement.classList.remove("ohopen");DLG=null}
function redraw(){if(DLG){const w=document.getElementById("ohdlg");if(w&&!w.hidden)w.querySelector(".ohd-c").innerHTML=dlgHTML(DLG)}}
window.ACRACB_dlgRedraw=redraw;
function seNow(){const o={};try{o.loc=String($("loc").value||"").slice(0,6).toUpperCase()}catch(_){}try{const w=+$("eq").value;if(w)o.w=w}catch(_){}try{const a=$("antsel"),op=a&&a.selectedOptions&&a.selectedOptions[0];if(op)o.a=op.textContent.trim()}catch(_){}return o}
function addOwn(tid,b,call,mode,heard,dir){dir=dir||"rx";const RX=dir==="rx";const t=T0(tid);if(!t)return;const lh=localNow();let ex=0;try{const k=spotMode({mode});ex=((MODES[k]&&MODES[k].adj)||0)-MD().adj}catch(_){}
  const lp=RX?t.l&&prob(t,lh,b,true,"rx").p>prob(t,lh,b,false,"rx").p:t.l&&prob(t,lh,b,true).p>prob(t,lh,b,false).p;const M=marg(t,lh,b,lp,RX);if(!M)return;
  const prev=b==null?null:lastOwn(call,b,dir);if(prev&&Date.now()-Date.parse(prev.at)<15*6e4){const i=OBS.indexOf(prev);if(i>=0)OBS.splice(i,1)}
  OBS.push({k:calKey(),t:tid,b,lh,h:heard?1:0,m:Math.round(M.m*10)/10,dl:M.DL,du:M.DU,thr:M.thr-ex,at:new Date().toISOString(),call,src:"tarjeta",dir,se:seNow(),...(!RX&&!heard?{w:.35}:{}),...(!RX&&isDxp(call)?{dxp:1}:{})});if(OBS.length>600)OBS=OBS.slice(-600);
  dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();rebox();redraw();try{renderPop()}catch(_){}}
/* vuelve a pintar los recuadros «¿Lo oyes?» que sigan en pantalla (aviso de portada incluido) */
function rebox(){try{renderAlBar()}catch(_){}document.querySelectorAll(".ohbox").forEach(bx=>{const q=bx.querySelector("[data-ohq]");if(!q)return;bx.outerHTML=ACRACB_ohBox({t:q.dataset.t,b:q.dataset.b===""?null:+q.dataset.b,call:q.dataset.call,mode:q.dataset.mode})})}
window.ACRACB_rebox=rebox;
const T0=id=>{try{return TG().find(t=>t.id===id)}catch(_){return null}};
const ctxD=el=>{const c=el.closest(".ohin");return c?dOf(c):DLG};
/* 2.7.6: en las ventanas del mapa, el mismo «¿Lo oyes? / ¿Te ha oído?» que en las tarjetas, con sus dos escalas */
function ohInline(d){return `<div class="ohin" data-t="${e2(d.t)}" data-b="${d.b}" data-call="${e2(d.call)}" data-mode="${e2(d.mode||"")}" data-f="${e2(d.f||"")}"><div class="ohin-t">${T("¿Lo oyes?","Do you hear it?")} <span class="ohin-s">${[d.f,d.mode,BANDS[d.b]].filter(Boolean).map(e2).join(" · ")}</span></div>${dlgHTML(d,true)}</div>`}
window.ACRACB_ohInline=ohInline;
(function(){let n=0;const h=setInterval(()=>{if(typeof calBtns==="function"&&!window.__hkOh){window.__hkOh=1;const o=calBtns;const w=function(t){try{if(!t)return o.apply(this,arguments);const P=st.pop;let call=null,b=null,mode="",f="";
    if(P&&P.k==="s"){const s=(typeof MSPOTS==="function"?MSPOTS():SPOTS())[P.i];const e=s&&spotEval(s,st.mhour);const tf=s?tFor(s):null;if(s&&((e&&e.t&&e.t.id===t.id)||(tf&&tf.id===t.id))){call=s.call;b=s.band;mode=modeOf(s);f=s.f}}
    else if(P&&P.k==="d"){const d=L.dx[P.i];if(d&&tFor(d)&&tFor(d).id===t.id)call=dxTok(d.call)[0]||d.call}
    if(b==null)b=st.mband>=0?st.mband:bestAny(t,st.mhour).b;if(b==null||b<0||b>=10)return o.apply(this,arguments);
    if(!call)call=t.name;if(!mode){try{mode=MD().s}catch(_){}}
    return ohInline({t:t.id,b,call,mode,f})+`<div class="acts"><button class="btn" data-goz="${e2(t.id)}">${T("Ficha completa","Full details")}</button></div>`}catch(e){return o.apply(this,arguments)}};
  w.__oh=1;try{calBtns=w}catch(e){window.calBtns=w}clearInterval(h)}else if(++n>100)clearInterval(h)},100)})();
const dOf=el=>({t:el.dataset.t,b:+el.dataset.b,call:el.dataset.call,mode:el.dataset.mode,f:el.dataset.f||((el.closest(".sc")||{}).dataset||{}).f||""});
const ohClick=ev=>{const tg=ev.target;if(!tg.closest)return;
  if(tg.closest("[data-ohx]")){closeDlg();return}
  const h=tg.closest("#ohdlg [data-oh],.ohin [data-oh]");if(h){const D=ctxD(h);if(D)try{addOwn(D.t,D.b,D.call,D.mode,h.dataset.oh==="1")}catch(e){console.error(e)}return}
  const tx=tg.closest("#ohdlg [data-tx],.ohin [data-tx]");if(tx){const D=ctxD(tx);if(D)try{addOwn(D.t,D.b,D.call,D.mode,tx.dataset.tx==="1","tx")}catch(e){console.error(e)}return}
  const dbb=tg.closest("[data-db]");if(dbb){try{const o=OBS.slice().reverse().find(x=>x.at===dbb.dataset.o);if(o){const v=+dbb.dataset.db;if(o.db===v)delete o.db;else o.db=v;const s=obsSnr(o);if(s!=null)o.snr=Math.round(s*10)/10;else delete o.snr;dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();rebox();redraw();try{renderPop()}catch(_){}}}catch(e){console.error(e)}return}
  const rr=tg.closest("[data-rr]");if(rr){try{const o=OBS.slice().reverse().find(x=>x.at===rr.dataset.o);if(o){const v=+rr.dataset.rr;if(o.r===v)delete o.r;else o.r=v;const s=obsSnr(o);if(s!=null)o.snr=Math.round(s*10)/10;else delete o.snr;dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();rebox();redraw();try{renderPop()}catch(_){}}}catch(e){console.error(e)}return}
  const q=tg.closest("[data-ohq]");if(q){let d=null;if(q.dataset.t&&q.dataset.b!==""){d=dOf(q)}else{const c=q.closest(".sc");if(c)d=dCard(c)}if(d)openDlg(d);return}};
/* 2.7.6: la ventana del mapa no deja pasar los clics: lo de dentro de «.ohin» se atiende antes, en captura */
document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest(".ohin"))return;ohClick(ev)});
document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest(".ohin")&&!ev.target.closest("[data-smt]")){ohClick(ev);ev.stopPropagation()}},true);
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&DLG){closeDlg();return}});
/* tus escuchas recientes de una zona y banda: la prueba más fuerte (45 minutos) */
window.ACRACB_own=(tid,dx,b,dir)=>{dir=dir||"rx";try{const lim=Date.now()-45*6e4;let best=null;for(let i=OBS.length-1;i>=0;i--){const o=OBS[i];if(!o.call||o.b!==b||(o.dir||"rx")!==dir)continue;const at=Date.parse(o.at);if(at<lim)break;
    let same=o.t===tid;if(!same&&dx){const t=T0(o.t);same=t&&distJS([t.lon,t.lat],dx)<1200}if(same){best=o;break}}
  if(!best)return null;const w=Math.exp(-(Date.now()-Date.parse(best.at))/(45*6e4));const fs=best.s===0?(best.r!=null?.2+.12*best.r:.3):best.s!=null?Math.max(.2,Math.min(1,(best.s<=9?best.s:9+(best.s-9)/10)/10.5)):.6;return {h:!!best.h,w,fs}}catch(_){return null}};
/* 2.6.0: lectura del S-metro al pulsar «Lo oigo». S9 = −73 dBm y 6 dB por punto S; por encima, S9 + dB.
   La lectura menos el ruido típico de la banda en un entorno rural (más el ruido de tu entorno que hayas puesto en la estación)
   da la relación señal/ruido que de verdad tuviste, y la calibración la usa además de «lo oigo / no lo oigo». */
const SVAL=[0,1,2,3,4,5,6,7,8,9,14,19,29,39,49,59,69];
const sTxt=v=>v<=9?"S"+v:"S9+"+(v-9);window.ACRACB_sTxt=sTxt;window.ACRACB_sLbl=v=>T(" con <b>"," at <b>")+sTxt(v)+"</b>";
const sDbm=v=>v<=9?-73-6*(9-v):-73+(v-9);
const NRUR=[-100,-105,-110,-120,-123,-125,-127,-129,-108,-115,-131];
/* VOACAP trabaja en dB-Hz: la relación en 2,4 kHz se pasa sumando 33,8 dB; una señal que apenas asoma sobre el ruido cuenta como 3 dB */
/* R (legibilidad, solo fonía): R1 ≈ 0 dB, R2 ≈ 3, R3 ≈ 6, R4 ≈ 10 y R5 ≈ 15 dB de relación en 2,4 kHz. Con S y R se promedian. */
const RSNR={1:0,2:3,3:6,4:10,5:15};
/* modos digitales: la relación señal/ruido que da el programa (FT8, FT4, RTTY…), ya en un ancho de unos 2,5 kHz */
const DBV=[-24,-20,-15,-10,-5,0,5,10,20];
/* 2.7.0: S0 = la aguja no se mueve: el S-metro no informa y manda la legibilidad R; sin R, señal justa (3 dB) */
function obsSnr(o){if(o.dxp)return null;const v=[];if(o.s===0&&o.r==null&&o.db==null)v.push(3);if(o.s!=null&&o.s>0){const n=NRUR[o.b];if(n!=null){let pen=0;try{if(o.dir!=="tx")pen=localNoisePen(o.b,o.lh)}catch(_){}v.push(Math.max(3,sDbm(o.s)-(n+pen)))}}if(o.r!=null&&RSNR[o.r]!=null)v.push(RSNR[o.r]);if(o.db!=null)v.push(o.db);return v.length?v.reduce((a,b)=>a+b,0)/v.length+33.8:null}
window.ACRACB_smeter=last=>{const cur=last.s;return `<div class="smeter" role="group" aria-label="${T("Lectura del S-metro","S-meter reading")}"><span class="smt">${T("¿Con qué señal?","What signal?")}</span><div class="smb">${SVAL.map((v,i)=>`<button type="button" data-smt="${v}" data-o="${e2(last.at)}" aria-pressed="${cur===v}" style="--i:${i}">${v<=9?v:"+"+(v-9)}</button>`).join("")}</div></div>`};
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-smt]");if(!b)return;try{const o=OBS.slice().reverse().find(x=>x.at===b.dataset.o);if(!o)return;const v=+b.dataset.smt;
  if(o.s===v)delete o.s;else o.s=v;{const s=obsSnr(o);if(s!=null)o.snr=Math.round(s*10)/10;else delete o.snr}dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();try{renderPop()}catch(_){}try{renderInfo()}catch(_){}try{ACRACB_rebox()}catch(_){}try{redraw()}catch(_){}}catch(e){console.error(e)}},true);
/* 2.5.9: «Mi modo / Todos los modos» en «Qué hacer» y casilla «Todos los modos» en la estación: las dos cosas van sincronizadas */
const allOn=()=>{try{return CMS().length===Object.keys(MODES).length}catch(_){return false}};
/* 2.10.19: tres estados claros: solo tu modo, todos, o una mezcla elegida en el clúster o el mapa (se dice cuál) */
const mineOn=()=>{try{const c=CMS();return c.length===1&&c[0]===MOD()}catch(_){return false}};
window.ACRACB_recModes=()=>{const on=allOn(),mine=!on&&mineOn();let my="";try{my=MODES[MOD()].s}catch(_){}let mix="";if(!on&&!mine){try{mix=CMSTXT()}catch(_){}}
  return `<div class="recm seg" role="group" aria-label="${T("Modos","Modes")}"><button type="button" data-recm="0" aria-pressed="${mine}">${T("Mi modo","My mode")}${my?" · "+e2(my):""}</button><button type="button" data-recm="1" aria-pressed="${on}">${T("Todos los modos","All modes")}</button></div>`+(mix?`<p class="note recmix">${T("Ahora ves","Now showing")}: ${e2(mix)}</p>`:"")};
/* 2.11.52: lo elegido en una sección ya no cambia el modo de arriba */
function syncAll(){return;const m=document.getElementById("modesel");if(!m)return;const a=allOn();
  if(a&&m.value!=="all"){m.value="all";try{store.set("c_modesel","all")}catch(_){}}
  else if(!a&&m.value==="all"){let b="ssb";try{b=MOD()}catch(_){}m.value=b;try{store.set("c_modesel",b)}catch(_){}}}
/* 2.10.20: elegir en la lista un modo concreto deja solo ese modo; elegir «Todos los modos» los enciende todos */
document.addEventListener("change",ev=>{const m=ev.target;if(!m||m.id!=="modesel")return;
  if(m.value==="all"){if(!allOn()){try{setAllCM(true)}catch(_){}}}
  else{try{store.set("c_modebase",m.value)}catch(_){}try{CACHE.clear()}catch(_){}if(!mineOn()){try{setAllCM(false)}catch(_){}}}
  try{renderSide()}catch(_){}},true);
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-recm]");if(!b)return;const want=b.dataset.recm==="1";
  /* antes se alternaba: con una mezcla de modos, «Mi modo» encendía todos. Ahora cada botón pone exactamente lo que dice */
  if(want?!allOn():!mineOn()){try{setAllCM(want)}catch(_){}}syncAll();try{renderSide()}catch(_){}});

setTimeout(syncAll,600);document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest("[data-mmall],[data-mm]"))setTimeout(syncAll,50)},true);window.ACRACB_geo=geoOf;window.ACRACB_split2=s=>splitTags(s);window.ACRACB_ago=ago;
/* separa las etiquetas de split/QSL (van en su sección) de las de programa (van junto a la frecuencia) */
function splitTags(s){const t=window.ACRACB_tags?ACRACB_tags(s):"";const xs=[],pr=[];(t.match(/<span class="xtag[^"]*"[^>]*>.*?<\/span>/g)||[]).forEach(x=>(/xtag x[sq]\b/.test(x)?xs:pr).push(x));return {xs:xs.join(""),pr}}
/* 2.5.2: probabilidad de QSO de cada spot: equilibrio entre la previsión VOACAP y lo que dicen los clústeres ahora mismo.
   1) Previsión: VOACAP con tu estación (potencia, antenas, altura, cable, entorno, calibración con tu log y la ionosfera de hoy),
      en el MODO del spot (FT8 o CW necesitan bastante menos señal que la SSB).
   2) Realidad del clúster: cada spot de los últimos 45 minutos en la misma banda, de ESA estación o de otra de su misma zona
      (a menos de 1.200 km), cuenta según lo que se parece el trayecto del que lo oye al tuyo: que la señal rebote en la ionosfera
      en la misma zona (puntos medios cercanos) y recorra una distancia parecida. Pesa más si es reciente y con buena señal.
   3) Si a ti te han oído en esa banda cerca de esa estación en los últimos 45 minutos («¿Me oyen?»), el camino va en los dos sentidos.
   Con el camino confirmado, la probabilidad se acerca a lo que permite la señal (del 35 % con señal justa al 85 % con señal fuerte);
   sin spots parecidos manda la previsión, porque que nadie lo anuncie no demuestra que esté cerrado. */
const RD2=Math.PI/180;
const v3=p=>{const la=p[1]*RD2,lo=p[0]*RD2;return [Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la)]};
const mid=(a,b)=>{const x=v3(a),y=v3(b),m=[x[0]+y[0],x[1]+y[1],x[2]+y[2]],n=Math.hypot(...m)||1;return [Math.atan2(m[1],m[0])/RD2,Math.asin(m[2]/n)/RD2]};
const snrF=(s)=>{const m=String(s.c||"").match(/([-+]?\d{1,2})\s*dB/i);if(!m)return .6;const v=+m[1];return /FT|JT|JS8|FSK|PSK/i.test(String(s.mode||""))?Math.max(0,Math.min(1,(v+24)/24)):Math.max(0,Math.min(1,(v-3)/20))};
let SIX=null,SIXK="";
function spotIndex(){const k=(L.updatedUTC||"")+"|"+(L.spotsUTC||"")+"|"+(L.spots||[]).length;if(SIX&&SIXK===k)return SIX;SIXK=k;SIX=[];
  for(const s of (L.spots||[])){if(!s.dx||s.dx[0]==null||s.band==null)continue;let a=null;try{a=spotAge(s)}catch(_){}if(a==null||a>45)continue;
    SIX.push({call:s.call,mode:s.mode,band:s.band,dx:s.dx,from:(s.from||[]).filter(f=>f&&f[0]!=null&&f[1]!=null),wA:Math.exp(-Math.max(0,a)/30),fs:snrF(s)})}return SIX}
/* un spot en un modo que pasa con menos señal que el tuyo prueba menos: FT8 frente a SSB cuenta una cuarta parte */
function modeW(spMode,myAdj){let k="ssb";try{k=spotMode({mode:spMode})}catch(_){}const d=((MODES[k]&&MODES[k].adj)||0)-myAdj;return d>0?Math.exp(-d/20):1}
/* lo que dicen ahora los clústeres de una zona (destino) en una banda, visto desde tu locator */
let ZEV=new Map(),ZEVK="",NBM=new Map(),NBK="";
/* 2.10.36: rapidez. El margen del modo (myAdj) va en la clave de cada destino y no en la de toda la caché: antes, al
   consultarse con márgenes distintos (tu modo, concurso…), la caché se vaciaba en cada llamada y se recalculaba todo.
   Las distancias de estas comparaciones (¿está cerca?, ¿se parece el camino?) usan la esfera, mucho más rápida; las
   que se enseñan siguen siendo las exactas sobre el elipsoide. */
function zoneEv(dx,band,myAdj,key){spotIndex();const sk=SIXK+"|"+TXP.join(",");if(sk!==ZEVK){ZEV=new Map();ZEVK=sk}const kk=key+"|"+band+"|"+myAdj;if(ZEV.has(kk))return ZEV.get(kk);
  const myMid=mid(TXP,dx),myLen=distS(TXP,dx);let miss=1,wSum=0,fsW=0;
  for(const x of spotIndex()){if(x.band!==band||distS(x.dx,dx)>1200)continue;const mw=modeW(x.mode,myAdj);
    for(const fr of x.from){const w=pathSim(fr,x.dx,myMid,myLen)*x.wA*mw;if(w<.02)continue;miss*=1-Math.min(.95,w);wSum+=w;fsW+=w*x.fs}}
  const r={E:1-miss,fs:wSum?fsW/wSum:.6};ZEV.set(kk,r);return r}
/* 2.5.3: la misma ponderación en TODA la plataforma: cada probabilidad de VOACAP de la hora actual se equilibra con lo que dicen
   los clústeres hacia ese destino; una hora antes o después cuenta la mitad y a partir de dos horas manda solo la previsión */
window.ACRACB_live=(t,lh,b,p,extra)=>{if(t.lat==null||t.lon==null||b==null)return p;let now;try{now=localNow()}catch(_){return p}
  let dh=Math.abs(lh-now);dh=Math.min(dh,24-dh);const wh=Math.max(0,1-dh/2);if(!wh)return p;
  let myAdj=0;try{myAdj=MD().adj+(extra||0)}catch(_){}const z=zoneEv([t.lon,t.lat],b,myAdj,t.id);
  /* evidencia en contra: si los que te rodean están oyendo mucho DX en esta banda y nadie oye nada de un destino donde
     normalmente hay actividad, lo más probable es que esa dirección esté cerrada. Se baja con prudencia, como mucho a la mitad. */
  {const tw=window.ACRACB_own&&ACRACB_own(t.id,[t.lon,t.lat],b,"tx");if(tw){const w=tw.w*wh;if(tw.h){p=p+(.9-p)*w}else p=p*(1-.25*w)}}
  {const ow=window.ACRACB_own&&ACRACB_own(t.id,[t.lon,t.lat],b);if(ow){const w=ow.w*wh;if(ow.h){const cap=.45+.5*ow.fs;return cap>p?p+(cap-p)*w:p}return p*(1-.7*w)}}
  if(z.E<.05){const bz=busyNear(b),aw=Math.min(1,(t.act||0)/5);return bz>0&&aw>0?p*(1-.5*bz*aw*wh):p}
  const cap=.35+.5*z.fs;return cap>p?p+(cap-p)*z.E*wh:p};
/* cuánto se oye en una banda desde tu zona ahora mismo (0 = nada, 1 = mucha actividad) */
let BZ=new Map(),BZK="";
function busyNear(b){spotIndex();const k=SIXK+"|"+TXP.join(",");if(k!==BZK){BZ=new Map();BZK=k}if(BZ.has(b))return BZ.get(b);let n=0;
  for(const x of spotIndex()){if(x.band!==b)continue;for(const fr of x.from){try{if(distS(TXP,fr)<1500){n+=x.wA;break}}catch(_){}}}
  const r=1-Math.exp(-n/8);BZ.set(b,r);return r}
function pathSim(fr,dx,myMid,myLen){try{const L2=distS(fr,dx),ms=distS(mid(fr,dx),myMid),dl=(L2-myLen)/Math.max(800,.3*myLen);const q=ms/1200;return Math.exp(-q*q)*Math.exp(-dl*dl)}catch(_){return 0}}
function spotProb(s,e,a){let lh=null;try{lh=localNow()}catch(_){}
  let k="ssb";try{k=spotMode(s)}catch(_){}let ex=0;try{ex=(MODES[k]?MODES[k].adj:0)-MD().adj}catch(_){}
  let pS=e.pSP||0,pL=e.t&&e.t.l?(e.pLP||0):0;
  if(e.t&&lh!=null){window.ACRACB_NOLIVE=true;try{pS=prob(e.t,lh,s.band,false,ex).p;pL=e.t.l?prob(e.t,lh,s.band,true,ex).p:0}catch(_){}finally{window.ACRACB_NOLIVE=false}}
  const lp=pL>pS&&pL>=.05;const p0=lp?pL:pS;let p=p0;
  let E=0,fsW=0,wSum=0,self=false;
  if(s.dx&&s.dx[0]!=null&&!lp){const myMid=mid(TXP,s.dx),myLen=distS(TXP,s.dx);let miss=1;
    /* el propio spot (aunque sea algo antiguo) y los demás de la misma zona */
    const own={dx:s.dx,from:(s.from||[]).filter(f=>f&&f[0]!=null),wA:Math.exp(-Math.max(0,a==null?60:a)/30),fs:snrF(s),same:true};
    /* 2.10.42: los vecinos de cada spot se buscan una vez por tanda de spots (antes, todos contra todos en cada redibujado) */
    const ix=spotIndex();if(NBK!==SIXK){NBK=SIXK;NBM=new Map()}const nk=s.call+"|"+s.band+"|"+s.dx[0]+","+s.dx[1];let nb=NBM.get(nk);
    if(!nb){nb=ix.filter(x=>x.band===s.band&&x.call!==s.call&&distS(x.dx,s.dx)<1200);NBM.set(nk,nb)}
    const cand=[own].concat(nb);
    let spAdj=0;try{spAdj=(MODES[k]&&MODES[k].adj)||0}catch(_){}
    for(const x of cand)for(const fr of x.from){const w=pathSim(fr,x.dx,myMid,myLen)*x.wA*(x.same?1:.7*modeW(x.mode,spAdj));if(w<.02)continue;miss*=1-Math.min(.95,w);wSum+=w;fsW+=w*x.fs;if(x.same&&w>.25)self=true}
    E=1-miss}
  const fs=wSum?fsW/wSum:.6,cap=.35+.5*fs;if(E>0&&cap>p)p=p+(cap-p)*E;
  let heard=false,hw=0;try{const H=window.ACRACB_heardList&&ACRACB_heardList();if(H&&s.dx){const ha=(Date.now()-H.at)/6e4;if(ha<45)for(const x of H.list){if(x.band===s.band&&x.pos&&distJS(x.pos,s.dx)<1500){heard=true;hw=Math.exp(-ha/45);break}}}}catch(_){}
  if(heard&&p<.9)p=p+(.9-p)*hw;
  try{const tw=window.ACRACB_own&&ACRACB_own(e.t&&e.t.id,s.dx,s.band,"tx");if(tw){if(tw.h)p=p+(.9-p)*tw.w;else p=p*(1-.25*tw.w)}}catch(_){}
  try{const ow=window.ACRACB_own&&ACRACB_own(e.t&&e.t.id,s.dx,s.band);if(ow){if(ow.h){const cap=.45+.5*ow.fs;if(cap>p)p=p+(cap-p)*ow.w}else p=p*(1-.7*ow.w)}}catch(_){}
  return {p,lp,p0,near:E>.3,self,E,heard}}
window.ACRACB_spotProb=spotProb;
/* 2.6.3: la misma probabilidad de QSO en todas las tarjetas (avisos, aviso de portada, «Cerca», POTA/SOTA/WWFF) */
function PC(s,a){try{if(s.band==null)return {};const dx=s.dx&&s.dx[0]!=null?s.dx:(window.ACRACB_areaPos&&ACRACB_areaPos(s.call));if(!dx)return {};
  const ss=Object.assign({},s,{dx,kind:"dx",from:Array.isArray(s.from)?s.from:[]});const e=spotEval(ss,localNow());if(!e||!e.t)return {};const r=spotProb(ss,e,a);
  let sg="";try{sg=sigRow(ss,e,r)}catch(_){}
  return isFinite(r.p)?{p:Math.round(r.p*100),p0:Math.round(r.p0*100),sig:sg,lpb:!!r.lp,oh:{t:e.t.id,b:ss.band,call:ss.call,mode:ss.mode}}:{}}catch(_){return {}}}
/* 2.10.1: señal prevista en los dos sentidos (le oirás / te oirá) y, si ya anotaste lo que oyes o lo que te oyen,
   la comparación con lo previsto y cómo cambia la probabilidad con tus datos */
/* 2.11.60: si no hay estimación de señal, se dice por qué, en vez de dejar la tarjeta sin la fila «Señal» */
function sigWhy(s,e,sp){const b=s.band;let why=T("Sin estimación de señal para este camino.","No signal estimate for this path.");
  try{if(!e||!e.t)why=T("No se sabe desde dónde transmite: sin ubicación no se puede estimar la señal.","Its location is unknown: without it the signal cannot be estimated.");
    else if(b!=null&&typeof antPick==="function"&&!antPick(b,10))why=T(`Ninguna de tus antenas cubre ${BANDS[b]||"esta banda"}.`,`None of your antennas covers ${BANDS[b]||"this band"}.`)}catch(_){}
  return `<span class="sgnone">${why}</span>`}
function sigRow(s,e,sp){if(!e||!e.t||!window.ACRACB_sigEst)return sigWhy(s,e,sp);let lh=null;try{lh=localNow()}catch(_){}if(lh==null)return sigWhy(s,e,sp);
  const g=ACRACB_sigEst(e.t,lh,s.band,!!sp.lp);if(!g)return sigWhy(s,e,sp);const k=(()=>{try{return spotMode(s)}catch(_){return "ssb"}})();
  /* 2.11.22: la señal se juzga con lo que necesita el modo del spot, con el mismo modelo que da la probabilidad (antes, con
     un umbral fijo de SSB: una señal suficiente para CW o FT8 salía «bajo el ruido» junto a una probabilidad alta) */
  let ex=0;try{ex=(MODES[k]?MODES[k].adj:0)-MD().adj}catch(_){}const need=g.req-ex;
  const mn=k==="cw"?"CW":["ft8","ft4","jt65","js8","psk","rtty"].includes(k)?k.toUpperCase():T("la fonía","phone");
  const rep=x=>{const m=x.snr-need,v=Math.min(x.s,9+40),pc=Math.round(Math.min(1,v/13)*100),c=m>=6?"sg-g":m>=0?"sg-y":"sg-r";
    const w=m>=6?T("de sobra","plenty"):m>=0?T("justa","just enough"):T("no basta","not enough");
    return `<span class="sgm ${c}" title="${x.dbm} dBm"><i style="width:${pc}%"></i></span><b class="sgv ${c}">${sTxt(x.s)}</b><span class="sgx" title="${T("para ","for ")}${mn}${x.low?T(` · ruido ${sTxt(x.ns)}`,` · noise ${sTxt(x.ns)}`):""}">${w}</span>`};
  const cl=x=>{const m=x.snr-need;return m>=6?2:m>=0?1:0};
  /* 2.11.58: siempre las dos barras, «Le oirás» y «Te oirá», aunque coincidan: antes se juntaban en una sola («Ida y
     vuelta») y parecía que a esas tarjetas les faltaba una */
  let h=`<span class="sgl"><span class="sgk">${T("Le oirás","You hear")}</span>${rep(g.rx)}</span><span class="sgl"><span class="sgk">${T("Te oirá","Hears you")}</span>${rep(g.tx)}</span>`;
  h=`<span class="sgw" title="${T("Mediana del mes según el modelo","Monthly median from the model")}">${h}</span>`;
  /* 2.11.54: señal suficiente con fiabilidad baja no es una contradicción: la banda abre solo algunos días (está al límite
     de la MUF), y cuando abre llega con esa señal. Se dice, para que no parezca que una cosa desmiente a la otra */
  try{const pp=sp&&sp.p!=null?sp.p:null,p0=sp&&sp.p0!=null?sp.p0:pp;/* 2.11.59: al revés: el modelo da poca señal, pero lo que se oye ahora sube la fiabilidad */if(pp!=null&&pp>=.5&&p0!=null&&p0<.25&&Math.max(cl(g.rx),cl(g.tx))<1)h+=`<span class="sgnote">${T(`Es la señal que da el modelo, que aquí se queda corto: los spots de ahora dicen que el camino está abierto.`,`This is the model's signal, which falls short here: current spots say the path is open.`)}</span>`;if(pp!=null&&pp<.5&&Math.min(cl(g.rx),cl(g.tx))>=1)h+=`<span class="sgnote">${T(`Esa es la señal de los días en que el camino abre; a esta hora abre menos de la mitad de los días.`,`That is the signal on days when the path opens; at this hour it opens on fewer than half the days.`)}</span>`}catch(_){}
  const call=SK(s.call),o=lastOwn(call,s.band,"rx"),u=lastOwn(call,s.band,"tx");const cmp=[];
  if(o&&o.h&&o.s!=null){const d=o.s-Math.min(g.rx.s,9+60);cmp.push(T(`le oyes a <b>${sTxt(o.s)}</b> y se preveía ${sTxt(g.rx.s)}`,`you hear them at <b>${sTxt(o.s)}</b>; ${sTxt(g.rx.s)} was forecast`)+(d?` (${d>0?"+":""}${d})`:` (${T("acierto","spot on")})`))}
  if(u&&u.h&&u.s!=null){const d=u.s-g.tx.s;cmp.push(T(`te oye a <b>${sTxt(u.s)}</b> y se preveía ${sTxt(g.tx.s)}`,`they hear you at <b>${sTxt(u.s)}</b>; ${sTxt(g.tx.s)} was forecast`)+(d?` (${d>0?"+":""}${d})`:` (${T("acierto","spot on")})`))}
  if((o||u)&&sp.p0!=null&&Math.round(sp.p0*100)!==Math.round(sp.p*100))cmp.push(T(`la fiabilidad pasa del <b>${Math.round(sp.p0*100)} %</b> que daba el modelo al <b>${Math.round(sp.p*100)} %</b>`,`the chance goes from the model's <b>${Math.round(sp.p0*100)} %</b> to <b>${Math.round(sp.p*100)} %</b>`));
  if(cmp.length)h+=`<div class="sgcmp">${T("Con lo que has anotado","With what you noted")}: ${cmp.join("; ")}.</div>`;
  return h}
function dxRow(s,e,a){const st=splitTags(s);const tags=[];const sp=spotProb(s,e,a);if(s.nw)tags.push(`<span class="nwb">${T("NUEVO","NEW")}</span>`);if(s.ns>1)tags.push(`<span class="nsb">${T(`en ${s.ns} clústeres`,`on ${s.ns} clusters`)}</span>`);
  return card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tags.concat(st.pr),byLbl:T("Publicado por","Spotted by"),by:pubBy(s),xs:st.xs,geo:geoOf(s.dx)||{az:e.az,laz:e.laz,km:e.km},p:Math.round(sp.p*100),p0:Math.round(sp.p0*100),lpb:sp.lp,oh:e.t?{t:e.t.id,b:s.band,call:s.call,mode:s.mode}:null,old:a>60,sig:sigRow(s,e,sp)})}
function progRow(o){const u=refUrl(o.prog,o.ref),pn=PNAME[o.prog];const tag=u?`<a class="xtag xr" href="${u}" target="_blank" rel="noopener noreferrer" data-ext title="${T("Ficha del","Page of the")} ${T(pn[0],pn[1])}">${e2(o.prog)} ${e2(o.ref)}</a>`:`<span class="xtag xr">${e2(o.prog)} ${e2(o.ref)}</span>`;
  return card({...PC({call:o.call,band:o.band,mode:o.mode,f:o.f,dx:o.dx,t:o.t,c:o.c},o.a),call:o.call,a:o.a,t:o.t,f:o.f,band:o.band,mode:o.mode,tags:[tag],byLbl:T("Spot de","Spotted by"),by:o.by?e2(o.by):"",geo:geoOf(o.dx),note:o.c?e2(cTr(o.c)):"",old:o.a>30})}
const NREF=/(POTA|SOTA|WWFF|GMA|DME|DVGE|DFE|IOTA|DIE|DCE|DMVE|DEE)[ :-]*[A-Z0-9/-]+/i;
function nearRow(s,a){const st=splitTags(s);const tags=[];if(s.nw)tags.push(`<span class="nwb">${T("NUEVO","NEW")}</span>`);if(s.ns>1)tags.push(`<span class="nsb">${T(`en ${s.ns} clústeres`,`on ${s.ns} clusters`)}</span>`);
  const m=String(s.c||"").match(NREF);if(m&&!st.pr.length)tags.push(`<span class="xtag xr">${e2(m[0].toUpperCase())}</span>`);
  return card({...PC(s,a),call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tags.concat(st.pr),byLbl:T("Publicado por","Spotted by"),by:pubBy(s),xs:st.xs,geo:geoOf(s.dx),old:a>60})}
function renderNear(){const box=$("near");if(!box||typeof SPOTS!=="function")return;const keep=[...box.children].filter(x=>x.matches&&x.matches("p.note"));
  const nr=SPOTS().filter(s=>spotKind(s)==="near").map(s=>({s,a:spotAge(s)})).sort((x,y)=>(x.a??1e9)-(y.a??1e9));
  box.innerHTML=(nr.length?nr.map(({s,a})=>nearRow(s,a)).join(""):`<div class="empty">${T(`Sin spots de España en ${CMSTXT()} ahora.`,`No spots from Spain in ${CMSTXT()} right now.`)}</div>`);keep.forEach(k=>box.appendChild(k))}

/* ---------- clúster ---------- */
let LH=null;let CLALL=false,CLOPEN=false;try{CLALL=localStorage.getItem("acracb_clall")==="1"}catch(_){}
document.addEventListener("click",ev=>{const f=ev.target.closest&&ev.target.closest("[data-clfor]");if(f){CLALL=f.dataset.clfor==="all";CLOPEN=false;try{localStorage.setItem("acracb_clall",CLALL?"1":"")}catch(_){}render();return}
  const m=ev.target.closest&&ev.target.closest("[data-clmore]");if(m){CLOPEN=true;render()}});
/* un spot con referencia de programa es una activación: va en su categoría, no en DX */
function actKeys(){const k=L.acts||[];if(actKeys.c&&actKeys.c[0]===k&&actKeys.c[1]===k.length)return actKeys.c[2];const m=new Set(k.map(o=>SK(o.call)+"|"+o.band));actKeys.c=[k,k.length,m];return m}
function isActSpot(s){return actKeys().has(SK(s.call)+"|"+s.band)||RXA.test(String(s.c||""))}
/* lo que el mapa dibuja: lo mismo que el clúster, con las mismas categorías (DX y activaciones con posición) */
/* 2.11.63: en el mapa se puede dejar el clúster sin nada (pulsando «Todos» cuando ya está todo, o quitando el último):
   solo afecta al mapa, la lista del clúster sigue igual */
let MAPNONE=false;
function mapSpots(){if(MAPNONE)return [];const ty=TYPES;const out=[];
  if(ty.has("dx"))SPOTS().forEach(s=>{if(!isActSpot(s))out.push(s)});
  let bs=null;try{bs=CMBANDS()}catch(_){}
  progAll().forEach(o=>{const c=catOf(o);if(!ty.has(c)||!o.dx||o.band==null||(bs&&!bs.has(o.band))||!modeOK(o)||(o.a!=null&&o.a>60))return;
    out.push({call:o.call,f:o.f,band:o.band,mode:o.mode,t:o.t,utc:o.utc,by:o.by?[o.by]:[],from:[],dx:o.dx,dxcc:o.dxcc,kind:"dx",c:(o.prog+" "+o.ref+(o.c?" · "+o.c:"")),act:{prog:o.prog,ref:o.ref,cat:c}})});
  return out}
let MSC=null;window.ACRACB_mapSpots=()=>{const k=[MAPNONE?1:0,L.updatedUTC,L.actsUTC,(L.spots||[]).length,(L.acts||[]).length,[...TYPES].join(),CMS().join(),(()=>{try{return [...CMBANDS()].join()}catch(_){return ""}})()].join("|");if(MSC&&MSC[0]===k)return MSC[1];const v=mapSpots();MSC=[k,v];return v};
window.ACRACB_cat={types:()=>new Set(TYPES),label:CATN,list:()=>["dx"].concat(PROGS)};
function catChanged(){MSC=null;try{if(typeof st!=="undefined"&&st.page==="mapa")drawMap()}catch(_){}try{mapCat()}catch(_){}try{document.dispatchEvent(new Event("acracb:cat"))}catch(_){}}
/* selector en el mapa, el mismo que en el clúster */
function mapCat(){const sw=document.getElementById("mapsw");if(!sw)return;const row0=sw.closest(".mrow");if(!row0)return;let r=document.getElementById("mcatrow");
  if(!r){r=document.createElement("div");r.className="mrow";r.id="mcatrow";row0.insertAdjacentElement("afterend",r)}
  const on=typeof st!=="undefined"&&st.mapOn&&st.ly&&st.ly.spots;r.hidden=!on;if(!on)return;
  const ms=window.ACRACB_mapSpots(),cnt={};ms.forEach(s=>{const c=s.act?s.act.cat:"dx";cnt[c]=(cnt[c]||0)+1});const ALL=["dx"].concat(PROGS),all=ALL.every(x=>TYPES.has(x));
  const h=`<div class="mrt">${T("Clúster","Cluster")}</div><div class="seg" role="group" aria-label="${T("Qué spots ver","Which spots to show")}"><button type="button" data-mct="*" aria-pressed="${all&&!MAPNONE}">${T("Todos","All")}</button>${ALL.map(k=>`<button type="button" data-mct="${k}" aria-pressed="${!MAPNONE&&TYPES.has(k)&&!all}">${CATN(k)}${cnt[k]?` <small>${cnt[k]}</small>`:""}</button>`).join("")}</div>`;
  if(r.innerHTML!==h)r.innerHTML=h}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-mct]");if(!b)return;const k=b.dataset.mct,ALL=["dx"].concat(PROGS),all=ALL.every(x=>TYPES.has(x));
  if(k==="*"){if(all&&!MAPNONE)MAPNONE=true;else{MAPNONE=false;ALL.forEach(x=>TYPES.add(x))}}
  else if(MAPNONE){MAPNONE=false;TYPES.clear();TYPES.add(k)}
  else if(all){TYPES.clear();TYPES.add(k)}
  else{if(TYPES.has(k))TYPES.delete(k);else TYPES.add(k);if(!TYPES.size){ALL.forEach(x=>TYPES.add(x));MAPNONE=true}}
  S.set("acracb_cltypes",JSON.stringify([...TYPES]));{const a2=ALL.every(y=>TYPES.has(y));b.parentElement.querySelectorAll("[data-mct]").forEach(x=>x.setAttribute("aria-pressed",String(!MAPNONE&&(x.dataset.mct==="*"?a2:(TYPES.has(x.dataset.mct)&&!a2)))))}
  MSC=null;try{render()}catch(_){}catChanged()});
(window.ACRACB_afterDraw=window.ACRACB_afterDraw||[]).push(()=>{try{mapCat()}catch(_){}});
function render(lh){if(lh!=null)LH=lh;const box=$("spots");if(!box||typeof SPOTS!=="function")return;if(LH==null)LH=st.mhour;
  let bx=$("clbar");if(!bx){bx=document.createElement("div");bx.id="clbar";const cf=$("clfilt");if(cf)cf.appendChild(bx);else box.parentNode.insertBefore(bx,box)}
  const bs=bandsOK();
  /* DX */
  const sp=SPOTS().filter(s=>!isActSpot(s)).map(s=>({s,e:spotEval(s,LH),a:spotAge(s)})).filter(x=>x.e&&(spotKind(x.s)==="dx"||spotKind(x.s)==="ind"));
  sp.sort((x,y)=>(spotKind(x.s)==="dx")-(spotKind(y.s)==="dx")||0);
  const dxs=sp.filter(x=>spotKind(x.s)==="dx").sort((a,b)=>b.e.p-a.e.p).concat(sp.filter(x=>spotKind(x.s)==="ind"));
  /* programas */
  const pa=progAll().filter(o=>bs.has(o.band)&&modeOK(o)&&(o.a==null||o.a<=60));
  const counts={dx:dxs.length};PROGS.forEach(p=>counts[p]=pa.filter(o=>catOf(o)===p).length);
  const cur=(TYPES.has("dx")?dxs.map(x=>x.s.band):[]).concat(pa.filter(o=>TYPES.has(catOf(o))).map(o=>o.band));
  const bcounts={};cur.forEach(b=>bcounts[b]=(bcounts[b]||0)+1);
  bx.innerHTML=bar(counts,bcounts)+legend();wire(bx);
  /* 2.10.0: los filtros van plegados; el resumen dice qué se está mostrando */
  {const fs=$("clfs");if(fs){const ty=["dx"].concat(PROGS).filter(t=>TYPES.has(t)).map(CATN);const bsl2=ORD.filter(b=>BSEL.has(b)).map(b=>BANDS[b]);
    fs.textContent=[CMSTXT(),bsl2.length?bsl2.join(", "):T("todas las bandas","all bands"),ty.length&&ty.length<1+PROGS.length?ty.join(", "):T("DX y actividades","DX and activations")].join(" · ")}}
  const inB=b=>!BSEL.size||BSEL.has(b),bsl=ORD.filter(b=>BSEL.has(b)).map(b=>BANDS[b]);
  const bl=bsl.length?" "+T("en","on")+" "+(bsl.length>1?bsl.slice(0,-1).join(", ")+T(" y "," and ")+bsl[bsl.length-1]:bsl[0]):"";
  let h="";const srcs=[];
  if(TYPES.has("dx")){const rows=dxs.filter(x=>inB(x.s.band));
    /* 2.10.24: de dónde salen (y por qué faltan) los DX: el recuento de todos los spots del clúster */
    try{const all=L.spots||[];let oM=0,oB=0,ac=0,nr=0,dx0=0;const bsx=CMBANDS(),ms=CMS();
      for(const z of all){if(isActSpot(z)){ac++;continue}if(!ms.includes(spotMode(z))){oM++;continue}if(!bsx.has(z.band)||!inB(z.band)){oB++;continue}const k=spotKind(z);if(k!=="dx"&&k!=="ind"){nr++;continue}dx0++}
      /* 2.11.12: título y recuento en una sola línea: «DX 185 con tu modo y tus bandas», y el resto, en pequeño */
      const bits=[];if(oM)bits.push(T(`otros modos ${oM}`,`other modes ${oM}`));if(oB)bits.push(T(`otras bandas ${oB}`,`other bands ${oB}`));if(ac)bits.push(T(`activaciones ${ac}`,`activations ${ac}`));if(nr)bits.push(T(`España ${nr}`,`Spain ${nr}`));
      h+=`<p class="clsum"><b class="clsk">DX</b> <b class="clsn" title="${T("Con tu modo y tus bandas","In your mode and bands")}">${dx0}</b><span class="clsx">/${all.length}${bits.length?" · "+bits.join(" · "):""}</span></p>${st.mode==="contest"?`<p class="note clwhy">`+T("En modo concursos «Para ti» pide más señal, porque tienen que copiarte a la primera.","In contest mode «For you» asks for a stronger signal, because they must copy you first time.")+`</p>`:""}`}catch(_){}
    /* 2.8.20: una fila por estación (sus otras frecuencias al lado), por defecto solo lo que puedes trabajar
       (oída en la última media hora y con al menos un 10 %), lo nuevo arriba y pocas filas con «Ver N más» */
    const G=new Map();rows.forEach(x=>{let pp=0;try{pp=spotProb(x.s,x.e,x.a).p}catch(_){pp=x.e.p||0}x.pp=pp;const k=SK(x.s.call);if(!G.has(k))G.set(k,[]);G.get(k).push(x)});
    const grp=[...G.values()].map(a=>{a.sort((u,v)=>v.pp-u.pp);const best=a[0];return {a,best,nw:a.some(x=>x.s.nw),pp:best.pp,age:Math.min(...a.map(x=>x.a??1e9))}});
    const useful=g=>g.age<=30&&g.pp>=.1;const yours=grp.filter(useful);
    const sel=CLALL?grp:yours;sel.sort((u,v)=>(v.nw-u.nw)||(v.pp-u.pp));
    const N=document.documentElement.classList.contains("vc")?6:8;
    h+=`<div class="seg clfor" role="group" aria-label="${T("Qué estaciones ver","Which stations to show")}"><button type="button" data-clfor="you" aria-pressed="${!CLALL}">${T("Para ti","For you")} <small>${yours.length}</small></button><button type="button" data-clfor="all" aria-pressed="${CLALL}">${T("Todos","All")} <small>${grp.length}</small></button></div>`;
    h+=`<p class="note clfn">${CLALL?T("<b>Todos:</b> todas las estaciones del clúster con tus filtros de modo y banda, aunque ahora no te lleguen.","<b>All:</b> every station on the cluster with your mode and band filters, even if it does not reach you now."):T("<b>Para ti:</b> solo las que puedes trabajar ahora: oídas en la última media hora y con al menos un 10 % de fiabilidad desde tu estación.","<b>For you:</b> only those you can work now: heard in the last half hour and with at least 10 % reliability from your station.")}</p>`;
    /* 2.10.0: las otras frecuencias de la misma estación, en una fila propia «También en», con el mismo aspecto que la
       frecuencia principal (cifra en grande y color de su banda, modo y banda al lado) */
    const alt=g=>g.a.slice(1).map(x=>`<span class="xalt2"><b style="color:${BC[x.s.band]}">${e2(x.s.f)}</b>${x.s.mode?` <span class="xam">${e2(x.s.mode)}</span>`:""} <span class="xab">${BANDS[x.s.band]}</span></span>`);
    const one=g=>{const x=g.best;const sv=x.s;const tg=alt(g);if(!tg.length)return dxRow(sv,x.e,x.a);const o=Object.assign({},sv);const r=dxRow(o,x.e,x.a);
      const row=`<dt>${T("También en","Also on")}</dt><dd class="xalts">${tg.join("")}</dd>`;return r.includes('class="sc-d">')?r.replace('class="sc-d">','class="sc-d">'+row):r.replace(/(<div class="sc-f">[\s\S]*?)(<\/div>)/,(m,a1,a2)=>a1+tg.join("")+a2)};
    const cards=sel.map(one);const open=CLOPEN||cards.length<=N+2;
    h+=cards.length?(document.documentElement.classList.contains("vl")?ACRACB_listHead():"")+(open?cards:cards.slice(0,N)).join("")+(open?"":`<button type="button" class="btn llmore" data-clmore>${T(`Ver ${cards.length-N} estaciones más`,`Show ${cards.length-N} more stations`)}</button>`)
      :`<div class="empty">${CLALL||!grp.length?T(`Sin spots DX de ${CMSTXT()} útiles${bl} ahora.`,`No useful ${CMSTXT()} DX spots${bl} right now.`):T(`Ninguna estación que puedas trabajar ahora${bl}. Pulsa «Todos» para ver las ${grp.length} del clúster.`,`No stations you can work right now${bl}. Tap «All» to see the ${grp.length} on the cluster.`)}</div>`;
    srcs.push(e2(L.spotsSrc||"—"))}
  const ps=PROGS.filter(p=>TYPES.has(p));
  if(ps.length){const rows=pa.filter(o=>ps.includes(catOf(o))&&inB(o.band)).sort((a,b)=>(a.a??1e9)-(b.a??1e9));const N=80;
    const psn=ps.map(p=>p==="OTROS"?T("otros programas (GMA, castillos, faros…)","other programs (GMA, castles, lighthouses…)"):p);const pl=psn.length>1?psn.slice(0,-1).join(", ")+T(" y "," and ")+psn[psn.length-1]:psn[0];
    bx.insertAdjacentHTML("beforeend",`<p class="note clnote">${T(`Activadores de ${pl} de todo el mundo en la última hora, en ${CMSTXT()}${bl}. Los más recientes, arriba.`,`${pl} activators worldwide in the last hour, in ${CMSTXT()}${bl}. Newest first.`)}</p>`);
    if(TYPES.has("dx"))h+=`<p class="note clsec">${pl}</p>`;
    h+=rows.length?rows.slice(0,N).map(progRow).join("")+(rows.length>N?`<p class="note">${T(`Y ${rows.length-N} más.`,`And ${rows.length-N} more.`)}</p>`:""):`<div class="empty">${T(`Ningún activador de ${pl} en ${CMSTXT()}${bl} en la última hora.`,`No ${pl} activators in ${CMSTXT()}${bl} in the last hour.`)}</div>`;
    srcs.push((Array.isArray(L.acts)?T("Spothole","Spothole"):T("Spothole y los comentarios de los spots del clúster","Spothole and cluster spot comments"))+(L.actsUTC?T(` · revisado a las ${String(L.actsUTC).slice(11,16)} UTC`,` · checked at ${String(L.actsUTC).slice(11,16)} UTC`):""))}
  h+=`<details class="srcd"><summary>${T("Fuentes","Sources")}</summary>${srcs.map(x=>`<p class="note">${x}</p>`).join("")}</details>`;
  box.innerHTML=h;try{srchInit();if($("srchq")&&$("srchq").value)srchRun()}catch(_){}}
window.ACRACB_clrender=render;

/* ---------- DXpediciones: dónde están operando ahora ---------- */
function dxTok(call){return String(call||"").toUpperCase().split(/[\s,;]+/).map(x=>x.replace(/[^A-Z0-9/]/g,"")).filter(x=>x.length>=3)}
function dxSpots(d){
  if(L.dxon&&typeof L.dxon==="object"&&!Array.isArray(L.dxon))return (L.dxon[d.call]||[]).map(o=>Object.assign({},o,{a:minsFrom(o.utc)}));
  const tk=dxTok(d.call),out=[],seen=new Set();
  for(const s of (L.spots||[])){if(!tk.some(x=>s.call===x||s.call.startsWith(x+"/")||s.call.endsWith("/"+x)))continue;const k=s.band+"|"+(s.mode||"");if(seen.has(k))continue;seen.add(k);
    out.push({f:s.f,band:s.band,mode:s.mode,t:s.t,by:Array.isArray(s.by)?s.by[0]:s.by,c:s.c,a:(()=>{try{return spotAge(s)}catch(e){return null}})()})}
  return out.sort((a,b)=>(a.a??1e9)-(b.a??1e9))}
function split(c){c=String(c||"");const sp=window.ACRACB_split?ACRACB_split(c):null;if(sp&&sp.abs)return T(`split, escucha en ${sp.abs}`,`split, listening on ${sp.abs}`);if(sp)return T(`split +${sp.rel}${sp.rel2?"–"+sp.rel2:""} kHz`,`split up ${sp.rel}${sp.rel2?"–"+sp.rel2:""} kHz`);
  if(/\bUP\b|\bSPLIT\b/i.test(c))return T("split, escucha arriba","split, listening up");return ""}
window.ACRACB_dxSpots=dxSpots;
window.ACRACB_spAz=(s,lp)=>{const g=geoOf(s&&s.dx);return g?(lp?g.laz:g.az):null};
window.ACRACB_dxon=function(d){const a=dxSpots(d);if(!a.length)return !(L.dxon&&typeof L.dxon==="object")?"":`<span class="dxon dxoff">${T("Sin spots en las últimas 6 h","No spots in the last 6 h")}</span><br>`;
  const live=a.filter(o=>o.a!=null&&o.a<=30),rest=a.filter(o=>!(o.a!=null&&o.a<=30));
  const one=o=>`<span class="dxof"><b style="color:${BC[o.band]}">${e2(o.f)}</b> ${mb(o.mode)} · ${BANDS[o.band]||""} · ${ago(o.a)}${split(cTr(o.c))?" · "+split(cTr(o.c)):""}</span>`;
  let h="";
  if(live.length)h+=`<span class="dxon"><b>◆ ${T("En el aire ahora","On the air now")}:</b> ${live.slice(0,4).map(one).join(" ")}</span><br>`;
  if(rest.length)h+=`<span class="dxon dxlast">${live.length?T("Antes","Earlier"):T("Últimos spots","Latest spots")}: ${rest.slice(0,live.length?2:3).map(one).join(" ")}</span><br>`;
  return h};

/* ---------- avisos con la misma tarjeta ---------- */
/* filtros de los avisos, acumulativos como los del clúster: varios modos y varias bandas a la vez */
const AMODES=["SSB","AM","FM","CW","FT8","FT4","JT65","JS8","RTTY","PSK31","SSTV","OTROS"];
const ANAME={JS8:"JS8Call"};
/* 2.10.19: los avisos ya no tienen filtros propios: usan el modo y las bandas comunes (estación, clúster y mapa) */
const AM=new Set(),AB=new Set();
const mgrp=(m,f)=>{const x=mlab(m,f);return AMODES.includes(x)?x:(x==="JS8CALL"?"JS8":"OTROS")};
window.ACRACB_alertCards=()=>{try{alertCards()}catch(e){}};
function alertCards(){const box=$("alerts");if(!box)return;try{alRefresh()}catch(_){}if(!L.alert||!Array.isArray(L.alert.items))return;
  const old=[...box.querySelectorAll(":scope>.sp")];let wrap=box.querySelector(":scope>.alc"),fb=box.querySelector(":scope>.alf");
  /* 2.11.61: aunque no haya avisos, se ven los interruptores: si no, no se podía encender nada hasta que llegara un aviso */
  if(!wrap){wrap=document.createElement("div");wrap.className="alc";if(old.length){old[0].before(wrap);old.forEach(o=>o.remove())}else box.appendChild(wrap)}
  if(!fb){fb=document.createElement("div");fb.className="alf";wrap.before(fb)}
  const rows=L.alert.items.map(x=>{const sp=(L.spots||[]).find(s=>s.call===x.call)||{};const band=x.band!=null?x.band:sp.band;const mode=x.mode||sp.mode||"";return {x,sp,band,mode,g:mgrp(mode,x.f!=null?x.f:sp.f)}});
  const mc={},bc={};rows.forEach(r=>{mc[r.g]=(mc[r.g]||0)+1;if(r.band!=null)bc[r.band]=(bc[r.band]||0)+1});
  /* se ven siempre todos los modos y todas las bandas de tu estación; los que ahora no tienen avisos salen atenuados */
  const ml=AMODES.slice(),bs=bandsOK(),bl=ORD.filter(b=>bs.has(b));[...AB].forEach(b=>{if(!bs.has(b))AB.delete(b)});
  {const bl2=ORD.filter(b=>BSEL.has(b)).map(b=>BANDS[b]);let hb=null;try{hb=HB()}catch(_){}
   /* 2.11.81: sin la línea de modo y bandas (ya están en la barra de arriba); van dentro de la frase de abajo */
   fb.innerHTML="";window.__alMB=`${e2(CMSTXT())}${hb!=null?" · "+e2(BANDS[hb]):bl2.length?" · "+e2(bl2.join(", ")):""}`}
  const vis=rows.filter(r=>(!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band)))).map((r,i)=>{r.i=i;return r});
  const kn=`<p class="note alk">${LOG?T(`Lo que puedes trabajar ahora en ${window.__alMB||""}: primero lo que te falta en el log, luego DXpediciones y lo que marques abajo.`,`What you can work now on ${window.__alMB||""}: first what your log needs, then DXpeditions and what you switch on below.`)
    :T(`Lo que puedes trabajar ahora en ${window.__alMB||""}: DXpediciones y lo que marques abajo.`,`What you can work now on ${window.__alMB||""}: DXpeditions and what you switch on below.`)}</p>`+alXRow();
  /* 2.11.74: «Concursos en marcha»: una tarjeta por concurso en el aire, con cuándo termina; los extranjeros, con quién puntúa */
  const ctc=(()=>{try{if(!alX().ct)return "";const EN=window.ACRACB_LANG==="en",hm=d=>{const x=new Date(+d-6e4),L=EN?"en-GB":"es-ES",o={timeZone:"Europe/Madrid"};return x.toLocaleDateString(L,{...o,weekday:"long"})+" "+x.toLocaleTimeString(L,{...o,hour:"2-digit",minute:"2-digit",hourCycle:"h23"})};
    const a=(window.ACRACB_ctNow?ACRACB_ctNow():[]).map(x=>({n:x.c[0],m:x.c[1],en:x.en,plan:!!x.plan,who:""})).concat(window.ACRACB_ctForNow?ACRACB_ctForNow().map(x=>({n:x.n,m:"",en:x.en,plan:false,who:x.who})):[]);
    if(!a.length)return "";
    return `<div class="alct">${a.map(x=>`<div class="sc alctc" role="link" tabindex="0" data-ctcal="${e2(x.n)}" title="${T("Ver en el calendario de concursos","See it in the contest calendar")}"><div class="sc-h"><span class="sc-call"><span class="xtag xs dxpt">${T("Concurso","Contest")}</span> <b>${e2(x.n)}</b>${x.m?` <span class="xtag xr">${e2(x.m)}</span>`:""}</span></div><p class="note">${T("Termina el","Ends")} ${e2(hm(x.en))}${x.who?` · ${e2(x.who)}`:""}. <span class="alctl">${T("Ver en el calendario","See in the calendar")} ›</span>${x.plan?` · <a href="#" data-ctgo="1">${T("Ver la estrategia","See the strategy")}</a>`:""}</p></div>`).join("")}</div>`}catch(_){return ""}})();
  wrap.innerHTML=vis.length?kn+ctc+vis.map(({x,sp,band,mode})=>{const st=splitTags({c:cTr(x.c||sp.c||"")});
    const tag=alTag(x);
    let a=null;try{a=spotAge({t:x.t})}catch(e){}
    return withHave(card({...PC({call:x.call,band,mode,f:x.f,dx:sp.dx,from:sp.from,c:cTr(x.c||sp.c),t:x.t},a),call:x.call,a,t:x.t,f:x.f,band,mode,tags:[tag].concat(st.pr),by:CSL(String(x.by||"").split(/[ ,]+/).filter(Boolean),", "),xs:st.xs,geo:geoOf(sp.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(x.call)))}),x)}).join("")
    :kn+ctc+(rows.length?`<p class="note">${T("Ningún aviso con este modo y esta banda. Pulsa «Todos» o «Todas» para verlos todos.","No alerts for this mode and band. Tap «All» to see them all.")}</p>`:"")}
/* 2.4.1: el aviso flotante (arriba, en Ahora) solo enseña los modos y bandas elegidos en Avisos, con las mismas tarjetas */
/* 2.4.7: un solo criterio para todo lo que avisa (lista, aviso flotante, resumen y notificaciones): el modo y las bandas elegidos en Avisos */
/* ---------- 2.10.17: avisos DX con criterio único y lógico ----------
   Mezcla, por orden: 1) entidad nueva para tu log, 2) DXpedición, 3) banda nueva, 4) modo nuevo, 5) DX posible (entidad rara).
   Solo entra lo que el clúster «Para ti» da por trabajable (oído en la última media hora y con un 10 % o más desde tu estación).
   «Ya la tengo» deja de avisar de esa estación (DXpedición: hasta que acabe) y de esa entidad en esa banda y modo durante un año. */
const ALHK="acracb_alhave";
function alHave(){try{const o=JSON.parse(localStorage.getItem(ALHK)||"{}"),n=Date.now();let ch=false;for(const k in o)if(!(o[k]>n)){delete o[k];ch=true}if(ch)localStorage.setItem(ALHK,JSON.stringify(o));return o}catch(_){return {}}}
const mgOf=(mode,f)=>{const g=mgrp(mode,f);return g==="CW"?"CW":(g==="SSB"||g==="AM"||g==="FM")?"PH":"DG"};
const MGN={CW:["CW","CW"],PH:["fonía","phone"],DG:["digital","digital"]};
function dxpInfo(call){const k=SK(call);for(const d of (L.dx||[])){if(dxTok(d.call).includes(k))return d}return null}
/* qué más avisa, aparte de tu log y las DXpediciones: indicativos curiosos
   (móvil marítimo o aeronáutico, bases en la Antártida, indicativos especiales) y DX lejano (a 15.000 km o más de tu estación) */
/* 2.10.44: sin «entidades raras»: salía de la lista Most Wanted de Club Log, cuyas condiciones de uso no están claras */
const ALXK="acracb_alx",FARKM=15000;
/* 2.11.61: dos interruptores más: spots comunicados por socios de ACRACB (encendido) y activaciones de programas
   como POTA, SOTA, WWFF, IOTA o DME (apagado: son muchas). Los dos valen también para estaciones cercanas */
function alX(){let o={};try{o=JSON.parse(localStorage.getItem(ALXK)||"{}")||{}}catch(_){}return {rare:false,cur:o.cur!==0,far:o.far!==0,soc:o.soc!==0,act:o.act===1,ct:o.ct!==0}}
/* 2.11.99: significados según el uso habitual de los sufijos (licencias CEPT/T-R 61-01 y administraciones como Ofcom):
   /P portátil, /M móvil (vehículo, también en aguas interiores), /MM móvil marítimo (barco en el mar), /MA barco fondeado,
   /AM móvil aeronáutico, /A dirección alternativa. /QRP, /QRPP, /LH y /B no son oficiales, pero se usan mucho */
function sufTag(call){const p=String(call||"").toUpperCase().split("/");if(p.length<2)return null;const core=p.reduce((a,x)=>x.length>a.length?x:a,"");
  const M={P:["/P",T("Portátil (/P): opera fuera de su domicilio, con una instalación temporal","Portable (/P): operating away from home with a temporary setup")],
    M:["/M",T("Móvil (/M): desde un vehículo (también desde un barco en aguas interiores)","Mobile (/M): from a vehicle (also a boat on inland waters)")],
    MM:["/MM",T("Móvil marítimo (/MM): a bordo de un barco en el mar","Maritime mobile (/MM): on board a ship at sea")],
    MA:["/MA",T("Barco fondeado (/MA): a bordo de un barco anclado","Maritime anchored (/MA): on board an anchored vessel")],
    AM:["/AM",T("Móvil aeronáutico (/AM): a bordo de una aeronave","Aeronautical mobile (/AM): on board an aircraft")],
    A:["/A",T("Dirección alternativa (/A): desde un segundo domicilio fijo","Alternative address (/A): from a second fixed location")],
    QRP:["/QRP",T("Indica que transmite con baja potencia (QRP)","Says it is transmitting with low power (QRP)")],
    QRPP:["/QRPP",T("Indica potencia muy baja (QRPp), normalmente 1 W o menos","Says very low power (QRPp), usually 1 W or less")],
    LH:["/LH",T("Desde un faro (uso habitual en actividades de faros)","From a lighthouse (common in lighthouse activities)")],
    B:["/B",T("Baliza: transmisor automático","Beacon: automatic transmitter")],
    BCN:["/BCN",T("Baliza: transmisor automático","Beacon: automatic transmitter")]};
  for(const x of p){if(x===core)continue;if(M[x])return M[x]}return null}
window.ACRACB_sufTag=sufTag;
function curOf(call,dxcc){const c=String(call||"").toUpperCase(),p=c.split("/"),suf=p.length>1?p[p.length-1]:"";
  if(suf==="MM")return ["Móvil marítimo","Maritime mobile"];if(suf==="AM")return ["Móvil aeronáutico","Aeronautical mobile"];
  {let en=null;try{en=callEnt(c)}catch(_){}if(+dxcc===13||(en&&/^(Antártida|Antarctica)$/i.test(en.name||"")))return ["Base en la Antártida","Antarctic base"]}
  const core=p.reduce((a,x)=>x.length>a.length?x:a,"");
  if(/\d{3,}/.test(core)||/^[A-Z]{2}\d{2,}[A-Z]/.test(core)||(core.length>=7&&/^[A-Z0-9]+$/.test(core)&&/\d/.test(core)))return ["Indicativo especial","Special event call"];
  return null}
/* 2.11.5: interruptores claros (encendido o apagado), cada uno con su explicación a la vista */
function alXRow(){const X=alX(),b=(k,es,en,tl,tle)=>`<button type="button" class="alxb" role="switch" data-alx="${k}" aria-checked="${X[k]}"><span class="alxt"><b>${T(es,en)}</b><small>${e2(T(tl,tle))}</small></span><span class="alxs" aria-hidden="true"></span></button>`;
  /* 2.11.75: los interruptores van en un desplegable, cerrado de entrada; el resumen dice cuántos hay encendidos */
  const ks=["cur","far","soc","act","ct"],on=ks.filter(k=>X[k]).length;
  return `<details class="alxr alxd"${ALXOPEN?" open":""}><summary class="alxh">${T("Avisar también de","Also alert me to")} <span class="alxn">${T(`${on} de ${ks.length} encendidos`,`${on} of ${ks.length} on`)}</span></summary><div class="alxg">${b("cur","Indicativos curiosos","Unusual calls","Móvil marítimo o aeronáutico, bases en la Antártida e indicativos especiales","Maritime or aeronautical mobile, Antarctic bases and special event calls")}${b("far","DX lejano","Far DX","A 15.000 km o más de tu estación","15,000 km or more from your station")}${b("soc","Socios de ACRACB","ACRACB members","Spots que comunican los socios desde la plataforma","Spots members post from the platform")}${b("act","Activaciones","Activations","POTA, SOTA, WWFF, IOTA, DME y otros programas","POTA, SOTA, WWFF, IOTA, DME and other programs")}${b("ct","Concursos en marcha","Contests running","Los que están en el aire ahora y cuándo terminan","Those on the air now and when they end")}</div></details>`}
let ALXOPEN=false;document.addEventListener("toggle",ev=>{const d=ev.target;if(d&&d.classList&&d.classList.contains("alxd"))ALXOPEN=d.open},true);
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-alx]");if(!b)return;const X=alX(),k=b.dataset.alx;X[k]=!X[k];document.querySelectorAll(`[data-alx="${k}"]`).forEach(e=>e.setAttribute("aria-checked",X[k]));
  try{localStorage.setItem(ALXK,JSON.stringify({cur:X.cur?1:0,far:X.far?1:0,soc:X.soc?1:0,act:X.act?1:0,ct:X.ct?1:0}))}catch(_){}
  /* 2.11.69: la lista se rehace, pero el interruptor que has tocado se queda en el mismo sitio de la pantalla */
  const y0=b.getBoundingClientRect().top;
  try{alertCards()}catch(_){}try{alBar()}catch(_){}try{foldSums()}catch(_){}
  try{const nb=document.querySelector(`#alerts [data-alx="${k}"]`)||document.querySelector(`[data-alx="${k}"]`);if(nb){const dy=nb.getBoundingClientRect().top-y0;if(Math.abs(dy)>1)window.scrollBy(0,dy);try{nb.focus({preventScroll:true})}catch(_){}}}catch(_){}});
function buildAlerts(){let lh=null;try{lh=localNow()}catch(_){}if(lh==null)lh=st.mhour;
  const H=alHave();
  const best=new Map();
  for(const s of (typeof SPOTS==="function"?SPOTS():(L.spots||[]))){
    if(s.band==null||s.band>10||(BSEL.size&&!BSEL.has(s.band)))continue;let K="";try{K=spotKind(s)}catch(_){}
    /* 2.11.65: un indicativo extranjero con una referencia DME española en el comentario está mal copiado: no avisa */
    try{if(window.ACRACB_dmeDx&&ACRACB_dmeDx(s)!=null){const ce=callEnt(s.call);if(ce&&ce.dxcc!=null&&![281,21,29,32].includes(+ce.dxcc))continue}}catch(_){}
    const X0=alX(),isSoc=!!(s.src&&String(s.src).includes("ACRACB")),hasRef=!!String(s.ref||"").trim();
    if(K!=="dx"&&K!=="ind"&&!((X0.soc&&isSoc)||(X0.act&&hasRef)))continue;
    let e=null,a=null,pp=0;try{e=spotEval(s,lh);a=spotAge(s);pp=e?spotProb(s,e,a).p:0}catch(_){}
    if(!e||a==null||a>30||pp<.1)continue;
    let t=null;try{t=tFor(s)}catch(_){}const dxcc=(t&&t.dxcc)||(+s.dxcc||null);const mg=mgOf(s.mode,s.f),bk=typeof BKEY!=="undefined"?BKEY[s.band]:s.band;
    const ck="C:"+SK(s.call),ek="E:"+dxcc+"|"+bk+"|"+mg;if(H[ck]||H[ek])continue;
    const dp=dxpInfo(s.call);let rk=0,why="",whyEn="",sub="";
    const LE=LOG&&dxcc?LOG.e[dxcc]:null,LM=LOG&&LOG.m&&dxcc?LOG.m[dxcc]:null;
    const wkCall=LOG&&LOG.calls?LOG.calls[SK(s.call)]:null;
    const dpDone=dp&&wkCall&&(!dp.start||wkCall>=String(dp.start).replace(/-/g,""));
    if(LOG&&dxcc){
      const anyC=LE&&Object.values(LE).includes("C"),bS=LE?LE[bk]:null,mS=LM?LM[mg]:null;
      if(!anyC){rk=5;why=LE?"Entidad sin confirmar":"Entidad nueva";whyEn=LE?"Entity not confirmed":"New entity";sub="ent"}
      else if(bS!=="C"){rk=3;why=bS?"Sin confirmar en "+BANDS[s.band]:"Banda nueva: "+BANDS[s.band];whyEn=bS?"Not confirmed on "+BANDS[s.band]:"New band: "+BANDS[s.band];sub="band"}
      else if(LOG.m&&mS!=="C"){rk=2;why=(mS?"Sin confirmar en ":"Modo nuevo: ")+MGN[mg][0];whyEn=(mS?"Not confirmed in ":"New mode: ")+MGN[mg][1];sub="mode"}
    }
    if(dp&&!dpDone&&rk<4){rk=4;if(!why){why="DXpedición";whyEn="DXpedition";sub="dxp"}}
    if(!rk&&!LOG&&dp&&!dpDone){rk=4;why="DXpedición";whyEn="DXpedition";sub="dxp"}
    /* 2.10.34: también lo curioso y lo lejano, cada uno con su interruptor */
    if(!rk){const X=alX(),km=e.km||0,cu=X.cur?curOf(s.call,dxcc):null;
      if(cu){rk=1;why=cu[0];whyEn=cu[1];sub="cur"}
      else if(X.far&&km>=FARKM){rk=1;why="DX lejano · "+km.toLocaleString("es-ES")+" km";whyEn="Far DX · "+km.toLocaleString("en-US")+" km";sub="far"}
      else if(X.soc&&isSoc){rk=1;why="Spot de un socio";whyEn="Member's spot";sub="soc"}
      else if(X.act&&hasRef){const r=String(s.ref).trim().split(/\s+/).slice(0,2).join(" ");rk=1;why="Activación · "+r;whyEn="Activation · "+r;sub="act"}}
    if(!rk)continue;
    const it={call:s.call,f:s.f,band:s.band,mode:s.mode,t:s.t,by:s.by,c:s.c||"",need:sub==="dxp"?"DXpedición":why,why,whyEn,sub,rk,pp,dxp:!!(dp&&!dpDone),dxcc,ek,ck,end:dp&&dp.end||null};
    const k=SK(s.call),o=best.get(k);if(!o||rk>o.rk||(rk===o.rk&&pp>o.pp))best.set(k,it)}
  return [...best.values()].sort((a,b)=>b.rk-a.rk||(b.dxp-a.dxp)||b.pp-a.pp).slice(0,20)}
window.ACRACB_buildAlerts=()=>{try{return buildAlerts()}catch(e){console.error(e);return null}};
function alRefresh(){if(!L.alert)L.alert={at:L.spotsUTC||L.updatedUTC||new Date().toISOString(),items:[]};const it=window.ACRACB_buildAlerts();if(it)L.alert.items=it}
function alTag(x){const sub=x.sub||(/DXped/i.test(String(x.need||""))?"dxp":"rare");const cls=sub==="dxp"?"xs dxpt":sub==="ent"?"xs alnew":sub==="soc"?"xsoc":(sub==="rare"||sub==="cur"||sub==="far"||sub==="act")?"xr":"xr allog";
  const tx=x.why?T(x.why,x.whyEn||x.why):(sub==="dxp"?T("DXpedición","DXpedition"):T("entidad rara","rare entity"));
  return `<span class="xtag ${cls}">${e2(tx)}</span>`+(x.dxp&&sub!=="dxp"?`<span class="xtag xs dxpt">${T("DXpedición","DXpedition")}</span>`:"")}
/* 2.10.36: «Ya la tengo» con icono, discreto, y deshacer durante unos segundos */
const HAVEIC='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12.5l2.7 2.7L16 9.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function alHaveBtn(x,ic){const k=SK(x.call),tl=T(`Ya la tengo: no avisarme más de ${k}`,`Got it already: stop alerting me to ${k}`);
  return `<button type="button" class="alhave${ic?" alhi":""}" data-alhave="${e2(k)}" title="${e2(tl)}" aria-label="${e2(tl)}">${HAVEIC}${ic?"":`<span>${T("Ya la tengo","Got it")}</span>`}</button>`}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-alhave]");if(!b)return;ev.preventDefault();ev.stopPropagation();
  const k=b.dataset.alhave,x=((L.alert&&L.alert.items)||[]).find(i=>SK(i.call)===k);const H=alHave(),now=Date.now(),yr=now+365*864e5;let SNAP="{}";try{SNAP=localStorage.getItem(ALHK)||"{}"}catch(_){}
  if(x){if(x.dxp||x.sub==="dxp"){const e=x.end?Date.parse(x.end+"T23:59:59Z"):NaN;H[x.ck]=isFinite(e)&&e>now?e+864e5:now+60*864e5}if(x.ek&&!/^E:null/.test(x.ek))H[x.ek]=yr;if(!x.dxp)H["C:"+k]=now+30*864e5}else{const dp=dxpInfo(k),e=dp&&dp.end?Date.parse(dp.end+"T23:59:59Z"):NaN;H["C:"+k]=isFinite(e)&&e>now?e+864e5:now+30*864e5}
  try{localStorage.setItem(ALHK,JSON.stringify(H))}catch(_){}
  const tb=document.getElementById("bandtoast")||(()=>{const d=document.createElement("div");d.id="bandtoast";d.className="bandtoast";d.setAttribute("role","status");document.body.appendChild(d);return d})();
  tb.innerHTML=`<span>${e2(T(`Hecho: no te avisaré más de ${k}.`,`Done: no more alerts for ${k}.`))}</span><button type="button" class="tbundo" data-alundo>${T("Deshacer","Undo")}</button>`;tb.classList.add("on","tbact");tb._snap=SNAP;clearTimeout(tb._t);tb._t=setTimeout(()=>tb.classList.remove("on","tbact"),6000);
  const redo=()=>{try{alertCards()}catch(_){}try{alBar()}catch(_){}try{foldSums()}catch(_){}try{dxCards()}catch(_){}};
  /* la estación se despide con una pequeña animación antes de quitarla */
  const rows=[...document.querySelectorAll(`[data-alhave="${CSS.escape(k)}"]`)].map(e=>e.closest(".sc")).filter(r=>r&&!r.classList.contains("dxc"));
  if(rows.length&&!matchMedia("(prefers-reduced-motion: reduce)").matches){rows.forEach(r=>{r.style.height=r.offsetHeight+"px";r.classList.add("algone")});setTimeout(redo,260)}else redo()},true);
document.addEventListener("click",ev=>{const u=ev.target.closest&&ev.target.closest("[data-alundo]");if(!u)return;ev.preventDefault();ev.stopPropagation();const tb=document.getElementById("bandtoast");
  try{localStorage.setItem(ALHK,tb&&tb._snap||"{}")}catch(_){}if(tb){tb.classList.remove("on","tbact");clearTimeout(tb._t)}
  try{alertCards()}catch(_){}try{alBar()}catch(_){}try{foldSums()}catch(_){}try{dxCards()}catch(_){}},true);
const withHave=(html,x)=>html.includes('class="sc scl')?html.replace('class="sc scl','class="sc scl alr').replace('<span class="l-x" aria-hidden="true"></span>',`<span class="l-hx">${alHaveBtn(x,true)}<span class="l-x" aria-hidden="true"></span></span>`):html.includes('<div class="ohr">')?html.replace('<div class="ohr">','<div class="ohr">'+alHaveBtn(x)):html.replace(/<\/div>\s*$/,alHaveBtn(x)+"</div>");
function alRow(x){const sp=(L.spots||[]).find(s=>s.call===x.call)||{};const band=x.band!=null?x.band:sp.band;const mode=x.mode||sp.mode||"";return {x,sp,band,mode,g:mgrp(mode,x.f!=null?x.f:sp.f)}}
function alOK(x){const r=alRow(x);return (!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band)))}
window.ACRACB_alOK=x=>{try{return alOK(x)}catch(e){return true}};
/* 2.6.6: silenciar los avisos de la portada y las notificaciones: 1 hora, hasta mañana a las 8:00 o hasta reactivarlos */
const MUTEK="acracb_almute";
const muteUntil=()=>{try{const v=localStorage.getItem(MUTEK);if(!v)return 0;return v==="inf"?Infinity:+v||0}catch(_){return 0}};
const alMuted=()=>muteUntil()>Date.now();window.ACRACB_alMuted=alMuted;window.ACRACB_muteTxt=()=>{try{return muteTxt()}catch(_){return ""}};
function setMute(kind){let v="";if(kind==="60")v=String(Date.now()+36e5);else if(kind==="tom"){const d=new Date();d.setDate(d.getDate()+(d.getHours()>=8?1:0));d.setHours(8,0,0,0);v=String(+d)}else if(kind==="inf")v="inf";
  try{v?localStorage.setItem(MUTEK,v):localStorage.removeItem(MUTEK)}catch(_){}alBar();muteBanner()}
function muteTxt(){const u=muteUntil();if(u===Infinity)return T("hasta que los reactives","until you turn them back on");const d=new Date(u),hm=d.toLocaleTimeString(window.ACRACB_LANG==="en"?"en-US":"es-ES",{hour:"2-digit",minute:"2-digit"});
  return new Date().toDateString()===d.toDateString()?T("hasta las "+hm,"until "+hm):T("hasta mañana a las "+hm,"until tomorrow at "+hm)}
function muteBanner(){const box=$("alerts");if(!box)return;let b=document.getElementById("almute");if(!alMuted()){if(b)b.remove();return}
  if(!b){b=document.createElement("div");b.id="almute";b.className="almute";box.insertAdjacentElement("beforebegin",b)}
  b.innerHTML=`<span class="almi">${BELL_OFF}</span><span>${T("Avisos de la portada y notificaciones silenciados","Home-screen alerts and notifications muted")} ${e2(muteTxt())}.</span><button type="button" class="btn" data-unmute>${T("Reactivar","Turn back on")}</button>`}
const BELL_OFF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 21a2 2 0 0 1-3.4 0M18.6 13.1A7.6 7.6 0 0 1 18 10V8a6 6 0 0 0-9.3-5M6.3 6.3A6 6 0 0 0 6 8v2a7.6 7.6 0 0 1-2 5.2V17h13M3 3l18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
document.addEventListener("click",ev=>{const t=ev.target;if(!t.closest)return;
  const mb=t.closest("#almb");if(mb){const m=document.getElementById("almenu");if(m){const op=m.hidden;m.hidden=!op;mb.setAttribute("aria-expanded",String(op))}return}
  const mu=t.closest("[data-mute]");if(mu){setMute(mu.dataset.mute);return}
  if(t.closest("[data-unmute]")){setMute("");return}
  const m=document.getElementById("almenu");if(m&&!m.hidden&&!t.closest("#almenu")){m.hidden=true;const b=document.getElementById("almb");b&&b.setAttribute("aria-expanded","false")}});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"){const m=document.getElementById("almenu");if(m&&!m.hidden){m.hidden=true}}});
document.addEventListener("acracb:band",()=>{try{alBar()}catch(e){}});
function alBar(){const el=$("albar");if(!el)return;if(alMuted()){el.hidden=true;muteBanner();return}muteBanner();try{alRefresh()}catch(_){}const al=L.alert;if(!al||!Array.isArray(al.items)){el.hidden=true;return}
  const age=al.at?(Date.now()-Date.parse(al.at))/6e4:1e9;let off=null;try{off=sessionStorage.getItem("aloff")}catch(e){}
  const hb=(typeof HB==="function")?HB():null;const rows=al.items.map(alRow).filter(r=>(!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band)))&&(hb==null||r.band===hb));
  if(!rows.length||age>150||off===al.at){el.hidden=true;el.innerHTML="";return}
  /* 2.4.1: con la lista de Avisos a la vista, el aviso flotante sobra y la tapaba */
  {const fa=$("f_al");if(typeof st!=="undefined"&&st.page==="dx"&&fa&&fa.getClientRects().length){el.hidden=true;return}}
  const shown=rows.slice(0,3);
  el.hidden=false;el.classList.add("albar2");
  el.innerHTML=`<div class="alh"><b>${T("Aviso DX","DX alert")} <span class="alt">${esc((x=>{try{return fmtT(x)}catch(e){const d=new Date(x);return isNaN(d)?"":d.toLocaleTimeString(T("es-ES","en-US"),{hour:"2-digit",minute:"2-digit"})}})(al.at))}</span></b><span class="alb"><span class="almw"><button type="button" class="almb" id="almb" aria-haspopup="menu" aria-expanded="false" title="${T("Silenciar avisos","Mute alerts")}">${BELL_OFF}<span>${T("Silenciar","Mute")}</span></button><span class="almenu" id="almenu" role="menu" hidden><button type="button" role="menuitem" data-mute="60">${T("1 hora","1 hour")}</button><button type="button" role="menuitem" data-mute="tom">${T("Hasta mañana a las 8:00","Until tomorrow 8:00")}</button><button type="button" role="menuitem" data-mute="inf">${T("Hasta que los reactive","Until I turn them back on")}</button></span></span><button type="button" class="lnk" id="algo">${rows.length>shown.length?T(`Ver los ${rows.length}`,`See all ${rows.length}`):T("Ver en Avisos","See in Alerts")}</button><button type="button" class="lnk" id="alx" aria-label="${T("Cerrar aviso","Close alert")}">${T("Cerrar","Close")}</button></span></div><p class="alsub">${T("Lo que puedes trabajar tú ahora y te interesa: lo que falta en tu log, DXpediciones y DX curioso o lejano. Todo lo que se anuncia en el mundo está en DX › Clúster.","What you can work right now and is worth it: what your log is missing, DXpeditions and unusual or far DX. Everything spotted worldwide is in DX › Cluster.")}</p>
  <div class="alc">${shown.map(({x,sp,band,mode})=>{const stg=splitTags({c:cTr(x.c||sp.c||"")});
    const tag=alTag(x);let a=null;try{a=spotAge({t:x.t})}catch(e){}
    return withHave(card({...PC({call:x.call,band,mode,f:x.f,dx:sp.dx,from:sp.from,c:cTr(x.c||sp.c),t:x.t},a),call:x.call,a,t:x.t,f:x.f,band,mode,tags:[tag].concat(stg.pr),by:CSL(String(x.by||"").split(/[ ,]+/).filter(Boolean),", "),xs:stg.xs,geo:geoOf(sp.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(x.call)))}),x)}).join("")}</div>`;
  $("algo").onclick=()=>{go("dx");try{selTab("dx","f_al",true)}catch(e){}el.hidden=true;const fa=$("f_al");if(fa){fa.open=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{try{fa.scrollIntoView({block:"start",behavior:"smooth"})}catch(e){fa.scrollIntoView()}}))}};$("alx").onclick=()=>{try{sessionStorage.setItem("aloff",al.at)}catch(e){}el.hidden=true}}
window.renderAlBar=alBar;document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest(".nav button,#subnav button,.ptabs button,[data-pg]"))setTimeout(()=>{try{alBar()}catch(e){}},80)},true);
function hookA(){if(window.__hkAl)return true;if(typeof window.renderAlerts!=="function")return false;window.__hkAl=1;const o=window.renderAlerts;const w=function(){const r=o.apply(this,arguments);try{alertCards()}catch(e){console.error(e)}return r};w.__cl=1;window.renderAlerts=w;return true}
if(!hookA()){const t2=setInterval(()=>{if(hookA())clearInterval(t2)},200);setTimeout(()=>clearInterval(t2),15000)}


/* ---------- 2.4.1: DXpediciones con la misma tarjeta por secciones ---------- */
let DXOPEN=false;
/* 2.10.36: «Ya la tengo» también en cada DXpedición: deja de avisarte de ella hasta que termine; se puede quitar */
function dxHaveRow(call){const k=SK(call),H=alHave();return H["C:"+k]?`<div class="dxhv"><span class="dxgot">${HAVEIC}${T("La tienes: no te avisará más","You have it: no more alerts")}</span><button type="button" class="lnk" data-alunhave="${e2(k)}">${T("Quitar","Remove")}</button></div>`:`<div class="dxhv">${alHaveBtn({call})}</div>`}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-alunhave]");if(!b)return;ev.preventDefault();ev.stopPropagation();const H=alHave();delete H["C:"+b.dataset.alunhave];
  try{localStorage.setItem(ALHK,JSON.stringify(H))}catch(_){}try{dxCards()}catch(_){}try{alertCards()}catch(_){}try{alBar()}catch(_){}try{foldSums()}catch(_){}},true);
function dxCards(){const box=$("dxl");if(!box||!Array.isArray(L.dx)||typeof tFor!=="function")return;const lh=st.mhour;
  const html=[];L.dx.forEach((d,i)=>{let t=null;try{t=tFor(d)}catch(e){}if(!t||!isFinite(d.lon)||!isFinite(d.lat))return;const p=[d.lon,d.lat];
    const gk=geoKm(TXP,p),az=Math.round(gk.az)%360,km=Math.round(gk.km),lkm=Math.round(gk.lkm),laz=(az+180)%360;
    let bh={p:0,h:0,b:0,lp:false};for(let x=0;x<24;x++){const r=bestAny(t,x);if(r.p>bh.p)bh={...r,h:x}}const n=bestAny(t,lh);
    let nw=false;try{nw=dxNew(d)}catch(e){}const e=callEnt(d.call);/* 2.11.96: sin repetir el país («Madagascar · Madagascar (Ste. Marie)» → «Madagascar · Ste. Marie») */
    const cty=(()=>{if(!(e&&e.name))return "";const en=String(d.ent||""),nm=e.name;if(!en||en.toLowerCase()===nm.toLowerCase())return "";const m=en.match(/^(.*?)\s*\(([^)]+)\)\s*$/);const extra=m&&m[1].toLowerCase()===nm.toLowerCase()?m[2]:en;return ` <span class="cty">· ${e2(extra)}</span>`})();
    /* 2.11.67: se dice cuando solo se conoce el prefijo o no se han anunciado los modos */
    const pfx=!dxTok(d.call).some(z=>/\d[A-Z]{1,4}(\/[A-Z0-9]+)?$/.test(z));
    const tags=[pfx?`<span class="tag">${T("indicativo sin anunciar","callsign not announced")}</span>`:"",!(Array.isArray(d.modes)&&d.modes.length)?`<span class="tag">${T("modo sin anunciar","mode not announced")}</span>`:"",MOD()==="ssb"&&d.ssb===false?`<span class="tag">${T("fonía sin confirmar","phone unconfirmed")}</span>`:"",d.until?`<span class="sc-b">${T("hasta","until")} ${e2(d.until)}</span>`:""].filter(Boolean);
    let air="";try{air=(window.ACRACB_dxon?ACRACB_dxon(d):"").replace(/<br>$/,"")}catch(x){}
    let gl="";try{gl=window.ACRACB_grey?ACRACB_grey.short(p).replace(/^(Línea gris común|Shared greyline):?\s*/,""):""}catch(x){}
    const sec=(l,v)=>v?`<dt>${l}</dt><dd>${v}</dd>`:"";
    const c0=dxTok(d.call)[0]||String(d.call||"");const la=lastAge(c0),act=isAct(la);html.push({act,la,h:`<div class="sc dxc ohc${act?"":" old"}" data-dxi="${i}"><div class="sc-h"><span class="sc-call">${stBtn(c0,n.p>0?n.b:null,nw?"★ ":"✔ ",d.call)}${cty}</span><span class="dxh-r">${ageTag(lastAge(c0),"")}<span class="pill ${cls(n.p)}" title="${T("Fiabilidad para ti ahora en","Reliability for you now on")} ${BANDS[n.b]||""}">${Math.round(n.p*100)} %${n.p>0&&BANDS[n.b]?" · "+BANDS[n.b]:""}</span></span></div>
      ${tags.length?`<div class="sc-f">${tags.join("")}</div>`:""}<dl class="sc-d">${sec(T("Actividad","Activity"),air)}
      ${sec(T("Mejor hora","Best time"),`<span class="nw">${hh(bh.h)}:00 ${T("en","on")} <b style="color:${BC[bh.b]}">${BANDS[bh.b]}</b></span> <span class="nw">(${Math.round(bh.p*100)} %${bh.lp?T(", paso largo",", long path"):""})</span>`)}
      ${sec(T("Rumbo","Bearing"),`<span class="nw">${T("corto","short")} ${az}° ${cab(az)}<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${laz}° ${cab(laz)}</span>`)}
      ${sec(T("Distancia","Distance"),`<span class="nw">${T("corto","short")} ${fk(km)} km<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${fk(lkm)} km</span>`)}
      ${(()=>{/* 2.11.60: como el resto de tarjetas, la señal de ahora (le oirás / te oirá) en su mejor banda */let v="";try{v=n.p>0?sigRow({call:c0,band:n.b,mode:MOD(),dx:[t.lon,t.lat]},{t},{p:n.p,p0:n.p,lp:!!n.lp}):`<span class="sgnone">${T("Ahora ninguna banda llega con tu estación.","No band gets through from your station now.")}</span>`}catch(_){}return sec(T("Señal","Signal")+(n.p>0&&BANDS[n.b]?` <small>${BANDS[n.b]}</small>`:""),v)})()}
      ${sec(T("Línea gris","Greyline"),gl)}${sec("QSX",d.qsx?e2(String(d.qsx).replace(/\s*,\s*/g,", ")):"")}</dl>${!act?"":ACRACB_ohBox({t:t.id,b:n.p>0?n.b:bh.b,call:SK(c0),mode:(()=>{try{return MD().s}catch(_){return ""}})()})}${dxHaveRow(c0)}</div>`})});
  {const on=html.filter(x=>x.act).sort((a,b)=>a.la-b.la),off=html.filter(x=>!x.act);html.length=0;on.forEach(x=>html.push(x.h));if(off.length){html.push(`<p class="dxoffh">${T("Anunciadas, sin spots en la última hora","Announced, no spots in the last hour")}</p>`);off.forEach(x=>html.push(x.h))}}
  const N=8,more=html.length>N+2&&!DXOPEN,nMore=html.slice(N).filter(x=>x.startsWith("<div")).length;
  box.innerHTML=(more?html.slice(0,N):html).join("")+(more?`<button type="button" class="btn llmore" id="dxmore">${T(`Ver ${nMore} DXpediciones más`,`Show ${nMore} more DXpeditions`)}</button>`:"")+
    (L.dxHidden&&MOD()==="ssb"?`<p class="note" style="margin:4px 0 0">${T(`No se muestran ${L.dxHidden} expediciones activas que no anuncian fonía.`,`${L.dxHidden} active expeditions that do not announce phone are not shown.`)}</p>`:"");
  const mb2=$("dxmore");if(mb2)mb2.onclick=()=>{DXOPEN=true;dxCards()};
}
window.ACRACB_dxCards=dxCards;

/* ---------- 2.7.0: el mismo comportamiento en todas las tarjetas de estación ----------
   El texto «¿Lo oyes?» abre «¿Oyes a…?» (Lo oigo / Me oyen) y tocar el indicativo abre la ficha completa del indicativo,
   en cualquier parte de la plataforma, no solo en la pestaña DX. */
const SK=c=>String(c||"").toUpperCase().trim();
function stBtn(call,b,pre,shown){return `<span class="stc" data-stc="${e2(SK(call))}" data-stb="${b!=null&&b<10?b:""}">${pre||""}${CS(shown||call)}</span>`}
function stPos(C){try{const i=(L.dx||[]).findIndex(d=>dxTok(d.call).includes(C));const d=i>=0?L.dx[i]:null;if(d&&isFinite(d.lon)&&isFinite(d.lat))return {p:[d.lon,d.lat],d,i}}catch(_){}
  try{const s=(L.spots||[]).find(s=>SK(s.call)===C&&s.dx&&s.dx[0]!=null);if(s)return {p:s.dx}}catch(_){}
  try{const a=window.ACRACB_areaPos&&ACRACB_areaPos(C);if(a)return {p:a}}catch(_){}return {p:null}}
function stZone(C,pos,b,d){try{if(d){const t=tFor(d);if(t)return t}}catch(_){}try{if(!pos)return null;const ev=spotEval({call:C,dx:pos,band:b!=null?b:3,kind:"dx",from:[]},localNow());return ev&&ev.t?ev.t:null}catch(_){return null}}
document.addEventListener("click",ev=>{const cs=ev.target.closest&&ev.target.closest(".cs[data-call]");if(!cs||cs.closest("#cpop,#ohdlg,a"))return;if(typeof openCall!=="function")return;
  ev.preventDefault();ev.stopPropagation();try{openCall(cs.dataset.call)}catch(e){console.error(e)}},true);
/* tarjetas sin datos de banda (DXpediciones, objetivos, quién te oye…): la mejor banda de ahora para esa estación */
function dCard(card){if(card.dataset.ohc)return dOf(card);const bt=card.querySelector("[data-stc]");if(!bt)return null;const C=bt.dataset.stc;const P=stPos(C);let b=bt.dataset.stb===""?null:+bt.dataset.stb;
  const t=stZone(C,P.p,b,P.d);if(!t)return null;if(b==null){try{const r=bestAny(t,localNow());b=r.p>0?r.b:3}catch(_){b=3}}
  let mode=card.dataset.mode||"";if(!mode){try{mode=MD().s}catch(_){}}return {t:t.id,b,call:C,mode,f:card.dataset.f||""}}

/* ---------- 2.8.1: buscador libre: indicativo, frecuencia, banda, modo, programa, referencia o país, combinables ----------
   Ejemplos: «EA5RKB», «EA5RKB/P», «VP8/G3ABC», «EA5*», «*-MM» (barra), «14.074», «14074», «20m FT8», «40 CW EA», «POTA», «US-1234», «Japón».
   Cada palabra se reconoce sola; si hay varias, se combinan (banda Y modo Y indicativo…). */
const QT=x=>(window.ACRACB_LANG==="en"?"\u201c":"\u00ab")+x+(window.ACRACB_LANG==="en"?"\u201d":"\u00bb");
const NOACC=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toUpperCase();
const MODEW={SSB:"SSB",LSB:"SSB",USB:"SSB",FONIA:"SSB",PHONE:"SSB",VOZ:"SSB",VOICE:"SSB",CW:"CW",MORSE:"CW",TELEGRAFIA:"CW",FT8:"FT8",FT4:"FT4",RTTY:"RTTY",PSK:"PSK",PSK31:"PSK",PSK63:"PSK",JS8:"JS8",AM:"AM",FM:"FM",SSTV:"SSTV",MSK144:"MSK144",Q65:"Q65",JT65:"JT65",FST4:"FST4",OLIVIA:"OLIVIA",DIGI:"DIGI",DIGITAL:"DIGI",DIGITALES:"DIGI",DATA:"DIGI",DV:"DV",DMR:"DV",DSTAR:"DV","D-STAR":"DV",C4FM:"DV",FREEDV:"DV"};
const DIGIS=new Set(["FT8","FT4","RTTY","PSK","JS8","MSK144","Q65","JT65","FST4","OLIVIA","SSTV","DIGI"]);
const BANDW={"160":0,"80":1,"75":1,"60":8,"40":2,"30":9,"20":3,"17":4,"15":5,"12":6,"10":7,"6":10,"2":11,"70CM":12,"70":12};
const FREQB=[[1800,2000,0],[3500,4000,1],[5250,5450,8],[7000,7300,2],[10100,10150,9],[14000,14350,3],[18068,18168,4],[21000,21450,5],[24890,24990,6],[28000,29700,7],[50000,54000,10],[144000,148000,11],[430000,440000,12]];
function bandOfK(k){const r=FREQB.find(x=>k>=x[0]&&k<=x[1]);return r?r[2]:null}
function qParse(q){const raw=String(q||"").trim();const Q={bands:new Set(),modes:new Set(),progs:new Set(),f:null,calls:[],words:[],chips:[],cont:null,age:null};
  const toks=NOACC(raw).replace(/,/g,".").replace(/(\d)\s+(M|CM|MHZ|KHZ)\b/g,"$1$2").split(/[\s;]+/).filter(Boolean);
  for(let t of toks){let m;
    if(MODEW[t]){Q.modes.add(MODEW[t]);Q.chips.push(T("modo ","mode ")+MODEW[t]);continue}
    if(PROGS.includes(t)){Q.progs.add(t);Q.chips.push(t);continue}
    if(t==="DX"){Q.progs.add("dx");Q.chips.push("DX");continue}
    if((m=t.match(/^(\d{1,3})(M|CM)$/))&&BANDW[m[2]==="CM"?m[1]+"CM":m[1]]!=null){const b=BANDW[m[2]==="CM"?m[1]+"CM":m[1]];Q.bands.add(b);Q.chips.push(T("banda ","band ")+BANDS[b]);continue}
    if((m=t.match(/^(\d+(?:\.\d+)?)(MHZ|KHZ)?$/))){const v=parseFloat(m[1]);if(!(v>0))continue;let k,tol;
      if(m[2]==="KHZ"||(!m[2]&&!m[1].includes(".")&&v>=1000)){k=v;tol=1.5}
      else if(m[1].includes(".")){const d=m[1].split(".")[1].length;k=v*1000;tol=d>=3?1.5:d===2?6:60}
      else if(!m[2]&&BANDW[m[1]]!=null&&!["1","3","5","7","14","18","21","24","28","50","144","430","432"].includes(m[1])){Q.bands.add(BANDW[m[1]]);Q.chips.push(T("banda ","band ")+BANDS[BANDW[m[1]]]);continue}
      else{k=v*1000;const b=bandOfK(k)??bandOfK(k+1);if(b!=null&&tol==null){Q.bands.add(b);Q.chips.push(T("banda ","band ")+BANDS[b]);continue}tol=1000}
      Q.f={k,tol};Q.chips.push((k/1000).toFixed(tol>=60?1:3)+" MHz");continue}
    /* indicativo (con prefijos y sufijos: EA8/DF4UE, EA5RKB/P, /MM, /QRP…), comodines * y ?, o referencia de programa (US-1234, EA5/AT-001, EAFF-0123) */
    const cl=t.replace(/[^A-Z0-9/*?\-]/g,"");if(!cl)continue;
    if(/^[A-Z0-9]{1,4}-\d{2,5}$|^[A-Z0-9]{1,3}\/[A-Z]{2}-\d{3}$|^[A-Z]{2,4}FF-\d{3,5}$/.test(cl)){Q.calls.push({ref:cl});Q.chips.push(T("referencia ","reference ")+cl);continue}
    if(/[*?]/.test(cl)){const rx=new RegExp("^"+cl.replace(/[-/]/g,"\\$&").replace(/\*/g,".*").replace(/\?/g,".")+"$");Q.calls.push({rx});Q.chips.push(QT(cl));continue}
    if(/^[A-Z]+$/.test(cl)&&cl.length>=3){Q.words.push(cl);Q.chips.push(QT(cl));continue}
    Q.calls.push({c:cl});Q.chips.push(QT(cl))}
  return (Q.bands.size||Q.modes.size||Q.progs.size||Q.f||Q.calls.length||Q.words.length)?Q:null}
const kHzOf=f=>{const v=parseFloat(f);return !isFinite(v)?NaN:v>1000?v:v*1000};
function mOK(Q,mode){if(!Q.modes.size)return true;const M=NOACC(mode);return Q.modes.has(M)||(Q.modes.has("DIGI")&&DIGIS.has(M))||(Q.modes.has("SSB")&&(M==="LSB"||M==="USB"))||(Q.modes.has("PHONE")&&["SSB","LSB","USB","AM","FM","DV"].includes(M))}
function cMatch(Q,call,ref,ent){const C=String(call||"").toUpperCase(),base=C.split("/").sort((a,b)=>b.length-a.length)[0]||C;
  const one=x=>x.ref?NOACC(ref)===x.ref:x.rx?x.rx.test(C)||x.rx.test(base):C.includes(x.c)||(x.c.includes("/")?false:base.startsWith(x.c));
  const callsOK=!Q.calls.length||Q.calls.some(one);
  const wordsOK=!Q.words.length||Q.words.every(w=>C.includes(w)||NOACC(ent).includes(w));return callsOK&&wordsOK}
function sMatch(Q,o){if(Q.bands.size&&!Q.bands.has(o.band))return false;if(!mOK(Q,o.mode))return false;
  if(Q.progs.size&&!Q.progs.has(o.prog?catOf(o):"dx"))return false;if(Q.f){const k=kHzOf(o.f);if(!isFinite(k)||Math.abs(k-Q.f.k)>Q.f.tol)return false}
  return cMatch(Q,o.call,o.ref,o.ent)}
const CONTS=[["EU","Europa","Europe"],["AF","África","Africa"],["AS","Asia","Asia"],["NA","Norteamérica","North America"],["SA","Sudamérica","South America"],["OC","Oceanía","Oceania"],["AN","Antártida","Antarctica"]];
const contName=k=>{const n=CONTS.find(x=>x[0]===k);return n?T(n[1],n[2]):k};
function selQ(){const g=id=>{const e=$(id);return e?e.value:""};const Q=qParse($("srchq")?$("srchq").value:"")||{bands:new Set(),modes:new Set(),progs:new Set(),f:null,calls:[],words:[],chips:[],cont:null,age:null};
  const b=g("srb"),m=g("srm"),t=g("srt"),k=g("srdx"),ks=g("srcs"),a=g("sra"),en=g("srent");if(en){Q.entn=en;Q.chips.push(en)}
  if(b!==""){Q.bands=new Set([+b]);Q.chips=Q.chips.filter(x=>!/^(banda|band) /.test(x));Q.chips.push(T("banda ","band ")+BANDS[+b])}
  if(m){Q.modes=new Set([m]);Q.chips=Q.chips.filter(x=>!/^(modo|mode) /.test(x));Q.chips.push(T("modo ","mode ")+(m==="DIGI"?T("digitales","digital"):m==="PHONE"?T("fonía","phone"):m))}
  if(t){Q.progs=new Set([t]);Q.chips.push(t==="dx"?"DX":t)}
  if(k){Q.cont=k;Q.chips.push(T("DX en ","DX in ")+contName(k))}if(ks){Q.scont=ks;Q.chips.push(T("spotter en ","spotter in ")+contName(ks))}
  if(a){Q.age=+a;Q.chips.push(T(`últimos ${a} min`,`last ${a} min`))}
  const any=Q.bands.size||Q.modes.size||Q.progs.size||Q.f||Q.calls.length||Q.words.length||Q.cont||Q.scont||Q.age||Q.entn;if(!any)return null;
  /* 2.10.20: el buscador ya no tiene sus propios selectores de banda, modo y tipo: usa el filtro común (estación, clúster y mapa),
     salvo que escribas tú la banda o el modo en la búsqueda («20m FT8») */
  try{if(!Q.bands.size&&BSEL.size)Q.bands=new Set([...BSEL]);if(!Q.modes.size&&!allOn())Q.modes=new Set(CMS().map(k=>{const v=String(MODES[k].s).toUpperCase();return v==="JS8CALL"?"JS8":v}));
    const ALLT=["dx"].concat(PROGS);if(!Q.progs.size&&!ALLT.every(x=>TYPES.has(x)))Q.progs=new Set([...TYPES])}catch(_){}
  return Q}
/* 2.8.3: continente por posición, con las reglas DXCC habituales (Canarias y Madeira en AF, Azores en EU, Turquía asiática,
   Chipre y el Cáucaso en AS, Indonesia, Filipinas y el Pacífico en OC, Hawái en OC, Trinidad en SA…). Sirve para el DX y para el spotter. */
function contLL(p){if(!p||!isFinite(p[0])||!isFinite(p[1]))return null;let [lon,lat]=p;lon=((lon+540)%360)-180;
  if(lat<-60)return "AN";
  if(lon>165||lon<-169)return lat>=55?"AS":lat>=48?"NA":"OC";
  if(lon<=-25){if(lon>-32&&lat>35&&lat<41)return "EU";if(lat>=48&&lon<-130)return "NA";if(lon<-120&&lat<30)return "OC";if(lat<0)return "SA";if(lat<13&&(lat<7.2||lon>-77.5))return "SA";return "NA"}
  if(lon<60){if(lat<=12)return lat<-50?"AN":"AF";if(lon>=34.9&&lat<42)return "AS";if(lon>=32&&lon<34.9&&lat>=34.4&&lat<=35.8)return "AS";
    if(lat>=42){if(lon>=46.5&&lat<=51.5&&lon<60&&lat>=40.5&&!(lon<50&&lat>45))return "AS";if(lon>=40&&lat<43.6&&lon<51)return "AS";return "EU"}
    if(lon>29&&lat>=36)return "AS";if(lat>=36&&lon<-1)return "EU";if(lat>=36&&lon>=12)return "EU";
    if((lon>=14&&lon<=14.7&&lat>=35.7)||(lon>=23.4&&lon<=29&&lat>=34.8)||(lon>=12.3&&lon<=15.7&&lat>=36.6))return "EU";return "AF"}
  if(lat<-10&&lon<80)return "AF";
  if(lon>=95&&lat<=7&&!(lon<104.5&&lat>1))return "OC";if(lon>=116&&lon<=127&&lat>4.5&&lat<=21)return "OC";if(lon>=130&&lat<24)return "OC";return "AS"}
window.ACRACB_cont=contLL;
function contOf(call,dx,band){try{const e=spotEval({call,dx:dx||(window.ACRACB_areaPos&&ACRACB_areaPos(call)),band:band!=null?band:3,kind:"dx",from:[]},st.mhour);return e&&e.t?e.t.cont:null}catch(_){return null}}
function srchRun(){const box=$("srchres"),inp=$("srchq");if(!box||!inp)return;const Q=selQ();{const n=["srb","srm","srdx","srent","srcs","srt","sra"].filter(id=>$(id)&&$(id).value).length,fn=$("srfn");if(fn)fn.textContent=n?`(${n} ${n===1?T("activo","active"):T("activos","active")})`:""}const clr=$("srchx");if(clr)clr.hidden=!Q;if(!Q){box.hidden=true;box.innerHTML="";return}
  const lh=st.mhour;const out=[];
  for(const s of (L.spots||[])){const ent=(s.dxcc||"")+" "+(()=>{try{return (callEnt(s.call)||{}).name||""}catch(_){return ""}})();
    if(!sMatch(Q,{call:s.call,f:s.f,band:s.band,mode:modeOf(s),prog:null,ent}))continue;if(Q.entn&&(()=>{try{return (callEnt(s.call)||{}).name}catch(_){return ""}})()!==Q.entn)continue;const a=spotAge(s);if(Q.age&&!(a!=null&&a<=Q.age))continue;const e=spotEval(s,lh);if(Q.cont&&(s.cont||contLL(s.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(s.call)))||(e&&e.t&&e.t.cont))!==Q.cont)continue;
    if(Q.scont){const fp=Array.isArray(s.from)&&s.from[0]?s.from[0]:null;const by0=(Array.isArray(s.by)?s.by:[s.by])[0];if(contLL(fp||(by0&&window.ACRACB_areaPos&&ACRACB_areaPos(by0)))!==Q.scont)continue}out.push({a,h:spotKind(s)==="near"||!e?nearRow(s,a):dxRow(s,e,a)})}
  try{for(const o of progAll()){let ent="";try{ent=(callEnt(o.call)||{}).name||""}catch(_){}if(!sMatch(Q,{call:o.call,f:o.f,band:o.band,mode:o.mode,prog:o.prog,ref:o.ref,ent}))continue;if(Q.entn&&ent!==Q.entn)continue;if(Q.age&&!(o.a!=null&&o.a<=Q.age))continue;if(Q.cont&&(contOf(o.call,o.dx,o.band)||contLL(o.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(o.call))))!==Q.cont)continue;if(Q.scont)continue;out.push({a:o.a,h:progRow(o)})}}catch(_){}
  out.sort((x,y)=>(x.a??1e9)-(y.a??1e9));
  const onlyCall=Q.calls.filter(x=>x.c).map(x=>x.c);
  const by=onlyCall.length?(L.spots||[]).filter(s=>(Array.isArray(s.by)?s.by:[s.by]).some(b=>onlyCall.some(c=>String(b||"").toUpperCase().includes(c)))):[];
  let dxa="";try{const d=(L.dx||[]).filter(d=>onlyCall.some(c=>String(d.call||"").toUpperCase().includes(c))||Q.words.some(w=>NOACC(d.name||d.dxcc||"").includes(w)));if(d.length)dxa=`<p class="note srdx">${T("DXpedición anunciada","Announced DXpedition")}: ${d.slice(0,3).map(x=>`<b>${CS(dxTok(x.call)[0]||x.call)}</b>${x.until?` · ${T("hasta","until")} ${e2(x.until)}`:""}${x.qsx?` · QSX ${e2(x.qsx)}`:""}`).join("<br>")}</p>`}catch(_){}
  /* sin spots, al menos de qué entidad es ese indicativo o prefijo */
  let pfx="";if(onlyCall.length===1&&/\d/.test(onlyCall[0])){try{const en=callEnt(onlyCall[0]);if(en&&en.name)pfx=`<p class="note srpx">${e2(onlyCall[0])}: <b>${e2(en.name)}</b>. <button type="button" class="lnk" data-srcall="${e2(onlyCall[0])}">${T("Ver su ficha","Open its page")}</button></p>`}catch(_){}}
  const N=60,chips=`<span class="srchips">${Q.chips.map(x=>`<span class="srchip">${e2(x)}</span>`).join("")}</span>`;
  let h=`<p class="srh">${out.length?T(`${out.length} ${out.length===1?"spot reciente":"spots recientes"}`,`${out.length} recent ${out.length===1?"spot":"spots"}`):T("Ningún spot reciente coincide","No recent spot matches")} ${chips}</p>`+dxa+pfx;
  if(out.length)h+=`<div class="sgrid srgrid">${out.slice(0,N).map(x=>x.h).join("")}</div>`+(out.length>N?`<p class="note">${T(`Y ${out.length-N} más: afina la búsqueda con una banda o un modo.`,`And ${out.length-N} more: narrow it down with a band or a mode.`)}</p>`:"");
  if(by.length)h+=`<p class="note srby">${T(`${e2(onlyCall.join(", "))} ha oído a ${by.length} ${by.length===1?"estación":"estaciones"}`,`${e2(onlyCall.join(", "))} has heard ${by.length} ${by.length===1?"station":"stations"}`)}: ${by.slice(0,12).map(s=>`${CS(s.call)} <span class="nw">${e2(s.f)}</span>`).join(" · ")}${by.length>12?" …":""}</p>`;
  box.innerHTML=h;box.hidden=false;const pb=box.querySelector("[data-srcall]");if(pb)pb.onclick=()=>{try{openCall(pb.dataset.srcall)}catch(_){}}}
function srchInit(){const sec=document.querySelector('section[data-pg="dx"]');if(!sec||$("srch"))return;const w=document.createElement("div");w.id="srch";w.className="card srch";
  w.innerHTML=`<label class="srl" for="srchq">${T("Buscar en los clústeres","Search the clusters")}</label><div class="srrow"><input id="srchq" type="search" aria-label="${T("Buscar en los clústeres","Search the clusters")}" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="60" placeholder="${T("Indicativo, frecuencia o país","Callsign, frequency or country")}"><button type="button" class="btn" id="srchx" hidden>${T("Borrar","Clear")}</button></div>
    <details class="srf" id="srf"><summary>${T("Filtros","Filters")} <span class="srfh">${T("país, continente y antigüedad","country, continent and age")}</span>${""} <span class="srfn" id="srfn"></span></summary><div class="srsel">


      <label><span>${T("Continente DX","DX continent")}</span><select id="srdx"><option value="">${T("Todos","All")}</option>${CONTS.map(x=>`<option value="${x[0]}">${T(x[1],x[2])} (${x[0]})</option>`).join("")}</select></label>
      <label><span>${T("País DX","DX country")}</span><select id="srent"><option value="">${T("Todos","All")}</option></select></label>
      <label><span>${T("Oído desde","Heard from")}</span><select id="srcs"><option value="">${T("Todos","All")}</option>${CONTS.map(x=>`<option value="${x[0]}">${T(x[1],x[2])} (${x[0]})</option>`).join("")}</select></label>

      <label><span>${T("Antigüedad","Age")}</span><select id="sra"><option value="">${T("Todas","All")}</option><option value="15">${T("Últimos 15 min","Last 15 min")}</option><option value="30">${T("Últimos 30 min","Last 30 min")}</option><option value="60">${T("Última hora","Last hour")}</option></select></label>
    </div><p class="note srsrc">${T("Busca en los spots recientes del clúster DX y el RBN, en POTA, SOTA, WWFF, IOTA, LLOTA y otros programas (GMA, castillos, faros…) y en las DXpediciones anunciadas. Usa el mismo modo, las mismas bandas y los mismos tipos (DX, POTA…) que el clúster y el mapa, salvo que escribas otros en la búsqueda. En el texto, el asterisco * vale por cualquier cosa (EA8/* o */MM) y también puedes escribir banda o modo (20m FT8).","Searches recent DX cluster and RBN spots, POTA, SOTA, WWFF, IOTA, LLOTA and other programs (GMA, castles, lighthouses…) and announced DXpeditions. It uses the same mode, bands and types (DX, POTA…) as the cluster and the map, unless you type others in the search. In the text box the asterisk * matches anything (EA8/* or */MM) and you can also type a band or mode (20m FT8).")}</p></details>
    <div id="srchres" hidden aria-live="polite"></div>`;
  {const pt=sec.querySelector(":scope>.ptabs");if(pt)pt.after(w);else sec.insertBefore(w,sec.firstElementChild)}let tm=0;const inp=$("srchq"),x=$("srchx");
  inp.addEventListener("input",()=>{clearTimeout(tm);tm=setTimeout(srchRun,220)});x.onclick=()=>{inp.value="";w.querySelectorAll("select").forEach(s=>s.value="");srchRun();inp.focus()};w.querySelectorAll("select").forEach(s=>s.addEventListener("change",srchRun));
  /* 2.10.31: la lista de países se rellena con los que hay ahora en los clústeres, con cuántos spots */
  const fe=()=>{const sel=$("srent");if(!sel)return;const c=new Map();const add=call=>{let n="";try{n=(callEnt(call)||{}).name||""}catch(_){}if(n)c.set(n,(c.get(n)||0)+1)};/* mismos filtros de modo y banda que el resto: el número es lo que vas a ver */(typeof SPOTS==="function"?SPOTS():(L.spots||[])).forEach(z=>add(z.call));try{progAll().filter(o=>modeOK(o)&&(o.a==null||o.a<=60)).forEach(o=>add(o.call))}catch(_){}
    const v=sel.value,h=`<option value="">${T("Todos","All")}</option>`+[...c.entries()].sort((a,b)=>a[0].localeCompare(b[0],EN()?"en":"es")).map(([n,k])=>`<option value="${e2(n)}">${e2(n)} (${k})</option>`).join("");if(sel.dataset.h!==h){sel.innerHTML=h;sel.dataset.h=h;sel.value=v}};
  fe();$("srent").addEventListener("focus",fe);$("srent").addEventListener("pointerdown",fe)}
window.ACRACB_search=q=>{const i=$("srchq");if(!i)return;i.value=q||"";$("srchx").hidden=!q;srchRun()};
/* ---------- enganche ---------- */
function hook(){if(window.__hkSide)return true;if(typeof window.renderSide!=="function")return false;window.__hkSide=1;const o=window.renderSide;
  const w=function(){const r=o.apply(this,arguments);try{if(st.page==="dx"){render(st.mhour);renderNear();dxCards()}}catch(e){console.error(e)}return r};w.__cl=1;window.renderSide=w;return true}
if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},200);setTimeout(()=>clearInterval(t),15000)}
})();
/* 2.10.19: vista compacta: una tarjeta se abre y se cierra al tocarla (sin afectar a botones ni enlaces de dentro) */
document.addEventListener("click",ev=>{const t=ev.target;if(!t.closest)return;const vl=document.documentElement.classList.contains("vl");if(!document.documentElement.classList.contains("vc")&&!vl)return;
  if(t.closest("button,a,input,select,label,summary,[data-stc],.stc"))return;const c=vl?t.closest(".sc"):t.closest(".sc.ohc");if(!c)return;const y0=c.getBoundingClientRect().top;c.classList.toggle("scx");pinAt(c,y0);
  const k=scKey(c);if(k){if(c.classList.contains("scx")){SCOPEN.delete(k);SCOPEN.add(k);while(SCOPEN.size>60)SCOPEN.delete(SCOPEN.values().next().value)}else SCOPEN.delete(k)}});
/* 2.10.40: lo desplegado sigue desplegado. Los listados se redibujan solos (cada actualización, cuando llegan las fuentes
   lentas, cada minuto…) y antes cada redibujado cerraba las filas abiertas: el contenido de debajo subía y perdías el
   sitio donde leías. Ahora se recuerda qué filas tenías abiertas y se vuelven a abrir en el mismo instante, antes de pintar. */
const SCOPEN=new Set();
/* 2.10.41: la fila o tarjeta que tocas se queda donde la tocaste. Safari (iPhone y iPad) no compensa por su cuenta los
   cambios de altura de lo que hay por encima, y cualquier recolocación de la página (tarjetas que se igualan, un
   redibujado) movía la tarjeta recién abierta arriba o abajo. Durante un segundo se corrige cualquier desplazamiento;
   si tú mueves la página, se deja de corregir. */
let PINU=0;["touchstart","wheel","keydown"].forEach(e=>addEventListener(e,()=>{PINU=Date.now()},{passive:true,capture:true}));
function pinAt(c,y0){const t0=Date.now(),k=scKey(c);
  const fix=()=>{if(PINU>t0+50)return;let el=c;if(!el.isConnected&&k){el=[...document.querySelectorAll(".sc")].find(x=>scKey(x)===k)||null}if(!el)return;
    const dy=el.getBoundingClientRect().top-y0;if(Math.abs(dy)>1)window.scrollBy(0,dy)};
  requestAnimationFrame(()=>{fix();requestAnimationFrame(fix)});[120,300,600,1000].forEach(ms=>setTimeout(fix,ms))}
function scKey(c){const box=c.closest("[id]");const st=c.querySelector("[data-stc]"),cs=c.querySelector("[data-call]");
  const who=c.dataset.dxi!=null?"dx"+(st?st.dataset.stc:c.dataset.dxi):(st?st.dataset.stc:cs?cs.dataset.call:"");if(!who)return "";
  const f=c.dataset.f||((c.querySelector(".l-f,.sc-fq,.f")||{}).textContent||"").trim();return (box?box.id:"")+"|"+who+"|"+f}
try{new MutationObserver(ms=>{if(!SCOPEN.size)return;for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1)continue;
  const list=n.classList&&n.classList.contains("sc")?[n]:n.querySelectorAll?n.querySelectorAll(".sc"):[];
  for(const c of list){if(c.classList.contains("scx"))continue;const k=scKey(c);if(k&&SCOPEN.has(k))c.classList.add("scx")}}}).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
/* 2.10.20: se recuerda el último modo concreto (base de la previsión) antes de cambiar a «Todos los modos» */
(function(){const sv=()=>{const m=document.getElementById("modesel");if(m&&m.value&&m.value!=="all"){try{store.set("c_modebase",m.value)}catch(_){}}};
  document.addEventListener("focusin",ev=>{if(ev.target&&ev.target.id==="modesel")sv()},true);document.addEventListener("pointerdown",ev=>{if(ev.target&&ev.target.id==="modesel")sv()},true);setTimeout(sv,1500)})();

/* 2.11.8: «Ver N estaciones más» en los destinos despliega las que faltan */
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-ezmore]");if(!b)return;e.preventDefault();e.stopPropagation();const r=b.previousElementSibling;if(r&&r.classList.contains("ezrest"))r.hidden=false;b.remove()});

document.addEventListener("click",ev=>{const a=ev.target.closest&&ev.target.closest("[data-ctgo]");if(a){ev.preventDefault();ev.stopPropagation();try{go("concursos");selTab("concursos","c_live",true)}catch(_){}return}
  /* 2.11.77: tocar la tarjeta del concurso (en cualquier vista) lleva al calendario y marca ese concurso */
  const c=ev.target.closest&&ev.target.closest("[data-ctcal]");if(!c)return;ev.preventDefault();const n=c.dataset.ctcal;
  try{go("concursos");selTab("concursos","f_ccal",true)}catch(_){}
  setTimeout(()=>{try{const f=document.getElementById("f_ccal");if(f)f.open=true;const rows=[...(f||document).querySelectorAll("tr,li,.ccr,.calr,div")].filter(r=>r.children.length&&r.textContent.includes(n)&&r.textContent.length<400);
    const r=rows.sort((x,y)=>x.textContent.length-y.textContent.length)[0];if(r){document.querySelectorAll(".ctcalhl").forEach(z=>z.classList.remove("ctcalhl"));r.classList.add("ctcalhl");r.scrollIntoView({block:"center",behavior:"smooth"})}}catch(_){}},400)});
document.addEventListener("keydown",ev=>{if(ev.key==="Enter"&&ev.target&&ev.target.dataset&&ev.target.dataset.ctcal)ev.target.click()});
