import http.server,gzip,sys,os
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
    def do_GET(self):
        p=self.translate_path(self.path.split('?')[0])
        if os.path.isdir(p):p=os.path.join(p,'index.html')
        if not os.path.isfile(p):return super().do_GET()
        d=open(p,'rb').read();ct=self.guess_type(p)
        self.send_response(200);self.send_header('Content-Type',ct)
        if p.endswith(('.html','.js','.json','.css')):d=gzip.compress(d,6);self.send_header('Content-Encoding','gzip')
        self.send_header('Content-Length',str(len(d)));self.end_headers();self.wfile.write(d)
os.chdir(sys.argv[1]);http.server.ThreadingHTTPServer(('',int(sys.argv[2])),H).serve_forever()
