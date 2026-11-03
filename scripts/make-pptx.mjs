import pptxgen from "pptxgenjs";

const prs = new pptxgen();

// ─── Theme ──────────────────────────────────────────────────────────────────
const BG    = "2a2a28";   // deep ink
const PARCH = "f4f0e8";   // parchment
const RUST  = "bb795c";   // rust accent
const GOLD  = "c3a267";   // gold accent
const SAGE  = "758d7c";   // sage green
const MUT   = "9a9790";   // muted

prs.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
prs.layout = "WIDE";

// ─── Reusable slide helpers ──────────────────────────────────────────────────
function bg(slide) {
  slide.background = { color: BG };
}
function headerBar(slide, tag, title) {
  slide.addText(tag, {
    x: 0.5, y: 0.38, w: 12, h: 0.25,
    fontSize: 8, bold: false, color: GOLD, charSpacing: 3,
    fontFace: "Arial",
  });
  slide.addText(title, {
    x: 0.5, y: 0.65, w: 9, h: 0.6,
    fontSize: 30, bold: true, color: PARCH,
    fontFace: "Georgia",
  });
  slide.addShape(prs.ShapeType.line, {
    x: 0.5, y: 1.35, w: 12.33, h: 0,
    line: { color: GOLD, width: 0.5 },
  });
}
function dot(slide, x, y, color) {
  slide.addShape(prs.ShapeType.ellipse, {
    x, y, w: 0.08, h: 0.08, fill: { color }, line: { color },
  });
}
function bullet(slide, x, y, w, text, color = PARCH) {
  dot(slide, x, y + 0.06, GOLD);
  slide.addText(text, {
    x: x + 0.18, y, w: w - 0.18, h: 0.35,
    fontSize: 12, color, fontFace: "Arial", valign: "top",
  });
}

// ─── Slide 1: Title ──────────────────────────────────────────────────────────
{
  const s = prs.addSlide();
  bg(s);
  // Decorative ring
  s.addShape(prs.ShapeType.ellipse, {
    x: 3.2, y: 0.3, w: 7, h: 7,
    fill: { type: "none" },
    line: { color: GOLD, width: 0.3, dashType: "dash" },
  });
  s.addShape(prs.ShapeType.ellipse, {
    x: 3.5, y: 0.6, w: 6.4, h: 6.4,
    fill: { type: "none" },
    line: { color: MUT, width: 0.15 },
  });
  s.addText("✳", {
    x: 5.6, y: 1.6, w: 2, h: 1,
    fontSize: 48, color: GOLD, align: "center", fontFace: "Arial",
  });
  s.addText("ATLAS ASTROLÓGICO", {
    x: 1.5, y: 2.7, w: 10.33, h: 1,
    fontSize: 40, bold: true, color: PARCH, align: "center",
    fontFace: "Georgia", charSpacing: 6,
  });
  s.addText("Guía de uso · Reloj de cielo en tiempo real", {
    x: 2, y: 3.8, w: 9.33, h: 0.5,
    fontSize: 16, color: GOLD, align: "center", fontFace: "Arial", italic: true,
  });
  s.addShape(prs.ShapeType.line, {
    x: 3.5, y: 4.5, w: 6.33, h: 0, line: { color: GOLD, width: 0.5 },
  });
  s.addText("astronomy-engine · Next.js · Tiempo real", {
    x: 2, y: 4.7, w: 9.33, h: 0.35,
    fontSize: 10, color: MUT, align: "center", fontFace: "Arial", charSpacing: 2,
  });
}

// ─── Slide 2: Qué es la app ───────────────────────────────────────────────────
{
  const s = prs.addSlide();
  bg(s);
  headerBar(s, "01 · CONCEPTO", "¿Qué es Atlas Astrológico?");

  s.addText("Una simulación visual del cielo en tu pantalla.", {
    x: 0.5, y: 1.55, w: 7.5, h: 0.4,
    fontSize: 14, color: GOLD, fontFace: "Georgia", italic: true,
  });

  const items = [
    "Muestra las posiciones planetarias geocéntricas tropicales del Sol, Luna y 8 planetas — calculadas al instante con Astronomy Engine.",
    "Detecta aspectos mayores (conjunción, sextil, cuadratura, trígono, oposición) con orbe ≤ 5° y los anima como líneas de energía.",
    "Calcula el Ascendente y Medio Cielo para el lugar que elijas, y los representa como manecillas de reloj.",
    "Muestra la fase lunar actual con un domo iluminado dentro del reloj.",
    "Proyecta una línea de tiempo de 3 años con tendencias de tensión, fluidez, intensidad y ciclo lunar.",
  ];
  items.forEach((t, i) => bullet(s, 0.5, 2.05 + i * 0.62, 8.2, t));

  // Right box
  s.addShape(prs.ShapeType.roundRect, {
    x: 9, y: 1.5, w: 3.8, h: 5.5,
    fill: { color: "1a1a18" }, line: { color: GOLD, width: 0.5 }, rectRadius: 0.1,
  });
  s.addText("NO es", {
    x: 9.2, y: 1.7, w: 3.4, h: 0.35,
    fontSize: 11, bold: true, color: RUST, fontFace: "Arial", charSpacing: 2,
  });
  const noItems = [
    "Un horóscopo personal",
    "Una predicción del futuro",
    "Un sistema de casas",
    "Una carta natal",
    "Topocéntrico (usa geocéntrico)",
  ];
  noItems.forEach((t, i) => bullet(s, 9.2, 2.15 + i * 0.62, 3.4, t, MUT));
}

