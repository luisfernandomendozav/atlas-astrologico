export type Concept = {
  id: string;
  symbol: string;
  title: string;
  group: string;
  body: string[];
  related?: string[];
};

export const CONCEPT_GROUPS = ["Líneas de la gráfica", "Eventos", "Retrógrados", "Planetas"];

export const GLOSSARY: Concept[] = [
  // ── Líneas de la gráfica ──────────────────────────────────────────────────
  {
    id: "tension", symbol: "⚡", title: "Tensión", group: "Líneas de la gráfica",
    body: [
      "La línea terracota cuenta, día por día, cuántas cuadraturas (90°) y oposiciones (180°) hay activas entre los 10 cuerpos del sistema solar, con un orbe de hasta 5°.",
      "En astrología estos son los 'aspectos duros'. La cuadratura representa fricción que exige acción: dos planetas en propósitos cruzados que obligan a resolver algo. La oposición enfrenta dos polos — relaciones, proyectos o fuerzas internas que piden integración en lugar de elegir un extremo.",
      "Un pico en esta línea señala días en que muchos ángulos duros coinciden: en la lectura tradicional, periodos de presión, urgencia y cambio forzado. No es una medición física — es el conteo geométrico de una convención interpretativa.",
    ],
    related: ["fluidez", "conjunciones"],
  },
  {
    id: "fluidez", symbol: "〜", title: "Fluidez", group: "Líneas de la gráfica",
    body: [
      "La línea verde salvia cuenta los trígonos (120°) y sextiles (60°) activos cada día — los llamados 'aspectos armónicos'.",
      "El trígono es considerado el aspecto más favorable: la energía de dos planetas fluye sin esfuerzo, como talento natural. El sextil es una oportunidad que requiere iniciativa — la puerta está abierta pero hay que cruzarla.",
      "Picos de fluidez se leen como ventanas para crear, colaborar y expandir. Días con fluidez alta y tensión baja serían, en esta tradición, los más 'fáciles' del calendario.",
    ],
    related: ["tension", "conjunciones"],
  },
  {
    id: "conjunciones", symbol: "☌", title: "Conjunciones", group: "Líneas de la gráfica",
    body: [
      "La línea dorada cuenta las conjunciones: dos planetas en el mismo grado del zodiaco (0° de separación, orbe ≤ 5°). Es el aspecto más potente y el más ambiguo.",
      "En una conjunción los arquetipos se fusionan: Venus–Júpiter se lee como abundancia y celebración; Marte–Saturno como freno y frustración; Sol–Mercurio como claridad mental. El resultado depende por completo de qué planetas se encuentran.",
      "Las conjunciones de planetas lentos marcan épocas: la Gran Conjunción Júpiter–Saturno de diciembre 2020 (cada 20 años) o Saturno–Neptuno en 2026 son los hitos generacionales de esta década.",
    ],
    related: ["tension", "fluidez", "saturno", "jupiter"],
  },
  // ── Eventos ───────────────────────────────────────────────────────────────
  {
    id: "eclipse-solar", symbol: "☀", title: "Eclipse solar", group: "Eventos",
    body: [
      "Un eclipse solar es una Luna Nueva exacta: la Luna se interpone entre la Tierra y el Sol, cerca de los nodos lunares. En la gráfica aparecen como rombos dorados.",
      "La tradición astrológica los lee como portales de inicio acelerado: lo que comienza en la ventana de ±2 semanas alrededor de un eclipse solar tendría consecuencias duraderas, a menudo con un giro inesperado del destino.",
      "Ocurren de 2 a 5 veces al año en pares con los lunares. Los astrólogos los consideran 'Lunas Nuevas con esteroides' — siembras cuyo fruto se revela meses después.",
    ],
    related: ["eclipse-lunar", "luna"],
  },
  {
    id: "eclipse-lunar", symbol: "☽", title: "Eclipse lunar", group: "Eventos",
    body: [
      "Un eclipse lunar es una Luna Llena exacta: la Tierra proyecta su sombra sobre la Luna. En la gráfica aparecen como rombos verdes.",
      "Si el eclipse solar siembra, el lunar cosecha y cierra: culminaciones emocionales, finales de ciclo, verdades que salen a la luz. Lo que debe terminar, termina — a veces de forma abrupta.",
      "Siempre ocurre unas dos semanas antes o después de un eclipse solar, formando una 'temporada de eclipses' que la tradición trata como periodo de cambios acelerados.",
    ],
    related: ["eclipse-solar", "luna"],
  },
  // ── Retrógrados ───────────────────────────────────────────────────────────
  {
    id: "retrogrado", symbol: "℞", title: "¿Qué es un retrógrado?", group: "Retrógrados",
    body: [
      "Ningún planeta retrocede realmente: la retrogradación es una ilusión óptica. Cuando la Tierra 'rebasa' a otro planeta en su órbita (o es rebasada), ese planeta parece moverse hacia atrás contra las estrellas durante semanas o meses.",
      "La astrología interpreta ese movimiento aparente como energía que se invierte hacia adentro: todo lo que el planeta rige pasa de expresarse hacia afuera a revisarse por dentro. Son periodos de re-: revisar, repetir, reparar, reconsiderar.",
      "En la gráfica, las bandas verticales de color marcan los periodos retrógrados de cada planeta. Actívalas o desactívalas desde la leyenda del gráfico.",
    ],
    related: ["rx-mercurio", "rx-venus", "rx-marte"],
  },
  {
    id: "rx-mercurio", symbol: "☿℞", title: "Mercurio retrógrado", group: "Retrógrados",
    body: [
      "El retrógrado más famoso de la cultura popular. Ocurre 3–4 veces al año, unas 3 semanas cada vez (~18% del tiempo total) — las bandas doradas de la gráfica.",
      "Mercurio rige comunicación, contratos, tecnología y viajes. Durante su retrógrado la tradición desaconseja firmar acuerdos importantes, lanzar proyectos o comprar electrónica, y anticipa malentendidos, retrasos y fallas técnicas.",
      "El consejo clásico no es detenerse sino cambiar de modo: revisar en lugar de lanzar, reconectar con personas del pasado, respaldar los archivos. Como está retrógrado casi una quinta parte del año, atribuirle cualquier contratiempo es estadísticamente fácil — y esa es precisamente la crítica escéptica.",
    ],
    related: ["retrogrado", "mercurio"],
  },
  {
    id: "rx-venus", symbol: "♀℞", title: "Venus retrógrado", group: "Retrógrados",
    body: [
      "Ocurre solo cada 18 meses, unos 40 días — el retrógrado más raro de los planetas personales. Bandas verde salvia en la gráfica.",
      "Venus rige el amor, los valores, el dinero y la estética. Su retrógrado se lee como revisión del corazón: regresan exparejas, se reevalúan relaciones y se cuestiona qué (y a quién) valoramos.",
      "La tradición desaconseja bodas, compromisos nuevos y cambios drásticos de imagen durante estos periodos — lo que se inicia bajo Venus retrógrado estaría teñido de nostalgia o revisión pendiente.",
    ],
    related: ["retrogrado", "venus"],
  },
  {
    id: "rx-marte", symbol: "♂℞", title: "Marte retrógrado", group: "Retrógrados",
    body: [
      "Ocurre cada ~26 meses, unas 10 semanas — bandas terracota en la gráfica.",
      "Marte rige la acción, el deseo y la agresión. Retrógrado, esa energía se vuelve hacia adentro: la ira se reprime o estalla de formas indirectas, los proyectos pierden impulso, la confrontación directa tiende a salir mal.",
      "Se considera buen periodo para estrategia y mal periodo para ataque: planear la batalla en lugar de librarla. Iniciar guerras, demandas o competencias bajo Marte retrógrado es, en la tradición, empezar con el pie izquierdo.",
    ],
    related: ["retrogrado", "marte"],
  },
  {
    id: "rx-jupiter", symbol: "♃℞", title: "Júpiter retrógrado", group: "Retrógrados",
    body: [
      "Ocurre cada año durante ~4 meses. Por su frecuencia y duración, su efecto se considera mucho más suave que el de los planetas personales.",
      "Júpiter rige la expansión, la fortuna y las creencias. Retrógrado, el crecimiento se vuelve interior: revisar la filosofía propia, digerir lo aprendido, crecer hacia adentro antes de volver a expandirse.",
      "Actívalo en la leyenda de la gráfica para ver sus bandas — notarás que cubre casi un tercio de cada año, razón por la que viene apagado por defecto.",
    ],
    related: ["retrogrado", "jupiter"],
  },
  {
    id: "rx-saturno", symbol: "♄℞", title: "Saturno retrógrado", group: "Retrógrados",
    body: [
      "Ocurre cada año durante ~4.5 meses. Como el de Júpiter, es tan frecuente que se considera un ritmo de fondo más que un evento.",
      "Saturno rige la estructura, los límites y la responsabilidad. Retrógrado, la tradición habla de auditoría kármica: los compromisos mal construidos crujen, las deudas (literales y simbólicas) llaman a rendir cuentas.",
      "Es periodo de reforzar cimientos, no de construir pisos nuevos. Disponible en la leyenda de la gráfica, apagado por defecto.",
    ],
    related: ["retrogrado", "saturno"],
  },
  // ── Planetas ──────────────────────────────────────────────────────────────
  {
    id: "sol", symbol: "☉", title: "Sol", group: "Planetas",
    body: [
      "El centro del sistema y de la carta: identidad, vitalidad, propósito consciente. Recorre un signo por mes, definiendo el 'signo zodiacal' popular.",
      "En los conteos de aspectos de la gráfica, el Sol participa como cualquier otro cuerpo: sus cuadraturas y conjunciones con planetas lentos marcan los días de mayor carga simbólica del año para la tradición.",
    ],
    related: ["luna", "conjunciones"],
  },
  {
    id: "luna", symbol: "☾", title: "Luna", group: "Planetas",
    body: [
      "El cuerpo más rápido: recorre todo el zodiaco en 29.5 días. Rige las emociones, el instinto, la memoria y lo doméstico.",
      "Su ciclo de fases estructura el calendario astrológico: Luna Nueva para sembrar intenciones, Creciente para actuar, Llena para culminar y cosechar, Menguante para soltar y cerrar.",
      "Por su velocidad genera la mayoría de los aspectos de corta duración — gran parte del 'ruido' diario en las líneas de tensión y fluidez viene de la Luna.",
    ],
    related: ["eclipse-solar", "eclipse-lunar"],
  },
  {
    id: "mercurio", symbol: "☿", title: "Mercurio", group: "Planetas",
    body: [
      "El mensajero: mente, lenguaje, comercio, tecnología, viajes cortos. Nunca se aleja más de 28° del Sol.",
      "Rige cómo pensamos y comunicamos. En aspectos tensos se lee como discusiones, malentendidos y fallas técnicas; en aspectos fluidos, claridad, acuerdos y buenas noticias.",
    ],
    related: ["rx-mercurio"],
  },
  {
    id: "venus", symbol: "♀", title: "Venus", group: "Planetas",
    body: [
      "El planeta del amor, el placer, la belleza y el dinero. Rige tanto las relaciones como los valores — qué nos atrae y qué estamos dispuestos a pagar por ello.",
      "En la lectura mundana (de eventos globales), Venus se asocia con mercados, moda, diplomacia y tratados — las noticias económicas y los acuerdos de paz son su territorio.",
    ],
    related: ["rx-venus"],
  },
  {
    id: "marte", symbol: "♂", title: "Marte", group: "Planetas",
    body: [
      "El guerrero: acción, deseo, coraje, conflicto. Tarda unos 2 años en recorrer el zodiaco.",
      "En astrología mundana rige guerras, atentados, accidentes y confrontaciones — las noticias de política y conflicto de esta página son, en la tradición, asunto de Marte. Sus cuadraturas con Saturno o Plutón se consideran las firmas clásicas de violencia estructural.",
    ],
    related: ["rx-marte", "tension"],
  },
  {
    id: "jupiter", symbol: "♃", title: "Júpiter", group: "Planetas",
    body: [
      "El gran benéfico: expansión, fortuna, filosofía, derecho. Pasa ~1 año en cada signo, completando el zodiaco en 12.",
      "En lo mundano rige la banca, la religión organizada, las universidades y el optimismo de los mercados. Sus conjunciones con Saturno cada 20 años ('Grandes Conjunciones') históricamente se usaron para fechar cambios de era.",
    ],
    related: ["rx-jupiter", "conjunciones"],
  },
  {
    id: "saturno", symbol: "♄", title: "Saturno", group: "Planetas",
    body: [
      "El maestro severo: estructura, límites, tiempo, disciplina. Pasa ~2.5 años en cada signo (ciclo completo: 29.5 años — el famoso 'retorno de Saturno' a los ~29 y ~58 años de edad).",
      "En lo mundano rige gobiernos, instituciones, crisis económicas y todo lo que restringe: cuarentenas, fronteras, recesiones. La conjunción Saturno–Plutón de enero 2020 es el ejemplo favorito de los astrólogos de esta década.",
    ],
    related: ["rx-saturno", "conjunciones"],
  },
  {
    id: "urano", symbol: "♅", title: "Urano", group: "Planetas",
    body: [
      "El revolucionario: ruptura, innovación, lo inesperado. Pasa ~7 años en cada signo — sus efectos se leen por generaciones, no por individuos.",
      "En lo mundano rige revoluciones, tecnología disruptiva, terremotos (literales y figurados) y movimientos de liberación. Las noticias de ciencia y las revueltas políticas llevan, en esta tradición, su firma.",
    ],
    related: ["neptuno", "pluton"],
  },
  {
    id: "neptuno", symbol: "♆", title: "Neptuno", group: "Planetas",
    body: [
      "El místico: sueños, ilusión, espiritualidad, disolución. Pasa ~14 años en cada signo.",
      "En lo mundano rige epidemias, petróleo y químicos, el cine, las estafas colectivas y los fervores religiosos o ideológicos. Su paso de Piscis a Aries en 2025–2026 es uno de los ingresos más comentados de la década.",
    ],
    related: ["urano", "pluton"],
  },
  {
    id: "pluton", symbol: "♇", title: "Plutón", group: "Planetas",
    body: [
      "El transformador: poder, muerte y renacimiento, lo oculto. Tarda ~248 años en recorrer el zodiaco — hasta 20 años por signo.",
      "En lo mundano rige las deudas y los recursos compartidos, las armas nucleares, las purgas y las transformaciones profundas de los sistemas. Su ingreso a Acuario (2023–2024, definitivo hasta 2043) se lee como el inicio de una era de poder tecnológico y colectivo.",
    ],
    related: ["urano", "neptuno"],
  },
];
