#!/usr/bin/env python3
"""
ACRACB - Plataforma DX · recolector de datos
Idea original y realización: Alfredo, EA5JNF.

Lee fuentes públicas y gratuitas, coteja cada dato en varias de ellas
(mediana o valor más repetido), redacta los textos con reglas fijas y
escribe data/live.json para la página.

Uso:
  python collector/collect.py solar     # Sol, ionosfera, previsiones, DXpediciones (cada 3 h)
  python collector/collect.py cluster   # clústeres, entidades oídas, balizas y avisos (cada 2 h)
  python collector/collect.py all       # todo

Solo usa la biblioteca estándar de Python. Si una fuente falla se salta y se
conserva el último valor bueno: el archivo nunca se queda vacío.
"""
import csv, datetime as dt, gzip, io, json, math, os, re, statistics, sys, time
import urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
LIVE = os.path.join(DATA, "live.json")
CTY_CACHE = os.path.join(DATA, "cty.csv")
UA = "ACRACB-PlataformaDX/1.0 (+club de radioaficionados; uso no comercial)"
TXP = (-0.67, 38.63)          # Onil (Alicante), IM98pp: lon, lat
LOG = []

def log(*a):
    s = " ".join(str(x) for x in a)
    LOG.append(s)
    print(s, flush=True)

def now_utc():
    return dt.datetime.now(dt.timezone.utc)

def iso(t):
    return t.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

