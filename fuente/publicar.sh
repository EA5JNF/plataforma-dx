#!/bin/bash
# Monta la plataforma desde esta carpeta y copia el resultado a la raíz del repositorio.
# Uso: cd fuente && ./publicar.sh   (luego revisa con git status, haz commit y push)
set -e
F=$(cd "$(dirname "$0")" && pwd); R=$(dirname "$F")
[ -d "$F/pub/node_modules" ] || (cd "$F/pub" && npm install --no-audit --no-fund)
python3 -m pip show pillow >/dev/null 2>&1 || python3 -m pip install pillow
(cd "$F/web" && python3 build.py | tail -1)
for f in "$F"/web/out/lib/*.js; do node --check "$f" >/dev/null 2>&1 || { echo "ERROR de sintaxis en $f: no se publica"; exit 1; }; done
O="$F/web/out"
cp "$O"/index.html "$O"/en.html "$O"/sw.js "$O"/icon-*.png "$O"/manifest*.webmanifest "$R"/
mkdir -p "$R/lib"; cp "$O"/lib/* "$R/lib/"
cd "$R"; keep=$(grep -oh 'lib/[a-z0-9.-]*\.js' index.html en.html; ls "$O/lib" | sed 's|^|lib/|')
for f in lib/*-??????????.js; do [ -e "$f" ] || continue; echo "$keep" | grep -qx "$f" || rm -f "$f"; done
echo "Listo. Revisa con «git status» y publica con «git add -A && git commit -m '…' && git push»."
