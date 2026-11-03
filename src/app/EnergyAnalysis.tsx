"use client";

import { useEffect, useState } from "react";

type Pt = {
  date: string;
  tension: number; flow: number; concentration: number;
  intensity: number; lunarPhase: number;
  retrogrades: string[];
};
type Eclipse  = { date: string; type: "solar" | "lunar"; kind: string };
type Ingress  = { date: string; planet: string; symbol: string; sign: string; signSym: string };
type Landmark = { date: string; sym: string; kind: string; label: string };
type TL = { points: Pt[]; eclipses: Eclipse[]; ingresses: Ingress[]; landmarks: Landmark[] };

const DAY = 86_400_000;
const PERSONAL_RX = ["Mercurio", "Venus", "Marte"];

const fmtDay = (ms: number) =>
  new Date(ms).toLocaleDateString("es-MX", { day: "numeric", month: "short" });

function stats(points: Pt[], from: number, to: number) {
  const sel = points.filter(p => {
    const ms = new Date(p.date).getTime();
    return ms >= from && ms <= to;
  });
  const n = sel.length || 1;
  return {
    t: sel.reduce((a, p) => a + p.tension, 0) / n,
    f: sel.reduce((a, p) => a + p.flow, 0) / n,
    c: sel.reduce((a, p) => a + p.concentration, 0) / n,
    sel,
  };
}

function headlineFor(t: number, f: number, c: number): string {
  if (t > f + c) return t >= 4 ? "Alta tensión" : "Tensión dominante";
  if (f > t + c) return f >= 6 ? "Gran fluidez" : "Fluidez favorable";
  if (c >= 1.5)  return "Energías concentradas";
  return "Cielo equilibrado";
}

function trendWord(next: number, now: number): string {
  const diff = (next - now) / Math.max(now, 0.1);
  if (diff > 0.18)  return "en claro aumento";
  if (diff > 0.06)  return "en ligero aumento";
  if (diff < -0.18) return "en claro descenso";
  if (diff < -0.06) return "en ligero descenso";
  return "estable";
}

// Retrograde starts/ends of personal planets within [from, to]
function rxTransitions(points: Pt[], from: number, to: number) {
  const starts: { planet: string; ms: number }[] = [];
  const ends:   { planet: string; ms: number }[] = [];
  for (let i = 1; i < points.length; i++) {
    const ms = new Date(points[i].date).getTime();
    if (ms < from || ms > to) continue;
    for (const planet of PERSONAL_RX) {
      const was = points[i - 1].retrogrades.includes(planet);
      const is  = points[i].retrogrades.includes(planet);
      if (!was && is)  starts.push({ planet, ms });
      if (was && !is)  ends.push({ planet, ms });
    }
  }
  return { starts, ends };
}

type PanelData = {
  key: string;
  eyebrow: string;
  range: string;
  headline: string;
  lines: string[];
};

