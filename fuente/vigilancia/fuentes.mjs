// Comprueba una vez por semana que las fuentes gratuitas de la plataforma siguen respondiendo con datos.
// Si alguna falla, el flujo abre (o actualiza) un aviso en GitHub y GitHub manda un correo al propietario.
const d=new Date(),day=x=>x.toISOString().slice(0,10),ago=h=>new Date(Date.now()-h*36e5);
const giro=x=>x.toISOString().slice(0,19).replace("T","+").replace(/-/g,"/");
const wspr="SELECT band,count() FROM wspr.rx WHERE time>now()-3600 GROUP BY band FORMAT TSV";
const S=[
 ["NOAA WWV","https://services.swpc.noaa.gov/text/wwv.txt"],
 ["NOAA flujo","https://services.swpc.noaa.gov/json/f107_cm_flux.json"],
 ["NOAA Kp","https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"],
 ["NOAA viento","https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json"],
 ["NOAA campo magnético","https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json"],
 ["NOAA densidad","https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json"],
 ["NOAA rayos X","https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json"],
 ["NOAA escalas","https://services.swpc.noaa.gov/products/noaa-scales.json"],
 ["NOAA 3 días","https://services.swpc.noaa.gov/text/3-day-forecast.txt"],
 ["NOAA 27 días","https://services.swpc.noaa.gov/text/27-day-outlook.txt"],
 ["NOAA aurora","https://services.swpc.noaa.gov/json/ovation_aurora_latest.json"],
 ["NOAA manchas","https://services.swpc.noaa.gov/json/solar-cycle/swpc_observed_ssn.json"],
 ["NOAA ciclo previsto","https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json"],
 ["NOAA ciclo observado","https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json"],
 ["GFZ Potsdam",`https://kp.gfz.de/app/json/?start=${day(ago(24))}T00:00:00Z&end=${day(d)}T23:59:59Z&index=Kp`],
 ["HamQSL","https://www.hamqsl.com/solarxml.php"],
 ["DRAO Penticton","https://www.spaceweather.gc.ca/solar_flux_data/daily_flux_values/fluxtable.txt"],
 ["SILSO EISN","https://www.sidc.be/SILSO/DATA/EISN/EISN_current.txt"],
 ["SILSO ciclo","https://www.sidc.be/SILSO/DATA/SN_ms_tot_V2.0.txt"],
 ["NASA DONKI",`https://api.nasa.gov/DONKI/WSAEnlilSimulations?startDate=${day(ago(168))}&endDate=${day(d)}&api_key=DEMO_KEY`],
 ["KC2G ionosondas","https://prop.kc2g.com/api/stations.json"],
 ["KC2G eSSN","https://prop.kc2g.com/api/essn.json"],
 ["GIRO ionosondas",`https://lgdc.uml.edu/common/DIDBGetValues?ursiCode=EB040&charName=foF2&DMUF=3000&fromDate=${giro(ago(6))}&toDate=${giro(d)}`],
 ["WSPR.live","https://db1.wspr.live/?query="+encodeURIComponent(wspr)],
 ["NG3K","https://www.ng3k.com/misc/adxo.html"],
 ["Club Log","https://clublog.org/mostwanted.php?api=1"],
 ["Spothole avisos","https://spothole.app/api/v1/alerts"],
 ["Spothole","https://spothole.app/api/v1/spots?max_age=3600"],
 ["DXSummit","https://www.dxsummit.fi/api/v1/spots?limit=50"],
 ["HamQTH","https://www.hamqth.com/dxc_csv.php?limit=50"],
 ["POTA","https://api.pota.app/spot/activator"],
 ["WWFF","https://spots.wwff.co/static/spots.json"],
 ["SOTA","https://api2.sota.org.uk/api/spots/60/all"],
 ["CelesTrak satélites","https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle"],
 ["AMSAT satélites","https://www.amsat.org/tle/current/nasabare.txt"],
 ["VOACAP (Cloudflare)","https://acracb-voacap.pages.dev/hubs/v3/IM98/idx.json"],
 ["VOACAP respaldo (Cloudflare)","https://acracb-voacap-respaldo.pages.dev/hubs/v3/IM98/idx.json"]];
async function one([n,u]){for(let i=0;i<2;i++){const c=new AbortController(),t=setTimeout(()=>c.abort(),25000);
  try{const r=await fetch(u,{signal:c.signal,headers:{"user-agent":"ACRACB-Plataforma-DX (comprobacion semanal)"}});const b=await r.text();clearTimeout(t);
    if(r.ok&&b.trim().length>20)return {n,ok:true,code:r.status,len:b.length};if(i)return {n,ok:false,code:r.status,why:r.ok?"responde sin datos":"error "+r.status}}
  catch(e){clearTimeout(t);if(i)return {n,ok:false,why:e.name==="AbortError"?"no responde":"conexión rechazada"}}
  await new Promise(r=>setTimeout(r,5000))}}
const res=await Promise.all(S.map(one));const bad=res.filter(r=>!r.ok);
const fs=await import("node:fs");
const body=`Comprobación del ${day(d)}: ${res.length-bad.length} de ${res.length} fuentes responden.\n\n`+
 (bad.length?"**Fallan:**\n\n"+bad.map(b=>`- ${b.n}: ${b.why}`).join("\n")+"\n\nSi una fuente falla dos semanas seguidas, probablemente ha cambiado de dirección o de formato y hay que revisarla en `fuente/web/updater.js`.\n\nAlgunas fuentes bloquean los servidores de GitHub aunque funcionan bien desde los navegadores; en ese caso la plataforma sigue funcionando (mira «Fuentes de esta actualización» en la web).":"Todas responden.");
fs.writeFileSync("informe.md",body);fs.writeFileSync("estado.txt",bad.length?"fallo":"ok");
console.log(body);
