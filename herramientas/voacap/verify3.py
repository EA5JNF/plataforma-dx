"""Comprueba las 132 zonas del formato 3 contra los datos originales: los 6 niveles y los ángulos, byte a byte."""
import lzma,gzip,json,os,sys
import numpy as np
SRC="/home/claude/plataforma-dx/hubs/v1";L140="/tmp/claude-0/vc/l140";DST="/tmp/claude-0/vc/pack3/v3";NB=11;NP=23
REF={0:1,2:1,4:3,5:4};bad=0;nz=0;tot=0
for z in sorted(os.listdir(SRC)):
    j=json.load(open(f"{DST}/{z}/idx.json"));n=j["n"];j1=json.load(open(f"{SRC}/{z}/idx.json"))
    assert j["ssn"]==[20,40,60,80,100,140] and j["fmt"]==3 and n==j1["n"]
    assert all((a<0 and b<0) or (a//j1["blk"]==b//j["blk"]) for a,b in zip(j1["os"]+j1["ol"],j["os"]+j["ol"]))
    for m in range(1,13):
        F={k:np.frombuffer(lzma.decompress(open(f"{DST}/{z}/m{m:02d}s{k}.lzma","rb").read()),np.uint8) for k in range(6)};D={}
        def get(k):
            if k in D:return D[k]
            D[k]=F[k] if k not in REF else ((F[k].astype(np.int16)+get(REF[k]))%256).astype(np.uint8);return D[k]
        for k in range(6):
            o=open(f"{L140}/{z}/m{m:02d}s5.bin","rb").read() if k==5 else gzip.open(f"{SRC}/{z}/m{m:02d}s{k}.gz").read()
            if get(k).tobytes()!=o:bad+=1;print("DISTINTO",z,m,k)
        if lzma.decompress(open(f"{DST}/{z}/m{m:02d}h.lzma","rb").read())!=gzip.open(f"{SRC}/{z}/m{m:02d}h.gz").read():bad+=1;print("DISTINTO",z,m,"h")
        tot+=7
    nz+=1
print("zonas",nz,"archivos",tot,"distintos",bad)
