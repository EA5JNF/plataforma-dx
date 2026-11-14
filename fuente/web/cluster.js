/* ---- ACRACB 2.1: clúster con filtro de banda, POTA/SOTA/WWFF, paso largo y DXpediciones en el aire ---- */
(function(){
"use strict";
const EN=()=>window.ACRACB_LANG==="en";
const T=(es,en)=>EN()?en:es;
const S={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const ORD=[0,1,8,2,9,3,4,5,6,7,10,11,12];
const PROGS=["POTA","SOTA","WWFF"];
/* filtros acumulativos, como las bandas del mapa: se pueden marcar varios tipos y varias bandas a la vez */
const ld=(k,ok)=>{try{const v=JSON.parse(S.get(k)||"null");return Array.isArray(v)?v.filter(ok):null}catch(e){return null}};
let TYPES=new Set(ld("acracb_cltypes",x=>x==="dx"||PROGS.includes(x))||[S.get("acracb_cltype")].filter(x=>x==="dx"||PROGS.includes(x)));if(!TYPES.size)TYPES.add("dx");
let BSEL=new Set(ld("acracb_clbands",x=>Number.isInteger(x)&&x>=0&&x<=12)||[]);/* vacío = todas */
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
  for(const s of (L.spots||[])){const m=String(s.c||"").match(RX);if(!m)continue;const k=s.call+"|"+m[2].toUpperCase();if(seen.has(k))continue;seen.add(k);
    out.push({call:s.call,prog:m[1].toUpperCase(),ref:m[2].toUpperCase(),f:s.f,band:s.band,mode:s.mode,t:s.t,by:Array.isArray(s.by)?s.by[0]:s.by,dx:s.dx,a:(()=>{try{return spotAge(s)}catch(e){return null}})(),c:""})}
  return out}
function refUrl(p,r){if(p==="POTA")return "https://pota.app/#/park/"+encodeURIComponent(r);
  if(p==="SOTA")return "https://www.sotadata.org.uk/en/summit/"+r.split("/").map(encodeURIComponent).join("/");
  return "https://wwff.co/directory/?showRef="+encodeURIComponent(r)}
const PNAME={POTA:["parque","park"],SOTA:["cumbre","summit"],WWFF:["reserva","reserve"]};

/* ---------- barra de filtros ---------- */
function bar(counts,bcounts){
  const bs=bandsOK(),list=ORD.filter(b=>bs.has(b));[...BSEL].forEach(b=>{if(!bs.has(b))BSEL.delete(b)});
  const tb=[["dx","DX"]].concat(PROGS.map(p=>[p,p]));
  return `<div class="seg clseg" role="group" aria-label="${T("Qué mostrar","What to show")}"><span class="segl">${T("Ver","Show")}</span>${tb.map(([k,l])=>`<button type="button" data-clt="${k}" aria-pressed="${TYPES.has(k)}">${l}${counts[k]!=null?` <small>${counts[k]}</small>`:""}</button>`).join("")}</div>`+
    (list.length>1?`<div class="seg clseg clbands" role="group" aria-label="${T("Banda del clúster","Cluster band")}"><span class="segl">${T("Banda","Band")}</span><button type="button" data-clb="" aria-pressed="${!BSEL.size}">${T("Todas","All")}</button>${list.map(b=>`<button type="button" data-clb="${b}" aria-pressed="${BSEL.has(b)}"${bcounts[b]?"":' class="clz"'}><i style="background:${BC[b]}"></i>${BANDS[b]}${bcounts[b]?` <small>${bcounts[b]}</small>`:""}</button>`).join("")}</div>`:"")}
function wire(box){
  /* cada botón se marca o se desmarca; siempre queda al menos un tipo */
  box.querySelectorAll("[data-clt]").forEach(b=>b.onclick=()=>{const k=b.dataset.clt;if(TYPES.has(k)){if(TYPES.size>1)TYPES.delete(k)}else TYPES.add(k);S.set("acracb_cltypes",JSON.stringify([...TYPES]));render()});
  /* «Todas» quita la selección; marcar todas las bandas equivale a «Todas» */
  box.querySelectorAll("[data-clb]").forEach(b=>b.onclick=()=>{const v=b.dataset.clb;if(v==="")BSEL.clear();else{const n=+v;if(BSEL.has(n))BSEL.delete(n);else BSEL.add(n);const all=ORD.filter(x=>bandsOK().has(x));if(all.every(x=>BSEL.has(x)))BSEL.clear()}
    S.set("acracb_clbands",JSON.stringify([...BSEL]));render()})}

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
function card(o){
  const h=`<div class="sc-h"><span class="sc-call">${CS(o.call)}</span>${o.a!=null||o.t?`<span class="sc-age" title="${e2(o.t||"")} UTC">${ago(o.a)}</span>`:""}</div>`;
  const fl=[o.f?`<b class="sc-fq" style="color:${BC[o.band]||"inherit"}">${e2(o.f)}</b>`:"",o.mode?mb(o.mode):"",o.band!=null&&BANDS[o.band]?`<span class="sc-b"${o.f?"":` style="color:${BC[o.band]};font-weight:600"`}>${BANDS[o.band]}</span>`:""].concat(o.tags||[]).filter(Boolean);
  const f=fl.length?`<div class="sc-f">${fl.join("")}</div>`:"";
  const g=o.geo;let rumbo="",dist="";
  if(g){rumbo=`<span class="nw">${T("corto","short")} ${g.az}° ${cab(g.az)}<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${g.laz}° ${cab(g.laz)}</span>`;
    dist=`<span class="nw">${T("corto","short")} ${fk(g.km)} km<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${fk(g.lkm!=null?g.lkm:Math.max(0,40030-g.km))} km${o.p!=null?`<span class="sc-sep">·</span>`:""}</span>${o.p!=null?` <span class="nw"><b>${o.p} %</b> ${T("de QSO","QSO chance")}${o.lpb?T(" (paso largo)"," (long path)"):""}</span>`:""}`}
  return `<div class="sc${o.old?" old":""}">${h}${f}<dl class="sc-d">${sec(o.byLbl||T("Le oyen","Heard by"),o.by)}${sec("Split / QSL",o.xs)}${sec(T("Rumbo","Bearing"),rumbo)}${sec(T("Distancia","Distance"),dist)}${sec(T("Nota","Note"),o.note)}${(o.secs||[]).map(([l,v])=>sec(l,v)).join("")}</dl></div>`}
window.ACRACB_card=o=>card(o);
/* 2.4.4: «Qué hacer»: cada estación recomendada en una tarjeta como las del resto de la plataforma:
   frecuencia, modo, banda, rumbo y distancia por el camino corto y el largo, y la probabilidad de QSO */
const inBand=(f,b)=>{const m=MHZ[b];return m&&isFinite(f)&&Math.abs(f-m)/m<.12};
function recCards(go,dxn){const out=[];
  (go||[]).forEach(({s,e,a})=>{const st=splitTags(s);const tg=[`<span class="xtag xr">${T("En el clúster","On the cluster")}</span>`].concat(st.pr);
    out.push(card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tg,by:CSL(s.by,", "),xs:st.xs,geo:geoOf(s.dx),p:Math.round(e.p*100),lpb:!!e.lp,
      note:/up|arriba|split/i.test(s.c||"")?T("Escucha arriba: trabaja en split.","Listen up: working split."):""}))});
  (dxn||[]).forEach(x=>{const d=x.d;const call=String(d.call||"").split(/[ ,]/)[0];let f="",mode="";
    const q=[].concat(d.qsx||[]).map(z=>String(z).match(/(\d+(?:\.\d+)?)\s*([A-Z0-9]+)?/i)).filter(Boolean).map(m=>({f:+m[1]>1000?+m[1]/1000:+m[1],m:(m[2]||"").toUpperCase()})).filter(z=>inBand(z.f,x.b));
    let my="";try{my=String(MOD()||"").toUpperCase()}catch(e){}const pick=q.find(z=>z.m&&my&&z.m===my)||q[0];
    if(pick){f=pick.f.toFixed(3);mode=pick.m}
    else{const sp=(L.spots||[]).filter(z=>z.call&&z.call.toUpperCase()===call.toUpperCase()&&z.band===x.b)[0];if(sp){f=sp.f;mode=sp.mode||""}}
    let hab=false;if(!mode&&Array.isArray(d.modes)&&d.modes.length){const mm=d.modes.map(z=>String(z).toUpperCase());mode=mm.includes(my)?my:mm.includes("SSB")&&!/CW|FT/.test(my)?"SSB":mm[0]}
    /* sin QSX ni spot en esa banda: la frecuencia habitual de las DXpediciones en ese modo */
    if(!f&&mode){const H={SSB:[1.845,3.790,7.090,14.195,18.145,21.295,24.945,28.495,null,null,50.110],CW:[1.826,3.523,7.023,14.023,18.073,21.023,24.893,28.023,5.354,10.106,50.090],
      FT8:[1.840,3.573,7.074,14.074,18.100,21.074,24.915,28.074,5.357,10.136,50.313],FT4:[1.840,3.575,7.047,14.080,18.104,21.140,24.919,28.180,null,10.140,50.318],
      RTTY:[1.838,3.580,7.040,14.083,18.105,21.083,24.925,28.083,null,10.140,50.300]};const v=(H[mode]||[])[x.b];if(v){f=v.toFixed(3);hab=true}}
    const tg=[`<span class="xtag xs">${T("DXpedición","DXpedition")}</span>`];
    out.push(card({call,f,band:x.b,mode,tags:tg,geo:isFinite(d.lon)&&isFinite(d.lat)?geoOf([d.lon,d.lat]):null,p:Math.round(x.p*100),lpb:!!x.lp,
      note:[hab?T("Frecuencia habitual de las DXpediciones en este modo: confírmala en el clúster.","Usual DXpedition frequency for this mode: check the cluster."):"",d.until?T("Activa hasta el "+e2(d.until)+".","Active until "+e2(String(d.until).replace(/\b(ene|abr|ago|dic)\b/g,m=>({ene:"Jan",abr:"Apr",ago:"Aug",dic:"Dec"})[m]))+"."):""].filter(Boolean).join(" ")}))});
  return out.length?`<div class="alc reccards">${out.join("")}</div>`:""}
