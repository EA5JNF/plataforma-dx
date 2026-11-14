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
  const ohd=o.oh&&o.oh.b!=null&&o.oh.b<10?` data-ohc="1" data-t="${e2(o.oh.t)}" data-b="${o.oh.b}" data-call="${e2(o.oh.call)}" data-mode="${e2(o.oh.mode||"")}" data-f="${e2(o.f||"")}" tabindex="0" role="button" aria-label="${e2(o.oh.call)}: ${T("anotar si lo oyes","log whether you hear it")}"`:"";
  return `<div class="sc${o.old?" old":""}${ohd?" ohc":""}"${ohd}>${h}${f}<dl class="sc-d">${sec(o.byLbl||T("Le oyen","Heard by"),o.by)}${sec("Split / QSL",o.xs)}${sec(T("Rumbo","Bearing"),rumbo)}${sec(T("Distancia","Distance"),dist)}${sec(T("Nota","Note"),o.note)}${(o.secs||[]).map(([l,v])=>sec(l,v)).join("")}</dl>${o.oh&&window.ACRACB_ohBox?ACRACB_ohBox(o.oh):""}</div>`}
window.ACRACB_card=o=>card(o);
/* 2.4.4: «Qué hacer»: cada estación recomendada en una tarjeta como las del resto de la plataforma:
   frecuencia, modo, banda, rumbo y distancia por el camino corto y el largo, y la probabilidad de QSO */