// ─── Slide 3: El Reloj ────────────────────────────────────────────────────────
{
  const s = prs.addSlide();
  bg(s);
  headerBar(s, "02 · INTERFAZ", "El Reloj Astrológico");

  const parts = [
    ["Cinturón del zodiaco", GOLD, "12 signos en la corona exterior (♈ → ♓). Las divisiones de 30° marcan cada signo."],
    ["Puntos planetarios", RUST, "Cada planeta = un punto en su longitud eclíptica. A mayor tamaño, más estacionario (lento)."],
    ["Símbolo del planeta", RUST, "En dorado con ℞ = retrógrado. El planeta aparece más tenue al moverse hacia atrás."],
    ["Manecilla ASC (sólida)", RUST, "Línea fija al horizonte Este del lugar seleccionado. Avanza con la rotación terrestre."],
    ["Manecilla MC (punteada)", GOLD, "Línea dorada punteada: el meridiano local (Medio Cielo)."],
    ["Líneas de aspecto", SAGE, "Animadas: rust = tensión, sage = fluidez, dorado = conjunción. Se mueven al pulsar el tiempo."],
    ["Complicación lunar", MUT, "Mini disco en la parte superior del cuadrante: muestra la fase lunar actual e iluminación %."],
    ["Subdial central", MUT, "Muestra la hora local (HH:MM) y la fecha del momento calculado."],
  ];
  parts.forEach(([label, color, desc], i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = col === 0 ? 0.5 : 6.7;
    const y = 1.55 + row * 1.1;
    s.addText(label, {
      x, y, w: 5.8, h: 0.28,
      fontSize: 10, bold: true, color: color, fontFace: "Arial", charSpacing: 1.5,
    });
    s.addText(desc, {
      x, y: y + 0.28, w: 5.8, h: 0.65,
      fontSize: 10, color: MUT, fontFace: "Arial",
    });
  });
}

// ─── Slide 4: Controles ───────────────────────────────────────────────────────
{
  const s = prs.addSlide();
  bg(s);
  headerBar(s, "03 · CONTROLES", "Cómo manejar el tiempo");

  const modes = [
    { icon: "▶", title: "Tiempo real  ×1", desc: "El reloj avanza un segundo cada segundo — exactamente como el cielo. Activo al cargar la app.", color: SAGE },
    { icon: "⏩", title: "Time-lapse  ×3600", desc: "Cada segundo en pantalla = 1 hora en el cielo. Útil para ver cómo el ASC/MC y los planetas se mueven a lo largo del día.", color: GOLD },
    { icon: "✎", title: "Manual", desc: "Escribe o selecciona cualquier fecha/hora. El modo se activa automáticamente al modificar el campo de fecha.", color: RUST },
  ];
  modes.forEach((m, i) => {
    const x = 0.5 + i * 4.1;
    s.addShape(prs.ShapeType.roundRect, {
      x, y: 1.5, w: 3.8, h: 4.5,
      fill: { color: "1a1a18" }, line: { color: m.color, width: 0.8 }, rectRadius: 0.12,
    });
    s.addText(m.icon, {
      x: x + 0.2, y: 1.7, w: 3.4, h: 0.7,
      fontSize: 32, color: m.color, align: "center", fontFace: "Arial",
    });
    s.addText(m.title, {
      x: x + 0.2, y: 2.5, w: 3.4, h: 0.4,
      fontSize: 13, bold: true, color: PARCH, align: "center", fontFace: "Georgia",
    });
    s.addText(m.desc, {
      x: x + 0.25, y: 3.05, w: 3.3, h: 2.6,
      fontSize: 11, color: MUT, fontFace: "Arial", valign: "top",
    });
  });

  s.addText("Consejo: presiona ⏩ y luego ▶ para regresar al presente instantáneamente.", {
    x: 0.5, y: 6.15, w: 12.33, h: 0.3,
    fontSize: 10, color: GOLD, italic: true, fontFace: "Arial",
  });
}

