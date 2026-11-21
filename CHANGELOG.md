# ACRACB · Plataforma DX · Historial de versiones

Numeración MAYOR.MENOR.PARCHE:
- **MAYOR** (2.0.0): cambio grande de la plataforma (por ejemplo, acceso solo para socios o nuevo alojamiento).
- **MENOR** (1.1.0): una función nueva o una sección nueva.
- **PARCHE** (1.0.1): correcciones, ajustes de formato, de seguridad o de fuentes de datos.

## 2.10.32 — 2026-11-21

- ES: Más rápida: en un móvil medio, el trabajo pesado al abrir baja de unos 3,1 s a 1,6 s y la página queda lista antes (de 2,3 s a 1,7 s); cambiar a DX pasa de 0,64 s a 0,37 s, al mapa de 0,75 s a 0,55 s y a Concursos de 1,2 s a 0,9 s. Se guardan cálculos que se repetían miles de veces (fines de semana de concurso, previsión de manchas, distancias exactas, multiplicadores) y el repaso de textos solo mira la sección que está a la vista.
- ES: Menú más corto: Balizas pasa a ser una pestaña de Sol (son la prueba directa de la propagación). El enlace antiguo lleva allí.
- ES: En Concursos › Trucos, el desplegable que decía «Las 18 balizas» se llama ahora como lo que enseña: los segmentos de cada banda donde puedes transmitir tú y los de EE. UU.
- EN: Faster: on a mid-range phone, heavy work at start-up drops from about 3.1 s to 1.6 s and the page is ready sooner (from 2.3 s to 1.7 s); switching to DX goes from 0.64 s to 0.37 s, to the map from 0.75 s to 0.55 s and to Contests from 1.2 s to 0.9 s. Calculations repeated thousands of times are now kept (contest weekends, sunspot forecast, exact distances, multipliers) and the text pass only looks at the visible section.
- EN: Shorter menu: Beacons becomes a tab in Sun (they are the direct proof of propagation). The old link leads there.
- EN: In Contests › Tips, the fold that said "The 18 beacons" is now named after what it shows: the band segments where you and US stations can transmit.

## 2.10.31 — 2026-11-21

- ES: Vista de lista: nuevo botón en la cabecera (junto al de vista completa/compacta y compatible con las dos) que muestra todos los listados de estaciones como una lista de filas alineadas: hace cuánto, frecuencia, modo, banda, estación con bandera y país, etiquetas, quién la oye, rumbo y distancia, probabilidad de QSO y «¿Lo oyes?». En el ordenador lleva cabecera de columnas; en el móvil, cada fila ocupa tres líneas cortas. Al tocar una fila se despliegan sus detalles. Se recuerda en el dispositivo.
- ES: Buscador del clúster: nuevo filtro por país DX, con los países que hay ahora en los clústeres y cuántos spots tiene cada uno (con tu modo y tus bandas).
- EN: List view: new header button (next to the full/compact view button and compatible with both) that shows every station listing as aligned rows: how long ago, frequency, mode, band, station with flag and country, tags, who hears it, bearing and distance, QSO chance and "Do you hear it?". On a computer it has column headings; on a phone each row takes three short lines. Tapping a row expands its details. It is remembered on the device.
- EN: Cluster search: new DX country filter, listing the countries on the clusters right now and how many spots each has (with your mode and bands).

## 2.10.30 — 2026-11-21

- ES: «Qué hacer ahora» ordenado y estable: siempre primero los botones de modo y las recomendaciones, y debajo, plegado, «Por qué: lo que dice el clúster y las condiciones». Antes, al pulsar «Mi modo» o «Todos los modos», ese bloque perdía el plegado y salía desordenado (en inglés no se plegaba nunca). Si lo abres, sigue abierto al cambiar de modo o al actualizar.
- ES: La sugerencia final usa el mejor destino de esa misma banda (antes podía decir «recorre 12 m hacia» un destino de 20 m). Fuera la línea «Europa rara en el aire» y el orden por distancia: con la nueva definición, toda Europa salvo España es DX. Sin spots, el aviso habla de tus modos, no siempre de «fonía».
- EN: "What to do now" is ordered and stable: mode buttons and suggestions always first, and below, folded, "Why: what the cluster says and the conditions". Before, pressing "My mode" or "All modes" left that block unfolded and out of order (in English it never folded). If you open it, it stays open when you change mode or update.
- EN: The final suggestion uses the best destination on that same band (it could say "tune 12 m toward" a 20 m destination). The "Rare Europe on air" line and the distance ordering are gone: with the new definition, all of Europe except Spain is DX. With no spots, the notice names your modes, not always "phone".

## 2.10.29 — 2026-11-21

- ES: Idea tomada del WebCluster de URE: la referencia DME del spot manda sobre el prefijo para decidir si es España o DX. Un EA9 que activa un municipio de Ávila cuenta como España, y un EA1 desde Mallorca como Baleares (DX).
- EN: Idea taken from the URE WebCluster: the spot's DME reference overrides the prefix to decide whether it is Spain or DX. An EA9 activating a municipality in Ávila counts as Spain, and an EA1 from Majorca as the Balearic Islands (DX).

## 2.10.28 — 2026-11-21

- ES: DX es todo lo que no es España, en toda la plataforma: clúster, mapa, avisos, «Qué hacer», previsión y modo DX. Baleares, Canarias, Ceuta y Melilla cuentan como DX porque son entidades DXCC propias. La pestaña «Cerca» pasa a ser «Actividad en España». El tope de spots sube a 250 por tipo de modo.
- ES: Nuevas antenas: Hex Beam de 6 bandas (20–6 m), y los loops magnéticos Ciro Mazzoni Baby Loop (40–10 m, 1 m, tubo de 50 mm) y Midi Loop (80–20 m, 2 m, tubo de 75 mm), con su rendimiento banda a banda calculado con la física del loop pequeño. La antigua «Hex Beam o Moxon» pasa a «Moxon o similar».
- EN: DX is everything that is not Spain, across the platform: cluster, map, alerts, "What to do", forecast and DX mode. The Balearic and Canary Islands, Ceuta and Melilla count as DX because they are DXCC entities of their own. The "Nearby" tab becomes "Activity in Spain". The spot cap rises to 250 per mode type.
- EN: New antennas: 6-band Hex Beam (20–6 m), and the Ciro Mazzoni Baby Loop (40–10 m, 1 m, 50 mm tube) and Midi Loop (80–20 m, 2 m, 75 mm tube) magnetic loops, with band-by-band performance calculated from small-loop physics. The former "Hex Beam or Moxon" becomes "Moxon or similar".

## 2.10.27 — 2026-11-21

- ES: Muchos más DX en toda la plataforma (clúster, mapa, avisos y «Qué hacer»), sobre todo en fonía: 1) los DX de fuera de Europa entran aunque no los haya anunciado un europeo (antes se descartaban); los oídos en Europa siguen pesando más en «Para ti»; 2) el tope de spots es de 150 por tipo de modo (fonía, CW y digitales) en vez de 150 en total, porque los skimmers de CW y FT8 llenaban el tope y dejaban fuera casi toda la SSB.
- EN: Many more DX across the platform (cluster, map, alerts and "What to do"), especially on phone: 1) DX outside Europe is kept even when no European spotted it (it used to be dropped); those heard in Europe still weigh more in "For you"; 2) the spot cap is 150 per mode type (phone, CW and digital) instead of 150 in total, because CW and FT8 skimmers filled the cap and left out almost all SSB.

## 2.10.26 — 2026-11-21

- ES: Tema claro: todo lo que va sobre fondo pizarra lleva el texto en blanco (botón Actualizar, modo elegido, botones y pestañas marcados, números de los pasos del mapa, «NUEVO», la hora actual de «Hora a hora»…); antes quedaba texto casi negro sobre pizarra. Los botones y pestañas marcados pasan a pizarra con texto blanco, que se distinguen mucho mejor de los no marcados.
- EN: Light theme: everything on a slate background now has white text (Update button, chosen mode, selected buttons and tabs, map step numbers, "NEW", the current hour in "Hour by hour"…); before, near-black text sat on slate. Selected buttons and tabs become slate with white text, much easier to tell from unselected ones.

## 2.10.25 — 2026-11-21

- ES: «Hora a hora»: la hora actual destaca con relieve: su columna sale elevada, con borde y brillo del color de resalte, y la hora va en una pastilla. La hora elegida, si es otra, sigue marcada con un borde.
- EN: "Hour by hour": the current hour stands out in relief: its column is raised, with a border and glow in the highlight colour, and the hour sits in a pill. The chosen hour, if different, is still outlined.

## 2.10.24 — 2026-11-21

- ES: LLOTA (Lagos y Lagunas On The Air) con categoría propia en el clúster, el mapa y el buscador: Todos, DX, POTA, SOTA, WWFF, IOTA, LLOTA y Otros. Sus activaciones llegan por los clústeres (Spothole) y por el comentario de los spots.
- ES: El clúster explica de dónde salen los DX: cuántos de todos los spots son DX de tu modo y tus bandas, cuántos de otros modos o bandas, cuántas activaciones y cuántos cercanos; en modo concursos, avisa de que «Para ti» pide más señal.
- EN: LLOTA (Lakes and Lagoons On The Air) has its own category in the cluster, the map and the search: All, DX, POTA, SOTA, WWFF, IOTA, LLOTA and Other. Its activations come through the clusters (Spothole) and spot comments.
- EN: The cluster explains where the DX comes from: how many of all spots are DX in your mode and bands, how many in other modes or bands, how many activations and how many nearby; in contest mode, it notes that "For you" asks for a stronger signal.

## 2.10.23 — 2026-11-21

- ES: El tema claro cambia el resalte marrón por pizarra (azul grisáceo): botones y pestañas elegidos, títulos, enlaces, bordes y el botón Actualizar. No se confunde con los colores de las bandas ni con el verde, ámbar y rojo de los estados. El tema oscuro no cambia.
- EN: The light theme replaces the brown highlight with slate (greyish blue): selected buttons and tabs, headings, links, borders and the Update button. It does not clash with the band colours or the green, amber and red of the statuses. The dark theme is unchanged.

## 2.10.22 — 2026-11-21

- ES: Concurso en marcha: con el calendario de la plataforma, a la hora exacta de sus bases, sale arriba en todas las secciones un aviso con el concurso, su modo y cuándo termina, y otro al principio de Concursos con sus reglas. Si la plataforma tiene sus reglas, se pone sola en modo concursos con ese concurso (bandas, puntos, multiplicadores y estrategia en directo); «Volver a modo DX» lo respeta hasta el siguiente y, al terminar, vuelve sola a modo DX. Con las notificaciones activadas, avisa una vez por concurso.
- ES: Nuevo concurso con reglas: LZ DX (80 a 10 m, CW y SSB, Bulgaria 10 puntos, otro continente 3, Europa 1; zonas ITU y distritos LZ por banda).
- ES: En concursos, los multiplicadores del clúster dicen «Zona CQ» en vez de «Zona», que es lo que se calcula.
- EN: Contest running: from the platform's calendar, at the exact time of its rules, a notice appears at the top of every section with the contest, its mode and when it ends, and another at the start of Contests with its rules. If the platform has its rules, it switches itself to contest mode for that contest (bands, points, multipliers and live strategy); "Back to DX mode" is respected until the next one and, when it ends, it returns to DX mode by itself. With notifications on, it alerts once per contest.
- EN: New contest with rules: LZ DX (80 to 10 m, CW and SSB, Bulgaria 10 points, another continent 3, Europe 1; ITU zones and LZ districts per band).
- EN: In contests, cluster multipliers say "CQ zone" instead of "Zone", which is what is calculated.

## 2.10.21 — 2026-11-21

- ES: IOTA (islas) con categoría propia en todos los selectores: Todos, DX, POTA, SOTA, WWFF, IOTA y Otros, en el clúster, el mapa y el buscador.
- ES: Sin selectores repetidos: el buscador del clúster ya no tiene sus propias listas de banda, modo y tipo; usa el mismo filtro que el clúster y el mapa (o lo que escribas en la búsqueda, como «20m FT8»). Conserva continente y antigüedad, que no están en otro sitio. Los tipos sin spots ya no muestran «0».
- EN: IOTA (islands) has its own category in every selector: All, DX, POTA, SOTA, WWFF, IOTA and Other, in the cluster, the map and the search.
- EN: No repeated selectors: the cluster search no longer has its own band, mode and type lists; it uses the same filter as the cluster and the map (or what you type in the search, such as "20m FT8"). It keeps continent and age, which are not elsewhere. Types with no spots no longer show "0".

## 2.10.20 — 2026-11-21

- ES: «Todos los modos» pasa a ser una opción más de la lista de modos de la estación (antes era una casilla al lado). Elegir un modo concreto deja solo ese modo; con «Todos los modos», la previsión sigue calculándose en el último modo concreto elegido. Va sincronizado con «Mi modo / Todos los modos» de «Qué hacer ahora».
- EN: "All modes" is now one more option in the station's mode list (it used to be a checkbox beside it). Choosing a specific mode leaves only that mode; with "All modes", the forecast is still calculated in the last specific mode chosen. It stays in sync with "My mode / All modes" in "What to do now".

## 2.10.19 — 2026-11-21

- ES: Un solo juego de filtros: las bandas elegidas en el clúster son las mismas del mapa y de los avisos, y el modo es el de la estación más los que añadas en el clúster o el mapa. Los Avisos ya no tienen filtros propios y dicen cuáles se están usando.
- ES: «Mi modo / Todos los modos» en «Qué hacer ahora» funciona siempre igual: cada botón pone exactamente lo que dice (antes, con una mezcla de modos, «Mi modo» encendía todos). Si hay una mezcla elegida en el clúster o el mapa, se indica cuál. Con «Mi modo», las DXpediciones solo se recomiendan en frecuencias de tus modos.
- ES: Vista compacta: tocar una tarjeta de estación despliega sus detalles (quién la oye, rumbo, distancia y señal prevista).
- ES: Aviso bien visible cuando los datos no son de ahora (más de 30 minutos o ninguna fuente ha respondido), con su antigüedad; las edades largas se dicen en horas o días.
- ES: Panel «Sol y propagación ahora» en cinco bloques repartidos en columnas sin huecos: tormentas, campo magnético, Sol, HF y VHF; cada fenómeno de VHF explica qué es.
- ES: Antes de publicar se comprueba que todo el código se lee sin errores y que la web carga sin fallos en español e inglés; si no, no se publica.
- EN: One set of filters: the bands chosen in the cluster are the same for the map and the alerts, and the mode is your station's plus any you add in the cluster or the map. Alerts no longer have their own filters and say which ones apply.
- EN: "My mode / All modes" in "What to do now" always behaves the same: each button sets exactly what it says (before, with a mix of modes, "My mode" turned all on). If a mix was chosen in the cluster or the map, it is shown. With "My mode", DXpeditions are only recommended on frequencies of your modes.
- EN: Compact view: tapping a station card expands its details (who hears it, bearing, distance and expected signal).
- EN: Clear notice when the data is not current (over 30 minutes old or no source responded), with its age; long ages are given in hours or days.
- EN: "Sun and propagation now" panel in five blocks laid out in columns without gaps: storms, magnetic field, Sun, HF and VHF; each VHF phenomenon explains what it is.
- EN: Before publishing, all code is checked to parse without errors and the site to load without faults in Spanish and English; otherwise nothing is published.

## 2.10.18 — 2026-11-21

- ES: El mapa dibuja lo mismo que el clúster: además de los spots DX, las activaciones POTA, SOTA, WWFF y de otros programas (▲). Antes solo salían los DX y por eso, con poca actividad, el mapa parecía vacío.
- ES: Un solo filtro en toda la plataforma (clúster, mapa y buscador): Todos, DX, POTA, SOTA, WWFF y Otros (IOTA, GMA, castillos, faros, diplomas españoles…), sacados de los propios clústeres. Lo que eliges en un sitio vale en los demás.
- ES: Los botones del mapa responden al momento: primero se marca el botón y después se dibuja. Cambiar la hora o pulsar «Ahora» ya no recalcula toda la plataforma.
- ES: Sin información repetida: el Resumen ya no repite los datos del Sol, las bandas de 6 m/2 m/70 cm ni las DXpediciones en el aire; desaparecen la pestaña «Qué hacer» (está en el Resumen) y la pestaña «Hoy» de Sol (sus datos están en el panel, que ahora incluye la ionosonda); el panel de la portada no repite el SFI y el Kp de las casillas de encima.
- EN: The map now shows the same as the cluster: besides DX spots, POTA, SOTA, WWFF and other program activations (▲). Before, only DX was drawn, so in quiet periods the map looked empty.
- EN: One filter across the platform (cluster, map and search): All, DX, POTA, SOTA, WWFF and Other (IOTA, GMA, castles, lighthouses, Spanish awards…), taken from the clusters themselves. What you choose in one place applies everywhere.
- EN: Map buttons respond at once: the button is marked first and the map is drawn afterwards. Changing the hour or pressing "Now" no longer recalculates the whole platform.
- EN: No repeated information: the Summary no longer repeats the Sun data, the 6 m/2 m/70 cm bands or the DXpeditions on air; the "What to do" tab (it is in the Summary) and the Sun "Today" tab (its data is in the panel, which now includes the ionosonde) are gone; the home panel no longer repeats the SFI and Kp shown in the tiles above.

