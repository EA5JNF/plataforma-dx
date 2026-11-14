#!/usr/bin/env python3
"""Genera la versión Artifact y la versión web autónoma a partir de la base publicada."""
import base64, io, json, os, re, sys
from PIL import Image

W = os.path.dirname(os.path.abspath(__file__))
SP = os.path.dirname(W)
BASE = os.path.join(SP, "pub", "base_clean.html")
ICON = os.path.join(SP, "ext", "icono-1024.png")  # icono original del club, 1024 px
s = open(BASE, encoding="utf-8").read()

def R(a, b, n=1):
    global s
    c = s.count(a)
    if c == 0 and b in s:
        return
    assert c == n, (a[:90], c)
    s = s.replace(a, b)

# ---------------- cambios comunes ----------------
css = open(os.path.join(W, "common.css"), encoding="utf-8").read()
i = s.rfind("</style>"); s = s[:i] + css + s[i:]

# Log ADIF: tarjeta en Fichas, guardado solo en el dispositivo, confirmaciones de LoTW y QSL
R('st.mbs=(st.mbs||[]).filter(b=>BI0().includes(b));','st.mbs=(st.mbs||[]).filter(b=>BALL.includes(b));')
R('const items=[["-1","Todas (la mejor)"],...BI0().map(i=>[String(i),BANDS[i]])];','const items=[["-1","Todas (la mejor)"],...BALL.map(i=>[String(i),BANDS[i]])];')
R('items.map(([v,n])=>`<button data-mb="${v}" aria-pressed=','items.map(([v,n])=>`<button data-mb="${v}"${v!=="-1"&&!BI0().includes(+v)?` class="clz" title="${MODES[MOD()].s} no se usa en esta banda según el plan de bandas: la previsión es orientativa"`:""} aria-pressed=')
R('function rawM(D,t,lp,j,h,b){if(!D||b>=NBD)return null;const o=(lp?t.ol:t.os)+j*SSZ+h*HSZ;','function rawM(D,t,lp,j,h,b){if(!D||b>=NBD)return null;const o=(lp?t.ol:t.os)+(j<5?j*SSZ:HOFF+24*NBD*2+(j-5)*SSZ)+h*HSZ;')
R('ssnFrom=sfi=>Math.max(20,Math.min(100,1.14*sfi-73));','ssnFrom=sfi=>Math.max(20,Math.min(160,1.14*sfi-73));')
R('.on("zoom",ev=>{ZT=ev.transform;if(ZROOT){ZROOT.attr("transform",ZT);zoomMarks(ZT.k);schedDeclutter()}','.on("zoom",ev=>{ZT=ev.transform;if(ZROOT){ZROOT.attr("transform",ZT);if(window.__zmk!==ZT.k){window.__zmk=ZT.k;zoomMarks(ZT.k)}schedDeclutter()}')
R('function drawMap(){setTimeout(()=>{try{foldSums()}catch(e){}},0);','function drawMap(){window.__zmk=null;setTimeout(()=>{try{foldSums()}catch(e){}},0);')
R('h.textContent="Clúster del planeta · "+CMSTXT()+(HB()!=null?" · "+BANDS[HB()]:"")+(mc!=null?` · revisado hace ${mc} min`:"")+(L.spotsNew!=null?` · ${L.spotsNew} nuevos`:"")+(m!=null?` · último spot hace ${m} min`:"")','{const E=window.ACRACB_LANG==="en",fr=mc!=null&&mc<=3,dot=`<i class="cld ${mc==null?"":fr?"ok":"old"}" title="${mc==null?"":E?`checked ${mc} min ago`:`revisado hace ${mc} min`}"></i>`;const bits=[CMSTXT()+(HB()!=null?" · "+BANDS[HB()]:"")];if(mc!=null&&!fr)bits.push(E?`checked ${mc} min ago`:`revisado hace ${mc} min`);if(L.spotsNew!=null)bits.push(E?`${L.spotsNew} new`:`${L.spotsNew} nuevos`);if(m!=null)bits.push(E?`last spot ${m} min ago`:`último spot hace ${m} min`);\n  h.innerHTML=(E?"World cluster":"Clúster del planeta")+`<span class="clst">${dot}${bits.join(" · ")}</span>`}')
R('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">','<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><script>/* 2.4.1: ahorro de batería: con la página oculta (otra pestaña, pantalla apagada) los temporizadores de 1 s o más no trabajan */(function(){var si=window.setInterval;window.setInterval=function(f,d){var a=[].slice.call(arguments,2);if(typeof f==="function"&&(+d||0)>=1000){var g=function(){if(document.hidden)return;return f.apply(this,arguments)};return si.apply(window,[g,d].concat(a))}return si.apply(window,arguments)}})();</script>')
R('la SNR mediana y sus deciles','la SNR media y sus deciles')
R('(la <b>mediana</b>, o el más repetido si no es un número)','(el <b>valor central</b>, o el más repetido si no es un número)')
R('VOACAP da <b>medianas del mes</b>','VOACAP da <b>medias del mes</b>')
R('VOACAP da medianas del mes, centradas','VOACAP da medias del mes, centradas')
R('la MUF mediana del camino es','la MUF media del camino es')
R('que la mediana del mes, y ya está aplicado','que la media del mes, y ya está aplicado')
R('de la mediana del mes: la web ya lo aplica a las horas cercanas.','de la media del mes: la web ya lo aplica a las horas cercanas.')
R('Coincide con la mediana del mes.','Coincide con la media del mes.')
R('; se usa la mediana`','; se usa el valor central`')
R('(la mediana o el más repetido)','(el valor central o el más repetido)')
R('% más alta que la mediana del mes','% más alta que la media del mes')
R('const MBS=()=>{const s=(st.mbs||[]).filter(b=>BI0().includes(b));','const MBS=()=>{const s=(st.mbs||[]).filter(b=>BALL.includes(b));')
R('function drawGeoLabels(Z,pr,W){','const GLIMP={US:0,RU:1,CN:2,BR:3,IN:4,AU:5,CA:6,AR:7,MX:8,SA:9,IR:10,ZA:11,EG:0,ES:1,FR:2,DE:3,GB:4,IT:5,JP:6,TR:7,NG:8,ID:9};function drawGeoLabels(Z,pr,W){')
R('G.c.forEach(c=>add(c[0].toUpperCase(),[c[1],c[2]],"glc t"+c[3],c[3]*10,[0,1.7,2.8,3.8][c[3]],[9,8.3,7.8,7.5][c[3]],0,true));','G.c.forEach(c=>add(c[0].toUpperCase(),[c[1],c[2]],"glc t"+c[3],c[3]*10+(GLIMP[c[4]]!=null?GLIMP[c[4]]*.1-3:0),[0,1.3,2.2,3.2][c[3]],[9,8.3,7.8,7.5][c[3]],0,true));')
R('function tick(){const n=new Date();','function tick(){if(document.hidden)return;const n=new Date();')
R('["Índice A",s.a,','["Índice A",s.a!=null&&s.a!==""&&!isNaN(+s.a)?Math.round(+s.a):s.a,')
R('["Kp · campo magnético",L.kp,L.kp>=5?"r":L.kp>=4?"y":"g",kpT],','["Kp · campo magnético",L.kp,L.kp>=5?"r":L.kp>=4?"y":"g",kpT],...(()=>{const a=L.space&&L.space.a!=null&&L.space.a!==""&&!isNaN(+L.space.a)?Math.round(+L.space.a):null;return a==null?[]:[["Índice A · actividad geomagnética del día",a,a>=20?"r":a>=10?"y":"g",a>=30?"Tormenta: día muy agitado, bandas bajas ruidosas y caminos polares cortados":a>=20?"Agitado: algo de QSB y ruido en los caminos por el norte":a>=10?"Algo inquieto: condiciones normales":"Tranquilo: día estable, buenos caminos polares"]]})(),')
R('goNow.slice(0,3).forEach(x=>steps.push(','if(!window.ACRACB_recCards)goNow.slice(0,3).forEach(x=>steps.push(')
R('dxNow.filter(x=>!goNow.some(g=>x.d.call.includes(g.s.call))).slice(0,3).forEach(x=>steps.push(','if(!window.ACRACB_recCards)dxNow.filter(x=>!goNow.some(g=>x.d.call.includes(g.s.call))).slice(0,3).forEach(x=>steps.push(')
R('h+=steps.length?"<ol style=\'margin:4px 0 0;padding-left:20px\'>"+steps.map(x=>`<li>${x}</li>`).join("")+"</ol>":"<p>Nada útil a esta hora.</p>";','const RCH=st.mode!=="contest"&&window.ACRACB_recCards?ACRACB_recCards(goNow.slice(0,3),dxNow.filter(x=>!goNow.some(g=>x.d.call.includes(g.s.call))).slice(0,3)):"";h+=(st.mode!=="contest"&&window.ACRACB_recModes?ACRACB_recModes():"")+RCH;h+=steps.length?"<ol style=\'margin:4px 0 0;padding-left:20px\'>"+steps.map(x=>`<li>${x}</li>`).join("")+"</ol>":RCH?"":"<p>Nada útil a esta hora.</p>";')
R('<div class="v">${esc(v)}</div><div class="t">${t}</div></div>`).join("");','<div class="v">${esc(v).replace(/ %/g,"\\u00a0%").replace(/ (km\\/s|nT)$/," <small>$1</small>")}</div><div class="t">${t}</div></div>`).join("");')
R('setInterval(()=>{if(st.page==="balizas")renderBcn();','setInterval(()=>{if(document.hidden)return;if(st.page==="balizas")renderBcn();')
R('setInterval(()=>{st.mhour=(st.mhour+1)%24;','setInterval(()=>{if(document.hidden)return;st.mhour=(st.mhour+1)%24;')
R('setInterval(()=>{if(st.page==="ahora"){GLSEED=','setInterval(()=>{if(document.hidden)return;if(st.page==="ahora"){GLSEED=')
R("setInterval(()=>{if(st.page==='ahora'){renderTL();renderQTH()}},60*1000);","setInterval(()=>{if(document.hidden)return;if(st.page==='ahora'){renderTL();renderQTH()}},60*1000);")
R('if(pg==="dx"){{const it=(L.alert&&L.alert.items)||[];','if(pg==="dx"){{const it=((L.alert&&L.alert.items)||[]).filter(x=>!window.ACRACB_alOK||ACRACB_alOK(x));')
R(' ["Baliza","un emisor automático que transmite siempre igual. Si la oyes, esa dirección está abierta."]];',' ["Baliza","un emisor automático que transmite siempre igual. Si la oyes, esa dirección está abierta."],\n ["CQ","llamada general: «cualquier estación, contesten». «CQ DX» pide solo contactos lejanos."],\n ["73","«saludos cordiales» al despedirse. Se dice en singular: 73, no 73s."],\n ["QSO","un contacto completo entre dos estaciones: indicativos y reportes intercambiados."],\n ["QTH","el lugar desde donde transmites. «Mi QTH es Alicante»."],\n ["QSY","cambiar de frecuencia. «QSY 14.205» quiere decir «me voy a 14.205»."],\n ["QRP","transmitir con poca potencia: 5 W o menos en CW y 10 W o menos en fonía."],\n ["QRT","cerrar la estación y dejar de transmitir."],\n ["RST","el reporte completo: legibilidad de 1 a 5, fuerza de 1 a 9 y, en CW, tono de 1 a 9. En CW se suele dar 599."],\n ["Indicativo","el «nombre» de cada estación, como EA5RKB. El prefijo, EA, dice el país y el número, la zona."],\n ["Portable","la estación transmite fuera de su domicilio. /M es desde un vehículo y /MM, desde un barco."],\n ["Capa D","la capa más baja de la ionosfera. Solo existe de día y absorbe las bandas bajas: por eso 80 y 160 m van de noche."],\n ["Capa F2","la capa más alta y la que hace posible el DX: refleja la onda corta a miles de kilómetros."],\n ["Esporádica E","nubes muy ionizadas a unos 100 km que aparecen sobre todo en verano y abren 10, 6 y 2 m a 1.000–2.000 km."],\n ["Salto","cada rebote de la señal entre la ionosfera y el suelo. Un salto en la capa F2 cubre hasta unos 4.000 km."],\n ["Tormenta geomagnética","el viento solar sacude el campo magnético de la Tierra: empeoran los caminos por el norte y sube el ruido."],\n ["Ciclo solar","el Sol pasa de la calma a su máxima actividad y vuelve en unos 11 años. Con más manchas, mejores bandas altas."],\n ["Most Wanted","la lista de Club Log con las entidades más buscadas. Cuanto más arriba, más difícil es contactarlas."],\n ["LoTW","Logbook of The World, el sistema de la ARRL para confirmar contactos por internet."],\n ["ADIF","el formato estándar de los libros de guardia. Lo exportan QRZ, Club Log y casi todos los programas de log."],\n ["Pasar la mano","terminar tu turno diciendo «cambio» en fonía o «K» en CW, para que hable el otro."]];')
R('const pick=[...GLOS.filter(g=>want.has(g[0])).slice(0,2),...rest].slice(0,5);','const pick=[...GLOS.filter(g=>want.has(g[0])).slice(0,2),...rest].slice(0,8);')
R('<summary>Palabras que conviene saber</summary>','<summary>Palabras y expresiones que conviene saber</summary>')
R('let WARM=0;function warmCache(){const id=++WARM;','let WARM=0,WARMT=0;function warmCache(){const id=++WARM;if(document.hidden)return;if(window.ACRACB_lowPower&&ACRACB_lowPower()){if(Date.now()-WARMT<9e5)return;WARMT=Date.now()}')
R('function prob(t,lh,b,lp,extra){const RXM=extra==="rx";if(RXM)extra=0;const key=t.id+"|"+lh+"|"+b+"|"+(lp?1:0)+"|"+(extra||0)+(RXM?"|rx":"");','function prob(t,lh,b,lp,extra){const RXM=extra==="rx";if(RXM)extra=0;const key=t.id+"|"+lh+"|"+b+"|"+(lp?1:0)+"|"+(extra||0)+(RXM?"|rx":"")+(window.ACRACB_NOLIVE?"|nl":"");')
R('const r={p:rel(M.m+PRM().cal+(extra||0),M.DL,M.DU,M.thr),muf:M.muf};CACHE.set(key,r);return r}','let pp=rel(M.m+PRM().cal+(extra||0),M.DL,M.DU,M.thr);if(!lp&&!RXM&&!window.ACRACB_NOLIVE&&window.ACRACB_live)try{pp=ACRACB_live(t,lh,b,pp,extra||0)}catch(e){}const r={p:pp,muf:M.muf};CACHE.set(key,r);return r}')
R('r.h==null?\'<span class="note">sin dato</span>\':','r.h==null?\'<span class="note">sin datos</span>\':')
R('const CMS=()=>{if(!st.cms||st.cmsBase!==MOD()){st.cms=[MOD()];st.cmsBase=MOD()}return st.cms};','const CMS=()=>{if(!st.cms||st.cmsBase!==MOD()){st.cms=store.get("cmsall")==="1"?[MOD(),...Object.keys(MODES).filter(k=>k!==MOD())]:[MOD()];st.cmsBase=MOD()}return st.cms};')
R('function toggleCM(k){let s=CMS().slice();if(s.includes(k)){if(s.length===1)return;s=s.filter(x=>x!==k)}else s.push(k);st.cms=s;','function toggleAllCM(){const all=Object.keys(MODES),on=CMS().length===all.length;st.cms=on?[MOD()]:[MOD(),...all.filter(k=>k!==MOD())];store.set("cmsall",on?"":"1");if(st.page==="mapa")st.mapOn=true;renderAlBar();renderBandSeg();renderSide();if(st.page==="mapa")drawMap()}\nfunction toggleCM(k){let s=CMS().slice();if(s.includes(k)){if(s.length===1)return;s=s.filter(x=>x!==k)}else s.push(k);st.cms=s;store.set("cmsall",s.length===Object.keys(MODES).length?"1":"");')
R('  ms.innerHTML=`<span class="segl">Modos</span>`+','  const allOn=sel.length===Object.keys(MODES).length;ms.innerHTML=`<span class="segl">Modos</span><button data-mmall="1" class="mmall" aria-pressed="${allOn}">Todos</button>`+')
R('  ms.querySelectorAll("[data-mm]").forEach(b=>b.onclick=()=>toggleCM(b.dataset.mm));','  ms.querySelectorAll("[data-mm]").forEach(b=>b.onclick=()=>toggleCM(b.dataset.mm));{const ab=ms.querySelector("[data-mmall]");if(ab)ab.onclick=()=>toggleAllCM()}')
R('${last?`<p class="calmsg">${last.h?"Anotado: <b>lo oyes</b>":"Anotado: <b>no lo oyes</b>"}','${last&&last.h&&window.ACRACB_smeter?ACRACB_smeter(last):""}${last?`<p class="calmsg">${last.h?"Anotado: <b>lo oyes</b>"+(last.s!=null&&window.ACRACB_sLbl?ACRACB_sLbl(last.s):""):"Anotado: <b>no lo oyes</b>"}')
R('for(const o of arr){const p=Math.min(.98,Math.max(.02,rel(o.m+d,o.dl,o.du,o.thr)));ll+=o.h?Math.log(p):Math.log(1-p)}','for(const o of arr){const p=Math.min(.98,Math.max(.02,rel(o.m+d,o.dl,o.du,o.thr))),ww=o.w!=null?o.w:1;ll+=ww*(o.h?Math.log(p):Math.log(1-p));if(o.h&&o.snr!=null){const e=o.snr-(o.m+d);ll-=e*e/200}}')
R('un previo de ±6 dB evita correcciones exageradas con pocas escuchas.</p>','un previo de ±6 dB evita correcciones exageradas con pocas escuchas.</p><p>Si lo oyes, marca también la lectura del S-metro, de S1 a S9 y por encima: la señal real, comparada con el ruido típico de esa banda en tu entorno, ajusta las previsiones mucho antes que un simple «lo oigo».</p>')
R('scaleExtent([1,10])','scaleExtent([1,41])')
R('.fitExtent([[8,8],[W-8,H-8]],{type:"Sphere"}).precision(.4)','.fitExtent([[8,8],[W-8,H-8]],{type:"Sphere"}).precision(.4/Math.max(1,Math.min((typeof ZT!=="undefined"&&ZT&&ZT.k)||1,12)))')
R('if(n>1000)n/=1000;const s4=n.toFixed(4);return s4.endsWith("0")?n.toFixed(3):s4}','if(n>1000)n/=1000;return n.toFixed(3)}')
if 'id="f_log"' not in s: R('<details class="card fold" id="f_info" data-tab="Ficha">',
  '<details class="card fold" id="f_log" data-tab="Mi log"><summary><h2>Mi log y mis objetivos</h2><span class="fsum" id="s_log"></span></summary><div id="logbox"></div></details>\n<details class="card fold" id="f_info" data-tab="Ficha">')