// ─── Slide 5: Cambiar ciudad ──────────────────────────────────────────────────
{
  const s = prs.addSlide();
  bg(s);
  headerBar(s, "04 · UBICACIÓN", "Cambiar de ciudad");

  s.addText("El menú desplegable en la barra superior cambia el lugar de observación.", {
    x: 0.5, y: 1.6, w: 9, h: 0.4,
    fontSize: 13, color: PARCH, fontFace: "Georgia",
  });

  const cities = [
    ["Hermosillo", "29.07° N  110.96° O", "Hora de Sonora (UTC-7 fijo)"],
    ["Ciudad de México", "19.43° N  99.13° O", "Centro del país, CDMX"],
    ["Madrid", "40.42° N  3.70° O", "Europa Central"],
    ["Tokio", "35.68° N  139.65° E", "Asia Oriental"],
  ];
  cities.forEach(([city, coord, note], i) => {
    const x = (i % 2) * 6.3 + 0.5;
    const y = Math.floor(i / 2) * 2.2 + 2.15;
    s.addShape(prs.ShapeType.roundRect, {
      x, y, w: 5.8, h: 1.85,
      fill: { color: "1a1a18" }, line: { color: MUT, width: 0.5 }, rectRadius: 0.08,
    });
    s.addText(city, {
      x: x + 0.2, y: y + 0.2, w: 5.4, h: 0.4,
      fontSize: 14, bold: true, color: PARCH, fontFace: "Georgia",
    });
    s.addText(coord, {
      x: x + 0.2, y: y + 0.65, w: 5.4, h: 0.3,
      fontSize: 11, color: GOLD, fontFace: "Arial",
    });
    s.addText(note, {
      x: x + 0.2, y: y + 1.0, w: 5.4, h: 0.3,
      fontSize: 10, color: MUT, fontFace: "Arial",
    });
  });

  s.addText("¿Por qué cambian ASC y MC al cambiar ciudad?", {
    x: 0.5, y: 6.2, w: 7, h: 0.28,
    fontSize: 10, bold: true, color: GOLD, fontFace: "Arial",
  });
  s.addText("Porque el Ascendente depende del horizonte local y el Medio Cielo del meridiano local. Los planetas no cambian — son geocéntricos.", {
    x: 0.5, y: 6.52, w: 12.33, h: 0.3,
    fontSize: 10, color: MUT, fontFace: "Arial",
  });
}

// ─── Slide 6: Línea de tiempo ─────────────────────────────────────────────────
{
  const s = prs.addSlide();
  bg(s);
  headerBar(s, "05 · LÍNEA DE TIEMPO", "3 años de cielo en una vista");

  s.addText("Desplázate hacia abajo en la app para ver el gráfico que se extiende desde hoy hasta 3 años al futuro.", {
    x: 0.5, y: 1.6, w: 12, h: 0.4,
    fontSize: 12, color: PARCH, fontFace: "Georgia",
  });

  const lines = [
    [RUST, "Tensión", "Cantidad de aspectos de tensión (cuadraturas y oposiciones) activos. Picos = momentos de fricción o urgencia."],
    [SAGE, "Fluidez", "Aspectos de fluidez (sextiles y trígonos). Picos = períodos de flujo, creatividad y acuerdo."],
    [GOLD, "Conjunciones", "Planetas en conjunción ≤ 5°. Alta concentración = energías fusionadas o enfocadas en un punto."],
    ["aaaaaa", "Fase lunar (ola fina)", "Oscila entre Luna Nueva (0) y Luna Llena (máximo). Ciclo de ~29.5 días visible como ola rápida."],
    ["888888", "Intensidad", "Peso acumulado de todos los aspectos activos (orbes más cerrados = mayor intensidad). Línea punteada."],
  ];
  lines.forEach(([color, label, desc], i) => {
    s.addShape(prs.ShapeType.line, {
      x: 0.5, y: 2.3 + i * 0.85 + 0.14, w: 0.5, h: 0,
      line: { color, width: 2 },
    });
    s.addText(label, {
      x: 1.15, y: 2.3 + i * 0.85, w: 2.5, h: 0.32,
      fontSize: 11, bold: true, color: PARCH, fontFace: "Arial",
    });
    s.addText(desc, {
      x: 1.15, y: 2.62 + i * 0.85, w: 11, h: 0.32,
      fontSize: 10, color: MUT, fontFace: "Arial",
    });
  });

  const special = [
    ["Bandas coloreadas (fondo)", "Períodos de retrogradación: dorado = Mercurio, verde = Venus, rust = Marte."],
    ["☀ / ☽ línea vertical", "Eclipse solar (☀ dorado) o lunar (☽ sage) en esa fecha."],
    ["♃ ♄ marcadores pequeños", "Ingreso de Júpiter, Saturno u otro planeta exterior a un nuevo signo."],
  ];
  special.forEach(([label, desc], i) => {
    const y = 6.55 + i * 0.0 - i * 0.0;
    s.addText(`${label} — ${desc}`, {
      x: 0.5, y: 6.0 + i * 0.35, w: 12.33, h: 0.3,
      fontSize: 9.5, color: MUT, fontFace: "Arial",
    });
  });
}