window.ACRACB_recCards=recCards;window.ACRACB_geo=geoOf;window.ACRACB_split2=s=>splitTags(s);window.ACRACB_ago=ago;
/* separa las etiquetas de split/QSL (van en su sección) de las de programa (van junto a la frecuencia) */
function splitTags(s){const t=window.ACRACB_tags?ACRACB_tags(s):"";const xs=[],pr=[];(t.match(/<span class="xtag[^"]*"[^>]*>.*?<\/span>/g)||[]).forEach(x=>(/xtag x[sq]\b/.test(x)?xs:pr).push(x));return {xs:xs.join(""),pr}}
function dxRow(s,e,a){const st=splitTags(s);const tags=[];if(s.nw)tags.push(`<span class="nwb">${T("NUEVO","NEW")}</span>`);if(s.ns>1)tags.push(`<span class="nsb">${T(`en ${s.ns} clústeres`,`on ${s.ns} clusters`)}</span>`);
  return card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tags.concat(st.pr),by:CSL(s.by,", "),xs:st.xs,geo:geoOf(s.dx)||{az:e.az,laz:e.laz,km:e.km},p:Math.round(Math.max(e.pSP,e.t.l?e.pLP:0)*100),lpb:e.t&&e.t.l&&e.pLP>e.pSP,old:a>60})}
