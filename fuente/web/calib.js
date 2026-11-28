/* 2.11.55: «Acierto de la previsión». Se mide si la fiabilidad que da el modelo acierta, con hechos y no con opiniones:
   WSPR (wspr.live, gratuito y sin registro) dice qué estaciones transmitieron de verdad cada hora y en qué banda, y quién las oyó.
   Evento: una zona lejana (cuadrícula Maidenhead de 2 letras, a más de 1.500 km) que transmitió en esa banda y esa hora
   (la oyeron al menos 5 veces en el mundo) ¿fue oída por algún receptor WSPR a menos de 400 km de ti?
   Solo cuentan las horas y bandas en que los receptores cercanos estaban escuchando (descodificaron algo): así un «no»
   es un no de verdad, y no falta de receptores. Previsión: la de VOACAP con tu estación como receptor, la potencia
   mediana que declaran esos transmisores y el umbral de WSPR (6 dB en 1 Hz), sin las correcciones del día, que no
   existían esas horas: es una previsión hecha antes del suceso, porque solo usa la previsión mensual.
   Se compara con la climatología (la frecuencia media de cada banda en la misma muestra) con la puntuación de Brier. */
(function(){
  const T=(a,b)=>window.ACRACB_LANG==="en"?b:a;
  const CK="acracb_calib1",DAYS=3,NEAR=400,FAR=1500,THR=6;
  const WB={1:0,3:1,5:8,7:2,10:9,14:3,18:4,21:5,24:6,28:7};
  const nf=(x,d)=>{const s=(+x).toFixed(d);return window.ACRACB_LANG==="en"?s:s.replace(".",",")};
  async function q(sql){const c=new AbortController(),tm=setTimeout(()=>c.abort(),45000);
    try{const r=await fetch("https://db1.wspr.live/?query="+encodeURIComponent(sql+" FORMAT TSV"),{signal:c.signal});if(!r.ok)throw new Error("HTTP "+r.status);return (await r.text()).trim().split("\n").filter(Boolean).map(l=>l.split("\t"))}finally{clearTimeout(tm)}}
  function nearestT(lat,lon,ts){let best=null,bd=1e9;for(const t of ts){const dl=t.lat-lat,dn=((t.lon-lon+540)%360-180)*Math.cos(lat*Math.PI/180),d=dl*dl+dn*dn;if(d<bd){bd=d;best=t}}return best}
  async function run(){
    const P=TXP,lat=P[1],lon=P[0];
    const g=`greatCircleDistance(rx_lon,rx_lat,${lon.toFixed(3)},${lat.toFixed(3)})`,gt=`greatCircleDistance(tx_lon,tx_lat,${lon.toFixed(3)},${lat.toFixed(3)})`;
    const bands=Object.keys(WB).join(",");
    const [ev,cov]=await Promise.all([
      q(`SELECT toUnixTimestamp(toStartOfHour(time)) h,band,substring(tx_loc,1,2) f,round(avg(tx_lat),1),round(avg(tx_lon),1),round(median(power)),countIf(${g}<${NEAR*1000}) FROM wspr.rx WHERE time>now()-INTERVAL ${DAYS} DAY AND time<toStartOfHour(now()) AND band IN (${bands}) AND ${gt}>${FAR*1000} GROUP BY h,band,f HAVING count()>=5`),
      q(`SELECT toUnixTimestamp(toStartOfHour(time)) h,band,count() FROM wspr.rx WHERE time>now()-INTERVAL ${DAYS} DAY AND time<toStartOfHour(now()) AND band IN (${bands}) AND ${g}<${NEAR*1000} GROUP BY h,band`)]);
    const C=new Set(cov.filter(r=>+r[2]>=3).map(r=>r[0]+"|"+r[1]));
    const ts=TG().filter(t=>t.lat!=null);const near={};const Q=PRM();
    /* previsión mensual sin correcciones del día: se apagan solo durante este cálculo, que no espera a nada */
    const keep={ionoK,stormK,auroraDb,geoK};const MC=new Map();const rows=[];
    try{ionoK=()=>1;stormK=()=>1;auroraDb=()=>0;geoK=()=>({k:1,ds:0});
      for(const r of ev){const h=+r[0],wb=+r[1];if(!C.has(r[0]+"|"+r[1]))continue;const b=WB[wb];if(b==null)continue;
        const fl=r[2];const t=near[fl]||(near[fl]=nearestT(+r[3],+r[4],ts));if(!t)continue;
        const lh=(new Date(h*1000).getUTCHours()+1)%24,k=t.id+"|"+lh+"|"+b;
        let M=MC.get(k);if(M===undefined){try{M=marg(t,lh,b,false,true)}catch(_){M=null}MC.set(k,M)}if(!M)continue;
        const pw=+r[5];const d=(isFinite(pw)?pw:30)-50-Q.opw;
        const p=rel(M.m+d+Q.cal,M.DL,M.DU,THR);rows.push({b,p:Math.max(0,Math.min(1,p)),o:+r[6]>0?1:0})}}
    finally{ionoK=keep.ionoK;stormK=keep.stormK;auroraDb=keep.auroraDb;geoK=keep.geoK;try{CACHE.clear()}catch(_){}}
    return score(rows)}
  function score(rows){const n=rows.length;if(!n)return {n:0,at:Date.now()};
    const byB={};rows.forEach(r=>{(byB[r.b]=byB[r.b]||[]).push(r)});
    const clim={};for(const b in byB)clim[b]=byB[b].reduce((s,r)=>s+r.o,0)/byB[b].length;
    let bm=0,bc=0;rows.forEach(r=>{bm+=(r.p-r.o)**2;bc+=(clim[r.b]-r.o)**2});bm/=n;bc/=n;
    const bins=[0,.1,.3,.5,.7,.9,1.0001].map((x,i,a)=>i<a.length-1?{lo:x,hi:a[i+1],n:0,p:0,o:0}:null).filter(Boolean);
    rows.forEach(r=>{const k=bins.find(x=>r.p>=x.lo&&r.p<x.hi);if(k){k.n++;k.p+=r.p;k.o+=r.o}});
    bins.forEach(k=>{if(k.n){k.p/=k.n;k.o/=k.n}});
    const band=Object.keys(byB).map(b=>({b:+b,n:byB[b].length,p:byB[b].reduce((s,r)=>s+r.p,0)/byB[b].length,o:clim[b]})).sort((x,y)=>MHZ[x.b]-MHZ[y.b]);
    return {n,bm,bc,bss:bc>0?1-bm/bc:null,base:rows.reduce((s,r)=>s+r.o,0)/n,bins,band,at:Date.now()}}
  function view(R){
    if(!R)return `<p>${T("Aún no se ha medido en este aparato.","Not measured on this device yet.")}</p>`;
    if(!R.n)return `<p>${T("No hubo datos suficientes: los receptores WSPR cercanos no escucharon o nadie lejano transmitió. Prueba más tarde.","There was not enough data: nearby WSPR receivers were not listening or nobody far away transmitted. Try later.")}</p>`;
    const pc=x=>Math.round(x*100)+" %";const few=R.n<300;
    const skill=R.bss==null?"—":R.bss>0?T(`mejor que la climatología en un ${pc(R.bss)}`,`better than climatology by ${pc(R.bss)}`):T(`peor que la climatología en un ${pc(-R.bss)}`,`worse than climatology by ${pc(-R.bss)}`);
    const when=new Date(R.at).toLocaleString(window.ACRACB_LANG==="en"?"en-US":"es-ES",{timeZone:"Europe/Madrid",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
    return `<p class="acc1"><b>${R.n}</b> ${T("casos de los últimos 3 días","cases from the last 3 days")} · ${T("puntuación de Brier","Brier score")} <b>${nf(R.bm,3)}</b> ${T("frente a","vs")} ${nf(R.bc,3)} ${T("de la climatología","for climatology")}: <b>${skill}</b>.${few?` <span class="acc-few">${T("Son pocos casos: tómalo como orientativo.","Few cases: take it as a rough guide.")}</span>`:""}</p>
    <div class="acct"><div class="acch"><span>${T("El modelo dijo","The model said")}</span><span>${T("media","average")}</span><span>${T("Se oyó","Heard")}</span><span>${T("casos","cases")}</span></div>
    ${R.bins.filter(k=>k.n).map(k=>`<div class="accr"><span>${pc(k.lo)}–${pc(Math.min(1,k.hi))}</span><span>${pc(k.p)}</span><b>${pc(k.o)}</b><span>${k.n}</span></div>`).join("")}</div>
    <p class="note">${T("Si la previsión está bien calibrada, «Se oyó» se parece a «media» en cada fila.","If the forecast is well calibrated, «Heard» is close to «average» in each row.")}</p>
    <div class="acct"><div class="acch"><span>${T("Banda","Band")}</span><span>${T("previsto","forecast")}</span><span>${T("Se oyó","Heard")}</span><span>${T("casos","cases")}</span></div>
    ${R.band.map(x=>`<div class="accr"><span>${BANDS[x.b]}</span><span>${pc(x.p)}</span><b>${pc(x.o)}</b><span>${x.n}</span></div>`).join("")}</div>
    <p class="note">${T(`Medido el ${when}.`,`Measured on ${when}.`)}</p>`}
  function load(){try{return JSON.parse(localStorage.getItem(CK)||"null")}catch(_){return null}}
  function save(R){try{localStorage.setItem(CK,JSON.stringify(R))}catch(_){}}
  function mount(){const box=document.getElementById("accbox");if(!box||box.__m)return;box.__m=1;
    const res=box.querySelector(".accres"),btn=box.querySelector(".accbtn");res.innerHTML=view(load());
    btn.onclick=async()=>{btn.disabled=true;const tx=btn.textContent;btn.textContent=T("Midiendo… puede tardar un minuto","Measuring… it may take a minute");
      try{const R=await run();save(R);res.innerHTML=view(R)}catch(e){res.innerHTML=`<p>${T("WSPR.live no respondió","WSPR.live did not respond")} (${String(e&&e.name==="AbortError"?T("tiempo agotado","timed out"):e&&e.message||e)}). ${T("Prueba más tarde.","Try later.")}</p>`}
      finally{btn.disabled=false;btn.textContent=tx}}}
  window.ACRACB_calibScore=score;
  let n=0;(function go(){mount();if(!document.getElementById("accbox")||!document.getElementById("accbox").__m){if(++n<120)setTimeout(go,500)}})();
})();
