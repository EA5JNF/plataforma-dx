/* ---- ACRACB 2.4: mapa fino y ligero ----
   Costas y fronteras se dibujan solo para lo que se ve (con margen para poder arrastrar) y sin los puntos que caen a
   menos de 0,8 píxeles unos de otros. Con poco zoom se usa el mapa de 1:110 millones; a partir de 3 aumentos, el de
   1:50 millones, unas 5 veces más detallado,, que se descarga solo la primera vez que hace falta. Se recalcula al
   terminar cada gesto, así que mientras se arrastra o se amplía no hay trabajo extra. */
(function(){
"use strict";
let G110=null,G50=null,loading=false,tm=null,lastKey="",CACHE_D=null;
function build(w){const land=topojson.feature(w,w.objects.countries);land.features.forEach(f=>{const g=f.geometry;if(!g)return;const P=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];P.forEach(p=>{if(d3.geoArea({type:"Polygon",coordinates:p})>2*Math.PI)p.forEach(r=>r.reverse())})});
  return {land,borders:topojson.mesh(w,w.objects.countries,(a,b)=>a!==b)}}
function load(){if(loading||G50||!window.ACRACB_W50URL)return;loading=true;const s=document.createElement("script");s.src=window.ACRACB_W50URL;s.async=true;
  s.onload=()=>{loading=false;try{if(window.ACRACB_W50){G50=build(window.ACRACB_W50);window.ACRACB_W50=null;lastKey="";CACHE_D=null;redraw()}}catch(e){}};s.onerror=()=>{loading=false};document.head.appendChild(s)}
/* quita puntos casi repetidos (en píxeles de la vista), conservando el primero y el último de cada línea */
function thin(out,tol){const t2=tol*tol;let lx=0,ly=0,px=0,py=0,pend=false,inLine=false;
  return {point(x,y){if(!inLine){out.point(x,y);return}if(pend===null){out.point(x,y);lx=x;ly=y;pend=false;return}
      const dx=x-lx,dy=y-ly;if(dx*dx+dy*dy<t2){px=x;py=y;pend=true;return}out.point(x,y);lx=x;ly=y;pend=false},
    lineStart(){inLine=true;pend=null;out.lineStart()},lineEnd(){if(pend===true)out.point(px,py);inLine=false;pend=false;out.lineEnd()},
    polygonStart(){out.polygonStart()},polygonEnd(){out.polygonEnd()},sphere(){out.sphere&&out.sphere()}}}
function redraw(){if(typeof PR==="undefined"||!PR||typeof ZSVG==="undefined"||!ZSVG)return;const svg=ZSVG.node();const land=svg.querySelector("path.land"),bord=svg.querySelector("path.bord");if(!land||!bord)return;
  if(typeof GEO!=="undefined"&&GEO&&!G110&&GEO!==G50)G110=GEO;if(!G110)return;
  const k=(typeof ZT!=="undefined"&&ZT&&ZT.k)||1,tx=(ZT&&ZT.x)||0,ty=(ZT&&ZT.y)||0;
  const vb=(svg.getAttribute("viewBox")||"0 0 900 900").split(/\s+/).map(Number),W=vb[2],H=vb[3];
  const fine=k>=3;if(fine&&!G50)load();const G=fine&&G50?G50:G110;
  /* zona visible en coordenadas del mapa sin ampliar, con medio ancho de margen por cada lado */
  const x0=-tx/k,y0=-ty/k,w=W/k,h=H/k,ext=k>1.05?[[x0-w*.35,y0-h*.35],[x0+w*1.35,y0+h*1.35]]:null;
  const key=(G===G50?"50":"110")+"|"+(ext?ext.flat().map(v=>Math.round(v)).join(","):"all")+"|"+Math.round(k*100)+"|"+W+"x"+H+"|"+PR.rotate().join(",")+"|"+PR.scale();
  /* si la vista no ha cambiado, se reutiliza lo ya calculado (redibujar el mapa no obliga a recalcular las costas) */
  if(key===lastKey&&CACHE_D){if(land.getAttribute("d")!==CACHE_D[0])land.setAttribute("d",CACHE_D[0]);if(bord.getAttribute("d")!==CACHE_D[1])bord.setAttribute("d",CACHE_D[1]);return}lastKey=key;
  const pr=d3.geoAzimuthalEquidistant().rotate(PR.rotate()).scale(PR.scale()).translate(PR.translate()).precision(.35/Math.max(1,Math.min(k,24)));if(ext)pr.clipExtent(ext);
  const tol=.8/k,path=d3.geoPath({stream:s=>pr.stream(thin(s,tol))});
  CACHE_D=[path(G.land)||"",path(G.borders)||""];land.setAttribute("d",CACHE_D[0]);bord.setAttribute("d",CACHE_D[1])}
/* Safari (iPhone) a veces pinta el borde de los textos encima de la letra si el orden solo viene de la hoja de estilos:
   se pone también como atributo en cada texto, que es lo que respeta siempre */
function halo(){const svg=typeof ZSVG!=="undefined"&&ZSVG&&ZSVG.node();if(!svg)return;svg.querySelectorAll("text:not([paint-order])").forEach(t=>t.setAttribute("paint-order","stroke"))}
function later(){clearTimeout(tm);tm=setTimeout(()=>{redraw();halo()},90)}
function hookZ(){if(typeof ZM==="undefined"||!ZM)return false;ZM.on("end.fino",later);return true}
function hookD(){const o=window.drawMap;if(typeof o!=="function"||o.__fino)return false;const w=function(){const r=o.apply(this,arguments);try{redraw()}catch(e){}return r};w.__fino=1;window.drawMap=w;return true}
function boot(){let n=0;const t=setInterval(()=>{const a=hookZ(),b=hookD();if((a&&b)||++n>300)clearInterval(t)},300)}
window.ACRACB_mapfino={redraw};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
