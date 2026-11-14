const {chromium}=require("playwright");(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});
await c.addInitScript(()=>{localStorage.setItem("acracb_almodes",JSON.stringify(["SSB"]));localStorage.setItem("acracb_albands","[]");localStorage.setItem("acracb_tour","1")});
const p=await c.newPage();const errs=[];p.on("pageerror",e=>errs.push(e.message));await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());await p.goto("http://localhost:8768/index.html");await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{try{sessionStorage.removeItem("aloff")}catch(e){}L.alert={at:new Date().toISOString(),items:[{call:"5R8IC",mode:"FT8",f:24915,band:6,t:"12:00",need:"DXpedición"},{call:"C8K",mode:"FT8",f:14074,band:3,t:"12:01",need:"DXpedición"},{call:"3X4U",mode:"SSB",f:21295,band:5,t:"12:02",need:"DXpedición"},{call:"VP8A",mode:"CW",f:14023,band:3,t:"12:03",need:"entidad"}]};
  renderAlerts();go("ahora");if(window.renderAlBar)renderAlBar();const bar=document.getElementById("albar");const fil=L.alert.items.filter(x=>ACRACB_alOK(x)).map(x=>x.call);
  go("dx");try{foldSums()}catch(e){}const sum=[...document.querySelectorAll("[id^=s_al],#f_al summary")].map(e=>e.id+":"+e.textContent.trim().slice(0,80)).join(" | ");
  return {filtro:fil,aviso:bar.hidden?"oculto":[...bar.querySelectorAll(".sc-call .cs")].map(e=>e.dataset.call),resumen:sum,lista:[...document.querySelectorAll("#alerts .alc .sc .sc-call .cs")].map(e=>e.dataset.call)}});
console.log(JSON.stringify(r),errs);await b.close()})()
