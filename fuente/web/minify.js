// 2.5.7: compacta el código propio de la web (no el de la versión artefacto). Mismo comportamiento, menos peso y menos trabajo al abrir.
// Uso: node minify.js <carpeta lib>. Si terser no está instalado, no hace nada.
const fs=require("fs"),path=require("path");let terser;
try{terser=require(path.join(__dirname,"..","pub","node_modules","terser"))}catch(e){console.log("terser no instalado: se publica sin compactar");process.exit(0)}
(async()=>{const dir=process.argv[2];let a=0,b=0;
 for(const f of fs.readdirSync(dir).filter(f=>/^(app\d|hubs|geolbl)-(es|en)-[0-9a-f]{10}\.js$/.test(f))){
  const p=path.join(dir,f),src=fs.readFileSync(p,"utf8");
  const r=await terser.minify(src,{ecma:2020,compress:{passes:2,keep_fargs:true,keep_infinity:true},mangle:{toplevel:false},format:{comments:false}});
  if(!r.code)throw new Error("sin resultado en "+f);fs.writeFileSync(p,r.code);a+=src.length;b+=r.code.length}
 console.log(`código compactado: ${Math.round(a/1024)} kB -> ${Math.round(b/1024)} kB`)})().catch(e=>{console.error(e);process.exit(1)});
