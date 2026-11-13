import re
def parse(out):
    """returns list of blocks: each {mon,ssn,hours:{h:{muf,snr[11],lw[11],up[11]}}}"""
    blocks=[];cur=None
    lines=out.split("\n");i=0
    while i<len(lines):
        l=lines[i]
        m=re.match(r"\s+(\w\w\w)\s+(\d{4})\s+SSN =\s+([\d.]+)",l)
        if m:
            cur={"mon":m.group(1),"ssn":float(m.group(3)),"h":{}};blocks.append(cur)
        if l.rstrip().endswith(" FREQ") and cur is not None:
            v=l.split();hr=float(v[0]);muf=float(v[1]);rows={}
            for k in range(1,24):
                ll=lines[i+k];name=ll[66:].strip() if len(ll)>66 else ""
                vals=[ll[6+j*5:11+j*5] for j in range(12)]
                rows[name]=vals
            def col(n):
                return [float(x) if x.strip() not in ("","-") else None for x in rows[n][1:12]]
            cur["h"][int(round(hr))%24]={"muf":muf,"snr":col("SNR"),"lw":col("SNR LW"),"up":col("SNR UP"),"tang":col("TANGLE"),"vh":col("V HITE")}
            i+=23;continue
        i+=1
    return blocks