const inBand=(f,b)=>{const m=MHZ[b];return m&&isFinite(f)&&Math.abs(f-m)/m<.12};
function recCards(go,dxn){const out=[];
  (go||[]).forEach(({s,e,a})=>{const st=splitTags(s);const sp=spotProb(s,e,a);const tg=[`<span class="xtag xr">${T("En el clúster","On the cluster")}</span>`].concat(st.pr);
    out.push(card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tg,by:CSL(s.by,", "),xs:st.xs,geo:geoOf(s.dx),p:Math.round(sp.p*100),p0:Math.round(sp.p0*100),lpb:sp.lp,oh:e.t?{t:e.t.id,b:s.band,call:s.call,mode:modeOf(s)}:null,
      note:/up|arriba|split/i.test(s.c||"")?T("Escucha arriba: trabaja en split.","Listen up: working split."):""}))});
  /* 2.5.6: solo las DXpediciones que trabajan en alguno de tus modos (el de tu estación y los añadidos en el clúster) */
  let my=new Set();try{CMS().forEach(k=>my.add(String(MODES[k].s).toUpperCase()))}catch(_){}
  const inMy=d=>{const m=Array.isArray(d.modes)?d.modes.map(z=>String(z).toUpperCase()):[];return !m.length||!my.size||m.some(z=>my.has(z)||(z==="JS8"&&my.has("JS8CALL")))};
  (dxn||[]).filter(x=>inMy(x.d)).forEach(x=>{const d=x.d;const call=String(d.call||"").split(/[ ,]/)[0];let f="",mode="";
    const q=[].concat(d.qsx||[]).map(z=>String(z).match(/(\d+(?:\.\d+)?)\s*([A-Z0-9]+)?/i)).filter(Boolean).map(m=>({f:+m[1]>1000?+m[1]/1000:+m[1],m:(m[2]||"").toUpperCase()})).filter(z=>inBand(z.f,x.b));
    let my="";try{my=String(MOD()||"").toUpperCase()}catch(e){}const pick=q.find(z=>z.m&&my&&z.m===my)||q[0];
    if(pick){f=pick.f.toFixed(3);mode=pick.m}
    else{const sp=(L.spots||[]).filter(z=>z.call&&z.call.toUpperCase()===call.toUpperCase()&&z.band===x.b)[0];if(sp){f=sp.f;mode=sp.mode||""}}
    const MYS=new Set();try{CMS().forEach(k=>MYS.add(String(MODES[k].s).toUpperCase()))}catch(_){}
    let hab=false;if(!mode&&Array.isArray(d.modes)&&d.modes.length){const mm=d.modes.map(z=>String(z).toUpperCase());mode=mm.includes(my)?my:(mm.find(z=>MYS.has(z))||(mm.includes("SSB")&&!/CW|FT/.test(my)?"SSB":mm[0]))}
    /* sin QSX ni spot en esa banda: la frecuencia habitual de las DXpediciones en ese modo */
    if(!f&&mode){const H={SSB:[1.845,3.790,7.090,14.195,18.145,21.295,24.945,28.495,null,null,50.110],CW:[1.826,3.523,7.023,14.023,18.073,21.023,24.893,28.023,5.354,10.106,50.090],
      FT8:[1.840,3.573,7.074,14.074,18.100,21.074,24.915,28.074,5.357,10.136,50.313],FT4:[1.840,3.575,7.047,14.080,18.104,21.140,24.919,28.180,null,10.140,50.318],
      RTTY:[1.838,3.580,7.040,14.083,18.105,21.083,24.925,28.083,null,10.140,50.300]};const v=(H[mode]||[])[x.b];if(v){f=v.toFixed(3);hab=true}}
    const tg=[`<span class="xtag xs dxpt">${T("DXpedición","DXpedition")}</span>`];
    let pp=x.p,plp=!!x.lp;try{const mk=Object.keys(MODES).find(z=>String(MODES[z].s).toUpperCase()===String(mode).toUpperCase());const ex=mk?MODES[mk].adj-MD().adj:0;
      const t=tFor(d),lh=localNow();if(ex&&t){const a1=prob(t,lh,x.b,false,ex).p,a2=t.l?prob(t,lh,x.b,true,ex).p:0;plp=a2>a1&&a2>=.05;pp=plp?a2:a1}}catch(_){}
    out.push(card({call,f,band:x.b,mode,tags:tg,geo:isFinite(d.lon)&&isFinite(d.lat)?geoOf([d.lon,d.lat]):null,p:Math.round(pp*100),lpb:plp,oh:(()=>{try{const t=tFor(d);return t?{t:t.id,b:x.b,call,mode}:null}catch(_){return null}})(),
      note:[hab?T("Frecuencia habitual de las DXpediciones en este modo: confírmala en el clúster.","Usual DXpedition frequency for this mode: check the cluster."):"",d.until?T("Activa hasta el "+e2(d.until)+".","Active until "+e2(String(d.until).replace(/\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b/g,m=>({ene:"Jan",feb:"Feb",mar:"Mar",abr:"Apr",may:"May",jun:"Jun",jul:"Jul",ago:"Aug",sep:"Sep",oct:"Oct",nov:"Nov",dic:"Dec"})[m]))+"."):""].filter(Boolean).join(" ")}))});
  return out.length?`<div class="alc reccards">${out.join("")}</div>`:""}
window.ACRACB_recCards=recCards;
/* 2.6.4: «¿Lo oyes?» en las tarjetas de estaciones activas. Tu escucha de esa estación concreta (banda, hora, modo y, si quieres,
   la lectura del S-metro) entra en la calibración de tu estación y, durante 45 minutos, es la prueba más fuerte para esa zona:
   si la oyes, el camino está abierto; si no la oyes, su probabilidad baja. */

const ohKey=o=>o.call+"|"+o.b;
function lastOwn(call,b){try{const lim=Date.now()-2*36e5;for(let i=OBS.length-1;i>=0;i--){const o=OBS[i];if(o.call===call&&o.b===b&&Date.parse(o.at)>lim)return o}}catch(_){}return null}
window.ACRACB_ohBox=oh=>{if(oh.b==null||oh.b>=10)return "";const last=lastOwn(oh.call,oh.b);
  const st=last?(last.h?`<span class="ohs y">${T("Lo oyes","You hear it")}${last.r!=null?" · R"+last.r:""}${last.s!=null?" · "+sTxt(last.s):""}</span>`:`<span class="ohs n">${T("No lo oyes","You don't hear it")}</span>`):"";
  return `<div class="ohbox"><div class="ohr"><button type="button" class="ohq" data-ohq data-t="${e2(oh.t)}" data-b="${oh.b}" data-call="${e2(oh.call)}" data-mode="${e2(oh.mode||"")}">${T("¿Lo oyes?","Do you hear it?")}</button>${st}</div></div>`};