## 2.10.17 — 2026-11-21

- ES: Avisos DX con un criterio único: solo lo que puedes trabajar ahora (como el clúster «Para ti») y, por orden, entidad nueva para tu log, DXpedición, banda nueva, modo nuevo y DX raro. Cada aviso dice el motivo.
- ES: Botón «Ya la tengo» en cada aviso: deja de avisar de esa estación (una DXpedición, hasta que acabe) y de esa entidad en esa banda y modo. Si tu ADIF ya tiene QSO con la DXpedición desde que empezó, no avisa.
- ES: El ADIF guarda también los indicativos trabajados con la fecha del último QSO (sigue sin salir del dispositivo).
- ES: Junto al indicativo sale «eQSL» si la estación es socia con autenticidad garantizada de eQSL.cc y ha subido su log en el último año. Lista pública y gratuita, copiada cada semana como la de LoTW. eQSL no vale para el DXCC de la ARRL.
- EN: DX alerts follow one rule: only what you can work now (as the cluster's "For you") and, in order, new entity for your log, DXpedition, new band, new mode and rare DX. Each alert states why.
- EN: "Got it already" button on every alert: no more alerts for that station (a DXpedition, until it ends) or that entity on that band and mode. If your ADIF already has a QSO with the DXpedition since it started, there is no alert.
- EN: The ADIF also keeps worked callsigns with the date of the last QSO (it still never leaves the device).
- EN: An "eQSL" tag appears next to the callsign if the station is an eQSL.cc Authenticity Guaranteed member that uploaded its log in the last year. Free public list, copied weekly like LoTW's. eQSL does not count for ARRL DXCC.

## 2.10.16 — 2026-11-21

- ES: El porcentaje de ampliación del botón «Aa» se lee bien: texto claro sobre fondo oscuro en el tema claro, y al revés en el oscuro, algo más grande.
- EN: The zoom percentage on the "Aa" button is now easy to read: light text on dark in the light theme and the reverse in the dark theme, slightly larger.

## 2.10.15 — 2026-11-21

- ES: La línea de estado de «Actualizar» es coherente: los spots nuevos y los confirmados se cuentan entre los que se muestran (antes podía salir «150 spots (664 nuevos)»).
- EN: The "Update" status line is consistent: new and confirmed spots are counted among those shown (it could previously say "150 spots (664 new)").

## 2.10.14 — 2026-11-21

- ES: Vista compacta más ligera en toda la plataforma: sin las casillas de datos (el panel «Sol y propagación ahora» ya los resume), sin el índice del Resumen, sin 6 m/2 m/70 cm en el Resumen, «Qué hacer» sin consejos extra, «Próximas horas» con 3 tramos y sin el bloque «El Sol ahora» repetido. La vista completa no cambia.
- ES: «Cambiar» pasa a «Editar estación» con un lápiz, y la línea de la estación también se puede tocar para editarla.
- ES: Explicación de la diferencia entre el Aviso DX y los Avisos (lo que puedes trabajar tú) y el Clúster del planeta (todo lo que se anuncia).
- ES: Al cambiar de banda aparece al momento «Recalculando para…» y luego «Listo»; el Aviso DX de la portada respeta la banda elegida.
- EN: Lighter compact view across the platform: no data tiles (the "Sun and propagation now" panel summarizes them), no Summary index, no 6 m/2 m/70 cm in the Summary, "What to do" without extra tips, "Next hours" with 3 slots and no repeated "The Sun now" block. The full view is unchanged.
- EN: "Change" becomes "Edit station" with a pencil, and the station line can also be tapped to edit it.
- EN: Explains the difference between the DX alert and Alerts (what you can work) and the worldwide Cluster (everything spotted).
- EN: Changing band now shows "Recalculating for…" at once and then "Done"; the home-page DX alert follows the chosen band.

## 2.10.13 — 2026-11-21

- ES: El panel «Sol y propagación ahora» pasa de la sección Ahora al pie de los datos generales (SFI, SSN, Kp…) de la página principal; sigue también en Sol. Añade tormenta geomagnética (G), apagón de radio (R) y tormenta de protones (S) según las escalas de NOAA, y lo indica en la línea resumen.
- EN: The "Sun and propagation now" panel moves from the Now section to the foot of the general data (SFI, SSN, Kp…) on the main page; it stays in Sun too. Adds geomagnetic storm (G), radio blackout (R) and proton storm (S) per NOAA scales, shown in the summary line.

## 2.10.12 · 21/11/2026
- «Sol y propagación ahora» pasa arriba del todo en Ahora y en Sol, antes de las pestañas (deja de estar en el Resumen). Plegado, ya dice flujo solar, Kp y qué bandas van bien de día; desplegado, tres columnas al estilo de los paneles clásicos (Sol y campo magnético, VHF y superiores, HF para tu estación) y cada dato con una frase sencilla que explica qué significa. Con las fuentes de la plataforma. En español e inglés.
/ “Sun and propagation now” panel at the top of Now and Sun, with plain-language meaning for each value.

## 2.10.11 · 21/11/2026
- Nuevo desplegable «Estado solar-terrestre», al final del Resumen y al principio de Sol › Hoy, con nuestro estilo y nuestras fuentes. Sol y geomagnetismo (flujo, manchas, A, Kp, rayos X, viento solar, Bz, protones, aurora, llamaradas, estado del campo y ruido geomagnético orientativo), VHF (aurora, esporádica E en 6 y 2 m, tropo, meteoros y rebote lunar, del panel de aperturas especiales) y HF de día y de noche por pares de bandas, calculado para tu estación. En español e inglés.
/ New “Solar-terrestrial status” panel in Summary and Sun, built from the platform's own sources and model.

## 2.10.10 · 21/11/2026
- Nueva fuente: GloTEC de NOAA SWPC (gratuita, sin registro). En Ahora › Tu QTH, «Ionosfera medida sobre tu QTH»: foF2 sobre tu estación, MUF estimada para saltos de 3.000 km, TEC y comparación con los últimos 30 días. Se descarga solo al abrir el panel y se guarda 15 minutos. Añadida a los créditos. En español e inglés.
/ New source: NOAA SWPC GloTEC — ionosphere measured over your QTH (foF2, estimated MUF, TEC and 30-day anomaly).

## 2.10.9 · 17/11/2026
- V-UHF: «Esporádica E ahora» deja de quedar suelto al final de la sección y pasa al principio de su desplegable, «Esporádica E: mapa y previsión». En español e inglés.
/ V-UHF: “Sporadic E now” moved into its own panel.

## 2.10.8 · 17/11/2026
- Barra de tu estación en el móvil y la tableta ordenada en tres filas: los dos modos, tu estación a todo el ancho y debajo «Mi log» y «Cambiar», a partes iguales. En español e inglés.
/ Station bar on phones and tablets in three tidy rows.

## 2.10.7 · 17/11/2026
En español e inglés.
- V-UHF: el estado de 6 m, 2 m y 70 cm va arriba del todo de la sección; después, la nota de meteoros y el panel de aperturas especiales.
- Fichas de cifras alineadas (Mi log, Sol, ciclo solar, concursos): el título reserva el mismo alto en todas, así que la cifra, la barra y la nota quedan a la misma altura aunque un título ocupe dos líneas.
- Las rejillas de fichas y tarjetas se reparten todo el ancho, sin huecos a la derecha ni entre ellas.
/ V-UHF band status on top; aligned stat tiles; card grids use the full width.

## 2.10.6 · 17/11/2026
En español e inglés.
- «Modo DX» y «Modo concursos» siempre a la vista, en la barra de tu estación (antes estaban dentro de «Cambiar»). En el móvil, en una fila a todo el ancho.
- QRP: cada casilla dice «N destinos al alcance» y cuál es el más fácil, con su probabilidad, y encima de la tabla hay un ejemplo de cómo leerla.
/ DX and contest mode always visible in the station bar; clearer QRP table.

## 2.10.5 · 17/11/2026
Fases 6 y 7. En español e inglés.
- Concursos › En directo: la banda que más da ahora (puntos por multiplicadores con tu estación), dónde colocarte, cuándo toca cambiar de banda, comparativa de bandas y los multiplicadores del clúster de los últimos 30 minutos agrupados por banda, con frecuencia, probabilidad y puntos.
- Concursos › Pausas: descansos a medida. Eliges cuántas horas al día y en cuántos bloques, y la plataforma te dice cuándo descansar y cuántos QSO pierdes.
- QRP: cada casilla de la tabla dice cuántos destinos tienes y cuál es el mejor; donde no hay nada, «cerrada».
- Clúster en vista compacta: «Para ti / Todos», la nota y «Fuentes» ocupan su propia fila, sin quitar sitio a las tarjetas.
- Batería: el reloj y las actualizaciones periódicas se paran mientras la plataforma está en segundo plano.
/ Phases 6 and 7: live contest strategy with cluster multipliers by band, tailored breaks, clearer QRP table, compact cluster layout fix and lower battery use in the background.

## 2.10.4 · 17/11/2026
Fase 5 (VHF y UHF), QRP y arreglos de presentación. En español e inglés.
- Resumen en dos columnas que aprovechan todo el ancho: a la izquierda «Ahora» y «Qué hacer»; a la derecha «Próximas 12 horas» y «Raras en el aire». En el móvil, una sola columna en ese orden.
- V-UHF: panel de aperturas especiales (esporádica E, tropo, aurora, TEP, meteoros y rebote lunar) con su estado de un vistazo y una parte detallada de cada una:
  - Esporádica E: mapa con las nubes vistas en PSK Reporter, los spots largos del clúster y el anillo hasta donde te llega un salto; previsión por horas según la temporada.
  - Tropo: mapa de conductos en 2 m y 70 cm calculado con el modelo meteorológico de Open-Meteo (gratuito, sin registro), ahora y hasta 36 h, y la evolución en tu zona.
  - Aurora y TEP: qué hace falta desde tu latitud y si se cumple ahora.
  - Dispersión meteórica: lluvia activa, altura de su radiante en 24 h, mejores horas según la dirección del enlace y actividad real en MSK144.
  - Rebote lunar: elevación y rumbo de la Luna, distancia, pérdidas del trayecto en 144, 432 y 1.296 MHz, ventanas en tu QTH y Luna común con otras zonas. Posición comprobada con una librería astronómica de referencia.
  - Avisos de aperturas especiales con notificación, por tipo.
- QRP: qué bandas abren ahora con 1, 5 o 10 W en CW, SSB y FT8 (mismo modelo que el resto), cuánto pierdes frente a tu potencia, y desplegables con frecuencias, antenas, operativa y lugares.
- Señal prevista en las tarjetas: indicador de S-metro con barra de color (verde, clara; ámbar, justa; rojo, bajo el ruido).
- Satélites: el desplegable de frecuencias y Doppler ya no se cierra solo y queda siempre al pie de la tarjeta.
/ Phase 5 (VHF/UHF special openings panel, tropo map, meteor scatter, EME), richer QRP, two-column Summary, S-meter signal estimate and satellite panel fixes.

## 2.10.4 · 17/11/2026
Fase 5 y arreglos. En español e inglés.
- Resumen reorganizado: en ordenador y pantallas grandes, dos columnas que ocupan todo el ancho (a la izquierda «Ahora» y «Qué hacer»; a la derecha «Próximas 12 horas» y «Raras en el aire»); en el móvil, una columna en ese orden.
- VHF y UHF a fondo, en Ahora › V-UHF: panel de aperturas especiales (esporádica E, tropo, aurora, TEP, meteoros y rebote lunar) y un desplegable de cada una. Mapa de esporádica E con las nubes vistas en PSK Reporter y los spots del clúster, y previsión por horas. Mapa de tropo para 2 m y 70 cm, con 48 horas de previsión calculadas con el modelo meteorológico de Open-Meteo. Dispersión meteórica con el radiante de la lluvia, las mejores horas según la dirección del enlace y la actividad MSK144. Rebote lunar con elevación, rumbo y distancia de la Luna, pérdida del trayecto en 144, 432 y 1.296 MHz, ventanas en tu QTH y Luna común con otras zonas. Avisos de aperturas especiales por notificación.
- QRP: qué bandas abren ahora con 1, 5 o 10 W en CW, SSB y FT8 (mismo modelo que el resto), cuánto pierdes frente a tu potencia, antenas, cómo operar y lugares que ayudan.
- Señal prevista como un S-metro con barra de color: el número es la señal de la estación y el color, si se entiende (verde, clara; ámbar, justa; rojo, bajo el ruido).
- Satélites: el desplegable de frecuencias y Doppler ya no se cierra solo y va siempre al pie de la tarjeta.
/ Phase 5 and fixes: two-column Summary, full VHF/UHF section (Es, tropo, aurora, TEP, meteor scatter, EME, alerts), complete QRP section, S-meter style expected signal, satellite panel fix.

## 2.10.3 · 17/11/2026
Fase 4: menos listas interminables. En español e inglés.
- Mi log, por partes: Resumen, Países, Objetivos y Archivo, con un selector arriba que recuerda la última que viste.
- Países del log agrupados por continente en desplegables cerrados con su recuento (confirmadas, trabajadas y que faltan); dentro, fichas pequeñas que al tocarlas enseñan las bandas. Al buscar o filtrar por continente, lista directa.
- Tablas completas: 15 filas a la vista, buscador de destinos y «Ver más».
- Balizas: mapa con las 18 balizas, las que emiten ahora marcadas con un anillo del color de su banda y su frecuencia, y cada punto coloreado según la probabilidad de oírla (en su mejor banda o en la que elijas). La tabla completa queda en un desplegable.
/ Phase 4: log split into parts, countries grouped by continent, shorter tables with search, and a beacon map showing which beacon transmits now and how likely you are to hear it.

## 2.10.2 · 17/11/2026
Fase 3: satélites e ISS. En español e inglés.
- Cada pase tiene un desplegable «Frecuencias, Doppler y cómo configurarlo», con cada transmisor (subida, bajada, tono CTCSS, desplazamiento y estado según SatNOGS) y una tabla con el Doppler de ese pase calculado para tu locator: en qué frecuencia escuchar y en cuál transmitir al salir, en lo más alto y al ponerse.
- Pasos sencillos para hacer el QSO con un walkie o con un equipo: memorias, tono, antena, potencia y cómo llamar; en los lineales, cómo corregir el Doppler y localizar tu propia señal.
- ISS: repetidor de voz, contacto con la tripulación (Región 1) y APRS, cada uno con sus frecuencias.
- Corregido: AO-91 ya no necesita tono CTCSS, según SatNOGS DB.
- En inglés, las comillas pasan al estilo de EE. UU.
/ Phase 3: expandable satellite passes with per-pass Doppler, CTCSS, offset and how to set up a handheld or rig; AO-91 tone corrected; US-style quotes in English.

## 2.10.1 · 17/11/2026
Fase 2: tarjeta de estación. En español e inglés.
- Línea gris común, explicada de forma visual: dos franjas de 24 horas (tú y el destino) con el día, la línea gris y la noche, y los ratos en que coinciden marcados encima. Debajo, cada rato con tu hora y qué coincide con qué: «Tú: anochece ⇄ Mozambique: amanece». En las tarjetas, la hora va primero en tu hora local.
- Señal prevista en los dos sentidos en cada estación del clúster: cómo la oirás y cómo te oirá (RS en fonía, RST en CW y dB en los modos digitales), indicando cuándo queda bajo el ruido. Sale del mismo modelo que el porcentaje, con tu ruido local y tu potencia, y se presenta como estimación.
- Cuando anotas «Lo oigo» o «Me oyen» (y la señal), la tarjeta compara lo que anotaste con lo previsto y muestra cómo cambia la probabilidad: del porcentaje del modelo al porcentaje con tus datos.
/ Phase 2: visual shared greyline, expected signal both ways on each cluster station, and comparison between forecast and what you note.

## 2.10.0 · 17/11/2026
Primera fase de las mejoras del documento de errores. En español e inglés.
- Nuevo nombre: «ACRACB - DX EA5RKB», con la bandera de España.
- Hora a hora: la leyenda de colores va encima de la tabla, y al tocar o señalar una casilla una línea dice qué significa (banda, hora, destinos abiertos y porcentaje).
- Sol: la aurora se ve con la cifra arriba y la zona debajo, bien alineada. En el ciclo solar, cada dato tiene un «Qué es» que lo explica.
- Desplegables: en toda la plataforma, el abierto se distingue claramente del cerrado (borde y fondo de color y título resaltado).
- Pie de página: a la vista solo el copyright y la versión; el aviso legal, las fuentes y la privacidad, en un desplegable.
- Tarjetas de estación: en cada fila tienen la misma altura y el «¿Lo oyes?» y sus resultados quedan siempre abajo, alineados. Las DXpediciones pasan a una rejilla ordenada, con el estado y la probabilidad a la derecha.
- Clúster: los filtros de modo, tipo y banda se pliegan en «Filtros», con un resumen de lo que se muestra. Se explica la diferencia entre «Para ti» y «Todos». Las otras frecuencias de una estación salen en la fila «También en», con el mismo aspecto que la principal.
- Resumen: índice arriba para saltar a cada parte, cabeceras claras, «Qué hacer ahora» sin título repetido y con una recomendación a la vista y el resto en «Ver más». Los paneles se ajustan a su contenido.
- Mapa: la etiqueta de cada spot va pegada a su punto (sin el rombo suelto que parecía otra estación) y todas las etiquetas tienen más cuerpo y borde. Al entrar en el mapa desde el menú arranca en «Ahora» y sin animación, y la animación se para al salir del mapa.
- En inglés, la fecha del pie va al estilo de EE. UU.
/ First phase of the bug-report improvements: new name, clearer hour-by-hour, solar cycle explanations, distinct open/closed panels, compact footer, aligned station cards, folded cluster filters, Summary index, better map labels and map always starting at "Now".

## 2.9.1 · 15/11/2026
- El alfabeto fonético, el código Q y el Morse para CW tienen pestaña propia: «Cómo funciona › Consulta», con las tablas abiertas. Antes estaban escondidos al final del glosario de Resumen; ahí queda un enlace directo, y otro en la Guía.
- En español e inglés. / Phonetic alphabet, Q code and Morse moved to their own tab: How it works › Reference.

## 2.9.0 · 15/11/2026
- «Qué hacer» pasa a estar dentro de «Ahora › Resumen», entre la mejor banda y la línea de 24 horas. Desaparece como pestaña aparte.
- Con tu log cargado, en Avisos y en «Qué hacer» salen primero las entidades que te faltan y, entre ellas, las de estaciones que confirman por LoTW. Se indica con «te falta en esta banda y confirma por LoTW».
- Nueva pestaña «Guía» en «Cómo funciona»: primeros pasos y privacidad (sin registro ni seguimiento, tus datos y tu log se quedan en el dispositivo, qué se consulta y a quién).
- Textos más cortos en Hora a hora, Avisos, «¿Me oyen?», Balizas y QRP. «Mi log» explica dónde se usa lo que subes.
- Corregido en inglés: un spot recién llegado decía «ahora» y no «just now», y los porcentajes van pegados al número (24%), como se escribe en EE. UU.
- Se deja de generar la versión antigua como artefacto; la plataforma vive solo en esta web.
- En español e inglés. / «What to do» moved into Now › Summary; LoTW-first ordering of needed entities with your log; new Guide tab (getting started and privacy); shorter texts; fixes.

## 2.8.40 · 15/11/2026
- Notificaciones de nuevo en marcha. En la versión 2.8.27, al quitar el antiguo botón «Solo parques y cumbres», se borró por error también el bloque de las notificaciones y el registro del service worker. Desde entonces no se podían activar las notificaciones (el botón no hacía nada) y la web no se guardaba en el dispositivo para funcionar sin conexión en quien la abría por primera vez. Se restaura el bloque tal como estaba en la 2.8.26: activar, probar, silenciar y avisos de DXpediciones y entidades que te faltan.
- En iPhone y iPad las notificaciones solo funcionan con la web añadida a la pantalla de inicio y abierta desde ahí (iOS 16.4 o posterior); la propia web lo explica al pulsar el botón.
- En español e inglés. / Notifications and offline support restored (accidentally removed in 2.8.27).

## 2.8.39 · 15/11/2026
- Revisión de veracidad contra referencias independientes:
  - Sol: salida, puesta, línea gris y altura con las fórmulas de NOAA (antes una aproximación) y con el cruce del horizonte interpolado (antes se redondeaba a 5 minutos). Comparado con la biblioteca astronómica astral en siete lugares (tu QTH, Tokio, Sídney, Nueva York, Reikiavik, São Paulo y Maputo): error de 0–2 minutos (3–4 en Islandia), antes de hasta 9 minutos. La altura del sol, a 0,2° de la referencia.
  - Balizas NCDXF: comprobado el horario oficial (qué baliza emite en cada banda cada 10 segundos) y la posición de las 18.
  - Países: comprobados 230 indicativos y prefijos con el fichero cty.dat, incluidos los portables (F/EA5JNF, EA8/DL1ABC, /P, /QRP, /MM). 36 entidades salían en inglés en la versión española («Crete», «Guantanamo Bay», «Ogasawara Is.»…) y ahora salen en español; la isla Pedro I decía «(Isla Bouvet)» y es de Noruega.
  - Modos: las frecuencias de PSK31 (14.070, 21.070…) ya no se marcan como SSB.
  - Distancias y rumbos: comprobados en todas las tarjetas (versión 2.8.38).
- En español e inglés. / Accuracy review: NOAA sun formulas, beacon schedule, 230 callsigns checked, Spanish entity names, PSK31 frequencies.

## 2.8.38 · 15/11/2026
- Distancia y rumbo de un indicativo, siempre desde tu estación hasta esa estación, en toda la plataforma:
  - El cálculo de cada spot (rumbo, distancia, probabilidad y «Por qué») es siempre hacia la estación del indicativo, en el mapa, el clúster, los avisos, «Qué hacer», la búsqueda y la ficha de cada indicativo. Antes, en las estaciones cercanas oídas lejos (YU5R oída en EE. UU.), el porcentaje de algunas tarjetas se calculaba hacia el que la oía.
  - Quién la oye se sigue mostrando, y lo que indica (camino abierto hacia allí) va aparte: al final de la ficha del mapa y en «Indicador» de «Qué hacer».
  - Una sola forma de medir en toda la plataforma: el elipsoide WGS84 (Vincenty), con el camino largo como la vuelta real por ese círculo máximo. Antes el mapa medía sobre una esfera y las tarjetas sobre el elipsoide, y la misma estación salía con unos km de diferencia (YU5R 1.881 en el mapa y 1.884 en el clúster; JA1AAA 10.818 y 10.842).
  - Comprobado leyendo todas las distancias de todas las tarjetas y fichas en español e inglés: todas coinciden con la de tu QTH a la estación.
- En español e inglés. / Distance and bearing of a callsign are always from your station to that station, measured the same way everywhere.

## 2.8.37 · 15/11/2026
- Mapa › ficha de un spot, rehecha para que todo lo que dice sea de esa estación:
  - «Para ti», rumbo, distancia y «Por qué» son siempre los de la estación del spot (YU5R: 61° ENE, 1.881 km), también cuando la oye alguien lejos.
  - Si una estación cercana la oye alguien lejos (YU5R oída en EE. UU.), al final y separado: «Que la oigan tan lejos indica que 20 m está abierta entre Europa y EE. UU. noreste. Para ti, hacia allí: X % (298° ONO · 6.063 km)».
  - «Por qué» cuenta los saltos con la distancia real de la estación, no con la del centro de su zona de previsión (EI9HX: un salto de 1.766 km, antes «1.460 km»), y dice «un salto» en lugar de «unos 1 salto».
  - Si la frecuencia queda justo en la MUF media (hasta un 12 % por encima), ya no dice que «no vuelve»: dice que unos días se refleja y otros no.
  - Si los spots del clúster cambian mucho la cifra de la previsión, lo explica con las dos cifras.
  - «la ionosonda indica una MUF un 30 % más baja» (antes «un -30 % más baja»).
- En español e inglés. / Spot details rebuilt: everything refers to the spotted station; the open path to a distant spotter is shown separately.

## 2.8.36 · 15/11/2026
- Mapa › ficha de un spot: cuando una estación cercana (Europa) la oye alguien lejos (por ejemplo YU5R oída en EE. UU.), la ficha daba la distancia y el rumbo hacia el que la oye como si fueran los de la estación (6.051 km a 297° para YU5R). Ahora dice primero la distancia y el rumbo reales de la estación y con qué probabilidad te llega, y después, por separado, que el camino hacia donde la oyen está abierto, con su rumbo, distancia y probabilidad. «¿Lo oyes?» se apunta a la estación, no a la zona del que la oye. Lo mismo en la ficha de cada indicativo.
- Nombres: YU, 9A, LZ, YO, OH, SM, LA, DL, OK, HA, G, EI, UR y EW salían con el nombre de su zona de previsión («Balcanes», «Escandinavia»…) en lugar del país. Ahora sale el país (Serbia, Croacia, Suecia…).
- En español e inglés. / Spot details for nearby stations heard far away now show the station's real distance and, separately, the open path towards the spotter; countries named properly.

## 2.8.35 · 15/11/2026
- Distancias y rumbos correctos en toda la plataforma (mapa, clúster, avisos, «Qué hacer», búsqueda y actividades en portable). Algunas fuentes dan como posición «exacta» de una estación la dirección de QRZ de su mánager (una DXpedición a Mozambique situada en Alemania) o el locator del que avisa escrito en el comentario. Ahora toda posición que cae lejos de la entidad del indicativo se descarta y se usa la de la entidad (o la de su zona en los países grandes). El límite es de 1.300 km, y más en los países grandes (EE. UU., Canadá, Rusia, Australia, Brasil, China…). También se corrigen al abrir la página los spots guardados de antes.
- En español e inglés. / Wrong station positions (manager's address, spotter's grid) are discarded: distances and bearings are now correct everywhere.

## 2.8.34 · 15/11/2026
- Mapa fiel al clúster y estable: cada estación sigue en el mismo sitio entre actualizaciones (si una vez ninguna fuente trae su posición exacta, se mantiene la anterior en lugar de saltar al centro del país), y los que la oyen se acumulan (hasta 4) en lugar de cambiar de una actualización a otra. Comprobado en cinco rondas con datos que cambian: el mapa muestra exactamente las estaciones del clúster, sin moverse ni parpadear.
- En español e inglés. / Map spots now stay in place and match the cluster exactly across updates.

## 2.8.33 · 15/11/2026
- Clúster y mapa: las estaciones ya no desaparecen y vuelven a aparecer entre actualizaciones. Pasaba por dos motivos: si en una actualización alguna fuente no respondía, sus spots se perdían hasta la siguiente; y al llegar al tope de 100 spots se daba prioridad a los «nuevos», de modo que los demás salían y volvían a entrar. Ahora se conservan los spots que siguen vigentes (60 minutos en HF y 2 horas en VHF) aunque esa vez no lleguen, y el tope (150) se aplica por antigüedad.
- En español e inglés. / Cluster stations no longer vanish and reappear between updates.

## 2.8.32 · 15/11/2026
- Mapa: la etiqueta «ISS», los nombres de los satélites y sus iconos ya no cambian de tamaño solos. Con zoom se encogían dos veces o ninguna según cuándo se hubieran redibujado (la etiqueta pasaba de 15 a 52 píxeles al ampliar). Ahora siguen la misma escala que el resto de marcas del mapa y se recolocan al terminar el gesto de zoom.
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / ISS and satellite labels and icons no longer change size on their own.

## 2.8.31 · 15/11/2026
- Optimización general, sin cambiar nada de lo que se ve ni de las cifras (comprobado: las 248.976 probabilidades de todos los destinos, horas y bandas salen idénticas):
  - Cálculo de la previsión el doble de rápido: la caché de probabilidades usa claves numéricas y los valores que solo cambian cada minuto (modo, antenas, parámetros, Kp por hora, antena por banda) se guardan sin buscarlos en cada una de cientos de miles de llamadas. Recalcular todo el día pasa de 340 a 140 ms.
  - D3 reducido a las partes que usa la plataforma (mapa, selección, zoom y transiciones): de 92 a 29 kB comprimidos.
  - Hoja de estilos minimizada y datos de VOACAP y del ciclo solar en archivos aparte que se guardan en el dispositivo: la página que se descarga en cada visita baja de 72 a 53 kB comprimidos.
  - En un móvil lento (procesador 4 veces más lento y red 3G): la primera carga baja de 935 a 867 kB, la página está lista en 4,3 s en lugar de 5 s y el tiempo con la pantalla bloqueada baja de 2,1 a 1,4 s.
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / General optimization: twice-as-fast forecast calculation, smaller D3 and lighter page, same results.

## 2.8.30 · 15/11/2026
- DX › Satélites: SatNOGS DB indica «en órbita» en lugar de «vivo», y la etiqueta salía «inactivo» en todos. Ahora un satélite sale «activo» si tiene algún transmisor activo y no ha reentrado.
- Primeras copias ya en la web: 81.935 usuarios de LoTW con subidas en el último año y el estado de los ocho satélites.
- En español e inglés, en todas las pantallas. / SatNOGS status tag fixed.

## 2.8.29 · 15/11/2026
- Cuatro fuentes nuevas, públicas, gratuitas y sin registro, con su crédito en la plataforma:
  - **LoTW (ARRL)**: junto al indicativo de cada spot y de cada DXpedición sale «LoTW» si esa estación ha subido su log en el último año. Al tocarlo o pasar por encima se ve la fecha de la última subida; si fue hace más de 90 días, sale atenuado. La lista se copia cada semana en la propia web y solo se descargan los trozos de los indicativos que hay en pantalla.
  - **Índice Hp30 del GFZ**: la actividad geomagnética de cada media hora, en «Kp ahora» y en la explicación del Kp. Avisa del comienzo de una tormenta antes que el Kp de tres horas.
  - **D-RAP de NOAA**: hasta qué frecuencia absorbe ahora la capa D sobre tu QTH y qué bandas afecta, en la explicación de las llamaradas.
  - **SatNOGS DB**: estado de cada satélite y de sus transmisores en DX › Satélites («SatNOGS: activo» o «inactivo»), copiado dos veces al día junto a las órbitas.
- Créditos rehechos y revisados uno a uno:
  - Solo figuran las fuentes que la plataforma usa de verdad. Se quitan las que ya no se leen (algunos clústeres, previsiones de tropo, webs de avisos y de DXpediciones) y se añaden las que faltaban: CelesTrak, AMSAT, SatNOGS DB, satellite.js, IMO (lluvias de meteoros), LoTW, Hp30 y D-RAP.
  - Ordenados por temas: previsión; Sol y campo magnético; ionosfera y propagación real; clústeres y actividad; DXpediciones, entidades y confirmaciones; satélites; balizas, meteoros y concursos; mapa, programas y letras.
  - «Cómo funciona › Cotejo de fuentes» dice ahora lo que se coteja de verdad (la MUF sale de KC2G y las DXpediciones de NG3K y Spothole).
  - Las letras están alojadas en la propia web, no en Google Fonts.
- La cabecera dice «Altura del sol» en lugar de «Sol en tu QTH», y los grados son la elevación del sol sobre el horizonte en tu QTH, también de noche (en negativo). Al pasar por encima se explica.
- Versión inglesa: traducida la frase de las cuatro opiniones de «Bandas».
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / New free sources (LoTW, GFZ Hp30, NOAA D-RAP, SatNOGS DB), credits rebuilt, and the header now says the degrees are the sun's elevation.

## 2.8.28 · 15/11/2026
- Menú principal y submenús con tamaños uniformes:
  - Todos los botones del menú principal miden lo mismo.
  - Todas las pestañas de todos los submenús miden lo mismo entre sí, más pequeñas que el menú.
  - Si en una pantalla estrecha no caben, se reduce primero el margen interior y después la fila se desplaza de lado, siempre con los botones iguales. Se recalcula al cambiar de sección, de tamaño de letra, de vista o de ventana.
- Pestañas con nombre más corto para que ninguna desentone: «6 m · 2 m · 70 cm» pasa a «V-UHF» y «Fuentes y aviso legal» a «Créditos».
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / Main menu buttons all share one width, and all sub-menu tabs share one smaller width.

## 2.8.27 · 15/11/2026
- «Ficha completa» desde el mapa a pantalla completa ya no deja la plataforma bloqueada: al salir del mapa hacia cualquier otra sección, la pantalla completa se cierra primero. Antes el navegador seguía en pantalla completa sobre un mapa oculto y no se podía desplazar la página.
- 2 m y 70 cm: el alcance troposférico salía «unos 1 km» y las probabilidades no se calculaban, por un dato de ruido que faltaba. Ahora el balance de enlace cuenta el ruido del entorno de la otra estación (ITU-R P.372), no repite el ajuste del modo y usa una pérdida más allá del horizonte más realista (20 dB al pasarlo y 0,13 dB/km en 2 m o 0,17 dB/km en 70 cm). Con 100 W en SSB y una directiva sale un alcance normal de unos 350 km en 2 m.
- Revisión de la veracidad de los contenidos:
  - Concursos: YO DX HF es el último fin de semana completo de agosto (no el tercero), LZ DX el penúltimo de noviembre, S. M. el Rey de España SSB el cuarto de junio, EA PSK63 de 12:00 a 11:59 y los dos de S. M. el Rey terminan a las 11:59.
  - Glosario: 40 m también sirve de día a corta distancia; el paso largo se usa cuando la ionosfera está mejor por el arco largo, a menudo siguiendo la línea gris, no por estar «mejor iluminado».
  - Sol: aurora en 6 y 2 m (a veces 10 m) y desde España con Kp 7 o más; clase M de rayos X degrada las bandas bajas y X puede cortarlas todas; «Apagón R1–R2»; «manchas del día» en lugar de «SSN»; foF2 explicada como la frecuencia que la ionosfera devuelve en incidencia vertical; comparación con los ciclos 19 a 24 completa.
  - Antípodas: cualquier rumbo llega ahí.
  - Coordenadas del QTH y de las antípodas en positivo con N/S y E/O.
- Decimales como se escriben en cada idioma: coma en español (0,6 nT, 160,9 manchas, coordenadas del QTH) y punto en inglés. Las frecuencias van siempre con punto en los dos (foF2 9.1 MHz, tono 74.4 Hz, 2.5 kHz). FT4 en 40 m: 7.0475 MHz (antes «7.047,5 kHz»).
- Mantenimiento interno: cada añadido envuelve sus funciones una sola vez; se quita código sin uso de POTA/SOTA; los desplegables de «Cómo funciona» vuelven a abrirse; el botón «Actualizar» usa el color de acento.
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / Full details from the full-screen map no longer locks the page; 2 m and 70 cm range fixed; contest dates, glossary and space-weather texts corrected for accuracy.

## 2.8.26 · 15/11/2026
- El mapa ya no se traba. Cada añadido del mapa (relieve fino, ISS y satélites, etiquetas, pantalla completa, botones rápidos) envolvía el dibujo y, si otro lo envolvía después, volvía a envolverlo: en un minuto se apilaban decenas de capas y cada redibujado repetía el relieve fino, los satélites y las etiquetas decenas de veces. Ahora hay un único envoltorio que dibuja el mapa una vez y después cada añadido, en orden. Las etiquetas se recolocan al terminar el gesto de zoom, no en cada fotograma. Con todas las capas encendidas, cada dibujo tarda unos 30 ms en un móvil.
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / The map no longer freezes: one single drawing wrapper instead of dozens stacked.

## 2.8.25 · 15/11/2026
- «Método» pasa a llamarse «Cómo funciona».
- Ahora › Bandas usa el mismo criterio que «Hora a hora»:
  - La columna Plataforma dice qué parte del mundo se oye en cada banda (destinos con al menos un 30 %), con las mismas palabras y colores: cerrada, muy poco, poco, regular, bien, muy bien. Antes daba el mejor destino de la banda y podía decir «abierta 47 %» donde «Hora a hora» decía «muy poco».
  - El mejor destino de cada banda sigue en «Ver por qué».
  - La conclusión sale por mayoría de las fuentes: «Abierta» si la mayoría la ve bien y ninguna la da por cerrada, «Floja» si ninguna la da por cerrada pero no hay mayoría, «Cerrada» si casi todas la dan cerrada y «Dudosa» cuando se contradicen. Antes bastaba que HamQSL dijera «floja» para que una banda con 97 %, 15 spots y miles de señales WSPR saliera «Floja».
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / «Method» is now «How it works»; Bands uses the same scale as Hour by hour, and its conclusion is a majority vote of the sources.

## 2.8.24 · 15/11/2026
- Versión inglesa traducida por completo:
  - Los textos que el servidor escribe en español se traducen al cargar los datos: resúmenes del Sol, del Kp y de la previsión, estaciones cercanas, VHF, notas de los spots, CME, protones, aurora, avisos y fuentes del clúster.
  - Información de las DXpediciones: lo que no se puede traducir con frases fijas se rehace en inglés con sus datos (fecha de fin, bandas y modos).
  - Fechas («Nov 20»), días de la semana de la previsión de Kp y nombres de entidades y países, siempre en inglés.
  - «Método»: la frase del valor central, completa en inglés.
- La versión española no cambia.
- En todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / English version fully translated, including server-generated texts, DXpedition info, dates, weekdays and entity names.

## 2.8.23 · 15/11/2026
- «Ver en el mapa» desde la ficha de un indicativo, de un destino o del Resumen: va al mapa, encuadra con zoom tu QTH y la estación, traza la ruta entre los dos y marca la estación, sin abrir la tarjeta de información. La ruta se mantiene aunque el mapa se actualice.
- Revisión de congruencia de datos en toda la plataforma:
  - Frecuencias de los planes de banda en MHz con tres decimales, como en el resto de la web (antes «14.300 kHz», que en inglés se lee 14,3 kHz). En «Por qué», la frecuencia de la banda también con tres decimales.
  - Miles siempre con separador (antes «corto 8071 km · largo 31.961 km»): punto en español y coma en inglés, también en los anillos del mapa y en los textos de VHF.
  - Porcentaje de las DXpediciones como en el resto («52 %»), con la banda a la que se refiere.
  - «Qué hacer» › «Lo que dice el clúster» y DX › Avisos ya no proponen spots de hace horas: solo los de la última hora llevan «¿Lo oyes?». El aviso de «sin spots» ya no habla de fonía cuando el modo es otro.
  - El rumbo de un spot en «Qué hacer» sale con las mismas coordenadas que su tarjeta del clúster.
  - El resumen de avisos dice cuántos más hay («3 avisos: C8K 80 m, C8K 40 m y 1 más»).
  - Flujo solar de mañana corregido con lo medido hoy cuando la previsión semanal de NOAA se ha quedado atrás, con la cifra de NOAA al lado.
  - Versión inglesa: sin restos en español en las notas de los spots, la información de las DXpediciones, las estaciones cercanas, la aurora, las fechas y la tabla de antenas; decimales con punto.
  - Frecuencias con más de tres decimales en los datos recibidos se muestran con tres.
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / «Show on map» now zooms to a route from your QTH to the station without opening the info card; data consistency review (units, thousands, percentages, recent-only suggestions, solar flux, English leftovers).

## 2.8.22 · 15/11/2026
- Mapa a pantalla completa: los botones «Ocultar controles» y «Salir» ya no saltan de sitio. Antes, al tocarlos en el móvil se perdía el centrado, y al cambiar «Ocultar» por «Mostrar controles» se movía «Salir». Ahora quedan fijos, centrados, sin salirse de la pantalla con ningún tamaño de letra. En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / Full-screen map: bottom buttons stay fixed and centred.

## 2.8.21 · 15/11/2026
- Mapa a pantalla completa:
  - Los botones «Ocultar controles» y «Salir» van centrados abajo, separados del borde.
  - Los menús son más transparentes y más compactos: se ven solo «Mapa» y «Qué ver», y «Más ajustes» despliega el modo, las bandas, la hora y la predicción, con «Menos ajustes» para recogerlos.
  - Sale el botón repetido «Salir de pantalla completa» del panel y la leyenda de bandas es más pequeña.
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / Full-screen map: centred bottom buttons, lighter and more compact panels with «More settings».

## 2.8.20 · 15/11/2026
- Clúster mundial con menos entradas:
  - Una fila por estación: si sale en varias bandas, sus otras frecuencias van en la misma tarjeta.
  - Por defecto, «Para ti»: solo las estaciones oídas en la última media hora y con al menos un 10 % para tu estación. «Todos» enseña el resto. Cada botón dice cuántas hay y la elección se recuerda en el dispositivo.
  - Las nuevas van arriba y después las de más probabilidad.
  - Se ven 6 en la vista compacta y 8 en la completa, con «Ver N estaciones más» debajo.
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / World cluster: one row per station, «For you» filter by default (last 30 min and at least 10 %), new ones first, 6 or 8 rows with «Show more».

## 2.8.19 · 15/11/2026
- Mapa: ya no se abre en blanco ni sale el aviso «Mapa en blanco». Valores iniciales: Nombres, Noche, el modo de tu estación (SSB), todas las bandas, Clúster y camino corto y largo. Lo demás empieza apagado: predicción VOACAP, caminos, saltos, balizas, DXpediciones, ISS y satélites. A partir de ahí cada uno elige y se recuerda en el dispositivo. Al abrir esta versión se aplican una vez estos valores iniciales.
- El botón «Clúster» del mapa ya no se traba: enciende y apaga a la primera.
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / Map: no more blank start; new defaults (names, night, your mode, all bands, cluster, short and long path); the cluster button no longer sticks.

## 2.8.18 · 15/11/2026
- Las etiquetas «Favorable», «Regular» y «Desfavorable» de las tarjetas de VHF (6 m, 2 m y 70 cm) y del Sol van siempre arriba a la derecha, a la misma altura en todas las tarjetas, también con la letra grande. En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / Level tags always top-right, aligned across cards.

## 2.8.17 · 15/11/2026
- Vista compacta más compacta. Cada estación ocupa dos líneas: arriba el indicativo con su bandera, la frecuencia, el modo y hace cuánto; debajo la banda, las etiquetas en pequeño, el rumbo, el porcentaje y «¿Lo oyes?». El buscador del clúster cabe en una sola línea, con «Filtros» al lado. Los botones de filtro del clúster son más bajos y la leyenda de colores de los modos se oculta. La vista completa no cambia.
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / Tighter compact view: two lines per station, one-line cluster search, smaller cluster filters.

## 2.8.16 · 15/11/2026
- «¿Lo oyes?» solo se abre al tocar ese texto, no al tocar cualquier parte de la tarjeta. El texto tiene una zona de toque cómoda en el móvil.
- Las tarjetas de estaciones en las que ya has anotado si la oyes o si te oye se sombrean: en verde si la oyes o te oye, en rojo si no.
- Cada anotación se guarda con tu locator, potencia y antenas de ese momento y se mantiene hasta que anotes algo nuevo, ya no caduca a las dos horas. El diálogo dice cuándo se anotó y con qué estación. Su efecto en las previsiones sigue durando 45 minutos.
- Las DXpediciones sin spots en la última hora ya no se proponen: no salen en «Qué hacer» ni en «Estaciones raras en el aire», y en DX › DXpediciones van al final, atenuadas, bajo «Anunciadas, sin spots en la última hora» y sin «¿Lo oyes?». «Estaciones raras en el aire» da la frecuencia y la banda del último spot.
- Vista «Completa» o «Compacta» para toda la plataforma, con un botón nuevo en la cabecera, junto a «Aa». La completa es la de siempre. La compacta enseña cada estación en una o dos líneas (indicativo, frecuencia, modo, banda, rumbo, porcentaje y «¿Lo oyes?») y quita las explicaciones. Se recuerda en el dispositivo hasta que se vuelva a cambiar.
- En los móviles estrechos, los cuatro botones de la cabecera (idioma, vista, «Aa» y tema) van juntos en su propia línea.
- Resumen de DX › DXpediciones: cuántas hay anunciadas, cuántas tienen spots en la última hora y la mejor de ellas.
- Vuelve el icono original de la app, el del atardecer. En Android, el borde del icono redondo sigue el color del cielo arriba y el de la Tierra abajo.
- En español e inglés, en todas las pantallas (también 8K), con los cinco tamaños de letra, en los dos temas y en las dos vistas. / «Do you hear it?» opens only from its own link; logged stations are shaded; logs are kept with your station setup until you log again; DXpeditions without spots in the last hour are no longer suggested; new full/compact view for the whole platform, remembered on the device; the original sunset app icon is back.

## 2.8.15 · 15/11/2026
- DX: «Buscar en los clústeres» pasa a ir debajo de los submenús (Clúster, Avisos, Cerca…), para que el menú principal y los submenús vayan juntos sin nada en medio. En español e inglés, en todas las pantallas (también 8K), con los dos tamaños de letra y en los dos temas. / DX: cluster search moved below the sub-menu so both menu bars stay together.

## 2.8.14 · 15/11/2026
- Ahora › Resumen › «Estaciones raras en el aire»: cada estación en dos líneas proporcionadas, con el indicativo, la bandera y el país arriba y, debajo y más pequeño, la banda en su color y el rumbo, que ya no se parten a mitad de dato. Separadas por una línea fina. En español e inglés, en todas las pantallas (también 8K), con los dos tamaños de letra y en los dos temas. / Rare stations card: cleaner two-line layout per station.

## 2.8.13 · 15/11/2026
- Ahora › Resumen: el clúster solo se enseña donde tiene sentido. «Ahora» y el tramo de «Próximas 12 horas» que empieza en la próxima hora siguen con las estaciones que oye el clúster por país. Los tramos más lejanos enseñan la previsión: los destinos que se abrirán en esa banda con su calidad (al tocar uno se abre el mapa a esa hora con su ventana), cuántos más hay y «Ver en el mapa», con una nota de que la lista del clúster aparece cuando llega la hora. En español e inglés, en todas las pantallas (también 8K), con los dos tamaños de letra y en los dos temas. / Later time slots show the forecast instead of what the cluster hears now.

## 2.8.12 · 15/11/2026
- Corregido que, en el móvil con la letra grande, el número de estaciones de cada país en los desplegables del Resumen se saliera de la pantalla. / Fixed an overflow on phones with large text.

## 2.8.11 · 15/11/2026
- Ahora › Resumen: los desplegables de destinos enseñan lo que oye el clúster, no la previsión. En «Ahora» y en cada tramo de «Próximas 12 horas», cada país con estaciones en el clúster en esa banda se despliega con sus estaciones (indicativo, que abre su ficha, frecuencia, modo y hace cuánto), ordenados por número de estaciones, con «Ver en el mapa». Si nadie de esos destinos sale en el clúster, lo dice. En español e inglés, en todas las pantallas (también 8K), con los dos tamaños de letra y en los dos temas. / Destination lists now show what the cluster hears, by country, not the forecast.

## 2.8.10 · 15/11/2026
- Logo: «ACRACB» se lee ahora en todos los tamaños. Va en grande dentro del globo azimutal, encima de «DX», en vez de en letra pequeña debajo; en la pantalla de inicio del iPhone, iPad y Android, en la pestaña del navegador y en el instalador. La versión anterior del globo se guarda en las fuentes. / Logo: «ACRACB» now readable at every size.

## 2.8.9 · 15/11/2026
- Ahora › Resumen: los destinos se pueden ver. En «Ahora», «Ver los N destinos», y en «Próximas 12 horas», al tocar cada tramo, se despliega la lista completa agrupada por continentes con su probabilidad (LP si es por el camino largo). Al tocar un destino se abre el mapa a esa hora y en esa banda con su ventana; «Ver en el mapa» enseña todos. En español e inglés, en todas las pantallas (también 8K), con los dos tamaños de letra y en los dos temas. / Destinations can be expanded and open the map at that hour and band.

## 2.8.8 · 15/11/2026
- Logo nuevo de la plataforma y de la web app: el globo azimutal en azul, con «DX» y «ACRACB». Se ve en el icono de la pantalla de inicio (iPhone, iPad y Android), en la pestaña del navegador y en el instalador; en Android lleva además una versión con margen para que el recorte en círculo no corte nada. El logo anterior se guarda en las fuentes. / New logo: the azimuthal globe, with an Android-safe version.
- «Próximas 12 horas» más clara: tramos siempre con el mismo formato («08–09»), la banda y el número de destinos abiertos como dato principal, con un punto de color según la calidad, y debajo, más discreto, la calidad y con quién; «la mejor» marcada. En el móvil con letra grande la fila se parte en dos líneas en vez de salirse. / Clearer «Next 12 hours».
- En español e inglés, en todas las pantallas (también 8K), con los dos tamaños de letra y en los dos temas.

## 2.8.7 · 15/11/2026
- Ahora › Resumen agrupado de forma más clara, sin tarjetas repetidas: «Ahora» (la mejor banda con cuántos destinos abre, hacia dónde y con quién, «También abiertas» con las siguientes bandas y sus destinos, y 6 m, 2 m y 70 cm), «Próximas 12 horas» por tramos (qué banda conviene de qué hora a qué hora, con «la mejor» marcada) y «Estaciones raras en el aire». Sustituye a las antiguas «Mejor hora próxima» y «Noche o amanecer», que solían repetir lo mismo. / Summary regrouped: Now, Next 12 hours by time slots, and rare stations.
- Menú principal en este orden: Ahora, DX, Mapa y el resto como estaba. / Main menu order: Now, DX, Map, then the rest.
- En español e inglés, en todas las pantallas y en los dos temas.

## 2.8.6 · 15/11/2026
- Mapa: al ampliar, alejar o mover el mapa podían desaparecer las costas y fronteras, o verse solo un recuadro de tierra. Pasaba cuando se abría la pestaña Mapa más de minuto y medio después de cargar la web: el mapa ya no se enteraba de los gestos y seguía usando el recorte de la vista anterior. Ahora se engancha al dibujarse, sea cuando sea, y además se recalcula un instante después de cada movimiento. En todas las pantallas, en los dos temas y en español e inglés. / Map: coastlines and borders could vanish or show only a box of land after zooming or panning; fixed.

## 2.8.5 · 14/11/2026
- Revisión general de fin de semana: pantallas (móvil 360 y 390, tableta vertical y horizontal, portátil, escritorio, 2K, tele 720p y 4K) con los dos tamaños de letra, en los dos temas y en español e inglés, sin desbordes; protección frente a código inyectado en los datos de las fuentes y política de seguridad sin avisos; carga, respuesta y reposo (unos 2 ms de procesador por segundo con la web quieta); memoria estable tras cientos de ciclos; buscador, avisos, notificaciones, silencio, «¿Lo oyes? / ¿Te oyen?», mapa, satélites y modos comprobados; tareas automáticas de GitHub y Cloudflare en verde. Tema claro: verde y ámbar de estados algo más oscuros para leerse mejor. / Weekend general review; slightly darker green and amber in the light theme for better contrast.

## 2.8.4 · 14/11/2026
- Buscador: «Continente DX» se calcula ahora como en los clústeres, con el continente DXCC de cada estación (y su posición si no se conoce), igual que «Continente del spotter»; antes dependía de la zona de previsión y podía dejarlo vacío. Desplegable con identificador propio para que ningún navegador lo confunda. / Search: «DX continent» now uses each station's DXCC continent, like the spotter one.

## 2.8.3 · 14/11/2026
- Notificaciones revisadas para todos los aparatos: se envían siempre a través del service worker, que es lo que admiten Android, iPhone, iPad y Chrome (antes, si no estaba listo, se intentaba de una forma que esos aparatos rechazan y no llegaba nada). Con las notificaciones activadas y sin silenciar, la plataforma sigue buscando avisos cada 3 minutos aunque estés en otra app o pestaña (antes se paraba al salir y no podía avisar). Junto al interruptor: botón «Probar», «Silenciar 1 hora · hasta mañana a las 8:00 · hasta que las reactive», qué alcance tienen en cada aparato (en iPhone y iPad, mientras la app guardada en la pantalla de inicio está abierta y poco después) y cómo desbloquearlas en iPhone, Android y ordenador si se bloquearon. Corregido que un fallo al pintar el panel impidiera avisar. Al tocar la notificación se abre la plataforma. / Notifications reviewed for every device: sent through the service worker, keep checking every 3 minutes in the background, test and mute buttons next to the switch.
- Buscador: los filtros van plegados en «Filtros» para que ocupe menos, con el número de filtros activos a la vista; filtros como en los clústeres conocidos: Banda, Modo (CW, Fonía, Digitales y los concretos), Continente DX, Continente del spotter (EU, AF, AS, NA, SA, OC, AN), Tipo (DX, POTA, SOTA, WWFF) y Antigüedad. El continente funciona ya en todos los casos, también con las estaciones cercanas. / Search filters fold away, with DX and spotter continent like the usual clusters.

## 2.8.2 · 14/11/2026
- Buscador de DX con desplegables, más sencillo: Banda, Modo (SSB, CW, FT8, FT4, RTTY, digitales, AM, FM), Tipo (DX, POTA, SOTA, WWFF), Continente y «Oído hace» (15 min, 30 min, 1 h). Se combinan entre sí y con el texto (indicativo, frecuencia o país); los resultados salen al momento y «Borrar» lo deja todo como al principio. En el móvil, los desplegables van de dos en dos. En español e inglés, en todas las pantallas y en los dos temas. / DX search with simple dropdowns for band, mode, type, continent and age.

## 2.8.1 · 14/11/2026
- Buscador de DX más versátil: entiende indicativos de cualquier tipo (EA5RKB, EA5RKB/P, /M, /MM, /QRP, VP8/G3ABC, EA8/DF4UE, especiales como 8J1RL, 4U1UN, R100RS o II0A) y también por partes (EA5, G3ABC dentro de VP8/G3ABC), comodines (EA8/* o */MM), frecuencias (14.074, 14074, 7.1 o 14), bandas (20m, 20 m, 40, 70cm), modos (SSB, LSB, USB, fonía, CW, FT8, FT4, RTTY, PSK, digi…), programas (POTA, SOTA, WWFF, DX), referencias (US-1234, EA5/AT-001, EAFF-0123) y países (Japón, Chile). Las palabras se combinan: «20m FT8», «40 CW», «POTA SSB», «chile ft8». Enseña qué ha entendido, de qué entidad es un indicativo aunque no tenga spots, con enlace a su ficha, y botones de ejemplo para probar. En español e inglés, en todas las pantallas y en los dos temas. / Search now understands any kind of callsign, wildcards, frequencies, bands, modes, programs, references and countries, combined.

## 2.8.0 · 14/11/2026
- Buscador en DX: escribe un indicativo (o parte, como «EA5» o «/P») o una frecuencia (14.205, 14205, 7.07 o 14) y ves al momento todos los spots recientes que coinciden en el clúster DX y el RBN, POTA, SOTA y WWFF, con las mismas tarjetas que el resto de la plataforma, más si es una DXpedición anunciada y a qué estaciones ha oído ese indicativo. En español e inglés, en todas las pantallas y en los dos temas. / Search box in DX: find a callsign or a frequency across all the clusters checked.

## 2.7.10 · 14/11/2026
- El botón «Avisarme con una notificación» sale en cualquier aparato que abra la web, incluso si el navegador no puede ejecutar la plataforma completa: entonces explica que hay que abrirla en un Chrome, Edge, Firefox o Safari actualizado. / The «Notify me» button shows on any device that can open the site, even when the browser cannot run the full platform.
- La plataforma vuelve a funcionar en los iPad y iPhone con iPadOS o iOS 15 y 16 anteriores a 16.4: una expresión del formato de frecuencias que esas versiones de Safari no entienden impedía cargar una parte del código. Mismo resultado en todos los navegadores. / The platform runs again on iPad and iPhone with iOS/iPadOS 15 and 16 before 16.4.

## 2.7.9 · 14/11/2026
- Avisos: el botón «Avisarme con una notificación» sale ahora en todos los aparatos. Antes desaparecía donde el navegador no deja notificar, por ejemplo en el iPad o el iPhone con la plataforma abierta en Safari sin guardarla en la pantalla de inicio. Ahora, al pulsarlo, explica cómo activarlas: en el iPad y el iPhone, guardarla con Compartir › «Añadir a pantalla de inicio» y abrirla desde ese icono (o actualizar a iOS o iPadOS 16.4 si es más antiguo); en otros navegadores, abrirla en Chrome, Edge, Firefox o Safari. En español e inglés, en todas las pantallas y en los dos temas. / The «Notify me» button now shows on every device and explains how to enable notifications where the browser does not allow them (iPad and iPhone: Add to Home Screen).

## 2.7.8 · 14/11/2026
- «Hora a hora» más fácil de leer, como un semáforo: verde, la banda llega a buena parte del mundo a esa hora; amarillo y naranja, a una parte; rojo, a muy poco; oscuro, cerrada. Leyenda con palabras (cerrada, muy poco, poco, regular, bien, muy bien) y el porcentaje al lado; explicación corta al principio («Busca el verde»); la fila «Mejor» enseña el número de la banda también en el móvil; la fila «Sol» usa azul cielo para el día para no confundirse con el semáforo; casillas rayadas visibles en el tema claro. En español e inglés, en todas las pantallas y en los dos temas. / Hour-by-hour chart as a traffic light, with plain-word legend.

## 2.7.7 · 14/11/2026
- Ahora › Bandas: la columna HamQSL volvía a salir «sin datos» en todas las bandas. Los datos sí llegaban, pero ya traducidos (Buena, Regular, Mala, Cerrada) y la tabla solo los entendía en inglés. Corregido; 60 m usa la previsión de HamQSL de 80–40 m. / Bands: the HamQSL column showed «no data» because its values arrive translated; fixed.

## 2.7.6 · 14/11/2026
- Mapa: al tocar una estación, una DXpedición o un destino, la ventana trae el mismo «¿Lo oyes? / ¿Te ha oído?» que las tarjetas, con sus botones grandes y las escalas de legibilidad (R) y de señal (S0 a S9+60, o dB en digitales), en lugar del bloque antiguo. / Map popups now have the same «Do you hear it? / Did it hear you?» panel as the cards.
- La ficha de la EEI y de cada satélite sale en la ventana pequeña del mapa, como la de las estaciones, en vez de a pantalla completa. / Satellite details open in the small map popup.
- Iconos de la EEI y los satélites con fondo y borde propios, bien visibles en el tema claro y en el oscuro; en verde los que oyes ahora. / Clearer satellite icons in both themes.
- A pantalla completa ya no se ve detrás del mapa el panel de la EEI y los satélites. / Fixed the satellite panel showing behind the full-screen map.

## 2.7.5 · 14/11/2026
- Los modos (mapa, clúster y estación) funcionan como las bandas: con «Todos» activo no se marcan los demás; al tocar uno se ve solo ese, puedes sumar otros y, al quitar el último, vuelve a «Todos». Ya no se queda trabado el último modo marcado. La predicción VOACAP se calcula en el modo que elijas. En español e inglés, en la web y en el artefacto, en todas las pantallas y en los dos temas. / Modes now work like bands, with «All».

## 2.7.4 · 14/11/2026
- La EEI y los satélites salen encendidos de serie en el mapa, con icono propio: la EEI con sus paneles solares y cada satélite con uno más pequeño, en verde cuando lo oyes. Al tocarlos (o su nombre bajo el mapa) se abre su ficha, como con las estaciones: posición, altura, velocidad, dónde está desde tu QTH, los tres próximos pases sobre tu locator con hora, duración, elevación máxima y rumbos, frecuencias de subida y bajada, y enlace al estado en AMSAT. Con la EEI o los satélites visibles ya no sale «Mapa en blanco». Solo en la web. / ISS and satellites on by default on the map, with their own icons and a details panel on tap.
- Repaso general: sin errores en consola, sin fugas de memoria tras cientos de ciclos de actualización, misma cantidad de nodos y escuchadores, protección frente a código inyectado en los datos de las fuentes y política de seguridad sin avisos; formatos comprobados en móvil, tableta, portátil, escritorio, 2K, tele 720p y 4K, con los dos tamaños de letra, en español e inglés y en los dos temas. / General review: no errors, no memory leaks, security checks and every screen size.

## 2.7.3 · 14/11/2026
- Satélites y EEI más fiables: la plataforma guarda su propia copia de las órbitas dos veces al día (tarea «Órbitas de satélites» en GitHub), descargada de CelesTrak o, si no responde, de AMSAT, y la lee desde su propia web. Si esa copia faltara, prueba CelesTrak y AMSAT directamente. Antes dependía solo de CelesTrak y, si no dejaba descargar, la pestaña Satélites y las capas ISS y Satélites del mapa se quedaban vacías. CelesTrak y AMSAT entran también en la vigilancia semanal de fuentes. / Satellites and ISS no longer depend on a single source: the platform keeps its own copy of the orbits, from CelesTrak or AMSAT.

## 2.7.2 · 14/11/2026
- S-metro con S9+5 entre S9 y S9+10, en «Lo oigo» y en «Me oyen». En español e inglés, en la web y en el artefacto, en todas las pantallas y en los dos temas. / S9+5 added to the S-meter.

## 2.7.1 · 14/11/2026
- La fila «Ver» del clúster funciona como la de bandas: con «Todos» activo no se marcan los demás; al tocar uno se ve solo ese, puedes sumar otros y, al quitar el último, vuelve a «Todos». Ningún botón se queda trabado. / The cluster «Show» row now works like the band row.
- S-metro de 10 en 10 por encima de S9: +10, +20, +30, +40, +50 y +60, en «Lo oigo» y en «Me oyen». / S-meter in 10 dB steps above S9, up to +60.
- En español e inglés, en la web y en el artefacto, en todas las pantallas y en los dos temas. / In Spanish and English, web and artifact, every screen and both themes.

## 2.7.0 · 14/11/2026
- El mismo comportamiento en todas las tarjetas de estación de la plataforma: al tocar la tarjeta se abre «¿Oyes a…?» (Lo oigo / Me oyen) y al tocar el indicativo se abre su ficha completa (entidad, cómo llegarle, tus bandas hacia allí, actividad en el clúster, DXpedición y enlaces), la misma que ya salía en la pestaña DX. Corregido que en el clúster, Avisos y otras listas desplegables la tarjeta no abriera el diálogo. Las DXpediciones también abren el diálogo; el mapa sigue en la ficha. / The same behavior on every station card: tap the card to log what you hear, tap the callsign for its full page.
- S0 en el S-metro: la aguja no se mueve, algo habitual en fonía con bandas tranquilas. Con S0 manda la legibilidad R, porque con S0 y R3, R4 o R5 el QSO es posible; se aplica a la calibración y a los porcentajes de toda la plataforma. / S0 on the S-meter: readability R decides the signal-to-noise estimate.
- Todas las tarjetas dicen hace cuánto se oyó la estación por última vez, también las de DXpediciones y «Qué hacer»; si no hay spots recientes, lo indican. / Every card shows how long ago the station was last heard.
- «¿Lo oyes?» siempre en naranja: antes cambiaba de gris a naranja según dónde hubieras tocado. / «Do you hear it?» is always orange.
- Botón «Todos» en la fila «Ver» del clúster (DX, POTA, SOTA y WWFF), como en Modos y Banda. / «All» button in the cluster «Show» row.
- En español e inglés, en la web y en el artefacto, en todas las pantallas, tamaños de letra y en los dos temas. / In Spanish and English, web and artifact, every screen, text size and both themes.

## 2.6.9 · 14/11/2026
- En el aviso DX de la portada, «Silenciar» pasa a la izquierda, delante de «Ver en Avisos» y «Cerrar», y su menú se abre alineado con el botón. En español e inglés, en la web y en el artefacto, en todas las pantallas y en los dos temas. / «Mute» moved to the left of «See in Alerts» and «Close» on the DX alert.

## 2.6.8 · 14/11/2026
- Tema claro u oscuro automático según el locator que escribas: se calcula la altura del Sol en tu cuadrícula (con la subcuadrícula si la pones) y se pasa a oscuro cuando el Sol baja de 3° bajo el horizonte, y a claro cuando vuelve a salir. Cambia en cuanto cambias el locator, sin esperar a la siguiente actualización, y se revisa cada minuto. Si eliges el tema a mano en Ajustes, se respeta tu elección. En español e inglés, en la web y en el artefacto. / Automatic light or dark theme from the locator you enter: it follows the Sun at your grid square, switches as soon as you change the locator, and respects a manual choice.

## 2.6.7 · 14/11/2026
- «¿Te ha oído?» en el diálogo de todas las tarjetas de estación, con el mismo diseño que «¿Lo oyes?»: «Me oyen / No me oyen» y el reporte que te han dado según el modo (R y S en fonía y CW; dB del programa en digitales). «Lo oigo» ajusta tu recepción y «Me oyen» tu transmisión; durante 45 minutos «Me oyen» sube mucho la probabilidad de esa zona y «No me oyen» la baja poco, porque puede ser el pile-up. En las DXpediciones solo cuenta que te han oído, porque casi siempre dan 59 o 599. La tarjeta lo indica con «Te oyen · R5 · S9». En español e inglés, en la web y en el artefacto, en todas las pantallas y en los dos temas. / «Did it hear you?» on every station card, with the report you were given, tuning your transmission side.

## 2.6.6 · 14/11/2026
- Botón «Silenciar» en el aviso DX de la portada: 1 hora, hasta mañana a las 8:00 o hasta que lo reactives. Mientras tanto no salen ni el aviso de la portada ni las notificaciones del móvil; en Avisos se indica hasta cuándo, con un botón «Reactivar». En el móvil las opciones salen como hoja inferior y en el ordenador como menú. / «Mute» button on the home-screen DX alert.
- «¿Lo oyes?» ocupa menos en las tarjetas: una sola línea discreta al pie, a la derecha, sin separador. / More discreet «Do you hear it?» line on cards.
- Reporte según el modo: en fonía, R (legibilidad) y S; en CW también R y S, como en el RST; en los modos digitales (FT8, FT4, RTTY…), la señal en dB que da el programa, más exacta que el S-metro. / Report by mode: R and S on phone and CW, software dB on digital modes.
- En español e inglés, en la web y en el artefacto, en todas las pantallas y en los dos temas. / In Spanish and English, web and artifact, every screen and both themes.

## 2.6.5 · 14/11/2026
- Al tocar cualquier tarjeta de estación de la plataforma se abre el diálogo «¿Oyes a…?», con dos botones grandes «Lo oigo» y «No lo oigo». Si la oyes, en fonía (SSB, AM y FM) puedes marcar la legibilidad, de R1 «ilegible» a R5 «perfecto», y en todos los modos la señal del S-metro. La R y la S se combinan para estimar la relación señal/ruido real y afinar tus previsiones. La tarjeta muestra después «Lo oyes · R4 · S7». Se cierra con «Listo», con la cruz, tocando fuera o con Escape. En español e inglés, en la web y en el artefacto, en el móvil (desde abajo) y en el ordenador (en el centro), en los dos temas. / Tapping any station card opens a «Do you hear…?» dialog with large buttons, readability (R, phone modes) and S-meter.

## 2.6.4 · 14/11/2026
- «¿Lo oyes?» en todas las tarjetas de estaciones activas (clúster, aviso de portada, Avisos, «Qué hacer», «Cerca» y POTA/SOTA/WWFF): un enlace discreto despliega «Lo oigo / No lo oigo» y, si la oyes, la escala del S-metro. La tarjeta muestra después «Lo oyes · S7» o «No lo oyes». Tu escucha entra en la calibración de tu estación y, durante 45 minutos, es la prueba más fuerte para esa zona y banda: si la oyes, su probabilidad sube según la señal; si no la oyes, baja. En español e inglés, en la web y en el artefacto. / «Do you hear it?» on every active station card, with S-meter reading, feeding calibration and the live chance for 45 minutes.

## 2.6.3 · 14/11/2026
- La probabilidad de QSO sale ahora en todas las tarjetas de estación: el aviso DX de la portada, la lista de Avisos, «Cerca» y las actividades POTA, SOTA y WWFF, con la misma medida que el resto de la plataforma (VOACAP con tu estación, en el modo del spot, equilibrado con los clústeres). En español e inglés, en la web y en el artefacto. / QSO chance now shown on every station card, including the home-screen alert, Alerts, Nearby and POTA/SOTA/WWFF.

## 2.6.2 · 14/11/2026
- Interruptor «Todos los modos» con exactamente el mismo alto que el selector de modo en todas las versiones y pantallas. / The «All modes» switch now matches the mode selector height everywhere.

## 2.6.1 · 14/11/2026
- «Todos los modos» en la configuración de la estación es ahora un interruptor deslizante con el estilo de la plataforma, del mismo alto que el selector de modo y pegado a él, en los dos temas, en español e inglés, en la versión web y en el artefacto, y en todas las pantallas. Antes se veía una casilla enorme en el iPhone. / «All modes» is now a proper toggle switch next to the mode selector.

## 2.6.0 · 14/11/2026
- Lectura del S-metro al anotar «Lo oigo»: una escala de S1 a S9 y de +10 a +60, en colores de verde a rojo como un S-metro real. La lectura se convierte en nivel de señal (S9 = −73 dBm y 6 dB por punto S), se compara con el ruido típico de la banda en tu entorno y la calibración usa esa relación señal/ruido real además de «lo oigo / no lo oigo», con lo que tus previsiones se ajustan mucho antes. Es opcional: sin lectura se guarda solo que lo oyes. / S-meter reading (S1 to S9+60) when logging «I hear it», used by the calibration.

## 2.5.9 · 14/11/2026
- «Todos los modos»: casilla en la configuración de la estación (junto al modo), selector «Mi modo / Todos los modos» en «Qué hacer» y botón «Todos» en los selectores de modo del clúster y del mapa. Los tres van sincronizados y la elección se recuerda. Con todos los modos, el clúster, los avisos y «Qué hacer» proponen estaciones de cualquier modo, cada una con su probabilidad calculada en su propio modo; el modo elegido sigue siendo la base de la previsión. / «All modes» option in the station settings, in «What to do» and in the mode selectors.

## 2.5.8 · 14/11/2026
- Misma medida en toda la plataforma (VOACAP equilibrado con los clústeres), salvo la capa «Predicción VOACAP» del mapa y su ventana de destino, que enseñan la previsión de VOACAP sola. Explicado en Método › Cálculo. / One measure everywhere, except the map's «VOACAP forecast» layer, which shows pure VOACAP.
- Bandas: «sin datos» en lugar de «sin dato». / Bands table wording.

## 2.5.7 · 14/11/2026
- El código de la web se publica compactado: un 13 % menos de peso, el primer texto aparece en 0,24 s (antes 0,28 s), menos trabajo del procesador al abrir (4,1 s frente a 4,4 s en un móvil lento simulado) y menos memoria (22 MB frente a 29 MB). Revisión completa en todas las pantallas, tamaños de letra e idiomas, sin errores. / Minified code: lighter, faster first paint, less CPU and memory at startup.

## 2.5.6 · 14/11/2026
- La etiqueta «DXpedición» destaca en toda la plataforma: píldora roja y ámbar con letra blanca, brillo cálido y un punto luminoso, en los dos temas. / The «DXpedition» badge now stands out in red and amber.
- «Qué hacer» solo recomienda lo que puedes trabajar: los spots y las DXpediciones en tus modos (el de tu estación y los que añadas en el clúster). Antes podía proponer una DXpedición que solo trabajaba en CW aunque operaras en SSB. / «What to do» only suggests stations in your own modes.
- En la versión inglesa, los meses de las fechas de las DXpediciones salen en inglés (Nov, Dec…). / DXpedition dates use English month names.

## 2.5.5 · 14/11/2026
- La etiqueta «NUEVO» es más llamativa en toda la plataforma: píldora con degradado esmeralda y turquesa, brillo suave y un punto luminoso, en los dos temas. Sin animación, para no gastar batería. / More eye-catching «NEW» badge across the platform.

## 2.5.4 · 14/11/2026
- Más rápida: las tipografías se sirven desde la propia web en lugar de Google Fonts. La página termina de cargar en 1,3 s en lugar de 2 s en un móvil lento simulado, el texto aparece antes, funciona igual sin conexión y ya no se conecta a ningún servidor de Google (más privacidad). / Fonts are now self-hosted: faster loading, works offline, no requests to Google.
- Tarjetas más limpias: solo muestran la probabilidad final de QSO; cómo se calcula (VOACAP más clústeres) está explicado en Método › Cálculo. / Cards show only the final QSO chance; the explanation lives in Method.

## 2.5.3 · 14/11/2026
- El equilibrio entre VOACAP y los clústeres se aplica a toda la plataforma: mapa, resumen, bandas, hora a hora, «Qué hacer», DXpediciones y avisos. Cada probabilidad de la hora actual se corrige con los spots de los últimos 45 minutos hacia ese destino o su zona, según el parecido del trayecto, la antigüedad, la señal y el modo (un spot de FT8 prueba menos para la SSB). Una hora antes o después cuenta la mitad; a partir de dos horas, solo la previsión. / The VOACAP + cluster balance now applies to every figure on the platform.
- Evidencia en contra: si desde tu zona se oye mucho DX en una banda y nada de un destino que normalmente está activo, su probabilidad baja con prudencia, como mucho a la mitad. / Negative evidence: an active band with nothing heard from a usually active destination lowers its chance, at most by half.
- Explicado en Método › Cálculo › «Equilibrio con los clústeres». / Explained in Method › Calculation.

## 2.5.2 · 14/11/2026
- Probabilidad de QSO aún más precisa, como equilibrio entre la previsión VOACAP y la realidad de los clústeres: cada spot de los últimos 45 minutos en esa banda, de esa estación o de otra de su misma zona, cuenta según lo que se parece el trayecto del que lo oye al tuyo (misma zona de rebote en la ionosfera y distancia parecida), su antigüedad y su señal. La tarjeta muestra la cifra final y, al lado, la de VOACAP sola cuando difieren. / QSO chance balances VOACAP and live cluster data, weighting each spot by path similarity, age and signal; the card shows both figures.

## 2.5.1 · 14/11/2026
- Probabilidad de QSO de las tarjetas del clúster y de «Qué hacer», más ajustada: el modelo VOACAP con tu estación se calcula ahora para el modo del spot (un spot de FT8 o CW necesita bastante menos señal que la SSB) y se combina con lo que pasa en ese momento: si estaciones a menos de 1.500 km de ti lo están oyendo, pesa según su cercanía, la antigüedad del spot, la señal que dan y cuántas lo oyen; y si a ti te han oído cerca de esa estación en esa banda en los últimos 45 minutos, sube aún más. Las tarjetas lo indican con «lo oyen cerca de ti» o «te oyen por allí». / QSO chance now uses the spot's mode and live evidence: nearby spotters and stations that hear you.

## 2.5.0 · 14/11/2026
- El código fuente completo de la plataforma se guarda en la carpeta `fuente` del repositorio, con instrucciones y un script para montarla y publicarla (`fuente/LEEME.md`). La web ya no depende de ningún equipo concreto para poder seguir mejorándose. / Full source code now kept in the `fuente` folder, with build instructions.
- Respaldo de la previsión VOACAP: si `acracb-voacap.pages.dev` no responde, la web usa `acracb-voacap-respaldo.pages.dev`. El respaldo se crea y se pone al día con el flujo «Respaldo VOACAP en Cloudflare». / VOACAP backup on a second Cloudflare Pages project.
- Vigilancia semanal de las 34 fuentes de datos: cada lunes un flujo automático las prueba y, si alguna falla, abre un aviso en GitHub que llega por correo. / Weekly automatic check of every data source, with an e-mail alert if one fails.
- Menos consumo en móviles y tabletas: el precálculo de las 24 horas para todas las bandas se hace como mucho cada 15 minutos con batería, en lugar de tras cada actualización. / Less background computation on battery.
- Accesibilidad: más contraste en textos secundarios, etiquetas y color de acento en los dos temas. / Higher contrast for secondary text and labels.
- Nota de privacidad en el pie: sin registro, sin cookies y sin seguimiento; ajustes y log ADIF solo en el dispositivo. / Privacy note in the footer.

## 2.4.9 · 14/11/2026
- Resumen: «El Sol ahora» enseña a la vista lo esencial (flujo solar, manchas, Kp, índice A, viento solar, Bz, rayos X y apagones con el veredicto); el resto de valores, la previsión, el ciclo solar y las explicaciones van en un desplegable. / «The Sun now» shows the essentials; the rest folds away.
- «Palabras y expresiones que conviene saber» pasa al final del resumen, con 55 términos (antes 35) y 8 a la vista cada vez, y tres tablas de consulta: el alfabeto fonético internacional, el código Q más usado y el código Morse para CW con sus abreviaturas. / Glossary moved to the end of the summary, with 55 terms, the phonetic alphabet, the Q code and Morse code for CW.
- Versión en inglés: ortografía de Estados Unidos (color, ionized, kilometers, analyze). / English version uses US spelling.

## 2.4.8 · 14/11/2026
- Actualización automática según la corriente: donde el navegador dice si el aparato está enchufado (Chrome, Edge y Android), enchufado se actualiza cada minuto y con batería cada 3 minutos, también en portátiles. Donde no lo dice (iPhone, iPad, Safari y Firefox), móvil y tableta cada 3 minutos y ordenador cada minuto. Sin tocar la pantalla 5 minutos, cada 10. / Auto-update every minute when plugged in, every 3 minutes on battery.

## 2.4.7 · 14/11/2026
- Avisos DX: el modo y las bandas que eliges en Avisos mandan en todo. La lista, el aviso flotante de la portada, el resumen del apartado y las notificaciones del móvil solo muestran los avisos de esa elección (por ejemplo, solo SSB en todas las bandas). Al cambiar el filtro se actualiza todo al momento. / Your Alerts mode and band choice now applies everywhere: list, home-screen alert, summary and phone notifications.

## 2.4.6 · 14/11/2026
- Menos consumo: con la pestaña en segundo plano o la pantalla apagada se detienen también el giro de balizas, la animación del mapa, el glosario y la línea de 24 h. Más fuentes lentas (previsión de 3 días, flujo solar, manchas, WWV y aurora) se reutilizan unos minutos en lugar de pedirse en cada actualización. / Lower energy use: more timers pause in the background and slow sources are reused for a few minutes.
- Fiabilidad: cada versión se comprueba automáticamente antes de publicarse y no sale si algún archivo tiene un error. / Every build is syntax-checked before publishing.

## 2.4.5 · 14/11/2026
- Franja de valores de la portada rediseñada como un panel de instrumentos: casillas iguales con su nombre arriba, el valor debajo y una marca de color (verde, ámbar o rojo). Ocupa todo el ancho y se reparte en 8, 4 o 2 columnas según la pantalla y el tamaño de letra, siempre con las filas completas. / Top value strip redesigned as an instrument panel.
- Toda la plataforma aprovecha mejor el espacio en pantallas anchas y televisores: las casillas de valores se reparten en filas iguales (sin media fila vacía), el aviso DX reparte sus tarjetas en todo el ancho, el calendario de concursos y la tabla de balizas ocupan todo el ancho, y el informe de fuentes de «Actualizar» va en su propia línea. / Better use of space on wide screens and TVs across the platform.

## 2.4.4 · 14/11/2026
- Menos calor y batería en el móvil: la actualización automática (30 fuentes cada vez) pasa a cada 3 minutos en móviles y tabletas (sigue cada minuto en el ordenador), a cada 10 minutos si nadie toca la pantalla durante 5, y se detiene con la pestaña en segundo plano. «Actualizar» sigue siendo inmediato. / Less heat and battery use: automatic updates every 3 min on phones, every 10 min when idle, none in the background.
- «Qué hacer»: cada estación recomendada sale en una tarjeta como las del resto de la plataforma: frecuencia, modo, banda, rumbo y distancia por el camino corto y el largo, y probabilidad de QSO. Si la DXpedición no ha publicado frecuencia para esa banda, se indica la habitual de su modo. / «What to do» now uses the common station cards.
- La franja de valores de la portada incluye el índice A. / The top value strip now includes the A index.

## 2.4.3 · 14/11/2026
- Distancias y rumbos de las tarjetas calculados sobre el elipsoide terrestre WGS84 (fórmula de Vincenty) en lugar de una Tierra esférica: precisión de metros (antes el error podía llegar al 0,5 %, unos 20 km hacia Australia). El camino largo usa la longitud real de esa vuelta al planeta, que no siempre es 40.030 km. Los locators de 8 y 10 caracteres se aprovechan enteros. / Distances and bearings on the WGS84 ellipsoid (Vincenty); long path uses the real loop length.
- Índice A redondeado a número entero, como lo publica NOAA. / A index shown as an integer.
- Botones del mapa sin retardo: el botón cambia en el acto y el mapa se redibuja en el fotograma siguiente; varias pulsaciones seguidas se redibujan una sola vez. / Map buttons respond instantly.

## 2.4.2 · 14/11/2026
- Distancias y rumbos corregidos en las tarjetas del clúster: se medían hasta el punto de previsión VOACAP de la zona, no hasta la estación. Ahora se miden desde tu locator hasta la posición de la estación: la que da el spot o su locator, el locator escrito en el comentario o, si no hay, la región de su indicativo. Ya no se usa el centro del país que manda alguna fuente cuando no sabe dónde está la estación. Lo mismo en los avisos y en «¿Me oyen?». / Cluster card distances and bearings now go from your locator to the station itself, not to the VOACAP zone point.
- «El Sol ahora» en el resumen trae todos los datos de la sección Sol: valores reales (también Bt, protones, aurora, llamaradas, apagones fuertes y tormentas de protones), las próximas horas y días (flujo de mañana, próxima tormenta, mejores días para el DX, CME) y el ciclo solar, con el resumen escrito de Sol, geomagnetismo y previsión. / «The Sun now» on the summary shows every solar value from the Sun section.
- Aviso DX: «Ver los N» lleva a la lista completa de Avisos y la deja a la vista; el aviso flotante ya no la tapa. / «See all» in the DX alert now opens the full Alerts list.

## 2.4.1 · 14/11/2026
- Avisos DX: el aviso flotante respeta los modos y bandas que eliges en Avisos y tiene el mismo formato de tarjeta que el resto de la plataforma. / The floating DX alert follows your Alerts mode and band filters and uses the common card style.
- DXpediciones: tarjetas por apartados (actividad, mejor hora, rumbo y distancia por el camino corto y el largo, línea gris, QSX); «Mostrar más» ya no deja tarjetas medio vacías ni tapa las de abajo. / Sectioned DXpedition cards; «Show more» fixed.
- Distancias corregidas: en EE. UU., Canadá, Australia, Rusia, Japón, Brasil y China la estación se sitúa por el número de su indicativo (o el sufijo portable) y no en el centro del país. Junto al rumbo se dan las distancias del camino corto y del largo. / Distances fixed for large countries (station placed by call area); short and long path distances shown.
- Donde un valor es la media mensual ya pone «media»; donde se combinan varias fuentes, «valor central». / «Average» and «central value» wording.
- Mapa: más zoom (hasta 41 aumentos), nombres de países principales siempre visibles y más nombres a poco que amplíes, y textos legibles en modo claro también en Safari. / Map: more zoom, more country names, readable labels in light mode.
- Mapa, «Qué ver»: la ISS con posición, altura, velocidad, próximo paso y frecuencias, y los satélites de radioaficionado con su posición, los que oyes ahora y los próximos pasos. / ISS and amateur satellites on the map.
- Resumen: bloque «El Sol ahora» con flujo solar, manchas, Kp, índice A, viento solar, Bz, rayos X y apagones de las últimas 24 h. / «The Sun now» block on the summary.
- Tema claro u oscuro automático según la hora del amanecer y el anochecer en tu locator; el botón sigue funcionando y tu elección dura hasta el siguiente cambio de luz. / Automatic light/dark theme from your locator's sunrise and sunset.
- El texto «Qué significa cada valor» de la ionosonda ya no se corta. / Ionosonde help text no longer cut off.
- Fuera el modo tele; las pantallas muy grandes conectadas a un ordenador se ajustan solas. / TV mode removed; very large screens adapt by themselves.
- Menos consumo y menos calor en el móvil: el reloj y el mapa ya no despiertan al resto de la página cada segundo, nada se actualiza con la pestaña en segundo plano, y en pantallas táctiles se quitan los desenfoques y brillos que hacían trabajar a la GPU. Botones del mapa más ágiles. / Lower CPU and battery use, cooler phones, snappier map buttons.

## 2.4.0 · 13/11/2026
- Previsión VOACAP con un sexto nivel de actividad solar (SSN 140): con más de 100 manchas ya no se queda fija en 100, y mejora 15, 12 y 10 m mientras el Sol siga alto. Calculado con el mismo VOACAP y los mismos ajustes que los otros cinco niveles. / A sixth solar activity level (SSN 140).
- Las zonas VOACAP (132 zonas, 6 niveles) se guardan en Cloudflare Pages en un formato nuevo, comprimido con LZMA y con los datos exactos: la previsión es idéntica a la de antes hasta 100 manchas (comprobado zona por zona). Si Cloudflare no respondiera, la web prueba una copia de respaldo. En GitHub la web pasa de 792 MB a unos 5 MB. / VOACAP areas now served from Cloudflare Pages; the GitHub site drops from 792 MB to about 5 MB.
- Fuera la carpeta «voa» (16 MB), que ya no usaba nadie. / Removed the unused «voa» folder.

## 2.3.8 · 13/11/2026
- Mapa a pantalla completa: los paneles de controles y la leyenda son translúcidos y, tras 4 segundos sin tocar nada, se apartan casi del todo para dejar ver el mapa azimutal entero; vuelven al mover el ratón, tocar la pantalla o usar el teclado (y no se apartan mientras el ratón está encima). La leyenda solo enseña los colores de las bandas, en menos espacio; en el móvil, panel y leyenda son más bajos. En modo tele la leyenda también es compacta. / Full-screen map: translucent panels that fade away when idle.

## 2.3.7 · 13/11/2026
- Clúster: el título vuelve a ser solo «Clúster del planeta» y el estado va debajo en una línea pequeña: un punto verde cuando está al día (ámbar y «revisado hace X min» si se retrasa), el modo, los spots nuevos y la hora del último. / Cluster status moves to a small line under the title.

## 2.3.6 · 13/11/2026
- Mapa más fino y mucho más ligero: costas y fronteras se dibujan solo para la zona que se ve (con margen para arrastrar) y sin los puntos que no se distinguen en pantalla. Sin zoom se dibuja la mitad que antes y con el zoom máximo unas 25 veces menos. El mapa detallado de 1:50 millones se usa a partir de 3 aumentos (antes se descargaba pero no llegaba a dibujarse). Mientras arrastras ya no se recalculan las marcas si no cambia el zoom. / Lighter, finer map: only the visible area is drawn, without invisible detail.

## 2.3.5 · 13/11/2026
- Todos los filtros de bandas (clúster, avisos y mapa) enseñan siempre las 13 bandas, de 160 m a 70 cm; las que ahora no tienen nada salen atenuadas. En el mapa, una banda que el modo elegido no usa según el plan de bandas (por ejemplo, SSB en 30 m) se puede marcar igual y avisa de que su previsión es orientativa. Los selectores de modo de toda la plataforma tienen los 11 modos. / Every band filter always lists all 13 bands and every mode selector all 11 modes.

## 2.3.4 · 13/11/2026
- Avisos DX: el filtro de modo incluye todos los del selector de tu estación: SSB, AM, FM, CW, FT8, FT4, JT65, JS8Call, RTTY, PSK31 y SSTV (y «Otros»). / Alert mode filter lists every mode.
- Mapa: dos pasos más de zoom (hasta unos 26 aumentos) y, al ampliar, costas y fronteras unas 5 veces más detalladas (ese mapa se descarga solo la primera vez que amplías); arcos y círculos se redibujan con más precisión para que sigan siendo curvas suaves. / Map: two more zoom steps and a detailed map when zoomed in.

## 2.3.3 · 13/11/2026
- Todas las barras de filtros (Ver, Modo y Banda del clúster y de los avisos) son carruseles de una sola línea que se deslizan de lado, como el resto de la plataforma. / Every filter bar is now a one-line carousel.

## 2.3.2 · 13/11/2026
- Avisos DX: los filtros enseñan siempre todos los modos (CW, SSB, FT8, FT4, RTTY, otros) y todas las bandas de tu estación; los que ahora no tienen avisos salen atenuados. / DX alerts: every mode and band is always listed.
- Botón «Aa»: ahora agranda la letra, los botones y las banderas por igual, y la página se sigue ordenando según el ancho real de la pantalla. En el móvil ya no se sale nada por los lados y en ordenadores y televisores se mantienen las columnas. Comprobado en 9 tipos de pantalla (móvil de 360 px, iPhone, tableta vertical y horizontal, portátil, monitor, 2K, tele 720p y tele 4K), con los 5 tamaños, en español e inglés y en todas las pestañas. / The «Aa» sizes now enlarge everything evenly and keep the layout right on every screen.
- Avisos de estado (Sol, 6 m · 2 m · 70 cm): la etiqueta «Desfavorable», «Informativo»… baja a otra línea en vez de salirse. / Status labels wrap instead of overflowing.

## 2.3.1 · 13/11/2026
- Móvil: la ficha que se abre al tocar algo en el mapa ya no queda por debajo de la barra de pestañas y tiene fondo opaco, sin que se transparente la página. / Mobile: the map sheet no longer hides under the tab bar.
- Avisos DX: filtros de modo (CW, SSB, FT8, FT4, RTTY, otros) y de banda, acumulativos como los del clúster, con el número de avisos de cada uno. Se recuerda lo que eliges. / DX alerts get cumulative mode and band filters.

## 2.3.0 · 13/11/2026
- La ISS en el mapa (botón «ISS» en «Qué ver», solo en la web): dónde está ahora y a qué altura, el círculo de la zona desde la que se la oye, el recorrido de la próxima hora y media (línea continua) y el de los últimos 45 minutos (punteado). Se actualiza cada 20 segundos y avisa cuando está sobre tu horizonte para escuchar 145,800 MHz. / The ISS on the map: position, footprint and ground track.
- «Hora a hora» mucho mejor explicado: una frase dice qué es cada casilla (qué parte de los destinos DX tienen al menos un 30 % de probabilidad en tu modo), rótulo para los tramos de banda recomendada, leyenda más clara con las casillas rayadas (tu antena no trabaja en esa banda) y la hora elegida, y un desplegable «Cómo se lee esta tabla». / The hour-by-hour chart is now clearly explained.

## 2.2.1 · 13/11/2026
- Ajustes de la previsión más sencillos: a la vista quedan solo el locator y el modo, que es lo que más cambia el resultado. Banda, potencia, antena, altitud y entorno pasan a «Tu estación (opcional)», un desplegable cerrado que enseña un resumen en una línea. Si no lo tocas, la previsión usa la estación del radioclub. / Simpler forecast settings: locator and mode up front, the rest under «Your station (optional)».

## 2.2.0 · 13/11/2026
- Modo tele de la sede: botón con una tele en la cabecera (en pantallas grandes) o la dirección terminada en #tele. Pasa sola por Resumen, Hora a hora, Mapa, Clúster, DXpediciones, 6 m · 2 m · 70 cm, Satélites y Sol, a pantalla completa, sin menús y con la pantalla siempre encendida. Si una vista es más larga que la pantalla, baja despacio para enseñarla entera. Al mover el ratón aparecen los controles: anterior, pausa, siguiente, tiempo por vista (20, 30, 45 o 60 s) y salir; también con las flechas, la barra espaciadora y Esc. / Club TV mode: cycles through the main views full screen, with controls on mouse move.
- Satélites de aficionado (DX › Satélites, solo en la web): próximos pasos sobre tu QTH en 24 h de la ISS, SO-50, AO-91, PO-101, RS-44, FO-29, AO-7 e IO-117, con hora de salida y puesta, altura máxima, rumbos, frecuencias de subida y bajada, tono y si ahora mismo está en el aire (con su rumbo y altura en directo). Órbitas de CelesTrak, guardadas 12 h. / Amateur satellites: next passes over your QTH with frequencies and live position.
- Línea gris común con cada destino: en la ficha de cada indicativo, en Fichas › destino y en las tarjetas de DXpediciones se ve cuándo tú y el otro estáis a la vez en la franja del amanecer o del anochecer en las próximas 24 h, la mejor ocasión para 160, 80 y 40 m. / Shared greyline with each destination, in call and destination sheets and DXpedition cards.
- Aviso de esporádica E (solo en la web): mira cada 5 minutos en PSK Reporter los contactos de 6 m de 700 a 2300 km (y cada 10 minutos los de 2 m) y, si varios de estaciones distintas pasan por la misma zona, avisa arriba en Ahora, dice dónde está la nube y hacia dónde te puede abrir desde tu QTH. / Sporadic E alert from PSK Reporter: where the cloud is and where it may open for you.
- En el móvil la cabecera ya no se sale por la derecha (también a 320 px de ancho). / The header no longer overflows on narrow phones.

## 2.1.22 · 13/11/2026
- KC2G ionosondas se revisa como las demás fuentes y sale con ✓ siempre que KC2G responda. Si en ese momento no hay ninguna ionosonda útil cerca, lo explica junto al ✓ (la más cercana con datos y de hace cuánto) y la previsión usa el eSSN de KC2G. Se vuelve a leer cada 2 minutos. / KC2G ionosondes shows ✓ whenever KC2G responds and explains when no nearby ionosonde is usable.

## 2.1.21 · 13/11/2026
- Banderas para las seis entidades DXCC que no tenían: sede de la ONU (4U1UN) y de la UIT (4U1ITU) con la bandera de la ONU, Orden de Malta (1A0), Spratly (sin bandera oficial: una neutra), arrecife Märket (Åland) e Irlanda del Norte (Reino Unido). Ahora las 340 entidades tienen bandera. / Flags for the six DXCC entities that had none; all 340 now have one.

## 2.1.20 · 13/11/2026
- Mapa: «Caminos» y «Saltos» se dibujan aunque «Predicción VOACAP» (los círculos) esté apagada; antes, con los círculos apagados no salía nada aunque esos botones estuvieran marcados. Comprobadas las 18 combinaciones (círculos sí/no, caminos, saltos, paso corto/largo/ambos). / Paths and hops now draw even with the VOACAP circles off.
- Si «Caminos» o «Saltos» están encendidos pero ningún destino llega al 15 % en esa banda y hora (por ejemplo en 2 m), el mapa lo dice en vez de quedarse sin nada. / The map explains when there is nothing to draw.

## 2.1.19 · 13/11/2026
- Mapa, «Saltos»: ahora se dibujan también con «Caminos» apagado (antes solo aparecían si los caminos estaban encendidos), en paso corto, largo y ambos. / Hops now show without paths.
- Mapa con todas las capas encendidas, sin amontonamientos ni parpadeos:
  - las etiquetas de spots, balizas y DXpediciones se colocan en el mismo momento del dibujo (antes se veían amontonadas un instante), prueban 8 sitios alrededor de su marca y repiten el de la última vez para no saltar; al cambiar la frecuencia de una baliza se recolocan;
  - los círculos VOACAP son más pequeños, y los que caen encima de uno más probable pasan a ser un punto (siguen ahí y se pueden tocar; al acercar recuperan su tamaño); los porcentajes que se pisan se ocultan;
  - caminos más finos y brillo solo en los 3 destinos mejores, para que no formen una mancha. / Map with every layer on: no pile-ups or flicker.
- Comprobado que cada control del mapa funciona: Nombres, Noche, Predicción VOACAP, Clúster, Balizas, DXpediciones, Caminos, Saltos, camino corto/largo/ambos, 15/40/todos los destinos, hora y zoom. / Every map control verified.

## 2.1.18 · 13/11/2026
- KC2G ionosondas: lectura más robusta de los datos (otros nombres de campo, descarta lecturas sin confianza), radio de búsqueda hasta 3000 km y datos de hasta 4 h. Si no hay ninguna ionosonda útil, dice cuál es la más cercana con datos, a qué distancia y de hace cuánto. La hora de la ionosonda se guarda en UTC (antes podía leerse con una hora de desfase). / More robust KC2G ionosonde reading and a clearer reason when none is usable.

## 2.1.17 · 13/11/2026
- Las etiquetas de modo (SSB, CW…) y las demás quedan siempre centradas con el texto que las rodea, también en el aviso DX y en las DXpediciones en el aire. Comprobado midiendo cada etiqueta de todas las páginas en ordenador y móvil. / Tags are always vertically centred with the surrounding text.

## 2.1.16 · 13/11/2026
- **Colores de banda nuevos, iguales en toda la plataforma y fáciles de distinguir**, ordenados como el espectro de la banda más baja a la más alta: 160 m rojo, 80 m naranja, 60 m ámbar, 40 m lima, 30 m verde, 20 m turquesa, 17 m celeste, 15 m añil, 12 m violeta, 10 m rosa, 6 m marrón, 2 m gris claro y 70 cm gris pizarra. En modo claro, los mismos tonos más oscuros para que se lean bien; al cambiar de modo se actualizan al momento. Antes había parejas que se confundían (160/60 m, 40/30 m, 20 m/2 m y 12/10 m). / New band colours, consistent everywhere and easy to tell apart.

## 2.1.15 · 13/11/2026
- Móvil y tableta: un poco más de espacio entre tarjetas en los listados verticales. / A little more space between stacked cards on phones and tablets.
- El modo de la predicción (por ejemplo SSB) ya no lleva una raya debajo: todos los botones marcados son iguales. Qué modo usa la predicción se sigue indicando en el texto y al pasar el ratón. / The prediction-mode button no longer has an underline.

## 2.1.14 · 13/11/2026
- **Tarjetas de estación por secciones** en toda la plataforma (clúster, POTA/SOTA/WWFF, actividad cercana, avisos DX, «¿Me oyen?» y objetivos del log): arriba el indicativo con bandera y país y la hora; debajo frecuencia, modo, banda y etiquetas; y después cada dato en su apartado con su título a la izquierda (Le oyen, Split / QSL, Rumbo, Distancia, Nota), todo alineado a la izquierda y con la misma letra. Cada estación que lo oye va entera, con su bandera. / Station cards with labelled sections across the platform.
- Comprobado en todos los tamaños de pantalla, del móvil de 360 px a la tele 4K y con «Aa» al 175 %: sin desbordes. / Checked on every screen size.

## 2.1.13 · 13/11/2026
- Tarjetas de spots ordenadas con un único borde izquierdo: arriba, frecuencia, modo, indicativo, bandera, país y hora en la misma línea (aunque el país pase a la siguiente); debajo, desde el borde, las etiquetas; después, quién lo oye (cada estación entera, sin partirse), split/QSL y rumbos. Los valores (rumbo, distancia, %) nunca se parten ni quedan sueltos al principio de una línea. / Spot cards neatly ordered with one left edge.
- Cada apartado (DX, POTA, SOTA, WWFF) iguala sus tarjetas por separado. / Each section equalises its own cards.
- Split: «QSX 7190» o «UP 14.195» se entienden como la frecuencia exacta en la que escucha («escucha en 7.190»), no como «+7190 kHz». / Split frequencies given as absolute values are shown correctly.
- Más separación entre la leyenda de modos y la primera tarjeta. / More space under the mode legend.
- Comprobado en móvil pequeño (360 px), iPhone, tableta vertical y horizontal, portátil, escritorio, 2K, TV 4K y TV con «Aa» al 175 %: sin desbordes ni desplazamiento lateral. / Checked on every screen size discussed.

## 2.1.12 · 12/11/2026
- Tarjetas del mismo tamaño: en las listas de varias columnas (clúster, POTA/SOTA/WWFF, actividad cercana, DXpediciones y objetivos) todas las tarjetas miden lo mismo; el contenido empieza siempre arriba y ocupa lo que necesite. En el móvil, con una sola columna, cada tarjeta mide lo justo. / Cards in multi-column lists all have the same size.
- Más separación entre la leyenda de colores de los modos y las tarjetas de las estaciones. / More space between the mode colour legend and the cards.

## 2.1.11 · 12/11/2026
- Todas las etiquetas pequeñas de colores (modo SSB/CW/FT8…, NUEVO, «en N clústeres», POTA/SOTA/WWFF, split, QSL, Most Wanted, «fonía sin confirmar») tienen la misma altura, letra, esquinas y alineación con el texto en toda la plataforma. / All small colour tags share the same size, font, corners and alignment.

## 2.1.10 · 12/11/2026
- Tarjetas de spots alineadas igual en toda la plataforma (clúster, POTA/SOTA/WWFF, actividad cercana y objetivos): arriba, la frecuencia con su modo, el indicativo con bandera y país, y la hora fija en la esquina derecha; debajo, alineadas con el indicativo, las etiquetas (NUEVO, en N clústeres, referencia del parque o cumbre); y a todo el ancho, quién lo oye, split/QSL, rumbos y probabilidad. Los nombres largos parten de línea sin pisar la hora. / Spot cards share one aligned layout across the platform.
- Actividad cercana: el modo va junto a la frecuencia, como en el clúster. / Nearby activity shows the mode next to the frequency.
- «ahora» en lugar de «hace 0 min». / "now" instead of "0 min ago".

## 2.1.9 · 12/11/2026
- Todos los indicativos salen con su bandera en toda la plataforma: también la estación del clúster en «Qué hacer», el multiplicador en modo concurso, las etiquetas de DXpediciones de las tablas y la lista de DXpediciones en las que te faltan bandas. / Every callsign shows its flag across the platform.
- «Qué hacer» ya no repite el nombre de la entidad («Mali (Mali)»); si la DXpedición indica algo más concreto, se añade solo eso, por ejemplo «Antártida (Schirmacher)». / The entity name is no longer repeated.

## 2.1.8 · 12/11/2026
- Todos los botones marcados tienen la misma intensidad en toda la plataforma, en modo claro y oscuro: las bandas del clúster sin spots ya no se ven más apagadas cuando están marcadas, las opciones de «Predicción» del mapa marcadas se ven igual aunque la capa VOACAP esté oculta (solo se atenúan las no marcadas) y las pestañas de «Tablas completas» usan el mismo estilo que el resto. / Every selected button has the same intensity across the platform in light and dark mode.
- Las versiones nuevas se ven al recargar: la web ya no usa la copia de 10 minutos que guarda el navegador. / New versions show up on reload: the browser's 10-minute copy is no longer used.

## 2.1.7 · 12/11/2026
- DXpediciones: tarjetas con proporciones uniformes. La estrella va siempre junto al indicativo, el nombre de la entidad usa la misma letra que el resto, el porcentaje es una etiqueta compacta arriba a la derecha (ya no se estira), «fonía sin confirmar» va en su propia línea y no quedan huecos dentro de la tarjeta. / DXpedition cards with consistent proportions.

## 2.1.6 · 12/11/2026
- Clúster: la barra de modos ya no sigue desplazándose hasta quedarse en blanco; termina en el último modo. / The cluster mode bar no longer scrolls into empty space.
- Las barras que se desplazan de lado (modos y bandas del clúster) se quedan donde las dejaste al pulsar un botón o al actualizarse cada minuto, en vez de volver al principio. / Side-scrolling bars keep their position when a button is pressed or the page updates.
- En todas las barras que se desplazan de lado (pestañas de la plataforma, modos, bandas y leyenda), el difuminado del borde solo aparece en el lado donde queda algo por ver: al llegar al final, el último botón se ve entero. / In every side-scrolling bar the edge fade only appears where there is more to see, so the last button is fully visible at the end.

## 2.1.5 · 12/11/2026
- **Clúster con filtros acumulativos** / **Cumulative cluster filters**: los botones DX, POTA, SOTA y WWFF y los de banda se pueden marcar a la vez, como las bandas del mapa (por ejemplo, POTA y SOTA en 40 y 20 m). «Todas» quita la selección de bandas y siempre queda al menos un tipo marcado. La selección se recuerda. / DX, POTA, SOTA, WWFF and band buttons can be combined, like the map bands; the selection is remembered.

## 2.1.4 · 12/11/2026
- **GFZ Potsdam**: el instituto se ha mudado de kp.gfz-potsdam.de a kp.gfz.de; la plataforma ya lee la dirección nueva. / GFZ moved to kp.gfz.de; the platform now reads the new address.
- **KC2G ionosondas**: se busca la ionosonda más cercana a tu locator (antes, a Alicante), hasta 2500 km. Si ninguna tiene datos de las últimas 3 horas, sale con «–» y el motivo, en vez de como fallo. / The nearest ionosonde to your locator is used (up to 2,500 km); if none has recent data it is shown as "–" instead of a failure.

## 2.1.3 · 12/11/2026
- **Intermediario de datos v2** (Cloudflare): más seguro (solo desde la web del club, solo las fuentes de la lista también tras redirecciones, tope de 8 MB y 12 s, sin cookies y sin páginas ejecutables) y con fuentes de reserva. / Data relay v2: safer and with fallback sources.
- **Fuentes de reserva** / **Fallback sources**: si el navegador no puede leer directamente NOAA, Spothole, HamQTH, WWFF, POTA, SOTA, WSPR.live, NASA o GIRO, la plataforma lo reintenta sola a través del intermediario del club y lo recuerda durante la sesión. Funciona con el intermediario nuevo; con el antiguo todo sigue igual que antes. / If the browser cannot read a source directly, the platform retries through the club relay automatically.

## 2.1.2 · 12/11/2026
- **Seguridad** / **Security**: política de seguridad de contenidos (CSP): la web solo ejecuta su propio código; un texto malicioso que llegue de un clúster, de una DXpedición o de un archivo ADIF no puede ejecutarse aunque se colara en la página. Probado con cargas maliciosas en todas las fuentes y campos (spots, comentarios, referencias, avisos, NG3K, ADIF, locator, indicativo y buscadores). / Content Security Policy: only the site's own code runs; tested with malicious payloads in every source and field.
- Los datos de fuera se leen con límites: como mucho 6 MB por fuente y 3000 spots por fuente; textos recortados; sin claves que puedan alterar los objetos de la página. / External data is read with limits (6 MB and 3,000 spots per source), trimmed texts and no object-altering keys.
- Las previsiones VOACAP de zona se comprueban antes de usarse (tamaño exacto e índice válido); si una descarga falla, se reintenta a los 20 s, sin bucles. / VOACAP area data is checked before use; failed downloads retry after 20 s, without loops.
- Lo guardado en el dispositivo tiene tope: las 6 últimas zonas VOACAP usadas y solo la versión actual del código. / Device storage is capped: last 6 VOACAP areas and only the current code version.
- Log ADIF: tamaño máximo de 150 MB y aviso si no cabe en la memoria del navegador. / ADIF log: 150 MB limit and a warning if it does not fit in browser storage.
- Probada una sesión larga (150 actualizaciones seguidas, como la tele de la sede): la memoria y el número de elementos de la página se mantienen estables. / Long-session test (150 consecutive updates): memory and page size stay stable.

## 2.1.1 · 12/11/2026
- **Más rápida** / **Faster**: la página que se descarga en cada visita pasa de 345 kB a 53 kB comprimidos; el código, el mapa del mundo y la tabla de prefijos van en archivos aparte que se guardan en el dispositivo y solo se vuelven a descargar cuando cambian. / The page downloaded on every visit goes from 345 kB to 53 kB compressed; code, world map and prefix table are cached on the device.
- La previsión VOACAP de tu zona se pide de una vez y aparece antes: en un móvil normal, de 4,8 s a 2,2 s; con 3G la primera vez, de 14 s a 11 s. / The VOACAP forecast for your area is requested in one go and appears sooner (mobile 4.8 s → 2.2 s; first visit on 3G 14 s → 11 s).
- Al arrancar se recalcula la página 3 veces en vez de 6, y la parte DX solo se calcula cuando se mira: menos bloqueos al desplazarte (tiempo bloqueado en móvil, de 1,9 s a 0,6 s). / Fewer recalculations at start-up and the DX part is only computed when visible (blocked time on mobile 1.9 s → 0.6 s).
- Lo guardado en el dispositivo no crece con cada actualización: las versiones viejas del código se borran solas. / Cached code no longer grows with each update.

## 2.1.0 · 12/11/2026
- **Clúster por bandas** / **Cluster band filter**: botones de banda dentro del propio clúster, con el número de spots de cada una. / Band buttons inside the cluster, with the number of spots on each.
- **POTA, SOTA y WWFF** / **POTA, SOTA and WWFF**: el clúster puede mostrar todos los activadores de parques, cumbres y reservas naturales del mundo de la última hora, con su referencia enlazada a la ficha oficial. Fuentes: POTA, SOTAwatch, WWFF Spots y Spothole. Sustituye al botón «Solo parques y cumbres». / The cluster can show every park, summit and nature-reserve activator worldwide in the last hour, with the reference linked to its official page.
- **Paso largo** / **Long path**: cada spot, activador y DXpedición muestra el rumbo de paso corto y el de paso largo en grados. / Every spot, activator and DXpedition shows both short-path and long-path bearings.
- **DXpediciones en el aire** / **DXpeditions on the air**: cada DXpedición activa dice dónde está operando: frecuencia, modo, banda, hace cuánto y si trabaja en split. Se leen todos los clústeres del mundo de las últimas 6 horas, no solo los europeos. / Each active DXpedition shows where it is operating: frequency, mode, band, how long ago and whether it is working split, from all clusters worldwide in the last 6 hours.
- **Modos con colores** / **Colour-coded modes**: en todas las listas de spots el modo va en una etiqueta de color: CW ámbar, voz azul, FT8 verde, FT4 turquesa, RTTY morado y otros digitales rosa, con leyenda en el clúster. / In every spot list the mode is a colour tag, with a legend in the cluster.
- En «Ajustes del mapa», el bloque «Mapa» (nombres, noche, zoom, encuadrar y pantalla completa) pasa a ser el primero; los demás se renumeran del 2 al 6. / In map settings, the "Map" block (labels, night, zoom, fit and full screen) now comes first.
- La leyenda de colores de los modos va en una sola línea, también en el móvil. / The mode colour legend fits on one line, also on phones.

## 2.0.0 · 12/11/2026
- **VOACAP para cualquier QTH del mundo** / **VOACAP for any QTH in the world**: la previsión ya no se calcula solo desde Alicante. Está calculada de antemano (voacapl, mismos ajustes de siempre) desde zonas repartidas por todo el mundo hacia los 266 destinos, los 12 meses, cada hora, en las 11 bandas y con 5 niveles de actividad solar. La web usa la zona más cercana a tu locator y sobre ella aplica, como siempre, tu antena, altura, potencia, modo y terreno. / The forecast is no longer calculated only from Alicante: it is precomputed from areas all over the world, and the nearest one to your locator is used, with your antenna, height, power, mode and ground applied on top as before.
- Solo se descarga lo que hace falta para tu zona (unos 250 kB por mes) y queda guardado en el dispositivo. / Only what your area needs is downloaded (about 250 kB per month) and it stays saved on the device.
- **Mucho más rápida, también con 3G** / **Much faster, also on 3G**: la página pasa de 3,3 MB a 0,85 MB (unos 340 kB comprimidos); bibliotecas, iconos y previsiones se guardan en el dispositivo y no se vuelven a descargar; el texto aparece antes de que llegue la tipografía; si la conexión tarda más de 4 s se abre la última copia guardada. / The page goes from 3.3 MB to 0.85 MB; libraries, icons and forecasts are cached on the device; text appears before the font arrives; if the connection takes more than 4 s the last saved copy opens.
- **Pantallas grandes y televisores** / **Large screens and TVs**: en 2K, 4K u 8K la página se amplía sola y ocupa todo el ancho; nuevo botón «Aa» junto al de modo claro/oscuro para agrandar todo al 125, 150, 175 o 200 % y verlo de lejos. / On 2K, 4K or 8K the page scales up and fills the width; new "Aa" button to enlarge everything to 125–200 % for viewing from a distance.
- **Mapa en modo oscuro más claro**: tierra, mar, fronteras y noche con más luz y contraste. / Brighter dark-mode map.
- **Etiquetas del mapa sin amontonarse**: los spots y DXpediciones buscan un hueco libre alrededor de su marca; si no cabe, se oculta el texto y la marca sigue ahí. / Map labels no longer pile up.
- Corrección: en la tabla del mapa, 2 m y 70 cm salían como «NaN»; ahora «—». / Fix: "NaN" in the map table for 2 m and 70 cm.
- Corrección: las horas de la previsión VOACAP coinciden exactamente con la hora UTC (antes iban una hora adelantadas). / Fix: VOACAP forecast hours now match UTC exactly (they were one hour ahead).

## 1.3.0 · 12/11/2026
- **English (US)**: the whole platform is available in American English at `en.html`. A round flag button next to the light/dark button switches language (Spain flag in Spanish, US flag in English) and the choice is remembered.
- Entity, region and map names in English; 24-hour times, US number format, compass points (SSW, WNW…) and dates in English.
- Ajuste: el locator y «Aplicar» a la misma altura en los ajustes de la estación.

## 1.2.1 · 12/11/2026
- «¿Me oyen?» busca también tu indicativo en los clústeres DX (HamQTH, DX Summit y los spots que ya lee la plataforma), además de Reverse Beacon, PSK Reporter y WSPRnet.
- Botón para probar con el indicativo del club, EA5RKB, sin cambiar el tuyo.

## 1.2.0 · 12/11/2026
- **Visor del log** (Países y log → Mi log): progreso de los diplomas DXCC, WAC y bandas-entidad; mapa del mundo con lo confirmado, lo trabajado y lo que falta; tablas por continente, banda y modo; lista de países con buscador y filtros (confirmados, sin confirmar, me faltan) y las bandas de cada uno.
- Al subir el ADIF se guarda también el modo de cada contacto y tu indicativo, que se rellena solo en «¿Me oyen?».

## 1.1.1 · 12/11/2026
- Carga mucho más rápida: la página pasa de 20 MB a 4 MB. Las previsiones VOACAP de los otros meses están en archivos aparte y solo se descargan cuando hacen falta.
- El apartado «Fichas» pasa a llamarse «Países y log».
- Botones del clúster a la misma altura.

## 1.1.0 · 12/11/2026
Novedades pensadas para concursantes, DXistas y QRP:
- **¿Me oyen?** (DX): escribe tu indicativo y verás quién te ha oído en la última hora (Reverse Beacon, PSK Reporter y WSPRnet), en qué banda, a cuántos km y con qué señal.
- **Split y QSL** en el clúster y en los avisos: «escucha +5 kHz», «QSL: LoTW, OQRS», «vía M0OXO», referencias POTA, SOTA, WWFF e IOTA.
- **Solo parques y cumbres**: filtro POTA/SOTA/WWFF en el clúster.
- **Notificaciones** en el dispositivo cuando aparece algo que te falta.
- **Concursos**: el intercambio que se pasa en cada uno.
- **QRP** (Fichas): frecuencias de actividad QRP y consejos.
- **Dispersión meteórica** (6 m, 2 m y 70 cm): próxima lluvia de meteoros y cómo aprovecharla.
- Modo claro: corregidos textos que salían en blanco sobre fondo claro.

## 1.0.1 · 12/11/2026
- Mi log: la caja de subida del ADIF, centrada y en líneas separadas; el botón ya no queda pegado al texto.

## 1.0.0 · 12/11/2026
Primera versión estable, para la presentación en la sede.
- Funciona sola en cualquier navegador; se actualiza cada minuto y con el botón Actualizar.
- 29 fuentes públicas y gratuitas, varias a través del intermediario propio en Cloudflare.
- Log ADIF (QRZ, LoTW, Club Log) guardado solo en el dispositivo, con botón «Subir log» en la cabecera.
- Modo claro y oscuro, icono para la pantalla de inicio de iPhone e iPad.
- Formato revisado en todas las secciones: frecuencias con 3 decimales, cifras y unidades sin partir, concursos y avisos alineados.