R('const conf=(f.APP_QRZLOG_STATUS||"").toUpperCase()==="C";',
  'const conf=(f.APP_QRZLOG_STATUS||"").toUpperCase()==="C"||(f.LOTW_QSL_RCVD||"").toUpperCase()==="Y"||(f.QSL_RCVD||"").toUpperCase()==="Y";')
R('const ok=await dbSave("owner/log",r);$("adifst").textContent=`${fk(r.n)} QSO leídos. `+(ok?"Guardado en tu cuenta: solo lo ves tú.":"Guardado en este navegador.");',
  'store.set("db_owner/log",JSON.stringify(r));$("adifst").textContent=`${fk(r.n)} QSO leídos. Guardado solo en este dispositivo: nadie más lo ve.`;')
R('if(DB&&upath("log")){try{await DB.doc(upath("log")).delete()}catch(e){}}refresh()}}',
  'refresh()}}')
R('<p class="note">Cargado el ${new Date(LOG.date).toLocaleString("es-ES",{timeZone:"Europe/Madrid"})}. Con esto, ★ y «te falta» salen solos en el mapa, las DXpediciones, el clúster y los avisos.</p>`:`<p>Sube tu log para que la web sepa qué entidades y bandas te faltan. Solo cuenta lo confirmado en QRZ.</p>`)+',
  '<p class="note">Cargado el ${new Date(LOG.date).toLocaleString("es-ES",{timeZone:"Europe/Madrid"})}. Con esto, ★ y «te falta» salen solos en el mapa, las DXpediciones, el clúster y los avisos.</p>`+(window.ACRACB_goals?ACRACB_goals():""):`<p>Sube tu log para que la web sepa qué entidades y bandas te faltan. Cuenta como confirmado lo validado en QRZ, LoTW o por QSL en papel.</p>`)+')