/* diálogo «¿Lo oyes?»: se abre al tocar cualquier tarjeta de estación */
const VOICE=m=>/^(SSB|USB|LSB|AM|FM|PHONE)?$/i.test(String(m||"").trim());
const RTXT={1:["ilegible","unreadable"],2:["apenas","barely"],3:["con esfuerzo","with effort"],4:["casi sin problema","almost perfect"],5:["perfecto","perfect"]};
let DLG=null;
function dlgHTML(d){const last=lastOwn(d.call,d.b);const voice=VOICE(d.mode);
  const ico={y:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',n:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>'};
  const h=last&&last.h,n=last&&!last.h;
  let x=`<div class="ohd-h"><div><div class="ohd-t">${T("¿Oyes a","Do you hear")} <b>${e2(d.call)}</b>?</div><div class="ohd-s">${[d.f,d.mode,BANDS[d.b]].filter(Boolean).map(e2).join(" · ")}</div></div><button type="button" class="ohd-x" data-ohx aria-label="${T("Cerrar","Close")}">×</button></div>
   <div class="ohd-b"><button type="button" class="ohbig y" data-oh="1" aria-pressed="${!!h}">${ico.y}<span>${T("Lo oigo","I hear it")}</span></button><button type="button" class="ohbig n" data-oh="0" aria-pressed="${!!n}">${ico.n}<span>${T("No lo oigo","I don't hear it")}</span></button></div>`;
  if(h){if(voice)x+=`<div class="ohd-r" role="group" aria-label="${T("Legibilidad (R)","Readability (R)")}"><span class="smt">${T("¿Cómo se entiende? (R)","How readable? (R)")}</span><div class="rrow">${[1,2,3,4,5].map(r=>`<button type="button" data-rr="${r}" data-o="${e2(last.at)}" aria-pressed="${last.r===r}"><b>R${r}</b><small>${T(RTXT[r][0],RTXT[r][1])}</small></button>`).join("")}</div></div>`;
    x+=ACRACB_smeter(last)}
  x+=`<p class="note ohd-n">${h?T("Marca lo que puedas: cuanto más precisa la escucha, antes se ajustan tus previsiones.","Tap what you can: the more precise the report, the sooner your predictions are tuned."):T("Tu escucha ajusta las previsiones de tu estación y, durante 45 minutos, el porcentaje de esa zona.","Your report tunes your station's predictions and, for 45 minutes, the chance for that area.")}</p>`;
  if(last)x+=`<div class="ohd-f"><button type="button" class="btn ohd-ok" data-ohx>${T("Listo","Done")}</button></div>`;
  return x}
function openDlg(d){DLG=d;let w=document.getElementById("ohdlg");if(!w){w=document.createElement("div");w.id="ohdlg";w.className="ohdlg";w.innerHTML='<div class="ohd-bg" data-ohx></div><div class="ohd-c" role="dialog" aria-modal="true"></div>';document.body.appendChild(w)}
  w.querySelector(".ohd-c").innerHTML=dlgHTML(d);w.hidden=false;document.documentElement.classList.add("ohopen");setTimeout(()=>{const b=w.querySelector("[data-oh]");b&&b.focus()},30)}
