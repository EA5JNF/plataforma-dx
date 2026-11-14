/* ---- ACRACB 1.2: visor del log (continentes, países, bandas, modos, mapa y diplomas) ---- */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const e2=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const CONT={EU:"Europa",AF:"África",AS:"Asia",NA:"Norteamérica",SA:"Sudamérica",OC:"Oceanía",AN:"Antártida"};
const CC={EU:"AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA XK",
  AF:"AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW",
  AS:"AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IO IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE",
  NA:"AG AI AW BB BL BM BQ BS BZ CA CR CU CW DM DO GD GL GP GT HN HT JM KN KY LC MF MQ MS MX NI PA PM PR SV SX TC TT US VC VG VI",
  SA:"AR BO BR CL CO EC FK GF GS GY PE PY SR UY VE",OC:"AS AU CK FJ FM GU KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV UM VU WF WS",AN:"AQ BV HM TF"};
const CCM={};Object.entries(CC).forEach(([k,v])=>v.split(" ").forEach(c=>CCM[c]=k));
let ENT=null;
function ents(){if(ENT)return ENT;const D=DXDg().d,meta={};(V.meta||[]).forEach(m=>{if(!meta[m[2]])meta[m[2]]={cont:m[7],lat:m[4],lon:m[5]}});
  ENT=Object.entries(D).map(([dx,v])=>{const mt=meta[dx]||{};return {dx:+dx,cc:v[0],name:(typeof dxName==="function"&&dxName(+dx))||v[1],cont:mt.cont||CCM[v[0]]||"",lat:mt.lat,lon:mt.lon}});return ENT}
const HF=[0,1,8,2,9,3,4,5,6,7,10];
let F={st:"all",ct:"",q:"",n:60};
function stat(dx){const e=LOG.e[dx];if(!e)return null;return Object.values(e).includes("C")?"C":"W"}
function bar(a,b,tot,cl){const pa=tot?Math.round(a/tot*100):0,pb=tot?Math.round(b/tot*100):0;return `<div class="lvbar" title="${b} confirmadas, ${a} trabajadas de ${tot}"><span class="lvw" style="width:${pa}%"></span><span class="lvc" style="width:${pb}%"></span></div>`}
window.ACRACB_logview=function(){if(typeof LOG==="undefined"||!LOG||!LOG.e)return "";const E=ents();const tot=E.length;
  let wk=0,cf=0;const byC={};Object.keys(CONT).forEach(k=>byC[k]={w:0,c:0,t:0});
  E.forEach(x=>{const s=stat(x.dx);const k=byC[x.cont];if(k){k.t++;if(s)k.w++;if(s==="C")k.c++}if(s)wk++;if(s==="C")cf++});
  const known=new Set(E.map(x=>x.dx));const extra=Object.keys(LOG.e).filter(d=>!known.has(+d)).length;
  const bandW={},bandC={};let slots=0;HF.forEach(b=>{bandW[b]=0;bandC[b]=0});
  Object.values(LOG.e).forEach(v=>HF.forEach(b=>{const s=v[BKEY[b]];if(s)bandW[b]++;if(s==="C"){bandC[b]++;slots++}}));
  const wacC=Object.entries(byC).filter(([k,v])=>k!=="AN"&&v.c>0).map(([k])=>k),wacMiss=["EU","AF","AS","NA","SA","OC"].filter(k=>!wacC.includes(k));
  const dxccTxt=cf>=100?`<b>Conseguido</b> (${cf} confirmadas)`:`te faltan <b>${100-cf}</b> confirmadas`;
  let h=`<h3>Tu log de un vistazo</h3><div class="lvaw">
   <div class="chip"><div class="k">Diploma DXCC (100 entidades)</div><div class="v">${cf} / 100</div>${bar(Math.min(wk,100),Math.min(cf,100),100)}<div class="t">${dxccTxt}</div></div>
   <div class="chip"><div class="k">WAC (6 continentes)</div><div class="v">${wacC.length} / 6</div>${bar(wacC.length,wacC.length,6)}<div class="t">${wacMiss.length?"te falta "+wacMiss.map(k=>CONT[k]).join(", "):"<b>Conseguido</b>: todos confirmados"}</div></div>
   <div class="chip"><div class="k">Bandas-entidad confirmadas</div><div class="v">${fk(slots)}</div>${bar(Math.min(slots,1000),Math.min(slots,1000),1000)}<div class="t">el DXCC Challenge empieza en 1.000 (160 a 6 m)</div></div>
   <div class="chip"><div class="k">Entidades DXCC</div><div class="v">${wk} / ${tot}</div>${bar(wk,cf,tot)}<div class="t">${cf} confirmadas · te faltan ${tot-wk}${extra?` · ${extra} ya eliminadas de la lista`:""}</div></div></div>
   <div class="lvleg"><span><i class="lvc"></i> confirmadas</span><span><i class="lvw"></i> trabajadas sin confirmar</span><span><i class="lvn"></i> te faltan</span></div>
   <div class="lvmap" id="lvmap"></div>
   <div class="lvcols"><div><h3>Por continente</h3><table class="bt lvt"><tr><th>Continente</th><th>Trab.</th><th>Conf.</th><th>Total</th><th></th></tr>${Object.entries(byC).map(([k,v])=>`<tr><td><b>${CONT[k]}</b></td><td>${v.w}</td><td>${v.c}</td><td>${v.t}</td><td class="lvbc">${bar(v.w,v.c,v.t)}</td></tr>`).join("")}</table></div>
   <div><h3>Por banda</h3><table class="bt lvt"><tr><th>Banda</th><th>Trab.</th><th>Conf.</th><th></th></tr>${HF.filter(b=>bandW[b]).map(b=>`<tr><td><b style="color:${BC[b]}">${BANDS[b]}</b></td><td>${bandW[b]}</td><td>${bandC[b]}</td><td class="lvbc">${bar(bandW[b],bandC[b],tot)}</td></tr>`).join("")||`<tr><td colspan="4" class="note">Sin datos de banda.</td></tr>`}</table>
   ${LOG.m?(()=>{const mw={CW:0,PH:0,DG:0},mc={CW:0,PH:0,DG:0};Object.values(LOG.m).forEach(v=>Object.entries(v).forEach(([k,s])=>{if(mw[k]!=null){mw[k]++;if(s==="C")mc[k]++}}));
     return `<h3>Por modo</h3><table class="bt lvt"><tr><th>Modo</th><th>Trab.</th><th>Conf.</th></tr>${[["CW","CW"],["PH","Fonía"],["DG","Digitales"]].map(([k,n])=>`<tr><td><b>${n}</b></td><td>${mw[k]}</td><td>${mc[k]}</td></tr>`).join("")}</table>`})():`<p class="note">Vuelve a subir tu ADIF para ver también el desglose por modo (CW, fonía y digitales).</p>`}</div></div>
   <h3>Países</h3><div class="lvf"><div class="seg" role="group" aria-label="Qué países ver">${[["all","Todos"],["C","Confirmados"],["W","Sin confirmar"],["N","Me faltan"]].map(([k,n])=>`<button data-lvst="${k}" aria-pressed="${F.st===k}">${n}</button>`).join("")}</div>
   <select id="lvct" aria-label="Continente"><option value="">Todos los continentes</option>${Object.entries(CONT).map(([k,n])=>`<option value="${k}"${F.ct===k?" selected":""}>${n}</option>`).join("")}</select>
   <input id="lvq" type="search" placeholder="Buscar país" aria-label="Buscar país" value="${e2(F.q)}"></div><div id="lvlist"></div>`;
  setTimeout(()=>{list();drawMap()},0);return h};