function buildPanels(data: TL, todayMs: number): PanelData[] {
  const { points, eclipses, ingresses, landmarks } = data;

  const win = {
    past:    [todayMs - 45 * DAY, todayMs - 7 * DAY] as const,
    present: [todayMs - 7 * DAY,  todayMs + 7 * DAY] as const,
    future:  [todayMs + 7 * DAY,  todayMs + 60 * DAY] as const,
  };
  const sPast = stats(points, ...win.past);
  const sNow  = stats(points, ...win.present);
  const sNext = stats(points, ...win.future);

  const inWin = <T extends { date: string }>(items: T[], [a, b]: readonly [number, number]) =>
    items.filter(it => {
      const ms = new Date(it.date).getTime();
      return ms >= a && ms <= b;
    });

  const eventLines = (range: readonly [number, number], tense: "past" | "future"): string[] => {
    const out: string[] = [];
    for (const ec of inWin(eclipses, range)) {
      const ms = new Date(ec.date).getTime();
      out.push(ec.type === "solar"
        ? `☀ Eclipse Solar ${ec.kind === "total" ? "Total" : "Anular"} (${fmtDay(ms)}) — ${tense === "future" ? "portal de inicios con consecuencias duraderas" : "dejó sembrado un ciclo nuevo"}.`
        : `☽ Eclipse Lunar (${fmtDay(ms)}) — ${tense === "future" ? "culminación y cierre emocional a la vista" : "cerró un ciclo emocional"}.`);
    }
    for (const lm of inWin(landmarks, range)) {
      out.push(`${lm.sym} ${lm.label} (${fmtDay(new Date(lm.date).getTime())}) — hito de los ciclos lentos.`);
    }
    for (const ig of inWin(ingresses, range)) {
      out.push(`${ig.symbol}→${ig.signSym} ${ig.planet} ${tense === "future" ? "entrará en" : "entró en"} ${ig.sign} (${fmtDay(new Date(ig.date).getTime())}).`);
    }
    return out;
  };

  const fmtAvg = (s: { t: number; f: number; c: number }) =>
    `Promedio diario: ${s.t.toFixed(1)} de tensión · ${s.f.toFixed(1)} de fluidez · ${s.c.toFixed(1)} conjunciones.`;

  // ── LO QUE FUE ──
  const pastLines = [fmtAvg(sPast)];
  if (sPast.t > sNow.t + 0.4) pastLines.push("Vienes saliendo de un periodo más tenso que el actual — la fricción ya hizo su trabajo.");
  else if (sPast.f > sNow.f + 0.4) pastLines.push("El tramo anterior fluyó con más gracia que el presente; lo construido entonces es la base de ahora.");
  else pastLines.push("Un tramo sin extremos: las energías recientes fueron similares a las de hoy.");
  const rxPast = rxTransitions(points, ...win.past);
  rxPast.ends.forEach(({ planet, ms }) => pastLines.push(`${planet} salió de retrógrado el ${fmtDay(ms)} — lo revisado en ese periodo ya puede avanzar.`));
  pastLines.push(...eventLines(win.past, "past"));

  // ── LO QUE ES ──
  const nowPt = sNow.sel.length
    ? sNow.sel.reduce((best, p) =>
        Math.abs(new Date(p.date).getTime() - todayMs) < Math.abs(new Date(best.date).getTime() - todayMs) ? p : best)
    : null;
  const nowLines = [fmtAvg(sNow)];
  if (nowPt) {
    if (nowPt.retrogrades.length > 0) {
      const personals = nowPt.retrogrades.filter(r => PERSONAL_RX.includes(r));
      const slow = nowPt.retrogrades.filter(r => !PERSONAL_RX.includes(r) && r !== "Sol" && r !== "Luna");
      if (personals.length) nowLines.push(`℞ activo en ${personals.join(" y ")}: periodo de revisión en lo que estos planetas rigen.`);
      if (slow.length) nowLines.push(`De fondo, ${slow.join(", ")} también retrógrados — ritmo normal de los lentos.`);
    } else {
      nowLines.push("Ningún planeta retrógrado: todos los motores hacia adelante.");
    }
  }
  nowLines.push(...eventLines(win.present, "past"));

  // ── LO QUE VIENE ──
  const nextLines = [fmtAvg(sNext)];
  const tTrend = trendWord(sNext.t, sNow.t);
  const fTrend = trendWord(sNext.f, sNow.f);
  if (tTrend !== "estable" || fTrend !== "estable") {
    nextLines.push(`La tensión viene ${tTrend}; la fluidez, ${fTrend}.`);
  } else {
    nextLines.push("Sin giros bruscos a la vista: el clima celeste se mantiene.");
  }
  const rxNext = rxTransitions(points, ...win.future);
  rxNext.starts.forEach(({ planet, ms }) => nextLines.push(`${planet} entra en retrógrado el ${fmtDay(ms)} — agenda la revisión, no el lanzamiento.`));
  rxNext.ends.forEach(({ planet, ms }) => nextLines.push(`${planet} retoma movimiento directo el ${fmtDay(ms)}.`));
  nextLines.push(...eventLines(win.future, "future"));

  return [
    {
      key: "past", eyebrow: "LO QUE FUE", range: "45 → 7 días atrás",
      headline: headlineFor(sPast.t, sPast.f, sPast.c), lines: pastLines,
    },
    {
      key: "now", eyebrow: "LO QUE ES", range: "esta quincena",
      headline: headlineFor(sNow.t, sNow.f, sNow.c), lines: nowLines,
    },
    {
      key: "future", eyebrow: "LO QUE VIENE", range: "próximos 60 días",
      headline: headlineFor(sNext.t, sNext.f, sNext.c), lines: nextLines,
    },
  ];
}

export function EnergyAnalysis({ today }: { today: string }) {
  const [data, setData] = useState<TL | null>(null);

  useEffect(() => {
    fetch("/api/timeline?v=5")
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d as TL; })
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;
  const todayMs = new Date(today + "T12:00:00Z").getTime();
  const panels = buildPanels(data, todayMs);

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">ANÁLISIS TEMPORAL</span>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 400, fontSize: 28, margin: "10px 0 0", letterSpacing: "-0.02em",
        }}>
          Las energías: lo que fue, lo que es, lo que viene
        </h2>
      </div>
      <div className="energyPanels">
        {panels.map(p => (
          <article className="panel energyPanel" key={p.key}>
            <div className="panelTop">
              <span className="eyebrow">{p.eyebrow}</span>
              <span className="energyRange">{p.range}</span>
            </div>
            <h3 className="energyHeadline">{p.headline}</h3>
            <div className="energyLines">
              {p.lines.map((l, i) => <p key={i}>{l}</p>)}
            </div>
          </article>
        ))}
      </div>
      <p className="energyDisclaimer">
        Promedios calculados sobre los conteos diarios de aspectos de la línea de tiempo.
        Las lecturas son convenciones astrológicas interpretativas, no predicciones.
      </p>
    </div>
  );
}