function closeDlg(){const w=document.getElementById("ohdlg");if(w)w.hidden=true;document.documentElement.classList.remove("ohopen");DLG=null}
function redraw(){if(DLG){const w=document.getElementById("ohdlg");if(w&&!w.hidden)w.querySelector(".ohd-c").innerHTML=dlgHTML(DLG)}}
window.ACRACB_dlgRedraw=redraw;
function addOwn(tid,b,call,mode,heard){const t=T0(tid);if(!t)return;const lh=localNow();let ex=0;try{const k=spotMode({mode});ex=((MODES[k]&&MODES[k].adj)||0)-MD().adj}catch(_){}
  const lp=t.l&&prob(t,lh,b,true,"rx").p>prob(t,lh,b,false,"rx").p;const M=marg(t,lh,b,lp,true);if(!M)return;
  const prev=lastOwn(call,b);if(prev&&Date.now()-Date.parse(prev.at)<15*6e4){const i=OBS.indexOf(prev);if(i>=0)OBS.splice(i,1)}
  OBS.push({k:calKey(),t:tid,b,lh,h:heard?1:0,m:Math.round(M.m*10)/10,dl:M.DL,du:M.DU,thr:M.thr-ex,at:new Date().toISOString(),call,src:"tarjeta"});if(OBS.length>600)OBS=OBS.slice(-600);
  dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();rebox();redraw()}
/* vuelve a pintar los recuadros «¿Lo oyes?» que sigan en pantalla (aviso de portada incluido) */
function rebox(){try{renderAlBar()}catch(_){}document.querySelectorAll(".ohbox").forEach(bx=>{const q=bx.querySelector("[data-ohq]");if(!q)return;bx.outerHTML=ACRACB_ohBox({t:q.dataset.t,b:+q.dataset.b,call:q.dataset.call,mode:q.dataset.mode})})}
window.ACRACB_rebox=rebox;
const T0=id=>{try{return TG().find(t=>t.id===id)}catch(_){return null}};
const dOf=el=>({t:el.dataset.t,b:+el.dataset.b,call:el.dataset.call,mode:el.dataset.mode,f:el.dataset.f||((el.closest(".sc")||{}).dataset||{}).f||""});
document.addEventListener("click",ev=>{const tg=ev.target;if(!tg.closest)return;
  if(tg.closest("[data-ohx]")){closeDlg();return}
  const h=tg.closest("#ohdlg [data-oh]");if(h&&DLG){try{addOwn(DLG.t,DLG.b,DLG.call,DLG.mode,h.dataset.oh==="1")}catch(e){console.error(e)}return}
  const rr=tg.closest("[data-rr]");if(rr){try{const o=OBS.slice().reverse().find(x=>x.at===rr.dataset.o);if(o){const v=+rr.dataset.rr;if(o.r===v)delete o.r;else o.r=v;const s=obsSnr(o);if(s!=null)o.snr=Math.round(s*10)/10;else delete o.snr;dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();rebox();redraw()}}catch(e){console.error(e)}return}
  const q=tg.closest("[data-ohq]");if(q){openDlg(dOf(q));return}
  const card=tg.closest(".sc[data-ohc]");if(card&&!tg.closest("a,button,input,select,summary,label,.cs,details"))openDlg(dOf(card))});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&DLG){closeDlg();return}if((ev.key==="Enter"||ev.key===" ")&&ev.target.matches&&ev.target.matches(".sc[data-ohc]")){ev.preventDefault();openDlg(dOf(ev.target))}});
/* tus escuchas recientes de una zona y banda: la prueba más fuerte (45 minutos) */
window.ACRACB_own=(tid,dx,b)=>{try{const lim=Date.now()-45*6e4;let best=null;for(let i=OBS.length-1;i>=0;i--){const o=OBS[i];if(!o.call||o.b!==b)continue;const at=Date.parse(o.at);if(at<lim)break;
    let same=o.t===tid;if(!same&&dx){const t=T0(o.t);same=t&&distJS([t.lon,t.lat],dx)<1200}if(same){best=o;break}}
  if(!best)return null;const w=Math.exp(-(Date.now()-Date.parse(best.at))/(45*6e4));const fs=best.s!=null?Math.max(.2,Math.min(1,(best.s<=9?best.s:9+(best.s-9)/10)/10.5)):.6;return {h:!!best.h,w,fs}}catch(_){return null}};
