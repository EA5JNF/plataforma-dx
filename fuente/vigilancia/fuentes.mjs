// Comprueba una vez por semana que las fuentes gratuitas de la plataforma siguen respondiendo con datos.
// Si alguna falla, el flujo abre (o actualiza) un aviso en GitHub y GitHub manda un correo al propietario.
const d=new Date(),day=x=>x.toISOString().slice(0,10),ago=h=>new Date(Date.now()-h*36e5);
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
 ["SILSO EISN","https://www.sidc.be/SILSO/DATA/EISN/EISN_current.txt"],
 ["NASA DONKI",`https://api.nasa.gov/DONKI/WSAEnlilSimulations?startDate=${day(ago(168))}&endDate=${day(d)}&api_key=DEMO_KEY`],
 ["WSPR.live","https://db1.wspr.live/?query="+encodeURIComponent(wspr)],
 ["Spothole avisos","https://spothole.app/api/v1/alerts"],
 ["Spothole","https://spothole.app/api/v1/spots?max_age=3600"],
 ["HamQTH","https://www.hamqth.com/dxc_csv.php?limit=50"],
 ["GFZ Hp30",`https://kp.gfz.de/app/json/?start=${ago(6).toISOString().slice(0,19)}Z&end=${d.toISOString().slice(0,19)}Z&index=Hp30`],
 ["NOAA D-RAP","https://services.swpc.noaa.gov/text/drap_global_frequencies.txt"],
 ["NOAA avisos","https://services.swpc.noaa.gov/products/alerts.json"],
 ["NOAA regiones","https://services.swpc.noaa.gov/json/solar_regions.json"],
 ["NOAA protones","https://services.swpc.noaa.gov/json/goes/primary/integral-protons-6-hour.json"],
 ["HamQTH RBN","https://www.hamqth.com/rbn_data.php?data=1&age=600"],
 ["NASA SDO","https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg"],
 ["SOHO LASCO","https://soho.nascom.nasa.gov/data/realtime/c3/512/latest.jpg"],
 ["Open-Meteo","https://api.open-meteo.com/v1/forecast?latitude=38.6&longitude=-0.7&hourly=weather_code&forecast_hours=3"],
 ["SatNOGS DB","https://db.satnogs.org/api/satellites/?format=json&norad_cat_id=25544"],
 ["CelesTrak satélites","https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle"],
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
