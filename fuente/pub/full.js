const {chromium}=require("playwright");const fs=require("fs");(async()=>{const b=await chromium.launch();
const DEV=[["m360",360,740,2,1],["m390",390,844,3,1],["tabV",820,1180,2,1],["tabH",1180,820,2,1],["lap",1366,768,1,0],["desk",1920,1080,1,0],["2k",2560,1440,1,0],["tv720",1280,720,1,0],["tv4k",3840,2160,1,0]];
const ZS=(process.argv[2]||"1,1.25,1.5,1.75,2").split(",").map(Number);const ONLY=process.argv[3]||"";const LANG=process.argv[4]||"index";
const report=[];
for(const [nm,w,h,dpr,mob] of DEV){if(ONLY&&!ONLY.split(",").includes(nm))continue;for(const z of ZS){
 const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,isMobile:!!mob,hasTouch:!!mob});
 await c.addInitScript(z=>{try{localStorage.setItem("acracb_zoom",String(z));localStorage.setItem("acracb_tour","1")}catch(e){}},z);const p=await c.newPage();const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());await p.goto(`http://localhost:8768/${LANG}.html`);await p.waitForTimeout(4000);
 const r=await p.evaluate(async()=>{const raf=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const out=[];
  const scrollAnc=e=>{for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const s=getComputedStyle(a);if(s.overflowX!=="visible"||a.classList.contains("hscr"))return true}return false};
  const pages=[...document.querySelectorAll("section.page[data-pg]")].map(s=>s.dataset.pg);
  for(const pg of pages){go(pg);await raf();const sec=document.querySelector(`section.page[data-pg="${pg}"]`);const tabs=[...sec.querySelectorAll("details.fold[data-tab]")].map(d=>d.id);
   for(const t of (tabs.length?tabs:[null])){if(t){try{selTab(pg,t,true)}catch(e){}const d=document.getElementById(t);if(d)d.open=true}await raf();await new Promise(r=>setTimeout(r,60));
    const de=document.documentElement,W=de.clientWidth;const issues=[];
    if(de.scrollWidth>W+1)issues.push("PAGE+"+(de.scrollWidth-W));
    const vis=[...document.querySelectorAll("header *, .nav *, section.page:not([hidden]) *")].filter(e=>e.offsetParent!==null&&!e.closest("svg"));
    for(const e of vis){const r=e.getBoundingClientRect();if(r.width&&r.right>W+1&&!scrollAnc(e)){issues.push("OUT "+e.tagName+"."+String(e.className).split(" ")[0]+(e.id?"#"+e.id:"")+" +"+Math.round(r.right-W));if(issues.length>6)break}}
    for(const e of vis){if(!e.childNodes.length)continue;const s=getComputedStyle(e);if((s.overflowX==="hidden"||s.overflow==="hidden")&&s.textOverflow!=="ellipsis"&&e.scrollWidth>e.clientWidth+2&&!e.classList.contains("hscr")&&e.tagName!=="DETAILS"&&!e.querySelector("svg,canvas")){const tx=(e.textContent||"").trim();if(tx)issues.push("CLIP "+e.tagName+"."+String(e.className).split(" ")[0]+(e.id?"#"+e.id:"")+" «"+tx.slice(0,25)+"»")}}
    if(issues.length)out.push(pg+(t?"/"+t:"")+": "+[...new Set(issues)].slice(0,6).join(" | "))}}
  return out});
 report.push(`${nm} ${z}: ${r.length?"\n  "+r.join("\n  "):"OK"}${errs.length?" ERR "+errs.slice(0,2).join(";"):""}`);console.log(report[report.length-1]);await c.close()}}
fs.writeFileSync(`/tmp/claude-0/-home-claude/c42bec04-2b15-5db9-9b12-5aaee8490765/scratchpad/full_${LANG}${process.argv[5]||""}.txt`,report.join("\n"));await b.close()})();