/* 2.6.0: lectura del S-metro al pulsar «Lo oigo». S9 = −73 dBm y 6 dB por punto S; por encima, S9 + dB.
   La lectura menos el ruido típico de la banda en un entorno rural (más el ruido de tu entorno que hayas puesto en la estación)
   da la relación señal/ruido que de verdad tuviste, y la calibración la usa además de «lo oigo / no lo oigo». */
const SVAL=[1,2,3,4,5,6,7,8,9,19,29,39,49,69];
const sTxt=v=>v<=9?"S"+v:"S9+"+(v-9);window.ACRACB_sTxt=sTxt;window.ACRACB_sLbl=v=>T(" con <b>"," at <b>")+sTxt(v)+"</b>";
const sDbm=v=>v<=9?-73-6*(9-v):-73+(v-9);
const NRUR=[-100,-105,-110,-120,-123,-125,-127,-129,-108,-115,-131];
/* VOACAP trabaja en dB-Hz: la relación en 2,4 kHz se pasa sumando 33,8 dB; una señal que apenas asoma sobre el ruido cuenta como 3 dB */
/* R (legibilidad, solo fonía): R1 ≈ 0 dB, R2 ≈ 3, R3 ≈ 6, R4 ≈ 10 y R5 ≈ 15 dB de relación en 2,4 kHz. Con S y R se promedian. */
const RSNR={1:0,2:3,3:6,4:10,5:15};
function obsSnr(o){const v=[];if(o.s!=null){const n=NRUR[o.b];if(n!=null){let pen=0;try{pen=localNoisePen(o.b,o.lh)}catch(_){}v.push(Math.max(3,sDbm(o.s)-(n+pen)))}}if(o.r!=null&&RSNR[o.r]!=null)v.push(RSNR[o.r]);return v.length?v.reduce((a,b)=>a+b,0)/v.length+33.8:null}
window.ACRACB_smeter=last=>{const cur=last.s;return `<div class="smeter" role="group" aria-label="${T("Lectura del S-metro","S-meter reading")}"><span class="smt">${T("¿Con qué señal?","What signal?")}</span><div class="smb">${SVAL.map((v,i)=>`<button type="button" data-smt="${v}" data-o="${e2(last.at)}" aria-pressed="${cur===v}" style="--i:${i}">${v<=9?v:"+"+(v-9)}</button>`).join("")}</div></div>`};
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-smt]");if(!b)return;try{const o=OBS.slice().reverse().find(x=>x.at===b.dataset.o);if(!o)return;const v=+b.dataset.smt;
  if(o.s===v)delete o.s;else o.s=v;{const s=obsSnr(o);if(s!=null)o.snr=Math.round(s*10)/10;else delete o.snr}dbSave("owner/cal",OBS);fitCal();CACHE.clear();refresh();try{renderPop()}catch(_){}try{renderInfo()}catch(_){}try{ACRACB_rebox()}catch(_){}try{redraw()}catch(_){}}catch(e){console.error(e)}});
/* 2.5.9: «Mi modo / Todos los modos» en «Qué hacer» y casilla «Todos los modos» en la estación: las dos cosas van sincronizadas */
const allOn=()=>{try{return CMS().length===Object.keys(MODES).length}catch(_){return false}};
window.ACRACB_recModes=()=>{const on=allOn();let my="";try{my=MODES[MOD()].s}catch(_){}
  return `<div class="recm seg" role="group" aria-label="${T("Modos","Modes")}"><button type="button" data-recm="0" aria-pressed="${!on}">${T("Mi modo","My mode")}${my?" · "+e2(my):""}</button><button type="button" data-recm="1" aria-pressed="${on}">${T("Todos los modos","All modes")}</button></div>`};
