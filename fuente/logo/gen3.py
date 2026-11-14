import math
F='font-family="Saira Condensed" font-weight="700"'
M='font-family="IBM Plex Mono" font-weight="600"'
def globe(cx,cy,R,clip):
    gl=[]
    for r in (R*.3,R*.6,R*.9):gl.append(f'<circle cx="{cx}" cy="{cy}" r="{r:.0f}"/>')
    for a in range(0,180,30):
        x=math.cos(math.radians(a))*R;y=math.sin(math.radians(a))*R;gl.append(f'<path d="M{cx-x:.0f} {cy-y:.0f} L{cx+x:.0f} {cy+y:.0f}"/>')
    s=R/200
    return f'''<defs><radialGradient id="g{clip}" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#123a63"/><stop offset="1" stop-color="#06142a"/></radialGradient><clipPath id="{clip}"><circle cx="{cx}" cy="{cy}" r="{R}"/></clipPath></defs>
<circle cx="{cx}" cy="{cy}" r="{R}" fill="url(#g{clip})" stroke="#5fd3ff" stroke-width="{6*s:.1f}"/>
<g clip-path="url(#{clip})" fill="none" stroke="#2b6a9b" stroke-width="{3*s:.1f}">{''.join(gl)}</g>
<g clip-path="url(#{clip})" fill="none" stroke-width="{9*s:.1f}" stroke-linecap="round" transform="translate({cx-256*s} {cy-256*s}) scale({s})"><path d="M256 256 Q330 150 400 120" stroke="#2dd4bf"/><path d="M256 256 Q170 300 120 390" stroke="#a3e635"/><path d="M256 256 Q340 330 360 430" stroke="#f0a83a"/></g>'''
V={}
# A: ACRACB grande arriba, globo abajo con DX dentro
V["A · ACRACB grande arriba"]=f'''<rect width="512" height="512" fill="#04101f"/>{globe(256,318,168,"cA")}
<rect x="172" y="268" width="168" height="100" rx="16" fill="#04101f" opacity=".75"/>
<text x="256" y="350" text-anchor="middle" {F} font-size="100" fill="#fff">DX</text>
<text x="256" y="122" text-anchor="middle" {F} font-size="118" fill="#5fd3ff" letter-spacing="2">ACRACB</text>'''
# B: banda ACRACB cruzando el globo, DX debajo
V["B · Banda ACRACB sobre el globo"]=f'''<rect width="512" height="512" fill="#04101f"/>{globe(256,230,190,"cB")}
<rect x="0" y="178" width="512" height="112" fill="#04101f" opacity=".86"/><rect x="0" y="178" width="512" height="4" fill="#5fd3ff"/><rect x="0" y="286" width="512" height="4" fill="#5fd3ff"/>
<text x="256" y="268" text-anchor="middle" {F} font-size="112" fill="#fff" letter-spacing="3">ACRACB</text>
<text x="256" y="494" text-anchor="middle" {F} font-size="96" fill="#5fd3ff">DX</text>'''
# C: ACRACB DX en dos líneas grandes dentro del globo
V["C · Todo dentro del globo"]=f'''<rect width="512" height="512" fill="#04101f"/>{globe(256,256,232,"cC")}
<rect x="66" y="150" width="380" height="214" rx="22" fill="#04101f" opacity=".72"/>
<text x="256" y="250" text-anchor="middle" {F} font-size="112" fill="#5fd3ff" letter-spacing="2">ACRACB</text>
<text x="256" y="350" text-anchor="middle" {F} font-size="104" fill="#fff">DX</text>'''
cards=[]
for name,svg in V.items():
    full=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">{svg}</svg>'
    open("v_"+name[0]+".svg","w").write(full)
    cards.append(f'<figure><div class="big">{full}</div><div class="row"><div class="ios">{full}</div><div class="sm">{full}</div><div class="fav">{full}</div></div><figcaption>{name}</figcaption></figure>')
html=f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{{font-family:"Saira Condensed";font-weight:700;src:url(saira-condensed-latin-700-normal.woff2)}}
@font-face{{font-family:"IBM Plex Mono";font-weight:600;src:url(ibm-plex-mono-latin-600-normal.woff2)}}
body{{margin:0;padding:32px;background:#e9edf2;font:16px system-ui,sans-serif;color:#16202b}}h1{{font:700 30px "Saira Condensed";margin:0 0 18px}}
.g{{display:grid;grid-template-columns:repeat(3,300px);gap:24px}}figure{{margin:0;background:#fff;border-radius:16px;padding:16px}}
.big svg{{width:268px;height:268px;border-radius:58px;display:block}}.row{{display:flex;gap:14px;align-items:end;margin-top:12px}}
.ios svg{{width:60px;height:60px;border-radius:13px;display:block}}.sm svg{{width:40px;height:40px;border-radius:9px;display:block}}.fav svg{{width:20px;height:20px;border-radius:4px;display:block}}
figcaption{{margin-top:10px;font-weight:600}}</style></head><body><h1>Globo azimutal con ACRACB legible</h1><div class="g">{"".join(cards)}</div></body></html>'''
open("variantes3.html","w").write(html)
