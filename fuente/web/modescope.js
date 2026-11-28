/* 2.11.52: el modo de arriba (SSB, CW…) manda en toda la plataforma.
   Lo que se elija dentro de una sección (los modos del mapa, los del clúster en DX, «Mi modo / Todos» en Ahora)
   vale solo para esa sección, y se olvida en cuanto se cambia el modo de arriba.
   Antes la elección de una sección se arrastraba a todas y podía cambiar incluso el modo de arriba. */
(function(){
  if(typeof st!=="object"||!st||typeof MODES!=="object")return;
  const T=(a,b)=>window.ACRACB_LANG==="en"?b:a;
  const SC=["mapa","dx","ahora"];let OV={},FORCE=0;
  const main=()=>{const m=document.getElementById("modesel");return m?m.value:""};
  const key=()=>{let k="";try{k=MOD()}catch(_){}return k+"|"+main()};
  const all=()=>{const m=MOD();return [m,...Object.keys(MODES).filter(k=>k!==m)]};
  const dflt=()=>main()==="all"?all():[MOD()];
  const scope=()=>FORCE||!SC.includes(st.page)?"g":st.page;
  try{delete st.cms;delete st.cmsBase}catch(_){}
  Object.defineProperty(st,"cms",{configurable:true,
    get(){const s=scope();const o=OV[s];if(s!=="g"&&o&&o.k===key())return o.v;return dflt()},
    set(v){const s=scope();if(s==="g"||!Array.isArray(v))return;OV[s]={v:v.slice(),k:key()}}});
  /* CMS() solo recalcula si cmsBase no coincide: así siempre lee lo de arriba */
  Object.defineProperty(st,"cmsBase",{configurable:true,get(){try{return MOD()}catch(_){return ""}},set(){}});
  try{localStorage.removeItem("cmsall")}catch(_){}
  const after=()=>{try{CACHE.clear()}catch(_){}try{renderAlBar()}catch(_){}try{renderBandSeg()}catch(_){}try{renderSide()}catch(_){}
    try{if(window.ACRACB_clrender)ACRACB_clrender()}catch(_){}try{if(st.page==="mapa")drawMap()}catch(_){}};
  /* tocar un modo en el mapa o en DX ya no cambia el modo de arriba */
  window.toggleCM=toggleCM=function(k){const AL=Object.keys(MODES);let s=CMS().slice();
    if(s.length===AL.length)s=[k];else if(s.includes(k)){s=s.filter(x=>x!==k);if(!s.length)s=all()}else s.push(k);
    st.cms=s;if(st.page==="mapa")st.mapOn=true;after()};
  window.setAllCM=setAllCM=function(w){if(scope()==="g"){after();return}st.cms=w?all():[MOD()];if(st.page==="mapa")st.mapOn=true;after()};
  window.toggleAllCM=toggleAllCM=function(){st.cms=CMS().length===Object.keys(MODES).length?[MOD()]:all();if(st.page==="mapa")st.mapOn=true;after()};
  /* el aviso DX de arriba es de toda la plataforma: siempre con el modo de arriba */
  const _ra=renderAlBar;window.renderAlBar=renderAlBar=function(){FORCE=1;try{return _ra.apply(this,arguments)}finally{FORCE=0}};
  /* en el mapa, la predicción es siempre la del modo de arriba; ya no hay selector que lo cambie desde aquí */
  const _rm=renderModeChips;window.renderModeChips=renderModeChips=function(ms,wp){const r=_rm.apply(this,arguments);
    try{if(ms&&wp){const p=ms.querySelector(".mpred");if(p){const m=MODES[MOD()].s,c=CMSTXT(),one=CMS().length===1&&CMS()[0]===MOD();
      p.innerHTML=one?T(`Predicción y clúster en ${m}, el modo de arriba. Toca otros modos para verlos en el mapa.`,`Prediction and cluster in ${m}, the mode at the top. Tap other modes to see them on the map.`)
        :T(`Predicción en ${m}, el modo de arriba · clúster en el mapa: ${c}`,`Prediction in ${m}, the mode at the top · cluster on the map: ${c}`)}}}catch(_){}return r};
  /* al cambiar de sección cambia lo que vale: se vuelve a pintar con lo de esa sección */
  const _go=go;window.go=go=function(){const b=CMS().join();const r=_go.apply(this,arguments);if(CMS().join()!==b)after();return r};
  /* cambiar el modo de arriba borra las elecciones de las secciones */
  document.addEventListener("change",ev=>{if(ev.target&&ev.target.id==="modesel"){OV={};setTimeout(after,0)}},true);
  window.ACRACB_cmsScope=()=>({scope:scope(),ov:JSON.parse(JSON.stringify(OV)),cms:CMS()});
})();
