const {chromium}=require("playwright");(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on("pageerror",e=>errs.push(e.message));
const now=Date.now();const iso=t=>new Date(t).toISOString();
const H={"Access-Control-Allow-Origin":"*","Content-Type":"application/json"};
await p.route(/^https?:/,r=>{const u=r.request().url();
 if(u.includes("spothole.app/api/v1/spots")&&u.includes("dx_call"))return r.fulfill({status:200,headers:H,body:JSON.stringify([{dx_call:"EA5JNF",de_call:"DL8LAS-#",freq:14025.1,mode:"CW",comment:"18 dB 24 WPM CQ",time_iso:iso(now-4*6e4),source:"RBN",de_latitude:49.4,de_longitude:11.1},{dx_call:"EA5JNF",de_call:"W3LPL-#",freq:14025.1,mode:"CW",comment:"7 dB 24 WPM CQ",time_iso:iso(now-3*6e4),source:"RBN",de_latitude:39.2,de_longitude:-76.6},{dx_call:"K1ABC",de_call:"X",freq:7000}])});
 if(u.includes("hamqth.com/dxc_csv"))return r.fulfill({status:200,headers:{"Access-Control-Allow-Origin":"*"},body:"OH2BH^14250.0^EA5JNF^59 en Finlandia^2026-11-12 15:05\nK1ABC^7000^ZZ1ZZ^x^2026-11-12 15:00\n"});
 if(u.includes("wspr.live")&&u.includes("tx_sign"))return r.fulfill({status:200,headers:H,body:JSON.stringify({data:[{t:Math.round(now/1000)-600,rx_sign:"VK2XYZ",rx_loc:"QF56",rx_lat:-33.9,rx_lon:151.2,frequency:14097100,snr:-24,distance:17690}]})});
 if(u.startsWith("https://acracb-dx")&&u.includes("pskreporter"))return r.fulfill({status:200,headers:{"Access-Control-Allow-Origin":"*"},body:`<receptionReports><receptionReport receiverCallsign="JA1ABC" receiverLocator="PM95" senderCallsign="EA5JNF" frequency="14075500" flowStartSeconds="${Math.round(now/1000)-300}" mode="FT8" sNR="-12" /></receptionReports>`});
 r.abort()});
await p.goto("file://"+process.cwd()+"/../web/out/index.html");await p.waitForTimeout(3000);
// spots with split / QSL comments
await p.evaluate(()=>{(L.spots||[]).forEach(x=>{if(x.call==="C8K")x.c="UP 5 QSL OQRS LOTW";if(x.call==="HF0PAS")x.c="POTA EA-1234";});L.alert={at:new Date().toISOString(),items:[{call:"3X4U",f:"21.025",band:5,mode:"SSB",t:"14:00",c:"up 2-5 QSL via M0OXO",need:"DXpedición"}]};renderAlerts();refresh()});
await p.waitForTimeout(500);
console.log("tags clúster:",await p.evaluate(()=>[...document.querySelectorAll("#spots .xtag")].map(x=>x.textContent)));
console.log("tags aviso:",await p.evaluate(()=>[...document.querySelectorAll("#albar .xtag")].map(x=>x.textContent)));
await p.locator("#albar").screenshot({path:"v_albar.png"});
await p.evaluate(()=>{go("dx");selTab("dx","f_cl",true)});await p.waitForTimeout(300);await p.locator("#f_cl").screenshot({path:"v_cl.png"});
await p.click('[data-clt="POTA"]');await p.waitForTimeout(300);console.log("POTA filtro:",await p.evaluate(()=>document.querySelectorAll("#spots .sp").length));await p.locator("#f_cl").screenshot({path:"v_clpota.png"});await p.click('[data-clt="dx"]');
// heard
await p.evaluate(()=>selTab("dx","f_heard",true));await p.waitForTimeout(300);await p.fill("#hcall","ea5jnf");await p.click("#hgo");await p.waitForTimeout(1500);console.log("fuentes:",await p.evaluate(()=>[...document.querySelectorAll("#hres .sp .w")].map(x=>x.textContent).join(" | ")));
console.log(await p.$eval("#hst",e=>e.textContent));await p.locator("#f_heard").screenshot({path:"v_heard.png"});
// QRP + contests + vhf
await p.evaluate(()=>{go("fichas");selTab("fichas","f_qrp",true)});await p.waitForTimeout(300);await p.locator("#f_qrp").screenshot({path:"v_qrp.png"});
await p.evaluate(()=>go("concursos"));await p.waitForTimeout(300);console.log("intercambios:",await p.evaluate(()=>document.querySelectorAll(".xch").length));
await p.evaluate(()=>{go("ahora");selTab("ahora","f_vhf",true)});await p.waitForTimeout(300);console.log(await p.$eval("#metnote",e=>e.textContent.slice(0,120)));
await p.evaluate(()=>{go("dx");selTab("dx","f_al",true)});await p.waitForTimeout(300);await p.locator("#f_al").screenshot({path:"v_al.png"});
console.log("errores",errs);await b.close()})()