R('<b>Exporta tu log de QRZ en ADIF</b> (Logbook → Settings → Export) y súbelo aquí',
  '<b>Sube tu log en ADIF</b> (QRZ: Logbook → Settings → Export; también vale el de LoTW, Club Log o tu programa de log). Se queda solo en este dispositivo')
if 'const sl=$("s_log")' not in s: R('function renderLog(){if(!$("logbox"))return;',
  'function renderLog(){if(!$("logbox"))return;{const sl=$("s_log");if(sl)sl.textContent=LOG?`${fk(LOG.n)} QSO · ${Object.keys(LOG.e).length} entidades`:"Sube tu ADIF";}')
R("${fk(LOG.c)} confirmados en QRZ</div>", "${fk(LOG.c)} confirmados (QRZ, LoTW o QSL)</div>")
R('<div class="live-links"><span>En directo, al segundo:</span><a class="btn" data-ext href="https://webcluster.ure.es/" target="_blank" rel="noopener noreferrer">WebCluster URE</a><a class="btn" data-ext href="https://www.dxsummit.fi/#/" target="_blank" rel="noopener noreferrer">DX Summit</a></div><div class="note" id="extfb" hidden></div>', '')
R('el.hidden=false;el.innerHTML=`<b>Aviso DX (${esc(fmtT(al.at))}):</b> ${its.slice(0,4).map(x=>`<span><b>${CS(x.call)}</b> ${esc(x.f)} · ${esc(x.t)} UTC</span>`).join(" · ")} <button class="lnk" id="algo">Ver</button> <button class="lnk" id="alx" aria-label="Cerrar aviso">Cerrar</button>`;\n  $("algo").onclick=()=>go("dx");',
  'el.hidden=false;const seenA=new Set(),uq=its.filter(x=>{if(seenA.has(x.call))return false;seenA.add(x.call);return true});el.innerHTML=`<div class="alh"><b>Aviso DX (${esc(fmtT(al.at))})</b><button class="lnk" id="alx" aria-label="Cerrar aviso">Cerrar</button></div><div class="all">${uq.slice(0,5).map(x=>`<button class="alr" data-call="${esc(x.call)}"><span><b>${CS(x.call)}</b></span><span class="alf">${esc(x.f)}${x.mode?" · "+esc(x.mode):""} · ${esc(x.t)} UTC${window.ACRACB_tags?ACRACB_tags(x,true):""}</span><span class="alv">Ver ficha</span></button>`).join("")}</div>`;\n  el.querySelectorAll(".alr").forEach(b=>b.onclick=()=>{try{openCall(b.dataset.call)}catch(e){go("dx")}setTimeout(()=>{const c=[...document.querySelectorAll(".cpl")].find(x=>!x.hidden&&x.getClientRects().length);if(!c)return;let n=c;while(n&&n!==document.body){if(getComputedStyle(n).position==="fixed"){n.scrollTop=0;c.scrollTop=0;return}n=n.parentElement}c.scrollIntoView({behavior:"smooth",block:"start"})},150)});')
R('Se queda solo en este dispositivo<input type="file" id="adif" accept=".adi,.adif,.txt">','<span>Se queda solo en este dispositivo.</span><label class="btn filebtn">Elegir archivo ADIF<input type="file" id="adif" class="vhide"></label>')
R('$("adifst").textContent=`${fk(r.n)} QSO leídos. Guardado solo en este dispositivo: nadie más lo ve.`;CACHE.clear();refresh()',
  'window.ADIFMSG=`Listo: ${fk(r.n)} QSO leídos, ${fk(r.c)} confirmados. Guardado solo en este dispositivo: nadie más lo ve.`;CACHE.clear();refresh()')
R('<p class="note" id="adifst"></p>','<p class="note" id="adifst">${window.ADIFMSG?esc(window.ADIFMSG):""}</p>')
R('if($("logdel"))$("logdel").onclick=async()=>{LOG=null;','if($("logdel"))$("logdel").onclick=async()=>{LOG=null;window.ADIFMSG="Log quitado de este dispositivo.";')
R('<li><b>Mira el resultado:</b> <button class="lnk" data-go="ahora">Ahora</button> te dice qué banda usar y hacia dónde apuntar; <button class="lnk" data-go="dx">DX</button>, quién está en el aire.</li></ol>',
  '<li><b>Mira el resultado:</b> <button class="lnk" data-go="ahora">Ahora</button> te dice qué banda usar y hacia dónde apuntar; <button class="lnk" data-go="dx">DX</button>, quién está en el aire.</li><li><b>Opcional, tu log:</b> pulsa «Subir log» arriba y elige tu ADIF de QRZ. La web te marcará las entidades y bandas que te faltan.</li></ol>')