function syncAll(){const c=document.getElementById("allmodes");if(c)c.checked=allOn()}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-recm]");if(!b)return;const want=b.dataset.recm==="1";if(want!==allOn()){try{toggleAllCM()}catch(_){}}syncAll();try{renderSide()}catch(_){}});
document.addEventListener("change",ev=>{if(ev.target&&ev.target.id==="allmodes"){if(ev.target.checked!==allOn()){try{toggleAllCM()}catch(_){}}syncAll()}});
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
let ZEV=new Map(),ZEVK="";
function zoneEv(dx,band,myAdj,key){spotIndex();const sk=SIXK+"|"+TXP.join(",")+"|"+myAdj;if(sk!==ZEVK){ZEV=new Map();ZEVK=sk}spotIndex();const kk=key+"|"+band;if(ZEV.has(kk))return ZEV.get(kk);
  const myMid=mid(TXP,dx),myLen=distJS(TXP,dx);let miss=1,wSum=0,fsW=0;
  for(const x of spotIndex()){if(x.band!==band||distJS(x.dx,dx)>1200)continue;const mw=modeW(x.mode,myAdj);
    for(const fr of x.from){const w=pathSim(fr,x.dx,myMid,myLen)*x.wA*mw;if(w<.02)continue;miss*=1-Math.min(.95,w);wSum+=w;fsW+=w*x.fs}}
  const r={E:1-miss,fs:wSum?fsW/wSum:.6};ZEV.set(kk,r);return r}
/* 2.5.3: la misma ponderación en TODA la plataforma: cada probabilidad de VOACAP de la hora actual se equilibra con lo que dicen
   los clústeres hacia ese destino; una hora antes o después cuenta la mitad y a partir de dos horas manda solo la previsión */
window.ACRACB_live=(t,lh,b,p,extra)=>{if(t.lat==null||t.lon==null||b==null)return p;let now;try{now=localNow()}catch(_){return p}
  let dh=Math.abs(lh-now);dh=Math.min(dh,24-dh);const wh=Math.max(0,1-dh/2);if(!wh)return p;
  let myAdj=0;try{myAdj=MD().adj+(extra||0)}catch(_){}const z=zoneEv([t.lon,t.lat],b,myAdj,t.id);
  /* evidencia en contra: si los que te rodean están oyendo mucho DX en esta banda y nadie oye nada de un destino donde
     normalmente hay actividad, lo más probable es que esa dirección esté cerrada. Se baja con prudencia, como mucho a la mitad. */
  {const ow=window.ACRACB_own&&ACRACB_own(t.id,[t.lon,t.lat],b);if(ow){const w=ow.w*wh;if(ow.h){const cap=.45+.5*ow.fs;return cap>p?p+(cap-p)*w:p}return p*(1-.7*w)}}
  if(z.E<.05){const bz=busyNear(b),aw=Math.min(1,(t.act||0)/5);return bz>0&&aw>0?p*(1-.5*bz*aw*wh):p}
  const cap=.35+.5*z.fs;return cap>p?p+(cap-p)*z.E*wh:p};
/* cuánto se oye en una banda desde tu zona ahora mismo (0 = nada, 1 = mucha actividad) */
let BZ=new Map(),BZK="";
function busyNear(b){spotIndex();const k=SIXK+"|"+TXP.join(",");if(k!==BZK){BZ=new Map();BZK=k}if(BZ.has(b))return BZ.get(b);let n=0;
  for(const x of spotIndex()){if(x.band!==b)continue;for(const fr of x.from){try{if(distJS(TXP,fr)<1500){n+=x.wA;break}}catch(_){}}}
  const r=1-Math.exp(-n/8);BZ.set(b,r);return r}