// ─── Slide 7: Indicadores (qué se calcula) ────────────────────────────────────
{
  const s = prs.addSlide();
  bg(s);
  headerBar(s, "06 · CÁLCULOS", "Qué indicadores se calculan");

  const indicators = [
    { n: "Longitud eclíptica", t: "Para cada planeta (geocéntrico tropical)", d: "Posición en el zodiaco. Se obtiene con Astronomy Engine calculando el vector geocéntrico y convirtiéndolo a coordenadas eclípticas.", c: PARCH },
    { n: "Velocidad + Retrogradación", t: "Grados/día por diferencia de 24 h", d: "Se comparan las posiciones del planeta 12 h antes y 12 h después. Si la diferencia es negativa, el planeta retrograda.", c: GOLD },
    { n: "Aspectos", t: "Ángulos de separación con orbe ≤ 5°", d: "Conjunción 0°, Sextil 60°, Cuadratura 90°, Trígono 120°, Oposición 180°. Clasificados en tensión, fluidez o concentración.", c: RUST },
    { n: "Ascendente / Medio Cielo", t: "Aproximación por tiempo sidéreo local", d: "Usando el tiempo sidéreo de Greenwich (Astronomy Engine) ajustado por longitud geográfica y latitud.", c: SAGE },
    { n: "Fase lunar", t: "0° = Luna Nueva · 180° = Luna Llena", d: "Astronomy.MoonPhase() devuelve el ángulo de elongación de la Luna respecto al Sol. Se muestra como domo iluminado.", c: GOLD },
    { n: "Eclipses", t: "Solar y lunar en ventana de 3 años", d: "Se detectan con SearchLunarEclipse / SearchGlobalSolarEclipse. Solo se muestran eclipses parciales y totales (no penumbrales).", c: RUST },
  ];
  indicators.forEach((item, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i < 3 ? i : i - 3;
    const x = col * 6.4 + 0.5;
    const y = 1.55 + row * 1.68;
    s.addText(item.n, {
      x, y, w: 6, h: 0.32,
      fontSize: 11, bold: true, color: item.c, fontFace: "Arial",
    });
    s.addText(item.t, {
      x, y: y + 0.32, w: 6, h: 0.26,
      fontSize: 9, color: GOLD, fontFace: "Arial", italic: true,
    });
    s.addText(item.d, {
      x, y: y + 0.58, w: 6, h: 0.85,
      fontSize: 9.5, color: MUT, fontFace: "Arial",
    });
  });
}

// ─── Slide 8: Límites ─────────────────────────────────────────────────────────
{
  const s = prs.addSlide();
  bg(s);
  headerBar(s, "07 · LIMITACIONES", "Lo que esta prueba NO hace");

  s.addText("Atlas Astrológico es una prueba de concepto educativa, no un programa de astrología completo.", {
    x: 0.5, y: 1.55, w: 12, h: 0.4,
    fontSize: 12, color: PARCH, italic: true, fontFace: "Georgia",
  });

  const limits = [
    ["Sin casas astrológicas", "No se calculan Placidus, Koch ni ningún otro sistema de casas. El ASC/MC son orientativos."],
    ["Sin carta natal personal", "No hay input de nacimiento. Todo se calcula para el momento seleccionado, no para una persona."],
    ["ASC/MC aproximados", "Se usa la fórmula de tiempo sidéreo simple (oblicuidad fija 23.44°). Para resultados precisos se requeriría corrección de nutación y ecuación del tiempo."],
    ["Sin astrocartografía", "No proyecta posiciones planetarias sobre un mapa geográfico."],
    ["Rango válido 1900–2100", "Astronomy Engine pierde precisión fuera de este rango. La app rechaza fechas fuera de él."],
    ["Sin orbes personalizados", "El orbe está fijo en 5° para todos los aspectos. No refleja sistemas de orbes tradicionales por planeta o luminar."],
    ["Timeline sin geocaching", "Cada carga calcula 3 años en tiempo real (365 muestras a 3-día paso). Puede tardar 1-3 seg en responder."],
    ["Solo aspecto geocéntrico", "Los aspectos se calculan desde el centro de la Tierra. Los aspectos topocentricos (desde superficie) son diferentes para la Luna.", ],
  ];
  limits.forEach(([title, desc], i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    bullet(s, col * 6.4 + 0.5, 2.2 + row * 1.1, 6, `${title}: ${desc}`, MUT);
  });
}