function list(){const el=$("lvlist");if(!el)return;const q=F.q.trim().toLowerCase();
  const a=ents().filter(x=>{const s=stat(x.dx);if(F.st==="C"&&s!=="C")return false;if(F.st==="W"&&s!=="W")return false;if(F.st==="N"&&s)return false;if(F.ct&&x.cont!==F.ct)return false;if(q&&!x.name.toLowerCase().includes(q))return false;return true})
    .sort((p,r)=>p.name.localeCompare(r.name,"es"));
  const fl=cc=>{try{const f=DXDg().f[cc];return f?`<img class="fl" alt="" width="18" height="12" src="data:image/svg+xml,${encodeURIComponent(f)}">`:""}catch(e){return ""}};
  el.innerHTML=`<p class="note">${a.length} ${a.length===1?"entidad":"entidades"}</p><div class="lvl">${a.slice(0,F.n).map(x=>{const v=LOG.e[x.dx]||{},s=stat(x.dx);
    return `<div class="lvi ${s==="C"?"c":s==="W"?"w":"n"}"><span class="lvn2">${fl(x.cc)} <b>${e2(x.name)}</b> <small>${CONT[x.cont]||""}</small></span><span class="lvbs">${HF.map(b=>{const k=v[BKEY[b]];return k?`<i class="${k==="C"?"c":"w"}" title="${BANDS[b]}: ${k==="C"?"confirmada":"trabajada"}">${BANDS[b].replace(/\s+c?m$/,"")}</i>`:""}).join("")||'<i class="n">te falta</i>'}</span></div>`}).join("")}</div>
    ${a.length>F.n?`<button class="btn" id="lvmore">Ver ${Math.min(60,a.length-F.n)} más</button>`:""}`;
  const m=$("lvmore");if(m)m.onclick=()=>{F.n+=60;list()}}
function drawMap(){const el=$("lvmap");if(!el||typeof d3==="undefined"||typeof topojson==="undefined")return;
  try{const W=720,H=330;const topo=JSON.parse($("world").textContent);let land=topojson.feature(topo,topo.objects.countries||topo.objects.land);
    /* d3 dibuja al revés los polígonos con el sentido de giro invertido (rellenan todo el mapa): se corrigen aquí */
    const fix=g=>{if(!g)return g;const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];polys.forEach(p=>{if(d3.geoArea({type:"Polygon",coordinates:p})>2*Math.PI)p.forEach(r=>r.reverse())});return g};
    (land.features||[land]).forEach(f=>fix(f.geometry));
    const pr=d3.geoEquirectangular().fitSize([W,H],{type:"Sphere"}).translate([W/2,H/2+18]);const pa=d3.geoPath(pr);
    const dots=ents().filter(x=>x.lat!=null&&x.lon!=null).map(x=>{const s=stat(x.dx);const p=pr([x.lon,x.lat]);return p?`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${s?3.2:2.2}" class="${s==="C"?"c":s==="W"?"w":"n"}"><title>${e2(x.name)}: ${s==="C"?"confirmada":s==="W"?"trabajada sin confirmar":"te falta"}</title></circle>`:""}).join("");
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa de las entidades de tu log">${(land.features||[land]).map(f=>`<path d="${pa(f)||""}" class="lvland"/>`).join("")}${dots}</svg>`}catch(e){el.innerHTML=""}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-lvst]");if(!b)return;F.st=b.dataset.lvst;F.n=60;document.querySelectorAll("[data-lvst]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));list()});
document.addEventListener("change",e=>{if(e.target.id==="lvct"){F.ct=e.target.value;F.n=60;list()}});
document.addEventListener("input",e=>{if(e.target.id==="lvq"){F.q=e.target.value;F.n=60;list()}});
})();
