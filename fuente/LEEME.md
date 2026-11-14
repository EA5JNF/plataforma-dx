# Código fuente de la Plataforma DX ACRACB

Idea original y realización: Alfredo, EA5JNF. © ACRACB.

La web publicada (raíz del repositorio: `index.html`, `en.html`, `lib/`, `sw.js`) se genera a partir de esta carpeta.
No se edita a mano: se cambia aquí y se vuelve a montar.

**Dónde se publica (desde el 14/11/2026):** solo en la web de GitHub Pages (español e inglés) y, para los datos VOACAP, en Cloudflare.
La versión de artefacto de Claude ya no se mantiene: `build.py` todavía genera `artifact.html`, pero no se publica en ningún sitio.
Cada cambio debe funcionar en todas las pantallas (móvil, tableta, ordenador, 2K, tele 720p y 4K), con los dos tamaños de letra y en los dos temas.

## Qué hay

| Carpeta | Contenido |
|---|---|
| `pub/base_clean.html` | La base de la plataforma (estructura, estilos y lógica principal). |
| `web/*.js`, `web/common.css` | Módulos añadidos: clúster y avisos, mapa, Sol, satélites, ISS, glosario, rendimiento, etc. |
| `web/build.py` | Monta la plataforma: aplica los cambios a la base, une los módulos, genera la versión en inglés y la del artefacto. |
| `web/updater.js` | El actualizador que lee las fuentes gratuitas desde el navegador. |
| `web/hubs.js` | Lectura de la previsión VOACAP (datos en Cloudflare Pages). |
| `web/VERSION` | Número de versión (el pie muestra la versión y la fecha). |
| `i18n/` | Traducción al inglés de Estados Unidos (`es_en.json`, `es_en_extra.json`, `en_re.json`). |
| `voa/` | Medias mensuales VOACAP incluidas en la página. |
| `ext/` | Mapa de costas 1:50 m, lista de zonas VOACAP e icono original. |
| `pub/*.js` | Pruebas automáticas (todas las pantallas, inglés, seguridad, avisos…). |

## Montar y publicar

Hace falta Python 3 con Pillow y Node.js.

```
cd fuente
./publicar.sh
git add -A && git commit -m "Versión X.Y.Z" && git push
```

`publicar.sh` instala las bibliotecas la primera vez, monta, comprueba la sintaxis de todo el código y copia el resultado a la raíz.
Si algún archivo tiene un error, no copia nada.

## Probar antes de publicar

```
python3 gzs.py web/out 8768 &
cd pub && node full.js 1,2 "" index && node full.js 1,2 "" en && node xss.js && node cspchk.js
```

## Normas de la plataforma

- Español de España y, en la versión inglesa, inglés de Estados Unidos. Todo cambio va en las dos.
- Solo fuentes gratuitas y públicas, citadas. Sin registro, sin cookies, sin seguimiento.
- Frecuencias siempre con tres decimales y punto.
- El log ADIF no sale nunca del dispositivo.
- Numeración MAYOR.MENOR.PARCHE y entrada bilingüe en `CHANGELOG.md` en cada versión.
