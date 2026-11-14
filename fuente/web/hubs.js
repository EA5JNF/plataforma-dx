/* ---- ACRACB 2.0: VOACAP para cualquier QTH del mundo ----
   La previsión VOACAP está calculada de antemano desde 132 zonas del mundo (voacapl 16.1207W, mismos ajustes que la de Alicante).
   Se usa la zona más cercana al locator y solo se descarga lo necesario: el mes, los dos niveles de actividad solar que rodean al de hoy
   y los ángulos de salida. Cada trozo pesa 70–110 kB y queda guardado en el dispositivo. */
/* Descompresor LZMA («.lzma», formato clásico de 13 bytes de cabecera), según la especificación de Igor Pavlov
   (LzmaSpec). Sin dependencias ni WebAssembly. Devuelve un Uint8Array; si el archivo está dañado lanza un error. */
function unlzma(src,maxOut){"use strict";
  if(!(src instanceof Uint8Array)||src.length<13)throw new Error("lzma: corto");
  let ip=13;const pb0=src[0];if(pb0>=225)throw new Error("lzma: props");
  const lc=pb0%9,lp=((pb0/9)|0)%5,pb=(pb0/45)|0;
  let dict=(src[1]|src[2]<<8|src[3]<<16|src[4]<<24)>>>0;if(dict<4096)dict=4096;
  let lo=(src[5]|src[6]<<8|src[7]<<16|src[8]<<24)>>>0,hi=(src[9]|src[10]<<8|src[11]<<16|src[12]<<24)>>>0;
  const known=!(lo===0xffffffff&&hi===0xffffffff);if(known&&hi!==0)throw new Error("lzma: tamaño");
  const outLen=known?lo:0;if(maxOut&&outLen>maxOut)throw new Error("lzma: tamaño");
  let out=new Uint8Array(known?outLen:Math.max(1<<16,src.length*4)),op=0;
  /* decodificador de rango */
  let range=0xffffffff,code=0;if(src[ip++]!==0)throw new Error("lzma: rc");
  for(let i=0;i<4;i++)code=((code<<8)|src[ip++])>>>0;
  const nb=()=>ip<src.length?src[ip++]:0;
  function bit(p,i){let v=p[i],b=(range>>>11)*v>>>0;let r;
    if(code<b){range=b;p[i]=v+((2048-v)>>>5);r=0}else{range=(range-b)>>>0;code=(code-b)>>>0;p[i]=v-(v>>>5);r=1}
    if(range<0x1000000){range=(range<<8)>>>0;code=((code<<8)|nb())>>>0}return r}
  function direct(n){let r=0;for(;n>0;n--){range>>>=1;let t=(code-range)>>>0;let neg=code<range?1:0;code=neg?code:t;r=(r<<1)+(1-neg);
      if(range<0x1000000){range=(range<<8)>>>0;code=((code<<8)|nb())>>>0}}return r>>>0}
  const P=n=>new Uint16Array(n).fill(1024);
  function tree(p,o,n){let m=1;for(let i=0;i<n;i++)m=(m<<1)+bit(p,o+m);return m-(1<<n)}
  function rtree(p,o,n){let m=1,s=0;for(let i=0;i<n;i++){const b=bit(p,o+m);m=(m<<1)+b;s|=b<<i}return s}
  function LenDec(){return {c:P(2),low:P(16<<3),mid:P(16<<3),high:P(256)}}
  function len(L,ps){if(!bit(L.c,0))return tree(L.low,ps<<3,3);if(!bit(L.c,1))return 8+tree(L.mid,ps<<3,3);return 16+tree(L.high,0,8)}
  const lit=P(0x300<<(lc+lp)),posSlot=P(4<<6),posDec=P(115),align=P(16);
  const isMatch=P(12<<4),isRep=P(12),isRepG0=P(12),isRepG1=P(12),isRepG2=P(12),isRep0Long=P(12<<4);
  const LD=LenDec(),RD=LenDec();
  let state=0,rep0=0,rep1=0,rep2=0,rep3=0;const pbm=(1<<pb)-1,lpm=(1<<lp)-1;
  function grow(){const n=new Uint8Array(out.length*2);n.set(out);out=n;if(maxOut&&out.length>maxOut*2)throw new Error("lzma: tamaño")}
  function put(b){if(op>=out.length){if(known)throw new Error("lzma: datos");grow()}out[op++]=b}
  while(!known||op<outLen){
    const ps=op&pbm;
    if(!bit(isMatch,(state<<4)+ps)){
      const prev=op>0?out[op-1]:0;const base=0x300*(((op&lpm)<<lc)+(prev>>(8-lc)));let s=1;
      if(state>=7){let mb=out[op-rep0-1];do{const m=(mb>>7)&1;mb<<=1;const b=bit(lit,base+((1+m)<<8)+s);s=(s<<1)|b;if(m!==b)break}while(s<0x100)}
      while(s<0x100)s=(s<<1)|bit(lit,base+s);
      put(s&255);state=state<4?0:state<10?state-3:state-6;continue}
    let L;
    if(bit(isRep,state)){
      if(op===0)throw new Error("lzma: datos");
      if(!bit(isRepG0,state)){if(!bit(isRep0Long,(state<<4)+ps)){state=state<7?9:11;put(out[op-rep0-1]);continue}}
      else{let d;if(!bit(isRepG1,state)){d=rep1}else{if(!bit(isRepG2,state)){d=rep2}else{d=rep3;rep3=rep2}rep2=rep1}rep1=rep0;rep0=d}
      L=len(RD,ps);state=state<7?8:11}
    else{
      rep3=rep2;rep2=rep1;rep1=rep0;L=len(LD,ps);state=state<7?7:10;
      const ls=L<3?L:3;const slot=tree(posSlot,ls<<6,6);
      if(slot<4)rep0=slot;else{const nd=(slot>>1)-1;let d=((2|(slot&1))<<nd)>>>0;
        if(slot<14)d=(d+rtree(posDec,d-slot,nd))>>>0;else{d=(d+(direct(nd-4)<<4))>>>0;d=(d+rtree(align,0,4))>>>0}
        if(d===0xffffffff){if(known&&op!==outLen)throw new Error("lzma: fin");break}rep0=d}}
    L+=2;if(rep0>=op||rep0>=dict)throw new Error("lzma: distancia");
    if(known&&op+L>outLen)throw new Error("lzma: datos");
    for(;L>0;L--)put(out[op-rep0-1])}
  return known?out:out.subarray(0,op)}