R('Empieza en 2 pasos','Empieza en 3 pasos')
# bandas con espacio fijo: «12 m» nunca se parte en dos líneas
s = s.replace('.replace(" m","")', '.replace(/\\s+m$/,"")').replace('.replace(" cm","")', '.replace(/\\s+cm$/,"")')
R('const BANDS=["160 m","80 m","40 m","20 m","17 m","15 m","12 m","10 m","60 m","30 m","6 m","2 m","70 cm"]',
  'const BANDS=["160\\u00a0m","80\\u00a0m","40\\u00a0m","20\\u00a0m","17\\u00a0m","15\\u00a0m","12\\u00a0m","10\\u00a0m","60\\u00a0m","30\\u00a0m","6\\u00a0m","2\\u00a0m","70\\u00a0cm"]')
# ---------------- 1.1.0: ¿me oyen?, split/QSL, intercambio, QRP ----------------
R('const SPOTS=','let SPOTS=')
R('<div class="dxl dxlw" id="dxl"></div></details>',
  '<div class="dxl dxlw" id="dxl"></div></details>\n<details class="card fold" id="f_heard" data-tab="¿Me oyen?"><summary><h2>¿Quién me oye ahora?</h2><span class="fsum" id="s_heard"></span></summary><div id="heardbox"></div></details>')
if 'id="f_qrp"' not in s:
    i = s.index('<details class="card fold" id="f_info" data-tab="Ficha">')
    s = s[:i] + '<details class="card fold" id="f_qrp" data-tab="QRP"><summary><h2>QRP: frecuencias y consejos</h2><span class="fsum" id="s_qrp"></span></summary><div id="qrpbox"></div></details>\n' + s[i:]
R('${(()=>{const m=String(s.c||"").match(/(POTA|SOTA|WWFF|GMA)[ :]*[A-Z0-9/-]+|skimmer|PSK Reporter|escucha[^,;.]*|up ?\\d*/i);return m?" · "+esc(m[0]):""})()}',
  '${window.ACRACB_tags?ACRACB_tags(s):""}')
R('<td><b>${esc(c[0])}</b>${c[7]?', '<td><b>${esc(c[0])}</b>${window.ACRACB_exch?ACRACB_exch(c[0]):""}${c[7]?')
R('<button data-pg="fichas">Fichas</button>','<button data-pg="fichas">Países y log</button>')
# visor del log y datos de modo e indicativo en el ADIF
R('const recs=txt.split(/<eor>/i);const e={};let n=0,c=0;','const recs=txt.split(/<eor>/i);const e={},mm={};let n=0,c=0,sc="";')
R('if(conf)c++;e[dx]=e[dx]||{};','if(conf)c++;{const md=String(f.MODE||"").toUpperCase(),mc=md==="CW"?"CW":/^(SSB|USB|LSB|AM|FM|PHONE|DIGITALVOICE)$/.test(md)?"PH":"DG";mm[dx]=mm[dx]||{};if(conf||!mm[dx][mc])mm[dx][mc]=conf?"C":(mm[dx][mc]||"W");if(!sc)sc=String(f.STATION_CALLSIGN||f.OPERATOR||"").toUpperCase().trim()}e[dx]=e[dx]||{};')
R('return {e,n,c,date:new Date().toISOString()}}','return {e,n,c,m:mm,call:sc,date:new Date().toISOString()}}')
# entidades y frecuencias normalizadas también al aplicar datos
R("function normL(){try{", "function normL(){try{if(window.ACRACB_normEnt)ACRACB_normEnt();")
# automatización: todo manual
R("<p>Cada dos horas se revisan los clústeres. Cuando una DXpedición activa o una entidad rara aparece en el modo que tengas elegido, sale aquí y arriba en todas las secciones para todos, y llega al móvil del administrador.</p>\n  <div class=\"acts\" style=\"display:flex;gap:8px;flex-wrap:wrap\"><button class=\"btn\" id=\"alon\">Activar avisos</button><button class=\"btn\" id=\"aloff\">Desactivar</button></div><p class=\"note\" id=\"alst\">${MCP?\"\":\"Desde este visor no se pueden cambiar los avisos.\"}</p>",
  "<p class=\"note\">DXpediciones activas y entidades raras de tu modo que aparecen en el clúster. Se revisan solo cuando pulsas Actualizar.</p>")
R('`<p class="note">DXpediciones y entidades raras en tu modo. Se revisa cada dos horas.</p>`',
  '`<p class="note">DXpediciones activas y entidades raras de tu modo que aparecen en el clúster. Se revisan solo cuando se pulsa Actualizar.</p>`')
R("· Sol y propagación cada 3 h, clúster cada 2 h`", "· se actualizan solo al pulsar Actualizar`")
R('`Actualización automática (Sol cada 3 h, clúster cada 2 h) · última: ${fmtT(d.at)}', '`Última actualización: ${fmtT(d.at)}')
R('"Actualización automática en curso: la página cambiará sola en unos minutos."', '"Actualización en curso: la página cambiará sola en unos minutos."')
R('updSt("Actualización automática: Sol y propagación cada 3 h, clúster cada 2 h.","updst-ok")', 'updSt("Los datos se actualizan solo cuando se pulsa Actualizar.","updst-ok")')
R("La siguiente llegará a la próxima hora programada.", "Se puede pedir otra con Actualizar.")
R('const NOV="Desde este visor no se puede lanzar la actualización; llegará sola a la próxima hora programada.";',
  'const NOV="Desde este visor no se puede lanzar la actualización: solo la lanza el administrador con Actualizar.";')
s = s.replace("if(age>240){const h=", "if(age>180){const h=")
# bandas sin cálculo (2 m, 70 cm en la tabla del mapa): «—» en vez de «NaN» en verde
R('const cls=p=>p<.05?"c0"', 'const cls=p=>!(p>=0)?"c0":p<.05?"c0"')
R('const pct=p=>p<.01?"·"', 'const pct=p=>!(p>=0)?"—":p<.01?"·"')
# meta para app de iPhone/iPad y color del tema
img = Image.open(ICON).convert("RGBA")
def png(sz):
    b = io.BytesIO(); im = img.resize((sz, sz), Image.LANCZOS)
    bg = Image.new("RGB", (sz, sz), (10, 14, 19)); bg.paste(im, mask=im.split()[3]); bg.save(b, "PNG", optimize=True)
    return base64.b64encode(b.getvalue()).decode()
ic180 = png(180)
s = re.sub(r'<link rel="apple-touch-icon"[^>]*>', '<link rel="apple-touch-icon" sizes="180x180" href="data:image/png;base64,%s">' % ic180, s, count=1)
head_meta = ('<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
             '<meta name="apple-mobile-web-app-status-bar-style" content="black">\n<meta name="apple-mobile-web-app-title" content="ACRACB DX">\n'
             '<meta name="application-name" content="ACRACB DX">\n<meta name="theme-color" content="#0a0e13">\n')
R('<title>ACRACB - Plataforma DX</title>', '<title>ACRACB - Plataforma DX</title>\n' + head_meta)
# ---------------- 2.1.0: clúster por bandas, POTA/SOTA/WWFF, paso largo, DXpediciones en el aire, modos con color ----------------
R('${onc?`<b style="color:#ffd76a">◆ En el clúster: ${esc(onc.f)} a las ${esc(onc.t)} UTC</b><br>`:""}',
  '${window.ACRACB_dxon?ACRACB_dxon(d):(onc?`<b style="color:#ffd76a">◆ En el clúster: ${esc(onc.f)} a las ${esc(onc.t)} UTC</b><br>`:"")}')
R('${az}° ${cab(az)} · ${fk(km)} km · mejor', '${az}° ${cab(az)} · largo ${(az+180)%360}° · ${fk(km)} km · mejor')
R('<b>${BANDS[s.band]||""}${s.mode?" "+esc(s.mode):""}</b></span></div>`}).join("")',
  '<b>${BANDS[s.band]||""}</b>${s.mode?" "+(window.ACRACB_mb?ACRACB_mb(s.mode):esc(s.mode)):""}</span></div>`}).join("")')