function pathSim(fr,dx,myMid,myLen){try{const L2=distJS(fr,dx),ms=distJS(mid(fr,dx),myMid),dl=(L2-myLen)/Math.max(800,.3*myLen);const q=ms/1200;return Math.exp(-q*q)*Math.exp(-dl*dl)}catch(_){return 0}}
function spotProb(s,e,a){let lh=null;try{lh=localNow()}catch(_){}
  let k="ssb";try{k=spotMode(s)}catch(_){}let ex=0;try{ex=(MODES[k]?MODES[k].adj:0)-MD().adj}catch(_){}
  let pS=e.pSP||0,pL=e.t&&e.t.l?(e.pLP||0):0;
  if(e.t&&lh!=null){window.ACRACB_NOLIVE=true;try{pS=prob(e.t,lh,s.band,false,ex).p;pL=e.t.l?prob(e.t,lh,s.band,true,ex).p:0}catch(_){}finally{window.ACRACB_NOLIVE=false}}
  const lp=pL>pS&&pL>=.05;const p0=lp?pL:pS;let p=p0;
  let E=0,fsW=0,wSum=0,self=false;
  if(s.dx&&s.dx[0]!=null&&!lp){const myMid=mid(TXP,s.dx),myLen=distJS(TXP,s.dx);let miss=1;
    /* el propio spot (aunque sea algo antiguo) y los demás de la misma zona */
    const own={dx:s.dx,from:(s.from||[]).filter(f=>f&&f[0]!=null),wA:Math.exp(-Math.max(0,a==null?60:a)/30),fs:snrF(s),same:true};
    const cand=[own].concat(spotIndex().filter(x=>x.band===s.band&&x.call!==s.call&&distJS(x.dx,s.dx)<1200));
    let spAdj=0;try{spAdj=(MODES[k]&&MODES[k].adj)||0}catch(_){}
    for(const x of cand)for(const fr of x.from){const w=pathSim(fr,x.dx,myMid,myLen)*x.wA*(x.same?1:.7*modeW(x.mode,spAdj));if(w<.02)continue;miss*=1-Math.min(.95,w);wSum+=w;fsW+=w*x.fs;if(x.same&&w>.25)self=true}
    E=1-miss}
  const fs=wSum?fsW/wSum:.6,cap=.35+.5*fs;if(E>0&&cap>p)p=p+(cap-p)*E;
  let heard=false,hw=0;try{const H=window.ACRACB_heardList&&ACRACB_heardList();if(H&&s.dx){const ha=(Date.now()-H.at)/6e4;if(ha<45)for(const x of H.list){if(x.band===s.band&&x.pos&&distJS(x.pos,s.dx)<1500){heard=true;hw=Math.exp(-ha/45);break}}}}catch(_){}
  if(heard&&p<.9)p=p+(.9-p)*hw;
  try{const ow=window.ACRACB_own&&ACRACB_own(e.t&&e.t.id,s.dx,s.band);if(ow){if(ow.h){const cap=.45+.5*ow.fs;if(cap>p)p=p+(cap-p)*ow.w}else p=p*(1-.7*ow.w)}}catch(_){}
  return {p,lp,p0,near:E>.3,self,E,heard}}
window.ACRACB_spotProb=spotProb;
/* 2.6.3: la misma probabilidad de QSO en todas las tarjetas (avisos, aviso de portada, «Cerca», POTA/SOTA/WWFF) */
function PC(s,a){try{if(s.band==null)return {};const dx=s.dx&&s.dx[0]!=null?s.dx:(window.ACRACB_areaPos&&ACRACB_areaPos(s.call));if(!dx)return {};
  const ss=Object.assign({},s,{dx,kind:"dx",from:Array.isArray(s.from)?s.from:[]});const e=spotEval(ss,localNow());if(!e||!e.t)return {};const r=spotProb(ss,e,a);
  return isFinite(r.p)?{p:Math.round(r.p*100),lpb:!!r.lp,oh:{t:e.t.id,b:ss.band,call:ss.call,mode:ss.mode}}:{}}catch(_){return {}}}
