"""Nivel SSN 140 de una zona: mismo cálculo que gen.py, solo ese nivel. Guarda por mes el búfer del nivel
(MUF, SNR y deciles en medio byte, ordenado por campo) sin comprimir en l140/<zona>/mMMs5.bin"""
import os,sys,json,shutil,time
import numpy as np
sys.path.insert(0,"/tmp/claude-0/vc")
import gen
gen.SSN=[140]
NB=11;HSZ=1+NB*3
def run(hid,lat,lon):
    out="/tmp/claude-0/vc/l140/"+hid;os.makedirs(out,exist_ok=True)
    if os.path.exists(out+"/m12s5.bin"):return
    wd="/tmp/claude-0/vc/wd_"+hid
    if not os.path.exists(wd):
        os.makedirs(wd);[shutil.copytree("/tmp/claude-0/vc/itshfbc/"+d,wd+"/"+d,symlinks=True) for d in os.listdir("/tmp/claude-0/vc/itshfbc")]
    tx=(lat,lon);T=gen.T;paths=[(tx,(la,lo),30) for (tid,la,lo) in T]
    lp=[i for i,(tid,la,lo) in enumerate(T) if gen.gc(tx,(la,lo))>8000]
    paths+=[(tx,(T[i][1],T[i][2]),21) for i in lp];n=len(paths)
    M=[np.zeros((n,24,HSZ),dtype=np.uint8) for _ in range(12)]
    for c in range(0,n,8):
        part=paths[c:c+8];B=gen.run_paths(part,wd);k=0
        for pi in range(len(part)):
            for mon in range(12):
                blk=B[k];k+=1;u=M[mon];s=u.view(np.int8)
                for hh,v in blk["h"].items():
                    u[c+pi,hh,0]=gen.q(v["muf"]*4,0,255)
                    for b in range(NB):
                        sn=v["snr"][b];s[c+pi,hh,1+b*3]=gen.q(sn if sn is not None else -128,-128,127)
                        u[c+pi,hh,2+b*3]=gen.q(v["lw"][b] or 0,0,255);u[c+pi,hh,3+b*3]=gen.q(v["up"][b] or 0,0,255)
    for mon in range(12):
        sl=M[mon];muf=sl[:,:,0];S=sl[:,:,1::3];DL=sl[:,:,2::3].astype(np.float64);DU=sl[:,:,3::3].astype(np.float64)
        pk=((np.minimum(15,np.round(DL/2)).astype(np.uint8)<<4)|np.minimum(15,np.round(DU/2)).astype(np.uint8))
        buf=np.concatenate([muf.reshape(-1),np.ascontiguousarray(np.moveaxis(S,2,0)).reshape(-1),np.ascontiguousarray(np.moveaxis(pk,2,0)).reshape(-1)])
        open(out+f"/m{mon+1:02d}s5.bin","wb").write(buf.tobytes())
if __name__=="__main__":
    import hubs
    H=[(hubs.loc4(a,b),a,b) for _,a,b in hubs.H]
    part,np_=int(sys.argv[1]),int(sys.argv[2])
    for hid,a,b in H[part::np_]:
        t=time.time();run(hid,a,b);print(hid,round(time.time()-t),"s",flush=True)