function progRow(o){const tag=`<a class="xtag xr" href="${refUrl(o.prog,o.ref)}" target="_blank" rel="noopener noreferrer" data-ext title="${T("Ficha del","Page of the")} ${T(PNAME[o.prog][0],PNAME[o.prog][1])}">${e2(o.prog)} ${e2(o.ref)}</a>`;
  return card({call:o.call,a:o.a,t:o.t,f:o.f,band:o.band,mode:o.mode,tags:[tag],byLbl:T("Spot de","Spotted by"),by:o.by?e2(o.by):"",geo:geoOf(o.dx),note:o.c?e2(o.c):"",old:o.a>30})}
const NREF=/(POTA|SOTA|WWFF|GMA|DME|DVGE|DFE|IOTA|DIE|DCE|DMVE|DEE)[ :-]*[A-Z0-9/-]+/i;
function nearRow(s,a){const st=splitTags(s);const tags=[];if(s.nw)tags.push(`<span class="nwb">${T("NUEVO","NEW")}</span>`);if(s.ns>1)tags.push(`<span class="nsb">${T(`en ${s.ns} clústeres`,`on ${s.ns} clusters`)}</span>`);
  const m=String(s.c||"").match(NREF);if(m&&!st.pr.length)tags.push(`<span class="xtag xr">${e2(m[0].toUpperCase())}</span>`);
  return card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tags.concat(st.pr),by:CSL(s.by,", "),xs:st.xs,geo:geoOf(s.dx),old:a>60})}
