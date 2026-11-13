# Cómo se generan las zonas VOACAP

Las 132 zonas que usa la plataforma están en Cloudflare Pages (`acracb-voacap.pages.dev/hubs/v3/`).
Estas herramientas sirven para volver a generarlas desde cero si algún día hiciera falta.

1. **VOACAP:** compilar `voacapl` (https://github.com/jawatson/voacapl, commit `c12a98b`) con
   `./configure --prefix=$HOME/vc/inst && make && make install`, crear la carpeta de datos `itshfbc`
   con `makeitshfbc` y copiar `acr_vm.voa` a `itshfbc/antennas/default/`.
2. **Niveles 20, 40, 60, 80 y 100:** `python3 runall.py` (usa `gen.py`, `parse.py`, `hubs.py` y `targets.json`).
   Unas 3 horas con 2 núcleos.
3. **Nivel 140:** `python3 gen140.py 0 2` y `python3 gen140.py 1 2` a la vez. Unos 35 minutos.
4. **Formato 3:** `python3 repack3.py 0 1` (6 niveles, diferencias entre niveles y LZMA; datos exactos).
5. **Comprobación:** `python3 verify3.py` debe terminar con «distintos 0».
6. **Subida:** poner la carpeta `hubs/v3` en la rama `voacap-datos` del repositorio y lanzar la tarea
   «Zonas VOACAP a Cloudflare» (pestaña Actions › Run workflow). Después se puede borrar la rama.

Las rutas de los scripts apuntan a `/tmp/claude-0/vc`: hay que ajustarlas al sitio donde se trabaje.
