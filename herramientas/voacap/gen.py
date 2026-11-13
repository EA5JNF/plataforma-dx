"""Genera la base VOACAP de una zona (hub): 266 destinos, 12 meses, 5 SSN, 24 h, 11 bandas.
Mismo formato que usa la plataforma: por camino un bloque de 5 SSN × 24 h × 34 bytes y 24 h × 11 bandas × 2 bytes
(ángulo de salida y altura virtual/4 con SSN 60). Hora h = hora UT h."""
import os,sys,json,math,subprocess,shutil,gzip,time
import numpy as np
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from parse import parse
HOME="/tmp/claude-0/vc";BIN=HOME+"/inst/bin"
F=[1.84,3.7,7.1,14.2,18.13,21.3,24.95,28.5,5.36,10.12,50.15];SSN=[20,40,60,80,100];NB=11
HSZ=1+NB*3;SSZ=24*HSZ;HOFF=len(SSN)*SSZ;BLK=HOFF+24*NB*2
T=json.load(open(HOME+"/targets.json"))
def gc(a,b):
    R=math.pi/180;la1,lo1,la2,lo2=a[0]*R,a[1]*R,b[0]*R,b[1]*R
    return 6371*math.acos(max(-1,min(1,math.sin(la1)*math.sin(la2)+math.cos(la1)*math.cos(la2)*math.cos(lo2-lo1))))
def circ(tx,rx):
    f=lambda v,p,n:"%9.2f%s"%(abs(v),p if v>=0 else n)
    return "%5.2f%s"%(abs(tx[0]),"N" if tx[0]>=0 else "S")+f(tx[1],"E","W")+f(rx[0],"N","S")+f(rx[1],"E","W")
def block(tx,rx,meth,ssn,first=True):
    fr="".join("%5.2f"%f for f in F)
    return (f"LINEMAX     999       number of lines-per-page\nCOEFFS    CCIR\nTIME          1   24    1    1\n"
     f"MONTH      2026{''.join('%5.2f'%m for m in range(1,13))}\nSUNSPOT   {''.join('%5.1f'%ssn for _ in range(12))}\n"
     f"LABEL     TX                  RX\nCIRCUIT   {circ(tx,rx)}  {'L' if meth==21 else 'S'}     0\n"
     f"SYSTEM    {'%5.2f%5.0f%5.2f%5.0f%5.1f%5.2f%5.2f'%(1.0,150,3.0,90,73,3.0,0.1)}\nFPROB      1.00 1.00 1.00 0.00\n"
     +(f"ANTENNA       1    1    2   30     0.000[default/acr_vm.voa   ]  0.0    0.1000\n"
     f"ANTENNA       2    2    2   30     0.000[default/isotrope     ]  0.0    0.0000\n" if first else "")+
     f"FREQUENCY {fr}\nMETHOD       {meth}    0\nEXECUTE\n")
def run_paths(paths,wd):
    deck="".join(block(tx,rx,meth,s,first=(i==0 and s==SSN[0])) for i,(tx,rx,meth) in enumerate(paths) for s in SSN)+"QUIT\n"
    open(wd+"/run/g.dat","w").write(deck)
    subprocess.run([BIN+"/voacapl","-s",wd,"g.dat","g.out"],cwd=wd+"/run",capture_output=True)
    B=parse(open(wd+"/run/g.out").read())
    assert len(B)==len(paths)*len(SSN)*12,(len(B),len(paths))
    return B
def q(v,lo,hi):return int(max(lo,min(hi,round(v))))
def hub(hid,lat,lon,out,wd):
    tx=(lat,lon);paths=[];os_=[];ol=[]
    for i,(tid,la,lo) in enumerate(T):paths.append((tx,(la,lo),30));
    lp=[i for i,(tid,la,lo) in enumerate(T) if gc(tx,(la,lo))>8000]
    for i in lp:paths.append((tx,(T[i][1],T[i][2]),21))
    n=len(paths);M=[np.zeros(n*BLK,dtype=np.uint8) for _ in range(12)]
    S=[m.view(np.int8) for m in M]
    CH=8
    for c in range(0,n,CH):
        part=paths[c:c+CH];B=run_paths(part,wd);k=0
        for pi in range(len(part)):
            base=(c+pi)*BLK
            for j in range(len(SSN)):
                for mon in range(12):
                    blk=B[k];k+=1;u=M[mon];s=S[mon]
                    for hh,v in blk["h"].items():
                        o=base+j*SSZ+hh*HSZ;u[o]=q(v["muf"]*4,0,255)
                        for b in range(NB):
                            sn=v["snr"][b];s[o+1+b*3]=q(sn if sn is not None else -128,-128,127)
                            u[o+2+b*3]=q(v["lw"][b] or 0,0,255);u[o+3+b*3]=q(v["up"][b] or 0,0,255)
                            if j==2:
                                oh=base+HOFF+(hh*NB+b)*2;u[oh]=q(v["tang"][b] or 0,0,255);u[oh+1]=q((v["vh"][b] or 0)/4,0,255)
    idx={"id":hid,"lat":lat,"lon":lon,"os":[i*BLK for i in range(len(T))],"ol":[-1]*len(T),"nb":NB,"ssn":SSN,"blk":BLK}
    for k,i in enumerate(lp):idx["ol"][i]=(len(T)+k)*BLK
    os.makedirs(out,exist_ok=True)
    idx["n"]=n;json.dump(idx,open(out+"/idx.json","w"),separators=(",",":"))
    for mon in range(12):pack(M[mon],n,out,mon+1)
    return n
def pack(a,n,out,mon):
    """Por mes: un archivo por nivel de SSN (MUF, SNR y deciles en medio byte) y otro con ángulo y altura virtual.
    Todo ordenado por campo para que comprima mejor."""
    A=a.reshape(n,BLK)
    for j in range(len(SSN)):
        sl=A[:,j*SSZ:(j+1)*SSZ].reshape(n,24,HSZ)
        muf=sl[:,:,0];S=sl[:,:,1::3];DL=sl[:,:,2::3].astype(np.float64);DU=sl[:,:,3::3].astype(np.float64)
        pk=((np.minimum(15,np.round(DL/2)).astype(np.uint8)<<4)|np.minimum(15,np.round(DU/2)).astype(np.uint8))
        buf=np.concatenate([muf.reshape(-1),np.ascontiguousarray(np.moveaxis(S,2,0)).reshape(-1),np.ascontiguousarray(np.moveaxis(pk,2,0)).reshape(-1)])
        open(out+f"/m{mon:02d}s{j}.gz","wb").write(gzip.compress(buf.tobytes(),9))
    hp=A[:,HOFF:].reshape(n,24,NB,2)
    open(out+f"/m{mon:02d}h.gz","wb").write(gzip.compress(np.ascontiguousarray(hp.transpose(3,2,0,1)).tobytes(),9))
if __name__=="__main__":
    hid,lat,lon,out=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]),sys.argv[4]
    wd=HOME+"/wd_"+hid
    if not os.path.exists(wd):
        os.makedirs(wd);[shutil.copytree(HOME+"/itshfbc/"+d,wd+"/"+d,symlinks=True) for d in os.listdir(HOME+"/itshfbc")]
    t=time.time();n=hub(hid,lat,lon,out,wd);print(hid,n,"paths",round(time.time()-t),"s")
    shutil.rmtree(wd)