window.ACRACB_HUBS=true;
var HUB=(function(){
"use strict";
const LIST=window.ACRACB_HUBLIST||[];
/* 2.4.0: las zonas están en Cloudflare Pages; si no responde, se prueba la copia de la propia web */
/* 2.5.0: principal y respaldo, los dos en Cloudflare Pages (proyectos acracb-voacap y acracb-voacap-respaldo) */
const BASES=["https://acracb-voacap.pages.dev/hubs/v3/","https://acracb-voacap-respaldo.pages.dev/hubs/v3/"];let BASE=BASES[0];
/* formato 3 (2.4.0): 6 niveles de manchas (20, 40, 60, 80, 100 y 140), comprimidos con LZMA.
   Los niveles 1 y 3 van enteros; 0 y 2 como diferencia con el 1, 4 con el 3 y 5 con el 4 (con su propia
   dispersión día a día). Los datos son exactos: idénticos a los calculados. El nivel 140 va al final de cada bloque, detrás de los ángulos,
   para que el resto de la plataforma siga leyendo los otros cinco donde siempre. */
const REF={0:1,2:1,4:3,5:4};
const NB=11,HSZ=1+NB*3,SSZ=24*HSZ,HOFF=5*SSZ,HOPSZ=24*NB*2;let BLK=HOFF+HOPSZ+SSZ,NS=6;
const lvOff=j=>j<5?j*SSZ:HOFF+HOPSZ+(j-5)*SSZ;
const EN=()=>window.ACRACB_LANG==="en";
let cur=null,idx=null,failT=0,gen=0,pend=new Set(),tmr=null,loading=0,wantK=false;
const R=Math.PI/180;
function dist(a,b){const p1=a[1]*R,p2=b[1]*R,dl=(b[0]-a[0])*R;return 6371*Math.acos(Math.max(-1,Math.min(1,Math.sin(p1)*Math.sin(p2)+Math.cos(p1)*Math.cos(p2)*Math.cos(dl))))}
function nearest(p){let best=null,bd=1e9;for(const h of LIST){const d=dist(p,[h.lon,h.lat]);if(d<bd){bd=d;best=h}}return [best,bd]}
const MAXB=4e6;/* ningún archivo de zona pasa de ~1 MB: lo que sea mayor se rechaza */
async function gz(url,want){const r=await fetch(url,{credentials:"omit"});if(!r.ok)throw new Error("HTTP "+r.status);const cl=+r.headers.get("content-length")||0;if(cl>MAXB)throw new Error("grande");
  const b=new Uint8Array(await r.arrayBuffer());if(b.length>MAXB)throw new Error("grande");const out=/\.lzma$/.test(url)?unlzma(b,want||MAXB):await gunz(b);if(want&&out.length!==want)throw new Error("tamaño");return out}
async function gunz(b){if(b[0]!==0x1f||b[1]!==0x8b)return b;/* el servidor ya lo descomprimió */
  try{if(typeof DecompressionStream!=="undefined"){const s=new Blob([b]).stream().pipeThrough(new DecompressionStream("gzip"));return new Uint8Array(await new Response(s).arrayBuffer())}}catch(e){}
  return fflate.gunzipSync(b)}
function kick(){if(tmr)return;tmr=setTimeout(()=>{tmr=null;if(loading>0){wantK=true;return}wantK=false;try{CACHE.clear();if(typeof refresh==="function")refresh()}catch(e){}},120)}
function status(){if(loading<=0&&wantK)kick();const e=document.getElementById("locw");if(!e)return;e.dataset.hub=loading>0?"1":"";if(loading>0)e.textContent=EN()?"Loading the VOACAP forecast for your area…":"Cargando la previsión VOACAP de tu zona…"}
function clearT(){try{for(const k in TCACHE)delete TCACHE[k]}catch(e){}try{for(const k in TFM)delete TFM[k]}catch(e){}}
async function switchTo(h){cur=h;idx=null;const g=++gen;for(const k in MF)delete MF[k];for(const k in MLOAD)delete MLOAD[k];
  try{BASEQ=[h.lon,h.lat]}catch(e){}loading++;status();
  try{let r=null,ok=null;for(const b of BASES){try{r=await fetch(b+h.id+"/idx.json",{credentials:"omit"});if(r.ok){ok=b;break}}catch(e){}}if(!ok)throw new Error("idx");BASE=ok;const j=await r.json();if(g!==gen)return;
    const ok6=Array.isArray(j.ssn)&&j.ssn.length===6&&j.ssn.every((x,i)=>Number.isFinite(x)&&(!i||x>j.ssn[i-1]))&&j.blk===HOFF+HOPSZ+SSZ;if(!ok6)throw new Error("idx");BLK=j.blk;
    const nm=(V.meta||[]).length,okA=a=>Array.isArray(a)&&a.length===nm&&a.every(x=>Number.isInteger(x)&&x>=-1&&x<j.n*BLK&&(x<0||x%BLK===0));
    if(!(Number.isInteger(j.n)&&j.n>0&&j.n<=4000&&okA(j.os)&&okA(j.ol)))throw new Error("idx");idx=j;try{V.ssn=j.ssn.slice()}catch(e){}
    (V.meta||[]).forEach((m,i)=>{m[10]=j.os[i];m[11]=j.ol[i]});clearT();
    const bn=blendNow();month(bn.mA);if(bn.w>0)month(bn.mB);pend.forEach(m=>month(m));pend.clear();prefetch(bn)}
  catch(e){failT=Date.now()}finally{loading--;status();kick()}}
function raw(D,k,n,mm){if(!D.rp[k])D.rp[k]=gz(`${BASE}${cur.id}/m${mm}s${k}.lzma`,n*24*(1+2*NB)).catch(e=>{D.rp[k]=null;throw e});return D.rp[k]}
/* un nivel completo: el suyo más el de referencia (MUF y señal), con la dispersión de la referencia */
function level(D,j,n,mm){if(D.lv[j])return D.lv[j];const r=REF[j];
  D.lv[j]=(r==null?raw(D,j,n,mm):Promise.all([raw(D,j,n,mm),level(D,r,n,mm)]).then(([d,b])=>{const o=new Uint8Array(b.length);for(let i=0;i<d.length;i++)o[i]=(d[i]+b[i])&255;o.set(b.subarray(d.length),d.length);return o})).catch(e=>{D.lv[j]=null;throw e});return D.lv[j]}
function month(m){if(!m)return;if(!idx){pend.add(m);return}if(MF[m])return MF[m];const u=new Uint8Array(idx.n*BLK);
  MF[m]={u,s:new Int8Array(u.buffer),rp:{},lv:{},have:[0,0,0,0,0,0],req:[0,0,0,0,0,0],fail:[0,0,0,0,0,0],hop:0,hreq:0,hfail:0,m,g:gen};return MF[m]}
function need(D,j){if(!D||!(j>=0&&j<NS)||D.have[j]||D.req[j]||!cur||!idx||Date.now()-D.fail[j]<20000)return;D.req[j]=1;const g=gen,n=idx.n,mm=String(D.m).padStart(2,"0");loading++;status();
  level(D,j,n,mm).then(buf=>{if(g!==gen)return;const u=D.u,P=n*24;
    for(let p=0;p<n;p++){const pb=p*BLK+lvOff(j);for(let h=0;h<24;h++){const o=pb+h*HSZ,q=p*24+h;u[o]=buf[q];
      for(let b=0;b<NB;b++){u[o+1+b*3]=buf[P+b*P+q];const k=buf[P*(1+NB)+b*P+q];u[o+2+b*3]=(k>>4)*2;u[o+3+b*3]=(k&15)*2}}}
    D.have[j]=1;kick()}).catch(()=>{D.req[j]=0;D.fail[j]=Date.now()}).finally(()=>{loading--;status()})}
/* pide de golpe todo lo que la primera pintura va a necesitar, en vez de descubrirlo refresco a refresco */
function lv(ssn){const g=V.ssn;if(!(ssn>=0))return [];let k=0;while(k<g.length-2&&ssn>g[k+1])k++;return [k,k+1]}
function prefetch(bn){try{const js=new Set();[()=>SSNNOW(),()=>ssnFrom(+document.getElementById("sfi").value)].forEach(f=>{try{lv(f()).forEach(j=>js.add(j))}catch(e){}});
  /* primero solo el mes en curso: la previsión sale antes; el mes vecino (para afinar según el día) llega después */
  const D=MF[bn.mA];if(!D)return;js.forEach(j=>need(D,j));needHop(D)}catch(e){}}
function needHop(D){if(!D||D.hop||D.hreq||!cur||!idx||Date.now()-D.hfail<20000)return;D.hreq=1;const g=gen,n=idx.n,mm=String(D.m).padStart(2,"0");loading++;status();
  gz(`${BASE}${cur.id}/m${mm}h.lzma`,2*NB*n*24).then(buf=>{if(g!==gen)return;const u=D.u,P=n*24;
    for(let k=0;k<2;k++)for(let b=0;b<NB;b++)for(let p=0;p<n;p++)for(let h=0;h<24;h++)u[p*BLK+HOFF+(h*NB+b)*2+k]=buf[(k*NB+b)*P+p*24+h];
    D.hop=1;kick()}).catch(()=>{D.hreq=0;D.hfail=Date.now()}).finally(()=>{loading--;status()})}
function hop(t,lp,h,b){const D=MF[blendNow().mA];if(!D||!idx)return [0,0];if(!D.hop){needHop(D);return [0,0]}const o=(lp?t.ol:t.os);if(o<0)return [0,0];const q=o+HOFF+(h*NB+b)*2;return [D.u[q],D.u[q+1]*4]}
/* se llama al empezar cada refresco: elige la zona y devuelve el aviso que se muestra bajo el locator */
function check(p){const [h,d]=nearest(p);if(h&&(!cur||h.id!==cur.id||(!idx&&!loading&&Date.now()-failT>20000)))switchTo(h);if(loading>0)return EN()?"Loading the VOACAP forecast for your area…":"Cargando la previsión VOACAP de tu zona…";
  if(!h)return "";if(!idx)return EN()?"The VOACAP forecast for your area could not be downloaded. It will try again in a moment.":"No se ha podido descargar la previsión VOACAP de tu zona. Se volverá a intentar en un momento.";const name=EN()&&h.e?h.e:h.n;
  return d>450?(EN()?`VOACAP area: ${name}, ${fk(d)} km away. Bearings, distances and sun are exact for your locator; the ionosphere is the one calculated for ${name}, so the forecast loses some accuracy.`:`Zona de cálculo VOACAP: ${name}, a ${fk(d)} km. Rumbos, distancias y sol son exactos para tu locator; la ionosfera es la calculada para ${name}, así que la previsión pierde algo de precisión.`)
    :(EN()?`VOACAP area: ${name} (${fk(d)} km).`:`Zona de cálculo VOACAP: ${name} (a ${fk(d)} km).`)}
return {month,need,hop,check,get cur(){return cur},get list(){return LIST}};
})();