R('· ${esc(String(spotMode(s)).toUpperCase())} ·','· ${window.ACRACB_mb?ACRACB_mb(s.mode||String(spotMode(s)).toUpperCase()):esc(String(spotMode(s)).toUpperCase())} ·')
R('<span class="alf">${esc(x.f)}${x.mode?" · "+esc(x.mode):""}','<span class="alf">${esc(x.f)}${x.mode?" "+(window.ACRACB_mb?ACRACB_mb(x.mode):esc(x.mode)):""}')
# 2.1.0: «Mapa» (capas y vista) pasa a ser el primer bloque de los ajustes del mapa; los demás se renumeran
if '<b>1</b>Mapa</div>' not in s:
    i6 = s.index('<div class="mrow"><div class="mrt"><b>6</b>Mapa</div>'); j6 = s.index('<p class="note zhint">', i6)
    row6 = s[i6:j6]; s = s[:i6] + s[j6:]
    i1 = s.index('<div class="mrow"><div class="mrt"><b>1</b>Qué ver</div>')
    kz = s.index('<p class="note zhint">'); ez = s.index('</p>', kz) + 4; zh = s[kz:ez]; s = s[:kz] + s[ez:]
    i1 = s.index('<div class="mrow"><div class="mrt"><b>1</b>Qué ver</div>')
    s = s[:i1] + row6.rstrip() + "\n        " + zh + "\n        " + s[i1:]
    for n, name in ((5, "Predicción"), (4, "Hora"), (3, "Bandas"), (2, "Modo"), (1, "Qué ver")):
        R('<div class="mrt"><b>%d</b>%s</div>' % (n, name), '<div class="mrt"><b>%d</b>%s</div>' % (n + 1, name))
    R('<div class="mrt"><b>6</b>Mapa</div>', '<div class="mrt"><b>1</b>Mapa</div>')
    R('elige qué ver (1), el modo (2), las bandas (3) y la hora (4).', 'elige qué ver (2), el modo (3), las bandas (4) y la hora (5).')
# 2.1.1: la parte DX de renderSide (DXpediciones, clúster y actividad cercana) solo se calcula cuando se ve la página DX
R('  // DX\n  $("dxl").innerHTML=', '  // DX\n  if(st.page!=="dx")return;\n  $("dxl").innerHTML=')
# 2.1.2: robustez. Guardado que avisa si el dispositivo está lleno; ADIF con tamaño máximo
R('const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};',
  'const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}};')
R('f=e.target.files[0];if(!f)return;', 'f=e.target.files[0];if(!f)return;if(f.size>150e6){$("adifst").textContent="Ese archivo pasa de 150 MB: no parece un log ADIF. Expórtalo de nuevo o divídelo.";e.target.value="";return}')
R('store.set("db_owner/log",JSON.stringify(r));window.ADIFMSG=`Listo: ${fk(r.n)} QSO leídos, ${fk(r.c)} confirmados. Guardado solo en este dispositivo: nadie más lo ve.`',
  'const okS=store.set("db_owner/log",JSON.stringify(r));window.ADIFMSG=`Listo: ${fk(r.n)} QSO leídos, ${fk(r.c)} confirmados. `+(okS?"Guardado solo en este dispositivo: nadie más lo ve.":"No cabe en la memoria del navegador: funciona ahora, pero al cerrar la página tendrás que volver a subirlo.")')
# 2.1.7: la estrella o la marca nunca se separan del indicativo; la etiqueta de fonía va en su propia línea
R('<span class="c">${nw?"★ ":"✔ "}${CS(d.call)}</span>', '<span class="c">${nw?"★\\u00a0":"✔\\u00a0"}${CS(d.call)}</span>')
R("${MOD()===\"ssb\"&&d.ssb===false?' <span class=\"tag\">fonía sin confirmar</span>':\"\"}", "${MOD()===\"ssb\"&&d.ssb===false?'<br><span class=\"tag\">fonía sin confirmar</span>':\"\"}")
# 2.1.9: todos los indicativos con su bandera, también en «Qué hacer» y en las etiquetas; sin repetir el nombre de la entidad
R('busca a <b>${esc(x.s.call)}</b>', 'busca a <b>${CS(x.s.call)}</b>')
R('Multiplicador en el clúster: <b>${esc(goNow[0].s.call)}</b>', 'Multiplicador en el clúster: <b>${CS(goNow[0].s.call)}</b>')
R('DXpedición al alcance: <b>${CS(x.d.call)}</b> (${esc(x.d.ent)})', 'DXpedición al alcance: <b>${CS(x.d.call)}</b>${(()=>{const e=callEnt(x.d.call),n=String(x.d.ent||"").trim(),k=e&&e.name?e.name:"";if(!n||n.toLowerCase()===k.toLowerCase())return "";if(k&&n.toLowerCase().startsWith(k.toLowerCase())){const r=n.slice(k.length).trim();return /^\\(.+\\)$/.test(r)?" "+esc(r):""}return " ("+esc(n)+")"})()}')
R('<span class="tag dx">★ ${esc(d.map(x=>x.call).join(", "))}</span>', '<span class="tag dx">★ ${d.map(x=>CSF(x.call)).join(", ")}</span>')
# 2.1.10: actividad cercana con el modo junto a la frecuencia, como en el clúster; «ahora» en vez de «hace 0 min»
R('return `<div class="sp ${a>60?"old":""}"><span class="f" style="color:${BC[s.band]}">${esc(s.f)}</span>', 'return `<div class="sp ${a>60?"old":""}"><span class="f" style="color:${BC[s.band]}">${esc(s.f)}${s.mode&&window.ACRACB_mb?" "+ACRACB_mb(s.mode):""}</span>')
R('<b>${BANDS[s.band]||""}</b>${s.mode?" "+(window.ACRACB_mb?ACRACB_mb(s.mode):esc(s.mode)):""}</span></div>`}).join("")', '<b>${BANDS[s.band]||""}</b>${s.mode&&!window.ACRACB_mb?" "+esc(s.mode):""}</span></div>`}).join("")')
R('const ageTxt=a=>a==null?"":a<90?', 'const ageTxt=a=>a==null?"":a<1?"ahora":a<90?')
# 2.1.19: círculos VOACAP más pequeños (4–10 px en vez de 6–15) para que no se amontonen; el porcentaje, desde el 50 %
R('const on=d.p>=.05,r=on?6+d.p*9:4;', 'const on=d.p>=.05,r=on?4+d.p*6:3;')
R('if(d.p>=.15&&r>=9)g.append("text").attr("class","ml")', 'if(d.p>=.5&&r>=7)g.append("text").attr("class","ml")')
R('.attr("stroke-width",.8+d.p*4).attr("stroke-opacity",.2+d.p*.6)', '.attr("stroke-width",.6+d.p*2.2).attr("stroke-opacity",.25+d.p*.5)')
R('.attr("filter",d.p>=.6&&RANK.get(d.t.id)<10?"url(#glow)":null).attr("d",path({type:"LineString",coordinates:coords}));', '.attr("d",path({type:"LineString",coordinates:coords}));')
R('.attr("filter",d.p>=.6&&RANK.get(d.t.id)<10?"url(#glow)":null).attr("tabindex",0)', '.attr("filter",d.p>=.6&&RANK.get(d.t.id)<3?"url(#glow)":null).attr("tabindex",0)')
# 2.1.20: «Caminos» y «Saltos» se dibujan aunque «Predicción VOACAP» (los círculos) esté apagada
R('const data=st.mapOn&&st.ly.voa?TG()', 'const data=st.mapOn&&(st.ly.voa||st.ly.arcs||st.ly.hops)?TG()')
R('{const o=$("mopts");if(o)o.classList.toggle("off",!(st.mapOn&&st.ly.voa))}', '{const o=$("mopts");if(o)o.classList.toggle("off",!(st.mapOn&&(st.ly.voa||st.ly.arcs||st.ly.hops)))}')
R('h.hidden=!!(st.mapOn&&(st.ly.voa||st.ly.spots||st.ly.bcn||st.ly.dxp))', 'h.hidden=!!(st.mapOn&&(st.ly.voa||st.ly.arcs||st.ly.hops||st.ly.spots||st.ly.bcn||st.ly.dxp))')
# 2.1.19: «Saltos» funciona también sin «Caminos» (antes solo se dibujaban si los caminos estaban encendidos)
R('if(st.ly.voa&&st.ly.arcs)data.filter(d=>d.p>=.15', 'if(st.ly.arcs||st.ly.hops)data.filter(d=>d.p>=.15')
R('    arcs.append("path").attr("class",d.lp?"lparc":"arc")', '    if(st.ly.arcs)arcs.append("path").attr("class",d.lp?"lparc":"arc")')
# 2.2.0: pestaña «Satélites» en DX
R('<div class="dxl dxlw" id="dxl"></div></details>', '<div class="dxl dxlw" id="dxl"></div></details>\n    <details class="card fold" id="f_sat" data-tab="Satélites"><summary><h2>Satélites de aficionado</h2></summary><div id="sats"></div></details>')
common_js = open(os.path.join(W, "common.js"), encoding="utf-8").read()
common_js += "\n" + open(os.path.join(W, "extras.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "logview.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "lang.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "cluster.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "hscroll.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "eqcards.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "sats.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "greyline.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "esporadica.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "stmore.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "iss.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "tlhelp.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "map50.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "mapfs.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "solsum.js"), encoding="utf-8").read() + "\n" + open(os.path.join(W, "mapfast.js"), encoding="utf-8").read()
i = s.rfind("</script>") + len("</script>")
s = s[:i] + "\n<script>\n" + common_js + "\n</script>\n" + s[i:]
# datos más recientes
seed = os.path.join(SP, "live_seed.json")
if os.path.exists(seed):
    j = open(seed, encoding="utf-8").read(); json.loads(j)
    a = s.find('<script id="live" type="application/json">') + len('<script id="live" type="application/json">')
    b = s.find("</script>", a); s = s[:a] + j.replace("</", "<\\/") + s[b:]