function renderNear(){const box=$("near");if(!box||typeof SPOTS!=="function")return;const keep=[...box.children].filter(x=>x.matches&&x.matches("p.note"));
  const nr=SPOTS().filter(s=>spotKind(s)==="near").map(s=>({s,a:spotAge(s)})).sort((x,y)=>(x.a??1e9)-(y.a??1e9));
  box.innerHTML=(nr.length?nr.map(({s,a})=>nearRow(s,a)).join(""):`<div class="empty">${T(`Sin spots cercanos de ${CMSTXT()} ahora.`,`No nearby ${CMSTXT()} spots right now.`)}</div>`);keep.forEach(k=>box.appendChild(k))}

/* ---------- clúster ---------- */
let LH=null;
function render(lh){if(lh!=null)LH=lh;const box=$("spots");if(!box||typeof SPOTS!=="function")return;if(LH==null)LH=st.mhour;
  let bx=$("clbar");if(!bx){bx=document.createElement("div");bx.id="clbar";box.parentNode.insertBefore(bx,box)}
  const bs=bandsOK();
  /* DX */
  const sp=SPOTS().map(s=>({s,e:spotEval(s,LH),a:spotAge(s)})).filter(x=>x.e&&(spotKind(x.s)==="dx"||spotKind(x.s)==="ind"));
  sp.sort((x,y)=>(spotKind(x.s)==="dx")-(spotKind(y.s)==="dx")||0);
  const dxs=sp.filter(x=>spotKind(x.s)==="dx").sort((a,b)=>b.e.p-a.e.p).concat(sp.filter(x=>spotKind(x.s)==="ind"));
  /* programas */
  const pa=progAll().filter(o=>bs.has(o.band)&&modeOK(o)&&(o.a==null||o.a<=60));
  const counts={dx:dxs.length};PROGS.forEach(p=>counts[p]=pa.filter(o=>o.prog===p).length);
  const cur=(TYPES.has("dx")?dxs.map(x=>x.s.band):[]).concat(pa.filter(o=>TYPES.has(o.prog)).map(o=>o.band));
  const bcounts={};cur.forEach(b=>bcounts[b]=(bcounts[b]||0)+1);
  bx.innerHTML=bar(counts,bcounts)+legend();wire(bx);
  const inB=b=>!BSEL.size||BSEL.has(b),bsl=ORD.filter(b=>BSEL.has(b)).map(b=>BANDS[b]);
  const bl=bsl.length?" "+T("en","on")+" "+(bsl.length>1?bsl.slice(0,-1).join(", ")+T(" y "," and ")+bsl[bsl.length-1]:bsl[0]):"";
  let h="";const srcs=[];
  if(TYPES.has("dx")){const rows=dxs.filter(x=>inB(x.s.band));
    if(TYPES.size>1)h+=`<p class="note clsec">DX</p>`;
    h+=rows.length?rows.map(x=>dxRow(x.s,x.e,x.a)).join(""):`<div class="empty">${T(`Sin spots DX de ${CMSTXT()} útiles${bl} ahora.`,`No useful ${CMSTXT()} DX spots${bl} right now.`)}</div>`;
    srcs.push(e2(L.spotsSrc||"—"))}
  const ps=PROGS.filter(p=>TYPES.has(p));
  if(ps.length){const rows=pa.filter(o=>ps.includes(o.prog)&&inB(o.band)).sort((a,b)=>(a.a??1e9)-(b.a??1e9));const N=80;
    const pl=ps.length>1?ps.slice(0,-1).join(", ")+T(" y "," and ")+ps[ps.length-1]:ps[0];
    bx.insertAdjacentHTML("beforeend",`<p class="note clnote">${T(`Activadores de ${pl} de todo el mundo en la última hora, en ${CMSTXT()}${bl}. Los más recientes, arriba.`,`${pl} activators worldwide in the last hour, in ${CMSTXT()}${bl}. Newest first.`)}</p>`);
    if(TYPES.has("dx"))h+=`<p class="note clsec">${pl}</p>`;
    h+=rows.length?rows.slice(0,N).map(progRow).join("")+(rows.length>N?`<p class="note">${T(`Y ${rows.length-N} más.`,`And ${rows.length-N} more.`)}</p>`:""):`<div class="empty">${T(`Ningún activador de ${pl} en ${CMSTXT()}${bl} en la última hora.`,`No ${pl} activators in ${CMSTXT()}${bl} in the last hour.`)}</div>`;
    srcs.push((Array.isArray(L.acts)?T("POTA, SOTAwatch, WWFF Spots y Spothole","POTA, SOTAwatch, WWFF Spots and Spothole"):T("comentarios de los spots del clúster","cluster spot comments"))+(L.actsUTC?T(` · revisado a las ${String(L.actsUTC).slice(11,16)} UTC`,` · checked at ${String(L.actsUTC).slice(11,16)} UTC`):""))}
  h+=`<details class="srcd"><summary>${T("Fuentes","Sources")}</summary>${srcs.map(x=>`<p class="note">${x}</p>`).join("")}</details>`;
  box.innerHTML=h}
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
window.ACRACB_dxon=function(d){const a=dxSpots(d);if(!a.length)return !(L.dxon&&typeof L.dxon==="object")?"":`<span class="dxon dxoff">${T("Sin spots en las últimas 6 h","No spots in the last 6 h")}</span><br>`;
  const live=a.filter(o=>o.a!=null&&o.a<=30),rest=a.filter(o=>!(o.a!=null&&o.a<=30));
  const one=o=>`<span class="dxof"><b style="color:${BC[o.band]}">${e2(o.f)}</b> ${mb(o.mode)} · ${BANDS[o.band]||""} · ${ago(o.a)}${split(o.c)?" · "+split(o.c):""}</span>`;
  let h="";
  if(live.length)h+=`<span class="dxon"><b>◆ ${T("En el aire ahora","On the air now")}:</b> ${live.slice(0,4).map(one).join(" ")}</span><br>`;
  if(rest.length)h+=`<span class="dxon dxlast">${live.length?T("Antes","Earlier"):T("Últimos spots","Latest spots")}: ${rest.slice(0,live.length?2:3).map(one).join(" ")}</span><br>`;
  return h};