// ─── Slide 9: Próximos pasos ───────────────────────────────────────────────────
{
  const s = prs.addSlide();
  bg(s);
  headerBar(s, "08 · FUTURO", "Ideas para expandir la app");

  const ideas = [
    { icon: "🏠", title: "Sistemas de casas", desc: "Implementar Placidus o Koch para una carta astrológica completa." },
    { icon: "🗺", title: "Astrocartografía", desc: "Proyectar las líneas ASC/MC/IC/DC de cada planeta sobre un mapa mundi." },
    { icon: "👤", title: "Carta natal", desc: "Permitir ingresar fecha de nacimiento y superponer planetas natales vs. tránsitos." },
    { icon: "🌐", title: "Heliocentrismo", desc: "Opción para ver las posiciones desde el Sol (para correlaciones con física orbital)." },
    { icon: "📐", title: "Aspectos menores", desc: "Quintiles (72°), quincunces (150°), semisextiles (30°), etc." },
    { icon: "🔔", title: "Alertas de aspectos", desc: "Notificaciones cuando un aspecto exacto se forma o rompe el orbe." },
  ];
  ideas.forEach((idea, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = col * 4.1 + 0.5;
    const y = row * 2.5 + 1.55;
    s.addShape(prs.ShapeType.roundRect, {
      x, y, w: 3.8, h: 2.2,
      fill: { color: "1a1a18" }, line: { color: MUT, width: 0.4 }, rectRadius: 0.1,
    });
    s.addText(idea.icon, {
      x, y: y + 0.2, w: 3.8, h: 0.5,
      fontSize: 22, align: "center", fontFace: "Arial",
    });
    s.addText(idea.title, {
      x: x + 0.2, y: y + 0.75, w: 3.4, h: 0.35,
      fontSize: 12, bold: true, color: GOLD, fontFace: "Arial",
    });
    s.addText(idea.desc, {
      x: x + 0.2, y: y + 1.15, w: 3.4, h: 0.85,
      fontSize: 10, color: MUT, fontFace: "Arial",
    });
  });
}

// ─── Slide 10: Cierre ──────────────────────────────────────────────────────────
{
  const s = prs.addSlide();
  bg(s);
  s.addShape(prs.ShapeType.ellipse, {
    x: 3.2, y: 0.3, w: 7, h: 7,
    fill: { type: "none" }, line: { color: GOLD, width: 0.3, dashType: "dash" },
  });
  s.addText("✳", {
    x: 5.6, y: 1.4, w: 2, h: 1,
    fontSize: 48, color: GOLD, align: "center", fontFace: "Arial",
  });
  s.addText("El cielo siempre está en movimiento.", {
    x: 1.5, y: 2.6, w: 10.33, h: 0.8,
    fontSize: 28, bold: true, color: PARCH, align: "center",
    fontFace: "Georgia", italic: true,
  });
  s.addText("Esta app es una ventana — no una verdad absoluta.", {
    x: 2, y: 3.5, w: 9.33, h: 0.5,
    fontSize: 16, color: GOLD, align: "center", fontFace: "Arial", italic: true,
  });
  s.addShape(prs.ShapeType.line, {
    x: 3.5, y: 4.2, w: 6.33, h: 0, line: { color: GOLD, width: 0.5 },
  });
  s.addText("atlas-astrologico · Astronomy Engine · Next.js · open source", {
    x: 2, y: 4.5, w: 9.33, h: 0.35,
    fontSize: 10, color: MUT, align: "center", fontFace: "Arial", charSpacing: 1.5,
  });
}

// ─── Export ───────────────────────────────────────────────────────────────────
await prs.writeFile({ fileName: "Atlas-Astrologico.pptx" });
console.log("✓ Atlas-Astrologico.pptx generado");