ART_JS = """<script>
/* En el Artifact no se lanza ninguna actualización: así no se gasta nada de la cuenta de Claude. */
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("#updbtn,#updcl");if(!b||!(window.claude&&window.claude.use))return;
 e.preventDefault();e.stopImmediatePropagation();var st=document.getElementById("updst");if(st){st.hidden=false;st.className="note updst-err";
 st.textContent="Esta copia ya no se actualiza para no gastar nada de la cuenta de Claude. Los datos al momento están en la versión web (archivo HTML): pulsa Actualizar allí."}},true);
</script>
"""
s = s.replace('(window.ACRACB_goals?ACRACB_goals():"")', '(window.ACRACB_logview?ACRACB_logview():"")+(window.ACRACB_goals?ACRACB_goals():"")', 1)
assert "ACRACB_logview()" in s
s_art = s.replace("la ionosfera calculada es la del este de España; la previsión pierde precisión.`", "la ionosfera calculada es la del este de España; la previsión pierde precisión. La versión web (ea5jnf.github.io/plataforma-dx) calcula VOACAP para tu zona.`", 1)
assert s_art != s
art = s_art.replace("</script>\n<script>\n" + common_js, "</script>\n" + ART_JS + "<script>\n" + common_js, 1)
assert ART_JS in art

# ---------------- versión web autónoma ----------------
import datetime as _dt
VER = open(os.path.join(W, "VERSION")).read().strip() + " · " + (_dt.datetime.now(_dt.timezone.utc) + _dt.timedelta(hours=1)).strftime("%d/%m/%Y")
w = s.replace("Se revisan solo cuando pulsas Actualizar.", "Se revisan en cada actualización automática y al pulsar Actualizar. Solo te llegan, aquí, en la portada y en las notificaciones, los del modo y las bandas que elijas abajo.").replace("Se revisan solo cuando se pulsa Actualizar.", "Se revisan en cada actualización automática y al pulsar Actualizar. Solo te llegan, aquí, en la portada y en las notificaciones, los del modo y las bandas que elijas abajo.")
import hubbuild
HUBS_JSON = os.path.join(SP, "ext", "hubs.json")
if os.path.exists(HUBS_JSON):
    w = hubbuild.apply(w, HUBS_JSON)
