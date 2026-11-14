import re,json,os
HERE=os.path.dirname(os.path.abspath(__file__))
RUN=re.compile(r'[^<>"`\'{}();=\[\]\n\\|$&+*!?]+')
def _mask(s):
    # same cleaning as the extractor: data blocks, styles, comments and inline images are never translated
    s=re.sub(r'<script id="[^"]*" type="application/json">.*?</script>',lambda m:"\0"*len(m.group(0)),s,flags=re.S)
    s=re.sub(r'<style[^>]*>.*?</style>',lambda m:"\0"*len(m.group(0)),s,flags=re.S)
    s=re.sub(r'<script>/\* biblioteca incluida.*?</script>',lambda m:"\0"*len(m.group(0)),s,flags=re.S)
    s=re.sub(r'/\*.*?\*/',lambda m:"\0"*len(m.group(0)),s,flags=re.S)
    s=re.sub(r'<!--.*?-->',lambda m:"\0"*len(m.group(0)),s,flags=re.S)
    s=re.sub(r'data:image/[^"\')]+',lambda m:"\0"*len(m.group(0)),s)
    return s
def load():
    d=json.load(open(os.path.join(HERE,"es_en.json"),encoding="utf-8"))
    p=os.path.join(HERE,"es_en_extra.json")
    if os.path.exists(p):d.update(json.load(open(p,encoding="utf-8")))
    return d
def translate(code,d=None):
    d=d or load();m=_mask(code);out=[];last=0;n=0
    for r in RUN.finditer(m):
        t=r.group(0)
        if "\0" in t:continue
        st=t.strip()
        if st in d:
            a=r.start()+(len(t)-len(t.lstrip()));b=a+len(st)
            out.append(code[last:a]);out.append(d[st]);last=b;n+=1
    out.append(code[last:]);return "".join(out),n