/* ---------- avisos con la misma tarjeta ---------- */
/* filtros de los avisos, acumulativos como los del clúster: varios modos y varias bandas a la vez */
const AMODES=["SSB","AM","FM","CW","FT8","FT4","JT65","JS8","RTTY","PSK31","SSTV","OTROS"];
const ANAME={JS8:"JS8Call"};
let AM=new Set(ld("acracb_almodes",x=>AMODES.includes(x))||[]),AB=new Set(ld("acracb_albands",x=>Number.isInteger(x)&&x>=0&&x<=12)||[]);/* vacío = todos */
const mgrp=(m,f)=>{const x=mlab(m,f);return AMODES.includes(x)?x:(x==="JS8CALL"?"JS8":"OTROS")};
function alertCards(){const box=$("alerts");if(!box||!L.alert||!Array.isArray(L.alert.items))return;
  const old=[...box.querySelectorAll(":scope>.sp")];let wrap=box.querySelector(":scope>.alc"),fb=box.querySelector(":scope>.alf");
  if(!wrap){if(!old.length)return;wrap=document.createElement("div");wrap.className="alc";old[0].before(wrap);old.forEach(o=>o.remove())}
  if(!fb){fb=document.createElement("div");fb.className="alf";wrap.before(fb)}
  const rows=L.alert.items.map(x=>{const sp=(L.spots||[]).find(s=>s.call===x.call)||{};const band=x.band!=null?x.band:sp.band;const mode=x.mode||sp.mode||"";return {x,sp,band,mode,g:mgrp(mode,x.f!=null?x.f:sp.f)}});
  const mc={},bc={};rows.forEach(r=>{mc[r.g]=(mc[r.g]||0)+1;if(r.band!=null)bc[r.band]=(bc[r.band]||0)+1});
  /* se ven siempre todos los modos y todas las bandas de tu estación; los que ahora no tienen avisos salen atenuados */
  const ml=AMODES.slice(),bs=bandsOK(),bl=ORD.filter(b=>bs.has(b));[...AB].forEach(b=>{if(!bs.has(b))AB.delete(b)});
  fb.innerHTML=`<div class="seg clseg almodes" role="group" aria-label="${T("Modo de los avisos","Alert mode")}"><span class="segl">${T("Modo","Mode")}</span><button type="button" data-alm="" aria-pressed="${!AM.size}">${T("Todos","All")}</button>${ml.map(m=>`<button type="button" data-alm="${m}" aria-pressed="${AM.has(m)}"${mc[m]?"":' class="clz"'}>${m==="OTROS"?T("Otros","Other"):(ANAME[m]||m)}${mc[m]?` <small>${mc[m]}</small>`:""}</button>`).join("")}</div>`+
    `<div class="seg clseg clbands albands" role="group" aria-label="${T("Banda de los avisos","Alert band")}"><span class="segl">${T("Banda","Band")}</span><button type="button" data-alb="" aria-pressed="${!AB.size}">${T("Todas","All")}</button>${bl.map(b=>`<button type="button" data-alb="${b}" aria-pressed="${AB.has(b)}"${bc[b]?"":' class="clz"'}><i style="background:${BC[b]}"></i>${BANDS[b]}${bc[b]?` <small>${bc[b]}</small>`:""}</button>`).join("")}</div>`;
  fb.querySelectorAll("[data-alm]").forEach(b=>b.onclick=()=>{const v=b.dataset.alm;if(v==="")AM.clear();else{if(AM.has(v))AM.delete(v);else AM.add(v);if(ml.every(m=>AM.has(m)))AM.clear()}S.set("acracb_almodes",JSON.stringify([...AM]));setTimeout(()=>{try{foldSums()}catch(e){}try{alBar()}catch(e){}},0);alertCards();alBar()});
  fb.querySelectorAll("[data-alb]").forEach(b=>b.onclick=()=>{const v=b.dataset.alb;if(v==="")AB.clear();else{const n=+v;if(AB.has(n))AB.delete(n);else AB.add(n);if(bl.every(x=>AB.has(x)))AB.clear()}S.set("acracb_albands",JSON.stringify([...AB]));setTimeout(()=>{try{foldSums()}catch(e){}try{alBar()}catch(e){}},0);alertCards();alBar()});
  const vis=rows.filter(r=>(!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band))));
  wrap.innerHTML=vis.length?vis.map(({x,sp,band,mode})=>{const st=splitTags({c:x.c||sp.c||""});const need=String(x.need||"");
    const tag=`<span class="xtag ${/DXped/i.test(need)?"xs":"xr"}">${e2(/DXped/i.test(need)?T("DXpedición","DXpedition"):T("entidad rara","rare entity"))}</span>`;
    let a=null;try{a=spotAge({t:x.t})}catch(e){}
    return card({call:x.call,a,t:x.t,f:x.f,band,mode,tags:[tag].concat(st.pr),by:CSL(String(x.by||"").split(/[ ,]+/).filter(Boolean),", "),xs:st.xs,geo:geoOf(sp.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(x.call)))})}).join("")
    :`<p class="note">${T("Ningún aviso con este modo y esta banda. Pulsa «Todos» o «Todas» para verlos todos.","No alerts for this mode and band. Tap «All» to see them all.")}</p>`}
