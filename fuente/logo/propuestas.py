import math
F='font-family="Saira Condensed" font-weight="700"'
M='font-family="IBM Plex Mono" font-weight="600"'
def hops(x0,y0,pts,stroke,w=10,glow=None):
    d="M%d %d "%(x0,y0)+" ".join("L%d %d"%p for p in pts)
    g=f'<path d="{d}" fill="none" stroke="{glow}" stroke-width="{w*2.6}" stroke-linejoin="round" stroke-linecap="round" opacity=".28"/>' if glow else ""
    return g+f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"/>'
def tower(x,y,c,s=1):
    # torre con yagi
    return f'''<g transform="translate({x} {y}) scale({s})" stroke="{c}" stroke-width="6" stroke-linecap="round" fill="none">
<path d="M0 0 L-16 80 M0 0 L16 80 M-12 60 L12 60 M-8 40 L8 40 M-5 20 L5 20 M-12 60 L8 40 M12 60 L-8 40"/>
<path d="M-34 -6 L34 -6"/><path d="M-26 -22 L-26 10 M-9 -22 L-9 10 M8 -22 L8 10 M25 -22 L25 10"/></g>'''
D={}
# 1 Original refinado: atardecer (actual) pero más limpio
D["1 · Atardecer (el actual, más limpio)"]=f'''<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1458"/><stop offset=".55" stop-color="#8e2a7a"/><stop offset="1" stop-color="#ff8a4c"/></linearGradient>
<radialGradient id="s1" cx=".5" cy=".78" r=".45"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
<rect width="512" height="512" fill="url(#g1)"/><circle cx="256" cy="400" r="230" fill="url(#s1)"/>
<path d="M-40 420 Q256 300 552 420 L552 520 L-40 520Z" fill="#160d2e"/>
{hops(120,330,[(175,250),(240,355),(305,245),(370,350),(430,262),(480,380)],"#fff",9,"#fff")}
{tower(100,318,"#ffe3b0",.85)}
<text x="256" y="112" text-anchor="middle" {F} font-size="86" fill="#fff" letter-spacing="2">ACRACB</text>
<text x="256" y="210" text-anchor="middle" {F} font-size="104" fill="#ffc35a">DX</text>'''
# 2 Consola ámbar (colores de la plataforma)
D["2 · Consola ámbar (colores de la plataforma)"]=f'''<defs><radialGradient id="g2" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#1a2533"/><stop offset="1" stop-color="#0a0e13"/></radialGradient></defs>
<rect width="512" height="512" fill="url(#g2)"/>
<g fill="none" stroke="#2c3d52" stroke-width="3"><circle cx="256" cy="300" r="80"/><circle cx="256" cy="300" r="150"/><circle cx="256" cy="300" r="220" stroke-dasharray="10 12"/></g>
<g stroke="#2c3d52" stroke-width="3"><path d="M256 80 L256 520 M36 300 L476 300 M100 144 L412 456 M412 144 L100 456"/></g>
<g fill="none" stroke-linecap="round"><path d="M256 300 Q330 170 430 160" stroke="#f0a83a" stroke-width="22" opacity=".25"/><path d="M256 300 Q330 170 430 160" stroke="#f0a83a" stroke-width="10"/><path d="M256 300 Q170 220 80 250" stroke="#3fb6c8" stroke-width="9"/><path d="M256 300 Q300 400 390 430" stroke="#a3e635" stroke-width="8"/></g><circle cx="430" cy="160" r="12" fill="#f0a83a"/><circle cx="80" cy="250" r="10" fill="#3fb6c8"/><circle cx="390" cy="430" r="9" fill="#a3e635"/><circle cx="256" cy="300" r="16" fill="#f0a83a"/>
<text x="256" y="118" text-anchor="middle" {M} font-size="44" fill="#9aabbd" letter-spacing="10">ACRACB</text>
<text x="256" y="470" text-anchor="middle" {F} font-size="120" fill="#f0a83a">DX</text>'''
# 3 Globo azimutal azul
gl=[]
for r in (60,120,180):gl.append(f'<circle cx="256" cy="256" r="{r}"/>')
for a in range(0,180,30):
    x=math.cos(math.radians(a))*200;y=math.sin(math.radians(a))*200;gl.append(f'<path d="M{256-x:.0f} {256-y:.0f} L{256+x:.0f} {256+y:.0f}"/>')
