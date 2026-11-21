# Genera licencias/index.html (español e inglés) con la lista de elementos de terceros y sus licencias
import html,os
R=[("D3.js 7 (partes: geo, selección, zoom, transiciones)","Mike Bostock","ISC","d3.txt","lib/d3c-*.js"),
("TopoJSON client 3.1.0","Michael Bostock","ISC","topojson-client.txt","lib/topojson-client-3.1.0.min.js"),
("fflate 0.8.2","Arjun Barrett","MIT","fflate.txt","lib/fflate-0.8.2.js"),
("satellite.js 5.0.0","Shashwat Kandadai y colaboradores","MIT","satellite-js.txt","lib/satellite-5.0.0.min.js"),
("world-atlas (mapa de Natural Earth, dominio público)","Michael Bostock","ISC","world-atlas.txt","mapa"),
("world-countries (nombres de países y capitales del mapa)","Mohammed Le Doze","ODbL 1.0","world-countries-ODbL.txt","lib/geolbl-*.js"),
("country-flag-icons (banderas)","catamphetamine","MIT","country-flag-icons.txt","banderas"),
("fast-dxcc (entidades DXCC a partir de cty.dat de AD1C)","Jakob Kordež","MIT","fast-dxcc.txt","lib/dxccdata-*.js"),
("@ham2k/lib-dxcc-data","Sebastian Delmont, KI2D","MIT","ham2k-dxcc-data.txt","lib/dxccdata-*.js"),
("@ham2k/lib-country-files","Sebastian Delmont, KI2D","MIT","ham2k-country-files.txt","lib/dxccdata-*.js"),
("IBM Plex Sans","IBM","SIL Open Font License 1.1","ibm-plex-sans-OFL.txt","fonts/"),
("IBM Plex Mono","IBM","SIL Open Font License 1.1","ibm-plex-mono-OFL.txt","fonts/"),
("Saira Condensed","The Saira Project Authors (Omnibus-Type)","SIL Open Font License 1.1","saira-condensed-OFL.txt","fonts/")]
D=[("SatNOGS DB (estado de satélites y transmisores)","Libre Space Foundation","CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/","datos/satnogs.json: se puede reutilizar bajo la misma licencia"),
("GeoNames (coordenadas de capitales, a través de cities.json)","GeoNames","CC BY 4.0","https://creativecommons.org/licenses/by/4.0/",""),
("GFZ Potsdam (índices Kp y Hp30)","GFZ Helmholtz Centre for Geosciences","CC BY 4.0","https://creativecommons.org/licenses/by/4.0/",""),
("WDC-SILSO (manchas solares)","Royal Observatory of Belgium","CC BY-NC 4.0","https://creativecommons.org/licenses/by-nc/4.0/","uso no comercial, como esta plataforma"),
("VOACAP (voacapl)","NTIA/ITS, dominio público; voacapl de Jim Watson, M0DNS","GPL","https://www.gnu.org/licenses/gpl-3.0.html","solo se publican resultados calculados, no el programa")]
e=html.escape
def rows(en):
  r="".join(f"<tr><td>{e(n)}</td><td>{e(a)}</td><td>{e(l)}</td><td><a href=\"{f}\">{f}</a></td></tr>" for n,a,l,f,_ in R)
  d="".join(f"<tr><td>{e(n)}</td><td>{e(a)}</td><td><a href=\"{u}\" rel=\"noopener noreferrer\">{e(l)}</a></td><td>{e(x)}</td></tr>" for n,a,l,u,x in D)
  return r,d
r,d=rows(False)
page=f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>Licencias · Plataforma DX ACRACB</title>
<style>body{{font:15px/1.5 system-ui,sans-serif;max-width:980px;margin:24px auto;padding:0 16px;color:#1b2430;background:#fff}}@media (prefers-color-scheme:dark){{body{{color:#e6edf5;background:#0e141c}}a{{color:#8fc3ff}}th,td{{border-color:#2a3644!important}}}}table{{border-collapse:collapse;width:100%;margin:8px 0 18px}}th,td{{border:1px solid #d5dce4;padding:6px 8px;text-align:left;vertical-align:top}}th{{font-weight:600}}h1{{font-size:1.4rem}}h2{{font-size:1.1rem;margin-top:28px}}.n{{opacity:.8;font-size:.92rem}}</style></head><body>
<h1>Licencias de terceros · Third-party licenses</h1>
<p>El diseño, los textos y el código propios de la Plataforma DX de ACRACB (EA5RKB) son de Alfredo, EA5JNF, con todos los derechos reservados. Los elementos de esta página no lo son: siguen bajo su propia licencia, cuyo texto completo se enlaza, y se pueden reutilizar en sus términos.</p>
<h2>Programas, letras y datos incluidos en la web</h2>
<table><tr><th>Elemento</th><th>Autor</th><th>Licencia</th><th>Texto completo</th></tr>{r}</table>
<h2>Datos de terceros con licencia abierta</h2>
<table><tr><th>Fuente</th><th>Titular</th><th>Licencia</th><th>Nota</th></tr>{d}</table>
<p class="n">El resto de fuentes (NOAA, NASA, BOM, KC2G, HamQSL, clústeres DX, POTA, SOTA, WWFF, NG3K, Club Log, LoTW, eQSL…) se citan en «Fuentes y agradecimientos» y sus datos son de sus titulares.</p>
<h2 id="en">English</h2>
<p>The own design, texts and code of the ACRACB (EA5RKB) DX Platform belong to Alfredo, EA5JNF, with all rights reserved. The items on this page do not: they remain under their own license, whose full text is linked above, and may be reused on its terms. Data under open licenses: SatNOGS DB (CC BY-SA 4.0, the copy in datos/satnogs.json may be reused under the same license), GeoNames and GFZ (CC BY 4.0), WDC-SILSO (CC BY-NC 4.0, non-commercial use) and VOACAP (public domain; voacapl under GPL, only computed results are published). Other sources are listed in “Sources and thanks”; their data belongs to their owners.</p>
</body></html>"""
o=os.path.join(os.path.dirname(__file__),"index.html");open(o,"w",encoding="utf-8").write(page)
