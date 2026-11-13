"""Formato 3 de las zonas VOACAP (hubs/v3/<zona>/):
 - 6 niveles de manchas: 20, 40, 60, 80, 100 y 140.
 - Datos exactos: lo que se lee es idéntico, byte a byte, a lo que calculó VOACAP.
 - Niveles 1 (40) y 3 (80) enteros; 0 y 2 como diferencia con el 1 y 4 como diferencia con el 3, compartiendo con él
   cada uno con su propia dispersión día a día (DL/DU); el 5 (140) como diferencia con el 4.
 - Compresión LZMA (formato .lzma clásico)."""
import gzip,lzma,json,os,sys
import numpy as np
SRC="/home/claude/plataforma-dx/hubs/v1";L140="/tmp/claude-0/vc/l140";DST="/tmp/claude-0/vc/pack3/v3"
NB=11;NP=1+2*NB
def Z(b):return lzma.compress(b,format=lzma.FORMAT_ALONE,preset=9|lzma.PRESET_EXTREME)
def U(x):return np.ascontiguousarray((x%256).astype(np.uint8)).tobytes()
def lev(raw,n):
    a=np.frombuffer(raw,np.uint8).reshape(NP,n,24);x=a.astype(np.int16)
    return x
def zone(z):
    o=os.path.join(DST,z)
    if os.path.exists(o+"/idx.json"):return "ya"
    if not os.path.exists(f"{L140}/{z}/m12s5.bin"):return "sin140"
    j=json.load(open(f"{SRC}/{z}/idx.json"));n=j["n"];os.makedirs(o,exist_ok=True)
    for m in range(1,13):
        L=[lev(gzip.open(f"{SRC}/{z}/m{m:02d}s{k}.gz").read(),n) for k in range(5)]+[lev(open(f"{L140}/{z}/m{m:02d}s5.bin","rb").read(),n)]
        enc={0:L[0]-L[1],1:L[1],2:L[2]-L[1],3:L[3],4:L[4]-L[3],5:L[5]-L[4]}
        for k,v in enc.items():open(f"{o}/m{m:02d}s{k}.lzma","wb").write(Z(U(v)))
        open(f"{o}/m{m:02d}h.lzma","wb").write(Z(gzip.open(f"{SRC}/{z}/m{m:02d}h.gz").read()))
    blk0=j["blk"];NBD=11;HSZ=1+NBD*3;SSZ=24*HSZ;blk=6*SSZ+24*NBD*2
    j["os"]=[x//blk0*blk if x>=0 else -1 for x in j["os"]];j["ol"]=[x//blk0*blk if x>=0 else -1 for x in j["ol"]]
    j["ssn"]=[20,40,60,80,100,140];j["blk"]=blk;j["fmt"]=3
    json.dump(j,open(o+"/idx.json","w"),separators=(",",":"));return "ok"
if __name__=="__main__":
    zs=sorted(os.listdir(SRC));part,np_=int(sys.argv[1]),int(sys.argv[2])
    for z in zs[part::np_]:print(z,zone(z),flush=True)