D["3 · Globo azimutal (azul)"]=f'''<defs><radialGradient id="g3" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#123a63"/><stop offset="1" stop-color="#06142a"/></radialGradient>
<clipPath id="c3"><circle cx="256" cy="256" r="200"/></clipPath></defs>
<rect width="512" height="512" fill="#04101f"/><circle cx="256" cy="256" r="200" fill="url(#g3)" stroke="#5fd3ff" stroke-width="6"/>
<g clip-path="url(#c3)" fill="none" stroke="#2b6a9b" stroke-width="3">{''.join(gl)}</g>
<g clip-path="url(#c3)" fill="none" stroke-width="9" stroke-linecap="round"><path d="M256 256 Q330 150 400 120" stroke="#2dd4bf"/><path d="M256 256 Q170 300 120 390" stroke="#a3e635"/><path d="M256 256 Q340 330 360 430" stroke="#f0a83a"/></g>
<circle cx="256" cy="256" r="18" fill="#fff"/>
<rect x="150" y="196" width="212" height="120" rx="18" fill="#04101f" opacity=".72"/>
<text x="256" y="300" text-anchor="middle" {F} font-size="120" fill="#fff">DX</text>
<text x="256" y="490" text-anchor="middle" {M} font-size="34" fill="#5fd3ff" letter-spacing="8">ACRACB</text>'''
# 4 Aurora verde
D["4 · Aurora (verde y turquesa)"]=f'''<defs><linearGradient id="g4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03141a"/><stop offset="1" stop-color="#0b3b3a"/></linearGradient>
<linearGradient id="a4" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#22c55e" stop-opacity="0"/><stop offset=".5" stop-color="#5eead4" stop-opacity=".75"/><stop offset="1" stop-color="#a3e635" stop-opacity="0"/></linearGradient></defs>
<rect width="512" height="512" fill="url(#g4)"/>
<path d="M-20 180 C120 120 220 230 300 170 S460 130 540 190" stroke="url(#a4)" stroke-width="44" fill="none" opacity=".55"/>
<path d="M-20 225 C140 175 230 270 330 215 S470 190 540 240" stroke="url(#a4)" stroke-width="22" fill="none" opacity=".45"/>
<path d="M-40 430 Q256 330 552 430 L552 520 L-40 520Z" fill="#021013"/>
{hops(118,368,[(185,282),(250,385),(318,280),(385,380),(445,300)],"#e7fff9",9,"#5eead4")}
{tower(100,356,"#bff7ea",.8)}
<text x="256" y="104" text-anchor="middle" {F} font-size="80" fill="#e7fff9" letter-spacing="2">ACRACB</text>
<text x="420" y="480" text-anchor="middle" {F} font-size="76" fill="#5eead4">DX</text>'''
# 5 Monograma ámbar
D["5 · Monograma DX (se lee bien en pequeño)"]=f'''<rect width="512" height="512" fill="#f0a83a"/>
<text x="256" y="330" text-anchor="middle" {F} font-size="270" fill="#0a0e13" letter-spacing="-4">DX</text>
<path d="M40 300 C110 230 150 370 220 300 S330 230 400 300 S470 330 490 300" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>
<text x="256" y="452" text-anchor="middle" {M} font-size="42" fill="#0a0e13" letter-spacing="12">ACRACB</text>'''
# 6 Ionosfera
D["6 · Ionosfera (capas y rebotes)"]=f'''<defs><linearGradient id="g6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0a24"/><stop offset="1" stop-color="#1b1446"/></linearGradient></defs>
<rect width="512" height="512" fill="url(#g6)"/>
<g fill="none" stroke-width="10" stroke-linecap="round"><path d="M-20 300 Q256 40 532 300" stroke="#7c3aed" opacity=".55"/><path d="M-20 320 Q256 95 532 320" stroke="#c084fc" opacity=".55"/><path d="M-20 340 Q256 150 532 340" stroke="#f0abfc" opacity=".5"/></g>
<path d="M-40 430 Q256 350 552 430 L552 520 L-40 520Z" fill="#070514"/>
{hops(80,410,[(175,250),(256,392),(337,250),(432,410)],"#ffd76a",9,"#ffd76a")}
<circle cx="80" cy="410" r="13" fill="#ffd76a"/><circle cx="432" cy="410" r="13" fill="#ffd76a"/>
<text x="256" y="112" text-anchor="middle" {F} font-size="80" fill="#fff" letter-spacing="2">ACRACB</text>
<text x="256" y="500" text-anchor="middle" {F} font-size="84" fill="#ffd76a">DX</text>'''
# 7 Yagi y ondas
arcs="".join(f'<path d="M{258+i*40} {256-44-i*24} A {60+i*30} {60+i*30} 0 0 1 {258+i*40} {256+44+i*24}" fill="none" stroke="#f0a83a" stroke-width="{12-i*2}" stroke-linecap="round" opacity="{1-i*.22}"/>' for i in range(3))
D["7 · Yagi y ondas (azul marino)"]=f'''<rect width="512" height="512" fill="#0b1a33"/>
<g stroke="#e6ecf2" stroke-width="10" stroke-linecap="round"><path d="M60 256 L230 256"/><path d="M80 186 L80 326 M120 196 L120 316 M160 206 L160 306 M200 214 L200 298"/></g>
{arcs}
<text x="256" y="110" text-anchor="middle" {F} font-size="80" fill="#e6ecf2" letter-spacing="2">ACRACB</text>
<text x="256" y="470" text-anchor="middle" {F} font-size="110" fill="#f0a83a">DX</text>'''
# 8 Atardecer en azul (mismo concepto, otra paleta)
D["8 · Noche azul (el actual en azul)"]=D["1 · Atardecer (el actual, más limpio)"].replace("#2a1458","#06122b").replace("#8e2a7a","#0f3d7a").replace("#ff8a4c","#2aa6d6").replace("#ffd27a","#9be7ff").replace("#160d2e","#030a18").replace("#ffc35a","#5fd3ff").replace("#ffe3b0","#d8f4ff").replace('id="g1"','id="g8"').replace("url(#g1)","url(#g8)").replace('id="s1"','id="s8"').replace("url(#s1)","url(#s8)")
cards=[]
for name,svg in D.items():
    full=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">{svg}</svg>'
    cards.append(f'<figure><div class="big">{full}</div><div class="row"><div class="ios">{full}</div><div class="sm">{full}</div><div class="fav">{full}</div></div><figcaption>{name}</figcaption></figure>')
