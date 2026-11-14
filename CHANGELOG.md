# ACRACB · Plataforma DX · Historial de versiones

Numeración MAYOR.MENOR.PARCHE:
- **MAYOR** (2.0.0): cambio grande de la plataforma (por ejemplo, acceso solo para socios o nuevo alojamiento).
- **MENOR** (1.1.0): una función nueva o una sección nueva.
- **PARCHE** (1.0.1): correcciones, ajustes de formato, de seguridad o de fuentes de datos.

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
