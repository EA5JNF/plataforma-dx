"""Cambios solo para la versión web: VOACAP por zonas del mundo en lugar de la base de Alicante incrustada."""
import json,re,os,base64,gzip
W=os.path.dirname(os.path.abspath(__file__))
EN={"París":"Paris","Londres":"London","Dublín":"Dublin","Bruselas":"Brussels","Ámsterdam":"Amsterdam","Fráncfort":"Frankfurt","Berlín":"Berlin","Múnich":"Munich","Viena":"Vienna","Milán":"Milan","Roma":"Rome","Atenas":"Athens","Belgrado":"Belgrade","Praga":"Prague","Varsovia":"Warsaw","Estocolmo":"Stockholm","Copenhague":"Copenhagen","Bucarest":"Bucharest","Kiev":"Kyiv","Moscú":"Moscow","San Petersburgo":"St. Petersburg","Estambul":"Istanbul","Reikiavik":"Reykjavik","Chipre":"Cyprus","Lisboa":"Lisbon","Oporto":"Porto","Burdeos":"Bordeaux","Marsella":"Marseille","Sevilla":"Seville","Baleares":"Balearic Is.","Canarias":"Canary Is.","Nueva York":"New York","Los Ángeles":"Los Angeles","México":"Mexico City","Panamá":"Panama","La Habana":"Havana","Bogotá":"Bogota","São Paulo":"Sao Paulo","Manaos":"Manaus","Argel":"Algiers","Túnez":"Tunis","El Cairo":"Cairo","Adís Abeba":"Addis Ababa","Kinsasa":"Kinshasa","Johannesburgo":"Johannesburg","Ciudad del Cabo":"Cape Town","Reunión":"Reunion","Riad":"Riyadh","Dubái":"Dubai","Teherán":"Tehran","Taskent":"Tashkent","Bombay":"Mumbai","Calcuta":"Kolkata","Singapur":"Singapore","Yakarta":"Jakarta","Shanghái":"Shanghai","Pekín":"Beijing","Seúl":"Seoul","Tokio":"Tokyo","Taipéi":"Taipei","Ekaterimburgo":"Yekaterinburg","Adelaida":"Adelaide","Sídney":"Sydney","Fiyi":"Fiji","Asunción":"Asuncion","Quito":"Quito","Galicia":"Galicia"}
P_OLD_START='<details class="mdet"><summary>VOACAP real</summary><p>'
P_ES=("(voacapl 16.1207W) calculado de antemano desde <b>{n} zonas del mundo</b>, hacia <b>266 destinos</b> (todas las entidades DXCC que importan en DX, con las grandes divididas por regiones), "
 "los 12 meses del año, cada hora, en las 11 bandas de 160 a 6 m, con SSN 20, 40, 60, 80, 100 y 140. Paso largo con el método 21 (forzado a paso largo) para los destinos a más de 8.000 km. "
 "Se usa la zona más cercana a tu locator y solo se descarga lo que hace falta: el mes, los dos niveles de actividad solar que rodean al de hoy y los ángulos de salida, unos 250 kB que quedan guardados en el dispositivo. "
 "Para tu locator exacto se recalculan rumbos, distancias, saltos, sol y línea gris; si estás a más de 450 km del centro de la zona, la web te avisa de que la previsión pierde algo de precisión. "
 "La página interpola según el SFI (SSN ≈ 1,14 × SFI − 73) y entre este mes y el vecino según el día.")
P_EN=("(voacapl 16.1207W) calculated in advance from <b>{n} areas around the world</b>, toward <b>266 destinations</b> (all the DXCC entities that matter for DX, with the big ones split into regions), "
 "all 12 months of the year, every hour, on the 11 bands from 160 to 6 m, with SSN 20, 40, 60, 80, 100 and 140. Long path with method 21 (forced to long path) for destinations beyond 8,000 km. "
 "The area nearest to your locator is used and only what is needed is downloaded: the month, the two solar activity levels around today's and the takeoff angles, about 250 kB that stay saved on the device. "
 "Bearings, distances, hops, sun and gray line are recalculated for your exact locator; if you are more than 450 km from the center of the area, the site warns you that the forecast loses some accuracy. "
 "The page interpolates according to the SFI (SSN ≈ 1.14 × SFI − 73) and between this month and the adjacent one according to the day.")