html=f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Propuestas de logo ACRACB DX</title><style>
@font-face{{font-family:"Saira Condensed";font-weight:700;src:url(saira-condensed-latin-700-normal.woff2)}}
@font-face{{font-family:"IBM Plex Mono";font-weight:600;src:url(ibm-plex-mono-latin-600-normal.woff2)}}
body{{margin:0;padding:40px;background:#e9edf2;font:16px system-ui,sans-serif;color:#16202b}}
h1{{font:700 34px "Saira Condensed";margin:0 0 6px}} p{{margin:0 0 28px;color:#4a5a6c}}
.g{{display:grid;grid-template-columns:repeat(4,300px);gap:28px}}
figure{{margin:0;background:#fff;border-radius:16px;padding:16px;box-shadow:0 2px 10px rgba(0,0,0,.08)}}
.big svg{{width:268px;height:268px;border-radius:58px;display:block}}
.row{{display:flex;gap:14px;align-items:end;margin-top:12px}}
.ios svg{{width:60px;height:60px;border-radius:13px;display:block}}.sm svg{{width:40px;height:40px;border-radius:9px;display:block}}.fav svg{{width:20px;height:20px;border-radius:4px;display:block}}
figcaption{{margin-top:10px;font-weight:600;font-size:15px}}
</style></head><body><h1>Propuestas de logo · ACRACB DX</h1><p>Cada propuesta en grande, como icono de la app en el iPhone (60 px), en pequeño (40 px) y como icono de pestaña (20 px).</p><div class="g">{"".join(cards)}</div></body></html>'''
open("propuestas.html","w").write(html)