/* 2.4.1: el aviso flotante (arriba, en Ahora) solo enseña los modos y bandas elegidos en Avisos, con las mismas tarjetas */
/* 2.4.7: un solo criterio para todo lo que avisa (lista, aviso flotante, resumen y notificaciones): el modo y las bandas elegidos en Avisos */
function alRow(x){const sp=(L.spots||[]).find(s=>s.call===x.call)||{};const band=x.band!=null?x.band:sp.band;const mode=x.mode||sp.mode||"";return {x,sp,band,mode,g:mgrp(mode,x.f!=null?x.f:sp.f)}}
function alOK(x){const r=alRow(x);return (!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band)))}
window.ACRACB_alOK=x=>{try{return alOK(x)}catch(e){return true}};
function alBar(){const el=$("albar");if(!el)return;const al=L.alert;if(!al||!Array.isArray(al.items)){el.hidden=true;return}
  const age=al.at?(Date.now()-Date.parse(al.at))/6e4:1e9;let off=null;try{off=sessionStorage.getItem("aloff")}catch(e){}
  const rows=al.items.map(alRow).filter(r=>(!AM.size||AM.has(r.g))&&(!AB.size||(r.band!=null&&AB.has(r.band))));
  if(!rows.length||age>150||off===al.at){el.hidden=true;el.innerHTML="";return}
  /* 2.4.1: con la lista de Avisos a la vista, el aviso flotante sobra y la tapaba */
  {const fa=$("f_al");if(typeof st!=="undefined"&&st.page==="dx"&&fa&&fa.getClientRects().length){el.hidden=true;return}}
  const shown=rows.slice(0,3);
  el.hidden=false;el.classList.add("albar2");
  el.innerHTML=`<div class="alh"><b>${T("Aviso DX","DX alert")} <span class="alt">${esc(fmtT(al.at))}</span></b><span class="alb"><button type="button" class="lnk" id="algo">${rows.length>shown.length?T(`Ver los ${rows.length}`,`See all ${rows.length}`):T("Ver en Avisos","See in Alerts")}</button><button type="button" class="lnk" id="alx" aria-label="${T("Cerrar aviso","Close alert")}">${T("Cerrar","Close")}</button></span></div>
  <div class="alc">${shown.map(({x,sp,band,mode})=>{const stg=splitTags({c:x.c||sp.c||""});const need=String(x.need||"");
    const tag=`<span class="xtag ${/DXped/i.test(need)?"xs":"xr"}">${e2(/DXped/i.test(need)?T("DXpedición","DXpedition"):T("entidad rara","rare entity"))}</span>`;let a=null;try{a=spotAge({t:x.t})}catch(e){}
    return card({call:x.call,a,t:x.t,f:x.f,band,mode,tags:[tag].concat(stg.pr),by:CSL(String(x.by||"").split(/[ ,]+/).filter(Boolean),", "),xs:stg.xs,geo:geoOf(sp.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(x.call)))})}).join("")}</div>`;
  $("algo").onclick=()=>{go("dx");try{selTab("dx","f_al",true)}catch(e){}el.hidden=true;const fa=$("f_al");if(fa){fa.open=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{try{fa.scrollIntoView({block:"start",behavior:"smooth"})}catch(e){fa.scrollIntoView()}}))}};$("alx").onclick=()=>{try{sessionStorage.setItem("aloff",al.at)}catch(e){}el.hidden=true}}