M_OLD='<details class="mdet"><summary>Meses de concurso</summary><p>VOACAP también para febrero, marzo, julio, septiembre, octubre y diciembre (SSN 40, 60 y 80), solo en las bandas de concurso.</p></details>'
def apply(w,hubs_json):
    global P_ES,P_EN
    A=json.load(open(hubs_json));D=os.path.dirname(hubs_json)
    # las zonas terminadas están junto a la lista mientras se calculan; si no hay ninguna carpeta (copia en «fuente/ext»), están todas publicadas en Cloudflare
    H=[h for h in A if os.path.exists(os.path.join(D,h["id"],"m12h.gz"))] or A
    P_ES=P_ES.replace("{n}",str(len(H)));P_EN=P_EN.replace("{n}",str(len(H)))
    def R(a,b):
        nonlocal w
        assert w.count(a)==1,("hub",a[:80],w.count(a));w=w.replace(a,b)
    R('const VMON=V.mon||11,MF={},MLOAD={};MF[VMON]={u:VB,s:VS};','const VMON=V.mon||11,MF={},MLOAD={};if(!window.ACRACB_HUBS)MF[VMON]={u:VB,s:VS};')
    R('function loadMonth(m){if(!m||MF[m]||MLOAD[m])return;','function loadMonth(m){if(window.ACRACB_HUBS)return HUB.month(m);if(!m||MF[m]||MLOAD[m])return;')
    R('function rawM(D,t,lp,j,h,b){if(!D||b>=NBD)return null;','function rawM(D,t,lp,j,h,b){if(!D||b>=NBD)return null;if(D.have&&!D.have[j]){HUB.need(D,j);return null}if((lp?t.ol:t.os)<0)return null;')
    R('function raw(t,lp,j,h,b,mon){if(mon){if(MF[mon])','function raw(t,lp,j,h,b,mon){if(mon){if(window.ACRACB_HUBS&&!MF[mon])loadMonth(mon);if(MF[mon])')
    R('function hopRaw(t,lp,h,b){if(b>=NBD)return [0,0];','function hopRaw(t,lp,h,b){if(b>=NBD)return [0,0];if(window.ACRACB_HUBS)return HUB.hop(t,lp,h,b);')
    R('const BASEQ=[-0.5017,38.5779];','let BASEQ=[-0.5017,38.5779];')
    R('{const d=distJS(TXP,BASEQ);$("locw").textContent=d>400?','{const d=distJS(TXP,BASEQ);$("locw").textContent=window.ACRACB_HUBS?HUB.check(TXP):d>400?')
    R('&&V.months[CT().month]?CT().month:null}','&&(window.ACRACB_HUBS||V.months[CT().month])?CT().month:null}')
    # la base incrustada de Alicante ya no hace falta en la web: la página pesa 2,4 MB menos
    m=re.search(r'(<script id="voa" type="application/json">)(.*?)(</script>)',w,re.S);V=json.loads(m.group(2))
    V["b"]=base64.b64encode(gzip.compress(b"")).decode();V["months"]={};V["z"]=1
    w=w[:m.start(2)]+json.dumps(V,ensure_ascii=False,separators=(",",":"))+w[m.end(2):]
    # textos del método
    i=w.index(P_OLD_START)+len(P_OLD_START);j=w.index("</p>",i);w=w[:i]+P_ES+w[j:]
    R(M_OLD,"")
    # lista de zonas y módulo, antes del código principal
    L=[{"id":h["id"],"n":h["n"],"e":EN.get(h["n"],h["n"]),"lat":h["lat"],"lon":h["lon"]} for h in H]
    js="<script>window.ACRACB_HUBLIST="+json.dumps(L,ensure_ascii=False,separators=(",",":"))+";\n"+open(os.path.join(W,"hubs.js"),encoding="utf-8").read()+"\n</script>\n"
    k=w.index("const V=JSON.parse(document.getElementById('voa').textContent);");k=w.rindex("<script>",0,k)
    w=w[:k]+js+w[k:]
    return w