# ------------------------------------------------------------------ red
def get(url, timeout=25, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*", "Accept-Encoding": "gzip"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
        if r.headers.get("Content-Encoding") == "gzip" or raw[:2] == b"\x1f\x8b":
            try: raw = gzip.decompress(raw)
            except Exception: pass
    if binary: return raw
    for enc in ("utf-8", "latin-1"):
        try: return raw.decode(enc)
        except Exception: pass
    return raw.decode("utf-8", "replace")

def get_json(url, timeout=25):
    return json.loads(get(url, timeout))

def safe(name, fn, *a, **k):
    try:
        v = fn(*a, **k)
        log("  ok  ", name)
        return v
    except Exception as e:
        log("  FALLA", name, "->", type(e).__name__, str(e)[:160])
        return None

def parallel(jobs):
    """jobs: dict nombre -> (fn, args...)"""
    out = {}
    with ThreadPoolExecutor(max_workers=12) as ex:
        fut = {n: ex.submit(safe, n, j[0], *j[1:]) for n, j in jobs.items()}
        for n, f in fut.items(): out[n] = f.result()
    return out

# ------------------------------------------------------------------ utilidades
def num(x):
    try:
        if x is None: return None
        if isinstance(x, (int, float)): return float(x) if math.isfinite(x) else None
        m = re.search(r"-?\d+(?:[.,]\d+)?", str(x))
        return float(m.group(0).replace(",", ".")) if m else None
    except Exception:
        return None

def median(vals):
    v = [x for x in vals if isinstance(x, (int, float))]
    return statistics.median(v) if v else None

def most_common(vals):
    v = [x for x in vals if x]
    if not v: return None
    return max(set(v), key=lambda x: (v.count(x), -v.index(x)))

def r1(x): return None if x is None else round(x, 1)
def r0(x): return None if x is None else int(round(x))

DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
DCORTO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
MESNUM = {m: i + 1 for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"])}

def madrid(t):
    """Hora de Madrid sin depender de tzdata: CET/CEST según la regla de la UE."""
    y = t.year
    def last_sun(m):
        d = dt.datetime(y, m, 31 if m in (3, 10) else 30, 1, tzinfo=dt.timezone.utc)
        return d - dt.timedelta(days=(d.weekday() + 1) % 7)
    off = 2 if last_sun(3) <= t < last_sun(10) else 1
    return t + dt.timedelta(hours=off)

def fmt_local(t):
    l = madrid(t)
    return f"{l:%Y-%m-%d %H:%M} hora local ({DIAS[l.weekday()]})"

def fmt_dm(t): return f"{t.day} {MESES[t.month-1]}"

def es_num(x, d=0):
    if x is None: return "—"
    s = f"{x:.{d}f}"
    return s.replace(".", ",")

def join_es(items):
    items = [i for i in items if i]
    if not items: return ""
    if len(items) == 1: return items[0]
    return ", ".join(items[:-1]) + " y " + items[-1]

def fmt_f(mhz):
    """Frecuencia en MHz con 3 decimales; un 4.º solo si hay ajuste fino."""
    if mhz is None: return None
    s4 = f"{mhz:.4f}"
    return f"{mhz:.3f}" if s4.endswith("0") else s4

# ------------------------------------------------------------------ bandas y modos
BANDS = [  # índice de la página, MHz min, max
    (0, 1.8, 2.0), (1, 3.5, 4.0), (8, 5.25, 5.45), (2, 7.0, 7.3), (9, 10.1, 10.15),
    (3, 14.0, 14.35), (4, 18.068, 18.168), (5, 21.0, 21.45), (6, 24.89, 24.99),
    (7, 28.0, 29.7), (10, 50.0, 54.0), (11, 144.0, 146.0), (12, 430.0, 440.0)]
BNAME = {0: "160 m", 1: "80 m", 2: "40 m", 3: "20 m", 4: "17 m", 5: "15 m", 6: "12 m", 7: "10 m",
         8: "60 m", 9: "30 m", 10: "6 m", 11: "2 m", 12: "70 cm"}

def band_of(f):
    for i, lo, hi in BANDS:
        if lo <= f <= hi: return i
    return None

MODES = ["SSB", "AM", "FM", "CW", "FT8", "FT4", "JT65", "JS8", "RTTY", "PSK31", "SSTV"]

def mode_from(f, comment="", given=""):
    g = (given or "").upper().strip()
    alias = {"USB": "SSB", "LSB": "SSB", "PHONE": "SSB", "DATA": "", "DIGI": "", "PSK": "PSK31", "BPSK31": "PSK31",
             "JS8CALL": "JS8", "FT-8": "FT8", "FT-4": "FT4", "CWT": "CW"}
    g = alias.get(g, g)
    if g in MODES: return g
    c = (comment or "").upper()
    for m in ("FT8", "FT4", "JT65", "JS8", "RTTY", "PSK31", "SSTV", "CW", "SSB", "USB", "LSB", " AM ", " FM "):
        if m in f" {c} ":
            return {"USB": "SSB", "LSB": "SSB", " AM ": "AM", " FM ": "FM"}.get(m, m)
    k = f * 1000  # kHz
    def near(c0, w=3): return c0 <= k <= c0 + w
    for c0 in (1840, 3573, 5357, 7074, 10136, 14074, 18100, 21074, 24915, 28074, 50313, 144174, 432174):
        if near(c0): return "FT8"
    for c0 in (14090, 18095, 21091, 24911, 28091):
        if near(c0, 2): return "FT8"
    for c0 in (3575, 7047.5, 10140, 14080, 18104, 21140, 24919, 28180, 50318):
        if near(c0, 3): return "FT4"
    for c0 in (7076, 14076, 21076, 28076):
        if near(c0, 2): return "JT65"
    for c0 in (7078, 14078, 21078):
        if near(c0, 2): return "JS8"
    for c0 in (3735, 7165, 14230, 21340, 28680, 144500):
        if abs(k - c0) <= 3: return "SSTV"
    if 29000 <= k <= 29200 or 3615 <= k <= 3625 or abs(k - 14286) < 2 or abs(k - 21425) < 2: return "AM"
    if 29520 <= k <= 29700 or 145200 <= k <= 145600 or 51410 <= k <= 51590 or 433400 <= k <= 434600: return "FM"
    cw = [(1810, 1838), (3500, 3570), (5351.5, 5354), (7000, 7040), (10100, 10130), (14000, 14070), (18068, 18095),
          (21000, 21070), (24890, 24915), (28000, 28070), (50000, 50100), (144025, 144150), (432025, 432100)]
    for lo, hi in cw:
        if lo <= k < hi: return "CW"
    rtty = [(3580, 3600), (7040, 7050), (14080, 14099), (21080, 21120), (28070, 28150), (10130, 10150)]
    for lo, hi in rtty:
        if lo <= k <= hi: return "RTTY"
    return "SSB"

# ------------------------------------------------------------------ entidades DXCC (cty.csv de AD1C)
class Cty:
    def __init__(self, text):
        self.pfx, self.exact, self.ent = {}, {}, {}
        for row in csv.reader(io.StringIO(text)):
            if len(row) < 10: continue
            try:
                dxcc = int(row[2]); lat = float(row[6]); lon = -float(row[7])  # cty: oeste positivo
            except Exception:
                continue
            name, cont = row[1], row[3]
            if row[0].startswith("*"):   # entidades no DXCC (WAE) -> se usan, pero sin número propio
                pass
            self.ent.setdefault(dxcc, {"name": name, "cont": cont, "pos": [round(lon, 2), round(lat, 2)]})
            info = {"dxcc": dxcc, "name": name, "cont": cont, "pos": [round(lon, 2), round(lat, 2)]}
            for tok in row[9].replace(";", "").split():
                exact = tok.startswith("=")
                t = tok.lstrip("=")
                c = cont
                m = re.search(r"\{(\w\w)\}", t)
                if m: c = m.group(1)
                base = re.sub(r"[\(\[\{<~].*$", "", t)
                ll = re.search(r"<(-?[\d.]+)/(-?[\d.]+)>", t)
                inf = dict(info, cont=c)
                if ll: inf["pos"] = [round(-float(ll.group(2)), 2), round(float(ll.group(1)), 2)]
                if not base: continue
                (self.exact if exact else self.pfx)[base] = inf
        log(f"  cty: {len(self.pfx)} prefijos, {len(self.exact)} indicativos exactos")

    def look(self, call):
        c = re.sub(r"-\d+$", "", (call or "").upper().strip())
        c = re.sub(r"[^A-Z0-9/]", "", c)
        if not c: return None
        if c in self.exact: return self.exact[c]
        parts = [p for p in c.split("/") if p]
        if any(p in ("MM", "AM") for p in parts): return None
        suf = {"P", "M", "QRP", "A", "LH", "R", "T", "B", "PM", "J", "E", "QRPP"}
        cand = [p for p in parts if p not in suf and not p.isdigit()]
        if not cand: return None
        base = cand[0]
        if len(cand) > 1:
            short = min(cand, key=len)
            if len(short) <= 4: base = short
        if base in self.exact: return self.exact[base]
        for n in range(len(base), 0, -1):
            v = self.pfx.get(base[:n])
            if v: return v
        return None

def load_cty():
    for url in ("https://www.country-files.com/cty/cty.csv", "https://www.country-files.com/bigcty/cty.csv"):
        try:
            t = get(url, 40)
            if t.count(",") > 1000:
                os.makedirs(DATA, exist_ok=True)
                open(CTY_CACHE, "w", encoding="utf-8").write(t)
                log("  ok   cty.csv (AD1C)")
                return Cty(t)
        except Exception as e:
            log("  FALLA cty.csv", e)
    if os.path.exists(CTY_CACHE):
        log("  usando cty.csv guardado")
        return Cty(open(CTY_CACHE, encoding="utf-8").read())
    return Cty("")

def dist_km(a, b):
    (lo1, la1), (lo2, la2) = a, b
    p1, p2 = math.radians(la1), math.radians(la2)
    dl = math.radians(lo2 - lo1)
    c = math.sin(p1) * math.sin(p2) + math.cos(p1) * math.cos(p2) * math.cos(dl)
    return 6371 * math.acos(max(-1, min(1, c)))

NEAR = {281, 21, 29, 32, 149, 256, 272, 203, 233, 446}   # EA, EA6, EA8, EA9, CU, CT3, CT, C3, ZB, CN
NEAR_EXTRA_PFX = ("EA", "EB", "EC", "ED", "EE", "EF", "EG", "EH", "AM", "AN", "AO", "CT", "CQ", "CR", "CS", "CU", "C3", "ZB", "CN", "5C", "5D", "5E", "5F", "5G")
RARE_EU = {246, 247, 260, 296, 180, 522, 5, 106, 114, 117, 118, 122, 167, 499, 514, 288}  # 1A0, 9H? (no), etc.

# ------------------------------------------------------------------ SOL Y ESPACIO
def src_noaa_wwv():
    t = get("https://services.swpc.noaa.gov/text/wwv.txt")
    out = {}
    m = re.search(r"Solar flux\s+(\d+)", t, re.I);           out["sfi"] = num(m.group(1)) if m else None
    m = re.search(r"planetary A-index\s+(\d+)", t, re.I);    out["a"] = num(m.group(1)) if m else None
    m = re.search(r"K-index at .*? was\s+([\d.]+)", t, re.I | re.S); out["kp"] = num(m.group(1)) if m else None
    return out

def src_noaa_f107():
    j = get_json("https://services.swpc.noaa.gov/json/f107_cm_flux.json")
    rows = [r for r in j if isinstance(r, dict) and num(r.get("flux"))]
    rows.sort(key=lambda r: r.get("time_tag", ""))
    noon = [r for r in rows if "Noon" in str(r.get("reporting_schedule", "")) or "20:00" in str(r.get("time_tag", ""))]
    r = (noon or rows)[-1]
    return num(r["flux"])

def src_noaa_kp():
    j = get_json("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json")
    if j and isinstance(j[0], list):
        hdr = j[0]; rows = [dict(zip(hdr, r)) for r in j[1:]]
    else:
        rows = j
    r = rows[-1]
    return {"kp": num(pick(r, "Kp", "kp_index", "estimated_kp")), "a": num(r.get("a_running")),
            "time": r.get("time_tag")}

def src_gfz_kp():
    t = now_utc(); a = t - dt.timedelta(days=1)
    url = ("https://kp.gfz-potsdam.de/app/json/?start=%sT00:00:00Z&end=%sT23:59:59Z&index=Kp"
           % (a.strftime("%Y-%m-%d"), t.strftime("%Y-%m-%d")))
    j = get_json(url)
    v = [x for x in (j.get("Kp") or []) if x is not None]
    return v[-1] if v else None

def src_hamqsl():
    x = get("https://www.hamqsl.com/solarxml.php")
    def tag(n):
        m = re.search(r"<%s>\s*([^<]*?)\s*</%s>" % (n, n), x, re.I)
        return m.group(1).strip() if m else None
    out = {"sfi": num(tag("solarflux")), "a": num(tag("aindex")), "kp": num(tag("kindex")), "xray": tag("xray"),
           "ssn": num(tag("sunspots")), "wind": num(tag("solarwind")), "bz": num(tag("magneticfield"))}
    cond = {}
    for m in re.finditer(r'<band name="([^"]+)" time="(day|night)">([^<]+)</band>', x, re.I):
        cond.setdefault(m.group(1), ["", ""])[0 if m.group(2).lower() == "day" else 1] = TRAD.get(m.group(3).strip(), m.group(3).strip())
    m = re.search(r'<phenomenon name="E-Skip" location="europe_6m">([^<]+)</phenomenon>', x, re.I)
    if m: cond["6m"] = TRAD.get(m.group(1).strip(), m.group(1).strip())
    out["cond"] = cond
    return out

TRAD = {"Good": "Buena", "Fair": "Regular", "Poor": "Mala", "Band Closed": "Cerrada", "Band Open": "Abierta",
        "50MHz ES": "Abierta (Es)", "Closed": "Cerrada"}

def src_drao():
    t = get("https://www.spaceweather.gc.ca/solar_flux_data/daily_flux_values/fluxtable.txt")
    rows = []
    for line in t.splitlines():
        p = line.split()
        if len(p) >= 7 and p[0].isdigit() and len(p[0]) == 8:
            rows.append(p)
    noon = [r for r in rows if r[1] in ("2000", "1950", "2050", "200000")] or rows
    return num(noon[-1][4]) if noon else None

def src_eisn():
    t = get("https://www.sidc.be/SILSO/DATA/EISN/EISN_current.txt")
    rows = [l.split() for l in t.splitlines() if l.strip() and l.strip()[0].isdigit()]
    return num(rows[-1][4]) if rows else None

def src_noaa_ssn():
    j = get_json("https://services.swpc.noaa.gov/json/solar-cycle/swpc_observed_ssn.json")
    j = [r for r in j if num(r.get("swpc_ssn")) is not None]
    j.sort(key=lambda r: r.get("Obsdate", ""))
    return num(j[-1]["swpc_ssn"]) if j else None

def src_wind():
    s = get_json("https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json")
    m = get_json("https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json")
    if isinstance(s, list): s = s[-1]
    if isinstance(m, list): m = m[-1]
    return {"wind": num(pick(s, "proton_speed", "WindSpeed")), "bt": num(pick(m, "bt", "Bt")),
            "bz": num(pick(m, "bz_gsm", "Bz"))}

def src_plasma():
    j = get_json("https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json")
    hdr = j[0]; rows = [dict(zip(hdr, r)) for r in j[1:] if r[1] is not None]
    return num(rows[-1].get("density")) if rows else None

def src_xray():
    j = get_json("https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json")
    r = j[-1] if isinstance(j, list) else j
    return {"now": r.get("current_class") or r.get("max_class"), "max": r.get("max_class"), "max_time": r.get("max_time")}

def src_scales():
    j = get_json("https://services.swpc.noaa.gov/products/noaa-scales.json")
    cur = j.get("0") or j.get(0) or {}
    fc = j.get("1") or {}
    s = (cur.get("S") or {}).get("Scale")
    r = fc.get("R") or {}
    return {"S": s, "r12": num(r.get("MinorProb")), "r3": num(r.get("MajorProb")), "s1": num((fc.get("S") or {}).get("Prob")),
            "G": (cur.get("G") or {}).get("Scale")}

def src_3day():
    t = get("https://services.swpc.noaa.gov/text/3-day-forecast.txt")
    out = {}
    m = re.search(r":Issued:\s*(\d{4}) (\w{3}) (\d{1,2}) (\d{4}) UTC", t)
    if m: out["issued"] = f"NOAA, {int(m.group(3))} {MESES[MESNUM[m.group(2).lower()]-1]} {m.group(4)[:2]}:{m.group(4)[2:]} UTC"
    m = re.search(r"NOAA Kp index breakdown (\w{3}) (\d{1,2})-(\w{3}) (\d{1,2}) (\d{4})", t)
    if m:
        y = int(m.group(5)); base = dt.date(y, MESNUM[m.group(1).lower()], int(m.group(2)))
        out["base"] = base.isoformat()
        out["days"] = [f"{DCORTO[(base + dt.timedelta(days=i)).weekday()]} {(base + dt.timedelta(days=i)).day}" for i in range(3)]
        blocks = [[], [], []]
        for line in t.splitlines():
            if re.match(r"\s*\d\d-\d\dUT", line):
                vals = re.findall(r"(\d(?:\.\d+)?)(?:\s*\(G\d\))?", line[7:])
                for i in range(min(3, len(vals))): blocks[i].append(float(vals[i]))
        if all(len(b) == 8 for b in blocks): out["blocks"] = blocks
    m = re.search(r"R1-R2\s+(\d+)%", t);        out["r12"] = num(m.group(1)) if m else None
    m = re.search(r"R3 or greater\s+(\d+)%", t); out["r3"] = num(m.group(1)) if m else None
    m = re.search(r"S1 or greater\s+(\d+)%", t); out["s1"] = num(m.group(1)) if m else None
    return out

def src_27day():
    t = get("https://services.swpc.noaa.gov/text/27-day-outlook.txt")
    days = []
    for m in re.finditer(r"^(\d{4}) (\w{3}) (\d{2})\s+(\d+)\s+(\d+)\s+(\d+)", t, re.M):
        d = dt.date(int(m.group(1)), MESNUM[m.group(2).lower()], int(m.group(3)))
        days.append([d.isoformat(), int(m.group(4)), int(m.group(5)), int(m.group(6))])
    m = re.search(r":Issued:\s*(\d{4}) (\w{3}) (\d{1,2})", t)
    iss = f"NOAA SWPC, {int(m.group(3))} {MESES[MESNUM[m.group(2).lower()]-1]} {m.group(1)}" if m else "NOAA SWPC"
    return {"issued": iss, "days": days} if days else None

def src_ovation():
    j = get_json("https://services.swpc.noaa.gov/json/ovation_aurora_latest.json", 40)
    best = (0, None)
    for lon, lat, a in j.get("coordinates", []):
        lo = lon - 360 if lon > 180 else lon
        if 45 <= lat <= 65 and -10 <= lo <= 30 and a > best[0]: best = (a, lat)
    return best

def src_cme():
    t = now_utc()
    url = ("https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/WSAEnlilSimulations?startDate=%s&endDate=%s"
           % ((t - dt.timedelta(days=7)).strftime("%Y-%m-%d"), t.strftime("%Y-%m-%d")))
    j = get_json(url, 40) or []
    out, seen = [], set()
    for s in j:
        arr = s.get("estimatedShockArrivalTime")
        earth = s.get("isEarthGB") or any((i.get("location") or "").lower() == "earth" for i in (s.get("impactList") or []))
        if not earth: continue
        if not arr:
            for i in s.get("impactList") or []:
                if (i.get("location") or "").lower() == "earth": arr = i.get("arrivalTime")
        cin = (s.get("cmeInputs") or [{}])[0]
        st = cin.get("cmeStartTime")
        if st in seen: continue
        seen.add(st)
        try:
            at = dt.datetime.fromisoformat(arr.replace("Z", "+00:00")) if arr else None
            if at and at.tzinfo is None: at = at.replace(tzinfo=dt.timezone.utc)
        except Exception:
            at = None
        if at and at < t - dt.timedelta(hours=24): continue
        sp = num(cin.get("speed"))
        kpmax = num(s.get("kp_90")) or num(s.get("kp_135")) or num(s.get("kp_180"))
        note = ("puede dar tormenta G1–G2" if (sp or 0) >= 800 or (kpmax or 0) >= 6 else
                "puede agitar el campo (Kp 4–5)" if (sp or 0) >= 500 or (kpmax or 0) >= 4 else "efecto débil esperado")
        out.append({"time": st, "arrival": iso(at) if at else None, "speed": r0(sp), "note": note})
    return out

def src_kc2g():
    st = get_json("https://prop.kc2g.com/api/stations.json")
    best = None
    for r in st:
        s = r.get("station") or {}
        try:
            lat = float(s.get("latitude")); lon = float(s.get("longitude"))
        except Exception:
            continue
        if lon > 180: lon -= 360
        d = dist_km(TXP, (lon, lat))
        fo = num(r.get("fof2")); mu = num(r.get("mufd"))
        tt = r.get("time")
        if fo is None or not tt: continue
        try:
            age = (now_utc() - dt.datetime.fromisoformat(tt.replace("Z", "+00:00")).astimezone(dt.timezone.utc)).total_seconds() / 3600
        except Exception:
            age = 99
        if age > 3 or d > 1500: continue
        if not best or d < best["d"]:
            best = {"d": d, "station": f"{s.get('name')} ({s.get('code')})", "code": s.get("code"), "fof2": fo, "mufd": mu, "time": tt}
    return best

def src_essn():
    j = get_json("https://prop.kc2g.com/api/essn.json")
    arr = None
    if isinstance(j, dict):
        for k in ("24h", "6h", "essn", "data"):
            if isinstance(j.get(k), list): arr = j[k]; break
    elif isinstance(j, list):
        arr = j
    if not arr: return None
    last = arr[-1]
    v = num(last.get("ssn") if isinstance(last, dict) else last)
    tt = last.get("time") if isinstance(last, dict) else None
    return {"essn": v, "time": tt}

def src_giro(code):
    t = now_utc()
    d0 = (t - dt.timedelta(hours=4)).strftime("%Y/%m/%d+%H:%M:%S"); d1 = t.strftime("%Y/%m/%d+%H:%M:%S")
    url = ("https://lgdc.uml.edu/common/DIDBGetValues?ursiCode=%s&charName=foF2,MUFD&DMUF=3000&fromDate=%s&toDate=%s"
           % (code, d0, d1))
    txt = get(url, 30)
    rows = []
    for line in txt.splitlines():
        m = re.match(r"\s*(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z)\s+(\S+)\s+(\S+)\s+(\S+)", line)
        if m:
            fo = num(m.group(3)); mu = None
            rest = line.split()
            nums_ = [num(x) for x in rest[1:] if re.match(r"^-?\d", x)]
            # columnas: CS foF2 QD MUFD QD (según DIDBase)
            if len(nums_) >= 3: fo, mu = nums_[1], nums_[-1] if len(nums_) >= 4 else None
            if fo and fo > 0.5: rows.append((m.group(1), fo, mu))
    return rows[-1] if rows else None

def src_pred_cycle():
    j = get_json("https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json")
    now = now_utc().strftime("%Y-%m")
    out = {}
    for r in j:
        tg = r.get("time-tag") or r.get("time_tag")
        v = num(r.get("predicted_ssn"))
        if tg and v is not None and tg[:7] >= now:
            out[tg[:7]] = round(v, 1)
        if len(out) >= 13: break
    return out or None

def src_silso_cycle():
    m = get("https://www.sidc.be/SILSO/DATA/SN_m_tot_V2.0.txt", 40)
    s = get("https://www.sidc.be/SILSO/DATA/SN_ms_tot_V2.0.txt", 40)
    def rows(t):
        out = []
        for l in t.splitlines():
            p = l.split()
            if len(p) >= 4 and p[0].isdigit():
                v = num(p[3])
                if v is not None and v >= 0: out.append((f"{int(p[0])}-{int(p[1]):02d}", round(v, 1)))
        return out
    mo, sm = rows(m), rows(s)
    if not mo: return None
    return {"monthly": dict(mo[-3:]), "smoothed": dict(sm[-3:]), "src": f"SILSO (Real Observatorio de Bélgica), {mo[-1][0]}"}

def src_wspr():
    q = ("SELECT band,count() FROM wspr.rx WHERE time>now()-3600 AND distance>2500 AND rx_lat>35 AND rx_lat<60 "
         "AND rx_lon>-10 AND rx_lon<30 GROUP BY band FORMAT TSV")
    t = get("https://db1.wspr.live/?query=" + urllib.parse.quote(q), 40)
    out = {}
    for line in t.splitlines():
        p = line.split("\t")
        if len(p) == 2 and re.match(r"^-?\d+$", p[0]) and int(p[0]) > 0:
            out[p[0]] = int(p[1])
    return out

# ------------------------------------------------------------------ DXPEDICIONES
def src_ng3k(cty):
    h = get("https://www.ng3k.com/misc/adxo.html", 40)
    today = now_utc().date()
    out = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", h, re.S | re.I):
        cells = [re.sub(r"<[^>]+>", " ", c) for c in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S | re.I)]
        cells = [re.sub(r"\s+", " ", c.replace("&nbsp;", " ").replace("&amp;", "&")).strip() for c in cells]
        if len(cells) < 5: continue
        dates = []
        for c in cells[:3]:
            m = re.match(r"(\d{4})\s*([A-Za-z]{3})\s*(\d{1,2})", c)
            if m:
                try: dates.append(dt.date(int(m.group(1)), MESNUM[m.group(2).lower()], int(m.group(3))))
                except Exception: pass
        if len(dates) < 2: continue
        start, end = dates[0], dates[1]
        if not (start <= today <= end): continue
        call = None
        for c in cells[2:5]:
            for tok in re.split(r"[\s,;]+", c):
                if re.match(r"^[A-Z0-9]{1,3}[0-9][A-Z0-9]{0,5}(/[A-Z0-9]{1,4})?$", tok) and not tok.isdigit():
                    call = tok; break
            if call: break
        if not call: continue
        info = cells[-1]
        qsl = ""
        for c in cells:
            if c.upper().startswith(("QSL", "LOTW", "OQRS")) or re.search(r"\bvia\b", c, re.I):
                qsl = c; break
        e = cty.look(call) if cty else None
        out.append({"call": call, "start": start.isoformat(), "end": end.isoformat(), "info_en": info, "qsl_en": qsl,
                    "dxcc": e["dxcc"] if e else None, "pos": e["pos"] if e else None, "ent_en": e["name"] if e else cells[2]})
    return out

def src_clublog_mw(cty):
    try:
        j = get_json("https://clublog.org/mostwanted.php?api=1")
        rank = {}
        for k, v in j.items():
            e = cty.look(v) if cty else None
            if e: rank[e["dxcc"]] = int(k)
        if rank: return rank
    except Exception:
        pass
    h = get("https://clublog.org/mostwanted.php", 40)
    rank = {}
    for m in re.finditer(r"<td[^>]*>\s*(\d+)\.?\s*</td>\s*<td[^>]*>\s*(?:<[^>]+>)*\s*([A-Z0-9/]+)", h):
        e = cty.look(m.group(2)) if cty else None
        if e and e["dxcc"] not in rank: rank[e["dxcc"]] = int(m.group(1))
    return rank

def dx_from_ng3k(rows, mw, prev):
    prevmap = {d.get("call"): d for d in (prev or [])}
    out = []
    for r in rows:
        txt = (r["info_en"] + " " + r["qsl_en"]).upper()
        modes = [m for m in ("CW", "SSB", "RTTY", "FT8", "FT4") if m in txt]
        if "DIGI" in txt and "FT8" not in modes: modes.append("FT8")
        bands = re.findall(r"(160|80|60|40|30|20|17|15|12|10|6)\s*-\s*(160|80|60|40|30|20|17|15|12|10|6)\s*M", txt)
        rng = f"{bands[0][0]}–{bands[0][1]} m" if bands else ""
        end = dt.date.fromisoformat(r["end"])
        p = prevmap.get(r["call"], {})
        qsl = ""
        m = re.search(r"(?:QSL\s*(?:VIA|:)?\s*)([A-Z0-9/]{3,})", r["qsl_en"].upper() + " " + r["info_en"].upper())
        if m: qsl = m.group(1)
        if "LOTW" in txt: qsl = (qsl + " · LoTW").strip(" ·")
        if "OQRS" in txt or "CLUBLOG" in txt or "CLUB LOG" in txt: qsl = (qsl + " · Club Log OQRS").strip(" ·")
        info_bits = []
        if rng: info_bits.append(rng)
        if modes: info_bits.append(join_es(modes))
        info = ("Activa hasta el " + fmt_dm(dt.datetime(end.year, end.month, end.day)) +
                (" · " + " en ".join(info_bits) if info_bits else "") + ".")
        out.append({
            "new": True, "call": r["call"], "ent": None, "dxcc": r["dxcc"],
            "lat": r["pos"][1] if r["pos"] else None, "lon": r["pos"][0] if r["pos"] else None,
            "until": fmt_dm(dt.datetime(end.year, end.month, end.day)), "end": r["end"], "start": r["start"], "info": info,
            "ssb": ("SSB" in modes) if modes else None, "modes": modes or None,
            "qsx": p.get("qsx"), "pilot": p.get("pilot"), "qsl": qsl or p.get("qsl"),
            "web": "https://www.ng3k.com/misc/adxo.html", "mw": mw.get(r["dxcc"]) if mw and r["dxcc"] else None,
            "src": "NG3K"})
    return out

# ------------------------------------------------------------------ CLÚSTERES
def parse_time(v):
    if v is None: return None
    try:
        if isinstance(v, (int, float)) or (isinstance(v, str) and re.match(r"^\d{9,13}(\.\d+)?$", v)):
            x = float(v)
            if x > 1e12: x /= 1000
            return dt.datetime.fromtimestamp(x, dt.timezone.utc)
        s = str(v).strip().replace(" ", "T")
        if re.match(r"^\d{4}T\d{4}-\d\d-\d\d$", s):  # HamQTH "HHMM YYYY-MM-DD"
            hh, d = s.split("T")
            s = f"{d}T{hh[:2]}:{hh[2:]}:00"
        t = dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
        return t if t.tzinfo else t.replace(tzinfo=dt.timezone.utc)
    except Exception:
        return None

def to_mhz(v):
    f = num(v)
    if f is None: return None
    if f > 1e6: return f / 1e6
    if f > 1000: return f / 1000
    return f

def pick(d, *keys):
    for k in keys:
        if k in d and d[k] not in (None, ""): return d[k]
    return None

def spots_spothole():
    j = get_json("https://spothole.app/api/v1/spots?max_age=3600", 40)
    if isinstance(j, dict): j = j.get("spots") or j.get("data") or []
    out = []
    for s in j:
        src = str(pick(s, "source") or "Spothole")
        out.append({"call": pick(s, "dx_call", "dx", "callsign"), "f": to_mhz(pick(s, "freq", "frequency")),
                    "mode": pick(s, "mode"), "t": parse_time(pick(s, "time", "time_iso", "spot_time")),
                    "by": pick(s, "de_call", "spotter", "de"), "c": pick(s, "comment", "info") or "",
                    "ref": " ".join(x if isinstance(x, str) else (x.get("id") if isinstance(x, dict) else "") for x in (pick(s, "sig_refs") or [])) if pick(s, "sig_refs") else "",
                    "sig": pick(s, "sig") or "",
                    "src": "RBN" if "RBN" in src.upper() else "PSK Reporter" if "PSK" in src.upper() else
                           "POTA" if "POTA" in src.upper() else "SOTA" if "SOTA" in src.upper() else "Spothole",
                    "dxpos": [num(pick(s, "dx_longitude", "dx_lon")), num(pick(s, "dx_latitude", "dx_lat"))],
                    "depos": [num(pick(s, "de_longitude", "de_lon")), num(pick(s, "de_latitude", "de_lat"))]})
    return out

def spots_dxsummit():
    j = get_json("https://www.dxsummit.fi/api/v1/spots?limit=300", 40)
    if isinstance(j, dict): j = j.get("spots") or []
    return [{"call": pick(s, "dx_call", "dx", "callsign"), "f": to_mhz(pick(s, "frequency", "freq")),
             "mode": None, "t": parse_time(pick(s, "time", "spot_time")), "by": pick(s, "de_call", "spotter", "de"),
             "c": pick(s, "info", "comment") or "", "src": "DXSummit"} for s in j]

def spots_hamqth():
    t = get("https://www.hamqth.com/dxc_csv.php?limit=300", 40)
    out = []
    for line in t.splitlines():
        p = line.split("^")
        if len(p) < 5: continue
        out.append({"call": p[2], "f": to_mhz(p[1]), "mode": None, "t": parse_time(p[4]), "by": p[0], "c": p[3], "src": "HamQTH"})
    return out

def spots_pota():
    j = get_json("https://api.pota.app/spot/activator", 40)
    out = []
    for s in j:
        ref = s.get("reference") or ""
        out.append({"call": s.get("activator"), "f": to_mhz(s.get("frequency")), "mode": s.get("mode"),
                    "t": parse_time(s.get("spotTime")), "by": s.get("spotter"), "c": (s.get("comments") or ""),
                    "ref": f"POTA {ref}" if ref else "", "src": "POTA",
                    "dxpos": [num(s.get("longitude")), num(s.get("latitude"))]})
    return out

def spots_sota():
    j = get_json("https://api2.sota.org.uk/api/spots/60/all", 40)
    out = []
    for s in j:
        ref = s.get("summitCode") or ""
        out.append({"call": s.get("activatorCallsign"), "f": to_mhz(s.get("frequency")), "mode": s.get("mode"),
                    "t": parse_time(s.get("timeStamp")), "by": s.get("callsign"), "c": s.get("comments") or "",
                    "ref": f"SOTA {s.get('associationCode','')}/{ref}".replace("//", "/") if ref else "", "src": "SOTA"})
    return out

BEACONS = ["4U1UN", "VE8AT", "W6WX", "KH6RS", "ZL6B", "VK6RBP", "JA2IGY", "RR9O", "VR2B", "4S7B", "ZS6DN", "5Z4B",
           "4X6TU", "OH2B", "CS3B", "LU4AA", "OA4B", "YV5B"]

def clean_call(c):
    c = re.sub(r"-\d+(-#)?$|-#$", "", (c or "").upper().strip())
    return re.sub(r"[^A-Z0-9/]", "", c)

def build_cluster(prev, cty):
    jobs = {"Spothole": (spots_spothole,), "DXSummit": (spots_dxsummit,), "HamQTH": (spots_hamqth,),
            "POTA": (spots_pota,), "SOTA": (spots_sota,)}
    res = parallel(jobs)
    t0 = now_utc()
    raw, answered = [], []
    for name, lst in res.items():
        if lst:
            answered.append(name)
            raw.extend(lst)
    log(f"  reportes leídos: {len(raw)} de {join_es(answered) or 'ninguna fuente'}")
    EU_CONT = {"EU"}
    groups = {}
    heard_raw = []
    beacons = []
    for s in raw:
        call = clean_call(s.get("call")); by = clean_call(s.get("by"))
        f = s.get("f"); tt = s.get("t")
        if not call or not f or not tt or call == by: continue
        if tt > t0 + dt.timedelta(minutes=10): tt = t0
        b = band_of(f)
        if b is None: continue
        age = (t0 - tt).total_seconds() / 60
        e_dx = cty.look(call); e_de = cty.look(by)
        de_cont = e_de["cont"] if e_de else None
        de_pos = e_de["pos"] if e_de else None
        dp = s.get("depos") or [None, None]
        if dp[0] is not None and dp[1] is not None: de_pos = [round(dp[0], 2), round(dp[1], 2)]
        heard_in_eu = de_cont in EU_CONT or (de_cont == "AF" and de_pos and de_pos[1] > 27)
        if call in BEACONS and heard_in_eu and age <= 120:
            beacons.append({"call": call, "f": fmt_f(f), "t": tt.strftime("%H:%M"), "by": by})
            continue
        if heard_in_eu and e_dx and age <= 360:
            heard_raw.append((e_dx, call, b, mode_from(f, s.get("c", ""), s.get("mode")), tt, s["src"]))
        lim = 120 if b >= 10 else 60
        if age > lim: continue
        key = (call, round(f * 1000 / 2))   # mismo indicativo a ±2 kHz
        g = groups.setdefault(key, {"call": call, "f": f, "band": b, "t": tt, "by": [], "from": [], "srcs": set(),
                                    "c": [], "ref": "", "mode": None, "dxe": e_dx, "dxpos": None, "skim": False})
        g["srcs"].add(s["src"])
        if s["src"] in ("RBN", "PSK Reporter"): g["skim"] = True
        if tt > g["t"]: g["t"] = tt
        if by and by not in g["by"] and len(g["by"]) < 4 and (heard_in_eu or b >= 10 or not g["by"]):
            g["by"].append(by); g["from"].append(de_pos or [0, 0])
        if s.get("c"): g["c"].append(s["c"])
        if s.get("ref") and not g["ref"]: g["ref"] = s["ref"]
        m = s.get("mode")
        if m and not g["mode"]: g["mode"] = m
        dpx = s.get("dxpos") or [None, None]
        if dpx[0] is not None and dpx[1] is not None and not g["dxpos"]: g["dxpos"] = [round(dpx[0], 2), round(dpx[1], 2)]
        g["_eu"] = g.get("_eu") or heard_in_eu
    prevmap = {}
    for p in (prev.get("spots") or []):
        try: prevmap[(p["call"], round(float(p["f"]) * 1000 / 2))] = p
        except Exception: pass
    spots, new_n, conf = [], 0, 0
    for key, g in groups.items():
        e = g["dxe"]
        dxpos = g["dxpos"] or (e["pos"] if e else None)
        if not dxpos: continue
        dxcc = e["dxcc"] if e else None
        cont = e["cont"] if e else None
        # tipo
        pfx_near = any(g["call"].startswith(p) for p in NEAR_EXTRA_PFX)
        if (dxcc in NEAR) or (pfx_near and dxcc in NEAR | {None}):
            kind = "near"
        elif g["band"] >= 10:
            far = [dist_km(dxpos, fp) for fp in g["from"] if fp != [0, 0]]
            if not far or max(far) < 300: continue
            kind = "vhf"
        elif cont != "EU" or dxcc in RARE_EU:
            if not g.get("_eu"): continue
            kind = "dx"
        else:
            far = [dist_km(dxpos, fp) for fp in g["from"] if fp != [0, 0]]
            if not far or max(far) < 2500: continue
            kind = "ind"
        mode = mode_from(g["f"], " ".join(g["c"]), g["mode"])
        ns = len(g["srcs"])
        old = prevmap.get(key)
        nw = old is None
        if old: ns = max(ns, int(old.get("ns") or 1))
        note = []
        if g["ref"]: note.append(g["ref"])
        cm = re.sub(r"\s+", " ", (g["c"][0] if g["c"] else "")).strip()
        if cm and len(cm) <= 40 and not re.search(r"\bdB\b.*WPM|WPM", cm): note.append(cm)
        if g["skim"] and not any(x not in ("RBN", "PSK Reporter") for x in g["srcs"]):
            note.append("oído por skimmer (RBN)" if "RBN" in g["srcs"] else "decodificado (PSK Reporter)")
        spots.append({"call": g["call"], "f": fmt_f(g["f"]), "band": g["band"], "mode": mode, "t": g["t"].strftime("%H:%M"),
                      "by": g["by"], "from": g["from"], "dx": dxpos, "dxcc": dxcc, "kind": kind,
                      "c": " · ".join(note), "nw": nw, "ns": ns, "_t": g["t"]})
        if nw: new_n += 1
        if ns > 1: conf += 1
    spots.sort(key=lambda s: s["_t"], reverse=True)
    keep = [s for s in spots if s["nw"] or s["band"] >= 10]
    rest = [s for s in spots if s not in keep]
    spots = (keep + rest)[:100]
    spots.sort(key=lambda s: s["_t"], reverse=True)
    newest = spots[0]["_t"] if spots else None
    oldest = spots[-1]["_t"] if spots else None
    for s in spots: s.pop("_t", None)
    # entidades oídas (6 h)
    heard = {}
    for h in (prev.get("heard") or []):
        try:
            last = parse_time(h.get("last"))
            if last and (t0 - last).total_seconds() <= 6 * 3600: heard[h["dxcc"]] = dict(h)
        except Exception:
            pass
    for e, call, b, mode, tt, src in heard_raw:
        k = e["dxcc"]
        h = heard.setdefault(k, {"dxcc": k, "ent": None, "calls": [], "b": [], "m": [], "n": 0, "last": iso(tt),
                                 "src": [], "pos": e["pos"]})
        h["n"] += 1
        if call not in h["calls"]: h["calls"] = ([call] + h["calls"])[:8]
        if b not in h["b"]: h["b"].append(b)
        if mode not in h["m"]: h["m"].append(mode)
        sname = "RBN" if src == "RBN" else "PSK Reporter" if src == "PSK Reporter" else "clúster"
        if sname not in h["src"]: h["src"].append(sname)
        if iso(tt) > h["last"]: h["last"] = iso(tt)
    heard_l = sorted(heard.values(), key=lambda h: h["last"], reverse=True)[:150]
    # balizas (únicas)
    bmap = {}
    for b_ in beacons:
        bmap.setdefault((b_["call"], b_["f"]), b_)
    beacons = list(bmap.values())[:40]
    win = f"{oldest:%H:%M}–{newest:%H:%M} UTC" if newest else ""
    src_txt = (f"{new_n} nuevos, {conf} confirmados en 2+ fuentes · {join_es(answered)}" + (f" · {win}" if win else "")
               if answered else "Ninguna fuente de clúster respondió en esta ronda")
    return {"spots": spots, "heard": heard_l, "beacons": beacons, "spotsNew": new_n, "spotsSrc": src_txt,
            "spotsChecked": iso(t0), "spotsUTC": iso(newest) if newest else prev.get("spotsUTC"),
            "_answered": answered, "_reports": len(raw)}

# ------------------------------------------------------------------ TEXTOS (expresiones fijas)
def txt_kp(kp, fc_max, g_scale):
    if kp is None: return ""
    base = f"Kp {es_num(kp, 0 if kp == int(kp) else 1)}"
    if fc_max is None: return base + "."
    if fc_max >= 5: tail = f"NOAA prevé tormenta (Kp hasta {es_num(fc_max,1)}): noches ruidosas en bandas bajas y caminos polares flojos."
    elif fc_max >= 4: tail = f"NOAA prevé campo activo (Kp hasta {es_num(fc_max,1)}): algo de QSB en los caminos del norte."
    elif fc_max >= 3: tail = "NOAA prevé campo algo agitado, sin tormentas."
    else: tail = "NOAA prevé campo tranquilo en los próximos días."
    return f"{base}. {tail}"

def txt_solar(L, now, kpfc_max):
    out = []
    lmad = madrid(now)
    h = lmad.hour
    franja = "Mañana" if 7 <= h < 13 else "Tarde" if 13 <= h < 20 else "Noche"
    cond = ((L.get("cotejo") or {}).get("hamqsl") or {})
    di = 0 if 7 <= h < 19 else 1
    lab = lambda k: k.replace("m-", "–").replace("m", "")
    good = [lab(k) for k, v in cond.items() if isinstance(v, list) and len(v) > di and v[di] in ("Buena",)]
    fair = [lab(k) for k, v in cond.items() if isinstance(v, list) and len(v) > di and v[di] in ("Regular",)]
    sp = [s for s in (L.get("spots") or []) if s.get("kind") == "dx"]
    top = []
    for s in sp[:40]:
        b = BNAME.get(s.get("band"))
        if s.get("call") and b and len(top) < 3 and s["call"] not in [x[0] for x in top]:
            top.append((s["call"], b, s.get("mode", "")))
    hf = []
    if good: hf.append(f"{join_es(good)} m en buen estado")
    if fair: hf.append(f"{join_es(fair)} m regulares")
    t1 = (("Bandas: " + "; ".join(hf) + ". ") if hf else "") + (
        ("Se oye " + join_es([f"{c} en {b} {m}".strip() for c, b, m in top]) + ".") if top else "Poco DX en el clúster ahora mismo.")
    out.append([f"{franja} en HF", t1])
    xr = (L.get("space") or {}).get("xray") or ""
    sfi = L.get("sfi"); nsfi = len(((L.get("cotejo") or {}).get("vals") or {}).get("sfi") or [])
    xcl = xr[:1].upper()
    xtxt = {"X": "Rayos X en clase X: posible apagón de radio en la cara de día.",
            "M": "Rayos X en clase M: puede haber cortes breves de HF de día.",
            "C": "Rayos X en clase C: actividad moderada, sin efectos importantes.",
            "B": "Rayos X bajos: Sol tranquilo.", "A": "Rayos X muy bajos: Sol en calma."}.get(xcl, "")
    stxt = (f"SFI {r0(sfi)}" + (f" ({nsfi} fuentes)" if nsfi > 1 else "") + ": " +
            ("muy alto, bandas altas abiertas buena parte del día." if (sfi or 0) >= 150 else
             "bueno para 15, 12 y 10 m de día." if (sfi or 0) >= 110 else
             "medio; 20 y 17 m son las bandas fiables de día." if (sfi or 0) >= 90 else
             "bajo; de día lo mejor es 20 m.")) if sfi else ""
    out.append(["Sol", " ".join(x for x in (xtxt, stxt) if x).strip() or "Sin datos solares nuevos."])
    kp = L.get("kp"); wind = L.get("wind"); bz = L.get("bz")
    g = []
    if kp is not None:
        g.append("Campo tranquilo" if kp < 3 else "Campo algo agitado" if kp < 4 else "Campo activo" if kp < 5 else "Tormenta geomagnética")
        g[-1] += f", Kp {es_num(kp, 0)}"
    if wind: g.append(f"viento solar de {r0(wind)} km/s" + (" (rápido)" if wind >= 500 else ""))
    if bz is not None and bz <= -5: g.append(f"Bz al sur ({es_num(bz,1)} nT): el Kp puede subir en unas horas")
    tail = ("Buena noche para 40, 80 y 160 m." if (kp or 0) < 3 and not (7 <= h < 19) else
            "Buenos caminos polares hacia Japón y Norteamérica." if (kp or 0) < 3 else
            "Busca rumbos al sur: los del norte llegarán débiles." if (kp or 0) >= 4 else "")
    out.append(["Geomagnetismo", (join_es(g) + ". " if g else "") + tail])
    o27 = (L.get("outlook27") or {}).get("days") or []
    fut = [d for d in o27 if d[0] > now.strftime("%Y-%m-%d")][:10]
    p = []
    if fut:
        mx = max(fut, key=lambda d: d[1]); mn = min(fut, key=lambda d: d[1])
        trend = "al alza" if fut[-1][1] > (sfi or fut[0][1]) + 5 else "a la baja" if fut[-1][1] < (sfi or fut[0][1]) - 5 else "estable"
        p.append(f"NOAA espera flujo {trend} (entre {mn[1]} y {mx[1]} en diez días)")
        st = [d for d in fut if d[3] >= 5]
        if st:
            d0 = dt.date.fromisoformat(st[0][0])
            p.append(f"posible tormenta el {d0.day} de {MESES[d0.month-1]} (Kp {st[0][3]})")
    cme = L.get("cme") or []
    if cme:
        c = cme[0]
        at = parse_time(c.get("arrival"))
        if at: p.append(f"llega una eyección de masa coronal hacia el {at.day} de {MESES[at.month-1]} a las {at:%H} UTC: {c.get('note','')}")
    if kpfc_max is not None and kpfc_max >= 4 and not cme: p.append(f"Kp hasta {es_num(kpfc_max,1)} en los próximos tres días")
    if p: out.append(["Previsión", (". ".join(x[0].upper() + x[1:] for x in p)) + "."])
    return out

def txt_near(spots):
    nr = [s for s in spots if s.get("kind") == "near"]
    if not nr: return "Pocas estaciones ibéricas destacadas en esta ronda."
    refs = [s for s in nr if re.search(r"POTA|SOTA|WWFF|DME|DVGE|IOTA", s.get("c") or "")]
    sel = (refs + [s for s in nr if s not in refs])[:3]
    bits = []
    for s in sel:
        r = re.search(r"(POTA|SOTA|WWFF|DME|DVGE|IOTA)[^·]*", s.get("c") or "")
        bits.append(f"{s['call']} en {BNAME.get(s['band'],'')} {s.get('mode','')}".strip() + (f" ({r.group(0).strip()})" if r else ""))
    return f"{len(nr)} spots de EA, CT y alrededores. Destacan " + join_es(bits) + "."

def txt_vhf(spots, cond6):
    v = [s for s in spots if s.get("kind") == "vhf"]
    b6 = [s for s in v if s["band"] == 10]; b2 = [s for s in v if s["band"] >= 11]
    if not v:
        return {"tropo": None, "src": "clúster y HamQSL", "note": "Sin aperturas en 6 m, 2 m ni 70 cm en el clúster ahora mismo." +
                (f" E-Skip en 6 m: {cond6.lower()}." if cond6 else "")}
    parts = []
    if b6: parts.append(f"6 m abierto ({len(b6)} spots de más de 300 km)")
    if b2: parts.append(f"2 m/70 cm con {len(b2)} contactos largos, probable tropo")
    return {"tropo": None, "src": "clúster y HamQSL", "note": join_es(parts) + "."}

# ------------------------------------------------------------------ PRINCIPAL
SOURCES = [
    ["NOAA SWPC", "https://services.swpc.noaa.gov/"], ["HamQSL", "https://www.hamqsl.com/solar.html"],
    ["DRAO Penticton (NRCan)", "https://www.spaceweather.gc.ca/forecast-prevision/solar-solaire/solarflux/sx-4-en.php"],
    ["GFZ Potsdam", "https://kp.gfz-potsdam.de/"], ["SILSO (Real Observatorio de Bélgica)", "https://www.sidc.be/SILSO/"],
    ["KC2G", "https://prop.kc2g.com/"], ["GIRO DIDBase (UMass Lowell)", "https://giro.uml.edu/"],
    ["NASA CCMC DONKI", "https://kauai.ccmc.gsfc.nasa.gov/DONKI/"], ["WSPR.live", "https://wspr.live/"],
    ["NG3K ADXO", "https://www.ng3k.com/misc/adxo.html"], ["Club Log Most Wanted", "https://clublog.org/mostwanted.php"],
    ["Spothole (M0TRT)", "https://spothole.app/"], ["DX Summit", "https://www.dxsummit.fi/"],
    ["HamQTH DX Cluster", "https://www.hamqth.com/dxcluster.php"], ["POTA", "https://pota.app/"], ["SOTAwatch", "https://sotawatch.sota.org.uk/"],
    ["Country files cty.csv (AD1C)", "https://www.country-files.com/"]]

def do_solar(L, cty):
    t0 = now_utc()
    jobs = {"NOAA wwv": (src_noaa_wwv,), "NOAA f107": (src_noaa_f107,), "NOAA Kp": (src_noaa_kp,), "GFZ Kp": (src_gfz_kp,),
            "HamQSL": (src_hamqsl,), "DRAO": (src_drao,), "SILSO EISN": (src_eisn,), "NOAA SSN": (src_noaa_ssn,),
            "NOAA viento": (src_wind,), "NOAA densidad": (src_plasma,), "NOAA rayos X": (src_xray,), "NOAA escalas": (src_scales,),
            "NOAA 3 días": (src_3day,), "NOAA 27 días": (src_27day,), "OVATION": (src_ovation,), "DONKI": (src_cme,),
            "KC2G": (src_kc2g,), "KC2G eSSN": (src_essn,), "GIRO EB040": (src_giro, "EB040"), "GIRO EA036": (src_giro, "EA036"),
            "NOAA ciclo": (src_pred_cycle,), "SILSO ciclo": (src_silso_cycle,), "WSPR": (src_wspr,),
            "NG3K": (src_ng3k, cty), "Club Log": (src_clublog_mw, cty)}
    R = parallel(jobs)
    W, F, K, G, H, D = R["NOAA wwv"] or {}, R["NOAA f107"], R["NOAA Kp"] or {}, R["GFZ Kp"], R["HamQSL"] or {}, R["DRAO"]
    vals = {}
    def add(k, src, v):
        if v is not None and v != "": vals.setdefault(k, []).append([src, v])
    add("sfi", "NOAA", F if F is not None else W.get("sfi")); add("sfi", "HamQSL", H.get("sfi")); add("sfi", "DRAO Penticton", D)
    add("kp", "NOAA", K.get("kp") if K.get("kp") is not None else W.get("kp")); add("kp", "GFZ Potsdam", G); add("kp", "HamQSL", H.get("kp"))
    add("a", "NOAA", W.get("a")); add("a", "HamQSL", H.get("a"))
    add("ssn", "SILSO EISN", R["SILSO EISN"]); add("ssn", "NOAA", R["NOAA SSN"]); add("ssn", "HamQSL", H.get("ssn"))
    wnd = R["NOAA viento"] or {}
    add("wind", "NOAA", wnd.get("wind")); add("wind", "HamQSL", H.get("wind"))
    add("bz", "NOAA", wnd.get("bz")); add("bz", "HamQSL", H.get("bz"))
    xr = R["NOAA rayos X"] or {}
    add("xray", "NOAA", xr.get("now")); add("xray", "HamQSL", H.get("xray"))
    kc = R["KC2G"]; g1 = R["GIRO EB040"]; g2 = R["GIRO EA036"]
    if kc: add("fof2", "KC2G", r1(kc["fof2"])); add("muf", "KC2G", r1(kc["mufd"]))
    for nm, g in (("GIRO EB040", g1), ("GIRO EA036", g2)):
        if g: add("fof2", nm, r1(g[1])); add("muf", nm, r1(g[2]) if g[2] else None)
    es = R["KC2G eSSN"] or {}
    add("essn", "KC2G", r1(es.get("essn")))
    def med(k):
        v = [x[1] for x in vals.get(k, []) if isinstance(x[1], (int, float))]
        return median(v)
    if vals.get("sfi"): L["sfi"] = r0(med("sfi"))
    if vals.get("kp"):  L["kp"] = r0(med("kp"))
    if vals.get("wind"): L["wind"] = r0(med("wind"))
    if vals.get("bz"):  L["bz"] = r1(med("bz"))
    if wnd.get("bt") is not None: L["bt"] = r1(wnd["bt"])
    sp = dict(L.get("space") or {})
    if vals.get("ssn"): sp["ssn"] = r0(med("ssn"))
    if vals.get("a"): sp["a"] = r1(med("a"))
    if R["NOAA densidad"] is not None: sp["dens"] = r1(R["NOAA densidad"])
    xc = most_common([str(x[1]).upper() for x in vals.get("xray", [])])
    if xc: sp["xray"] = xr.get("now") or xc
    sc = R["NOAA escalas"] or {}
    if sc.get("S") is not None:
        sp["proton"] = f"S{sc['S']} " + ("normal" if str(sc["S"]) == "0" else "tormenta de protones")
    ov = R["OVATION"]
    if ov and ov[1] is not None:
        sp["aurora"] = f"{int(ov[0])} % en el norte de Europa ({int(ov[1])}° N)" if ov[0] else "Sin aurora sobre Europa"
    L["space"] = sp
    th = R["NOAA 3 días"] or {}
    if th.get("blocks"):
        L["kpfc"] = {"base": th["base"], "issued": th.get("issued", "NOAA"), "days": th["days"], "blocks": th["blocks"]}
    rad = dict(L.get("radio") or {})
    for k in ("r12", "r3", "s1"):
        v = sc.get(k) if sc.get(k) is not None else th.get(k)
        if v is not None: rad[k] = r0(v)
    L["radio"] = rad
    if rad.get("r12") is not None:
        L["flare"] = f"M {rad['r12']} % · X {rad.get('r3', 0)} %"
    if R["NOAA 27 días"]: L["outlook27"] = R["NOAA 27 días"]
    if R["DONKI"] is not None: L["cme"] = R["DONKI"]
    if R["WSPR"]: L["wspr"] = {"at": iso(t0), "bands": R["WSPR"]}
    fos = [x[1] for x in vals.get("fof2", [])]; mus = [x[1] for x in vals.get("muf", []) if x[1]]
    if fos:
        L["iono"] = {"station": kc["station"] if kc else ("Roquetes-Ebro (EB040)" if g1 else "El Arenosillo (EA036)"),
                     "fof2": r1(median(fos)), "mufd": r1(median(mus)) if mus else None,
                     "time": (kc or {}).get("time") or (g1 or g2 or [None])[0]}
    else:
        L["iono"] = None
    if es.get("essn") is not None:
        L["essn"] = r1(es["essn"])
        tt = parse_time(es.get("time"))
        L["essnSrc"] = "KC2G" + (f", {fmt_dm(tt)} {tt:%H:%M} UTC" if tt else "")
    if R["NOAA ciclo"]: L["ssnPred"] = R["NOAA ciclo"]
    if R["SILSO ciclo"]: L["cycle"] = R["SILSO ciclo"]
    cot = {"at": iso(t0), "vals": vals}
    if H.get("cond"):
        cot["hamqsl"] = H["cond"]
    L["cotejo"] = cot
    kpmax = max((max(b) for b in (L.get("kpfc") or {}).get("blocks", [[0]])), default=None)
    L["kpNote"] = txt_kp(L.get("kp"), kpmax, sc.get("G"))
    if R["NG3K"] is not None and len(R["NG3K"]) > 0:
        L["dx"] = dx_from_ng3k(R["NG3K"], R["Club Log"] or {}, L.get("dx"))
        L["dxHidden"] = 0
    elif L.get("dx"):
        today = t0.date()
        L["dx"] = [d for d in L["dx"] if not d.get("end") or d["end"] >= today.isoformat()]
    L["solar"] = txt_solar(L, t0, kpmax)
    L["vhf"] = txt_vhf(L.get("spots") or [], (H.get("cond") or {}).get("6m"))
    L["updated"] = fmt_local(t0)
    L["updatedUTC"] = iso(t0)
    L["solarUTC"] = iso(t0)
    ok = sum(1 for v in R.values() if v not in (None, {}, []))
    return f"Sol: {ok}/{len(R)} fuentes · SFI {L.get('sfi')} ({len(vals.get('sfi', []))} fuentes) · Kp {L.get('kp')} ({len(vals.get('kp', []))} fuentes) · {len(L.get('dx') or [])} DXpediciones"

def do_cluster(L, cty):
    c = build_cluster(L, cty)
    if not c["_answered"]:
        L["spotsChecked"] = c["spotsChecked"]
        L["spotsSrc"] = c["spotsSrc"]
        return "Clúster: ninguna fuente respondió; se conservan los spots anteriores"
    for k in ("spots", "heard", "beacons", "spotsNew", "spotsSrc", "spotsChecked", "spotsUTC"):
        L[k] = c[k]
    L["nearNote"] = txt_near(L["spots"])
    L["vhf"] = txt_vhf(L["spots"], ((L.get("cotejo") or {}).get("hamqsl") or {}).get("6m"))
    # avisos: DXpediciones activas o entidades del top 100 de Club Log, de 160 a 6 m, entre los nuevos
    dxcalls = {d["call"] for d in (L.get("dx") or [])}
    mw = {d.get("dxcc"): d.get("mw") for d in (L.get("dx") or []) if d.get("mw")}
    items = []
    for s in L["spots"]:
        if s["band"] > 10: continue
        need = "DXpedición" if s["call"] in dxcalls else None
        if not need and s.get("dxcc") in mw and (mw[s["dxcc"]] or 999) <= 100: need = "entidad rara"
        if need: items.append({k: s[k] for k in ("call", "f", "band", "mode", "t", "by")} | {"need": need})
    L["alert"] = {"at": c["spotsChecked"], "items": items[:12]}
    if not L.get("updatedUTC"):
        L["updatedUTC"] = c["spotsChecked"]
    return f"Clúster: {c['_reports']} reportes de {join_es(c['_answered'])} · {len(L['spots'])} spots ({c['spotsNew']} nuevos) · {len(L['heard'])} entidades oídas"

def main():
    what = (sys.argv[1] if len(sys.argv) > 1 else "all").lower()
    os.makedirs(DATA, exist_ok=True)
    try:
        L = json.load(open(LIVE, encoding="utf-8"))
    except Exception:
        L = {}
    log("Cargando tabla de entidades…")
    cty = load_cty()
    notes = []
    if what in ("solar", "all"):
        log("Sol, ionosfera, previsiones y DXpediciones…")
        notes.append(do_solar(L, cty))
    if what in ("cluster", "all"):
        log("Clústeres…")
        notes.append(do_cluster(L, cty))
        if what == "cluster" and L.get("cotejo"):
            kpmax = max((max(b) for b in (L.get("kpfc") or {}).get("blocks", [[0]])), default=None)
            L["solar"] = txt_solar(L, now_utc(), kpmax)
    L["sources"] = SOURCES
    L["status"] = {"state": "done", "at": iso(now_utc()), "note": " · ".join(notes)}
    tmp = LIVE + ".tmp"
    json.dump(L, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, LIVE)
    log("Escrito data/live.json:", L["status"]["note"])

if __name__ == "__main__":
    main()
