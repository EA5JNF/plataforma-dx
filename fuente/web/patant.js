/* 2.11.56: el patrón real de tu antena. Se importa la salida de NEC-2 (4nec2, MMANA-GAL exportado a NEC, xnec2c…) o
   una tabla CSV «frecuencia MHz, azimut, elevación, ganancia dBi». Debe estar calculado sobre suelo real y a tu altura,
   porque se usa tal cual: no se le añade otro reflejo del suelo. En cada banda se usa la frecuencia del patrón más
   cercana (como mucho a un 12 %); en las bandas que el patrón no cubre, esta antena no transmite.
   Giratoria: se supone apuntada hacia cada destino (se toma la dirección de máxima ganancia). Fija: se usa el rumbo real
   de cada destino respecto a hacia dónde apunta. Todo se guarda solo en este aparato. */
(function(){
  if(typeof ANT!=="object"||typeof gAnt!=="function")return;
  const T=(a,b)=>window.ACRACB_LANG==="en"?b:a;
  const KEY="acracb_antpat1";
  let P=null;try{P=JSON.parse(localStorage.getItem(KEY)||"null")}catch(_){P=null}
  const nf=(x,d)=>{const s=(+x).toFixed(d);return window.ACRACB_LANG==="en"?s:s.replace(".",",")};

  /* ---------- lectura ---------- */
  function grid(pts){const az=[...new Set(pts.map(p=>p[0]))].sort((a,b)=>a-b),el=[...new Set(pts.map(p=>p[1]))].sort((a,b)=>a-b);
    const g=el.map(()=>az.map(()=>null));const ia=new Map(az.map((v,i)=>[v,i])),ie=new Map(el.map((v,i)=>[v,i]));
    for(const [a,e,v] of pts){const r=g[ie.get(e)];const c=ia.get(a);if(r[c]==null||v>r[c])r[c]=v}
    /* huecos: el valor más cercano de la misma elevación */
    for(const r of g)for(let i=0;i<r.length;i++)if(r[i]==null){let k=1;while(k<r.length){const L=r[(i-k+r.length)%r.length],R=r[(i+k)%r.length];if(L!=null||R!=null){r[i]=L!=null?L:R;break}k++}if(r[i]==null)r[i]=-99}
    return {az,el,g}}
  function parseNEC(txt){const out={};const lines=txt.split(/\r?\n/);let f=null,inP=false;
    for(const l of lines){const m=l.match(/FREQUENCY\s*[=:]\s*([\d.]+E?[+-]?\d*)\s*MHZ/i);if(m){f=+(+m[1]).toPrecision(6);inP=false;continue}
      if(/RADIATION PATTERNS/i.test(l)){inP=true;continue}
      if(!inP||f==null)continue;
      const c=l.trim().split(/\s+/);if(c.length<5||!/^-?[\d.]+$/.test(c[0])||!/^-?[\d.]+$/.test(c[1])){if(/^\s*$/.test(l)||/DEGREES|THETA|ANGLES/i.test(l))continue;if(out[f]&&out[f].length)inP=false;continue}
      const th=+c[0],ph=+c[1],tot=+c[4];if(!isFinite(th)||!isFinite(ph)||!isFinite(tot))continue;if(th>90)continue;
      (out[f]=out[f]||[]).push([((-ph)%360+360)%360,Math.round((90-th)*100)/100,tot<-900?-99:tot])}
    return out}
  function parseCSV(txt){const out={};for(const l of txt.split(/\r?\n/)){const c=l.split(/[;,\t]/).map(x=>x.trim().replace(",","."));if(c.length<4)continue;const [f,a,e,g]=c.map(Number);if(![f,a,e,g].every(isFinite))continue;if(e<0||e>90)continue;
    (out[f]=out[f]||[]).push([((a%360)+360)%360,e,g])}return out}
  function build(name,txt){let raw=parseNEC(txt);if(!Object.keys(raw).length)raw=parseCSV(txt);
    const F={};for(const f in raw){if(raw[f].length<4)continue;F[f]=grid(raw[f])}
    if(!Object.keys(F).length)throw new Error(T("no se encontró ningún diagrama de radiación ni tabla con frecuencia, azimut, elevación y ganancia","no radiation pattern or table with frequency, azimuth, elevation and gain was found"));
    return {name:name||T("Mi antena","My antenna"),fixed:false,head:0,F}}

  /* ---------- uso ---------- */
  function fFor(b){if(!P)return null;let best=null,bd=1;for(const f in P.F){const d=Math.abs(+f-MHZ[b])/MHZ[b];if(d<bd){bd=d;best=f}}return bd<=.12?P.F[best]:null}
  function bil(G,az,el){const {az:A,el:E,g}=G;const fi=(arr,v)=>{if(v<=arr[0])return [0,0,0];if(v>=arr[arr.length-1])return [arr.length-1,arr.length-1,0];let i=0;while(arr[i+1]<v)i++;return [i,i+1,(v-arr[i])/(arr[i+1]-arr[i])]};
    const full=A[A.length-1]-A[0]>=300;let [a0,a1,ta]=fi(A,az);if(full&&(az>A[A.length-1]||az<A[0])){a0=A.length-1;a1=0;const span=360-A[A.length-1]+A[0];ta=((az-A[A.length-1]+360)%360)/span}
    const [e0,e1,te]=fi(E,el);/* se interpola en potencia, no en dB: cerca del horizonte, donde NEC da −999, queda razonable */const v=(r,c)=>Math.pow(10,Math.max(-99,g[r][c])/10);const top=v(e0,a0)*(1-ta)+v(e0,a1)*ta,bot=v(e1,a0)*(1-ta)+v(e1,a1)*ta;const w=top*(1-te)+bot*te;return w>0?Math.max(-99,10*Math.log10(w)):-99}
  function maxAt(G,el){let m=-99;for(let i=0;i<G.az.length;i++)m=Math.max(m,bil(G,G.az[i],el));return m}
  function bandsOf(){return [0,1,8,2,9,3,4,5,6,7,10].filter(b=>fFor(b))}
  function define(){if(P){ANT.pat={n:P.name,bands:bandsOf(),pat:true,d:T(`patrón importado de «${P.name}»`,`imported pattern of "${P.name}"`)}}else delete ANT.pat}
  define();
  const _gAnt=gAnt;window.gAnt=gAnt=function(id,th,b){if(id==="pat"){const G=fFor(b);return G?maxAt(G,th):-99}return _gAnt.apply(this,arguments)};
  /* antena fija: el rumbo de cada destino cuenta */
  const _aa=antAdj;window.antAdj=antAdj=function(t,lh,b,lp){const ids=ANTS();if(!P||!P.fixed||!ids.includes("pat"))return _aa.apply(this,arguments);
    const G=fFor(b);if(!G)return _aa.apply(this,arguments);let [a]=hopRaw(t,lp&&t.l,hidx(lh),b);if(!a)a=6;
    const brg=((lp?(t.laz!=null?t.laz:t.az+180):t.az)%360+360)%360,rel=((brg-(+P.head||0))%360+360)%360;
    const gp=bil(G,rel,a)-gVert(a);let best=gp;for(const id of ids){if(id==="pat"||!ANT[id]||!ANT[id].bands.includes(b))continue;best=Math.max(best,gAnt(id,a,b)-gVert(a))}return best};

  /* ---------- interfaz ---------- */
  function opt(){const s=document.getElementById("antsel");if(!s)return;let o=s.querySelector('option[value="pat"]');
    if(P&&!o){const g=document.createElement("optgroup");g.label=T("Tu antena","Your antenna");o=document.createElement("option");o.value="pat";g.appendChild(o);s.appendChild(g)}
    if(o){if(P)o.textContent=T(`${P.name} · patrón importado`,`${P.name} · imported pattern`);else{const g=o.parentElement;o.remove();if(g&&g.tagName==="OPTGROUP"&&!g.children.length)g.remove()}}}
  function refresh(){define();try{MZ.clear()}catch(_){}try{CACHE.clear()}catch(_){}opt();const s=document.getElementById("antsel");if(s)s.dispatchEvent(new Event("change",{bubbles:true}));ui()}
  function summary(){if(!P)return `<p>${T("No hay ningún patrón importado.","No pattern imported.")}</p>`;
    const bs=bandsOf();const rows=bs.map(b=>{const G=fFor(b);const pk=[5,10,20,30].map(e=>nf(maxAt(G,e),1)).join(" · ");return `<div class="patr"><span>${BANDS[b]}</span><span>${pk}</span></div>`}).join("");
    return `<p><b>${P.name}</b> · ${bs.length?T(`cubre ${bs.map(b=>BANDS[b]).join(", ")}`,`covers ${bs.map(b=>BANDS[b]).join(", ")}`):T("no cubre ninguna banda de HF","covers no HF band")}.</p>
      ${bs.length?`<div class="patt"><div class="patr path"><span>${T("Banda","Band")}</span><span>${T("dBi máx. a 5° · 10° · 20° · 30°","max dBi at 5° · 10° · 20° · 30°")}</span></div>${rows}</div>`:""}
      <div class="patc"><label><input type="radio" name="patfx" value="rot"${P.fixed?"":" checked"}> ${T("Giratoria: apunta a cada destino","Rotatable: points at each destination")}</label>
      <label><input type="radio" name="patfx" value="fix"${P.fixed?" checked":""}> ${T("Fija, apuntando a","Fixed, pointing at")} <input type="number" class="pathd" min="0" max="359" step="1" value="${+P.head||0}" aria-label="${T("Rumbo al que apunta","Bearing it points to")}">°</label></div>
      <p class="note">${T("Para usarla, elígela en «Tipo de antena»: aparece al final de la lista.","To use it, choose it in «Antenna type»: it appears at the end of the list.")}</p>
      <button type="button" class="btn patdel">${T("Quitar el patrón","Remove the pattern")}</button>`}
  function ui(){let box=document.getElementById("patbox");const host=document.querySelector("#cfg .cfgfine");if(!host)return false;
    if(!box){box=document.createElement("details");box.id="patbox";box.className="mdet patbox";host.appendChild(box)}
    const op=box.open;
    box.innerHTML=`<summary>${T("El patrón real de tu antena (NEC o tabla)","Your antenna's real pattern (NEC or table)")}</summary>
      <p>${T("Si has simulado tu antena con 4nec2, xnec2c u otro programa NEC-2, sube el archivo de salida. También vale una tabla CSV con frecuencia en MHz, azimut, elevación y ganancia en dBi, una línea por punto. Calcúlalo sobre suelo real y a tu altura: se usa tal cual.","If you have simulated your antenna with 4nec2, xnec2c or another NEC-2 program, upload the output file. A CSV table with frequency in MHz, azimuth, elevation and gain in dBi, one line per point, also works. Compute it over real ground and at your height: it is used as is.")}</p>
      <label class="patf"><span>${T("Nombre","Name")}</span> <input type="text" class="patn" maxlength="40" value="${P?String(P.name).replace(/"/g,"&quot;"):""}" placeholder="${T("Mi antena","My antenna")}"></label>
      <label class="patf"><input type="file" class="patin" accept=".out,.txt,.csv,.nou,text/plain,text/csv"></label>
      <div class="patres">${summary()}</div>`;
    box.open=op;
    box.querySelector(".patin").onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const res=box.querySelector(".patres");
      try{if(f.size>8e6)throw new Error(T("el archivo pasa de 8 MB","the file is over 8 MB"));const txt=await f.text();const nm=box.querySelector(".patn").value.trim()||f.name.replace(/\.[^.]+$/,"");
        const N=build(nm,txt);if(P){N.fixed=P.fixed;N.head=P.head}P=N;localStorage.setItem(KEY,JSON.stringify(P));box.open=true;refresh()}
      catch(err){res.innerHTML=`<p class="paterr">${T("No se pudo leer","Could not read it")}: ${String(err&&err.message||err)}</p>`}};
    box.querySelector(".patn").onchange=e=>{if(!P)return;P.name=e.target.value.trim()||T("Mi antena","My antenna");localStorage.setItem(KEY,JSON.stringify(P));refresh()};
    box.querySelectorAll('input[name="patfx"]').forEach(r=>r.onchange=()=>{if(!P)return;P.fixed=r.value==="fix"&&r.checked;localStorage.setItem(KEY,JSON.stringify(P));refresh()});
    const hd=box.querySelector(".pathd");if(hd)hd.onchange=()=>{if(!P)return;P.head=Math.max(0,Math.min(359,+hd.value||0));localStorage.setItem(KEY,JSON.stringify(P));refresh()};
    const del=box.querySelector(".patdel");if(del)del.onclick=()=>{const s=document.getElementById("antsel");if(s&&s.value==="pat"){s.value="club"}P=null;localStorage.removeItem(KEY);refresh()};
    return true}
  window.ACRACB_patTest={parseNEC,parseCSV,build,set:(p)=>{P=p;refresh()},gain:(b,az,el)=>{const G=fFor(b);return G?bil(G,az,el):null}};
  opt();
  /* al cargar, la elección guardada «pat» no se pudo poner porque la opción aún no existía: se pone ahora */
  try{const s=document.getElementById("antsel");const v=typeof store==="object"&&store.get?store.get("c_antsel"):null;if(P&&s&&v==="pat"&&s.value!=="pat"){s.value="pat";refresh()}}catch(_){}
  let n=0;(function go(){if(!ui()&&++n<120)setTimeout(go,500)})();
})();