window.renderAlBar=alBar;document.addEventListener("click",ev=>{if(ev.target.closest&&ev.target.closest(".nav button,#subnav button,.ptabs button,[data-pg]"))setTimeout(()=>{try{alBar()}catch(e){}},80)},true);
function hookA(){if(typeof window.renderAlerts!=="function"||window.renderAlerts.__cl)return false;const o=window.renderAlerts;const w=function(){const r=o.apply(this,arguments);try{alertCards()}catch(e){console.error(e)}return r};w.__cl=1;window.renderAlerts=w;return true}
if(!hookA()){const t2=setInterval(()=>{if(hookA())clearInterval(t2)},200);setTimeout(()=>clearInterval(t2),15000)}


/* ---------- 2.4.1: DXpediciones con la misma tarjeta por secciones ---------- */
let DXOPEN=false;
function dxCards(){const box=$("dxl");if(!box||!Array.isArray(L.dx)||typeof tFor!=="function")return;const lh=st.mhour;
  const html=[];L.dx.forEach((d,i)=>{let t=null;try{t=tFor(d)}catch(e){}if(!t||!isFinite(d.lon)||!isFinite(d.lat))return;const p=[d.lon,d.lat];
    const gk=geoKm(TXP,p),az=Math.round(gk.az)%360,km=Math.round(gk.km),lkm=Math.round(gk.lkm),laz=(az+180)%360;
    let bh={p:0,h:0,b:0,lp:false};for(let x=0;x<24;x++){const r=bestAny(t,x);if(r.p>bh.p)bh={...r,h:x}}const n=bestAny(t,lh);
    let nw=false;try{nw=dxNew(d)}catch(e){}const e=callEnt(d.call);const cty=e&&e.name&&String(d.ent||"").toLowerCase()!==e.name.toLowerCase()?` <span class="cty">· ${e2(d.ent)}</span>`:"";
    const tags=[d.mw?`<span class="agr dif">Most Wanted nº ${e2(d.mw)}</span>`:"",MOD()==="ssb"&&d.ssb===false?`<span class="tag">${T("fonía sin confirmar","phone unconfirmed")}</span>`:"",d.until?`<span class="sc-b">${T("hasta","until")} ${e2(d.until)}</span>`:""].filter(Boolean);
    let air="";try{air=(window.ACRACB_dxon?ACRACB_dxon(d):"").replace(/<br>$/,"")}catch(x){}
    let gl="";try{gl=window.ACRACB_grey?ACRACB_grey.short(p).replace(/^(Línea gris común|Shared greyline):?\s*/,""):""}catch(x){}
    const sec=(l,v)=>v?`<dt>${l}</dt><dd>${v}</dd>`:"";
    html.push(`<div class="sc dxc" role="button" tabindex="0" data-dxi="${i}"><div class="sc-h"><span class="sc-call">${nw?"★ ":"✔ "}${CS(d.call)}${cty}</span><span class="pill ${cls(n.p)}">${Math.round(n.p*100)}%</span></div>
      ${tags.length?`<div class="sc-f">${tags.join("")}</div>`:""}<dl class="sc-d">${sec(T("Actividad","Activity"),air)}
      ${sec(T("Mejor hora","Best time"),`<span class="nw">${hh(bh.h)}:00 ${T("en","on")} <b style="color:${BC[bh.b]}">${BANDS[bh.b]}</b></span> <span class="nw">(${Math.round(bh.p*100)} %${bh.lp?T(", paso largo",", long path"):""})</span>`)}
      ${sec(T("Rumbo","Bearing"),`<span class="nw">${T("corto","short")} ${az}° ${cab(az)}<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${laz}° ${cab(laz)}</span>`)}
      ${sec(T("Distancia","Distance"),`<span class="nw">${T("corto","short")} ${fk(km)} km<span class="sc-sep">·</span></span> <span class="nw">${T("largo","long")} ${fk(lkm)} km</span>`)}
      ${sec(T("Línea gris","Greyline"),gl)}${sec("QSX",d.qsx?e2(String(d.qsx).replace(/\s*,\s*/g,", ")):"")}</dl></div>`)});
  const N=8,more=html.length>N+2&&!DXOPEN;
  box.innerHTML=(more?html.slice(0,N):html).join("")+(more?`<button type="button" class="btn llmore" id="dxmore">${T(`Ver ${html.length-N} DXpediciones más`,`Show ${html.length-N} more DXpeditions`)}</button>`:"")+
    (L.dxHidden&&MOD()==="ssb"?`<p class="note" style="margin:4px 0 0">${T(`No se muestran ${L.dxHidden} expediciones activas que no anuncian fonía.`,`${L.dxHidden} active expeditions that do not announce phone are not shown.`)}</p>`:"");
  const mb2=$("dxmore");if(mb2)mb2.onclick=()=>{DXOPEN=true;dxCards()};
  box.querySelectorAll(".dxc[data-dxi]").forEach(c=>{const o=()=>{openPop({k:"d",i:+c.dataset.dxi});go("mapa")};c.onclick=ev=>{if(ev.target.closest("a,button,.cs"))return;o()};c.onkeydown=ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();o()}}})}
window.ACRACB_dxCards=dxCards;
/* ---------- enganche ---------- */
function hook(){if(typeof window.renderSide!=="function"||window.renderSide.__cl)return false;const o=window.renderSide;
  const w=function(){const r=o.apply(this,arguments);try{if(st.page==="dx"){render(st.mhour);renderNear();dxCards()}}catch(e){console.error(e)}return r};w.__cl=1;window.renderSide=w;return true}
if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},200);setTimeout(()=>clearInterval(t),15000)}
})();