function dxRow(s,e,a){const st=splitTags(s);const tags=[];const sp=spotProb(s,e,a);if(s.nw)tags.push(`<span class="nwb">${T("NUEVO","NEW")}</span>`);if(s.ns>1)tags.push(`<span class="nsb">${T(`en ${s.ns} clústeres`,`on ${s.ns} clusters`)}</span>`);
  return card({call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tags.concat(st.pr),by:CSL(s.by,", "),xs:st.xs,geo:geoOf(s.dx)||{az:e.az,laz:e.laz,km:e.km},p:Math.round(sp.p*100),p0:Math.round(sp.p0*100),lpb:sp.lp,oh:e.t?{t:e.t.id,b:s.band,call:s.call,mode:s.mode}:null,old:a>60})}
function progRow(o){const tag=`<a class="xtag xr" href="${refUrl(o.prog,o.ref)}" target="_blank" rel="noopener noreferrer" data-ext title="${T("Ficha del","Page of the")} ${T(PNAME[o.prog][0],PNAME[o.prog][1])}">${e2(o.prog)} ${e2(o.ref)}</a>`;
  return card({...PC({call:o.call,band:o.band,mode:o.mode,f:o.f,dx:o.dx,t:o.t,c:o.c},o.a),call:o.call,a:o.a,t:o.t,f:o.f,band:o.band,mode:o.mode,tags:[tag],byLbl:T("Spot de","Spotted by"),by:o.by?e2(o.by):"",geo:geoOf(o.dx),note:o.c?e2(o.c):"",old:o.a>30})}
const NREF=/(POTA|SOTA|WWFF|GMA|DME|DVGE|DFE|IOTA|DIE|DCE|DMVE|DEE)[ :-]*[A-Z0-9/-]+/i;
function nearRow(s,a){const st=splitTags(s);const tags=[];if(s.nw)tags.push(`<span class="nwb">${T("NUEVO","NEW")}</span>`);if(s.ns>1)tags.push(`<span class="nsb">${T(`en ${s.ns} clústeres`,`on ${s.ns} clusters`)}</span>`);
  const m=String(s.c||"").match(NREF);if(m&&!st.pr.length)tags.push(`<span class="xtag xr">${e2(m[0].toUpperCase())}</span>`);
  return card({...PC(s,a),call:s.call,a,t:s.t,f:s.f,band:s.band,mode:modeOf(s),tags:tags.concat(st.pr),by:CSL(s.by,", "),xs:st.xs,geo:geoOf(s.dx),old:a>60})}
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
    const tag=`<span class="xtag ${/DXped/i.test(need)?"xs dxpt":"xr"}">${e2(/DXped/i.test(need)?T("DXpedición","DXpedition"):T("entidad rara","rare entity"))}</span>`;
    let a=null;try{a=spotAge({t:x.t})}catch(e){}
    return card({...PC({call:x.call,band,mode,f:x.f,dx:sp.dx,from:sp.from,c:x.c||sp.c,t:x.t},a),call:x.call,a,t:x.t,f:x.f,band,mode,tags:[tag].concat(st.pr),by:CSL(String(x.by||"").split(/[ ,]+/).filter(Boolean),", "),xs:st.xs,geo:geoOf(sp.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(x.call)))})}).join("")
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
    const tag=`<span class="xtag ${/DXped/i.test(need)?"xs dxpt":"xr"}">${e2(/DXped/i.test(need)?T("DXpedición","DXpedition"):T("entidad rara","rare entity"))}</span>`;let a=null;try{a=spotAge({t:x.t})}catch(e){}
    return card({...PC({call:x.call,band,mode,f:x.f,dx:sp.dx,from:sp.from,c:x.c||sp.c,t:x.t},a),call:x.call,a,t:x.t,f:x.f,band,mode,tags:[tag].concat(stg.pr),by:CSL(String(x.by||"").split(/[ ,]+/).filter(Boolean),", "),xs:stg.xs,geo:geoOf(sp.dx||(window.ACRACB_areaPos&&ACRACB_areaPos(x.call)))})}).join("")}</div>`;
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
