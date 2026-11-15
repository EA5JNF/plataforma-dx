// minimiza la hoja de estilos sin reordenar reglas (restructure:false): mismo resultado visual, menos bytes
const csso=require(process.env.CSSO||"csso");let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(csso.minify(s,{restructure:false,comments:false}).css));