w = w.replace("textos y código sin permiso escrito del club.<br>", "textos y código sin permiso escrito del club.<br><b>Versión " + VER + "</b><br>", 1)
w = w.replace("Prohibida su copia, reproducción o adaptación sin permiso escrito del club.", "Prohibida su copia, reproducción o adaptación sin permiso escrito del club. Versión " + VER + ".", 1)
# 2.5.0: nota de privacidad en el pie
assert 'Fuentes y agradecimientos</button></p>' in w
w = w.replace('Fuentes y agradecimientos</button></p>', 'Fuentes y agradecimientos</button></p><p class="privn">Privacidad: sin registro, sin cookies y sin seguimiento. Tus ajustes y tu log ADIF se guardan solo en este dispositivo y no se envían a ningún sitio.</p>', 1)
# 2.5.3: explicación del equilibrio VOACAP + clústeres en Método
_mt = '<details class="mdet"><summary>VOACAP real</summary>'
assert _mt in w
w = w.replace(_mt, '<details class="mdet"><summary>Equilibrio con los clústeres</summary><p>Cada probabilidad de la hora actual se equilibra con lo que dicen los clústeres en ese momento. Cuentan los spots de los últimos 45 minutos en esa banda hacia ese destino o su zona, según lo que se parece el trayecto del que los oye al tuyo: misma zona de rebote en la ionosfera y distancia parecida. Pesan más si son recientes, traen buena señal y son del mismo modo que el tuyo: un spot de FT8 prueba menos para la SSB, porque pasa con mucha menos señal. Con el camino confirmado, la cifra se acerca a lo que permite la señal, del 35 al 85 %. Una hora antes o después cuenta la mitad y a partir de dos horas manda solo la previsión. Si a ti te han oído cerca de esa estación, sube aún más. Todas las cifras de la plataforma usan esta misma medida, salvo la capa «Predicción VOACAP» del mapa, que enseña la previsión de VOACAP sola. Sin spots parecidos manda VOACAP, salvo un caso: si desde tu zona se está oyendo mucho DX en esa banda y nadie oye nada de un destino donde normalmente hay actividad, la cifra baja con prudencia, como mucho a la mitad, porque esa dirección probablemente está cerrada.</p></details>\n        ' + _mt, 1)
# 2.5.9: «Todos los modos» junto al modo de la estación (el modo elegido sigue siendo la base de la previsión)
_i = w.index('<select id="modesel"'); _j = w.index('</select></span>', _i) + len('</select>')
w = w[:_j] + '<label class="allm" title="El clúster, los avisos y «Qué hacer» muestran todos los modos; la previsión se calcula en tu modo">' + '<input type="checkbox" id="allmodes"> Todos los modos</label>' + w[_j:]
_i = art.index('<select id="modesel"'); _j = art.index('</select></span>', _i) + len('</select>')
art = art[:_j] + '<label class="allm" title="El clúster, los avisos y «Qué hacer» muestran todos los modos; la previsión se calcula en tu modo">' + '<input type="checkbox" id="allmodes"> Todos los modos</label>' + art[_j:]
def assemble(w, upd, LANG, TITLE):
    global man
    NM = os.path.join(SP, "pub", "node_modules")
    for src, path in (("https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js", "d3/dist/d3.min.js"),
                      ("https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js", "topojson-client/dist/topojson-client.min.js"),
                      ("https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js", "fflate/umd/index.js")):
        tag = '<script src="%s"></script>' % src
        assert tag in w, src
        w = w.replace(tag, "<script>/* biblioteca incluida para funcionar sin conexión */\n" + open(os.path.join(NM, path), encoding="utf-8").read().replace("</script", "<\\/script") + "\n</script>", 1)
    i = w.rfind("</script>") + len("</script>")
    w = w[:i] + "\n<script>\n" + upd + "\n</script>\n" + w[i:]
    # VOACAP de los 12 meses dentro del archivo
    voa_dir = os.path.join(SP, "voa")
    blocks = []
    for m in range(1, 13):
        p = os.path.join(voa_dir, "m%02d.json" % m)
        blocks.append('<script id="voa-m%02d" type="application/json">%s</script>' % (m, open(p, encoding="utf-8").read().strip()))
    w = w.replace('MLOAD[m]=fetch(`voa/m${String(m).padStart(2,"0")}.json`).then(r=>r.ok?r.json():null)',
                  'MLOAD[m]=(document.getElementById("voa-m"+String(m).padStart(2,"0"))?Promise.resolve(JSON.parse(document.getElementById("voa-m"+String(m).padStart(2,"0")).textContent)):fetch(`voa/m${String(m).padStart(2,"0")}.json`).then(r=>r.ok?r.json():null))', 1)
    assert 'document.getElementById("voa-m"' in w
    # los 12 meses van en archivos aparte (voa/mXX.json) y solo se descargan cuando hacen falta: la página pesa 4 veces menos
    OUTV = os.path.join(W, "out", "voa"); os.makedirs(OUTV, exist_ok=True)
    for m in range(1, 13):
        open(os.path.join(OUTV, "m%02d.json" % m), "w", encoding="utf-8").write(open(os.path.join(voa_dir, "m%02d.json" % m), encoding="utf-8").read().strip())
    # manifiesto para Android/escritorio (iPhone/iPad usan apple-touch-icon)
    man = {"name": "ACRACB - Plataforma DX", "short_name": "ACRACB DX", "display": "standalone", "background_color": "#0a0e13", "theme_color": "#0a0e13",
           "start_url": ".", "icons": [{"src": "data:image/png;base64," + png(192), "sizes": "192x192", "type": "image/png"},
                                       {"src": "data:image/png;base64," + png(512), "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]}
    w = w.replace(head_meta, head_meta + '<link rel="manifest" href="data:application/manifest+json;base64,%s">\n<link rel="icon" type="image/png" sizes="192x192" href="data:image/png;base64,%s">\n'
                  % (base64.b64encode(json.dumps(man).encode()).decode(), png(192)), 1)
    doc = ('<!doctype html>\n<html lang="' + LANG + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
           '<style>html,body{margin:0;padding:0;background:#0a0e13}body{padding-top:env(safe-area-inset-top,0px);padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html.pwa body{padding-top:calc(env(safe-area-inset-top,0px) + 22px)}html.pwa body::before{height:calc(env(safe-area-inset-top,0px) + 8px)!important}html[data-theme=light],html[data-theme=light] body{background:#f3f5f8}</style>\n'
           '<script>try{document.documentElement.setAttribute("data-theme",localStorage.getItem("acracb_theme")||"dark")}catch(e){}try{if(navigator.standalone||matchMedia("(display-mode: standalone)").matches)document.documentElement.classList.add("pwa")}catch(e){}try{var w=innerWidth,u=+localStorage.getItem("acracb_zoom")||1,z=Math.round((w>2100?Math.max(1,Math.min(w/1920,innerHeight/900)):1)*u*100)/100;if(z>1){document.documentElement.classList.add("bigz");document.documentElement.style.zoom=z}}catch(e){}</script>\n</head>\n<body>\n')
    heads = []
    heads.append('<title>%s</title>' % TITLE); w = w.replace('<title>%s</title>' % TITLE, '', 1)
    for pat in (r'<link rel="apple-touch-icon"[^>]*>', r'<link rel="icon"[^>]*>', r'<link rel="manifest"[^>]*>', r'<meta name="(?:apple-mobile-web-app-capable|mobile-web-app-capable|apple-mobile-web-app-status-bar-style|apple-mobile-web-app-title|application-name|theme-color)"[^>]*>'):
        for m in list(re.finditer(pat, w)):
            heads.append(m.group(0))
        w = re.sub(pat, "", w)
    doc = doc.replace("</head>", "\n".join(dict.fromkeys(heads)) + "\n</head>")
    w = doc + w + "\n</body>\n</html>\n"

    return w

upd = open(os.path.join(W, "updater.js"), encoding="utf-8").read()
w_es = assemble(w, upd, "es", "ACRACB - Plataforma DX")
w_es = w_es.replace('<head>\n<meta charset="utf-8">', '<head>\n<meta charset="utf-8">\n<script>try{if(localStorage.getItem("acracb_lang")==="en"&&!/[?&]es\\b/.test(location.search))location.replace("en.html"+location.hash)}catch(e){}</script>', 1)
assert 'location.replace("en.html"' in w_es
sys.path.insert(0, os.path.join(SP, "i18n"))
import apply as I18N
w_en_src, n1 = I18N.translate(w.replace(hubbuild.P_ES, hubbuild.P_EN))
upd_en, n2 = I18N.translate(upd)
def en_fix(c):
    c = c.replace('"es-ES"', '"en-US"').replace('Intl.DisplayNames(["es"]', 'Intl.DisplayNames(["en"]').replace(',"es")', ',"en")')
    c = c.replace('.replace(".",",")', '')
    c = c.replace('["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]', '["January","February","March","April","May","June","July","August","September","October","November","December"]')
    c = c.replace('["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]', '["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]')
    c = c.replace('["domingo","lunes","martes","Wednesday","jueves","viernes","Saturday"]', '["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]')
    c = c.replace('"acracb_live_v2"', '"acracb_live_v2_en"')
    for pat, rep in json.load(open(os.path.join(SP, "i18n", "en_re.json"), encoding="utf-8")):
        c = re.sub(pat, rep, c)
    return c
def en_data(c):
    """Nombres en inglés dentro de los datos: destinos VOACAP, etiquetas del mapa y entidades."""
    import gzip
    def block(idn):
        m = re.search(r'(<script id="%s" type="application/json">)(.*?)(</script>)' % idn, c, re.S)
        return m
    dm = block("dxccdata"); D = json.loads(gzip.decompress(base64.b64decode(json.loads(dm.group(2))["z"])))
    byd = {k: v[1] for k, v in D["d"].items()}; bycc = {}
    for k, v in D["d"].items():
        if v[0] and v[0] not in bycc: bycc[v[0]] = v[1]
    REG = {"Canadá este (VE1-3)":"Eastern Canada (VE1-3)","Canadá oeste (VE7)":"Western Canada (VE7)","Rusia asiática centro (UA9)":"Central Asiatic Russia (UA9)","Rusia asiática este (UA0)":"Eastern Asiatic Russia (UA0)",
      "Brasil sureste (PY)":"Southeastern Brazil (PY)","Brasil nordeste (PY7)":"Northeastern Brazil (PY7)","Australia oeste (VK6)":"Western Australia (VK6)","Australia norte (VK8)":"Northern Australia (VK8)","Australia este (VK2-4)":"Eastern Australia (VK2-4)",
      "EE. UU. noreste (W1/W2)":"Northeastern USA (W1/W2)","EE. UU. sureste (W4)":"Southeastern USA (W4)","EE. UU. centro (W9/W0)":"Central USA (W9/W0)","EE. UU. sur (W5)":"Southern USA (W5)","EE. UU. oeste (W6/W7)":"Western USA (W6/W7)"}
    vm = block("voa"); V = json.loads(vm.group(2))
    for m in V["meta"]:
        if m[1] in REG: m[1] = REG[m[1]]; continue
        p = re.search(r"\(([^)]*)\)\s*$", m[1]); n = byd.get(str(m[2]))
        if n: m[1] = n + (" (%s)" % p.group(1) if p else "")
    c = c[:vm.start(2)] + json.dumps(V, ensure_ascii=False, separators=(",", ":")) + c[vm.end(2):]
    gm = block("geolbl"); G = json.loads(gm.group(2))
    for r in G.get("c", []):
        if r[4] in bycc: r[0] = bycc[r[4]]
    for r in G.get("e", []):
        dx = D["p"].get(r[0].split("/")[0]) if isinstance(D.get("p"), dict) else None
        if dx is not None and str(dx) in byd: r[1] = byd[str(dx)]
    c = c[:gm.start(2)] + json.dumps(G, ensure_ascii=False, separators=(",", ":")) + c[gm.end(2):]
    return c
w_en_src = en_data(en_fix(w_en_src)).replace("<script>\n/* ---- ACRACB: tema", '<script>window.ACRACB_LANG="en"</script>\n<script>\n/* ---- ACRACB: tema', 1)
assert 'window.ACRACB_LANG="en"' in w_en_src
w_en = assemble(w_en_src, en_fix(upd_en), "en", "ACRACB - DX Platform")

def webify(c, lang):
    """Web: bibliotecas, iconos y manifiesto como archivos aparte (el navegador los guarda y no se vuelven a descargar)."""
    import hashlib
    OUT = os.path.join(W, "out"); os.makedirs(os.path.join(OUT, "lib"), exist_ok=True)
    NM = os.path.join(SP, "pub", "node_modules")
    for name, path in (("d3-7.8.5.min.js", "d3/dist/d3.min.js"), ("topojson-client-3.1.0.min.js", "topojson-client/dist/topojson-client.min.js"), ("fflate-0.8.2.js", "fflate/umd/index.js")):
        src = open(os.path.join(NM, path), encoding="utf-8").read()
        inl = "<script>/* biblioteca incluida para funcionar sin conexión */\n" + src.replace("</script", "<\\/script") + "\n</script>"
        assert c.count(inl) == 1, name
        c = c.replace(inl, '<script src="lib/%s"></script>' % name)
        open(os.path.join(OUT, "lib", name), "w", encoding="utf-8").write(src)
    def pngf(sz):
        p = "icon-%d.png" % sz; open(os.path.join(OUT, p), "wb").write(base64.b64decode(png(sz))); return p
    c = re.sub(r'(<link rel="apple-touch-icon" sizes="180x180" href=")data:image/png;base64,[^"]+', lambda m: m.group(1) + pngf(180), c, count=1)
    c = re.sub(r'(<link rel="icon" type="image/png" sizes="192x192" href=")data:image/png;base64,[^"]+', lambda m: m.group(1) + pngf(192), c, count=1)
    c = re.sub(r'(<link rel="icon" type="image/png" href=")data:image/png;base64,[^"]+', lambda m: m.group(1) + "icon-192.png", c)
    mf = dict(man); mf["icons"] = [{"src": pngf(192), "sizes": "192x192", "type": "image/png"}, {"src": pngf(512), "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]
    mfn = "manifest.webmanifest" if lang == "es" else "manifest-en.webmanifest"
    if lang == "en": mf["name"] = "ACRACB - DX Platform"; mf["start_url"] = "en.html"
    mf["lang"] = lang
    open(os.path.join(OUT, mfn), "w", encoding="utf-8").write(json.dumps(mf, ensure_ascii=False))
    c = re.sub(r'<link rel="manifest" href="data:[^"]+">', '<link rel="manifest" href="%s">' % mfn, c, count=1)
    # la fuente no bloquea el primer dibujo de la página (con 3G se ve antes el texto con la fuente del sistema)
    # 2.5.4: las tipografías se sirven desde la propia web (sin pedir nada a Google: más rápido, sin conexión y sin rastro)
    UR = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
    FF = [('Saira Condensed', 'saira-condensed', (500, 600, 700)), ('IBM Plex Sans', 'ibm-plex-sans', (400, 500, 600)), ('IBM Plex Mono', 'ibm-plex-mono', (400, 500, 600))]
    faces = "".join("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;src:url(fonts/%s-latin-%d-normal.woff2) format('woff2');unicode-range:%s}" % (fam, wt, fn, wt, UR) for fam, fn, ws in FF for wt in ws)
    pre = '<link rel="preload" href="fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="fonts/ibm-plex-mono-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>'
    c, k = re.subn(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/[^"]+">', lambda m: pre + "<style>" + faces + "</style>", c)
    assert k == 1, k
    import shutil as _sh
    os.makedirs(os.path.join(W, "out", "fonts"), exist_ok=True)
    for fam, fn, ws in FF:
        for wt in ws:
            _sh.copy(os.path.join(SP, "ext", "fonts", "%s-latin-%d-normal.woff2" % (fn, wt)), os.path.join(W, "out", "fonts"))
    assert "data:image/png;base64" not in c[:c.index("</head>")], "icono incrustado"
    # 2.1.1: el código y los datos grandes que no cambian van en archivos aparte con su huella en el nombre.
    # La página (que se pide siempre a la red) pasa de ~345 kB a ~70 kB comprimidos; lo demás queda guardado en el dispositivo.
    def ext(body, stem):
        h = hashlib.sha256(body.encode("utf-8")).hexdigest()[:10]; fn = "lib/%s-%s.js" % (stem, h)
        open(os.path.join(OUT, fn), "w", encoding="utf-8").write(body); return fn
    satsrc = open(os.path.join(NM, "satellite.js/dist/satellite.min.js"), encoding="utf-8").read()
    open(os.path.join(OUT, "lib", "satellite-5.0.0.min.js"), "w", encoding="utf-8").write(satsrc)
    k0 = c.index('<script src="lib/d3-7.8.5.min.js"></script>')
    c = c[:k0] + '<script src="lib/satellite-5.0.0.min.js"></script>' + c[k0:]
    # 2.3.4: mapa detallado (1:50 millones) para cuando se amplía; se descarga solo al pasar de 2 aumentos
    w50 = json.dumps(json.load(open(os.path.join(SP, "ext", "countries-50m.json"))), separators=(",", ":"))
    w50fn = ext("window.ACRACB_W50=%s;\n" % w50, "world50")
    for did in ("world", "dxccdata", "geolbl"):
        m = re.search(r'<script id="%s" type="application/json">(.*?)</script>' % did, c, re.S)
        assert m, did
        txt = m.group(1).replace("<\\/", "</")
        fn = ext('(function(){var e=document.getElementById("%s");if(e)e.textContent=%s})();\n' % (did, json.dumps(txt, ensure_ascii=False)) + ('window.ACRACB_W50URL="%s";\n' % w50fn if did == "world" else ""), did + ('-' + lang if did == 'geolbl' else ''))
        c = c[:m.start()] + '<script id="%s" type="application/json"></script><script src="%s"></script>' % (did, fn) + c[m.end():]
    out = []; last = 0; napp = 0
    for m in re.finditer(r'<script>(.*?)</script>', c, re.S):
        if len(m.group(1)) < 8000: continue
        if "ACRACB_HUBLIST" in m.group(1)[:40]: stem = "hubs-" + lang
        else: napp += 1; stem = "app%d-%s" % (napp, lang)
        out.append(c[last:m.start()]); out.append('<script src="%s"></script>' % ext(m.group(1), stem)); last = m.end()
    out.append(c[last:]); c = "".join(out)
    # 2.1.2: política de seguridad de contenidos (CSP). Solo se ejecuta el código propio de la web (archivos de lib/ y los
    # pequeños bloques de la cabecera, identificados por su huella). Un texto malicioso que llegara de un clúster no podría ejecutarse.
    # 2.5.4: ya no hay hoja de Google Fonts que activar
    assert not re.search(r'\son[a-z]+="', c[:c.index("<body")] if "<body" in c else c[:5000]), "manejador en línea en la cabecera"
    hs = []
    for m in re.finditer(r'<script>(.*?)</script>', c, re.S):
        hs.append("'sha256-%s'" % base64.b64encode(hashlib.sha256(m.group(1).encode("utf-8")).digest()).decode())
    csp = ("default-src 'self'; script-src 'self' %s; style-src 'self' 'unsafe-inline'; "
           "font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' https:; "
           "worker-src 'self'; manifest-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'") % " ".join(dict.fromkeys(hs))
    c = c.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="%s">\n<meta name="referrer" content="strict-origin-when-cross-origin">' % csp, 1)
    assert "Content-Security-Policy" in c
    # con CSP el navegador deja de adelantar las descargas: se le indican todos los archivos de código desde la cabecera
    pre = "".join('<link rel="preload" href="%s" as="script">' % x for x in dict.fromkeys(re.findall(r'<script src="(lib/[^"]+)"></script>', c)))
    c = c.replace("</head>", pre + "\n</head>", 1)
    return c
import glob as _g
for _f in _g.glob(os.path.join(W, "out", "lib", "*-" + "[0-9a-f]" * 10 + ".js")): os.remove(_f)
w_es = webify(w_es, "es"); w_en = webify(w_en, "en")
import shutil; shutil.copy(os.path.join(W, "sw.js"), os.path.join(W, "out", "sw.js"))
print("traducciones", n1, n2)
os.makedirs(os.path.join(W, "out"), exist_ok=True)
open(os.path.join(W, "out", "artifact.html"), "w", encoding="utf-8").write(art)
open(os.path.join(W, "out", "index.html"), "w", encoding="utf-8").write(w_es)
open(os.path.join(W, "out", "en.html"), "w", encoding="utf-8").write(w_en)
import subprocess as _sp
_sp.run(["node", os.path.join(W, "minify.js"), os.path.join(W, "out", "lib")], check=True)
print("artifact", len(art), "web", len(w_es), "en", len(w_en))
