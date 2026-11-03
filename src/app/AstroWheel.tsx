type Planet = { name: string; symbol: string; longitude: number; speed?: number; retrograde?: boolean };
type Aspect  = { first: string; second: string; name: string; kind: string; orb: number };

const SIGNS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const S = 500, C = S / 2;

const BEZEL   = 242;
const BELT_O  = 238;
const BELT_I  = 222;
const TICK_O  = 221;
const PLANET  = 192;
const SYM     = 207;
const LINE    = 175;
const ASC_TIP = 215;
const ASC_CWT = 28;
const MC_TIP  = 196;
const MC_CWT  = 22;
const CTR     = 42;
const MOON_R  = 13;
const MOON_CY = C - 70;

function xy(lon: number, r: number): [number, number] {
  const a = ((lon - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

function moonPhasePath(phase: number, cx: number, cy: number, r: number): string {
  const p = ((phase % 360) + 360) % 360;
  const termRx = Math.abs(Math.cos(p * Math.PI / 180)) * r;
  const topY = cy - r, botY = cy + r;
  if (p < 180) {
    const sweepTerm = p <= 90 ? 0 : 1;
    return `M ${cx} ${topY} A ${r} ${r} 0 0 1 ${cx} ${botY} A ${termRx.toFixed(2)} ${r} 0 0 ${sweepTerm} ${cx} ${topY} Z`;
  } else {
    const sweepTerm = p <= 270 ? 0 : 1;
    return `M ${cx} ${topY} A ${r} ${r} 0 0 0 ${cx} ${botY} A ${termRx.toFixed(2)} ${r} 0 0 ${sweepTerm} ${cx} ${topY} Z`;
  }
}

export function AstroWheel({
  planets, aspects, ascendant, midheaven, time, moon,
}: {
  planets: Planet[];
  aspects: Aspect[];
  ascendant?: { longitude: number };
  midheaven?: { longitude: number };
  time?: string;
  moon?: { phase: number; name: string; illumination: number };
}) {
  const map = new Map(planets.map(p => [p.name, p]));
  const hhmm    = time ? time.slice(11, 19) : "––:––:––";
  const dateStr = time
    ? new Date(time).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
    : "";

  const ascTip = ascendant ? xy(ascendant.longitude, ASC_TIP) : null;
  const ascCwt = ascendant ? xy((ascendant.longitude + 180) % 360, ASC_CWT) : null;
  const mcTip  = midheaven  ? xy(midheaven.longitude,  MC_TIP)  : null;
  const mcCwt  = midheaven  ? xy((midheaven.longitude  + 180) % 360, MC_CWT)  : null;

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="astroWheel" aria-hidden="true">

      {/* Dial face */}
      <circle cx={C} cy={C} r={BELT_I - 1} fill="#f7f3ea" />

      {/* Zodiac belt */}
      <circle cx={C} cy={C} r={BELT_O} fill="#e8e3d8" stroke="var(--line)" strokeWidth="1" />
      <circle cx={C} cy={C} r={BELT_I} fill="none"    stroke="var(--line)" strokeWidth="0.5" />

      {/* Chapter-ring ticks */}
      {Array.from({ length: 36 }, (_, i) => {
        const major = i % 3 === 0;
        const inner = major ? TICK_O - 12 : TICK_O - 6;
        const [x1, y1] = xy(i * 10, TICK_O);
        const [x2, y2] = xy(i * 10, inner);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={major ? "#9a9790" : "var(--line)"}
          strokeWidth={major ? 1 : 0.5} />;
      })}

      {/* Zodiac sign glyphs */}
      {SIGNS.map((g, i) => {
        const [gx, gy] = xy(i * 30 + 15, (BELT_I + BELT_O) / 2);
        return <text key={i} x={gx} y={gy}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fill="#8a8680" fontFamily="serif">{g}</text>;
      })}

      {/* Outer bezel */}
      <circle cx={C} cy={C} r={BEZEL} fill="none" stroke="#c8c3b8" strokeWidth="1.5" />

      {/* Orbit guide */}
      <circle cx={C} cy={C} r={LINE + 1} fill="none" stroke="var(--line)"
        strokeWidth="0.4" strokeDasharray="1 6" />

      {/* Flowing aspect lines */}
      {aspects.map((a, i) => {
        const p1 = map.get(a.first), p2 = map.get(a.second);
        if (!p1 || !p2) return null;
        const [x1, y1] = xy(p1.longitude, LINE);
        const [x2, y2] = xy(p2.longitude, LINE);
        const color = a.kind === "tensión" ? "var(--rust)" : a.kind === "fluidez" ? "var(--sage)" : "var(--gold)";
        const dur   = a.kind === "tensión" ? 0.7 : a.kind === "fluidez" ? 1.9 : 1.1;
        const op    = 0.14 + (1 - a.orb / 5) * 0.58;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth="1.2" strokeOpacity={op} strokeDasharray="5 5"
            style={{ animationName: "energyFlow", animationDuration: `${dur}s`,
              animationTimingFunction: "linear", animationIterationCount: "infinite",
              animationDelay: `${-(i * 0.25)}s` }} />
        );
      })}

      {/* MC hand */}
      {mcTip && mcCwt && (
        <line x1={mcCwt[0]} y1={mcCwt[1]} x2={mcTip[0]} y2={mcTip[1]}
          stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.7" strokeDasharray="4 3" />
      )}

      {/* ASC hand */}
      {ascTip && ascCwt && (
        <line x1={ascCwt[0]} y1={ascCwt[1]} x2={ascTip[0]} y2={ascTip[1]}
          stroke="var(--rust)" strokeWidth="1.5" strokeOpacity="0.85" />
      )}

      {/* Planet dots + symbols + Rx markers */}
      {planets.map(p => {
        const [px, py] = xy(p.longitude, PLANET);
        const [sx, sy] = xy(p.longitude, SYM);
        const spd  = p.speed ?? 1;
        const dotR = Math.min(7, Math.max(2.5, 4 + Math.max(0, 2.5 - Math.abs(spd)) * 0.9));
        const isRx = p.retrograde ?? false;
        return (
          <g key={p.name}>
            <circle cx={px} cy={py} r={dotR} fill="var(--ink)"
              fillOpacity={isRx ? "0.5" : "0.75"} />
            <text x={sx} y={sy}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="11" fill={isRx ? "var(--gold)" : "var(--rust)"}
              fontFamily="serif">{p.symbol}</text>
            {isRx && (
              <text x={sx + 9} y={sy - 7}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="7" fill="var(--gold)" fontFamily="serif"
                fillOpacity="0.9">℞</text>
            )}
          </g>
        );
      })}

      {/* Moon phase complication */}
      {moon && (
        <g>
          <circle cx={C} cy={MOON_CY} r={MOON_R + 2} fill="#e8e3d8" stroke="var(--line)" strokeWidth="0.5" />
          <circle cx={C} cy={MOON_CY} r={MOON_R} fill="#3a3530" />
          <path d={moonPhasePath(moon.phase, C, MOON_CY, MOON_R)} fill="#f0ece2" />
          <circle cx={C} cy={MOON_CY} r={MOON_R} fill="none" stroke="#9a9790" strokeWidth="0.6" />
          <text x={C} y={MOON_CY + MOON_R + 9}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="6.5" fill="var(--muted)" fontFamily="'DM Sans', sans-serif"
            letterSpacing="0.04em">{moon.illumination}%</text>
          <text x={C} y={MOON_CY + MOON_R + 17}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="5.5" fill="var(--muted)" fontFamily="'DM Sans', sans-serif"
            letterSpacing="0.06em">{moon.name.toUpperCase()}</text>
        </g>
      )}

      {/* Center subdial */}
      <circle cx={C} cy={C} r={CTR} fill="#f0ece2" stroke="var(--line)" strokeWidth="1" />
      <circle cx={C} cy={C} r={4} fill="var(--ink)" />

      <text x={C} y={C - 9}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="14.5" fontWeight="500" letterSpacing="0.05em"
        fill="var(--ink)" fontFamily="'DM Sans', sans-serif">{hhmm}</text>
      <text x={C} y={C + 11}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="7.5" letterSpacing="0.12em"
        fill="var(--muted)" fontFamily="'DM Sans', sans-serif">{dateStr}</text>
    </svg>
  );
}
