// Inyecta cargas maliciosas en todas las fuentes externas y recorre la plataforma buscando código ejecutado.
const {chromium}=require("playwright");const URL=process.argv[2]||"http://localhost:8768/index.html";
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900},bypassCSP:process.argv[3]!=="csp"});const p=await ctx.newPage();
const hits=[];await p.exposeFunction("__x",k=>hits.push(k));const errs=[];p.on("pageerror",e=>errs.push(e.message));
const now=Date.now(),iso=t=>new Date(t).toISOString(),H={"Access-Control-Allow-Origin":"*","Content-Type":"application/json"};
const P=k=>`Z<img src=x onerror=__x("${k}")>"'><svg/onload=__x("${k}s")><a href="javascript:__x('${k}j')">j</a>`;
await p.route(/^https?:\/\/(?!localhost)/,r=>{const u=r.request().url();const J=o=>r.fulfill({status:200,headers:H,body:JSON.stringify(o)});
 if(u.includes("spothole.app/api/v1/spots"))return J([{dx_call:"C8K",de_call:"DL1AB",freq:14025,mode:P("shmode"),comment:"UP 2 "+P("shc"),time_iso:iso(now-2*6e4),source:"Cluster",sig:"POTA",sig_refs:[P("shref")],dx_latitude:-25,dx_longitude:32},{dx_call:"VP8"+P("call"),de_call:"G3"+P("by"),freq:21025,comment:P("c2"),time_iso:iso(now-3*6e4),source:"Cluster"}]);
 if(u.includes("spothole.app/api/v1/alerts"))return J([{sig:"DX",dx_call:"3Y0K",start_time:iso(now-864e5),end_time:iso(now+864e5),comment:P("alc"),dx_name:P("aln")}]);
 if(u.includes("api.pota.app"))return J([{activator:"K4"+P("pc"),frequency:"14062",mode:P("pm"),spotTime:iso(now-5*6e4).slice(0,19),spotter:P("ps"),comments:P("pcm"),reference:"US-1234"+P("pr"),latitude:35,longitude:-83}]);
 if(u.includes("api2.sota.org.uk"))return J([{activatorCallsign:"F4SOT/P",frequency:"10.118",mode:"cw",timeStamp:iso(now-6*6e4),callsign:P("ss"),comments:P("sc"),associationCode:P("sa"),summitCode:"AM-001"}]);
 if(u.includes("spots.wwff.co"))return J([{activator:"IK2WWF",frequency_khz:14244,mode:"SSB",spot_time:Math.round((now-4*6e4)/1000),spotter:"IK2Y",remarks:P("wr"),reference:"IFF-0123"+P("wref"),latitude:45,longitude:9}]);
 if(u.startsWith("https://acracb-dx")&&u.includes("dxsummit"))return J([{dx_call:"C8K",de_call:"K1TTT",frequency:7056,info:P("dsi"),time:iso(now-3*6e4)}]);
 if(u.startsWith("https://acracb-dx")&&u.includes("ng3k"))return r.fulfill({status:200,headers:{"Access-Control-Allow-Origin":"*"},body:`<table><tr><td>2026 Nov 01</td><td>2026 Dec 30</td><td>Mozambique</td><td>C8K</td><td>QSL via M0OXO ${P("nq").replace(/</g,"&lt;")}</td><td>${P("ni")} By team; 160-10m CW SSB</td></tr></table>`});
 if(u.includes("hamqth.com/dxc_csv"))return r.fulfill({status:200,headers:{"Access-Control-Allow-Origin":"*"},body:`OH2BH^14250.0^C8K^${P("hq")}^2026-11-12 22:00\n`});
 r.abort()});
const SEEN=new Set(),RAW=new Set();const snap=async()=>{const r=await p.evaluate(()=>{const h=document.body.innerHTML;const keys=[...h.matchAll(/__x\((?:&quot;|")(\w+)/g)].map(m=>m[1]);const bad=[...document.querySelectorAll("img[onerror],svg[onload],[onload],[onerror],a[href^='javascript:']")].map(e=>e.outerHTML.slice(0,120));return {keys,bad}});r.keys.forEach(k=>SEEN.add(k));r.bad.forEach(k=>RAW.add(k))};
await p.goto(URL);await p.waitForTimeout(2500);
await p.evaluate(()=>ACRACB_update(false));await p.waitForTimeout(4000);
// recorrer páginas, pestañas, popups, filtros
await p.evaluate(()=>{st.cms=Object.keys(MODES);st.cmsBase=MOD();CACHE.clear();refresh()});const pages=await p.evaluate(()=>PAGES);
for(const pg of pages){await p.evaluate(g=>go(g),pg);await p.waitForTimeout(300);
  const tabs=await p.evaluate(g=>[...document.querySelectorAll(`.page[data-pg="${g}"] details[data-tab]`)].map(d=>d.id),pg);
  for(const t of tabs){await p.evaluate(([g,t])=>{try{selTab(g,t,true)}catch(e){}const d=document.getElementById(t);if(d)d.open=true},[pg,t]);await p.waitForTimeout(150);await snap()}}
await p.evaluate(()=>{go("dx");selTab("dx","f_cl",true)});for(const k of ["POTA","SOTA","WWFF","dx"]){await p.click(`[data-clt="${k}"]`).catch(()=>{});await p.waitForTimeout(150);await snap()}
await p.evaluate(()=>{selTab("dx","f_dxp",true)});await p.waitForTimeout(200);
await p.evaluate(()=>{go("mapa");["spots","dxp","bcn","voa"].forEach(k=>{const b=document.querySelector(`[data-sw="${k}"],[data-ly="${k}"]`);if(b&&b.getAttribute("aria-pressed")!=="true")b.click()})});await p.waitForTimeout(800);
await p.evaluate(()=>{for(let i=0;i<(SPOTS().length);i++)try{openPop({k:"s",i})}catch(e){}for(let i=0;i<L.dx.length;i++)try{openPop({k:"d",i})}catch(e){}});await p.waitForTimeout(300);
// abrir fichas de indicativos
await snap();await p.evaluate(()=>{try{openCall("C8K")}catch(e){}});await p.waitForTimeout(800);await snap();console.log("CLAVES:",[...SEEN].join(","));console.log("ELEMENTOS PELIGROSOS:",[...RAW]);
const html=await p.evaluate(()=>document.body.innerHTML);console.log("en L:",await p.evaluate(()=>{const o=[];const walk=(v,path)=>{if(typeof v==="string"){if(/onerror|onload|javascript:/.test(v))o.push(path+" = "+v.slice(0,60))}else if(v&&typeof v==="object")for(const k in v)walk(v[k],path+"."+k)};walk(L,"L");return o}));
const raw=(html.match(/<img src="?x"? onerror|<svg\/?onload|href="javascript:/gi)||[]).length;
const ctxs=[...html.matchAll(/<img src="?x"? onerror|<svg\/?onload|href="javascript:/gi)].map(m=>html.slice(Math.max(0,m.index-300),m.index+80));console.log(ctxs.join("\n----\n"));const esc=(html.match(/Z&lt;img/g)||[]).length;const keys=[...html.matchAll(/__x\((?:&quot;|")(\w+)/g)].map(m=>m[1]);console.log("escapadas:",esc,"claves vistas:",[...new Set(keys)].join(","));console.log("ejecutado:",JSON.stringify([...new Set(hits)]),"etiquetas sin escapar en el DOM:",raw,[...RAW],"errores:",errs.slice(0,5));
await b.close()})()
