import subprocess,sys,os,json,time
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,"/tmp/claude-0/vc");from hubs import H,loc4
OUT="/tmp/claude-0/vc/pack"
def job(h):
    name,lat,lon=h;hid=loc4(lat,lon);out=f"{OUT}/{hid}"
    if os.path.exists(out+"/m12h.gz"):return hid,"skip"
    r=subprocess.run(["python3","/tmp/claude-0/vc/gen.py",hid,str(lat),str(lon),out],capture_output=True,text=True)
    return hid,(r.stdout.strip() or r.stderr[-300:])
with ThreadPoolExecutor(2) as ex:
    for hid,msg in ex.map(job,H):print(time.strftime("%H:%M:%S"),hid,msg,flush=True)
json.dump([{"id":loc4(a,b),"n":n,"lat":a,"lon":b} for n,a,b in H],open(OUT+"/hubs.json","w"),ensure_ascii=False)
print("DONE",flush=True)
