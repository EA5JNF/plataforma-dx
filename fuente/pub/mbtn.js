const {chromium}=require("playwright");(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1366,height:1000}});await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());await p.goto("http://localhost:8768/index.html");await p.waitForTimeout(3500);
await p.evaluate(()=>{go("mapa")});await p.waitForTimeout(1500);
const cdp=await p.context().newCDPSession(p);await cdp.send("Emulation.setCPUThrottlingRate",{rate:6});
const names=["Nombres","Noche","Predicción VOA","Clúster","ISS","Satélites","AM","CW","20 m","40 m","Largo","Ambos","Todos","Saltos","+"];
for(const n of names){const t=await p.evaluate(n=>new Promise(r=>{const e=[...document.querySelectorAll("button")].find(x=>x.getClientRects().length&&x.textContent.trim().startsWith(n));if(!e)return r(-1);const t0=performance.now();e.click();const t1=performance.now();requestAnimationFrame(()=>setTimeout(()=>r(Math.round(t1-t0)+"/"+Math.round(performance.now()-t0)),0))}),n);console.log(n,t)}
await b.close()})()
